import { describe, expect, it } from 'vitest';
import giftsJson from '../data/gifts.json';
import type { GiftData } from './gifts';
import { itemEmoji, itemLabel } from './items';

const gifts = giftsJson as unknown as GiftData;
const destaque = new Set<string>();
for (const v of gifts.villagers) for (const e of [...v.tastes.love, ...v.tastes.like]) destaque.add(e.name);
for (const e of gifts.universal.love) destaque.add(e.name);

describe('itens de presente', () => {
  it('todo item amado ou apreciado tem nome em português', () => {
    const semTraducao = [...destaque].filter((n) => itemLabel(n) === n && !/^(Bruschetta|Coral|Jade|Joja Cola|Lingcod|Pale Ale|Pizza|Poi|Sashimi)$/.test(n));
    expect(semTraducao).toEqual([]);
  });

  it('dá ícones de categorias diferentes', () => {
    expect(itemEmoji('Wine')).toBe('🍷');
    expect(itemEmoji('Diamond')).toBe('💎');
    expect(itemEmoji('Pumpkin Soup')).toBe('🍲');
    expect(itemEmoji('Sturgeon')).toBe('🐟');
    expect(itemEmoji('Pumpkin')).toBe('🎃');
    expect(itemEmoji('Parsnip')).toBe('🥕');
    expect(itemEmoji('Void Egg')).toBe('🥚');
    expect(itemEmoji('Eggplant')).toBe('🍆');
    expect(itemEmoji('Sashimi')).toBe('🍣');
    expect(itemEmoji('Starfruit')).toBe('🥕');
    expect(itemEmoji('Truffle Oil')).toBe('🧺');
  });

  it('usa os nomes das culturas quando não é item de presente', () => {
    expect(itemLabel('Pumpkin')).toBe('Abóbora');
    expect(itemLabel('Grape')).toBe('Uva');
  });
});

import { BIOS } from '../data/bios';
import villagersJson from '../data/villagers.json';

describe('descrições dos moradores', () => {
  it('só existem para moradores que estão na lista', () => {
    const nomes = new Set((villagersJson as { villagers: { name: string }[] }).villagers.map((v) => v.name));
    expect(Object.keys(BIOS).filter((n) => !nomes.has(n))).toEqual([]);
  });
});

import { noteLabel } from './items';
import type { GiftData as GD } from './gifts';

describe('observações dos presentes', () => {
  it('traduz frases fixas e listas de itens', () => {
    expect(noteLabel('any vegetable')).toBe('qualquer legume');
    expect(noteLabel('All but Void')).toBe('todos, menos o do Vácuo');
    expect(noteLabel('Blackberry, Strawberry')).toBe('Amora, Morango');
  });

  it('nenhuma observação da wiki fica totalmente em inglês', () => {
    const g = giftsJson as unknown as GD;
    const notas = new Set<string>();
    for (const v of g.villagers) for (const lista of Object.values(v.tastes)) for (const e of lista) if (e.note) notas.add(e.note);
    const iguais = [...notas].filter((n) => n !== '1' && noteLabel(n) === n);
    expect(iguais).toEqual([]);
  });
});
