import React, { useId } from 'react';
import { SarakBadge } from '../Feedback/SarakBadge';
import { SarakCard } from '../Cards/SarakCard';
import { SarakLink } from '../Navigation/SarakLink';
import { SarakDescriptionList } from './SarakDescriptionList';
import type { SarakDescriptionListItem } from './SarakDescriptionList';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakGrid } from '../Layouts/SarakGrid';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { INLINE_COLUMNS_CLASS } from './resourceRowLayout';

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
    /** `inline` põe título, metadados e ações lado a lado e empilha sozinho em contêiner estreito. Omitido, empilha. */
    layout?: SarakResourceRowLayout;
    /** `compact` reduz o respiro da linha. Omitido, `standard`. */
    density?: SarakResourceRowDensity;
}

export type SarakResourceRowLayout = 'stacked' | 'inline';
export type SarakResourceRowDensity = 'compact' | 'standard';

const GAP_MD = 'var(--sarak-layout-gap-md, 16px)';
/** Na coluna `auto` da linha, o `min(100%, …)` da lista de metadados é cíclico e a coluna some; cada par ocupa o próprio conteúdo. */
const INLINE_METADATA_STYLE: React.CSSProperties = { gridTemplateColumns: 'none', gridAutoFlow: 'column', gridAutoColumns: 'max-content' };

interface SarakResourceRowContentProps {
    layout: SarakResourceRowLayout;
    density: SarakResourceRowDensity;
    title: React.ReactNode;
    description?: React.ReactNode;
    badges: React.ReactNode[];
    metadata: SarakDescriptionListItem[];
    actions: SarakResourceRowAction[];
    titleId: string;
}

function renderResourceBadge(badge: React.ReactNode, index: number): React.ReactElement {
    if (React.isValidElement(badge) && badge.type === SarakBadge) {
        return React.cloneElement(badge, { key: index });
    }
    return <SarakBadge key={index}>{badge}</SarakBadge>;
}

function SarakResourceRowBadges({ badges, compact }: { badges: React.ReactNode[]; compact: boolean }): React.ReactElement | null {
    if (badges.length === 0) return null;
    const gap = 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)';
    return (
        <div className="flex flex-wrap" style={{ gap, marginTop: compact ? gap : 'var(--sarak-layout-gap-sm, 8px)' }}>
            {badges.map(renderResourceBadge)}
        </div>
    );
}

function SarakResourceRowActions({ actions }: { actions: SarakResourceRowAction[] }): React.ReactElement | null {
    if (actions.length === 0) return null;
    return (
        <div className="relative z-10 flex max-w-full flex-wrap items-center" style={{ gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)' }}>
            {actions.map((action) => (
                <SarakButton key={action.label} type="button" variant={action.variant ?? 'ghost'} onClick={action.onClick} style={{ minHeight: 'var(--sarak-touch-target-min, 44px)' }}>
                    {action.label}
                </SarakButton>
            ))}
        </div>
    );
}

function SarakResourceRowContent({
    layout,
    density,
    title,
    description,
    badges,
    metadata,
    actions,
    titleId,
}: SarakResourceRowContentProps): React.ReactElement {
    const inline = layout === 'inline';
    const compact = density === 'compact';
    const padding = compact ? `calc(${GAP_MD} * 0.5)` : GAP_MD;
    const titleStyle: React.CSSProperties = inline
        ? { margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
        : { margin: 0 };
    const body = (
        <>
            <div className="pointer-events-none relative z-0 min-w-0">
                <h3 id={titleId} style={titleStyle}>{title}</h3>
                {description !== undefined && <p className="text-theme-muted" style={{ margin: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5) 0 0' }}>{description}</p>}
                <SarakResourceRowBadges badges={badges} compact={compact} />
            </div>
            {metadata.length > 0 && <SarakDescriptionList items={metadata} className="relative z-0" style={inline ? INLINE_METADATA_STYLE : undefined} />}
            <SarakResourceRowActions actions={actions} />
        </>
    );
    if (inline) {
        return <div className={`grid min-w-0 ${INLINE_COLUMNS_CLASS}`} style={{ padding, gap: GAP_MD }}>{body}</div>;
    }
    return (
        <SarakGrid
            templateColumns="repeat(auto-fit, minmax(min(100%, max-content), 1fr))"
            gap="spacing-md"
            className="min-w-0 items-start"
            style={{ padding }}
        >
            {body}
        </SarakGrid>
    );
}

function SarakResourceRowDestination({
    href,
    onNavigate,
    titleId,
}: Pick<SarakResourceRowProps, 'href' | 'onNavigate'> & { titleId: string }): React.ReactElement | null {
    if (!href) return null;
    return (
        <SarakLink
            href={href}
            onNavigate={onNavigate}
            aria-labelledby={titleId}
            className="rounded-sm"
            style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'block', minHeight: 'var(--sarak-touch-target-min, 44px)' }}
        >
            {null}
        </SarakLink>
    );
}

export const SarakResourceRow = ({
    title,
    description,
    badges = [],
    metadata = [],
    actions = [],
    href,
    onNavigate,
    layout = 'stacked',
    density = 'standard',
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
            <SarakResourceRowDestination href={href} onNavigate={onNavigate} titleId={titleId} />
            <SarakResourceRowContent
                layout={layout}
                density={density}
                title={title}
                description={description}
                badges={badges}
                metadata={metadata}
                actions={actions}
                titleId={titleId}
            />
            </SarakCard>
        </article>
    );
};
