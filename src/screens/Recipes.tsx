import { Preferences } from '@capacitor/preferences';
import { useEffect, useMemo, useState } from 'react';
import { itemEmoji } from '../utils/items';
import { RECIPES, filterRecipes, ingredientsText, sourceText, type RecipeFilter } from '../utils/recipes';

const KEY = 'receitas-aprendidas-v1';

const FILTERS: { id: RecipeFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'tv', label: '📺 TV' },
  { id: 'npc', label: '💌 Moradores' },
  { id: 'skill', label: '⭐ Habilidade' },
  { id: 'shop', label: '🛒 Loja' },
  { id: 'missing', label: 'Faltando' },
];

export function Recipes() {
  const [filter, setFilter] = useState<RecipeFilter>('all');
  const [query, setQuery] = useState('');
  const [learned, setLearned] = useState<Set<string>>(new Set());

  useEffect(() => {
    void Preferences.get({ key: KEY })
      .then(({ value }) => {
        const list = value ? (JSON.parse(value) as unknown) : [];
        if (Array.isArray(list)) setLearned(new Set(list.filter((x): x is string => typeof x === 'string')));
      })
      .catch(() => undefined);
  }, []);

  const toggle = (name: string) => {
    setLearned((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      void Preferences.set({ key: KEY, value: JSON.stringify([...next]) });
      return next;
    });
  };

  const list = useMemo(() => filterRecipes(RECIPES, filter, query, learned), [filter, query, learned]);

  return (
    <>
      <h1>Receitas</h1>
      <p>Pratos que você cozinha na cozinha de casa. Eles dão energia e alguns dão bônus, como sorte e velocidade.</p>

      <div className="notice" role="note">
        <strong>📺 Aprendendo pela TV</strong>
        Ligue a TV de casa e escolha o canal <b>A Rainha do Molho</b>. Todo <b>domingo</b> passa uma receita
        nova; assistindo, você aprende na hora. Nas <b>quartas</b> passa uma reprise de uma receita que já foi ao ar e
        que você ainda não aprendeu. O programa tem dois anos de receitas, então perder um domingo não é o fim do mundo.
      </div>
      <p className="muted small">
        Para cozinhar, você precisa da cozinha: é a primeira reforma da casa, feita pela Robin na carpintaria.
      </p>
      <p className="muted small">
        Muitas receitas vêm de moradores: depois de certo nível de amizade, eles mandam a receita pelo correio (💌). Só o Biscoito
        vem de um evento de coração (🎬), com a Evelyn. Nenhuma receita depende de missão.
      </p>

      <input
        className="pet-name recipe-search"
        type="search"
        placeholder="Buscar prato, ingrediente ou morador"
        aria-label="Buscar receita"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="row" role="group" aria-label="Filtrar por forma de aprender">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <p className="muted small" role="status">
        {learned.size} de {RECIPES.length} aprendidas · mostrando {list.length}
      </p>

      {list.map((r) => {
        const done = learned.has(r.name);
        return (
          <div key={r.name} className={`card recipe-card${done ? ' recipe-card--done' : ''}`} style={{ cursor: 'default' }}>
            <div className="recipe-card__head">
              <span className="pet-emoji" aria-hidden="true">
                {itemEmoji(r.name)}
              </span>
              <span className="title">{r.pt}</span>
              <label className="recipe-check">
                <input type="checkbox" checked={done} onChange={() => toggle(r.name)} />
                <span>Aprendi</span>
              </label>
            </div>
            <span className="recipe-ing">
              <span className="muted small">Ingredientes: </span>
              {ingredientsText(r)}
            </span>
            <ul className="recipe-src">
              {r.sources.map((s, i) => {
                const { icon, text } = sourceText(s);
                return (
                  <li key={i}>
                    <span aria-hidden="true">{icon}</span> {text}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {list.length === 0 && <p className="muted">Nenhuma receita encontrada.</p>}

      <p className="muted small" style={{ marginTop: 16 }}>
        Fonte: Stardew Valley Wiki (versão 1.6).
      </p>
    </>
  );
}
