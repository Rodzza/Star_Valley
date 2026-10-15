export const ADMOB_META = 'com.google.android.gms.ads.APPLICATION_ID';
const APP_ID = /^ca-app-pub-\d{16}~\d{10}$/;

export const isValidAppId = (id: string): boolean => APP_ID.test(id);

/**
 * Coloca (ou troca) o App ID do AdMob dentro de <application> do AndroidManifest.xml.
 * Sem esse meta-data o app fecha ao abrir no Android.
 */
export function patchAdMobAppId(manifest: string, appId: string): string {
  if (!isValidAppId(appId)) throw new Error(`App ID do AdMob inválido: ${appId}`);
  const tag = `<meta-data android:name="${ADMOB_META}" android:value="${appId}" />`;
  const existing = new RegExp(`<meta-data[^>]*android:name="${ADMOB_META.replace(/\./g, '\\.')}"[^>]*/>`);
  if (existing.test(manifest)) return manifest.replace(existing, tag);
  const open = /<application\b[^>]*>/.exec(manifest);
  if (!open) throw new Error('<application> não encontrado no AndroidManifest.xml');
  const at = open.index + open[0].length;
  return `${manifest.slice(0, at)}\n        ${tag}${manifest.slice(at)}`;
}
