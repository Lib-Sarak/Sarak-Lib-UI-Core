import React, { useId } from 'react';
import { sarakResolveResponsiveValue } from '../../../core/Design/resolveResponsiveValue';
import type { SarakResponsiveValue } from '../../../core/Design/types';
import { useSarakDevice } from '../../../core/Provider/DeviceProvider';
import { SarakGrid } from '../Layouts/SarakGrid';

export interface SarakFormSectionProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    columns?: number | SarakResponsiveValue<number>;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
}

const resolveColumnCount = (
    columns: number | SarakResponsiveValue<number>,
    device: ReturnType<typeof useSarakDevice>,
): number => {
    if (device === 'smartphone') return 1;

    const resolvedColumns = sarakResolveResponsiveValue(columns, device);
    return Number.isFinite(resolvedColumns) && resolvedColumns > 0
        ? Math.floor(resolvedColumns)
        : 1;
};

export const SarakFormSection = ({
    title,
    description,
    columns = 1,
    disabled,
    children,
    className,
}: SarakFormSectionProps): React.ReactElement => {
    const descriptionId = useId();
    const device = useSarakDevice();
    const hasDescription = description !== undefined && description !== null;
    const resolvedColumns = resolveColumnCount(columns, device);

    return (
        <fieldset
            disabled={disabled}
            aria-describedby={hasDescription ? descriptionId : undefined}
            className={className}
            style={{ border: 0, margin: 0, minWidth: 0, padding: 0 }}
        >
            <legend className="text-sm font-medium">{title}</legend>
            {hasDescription && (
                <p id={descriptionId} style={{ marginBlock: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    {description}
                </p>
            )}
            <SarakGrid columns={resolvedColumns} data-testid="sarak-form-section-fields">
                {children}
            </SarakGrid>
        </fieldset>
    );
};
