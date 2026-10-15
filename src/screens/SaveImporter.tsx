import { useState } from 'react';
import { parseSave } from '../save/parseSave';
import { storeSave, type StoredSave } from '../save/storage';

const MAX_BYTES = 60 * 1024 * 1024;

export function SaveImporter({ onImported }: { onImported: (s: StoredSave) => void }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setMessage('');
    if (file.size > MAX_BYTES) {
      setMessage('Este arquivo é grande demais para ser um save do Stardew Valley.');
      return;
    }
    setBusy(true);
    try {
      const outcome = parseSave(await file.text());
      if (!outcome.ok) {
        setMessage(outcome.reason);
        return;
      }
      const entry: StoredSave = { importedAt: new Date().toISOString(), fileName: file.name, save: outcome.save };
      await storeSave(entry);
      onImported(entry);
    } catch {
      setMessage('Não consegui ler esse arquivo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="notice" role="note">
        <strong>Por que é manual?</strong>
        O Android 13 ou mais novo não deixa nenhum app ler a pasta do jogo (Android/data). Então você copia o save
        para outra pasta e importa aqui. O app não atualiza sozinho: depois de dormir no jogo (é aí que ele salva),
        importe de novo.
      </div>

      <h2>Como importar</h2>
      <ol className="plain">
        <li>No app Meus Arquivos do celular, abra Android › data › com.chucklefish.stardewvalley › files › Saves.</li>
        <li>Copie a pasta da sua fazenda para Documentos. Se o seu aparelho não abrir essa pasta, copie pelo computador, com o cabo.</li>
        <li>Toque em Escolher arquivo e selecione o arquivo grande com o nome da fazenda (sem extensão). O SaveGameInfo também funciona, com menos dados.</li>
      </ol>

      <label className="btn" style={{ display: 'block', textAlign: 'center' }}>
        {busy ? 'Lendo…' : 'Escolher arquivo do save'}
        <input type="file" hidden disabled={busy} onChange={(e) => void onFile(e.target.files?.[0])} />
      </label>
      {message && (
        <p role="alert" className="notice">
          {message}
        </p>
      )}
    </>
  );
}
