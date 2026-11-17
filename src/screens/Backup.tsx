import { useEffect, useRef, useState } from 'react';
import { exportBackup, parseBackup, restoreBackup, type BackupFile } from '../backup/backup';

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'data desconhecida' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

export function Backup() {
  const [portraits, setPortraits] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<BackupFile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pending) confirmRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [pending]);

  const onExport = async () => {
    setBusy(true);
    setMessage('');
    try {
      const name = await exportBackup(portraits);
      setMessage(`Backup criado: ${name}. Guarde em um lugar seguro, como o Google Drive.`);
    } catch {
      setMessage('Não deu para criar o backup. Tente de novo.');
    }
    setBusy(false);
  };

  const onFile = async (file: File | undefined) => {
    setMessage('');
    setPending(null);
    if (!file) return;
    const r = parseBackup(await file.text());
    if (r.ok) setPending(r.backup);
    else setMessage(r.error);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onRestore = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await restoreBackup(pending);
      setMessage('Backup restaurado. Reabrindo o app…');
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setMessage('Não deu para restaurar o backup.');
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Backup e restauração</h1>
      <p>
        Tudo o que você guarda no Stardew Notes fica só neste celular: notas, receitas aprendidas, construções, pets, níveis,
        dia do jogo e o save importado. Faça um backup antes de trocar de celular ou reinstalar o app.
      </p>

      <h2>Fazer backup</h2>
      <label className="pet-toggle">
        <input type="checkbox" checked={portraits} onChange={(e) => setPortraits(e.target.checked)} /> Incluir os retratos dos moradores
        (o arquivo fica maior)
      </label>
      <button type="button" className="btn" disabled={busy} onClick={() => void onExport()}>
        {busy && !pending ? 'Criando…' : 'Criar arquivo de backup'}
      </button>

      <h2>Restaurar</h2>
      <p className="muted small">Escolha um arquivo .json criado pelo Stardew Notes. Os dados dele substituem os deste celular.</p>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        aria-label="Escolher arquivo de backup"
        className="backup-file-input"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <button type="button" className="btn secondary" disabled={busy} onClick={() => fileRef.current?.click()}>
        Escolher arquivo de backup
      </button>

      {pending && (
        <div ref={confirmRef} className="notice backup-confirm" role="alert">
          <strong>Restaurar este backup?</strong>
          Criado em {fmtDate(pending.exportedAt)}, com {Object.keys(pending.data).length} itens. O que estiver salvo agora com os mesmos
          dados será substituído.
          <div className="note-confirm" style={{ marginTop: 10 }}>
            <button type="button" className="btn" disabled={busy} onClick={() => void onRestore()}>
              Restaurar
            </button>
            <button type="button" className="btn secondary" disabled={busy} onClick={() => setPending(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {message && (
        <p role="status" className="backup-msg">
          {message}
        </p>
      )}
    </>
  );
}
