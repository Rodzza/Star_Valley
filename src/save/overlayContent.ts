import type { ParsedSave, SeasonName } from './parseSave';

const SEASON_PT: Record<SeasonName, string> = { spring: 'Primavera', summer: 'Verão', fall: 'Outono', winter: 'Inverno' };

export const seasonLabel = (s: SeasonName): string => SEASON_PT[s];

export interface OverlayContent {
  title: string;
  lines: string[];
}

/** Texto do botão flutuante a partir do último save importado. */
export function buildOverlayContent(save: ParsedSave): OverlayContent {
  const when = save.date ? `${SEASON_PT[save.date.season]}, dia ${save.date.day} (ano ${save.date.year})` : 'data desconhecida';
  const lines: string[] = [];
  if (save.quests.length === 0) {
    lines.push('Nenhuma missão ativa neste save.');
  }
  for (const q of save.quests) {
    const name = q.title || q.description;
    const extra = q.objective && q.objective !== name ? ` — ${q.objective}` : '';
    const left = q.daysLeft ? ` (${q.daysLeft} ${q.daysLeft === 1 ? 'dia' : 'dias'})` : '';
    lines.push(`• ${name}${extra}${left}`);
  }
  lines.push(`Último save: ${when}. Importe o save de novo para atualizar.`);
  return { title: `Missões ativas · ${save.farmName || save.playerName || 'sua fazenda'}`, lines };
}
