/**
 * Configuração dos anúncios.
 *
 * - Em desenvolvimento (npm run dev) e em qualquer build sem ID real: usa os IDs de TESTE do Google.
 * - No build de produção (npm run build) com VITE_ADMOB_REWARDED_ID definido: usa o ID real.
 *
 * Nunca clique nos seus próprios anúncios reais: o AdMob pode suspender a conta. Para testar no
 * aparelho com anúncios reais, cadastre-o como "dispositivo de teste" no console do AdMob.
 */
export const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
export const TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

const REAL_REWARDED = /^ca-app-pub-\d{16}\/\d{10}$/;

export interface AdsConfig {
  useTestAds: boolean;
  rewardedAdUnitId: string;
}

export interface AdsEnv {
  PROD: boolean;
  VITE_ADMOB_REWARDED_ID?: string;
}

/** Decide qual ID usar. Um ID malformado nunca vai para produção: cai no teste. */
export function resolveAdsConfig(env: AdsEnv): AdsConfig {
  const id = env.VITE_ADMOB_REWARDED_ID?.trim();
  if (env.PROD && id && REAL_REWARDED.test(id)) return { useTestAds: false, rewardedAdUnitId: id };
  return { useTestAds: true, rewardedAdUnitId: TEST_REWARDED_ID };
}
