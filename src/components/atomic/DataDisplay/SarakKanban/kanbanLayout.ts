/**
 * Classes de layout do SarakKanban. Literais de propósito: o Tailwind lê o arquivo como
 * texto (container query nunca é montada por interpolação). Mobile-first: no celular o
 * quadro rola na horizontal com UMA coluna por vez, quase da largura do contêiner; do
 * tablet para cima a coluna volta à largura derivada do token de espaçamento.
 */

/** Plantada no quadro: as colunas e o campo de nova coluna medem o contêiner dele. */
export const KANBAN_BOARD_CLASS = '@container snap-x snap-mandatory @min-[768px]:snap-none';

/** Cada coluna (e o campo de nova coluna) ocupa uma "página" de rolagem. */
export const KANBAN_COLUMN_CLASS =
    'shrink-0 snap-start basis-[88cqi] @min-[768px]:basis-[calc(var(--sarak-layout-gap-md,16px)*17)]';
