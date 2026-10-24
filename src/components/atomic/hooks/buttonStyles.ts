import type React from 'react';
import type { SarakThemePayload } from '../../../core/Provider/types';
import { neumorphismButtonShadow } from './neumorphismStyles';

export const CYBERPUNK_TEXT_COLORS: Readonly<Record<string, string>> = {
    primary: 'var(--sarak-primary-color, #19e3f0)',
    danger: 'var(--sarak-status-error-color, #ef4444)',
    success: 'var(--sarak-status-success-color, #10b981)',
};

const NEON_PULSE_VARIANTS = ['primary', 'danger', 'secondary'];

export const resolveNeonPulseClass = (
    design: SarakThemePayload | undefined,
    variant: string
): string => {
    if (design?.btnStyleType !== 'neon') return '';
    if (!NEON_PULSE_VARIANTS.includes(variant)) return '';
    return Number(design.btnNeonPulseSpeed) > 0 ? 'sarak-btn-neon-pulse' : '';
};

const getNeonButtonStyles = (variant: string, isHovered: boolean): React.CSSProperties => {
    const glowColor = 'var(--sarak-btn-neon-glow-color, rgba(25,227,240,0.4))';

    if (variant === 'primary' || variant === 'danger') {
        return {
            boxShadow: isHovered ? `0 0 20px ${glowColor}, inset 0 0 10px ${glowColor}` : `0 0 10px ${glowColor}`,
            border: `1px solid ${glowColor}`,
        };
    }
    if (variant === 'secondary') {
        return {
            boxShadow: isHovered ? `0 0 15px ${glowColor}` : `0 0 5px ${glowColor}`,
            border: `1px solid ${glowColor}`,
            backgroundColor: 'var(--sarak-btn-secondary-bg, rgba(255, 255, 255, 0.05))',
        };
    }
    if (variant === 'ghost') {
        return {
            boxShadow: isHovered ? `0 0 15px ${glowColor}` : 'none',
            ...(isHovered ? { textShadow: `0 0 8px ${glowColor}` } : {}),
        };
    }
    return {};
};

const getCyberpunkButtonStyles = (variant: string, isHovered: boolean): React.CSSProperties => {
    const glowColor = 'var(--sarak-btn-neon-glow-color, rgba(25,227,240,0.4))';
    const ownColor = CYBERPUNK_TEXT_COLORS[variant];

    return {
        backgroundColor: 'transparent',
        ...(ownColor ? { color: ownColor } : {}),
        border: `var(--sarak-border-width, 1px) solid ${glowColor}`,
        borderRadius: 0,
        boxShadow: isHovered ? `0 0 10px ${glowColor}` : 'none',
    };
};

const getFrostedButtonStyles = (
    design: SarakThemePayload | undefined,
    variant: string
): React.CSSProperties => {
    const isFrostedTarget = ['primary', 'secondary', 'danger', 'success', 'outline'].includes(variant);
    if (!isFrostedTarget) return {};

    const dynamicStyle: React.CSSProperties = {
        border: '1px solid var(--color-theme-border, rgba(255,255,255,0.09))',
    };
    const blurAmount = design?.btnBackdropBlur || 0;

    if (blurAmount > 0) {
        dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
        dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
    }
    if (variant === 'primary' || variant === 'danger') {
        dynamicStyle.boxShadow = 'var(--sarak-dynamic-shadow, 0 4px 12px rgba(0,0,0,0.1))';
    }
    if (variant === 'secondary') {
        dynamicStyle.backgroundColor = 'var(--sarak-btn-secondary-bg, rgba(255, 255, 255, 0.05))';
    }

    return dynamicStyle;
};

export const getButtonStyles = (
    design: SarakThemePayload | undefined,
    variant: string,
    isHovered: boolean
): React.CSSProperties => {
    const styleType = design?.btnStyleType || 'matte';

    if (styleType === 'neon') return getNeonButtonStyles(variant, isHovered);
    if (styleType === 'cyberpunk') return getCyberpunkButtonStyles(variant, isHovered);
    if (styleType === 'neumorphism') {
        return { border: 'none', boxShadow: neumorphismButtonShadow(isHovered) };
    }
    if (styleType === 'frosted') return getFrostedButtonStyles(design, variant);
    return {};
};

