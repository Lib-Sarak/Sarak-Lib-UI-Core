import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SarakAppChrome } from '../SarakAppChrome';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';
import { DeviceProvider, type DeviceType } from '../../../core/Provider/DeviceProvider';

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

// `useSarakDevice` lê o DeviceContext; aninhar um DeviceProvider com override força o device
// (o SarakUIProvider já monta o seu — o interno vence). SarakIcon (hambúrguer) exige o Provider.
const renderAtDevice = (device: DeviceType, ui: React.ReactElement) =>
    render(
        <SarakUIProvider config={{ mode: 'dark' }}>
            <DeviceProvider overrideDevice={device}>{ui}</DeviceProvider>
        </SarakUIProvider>,
    );

const toggleOf = (c: HTMLElement) => c.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement | null;

describe('SarakAppChrome (Spec 40.3 — L1, multidispositivo por padrão / cromo reflui)', () => {
    it('CELULAR: colapsa a nav atrás de um toggle (hambúrguer) — a nav não vem aberta', () => {
        const { container } = renderAtDevice('smartphone',
            <SarakAppChrome brand={{ name: 'ERP' }} nav={NAV}><div>conteúdo</div></SarakAppChrome>,
        );
        const toggle = toggleOf(container);
        expect(toggle).not.toBeNull();
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        // Não há sidebar fixa comendo a tela; a nav (drawer) começa fechada.
        expect(container.querySelector('#sarak-chrome-drawer')).toBeNull();
        expect(screen.queryByText('Propostas')).toBeNull();
        expect(screen.getByText('conteúdo')).toBeInTheDocument();
    });

    it('CELULAR: o toggle abre o drawer, é acessível (aria-expanded/controls) e mostra a nav', () => {
        const { container } = renderAtDevice('smartphone',
            <SarakAppChrome brand={{ name: 'ERP' }} nav={NAV}><div>x</div></SarakAppChrome>,
        );
        const toggle = toggleOf(container)!;
        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(container.querySelector('#sarak-chrome-drawer')).not.toBeNull();
        expect(screen.getByText('Propostas')).toBeInTheDocument();
    });

    it('CELULAR: selecionar um item navega (onNavigate) e fecha o drawer', () => {
        const onNavigate = vi.fn();
        const { container } = renderAtDevice('smartphone',
            <SarakAppChrome nav={NAV} onNavigate={onNavigate}><div>x</div></SarakAppChrome>,
        );
        fireEvent.click(toggleOf(container)!);
        fireEvent.click(screen.getByText('Projetos'));
        expect(onNavigate).toHaveBeenCalledWith('/projetos');
        // Fechou: o drawer some da árvore.
        expect(container.querySelector('#sarak-chrome-drawer')).toBeNull();
    });

    it('TABLET: cai no tier intermediário (topbar compacta) mesmo com nav sidebar — sem sidebar fixa', () => {
        const { container } = renderAtDevice('tablet',
            <SarakAppChrome navigationStyle="sidebar" nav={NAV}><div>x</div></SarakAppChrome>,
        );
        expect(container.querySelector('header')).not.toBeNull();
        expect(container.querySelector('aside')).toBeNull();
    });

    it('DESKTOP: mantém a sidebar completa (comportamento atual preservado)', () => {
        const { container } = renderAtDevice('desktop',
            <SarakAppChrome navigationStyle="sidebar" nav={NAV}><div>x</div></SarakAppChrome>,
        );
        expect(container.querySelector('aside')).not.toBeNull();
        expect(toggleOf(container)).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// Spec 48 — L1: slots de extensão (a lib dá a REGIÃO, o consumidor dá o CONTEÚDO)
// ---------------------------------------------------------------------------

const slotOf = (c: HTMLElement, name: string) => c.querySelector(`[data-sarak-slot="${name}"]`);

describe('SarakAppChrome (Spec 48 — L1, slots opcionais por região)', () => {
    it('ZERO-CONFIG: sem slots, NENHUMA região extra é renderizada (sem espaço morto)', () => {
        const { container } = renderAtDevice('desktop',
            <SarakAppChrome nav={NAV}><div>x</div></SarakAppChrome>,
        );
        for (const slot of ['logo', 'topbarStart', 'topbarEnd', 'sidebarHeader', 'sidebarFooter', 'banner', 'footer', 'decoration']) {
            expect(slotOf(container, slot)).toBeNull();
        }
    });

    it('banner e footer renderizam como faixas full-width no modo SIDEBAR', () => {
        const { container } = renderAtDevice('desktop',
            <SarakAppChrome nav={NAV} banner={<img src="/promo.gif" alt="promo" />} footer={<span>rodapé</span>}>
                <div>x</div>
            </SarakAppChrome>,
        );
        const banner = slotOf(container, 'banner');
        const footer = slotOf(container, 'footer');
        expect(banner?.className).toContain('w-full');
        expect(footer?.className).toContain('w-full');
        expect(screen.getByAltText('promo')).toBeInTheDocument();
        expect(screen.getByText('rodapé')).toBeInTheDocument();
        // Ordem do cromo: banner é a PRIMEIRA faixa e footer a ÚLTIMA (o Provider
        // envolve a árvore, então a raiz do cromo é o pai das faixas, não o container).
        const root = banner!.parentElement as HTMLElement;
        expect(root.firstElementChild).toBe(banner);
        expect(root.lastElementChild).toBe(footer);
    });

    it('banner e footer também valem no modo TOPBAR (mesma moldura)', () => {
        const { container } = renderAtDevice('desktop',
            <SarakAppChrome navigationStyle="topbar" nav={NAV} banner={<span>aviso</span>} footer={<span>rodapé</span>}>
                <div>x</div>
            </SarakAppChrome>,
        );
        expect(slotOf(container, 'banner')).not.toBeNull();
        expect(slotOf(container, 'footer')).not.toBeNull();
        expect(container.querySelector('header')).not.toBeNull();
    });

    it('decoration é camada ATRÁS, aria-hidden e sem captura de foco/toque (a11y)', () => {
        const { container } = renderAtDevice('desktop',
            <SarakAppChrome nav={NAV} decoration={<video data-testid="anim" />}><div>x</div></SarakAppChrome>,
        );
        const deco = slotOf(container, 'decoration') as HTMLElement;
        expect(deco).not.toBeNull();
        expect(deco).toHaveAttribute('aria-hidden', 'true');
        expect(deco.style.pointerEvents).toBe('none');
        expect(deco.style.position).toBe('absolute');
        // A raiz vira contexto de empilhamento próprio só quando há decoração.
        const root = deco.parentElement as HTMLElement;
        expect(root.style.position).toBe('relative');
        expect(root.style.isolation).toBe('isolate');
    });

    it('logo custom tem PRECEDÊNCIA sobre brand.logoUrl (e o brand.name permanece)', () => {
        const { container } = renderAtDevice('desktop',
            <SarakAppChrome
                nav={NAV}
                brand={{ name: 'ERP', logoUrl: '/estatico.png' }}
                logo={<span data-testid="logo-animado">◆</span>}
            >
                <div>x</div>
            </SarakAppChrome>,
        );
        expect(slotOf(container, 'logo')).not.toBeNull();
        expect(screen.getByTestId('logo-animado')).toBeInTheDocument();
        expect(container.querySelector('img[src="/estatico.png"]')).toBeNull();
        expect(screen.getByText('ERP')).toBeInTheDocument();
    });

    it('sidebarHeader/sidebarFooter aparecem DENTRO da sidebar, com medida por TOKEN', () => {
        const { container } = renderAtDevice('desktop',
            <SarakAppChrome nav={NAV} sidebarHeader={<span>busca</span>} sidebarFooter={<span>v1.2.3</span>}>
                <div>x</div>
            </SarakAppChrome>,
        );
        const aside = container.querySelector('aside')!;
        const header = slotOf(container, 'sidebarHeader') as HTMLElement;
        const footer = slotOf(container, 'sidebarFooter') as HTMLElement;
        expect(aside.contains(header)).toBe(true);
        expect(aside.contains(footer)).toBe(true);
        expect(header.getAttribute('style')).toContain('var(--sarak-layout-gap-sm');
        expect(footer.getAttribute('style')).toContain('var(--sarak-layout-gap-sm');
    });

    it('topbarStart/topbarEnd aparecem na barra superior (modo topbar)', () => {
        const { container } = renderAtDevice('desktop',
            <SarakAppChrome navigationStyle="topbar" nav={NAV} topbarStart={<span>busca</span>} topbarEnd={<span>avatar</span>}>
                <div>x</div>
            </SarakAppChrome>,
        );
        const header = container.querySelector('header')!;
        expect(header.contains(slotOf(container, 'topbarStart'))).toBe(true);
        expect(header.contains(slotOf(container, 'topbarEnd'))).toBe(true);
    });

    it('sem barra superior (modo sidebar), topbarStart/End degradam para a sidebar — nada some', () => {
        const { container } = renderAtDevice('desktop',
            <SarakAppChrome nav={NAV} topbarStart={<span>busca</span>} topbarEnd={<span>avatar</span>}>
                <div>x</div>
            </SarakAppChrome>,
        );
        const aside = container.querySelector('aside')!;
        expect(aside.contains(slotOf(container, 'topbarStart'))).toBe(true);
        expect(aside.contains(slotOf(container, 'topbarEnd'))).toBe(true);
        expect(screen.getByText('avatar')).toBeInTheDocument();
    });

    it('COMPAT: topbarActions continua funcionando e topbarEnd é seu alias (vence quando ambos)', () => {
        const legado = renderAtDevice('desktop',
            <SarakAppChrome navigationStyle="topbar" nav={NAV} topbarActions={<span>ações legadas</span>}>
                <div>x</div>
            </SarakAppChrome>,
        );
        expect(legado.getByText('ações legadas')).toBeInTheDocument();
        expect(slotOf(legado.container, 'topbarEnd')).not.toBeNull();

        const ambos = renderAtDevice('desktop',
            <SarakAppChrome navigationStyle="topbar" nav={NAV} topbarActions={<span>legado</span>} topbarEnd={<span>novo</span>}>
                <div>x</div>
            </SarakAppChrome>,
        );
        expect(ambos.queryByText('novo')).toBeInTheDocument();
        expect(ambos.queryByText('legado')).toBeNull();
    });

    it('os slots NÃO tiram a nav nem o conteúdo do ar (cromo segue funcional)', () => {
        const onNavigate = vi.fn();
        renderAtDevice('desktop',
            <SarakAppChrome
                nav={NAV}
                onNavigate={onNavigate}
                banner={<span>b</span>}
                footer={<span>f</span>}
                decoration={<span>d</span>}
                sidebarHeader={<span>sh</span>}
                sidebarFooter={<span>sf</span>}
            >
                <div>conteúdo do app</div>
            </SarakAppChrome>,
        );
        expect(screen.getByText('conteúdo do app')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Projetos'));
        expect(onNavigate).toHaveBeenCalledWith('/projetos');
    });
});
