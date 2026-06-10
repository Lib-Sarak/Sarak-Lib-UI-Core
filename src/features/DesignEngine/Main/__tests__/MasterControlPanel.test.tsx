import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MasterControlPanel } from '../MasterControlPanel';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useDesignDraft } from '../../hooks/useDesignDraft';

// Mock dependencies
vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn()
}));

vi.mock('../../hooks/useDesignDraft', () => ({
    useDesignDraft: vi.fn()
}));

// Mock MASTER_DESIGN_MAP
vi.mock('../../../../core/Design/master-map', () => ({
    MASTER_DESIGN_MAP: {
        components: [
            {
                id: 'surfaces',
                label: 'Surfaces',
                tokens: [
                    { id: 'bg-primary', label: 'Background Primary', type: 'color', defaultValue: '#000' },
                    { id: 'padding-base', label: 'Base Padding', type: 'slider', defaultValue: 16 }
                ]
            },
            {
                id: 'typography',
                label: 'Typography',
                tokens: [
                    { id: 'font-primary', label: 'Primary Font', type: 'select', defaultValue: 'Inter', options: ['Inter', 'Roboto'] }
                ]
            }
        ]
    }
}));

describe('MasterControlPanel', () => {
    const mockUpdateDraft = vi.fn();
    const mockResetToken = vi.fn();
    const mockHandleApplyToSystem = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useSarakUI).mockReturnValue({} as any);

        vi.mocked(useDesignDraft).mockReturnValue({
            draft: { 'bg-primary': '#111' },
            isDirty: true,
            isComponentDirty: vi.fn(),
            updateDraft: mockUpdateDraft,
            handleApplyToSystem: mockHandleApplyToSystem,
            resetToken: mockResetToken
        } as any);
    });

    it('renderiza o painel de controle e carrega todos os tokens', () => {
        render(<MasterControlPanel />);
        
        expect(screen.getByText('Catálogo de')).toBeInTheDocument();
        expect(screen.getByText('Tokens')).toBeInTheDocument();

        // Verifica os tokens renderizados (label e ID)
        expect(screen.getByText('Background Primary')).toBeInTheDocument();
        expect(screen.getByText('bg-primary')).toBeInTheDocument();
        expect(screen.getByText('Base Padding')).toBeInTheDocument();
        expect(screen.getByText('padding-base')).toBeInTheDocument();
        expect(screen.getByText('Primary Font')).toBeInTheDocument();
        expect(screen.getByText('font-primary')).toBeInTheDocument();
    });

    it('filtra tokens pela barra de busca', () => {
        render(<MasterControlPanel />);
        
        const searchInput = screen.getByPlaceholderText('BUSCAR...');
        fireEvent.change(searchInput, { target: { value: 'Base Padding' } });

        expect(screen.getByText('Base Padding')).toBeInTheDocument();
        expect(screen.queryByText('Background Primary')).not.toBeInTheDocument();
        expect(screen.queryByText('Primary Font')).not.toBeInTheDocument();
    });

    it('filtra tokens pelas categorias de pilar', () => {
        render(<MasterControlPanel />);
        
        const typographyCategoryButton = screen.getByText('Typography');
        fireEvent.click(typographyCategoryButton);

        expect(screen.getByText('Primary Font')).toBeInTheDocument();
        expect(screen.queryByText('Background Primary')).not.toBeInTheDocument();
    });

    it('chama updateDraft ao alterar o valor de um token via input', () => {
        render(<MasterControlPanel />);
        
        // Encontra o input de color do bg-primary que usa o value '#111' (pois o draft tem isso)
        const colorInputs = screen.getAllByRole('textbox');
        // O primeiro textbox é a barra de busca. O segundo será o color do bg-primary.
        fireEvent.change(colorInputs[1], { target: { value: '#222' } });

        expect(mockUpdateDraft).toHaveBeenCalledWith('bg-primary', '#222');
    });

    it('chama resetToken ao clicar no botão de reset', () => {
        render(<MasterControlPanel />);
        
        // Há um botão de reset por token
        const resetButtons = screen.getAllByTitle('Reset');
        fireEvent.click(resetButtons[0]);

        expect(mockResetToken).toHaveBeenCalledWith('bg-primary');
    });
});
