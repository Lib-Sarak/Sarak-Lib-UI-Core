/**
 * CODEGEN — Tipos de design tokens a partir da Fonte da Verdade.
 *
 * Lê o MASTER_DESIGN_MAP (Schema canônico, o mesmo validado pela paridade
 * 1:1:1:1:1) e emite:
 *   - `SarakDesignTokens`: interface tipada por token, com o tipo TS derivado
 *     de `token.type` (color/string/… → string; number/slider → number;
 *     boolean → boolean; isResponsive → `T | ResponsiveValue<T>`).
 *   - `DesignTokenId = keyof SarakDesignTokens`: a união de ids preservada (a
 *     paridade depende deste export), agora sempre em sincronia com a interface.
 *
 * Isso permite tipar `SarakThemePayload` com VALORES precisos (não `unknown`),
 * fazendo o TypeScript rejeitar tokens-fantasma E usos de valor incorretos.
 *
 * Regenerar:  npx tsx scripts/generate-token-types.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MASTER_DESIGN_MAP } from '../src/core/Design/master-map.ts';
import type { DesignToken } from '../src/core/Design/types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/** Traduz o `token.type` (semântico) para o tipo TS base. */
const baseTsType = (token: DesignToken): string => {
    switch (token.type) {
        case 'number':
        case 'slider':
            return 'number';
        case 'boolean':
            return 'boolean';
        // color | string | select | font | text | image | file → string
        // (união literal de `select` fica como refinamento opcional)
        default:
            return 'string';
    }
};

/** Tokens responsivos aceitam o escalar OU o objeto {desk,tab,mob}. */
const tsType = (token: DesignToken): string => {
    const base = baseTsType(token);
    return token.isResponsive ? `${base} | ResponsiveValue<${base}>` : base;
};

/** Cita a chave só quando ela não é um identificador TS válido. */
const propKey = (id: string): string => (/^[A-Za-z_$][\w$]*$/.test(id) ? id : `'${id}'`);

// Coleta os tokens (id único; first-wins, mesma regra do map plano de hoje).
const seen = new Map<string, DesignToken>();
MASTER_DESIGN_MAP.components.forEach((component) => {
    component.tokens.forEach((token) => {
        if (!seen.has(token.id)) seen.set(token.id, token);
    });
});

const sortedTokens = [...seen.values()].sort((a, b) => a.id.localeCompare(b.id));

const header = [
    '// ============================================================================',
    '// ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.',
    '// Fonte da verdade: src/core/Design/master-map.ts (MASTER_DESIGN_MAP).',
    '// Regenerar: npx tsx scripts/generate-token-types.ts',
    '// ============================================================================',
    '',
    "import type { ResponsiveValue } from '../../Design/types';",
    '',
    '',
].join('\n');

// Saída compacta (vários membros por linha) para manter o arquivo gerado enxuto
// (Clean Code: evita "arquivo gigantesco"). Continua TS válido.
const PER_LINE = 4;
const members = sortedTokens.map((t) => `${propKey(t.id)}: ${tsType(t)};`);
const interfaceLines: string[] = [];
for (let i = 0; i < members.length; i += PER_LINE) {
    interfaceLines.push('    ' + members.slice(i, i + PER_LINE).join(' '));
}
const interfaceType = `export interface SarakDesignTokens {\n${interfaceLines.join('\n')}\n}\n\n`;
const idType = 'export type DesignTokenId = keyof SarakDesignTokens;\n';

const outDir = path.join(rootDir, 'src/core/Provider/generated');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'design-token-ids.ts');
fs.writeFileSync(outFile, header + interfaceType + idType, 'utf-8');

console.log(`✅ design-token-ids.ts: ${sortedTokens.length} tokens tipados (interface SarakDesignTokens + DesignTokenId).`);
