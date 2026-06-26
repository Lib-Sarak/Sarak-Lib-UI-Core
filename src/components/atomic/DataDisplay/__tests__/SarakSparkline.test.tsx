import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SarakSparkline from '../SarakSparkline';

describe('Spec 12 (Onda 9) — SarakSparkline: micro-gráfico sem eixos', () => {
    it('renderiza uma polyline com um ponto por valor (variante line)', () => {
        const { container } = render(<SarakSparkline data={[1, 5, 2, 8, 3]} />);
        const polyline = container.querySelector('polyline');
        expect(polyline).not.toBeNull();
        const points = polyline!.getAttribute('points')!.trim().split(/\s+/);
        expect(points).toHaveLength(5);
    });

    it('herda a cor da série de um token global (zero hardcode)', () => {
        const { container } = render(<SarakSparkline data={[1, 2, 3]} />);
        const stroke = container.querySelector('polyline')!.getAttribute('stroke')!;
        expect(stroke).toContain('--sarak-chart-primary');
        expect(stroke).toContain('--sx-color-primary-base');
    });

    it('renderiza uma barra por valor na variante bar', () => {
        const { container } = render(<SarakSparkline data={[3, 1, 4, 1]} variant="bar" />);
        expect(container.querySelectorAll('rect')).toHaveLength(4);
    });

    it('degrada para um SVG vazio quando não há dados', () => {
        const { container } = render(<SarakSparkline data={[]} />);
        const svg = container.querySelector('[data-sarak-sparkline="empty"]');
        expect(svg).not.toBeNull();
        expect(container.querySelector('polyline')).toBeNull();
    });

    it('expõe o rótulo acessível como <title> do SVG', () => {
        const { container } = render(<SarakSparkline data={[1, 2]} label="Vendas 7d" />);
        expect(container.querySelector('title')!.textContent).toBe('Vendas 7d');
    });
});
