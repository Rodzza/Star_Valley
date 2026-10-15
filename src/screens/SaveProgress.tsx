import { useEffect, useState } from 'react';
import { computePerfection } from '../save/perfection';
import { seasonLabel } from '../save/overlayContent';
import { loadStoredSave, type StoredSave } from '../save/storage';
import { SaveImporter } from './SaveImporter';

const fmt = (n: number) => n.toFixed(1).replace('.', ',');

export function SaveProgress() {
  const [stored, setStored] = useState<StoredSave | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void loadStoredSave().then((s) => {
      setStored(s);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return <p className="muted">Carregando…</p>;
  const save = stored?.save;
  const result = save ? computePerfection(save) : null;

  return (
    <>
      <h1>Perfeição pelo save</h1>

      {save && result && stored && (
        <>
          <div className="card" style={{ cursor: 'default' }}>
            <span className="title">{save.farmName || save.playerName || 'Seu save'}</span>
            <span className="muted" style={{ display: 'block' }}>
              {save.playerName}
              {save.date ? ` · ${seasonLabel(save.date.season)}, dia ${save.date.day}, ano ${save.date.year}` : ''}
            </span>
            <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 700, marginTop: 6 }}>
              {fmt(result.points)}% de {fmt(result.measurableMax)}% medidos
            </span>
            <div className="bar" aria-hidden="true">
              <div className="bar-fill" style={{ width: `${(result.points / Math.max(result.measurableMax, 1)) * 100}%` }} />
            </div>
            <span className="muted" style={{ display: 'block', marginTop: 6 }}>
              Importado em {new Date(stored.importedAt).toLocaleString('pt-BR')} ({stored.fileName})
            </span>
          </div>

          <div className="notice" role="note">
            <strong>Como é calculado</strong>
            Os pontos seguem as regras da Perfeição do jogo, a partir do seu save. O jogo mostra o número arredondado para baixo
            na Sala de Nozes do Sr. Qi. Compare com o seu: se for diferente, avise.{result.waivers > 0 ? ` Mais ${result.waivers}% de Perfection Waivers comprados.` : ''}
          </div>

          <h2>Por categoria</h2>
          {result.categories.map((c) => (
            <div key={c.id} className="card" style={{ cursor: 'default' }}>
              <span className="title">{c.label}</span>
              {c.status === 'unavailable' ? (
                <span className="muted" style={{ display: 'block' }}>
                  Não medido{c.note ? `: ${c.note}` : save.kind === 'info' ? ': só existe no arquivo principal do save' : ''}
                </span>
              ) : (
                <span style={{ display: 'block' }}>
                  {c.got} de {c.need} · {fmt(c.points)} de {c.weight} pontos
                  {c.note ? <span className="muted" style={{ display: 'block' }}>{c.note}</span> : null}
                </span>
              )}
            </div>
          ))}

          {save.warnings.length > 0 && (
            <div className="notice" role="note">
              <strong>O que não consegui ler neste arquivo</strong>
              {save.warnings.join(' · ')}
            </div>
          )}
          <h2>Atualizar</h2>
        </>
      )}

      <SaveImporter onImported={setStored} />
    </>
  );
}
