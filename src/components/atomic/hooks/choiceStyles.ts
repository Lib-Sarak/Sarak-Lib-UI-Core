import type React from 'react';
import type { SarakThemePayload } from '../../../core/Provider/types';

const getChoiceFocusRing = (focused: boolean): string => focused
    ? '0 0 0 var(--sarak-focus-width, 2px) var(--sarak-input-focus-border-color, var(--sarak-primary-color, #19e3f0))'
    : 'none';

export const getChoiceMarkColor = (): string => 'var(--sarak-switch-thumb, #ffffff)';

export const getCheckboxStyles = (
    design: SarakThemePayload | undefined,
    checked: boolean,
    indeterminate: boolean = false,
    focused: boolean = false
): React.CSSProperties => {
    const active = checked || indeterminate;
    return {
        backgroundColor: active ? 'var(--sarak-checkbox-active, var(--sarak-primary-color, #19e3f0))' : 'transparent',
        borderColor: active
            ? 'var(--sarak-input-focus-border-color, var(--sarak-primary-color, #19e3f0))'
            : 'var(--sarak-input-border-color, var(--border-color, rgba(255,255,255,0.09)))',
        borderWidth: '1px',
        borderStyle: 'solid',
        boxShadow: getChoiceFocusRing(focused),
    };
};

export const getRadioStyles = (
    design: SarakThemePayload | undefined,
    checked: boolean,
    focused: boolean = false
): React.CSSProperties => ({
    backgroundColor: checked ? 'var(--sarak-checkbox-active, var(--sarak-primary-color, #19e3f0))' : 'transparent',
    borderColor: checked
        ? 'var(--sarak-input-focus-border-color, var(--sarak-primary-color, #19e3f0))'
        : 'var(--sarak-input-border-color, var(--border-color, rgba(255,255,255,0.09)))',
    borderWidth: '1px',
    borderStyle: 'solid',
    boxShadow: getChoiceFocusRing(focused),
});
