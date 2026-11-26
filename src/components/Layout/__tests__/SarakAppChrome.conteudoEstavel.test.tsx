import React, { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SarakAppChrome } from '../SarakAppChrome';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';

const NAV = [{ label: 'Propostas', route: '/propostas' }];

const Counter: React.FC = () => {
    const [count, setCount] = React.useState(0);
    return <button type="button" onClick={() => setCount(count + 1)}>cliques: {count}</button>;
};

const setViewport = (width: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
    act(() => { window.dispatchEvent(new Event('resize')); });
};

const Chrome: React.FC<{ navigationStyle: 'sidebar' | 'topbar' }> = ({ navigationStyle }) => (
    <SarakUIProvider config={{ mode: 'dark' }}>
        <SarakAppChrome navigationStyle={navigationStyle} nav={NAV}><Counter /></SarakAppChrome>
    </SarakUIProvider>
);

afterEach(() => { setViewport(1280); vi.restoreAllMocks(); });

describe('SarakAppChrome — o conteúdo segue montado quando o cromo troca de modo', () => {
    it('da lateral para o topo: o estado do conteúdo sobrevive e o nó é o mesmo', () => {
        setViewport(1280);
        const { rerender, container } = render(<Chrome navigationStyle="sidebar" />);
        fireEvent.click(screen.getByRole('button', { name: /cliques/ }));
        const before = screen.getByRole('button', { name: /cliques: 1/ });
        expect(container.querySelector('aside')).not.toBeNull();

        rerender(<Chrome navigationStyle="topbar" />);
        expect(container.querySelector('aside')).toBeNull();
        expect(screen.getByRole('button', { name: /cliques: 1/ })).toBe(before);
    });

    it('do desktop para o celular: o estado do conteúdo sobrevive', () => {
        setViewport(1280);
        const { container } = render(<Chrome navigationStyle="sidebar" />);
        fireEvent.click(screen.getByRole('button', { name: /cliques/ }));
        const before = screen.getByRole('button', { name: /cliques: 1/ });

        setViewport(375);
        expect(container.querySelector('[aria-controls="sarak-chrome-drawer"]')).not.toBeNull();
        expect(screen.getByRole('button', { name: /cliques: 1/ })).toBe(before);
    });
});

const Bare: React.FC = () => <SarakAppChrome navigationStyle="sidebar" nav={NAV}><Counter /></SarakAppChrome>;

// Sem o `SarakUIProvider`: ele próprio rende um portal, que o servidor não suporta, e isso não é do cromo.
describe('SarakAppChrome — renderização no servidor e hidratação', () => {
    it('o HTML do servidor hidrata sem erro recuperável, e os filhos ficam na tela', async () => {
        const html = renderToString(<Bare />);
        expect(html).toContain('cliques: ');
        const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const onRecoverableError = vi.fn();
        const host = document.createElement('div');
        host.innerHTML = html;
        document.body.appendChild(host);
        await act(async () => { hydrateRoot(host, <Bare />, { onRecoverableError }); });
        expect(onRecoverableError).not.toHaveBeenCalled();
        expect(errors).not.toHaveBeenCalled();
        expect(host.textContent).toContain('cliques: 0');
        expect(host.querySelector('[data-sarak-content-host]')).not.toBeNull();
        host.remove();
    });
});
