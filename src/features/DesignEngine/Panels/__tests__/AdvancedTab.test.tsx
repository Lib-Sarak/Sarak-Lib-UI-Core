import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdvancedTab } from '../AdvancedTab';

vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn(() => ({
        systemId: 'TEST-SYSTEM',
        isHydrated: true,
        registeredModules: [],
        applyConfig: vi.fn()
    }))
}));

vi.mock('../../../../core/Discovery/registry', () => ({
    getRegisteredModules: vi.fn(() => [])
}));

describe('AdvancedTab', () => {
    it('matches baseline snapshot', () => {
        const { asFragment } = render(<AdvancedTab />);
        expect(asFragment()).toMatchSnapshot();
    });
});
