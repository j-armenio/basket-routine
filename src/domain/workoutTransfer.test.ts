import type { TacticalBoard } from './tacticalBoard';
import {
  decodeTransfer,
  encodeTransfer,
  MAX_QR_LINK_LENGTH,
  parseWorkoutTransfer,
  parseWorkoutTransferText,
  qrLink,
  readQrLink,
  toWorkoutTransfer,
  TRANSFER_LINK_PREFIX,
  type TransferSource,
  type WorkoutTransfer,
} from './workoutTransfer';

const board: TacticalBoard = {
  version: 1,
  elements: [
    { type: 'x', at: [0.123456, 0.654321] },
    { type: 'arrow', from: [0.1, 0.2], to: [0.5, 0.6], via: [0.3333333, 0.4] },
    {
      type: 'pen',
      points: [
        [0.1, 0.1],
        [0.2, 0.25],
      ],
    },
  ],
};

const source: TransferSource = {
  name: 'Morning shooting',
  exercises: [
    {
      targetMode: 'makes',
      tacticalBoard: board,
      exercise: {
        seedKey: 'free-throws',
        isCustom: false,
        name: 'Free throws',
        category: 'shooting',
        trackingType: 'makes_attempts',
        description: '',
      },
      sets: [{ targetValue: 5 }, { targetValue: 10 }],
    },
    {
      targetMode: null,
      tacticalBoard: null,
      exercise: {
        seedKey: null,
        isCustom: true,
        name: 'My drill',
        category: 'footwork',
        trackingType: 'check',
        description: 'Slide and close out',
      },
      sets: [{ targetValue: null }],
    },
  ],
};

const transfer = (): WorkoutTransfer => toWorkoutTransfer(source);

describe('toWorkoutTransfer', () => {
  it('sends a predefined exercise by its seedKey and a custom one in full', () => {
    const { exercises } = transfer();
    expect(exercises[0].exercise).toEqual({ seedKey: 'free-throws' });
    expect(exercises[1].exercise).toEqual({
      custom: {
        name: 'My drill',
        category: 'footwork',
        trackingType: 'check',
        description: 'Slide and close out',
      },
    });
  });

  it('rounds the board points to three decimals', () => {
    const sent = transfer().exercises[0].board;
    expect(sent?.elements[0]).toEqual({ type: 'x', at: [0.123, 0.654] });
    expect(sent?.elements[1]).toMatchObject({ via: [0.333, 0.4] });
  });
});

describe('encode and decode', () => {
  it('gives back what was encoded', () => {
    const result = decodeTransfer(encodeTransfer(transfer()));
    expect(result).toEqual({ ok: true, transfer: transfer() });
  });

  it('only uses characters that are safe in a link', () => {
    expect(encodeTransfer(transfer())).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('refuses text that is not an encoded transfer', () => {
    expect(decodeTransfer('not a transfer!')).toEqual({ ok: false, reason: 'invalid_transfer' });
    expect(decodeTransfer('AAAA')).toEqual({ ok: false, reason: 'invalid_transfer' });
  });
});

describe('parseWorkoutTransfer', () => {
  it('accepts a good transfer and trims the names', () => {
    const result = parseWorkoutTransfer({ ...transfer(), name: '  Morning  ' });
    expect(result.ok && result.transfer.name).toBe('Morning');
  });

  it.each([
    ['another format', { ...transfer(), format: 'something-else' }],
    ['a blank name', { ...transfer(), name: ' ' }],
    ['no exercises', { ...transfer(), exercises: [] }],
    [
      'a target of 0',
      {
        ...transfer(),
        exercises: [{ ...transfer().exercises[0], targets: [0] }],
      },
    ],
    [
      'a target mode on a check exercise',
      {
        ...transfer(),
        exercises: [{ ...transfer().exercises[1], targetMode: 'makes' }],
      },
    ],
    [
      'no target mode on a custom shooting exercise',
      {
        ...transfer(),
        exercises: [
          {
            exercise: {
              custom: { name: 'A', category: 'shooting', trackingType: 'makes_attempts' },
            },
            targetMode: null,
            targets: [5],
            board: null,
          },
        ],
      },
    ],
    [
      'an empty board',
      {
        ...transfer(),
        exercises: [{ ...transfer().exercises[0], board: { version: 1, elements: [] } }],
      },
    ],
  ])('refuses %s', (_name, value) => {
    expect(parseWorkoutTransfer(value)).toEqual({ ok: false, reason: 'invalid_transfer' });
  });

  it('tells a newer version apart from a broken file', () => {
    expect(parseWorkoutTransfer({ ...transfer(), version: 2 })).toEqual({
      ok: false,
      reason: 'transfer_newer_version',
    });
  });

  it('refuses text that is not JSON', () => {
    expect(parseWorkoutTransferText('{oops')).toEqual({ ok: false, reason: 'invalid_transfer' });
  });
});

describe('qrLink', () => {
  it('builds a link for a small workout and reads it back', () => {
    const link = qrLink(transfer());
    expect(link?.startsWith(TRANSFER_LINK_PREFIX)).toBe(true);
    const encoded = readQrLink(link ?? '');
    expect(encoded && decodeTransfer(encoded)).toEqual({ ok: true, transfer: transfer() });
  });

  it('gives no link when the workout is too big for a QR code', () => {
    const points = Array.from({ length: 200 }, (_, i): [number, number] => [
      (i % 97) / 100,
      ((i * 7) % 89) / 100,
    ]);
    const big: WorkoutTransfer = {
      ...transfer(),
      exercises: [
        {
          ...transfer().exercises[0],
          board: { version: 1, elements: [{ type: 'pen', points }] },
        },
        {
          ...transfer().exercises[0],
          board: { version: 1, elements: [{ type: 'pen', points: [...points].reverse() }] },
        },
      ],
    };
    expect(encodeTransfer(big).length + TRANSFER_LINK_PREFIX.length).toBeGreaterThan(
      MAX_QR_LINK_LENGTH,
    );
    expect(qrLink(big)).toBeNull();
  });

  it('ignores a link that is not ours', () => {
    expect(readQrLink('https://example.com')).toBeNull();
  });
});
