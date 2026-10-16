import { FESTIVALS, type Festival } from '../data/festivals';
import type { SeasonKey, Villager } from './villagers';

export const SEASON_ORDER: readonly SeasonKey[] = ['spring', 'summer', 'fall', 'winter'];
export const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;
export const DAYS_IN_SEASON = 28;

/** Toda estação começa numa segunda-feira: dia 1 = Seg, dia 8 = Seg... */
export const weekdayOf = (day: number): (typeof WEEKDAYS)[number] => WEEKDAYS[(day - 1) % 7] as (typeof WEEKDAYS)[number];

export interface DayEvents {
  festivals: Festival[];
  birthdays: Villager[];
}

export function eventsOn(season: SeasonKey, day: number, villagers: readonly Villager[]): DayEvents {
  return {
    festivals: FESTIVALS.filter((f) => f.season === season && day >= f.from && day <= f.to),
    birthdays: villagers.filter((v) => v.birthday.season === season && v.birthday.day === day),
  };
}

/** Dias da estação que têm algum evento, em ordem. */
export function busyDays(season: SeasonKey, villagers: readonly Villager[]): Array<{ day: number } & DayEvents> {
  const out: Array<{ day: number } & DayEvents> = [];
  for (let day = 1; day <= DAYS_IN_SEASON; day++) {
    const e = eventsOn(season, day, villagers);
    if (e.festivals.length || e.birthdays.length) out.push({ day, ...e });
  }
  return out;
}
