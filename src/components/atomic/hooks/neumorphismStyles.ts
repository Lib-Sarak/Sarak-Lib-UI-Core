const NEUMORPH_DARK = 'color-mix(in srgb, var(--sarak-card-shadow-color, #000000) 20%, transparent)';
const NEUMORPH_LIGHT = 'color-mix(in srgb, var(--text-main, #f2f6fb) 5%, transparent)';

export const neumorphismButtonShadow = (isHovered: boolean): string => isHovered
    ? `inset 3px 3px 6px ${NEUMORPH_DARK}, inset -3px -3px 6px ${NEUMORPH_LIGHT}`
    : `5px 5px 10px ${NEUMORPH_DARK}, -5px -5px 10px ${NEUMORPH_LIGHT}`;

export const neumorphismInputShadow = (isFocused: boolean): string => isFocused
    ? `0 0 0 var(--sarak-focus-width, 2px) var(--sarak-input-focus-border-color, var(--sarak-primary-color, #19e3f0)), inset -2px -2px 5px ${NEUMORPH_LIGHT}`
    : `inset 2px 2px 5px ${NEUMORPH_DARK}, inset -5px -5px 10px ${NEUMORPH_LIGHT}`;

