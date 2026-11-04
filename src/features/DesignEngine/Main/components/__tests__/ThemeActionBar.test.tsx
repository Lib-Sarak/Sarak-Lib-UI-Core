import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeActionBar } from '../ThemeActionBar';
import type { SarakDirtyToken } from '../../../hooks/useDesignDraft';

const tokens = (count: number): SarakDirtyToken[] => Array.from({ length: count }, (_, index) => ({
    id: `token${index}`, label: `Token ${index}`, applied: '#000000', draft: '#ffffff',
}));

const createProps = (overrides: Partial<React.ComponentProps<typeof ThemeActionBar>> = {}) => ({
    isDirty: true,
    dirtyTokenCount: 1,
    dirtyTokens: tokens(overrides.dirtyTokenCount ?? 1),
    onApply: vi.fn(),
    onDiscard: vi.fn(),
    canSaveToRuntime: false,
    canDeleteTheme: false,
    onSave: vi.fn(),
    onExport: vi.fn(),
    onCreateTheme: vi.fn(),
    onDeleteTheme: vi.fn(),
    canUndoLastApply: false,
    onUndoLastApply: vi.fn(),
    ...overrides
});

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    return screen.getByRole('menu', { name: 'Mais ações' });
};

describe('ThemeActionBar', () => {
    it('mostra uma só ação primária, Descartar e o menu — nenhuma ação de gestão fica solta na barra', () => {
        render(<ThemeActionBar {...createProps({ canSaveToRuntime: true, canDeleteTheme: true, canUndoLastApply: true })} />);

        const visible = screen.getAllByRole('button').map((button) => button.getAttribute('aria-label') ?? button.textContent?.trim());
        expect(visible.filter((name) => name !== '1 alteração')).toEqual(['Aplicar', 'Descartar', 'Mais ações']);
    });

    it.each([
        [0, null, true],
        [1, '1 alteração', false],
        [3, '3 alterações', false]
    ])('mostra o contador de alterações como texto auxiliar (%i)', (dirtyTokenCount, pendingCount, isDisabled) => {
        render(<ThemeActionBar {...createProps({ dirtyTokenCount })} />);

        const applyButton = screen.getByRole('button', { name: 'Aplicar' });
        expect(applyButton).toHaveProperty('disabled', isDisabled);
        expect(applyButton).toHaveClass('disabled:opacity-80');

        if (pendingCount) {
            expect(screen.getByRole('status')).toHaveTextContent(pendingCount);
            expect(applyButton).toHaveAttribute('aria-describedby', 'theme-pending-changes-count');
        } else {
            expect(screen.queryByRole('status')).toBeNull();
            expect(applyButton).not.toHaveAttribute('aria-describedby');
        }
    });

    it('sem alteração, o contador some e Aplicar e Descartar ficam desabilitados', () => {
        render(<ThemeActionBar {...createProps({ isDirty: false, dirtyTokenCount: 0 })} />);

        expect(screen.queryByRole('status')).toBeNull();
        expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
    });

    it('o contador abre a lista com o nome do token, o valor aplicado e o valor do rascunho', async () => {
        const user = userEvent.setup();
        render(<ThemeActionBar {...createProps({ dirtyTokenCount: 2 })} />);

        expect(screen.queryByRole('list', { name: 'Alterações pendentes' })).toBeNull();
        await user.click(screen.getByRole('button', { name: '2 alterações' }));

        const list = screen.getByRole('list', { name: 'Alterações pendentes' });
        const rows = within(list).getAllByRole('listitem');
        expect(rows).toHaveLength(2);
        expect(rows[0]).toHaveTextContent('Token 0');
        expect(rows[0]).toHaveTextContent('aplicado: #000000 → rascunho: #ffffff');
    });

    it('descarta o rascunho pelo callback global', async () => {
        const user = userEvent.setup();
        const onDiscard = vi.fn();
        render(<ThemeActionBar {...createProps({ onDiscard })} />);

        await user.click(screen.getByRole('button', { name: 'Descartar' }));

        expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it('permite exportar pelo menu quando não há alterações pendentes', async () => {
        const user = userEvent.setup();
        const onExport = vi.fn();
        render(<ThemeActionBar {...createProps({ isDirty: false, dirtyTokenCount: 0, onExport })} />);

        const menu = await openMenu(user);
        await user.click(within(menu).getByRole('menuitem', { name: 'Exportar JSON' }));

        expect(onExport).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('separa salvar runtime, exportar JSON, criar e apagar tema — todas alcançáveis pelo menu', async () => {
        const user = userEvent.setup();
        const handlers = { onSave: vi.fn(), onExport: vi.fn(), onCreateTheme: vi.fn(), onDeleteTheme: vi.fn() };
        render(<ThemeActionBar {...createProps({ canSaveToRuntime: true, canDeleteTheme: true, ...handlers })} />);

        for (const name of ['Salvar tema', 'Exportar JSON', 'Novo tema', 'Apagar tema']) {
            const menu = await openMenu(user);
            await user.click(within(menu).getByRole('menuitem', { name }));
        }

        expect(handlers.onSave).toHaveBeenCalledTimes(1);
        expect(handlers.onExport).toHaveBeenCalledTimes(1);
        expect(handlers.onCreateTheme).toHaveBeenCalledTimes(1);
        expect(handlers.onDeleteTheme).toHaveBeenCalledTimes(1);
    });

    it('Apagar tema é o último item, em tom de perigo', async () => {
        const user = userEvent.setup();
        render(<ThemeActionBar {...createProps({ canSaveToRuntime: true, canDeleteTheme: true, canUndoLastApply: true })} />);

        const items = within(await openMenu(user)).getAllByRole('menuitem');
        expect(items.map((item) => item.textContent)).toEqual(['Salvar tema', 'Novo tema', 'Exportar JSON', 'Desfazer última aplicação', 'Apagar tema']);
        expect(items[items.length - 1].className).toContain('theme-error');
        expect(items[0].className).not.toContain('theme-error');
    });

    it('esconde a gestão runtime sem a porta onSave', async () => {
        const user = userEvent.setup();
        render(<ThemeActionBar {...createProps()} />);

        const items = within(await openMenu(user)).getAllByRole('menuitem').map((item) => item.textContent);
        expect(items).toEqual(['Exportar JSON']);
    });

    it('só mostra Desfazer última aplicação quando há um snapshot disponível', async () => {
        const user = userEvent.setup();
        const onUndoLastApply = vi.fn();
        const { rerender } = render(<ThemeActionBar {...createProps({ canUndoLastApply: false })} />);

        expect(within(await openMenu(user)).queryByRole('menuitem', { name: 'Desfazer última aplicação' })).toBeNull();
        await user.keyboard('{Escape}');

        rerender(<ThemeActionBar {...createProps({ canUndoLastApply: true, onUndoLastApply })} />);
        await user.click(within(await openMenu(user)).getByRole('menuitem', { name: 'Desfazer última aplicação' }));

        expect(onUndoLastApply).toHaveBeenCalledTimes(1);
    });

    it('o menu segue o teclado do menu avançado: abre no primeiro item, setas circulam, Esc fecha e devolve o foco', async () => {
        const user = userEvent.setup();
        render(<ThemeActionBar {...createProps({ canSaveToRuntime: true })} />);
        const trigger = screen.getByRole('button', { name: 'Mais ações' });

        await user.click(trigger);
        const items = screen.getAllByRole('menuitem');
        expect(items[0]).toHaveFocus();

        await user.keyboard('{ArrowUp}');
        expect(items[items.length - 1]).toHaveFocus();
        await user.keyboard('{Home}');
        expect(items[0]).toHaveFocus();
        await user.keyboard('{End}');
        expect(items[items.length - 1]).toHaveFocus();

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('menu')).toBeNull();
        expect(trigger).toHaveFocus();
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('abrir o menu fecha a lista de alterações, e abrir a lista fecha o menu — nunca duas camadas juntas', async () => {
        const user = userEvent.setup();
        render(<ThemeActionBar {...createProps({ dirtyTokenCount: 2 })} />);

        await user.click(screen.getByRole('button', { name: '2 alterações' }));
        expect(screen.getByRole('list', { name: 'Alterações pendentes' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Mais ações' }));
        expect(screen.getByRole('menu', { name: 'Mais ações' })).toBeInTheDocument();
        expect(screen.queryByRole('list', { name: 'Alterações pendentes' })).toBeNull();
        expect(screen.getByRole('button', { name: '2 alterações' })).toHaveAttribute('aria-expanded', 'false');

        await user.click(screen.getByRole('button', { name: '2 alterações' }));
        expect(screen.getByRole('list', { name: 'Alterações pendentes' })).toBeInTheDocument();
        expect(screen.queryByRole('menu')).toBeNull();
    });
});
