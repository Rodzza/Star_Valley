// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EMPTY_ONBOARDING } from '../onboarding/state';
import { Onboarding } from './Onboarding';

describe('Onboarding (interface)', () => {
  it('percorre as 4 telas e devolve nome da fazenda e interesses', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Onboarding initial={EMPTY_ONBOARDING} onFinish={onFinish} />);

    expect(screen.getByText('Seu caderno do vale')).toBeInTheDocument();
    expect(screen.getByText(/não oficial/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Começar' }));

    await user.type(screen.getByPlaceholderText('Ex.: Fazenda Girassol'), 'Fazenda Girassol');
    await user.click(screen.getByRole('button', { name: 'Verão' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await user.click(screen.getByRole('button', { name: /Receitas/ }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText('Ajuda sem sair do jogo')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Explorar o app' }));

    expect(onFinish).toHaveBeenCalledWith({ done: true, farmName: 'Fazenda Girassol', interests: ['recipes'] }, false);
  });

  it('pular termina na hora', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Onboarding initial={EMPTY_ONBOARDING} onFinish={onFinish} />);
    await user.click(screen.getByRole('button', { name: 'Pular' }));
    expect(onFinish).toHaveBeenCalledWith(expect.objectContaining({ done: true }), false);
  });
});
