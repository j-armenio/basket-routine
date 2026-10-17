import { useColors } from '@/theme/ThemeContext';
import { create } from 'qrcode/lib/core/qrcode';
import { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

/** Modules of white around the code, which a camera needs to find it. */
const QUIET_ZONE = 4;

type QrCodeProps = {
  value: string;
  size: number;
  accessibilityLabel: string;
};

/**
 * `value` as a QR code, drawn with plain SVG: dark squares on a light ground whatever the theme
 * (`qrForeground` / `qrBackground`), as a camera reads it that way. Error correction `L`, since the
 * code is read off a screen and a smaller grid scans better.
 */
export function QrCode({ value, size, accessibilityLabel }: QrCodeProps) {
  const colors = useColors();
  const { count, path } = useMemo(() => {
    const { modules } = create(value, { errorCorrectionLevel: 'L' });
    const n: number = modules.size;
    let d = '';
    for (let row = 0; row < n; row += 1) {
      // One rectangle per run of dark modules in the row: a shorter path, with fewer seams.
      for (let col = 0; col < n; col += 1) {
        if (!modules.get(row, col)) continue;
        let end = col + 1;
        while (end < n && modules.get(row, end)) end += 1;
        d += `M${col + QUIET_ZONE} ${row + QUIET_ZONE}h${end - col}v1h-${end - col}z`;
        col = end;
      }
    }
    return { count: n, path: d };
  }, [value]);
  const side = count + QUIET_ZONE * 2;
  // A whole number of dp per module, so the squares meet without hairlines.
  const drawn = Math.max(side, Math.floor(size / side) * side);

  return (
    <Svg
      width={drawn}
      height={drawn}
      viewBox={`0 0 ${side} ${side}`}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <Path d={`M0 0h${side}v${side}h-${side}z`} fill={colors.qrBackground} />
      <Path d={path} fill={colors.qrForeground} />
    </Svg>
  );
}
