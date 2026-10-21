import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SarakToastProvider, useToast, type SarakToastController } from '../SarakToast';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const DEFAULT_TOAST_DURATION_MS = 3000;
const SHORT_REQUESTED_DURATION_MS = 1000;
const LONG_TOAST_DURATION_MS = 10000;
const TOAST_STACK_SIZE = 5;

const Harness = ({ onReady }: { onReady: (controller: SarakToastController) => void }): React.ReactElement | null => {
    const controller = useToast();
    React.useEffect(() => onReady(controller), [controller, onReady]);
    return null;
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('desmonta o toast após a duração configurada', () => {
    let api!: SarakToastController;
    render(<SarakToastProvider><Harness onReady={(controller) => { api = controller; }} /></SarakToastProvider>);
    act(() => { api.notify({ message: 'Salvo!', variant: 'success', duration: DEFAULT_TOAST_DURATION_MS }); });
    expect(screen.getByText('Salvo!')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(DEFAULT_TOAST_DURATION_MS); });
    expect(screen.queryByText('Salvo!')).not.toBeInTheDocument();
});

it('exibe título e ação e respeita cinco segundos antes do auto-dismiss', () => {
    let api!: SarakToastController;
    render(<SarakToastProvider><Harness onReady={(controller) => { api = controller; }} /></SarakToastProvider>);
    act(() => { api.notify({
        title: 'Arquivo salvo', message: 'O relatório está pronto.', duration: SHORT_REQUESTED_DURATION_MS,
        action: { label: 'Abrir relatório', onClick: () => undefined },
    }); });
    expect(screen.getByText('Arquivo salvo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir relatório' })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(4999); });
    expect(screen.getByText('O relatório está pronto.')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByText('Arquivo salvo')).not.toBeInTheDocument();
});

it('executa a ação e dispensa o toast', () => {
    let api!: SarakToastController;
    const onAction = vi.fn();
    render(<SarakToastProvider><Harness onReady={(controller) => { api = controller; }} /></SarakToastProvider>);
    act(() => { api.notify({
        title: 'Alteração disponível', message: 'Uma nova versão foi encontrada.',
        action: { label: 'Atualizar', onClick: onAction },
    }); });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar' }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(screen.queryByText('Alteração disponível')).not.toBeInTheDocument();
});

it('empilha toasts sucessivos', () => {
    let api!: SarakToastController;
    render(<SarakToastProvider><Harness onReady={(controller) => { api = controller; }} /></SarakToastProvider>);
    act(() => { for (let index = 0; index < TOAST_STACK_SIZE; index += 1) api.notify({ message: `Toast ${index}`, duration: LONG_TOAST_DURATION_MS }); });
    expect(screen.getAllByRole('alert')).toHaveLength(TOAST_STACK_SIZE);
});

it('o botão de fechar dispensa o toast antes do timeout', () => {
    let api!: SarakToastController;
    render(<SarakToastProvider><Harness onReady={(controller) => { api = controller; }} /></SarakToastProvider>);
    act(() => { api.notify({ message: 'Fecha manual', duration: LONG_TOAST_DURATION_MS }); });
    fireEvent.click(screen.getByRole('button', { name: 'Fechar notificação' }));
    expect(screen.queryByText('Fecha manual')).not.toBeInTheDocument();
});

it('traduz o nome acessível do controle de fechar pelo idioma ativo', () => {
    let api!: SarakToastController;
    render(<SarakUIProvider config={{ language: 'en' }}><SarakToastProvider><Harness onReady={(controller) => { api = controller; }} /></SarakToastProvider></SarakUIProvider>);
    act(() => { api.notify({ message: 'Dismissible', duration: LONG_TOAST_DURATION_MS }); });
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument();
});

it('useToast() sem Provider devolve controller no-op', () => {
    let api!: SarakToastController;
    render(<Harness onReady={(controller) => { api = controller; }} />);
    act(() => { expect(api.notify({ message: 'x' })).toBe(''); });
});

it('mantém as declarações de background e color válidas', () => {
    let api!: SarakToastController;
    render(<SarakToastProvider><Harness onReady={(controller) => { api = controller; }} /></SarakToastProvider>);
    act(() => { api.notify({ message: 'Parênteses', duration: LONG_TOAST_DURATION_MS }); });
    const toast = screen.getByRole('alert');
    const styleAttr = toast.getAttribute('style') ?? '';
    const balancedParens = (declaration: string): boolean => [...declaration].reduce((depth, character) => {
        if (character === '(') return depth + 1;
        if (character === ')') return depth - 1;
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
