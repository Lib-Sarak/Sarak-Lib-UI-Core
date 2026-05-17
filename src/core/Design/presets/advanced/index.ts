/**
 * Presets: Componentes Avançados — Matrizes (v2.0)
 * 
 * Presets data-driven com chaves mapeando para AdvancedSchema.tokens[].id
 * Contrato padrão: { id, name, description, design }
 */

export interface AdvancedPreset {
    id: string;
    name: string;
    description: string;
    design: Record<string, any>;
}

export const ADVANCED_PRESETS: AdvancedPreset[] = [
    {
        id: 'industrial-matrix',
        name: 'Matriz Industrial',
        description: 'Grid industrial robusto com espaçamento equilibrado',
        design: {
            matrixGap: 12,
            matrixRadius: 12,
            matrixItemBg: 'rgba(255, 255, 255, 0.02)',
            matrixBorderColor: 'rgba(255, 255, 255, 0.05)',
            matrixSearchBg: 'rgba(255, 255, 255, 0.05)',
            matrixBlur: 10
        }
    },
    {
        id: 'minimal-matrix',
        name: 'Matriz Minimalista',
        description: 'Extremo minimalismo com bordas quase invisíveis',
        design: {
            matrixGap: 4,
            matrixRadius: 4,
            matrixItemBg: 'transparent',
            matrixBorderColor: 'rgba(255, 255, 255, 0.02)',
            matrixSearchBg: 'rgba(255, 255, 255, 0.02)',
            matrixBlur: 0
        }
    },
    {
        id: 'glass-matrix',
        name: 'Matriz Crystal Glass',
        description: 'Estética vítreo com blur de profundidade',
        design: {
            matrixGap: 16,
            matrixRadius: 24,
            matrixItemBg: 'rgba(255, 255, 255, 0.05)',
            matrixBorderColor: 'rgba(255, 255, 255, 0.1)',
            matrixSearchBg: 'rgba(255, 255, 255, 0.08)',
            matrixBlur: 20
        }
    },
    {
        id: 'stealth-matrix',
        name: 'Matriz Stealth Dark',
        description: 'Modo furtivo com contraste extremo e cantos retos',
        design: {
            matrixGap: 8,
            matrixRadius: 0,
            matrixItemBg: 'rgba(0, 0, 0, 0.4)',
            matrixBorderColor: 'rgba(255, 255, 255, 0.03)',
            matrixSearchBg: 'rgba(0, 0, 0, 0.2)',
            matrixBlur: 0
        }
    },
    {
        id: 'neon-matrix',
        name: 'Matriz Cyber Neon',
        description: 'Estética cyberpunk com bordas neon e blur sutil',
        design: {
            matrixGap: 20,
            matrixRadius: 16,
            matrixItemBg: 'rgba(0, 242, 255, 0.02)',
            matrixBorderColor: 'rgba(0, 242, 255, 0.2)',
            matrixSearchBg: 'rgba(0, 242, 255, 0.05)',
            matrixBlur: 10
        }
    }
];
