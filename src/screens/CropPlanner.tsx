import { useMemo, useState } from 'react';
import data from '../data/crops.json';
import { cropLabel } from '../utils/cropNames';
import { SEASON_LENGTH, plantableCrops, type Crop, type Season } from '../utils/crops';

const SEASONS: Array<{ id: Season; label: string }> = [
  { id: 'spring', label: 'Primavera' },
  { id: 'summer', label: 'Verão' },
  { id: 'fall', label: 'Outono' },
  { id: 'winter', label: 'Inverno' },
];

export function CropPlanner() {
  const [season, setSeason] = useState<Season>('spring');
  const [day, setDay] = useState(1);
  const plans = useMemo(() => plantableCrops(data.crops as Crop[], season, day), [season, day]);

  return (
    <>
      <h1>Planejador de plantio</h1>
      <div className="notice" role="note">
        <strong>Dados de comunidade</strong>
        Valores vindos da Stardew Valley Wiki (CC BY-SA) e ainda não conferidos no jogo. Considera 1 item por colheita.
        Veja os créditos em Fontes e licenças.
      </div>

      <h2>Estação</h2>
      <div className="row" role="group" aria-label="Estação">
        {SEASONS.map((s) => (
          <button key={s.id} className="chip" aria-pressed={season === s.id} onClick={() => setSeason(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <h2>Dia de hoje no jogo</h2>
      <input
        type="number"
        min={1}
        max={SEASON_LENGTH}
        value={day}
        aria-label="Dia do mês no jogo"
        onChange={(e) => setDay(Math.min(SEASON_LENGTH, Math.max(1, Math.trunc(Number(e.target.value)) || 1)))}
      />

      <h2>Dá tempo de colher</h2>
      {season === 'winter' && <p className="muted">No inverno não se planta ao ar livre.</p>}
      {season !== 'winter' && plans.length === 0 && (
        <p className="muted">Nenhuma cultura desta estação termina a tempo se plantada neste dia.</p>
      )}
      {plans.map((p) => (
        <div key={p.crop.name} className="card" style={{ cursor: 'default' }}>
          <span className="title">{cropLabel(p.crop.name)}</span>
          <span className="muted" style={{ display: 'block' }}>
            {p.harvests === 1
              ? `Colhe no dia ${p.firstHarvestDay}`
              : `${p.harvests} colheitas, do dia ${p.firstHarvestDay} ao ${p.lastHarvestDay}`}
          </span>
          <span style={{ display: 'block' }}>
            Lucro: {p.profit} g · {p.goldPerDay.toFixed(1)} g por dia
          </span>
        </div>
      ))}
      <p className="muted">Valores sem qualidade, profissões nem fertilizante.</p>
    </>
  );
}
