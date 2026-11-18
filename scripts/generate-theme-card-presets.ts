/**
 * CODEGEN — o preset de card de cada tema embarcado (`THEME_CARD_PRESETS`).
 *
 * Lê os temas por `themes/all.ts` e emite, para cada um, os tokens de card que ele declara (`cardPresetsFromThemes.ts`).
 * O preset nunca é transcrito: tema novo ou card mudado no tema só chega ao painel por este gerador, e o `--check` reprova
 * o arquivo defasado.
 *
 * Regenerar:  npm run card-presets      Conferir:  npm run card-presets:check
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SARAK_ALL_THEMES } from '../src/core/Design/presets/themes/all';
import { buildThemeCardPreset } from './cardPresetsFromThemes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(__dirname, '../src/core/Design/presets/components/cardsThemes.generated.ts');

const header = [
    '// ============================================================================',
    '// ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.',
    '// Fonte da verdade: src/core/Design/presets/themes/*.ts (via all.ts) — os tokens de card que cada tema declara, sem cor.',
    '// Regenerar: npm run card-presets',
    '// ============================================================================',
    '',
    "import type { ComponentPreset } from './cards';",
    '',
    '',
].join('\n');

const entries = SARAK_ALL_THEMES.map((theme) => `    ${JSON.stringify(buildThemeCardPreset(theme))},`);
const content = `${header}export const THEME_CARD_PRESETS: ComponentPreset[] = [\n${entries.join('\n')}\n];\n`;

// ---------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que o modo `--check` NÃO vê
// ---------------------------------------------------------------------------
// Compara byte a byte o arquivo gerado com o que o gerador produziria agora, então pega tema que mudou o card e tema que
// entrou ou saiu de `all.ts`. NÃO confere se o card ficou bonito nem legível (os testes de preset e de contraste olham o
// resultado). Só vê o `design` nativo do tema: a `contraparte` (modo oposto) não entra no preset. Tema que existe em
// `themes/` e não foi listado em `all.ts` escapa daqui; quem cobre isso é `themeCatalogParity.test.ts`.
// ---------------------------------------------------------------------------
if (process.argv.includes('--check')) {
    const current = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf-8') : null;
    if (current === content) {
        console.log(`[card-presets:check] cardsThemes.generated.ts em dia (${SARAK_ALL_THEMES.length} temas).`);
        process.exit(0);
    }
    console.log('[card-presets:check] cardsThemes.generated.ts DEFASADO — rode `npm run card-presets` e commite o resultado.');
    process.exit(1);
}

fs.writeFileSync(outFile, content, 'utf-8');
console.log(`✅ cardsThemes.generated.ts: ${SARAK_ALL_THEMES.length} presets de card, um por tema.`);
