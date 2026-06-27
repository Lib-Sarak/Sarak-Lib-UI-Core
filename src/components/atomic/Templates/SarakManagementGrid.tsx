import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Trash2, 
    ToggleLeft, 
    ToggleRight, 
    Settings2, 
    AlertCircle, 
    RefreshCw,
    ShieldCheck,
    Cloud,
    X
} from 'lucide-react';
import api from '../../../shared/services/api';
import { SarakForm } from './SarakForm';
import { SarakButton, SarakIconButton } from '../Buttons';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { twMerge } from 'tailwind-merge';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { ManagementGroupCard } from './components/ManagementGroupCard';
import { useManagementGrid } from './hooks/useManagementGrid';

interface SarakManagementGridProps<TItem extends Record<string, unknown>> {
    endpoint: string;
    groupBy: string;
    ghostGroups?: string[];
    mapping: {
        id: string;
        title: string;
        status: string;
        isActive: string;
        description?: string;
        error?: string;
    };
    headerActions?: {
        label: string;
        action: string;
    }[];
    groupActions?: {
        label: string;
        icon?: 'plus' | 'settings';
        action: string;
    }[];
    formMapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

export const SarakManagementGrid = <TItem extends Record<string, unknown> = Record<string, unknown>>({ 
    endpoint, 
    groupBy, 
    ghostGroups = [],
    mapping,
    headerActions = [],
    groupActions = [],
    formMapping
}: SarakManagementGridProps<TItem>) => {
    const { getContainerStyles, getHeaderStyles, getGridStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();
    const headerLayout = getHeaderStyles();
    const gridLayout = getGridStyles();

    const getVal = (obj: TItem, path: string): unknown => {
        if (!path) return undefined;
        return path.split('.').reduce((acc: unknown, part) => {
            if (acc && typeof acc === 'object') {
                return (acc as Record<string, unknown>)[part];
            }
            return undefined;
        }, obj as unknown);
    };

    const {
        groups,
        loading,
        activeModal,
        setActiveModal,
        load,
        handleToggle,
        handleDelete,
        handleAction
    } = useManagementGrid(endpoint, groupBy, ghostGroups, getVal);

    return (
        <div className={containerLayout.className} style={containerLayout.style}>
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--sx-color-overlay-base)] backdrop-blur-md" style={{ padding: 'var(--sx-spacing-md)' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--animation-speed')) || 0.4 }}
                            className="w-full max-w-lg bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] shadow-2xl relative rounded-[var(--sx-radius-md)]"
                            style={{ padding: 'calc(var(--sx-spacing-md) * 1.5)' }}
                        >
                            <SarakIconButton 
                                onClick={() => setActiveModal(null)} 
                                icon={<X size={24} />}
                                variant="ghost"
                                className="absolute hover:bg-white/5 text-white/20 hover:text-white transition-all z-50" 
                                style={{ top: 'var(--sx-spacing-md)', right: 'var(--sx-spacing-md)' }} 
                            />
                            <h3 className="text-xl font-black text-white uppercase tracking-wider" style={{ marginBottom: 'var(--sx-spacing-md)', fontWeight: 'var(--heading-weight)' }}>
                                {activeModal.group ? `Configurar ${activeModal.group}` : 'Nova Identidade'}
                            </h3>
                            <SarakForm 
                                endpoint={endpoint} 
                                label={activeModal.group ? `Conectar ${activeModal.group}` : "Identidade Universal"}
                                mapping={formMapping || {}} 
                                mode="create"
                                initialData={activeModal.group ? { service: activeModal.group } : {}}
                                onSuccess={() => {
                                    setActiveModal(null);
                                    load();
                                }}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {headerActions.length > 0 && (
                <div className={`${headerLayout.className} bg-[var(--sx-color-surface-base)] border border-[var(--sx-color-border-base)] rounded-[var(--sx-radius-md)]`} style={{ padding: 'var(--sx-spacing-md)', gap: headerLayout.style.gap }}>
                    <div>
                        <h2 className="text-xl font-black text-white" style={{ fontWeight: 'var(--heading-weight)' }}>Gestão Operacional</h2>
                        <p className="text-xs text-white/30 font-medium">Configurações granulares de identidades e provedores.</p>
                    </div>
                    <div className="flex" style={{ gap: 'calc(var(--sx-spacing-md) / 1.5)' }}>
                        {headerActions.map(action => (
                            <SarakButton
                                key={action.label}
                                onClick={() => handleAction(action.action)}
                                className="shadow-lg"
                                style={{ boxShadow: '0 10px 20px -10px var(--sx-color-primary-glow)' }}
                            >
                                <Plus size={16} />
                                {action.label}
                            </SarakButton>
                        ))}
                    </div>
                </div>
            )}

            <div className={gridLayout.className} style={gridLayout.style}>
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] animate-pulse rounded-[var(--sx-radius-md)]" style={{ height: 'calc(var(--sx-spacing-md) * 16)' }} />
                    ))
                ) : (
                    (Object.entries(groups) as [string, TItem[]][]).map(([groupName, items]) => {
                        const isConfigured = items.length > 0;
                        return (
                            <ManagementGroupCard 
                                key={groupName}
                                groupName={groupName}
                                items={items}
                                isConfigured={isConfigured}
                                containerLayout={containerLayout}
                                groupActions={groupActions}
                                mapping={mapping}
                                handleAction={handleAction}
                                handleToggle={handleToggle}
                                handleDelete={handleDelete}
                                getVal={getVal}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

