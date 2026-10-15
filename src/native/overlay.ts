import { Capacitor, registerPlugin } from '@capacitor/core';

interface ValleyOverlayPlugin {
  status(): Promise<{ granted: boolean; running: boolean }>;
  requestPermission(): Promise<void>;
  show(options: { title: string; lines: string[] }): Promise<void>;
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
