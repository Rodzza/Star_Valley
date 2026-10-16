/** Ícones de traço simples para a barra de navegação e a busca. */
export type UiIconName = 'home' | 'search' | 'bookmark' | 'user';

const PATHS: Record<UiIconName, string> = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M10 19.5v-5h4v5',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm5.2 11.7L20 20',
  bookmark: 'M6.5 4h11v16.5L12 16.8 6.5 20.5Z',
  user: 'M12 4.5a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6ZM4.5 20c.6-3.6 3.6-5.6 7.5-5.6s6.9 2 7.5 5.6',
};

export function UiIcon({ name, size = 24 }: { name: UiIconName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
