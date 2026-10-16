import animais from '../assets/icons/animais.png';
import casa from '../assets/icons/casa.png';
import estacoes from '../assets/icons/estacoes.png';
import ferramentas from '../assets/icons/ferramentas.png';
import habilidades from '../assets/icons/habilidades.png';
import moradores from '../assets/icons/moradores.png';
import pets from '../assets/icons/pets.png';
import primavera from '../assets/icons/primavera.png';
import receitas from '../assets/icons/receitas.png';
import verao from '../assets/icons/verao.png';

/** Ilustrações em pixel art (isométricas) usadas nos botões da tela inicial. */
export const ART = { animais, casa, estacoes, ferramentas, habilidades, moradores, pets, primavera, receitas, verao } as const;
export type ArtName = keyof typeof ART;
