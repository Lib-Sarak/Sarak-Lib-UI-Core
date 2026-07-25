import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SarakAppChrome } from '../SarakAppChrome';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';

const NAV = [
    { label: 'Propostas', route: '/propostas' },
    { label: 'Projetos', route: '/projetos' },
];

describe('SarakAppChrome (Spec 40.1 — L2, cromo apresentacional temável)', () => {
    it('renderiza sidebar por padrão com brand, nav e conteúdo', () => {
        render(
            <SarakAppChrome brand={{ name: 'ERP Earendel' }} nav={NAV} activeRoute="/propostas">
                <div>conteúdo do app</div>
            </SarakAppChrome>,
        );
        expect(screen.getByText('ERP Earendel')).toBeInTheDocument();
        expect(screen.getByText('Propostas')).toBeInTheDocument();
        expect(screen.getByText('conteúdo do app')).toBeInTheDocument();
    });

    it('a sidebar consome o token de largura (Spec 18) — zero hardcode', () => {
        const { container } = render(
            <SarakAppChrome nav={NAV}><div>x</div></SarakAppChrome>,
        );
        const aside = container.querySelector('aside');
        expect(aside).not.toBeNull();
        expect(aside?.getAttribute('style')).toContain('var(--sarak-sidebar-width');
    });

    it('em navigationStyle="topbar" renderiza a topbar com token de altura', () => {
        const { container } = render(
            <SarakAppChrome navigationStyle="topbar" nav={NAV}><div>x</div></SarakAppChrome>,
        );
        const header = container.querySelector('header');
        expect(header).not.toBeNull();
        expect(header?.getAttribute('style')).toContain('var(--sarak-topbar-height');
    });

    it('emite onNavigate ao clicar num item — o host decide a navegação', () => {
        const onNavigate = vi.fn();
        render(<SarakAppChrome nav={NAV} onNavigate={onNavigate}><div>x</div></SarakAppChrome>);
        fireEvent.click(screen.getByText('Projetos'));
        expect(onNavigate).toHaveBeenCalledWith('/projetos');
    });
});

const NAV_ITEMS = [
    { id: 'propostas', label: 'Propostas', icon: 'FileText', href: '/propostas', active: true },
    { id: 'projetos', label: 'Projetos', icon: 'Folder', href: '/projetos' },
];

// `navItems` com ícone renderiza `SarakIcon`, que lê `useSarakUI` → exige o Provider.
const renderChrome = (ui: React.ReactElement) =>
    render(<SarakUIProvider config={{ mode: 'dark' }}>{ui}</SarakUIProvider>);

describe('SarakAppChrome (Spec 40.2 — L1, navegação estruturada + ícones first-class)', () => {
    it('renderiza navItems com label e ÍCONE (svg do SarakIcon) por item', () => {
        const { container } = renderChrome(
            <SarakAppChrome navItems={NAV_ITEMS}><div>x</div></SarakAppChrome>,
        );
        expect(screen.getByText('Propostas')).toBeInTheDocument();
        expect(screen.getByText('Projetos')).toBeInTheDocument();
        // Ícone first-class: cada item com `icon` renderiza um <svg> (SarakIcon/IconMap).
        expect(container.querySelectorAll('nav svg').length).toBeGreaterThanOrEqual(2);
    });

    it('marca o item ativo com aria-current="page" (acessível)', () => {
        renderChrome(<SarakAppChrome navItems={NAV_ITEMS}><div>x</div></SarakAppChrome>);
        const ativo = screen.getByText('Propostas').closest('button');
        const inativo = screen.getByText('Projetos').closest('button');
        expect(ativo).toHaveAttribute('aria-current', 'page');
        expect(inativo).not.toHaveAttribute('aria-current');
    });

    it('navItems são <button> (foco por teclado) e emitem onNavigate com a href', () => {
        const onNavigate = vi.fn();
        renderChrome(<SarakAppChrome navItems={NAV_ITEMS} onNavigate={onNavigate}><div>x</div></SarakAppChrome>);
        const botao = screen.getByText('Projetos').closest('button');
        expect(botao?.tagName).toBe('BUTTON'); // focável por teclado nativamente
        fireEvent.click(screen.getByText('Projetos'));
        expect(onNavigate).toHaveBeenCalledWith('/projetos');
    });

    it('navItems tem precedência sobre nav quando ambos são passados', () => {
        renderChrome(
            <SarakAppChrome nav={NAV} navItems={NAV_ITEMS}><div>x</div></SarakAppChrome>,
        );
        // Ambos têm "Propostas"/"Projetos"; garante que só há UMA renderização (a do navItems).
        expect(screen.getAllByText('Propostas')).toHaveLength(1);
    });
});

describe('SarakAppChrome (Spec 40.2 — L3, TODOS os tokens de cromo repintam, não só o fundo)', () => {
    // O cromo pinta cada faceta por `var(--token)`: qualquer valor que o Design Engine
    // emita para o token cascateia no elemento. Provar a REFERÊNCIA de cada token é provar
    // que a faceta repinta com a config do Design Engine — largura, altura, fundo e título,
    // não apenas `--sarak-topbar-bg` (a dúvida que a L3 fecha).

    it('sidebar: largura E fundo vêm de tokens (não só o fundo)', () => {
        const { container } = render(
            <SarakAppChrome brand={{ name: 'ERP' }}><div>x</div></SarakAppChrome>,
        );
        const aside = container.querySelector('aside');
        const style = aside?.getAttribute('style') ?? '';
        expect(style).toContain('var(--sarak-sidebar-width');   // geometria
        expect(style).toContain('var(--sarak-sidebar-bg');      // fundo
    });

    it('topbar: altura E fundo vêm de tokens (não só o fundo)', () => {
        const { container } = render(
            <SarakAppChrome navigationStyle="topbar" brand={{ name: 'ERP' }}><div>x</div></SarakAppChrome>,
        );
        const header = container.querySelector('header');
        const style = header?.getAttribute('style') ?? '';
        expect(style).toContain('var(--sarak-topbar-height');   // geometria
        expect(style).toContain('var(--sarak-topbar-bg');       // fundo
    });

    it('o título do brand repinta pela cor de título do cromo (--sarak-topbar-title-color)', () => {
        render(<SarakAppChrome navigationStyle="topbar" brand={{ name: 'ERP Earendel' }}><div>x</div></SarakAppChrome>);
        const titulo = screen.getByText('ERP Earendel');
        expect(titulo.getAttribute('style') ?? '').toContain('var(--sarak-topbar-title-color');
    });

    it('o cromo tem altura de viewport PRÓPRIA (não depende do host setar height no #root)', () => {
        // Bug de browser (Spec 40.2): sem altura própria, `h-full` colapsa e a sidebar/topbar
        // somem. O root do cromo deve trazer `min-height: 100dvh` em ambas as orientações.
        const { container: side } = render(<SarakAppChrome nav={NAV}><div>x</div></SarakAppChrome>);
        const { container: top } = render(<SarakAppChrome navigationStyle="topbar" nav={NAV}><div>x</div></SarakAppChrome>);
        expect((side.firstChild as HTMLElement).style.minHeight).toBe('100dvh');
        expect((top.firstChild as HTMLElement).style.minHeight).toBe('100dvh');
    });

    it('o consumidor pode sobrescrever a altura via style (uso embarcado)', () => {
        const { container } = render(<SarakAppChrome nav={NAV} style={{ minHeight: 0 }}><div>x</div></SarakAppChrome>);
        expect((container.firstChild as HTMLElement).style.minHeight).toBe('0px');
    });

    it('a matriz completa de tokens de cromo está referenciada (cobertura explícita)', () => {
        const { container: side } = render(<SarakAppChrome brand={{ name: 'ERP' }}><div>x</div></SarakAppChrome>);
        const { container: top } = render(<SarakAppChrome navigationStyle="topbar" brand={{ name: 'ERP' }}><div>x</div></SarakAppChrome>);
        const sideHtml = side.innerHTML;
        const topHtml = top.innerHTML;
        // Sidebar consome largura+fundo; topbar consome altura+fundo; ambos o título.
        expect(sideHtml).toContain('--sarak-sidebar-width');
        expect(sideHtml).toContain('--sarak-sidebar-bg');
        expect(sideHtml).toContain('--sarak-topbar-title-color');
        expect(topHtml).toContain('--sarak-topbar-height');
        expect(topHtml).toContain('--sarak-topbar-bg');
        expect(topHtml).toContain('--sarak-topbar-title-color');
    });
});
