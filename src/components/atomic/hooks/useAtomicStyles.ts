import React from 'react';

import { SarakThemePayload } from '../../../core/Provider/types';

/**
 * Hook para centralizar e abstrair o cálculo de estilos dinâmicos baseados no Design Engine.
 * Evita poluição visual nos componentes e respeita a paridade com CSS Variables.
 */
export const useAtomicStyles = () => {
    const getButtonStyles = (
        design: SarakThemePayload | undefined, 
        variant: string, 
        isHovered: boolean
    ): React.CSSProperties => {
        const styleType = design?.btnStyleType || 'matte';
        const glowColor = design?.btnNeonGlowColor || 'var(--sarak-shadow-glow,rgba(59,130,246,0.5))';
        const blurAmount = design?.btnBackdropBlur || 0;

        const dynamicStyle: React.CSSProperties = {};
        
        if (styleType === 'neon') {
            const isPrimaryDanger = variant === 'primary' || variant === 'danger';
            
            if (isPrimaryDanger) {
                dynamicStyle.boxShadow = isHovered 
                    ? `0 0 20px ${glowColor}, inset 0 0 10px ${glowColor}`
                    : `0 0 10px ${glowColor}`;
                dynamicStyle.border = `1px solid ${glowColor}`;
                return dynamicStyle;
            }
            
            if (variant === 'secondary') {
                dynamicStyle.boxShadow = isHovered 
                    ? `0 0 15px ${glowColor}`
                    : `0 0 5px ${glowColor}`;
                dynamicStyle.border = `1px solid ${glowColor}`;
                dynamicStyle.backgroundColor = 'var(--sarak-btn-secondary-bg)';
                return dynamicStyle;
            }
            
            if (variant === 'ghost') {
                dynamicStyle.boxShadow = isHovered ? `0 0 15px ${glowColor}` : 'none';
                if (isHovered) {
                    dynamicStyle.textShadow = `0 0 8px ${glowColor}`;
                }
                return dynamicStyle;
            }
        } 
        
        if (styleType === 'frosted') {
            const isFrostedTarget = ['primary', 'secondary', 'danger', 'success', 'outline'].includes(variant);
            if (!isFrostedTarget) return dynamicStyle;
            
            if (blurAmount > 0) {
                dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
                dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
            }
            dynamicStyle.border = 'var(--color-theme-border, rgba(255,255,255,0.1)))';
            
            if (variant === 'primary' || variant === 'danger') {
                dynamicStyle.boxShadow = 'var(--sarak-dynamic-shadow, 0 4px 12px rgba(0,0,0,0.1)))';
            }
            
            if (variant === 'secondary') {
                dynamicStyle.backgroundColor = 'var(--sarak-btn-secondary-bg)';
            }
            return dynamicStyle;
        }

        return dynamicStyle;
    };

    const getInputStyles = (
        design: SarakThemePayload | undefined, 
        isFocused: boolean
    ): React.CSSProperties => {
        const borderType = design?.inputBorderType || 'solid';
        const shadowType = design?.inputShadow || 'none';
        const blurAmount = design?.inputBackdropBlur || 0;
        
        const borderColor = 'var(--sarak-input-border-color, var(--border-color,#334155))';
        const focusColor = 'var(--sarak-input-focus-border-color, var(--sarak-primary-color,#3b82f6))';

        const dynamicStyle: React.CSSProperties = {};
        
        const applyBorder: Record<string, () => void> = {
            'none': () => { dynamicStyle.border = 'none'; },
            'underline': () => {
                dynamicStyle.border = 'none';
                dynamicStyle.borderBottom = `2px solid ${isFocused ? focusColor : borderColor}`;
                dynamicStyle.borderRadius = '0px';
            },
            'dashed': () => {
                dynamicStyle.border = `2px dashed ${isFocused ? focusColor : borderColor}`;
            },
            'solid': () => {
                dynamicStyle.border = `1px solid ${isFocused ? focusColor : borderColor}`;
            }
        };

        const executeBorder = applyBorder[borderType] || applyBorder['solid'];
        executeBorder();

        if (isFocused && borderType !== 'underline' && borderType !== 'none') {
            dynamicStyle.boxShadow = `var(--color-theme-primary, #3b82f6)`;
        }

        if (shadowType === 'neumorphism') {
            if (!isFocused) {
                dynamicStyle.boxShadow = 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -5px -5px 10px rgba(255,255,255,0.05))';
            } else {
                dynamicStyle.boxShadow = `0 0 0 2px var(--color-theme-primary, #3b82f6), inset -2px -2px 5px rgba(255,255,255,0.05)), var(--color-theme-primary, #3b82f6)`;
            }
        } 
        
        if (shadowType !== 'none' && shadowType !== 'neumorphism' && !isFocused) {
            dynamicStyle.boxShadow = shadowType;
        }

        if (blurAmount > 0) {
            dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
            dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
        }

        return dynamicStyle;
    };

    const getSwitchStyles = (
        design: SarakThemePayload | undefined,
        checked: boolean
    ) => {
        const activeBg = 'var(--sarak-switch-active-bg, var(--sarak-primary-color,#3b82f6))';
        const thumbBg = 'var(--sarak-switch-thumb, #ffffff)';
        const blurAmount = design?.switchBackdropBlur || 4;
        const styleType = design?.switchStyleType || 'tactile';

        const trackStyle: React.CSSProperties = {
            backgroundColor: checked ? activeBg : 'var(--color-theme-card, rgba(255,255,255,0.1)))',
        };

        if (blurAmount > 0) {
            trackStyle.backdropFilter = `blur(${blurAmount}px)`;
            trackStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
        }

        if (styleType === 'glass') {
            trackStyle.backgroundColor = checked ? activeBg : 'var(--color-theme-card, rgba(255,255,255,0.1)))';
            trackStyle.border = 'var(--color-theme-border, rgba(255,255,255,0.1)))';
        }

        const thumbStyle: React.CSSProperties = {
            backgroundColor: thumbBg,
            transform: checked ? 'translateX(100%)' : 'translateX(0)',
        };

        return { trackStyle, thumbStyle };
    };

    return { getButtonStyles, getInputStyles, getSwitchStyles };
};
