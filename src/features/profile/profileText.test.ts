import i18n from '@/i18n/i18n';
import { displayName, initialOf, workoutsLogged } from './profileText';

const { t } = i18n;

describe('displayName', () => {
  test('is the name, or "Player" when it is blank', () => {
    expect(displayName(t, 'João')).toBe('João');
    expect(displayName(t, '')).toBe('Player');
    expect(displayName(t, '   ')).toBe('Player');
  });
});

describe('initialOf', () => {
  test("is the name's first letter in capitals, or undefined with no name", () => {
    expect(initialOf('joão')).toBe('J');
    expect(initialOf('  élise ')).toBe('É');
    expect(initialOf('')).toBeUndefined();
    expect(initialOf('  ')).toBeUndefined();
  });

  test('keeps a character made of two code units whole', () => {
    expect(initialOf('🏀 Hoops')).toBe('🏀');
  });
});

describe('workoutsLogged', () => {
  test('says none, one or many', () => {
    expect(workoutsLogged(t, 0)).toBe('No workouts logged yet');
    expect(workoutsLogged(t, 1)).toBe('1 workout logged');
    expect(workoutsLogged(t, 8)).toBe('8 workouts logged');
  });
});
