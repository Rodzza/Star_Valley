import { Capacitor } from '@capacitor/core';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import { ADS_CONFIG } from './adsConfig';

export type AdOutcome = 'rewarded' | 'dismissed' | 'error';

let initialized = false;

async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  await AdMob.initialize();
  initialized = true;
}

/**
 * Mostra um anúncio com recompensa. Só devolve 'rewarded' se o evento de recompensa chegou,
 * ou seja, o usuário assistiu o suficiente. Fechar antes devolve 'dismissed' (nada é liberado).
 */
export async function showRewardedAd(): Promise<AdOutcome> {
  if (!Capacitor.isNativePlatform()) {
    // Navegador (desenvolvimento): simula sucesso. Em build de produção web, não libera nada.
    return import.meta.env.DEV || import.meta.env.VITE_PREVIEW === 'true' ? 'rewarded' : 'error';
  }
  try {
    await ensureInitialized();
    let rewarded = false;
    const handle = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
      rewarded = true;
    });
    try {
      await AdMob.prepareRewardVideoAd({
        adId: ADS_CONFIG.rewardedAdUnitId,
        isTesting: ADS_CONFIG.useTestAds,
      });
      await AdMob.showRewardVideoAd();
    } finally {
      await handle.remove();
    }
    return rewarded ? 'rewarded' : 'dismissed';
  } catch {
    return 'error';
  }
}
