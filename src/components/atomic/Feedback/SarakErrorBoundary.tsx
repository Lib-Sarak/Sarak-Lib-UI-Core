import React from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakAlert } from './SarakAlert';

/** O que a função `fallback` recebe para desenhar o erro e oferecer a nova tentativa. */
export interface SarakErrorBoundaryFallbackContext {
    /** O valor lançado; `throw` aceita qualquer tipo, não só `Error`. */
    error: unknown;
    /** Limpa o erro e monta o conteúdo de novo. */
    reset: () => void;
}

export interface SarakErrorBoundaryProps {
    children?: React.ReactNode;
    /** Substitui o aviso padrão: um nó fixo ou uma função que recebe o erro e `reset`. */
    fallback?: React.ReactNode | ((context: SarakErrorBoundaryFallbackContext) => React.ReactNode);
    /** Recebe o erro capturado, para o host registrar. */
    onError?: (error: unknown, info: React.ErrorInfo) => void;
    /** Quando um destes valores muda (a rota, por exemplo), o erro é limpo e o conteúdo remonta. */
    resetKeys?: readonly unknown[];
}

export interface SarakErrorBoundaryState {
    failed: boolean;
    error: unknown;
}

const NO_ERROR: SarakErrorBoundaryState = { failed: false, error: undefined };

const DefaultFallback = ({ reset }: { reset: () => void }): React.ReactElement => {
    const text = useLibraryText();
    return (
        <SarakAlert
            variant="error"
            title={text('errorBoundaryTitle')}
            message={text('errorBoundaryMessage')}
            action={{ label: text('errorBoundaryRetry'), onClick: reset }}
        />
    );
};

const resetKeysChanged = (previous: readonly unknown[] = [], next: readonly unknown[] = []): boolean =>
    previous.length !== next.length || next.some((key, index) => !Object.is(key, previous[index]));

/** Contém um erro de render no bloco que falhou; o resto da tela segue funcionando. */
export class SarakErrorBoundary extends React.Component<SarakErrorBoundaryProps, SarakErrorBoundaryState> {
    state = NO_ERROR;

    static getDerivedStateFromError(error: unknown): SarakErrorBoundaryState {
        return { failed: true, error };
    }

    componentDidCatch(error: unknown, info: React.ErrorInfo): void {
        this.props.onError?.(error, info);
    }

    componentDidUpdate(previousProps: SarakErrorBoundaryProps, previousState: SarakErrorBoundaryState): void {
        // `previousState.failed` evita limpar o erro no mesmo ciclo em que a troca de chave o causou.
        if (previousState.failed && resetKeysChanged(previousProps.resetKeys, this.props.resetKeys)) this.reset();
    }

    reset = (): void => {
        this.setState(NO_ERROR);
    };

    render(): React.ReactNode {
        if (!this.state.failed) return this.props.children;
        const { fallback } = this.props;
        if (typeof fallback === 'function') return fallback({ error: this.state.error, reset: this.reset });
        return fallback === undefined ? <DefaultFallback reset={this.reset} /> : fallback;
    }
}
