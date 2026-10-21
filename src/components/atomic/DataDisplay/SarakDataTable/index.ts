/**
 * SarakDataTable — barrel + carregamento preguiçoso (Spec 12, Regra 2 · Onda 9).
 *
 * Componente pesado: a virtualização (`@tanstack/react-virtual`) só é baixada quando
 * uma tabela colunar é realmente renderizada. Sempre renderize sob `<Suspense>`.
 * A implementação é interna; os tipos da tabela continuam públicos.
 */

import { lazy, type LazyExoticComponent, type ReactElement } from 'react';
import type { SarakDataTableProps } from './SarakDataTableImpl';

export const SarakDataTable: LazyExoticComponent<
    <T>(props: SarakDataTableProps<T>) => ReactElement
> = lazy(() => import('./SarakDataTableImpl'));

export type { SarakDataTableProps };
export type { SarakDataTableRowHeight } from './SarakDataTableImpl';
export type { SarakColumn, SarakTableSort } from './columnModel';
export type { SarakColumnAlignment } from './columnModel';
export { sarakReorder, sarakComputeOffsets, sarakWidthOf, SARAK_DEFAULT_COLUMN_WIDTH, SARAK_MIN_COLUMN_WIDTH } from './columnModel';
