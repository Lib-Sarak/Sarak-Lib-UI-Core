import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ShellLanguageSelector } from '../ShellLanguageSelector';
import '@testing-library/jest-dom';

describe('ShellLanguageSelector', () => {
    it('renderiza com variante horizontal', () => {
        render(<ShellLanguageSelector variant="horizontal" />);
        expect(screen.getByText('pt')).toBeInTheDocument();
    });

    it('abre e fecha o dropdown ao clicar no seletor horizontal', () => {
        render(<ShellLanguageSelector variant="horizontal" />);
        const button = screen.getByRole('button');
        
        // Abre o dropdown
        fireEvent.click(button);
        // O dropdown de linguagens deve estar no DOM
        expect(screen.getByText('English')).toBeInTheDocument();
    });
});
