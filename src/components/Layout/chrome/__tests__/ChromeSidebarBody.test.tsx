import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { ChromeSidebarBody } from '../ChromeSidebarBody';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';

const NAV = [{ label: 'Propostas', route: '/propostas' }];

const renderBody = (design: Record<string, unknown>) =>
    render(
        <SarakUIProvider config={design}>
            <ChromeSidebarBody nav={NAV} className="" rootStyle={{}}>
                <div>conteúdo</div>
            </ChromeSidebarBody>
        </SarakUIProvider>,
    );

describe('ChromeSidebarBody (tokens de cromo no modo sidebar)', () => {
    it('layoutPadding chega aos quatro lados do conteúdo por token', () => {
        const { container } = renderBody({});
        const content = container.querySelector('[data-sarak-content]') as HTMLElement;
        expect(content.style.padding).toBe('var(--sarak-layout-padding, 16px)');
    });

    it('sidebarPosition="right": a sidebar migra para o fim da linha e a borda externa acompanha a posição', () => {
        const { container } = renderBody({ sidebarPosition: 'right' });
        const row = container.querySelector('aside')!.parentElement!;
        expect(row.className).toContain('flex-row-reverse');
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('border-left-width: var(--sarak-sidebar-border-width, 1px)');
        expect(style).toContain('border-right-width: 0px');
    });

    it('sidebarPosition="left" (default): flex-row e borda externa à direita — comportamento de hoje', () => {
        const { container } = renderBody({});
        const row = container.querySelector('aside')!.parentElement!;
        expect(row.className).toContain('flex-row');
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('border-right-width: var(--sarak-sidebar-border-width, 1px)');
        expect(style).toContain('border-left-width: 0px');
    });

    it('isNavHidden: a sidebar usa a largura RECOLHIDA em vez da largura cheia', () => {
        const { container } = renderBody({ isNavHidden: true });
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('var(--sarak-sidebar-collapsed-width');
        expect(style).not.toContain('var(--sarak-sidebar-width, 240px)');
    });

    it('sem isNavHidden: a sidebar mantém a largura cheia — comportamento de hoje', () => {
        const { container } = renderBody({});
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('var(--sarak-sidebar-width, 240px)');
    });

    it('isAutoHideEnabled: a sidebar começa oculta e um sensor de borda aparece', () => {
        const { container } = renderBody({ isAutoHideEnabled: true });
        expect(container.querySelector('aside')).toBeNull();
        expect(container.querySelector('.fixed.left-0.top-0')).not.toBeNull();
    });

    it('sem isAutoHideEnabled: a sidebar aparece direto, sem sensor — comportamento de hoje', () => {
        const { container } = renderBody({});
        expect(container.querySelector('aside')).not.toBeNull();
    });

    it('tabSectionMargin chega às quatro margens da sidebar e compensa sua altura', () => {
        const { container } = renderBody({});
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('margin: var(--sarak-tab-section-margin');
        expect(style).toContain('height: calc(100% - (var(--sarak-tab-section-margin, 8px) * 2))');
    });
});

// Spec 05 §2.4 — tokens que faltavam nos dois cromos.
describe('ChromeSidebarBody — tokens novos ligados (Spec 05 §2.4)', () => {
    it('sidebarNoiseOpacity: a camada de ruído existe e, sem valor no tema, cai no default (0) — "não muda nada"', () => {
        const { container } = renderBody({});
        const noiseLayer = container.querySelector('.mix-blend-overlay') as HTMLElement | null;
        expect(noiseLayer).not.toBeNull();
        expect(noiseLayer!.style.opacity).toBe('var(--sarak-sidebar-noise-opacity, 0)');
    });

    it('sidebarBlur/sidebarShadow chegam à sidebar por token, com fallback', () => {
        const { container } = renderBody({});
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('var(--sarak-sidebar-blur, 10px)');
        expect(style).toContain('var(--sarak-sidebar-shadow, 10px 0 30px rgba(0,0,0,0.5))');
    });

    it('sidebarMinWidth/sidebarMaxWidth chegam à sidebar por token (limitam mesmo sem redimensionar por arraste)', () => {
        const { container } = renderBody({});
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('var(--sidebar-min-width, 150px)');
        expect(style).toContain('var(--sidebar-max-width, 450px)');
    });

    it('a borda lateral lê cor, largura, estilo e lados do schema', () => {
        const { container } = renderBody({
            sidebarBorderColor: '#334455',
            sidebarBorderWidth: 3,
            sidebarBorderStyle: 'dashed',
            sidebarBorderSide: 'bottom',
        });
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('--sarak-sidebar-border-color');
        expect(style).toContain('border-bottom-width: var(--sarak-sidebar-border-width, 1px)');
        expect(style).toContain('border-style: dashed');
        expect(style).toContain('border-top-width: 0px');
    });

    it('estilo sem borda remove todos os lados sem classe estrutural fixa', () => {
        const { container } = renderBody({ sidebarBorderStyle: 'none' });
        const aside = container.querySelector('aside')!;
        const style = aside.getAttribute('style') ?? '';
        expect(aside.className).not.toMatch(/border-(r|l|t|b|rounded)/);
        expect(style).toContain('border-style: none');
    });

    it('fundo gradient e textura local chegam à sidebar pelo token de estilo', () => {
        const gradient = renderBody({ sidebarBackgroundStyle: 'gradient' }).container.querySelector('aside')!;
        expect(gradient.getAttribute('style')).toContain('linear-gradient(135deg');
        const textured = renderBody({ sidebarBackgroundStyle: 'texture' }).container;
        expect((textured.querySelector('.mix-blend-overlay') as HTMLElement).style.opacity).toBe('max(var(--sarak-sidebar-noise-opacity, 0), 0.12)');
    });

    it('sidebar recolhida: o piso da largura aberta (sidebarMinWidth) não vale — a largura é a do token recolhido', () => {
        const { container } = renderBody({ isNavHidden: true });
        const aside = container.querySelector('aside') as HTMLElement;
        expect(aside.style.minWidth).toBe('0px');
        expect(aside.style.width).toBe('var(--sarak-sidebar-collapsed-width, 74px)');
        expect(aside.getAttribute('style') ?? '').not.toContain('--sidebar-min-width');
    });

    it('navActiveMarkerColor/navActiveMarkerGlow: o item ativo tem marcador próprio, com o brilho por token', () => {
        const { container } = render(
            <SarakUIProvider config={{}}>
                <ChromeSidebarBody nav={[{ label: 'Propostas', route: '/propostas' }]} activeRoute="/propostas" className="" rootStyle={{}}>
                    <div>x</div>
                </ChromeSidebarBody>
            </SarakUIProvider>,
        );
        const marker = container.querySelector('[aria-hidden="true"].sarak-nav-marker-glow') as HTMLElement | null;
        expect(marker).not.toBeNull();
        expect(marker!.style.background).toBe('var(--sarak-nav-marker-color, #19e3f0)');
    });
});

describe('ChromeSidebarBody — slot de busca (searchPositionSidebar)', () => {
    it('"top": a busca aparece antes do conteúdo de navegação', () => {
        const { container } = render(
            <SarakUIProvider config={{ searchPositionSidebar: 'top' }}>
                <ChromeSidebarBody nav={NAV} className="" rootStyle={{}} search={<div data-testid="busca">buscar</div>}>
                    <div>x</div>
                </ChromeSidebarBody>
            </SarakUIProvider>,
        );
        expect(container.querySelector('[data-sarak-slot="search"]')).not.toBeNull();
    });

    it('valor legado "hidden" cai em "top" e mantém a busca visível', () => {
        const { container } = render(
            <SarakUIProvider config={{ searchPositionSidebar: 'hidden' } as Record<string, unknown>}>
                <ChromeSidebarBody nav={NAV} className="" rootStyle={{}} search={<div>buscar</div>}>
                    <div>x</div>
                </ChromeSidebarBody>
            </SarakUIProvider>,
        );
        expect(container.querySelector('[data-sarak-slot="search"]')).not.toBeNull();
    });
});

describe('ChromeSidebarBody — widgets default (busca/tema/usuário/preferências)', () => {
    it('sem `widgets`, os controles de fábrica continuam oferecidos', () => {
        const { container } = renderBody({});
        expect(container.querySelector('[data-sarak-slot="search"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-widget="collapse"]')).toBeNull();
        expect(container.querySelector('[data-sarak-widget="preferences-menu"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-widget="user-theme"]')).not.toBeNull();
    });

    it('tamanho da fonte, orientação e recolhimento ficam no menu de preferências por padrão', () => {
        renderBody({});
        fireEvent.click(screen.getByRole('button', { name: 'Preferências' }));
        expect(screen.getByText('Tamanho da fonte')).toBeInTheDocument();
        expect(screen.getByText('Navegação')).toBeInTheDocument();
        expect(screen.getByText('Recolher navegação')).toBeInTheDocument();
    });

    it('`widgets` desliga cada default isoladamente', () => {
        const { container } = render(
            <SarakUIProvider config={{}}>
                <ChromeSidebarBody nav={NAV} className="" rootStyle={{}} widgets={{ search: false, collapse: false, themeToggle: false, user: false }}>
                    <div>x</div>
                </ChromeSidebarBody>
            </SarakUIProvider>,
        );
        expect(container.querySelector('[data-sarak-slot="search"]')).toBeNull();
        expect(container.querySelector('[data-sarak-widget="collapse"]')).toBeNull();
        expect(container.querySelector('[data-sarak-widget="user-theme"]')).toBeNull();
    });
});

describe('ChromeSidebarBody — personalidade da barra', () => {
    const BRAND = { name: 'ERP', logoUrl: '/logo.png' };
    const renderWithBrand = (design: Record<string, unknown>) =>
        render(
            <SarakUIProvider config={design}>
                <ChromeSidebarBody nav={NAV} brand={BRAND} className="" rootStyle={{}}>
                    <div>conteúdo</div>
                </ChromeSidebarBody>
            </SarakUIProvider>,
        );
    const brandInside = (region: string, container: HTMLElement): boolean =>
        Boolean(container.querySelector(`[${region}] .sarak-chrome-brand`));

    it('a barra inteira não rola: só a lista de navegação rola, e só na vertical', () => {
        const { container } = renderBody({});
        const aside = container.querySelector('aside') as HTMLElement;
        expect(aside.className).toContain('overflow-hidden');
        expect(aside.className).not.toContain('overflow-y-auto');
        const nav = container.querySelector('nav') as HTMLElement;
        expect(nav.className).toContain('overflow-y-auto');
        expect(nav.className).toContain('overflow-x-hidden');
    });

    it('sidebarLogoPlacement: a marca fica no topo por padrão e na base quando pedido', () => {
        const top = renderWithBrand({});
        expect(brandInside('data-sarak-sidebar-header', top.container)).toBe(true);
        expect(brandInside('data-sarak-sidebar-footer', top.container)).toBe(false);
        top.unmount();

        const bottom = renderWithBrand({ sidebarLogoPlacement: 'bottom' });
        expect(brandInside('data-sarak-sidebar-header', bottom.container)).toBe(false);
        expect(brandInside('data-sarak-sidebar-footer', bottom.container)).toBe(true);
    });

    it('recolhida, o recolher continua no topo e a marca (só o símbolo) fica no topo ou na base conforme o token', () => {
        const { container } = renderWithBrand({ isNavHidden: true, sidebarLogoPlacement: 'bottom', preferenceNavCollapsePosition: 'pinned' });
        expect(container.querySelector('[data-sarak-sidebar-header] [data-sarak-widget="collapse"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-sidebar-footer] img')).not.toBeNull();
        expect(screen.queryByText('ERP')).toBeNull();
    });

    it('sidebarResizable desligado (padrão): não há alça', () => {
        renderBody({});
        expect(screen.queryByRole('separator')).toBeNull();
    });

    it('sidebarResizable ligado: a alça existe na lateral aberta e some na recolhida', () => {
        const open = renderBody({ sidebarResizable: true });
        expect(open.container.querySelector('aside [role="separator"]')).not.toBeNull();
        open.unmount();
        renderBody({ sidebarResizable: true, isNavHidden: true });
        expect(screen.queryByRole('separator')).toBeNull();
    });

    it('a largura ajustada pelo teclado vence a do tema na lateral', () => {
        const { container } = renderBody({ sidebarResizable: true });
        const handle = container.querySelector('[role="separator"]') as HTMLElement;
        fireEvent.keyDown(handle, { key: 'End' });
        const style = (container.querySelector('aside') as HTMLElement).getAttribute('style') ?? '';
        expect(style).toMatch(/width: [0-9]+px/);
        expect(style).not.toContain('width: var(--sarak-sidebar-width, 240px)');
    });

    it('papel de cor: sem paleta a barra fica como sempre; com paleta e papel contrastante, refaz as variáveis de texto', () => {
        const neutral = renderBody({ colorPalette: 'slate', sidebarTone: 'primary' });
        expect((neutral.container.querySelector('aside') as HTMLElement).style.getPropertyValue('--text-muted')).toBe('');
        neutral.unmount();

        const toned = renderBody({ colorPalette: 'oceano', sidebarTone: 'primary' });
        const aside = toned.container.querySelector('aside') as HTMLElement;
        expect(aside.style.getPropertyValue('--text-muted')).toBe('var(--sarak-sidebar-item-text-color)');
        expect(aside.style.getPropertyValue('--sarak-nav-active-color')).toBe('var(--sarak-sidebar-item-hover-text-color)');
    });

    it('papel neutral com paleta: nenhuma variável de texto é refeita', () => {
        const { container } = renderBody({ colorPalette: 'oceano', sidebarTone: 'neutral' });
        expect((container.querySelector('aside') as HTMLElement).style.getPropertyValue('--text-muted')).toBe('');
    });
});
