/**
 * CODEGEN — Tipos de design tokens a partir da Fonte da Verdade.
 *
 * Lê o MASTER_DESIGN_MAP (Schema canônico, o mesmo validado pela paridade
 * 1:1:1:1:1) e emite:
 *   - `SarakDesignTokens`: interface tipada por token, com o tipo TS derivado
 *     de `token.type` (color/string/… → string; number/slider → number;
 *     boolean → boolean; isResponsive → `T | SarakResponsiveValue<T>`).
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
import type { SarakDesignToken } from '../src/core/Design/types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/** Traduz o `token.type` (semântico) para o tipo TS base. */
const baseTsType = (token: SarakDesignToken): string => {
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
const tsType = (token: SarakDesignToken): string => {
    const base = baseTsType(token);
    return token.isResponsive ? `${base} | SarakResponsiveValue<${base}>` : base;
};

/** Cita a chave só quando ela não é um identificador TS válido. */
const propKey = (id: string): string => (/^[A-Za-z_$][\w$]*$/.test(id) ? id : `'${id}'`);

// Coleta os tokens (id único; first-wins, mesma regra do map plano de hoje).
const seen = new Map<string, SarakDesignToken>();
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
    "import type { SarakResponsiveValue } from '../../Design/types';",
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
const outFile = path.join(outDir, 'design-token-ids.ts');
const conteudo = header + interfaceType + idType;

// A documentação por token (`kind`, `modeDependent`, `usage`, `interactsWith`) mora no schema; o kit do
// consumidor (`scripts/consumer-kit/`) a lê deste JSON, porque é Node puro e não importa TS. Só entra o que o
// schema declarou — token sem documentação sai com `group` e `label`, e o gate de documentação o acusa.
const docsFile = path.join(outDir, 'design-token-docs.json');
const groupOf = new Map<string, string>();
MASTER_DESIGN_MAP.components.forEach((component) => {
    component.tokens.forEach((token) => {
        if (!groupOf.has(token.id)) groupOf.set(token.id, component.id);
    });
});
const docsEntries = sortedTokens.map((token) => {
    const entry: Record<string, unknown> = { id: token.id, group: groupOf.get(token.id), label: token.label };
    if (token.kind !== undefined) entry.kind = token.kind;
    if (token.modeDependent !== undefined) entry.modeDependent = token.modeDependent;
    if (token.usage !== undefined) entry.usage = token.usage;
    if (token.interactsWith !== undefined) entry.interactsWith = token.interactsWith;
    return entry;
});
const docsContent = `${JSON.stringify(
    {
        $comment: 'GERADO por scripts/generate-token-types.ts — NÃO edite à mão. Fonte: o schema (src/core/Design/schema/).',
        groups: Object.fromEntries(MASTER_DESIGN_MAP.components.map((component) => [component.id, component.label])),
        tokens: docsEntries,
    },
    null,
    1,
)}\n`;

// ---------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que o modo `--check` NÃO vê
// ---------------------------------------------------------------------------
// Comparação byte a byte do arquivo inteiro contra o que o gerador produziria
// agora — mesma mecânica de catalog/guide/dev-kit. NÃO confere se
// `MASTER_DESIGN_MAP` em si está correto (isso é R4, `auditor_paridade`); só
// confere se o ARTEFATO GERADO está em dia com a fonte. Registrado porque foi
// exatamente este vão que deixou `design-token-ids.ts` defasado em 105 tokens
// por mais de um mês sem nenhum gate acusar (achado 22).
// ---------------------------------------------------------------------------
if (process.argv.includes('--check')) {
    const atual = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf-8') : null;
    const currentDocs = fs.existsSync(docsFile) ? fs.readFileSync(docsFile, 'utf-8') : null;
    if (atual === conteudo && currentDocs === docsContent) {
        console.log(`[token-types:check] design-token-ids.ts e design-token-docs.json em dia (${sortedTokens.length} tokens).`);
        process.exit(0);
    }
    const staleFiles = [atual === conteudo ? '' : 'design-token-ids.ts', currentDocs === docsContent ? '' : 'design-token-docs.json']
        .filter(Boolean)
        .join(' e ');
    console.log(`[token-types:check] ${staleFiles} DEFASADO — rode \`npx tsx scripts/generate-token-types.ts\` e commite o resultado.`);
    process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, conteudo, 'utf-8');
fs.writeFileSync(docsFile, docsContent, 'utf-8');

console.log(`✅ design-token-ids.ts: ${sortedTokens.length} tokens tipados (interface SarakDesignTokens + DesignTokenId).`);
