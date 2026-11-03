import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SarakSignaturePad } from '../SarakSignaturePad';
import { SIGNATURE_EXPORT_INK, paintStrokes, pointFromEvent } from '../signatureCanvas';

const PNG = 'data:image/png;base64,AAAA';

function fakeContext() {
    return {
        clearRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), arc: vi.fn(), fill: vi.fn(), fillText: vi.fn(),
        strokeStyle: '', fillStyle: '', lineWidth: 0, lineCap: '', lineJoin: '', font: '', textAlign: '', textBaseline: '',
    };
}

let context: ReturnType<typeof fakeContext>;

beforeEach(() => {
    context = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(PNG);
    // A API de ponteiro por captura não existe no jsdom.
    HTMLElement.prototype.setPointerCapture = vi.fn();
});
afterEach(() => vi.restoreAllMocks());

const draw = (canvas: HTMLElement, from: [number, number], to: [number, number]): void => {
    fireEvent.pointerDown(canvas, { clientX: from[0], clientY: from[1], pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: to[0], clientY: to[1], pointerId: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
};

describe('SarakSignaturePad', () => {
    it('o PNG sai sempre com tinta escura, mesmo quando o tema pinta a tela com tinta clara', () => {
        const onChange = vi.fn();
        const inkAtExport: string[] = [];
        vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => { inkAtExport.push(context.strokeStyle, context.fillStyle); return PNG; });
        render(<div style={{ color: 'rgb(250, 250, 250)' }}><SarakSignaturePad onChange={onChange} /></div>);
        const canvas = screen.getByRole('img', { name: 'Área de assinatura' });
        draw(canvas, [10, 10], [40, 30]);
        expect(onChange.mock.calls.at(-1)?.[0].png).toBe(PNG);
        expect(inkAtExport.slice(-2)).toEqual([SIGNATURE_EXPORT_INK, SIGNATURE_EXPORT_INK]);
        fireEvent.click(screen.getByRole('button', { name: 'Digitar o nome' }));
        fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Ana' } });
        expect(inkAtExport.at(-1)).toBe(SIGNATURE_EXPORT_INK);
    });

    it('um traço devolve PNG e os traços; vazio devolve null', () => {
        const onChange = vi.fn();
        render(<SarakSignaturePad onChange={onChange} />);
        draw(screen.getByRole('img', { name: 'Área de assinatura' }), [10, 10], [40, 30]);
        const value = onChange.mock.calls.at(-1)?.[0];
        expect(value.png).toBe(PNG);
        expect(value.strokes).toHaveLength(1);
        expect(value.strokes[0].length).toBeGreaterThanOrEqual(2);
        expect(context.lineTo).toHaveBeenCalled();
    });

    it('desfazer tira o último traço e limpar zera, avisando null', () => {
        const onChange = vi.fn();
        render(<SarakSignaturePad onChange={onChange} />);
        const canvas = screen.getByRole('img', { name: 'Área de assinatura' });
        draw(canvas, [1, 1], [5, 5]);
        draw(canvas, [9, 9], [20, 20]);
        expect(onChange.mock.calls.at(-1)?.[0].strokes).toHaveLength(2);
        fireEvent.click(screen.getByRole('button', { name: 'Desfazer traço' }));
        expect(onChange.mock.calls.at(-1)?.[0].strokes).toHaveLength(1);
        fireEvent.click(screen.getByRole('button', { name: 'Limpar' }));
        expect(onChange.mock.calls.at(-1)?.[0]).toBeNull();
    });

    it('desfazer e limpar começam desligados', () => {
        render(<SarakSignaturePad onChange={vi.fn()} />);
        expect((screen.getByRole('button', { name: 'Desfazer traço' }) as HTMLButtonElement).disabled).toBe(true);
        expect((screen.getByRole('button', { name: 'Limpar' }) as HTMLButtonElement).disabled).toBe(true);
    });

    it('alternativa acessível: digitar o nome devolve PNG, o nome e nenhum traço', () => {
        const onChange = vi.fn();
        render(<SarakSignaturePad onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Digitar o nome' }));
        fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria Souza' } });
        expect(onChange.mock.calls.at(-1)?.[0]).toEqual({ png: PNG, strokes: [], typedName: 'Maria Souza' });
        expect(context.fillText).toHaveBeenCalledWith('Maria Souza', expect.any(Number), expect.any(Number), expect.any(Number));
        fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: '   ' } });
        expect(onChange.mock.calls.at(-1)?.[0]).toBeNull();
    });

    it('desabilitado não desenha', () => {
        const onChange = vi.fn();
        render(<SarakSignaturePad onChange={onChange} disabled />);
        draw(screen.getByRole('img', { name: 'Área de assinatura' }), [1, 1], [5, 5]);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('sem contexto de canvas (ambiente sem desenho) não quebra', () => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
        const canvas = document.createElement('canvas');
        expect(() => paintStrokes(canvas, [[{ x: 1, y: 1 }]])).not.toThrow();
    });

    it('a escala entre o tamanho na tela e o do desenho é corrigida', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 10, top: 0, width: 200, height: 0 } as DOMRect);
        expect(pointFromEvent(canvas, 110, 5).x).toBe(200);
    });
});
