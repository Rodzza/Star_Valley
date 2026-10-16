import { useMemo, useState } from 'react';
import villagersJson from '../data/villagers.json';
import { DAYS_IN_SEASON, SEASON_ORDER, WEEKDAYS, busyDays, eventsOn, weekdayOf } from '../utils/calendar';
import { displayName, seasonLabel, type SeasonKey, type VillagerData } from '../utils/villagers';

const villagers = (villagersJson as unknown as VillagerData).villagers;

export function Calendar() {
  const [season, setSeason] = useState<SeasonKey>('spring');
  const [day, setDay] = useState(1);
  const list = useMemo(() => busyDays(season, villagers), [season]);
  const today = eventsOn(season, day, villagers);

  return (
    <>
      <h1>Calendário</h1>
      <div className="row cal-seasons" role="group" aria-label="Estação">
        {SEASON_ORDER.map((s) => (
          <button key={s} className="chip" aria-pressed={season === s} onClick={() => setSeason(s)}>
            {seasonLabel(s)}
          </button>
        ))}
      </div>

      <div className="cal" role="grid" aria-label={`Dias de ${seasonLabel(season)}`}>
        {WEEKDAYS.map((w) => (
          <span key={w} className="cal-head" role="columnheader">
            {w}
          </span>
        ))}
        {Array.from({ length: DAYS_IN_SEASON }, (_, i) => i + 1).map((d) => {
          const e = eventsOn(season, d, villagers);
          const label = [
            `${d} de ${seasonLabel(season)}`,
            ...e.festivals.map((f) => f.name),
            ...e.birthdays.map((v) => `aniversário de ${displayName(v.name)}`),
          ].join(', ');
          return (
            <button
              key={d}
              type="button"
              role="gridcell"
              className={`cal-day${d === day ? ' sel' : ''}`}
              aria-label={label}
              aria-pressed={d === day}
              onClick={() => setDay(d)}
            >
              <span className="cal-n">{d}</span>
              <span className="cal-marks" aria-hidden="true">
                {e.festivals.length > 0 && <i className="mk fest" />}
                {e.birthdays.length > 0 && <i className="mk bday" />}
              </span>
            </button>
          );
        })}
      </div>
      <p className="cal-legend muted small">
        <i className="mk bday" /> Aniversário <i className="mk fest" /> Festival
      </p>

      <section className="card vsec" aria-live="polite">
        <h2>
          {weekdayOf(day)}, {day} de {seasonLabel(season)}
        </h2>
        {today.festivals.length === 0 && today.birthdays.length === 0 ? (
          <p className="muted center">Nada marcado neste dia.</p>
        ) : (
          <ul className="rel">
            {today.festivals.map((f) => (
              <li key={f.name}>
                <strong>{f.name}</strong>
                <span className="muted"> — {f.place}</span>
              </li>
            ))}
            {today.birthdays.map((v) => (
              <li key={v.name}>
                🎂 Aniversário de <strong>{displayName(v.name)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h2>Neste mês</h2>
      <ul className="rel agenda">
        {list.map((d) => (
          <li key={d.day}>
            <button type="button" className="rel-link" onClick={() => setDay(d.day)}>
              Dia {d.day}
            </button>
            <span>
              {[...d.festivals.map((f) => f.name), ...d.birthdays.map((v) => `🎂 ${displayName(v.name)}`)].join(' · ')}
            </span>
          </li>
        ))}
      </ul>
      <p className="muted small">
        Aniversários: Stardew Valley Wiki (CC BY-SA). Datas dos festivais digitadas à mão: confira no jogo.
      </p>
    </>
  );
}
