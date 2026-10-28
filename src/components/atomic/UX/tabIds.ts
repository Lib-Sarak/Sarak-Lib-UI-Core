/** `id` do botão da aba; é o que `aria-labelledby` do painel aponta. */
export const sarakTabElementId = (idPrefix: string, tabId: string): string => `${idPrefix}-tab-${tabId}`;

/** `id` do painel da aba; é o que `aria-controls` da aba aponta. */
export const sarakTabPanelElementId = (idPrefix: string, tabId: string): string => `${idPrefix}-panel-${tabId}`;
