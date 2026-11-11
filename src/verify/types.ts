/**
 * Tipos do kit de verificação de uso — o que o importador liga no lint ou no comando
 * `sarak-ui verify`. Este módulo não importa o barril da lib nem o `eslint`: o kit é uma
 * entrada de pacote separada e não pode arrastar nenhum dos dois.
 */

export type Severity = 'error' | 'warn';

/** Um achado, igual nas duas portas: onde, qual regra e o que fazer. */
export interface Finding {
    ruleId: string;
    severity: Severity;
    file: string;
    line: number;
    message: string;
}

/** Entrada `verification` do `sarak-ui/catalog.json` — gerada por `scripts/consumer-kit/collectVerification.mjs`. */
export interface NativeEquivalent {
    element: string;
    component: string;
    /** Condição fechada `contains`: o elemento só é achado se tiver um destes descendentes. */
    contains?: string[];
}

export interface PieceAlias {
    alias: string;
    use: string;
}

export interface EncapsulatedLib {
    library: string;
    component: string;
}

export interface IconNameProp {
    component: string;
    prop: string;
    /** Chave do objeto dentro do atributo (`navItems[].icon`); ausente quando o atributo é o próprio nome. */
    key?: string;
}

export interface VerificationSection {
    nativeEquivalents: NativeEquivalent[];
    pieceAliases: PieceAlias[];
    encapsulated: EncapsulatedLib[];
    iconNameProps: IconNameProp[];
    paletteIds: string[];
}

export interface CatalogProp {
    name: string;
    type: string;
}

export interface VerificationCatalog {
    lib: { name: string };
    barrelExports: string[];
    components: Record<string, { props?: CatalogProp[] }>;
    tokens: {
        cssVars: string[];
        iconNames: string[];
        spacing: Record<string, string>;
    };
    themes: { presetIds: string[] };
    designTokens: { ids: { id: string }[] };
    verification: VerificationSection;
}

/** O catálogo mais o que as regras derivam dele uma vez só. */
export interface VerificationData {
    libName: string;
    catalog: VerificationCatalog;
    /** Chaves do `exports` do `package.json` da lib (`.`, `./testing`…). */
    exportKeys: string[];
    cssVars: ReadonlySet<string>;
    iconNames: ReadonlySet<string>;
    themeIds: ReadonlySet<string>;
    paletteIds: ReadonlySet<string>;
    spacingTokens: string[];
    /** Componente → props tipadas como espaçamento de layout. */
    spacingProps: ReadonlyMap<string, ReadonlySet<string>>;
    /** Componente → props que recebem o id de um tema. */
    themeIdProps: ReadonlyMap<string, ReadonlySet<string>>;
    /** Nome do barril sem o prefixo, em minúsculas → nome público. */
    barrelByBase: ReadonlyMap<string, string>;
}
