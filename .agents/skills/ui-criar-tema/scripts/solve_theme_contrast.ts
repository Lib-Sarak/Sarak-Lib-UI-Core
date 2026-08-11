// -------------------------------------------------------------------------
// LIMITES DECLARADOS — o que este solucionador NÃO faz
// -------------------------------------------------------------------------
// 1. NÃO é um gerador de paleta. Ele NUNCA escolhe matiz (H) nem saturação
//    (S) — só desloca a LUMINOSIDADE (L, em HSL) do token de TEXTO que
//    reprova, na direção oposta à do fundo (fundo escuro → texto mais
//    claro; fundo claro → texto mais escuro). Matiz e saturação saem
//    IDÊNTICOS ao valor de entrada — ver `solveThemeContrast` e o teste
//    `solve_theme_contrast.test.ts`.
// 2. NÃO toca em nenhum token de FUNDO. Só o lado do PAR que é texto
//    (`ContrastPair.fg`) é corrigido — a decisão de fundo do autor
//    (`neo-brutalism`: preto sobre quase-preto) é preservada.
// 3. Um mesmo tokenId de texto pode aparecer em VÁRIOS pares (contra fundos
//    diferentes). O solucionador aplica UMA correção por tokenId — a maior
//    exigida entre os pares desse token na mesma direção. Um par cujo fundo
//    exigir a direção OPOSTA da maioria fica **não resolvido** e é
//    declarado no relatório com o motivo — nunca sobrescrito às cegas.
// 4. Só resolve o que `verify_contrast.ts` já resolve (hex/rgb/rgba/
//    transparent + a cadeia de composição de alfa). Par pulado pelo gate
//    (fundo não-determinístico) é pulado aqui também, com o mesmo motivo.
// -------------------------------------------------------------------------
import { getDefaultDesignState } from '../../../../src/core/Design/master-map.ts';
import { PAIRS, evaluatePair, resolveChain, contrastRatio, compositeOverOpaque } from '../../../../gates/scripts/audit/verify_contrast.ts';
import { rgbToHsl, hslToRgb, rgbToHex, parseToRgba } from '../../../../src/core/Provider/utils/color-engine.ts';
import { GLOBAL_THEMES } from '../../../../src/core/Design/presets/themes/index.ts';

const MIN_RATIO = 4.5;
const L_PRECISION = 0.25;

export interface SolverReportEntry {
    par: string;
    fgToken: string;
    valorAntes: string;
    valorDepois: string;
    razaoAntes: string;
    razaoDepois: string;
    delta: string;
    resolvido: boolean;
    observacao?: string;
}

export interface SolveResult {
    design: Record<string, unknown>;
    relatorio: SolverReportEntry[];
}

type Direction = 'lighter' | 'darker';

/** Contraste de um candidato HSL(h,s,l) com alfa `a`, composto sobre `bgRgb` se translúcido — a MESMA regra que `evaluatePair` usa em runtime. */
const ratioOfCandidate = (h: number, s: number, l: number, a: number, bgRgb: [number, number, number]): number => {
    const rgb = hslToRgb(h, s, l) as [number, number, number];
    const effective = a >= 0.999 ? rgb : compositeOverOpaque({ r: rgb[0], g: rgb[1], b: rgb[2], a }, bgRgb);
    return contrastRatio(effective, bgRgb);
};

/**
 * Busca binária pelo L (HSL) mais PRÓXIMO do original, NA DIREÇÃO dada, que
 * ainda satisfaz o limiar contra o fundo — H, S e alfa são fixos, entram e
 * saem idênticos. A busca é restrita a [currentL, 100] ("lighter") ou
 * [0, currentL] ("darker") — nunca cruza para o lado oposto ao original.
 * Devolve `null` se nem o extremo desse lado (mantendo o alfa original)
 * alcança o limiar — nesse caso é a ALFA que precisa mover (ver
 * `searchAlpha`), não a luminosidade.
 */
const searchLuminance = (h: number, s: number, currentL: number, alpha: number, direction: Direction, bgRgb: [number, number, number], minRatio: number): number | null => {
    const ratioAt = (l: number) => ratioOfCandidate(h, s, l, alpha, bgRgb);
    const extreme = direction === 'lighter' ? 100 : 0;
    if (ratioAt(extreme) < minRatio) return null;

    let lo = direction === 'lighter' ? currentL : 0;
    let hi = direction === 'lighter' ? 100 : currentL;
    for (let i = 0; hi - lo > L_PRECISION && i < 64; i += 1) {
        const mid = (lo + hi) / 2;
        const passes = ratioAt(mid) >= minRatio;
        if (direction === 'lighter') {
            if (passes) hi = mid; else lo = mid;
        } else {
            if (passes) lo = mid; else hi = mid;
        }
    }
    return direction === 'lighter' ? hi : lo;
};

/**
 * Fallback quando o L já está no extremo do lado certo (ex.: texto branco
 * translúcido sobre fundo escuro — L=100 não tem "mais claro" possível): a
 * única alavanca que resta, preservando matiz/saturação, é a OPACIDADE do
 * próprio texto. Busca a alfa mínima (mais próxima da original) que satisfaz
 * o limiar, com L fixo no extremo. Devolve `null` se nem alfa=1 resolver.
 */
const searchAlpha = (h: number, s: number, extremeL: number, currentAlpha: number, bgRgb: [number, number, number], minRatio: number): number | null => {
    const ratioAt = (a: number) => ratioOfCandidate(h, s, extremeL, a, bgRgb);
    if (ratioAt(1) < minRatio) return null;

    let lo = currentAlpha;
    let hi = 1;
    for (let i = 0; hi - lo > 0.005 && i < 64; i += 1) {
        const mid = (lo + hi) / 2;
        if (ratioAt(mid) >= minRatio) hi = mid; else lo = mid;
    }
    return hi;
};

const fmtRatio = (r: number): string => `${r.toFixed(2)}:1`;

/**
 * Recebe um tema (design completo, já mesclado com defaults) e devolve o
 * design corrigido + o relatório. NUNCA muda matiz/saturação nem token de
 * fundo — só a luminosidade do token de TEXTO nos pares que reprovam.
 */
export function solveThemeContrast(design: Record<string, unknown>): SolveResult {
    const working: Record<string, unknown> = { ...design };
    const relatorio: SolverReportEntry[] = [];

    const porFgToken = new Map<string, typeof PAIRS>();
    for (const pair of PAIRS) {
        if (!porFgToken.has(pair.fg)) porFgToken.set(pair.fg, []);
        (porFgToken.get(pair.fg) as typeof PAIRS).push(pair);
    }

    for (const [fgToken, pares] of porFgToken) {
        const avaliacoesAntes = pares.map((pair) => ({ pair, resultado: evaluatePair(pair, working) }));
        const falhas = avaliacoesAntes.filter((a) => !a.resultado.pulado && !a.resultado.pass);
        if (falhas.length === 0) continue;

        const original = parseToRgba(String(working[fgToken]));
        const [h, s, currentL] = rgbToHsl(original.r, original.g, original.b);

        // Direção: qual extremo (preto ou branco) dá MAIS contraste contra o
        // fundo do pior caso. NÃO é "fundo escuro → sempre mais claro": a
        // fórmula WCAG (L+0,05)/(l+0,05) é assimétrica — um fundo de
        // luminância 0,20 já dá MAIS contraste contra preto (0,05 no
        // denominador) do que contra branco. Comparar os dois extremos de
        // verdade evita escolher o lado errado.
        const pior = falhas.reduce((a, b) => (a.resultado.pulado || b.resultado.pulado ? a : (a.resultado as { ratio: number }).ratio < (b.resultado as { ratio: number }).ratio ? a : b));
        const piorBg = resolveChain(pior.pair.bgChain, working);
        if (!piorBg.ok) continue; // não deveria acontecer: já filtrado por `pulado` acima
        const direction: Direction = contrastRatio([0, 0, 0], piorBg.rgb) >= contrastRatio([255, 255, 255], piorBg.rgb) ? 'darker' : 'lighter';
        const extremeL = direction === 'lighter' ? 100 : 0;

        // 1ª tentativa: mover só L, o mais perto possível do original, na direção certa.
        let melhorL: number | null = null;
        let precisaAlfa = false;
        for (const { pair, resultado } of falhas) {
            if (resultado.pulado) continue;
            const bg = resolveChain(pair.bgChain, working);
            if (!bg.ok) continue;
            const l = searchLuminance(h, s, currentL, original.a, direction, bg.rgb, pair.min);
            if (l === null) { precisaAlfa = true; continue; }
            if (melhorL === null) melhorL = l;
            else melhorL = direction === 'lighter' ? Math.max(melhorL, l) : Math.min(melhorL, l);
        }

        // 2ª tentativa (só se L sozinho não bastou p/ algum par): L vai ao
        // extremo do lado certo, e a ALFA original — se o token já for
        // translúcido — é quem fecha a distância que falta. Preserva H/S; a
        // alfa não é matiz nem saturação, é "quanto do texto se vê".
        let melhorAlfa = original.a;
        if (precisaAlfa) {
            melhorL = extremeL;
            for (const { pair, resultado } of falhas) {
                if (resultado.pulado) continue;
                const bg = resolveChain(pair.bgChain, working);
                if (!bg.ok) continue;
                const a = searchAlpha(h, s, extremeL, original.a, bg.rgb, pair.min);
                if (a === null) continue; // fica para a declaração abaixo
                melhorAlfa = Math.max(melhorAlfa, a);
            }
        }

        // Margem de segurança contra o arredondamento de ida-e-volta HSL<->hex
        // (8 bits por canal): a busca binária encontra o limiar exato em ponto
        // flutuante, mas `rgbToHex` arredonda — e o valor arredondado pode cair
        // 0,01:1 abaixo do limiar. Empurra um passo mínimo (imperceptível) para
        // o lado seguro antes de fixar o valor final.
        if (melhorL !== null) {
            melhorL = direction === 'lighter' ? Math.min(100, melhorL + 0.5) : Math.max(0, melhorL - 0.5);
        }
        if (precisaAlfa) melhorAlfa = Math.min(1, melhorAlfa + 0.01);

        // Confere se, com (melhorL, melhorAlfa) — já arredondados como o valor
        // FINAL em hex ficaria — TODOS os pares falhos passam. Se algum
        // continuar sem passar nem no extremo, é "não resolvido", declarado.
        const [chkR, chkG, chkB] = melhorL !== null ? (hslToRgb(h, s, melhorL) as [number, number, number]) : [0, 0, 0];
        const chkRgba = parseToRgba(rgbToHex(chkR, chkG, chkB, melhorAlfa < 1 ? melhorAlfa : undefined));
        const candidatoOk = melhorL !== null && falhas.every(({ pair, resultado }) => {
            if (resultado.pulado) return true;
            const bg = resolveChain(pair.bgChain, working);
            if (!bg.ok) return false;
            const effective = chkRgba.a >= 0.999 ? [chkRgba.r, chkRgba.g, chkRgba.b] as [number, number, number] : compositeOverOpaque(chkRgba, bg.rgb);
            return contrastRatio(effective, bg.rgb) >= pair.min;
        });

        if (!candidatoOk) {
            // Nem no extremo (preto/branco, alfa 1) o par resolve — declarado, não forçado.
            for (const { pair, resultado } of falhas) {
                if (resultado.pulado) continue;
                relatorio.push({
                    par: `${pair.fg} / ${pair.bgChain[0]}`,
                    fgToken,
                    valorAntes: String(working[fgToken]),
                    valorDepois: String(working[fgToken]),
                    razaoAntes: fmtRatio(resultado.ratio),
                    razaoDepois: fmtRatio(resultado.ratio),
                    delta: '+0.00',
                    resolvido: false,
                    observacao: `nem o extremo (${direction === 'lighter' ? 'branco' : 'preto'}${original.a < 1 ? ', alfa 1' : ''}) alcança ${pair.min}:1 preservando matiz/saturação — decisão do autor`,
                });
            }
            continue;
        }

        const [newR, newG, newB] = hslToRgb(h, s, melhorL as number);
        const novoValor = rgbToHex(newR, newG, newB, melhorAlfa < 1 ? melhorAlfa : undefined);
        working[fgToken] = novoValor;

        // Relatório por PAR (não por token) — reavalia cada par do token com o valor novo.
        for (const { pair, resultado: antes } of avaliacoesAntes) {
            if (antes.pulado) continue;
            const depois = evaluatePair(pair, working);
            if (depois.pulado) continue;
            const eraFalha = !antes.pass;
            if (!eraFalha && depois.pass) continue; // já passava e continua passando — nada a relatar
            relatorio.push({
                par: `${pair.fg} / ${pair.bgChain[0]}`,
                fgToken,
                valorAntes: String(design[fgToken]),
                valorDepois: novoValor,
                razaoAntes: fmtRatio(antes.ratio),
                razaoDepois: fmtRatio(depois.ratio),
                delta: `${depois.ratio >= antes.ratio ? '+' : ''}${(depois.ratio - antes.ratio).toFixed(2)}`,
                resolvido: depois.pass,
                ...(depois.pass ? {} : { observacao: `outro par do mesmo token (${fgToken}) exigiu a direção oposta` }),
            });
        }
    }

    return { design: working, relatorio };
}

function printReport(themeId: string, relatorio: SolverReportEntry[]): void {
    console.log(`--- Solucionador de Contraste — ${themeId} ---\n`);
    if (relatorio.length === 0) {
        console.log('Nenhuma correção necessária: todos os pares já passam AA.');
        return;
    }
    for (const r of relatorio) {
        const status = r.resolvido ? 'RESOLVIDO' : 'NÃO RESOLVIDO';
        console.log(`[${status}] ${r.par}`);
        console.log(`    ${r.fgToken}: ${r.valorAntes} -> ${r.valorDepois}`);
        console.log(`    razão: ${r.razaoAntes} -> ${r.razaoDepois} (delta ${r.delta})`);
        if (r.observacao) console.log(`    obs: ${r.observacao}`);
    }
    const resolvidos = relatorio.filter((r) => r.resolvido).length;
    console.log(`\n${resolvidos}/${relatorio.length} pares corrigidos.`);
}

function main(): void {
    const themeId = process.argv[2];
    if (!themeId) {
        console.error('Uso: npx tsx solve_theme_contrast.ts <theme-id>');
        process.exit(1);
    }
    const theme = GLOBAL_THEMES.find((t) => t.id === themeId);
    if (!theme) {
        console.error(`Tema "${themeId}" não encontrado em GLOBAL_THEMES.`);
        process.exit(1);
    }
    const merged = { ...getDefaultDesignState(), ...(theme.design as Record<string, unknown>) };
    const { relatorio } = solveThemeContrast(merged);
    printReport(themeId, relatorio);
}

const isMain = /solve_theme_contrast\.ts$/.test(process.argv[1] ?? '');
if (isMain) {
    main();
}
