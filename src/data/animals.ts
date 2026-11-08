/**
 * Animais da fazenda (Stardew Valley 1.6). Valores-base de venda (qualidade normal, sem profissão).
 * Nomes traduzidos por nós.
 */
export type AnimalHome = 'coop' | 'barn';

export interface AnimalProduct {
  name: string;
  value: number;
  note?: string;
}

export interface FarmAnimal {
  id: string;
  pt: string;
  emoji: string;
  home: AnimalHome;
  /** Construção mínima. */
  building: string;
  /** Preço na Marnie; null = não se compra. */
  price: number | null;
  howToGet?: string;
  /** A cada quantos dias dá produto. */
  everyDays: number;
  product: AnimalProduct;
  extra?: AnimalProduct;
  /** Produto artesanal e a máquina. */
  artisan?: AnimalProduct & { machine: string };
}

export const ANIMALS: readonly FarmAnimal[] = [
  {
    id: 'chicken', pt: 'Galinha', emoji: '🐔', home: 'coop', building: 'Galinheiro', price: 800, everyDays: 1,
    product: { name: 'Ovo', value: 50, note: 'Ovo Grande: 95g' },
    artisan: { name: 'Maionese', value: 190, machine: 'Máquina de Maionese' },
  },
  {
    id: 'duck', pt: 'Pato', emoji: '🦆', home: 'coop', building: 'Galinheiro Grande', price: 1200, everyDays: 2,
    product: { name: 'Ovo de Pato', value: 95 },
    extra: { name: 'Pena de Pato', value: 250, note: 'com amizade alta' },
    artisan: { name: 'Maionese de Pato', value: 375, machine: 'Máquina de Maionese' },
  },
  {
    id: 'void-chicken', pt: 'Galinha do Vazio', emoji: '🐓', home: 'coop', building: 'Galinheiro Grande', price: null, everyDays: 1,
    howToGet: 'Choque um Ovo do Vazio na chocadeira. O Krobus, nos esgotos, vende o ovo.',
    product: { name: 'Ovo do Vazio', value: 65 },
    artisan: { name: 'Maionese do Vazio', value: 275, machine: 'Máquina de Maionese' },
  },
  {
    id: 'rabbit', pt: 'Coelho', emoji: '🐰', home: 'coop', building: 'Galinheiro Deluxe', price: 8000, everyDays: 4,
    product: { name: 'Lã', value: 340 },
    extra: { name: 'Pé de Coelho', value: 565, note: 'com amizade alta' },
    artisan: { name: 'Tecido', value: 470, machine: 'Tear' },
  },
  {
    id: 'dinosaur', pt: 'Dinossauro', emoji: '🦖', home: 'coop', building: 'Galinheiro Grande', price: null, everyDays: 7,
    howToGet: 'Choque um Ovo de Dinossauro na chocadeira. O ovo aparece em pontos de artefato e nas minas.',
    product: { name: 'Ovo de Dinossauro', value: 350 },
    artisan: { name: 'Maionese de Dinossauro', value: 800, machine: 'Máquina de Maionese' },
  },
  {
    id: 'cow', pt: 'Vaca', emoji: '🐄', home: 'barn', building: 'Estábulo', price: 1500, everyDays: 1,
    product: { name: 'Leite', value: 125, note: 'Leite Grande: 190g' },
    artisan: { name: 'Queijo', value: 230, machine: 'Prensa de Queijo' },
  },
  {
    id: 'goat', pt: 'Cabra', emoji: '🐐', home: 'barn', building: 'Estábulo Grande', price: 4000, everyDays: 2,
    product: { name: 'Leite de Cabra', value: 225, note: 'Leite de Cabra Grande: 345g' },
    artisan: { name: 'Queijo de Cabra', value: 400, machine: 'Prensa de Queijo' },
  },
  {
    id: 'sheep', pt: 'Ovelha', emoji: '🐑', home: 'barn', building: 'Estábulo Deluxe', price: 8000, everyDays: 3,
    product: { name: 'Lã', value: 340, note: 'precisa de tesoura' },
    artisan: { name: 'Tecido', value: 470, machine: 'Tear' },
  },
  {
    id: 'pig', pt: 'Porco', emoji: '🐖', home: 'barn', building: 'Estábulo Deluxe', price: 16000, everyDays: 1,
    product: { name: 'Trufa', value: 625, note: 'cava fora do estábulo; não sai na chuva nem no inverno' },
    artisan: { name: 'Óleo de Trufa', value: 1065, machine: 'Máquina de Óleo' },
  },
  {
    id: 'ostrich', pt: 'Avestruz', emoji: '🪶', home: 'barn', building: 'Estábulo', price: null, everyDays: 7,
    howToGet: 'Choque um Ovo de Avestruz na Incubadora de Avestruz, colocada dentro do Estábulo. O ovo e a receita da incubadora vêm da Ilha Gengibre (Escritório de Campo).',
    product: { name: 'Ovo de Avestruz', value: 600 },
  },
];

export const ARTISAN_BONUS = 1.4;

/** Ouro por dia por animal: produto normal, ou o artesanal se houver. */
export const goldPerDay = (a: FarmAnimal, artisan: boolean, artisanProfession = false): number => {
  const base = artisan && a.artisan ? a.artisan.value * (artisanProfession ? ARTISAN_BONUS : 1) : a.product.value;
  return base / a.everyDays;
};
