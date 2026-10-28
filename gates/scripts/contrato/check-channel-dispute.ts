// Injeção sem disputa de canal — duas regras, um script (o motor de variáveis e o injetor do documento):
//
//   (i)  UM CANAL POR VARIÁVEL. O motor entrega valor escalar por estilo inline (`html`/`body`, ou a ilha) e
//        valor responsivo por `<style>` com `@media`. O inline vence o `<style>`; então uma variável escrita
//        nos dois canais é decidida pelo canal, não pelo que o tema declarou. O caso real foi o raio mestre
//        escalar (o padrão da maioria dos temas) com o canto responsivo: o canto editado não aparecia no
//        Modo App. A regra confere, para cada par mestre + exceção do schema e para os três formatos de
//        cada um (ausente, escalar, responsivo), que nenhum nome está nos dois canais e que o valor que
//        chega em cada ponto (mob, tab, desk) é o da exceção declarada, ou o do mestre.
//   (ii) VARIÁVEL INLINE ÓRFÃ. Trocar de tema deixa no `html`/`body` exatamente o que o tema novo escreveria
//        montado do zero. Sem isso o inline do tema anterior segue vencendo o `<style>` do novo.
//
// Uso: `npx tsx gates/scripts/contrato/check-channel-dispute.ts`. Toda disputa e todo órfão é bloqueio.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. (i) só julga os pares mestre + exceção do schema (`exceptionOf`) — o único caso em que duas fichas do
//    schema escrevem o mesmo nome por desenho; o nome com dois donos fora desse par é do
//    `variable-contract:check`. Disputa entre uma variável do schema e um nome escrito fora do laço de
//    tokens (alias, derivado) não é vista.
// 2. (i) confere o que o MOTOR escreve — `variables` e `responsiveCSS` —, não a cascata do navegador, a ordem
//    das camadas nem o modo Embarcado (ilha + regra `.sarak-scope`); o computado, nos dois modos, é de
//    `browser-tests/injecao-sem-disputa.spec.ts`. Os três pontos são lidos do CSS na ordem em que o motor o
//    monta (raiz, `@media` do tablet, `@media` do desktop); outra ordem de emissão quebra o parser.
// 3. (ii) exercita `syncInjectedWrites` — a função que o `DesignInjector` chama por elemento — sobre um
//    elemento de mentira, sem DOM: não prova que o componente a chama (isso é do teste do injetor e de
//    `browser-tests/injecao-sem-disputa.spec.ts`), nem a ilha do Modo Embarcado (mesma função), nem
//    `--mouse-x`/`--sarak-light-*`, que não são do mapa de tokens. Cobre as transições de `buildScenarios`
//    (duas sintéticas de formato e o anel dos temas entregues, de um para o seguinte), não toda combinação.
// 4. Não vê estilo escrito por outro código (`DesignScope`, componente): só o injetor do documento.
// -------------------------------------------------------------------------
import React from 'react';
import { renderToString } from 'react-dom/server';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sarakGetAllDesignTokens, sarakGetDefaultDesignState } from '../../../src/core/Design/master-map';
import { useDesignVariables } from '../../../src/core/Design/hooks/useDesignVariables';
import { SARAK_ALL_THEMES } from '../../../src/core/Design/presets/themes/all';
import { composeThemeForMode } from '../../../src/core/Design/presets/themes/compose';
import { syncInjectedWrites, type InjectionHost } from '../../../src/core/Provider/utils/injectedWrites';

type Design = Record<string, unknown>;
type Point = 'mob' | 'tab' | 'desk';
type Format = 'ausente' | 'escalar' | 'responsivo';

export interface EngineOutput {
    variables: Record<string, string>;
    attributes: Record<string, string>;
    responsiveCSS: string;
}
export type EngineBuild = (design: Design) => EngineOutput;

export interface SchemaToken {
    id: string;
    cssVars?: string[];
    defaultValue: unknown;
    exceptionOf?: string;
    isResponsive?: boolean;
    unit?: string;
}

export interface Dispute {
    where: string;
    variable: string;
    kind: 'dois-canais' | 'valor-errado';
    detail: string;
}

export interface Orphan {
    scenario: string;
    names: string[];
}

const POINTS: Point[] = ['mob', 'tab', 'desk'];
const FORMATS: Format[] = ['ausente', 'escalar', 'responsivo'];

/** O motor real, chamado fora de um componente como o gerador do kit do consumidor o chama. */
export const buildFromHook: EngineBuild = (design) => {
    let generated: EngineOutput | undefined;
    const Capture = (): null => {
        generated = useDesignVariables(design) as EngineOutput;
        return null;
    };
    renderToString(React.createElement(Capture));
    if (!generated) throw new Error('[channel-dispute] O motor não devolveu variáveis.');
    return generated;
};

/** `{ mob, tab, desk }` → o que cada ponto declara, na ordem em que o motor monta o CSS. */
export function responsiveByPoint(css: string): Record<Point, Record<string, string>> {
    const blocks = [...css.matchAll(/\{([^{}]*)\}/g)].map((match) => match[1]);
    // O motor monta: raiz, `@media` tablet, `@media` desktop (cada bloco interno é o de uma regra).
    const declarations = (block: string | undefined): Record<string, string> =>
        Object.fromEntries(
            [...(block ?? '').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]),
        );
    return { mob: declarations(blocks[0]), tab: declarations(blocks[1]), desk: declarations(blocks[2]) };
}

const numericAt = (value: unknown, point: Point): number | undefined => {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object') {
        const at = (value as Record<string, unknown>)[point];
        return typeof at === 'number' ? at : undefined;
    }
    return undefined;
};

/** Um valor DECLARADO (diferente do padrão do schema) no formato pedido; `seed` separa mestre e exceção. */
function declared(format: Format, seed: number): unknown {
    if (format === 'ausente') return undefined;
    if (format === 'escalar') return 5 + seed;
    return { mob: 1 + seed, tab: 2 + seed, desk: 3 + seed };
}

const withUnit = (token: SchemaToken, value: number | undefined): string | undefined =>
    value === undefined ? undefined : `${value}${token.unit ?? ''}`;

/** O valor que o navegador computa para `name` num ponto: o inline vence, e na falta dele vale o `<style>`. */
function effective(out: EngineOutput, name: string, point: Point): string | undefined {
    return out.variables[name] ?? responsiveByPoint(out.responsiveCSS)[point][name];
}

function namesInBothChannels(out: EngineOutput): string[] {
    const responsive = new Set(POINTS.flatMap((point) => Object.keys(responsiveByPoint(out.responsiveCSS)[point])));
    return Object.keys(out.variables).filter((name) => responsive.has(name));
}

function exceptionPairs(tokens: SchemaToken[]): Array<{ master: SchemaToken; exception: SchemaToken }> {
    return tokens
        .filter((token) => token.exceptionOf)
        .flatMap((exception) => {
            const master = tokens.find((token) => token.id === exception.exceptionOf);
            return master ? [{ master, exception }] : [];
        });
}

function checkPair(
    pair: { master: SchemaToken; exception: SchemaToken },
    formats: [Format, Format],
    base: Design,
    build: EngineBuild,
): Dispute[] {
    const { master, exception } = pair;
    const [masterFormat, exceptionFormat] = formats;
    const masterValue = declared(masterFormat, 10);
    const exceptionValue = declared(exceptionFormat, 20);
    const design: Design = { ...base };
    if (masterValue !== undefined) design[master.id] = masterValue;
    if (exceptionValue !== undefined) design[exception.id] = exceptionValue;
    const out = build(design);
    const where = `${master.id}=${masterFormat} + ${exception.id}=${exceptionFormat}`;
    const found: Dispute[] = [];

    for (const name of namesInBothChannels(out)) {
        found.push({ where, variable: name, kind: 'dois-canais', detail: 'escrita no inline e no <style> ao mesmo tempo' });
    }
    // O valor que chega à variável do canto: o da exceção, quando declarada, e o do mestre no resto.
    const owner = exceptionValue !== undefined ? exceptionValue : masterValue;
    if (owner === undefined) return found;
    for (const name of exception.cssVars ?? []) {
        for (const point of POINTS) {
            const expected = withUnit(exception, numericAt(owner, point));
            const actual = effective(out, name, point);
            if (actual !== expected) {
                found.push({ where, variable: name, kind: 'valor-errado', detail: `${point}: esperado ${expected}, chegou ${actual}` });
            }
        }
    }
    return found;
}

/** (i) Nenhuma variável nos dois canais e o valor declarado chega a cada ponto, em todo par de formatos. */
export function findChannelDisputes(
    tokens: SchemaToken[],
    defaults: Design,
    build: EngineBuild = buildFromHook,
): Dispute[] {
    const found: Dispute[] = [];
    for (const pair of exceptionPairs(tokens)) {
        for (const masterFormat of FORMATS) {
            for (const exceptionFormat of FORMATS) {
                found.push(...checkPair(pair, [masterFormat, exceptionFormat], defaults, build));
            }
        }
    }
    return found;
}

// ----------------------------------------------------------------------------- (ii) inline órfão

export interface Scenario {
    name: string;
    from: Design;
    to: Design;
}

/** Quem escreve as variáveis num elemento: o `syncInjectedWrites` do injetor, ou uma versão plantada com defeito. */
export type InjectionWriter = (
    host: InjectionHost,
    variables: Record<string, string>,
    attributes: Record<string, string>,
) => void;

/** Um elemento de mentira com o mesmo contrato mínimo do `HTMLElement` que o injetor usa. */
class FakeHost implements InjectionHost {
    readonly properties = new Map<string, string>();
    readonly attributeMap = new Map<string, string>();
    readonly style = {
        getPropertyValue: (name: string): string => this.properties.get(name) ?? '',
        setProperty: (name: string, value: string): void => void this.properties.set(name, value),
        removeProperty: (name: string): string => {
            const previous = this.properties.get(name) ?? '';
            this.properties.delete(name);
            return previous;
        },
    };
    getAttribute = (name: string): string | null => this.attributeMap.get(name) ?? null;
    setAttribute = (name: string, value: string): void => void this.attributeMap.set(name, value);
    removeAttribute = (name: string): void => void this.attributeMap.delete(name);

    snapshot(): Record<string, string> {
        return {
            ...Object.fromEntries([...this.properties].map(([name, value]) => [name, value])),
            ...Object.fromEntries([...this.attributeMap].map(([name, value]) => [`[${name}]`, value])),
        };
    }
}

/** (ii) Depois de A→B, o elemento tem só o que B escreveria montado do zero (mesmos nomes e mesmos valores). */
export function findOrphanWrites(
    scenarios: Scenario[],
    write: InjectionWriter = syncInjectedWrites,
    build: EngineBuild = buildFromHook,
): Orphan[] {
    const found: Orphan[] = [];
    for (const scenario of scenarios) {
        const from = build(scenario.from);
        const to = build(scenario.to);
        const fresh = new FakeHost();
        write(fresh, to.variables, to.attributes);
        const switched = new FakeHost();
        write(switched, from.variables, from.attributes);
        write(switched, to.variables, to.attributes);
        const expected = fresh.snapshot();
        const actual = switched.snapshot();
        const orphaned = Object.keys(actual).filter((name) => !(name in expected));
        const stale = Object.keys(expected).filter((name) => actual[name] !== expected[name]);
        if (orphaned.length > 0 || stale.length > 0) {
            found.push({ scenario: scenario.name, names: [...new Set([...orphaned, ...stale])].sort() });
        }
    }
    return found;
}

/** As transições medidas: as sintéticas de formato e as de um tema entregue para o seguinte (em anel). */
export function buildScenarios(defaults: Design, themes: Array<{ id: string; design: Design }>): Scenario[] {
    const synthetic: Scenario[] = [
        {
            name: 'mestre escalar + canto escalar → mestre responsivo, canto ausente',
            from: { ...defaults, cardBorderRadius: 20, cardRadiusTL: 3, btnBorderRadius: 30, btnRadiusTR: 4 },
            to: { ...defaults, cardBorderRadius: { mob: 10, tab: 14, desk: 18 }, btnBorderRadius: { mob: 12, tab: 16, desk: 20 } },
        },
        {
            name: 'mestre responsivo + canto responsivo → mestre escalar, canto ausente',
            from: { ...defaults, cardBorderRadius: { mob: 10, tab: 14, desk: 18 }, cardRadiusTL: { mob: 2, tab: 4, desk: 6 } },
            to: { ...defaults, cardBorderRadius: 20 },
        },
    ];
    const ring = themes.map((theme, index): Scenario => ({
        name: `${theme.id} → ${themes[(index + 1) % themes.length].id}`,
        from: { ...defaults, ...theme.design },
        to: { ...defaults, ...themes[(index + 1) % themes.length].design },
    }));
    return [...synthetic, ...ring];
}

function main(): void {
    console.log('--- check-channel-dispute ---');
    const tokens = sarakGetAllDesignTokens() as unknown as SchemaToken[];
    const defaults = sarakGetDefaultDesignState() as unknown as Design;
    let failed = false;

    const disputes = findChannelDisputes(tokens, defaults);
    if (disputes.length > 0) {
        failed = true;
        console.log(`[ERROR] ${disputes.length} disputa(s) de canal (a mesma variável no inline e no <style>, ou valor que não é o declarado):`);
        disputes.slice(0, 20).forEach((dispute) => console.log(`  - ${dispute.where} :: ${dispute.variable} (${dispute.kind}) ${dispute.detail}`));
    }

    // O design composto no modo nativo: o que o Provider escreve no html/body inclui as cores que a paleta calcula.
    const themes = SARAK_ALL_THEMES.map((theme) => ({
        id: theme.id,
        design: composeThemeForMode({ design: theme.design as Record<string, never>, contraparte: theme.contraparte }, theme.design.mode === 'light' ? 'light' : 'dark') as unknown as Design,
    }));
    const orphans = findOrphanWrites(buildScenarios(defaults, themes));
    if (orphans.length > 0) {
        failed = true;
        console.log(`[ERROR] ${orphans.length} troca(s) de tema deixam variável/atributo do tema anterior no html/body:`);
        orphans.slice(0, 20).forEach((orphan) => console.log(`  - ${orphan.scenario}: ${orphan.names.join(', ')}`));
    }

    if (failed) process.exit(1);
    const pairs = exceptionPairs(tokens).length;
    console.log(`\n[OK] ${pairs} par(es) mestre+exceção em 9 formatos sem disputa de canal; ${themes.length + 2} troca(s) de tema sem inline órfão.`);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '');
if (isMain) {
    main();
}
