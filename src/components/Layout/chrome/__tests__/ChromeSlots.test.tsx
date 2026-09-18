import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { ChromeBrand, ChromeDecoration, ChromeSidebarSlot, ChromeStrip, ChromeTopbarSlot } from '../ChromeSlots';

describe('ChromeSlots (Spec 48 — L1, regiões de slot do cromo)', () => {
    it('AUSENTE = não renderiza a região (nenhum espaço morto)', () => {
        const { container } = render(
            <div>
                <ChromeDecoration />
                <ChromeStrip region="banner" />
                <ChromeStrip region="footer" />
                <ChromeSidebarSlot region="header" />
                <ChromeSidebarSlot region="footer" />
                <ChromeTopbarSlot region="start" />
                <ChromeTopbarSlot region="end" />
                <ChromeBrand />
            </div>,
        );
        expect(container.firstElementChild?.children.length).toBe(0);
    });

    it('cada região carrega a âncora `data-sarak-slot` correspondente', () => {
        const { container } = render(
            <div>
                <ChromeDecoration><span>d</span></ChromeDecoration>
                <ChromeStrip region="banner"><span>b</span></ChromeStrip>
                <ChromeStrip region="footer"><span>f</span></ChromeStrip>
                <ChromeSidebarSlot region="header"><span>sh</span></ChromeSidebarSlot>
                <ChromeSidebarSlot region="footer"><span>sf</span></ChromeSidebarSlot>
                <ChromeTopbarSlot region="start"><span>ts</span></ChromeTopbarSlot>
                <ChromeTopbarSlot region="end"><span>te</span></ChromeTopbarSlot>
            </div>,
        );
        for (const slot of ['decoration', 'banner', 'footer', 'sidebarHeader', 'sidebarFooter', 'topbarStart', 'topbarEnd']) {
            expect(container.querySelector(`[data-sarak-slot="${slot}"]`)).not.toBeNull();
        }
    });

    it('ChromeDecoration é ornamento: aria-hidden + sem foco/toque, atrás do conteúdo', () => {
        const { container } = render(<ChromeDecoration><span>arte</span></ChromeDecoration>);
        const deco = container.querySelector('[data-sarak-slot="decoration"]') as HTMLElement;
        expect(deco).toHaveAttribute('aria-hidden', 'true');
        expect(deco.style.pointerEvents).toBe('none');
        expect(deco.style.position).toBe('absolute');
        expect(deco.style.zIndex).toBe('0');
    });

    it('ChromeStrip é full-width e comprimível (refluxo mobile, zero overflow)', () => {
        const { container } = render(<ChromeStrip region="banner"><span>b</span></ChromeStrip>);
        const strip = container.firstElementChild as HTMLElement;
        expect(strip.className).toContain('w-full');
        expect(strip.className).toContain('min-w-0');
        expect(strip.className).toContain('shrink-0');
    });

    it('ChromeSidebarSlot mede por TOKEN (zero hardcode)', () => {
        const { container } = render(<ChromeSidebarSlot region="header"><span>x</span></ChromeSidebarSlot>);
        expect((container.firstElementChild as HTMLElement).getAttribute('style')).toContain('var(--sarak-layout-gap-sm');
    });

    it('ChromeBrand: o slot `logo` tem precedência sobre brand.logoUrl', () => {
        const { container } = render(
            <ChromeBrand brand={{ name: 'ERP', logoUrl: '/estatico.png' }} logo={<span>◆</span>} />,
        );
        expect(container.querySelector('[data-sarak-slot="logo"]')).not.toBeNull();
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText('ERP')).toBeInTheDocument();
    });

    it('ChromeBrand sem `logo` mantém a imagem do brand (compat) e o título por token', () => {
        const { container } = render(<ChromeBrand brand={{ name: 'ERP', logoUrl: '/estatico.png' }} />);
        expect(container.querySelector('img[src="/estatico.png"]')).not.toBeNull();
        expect(screen.getByText('ERP').getAttribute('style')).toContain('var(--sarak-topbar-title-color');
    });

    it('ChromeBrand renderiza só com o slot `logo` (sem brand nenhum)', () => {
        const { container } = render(<ChromeBrand logo={<span>◆</span>} />);
        expect(container.querySelector('[data-sarak-slot="logo"]')).not.toBeNull();
    });

    // Spec 05 §2.4 — tokens que só faltavam no SarakAppChrome.
    describe('ChromeBrand — sidebarLabelMaxWidth/topbarLabelMaxWidth (duas direções: vertical × horizontal)', () => {
        it('vertical (sidebar): o título trunca por `sidebarLabelMaxWidth`', () => {
            const { container } = render(<ChromeBrand brand={{ name: 'ERP' }} />);
            expect(container.querySelector('span[style]')?.getAttribute('style')).toContain('var(--sarak-sidebar-label-max-width, 120px)');
        });

        it('horizontal (topbar): o título trunca por `topbarLabelMaxWidth` — largura DIFERENTE da vertical', () => {
            const { container } = render(<ChromeBrand brand={{ name: 'ERP' }} horizontal />);
            const style = container.querySelector('span[style]')?.getAttribute('style') ?? '';
            expect(style).toContain('var(--sarak-topbar-label-max-width, 150px)');
            expect(style).not.toContain('sidebar-label-max-width');
        });
    });

    describe('ChromeBrand — shellBrandLogoSize/brandLogoSizeCollapsed (duas direções: expandido × colapsado)', () => {
        it('expandido (compact ausente): a altura do logo vem de `shellBrandLogoSize`', () => {
            const { container } = render(<ChromeBrand brand={{ logoUrl: '/logo.png' }} />);
            expect(container.querySelector('img')?.getAttribute('style')).toContain('var(--sarak-shell-brand-logo-size, 32px)');
        });

        it('colapsado (compact): a altura vem de `brandLogoSizeCollapsed` — valor DIFERENTE do expandido', () => {
            const { container } = render(<ChromeBrand brand={{ logoUrl: '/logo.png' }} compact />);
            const style = container.querySelector('img')?.getAttribute('style') ?? '';
            expect(style).toContain('var(--sarak-brand-logo-size-collapsed, 20px)');
            expect(style).not.toContain('shell-brand-logo-size');
        });
    });
});
