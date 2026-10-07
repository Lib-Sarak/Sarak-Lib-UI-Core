import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakAlert } from '../Feedback/SarakAlert';
import { SarakForm } from './SarakForm';
import { SarakButton, SarakIconButton } from '../Buttons';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { ManagementGroupCard } from './components/ManagementGroupCard';
import { useManagementGrid } from './hooks/useManagementGrid';

export interface SarakManagementAction {
    label: string;
    action: string;
    icon?: 'plus' | 'settings';
    /** Opens the host-submitted creation form when onCreate is provided. */
    opensCreateForm?: boolean;
}

export interface SarakManagementGridProps<TItem extends Record<string, unknown>> {
    /** Records already loaded by the host; takes precedence over load. */
    data?: TItem[];
    /** Loads records through the host's chosen transport. */
    load?: () => Promise<TItem[]>;
    /** Path to the grouping value; supports nested fields. */
    groupBy: string;
    /** Empty groups to display alongside groups found in the records. */
    ghostGroups?: string[];
    /** Maps record paths to fields displayed by each item card. */
    mapping: {
        id: string;
        title: string;
        status?: string;
        isActive?: string;
        description?: string;
        error?: string;
    };
    label?: string;
    description?: string;
    headerActions?: SarakManagementAction[];
    groupActions?: SarakManagementAction[];
    formMapping?: Record<string, string>;
    onAction?: (action: string, group?: string) => void | Promise<void>;
    onToggle?: (item: TItem) => void | Promise<void>;
    onDelete?: (item: TItem) => void | Promise<void>;
    onCreate?: (data: Record<string, unknown>, group?: string) => void | Promise<void>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

function getValueAtPath<T extends Record<string, unknown>>(item: T, path: string): unknown {
    if (!path) return undefined;
    return path.split('.').reduce<unknown>((value, part) => {
        if (!value || typeof value !== 'object') return undefined;
        return (value as Record<string, unknown>)[part];
    }, item);
}

export const SarakManagementGrid = <TItem extends Record<string, unknown> = Record<string, unknown>>({
    data,
    load,
    groupBy,
    ghostGroups = [],
    mapping,
    label,
    description,
    headerActions = [],
    groupActions = [],
    formMapping,
    onAction,
    onToggle,
    onDelete,
    onCreate,
}: SarakManagementGridProps<TItem>) => {
    const { getContainerStyles, getHeaderStyles, getGridStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();
    const headerLayout = getHeaderStyles();
    const gridLayout = getGridStyles();
    const text = useLibraryText();
    const [activeModal, setActiveModal] = useState<{ group?: string } | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const {
        groups,
        loading,
        error,
        load: loadData,
        handleToggle,
        handleDelete,
    } = useManagementGrid<TItem>({ data, load, groupBy, ghostGroups, getVal: getValueAtPath, onToggle, onDelete });

    const runAction = async (action: SarakManagementAction, group?: string): Promise<void> => {
        setActionError(null);
        try {
            await onAction?.(action.action, group);
            if (action.opensCreateForm && onCreate) setActiveModal({ group });
        } catch (actionFailure: unknown) {
            setActionError(actionFailure instanceof Error ? actionFailure.message : text('genericLoadError'));
        }
    };

    const canShowAction = (action: SarakManagementAction): boolean => Boolean(onAction || (action.opensCreateForm && onCreate));

    return (
        <div className={`@container ${containerLayout.className}`} style={containerLayout.style}>
            {actionError && <SarakAlert variant="error" title={text('dataLoadErrorTitle')} message={actionError} />}
            {error && <SarakAlert variant="error" title={text('dataLoadErrorTitle')} message={error} />}
            <AnimatePresence>
                {activeModal && onCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--sarak-modal-overlay-color,rgba(0,0,0,0.5))] backdrop-blur-md" style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-lg bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] shadow-2xl relative rounded-[var(--sarak-card-radius,12px)]"
                            style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}
                        >
                            <SarakIconButton
                                onClick={() => setActiveModal(null)}
                                icon={<SarakIcon name="X" size={24} />}
                                variant="ghost"
                                className="absolute z-50"
                                style={{ top: 'var(--sarak-layout-gap-md,16px)', right: 'var(--sarak-layout-gap-md,16px)' }}
                            />
                            {label && <h3 className="text-xl font-bold text-theme-title" style={{ marginBottom: 'var(--sarak-layout-gap-md,16px)' }}>{label}</h3>}
                            <SarakForm<Record<string, unknown>>
                                label={activeModal.group}
                                mapping={formMapping}
                                mode="create"
                                onSubmit={(formData) => onCreate(formData, activeModal.group)}
                                onSuccess={async () => {
                                    setActiveModal(null);
                                    await loadData();
                                }}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {(label || description || headerActions.some(canShowAction)) && (
                <div className={`${headerLayout.className} bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)] rounded-[var(--sarak-card-radius,12px)]`} style={{ padding: 'var(--sarak-layout-gap-md,16px)', gap: headerLayout.style.gap }}>
                    <div>
                        {label && <h2 className="text-xl font-bold text-theme-title">{label}</h2>}
                        {description && <p className="text-sm text-theme-muted">{description}</p>}
                    </div>
                    <div className="flex" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 1.5)' }}>
                        {headerActions.filter(canShowAction).map((action) => (
                            <SarakButton key={action.label} onClick={() => void runAction(action)}>
                                {action.icon === 'plus' && <SarakIcon name="Plus" size={16} />}
                                {action.label}
                            </SarakButton>
                        ))}
                    </div>
                </div>
            )}

            <div className={gridLayout.className} style={gridLayout.style}>
                {loading ? (
                    [...Array(6)].map((_, index) => (
                        <div key={`skeleton-${index}`} className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] animate-pulse rounded-[var(--sarak-card-radius,12px)]" style={{ height: 'calc(var(--sarak-layout-gap-md,16px) * 16)' }} />
                    ))
                ) : (
                    (Object.entries(groups) as [string, TItem[]][]).map(([groupName, items]) => (
                        <ManagementGroupCard
                            key={groupName}
                            groupName={groupName}
                            items={items}
                            containerLayout={containerLayout}
                            groupActions={groupActions.filter(canShowAction)}
                            mapping={mapping}
                            onAction={(action) => runAction(action, groupName)}
                            onToggle={onToggle ? handleToggle : undefined}
                            onDelete={onDelete ? handleDelete : undefined}
                            getVal={getValueAtPath}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
