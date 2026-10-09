/**
 * `SarakKanban` — fronteira lazy.
 *
 * O arrastar e soltar vem de `@dnd-kit` (peer opcional): `React.lazy` mantém a biblioteca
 * FORA do chunk de boot de quem nunca desenha um quadro. O `Suspense` é interno, para
 * preservar o contrato público: `<SarakKanban />` continua sem exigir `Suspense` do
 * consumidor, e a genericidade `C extends SarakKanbanCard` se mantém. Sem o
 * `LazyEngineWrapper` de propósito: ele exige o Provider (`useSarakUI`), e o quadro,
 * como todo átomo, renderiza sem Provider.
 */

import React, { Suspense, lazy } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakKanbanProps } from './SarakKanbanImpl';
import type { SarakKanbanCard } from './kanbanTypes';

type KanbanComponent = <C extends SarakKanbanCard = SarakKanbanCard>(props: SarakKanbanProps<C>) => React.ReactElement;

const KanbanImpl = lazy(() => import('./SarakKanbanImpl')) as unknown as KanbanComponent;

function KanbanFallback() {
    const text = useLibraryText();
    return (
        <div
            data-sarak-kanban-loading="true"
            role="status"
            aria-busy="true"
            style={{ padding: 'var(--sarak-layout-gap-md, 16px)', color: 'var(--sarak-text-muted, inherit)' }}
        >
            {text('kanbanLoading')}
        </div>
    );
}

export function SarakKanban<C extends SarakKanbanCard = SarakKanbanCard>(props: SarakKanbanProps<C>) {
    return (
        <Suspense fallback={<KanbanFallback />}>
            <KanbanImpl {...props} />
        </Suspense>
    );
}

export default SarakKanban;
