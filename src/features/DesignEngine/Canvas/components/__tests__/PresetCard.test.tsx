import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../PresetCard';
import { PresetCard } from '../PresetCard';
import { ThemePreset } from '../../../../../core/Design/presets/themes';

describe('PresetCard', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('should render and match snapshot', () => {
        const dummyTheme = {
            id: 'test',
            name: 'Test Theme',
            design: {
                primaryColor: '#ff0000',
                surfaceColor: '#000000',
                mode: 'dark'
            }
        };
        const { container } = render(
            <PresetCard theme={dummyTheme as unknown as ThemePreset} currentMode="dark" onApply={() => {}} index={0} />
        );
        expect(container).toMatchSnapshot();
    });
});
