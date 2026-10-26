import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakPageHeader } from '../SarakPageHeader';

describe('SarakPageHeader', () => {
    it('renders one page heading with its subtitle', () => {
        render(<SarakPageHeader title="Records" subtitle="Manage the records" />);

        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
        expect(screen.getByRole('heading', { name: 'Records' })).toBeInTheDocument();
        expect(screen.getByText('Manage the records')).toBeInTheDocument();
    });

    it('uses the skeleton while loading', () => {
        render(<SarakPageHeader title="Records" loading loadingLabel="Loading page" />);

        expect(screen.getByRole('status', { name: 'Loading page' })).toHaveAttribute('aria-busy', 'true');
        expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });
});
