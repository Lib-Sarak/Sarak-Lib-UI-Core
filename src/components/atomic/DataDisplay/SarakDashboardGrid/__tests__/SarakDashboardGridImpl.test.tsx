import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SarakDashboardGridImpl from '../SarakDashboardGridImpl';
import type { SarakDashboardLayoutItem } from '../dashboardLayout';

const widgets = [
    { id: 'a', title: 'Vendas', content: <p>conteúdo a</p> },
    { id: 'b', title: 'Estoque', content: <p>conteúdo b</p> },
];
const layout: SarakDashboardLayoutItem[] = [
    { id: 'a', x: 0, y: 0, w: 4, h: 2 },
    { id: 'b', x: 4, y: 0, w: 4, h: 2 },
];

/** O jsdom não tem layout: a largura do contêiner é a que o teste declara. */
const withWidth = (width: number) => vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) });

afterEach(() => vi.restoreAllMocks());

describe('SarakDashboardGridImpl', () => {
    it('em contêiner largo desenha os widgets e a dica de teclado', async () => {
        withWidth(1000);
        render(<SarakDashboardGridImpl widgets={widgets} layout={layout} label="Painel" />);
        await waitFor(() => expect(screen.getByLabelText('Vendas')).toBeTruthy());
        expect(screen.getByLabelText('Estoque')).toBeTruthy();
        expect(screen.getByRole('group', { name: 'Painel' }).getAttribute('data-narrow')).toBeNull();
        expect(screen.getByText(/Setas movem o widget/)).toBeTruthy();
    });

    it('seta move o widget focado e Shift + seta o redimensiona, pelo onLayoutChange', async () => {
        withWidth(1000);
        const onLayoutChange = vi.fn();
        render(<SarakDashboardGridImpl widgets={widgets} layout={layout} onLayoutChange={onLayoutChange} />);
        const widget = await screen.findByLabelText('Vendas');
        fireEvent.keyDown(widget, { key: 'ArrowRight' });
        expect(onLayoutChange.mock.calls.at(-1)?.[0].find((item: SarakDashboardLayoutItem) => item.id === 'a').x).toBe(1);
        fireEvent.keyDown(widget, { key: 'ArrowDown', shiftKey: true });
        expect(onLayoutChange.mock.calls.at(-1)?.[0].find((item: SarakDashboardLayoutItem) => item.id === 'a').h).toBe(3);
    });

    it('modo só leitura não move pelo teclado e não oferece a dica', async () => {
        withWidth(1000);
        const onLayoutChange = vi.fn();
        render(<SarakDashboardGridImpl widgets={widgets} layout={layout} onLayoutChange={onLayoutChange} readOnly />);
        const widget = await screen.findByLabelText('Vendas');
        fireEvent.keyDown(widget, { key: 'ArrowRight' });
        expect(onLayoutChange).not.toHaveBeenCalled();
        expect(screen.queryByText(/Setas movem o widget/)).toBeNull();
    });

    it('em contêiner estreito empilha na ordem de leitura, sem teclado de movimento', async () => {
        withWidth(320);
        const onLayoutChange = vi.fn();
        const reversed = [{ id: 'a', x: 0, y: 2, w: 4, h: 2 }, { id: 'b', x: 0, y: 0, w: 4, h: 2 }];
        render(<SarakDashboardGridImpl widgets={widgets} layout={reversed} onLayoutChange={onLayoutChange} label="Painel" />);
        const group = await screen.findByRole('group', { name: 'Painel' });
        await waitFor(() => expect(group.getAttribute('data-narrow')).toBe('true'));
        const titles = [...group.querySelectorAll('header')].map((header) => header.textContent);
        expect(titles).toEqual(['Estoque', 'Vendas']);
        fireEvent.keyDown(screen.getByLabelText('Vendas'), { key: 'ArrowRight' });
        expect(onLayoutChange).not.toHaveBeenCalled();
    });
});
