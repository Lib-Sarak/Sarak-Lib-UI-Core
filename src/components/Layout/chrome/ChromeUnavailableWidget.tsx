import React from 'react';

export interface ChromeUnavailableWidgetProps {
    label: string;
    icon: React.ReactNode;
    variant: 'horizontal' | 'vertical' | 'mini';
}

const VARIANT_CLASS_NAMES = {
    horizontal: 'flex items-center gap-2 rounded-xl border px-2 py-1.5',
    vertical: 'flex items-center gap-2 rounded-xl border px-2 py-2',
    mini: 'flex items-center justify-center rounded-xl border p-2',
} as const;

/** Na barra de topo o rótulo cede o lugar à navegação abaixo do breakpoint `2xl` (fica o ícone; o nome acessível é o `aria-label`). */
const LABEL_CLASS_NAMES = {
    horizontal: 'hidden 2xl:inline text-xs',
    vertical: 'text-xs',
    mini: 'text-xs',
} as const;

export const ChromeUnavailableWidget: React.FC<ChromeUnavailableWidgetProps> = (
    { label, icon, variant }: ChromeUnavailableWidgetProps,
): React.ReactElement => (
    <div
        role="button"
        aria-disabled="true"
        aria-label={label}
        title={label}
        tabIndex={0}
        data-sarak-widget="unavailable"
        className={`cursor-not-allowed border-[var(--theme-border)] bg-[var(--theme-card)]/40 text-[var(--theme-muted)] opacity-55 ${VARIANT_CLASS_NAMES[variant]}`}
    >
        {icon}
        {variant !== 'mini' && <span className={LABEL_CLASS_NAMES[variant]}>{label}</span>}
    </div>
);
