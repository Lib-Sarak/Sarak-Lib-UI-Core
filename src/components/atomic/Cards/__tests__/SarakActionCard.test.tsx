import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SarakActionCard } from '../SarakActionCard';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

vi.mock('../hooks/useCardLayoutStyles', () => ({
    useCardLayoutStyles: () => ({
        containerClass: 'mock-container',
        contentClass: 'mock-content',
        headerClass: 'mock-header',
        footerClass: 'mock-footer'
    })
}));

describe('SarakActionCard (Characterization)', () => {
    it('matches snapshot before any removal', () => {
        const item = {
            id: '123',
            title: 'Action Item',
            desc: 'Action description',
            cost: {
                in: 0.5,
                out: 1.5
            },
            context: 8000,
            tokenizer: 'cl100k_base'
        };

        const mapping = {
            title: 'title',
            subtitle: 'id',
            description: 'desc',
            price_in: 'cost.in',
            price_out: 'cost.out',
            context: 'context',
            tokenizer: 'tokenizer',
            icon: 'Activity'
        };

        const { asFragment } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakActionCard item={item} mapping={mapping} label="Test Action Label" />
            </SarakUIProvider>
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
