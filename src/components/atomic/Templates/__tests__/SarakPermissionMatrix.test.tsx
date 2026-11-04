import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakPermissionMatrix, type SarakPermissionMatrixProps } from '../SarakPermissionMatrix';

const baseProps: SarakPermissionMatrixProps = {
    roles: [{ id: 'admin', label: 'Admin' }, { id: 'editor', label: 'Editor' }],
    groups: [
        { id: 'docs', label: 'Documentos', permissions: [{ id: 'ler', label: 'Ler' }, { id: 'editar', label: 'Editar' }] },
        { id: 'conta', label: 'Conta', permissions: [{ id: 'faturar', label: 'Faturar' }] },
    ],
    granted: { admin: ['ler', 'editar', 'faturar'], editor: ['ler'] },
    inherited: { editor: ['editar'] },
};

const cell = (row: number, column: number): HTMLElement => document.querySelector(`[data-cell="${row}:${column}"]`) as HTMLElement;

describe('SarakPermissionMatrix', () => {
    it('é uma grade nomeada, com cabeçalhos de papel e de grupo', () => {
        render(<SarakPermissionMatrix {...baseProps} />);

        expect(screen.getByRole('grid', { name: 'Matriz de permissões' })).toBeInTheDocument();
        expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['Permissão', 'Admin', 'Editor']);
        expect(screen.getByRole('rowheader', { name: 'Documentos' })).toBeInTheDocument();
    });

    it('direta, herdada e sem acesso têm forma e nome próprios', () => {
        render(<SarakPermissionMatrix {...baseProps} />);

        expect(cell(0, 1)).toHaveAttribute('data-state', 'direct');
        expect(cell(0, 1)).toHaveTextContent('✓');
        expect(cell(0, 1)).toHaveAccessibleName('Editor · Ler: Concedida direto');
        expect(cell(1, 1)).toHaveAttribute('data-state', 'inherited');
        expect(cell(1, 1)).toHaveTextContent('◆');
        expect(cell(1, 1)).toHaveAccessibleName('Editor · Editar: Herdada');
        expect(cell(2, 1)).toHaveAttribute('data-state', 'none');
        expect(cell(2, 1)).toHaveTextContent('–');
        expect(cell(2, 1)).toHaveAccessibleName('Editor · Faturar: Sem acesso');
    });

    it('só uma célula entra na ordem de Tab (foco itinerante)', () => {
        render(<SarakPermissionMatrix {...baseProps} />);

        expect(document.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
        expect(cell(0, 0)).toHaveAttribute('tabindex', '0');
    });

    it('as setas movem o foco pela grade, e Home/End andam na linha', async () => {
        render(<SarakPermissionMatrix {...baseProps} />);
        cell(0, 0).focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(cell(0, 1)).toHaveFocus();
        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        expect(cell(2, 1)).toHaveFocus();
        await userEvent.keyboard('{Home}');
        expect(cell(2, 0)).toHaveFocus();
        await userEvent.keyboard('{End}');
        expect(cell(2, 1)).toHaveFocus();
        expect(cell(2, 1)).toHaveAttribute('tabindex', '0');
        expect(cell(0, 0)).toHaveAttribute('tabindex', '-1');
    });

    it('Espaço concede uma permissão e anuncia a mudança', async () => {
        const onToggle = vi.fn();
        render(<SarakPermissionMatrix {...baseProps} onToggle={onToggle} />);
        cell(2, 1).focus();
        await userEvent.keyboard(' ');

        expect(onToggle).toHaveBeenCalledWith('editor', 'faturar', true);
        expect(screen.getByRole('status')).toHaveTextContent('Editor · Faturar: Concedida direto');
    });

    it('Enter e clique retiram uma permissão direta', async () => {
        const onToggle = vi.fn();
        render(<SarakPermissionMatrix {...baseProps} onToggle={onToggle} />);
        cell(0, 0).focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.click(cell(1, 0));

        expect(onToggle).toHaveBeenNthCalledWith(1, 'admin', 'ler', false);
        expect(onToggle).toHaveBeenNthCalledWith(2, 'admin', 'editar', false);
    });

    it('a herdada não alterna', async () => {
        const onToggle = vi.fn();
        render(<SarakPermissionMatrix {...baseProps} onToggle={onToggle} />);
        await userEvent.click(cell(1, 1));

        expect(onToggle).not.toHaveBeenCalled();
        expect(cell(1, 1)).toHaveAttribute('aria-readonly', 'true');
    });

    it('somente leitura: navega, mas nada alterna', async () => {
        const onToggle = vi.fn();
        render(<SarakPermissionMatrix {...baseProps} onToggle={onToggle} readOnly />);
        cell(0, 0).focus();
        await userEvent.keyboard('{ArrowRight} ');

        expect(cell(0, 1)).toHaveFocus();
        expect(onToggle).not.toHaveBeenCalled();
        expect(screen.getByRole('grid')).toHaveAttribute('aria-readonly', 'true');
    });
});
