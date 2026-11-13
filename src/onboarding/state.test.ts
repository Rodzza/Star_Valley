import { describe, expect, it } from 'vitest';
import { FEATURES } from '../features/registry';
import { INTERESTS, shortcutsFor } from './state';

describe('onboarding', () => {
  it('todo interesse aponta para funções que existem', () => {
    for (const i of INTERESTS) for (const f of i.features) expect(FEATURES.some((x) => x.id === f)).toBe(true);
  });
  it('atalhos seguem a ordem escolhida, sem repetir', () => {
    expect(shortcutsFor(['recipes', 'gifts'])).toEqual(['recipes', 'giftFinder', 'villagers']);
    expect(shortcutsFor([])).toEqual([]);
  });
});
