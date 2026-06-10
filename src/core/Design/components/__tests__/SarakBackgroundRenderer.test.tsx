import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { SarakBackgroundRenderer } from '../SarakBackgroundRenderer';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';

// Mock do Canvas API para os testes não falharem em ambiente Node
beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4).fill(255) // Mock de pixel branco (luminância 'light')
        })),
        fillRect: vi.fn()
    })) as any;
});

describe('SarakBackgroundRenderer - Data Driven CSS', () => {
    it('deve utilizar color-mix para overlayColor dinamico', () => {
        // Criamos um contexto mock onde o isLightMode é true e a mídia está presente
        const mockContextValue = {
            design: {
                globalBackgroundImageUrl: 'https://example.com/test.jpg'
            },
            isLightMode: true
        };

        const { container } = render(
            <UIContext.Provider value={mockContextValue as any}>
                <SarakBackgroundRenderer />
            </UIContext.Provider>
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
});
