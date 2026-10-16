import type { SeasonKey } from '../utils/villagers';

export interface Festival {
  name: string;
  season: SeasonKey;
  /** Primeiro e último dia (iguais quando dura um dia só). */
  from: number;
  to: number;
  /** Onde acontece, em português. */
  place: string;
}

/**
 * Festivais do jogo. Digitado à mão (não vem do export da wiki): conferir contra o jogo
 * ou a página "Festivals" da Stardew Valley Wiki antes de publicar.
 */
export const FESTIVALS: readonly Festival[] = [
  { name: 'Festival dos Ovos', season: 'spring', from: 13, to: 13, place: 'Vila Pelicanos' },
  { name: 'Festival do Deserto', season: 'spring', from: 15, to: 17, place: 'Deserto Calico' },
  { name: 'Dança das Flores', season: 'spring', from: 24, to: 24, place: 'Floresta Cindersap' },
  { name: 'Luau', season: 'summer', from: 11, to: 11, place: 'Praia' },
  { name: 'Torneio de Trutas', season: 'summer', from: 20, to: 21, place: 'Floresta Cindersap' },
  { name: 'Dança das Águas-vivas do Luar', season: 'summer', from: 28, to: 28, place: 'Praia' },
  { name: 'Feira do Vale Stardew', season: 'fall', from: 16, to: 16, place: 'Vila Pelicanos' },
  { name: 'Véspera dos Espíritos', season: 'fall', from: 27, to: 27, place: 'Vila Pelicanos' },
  { name: 'Festival do Gelo', season: 'winter', from: 8, to: 8, place: 'Floresta Cindersap' },
  { name: 'Festival da Lula', season: 'winter', from: 12, to: 13, place: 'Praia' },
  { name: 'Mercado Noturno', season: 'winter', from: 15, to: 17, place: 'Praia' },
  { name: 'Festa da Estrela de Inverno', season: 'winter', from: 25, to: 25, place: 'Vila Pelicanos' },
];
