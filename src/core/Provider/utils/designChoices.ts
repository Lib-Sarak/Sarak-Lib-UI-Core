import { composeThemeDesign } from '../../Design/presets/themes/compose';
import { resolveThemeForMode, type ModeResolvableTheme } from '../../Design/presets/themes/color-engine';
import { getLoadedThemePreset } from '../../Design/presets/themes/registry';
import { PALETTE_CALCULATED_KEYS, resolveChosenPalette } from '../../Design/palette/resolve';
import { isValidPaletteValue } from '../../Design/palette/parser';
import { validateDesign } from './validation';
import type { SarakTokenValue } from '../../Design/types';
import type { SarakDesignState, SarakThemeEntry } from '../types';
import type { SarakDesignFormat } from '../designFormatTypes';

/**
 * O formato do design gravado que guarda só as escolhas: o tema, a paleta, os tons da barra, o modo e o que foi ajustado
 * à mão. O que a paleta calcula nunca é gravado e é refeito a cada carga. Gravado sem esse marcador é do formato anterior,
 * em que o design ia inteiro, com as cores calculadas e o que sobrou de outro tema.
 */
export const SARAK_DESIGN_FORMAT_CHOICES: SarakDesignFormat = 2;

type DesignRecord = Record<string, unknown>;
type Mode = 'light' | 'dark';

const BAR_TONE_KEYS = ['sidebarTone', 'topbarTone'] as const;
/** Os condutores: decidem o cálculo, por isso são fixados antes de se comparar o resto. */
const DRIVER_KEYS = ['colorPalette', 'keepPalette', ...BAR_TONE_KEYS] as const;

const modeOf = (value: unknown): Mode | undefined => (value === 'light' || value === 'dark' ? value : undefined);
const nativeModeOf = (theme: ModeResolvableTheme): Mode => modeOf(theme.design?.mode) ?? 'dark';

/** A ordem das chaves de um valor responsivo não é escolha: o validador pode reordená-las. */
const sortKeys = (_key: string, value: unknown): unknown => (
    value !== null && typeof value === 'object' && !Array.isArray(value)
        ? Object.fromEntries(Object.entries(value as DesignRecord).sort(([a], [b]) => (a < b ? -1 : 1)))
        : value
);
const sameValue = (a: unknown, b: unknown): boolean => a === b || JSON.stringify(a, sortKeys) === JSON.stringify(b, sortKeys);

const pickDefined = (source: DesignRecord, keys: readonly string[]): DesignRecord =>
    Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));

/** O tema do id, com `design`, entre os do consumidor e os embarcados em memória; `undefined` se não está em memória. */
export const findThemeEntry = (allThemes: SarakThemeEntry[] | undefined, id: string | undefined): ModeResolvableTheme | undefined => {
    if (!id) return undefined;
    const theme = allThemes?.find((entry) => entry.id === id && entry.design) ?? getLoadedThemePreset(id);
    return theme?.design ? { design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte } : undefined;
};

/**
 * O que o motor produz para o tema com os condutores dados: a referência contra a qual uma escolha difere. O tom escolhido
 * vence o do host no cálculo, como vence no rascunho. A paleta escolhida, diferente da do tema, vence a cor que o tema e o
 * host declaram em todo papel que ela calcula, com a mesma entrada com que o painel a grava no rascunho.
 */
const composeChoiceBaseline = (theme: ModeResolvableTheme, drivers: DesignRecord, hostConfig: DesignRecord | undefined): DesignRecord => {
    const mode = modeOf(drivers.mode) ?? nativeModeOf(theme);
    const resolved = resolveThemeForMode(theme, mode) as DesignRecord;
    const tones = pickDefined(drivers, BAR_TONE_KEYS);
    // "Manter minha paleta" ligado: a paleta escolhida (ou, sem escolha, a do tema) vale por cima das cores que o tema declara.
    const kept = drivers.keepPalette === true ? { keepPalette: true, colorPalette: drivers.colorPalette ?? resolved.colorPalette } : {};
    const base = {
        ...(composeThemeDesign({ ...resolved, ...tones }, { mode, ...kept }, { ...hostConfig, ...tones }) as unknown as DesignRecord),
        ...tones,
    };
    const chosen = drivers.colorPalette;
    if (chosen === undefined || sameValue(chosen, resolved.colorPalette)) return base;
    const barTones = { sidebarTone: base.sidebarTone, topbarTone: base.topbarTone };
    return { ...base, colorPalette: chosen, ...resolveChosenPalette(chosen, mode, barTones) };
};

interface CachedBaseline {
    raw: DesignRecord;
    validated?: DesignRecord;
}

/** A chave do tema sem contraparte no cache: `WeakMap` só aceita objeto como chave. */
const NO_CONTRAPARTE = {};
/** Quantos pares de host e condutores ficam guardados por tema: os do rascunho atual e os das trocas anteriores. */
const BASELINE_CACHE_LIMIT = 16;
type ByInput = Map<string, CachedBaseline>;
const BASELINE_CACHE = new WeakMap<object, WeakMap<object, ByInput>>();

/**
 * O baseline do tema para os condutores, guardado pelo que ele lê: o `design` e a contraparte do tema (por referência), o
 * host e os condutores (pelo conteúdo: o `config` do host chega como objeto novo a cada render quando é escrito inline ou
 * omitido). Trocar o tom no rascunho compara contra o baseline do tom anterior, que é o da troca anterior, e não precisa
 * compor nem calcular a paleta de novo. Quem o recebe só lê.
 */
const baselineFor = (theme: ModeResolvableTheme, drivers: DesignRecord, hostConfig: DesignRecord | undefined): CachedBaseline => {
    const byContraparte = BASELINE_CACHE.get(theme.design) ?? new WeakMap<object, ByInput>();
    BASELINE_CACHE.set(theme.design, byContraparte);
    const contraparteKey = theme.contraparte ?? NO_CONTRAPARTE;
    const byInput = byContraparte.get(contraparteKey) ?? new Map<string, CachedBaseline>();
    byContraparte.set(contraparteKey, byInput);
    const key = JSON.stringify([drivers, hostConfig ?? null], sortKeys);
    const cached = byInput.get(key);
    if (cached) return cached;
    if (byInput.size >= BASELINE_CACHE_LIMIT) byInput.delete(byInput.keys().next().value as string);
    const entry: CachedBaseline = { raw: composeChoiceBaseline(theme, drivers, hostConfig) };
    byInput.set(key, entry);
    return entry;
};

const driversOf = (design: DesignRecord, theme: ModeResolvableTheme, hostConfig: DesignRecord | undefined): DesignRecord => {
    const mode = modeOf(design.mode) ?? nativeModeOf(theme);
    const reference = baselineFor(theme, { mode }, hostConfig).raw;
    const chosen = DRIVER_KEYS.filter((key) => design[key] !== undefined && !sameValue(design[key], reference[key]));
    return { mode, ...pickDefined(design, chosen) };
};

/**
 * As escolhas de um design: os condutores que diferem do tema e toda chave que difere do que o motor produz com eles,
 * inclusive a cor ajustada à mão. O modo entra só se difere do modo nativo do tema.
 */
export const extractDesignChoices = (design: DesignRecord, theme: ModeResolvableTheme, hostConfig?: DesignRecord): DesignRecord => {
    const drivers = driversOf(design, theme, hostConfig);
    // O design chega validado (o do sistema) ou não (o rascunho): o que só o validador acrescenta ou normaliza não é escolha.
    const entry = baselineFor(theme, drivers, hostConfig);
    const baseline = entry.raw;
    entry.validated ??= validateDesign(baseline) as unknown as DesignRecord;
    const { validated } = entry;
    const choices: DesignRecord = pickDefined(drivers, DRIVER_KEYS);
    if (drivers.mode !== nativeModeOf(theme)) choices.mode = drivers.mode;
    Object.entries(design).forEach(([key, value]) => {
        if (key !== 'mode' && !sameValue(value, baseline[key]) && !sameValue(value, validated[key])) choices[key] = value;
    });
    return choices;
};

/** O design inteiro a partir das escolhas: o que o motor produz com os condutores delas, e as escolhas por cima. Sem validar. */
export const recomposeDesignChoices = (choices: DesignRecord, theme: ModeResolvableTheme, hostConfig?: DesignRecord): SarakDesignState => {
    const drivers = pickDefined(choices, ['mode', ...DRIVER_KEYS]);
    return { ...baselineFor(theme, drivers, hostConfig).raw, ...choices } as unknown as SarakDesignState;
};

/** Troca uma escolha e refaz o que a paleta calcula a partir dela: o rascunho que muda o tom da barra. */
export const replaceDesignChoice = (
    design: DesignRecord,
    change: DesignRecord,
    theme: ModeResolvableTheme,
    hostConfig?: DesignRecord,
): SarakDesignState => recomposeDesignChoices({ ...extractDesignChoices(design, theme, hostConfig), ...change }, theme, hostConfig);

/**
 * Regra L1 para o design gravado sem marcador: saem as chaves que a paleta calcula e que o tema do id e o `config` do host
 * não declaram, e o resto do design é preservado. Remove de uma vez a cópia de cálculo e a cor que sobrou de outro tema; um
 * ajuste manual de cor de papel não se distingue desse resto e se perde uma vez. Sem paleta válida, nada é calculado e o
 * design fica como está.
 */
export const normalizeLegacyDesign = (design: DesignRecord, theme: ModeResolvableTheme, hostConfig?: DesignRecord): SarakDesignState => {
    if (!isValidPaletteValue(design.colorPalette)) return design as unknown as SarakDesignState;
    const declared = new Set([...Object.keys(theme.design ?? {}), ...Object.keys(theme.contraparte ?? {}), ...Object.keys(hostConfig ?? {})]);
    const kept = Object.fromEntries(Object.entries(design).filter(([key]) => !PALETTE_CALCULATED_KEYS.has(key) || declared.has(key)));
    return recomposeDesignChoices(kept, theme, hostConfig);
};
