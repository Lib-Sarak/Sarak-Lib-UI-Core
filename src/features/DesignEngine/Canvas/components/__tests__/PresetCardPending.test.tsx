import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { PEEK_DELAY_MS } from '../peek';
import { PresetCardPending } from '../PresetCardPending';
import type { SarakThemeCatalogEntry } from '../../../../../core/Design/presets/themes';

const entry: SarakThemeCatalogEntry = {
    id: 'meu-tema',
    name: 'Meu Tema',
    description: 'Uma descrição curta.',
    mode: 'dark',
    hasContraparte: true,
    swatch: { primaryColor: '#111111', colorBgBody: '#222222', textColorMaster: '#333333' },
    swatchOpposite: { primaryColor: '#aaaaaa', colorBgBody: '#bbbbbb', textColorMaster: '#cccccc' },
};

describe('PresetCardPending — o cartão do tema que ainda não chegou', () => {
    it('mostra nome e descrição vindos só do catálogo leve', () => {
        render(<PresetCardPending entry={entry} currentMode="dark" onChoose={vi.fn()} />);
        expect(screen.getByText('Meu Tema')).toBeInTheDocument();
        expect(screen.getByText('Uma descrição curta.')).toBeInTheDocument();
    });

    it('desenha a amostra do modo PEDIDO: a nativa quando o modo bate, a oposta quando não', () => {
        const { container, rerender } = render(<PresetCardPending entry={entry} currentMode="dark" onChoose={vi.fn()} />);
        const backdrop = () => container.querySelector('div') as HTMLElement;
        expect(backdrop().style.backgroundColor).toBe('rgb(34, 34, 34)');

        rerender(<PresetCardPending entry={entry} currentMode="light" onChoose={vi.fn()} />);
        expect(backdrop().style.backgroundColor).toBe('rgb(187, 187, 187)');
    });

    it('leva o id do tema em data-theme-id, como o cartão já carregado', () => {
        render(<PresetCardPending entry={entry} currentMode="dark" onChoose={vi.fn()} />);
        expect(screen.getByRole('button')).toHaveAttribute('data-theme-id', 'meu-tema');
    });

    it('escolher chama onChoose e se anuncia ocupado', () => {
        const onChoose = vi.fn();
        render(<PresetCardPending entry={entry} currentMode="dark" onChoose={onChoose} />);
        const button = screen.getByRole('button');

        expect(button).toHaveAttribute('aria-busy', 'true');
        fireEvent.click(button);
        expect(onChoose).toHaveBeenCalledTimes(1);
    });

    describe('espiada', () => {
        beforeEach(() => { vi.useFakeTimers(); window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as typeof window.matchMedia; });
        afterEach(() => { vi.useRealTimers(); });

        it('espiar carrega o tema e compõe o que chegou, sem escolher', async () => {
            const onPeek = vi.fn();
            const onChoose = vi.fn();
            const peekTokens = vi.fn(() => Promise.resolve({ primaryColor: '#123456' }));
            render(<PresetCardPending entry={entry} currentMode="dark" onChoose={onChoose} peekTokens={peekTokens} onPeek={onPeek} />);
            fireEvent.mouseEnter(screen.getByRole('button'));
            await act(async () => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
            expect(peekTokens).toHaveBeenCalledTimes(1);
            expect(onPeek).toHaveBeenCalledWith({ primaryColor: '#123456' });
            expect(onChoose).not.toHaveBeenCalled();
        });

        it('sair antes de o tema chegar não aplica nada', async () => {
            const onPeek = vi.fn();
            let arrive: (tokens: Record<string, unknown>) => void = () => {};
            const peekTokens = () => new Promise<Record<string, unknown>>((resolve) => { arrive = resolve; });
            render(<PresetCardPending entry={entry} currentMode="dark" onChoose={vi.fn()} peekTokens={peekTokens} onPeek={onPeek} />);
            const button = screen.getByRole('button');
            fireEvent.mouseEnter(button);
            await act(async () => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
            fireEvent.mouseLeave(button);
            await act(async () => { arrive({ primaryColor: '#123456' }); });
            expect(onPeek).not.toHaveBeenCalled();
        });
    });
});
