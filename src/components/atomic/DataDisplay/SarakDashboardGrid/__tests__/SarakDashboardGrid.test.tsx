import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SarakDashboardGrid } from '../SarakDashboardGrid';

afterEach(() => vi.restoreAllMocks());

describe('SarakDashboardGrid (fronteira lazy)', () => {
    it('mostra o carregamento e depois o painel', async () => {
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 1000, height: 0, top: 0, left: 0, right: 1000, bottom: 0, x: 0, y: 0, toJSON: () => ({}) });
        render(<SarakDashboardGrid widgets={[{ id: 'a', title: 'Vendas', content: <p>a</p> }]} layout={[{ id: 'a', x: 0, y: 0, w: 4, h: 2 }]} />);
        expect(screen.getByRole('status').textContent).toContain('Carregando');
        await waitFor(() => expect(screen.getByLabelText('Vendas')).toBeTruthy());
    });
});
