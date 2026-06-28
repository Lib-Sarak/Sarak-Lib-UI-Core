import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemePillarsList } from '../ThemePillarsList';

describe('ThemePillarsList', () => {
    it('matches snapshot', () => {
        const props = {
            pillars: [{ id: 'colors', title: 'Cores', icon: () => <div/>, index: 1 }],
            activePillarId: 'colors',
            setActivePillarId: vi.fn(),
            activeSectionId: 'colors-geral',
            setActiveSectionId: vi.fn(),
            groupedStructure: { colors: { Geral: [{ id: 'test_token', label: 'Test' }] } },
            isEssentialMode: false,
            dynamicEssentialTokens: new Set<string>(),
            isComponentDirty: vi.fn(() => false),
            resetComponent: vi.fn(),
            handleApplyComponent: vi.fn(),
            catalogMap: new Map(),
            draft: { test_token: '#000' },
            updateDraft: vi.fn(),
            previewDevice: 'desktop',
            setActivePreviewApp: vi.fn()
        };

        const FinalProps = props as unknown as React.ComponentProps<typeof ThemePillarsList>;
        const { container } = render(<ThemePillarsList {...FinalProps} />);
        expect(container).toMatchSnapshot();
    });
});
