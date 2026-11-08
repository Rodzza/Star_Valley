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

export interface CartVisit {
  where: string;
  hours: string;
}

/**
 * Carrinho de Viagem (Stardew Valley Wiki, versão 1.6): sexta e domingo, 6h às 20h, na Floresta
 * Cindersap. Também todo dia no Festival do Deserto (Primavera 15–17, 12h às 2h) e no Mercado
 * Noturno (Inverno 15–17, 17h às 2h).
 */
export function cartOn({ season, day }: GameDay): CartVisit | null {
  if (season === 'spring' && day >= 15 && day <= 17) return { where: 'Festival do Deserto', hours: '12h às 2h' };
  if (season === 'winter' && day >= 15 && day <= 17) return { where: 'Mercado Noturno, na praia', hours: '17h às 2h' };
  const w = weekdayOf(day);
  if (w === 'Sex' || w === 'Dom') return { where: 'Floresta Cindersap, ao sul da fazenda', hours: '6h às 20h' };
  return null;
}

/** Próximo dia (a partir de amanhã) em que o carrinho aparece. */
export function nextCart(d: GameDay): { day: GameDay; visit: CartVisit } {
  let cur = d;
  for (let i = 0; i < 14; i++) {
    cur = nextDay(cur);
    const visit = cartOn(cur);
    if (visit) return { day: cur, visit };
  }
  throw new Error('carrinho sem próxima visita'); // não acontece: toda semana tem sexta
}

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

  const carrinho = cartOn(d);
  if (carrinho) {
    lines.push(`🛒 Carrinho de Viagem hoje: ${carrinho.where}, ${carrinho.hours}`);
  } else {
    const prox = nextCart(d);
    const quando = prox.day.season === d.season ? `${weekdayOf(prox.day.day)}, dia ${prox.day.day}` : dayTitle(prox.day);
    lines.push(`🛒 Próximo Carrinho de Viagem: ${quando}`);
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

  lines.push('Mude o dia no Valley Notes para atualizar.');
  return { title: dayTitle(d), lines };
}

/** Dias a partir de `d`: o próprio dia e os seguintes (`count` no total). */
export function upcomingDays(d: GameDay, count: number): GameDay[] {
  const out: GameDay[] = [d];
  while (out.length < count) out.push(nextDay(out[out.length - 1]!));
  return out;
}

/** O dia `steps` dias depois de `d`. */
export function advanceDays(d: GameDay, steps: number): GameDay {
  let cur = d;
  for (let i = 0; i < steps; i++) cur = nextDay(cur);
  return cur;
}
