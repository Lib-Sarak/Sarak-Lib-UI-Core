/**
 * Porta de Persistência de UI (Spec 19). A lib declara APENAS esta interface —
 * quem/onde os dados vivem é decisão do consumidor. `pg`/`sqlite` (pasta
 * `adapters/`) são implementações de REFERÊNCIA; Supabase/Firebase/AWS/etc.
 * são exemplos documentados (`docs/examples/`), nunca dependência da lib.
 */
export interface UIStorageScope {
    system: string;
    userId: string | null;
}

export interface UITheme {
    id: string;
    name: string;
    description: string | null;
    system: string;
    ownerId: string | null;
    isPublic: boolean;
    isActive: boolean;
    design: Record<string, unknown>;
}

export interface UIThemeCreateInput {
    name: string;
    design: Record<string, unknown>;
    isActive: boolean;
}

export interface UIThemeUpdateInput {
    name?: string;
    design?: Record<string, unknown>;
    isActive?: boolean;
}

export interface UIBranding {
    companyName: string;
    loginName: string;
    tabName: string;
    logoBase64: string | null;
}

export interface UIStorageAdapter {
    /** Tema ativo do escopo; cai para o ativo global (`userId: null`) se o do usuário não existir. */
    getActiveTheme(scope: UIStorageScope): Promise<UITheme | null>;
    /** Cria (se não houver tema ativo no escopo) ou atualiza o design do tema ativo. */
    saveActiveDesign(scope: UIStorageScope, design: Record<string, unknown>): Promise<UITheme>;
    createTheme(scope: UIStorageScope, input: UIThemeCreateInput): Promise<UITheme>;
    /** `null` se `themeId` não existir. */
    updateTheme(scope: UIStorageScope, themeId: string, input: UIThemeUpdateInput): Promise<UITheme | null>;
    /** Ativa `themeId` e desativa os demais temas do escopo; `null` se não existir. */
    activateTheme(scope: UIStorageScope, themeId: string): Promise<UITheme | null>;
    getBranding(scope: UIStorageScope): Promise<UIBranding | null>;
    saveBranding(scope: UIStorageScope, branding: Record<string, unknown>): Promise<UIBranding>;
}
