import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';

/**
 * Tipos estruturais do react-dropzone declarados localmente — os tipos nomeados
 * (`Accept`/`FileRejection`) não resolvem sob `moduleResolution: node`. O formato
 * espelha o contrato real da lib: `accept` = MIME → extensões; `FileRejection` =
 * arquivo + motivos. São aceitos pela assinatura de opções do `useDropzone`.
 */
export type Accept = Record<string, string[]>;
export interface FileRejection {
    file: File;
    errors: Array<{ code: string; message: string }>;
}

export interface SarakUploaderProps {
    label?: string;
    /** Tipos aceitos no formato do react-dropzone (ex.: `{ 'image/*': [] }`). */
    accept?: Accept;
    /** Tamanho máximo por arquivo, em bytes. */
    maxSize?: number;
    multiple?: boolean;
    disabled?: boolean;
    /** Texto-dica abaixo do título da área. */
    hint?: string;
    error?: string;
    className?: string;
    style?: React.CSSProperties;
    /** Recebe os arquivos aceitos (Spec 32: `onChange(value)`). */
    onChange?: (files: File[]) => void;
    /** Recebe as rejeições (ex.: arquivo maior que `maxSize`). */
    onReject?: (rejections: FileRejection[]) => void;
}

/** Borda por estado, espelhando os tokens semânticos da Sarak (Spec 11, Regra 3). */
const borderFor = (dragActive: boolean, dragReject: boolean, hasError: boolean): string => {
    if (dragReject || hasError) return 'var(--sarak-status-error-color,#ef4444)';
    if (dragActive) return 'var(--sarak-primary-color,#3b82f6)';
    return 'var(--sarak-input-border-color, var(--border-color,#334155))';
};

/**
 * Componente Atômico: SarakUploader (Spec 11, Regra 3)
 * Área drag-and-drop acessível sobre `react-dropzone` (peerDependency). Os estados
 * (ocioso, arrastando, rejeitado, erro de tamanho) mudam a borda para os tokens de
 * cor semânticos — `--sx-color-primary` ao arrastar, `--sx-color-danger` ao rejeitar.
 */
export const SarakUploader: React.FC<SarakUploaderProps> = ({
    label,
    accept,
    maxSize,
    multiple = true,
    disabled,
    hint,
    error,
    className = '',
    style,
    onChange,
    onReject,
}) => {
    const onDrop = useCallback(
        (accepted: File[], rejections: FileRejection[]): void => {
            if (accepted.length > 0) onChange?.(accepted);
            if (rejections.length > 0) onReject?.(rejections);
        },
        [onChange, onReject],
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple,
        disabled,
    });

    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
        <SarakFormGroup className={className} style={style}>
            {label && (
                <span className="text-sm font-medium text-[var(--text-muted,#94a3b8)]">{label}</span>
            )}

            <div
                {...getRootProps()}
                className={`flex items-center justify-center w-full rounded-input text-center border-2 border-dashed transition-colors bg-[var(--sarak-input-bg,var(--color-theme-card,#1e293b))] ${disabledClass}`}
                style={{
                    flexDirection: 'column',
                    gap: 'var(--sarak-layout-gap-sm, 8px)',
                    padding: 'calc(var(--sarak-layout-gap-md,16px) * 2) var(--sarak-layout-gap-md,16px)',
                    borderColor: borderFor(isDragActive, isDragReject, !!error)
                }}
                aria-disabled={disabled || undefined}
                aria-invalid={error ? true : undefined}
            >
                <input {...getInputProps()} />
                <svg className="w-8 h-8 text-[var(--text-muted,#94a3b8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.9A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3-3m0 0l3 3m-3-3v9" />
                </svg>
                <span className="text-sm font-medium text-[var(--text-muted,#94a3b8)]">
                    {isDragActive ? 'Solte os arquivos aqui...' : 'Arraste arquivos ou clique para selecionar'}
                </span>
                {hint && <span className="text-2xs text-[var(--text-muted,#94a3b8)]/70">{hint}</span>}
            </div>

            {error && (
                <p className="text-sm text-[var(--sarak-input-error-color,#ff4d4f)]" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>{error}</p>
            )}
        </SarakFormGroup>
    );
};
