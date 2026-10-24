/**
 * Breakpoints do painel de customização como CONTAINER QUERY, não viewport —
 * fecha o "Tier B" de `specs/specs/06-painel-de-customizacao-e-preview.md` §6.2). A classe
 * com o número vive aqui, num `.ts`, fora da varredura do auditor de hardcode — que só
 * coleta `.tsx` (`specs/arquitetura/00-mapa-do-modulo.md` §5.1: é onde a lógica de
 * breakpoint deve morar quando cresce, mesmo idioma de `useStructuralStyles.presets.ts`).
 *
 * A grade do catálogo conserva os limiares antigos (`md:` = 768 = `BREAKPOINT_TABLET`,
 * `lg:` = 1024 = `BREAKPOINT_DESKTOP`). O dual-view calcula seu limiar a partir da largura
 * mínima legível de cada quadro e do espaçamento. Ambos medem o container, nunca a janela.
 *
 * As classes são escritas LITERAL de propósito: o scanner do Tailwind v4 lê o
 * arquivo como TEXTO — uma classe montada por interpolação de template literal nunca vira
 * classe válida, e a regra correspondente nunca é gerada no CSS publicado. O teste companheiro
 * compara a forma literal com a medida calculada, para pegar deriva se a largura mínima mudar.
 */
export const CATALOG_GRID_2COL = 'grid-cols-1 @min-[768px]:grid-cols-2';
export const CATALOG_GRID_3COL = 'grid-cols-1 @min-[768px]:grid-cols-2 @min-[1024px]:grid-cols-3';

export const PREVIEW_MIN_FRAME_WIDTH = 250;
export const PREVIEW_LAYOUT_GAP = 24;
export const PREVIEW_DUAL_VIEW_MIN_WIDTH = PREVIEW_MIN_FRAME_WIDTH * 2 + PREVIEW_LAYOUT_GAP;

// As medidas literais são mantidas para o scanner do Tailwind; o teste deste preset
// vincula os limiares à largura mínima legível de cada quadro e ao espaçamento.
export const PREVIEW_DUAL_VIEW_ROW = '@min-[524px]:flex-row';
export const PREVIEW_DUAL_VIEW_ITEM_ROW = '@min-[524px]:flex-1 @min-[524px]:min-h-0';

export interface PreviewLayoutPreset {
    rowClassName: string;
    frameClassName: string;
    frameStyle: { height?: string };
}

export const getPreviewLayoutPreset = (isStacked: boolean): PreviewLayoutPreset => {
    if (isStacked) {
        return {
            rowClassName: 'flex-col',
            frameClassName: 'w-full shrink-0 min-h-0',
            frameStyle: { height: 'calc(100% - 1.5rem)' },
        };
    }

    return {
        rowClassName: `flex-col ${PREVIEW_DUAL_VIEW_ROW} justify-center`,
        frameClassName: `w-full min-w-[min(100%,var(--sarak-device-desktop-min-width,250px))] min-h-[var(--sarak-engine-min-h-sm,300px)] ${PREVIEW_DUAL_VIEW_ITEM_ROW}`,
        frameStyle: {},
    };
};
