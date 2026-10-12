import { StyleSheet } from 'react-native';
import type { Palette } from './colors';
import { useColors } from './ThemeContext';

/** A stylesheet that depends on the palette: `const useStyles = makeStyles((colors) => ({ ... }))`,
 *  then `const styles = useStyles()` in the component. `StyleSheet.create` runs once per palette
 *  (cached), so switching the theme restyles the app without rebuilding styles on every render. */
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: Palette) => T & StyleSheet.NamedStyles<any>,
): () => T {
  const cache = new WeakMap<Palette, T>();

  return function useStyles() {
    const colors = useColors();
    let styles = cache.get(colors);
    if (!styles) {
      styles = StyleSheet.create(factory(colors));
      cache.set(colors, styles);
    }
    return styles;
  };
}
