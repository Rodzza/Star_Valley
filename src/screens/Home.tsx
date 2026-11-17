import { useEffect, useState } from 'react';
import heroImg from '../assets/hero-farm.jpg';
import { FEATURES, type FeatureId } from '../features/registry';
import { loadStoredSave } from '../save/storage';
import { FeatureList } from '../ui/FeatureList';
import { PixelIcon } from '../ui/PixelIcon';
import { ART, type ArtName } from '../ui/tileArt';
import { TILES } from '../ui/tiles';
import { UiIcon } from '../ui/UiIcon';
import { shortcutsFor, type OnboardingState } from '../onboarding/state';

interface Props {
  onOpen: (id: FeatureId) => void;
  onSoon: (title: string) => void;
  onboarding?: OnboardingState;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const SHOWCASE: ReadonlyArray<{ id: FeatureId; tone: string; art: ArtName }> = [
  { id: 'cropPlanner', tone: 'green', art: 'verao' },
  { id: 'giftFinder', tone: 'gold', art: 'primavera' },
];

export function Home({ onOpen, onSoon, onboarding }: Props) {
  const [query, setQuery] = useState('');
  const [farm, setFarm] = useState<string | null>(null);

  useEffect(() => {
    void loadStoredSave().then((s) => setFarm(s?.save.farmName || null));
  }, []);

  const shortcuts = shortcutsFor(onboarding?.interests ?? [])
    .map((id) => FEATURES.find((f) => f.id === id))
    .filter((f): f is (typeof FEATURES)[number] => Boolean(f));
  const q = norm(query.trim());
  const results = q ? FEATURES.filter((f) => norm(`${f.title} ${f.description}`).includes(q)) : [];

  return (
    <>
      <header className="welcome">
        <span className="avatar">
          <PixelIcon name="person" size={40} />
        </span>
        <div className="welcome-text">
          <h1>Bem-vindo!</h1>
          <p>{farm ?? (onboarding?.farmName || 'Seu vale')}</p>
        </div>
      </header>

      <label className="search">
        <span className="search-icon">
          <UiIcon name="search" size={20} />
        </span>
        <input type="search" placeholder="Buscar uma função…" aria-label="Buscar uma função" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>

      {q ? (
        <section aria-live="polite">
          <h2 className="section">Resultados</h2>
          {results.length ? (
            <FeatureList features={results} onOpen={onOpen} />
          ) : (
            <p className="empty">Nenhuma função com “{query.trim()}”. Tente outra palavra.</p>
          )}
        </section>
      ) : (
        <>
          {shortcuts.length > 0 && (
            <>
              <h2 className="section">Seus atalhos</h2>
              <div className="row home-shortcuts">
                {shortcuts.map((f) => (
                  <button key={f.id} type="button" className="chip" onClick={() => onOpen(f.id)}>
                    {f.title}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="tiles">
            {TILES.map((t) => {
              return (
                <button
                  key={t.label}
                  type="button"
                  className={`tile${t.feature ? '' : ' soon'}`}
                  aria-label={t.feature ? t.label : `${t.label} (em breve)`}
                  onClick={() => (t.feature ? onOpen(t.feature) : onSoon(t.label))}
                >
                  <img className="tile-art" src={ART[t.art]} alt="" draggable={false} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <h2 className="section">Coleções</h2>
          <button type="button" className="hero" onClick={() => onOpen('saveProgress')}>
            <img src={heroImg} alt="" />
            <span className="pill">
              <PixelIcon name="star" size={18} />
              Perfeição pelo save
            </span>
          </button>

          <h2 className="section">Mais ferramentas</h2>
          <div className="duo">
            {SHOWCASE.map(({ id, tone, art }) => (
              <button key={id} type="button" className={`poster ${tone}`} onClick={() => onOpen(id)}>
                <img className="poster-art" src={ART[art]} alt="" draggable={false} />
                <span className="pill">
                  <PixelIcon name="star" size={16} />
                  {id === 'cropPlanner' ? 'Plantio' : 'Presente certo'}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
