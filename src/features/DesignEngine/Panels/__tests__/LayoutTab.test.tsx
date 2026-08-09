import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LayoutTab } from '../LayoutTab';

vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn(() => ({
        layoutDensity: 'standard',
        fontScale: 'p',
        navigationStyle: 'sidebar',
        sidebarWidth: 260,
        headingFont: 'Outfit',
        bodyFont: 'Inter',
        applyConfig: vi.fn()
    }));
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

describe('LayoutTab', () => {
    it('matches baseline snapshot', () => {
        const { asFragment } = render(<LayoutTab />);
        expect(asFragment()).toMatchSnapshot();
    });
});
