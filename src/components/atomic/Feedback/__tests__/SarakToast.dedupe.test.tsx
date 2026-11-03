import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SarakToastProvider, useToast, type SarakToastController } from '../SarakToast';

const DURATION_MS = 3000;
const HALF_DURATION_MS = 2000;

const Harness = ({ onReady }: { onReady: (controller: SarakToastController) => void }): React.ReactElement | null => {
    const controller = useToast();
    React.useEffect(() => onReady(controller), [controller, onReady]);
    return null;
};

let api!: SarakToastController;
const mount = (): void => {
    render(<SarakToastProvider><Harness onReady={(controller) => { api = controller; }} /></SarakToastProvider>);
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('com a mesma dedupeKey não abre outro toast: devolve o mesmo id e atualiza o texto', () => {
    mount();
    let first = '';
    let second = '';
    act(() => { first = api.notify({ message: 'Sem conexão', dedupeKey: 'rede' }); });
    act(() => { second = api.notify({ message: 'Sem conexão (2)', dedupeKey: 'rede' }); });

    expect(second).toBe(first);
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByText('Sem conexão (2)')).toBeInTheDocument();
});

it('reinicia a duração do toast repetido', () => {
    mount();
    act(() => { api.notify({ message: 'Aviso', dedupeKey: 'k', duration: DURATION_MS }); });
    act(() => { vi.advanceTimersByTime(HALF_DURATION_MS); });
    act(() => { api.notify({ message: 'Aviso', dedupeKey: 'k', duration: DURATION_MS }); });
    act(() => { vi.advanceTimersByTime(HALF_DURATION_MS); });

    expect(screen.getByText('Aviso')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(DURATION_MS - HALF_DURATION_MS); });
    expect(screen.queryByText('Aviso')).not.toBeInTheDocument();
});

it('chaves diferentes, ou nenhuma, seguem abrindo um toast por chamada; depois de fechar, a chave volta a valer', () => {
    mount();
    act(() => { api.notify({ message: 'A', dedupeKey: 'a' }); api.notify({ message: 'B', dedupeKey: 'b' }); });
    act(() => { api.notify({ message: 'C' }); api.notify({ message: 'C' }); });
    expect(screen.getAllByRole('alert')).toHaveLength(4);

    let id = '';
    act(() => { id = api.notify({ message: 'D', dedupeKey: 'd', duration: 0 }); });
    act(() => { api.dismiss(id); });
    act(() => { api.notify({ message: 'D2', dedupeKey: 'd' }); });
    expect(screen.queryByText('D')).not.toBeInTheDocument();
    expect(screen.getByText('D2')).toBeInTheDocument();
});
