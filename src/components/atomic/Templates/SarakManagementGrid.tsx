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

    const groups = data.reduce((acc, item) => {
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
        <div className="flex flex-col" style={{ gap: 'var(--theme-gap, 1.5rem)' }}>
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" style={{ padding: 'var(--theme-pad)' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--animation-speed')) || 0.4 }}
                            className="w-full max-w-lg bg-theme-card border-theme shadow-2xl relative rounded-theme"
                            style={{ padding: 'calc(var(--theme-pad) * 1.5)' }}
                        >
                            <button onClick={() => setActiveModal(null)} className="absolute p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all" style={{ top: 'var(--theme-pad)', right: 'var(--theme-pad)' }}>
                                <X size={24} />
                            </button>
                            <h3 className="text-xl font-black text-white uppercase tracking-wider" style={{ marginBottom: 'var(--theme-gap)', fontWeight: 'var(--heading-weight)' }}>
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
                <div className="flex justify-between items-center bg-theme-card border-theme rounded-theme" style={{ padding: 'var(--theme-pad)' }}>
                    <div>
                        <h2 className="text-xl font-black text-white" style={{ fontWeight: 'var(--heading-weight)' }}>Gestão Operacional</h2>
                        <p className="text-xs text-white/30 font-medium">Configurações granulares de identidades e provedores.</p>
                    </div>
                    <div className="flex" style={{ gap: 'calc(var(--theme-gap) / 1.5)' }}>
                        {headerActions.map(action => (
                            <button
                                key={action.label}
                                onClick={() => handleAction(action.action)}
                                className="flex items-center bg-blue-600 text-white rounded-theme font-black text-[11px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                                style={{ gap: 'calc(var(--theme-gap) / 3)', padding: 'calc(var(--theme-pad) / 2) var(--theme-pad)', transitionDuration: 'var(--animation-speed, 0.3s)' }}
                            >
                                <Plus size={16} />
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--theme-gap, 1.5rem)' }}>
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-theme-card border-theme animate-pulse rounded-theme" style={{ height: 'calc(var(--theme-pad) * 16)' }} />
                    ))
                ) : (
                    Object.entries(groups).map(([groupName, items]) => {
                        const isConfigured = items.length > 0;
                        return (
                            <motion.div
                                key={groupName}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex flex-col rounded-theme border overflow-hidden transition-all h-full ${
                                    isConfigured ? 'bg-theme-card border-theme' : 'bg-theme-card border-theme opacity-50 grayscale'
                                }`}
                                style={{ transitionDuration: 'var(--animation-speed, 0.5s)' }}
                            >
                                <div className="border-b border-theme flex justify-between items-center bg-white/[0.02]" style={{ padding: 'var(--theme-pad)' }}>
                                    <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 2)' }}>
                                        <div className={`rounded-xl ${isConfigured ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-white/20'}`} style={{ padding: 'calc(var(--theme-pad) / 2.5)' }}>
                                            <Cloud className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-black text-white uppercase text-xs tracking-[0.2em]">{groupName}</h3>
                                    </div>
                                    <div className="flex" style={{ gap: 'calc(var(--theme-gap) / 6)' }}>
                                        {groupActions.map(action => (
                                            <button
                                                key={action.label}
                                                onClick={() => handleAction(action.action, groupName)}
                                                className="p-2 hover:bg-white/10 rounded-xl text-blue-400/60 hover:text-blue-400 transition-all"
                                                title={action.label}
                                            >
                                                {action.icon === 'plus' ? <Plus size={18} /> : <Settings2 size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 max-h-[340px] overflow-y-auto custom-scrollbar flex flex-col" style={{ padding: 'var(--theme-pad)', gap: 'calc(var(--theme-gap) / 2)' }}>
                                    {isConfigured ? (
                                        items.map(item => {
                                            const itemId = getVal(item, mapping.id);
                                            const isActive = getVal(item, mapping.isActive);
                                            const status = getVal(item, mapping.status);
                                            const errorMsg = getVal(item, mapping.error);
                                            return (
                                                <div 
                                                    key={itemId} 
                                                    className={`border transition-all rounded-theme ${
                                                        isActive ? 'bg-theme-card border-theme' : 'bg-black/40 border-transparent opacity-40'
                                                    }`}
                                                    style={{ padding: 'var(--theme-pad)', transitionDuration: 'var(--animation-speed, 0.3s)' }}
                                                >
                                                    <div className="flex justify-between items-start" style={{ marginBottom: 'calc(var(--theme-gap) / 3)' }}>
                                                        <div className="flex flex-col truncate">
                                                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{getVal(item, mapping.title)}</span>
                                                            <span className="text-[10px] font-mono text-white/30 truncate max-w-[140px]">
                                                                {getVal(item, mapping.description) || '************'}
                                                            </span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleToggle(itemId)}
                                                            className={`transition-all hover:scale-110 ${isActive ? 'text-emerald-500' : 'text-white/20'}`}
                                                            style={{ transitionDuration: 'var(--animation-speed, 0.2s)' }}
                                                        >
                                                            {isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between" style={{ marginTop: 'calc(var(--theme-gap) / 1.5)' }}>
                                                        <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 2)' }}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                                status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 
                                                                status === 'error' ? 'bg-rose-500' : 'bg-gray-600 animate-pulse'
                                                            }`} />
                                                            <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">
                                                                {status === 'active' ? 'Conectado' : status === 'error' ? 'Falha' : 'Validando...'}
                                                            </span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDelete(itemId)}
                                                            className="p-1.5 text-white/10 hover:text-rose-500 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    {errorMsg && (
                                                        <div className="rounded-theme border border-rose-500/10" style={{ marginTop: 'calc(var(--theme-gap) / 3)', padding: 'calc(var(--theme-pad) / 2)', backgroundColor: 'rgba(244, 63, 94, 0.05)' }}>
                                                            <p className="text-[8px] text-rose-400 font-bold leading-tight">{errorMsg}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-20" style={{ gap: 'calc(var(--theme-gap) / 2)' }}>
                                            <Settings2 className="w-10 h-10" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Offline</p>
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
