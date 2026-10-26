import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { CategoryLabel, Section } from '../LayoutControls';

describe('LayoutControls', () => {
    it('oferece descarte do pilar e não mostra ação de aplicar individual', () => {
        const onReset = vi.fn();
        render(
            <CategoryLabel
                icon={() => <span />}
                title="Cores"
                index={1}
                isOpen={false}
                onToggle={vi.fn()}
                isDirty
                onReset={onReset}
                onApply={vi.fn()}
                pillarId="colors"
            />
        );

        const discardButton = screen.getByRole('button', { name: 'Descartar alterações deste pilar' });
        fireEvent.click(discardButton);

        expect(screen.getByText('Cores')).toHaveClass('text-[var(--color-theme-title,CanvasText)]');
        expect(onReset).toHaveBeenCalledOnce();
        expect(screen.queryByText('Commit Cores')).not.toBeInTheDocument();
    });

    it('mantém o título da seção legível tanto fechada quanto aberta', () => {
        const { rerender } = render(
            <Section id="colors" icon={() => <span />} title="Marca e cores" activeSection={null} onToggle={vi.fn()}>
                <span>Conteúdo</span>
            </Section>,
        );

        expect(screen.getByText('Marca e cores')).toHaveClass('text-[var(--color-theme-title,CanvasText)]');

        rerender(
            <Section id="colors" icon={() => <span />} title="Marca e cores" activeSection="colors" onToggle={vi.fn()}>
                <span>Conteúdo</span>
            </Section>,
        );

        expect(screen.getByText('Marca e cores')).toHaveClass('text-[var(--color-theme-title,CanvasText)]');
    });
});
