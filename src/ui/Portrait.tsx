import { displayName, slug } from '../utils/villagers';

const files = import.meta.glob('../assets/portraits/*.{png,webp,jpg,jpeg}', { eager: true, import: 'default' }) as Record<string, string>;
const bySlug = new Map<string, string>(
  Object.entries(files).map(([path, url]) => [(path.split('/').pop() ?? '').replace(/\.[^.]+$/, '').toLowerCase(), url]),
);

const hue = (name: string): number => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};

/** Retrato do morador: usa src/assets/portraits/<nome>.png se existir; senão, avatar com a inicial. */
export function Portrait({ name, size = 96 }: { name: string; size?: number }) {
  const url = bySlug.get(slug(name));
  if (url) return <img className="portrait" src={url} alt="" width={size} height={size} draggable={false} />;
  const h = hue(name);
  return (
    <span
      className="portrait fallback"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.46, background: `linear-gradient(160deg, hsl(${h} 55% 62%), hsl(${h} 50% 40%))` }}
    >
      {displayName(name).charAt(0)}
    </span>
  );
}
