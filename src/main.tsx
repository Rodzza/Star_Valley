import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { applyPalette, preferredPalette } from './styles/tokens';

applyPalette(preferredPalette()); // antes do 1º desenho, para não piscar sem tema

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
