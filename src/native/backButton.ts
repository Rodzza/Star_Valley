/**
 * Botão voltar do Android. Cada tela registra o que fazer ao voltar; o último registrado responde
 * primeiro (ex.: página do item → personagem → lista → aba anterior). Se ninguém tratar (no Início), o primeiro toque avisa e o segundo fecha o app.
 */
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';

/** Devolve true se tratou o voltar. */
export type BackHandler = () => boolean;

const handlers: BackHandler[] = [];

/**
 * `root` vai para o fim da fila (responde por último): é o tratador do app inteiro, que só volta
 * de tela quando nenhuma tela interna (página do item, personagem…) tratou o voltar. Sem isso, como
 * o React monta os filhos antes do pai, o app pularia por cima das telas internas.
 */
export function registerBack(h: BackHandler, root = false): () => void {
  if (root) handlers.unshift(h);
  else handlers.push(h);
  return () => {
    const i = handlers.lastIndexOf(h);
    if (i >= 0) handlers.splice(i, 1);
  };
}

/** Roda os tratadores do mais recente ao mais antigo. Devolve false se nenhum tratou. */
export function handleBack(): boolean {
  for (let i = handlers.length - 1; i >= 0; i--) if (handlers[i]!()) return true;
  return false;
}

/** Registra um tratador enquanto o componente estiver na tela, sempre com a versão mais nova da função. */
export function useBackHandler(h: BackHandler, root = false): void {
  const ref = useRef(h);
  ref.current = h;
  useEffect(() => registerBack(() => ref.current(), root), [root]);
}

/** Tempo para o segundo toque no voltar fechar o app. */
export const EXIT_WINDOW_MS = 2000;

/**
 * Decide o que fazer quando nenhuma tela tratou o voltar (está no Início): o primeiro toque avisa,
 * o segundo dentro de EXIT_WINDOW_MS fecha.
 */
export function exitDecision(lastPress: number | null, now: number): 'exit' | 'warn' {
  return lastPress !== null && now - lastPress <= EXIT_WINDOW_MS ? 'exit' : 'warn';
}

function showExitToast(): void {
  let el = document.getElementById('exit-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'exit-toast';
    el.className = 'exit-toast';
    el.setAttribute('role', 'status');
    el.textContent = 'Para sair do app, aperte mais uma vez';
    document.body.appendChild(el);
  }
  el.classList.add('exit-toast--on');
  window.clearTimeout(Number(el.dataset.timer));
  el.dataset.timer = String(window.setTimeout(() => el!.classList.remove('exit-toast--on'), EXIT_WINDOW_MS));
}

let installed = false;
export function installBackButton(): void {
  if (installed || !Capacitor.isNativePlatform()) return;
  installed = true;
  let lastPress: number | null = null;
  void App.addListener('backButton', () => {
    if (handleBack()) {
      lastPress = null;
      return;
    }
    const now = Date.now();
    if (exitDecision(lastPress, now) === 'exit') {
      void App.exitApp();
      return;
    }
    lastPress = now;
    showExitToast();
  });
}
