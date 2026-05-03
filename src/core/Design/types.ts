/**
 * Sarak Industrial Design Schema (v11.0)
 * 
 * Define o contrato para mapeamento de 100% das funcionalidades e componentes.
 */

export type TokenValueType = 'number' | 'color' | 'string' | 'boolean' | 'select' | 'slider' | 'font';

export interface DesignToken {
    id: string;                 // Chave única no estado (ex: cardBorderRadius)
    label: string;              // Nome legível para o usuário
    category: string;           // Grupo (ex: "Cards", "Navegação")
    type: TokenValueType;
    unit?: 'px' | '%' | 'rem' | 'ms' | 'deg';
    cssVars?: string[];         // Variáveis CSS que este token controla
    constraints?: {
        min?: number;
        max?: number;
        step?: number;
        options?: { id: string; label: string }[];
    };
    defaultValue: any;
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
