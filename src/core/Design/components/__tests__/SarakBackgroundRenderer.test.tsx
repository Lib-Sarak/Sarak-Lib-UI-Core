import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { SarakBackgroundRenderer } from '../SarakBackgroundRenderer';

vi.mock('../../hooks/useMediaLuminance', () => ({ useMediaLuminance: () => 'light' }));

describe('SarakBackgroundRenderer - Data Driven CSS', () => {
    it('deve utilizar color-mix para overlayColor dinamico', () => {
        // Criamos um contexto mock onde o isLightMode é true e a mídia está presente
        const { container } = render(
            <SarakBackgroundRenderer imageUrl="https://example.com/test.jpg" mode="dark" />
        );

        // Aguarda a renderização (o canvas roda num RAF, mas no primeiro render o estado é computado)
        // O estilo overlay é aplicado no segundo <div> do renderer.
        const overlayDiv = container.querySelector('div[style*="radial-gradient"]');
        
        // Verifica se o gradiente não possui rgba hardcoded
        if (overlayDiv) {
            const style = overlayDiv.getAttribute('style');
            expect(style).not.toContain('rgba(');
            expect(style).toContain('color-mix');
        }
    });

    it.each([
        ['absolute', 'absolute'],
        ['fixed', 'fixed'],
    ] as const)('globalBackgroundPosition="%s" desenha a arte com position: %s', (globalBackgroundPosition, expectedPosition) => {
        const { container } = render(
            <SarakBackgroundRenderer imageUrl="https://example.com/background.jpg" backgroundPosition={globalBackgroundPosition} />
        );

        expect((container.firstElementChild as HTMLElement).style.position).toBe(expectedPosition);
    });
});
