import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    it('título em texto primário com aceno de hover por mistura com a primária; subtítulo em texto secundário', () => {
        const item = { id: '123', name: 'Test Item', desc: 'Test description' };
        const mapping = { title: 'name', subtitle: 'id' };
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakTitleCard item={item} mapping={mapping} />
            </SarakUIProvider>,
        );

        const title = screen.getByRole('heading', { level: 4 });
        expect(title.className).toContain('text-[var(--sarak-card-title-color,var(--theme-text-primary,#f2f6fb))]');
        expect(title.className).toContain('group-hover:text-[color-mix(in_srgb,var(--sarak-primary-color,#19e3f0)_60%,var(--sarak-card-title-color,var(--theme-text-primary,#f2f6fb)))]');
        expect(title.style.color).toBe('');
        expect(screen.getByText('123').className).toContain('text-[var(--sarak-subtitle-color,var(--sarak-text-sec,rgba(242,246,251,0.72)))]');
    });

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
