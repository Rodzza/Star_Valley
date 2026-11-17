// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Recipes } from './Recipes';

describe('Receitas (interface)', () => {
  it('busca, marca como aprendida e filtra as que faltam', async () => {
    const user = userEvent.setup();
    render(<Recipes />);
    expect(screen.getByText(/0 de 81 aprendidas/)).toBeInTheDocument();

    await user.type(screen.getByLabelText('Buscar receita'), 'omelete');
    expect(screen.getByText('Omelete')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Aprendi: Omelete' }));
    expect(screen.getByText(/1 de 81 aprendidas/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Faltando' }));
    expect(screen.queryByText('Omelete')).not.toBeInTheDocument();
  });
});
