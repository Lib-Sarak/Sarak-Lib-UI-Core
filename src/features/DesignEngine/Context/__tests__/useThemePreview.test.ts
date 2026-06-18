import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useThemePreview } from '../useThemePreview';

describe('useThemePreview', () => {
    it('should initialize state with default parameters', () => {
        const { result } = renderHook(() => 
            useThemePreview(
                'glass', 
                'standard', 
                'none', 
                '#000', 
                '1', 
                'sidebar', 
                250, 
                [], 
                { GLASS: { name: 'Glass Native', animation: 'bounce', emoji: 'flat' } }
            )
        );

        expect(result.current.previewLayoutId).toBe('glass');
        expect(result.current.previewAnimationStyle).toBe('standard');
        expect(result.current.previewNavigationStyle).toBe('sidebar');
    });

    it('should sync local preview when previewLayoutId matches a layout', () => {
        const customThemes = [{ id: '123', name: 'My Custom Theme', config: { color: 'blue' }, animationStyle: 'smooth', emojiSet: '3d' }];
        
        const { result } = renderHook(() => 
            useThemePreview(
                'custom-123', 
                'standard', 
                'none', 
                '#000', 
                '1', 
                'sidebar', 
                250, 
                customThemes, 
                {}
            )
        );

        // It should find the custom theme and update themeName, config, etc.
        expect(result.current.themeName).toBe('My Custom Theme');
        expect(result.current.config).toEqual({ color: 'blue' });
        expect(result.current.previewAnimationStyle).toBe('smooth');
    });

    it('should handle config changes explicitly', () => {
        const { result } = renderHook(() => 
            useThemePreview('', '', '', '', '', 'sidebar', 250, [], {})
        );

        act(() => {
            result.current.handleConfigChange('backgroundColor', '#111');
        });

        expect(result.current.config).toBeDefined();
        expect(result.current.config.backgroundColor).toBe('#111');
    });
});
