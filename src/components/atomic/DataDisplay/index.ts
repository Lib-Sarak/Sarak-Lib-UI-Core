/**
 * Barrel de DataDisplay (Spec 12 — densidade de dados).
 *
 * Reúne a primitiva headless de windowing (`SarakDataGrid`) e os componentes de
 * densidade da Onda 9: `SarakDataTable` (colunar avançado), `SarakSparkline`
 * (micro-gráfico) e `SarakTreeView` (árvore hierárquica). Onda 10: `SarakKanban`.
 */

export * from './SarakDataGrid';
export * from './SarakDataTable';
export { default as SarakSparkline } from './SarakSparkline';
export type { SarakSparklineProps, SparklineVariant } from './SarakSparkline';
export { SarakTreeView } from './SarakTreeView';
export type { SarakTreeViewProps, MatrixTreeNode } from './SarakTreeView';
export * from './SarakKanban';
