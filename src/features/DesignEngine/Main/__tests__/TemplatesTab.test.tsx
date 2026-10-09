import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemplatesTab } from '../TemplatesTab';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';

vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn()
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Terminal: () => <div data-testid="icon-terminal" />,
    FileJson: () => <div data-testid="icon-filejson" />,
    Check: () => <div data-testid="icon-check" />,
    Copy: () => <div data-testid="icon-copy" />,
    Code: () => <div data-testid="icon-code" />,
    ExternalLink: () => <div data-testid="icon-externallink" />
}));

describe('TemplatesTab', () => {
    const mockSarakUI = {
        allThemes: [
            { id: 'theme1', name: 'Theme 1', description: 'Desc 1', design: { mode: 'dark' } },
            { id: 'theme2', name: 'Theme 2', description: 'Desc 2', design: { mode: 'light' } }
        ],
        applyFullConfig: vi.fn(),
        setResolvedThemeId: vi.fn(),
        persistDesign: vi.fn().mockResolvedValue(true),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useSarakUI as any).mockReturnValue(mockSarakUI);
    });

    it('mostra os temas e remove o guia de integração desatualizado', () => {
        render(<TemplatesTab onApplyFullTheme={vi.fn()} />);
        expect(screen.getByText('Templates &')).toBeInTheDocument();
        expect(screen.queryByText('Guia Rápido')).toBeNull();
        expect(screen.queryByText(/DesignProvider/)).toBeNull();
        expect(screen.getByText('Theme 1')).toBeInTheDocument();
        expect(screen.getByText('Theme 2')).toBeInTheDocument();
        expect(screen.getByText('Desc 1')).toBeInTheDocument();
        expect(screen.getByText('Desc 2')).toBeInTheDocument();
    });

    it('escolher um tema só encaminha o design e o id ao rascunho', () => {
        const onApplyFullTheme = vi.fn();
        render(<TemplatesTab onApplyFullTheme={onApplyFullTheme} />);

        fireEvent.click(screen.getAllByRole('button', { name: 'Escolher tema' })[0]);

        expect(onApplyFullTheme).toHaveBeenCalledWith({ mode: 'dark' }, 'theme1');
        expect(screen.getByRole('button', { name: 'Selecionado' })).toBeInTheDocument();
        expect(mockSarakUI.applyFullConfig).not.toHaveBeenCalled();
        expect(mockSarakUI.setResolvedThemeId).not.toHaveBeenCalled();
        expect(mockSarakUI.persistDesign).not.toHaveBeenCalled();
    });

    it('copia o tema e muda ícone', async () => {
        const mockClipboard = {
            writeText: vi.fn()
        };
        Object.assign(navigator, {
            clipboard: mockClipboard
        });

        render(<TemplatesTab onApplyFullTheme={vi.fn()} />);
        
        const copyButtons = screen.getAllByTestId('icon-copy');
        fireEvent.click(copyButtons[0]);

        expect(mockClipboard.writeText).toHaveBeenCalledWith(JSON.stringify({ mode: 'dark' }, null, 2));
    });
});
