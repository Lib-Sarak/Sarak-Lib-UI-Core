import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SarakTable } from '../SarakTable';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import api from '../../../../shared/services/api';

vi.mock('../../../../shared/services/api', () => ({
    default: { get: vi.fn() }
}));

const MAPPING = { nome: 'Nome' };

// Prova ponta a ponta — com `data`, o consumidor que já tem o dado (cache,
// SSR, outra chamada) não precisa fingir um `endpoint`, e nenhuma chamada de rede
// ocorre; sem `data`, o comportamento por `endpoint` é o de hoje.
describe('SarakTable — aceita dado pronto', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('com `data`, renderiza o dado direto e NÃO chama a rede', () => {
        render(
            <SarakUIProvider>
                <SarakTable data={[{ id: 1, nome: 'Ana' }]} mapping={MAPPING} />
            </SarakUIProvider>
        );

        expect(screen.getByText('Ana')).toBeInTheDocument();
        expect(api.get).not.toHaveBeenCalled();
    });

    it('sem `data`, continua buscando por `endpoint` — comportamento de hoje', async () => {
        (api.get as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({ data: [{ id: 1, nome: 'Bia' }] });

        render(
            <SarakUIProvider>
                <SarakTable endpoint="/mock" mapping={MAPPING} />
            </SarakUIProvider>
        );

        expect(await screen.findByText('Bia')).toBeInTheDocument();
        expect(api.get).toHaveBeenCalledWith('/mock');
    });
});
