/**
 * Retratos escolhidos pelo próprio usuário, a partir da galeria do celular.
 *
 * As imagens ficam SÓ neste aparelho (Capacitor Preferences) e nunca são enviadas a lugar
 * nenhum nem fazem parte do app publicado: o app não distribui arte de personagens.
 * Cada imagem é reduzida (lado maior até MAX_SIDE px, WebP) para não pesar no armazenamento.
 */
import { Preferences } from '@capacitor/preferences';
import { useSyncExternalStore } from 'react';
import { slug } from './villagers';

const PREFIX = 'retrato-v1:';
const INDEX_KEY = 'retratos-v1';
export const MAX_SIDE = 900;
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

const cache = new Map<string, string>();
const listeners = new Set<() => void>();
let loaded: Promise<void> | null = null;

function emit() {
  for (const l of listeners) l();
}

/** Tamanho final mantendo a proporção, sem nunca aumentar a imagem. */
export function fitSize(width: number, height: number, max = MAX_SIDE): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

async function readIndex(): Promise<string[]> {
  try {
    const { value } = await Preferences.get({ key: INDEX_KEY });
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function writeIndex() {
  await Preferences.set({ key: INDEX_KEY, value: JSON.stringify([...cache.keys()]) });
}

/** Carrega os retratos salvos uma vez, ao abrir o app. */
export function loadUserPortraits(): Promise<void> {
  loaded ??= (async () => {
    for (const key of await readIndex()) {
      const { value } = await Preferences.get({ key: PREFIX + key });
      if (value?.startsWith('data:image/')) cache.set(key, value);
    }
    emit();
  })();
  return loaded;
}

async function toDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.');
  if (file.size > MAX_FILE_BYTES) throw new Error('Imagem muito grande (máximo 15 MB).');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Não foi possível abrir essa imagem.');
  }
  const { width, height } = fitSize(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível processar a imagem.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL('image/webp', 0.86); // WebP mantém fundo transparente, se houver
}

export async function setUserPortrait(villagerName: string, file: File): Promise<void> {
  const key = slug(villagerName);
  const dataUrl = await toDataUrl(file);
  try {
    await Preferences.set({ key: PREFIX + key, value: dataUrl });
  } catch {
    throw new Error('Sem espaço para salvar a imagem neste aparelho.');
  }
  cache.set(key, dataUrl);
  await writeIndex();
  emit();
}

export async function removeUserPortrait(villagerName: string): Promise<void> {
  const key = slug(villagerName);
  await Preferences.remove({ key: PREFIX + key });
  cache.delete(key);
  await writeIndex();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void loadUserPortraits();
  return () => listeners.delete(listener);
}

/** Imagem escolhida pelo usuário para este morador, ou undefined. Atualiza sozinho ao trocar. */
export function useUserPortrait(villagerName: string): string | undefined {
  const key = slug(villagerName);
  return useSyncExternalStore(subscribe, () => cache.get(key));
}
