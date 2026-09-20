import React from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { RESPONSIVE_GRID_PRESETS, RESPONSIVE_SPACING_PRESETS, type ResponsiveGridPreset, type ResponsiveSpacingPreset } from './useStructuralStyles.presets';
import { resolveGap } from './useStructuralStyles.gap';

export const useResponsiveStyles = () => {
    const design = useSarakUIOptional()?.design;

    const getResponsiveSpacingStyles = (preset: ResponsiveSpacingPreset) => {
        return {
            className: RESPONSIVE_SPACING_PRESETS[preset]
        };
    };

    const getResponsiveStackStyles = (
        breakpoint: 'md' | 'lg' = 'md',
        gapOverride?: string
    ) => {
        const gap = resolveGap(gapOverride, design?.layoutGap || 'var(--sarak-layout-gap-md, 16px)', 'SarakStack');
        const stackBreakpointClasses: Record<'md' | 'lg', string> = {
            md: 'flex flex-col @min-[768px]:flex-row',
            lg: 'flex flex-col @min-[1024px]:flex-row'
        };

        return {
            className: stackBreakpointClasses[breakpoint],
            style: { gap } as React.CSSProperties
        };
    };

    return {
        getResponsiveSpacingStyles,
        getResponsiveStackStyles
    };
};
