import { describe, expect, it } from 'vitest';
import data from '../data/villagers.json';
import { FESTIVALS } from '../data/festivals';
import { busyDays, eventsOn, weekdayOf } from './calendar';
import type { Villager } from './villagers';

const villagers = (data as unknown as { villagers: Villager[] }).villagers;

describe('calendário', () => {
  it('dia 1, 8, 15 e 22 são segunda; dia 7 é domingo', () => {
    expect([1, 8, 15, 22].map(weekdayOf)).toEqual(['Seg', 'Seg', 'Seg', 'Seg']);
    expect(weekdayOf(7)).toBe('Dom');
    expect(weekdayOf(28)).toBe('Dom');
  });
  it('encontra aniversário e festival no mesmo dia', () => {
    const e = eventsOn('spring', 13, villagers);
    expect(e.festivals.map((f) => f.name)).toContain('Festival dos Ovos');
    expect(eventsOn('winter', 23, villagers).birthdays.map((v) => v.name)).toEqual(['Leah']);
  });
  it('festivais de vários dias aparecem em todos os dias', () => {
    for (const d of [15, 16, 17]) expect(eventsOn('winter', d, villagers).festivals.map((f) => f.name)).toContain('Mercado Noturno');
    expect(eventsOn('winter', 18, villagers).festivals).toHaveLength(0);
  });
  it('festivais têm datas válidas', () => {
    for (const f of FESTIVALS) {
      expect(f.from, f.name).toBeGreaterThanOrEqual(1);
      expect(f.to, f.name).toBeLessThanOrEqual(28);
      expect(f.to, f.name).toBeGreaterThanOrEqual(f.from);
    }
  });
  it('todo aniversário aparece em algum dia (34 no total)', () => {
    const total = (['spring', 'summer', 'fall', 'winter'] as const).flatMap((s) => busyDays(s, villagers)).reduce((n, d) => n + d.birthdays.length, 0);
    expect(total).toBe(villagers.length);
  });
});
