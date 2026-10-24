import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LiveDraftPreviewFrame } from '../LiveDraftPreviewFrame';

const defaultProps = {
    previewDevice: 'desktop' as const,
    targetWidth: '100%',
    deviceAspectRatio: undefined,
    getDeviceFrameStyles: () => 'rounded-2xl',
    isInspecting: false,
    setIsInspecting: vi.fn(),
};

describe('LiveDraftPreviewFrame rendering', () => {
    it('renderiza o conteúdo filho (o gêmeo digital renderizado)', () => {
        render(
            <LiveDraftPreviewFrame {...defaultProps}>
                <div data-testid="child-preview">Conteúdo</div>
            </LiveDraftPreviewFrame>
        );
        expect(screen.getByTestId('child-preview')).toBeInTheDocument();
    });

    it('mostra o notch só no smartphone e a câmera só no tablet', () => {
        const { rerender } = render(
            <LiveDraftPreviewFrame {...defaultProps} previewDevice="smartphone">
                <div />
            </LiveDraftPreviewFrame>
        );
        expect(screen.getByTitle('Modo de Inspeção (Selecionar elemento)')).toBeInTheDocument();

        rerender(
            <LiveDraftPreviewFrame {...defaultProps} previewDevice="desktop">
                <div />
            </LiveDraftPreviewFrame>
        );
        expect(screen.getByTitle('Modo de Inspeção (Selecionar elemento)')).toBeInTheDocument();
    });
});

describe('LiveDraftPreviewFrame inspection actions', () => {
    it('clicar no botão de inspeção chama setIsInspecting invertendo o estado atual', () => {
        const setIsInspecting = vi.fn();
        render(
            <LiveDraftPreviewFrame {...defaultProps} isInspecting={false} setIsInspecting={setIsInspecting}>
                <div />
            </LiveDraftPreviewFrame>
        );

        fireEvent.click(screen.getByTitle('Modo de Inspeção (Selecionar elemento)'));
        expect(setIsInspecting).toHaveBeenCalledWith(true);
    });

    it('quando isInspecting=true, mostra o overlay de instrução', () => {
        render(
            <LiveDraftPreviewFrame {...defaultProps} isInspecting={true}>
                <div />
            </LiveDraftPreviewFrame>
        );
        expect(screen.getByText('Clique em um componente para inspecionar')).toBeInTheDocument();
    });
});

describe('LiveDraftPreviewFrame stacked layout', () => {
    it.each(['desktop', 'tablet', 'smartphone'] as const)(
        'mantém a moldura rolável e a proporção do aparelho ao empilhar em %s',
        (previewDevice) => {
            const deviceAspectRatio = previewDevice === 'tablet'
                ? '768 / 1100'
                : previewDevice === 'smartphone'
                    ? '375 / 900'
                    : undefined;
            const { container } = render(
                <LiveDraftPreviewFrame
                    {...defaultProps}
                    previewDevice={previewDevice}
                    isPreviewStacked
                    deviceAspectRatio={deviceAspectRatio}
                >
                    <div />
                </LiveDraftPreviewFrame>,
            );

            const frame = container.querySelector('[data-testid="live-preview-frame"]') as HTMLElement;
            const deviceViewport = container.querySelector('[data-testid="device-viewport"]') as HTMLElement;
            expect(frame.className).toContain('overflow-y-auto');
            expect(frame.className).not.toMatch(/\bresize\b/);
            expect(frame.className).not.toMatch(/vh\]/);
            expect(frame.style.height).toBe('calc(100% - 1.5rem)');
            expect(frame.style.maxHeight).toBe('');
            if (previewDevice === 'desktop') {
                expect(deviceViewport.style.height).toBe('100%');
            } else {
                expect(deviceViewport.style.aspectRatio).toBe(deviceAspectRatio);
            }
        },
    );
});
