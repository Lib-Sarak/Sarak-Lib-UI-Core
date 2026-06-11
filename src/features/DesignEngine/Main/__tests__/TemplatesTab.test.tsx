import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
        persistDesign: vi.fn().mockResolvedValue(true)
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useSarakUI as any).mockReturnValue(mockSarakUI);
    });

    it('renderiza os guias e links', () => {
        render(<TemplatesTab />);
        expect(screen.getByText('Templates &')).toBeInTheDocument();
        expect(screen.getByText('Guia Rápido')).toBeInTheDocument();
        expect(screen.getByText('Copie o JSON abaixo.')).toBeInTheDocument();
        expect(screen.getByText('Theme 1')).toBeInTheDocument();
        expect(screen.getByText('Theme 2')).toBeInTheDocument();
    });

    it('chama applyFullConfig e persistDesign ao aplicar um tema', () => {
        render(<TemplatesTab />);
        
        const applyButtons = screen.getAllByText('Aplicar Tema');
        fireEvent.click(applyButtons[0]);

        expect(mockSarakUI.applyFullConfig).toHaveBeenCalledWith({ mode: 'dark' });
        expect(mockSarakUI.persistDesign).toHaveBeenCalledWith({ mode: 'dark' });
    });

    it('copia o tema e muda ícone', async () => {
        const mockClipboard = {
            writeText: vi.fn()
        };
        Object.assign(navigator, {
            clipboard: mockClipboard
        });

        render(<TemplatesTab />);
        
        const copyButtons = screen.getAllByTestId('icon-copy');
        fireEvent.click(copyButtons[0]);

        expect(mockClipboard.writeText).toHaveBeenCalledWith(JSON.stringify({ mode: 'dark' }, null, 2));
    });
});
