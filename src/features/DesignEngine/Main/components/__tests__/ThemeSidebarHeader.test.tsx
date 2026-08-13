import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeSidebarHeader } from '../ThemeSidebarHeader';

describe('ThemeSidebarHeader', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ThemeSidebarHeader).toBeDefined();
    });

    const baseProps = () => ({
        viewMode: 'preview' as const,
        setViewMode: vi.fn(),
        isDirty: false,
        setIsSaveModalOpen: vi.fn(),
        previewDevice: 'desktop' as const,
        setPreviewDevice: vi.fn(),
        searchQuery: '',
        setSearchQuery: vi.fn(),
        isEssentialMode: true,
        setIsEssentialMode: vi.fn(),
        isPreviewStacked: false,
        setIsPreviewStacked: vi.fn(),
        handleApplyGlobalChanges: vi.fn()
    });

    // plan-37: o switch dizia "Modo Avançado (Hyper-Granular)" com a posição LIGADA
    // correspondendo a !isEssentialMode — comunicava o oposto do estado Essencial.
    it('plan-37: rotula o switch como "Modo Essencial" quando isEssentialMode=true, com aria-checked coerente', () => {
        render(<ThemeSidebarHeader {...baseProps()} isEssentialMode={true} />);

        expect(screen.getByText('Modo Essencial')).toBeDefined();
        expect(screen.getByRole('switch', { name: /Modo Essencial ativo/i })).toHaveAttribute('aria-checked', 'true');
    });

    it('plan-37: rotula o switch como "Modo Avançado" quando isEssentialMode=false, com aria-checked coerente', () => {
        render(<ThemeSidebarHeader {...baseProps()} isEssentialMode={false} />);

        expect(screen.getByText('Modo Avançado')).toBeDefined();
        expect(screen.getByRole('switch', { name: /Modo Avançado ativo/i })).toHaveAttribute('aria-checked', 'false');
    });

    // plan-37: o HyperGranularityTab (Command Center) ganha entrada própria e nomeada no
    // seletor de viewMode, separada do toggle Essencial/Avançado.
    it('plan-37: expõe um botão nomeado "Buscar token (avançado)" para o Command Center', () => {
        render(<ThemeSidebarHeader {...baseProps()} />);

        expect(screen.getByTitle('Buscar token (avançado)')).toBeDefined();
    });

    it('plan-37: clicar no botão do Command Center chama setViewMode("command-center")', () => {
        const setViewMode = vi.fn();
        render(<ThemeSidebarHeader {...baseProps()} setViewMode={setViewMode} />);

        screen.getByTitle('Buscar token (avançado)').click();

        expect(setViewMode).toHaveBeenCalledWith('command-center');
    });

    // plan-37 (correção, achado 1): o role="switch" tinha sido posto num <div> sem
    // tabIndex/onKeyDown — leitor de tela anunciava "switch" que nenhum teclado alcançava.
    // O conserto é um <input type="checkbox" role="switch"> real, visualmente oculto
    // (padrão de src/components/atomic/Inputs/SarakSwitch.tsx) — Espaço alterna nativamente.
    it('plan-37 (correção): Espaço alterna o switch Essencial/Avançado — é um <input> real e focável', async () => {
        const user = userEvent.setup();
        const setIsEssentialMode = vi.fn();
        render(<ThemeSidebarHeader {...baseProps()} isEssentialMode={true} setIsEssentialMode={setIsEssentialMode} />);

        const toggle = screen.getByRole('switch', { name: /Modo Essencial ativo/i });
        expect(toggle.tagName).toBe('INPUT');

        toggle.focus();
        expect(toggle).toHaveFocus();

        await user.keyboard(' ');

        expect(setIsEssentialMode).toHaveBeenCalledWith(false);
    });

    it('plan-37 (correção): Espaço alterna o switch "Empilhar Previews" — mesma estrutura do irmão', async () => {
        const user = userEvent.setup();
        const setIsPreviewStacked = vi.fn();
        render(<ThemeSidebarHeader {...baseProps()} isPreviewStacked={false} setIsPreviewStacked={setIsPreviewStacked} />);

        const toggle = screen.getByRole('switch', { name: /Empilhar Previews inativo/i });
        expect(toggle.tagName).toBe('INPUT');

        toggle.focus();
        await user.keyboard(' ');

        expect(setIsPreviewStacked).toHaveBeenCalledWith(true);
    });
});
