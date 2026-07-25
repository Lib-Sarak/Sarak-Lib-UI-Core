import { SarakDesignState } from '../types';
import { PAYLOAD_EXTRA_KEYS } from '../payloadExtraKeys';
import { getAllDesignTokens } from '../../Design/master-map';
import { DESIGN_MANIFEST } from '../manifest';
import type { DesignToken } from '../../Design/types';

/**
 * Sarak Design Validation (v12.0 — Spec 44 §2.3)
 *
 * Tema é DADO, nunca código: toda entrada (localStorage, `customThemes`, JSON
 * exportado) passa por aqui antes de virar CSS Variable. Domínio de chaves
 * FECHADO (só tokens do catálogo + `PAYLOAD_EXTRA_KEYS`) e valor TIPADO por
 * `token.type` — qualquer chave/valor fora do contrato é descartado com
 * `console.warn`, nunca injetado. É isto que torna localStorage e um JSON de
 * tema escrito à mão seguros por construção, independente de onde vieram.
 */

let tokenIndexCache: Map<string, DesignToken> | null = null;
const getTokenIndex = (): Map<string, DesignToken> => {
    if (!tokenIndexCache) {
        tokenIndexCache = new Map(getAllDesignTokens().map((token) => [token.id, token]));
    }
    return tokenIndexCache;
};

// União de duas fontes de "chave conhecida fora do catálogo tipado": os campos
// legados/branding (`PAYLOAD_EXTRA_KEYS`, ver types.ts) + as chaves do manifesto
// legado de CSS Vars (`DESIGN_MANIFEST`, manifest.ts) que ainda não migraram para
// `MASTER_DESIGN_MAP`. Sem `token.type` para tipar, entram pela checagem genérica
// (`isSafeExtraValue`) — ainda bloqueadas para HTML/CSS cru, só não tipo-checadas
// por enum/faixa numérica como os tokens do catálogo principal.
const ALLOWED_EXTRA_KEYS = new Set<string>([
    ...(PAYLOAD_EXTRA_KEYS as readonly string[]),
    ...Object.keys(DESIGN_MANIFEST)
]);

/** Caracteres que permitem escapar de uma declaração CSS (`--x:VALOR;`) ou de
 * uma tag `<style>` (breakout de HTML). Nenhum valor de tema pode contê-los. */
const CSS_BREAKOUT_PATTERN = /[<>{};]/;

const isSafeCssString = (value: string): boolean => !CSS_BREAKOUT_PATTERN.test(value);

/** Cores aceitas: hex, rgb()/rgba(), hsl()/hsla(), `var(--x, fallback)` e as
 * palavras-chave seguras. Rejeita qualquer outra coisa (inclui `url()`, que não
 * tem razão de aparecer num valor de cor e é vetor clássico de SSRF/injeção). */
const COLOR_PATTERN = /^(#[0-9a-fA-F]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\sa-z]+\)|var\(--[a-zA-Z0-9-]+(\s*,\s*[^;<>{}]*)?\)|transparent|currentColor|inherit|none)$/;

const isValidColor = (value: unknown): boolean =>
    typeof value === 'string' && isSafeCssString(value) && COLOR_PATTERN.test(value.trim());

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const getNumberBounds = (token: DesignToken): { min?: number; max?: number } => ({
    min: token.min ?? token.constraints?.min,
    max: token.max ?? token.constraints?.max
});

const clampNumber = (value: number, token: DesignToken): number => {
    const { min, max } = getNumberBounds(token);
    let result = value;
    if (typeof min === 'number') result = Math.max(result, min);
    if (typeof max === 'number') result = Math.min(result, max);
    return result;
};

const getEnumOptions = (token: DesignToken): string[] | null => {
    const options = token.constraints?.options ?? token.options;
    if (!options || options.length === 0) return null;
    return options.map((opt) => String(opt.value ?? opt.id ?? '')).filter(Boolean);
};

/** Checagem recursiva e genérica p/ campos fora do catálogo de tokens visuais
 * (`PAYLOAD_EXTRA_KEYS`: branding/estrutura) — não têm `token.type`, mas ainda
 * assim não podem carregar HTML/CSS cru em nenhum nível de aninhamento. */
const isSafeExtraValue = (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return isSafeCssString(value);
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.every(isSafeExtraValue);
    if (typeof value === 'object') return Object.values(value as Record<string, unknown>).every(isSafeExtraValue);
    return false;
};

/** Valida um valor de RESPONSIVE (`{ desk, tab, mob }`) token a token, clampando
 * cada eixo dentro dos limites do token — nunca deixa passar um eixo fora do tipo. */
const validateResponsiveValue = (token: DesignToken, value: Record<string, unknown>): Record<string, number> | null => {
    const axes: Array<'desk' | 'tab' | 'mob'> = ['desk', 'tab', 'mob'];
    const result: Record<string, number> = {};
    for (const axis of axes) {
        const axisValue = value[axis];
        if (!isFiniteNumber(axisValue)) return null;
        result[axis] = clampNumber(axisValue, token);
    }
    return result;
};

/** Tipo-checa e (quando aplicável) clampa um valor contra o contrato do token.
 * Retorna `undefined` quando o valor está fora do contrato — o chamador descarta. */
const coerceTokenValue = (token: DesignToken, value: unknown): unknown => {
    const isResponsiveShape = value !== null && typeof value === 'object' && !Array.isArray(value) && 'desk' in (value as Record<string, unknown>);

    if (token.isResponsive && isResponsiveShape) {
        return validateResponsiveValue(token, value as Record<string, unknown>) ?? undefined;
    }

    switch (token.type) {
        case 'number':
        case 'slider':
            return isFiniteNumber(value) ? clampNumber(value, token) : undefined;
        case 'boolean':
            return typeof value === 'boolean' ? value : undefined;
        case 'select': {
            if (typeof value !== 'string' || !isSafeCssString(value)) return undefined;
            const enumOptions = getEnumOptions(token);
            // Sem enum declarado no schema: aceita como string segura (não há
            // lista fechada para validar contra) — ainda bloqueado por HTML/CSS cru.
            if (!enumOptions) return value;
            return enumOptions.includes(value) ? value : undefined;
        }
        case 'color':
            return isValidColor(value) ? value : undefined;
        case 'string':
        case 'text':
        case 'font':
        case 'image':
        case 'file':
        default:
            return typeof value === 'string' && isSafeCssString(value) ? value : undefined;
    }
};

/** Uma violação de contrato encontrada num payload de tema (Spec 40.4 L1/L3). */
export interface TokenContractDrift {
    token: string;
    fonte: string;
    valor: unknown;
    motivo: string;
}

/** Descreve, para humano, por que `coerceTokenValue` rejeitou o valor. */
const describeDriftReason = (token: DesignToken, value: unknown): string => {
    if (token.isResponsive && value !== null && typeof value === 'object' && !Array.isArray(value) && 'desk' in (value as Record<string, unknown>)) {
        return 'eixo responsivo não-numérico (tipo)';
    }
    switch (token.type) {
        case 'number':
        case 'slider':
            return 'tipo (esperado number finito)';
        case 'boolean':
            return 'tipo (esperado boolean)';
        case 'select':
            if (typeof value !== 'string' || !isSafeCssString(value)) return 'tipo (esperado string segura)';
            return getEnumOptions(token) ? 'enum ausente (valor fora de constraints.options)' : 'tipo (esperado string segura)';
        case 'color':
            return 'formato de cor inválido (fora de COLOR_PATTERN)';
        default:
            return 'string insegura (fora de isSafeCssString)';
    }
};

/**
 * Audita um payload de tema (fonte = defaults do MASTER_DESIGN_MAP ou tema/preset
 * shippado pela lib) contra o contrato de cada token, SEM efeito colateral
 * (nunca `console.warn` — puro, para uso em gate/teste). Devolve todo valor que
 * `coerceTokenValue` rejeitaria — a mesma função que `validateDesign` usa em
 * runtime, então a auditoria nunca diverge do comportamento real (Spec 40.4 L1).
 */
export const auditTokenContract = (fonte: string, design: Record<string, unknown>): TokenContractDrift[] => {
    const tokenIndex = getTokenIndex();
    const drift: TokenContractDrift[] = [];
    Object.entries(design).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        const token = tokenIndex.get(key);
        if (!token) return; // fora do MASTER_DESIGN_MAP (branding/legado) — fora do escopo desta auditoria
        if (coerceTokenValue(token, value) === undefined) {
            drift.push({ token: key, fonte, valor: value, motivo: describeDriftReason(token, value) });
        }
    });
    return drift;
};

export const validateDesign = (design: unknown): SarakDesignState => {
    if (!design) return {} as SarakDesignState;
    const input = design as Record<string, unknown>;
    const tokenIndex = getTokenIndex();
    const s: Record<string, unknown> = {};

    Object.entries(input).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;

        const token = tokenIndex.get(key);
        if (token) {
            const coerced = coerceTokenValue(token, value);
            if (coerced === undefined) {
                console.warn(`[Sarak:Design] Token "${key}" com valor fora do contrato — descartado.`, value);
                return;
            }
            s[key] = coerced;
            return;
        }

        if (ALLOWED_EXTRA_KEYS.has(key)) {
            if (!isSafeExtraValue(value)) {
                console.warn(`[Sarak:Design] Campo "${key}" com valor inseguro — descartado.`, value);
                return;
            }
            s[key] = value;
            return;
        }

        console.warn(`[Sarak:Design] Chave "${key}" desconhecida no schema de tema — descartada.`, value);
    });

    // Fallbacks Estruturais (v9.0+ Resilience) — só para chaves que NÃO são
    // tokens do catálogo (`navigationStyle`/`sidebarWidth`/`topbarHeight`/
    // `fontScale`/`borderRadius`/`glassBlur`/`glassOpacity`/`contrastCurve` já são
    // tokens reais de `MASTER_DESIGN_MAP` — o default deles vem do
    // `getDefaultDesignState()` no seed, ANTES desta função rodar; forçá-los aqui
    // de novo sobrescreveria valores responsivos válidos — ex.: `sidebarWidth` é
    // `{ desk, tab, mob }` — com um número escalar). `animationSpeed`/
    // `hapticIntensity`/`scaleRatio` não estão em `MASTER_DESIGN_MAP` (só no
    // manifesto legado, `DESIGN_MANIFEST`) e não têm seed garantido — por isso
    // seguem com fallback explícito aqui.
    if (typeof s.animationSpeed !== 'number') s.animationSpeed = 0.4;
    if (typeof s.hapticIntensity !== 'number') s.hapticIntensity = 0;
    if (typeof s.scaleRatio !== 'number') s.scaleRatio = 1;
    if (typeof s.borderRadius !== 'number') s.borderRadius = 12;

    if (!s.atmosphere) s.atmosphere = { texture: 'dots', noise: 0.05, opacity: 0.1, spotlight: true };
    if (!s.specialized) s.specialized = { chatBubbleStyle: 'glass', flowGridStyle: 'dots', chartType: 'line' };

    s.schema_version = "12.0"; // Upgrade to v12.0 (Schema-Validated Design Engine)

    // Seam cast (Spec 65): o acumulador dinâmico vira o estado tipado na fronteira.
    return s as unknown as SarakDesignState;
};
