import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeSidebarContent } from '../ThemeSidebarContent';

describe('ThemeSidebarContent', () => {
    it('matches snapshot', () => {
        const props = {
            searchQuery: '',
            filteredResults: [],
            catalogMap: new Map(),
            draft: {},
            updateDraft: vi.fn(),
            previewDevice: 'desktop',
            viewMode: 'preview',
            activePillarId: 'global',
            setActivePillarId: vi.fn(),
            activeSectionId: 'global-preferences',
            setActiveSectionId: vi.fn(),
            isComponentDirty: vi.fn(() => false),
            resetComponent: vi.fn(),
            handleApplyComponent: vi.fn(),
            globalComponent: { tokens: [] },
            sarak: { branding: {}, updateBranding: vi.fn() },
            pillars: [],
            groupedStructure: {},
            isEssentialMode: false,
            dynamicEssentialTokens: new Set<string>(),
            setActivePreviewApp: vi.fn()
        };

        const FinalProps = props as unknown as React.ComponentProps<typeof ThemeSidebarContent>;
        const { container } = render(<ThemeSidebarContent {...FinalProps} />);
        expect(container).toMatchSnapshot();
    });
});
