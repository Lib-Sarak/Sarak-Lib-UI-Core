import { CHROME_WIDGET_IDS, PREFERENCE_IDS, getChromeWidgetPosition } from '../preferencesTypes';
import type { SarakChromeWidgetId, SarakPreferenceId } from '../preferencesTypes';

/**
 * Teto de código para as duas preferências que já eram widget antes desta
 * barra existir (`colorMode` → `widgets.themeToggle`, `navCollapsed` →
 * `widgets.collapse`) — Spec 05 §2.2.1 / ADR-014. `false` aqui vence
 * qualquer posição que o tema declare; as demais preferências não têm teto
 * de código, só a posição do tema decide.
 */
export type ChromePreferenceCeilings = Partial<Record<SarakPreferenceId, boolean>>;
export type ChromeWidgetCeilings = Partial<Record<SarakChromeWidgetId, boolean>>;

export interface ChromePreferencesPlacement {
    /** Oferecidas com posição `pinned` — controle direto na barra. */
    pinned: SarakPreferenceId[];
    /** TODAS as oferecidas (`pinned` ∪ `menu`), independente do ⚙ existir —
     *  quem não tem menu (o drawer do celular, Spec 05 §2.3) usa esta. */
    offered: SarakPreferenceId[];
    /** Conteúdo do ⚙ "Preferências" — vazio (e portanto sem botão) quando
     *  NENHUMA preferência tem posição EXATAMENTE `menu`. Uma barra só com
     *  fixadas (o padrão de fábrica) não basta para o ⚙ nascer; quando ele
     *  nasce por causa de alguma `menu`, as fixadas entram aqui também —
     *  fixa na barra é "um controle direto, e também no menu". */
    menu: SarakPreferenceId[];
}

export interface ChromeWidgetsPlacement {
    pinned: SarakChromeWidgetId[];
    offered: SarakChromeWidgetId[];
    menu: SarakChromeWidgetId[];
}

/**
 * Resolve onde cada preferência aparece na barra configurável pelo administrador.
 * Pura, sem estado, para que a camada de Provider não dependa dos componentes visuais.
 */
export const splitPreferencesByPlacement = (
    design: Record<string, unknown> | undefined,
    ceilings: ChromePreferenceCeilings = {},
): ChromePreferencesPlacement => {
    const placement = splitChromeWidgetsByPlacement(design, ceilings);
    return {
        pinned: placement.pinned.filter(isPreferenceId),
        offered: placement.offered.filter(isPreferenceId),
        menu: placement.menu.filter(isPreferenceId),
    };
};

export const splitChromeWidgetsByPlacement = (
    design: Record<string, unknown> | undefined,
    ceilings: ChromeWidgetCeilings = {},
): ChromeWidgetsPlacement => {
    const pinned: SarakChromeWidgetId[] = [];
    const offered: SarakChromeWidgetId[] = [];
    let hasMenuOnly = false;

    CHROME_WIDGET_IDS.forEach((id) => {
        if (ceilings[id] === false) return;
        const position = getChromeWidgetPosition(design, id);
        if (position === 'off') return;
        offered.push(id);
        if (position === 'pinned') pinned.push(id);
        else hasMenuOnly = true;
    });

    return { pinned, offered, menu: hasMenuOnly ? offered : [] };
};

const isPreferenceId = (id: SarakChromeWidgetId): id is SarakPreferenceId =>
    (PREFERENCE_IDS as readonly SarakChromeWidgetId[]).includes(id);
