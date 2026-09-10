import React from 'react';
import { render } from '@testing-library/react';
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
    it('sidebarPosition="right": a sidebar migra para o fim da linha (flex-row-reverse) e ganha border-l', () => {
        const { container } = renderBody({ sidebarPosition: 'right' });
        const row = container.querySelector('aside')!.parentElement!;
        expect(row.className).toContain('flex-row-reverse');
        expect(container.querySelector('aside')!.className).toContain('border-l');
    });

    it('sidebarPosition="left" (default): flex-row e border-r — comportamento de hoje', () => {
        const { container } = renderBody({});
        const row = container.querySelector('aside')!.parentElement!;
        expect(row.className).toContain('flex-row');
        expect(container.querySelector('aside')!.className).toContain('border-r');
    });

    it('contentAlignment="center": o conteúdo ganha largura máxima centralizada', () => {
        const { container } = renderBody({ contentAlignment: 'center' });
        expect(container.querySelector('main')!.className).toContain('max-w-7xl');
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

    it('tabSectionMargin chega à margem da sidebar por token', () => {
        const { container } = renderBody({});
        expect(container.querySelector('aside')!.getAttribute('style')).toContain('var(--sarak-tab-section-margin');
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

    it('"hidden": a busca NÃO aparece mesmo com conteúdo passado', () => {
        const { container } = render(
            <SarakUIProvider config={{ searchPositionSidebar: 'hidden' }}>
                <ChromeSidebarBody nav={NAV} className="" rootStyle={{}} search={<div>buscar</div>}>
                    <div>x</div>
                </ChromeSidebarBody>
            </SarakUIProvider>,
        );
        expect(container.querySelector('[data-sarak-slot="search"]')).toBeNull();
    });
});
