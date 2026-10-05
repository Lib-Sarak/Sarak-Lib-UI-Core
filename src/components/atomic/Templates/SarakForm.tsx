import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../../shared/services/api';
import { SarakInput } from '../Inputs';
import { SarakButton } from '../Buttons';
import { SarakGrid, SarakFormGroup } from '../Layouts';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useFormData } from './hooks/useFormData';

export interface SarakFormProps<TData extends Record<string, unknown>> {
    /**
     * URL usada para buscar os dados em `edit` e, por padrão, salvar em ambos
     * os modos. Obrigatória; `actions[0]` pode substituir o destino do salvamento.
     */
    endpoint: string;
    /** Título exibido no cabeçalho; sem a prop, o cabeçalho fica sem texto. */
    label?: string;
    /**
     * Define as chaves e os rótulos dos campos. Sem ela, as chaves de
     * `formData` viram campos e `_` é trocado por espaço; em `create`, as
     * chaves mapeadas ausentes começam como texto vazio.
     */
    mapping?: Record<string, string>; // { field_name: "Label do Input" }
    /**
     * Escolhe a carga inicial: `edit` busca `endpoint` e é o padrão; `create`
     * não busca, usa `initialData` e salva por padrão com `POST`.
     */
    mode?: 'create' | 'edit';
    /**
     * Dados iniciais; por padrão, um objeto vazio. Em `edit`, a resposta da
     * busca os substitui; em `create`, são preservados. A prop é lida na
     * montagem, então mudanças posteriores não reinicializam o formulário.
     */
    initialData?: TData;
    /**
     * Configura o destino e o método do botão Salvar; somente `actions[0]` é
     * usado. Sem primeira entrada, usa `endpoint` com `POST` em `create` ou
     * `PATCH` em `edit`. `label` e as entradas seguintes não são exibidos nem
     * usados; em `DELETE`, `formData` vai como configuração, não como corpo.
     */
    actions?: Array<{
        label: string;
        endpoint: string;
        method: 'POST' | 'PATCH' | 'DELETE';
    }>;
    /**
     * Chamado depois de um salvamento bem-sucedido. Sem a prop, o formulário
     * salva e exibe o status, mas não notifica o chamador.
     */
    onSuccess?: () => void;
    /** Opção sem efeito nesta implementação; omiti-la ou defini-la não altera a apresentação. */
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    /** Opção sem efeito nesta implementação; omiti-la ou defini-la não altera a densidade. */
    density?: 'compact' | 'standard' | 'spacious';
    /** Opção sem efeito nesta implementação; omiti-la ou defini-la não altera a ênfase visual. */
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
        <div className={mergeSarakClasses("bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] items-center justify-center animate-pulse rounded-[var(--sarak-card-radius,12px)]", containerLayout.className)} style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 3)', gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
            <div className="w-12 h-12 bg-white/10 rounded-full" />
            <div className="h-4 w-48 bg-white/5 rounded" />
        </div>
    );

    const fields = mapping ? Object.keys(mapping) : Object.keys(formData);

    return (
        <div className={mergeSarakClasses("bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] relative overflow-hidden group rounded-[var(--sarak-card-radius,12px)]", containerLayout.className)} style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 2)' }}>
            {/* Header Area */}
            <div className="flex items-center justify-between relative z-10" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}>
                <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                    <div className="bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] rounded-2xl border border-[var(--border-color,#334155)]" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                        <Settings size={20} className="text-[var(--sarak-primary-color,#3b82f6)]" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight" style={{ fontWeight: 'var(--sarak-h1-weight,700)' }}>{label}</h3>
                        <p className="text-2xs font-bold text-white/20 uppercase" style={{ letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>Painel de Controle Atômico</p>
                    </div>
                </div>
                <div className="flex items-center bg-[var(--sarak-status-success-color-bg,rgba(34,197,94,0.1))] rounded-xl border border-[var(--sarak-status-success-color-border,rgba(34,197,94,0.2))] text-[var(--sarak-status-success-color,#22c55e)] text-2xs font-black uppercase tracking-widest" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 4)', padding: 'calc(var(--sarak-layout-gap-md,16px) / 3) calc(var(--sarak-layout-gap-md,16px) / 1.5)' }}>
                    <ShieldCheck size={12} /> Sincronização Segura
                </div>
            </div>

            {/* Form Fields Grid (Controlado por SarakGrid) */}
            <SarakGrid className="relative z-10" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}>
                {fields.map((key) => (
                    <SarakFormGroup key={key}>
                        <label className="text-2xs font-black text-white/30 uppercase tracking-widest block" style={{ paddingLeft: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
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
                    className={`flex items-center border rounded-[var(--sarak-card-radius,12px)]`}
                    style={{ 
                        marginBottom: 'var(--sarak-layout-gap-md,16px)', 
                        padding: 'var(--sarak-layout-gap-md,16px)', 
                        gap: 'calc(var(--sarak-layout-gap-md,16px) / 3)',
                        backgroundColor: status.type === 'success' ? 'var(--sarak-status-success-color-bg,rgba(34,197,94,0.1))' : 'var(--sarak-status-error-color-bg,rgba(239,68,68,0.1))',
                        borderColor: status.type === 'success' ? 'var(--sarak-status-success-color-border,rgba(34,197,94,0.2))' : 'var(--sarak-status-error-color-border,rgba(239,68,68,0.2))',
                        color: status.type === 'success' ? 'var(--sarak-status-success-color,#22c55e)' : 'var(--sarak-status-error-color,#ef4444)'
                    }}
                >
                    {status.type === 'success' ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                    <span className="text-xs font-bold">{status.message}</span>
                </motion.div>
            )}

            {/* Actions Area */}
            <div className="flex justify-end border-t border-[var(--border-color,#334155)]" style={{ paddingTop: 'var(--sarak-layout-gap-md,16px)' }}>
                <SarakButton
                    onClick={handleSave}
                    disabled={saving}
                    className="shadow-xl"
                    style={{ boxShadow: '0 var(--sarak-action-glow-shadow-offset-y, 10px) var(--sarak-action-glow-shadow-blur, 20px) calc(var(--sarak-action-glow-shadow-spread, 10px) * -1) var(--sarak-shadow-glow,rgba(59,130,246,0.5))' }}
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

