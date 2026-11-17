/**
 * Catálogo de funções do app. Tudo é gratuito: o Stardew Notes não tem anúncios nem compras
 * (condição da ConcernedApe para usar os recursos do jogo).
 */
export type FeatureId =
  | 'calendar'
  | 'villagers'
  | 'pets'
  | 'recipes'
  | 'skills'
  | 'buildings'
  | 'animals'
  | 'cropPlanner'
  | 'giftFinder'
  | 'saveProgress'
  | 'floatingQuests'
  | 'notes'
  | 'backup';

export interface FeatureDef {
  id: FeatureId;
  title: string;
  description: string;
}

export const FEATURES: readonly FeatureDef[] = [
  { id: 'calendar', title: 'Calendário', description: 'Aniversários, festivais e prazos de colheita.' },
  { id: 'villagers', title: 'Moradores', description: 'Perfis, locais e rotinas.' },
  { id: 'recipes', title: 'Receitas', description: 'Os 81 pratos, ingredientes e como aprender: TV, cartas dos moradores, habilidade ou loja.' },
  { id: 'skills', title: 'Habilidades', description: 'O que cada nível libera, as profissões dos níveis 5 e 10 e a Caverna da Maestria.' },
  { id: 'buildings', title: 'Projetos e construções', description: 'Construções da Robin e do Mago, reformas da casa e da vila: custo, materiais e o que fazem.' },
  { id: 'animals', title: 'Animais', description: 'Animais da fazenda, o que dão, quanto rendem por dia e as melhores estratégias de lucro.' },
  { id: 'pets', title: 'Pets', description: 'Amizade do seu pet, como adotar mais e os presentes que eles trazem.' },
  {
    id: 'cropPlanner',
    title: 'Planejador de plantio',
    description: 'Quais culturas ainda dão tempo de colher e quanto rendem por dia.',
  },
  {
    id: 'giftFinder',
    title: 'Presente certo',
    description: 'Escolha até 3 moradores e veja os itens que todos eles amam.',
  },
  {
    id: 'saveProgress',
    title: 'Perfeição pelo save',
    description: 'Importe o arquivo do save e veja seu progresso até 100% por categoria. Não atualiza sozinho: importe de novo após salvar.',
  },
  {
    id: 'floatingQuests',
    title: 'Assistente flutuante',
    description: 'Botão translúcido sobre o jogo: festival, Carrinho de Viagem, aniversariantes do dia e o que plantar.',
  },
  { id: 'notes', title: 'Minhas notas', description: 'Seus planos, metas e lembretes da fazenda, salvos no celular.' },
  { id: 'backup', title: 'Backup e restauração', description: 'Salve tudo num arquivo e recupere em outro celular.' },
];

export const FEATURE_BY_ID: Readonly<Record<FeatureId, FeatureDef>> = Object.fromEntries(
  FEATURES.map((f) => [f.id, f]),
) as Record<FeatureId, FeatureDef>;
