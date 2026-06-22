import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SarakTooltip } from '../SarakTooltip';

describe('Spec 13 — SarakTooltip (Regra 4: portal + edge detection)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('deve renderizar o conteúdo num portal no body (escapa de overflow:hidden)', () => {
        render(
            <div style={{ overflow: 'hidden' }}>
                <SarakTooltip content="Dica" delay={100}>
                    <button>alvo</button>
                </SarakTooltip>
            </div>,
        );
        fireEvent.mouseEnter(screen.getByText('alvo').parentElement as Element);
        act(() => {
            vi.advanceTimersByTime(100);
        });
        const tip = screen.getByRole('tooltip');
        expect(tip).toHaveTextContent('Dica');
        // O tooltip vive no body (portal), fora do container com overflow:hidden.
        expect(document.body.contains(tip)).toBe(true);
        expect(tip.closest('[style*="overflow"]')).toBeNull();
    });

    it('não mostra o tooltip quando disabled', () => {
        render(
            <SarakTooltip content="Dica" delay={100} disabled>
                <button>alvo</button>
            </SarakTooltip>,
        );
        fireEvent.mouseEnter(screen.getByText('alvo').parentElement as Element);
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
});
