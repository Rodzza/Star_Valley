/**
 * Todas as cores do app ficam aqui. Nenhuma tela usa cor direta: só `var(--...)`.
 * O teste tokens.test.ts falha se algum par texto/fundo ficar abaixo de 4,5:1 (WCAG AA).
 */
export interface Palette {
  bg: string; // céu do entardecer (fundo da página)
  onBg: string; // texto sobre o céu
  onBgMuted: string;
  surface: string; // pergaminho dos painéis
  surfaceAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  onAccent: string;
  accentText: string; // verde usado como cor de TEXTO sobre o pergaminho
  warnBg: string;
  warnText: string;
  lockedText: string;
  border: string; // madeira
}

/** O jogo tem um visual só (entardecer); o tema escuro apenas aprofunda o céu. */
export const light: Palette = {
  bg: '#2f2358',
  onBg: '#fff1d6',
  onBgMuted: '#dccbf0',
  surface: '#f7e3b0',
  surfaceAlt: '#ebc98a',
  text: '#3a2110',
  textMuted: '#6a4421',
  accent: '#78c850',
  onAccent: '#1d2f0c',
  accentText: '#25581a',
  warnBg: '#ffe28a',
  warnText: '#4a2f00',
  lockedText: '#5b2f99',
  border: '#5a2f12',
};

export const dark: Palette = { ...light, bg: '#1d1538' };

/** Pares (texto, fundo) que precisam ter contraste mínimo de 4,5:1. */
export const TEXT_PAIRS: ReadonlyArray<readonly [keyof Palette, keyof Palette]> = [
  ['onBg', 'bg'],
  ['onBgMuted', 'bg'],
  ['text', 'surface'],
  ['text', 'surfaceAlt'],
  ['textMuted', 'surface'],
  ['textMuted', 'surfaceAlt'],
  ['accentText', 'surface'],
  ['accentText', 'surfaceAlt'],
  ['onAccent', 'accent'],
  ['warnText', 'warnBg'],
  ['lockedText', 'surface'],
  ['lockedText', 'surfaceAlt'],
];

const toVar = (k: string) => `--${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

export function applyPalette(p: Palette, root: HTMLElement = document.documentElement): void {
  for (const [k, v] of Object.entries(p)) root.style.setProperty(toVar(k), v);
}

export function preferredPalette(): Palette {
  const prefersDark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? dark : light;
}
