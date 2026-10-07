import { motion } from 'framer-motion';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakInput } from '../Inputs';
import { SarakButton } from '../Buttons';
import { SarakGrid, SarakFormGroup } from '../Layouts';
import { SarakSpinner } from '../Feedback/SarakSpinner';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useFormData } from './hooks/useFormData';

export interface SarakFormProps<TData extends Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre load. */
    data?: TData;
    /** Carrega o formulário pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData>;
    /** Rótulo opcional fornecido pelo host. */
    label?: string;
    /** Define as chaves e os rótulos dos campos. */
    mapping?: Record<string, string>;
    /** Seleciona o modo de preenchimento; create não carrega dado. */
    mode?: 'create' | 'edit';
    /** Valor inicial usado no modo create ou até load concluir. */
    initialData?: TData;
    /** Envia os valores ao host; sem callback, o botão de envio não é exibido. */
    onSubmit?: (data: TData) => void | Promise<void>;
    /** Chamado após um envio bem-sucedido. */
    onSuccess?: () => void | Promise<void>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

export const SarakForm = <TData extends Record<string, unknown> = Record<string, unknown>>({
    data,
    load,
    label,
    mapping,
    mode = 'edit',
    initialData = {} as TData,
    onSubmit,
    onSuccess,
}: SarakFormProps<TData>) => {
    const text = useLibraryText();
    const { formData, loading, saving, status, handleChange, handleSave } = useFormData<TData>({
        data,
        initialData,
        mode,
        mapping,
        load,
        onSubmit,
        onSuccess,
    });
    const { getContainerStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();

    if (loading) {
        return (
            <div className={mergeSarakClasses(
                'flex items-center justify-center animate-pulse rounded-[var(--sarak-card-radius,12px)]',
                containerLayout.className,
            )} style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 3)' }}>
                <SarakSpinner />
            </div>
        );
    }

    const fields = mapping ? Object.keys(mapping) : Object.keys(formData);

    return (
        <div className={mergeSarakClasses(
            'relative overflow-hidden group rounded-[var(--sarak-card-radius,12px)]',
            containerLayout.className,
        )} style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 2)' }}>
            {label && (
                <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)', marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}>
                    <SarakIcon name="Settings" size={20} className="text-[var(--sarak-primary-color,#3b82f6)]" />
                    <h3 className="text-2xl font-black text-theme-title tracking-tight" style={{ fontWeight: 'var(--sarak-h1-weight,700)' }}>
                        {label}
                    </h3>
                </div>
            )}

            <SarakGrid className="relative z-10" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 1.5)' }}>
                {fields.map((key) => {
                    const fieldLabel = mapping?.[key] ?? key.replace(/_/g, ' ');
                    return (
                        <SarakFormGroup key={key}>
                            <label className="text-2xs font-black text-theme-muted uppercase tracking-widest block" style={{ paddingLeft: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
                                {fieldLabel}
                            </label>
                            <SarakInput
                                value={String(formData[key] ?? '')}
                                onChange={(event) => handleChange(key, event.target.value)}
                                placeholder={text('formFieldPlaceholder', { field: fieldLabel })}
                            />
                        </SarakFormGroup>
                    );
                })}
            </SarakGrid>

            {status && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role={status.type === 'error' ? 'alert' : 'status'}
                    className="flex items-center border rounded-[var(--sarak-card-radius,12px)]"
                    style={{
                        marginBottom: 'var(--sarak-layout-gap-md,16px)',
                        padding: 'var(--sarak-layout-gap-md,16px)',
                        gap: 'calc(var(--sarak-layout-gap-md,16px) / 3)',
                        backgroundColor: status.type === 'success' ? 'var(--sarak-status-success-color-bg,rgba(34,197,94,0.1))' : 'var(--sarak-status-error-color-bg,rgba(239,68,68,0.1))',
                        borderColor: status.type === 'success' ? 'var(--sarak-status-success-color-border,rgba(34,197,94,0.2))' : 'var(--sarak-status-error-color-border,rgba(239,68,68,0.2))',
                        color: status.type === 'success' ? 'var(--sarak-status-success-color,#22c55e)' : 'var(--sarak-status-error-color,#ef4444)',
                    }}
                >
                    <SarakIcon name={status.type === 'success' ? 'CheckCircle2' : 'AlertCircle'} size={16} />
                    <span className="text-xs font-bold">{status.message}</span>
                </motion.div>
            )}

            {onSubmit && (
                <div className="flex justify-end border-t border-[var(--border-color,#334155)]" style={{ paddingTop: 'var(--sarak-layout-gap-md,16px)' }}>
                    <SarakButton onClick={() => void handleSave()} disabled={saving} className="shadow-xl">
                        {saving ? <SarakSpinner size="sm" /> : <SarakIcon name="Save" size={16} />}
                        {saving ? text('formSaving') : text('formSave')}
                    </SarakButton>
                </div>
            )}
        </div>
    );
};

export default SarakForm;
