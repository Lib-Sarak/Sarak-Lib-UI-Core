import type { SarakThemePayload } from './types';

/** O marcador do design gravado: `2` é o formato que guarda só as escolhas (`onSave`, 3º parâmetro). */
export type SarakDesignFormat = 2;

/** O que `persistence.onLoad` devolve: o design gravado, o id do tema e o marcador que `onSave` entregou. */
export interface SarakSavedDesign {
    design: SarakThemePayload;
    activeThemeId?: string;
    format?: SarakDesignFormat;
}
