import { boardElementCounts, type TacticalBoard } from '@/domain/tacticalBoard';
import type { TFunction } from 'i18next';

const PART_KEY = {
  x: 'tactical.markX',
  arrow: 'tactical.markArrow',
  pen: 'tactical.markLine',
} as const;

/** For screen readers: "Tactical board: 3 X marks, 2 arrows, 1 line". */
export function describeBoard(t: TFunction, board: TacticalBoard): string {
  const counts = boardElementCounts(board);
  const parts = (Object.keys(PART_KEY) as (keyof typeof PART_KEY)[])
    .filter((type) => counts[type] > 0)
    .map((type) => t(PART_KEY[type], { count: counts[type] }));
  return parts.length === 0
    ? t('tactical.empty')
    : t('tactical.summary', { parts: parts.join(', ') });
}
