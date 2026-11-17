import { useEffect, useState, type ReactNode } from 'react';
import { FEATURE_BY_ID, type FeatureId } from './features/registry';
import { Calendar } from './screens/Calendar';
import { CropPlanner } from './screens/CropPlanner';
import { Credits } from './screens/Credits';
import { FloatingQuests, syncOverlayDay } from './screens/FloatingQuests';
import { Pets } from './screens/Pets';
import { Notes } from './screens/Notes';
import { Backup } from './screens/Backup';
import { Saved } from './screens/Saved';
import { loadFavorites, toggleFeature, useFavorites } from './favorites/favorites';
import { FavoriteButton } from './ui/FavoriteButton';
import { Recipes } from './screens/Recipes';
import { Skills } from './screens/Skills';
import { Buildings } from './screens/Buildings';
import { Animals } from './screens/Animals';
import { GiftFinder } from './screens/GiftFinder';
import { SaveProgress } from './screens/SaveProgress';
import { Villagers } from './screens/Villagers';
import { Explore } from './screens/Explore';
import { Home } from './screens/Home';
import { Profile } from './screens/Profile';
import { Onboarding } from './screens/Onboarding';
import { EMPTY_ONBOARDING, loadOnboarding, saveOnboarding, type OnboardingState } from './onboarding/state';
import { Soon } from './screens/Soon';
import { TabBar, type TabId } from './ui/TabBar';
import { applyPalette, preferredPalette } from './styles/tokens';
import { installBackButton, useBackHandler } from './native/backButton';
import { overlaySupported } from './native/overlay';

type Route =
  | { name: 'home' }
  | { name: 'explore' }
  | { name: 'saved' }
  | { name: 'profile' }
  | { name: 'soon'; title: string }
  | { name: 'feature'; id: FeatureId }
  | { name: 'credits' }
  | { name: 'villager'; villager: string };

function FeatureContent({ id }: { id: FeatureId }) {
  switch (id) {
    case 'calendar':
      return <Calendar />;
    case 'villagers':
      return <Villagers />;
    case 'pets':
      return <Pets />;
    case 'recipes':
      return <Recipes />;
    case 'skills':
      return <Skills />;
    case 'buildings':
      return <Buildings />;
    case 'animals':
      return <Animals />;
    case 'cropPlanner':
      return <CropPlanner />;
    case 'giftFinder':
      return <GiftFinder />;
    case 'saveProgress':
      return <SaveProgress />;
    case 'floatingQuests':
      return <FloatingQuests />;
    case 'notes':
      return <Notes />;
    case 'backup':
      return <Backup />;
  }
}

function Router() {
  const [history, setHistory] = useState<Route[]>([{ name: 'home' }]);
  const [onb, setOnb] = useState<OnboardingState | null>(null);
  const favs = useFavorites();
  useEffect(() => {
    void loadOnboarding().then(setOnb);
    void loadFavorites();
  }, []);
  const route = history[history.length - 1]!;
  /** Abas trocam o topo; telas abertas por cima (função, créditos…) empilham. Início zera a pilha. */
  const setRoute = (r: Route) =>
    setHistory((h) => {
      if (r.name === 'home') return [r];
      const isTab = (x: Route) => x.name === 'explore' || x.name === 'saved' || x.name === 'profile';
      if (isTab(r) && isTab(h[h.length - 1]!)) return [...h.slice(0, -1), r];
      return [...h, r];
    });
  // Botão voltar do Android: volta à tela anterior; no Início, pede um segundo toque para sair.
  useBackHandler(() => {
    if (history.length <= 1) return false;
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    return true;
  }, true);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [history.length]);
  const goBack = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : [{ name: 'home' }]));
  const goHome = () => setRoute({ name: 'home' });
  const openFeature = (id: FeatureId) => setRoute({ name: 'feature', id });
  const goTab = (t: TabId) =>
    setRoute(t === 'home' ? { name: 'home' } : t === 'explore' ? { name: 'explore' } : t === 'saved' ? { name: 'saved' } : { name: 'profile' });

  if (!onb) return <p className="muted">Carregando…</p>;
  if (!onb.done) {
    return (
      <Onboarding
        initial={onb}
        onFinish={(s, openFloating) => {
          setOnb(s);
          setHistory(openFloating ? [{ name: 'home' }, { name: 'feature', id: 'floatingQuests' }] : [{ name: 'home' }]);
        }}
      />
    );
  }
  const reviewIntro = () => {
    const s = { ...onb, done: false };
    void saveOnboarding(s);
    setOnb(s);
  };
  const tab: TabId | null =
    route.name === 'home' || route.name === 'explore' || route.name === 'saved' || route.name === 'profile' ? route.name : null;
  const back = (
    <button className="back" onClick={goBack}>
      ← Voltar
    </button>
  );

  let content: ReactNode;
  switch (route.name) {
    case 'home':
      return (
        <>
          <Home onOpen={openFeature} onSoon={(title) => setRoute({ name: 'soon', title })} onboarding={onb} />
          <TabBar current={tab} onGo={goTab} />
        </>
      );
    case 'explore':
      content = <Explore onOpen={openFeature} />;
      break;
    case 'saved':
      content = <Saved onOpen={openFeature} onVillager={(v) => setRoute({ name: 'villager', villager: v })} />;
      break;
    case 'profile':
      content = <Profile onOpen={openFeature} onCredits={() => setRoute({ name: 'credits' })} onReviewIntro={reviewIntro} />;
      break;
    case 'soon':
      content = (
        <>
          {back}
          <Soon title={route.title} />
        </>
      );
      break;
    case 'credits':
      content = (
        <>
          {back}
          <section className="panel">
            <Credits />
          </section>
        </>
      );
      break;
    case 'villager':
      content = (
        <>
          {back}
          <section className="panel">
            <Villagers initial={route.villager} />
          </section>
        </>
      );
      break;
    default: {
      content = (
        <>
          <div className="feature-bar">
            {back}
            <FavoriteButton on={favs.features.includes(route.id)} label={FEATURE_BY_ID[route.id].title} onToggle={() => toggleFeature(route.id)} />
          </div>
          <section className="panel">
            <FeatureContent id={route.id} />
          </section>
        </>
      );
    }
  }

  return (
    <>
      {content}
      <TabBar current={tab} onGo={goTab} />
    </>
  );
}

export function App() {
  useEffect(() => {
    installBackButton();
    // Ao abrir ou voltar para o app, traz de volta o botão flutuante escondido no "X".
    const resync = () => {
      if (overlaySupported() && document.visibilityState === 'visible') void syncOverlayDay();
    };
    resync();
    document.addEventListener('visibilitychange', resync);
    applyPalette(preferredPalette());
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyPalette(preferredPalette());
    mq.addEventListener('change', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
      document.removeEventListener('visibilitychange', resync);
    };
  }, []);

  return (
    <main className="app">
      <Router />
    </main>
  );
}
