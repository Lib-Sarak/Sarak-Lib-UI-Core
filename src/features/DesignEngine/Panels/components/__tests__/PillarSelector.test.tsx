import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PillarSelector } from '../PillarSelector';

describe('PillarSelector', () => {
    it('matches baseline snapshot', () => {
        const props = {
            searchQuery: '',
            activePillar: 'brand',
            setActivePillar: vi.fn(),
            setActiveSection: vi.fn(),
            pillarsWithDrafts: ['brand'],
            resetComponent: vi.fn(),
            filteredComponentsLength: 5
        };
        const { asFragment } = render(<PillarSelector {...props} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
