import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SarakAppChromeMobile } from '../SarakAppChromeMobile';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';

const NAV = [
    { label: 'Propostas', route: '/propostas' },
    { label: 'Projetos', route: '/projetos' },
];

// SarakIcon (hambúrguer) lê useSarakUI → exige o Provider.
const renderMobile = (ui: React.ReactElement, config: Record<string, unknown> = {}) =>
    render(<SarakUIProvider config={{ mode: 'dark', ...config }}>{ui}</SarakUIProvider>);
// O padrão (`auto`) põe a navegação numa barra na base quando há até 5 itens; estes casos medem a
// navegação DENTRO do drawer, então forçam a gaveta. A barra tem a própria seção, mais abaixo.
const DRAWER = { mobileNavigationStyle: 'drawer' };
const base = { rootStyle: { minHeight: '100dvh' } };

describe('SarakAppChromeMobile (Spec 40.3 — L1, drawer atrás de hambúrguer)', () => {
    it('layoutPadding chega aos quatro lados do conteúdo por token', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} {...base}><div>conteúdo</div></SarakAppChromeMobile>,
        );
        const content = container.querySelector('[data-sarak-content]') as HTMLElement;
        expect(content.style.padding).toBe('var(--sarak-layout-padding, 16px)');
    });

    it('começa fechado: toggle acessível (aria-expanded=false) e drawer ausente', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} {...base}><div>conteúdo</div></SarakAppChromeMobile>,
        );
        const toggle = container.querySelector('[aria-controls="sarak-chrome-drawer"]');
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(container.querySelector('#sarak-chrome-drawer')).toBeNull();
        expect(screen.getByText('conteúdo')).toBeInTheDocument();
    });

    it('o toggle abre o drawer e revela a nav (aria-expanded=true)', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} {...base}><div>x</div></SarakAppChromeMobile>,
            DRAWER,
        );
        const toggle = container.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement;
        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(container.querySelector('#sarak-chrome-drawer')).not.toBeNull();
        expect(screen.getByText('Propostas')).toBeInTheDocument();
    });

    it('selecionar um item navega e fecha; o scrim também fecha', () => {
        const onNavigate = vi.fn();
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} onNavigate={onNavigate} {...base}><div>x</div></SarakAppChromeMobile>,
            DRAWER,
        );
        const toggle = container.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement;
        fireEvent.click(toggle);
        fireEvent.click(screen.getByText('Projetos'));
        expect(onNavigate).toHaveBeenCalledWith('/projetos');
        expect(container.querySelector('#sarak-chrome-drawer')).toBeNull();
    });

    it('o scrim (fundo de tela cheia atrás do drawer) é um <button> com rótulo acessível e fecha ao clique', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} {...base}><div>x</div></SarakAppChromeMobile>,
        );
        fireEvent.click(container.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement);
        const scrim = container.querySelector('button.fixed.inset-0.z-40') as HTMLElement;
        expect(scrim.tagName).toBe('BUTTON');
        expect(scrim).toHaveAttribute('aria-label', 'Fechar menu de navegação');
        expect(scrim.tabIndex).not.toBe(-1);
        fireEvent.click(scrim);
        expect(container.querySelector('#sarak-chrome-drawer')).toBeNull();
    });
});

const slotOf = (c: HTMLElement, name: string) => c.querySelector(`[data-sarak-slot="${name}"]`);

describe('SarakAppChromeMobile (Spec 48 — L2, os slots têm lugar coerente no celular)', () => {
    it('banner/footer seguem faixas full-width (mesma moldura do desktop)', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} banner={<span>aviso</span>} footer={<span>rodapé</span>} {...base}>
                <div>x</div>
            </SarakAppChromeMobile>,
        );
        const banner = slotOf(container, 'banner') as HTMLElement;
        const footer = slotOf(container, 'footer') as HTMLElement;
        // `w-full min-w-0` = acompanha a largura da tela em vez de estourar (Spec 40.3).
        expect(banner.className).toContain('w-full');
        expect(banner.className).toContain('min-w-0');
        expect(footer.className).toContain('w-full');
        expect(footer.className).toContain('min-w-0');
    });

    it('sidebarHeader/sidebarFooter MIGRAM para o drawer (a sidebar do celular)', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} sidebarHeader={<span>busca</span>} sidebarFooter={<span>v1.2.3</span>} {...base}>
                <div>x</div>
            </SarakAppChromeMobile>,
        );
        // Fechado: as regiões da sidebar não ocupam a tela.
        expect(slotOf(container, 'sidebarHeader')).toBeNull();
        expect(slotOf(container, 'sidebarFooter')).toBeNull();

        fireEvent.click(container.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement);
        const drawer = container.querySelector('#sarak-chrome-drawer')!;
        expect(drawer.contains(slotOf(container, 'sidebarHeader'))).toBe(true);
        expect(drawer.contains(slotOf(container, 'sidebarFooter'))).toBe(true);
        expect(screen.getByText('v1.2.3')).toBeInTheDocument();
    });

    it('topbarStart/topbarEnd compactam na barra sem empurrar o hambúrguer', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} topbarStart={<span>busca</span>} topbarActions={<span>avatar</span>} {...base}>
                <div>x</div>
            </SarakAppChromeMobile>,
        );
        const header = container.querySelector('header')!;
        const start = slotOf(container, 'topbarStart') as HTMLElement;
        const end = slotOf(container, 'topbarEnd') as HTMLElement;
        expect(header.contains(start)).toBe(true);
        expect(header.contains(end)).toBe(true);
        expect(start.className).toContain('min-w-0');   // comprime em vez de estourar
        expect(end.className).toContain('shrink-0');
        // O toggle continua sendo o primeiro elemento da barra.
        expect(header.firstElementChild).toHaveAttribute('aria-controls', 'sarak-chrome-drawer');
    });

    it('decoration fica atrás, aria-hidden e sem captura de foco/toque', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} decoration={<span>arte</span>} {...base}><div>x</div></SarakAppChromeMobile>,
        );
        const deco = slotOf(container, 'decoration') as HTMLElement;
        expect(deco).toHaveAttribute('aria-hidden', 'true');
        expect(deco.style.pointerEvents).toBe('none');
        expect(deco.querySelector('button, a, input')).toBeNull();
    });
});

describe('SarakAppChromeMobile — widgets por padrão dentro do drawer (nada some no celular)', () => {
    it('DEFAULT: com `user`/`logout`, busca/tema/usuário aparecem no drawer aberto (o hambúrguer já é o colapso)', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} user={{ name: 'Ana' }} logout={vi.fn()} {...base}><div>x</div></SarakAppChromeMobile>,
        );
        fireEvent.click(container.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement);
        expect(screen.getByPlaceholderText('Busca inteligente…')).toBeInTheDocument();
        expect(screen.getByText(/^Modo /)).toBeInTheDocument();
        expect(screen.getByTitle('Sair')).toBeInTheDocument();
    });

    it('sem `user`, o widget de usuário não aparece — busca e tema continuam', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV} {...base}><div>x</div></SarakAppChromeMobile>,
        );
        fireEvent.click(container.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement);
        expect(screen.getByPlaceholderText('Busca inteligente…')).toBeInTheDocument();
        expect(screen.getByText(/^Modo /)).toBeInTheDocument();
        expect(screen.queryByTitle('Sair')).toBeNull();
    });

    it('opt-out desliga os três defaults isoladamente', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile
                nav={NAV}
                user={{ name: 'Ana' }}
                logout={vi.fn()}
                widgets={{ search: false, themeToggle: false, user: false }}
                {...base}
            >
                <div>x</div>
            </SarakAppChromeMobile>,
        );
        fireEvent.click(container.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement);
        expect(screen.queryByPlaceholderText('Busca inteligente…')).toBeNull();
        expect(screen.queryByText(/^Modo /)).toBeNull();
        expect(screen.queryByTitle('Sair')).toBeNull();
    });
});

// os textos da própria lib seguem o idioma que vale.
describe('SarakAppChromeMobile — idioma que vale', () => {
    it('sai em inglês com `config.language: "en"`', () => {
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark', language: 'en' }}>
                <SarakAppChromeMobile nav={NAV} user={{ name: 'Ana' }} logout={vi.fn()} {...base}>
                    <div>x</div>
                </SarakAppChromeMobile>
            </SarakUIProvider>,
        );
        fireEvent.click(container.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement);
        expect(screen.getByPlaceholderText('Smart search…')).toBeInTheDocument();
        expect(screen.getByTitle('Logout')).toBeInTheDocument();
    });
});

describe('SarakAppChromeMobile — navegação na base (`mobileNavigationStyle`)', () => {
    const NAV_3 = [
        { label: 'Início', route: '/inicio', icon: 'Home' },
        { label: 'Pedidos', route: '/pedidos', icon: 'List' },
        { label: 'Contas', route: '/contas', icon: 'User' },
    ];
    const NAV_7 = Array.from({ length: 7 }, (_, i) => ({ label: `Destino ${i + 1}`, route: `/d${i + 1}` }));
    const bar = (c: HTMLElement) => c.querySelector('nav[data-sarak-bottom-nav]');
    const openDrawer = (c: HTMLElement) =>
        fireEvent.click(c.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement);

    it('auto com 3 itens: a navegação está na barra da base e fora do drawer', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV_3} activeRoute="/pedidos" {...base}><div>x</div></SarakAppChromeMobile>,
        );
        expect(bar(container)).not.toBeNull();
        openDrawer(container);
        const drawer = container.querySelector('#sarak-chrome-drawer') as HTMLElement;
        expect(drawer.querySelector('nav')).toBeNull();
        expect(drawer.contains(bar(container))).toBe(false);
    });

    it('auto com 7 itens: a barra não existe e a navegação continua no drawer', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV_7} {...base}><div>x</div></SarakAppChromeMobile>,
        );
        expect(bar(container)).toBeNull();
        openDrawer(container);
        expect(container.querySelector('#sarak-chrome-drawer nav')).not.toBeNull();
        expect(screen.getByText('Destino 7')).toBeInTheDocument();
    });

    it('bottom força a barra mesmo com 7 itens', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV_7} {...base}><div>x</div></SarakAppChromeMobile>,
            { mobileNavigationStyle: 'bottom' },
        );
        expect(bar(container)?.querySelectorAll('a')).toHaveLength(7);
    });

    it('drawer força a gaveta mesmo com 3 itens', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV_3} {...base}><div>x</div></SarakAppChromeMobile>,
            DRAWER,
        );
        expect(bar(container)).toBeNull();
        openDrawer(container);
        expect(container.querySelector('#sarak-chrome-drawer nav')).not.toBeNull();
    });

    it('item ativo da barra tem aria-current; clique navega por onNavigate', () => {
        const onNavigate = vi.fn();
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV_3} activeRoute="/pedidos" onNavigate={onNavigate} {...base}><div>x</div></SarakAppChromeMobile>,
        );
        const active = bar(container)?.querySelector('[aria-current="page"]') as HTMLElement;
        expect(active).toHaveTextContent('Pedidos');
        fireEvent.click(bar(container)?.querySelector('a[href="/contas"]') as HTMLElement);
        expect(onNavigate).toHaveBeenCalledWith('/contas');
    });

    it('com a barra ativa o hambúrguer e o drawer seguem com slots de sidebar e widgets', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile
                nav={NAV_3}
                sidebarHeader={<span>cabeçalho</span>}
                sidebarFooter={<span>v1.2.3</span>}
                user={{ name: 'Ana' }}
                logout={vi.fn()}
                {...base}
            >
                <div>x</div>
            </SarakAppChromeMobile>,
        );
        expect(bar(container)).not.toBeNull();
        openDrawer(container);
        const drawer = container.querySelector('#sarak-chrome-drawer') as HTMLElement;
        expect(drawer.contains(slotOf(container, 'sidebarHeader'))).toBe(true);
        expect(drawer.contains(slotOf(container, 'sidebarFooter'))).toBe(true);
        expect(screen.getByPlaceholderText('Busca inteligente…')).toBeInTheDocument();
        expect(screen.getByText(/^Modo /)).toBeInTheDocument();
        expect(screen.getByTitle('Sair')).toBeInTheDocument();
    });

    it('a barra vem depois do painel de conteúdo, dentro da raiz do cromo', () => {
        const { container } = renderMobile(
            <SarakAppChromeMobile nav={NAV_3} {...base}><div>x</div></SarakAppChromeMobile>,
        );
        const content = container.querySelector('[data-sarak-content]') as HTMLElement;
        const nav = bar(container) as HTMLElement;
        expect(content.parentElement).toBe(nav.parentElement);
        expect(content.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
});
