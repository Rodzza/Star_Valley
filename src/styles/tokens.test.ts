import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { TEXT_PAIRS, dark, light } from './tokens';

describe('contraste de texto (WCAG AA 4,5:1)', () => {
  for (const [name, palette] of [
    ['escuro', dark],
    ['claro', light],
  ] as const) {
    for (const [fg, bg] of TEXT_PAIRS) {
      it(`${name}: ${fg} sobre ${bg}`, () => {
        expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('o cálculo bate com valores conhecidos', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 1);
  });
});
