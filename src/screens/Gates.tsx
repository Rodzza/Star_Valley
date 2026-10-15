import { useState } from 'react';
import { FEATURE_BY_ID, type FeatureId } from '../features/registry';
import { useEntitlements, type WatchResult } from '../monetization/EntitlementsContext';

const MESSAGES: Record<WatchResult, string> = {
  unlocked: '',
  dismissed: 'O anúncio foi fechado antes do fim, então nada foi liberado.',
  error: 'Não foi possível carregar o anúncio agora. Tente de novo em instantes.',
  'limit-reached': 'Você já assistiu os 5 anúncios de hoje. Amanhã eles voltam.',
  'already-unlocked': 'Esta função já está liberada hoje.',
  'not-ad-feature': 'Esta função é exclusiva do Pro.',
};

export function AdGate({ feature, onPaywall }: { feature: FeatureId; onPaywall: () => void }) {
  const { watchAdFor, adsLeft, canWatchAd } = useEntitlements();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const def = FEATURE_BY_ID[feature];

  async function onWatch() {
    setBusy(true);
    const result = await watchAdFor(feature);
    setMessage(MESSAGES[result]);
    setBusy(false);
  }

  return (
    <>
      <h1>{def.title}</h1>
      <p>{def.description}</p>
      <p className="muted">
        Assista a 1 anúncio para liberar esta função até a meia-noite de hoje. Anúncios restantes hoje: {adsLeft} de 5.
      </p>
      <button className="btn" disabled={busy || !canWatchAd(feature)} onClick={onWatch}>
        {busy ? 'Carregando…' : 'Assistir anúncio e liberar'}
      </button>
      {message && <p role="status">{message}</p>}
      <button className="link" onClick={onPaywall}>
        Ou assine o Pro para não ver anúncios
      </button>
    </>
  );
}

export function ProGate({ feature, onPaywall }: { feature: FeatureId; onPaywall: () => void }) {
  const def = FEATURE_BY_ID[feature];
  return (
    <>
      <h1>{def.title}</h1>
      <p>{def.description}</p>
      <p className="muted">Esta função é exclusiva do plano Pro.</p>
      <button className="btn" onClick={onPaywall}>
        Ver o Pro
      </button>
    </>
  );
}
