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
            className={twMerge(`rounded-[var(--sarak-card-radius,12px)] border overflow-hidden transition-all h-full`, containerLayout.className, 
                isConfigured ? 'bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)]' : 'bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] opacity-50 grayscale'
            )}
            style={{ transitionDuration: 'var(--duration-normal, 0.3s)' }}
        >
            <div className="border-b border-[var(--border-color,#334155)] flex justify-between items-center bg-white/[0.02]" style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}>
                <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                    <div className="rounded-[var(--sarak-card-radius,12px)]" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) / 2.5)', borderRadius: 'var(--sarak-card-radius,12px)', backgroundColor: isConfigured ? 'var(--sarak-shadow-glow,rgba(59,130,246,0.5))' : 'rgba(255,255,255,0.05)', color: isConfigured ? 'var(--sarak-primary-color,#3b82f6)' : 'rgba(255,255,255,0.2)' }}>
                        <Cloud className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-white uppercase text-xs" style={{ letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>{groupName}</h3>
                </div>
                <div className="flex" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 6)' }}>
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

            <div className={twMerge("flex-1 max-h-[340px] overflow-y-auto custom-scrollbar", containerLayout.className)} style={{ padding: 'var(--sarak-layout-gap-md,16px)', gap: containerLayout.style?.gap }}>
                {isConfigured ? (
                    items.map((item: TItem) => {
                        const itemId = String(getVal(item, mapping.id) || '');
                        const isActive = Boolean(getVal(item, mapping.isActive));
                        const status = String(getVal(item, mapping.status) || '');
                        const errorMsg = String(getVal(item, mapping.error || '') || '');
                        return (
                            <div 
                                key={itemId} 
                                className={`border transition-all rounded-[var(--sarak-card-radius,12px)] ${
                                    isActive ? 'bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)]' : 'bg-[var(--sarak-modal-overlay-color,rgba(0,0,0,0.5))] border-transparent opacity-40'
                                }`}
                                style={{ padding: 'var(--sarak-layout-gap-md,16px)', transitionDuration: 'var(--duration-normal, 0.3s)' }}
                            >
                                <div className="flex justify-between items-start" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) / 3)' }}>
                                    <div className={twMerge("truncate", containerLayout.className)} style={{ padding: 0, gap: 'calc(var(--sarak-layout-gap-md,16px) / 4)' }}>
                                        <span className="text-2xs font-black uppercase tracking-widest" style={{ color: 'var(--sarak-primary-color,#3b82f6)' }}>{String(getVal(item, mapping.title) || '')}</span>
                                        <span className="text-2xs font-mono text-white/30 truncate max-w-[140px]">
                                            {String(getVal(item, mapping.description || '') || '') || '************'}
                                        </span>
                                    </div>
                                    <SarakIconButton 
                                        onClick={() => handleToggle(itemId)}
                                        icon={isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                        variant="ghost"
                                        className="hover:scale-110"
                                        style={{ color: isActive ? 'var(--sarak-status-success-color,#22c55e)' : 'rgba(255,255,255,0.2)' }}
                                    />
                                </div>
                                <div className="flex items-center justify-between" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) / 1.5)' }}>
                                    <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                                        <div 
                                            className="w-1.5 h-1.5 rounded-full" 
                                            style={{ 
                                                backgroundColor: status === 'active' ? 'var(--sarak-status-success-color,#22c55e)' : status === 'error' ? 'var(--sarak-status-error-color,#ef4444)' : 'rgba(156, 163, 175, 0.5)',
                                                boxShadow: status === 'active' ? '0 0 8px var(--sarak-status-success-color,#22c55e)' : 'none'
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
                                        className="hover:text-[var(--sarak-status-error-color,#ef4444)]"
                                    />
                                </div>
                                {errorMsg && (
                                    <div className="rounded-[var(--sarak-card-radius,12px)] border" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) / 3)', padding: 'calc(var(--sarak-layout-gap-md,16px) / 2)', backgroundColor: 'var(--sarak-status-error-color-bg,rgba(239,68,68,0.1))', borderColor: 'var(--sarak-status-error-color-border,rgba(239,68,68,0.2))' }}>
                                        <p className="text-3xs font-bold leading-tight" style={{ color: 'var(--sarak-status-error-color,#ef4444)' }}>{errorMsg}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className={twMerge("items-center justify-center text-center opacity-20", containerLayout.className)} style={{ gap: containerLayout.style?.gap, paddingTop: 'calc(calc(var(--sarak-layout-gap-md,16px)*2) * 1.5)', paddingBottom: 'calc(calc(var(--sarak-layout-gap-md,16px)*2) * 1.5)' }}>
                        <Settings2 className="w-10 h-10" />
                        <p className="text-2xs font-black uppercase" style={{ letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>Offline</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
