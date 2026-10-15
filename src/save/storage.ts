import { Preferences } from '@capacitor/preferences';
import type { ParsedSave } from './parseSave';

const KEY = 'valley.save.v2';

export interface StoredSave {
  importedAt: string;
  fileName: string;
  save: ParsedSave;
}

export async function loadStoredSave(): Promise<StoredSave | null> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    return value ? (JSON.parse(value) as StoredSave) : null;
  } catch {
    return null;
  }
}

export async function storeSave(entry: StoredSave): Promise<void> {
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(entry) });
  } catch {
    // sem armazenamento: o save continua na tela, só não fica guardado
  }
}
