import React from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakToastProvider, useToast, type SarakToastController } from '../SarakToast';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';

const TOOLTIP_LAYER = 9000;
/** A escada não tem empate: a notificação fica um passo acima do tooltip. */
const TOAST_LAYER = 9100;

const Harness = ({ onReady }: { onReady: (controller: SarakToastController) => void }): React.ReactElement | null => {
    const controller = useToast();
    React.useEffect(() => onReady(controller), [controller, onReady]);
    return null;
};

describe('zIndexToast — a pilha de notificações lê --sarak-z-toast', () => {
    it('a pilha usa a variável do token com o padrão do token como reserva', () => {
        let api!: SarakToastController;
        render(<SarakToastProvider><Harness onReady={(controller) => { api = controller; }} /></SarakToastProvider>);
        act(() => { api.notify({ message: 'Salvo!' }); });
        const stack = document.querySelector<HTMLElement>('[data-sarak-toast-stack="true"]');
        expect(stack?.style.zIndex).toBe('var(--sarak-z-toast, 9100)');
    });

    it('o padrão do schema é um passo acima do tooltip (sem empate na escada)', () => {
        const token = sarakGetAllDesignTokens().find((item) => item.id === 'zIndexToast');
        expect(token?.defaultValue).toBe(TOAST_LAYER);
        expect(Number(token?.defaultValue)).toBeGreaterThan(TOOLTIP_LAYER);
    });
});
