import { useMemo, useState } from 'react';
import giftsJson from '../data/gifts.json';
import villagersJson from '../data/villagers.json';
import { Portrait } from '../ui/Portrait';
import { TASTES, TASTE_LABEL, type GiftData, type Taste } from '../utils/gifts';
import {
  addressLabel,
  displayName,
  locationLabel,
  roleLabel,
  seasonLabel,
  type Relative,
  type Villager,
  type VillagerData,
} from '../utils/villagers';

const data = villagersJson as unknown as VillagerData;
const gifts = giftsJson as unknown as GiftData;
const ALL = [...data.villagers].sort((a, b) => displayName(a.name).localeCompare(displayName(b.name), 'pt-BR'));
const MEN = ALL.filter((v) => v.romance === 'bachelor');
const WOMEN = ALL.filter((v) => v.romance === 'bachelorette');
const OTHERS = ALL.filter((v) => !v.romance);
const KNOWN = new Set(ALL.map((v) => v.name));

const TASTE_EMOJI: Record<Taste, string> = { love: '🥰', like: '🙂', neutral: '😐', dislike: '😕', hate: '😡' };

export function Villagers() {
  const [selected, setSelected] = useState<string | null>(null);
  const villager = selected ? ALL.find((v) => v.name === selected) : undefined;

  if (villager) return <Profile villager={villager} onBack={() => setSelected(null)} onOpen={setSelected} />;

  return (
    <>
      <h1>Moradores</h1>
      <p className="muted">Toque em um personagem para ver aniversário, onde mora, família e presentes.</p>
      <h2>Candidatos de casamento</h2>
      <h3 className="vgroup">Homens</h3>
      <Grid list={MEN} onOpen={setSelected} />
      <h3 className="vgroup">Mulheres</h3>
      <Grid list={WOMEN} onOpen={setSelected} />
      <h2>NPCs não casáveis</h2>
      <Grid list={OTHERS} onOpen={setSelected} />
    </>
  );
}

function Grid({ list, onOpen }: { list: readonly Villager[]; onOpen: (name: string) => void }) {
  return (
    <div className="vgrid">
      {list.map((v) => (
        <button key={v.name} type="button" className="vcard" onClick={() => onOpen(v.name)} aria-label={displayName(v.name)}>
          <Portrait name={v.name} size={72} />
          <span>{displayName(v.name)}</span>
        </button>
      ))}
    </div>
  );
}

function RelativeList({ items, onOpen }: { items: readonly Relative[]; onOpen: (name: string) => void }) {
  return (
    <ul className="rel">
      {items.map((r) => {
        const label = displayName(r.name) + (r.role ? ` (${roleLabel(r.role)})` : '');
        return (
          <li key={r.name + (r.role ?? '')}>
            {KNOWN.has(r.name) ? (
              <button type="button" className="rel-link" onClick={() => onOpen(r.name)}>
                {label}
              </button>
            ) : (
              label
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Profile({ villager: v, onBack, onOpen }: { villager: Villager; onBack: () => void; onOpen: (name: string) => void }) {
  const [taste, setTaste] = useState<Taste>('love');
  const g = useMemo(() => gifts.villagers.find((x) => x.name === v.name), [v.name]);
  const items = g?.tastes[taste] ?? [];
  const groups = g?.groups[taste] ?? [];

  return (
    <>
      <button type="button" className="back" onClick={onBack}>
        ← Todos os moradores
      </button>
      <h1>{displayName(v.name)}</h1>

      <div className="vhead">
        <Portrait name={v.name} size={112} />
        <dl className="vinfo">
          <div>
            <dt>Aniversário</dt>
            <dd>
              {v.birthday.day} {seasonLabel(v.birthday.season)}
            </dd>
          </div>
          <div>
            <dt>Região</dt>
            <dd>{locationLabel(v.location)}</dd>
          </div>
          <div>
            <dt>Endereço</dt>
            <dd>{addressLabel(v.address)}</dd>
          </div>
          <div>
            <dt>Romanceável</dt>
            <dd>{v.romanceable ? 'Sim' : 'Não'}</dd>
          </div>
        </dl>
      </div>

      <section className="card vsec" aria-label="Relacionamentos">
        <h2>Relacionamentos</h2>
        {v.family.length === 0 && v.friends.length === 0 ? (
          <p className="muted center">Nenhuma</p>
        ) : (
          <>
            {v.family.length > 0 && (
              <>
                <h3>Família</h3>
                <RelativeList items={v.family} onOpen={onOpen} />
              </>
            )}
            {v.friends.length > 0 && (
              <>
                <h3>Amigos</h3>
                <RelativeList items={v.friends} onOpen={onOpen} />
              </>
            )}
          </>
        )}
      </section>

      <section className="card vsec" aria-label="Melhores presentes">
        <h2>Presentes</h2>
        {g ? (
          <>
            <div className="taste-tabs" role="tablist" aria-label="Gosto">
              {TASTES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={taste === t}
                  aria-label={TASTE_LABEL[t]}
                  className="taste-tab"
                  onClick={() => setTaste(t)}
                >
                  <span aria-hidden="true">{TASTE_EMOJI[t]}</span>
                </button>
              ))}
            </div>
            <p className="taste-title">{TASTE_LABEL[taste]}</p>
            {items.length === 0 && groups.length === 0 ? (
              <p className="muted">Nada específico nesta lista.</p>
            ) : (
              <div className="row">
                {items.map((e) => (
                  <span key={e.name + (e.note ?? '')} className="gift-chip">
                    {e.name}
                    {e.note ? <small> ({e.note})</small> : null}
                  </span>
                ))}
              </div>
            )}
            {groups.length > 0 && <p className="muted small">Também: {groups.join(', ')}</p>}
            {taste === 'love' && <p className="muted small">Itens que todos amam também agradam {displayName(v.name)}, salvo exceções.</p>}
          </>
        ) : (
          <p className="muted">Ainda não temos os gostos de presente deste personagem.</p>
        )}
      </section>

      <p className="muted small">Fonte: Stardew Valley Wiki (CC BY-SA). Nomes de itens e categorias de presente seguem em inglês.</p>
    </>
  );
}
