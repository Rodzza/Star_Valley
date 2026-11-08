import { describe, expect, it } from 'vitest';
import { EXIT_WINDOW_MS, exitDecision, handleBack, registerBack } from './backButton';

describe('botão voltar', () => {
  it('o tratador mais recente responde primeiro e, se recusar, passa ao anterior', () => {
    const log: string[] = [];
    const offA = registerBack(() => (log.push('aba'), true));
    const offB = registerBack(() => (log.push('item'), false));
    expect(handleBack()).toBe(true);
    expect(log).toEqual(['item', 'aba']);
    offB();
    offA();
  });

  it('sem tratadores, avisa que ninguém tratou (o app fecha)', () => {
    expect(handleBack()).toBe(false);
  });

  it('remover um tratador o tira da fila', () => {
    const off = registerBack(() => true);
    off();
    expect(handleBack()).toBe(false);
  });

  it('o tratador do app (root) responde por último, mesmo registrado depois das telas internas', () => {
    const log: string[] = [];
    const offItem = registerBack(() => (log.push('item'), true));
    const offApp = registerBack(() => (log.push('app'), true), true);
    handleBack();
    expect(log).toEqual(['item']);
    offItem();
    handleBack();
    expect(log).toEqual(['item', 'app']);
    offApp();
  });

  it('no Início: o primeiro toque avisa, o segundo logo depois fecha', () => {
    expect(exitDecision(null, 1000)).toBe('warn');
    expect(exitDecision(1000, 1000 + EXIT_WINDOW_MS - 1)).toBe('exit');
    expect(exitDecision(1000, 1000 + EXIT_WINDOW_MS + 1)).toBe('warn');
  });
});
