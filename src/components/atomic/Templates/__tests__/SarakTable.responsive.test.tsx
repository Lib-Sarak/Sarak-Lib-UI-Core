import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Isola o denso da rede: fixa o estado de dados para provar só o colapso por dispositivo (L3).
vi.mock('../hooks/useSarakTableData', () => ({
    useSarakTableData: () => ({
        data: [{ id: 1, nome: 'Beto', ativo: true }, { id: 2, nome: 'Ana', ativo: false }],
        filteredData: [{ id: 1, nome: 'Beto', ativo: true }, { id: 2, nome: 'Ana', ativo: false }],
        loading: false,
        error: null,
        search: '',
        setSearch: () => undefined,
        fetchData: () => undefined,
    }),
}));

import { SarakTable } from '../SarakTable';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakDeviceProvider, type SarakDeviceType } from '../../../../core/Provider/DeviceProvider';

const MAPPING = { nome: 'Nome', ativo: 'Situação' };
const renderAt = (device: SarakDeviceType, responsive?: boolean, selectable = false) =>
    render(
        <SarakUIProvider>
            <SarakDeviceProvider overrideDevice={device}>
                <SarakTable mapping={MAPPING} responsive={responsive} selectable={selectable} />
            </SarakDeviceProvider>
        </SarakUIProvider>,
    );

describe('SarakTable — colapso mobile por padrão (Spec 40.3 — L3)', () => {
    it('CELULAR: colapsa a tabela para cards (sem <table>, sem overflow horizontal)', () => {
        const { container } = renderAt('smartphone');
        expect(container.querySelector('[data-sarak-tablecards]')).not.toBeNull();
        expect(container.querySelector('table')).toBeNull();
        expect(screen.getByText('Ana')).toBeInTheDocument();
        // Rótulos das colunas reusados como rótulo do card.
        expect(screen.getAllByText('Nome')).toHaveLength(3);
    });

    it('DESKTOP: mantém a tabela colunar (comportamento atual)', () => {
        const { container } = renderAt('desktop');
        expect(container.querySelector('table')).not.toBeNull();
        expect(container.querySelector('[data-sarak-tablecards]')).toBeNull();
    });

    it('no modo cartão mantém seleção e ordenação em todos os registros visíveis', () => {
        renderAt('smartphone', undefined, true);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 1' }));
        expect((screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' }) as HTMLInputElement).indeterminate).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por nome' }));

        expect(screen.getAllByRole('listitem').map((card) => card.textContent)).toEqual([
            expect.stringContaining('Ana'),
            expect.stringContaining('Beto'),
        ]);
        expect(screen.getByRole('checkbox', { name: 'Selecionar linha 1' })).toBeChecked();
        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' }));
        expect(screen.getByRole('checkbox', { name: 'Selecionar linha 2' })).toBeChecked();
    });
});

/**
 * plan-08 F6 (achado 12) — o colapso era incondicional aqui, enquanto o irmão
 * `SarakDataTable` já tinha `responsive`. Mesma prop, mesmo default, mesmo efeito.
 */
describe('SarakTable — opt-out do colapso (F6)', () => {
    it('responsive={false} mantém a tabela colunar mesmo no smartphone', () => {
        const { container } = renderAt('smartphone', false);
        expect(container.querySelector('table')).not.toBeNull();
        expect(container.querySelector('[data-sarak-tablecards]')).toBeNull();
    });

    it('responsive={true} é explicitamente igual ao default (colapsa)', () => {
        const { container } = renderAt('smartphone', true);
        expect(container.querySelector('[data-sarak-tablecards]')).not.toBeNull();
        expect(container.querySelector('table')).toBeNull();
    });

    it('responsive={false} não muda nada no desktop', () => {
        const { container } = renderAt('desktop', false);
        expect(container.querySelector('table')).not.toBeNull();
    });
});
