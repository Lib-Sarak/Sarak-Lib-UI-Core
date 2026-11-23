import type React from 'react';
import type { SarakThemePayload } from '../../../core/Provider/types';
import { neumorphismInputShadow } from './neumorphismStyles';

const getInputBorderStyles = (
    borderType: string,
    isFocused: boolean,
    borderColor: string,
    focusColor: string
): React.CSSProperties => {
    const resolvedBorderColor = isFocused ? focusColor : borderColor;

    if (borderType === 'none') return { border: 'none' };
    if (borderType === 'underline') {
        // sarak-allow-hardcode: piso funcional: o traço de 2 px é o próprio desenho da variante sublinhada, que não tem outra borda; --sarak-border-width aceita 0 e apagaria o campo.
        return { border: 'none', borderBottom: `2px solid ${resolvedBorderColor}`, borderRadius: '0px' };
    }
    // sarak-allow-hardcode: piso funcional: o traço de 2 px é o próprio desenho da variante tracejada; --sarak-border-width aceita 0 e apagaria o campo.
    if (borderType === 'dashed') return { border: `2px dashed ${resolvedBorderColor}` };
    // sarak-allow-hardcode: piso funcional: o contorno de 1 px do controle desmarcado não segue --sarak-border-width, que aceita 0 e apagaria o campo.
    return { border: `1px solid ${resolvedBorderColor}` };
};

const getInputShadow = (
    shadowType: string,
    isFocused: boolean,
    focusColor: string
): string | undefined => {
    if (shadowType === 'neumorphism') return neumorphismInputShadow(isFocused);
    if (isFocused) return `0 0 0 var(--sarak-focus-width, 2px) ${focusColor}`;
    if (shadowType !== 'none') return shadowType;
    return undefined;
};

export const getInputStyles = (
    design: SarakThemePayload | undefined,
    isFocused: boolean
): React.CSSProperties => {
    const borderType = design?.inputBorderType || 'solid';
    const shadowType = design?.inputShadow || 'none';
    const borderColor = 'var(--sarak-input-border-color, var(--border-color,rgba(255,255,255,0.09)))';
    const focusColor = 'var(--sarak-input-focus-border-color, var(--sarak-primary-color,#19e3f0))';
    const dynamicStyle = getInputBorderStyles(borderType, isFocused, borderColor, focusColor);
    const boxShadow = getInputShadow(shadowType, isFocused, focusColor);
    const blurAmount = design?.inputBackdropBlur || 0;

    if (boxShadow) dynamicStyle.boxShadow = boxShadow;
    if (blurAmount > 0) {
        dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
        dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
    }
    return dynamicStyle;
};

