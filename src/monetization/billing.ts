/**
 * Camada de compras. Hoje é uma SIMULAÇÃO para desenvolvimento.
 * Para publicar, implemente BillingService com Google Play Billing (por exemplo, via
 * RevenueCat: @revenuecat/purchases-capacitor) e crie no Play Console os produtos abaixo (pro_monthly = assinatura mensal; pro_lifetime = compra única).
 * Os preços e o teste grátis vêm da loja, então o texto da tela não deve fixá-los.
 */
export type PlanId = 'pro_monthly' | 'pro_lifetime';

export interface PlanInfo {
  id: PlanId;
  title: string;
  price: string;
  detail: string;
  recurring: boolean;
}

export interface BillingService {
  getPlans(): Promise<PlanInfo[]>;
  purchase(plan: PlanId): Promise<boolean>;
  restore(): Promise<boolean>;
}

const mockBilling: BillingService = {
  async getPlans() {
    return [
      {
        id: 'pro_monthly',
        title: 'Pro Mensal',
        price: 'R$ 4,99 / mês',
        detail: 'Cobrado todo mês. Cancele quando quiser',
        recurring: true,
      },
      {
        id: 'pro_lifetime',
        title: 'Pro Vitalício',
        price: 'R$ 29,99',
        detail: 'Compra única, sem assinatura',
        recurring: false,
      },
    ];
  },
  async purchase() {
    // produção: false até integrar a loja. A prévia no navegador também simula a compra.
    return import.meta.env.DEV || import.meta.env.VITE_PREVIEW === 'true';
  },
  async restore() {
    return false;
  },
};

export const billing: BillingService = mockBilling;
