import { describe, expect, it } from 'vitest';
import { backupFileName, buildBackup, parseBackup } from './backup';

const entries = { 'notas-v1': '[]', 'retrato-v1:Abigail': 'data:image/webp;base64,AAA', 'retratos-v1': '["Abigail"]' };

describe('backup', () => {
  it('deixa os retratos de fora, a não ser que peça', () => {
    expect(Object.keys(buildBackup(entries, false).data)).toEqual(['notas-v1']);
    expect(Object.keys(buildBackup(entries, true).data)).toHaveLength(3);
  });

  it('ida e volta: o que exporta, importa', () => {
    const b = buildBackup(entries, true, new Date('2026-11-17T12:00:00Z'));
    const r = parseBackup(JSON.stringify(b));
    expect(r.ok && r.backup.data).toEqual(entries);
  });

  it('recusa arquivos que não são backup', () => {
    expect(parseBackup('oi').ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: 'outro', version: 1, data: {} })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: 'stardew-notes', version: 2, data: {} })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: 'stardew-notes', version: 1, data: { x: 1 } })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: 'stardew-notes', version: 1, data: { 'chave com espaço': 'a' } })).ok).toBe(false);
  });

  it('nome do arquivo com a data', () => {
    expect(backupFileName(new Date('2026-11-17T12:00:00Z'))).toBe('stardew-notes-backup-2026-11-17.json');
  });
});
