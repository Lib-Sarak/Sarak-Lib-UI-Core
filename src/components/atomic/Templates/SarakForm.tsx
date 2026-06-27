import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../../shared/services/api';
import { SarakInput } from '../Inputs';
import { SarakButton } from '../Buttons';
import { SarakGrid, SarakFormGroup } from '../Layouts';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { twMerge } from 'tailwind-merge';
import { useFormData } from './hooks/useFormData';

interface SarakFormProps<TData extends Record<string, unknown>> {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>; // { field_name: "Label do Input" }
    mode?: 'create' | 'edit';
    initialData?: TData;
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
export const SarakForm = <TData extends Record<string, unknown> = Record<string, unknown>>({ 
    endpoint, 
    label, 
    mapping, 
    actions, 
    mode = 'edit', 
    initialData = {} as TData, 
    onSuccess,
    role = 'neutral', 
    density = 'standard', 
    importance = 'base' 
}: SarakFormProps<TData>) => {
    const { formData, loading, saving, status, handleChange, handleSave } = useFormData<TData>(endpoint, mode, initialData, mapping, actions, onSuccess);

    const { getContainerStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();

    if (loading) return (
        <div className={twMerge("bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] items-center justify-center animate-pulse rounded-[var(--sx-radius-md)]", containerLayout.className)} style={{ padding: 'calc(var(--sx-spacing-md) * 3)', gap: 'calc(var(--sx-spacing-md) / 2)' }}>
            <div className="w-12 h-12 bg-white/10 rounded-full" />
            <div className="h-4 w-48 bg-white/5 rounded" />
        </div>
    );

    const fields = mapping ? Object.keys(mapping) : Object.keys(formData);

    return (
        <div className={twMerge("bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] relative overflow-hidden group rounded-[var(--sx-radius-md)]", containerLayout.className)} style={{ padding: 'calc(var(--sx-spacing-md) * 2)' }}>
            {/* Header Area */}
            <div className="flex items-center justify-between relative z-10" style={{ marginBottom: 'calc(var(--sx-spacing-md) * 1.5)' }}>
                <div className="flex items-center" style={{ gap: 'calc(var(--sx-spacing-md) / 2)' }}>
                    <div className="p-3 bg-[var(--sx-color-primary-surface)] rounded-2xl border border-[var(--sx-color-border-base)]" style={{ padding: 'calc(var(--sx-spacing-md) / 2)' }}>
                        <Settings size={20} className="text-[var(--sx-color-primary-base)]" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight" style={{ fontWeight: 'var(--heading-weight)' }}>{label}</h3>
                        <p className="text-2xs font-bold text-white/20 uppercase tracking-[0.2em]">Painel de Controle Atômico</p>
                    </div>
                </div>
                <div className="flex items-center bg-[var(--sx-color-success-surface)] rounded-xl border border-[var(--sx-color-success-border)] text-[var(--sx-color-success-base)] text-2xs font-black uppercase tracking-widest" style={{ gap: 'calc(var(--sx-spacing-md) / 4)', padding: 'calc(var(--sx-spacing-md) / 3) calc(var(--sx-spacing-md) / 1.5)' }}>
                    <ShieldCheck size={12} /> Sincronização Segura
                </div>
            </div>

            {/* Form Fields Grid (Controlado por SarakGrid) */}
            <SarakGrid className="relative z-10" style={{ marginBottom: 'calc(var(--sx-spacing-md) * 1.5)' }}>
                {fields.map((key) => (
                    <SarakFormGroup key={key}>
                        <label className="text-2xs font-black text-white/30 uppercase tracking-widest pl-1 block">
                            {mapping ? mapping[key] : key.replace(/_/g, ' ')}
                        </label>
                        <SarakInput
                            value={String(formData[key] || '')}
                            onChange={(e) => handleChange(key, e.target.value)}
                            placeholder={`Digite o ${mapping ? mapping[key] : key}...`}
                        />
                    </SarakFormGroup>
                ))}
            </SarakGrid>

            {/* Status Message */}
            {status && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center border rounded-[var(--sx-radius-md)]`}
                    style={{ 
                        marginBottom: 'var(--sx-spacing-md)', 
                        padding: 'var(--sx-spacing-md)', 
                        gap: 'calc(var(--sx-spacing-md) / 3)',
                        backgroundColor: status.type === 'success' ? 'var(--sx-color-success-surface)' : 'var(--sx-color-danger-surface)',
                        borderColor: status.type === 'success' ? 'var(--sx-color-success-border)' : 'var(--sx-color-danger-border)',
                        color: status.type === 'success' ? 'var(--sx-color-success-base)' : 'var(--sx-color-danger-base)'
                    }}
                >
                    {status.type === 'success' ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                    <span className="text-xs font-bold">{status.message}</span>
                </motion.div>
            )}

            {/* Actions Area */}
            <div className="flex justify-end border-t border-[var(--sx-color-border-base)]" style={{ paddingTop: 'var(--sx-spacing-md)' }}>
                <SarakButton
                    onClick={handleSave}
                    disabled={saving}
                    className="shadow-xl"
                    style={{ boxShadow: '0 10px 20px -10px var(--sx-color-primary-glow)' }}
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={16} />
                    )}
                    {saving ? 'Sincronizando...' : 'Salvar Alterações'}
                </SarakButton>
            </div>
        </div>
    );
};

export default SarakForm;

