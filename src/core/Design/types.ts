/**
 * Sarak Industrial Design Schema (v11.0)
 *
 * Define o contrato para mapeamento de 100% das funcionalidades e componentes.
 */

export type TokenValueType = 'number' | 'color' | 'string' | 'boolean' | 'select' | 'slider' | 'font' | 'text' | 'image' | 'file';

export type ResponsiveValue<T> = {
    desk: T;
    tab: T;
    mob: T;
};

/** Espaço de valores que um token pode assumir (espelha SarakDesignTokens). */
export type SarakTokenValue = string | number | boolean | ResponsiveValue<string | number>;

export interface DesignToken {
    id: string;                 // Chave única no estado (ex: cardBorderRadius)
    label: string;              // Nome legível para o usuário
    type: TokenValueType;
    isResponsive?: boolean;     // Indica se este token é físico/espacial e suporta o ResponsiveValue
    semanticRole?: 'bg' | 'text' | 'border' | 'primary';
    iconFamily?: 'lucide' | 'phosphor' | 'tabler';
    iconWeight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
    unit?: 'px' | '%' | 'rem' | 'em' | 'ms' | 'deg' | 's';
    cssVars?: string[];         // Variáveis CSS que este token controla
    generateVariants?: boolean; // Se verdadeiro, gera variantes de cor automáticas
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

export interface ComponentSchema {
    id: string;
    label: string;
    tokens: DesignToken[];
}

export interface MasterDesignSchema {
    version: string;
    components: ComponentSchema[];
}
