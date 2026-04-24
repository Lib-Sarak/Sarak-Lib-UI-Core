import { useMemo } from 'react';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';

export const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
};

export const useEChartsTheme = () => {
    const { design } = useSarakUI();
    const { primaryColor, mode, bodyFont } = design || {};
    const isDark = mode === 'dark';
    
    const primaryRGB = hexToRgb(primaryColor || '#3b82f6');
    const secondaryColor = '#8b5cf6';
    const secondaryRGB = hexToRgb(secondaryColor);

    const baseOption = useMemo(() => ({
        backgroundColor: 'transparent',
        color: [primaryColor, secondaryColor, '#10b981', '#f59e0b', '#ef4444'],
        tooltip: {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            borderRadius: 16,
            backdropFilter: 'blur(12px)',
            textStyle: { color: isDark ? '#f8fafc' : '#0f172a', fontSize: 11, fontFamily: bodyFont || 'Inter' },
            padding: [12, 18],
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 15,
            extraCssText: 'box-shadow: 0 0 20px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.05);'
        },
        grid: {
            top: 40,
            bottom: 30,
            left: 20,
            right: 20,
            containLabel: true
        },
        animationDuration: 2500,
        animationEasing: 'elasticOut'
    }), [primaryColor, isDark, bodyFont, secondaryColor]);

    return {
        baseOption,
        primaryColor,
        primaryRGB,
        secondaryColor,
        secondaryRGB,
        isDark,
        bodyFont,
        headingFont: design?.headingFont
    };
};
