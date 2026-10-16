import { UiIcon, type UiIconName } from './UiIcon';

export type TabId = 'home' | 'explore' | 'saved' | 'profile';

const TABS: ReadonlyArray<{ id: TabId; label: string; icon: UiIconName }> = [
  { id: 'home', label: 'Início', icon: 'home' },
  { id: 'explore', label: 'Explorar', icon: 'search' },
  { id: 'saved', label: 'Salvos', icon: 'bookmark' },
  { id: 'profile', label: 'Perfil', icon: 'user' },
];

export function TabBar({ current, onGo }: { current: TabId | null; onGo: (t: TabId) => void }) {
  return (
    <nav className="tabbar" aria-label="Navegação principal">
      {TABS.map((t) => (
        <button key={t.id} type="button" className="tab" aria-current={current === t.id ? 'page' : undefined} onClick={() => onGo(t.id)}>
          <UiIcon name={t.icon} size={24} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
