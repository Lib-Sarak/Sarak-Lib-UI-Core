import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakResourceRow } from '../SarakResourceRow';

describe('SarakResourceRow', () => {
    it('provides one row destination and separate keyboard-accessible actions', () => {
        const onAction = vi.fn();
        render(
            <SarakResourceRow
                title="Quarterly report"
                href="/reports/quarterly"
                badges={['Ready']}
                metadata={[{ label: 'Owner', value: 'Finance' }]}
                actions={[{ label: 'Open menu', onClick: onAction }]}
            />,
        );

        const destination = screen.getByRole('link', { name: 'Quarterly report' });
        expect(destination).toHaveAttribute('href', '/reports/quarterly');
        expect(destination.style.minHeight).toBe('var(--sarak-touch-target-min, 44px)');
        expect(screen.getByRole('article')).toBeInTheDocument();
        expect(screen.getByText('Ready')).toBeInTheDocument();
        const action = screen.getByRole('button', { name: 'Open menu' });
        expect(action.style.minHeight).toBe('var(--sarak-touch-target-min, 44px)');
        fireEvent.click(action);
        expect(onAction).toHaveBeenCalledOnce();
    });
});
