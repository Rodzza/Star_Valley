// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App (interface)', () => {
  it('do primeiro uso até salvar uma função nos favoritos', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Pular' }));
    expect(await screen.findByText('Bem-vindo!')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Receitas' }));
    await user.click(await screen.findByRole('button', { name: 'Salvar Receitas' }));
    expect(screen.getByRole('button', { name: 'Tirar Receitas dos salvos' })).toBeInTheDocument();

    await user.click(screen.getByText('Salvos'));
    expect(await screen.findByRole('heading', { name: 'Salvos' })).toBeInTheDocument();
    expect(screen.getByText('Os 81 pratos, ingredientes e como aprender: TV, cartas dos moradores, habilidade ou loja.')).toBeInTheDocument();
  });

  it('não tem nada pago: sem anúncios nem Pro', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Pular' }));
    await user.click(await screen.findByText('Perfil'));
    expect(screen.getByText('Tudo liberado')).toBeInTheDocument();
    expect(screen.queryByText(/anúncio restante|Conhecer o Pro|assinatura/i)).not.toBeInTheDocument();
  });
});
