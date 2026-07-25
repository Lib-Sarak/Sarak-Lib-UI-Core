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
});
