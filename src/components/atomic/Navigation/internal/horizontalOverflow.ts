/** A caixa de um item da lista horizontal, relativa à borda esquerda da área útil da barra. */
export interface OverflowCell {
    left: number;
    right: number;
}

/**
 * O primeiro item que não cabe na barra horizontal; os dali em diante vão para o "Mais". `usableRight` é a borda direita da
 * área útil. Se algum item fica de fora, o botão "Mais" (de largura `moreWidth`, a `gap` do último que fica) toma o fim da
 * área, e o item só cabe se terminar antes dele. Devolve o tamanho da lista quando tudo cabe. Barra sem largura medida
 * (`usableRight <= 0`, como no jsdom) não esconde nada.
 */
export const resolveOverflowStart = (cells: readonly OverflowCell[], usableRight: number, moreWidth: number, gap: number): number => {
    if (usableRight <= 0 || cells.length === 0) return cells.length;
    if (cells.every((cell) => cell.right <= usableRight)) return cells.length;
    const limit = usableRight - moreWidth - gap;
    const firstOut = cells.findIndex((cell) => cell.right > limit);
    return firstOut === -1 ? cells.length : firstOut;
};

/**
 * Onde o botão "Mais" começa, relativo à borda esquerda da área útil: a um vão do último item que ficou (`start` é o índice
 * devolvido por `resolveOverflowStart`). Sem item visível, ele abre a área.
 */
export const resolveMoreStart = (cells: readonly OverflowCell[], start: number, gap: number): number =>
    start > 0 && cells[start - 1] ? cells[start - 1].right + gap : 0;
