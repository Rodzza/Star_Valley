import type { CropSource } from './crops';

export const TASTES = ['love', 'like', 'neutral', 'dislike', 'hate'] as const;
export type Taste = (typeof TASTES)[number];

export const TASTE_LABEL: Record<Taste, string> = {
  love: 'Ama',
  like: 'Gosta',
  neutral: 'Neutro',
  dislike: 'Não gosta',
  hate: 'Odeia',
};

export interface GiftEntry {
  /** Nome do item em inglês, como está na wiki (ex.: "Pumpkin"). */
  name: string;
  /** Qualificador da wiki, ex.: "Blackberry, Blueberry" em "Jelly (Blackberry, Blueberry)". */
  note?: string;
}

export interface VillagerGifts {
  name: string;
  source: CropSource;
  /** Itens citados pela página do personagem. */
  tastes: Record<Taste, GiftEntry[]>;
  /** Grupos citados ("All Eggs", "All Vegetables"...). Guardados só para exibição. */
  groups: Record<Taste, string[]>;
}

export interface GiftData {
  universal: Record<Taste, GiftEntry[]>;
  /** item (normalizado) -> personagem -> gosto, quando difere do gosto universal. */
  exceptions: Record<string, Record<string, Taste>>;
  villagers: VillagerGifts[];
}

/** Minúsculas e sem "s" final: a wiki alterna "Cookie"/"Cookies", "Pickle"/"Pickles" entre páginas. */
export const normalizeItem = (s: string): string => {
  const t = s.trim().toLowerCase();
  return t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t;
};

const has = (list: readonly GiftEntry[], item: string): boolean => {
  const n = normalizeItem(item);
  return list.some((e) => normalizeItem(e.name) === n);
};

/**
 * Gosto efetivo de um personagem por um item. Ordem de prioridade:
 * 1) lista própria do personagem; 2) exceção ao gosto universal; 3) gosto universal.
 * Retorna 'unknown' quando a wiki não diz nada (provavelmente neutro, mas não afirmamos).
 */
export function tasteOf(data: GiftData, villager: VillagerGifts, item: string): Taste | 'unknown' {
  for (const t of TASTES) if (has(villager.tastes[t], item)) return t;
  const exc = data.exceptions[normalizeItem(item)]?.[villager.name];
  if (exc) return exc;
  for (const t of TASTES) if (has(data.universal[t], item)) return t;
  return 'unknown';
}

/** Todo item que cada personagem escolhido ama (inclui amados universais, respeitando exceções). */
export function lovedByAll(data: GiftData, villagers: readonly VillagerGifts[]): string[] {
  if (villagers.length === 0) return [];
  const candidates = new Map<string, string>();
  for (const v of villagers) {
    for (const e of v.tastes.love) candidates.set(normalizeItem(e.name), e.name);
  }
  for (const e of data.universal.love) candidates.set(normalizeItem(e.name), e.name);
  // Itens universais de outro gosto que algum personagem ama por exceção.
  for (const t of TASTES) {
    for (const e of data.universal[t]) {
      const exc = data.exceptions[normalizeItem(e.name)];
      if (exc && Object.values(exc).includes('love')) candidates.set(normalizeItem(e.name), e.name);
    }
  }
  const out: string[] = [];
  for (const [key, name] of candidates) {
    if (villagers.every((v) => tasteOf(data, v, key) === 'love')) out.push(name);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

export interface NearMiss {
  item: string;
  /** Quem não ama, com o gosto real (para o jogador decidir se vale a pena). */
  others: Array<{ villager: string; taste: Taste | 'unknown' }>;
}

/** Itens amados por todos menos um dos personagens (útil quando não há item amado por todos). */
export function allButOne(data: GiftData, villagers: readonly VillagerGifts[]): NearMiss[] {
  if (villagers.length < 2) return [];
  const candidates = new Map<string, string>();
  for (const v of villagers) for (const e of v.tastes.love) candidates.set(normalizeItem(e.name), e.name);
  for (const e of data.universal.love) candidates.set(normalizeItem(e.name), e.name);
  const out: NearMiss[] = [];
  for (const [key, name] of candidates) {
    const others = villagers
      .map((v) => ({ villager: v.name, taste: tasteOf(data, v, key) }))
      .filter((x) => x.taste !== 'love');
    if (others.length === 1) out.push({ item: name, others });
  }
  return out.sort((a, b) => a.item.localeCompare(b.item));
}
