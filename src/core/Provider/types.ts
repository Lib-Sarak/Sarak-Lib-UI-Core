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

/**
 * Contrato do Design Agent (chat de preenchimento de valores no Design Engine).
 * A Sarak nunca chama rede diretamente (Regra da Spec 08 §6.2): o importador injeta
 * `sendPrompt` via `SarakUIOptions.designAgent`, faz a chamada ao backend do agente
 * e devolve o resultado já no formato abaixo.
 */
export interface DesignAgentPromptInput {
    prompt: string;
    draftTokens: Partial<SarakDesignState>;
}

/** Um bundle de valores existentes para UMA categoria de preset (Cards, Buttons, etc). */
export interface DesignAgentComponentPreset {
    category: string;
    design: Partial<SarakDesignState>;
}

export interface DesignAgentPromptResult {
    message: string;
    /** Patch de tema completo — aplicado como rascunho ao vivo (Preset 1). */
    themePatch?: Partial<SarakDesignState>;
    /** Presets por componente — somem no catálogo de sessão (Preset 2). */
    componentPresets?: DesignAgentComponentPreset[];
}

export type DesignAgentSendPrompt = (input: DesignAgentPromptInput) => Promise<DesignAgentPromptResult>;

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

export interface SarakUIOptions {
    token?: string;
    endpoints?: {
        baseUrl?: string;
        designPath?: string;
        discoveryPath?: string;
        discovery?: string[];
        branding?: string;
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
    };
    theme?: {
        defaultTheme?: string;
        defaultModuleId?: string;
        extraTokens?: Record<string, unknown>;
    };
    /** Canal único de rede do Design Agent (Spec 08 §6.2) — a lib nunca faz fetch direto. */
    designAgent?: {
        sendPrompt: DesignAgentSendPrompt;
    };
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
    branding?: {
        companyName: string;
        loginName: string;
        tabName: string;
        logoBase64: string | null;
    };
    updateBranding?: (partial: Record<string, unknown>) => Promise<void>;
    
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
    customThemes?: unknown[]; // Temas vindos do banco de dados (UI.custom_themes)
    activeThemeId?: string; // ID do tema atualmente selecionado no banco
    onMediaUpload?: (file: File) => Promise<string>; // Adapter opcional para envio de mídias para Storage externo
}
