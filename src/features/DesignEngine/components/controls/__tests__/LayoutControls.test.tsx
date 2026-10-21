import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { CategoryLabel } from '../LayoutControls';

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

        expect(onReset).toHaveBeenCalledOnce();
        expect(screen.queryByText('Commit Cores')).not.toBeInTheDocument();
    });
});
