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
