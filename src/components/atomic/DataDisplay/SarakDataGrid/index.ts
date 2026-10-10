/**
 * SarakDataGrid — barrel + carregamento preguiçoso (Spec 12, base da Onda 1).
 *
 * `SarakDataGrid` é um `React.lazy`: a dependência de virtualização
 * (`@tanstack/react-virtual`) só é baixada quando um grid é realmente renderizado
 * — telas sem listas grandes pagam custo zero. Sempre renderize sob `<Suspense>`.
 *
 * A implementação é interna; `SarakDataGridProps` continua público.
 */

import { lazy } from 'react';

export const SarakDataGrid = lazy(() => import('./SarakDataGridImpl'));

export type { SarakDataGridProps } from './SarakDataGridImpl';
