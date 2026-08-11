// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este verificador NÃO vê
// -------------------------------------------------------------------------
// 1. Só resolve HEX (#rgb/#rrggbb), rgb()/rgba() e a palavra `transparent`.
//    `hsl()`, `var()`, gradiente ou qualquer valor não-parseável faz o par
//    ser DECLARADO como pulado (não determinístico) — nunca chuta uma cor.
// 2. A composição de alfa usa a CADEIA declarada em `PAIRS[].bgChain`
//    (o token de fundo + as bases que o sustentam, da mais próxima à mais
//    distante). Se o último elo da cadeia ainda resolver translúcido, o par
//    é declarado como pulado — este verificador nunca presume um fundo além
//    do que a cadeia descreve.
// 3. Cobre só os PARES desta lista — não "todo par possível entre token de
//    cor de texto e token de cor de fundo". A lista foi levantada cruzando
//    `catalog/partitions` (categorias + `relatedTokens`), a própria
//    `description` de cada token no schema (vários já declaram contra qual
//    fundo o autor pretendeu o contraste) e o código real dos componentes
//    (ex. `SarakDataTableImpl.tsx`) — não um snapshot de render do
//    `PreviewCanvas`, que não existe hoje para contraste. Pares fora desta
//    lista (ícone, indicador de estado, borda, elemento decorativo — não são
//    texto) estão fora do ESCOPO da R31 por definição ("pares texto/fundo"),
//    não "não determinados"; ver o veredito do revisor em §11 de
//    `specs/plan/plan-24-aplicacao-de-temas.md` para a lista completa dos
//    excluídos e o motivo de cada um.
// 4. Limiar único: 4,5:1 (texto normal) para TODOS os pares — decisão do
//    dono (`plan-24` §2.5 resposta 2): não relaxar `textColorMuted` para
//    3:1, porque ele renderiza em 9–14px, abaixo do piso de "texto grande"
//    que a WCAG exige para o limiar mais frouxo.
// 5. `statusErrorColor`/`statusSuccessColor` SÃO cor de texto de verdade
//    (`color:` explícito em `SarakForm.tsx:107`, `SarakTable.tsx:72`,
//    `ManagementGroupCard.tsx:120`, `SarakPDFViewerImpl.tsx:142` — medido:
//    reprovam em 7/18 e 5/18 temas) e ainda assim NÃO entraram em `PAIRS`.
//    O fundo real desses usos é `--sarak-status-error-color-bg` /
//    `--sarak-status-success-color-bg`; `generateVariants` só existe hoje em
//    `primaryColor`, `secondaryColor`, `tertiaryColor` e `cardBackgroundColor`
//    (`useDesignVariables.ts:118`) — essa variável de fundo NUNCA é emitida, o
//    fallback (`rgba(239,68,68,0.1)`/equivalente verde) sempre vence. Incluir
//    o par travaria no baseline um fundo que TEMA NENHUM consegue mudar: o
//    gate acusaria o tema por um defeito do componente, não do tema. Fica
//    fora, declarado com o número — não é "não determinado", é "o par mede
//    algo que o autor do tema não controla".
// 6. [RESOLVIDO na plan-24-1, Decisão D] Até a `plan-24-1`, `useDesignVariables`
//    chamava `syncThemeWithMode` SEM CONDIÇÃO, e o token escrito podia
//    divergir do emitido (medido então: 178/648 veredictos divergentes). A
//    Decisão D fez `syncThemeWithMode` só agir quando o modo pedido DIFERE
//    do nativo do tema (`useDesignVariables.ts` — a chamada saiu de lá;
//    `ShellThemeToggle.tsx` é o único lugar que ainda a invoca, de propósito,
//    ao trocar de modo). No modo nativo, cru = emitido, e esta 1ª passada
//    mede exatamente o que a tela mostra.
// 7. [Decisão C + 2ª passada, plan-24-1] Este verificador roda DUAS vezes:
//    `auditTheme` mede o modo NATIVO (o que a Decisão D garante que é
//    fielmente o que a tela mostra sem troca de modo); `auditThemeOppositeMode`
//    mede a CONTRAPARTE gerada por `syncThemeWithMode` no modo oposto —
//    território que, antes da `plan-24-1`, não tinha medição nenhuma. A
//    Decisão C (`color-engine.ts`, `ON_PRIMARY_TEXT_PAIRS`) faz o texto que
//    senta sobre uma primária (`btnPrimaryText`, `cardActionBtnText`,
//    `navItemActiveColor`) calcular a luminosidade contra o fundo JÁ
//    deslocado, em vez da faixa fixa `text`/`primary` que se sobrepunha.
//    Fundo translúcido nessa 2ª passada é composto sobre `colorBgBody` já
//    deslocado (mesma convenção do solucionador) — não é a cadeia completa
//    de `PAIRS[].bgChain` (o motor não tem acesso a ela em runtime), então
//    um card aninhado em múltiplas camadas translúcidas pode divergir
//    ligeiramente do que a 1ª passada mediria para o mesmo par no nativo.
// 8. [plan-26] `auditThemeOppositeMode` passa a chamar `resolveThemeForMode`
//    em vez de `syncThemeWithMode` direto: quando o tema declara
//    `contraparte`, é ELA que é medida (o bloco autorado, não o sintetizado)
//    — a 2ª passada deixou de medir só o que a lib deriva e passa a medir o
//    que alguém escreveu. `syncThemeWithMode` só entra para os temas SEM
//    contraparte (a lista de isenção em `CONTRAPARTE_EXEMPTION_LIST`).
// 9. [plan-26] `auditContraparteRequired` só vê `GLOBAL_THEMES` — tema do
//    CONSUMIDOR (fora do catálogo shippado) nunca é cobrado a ter
//    `contraparte`; é dado de terceiro, mesma fronteira da R31 (§ acima).
// -------------------------------------------------------------------------
import { getDefaultDesignState } from '../../../src/core/Design/master-map.ts';
import { GLOBAL_THEMES, type ThemePreset } from '../../../src/core/Design/presets/themes/index.ts';
import { resolveThemeForMode } from '../../../src/core/Design/presets/themes/color-engine.ts';

export interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface ContrastPair {
    /** tokenId da cor de TEXTO. */
    fg: string;
    /**
     * Cadeia de tokenId do fundo, da camada mais PRÓXIMA do texto até a mais
     * distante. Cada elo translúcido é composto sobre o próximo; o último
     * elo precisa resolver opaco, ou o par é declarado como pulado.
     */
    bgChain: string[];
    /** Razão mínima exigida (sempre 4.5 nesta plan — ver LIMITES DECLARADOS item 4). */
    min: number;
}

/** Os pares REAIS levantados para a R31 — ver o relatório da PARADA OBRIGATÓRIA. */
export const PAIRS: ContrastPair[] = [
    // Grupo A — texto estrutural/genérico, sobre as superfícies onde ele de fato renderiza.
    { fg: 'textColorMaster', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['colorBgLayer1'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['colorBgLayer2'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['colorBgModal', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['sidebarColor'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['topbarColor'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['colorBgModal', 'colorBgBody'], min: 4.5 },
    // `--theme-muted`/secondary é a cor de texto dominante do Shell
    // (ShellSearchWidget:45, ShellUserWidget:71, ShellThemeToggle:27) — renderiza
    // sobre as 4 superfícies estruturais que faltavam (layers + chrome).
    { fg: 'textColorSecondary', bgChain: ['colorBgLayer1', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['colorBgLayer2', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['colorBgModal', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['colorBgLayer1', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['colorBgLayer2', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'titleColor', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'titleColor', bgChain: ['surfaceColor'], min: 4.5 },
    { fg: 'titleColor', bgChain: ['tableHeaderBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    // `_typography.css:2-4` pinta h1–h6 com `--text-title` → `--sarak-title-color`:
    // todo título dentro de card ou modal é este par.
    { fg: 'titleColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'titleColor', bgChain: ['colorBgModal', 'colorBgBody'], min: 4.5 },

    // Grupo B — texto de componente específico, par declarado na própria
    // `description` do schema (ou óbvio pelo agrupamento do componente).
    { fg: 'cardTitleColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'cardActionBtnText', bgChain: ['cardActionBtnPrimaryBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'cardActionBtnText', bgChain: ['cardActionBtnHoverBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'cardSearchTextFocusColor', bgChain: ['cardSearchBgFocus', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'btnPrimaryText', bgChain: ['btnPrimaryBg'], min: 4.5 },
    { fg: 'inputTextColor', bgChain: ['inputBg', 'colorBgBody'], min: 4.5 },
    { fg: 'topbarTitleColor', bgChain: ['topbarColor'], min: 4.5 },
    { fg: 'tooltipTextColor', bgChain: ['tooltipBg', 'colorBgBody'], min: 4.5 },
    { fg: 'navItemActiveColor', bgChain: ['sidebarActiveColor', 'sidebarColor'], min: 4.5 },
    { fg: 'navItemActiveColor', bgChain: ['topbarActiveColor', 'topbarColor'], min: 4.5 },
];

const HEX6_RE = /^#([0-9a-fA-F]{6})$/;
const HEX3_RE = /^#([0-9a-fA-F]{3})$/;
const HEX8_RE = /^#([0-9a-fA-F]{8})$/;
const RGBA_RE = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/;

/** Só HEX, rgb()/rgba() e `transparent` — o resto é declarado não-parseável (LIMITE 1). */
export function parseColor(raw: unknown): Rgba | null {
    if (typeof raw !== 'string') return null;
    const value = raw.trim();
    if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

    const hex8 = value.match(HEX8_RE);
    if (hex8) {
        const int = parseInt(hex8[1], 16);
        return { r: (int >>> 24) & 255, g: (int >>> 16) & 255, b: (int >>> 8) & 255, a: (int & 255) / 255 };
    }
    const hex6 = value.match(HEX6_RE);
    if (hex6) {
        const int = parseInt(hex6[1], 16);
        return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255, a: 1 };
    }
    const hex3 = value.match(HEX3_RE);
    if (hex3) {
        const [r, g, b] = hex3[1].split('').map((c) => parseInt(c + c, 16));
        return { r, g, b, a: 1 };
    }
    const rgba = value.match(RGBA_RE);
    if (rgba) {
        const [, r, g, b, a] = rgba;
        return { r: Number(r), g: Number(g), b: Number(b), a: a === undefined ? 1 : Number(a) };
    }
    return null;
}

/** `efetiva = alfa × cor + (1 − alfa) × fundo` — canal a canal (plan-24 §3.4). */
export function compositeOverOpaque(top: Rgba, bottomRgb: [number, number, number]): [number, number, number] {
    const mix = (channel: 'r' | 'g' | 'b', i: number) => top.a * top[channel] + (1 - top.a) * bottomRgb[i];
    return [mix('r', 0), mix('g', 1), mix('b', 2)];
}

export type ChainResolution = { ok: true; rgb: [number, number, number] } | { ok: false; reason: string };

/** Resolve uma cadeia de fundo (mais próximo → mais distante) para RGB opaco, ou declara por quê não deu. */
export function resolveChain(chain: string[], design: Record<string, unknown>): ChainResolution {
    const colors = chain.map((tokenId) => ({ tokenId, color: parseColor(design[tokenId]) }));
    const unparseable = colors.find((c) => c.color === null);
    if (unparseable) return { ok: false, reason: `valor não parseável em "${unparseable.tokenId}": ${JSON.stringify(design[unparseable.tokenId])}` };

    const last = colors[colors.length - 1].color as Rgba;
    if (last.a < 0.999) {
        return { ok: false, reason: `a base final da cadeia ("${colors[colors.length - 1].tokenId}") ainda é translúcida (alfa ${last.a})` };
    }

    let rgb: [number, number, number] = [last.r, last.g, last.b];
    for (let i = colors.length - 2; i >= 0; i -= 1) {
        rgb = compositeOverOpaque(colors[i].color as Rgba, rgb);
    }
    return { ok: true, rgb };
}

const relativeLuminance = (rgb: [number, number, number]): number => {
    const channel = (c: number) => {
        const cs = c / 255;
        return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
};

/** Luminância relativa sRGB padrão WCAG 2.x → razão de contraste. */
export function contrastRatio(rgbA: [number, number, number], rgbB: [number, number, number]): number {
    const [lA, lB] = [relativeLuminance(rgbA), relativeLuminance(rgbB)];
    const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
    return (lighter + 0.05) / (darker + 0.05);
}

export type PairResult =
    | { pair: ContrastPair; pulado: false; ratio: number; pass: boolean }
    | { pair: ContrastPair; pulado: true; motivo: string };

/** Avalia UM par contra UM tema já mesclado com os defaults (`getDefaultDesignState()`). */
export function evaluatePair(pair: ContrastPair, design: Record<string, unknown>): PairResult {
    const bg = resolveChain(pair.bgChain, design);
    if (!bg.ok) return { pair, pulado: true, motivo: bg.reason };

    const fgColor = parseColor(design[pair.fg]);
    if (!fgColor) return { pair, pulado: true, motivo: `valor de texto não parseável em "${pair.fg}": ${JSON.stringify(design[pair.fg])}` };

    const fgRgb: [number, number, number] = fgColor.a >= 0.999 ? [fgColor.r, fgColor.g, fgColor.b] : compositeOverOpaque(fgColor, bg.rgb);
    const ratio = contrastRatio(fgRgb, bg.rgb);
    return { pair, pulado: false, ratio, pass: ratio >= pair.min };
}

export interface ThemeReport {
    id: string;
    resultados: PairResult[];
    falhas: Extract<PairResult, { pulado: false }>[];
    pulados: Extract<PairResult, { pulado: true }>[];
}

export function auditTheme(theme: ThemePreset): ThemeReport {
    const design = { ...getDefaultDesignState(), ...(theme.design as Record<string, unknown>) };
    const resultados = PAIRS.map((pair) => evaluatePair(pair, design));
    return {
        id: theme.id,
        resultados,
        falhas: resultados.filter((r): r is Extract<PairResult, { pulado: false }> => !r.pulado && !r.pass),
        pulados: resultados.filter((r): r is Extract<PairResult, { pulado: true }> => r.pulado),
    };
}

/**
 * SEGUNDA PASSADA (plan-24-1 §3.1 item 8) — mede também o MODO OPOSTO ao
 * nativo do tema. Antes da Decisão D, o modo nativo já emitia diferente do
 * escrito (§11.2 do veredito da plan-24); depois de D, a troca de modo virou
 * território sem medição nenhuma. Reusa o MESMO `PAIRS`/`evaluatePair` da 1ª
 * passada; não muda a medição nativa, só acrescenta esta.
 *
 * plan-26: passa a medir a contraparte AUTORADA quando o tema a declara —
 * via `resolveThemeForMode`, a mesma função que o motor usa em runtime — em
 * vez de sempre sintetizar com `syncThemeWithMode`. Só cai no sintetizado
 * para os temas SEM `contraparte` (os 18 legados, fallback deliberado).
 */
export function auditThemeOppositeMode(theme: ThemePreset): ThemeReport {
    const design = { ...getDefaultDesignState(), ...(theme.design as Record<string, unknown>) };
    const nativeMode = (design.mode as 'light' | 'dark') || 'dark';
    const oppositeMode = nativeMode === 'dark' ? 'light' : 'dark';
    const shifted = resolveThemeForMode({ design, contraparte: theme.contraparte }, oppositeMode);
    const resultados = PAIRS.map((pair) => evaluatePair(pair, shifted));
    return {
        id: theme.id,
        resultados,
        falhas: resultados.filter((r): r is Extract<PairResult, { pulado: false }> => !r.pulado && !r.pass),
        pulados: resultados.filter((r): r is Extract<PairResult, { pulado: true }> => r.pulado),
    };
}

/**
 * Os 18 temas legados que a `plan-25` mediu como grupo de controle — a ÚNICA
 * lista de isenção da exigência de `contraparte` (plan-26 §2.4, decisão 2 do
 * dono). Ela SÓ PODE ENCOLHER: autorar contraparte para um destes é permitido
 * (e o retira da lista numa plan futura); crescer exigiria justificativa nova.
 */
export const CONTRAPARTE_EXEMPTION_LIST: readonly string[] = [
    'sarak-sovereign',
    'crystal-glass',
    'cyberpunk-neon',
    'holographic-glass',
    'industrial-terminal',
    'nature-breeze',
    'neo-brutalism',
    'synthwave-retro',
    'nebula-space',
    'dot-matrix-elegant',
    'stellar-nebula',
    'kinetic-flow',
    'cyber-retro-wave',
    'minimalist-airy',
    'data-terminal',
    'neumorphic-mobile',
    'industrial-dashboard',
    'asymmetric-editorial',
];

export interface ContraparteAudit {
    isentos: string[];
    faltando: string[];
}

/**
 * O GATE que EXIGE `contraparte` (plan-26 §2.4/§3.1 item 6). Todo tema fora
 * da lista de isenção acima e sem `contraparte` é uma violação — a mesma
 * regressão que esta plan conserta reapareceria em silêncio no primeiro tema
 * novo que alguém esquecesse de autorar.
 */
export function auditContraparteRequired(themes: ThemePreset[]): ContraparteAudit {
    const isentos = themes.filter((t) => CONTRAPARTE_EXEMPTION_LIST.includes(t.id)).map((t) => t.id);
    const faltando = themes
        .filter((t) => !CONTRAPARTE_EXEMPTION_LIST.includes(t.id) && !t.contraparte)
        .map((t) => t.id);
    return { isentos, faltando };
}

function formatPair(pair: ContrastPair): string {
    return `${pair.fg} / ${pair.bgChain[0]}`;
}

function printPass(reports: ThemeReport[], label: string): { temasComFalha: number; totalFalhas: number; totalPulados: number } {
    console.log(`\n--- ${label} ---`);
    let temasComFalha = 0;
    let totalFalhas = 0;
    let totalPulados = 0;

    for (const report of reports) {
        if (report.falhas.length === 0) {
            console.log(`[OK]   ${report.id}`);
        } else {
            temasComFalha += 1;
            console.log(`[FAIL] ${report.id}`);
            for (const f of report.falhas) {
                console.log(`   - ${formatPair(f.pair)}: ${f.ratio.toFixed(2)}:1 (mín. ${f.pair.min}:1)`);
            }
        }
        totalFalhas += report.falhas.length;
        totalPulados += report.pulados.length;
    }

    console.log(`\n${temasComFalha} de ${reports.length} temas com pelo menos 1 par abaixo de AA.`);
    console.log(`${totalFalhas} par(es)-tema reprovado(s) no total; ${totalPulados} par(es)-tema pulado(s) (fundo não determinístico).`);
    return { temasComFalha, totalFalhas, totalPulados };
}

function printContraparteAudit(audit: ContraparteAudit, total: number): boolean {
    console.log('\n--- Exigência de CONTRAPARTE (plan-26) ---');
    console.log(`${audit.isentos.length} tema(s) isento(s) (legados, plan-25): ${audit.isentos.join(', ')}`);
    const autorados = total - audit.isentos.length - audit.faltando.length;
    console.log(`${autorados} tema(s) com contraparte autorada.`);
    // A contagem sai SEMPRE (sucesso ou falha) — `check-audit-baseline.mjs`
    // lê este número por regex, e métrica ausente no caminho feliz vira
    // "não consegui ler a saída" (R20, fail-closed), bloqueando à toa.
    console.log(`${audit.faltando.length} tema(s) SEM contraparte e fora da isenção.`);
    if (audit.faltando.length > 0) {
        console.log(`❌ Faltando em: ${audit.faltando.join(', ')}`);
        return false;
    }
    console.log('✅ Nenhum tema fora da isenção está sem contraparte.');
    return true;
}

function main() {
    console.log('--- Verificador de Contraste WCAG AA nos temas de referência (R31) ---\n');
    console.log(`${PAIRS.length} pares reais cobertos, limiar 4,5:1 em todos.\n`);

    const nativo = printPass(GLOBAL_THEMES.map(auditTheme), 'MODO NATIVO');
    const oposto = printPass(GLOBAL_THEMES.map(auditThemeOppositeMode), 'MODO OPOSTO (segunda passada — contraparte autorada quando existe, plan-26)');
    console.log(`\n${oposto.totalFalhas} par(es)-tema reprovado(s) no MODO OPOSTO.`);

    const contraparteOk = printContraparteAudit(auditContraparteRequired(GLOBAL_THEMES), GLOBAL_THEMES.length);

    if (nativo.temasComFalha === 0 && oposto.temasComFalha === 0 && contraparteOk) {
        console.log('\n✅ Todos os temas de referência passam AA nos pares cobertos, nos dois modos, e todo tema não isento tem contraparte.');
        process.exit(0);
    } else {
        console.log(`\n❌ R31: ${nativo.temasComFalha} tema(s) abaixo de AA no nativo, ${oposto.temasComFalha} no oposto${contraparteOk ? '' : ', e há tema(s) sem contraparte exigida'}.`);
        process.exit(1);
    }
}

// Guarda de execução direta — sem isto, o teste do próprio gate (que importa
// `PAIRS`/`evaluatePair` etc.) rodaria `main()` como efeito colateral do import.
const isMain = /verify_contrast\.ts$/.test(process.argv[1] ?? '');
if (isMain) {
    main();
}
