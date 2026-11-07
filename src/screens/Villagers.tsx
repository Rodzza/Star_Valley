import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import giftsJson from '../data/gifts.json';
import villagersJson from '../data/villagers.json';
import { BIOS } from '../data/bios';
import casaIcon from '../assets/icons/casa.png';
import primaveraIcon from '../assets/icons/primavera.png';
import veraoIcon from '../assets/icons/verao.png';
import outonoIcon from '../assets/icons/outono.png';
import invernoIcon from '../assets/icons/inverno.png';
import { Portrait } from '../ui/Portrait';
import { TASTES, TASTE_LABEL, tasteOf, type GiftData, type GiftEntry, type Taste } from '../utils/gifts';
import { itemEmoji, itemLabel, noteLabel } from '../utils/items';
import { isDark, removeUserPortrait, setUserPortrait, useUserPortrait, useUserPortraitColor } from '../utils/userPortraits';
import {
  addressLabel,
  displayName,
  locationLabel,
  roleLabel,
  seasonLabel,
  type Relative,
  type SeasonKey,
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

const SEASON_ICON: Record<SeasonKey, string> = { spring: primaveraIcon, summer: veraoIcon, fall: outonoIcon, winter: invernoIcon };
const TASTE_EMOJI: Record<Taste, string> = { love: '🥰', like: '🙂', neutral: '😐', dislike: '😕', hate: '😡' };

/** Cenário de fundo do painel conforme a região onde o morador vive. */
const SCENE: Record<string, string> = {
  'Pelican Town': 'vila',
  'The Mountain': 'montanha',
  'Cindersap Forest': 'floresta',
  'The Beach': 'praia',
  'Calico Desert': 'deserto',
  'Ginger Island': 'praia',
};

type View = { kind: 'list' } | { kind: 'villager'; name: string } | { kind: 'item'; name: string };

export function Villagers() {
  const [stack, setStack] = useState<View[]>([{ kind: 'list' }]);
  const view = stack[stack.length - 1]!;
  const open = (v: View) => setStack((s) => [...s, v]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const openVillager = (name: string) => open({ kind: 'villager', name });
  const openItem = (name: string) => open({ kind: 'item', name });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stack.length]);

  if (view.kind === 'villager') {
    const v = ALL.find((x) => x.name === view.name);
    if (v) return <Dashboard villager={v} onBack={back} onVillager={openVillager} onItem={openItem} />;
  }
  if (view.kind === 'item') return <ItemPage name={view.name} onBack={back} onVillager={openVillager} />;

  return (
    <>
      <h1>Moradores</h1>
      <p className="muted">Toque em um personagem para ver aniversário, onde mora, família e presentes.</p>
      <h2>Candidatos de casamento</h2>
      <h3 className="vgroup">Homens</h3>
      <Grid list={MEN} onOpen={openVillager} />
      <h3 className="vgroup">Mulheres</h3>
      <Grid list={WOMEN} onOpen={openVillager} />
      <h2>NPCs não casáveis</h2>
      <Grid list={OTHERS} onOpen={openVillager} />
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

function ItemTile({ entry, onItem, size = 'md' }: { entry: GiftEntry; onItem: (name: string) => void; size?: 'md' | 'sm' }) {
  const label = itemLabel(entry.name);
  return (
    <button type="button" className={`vp-item vp-item--${size}`} onClick={() => onItem(entry.name)} aria-label={`${label}: ver quem gosta`}>
      <span className="vp-item-box" aria-hidden="true">
        {itemEmoji(entry.name)}
      </span>
      <span className="vp-item-name">
        {label}
        {entry.note ? <small> ({noteLabel(entry.note)})</small> : null}
      </span>
    </button>
  );
}

type Tab = 'presentes' | 'horarios' | 'eventos' | 'casamento' | 'missoes';
const TABS: ReadonlyArray<{ id: Tab; label: string; soon?: boolean }> = [
  { id: 'presentes', label: 'Presentes' },
  { id: 'horarios', label: 'Horários', soon: true },
  { id: 'eventos', label: 'Eventos de\u00a0Coração', soon: true },
  { id: 'casamento', label: 'Casamento', soon: true },
  { id: 'missoes', label: 'Missões', soon: true },
];

/** Molduras e caixa de texto escuras nas regiões sombrias; pergaminho nas claras (como no painel da Haley). */
const DARK_SCENES = new Set(['montanha', 'floresta']);

/** Nome que leva ao painel do morador, quando ele existe na lista. */
function NameLink({ name, onVillager }: { name: string; onVillager: (n: string) => void }) {
  if (!KNOWN.has(name)) return <>{displayName(name)}</>;
  return (
    <button type="button" className="vpx-name-link" onClick={() => onVillager(name)}>
      {displayName(name)}
    </button>
  );
}

/** Caixa "Sobre": a descrição de data/bios.ts, ou um texto montado só com os dados (onde mora, romance, família, amigos). */
function About({ v, onVillager }: { v: Villager; onVillager: (n: string) => void }) {
  const bio = BIOS[v.name];
  if (bio) return <p className="vpx-about">{bio}</p>;
  const nome = displayName(v.name);
  const romance =
    v.romance === 'bachelor' ? 'É um dos candidatos de casamento.' : v.romance === 'bachelorette' ? 'É uma das candidatas de casamento.' : 'Não é romanceável.';
  return (
    <p className="vpx-about">
      {nome} mora em {addressLabel(v.address)}, {locationLabel(v.location)}. {romance}
      {v.family.length > 0 && (
        <>
          {' '}Família:{' '}
          {v.family.map((r, i) => (
            <span key={r.name + (r.role ?? '')}>
              {i > 0 && ', '}
              <NameLink name={r.name} onVillager={onVillager} />
              {r.role ? ` (${roleLabel(r.role).toLowerCase()})` : ''}
            </span>
          ))}
          .
        </>
      )}
      {v.friends.length > 0 && (
        <>
          {' '}Amigos próximos:{' '}
          {v.friends.map((r, i) => (
            <span key={r.name}>
              {i > 0 && ', '}
              <NameLink name={r.name} onVillager={onVillager} />
            </span>
          ))}
          .
        </>
      )}
    </p>
  );
}

/** Escolher uma imagem da galeria para o retrato deste morador (fica só no aparelho). */
function PortraitPicker({ name }: { name: string }) {
  const atual = useUserPortrait(name);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const nome = displayName(name);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setMsg('');
    try {
      await setUserPortrait(name, file);
      setMsg('Imagem salva neste celular.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Não foi possível salvar a imagem.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="vpx-picker">
      <div className="vpx-picker-row">
        <button type="button" className="btn" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? 'Salvando…' : atual ? '🖼️ Trocar imagem' : `🖼️ Usar uma imagem minha para ${nome}`}
        </button>
        {atual && (
          <button type="button" className="link" disabled={busy} onClick={() => void removeUserPortrait(name).then(() => setMsg('Imagem removida.'))}>
            Remover
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => void onFile(e)} />
      <p className="muted small">A imagem fica só no seu celular e não é enviada para lugar nenhum.</p>
      {msg && (
        <p className="small" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}

function Dashboard({
  villager: v,
  onBack,
  onVillager,
  onItem,
}: {
  villager: Villager;
  onBack: () => void;
  onVillager: (name: string) => void;
  onItem: (name: string) => void;
}) {
  const [tab, setTab] = useState<Tab>('presentes');
  const [taste, setTaste] = useState<Taste>('love');
  const g = useMemo(() => gifts.villagers.find((x) => x.name === v.name), [v.name]);
  useEffect(() => {
    setTab('presentes');
    setTaste('love');
  }, [v.name]);

  // O painel ocupa a tela inteira: esconde o cartão e o "Voltar" do app enquanto está aberto.
  useEffect(() => {
    document.body.classList.add('vpx-on');
    return () => document.body.classList.remove('vpx-on');
  }, []);

  const scene = SCENE[v.location] ?? 'vila';
  // Com imagem escolhida pelo usuário, o painel assume a cor do fundo dela.
  const cor = useUserPortraitColor(v.name);
  const tone = cor ? (isDark(cor) ? 'dark' : 'light') : DARK_SCENES.has(scene) ? 'dark' : 'light';
  const corStyle = cor ? ({ '--scene-bg': `rgb(${cor.join(' ')})` } as CSSProperties) : undefined;
  const loved = g?.tastes.love ?? [];
  const destaque = loved.slice(0, 6);
  const esquerda = destaque.filter((_, i) => i % 2 === 0);
  const direita = destaque.filter((_, i) => i % 2 === 1);
  const items = g?.tastes[taste] ?? [];
  const groups = g?.groups[taste] ?? [];
  const nome = displayName(v.name);
  const soon = TABS.find((t) => t.id === tab)?.soon;

  return (
    <div className={`vpx ${cor ? 'vpx--custom' : `vpx--${scene}`} vpx--${tone}`} style={corStyle}>
      <header className="vpx-top">
        <button type="button" className="vpx-back" onClick={onBack} aria-label="Voltar para os moradores">
          ‹
        </button>
        <div className="vpx-top-item">
          <img src={casaIcon} alt="" className="vpx-top-icon" />
          <span>Mora: {locationLabel(v.location)}</span>
        </div>
        <div className="vpx-top-item vpx-top-item--right">
          <span>
            Aniversário: {seasonLabel(v.birthday.season)} {v.birthday.day}
          </span>
          <img src={SEASON_ICON[v.birthday.season]} alt="" className="vpx-top-icon" />
        </div>
      </header>

      <section className="vpx-stage" aria-label={`Presentes que ${nome} ama`}>
        <div className="vpx-portrait">
          <Portrait name={v.name} size={240} />
        </div>
        <div className="vpx-col vpx-col--left">
          {esquerda.map((e) => (
            <ItemTile key={e.name} entry={e} onItem={onItem} />
          ))}
        </div>
        <div className="vpx-col vpx-col--right">
          {direita.map((e) => (
            <ItemTile key={e.name} entry={e} onItem={onItem} />
          ))}
        </div>
        <h1 className="vpx-plaque">{nome}</h1>
      </section>
      {loved.length === 0 && <p className="vpx-note">Ainda não temos os presentes favoritos de {nome}.</p>}

      <About v={v} onVillager={onVillager} />

      <nav className="vpx-tabs" role="tablist" aria-label="Seções">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`vpx-tab ${t.soon ? 'vpx-tab--soon' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="vpx-tab-badge" aria-hidden="true">
              {t.soon ? '🔒' : '★'}
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      <section className="vpx-panel" role="tabpanel">
        {tab === 'presentes' &&
          (g ? (
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
                <div className="vp-item-grid">
                  {items.map((e) => (
                    <ItemTile key={e.name + (e.note ?? '')} entry={e} onItem={onItem} size="sm" />
                  ))}
                </div>
              )}
              {groups.length > 0 && <p className="muted small">Também: {groups.join(', ')}</p>}
              {taste === 'love' && <p className="muted small">Itens que todos amam também agradam {nome}, salvo exceções.</p>}
            </>
          ) : (
            <p className="muted">Ainda não temos os gostos de presente deste personagem.</p>
          ))}
        {soon && (
          <p className="muted center">
            <strong>Em breve.</strong> Esta seção ainda está sendo preparada.
          </p>
        )}
        <PortraitPicker name={v.name} />
        <p className="muted small">Fonte: Stardew Valley Wiki (CC BY-SA). Nomes de itens traduzidos sem conferência no jogo.</p>
      </section>
    </div>
  );
}

function ItemPage({ name, onBack, onVillager }: { name: string; onBack: () => void; onVillager: (name: string) => void }) {
  const label = itemLabel(name);
  const porGosto = useMemo(() => {
    const out: Record<Taste, string[]> = { love: [], like: [], neutral: [], dislike: [], hate: [] };
    for (const vg of gifts.villagers) {
      const t = tasteOf(gifts, vg, name);
      if (t !== 'unknown' && KNOWN.has(vg.name)) out[t].push(vg.name);
    }
    for (const t of TASTES) out[t].sort((a, b) => displayName(a).localeCompare(displayName(b), 'pt-BR'));
    return out;
  }, [name]);
  const algum = TASTES.some((t) => porGosto[t].length > 0);

  return (
    <div className="vp">
      <button type="button" className="back" onClick={onBack}>
        ← Voltar ao perfil
      </button>
      <header className="ip-head">
        <span className="vp-item-box ip-icon" aria-hidden="true">
          {itemEmoji(name)}
        </span>
        <div>
          <h1>{label}</h1>
          {label !== name && <p className="muted small">Na wiki: {name}</p>}
        </div>
      </header>

      {!algum && <p className="muted">A wiki não lista nenhum morador com gosto definido para este item.</p>}

      {TASTES.filter((t) => porGosto[t].length > 0).map((t) => (
        <section key={t} className="card vp-panel">
          <h2>
            <span aria-hidden="true">{TASTE_EMOJI[t]} </span>
            {TASTE_LABEL[t]} <span className="muted small">({porGosto[t].length})</span>
          </h2>
          <div className="ip-people">
            {porGosto[t].map((n) => (
              <button key={n} type="button" className="vcard ip-person" onClick={() => onVillager(n)}>
                <Portrait name={n} size={52} />
                <span>{displayName(n)}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      <p className="muted small">Inclui gostos universais e as exceções de cada morador. Fonte: Stardew Valley Wiki (CC BY-SA).</p>
    </div>
  );
}
