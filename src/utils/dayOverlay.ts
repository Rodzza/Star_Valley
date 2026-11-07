/**
 * Conteúdo do botão flutuante a partir do DIA DO JOGO que o usuário marca no app.
 * Não depende do save (o Android 13+ não deixa nenhum app ler a pasta do jogo).
 */
import type { OverlayContent } from '../save/overlayContent';
import { DAYS_IN_SEASON, eventsOn, weekdayOf } from './calendar';
import { cropLabel } from './cropNames';
import { plantableCrops, type Crop } from './crops';
import type { GiftData } from './gifts';
import { itemLabel } from './items';
import { displayName, seasonLabel, type SeasonKey, type Villager } from './villagers';

export interface GameDay {
  season: SeasonKey;
  day: number;
}

/** Sementes que não se compram normalmente (Semente Rara, só no Carrinho de Viagem): fora da sugestão do dia. */
const SEMENTES_RARAS = new Set(['Sweet Gem Berry']);

const NEXT: Record<SeasonKey, SeasonKey> = { spring: 'summer', summer: 'fall', fall: 'winter', winter: 'spring' };

/** Dia seguinte, virando a estação depois do dia 28. */
export function nextDay({ season, day }: GameDay): GameDay {
  return day >= DAYS_IN_SEASON ? { season: NEXT[season], day: 1 } : { season, day: day + 1 };
}

export function previousDay({ season, day }: GameDay): GameDay {
  if (day > 1) return { season, day: day - 1 };
  const prev = (Object.keys(NEXT) as SeasonKey[]).find((s) => NEXT[s] === season)!;
  return { season: prev, day: DAYS_IN_SEASON };
}

export const dayTitle = (d: GameDay): string => `${weekdayOf(d.day)}, ${d.day} de ${seasonLabel(d.season)}`;

function lovedOf(gifts: GiftData, name: string, max = 3): string {
  const loves = gifts.villagers.find((v) => v.name === name)?.tastes.love ?? [];
  return loves
    .slice(0, max)
    .map((e) => itemLabel(e.name))
    .join(', ');
}

/** Próximo aniversário a partir de amanhã, dentro da mesma estação. */
function nextBirthday(d: GameDay, villagers: readonly Villager[]): { v: Villager; day: number } | null {
  let best: { v: Villager; day: number } | null = null;
  for (const v of villagers) {
    if (v.birthday.season !== d.season || v.birthday.day <= d.day) continue;
    if (!best || v.birthday.day < best.day) best = { v, day: v.birthday.day };
  }
  return best;
}

export function buildDayOverlay(d: GameDay, villagers: readonly Villager[], gifts: GiftData, crops: readonly Crop[]): OverlayContent {
  const lines: string[] = [];
  const hoje = eventsOn(d.season, d.day, villagers);
  const amanha = nextDay(d);
  const eventosAmanha = eventsOn(amanha.season, amanha.day, villagers);

  for (const f of hoje.festivals) lines.push(`🎉 Hoje: ${f.name} (${f.place})`);
  for (const f of eventosAmanha.festivals) if (!hoje.festivals.includes(f)) lines.push(`📅 Amanhã: ${f.name}`);

  if (hoje.birthdays.length) {
    for (const v of hoje.birthdays) {
      const ama = lovedOf(gifts, v.name);
      lines.push(`🎂 Aniversário de ${displayName(v.name)}${ama ? `. Ama: ${ama}` : ''}`);
    }
  } else {
    const prox = nextBirthday(d, villagers);
    if (prox) lines.push(`🎂 Próximo aniversário: ${displayName(prox.v.name)}, dia ${prox.day}`);
  }

  if (d.season === 'winter') {
    lines.push('❄️ Inverno: nada cresce ao ar livre (só na estufa ou na Ilha Gengibre).');
  } else {
    const plano = plantableCrops(crops, d.season, d.day)
      .filter((p) => !SEMENTES_RARAS.has(p.crop.name))
      .slice(0, 3);
    if (plano.length) lines.push(`🌱 Plantando hoje, vale mais: ${plano.map((p) => `${cropLabel(p.crop.name)} (${Math.round(p.goldPerDay)} g/dia)`).join(', ')}`);
    else lines.push('🌱 Não dá mais tempo de colher nada plantado hoje nesta estação.');
  }

  lines.push('Mude o dia no Valley Tracker para atualizar.');
  return { title: dayTitle(d), lines };
}
