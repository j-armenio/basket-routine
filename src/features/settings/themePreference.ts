import type { ThemePreference } from '@/theme/scheme';
import { useSyncExternalStore } from 'react';
import { readThemePreference } from './themeStorage';

// The preference isn't DB data, so it doesn't go through the data store: a small store of its own,
// so the root re-renders on a switch and not on every write to the database.
let current: ThemePreference = readThemePreference();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Re-reads the stored preference and tells the subscribers if it changed. */
export function refreshThemePreference(): void {
  const next = readThemePreference();
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener());
}

export function getThemePreference(): ThemePreference {
  return current;
}

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribe, getThemePreference, getThemePreference);
}
