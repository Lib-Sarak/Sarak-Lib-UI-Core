import { useCallback, useRef, useState } from 'react';
import type { SarakDesignState } from '../../../../core/Provider/types';

interface Peek {
    tokens: Partial<SarakDesignState>;
    /** A tela de amostra em que o componente da opção aparece; sem ela, a prévia fica na tela atual. */
    screen?: string;
}

/**
 * A espiada: o que a prévia grande compõe por cima do rascunho enquanto o mouse ou o foco está numa opção da galeria.
 * Vive à parte do rascunho de propósito — não passa por `updateDraft`, então não conta como mudança e some ao sair.
 * A tela vem junto e some junto: a prévia volta à tela em que estava, e escolher a opção a mantém
 * (`keepPeekScreen` envolve a ação de escolher e entrega a tela da espiada a `selectScreen`).
 */
export const usePeekPreview = (selectScreen?: (screen: string) => void) => {
    const [peek, setPeek] = useState<Peek | null>(null);
    const current = useRef<Peek | null>(null);
    current.current = peek;
    const onPeek = useCallback(
        (tokens: Partial<SarakDesignState> | null, screen?: string) => setPeek(tokens ? { tokens, screen } : null),
        [],
    );
    const keepPeekScreen = useCallback(<Args extends unknown[]>(choose: (...args: Args) => void) => (...args: Args): void => {
        const screen = current.current?.screen;
        if (screen) selectScreen?.(screen);
        choose(...args);
    }, [selectScreen]);
    return { peekTokens: peek?.tokens ?? null, peekScreen: peek?.screen, onPeek, isPeeking: peek !== null, keepPeekScreen };
};
