import type { FeatureDef } from '../features/registry';
import { FEATURE_ICON } from './featureIcons';
import { PixelIcon } from './PixelIcon';

/** Lista de funções do app (todas gratuitas). */
export function FeatureList({ features, onOpen }: { features: readonly FeatureDef[]; onOpen: (id: FeatureDef['id']) => void }) {
  return (
    <>
      {features.map((f) => (
        <button key={f.id} className="card feature" onClick={() => onOpen(f.id)}>
          <span className="feature-slot">
            <PixelIcon name={FEATURE_ICON[f.id]} size={38} />
          </span>
          <span>
            <span className="title">{f.title}</span>
            <span className="desc">{f.description}</span>
          </span>
        </button>
      ))}
    </>
  );
}
