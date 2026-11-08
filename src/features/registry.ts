/**
 * Catálogo de funções e como cada uma é liberada.
 *  - free: sempre disponível
 *  - ad:   liberada até meia-noite (horário local) após assistir a um anúncio
 *  - pro:  só para assinantes / compra vitalícia
 *
 * Para mudar uma função de plano, altere apenas `access` aqui.
 */
export type FeatureId =
  | 'calendar'
  | 'villagers'
  | 'pets'
  | 'recipes'
  | 'skills'
  | 'cropPlanner'
  | 'giftFinder'
  | 'saveProgress'
  | 'floatingQuests'
  | 'cloudSync'
  | 'unlimitedFarms'
  | 'customNotes';

export type Access = 'free' | 'ad' | 'pro';

export interface FeatureDef {
  id: FeatureId;
  title: string;
  description: string;
  access: Access;
}

export const FEATURES: readonly FeatureDef[] = [
  { id: 'calendar', title: 'Calendário', description: 'Aniversários, festivais e prazos de colheita.', access: 'free' },
  { id: 'villagers', title: 'Moradores', description: 'Perfis, locais e rotinas.', access: 'free' },
  { id: 'recipes', title: 'Receitas', description: 'Os 81 pratos, ingredientes e como aprender: TV, cartas dos moradores, habilidade ou loja.', access: 'free' },
  { id: 'skills', title: 'Habilidades', description: 'O que cada nível libera, as profissões dos níveis 5 e 10 e a Caverna da Maestria.', access: 'free' },
  { id: 'pets', title: 'Pets', description: 'Amizade do seu pet, como adotar mais e os presentes que eles trazem.', access: 'free' },
  {
    id: 'cropPlanner',
    title: 'Planejador de plantio',
    description: 'Quais culturas ainda dão tempo de colher e quanto rendem por dia.',
    access: 'ad',
  },
  {
    id: 'giftFinder',
    title: 'Presente certo',
    description: 'Escolha até 3 moradores e veja os itens que todos eles amam.',
    access: 'pro',
  },
  {
    id: 'saveProgress',
    title: 'Perfeição pelo save',
    description: 'Importe o arquivo do save e veja seu progresso até 100% por categoria. Não atualiza sozinho: importe de novo após salvar.',
    access: 'pro',
  },
  {
    id: 'floatingQuests',
    title: 'Assistente flutuante',
    description: 'Botão translúcido sobre o jogo: festival, Carrinho de Viagem, aniversariantes do dia e o que plantar.',
    access: 'pro',
  },
  { id: 'cloudSync', title: 'Sincronizar e fazer backup', description: 'Suas fazendas em todos os dispositivos.', access: 'pro' },
  { id: 'unlimitedFarms', title: 'Fazendas ilimitadas', description: 'Acompanhe várias partidas e saves.', access: 'pro' },
  { id: 'customNotes', title: 'Notas personalizadas', description: 'Planos, horários e metas.', access: 'pro' },
];

export const FEATURE_BY_ID: Readonly<Record<FeatureId, FeatureDef>> = Object.fromEntries(
  FEATURES.map((f) => [f.id, f]),
) as Record<FeatureId, FeatureDef>;
