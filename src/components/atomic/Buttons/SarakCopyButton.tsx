import React, { useEffect, useRef, useState } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakButton, type SarakButtonProps } from './SarakButton';

export interface SarakCopyButtonProps extends Omit<SarakButtonProps, 'onClick' | 'onCopy' | 'children' | 'value'> {
    /** Texto a copiar, ou função que o devolve no momento do clique. */
    value: string | (() => string);
    /** Rótulo no estado normal; omitido, usa o catálogo no idioma ativo. */
    label?: string;
    /** Rótulo depois de copiar; omitido, usa o catálogo no idioma ativo. */
    copiedLabel?: string;
    /** Recebe `true` ao copiar e `false` quando a área de transferência recusou. */
    onCopy?: (copied: boolean) => void;
    /** Quanto tempo o botão mostra o resultado antes de voltar ao normal, em ms; omitido, 2000. */
    resetAfter?: number;
}

type CopyStatus = 'idle' | 'copied' | 'failed';

const DEFAULT_RESET_MS = 2000;

/** Copia pelo seletor de texto quando a API de área de transferência não existe (página sem HTTPS, navegador antigo). */
const copyBySelection = (content: string): void => {
    const area = document.createElement('textarea');
    area.value = content;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const done = document.execCommand('copy');
    area.remove();
    if (!done) throw new Error('copy command refused');
};

const writeClipboard = async (content: string): Promise<void> => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        return;
    }
    copyBySelection(content);
};

/** Botão que copia um texto e confirma na hora, no próprio rótulo, anunciado ao leitor de tela. */
export const SarakCopyButton = ({
    value, label, copiedLabel, onCopy, resetAfter = DEFAULT_RESET_MS, ...buttonProps
}: SarakCopyButtonProps): React.ReactElement => {
    const text = useLibraryText();
    const [status, setStatus] = useState<CopyStatus>('idle');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const handleClick = async (): Promise<void> => {
        let copied = true;
        try {
            await writeClipboard(typeof value === 'function' ? value() : value);
        } catch {
            copied = false;
        }
        setStatus(copied ? 'copied' : 'failed');
        onCopy?.(copied);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setStatus('idle'), resetAfter);
    };

    const shown = {
        idle: label ?? text('copyButtonCopy'),
        copied: copiedLabel ?? text('copyButtonCopied'),
        failed: text('copyButtonFailed'),
    }[status];

    return (
        <SarakButton type="button" variant="outline" size="sm" {...buttonProps} aria-live="polite" onClick={() => void handleClick()}>
            {shown}
        </SarakButton>
    );
};
