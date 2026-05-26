import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MASTER_DESIGN_MAP } from '../src/core/Design/master-map';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const columnMapping: Record<string, string[]> = {
    // Top-Level Columns
    "mode": [],
    "navigation_style": [],
    "body_size": [],

    // JSONB Columns
    "branding_config": [],
    "colors_and_atmosphere": [],
    "typography": [],
    "layout_and_navigation": [],
    "components_base": [],
    "cards_engine": [],
    "data_and_charts": [],
    "motion_and_animation": [],
    "specialized_engines": []
};

// De onde vêm os schemas
const schemaToColumn: Record<string, string> = {
    'branding': 'branding_config',
    'system': 'branding_config',
    'colors': 'colors_and_atmosphere',
    'status': 'colors_and_atmosphere',
    'atmosphere': 'colors_and_atmosphere',
    'typography': 'typography',
    'navigation': 'layout_and_navigation',
    'layers': 'layout_and_navigation',
    'scrollbars': 'layout_and_navigation',
    'buttons': 'components_base',
    'inputs': 'components_base',
    'switches': 'components_base',
    'overlays': 'components_base',
    'tables': 'components_base',
    'cards': 'cards_engine',
    'cardTitle': 'cards_engine',
    'cardAction': 'cards_engine',
    'cardSearch': 'cards_engine',
    'data': 'data_and_charts',
    'specialized': 'data_and_charts',
    'animations': 'motion_and_animation',
    'motion': 'motion_and_animation',
    'chat': 'specialized_engines',
    'engineering': 'specialized_engines',
    'advanced': 'specialized_engines',
    'media': 'colors_and_atmosphere'
};

// Iterar todos os componentes
MASTER_DESIGN_MAP.components.forEach(schema => {
    schema.tokens.forEach(token => {
        // Regras Especiais Top-Level
        if (token.id === 'mode') {
            columnMapping['mode'].push(token.id);
            return;
        }
        if (token.id === 'navigationStyle') {
            columnMapping['navigation_style'].push(token.id);
            return;
        }
        if (token.id === 'bodySize') {
            columnMapping['body_size'].push(token.id);
            return;
        }

        // Caso normal
        const targetColumn = schemaToColumn[schema.id];
        if (targetColumn) {
            columnMapping[targetColumn].push(token.id);
        } else {
            console.warn(`Aviso: O token ${token.id} (do schema ${schema.id}) não foi mapeado!`);
        }
    });
});

const outputPath = path.resolve(__dirname, '../src/core/Design/catalog/theme_table_mapping.json');
fs.writeFileSync(outputPath, JSON.stringify(columnMapping, null, 2), 'utf-8');
console.log('Mapeamento limpo gerado com sucesso em:', outputPath);
