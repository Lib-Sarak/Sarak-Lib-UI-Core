/**
 * SarakMap — fronteira lazy. O mapa não depende de biblioteca; o corte lazy mantém o código dele fora
 * do chunk de boot de quem nunca desenha um mapa. O `Suspense` é interno: não exige `Suspense` do consumidor.
 */

import React, { Suspense, lazy } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakMapProps } from './SarakMapImpl';

const MapImpl = lazy(() => import('./SarakMapImpl'));

function MapFallback(): React.ReactElement {
    const text = useLibraryText();
    return (
        <div role="status" aria-busy="true" data-sarak-map-loading="true" style={{ padding: 'var(--sarak-layout-gap-md, 16px)', color: 'var(--sarak-text-muted, inherit)' }}>
            {text('mapLoading')}
        </div>
    );
}

export function SarakMap(props: SarakMapProps): React.ReactElement {
    return (
        <Suspense fallback={<MapFallback />}>
            <MapImpl {...props} />
        </Suspense>
    );
}

export default SarakMap;
