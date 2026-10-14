/**
 * CODEGEN — o catálogo LEVE dos temas embarcados (`SARAK_THEME_CATALOG`).
 *
 * Lê os temas por `themes/all.ts` (a lista inteira, fora do barril) e emite, para
 * cada um, `{ id, name, description, mode, hasContraparte, swatch, swatchOpposite }`
 * pela MESMA função que o Provider usa para listar tema de consumidor
 * (`toThemeCatalogEntry`). O consumidor lista sem carregar o `design` inteiro, e
 * o metadado não envelhece: é derivado do tema, nunca escrito à mão.
 *
 * Regenerar:  npm run themes:catalog      Conferir:  npm run themes:catalog:check
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SARAK_ALL_THEMES } from '../src/core/Design/presets/themes/all.ts';
import { toThemeCatalogEntry } from '../src/core/Design/presets/themes/catalog.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(__dirname, '../src/core/Design/presets/themes/catalog.generated.ts');

const header = [
    '// ============================================================================',
    '// ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.',
    '// Fonte da verdade: src/core/Design/presets/themes/*.ts (via all.ts).',
    '// Regenerar: npm run themes:catalog',
    '// ============================================================================',
    '',
    "import type { SarakThemeCatalogEntry } from './index';",
    '',
    '',
].join('\n');

const entries = SARAK_ALL_THEMES.map((theme) => `    ${JSON.stringify(toThemeCatalogEntry(theme))},`);
const content = `${header}export const SARAK_THEME_CATALOG: readonly SarakThemeCatalogEntry[] = [\n${entries.join('\n')}\n];\n`;

// ---------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que o modo `--check` NÃO vê
// ---------------------------------------------------------------------------
// Compara byte a byte o arquivo gerado com o que o gerador produziria agora.
// NÃO confere se o tema está CERTO (contraste/diversidade são `verify_*`); só
// que o catálogo leve reflete o tema. Tema que existe em `themes/` mas não foi
// listado em `all.ts` também escapa daqui — quem cobre isso é o teste de
// paridade `themeCatalogParity.test.ts` (ids, loaders e `all.ts` conferem).
// ---------------------------------------------------------------------------
if (process.argv.includes('--check')) {
    const current = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf-8') : null;
    if (current === content) {
        console.log(`[themes:catalog:check] catalog.generated.ts em dia (${SARAK_ALL_THEMES.length} temas).`);
        process.exit(0);
    }
    console.log('[themes:catalog:check] catalog.generated.ts DEFASADO — rode `npm run themes:catalog` e commite o resultado.');
    process.exit(1);
}

fs.writeFileSync(outFile, content, 'utf-8');
console.log(`✅ catalog.generated.ts: ${SARAK_ALL_THEMES.length} temas no catálogo leve.`);
