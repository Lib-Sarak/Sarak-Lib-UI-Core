import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Isola o denso da rede: fixa o estado de dados para provar só o colapso por dispositivo (L3).
vi.mock('../hooks/useSarakTableData', () => ({
    useSarakTableData: () => ({
        data: [{ id: 1, nome: 'Ana', ativo: true }],
        filteredData: [{ id: 1, nome: 'Ana', ativo: true }],
        loading: false,
        error: null,
        search: '',
        setSearch: () => undefined,
        fetchData: () => undefined,
    }),
}));

import { SarakTable } from '../SarakTable';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { DeviceProvider, type DeviceType } from '../../../../core/Provider/DeviceProvider';

const MAPPING = { nome: 'Nome', ativo: 'Situação' };
const renderAt = (device: DeviceType) =>
    render(
        <SarakUIProvider>
            <DeviceProvider overrideDevice={device}>
                <SarakTable endpoint="/x" mapping={MAPPING} />
            </DeviceProvider>
        </SarakUIProvider>,
    );

describe('SarakTable — colapso mobile por padrão (Spec 40.3 — L3)', () => {
    it('CELULAR: colapsa a tabela para cards (sem <table>, sem overflow horizontal)', () => {
        const { container } = renderAt('smartphone');
        expect(container.querySelector('[data-sarak-tablecards]')).not.toBeNull();
        expect(container.querySelector('table')).toBeNull();
        expect(screen.getByText('Ana')).toBeInTheDocument();
        // Rótulos das colunas reusados como rótulo do card.
        expect(screen.getByText('Nome')).toBeInTheDocument();
    });

    it('DESKTOP: mantém a tabela colunar (comportamento atual)', () => {
        const { container } = renderAt('desktop');
        expect(container.querySelector('table')).not.toBeNull();
        expect(container.querySelector('[data-sarak-tablecards]')).toBeNull();
    });
});
