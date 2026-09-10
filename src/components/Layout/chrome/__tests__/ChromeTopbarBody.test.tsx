import React from 'react';
import { render } from '@testing-library/react';
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

    it('contentAlignment="center": o conteúdo ganha largura máxima centralizada', () => {
        const { container } = renderBody({ contentAlignment: 'center' });
        expect(container.querySelector('main')!.className).toContain('max-w-7xl');
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

describe('ChromeTopbarBody — slot de busca (searchPositionTopbar)', () => {
    it('"center": a busca aparece centralizada na topbar', () => {
        const { container } = renderBody({ searchPositionTopbar: 'center' }, { search: <div>buscar</div> });
        const slot = container.querySelector('[data-sarak-slot="search"]');
        expect(slot).not.toBeNull();
        expect(slot?.className).toContain('mx-auto');
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
