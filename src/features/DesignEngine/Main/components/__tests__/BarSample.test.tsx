import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { BarSample } from '../BarSample';
import type { SarakDesignState } from '../../../../../core/Provider/types';

vi.mock('../../../Canvas/components/LazyWhenVisible', () => ({
    LazyWhenVisible: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
}));

const renderSample = (design: Record<string, unknown> = {}) => render(
    <SarakUIProvider>
        <BarSample draft={design as unknown as SarakDesignState} mode="light" />
    </SarakUIProvider>,
);

describe('BarSample', () => {
    it('é o cromo real: a navegação de amostra e o item ativo saem do SarakAppChrome', () => {
        renderSample();
        expect(screen.getByTestId('bar-sample')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Pedidos' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('link', { name: 'Início' })).toBeInTheDocument();
    });

    it('a marca de amostra é neutra: monograma em SVG e um nome genérico, sem marca real', () => {
        const { container } = renderSample();
        expect(screen.getByText('Sua marca')).toBeInTheDocument();
        expect(container.querySelector('img[src^="data:image/svg+xml"]')).not.toBeNull();
    });

    it('a amostra segue o rascunho: a posição da marca na base muda o lugar dela', () => {
        const top = renderSample({ sidebarLogoPlacement: 'top' });
        expect(top.container.querySelector('[data-sarak-sidebar-header] .sarak-chrome-brand')).not.toBeNull();
        top.unmount();
        const bottom = renderSample({ sidebarLogoPlacement: 'bottom' });
        expect(bottom.container.querySelector('[data-sarak-sidebar-header] .sarak-chrome-brand')).toBeNull();
        expect(bottom.container.querySelector('[data-sarak-sidebar-footer] .sarak-chrome-brand')).not.toBeNull();
    });

    it('a amostra segue o rascunho: a alça de largura aparece com sidebarResizable', () => {
        const off = renderSample({});
        expect(off.container.querySelector('[role="separator"]')).toBeNull();
        off.unmount();
        const on = renderSample({ sidebarResizable: true });
        expect(on.container.querySelector('[role="separator"]')).not.toBeNull();
    });
});
