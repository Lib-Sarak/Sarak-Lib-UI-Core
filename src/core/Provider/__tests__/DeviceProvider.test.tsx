import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { SarakDeviceProvider, useSarakDevice, sarakDeviceForWidth, SARAK_DEFAULT_DEVICE_BREAKPOINTS } from '../DeviceProvider';

const setWidth = (w: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: w });
};
const fireResize = (w: number) => { setWidth(w); act(() => { window.dispatchEvent(new Event('resize')); }); };
afterEach(() => setWidth(1024));

const Probe: React.FC = () => <span data-testid="device">{useSarakDevice()}</span>;

describe('deviceForWidth (Spec 40.3 — detecção pura)', () => {
    it('mapeia a largura para o dispositivo (mobile-first, limiares 768/1024)', () => {
        expect(sarakDeviceForWidth(375)).toBe('smartphone');
        expect(sarakDeviceForWidth(767)).toBe('smartphone');
        expect(sarakDeviceForWidth(768)).toBe('tablet');
        expect(sarakDeviceForWidth(1023)).toBe('tablet');
        expect(sarakDeviceForWidth(1024)).toBe('desktop');
        expect(sarakDeviceForWidth(1920)).toBe('desktop');
    });
});

describe('useSarakDevice — detecção REAL do viewport (o que o L1 reprovado precisava)', () => {
    it('o estado INICIAL já vem da largura da janela — SEM flash de desktop', () => {
        setWidth(375);
        render(<Probe />); // sem DeviceProvider: detecção real governa
        // Já no primeiro render (antes de qualquer resize) o device é smartphone.
        expect(screen.getByTestId('device')).toHaveTextContent('smartphone');
    });

    it('reage ao resize (desktop → smartphone → desktop)', () => {
        setWidth(1280);
        render(<Probe />);
        expect(screen.getByTestId('device')).toHaveTextContent('desktop');
        fireResize(375);
        expect(screen.getByTestId('device')).toHaveTextContent('smartphone');
        fireResize(1280);
        expect(screen.getByTestId('device')).toHaveTextContent('desktop');
    });

    it('overrideDevice (Gêmeo Digital/testes) sequestra o valor e ignora o viewport', () => {
        setWidth(1280); // viewport diz desktop...
        render(<SarakDeviceProvider overrideDevice="smartphone"><Probe /></SarakDeviceProvider>);
        expect(screen.getByTestId('device')).toHaveTextContent('smartphone'); // ...mas o override vence
        fireResize(1280);
        expect(screen.getByTestId('device')).toHaveTextContent('smartphone');
    });

    it('sem override, o DeviceProvider é passthrough transparente (detecção real)', () => {
        setWidth(500);
        render(<SarakDeviceProvider><Probe /></SarakDeviceProvider>);
        expect(screen.getByTestId('device')).toHaveTextContent('smartphone');
    });
});

/**
 * plan-08 F5 (achado 11, metade de código) — o token de breakpoint movia só a
 * media-query gerada por `useDesignVariables`; o detector JS usava a constante 768/1024
 * chumbada, então quem trocasse o token via tema desalinhava CSS × JS.
 */
describe('deviceForWidth / useSarakDevice — limiares vindos do tema (F5)', () => {
    const largo = { tablet: 900, desktop: 1400 };

    it('o default continua sendo o canônico 768/1024', () => {
        expect(SARAK_DEFAULT_DEVICE_BREAKPOINTS).toEqual({ tablet: 768, desktop: 1024 });
        expect(sarakDeviceForWidth(800)).toBe('tablet'); // sem limiares explícitos, nada muda
    });

    it('deviceForWidth respeita os limiares recebidos', () => {
        expect(sarakDeviceForWidth(800, largo)).toBe('smartphone'); // 800 < 900
        expect(sarakDeviceForWidth(900, largo)).toBe('tablet');
        expect(sarakDeviceForWidth(1399, largo)).toBe('tablet'); // 1024 já não é desktop
        expect(sarakDeviceForWidth(1400, largo)).toBe('desktop');
    });

    it('o hook usa os limiares descidos pelo Provider — a MESMA largura muda de dispositivo', () => {
        setWidth(800);

        const { unmount } = render(<SarakDeviceProvider><Probe /></SarakDeviceProvider>);
        expect(screen.getByTestId('device')).toHaveTextContent('tablet'); // canônico: 800 ≥ 768
        unmount();

        render(<SarakDeviceProvider breakpoints={largo}><Probe /></SarakDeviceProvider>);
        expect(screen.getByTestId('device')).toHaveTextContent('smartphone'); // tema: 800 < 900
    });

    it('limiares do tema também governam o resize, não só o estado inicial', () => {
        setWidth(1280);
        render(<SarakDeviceProvider breakpoints={largo}><Probe /></SarakDeviceProvider>);
        expect(screen.getByTestId('device')).toHaveTextContent('tablet'); // 1280 < 1400
        fireResize(1500);
        expect(screen.getByTestId('device')).toHaveTextContent('desktop');
    });
});
