import { useEntitlements } from '../monetization/EntitlementsContext';
import type { FeatureId } from '../features/registry';
import { PixelIcon } from '../ui/PixelIcon';

interface Props {
  onPaywall: () => void;
  onOpen: (id: FeatureId) => void;
  onCredits: () => void;
}

export function Profile({ onPaywall, onOpen, onCredits }: Props) {
  const { isPro, adsLeft } = useEntitlements();
  return (
    <>
      <h1 className="page-title">Perfil</h1>
      <section className="panel profile">
        <div className="profile-head">
          <span className="avatar big">
            <PixelIcon name="person" size={52} />
          </span>
          <div>
            <p className="profile-plan">{isPro ? 'Plano Pro' : 'Plano gratuito'}</p>
            <p className="muted">{isPro ? 'Tudo liberado, sem anúncios.' : `Anúncios disponíveis hoje: ${adsLeft} de 5.`}</p>
          </div>
        </div>
        {!isPro && (
          <button className="btn" onClick={onPaywall}>
            Conhecer o Pro
          </button>
        )}
        <button className="btn secondary" onClick={() => onOpen('saveProgress')}>
          Importar ou ver meu save
        </button>
        <button className="link" onClick={onCredits}>
          Fontes e licenças
        </button>
      </section>
    </>
  );
}
