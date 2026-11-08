import { describe, expect, it } from 'vitest';
import cropsJson from '../data/crops.json';
import giftsJson from '../data/gifts.json';
import villagersJson from '../data/villagers.json';
import type { Crop } from './crops';
import { buildDayOverlay, dayTitle, nextDay, previousDay } from './dayOverlay';
import type { GiftData } from './gifts';
import type { VillagerData } from './villagers';

const villagers = (villagersJson as unknown as VillagerData).villagers;
const gifts = giftsJson as unknown as GiftData;
const crops = (cropsJson as unknown as { crops: Crop[] }).crops;
const build = (season: 'spring' | 'summer' | 'fall' | 'winter', day: number) => buildDayOverlay({ season, day }, villagers, gifts, crops);

describe('botão flutuante sem save', () => {
  it('vira a estação depois do dia 28 e volta antes do dia 1', () => {
    expect(nextDay({ season: 'fall', day: 28 })).toEqual({ season: 'winter', day: 1 });
    expect(nextDay({ season: 'winter', day: 28 })).toEqual({ season: 'spring', day: 1 });
    expect(previousDay({ season: 'spring', day: 1 })).toEqual({ season: 'winter', day: 28 });
  });

  it('título com dia da semana', () => {
    expect(dayTitle({ season: 'fall', day: 11 })).toBe('Qui, 11 de Outono');
  });

  it('mostra o aniversariante e o que ele ama', () => {
    const c = build('fall', 2); // Penny
    expect(c.lines.some((l) => l.startsWith('🎂 Aniversário de Penny. Ama: '))).toBe(true);
  });

  it('avisa o festival de hoje e o de amanhã', () => {
    expect(build('spring', 13).lines.some((l) => l.startsWith('🎉 Hoje: Festival dos Ovos'))).toBe(true);
    expect(build('spring', 12).lines.some((l) => l.startsWith('📅 Amanhã: Festival dos Ovos'))).toBe(true);
  });

  it('sugere o que plantar e avisa no inverno', () => {
    expect(build('spring', 1).lines.some((l) => l.startsWith('🌱 Plantando hoje, vale mais: '))).toBe(true);
    expect(build('winter', 5).lines.some((l) => l.startsWith('❄️ Inverno'))).toBe(true);
    expect(build('summer', 28).lines.some((l) => l.includes('Não dá mais tempo'))).toBe(true);
  });
});

describe('sugestão de plantio', () => {
  it('não sugere semente rara, que não se compra na loja', () => {
    const c = build('fall', 2);
    expect(c.lines.join(' ')).not.toContain('Baga-gema');
  });
});

import { cartOn, nextCart } from './dayOverlay';

describe('Carrinho de Viagem', () => {
  it('aparece sexta e domingo na floresta', () => {
    expect(cartOn({ season: 'fall', day: 5 })?.where).toContain('Floresta Cindersap'); // sexta
    expect(cartOn({ season: 'fall', day: 7 })?.hours).toBe('6h às 20h'); // domingo
    expect(cartOn({ season: 'fall', day: 6 })).toBeNull(); // sábado
  });

  it('aparece todo dia no Festival do Deserto e no Mercado Noturno', () => {
    expect(cartOn({ season: 'spring', day: 15 })?.where).toBe('Festival do Deserto');
    expect(cartOn({ season: 'winter', day: 16 })?.hours).toBe('17h às 2h');
  });

  it('diz quando é o próximo, inclusive virando a estação', () => {
    expect(nextCart({ season: 'fall', day: 11 }).day).toEqual({ season: 'fall', day: 12 });
    expect(nextCart({ season: 'fall', day: 28 }).day).toEqual({ season: 'winter', day: 5 });
  });

  it('entra no botão flutuante', () => {
    expect(build('fall', 12).lines.some((l) => l.startsWith('🛒 Carrinho de Viagem hoje'))).toBe(true);
    expect(build('fall', 11).lines).toContain('🛒 Próximo Carrinho de Viagem: Sex, dia 12');
  });
});

import { advanceDays, upcomingDays } from './dayOverlay';

describe('dias enviados ao botão (Dormi sem abrir o app)', () => {
  it('lista começa no dia marcado e atravessa as estações', () => {
    const dias = upcomingDays({ season: 'fall', day: 27 }, 56);
    expect(dias).toHaveLength(56);
    expect(dias[0]).toEqual({ season: 'fall', day: 27 });
    expect(dias[2]).toEqual({ season: 'winter', day: 1 });
  });

  it('avançar N dias no botão leva à mesma data no app', () => {
    expect(advanceDays({ season: 'fall', day: 11 }, 3)).toEqual({ season: 'fall', day: 14 });
    expect(advanceDays({ season: 'winter', day: 27 }, 2)).toEqual({ season: 'spring', day: 1 });
    expect(advanceDays({ season: 'fall', day: 11 }, 0)).toEqual({ season: 'fall', day: 11 });
  });
});
