import type { FeatureId } from '../features/registry';
import { PixelIcon } from '../ui/PixelIcon';

interface Props {
  onOpen: (id: FeatureId) => void;
  onCredits: () => void;
  onReviewIntro: () => void;
}

export function Profile({ onOpen, onCredits, onReviewIntro }: Props) {
  return (
    <>
      <h1 className="page-title">Perfil</h1>
      <section className="panel profile">
        <div className="profile-head">
          <span className="avatar big">
            <PixelIcon name="person" size={52} />
          </span>
          <div>
            <p className="profile-plan">Tudo liberado</p>
            <p className="muted">O Stardew Notes é gratuito: sem anúncios e sem compras.</p>
          </div>
        </div>
        <button className="btn secondary" onClick={() => onOpen('notes')}>
          Minhas notas
        </button>
        <button className="btn secondary" onClick={() => onOpen('saveProgress')}>
          Importar ou ver meu save
        </button>
        <button className="btn secondary" onClick={onReviewIntro}>
          Rever a introdução
        </button>
        <button className="link" onClick={onCredits}>
          Sobre, fontes e licenças
        </button>
      </section>
      <p className="muted small disclaimer">
        Aplicativo feito por fã, não oficial e não endossado pela ConcernedApe. Stardew Valley é marca da ConcernedApe LLC.
      </p>
    </>
  );
}
