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

interface SarakManagementGridProps {
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

export const SarakManagementGrid: React.FC<SarakManagementGridProps> = ({ 
    endpoint, 
    groupBy, 
    ghostGroups = [],
    mapping,
    headerActions = [],
    groupActions = [],
    formMapping
}) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<{ type: string; group?: string } | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get(endpoint);
            setData(res.data || []);
        } catch (e) {
            console.error("[SarakManagementGrid] Erro:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [endpoint]);

    const getVal = (obj: any, path: string) => {
        if (!path) return undefined;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const groups = data.reduce((acc, item: any) => {
        const key = getVal(item, groupBy) || 'outros';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, any[]>);

    ghostGroups.forEach(g => { if (!groups[g]) groups[g] = []; });

    const handleToggle = async (id: string) => {
        try {
            await api.post(`${endpoint}/${id}/toggle`);
            load();
        } catch (e) {
            console.error("Erro toggle:", e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Remover permanentemente?")) return;
        try {
            await api.delete(`${endpoint}/${id}`);
            load();
        } catch (e) {
            console.error("Erro delete:", e);
        }
    };

    const handleAction = (action: string, group?: string) => {
        if (action.includes('modal') || action.includes('add')) {
            setActiveModal({ type: action, group });
        }
    };

    return (
        <div className="flex flex-col" style={{ gap: 'var(--sarak-grid-gap, 1.5rem)' }}>
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
                <div className="flex justify-between items-center bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] rounded-[var(--sx-radius-md)]" style={{ padding: 'var(--sx-spacing-md)' }}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--sarak-grid-gap, 1.5rem)' }}>
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] animate-pulse rounded-[var(--sx-radius-md)]" style={{ height: 'calc(var(--sx-spacing-md) * 16)' }} />
                    ))
                ) : (
                    (Object.entries(groups) as [string, any[]][]).map(([groupName, items]) => {
                        const isConfigured = items.length > 0;
                        return (
                            <motion.div
                                key={groupName}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex flex-col rounded-[var(--sx-radius-md)] border overflow-hidden transition-all h-full ${
                                    isConfigured ? 'bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)]' : 'bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] opacity-50 grayscale'
                                }`}
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

                                <div className="flex-1 max-h-[340px] overflow-y-auto custom-scrollbar flex flex-col" style={{ padding: 'var(--sx-spacing-md)', gap: 'calc(var(--sx-spacing-md) / 2)' }}>
                                    {isConfigured ? (
                                        items.map((item: any) => {
                                            const itemId = getVal(item, mapping.id);
                                            const isActive = getVal(item, mapping.isActive);
                                            const status = getVal(item, mapping.status);
                                            const errorMsg = getVal(item, mapping.error || '');
                                            return (
                                                <div 
                                                    key={itemId} 
                                                    className={`border transition-all rounded-[var(--sx-radius-md)] ${
                                                        isActive ? 'bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)]' : 'bg-[var(--sx-color-overlay-base)] border-transparent opacity-40'
                                                    }`}
                                                    style={{ padding: 'var(--sx-spacing-md)', transitionDuration: 'var(--animation-speed, 0.3s)' }}
                                                >
                                                    <div className="flex justify-between items-start" style={{ marginBottom: 'calc(var(--sx-spacing-md) / 3)' }}>
                                                        <div className="flex flex-col truncate">
                                                            <span className="text-2xs font-black uppercase tracking-widest" style={{ color: 'var(--sx-color-primary-base)' }}>{getVal(item, mapping.title)}</span>
                                                            <span className="text-2xs font-mono text-white/30 truncate max-w-[140px]">
                                                                {getVal(item, mapping.description || '') || '************'}
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
                                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-20" style={{ gap: 'calc(var(--sx-spacing-md) / 2)' }}>
                                            <Settings2 className="w-10 h-10" />
                                            <p className="text-2xs font-black uppercase tracking-[0.2em]">Offline</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

