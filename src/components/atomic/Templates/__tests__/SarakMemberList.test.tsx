import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakMemberList } from '../SarakMemberList';

const members = [{ id: 'm1', name: 'Ana Souza', email: 'ana@exemplo.com', role: 'Admin' }, { id: 'm2', name: 'Beto Lima' }];
const invitations = [{ id: 'i1', email: 'carla@exemplo.com', role: 'Editor', sentAt: '2026-05-02T10:00:00Z' }];

describe('SarakMemberList', () => {
    it('lista membros com e-mail e papel, e convites pendentes numa seção própria', () => {
        render(<SarakMemberList members={members} invitations={invitations} />);
        const memberSection = screen.getByRole('region', { name: 'Membros' });
        const inviteSection = screen.getByRole('region', { name: 'Convites pendentes' });

        expect(within(memberSection).getByText('Ana Souza')).toBeInTheDocument();
        expect(within(memberSection).getByText('ana@exemplo.com')).toBeInTheDocument();
        expect(within(memberSection).getByText('Admin')).toBeInTheDocument();
        expect(within(inviteSection).getByText('carla@exemplo.com')).toBeInTheDocument();
        expect(inviteSection).toHaveTextContent(/Convidado em/);
    });

    it('sem convites, a seção não aparece; sem membros, mostra o estado vazio', () => {
        render(<SarakMemberList members={[]} />);

        expect(screen.queryByRole('region', { name: 'Convites pendentes' })).not.toBeInTheDocument();
        expect(screen.getByText('Nenhum membro ainda.')).toBeInTheDocument();
    });

    it('os botões nomeiam a pessoa e entregam o id ao host', async () => {
        const handlers = { onRemoveMember: vi.fn(), onResendInvitation: vi.fn(), onRevokeInvitation: vi.fn() };
        render(<SarakMemberList members={members} invitations={invitations} {...handlers} />);
        await userEvent.click(screen.getByRole('button', { name: 'Remover Beto Lima' }));
        await userEvent.click(screen.getByRole('button', { name: 'Reenviar convite para carla@exemplo.com' }));
        await userEvent.click(screen.getByRole('button', { name: 'Revogar convite de carla@exemplo.com' }));

        expect(handlers.onRemoveMember).toHaveBeenCalledWith('m2');
        expect(handlers.onResendInvitation).toHaveBeenCalledWith('i1');
        expect(handlers.onRevokeInvitation).toHaveBeenCalledWith('i1');
    });

    it('sem callback, o botão correspondente não existe', () => {
        render(<SarakMemberList members={members} invitations={invitations} />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renderMemberActions põe ações extras ao lado de cada membro', () => {
        render(<SarakMemberList members={members} renderMemberActions={(member) => <span>Extra de {member.name}</span>} />);

        expect(screen.getByText('Extra de Ana Souza')).toBeInTheDocument();
        expect(screen.getByText('Extra de Beto Lima')).toBeInTheDocument();
    });
});
