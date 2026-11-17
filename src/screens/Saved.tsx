import { FEATURES, type FeatureId } from '../features/registry';
import { useFavorites } from '../favorites/favorites';
import { FeatureList } from '../ui/FeatureList';
import { Portrait } from '../ui/Portrait';
import { displayName } from '../utils/villagers';

interface Props {
  onOpen: (id: FeatureId) => void;
  onVillager: (name: string) => void;
}

export function Saved({ onOpen, onVillager }: Props) {
  const fav = useFavorites();
  const features = fav.features.map((id) => FEATURES.find((f) => f.id === id)!).filter(Boolean);
  const empty = !features.length && !fav.villagers.length;

  return (
    <>
      <h1 className="page-title">Salvos</h1>
      {empty && (
        <div className="notice" role="note">
          <strong>Nada salvo ainda</strong>
          Toque na ☆ no topo de uma função ou no painel de um morador para guardar aqui e achar mais rápido.
        </div>
      )}
      {fav.villagers.length > 0 && (
        <>
          <h2 className="section">Moradores</h2>
          <div className="saved-villagers">
            {fav.villagers.map((name) => (
              <button key={name} type="button" className="saved-villager" onClick={() => onVillager(name)}>
                <Portrait name={name} size={64} />
                <span>{displayName(name)}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {features.length > 0 && (
        <>
          <h2 className="section">Funções</h2>
          <FeatureList features={features} onOpen={onOpen} />
        </>
      )}
    </>
  );
}
