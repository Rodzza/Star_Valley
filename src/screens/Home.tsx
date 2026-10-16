import { useEffect, useState } from 'react';
import heroImg from '../assets/hero-farm.jpg';
import { FEATURES, type FeatureId } from '../features/registry';
import { useEntitlements } from '../monetization/EntitlementsContext';
import { loadStoredSave } from '../save/storage';
import { FeatureList } from '../ui/FeatureList';
import { PixelIcon } from '../ui/PixelIcon';
import { ART, type ArtName } from '../ui/tileArt';
import { TILES } from '../ui/tiles';
import { UiIcon } from '../ui/UiIcon';

interface Props {
  onOpen: (id: FeatureId) => void;
  onSoon: (title: string) => void;
  onPaywall: () => void;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const SHOWCASE: ReadonlyArray<{ id: FeatureId; tone: string; art: ArtName }> = [
  { id: 'cropPlanner', tone: 'green', art: 'verao' },
  { id: 'giftFinder', tone: 'gold', art: 'primavera' },
];

export function Home({ onOpen, onSoon, onPaywall }: Props) {
  const { available, isPro, adsLeft } = useEntitlements();
  const [query, setQuery] = useState('');
  const [farm, setFarm] = useState<string | null>(null);

  useEffect(() => {
    void loadStoredSave().then((s) => setFarm(s?.save.farmName || null));
  }, []);

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
          <p>{farm ?? 'Seu vale'}</p>
        </div>
        <button
          type="button"
          className="coins"
          onClick={onPaywall}
          disabled={isPro}
          aria-label={isPro ? 'Plano Pro ativo' : `Anúncios restantes hoje: ${adsLeft} de 5. Toque para conhecer o Pro`}
        >
          <PixelIcon name="coin" size={20} />
          <span>{isPro ? 'Pro' : `${adsLeft}/5`}</span>
        </button>
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
          <div className="tiles">
            {TILES.map((t) => {
              const locked = t.feature ? !available(t.feature) : false;
              return (
                <button
                  key={t.label}
                  type="button"
                  className={`tile${t.feature ? '' : ' soon'}`}
                  aria-label={t.feature ? `${t.label}${locked ? ' (bloqueado)' : ''}` : `${t.label} (em breve)`}
                  onClick={() => (t.feature ? onOpen(t.feature) : onSoon(t.label))}
                >
                  <img className="tile-art" src={ART[t.art]} alt="" draggable={false} />
                  <span>{t.label}</span>
                  {locked && (
                    <span className="tile-lock">
                      <PixelIcon name="lock" size={12} />
                    </span>
                  )}
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
