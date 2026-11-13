import { Preferences } from '@capacitor/preferences';
import type { FeatureId } from '../features/registry';

const KEY = 'onboarding-v1';

export type InterestId = 'gifts' | 'crops' | 'recipes' | 'perfection' | 'calendar' | 'building';

export interface Interest {
  id: InterestId;
  emoji: string;
  label: string;
  features: FeatureId[];
}

/** Temas que a pessoa escolhe no onboarding; viram atalhos no Início. */
export const INTERESTS: readonly Interest[] = [
  { id: 'gifts', emoji: '🎁', label: 'Presentes e amizades', features: ['giftFinder', 'villagers'] },
  { id: 'crops', emoji: '🌱', label: 'Plantar e ganhar dinheiro', features: ['cropPlanner', 'animals'] },
  { id: 'calendar', emoji: '📅', label: 'Festivais e aniversários', features: ['calendar'] },
  { id: 'recipes', emoji: '🍳', label: 'Receitas', features: ['recipes'] },
  { id: 'building', emoji: '🔨', label: 'Construções e reformas', features: ['buildings'] },
  { id: 'perfection', emoji: '🏆', label: 'Perfeição e habilidades', features: ['skills', 'saveProgress'] },
];

export interface OnboardingState {
  done: boolean;
  farmName: string;
  interests: InterestId[];
}

export const EMPTY_ONBOARDING: OnboardingState = { done: false, farmName: '', interests: [] };

export async function loadOnboarding(): Promise<OnboardingState> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (!value) return EMPTY_ONBOARDING;
    const s = JSON.parse(value) as Partial<OnboardingState>;
    return {
      done: s.done === true,
      farmName: typeof s.farmName === 'string' ? s.farmName.slice(0, 40) : '',
      interests: Array.isArray(s.interests) ? s.interests.filter((i): i is InterestId => INTERESTS.some((x) => x.id === i)) : [],
    };
  } catch {
    return EMPTY_ONBOARDING;
  }
}

export const saveOnboarding = (s: OnboardingState) => Preferences.set({ key: KEY, value: JSON.stringify(s) });

/** Atalhos do Início a partir dos interesses, sem repetir e na ordem escolhida. */
export function shortcutsFor(interests: readonly InterestId[]): FeatureId[] {
  const out: FeatureId[] = [];
  for (const id of interests) for (const f of INTERESTS.find((i) => i.id === id)?.features ?? []) if (!out.includes(f)) out.push(f);
  return out;
}
