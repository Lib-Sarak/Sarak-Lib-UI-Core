import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LiveDraftPreviewFrame } from '../LiveDraftPreviewFrame';

const defaultProps = {
    previewDevice: 'desktop' as const,
    targetWidth: '100%',
    getDeviceHeightClass: () => 'h-full',
    getDeviceFrameStyles: () => 'rounded-2xl',
    isInspecting: false,
    setIsInspecting: vi.fn(),
};

describe('LiveDraftPreviewFrame', () => {
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
