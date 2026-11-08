import { Preferences } from '@capacitor/preferences';
import { useEffect, useMemo, useState } from 'react';
import { BUILDINGS, GROUP_LABEL, type Building, type BuildingGroup } from '../data/buildings';
import { itemLabel } from '../utils/items';

const KEY = 'construcoes-feitas-v1';

type Filter = 'all' | BuildingGroup | 'missing';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'animais', label: '🐔 Animais' },
  { id: 'fazenda', label: '🌾 Fazenda' },
  { id: 'casa', label: '🏠 Casa' },
  { id: 'vila', label: '🛤️ Vila' },
  { id: 'magia', label: '🧙 Mago' },
  { id: 'missing', label: 'Faltando' },
];

const gold = (n: number) => `${n.toLocaleString('pt-BR')}g`;
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const materialsText = (b: Building): string =>
  b.materials.length ? b.materials.map((m) => `${itemLabel(m.item)} ×${m.qty}`).join(', ') : 'Só ouro';

export function filterBuildings(list: readonly Building[], filter: Filter, query: string, built: ReadonlySet<string>): Building[] {
  const q = norm(query.trim());
  return list
    .filter((b) => (filter === 'all' ? true : filter === 'missing' ? !built.has(b.id) : b.group === filter))
    .filter((b) => !q || norm(`${b.pt} ${b.effect} ${materialsText(b)} ${b.requires ?? ''}`).includes(q));
}

export function Buildings() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [built, setBuilt] = useState<Set<string>>(new Set());

  useEffect(() => {
    void Preferences.get({ key: KEY })
      .then(({ value }) => {
        const list = value ? (JSON.parse(value) as unknown) : [];
        if (Array.isArray(list)) setBuilt(new Set(list.filter((x): x is string => typeof x === 'string')));
      })
      .catch(() => undefined);
  }, []);

  const toggle = (id: string) => {
    setBuilt((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      void Preferences.set({ key: KEY, value: JSON.stringify([...next]) });
      return next;
    });
  };

  const list = useMemo(() => filterBuildings(BUILDINGS, filter, query, built), [filter, query, built]);

  return (
    <>
      <h1>Projetos e construções</h1>
      <p>Tudo o que dá para construir na fazenda e na vila, quanto custa e o que cada coisa faz.</p>

      <div className="notice" role="note">
        <strong>🔨 Carpintaria da Robin</strong>
        Fica na montanha, ao norte da vila. Você escolhe a construção, entrega o ouro e os materiais, e a Robin vai até a fazenda
        trabalhar. Durante a obra ela não aceita outro pedido. A carpintaria fecha às terças e quando a Robin está numa festa.
      </div>
      <p className="muted small">
        🧙 As construções mágicas são feitas pelo Mago, na torre dele na Floresta Cindersap, e ficam prontas na hora. O
        livro dele só abre depois que ele te ensina a entender os Junimos, durante a história do Centro Comunitário.
      </p>

      <input
        className="pet-name recipe-search"
        type="search"
        placeholder="Buscar construção ou material"
        aria-label="Buscar construção"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="row" role="group" aria-label="Filtrar por tipo">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <p className="muted small" role="status">
        {built.size} de {BUILDINGS.length} feitas · mostrando {list.length}
      </p>

      {list.map((b) => {
        const done = built.has(b.id);
        return (
          <div key={b.id} className={`card recipe-card${done ? ' recipe-card--done' : ''}`} style={{ cursor: 'default' }}>
            <div className="recipe-card__head">
              <span className="pet-emoji" aria-hidden="true">
                {b.emoji}
              </span>
              <span className="title">{b.pt}</span>
              <label className="recipe-check">
                <input type="checkbox" checked={done} onChange={() => toggle(b.id)} />
                <span>Construí</span>
              </label>
            </div>
            <span className="recipe-ing">{b.effect}</span>
            <ul className="recipe-src">
              <li>
                💰 <strong>{gold(b.gold)}</strong>
                {b.materials.length > 0 && ` + ${materialsText(b)}`}
              </li>
              <li>
                {b.builder === 'robin' ? '🔨 Robin' : '🧙 Mago'} ·{' '}
                {b.days === 0 ? 'fica pronto na hora' : `${b.days} ${b.days === 1 ? 'dia' : 'dias'} de obra`} · {GROUP_LABEL[b.group]}
              </li>
              {b.requires && <li>🔒 Precisa: {b.requires}.</li>}
            </ul>
          </div>
        );
      })}
      {list.length === 0 && <p className="muted">Nenhuma construção encontrada.</p>}

      <p className="muted small" style={{ marginTop: 16 }}>
        Fonte: Stardew Valley Wiki e guias da versão 1.6.
      </p>
    </>
  );
}
