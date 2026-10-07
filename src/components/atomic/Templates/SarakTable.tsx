import { motion, AnimatePresence } from 'framer-motion';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakInput } from '../Inputs';
import { SarakIconButton } from '../Buttons';
import { SarakDataEmpty } from '../Feedback/SarakDataEmpty';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useSarakDevice } from '../../../core/Provider/DeviceProvider';
import { useTableLayoutStyles } from '../Tables/hooks/useTableLayoutStyles';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useSarakTableData } from './hooks/useSarakTableData';
import { SarakTableCards, SarakTableSelectionCheckbox } from './SarakTableCards';
import type { SarakTableProps } from './SarakTableProps';
import { SarakTableSortButton } from '../DataDisplay/SarakDataTable/SarakTableSortButton';
import { useTableInteractions } from '../DataDisplay/SarakDataTable/useTableInteractions';
import { SarakTableErrorState } from './SarakTableErrorState';

export type { SarakTableProps } from './SarakTableProps';

export const SarakTable = <TData extends Record<string, unknown> = Record<string, unknown>>({
    data,
    load,
    label,
    mapping,
    role = 'neutral',
    density = 'standard',
    responsive = true,
    getRowKey,
    sort,
    onSortChange,
    selectable = false,
    selectedKeys,
    onSelectionChange,
    showSearch = true,
    showRefresh = true,
}: SarakTableProps<TData>) => {
    const { design } = useSarakUI();
    const text = useLibraryText();
    const device = useSarakDevice();
    const collapseToCards = responsive && device === 'smartphone';
    const { cellDensityClass } = useTableLayoutStyles(design);
    const { getContainerStyles, getHeaderStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();
    const headerLayout = getHeaderStyles();
    const tableData = useSarakTableData<TData>(data, load);
    const canRefresh = showRefresh && data === undefined && Boolean(load);
    const {
        data: rows,
        filteredData,
        loading,
        error,
        search,
        setSearch,
        loadData,
    } = tableData;
    const interactions = useTableInteractions({
        rows: filteredData,
        getRowKey,
        sort,
        onSortChange,
        selectedKeys,
        onSelectionChange,
        getSortValue: (row, columnId) => row[columnId],
    });

    const columns = mapping
        ? Object.keys(mapping)
        : rows.length > 0
            ? Object.keys(rows[0]).filter((key) => !key.startsWith('_'))
            : [];
    const columnLabels = mapping ?? columns.reduce<Record<string, string>>((labels, column) => {
        labels[column] = column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ');
        return labels;
    }, {});
    const headingClass = [
        'font-black',
        'text-theme-title',
        'tracking-tight',
        density === 'spacious' ? 'text-2xl' : 'text-xl',
    ].join(' ');

    if (error) {
        return <SarakTableErrorState
            containerClassName={containerLayout.className}
            error={error}
            onRetry={canRefresh ? () => void loadData() : undefined}
        />;
    }

    return (
        <div className="@container" style={containerLayout.style}>
            {(label || showSearch || canRefresh) && (
                <div className={headerLayout.className} style={headerLayout.style}>
                    <div>
                        {label && (
                            <h3
                                className={headingClass}
                                style={{
                                    fontWeight: 'var(--sarak-h1-weight,700)',
                                    color: role === 'primary'
                                        ? 'var(--sarak-primary-color,#3b82f6)'
                                        : 'var(--color-theme-title,currentColor)',
                                }}
                            >
                                {label}
                            </h3>
                        )}
                        <p className="text-theme-muted text-xs">
                            {text('tableRowsFound', { count: filteredData.length })}
                        </p>
                    </div>
                    <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 3)' }}>
                        {showSearch && (
                            <div className="w-full md:w-64">
                                <SarakInput
                                    type="text"
                                    placeholder={text('searchPlaceholder')}
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    leftIcon={<SarakIcon name="Search" size={16} />}
                                />
                            </div>
                        )}
                        {canRefresh && (
                            <SarakIconButton
                                icon={<SarakIcon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />}
                                onClick={() => void loadData()}
                                variant="secondary"
                                aria-label={text('retry')}
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="relative bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] overflow-hidden rounded-[var(--sarak-card-radius,12px)]">
                {collapseToCards ? (
                    <SarakTableCards
                        rows={interactions.entries.map(({ row }) => row)}
                        rowKeys={interactions.entries.map(({ key }) => key)}
                        columns={columns}
                        columnLabels={columnLabels}
                        loading={loading}
                        sort={interactions.sort}
                        onSort={interactions.changeSort}
                        sortableColumns={columns}
                        selectable={selectable}
                        selectedKeys={interactions.selectedKeys}
                        allVisibleSelected={interactions.allVisibleSelected}
                        partiallySelected={interactions.partiallySelected}
                        onToggleRow={interactions.toggleRow}
                        onToggleAll={interactions.toggleAll}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-[var(--border-color,#334155)]">
                                    {selectable && (
                                        <th className={cellDensityClass}>
                                            <SarakTableSelectionCheckbox
                                                label={text('selectAllVisibleRows')}
                                                checked={interactions.allVisibleSelected}
                                                indeterminate={interactions.partiallySelected}
                                                onChange={interactions.toggleAll}
                                            />
                                        </th>
                                    )}
                                    {columns.map((column) => (
                                        <th
                                            key={column}
                                            className={'text-2xs font-black text-theme-muted uppercase ' + cellDensityClass}
                                            style={{ letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}
                                        >
                                            <SarakTableSortButton
                                                columnId={column}
                                                label={columnLabels[column]}
                                                sort={interactions.sort}
                                                onSort={interactions.changeSort}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        Array.from({ length: 5 }, (_, rowIndex) => (
                                            <tr key={'skeleton-' + rowIndex} className="animate-pulse">
                                                {selectable && <td className={cellDensityClass} />}
                                                {columns.map((column) => (
                                                    <td key={'skeleton-' + column} className={cellDensityClass}>
                                                        <div className="h-4 bg-white/5 rounded-md w-3/4" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        interactions.entries.map(({ row, key }, index) => (
                                            <motion.tr
                                                key={key}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group"
                                            >
                                                {selectable && (
                                                    <td className={cellDensityClass}>
                                                        <SarakTableSelectionCheckbox
                                                            label={text('selectRow', { row: String(key) })}
                                                            checked={interactions.selectedKeys.has(key)}
                                                            onChange={(checked) => interactions.toggleRow(key, checked)}
                                                        />
                                                    </td>
                                                )}
                                                {columns.map((column) => (
                                                    <td
                                                        key={column}
                                                        className={[
                                                            'font-medium',
                                                            'text-theme-text',
                                                            density === 'compact' ? 'text-xs' : 'text-sm',
                                                            cellDensityClass,
                                                        ].join(' ')}
                                                    >
                                                        {String(row[column] ?? '')}
                                                    </td>
                                                ))}
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
                {filteredData.length === 0 && !loading && (
                    <div className="flex items-center justify-center text-center" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 5)' }}>
                        <SarakDataEmpty />
                    </div>
                )}
            </div>
        </div>
    );
};
