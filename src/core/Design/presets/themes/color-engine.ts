import { MASTER_DESIGN_MAP } from '../../master-map';
import { shiftColorMode, parseToRgba, rgbToHsl, hslToRgb, rgbToHex } from '../../../Provider/utils/color-engine';
import type { SarakTokenValue } from '../../types';
import type { SarakDesignState } from '../../../Provider/types';

/**
 * Motor de Cores Semântico em Tempo de Execução (v11.3)
 * Aplica inversão de cores mantendo consistência visual ao alternar entre Light/Dark Mode.
 * Mapeamento EXAUSTIVO baseado em catalog/theme_table_mapping.json para garantir 100% de visibilidade.
 */

// 1. TOKENS DE TEXTO E ELEMENTOS DE FRENTE (Devem ficar ESCUROS no modo claro)
const EXPLICIT_TEXT_TOKENS = new Set([
    'textColorMaster',
    'textColorSecondary',
    'textColorMuted',
    'titleColor',
    'cardTitleColor',
    'cardActionBtnText',
    'cardSearchPlaceholderColor',
    'cardSearchTextFocusColor',
    'btnPrimaryText',
    'topbarTitleColor',
    'textureColor',
    'identityFontFamily', // Embora seja fonte, pode ser processado se for cor em alguns contextos
    'identityTracking'
]);

// 2. TOKENS DE MARCA, STATUS E ACENTO (Preservam Matiz com ajuste fino)
const EXPLICIT_PRIMARY_TOKENS = new Set([
    'primaryColor',
    'secondaryColor',
    'tertiaryColor',
    'accentColor',
    'statusSuccessColor',
    'statusErrorColor',
    'statusWarningColor',
    'statusInfoColor',
    'navItemActiveColor',
    'navActiveMarkerColor',
    'navActiveMarkerGlow',
    'checkboxActiveColor',
    'switchTrackActiveBg',
    'switchPulseColor',
    'btnPrimaryBg',
    'cardActionBtnPrimaryBg',
    'cardActionBtnHoverBg',
    'cardGlowColor',
    'btnNeonGlowColor',
    'securityShieldGlow',
    'aiGlowColor'
]);

// 3. TOKENS DE BORDA, LINHA E SEPARADORES (Contraste Suave)
const EXPLICIT_BORDER_TOKENS = new Set([
    'cardBorderColor',
    'cardBorderTop',
    'cardBorderBottom',
    'cardBorderLeft',
    'cardBorderRight',
    'cardHeaderBorder',
    'cardFooterBorder',
    'tableBorderColor',
    'matrixBorderColor',
    'borderWidth',
    'inputBorderColor', // Adicionado para inputs
    'sidebarShadow',
    'focusRingWidth'
]);

// 4. TOKENS DE FUNDO E SUPERFÍCIE (Devem ficar CLAROS no modo claro)
// Qualquer token que NÃO estiver nos Sets acima e for do tipo 'color' cairá aqui como fallback.
const EXPLICIT_BG_TOKENS = new Set([
    'colorBgBody',
    'colorBgLayer1',
    'colorBgLayer2',
    'colorBgModal',
    'surfaceColor',
    'bgBaseColor',
    'cardBackgroundColor',
    'cardHeaderBg',
    'cardFooterBg',
    'cardSearchBgFocus',
    'sidebarColor',
    'topbarColor',
    'modalOverlayColor',
    'tooltipBg',
    'chartTooltipBg',
    'tableHeaderBg',
    'tableRowHoverBg',
    'inputBg',
    'btnSecondaryBg',
    'btnGhostHoverBg',
    'chatUserBg',
    'matrixItemBg',
    'matrixSearchBg',
    'aiPanelBg',
    'scrollThumbColor',
    'chartGridOpacity'
]);

// Extrai 100% dos tokens padrão do Sarak para Fallback
const baseDefaults: Record<string, SarakTokenValue> = {};
const colorTokens: Set<string> = new Set();
const semanticRoles: Record<string, 'bg' | 'text' | 'border' | 'primary'> = {};

MASTER_DESIGN_MAP.components.forEach(comp => {
    comp.tokens.forEach(token => {
        baseDefaults[token.id] = token.defaultValue;
        if (token.type === 'color') {
            colorTokens.add(token.id);
            if (token.semanticRole) {
                semanticRoles[token.id] = token.semanticRole;
            }
        }
    });
});

/**
 * Resolve semantic mapping using early returns to satisfy Clean Code AST auditor
 */
const resolveSemanticRole = (tokenId: string, idLower: string, fallback: 'bg' | 'text' | 'border' | 'primary'): 'bg' | 'text' | 'border' | 'primary' => {
    // 1. Prioridade para Mapeamento Explícito
    if (semanticRoles[tokenId]) return semanticRoles[tokenId];
    if (EXPLICIT_TEXT_TOKENS.has(tokenId)) return 'text';
    if (EXPLICIT_PRIMARY_TOKENS.has(tokenId)) return 'primary';
    if (EXPLICIT_BORDER_TOKENS.has(tokenId)) return 'border';
    if (EXPLICIT_BG_TOKENS.has(tokenId)) return 'bg';
    
    // 2. Heurística de Fallback
    if (idLower.includes('text') || idLower.includes('title') || idLower.includes('label') || idLower.includes('value')) return 'text';
    if (idLower.includes('border') || idLower.includes('stroke')) return 'border';
    if (idLower.includes('bg') || idLower.includes('surface') || idLower.includes('layer')) return 'bg';
    
    return fallback;
};

/**
 * Decisão C (plan-24-1 §2.8/§3.1 item 7) — papel `onPrimary`. As faixas fixas
 * de `shiftColorMode` para `text` (escuro: L ≥ 85) e `primary` (escuro: L ≥
 * 45, aceita até 100) SE SOBREPÕEM: um botão primário é texto sentado sobre
 * uma primária, e a faixa fixa não garante separação entre as duas.
 * Estes são os pares onde isso acontece de fato (espelho do `PAIRS` de
 * `gates/scripts/audit/verify_contrast.ts` — não importado de lá porque
 * `gates/` é ferramenta de desenvolvimento e nunca deve entrar no bundle
 * publicado; mantenha os dois em sincronia se um par mudar).
 */
const ON_PRIMARY_TEXT_PAIRS: Record<string, string[]> = {
    btnPrimaryText: ['btnPrimaryBg'],
    cardActionBtnText: ['cardActionBtnPrimaryBg', 'cardActionBtnHoverBg'],
    // `navItemActiveColor` é "cor de texto/ícone do item de menu selecionado"
    // (schema `navigation.ts`) — funcionalmente texto, mesmo classificado
    // como 'primary' na tabela de papéis acima (preserva o tom de marca em
    // vez de virar preto/branco genérico). `sidebarActiveColor`/
    // `topbarActiveColor` default para `transparent` — por isso o fundo
    // real, na ausência de override, é `sidebarColor`/`topbarColor`; os dois
    // entram na lista para o "pior fundo" escolher o que vale de verdade.
    navItemActiveColor: ['sidebarActiveColor', 'sidebarColor', 'topbarActiveColor', 'topbarColor'],
};

/** Luminância relativa WCAG — só para ESCOLHER a direção (nunca o matiz/saturação). */
const relativeLuminance = (r: number, g: number, b: number): number => {
    const chan = (c: number) => {
        const cs = c / 255;
        return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
};

const contrastRatio = (a: [number, number, number], b: [number, number, number]): number => {
    const [la, lb] = [relativeLuminance(...a), relativeLuminance(...b)];
    const [hi, lo] = la > lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
};

/**
 * Calcula L (HSL) do texto EM RELAÇÃO AO FUNDO REAL (já deslocado para o
 * `targetMode`) — não por faixa fixa. Compara os dois extremos (bem escuro,
 * bem claro) contra o PIOR dos fundos que este token realmente compõe
 * (`ON_PRIMARY_TEXT_PAIRS`) e escolhe o lado que dá mais contraste,
 * preservando o matiz/saturação originais do texto. NÃO escolhe cor nova —
 * só desloca luminosidade, exatamente como o solucionador da `plan-24-1`.
 */
const resolveOnPrimaryTextValue = (tokenId: string, originalValue: string, shiftedBgIds: string[], result: Record<string, SarakTokenValue>): string => {
    const { r, g, b, a } = parseToRgba(originalValue);
    const [h, s, l] = rgbToHsl(r, g, b);

    // Fundo translúcido: compõe sobre `colorBgBody` JÁ DESLOCADO — o mesmo
    // fundo-padrão que o solucionador usa quando não há um container mais
    // específico (`solve_theme_contrast.ts`, `plan-24` §3.4). Não é "preto
    // E branco no pior caso": um par com alfa < 30% NUNCA teria solução
    // nenhuma sob essa regra (o extremo que serve para o composto sobre
    // preto é o oposto do que serve sobre branco) — o fundo real do tema é
    // conhecido, então é ele que entra, não os dois extremos hipotéticos.
    const bodyRgb = parseToRgba(String(result.colorBgBody ?? '#000000'));
    const bgRgbs = shiftedBgIds
        .map((bgId) => parseToRgba(String(result[bgId] ?? '')))
        .filter((c) => c.a > 0)
        .map((c): [number, number, number] =>
            c.a >= 0.999
                ? [c.r, c.g, c.b]
                : [
                      c.a * c.r + (1 - c.a) * bodyRgb.r,
                      c.a * c.g + (1 - c.a) * bodyRgb.g,
                      c.a * c.b + (1 - c.a) * bodyRgb.b,
                  ],
        );
    if (bgRgbs.length === 0) return originalValue;

    // Direção: o lado que dá mais contraste contra o PIOR dos fundos (o de
    // menor razão alcançável nos dois extremos).
    const piorBg = bgRgbs.reduce((worst, atual) =>
        Math.min(contrastRatio([0, 0, 0], atual), contrastRatio([255, 255, 255], atual)) <
        Math.min(contrastRatio([0, 0, 0], worst), contrastRatio([255, 255, 255], worst))
            ? atual
            : worst,
    );
    const escuroGanha = contrastRatio([0, 0, 0], piorBg) >= contrastRatio([255, 255, 255], piorBg);
    const extremo = escuroGanha ? 0 : 100;

    // Busca binária pelo L mais PRÓXIMO do extremo do lado certo que ainda
    // cobre 4,5:1 contra TODOS os fundos (não só o pior) — mesma técnica do
    // solucionador (`solve_theme_contrast.ts`), aplicada aqui no MOTOR.
    const ratioContraTodos = (candidateL: number): number => {
        const [cr, cg, cb] = hslToRgb(h, s, candidateL);
        return Math.min(...bgRgbs.map((bg) => contrastRatio([cr, cg, cb], bg)));
    };
    let lo = escuroGanha ? 0 : l;
    let hi = escuroGanha ? l : 100;
    for (let i = 0; hi - lo > 0.25 && i < 64; i += 1) {
        const mid = (lo + hi) / 2;
        const passes = ratioContraTodos(mid) >= 4.5;
        if (escuroGanha) {
            if (passes) lo = mid; else hi = mid;
        } else {
            if (passes) hi = mid; else lo = mid;
        }
    }
    // Margem de 0,5 contra o arredondamento de ida-e-volta HSL<->hex (8 bits
    // por canal) — mesma razão do solucionador. Se nem o extremo alcançar,
    // fica no extremo mesmo assim (o melhor que dá para fazer preservando H/S).
    const newL = Math.max(0, Math.min(100, escuroGanha ? lo - 0.5 : hi + 0.5));
    const finalL = ratioContraTodos(newL) >= 4.5 || ratioContraTodos(extremo) < 4.5 ? newL : extremo;
    const [newR, newG, newB] = hslToRgb(h, s, finalL);
    return rgbToHex(newR, newG, newB, a < 1 ? a : undefined);
};

/**
 * Recebe um Rascunho (Draft) ou Base Theme e força as cores de acordo com o targetMode.
 * Utiliza o algoritmo HSL dinâmico para preservar a identidade (Hue/Saturation) do tema.
 */
export const syncThemeWithMode = (draftTokens: Record<string, SarakTokenValue>, targetMode: 'light' | 'dark'): Record<string, SarakTokenValue> => {
    const merged = { ...baseDefaults, ...draftTokens };
    const result: Record<string, SarakTokenValue> = { ...merged, mode: targetMode };

    // 1ª passada: todos os tokens de cor, PELA FAIXA FIXA de sempre — inclusive
    // os fundos `primary` que a 2ª passada (onPrimary) vai precisar já prontos.
    colorTokens.forEach(tokenId => {
        if (ON_PRIMARY_TEXT_PAIRS[tokenId]) return; // adiado para a 2ª passada
        const originalValue = merged[tokenId];
        if (!originalValue) return;

        let semantic: 'bg' | 'text' | 'border' | 'primary' = semanticRoles[tokenId] || 'bg';
        const idLower = tokenId.toLowerCase();

        semantic = resolveSemanticRole(tokenId, idLower, semantic);

        result[tokenId] = shiftColorMode(String(originalValue), targetMode, semantic);
    });

    // 2ª passada (Decisão C): texto que senta SOBRE uma primária — calcula L
    // contra o fundo já deslocado, não pela faixa fixa de `text`.
    Object.entries(ON_PRIMARY_TEXT_PAIRS).forEach(([tokenId, bgIds]) => {
        const originalValue = merged[tokenId];
        if (!originalValue) return;
        result[tokenId] = resolveOnPrimaryTextValue(tokenId, String(originalValue), bgIds, result);
    });

    // Ajustes Ópticos Específicos (v11.3)
    if (targetMode === 'light') {
        result.colorBgModal = 'rgba(255, 255, 255, 0.8)';
        result.cardInnerGlowColor = 'transparent';
        result.vignetteOpacity = 0;
        result.shadowIntensity = Math.min(Number(result.shadowIntensity) || 0, 0.25);
        result.shadowAmbientAlpha = Math.min(Number(result.shadowAmbientAlpha) || 0, 0.08);
        result.shadowProjectionAlpha = Math.min(Number(result.shadowProjectionAlpha) || 0, 0.1);
        result.layerBackdropOpacity = Math.min(Number(result.layerBackdropOpacity) || 0, 0.02);
        // Texturas e Ruídos são preservados no claro (apenas a cor inverte via motor)
        // result.cardTextureOpacity e result.textureOpacity não são mais forçados a 0.05/0.03
        result.noiseIntensity = 0.01;
    } else {
        result.colorBgModal = 'rgba(15, 15, 15, 0.8)';
        result.cardInnerGlowColor = 'rgba(255, 255, 255, 0.05)';
    }

    return result;
};

/** O que `resolveThemeForMode` precisa de um tema — `ThemePreset` e `ThemeEntry` batem por estrutura. */
export interface ModeResolvableTheme {
    design: Record<string, SarakTokenValue>;
    contraparte?: Partial<SarakDesignState>;
}

/**
 * A função ÚNICA que decide o que aplicar quando um tema é escolhido ou tem o
 * modo alternado (plan-26). Resolve a regressão da Decisão D: depois dela,
 * `applyFullConfigRaw(theme.design)` cru trocava o MODO DO USUÁRIO pelo modo
 * nativo do tema — a preferência dele tem de vencer, sempre.
 *
 * Três casos, nesta ordem:
 *  1. modo pedido = modo nativo do tema        → `theme.design`, tal como escrito.
 *  2. modo pedido ≠ nativo, e HÁ `contraparte`  → `{ ...design, ...contraparte, mode }`
 *     — bloco AUTORADO, nunca sintetizado.
 *  3. modo pedido ≠ nativo, e NÃO há `contraparte` → `syncThemeWithMode` — o
 *     fallback dos 18 temas legados (decisão do dono: eles não são autorados).
 *
 * NÃO resolve com conversão automática por padrão: `syncThemeWithMode` só
 * entra quando o autor não deixou nada escrito para o modo oposto.
 */
export const resolveThemeForMode = (
    theme: ModeResolvableTheme,
    modo: 'light' | 'dark',
): Record<string, SarakTokenValue> => {
    const nativeMode: 'light' | 'dark' = (theme.design.mode as 'light' | 'dark') || 'dark';
    if (modo === nativeMode) {
        return theme.design;
    }
    if (theme.contraparte) {
        return { ...theme.design, ...theme.contraparte, mode: modo } as unknown as Record<string, SarakTokenValue>;
    }
    return syncThemeWithMode(theme.design, modo);
};
