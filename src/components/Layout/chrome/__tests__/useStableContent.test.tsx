import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { useStableContent } from '../useStableContent';

const SidebarBody: React.FC<{ children: React.ReactNode }> = ({ children }) => <aside data-testid="sidebar-body"><main>{children}</main></aside>;
const TopbarBody: React.FC<{ children: React.ReactNode }> = ({ children }) => <header data-testid="topbar-body"><section><main>{children}</main></section></header>;

const Frame: React.FC<{ mode: 'sidebar' | 'topbar'; route?: string; children: React.ReactNode }> = ({ mode, route, children }) => {
    const { slot, portal } = useStableContent(children, route);
    const Body = mode === 'topbar' ? TopbarBody : SidebarBody;
    return <><Body>{slot}</Body>{portal}</>;
};

const Counter: React.FC = () => {
    const [count, setCount] = React.useState(0);
    return <button type="button" onClick={() => setCount(count + 1)}>cliques: {count}</button>;
};

const Boom: React.FC = () => { throw new Error('falha do conteúdo'); };

describe('useStableContent', () => {
    it('trocar o corpo do cromo não desmonta o conteúdo: o estado dele sobrevive e ele muda de lugar', () => {
        const { rerender } = render(<Frame mode="sidebar"><Counter /></Frame>);
        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('button')).toHaveTextContent('cliques: 2');
        const before = screen.getByRole('button');
        expect(screen.getByTestId('sidebar-body')).toContainElement(before);

        rerender(<Frame mode="topbar"><Counter /></Frame>);
        expect(screen.queryByTestId('sidebar-body')).toBeNull();
        expect(screen.getByRole('button')).toBe(before);
        expect(screen.getByRole('button')).toHaveTextContent('cliques: 2');
        expect(screen.getByTestId('topbar-body')).toContainElement(before);
    });

    it('o ponto de encaixe e o nó do conteúdo não criam caixa de layout', () => {
        render(<Frame mode="sidebar"><Counter /></Frame>);
        const anchor = document.querySelector<HTMLElement>('[data-sarak-content-anchor]')!;
        const host = document.querySelector<HTMLElement>('[data-sarak-content-host]')!;
        expect(anchor.style.display).toBe('contents');
        expect(host.style.display).toBe('contents');
        expect(anchor).toContainElement(host);
    });

    it('um erro no conteúdo é contido no limite do conteúdo, e o cromo segue de pé', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(<Frame mode="sidebar"><Boom /></Frame>);
        expect(screen.getByTestId('sidebar-body')).toBeInTheDocument();
        vi.restoreAllMocks();
    });
});
