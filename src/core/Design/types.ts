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
    defaultValue: any;
    legacyValue?: any; // Valor estático imutável que este token assume para temas/presets antigos que não o possuem
    description?: string;
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
