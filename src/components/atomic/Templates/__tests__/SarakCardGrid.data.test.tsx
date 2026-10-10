import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SarakCardGrid } from '../SarakCardGrid';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import * as cardGridData from '../hooks/useCardGridState';

const MAPPING = { title: 'name' };

afterEach(() => vi.restoreAllMocks());

describe('SarakCardGrid host-provided data', () => {
    it('renders provided data without invoking load', () => {
        const load = vi.fn(async () => [{ name: 'Loaded' }]);
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCardGrid data={[{ name: 'Ana' }]} load={load} mapping={MAPPING} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Ana')).toBeInTheDocument();
        expect(load).not.toHaveBeenCalled();
    });

});

describe('SarakCardGrid host loader', () => {
    it('renders records returned by the host loader', async () => {
        const load = vi.fn(async () => [{ name: 'Bia' }]);
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCardGrid load={load} mapping={MAPPING} />
            </SarakUIProvider>,
        );

        expect(await screen.findByText('Bia')).toBeInTheDocument();
        expect(load).toHaveBeenCalledOnce();
    });

    it('shows host load failures', async () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCardGrid load={async () => { throw new Error('Unavailable'); }} mapping={MAPPING} />
            </SarakUIProvider>,
        );

        expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    });

});

describe('SarakCardGrid stale data', () => {
    it('keeps previously loaded cards visible with a stale notice and retry action', () => {
        const loadData = vi.fn();
        vi.spyOn(cardGridData, 'useCardGridState').mockReturnValue({
            data: [{ name: 'Cached' }], loading: false, error: 'Unavailable', updatedAt: new Date('2026-10-10T22:12:00.000Z'),
            search: '', activeFilters: {}, setSearch: vi.fn(), setActiveFilters: vi.fn(), loadData,
        } as ReturnType<typeof cardGridData.useCardGridState>);
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCardGrid mapping={MAPPING} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Cached')).toBeInTheDocument();
        expect(screen.getByText('Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Desatualizado')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(loadData).toHaveBeenCalledOnce();
    });
});
