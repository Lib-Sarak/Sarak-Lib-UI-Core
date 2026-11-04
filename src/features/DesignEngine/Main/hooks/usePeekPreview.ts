import { useCallback, useState } from 'react';
import type { SarakDesignState } from '../../../../core/Provider/types';

/**
 * A espiada: o que a prévia grande compõe por cima do rascunho enquanto o mouse ou o foco está numa opção da galeria.
 * Vive à parte do rascunho de propósito — não passa por `updateDraft`, então não conta como mudança e some ao sair.
 */
export const usePeekPreview = () => {
    const [peekTokens, setPeekTokens] = useState<Partial<SarakDesignState> | null>(null);
    const onPeek = useCallback((tokens: Partial<SarakDesignState> | null) => setPeekTokens(tokens), []);
    return { peekTokens, onPeek, isPeeking: peekTokens !== null };
};
