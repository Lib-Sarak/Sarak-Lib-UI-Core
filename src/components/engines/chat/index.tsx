/**
 * `SarakChatEngine` (P26) — fronteira lazy.
 *
 * Mesma postura de `engines/charts/index.tsx`: `React.lazy` mantém `react-markdown`
 * + `react-syntax-highlighter` (peers pesados) FORA do grafo estático do barril
 * público — só carregam quando um chat é de fato renderizado. Expor EAGER anularia
 * o split e colocaria o highlighter no boot de TODO consumidor (a lição medida da
 * Spec 41: o pecado nunca foi expor, foi expor eager).
 *
 * O `Suspense` é interno (via `LazyEngineWrapper`) para preservar o contrato público:
 * quem usa `<SarakChatEngine />` não precisa declarar `Suspense`.
 */
import React, { lazy } from 'react';
import LazyEngineWrapper from '../LazyEngineWrapper';
import type { SarakChatEngineProps } from './SarakChatEngine';

export type { SarakChatEngineProps } from './SarakChatEngine';

const ChatEngineImpl = lazy(() => import('./SarakChatEngine'));

export const SarakChatEngine: React.FC<SarakChatEngineProps> = (props) => (
    <LazyEngineWrapper>
        <ChatEngineImpl {...props} />
    </LazyEngineWrapper>
);

export default SarakChatEngine;
