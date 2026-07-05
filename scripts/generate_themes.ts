import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getScaffold } from '../src/core/Design/master-map.ts';

// ==========================================================================
// Gerador de Temas (v2 — Gabarito Dinâmico, spec 09)
// Substitui o antigo `masterTemplate` hardcoded (cópia estática que já nasceu
// desatualizada — ver auditor_presets.mjs) por `getScaffold()`, lido ao vivo
// do dicionário atual (schema → catálogo). Rodar via: npx tsx scripts/generate_themes.ts
// ==========================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const THEMES_DIR = path.join(__dirname, '..', 'src', 'core', 'Design', 'presets', 'themes');

interface ThemeDraft {
    id: string;
    name: string;
    description: string;
    overrides: Record<string, unknown>;
}

// As master configurations baseadas no plano de design de cada tema.
// Apenas os valores que DIVERGEM do gabarito padrão precisam estar aqui.
const themes: ThemeDraft[] = [
    // Adicionar novos temas aqui: { id, name, description, overrides }
];

if (themes.length === 0) {
    console.log('Nenhum tema novo definido em `themes`. Edite este arquivo para gerar temas.');
    process.exit(0);
}

const masterTemplate = getScaffold(); // Gabarito completo, sempre vivo (spec 09 §2.2/2.3)

themes.forEach(theme => {
    // Mescla o gabarito vivo com os overrides específicos do tema
    const finalDesign = { ...masterTemplate, ...theme.overrides };

    const designStr = Object.entries(finalDesign)
        .map(([key, value]) => {
            if (typeof value === 'string') {
                return `        ${key}: '${value.replace(/'/g, "\\'")}',`;
            }
            return `        ${key}: ${JSON.stringify(value)},`;
        })
        .join('\n');

    const exportName = theme.id.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());

    const fileContent = `import { ThemePreset } from '../index';

export const ${exportName}Theme: ThemePreset = {
    id: '${theme.id}',
    name: '${theme.name}',
    description: '${theme.description}',
    design: {
${designStr}
    }
};
`;

    const filePath = path.join(THEMES_DIR, `${theme.id}.ts`);
    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(`Generated ${theme.id}.ts (${Object.keys(finalDesign).length} chaves, gabarito vivo)`);
});
