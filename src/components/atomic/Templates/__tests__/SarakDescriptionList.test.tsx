import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakDescriptionList } from '../SarakDescriptionList';

describe('SarakDescriptionList', () => {
    it('pairs each term with its value in a description list', () => {
        const { container } = render(<SarakDescriptionList items={[{ label: 'Owner', value: 'Finance' }]} />);
        const descriptionList = container.querySelector('dl');

        expect(screen.getByRole('term')).toHaveTextContent('Owner');
        expect(screen.getByRole('definition')).toHaveTextContent('Finance');
        expect(descriptionList).toHaveClass('grid', 'sarak-description-list');
    });
});
