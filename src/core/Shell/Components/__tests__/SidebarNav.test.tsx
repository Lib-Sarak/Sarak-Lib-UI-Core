import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SidebarNav } from '../SidebarNav';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';

const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...actual as any, motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> } };
});

vi.mock('../../../../components/atomic/Navigation/ShellSearchWidget', () => ({ ShellSearchWidget: () => <div data-testid="mock-search">Search</div> }));
vi.mock('../../../../components/atomic/Navigation/ShellThemeToggle', () => ({ ShellThemeToggle: () => <div data-testid="mock-theme">Theme</div> }));
vi.mock('../../../../components/atomic/Navigation/ShellLanguageSelector', () => ({ ShellLanguageSelector: () => <div data-testid="mock-lang">Lang</div> }));
vi.mock('../../../../components/atomic/Navigation/ShellUserWidget', () => ({ ShellUserWidget: () => <div data-testid="mock-user">User</div> }));
vi.mock('../IconRenderer', () => ({ IconRenderer: ({ name }: any) => <span>{name}</span> }));
vi.mock('../../../../components/atomic/Icon/SarakIcon', () => ({ SarakIcon: ({ name }: any) => <span>{name}</span> }));

describe('SidebarNav', () => {
    const defaultProps = {
        design: { systemName: 'Test System', searchPositionSidebar: 'top' },
        brand: { name: 'Test Brand' },
        user: {},
        toggleNav: vi.fn(),
        setIsSearchOpen: vi.fn(),
        activeModuleId: 'm1',
        setActiveModuleId: vi.fn(),
        groupedModules: {
            'Core': [{ id: 'm1', label: 'Module 1', icon: 'Home', status: 'online' }] as any
        },
        setIsNavVisible: vi.fn(),
        startResizing: vi.fn()
    };

    it('renderiza o sistema e módulos', () => {
        renderWithProvider(<SidebarNav {...defaultProps} />);
        expect(screen.getByText('Test System')).toBeInTheDocument();
        expect(screen.getByText('Module 1')).toBeInTheDocument();
        expect(screen.getByTestId('mock-search')).toBeInTheDocument();
        expect(screen.getByTestId('mock-theme')).toBeInTheDocument();
    });

    it('chama setActiveModuleId ao clicar em um módulo online', () => {
        renderWithProvider(<SidebarNav {...defaultProps} />);
        const btn = screen.getByRole('button', { name: /Module 1/i });
        fireEvent.click(btn);
        expect(defaultProps.setActiveModuleId).toHaveBeenCalledWith('m1');
    });

    // Spec 05 §2.4.
    describe('cor do item ativo, marcador, ruído, blur e sombra', () => {
        it('o item ativo NÃO carrega mais --theme-primary no texto — vence o `tone` do SarakMenuItem (--sarak-nav-active-color)', () => {
            renderWithProvider(<SidebarNav {...defaultProps} />);
            const activeBtn = screen.getByRole('button', { name: /Module 1/i });
            expect(activeBtn.className).not.toContain('text-[var(--theme-primary)]');
        });

        it('navActiveMarkerColor/navActiveMarkerGlow: o marcador do item ativo usa os tokens dedicados', () => {
            const { container } = renderWithProvider(<SidebarNav {...defaultProps} />);
            const marker = container.querySelector('[style*="nav-marker-color"]') as HTMLElement | null;
            expect(marker).not.toBeNull();
            expect(marker!.getAttribute('style')).toContain('var(--sarak-nav-marker-glow, 10)');
        });

        it('sidebarNoiseOpacity: a camada de ruído existe e, sem valor no tema, cai no default (0) — "não muda nada"', () => {
            const { container } = renderWithProvider(<SidebarNav {...defaultProps} />);
            const noiseLayer = container.querySelector('.mix-blend-overlay') as HTMLElement | null;
            expect(noiseLayer).not.toBeNull();
            expect(noiseLayer!.style.opacity).toBe('var(--sarak-sidebar-noise-opacity, 0)');
        });

        it('sidebarBlur/sidebarShadow chegam à sidebar por token, no lugar do shadow-2xl fixo', () => {
            const { container } = renderWithProvider(<SidebarNav {...defaultProps} />);
            const aside = container.querySelector('aside')!;
            expect(aside.getAttribute('style')).toContain('var(--sarak-sidebar-blur, 0px)');
            expect(aside.getAttribute('style')).toContain('var(--sarak-sidebar-shadow, 10px 0 30px rgba(0,0,0,0.5))');
            expect(aside.className).not.toContain('shadow-2xl');
        });
    });
});
