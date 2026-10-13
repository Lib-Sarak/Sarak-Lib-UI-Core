import React from 'react';

import { SarakThemePayload } from '../../../core/Provider/types';
import { resolveSwitchStyles } from './switchStyles';

/** Relevo do campo neumórfico: a sombra e a luz derivam da cor de sombra e da cor de texto do tema. */
const NEUMORPH_DARK = 'color-mix(in srgb, var(--sarak-card-shadow-color, #000000) 20%, transparent)';
const NEUMORPH_LIGHT = 'color-mix(in srgb, var(--text-main, #ffffff) 5%, transparent)';

/** O relevo do botão `neumorphism`: sai da superfície em repouso e afunda (sombra interna) sob o ponteiro. */
export const neumorphismButtonShadow = (isHovered: boolean): string => isHovered
    ? `inset 3px 3px 6px ${NEUMORPH_DARK}, inset -3px -3px 6px ${NEUMORPH_LIGHT}`
    : `5px 5px 10px ${NEUMORPH_DARK}, -5px -5px 10px ${NEUMORPH_LIGHT}`;

/** Variantes do estilo neon que têm halo em repouso — só nelas o pulso tem o que pulsar. */
const NEON_PULSE_VARIANTS = ['primary', 'danger', 'secondary'];

/**
 * Classe que liga o pulso do halo neon (`@keyframes` em `_animations.css`, duração em
 * `--sarak-btn-neon-pulse-speed`). Sem classe o botão fica estático: velocidade 0 (padrão)
 * ou ausente = sem pulso.
 */
export const resolveNeonPulseClass = (
    design: SarakThemePayload | undefined,
    variant: string
): string => {
    if (design?.btnStyleType !== 'neon') return '';
    if (!NEON_PULSE_VARIANTS.includes(variant)) return '';
    return Number(design.btnNeonPulseSpeed) > 0 ? 'sarak-btn-neon-pulse' : '';
};

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
                dynamicStyle.backgroundColor = 'var(--sarak-btn-secondary-bg, rgba(255, 255, 255, 0.05))';
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
        
        if (styleType === 'cyberpunk') {
            // Wireframe anguloso: só o contorno na cor do brilho, cantos retos, sem preenchimento.
            dynamicStyle.backgroundColor = 'transparent';
            dynamicStyle.border = `var(--sarak-border-width, 1px) solid ${glowColor}`;
            dynamicStyle.borderRadius = 0;
            dynamicStyle.boxShadow = isHovered ? `0 0 10px ${glowColor}` : 'none';
            return dynamicStyle;
        }

        if (styleType === 'neumorphism') {
            // Relevo suave (soft UI): o botão sai da superfície com a sombra escura embaixo e a clara em cima, e
            // afunda (sombra interna) sob o ponteiro. A cor e o texto seguem a variante; só a borda sai.
            dynamicStyle.border = 'none';
            dynamicStyle.boxShadow = neumorphismButtonShadow(isHovered);
            return dynamicStyle;
        }

        if (styleType === 'frosted') {
            const isFrostedTarget = ['primary', 'secondary', 'danger', 'success', 'outline'].includes(variant);
            if (!isFrostedTarget) return dynamicStyle;
            
            if (blurAmount > 0) {
                dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
                dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
            }
            dynamicStyle.border = '1px solid var(--color-theme-border, rgba(255,255,255,0.1))';
            
            if (variant === 'primary' || variant === 'danger') {
                dynamicStyle.boxShadow = 'var(--sarak-dynamic-shadow, 0 4px 12px rgba(0,0,0,0.1))';
            }
            
            if (variant === 'secondary') {
                dynamicStyle.backgroundColor = 'var(--sarak-btn-secondary-bg, rgba(255, 255, 255, 0.05))';
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
        const focusColor = 'var(--sarak-input-focus-border-color, var(--sarak-primary-color,#00f2ff))';

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
            dynamicStyle.boxShadow = `0 0 0 2px var(--color-theme-primary, #3b82f6)`;
        }

        if (shadowType === 'neumorphism') {
            if (!isFocused) {
                dynamicStyle.boxShadow = `inset 2px 2px 5px ${NEUMORPH_DARK}, inset -5px -5px 10px ${NEUMORPH_LIGHT}`;
            } else {
                dynamicStyle.boxShadow = `0 0 0 2px var(--color-theme-primary, #3b82f6), inset -2px -2px 5px ${NEUMORPH_LIGHT}`;
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
    ) => resolveSwitchStyles(design, checked);

    // Cor da marca (check, traço, ponto) que assenta sobre o fundo ativo do controle.
    const getChoiceMarkColor = (): string => 'var(--sarak-switch-thumb, #ffffff)';

    // Anel de foco dos controles de escolha: cor do foco de input, largura do token de foco.
    const getChoiceFocusRing = (focused: boolean): string =>
        focused
            ? '0 0 0 var(--sarak-focus-width, 2px) var(--sarak-input-focus-border-color, var(--sarak-primary-color, #00f2ff))'
            : 'none';

    const getCheckboxStyles = (
        design: SarakThemePayload | undefined,
        checked: boolean,
        indeterminate: boolean = false,
        focused: boolean = false
    ): React.CSSProperties => {
        const activeBg = 'var(--sarak-checkbox-active, var(--sarak-primary-color, #00f2ff))';
        const borderColor = 'var(--sarak-input-border-color, var(--border-color, #334155))';
        const activeBorderColor = 'var(--sarak-input-focus-border-color, var(--sarak-primary-color, #00f2ff))';

        const dynamicStyle: React.CSSProperties = {
            backgroundColor: checked || indeterminate ? activeBg : 'transparent',
            borderColor: checked || indeterminate ? activeBorderColor : borderColor,
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: getChoiceFocusRing(focused),
        };

        return dynamicStyle;
    };

    const getRadioStyles = (
        design: SarakThemePayload | undefined,
        checked: boolean,
        focused: boolean = false
    ): React.CSSProperties => {
        const activeBg = 'var(--sarak-checkbox-active, var(--sarak-primary-color, #00f2ff))';
        const borderColor = 'var(--sarak-input-border-color, var(--border-color, #334155))';
        const activeBorderColor = 'var(--sarak-input-focus-border-color, var(--sarak-primary-color, #00f2ff))';

        const dynamicStyle: React.CSSProperties = {
            backgroundColor: checked ? activeBg : 'transparent',
            borderColor: checked ? activeBorderColor : borderColor,
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: getChoiceFocusRing(focused),
        };

        return dynamicStyle;
    };

    return { getButtonStyles, getInputStyles, getSwitchStyles, getCheckboxStyles, getRadioStyles, getChoiceMarkColor };
};
