import { describe, expect, it } from 'vitest';
import { planCrop, plantableCrops, type Crop } from './crops';

const quick: Crop = { name: 'Quick', seasons: ['spring'], growthDays: 4, seedPrice: 20, sellPrice: 35 };
const slow: Crop = { name: 'Slow', seasons: ['spring'], growthDays: 12, seedPrice: 80, sellPrice: 175 };
const regrow: Crop = {
  name: 'Regrow',
  seasons: ['summer'],
  growthDays: 13,
  regrowDays: 4,
  seedPrice: 80,
  sellPrice: 50,
  yieldPerHarvest: 3,
};

describe('planejador de plantio', () => {
  it('colhe no dia plantio + dias de crescimento', () => {
    const p = planCrop(quick, 1);
    expect(p?.firstHarvestDay).toBe(5);
    expect(p?.profit).toBe(15);
    expect(p?.goldPerDay).toBeCloseTo(3.75);
  });

  it('aceita a colheita exatamente no dia 28 e recusa no 29', () => {
    expect(planCrop(slow, 16)?.firstHarvestDay).toBe(28);
    expect(planCrop(slow, 17)).toBeNull();
  });

  it('conta as colheitas de culturas que rebrotam', () => {
    const p = planCrop(regrow, 1);
    expect(p?.firstHarvestDay).toBe(14);
    expect(p?.harvests).toBe(4); // dias 14, 18, 22, 26
    expect(p?.lastHarvestDay).toBe(26);
    expect(p?.profit).toBe(4 * 50 * 3 - 80);
  });

  it('rejeita dia inválido', () => {
    expect(planCrop(quick, 0)).toBeNull();
    expect(planCrop(quick, 29)).toBeNull();
    expect(planCrop(quick, 1.5)).toBeNull();
  });

  it('filtra pela estação e ordena por ouro por dia', () => {
    const list = plantableCrops([slow, quick, regrow], 'spring', 1);
    expect(list.map((p) => p.crop.name)).toEqual(['Slow', 'Quick']);
  });

  it('não há culturas externas no inverno', () => {
    expect(plantableCrops([quick], 'winter', 1)).toEqual([]);
  });
});
