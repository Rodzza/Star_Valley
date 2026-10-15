import { useCallback, useEffect, useState } from 'react';
import { overlayHide, overlayRequestPermission, overlayShow, overlayStatus, overlaySupported } from '../native/overlay';
import { buildOverlayContent } from '../save/overlayContent';
import { loadStoredSave, type StoredSave } from '../save/storage';
import { SaveImporter } from './SaveImporter';

export function FloatingQuests() {
  const [stored, setStored] = useState<StoredSave | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [granted, setGranted] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    const s = await overlayStatus();
    setGranted(s.granted);
    setRunning(s.running);
  }, []);

  useEffect(() => {
    void loadStoredSave().then((s) => {
      setStored(s);
      setLoaded(true);
    });
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

  if (!loaded) return <p className="muted">Carregando…</p>;

  const content = stored ? buildOverlayContent(stored.save) : null;

  const show = async () => {
    if (!content) return;
    const r = await overlayShow(content.title, content.lines);
    if (r === 'shown') setMessage('Botão ativado. Abra o jogo: ele aparece sobre a tela. Toque nele para ver as missões.');
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

  return (
    <>
      <h1>Assistente flutuante de missões</h1>
      <p>
        Um botão translúcido que você arrasta pelas bordas da tela e que fica sobre o jogo. Tocando nele, mostra as
        missões ativas do último save que você importou.
      </p>

      {!overlaySupported() && (
        <div className="notice" role="note">
          <strong>Só no app Android</strong>
          No navegador dá para importar o save e ver a prévia, mas o botão só aparece no celular.
        </div>
      )}

      <h2>1. Importe seu save</h2>
      {stored ? (
        <p className="muted">
          Último import: {new Date(stored.importedAt).toLocaleString('pt-BR')} ({stored.save.farmName || stored.save.playerName}).
        </p>
      ) : (
        <p className="muted">Ainda não há save importado.</p>
      )}
      <SaveImporter onImported={setStored} />

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
      {content && (
        <div className="card" style={{ cursor: 'default' }}>
          <span className="title">{content.title}</span>
          {content.lines.map((l, i) => (
            <span key={i} style={{ display: 'block', marginTop: 4 }}>
              {l}
            </span>
          ))}
        </div>
      )}
      <button className="btn" disabled={!content || (!granted && overlaySupported())} onClick={() => void show()}>
        {running ? 'Atualizar botão com este save' : 'Mostrar botão sobre o jogo'}
      </button>
      {running && (
        <button className="link" onClick={() => void hide()}>
          Esconder botão
        </button>
      )}
      {message && <p role="status">{message}</p>}
      <p className="muted">
        O botão mostra o jogo como estava no último save. Dica de peixe por horário e estação ainda não existe: depende de
        importar os dados de peixes da wiki.
      </p>
    </>
  );
}
