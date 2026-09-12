import { PREFERENCE_IDS, isPreferenceOffered, getPreferencePosition } from '../preferencesTypes';
import type { PreferenceId } from '../preferencesTypes';

/**
 * Teto de código para as duas preferências que já eram widget antes desta
 * barra existir (`colorMode` → `widgets.themeToggle`, `navCollapsed` →
 * `widgets.collapse`) — Spec 05 §2.2.1 / ADR-014. `false` aqui vence
 * qualquer posição que o tema declare; as demais preferências não têm teto
 * de código, só a posição do tema decide.
 */
export type ChromePreferenceCeilings = Partial<Record<PreferenceId, boolean>>;

export interface ChromePreferencesPlacement {
    /** Oferecidas com posição `pinned` — controle direto na barra. */
    pinned: PreferenceId[];
    /** TODAS as oferecidas (`pinned` ∪ `menu`), independente do ⚙ existir —
     *  quem não tem menu (o drawer do celular, Spec 05 §2.3) usa esta. */
    offered: PreferenceId[];
    /** Conteúdo do ⚙ "Preferências" — vazio (e portanto sem botão) quando
     *  NENHUMA preferência tem posição EXATAMENTE `menu`. Uma barra só com
     *  fixadas (o padrão de fábrica) não basta para o ⚙ nascer; quando ele
     *  nasce por causa de alguma `menu`, as fixadas entram aqui também —
     *  fixa na barra é "um controle direto, e também no menu". */
    menu: PreferenceId[];
}

/**
 * Resolve, para as 5 preferências (Spec 09 §4.7), onde cada uma aparece na
 * barra configurável pelo administrador. Pura, sem estado — os dois cromos
 * (Shell e `SarakAppChrome`) chamam esta mesma função e desenham cada um a
 * própria UI por cima, porque `core/` não importa `components/Layout/`.
 */
export const splitPreferencesByPlacement = (
    design: Record<string, unknown> | undefined,
    ceilings: ChromePreferenceCeilings = {},
): ChromePreferencesPlacement => {
    const pinned: PreferenceId[] = [];
    const offered: PreferenceId[] = [];
    let hasMenuOnly = false;
    PREFERENCE_IDS.forEach((id) => {
        if (ceilings[id] === false) return;
        if (!isPreferenceOffered(design, id)) return;
        offered.push(id);
        if (getPreferencePosition(design, id) === 'pinned') pinned.push(id);
        else hasMenuOnly = true;
    });
    return { pinned, offered, menu: hasMenuOnly ? offered : [] };
};
