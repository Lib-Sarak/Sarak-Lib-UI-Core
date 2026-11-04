/**
 * Breakpoints do painel de customização como CONTAINER QUERY, não viewport —
 * fecha o "Tier B" de `specs/specs/06-painel-de-customizacao-e-preview.md` §6.2). A classe
 * com o número vive aqui, num `.ts`, fora da varredura do auditor de hardcode — que só
 * coleta `.tsx` (`specs/arquitetura/00-mapa-do-modulo.md` §5.1: é onde a lógica de
 * breakpoint deve morar quando cresce, mesmo idioma de `useStructuralStyles.presets.ts`).
 *
 * As grades dos subcatálogos usam os limiares antigos (`md:` = 768 = `BREAKPOINT_TABLET`,
 * `lg:` = 1024 = `BREAKPOINT_DESKTOP`). A grade de temas começa quando cabem dois cartões
 * de 112 px com o vão de 16 px. Todos medem o container, nunca a janela.
 *
 * As classes são escritas LITERAL de propósito: o scanner do Tailwind v4 lê o
 * arquivo como TEXTO — uma classe montada por interpolação de template literal nunca vira
 * classe válida, e a regra correspondente nunca é gerada no CSS publicado. O teste companheiro
 * compara a forma literal com a medida calculada, para pegar deriva se a largura mínima mudar.
 */
export const CATALOG_GRID_2COL = 'grid-cols-1 @min-[768px]:grid-cols-2';
export const CATALOG_GRID_3COL = 'grid-cols-1 @min-[768px]:grid-cols-2 @min-[1024px]:grid-cols-3';
export const THEME_GALLERY_CARD_MIN_WIDTH = 112;
export const THEME_GALLERY_GRID_GAP = 16;
export const THEME_GALLERY_GRID_MIN_WIDTH = THEME_GALLERY_CARD_MIN_WIDTH * 2 + THEME_GALLERY_GRID_GAP;
export const THEME_GALLERY_GRID_2COL = 'grid-cols-1 @min-[240px]:grid-cols-2';

/**
 * O painel inteiro (coluna de decisões + prévia) também mede o seu CONTÊINER: acima de `PANEL_SPLIT_MIN_WIDTH`
 * a coluna fica ao lado da prévia; abaixo, as duas empilham e o painel rola, com a prévia ao alcance. Vale no
 * modo embarcado, onde o painel mora num cartão da página do host e a janela nada diz sobre o espaço dele.
 */
/** A variável que carrega a largura da coluna (a que o usuário arrasta) até a classe de contêiner. */
export const PANEL_COLUMN_WIDTH_VAR = '--sarak-design-engine-sidebar-w';
export const PANEL_SPLIT_MIN_WIDTH = 640;
export const PANEL_SPLIT_ROW = '@min-[640px]:flex-row @min-[640px]:overflow-hidden';
export const PANEL_SPLIT_COLUMN = 'border-b @min-[640px]:border-b-0 @min-[640px]:border-r @min-[640px]:w-[var(--sarak-design-engine-sidebar-w,320px)] @min-[640px]:h-full @min-[640px]:max-h-full @min-[640px]:min-w-[var(--sarak-design-engine-sidebar-min-w,280px)] @min-[640px]:max-w-[var(--sarak-design-engine-sidebar-max-w,600px)]';
export const PANEL_SPLIT_HANDLE = 'hidden @min-[640px]:block';
export const PANEL_SPLIT_PREVIEW = '@min-[640px]:h-full @min-[640px]:flex-1';
export const PANEL_STACKED_COLUMN_HEIGHT = 'h-[32rem]';
export const PANEL_STACKED_PREVIEW_MIN_HEIGHT = 'min-h-[32rem]';
export const PREVIEW_TOOLBAR_HINT = 'hidden @min-[900px]:block';

export interface PreviewLayoutPreset {
    rowClassName: string;
    frameClassName: string;
    frameStyle: { height?: string };
}

/** A prévia é um quadro só e ocupa a área inteira; a galeria saiu de cima dela. */
export const getPreviewLayoutPreset = (): PreviewLayoutPreset => ({
    rowClassName: 'flex-row justify-center',
    frameClassName: 'w-full min-w-[min(100%,var(--sarak-device-desktop-min-width,250px))] min-h-[var(--sarak-engine-min-h-sm,300px)] flex-1',
    frameStyle: {},
});
