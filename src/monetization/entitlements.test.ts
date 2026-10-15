import { describe, expect, it } from 'vitest';
import {
  DAILY_AD_LIMIT,
  canWatchAdFor,
  emptyState,
  grantAdReward,
  isFeatureAvailable,
  localDateKey,
  normalizeState,
  remainingAds,
} from './entitlements';

const morning = new Date(2026, 9, 14, 8, 0, 0);
const justBeforeMidnight = new Date(2026, 9, 14, 23, 59, 59);
const justAfterMidnight = new Date(2026, 9, 15, 0, 0, 1);

describe('liberação por anúncio', () => {
  it('usa a data local, não UTC', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });

  it('libera o planejador até meia-noite e consome 1 anúncio', () => {
    const r = grantAdReward(emptyState(morning), 'cropPlanner', morning);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.adsWatched).toBe(1);
    expect(isFeatureAvailable('cropPlanner', r.state, false, justBeforeMidnight)).toBe(true);
    expect(isFeatureAvailable('cropPlanner', r.state, false, justAfterMidnight)).toBe(false);
  });

  it('zera o contador no dia seguinte', () => {
    const r = grantAdReward(emptyState(morning), 'cropPlanner', morning);
    if (!r.ok) throw new Error('esperava sucesso');
    expect(remainingAds(r.state, justAfterMidnight)).toBe(DAILY_AD_LIMIT);
    expect(normalizeState(r.state, justAfterMidnight).unlocked).toEqual([]);
  });

  it('não cobra outro anúncio por função já liberada hoje', () => {
    const r = grantAdReward(emptyState(morning), 'cropPlanner', morning);
    if (!r.ok) throw new Error('esperava sucesso');
    expect(canWatchAdFor(r.state, 'cropPlanner', morning)).toBe(false);
    expect(grantAdReward(r.state, 'cropPlanner', morning)).toEqual({ ok: false, reason: 'already-unlocked' });
  });

  it('recusa funções Pro por anúncio', () => {
    expect(grantAdReward(emptyState(morning), 'giftFinder', morning)).toEqual({
      ok: false,
      reason: 'not-ad-feature',
    });
    expect(isFeatureAvailable('giftFinder', emptyState(morning), false, morning)).toBe(false);
  });

  it('respeita o limite diário total', () => {
    const exhausted = { ...emptyState(morning), adsWatched: DAILY_AD_LIMIT };
    expect(grantAdReward(exhausted, 'cropPlanner', morning)).toEqual({ ok: false, reason: 'limit-reached' });
    expect(canWatchAdFor(exhausted, 'cropPlanner', morning)).toBe(false);
  });

  it('Pro acessa tudo sem anúncios', () => {
    expect(isFeatureAvailable('giftFinder', emptyState(morning), true, morning)).toBe(true);
    expect(isFeatureAvailable('cropPlanner', emptyState(morning), true, morning)).toBe(true);
  });

  it('funções gratuitas estão sempre disponíveis', () => {
    expect(isFeatureAvailable('calendar', emptyState(morning), false, morning)).toBe(true);
  });
});
