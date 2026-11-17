/**
 * Uso (depois de `npx cap add android`): npx tsx tools/configureAndroid.ts
 * Aplica o ícone do app no projeto Android. Pode rodar quantas vezes quiser.
 */
import { cpSync, existsSync } from 'node:fs';

if (!existsSync('android/app/src/main/res')) {
  console.error('Não achei o projeto Android. Rode antes: npx cap add android');
  process.exit(1);
}

// Ícone do Stardew Notes (arte/), por cima do ícone padrão do Capacitor.
cpSync('arte/android-res', 'android/app/src/main/res', { recursive: true });
console.log('Ícone do Stardew Notes aplicado.');
