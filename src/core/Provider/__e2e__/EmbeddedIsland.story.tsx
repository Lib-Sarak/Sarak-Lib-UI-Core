/**
 * Test story do gate de não-vazamento (Spec 24 §2.3).
 *
 * O playwright-ct só monta componentes definidos FORA do arquivo de teste — por isso
 * a ilha embarcada vive aqui, e não em `EmbeddedNoLeak.spec.tsx`.
 */

import React from 'react';
import { SarakUIProvider } from '../SarakUIProvider';
import { SarakButton } from '../../../components/atomic/Buttons/SarakButton';
import { useToast } from '../../../components/atomic/Feedback/SarakToast';

const ToastTrigger: React.FC = () => {
    const toast = useToast();
    return (
        <button type="button" data-testid="fire-toast" onClick={() => toast.notify({ message: 'toast-ilha' })}>
            toast
        </button>
    );
};

/** Ilha Sarak embarcada: o que o consumidor brownfield monta sobre o front dele. */
export const IlhaEmbarcada: React.FC = () => (
    <SarakUIProvider
        config={{ systemName: 'Sistema Sarak (ilha)', mode: 'dark' }}
        options={{ mode: 'embedded' }}
    >
        <h1 data-testid="ilha-h1">Título da ilha</h1>
        <SarakButton data-testid="ilha-btn">Ação Sarak</SarakButton>
        <ToastTrigger />
    </SarakUIProvider>
);
