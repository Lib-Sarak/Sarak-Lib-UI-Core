import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { OVERLAY_LAYER_STEP, resetOverlayLayersForTests, useOverlayLayer, type OverlayLayer } from '../useOverlayLayer';

const Probe = ({ isOpen, onLayer }: { isOpen: boolean; onLayer: (layer: OverlayLayer) => void }): null => {
    onLayer(useOverlayLayer(isOpen));
    return null;
};

describe('useOverlayLayer', () => {
    afterEach(() => resetOverlayLayersForTests());

    it('quem abre uma camada só fica na profundidade 0 e no topo', () => {
        let layer!: OverlayLayer;
        render(<Probe isOpen onLayer={(value) => { layer = value; }} />);
        expect(layer).toEqual({ depth: 0, isTop: true });
    });

    it('a camada aberta depois fica acima da última, qualquer que seja o tipo', () => {
        let first!: OverlayLayer;
        let second!: OverlayLayer;
        const view = render(<><Probe isOpen onLayer={(value) => { first = value; }} /><Probe isOpen={false} onLayer={(value) => { second = value; }} /></>);
        view.rerender(<><Probe isOpen onLayer={(value) => { first = value; }} /><Probe isOpen onLayer={(value) => { second = value; }} /></>);
        expect(first).toEqual({ depth: 0, isTop: false });
        expect(second).toEqual({ depth: 1, isTop: true });
        expect(OVERLAY_LAYER_STEP).toBeGreaterThan(1);
    });

    it('ao fechar a de cima, a de baixo volta a ser o topo', () => {
        let first!: OverlayLayer;
        let second!: OverlayLayer;
        const view = render(<><Probe isOpen onLayer={(value) => { first = value; }} /><Probe isOpen onLayer={(value) => { second = value; }} /></>);
        view.rerender(<><Probe isOpen onLayer={(value) => { first = value; }} /><Probe isOpen={false} onLayer={(value) => { second = value; }} /></>);
        expect(first).toEqual({ depth: 0, isTop: true });
        expect(second.depth, 'na saída animada a camada fechada segura o degrau em que estava').toBe(1);
    });

    it('a rolagem do body só destrava quando a última camada fecha', () => {
        const noop = (): void => undefined;
        const view = render(<><Probe isOpen onLayer={noop} /><Probe isOpen onLayer={noop} /></>);
        expect(document.body.style.overflow).toBe('hidden');
        view.rerender(<><Probe isOpen onLayer={noop} /><Probe isOpen={false} onLayer={noop} /></>);
        expect(document.body.style.overflow).toBe('hidden');
        view.rerender(<><Probe isOpen={false} onLayer={noop} /><Probe isOpen={false} onLayer={noop} /></>);
        expect(document.body.style.overflow).toBe('');
    });
});
