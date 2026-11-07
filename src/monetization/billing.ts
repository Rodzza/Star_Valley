/**
 * Camada de compras.
 *
 * - No Android, com VITE_REVENUECAT_ANDROID_KEY definida: compras reais pelo Google Play,
 *   via RevenueCat (valida as compras com o Google e guarda quem é Pro, sem servidor nosso).
 * - Sem a chave, no navegador ou em `npm run dev`: SIMULAÇÃO (a compra só "funciona" em dev/prévia).
 *
 * Configuração na loja (detalhes no README, seção "Compras reais"):
 *   Play Console:  assinatura `pro_monthly` e produto único `pro_lifetime`
 *   RevenueCat:    entitlement `pro` ligado aos dois produtos, e uma offering "default"
 *                  com os pacotes Mensal ($rc_monthly) e Vitalício ($rc_lifetime)
 *
 * Os preços mostrados vêm da loja (já no formato da moeda do usuário).
 */
import { Capacitor } from '@capacitor/core';
import type { CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor';

export type PlanId = 'pro_monthly' | 'pro_lifetime';
export const ENTITLEMENT_ID = 'pro';

export interface PlanInfo {
  id: PlanId;
  title: string;
  price: string;
  detail: string;
  recurring: boolean;
}

export interface BillingService {
  /** true quando as compras são reais (loja), false na simulação. */
  readonly real: boolean;
  getPlans(): Promise<PlanInfo[]>;
  /** true = virou Pro. false = cancelou ou não concluiu. Lança erro em falha da loja. */
  purchase(plan: PlanId): Promise<boolean>;
  restore(): Promise<boolean>;
  /** Pergunta à loja se o usuário é Pro. null = não deu para saber (offline/simulação). */
  refresh(): Promise<boolean | null>;
}

const PLAN_TEXT: Record<PlanId, Omit<PlanInfo, 'price'>> = {
  pro_monthly: {
    id: 'pro_monthly',
    title: 'Pro Mensal',
    detail: 'Cobrado todo mês pela Google Play. Cancele quando quiser',
    recurring: true,
  },
  pro_lifetime: {
    id: 'pro_lifetime',
    title: 'Pro Vitalício',
    detail: 'Compra única, sem assinatura',
    recurring: false,
  },
};

/** Descobre qual dos nossos planos é o pacote da loja (pelo tipo do pacote ou pelo ID do produto). */
export function planIdOf(pkg: Pick<PurchasesPackage, 'packageType' | 'identifier'> & { product: { identifier: string } }): PlanId | null {
  const productId = pkg.product.identifier.toLowerCase();
  if (pkg.packageType === 'MONTHLY' || pkg.identifier === '$rc_monthly' || productId.startsWith('pro_monthly')) return 'pro_monthly';
  if (pkg.packageType === 'LIFETIME' || pkg.identifier === '$rc_lifetime' || productId.startsWith('pro_lifetime')) return 'pro_lifetime';
  return null;
}

/** Monta os planos da tela a partir dos pacotes da loja, na ordem Mensal → Vitalício. */
export function plansFromPackages(packages: readonly PurchasesPackage[]): { plans: PlanInfo[]; byPlan: Map<PlanId, PurchasesPackage> } {
  const byPlan = new Map<PlanId, PurchasesPackage>();
  for (const pkg of packages) {
    const id = planIdOf(pkg);
    if (id && !byPlan.has(id)) byPlan.set(id, pkg);
  }
  const plans = (['pro_monthly', 'pro_lifetime'] as const)
    .filter((id) => byPlan.has(id))
    .map((id) => ({
      ...PLAN_TEXT[id],
      price: byPlan.get(id)!.product.priceString + (id === 'pro_monthly' ? ' / mês' : ''),
    }));
  return { plans, byPlan };
}

export function hasPro(info: Pick<CustomerInfo, 'entitlements'>): boolean {
  return ENTITLEMENT_ID in info.entitlements.active;
}

/** O usuário fechou a tela de pagamento: não é erro. */
export function isUserCancel(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as { userCancelled?: unknown; code?: unknown };
  return e.userCancelled === true || e.code === 1 || e.code === '1';
}

// ─── Simulação ───────────────────────────────────────────
const mockBilling: BillingService = {
  real: false,
  async getPlans() {
    return [
      { ...PLAN_TEXT.pro_monthly, price: 'R$ 4,99 / mês' },
      { ...PLAN_TEXT.pro_lifetime, price: 'R$ 29,99' },
    ];
  },
  async purchase() {
    // A prévia no navegador e o `npm run dev` simulam a compra; um build sem chave nunca "vende".
    return import.meta.env.DEV || import.meta.env.VITE_PREVIEW === 'true';
  },
  async restore() {
    return false;
  },
  async refresh() {
    return null;
  },
};

// ─── Google Play via RevenueCat ──────────────────────────
function createStoreBilling(apiKey: string): BillingService {
  let setup: Promise<typeof import('@revenuecat/purchases-capacitor').Purchases> | null = null;
  let packages = new Map<PlanId, PurchasesPackage>();

  const sdk = () => {
    setup ??= import('@revenuecat/purchases-capacitor').then(async ({ Purchases }) => {
      await Purchases.configure({ apiKey });
      return Purchases;
    });
    return setup;
  };

  return {
    real: true,
    async getPlans() {
      const Purchases = await sdk();
      const offerings = await Purchases.getOfferings();
      const { plans, byPlan } = plansFromPackages(offerings.current?.availablePackages ?? []);
      packages = byPlan;
      return plans;
    },
    async purchase(plan) {
      const Purchases = await sdk();
      if (!packages.has(plan)) await this.getPlans();
      const aPackage = packages.get(plan);
      if (!aPackage) throw new Error('Esse plano não está disponível na loja agora.');
      try {
        const { customerInfo } = await Purchases.purchasePackage({ aPackage });
        return hasPro(customerInfo);
      } catch (err) {
        if (isUserCancel(err)) return false;
        throw err;
      }
    },
    async restore() {
      const Purchases = await sdk();
      const { customerInfo } = await Purchases.restorePurchases();
      return hasPro(customerInfo);
    },
    async refresh() {
      try {
        const Purchases = await sdk();
        const { customerInfo } = await Purchases.getCustomerInfo();
        return hasPro(customerInfo);
      } catch {
        return null; // sem internet: mantém o que estava salvo no aparelho
      }
    },
  };
}

const androidKey = (import.meta.env.VITE_REVENUECAT_ANDROID_KEY ?? '').trim();
const useStore = Capacitor.getPlatform() === 'android' && androidKey.startsWith('goog_');

export const billing: BillingService = useStore ? createStoreBilling(androidKey) : mockBilling;
