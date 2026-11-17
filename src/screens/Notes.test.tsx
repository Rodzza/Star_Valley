// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Notes } from './Notes';

describe('Minhas notas (interface)', () => {
  it('cria, encontra pela busca e apaga uma nota', async () => {
    const user = userEvent.setup();
    render(<Notes />);
    expect(await screen.findByText('Nenhuma nota ainda')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '+ Nova nota' }));
    await user.type(screen.getByLabelText('Título da nota'), 'Plano do Verão');
    await user.type(screen.getByLabelText('Texto da nota'), 'Plantar mirtilo no dia 1');
    await user.click(screen.getByRole('button', { name: /Salvar e voltar/ }));
    expect(screen.getByText('Plano do Verão')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Buscar nas notas'), 'inverno');
    expect(screen.getByText('Nenhuma nota encontrada.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Buscar nas notas'));

    await user.click(screen.getByText('Plano do Verão'));
    await user.click(screen.getByRole('button', { name: 'Apagar nota' }));
    await user.click(within(screen.getByRole('alert')).getByRole('button', { name: 'Apagar' }));
    expect(await screen.findByText('Nenhuma nota ainda')).toBeInTheDocument();
  });

  it('não salva nota deixada em branco', async () => {
    const user = userEvent.setup();
    render(<Notes />);
    await user.click(await screen.findByRole('button', { name: '+ Nova nota' }));
    await user.click(screen.getByRole('button', { name: /Salvar e voltar/ }));
    expect(screen.getByText('Nenhuma nota ainda')).toBeInTheDocument();
  });
});
