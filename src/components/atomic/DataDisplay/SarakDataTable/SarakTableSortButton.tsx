import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { SarakButton } from '../../Buttons/SarakButton';
import type { SarakTableSort } from './columnModel';

export interface SarakTableSortButtonProps {
    columnId: string;
    label: React.ReactNode;
    sort: SarakTableSort | null;
    onSort: (columnId: string) => void;
}

export function SarakTableSortButton({ columnId, label, sort, onSort }: SarakTableSortButtonProps) {
    const activeSort = sort?.columnId === columnId ? sort.direction : null;
    const icon = activeSort === 'asc' ? <ArrowUp size={12} /> : activeSort === 'desc' ? <ArrowDown size={12} /> : <ArrowUpDown size={12} />;

    return (
        <SarakButton
            type="button"
            draggable={false}
            variant="ghost"
            size="xs"
            leftIcon={icon}
            aria-label={`Ordenar por ${columnId}`}
            onClick={() => onSort(columnId)}
        >
            {label}
        </SarakButton>
    );
}
