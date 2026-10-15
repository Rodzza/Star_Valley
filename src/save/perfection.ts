import lists from '../data/perfectionLists.json';
import type { ParsedSave } from './parseSave';

/**
 * Cálculo de Perfeição seguindo o Utility.percentGameComplete() do jogo, na forma como o Stardew Checkup
 * (MouseyPounds, licença MIT) o reproduz: veja THIRD_PARTY_LICENSES.md. Pesos e listas vêm de lá.
 */
export type CategoryStatus = 'ok' | 'unavailable';

export interface PerfectionCategory {
  id: string;
  label: string;
  /** Peso na barra de Perfeição do jogo (soma 100). */
  weight: number;
  got: number;
  need: number;
  /** Pontos de perfeição ganhos nesta categoria (0 quando indisponível). */
  points: number;
  status: CategoryStatus;
  note?: string;
}

export interface PerfectionResult {
  categories: PerfectionCategory[];
  /** Soma dos pontos das categorias lidas (sem os bônus de Waivers). */
  points: number;
  /** Soma dos pesos das categorias lidas: o máximo que o app consegue medir neste arquivo. */
  measurableMax: number;
  /** Pontos extras de "Perfection Waivers" comprados no jogo (versão 1.6). */
  waivers: number;
}

export const DATABLE = ['Abigail', 'Alex', 'Elliott', 'Emily', 'Haley', 'Harvey', 'Leah', 'Maru', 'Penny', 'Sam', 'Sebastian', 'Shane'];
export const STARDROP_FLAGS = ['CF_Fair', 'CF_Fish', 'CF_Mines', 'CF_Sewer', 'CF_Spouse', 'CF_Statue', 'museumComplete'];

const inList = (required: readonly string[], have: readonly string[]): number => {
  const set = new Set(have);
  return required.filter((r) => set.has(r)).length;
};

/** Receitas de fabricação: o save usa alguns nomes diferentes dos oficiais. */
function craftedCount(have: readonly string[]): number {
  const translate = lists.craftingTranslate as Record<string, string>;
  const names = new Set(have.map((n) => translate[n] ?? n));
  return lists.crafting.filter((r) => names.has(r)).length;
}

/** Moradores no nível máximo: 10 corações, ou 8 para quem pode ser namorado(a). */
export function maxedFriends(save: ParsedSave): number {
  const counted = new Set(lists.friends);
  return save.friends.filter((f) => counted.has(f.name) && (f.points >= 2500 || (DATABLE.includes(f.name) && f.points >= 2000))).length;
}

/** Metas do Guilda dos Aventureiros concluídas (de 12). */
export function monsterGoalsDone(save: ParsedSave): number {
  const cats = lists.monsterCategories as Record<string, string>;
  const goals = lists.monsterGoals as Record<string, number>;
  const killed: Record<string, number> = {};
  for (const [monster, n] of Object.entries(save.monstersKilled)) {
    const cat = cats[monster];
    if (cat) killed[cat] = (killed[cat] ?? 0) + n;
  }
  return Object.entries(goals).filter(([cat, need]) => (killed[cat] ?? 0) >= need).length;
}

export function stardropsFound(save: ParsedSave): number {
  return STARDROP_FLAGS.filter((f) => save.mail.includes(f) || (f === 'CF_Mines' && save.mineChestOpened)).length;
}

const frac = (got: number, need: number) => Math.min(got / need, 1);

export function computePerfection(save: ParsedSave): PerfectionResult {
  const main = save.kind === 'main';
  const level = Math.floor(
    (save.skills.farming + save.skills.mining + save.skills.combat + save.skills.foraging + save.skills.fishing + save.skills.luck) / 2,
  );

  const shipped = inList(lists.shipped, save.basicShipped);
  const fish = inList(lists.fish, save.fishCaught);
  const cooked = inList(lists.cooking, save.recipesCooked);
  const crafted = craftedCount(save.recipesCrafted);
  const friends = maxedFriends(save);
  const goals = monsterGoalsDone(save);
  const goalTotal = Object.keys(lists.monsterGoals).length;
  const drops = stardropsFound(save);
  const walnuts = save.goldenWalnutsFound ?? 0;

  const cats: PerfectionCategory[] = [
    { id: 'shipped', label: 'Produtos e coletas enviados', weight: 15, got: shipped, need: lists.shipped.length, points: 15 * frac(shipped, lists.shipped.length), status: 'ok' },
    { id: 'obelisks', label: 'Obeliscos na fazenda', weight: 4, got: save.obelisks.length, need: 4, points: Math.min(save.obelisks.length, 4), status: main ? 'ok' : 'unavailable' },
    { id: 'clock', label: 'Relógio de Ouro', weight: 10, got: save.goldClock ? 1 : 0, need: 1, points: save.goldClock ? 10 : 0, status: main ? 'ok' : 'unavailable' },
    { id: 'monsters', label: 'Herói caça-monstros (todas as metas)', weight: 10, got: goals, need: goalTotal, points: goals >= goalTotal ? 10 : 0, status: 'ok', note: 'tudo ou nada: vale 10 só com as 12 metas' },
    { id: 'friends', label: 'Grandes amigos', weight: 11, got: friends, need: lists.friends.length, points: 11 * frac(friends, lists.friends.length), status: 'ok', note: '10 corações (8 para quem pode namorar)' },
    { id: 'level', label: 'Nível de fazendeiro', weight: 5, got: Math.min(level, 25), need: 25, points: 5 * frac(level, 25), status: 'ok' },
    { id: 'stardrops', label: 'Todas as Gotas de estrela', weight: 10, got: drops, need: STARDROP_FLAGS.length, points: drops >= STARDROP_FLAGS.length ? 10 : 0, status: 'ok', note: 'tudo ou nada: vale 10 só com as 7' },
    { id: 'cooking', label: 'Receitas cozinhadas', weight: 10, got: cooked, need: lists.cooking.length, points: 10 * frac(cooked, lists.cooking.length), status: 'ok' },
    { id: 'crafting', label: 'Receitas fabricadas', weight: 10, got: crafted, need: lists.crafting.length, points: 10 * frac(crafted, lists.crafting.length), status: 'ok' },
    { id: 'fish', label: 'Peixes pescados', weight: 10, got: fish, need: lists.fish.length, points: 10 * frac(fish, lists.fish.length), status: 'ok' },
    { id: 'walnuts', label: 'Nozes douradas', weight: 5, got: Math.min(walnuts, 130), need: 130, points: 5 * frac(walnuts, 130), status: save.goldenWalnutsFound === null ? 'unavailable' : 'ok' },
  ];
  const fixed = cats.map((c) => (c.status === 'unavailable' ? { ...c, points: 0 } : c));
  const usable = fixed.filter((c) => c.status !== 'unavailable');
  return {
    categories: fixed,
    points: usable.reduce((s, c) => s + c.points, 0),
    measurableMax: usable.reduce((s, c) => s + c.weight, 0),
    waivers: save.perfectionWaivers,
  };
}
