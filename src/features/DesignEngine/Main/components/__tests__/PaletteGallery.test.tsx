import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { PEEK_DELAY_MS } from '../../../Canvas/components/peek';
import { PaletteGallery } from '../PaletteGallery';

vi.mock('../../../../../core/Design/palette/presets', () => ({
    SARAK_PALETTE_PRESETS: {
        oceano: { type: 'analogous', base: '#2563eb' },
        floresta: { type: 'analogous', base: '#16a34a' },
        brasa: { type: 'triadic', base: '#dc2626' },
    },
    SARAK_PALETTE_PRESET_TEXT_KEYS: {},
}));

/** A galeria abre só o grupo da paleta escolhida: os testes que olham todas as linhas abrem os outros antes. */
const openGroups = (): void => {
    document.querySelectorAll('[data-palette-group] [aria-expanded="false"]').forEach((toggle) => fireEvent.click(toggle));
};
const renderOpen = (ui: React.ReactElement) => {
    const view = render(ui);
    openGroups();
    return view;
};

describe('PaletteGallery', () => {
    it('lista os presets num radiogroup nomeado, com o tipo no nome de cada opção', () => {
        renderOpen(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        const group = screen.getByRole('radiogroup', { name: 'Paletas prontas' });
        const names = within(group).getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'));
        expect(names).toEqual(['Oceano — Análoga', 'Floresta — Análoga', 'Brasa — Triádica']);
    });

    it('cada paleta é uma linha: faixa contínua e nome, sem as palavras Claro e Escuro', () => {
        renderOpen(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        const rows = within(screen.getByRole('radiogroup', { name: 'Paletas prontas' })).getAllByRole('radio');
        expect(rows).toHaveLength(3);
        rows.forEach((row) => expect(row.querySelectorAll('[data-testid="palette-strip"]')).toHaveLength(1));
        expect(screen.queryByText('Claro')).toBeNull();
        expect(screen.queryByText('Escuro')).toBeNull();
        expect(screen.queryByTestId('palette-swatch-light')).toBeNull();
    });

    it('os filtros por tipo mostram só as paletas do tipo e funcionam pelo teclado', () => {
        renderOpen(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        const filters = screen.getByRole('group', { name: 'Filtrar paletas por tipo' });
        expect(within(filters).getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true');

        const triadic = within(filters).getByRole('button', { name: 'Triádica' });
        triadic.focus();
        fireEvent.keyDown(triadic, { key: 'Enter' });
        fireEvent.click(triadic);
        expect(triadic).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'))).toEqual(['Brasa — Triádica']);

        fireEvent.click(within(filters).getByRole('button', { name: 'Todas' }));
        openGroups();
        expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('só oferece filtro de tipo que tem paleta', () => {
        renderOpen(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        const names = within(screen.getByRole('group', { name: 'Filtrar paletas por tipo' })).getAllByRole('button').map((b) => b.textContent);
        expect(names).toEqual(['Todas', 'Análoga', 'Triádica']);
    });

    it('as setas circulam dentro da lista já filtrada', () => {
        const onSelect = vi.fn();
        renderOpen(<PaletteGallery selectedId="oceano" onSelect={onSelect} />);
        fireEvent.click(within(screen.getByRole('group', { name: 'Filtrar paletas por tipo' })).getByRole('button', { name: 'Análoga' }));
        fireEvent.keyDown(screen.getByRole('radio', { name: /Floresta/ }), { key: 'ArrowDown' });
        expect(screen.getByRole('radio', { name: /Oceano/ })).toHaveFocus();
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('marca só a paleta selecionada e dá o foco de tabulação a ela', () => {
        renderOpen(<PaletteGallery selectedId="brasa" onSelect={() => undefined} />);
        const brasa = screen.getByRole('radio', { name: /Brasa/ });
        expect(brasa).toHaveAttribute('aria-checked', 'true');
        expect(brasa).toHaveAttribute('tabindex', '0');
        expect(screen.getByRole('radio', { name: /Oceano/ })).toHaveAttribute('tabindex', '-1');
    });

    it('sem seleção, a primeira opção recebe o foco de tabulação', () => {
        renderOpen(<PaletteGallery selectedId="" onSelect={() => undefined} />);
        expect(screen.getByRole('radio', { name: /Oceano/ })).toHaveAttribute('tabindex', '0');
    });

    it('o clique escolhe a paleta', () => {
        const onSelect = vi.fn();
        renderOpen(<PaletteGallery selectedId="oceano" onSelect={onSelect} />);
        fireEvent.click(screen.getByRole('radio', { name: /Floresta/ }));
        expect(onSelect).toHaveBeenLastCalledWith('floresta');
    });

    it('as setas só movem o foco, circulando nas pontas; escolher é o clique ou o Enter', () => {
        const onSelect = vi.fn();
        renderOpen(<PaletteGallery selectedId="oceano" onSelect={onSelect} />);
        fireEvent.keyDown(screen.getByRole('radio', { name: /Brasa/ }), { key: 'ArrowDown' });
        expect(screen.getByRole('radio', { name: /Oceano/ })).toHaveFocus();
        fireEvent.keyDown(screen.getByRole('radio', { name: /Oceano/ }), { key: 'ArrowUp' });
        expect(screen.getByRole('radio', { name: /Brasa/ })).toHaveFocus();
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('o foco itinerante segue a opção que tem o foco', () => {
        renderOpen(<PaletteGallery selectedId="oceano" onSelect={() => undefined} />);
        fireEvent.focus(screen.getByRole('radio', { name: /Floresta/ }));
        expect(screen.getByRole('radio', { name: /Floresta/ })).toHaveAttribute('tabindex', '0');
        expect(screen.getByRole('radio', { name: /Oceano/ })).toHaveAttribute('tabindex', '-1');
    });

    describe('espiada', () => {
        beforeEach(() => { vi.useFakeTimers(); window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as typeof window.matchMedia; });
        afterEach(() => { vi.useRealTimers(); });
        const peekTokensOf = (id: string) => ({ colorPalette: id });

        it('o mouse espia a paleta e sair devolve null, sem escolher', () => {
            const onPeek = vi.fn();
            const onSelect = vi.fn();
            renderOpen(<PaletteGallery selectedId="oceano" onSelect={onSelect} onPeek={onPeek} peekTokensOf={peekTokensOf} />);
            const option = screen.getByRole('radio', { name: /Floresta/ });
            fireEvent.mouseEnter(option);
            act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
            expect(onPeek).toHaveBeenCalledWith({ colorPalette: 'floresta' });
            fireEvent.mouseLeave(option);
            expect(onPeek).toHaveBeenLastCalledWith(null);
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('a seta move o foco e o foco espia; só o clique escolhe', () => {
            const onPeek = vi.fn();
            const onSelect = vi.fn();
            renderOpen(<PaletteGallery selectedId="oceano" onSelect={onSelect} onPeek={onPeek} peekTokensOf={peekTokensOf} />);
            fireEvent.keyDown(screen.getByRole('radio', { name: /Brasa/ }), { key: 'ArrowDown' });
            act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
            expect(onPeek).toHaveBeenCalledWith({ colorPalette: 'oceano' });
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('sem onPeek a galeria não espia', () => {
            renderOpen(<PaletteGallery selectedId="oceano" onSelect={() => undefined} peekTokensOf={peekTokensOf} />);
            expect(() => {
                fireEvent.mouseEnter(screen.getByRole('radio', { name: /Floresta/ }));
                act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
            }).not.toThrow();
        });
    });

    describe('grupos recolhidos e "Minhas paletas"', () => {
        const saved = [
            { id: 'sp-1', name: 'Marca azul', value: 'custom:analogous:#2563eb' },
            { id: 'sp-2', name: 'Marca quente', value: 'custom:complementary:#aa3366' },
        ];
        const toggleOf = (name: string) => within(screen.getByRole('radiogroup', { name: 'Paletas prontas' })).getByRole('button', { name });

        it('abre só o grupo da paleta escolhida', () => {
            render(<PaletteGallery selectedId="brasa" onSelect={() => undefined} />);
            expect(toggleOf('Análoga')).toHaveAttribute('aria-expanded', 'false');
            expect(toggleOf('Triádica')).toHaveAttribute('aria-expanded', 'true');
            expect(screen.getAllByRole('radio')).toHaveLength(1);
        });

        it('sem escolha e sem salvas, tudo começa recolhido', () => {
            render(<PaletteGallery selectedId="" onSelect={() => undefined} />);
            expect(screen.queryAllByRole('radio')).toHaveLength(0);
        });

        it('as salvas vêm num grupo próprio, antes dos tipos, aberto quando nenhuma paleta pronta está escolhida', () => {
            render(<PaletteGallery selectedId="" onSelect={() => undefined} savedPalettes={saved} />);
            const titles = Array.from(document.querySelectorAll('[data-palette-group] [data-group-toggle]')).map((node) => node.textContent);
            expect(titles).toEqual(['Minhas paletas', 'Análoga', 'Triádica']);
            expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'))).toEqual(['Marca azul — Análoga', 'Marca quente — Complementar']);
        });

        it('escolher uma salva entrega o valor dela, e ela é a marcada quando é o colorPalette', () => {
            const onSelect = vi.fn();
            renderOpen(<PaletteGallery selectedId="custom:analogous:#2563eb" onSelect={onSelect} savedPalettes={saved} />);
            expect(screen.getByRole('radio', { name: 'Marca azul — Análoga' })).toHaveAttribute('aria-checked', 'true');
            fireEvent.click(screen.getByRole('radio', { name: 'Marca quente — Complementar' }));
            expect(onSelect).toHaveBeenLastCalledWith('custom:complementary:#aa3366');
        });

        it('só a salva tem o botão de apagar, e ele entrega a entrada sem escolher a paleta', () => {
            const onSelect = vi.fn();
            const onDeleteSaved = vi.fn();
            renderOpen(<PaletteGallery selectedId="" onSelect={onSelect} savedPalettes={saved} onDeleteSaved={onDeleteSaved} />);
            expect(screen.getAllByRole('button', { name: /^Apagar a paleta/ })).toHaveLength(2);
            fireEvent.click(screen.getByRole('button', { name: 'Apagar a paleta Marca quente' }));
            expect(onDeleteSaved).toHaveBeenCalledWith(saved[1]);
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('sem onDeleteSaved a linha não tem o botão', () => {
            render(<PaletteGallery selectedId="" onSelect={() => undefined} savedPalettes={saved} />);
            expect(screen.queryByRole('button', { name: /^Apagar a paleta/ })).toBeNull();
        });

        it('o filtro por tipo esconde "Minhas paletas"; Todas a traz de volta', () => {
            render(<PaletteGallery selectedId="" onSelect={() => undefined} savedPalettes={saved} />);
            const filters = within(screen.getByRole('group', { name: 'Filtrar paletas por tipo' }));
            fireEvent.click(filters.getByRole('button', { name: 'Triádica' }));
            expect(document.querySelector('[data-palette-group="mine"]')).toBeNull();
            fireEvent.click(filters.getByRole('button', { name: 'Todas' }));
            expect(document.querySelector('[data-palette-group="mine"]')).not.toBeNull();
        });

        it('valor gravado que não é uma paleta válida não vira linha', () => {
            render(<PaletteGallery selectedId="" onSelect={() => undefined} savedPalettes={[{ id: 'sp-1', name: 'Quebrada', value: 'custom:analogous:azul' }]} />);
            expect(screen.queryByRole('radio', { name: /Quebrada/ })).toBeNull();
        });
    });

    it('outras teclas não escolhem nada', () => {
        const onSelect = vi.fn();
        renderOpen(<PaletteGallery selectedId="oceano" onSelect={onSelect} />);
        fireEvent.keyDown(screen.getByRole('radio', { name: /Oceano/ }), { key: 'a' });
        expect(onSelect).not.toHaveBeenCalled();
    });
});
