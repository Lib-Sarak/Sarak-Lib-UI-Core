import { MASTER_DESIGN_MAP } from '../../master-map';

/**
 * Motor de Cores Semântico em Tempo de Execução
 * Aplica inversão de cores mantendo consistência visual ao alternar entre Light/Dark Mode.
 */

// Extrai 100% dos tokens padrão do Sarak
const baseDefaults: Record<string, any> = {};
MASTER_DESIGN_MAP.components.forEach(comp => {
    comp.tokens.forEach(token => {
        baseDefaults[token.id] = token.defaultValue;
    });
});

/**
 * Recebe um Rascunho (Draft) ou Base Theme e força as cores de acordo com o targetMode.
 * Mantém todos os outros tokens (raios, fontes, animações) inalterados.
 */
export const syncThemeWithMode = (draftTokens: Record<string, any>, targetMode: 'light' | 'dark'): Record<string, any> => {
    const isLight = targetMode === 'light';
    
    // Mescla o input com os defaults caso algo falte
    const merged = { ...baseDefaults, ...draftTokens, mode: targetMode };

    if (isLight) {
        return {
            ...merged,
            bgBaseColor: '#f8fafc',
            colorBgBody: '#f8fafc',
            colorBgLayer1: '#ffffff',
            colorBgLayer2: '#f1f5f9',
            colorBgModal: 'rgba(255, 255, 255, 0.8)',
            textColorMaster: '#0f172a',
            textColorSecondary: 'rgba(15, 23, 42, 0.7)',
            textColorMuted: 'rgba(15, 23, 42, 0.4)',
            cardBackgroundColor: 'rgba(255, 255, 255, 0.6)',
            cardTitleColor: '#0f172a',
            cardBorderColor: 'rgba(0, 0, 0, 0.05)',
            cardInnerGlowColor: 'transparent',
            cardSearchTextFocusColor: '#0f172a',
            cardSearchPlaceholderColor: 'rgba(15, 23, 42, 0.4)',
            topbarColor: 'rgba(255, 255, 255, 0.8)',
            topbarTitleColor: '#0f172a',
            sidebarColor: 'rgba(255, 255, 255, 0.8)',
            tableHeaderBg: 'rgba(0, 0, 0, 0.03)',
            tableRowHoverBg: 'rgba(0, 0, 0, 0.02)',
            tableBorderColor: 'rgba(0, 0, 0, 0.05)',
            inputBg: 'rgba(0, 0, 0, 0.03)',
            btnSecondaryBg: 'rgba(0, 0, 0, 0.05)',
            btnPrimaryText: '#ffffff',
            chatUserBg: 'rgba(0, 0, 0, 0.05)'
        };
    } else {
        return {
            ...merged,
            bgBaseColor: '#050505',
            colorBgBody: '#050505',
            colorBgLayer1: '#0f0f0f',
            colorBgLayer2: '#1a1a1a',
            colorBgModal: 'rgba(15, 15, 15, 0.8)',
            textColorMaster: '#ffffff',
            textColorSecondary: 'rgba(255, 255, 255, 0.7)',
            textColorMuted: 'rgba(255, 255, 255, 0.4)',
            cardBackgroundColor: 'rgba(15, 23, 42, 0.6)',
            cardTitleColor: '#ffffff',
            cardBorderColor: 'rgba(255, 255, 255, 0.1)',
            cardInnerGlowColor: 'rgba(255, 255, 255, 0.05)',
            cardSearchTextFocusColor: '#ffffff',
            cardSearchPlaceholderColor: 'rgba(255, 255, 255, 0.4)',
            topbarColor: '#000000',
            topbarTitleColor: '#ffffff',
            sidebarColor: '#000000',
            tableHeaderBg: 'rgba(255, 255, 255, 0.03)',
            tableRowHoverBg: 'rgba(255, 255, 255, 0.02)',
            tableBorderColor: 'rgba(255, 255, 255, 0.05)',
            inputBg: 'rgba(255, 255, 255, 0.03)',
            btnSecondaryBg: 'rgba(255, 255, 255, 0.05)',
            btnPrimaryText: '#000000',
            chatUserBg: 'rgba(255, 255, 255, 0.05)'
        };
    }
};
