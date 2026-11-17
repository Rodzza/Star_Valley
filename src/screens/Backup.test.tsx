// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Backup } from './Backup';

const file = (text: string) => new File([text], 'backup.json', { type: 'application/json' });

describe('Backup (interface)', () => {
  it('recusa um arquivo que não é backup', async () => {
    const user = userEvent.setup();
    render(<Backup />);
    await user.upload(screen.getByLabelText('Escolher arquivo de backup'), file('{"app":"outro"}'));
    expect(await screen.findByRole('status')).toHaveTextContent('não é um backup do Stardew Notes');
  });

  it('pede confirmação antes de restaurar um backup válido', async () => {
    const user = userEvent.setup();
    render(<Backup />);
    const ok = { app: 'stardew-notes', version: 1, exportedAt: '2026-11-17T12:00:00Z', data: { 'notas-v1': '[]' } };
    await user.upload(screen.getByLabelText('Escolher arquivo de backup'), file(JSON.stringify(ok)));
    expect(await screen.findByText('Restaurar este backup?')).toBeInTheDocument();
    expect(screen.getByText(/com 1 itens/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('Restaurar este backup?')).not.toBeInTheDocument();
  });
});
