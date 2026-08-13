import type { ReactNode } from 'react';
import type { SarakThemePayload, SarakUIOptions } from './types';

/**
 * Props públicas do `SarakUIProvider`. Extraído de `types.ts` só para manter
 * aquele arquivo abaixo do teto de 250 linhas do auditor de Clean Code (R9) —
 * mesmo motivo de `payloadExtraKeys.ts`, ver comentário lá.
 */
export interface SarakUIProviderProps {
    children: ReactNode;
    discoveryEndpoints?: string[];
    config?: SarakThemePayload;
    token?: string | null;
    userId?: string | null;
    options?: SarakUIOptions;
    customThemes?: unknown[]; // Temas em JSON definidos pelo consumidor no próprio código (Spec 44)
    /** ID do tema ATIVO (controlado): sempre que setado, vence — reaplica a cada mudança. */
    activeThemeId?: string;
    /**
     * ID do tema SEMENTE (não-controlado): só semeia o estado inicial (uma vez, no
     * primeiro seed), nunca força reaplicação. Alternativa mais segura a
     * `activeThemeId` para o caso comum "só quero começar neste tema" — não expõe o
     * consumidor ao contrato de estabilidade de referência que `activeThemeId`
     * exige de `customThemes` (Spec 43 §5.1/Spec 44 §2.1).
     */
    initialTheme?: string;
    /**
     * Callback "traga sua persistência" (Spec 44 §2.5): chamado a cada commit do
     * design persistido (após localStorage), para o consumidor sincronizar no
     * backend DELE, se quiser. A lib nunca faz essa chamada por conta própria.
     */
    onThemeChange?: (design: SarakThemePayload) => void;
    onMediaUpload?: (file: File) => Promise<string>; // Adapter opcional para envio de mídias para Storage externo
}
