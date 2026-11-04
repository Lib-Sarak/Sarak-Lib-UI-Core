/**
 * SarakDashboardGrid — fronteira lazy.
 *
 * `react-grid-layout` (peer opcional) fica FORA do chunk de boot de quem nunca desenha um painel.
 * O `Suspense` é interno: `<SarakDashboardGrid />` não exige `Suspense` do consumidor, e renderiza
 * sem Provider como todo átomo.
 */

import React, { Suspense, lazy } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakDashboardGridProps } from './SarakDashboardGridImpl';

const DashboardGridImpl = lazy(() => import('./SarakDashboardGridImpl'));

function DashboardGridFallback(): React.ReactElement {
    const text = useLibraryText();
    return (
        <div role="status" aria-busy="true" data-sarak-dashboard-grid-loading="true" style={{ padding: 'var(--sarak-layout-gap-md, 16px)', color: 'var(--sarak-text-muted, inherit)' }}>
            {text('dashboardGridLoading')}
        </div>
    );
}

export function SarakDashboardGrid(props: SarakDashboardGridProps): React.ReactElement {
    return (
        <Suspense fallback={<DashboardGridFallback />}>
            <DashboardGridImpl {...props} />
        </Suspense>
    );
}

export default SarakDashboardGrid;
