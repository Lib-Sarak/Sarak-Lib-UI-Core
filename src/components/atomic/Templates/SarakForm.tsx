import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../../shared/services/api';

interface SarakFormProps {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>; // { field_name: "Label do Input" }
    mode?: 'create' | 'edit';
    initialData?: Record<string, any>;
    actions?: Array<{
        label: string;
        endpoint: string;
        method: 'POST' | 'PATCH' | 'DELETE';
    }>;
    onSuccess?: () => void;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

/**
 * SarakForm Genérico (v6.2)
 * 
 * Gera formulários de configuração dinamicamente baseados no manifesto.
 * Idela para abas de "Preferências" e "Configurações" de módulos.
 */
export const SarakForm: React.FC<SarakFormProps> = ({ 
    endpoint, 
    label, 
    mapping, 
    actions, 
    mode = 'edit', 
    initialData = {}, 
    onSuccess 
}) => {
    const [formData, setFormData] = useState<Record<string, any>>(initialData);
    const [loading, setLoading] = useState(mode === 'edit');
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get(endpoint);
            setFormData(response.data);
        } catch (err) {
            console.error('[SarakForm] Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mode === 'edit') {
            fetchData();
        } else {
            // Em modo create, garantir que campos definidos no mapping existam no formData
            if (mapping) {
                const base: any = { ...initialData };
                Object.keys(mapping).forEach(k => { if (base[k] === undefined) base[k] = ''; });
                setFormData(base);
            }
        }
    }, [endpoint, mode]);

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        const defaultMethod = mode === 'create' ? 'POST' : 'PATCH';
        const action = actions?.[0] || { endpoint: endpoint, method: defaultMethod };
        try {
            setSaving(true);
            setStatus(null);
            
            const method = action.method.toLowerCase();
            const response = await (api as any)[method](action.endpoint, formData);
            
            setStatus({ type: 'success', message: 'Configurações sincronizadas com sucesso.' });
            if (onSuccess) onSuccess();
            setTimeout(() => setStatus(null), 3000);
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'Falha ao salvar.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="bg-theme-card border-theme flex flex-col items-center justify-center animate-pulse rounded-theme" style={{ padding: 'calc(var(--theme-pad) * 3)', gap: 'calc(var(--theme-gap) / 2)' }}>
            <div className="w-12 h-12 bg-white/10 rounded-full" />
            <div className="h-4 w-48 bg-white/5 rounded" />
        </div>
    );

    const fields = mapping ? Object.keys(mapping) : Object.keys(formData);

    return (
        <div className="bg-theme-card border-theme relative overflow-hidden group rounded-theme" style={{ padding: 'calc(var(--theme-pad) * 2)' }}>
            {/* Header Area */}
            <div className="flex items-center justify-between relative z-10" style={{ marginBottom: 'calc(var(--theme-gap) * 1.5)' }}>
                <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 2)' }}>
                    <div className="p-3 bg-[var(--theme-primary-bg)] rounded-2xl border border-[var(--theme-primary-border)]" style={{ padding: 'calc(var(--theme-pad) / 2)' }}>
                        <Settings size={20} className="text-[var(--theme-primary)]" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight" style={{ fontWeight: 'var(--heading-weight)' }}>{label}</h3>
                        <p className="text-2xs font-bold text-white/20 uppercase tracking-[0.2em]">Painel de Controle Atômico</p>
                    </div>
                </div>
                <div className="flex items-center bg-[var(--theme-success-bg)] rounded-xl border border-[var(--theme-success-border)] text-[var(--theme-success)] text-2xs font-black uppercase tracking-widest" style={{ gap: 'calc(var(--theme-gap) / 4)', padding: 'calc(var(--theme-pad) / 3) calc(var(--theme-pad) / 1.5)' }}>
                    <ShieldCheck size={12} /> Sincronização Segura
                </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 relative z-10" style={{ gap: 'var(--theme-gap, 1.5rem)', marginBottom: 'calc(var(--theme-gap) * 1.5)' }}>
                {fields.map((key) => (
                    <div key={key} className="flex flex-col" style={{ gap: 'calc(var(--theme-gap) / 4)' }}>
                        <label className="text-2xs font-black text-white/30 uppercase tracking-widest pl-1 block">
                            {mapping ? mapping[key] : key.replace(/_/g, ' ')}
                        </label>
                        <input
                            type="text"
                            value={formData[key] || ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="w-full bg-theme-card border-theme text-white text-sm font-medium focus:border-[var(--theme-primary-border)] outline-none transition-all placeholder:text-white/10 rounded-theme"
                            style={{ padding: 'calc(var(--theme-pad) / 1.5) var(--theme-pad)', transitionDuration: 'var(--animation-speed, 0.3s)' }}
                            placeholder={`Digite o ${mapping ? mapping[key] : key}...`}
                        />
                    </div>
                ))}
            </div>

            {/* Status Message */}
            {status && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center border rounded-theme`}
                    style={{ 
                        marginBottom: 'var(--theme-gap)', 
                        padding: 'var(--theme-pad)', 
                        gap: 'calc(var(--theme-gap) / 3)',
                        backgroundColor: status.type === 'success' ? 'var(--theme-success-bg)' : 'var(--theme-error-bg)',
                        borderColor: status.type === 'success' ? 'var(--theme-success-border)' : 'var(--theme-error-border)',
                        color: status.type === 'success' ? 'var(--theme-success)' : 'var(--theme-error)'
                    }}
                >
                    {status.type === 'success' ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                    <span className="text-xs font-bold">{status.message}</span>
                </motion.div>
            )}

            {/* Actions Area */}
            <div className="flex justify-end border-t border-theme" style={{ paddingTop: 'var(--theme-gap)' }}>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center bg-[var(--theme-primary)] hover:opacity-90 text-white rounded-theme text-xs font-black uppercase tracking-widest shadow-xl shadow-[var(--theme-primary-focus)] transition-all disabled:opacity-50"
                    style={{ 
                        gap: 'calc(var(--theme-gap) / 3)', 
                        padding: 'calc(var(--theme-pad) / 1.5) var(--theme-pad)',
                        transitionDuration: 'var(--animation-speed, 0.3s)'
                    }}
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={16} />
                    )}
                    {saving ? 'Sincronizando...' : 'Salvar Alterações'}
                </motion.button>
            </div>
        </div>
    );
};

export default SarakForm;

