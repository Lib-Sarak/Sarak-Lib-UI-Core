import React from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../Icon/SarakIcon';
import { SarakDataEmpty } from '../../Feedback/SarakDataEmpty';
import { SarakIconButton } from '../../Buttons';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';
import type { SarakManagementAction } from '../SarakManagementGrid';

interface ManagementGroupCardProps<TItem extends Record<string, unknown>> {
    groupName: string;
    items: TItem[];
    containerLayout: { className?: string; style?: React.CSSProperties };
    groupActions: SarakManagementAction[];
    mapping: {
        id: string;
        title: string;
        status?: string;
        isActive?: string;
        description?: string;
        error?: string;
    };
    onAction: (action: SarakManagementAction) => void;
    onToggle?: (item: TItem) => void;
    onDelete?: (item: TItem) => void;
    getVal: (item: TItem, path: string) => unknown;
}

export const ManagementGroupCard = <TItem extends Record<string, unknown>>({
    groupName,
    items,
    containerLayout,
    groupActions,
    mapping,
    onAction,
    onToggle,
    onDelete,
    getVal,
}: ManagementGroupCardProps<TItem>) => (
    <ManagementGroupCardContent
        groupName={groupName}
        items={items}
        containerLayout={containerLayout}
        groupActions={groupActions}
        mapping={mapping}
        onAction={onAction}
        onToggle={onToggle}
        onDelete={onDelete}
        getVal={getVal}
    />
);

const ManagementGroupCardContent = <TItem extends Record<string, unknown>>({
    groupName,
    items,
    containerLayout,
    groupActions,
    mapping,
    onAction,
    onToggle,
    onDelete,
    getVal,
}: ManagementGroupCardProps<TItem>) => {
    const text = useLibraryText();
    const { getFlexStyles } = useStructuralStyles();
    const itemListLayout = getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-md,16px)');
    const itemTitleLayout = getFlexStyles('column', 'flex-start', 'stretch');

    return <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${containerLayout.className ?? ''} h-full overflow-hidden rounded-[var(--sarak-card-radius,12px)] border bg-[var(--color-theme-card,#1e293b)]`}
        style={{ transitionDuration: 'var(--duration-normal, 0.3s)' }}
    >
        <div className="flex items-center justify-between border-b border-[var(--border-color,#334155)] bg-white/[0.02]" style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}>
            <h3 className="text-theme-title font-bold">{groupName}</h3>
            <div className="flex" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 6)' }}>
                {groupActions.map((action) => (
                    <SarakIconButton
                        key={action.label}
                        onClick={() => onAction(action)}
                        icon={<SarakIcon name={action.icon === 'plus' ? 'Plus' : 'Settings2'} size={16} />}
                        variant="ghost"
                        title={action.label}
                    />
                ))}
            </div>
        </div>

        <div className="max-h-[var(--sarak-management-group-list-max-height,340px)] overflow-y-auto" style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}>
            {items.length > 0 ? (
                <div className={itemListLayout.className} style={itemListLayout.style}>
                    {items.map((item, index) => {
                        const itemId = String(getVal(item, mapping.id) ?? index);
                        const isActive = mapping.isActive ? Boolean(getVal(item, mapping.isActive)) : false;
                        const status = mapping.status ? String(getVal(item, mapping.status) ?? '') : '';
                        const description = mapping.description ? String(getVal(item, mapping.description) ?? '') : '';
                        const error = mapping.error ? String(getVal(item, mapping.error) ?? '') : '';
                        return (
                            <div key={itemId} className="rounded-[var(--sarak-card-radius,12px)] border border-[var(--border-color,#334155)]" style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}>
                                <div className="flex items-start justify-between" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) / 3)' }}>
                                    <div className={`min-w-0 ${itemTitleLayout.className}`} style={itemTitleLayout.style}>
                                        <span className="truncate text-theme-title font-bold">{String(getVal(item, mapping.title) ?? '')}</span>
                                        {description && <span className="truncate text-sm text-theme-muted">{description}</span>}
                                    </div>
                                    <div className="flex shrink-0">
                                        {onToggle && (
                                            <SarakIconButton
                                                onClick={() => onToggle(item)}
                                                icon={<SarakIcon name={isActive ? 'ToggleRight' : 'ToggleLeft'} size={28} />}
                                                variant="ghost"
                                                title={text('managementToggleItem')}
                                            />
                                        )}
                                        {onDelete && (
                                            <SarakIconButton
                                                onClick={() => onDelete(item)}
                                                icon={<SarakIcon name="Trash2" size={14} />}
                                                variant="ghost"
                                                title={text('managementDeleteItem')}
                                            />
                                        )}
                                    </div>
                                </div>
                                {status && <span className="text-sm text-theme-muted">{status}</span>}
                                {error && <p role="alert" className="text-sm text-[var(--sarak-status-error-color,#ef4444)]">{error}</p>}
                            </div>
                        );
                    })}
                </div>
            ) : <SarakDataEmpty />}
        </div>
    </motion.div>;
};
