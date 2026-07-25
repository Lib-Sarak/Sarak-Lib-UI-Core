import React, { act } from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { SarakAppChrome } from '../SarakAppChrome';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';

const NAV = [
    { label: 'Propostas', route: '/propostas' },
    { label: 'Projetos', route: '/projetos' },
];

/** Simula o CAMINHO REAL: seta a largura da janela e dispara `resize` (como o browser). */
const setViewport = (width: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
    act(() => { window.dispatchEvent(new Event('resize')); });
};

afterEach(() => setViewport(1024));

// Este bloco exercita a DETECÇÃO REAL (DeviceProvider + window.innerWidth), NÃO
// `overrideDevice`. É o teste que TERIA pego o bug do L1 reprovado no browser.
describe('SarakAppChrome (Spec 40.3 — L1) detecção REAL por viewport (sem overrideDevice)', () => {
    it('a <768px o cromo colapsa em hambúrguer (SarakAppChromeMobile)', () => {
        setViewport(375);
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakAppChrome nav={NAV}><div>x</div></SarakAppChrome>
            </SarakUIProvider>,
        );
        setViewport(375); // garante a largura mesmo que o Provider tenha montado antes
        expect(container.querySelector('[aria-controls="sarak-chrome-drawer"]')).not.toBeNull();
    });

    it('≥1024px mantém a sidebar (sem hambúrguer)', () => {
        setViewport(1280);
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakAppChrome navigationStyle="sidebar" nav={NAV}><div>x</div></SarakAppChrome>
            </SarakUIProvider>,
        );
        setViewport(1280);
        expect(container.querySelector('aside')).not.toBeNull();
        expect(container.querySelector('[aria-controls="sarak-chrome-drawer"]')).toBeNull();
    });
});
