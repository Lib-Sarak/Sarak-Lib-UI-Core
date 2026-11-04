import React from 'react';

export interface IconSlot {
    node: React.ReactNode;
    side: 'left' | 'right';
    interactive: boolean;
}

export const ICON_SIDE_CLASS = { left: 'absolute left-3 z-10', right: 'absolute right-3 z-10' } as const;
export const ICON_INERT_CLASS = 'pointer-events-none text-[var(--sarak-input-icon-color,var(--text-muted,rgba(242,246,251,0.55)))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#19e3f0))]';
export const ICON_INTERACTIVE_CLASS = 'text-[var(--sarak-input-icon-color,var(--text-muted,rgba(242,246,251,0.55)))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#19e3f0))]';

export const resolveIconSlots = (
    icon: React.ReactNode,
    leftIcon: React.ReactNode,
    rightIcon: React.ReactNode,
    themeSide: 'left' | 'right',
): IconSlot[] => {
    if (icon) return [{ node: icon, side: themeSide, interactive: false }];
    if (leftIcon && rightIcon) {
        return [
            { node: leftIcon, side: 'left', interactive: false },
            { node: rightIcon, side: 'right', interactive: true },
        ];
    }
    if (leftIcon) return [{ node: leftIcon, side: themeSide, interactive: false }];
    if (rightIcon) return [{ node: rightIcon, side: themeSide, interactive: true }];
    return [];
};
