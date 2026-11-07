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
