import { describe, expect, it } from 'vitest';
import { allButOne, lovedByAll, normalizeItem, tasteOf, type GiftData, type Taste, type VillagerGifts } from './gifts';

const src = { title: 't', url: 'u', historyUrl: 'h', revisedAt: '' };
const e = (...names: string[]) => names.map((name) => ({ name }));
const tastes = (p: Partial<Record<Taste, string[]>>): VillagerGifts['tastes'] => ({
  love: e(...(p.love ?? [])), like: e(...(p.like ?? [])), neutral: e(...(p.neutral ?? [])),
  dislike: e(...(p.dislike ?? [])), hate: e(...(p.hate ?? [])),
});
const villager = (name: string, p: Partial<Record<Taste, string[]>>): VillagerGifts => ({
  name, source: src, tastes: tastes(p), groups: { love: [], like: [], neutral: [], dislike: [], hate: [] },
});

const penny = villager('Penny', { love: ['Melon', 'Diamond', 'Poppy'], hate: ['Beer'] });
const sam = villager('Sam', { love: ['Pizza', 'Diamond', 'Cookie'], like: ['Melon'] });
const haley = villager('Haley', { love: ['Coconut'] });

const data: GiftData = {
  universal: {
    love: e('Prismatic Shard', 'Pearl'), like: e('Apple'), neutral: [], dislike: [], hate: e('Poppy'),
  },
  exceptions: { 'prismatic shard': { Haley: 'hate' } },
  villagers: [penny, sam, haley],
};

describe('gosto efetivo', () => {
  it('lista do personagem vence o universal', () => {
    expect(tasteOf(data, penny, 'Poppy')).toBe('love');
  });
  it('exceção vence o universal', () => {
    expect(tasteOf(data, haley, 'Prismatic Shard')).toBe('hate');
  });
  it('sem lista nem exceção, vale o universal', () => {
    expect(tasteOf(data, penny, 'Pearl')).toBe('love');
    expect(tasteOf(data, sam, 'Apple')).toBe('like');
  });
  it('item desconhecido', () => {
    expect(tasteOf(data, sam, 'Coal')).toBe('unknown');
  });
  it('ignora maiúsculas e plural simples', () => {
    expect(tasteOf(data, sam, 'cookies')).toBe('love');
    expect(normalizeItem('Glass')).toBe('glass');
  });
});

describe('presente que todos amam', () => {
  it('interseção de amados (inclui amados universais)', () => {
    expect(lovedByAll(data, [penny, sam])).toEqual(['Diamond', 'Pearl', 'Prismatic Shard']);
  });
  it('respeita exceções (Haley odeia Prismatic Shard)', () => {
    expect(lovedByAll(data, [penny, haley])).toEqual(['Pearl']);
  });
  it('um personagem só: tudo que ele ama', () => {
    expect(lovedByAll(data, [sam])).toEqual(['Cookie', 'Diamond', 'Pearl', 'Pizza', 'Prismatic Shard']);
  });
  it('sem personagens, sem resultado', () => {
    expect(lovedByAll(data, [])).toEqual([]);
  });
});

describe('quase lá', () => {
  it('lista itens amados por todos menos um e diz o gosto de quem não ama', () => {
    // Melon: Penny ama, Sam só gosta.
    expect(allButOne(data, [penny, sam])).toEqual([
      { item: 'Cookie', others: [{ villager: 'Penny', taste: 'unknown' }] },
      { item: 'Melon', others: [{ villager: 'Sam', taste: 'like' }] },
      { item: 'Poppy', others: [{ villager: 'Sam', taste: 'hate' }] },
      { item: 'Pizza', others: [{ villager: 'Penny', taste: 'unknown' }] },
    ].sort((a, b) => a.item.localeCompare(b.item)));
  });
  it('precisa de pelo menos dois personagens', () => {
    expect(allButOne(data, [penny])).toEqual([]);
  });
});
