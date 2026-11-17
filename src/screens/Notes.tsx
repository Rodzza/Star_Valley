import { useEffect, useMemo, useRef, useState } from 'react';
import { useBackHandler } from '../native/backButton';
import { MAX_BODY, MAX_TITLE, NOTE_KINDS, isEmpty, loadNotes, newNote, saveNotes, sortAndFilter, type Note, type NoteKind } from '../notes/notes';

const when = (t: number) =>
  t ? new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

function Editor({ note, onSave, onDelete, onClose }: { note: Note; onSave: (n: Note) => void; onDelete: () => void; onClose: () => void }) {
  const [draft, setDraft] = useState(note);
  const [confirm, setConfirm] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!note.title && !note.body) titleRef.current?.focus();
  }, [note]);

  const close = () => {
    onSave(draft);
    onClose();
  };
  useBackHandler(() => {
    close();
    return true;
  });

  return (
    <div className="note-editor">
      <div className="note-editor__bar">
        <button type="button" className="back" onClick={close}>
          ← Salvar e voltar
        </button>
      </div>
      <div className="row" role="group" aria-label="Tipo de nota">
        {NOTE_KINDS.map((k) => (
          <button key={k.id} type="button" className="chip" aria-pressed={draft.kind === k.id} onClick={() => setDraft({ ...draft, kind: k.id })}>
            {k.emoji} {k.label}
          </button>
        ))}
      </div>
      <input
        ref={titleRef}
        className="note-title-input"
        placeholder="Título"
        aria-label="Título da nota"
        maxLength={MAX_TITLE}
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
      />
      <textarea
        className="note-body-input"
        placeholder="Escreva aqui: o que plantar, quem presentear, metas da estação…"
        aria-label="Texto da nota"
        maxLength={MAX_BODY}
        value={draft.body}
        onChange={(e) => setDraft({ ...draft, body: e.target.value })}
      />
      <div className="note-editor__actions">
        <label className="pet-toggle">
          <input type="checkbox" checked={draft.pinned} onChange={(e) => setDraft({ ...draft, pinned: e.target.checked })} /> Fixar no topo
        </label>
        <label className="pet-toggle">
          <input type="checkbox" checked={draft.done} onChange={(e) => setDraft({ ...draft, done: e.target.checked })} /> Concluída
        </label>
        {confirm ? (
          <div className="note-confirm" role="alert">
            <span>Apagar esta nota?</span>
            <button type="button" className="btn note-danger" onClick={onDelete}>
              Apagar
            </button>
            <button type="button" className="btn secondary" onClick={() => setConfirm(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <button type="button" className="link note-delete" onClick={() => setConfirm(true)}>
            Apagar nota
          </button>
        )}
      </div>
    </div>
  );
}

export function Notes() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [editing, setEditing] = useState<Note | null>(null);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<NoteKind | 'all'>('all');

  useEffect(() => {
    void loadNotes().then(setNotes);
  }, []);

  const persist = (list: Note[]) => {
    setNotes(list);
    void saveNotes(list);
  };

  const list = useMemo(() => sortAndFilter(notes ?? [], query, kind), [notes, query, kind]);

  if (!notes) return <p className="muted">Carregando…</p>;

  if (editing) {
    return (
      <Editor
        note={editing}
        onSave={(n) => {
          const others = notes.filter((x) => x.id !== n.id);
          // Nota nova deixada em branco não é salva.
          if (isEmpty(n)) persist(others);
          else {
            const before = notes.find((x) => x.id === n.id);
            const changed = !before || JSON.stringify(before) !== JSON.stringify(n);
            persist([...others, changed ? { ...n, updatedAt: Date.now() } : n]);
          }
        }}
        onDelete={() => {
          persist(notes.filter((x) => x.id !== editing.id));
          setEditing(null);
        }}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <>
      <h1>Minhas notas</h1>
      <p className="muted">Planos, metas e lembretes da sua fazenda. Ficam salvos só neste celular.</p>
      <button type="button" className="btn" onClick={() => setEditing(newNote(kind === 'all' ? 'plano' : kind))}>
        + Nova nota
      </button>

      {notes.length > 0 && (
        <>
          <input className="pet-name recipe-search" type="search" placeholder="Buscar nas notas" aria-label="Buscar nas notas" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="row" role="group" aria-label="Filtrar por tipo">
            <button type="button" className="chip" aria-pressed={kind === 'all'} onClick={() => setKind('all')}>
              Todas
            </button>
            {NOTE_KINDS.map((k) => (
              <button key={k.id} type="button" className="chip" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>
                {k.emoji} {k.label}
              </button>
            ))}
          </div>
        </>
      )}

      {notes.length === 0 && (
        <div className="notice" role="note">
          <strong>Nenhuma nota ainda</strong>
          Que tal anotar o plano da estação, quem você quer presentear ou a próxima meta do Centro Comunitário?
        </div>
      )}

      {list.map((n) => {
        const k = NOTE_KINDS.find((x) => x.id === n.kind)!;
        return (
          <button key={n.id} type="button" className={`card note-card${n.done ? ' note-card--done' : ''}`} onClick={() => setEditing(n)}>
            <span className="note-card__head">
              <span aria-hidden="true">{k.emoji}</span>
              <span className="title">{n.title || 'Sem título'}</span>
              {n.pinned && <span aria-label="Fixada">📌</span>}
            </span>
            {n.body && <span className="note-card__body">{n.body}</span>}
            <span className="muted small">
              {k.label}
              {n.done ? ' · concluída' : ''} · {when(n.updatedAt)}
            </span>
          </button>
        );
      })}
      {notes.length > 0 && list.length === 0 && <p className="muted">Nenhuma nota encontrada.</p>}
    </>
  );
}
