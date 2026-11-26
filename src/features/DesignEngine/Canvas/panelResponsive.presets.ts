/**
 * Breakpoints do painel de customização como CONTAINER QUERY, não viewport —
 * fecha o "Tier B" de `specs/specs/06-painel-de-customizacao-e-preview.md` §6.2). A classe
 * com o número vive aqui, num `.ts`, fora da varredura do auditor de hardcode — que só
 * coleta `.tsx` (`specs/arquitetura/00-mapa-do-modulo.md` §5.1: é onde a lógica de
 * breakpoint deve morar quando cresce, mesmo idioma de `useStructuralStyles.presets.ts`).
 *
 * As grades dos subcatálogos medem a coluna: o número de colunas sai da largura dela, e cada opção tem pelo menos 8,5 rem
 * (5,5 rem nas Personalidades e nos temas). Todos medem o container, nunca a janela.
 *
 * As classes são escritas LITERAL de propósito: o scanner do Tailwind v4 lê o
 * arquivo como TEXTO — uma classe montada por interpolação de template literal nunca vira
 * classe válida, e a regra correspondente nunca é gerada no CSS publicado. O teste companheiro
 * compara a forma literal com a medida calculada, para pegar deriva se a largura mínima mudar.
 */
// sarak-allow-hardcode: a largura mínima da opção na grade do painel é medida da miniatura, conferida pelo teste companheiro; o Tailwind exige a classe literal e nenhum token a declara.
export const CATALOG_GRID = 'grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))]';
/** Os nomes antigos apontam para a mesma grade: não há mais uma de duas e uma de três colunas. */
export const CATALOG_GRID_2COL = CATALOG_GRID;
export const CATALOG_GRID_3COL = CATALOG_GRID;
/** A grade da amostra larga (a barra de topo): a miniatura precisa de escala suficiente para a barra mostrar o item ativo, então a opção é mais larga. */
// sarak-allow-hardcode: a largura mínima da opção na grade do painel é medida da miniatura, conferida pelo teste companheiro; o Tailwind exige a classe literal e nenhum token a declara.
export const WIDE_SAMPLE_GRID = 'grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]';
/** A grade das Personalidades: quadrados menores que as demais opções. */
// sarak-allow-hardcode: a largura mínima da opção na grade do painel é medida da miniatura, conferida pelo teste companheiro; o Tailwind exige a classe literal e nenhum token a declara.
export const PERSONALITY_GRID = 'grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))]';
/**
 * A grade da galeria de temas: a miniatura é o topo da tela "Painel" reduzido, e só lê com duas por linha na coluna padrão
 * (a de três linhas deixava a tela ilegível). É a mesma largura mínima das demais opções.
 */
// sarak-allow-hardcode: a largura mínima da opção na grade do painel é medida da miniatura, conferida pelo teste companheiro; o Tailwind exige a classe literal e nenhum token a declara.
export const THEME_GALLERY_GRID = 'grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))]';

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
// sarak-allow-hardcode: a altura de 32rem da coluna empilhada do painel é o mínimo para a prévia ler; o Tailwind exige a classe literal e nenhum token a declara.
export const PANEL_STACKED_COLUMN_HEIGHT = 'h-[32rem]';
// sarak-allow-hardcode: a altura de 32rem da coluna empilhada do painel é o mínimo para a prévia ler; o Tailwind exige a classe literal e nenhum token a declara.
export const PANEL_STACKED_PREVIEW_MIN_HEIGHT = 'min-h-[32rem]';
// sarak-allow-hardcode: 10rem (160 px) é a menor largura em que o texto de ajuda da prévia se lê em linhas; abaixo disso a barra o leva para a linha de baixo. O Tailwind exige a classe literal.
export const PREVIEW_TOOLBAR_HINT = 'hidden @min-[900px]:block min-w-[10rem] flex-1 basis-[10rem]';

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
