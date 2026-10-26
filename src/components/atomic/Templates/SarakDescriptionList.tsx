import React from 'react';
import { SarakGrid } from '../Layouts/SarakGrid';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakDescriptionListItem {
    label: React.ReactNode;
    value: React.ReactNode;
}

export interface SarakDescriptionListProps extends Omit<React.HTMLAttributes<HTMLDListElement>, 'children'> {
    items: SarakDescriptionListItem[];
}

export const SarakDescriptionList = ({ items, className, style, ...props }: SarakDescriptionListProps): React.ReactElement => {
    // SarakGrid exposes div attributes even when its polymorphic `as` renders a description list.
    const gridProps = props as React.HTMLAttributes<HTMLDivElement>;

    return (
        <SarakGrid
            {...gridProps}
            as="dl"
            templateColumns="repeat(auto-fit, minmax(min(100%, max-content), 1fr))"
            gap="spacing-sm"
            className={mergeSarakClasses('sarak-description-list w-full', className)}
            style={{
                columnGap: 'var(--sarak-layout-gap-lg, 24px)',
                rowGap: 'var(--sarak-layout-gap-sm, 8px)',
                margin: 0,
                ...style,
            }}
        >
            {items.map((item, index) => (
                <div key={`${index}`} className="min-w-0 break-words">
                    <dt className="text-theme-muted" style={{ fontSize: 'var(--sarak-type-scale-xs, 11px)' }}>{item.label}</dt>
                    <dd className="text-theme-text" style={{ margin: 0, fontSize: 'var(--sarak-body-size, 14px)' }}>{item.value}</dd>
                </div>
            ))}
        </SarakGrid>
    );
};
