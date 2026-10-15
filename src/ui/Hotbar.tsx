import { FEATURE_BY_ID, type FeatureId } from '../features/registry';
import { useEntitlements } from '../monetization/EntitlementsContext';
import { FEATURE_ICON } from './featureIcons';
import { PixelIcon, type IconName } from './PixelIcon';

export type HotbarTarget = 'home' | FeatureId;

const SLOTS: ReadonlyArray<{ target: HotbarTarget; label: string; icon: IconName }> = [
  { target: 'home', label: 'Início', icon: 'house' },
  { target: 'cropPlanner', label: 'Plantio', icon: FEATURE_ICON.cropPlanner },
  { target: 'giftFinder', label: 'Presentes', icon: FEATURE_ICON.giftFinder },
  { target: 'saveProgress', label: 'Save', icon: FEATURE_ICON.saveProgress },
  { target: 'floatingQuests', label: 'Missões', icon: FEATURE_ICON.floatingQuests },
];

/** Barra de atalhos no rodapé; o slot da tela atual ganha a moldura vermelha. */
export function Hotbar({ current, onGo }: { current: HotbarTarget | null; onGo: (t: HotbarTarget) => void }) {
  const { available } = useEntitlements();
  return (
    <nav className="hotbar" aria-label="Atalhos">
      {SLOTS.map((s) => {
        const locked = s.target !== 'home' && !available(s.target);
        const name = s.target === 'home' ? 'Início' : FEATURE_BY_ID[s.target].title;
        return (
          <button
            key={s.target}
            type="button"
            className="slot"
            aria-current={current === s.target ? 'page' : undefined}
            aria-label={locked ? `${name} (bloqueado)` : name}
            onClick={() => onGo(s.target)}
          >
            <PixelIcon name={s.icon} size={30} />
            <span className="slot-label">{s.label}</span>
            {locked && (
              <span className="slot-mark">
                <PixelIcon name="lock" size={14} />
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
