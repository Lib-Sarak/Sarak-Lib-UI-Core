/**
 * SarakDataGrid — barrel + carregamento preguiçoso (Spec 12, base da Onda 1).
 *
 * `SarakDataGrid` é um `React.lazy`: a dependência de virtualização
 * (`@tanstack/react-virtual`) só é baixada quando um grid é realmente renderizado
 * — telas sem listas grandes pagam custo zero. Sempre renderize sob `<Suspense>`.
 *
 * `SarakDataGridImpl`/`SarakDataGridProps` são exportados para teste direto (sem
 * a fronteira de Suspense).
 */

import { lazy } from 'react';

export const SarakDataGrid = lazy(() => import('./SarakDataGridImpl'));

export { default as SarakDataGridImpl } from './SarakDataGridImpl';
export type { SarakDataGridProps } from './SarakDataGridImpl';
