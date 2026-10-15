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
      <header className="top">
        <span className="cloud c1" aria-hidden="true" />
        <span className="cloud c2" aria-hidden="true" />
        <div className="brand">
          <span className="brand-icon">
            <PixelIcon name="sprout" size={34} />
          </span>
          <div>
            <h1>Valley Tracker</h1>
            <p>Seu caderno de campo do vale</p>
          </div>
        </div>
        <div className="hud" role="status" aria-label={isPro ? 'Plano Pro ativo' : `Anúncios restantes hoje: ${adsLeft} de 5`}>
          <PixelIcon name="coin" size={22} />
          <span className="hud-count">{isPro ? 'Pro' : `${adsLeft}/5`}</span>
          <span className="hud-label">{isPro ? 'tudo liberado' : 'anúncios hoje'}</span>
        </div>
      </header>
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
          <button key={f.id} className={`card feature ${f.access}`} onClick={() => onOpen(f.id)}>
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
