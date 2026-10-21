// Contrato do painel — quatro regras, um script: o painel só pode oferecer o que o tema e a validação
// aceitam, e tem de gravar o que mostra.
//
//   (i)   PADRÃO DENTRO DA FAIXA QUE O PAINEL DESENHA. Todo token numérico tem o padrão (e cada ponto
//         `desk`/`tab`/`mob`) dentro de `[min, max]` e na grade do `step`. Faixa ausente vale o que o painel
//         desenha: 0..100, passo 1 — `zIndexToast` 9000 sem faixa aparecia como 0..100 e o primeiro toque do
//         slider o jogava para 100, abaixo de qualquer modal.
//   (ii)  VALOR DE TEMA DENTRO DO CONTRATO NUMÉRICO. Todo valor numérico de tema e de preset shippado cabe
//         em `[min, max]` do próprio token (a mesma função que a validação usa em runtime). Antes, a
//         validação cortava em silêncio e o tema mostrava outro valor que o declarado (41 valores em 14
//         temas: `motionDuration*` 0, raio 9999, `identityTracking` 1–4).
//   (iii) TODO TIPO DO SCHEMA TEM CONTROLE. Cada membro de `SarakTokenValueType` tem ramo no
//         `DynamicTokenControl` (Command Center) e entrada no `ControlRegistry` (aba de tema). Tipo sem
//         ramo caía em "tipo não suportado": sombra, curva e imagem não tinham como ser editadas.
//   (iv)  OPÇÃO GRAVA O QUE VALE. Em `select`/`font`, a opção cujo `id` difere do `value` é acusada: o
//         controle grava um e a validação confere o outro (`cardTitleFontWeight`: `id 'black'`,
//         `value '900'` — a escolha era descartada).
//
// Uso: `npx tsx gates/scripts/contrato/check-panel-contract.ts`. Toda ausência é bloqueio.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. (i) e (ii) só olham token `slider`/`number`. Texto, cor e enumeração têm contrato próprio e são
//    cobertos por `tokenContractParity`; aqui só entra o que a validação CORTA em vez de descartar.
// 2. (i) julga o padrão do schema e (ii) os temas e presets que a lib embarca (`SARAK_ALL_THEMES`,
//    `presets/components/*`). Tema do consumidor, tema salvo e JSON importado são julgados por
//    `validateDesign` em runtime — que corta —, não por este gate.
// 3. (ii) confere a grade do `step` de tema e preset contando a partir do `min` (ou de 0), com o passo
//    do schema (ou 1, o do painel sem faixa). Não corrige: o `validateDesign` de runtime NÃO encaixa o valor
//    na grade — o tema do consumidor com 0,35 num passo de 0,1 é desenhado como está e regravado em outro
//    valor só quando o usuário mexe no slider.
// 4. (iii) é TEXTUAL: lê a união `SarakTokenValueType` e os `case '…':` do `DynamicTokenControl` e as chaves
//    do `ControlRegistry`. Um ramo que existe e renderiza o controle errado passa — o que o controle
//    GRAVA é do teste do componente, não deste gate. Tipo usado fora do schema também entra (é a união).
// 5. (iv) só vê a opção que declara `id` E `value` diferentes. Opção só com `id` ou só com `value` passa;
//    que o padrão do token seja uma das opções é do `tokenContractParity`.
// 6. Não vê controle montado fora desses dois despachantes (um painel do consumidor com controle próprio).
// -------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sarakGetAllDesignTokens, sarakGetDefaultDesignState } from '../../../src/core/Design/master-map';
import { SARAK_ALL_THEMES } from '../../../src/core/Design/presets/themes/all';
import { CARD_PRESETS, CARD_TEXTURE_PRESETS } from '../../../src/core/Design/presets/components/cards';
import { BUTTON_PRESETS, BUTTON_STYLE_PRESETS } from '../../../src/core/Design/presets/components/buttons';
import { INPUT_PRESETS } from '../../../src/core/Design/presets/components/inputs';
import { TYPOGRAPHY_PRESETS } from '../../../src/core/Design/presets/components/typography';
import { MEDIA_PRESETS, TEXTURE_PRESETS } from '../../../src/core/Design/presets/components/atmosphere';
import { auditTokenContract, type TokenContractDrift } from '../../../src/core/Provider/utils/validation';
import type { SarakDesignToken } from '../../../src/core/Design/types';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/** O que o painel desenha quando o schema não declara faixa. */
const PANEL_DEFAULT_MIN = 0;
const PANEL_DEFAULT_MAX = 100;
const PANEL_DEFAULT_STEP = 1;
const STEP_TOLERANCE = 1e-6;

export interface DefaultFinding {
    token: string;
    axis: string;
    value: number;
    motivo: string;
}

export interface OptionFinding {
    token: string;
    id: string;
    value: string;
}

export interface ControlSources {
    /** Texto de `core/Design/types.ts` (a união `SarakTokenValueType`). */
    types: string;
    /** Texto do `DynamicTokenControl.tsx`. */
    dynamic: string;
    /** Texto do `TokenControl.tsx` (o `ControlRegistry`). */
    registry: string;
}

export interface ThemeSource {
    fonte: string;
    design: Record<string, unknown>;
}

export interface PanelContractReport {
    defaults: DefaultFinding[];
    themes: TokenContractDrift[];
    controls: string[];
    options: OptionFinding[];
    checked: { tokens: number; sources: number; types: number };
}

const isNumeric = (token: SarakDesignToken): boolean => token.type === 'slider' || token.type === 'number';

function axesOf(value: unknown): Array<[string, number]> {
    if (typeof value === 'number') return [['', value]];
    if (value === null || typeof value !== 'object') return [];
    return Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, number] => typeof entry[1] === 'number');
}

function defaultFindings(token: SarakDesignToken): DefaultFinding[] {
    const min = token.constraints?.min ?? token.min ?? PANEL_DEFAULT_MIN;
    const max = token.constraints?.max ?? token.max ?? PANEL_DEFAULT_MAX;
    const step = token.constraints?.step ?? token.step ?? PANEL_DEFAULT_STEP;
    const out: DefaultFinding[] = [];
    for (const [axis, value] of axesOf(token.defaultValue)) {
        const where = { token: token.id, axis, value };
        if (value < min || value > max) out.push({ ...where, motivo: `fora de [${min}, ${max}]` });
        const offGrid = Math.abs((value - min) / step - Math.round((value - min) / step)) > STEP_TOLERANCE;
        if (offGrid) out.push({ ...where, motivo: `fora da grade do passo ${step} (a partir de ${min})` });
    }
    return out;
}

/** Os membros da união `SarakTokenValueType`, lidos do texto (uma fonte só, a do tipo). */
export function schemaTypes(typesText: string): string[] {
    const match = typesText.match(/export type SarakTokenValueType\s*=\s*([^;]+);/);
    if (!match) return [];
    return [...match[1].matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
}

/** Os `case 'x':` do despachante do Command Center. */
export function dynamicBranches(dynamicText: string): Set<string> {
    return new Set([...dynamicText.matchAll(/case\s+'([a-z]+)'\s*:/g)].map((m) => m[1]));
}

/** As chaves de `ControlRegistry` (aba de tema): `chave: (props) =>`. */
export function registryKeys(registryText: string): Set<string> {
    const start = registryText.indexOf('ControlRegistry');
    if (start < 0) return new Set();
    const end = registryText.indexOf('\n};', start);
    const body = registryText.slice(start, end < 0 ? undefined : end);
    return new Set([...body.matchAll(/^\s{4}([a-z]+):\s*\(props\)/gm)].map((m) => m[1]));
}

function controlFindings(sources: ControlSources): { findings: string[]; types: number } {
    const types = schemaTypes(sources.types);
    const dynamic = dynamicBranches(sources.dynamic);
    const registry = registryKeys(sources.registry);
    const findings: string[] = [];
    for (const type of types) {
        if (!dynamic.has(type)) findings.push(`tipo "${type}" sem ramo no DynamicTokenControl`);
        if (!registry.has(type)) findings.push(`tipo "${type}" sem entrada no ControlRegistry`);
    }
    return { findings, types: types.length };
}

function optionFindings(tokens: SarakDesignToken[]): OptionFinding[] {
    const out: OptionFinding[] = [];
    for (const token of tokens) {
        if (token.type !== 'select' && token.type !== 'font') continue;
        for (const option of token.constraints?.options ?? token.options ?? []) {
            if (option.id !== undefined && option.value !== undefined && option.id !== option.value) {
                out.push({ token: token.id, id: option.id, value: option.value });
            }
        }
    }
    return out;
}

export function shippedSources(): ThemeSource[] {
    const partial = (label: string, list: Array<{ id: string; design?: unknown }>): ThemeSource[] =>
        list.map((p) => ({ fonte: `${label}:${p.id}`, design: p.design as Record<string, unknown> }));
    return [
        { fonte: 'defaults', design: sarakGetDefaultDesignState() as Record<string, unknown> },
        ...SARAK_ALL_THEMES.map((theme) => ({ fonte: `tema:${theme.id}`, design: theme.design as Record<string, unknown> })),
        ...partial('preset-card', CARD_PRESETS), ...partial('preset-card-textura', CARD_TEXTURE_PRESETS),
        ...partial('preset-botao', BUTTON_PRESETS), ...partial('preset-botao-estilo', BUTTON_STYLE_PRESETS),
        ...partial('preset-input', INPUT_PRESETS), ...partial('preset-tipografia', TYPOGRAPHY_PRESETS),
        ...partial('preset-midia', MEDIA_PRESETS), ...partial('preset-textura', TEXTURE_PRESETS),
    ];
}

export function readControlSources(root = ROOT): ControlSources {
    const read = (relative: string): string => fs.readFileSync(path.join(root, relative), 'utf8');
    return {
        types: read('src/core/Design/types.ts'),
        dynamic: read('src/features/DesignEngine/components/DynamicTokenControl.tsx'),
        registry: read('src/features/DesignEngine/Main/components/TokenControl.tsx'),
    };
}

export function buildReport({
    tokens = sarakGetAllDesignTokens() as SarakDesignToken[],
    sources = shippedSources(),
    controls = readControlSources(),
}: { tokens?: SarakDesignToken[]; sources?: ThemeSource[]; controls?: ControlSources } = {}): PanelContractReport {
    const numeric = tokens.filter(isNumeric);
    // `auditTokenContract` julga contra o índice REAL do schema; o filtro usa o mesmo, não a lista recebida.
    const numericIds = new Set((sarakGetAllDesignTokens() as SarakDesignToken[]).filter(isNumeric).map((token) => token.id));
    const control = controlFindings(controls);
    return {
        defaults: numeric.flatMap(defaultFindings),
        themes: sources.flatMap(({ fonte, design }) => auditTokenContract(fonte, design)).filter((d) => numericIds.has(d.token)),
        controls: control.findings,
        options: optionFindings(tokens),
        checked: { tokens: numeric.length, sources: sources.length, types: control.types },
    };
}

function main(): void {
    console.log('--- check-panel-contract ---');
    const report = buildReport();
    let failed = false;
    const fail = (title: string, lines: string[]): void => {
        if (lines.length === 0) return;
        failed = true;
        console.log(`[ERROR] ${lines.length} ${title}`);
        lines.slice(0, 60).forEach((line) => console.log(`  - ${line}`));
    };
    fail('padrão(ões) fora da faixa/grade que o painel mostra:', report.defaults.map((d) => `${d.token}${d.axis ? '.' + d.axis : ''} = ${d.value} (${d.motivo})`));
    fail('valor(es) de tema ou preset fora do contrato numérico do token (a validação cortaria em silêncio):', report.themes.map((d) => `[${d.fonte}] ${d.token} = ${JSON.stringify(d.valor)} (${d.motivo})`));
    fail('tipo(s) do schema sem controle no painel:', report.controls);
    fail('opção(ões) com id diferente de value (o controle grava um e a validação confere o outro):', report.options.map((o) => `${o.token}: id "${o.id}" ≠ value "${o.value}"`));
    if (failed) process.exit(1);
    const { tokens, sources, types } = report.checked;
    console.log(`[OK] ${tokens} tokens numéricos com padrão na faixa; ${sources} fontes de tema dentro do contrato; ${types} tipos com controle.`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
    main();
}
