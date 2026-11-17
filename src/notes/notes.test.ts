import { describe, expect, it } from 'vitest';
import { isEmpty, newNote, parseNotes, sortAndFilter, type Note } from './notes';

const n = (o: Partial<Note>): Note => ({ ...newNote('plano', 1), ...o });

describe('notas', () => {
  it('lê o que foi salvo e ignora lixo', () => {
    expect(parseNotes(null)).toEqual([]);
    expect(parseNotes('nada')).toEqual([]);
    const ok = parseNotes(JSON.stringify([{ id: 'a', title: 'x', kind: 'inventado' }, 3, null]));
    expect(ok).toHaveLength(1);
    expect(ok[0]!.kind).toBe('plano');
  });

  it('fixadas primeiro, concluídas por último, depois mais recentes', () => {
    const list = [n({ id: '1', updatedAt: 3, done: true }), n({ id: '2', updatedAt: 1 }), n({ id: '3', updatedAt: 2 }), n({ id: '4', pinned: true })];
    expect(sortAndFilter(list, '', 'all').map((x) => x.id)).toEqual(['4', '3', '2', '1']);
  });

  it('busca sem acento e filtra por tipo', () => {
    const list = [n({ id: '1', title: 'Colher abóboras', kind: 'meta' }), n({ id: '2', title: 'Ir à praia' })];
    expect(sortAndFilter(list, 'abobora', 'all').map((x) => x.id)).toEqual(['1']);
    expect(sortAndFilter(list, '', 'meta').map((x) => x.id)).toEqual(['1']);
  });

  it('nota vazia', () => {
    expect(isEmpty(n({ title: '  ' }))).toBe(true);
    expect(isEmpty(n({ body: 'x' }))).toBe(false);
  });
});
