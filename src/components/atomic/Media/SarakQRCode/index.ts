/**
 * SarakQRCode — fronteira lazy.
 *
 * `React.lazy` mantém o peer opcional `qrcode` FORA do entry: só carrega quando um QR é de fato
 * renderizado — telas sem QR pagam custo zero. Sempre renderize sob `<Suspense>`.
 */

import { lazy } from 'react';

export type { SarakQRCodeProps } from './SarakQRCodeImpl';

export const SarakQRCode = lazy(() => import('./SarakQRCodeImpl'));
