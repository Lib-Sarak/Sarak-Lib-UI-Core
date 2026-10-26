import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { ChromeTopbarBody } from '../ChromeTopbarBody';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';

const NAV = [{ label: 'Propostas', route: '/propostas' }];

const renderBody = (design: Record<string, unknown>, props: Partial<React.ComponentProps<typeof ChromeTopbarBody>> = {}) =>
    render(
        <SarakUIProvider config={design}>
            <ChromeTopbarBody nav={NAV} className="" rootStyle={{}} {...props}>
                <div>conteúdo</div>
            </ChromeTopbarBody>
        </SarakUIProvider>,
    );

describe('ChromeTopbarBody (tokens de cromo no modo topbar)', () => {
    it('layoutPadding chega aos quatro lados do conteúdo por token', () => {
        const { container } = renderBody({});
        const content = container.querySelector('[data-sarak-content]') as HTMLElement;
        expect(content.style.padding).toBe('var(--sarak-layout-padding, 16px)');
    });

    it('navbarLayout="hidden": a topbar some da tela (o token controla, não um bug)', () => {
        const { container } = renderBody({ navbarLayout: 'hidden' });
        expect(container.querySelector('header')!.className).toContain('hidden');
    });

    it('navbarLayout="sticky" (default): a topbar fica fixa no topo — comportamento de hoje', () => {
        const { container } = renderBody({});
        expect(container.querySelector('header')!.className).toContain('sticky');
    });

    it('navbarLayout="inline": a topbar rola com o conteúdo (relative)', () => {
        const { container } = renderBody({ navbarLayout: 'inline' });
        expect(container.querySelector('header')!.className).toContain('relative');
    });

    it('isNavHidden: a topbar usa a altura RECOLHIDA em vez da altura cheia', () => {
        const { container } = renderBody({ isNavHidden: true });
        const style = container.querySelector('header')!.getAttribute('style') ?? '';
        expect(style).toContain('var(--sarak-topbar-collapsed-height');
        expect(style).not.toContain('var(--sarak-topbar-height, 64px)');
    });

    it('isAutoHideEnabled: a topbar começa oculta e um sensor de borda aparece', () => {
        const { container } = renderBody({ isAutoHideEnabled: true });
        expect(container.querySelector('header')).toBeNull();
        expect(container.querySelector('.fixed.left-0.top-0')).not.toBeNull();
    });

    it('tabSectionMargin chega à margem da topbar por token', () => {
        const { container } = renderBody({});
        expect(container.querySelector('header')!.getAttribute('style')).toContain('var(--sarak-tab-section-margin');
    });
});

describe('ChromeTopbarBody — quem cede quando a barra aperta (o item de navegação nunca fica menor que o texto)', () => {
    it('a lista pede o tamanho do conteúdo e cede depois da busca; o grupo final é rígido', () => {
        const { container } = renderBody({}, { search: <div>buscar</div> });
        const navSlot = container.querySelector('[data-sarak-slot="nav"]') as HTMLElement;
        expect(navSlot.className).toContain('flex-[1_1_auto]');
        expect(navSlot.className).toContain('min-w-0');
        expect(navSlot.contains(container.querySelector('nav'))).toBe(true);
        // A busca encolhe 40 vezes mais que a lista (fator de encolhimento do flex): é a primeira a ceder.
        expect((container.querySelector('[data-sarak-slot="search"]') as HTMLElement).className).toContain('[flex-shrink:40]');
        expect((container.querySelector('header .ml-auto') as HTMLElement).className).toContain('shrink-0');
    });

    it('a barra de busca PADRÃO pede 16rem para o contêiner se medir e some abaixo de 10rem; a do consumidor só encolhe', () => {
        const own = renderBody({}, { search: <div>buscar</div> }).container;
        expect((own.querySelector('[data-sarak-slot="search"]') as HTMLElement).className).not.toContain('@container');
        const factory = renderBody({}).container;
        const slot = factory.querySelector('[data-sarak-slot="search"]') as HTMLElement;
        expect(slot.className).toContain('@container');
        expect(slot.className).toContain('w-64');
        expect(slot.className).toContain('@max-[10rem]:[&>*]:hidden');
    });

    it('com a barra recolhida (ícone) a busca não pede largura fixa', () => {
        const { container } = renderBody({ isNavHidden: true });
        const slot = container.querySelector('[data-sarak-slot="search"]') as HTMLElement;
        expect(slot.className).not.toContain('w-64');
    });
});

describe('ChromeTopbarBody — slot de busca (searchPositionTopbar)', () => {
    it('"center": a busca vem depois da navegação, num contêiner que toma o espaço livre e a centra; a navegação não o toma', () => {
        const { container } = renderBody({ searchPositionTopbar: 'center' }, { search: <div>buscar</div> });
        const centered = container.querySelector('[data-sarak-slot="search-center"]') as HTMLElement;
        expect(centered).not.toBeNull();
        expect(centered.className).toContain('flex-1');
        expect(centered.className).toContain('justify-center');
        expect(centered.querySelector('[data-sarak-slot="search"]')).not.toBeNull();
        const nav = container.querySelector('nav') as HTMLElement;
        expect(nav.className).not.toContain('flex-1');
        expect(nav.compareDocumentPosition(centered) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('"left" (padrão): a navegação toma o espaço livre e não há contêiner de centro', () => {
        const { container } = renderBody({ searchPositionTopbar: 'left' }, { search: <div>buscar</div> });
        expect(container.querySelector('[data-sarak-slot="search-center"]')).toBeNull();
        expect((container.querySelector('nav') as HTMLElement).className).toContain('flex-1');
    });

    it('"right": a busca aparece agrupada com o topbarEnd', () => {
        const { container } = renderBody(
            { searchPositionTopbar: 'right' },
            { search: <div>buscar</div>, endSlot: <div>ações</div> },
        );
        const slot = container.querySelector('[data-sarak-slot="search"]')!;
        const end = container.querySelector('[data-sarak-slot="topbarEnd"]')!;
        expect(slot.parentElement).toBe(end.parentElement);
    });

    it('"hidden": a busca NÃO aparece mesmo com conteúdo passado', () => {
        const { container } = renderBody({ searchPositionTopbar: 'hidden' }, { search: <div>buscar</div> });
        expect(container.querySelector('[data-sarak-slot="search"]')).toBeNull();
    });
});

describe('ChromeTopbarBody — widgets default', () => {
    it('sem `widgets`, os widgets de fábrica ficam oferecidos e o menu de preferências é montado', () => {
        const { container } = renderBody({});
        expect(container.querySelector('[data-sarak-slot="search"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-widget="collapse"]')).toBeNull();
        expect(container.querySelector('[data-sarak-widget="preferences-menu"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-widget="user-theme"]')).not.toBeNull();
        expect(container.querySelector('[aria-label="Notificações indisponíveis"]')).toHaveAttribute('aria-disabled', 'true');
    });

    it('tamanho da fonte, orientação e recolhimento ficam no menu de preferências por padrão', () => {
        renderBody({});
        fireEvent.click(screen.getByRole('button', { name: 'Preferências' }));
        expect(screen.getByText('Tamanho da fonte')).toBeInTheDocument();
        expect(screen.getByText('Navegação')).toBeInTheDocument();
        expect(screen.getByText('Recolher navegação')).toBeInTheDocument();
    });

    it('`widgets` desliga cada default isoladamente', () => {
        const { container } = renderBody({}, { widgets: { search: false, collapse: false, themeToggle: false, user: false } });
        expect(container.querySelector('[data-sarak-slot="search"]')).toBeNull();
        expect(container.querySelector('[data-sarak-widget="collapse"]')).toBeNull();
        expect(container.querySelector('[data-sarak-widget="user-theme"]')).toBeNull();
    });
});

// Spec 05 §2.4 — token que faltava nos dois cromos.
describe('ChromeTopbarBody — topbarNoiseOpacity (Spec 05 §2.4)', () => {
    it('a camada de ruído existe e, sem valor no tema, cai no default (0) — "não muda nada"', () => {
        const { container } = renderBody({});
        const noiseLayer = container.querySelector('.mix-blend-overlay') as HTMLElement | null;
        expect(noiseLayer).not.toBeNull();
        expect(noiseLayer!.style.opacity).toBe('var(--sarak-topbar-noise-opacity, 0)');
    });

    it('a marcação do item ativo (navActiveMarkerColor/Glow) também existe na topbar (horizontal)', () => {
        const { container } = renderBody({}, { activeRoute: '/propostas' });
        const marker = container.querySelector('[aria-hidden="true"].sarak-nav-marker-glow') as HTMLElement | null;
        expect(marker).not.toBeNull();
        expect(marker!.style.background).toBe('var(--sarak-nav-marker-color, #19e3f0)');
    });

    it('borda, blur e sombra da topbar chegam ao leitor e nenhum lado fica fixo em classe', () => {
        const { container } = renderBody({
            topbarBorderColor: '#334455',
            topbarBorderWidth: 2,
            topbarBorderStyle: 'dotted',
            topbarBorderSide: 'top',
            topbarBlur: 6,
            topbarShadow: '0 4px 16px rgba(0,0,0,0.25)',
        });
        const header = container.querySelector('header')!;
        const style = header.getAttribute('style') ?? '';
        expect(header.className).not.toContain('border-b');
        expect(style).toContain('border-top-width: var(--sarak-topbar-border-width, 1px)');
        expect(style).toContain('border-bottom-width: 0px');
        expect(style).toContain('border-style: dotted');
        expect(style).toContain('var(--sarak-topbar-blur, 0px)');
        expect(style).toContain('var(--sarak-topbar-shadow, none)');
    });

    it('o fundo gradiente ou a textura offline seguem o estilo declarado', () => {
        const gradient = renderBody({ topbarBackgroundStyle: 'gradient' }).container.querySelector('header')!;
        expect(gradient.getAttribute('style')).toContain('linear-gradient(135deg');
        const textured = renderBody({ topbarBackgroundStyle: 'texture' }).container;
        expect((textured.querySelector('.mix-blend-overlay') as HTMLElement).style.opacity).toBe('max(var(--sarak-topbar-noise-opacity, 0), 0.12)');
    });
});
