import { BOWL_POINTS, MAX_POINTS, PET_POINTS, POINTS_PER_HEART } from '../data/pets';

/** Pontos mínimos para ter `hearts` corações (0–5). */
export const pointsForHearts = (hearts: number): number => Math.max(0, Math.min(5, hearts)) * POINTS_PER_HEART;

/**
 * Dias até a amizade máxima (1000) a partir de `hearts` corações cheios.
 * Carinho dá 12 por dia; encher a tigela soma 6 (chuva enche sozinha, então conta igual).
 */
export function daysToMax(hearts: number, fillsBowl: boolean): number {
  const missing = MAX_POINTS - pointsForHearts(hearts);
  if (missing <= 0) return 0;
  return Math.ceil(missing / (PET_POINTS + (fillsBowl ? BOWL_POINTS : 0)));
}

/** Converte dias do jogo em "X estações e Y dias" (28 dias por estação). */
export function daysLabel(days: number): string {
  if (days <= 0) return 'já está no máximo';
  const seasons = Math.floor(days / 28);
  if (!seasons) return `${days} ${days === 1 ? 'dia' : 'dias'}`;
  const rest = days % 28;
  const parts: string[] = [];
  if (seasons) parts.push(`${seasons} ${seasons === 1 ? 'estação' : 'estações'}`);
  if (rest) parts.push(`${rest} ${rest === 1 ? 'dia' : 'dias'}`);
  return `${days} dias (${parts.join(' e ')})`;
}
