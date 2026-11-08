import { useMemo, useState } from 'react';
import { ANIMALS, goldPerDay, type AnimalHome } from '../data/animals';

const gold = (n: number) => `${Math.round(n).toLocaleString('pt-BR')}g`;

type Filter = 'all' | AnimalHome;
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'coop', label: '🐔 Galinheiro' },
  { id: 'barn', label: '🐄 Estábulo' },
];

const STRATEGIES: { title: string; text: string }[] = [
  {
    title: '🐖 Porcos são os campeões',
    text: 'Cada trufa vale 625g e vira Óleo de Trufa (1.065g). Com a profissão Botânico (Coleta), toda trufa sai com qualidade irídio e vale o dobro (1.250g), mais que o Óleo de Trufa sem a profissão Artesão. Solte os porcos todo dia de sol fora do inverno.',
  },
  {
    title: '🧀 Transforme quase tudo',
    text: 'Ovo vira maionese, leite vira queijo, lã vira tecido. O produto artesanal vale muito mais que o original. Tenha uma máquina por animal, ou quase, para não acumular.',
  },
  {
    title: '🎓 Escolha Lavrador e depois Artesão',
    text: 'Pecuarista dá +20% só no produto cru. Se você processa, o caminho é Lavrador (nível 5 de Cultivo) e Artesão (nível 10): +40% em maionese, queijo, tecido e óleo.',
  },
  {
    title: '🍷 Envelheça o queijo no porão',
    text: 'Com a 3ª reforma da casa, coloque queijo e queijo de cabra em barris no porão. O queijo chega à qualidade irídio e vale o dobro.',
  },
  {
    title: '❤️ Amizade dá ovo e leite grandes',
    text: 'Faça carinho todo dia, deixe sair nos dias de sol e mantenha feno no comedouro. Animais felizes dão produtos grandes e de qualidade melhor; patos e coelhos só soltam pena e pé de coelho com amizade alta.',
  },
  {
    title: '🦆 Pato e coelho para o Centro Comunitário',
    text: 'Pena de Pato e Pé de Coelho são raros e valem muito. Vale guardar alguns para pacotes e presentes antes de vender.',
  },
  {
    title: '🌾 Feno de graça',
    text: 'Construa um Silo e corte grama com a foice: o feno vai direto para lá. Plante grama (Semente de Grama) perto do estábulo para os animais comerem no pasto e economizar feno.',
  },
  {
    title: '🧺 Deixe o trabalho com as máquinas',
    text: 'O Coletor Automático (Marnie) junta os produtos do galinheiro e do estábulo sozinho, e as versões Deluxe põem o feno sozinhas. Com a Maestria de Cultivo, Biscoitos Dourados de Animais dobram a produção de um animal para sempre.',
  },
];

export function Animals() {
  const [filter, setFilter] = useState<Filter>('all');
  const [artisanProf, setArtisanProf] = useState(false);
  const list = useMemo(() => ANIMALS.filter((a) => filter === 'all' || a.home === filter), [filter]);

  return (
    <>
      <h1>Animais</h1>
      <p>Os animais da fazenda: onde vivem, quanto custam, o que dão e quanto rendem por dia.</p>
      <div className="notice" role="note">
        <strong>🐮 Rancho da Marnie</strong>
        A Marnie vende os animais e o feno, ao sul da fazenda. Primeiro construa o galinheiro ou estábulo certo com a Robin. Cada
        animal precisa de feno no comedouro (ou de grama no pasto), de carinho diário e, no inverno, de um aquecedor para ficar
        feliz.
      </div>

      <div className="row" role="group" aria-label="Filtrar por construção">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <label className="pet-toggle">
        <input type="checkbox" checked={artisanProf} onChange={(e) => setArtisanProf(e.target.checked)} /> Tenho a profissão Artesão
        (+40%)
      </label>

      {list.map((a) => (
        <div key={a.id} className="card recipe-card" style={{ cursor: 'default' }}>
          <div className="recipe-card__head">
            <span className="pet-emoji" aria-hidden="true">
              {a.emoji}
            </span>
            <span className="title">{a.pt}</span>
            <span className="animal-price">{a.price === null ? 'Não se compra' : gold(a.price)}</span>
          </div>
          <ul className="recipe-src">
            <li>🏠 Precisa de: {a.building}.</li>
            {a.howToGet && <li>🥚 {a.howToGet}</li>}
            <li>
              📦 {a.product.name}: <strong>{gold(a.product.value)}</strong>
              {a.everyDays === 1 ? ' todo dia' : ` a cada ${a.everyDays} dias`}
              {a.product.note && <span className="muted"> ({a.product.note})</span>}
            </li>
            {a.extra && (
              <li>
                ✨ {a.extra.name}: <strong>{gold(a.extra.value)}</strong>
                {a.extra.note && <span className="muted"> ({a.extra.note})</span>}
              </li>
            )}
            {a.artisan && (
              <li>
                🏭 {a.artisan.machine} → {a.artisan.name}: <strong>{gold(a.artisan.value * (artisanProf ? 1.4 : 1))}</strong>
              </li>
            )}
          </ul>
          <span className="animal-day">
            Rende por dia: {gold(goldPerDay(a, false))} cru
            {a.artisan && ` · ${gold(goldPerDay(a, true, artisanProf))} processado`}
          </span>
        </div>
      ))}

      <h2>💰 Melhores estratégias para lucrar</h2>
      {STRATEGIES.map((s) => (
        <div key={s.title} className="card" style={{ cursor: 'default' }}>
          <span className="title">{s.title}</span>
          <span style={{ display: 'block', marginTop: 4 }}>{s.text}</span>
        </div>
      ))}
      <p className="muted small" style={{ marginTop: 16 }}>
        Valores-base, com qualidade normal. Fonte: Stardew Valley Wiki (versão 1.6).
      </p>
    </>
  );
}
