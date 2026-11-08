import { describe, expect, it } from 'vitest';
import { ANIMALS, goldPerDay } from './animals';

describe('animais', () => {
  it('ids únicos', () => expect(new Set(ANIMALS.map((a) => a.id)).size).toBe(ANIMALS.length));
  it('ouro por dia divide pelo intervalo e aplica Artesão', () => {
    const goat = ANIMALS.find((a) => a.id === 'goat')!;
    expect(goldPerDay(goat, false)).toBe(112.5);
    expect(goldPerDay(goat, true)).toBe(200);
    expect(goldPerDay(goat, true, true)).toBeCloseTo(280);
  });
});
