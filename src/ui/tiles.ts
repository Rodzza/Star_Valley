import type { FeatureId } from '../features/registry';
import type { ArtName } from './tileArt';

export interface Tile {
  label: string;
  art: ArtName;
  /** Página que a categoria abre. Sem `feature`, a página ainda não existe ("em breve"). */
  feature?: FeatureId;
}

/** As 8 categorias da tela inicial. As que já têm página abrem a função correspondente. */
export const TILES: readonly Tile[] = [
  { label: 'Fazenda', art: 'casa', feature: 'cropPlanner' },
  { label: 'Pets', art: 'pets' },
  { label: 'Animais', art: 'animais' },
  { label: 'Estações', art: 'estacoes', feature: 'calendar' },
  { label: 'Moradores', art: 'moradores', feature: 'villagers' },
  { label: 'Receitas', art: 'receitas' },
  { label: 'Projetos', art: 'ferramentas', feature: 'floatingQuests' },
  { label: 'Habilidades', art: 'habilidades', feature: 'saveProgress' },
];
