import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakTable } from '../SarakTable';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const MAPPING = { name: 'Name' };

describe('SarakTable host data contract', () => {
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

    it('shows host load failures', async () => {
        render(
            <SarakUIProvider>
                <SarakTable load={async () => { throw new Error('Unavailable'); }} mapping={MAPPING} />
            </SarakUIProvider>,
        );

        expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    });

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
