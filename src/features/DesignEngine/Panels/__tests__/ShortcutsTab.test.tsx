import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShortcutsTab } from '../ShortcutsTab';

vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn(() => ({
        shortcuts: [{ id: '1', keys: ['Ctrl', 'S'], description: 'Save', category: 'General' }],
        registeredActions: {},
        updateShortcut: vi.fn(),
        applyConfig: vi.fn()
    }));
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

describe('ShortcutsTab', () => {
    it('matches baseline snapshot', () => {
        const { asFragment } = render(<ShortcutsTab />);
        expect(asFragment()).toMatchSnapshot();
    });
});
