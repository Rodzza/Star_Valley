import { describe, expect, it } from 'vitest';
import villagers from '../data/villagers.json';
import gifts from '../data/gifts.json';
import { parseRelatives, parseVillagerInfo } from './wikiVillagers';
import type { Villager } from '../utils/villagers';

const page = (text: string) => ({ title: 'Teste', timestamp: '', contributor: '', text });

describe('parseRelatives', () => {
  it('lê nome e papel, ignorando ícones', () => {
    const r = parseRelatives('[[File:Pierre Icon.png|20px|link=]] [[Pierre]] (Husband)<br/>[[File:A.png|20px|link=]] [[Abigail]] (Daughter)');
    expect(r).toEqual([
      { name: 'Pierre', role: 'Husband' },
      { name: 'Abigail', role: 'Daughter' },
    ]);
  });
  it('aceita amigo sem link e vazio', () => {
    expect(parseRelatives('Charlie<br/>[[Emily]]')).toEqual([{ name: 'Charlie' }, { name: 'Emily' }]);
    expect(parseRelatives(undefined)).toEqual([]);
  });
});

describe('parseVillagerInfo', () => {
  it('lê aniversário, região, endereço e romanceável', () => {
    const r = parseVillagerInfo(page('{{Starbox villager\n|location = The Beach\n|address = Elliott\'s Cabin\n|marriage = Bachelor\n|birthday = Fall 5\n}}'));
    expect(r.ok && r.value).toMatchObject({ birthday: { season: 'fall', day: 5 }, location: 'The Beach', romanceable: true });
  });
  it('rejeita aniversário impossível (erro de digitação na wiki)', () => {
    expect(parseVillagerInfo(page('{{Starbox villager\n|birthday = Winter 67\n}}')).ok).toBe(false);
  });
});

describe('src/data/villagers.json', () => {
  const list = (villagers as unknown as { villagers: Villager[] }).villagers;
  it('todo morador tem aniversário válido e endereço', () => {
    for (const v of list) {
      expect(v.birthday.day, v.name).toBeGreaterThanOrEqual(1);
      expect(v.birthday.day, v.name).toBeLessThanOrEqual(28);
      expect(v.address, v.name).not.toBe('');
      expect(v.location, v.name).not.toBe('');
    }
  });
  it('não há aniversários repetidos no mesmo dia', () => {
    const seen = new Map<string, string>();
    for (const v of list) {
      const k = `${v.birthday.season}-${v.birthday.day}`;
      expect(seen.get(k), `${v.name} e ${seen.get(k)} no mesmo dia`).toBeUndefined();
      seen.set(k, v.name);
    }
  });
  it('todo morador com presentes em gifts.json existe aqui', () => {
    const names = new Set(list.map((v) => v.name));
    for (const g of (gifts as unknown as { villagers: { name: string }[] }).villagers) expect(names.has(g.name), g.name).toBe(true);
  });
  it('são 12 romanceáveis', () => {
    expect(list.filter((v) => v.romanceable)).toHaveLength(12);
  });
});
