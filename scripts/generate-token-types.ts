/**
 * CODEGEN — Tipo `DesignTokenId` a partir da Fonte da Verdade.
 *
 * Lê o MASTER_DESIGN_MAP (Schema canônico, o mesmo validado pela paridade
 * 1:1:1:1:1) e emite uma união de string-literais com todos os token ids.
 * Isso permite tipar `SarakThemePayload` sem índice aberto, fazendo o
 * TypeScript REJEITAR tokens-fantasma (ex.: `design.brandColorPrimary`) em
 * tempo de compilação.
 *
 * Regenerar:  npm run gen:tokens   (npx tsx scripts/generate-token-types.ts)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MASTER_DESIGN_MAP } from '../src/core/Design/master-map.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const ids = new Set<string>();
MASTER_DESIGN_MAP.components.forEach((component) => {
    component.tokens.forEach((token) => ids.add(token.id));
});

const sortedIds = [...ids].sort((a, b) => a.localeCompare(b));

const header = [
    '// ============================================================================',
    '// ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.',
    '// Fonte da verdade: src/core/Design/master-map.ts (MASTER_DESIGN_MAP).',
    '// Regenerar: npm run gen:tokens',
    '// ============================================================================',
    '',
    '',
].join('\n');

// Saída compacta (vários ids por linha) para manter o arquivo gerado enxuto.
const PER_LINE = 8;
const unionLines: string[] = [];
for (let i = 0; i < sortedIds.length; i += PER_LINE) {
    const chunk = sortedIds.slice(i, i + PER_LINE).map((id) => `'${id}'`).join(' | ');
    unionLines.push(`    | ${chunk}`);
}
const unionType = `export type DesignTokenId =\n${unionLines.join('\n')};\n`;

const outDir = path.join(rootDir, 'src/core/Provider/generated');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'design-token-ids.ts');
fs.writeFileSync(outFile, header + unionType, 'utf-8');

console.log(`✅ design-token-ids.ts gerado com ${sortedIds.length} ids (fonte: MASTER_DESIGN_MAP).`);
