// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este medidor NÃO vê
// -------------------------------------------------------------------------
// 1. Só mede o que a `plan-25` pede: modo, navigationStyle, matiz/saturação
//    de `primaryColor`, luminosidade de `colorBgBody`, `cardBorderRadius`,
//    `cardBorderWidth`, `cardBackdropBlur` e `layoutDensity` — não é uma
//    auditoria dos 422 tokens, é uma medição de DIVERSIDADE cromática e
//    estrutural entre temas.
// 2. `hueFamily` é um agrupamento HEURÍSTICO (8 famílias por faixa de matiz +
//    "neutro" para saturação < 20) — não existe no schema nem no catálogo, é
//    só o vocabulário desta medição. Cor cuja `primaryColor`/`colorBgBody`
//    não resolve por `parseColor` (hsl()/var()/gradiente) vira `null` nos
//    campos de cor e "indeterminado" na família — nunca chuta um valor.
// 3. Os 3 tokens estruturais usam bucket de 3 faixas (baixo/médio/alto)
//    dividindo em terços o intervalo REAL observado nos `existentes` (não o
//    `constraints.min..max` do schema, que é 0-120/0-20/0-100 — bem mais
//    largo que qualquer tema jamais usa; com ele, os dados reais nunca
//    escapavam da faixa "baixo", achado do revisor na `plan-25` §11.3/§11.5).
//    A faixa vem sempre dos `existentes` (nunca dos `novos`, que são o que
//    está sendo julgado — autorreferência inflaria dispersão artificialmente
//    para qualquer conjunto não-idêntico). Não é um valor "certo", é só o
//    vocabulário para medir dispersão entre os 5 temas novos (critério 9 da
//    §3.3 da `plan-25`).
// 4. Critério 6 (distância de matiz) só compara temas com a MESMA família E
//    o MESMO modo — é a fronteira literal da §3.3. Comparar tudo contra tudo
//    acusaria falso positivo (um azul escuro perto de um azul claro não é o
//    "mesmo espaço" que a regra protege).
// -------------------------------------------------------------------------
import { getDefaultDesignState } from '../../../src/core/Design/master-map.ts';
import { GLOBAL_THEMES, type ThemePreset } from '../../../src/core/Design/presets/themes/index.ts';
import { parseColor } from './verify_contrast.ts';
import { rgbToHsl } from '../../../src/core/Provider/utils/color-engine.ts';

const NEUTRAL_SATURATION_THRESHOLD = 20;

const HUE_FAMILIES: Array<{ nome: string; min: number; max: number }> = [
    { nome: 'vermelho', min: 345, max: 360 },
    { nome: 'vermelho', min: 0, max: 15 },
    { nome: 'laranja', min: 15, max: 45 },
    { nome: 'amarelo', min: 45, max: 70 },
    { nome: 'verde', min: 70, max: 170 },
    { nome: 'ciano', min: 170, max: 200 },
    { nome: 'azul', min: 200, max: 260 },
    { nome: 'roxo', min: 260, max: 290 },
    { nome: 'magenta', min: 290, max: 345 },
];

/** Família semântica de um matiz — "neutro" quando a cor é pouco saturada (LIMITE 2). */
export function hueFamily(h: number | null, s: number | null): string {
    if (h === null || s === null) return 'indeterminado';
    if (s < NEUTRAL_SATURATION_THRESHOLD) return 'neutro';
    const hue = ((h % 360) + 360) % 360;
    const found = HUE_FAMILIES.find((f) => hue >= f.min && hue < f.max);
    return found ? found.nome : 'indeterminado';
}

export type Faixa = 'baixo' | 'médio' | 'alto';

/** Divide `[min, max]` em terços — vocabulário de dispersão, não um valor "certo" (LIMITE 3). */
export function bucket3(value: number | null, min: number, max: number): Faixa | null {
    if (value === null) return null;
    const span = (max - min) / 3;
    if (value < min + span) return 'baixo';
    if (value < min + span * 2) return 'médio';
    return 'alto';
}

/** Distância circular entre dois matizes, em graus (0-180). */
export function hueDistance(a: number, b: number): number {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
}

/** min/max observados de `selector` em `rows` — a faixa real de dispersão de um token estrutural (LIMITE 3). */
export function structuralRange(rows: ThemeDiversityRow[], selector: (row: ThemeDiversityRow) => number | null): [number, number] {
    const valores = rows.map(selector).filter((v): v is number => v !== null);
    if (valores.length === 0) return [0, 0];
    return [Math.min(...valores), Math.max(...valores)];
}

function toNumber(value: unknown): number | null {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object') {
        const v = value as Record<string, unknown>;
        const candidate = v.desk ?? v.tab ?? v.mob;
        if (typeof candidate === 'number') return candidate;
    }
    return null;
}

export interface ThemeDiversityRow {
    id: string;
    mode: string;
    navigationStyle: string;
    hue: number | null;
    saturation: number | null;
    familia: string;
    fundoL: number | null;
    cardBorderRadius: number | null;
    cardBorderWidth: number | null;
    cardBackdropBlur: number | null;
    layoutDensity: string;
}

/** Mede UM tema já mesclado com os defaults — mesma convenção de `auditTheme` (verify_contrast.ts). */
export function measureTheme(theme: ThemePreset): ThemeDiversityRow {
    const design = { ...getDefaultDesignState(), ...(theme.design as Record<string, unknown>) };
    const primary = parseColor(design.primaryColor);
    const [h, s] = primary ? rgbToHsl(primary.r, primary.g, primary.b) : [null, null];
    const bg = parseColor(design.colorBgBody);
    const bgHsl = bg ? rgbToHsl(bg.r, bg.g, bg.b) : null;

    return {
        id: theme.id,
        mode: String(design.mode ?? 'dark'),
        navigationStyle: String(design.navigationStyle ?? 'sidebar'),
        hue: h === null ? null : Math.round(h as number),
        saturation: s === null ? null : Math.round(s as number),
        familia: hueFamily(h as number | null, s as number | null),
        fundoL: bgHsl ? Math.round(bgHsl[2]) : null,
        cardBorderRadius: toNumber(design.cardBorderRadius),
        cardBorderWidth: toNumber(design.cardBorderWidth),
        cardBackdropBlur: toNumber(design.cardBackdropBlur),
        layoutDensity: String(design.layoutDensity ?? 'comfortable'),
    };
}

export interface DiversityAggregate {
    total: number;
    modeDark: number;
    saturacao100: number;
    cianoOuMagenta: number;
    claroSaturado: number;
    fundoMedio: number;
}

/** As "quatro linhas" da §2.2 do plan-25 — a mesma medição, em código. */
export function aggregate(rows: ThemeDiversityRow[]): DiversityAggregate {
    return {
        total: rows.length,
        modeDark: rows.filter((r) => r.mode === 'dark').length,
        saturacao100: rows.filter((r) => r.saturation === 100).length,
        cianoOuMagenta: rows.filter((r) => r.familia === 'ciano' || r.familia === 'magenta').length,
        claroSaturado: rows.filter((r) => r.mode === 'light' && (r.saturation ?? 0) >= 60).length,
        fundoMedio: rows.filter((r) => r.fundoL !== null && r.fundoL >= 25 && r.fundoL <= 75).length,
    };
}

export interface CriterioResultado {
    criterio: number;
    descricao: string;
    ok: boolean;
    detalhe: string;
}

/**
 * Os 9 critérios de distância da §3.3 do plan-25. `existentes` são os temas
 * de controle (os 18); `novos`, os temas sob teste. 1-6 comparam novos ×
 * existentes; 7-9 comparam os novos ENTRE SI.
 */
export function evaluateDistanceCriteria(existentes: ThemeDiversityRow[], novos: ThemeDiversityRow[]): CriterioResultado[] {
    const resultados: CriterioResultado[] = [];

    const claros = novos.filter((r) => r.mode === 'light');
    const claroSaturado = claros.filter((r) => (r.saturation ?? 0) >= 60);
    resultados.push({
        criterio: 1,
        descricao: '≥2 em mode:light, e ao menos 1 deles com primária S≥60',
        ok: claros.length >= 2 && claroSaturado.length >= 1,
        detalhe: `${claros.length} claro(s) (${claros.map((r) => r.id).join(', ') || '—'}); ${claroSaturado.length} com S≥60`,
    });

    const fundoMedio = novos.filter((r) => r.fundoL !== null && r.fundoL >= 25 && r.fundoL <= 75);
    resultados.push({
        criterio: 2,
        descricao: '≥1 com colorBgBody de luminosidade MÉDIA, 25..75',
        ok: fundoMedio.length >= 1,
        detalhe: `${fundoMedio.length} tema(s) (${fundoMedio.map((r) => r.id).join(', ') || '—'})`,
    });

    const saturacaoContida = novos.filter((r) => (r.saturation ?? -1) >= 20 && (r.saturation ?? -1) <= 55);
    resultados.push({
        criterio: 3,
        descricao: '≥2 com primária de saturação contida, S entre 20 e 55',
        ok: saturacaoContida.length >= 2,
        detalhe: `${saturacaoContida.length} tema(s) (${saturacaoContida.map((r) => r.id).join(', ') || '—'})`,
    });

    const s90 = novos.filter((r) => (r.saturation ?? 0) >= 90);
    resultados.push({
        criterio: 4,
        descricao: 'no máximo 1 com S≥90',
        ok: s90.length <= 1,
        detalhe: `${s90.length} tema(s) (${s90.map((r) => r.id).join(', ') || '—'})`,
    });

    const cianoMagenta = novos.filter((r) => r.familia === 'ciano' || r.familia === 'magenta');
    resultados.push({
        criterio: 5,
        descricao: 'ZERO novos em ciano ou magenta',
        ok: cianoMagenta.length === 0,
        detalhe: cianoMagenta.length === 0 ? 'nenhum' : cianoMagenta.map((r) => `${r.id} (${r.familia})`).join(', '),
    });

    const perto: string[] = [];
    const c6 = novos.every((novo) => {
        if (novo.hue === null || novo.familia === 'neutro' || novo.familia === 'indeterminado') return true;
        return existentes.every((ex) => {
            if (ex.hue === null || ex.familia !== novo.familia || ex.mode !== novo.mode) return true;
            const distancia = hueDistance(novo.hue as number, ex.hue as number);
            if (distancia < 25) {
                perto.push(`${novo.id} (H${novo.hue}) × ${ex.id} (H${ex.hue}) = ${distancia.toFixed(0)}°`);
                return false;
            }
            return true;
        });
    });
    resultados.push({
        criterio: 6,
        descricao: 'nenhum novo a menos de 25° de matiz de um atual na MESMA família e MESMO modo',
        ok: c6,
        detalhe: perto.length === 0 ? 'nenhum conflito' : perto.join('; '),
    });

    const paresRepetidos: string[] = [];
    for (let i = 0; i < novos.length; i += 1) {
        for (let j = i + 1; j < novos.length; j += 1) {
            if (novos[i].familia === novos[j].familia && novos[i].mode === novos[j].mode) {
                paresRepetidos.push(`${novos[i].id} × ${novos[j].id} (${novos[i].familia}/${novos[i].mode})`);
            }
        }
    }
    resultados.push({
        criterio: 7,
        descricao: 'nenhum par dos 5 compartilha família de matiz E modo',
        ok: paresRepetidos.length === 0,
        detalhe: paresRepetidos.length === 0 ? 'nenhum par repetido' : paresRepetidos.join('; '),
    });

    const navStyles = new Set(novos.map((r) => r.navigationStyle));
    resultados.push({
        criterio: 8,
        descricao: 'os 5 cobrem ambos os navigationStyle',
        ok: navStyles.has('sidebar') && navStyles.has('topbar'),
        detalhe: `presentes: ${Array.from(navStyles).join(', ') || '—'}`,
    });

    const [radiusMin, radiusMax] = structuralRange(existentes, (r) => r.cardBorderRadius);
    const [widthMin, widthMax] = structuralRange(existentes, (r) => r.cardBorderWidth);
    const [blurMin, blurMax] = structuralRange(existentes, (r) => r.cardBackdropBlur);
    const radiusBuckets = new Set(novos.map((r) => bucket3(r.cardBorderRadius, radiusMin, radiusMax))).size;
    const widthBuckets = new Set(novos.map((r) => bucket3(r.cardBorderWidth, widthMin, widthMax))).size;
    const blurBuckets = new Set(novos.map((r) => bucket3(r.cardBackdropBlur, blurMin, blurMax))).size;
    const densityBuckets = new Set(novos.map((r) => r.layoutDensity)).size;
    resultados.push({
        criterio: 9,
        descricao: 'diversidade estrutural real: raio, borda, blur e densidade não podem ficar TODOS na mesma faixa',
        ok: radiusBuckets > 1 || widthBuckets > 1 || blurBuckets > 1 || densityBuckets > 1,
        detalhe: `faixas distintas — raio:${radiusBuckets} borda:${widthBuckets} blur:${blurBuckets} densidade:${densityBuckets}`,
    });

    return resultados;
}

function printTable(rows: ThemeDiversityRow[]): void {
    console.log('\n| tema | modo | nav | família | H | S | fundo L | raio | borda | blur | densidade |');
    console.log('|---|---|---|---|---|---|---|---|---|---|---|');
    for (const r of rows) {
        console.log(
            `| ${r.id} | ${r.mode} | ${r.navigationStyle} | ${r.familia} | ${r.hue ?? '—'} | ${r.saturation ?? '—'} | ${r.fundoL ?? '—'} | ${r.cardBorderRadius ?? '—'} | ${r.cardBorderWidth ?? '—'} | ${r.cardBackdropBlur ?? '—'} | ${r.layoutDensity} |`
        );
    }
}

function printAggregate(a: DiversityAggregate, label: string): void {
    console.log(`\n--- ${label} (${a.total} temas) ---`);
    console.log(`mode: dark ............................ ${a.modeDark} de ${a.total}`);
    console.log(`primária S=100 (neon puro) ............. ${a.saturacao100} de ${a.total}`);
    console.log(`família ciano + magenta ................ ${a.cianoOuMagenta} de ${a.total}`);
    console.log(`claro com primária saturada (S≥60) ..... ${a.claroSaturado} de ${a.total}`);
    console.log(`fundo de luminosidade média (25..75) ... ${a.fundoMedio} de ${a.total}`);
}

function printCriteria(resultados: CriterioResultado[]): void {
    console.log('\n--- Critérios de distância (§3.3, plan-25) ---');
    for (const r of resultados) {
        console.log(`[${r.ok ? 'OK' : 'FALHA'}] #${r.criterio} — ${r.descricao}`);
        console.log(`    ${r.detalhe}`);
    }
}

function parseArgs(argv: string[]): { newIds: string[] | null } {
    const idx = argv.indexOf('--new');
    if (idx === -1) return { newIds: null };
    const raw = argv[idx + 1] ?? '';
    return { newIds: raw.split(',').map((s) => s.trim()).filter(Boolean) };
}

function main(): void {
    console.log('--- Medidor de Diversidade de Temas (plan-25) ---');
    const { newIds } = parseArgs(process.argv.slice(2));
    const rows = GLOBAL_THEMES.map(measureTheme);
    printTable(rows);
    printAggregate(aggregate(rows), 'TODOS OS TEMAS');

    if (!newIds) return;

    const faltando = newIds.filter((id) => !rows.some((r) => r.id === id));
    if (faltando.length > 0) {
        console.error(`\n❌ ids não encontrados em GLOBAL_THEMES: ${faltando.join(', ')}`);
        process.exit(1);
    }

    const novos = rows.filter((r) => newIds.includes(r.id));
    const existentes = rows.filter((r) => !newIds.includes(r.id));
    printAggregate(aggregate(existentes), 'EXISTENTES (controle)');
    printAggregate(aggregate(novos), 'NOVOS');

    const criterios = evaluateDistanceCriteria(existentes, novos);
    printCriteria(criterios);
    const falhas = criterios.filter((c) => !c.ok);
    if (falhas.length > 0) {
        console.log(`\n❌ ${falhas.length} de ${criterios.length} critérios da §3.3 não satisfeitos.`);
        process.exit(1);
    }
    console.log(`\n✅ Todos os ${criterios.length} critérios da §3.3 satisfeitos.`);
}

const isMain = /verify_diversity\.ts$/.test(process.argv[1] ?? '');
if (isMain) {
    main();
}
