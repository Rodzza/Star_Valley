import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { FeatureId } from '../features/registry';
import { billing, type PlanId } from './billing';
import { showRewardedAd } from './ads';
import {
  canWatchAdFor,
  emptyState,
  grantAdReward,
  isFeatureAvailable,
  normalizeState,
  remainingAds,
  type DailyState,
} from './entitlements';
import { loadDaily, loadProCache, saveDaily, saveProCache } from './storage';

export type WatchResult = 'unlocked' | 'dismissed' | 'error' | 'limit-reached' | 'already-unlocked' | 'not-ad-feature';

interface Ctx {
  ready: boolean;
  isPro: boolean;
  adsLeft: number;
  available: (f: FeatureId) => boolean;
  canWatchAd: (f: FeatureId) => boolean;
  watchAdFor: (f: FeatureId) => Promise<WatchResult>;
  buyPro: (plan: PlanId) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

const EntitlementsContext = createContext<Ctx | null>(null);

export function EntitlementsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [daily, setDaily] = useState<DailyState>(() => emptyState(new Date()));
  const [, setTick] = useState(0);
  const watching = useRef(false);

  useEffect(() => {
    void (async () => {
      const [d, pro] = await Promise.all([loadDaily(), loadProCache()]);
      setDaily(normalizeState(d, new Date()));
      setIsPro(pro);
      setReady(true);
    })();
    // Reavalia a cada minuto para a liberação expirar à meia-noite com o app aberto.
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const watchAdFor = useCallback(
    async (feature: FeatureId): Promise<WatchResult> => {
      if (watching.current) return 'dismissed';
      const now = new Date();
      if (!canWatchAdFor(daily, feature, now)) {
        const probe = grantAdReward(daily, feature, now);
        return probe.ok ? 'error' : probe.reason;
      }
      watching.current = true;
      try {
        const outcome = await showRewardedAd();
        if (outcome !== 'rewarded') return outcome;
        const result = grantAdReward(daily, feature, new Date());
        if (!result.ok) return result.reason;
        setDaily(result.state);
        await saveDaily(result.state);
        return 'unlocked';
      } finally {
        watching.current = false;
      }
    },
    [daily],
  );

  const buyPro = useCallback(async (plan: PlanId) => {
    const ok = await billing.purchase(plan);
    if (ok) {
      setIsPro(true);
      await saveProCache(true);
    }
    return ok;
  }, []);

  const restorePurchases = useCallback(async () => {
    const ok = await billing.restore();
    setIsPro(ok);
    await saveProCache(ok);
    return ok;
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      isPro,
      adsLeft: remainingAds(daily, new Date()),
      available: (f) => isFeatureAvailable(f, daily, isPro, new Date()),
      canWatchAd: (f) => canWatchAdFor(daily, f, new Date()),
      watchAdFor,
      buyPro,
      restorePurchases,
    }),
    [ready, isPro, daily, watchAdFor, buyPro, restorePurchases],
  );

  return <EntitlementsContext.Provider value={value}>{children}</EntitlementsContext.Provider>;
}

export function useEntitlements(): Ctx {
  const ctx = useContext(EntitlementsContext);
  if (!ctx) throw new Error('useEntitlements fora do EntitlementsProvider');
  return ctx;
}
