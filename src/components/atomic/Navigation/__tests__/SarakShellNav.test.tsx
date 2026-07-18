import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakShellNav, type ShellNavItem } from '../SarakShellNav';
import { DesignOverrideContext } from '../../../../core/Provider/SarakUIProvider';

const ITEMS: ShellNavItem[] = [
    { label: 'Contratos', route: '/contratos' },
    { label: 'Relatórios', route: '/relatorios', category: 'Análise' },
    { label: 'Personalização', route: '/design', category: 'Sistema' },
];

describe('SarakShellNav — navegação de shell guiada por dados (Spec 33)', () => {
    it('renderiza itens, grupos por categoria e a marca', () => {
        render(<SarakShellNav items={ITEMS} brand={{ name: 'Earendel' }} />);
        expect(screen.getByText('Earendel')).toBeInTheDocument();
        expect(screen.getByText('Contratos')).toBeInTheDocument();
        expect(screen.getByText('Análise')).toBeInTheDocument();
        expect(screen.getByText('Sistema')).toBeInTheDocument();
    });

    it('destaca o item ativo via aria-current (estado vindo de {{$route}})', () => {
        render(<SarakShellNav items={ITEMS} activeRoute="/relatorios" />);
        const active = screen.getByRole('button', { name: 'Relatórios' });
        expect(active).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('button', { name: 'Contratos' })).not.toHaveAttribute('aria-current');
    });

    it('emite a rota por onChange (caminho manifesto/$event) e onNavigate (caminho TSX)', () => {
        const onChange = vi.fn();
        const onNavigate = vi.fn();
        render(<SarakShellNav items={ITEMS} onChange={onChange} onNavigate={onNavigate} />);
        fireEvent.click(screen.getByRole('button', { name: 'Contratos' }));
        expect(onChange).toHaveBeenCalledWith('/contratos');
        expect(onNavigate).toHaveBeenCalledWith('/contratos');
    });

    it('não quebra com lista vazia', () => {
        render(<SarakShellNav items={[]} />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    describe('orientation (Spec 18)', () => {
        it('default (sem Provider) é vertical — flexDirection column', () => {
            render(<SarakShellNav items={ITEMS} />);
            expect(screen.getByRole('navigation').style.flexDirection).toBe('column');
        });

        it('orientation="horizontal" põe o menu em linha (flexDirection row)', () => {
            render(<SarakShellNav items={ITEMS} orientation="horizontal" />);
            const nav = screen.getByRole('navigation');
            expect(nav.style.flexDirection).toBe('row');
            // Itens continuam presentes e clicáveis.
            expect(screen.getByRole('button', { name: 'Contratos' })).toBeInTheDocument();
        });

        it('auto + design.navigationStyle="topbar" → horizontal (paridade MyService)', () => {
            render(
                <DesignOverrideContext.Provider value={{ navigationStyle: 'topbar' }}>
                    <SarakShellNav items={ITEMS} orientation="auto" />
                </DesignOverrideContext.Provider>,
            );
            expect(screen.getByRole('navigation').style.flexDirection).toBe('row');
        });

        it('auto + navigationStyle desconhecido (dock) → vertical (fora do escopo)', () => {
            render(
                <DesignOverrideContext.Provider value={{ navigationStyle: 'dock' }}>
                    <SarakShellNav items={ITEMS} orientation="auto" />
                </DesignOverrideContext.Provider>,
            );
            expect(screen.getByRole('navigation').style.flexDirection).toBe('column');
        });
    });
});
