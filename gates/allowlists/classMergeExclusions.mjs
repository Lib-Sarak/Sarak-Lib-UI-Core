/**
 * ALLOWLIST do gate de merge de classe no átomo (`check-class-merge.mjs`).
 *
 * Átomos de `src/components/atomic/` que HOJE ainda compõem `className` por
 * concatenação de template literal (`${...} ${className}`), em vez de pelo helper
 * `mergeSarakClasses`. Só `SarakButton`/`SarakIconButton` foram convertidos até agora;
 * os demais entram aqui, DECLARADOS — corrigi-los é trabalho futuro. Silêncio é
 * proibido: toda entrada carrega o motivo no próprio arquivo, mesmo idioma de
 * `barrelExclusions.mjs`.
 *
 * Regras de manutenção:
 *  - Converter o átomo para `mergeSarakClasses` → REMOVA a entrada daqui.
 *  - Entrada sem motivo, ou de arquivo que já não concatena mais → o gate reprova
 *    (exclusão obsoleta).
 */
const AINDA_CONCATENA_CLASSNAME = 'Concatena className por template literal — SarakButton/SarakIconButton já foram convertidos para mergeSarakClasses; este átomo ainda não.';

export const CLASS_MERGE_EXCLUSIONS = Object.freeze({
    'src/components/atomic/Layouts/SarakFlex.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Layouts/SarakGrid.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Layouts/SarakScrim.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Layouts/SarakAccordion.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Layouts/SarakSplitPane.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Layouts/SarakFormGroup.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Cards/ExpandableCard.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Cards/SarakActionCard.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Cards/SarakSearchCard.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Cards/SarakTitleCard.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Modals/SarakDrawer.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Inputs/SarakMultiSelect.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Inputs/SarakRichText.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Inputs/SarakTimePicker.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Inputs/SarakRangeSlider.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Inputs/SarakSlider.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Inputs/SarakSwitch.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Inputs/SarakSelect.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Inputs/SarakInput.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Inputs/SarakTextarea.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Navigation/SarakShellNav.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Navigation/SarakPagination.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Navigation/SarakLink.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Navigation/SarakBreadcrumbs.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Navigation/SarakStepper.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/UX/SarakContextMenu.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Templates/ImageCard.tsx': AINDA_CONCATENA_CLASSNAME,
    'src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx': AINDA_CONCATENA_CLASSNAME,
});
