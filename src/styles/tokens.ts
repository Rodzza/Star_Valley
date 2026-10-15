/**
 * Todas as cores do app ficam aqui. Nenhuma tela usa cor direta: só `var(--...)`.
 * O teste tokens.test.ts falha se algum par texto/fundo ficar abaixo de 4,5:1 (WCAG AA).
 */
export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  onAccent: string;
  accentText: string; // acento usado como cor de TEXTO sobre bg/surface
  warnBg: string;
  warnText: string;
  lockedText: string;
  border: string;
}

export const dark: Palette = {
  bg: '#101a24',
  surface: '#1b2a38',
  surfaceAlt: '#243647',
  text: '#eef3f7',
  textMuted: '#b4c2cf',
  accent: '#5cc28a',
  onAccent: '#08251a',
  accentText: '#7fd6a5',
  warnBg: '#3a2f12',
  warnText: '#ffe6a3',
  lockedText: '#c9b8ff',
  border: '#3a4f63',
};

export const light: Palette = {
  bg: '#f6f4ec',
  surface: '#ffffff',
  surfaceAlt: '#ece9dd',
  text: '#1d2b36',
  textMuted: '#4a5b69',
  accent: '#1f7a4d',
  onAccent: '#ffffff',
  accentText: '#17613c',
  warnBg: '#fff3cf',
  warnText: '#5c4200',
  lockedText: '#4b3a9a',
  border: '#b9c2c9',
};

/** Pares (texto, fundo) que precisam ter contraste mínimo de 4,5:1. */
export const TEXT_PAIRS: ReadonlyArray<readonly [keyof Palette, keyof Palette]> = [
  ['text', 'bg'],
  ['text', 'surface'],
  ['text', 'surfaceAlt'],
  ['textMuted', 'bg'],
  ['textMuted', 'surface'],
  ['textMuted', 'surfaceAlt'],
  ['accentText', 'bg'],
  ['accentText', 'surface'],
  ['onAccent', 'accent'],
  ['warnText', 'warnBg'],
  ['lockedText', 'surface'],
  ['lockedText', 'bg'],
];

const toVar = (k: string) => `--${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

export function applyPalette(p: Palette, root: HTMLElement = document.documentElement): void {
  for (const [k, v] of Object.entries(p)) root.style.setProperty(toVar(k), v);
}

export function preferredPalette(): Palette {
  const prefersDark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? dark : light;
}
