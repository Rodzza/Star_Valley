import { Preferences } from '@capacitor/preferences';
import { useSyncExternalStore } from 'react';
import { FEATURES, type FeatureId } from '../features/registry';

const KEY = 'favoritos-v1';

export interface Favorites {
  features: FeatureId[];
  villagers: string[];
}

const EMPTY: Favorites = { features: [], villagers: [] };
let state: Favorites = EMPTY;
const listeners = new Set<() => void>();

/** Lê o que foi salvo, ignorando funções que não existem mais. */
export function parseFavorites(raw: string | null): Favorites {
  if (!raw) return EMPTY;
  try {
    const f = JSON.parse(raw) as Partial<Favorites>;
    const ids = new Set(FEATURES.map((x) => x.id));
    return {
      features: Array.isArray(f.features) ? f.features.filter((id): id is FeatureId => ids.has(id as FeatureId)) : [],
      villagers: Array.isArray(f.villagers) ? f.villagers.filter((n): n is string => typeof n === 'string').slice(0, 100) : [],
    };
  } catch {
    return EMPTY;
  }
}

/** Liga ou desliga um item na lista (o mais recente vai para o fim). */
export const toggleIn = <T,>(list: readonly T[], item: T): T[] => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

function set(next: Favorites) {
  state = next;
  listeners.forEach((l) => l());
  void Preferences.set({ key: KEY, value: JSON.stringify(next) });
}

export async function loadFavorites(): Promise<void> {
  try {
    state = parseFavorites((await Preferences.get({ key: KEY })).value);
  } catch {
    state = EMPTY;
  }
  listeners.forEach((l) => l());
}

export const toggleFeature = (id: FeatureId) => set({ ...state, features: toggleIn(state.features, id) });
export const toggleVillager = (name: string) => set({ ...state, villagers: toggleIn(state.villagers, name) });

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useFavorites = (): Favorites => useSyncExternalStore(subscribe, () => state);
