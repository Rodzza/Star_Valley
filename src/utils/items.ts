/**
 * Nomes dos itens de presente em português e um ícone genérico por tipo.
 *
 * As traduções seguem os nomes da versão brasileira do jogo até onde conhecidos, mas NÃO foram
 * conferidas uma a uma no jogo: por isso a página do item mostra também o nome original (wiki).
 * Para corrigir, edite ITEM_PT. Os ícones são emojis genéricos de propósito: o app não usa arte do jogo.
 */
import { CROP_PT } from './cropNames';

export const ITEM_PT: Record<string, string> = {
  'Algae Soup': 'Sopa de Algas', Amethyst: 'Ametista', 'Ancient Sword': 'Espada Antiga', Apple: 'Maçã',
  Apricot: 'Damasco', Aquamarine: 'Água-marinha', 'Artichoke Dip': 'Patê de Alcachofra',
  "Autumn's Bounty": 'Fartura do Outono', 'Baked Fish': 'Peixe Assado', 'Banana Pudding': 'Pudim de Banana',
  'Basilisk Paw': 'Pata de Basilisco', 'Battery Pack': 'Bateria', 'Bean Hotpot': 'Ensopado de Feijão',
  Beer: 'Cerveja', Beets: 'Beterraba', Blackberry: 'Amora', 'Blackberry Cobbler': 'Torta de Amora',
  'Blueberry Tart': 'Torta de Mirtilo', 'Bone Flute': 'Flauta de Osso', Bruschetta: 'Bruschetta',
  'Cactus Fruit': 'Fruta de Cacto', 'Carp Surprise': 'Surpresa de Carpa', Catfish: 'Bagre',
  Chanterelle: 'Cantarelo', Cheese: 'Queijo', 'Cheese Cauliflower': 'Couve-flor com Queijo', Cherry: 'Cereja',
  'Chocolate Cake': 'Bolo de Chocolate', Chowder: 'Sopa de Mariscos', Cloth: 'Tecido', Coconut: 'Coco',
  Coffee: 'Café', Coleslaw: 'Salada de Repolho', 'Combat Quarterly': 'Revista Combate Trimestral',
  'Common Mushroom': 'Cogumelo Comum', 'Complete Breakfast': 'Café da Manhã Completo', Cookie: 'Biscoito',
  Cookies: 'Biscoito', 'Copper Bar': 'Barra de Cobre', Coral: 'Coral', 'Crab Cakes': 'Bolinho de Siri',
  Cranberry: 'Oxicoco', 'Cranberry Candy': 'Bala de Oxicoco', 'Cranberry Sauce': 'Molho de Oxicoco',
  'Crispy Bass': 'Robalo Crocante', Crocus: 'Açafrão', 'Crystal Fruit': 'Fruta de Cristal', Daffodil: 'Narciso',
  Dandelion: 'Dente-de-leão', Diamond: 'Diamante', "Dish O' The Sea": 'Prato do Mar', 'Dragon Tooth': 'Dente de Dragão',
  Driftwood: 'Madeira Flutuante', 'Duck Feather': 'Pena de Pato', 'Duck Mayonnaise': 'Maionese de Pato',
  'Dwarf Gadget': 'Engenhoca Anã', 'Dwarf Scroll I': 'Pergaminho Anão I', 'Dwarf scrolls 1-4': 'Pergaminhos Anões I a IV',
  'Dwarvish Helm': 'Elmo Anão', 'Earth Crystal': 'Cristal da Terra', Egg: 'Ovo', 'Eggplant Parmesan': 'Berinjela à Parmegiana',
  Emerald: 'Esmeralda', Escargot: 'Escargô', "Farmer's Lunch": 'Almoço do Fazendeiro', 'Fiddlehead Fern': 'Broto de Samambaia',
  'Fiddlehead Risotto': 'Risoto de Samambaia', 'Fire Quartz': 'Quartzo de Fogo', 'Fish Stew': 'Ensopado de Peixe',
  'Fish Taco': 'Taco de Peixe', 'Fried Calamari': 'Lula Frita', 'Fried Eel': 'Enguia Frita', 'Fried Mushroom': 'Cogumelo Frito',
  'Frog Egg': 'Ovo de Sapo', 'Frozen Tear': 'Lágrima Congelada', 'Fruit Salad': 'Salada de Frutas',
  'Glazed Yams': 'Inhame Glaceado', 'Goat Cheese': 'Queijo de Cabra', 'Goat Milk': 'Leite de Cabra', 'Gold Bar': 'Barra de Ouro',
  'Golden Pumpkin': 'Abóbora Dourada', Grapes: 'Uva', 'Green Tea': 'Chá Verde', Hardwood: 'Madeira de Lei',
  Hashbrowns: 'Batata Rösti', Hazelnut: 'Avelã', Holly: 'Azevinho', Honey: 'Mel', 'Ice Cream': 'Sorvete',
  'Iridium Bar': 'Barra de Irídio', 'Iron Bar': 'Barra de Ferro', 'Jack be Nimble Jack be Thick': 'Livro: Jack Ágil, Jack Forte',
  Jade: 'Jade', Jelly: 'Geleia', 'Joja Cola': 'Joja Cola', Juice: 'Suco', Leek: 'Alho-poró', 'Life Elixir': 'Elixir da Vida',
  Lingcod: 'Lingcod', Lobster: 'Lagosta', 'Lobster Bisque': 'Bisque de Lagosta', 'Magic Rock Candy': 'Pirulito Mágico',
  'Maki Roll': 'Maki', Mango: 'Manga', 'Mango Sticky Rice': 'Arroz Doce com Manga', 'Maple Bar': 'Bomba de Bordo',
  'Maple Syrup': 'Xarope de Bordo', Mayonnaise: 'Maionese', Mead: 'Hidromel', "Miner's Treat": 'Delícia do Minerador',
  'Monster Compendium': 'Compêndio de Monstros', Morel: 'Morchela', 'Nautilus Shell': 'Concha de Náutilo', Nekoite: 'Nekoíta',
  'Oak Resin': 'Resina de Carvalho', Octopus: 'Polvo', Omelet: 'Omelete', 'Omni Geode': 'Geodo Omni', Orange: 'Laranja',
  'Ostrich Egg': 'Ovo de Avestruz', Oyster: 'Ostra', 'Pale Ale': 'Pale Ale', Pancakes: 'Panquecas', Parsnip: 'Chirivia',
  'Parsnip Soup': 'Sopa de Chirivia', Peach: 'Pêssego', Pearl: 'Pérola', 'Pepper Poppers': 'Pimenta Recheada',
  Pickle: 'Conserva', Pickled: 'Conserva', 'Pickled Wheat': 'Conserva de Trigo', Pickles: 'Conserva', 'Pine Tar': 'Piche de Pinho',
  'Pink Cake': 'Bolo Rosa', Pizza: 'Pizza', 'Plum Pudding': 'Pudim de Ameixa', Poi: 'Poi', Pomegranate: 'Romã',
  'Poppyseed Muffin': 'Bolinho de Papoula', 'Preserves Jar': 'Jarra de Conservas', 'Prismatic Shard': 'Fragmento Prismático',
  Pufferfish: 'Baiacu', 'Pumpkin Pie': 'Torta de Abóbora', 'Pumpkin Soup': 'Sopa de Abóbora', 'Purple Mushroom': 'Cogumelo Roxo',
  Quartz: 'Quartzo', "Rabbit's Foot": 'Pé de Coelho', 'Radish Salad': 'Salada de Rabanete', 'Rainbow Shell': 'Concha Arco-íris',
  'Red Plate': 'Prato Vermelho', 'Rhubarb Pie': 'Torta de Ruibarbo', 'Rice Pudding': 'Arroz Doce', 'Rice pudding': 'Arroz Doce',
  'Roasted Hazelnuts': 'Avelãs Torradas', 'Roots Platter': 'Prato de Raízes', Ruby: 'Rubi', Salad: 'Salada',
  'Salmon Dinner': 'Jantar de Salmão', Salmonberry: 'Framboesa-salmão', Sandfish: 'Peixe-areia', Sashimi: 'Sashimi',
  'Sea Cucumber': 'Pepino-do-mar', 'Sea Urchin': 'Ouriço-do-mar', 'Seafoam Pudding': 'Pudim de Espuma do Mar', Snail: 'Caracol',
  'Snow Yam': 'Inhame da Neve', 'Solar Essence': 'Essência Solar', Spaghetti: 'Espaguete', 'Spice Berry': 'Baga Picante',
  'Spicy Eel': 'Enguia Picante', 'Spring Onion': 'Cebolinha', 'Stardrop Tea': 'Chá de Fruta Estelar', 'Stir Fry': 'Refogado',
  Stuffing: 'Recheio', Sturgeon: 'Esturjão', 'Summer Squash': 'Abobrinha', 'Super Meal': 'Super Refeição',
  'Survival Burger': 'Hambúrguer de Sobrevivência', 'Sweet Pea': 'Ervilha-de-cheiro', 'Tiger Trout': 'Truta-tigre',
  'Tom Kha Soup': 'Sopa Tom Kha', Tomato: 'Tomate', Topaz: 'Topázio', Tortilla: 'Tortilha', 'Trout Soup': 'Sopa de Truta',
  Truffle: 'Trufa', 'Truffle Oil': 'Azeite de Trufa', Tulip: 'Tulipa', 'Vegetable Medley': 'Mexido de Legumes',
  'Void Egg': 'Ovo do Vácuo', 'Void Essence': 'Essência do Vácuo', 'Void Mayonnaise': 'Maionese do Vácuo', 'Wild Honey': 'Mel Silvestre',
  'Wild Horseradish': 'Raiz-forte Silvestre', 'Wild Plum': 'Ameixa Silvestre', Wine: 'Vinho', 'Winter Root': 'Raiz de Inverno',
  Wool: 'Lã', Yam: 'Inhame',
};

/** Nome em português (itens de presente, depois culturas); sem tradução, mantém o original. */
export const itemLabel = (name: string): string => ITEM_PT[name] ?? CROP_PT[name] ?? CROP_PT[name.replace(/s$/, '')] ?? name;

/** Ícone genérico por palavras do nome em inglês. A primeira regra que casar vence. */
const ICON_RULES: ReadonlyArray<[RegExp, string]> = [
  [/sashimi|maki/i, '🍣'],
  [/\begg\b(?!plant)/i, '🥚'],
  [/wine|beer|ale|mead|juice|cola|coffee|tea\b/i, '🍷'],
  [/cake|cookie|pudding|pie|cobbler|tart|muffin|candy|ice cream|maple bar|treat/i, '🍰'],
  [/soup|chowder|stew|bisque|hotpot|risotto|spaghetti|pizza|burger|taco|omelet|pancake|breakfast|lunch|dinner|meal|salad|platter|medley|stir fry|stuffing|sashimi|maki|escargot|bruschetta|poppers|hashbrown|dip|parmesan|tortilla|poi|calamari|fried|baked|crispy|glazed|roasted|coleslaw|crab cakes|sticky rice|dish o|carp surprise|bounty/i, '🍲'],
  [/diamond|emerald|ruby|topaz|jade|amethyst|aquamarine|quartz|crystal|tear|shard|nekoite|geode|pearl/i, '💎'],
  [/bar\b|battery|gadget|helm|sword|scroll|flute|tooth|paw|compendium|quarterly|nimble|elixir|essence|plate/i, '🗝️'],
  [/fish|trout|bass|eel|catfish|lingcod|sturgeon|pufferfish|octopus|lobster|oyster|sea urchin|sea cucumber|sandfish|snail|coral|shell|nautilus/i, '🐟'],
  [/mayonnaise|milk|cheese|wool|feather|foot|honey|jelly|pickle|preserves|syrup|\boil\b|resin|pine tar|cloth/i, '🧺'],
  [/mushroom|chanterelle|morel|truffle/i, '🍄'],
  [/rose|tulip|poppy|jazz|crocus|daffodil|dandelion|sweet pea|spangle|sunflower|holly/i, '🌸'],
  [/wood/i, '🪵'],
];
export function itemEmoji(name: string): string {
  for (const [re, icon] of ICON_RULES) if (re.test(name)) return icon;
  return '🥕'; // frutas, legumes e o resto da roça
}
