/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** ID da unidade de anúncio premiado (AdMob), formato ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY. */
  readonly VITE_ADMOB_REWARDED_ID?: string;
  /** 'true' só na prévia em navegador: anúncios e compra são simulados. */
  readonly VITE_PREVIEW?: string;
  /** 'true' só em builds de teste: libera todas as funções (como Pro) sem anúncio nem compra. */
  readonly VITE_UNLOCK_ALL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
