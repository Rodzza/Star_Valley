import { Preferences } from '@capacitor/preferences';

const KEY = 'notas-v1';

export type NoteKind = 'plano' | 'meta' | 'lembrete';

export const NOTE_KINDS: { id: NoteKind; emoji: string; label: string }[] = [
  { id: 'plano', emoji: '🗺️', label: 'Plano' },
  { id: 'meta', emoji: '🎯', label: 'Meta' },
  { id: 'lembrete', emoji: '⏰', label: 'Lembrete' },
];

export interface Note {
  id: string;
  title: string;
  body: string;
  kind: NoteKind;
  pinned: boolean;
  done: boolean;
  updatedAt: number;
}

export const MAX_TITLE = 80;
export const MAX_BODY = 4000;

const isKind = (k: unknown): k is NoteKind => NOTE_KINDS.some((x) => x.id === k);

/** Lê as notas salvas, descartando o que estiver corrompido. */
export function parseNotes(raw: string | null): Note[] {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as unknown;
    if (!Array.isArray(list)) return [];
    return list
      .filter((n): n is Note => !!n && typeof n === 'object' && typeof (n as Note).id === 'string')
      .map((n) => ({
        id: n.id,
        title: String(n.title ?? '').slice(0, MAX_TITLE),
        body: String(n.body ?? '').slice(0, MAX_BODY),
        kind: isKind(n.kind) ? n.kind : 'plano',
        pinned: n.pinned === true,
        done: n.done === true,
        updatedAt: Number.isFinite(n.updatedAt) ? n.updatedAt : 0,
      }));
  } catch {
    return [];
  }
}

export async function loadNotes(): Promise<Note[]> {
  try {
    return parseNotes((await Preferences.get({ key: KEY })).value);
  } catch {
    return [];
  }
}

export const saveNotes = (list: readonly Note[]) => Preferences.set({ key: KEY, value: JSON.stringify(list) });

export function newNote(kind: NoteKind = 'plano', now = Date.now()): Note {
  return { id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`, title: '', body: '', kind, pinned: false, done: false, updatedAt: now };
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Fixadas primeiro, depois as não concluídas, depois as mais recentes; filtra por tipo e busca. */
export function sortAndFilter(list: readonly Note[], query: string, kind: NoteKind | 'all'): Note[] {
  const q = norm(query.trim());
  return list
    .filter((n) => kind === 'all' || n.kind === kind)
    .filter((n) => !q || norm(`${n.title} ${n.body}`).includes(q))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || Number(a.done) - Number(b.done) || b.updatedAt - a.updatedAt);
}

export const isEmpty = (n: Note) => !n.title.trim() && !n.body.trim();
