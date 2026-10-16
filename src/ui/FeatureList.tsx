import type { FeatureDef } from '../features/registry';
import { useEntitlements } from '../monetization/EntitlementsContext';
import { FEATURE_ICON } from './featureIcons';
import { PixelIcon } from './PixelIcon';

/** Lista de funções com o estado de acesso de cada uma (grátis, liberada, com anúncio, Pro). */
export function FeatureList({ features, onOpen }: { features: readonly FeatureDef[]; onOpen: (id: FeatureDef['id']) => void }) {
  const { available } = useEntitlements();
  return (
    <>
      {features.map((f) => {
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
    </>
  );
}
