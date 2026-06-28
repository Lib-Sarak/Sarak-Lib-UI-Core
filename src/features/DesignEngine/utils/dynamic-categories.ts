// v14.0 - Design Engine Folksonomy Utilities

export const sanitizeCategory = (rawCategory: string): string => {
    const raw = rawCategory.toLowerCase().trim();

    // Dicionário de Redução
    if (['cores', 'colors-and-atmosphere', 'identidade', 'branding', 'marca', 'tema', 'temas', 'tema-base', 'fundo-global'].includes(raw)) return 'Cores e Marca';
    if (['tipografia', 'typography', 'peso'].includes(raw)) return 'Tipografia';
    if (['layout', 'layout_and_navigation', 'navegacao', 'navegação', 'estrutura', 'alinhamento', 'posicionamento', 'container', 'cabecalho', 'rodape', 'margem', 'espaçamento', 'espacamento'].includes(raw)) return 'Layout e Navegação';
    if (['efeito', 'efeitos', 'sombra-luz', 'filtros', 'iluminacao', 'ruído', 'glassmorphism', 'opacidade', 'texturas'].includes(raw)) return 'Efeitos e Superfície';
    if (['geometria', 'bordas', 'espessura', 'curvas', 'assimetria', 'tamanho', 'escala'].includes(raw)) return 'Geometria e Bordas';
    if (['cards', 'surface', 'superficie', 'camadas'].includes(raw)) return 'Cards e Superfícies';
    if (['animacao', 'animações', 'motion-and-animation', 'timing', 'física'].includes(raw)) return 'Animações';
    if (['botoes', 'interacao', 'interação', 'comportamento', 'estado', 'acessibilidade', 'destaque'].includes(raw)) return 'Botões e Interação';
    if (['data-and-charts', 'tabelas', 'gráficos', 'indicadores', 'exibição'].includes(raw)) return 'Dados e Gráficos';
    if (['inputs', 'switches', 'ajuste'].includes(raw)) return 'Formulários';
    if (['specialized-engines', 'media', 'imagem', 'câmera', 'overlays', 'status', 'scrollbar', 'tooltip', 'arquitetura', 'especial', 'ergonomia'].includes(raw)) return 'Especializado';

    return 'Geral';
};

import DesignPillars from '../config/design-pillars.json';

// Extrai PILLAR_TO_CATEGORIES a partir do JSON de configuração
export const PILLAR_TO_CATEGORIES: Record<string, string[]> = {};
DesignPillars.forEach(pillar => {
    PILLAR_TO_CATEGORIES[pillar.id] = pillar.categories;
});

export const CATEGORY_TO_PILLAR: Record<string, string> = {};
Object.entries(PILLAR_TO_CATEGORIES).forEach(([pillarId, cats]) => {
    cats.forEach(c => CATEGORY_TO_PILLAR[c] = pillarId);
});

import type { ComponentSchema, DesignToken } from '../../../core/Design/types';

/**
 * Constrói grupos lógicos ("Colors", "Typography", "Inputs") a partir do catálogo global e da estrutura de schemas mestre.
 * A estrutura resultante é { "Pillar": { "Group": [Token] } }
 */
export const buildDynamicGroups = (masterTokens: ComponentSchema[], catalogJSON: { tokenId?: string, categories?: string[] }[]) => {
    // 1. Mapa de categorias sanitizadas por token
    const tokenCategoriesMap: Record<string, string[]> = {};
    
    catalogJSON.forEach(token => {
        if (!token.tokenId || !token.categories || !Array.isArray(token.categories)) return;
        
        const sanitized = token.categories.map((c: string) => sanitizeCategory(c));
        // Remove duplicatas (ex: se "cores" e "colors-and-atmosphere" virarem "Cores e Marca", fica só 1)
        tokenCategoriesMap[token.tokenId] = Array.from(new Set(sanitized));
    });

    // 2. Estrutura base
    const groups: Record<string, Record<string, DesignToken[]>> = {};
    Object.keys(PILLAR_TO_CATEGORIES).forEach(p => groups[p] = {});

    // 3. Cruzamento
    masterTokens.forEach(masterToken => {
        if (masterToken.id === 'global') return; // Global é tratado separado na UI

        masterToken.tokens.forEach((t: DesignToken) => {
            let foundInCatalog: { tokenId?: string, categories?: string[] } | undefined;
            const myCategories = tokenCategoriesMap[t.id] || ['Especializado'];
            
            myCategories.forEach(mainCategory => {
                const pillarId = CATEGORY_TO_PILLAR[mainCategory];
                if (!pillarId) return;

                // Determina as subcategorias (as *outras* categorias que o token tem)
                let subCategories = myCategories.filter(c => c !== mainCategory);
                
                if (subCategories.length === 0) {
                    subCategories = ['Geral']; // Token só tem 1 categoria
                }

                subCategories.forEach(sub => {
                    if (!groups[pillarId][sub]) groups[pillarId][sub] = [];
                    // Adiciona o schema do masterToken como container (já que o Design Engine renderiza <Section> baseada no schema)
                    // Wait! The UI expects `comps`, where `comps` is an array of Schemas.
                    // If we group tokens directly, the UI code needs to be adapted to render raw tokens under a subcategory.
                    groups[pillarId][sub].push(t);
                });
            });
        });
    });

    // 4. Polimento: Mover subcategorias pequenas (<= 2) para "Geral"
    Object.keys(groups).forEach(pillarId => {
        const pillarData = groups[pillarId];
        const subs = Object.keys(pillarData);
        
        subs.forEach(sub => {
            if (sub !== 'Geral' && pillarData[sub].length <= 2) {
                if (!pillarData['Geral']) pillarData['Geral'] = [];
                // Move os tokens para Geral
                pillarData['Geral'].push(...pillarData[sub]);
                // Deleta a subcategoria pequena
                delete pillarData[sub];
            }
        });
    });

    // 5. Remover duplicatas em cada subcategoria (um token pode acabar caindo na mesma subcategoria por cruzamentos diferentes)
    Object.keys(groups).forEach(pillarId => {
        Object.keys(groups[pillarId]).forEach(sub => {
            const uniqueTokens = Array.from(new Set(groups[pillarId][sub]));
            groups[pillarId][sub] = uniqueTokens;
        });
    });

    return groups;
};
