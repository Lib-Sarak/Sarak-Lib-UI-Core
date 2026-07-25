import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { DeviceProvider, useSarakDevice, deviceForWidth } from '../DeviceProvider';

const setWidth = (w: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: w });
};
const fireResize = (w: number) => { setWidth(w); act(() => { window.dispatchEvent(new Event('resize')); }); };
afterEach(() => setWidth(1024));

const Probe: React.FC = () => <span data-testid="device">{useSarakDevice()}</span>;

describe('deviceForWidth (Spec 40.3 — detecção pura)', () => {
    it('mapeia a largura para o dispositivo (mobile-first, limiares 768/1024)', () => {
        expect(deviceForWidth(375)).toBe('smartphone');
        expect(deviceForWidth(767)).toBe('smartphone');
        expect(deviceForWidth(768)).toBe('tablet');
        expect(deviceForWidth(1023)).toBe('tablet');
        expect(deviceForWidth(1024)).toBe('desktop');
        expect(deviceForWidth(1920)).toBe('desktop');
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
        render(<DeviceProvider overrideDevice="smartphone"><Probe /></DeviceProvider>);
        expect(screen.getByTestId('device')).toHaveTextContent('smartphone'); // ...mas o override vence
        fireResize(1280);
        expect(screen.getByTestId('device')).toHaveTextContent('smartphone');
    });

    it('sem override, o DeviceProvider é passthrough transparente (detecção real)', () => {
        setWidth(500);
        render(<DeviceProvider><Probe /></DeviceProvider>);
        expect(screen.getByTestId('device')).toHaveTextContent('smartphone');
    });
});
