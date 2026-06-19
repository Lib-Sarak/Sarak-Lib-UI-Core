import { ReactNode } from 'react';
import type { DesignTokenId } from './generated/design-token-ids';

/**
 * Contrato do Theme Payload com DOMÍNIO DE CHAVES FECHADO: somente design tokens
 * reais (DesignTokenId — gerado da SSOT MASTER_DESIGN_MAP, mesma fonte validada
 * pela paridade 1:1:1:1:1) + os campos legados/branding declarados em
 * SarakThemePayloadExtras. Qualquer outra chave (ex.: 'brandColorPrimary') passa
 * a ser ERRO DE COMPILAÇÃO — "a Interface do Payload dita a Realidade".
 */
export type SarakThemePayload = Partial<Record<DesignTokenId, unknown>> & SarakThemePayloadExtras;

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
