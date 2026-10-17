import { Asset } from 'expo-asset';
import { createVideoPlayer, type VideoThumbnail } from 'expo-video';
import { useEffect, useState } from 'react';

// A video's first frame, for the still thumbnail. Generating one opens a player, so each source is
// done once per app run and kept in memory (a few dozen small images at most).
const cache = new Map<number | string, Promise<VideoThumbnail | null>>();

/**
 * expo-video reads a file's frames from its path by only stripping `file://`, without decoding the
 * URI. expo-file-system hands out encoded URIs, and in Expo Go the app's folder has a `%` in its name
 * (`%2540jarmenio…` in the URI), so the path must be decoded first or the file isn't found.
 */
export function thumbnailSource(source: number | string): number | string {
  if (typeof source !== 'string' || !source.startsWith('file://')) return source;
  try {
    return `file://${decodeURIComponent(source.slice('file://'.length))}`;
  } catch {
    return source;
  }
}

/**
 * A bundled video (a `require` number) as a local file. In a release build the asset is a raw
 * resource name with no scheme: expo-video can play it, but its frame reader only takes a file, a
 * content or a remote URI, so the first frame could never be made. `expo-asset` copies it into the
 * cache (in dev, it downloads Metro's URL) and hands back that file's URI.
 */
async function framesSource(source: number | string): Promise<number | string> {
  if (typeof source === 'string') return thumbnailSource(source);
  const [asset] = await Asset.loadAsync(source);
  if (!asset?.localUri) throw new Error('Bundled video has no local file');
  return thumbnailSource(asset.localUri);
}

export function loadThumbnail(source: number | string): Promise<VideoThumbnail | null> {
  let pending = cache.get(source);
  if (!pending) {
    pending = (async () => {
      let player: ReturnType<typeof createVideoPlayer> | undefined;
      try {
        player = createVideoPlayer(await framesSource(source));
        const [thumbnail] = await player.generateThumbnailsAsync(0);
        return thumbnail ?? null;
      } catch {
        return null;
      } finally {
        player?.release();
      }
    })();
    cache.set(source, pending);
  }
  return pending;
}

/**
 * The first frame of a video: `undefined` while it loads (or with no source, for media that isn't a
 * video), `null` when it can't be made.
 */
export function useVideoThumbnail(
  source: number | string | undefined,
): VideoThumbnail | null | undefined {
  const [loaded, setLoaded] = useState<{
    source: number | string;
    thumbnail: VideoThumbnail | null;
  }>();

  useEffect(() => {
    if (source === undefined) return;
    let live = true;
    loadThumbnail(source).then((thumbnail) => {
      if (live) setLoaded({ source, thumbnail });
    });
    return () => {
      live = false;
    };
  }, [source]);

  return source !== undefined && loaded?.source === source ? loaded.thumbnail : undefined;
}
