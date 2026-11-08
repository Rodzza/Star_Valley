import { describe, expect, it } from 'vitest';
import { MASTERY_COST, SKILLS, XP_TABLE } from './skills';

describe('habilidades', () => {
  it('5 habilidades, 10 níveis cada, com 2 + 4 profissões e maestria', () => {
    expect(SKILLS.map((s) => s.id)).toEqual(['farming', 'mining', 'foraging', 'fishing', 'combat']);
    for (const s of SKILLS) {
      expect(s.unlocks).toHaveLength(10);
      expect(s.level10.flat()).toHaveLength(4);
      expect(s.mastery.rewards.length).toBeGreaterThan(0);
    }
  });
  it('XP total crescente até 15.000 e maestria somando 100.000', () => {
    expect(XP_TABLE.at(-1)).toBe(15000);
    expect(XP_TABLE.every((x, i) => i === 0 || x > XP_TABLE[i - 1]!)).toBe(true);
    expect(MASTERY_COST.reduce((a, b) => a + b, 0)).toBe(100000);
  });
});
