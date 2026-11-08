import { Preferences } from '@capacitor/preferences';
import { useEffect, useState } from 'react';
import { BOWL_POINTS, GIFT_CHANCE, MAX_POINTS, NO_BOWL_PENALTY, PET_KIND, PET_KINDS, PET_POINTS, type PetKind } from '../data/pets';
import { daysLabel, daysToMax } from '../utils/pets';

const KEY = 'meus-pets-v1';

interface MyPet {
  id: string;
  name: string;
  kind: PetKind;
  hearts: number;
}

async function loadPets(): Promise<MyPet[]> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    const list = value ? (JSON.parse(value) as MyPet[]) : [];
    return Array.isArray(list) ? list.filter((p) => p && PET_KIND[p.kind]) : [];
  } catch {
    return [];
  }
}

const savePets = (list: MyPet[]) => void Preferences.set({ key: KEY, value: JSON.stringify(list) });

function Hearts({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="pet-hearts" role="group" aria-label={`Corações de ${label}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="pet-heart"
          aria-label={`${n} ${n === 1 ? 'coração' : 'corações'}`}
          aria-pressed={value >= n}
          onClick={() => onChange(value === n ? n - 1 : n)}
        >
          {value >= n ? '❤️' : '🤍'}
        </button>
      ))}
    </div>
  );
}

function MyPets() {
  const [pets, setPets] = useState<MyPet[] | null>(null);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<PetKind>('cat');
  const [bowl, setBowl] = useState(true);

  useEffect(() => {
    void loadPets().then(setPets);
  }, []);

  const update = (list: MyPet[]) => {
    setPets(list);
    savePets(list);
  };

  const add = () => {
    const n = name.trim();
    if (!n || !pets) return;
    update([...pets, { id: `${Date.now()}`, name: n, kind, hearts: 0 }]);
    setName('');
  };

  if (!pets) return <p className="muted">Carregando…</p>;

  return (
    <>
      {pets.length === 0 && <p className="muted">Adicione seu pet para acompanhar a amizade.</p>}
      {pets.map((p) => {
        const info = PET_KIND[p.kind];
        const days = daysToMax(p.hearts, bowl);
        return (
          <div key={p.id} className="card pet-card" style={{ cursor: 'default' }}>
            <div className="pet-card__head">
              <span className="pet-emoji" aria-hidden="true">
                {info.emoji}
              </span>
              <span className="title">{p.name}</span>
              <button
                type="button"
                className="link pet-remove"
                aria-label={`Remover ${p.name}`}
                onClick={() => update(pets.filter((x) => x.id !== p.id))}
              >
                Remover
              </button>
            </div>
            <Hearts value={p.hearts} label={p.name} onChange={(h) => update(pets.map((x) => (x.id === p.id ? { ...x, hearts: h } : x)))} />
            <p className="small" style={{ margin: '6px 0 0' }}>
              {days === 0
                ? `Amizade máxima! Ao fazer o primeiro carinho do dia, ${GIFT_CHANCE}% de chance de ganhar um presente.`
                : `Faltam cerca de ${daysLabel(days)} para a amizade máxima.`}
            </p>
          </div>
        );
      })}

      <label className="pet-toggle">
        <input type="checkbox" checked={bowl} onChange={(e) => setBowl(e.target.checked)} /> Encho a tigela de água todo dia
      </label>

      <div className="pet-add">
        <h2>Adicionar pet</h2>
        <div className="row" role="group" aria-label="Tipo de pet">
          {PET_KINDS.map((k) => (
            <button key={k.kind} type="button" className="chip" aria-pressed={kind === k.kind} onClick={() => setKind(k.kind)}>
              {k.emoji} {k.label}
            </button>
          ))}
        </div>
        <div className="row">
          <input
            className="pet-name"
            placeholder="Nome do pet"
            aria-label="Nome do pet"
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <button type="button" className="btn" disabled={!name.trim()} onClick={add}>
            Adicionar
          </button>
        </div>
      </div>
    </>
  );
}

type Tab = 'meus' | 'como' | 'amizade' | 'presentes';
const TABS: { id: Tab; label: string }[] = [
  { id: 'meus', label: 'Meus pets' },
  { id: 'como', label: 'Como conseguir' },
  { id: 'amizade', label: 'Amizade' },
  { id: 'presentes', label: 'Presentes' },
];

export function Pets() {
  const [tab, setTab] = useState<Tab>('meus');
  const [giftKind, setGiftKind] = useState<PetKind>('cat');

  return (
    <>
      <h1>Pets</h1>
      <div className="row" role="tablist" aria-label="Seções">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" className="chip" aria-selected={tab === t.id} aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'meus' && <MyPets />}

      {tab === 'como' && (
        <>
          <h2>O primeiro pet</h2>
          <p>
            A Marnie aparece na porta de casa com um gato ou cachorro, conforme o que você escolheu ao criar o personagem. Isso
            acontece na primeira <strong>quarta ou sexta de sol da Primavera</strong> depois de você ter ganhado{' '}
            <strong>1.000g</strong>, se sair de casa entre <strong>6h e 9h30</strong>. Se não der certo, ela vem até o{' '}
            <strong>dia 20 da Primavera</strong> de qualquer jeito.
          </p>
          <p className="muted small">Aceitar é opcional. O nome escolhido na hora não pode ser trocado depois.</p>

          <h2>Mais pets</h2>
          <p>
            Compre licenças na <strong>Fazenda da Marnie</strong> depois de chegar à <strong>amizade máxima</strong> com o pet
            atual, ou no <strong>Ano 2</strong> se ainda não tiver nenhum.
          </p>
          {PET_KINDS.map((k) => (
            <div key={k.kind} className="card" style={{ cursor: 'default' }}>
              <span className="title">
                {k.emoji} {k.label} <span className="muted small">· {k.styles} visuais</span>
              </span>
              <span style={{ display: 'block', marginTop: 4 }}>{k.howToGet}</span>
              <span className="muted small" style={{ display: 'block', marginTop: 4 }}>
                {k.hat ? 'Pode usar chapéu.' : 'Não usa chapéu.'}
              </span>
            </div>
          ))}
          <div className="notice" role="note">
            <strong>Uma tigela por pet</strong>
            Cada pet extra precisa da própria tigela, construída na carpintaria da Robin. Sem tigela, ele perde {NO_BOWL_PENALTY}{' '}
            pontos de amizade por noite e não sai de casa.
          </div>
        </>
      )}

      {tab === 'amizade' && (
        <>
          <ul className="pet-rules">
            <li>
              <strong>Carinho:</strong> +{PET_POINTS} pontos, uma vez por dia.
            </li>
            <li>
              <strong>Tigela com água:</strong> +{BOWL_POINTS} pontos na manhã seguinte. A chuva enche sozinha; o regador automático
              não enche.
            </li>
            <li>
              <strong>Máximo:</strong> {MAX_POINTS} pontos = 5 corações (200 por coração).
            </li>
            <li>
              <strong>Sem tigela:</strong> −{NO_BOWL_PENALTY} pontos por noite.
            </li>
            <li>Ignorar o pet ou acertá-lo com o estilingue não tira amizade.</li>
            <li>
              Perto do máximo (999 pontos), o pet vale <strong>1 ponto na avaliação do Vovô</strong>.
            </li>
          </ul>
          <div className="notice" role="note">
            <strong>Do zero ao máximo</strong>
            {daysLabel(84)} só com carinho, ou {daysLabel(56)} com carinho e tigela todo dia.
          </div>
        </>
      )}

      {tab === 'presentes' && (
        <>
          <p>
            Com amizade máxima, o primeiro carinho do dia tem <strong>{GIFT_CHANCE}%</strong> de chance de o pet trazer um presente.
            Se trouxer, a chance de cada item é:
          </p>
          <div className="row" role="group" aria-label="Tipo de pet">
            {PET_KINDS.map((k) => (
              <button key={k.kind} type="button" className="chip" aria-pressed={giftKind === k.kind} onClick={() => setGiftKind(k.kind)}>
                {k.emoji} {k.label}
              </button>
            ))}
          </div>
          <ul className="pet-gifts">
            {PET_KIND[giftKind].gifts.map((g) => (
              <li key={g.item}>
                <span>{g.item}</span>
                <span className="muted">{g.chance.toLocaleString('pt-BR')}%</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="muted small" style={{ marginTop: 16 }}>
        Fonte: Stardew Valley Wiki (versão 1.6).
      </p>
    </>
  );
}
