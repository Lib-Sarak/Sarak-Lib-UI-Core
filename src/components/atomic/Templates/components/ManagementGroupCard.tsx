import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { Cloud, Plus, Settings2, ToggleRight, ToggleLeft, Trash2 } from 'lucide-react';
import { SarakIconButton } from '../../Buttons';

interface ManagementGroupCardProps<TItem extends Record<string, unknown>> {
    groupName: string;
    items: TItem[];
    isConfigured: boolean;
    containerLayout: { className?: string; style?: React.CSSProperties };
    groupActions: { label: string; icon?: 'plus' | 'settings'; action: string; }[];
    mapping: {
        id: string;
        title: string;
        status: string;
        isActive: string;
        description?: string;
        error?: string;
    };
    handleAction: (action: string, group?: string) => void;
    handleToggle: (id: string) => void;
    handleDelete: (id: string) => void;
    getVal: (obj: TItem, path: string) => unknown;
}

export const ManagementGroupCard = <TItem extends Record<string, unknown>>({
    groupName,
    items,
    isConfigured,
    containerLayout,
    groupActions,
    mapping,
    handleAction,
    handleToggle,
    handleDelete,
    getVal
}: ManagementGroupCardProps<TItem>) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={twMerge(`rounded-[var(--sx-radius-md)] border overflow-hidden transition-all h-full`, containerLayout.className, 
                isConfigured ? 'bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)]' : 'bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] opacity-50 grayscale'
            )}
            style={{ transitionDuration: 'var(--animation-speed, 0.5s)' }}
        >
            <div className="border-b border-[var(--sx-color-border-base)] flex justify-between items-center bg-white/[0.02]" style={{ padding: 'var(--sx-spacing-md)' }}>
                <div className="flex items-center" style={{ gap: 'calc(var(--sx-spacing-md) / 2)' }}>
                    <div className="rounded-[var(--sx-radius-md)]" style={{ padding: 'calc(var(--sx-spacing-md) / 2.5)', borderRadius: 'var(--sx-radius-md)', backgroundColor: isConfigured ? 'var(--sx-color-primary-glow)' : 'rgba(255,255,255,0.05)', color: isConfigured ? 'var(--sx-color-primary-base)' : 'rgba(255,255,255,0.2)' }}>
                        <Cloud className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-white uppercase text-xs tracking-[0.2em]">{groupName}</h3>
                </div>
                <div className="flex" style={{ gap: 'calc(var(--sx-spacing-md) / 6)' }}>
                    {groupActions.map(action => (
                        <SarakIconButton
                            key={action.label}
                            onClick={() => handleAction(action.action, groupName)}
                            icon={action.icon === 'plus' ? <Plus size={18} /> : <Settings2 size={16} />}
                            variant="ghost"
                            title={action.label}
                        />
                    ))}
                </div>
            </div>

            <div className={twMerge("flex-1 max-h-[340px] overflow-y-auto custom-scrollbar", containerLayout.className)} style={{ padding: 'var(--sx-spacing-md)', gap: containerLayout.style?.gap }}>
                {isConfigured ? (
                    items.map((item: TItem) => {
                        const itemId = String(getVal(item, mapping.id) || '');
                        const isActive = Boolean(getVal(item, mapping.isActive));
                        const status = String(getVal(item, mapping.status) || '');
                        const errorMsg = String(getVal(item, mapping.error || '') || '');
                        return (
                            <div 
                                key={itemId} 
                                className={`border transition-all rounded-[var(--sx-radius-md)] ${
                                    isActive ? 'bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)]' : 'bg-[var(--sx-color-overlay-base)] border-transparent opacity-40'
                                }`}
                                style={{ padding: 'var(--sx-spacing-md)', transitionDuration: 'var(--animation-speed, 0.3s)' }}
                            >
                                <div className="flex justify-between items-start" style={{ marginBottom: 'calc(var(--sx-spacing-md) / 3)' }}>
                                    <div className={twMerge("truncate", containerLayout.className)} style={{ padding: 0, gap: 'calc(var(--sx-spacing-md) / 4)' }}>
                                        <span className="text-2xs font-black uppercase tracking-widest" style={{ color: 'var(--sx-color-primary-base)' }}>{String(getVal(item, mapping.title) || '')}</span>
                                        <span className="text-2xs font-mono text-white/30 truncate max-w-[140px]">
                                            {String(getVal(item, mapping.description || '') || '') || '************'}
                                        </span>
                                    </div>
                                    <SarakIconButton 
                                        onClick={() => handleToggle(itemId)}
                                        icon={isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                        variant="ghost"
                                        className="hover:scale-110"
                                        style={{ color: isActive ? 'var(--sx-color-success-base)' : 'rgba(255,255,255,0.2)' }}
                                    />
                                </div>
                                <div className="flex items-center justify-between" style={{ marginTop: 'calc(var(--sx-spacing-md) / 1.5)' }}>
                                    <div className="flex items-center" style={{ gap: 'calc(var(--sx-spacing-md) / 2)' }}>
                                        <div 
                                            className="w-1.5 h-1.5 rounded-full" 
                                            style={{ 
                                                backgroundColor: status === 'active' ? 'var(--sx-color-success-base)' : status === 'error' ? 'var(--sx-color-danger-base)' : 'rgba(156, 163, 175, 0.5)',
                                                boxShadow: status === 'active' ? '0 0 8px var(--sx-color-success-base)' : 'none'
                                            }} 
                                        />
                                        <span className="text-3xs font-black text-white/40 uppercase tracking-tighter">
                                            {status === 'active' ? 'Conectado' : status === 'error' ? 'Falha' : 'Validando...'}
                                        </span>
                                    </div>
                                    <SarakIconButton 
                                        onClick={() => handleDelete(itemId)}
                                        icon={<Trash2 size={14} />}
                                        variant="ghost"
                                        className="hover:text-[var(--sx-color-danger-base)]"
                                    />
                                </div>
                                {errorMsg && (
                                    <div className="rounded-[var(--sx-radius-md)] border" style={{ marginTop: 'calc(var(--sx-spacing-md) / 3)', padding: 'calc(var(--sx-spacing-md) / 2)', backgroundColor: 'var(--sx-color-danger-surface)', borderColor: 'var(--sx-color-danger-border)' }}>
                                        <p className="text-3xs font-bold leading-tight" style={{ color: 'var(--sx-color-danger-base)' }}>{errorMsg}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className={twMerge("py-12 items-center justify-center text-center opacity-20", containerLayout.className)} style={{ gap: containerLayout.style?.gap, padding: 0 }}>
                        <Settings2 className="w-10 h-10" />
                        <p className="text-2xs font-black uppercase tracking-[0.2em]">Offline</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
