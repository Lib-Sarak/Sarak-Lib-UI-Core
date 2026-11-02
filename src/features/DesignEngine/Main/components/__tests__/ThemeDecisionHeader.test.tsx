import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ThemeDecisionHeader } from '../ThemeDecisionHeader';

describe('ThemeDecisionHeader', () => {
    it('o título recebe o foco ao entrar, e voltar é um botão com nome acessível', () => {
        const onBack = vi.fn();
        render(<ThemeDecisionHeader title="Fontes" onBack={onBack} />);

        expect(screen.getByRole('heading', { level: 2, name: 'Fontes' })).toHaveFocus();
        fireEvent.click(screen.getByRole('button', { name: 'Voltar para a lista de decisões' }));
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('só oferece descartar a decisão quando ela tem mudança de rascunho', () => {
        const onDiscard = vi.fn();
        const { rerender } = render(<ThemeDecisionHeader title="Cores" onBack={vi.fn()} onDiscard={onDiscard} isDirty={false} />);
        expect(screen.queryByRole('button', { name: 'Descartar alterações desta decisão' })).toBeNull();

        rerender(<ThemeDecisionHeader title="Cores" onBack={vi.fn()} onDiscard={onDiscard} isDirty />);
        fireEvent.click(screen.getByRole('button', { name: 'Descartar alterações desta decisão' }));
        expect(onDiscard).toHaveBeenCalledTimes(1);
    });
});
