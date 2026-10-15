import { describe, expect, it } from 'vitest';
import { TEST_REWARDED_ID, resolveAdsConfig } from './adsResolve';

const REAL = 'ca-app-pub-1234567890123456/1234567890';

describe('configuração de anúncios', () => {
  it('desenvolvimento usa sempre teste, mesmo com ID real configurado', () => {
    expect(resolveAdsConfig({ PROD: false, VITE_ADMOB_REWARDED_ID: REAL })).toEqual({
      useTestAds: true,
      rewardedAdUnitId: TEST_REWARDED_ID,
    });
  });
  it('produção com ID real usa o real', () => {
    expect(resolveAdsConfig({ PROD: true, VITE_ADMOB_REWARDED_ID: REAL })).toEqual({
      useTestAds: false,
      rewardedAdUnitId: REAL,
    });
  });
  it('produção sem ID ou com ID malformado cai no teste', () => {
    expect(resolveAdsConfig({ PROD: true }).useTestAds).toBe(true);
    expect(resolveAdsConfig({ PROD: true, VITE_ADMOB_REWARDED_ID: 'ca-app-pub-3940256099942544~3347511713' }).useTestAds).toBe(true);
    expect(resolveAdsConfig({ PROD: true, VITE_ADMOB_REWARDED_ID: 'abc' }).useTestAds).toBe(true);
  });
});
