import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SarakToastProvider, useToast, type ToastController } from '../SarakToast';

const Harness: React.FC<{ onReady: (c: ToastController) => void }> = ({ onReady }) => {
    const controller = useToast();
    React.useEffect(() => {
        onReady(controller);
    }, [controller, onReady]);
    return null;
};

describe('Spec 13 — SarakToast (Regra 1 + Plano de Testes)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('deve montar e desmontar o toast após o timeout parametrizado', () => {
        let api!: ToastController;
        render(
            <SarakToastProvider>
                <Harness onReady={(c) => (api = c)} />
            </SarakToastProvider>,
        );

        act(() => {
            api.notify({ message: 'Salvo!', variant: 'success', duration: 3000 });
        });
        expect(screen.getByText('Salvo!')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(screen.queryByText('Salvo!')).not.toBeInTheDocument();
    });

    it('deve empilhar 5 toasts sucessivos', () => {
        let api!: ToastController;
        render(
            <SarakToastProvider>
                <Harness onReady={(c) => (api = c)} />
            </SarakToastProvider>,
        );

        act(() => {
            for (let i = 0; i < 5; i++) api.notify({ message: `Toast ${i}`, duration: 10000 });
        });
        expect(screen.getAllByRole('alert')).toHaveLength(5);
    });

    it('useToast() sem Provider degrada para no-op (não quebra a árvore)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        let api!: ToastController;
        render(<Harness onReady={(c) => (api = c)} />);
        act(() => {
            expect(api.notify({ message: 'x' })).toBe('');
        });
        expect(warn).toHaveBeenCalled();
    });
});
