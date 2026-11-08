import { describe, expect, it } from 'vitest';
import { daysLabel, daysToMax, pointsForHearts } from './pets';

describe('pets', () => {
  it('cada coração vale 200 pontos, até 5', () => {
    expect(pointsForHearts(0)).toBe(0);
    expect(pointsForHearts(3)).toBe(600);
    expect(pointsForHearts(9)).toBe(1000);
  });

  it('do zero: 84 dias só com carinho, 56 com tigela também', () => {
    expect(daysToMax(0, false)).toBe(84);
    expect(daysToMax(0, true)).toBe(56);
    expect(daysToMax(5, true)).toBe(0);
    expect(daysToMax(4, false)).toBe(17); // 200 / 12
  });

  it('escreve os dias em estações', () => {
    expect(daysLabel(56)).toBe('56 dias (2 estações)');
    expect(daysLabel(17)).toBe('17 dias');
    expect(daysLabel(30)).toBe('30 dias (1 estação e 2 dias)');
    expect(daysLabel(0)).toBe('já está no máximo');
  });
});
