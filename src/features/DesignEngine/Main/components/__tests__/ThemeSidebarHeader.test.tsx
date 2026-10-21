import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeSidebarHeader } from '../ThemeSidebarHeader';
import { TypographySchema } from '../../../../../core/Design/schema/typography';

const baseProps = () => ({
    viewMode: 'preview' as const,
    setViewMode: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    editMode: 'essential' as const,
    setEditMode: vi.fn()
});

describe('ThemeSidebarHeader', () => {
    it('mantém o título curto, busca, modos e um único botão Avançado', () => {
        render(<ThemeSidebarHeader {...baseProps()} />);

        expect(screen.getByText('Design')).toBeInTheDocument();
        expect(screen.queryByText('Design Engine')).toBeNull();
        expect(screen.getByPlaceholderText('Buscar token...')).toBeInTheDocument();
        expect(screen.getByRole('radiogroup', { name: 'Modo de edição' })).toBeInTheDocument();
        expect(screen.getAllByRole('radio')).toHaveLength(3);
        expect(screen.getByRole('button', { name: /Avançado/ })).toBeInTheDocument();
        for (const name of ['Preview', 'Catálogo', 'Templates', 'Buscar token (avançado)']) {
            expect(screen.queryByRole('button', { name })).toBeNull();
        }
        expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('usa escala com padrão de pelo menos 12 px nos rótulos e controles do cabeçalho', () => {
        render(<ThemeSidebarHeader {...baseProps()} />);

        const captionToken = TypographySchema.tokens.find(({ id }) => id === 'typeScaleCaption');
        expect(Number(captionToken?.defaultValue)).toBeGreaterThanOrEqual(12);
        expect(screen.getByPlaceholderText('Buscar token...').className).toContain('--sarak-type-scale-caption');
        expect(screen.getByText('Modo de edição').className).toContain('--sarak-type-scale-caption');
        expect(screen.getByText('Essencial').className).toContain('--sarak-type-scale-caption');
    });

    it('deixa dispositivo, empilhamento, exportação e aplicação fora do cabeçalho', () => {
        render(<ThemeSidebarHeader {...baseProps()} />);

        expect(screen.queryByRole('button', { name: 'Desktop' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Tablet' })).toBeNull();
        expect(screen.queryByRole('switch')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Exportar' })).toBeNull();
        expect(screen.queryByRole('button', { name: /Aplicar/ })).toBeNull();
    });

    it('escolher Busca por pilar no menu Avançado chama setViewMode com command-center', async () => {
        const user = userEvent.setup();
        const setViewMode = vi.fn();
        render(<ThemeSidebarHeader {...baseProps()} setViewMode={setViewMode} />);

        await user.click(screen.getByRole('button', { name: /Avançado/ }));
        await user.click(screen.getByRole('menuitem', { name: 'Busca por pilar' }));

        expect(setViewMode).toHaveBeenCalledWith('command-center');
    });

    it('seta para a direita muda a seleção do grupo de rádio', async () => {
        const user = userEvent.setup();
        const setEditMode = vi.fn();
        render(<ThemeSidebarHeader {...baseProps()} setEditMode={setEditMode} />);

        const selectedMode = screen.getByRole('radio', { name: 'Essencial' });
        selectedMode.focus();
        await user.keyboard('{ArrowRight}');

        expect(setEditMode).toHaveBeenCalledWith('complete');
    });

    it('mantém o mesmo input de busca ao trocar de modo', () => {
        const props = baseProps();
        const { rerender } = render(<ThemeSidebarHeader {...props} />);
        const searchInput = screen.getByPlaceholderText('Buscar token...');

        rerender(<ThemeSidebarHeader {...props} editMode="impact" />);

        expect(screen.getByPlaceholderText('Buscar token...')).toBe(searchInput);
    });
});
