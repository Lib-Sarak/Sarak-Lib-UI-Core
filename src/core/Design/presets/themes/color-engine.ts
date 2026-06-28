import { MASTER_DESIGN_MAP } from '../../master-map';
import { shiftColorMode } from '../../../Provider/utils/color-engine';
import type { SarakTokenValue } from '../../types';

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
 * Recebe um Rascunho (Draft) ou Base Theme e força as cores de acordo com o targetMode.
 * Utiliza o algoritmo HSL dinâmico para preservar a identidade (Hue/Saturation) do tema.
 */
export const syncThemeWithMode = (draftTokens: Record<string, SarakTokenValue>, targetMode: 'light' | 'dark'): Record<string, SarakTokenValue> => {
    const merged = { ...baseDefaults, ...draftTokens };
    const result: Record<string, SarakTokenValue> = { ...merged, mode: targetMode };

    colorTokens.forEach(tokenId => {
        const originalValue = merged[tokenId];
        if (!originalValue) return;

        let semantic: 'bg' | 'text' | 'border' | 'primary' = semanticRoles[tokenId] || 'bg';
        const idLower = tokenId.toLowerCase();

        semantic = resolveSemanticRole(tokenId, idLower, semantic);

        result[tokenId] = shiftColorMode(String(originalValue), targetMode, semantic);
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
