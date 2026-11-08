import { Preferences } from '@capacitor/preferences';
import { useEffect, useState } from 'react';
import { MASTERY_COST, SKILLS, XP_TABLE, type Profession, type SkillId } from '../data/skills';

type Tab = SkillId | 'mastery';

const fmt = (n: number) => n.toLocaleString('pt-BR');


const PROGRESS_KEY = 'habilidades-v1';

interface Progress {
  levels: Record<SkillId, number>;
  masteryLevel: number;
  masteryPoints: number;
}

const EMPTY: Progress = {
  levels: { farming: 0, mining: 0, foraging: 0, fishing: 0, combat: 0 },
  masteryLevel: 0,
  masteryPoints: 0,
};

const clampInt = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(Number.isFinite(v) ? v : 0)));

/** Total de pontos para chegar à próxima maestria (como a barra do jogo mostra). */
export const masteryGoal = (level: number): number => MASTERY_COST.slice(0, Math.min(5, level + 1)).reduce((a, b) => a + b, 0);

/** Painel no estilo da tela de habilidades do jogo: 10 quadradinhos por habilidade e a barra da Maestria. */
function ProgressPanel() {
  const [p, setP] = useState<Progress | null>(null);

  useEffect(() => {
    void Preferences.get({ key: PROGRESS_KEY })
      .then(({ value }) => {
        const saved = value ? (JSON.parse(value) as Partial<Progress>) : {};
        setP({ ...EMPTY, ...saved, levels: { ...EMPTY.levels, ...(saved.levels ?? {}) } });
      })
      .catch(() => setP(EMPTY));
  }, []);

  if (!p) return null;
  const save = (next: Progress) => {
    setP(next);
    void Preferences.set({ key: PROGRESS_KEY, value: JSON.stringify(next) });
  };
  const allMax = SKILLS.every((s) => p.levels[s.id] >= 10);
  const done = p.masteryLevel >= 5;
  const goal = masteryGoal(p.masteryLevel);
  const pct = done ? 100 : Math.min(100, (p.masteryPoints / goal) * 100);

  return (
    <div className="sv-panel" aria-label="Meu progresso nas habilidades">
      {SKILLS.map((s) => {
        const lv = p.levels[s.id];
        return (
          <div key={s.id} className="sv-row">
            <span className="sv-label">{s.label}</span>
            <span className="sv-icon" aria-hidden="true">
              {s.emoji}
            </span>
            <span className="sv-pips" role="group" aria-label={`Nível de ${s.label}`}>
              {Array.from({ length: 10 }, (_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    type="button"
                    className={`sv-pip${n === 5 || n === 10 ? ' sv-pip--big' : ''}${lv >= n ? ' sv-pip--on' : ''}`}
                    aria-label={`Nível ${n}`}
                    aria-pressed={lv >= n}
                    onClick={() => save({ ...p, levels: { ...p.levels, [s.id]: lv === n ? n - 1 : n } })}
                  />
                );
              })}
            </span>
            <span className="sv-num">{lv}</span>
          </div>
        );
      })}

      <div className={`sv-row sv-row--mastery${allMax ? '' : ' sv-row--locked'}`}>
        <span className="sv-label">Maestria</span>
        <span className="sv-icon" aria-hidden="true">
          ⭐
        </span>
        <span className="sv-bar" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={p.masteryPoints}>
          <span className="sv-bar__fill" style={{ width: `${allMax ? pct : 0}%` }} />
          <span className="sv-bar__text">{allMax ? (done ? 'Completa!' : `${fmt(p.masteryPoints)}/${fmt(goal)}`) : 'Tudo no nível 10'}</span>
        </span>
        <span className="sv-num">{p.masteryLevel}</span>
      </div>

      {allMax && (
        <div className="sv-edit">
          <label>
            <span className="small">Pontos</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={p.masteryPoints}
              onChange={(e) => save({ ...p, masteryPoints: clampInt(Number(e.target.value), 0, 100000) })}
            />
          </label>
          <span className="small">Nível</span>
          <button type="button" className="btn secondary sv-step" aria-label="Diminuir nível de maestria" onClick={() => save({ ...p, masteryLevel: clampInt(p.masteryLevel - 1, 0, 5) })}>
            −
          </button>
          <button type="button" className="btn secondary sv-step" aria-label="Aumentar nível de maestria" onClick={() => save({ ...p, masteryLevel: clampInt(p.masteryLevel + 1, 0, 5) })}>
            +
          </button>
        </div>
      )}
      <p className="sv-hint">Toque nos quadradinhos para marcar o seu nível. {allMax ? 'Copie os pontos e o nível da barra de Maestria do jogo.' : 'A Maestria abre com as cinco no nível 10.'}</p>
    </div>
  );
}

function Prof({ p, sub }: { p: Profession; sub?: string }) {
  return (
    <div className="skill-prof">
      <strong>{p.name}</strong>
      {sub && <span className="muted small"> · {sub}</span>}
      <span className="skill-prof__eff">{p.effect}</span>
    </div>
  );
}

function SkillView({ id }: { id: SkillId }) {
  const s = SKILLS.find((x) => x.id === id)!;
  return (
    <>
      <h2>
        {s.emoji} {s.label}
      </h2>
      <p>
        <strong>Como ganhar experiência:</strong> {s.xp}
      </p>
      <p className="muted small">{s.perLevel}</p>

      <ol className="skill-levels">
        {s.unlocks.map((items, i) => {
          const level = i + 1;
          return (
            <li key={level} className={level === 5 || level === 10 ? 'skill-levels__prof' : ''}>
              <span className="skill-levels__n">Nível {level}</span>
              <span className="muted small"> · {fmt(XP_TABLE[i]!)} XP</span>
              {items.length > 0 && <span className="skill-levels__items">Libera: {items.join(', ')}.</span>}
              {level === 5 && (
                <div className="skill-choice">
                  <span className="small">Escolha uma profissão:</span>
                  <Prof p={s.level5[0]} />
                  <Prof p={s.level5[1]} />
                </div>
              )}
              {level === 10 && (
                <div className="skill-choice">
                  <span className="small">Escolha uma profissão, conforme a do nível 5:</span>
                  {s.level10.map((pair, k) =>
                    pair.map((p) => <Prof key={p.name} p={p} sub={`exige ${s.level5[k]!.name}`} />),
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="muted small">Receitas e itens novos chegam na manhã seguinte ao nível.</p>
    </>
  );
}

function MasteryView() {
  return (
    <>
      <h2>🕯️ Caverna da Maestria</h2>
      <div className="notice" role="note">
        <strong>Como abrir</strong>
        Fica na Floresta Cindersap e abre quando você chega ao nível 10 nas 5 habilidades, não importa em que ano. Antes disso,
        a porta diz quantas das cinco você já completou. Não confunda com a avaliação do Vovô, que acontece no começo do Ano 3.
      </div>

      <h3>Pontos de maestria</h3>
      <p>
        Depois de tudo no nível 10, a experiência que você continua ganhando vira pontos de maestria. A de Cultivo conta pela
        metade; as outras contam inteiras. Os pontos vão para um único total, e você escolhe qual maestria resgatar nos pilares da
        caverna, na ordem que quiser. Cada uma custa mais que a anterior:
      </p>
      <ul className="pet-gifts">
        {MASTERY_COST.map((c, i) => (
          <li key={i}>
            <span>{i + 1}ª maestria</span>
            <span className="muted">
              {fmt(c)} pontos (total {fmt(MASTERY_COST.slice(0, i + 1).reduce((a, b) => a + b, 0))})
            </span>
          </li>
        ))}
      </ul>

      <h3>O que cada maestria dá</h3>
      {SKILLS.map((s) => (
        <div key={s.id} className="card" style={{ cursor: 'default' }}>
          <span className="title">
            {s.emoji} Maestria de {s.label}
          </span>
          <ul className="recipe-src">
            {s.mastery.rewards.map((r) => (
              <li key={r}>🎁 {r}</li>
            ))}
            <li>✨ {s.mastery.perk}</li>
          </ul>
        </div>
      ))}
      <p>
        Com as cinco resgatadas, uma vela acende em cada pilar, aparece um chapéu no pedestal da caverna e você sente a mão do
        Vovô no ombro.
      </p>
    </>
  );
}

export function Skills() {
  const [tab, setTab] = useState<Tab>('farming');
  return (
    <>
      <h1>Habilidades</h1>
      <p>
        São cinco habilidades, cada uma do nível 1 ao 10. Subir de nível libera receitas e itens, e nos níveis 5 e 10 você escolhe
        uma profissão. Com tudo no nível 10, abre a Caverna da Maestria.
      </p>
      <ProgressPanel />

      <div className="row" role="tablist" aria-label="Habilidade">
        {SKILLS.map((s) => (
          <button key={s.id} type="button" role="tab" className="chip" aria-selected={tab === s.id} aria-pressed={tab === s.id} onClick={() => setTab(s.id)}>
            {s.emoji} {s.label}
          </button>
        ))}
        <button type="button" role="tab" className="chip" aria-selected={tab === 'mastery'} aria-pressed={tab === 'mastery'} onClick={() => setTab('mastery')}>
          🕯️ Maestria
        </button>
      </div>

      {tab === 'mastery' ? <MasteryView /> : <SkillView id={tab} />}

      <p className="muted small" style={{ marginTop: 16 }}>
        Fonte: Stardew Valley Wiki (versão 1.6).
      </p>
    </>
  );
}
