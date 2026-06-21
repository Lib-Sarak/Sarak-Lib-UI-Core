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
} as const;

/** União dos `type` nativos oficiais — fonte do `ComponentType` (Spec 22, Regra 1). */
export type NativeComponentType = keyof typeof NATIVE_COMPONENTS;
