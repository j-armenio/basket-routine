import i18n from '@/i18n/i18n';
import { categoryCards, exerciseCount, groupByCategory, isCategoryKey } from './catalogList';

const { t } = i18n;

const ex = (name: string, category: 'finishing' | 'dribbling' | 'shooting' | 'footwork') => ({
  name,
  category,
});

describe('groupByCategory', () => {
  test('groups by category in the catalog order and keeps each list in order', () => {
    const sections = groupByCategory(t, [
      ex('Free Throws', 'shooting'),
      ex('Crossover', 'dribbling'),
      ex('Layups', 'finishing'),
      ex('Catch and Shoot', 'shooting'),
    ]);

    expect(sections.map((s) => s.title)).toEqual(['Finishing', 'Dribbling', 'Shooting']);
    expect(sections[2].data.map((e) => e.name)).toEqual(['Free Throws', 'Catch and Shoot']);
  });

  test('leaves out empty categories, and gives nothing for no exercises', () => {
    expect(groupByCategory(t, [ex('Zig Zag', 'footwork')]).map((s) => s.title)).toEqual([
      'Footwork',
    ]);
    expect(groupByCategory(t, [])).toEqual([]);
  });
});

describe('the category cards', () => {
  const item = (category: 'finishing' | 'shooting' | 'footwork', isCustom = false) => ({
    category,
    isCustom,
  });

  test('one card per category in the catalog order, then Custom, with their counts', () => {
    const cards = categoryCards(t, [
      item('shooting'),
      item('shooting', true),
      item('finishing'),
      item('footwork', true),
    ]);

    expect(cards).toEqual([
      { key: 'finishing', label: 'Finishing', count: 1 },
      { key: 'ball_handling', label: 'Ball Handling', count: 0 },
      { key: 'dribbling', label: 'Dribbling', count: 0 },
      // a custom exercise counts in its category and in Custom
      { key: 'shooting', label: 'Shooting', count: 2 },
      { key: 'footwork', label: 'Footwork', count: 1 },
      { key: 'custom', label: 'Custom', count: 2 },
    ]);
  });

  test('no exercises: every card is still there, empty', () => {
    expect(categoryCards(t, []).map((card) => card.count)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  test('a route key is a category or custom', () => {
    expect(isCategoryKey('ball_handling')).toBe(true);
    expect(isCategoryKey('custom')).toBe(true);
    expect(isCategoryKey('Shooting')).toBe(false);
    expect(isCategoryKey(undefined)).toBe(false);
  });

  test('the count reads naturally', () => {
    expect(exerciseCount(t, 0)).toBe('0 exercises');
    expect(exerciseCount(t, 1)).toBe('1 exercise');
    expect(exerciseCount(t, 8)).toBe('8 exercises');
  });
});
