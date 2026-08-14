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
    /** Rótulo exibido nas listas de tema. Os embarcados já o têm via `ThemePreset`;
     *  um tema salvo em runtime (ADR-011) precisa dele para não cair no fallback. */
    name?: string;
    design?: Record<string, unknown>;
    contraparte?: Partial<SarakDesignState>; // Bloco p/ o modo OPOSTO ao nativo (plan-26) — opcional no tipo (R33)
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
        /** Estratégia de persistência (ADR-009 §2.2). Default `'hybrid'` = localStorage + onSave/onLoad; `'local'` ignora as duas portas; `'remote'` para de gravar localStorage e SUBSTITUI pelo que `onLoad` resolver, degradando para `'local'` com aviso único sem porta configurada. */
        strategy?: 'local' | 'remote' | 'hybrid';
        storageKey?: string;
        /** Escopa a chave por tenant (ADR-009 §2.1): vira `${storageKey}::tenant:${tenantId}`. Opaco, não validado. */
        tenantId?: string;
        /** `activeThemeId` (2º parâmetro, ADITIVO — plan-42): o id do tema EFETIVAMENTE
         *  no ar (`resolvedThemeId`) no instante deste save. Vem preenchido sempre que a
         *  sessão resolveu um tema (seed ou aplicado em runtime); vem `undefined` só
         *  quando não há tema resolvido ainda. NÃO faz parte de `design` — é identidade,
         *  não token; o payload continua sendo o mesmo objeto que o export de tema
         *  produz. Quem já implementa `onSave(design)` continua funcionando: em
         *  JavaScript, argumento extra não declarado é ignorado. */
        onSave?: (design: SarakThemePayload, activeThemeId?: string) => Promise<void> | void;
        onLoad?: () => Promise<SarakThemePayload> | SarakThemePayload;
        /** Segura os filhos até `onLoad` resolver — troca flash por tela vazia (ver "o primeiro paint" em `docs/persistencia-de-tema.md`). Default `false`. */
        strictBackendSync?: boolean;
        /** Sincroniza o tema entre abas/apps que compartilham a `storageKey`. Escuta `storage` e reaplica o design (validado) quando outra aba grava a mesma chave. Default `true`. */
        crossTabSync?: boolean;
    };
    theme?: {
        defaultTheme?: string;
        defaultModuleId?: string;
        extraTokens?: Record<string, unknown>;
        /**
         * Porta ÚNICA de escrita para "salvar tema em runtime" (ADR-011, substitui as
         * três portas do ADR-010): chamada por `sarak.saveTheme` DEPOIS de o tema já
         * validado (`validateDesign`) entrar na sessão (`allThemes`). Recebe o
         * `ThemeEntry` completo (`{ id, name, design }`); GUARDAR — arquivo, tabela,
         * `localStorage`, o que for — e DEVOLVER no próximo boot via `customThemes` é
         * inteiramente do consumidor. Não existe porta de leitura nem de apagar: a
         * leitura já é a prop `customThemes`, e apagar é decisão de quem guarda.
         */
        onSave?: (theme: ThemeEntry) => Promise<void> | void;
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
    /** Salva um tema em runtime (ADR-011): valida (`validateDesign`), funde no
     *  estado de SESSÃO — aparece em `allThemes` na mesma sessão, substituindo
     *  entrada de mesmo `id` — e entrega a `options.theme.onSave`, se configurado.
     *  Sem a porta, o tema entra na sessão mas não sobrevive a um reload. */
    saveTheme: (theme: ThemeEntry) => Promise<void>;
    activeThemeId?: string; // Espelho CRU do prop do Provider — só setado no modo CONTROLADO (09-temas-e-presets §4.3)
    resolvedThemeId?: string; // O tema EFETIVAMENTE no ar (plan-27) — usar este p/ achar a contraparte, nunca activeThemeId cru
    setResolvedThemeId?: (id: string | undefined) => void; // Quem aplica um preset novo anuncia o id aqui (plan-27)
    token?: string | null; // Adicionado para expor o token aos componentes filhos (Catálogo, Temas, etc)
    branding?: SarakBrandingState;
    updateBranding?: (partial: Partial<SarakBrandingState>) => Promise<void>;
    onMediaUpload?: (file: File) => Promise<string>;
}

// `SarakUIProviderProps` mora em `./providerProps.ts` — só para manter este
// arquivo abaixo do limite de linhas do auditor de Clean Code (250).
export type { SarakUIProviderProps } from './providerProps';
