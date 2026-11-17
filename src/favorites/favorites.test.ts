import { describe, expect, it } from 'vitest';
import { parseFavorites, toggleIn } from './favorites';

describe('favoritos', () => {
  it('liga e desliga', () => {
    expect(toggleIn(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleIn(['a', 'b'], 'a')).toEqual(['b']);
  });
  it('ignora funções que não existem e lixo', () => {
    expect(parseFavorites(JSON.stringify({ features: ['recipes', 'naoexiste'], villagers: ['Abigail', 3] }))).toEqual({
      features: ['recipes'],
      villagers: ['Abigail'],
    });
    expect(parseFavorites('x')).toEqual({ features: [], villagers: [] });
  });
});
