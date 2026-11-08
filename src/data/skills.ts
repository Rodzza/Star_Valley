/**
 * Habilidades e Maestria (Stardew Valley 1.6), conforme a wiki oficial:
 * https://wiki.stardewvalley.net/Skills e https://wiki.stardewvalley.net/Mastery
 * Nomes de itens e profissões traduzidos por nós (podem diferir da tradução oficial do jogo).
 */
export type SkillId = 'farming' | 'mining' | 'foraging' | 'fishing' | 'combat';

export interface Profession {
  name: string;
  effect: string;
}

export interface Skill {
  id: SkillId;
  label: string;
  emoji: string;
  xp: string;
  perLevel: string;
  /** O que cada nível libera (índice 0 = nível 1). Níveis 5 e 10 também dão profissão. */
  unlocks: string[][];
  level5: [Profession, Profession];
  /** Duas opções para cada profissão do nível 5, na mesma ordem. */
  level10: [[Profession, Profession], [Profession, Profession]];
  mastery: { perk: string; rewards: string[] };
}

/** XP total para chegar a cada nível (1 a 10). */
export const XP_TABLE = [100, 380, 770, 1300, 2150, 3300, 4800, 6900, 10000, 15000];

/** Pontos de maestria para cada maestria resgatada (1ª a 5ª). */
export const MASTERY_COST = [10000, 15000, 20000, 25000, 30000];

export const SKILLS: readonly Skill[] = [
  {
    id: 'farming',
    label: 'Cultivo',
    emoji: '🌾',
    xp: 'Colher plantações e cuidar dos animais (fazer carinho, ordenhar, tosquiar e recolher os produtos).',
    perLevel: 'Cada nível melhora o uso da enxada e do regador.',
    unlocks: [
      ['Espantalho', 'Fertilizante Básico'],
      ['Máquina de Maionese', 'Cerca de Pedra'],
      ['Irrigador', 'Casa de Abelhas', 'Acelerador de Crescimento', 'Almoço do Fazendeiro (receita)'],
      ['Jarra de Conservas', 'Solo Retentor Básico', 'Cerca de Ferro'],
      [],
      ['Prensa de Queijo', 'Cerca de Madeira de Lei', 'Irrigador de Qualidade'],
      ['Tear', 'Solo Retentor de Qualidade', 'Máquina de Óleo'],
      ['Barril', 'Acelerador de Crescimento Deluxe'],
      ['Máquina de Sementes', 'Irrigador de Irídio', 'Fertilizante de Qualidade'],
      [],
    ],
    level5: [
      { name: 'Pecuarista', effect: 'Produtos animais valem 20% a mais.' },
      { name: 'Lavrador', effect: 'Plantações valem 10% a mais.' },
    ],
    level10: [
      [
        { name: 'Mestre do Galinheiro', effect: 'Fica amigo das aves mais rápido, chocadeira na metade do tempo e produtos de melhor qualidade.' },
        { name: 'Pastor', effect: 'Fica amigo dos animais do estábulo mais rápido, ovelhas dão lã mais vezes e produtos de melhor qualidade.' },
      ],
      [
        { name: 'Artesão', effect: 'Produtos artesanais (vinho, queijo, geleia…) valem 40% a mais.' },
        { name: 'Agricultor', effect: 'Todas as plantações crescem 10% mais rápido.' },
      ],
    ],
    mastery: {
      perk: 'Animais podem receber Biscoitos Dourados de Animais, que dobram a produção para sempre (menos porcos).',
      rewards: ['Foice de Irídio: colhe qualquer plantação e junta muito feno.', 'Estátua das Bênçãos (receita): uma bênção diferente por dia.'],
    },
  },
  {
    id: 'mining',
    label: 'Mineração',
    emoji: '⛏️',
    xp: 'Quebrar pedras, com picareta, bomba ou qualquer outro jeito.',
    perLevel: 'Cada nível melhora o uso da picareta.',
    unlocks: [
      ['Bomba Cereja'],
      ['Escada'],
      ['Delícia do Minerador (receita)'],
      ['Anel Brilhante', 'Transmutar (Ferro)'],
      [],
      ['Bomba'],
      ['Transmutar (Ouro)'],
      ['Megabomba'],
      ['Cristalário'],
      [],
    ],
    level5: [
      { name: 'Minerador', effect: '+1 minério por veio.' },
      { name: 'Geólogo', effect: '50% de chance de pedras preciosas virem em dobro.' },
    ],
    level10: [
      [
        { name: 'Ferreiro', effect: 'Barras de metal valem 50% a mais.' },
        { name: 'Garimpeiro', effect: 'Dobro de chance de achar carvão.' },
      ],
      [
        { name: 'Escavador', effect: 'Dobro de chance de achar geodos.' },
        { name: 'Gemólogo', effect: 'Minerais e pedras preciosas valem 30% a mais.' },
      ],
    ],
    mastery: {
      perk: 'Pedras com joias dão o dobro de joias.',
      rewards: [
        'Estátua do Rei Anão (receita): escolha um de dois poderes de mineração por dia.',
        'Fornalha Pesada (receita): mais eficiente; cada uso gasta 25 minérios e 3 carvões.',
      ],
    },
  },
  {
    id: 'foraging',
    label: 'Coleta',
    emoji: '🌿',
    xp: 'Pegar itens do chão, cortar árvores e tocos, colher frutas silvestres, peneirar e cavar pontos de artefato.',
    perLevel: 'Cada nível melhora o uso do machado.',
    unlocks: [
      ['Sementes Silvestres (Primavera)', 'Lanche de Campo (receita)'],
      ['Forno de Carvão'],
      ['Kit de Fogueira', 'Sopa de Musgo (receita)'],
      ['Sementes Silvestres (Verão)', 'Extrator de Seiva', 'Tora de Cogumelos'],
      [],
      ['Para-raios', 'Sementes Silvestres (Outono)', 'Totem de Teleporte: Praia'],
      ['Sementes Silvestres (Inverno)', 'Totem de Teleporte: Montanhas', 'Fertilizante de Árvore'],
      ['Hambúrguer de Sobrevivência (receita)', 'Totem de Teleporte: Fazenda', 'Kit de Barraca'],
      ['Totem da Chuva'],
      [],
    ],
    level5: [
      { name: 'Silvicultor', effect: 'Árvores, tocos e toras dão 25% mais madeira.' },
      { name: 'Coletor', effect: '20% de chance de colher o item silvestre em dobro.' },
    ],
    level10: [
      [
        { name: 'Lenhador', effect: 'Árvores podem dar Madeira de Lei.' },
        { name: 'Extrator', effect: 'Xaropes (seiva, bordo…) valem 25% a mais.' },
      ],
      [
        { name: 'Botânico', effect: 'Itens silvestres sempre com a melhor qualidade.' },
        { name: 'Rastreador', effect: 'Mostra onde estão os itens silvestres do mapa.' },
      ],
    ],
    mastery: {
      perk: 'Caixas Misteriosas Douradas, com itens melhores.',
      rewards: [
        'Semente de Árvore Mística (receita): planta uma árvore especial.',
        'Totem do Tesouro (receita): faz aparecer um círculo de pontos de tesouro para cavar.',
      ],
    },
  },
  {
    id: 'fishing',
    label: 'Pesca',
    emoji: '🎣',
    xp: 'Pescar peixes, lixo e algas e recolher os covos (armadilhas de caranguejo).',
    perLevel: 'Cada nível aumenta a barra de pesca, a chance de peixe de qualidade e diminui a espera pela fisgada.',
    unlocks: [
      ['Isca'],
      ['Covo'],
      ['Prato do Mar (receita)'],
      ['Isca Deluxe', 'Caixa de Minhocas', 'Máquina de Reciclagem'],
      [],
      ['Máquina de Isca', 'Girador', 'Boia Armadilha'],
      ['Boia Sonar', 'Boia de Cortiça', 'Caçador de Tesouros'],
      ['Caixa de Minhocas Deluxe', 'Anzol Farpado', 'Girador Enfeitado'],
      ['Pudim de Espuma do Mar (receita)', 'Ímã'],
      [],
    ],
    level5: [
      { name: 'Pescador', effect: 'Peixes valem 25% a mais.' },
      { name: 'Armadilheiro', effect: 'Covos pedem menos material para fazer.' },
    ],
    level10: [
      [
        { name: 'Pescador Mestre', effect: 'Peixes valem 50% a mais.' },
        { name: 'Pirata', effect: 'Dobro de chance de achar tesouro.' },
      ],
      [
        { name: 'Marinheiro', effect: 'Covos nunca pegam lixo.' },
        { name: 'Mestre das Iscas', effect: 'Covos funcionam sem isca.' },
      ],
    ],
    mastery: {
      perk: 'Baús de Tesouro Dourados passam a aparecer na pesca.',
      rewards: [
        'Vara de Irídio Avançada: usa até duas boias ao mesmo tempo.',
        'Isca Desafio (receita): uma pesca perfeita dá o triplo de peixes; cada peixe que escapa diminui a quantidade.',
      ],
    },
  },
  {
    id: 'combat',
    label: 'Combate',
    emoji: '⚔️',
    xp: 'Derrotar monstros.',
    perLevel: 'Alguns níveis aumentam a vida máxima.',
    unlocks: [
      ['Anel Resistente'],
      ['Bife de Inseto'],
      ['Elixir da Vida', 'Travessa de Raízes (receita)'],
      ['Anel do Guerreiro'],
      [],
      ['Prensa de Ovo de Gosma', 'Óleo de Alho'],
      ['Anel de Yoba', 'Anel de Espinhos'],
      ['Incubadora de Gosma', 'Munição Explosiva'],
      ['Anel de Irídio', 'Ravióli com Tinta de Lula (receita)'],
      [],
    ],
    level5: [
      { name: 'Lutador', effect: 'Todo ataque causa 10% a mais de dano e +15 de vida.' },
      { name: 'Batedor', effect: 'Chance de crítico 50% maior.' },
    ],
    level10: [
      [
        { name: 'Bruto', effect: '+15% de dano.' },
        { name: 'Defensor', effect: '+25 de vida máxima.' },
      ],
      [
        { name: 'Acrobata', effect: 'O golpe especial recarrega na metade do tempo.' },
        { name: 'Desesperado', effect: 'Golpes críticos causam o dobro de dano.' },
      ],
    ],
    mastery: {
      perk: 'Ganha um espaço a mais para bijuterias (trinkets), que dão poderes especiais e são achadas nas aventuras.',
      rewards: [
        'Bigorna (receita): reforja bijuterias com atributos aleatórios; cada uso gasta 3 barras de irídio.',
        'Miniforja (receita): uma forja dos anões em casa.',
      ],
    },
  },
];
