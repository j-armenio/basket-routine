#!/usr/bin/env bash
# Turns exercise GIFs and videos into small vertical MP4s.
#
# Usage: scripts/optimize-exercise-media.sh [--force] [input-dir] [output-dir]
#   defaults: input media-source/, output media-source/optimized/
#
# For every *.gif, *.mp4, *.mov, *.webm in <input-dir> it
#   1. detects and crops the black bars (the largest content box over the whole clip),
#   2. scales to 480 px tall (270 wide for 9:16), 15 fps, H.264, no audio, faststart,
# and writes <same-name>.mp4. An existing output is skipped unless --force is given.
# Needs ffmpeg (brew install ffmpeg). It does not touch assets/exercises/ or seedMedia.ts: the
# optimized files are matched to exercises (and renamed to their seedKey) afterwards.

set -euo pipefail

HEIGHT=480
FPS=15
CRF=26
WARN_KB=300

force=0
if [[ "${1:-}" == "--force" ]]; then
  force=1
  shift
fi

if [[ $# -gt 2 ]]; then
  echo "Usage: $0 [--force] [input-dir] [output-dir]" >&2
  exit 1
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
input_dir="${1:-$root/media-source}"
output_dir="${2:-$input_dir/optimized}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install it first (brew install ffmpeg)." >&2
  exit 1
fi
if [[ ! -d "$input_dir" ]]; then
  echo "Input folder not found: $input_dir" >&2
  exit 1
fi
if [[ "$(cd "$input_dir" && pwd)" == "$(mkdir -p "$output_dir" && cd "$output_dir" && pwd)" ]]; then
  echo "Input and output folders must differ." >&2
  exit 1
fi

size_of() { wc -c <"$1" | tr -d ' '; }

converted=0
skipped=0
failed=0
shopt -s nullglob nocaseglob

found=0
for gif in "$input_dir"/*.{gif,mp4,mov,webm}; do
  found=1
  name="$(basename "$gif")"
  base="${name%.*}"
  out="$output_dir/$base.mp4"

  if [[ -e "$out" && $force -eq 0 ]]; then
    echo "skip   $name (exists, use --force)"
    skipped=$((skipped + 1))
    continue
  fi

  # The last crop= line is the box that holds the content of every frame (reset=0).
  crop="$(ffmpeg -hide_banner -i "$gif" -vf "cropdetect=limit=24:round=2:reset=0" -f null - 2>&1 |
    grep -o 'crop=[0-9]*:[0-9]*:[0-9]*:[0-9]*' | tail -n 1 || true)"

  filters="fps=$FPS,scale=-2:$HEIGHT:flags=lanczos,format=yuv420p"
  [[ -n "$crop" ]] && filters="$crop,$filters"

  tmp="$out.tmp.mp4"
  if ! ffmpeg -hide_banner -loglevel error -y -i "$gif" -vf "$filters" \
    -c:v libx264 -crf "$CRF" -preset slow -movflags +faststart -an "$tmp"; then
    rm -f "$tmp"
    echo "FAIL   $name" >&2
    failed=$((failed + 1))
    continue
  fi
  mv "$tmp" "$out"

  before=$(size_of "$gif")
  after=$(size_of "$out")
  after_kb=$((after / 1024))
  line="ok     $name  $((before / 1024)) KB -> ${after_kb} KB  (${crop:-no crop})"
  if ((after_kb > WARN_KB)); then
    line="$line  WARNING: over ${WARN_KB} KB"
  fi
  echo "$line"
  converted=$((converted + 1))
done

if ((found == 0)); then
  echo "No .gif, .mp4, .mov or .webm files in $input_dir" >&2
  exit 1
fi
echo
echo "Done: $converted converted, $skipped skipped, $failed failed -> $output_dir"
((failed == 0))
