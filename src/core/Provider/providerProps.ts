import type { ReactNode } from 'react';
import type { SarakThemeEntry, SarakThemePayload, SarakUIOptions } from './types';

/**
 * Props públicas do `SarakUIProvider`. Extraído de `types.ts` só para manter
 * aquele arquivo abaixo do teto de 250 linhas do auditor de Clean Code (R9) —
 * mesmo motivo de `payloadExtraKeys.ts`, ver comentário lá.
 */
export interface SarakUIProviderProps {
    children: ReactNode;
    config?: SarakThemePayload;
    token?: string | null;
    userId?: string | null;
    options?: SarakUIOptions;
    customThemes?: SarakThemeEntry[]; // Temas em JSON definidos pelo consumidor no próprio código (Spec 44)
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
    /**
     * O que mostrar enquanto o tema EMBARCADO pedido por código (`activeThemeId`/
     * `initialTheme`) ainda não chegou à memória. Só aparece sem
     * `await sarakPreloadThemes([...])` antes do render; o padrão é nada.
     */
    loadingFallback?: ReactNode;
    onMediaUpload?: (file: File) => Promise<string>; // Adapter opcional para envio de mídias para Storage externo
}

/**
 * De onde vêm as fontes do tema (`options.fonts`):
 * - `'bundled'` (padrão): a lib injeta o `@font-face` só das famílias que o design no ar usa, com os arquivos da
 *   pasta `fonts/` do pacote. Nenhuma requisição a terceiros.
 * - `'google'`: o comportamento anterior — `@import` do Google Fonts com todas as famílias + `preconnect`.
 * - `'none'`: a lib não injeta nada; o host carrega as fontes.
 */
export type SarakFontSource = 'bundled' | 'google' | 'none';

export interface SarakFontsOptions {
    /** Padrão `'bundled'`. */
    source?: SarakFontSource;
    /**
     * Onde o host serve a pasta `fonts/` do pacote (CDN própria, ou bundler que não reescreve
     * `new URL(..., import.meta.url)`, como esbuild puro ou o CJS). Vale só para `'bundled'`.
     */
    baseUrl?: string;
    /**
     * Famílias que o host serve (a lib não as embarca nem copia): entram no painel ao lado das da lib e, quando o
     * design as usa, a lib injeta o `@font-face` delas. Registrar não muda o que o tema aceita — qualquer pilha de
     * fontes segura continua valendo; uma família não registrada nem instalada cai na genérica da pilha.
     * Com `source: 'none'` a lib não injeta o `@font-face` delas: o host carrega tudo.
     */
    custom?: SarakCustomFont[];
}

export type SarakFontsOption = SarakFontSource | SarakFontsOptions;

/** Família genérica que vem depois da família do host no valor gravado no tema (`'Minha Fonte', sans-serif`). */
export type SarakFontFallback = 'sans-serif' | 'serif' | 'monospace' | 'cursive' | 'system-ui';

export interface SarakCustomFontFile {
    /** `https:`, caminho (`/fontes/x.woff2`, `fontes/x.woff2`) ou `data:font/…;base64,…`; nenhum outro esquema. */
    url: string;
    /** 100–900 em passos de 100, `'normal'` ou `'bold'`. */
    weight: number | 'normal' | 'bold';
    /** Padrão `'normal'`. */
    style?: 'normal' | 'italic';
}

export interface SarakCustomFont {
    /** Letras, dígitos, espaço, hífen e sublinhado; até 64 caracteres; não pode repetir uma família da lib. */
    family: string;
    /** Grupo no seletor do painel; sem ele, "Personalizadas". */
    category?: string;
    /** Padrão `'sans-serif'`. */
    fallback?: SarakFontFallback;
    files: SarakCustomFontFile[];
}
