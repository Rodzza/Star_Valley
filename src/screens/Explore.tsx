import { FEATURES, type FeatureId } from '../features/registry';
import { FeatureList } from '../ui/FeatureList';

export function Explore({ onOpen }: { onOpen: (id: FeatureId) => void }) {
  return (
    <>
      <h1 className="page-title">Explorar</h1>
      <p className="lead">Todas as funções do app, com o que cada uma pede.</p>
      <FeatureList features={FEATURES} onOpen={onOpen} />
    </>
  );
}
