import { CATEGORIES, type Category } from '@/domain/types';
import type { TFunction } from 'i18next';

export interface CategorySection<T> {
  title: string;
  data: T[];
}

/** The exercises by category, in `CATEGORIES` order, each section keeping their order. Empty categories are left out. */
export function groupByCategory<T extends { category: Category }>(
  t: TFunction,
  exercises: readonly T[],
): CategorySection<T>[] {
  return CATEGORIES.map((category) => ({
    title: t(`labels.category.${category}`),
    data: exercises.filter((exercise) => exercise.category === category),
  })).filter((section) => section.data.length > 0);
}

/** A card of the Exercises tab: one category, or `custom` (the user's own exercises, any category). */
export type CategoryKey = Category | 'custom';

/** The cards in their order: the categories, then Custom. */
export const CATEGORY_KEYS: readonly CategoryKey[] = [...CATEGORIES, 'custom'];

export const isCategoryKey = (value: unknown): value is CategoryKey =>
  CATEGORY_KEYS.includes(value as CategoryKey);

export const categoryKeyLabel = (t: TFunction, key: CategoryKey) =>
  key === 'custom' ? t('labels.category.custom') : t(`labels.category.${key}`);

/** "1 exercise", "8 exercises". */
export const exerciseCount = (t: TFunction, count: number) =>
  t('exercises.exerciseCount', { count });

export interface CategoryCardData {
  key: CategoryKey;
  label: string;
  count: number;
}

/** The six cards with how many exercises each opens. An empty one is kept: its list says so. */
export function categoryCards(
  t: TFunction,
  exercises: readonly { category: Category; isCustom: boolean }[],
): CategoryCardData[] {
  return CATEGORY_KEYS.map((key) => ({
    key,
    label: categoryKeyLabel(t, key),
    count: exercises.filter((exercise) =>
      key === 'custom' ? exercise.isCustom : exercise.category === key,
    ).length,
  }));
}
