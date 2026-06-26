/**
 * SarakDataTable — barrel + carregamento preguiçoso (Spec 12, Regra 2 · Onda 9).
 *
 * Componente pesado: a virtualização (`@tanstack/react-virtual`) só é baixada quando
 * uma tabela colunar é realmente renderizada. Sempre renderize sob `<Suspense>`.
 * `SarakDataTableImpl`/tipos são exportados para teste direto (sem a fronteira de Suspense).
 */

import { lazy } from 'react';

export const SarakDataTable = lazy(() => import('./SarakDataTableImpl'));

export { default as SarakDataTableImpl } from './SarakDataTableImpl';
export type { SarakDataTableProps } from './SarakDataTableImpl';
export type { SarakColumn } from './columnModel';
export { reorder, computeOffsets, widthOf, DEFAULT_COLUMN_WIDTH, MIN_COLUMN_WIDTH } from './columnModel';
