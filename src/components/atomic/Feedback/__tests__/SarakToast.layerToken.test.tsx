import React from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakToastProvider, useToast, type SarakToastController } from '../SarakToast';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';

const TOOLTIP_LAYER = 9000;

const Harness = ({ onReady }: { onReady: (controller: SarakToastController) => void }): React.ReactElement | null => {
    const controller = useToast();
    React.useEffect(() => onReady(controller), [controller, onReady]);
    return null;
};

describe('zIndexToast — a pilha de notificações lê --sarak-z-toast', () => {
    it('a pilha usa a variável do token com a camada de tooltip como reserva', () => {
        let api!: SarakToastController;
        render(<SarakToastProvider><Harness onReady={(controller) => { api = controller; }} /></SarakToastProvider>);
        act(() => { api.notify({ message: 'Salvo!' }); });
        const stack = document.querySelector<HTMLElement>('[data-sarak-toast-stack="true"]');
        expect(stack?.style.zIndex).toBe('var(--sarak-z-toast, var(--z-index-tooltip, 9000))');
    });

    it('o padrão do schema é a camada que a pilha ocupava (acima do modal, igual ao tooltip)', () => {
        const token = sarakGetAllDesignTokens().find((item) => item.id === 'zIndexToast');
        expect(token?.defaultValue).toBe(TOOLTIP_LAYER);
    });
});
