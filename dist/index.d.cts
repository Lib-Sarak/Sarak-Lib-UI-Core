import * as React$1 from 'react';
import React__default, { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, HTMLAttributes } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Sarak Industrial Design Schema (v11.0)
 *
 * Define o contrato para mapeamento de 100% das funcionalidades e componentes.
 */
type TokenValueType = 'number' | 'color' | 'string' | 'boolean' | 'select' | 'slider' | 'font' | 'text' | 'image' | 'file';
type ResponsiveValue<T> = {
    desk: T;
    tab: T;
    mob: T;
};
/** Espaço de valores que um token pode assumir (espelha SarakDesignTokens). */
type SarakTokenValue = string | number | boolean | ResponsiveValue<string | number>;
interface DesignToken {
    id: string;
    label: string;
    type: TokenValueType;
    isResponsive?: boolean;
    semanticRole?: 'bg' | 'text' | 'border' | 'primary';
    iconFamily?: 'lucide' | 'phosphor' | 'tabler';
    iconWeight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
    unit?: 'px' | '%' | 'rem' | 'em' | 'ms' | 'deg' | 's';
    cssVars?: string[];
    generateVariants?: boolean;
    constraints?: {
        min?: number;
        max?: number;
        step?: number;
        options?: {
            value?: string;
            id?: string;
            label: string;
        }[];
    };
    options?: {
        value?: string;
        id?: string;
        label: string;
    }[];
    min?: number;
    max?: number;
    step?: number;
    defaultValue: SarakTokenValue;
    legacyValue?: SarakTokenValue;
    description?: string;
    /**
     * Classificação de eixo visual (Spec 02) — usada pelo retrieval semântico do
     * Design Agent e pela diversificação por eixo (Spec 04). Opcional: tokens
     * estruturais/não-visuais (ex: `mode`, `navigationStyle`) podem não ter eixo —
     * ver taxonomia na Seção 5 de `specs/plan/02-mapeamento-semantico-rag-catalogo.md`.
     */
    axis?: 'color' | 'geometry' | 'elevation' | 'texture' | 'density' | 'motion';
    /**
     * Presença = token Estrutural (Alavanca 2): o valor não é injetado como CSS Variable,
     * é lido em JS por um Hook Controlador (Camada 6) que decide className/style (ex: direção,
     * posição, alinhamento). Lista os hooks/métodos consumidores (ex: ['useCardLayoutStyles']).
     * Ausência = token de Valor (Alavanca 1, default): consumido via `var(--sarak-*, fallback)`.
     */
    structuralConsumer?: string[];
}

interface SarakDesignTokens {
    accentColor: string;
    aiGlowColor: string;
    aiPanelBg: string;
    animEnabled: boolean;
    animFast: number;
    animInstant: number;
    animNormal: number;
    animSlow: number;
    atmosphereNoiseOpacity: number;
    badgeRadius: number;
    bgBaseColor: string;
    bgGradientAngle: number;
    bgGradientMode: string;
    bgNoiseAnimation: number;
    bgNoiseDensity: number;
    bodyFont: string;
    bodyLineHeight: number;
    bodySize: string;
    bodyWeight: string;
    borderBeamEnabled: boolean;
    borderRadius: number | ResponsiveValue<number>;
    borderRadiusLg: number | ResponsiveValue<number>;
    borderRadiusMd: number | ResponsiveValue<number>;
    borderRadiusSm: number | ResponsiveValue<number>;
    borderStyle: string;
    borderType: string;
    borderWidth: number;
    breakpointDesktop: number;
    breakpointTablet: number;
    btnActiveScale: number;
    btnBackdropBlur: number;
    btnBorderRadius: number | ResponsiveValue<number>;
    btnGhostHoverBg: string;
    btnHoverScale: number;
    btnNeonGlowColor: string;
    btnNeonPulseSpeed: number;
    btnPrimaryBg: string;
    btnPrimaryText: string;
    btnRadiusBL: number | ResponsiveValue<number>;
    btnRadiusBR: number | ResponsiveValue<number>;
    btnRadiusTL: number | ResponsiveValue<number>;
    btnRadiusTR: number | ResponsiveValue<number>;
    btnSecondaryBg: string;
    btnStyleType: string;
    buttonIconPosition: string;
    buttonWidthStrategy: string;
    cardActionBtnBorderRadius: number | ResponsiveValue<number>;
    cardActionBtnHoverBg: string;
    cardActionBtnPadding: number;
    cardActionBtnPrimaryBg: string;
    cardActionBtnText: string;
    cardActionClickScale: number;
    cardBackdropBlur: number;
    cardBackgroundColor: string;
    cardBorderBottom: number;
    cardBorderColor: string;
    cardBorderLeft: number;
    cardBorderOpacity: number;
    cardBorderRadius: number | ResponsiveValue<number>;
    cardBorderRight: number;
    cardBorderTop: number;
    cardBorderWidth: number;
    cardContentAlignment: string;
    cardFooterBg: string;
    cardFooterBorder: string;
    cardGeometricCut: number;
    cardGlowColor: string;
    cardGlowIntensity: number;
    cardHeaderBg: string;
    cardHeaderBorder: string;
    cardHeaderPadding: number | ResponsiveValue<number>;
    cardHoverGlowIncrease: number;
    cardHoverStyle: string;
    cardHoverTranslate: number;
    cardImagePosition: string;
    cardInnerGlowColor: string;
    cardInnerGlowWidth: number;
    cardLayoutDirection: string;
    cardPaddingMd: number | ResponsiveValue<number>;
    cardRadiusBL: number | ResponsiveValue<number>;
    cardRadiusBR: number | ResponsiveValue<number>;
    cardRadiusTL: number | ResponsiveValue<number>;
    cardRadiusTR: number | ResponsiveValue<number>;
    cardSearchBgFocus: string;
    cardSearchBorderBeamActive: boolean;
    cardSearchPlaceholderColor: string;
    cardSearchTextFocusColor: string;
    cardShadow: string;
    cardShadowSpread: number;
    cardSpotlightOpacity: number;
    cardSurfaceOpacity: number;
    cardTextAlign: string;
    cardTextureOpacity: number;
    cardTextureType: string;
    cardTitleColor: string;
    cardTitleFontSize: number | ResponsiveValue<number>;
    cardTitleFontWeight: string;
    cardTitleIconGlow: string;
    cardTitleLetterSpacing: number;
    cardVariant: string;
    chartColorPalette: string;
    chartGridOpacity: number;
    chartShowGrid: boolean;
    chartSmoothing: boolean;
    chartThickness: number;
    chartTooltipBg: string;
    chartType: string;
    chatAnimationSpeed: number;
    chatBubbleRadius: number | ResponsiveValue<number>;
    chatBubbleStyle: string;
    chatUserBg: string;
    checkboxActiveColor: string;
    colorBgBody: string;
    colorBgLayer1: string;
    colorBgLayer2: string;
    colorBgModal: string;
    colorDepth: number;
    colorPalette: string;
    colorVariation: number;
    contentAlignment: string;
    contrastCurve: number;
    easeMain: string;
    easeOut: string;
    flowGridStyle: string;
    flowNodeRadius: number | ResponsiveValue<number>;
    focusRingWidth: number;
    formFieldDensity: string;
    formLabelPosition: string;
    formLayoutDirection: string;
    glassBlur: number;
    glassOpacity: number;
    glassRoughness: number;
    glassSaturation: number;
    glassSpecularity: number;
    globalBackgroundBlendMode: string;
    globalBackgroundBlur: number;
    globalBackgroundImageUrl: string;
    globalBackgroundOpacity: number;
    globalContrast: number;
    globalFlowAlign: string;
    globalFlowDirection: string;
    globalSaturation: number;
    globalSectionGap: number;
    h1LetterSpacing: number;
    h1LineHeight: number;
    h1Size: number | ResponsiveValue<number>;
    h1Weight: string;
    h2LineHeight: number;
    h2Size: number | ResponsiveValue<number>;
    h2Weight: string;
    headerAlignment: string;
    headingFont: string;
    headingTransform: string;
    iconFamily: string;
    iconStrokeWidth: number;
    iconWeight: string;
    identityAlignment: string;
    identityFontFamily: string;
    identityFontWeight: number;
    identityHoverEffect: string;
    identityPadding: number;
    identityRedirectUrl: string;
    identityTracking: number;
    imageCardHoverZoom: number;
    imageCardOverlayOpacity: number;
    industrialRegistry: boolean;
    inputBackdropBlur: number;
    inputBg: string;
    inputBorderColor: string;
    inputBorderRadius: number | ResponsiveValue<number>;
    inputBorderType: string;
    inputErrorColor: string;
    inputFocusBorderColor: string;
    inputIconColor: string;
    inputIconPosition: string;
    inputPadding: number;
    inputShadow: string;
    inputSuccessColor: string;
    inputTextColor: string;
    isAutoHideEnabled: boolean;
    isNavHidden: boolean;
    isSplitViewEnabled: boolean;
    layerBackdropBlur: number;
    layerBackdropOpacity: number;
    layeredShadows: number;
    layerElevationFactor: number;
    layout: string;
    layoutDensity: string;
    layoutGap: number | ResponsiveValue<number>;
    layoutGapLg: number | ResponsiveValue<number>;
    layoutGapMd: number | ResponsiveValue<number>;
    layoutGapSm: number | ResponsiveValue<number>;
    layoutGridTemplate: string;
    layoutPadding: number | ResponsiveValue<number>;
    matrixBlur: number;
    matrixBorderColor: string;
    matrixGap: number;
    matrixItemBg: string;
    matrixRadius: number;
    matrixSearchBg: string;
    maxContentWidth: string;
    modalActionAlignment: string;
    modalBorderRadius: number | ResponsiveValue<number>;
    modalHeaderStyle: string;
    modalOverlayBlur: number;
    modalOverlayColor: string;
    mode: string;
    monoFont: string;
    motionDurationFast: number;
    motionDurationInstant: number;
    motionDurationNormal: number;
    motionDurationSlow: number;
    motionEaseIn: string;
    motionEaseMain: string;
    motionEaseOut: string;
    motionStaggerDelay: number;
    navActiveMarkerColor: string;
    navActiveMarkerGlow: number;
    navbarLayout: string;
    navigationStyle: string;
    navItemActiveColor: string;
    noiseIntensity: number;
    pageTransitionType: string;
    primaryColor: string;
    reducedMotion: boolean;
    scrollbarThumbColor: string;
    scrollbarWidth: number | ResponsiveValue<number>;
    scrollPadding: number | ResponsiveValue<number>;
    scrollRadius: number | ResponsiveValue<number>;
    scrollThumbColor: string;
    scrollThumbHoverOpacity: number;
    scrollThumbOpacity: number;
    scrollTrackOpacity: number;
    scrollWidth: number | ResponsiveValue<number>;
    searchPositionSidebar: string;
    searchPositionTopbar: string;
    secondaryColor: string;
    securityPulseSpeed: number;
    securityShieldGlow: number;
    shadowAmbientAlpha: number;
    shadowColorMode: string;
    shadowIntensity: number;
    shadowOrientation: string;
    shadowProjectionAlpha: number;
    shadowProjectionBlur: number;
    sidebarActiveColor: string;
    sidebarBlur: number;
    sidebarColor: string;
    sidebarHoverColor: string;
    sidebarMaxWidth: number | ResponsiveValue<number>;
    sidebarMinWidth: number | ResponsiveValue<number>;
    sidebarNoiseOpacity: number;
    sidebarPosition: string;
    sidebarShadow: string;
    sidebarWidth: number | ResponsiveValue<number>;
    statusErrorColor: string;
    statusInfoColor: string;
    statusSuccessColor: string;
    statusWarningColor: string;
    surfaceColor: string;
    surfaceIntensity: number;
    surfaceMaterial: string;
    switchBackdropBlur: number;
    switchLabelPosition: string;
    switchPulseColor: string;
    switchStyleType: string;
    switchThumbBg: string;
    switchTrackActiveBg: string;
    systemTone: string;
    tabGap: number | ResponsiveValue<number>;
    tableActionPosition: string;
    tableBorderColor: string;
    tableBorderRadius: number;
    tableCellPadding: number | ResponsiveValue<number>;
    tableDensity: string;
    tableHeaderBg: string;
    tableRowHoverBg: string;
    tableZebraStriping: boolean;
    tabSectionMargin: number | ResponsiveValue<number>;
    tertiaryColor: string;
    textColorMaster: string;
    textColorMuted: string;
    textColorSecondary: string;
    textGlowIntensity: number;
    textSmoothing: boolean;
    texture: string;
    textureColor: string;
    textureOpacity: number;
    titleColor: string;
    tooltipBg: string;
    tooltipRadius: number;
    topbarActiveColor: string;
    topbarColor: string;
    topbarHeight: number | ResponsiveValue<number>;
    topbarHoverColor: string;
    topbarNoiseOpacity: number;
    topbarTitleColor: string;
    vignetteOpacity: number;
    vignetteSoftness: number;
    zIndexBase: number;
    zIndexModal: number;
    zIndexSidebar: number;
    zIndexToast: number;
    zIndexTooltip: number;
}

/**
 * Contrato do Theme Payload com DOMÍNIO DE CHAVES FECHADO: somente design tokens
 * reais (SarakDesignTokens — gerado da SSOT MASTER_DESIGN_MAP, mesma fonte
 * validada pela paridade 1:1:1:1:1, agora com VALORES tipados por `token.type`)
 * + os campos legados/branding declarados em SarakThemePayloadExtras. Qualquer
 * outra chave (ex.: 'brandColorPrimary') passa a ser ERRO DE COMPILAÇÃO —
 * "a Interface do Payload dita a Realidade".
 */
type SarakThemePayload = Partial<SarakDesignTokens> & SarakThemePayloadExtras;
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
type SarakDesignState = SarakThemePayload & SarakRuntimeExtras;
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
    inputIconPosition?: string;
    qrSize?: number;
    isAutoHideEnabled?: boolean;
    isNavHidden?: boolean;
    logoDarkUrl?: string;
    fontFamily?: string;
    socialButtonStyle?: string;
    searchStyle?: string;
    language?: string;
    availableLanguages?: string[];
}
/**
 * Modo de consumo da biblioteca (Spec 24).
 * - `app`: o sistema nasce com a lib; o Provider é dono da página (default).
 * - `embedded`: a lib renderiza uma ilha sobre um frontend existente, sem tocar
 *   em nada fora do seu container.
 */
type SarakUIMode = 'app' | 'embedded';
interface SarakUIOptions {
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
        brand?: {
            name?: string;
            logoUrl?: string;
        };
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
interface SarakBrandingState {
    companyName?: string;
    loginName: string;
    tabName?: string;
    logoBase64: string | null;
}
interface SarakUIContextType {
    discoveryEndpoints: string[];
    design: SarakThemePayload;
    systemDesign?: SarakThemePayload;
    activeDesign: SarakThemePayload;
    draftDesign: SarakThemePayload | null;
    isDrafting: boolean;
    setIsDrafting: (active: boolean) => void;
    lockDrafting: () => void;
    setDesign: (design: SarakThemePayload) => void;
    setDraftDesign: (design: SarakThemePayload | null) => void;
    persistDesign?: (design: SarakThemePayload) => void;
    applyConfig: (partial: Partial<SarakThemePayload>) => void;
    applyFullConfig: (config: SarakThemePayload) => void;
    applyConfigRaw: (partial: Partial<SarakThemePayload>) => void;
    applyFullConfigRaw: (config: SarakThemePayload) => void;
    registeredModules: unknown[];
    layouts: unknown[];
    isHydrated: boolean;
    options: SarakUIOptions;
    allThemes: unknown[];
    token?: string | null;
    branding?: SarakBrandingState;
    updateBranding?: (partial: Partial<SarakBrandingState>) => Promise<void>;
    onMediaUpload?: (file: File) => Promise<string>;
}
interface SarakUIProviderProps {
    children: ReactNode;
    discoveryEndpoints?: string[];
    config?: SarakThemePayload;
    token?: string | null;
    userId?: string | null;
    options?: SarakUIOptions;
    customThemes?: unknown[];
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
    onMediaUpload?: (file: File) => Promise<string>;
}

/**
 * SOVEREIGN DESIGN MANIFEST (v10.1)
 *
 * O Manifesto é a única fonte de verdade para como os tokens de design
 * são mapeados para variáveis CSS, Atributos de DOM e Classes.
 */
declare const DESIGN_MANIFEST: Record<string, {
    vars?: string[];
    unit?: string;
    transform?: (v: SarakTokenValue) => string | number | Record<string, string | number>;
    attr?: string;
    classPrefix?: string;
}>;

declare const useSarakUI: () => SarakUIContextType & SarakThemePayload;
/**
 * SarakUIProvider Orchestrator (v10.1)
 *
 * Este é o ponto de entrada principal da biblioteca Sarak UI.
 * Ele orquestra o estado do design, a descoberta de módulos e a injeção de estilos.
 */
declare const SarakUIProvider: React__default.FC<SarakUIProviderProps>;

/** Classe raiz da ilha. DEVE casar com `SCOPE_CLASS` de `scripts/build-scoped-css.mjs`. */
declare const SARAK_SCOPE_CLASS = "sarak-scope";
/**
 * Dica de modo lida do documento ANTES de qualquer render.
 *
 * A injeção automática de CSS (Spec 08 §2) roda na IMPORTAÇÃO do módulo, muito antes
 * de o Provider montar e saber o modo. Num host já renderizado (SSR/HTML estático),
 * isso significaria um flash do preflight global re-estilizando a página. O consumidor
 * embarcado mata esse flash marcando o documento:
 *
 * ```html
 * <html data-sarak-ui-mode="embedded">
 * ```
 */
declare const SARAK_MODE_ATTRIBUTE = "data-sarak-ui-mode";

interface DesignScopeProps {
    design: SarakDesignState;
    children: React__default.ReactNode;
    className?: string;
    style?: React__default.CSSProperties;
}
/**
 * DesignScope (v12.0)
 *
 * Envolve um conteúdo em um escopo isolado de variáveis CSS de design.
 * Agora injeta também um DesignOverrideContext para que componentes que usam
 * useSarakUI() dentro deste escopo consumam o design correto (rascunho).
 */
declare const DesignScope: React__default.FC<DesignScopeProps & Record<string, unknown>>;

declare const ThemeToggle: React__default.FC;

interface SarakButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
    isLoading?: boolean;
    leftIcon?: React__default.ReactNode;
    rightIcon?: React__default.ReactNode;
    fullWidth?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}
/**
 * Componente Atômico: SarakButton
 * Respeita a Spec 08-taxonomia-componentes e implementa a universalização de Neon/Frosted para todas as variantes.
 */
declare const SarakButton: React__default.FC<SarakButtonProps>;

interface SarakIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon: React__default.ReactNode;
}
/**
 * Componente Atômico: SarakIconButton
 * Um botão iconográfico com restrições geométricas exatas.
 * Implementa taxonomia completa (Neon, Frosted) adaptada para proporções quadradas/circulares.
 */
declare const SarakIconButton: React__default.FC<SarakIconButtonProps>;

/** Identidade do usuário exibida no Shell (vinda do app consumidor). */
interface ShellUser {
    username?: string;
    email?: string;
    level?: number;
    [key: string]: unknown;
}
interface SarakShellProps {
    children?: React__default.ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
    extraToolbarItems?: React__default.ReactNode;
    user?: ShellUser;
    logout?: () => void;
    token?: string;
    authApi?: unknown;
}

/**
 * Sarak Shell Core — Interface Engine (Refactored v7.2.5)
 */
declare const SarakShell: React__default.FC<SarakShellProps>;

type DeviceType = 'smartphone' | 'tablet' | 'desktop';
/** Traduz uma largura de viewport (px) no dispositivo correspondente (mobile-first). */
declare const deviceForWidth: (width: number) => DeviceType;
/**
 * Dispositivo ATIVO. Detecção REAL do viewport por padrão (estado inicial já vem da largura
 * atual — sem flash de `'desktop'`), reavaliada a cada `resize`. Um `overrideDevice` num
 * `DeviceProvider` ancestral (Gêmeo Digital/testes) sequestra o valor e desliga a escuta.
 */
declare const useSarakDevice: () => DeviceType;
interface DeviceProviderProps {
    children: ReactNode;
    /** Se fornecido, sequestra o dispositivo (Gêmeo Digital / testes) e desliga a detecção real. */
    overrideDevice?: DeviceType;
}
/**
 * Provider do override de dispositivo. Sem `overrideDevice`, é um passthrough transparente:
 * a detecção real (no hook) governa. Mantido na API por compatibilidade e para o Gêmeo Digital
 * forçar um dispositivo no preview.
 */
declare const DeviceProvider: React__default.FC<DeviceProviderProps>;

/**
 * resolveResponsiveValue (Spec 40.3 — L2)
 *
 * Ponte entre o `ResponsiveValue<T>` (valor por breakpoint `mob`/`tab`/`desk`, Spec 16)
 * e o dispositivo ATIVO (`useSarakDevice`, `'smartphone'|'tablet'|'desktop'`). É a função
 * PURA que as primitivas de layout usam para aceitar `ResponsiveValue` sem duplicar a
 * lógica de seleção — o consumidor passa um valor por dispositivo (controle opcional) e a
 * primitiva resolve o do device atual. Um valor escalar (`T` puro) passa direto (default
 * mobile-first fica por conta de cada primitiva).
 *
 * Testável isoladamente (Regra 3). Não lê contexto React — recebe o `device` já resolvido.
 */

/** Dispositivo ativo — espelha `DeviceType` de `DeviceProvider` sem criar dependência de runtime. */
type ResponsiveDevice = 'smartphone' | 'tablet' | 'desktop';
/** True se `value` é um `ResponsiveValue<T>` (tem as três camadas `mob`/`tab`/`desk`). */
declare const isResponsiveValue: <T>(value: unknown) => value is ResponsiveValue<T>;
/**
 * Resolve `value` contra o dispositivo ativo. `ResponsiveValue<T>` → a camada do device;
 * `T` escalar → ele mesmo. Nunca lança; um objeto sem as três camadas não é `ResponsiveValue`.
 */
declare const resolveResponsiveValue: <T>(value: T | ResponsiveValue<T>, device: ResponsiveDevice) => T;

interface SarakAnalyticalPageProps {
    navBar?: ReactNode;
    mainContent: ReactNode;
    sidePanel?: ReactNode;
    /** Se true, o painel lateral abre como um modal/drawer por cima no mobile. Se false, fica empilhado. Default: true */
    sidePanelAsDrawerOnMobile?: boolean;
    /** Se true, centraliza horizontalmente e verticalmente o mainContent no Desktop para preencher vazios. */
    centeredOnDesktop?: boolean;
}
/**
 * SarakAnalyticalPage
 *
 * Uma Fôrma Inteligente (Smart Layout) para telas de dashboard/análise.
 * No Desktop: Distribui navBar, mainContent e sidePanel em colunas.
 * No Mobile: Oculta navBar ou transforma em modal, empilha mainContent e transforma sidePanel em BottomSheet/Drawer.
 */
declare const SarakAnalyticalPage: React__default.FC<SarakAnalyticalPageProps>;

interface SarakHiddenProps {
    children: ReactNode;
    /** Esconder quando o dispositivo ativo estiver nesta lista */
    on: DeviceType | DeviceType[];
}
/**
 * SarakHidden
 *
 * Componente utilitário que não renderiza o conteúdo dependendo do dispositivo.
 * Isso evita poluição do DOM e uso de RAM em dispositivos que não exibirão o componente.
 */
declare const SarakHidden: React__default.FC<SarakHiddenProps>;

/**
 * SarakShellNav — Navegação de shell 100% orientada a dados (Spec 33 + Spec 14)
 *
 * Menu guiado por DADOS: recebe os módulos como `items`, agrupa por categoria, destaca
 * o item ativo e **delega a navegação ao host** — nunca manipula a URL. O consumidor
 * passa `activeRoute` (a rota atual, do roteador dele) e reage em `onNavigate`.
 */
/** Item de navegação do shell — espelho declarativo do `SarakModule` do Discovery. */
interface ShellNavItem {
    /** Rótulo exibido no menu. */
    label: string;
    /** Rota destino (comparada com `activeRoute` para o destaque). */
    route: string;
    /** Nome do ícone (resolvido pelo `SarakIcon`/IconMap). */
    icon?: string;
    /** Agrupamento visual (itens sem categoria ficam no grupo raiz). */
    category?: string;
}
interface SarakShellNavProps {
    /** Módulos/rotas do sistema, na ordem de exibição. */
    items: ShellNavItem[];
    /** Rota ativa (a do roteador do consumidor) — comparada com `items[].route`. */
    activeRoute?: string;
    /** Identidade exibida no topo do menu. */
    brand?: {
        name?: string;
        logoUrl?: string;
    };
    /** Callback de navegação — o host decide como navegar (router, pushState, assign). */
    onNavigate?: (route: string) => void;
    /** Alias de `onNavigate`; ambos são chamados, na ordem. Mantido por compatibilidade. */
    onChange?: (route: string) => void;
    /**
     * Orientação do menu (Spec 18). `'auto'` (default) segue o Design Engine:
     * `design.navigationStyle === 'topbar'` → horizontal; qualquer outro → vertical.
     * `'dock'`/`'glass'` do shell legado ficam fora desta spec (tratados como vertical).
     */
    orientation?: 'vertical' | 'horizontal' | 'auto';
    className?: string;
}
/** Menu vertical de shell guiado por dados, com grupos e estado ativo (Spec 33). */
declare const SarakShellNav: React__default.FC<SarakShellNavProps>;

/**
 * Item de navegação estruturado do `SarakAppChrome` (Spec 40.2 — L1).
 *
 * Modelo de NAVEGAÇÃO com ícone first-class, pensado para o consumidor de apps
 * separados (conector-redirect): cada item aponta para uma `href` (URL de destino)
 * e o próprio consumidor marca qual está `active`. É o contrato que o `@erp/ui-kit`
 * compartilha entre todos os apps para o cromo ficar IDÊNTICO em toda aba.
 *
 * O `icon` é resolvido pelo `SarakIcon`/`IconMap` curado (mesmo motor do shell),
 * temável por token, opcional por item. Difere do `ShellNavItem` (que usa
 * `route`/`activeRoute` do modelo declarativo) por trazer `id` estável + `active`
 * por item — mais ergonômico para um menu de topo estático por app.
 *
 * Mora em `chrome/` (e não no `SarakAppChrome.tsx`) só por higiene de tamanho de
 * arquivo — o tipo continua público pelo mesmo caminho (re-export no cromo + barril).
 */
interface SarakNavItem {
    /** Identidade estável do item (chave de render; não precisa ser a URL). */
    id: string;
    /** Rótulo exibido ao lado do ícone. */
    label: string;
    /** Nome do ícone (resolvido pelo `SarakIcon`/`IconMap` curado). Opcional. */
    icon?: string;
    /** URL de destino — o host navega para cá (redirect de página, router, etc.). */
    href: string;
    /** Marca o item como ativo (destaque + `aria-current="page"`). */
    active?: boolean;
}

/**
 * SarakAppChrome — cromo apresentacional temável (topbar/sidebar) SEM host/registro.
 *
 * A lacuna real do Teste Real (Spec 40.1 — L2): os tokens de cromo da Spec 18
 * (`--sarak-topbar-*`, `--sarak-sidebar-*`) ficavam SEM consumidor porque o único
 * consumidor era o `SarakShell`, que é um HOST de módulos-plugin (renderiza o
 * `activeModule` do Discovery, não `children`). Um consumidor de apps-separados (como
 * o ERP) não usa o modelo Shell/registro — então nada pintava a topbar/sidebar.
 *
 * `SarakAppChrome` fecha isso: é um cromo 100% PRESENTACIONAL — topbar/sidebar + área
 * de conteúdo (`children`) —, temável por tokens do Design Engine, que CADA app
 * renderiza sozinho. Sem `registerSarakModule`, sem Discovery, sem acoplar módulos.
 * A navegação é DADO (`navItems`/`nav`) e a seleção sai por callback (`onNavigate`) —
 * o host decide o que fazer (redirect de página inteira, router local, etc.).
 *
 * Multidispositivo por padrão (Spec 40.3 — L1), zero-config via `useSarakDevice`: em
 * **desktop** é o cromo configurado (sidebar/topbar); em **tablet** vira topbar compacta
 * (a sidebar cheia comeria a tela ≤1024px); no **celular** colapsa para barra + hambúrguer
 * + drawer (`SarakAppChromeMobile`) — a nav não ocupa a tela toda e continua acessível. O
 * consumidor não escreve CSS/media query; para refinar, os tokens de cromo aceitam
 * `ResponsiveValue` pelo Design Engine.
 *
 * Extensibilidade de layout (Spec 48 — L1): os slots `logo`/`topbarStart`/`topbarEnd`/
 * `sidebarHeader`/`sidebarFooter`/`banner`/`footer`/`decoration` deixam o consumidor
 * injetar imagem, animação ou qualquer `ReactNode` em regiões do cromo sem forkar a
 * componente. Todos opcionais (ausente = região não renderiza); complementam — não
 * substituem — o fundo/atmosfera GLOBAL por tema do Design Engine.
 *
 * Zero hardcode (Regra 2): toda cor/medida vem de tokens `--sarak-*` com fallback.
 */
interface SarakAppChromeProps {
    /** Conteúdo do app (a tela do próprio módulo). */
    children: React__default.ReactNode;
    /** Identidade exibida no cromo (topo da sidebar / início da topbar). */
    brand?: {
        name?: string;
        logoUrl?: string;
    };
    /**
     * Navegação ESTRUTURADA com ícone first-class (Spec 40.2 — L1). Renderiza
     * ícone (via `SarakIcon`/`IconMap`) + label, temável por token, com estado
     * ativo acessível (`aria-current`, foco por teclado). É o caminho recomendado
     * para o cromo por-app; tem precedência sobre `nav` quando ambos são passados.
     */
    navItems?: SarakNavItem[];
    /**
     * Itens de navegação como DADO no contrato do `SarakShellNav` (modelo declarativo,
     * `route`/`activeRoute`). Mantido para compatibilidade; prefira `navItems`.
     */
    nav?: ShellNavItem[];
    /** Rota ativa (destaca o item correspondente no `nav`; ignorado se `navItems`). */
    activeRoute?: string;
    /** Clique/teclado num item de navegação — o host decide como navegar. */
    onNavigate?: (route: string) => void;
    /**
     * Estilo do cromo. `'auto'` (default) segue o Design Engine
     * (`design.navigationStyle === 'topbar'` → topbar; caso contrário → sidebar),
     * então trocar o tema no `/design` também troca a orientação do cromo.
     */
    navigationStyle?: 'sidebar' | 'topbar' | 'auto';
    /** Conteúdo à direita da topbar (ações, avatar, seletor de tema…). Alias legado de `topbarEnd`. */
    topbarActions?: React__default.ReactNode;
    /**
     * Slot `logo` (Spec 48 — L1): logo custom/animado (`ReactNode`). Tem PRECEDÊNCIA
     * sobre `brand.logoUrl`; o `brand.name` continua ao lado. Aparece nos três modos.
     */
    logo?: React__default.ReactNode;
    /**
     * Slot `topbarStart`: conteúdo no INÍCIO da barra superior (após a marca).
     * Sem barra superior (modo sidebar) degrada para o topo da sidebar.
     */
    topbarStart?: React__default.ReactNode;
    /**
     * Slot `topbarEnd`: conteúdo no FIM da barra superior. É o mesmo lugar do
     * `topbarActions` (alias preservado); quando os dois vêm, `topbarEnd` vence.
     * No modo sidebar degrada para o rodapé da sidebar (comportamento atual).
     */
    topbarEnd?: React__default.ReactNode;
    /** Slot `sidebarHeader`: topo da sidebar (abaixo da marca). No celular migra para o drawer. */
    sidebarHeader?: React__default.ReactNode;
    /** Slot `sidebarFooter`: rodapé da sidebar. No celular migra para o drawer. */
    sidebarFooter?: React__default.ReactNode;
    /** Slot `banner`: faixa full-width no topo do cromo (aviso, promo, faixa animada). */
    banner?: React__default.ReactNode;
    /** Slot `footer`: faixa full-width na base do cromo (rodapé da página). */
    footer?: React__default.ReactNode;
    /**
     * Slot `decoration`: camada decorativa ATRÁS do conteúdo do cromo (imagem/animação
     * escopada ao cromo). É ornamento — `aria-hidden` e sem captura de foco/toque.
     * COMPLEMENTA o fundo/atmosfera global por tema (Design Engine), não o substitui.
     */
    decoration?: React__default.ReactNode;
    className?: string;
    style?: React__default.CSSProperties;
}
/**
 * Cromo apresentacional. Renderiza topbar OU sidebar (por `navigationStyle`) + a área
 * de conteúdo, tudo pintado pelos tokens de navegação (Spec 18) que o Design Engine emite.
 */
declare const SarakAppChrome: React__default.FC<SarakAppChromeProps>;

/**
 * Contrato público de nomes de ícone da Sarak UI Core (Spec 41 §2.3).
 *
 * Esta lista é a FONTE ÚNICA: dela derivam o tipo `IconName`, os três mapas de
 * família (`families/`) — que o TypeScript obriga a cobrir 1:1 — e a seção de
 * ícones do catálogo gerado (`docs/component-catalog.*`).
 *
 * Um nome fora desta lista NÃO renderiza o ícone pedido: o `SarakIcon` degrada
 * para o ícone de aviso e emite `console.warn` (postura da Spec 17). Antes da
 * Spec 41 qualquer nome do `lucide-react` funcionava, porque o componente caía
 * num acesso dinâmico ao barril (`LucideIcons[nome]`) — o que impedia o
 * tree-shaking e arrastava ~1500 ícones para o bundle do consumidor.
 *
 * Para acrescentar um nome: some-o aqui e o compilador vai cobrar a entrada
 * correspondente nas três famílias. Cada nome novo custa ~2,6 KB no `dist/` da
 * lib (phosphor ~2,35 KB + tabler ~0,28 KB — o lucide é `external`), então a
 * lista é curada de propósito, não exaustiva.
 */
declare const ICON_NAMES: readonly ["AlertCircle", "AlertTriangle", "Check", "CheckCircle2", "X", "Info", "HelpCircle", "Menu", "Search", "Bell", "Filter", "List", "Grid", "Layout", "LayoutDashboard", "Home", "ChevronDown", "ChevronLeft", "ChevronRight", "ChevronUp", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ArrowUpDown", "CornerDownRight", "MoreVertical", "MoreHorizontal", "Maximize2", "Minimize2", "Loader2", "RefreshCw", "User", "UserPlus", "Users", "LogIn", "LogOut", "Lock", "Shield", "Eye", "File", "FileText", "FileSpreadsheet", "Folder", "Image", "Paperclip", "ScrollText", "Clipboard", "Copy", "Download", "Upload", "UploadCloud", "Printer", "Save", "Edit", "Edit3", "Plus", "Trash2", "Type", "AlignLeft", "Hash", "Activity", "BarChart3", "LineChart", "PieChart", "ScatterChart", "TrendingUp", "Database", "Layers", "Network", "Box", "Package", "Cpu", "Cloud", "Terminal", "Thermometer", "History", "Calendar", "Clock", "MessageSquare", "Mail", "Send", "Phone", "Bot", "Globe", "Link", "ExternalLink", "Briefcase", "Building", "CreditCard", "DollarSign", "MapPin", "Tag", "Star", "Play", "Palette", "Settings", "Zap", "Chrome", "Github"];
/** Nome de ícone válido no contrato público. */
type IconName = (typeof ICON_NAMES)[number];
/** Ícone usado quando o nome pedido não existe no contrato (degradação visível). */
declare const ICONE_DESCONHECIDO: IconName;

interface SarakIconProps {
    name: IconName | string;
    size?: number | string;
    className?: string;
    color?: string;
    style?: React__default.CSSProperties;
    onClick?: () => void;
}
declare const SarakIcon: React__default.FC<SarakIconProps>;

/**
 * Mapa curado nome→componente das três famílias de ícone.
 *
 * A lista de nomes vive em `iconNames.ts` (contrato público, publicado no
 * catálogo); cada família tem seu módulo em `families/`, com imports NOMEADOS
 * e estáticos. O tipo `Record<IconName, ...>` de cada módulo faz o compilador
 * garantir a paridade 1:1:1 entre as famílias — nome sem tripla não compila.
 */

/** Famílias de ícone suportadas pelo token `iconFamily`. */
type IconFamily = 'lucide' | 'phosphor' | 'tabler';
interface IconTriple {
    lucide: React__default.ElementType;
    phosphor: React__default.ElementType;
    tabler: React__default.ElementType;
}
declare const IconMap: Record<IconName, IconTriple>;

/**
 * useDesignDraft (v12.1 - Data-Driven)
 * Orquestrador de rascunhos com isolamento de sandbox.
 */
declare const useDesignDraft: (sarak: SarakUIContextType) => {
    draft: SarakDesignState;
    isDirty: boolean;
    isComponentDirty: (schemaId: string) => boolean;
    updateDraft: (key: string, value: SarakTokenValue) => void;
    resetComponent: (schemaIdOrSchemas: string | string[]) => void;
    resetToken: (tokenId: string) => void;
    handleThemePreview: (presetDesign: Partial<SarakDesignState>, presetKeyId?: string) => void;
    handleApplyToSystem: () => void;
    handleApplyComponent: (schemaId: string) => void;
    toast: {
        type: "success" | "warning";
        message: string;
    } | null;
    showToast: (type: "success" | "warning", message: string) => void;
};

/**
 * Presets: Temas Globais
 *
 * Configurações que alteram a aplicação inteira de uma vez.
 * Formato: { id: ThemePresetId; name: string; description: string; design: Record<string, unknown> }
 *
 * `design` é `Record<string, unknown>` (Zero `any` — §0.6) e NÃO o `SarakThemePayload`
 * estrito: os presets legados carregam valores que divergiram do domínio fechado do
 * payload (ex.: `logoMinimalUrl`, `cardVariant: "solid"`), reconciliação pendente com a
 * paridade 1:1:1:1:1 (ver `Provider/types.ts`). A blindagem estrita vive na diretiva
 * `theme` (Spec 42), que autores de manifesto consomem via `Partial<SarakThemePayload>`.
 */
/**
 * União conhecida dos ids de preset (fonte única; espelha `GLOBAL_THEMES`).
 * Adicionar um tema = adicionar seu id aqui e importá-lo abaixo. Consumida pela
 * diretiva `theme` (Spec 42) como o ramo "preset nomeado".
 */
declare const THEME_PRESET_IDS: readonly ["sarak-sovereign", "crystal-glass", "cyberpunk-neon", "holographic-glass", "industrial-terminal", "nature-breeze", "neo-brutalism", "synthwave-retro", "nebula-space", "dot-matrix-elegant", "stellar-nebula", "kinetic-flow", "cyber-retro-wave", "minimalist-airy", "data-terminal", "neumorphic-mobile", "industrial-dashboard", "asymmetric-editorial"];
type ThemePresetId = (typeof THEME_PRESET_IDS)[number];
interface ThemePreset {
    id: ThemePresetId;
    name: string;
    description: string;
    design: Record<string, unknown>;
}
declare const GLOBAL_THEMES: ThemePreset[];

/**
 * Temas de REFERÊNCIA da lib (Spec 40.1 — L6).
 *
 * A lib fornece um PAR de temas COMPLETOS (todos os eixos: cor + fonte + cromo
 * topbar/sidebar + raio + espaçamento) para o consumidor CUSTOMIZAR — em vez de montar
 * do zero e esquecer eixos (a causa-raiz de "fonte/cromo não mudam" do Teste Real, onde
 * o `ERP_THEMES` nasceu com só ~10 chaves de cor). O consumidor parte destes, troca
 * poucos valores (marca/cor) e mantém a completude por construção.
 *
 * O par difere em MODO (claro/escuro), NAVEGAÇÃO (topbar/sidebar) e FONTE de propósito,
 * para que alternar entre eles mude visivelmente cor E fonte E cromo E raio — a prova
 * ampla do R5.
 */

/** Busca um preset completo do catálogo pelo id. */
declare const getThemePreset: (id: ThemePresetId) => ThemePreset | undefined;
/**
 * Par de referência recomendado: um CLARO (`minimalist-airy`, topbar, Inter) e um
 * ESCURO (`sarak-sovereign`, sidebar, Outfit). Ambos completos — ponto de partida para
 * o consumidor. Use direto em `customThemes` do `SarakUIProvider`, ou clone e ajuste.
 */
declare const SARAK_REFERENCE_THEMES: ThemePreset[];

/**
 * Helper para obter todos os tokens em uma lista plana.
 */
declare const getAllDesignTokens: () => DesignToken[];
/**
 * Helper para obter os valores padrão de todos os tokens.
 */
declare const getDefaultDesignState: () => Record<string, SarakTokenValue>;

/**
 * Cobertura de EIXOS de um tema (Spec 40.1 — L6, aviso de omissão).
 *
 * Um tema "completo" preenche todos os eixos conceituais que o consumidor espera ver
 * mudar ao trocar de tema: cor, fonte, cromo (topbar/sidebar), raio e espaçamento. Um
 * tema que omite um eixo inteiro (o `ERP_THEMES` do v5, só cor) faz o consumidor achar
 * que "a lib não muda fonte/cromo", quando na verdade o TEMA é que não os declara.
 *
 * `findMissingThemeAxes` detecta esses buracos; `warnOnIncompleteTheme` avisa uma vez
 * (dev), sem lançar. São utilitários OPT-IN — a lib não força completude, só ajuda o
 * consumidor a não ficar silenciosamente incompleto.
 */

/** Eixo conceitual → tokens representativos (basta UM presente para o eixo contar). */
declare const THEME_AXES: Readonly<Record<string, readonly string[]>>;
/** Eixos que o tema NÃO declara (nenhum token representativo presente). Vazio = completo. */
declare const findMissingThemeAxes: (design: SarakDesignState | Record<string, unknown>) => string[];
/**
 * Avisa (uma vez, `console.warn`) se o tema omite eixos inteiros. Não lança — apenas
 * sinaliza ao dev. Chame ao aplicar um tema custom para não ficar incompleto em silêncio.
 */
declare const warnOnIncompleteTheme: (design: SarakDesignState | Record<string, unknown>, label?: string) => string[];

/**
 * CustomizationPanel (v6.0)
 * Central de Comando Unificada - Foco 100% em Soberania e Gêmeo Digital.
 */
declare const CustomizationPanel: React__default.FC;

interface SocialButtonProps {
    provider: 'google' | 'github';
    variant: 'glass' | 'sovereign';
    onClick?: (provider: 'google' | 'github') => void;
    label?: string;
    hideLabel?: boolean;
    className?: string;
}
declare const SocialButton: React__default.FC<SocialButtonProps>;

type SarakTypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'mono';
type SarakTypographyColor = 'main' | 'secondary' | 'muted';
interface SarakTypographyProps extends React__default.HTMLAttributes<HTMLElement> {
    /** Escala tipográfica (Spec typography — tokens `h1Size`/`h2Size`/etc). Default: `body`. */
    variant?: SarakTypographyVariant;
    /** Cor de texto (`textColorMaster`/`textColorSecondary`/`textColorMuted`). Default: `main`. */
    color?: SarakTypographyColor;
    /** Tag HTML a renderizar; sobrepõe o default semântico do `variant`. */
    as?: React__default.ElementType;
    /** Sobrepõe `--sarak-h-transform` só para esta instância. */
    transform?: 'none' | 'uppercase' | 'capitalize';
    /**
     * Texto via prop, para quando a origem é uma string e não nós filhos (ex.: dado
     * vindo de uma API). Tem prioridade sobre `children` quando ambos são passados.
     */
    content?: string;
    children?: React__default.ReactNode;
}
/**
 * Componente Atômico: SarakTypography (Spec typography).
 * Único átomo de texto/hierarquia tipográfica da Sarak — resolvível via manifesto
 * (`"type": "SarakTypography"`) ou uso direto em TSX. 100% orientado a tokens já
 * existentes no Design Engine (nenhum valor visual novo introduzido).
 */
declare const SarakTypography: React__default.FC<SarakTypographyProps>;

interface ExpandableCardProps {
    title: string;
    iconContent?: React__default.ReactNode;
    helpButton?: React__default.ReactNode;
    children: React__default.ReactNode;
    className?: string;
    contentClassName?: string;
    baseHeight?: number;
}
declare const ExpandableCard: React__default.FC<ExpandableCardProps>;

interface SarakActionCardProps<TItem extends Record<string, unknown>> {
    item: TItem;
    mapping?: Record<string, string>;
    className?: string;
    onAction?: (item: TItem) => void;
    design?: SarakThemePayload;
    label?: string;
    /** Texto do botão de ação principal (default: "Executar"). */
    actionLabel?: string;
}
declare const SarakActionCard: <TItem extends Record<string, unknown>>({ item, mapping, className, onAction, design: localDesign, label, actionLabel }: SarakActionCardProps<TItem>) => react_jsx_runtime.JSX.Element;

interface SarakSearchCardProps<TItem extends Record<string, unknown>> {
    item: TItem;
    mapping?: Record<string, string>;
    className?: string;
    onSearchChange?: (text: string) => void;
    onToggleCapability?: (cap: string, active: boolean) => void;
    design?: SarakThemePayload;
    label?: string;
}
declare const SarakSearchCard: <TItem extends Record<string, unknown>>({ item, mapping, className, onSearchChange, onToggleCapability, design: propDesign, label }: SarakSearchCardProps<TItem>) => react_jsx_runtime.JSX.Element;

interface SarakTitleCardProps<TItem extends Record<string, unknown>> {
    item: TItem;
    mapping?: Record<string, string>;
    className?: string;
    design?: SarakThemePayload;
    label?: string;
}
declare const SarakTitleCard: <TItem extends Record<string, unknown>>({ item, mapping, className, design: localDesign, label }: SarakTitleCardProps<TItem>) => react_jsx_runtime.JSX.Element;

type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse' | string;
interface SarakFlexProps extends Omit<React__default.HTMLAttributes<HTMLDivElement>, 'children'> {
    children: React__default.ReactNode;
    /** Direção do eixo. Aceita `ResponsiveValue` para variar por dispositivo (opcional). */
    direction?: FlexDirection | ResponsiveValue<FlexDirection>;
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | string;
    align?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | string;
    gap?: string;
    /**
     * Quebra em múltiplas linhas quando não cabe (mobile-first). Default `true`: uma linha de
     * itens nunca estoura a página no celular — reflui para baixo. Passe `false` para forçar
     * linha única (nowrap) quando o layout exigir.
     */
    wrap?: boolean;
    as?: React__default.ElementType;
}
/**
 * Componente Atômico de Micro-Layout (Flexbox).
 * O SarakFlex é um container flexível que lê os estilos estruturais do Design Engine
 * ou aceita injeção local de parâmetros, traduzindo-os sem depender de classes CSS hardcoded.
 *
 * Multidispositivo por padrão (Spec 40.3 — L2): `wrap` liga por padrão (itens quebram em vez
 * de transbordar no celular) e `direction` aceita `ResponsiveValue` para controle opcional.
 */
declare const SarakFlex: React__default.FC<SarakFlexProps>;

interface SarakGridProps extends Omit<React__default.HTMLAttributes<HTMLDivElement>, 'children'> {
    children: React__default.ReactNode;
    /**
     * Colunas do grid. Aceita:
     * - `string` fixo (ex.: `"1fr 1fr 1fr"`): mobile-first por padrão — **colapsa para 1
     *   coluna no celular** (nunca estoura a página), reflui no valor cheio em tablet/desktop.
     * - `ResponsiveValue<string>` (`{ mob, tab, desk }`): o consumidor controla por dispositivo.
     * Sem `templateColumns`, usa a estratégia de grid do Design Engine (também 1 coluna no celular).
     */
    templateColumns?: string | ResponsiveValue<string>;
    templateAreas?: string;
    gap?: string;
    as?: React__default.ElementType;
}
/**
 * Componente Atômico de Macro-Layout.
 * O SarakGrid é o container raiz que lê o Token de Layout do Design Engine
 * e organiza os componentes filhos (Cards, Tabelas, Gráficos) na malha correta.
 * Ele elimina a necessidade de chumbarmos "grid-cols-X" nas telas.
 *
 * Multidispositivo por padrão (Spec 40.3 — L2): um `templateColumns` fixo colapsa para
 * **uma coluna no celular** (via `useSarakDevice`), então nenhum grid estoura horizontalmente
 * no mobile sem o consumidor escrever CSS. Para controlar por dispositivo, passe um
 * `ResponsiveValue<string>`.
 */
declare const SarakGrid: React__default.FC<SarakGridProps>;

interface SarakSplitPaneProps {
    leftPane: React__default.ReactNode;
    rightPane: React__default.ReactNode;
    minLeftWidth?: number;
    maxLeftWidth?: number;
    defaultLeftWidth?: number;
    className?: string;
}
/**
 * Componente de Painel Redimensionável (Split Pane).
 * Permite arraste fluido entre dois painéis respeitando os limites configurados.
 *
 * Multidispositivo por padrão (Spec 40.3 — L2): no celular (`useSarakDevice`) os painéis
 * **empilham** em coluna full-width (sem a divisória de arraste, que não faz sentido no
 * touch estreito) — nenhum painel de largura fixa estoura a página. Em tablet/desktop
 * mantém o split redimensionável.
 */
declare const SarakSplitPane: React__default.FC<SarakSplitPaneProps>;

interface SarakAccordionProps {
    title: React__default.ReactNode;
    children: React__default.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}
/**
 * Componente Atômico de Acordeão (Expansível).
 * Empurra o conteúdo abaixo fluidamente lendo os tokens de animação da Engine.
 */
declare const SarakAccordion: React__default.FC<SarakAccordionProps>;

interface SarakFormGroupProps extends React__default.HTMLAttributes<HTMLDivElement> {
    children: React__default.ReactNode;
    /** Espaçamento entre label e campo — token semântico (`spacing-md`) ou CSS válido. */
    gap?: string;
}
/**
 * Componente Atômico de Agrupamento de Formulários.
 * O SarakFormGroup envelopa Labels e Inputs, lendo as propriedades de
 * "Form Label Position" e "Form Density" do Design Engine para rearranjar
 * a estrutura sem que o desenvolvedor altere o JSX.
 */
declare const SarakFormGroup: React__default.FC<SarakFormGroupProps>;

/** Item navegável da Command Palette (Spec 14, Regra 1). */
interface NavigationItem {
    /** Identificador único. */
    id: string;
    /** Rótulo exibido e base da busca. */
    label: string;
    /** Termos extra para o filtro (além do label). */
    keywords?: string;
    /** Ícone opcional à esquerda. */
    icon?: React__default.ReactNode;
}
interface SarakSpotlightProps {
    /** Itens disponíveis para navegação instantânea. */
    items: NavigationItem[];
    /** Atalho de ativação global (default: `mod+k` = Ctrl/Cmd+K). */
    shortcut?: string;
    /** Modo controlado: estado de abertura. */
    open?: boolean;
    /** Notifica mudanças de abertura (abrir via atalho / fechar via Esc). */
    onOpenChange?: (open: boolean) => void;
    /** Acionado ao confirmar um item (Enter ou clique). */
    onSelect: (item: NavigationItem) => void;
    /** Placeholder do input central. */
    placeholder?: string;
}
/**
 * Command Palette global (Spec 14, Regra 1): modal por cima de tudo, acionável por
 * atalho, com input central + lista filtrada e navegação por teclado (setas + Enter).
 */
declare const SarakSpotlight: React__default.FC<SarakSpotlightProps>;

/** Passo de um fluxo orientado (Spec 14, Regra 2). */
interface StepConfig {
    /** Rótulo do passo. */
    label: string;
    /** Descrição/legenda opcional. */
    description?: string;
}
type StepperOrientation = 'horizontal' | 'vertical';
interface SarakStepperProps {
    /** Passos na ordem do fluxo. */
    steps: StepConfig[];
    /** Índice (0-based) do passo atual. */
    current: number;
    /** Disposição (default: horizontal). */
    orientation?: StepperOrientation;
    className?: string;
}
/**
 * Desenha passos + conectores indicando concluído/atual/futuro (Spec 14, Regra 2).
 * Em horizontal, a barra faz overflow-x com scroll em telas pequenas — nunca quebra
 * em duas linhas (Critério de Aceite).
 */
declare const SarakStepper: React__default.FC<SarakStepperProps>;

/** Migalha do caminho de navegação (Spec 14, Regra 3). */
interface BreadcrumbItem {
    /** Rótulo exibido. */
    label: string;
    /** Destino opcional (acionado via `onNavigate`, não pela URL diretamente). */
    href?: string;
    /** Ícone opcional à esquerda do rótulo. */
    icon?: React__default.ReactNode;
}
interface SarakBreadcrumbsProps {
    /** Caminho do usuário, da raiz à folha. */
    items: BreadcrumbItem[];
    /** Separador entre migalhas (default: `/`). */
    separator?: React__default.ReactNode;
    /** Delega a navegação ao host (Spec 33, Regra 3) — não manipula a URL. */
    onNavigate?: (href: string) => void;
    className?: string;
}
/** Trilha semântica com ícones e separador customizável (Spec 14, Regra 3). */
declare const SarakBreadcrumbs: React__default.FC<SarakBreadcrumbsProps>;

/** Token de paginação: número de página ou marcador de reticências. */
type PaginationToken = number | 'ellipsis';
/**
 * Gera a lista de renderização numérica (Spec 14, Regra 4): início, miolo em torno
 * da página atual e final, inserindo `ellipsis` quando há corte. Função PURA —
 * testável isoladamente, sem DOM.
 */
declare const buildPaginationRange: (current: number, total: number, maxVisible?: number) => PaginationToken[];
interface SarakPaginationProps {
    /** Página atual (1-based). */
    current: number;
    /** Total de páginas. */
    total: number;
    /** Máximo de botões numéricos antes de compactar com reticências (default: 7). */
    maxVisible?: number;
    /** Disparado ao escolher uma página válida (diferente da atual). */
    onChange: (page: number) => void;
    className?: string;
}
/** Controles `< 1 2 … 5 >` respeitando o design base da Sarak (Spec 14, Regra 4). */
declare const SarakPagination: React__default.FC<SarakPaginationProps>;

/**
 * Valida o esquema de um `href` de link contra uma allow-list (`http(s):`,
 * `mailto:`, `tel:`, caminhos relativos/âncora). Bloqueia `javascript:`, `data:`
 * e qualquer outro esquema executável — vetor clássico de XSS via link.
 */
declare const isSafeLinkHref: (href: string) => boolean;
interface SarakLinkProps extends Omit<React__default.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> {
    /** Destino do link. Esquemas perigosos (`javascript:`, `data:`, ...) são bloqueados. */
    href: string;
    /** Abre em nova aba com `rel="noreferrer noopener"` + indicação visual/a11y. */
    external?: boolean;
    children: React__default.ReactNode;
}
/**
 * Componente Atômico: SarakLink
 * Âncora acessível por tokens: anel de foco real (`--sarak-focus-width`), `href`
 * validado por allow-list de esquema, e marcação de link externo (`target="_blank"`
 * + `rel="noreferrer noopener"` + ícone/texto para leitor de tela).
 */
declare const SarakLink: React__default.FC<SarakLinkProps>;

interface UserPayload {
    email?: string;
    [key: string]: unknown;
}
interface ModuleConfig {
    id: string;
    label: string;
    [key: string]: unknown;
}
interface LanguageOption {
    id: string;
    label: string;
}
declare const LanguageSelector: () => react_jsx_runtime.JSX.Element;
declare const UserMenu: ({ user, onPasswordModal, onLogout }: {
    user: UserPayload | null;
    onPasswordModal: () => void;
    onLogout: () => void;
}) => react_jsx_runtime.JSX.Element;
declare const ModuleSelector: ({ currentModule, setCurrentModule, modules }: {
    currentModule: string;
    setCurrentModule: (id: string) => void;
    modules: ModuleConfig[];
}) => react_jsx_runtime.JSX.Element;

interface SarakInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React__default.ReactNode;
    leftIcon?: React__default.ReactNode;
    rightIcon?: React__default.ReactNode;
    error?: string;
    fullWidth?: boolean;
}
/**
 * Componente Atômico: SarakInput
 * Segue a regra da "Composição Atômica Obrigatória" da Sarak-Lib-UI-Core.
 */
declare const SarakInput: React__default.FC<SarakInputProps>;

interface SarakSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    fullWidth?: boolean;
}
/**
 * Componente Atômico: SarakSelect
 */
declare const SarakSelect: React__default.FC<SarakSelectProps>;

interface SarakTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    fullWidth?: boolean;
}
/**
 * Componente Atômico: SarakTextarea
 */
declare const SarakTextarea: React__default.FC<SarakTextareaProps>;

interface SarakSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    valueLabel?: string | number;
}
/**
 * Componente Atômico: SarakSlider
 * Substitui o `<input type="range">`.
 */
declare const SarakSlider: React__default.FC<SarakSliderProps>;

interface SarakSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React__default.ReactNode;
    description?: React__default.ReactNode;
}
/**
 * Componente Atômico: SarakSwitch
 */
declare const SarakSwitch: React__default.FC<SarakSwitchProps>;

interface SarakSearchProps {
    isOpen: boolean;
    onClose: () => void;
}
/**
 * SarakSearch (v6.0 Command Palette)
 *
 * Global search component integrated into the Sarak ecosystem.
 */
declare const SarakSearch: React__default.FC<SarakSearchProps>;

/** Par ordenado [início, fim] de um intervalo contínuo. */
type RangeValue = [number, number];
interface SarakRangeSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    /** Controlado: par [início, fim]. */
    value?: RangeValue;
    /** Não-controlado: valor inicial. */
    defaultValue?: RangeValue;
    disabled?: boolean;
    error?: string;
    /** Esconde as tooltips de valor sobre os thumbs. */
    hideTooltips?: boolean;
    /** Recebe o novo par já clampado/ordenado (Spec 32: `onChange(value)`). */
    onChange?: (value: RangeValue) => void;
}
/**
 * Componente Atômico: SarakRangeSlider (Spec 11, Regra 5)
 * Slider duplo (início/fim) para intervalos contínuos, com tooltips de valor.
 * Dois `<input type="range">` sobrepostos preservam a navegação por teclado nativa;
 * o trilho colorido entre os thumbs reflete os tokens do Design Engine.
 */
declare const SarakRangeSlider: React__default.FC<SarakRangeSliderProps>;

interface MultiSelectOption {
    value: string;
    label: string;
}
interface SarakMultiSelectProps {
    label?: string;
    options: MultiSelectOption[];
    /** Controlado: lista de values selecionados. */
    value?: string[];
    /** Não-controlado: seleção inicial. */
    defaultValue?: string[];
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React__default.CSSProperties;
    /** Emite a nova lista de values (Spec 32: `onChange(value)`). */
    onChange?: (value: string[]) => void;
}
/**
 * Componente Atômico: SarakMultiSelect (Spec 11, Regra 2)
 * Combobox com autocomplete: busca digitada, seleção múltipla e chips deletáveis.
 * O input de busca e os chips coexistem no mesmo campo — digitar NÃO desmonta os
 * chips nem perde o foco (Plano de Testes §4).
 */
declare const SarakMultiSelect: React__default.FC<SarakMultiSelectProps>;

/**
 * Tipos estruturais do react-dropzone declarados localmente — os tipos nomeados
 * (`Accept`/`FileRejection`) não resolvem sob `moduleResolution: node`. O formato
 * espelha o contrato real da lib: `accept` = MIME → extensões; `FileRejection` =
 * arquivo + motivos. São aceitos pela assinatura de opções do `useDropzone`.
 */
type Accept = Record<string, string[]>;
interface FileRejection {
    file: File;
    errors: Array<{
        code: string;
        message: string;
    }>;
}
interface SarakUploaderProps {
    label?: string;
    /** Tipos aceitos no formato do react-dropzone (ex.: `{ 'image/*': [] }`). */
    accept?: Accept;
    /** Tamanho máximo por arquivo, em bytes. */
    maxSize?: number;
    multiple?: boolean;
    disabled?: boolean;
    /** Texto-dica abaixo do título da área. */
    hint?: string;
    error?: string;
    className?: string;
    style?: React__default.CSSProperties;
    /** Recebe os arquivos aceitos (Spec 32: `onChange(value)`). */
    onChange?: (files: File[]) => void;
    /** Recebe as rejeições (ex.: arquivo maior que `maxSize`). */
    onReject?: (rejections: FileRejection[]) => void;
}
/**
 * Componente Atômico: SarakUploader (Spec 11, Regra 3)
 * Área drag-and-drop acessível sobre `react-dropzone` (peerDependency). Os estados
 * (ocioso, arrastando, rejeitado, erro de tamanho) mudam a borda para os tokens de
 * cor semânticos — `--sx-color-primary` ao arrastar, `--sx-color-danger` ao rejeitar.
 */
declare const SarakUploader: React__default.FC<SarakUploaderProps>;

type WeekStart = 0 | 1;

/**
 * Locale do `date-fns` passado adiante para `format`. Tipado de forma estrutural
 * (objeto opaco) porque o tipo nomeado `Locale` não resolve sob
 * `moduleResolution: node` — os locales reais (`ptBR`, etc.) são objetos atribuíveis.
 */
type DateLocale = object;

/** Valor: string ISO (single) ou par [início, fim] de ISOs (range). */
type DatePickerValue = string | [string, string];
interface SarakDatePickerProps {
    label?: string;
    mode?: 'single' | 'range';
    value?: DatePickerValue;
    /** Formato de exibição (i18n via JSON), ex.: `dd/MM/yyyy`. */
    displayFormat?: string;
    /** Locale do `date-fns` para nomes de mês/dia (i18n). */
    locale?: DateLocale;
    weekStartsOn?: WeekStart;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React__default.CSSProperties;
    /** Emite a nova data/intervalo em ISO (Spec 32: `onChange(value)`). */
    onChange?: (value: DatePickerValue) => void;
}
/**
 * Componente Atômico: SarakDatePicker (Spec 11, Regra 1)
 * Calendário popover in-house sobre `date-fns`. Suporta seleção única e de intervalo
 * na mesma interface, formatos i18n configuráveis e navegação por teclado (setas).
 */
declare const SarakDatePicker: React__default.FC<SarakDatePickerProps>;

interface SarakTimePickerProps {
    label?: string;
    /** Valor no formato 24h `HH:mm`. */
    value?: string;
    /** Passo dos minutos (ex.: 5, 15). */
    minuteStep?: number;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React__default.CSSProperties;
    /** Emite o novo horário `HH:mm` (Spec 32: `onChange(value)`). */
    onChange?: (value: string) => void;
}
/**
 * Componente Atômico: SarakTimePicker (Spec 11, Regra 1 — par temporal)
 * Seleção de horário 24h via dois campos (hora/minuto), com passo de minutos
 * configurável. Emite `HH:mm`; teclado nativo dos `<select>` cobre a navegação.
 */
declare const SarakTimePicker: React__default.FC<SarakTimePickerProps>;

/**
 * SarakRichText — editor WYSIWYG blindado (Spec 11, Regra 4 · Onda 10)
 *
 * Editor in-house sobre `contentEditable` — **zero dependência nova**. Toda saída (digitação
 * E colagem) passa pelo canal único de sanitização (`sanitizeHtml`, Spec 40), com allowlist
 * RESTRITA: marcações semânticas (negrito, itálico, listas, links, títulos), **nunca** tags
 * `<style>`/`<script>`, handlers `on*` ou `javascript:` (Critério de Aceite). Sem estilos
 * locais que rompam o escopo CSS. Integra ao formulário via `value` + `onChange(htmlLimpo)`,
 * consumido pelo `model`/`coerceEventValue` do LeafNode (Spec 32).
 */

/** Sanitiza o HTML do editor pela allowlist restrita. Exportado para teste isolado. */
declare const sanitizeRichText: (html: string) => string;
interface SarakRichTextProps {
    /** Conteúdo HTML controlado pelo consumidor (par com `onChange`). */
    value?: string;
    /** Conteúdo inicial não-controlado. */
    defaultValue?: string;
    /** Emite o HTML JÁ sanitizado a cada mudança. */
    onChange?: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
}
declare const SarakRichText: React__default.FC<SarakRichTextProps>;

interface FilterSelectProps {
    col: string;
    placeholder?: string;
    filters: Record<string, string>;
    onChange: (col: string, value: string) => void;
    options: string[];
}
declare const FilterSelect: React__default.FC<FilterSelectProps>;

declare const HelpButton: ({ text }: {
    text: string;
}) => react_jsx_runtime.JSX.Element;

interface SarakTableProps<TData extends Record<string, unknown> = Record<string, unknown>> {
    endpoint: string;
    data?: TData[];
    label?: string;
    mapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakTable Genérica (v6.0)
 *
 * Um componente agnóstico que renderiza qualquer conjunto de dados tabular
 * baseado em um contrato visual enviado pelo manifesto do módulo.
 */
declare const SarakTable: <TData extends Record<string, unknown> = Record<string, unknown>>({ endpoint, data: initialData, label, mapping, role, density }: SarakTableProps<TData>) => react_jsx_runtime.JSX.Element;

interface FilterConfig {
    id: string;
    label: string;
    type: 'TABS' | 'SELECT';
    field: string;
    options?: {
        label: string;
        value: string;
    }[];
    dynamic?: boolean;
}
interface SarakCardGridProps {
    endpoint: string;
    label?: string;
    /**
     * Mapa de dados do card. Cada valor é o CAMINHO de um campo do item, exceto os
     * marcados como *literal* (texto/nome fixo escrito pelo próprio autor).
     *
     * Genérico por contrato (Spec 42): a Sarak não conhece domínio nenhum — nenhuma
     * aritmética, unidade ou moeda é calculada aqui. O consumidor entrega valores
     * prontos em `details`.
     */
    mapping?: {
        title: string;
        subtitle?: string;
        description?: string;
        badge?: string;
        tags?: string;
        /** *literal*: nome do ícone (contrato de nomes em `docs/component-catalog.md`). */
        icon?: string;
        color?: string;
        /** Caminho para `Array<{ label, value }>` JÁ FORMATADO pelo consumidor — painel de detalhes. */
        details?: string;
        /** Caminho para `string[]` — chips da fileira primária. */
        input_caps?: string;
        /** Caminho para `string[]` — chips da fileira secundária. */
        output_caps?: string;
        /** *literal*: cabeçalho da fileira `input_caps` (ausente = fileira sem cabeçalho). */
        input_caps_label?: string;
        /** *literal*: cabeçalho da fileira `output_caps` (ausente = fileira sem cabeçalho). */
        output_caps_label?: string;
        /** *literal*: cabeçalho do bloco de descrição no painel expansível. */
        description_label?: string;
        /** *literal*: texto do botão que abre o painel expansível (default `"Ver mais"`). */
        expand_label?: string;
        /** *literal*: texto do mesmo botão com o painel aberto (default `"Fechar"`). */
        collapse_label?: string;
    };
    filters?: FilterConfig[];
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
    variant?: 'classic' | 'title' | 'action' | 'search';
}
/**
 * SarakCardGrid Core (v6.4)
 *
 * Renderiza um grid de cartões de alta fidelidade com suporte a metadados
 * técnicos complexos e FILTROS DINÂMICOS declarados via manifesto.
 */
declare const SarakCardGrid: <TData extends Record<string, unknown>>({ endpoint, label, mapping, filters, variant }: SarakCardGridProps) => react_jsx_runtime.JSX.Element;

interface SarakStatsProps<TData extends Record<string, unknown>> {
    endpoint?: string;
    data?: TData;
    label?: string;
    mapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakStats Genérico (v6.0)
 *
 * Exibe contadores e métricas-chave de forma elegante, servindo como
 * um mini-dashboard dinâmico para qualquer módulo.
 */
declare const SarakStats: <TData extends Record<string, unknown> = Record<string, unknown>>({ endpoint, data, label, mapping }: SarakStatsProps<TData>) => react_jsx_runtime.JSX.Element | null;

interface SarakChartProps {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakChart Genérico (v6.2)
 *
 * Renderiza tendências de dados usando uma interface visual de alta fidelidade
 * com barras animadas em CSS/SVG, mantendo o padrão Glassmorphism.
 */
declare const SarakChart: React__default.FC<SarakChartProps>;

interface SarakFormProps<TData extends Record<string, unknown>> {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>;
    mode?: 'create' | 'edit';
    initialData?: TData;
    actions?: Array<{
        label: string;
        endpoint: string;
        method: 'POST' | 'PATCH' | 'DELETE';
    }>;
    onSuccess?: () => void;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakForm Genérico (v6.2)
 *
 * Gera formulários de configuração dinamicamente baseados no manifesto.
 * Idela para abas de "Preferências" e "Configurações" de módulos.
 */
declare const SarakForm: <TData extends Record<string, unknown> = Record<string, unknown>>({ endpoint, label, mapping, actions, mode, initialData, onSuccess, role, density, importance }: SarakFormProps<TData>) => react_jsx_runtime.JSX.Element;

interface SarakManagementGridProps<TItem extends Record<string, unknown>> {
    endpoint: string;
    groupBy: string;
    ghostGroups?: string[];
    mapping: {
        id: string;
        title: string;
        status: string;
        isActive: string;
        description?: string;
        error?: string;
    };
    headerActions?: {
        label: string;
        action: string;
    }[];
    groupActions?: {
        label: string;
        icon?: 'plus' | 'settings';
        action: string;
    }[];
    formMapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
declare const SarakManagementGrid: <TItem extends Record<string, unknown> = Record<string, unknown>>({ endpoint, groupBy, ghostGroups, mapping, headerActions, groupActions, formMapping }: SarakManagementGridProps<TItem>) => react_jsx_runtime.JSX.Element;

interface SarakChatProps {
    endpoint: string;
    modelsEndpoint?: string;
    label?: string;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
declare const SarakChat: React__default.FC<SarakChatProps>;

interface SarakSecurityOrchestratorProps {
    endpoint: string;
    label?: string;
    config?: Record<string, unknown>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakSecurityOrchestrator (v7.5)
 *
 * Componente especializado em fluxos de soberania de segurança.
 * Gerencia o ciclo de vida do MFA: Status, Setup e Ativação.
 */
declare const SarakSecurityOrchestrator: React__default.FC<SarakSecurityOrchestratorProps>;

/**
 * Evento estruturado emitido por `onChange` (Spec 20) — o canal declarativo único
 * do template. A Engine injeta `onChange` quando o nó tem `actions` no manifesto
 * (mesmo mecanismo do `SarakShellNav.onChange`: LeafNode wire genérico) e o valor
 * emitido vira `{{$event}}` para a cadeia (ex.: `api_call` com `params: "{{$event}}"`).
 */
interface SarakAuthScreenEvent {
    intent: 'submit' | 'social' | 'forgot' | 'masterLogin' | 'toggleRegister' | 'backToPassword';
    username?: string;
    password?: string;
    mfaCode?: string;
    isRegistering?: boolean;
    provider?: string;
}
interface SarakAuthScreenProps {
    branding?: {
        name: string;
        logo?: string;
    };
    isRegistering?: boolean;
    setIsRegistering?: (val: boolean) => void;
    mfaStep?: boolean;
    setMfaStep?: (val: boolean) => void;
    username?: string;
    setUsername?: (val: string) => void;
    password?: string;
    setPassword?: (val: string) => void;
    mfaCode?: string;
    setMfaCode?: (val: string) => void;
    showPassword?: boolean;
    setShowPassword?: (val: boolean) => void;
    error?: string;
    isPending?: boolean;
    onSubmit?: (e: React__default.FormEvent) => void;
    onSocialLogin?: (provider: string) => void;
    socialConfig?: {
        enabled: boolean;
        display: 'compact' | 'full';
        providers: Array<{
            id: string;
            variant: 'glass' | 'sovereign';
        }>;
    };
    onForgot?: () => void;
    onMasterLogin?: () => void;
    /** Canal declarativo único — ver `SarakAuthScreenEvent`. Dispara em toda interação de negócio. */
    onChange?: (event: SarakAuthScreenEvent) => void;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakAuthScreen (Industrial Template v10 — Spec 20)
 *
 * Template soberano para fluxos de autenticação. Autocontido por padrão: campos e
 * alternância de modo vivem em estado interno quando o host não os controla; o único
 * canal que o host PRECISA injetar é `onChange` (ou os callbacks imperativos
 * individuais, para uso direto em TSX) para saber o que aconteceu. A lib nunca decide
 * onde o token vive nem chama rede — só entrega o evento (receita canônica de sessão:
 * Spec 08 §6.2-b).
 */
declare const SarakAuthScreen: React__default.FC<SarakAuthScreenProps>;

interface CatalogItem {
    id: string;
    display_name: string;
    organization?: string;
    category?: string;
    description?: string;
    [key: string]: unknown;
}
interface SarakCatalogGridProps {
    items: CatalogItem[];
    loading?: boolean;
    title: string;
    subtitle?: string;
    categories?: Record<string, string>;
    onSync?: () => void;
    renderCard?: (item: CatalogItem) => React__default.ReactNode;
    emptyMessage?: string;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}
/**
 * SarakCatalogGrid (Industrial Template v9.5)
 *
 * Template soberano para catálogos, grids de produtos ou modelos.
 * Centraliza lógica de busca e filtragem visual.
 */
declare const SarakCatalogGrid: React__default.FC<SarakCatalogGridProps>;

/**
 * Contratos do nó recursivo (RBAC/IAM e TreeView genérico).
 *
 * Extraídos de `RecursiveMatrixNode.tsx` na Onda 9 para manter o componente sob o
 * limite de 250 linhas (Clean Code). Tipado — Zero Any.
 */

interface MatrixTreeNode {
    id: string;
    name?: string;
    description?: string;
    /** Discriminador opcional para o mapeamento `manifest.types`. */
    type?: string;
    children?: MatrixTreeNode[];
    /** Carregamento assíncrono em andamento — renderiza o `lazyLoadingIcon`. */
    loading?: boolean;
}

interface MatrixNodeConfig<TNode = MatrixTreeNode> {
    /** Variante visual de renderização do nó */
    variant?: 'card' | 'row' | 'badge' | 'switch' | 'clean';
    /** Se exibe checkbox/toggle para ativar/desativar */
    hasToggle?: boolean;
    /** Se o nó é expansível/colapsável */
    hasExpand?: boolean;
    /** Se o nó deve iniciar expandido */
    defaultExpanded?: boolean;
    /** Ícone customizado (Lucide ou elemento) */
    icon?: React__default.ComponentType<Record<string, unknown>>;
    /** Renderizador totalmente customizado para controle total */
    renderCustom?: (node: TNode, level: number, isActive: boolean, isExpanded: boolean, onToggle: () => void, onToggleExpand: () => void) => React__default.ReactNode;
}
interface SarakMatrixManifest {
    /** Mapeamento por nível de profundidade (0 para raiz, 1 para filhos, 2 para netos, etc.) */
    levels?: Record<number, MatrixNodeConfig<MatrixTreeNode>>;
    /** Mapeamento dinâmico pelo atributo `node.type` */
    types?: Record<string, MatrixNodeConfig<MatrixTreeNode>>;
    /** Configurações fallback padrão */
    default?: MatrixNodeConfig<MatrixTreeNode>;
}
interface MatrixParentData {
    id: string;
    name?: string;
    description?: string;
    [key: string]: unknown;
}
interface SarakExpandableMatrixProps<TData extends MatrixParentData> {
    /** Itens principais (ex: Roles/Papéis) */
    data: TData[];
    /** Todos os sub-itens possíveis (ex: Todas as Permissões) */
    subItems: MatrixTreeNode[];
    /** Função para checar se um sub-item está ativo em um item pai */
    activeMapping: (parentId: string, subItemId: string) => boolean;
    /** Callback disparado ao clicar no toggle */
    onToggle: (parentId: string, subItemId: string) => void;
    /** Renderizador customizado para o cabeçalho de cada item pai */
    renderItemHeader?: (item: TData) => React__default.ReactNode;
    /** Manifesto opcional de mapeamento recursivo para layout IAM/RBAC avançado */
    manifest?: SarakMatrixManifest;
}
declare const SarakExpandableMatrix: <TData extends MatrixParentData>({ data, subItems, activeMapping, onToggle, renderItemHeader, manifest }: SarakExpandableMatrixProps<TData>) => react_jsx_runtime.JSX.Element;

interface ImageCardProps {
    src: string;
    alt?: string;
    title?: string;
    subtitle?: string;
    children?: React__default.ReactNode;
    className?: string;
    onClick?: () => void;
}
declare const ImageCard: React__default.FC<ImageCardProps>;

interface SarakPageTransitionProps {
    children: React__default.ReactNode;
    /** Usado como key pela AnimatePresence para saber quando a rota mudou */
    locationKey: string;
}
declare const SarakPageTransition: React__default.FC<SarakPageTransitionProps>;

interface SarakModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React__default.ReactNode;
    children?: React__default.ReactNode;
    footer?: React__default.ReactNode;
    /**
     * Sub-wizard multi-step (Spec 13, Regra 2): cada passo é renderizado isolado dentro
     * do overlay, com navegação "Voltar/Avançar" contida no rodapé. Tem precedência
     * sobre `children`. No último passo, "Avançar" é substituído por `onComplete`.
     */
    steps?: React__default.ReactNode[];
    /** Chamado ao avançar além do último passo (conclusão do wizard). */
    onComplete?: () => void;
    /** Se true, o clique no overlay (fundo) não fecha o modal */
    disableOverlayClick?: boolean;
    /** Se true, o botão de fechar não é renderizado */
    hideCloseButton?: boolean;
    /** Classe CSS customizada para o contêiner do modal */
    className?: string;
}
declare const SarakModal: React__default.FC<SarakModalProps>;

interface SarakDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    direction?: 'left' | 'right' | 'top' | 'bottom';
    children: React__default.ReactNode;
    size?: string | number;
    className?: string;
}
/**
 * Componente de Painel Lateral Deslizante (Drawer).
 * Renderiza um overlay e conteúdo deslizante baseado na direção.
 */
declare const SarakDrawer: React__default.FC<SarakDrawerProps>;

/**
 * SarakOverlayProvider + useOverlay (Spec 13 ↔ Spec 25)
 *
 * Host imperativo de overlays que o Dispatcher abre via `open_modal`/`open_drawer`.
 * Mantém um único overlay ativo por vez e o materializa no `SarakModal`/`SarakDrawer`.
 * O controller (`open`/`close`) casa estruturalmente com o `OverlayController` do
 * Dispatcher — sem import cruzado core↔components (evita ciclo).
 *
 * Conteúdo nesta onda: `title` + `message` (texto). Conteúdo rico como nó de manifesto
 * é refinamento posterior (Spec 30/33).
 */

interface SarakOverlayRequest {
    kind: 'modal' | 'drawer';
    title?: string;
    message?: string;
}
/** Casa estruturalmente com o `OverlayController` do Dispatcher (Spec 25), sem import cruzado. */
interface SarakOverlayController {
    open(request: SarakOverlayRequest): void;
    close(): void;
}
declare const SarakOverlayProvider: React__default.FC<{
    children: React__default.ReactNode;
}>;
/** Acessa o controller de overlays; no-op fora do Provider (degrada sem quebrar). */
declare const useOverlay: () => SarakOverlayController;

interface ModalLayoutContext {
    headerClass: string;
    footerClass: string;
    closeButtonClass: string;
}
/**
 * Hook Controlador Estrutural (Camada 6) - Modals
 */
declare const useModalLayoutStyles: (design: SarakThemePayload) => ModalLayoutContext;

interface SarakEmptyStateProps {
    type?: 'minimal' | 'abstract' | 'geometric';
}
declare const SarakEmptyState: React__default.FC<SarakEmptyStateProps>;

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'muted';
type BadgeSize = 'sm' | 'md' | 'lg';
interface SarakBadgeProps extends React__default.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    /** Se true, o badge terá bordas mais arredondadas (estilo pill) */
    pill?: boolean;
    /** Se true, o fundo será translúcido/suave em vez de sólido */
    soft?: boolean;
}
declare const SarakBadge: React__default.FC<SarakBadgeProps>;

/**
 * SarakSkeleton — placeholder de carregamento (Spec 13, Regra 3 + Spec 31, Regra 2)
 *
 * Assume FORMAS declaradas (`shape`): `text` (barras finas), `circle` (avatar) e `rect`
 * (bloco). Mantém o uso original como estado `loading` da Fonte de Dados (linhas-fantasma)
 * por padrão. Zero Hardcode: cores/raio via `[--sarak-*]`; pulso via `animate-pulse`.
 */

/** Forma do esqueleto. */
type SkeletonShape = 'text' | 'circle' | 'rect';
interface SarakSkeletonProps {
    /** Forma do placeholder (default: `text`). */
    shape?: SkeletonShape;
    /** Número de linhas-fantasma quando `shape="text"` (default: 3). */
    rows?: number;
    /** Altura de cada linha/bloco (default: `1rem`). */
    rowHeight?: string;
    /** Diâmetro quando `shape="circle"` (default: `2.5rem`). */
    size?: string;
    /** Largura quando `shape="rect"`/`circle` (default: `100%` / `size`). */
    width?: string;
}
declare const SarakSkeleton: React__default.FC<SarakSkeletonProps>;

/**
 * SarakDataEmpty — placeholder MÍNIMO de "sem dados" (puxado sob demanda)
 *
 * ⚠️ MÍNIMO: estado `empty` da Fonte de Dados (Spec 31, Regra 2). Mensagem neutra e
 * tokenizada — distinto do `SarakEmptyState` (peça de branding de viewport vazio).
 * A UX completa de Empty States chega na Spec 13.
 */

interface SarakDataEmptyProps {
    /** Mensagem exibida (default: "Nenhum dado encontrado."). */
    message?: string;
}
declare const SarakDataEmpty: React__default.FC<SarakDataEmptyProps>;

/**
 * SarakToast + SarakToastProvider (Spec 13 — Regra 1)
 *
 * Sistema de notificações em pilha, estável (sem conflito de z-index) e tokenizado.
 * As cores mapeiam o Status Schema (`--sarak-status-*-color`), sem hardcode. O
 * Provider expõe um controller imperativo via `useToast()` — é por aqui que o
 * Dispatcher (Spec 25) dispara a ação `trigger_toast`.
 *
 * Cada toast desmonta sozinho após `duration` ms (Plano de Testes: mount/unmount por
 * timeout). A pilha empilha com espaçamento e anima a entrada via transição CSS.
 *
 * Zero Any: o controller é tipado; a fronteira não usa `any`.
 */

/** Variantes semânticas, mapeadas 1:1 ao Status Schema. */
type ToastVariant = 'success' | 'error' | 'warning' | 'info';
/** Opções de um disparo de toast (interface estável consumida pelo Dispatcher). */
interface ToastOptions {
    /** Texto exibido. */
    message: string;
    /** Variante semântica (default: `info`). */
    variant?: ToastVariant;
    /** Duração até o auto-dismiss em ms (default: 3000). */
    duration?: number;
}
/** Controller público do sistema de toasts. */
interface ToastController {
    /** Empilha um toast; devolve seu id (para dismiss manual). */
    notify(options: ToastOptions): string;
    /** Remove um toast pelo id. */
    dismiss(id: string): void;
}
/**
 * Provider do sistema de toasts. Renderiza a pilha num portal no `body` (z-index alto,
 * estável) e gerencia o ciclo de auto-dismiss. Envolva a app (ou o Renderer) com ele.
 */
declare const SarakToastProvider: React__default.FC<{
    children: React__default.ReactNode;
}>;
/**
 * Acessa o controller de toasts. Fora de um `SarakToastProvider`, devolve um
 * controller no-op (loga um aviso) para que o Dispatcher degrade sem quebrar a árvore.
 */
declare const useToast: () => ToastController;

interface SarakTabItem {
    id: string;
    label: React__default.ReactNode;
    icon?: React__default.ReactNode;
    disabled?: boolean;
}
interface SarakTabsProps {
    tabs: SarakTabItem[];
    activeTab: string;
    onChange: (tabId: string) => void;
    /** Estilo de exibição das abas */
    variant?: 'pills' | 'underlined' | 'enclosed';
    /** Preencher a largura toda? */
    fullWidth?: boolean;
    className?: string;
    listClassName?: string;
}
declare const SarakTabs: React__default.FC<SarakTabsProps>;

/**
 * SarakTooltip (Spec 13 — Regra 4)
 *
 * Balão flutuante que NÃO é cortado pelo `overflow:hidden` de containers ancestrais:
 * o conteúdo é renderizado num portal no `body` e posicionado em `position: fixed` a
 * partir do retângulo do gatilho. Inclui edge detection — se a posição preferida sair
 * da viewport, é espelhada (flip) e/ou deslocada para dentro.
 *
 * Zero Hardcode nas cores (tokens `--theme-*`).
 */

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
interface SarakTooltipProps {
    children: React__default.ReactNode;
    content: React__default.ReactNode;
    position?: TooltipPosition;
    delay?: number;
    className?: string;
    /** Se true, desativa o tooltip */
    disabled?: boolean;
}
declare const SarakTooltip: React__default.FC<SarakTooltipProps>;

/**
 * SarakContextMenu (Spec 13 — Regra 5)
 *
 * Menu que abre exatamente na coordenada X,Y do clique (tipicamente o botão direito) e
 * desaparece instantaneamente ao clicar em qualquer outro lugar (ou ESC). Renderiza num
 * portal no `body` para escapar de `overflow:hidden` de containers ancestrais.
 *
 * Edge detection: se a coordenada jogaria o menu para fora da viewport, ele é deslocado
 * para dentro. Zero Hardcode nas cores (tokens `--sx-*`/`--theme-*`).
 */

interface ContextMenuPosition {
    x: number;
    y: number;
}
interface SarakContextMenuProps {
    /** Controla a visibilidade. */
    isOpen: boolean;
    /** Coordenada (viewport) onde abrir — normalmente `{ x: e.clientX, y: e.clientY }`. */
    position: ContextMenuPosition;
    /** Fecha o menu (clique fora / ESC / escolha de item). */
    onClose: () => void;
    /** Itens do menu (ex.: botões). */
    children: React__default.ReactNode;
    className?: string;
}
declare const SarakContextMenu: React__default.FC<SarakContextMenuProps>;

/**
 * SarakDataGrid — BASE de virtualização (Spec 12, recorte da Onda 1)
 *
 * ⚠️ ESCOPO REDUZIDO: esta é apenas a *janela virtual* (windowing) que o motor de
 * repetição (Spec 23, Regra 4) delega para listas grandes (> limiar). As demais
 * Regras da Spec 12 — pinned/resize/reorder de colunas, Kanban, Charts/Sparklines,
 * Tree Views — ficam para a implementação COMPLETA da Spec 12 (onda posterior).
 *
 * Headless por design: não impõe markup de tabela nem cores próprias. Renderiza só
 * as linhas visíveis (60 FPS / 10k+ itens) e delega o conteúdo de cada linha ao
 * `renderRow`. Zero Hardcode: dimensões/efeitos via tokens `[--sarak-*]`.
 */

interface SarakDataGridProps {
    /** Quantidade total de linhas (a fonte real vive fora; aqui só virtualizamos). */
    count: number;
    /** Render de UMA linha pelo índice — chamado apenas para linhas visíveis. */
    renderRow: (index: number) => React__default.ReactNode;
    /** Altura estimada de cada linha em px (default: 44). */
    estimateSize?: number;
    /** Linhas extra montadas fora da viewport para scroll suave (default: 8). */
    overscan?: number;
    /** Altura da janela de scroll (default: 100% do contêiner pai). */
    height?: number | string;
    /** Classe utilitária extra do contêiner. */
    className?: string;
}
/**
 * Lista virtualizada vertical. Só as linhas dentro da viewport (+ overscan) são
 * montadas no DOM, mantendo a contagem de nós baixa independentemente de `count`.
 */
declare const SarakDataGridImpl: React__default.FC<SarakDataGridProps>;

/**
 * SarakDataGrid — barrel + carregamento preguiçoso (Spec 12, base da Onda 1).
 *
 * `SarakDataGrid` é um `React.lazy`: a dependência de virtualização
 * (`@tanstack/react-virtual`) só é baixada quando um grid é realmente renderizado
 * — telas sem listas grandes pagam custo zero. Sempre renderize sob `<Suspense>`.
 *
 * `SarakDataGridImpl`/`SarakDataGridProps` são exportados para teste direto (sem
 * a fronteira de Suspense).
 */
declare const SarakDataGrid: React$1.LazyExoticComponent<React$1.FC<SarakDataGridProps>>;

/**
 * Modelo de colunas do SarakDataTable (Spec 12, Regra 2 · Onda 9).
 *
 * Lógica pura (sem React/DOM) de ordenação, largura e deslocamento das colunas
 * congeladas (pinned). Mantém o componente visual enxuto e testável de forma isolada.
 */

interface SarakColumn<T> {
    /** Identidade estável da coluna (chave de largura/ordem/reorder). */
    id: string;
    /** Conteúdo do cabeçalho. */
    header: React__default.ReactNode;
    /** Largura inicial em px (default: `DEFAULT_COLUMN_WIDTH`). */
    width?: number;
    /** Largura mínima ao redimensionar em px (default: `MIN_COLUMN_WIDTH`). */
    minWidth?: number;
    /** Congelamento lateral; ausente = coluna rola normalmente. */
    pinned?: 'left' | 'right';
    /** Render da célula; ausente = `String(row[id])`. */
    render?: (row: T, rowIndex: number) => React__default.ReactNode;
}
declare const DEFAULT_COLUMN_WIDTH = 160;
declare const MIN_COLUMN_WIDTH = 60;
/** Resolve a largura efetiva da coluna a partir do estado controlado + default. */
declare const widthOf: <T>(column: SarakColumn<T>, widths: Record<string, number>) => number;
/** Reordena `order` movendo `fromId` para a posição de `toId` (imutável). */
declare const reorder: (order: string[], fromId: string, toId: string) => string[];
interface PinnedOffsets {
    /** Deslocamento `left` acumulado por id de coluna congelada à esquerda. */
    left: Record<string, number>;
    /** Deslocamento `right` acumulado por id de coluna congelada à direita. */
    right: Record<string, number>;
    /** Soma das larguras de todas as colunas ordenadas. */
    total: number;
}
/**
 * Calcula os deslocamentos sticky das colunas congeladas na ordem atual:
 * left-pinned acumulam da esquerda; right-pinned acumulam da direita (ré).
 */
declare const computeOffsets: <T>(ordered: Array<SarakColumn<T>>, widths: Record<string, number>) => PinnedOffsets;

interface SarakDataTableProps<T = Record<string, unknown>> {
    /** Definição declarativa das colunas (ordem inicial = ordem do array). */
    columns: Array<SarakColumn<T>>;
    /** Linhas de dados; a fonte real (fetch) vive fora — aqui só virtualizamos. */
    rows: T[];
    /** Altura de cada linha em px (default: 44). */
    rowHeight?: number;
    /** Altura do cabeçalho em px (default: 44). */
    headerHeight?: number;
    /** Altura da janela de scroll (default: 100% do contêiner pai). */
    height?: number | string;
    /** Linhas extra montadas fora da viewport (default: 8). */
    overscan?: number;
    /** Chave estável da linha (default: índice). */
    getRowKey?: (row: T, index: number) => React__default.Key;
    /** Notifica nova largura ao soltar o handle de resize. */
    onColumnResize?: (columnId: string, width: number) => void;
    /** Notifica reordenação (origem → destino) ao soltar o drag do cabeçalho. */
    onColumnReorder?: (fromId: string, toId: string) => void;
    /** L2 (Spec 40.2): no smartphone colapsa para cards empilhados. Default `true`. */
    responsive?: boolean;
    className?: string;
}
declare function SarakDataTableImpl<T>({ columns, rows, rowHeight, headerHeight, height, overscan, getRowKey, onColumnResize, onColumnReorder, responsive, className, }: SarakDataTableProps<T>): react_jsx_runtime.JSX.Element;

/**
 * SarakDataTable — barrel + carregamento preguiçoso (Spec 12, Regra 2 · Onda 9).
 *
 * Componente pesado: a virtualização (`@tanstack/react-virtual`) só é baixada quando
 * uma tabela colunar é realmente renderizada. Sempre renderize sob `<Suspense>`.
 * `SarakDataTableImpl`/tipos são exportados para teste direto (sem a fronteira de Suspense).
 */
declare const SarakDataTable: React$1.LazyExoticComponent<typeof SarakDataTableImpl>;

/**
 * SarakSparkline — micro-gráfico sem eixos (Spec 12, Regra 4 · Onda 9)
 *
 * Visualização minimalista (linha/área/barra) que cabe no espaço confinado de um
 * `<SarakCard>` (Critério de Aceite 5). In-house em SVG puro: **zero dependência
 * nova** (as Ondas 7–9 não adicionam libs). Zero Hardcode: a cor da série herda dos
 * tokens globais — `--sarak-chart-primary` (Spec 12 / schema `data.ts`) com cascata
 * para `var(--sarak-primary-color,#3b82f6)`. O traço usa `vector-effect: non-scaling-stroke`
 * para permanecer nítido mesmo quando o SVG é esticado na largura do contêiner.
 */

type SparklineVariant = 'line' | 'area' | 'bar';
interface SarakSparklineProps {
    /** Série de valores. Vazia ou com 1 ponto degrada para um traço plano/único. */
    data: number[];
    /** Forma do micro-gráfico (default: 'line'). */
    variant?: SparklineVariant;
    /** Altura em px do desenho (default: 40). A largura preenche o contêiner. */
    height?: number;
    /** Espessura do traço (line/area) em px (default: 2). */
    strokeWidth?: number;
    /** Opacidade do preenchimento da área (default: 0.15). */
    fillOpacity?: number;
    /** Descrição acessível do gráfico (vira `<title>` + `aria-label`). */
    label?: string;
    className?: string;
    style?: React__default.CSSProperties;
}
declare const SarakSparkline: React__default.FC<SarakSparklineProps>;

/**
 * SarakTreeView — árvore hierárquica genérica (Spec 12, Regra 5 · Onda 9)
 *
 * Wrapper fino que **reusa** o motor de recursão `RecursiveMatrixNode` (o mesmo que
 * serve a matriz RBAC) — sem duplicar a recursão. Suporta profundidade infinita e o
 * estado `lazyLoadingIcon` ativável via JSON (nó com `loading: true`), além de seleção
 * opcional por nó e callback de expansão para carregamento sob demanda. Zero dependência
 * nova; Zero Hardcode (estilos herdados dos átomos via tokens `[--sarak-*]`).
 */

interface SarakTreeViewProps {
    /** Floresta de nós; cada nó pode ter `children` (N níveis) e `loading`. */
    data: MatrixTreeNode[];
    /** Manifesto de layout por nível/tipo (default: variante limpa por profundidade). */
    manifest?: SarakMatrixManifest;
    /** Indicador exibido sob nós com `loading: true` (default: spinner tokenizado). */
    lazyLoadingIcon?: React__default.ReactNode;
    /** Disparado ao expandir/colapsar um nó — ponto de gancho para fetch assíncrono. */
    onExpand?: (node: MatrixTreeNode, expanded: boolean) => void;
    /** IDs selecionados (habilita o toggle por nó quando combinado com `onSelect`). */
    selectedIds?: string[];
    /** Disparado ao alternar a seleção de um nó. */
    onSelect?: (nodeId: string) => void;
    className?: string;
}
declare const SarakTreeView: React__default.FC<SarakTreeViewProps>;

/**
 * Modelo de dados do SarakKanban (Spec 12, Regra 3 · Onda 10).
 *
 * Lógica pura (sem React/DOM) de movimentação de cards entre colunas — testável de forma
 * isolada e reusada pelo componente no `drop`.
 */
interface KanbanCard {
    id: string;
    title?: string;
    description?: string;
}
interface KanbanColumn<C extends KanbanCard = KanbanCard> {
    id: string;
    title: string;
    cards: C[];
}
interface CardMove {
    cardId: string;
    fromColumn: string;
    toColumn: string;
    /** Índice de destino dentro da coluna alvo. */
    toIndex: number;
}
/**
 * Move `cardId` de `fromColumn` para `toColumn` na posição `toIndex` (imutável).
 * Devolve as colunas inalteradas se o card/coluna não existirem.
 */
declare const moveCard: <C extends KanbanCard>(columns: Array<KanbanColumn<C>>, cardId: string, fromColumn: string, toColumn: string, toIndex: number) => Array<KanbanColumn<C>>;

interface SarakKanbanProps<C extends KanbanCard = KanbanCard> {
    /** Colunas e seus cards (a ordem do array é a ordem visual). */
    columns: Array<KanbanColumn<C>>;
    /** Disparado ao soltar um card numa coluna (origem → destino). */
    onCardMove?: (move: CardMove) => void;
    /** Render customizado do card (default: título + descrição). */
    renderCard?: (card: C, columnId: string) => React__default.ReactNode;
    className?: string;
}
declare function SarakKanbanImpl<C extends KanbanCard>({ columns, onCardMove, renderCard, className, }: SarakKanbanProps<C>): react_jsx_runtime.JSX.Element;

/**
 * SarakMarkdownRenderer (Spec 15, Regra 1) — implementação pesada (lazy).
 *
 * Ingere Markdown cru e o renderiza como elementos estilizados pelos tokens Sarak
 * (`[--sarak-*]`), com highlight de código atrelado ao modo (dark/light) do tema.
 * Segurança (Spec 40): NÃO usa `dangerouslySetInnerHTML` nem `rehype-raw` — HTML cru
 * no Markdown é tratado como texto literal (não executado); URLs passam por uma
 * allowlist de esquemas seguros (`javascript:`/`data:` viram href vazio).
 *
 * A dependência pesada (`react-markdown` + `react-syntax-highlighter`) vive AQUI; o
 * `index.ts` exporta isto via `React.lazy`, mantendo-a fora do entry de quem não a usa.
 */

interface SarakMarkdownRendererProps {
    /** String de Markdown cru a renderizar. */
    content: string;
    className?: string;
}

declare const SarakMarkdownRenderer: React$1.LazyExoticComponent<React$1.FC<SarakMarkdownRendererProps>>;

/**
 * SarakLightbox (Spec 15, Regra 3) — galeria/carrossel em overlay escuro.
 *
 * Reaproveita o modelo de foco transversal (`useFocusTrap` da Spec 41): trap + ESC +
 * restauração do foco ao fechar. Navega entre mídias por botões prev/next e pelas
 * setas do teclado (←/→), com contador de posição. Renderiza via portal no topo do DOM.
 * Leve (sem dependência nova) — não precisa de `React.lazy`.
 */

interface LightboxImage {
    src: string;
    alt?: string;
}
interface SarakLightboxProps {
    /** Mídias da galeria, na ordem de exibição. */
    images: LightboxImage[];
    /** Controla a visibilidade do overlay. */
    isOpen: boolean;
    /** Índice inicial ao abrir (default: 0). */
    initialIndex?: number;
    /** Fecha o overlay (ESC, clique no ✕ ou no fundo). */
    onClose: () => void;
    /** Notifica a troca de mídia (avançar/retroceder). */
    onIndexChange?: (index: number) => void;
}
declare const SarakLightbox: React__default.FC<SarakLightboxProps>;

/**
 * usePdfDocument (Spec 15, Regra 2 · Onda 10) — ciclo de vida do documento PDF.
 *
 * Extraído do `SarakPDFViewerImpl` para manter o componente enxuto (limite de
 * estado/efeitos do Clean Code). Configura o worker (fora da main thread), carrega o
 * documento via `pdfjs-dist` e cancela/destrói a tarefa na troca da fonte. Zero Any.
 */

/** Fonte do documento: URL, bytes ou ArrayBuffer. */
type PdfSource = string | Uint8Array | ArrayBuffer;

/**
 * SarakPDFViewer (Spec 15, Regra 2) — implementação pesada (lazy).
 *
 * Desenha as páginas do PDF em `<canvas>` via `pdfjs-dist` (peer), sem depender do
 * visualizador nativo bloqueado do navegador. O parse roda num Web Worker (fora da main
 * thread) — `GlobalWorkerOptions.workerSrc` é configurável pela prop `workerSrc`. A barra
 * de controles (zoom/página/download) é 100% estilizada por tokens (`[--sarak-*]`).
 *
 * A dependência pesada (`pdfjs-dist`) vive AQUI; o `index.ts` exporta isto via
 * `React.lazy`, mantendo-a fora do entry de quem não a usa.
 */

interface SarakPDFViewerProps {
    /** Origem do documento: URL, bytes ou ArrayBuffer. */
    src: PdfSource;
    /** Página inicial (1-based, default: 1). */
    initialPage?: number;
    /** Escala inicial de zoom (default: 1.2). */
    zoom?: number;
    /** URL do worker do pdf.js; default resolvido do pacote via `import.meta.url`. */
    workerSrc?: string;
    /** Disparado ao clicar em Download (recebe a `src` quando string). */
    onDownload?: (src: PdfSource) => void;
    className?: string;
}

declare const SarakPDFViewer: React$1.LazyExoticComponent<React$1.FC<SarakPDFViewerProps>>;

/** Item de dado de série: dataset externo, lido por chave dinâmica. */
type ChartDataItem = Record<string, unknown>;

interface SarakChartEngineProps {
    type: 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'gauge' | 'scatter' | 'heatmap' | 'funnel' | 'treemap' | 'candlestick' | 'sunburst' | 'histogram' | 'boxplot';
    data: ChartDataItem[];
    config?: {
        xAxisKey?: string;
        dataKey?: string;
        engine?: 'recharts' | 'echarts';
        title?: string;
        showGradients?: boolean;
        showAnimation?: boolean;
        thickness?: number;
    };
}

/**
 * `SarakChartEngine` (Spec 41 §2.4) — fronteira lazy.
 *
 * Mesma postura do `SarakMarkdownRenderer`/`SarakPDFViewer`: `React.lazy` mantém
 * `echarts` + `zrender` + `recharts` (peers pesados) FORA do grafo estático — só
 * carregam quando um gráfico é de fato renderizado. O barril público (`src/index.ts`)
 * exportava o `default` do módulo de implementação, o que anulava o code-splitting
 * que `components/engines/index.ts` já implementava e colocava ~2,7 MB de biblioteca
 * de gráfico no chunk principal de TODO consumidor, mesmo o que nunca desenha um gráfico.
 *
 * O `Suspense` é interno (via `LazyEngineWrapper`) para preservar o contrato público:
 * quem usa `<SarakChartEngine />` continua não precisando declarar `Suspense`.
 */

declare const SarakChartEngine: React__default.FC<SarakChartEngineProps>;

/**
 * Sarak Registry (v5.5)
 *
 * Local manager for registered modules to avoid dependency on lib-shared.
 */
/**
 * Props que um componente registrado pode receber (heterogêneo, sem `any`).
 * Espelha o padrão canônico de `ManifestComponentProps` (Spec 22).
 */
interface SarakComponentProps {
    children?: React.ReactNode;
    [prop: string]: unknown;
}
/** Tipo uniforme sob o qual qualquer componente é guardado no registro. */
type SarakComponent = React.ComponentType<SarakComponentProps>;
interface SarakModule {
    id: string;
    label: string;
    icon?: string;
    category?: string;
    component?: SarakComponent;
    components?: Record<string, SarakComponent>;
    priority?: number;
    description?: string;
    isLocal?: boolean;
}
/**
 * Subscribes to registry changes (v9.0 Passive Discovery).
 */
declare const subscribeToRegistry: (listener: () => void) => () => boolean;
/**
 * Registers a local component linked to a system ID (v6.5).
 */
declare const registerLocalComponent: <P extends object>(id: string, component: React.ComponentType<P>) => void;
/**
 * Returns the component associated with an ID, if it exists.
 */
declare const getLocalComponent: (id: string) => SarakComponent | undefined;
/**
 * Lista os IDs de componentes locais registrados. Usado pelo gate de paridade
 * (RegistryParity) para cobrar equivalente manifestável de cada id legado da lib.
 */
declare const getLocalComponentIds: () => string[];
/**
 * Registers or updates a Sarak module in the system (v9.1 - Merging Support).
 */
declare const registerSarakModule: (manifest: SarakModule) => void;
/**
 * Returns the list of registered modules with resolved components (v9.1).
 */
declare const getRegisteredModules: () => SarakModule[];
/**
 * Retrieves a specific module by ID.
 */
declare const getSarakModule: (id: string) => SarakModule | undefined;

/**
 * Sarak Discovery Core Types (v11.0)
 */

/** Descritor de filtro de um contrato (espelha estruturalmente o FilterConfig do CardGrid; core fica sem dependência de `components/`). */
interface FilterDescriptor {
    id: string;
    label: string;
    type: 'TABS' | 'SELECT';
    field: string;
    options?: {
        label: string;
        value: string;
    }[];
    dynamic?: boolean;
}
type VisualContractType = 'TABLE' | 'STATS' | 'CARD_GRID' | 'MANAGEMENT_GRID' | 'FORM' | 'CHAT_INTERFACE' | 'CHART' | 'FLOW_DIAGRAM' | 'ELITE_CHART' | 'ADVANCED_CHAT' | 'SECURITY_ORCHESTRATOR' | 'CATALOG_GRID' | 'CUSTOM' | 'AUTH_FLOW' | 'EXPANDABLE_MATRIX';
interface VisualContract {
    id: string;
    type: VisualContractType;
    label: string;
    endpoint: string;
    tab?: string;
    mapping?: Record<string, string>;
    filters?: FilterDescriptor[];
    actions?: Array<{
        label: string;
        endpoint: string;
        method: 'POST' | 'PATCH' | 'DELETE';
        icon?: string;
    }>;
    groupBy?: string;
    ghostGroups?: string[];
    headerActions?: {
        label: string;
        action: string;
    }[];
    groupActions?: {
        label: string;
        icon: string;
        action: string;
    }[];
    formMapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
    component?: string;
    config?: Record<string, unknown>;
}
interface ModuleManifest {
    id: string;
    label: string;
    icon: string;
    category: string;
    version?: string;
    priority: number;
    endpoints?: Record<string, string>;
    visualContracts?: VisualContract[];
}
interface DiscoveredModule extends ModuleManifest {
    status: 'online' | 'offline';
    baseUrl?: string;
    component?: SarakComponent;
    components?: Record<string, SarakComponent>;
    error?: string;
}

interface DynamicRendererProps {
    contracts: VisualContract[];
    module?: DiscoveredModule;
}
/**
 * DynamicRenderer (v6.0-6.8 Smart Router)
 *
 * The UI-Core rendering engine. It receives a list of visual contracts
 * and builds the interface dynamically without prior knowledge
 * of the module's specifics.
 */
declare const DynamicRenderer: React__default.FC<DynamicRendererProps>;

/**
 * Hook de Descoberta Passiva (v9.0 Industrial)
 *
 * Este hook não realiza mais escaneamento proativo (Active Polling).
 * Ele apenas consome e formata os módulos que foram injetados ou registrados
 * localmente no SarakUIProvider.
 */
declare const useModuleDiscovery: (isEnabled?: boolean) => {
    modules: DiscoveredModule[];
    isLoading: boolean;
    lastScan: Date;
    refresh: () => void;
};

/**
 * Interface that defines the return of the routing hook
 */
interface SarakRouterState {
    currentPath: string;
    segments: string[];
    navigate: (path: string, replace?: boolean) => void;
    getParam: (index: number) => string | undefined;
}
/**
 * Hook for native routing based on the browser's History API.
 * Designed to replace memory-based activeModuleId state and allow deep linking.
 */
declare function useSarakRouter(basePath?: string): SarakRouterState;

export { type Accept, type BadgeSize, type BadgeVariant, type BreadcrumbItem, type CardMove, type ContextMenuPosition, CustomizationPanel, DEFAULT_COLUMN_WIDTH, DESIGN_MANIFEST, type DatePickerValue, DesignScope, DeviceProvider, type DeviceType, type DiscoveredModule, DynamicRenderer, ExpandableCard, type ExpandableCardProps, type FileRejection, type FilterDescriptor, FilterSelect, type FilterSelectProps, GLOBAL_THEMES, HelpButton, ICONE_DESCONHECIDO, ICON_NAMES, type IconFamily, IconMap, type IconName, type IconTriple, ImageCard, type ImageCardProps, type KanbanCard, type KanbanColumn, type LanguageOption, LanguageSelector, type LightboxImage, MIN_COLUMN_WIDTH, type MatrixNodeConfig, type MatrixParentData, type MatrixTreeNode, type ModalLayoutContext, type ModuleConfig, type ModuleManifest, ModuleSelector, type MultiSelectOption, type NavigationItem, type PaginationToken, type RangeValue, type ResponsiveDevice, type ResponsiveValue, SARAK_MODE_ATTRIBUTE, SARAK_REFERENCE_THEMES, SARAK_SCOPE_CLASS, SarakAccordion, type SarakAccordionProps, SarakActionCard, type SarakActionCardProps, SarakAnalyticalPage, type SarakAnalyticalPageProps, SarakAppChrome, type SarakAppChromeProps, SarakAuthScreen, type SarakAuthScreenEvent, type SarakAuthScreenProps, SarakBadge, type SarakBadgeProps, SarakBreadcrumbs, type SarakBreadcrumbsProps, SarakButton, type SarakButtonProps, SarakCardGrid, type SarakCardGridProps, SarakCatalogGrid, type SarakCatalogGridProps, SarakChart, SarakChartEngine, type SarakChartEngineProps, type SarakChartProps, SarakChat, type SarakChatProps, type SarakColumn, type SarakComponent, type SarakComponentProps, SarakContextMenu, type SarakContextMenuProps, SarakDataEmpty, type SarakDataEmptyProps, SarakDataGrid, SarakDataGridImpl, type SarakDataGridProps, SarakDataTable, SarakDataTableImpl, type SarakDataTableProps, SarakDatePicker, type SarakDatePickerProps, SarakDrawer, type SarakDrawerProps, SarakEmptyState, type SarakEmptyStateProps, SarakExpandableMatrix, type SarakExpandableMatrixProps, SarakFlex, type SarakFlexProps, SarakForm, SarakFormGroup, type SarakFormGroupProps, type SarakFormProps, SarakGrid, type SarakGridProps, SarakHidden, type SarakHiddenProps, SarakIcon, SarakIconButton, type SarakIconButtonProps, type SarakIconProps, SarakInput, type SarakInputProps, SarakKanbanImpl as SarakKanban, type SarakKanbanProps, SarakLightbox, type SarakLightboxProps, SarakLink, type SarakLinkProps, SarakManagementGrid, type SarakManagementGridProps, SarakMarkdownRenderer, type SarakMarkdownRendererProps, type SarakMatrixManifest, SarakModal, type SarakModalProps, type SarakModule, SarakMultiSelect, type SarakMultiSelectProps, type SarakNavItem, type SarakOverlayController, SarakOverlayProvider, type SarakOverlayRequest, SarakPDFViewer, type SarakPDFViewerProps, SarakPageTransition, type SarakPageTransitionProps, SarakPagination, type SarakPaginationProps, SarakRangeSlider, type SarakRangeSliderProps, SarakRichText, type SarakRichTextProps, type SarakRouterState, SarakSearch, SarakSearchCard, type SarakSearchCardProps, type SarakSearchProps, SarakSecurityOrchestrator, type SarakSecurityOrchestratorProps, SarakSelect, type SarakSelectProps, SarakShell, SarakShellNav, type SarakShellNavProps, SarakSkeleton, type SarakSkeletonProps, SarakSlider, type SarakSliderProps, SarakSparkline, type SarakSparklineProps, SarakSplitPane, type SarakSplitPaneProps, SarakSpotlight, type SarakSpotlightProps, SarakStats, type SarakStatsProps, SarakStepper, type SarakStepperProps, SarakSwitch, type SarakSwitchProps, type SarakTabItem, SarakTable, type SarakTableProps, SarakTabs, type SarakTabsProps, SarakTextarea, type SarakTextareaProps, SarakTimePicker, type SarakTimePickerProps, SarakTitleCard, type SarakTitleCardProps, SarakToastProvider, SarakTooltip, type SarakTooltipProps, SarakTreeView, type SarakTreeViewProps, SarakTypography, type SarakTypographyColor, type SarakTypographyProps, type SarakTypographyVariant, type SarakUIMode, SarakUIProvider, SarakUploader, type SarakUploaderProps, type ShellNavItem, type SkeletonShape, SocialButton, type SocialButtonProps, type SparklineVariant, type StepConfig, type StepperOrientation, THEME_AXES, THEME_PRESET_IDS, type ThemePreset, type ThemePresetId, ThemeToggle, type ToastController, type ToastOptions, type ToastVariant, type TooltipPosition, UserMenu, type UserPayload, type VisualContract, type VisualContractType, buildPaginationRange, computeOffsets, deviceForWidth, findMissingThemeAxes, getAllDesignTokens, getDefaultDesignState, getLocalComponent, getLocalComponentIds, getRegisteredModules, getSarakModule, getThemePreset, isResponsiveValue, isSafeLinkHref, moveCard, registerLocalComponent, registerSarakModule, reorder, resolveResponsiveValue, sanitizeRichText, subscribeToRegistry, useDesignDraft, useModalLayoutStyles, useModuleDiscovery, useOverlay, useSarakDevice, useSarakRouter, useSarakUI, useToast, warnOnIncompleteTheme, widthOf };
