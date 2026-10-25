import React from 'react';
import { SarakButton } from '../Buttons/SarakButton';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
    ariaLabel: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    clearFilters?: {
        label: string;
        onClick: () => void;
    };
}

export const SarakFilterBar = ({
    ariaLabel,
    children,
    actions,
    clearFilters,
    className,
    style,
    ...props
}: SarakFilterBarProps): React.ReactElement => (
    <div
        {...props}
        role="group"
        aria-label={ariaLabel}
        className={mergeSarakClasses('sarak-filter-bar @container flex w-full flex-wrap items-end', className)}
        style={{ gap: 'var(--sarak-layout-gap-md, 16px)', ...style }}
    >
        <div className="flex min-w-0 flex-1 flex-wrap items-end" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
            {children}
        </div>
        {(actions || clearFilters) && (
            <div className="flex flex-wrap items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                {actions}
                {clearFilters && (
                    <SarakButton type="button" variant="ghost" onClick={clearFilters.onClick}>
                        {clearFilters.label}
                    </SarakButton>
                )}
            </div>
        )}
    </div>
);
