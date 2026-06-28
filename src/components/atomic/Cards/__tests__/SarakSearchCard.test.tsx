import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SarakSearchCard } from '../SarakSearchCard';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

vi.mock('../hooks/useCardLayoutStyles', () => ({
    useCardLayoutStyles: () => ({
        containerClass: 'mock-container',
        contentClass: 'mock-content',
        headerClass: 'mock-header',
        footerClass: 'mock-footer'
    })
}));

describe('SarakSearchCard (Characterization)', () => {
    it('matches snapshot before any removal', () => {
        const item = {
            id: '123'
        };

        const mapping = {};

        const { asFragment } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakSearchCard item={item} mapping={mapping} label="Test Search Label" />
            </SarakUIProvider>
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
