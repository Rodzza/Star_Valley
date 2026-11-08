import recipesJson from '../data/recipes.json';
import { weekdayOf } from './calendar';
import { itemLabel } from './items';
import { displayName, seasonLabel, type SeasonKey } from './villagers';

export type RecipeSource =
  | { kind: 'starter' }
  | { kind: 'tv'; day: number; season: SeasonKey; year: number }
  | { kind: 'mail'; npc: string; hearts: number }
  | { kind: 'event'; npc: string; hearts: number }
  | { kind: 'skill'; skill: string; level: number }
  | { kind: 'shop'; where: string; price: string };

export interface Recipe {
  /** Nome em inglês (chave estável). */
  name: string;
  pt: string;
  ingredients: { item: string; qty: number }[];
  sources: RecipeSource[];
}

export const RECIPES = recipesJson as unknown as Recipe[];

export type RecipeFilter = 'all' | 'tv' | 'npc' | 'skill' | 'shop' | 'missing';

const WEEKDAY_FULL: Record<string, string> = {
  Seg: 'segunda',
  Ter: 'terça',
  Qua: 'quarta',
  Qui: 'quinta',
  Sex: 'sexta',
  Sáb: 'sábado',
  Dom: 'domingo',
};

const heartsLabel = (n: number) => `${n} ${n === 1 ? 'coração' : 'corações'}`;

/** Ícone e texto de onde a receita é aprendida. */
export function sourceText(s: RecipeSource): { icon: string; text: string } {
  switch (s.kind) {
    case 'starter':
      return { icon: '🍳', text: 'Você já começa sabendo.' };
    case 'tv':
      return {
        icon: '📺',
        text: `TV, A Rainha do Molho: ${WEEKDAY_FULL[weekdayOf(s.day)] ?? weekdayOf(s.day)}, ${s.day} de ${seasonLabel(s.season)} do Ano ${s.year}.`,
      };
    case 'mail':
      return { icon: '💌', text: `Carta de ${displayName(s.npc)} com ${heartsLabel(s.hearts)} de amizade.` };
    case 'event':
      return { icon: '🎬', text: `Evento de ${heartsLabel(s.hearts)} de ${displayName(s.npc)}.` };
    case 'skill':
      return { icon: '⭐', text: `Nível ${s.level} de ${s.skill}.` };
    case 'shop':
      return { icon: '🛒', text: `${s.where}, por ${s.price}.` };
  }
}

export const ingredientsText = (r: Recipe): string =>
  r.ingredients.map((i) => (i.qty > 1 ? `${itemLabel(i.item)} ×${i.qty}` : itemLabel(i.item))).join(', ');

const KIND_OF: Record<Exclude<RecipeFilter, 'all' | 'missing'>, RecipeSource['kind'][]> = {
  tv: ['tv'],
  npc: ['mail', 'event'],
  skill: ['skill'],
  shop: ['shop'],
};

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function filterRecipes(list: readonly Recipe[], filter: RecipeFilter, query: string, learned: ReadonlySet<string>): Recipe[] {
  const q = norm(query.trim());
  return list
    .filter((r) => {
      if (filter === 'missing') return !learned.has(r.name);
      if (filter === 'all') return true;
      return r.sources.some((s) => KIND_OF[filter].includes(s.kind));
    })
    .filter((r) => !q || norm(`${r.pt} ${ingredientsText(r)} ${r.sources.map((s) => sourceText(s).text).join(' ')}`).includes(q))
    .sort((a, b) => a.pt.localeCompare(b.pt, 'pt-BR'));
}
