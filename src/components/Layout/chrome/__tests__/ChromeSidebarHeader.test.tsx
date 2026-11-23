import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { ChromeSidebarHeader } from '../ChromeSidebarHeader';

const BRAND = { name: 'ERP', logoUrl: '/logo.png' };

describe('ChromeSidebarHeader', () => {
    it('aberta: faixa da marca com a altura do topo da área de conteúdo, linha embaixo e fundo da marca; marca à esquerda e seta à direita', () => {
        const { container } = render(
            <ChromeSidebarHeader brand={BRAND} showBrand collapsed={false} showCollapse onToggleCollapse={vi.fn()} />,
        );
        const header = container.firstElementChild as HTMLElement;
        expect(header.style.height).toBe('var(--sarak-topbar-height, 64px)');
        expect(header.style.borderBottom).toContain('var(--sarak-sidebar-border-color');
        expect(header.style.background).toBe('var(--sarak-sidebar-brand-bg, transparent)');
        expect(header.className).toContain('justify-between');
        const [first, last] = Array.from(header.children);
        expect(last.getAttribute('data-sarak-widget') ?? last.querySelector('[data-sarak-widget]')?.getAttribute('data-sarak-widget')).toBe('collapse');
        expect(first.querySelector('img')).not.toBeNull();
        expect(screen.getByRole('button', { name: 'Recolher navegação' })).toBeInTheDocument();
    });

    it('recolhida: a seta fica no alto, com o rótulo de expandir, e a marca (só o símbolo) vem abaixo', () => {
        const { container } = render(
            <ChromeSidebarHeader brand={BRAND} showBrand collapsed showCollapse onToggleCollapse={vi.fn()} />,
        );
        const header = container.firstElementChild as HTMLElement;
        expect(header.className).toContain('flex-col');
        expect(header.firstElementChild).toBe(screen.getByRole('button', { name: 'Expandir navegação' }));
        expect(container.querySelector('img')).not.toBeNull();
        expect(screen.queryByText('ERP')).toBeNull();
    });

    it('o botão chama onToggleCollapse nos dois estados', () => {
        const onToggle = vi.fn();
        const { rerender } = render(
            <ChromeSidebarHeader brand={BRAND} showBrand collapsed={false} showCollapse onToggleCollapse={onToggle} />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Recolher navegação' }));
        rerender(<ChromeSidebarHeader brand={BRAND} showBrand collapsed showCollapse onToggleCollapse={onToggle} />);
        fireEvent.click(screen.getByRole('button', { name: 'Expandir navegação' }));
        expect(onToggle).toHaveBeenCalledTimes(2);
    });

    it('showBrand=false (marca na base): só a seta fica no topo', () => {
        const { container } = render(
            <ChromeSidebarHeader brand={BRAND} showBrand={false} collapsed={false} showCollapse onToggleCollapse={vi.fn()} />,
        );
        expect(container.querySelector('img')).toBeNull();
        expect(screen.queryByText('ERP')).toBeNull();
        expect(screen.getByRole('button', { name: 'Recolher navegação' })).toBeInTheDocument();
    });

    it('sem logo: monograma com a inicial do nome, que fica sozinho na lateral recolhida', () => {
        const { container, rerender } = render(
            <ChromeSidebarHeader brand={{ name: 'sarak OS' }} showBrand collapsed={false} showCollapse onToggleCollapse={vi.fn()} />,
        );
        expect(container.querySelector('[data-sarak-brand-monogram]')?.textContent).toBe('S');
        expect(screen.getByText('sarak OS')).toBeInTheDocument();
        rerender(<ChromeSidebarHeader brand={{ name: 'sarak OS' }} showBrand collapsed showCollapse onToggleCollapse={vi.fn()} />);
        expect(container.querySelector('[data-sarak-brand-monogram]')?.textContent).toBe('S');
        expect(screen.queryByText('sarak OS')).toBeNull();
    });

    it('com a marca na base, o topo é só a seta: sem faixa, sem altura do topo e sem linha', () => {
        const { container } = render(
            <ChromeSidebarHeader brand={BRAND} showBrand={false} collapsed={false} showCollapse onToggleCollapse={vi.fn()} />,
        );
        const header = container.firstElementChild as HTMLElement;
        expect(header.style.height).toBe('');
        expect(header.style.borderBottom).toBe('');
    });

    it('sem marca no topo e sem seta, o topo não existe', () => {
        const { container } = render(
            <ChromeSidebarHeader brand={BRAND} showBrand={false} collapsed={false} showCollapse={false} onToggleCollapse={vi.fn()} />,
        );
        expect(container.firstElementChild).toBeNull();
    });

    it('sem o widget de recolher não há seta', () => {
        render(<ChromeSidebarHeader brand={BRAND} showBrand collapsed={false} showCollapse={false} onToggleCollapse={vi.fn()} />);
        expect(screen.queryByRole('button')).toBeNull();
    });
});
