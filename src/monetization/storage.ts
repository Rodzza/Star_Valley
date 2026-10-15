import { Preferences } from '@capacitor/preferences';
import type { DailyState } from './entitlements';
import type { FeatureId } from '../features/registry';

const KEY_DAILY = 'daily-state-v1';
const KEY_PRO = 'pro-flag-v1';

function isDailyState(v: unknown): v is DailyState {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.dateKey === 'string' &&
    typeof o.adsWatched === 'number' &&
    Array.isArray(o.unlocked) &&
    o.unlocked.every((x) => typeof x === 'string')
  );
}

export async function loadDaily(): Promise<DailyState | null> {
  try {
    const { value } = await Preferences.get({ key: KEY_DAILY });
    if (!value) return null;
    const parsed: unknown = JSON.parse(value);
    return isDailyState(parsed) ? { ...parsed, unlocked: parsed.unlocked as FeatureId[] } : null;
  } catch {
    return null;
  }
}

export async function saveDaily(state: DailyState): Promise<void> {
  await Preferences.set({ key: KEY_DAILY, value: JSON.stringify(state) });
}

/**
 * ATENÇÃO: este flag local é só cache para abrir o app rápido. A fonte da verdade do Pro
 * deve ser o Google Play (veja billing.ts): ao iniciar, reconfirme a compra com a loja.
 */
export async function loadProCache(): Promise<boolean> {
  const { value } = await Preferences.get({ key: KEY_PRO });
  return value === '1';
}

export async function saveProCache(isPro: boolean): Promise<void> {
  await Preferences.set({ key: KEY_PRO, value: isPro ? '1' : '0' });
}
