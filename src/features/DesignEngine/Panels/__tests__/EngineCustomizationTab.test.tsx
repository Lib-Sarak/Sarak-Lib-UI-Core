import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EngineCustomizationTab } from '../EngineCustomizationTab';

vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn(() => ({
        chatBubbleStyle: 'glass',
        chatAnimationSpeed: 0.05,
        flowGridStyle: 'dots',
        flowNodeRadius: 12,
        chartType: 'line',
        chartShowGrid: true,
        applyConfig: vi.fn()
    }));
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

describe('EngineCustomizationTab', () => {
    it('matches baseline snapshot', () => {
        const { asFragment } = render(<EngineCustomizationTab />);
        expect(asFragment()).toMatchSnapshot();
    });
});
