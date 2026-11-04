export type ChromeMobileNavigationStyle = 'auto' | 'bottom' | 'drawer';
export type ChromeMobileNavigationMode = 'bottom' | 'drawer';

/** Acima disto a barra da base não comporta os destinos (alvo de toque + rótulo legível) e a gaveta assume. */
export const BOTTOM_NAV_MAX_ITEMS = 5;

// @sarak-token-reader mobileNavigationStyle tabela
/** Valor fora da lista (tema antigo, JSON escrito à mão) cai em `auto`, o default do schema. */
export const resolveMobileNavigationStyle = (value: unknown): ChromeMobileNavigationStyle =>
    value === 'bottom' || value === 'drawer' ? value : 'auto';

/**
 * Onde a navegação mora no celular. `auto` escolhe a barra na base até `BOTTOM_NAV_MAX_ITEMS`
 * destinos e a gaveta acima disso; `bottom` e `drawer` forçam. Sem destino nenhum não há o que
 * pôr numa barra, então a gaveta (que já esconde a região vazia) fica com a navegação. Com grupos recolhíveis a
 * gaveta também assume, mesmo forçada a barra da base: a barra não tem onde abrir os filhos.
 */
export const resolveMobileNavigationMode = (
    style: ChromeMobileNavigationStyle,
    itemCount: number,
    hasGroups = false,
): ChromeMobileNavigationMode => {
    if (itemCount === 0 || style === 'drawer' || hasGroups) return 'drawer';
    if (style === 'bottom') return 'bottom';
    return itemCount <= BOTTOM_NAV_MAX_ITEMS ? 'bottom' : 'drawer';
};
