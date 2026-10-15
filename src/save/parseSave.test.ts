import { describe, expect, it } from 'vitest';
import { child, dictEntries, parseSave } from './parseSave';
import { computePerfection, maxedFriends } from './perfection';

const dict = (entries: Array<[string, string]>) =>
  entries.map(([k, v]) => `<item><key><string>${k}</string></key><value>${v}</value></item>`).join('');
const ints = (n: number) => `<int>${n}</int>`;
const fishValue = '<ArrayOfInt><int>3</int><int>20</int></ArrayOfInt>';

import lists from '../data/perfectionLists.json';

function mainSave(over: { fish?: number; cooked?: number; crafted?: number; shipped?: number; allStardrops?: boolean; monsters?: boolean } = {}): string {
  const take = (arr: readonly string[], count: number, value: string, prefix = '') =>
    dict(arr.slice(0, count).map((id) => [prefix + id, value] as [string, string]));
  const monsterXml = over.monsters
    ? dict(Object.entries(lists.monsterGoals).map(([cat, need]) => [Object.entries(lists.monsterCategories).find(([, c]) => c === cat)![0], ints(need)] as [string, string]))
    : dict([['Green Slime', ints(5)]]);
  const stardrops = over.allStardrops ? ['CF_Fair', 'CF_Fish', 'CF_Mines', 'CF_Sewer', 'CF_Spouse', 'CF_Statue', 'museumComplete'] : ['CF_Fair', 'museumComplete'];
  return `<?xml version="1.0" encoding="utf-8"?>
<SaveGame xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <player>
    <items><Item><name>Axe</name></Item></items>
    <name>Rodrigo</name>
    <farmName>Vale &amp; Cia</farmName>
    <farmingLevel>10</farmingLevel><miningLevel>10</miningLevel><combatLevel>5</combatLevel>
    <foragingLevel>10</foragingLevel><fishingLevel>10</fishingLevel><luckLevel>0</luckLevel>
    <questLog>
      <Quest xsi:type="FishingQuest">
        <questTitle>Catch a Pufferfish</questTitle>
        <questDescription>Caitlin needs a Pufferfish.</questDescription>
        <currentObjective>Catch Pufferfish</currentObjective>
        <daysLeft>3</daysLeft>
      </Quest>
      <Quest xsi:type="Quest"><questTitle>Introductions</questTitle><questDescription>Meet people.</questDescription></Quest>
    </questLog>
    <mailReceived>${stardrops.map((m) => `<string>${m}</string>`).join('')}<string>other</string></mailReceived>
    <stats><specificMonstersKilled>${monsterXml}</specificMonstersKilled></stats>
    <fishCaught>${take(lists.fish, over.fish ?? 10, fishValue, '(O)')}</fishCaught>
    <recipesCooked>${take(lists.cooking, over.cooked ?? 20, ints(1))}</recipesCooked>
    <craftingRecipes>${take(lists.crafting, over.crafted ?? 30, ints(2))}${dict([['Never', ints(0)]])}</craftingRecipes>
    <basicShipped>${take(lists.shipped, over.shipped ?? 77, ints(5))}</basicShipped>
    <friendshipData>
      ${dict([
        ['Pierre', '<Friendship><Points>2500</Points><Status>Friendly</Status></Friendship>'],
        ['Abigail', '<Friendship><Points>2000</Points><Status>Friendly</Status></Friendship>'],
        ['Penny', '<Friendship><Points>2000</Points><Status>Dating</Status></Friendship>'],
        ['Sam', '<Friendship><Points>900</Points><Status>Friendly</Status></Friendship>'],
      ])}
    </friendshipData>
  </player>
  <currentSeason>fall</currentSeason><dayOfMonth>12</dayOfMonth><year>2</year>
  <goldenWalnutsFound>65</goldenWalnutsFound><perfectionWaivers>2</perfectionWaivers>
  <locations><GameLocation><buildings>
    <Building><buildingType>Earth Obelisk</buildingType></Building>
    <Building><buildingType>Gold Clock</buildingType></Building>
    <Building><buildingType>Barn</buildingType></Building>
  </buildings></GameLocation></locations>
</SaveGame>`;
}

describe('parseSave (arquivo principal)', () => {
  const r = parseSave(mainSave());
  if (!r.ok) throw new Error(r.reason);
  const s = r.save;

  it('lê jogador e fazenda, ignorando <name> do inventário', () => {
    expect(s.playerName).toBe('Rodrigo');
    expect(s.farmName).toBe('Vale & Cia');
  });
  it('lê data, habilidades e missões', () => {
    expect(s.date).toEqual({ season: 'fall', day: 12, year: 2 });
    expect(s.skills).toMatchObject({ farming: 10, combat: 5 });
    expect(s.quests).toHaveLength(2);
    expect(s.quests[0]).toMatchObject({ type: 'FishingQuest', title: 'Catch a Pufferfish', objective: 'Catch Pufferfish', daysLeft: 3 });
    expect(s.quests[1]?.daysLeft).toBeUndefined();
  });
  it('conta coleções (receitas fabricadas só com valor > 0)', () => {
    expect(s.fishCaught).toHaveLength(10);
    expect(s.fishCaught[0]).toBe(lists.fish[0]); // prefixo "(O)" removido
    expect(s.recipesCooked).toHaveLength(20);
    expect(s.recipesCrafted).toHaveLength(30);
    expect(s.basicShipped).toHaveLength(77);
    expect(s.monstersKilled).toEqual({ 'Green Slime': 5 });
    expect(s.perfectionWaivers).toBe(2);
  });
  it('lê construções e nozes', () => {
    expect(s.obelisks).toEqual(['Earth Obelisk']);
    expect(s.goldClock).toBe(true);
    expect(s.goldenWalnutsFound).toBe(65);
  });
  it('lê amizades', () => {
    expect(s.friends.find((f) => f.name === 'Abigail')).toEqual({ name: 'Abigail', points: 2000, status: 'Friendly' });
  });
});

describe('parseSave (outros casos)', () => {
  it('recusa arquivo que não é save', () => {
    expect(parseSave('<html></html>').ok).toBe(false);
    expect(parseSave('').ok).toBe(false);
  });
  it('aceita SaveGameInfo e avisa o que falta', () => {
    const info = `<Farmer xmlns:xsi="x"><name>Ana</name><farmName>Sítio</farmName><farmingLevel>3</farmingLevel>
      <dayOfMonthForSaveGame>5</dayOfMonthForSaveGame><seasonForSaveGame>1</seasonForSaveGame><yearForSaveGame>1</yearForSaveGame></Farmer>`;
    const r = parseSave(info);
    expect(r.ok && r.save.kind).toBe('info');
    if (r.ok) {
      expect(r.save.date).toEqual({ season: 'summer', day: 5, year: 1 });
      expect(r.save.goldClock).toBeNull();
      expect(r.save.warnings.join(' ')).toMatch(/SaveGameInfo/);
    }
  });
  it('aceita BOM no começo', () => {
    expect(parseSave('﻿' + mainSave()).ok).toBe(true);
  });
  it('child só olha filhos diretos', () => {
    expect(child('<a><x><name>fundo</name></x><name>raso</name></a>'.slice(3, -4), 'name')).toBe('raso');
    expect(dictEntries(undefined)).toEqual([]);
  });
});

describe('perfeição', () => {
  const parse = (x: string) => {
    const r = parseSave(x);
    if (!r.ok) throw new Error(r.reason);
    return r.save;
  };
  const get = (p: ReturnType<typeof computePerfection>, id: string) => p.categories.find((c) => c.id === id)!;

  it('conta amigos no nível máximo (8 corações vale para quem pode namorar)', () => {
    // Pierre 2500 ok; Abigail 2000 (namorável) ok; Penny 2000 (namorável) ok; Sam 900 não.
    expect(maxedFriends(parse(mainSave()))).toBe(3);
  });

  it('calcula pontos por categoria', () => {
    const p = computePerfection(parse(mainSave()));
    expect(get(p, 'level')).toMatchObject({ got: 22, need: 25 }); // (10+10+5+10+10+0)/2
    expect(get(p, 'stardrops')).toMatchObject({ got: 2, need: 7, points: 0 }); // tudo ou nada
    expect(get(p, 'monsters')).toMatchObject({ got: 0, points: 0 });
    expect(get(p, 'clock').points).toBe(10);
    expect(get(p, 'obelisks').points).toBe(1);
    expect(p.measurableMax).toBe(100);
    expect(p.waivers).toBe(2);
    const expected =
      (15 * 77) / lists.shipped.length + 1 + 10 + (11 * 3) / 34 + (5 * 22) / 25 + (10 * 20) / 81 + (10 * 30) / 149 + (10 * 10) / 72 + (5 * 65) / 130;
    expect(p.points).toBeCloseTo(expected, 6);
  });

  it('Gotas de estrela e caça-monstros valem 10 só quando completos', () => {
    const p = computePerfection(parse(mainSave({ allStardrops: true, monsters: true })));
    expect(get(p, 'stardrops').points).toBe(10);
    expect(get(p, 'monsters')).toMatchObject({ got: 12, points: 10 });
  });

  it('o baú da mina 100 também vale como Gota de estrela', () => {
    const xml = mainSave().replace('</player>', '<chestConsumedMineLevels><item><key><int>100</int></key><value><boolean>true</boolean></value></item></chestConsumedMineLevels></player>');
    expect(get(computePerfection(parse(xml)), 'stardrops').got).toBe(3);
  });

  it('itens fora das listas oficiais (mods, lixo) não contam', () => {
    const xml = mainSave().replace('<fishCaught>', '<fishCaught>' + dict([['(O)99999', fishValue]]));
    expect(get(computePerfection(parse(xml)), 'fish').got).toBe(10);
  });

  it('limita cada categoria ao total (nunca passa de 100%)', () => {
    const p = computePerfection(parse(mainSave({ fish: 90, cooked: 100, crafted: 200, shipped: 300 })));
    for (const c of p.categories) expect(c.got).toBeLessThanOrEqual(c.need);
    expect(p.points).toBeLessThanOrEqual(p.measurableMax);
  });

  it('SaveGameInfo deixa obeliscos, relógio e nozes fora da soma', () => {
    const p = computePerfection(parse(`<Farmer><name>Ana</name><farmName>S</farmName></Farmer>`));
    expect(p.measurableMax).toBe(100 - 10 - 4 - 5);
  });
});
