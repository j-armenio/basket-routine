import { emptyBoard, type TacticalBoard } from '@/domain/tacticalBoard';
import i18n from '@/i18n/i18n';
import { describeBoard } from './boardDescription';

const { t } = i18n;

const board = (elements: TacticalBoard['elements']): TacticalBoard => ({ version: 1, elements });

describe('describeBoard', () => {
  test('counts each kind, in the singular or the plural', () => {
    expect(describeBoard(t, emptyBoard())).toBe('Empty tactical board');
    expect(
      describeBoard(
        t,
        board([
          { type: 'x', at: [0.1, 0.1] },
          { type: 'x', at: [0.2, 0.1] },
          { type: 'arrow', from: [0.1, 0.1], to: [0.5, 0.5] },
          {
            type: 'pen',
            points: [
              [0.1, 0.1],
              [0.2, 0.2],
            ],
          },
        ]),
      ),
    ).toBe('Tactical board: 2 X marks, 1 arrow, 1 line');
  });
});
