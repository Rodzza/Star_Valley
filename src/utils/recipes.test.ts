import { describe, expect, it } from 'vitest';
import { RECIPES, filterRecipes, ingredientsText, sourceText } from './recipes';

const byName = (n: string) => RECIPES.find((r) => r.name === n)!;

describe('receitas', () => {
  it('tem as 81 receitas da versão 1.6, todas com nome em português e alguma fonte', () => {
    expect(RECIPES).toHaveLength(81);
    for (const r of RECIPES) {
      expect(r.pt).toBeTruthy();
      expect(r.sources.length).toBeGreaterThan(0);
    }
  });

  it('a Rainha do Molho passa aos domingos (dias 7, 14, 21 e 28)', () => {
    for (const r of RECIPES) for (const s of r.sources) if (s.kind === 'tv') expect(s.day % 7).toBe(0);
    expect(sourceText(byName('Stir Fry').sources[0]!).text).toBe('TV, A Rainha do Molho: domingo, 7 de Primavera do Ano 1.');
  });

  it('descreve cartas, eventos, habilidades e lojas', () => {
    expect(sourceText(byName('Salad').sources[0]!).text).toBe('Carta de Emily com 3 corações de amizade.');
    expect(sourceText(byName('Cookie').sources[0]!).text).toBe('Evento de 4 corações de Evelyn.');
    expect(sourceText(byName("Farmer's Lunch").sources[0]!).text).toBe('Nível 3 de Cultivo.');
    expect(sourceText(byName('Omelet').sources[1]!).text).toContain('por 100g');
  });

  it('ingredientes em português, com quantidade quando maior que 1', () => {
    expect(ingredientsText(byName('Carp Surprise'))).toBe('Carpa ×4');
    expect(ingredientsText(byName('Omelet'))).toBe('Ovo, Leite');
  });

  it('filtra por fonte, busca sem acento e mostra só as que faltam', () => {
    const npc = filterRecipes(RECIPES, 'npc', '', new Set());
    expect(npc.every((r) => r.sources.some((s) => s.kind === 'mail' || s.kind === 'event'))).toBe(true);
    expect(filterRecipes(RECIPES, 'all', 'abobora', new Set()).map((r) => r.name)).toContain('Pumpkin Soup');
    expect(filterRecipes(RECIPES, 'missing', '', new Set(RECIPES.map((r) => r.name)))).toHaveLength(0);
  });
});
