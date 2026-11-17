/** Estrela de favorito: preenchida quando marcado. */
export function FavoriteButton({ on, label, onToggle, className = '' }: { on: boolean; label: string; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      className={`fav-btn${on ? ' fav-btn--on' : ''} ${className}`}
      aria-pressed={on}
      aria-label={on ? `Tirar ${label} dos salvos` : `Salvar ${label}`}
      onClick={onToggle}
    >
      {on ? '★' : '☆'}
    </button>
  );
}
