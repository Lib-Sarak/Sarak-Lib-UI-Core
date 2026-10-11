import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SarakTooltip } from '../SarakTooltip';

const TOUCH = { pointerType: 'touch' } as const;
const DELAY_MS = 300;

const renderTooltip = (props: Partial<React.ComponentProps<typeof SarakTooltip>> = {}) =>
    render(
        <div>
            <SarakTooltip content="Dica" delay={DELAY_MS} {...props}>
                <span>alvo</span>
            </SarakTooltip>
            <p>fora</p>
        </div>,
    );

const trigger = (): Element => screen.getByText('alvo').parentElement as Element;

describe('SarakTooltip — toque', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('abre no toque, na hora, sem esperar o atraso do mouse', () => {
        renderTooltip();
        fireEvent.pointerDown(trigger(), TOUCH);
        expect(screen.getByRole('tooltip')).toHaveTextContent('Dica');
    });

    it('fecha ao tocar de novo no gatilho, e o mouseenter emulado não o reabre', () => {
        renderTooltip();
        fireEvent.pointerDown(trigger(), TOUCH);
        fireEvent.pointerDown(trigger(), TOUCH);
        // O navegador emite mouseenter depois do toque; ele não pode reabrir o balão.
        fireEvent.mouseEnter(trigger());
        act(() => {
            vi.advanceTimersByTime(DELAY_MS * 2);
        });
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('fecha ao tocar fora do gatilho', () => {
        renderTooltip();
        fireEvent.pointerDown(trigger(), TOUCH);
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        fireEvent.pointerDown(screen.getByText('fora'), TOUCH);
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('não abre por toque quando disabled', () => {
        renderTooltip({ disabled: true });
        fireEvent.pointerDown(trigger(), TOUCH);
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('o mouse continua como antes: abre depois do atraso e fecha ao sair', () => {
        renderTooltip();
        fireEvent.pointerDown(trigger(), { pointerType: 'mouse' });
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        fireEvent.mouseEnter(trigger());
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        act(() => {
            vi.advanceTimersByTime(DELAY_MS);
        });
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        fireEvent.mouseLeave(trigger());
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('o foco continua abrindo e o blur fechando', () => {
        renderTooltip();
        fireEvent.focus(trigger());
        act(() => {
            vi.advanceTimersByTime(DELAY_MS);
        });
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        fireEvent.blur(trigger());
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
});
