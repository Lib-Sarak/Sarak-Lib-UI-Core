import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SarakToastProvider, useToast, type SarakToastController } from '../SarakToast';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const Harness: React.FC<{ onReady: (c: SarakToastController) => void }> = ({ onReady }) => {
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
        let api!: SarakToastController;
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
        let api!: SarakToastController;
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

    it('o botão de fechar (×) dispensa o toast antes do timeout (R10 — lote 10)', () => {
        let api!: SarakToastController;
        render(
            <SarakToastProvider>
                <Harness onReady={(c) => (api = c)} />
            </SarakToastProvider>,
        );
        act(() => {
            api.notify({ message: 'Fecha manual', duration: 10000 });
        });
        expect(screen.getByText('Fecha manual')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Fechar notificação' }));
        expect(screen.queryByText('Fecha manual')).not.toBeInTheDocument();
    });

    it('traduz o nome acessível do controle de fechar pelo idioma ativo', () => {
        let api!: SarakToastController;
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakToastProvider>
                    <Harness onReady={(controller) => (api = controller)} />
                </SarakToastProvider>
            </SarakUIProvider>,
        );
        act(() => { api.notify({ message: 'Dismissible', duration: 10000 }); });

        expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument();
    });

    it('useToast() sem Provider degrada para no-op (não quebra a árvore)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        let api!: SarakToastController;
        render(<Harness onReady={(c) => (api = c)} />);
        act(() => {
            expect(api.notify({ message: 'x' })).toBe('');
        });
        expect(warn).toHaveBeenCalled();
    });

    it('as declarações de background e color têm parênteses balanceados, com fundo e texto próprios (achado 37)', () => {
        let api!: SarakToastController;
        render(
            <SarakToastProvider>
                <Harness onReady={(c) => (api = c)} />
            </SarakToastProvider>,
        );
        act(() => {
            api.notify({ message: 'Parênteses', duration: 10000 });
        });

        const toast = screen.getByRole('alert');
        const styleAttr = toast.getAttribute('style') ?? '';
        const balancedParens = (declaration: string): boolean =>
            [...declaration].reduce((depth, char) => {
                if (char === '(') return depth + 1;
                if (char === ')') return depth - 1;
                return depth;
            }, 0) === 0;

        const background = styleAttr.match(/background:\s*([^;]+);/)?.[1];
        const color = styleAttr.match(/(?:^|\s)color:\s*([^;]+);/)?.[1];

        expect(background).toBeTruthy();
        expect(color).toBeTruthy();
        expect(balancedParens(background as string)).toBe(true);
        expect(balancedParens(color as string)).toBe(true);
        expect(toast.style.background).not.toBe('');
        expect(toast.style.color).not.toBe('');
    });
});
