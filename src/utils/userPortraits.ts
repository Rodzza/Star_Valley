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
/** Cor do fundo de cada imagem escolhida (lida das bordas), para o painel combinar com ela. */
const colors = new Map<string, Rgb>();
const listeners = new Set<() => void>();
let loaded: Promise<void> | null = null;

function emit() {
  for (const l of listeners) l();
}

export type Rgb = readonly [number, number, number];

/**
 * Cor de fundo de uma imagem: mediana dos pixels da borda de cima e das laterais (até 70% da
 * altura, porque o personagem costuma ocupar a parte de baixo). Ignora pixels transparentes;
 * se a borda for toda transparente, devolve null (o painel mantém o cenário da região).
 */
export function edgeColor(data: ArrayLike<number>, width: number, height: number): Rgb | null {
  const r: number[] = [];
  const g: number[] = [];
  const b: number[] = [];
  const take = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    if ((data[i + 3] ?? 0) < 128) return;
    r.push(data[i]!);
    g.push(data[i + 1]!);
    b.push(data[i + 2]!);
  };
  for (let x = 0; x < width; x++) take(x, 0);
  const ate = Math.max(1, Math.floor(height * 0.7));
  for (let y = 1; y < ate; y++) {
    take(0, y);
    take(width - 1, y);
  }
  if (r.length === 0) return null;
  const median = (v: number[]) => {
    const o = [...v].sort((x, y) => x - y);
    return o[Math.floor(o.length / 2)]!;
  };
  return [median(r), median(g), median(b)];
}

/** Fundo escuro pede molduras e texto da versão escura. */
export function isDark([r, g, b]: Rgb): boolean {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
}

async function colorOf(dataUrl: string): Promise<Rgb | null> {
  try {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const { width, height } = fitSize(img.naturalWidth, img.naturalHeight, 64);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);
    return edgeColor(ctx.getImageData(0, 0, width, height).data, width, height);
  } catch {
    return null;
  }
}

async function rememberColor(key: string, dataUrl: string) {
  const c = await colorOf(dataUrl);
  if (c) colors.set(key, c);
  else colors.delete(key);
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
      if (value?.startsWith('data:image/')) {
        cache.set(key, value);
        await rememberColor(key, value);
      }
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
  await rememberColor(key, dataUrl);
  await writeIndex();
  emit();
}

export async function removeUserPortrait(villagerName: string): Promise<void> {
  const key = slug(villagerName);
  await Preferences.remove({ key: PREFIX + key });
  cache.delete(key);
  colors.delete(key);
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

/** Cor de fundo da imagem escolhida para este morador, ou undefined. */
export function useUserPortraitColor(villagerName: string): Rgb | undefined {
  const key = slug(villagerName);
  return useSyncExternalStore(subscribe, () => colors.get(key));
}
