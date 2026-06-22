import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakOverlayProvider, useOverlay } from '../SarakOverlayProvider';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const OpenModalButton: React.FC = () => {
    const overlay = useOverlay();
    return (
        <button onClick={() => overlay.open({ kind: 'modal', title: 'Olá', message: 'corpo' })}>
            abrir
        </button>
    );
};

describe('Spec 13 ↔ 25 — SarakOverlayProvider', () => {
    it('deve abrir um modal com título e mensagem via controller', () => {
        render(
            <SarakUIProvider>
                <SarakOverlayProvider>
                    <OpenModalButton />
                </SarakOverlayProvider>
            </SarakUIProvider>,
        );
        expect(screen.queryByText('corpo')).not.toBeInTheDocument();
        fireEvent.click(screen.getByText('abrir'));
        expect(screen.getByText('Olá')).toBeInTheDocument();
        expect(screen.getByText('corpo')).toBeInTheDocument();
    });

    it('useOverlay() sem Provider degrada para no-op', () => {
        const Probe: React.FC = () => {
            const overlay = useOverlay();
            expect(typeof overlay.open).toBe('function');
            expect(typeof overlay.close).toBe('function');
            return null;
        };
        render(<Probe />);
    });
});
