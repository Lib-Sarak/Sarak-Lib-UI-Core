/**
 * SarakKanban — barrel (Spec 12, Regra 3 · Onda 10). Zero-dep (DnD HTML5 nativo) →
 * SEM `React.lazy`; registrado nativamente como componente leve.
 */

export { default as SarakKanban } from './SarakKanbanImpl';
export type { SarakKanbanProps } from './SarakKanbanImpl';
export type { KanbanCard, KanbanColumn, CardMove } from './kanbanModel';
export { moveCard } from './kanbanModel';
