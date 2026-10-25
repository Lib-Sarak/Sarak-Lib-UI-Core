import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakFilterBar } from '../SarakFilterBar';

describe('SarakFilterBar', () => {
    it('groups filter controls and clears them on request', () => {
        const onClear = vi.fn();
        render(
            <SarakFilterBar
                ariaLabel="Record filters"
                clearFilters={{ label: 'Clear filters', onClick: onClear }}
            >
                <span>Search controls</span>
            </SarakFilterBar>,
        );

        expect(screen.getByRole('group', { name: 'Record filters' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
        expect(onClear).toHaveBeenCalledOnce();
    });
});
