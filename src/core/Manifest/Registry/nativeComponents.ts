/**
 * Mapa Nativo de Componentes (Spec 22 — Regra 1)
 *
 * Conjunto oficial de átomos resolvíveis por `type` no Manifesto. As chaves deste
 * mapa derivam o tipo `ComponentType` (união de string-literais), garantindo
 * autocomplete e barrando `type` inválido em tempo de compilação.
 *
 * Os átomos de micro-layout (Spec 10) já existem em `components/atomic/Layouts/` —
 * aqui apenas os registramos (decisão da Onda 0: verificar e conformar, não reescrever).
 * Componentes pesados (DataGrid, PDFViewer, charts) entram aqui via `React.lazy`
 * quando suas specs (12/15) forem implementadas.
 */

import {
    SarakFlex,
    SarakGrid,
    SarakSplitPane,
    SarakTabs,
    SarakAccordion,
    SarakFormGroup,
} from '../../../components/atomic/Layouts';
import { SarakDataGrid } from '../../../components/atomic/DataDisplay/SarakDataGrid';
import { SarakSkeleton, SarakDataEmpty } from '../../../components/atomic/Feedback';
import { SarakModal, SarakDrawer } from '../../../components/atomic/Modals';
import { SarakTooltip, SarakContextMenu } from '../../../components/atomic/UX';
import {
    SarakInput,
    SarakSelect,
    SarakTextarea,
    SarakSwitch,
    SarakSlider,
    SarakRangeSlider,
    SarakMultiSelect,
    SarakUploader,
    SarakDatePicker,
    SarakTimePicker,
} from '../../../components/atomic/Inputs';
import {
    SarakSpotlight,
    SarakStepper,
    SarakBreadcrumbs,
    SarakPagination,
} from '../../../components/atomic/Navigation';

/**
 * Registro nativo. `as const` em conjunto com `satisfies` mantém a inferência das
 * chaves literais (para derivar `ComponentType`) sem afrouxar a tipagem dos valores.
 *
 * `SarakDataGrid` é o primeiro componente pesado registrado via `React.lazy`
 * (Regra 5): a virtualização (`@tanstack/react-virtual`) só carrega quando um grid
 * é renderizado. O Renderer já envolve a árvore em `<Suspense>`.
 */
export const NATIVE_COMPONENTS = {
    SarakFlex,
    SarakGrid,
    SarakSplitPane,
    SarakTabs,
    SarakAccordion,
    SarakFormGroup,
    SarakDataGrid,
    // Feedback e Interações (Spec 13).
    SarakSkeleton,
    SarakDataEmpty,
    SarakModal,
    SarakDrawer,
    SarakTooltip,
    SarakContextMenu,
    // Formulários — inputs BASE (Spec 11-BASE / Onda 3). Leves: SEM React.lazy.
    // Consumidos pela malha model (Spec 32) + validation (Spec 29) via LeafNode.
    SarakInput,
    SarakSelect,
    SarakTextarea,
    SarakSwitch,
    SarakSlider,
    // Formulários — entrada avançada (Spec 11 / Onda 8). Leves: SEM React.lazy.
    // RangeSlider (duplo), MultiSelect (chips), Uploader (drag-and-drop via
    // react-dropzone), DatePicker (popover in-house + date-fns) e TimePicker.
    SarakRangeSlider,
    SarakMultiSelect,
    SarakUploader,
    SarakDatePicker,
    SarakTimePicker,
    // Navegação contextual (Spec 14): Command Palette, Stepper, Breadcrumbs, Paginação.
    SarakSpotlight,
    SarakStepper,
    SarakBreadcrumbs,
    SarakPagination,
    // Spec 11 — pendente (Onda 10, gate de dependência):
    // SarakRichText (WYSIWYG blindado).
} as const;

/** União dos `type` nativos oficiais — fonte do `ComponentType` (Spec 22, Regra 1). */
export type NativeComponentType = keyof typeof NATIVE_COMPONENTS;
