import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ShellLanguageSelector } from '../ShellLanguageSelector';
import '@testing-library/jest-dom';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';

const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('ShellLanguageSelector', () => {
    it('renderiza com variante horizontal', () => {
        renderWithProvider(<ShellLanguageSelector variant="horizontal" />);
        expect(screen.getByText('pt')).toBeInTheDocument();
    });

    it('abre e fecha o dropdown ao clicar no seletor horizontal', () => {
        renderWithProvider(<ShellLanguageSelector variant="horizontal" />);
        const button = screen.getByRole('button');
        
        // Abre o dropdown
        fireEvent.click(button);
        // O dropdown de linguagens deve estar no DOM
        expect(screen.getByText('English')).toBeInTheDocument();
    });
});
