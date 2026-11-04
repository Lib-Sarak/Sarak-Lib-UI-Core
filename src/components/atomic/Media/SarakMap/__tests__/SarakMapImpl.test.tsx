import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SarakMapImpl from '../SarakMapImpl';

const BASE = {
    attribution: '© Provedor de teste',
    center: { lat: -23.55, lng: -46.63 },
    zoom: 10,
};
const TEMPLATE = 'https://tiles.example/{z}/{x}/{y}.png';

describe('SarakMapImpl', () => {
    it('sem tileUrl não desenha nenhuma imagem (nenhuma requisição) e mostra o aviso', () => {
        const { container } = render(<SarakMapImpl {...BASE} />);
        expect(container.querySelectorAll('img')).toHaveLength(0);
        expect(screen.getByRole('status').textContent).toContain('tileUrl');
    });

    it('tileUrl com esquema perigoso ou sem os campos cai no mesmo aviso, sem imagem', () => {
        const { container, rerender } = render(<SarakMapImpl {...BASE} tileUrl="javascript:alert(1)//{z}{x}{y}" />);
        expect(container.querySelectorAll('img')).toHaveLength(0);
        rerender(<SarakMapImpl {...BASE} tileUrl="https://tiles.example/{z}/{x}.png" />);
        expect(container.querySelectorAll('img')).toHaveLength(0);
    });

    it('com tileUrl desenha os blocos pedidos ao molde e mostra a atribuição', () => {
        const { container } = render(<SarakMapImpl {...BASE} tileUrl={TEMPLATE} />);
        const sources = [...container.querySelectorAll('img')].map((image) => image.getAttribute('src'));
        expect(sources.length).toBeGreaterThan(0);
        sources.forEach((source) => expect(source).toMatch(/^https:\/\/tiles\.example\/10\/\d+\/\d+\.png$/));
        expect(container.querySelector('[data-sarak-map-attribution]')?.textContent).toBe('© Provedor de teste');
    });

    it('os botões aproximam e afastam, e avisam a vista nova', () => {
        const onViewChange = vi.fn();
        render(<SarakMapImpl {...BASE} tileUrl={TEMPLATE} onViewChange={onViewChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Aproximar' }));
        expect(onViewChange.mock.calls.at(-1)?.[1]).toBe(11);
        fireEvent.click(screen.getByRole('button', { name: 'Afastar' }));
        expect(onViewChange.mock.calls.at(-1)?.[1]).toBe(10);
    });

    it('setas andam o mapa e +/- mudam o zoom, pelo teclado', () => {
        const onViewChange = vi.fn();
        render(<SarakMapImpl {...BASE} tileUrl={TEMPLATE} onViewChange={onViewChange} />);
        const map = screen.getByRole('group', { name: 'Mapa' });
        fireEvent.keyDown(map, { key: 'ArrowRight' });
        expect(onViewChange.mock.calls.at(-1)?.[0].lng).toBeGreaterThan(BASE.center.lng);
        fireEvent.keyDown(map, { key: '+' });
        expect(onViewChange.mock.calls.at(-1)?.[1]).toBe(11);
    });

    it('marcador visível é um botão com nome e dispara onMarkerClick', () => {
        const onMarkerClick = vi.fn();
        const marker = { id: 'm1', label: 'Matriz', lat: -23.55, lng: -46.63 };
        render(<SarakMapImpl {...BASE} tileUrl={TEMPLATE} markers={[marker, { id: 'longe', label: 'Longe', lat: 40, lng: 10 }]} onMarkerClick={onMarkerClick} />);
        fireEvent.click(screen.getByRole('button', { name: 'Matriz' }));
        expect(onMarkerClick).toHaveBeenCalledWith(marker);
        expect(screen.queryByRole('button', { name: 'Longe' })).toBeNull();
    });
});
