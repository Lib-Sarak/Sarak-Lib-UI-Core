import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakSegmentedControl } from '../SarakSegmentedControl';

describe('SarakSegmentedControl', () => {
    it('selects options with arrow keys and skips disabled options', () => {
        const onValueChange = vi.fn();
        render(
            <SarakSegmentedControl
                ariaLabel="Record status"
                defaultValue="all"
                onValueChange={onValueChange}
                options={[
                    { value: 'all', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'archived', label: 'Archived', disabled: true },
                ]}
            />,
        );

        const allOption = screen.getByRole('radio', { name: 'All' });
        const activeOption = screen.getByRole('radio', { name: 'Active' });
        screen.getAllByRole('radio').forEach((option) => {
            expect(option.style.minHeight).toBe('var(--sarak-touch-target-min, 44px)');
        });
        fireEvent.keyDown(allOption, { key: 'ArrowRight' });

        expect(activeOption).toHaveAttribute('aria-checked', 'true');
        expect(activeOption).toHaveFocus();
        expect(onValueChange).toHaveBeenCalledWith('active');
    });

    it('keeps a controlled value under caller control', () => {
        const onValueChange = vi.fn();
        render(
            <SarakSegmentedControl
                ariaLabel="Record status"
                value="all"
                onValueChange={onValueChange}
                options={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }]}
            />,
        );

        fireEvent.click(screen.getByRole('radio', { name: 'Active' }));

        expect(onValueChange).toHaveBeenCalledWith('active');
        expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true');
    });
});
