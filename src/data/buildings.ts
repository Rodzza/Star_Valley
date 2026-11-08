/**
 * Construções e reformas (Stardew Valley 1.6). Custos conferidos com guias e com a wiki;
 * nomes traduzidos por nós.
 */
export type Builder = 'robin' | 'wizard';
export type BuildingGroup = 'animais' | 'fazenda' | 'casa' | 'vila' | 'magia';

export interface Building {
  id: string;
  pt: string;
  emoji: string;
  builder: Builder;
  group: BuildingGroup;
  gold: number;
  materials: { item: string; qty: number }[];
  /** Dias de obra; 0 = fica pronto na hora. */
  days: number;
  requires?: string;
  effect: string;
}

export const BUILDINGS: readonly Building[] = [
  // Animais
  { id: 'coop', pt: 'Galinheiro', emoji: '🐔', builder: 'robin', group: 'animais', gold: 4000, materials: [{ item: 'Wood', qty: 300 }, { item: 'Stone', qty: 100 }], days: 3, effect: 'Até 4 aves. Começa com galinhas.' },
  { id: 'big-coop', pt: 'Galinheiro Grande', emoji: '🐔', builder: 'robin', group: 'animais', gold: 10000, materials: [{ item: 'Wood', qty: 400 }, { item: 'Stone', qty: 150 }], days: 3, requires: 'Galinheiro', effect: 'Até 8 aves. Libera patos e a chocadeira.' },
  { id: 'deluxe-coop', pt: 'Galinheiro Deluxe', emoji: '🐔', builder: 'robin', group: 'animais', gold: 20000, materials: [{ item: 'Wood', qty: 500 }, { item: 'Stone', qty: 200 }], days: 3, requires: 'Galinheiro Grande', effect: 'Até 12 aves, alimentação automática. Libera coelhos e dinossauros.' },
  { id: 'barn', pt: 'Estábulo', emoji: '🐄', builder: 'robin', group: 'animais', gold: 6000, materials: [{ item: 'Wood', qty: 350 }, { item: 'Stone', qty: 150 }], days: 3, effect: 'Até 4 animais. Começa com vacas.' },
  { id: 'big-barn', pt: 'Estábulo Grande', emoji: '🐄', builder: 'robin', group: 'animais', gold: 12000, materials: [{ item: 'Wood', qty: 450 }, { item: 'Stone', qty: 200 }], days: 3, requires: 'Estábulo', effect: 'Até 8 animais. Libera cabras e animais podem ter filhotes.' },
  { id: 'deluxe-barn', pt: 'Estábulo Deluxe', emoji: '🐄', builder: 'robin', group: 'animais', gold: 25000, materials: [{ item: 'Wood', qty: 550 }, { item: 'Stone', qty: 300 }], days: 3, requires: 'Estábulo Grande', effect: 'Até 12 animais, alimentação automática. Libera ovelhas e porcos.' },
  { id: 'slime-hutch', pt: 'Viveiro de Gosmas', emoji: '🟢', builder: 'robin', group: 'animais', gold: 10000, materials: [{ item: 'Stone', qty: 500 }, { item: 'Refined Quartz', qty: 10 }, { item: 'Iridium Bar', qty: 1 }], days: 3, effect: 'Cria até 20 gosmas, que soltam bolas de gosma.' },
  { id: 'fish-pond', pt: 'Viveiro de Peixes', emoji: '🐟', builder: 'robin', group: 'animais', gold: 5000, materials: [{ item: 'Stone', qty: 200 }, { item: 'Seaweed', qty: 5 }, { item: 'Green Algae', qty: 5 }], days: 2, effect: 'Cria peixes, que se multiplicam e dão produtos como ovas.' },
  { id: 'stable', pt: 'Cocheira', emoji: '🐴', builder: 'robin', group: 'animais', gold: 10000, materials: [{ item: 'Hardwood', qty: 100 }, { item: 'Iron Bar', qty: 5 }], days: 2, effect: 'Vem com um cavalo para andar mais rápido.' },
  { id: 'pet-bowl', pt: 'Tigela de Pet', emoji: '🥣', builder: 'robin', group: 'animais', gold: 5000, materials: [{ item: 'Hardwood', qty: 25 }], days: 2, effect: 'Uma tigela para cada pet a mais.' },
  // Fazenda
  { id: 'silo', pt: 'Silo', emoji: '🌾', builder: 'robin', group: 'fazenda', gold: 100, materials: [{ item: 'Stone', qty: 100 }, { item: 'Clay', qty: 10 }, { item: 'Copper Bar', qty: 5 }], days: 3, effect: 'Guarda até 240 de feno cortado da grama com a foice.' },
  { id: 'well', pt: 'Poço', emoji: '🪣', builder: 'robin', group: 'fazenda', gold: 1000, materials: [{ item: 'Stone', qty: 75 }], days: 2, effect: 'Enche o regador sem ir até o lago.' },
  { id: 'mill', pt: 'Moinho', emoji: '🌬️', builder: 'robin', group: 'fazenda', gold: 2500, materials: [{ item: 'Stone', qty: 50 }, { item: 'Wood', qty: 150 }, { item: 'Cloth', qty: 4 }], days: 2, effect: 'Transforma trigo em farinha, beterraba em açúcar e arroz não moído em arroz.' },
  { id: 'shed', pt: 'Galpão', emoji: '🛖', builder: 'robin', group: 'fazenda', gold: 15000, materials: [{ item: 'Wood', qty: 300 }], days: 2, effect: 'Espaço coberto para máquinas e barris.' },
  { id: 'big-shed', pt: 'Galpão Grande', emoji: '🛖', builder: 'robin', group: 'fazenda', gold: 20000, materials: [{ item: 'Wood', qty: 550 }, { item: 'Stone', qty: 300 }], days: 2, requires: 'Galpão', effect: 'O dobro de espaço do Galpão.' },
  { id: 'shipping-bin', pt: 'Caixa de Envio', emoji: '📦', builder: 'robin', group: 'fazenda', gold: 250, materials: [{ item: 'Wood', qty: 150 }], days: 0, effect: 'Uma caixa a mais para vender itens.' },
  { id: 'cabin', pt: 'Cabana', emoji: '🏡', builder: 'robin', group: 'fazenda', gold: 100, materials: [{ item: 'Wood', qty: 10 }], days: 0, effect: 'Casa para um jogador a mais no modo cooperativo.' },
  // Casa
  { id: 'house-1', pt: 'Reforma da casa 1: cozinha', emoji: '🍳', builder: 'robin', group: 'casa', gold: 10000, materials: [{ item: 'Wood', qty: 450 }], days: 3, effect: 'Ganha cozinha (para fazer receitas) e geladeira, e a casa fica maior.' },
  { id: 'house-2', pt: 'Reforma da casa 2: quartos', emoji: '🛏️', builder: 'robin', group: 'casa', gold: 65000, materials: [{ item: 'Hardwood', qty: 100 }], days: 3, requires: 'Reforma da casa 1', effect: 'Adiciona quarto das crianças e um quarto extra.' },
  { id: 'house-3', pt: 'Reforma da casa 3: porão', emoji: '🍷', builder: 'robin', group: 'casa', gold: 100000, materials: [], days: 3, requires: 'Reforma da casa 2', effect: 'Ganha o porão, onde barris envelhecem vinho e queijo para subir a qualidade.' },
  // Vila
  { id: 'pam-house', pt: 'Casa nova da Pam', emoji: '🏠', builder: 'robin', group: 'vila', gold: 500000, materials: [{ item: 'Wood', qty: 950 }], days: 3, requires: 'Depois da reforma 3 da casa, fale com a Robin', effect: 'Troca o trailer da Pam e da Penny por uma casa.' },
  { id: 'shortcuts', pt: 'Atalhos da vila', emoji: '🛤️', builder: 'robin', group: 'vila', gold: 300000, materials: [], days: 3, requires: 'Depois da reforma 3 da casa, fale com a Robin', effect: 'Abre atalhos pela vila e arredores.' },
  // Magia (Mago)
  { id: 'earth-obelisk', pt: 'Obelisco da Terra', emoji: '🗿', builder: 'wizard', group: 'magia', gold: 500000, materials: [{ item: 'Iridium Bar', qty: 10 }, { item: 'Earth Crystal', qty: 10 }], days: 0, effect: 'Teleporte para as montanhas.' },
  { id: 'water-obelisk', pt: 'Obelisco da Água', emoji: '🗿', builder: 'wizard', group: 'magia', gold: 500000, materials: [{ item: 'Iridium Bar', qty: 5 }, { item: 'Clam', qty: 10 }, { item: 'Coral', qty: 10 }], days: 0, effect: 'Teleporte para a praia.' },
  { id: 'desert-obelisk', pt: 'Obelisco do Deserto', emoji: '🗿', builder: 'wizard', group: 'magia', gold: 1000000, materials: [{ item: 'Iridium Bar', qty: 20 }, { item: 'Coconut', qty: 10 }, { item: 'Cactus Fruit', qty: 10 }], days: 0, effect: 'Teleporte para o Deserto Calico.' },
  { id: 'island-obelisk', pt: 'Obelisco da Ilha', emoji: '🗿', builder: 'wizard', group: 'magia', gold: 1000000, materials: [{ item: 'Iridium Bar', qty: 10 }, { item: 'Dragon Tooth', qty: 10 }, { item: 'Banana', qty: 10 }], days: 0, requires: 'Ter ido à Ilha Gengibre', effect: 'Teleporte para a fazenda da Ilha Gengibre.' },
  { id: 'junimo-hut', pt: 'Cabana Junimo', emoji: '🛖', builder: 'wizard', group: 'magia', gold: 20000, materials: [{ item: 'Stone', qty: 200 }, { item: 'Starfruit', qty: 9 }, { item: 'Fiber', qty: 100 }], days: 0, requires: 'Concluir o Centro Comunitário', effect: 'Junimos colhem sozinhos as plantações em volta.' },
  { id: 'gold-clock', pt: 'Relógio de Ouro', emoji: '🕰️', builder: 'wizard', group: 'magia', gold: 10000000, materials: [], days: 0, requires: 'Concluir o Centro Comunitário', effect: 'Impede que galhos, pedras e mato apareçam na fazenda e as cercas nunca estragam.' },
];

export const GROUP_LABEL: Record<BuildingGroup, string> = {
  animais: 'Animais',
  fazenda: 'Fazenda',
  casa: 'Casa',
  vila: 'Vila',
  magia: 'Mago',
};
