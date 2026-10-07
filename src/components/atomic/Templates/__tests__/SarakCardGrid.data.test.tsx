import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakCardGrid } from '../SarakCardGrid';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const MAPPING = { title: 'name' };

describe('SarakCardGrid host data contract', () => {
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
