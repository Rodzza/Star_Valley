import { describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/preferences', () => {
  const store = new Map<string, string>();
  return {
    Preferences: {
      get: async ({ key }: { key: string }) => ({ value: store.get(key) ?? null }),
      set: async ({ key, value }: { key: string; value: string }) => void store.set(key, value),
      remove: async ({ key }: { key: string }) => void store.delete(key),
    },
  };
});

import { fitSize, removeUserPortrait, setUserPortrait } from './userPortraits';

describe('retratos escolhidos pelo usuário', () => {
  it('reduz imagens grandes mantendo a proporção', () => {
    expect(fitSize(1438, 2576)).toEqual({ width: 502, height: 900 });
    expect(fitSize(3000, 1000)).toEqual({ width: 900, height: 300 });
  });

  it('nunca aumenta imagens pequenas', () => {
    expect(fitSize(300, 400)).toEqual({ width: 300, height: 400 });
  });

  it('recusa arquivo que não é imagem, sem salvar nada', async () => {
    const txt = new File(['oi'], 'nota.txt', { type: 'text/plain' });
    await expect(setUserPortrait('Sebastian', txt)).rejects.toThrow('Escolha um arquivo de imagem.');
  });

  it('remover um retrato que não existe não quebra', async () => {
    await expect(removeUserPortrait('Leah')).resolves.toBeUndefined();
  });
});

import { edgeColor, isDark } from './userPortraits';

function imagem(w: number, h: number, fundo: [number, number, number], centro: [number, number, number], alfa = 255) {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const borda = x === 0 || y === 0 || x === w - 1;
      const [r, g, b] = borda ? fundo : centro;
      d.set([r, g, b, borda ? alfa : 255], (y * w + x) * 4);
    }
  return d;
}

describe('cor do fundo da imagem', () => {
  it('lê a cor das bordas, não do personagem no centro', () => {
    expect(edgeColor(imagem(20, 30, [250, 230, 170], [200, 40, 40]), 20, 30)).toEqual([250, 230, 170]);
  });

  it('com borda transparente, não inventa cor', () => {
    expect(edgeColor(imagem(10, 10, [0, 0, 0], [255, 0, 0], 0), 10, 10)).toBeNull();
  });

  it('distingue fundo claro de escuro', () => {
    expect(isDark([250, 230, 170])).toBe(false);
    expect(isDark([45, 40, 55])).toBe(true);
  });
});
