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
const renderMobile = (ui: React.ReactElement) => render(<SarakUIProvider config={{ mode: 'dark' }}>{ui}</SarakUIProvider>);
const base = { rootStyle: { minHeight: '100dvh' } };

describe('SarakAppChromeMobile (Spec 40.3 — L1, drawer atrás de hambúrguer)', () => {
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
