import { ReactNode } from 'react';
import type { DesignTokenId, SarakDesignTokens } from './generated/design-token-ids';

/**
 * Contrato do Theme Payload com DOMÍNIO DE CHAVES FECHADO: somente design tokens
 * reais (SarakDesignTokens — gerado da SSOT MASTER_DESIGN_MAP, mesma fonte
 * validada pela paridade 1:1:1:1:1, agora com VALORES tipados por `token.type`)
 * + os campos legados/branding declarados em SarakThemePayloadExtras. Qualquer
 * outra chave (ex.: 'brandColorPrimary') passa a ser ERRO DE COMPILAÇÃO —
 * "a Interface do Payload dita a Realidade".
 */
export type SarakThemePayload = Partial<SarakDesignTokens> & SarakThemePayloadExtras;

/**
 * Chaves estruturais/sanitizador que existem no estado de design em RUNTIME mas
 * não são design tokens do schema (Spec 65, Fase 0). Não criar token novo aqui —
 * token novo nasce no schema/paridade.
 */
interface SarakRuntimeExtras {
    animationSpeed?: number;
    secondaryModuleId?: string;
    emptyStateId?: string;
    logoPosition?: 'left' | 'center';
    logoScale?: number;
    atmosphere?: Record<string, unknown>;
    specialized?: Record<string, unknown>;
    schema_version?: string;
}

/** Estado de design REAL em runtime: o payload público + os extras de runtime. */
export type SarakDesignState = SarakThemePayload & SarakRuntimeExtras;

/** Entrada da lista unificada de temas (GLOBAL_THEMES + custom_themes do banco). */
export interface ThemeEntry {
    id: string;
    design?: Record<string, unknown>;
}

/** Assinatura do setter do design-state (valor ou updater functional). */
export type SetDesign = (
    updater: SarakDesignState | ((prev: SarakDesignState) => SarakDesignState),
) => void;

/**
 * Campos presentes no payload que ainda NÃO foram modelados como design tokens
 * no schema (branding/sistema, estrutura consumida por useStructuralStyles e
 * aliases de cor legados). Pendente reconciliação com a paridade 1:1:1:1:1.
 * NÃO adicione tokens novos aqui: um token novo nasce no schema, não nesta lista.
 */
interface SarakThemePayloadExtras {
    systemName?: string;
    logoUrl?: string;
    mode?: string;
    layout?: string;
    animationStyle?: string;
    emojiSet?: string;
    primaryColor?: string;
    secondaryColor?: string;
    flowGridStyle?: string;
    flowNodeRadius?: number;
    chatBubbleStyle?: string;
    chatAnimationSpeed?: number;
    chartType?: string;
    chartShowGrid?: boolean;
    cardHoverStyle?: 'lift' | 'expand' | 'glow' | 'glow-only' | 'none';
    cardTextureType?: string;
    cardGeometricCut?: number;
    cardVariant?: 'classic' | 'title' | 'action' | 'search';
    
    // Components (Images/Icons)
    imageOverlay?: boolean;
    imageCardHoverZoom?: number;
    imageCardOverlayOpacity?: number;
    iconStrokeWidth?: number;
    layoutDensity?: string;
    fontScale?: string;
    navigationStyle?: string;
    sidebarMinWidth?: number;
    sidebarMaxWidth?: number;
    sidebarWidth?: number;
    headingFont?: string;
    bodyFont?: string;
    globalBackgroundImageUrl?: string;
    globalBackgroundOpacity?: number;
    globalBackgroundBlur?: number;
    globalBackgroundBlendMode?: string;
    moduleBlacklist?: string;
    searchVariant?: "search" | "classic" | "title" | "action";
    columnGap?: string | number;
    iconSize?: string;
    iconFamily?: string;
    iconWeight?: string;
    scale?: string | number;
    btnStyleType?: string;
    radius?: string;
    borderStyle?: string;
    shadowType?: string;
    chartGridStyle?: string;
    map?: Record<string, unknown>;
    imageOpacity?: number;
    imageScale?: number | string;
    layoutMaxWidth?: number;
    enabledLanguages?: string[];
    
    // Propriedades estruturais e de layout
    inputIconPosition?: string;
    qrSize?: number;
    isAutoHideEnabled?: boolean;
    isNavHidden?: boolean;

    // Extras legados sem token correspondente no schema (pendente reconciliação)
    logoDarkUrl?: string;
    fontFamily?: string;
    socialButtonStyle?: string;
    searchStyle?: string;
    language?: string;
    availableLanguages?: string[];
}

// `PAYLOAD_EXTRA_KEYS` (espelho em runtime das chaves acima, usado por
// `validateDesign`) mora em `./payloadExtraKeys.ts` — só para manter este
// arquivo abaixo do limite de linhas do auditor de Clean Code (250).

/**
 * Modo de consumo da biblioteca (Spec 24).
 * - `app`: o sistema nasce com a lib; o Provider é dono da página (default).
 * - `embedded`: a lib renderiza uma ilha sobre um frontend existente, sem tocar
 *   em nada fora do seu container.
 */
export type SarakUIMode = 'app' | 'embedded';

export interface SarakUIOptions {
    token?: string;
    /** Modo de consumo (Spec 24). Default `'app'` — zero breaking change. */
    mode?: SarakUIMode;
    /** Ajustes válidos apenas em `mode: 'embedded'`. */
    embedded?: {
        /**
         * Opt-in explícito para injetar as fontes do Google no `<head>` do host.
         * Default `false`: no Modo Embarcado a ilha herda as fontes do host, e a lib
         * não escreve `<link>`/`@import` global sem permissão.
         */
        injectGlobalFonts?: boolean;
    };
    endpoints?: {
        discoveryPath?: string;
        discovery?: string[];
    };
    manifest?: {
        brand?: { name?: string; logoUrl?: string };
        [key: string]: unknown;
    };
    persistence?: {
        strategy?: 'local' | 'remote' | 'hybrid';
        storageKey?: string;
        onSave?: (design: SarakThemePayload) => Promise<void> | void;
        onLoad?: () => Promise<SarakThemePayload> | SarakThemePayload;
        strictBackendSync?: boolean;
        /**
         * Sincroniza o tema entre abas/apps que compartilham a `storageKey` (N
         * Providers independentes — modelo #3). Escuta `storage` e reaplica o
         * design (validado) quando outra aba grava a mesma chave. Default `true`
         * (validado antes de aplicar; desligue para sincronização própria).
         */
        crossTabSync?: boolean;
    };
    theme?: {
        defaultTheme?: string;
        defaultModuleId?: string;
        extraTokens?: Record<string, unknown>;
    };
    /**
     * Marca/branding do sistema (Spec 44 — sem backend próprio): `initial` semeia
     * o estado; `onChange` é a porta "traga sua persistência" (sync no backend DO
     * CONSUMIDOR, se ele quiser — a lib nunca faz fetch/POST para nenhum servidor).
     */
    branding?: {
        initial?: Partial<SarakBrandingState>;
        onChange?: (branding: SarakBrandingState) => Promise<void> | void;
    };
}

/** Estado de marca/branding do sistema (nome, logo, textos de login/aba). Identidade
 *  (`companyName`/`tabName`/`logoBase64`) nasce AUSENTE — a lib nunca impõe a própria
 *  marca (Spec 47; contrato em `docs/identidade-do-host.md`). */
export interface SarakBrandingState {
    companyName?: string;
    loginName: string;
    tabName?: string;
    logoBase64: string | null;
}

export interface SarakUIContextType {
    discoveryEndpoints: string[];
    design: SarakThemePayload;
    systemDesign?: SarakThemePayload; // Design persistido do sistema (sem rascunho/branding)
    activeDesign: SarakThemePayload;
    draftDesign: SarakThemePayload | null; // Rascunho ativo (para Live Preview)
    isDrafting: boolean; // Flag explícita de modo rascunho
    setIsDrafting: (active: boolean) => void;
    lockDrafting: () => void;
    setDesign: (design: SarakThemePayload) => void;
    setDraftDesign: (design: SarakThemePayload | null) => void;
    persistDesign?: (design: SarakThemePayload) => void;
    applyConfig: (partial: Partial<SarakThemePayload>) => void;
    applyFullConfig: (config: SarakThemePayload) => void;
    applyConfigRaw: (partial: Partial<SarakThemePayload>) => void; // Canal direto para o sistema (ignora rascunho)
    applyFullConfigRaw: (config: SarakThemePayload) => void; // Canal direto para o sistema (ignora rascunho)
    registeredModules: unknown[];
    layouts: unknown[];
    isHydrated: boolean;
    options: SarakUIOptions;
    allThemes: unknown[]; // Array unificado (Scripts + DB) para a interface
    token?: string | null; // Adicionado para expor o token aos componentes filhos (Catálogo, Temas, etc)
    // Branding
    branding?: SarakBrandingState;
    updateBranding?: (partial: Partial<SarakBrandingState>) => Promise<void>;
    
    // Media Strategy
    onMediaUpload?: (file: File) => Promise<string>;
}

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
