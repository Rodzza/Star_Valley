import { FEATURES, type FeatureDef } from '../features/registry';
import { useEntitlements } from '../monetization/EntitlementsContext';

interface Props {
  onOpen: (id: FeatureDef['id']) => void;
  onPaywall: () => void;
  onCredits: () => void;
}

export function Home({ onOpen, onPaywall, onCredits }: Props) {
  const { available, isPro, adsLeft } = useEntitlements();

  return (
    <>
      <h1>Valley Tracker</h1>
      <p className="muted">
        {isPro ? 'Você é Pro: tudo liberado.' : `Anúncios disponíveis hoje: ${adsLeft} de 5.`}
      </p>
      {FEATURES.map((f) => {
        const ok = available(f.id);
        const label = ok
          ? f.access === 'free'
            ? null
            : 'Liberado'
          : f.access === 'ad'
            ? 'Libere com 1 anúncio (vale até meia-noite)'
            : 'Pro';
        return (
          <button key={f.id} className="card" onClick={() => onOpen(f.id)}>
            <span className="title">{f.title}</span>
            <span className="muted" style={{ display: 'block' }}>
              {f.description}
            </span>
            {label && <span className={`badge ${ok ? 'ok' : f.access === 'pro' ? 'pro' : ''}`}>{label}</span>}
          </button>
        );
      })}
      {!isPro && (
        <button className="btn" onClick={onPaywall}>
          Conhecer o Pro
        </button>
      )}
      <button className="link" onClick={onCredits}>
        Fontes e licenças
      </button>
    </>
  );
}
