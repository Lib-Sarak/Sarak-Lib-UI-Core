/**
 * SarakKanban — barrel. Carregado sob demanda: a biblioteca de arrastar (`@dnd-kit`, peer
 * opcional) só entra quando um quadro é de fato renderizado. A lógica pura (`kanbanModel`)
 * fica FORA da fronteira lazy e continua exportada.
 */

export { SarakKanban } from './SarakKanban';
export type { SarakKanbanProps } from './SarakKanbanImpl';
export type {
    SarakCardMove,
    SarakKanbanAssignee,
    SarakKanbanCard,
    SarakKanbanColumn,
    SarakKanbanPriority,
    SarakKanbanSubtasks,
} from './kanbanTypes';
export { sarakMoveCard } from './kanbanModel';
