import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SarakErrorBoundary } from '../SarakErrorBoundary';

const Boom: React.FC = () => {
    throw new Error('explosão simulada');
};

describe('Spec 27 — SarakErrorBoundary', () => {
    afterEach(() => vi.restoreAllMocks());

    it('captura o erro da sub-árvore e renderiza o fallback (Regra 1/2)', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined); // silencia o log do React
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        render(
            <SarakErrorBoundary nodeId="card-x" renderFallback={() => <div>Tela de recuperação</div>}>
                <Boom />
            </SarakErrorBoundary>,
        );

        expect(screen.getByText('Tela de recuperação')).toBeInTheDocument();
    });

    it('loga a chave JSON exata (nodeId) que panicou (Regra 4)', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        render(
            <SarakErrorBoundary nodeId="card-x" renderFallback={() => <span>fallback</span>}>
                <Boom />
            </SarakErrorBoundary>,
        );

        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining('card-x'),
            expect.anything(),
        );
    });

    it('sem erro: renderiza os filhos normalmente', () => {
        render(
            <SarakErrorBoundary nodeId="ok" renderFallback={() => <span>fallback</span>}>
                <div>conteúdo normal</div>
            </SarakErrorBoundary>,
        );

        expect(screen.getByText('conteúdo normal')).toBeInTheDocument();
    });
});
