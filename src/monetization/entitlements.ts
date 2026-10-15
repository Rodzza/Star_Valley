import { FEATURE_BY_ID, type FeatureId } from '../features/registry';

/** Máximo de anúncios com recompensa por dia (no total, não por função). */
export const DAILY_AD_LIMIT = 5;

export interface DailyState {
  /** Dia local no formato YYYY-MM-DD. */
  dateKey: string;
  adsWatched: number;
  unlocked: FeatureId[];
}

export type RewardResult =
  | { ok: true; state: DailyState }
  | { ok: false; reason: 'limit-reached' | 'not-ad-feature' | 'already-unlocked' };

/** Data local (não UTC): a liberação expira à meia-noite do relógio do aparelho. */
export function localDateKey(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function emptyState(now: Date): DailyState {
  return { dateKey: localDateKey(now), adsWatched: 0, unlocked: [] };
}

/** Zera contador e liberações quando o dia local mudou. */
export function normalizeState(state: DailyState | null | undefined, now: Date): DailyState {
  if (!state || state.dateKey !== localDateKey(now)) return emptyState(now);
  return state;
}

export function remainingAds(state: DailyState, now: Date): number {
  const s = normalizeState(state, now);
  return Math.max(0, DAILY_AD_LIMIT - s.adsWatched);
}

/** Registra a recompensa de um anúncio assistido até o fim. */
export function grantAdReward(state: DailyState, feature: FeatureId, now: Date): RewardResult {
  const s = normalizeState(state, now);
  if (FEATURE_BY_ID[feature].access !== 'ad') return { ok: false, reason: 'not-ad-feature' };
  if (s.unlocked.includes(feature)) return { ok: false, reason: 'already-unlocked' };
  if (s.adsWatched >= DAILY_AD_LIMIT) return { ok: false, reason: 'limit-reached' };
  return { ok: true, state: { ...s, adsWatched: s.adsWatched + 1, unlocked: [...s.unlocked, feature] } };
}

export function canWatchAdFor(state: DailyState, feature: FeatureId, now: Date): boolean {
  const s = normalizeState(state, now);
  return (
    FEATURE_BY_ID[feature].access === 'ad' && !s.unlocked.includes(feature) && s.adsWatched < DAILY_AD_LIMIT
  );
}

export function isFeatureAvailable(feature: FeatureId, state: DailyState, isPro: boolean, now: Date): boolean {
  const access = FEATURE_BY_ID[feature].access;
  if (access === 'free') return true;
  if (isPro) return true;
  if (access === 'ad') return normalizeState(state, now).unlocked.includes(feature);
  return false;
}
