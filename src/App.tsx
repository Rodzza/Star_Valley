import { useEffect, useState } from 'react';
import { FEATURE_BY_ID, type FeatureId } from './features/registry';
import { EntitlementsProvider, useEntitlements } from './monetization/EntitlementsContext';
import { CropPlanner } from './screens/CropPlanner';
import { Credits } from './screens/Credits';
import { FloatingQuests } from './screens/FloatingQuests';
import { GiftFinder } from './screens/GiftFinder';
import { SaveProgress } from './screens/SaveProgress';
import { AdGate, ProGate } from './screens/Gates';
import { Home } from './screens/Home';
import { Paywall } from './screens/Paywall';
import { applyPalette, preferredPalette } from './styles/tokens';

type Route = { name: 'home' } | { name: 'feature'; id: FeatureId } | { name: 'paywall' } | { name: 'credits' };

function FeatureContent({ id }: { id: FeatureId }) {
  switch (id) {
    case 'cropPlanner':
      return <CropPlanner />;
    case 'giftFinder':
      return <GiftFinder />;
    case 'saveProgress':
      return <SaveProgress />;
    case 'floatingQuests':
      return <FloatingQuests />;
    default:
      return (
        <>
          <h1>{FEATURE_BY_ID[id].title}</h1>
          <p className="muted">Em breve.</p>
        </>
      );
  }
}

function Router() {
  const { ready, available } = useEntitlements();
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const goHome = () => setRoute({ name: 'home' });
  const goPaywall = () => setRoute({ name: 'paywall' });

  if (!ready) return <p className="muted">Carregando…</p>;
  if (route.name === 'paywall') return <Paywall onDone={goHome} />;
  if (route.name === 'credits') {
    return (
      <>
        <button className="link back" onClick={goHome}>
          ← Voltar
        </button>
        <Credits />
      </>
    );
  }
  if (route.name === 'home') {
    return (
      <Home
        onOpen={(id) => setRoute({ name: 'feature', id })}
        onPaywall={goPaywall}
        onCredits={() => setRoute({ name: 'credits' })}
      />
    );
  }

  const def = FEATURE_BY_ID[route.id];
  return (
    <>
      <button className="link back" onClick={goHome}>
        ← Voltar
      </button>
      {available(route.id) ? (
        <FeatureContent id={route.id} />
      ) : def.access === 'ad' ? (
        <AdGate feature={route.id} onPaywall={goPaywall} />
      ) : (
        <ProGate feature={route.id} onPaywall={goPaywall} />
      )}
    </>
  );
}

export function App() {
  useEffect(() => {
    applyPalette(preferredPalette());
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyPalette(preferredPalette());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <EntitlementsProvider>
      <main className="app">
        {import.meta.env.VITE_PREVIEW === 'true' && (
          <p className="notice" role="note">
            <strong>Prévia no navegador</strong>
            Anúncios e compras são simulados, e o botão flutuante só existe no app Android.
          </p>
        )}
        {import.meta.env.VITE_UNLOCK_ALL === 'true' && (
          <p className="notice" role="note">
            <strong>Versão de teste</strong>
            Todas as funções estão liberadas para você testar. Na versão publicada, valem os planos e anúncios.
          </p>
        )}
        <Router />
      </main>
    </EntitlementsProvider>
  );
}
