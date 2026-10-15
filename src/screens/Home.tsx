import type { ReactNode } from 'react';
import { FEATURES, type FeatureDef } from '../features/registry';
import { useEntitlements } from '../monetization/EntitlementsContext';
import { FEATURE_ICON } from '../ui/featureIcons';
import { PixelIcon } from '../ui/PixelIcon';

interface Props {
  onOpen: (id: FeatureDef['id']) => void;
  onPaywall: () => void;
  onCredits: () => void;
  notices?: ReactNode;
}

export function Home({ onOpen, onPaywall, onCredits, notices }: Props) {
  const { available, isPro, adsLeft } = useEntitlements();

  return (
    <>
      <header className="scene">
        <div className="stars" aria-hidden="true" />
        <div className="sun" aria-hidden="true" />
        <div className="hill back" aria-hidden="true" />
        <div className="hill front" aria-hidden="true" />
        <div className="sign">
          <h1>Valley Tracker</h1>
          <p>Seu caderno de campo do vale</p>
        </div>
        <div className="hud" role="status" aria-label={isPro ? 'Plano Pro ativo' : `Anúncios restantes hoje: ${adsLeft} de 5`}>
          <div className="hud-count">
            <PixelIcon name="coin" size={22} />
            <span>{isPro ? 'Pro' : `${adsLeft}/5`}</span>
          </div>
          <span className="hud-label">{isPro ? 'tudo liberado' : 'anúncios hoje'}</span>
        </div>
      </header>
      <div className="fence" aria-hidden="true" />
      {notices}

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
          <button key={f.id} className="card feature" onClick={() => onOpen(f.id)}>
            <span className="feature-slot">
              <PixelIcon name={FEATURE_ICON[f.id]} size={38} />
              {!ok && (
                <span className="slot-mark">
                  <PixelIcon name="lock" size={18} />
                </span>
              )}
            </span>
            <span>
              <span className="title">{f.title}</span>
              <span className="desc">{f.description}</span>
              {label && <span className={`badge ${ok ? 'ok' : f.access === 'pro' ? 'pro' : ''}`}>{label}</span>}
            </span>
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
