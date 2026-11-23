import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { CollapsibleSection, ForceOpenSections } from '../CollapsibleSection';

describe('CollapsibleSection', () => {
    it('abre fechada, sem desenhar o conteúdo, e o título (um botão dentro do h3) abre e fecha', () => {
        render(<CollapsibleSection title="Cantos" toggleId="corners"><p>amostras</p></CollapsibleSection>);
        const toggle = screen.getByRole('button', { name: 'Cantos' });
        expect(screen.getByRole('heading', { level: 3 })).toContainElement(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText('amostras')).toBeNull();

        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('amostras')).toBeInTheDocument();
        fireEvent.click(toggle);
        expect(screen.queryByText('amostras')).toBeNull();
    });

    it('controlada: quem agrupa decide o estado e recebe o clique', () => {
        const onToggle = vi.fn();
        render(<CollapsibleSection title="Cantos" toggleId="corners" open onToggle={onToggle}><p>amostras</p></CollapsibleSection>);
        expect(screen.getByText('amostras')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Cantos' }));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('a busca de token força todas abertas, mesmo as fechadas', () => {
        render(<ForceOpenSections.Provider value><CollapsibleSection title="Cantos" toggleId="corners" open={false}><p>amostras</p></CollapsibleSection></ForceOpenSections.Provider>);
        expect(screen.getByText('amostras')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cantos' })).toHaveAttribute('aria-expanded', 'true');
    });
});
