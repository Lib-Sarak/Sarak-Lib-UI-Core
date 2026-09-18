import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SarakCardGrid } from '../SarakCardGrid';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import api from '../../../../shared/services/api';

vi.mock('../../../../shared/services/api', () => ({
    default: { get: vi.fn() }
}));

const MAPPING = { title: 'nome' };

// Aceita dado pronto, no mesmo contrato de `SarakStats`/`SarakTable`, e
// `endpoint` passa a opcional.
describe('SarakCardGrid — aceita dado pronto', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('com `data`, renderiza o dado direto e NÃO chama a rede', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCardGrid data={[{ nome: 'Ana' }]} mapping={MAPPING} />
            </SarakUIProvider>
        );

        expect(screen.getByText('Ana')).toBeInTheDocument();
        expect(api.get).not.toHaveBeenCalled();
    });

    it('sem `data`, continua buscando por `endpoint` — comportamento de hoje', async () => {
        (api.get as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({ data: { items: [{ nome: 'Bia' }] } });

        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCardGrid endpoint="/mock" mapping={MAPPING} />
            </SarakUIProvider>
        );

        expect(await screen.findByText('Bia')).toBeInTheDocument();
        expect(api.get).toHaveBeenCalledWith('/mock');
    });
});
