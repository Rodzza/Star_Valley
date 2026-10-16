import { describe, expect, it } from 'vitest';
import data from './crops.json';
import type { Crop } from '../utils/crops';
import { CROP_PT } from '../utils/cropNames';
import { qualityTable } from '../utils/crops';

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

  it('toda cultura tem nome em português', () => {
    for (const c of crops) expect(CROP_PT[c.name], c.name).toBeTruthy();
  });

  it('calcula preço, energia e vida por qualidade como o jogo (conferido em valores conhecidos)', () => {
    // Couve-flor: 175 g, energia 75 -> prata 218 g/105/47, ouro 262 g/135/60, irídio 350 g/195/87
    const t = qualityTable({ sellPrice: 175, energy: 75 });
    expect(t.map((r) => r.sell)).toEqual([175, 218, 262, 350]);
    expect(t.map((r) => r.energy)).toEqual([75, 105, 135, 195]);
    expect(t.map((r) => r.health)).toEqual([33, 47, 60, 87]);
    // Blue Jazz: 45 de energia -> 63 (prata); em ponto flutuante 45 × 1,4 daria 62,99…
    expect(qualityTable({ sellPrice: 50, energy: 45 })[1]?.energy).toBe(63);
  });

  it('sem energia (não comestível) não mostra energia nem vida', () => {
    const r = qualityTable({ sellPrice: 3000 })[3];
    expect(r).toEqual({ quality: 'iridium', sell: 6000 });
  });

  it('preços corrigidos à mão batem com o jogo', () => {
    const by = Object.fromEntries(crops.map((c) => [c.name, c]));
    expect(by['Blueberry']?.sellPrice).toBe(50);
    expect(by['Corn']?.sellPrice).toBe(50);
    expect(by['Fairy Rose']?.sellPrice).toBe(290);
    expect(by['Blue Jazz']?.energy).toBe(45);
  });
});
