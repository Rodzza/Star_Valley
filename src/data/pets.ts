/**
 * Pets (Stardew Valley 1.6), conforme a wiki oficial: https://wiki.stardewvalley.net/Pet
 * Textos e nomes em português; sem artes do jogo (só emoji).
 */
export type PetKind = 'cat' | 'dog' | 'turtle';

export interface PetGift {
  item: string;
  /** Chance dentro do presente, em %, depois dos 20% de o pet trazer algo. */
  chance: number;
}

export interface PetKindInfo {
  kind: PetKind;
  label: string;
  emoji: string;
  styles: number;
  howToGet: string;
  hat: boolean;
  gifts: PetGift[];
}

export const MAX_POINTS = 1000;
export const POINTS_PER_HEART = 200;
export const PET_POINTS = 12;
export const BOWL_POINTS = 6;
export const NO_BOWL_PENALTY = 10;
export const GIFT_CHANCE = 20;

export const PET_KINDS: readonly PetKindInfo[] = [
  {
    kind: 'cat',
    label: 'Gato',
    emoji: '🐱',
    styles: 5,
    howToGet: 'O primeiro vem com a Marnie, se você escolheu gato ao criar o personagem. Outros: licença na Fazenda da Marnie, 40.000g.',
    hat: true,
    gifts: [
      { item: 'Peixe de rio da montanha (exceto Lenda)', chance: 34.4 },
      { item: 'Peixe de rio da floresta (exceto Gobião e Peixe-geleira)', chance: 34.4 },
      { item: 'Asa de Morcego (2)', chance: 6.8 },
      { item: 'Camarão', chance: 5.7 },
      { item: 'Caracol', chance: 5.7 },
      { item: 'Litorina', chance: 5.7 },
      { item: 'Queijo', chance: 3.4 },
      { item: 'Pé de Coelho', chance: 1.7 },
      { item: 'Pena de Pato', chance: 1.7 },
    ],
  },
  {
    kind: 'dog',
    label: 'Cachorro',
    emoji: '🐶',
    styles: 5,
    howToGet: 'O primeiro vem com a Marnie, se você escolheu cachorro ao criar o personagem. Outros: licença na Fazenda da Marnie, 40.000g.',
    hat: true,
    gifts: [
      { item: 'Fragmento de Osso (3–4)', chance: 31 },
      { item: 'Argila (2)', chance: 15.5 },
      { item: 'Madeira de Lei', chance: 15.5 },
      { item: 'Madeira Flutuante', chance: 15.5 },
      { item: 'Pedra', chance: 15.5 },
      { item: 'Ânfora Lascada, Ponta de Flecha ou Baú de Artefatos (cada)', chance: 0.78 },
      { item: 'Um artefato raro (Ovo de Dinossauro, Boneca Antiga…; cada)', chance: 0.28 },
      { item: 'Um osso pré-histórico (crânio, tíbia…; cada)', chance: 0.22 },
    ],
  },
  {
    kind: 'turtle',
    label: 'Tartaruga',
    emoji: '🐢',
    styles: 2,
    howToGet: 'Só por licença na Fazenda da Marnie: 60.000g ou 500.000g, conforme a variedade.',
    hat: false,
    gifts: [
      { item: 'Amêijoa', chance: 21.74 },
      { item: 'Coral', chance: 21.74 },
      { item: 'Ouriço-do-mar', chance: 21.74 },
      { item: 'Concha de Náutilo', chance: 10.87 },
      { item: 'Concha Arco-íris', chance: 4.35 },
      { item: 'Água-viva do Mar', chance: 4.35 },
      { item: 'Água-viva da Caverna', chance: 3.26 },
      { item: 'Lagosta, Lagostim, Caranguejo, Berbigão ou Mexilhão (cada)', chance: 2.17 },
      { item: 'Pudim de Espuma do Mar', chance: 1.09 },
    ],
  },
];

export const PET_KIND: Readonly<Record<PetKind, PetKindInfo>> = Object.fromEntries(
  PET_KINDS.map((k) => [k.kind, k]),
) as Record<PetKind, PetKindInfo>;
