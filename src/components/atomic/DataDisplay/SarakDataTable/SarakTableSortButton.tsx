import React from 'react';

import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakIcon } from "../../Icon/SarakIcon";
import { SarakButton } from '../../Buttons/SarakButton';
import type { SarakTableSort } from './columnModel';

export interface SarakTableSortButtonProps {
    columnId: string;
    label: React.ReactNode;
    sort: SarakTableSort | null;
    onSort: (columnId: string) => void;
}

export function SarakTableSortButton({ columnId, label, sort, onSort }: SarakTableSortButtonProps): React.ReactElement {
    const text = useLibraryText();
    const activeSort = sort?.columnId === columnId ? sort.direction : null;
    const icon = activeSort === 'asc' ? <SarakIcon name="ArrowUp" size={12} /> : activeSort === 'desc' ? <SarakIcon name="ArrowDown" size={12} /> : <SarakIcon name="ArrowUpDown" size={12} />;

    return (
        <SarakButton
            type="button"
            draggable={false}
            variant="ghost"
            size="xs"
            leftIcon={icon}
            aria-label={text('tableSortBy', { column: columnId })}
            onClick={() => onSort(columnId)}
        >
            {label}
        </SarakButton>
    );
}
