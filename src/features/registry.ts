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
    title: 'Assistente flutuante de missões',
    description: 'Botão translúcido e arrastável sobre o jogo com as missões ativas do último save importado.',
    access: 'pro',
  },
  { id: 'cloudSync', title: 'Sincronizar e fazer backup', description: 'Suas fazendas em todos os dispositivos.', access: 'pro' },
  { id: 'unlimitedFarms', title: 'Fazendas ilimitadas', description: 'Acompanhe várias partidas e saves.', access: 'pro' },
  { id: 'customNotes', title: 'Notas personalizadas', description: 'Planos, horários e metas.', access: 'pro' },
];

export const FEATURE_BY_ID: Readonly<Record<FeatureId, FeatureDef>> = Object.fromEntries(
  FEATURES.map((f) => [f.id, f]),
) as Record<FeatureId, FeatureDef>;
