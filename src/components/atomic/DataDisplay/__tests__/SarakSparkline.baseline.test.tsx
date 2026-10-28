import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import SarakSparkline from '../SarakSparkline';

const HEIGHT = 40;
const STROKE_PAD = 2;
const pointsY = (container: HTMLElement): number[] =>
    container.querySelector('polyline')!.getAttribute('points')!.trim().split(/\s+/).map((pair) => Number(pair.split(',')[1]));

describe('SarakSparkline — baseline', () => {
    it("'zero' desenha a linha de base e a coloca abaixo de uma série toda positiva", () => {
        const { container } = render(<SarakSparkline data={[10, 12, 14]} baseline="zero" height={HEIGHT} />);
        const line = container.querySelector('[data-sarak-sparkline-baseline="true"]')!;

        expect(Number(line.getAttribute('y1'))).toBeGreaterThan(Math.max(...pointsY(container)));
    });

    it("'auto' (padrão) não desenha linha de base e o mínimo encosta no piso, como na rc.3", () => {
        const { container } = render(<SarakSparkline data={[10, 12, 14]} height={HEIGHT} />);

        expect(container.querySelector('[data-sarak-sparkline-baseline]')).toBeNull();
        expect(Math.max(...pointsY(container))).toBeCloseTo(HEIGHT - STROKE_PAD);
    });

    it("'zero' com valores negativos põe o zero entre os pontos", () => {
        const { container } = render(<SarakSparkline data={[-5, 5]} baseline="zero" height={HEIGHT} />);
        const zero = Number(container.querySelector('[data-sarak-sparkline-baseline="true"]')!.getAttribute('y1'));
        const [low, high] = pointsY(container);

        expect(high).toBeLessThan(zero);
        expect(zero).toBeLessThan(low);
    });

    it("'zero' na barra parte da linha de base", () => {
        const { container } = render(<SarakSparkline data={[-5, 5]} baseline="zero" variant="bar" height={HEIGHT} />);
        const zero = Number(container.querySelector('[data-sarak-sparkline-baseline="true"]')!.getAttribute('y1'));
        const [negative, positive] = Array.from(container.querySelectorAll('rect'));

        expect(Number(negative.getAttribute('y'))).toBeCloseTo(zero);
        expect(Number(positive.getAttribute('y')) + Number(positive.getAttribute('height'))).toBeCloseTo(zero);
    });
});
