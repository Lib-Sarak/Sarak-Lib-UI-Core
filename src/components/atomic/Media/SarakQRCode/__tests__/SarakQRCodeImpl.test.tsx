import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SarakQRCode } from '../index';

const peer = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock('qrcode', () => ({
    get default() { return peer.current; },
}));

const fakePeer = {
    create: (value: string) => ({ modules: { size: 3, data: Uint8Array.from(value === 'vazio' ? [0, 0, 0, 0, 0, 0, 0, 0, 0] : [1, 0, 1, 0, 1, 0, 1, 0, 1]) } }),
};

const renderQr = (props: React.ComponentProps<typeof SarakQRCode>): ReturnType<typeof render> => render(
    <Suspense fallback={null}><SarakQRCode {...props} /></Suspense>,
);

// A primeira transformação do módulo lazy é lenta; aquece fora do tempo de espera dos testes.
const WARM_UP_TIMEOUT_MS = 30000;
// Sob carga (várias suítes em paralelo) o componente lazy e o efeito do aviso demoram mais que o prazo padrão de 1 s.
const WAIT = { timeout: 10000 };
const TEST_TIMEOUT_MS = 20000;
beforeAll(async () => { await import('../SarakQRCodeImpl'); }, WARM_UP_TIMEOUT_MS);

afterEach(() => { peer.current = undefined; vi.restoreAllMocks(); });

describe('SarakQRCode', () => {
    vi.setConfig({ testTimeout: TEST_TIMEOUT_MS });

    it('sem o peer, mostra o aviso da lib no lugar do QR e avisa no console uma vez', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        renderQr({ value: 'https://x.test' });

        const notice = await screen.findByRole('alert', undefined, WAIT);

        expect(notice).toHaveAttribute('data-sarak-optional-peer-missing', 'true');
        expect(notice).toHaveTextContent('qrcode');
        // O aviso sai num efeito, depois de o alerta aparecer: espera por ele em vez de supor que já saiu.
        const qrWarnings = (): unknown[][] => warn.mock.calls.filter(([message]) => String(message).includes('[SarakQRCode]'));
        await waitFor(() => expect(qrWarnings()).toHaveLength(1), WAIT);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('com o peer, desenha o SVG com nome acessível e só os módulos escuros', async () => {
        peer.current = fakePeer;
        const { container } = renderQr({ value: 'https://x.test' });

        const image = await screen.findByRole('img', { name: 'Código QR' }, WAIT);

        expect(image.tagName.toLowerCase()).toBe('svg');
        expect(image.getAttribute('viewBox')).toBe('0 0 11 11');
        expect(container.querySelector('path')?.getAttribute('d')?.match(/M/g)).toHaveLength(5);
    });

    it('aceita nome acessível e cores do host', async () => {
        peer.current = fakePeer;
        const { container } = renderQr({ value: 'a', ariaLabel: 'QR do MFA', foreground: 'navy', background: 'ivory' });

        expect(await screen.findByRole('img', { name: 'QR do MFA' }, WAIT)).toBeInTheDocument();
        expect(container.querySelector('path')).toHaveAttribute('fill', 'navy');
        expect(container.querySelector('rect')).toHaveAttribute('fill', 'ivory');
    });

    it('conteúdo que o peer não consegue codificar não derruba a tela', async () => {
        peer.current = { create: () => { throw new Error('too big'); } };
        const { container } = renderQr({ value: 'enorme' });

        await waitFor(() => expect(container.querySelector('svg')).toBeNull(), WAIT);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(container.querySelector('svg')).toBeNull();
    });
});
