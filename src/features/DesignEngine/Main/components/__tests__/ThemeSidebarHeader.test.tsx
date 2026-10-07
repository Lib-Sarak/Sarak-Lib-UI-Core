import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeSidebarHeader } from '../ThemeSidebarHeader';

describe('ThemeSidebarHeader', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ThemeSidebarHeader).toBeDefined();
    });

    const baseProps = () => ({
        viewMode: 'preview' as const,
        setViewMode: vi.fn(),
        isDirty: false,
        setIsSaveModalOpen: vi.fn(),
        previewDevice: 'desktop' as const,
        setPreviewDevice: vi.fn(),
        searchQuery: '',
        setSearchQuery: vi.fn(),
        editMode: 'essential' as const,
        setEditMode: vi.fn(),
        isPreviewStacked: false,
        setIsPreviewStacked: vi.fn(),
        handleApplyGlobalChanges: vi.fn(),
        canUndoLastApply: false,
        onUndoLastApply: vi.fn()
    });

    it('expõe três opções de modo num grupo de rádio nomeado e marca a seleção', () => {
        render(<ThemeSidebarHeader {...baseProps()} />);

        expect(screen.getByRole('radiogroup', { name: 'Modo de edição' })).toBeInTheDocument();
        expect(screen.getAllByRole('radio')).toHaveLength(3);
        expect(screen.getByRole('radio', { name: 'Impacto' })).toHaveAttribute('aria-checked', 'false');
        expect(screen.getByRole('radio', { name: 'Essencial' })).toHaveAttribute('aria-checked', 'true');
        expect(screen.getByRole('radio', { name: 'Completo' })).toHaveAttribute('aria-checked', 'false');
    });

    // plan-37: o HyperGranularityTab (Command Center) ganha entrada própria e nomeada no
    // seletor de viewMode, separada do toggle Essencial/Avançado.
    it('plan-37: expõe um botão nomeado "Buscar token (avançado)" para o Command Center', () => {
        render(<ThemeSidebarHeader {...baseProps()} />);

        expect(screen.getByTitle('Buscar token (avançado)')).toBeDefined();
    });

    it('plan-37: clicar no botão do Command Center chama setViewMode("command-center")', () => {
        const setViewMode = vi.fn();
        render(<ThemeSidebarHeader {...baseProps()} setViewMode={setViewMode} />);

        screen.getByTitle('Buscar token (avançado)').click();

        expect(setViewMode).toHaveBeenCalledWith('command-center');
    });

    it('seta para a direita muda a seleção do grupo de rádio', async () => {
        const user = userEvent.setup();
        const setEditMode = vi.fn();
        render(<ThemeSidebarHeader {...baseProps()} setEditMode={setEditMode} />);

        const selectedMode = screen.getByRole('radio', { name: 'Essencial' });
        selectedMode.focus();
        expect(selectedMode).toHaveFocus();

        await user.keyboard('{ArrowRight}');

        expect(setEditMode).toHaveBeenCalledWith('complete');
    });

    it('mantém o mesmo input de busca ao trocar de modo', () => {
        const props = baseProps();
        const { rerender } = render(<ThemeSidebarHeader {...props} />);
        const searchInput = screen.getByPlaceholderText('BUSCAR TOKEN...');

        rerender(<ThemeSidebarHeader {...props} editMode="impact" />);

        expect(screen.getByPlaceholderText('BUSCAR TOKEN...')).toBe(searchInput);
    });

    it('Espaço alterna o switch "Empilhar Previews"', async () => {
        const user = userEvent.setup();
        const setIsPreviewStacked = vi.fn();
        render(<ThemeSidebarHeader {...baseProps()} isPreviewStacked={false} setIsPreviewStacked={setIsPreviewStacked} />);

        const toggle = screen.getByRole('switch', { name: /Empilhar Previews inativo/i });
        expect(toggle.tagName).toBe('INPUT');

        toggle.focus();
        await user.keyboard(' ');

        expect(setIsPreviewStacked).toHaveBeenCalledWith(true);
    });

    // O controle "Desfazer última aplicação" só existe quando há o que desfazer,
    // e aciona o mesmo caminho de "Aplicar" (via `onUndoLastApply`).
    describe('"Desfazer última aplicação"', () => {
        it('não aparece quando `canUndoLastApply` é false', () => {
            render(<ThemeSidebarHeader {...baseProps()} canUndoLastApply={false} />);

            expect(screen.queryByText('Desfazer última aplicação')).toBeNull();
        });

        it('aparece quando `canUndoLastApply` é true, e clicar chama `onUndoLastApply`', async () => {
            const user = userEvent.setup();
            const onUndoLastApply = vi.fn();
            render(<ThemeSidebarHeader {...baseProps()} canUndoLastApply={true} onUndoLastApply={onUndoLastApply} />);

            const botao = screen.getByText('Desfazer última aplicação');
            await user.click(botao);

            expect(onUndoLastApply).toHaveBeenCalledTimes(1);
        });
    });
});
