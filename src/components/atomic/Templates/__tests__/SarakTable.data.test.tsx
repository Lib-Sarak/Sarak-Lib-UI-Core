import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakTable } from '../SarakTable';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const MAPPING = { name: 'Name' };
const SAMPLE_UPDATED_AT_MS = 1791670320000;

describe('SarakTable host data', () => {
    it('renders provided data without invoking load', () => {
        const load = vi.fn(async () => [{ id: 2, name: 'Loaded' }]);
        render(
            <SarakUIProvider>
                <SarakTable data={[{ id: 1, name: 'Ana' }]} load={load} mapping={MAPPING} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Ana')).toBeInTheDocument();
        expect(load).not.toHaveBeenCalled();
    });

    it('renders rows returned by the host loader', async () => {
        const load = vi.fn(async () => [{ id: 1, name: 'Bia' }]);
        render(
            <SarakUIProvider>
                <SarakTable load={load} mapping={MAPPING} />
            </SarakUIProvider>,
        );

        expect(await screen.findByText('Bia')).toBeInTheDocument();
        expect(load).toHaveBeenCalledOnce();
    });

});

describe('SarakTable load failures and refresh', () => {
    it('shows host load failures', async () => {
        render(
            <SarakUIProvider>
                <SarakTable load={async () => { throw new Error('Unavailable'); }} mapping={MAPPING} />
            </SarakUIProvider>,
        );

        expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    });

    it('keeps the last rows, reading time and retry action after a refresh fails', async () => {
        const load = vi.fn<() => Promise<{ id: number; name: string }[]>>()
            .mockResolvedValueOnce([{ id: 1, name: 'Ana' }])
            .mockRejectedValueOnce(new Error('Unavailable'));
        render(
            <SarakUIProvider>
                <SarakTable load={load} mapping={MAPPING} />
            </SarakUIProvider>,
        );

        expect(await screen.findByText('Ana')).toBeInTheDocument();
        expect(await screen.findByText(/Leitura das/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

        expect(await screen.findByText('Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Ana')).toBeInTheDocument();
        expect(screen.getByText('Desatualizado')).toBeInTheDocument();
        expect(load).toHaveBeenCalledTimes(2);
    });

});

describe('SarakTable host timestamp', () => {
    it.each([
        { updatedAt: new Date('2026-10-10T22:12:00.000Z'), expected: '2026-10-10T22:12:00.000Z' },
        { updatedAt: '2026-10-10T22:12:00.000Z', expected: '2026-10-10T22:12:00.000Z' },
        { updatedAt: SAMPLE_UPDATED_AT_MS, expected: '2026-10-10T22:12:00.000Z' },
    ])('renders the host reading time for updatedAt=$expected', ({ updatedAt, expected }) => {
        const { container } = render(
            <SarakUIProvider>
                <SarakTable data={[{ id: 1, name: 'Ana' }]} updatedAt={updatedAt} mapping={MAPPING} />
            </SarakUIProvider>,
        );

        expect(container.querySelector('time')?.getAttribute('datetime')).toBe(expected);
    });

});

describe('SarakTable actions', () => {
    it('lets the host hide search and does not show refresh without a loader', () => {
        render(
            <SarakUIProvider>
                <SarakTable data={[{ id: 1, name: 'Ana' }]} mapping={MAPPING} showSearch={false} showRefresh />
            </SarakUIProvider>,
        );

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
    });

    it('does not invent action buttons for row data', () => {
        render(
            <SarakUIProvider>
                <SarakTable data={[{ id: 1, name: 'Ana', action: 'Open' }]} mapping={{ name: 'Name', action: 'Action' }} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Open')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Open' })).not.toBeInTheDocument();
    });
});
