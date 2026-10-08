import type { ReactElement } from 'react';
import { SarakTableView } from './SarakTableView';
import { useSarakTableViewModel } from './useSarakTableViewModel';
import type { SarakTableProps as BaseSarakTableProps } from './SarakTableProps';
export type { SarakTableColumn } from './SarakTableProps';

export interface SarakTableProps<TData extends Record<string, unknown> = Record<string, unknown>>
    extends BaseSarakTableProps<TData> {
    onRetry?: () => void;
    emptyMessage?: string;
    loading?: boolean;
    error?: string | null;
}

export const SarakTable = <TData extends Record<string, unknown> = Record<string, unknown>>(
    props: SarakTableProps<TData>,
): ReactElement => <SarakTableView {...useSarakTableViewModel(props)} />;
