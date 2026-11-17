import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/** Formato do arquivo de backup do Stardew Notes. */
export interface BackupFile {
  app: 'stardew-notes';
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

const PORTRAIT = /^retrato/;
export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;

/** Monta o backup a partir de pares chave/valor. Retratos (imagens) só entram se pedido. */
export function buildBackup(entries: Record<string, string>, includePortraits: boolean, now = new Date()): BackupFile {
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(entries)) if (includePortraits || !PORTRAIT.test(k)) data[k] = v;
  return { app: 'stardew-notes', version: 1, exportedAt: now.toISOString(), data };
}

export type ParseResult = { ok: true; backup: BackupFile } | { ok: false; error: string };

/** Valida um arquivo de backup antes de restaurar. */
export function parseBackup(text: string): ParseResult {
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, error: 'O arquivo é grande demais para ser um backup do Stardew Notes.' };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Esse arquivo não é um backup válido (não é JSON).' };
  }
  const b = raw as Partial<BackupFile>;
  if (!b || b.app !== 'stardew-notes') return { ok: false, error: 'Esse arquivo não é um backup do Stardew Notes.' };
  if (b.version !== 1) return { ok: false, error: 'Backup de uma versão mais nova do app. Atualize o app e tente de novo.' };
  if (!b.data || typeof b.data !== 'object' || Array.isArray(b.data)) return { ok: false, error: 'O backup está incompleto.' };
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(b.data)) {
    if (typeof v !== 'string' || !/^[\w.:-]{1,80}$/.test(k)) return { ok: false, error: 'O backup tem dados inválidos.' };
    data[k] = v;
  }
  return { ok: true, backup: { app: 'stardew-notes', version: 1, exportedAt: String(b.exportedAt ?? ''), data } };
}

export const backupFileName = (now = new Date()) => `stardew-notes-backup-${now.toISOString().slice(0, 10)}.json`;

export async function readAllPreferences(): Promise<Record<string, string>> {
  const { keys } = await Preferences.keys();
  const out: Record<string, string> = {};
  for (const key of keys) {
    const { value } = await Preferences.get({ key });
    if (value !== null) out[key] = value;
  }
  return out;
}

/** Gera o arquivo e entrega: no Android, abre o compartilhar (Drive, WhatsApp, Arquivos…); no navegador, baixa. */
export async function exportBackup(includePortraits: boolean): Promise<string> {
  const backup = buildBackup(await readAllPreferences(), includePortraits);
  const json = JSON.stringify(backup);
  const name = backupFileName();
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const file = await Filesystem.writeFile({ path: name, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: 'Backup do Stardew Notes', files: [file.uri], dialogTitle: 'Salvar o backup em…' });
  } else {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }
  return name;
}

/** Grava os dados do backup por cima dos atuais (chaves que não estão no backup ficam como estão). */
export async function restoreBackup(backup: BackupFile): Promise<number> {
  const entries = Object.entries(backup.data);
  for (const [key, value] of entries) await Preferences.set({ key, value });
  return entries.length;
}
