import type { SarakDesignState } from './types';

/** Entrada completa de tema recebida e devolvida pelas portas do consumidor. */
export interface SarakThemeEntry {
    id: string;
    /** Rótulo exibido nas listas de tema; temas runtime precisam dele no catálogo. */
    name?: string;
    design?: Record<string, unknown>;
    contraparte?: Partial<SarakDesignState>;
}

/** Operação entregue à porta quando uma gravação runtime cria ou substitui um tema. */
export type SarakThemeSaveOperation = 'create' | 'replace';
