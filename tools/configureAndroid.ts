/**
 * Uso (depois de `npx cap add android`):
 *   npx tsx tools/configureAndroid.ts            # lê ADMOB_APP_ID de .env.production
 *   npx tsx tools/configureAndroid.ts --test     # usa o App ID de TESTE do Google
 * Ajusta o AndroidManifest.xml do projeto Android. Pode rodar quantas vezes quiser.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { TEST_APP_ID } from '../src/monetization/adsResolve';
import { isValidAppId, patchAdMobAppId } from '../src/tools/androidManifest';

const MANIFEST = 'android/app/src/main/AndroidManifest.xml';

function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m?.[1] && !line.trim().startsWith('#')) out[m[1]] = (m[2] ?? '').replace(/^["']|["']$/g, '');
  }
  return out;
}

if (!existsSync(MANIFEST)) {
  console.error(`Não achei ${MANIFEST}. Rode antes: npx cap add android`);
  process.exit(1);
}

const useTest = process.argv.includes('--test');
const appId = useTest ? TEST_APP_ID : (process.env.ADMOB_APP_ID ?? readEnvFile('.env.production').ADMOB_APP_ID ?? '');

if (!isValidAppId(appId)) {
  console.error(
    useTest
      ? 'App ID de teste inválido (bug).'
      : 'ADMOB_APP_ID ausente ou inválido em .env.production (formato ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY).\nPara só testar com anúncios de teste: npx tsx tools/configureAndroid.ts --test',
  );
  process.exit(1);
}

writeFileSync(MANIFEST, patchAdMobAppId(readFileSync(MANIFEST, 'utf8'), appId));
console.log(`AndroidManifest atualizado com o App ID ${useTest ? '(TESTE) ' : ''}${appId}`);
