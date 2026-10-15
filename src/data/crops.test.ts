import { describe, expect, it } from 'vitest';
import data from './crops.json';
import type { Crop } from '../utils/crops';

const crops = data.crops as Crop[];

describe('crops.json (gerado do export da wiki)', () => {
  it('tem culturas e nomes únicos', () => {
    expect(crops.length).toBeGreaterThan(20);
    expect(new Set(crops.map((c) => c.name)).size).toBe(crops.length);
  });

  it('todas têm valores plausíveis e a página de origem (exigência da licença)', () => {
    for (const c of crops) {
      expect(c.seasons.length, c.name).toBeGreaterThan(0);
      expect(c.growthDays, c.name).toBeGreaterThan(0);
      expect(c.growthDays, c.name).toBeLessThanOrEqual(28);
      expect(c.seedPrice, c.name).toBeGreaterThan(0);
      expect(c.sellPrice, c.name).toBeGreaterThan(0);
      expect(c.source?.url, c.name).toMatch(/^https:\/\/stardewvalley\.fandom\.com\/wiki\//);
      expect(c.source?.historyUrl, c.name).toContain('action=history');
    }
  });

  it('carrega a nota de licença', () => {
    expect(data._licenca).toContain('CC BY-SA');
  });
});
