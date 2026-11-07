import { describe, expect, it } from 'vitest';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { hasPro, isUserCancel, planIdOf, plansFromPackages } from './billing';

const pkg = (identifier: string, packageType: string, productId: string, priceString: string) =>
  ({ identifier, packageType, product: { identifier: productId, priceString } }) as unknown as PurchasesPackage;

describe('planos vindos da loja', () => {
  it('reconhece mensal e vitalício pelo tipo, pelo pacote ou pelo produto', () => {
    expect(planIdOf(pkg('$rc_monthly', 'MONTHLY', 'x', ''))).toBe('pro_monthly');
    expect(planIdOf(pkg('custom', 'CUSTOM', 'pro_monthly:mensal', ''))).toBe('pro_monthly');
    expect(planIdOf(pkg('$rc_lifetime', 'LIFETIME', 'y', ''))).toBe('pro_lifetime');
    expect(planIdOf(pkg('outro', 'ANNUAL', 'pro_anual', ''))).toBeNull();
  });

  it('usa o preço da loja e ordena Mensal antes de Vitalício', () => {
    const { plans, byPlan } = plansFromPackages([
      pkg('$rc_lifetime', 'LIFETIME', 'pro_lifetime', 'R$ 29,99'),
      pkg('$rc_monthly', 'MONTHLY', 'pro_monthly:mensal', 'R$ 4,99'),
      pkg('anual', 'ANNUAL', 'pro_anual', 'R$ 39,99'),
    ]);
    expect(plans.map((p) => [p.id, p.price])).toEqual([
      ['pro_monthly', 'R$ 4,99 / mês'],
      ['pro_lifetime', 'R$ 29,99'],
    ]);
    expect(byPlan.size).toBe(2);
  });

  it('sem pacotes, não mostra plano nenhum', () => {
    expect(plansFromPackages([]).plans).toEqual([]);
  });
});

describe('quem é Pro', () => {
  it('é Pro só com o entitlement "pro" ativo', () => {
    expect(hasPro({ entitlements: { active: { pro: {} }, all: {} } } as never)).toBe(true);
    expect(hasPro({ entitlements: { active: {}, all: { pro: {} } } } as never)).toBe(false);
  });
});

describe('cancelamento da compra', () => {
  it('trata o usuário fechando a tela como cancelamento, não erro', () => {
    expect(isUserCancel({ userCancelled: true })).toBe(true);
    expect(isUserCancel({ code: '1' })).toBe(true);
    expect(isUserCancel({ code: '2' })).toBe(false);
    expect(isUserCancel(new Error('rede'))).toBe(false);
  });
});
