/**
 * Tipos públicos do SarakKanban. Sem React nem DOM: o modelo puro (`kanbanModel.ts`) e
 * a interface (`SarakKanbanImpl.tsx`) compartilham estes contratos.
 */

export type SarakKanbanPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SarakKanbanAssignee {
    name: string;
    avatarUrl?: string;
}

export interface SarakKanbanSubtasks {
    done: number;
    total: number;
}

/** Todos os campos além de `id` são opcionais: o cartão padrão mostra só o que vier preenchido. */
export interface SarakKanbanCard {
    id: string;
    /** Identificador legível (ex.: `PRJ-12`), mostrado antes do título. */
    code?: string;
    title?: string;
    description?: string;
    assignee?: SarakKanbanAssignee;
    /** `medium` é o padrão silencioso: não aparece no cartão. */
    priority?: SarakKanbanPriority;
    /** Data ISO (`2026-10-31` ou com horário). Passada a data de hoje, o prazo aparece como atrasado. */
    dueDate?: string;
    subtasks?: SarakKanbanSubtasks;
    /** Valor do cartão (ex.: o da oportunidade); aparece formatado no cartão e é somado no cabeçalho da coluna. */
    value?: number;
}

export interface SarakKanbanColumn<C extends SarakKanbanCard = SarakKanbanCard> {
    id: string;
    title: string;
    cards: C[];
}

/**
 * Movimento consolidado de um cartão. Índices valem para a coluna JÁ com o cartão no lugar
 * (`toIndex`) e para a coluna de origem ANTES da saída (`fromIndex`). Os vizinhos são os
 * cartões finais ao redor do destino (`null` nas pontas) — bastam para calcular uma ordem,
 * inclusive fracionária, sem reler o quadro.
 */
export interface SarakCardMove {
    cardId: string;
    fromColumn: string;
    toColumn: string;
    fromIndex: number;
    toIndex: number;
    beforeCardId: string | null;
    afterCardId: string | null;
}
