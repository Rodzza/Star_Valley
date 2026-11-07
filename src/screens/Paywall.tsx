import { useEffect, useState } from 'react';
import { FEATURES } from '../features/registry';
import { billing, type PlanId, type PlanInfo } from '../monetization/billing';
import { useEntitlements } from '../monetization/EntitlementsContext';

export function Paywall({ onDone }: { onDone: () => void }) {
  const { buyPro, restorePurchases } = useEntitlements();
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [selected, setSelected] = useState<PlanId>('pro_lifetime');
  const [understood, setUnderstood] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    billing
      .getPlans()
      .then((lista) => {
        setPlans(lista);
        if (lista.length === 0) setMessage('Os planos não estão disponíveis agora. Tente de novo mais tarde.');
        else if (!lista.some((p) => p.id === selected)) setSelected(lista[0]!.id);
      })
      .catch(() => setMessage('Não foi possível falar com a Google Play. Confira a internet e abra esta tela de novo.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plan = plans.find((p) => p.id === selected);

  async function onContinue() {
    setBusy(true);
    setMessage('');
    try {
      const ok = await buyPro(selected);
      if (ok) onDone();
      else setMessage('A compra não foi concluída. Nada foi cobrado.');
    } catch {
      setMessage('A Google Play não conseguiu concluir a compra. Confira a internet e tente de novo.');
    } finally {
      setBusy(false);
    }
  }

  async function onRestore() {
    setBusy(true);
    setMessage('');
    try {
      const ok = await restorePurchases();
      if (ok) onDone();
      else setMessage('Nenhuma compra encontrada nesta conta Google.');
    } catch {
      setMessage('Não foi possível consultar suas compras agora. Tente de novo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Torne-se Pro</h1>
      <h2>O que o Pro inclui</h2>
      {FEATURES.filter((f) => f.access === 'pro').map((f) => (
        <p key={f.id}>
          <strong>{f.title}.</strong> <span className="muted">{f.description}</span>
        </p>
      ))}
      <p>
        <strong>Sem anúncios.</strong>
      </p>

      <h2>Escolha seu plano</h2>
      <div role="radiogroup" aria-label="Plano">
        {plans.map((p) => (
          <button
            key={p.id}
            role="radio"
            aria-checked={selected === p.id}
            className="card plan"
            onClick={() => setSelected(p.id)}
          >
            <span>
              <span className="title">{p.title}</span>
              <span className="muted" style={{ display: 'block' }}>
                {p.detail}
              </span>
            </span>
            <strong>{p.price}</strong>
          </button>
        ))}
      </div>

      <div className="notice" role="note">
        <strong>Leia antes de assinar: como funcionam a Perfeição e o botão flutuante</strong>
        O Android 13 ou mais novo não deixa nenhum app ler a pasta do jogo (Android/data). Por isso o app NÃO lê o
        save sozinho: você copia o arquivo do save para outra pasta do celular (por exemplo, Documentos) e importa
        no app. O progresso e as missões mostram o jogo no momento do último save importado, e para atualizar é
        preciso importar de novo. Se você não importar o save, essas duas funções não funcionam. As outras vantagens
        do Pro continuam valendo.
      </div>

      <label className="check">
        <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
        <span>Entendi que a Perfeição e o botão flutuante dependem de eu importar o arquivo do save manualmente, e que não atualizam sozinhos.</span>
      </label>

      <button className="btn" disabled={!understood || busy || !plan} onClick={onContinue}>
        Continuar
      </button>
      {plan?.recurring && (
        <p className="muted">
          O pagamento é cobrado na sua conta Google Play. A assinatura renova automaticamente, a menos que seja
          cancelada pelo menos 24 horas antes do fim do período atual.
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <button className="link" disabled={busy} onClick={onRestore}>
        Restaurar compras
      </button>
      <button className="link" onClick={onDone}>
        Agora não
      </button>
    </>
  );
}
