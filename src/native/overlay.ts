import { Capacitor, registerPlugin } from '@capacitor/core';

interface ValleyOverlayPlugin {
  status(): Promise<{ granted: boolean; running: boolean }>;
  requestPermission(): Promise<void>;
  show(options: { title: string; lines: string[] }): Promise<void>;
  showDays(options: { days: Array<{ title: string; lines: string[] }> }): Promise<void>;
  progress(): Promise<{ index: number }>;
  hide(): Promise<void>;
}

const Native = registerPlugin<ValleyOverlayPlugin>('ValleyOverlay');

/** O botão flutuante só existe no app Android; no navegador (desenvolvimento) tudo é simulado. */
export const overlaySupported = (): boolean => Capacitor.getPlatform() === 'android';

export async function overlayStatus(): Promise<{ granted: boolean; running: boolean }> {
  if (!overlaySupported()) return { granted: false, running: false };
  try {
    return await Native.status();
  } catch {
    return { granted: false, running: false };
  }
}

export const overlayRequestPermission = (): Promise<void> => (overlaySupported() ? Native.requestPermission() : Promise.resolve());

export type ShowResult = 'shown' | 'no-permission' | 'unsupported' | 'error';

export async function overlayShow(title: string, lines: string[]): Promise<ShowResult> {
  if (!overlaySupported()) return 'unsupported';
  try {
    await Native.show({ title, lines });
    return 'shown';
  } catch (e) {
    return e instanceof Error && e.message.includes('PERMISSION_DENIED') ? 'no-permission' : 'error';
  }
}

export async function overlayHide(): Promise<void> {
  if (overlaySupported()) await Native.hide();
}

/**
 * Envia vários dias de uma vez (índice 0 = dia marcado no app). O botão avança entre eles com
 * "Dormi", sem precisar do app aberto.
 */
export async function overlayShowDays(days: Array<{ title: string; lines: string[] }>): Promise<ShowResult> {
  if (!overlaySupported()) return 'unsupported';
  try {
    await Native.showDays({ days });
    return 'shown';
  } catch (e) {
    return e instanceof Error && e.message.includes('PERMISSION_DENIED') ? 'no-permission' : 'error';
  }
}

/** Quantos dias o jogador avançou no botão flutuante desde o último envio. */
export async function overlayProgress(): Promise<number> {
  if (!overlaySupported()) return 0;
  try {
    const { index } = await Native.progress();
    return Number.isInteger(index) && index > 0 ? index : 0;
  } catch {
    return 0;
  }
}
