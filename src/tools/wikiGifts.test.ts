import { describe, expect, it } from 'vitest';
import {
  parseExceptions,
  parseGiftsPage,
  parsePiece,
  parseVillagerPage,
  splitTopLevel,
  tasteFromLabel,
} from './wikiGifts';
import type { WikiPage } from './wikiCrops';

const page = (title: string, text: string): WikiPage => ({ title, timestamp: '2026-10-15T00:00:00Z', contributor: 'x', text });
const names = (r: ReturnType<typeof parseVillagerPage>, t: 'love' | 'like' | 'neutral' | 'dislike' | 'hate') => {
  if (!r.ok) throw new Error(r.reason);
  return r.value.tastes[t].map((e) => e.name);
};

describe('rótulos e peças', () => {
  it('reconhece rótulos de gosto em variações', () => {
    expect(tasteFromLabel("'''Loved:'''")).toBe('love');
    expect(tasteFromLabel('Loved gifts')).toBe('love');
    expect(tasteFromLabel(" '''Hate''' ")).toBe('hate');
    expect(tasteFromLabel('Disliked')).toBe('dislike');
    expect(tasteFromLabel('Birthday')).toBeNull();
  });

  it('divide vírgulas só fora de parênteses e links', () => {
    expect(splitTopLevel('[[Jelly]] (Blackberry, Blueberry), [[Juice]] (Tomato)')).toHaveLength(2);
  });

  it('lê item, qualificador, grupo e universal', () => {
    expect(parsePiece('[[Jelly]] (Blackberry, Hot Pepper)')).toEqual({ kind: 'item', name: 'Jelly', note: 'Blackberry, Hot Pepper' });
    expect(parsePiece('[[Pickle]]s (Corn)')).toMatchObject({ kind: 'item', name: 'Pickle' });
    expect(parsePiece('{{item|Summer Spangle|Spangle|1}}')).toEqual({ kind: 'item', name: 'Summer Spangle' });
    expect(parsePiece('Baryte')).toEqual({ kind: 'item', name: 'Baryte' });
    expect(parsePiece('All [[Egg|Eggs]] (Except Void)')).toEqual({ kind: 'group', label: 'All Eggs (Except Void)' });
    expect(parsePiece("* '''All Universal Loves'''")).toEqual({ kind: 'universal', taste: 'love' });
    expect(parsePiece('')).toBeNull();
  });
});

describe('formatos de página de personagem', () => {
  it('lista em linha (Emily)', () => {
    const r = parseVillagerPage(
      page(
        'Emily',
        `==Gifts==\n\n===Loved:===\n"Fabulous!"\n[[Amethyst]], [[Cloth]]\n\n===Liked:===\n"Nice"\n[[Apple]]\n\n===Hate===\n"Ugh"\nAll [[Universal Hates]], [[Fish Taco]]\n\n===Birthday===\n"Thanks"`,
      ),
    );
    expect(names(r, 'love')).toEqual(['Amethyst', 'Cloth']);
    expect(names(r, 'like')).toEqual(['Apple']);
    expect(names(r, 'hate')).toEqual(['Fish Taco']);
  });

  it('tabelas recolhíveis com bullets {{item}} (Penny)', () => {
    const r = parseVillagerPage(
      page(
        'Penny',
        `==Gifts==\n{| class="wikitable"\n! colspan="2"| Love\n|-\n| colspan="2"| {{quote|Thank you!|Penny}}\n\n|-\n|\n* {{item|Diamond|1}}\n* {{item|Melon|1}}\n|}\n\n{| class="wikitable"\n! colspan="2"| Like\n|-\n|{{quote|Looks special|Penny}}\n\n|- valign="top"\n| style="width: 50%" |\n* {{item|Apple|1}}\n|\n* {{item|Corn|1}}\n|}`,
      ),
    );
    expect(names(r, 'love')).toEqual(['Diamond', 'Melon']);
    expect(names(r, 'like')).toEqual(['Apple', 'Corn']);
  });

  it('fala e lista na mesma linha (Sam)', () => {
    const r = parseVillagerPage(
      page('Sam', `==Gifts==\n==='''Love'''===\n''"Aw, yea!"'' <br>[[Cactus Fruit]], [[Pizza]]\n\n==='''Like'''===\n''"Thanks"'' <br>[[Apple]]`),
    );
    expect(names(r, 'love')).toEqual(['Cactus Fruit', 'Pizza']);
    expect(names(r, 'like')).toEqual(['Apple']);
  });

  it('tabela de itens com coluna de origem (Abigail) ignora a origem e lê grupos universais', () => {
    const r = parseVillagerPage(
      page(
        'Abigail',
        `=== Loved Gifts ===\n{|class="article-table"\n!icon\n!Item Group\n!Exceptions\n|-\n|style="text-align:center"|'''•'''\n|All [[Universal Loves]]\n|\n|}\n\n{|class="article-table"\n!icon\n!Item\n!Source\n|-\n|[[File:Amethyst.png|20px|link=]]\n|[[Amethyst]]\n|The ocean on sunny Summer days\n|-\n|[[File:Pumpkin.png|20px|link=]]\n|[[Pumpkin]]\n|{{Item|Pumpkin Seeds|13 days}}\n|}\n`,
      ),
    );
    expect(names(r, 'love')).toEqual(['Amethyst', 'Pumpkin']);
  });

  it('tabela com cabeçalho "Name" e células de texto (Willy)', () => {
    const r = parseVillagerPage(
      page(
        'Willy',
        `== Gifts ==\n=== Love ===\n{| class="fandom-table"\n!Image\n!Name\n!Description\n!Source\n|-\n|\n| colspan="3" |\n* '''All Universal Loves'''\n|-\n|\n|Catfish\n|An uncommon fish.\n|Fishing\n|-\n|\n|''Iridium Bar''\n|A bar.\n|Furnace\n|}`,
      ),
    );
    expect(names(r, 'love')).toEqual(['Catfish', 'Iridium Bar']);
  });

  it('tabela com células "!" (Kent)', () => {
    const r = parseVillagerPage(
      page(
        'Kent',
        `==Gifts==\n=== '''Love''' ===\n"Thanks"\n{| class="article-table"\n!Item\n!Name\n!Description\n|-\n![[File:A.png|thumb|40x40px]]\n![[Rabbit's Foot]]\n!Some say it's lucky.\n|}`,
      ),
    );
    expect(names(r, 'love')).toEqual(["Rabbit's Foot"]);
  });

  it('recusa páginas sem seção de amados', () => {
    const r = parseVillagerPage(page('Gil', '==Appearance==\nSome text'));
    expect(r.ok).toBe(false);
  });
});

describe('página Gifts', () => {
  const gifts = page(
    'Gifts',
    `== Universal Loves ==\n{|\n!icon\n!Items\n!Sources\n!Villager Exceptions\n|-\n|[[File:Pearl.png|30px|link=]]\n|[[Pearl]]\n|{{Item|Artifact Trove|3.6%}}\n|\n|-\n|[[File:Prismatic Shard.png|30px|link=]]\n|[[Prismatic Shard]]\n|{{Item|Mystic Stone|25%}}\n|{{Icon|Haley}} hates this.\n|}\n\n== Universal Hates ==\n{|\n!icon\n!Items\n!Villager Exceptions\n|-\n|[[File:Dragon Tooth.png|30px|link=]]\n|[[Dragon Tooth]]\n|{{Icon|Leo}} likes this.\n|}\n\n== References ==\n`,
  );

  it('lê itens universais e exceções por personagem', () => {
    const u = parseGiftsPage(gifts);
    expect(u?.universal.love.map((e) => e.name)).toEqual(['Pearl', 'Prismatic Shard']);
    expect(u?.universal.hate.map((e) => e.name)).toEqual(['Dragon Tooth']);
    expect(u?.exceptions['prismatic shard']).toEqual({ Haley: 'hate' });
    expect(u?.exceptions['dragon tooth']).toEqual({ Leo: 'like' });
  });

  it('entende várias exceções na mesma célula', () => {
    expect(
      parseExceptions('{{Icon|Elliott}} and {{Icon|Leo}} love this.<br/>{{Icon|Harvey}} likes this.<br/>{{Icon|Penny}} dislikes this.<br/>{{Icon|Linus}} is neutral.'),
    ).toEqual([
      { villager: 'Elliott', taste: 'love' },
      { villager: 'Leo', taste: 'love' },
      { villager: 'Harvey', taste: 'like' },
      { villager: 'Penny', taste: 'dislike' },
      { villager: 'Linus', taste: 'neutral' },
    ]);
  });

  it('devolve null se não há seções universais', () => {
    expect(parseGiftsPage(page('Gifts', '== Other =='))).toBeNull();
  });
});

describe('sujeiras do wikitexto', () => {
  it('remove blockquote e converte link externo em item', () => {
    const r = parseVillagerPage(
      page('Leo', `== Gifts ==\n=== Love ===\n[[Diamond]]\n=== Hate ===\n<blockquote>"Gross!" </blockquote>All Universal Hates, [https://x.test/Bat_Wing?so=search Bat Wing], [[Clam]].`),
    );
    expect(names(r, 'hate')).toEqual(['Bat Wing', 'Clam']);
  });
});
