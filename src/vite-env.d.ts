/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** ID da unidade de anúncio premiado (AdMob), formato ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY. */
  readonly VITE_ADMOB_REWARDED_ID?: string;
  /** 'true' só na prévia em navegador: anúncios e compra são simulados. */
  readonly VITE_PREVIEW?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
