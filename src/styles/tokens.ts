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

/** Paleta tirada da folha de consulta: céu azul, pergaminho dourado, madeira laranja, verde das colinas. */
export const light: Palette = {
  bg: '#a4defd',
  onBg: '#06342d',
  onBgMuted: '#14493f',
  surface: '#ffd889',
  surfaceAlt: '#ffeabb',
  text: '#44220e',
  textMuted: '#7a4a22',
  accent: '#2e7d1f',
  onAccent: '#ffffff',
  accentText: '#2a6a1a',
  warnBg: '#fff1c2',
  warnText: '#5a3200',
  lockedText: '#9a2a00',
  border: '#b9602c',
};

/** Um visual só (o dia no vale), independente do tema do sistema. */
export const dark: Palette = { ...light };

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
