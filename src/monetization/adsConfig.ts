import { resolveAdsConfig, type AdsConfig } from './adsResolve';

export const ADS_CONFIG: AdsConfig = resolveAdsConfig({
  PROD: import.meta.env.PROD,
  VITE_ADMOB_REWARDED_ID: import.meta.env.VITE_ADMOB_REWARDED_ID,
});
