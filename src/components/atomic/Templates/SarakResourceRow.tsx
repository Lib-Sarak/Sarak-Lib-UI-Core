import React, { useId } from 'react';
import { SarakBadge } from '../Feedback/SarakBadge';
import { SarakCard } from '../Cards/SarakCard';
import { SarakLink } from '../Navigation/SarakLink';
import { SarakDescriptionList } from './SarakDescriptionList';
import type { SarakDescriptionListItem } from './SarakDescriptionList';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakGrid } from '../Layouts/SarakGrid';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakResourceRowAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
}

export interface SarakResourceRowProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
    title: React.ReactNode;
    description?: React.ReactNode;
    badges?: React.ReactNode[];
    metadata?: SarakDescriptionListItem[];
    actions?: SarakResourceRowAction[];
    href?: string;
    onNavigate?: (href: string) => void;
}

export const SarakResourceRow = ({
    title,
    description,
    badges = [],
    metadata = [],
    actions = [],
    href,
    onNavigate,
    className,
    style,
    ...props
}: SarakResourceRowProps): React.ReactElement => {
    const titleId = useId();

    return (
        <article
            {...props}
            className={mergeSarakClasses('sarak-resource-row @container w-full', className)}
            style={{ containerType: 'inline-size', ...style }}
        >
            <SarakCard interactive={Boolean(href)} className="relative w-full">
                {href && (
                    <SarakLink
                        href={href}
                        onNavigate={onNavigate}
                        aria-labelledby={titleId}
                        className="rounded-sm"
                        style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'block', minHeight: 'var(--sarak-touch-target-min, 44px)' }}
                    >
                        {null}
                    </SarakLink>
                )}
                <SarakGrid
                    templateColumns="repeat(auto-fit, minmax(min(100%, max-content), 1fr))"
                    gap="spacing-md"
                    className="min-w-0 items-start"
                    style={{ padding: 'var(--sarak-layout-gap-md, 16px)' }}
                >
                    <div className="pointer-events-none relative z-0 min-w-0">
                        <h3 id={titleId} style={{ margin: 0 }}>{title}</h3>
                        {description !== undefined && <p className="text-theme-muted" style={{ margin: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5) 0 0' }}>{description}</p>}
                        {badges.length > 0 && (
                            <div className="flex flex-wrap" style={{ gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)', marginTop: 'var(--sarak-layout-gap-sm, 8px)' }}>
                                {badges.map((badge, index) => <SarakBadge key={index}>{badge}</SarakBadge>)}
                            </div>
                        )}
                    </div>
                    {metadata.length > 0 && <SarakDescriptionList items={metadata} className="relative z-0" />}
                    {actions.length > 0 && (
                        <div className="relative z-10 flex flex-wrap items-center" style={{ gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)' }}>
                            {actions.map((action) => (
                                <SarakButton key={action.label} type="button" variant={action.variant ?? 'ghost'} onClick={action.onClick} style={{ minHeight: 'var(--sarak-touch-target-min, 44px)' }}>
                                    {action.label}
                                </SarakButton>
                            ))}
                        </div>
                    )}
                </SarakGrid>
            </SarakCard>
        </article>
    );
};
