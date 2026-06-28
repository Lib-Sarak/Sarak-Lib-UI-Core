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
        const glowColor = design?.btnNeonGlowColor || 'var(--sx-color-primary-glow)';
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
            dynamicStyle.border = 'var(--sarak-btn-border-frosted, 1px solid rgba(255,255,255,0.1))';
            
            if (variant === 'primary' || variant === 'danger') {
                dynamicStyle.boxShadow = 'var(--sarak-btn-shadow-frosted, 0 8px 32px 0 rgba(0, 0, 0, 0.3))';
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
        
        const borderColor = 'var(--sarak-input-border-color, var(--sx-color-border-base))';
        const focusColor = 'var(--sarak-input-focus-border-color, var(--sx-color-primary-base))';

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
            dynamicStyle.boxShadow = `var(--sarak-input-focus-ring, 0 0 0 2px ${focusColor}33)`;
        }

        if (shadowType === 'neumorphism') {
            if (!isFocused) {
                dynamicStyle.boxShadow = 'var(--sarak-input-shadow-neumorphism, inset 5px 5px 10px rgba(0,0,0,0.5), inset -5px -5px 10px rgba(255,255,255,0.05))';
            } else {
                dynamicStyle.boxShadow = `var(--sarak-input-shadow-neumorphism-focus, inset 2px 2px 5px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(255,255,255,0.05)), var(--sarak-input-focus-ring, 0 0 0 2px ${focusColor}33)`;
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
        const activeBg = 'var(--sarak-switch-active-bg, var(--sx-color-primary-base))';
        const thumbBg = 'var(--sarak-switch-thumb, #ffffff)';
        const blurAmount = design?.switchBackdropBlur || 4;
        const styleType = design?.switchStyleType || 'tactile';

        const trackStyle: React.CSSProperties = {
            backgroundColor: checked ? activeBg : 'var(--sarak-switch-inactive-bg, rgba(255, 255, 255, 0.1))',
        };

        if (blurAmount > 0) {
            trackStyle.backdropFilter = `blur(${blurAmount}px)`;
            trackStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
        }

        if (styleType === 'glass') {
            trackStyle.backgroundColor = checked ? activeBg : 'var(--sarak-switch-inactive-glass, rgba(255, 255, 255, 0.05))';
            trackStyle.border = 'var(--sarak-switch-border-glass, 1px solid rgba(255, 255, 255, 0.1))';
        }

        const thumbStyle: React.CSSProperties = {
            backgroundColor: thumbBg,
            transform: checked ? 'translateX(100%)' : 'translateX(0)',
        };

        return { trackStyle, thumbStyle };
    };

    return { getButtonStyles, getInputStyles, getSwitchStyles };
};
