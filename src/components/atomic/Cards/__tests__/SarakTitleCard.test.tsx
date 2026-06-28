import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SarakTitleCard } from '../SarakTitleCard';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

vi.mock('../hooks/useCardLayoutStyles', () => ({
    useCardLayoutStyles: () => ({
        containerClass: 'mock-container',
        contentClass: 'mock-content',
        headerClass: 'mock-header',
        footerClass: 'mock-footer'
    })
}));

describe('SarakTitleCard (Characterization)', () => {
    it('matches snapshot before any removal', () => {
        const item = {
            id: '123',
            name: 'Test Item',
            desc: 'Test description',
            metrics: {
                tokens: 5000
            },
            features: ['vision', 'chat']
        };

        const mapping = {
            title: 'name',
            subtitle: 'id',
            context: 'metrics.tokens',
            input_caps: 'features',
            icon: 'Activity'
        };

        const { asFragment } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakTitleCard item={item} mapping={mapping} label="Test Label" />
            </SarakUIProvider>
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
