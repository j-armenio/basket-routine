import en from './en';
import ptBR from './pt-BR';

/** Every leaf key path, dot-joined, sorted. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value)
    .flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe('translation parity', () => {
  it('en and pt-BR have the exact same keys', () => {
    expect(keyPaths(ptBR)).toEqual(keyPaths(en));
  });
});
