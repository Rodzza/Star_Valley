import { describe, expect, it } from 'vitest';
import { BUILDINGS } from './buildings';
import { filterBuildings, materialsText } from '../screens/Buildings';
import { itemLabel } from '../utils/items';

describe('construções', () => {
  it('ids únicos e materiais todos traduzidos', () => {
    expect(new Set(BUILDINGS.map((b) => b.id)).size).toBe(BUILDINGS.length);
    for (const b of BUILDINGS) for (const m of b.materials) if (!['Coral', 'Banana'].includes(m.item)) expect(itemLabel(m.item)).not.toBe(m.item);
  });
  it('mostra materiais e filtra', () => {
    expect(materialsText(BUILDINGS.find((b) => b.id === 'well')!)).toBe('Pedra ×75');
    expect(filterBuildings(BUILDINGS, 'magia', '', new Set()).every((b) => b.builder === 'wizard')).toBe(true);
    expect(filterBuildings(BUILDINGS, 'all', 'galinheiro', new Set())).toHaveLength(3);
  });
});
