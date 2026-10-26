import React, { useId } from 'react';
import { SarakAlert } from '../Feedback/SarakAlert';
import { SarakEmptyState } from '../Feedback/SarakEmptyState';
import { SarakSkeleton } from '../Feedback/SarakSkeleton';
import { SarakCard } from '../Cards/SarakCard';
import { SarakFlex } from '../Layouts/SarakFlex';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    variant?: 'plain' | 'card';
    loading?: boolean;
    loadingLabel?: string;
    emptyState?: {
        title?: React.ReactNode;
        description?: React.ReactNode;
        action?: React.ReactNode;
    };
    error?: {
        title: string;
        message: string;
        retryLabel?: string;
        onRetry?: () => void;
    };
}

export const SarakSection = ({
    title,
    description,
    actions,
    children,
    headingLevel = 2,
    variant = 'plain',
    loading = false,
    loadingLabel,
    emptyState,
    error,
    className,
    style,
    ...props
}: SarakSectionProps): React.ReactElement => {
    const headingId = useId();
    const headingTag = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const content = loading ? (
        <div role="status" aria-busy="true" aria-label={loadingLabel}>
            <div aria-hidden="true"><SarakSkeleton rows={3} /></div>
        </div>
    ) : emptyState ? (
        <SarakEmptyState title={emptyState.title} description={emptyState.description} action={emptyState.action} />
    ) : children;

    const sectionHeader = (
        <div className="flex flex-wrap items-start justify-between" style={{ gap: 'var(--sarak-layout-gap-md, 16px)' }}>
            <div className="min-w-0 flex-1">
                {React.createElement(headingTag, { id: headingId, style: { margin: 0 } }, title)}
                {description !== undefined && <p style={{ margin: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5) 0 0' }}>{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>{actions}</div>}
        </div>
    );

    const sectionBody = (
        <SarakFlex direction="column" gap="spacing-md" wrap={false} className="min-w-0">
            {error && (
                <SarakAlert
                    variant="error"
                    title={error.title}
                    message={error.message}
                    action={error.onRetry && error.retryLabel ? { label: error.retryLabel, onClick: error.onRetry } : undefined}
                />
            )}
            {content}
        </SarakFlex>
    );

    return (
        <section
            {...props}
            aria-labelledby={headingId}
            className={mergeSarakClasses('sarak-section @container w-full', className)}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-md, 16px)', ...style }}
        >
            {variant === 'card' ? (
                <SarakCard>
                    <SarakCard.Header>{sectionHeader}</SarakCard.Header>
                    <SarakCard.Body>
                        <div style={{ padding: 'var(--sarak-card-padding-md, var(--sarak-layout-gap-md, 16px))' }}>
                            {sectionBody}
                        </div>
                    </SarakCard.Body>
                </SarakCard>
            ) : (
                <>
                    {sectionHeader}
                    {sectionBody}
                </>
            )}
        </section>
    );
};
