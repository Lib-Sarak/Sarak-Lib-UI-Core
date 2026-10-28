/**
 * Sarak Industrial Design Schema (v11.0)
 *
 * Define o contrato para mapeamento de 100% das funcionalidades e componentes.
 */

export type SarakTokenValueType = 'number' | 'color' | 'string' | 'boolean' | 'select' | 'slider' | 'font' | 'text' | 'image' | 'file';

export type SarakResponsiveValue<T> = {
    desk: T;
    tab: T;
    mob: T;
};

/** Espaço de valores que um token pode assumir (espelha SarakDesignTokens). */
export type SarakTokenValue = string | number | boolean | SarakResponsiveValue<string | number>;

export interface SarakDesignToken {
    id: string;                 // Chave única no estado (ex: cardBorderRadius)
    label: string;              // Nome legível para o usuário
    type: SarakTokenValueType;
    isResponsive?: boolean;     // Indica se este token é físico/espacial e suporta o ResponsiveValue
    semanticRole?: 'bg' | 'text' | 'border' | 'primary';
    iconFamily?: 'lucide' | 'phosphor' | 'tabler';
    iconWeight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
    unit?: 'px' | '%' | 'rem' | 'em' | 'ms' | 'deg' | 's';
    cssVars?: string[];         // Variáveis CSS que este token controla
    generateVariants?: boolean; // Se verdadeiro, gera variantes de cor automáticas
    /**
     * Id do token MESTRE de que este é exceção (ex.: `cardRadiusTL` é exceção de `cardBorderRadius`).
     * O mestre escreve as variáveis de todos os cantos; a exceção só as sobrescreve quando o tema a
     * declara — com valor diferente do padrão do schema. Sem declarar, o mestre chega ao canto.
     */
    exceptionOf?: string;
    constraints?: {
        min?: number;
        max?: number;
        step?: number;
        options?: { value?: string; id?: string; label: string }[];
    };
    options?: { value?: string; id?: string; label: string }[];
    min?: number;
    max?: number;
    step?: number;
    defaultValue: SarakTokenValue;
    legacyValue?: SarakTokenValue; // Valor estático imutável que este token assume para temas/presets antigos que não o possuem
    description?: string;
    /**
     * Classificação de eixo visual, usada para medir a completude de um tema por eixo
     * (`findMissingThemeAxes`, em `src/core/Design/utils/themeAxes.ts`). Opcional: tokens
     * estruturais/não-visuais (ex: `mode`, `navigationStyle`) podem não ter eixo.
     */
    axis?: 'color' | 'geometry' | 'elevation' | 'texture' | 'density' | 'motion';
    /**
     * Presença = token Estrutural (Alavanca 2): o valor não é injetado como CSS Variable,
     * é lido em JS por um Hook Controlador que decide className/style (ex: direção,
     * posição, alinhamento). Lista os hooks/métodos consumidores (ex: ['useCardLayoutStyles']).
     * Ausência = token de Valor (Alavanca 1, default): consumido via `var(--sarak-*, fallback)`.
     */
    structuralConsumer?: string[];
    /**
     * Natureza do token. `aesthetic`: o tema o projeta (cor, elevação, textura, tipografia, geometria visual,
     * densidade visual, movimento). `functional`: deve ser igual em todo tema por segurança, acessibilidade ou
     * consistência de comportamento (camadas, alvo de toque, larguras e posições do cromo, breakpoints,
     * comportamento) — o tema embarcado não o declara. Critério completo: o anexo da plan de temas.
     */
    kind?: 'aesthetic' | 'functional';
    /** `true` quando o valor muda com o modo claro/escuro, e por isso entra na `contraparte` do tema. */
    modeDependent?: boolean;
    /** `true` quando um tema pode omitir este token estético sem herdar uma intenção visual. */
    optionalForTheme?: boolean;
    /** O que o token muda na tela e onde, em uma ou duas frases, sem repetir o rótulo nem transcrever opções. */
    usage?: string;
    /** Ids de tokens sem os quais este não tem efeito visível (ex.: opacidade da textura × tipo de textura). */
    interactsWith?: string[];
}

export interface ComponentSchema {
    id: string;
    label: string;
    tokens: SarakDesignToken[];
}

export interface MasterDesignSchema {
    version: string;
    components: ComponentSchema[];
}
