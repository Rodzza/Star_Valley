import type { FeatureId } from '../features/registry';
import type { IconName } from './PixelIcon';

export interface Tile {
  label: string;
  icon: IconName;
  /** Página que a categoria abre. Sem `feature`, a página ainda não existe ("em breve"). */
  feature?: FeatureId;
}

/** As 8 categorias da tela inicial. As que já têm página abrem a função correspondente. */
export const TILES: readonly Tile[] = [
  { label: 'Fazenda', icon: 'house', feature: 'cropPlanner' },
  { label: 'Pets', icon: 'cat' },
  { label: 'Animais', icon: 'chick' },
  { label: 'Estações', icon: 'tree' },
  { label: 'Moradores', icon: 'person', feature: 'giftFinder' },
  { label: 'Receitas', icon: 'pot' },
  { label: 'Projetos', icon: 'hammer', feature: 'floatingQuests' },
  { label: 'Habilidades', icon: 'star', feature: 'saveProgress' },
];
