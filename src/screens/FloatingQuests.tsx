import { Preferences } from '@capacitor/preferences';
import { useCallback, useEffect, useMemo, useState } from 'react';
import cropsJson from '../data/crops.json';
import giftsJson from '../data/gifts.json';
import villagersJson from '../data/villagers.json';
import { overlayHide, overlayRequestPermission, overlayShow, overlayStatus, overlaySupported } from '../native/overlay';
import type { Crop } from '../utils/crops';
import { buildDayOverlay, nextDay, previousDay, type GameDay } from '../utils/dayOverlay';
import type { GiftData } from '../utils/gifts';
import { DAYS_IN_SEASON, SEASON_ORDER } from '../utils/calendar';
import { seasonLabel, type VillagerData } from '../utils/villagers';

const villagers = (villagersJson as unknown as VillagerData).villagers;
const gifts = giftsJson as unknown as GiftData;
const crops = (cropsJson as unknown as { crops: Crop[] }).crops;
const DAY_KEY = 'dia-do-jogo-v1';

async function loadDay(): Promise<GameDay> {
  try {
    const { value } = await Preferences.get({ key: DAY_KEY });
    const d = value ? (JSON.parse(value) as GameDay) : null;
    if (d && SEASON_ORDER.includes(d.season) && d.day >= 1 && d.day <= DAYS_IN_SEASON) return d;
  } catch {
    /* usa o padrão */
  }
  return { season: 'spring', day: 1 };
}

export function FloatingQuests() {
  const [day, setDay] = useState<GameDay | null>(null);
  const [granted, setGranted] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    const s = await overlayStatus();
    setGranted(s.granted);
    setRunning(s.running);
  }, []);

  useEffect(() => {
    void loadDay().then(setDay);
    void refresh();
    // Ao voltar da tela de permissão do Android, confere de novo.
    const onVisible = () => void refresh();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [refresh]);

  const content = useMemo(() => (day ? buildDayOverlay(day, villagers, gifts, crops) : null), [day]);

  // Botão já ativo: troca de dia atualiza o que ele mostra.
  const changeDay = async (d: GameDay) => {
    setDay(d);
    void Preferences.set({ key: DAY_KEY, value: JSON.stringify(d) });
    if (running) {
      const c = buildDayOverlay(d, villagers, gifts, crops);
      await overlayShow(c.title, c.lines);
    }
  };

  const show = async () => {
    if (!content) return;
    const r = await overlayShow(content.title, content.lines);
    if (r === 'shown') setMessage('Botão ativado. Abra o jogo: ele aparece sobre a tela. Toque nele para ver o dia.');
    else if (r === 'no-permission') setMessage('Falta permitir "Exibir sobre outros apps" para o Valley Tracker.');
    else if (r === 'unsupported') setMessage('O botão flutuante só funciona no app Android.');
    else setMessage('Não consegui ativar o botão.');
    await refresh();
  };

  const hide = async () => {
    await overlayHide();
    setMessage('Botão desativado.');
    await refresh();
  };

  if (!day || !content) return <p className="muted">Carregando…</p>;

  return (
    <>
      <h1>Assistente flutuante</h1>
      <p>
        Um botão translúcido que fica sobre o jogo e que você arrasta pelas bordas da tela. Tocando nele, mostra o que
        importa no dia: festival, aniversariantes e o que eles amam, e o que ainda vale plantar.
      </p>

      {!overlaySupported() && (
        <div className="notice" role="note">
          <strong>Só no app Android</strong>
          No navegador dá para ver a prévia, mas o botão só aparece no celular.
        </div>
      )}

      <h2>1. Que dia é no seu jogo?</h2>
      <div className="row" role="group" aria-label="Estação">
        {SEASON_ORDER.map((s) => (
          <button key={s} type="button" className="chip" aria-pressed={day.season === s} onClick={() => void changeDay({ season: s, day: day.day })}>
            {seasonLabel(s)}
          </button>
        ))}
      </div>
      <div className="day-stepper">
        <button type="button" className="btn" aria-label="Dia anterior" onClick={() => void changeDay(previousDay(day))}>
          −
        </button>
        <label>
          <span className="muted small">Dia</span>
          <input
            id="dia-do-jogo"
            type="number"
            inputMode="numeric"
            min={1}
            max={DAYS_IN_SEASON}
            value={day.day}
            onChange={(e) => {
              const n = Math.min(DAYS_IN_SEASON, Math.max(1, Math.round(Number(e.target.value) || 1)));
              void changeDay({ season: day.season, day: n });
            }}
          />
        </label>
        <button type="button" className="btn" aria-label="Próximo dia" onClick={() => void changeDay(nextDay(day))}>
          +
        </button>
      </div>
      <p className="muted small">Toque em + a cada dia que passar no jogo. O app guarda o dia marcado.</p>

      <h2>2. Permita exibir sobre outros apps</h2>
      <p className="muted">
        Sem essa permissão o Android não deixa o botão aparecer sobre o jogo. Status: {granted ? 'permitido' : 'não permitido'}.
      </p>
      {!granted && overlaySupported() && (
        <button className="btn" onClick={() => void overlayRequestPermission()}>
          Abrir configuração de permissão
        </button>
      )}

      <h2>3. Ative o botão</h2>
      <div className="card" style={{ cursor: 'default' }} aria-label="Prévia do que o botão mostra">
        <span className="title">{content.title}</span>
        {content.lines.map((l, i) => (
          <span key={i} style={{ display: 'block', marginTop: 4 }}>
            {l}
          </span>
        ))}
      </div>
      <button className="btn" disabled={!granted && overlaySupported()} onClick={() => void show()}>
        {running ? 'Atualizar botão' : 'Mostrar botão sobre o jogo'}
      </button>
      {running && (
        <button className="link" onClick={() => void hide()}>
          Esconder botão
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </>
  );
}
