import React from 'react';
import { SarakBreadcrumbs } from '../Navigation/SarakBreadcrumbs';
import type { SarakBreadcrumbItem } from '../Navigation/SarakBreadcrumbs';
import { SarakSkeleton } from '../Feedback/SarakSkeleton';
import { SarakFlex } from '../Layouts/SarakFlex';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakPageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    breadcrumbs?: SarakBreadcrumbItem[];
    onBreadcrumbNavigate?: (href: string) => void;
    primaryActions?: React.ReactNode;
    secondaryActions?: React.ReactNode;
    loading?: boolean;
    loadingLabel?: string;
}

export const SarakPageHeader = ({
    title,
    subtitle,
    breadcrumbs,
    onBreadcrumbNavigate,
    primaryActions,
    secondaryActions,
    loading = false,
    loadingLabel,
    className,
    style,
    ...props
}: SarakPageHeaderProps): React.ReactElement => {
    // SarakFlex exposes div attributes even when its polymorphic `as` renders a header.
    const flexProps = props as React.HTMLAttributes<HTMLDivElement>;

    return (
        <SarakFlex
            {...flexProps}
            as="header"
            direction="column"
            gap="spacing-md"
            wrap={false}
            className={mergeSarakClasses('sarak-page-header @container w-full', className)}
            style={style}
        >
            {breadcrumbs && <SarakBreadcrumbs items={breadcrumbs} onNavigate={onBreadcrumbNavigate} />}
            <SarakFlex direction="row" justify="space-between" align="flex-start" gap="spacing-md" className="w-full">
                <SarakFlex
                    direction="column"
                    gap="spacing-sm"
                    wrap={false}
                    className="min-w-0 flex-1"
                    role={loading ? 'status' : undefined}
                    aria-busy={loading || undefined}
                    aria-label={loading ? loadingLabel : undefined}
                >
                    {loading ? (
                        <div aria-hidden="true"><SarakSkeleton rows={2} /></div>
                    ) : (
                        <>
                            <h1 style={{ margin: 0, color: 'var(--color-theme-title)' }}>{title}</h1>
                            {subtitle !== undefined && (
                                <p style={{ margin: 0, color: 'var(--sarak-subtitle-color)' }}>{subtitle}</p>
                            )}
                        </>
                    )}
                </SarakFlex>
                {!loading && (primaryActions || secondaryActions) && (
                    <div className="flex flex-wrap items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                        {primaryActions}
                        {secondaryActions}
                    </div>
                )}
            </SarakFlex>
        </SarakFlex>
    );
};
