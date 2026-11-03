import React, { useEffect, useRef, useState } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakButton, type SarakButtonProps } from './SarakButton';

export interface SarakFileActionProps extends Omit<SarakButtonProps, 'onClick' | 'children' | 'isLoading'> {
    /** Obtém o arquivo; a lib não faz rede, então a chamada (com a autenticação do host) é do consumidor. */
    load: () => Promise<Blob>;
    /**
     * `download` salva o arquivo; `open` abre numa aba nova, mas só PDF, imagem raster (PNG, JPEG, GIF, WebP, AVIF, BMP)
     * e texto puro: HTML, SVG e o resto seriam executados na origem do sistema, então são baixados. Omitido, `download`.
     */
    mode?: 'download' | 'open';
    /** Nome do arquivo salvo no modo `download`; omitido, o navegador escolhe. */
    filename?: string;
    /** Rótulo do botão; omitido, usa o catálogo no idioma ativo (Baixar ou Abrir). */
    label?: string;
    /**
     * Chamado quando o arquivo foi entregue ao navegador. Entregue não é aberto nem salvo: o navegador pode barrar a aba
     * ou o download (`window.open` devolve `null` com `noopener`), e a lib não consegue conferir.
     */
    onDone?: () => void;
    /** Recebe o que `load` rejeitou. */
    onError?: (error: unknown) => void;
}

type FileStatus = 'idle' | 'loading' | 'error';

const REVOKE_DELAY_MS = 60_000;

/** Tipos que o navegador mostra sem executar nada; qualquer outro, aberto na origem do sistema, rodaria como página. */
const INERT_OPEN_TYPES = /^(application\/pdf|text\/plain|image\/(png|jpe?g|gif|webp|avif|bmp))(;|$)/i;

const deliver = (blob: Blob, mode: 'download' | 'open', filename?: string): void => {
    const url = URL.createObjectURL(blob);
    if (mode === 'open' && INERT_OPEN_TYPES.test(blob.type)) {
        window.open(url, '_blank', 'noopener');
    } else {
        const anchor = document.createElement('a');
        anchor.href = url;
        // `download` vai sempre, vazio sem nome: sem o atributo o clique navegaria a própria aba para o `blob:`.
        anchor.download = filename ?? '';
        anchor.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
};

/** Baixa ou abre um arquivo obtido por `load`, com carregando, erro e nova tentativa no próprio lugar do botão. */
export const SarakFileAction = ({
    load, mode = 'download', filename, label, onDone, onError, ...buttonProps
}: SarakFileActionProps): React.ReactElement => {
    const text = useLibraryText();
    const [status, setStatus] = useState<FileStatus>('idle');
    const mounted = useRef(true);
    useEffect(() => () => { mounted.current = false; }, []);

    const run = async (): Promise<void> => {
        setStatus('loading');
        try {
            deliver(await load(), mode, filename);
            if (mounted.current) setStatus('idle');
            onDone?.();
        } catch (error) {
            if (mounted.current) setStatus('error');
            onError?.(error);
        }
    };

    const defaultLabel = mode === 'open' ? text('fileActionOpen') : text('fileActionDownload');
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
            <SarakButton type="button" variant="outline" size="sm" {...buttonProps} isLoading={status === 'loading'} onClick={() => void run()}>
                {status === 'error' ? text('fileActionRetry') : label ?? defaultLabel}
            </SarakButton>
            {status === 'error' && <span role="alert" className="text-sm" style={{ color: 'var(--sarak-status-error-color, var(--theme-error, #ef4444))' }}>{text('fileActionError')}</span>}
        </span>
    );
};
