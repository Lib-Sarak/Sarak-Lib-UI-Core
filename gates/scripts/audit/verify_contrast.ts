// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este verificador NÃO vê
// -------------------------------------------------------------------------
// 1. Só resolve HEX (#rgb/#rrggbb), rgb()/rgba() e a palavra `transparent`, mais os
//    `var(--theme-…)` que apontam para outro TOKEN de cor do próprio tema
//    (`THEME_VAR_TOKENS`: o padrão de `tooltipBg` é `var(--theme-surface)`). `hsl()`,
//    qualquer outro `var()`, gradiente ou valor não-parseável faz o par ser
//    DECLARADO como pulado (não determinístico) — nunca chuta uma cor.
// 2. A composição de alfa usa a CADEIA declarada em `PAIRS[].bgChain`
//    (o token de fundo + as bases que o sustentam, da mais próxima à mais
//    distante). Se o último elo da cadeia ainda resolver translúcido, o par
//    é declarado como pulado — este verificador nunca presume um fundo além
//    do que a cadeia descreve. Toda cadeia de `PAIRS` termina em `colorBgBody`,
//    a base que a pilha real de superfícies sempre tem por baixo (barra, botão,
//    superfície ou card translúcidos compõem sobre ela); o par só volta a ser
//    pulado se um tema declarar o PRÓPRIO `colorBgBody` translúcido ou não
//    parseável. O botão primário (`btnPrimaryBg`) pode sentar sobre card ou
//    modal, não só sobre o corpo: a cadeia usa o corpo por ser a base comum
//    — um botão translúcido sobre um card de cor muito diferente do corpo
//    seria medido contra o fundo errado.
// 3. Cobre só os PARES desta lista — não "todo par possível entre token de
//    cor de texto e token de cor de fundo". A lista passou a
//    medir os pares QUE OS COMPONENTES DESENHAM, levantados em
//    `src/components/**` (grupo C abaixo): o texto sobre cor sólida de badge,
//    botão de perigo/sucesso e bolha do chat, o badge suave (a cor sobre a
//    própria tinta a 10%), o texto de erro de campo, o hover de item de
//    navegação e da linha de tabela, o item de matriz e o botão secundário.
//    A lista foi levantada cruzando
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
// 3a. [lote 4] Dois tipos novos de elo/texto. (i) Um elo da cadeia `token@0.1` é a
//    cor do token com o alfa MULTIPLICADO por 0,1 — a tinta que o componente
//    compõe com `color-mix(<cor> 10%, transparent)`. (ii) Um texto `on:<token>`
//    é o texto que o MOTOR escolhe sobre a cor sólida do token (`pickOnColor`,
//    a mesma função de `useDesignVariables`, `--sarak-on-*`): o par mede a
//    razão do texto ESCOLHIDO. Esse par passa por construção (o escolhido é o
//    de maior contraste, nunca abaixo de 4,5:1 sobre cor opaca) — o que ele
//    trava é o componente ler a escolha, e que a cor do token seja parseável.
//    (iii) Um texto `mix:<token>` é a cor do token misturada (`MIX_SOURCE_SHARE`) com
//    o texto de maior contraste sobre o corpo (`pickOnColor` do `colorBgBody`, o
//    `--sarak-on-surface` do motor): é a expressão `color-mix(in srgb, <cor> 50%,
//    var(--sarak-on-surface))` do badge suave, medida como está escrita.
//    Tinta mais translúcida que a medida, sombra e brilho não entram.
// 3b. [lote 4] O verificador NÃO prova que o componente desenha o par: a lista é
//    declaração humana, conferida por leitura do componente. Componente novo
//    com par novo precisa entrar em `PAIRS` — é por isso que o texto fixo
//    (`text-white`/`text-black`) em componente é barrado à parte por
//    `fixed-translucent:check`.
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
import { sarakGetDefaultDesignState } from '../../../src/core/Design/master-map.ts';
import { SARAK_GLOBAL_THEMES, type SarakThemePreset } from '../../../src/core/Design/presets/themes/index.ts';
import { resolveThemeForMode } from '../../../src/core/Design/presets/themes/color-engine.ts';
import { pickOnColor } from '../../../src/core/Provider/utils/on-color.ts';

export interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface ContrastPair {
    /**
     * tokenId da cor de TEXTO; `on:<tokenId>` (o texto que o motor escolhe sobre a cor sólida do token);
     * ou `mix:<tokenId>` (a cor do token misturada ao texto de maior contraste sobre o corpo, como o badge suave a escreve).
     */
    fg: string;
    /**
     * Cadeia de tokenId do fundo, da camada mais PRÓXIMA do texto até a mais
     * distante. Cada elo translúcido é composto sobre o próximo; o último
     * elo precisa resolver opaco, ou o par é declarado como pulado. Um elo
     * `token@0.1` é a cor do token com o alfa multiplicado por 0,1 (tinta).
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
    { fg: 'textColorMaster', bgChain: ['sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['topbarColor', 'colorBgBody'], min: 4.5 },
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
    { fg: 'titleColor', bgChain: ['surfaceColor', 'colorBgBody'], min: 4.5 },
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
    { fg: 'btnPrimaryText', bgChain: ['btnPrimaryBg', 'colorBgBody'], min: 4.5 },
    { fg: 'inputTextColor', bgChain: ['inputBg', 'colorBgBody'], min: 4.5 },
    { fg: 'topbarTitleColor', bgChain: ['topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'tooltipTextColor', bgChain: ['tooltipBg', 'colorBgBody'], min: 4.5 },
    { fg: 'navItemActiveColor', bgChain: ['sidebarActiveColor', 'sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'navItemActiveColor', bgChain: ['topbarActiveColor', 'topbarColor', 'colorBgBody'], min: 4.5 },

    // Grupo C — pares que os COMPONENTES desenham (fonte: `src/components/**`).
    // Texto sobre cor sólida, escolhido pelo motor por contraste (`--sarak-on-*`): badge sólido,
    // botão de perigo e de sucesso, aba em pílula, bolha do usuário do chat.
    { fg: 'on:primaryColor', bgChain: ['primaryColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:secondaryColor', bgChain: ['secondaryColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:statusSuccessColor', bgChain: ['statusSuccessColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:statusErrorColor', bgChain: ['statusErrorColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:statusWarningColor', bgChain: ['statusWarningColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:statusInfoColor', bgChain: ['statusInfoColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:chatUserBg', bgChain: ['chatUserBg', 'colorBgBody'], min: 4.5 },
    // Badge suave: a cor do status/da marca, misturada à cor de texto do tema (`mix:`), sobre a PRÓPRIA tinta a 10%, sobre o cartão ou o corpo.
    { fg: 'mix:primaryColor', bgChain: ['primaryColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:primaryColor', bgChain: ['primaryColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:secondaryColor', bgChain: ['secondaryColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:secondaryColor', bgChain: ['secondaryColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusSuccessColor', bgChain: ['statusSuccessColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusSuccessColor', bgChain: ['statusSuccessColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusErrorColor', bgChain: ['statusErrorColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusErrorColor', bgChain: ['statusErrorColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusWarningColor', bgChain: ['statusWarningColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusWarningColor', bgChain: ['statusWarningColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusInfoColor', bgChain: ['statusInfoColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusInfoColor', bgChain: ['statusInfoColor@0.1', 'colorBgBody'], min: 4.5 },
    // Texto de status sem tinta (`SarakForm`, `SarakTable`, `ManagementGroupCard`, `SarakPDFViewer`).
    { fg: 'statusErrorColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'statusSuccessColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    // Mensagem de erro de campo (`SarakFieldError`) sobre o corpo e o cartão.
    { fg: 'inputErrorColor', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'inputErrorColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    // Variantes `ghost`/`outline`/`borderline` e links: a cor primária como texto sobre o corpo e o cartão.
    { fg: 'primaryColor', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'primaryColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    // Botão secundário: o texto mudo sobre `btnSecondaryBg`.
    { fg: 'textColorMuted', bgChain: ['btnSecondaryBg', 'colorBgBody'], min: 4.5 },
    // Badge `muted` sólido: o texto escolhido sobre a cor muda.
    { fg: 'on:textColorMuted', bgChain: ['textColorMuted', 'colorBgBody'], min: 4.5 },
    // Hover: item de navegação (`SarakMenuItem`) e linha da tabela.
    { fg: 'textColorMaster', bgChain: ['sidebarHoverColor', 'sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['topbarHoverColor', 'topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['tableRowHoverBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    // Item da matriz expansível (`SarakExpandableMatrix`): o título sobre `matrixItemBg`.
    { fg: 'titleColor', bgChain: ['matrixItemBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
];

/** A parte da cor do token no `color-mix` do badge suave (o resto é o texto de maior contraste sobre o corpo). */
export const MIX_SOURCE_SHARE = 0.4;

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

/** Variável de tema que um token de cor pode usar como valor → o token de cor que ela espelha. */
const THEME_VAR_TOKENS: Record<string, string> = {
    '--theme-surface': 'surfaceColor',
    '--color-theme-title': 'titleColor',
    '--theme-border': 'cardBorderColor',
    '--sarak-primary-color': 'primaryColor',
};

const VAR_RE = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)$/;

/** O valor do token, seguindo `var(--tema)` até o token que ele espelha (uma volta só; sem laço). */
function designValue(design: Record<string, unknown>, tokenId: string): unknown {
    const raw = design[tokenId];
    if (typeof raw !== 'string') return raw;
    const match = raw.trim().match(VAR_RE);
    if (!match) return raw;
    const target = THEME_VAR_TOKENS[match[1]];
    if (target && typeof design[target] === 'string' && !VAR_RE.test(design[target] as string)) return design[target];
    return match[2] ?? raw;
}

/** Resolve uma cadeia de fundo (mais próximo → mais distante) para RGB opaco, ou declara por quê não deu. */
export function resolveChain(chain: string[], design: Record<string, unknown>): ChainResolution {
    const colors = chain.map((link) => {
        const [tokenId, tint] = link.split('@');
        const parsed = parseColor(designValue(design, tokenId));
        const color = parsed && tint !== undefined ? { ...parsed, a: parsed.a * Number(tint) } : parsed;
        return { tokenId, color };
    });
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

    if (pair.fg.startsWith('mix:')) {
        const source = parseColor(designValue(design, pair.fg.slice(4)));
        const body = resolveChain(['colorBgBody'], design);
        if (!source || !body.ok) return { pair, pulado: true, motivo: `cor não parseável para o texto misturado "${pair.fg}"` };
        const flat = source.a >= 0.999 ? [source.r, source.g, source.b] : compositeOverOpaque(source, bg.rgb);
        const onSurface = parseColor(pickOnColor(`rgb(${body.rgb.map(Math.round).join(', ')})`));
        const t = [onSurface?.r ?? 0, onSurface?.g ?? 0, onSurface?.b ?? 0];
        const mixed: [number, number, number] = [0, 1, 2].map((i) => MIX_SOURCE_SHARE * flat[i] + (1 - MIX_SOURCE_SHARE) * t[i]) as [number, number, number];
        const mixedRatio = contrastRatio(mixed, bg.rgb);
        return { pair, pulado: false, ratio: mixedRatio, pass: mixedRatio >= pair.min };
    }

    if (pair.fg.startsWith('on:')) {
        const source = pair.fg.slice(3);
        if (!parseColor(designValue(design, source))) {
            return { pair, pulado: true, motivo: `cor sólida não parseável em "${source}": ${JSON.stringify(design[source])}` };
        }
        const chosen = parseColor(pickOnColor(`rgb(${bg.rgb.map(Math.round).join(', ')})`));
        const chosenRgb: [number, number, number] = [chosen?.r ?? 0, chosen?.g ?? 0, chosen?.b ?? 0];
        const onRatio = contrastRatio(chosenRgb, bg.rgb);
        return { pair, pulado: false, ratio: onRatio, pass: onRatio >= pair.min };
    }

    const fgColor = parseColor(designValue(design, pair.fg));
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

export function auditTheme(theme: SarakThemePreset): ThemeReport {
    const design = { ...sarakGetDefaultDesignState(), ...(theme.design as Record<string, unknown>) };
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
export function auditThemeOppositeMode(theme: SarakThemePreset): ThemeReport {
    const design = { ...sarakGetDefaultDesignState(), ...(theme.design as Record<string, unknown>) };
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
 * Os temas legados sem `contraparte` autorada — a ÚNICA lista de isenção da
 * exigência de `contraparte` (specs/specs/09-temas-e-presets.md §2.1). Ela SÓ PODE
 * ENCOLHER: autorar contraparte para um destes é permitido (e o retira da
 * lista); crescer exigiria justificativa nova. Tema removido do catálogo sai
 * também daqui — entrada apontando para um id inexistente é dívida morta.
 */
export const CONTRAPARTE_EXEMPTION_LIST: readonly string[] = [];

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
export function auditContraparteRequired(themes: SarakThemePreset[]): ContraparteAudit {
    const isentos = themes.filter((t) => CONTRAPARTE_EXEMPTION_LIST.includes(t.id)).map((t) => t.id);
    const faltando = themes
        .filter((t) => !CONTRAPARTE_EXEMPTION_LIST.includes(t.id) && !t.contraparte)
        .map((t) => t.id);
    return { isentos, faltando };
}

function formatPair(pair: ContrastPair): string {
    return `${pair.fg} / ${pair.bgChain.join(' › ')}`;
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

    const nativo = printPass(SARAK_GLOBAL_THEMES.map(auditTheme), 'MODO NATIVO');
    const oposto = printPass(SARAK_GLOBAL_THEMES.map(auditThemeOppositeMode), 'MODO OPOSTO (segunda passada — contraparte autorada quando existe)');
    console.log(`\n${oposto.totalFalhas} par(es)-tema reprovado(s) no MODO OPOSTO.`);

    const contraparteOk = printContraparteAudit(auditContraparteRequired(SARAK_GLOBAL_THEMES), SARAK_GLOBAL_THEMES.length);

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
