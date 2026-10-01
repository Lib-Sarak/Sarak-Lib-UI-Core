import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import {
    SarakAutocomplete,
    type SarakAutocompleteOption,
} from '../SarakAutocomplete';

const OPTIONS: SarakAutocompleteOption[] = [
    { value: 'hr', label: 'Recursos Humanos' },
    { value: 'finance', label: 'Financeiro' },
    { value: 'technology', label: 'Tecnologia' },
];
const CUSTOM_DEBOUNCE_MS = 250;

const renderAutocomplete = (
    props: Partial<React.ComponentProps<typeof SarakAutocomplete>> = {},
): RenderResult => render(
    <SarakUIProvider>
        <SarakAutocomplete label="Setor" options={OPTIONS} {...props} />
    </SarakUIProvider>,
);

interface Deferred<TValue> {
    promise: Promise<TValue>;
    resolve: (value: TValue) => void;
}

const createDeferred = <TValue,>(): Deferred<TValue> => {
    let resolvePromise!: (value: TValue) => void;
    const promise = new Promise<TValue>((resolve: (value: TValue | PromiseLike<TValue>) => void) => {
        resolvePromise = resolve;
    });
    return { promise, resolve: resolvePromise };
};

afterEach(() => vi.useRealTimers());

it('filtra a lista local e seleciona a opção ativa pelo teclado', () => {
        const onOptionSelect = vi.fn();
        renderAutocomplete({ onOptionSelect });
        const input = screen.getByRole('combobox', { name: 'Setor' });
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'fin' } });

        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Financeiro' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'Tecnologia' })).not.toBeInTheDocument();

        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onOptionSelect).toHaveBeenCalledWith(OPTIONS[1]);
        expect(input).toHaveValue('Financeiro');
        expect(input).toHaveAttribute('aria-expanded', 'false');
});

it('navega para cima e para baixo, fecha com Escape e deixa Tab seguir', () => {
        renderAutocomplete();
        const input = screen.getByRole('combobox', { name: 'Setor' });
        fireEvent.focus(input);

        fireEvent.keyDown(input, { key: 'ArrowDown' });
        expect(screen.getByRole('option', { name: 'Recursos Humanos' })).toHaveAttribute('aria-selected', 'true');
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'ArrowUp' });
        expect(screen.getByRole('option', { name: 'Recursos Humanos' })).toHaveAttribute('aria-selected', 'true');

        fireEvent.keyDown(input, { key: 'Escape' });
        expect(input).toHaveAttribute('aria-expanded', 'false');
        fireEvent.focus(input);
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        fireEvent(input, tabEvent);

        expect(tabEvent.defaultPrevented).toBe(false);
        expect(input).toHaveAttribute('aria-expanded', 'false');
});

it('mostra carregamento e chama a busca do host após o intervalo configurado', async () => {
        vi.useFakeTimers();
        const searchOptions = vi.fn(async () => [OPTIONS[1]]);
        renderAutocomplete({ searchOptions, debounceMs: CUSTOM_DEBOUNCE_MS });
        const input = screen.getByRole('combobox', { name: 'Setor' });
        fireEvent.change(input, { target: { value: 'fin' } });

        expect(screen.getByRole('status')).toHaveTextContent('Carregando sugestões...');
        await act(async () => { await vi.advanceTimersByTimeAsync(CUSTOM_DEBOUNCE_MS); });

        expect(searchOptions).toHaveBeenCalledWith('fin');
        expect(screen.getByRole('option', { name: 'Financeiro' })).toBeInTheDocument();
});

it('anuncia resultado remoto vazio', async () => {
        vi.useFakeTimers();
        const searchOptions = vi.fn(async () => []);
        renderAutocomplete({ searchOptions, debounceMs: 0 });
        fireEvent.change(screen.getByRole('combobox', { name: 'Setor' }), { target: { value: 'xyz' } });

        await act(async () => { await vi.advanceTimersByTimeAsync(0); });

        expect(screen.getByRole('status')).toHaveTextContent('Nenhuma sugestão encontrada.');
});

it('anuncia falha da busca remota', async () => {
        vi.useFakeTimers();
        const searchOptions = vi.fn(async () => { throw new Error('falha do host'); });
        renderAutocomplete({ searchOptions, debounceMs: 0 });
        fireEvent.change(screen.getByRole('combobox', { name: 'Setor' }), { target: { value: 'fin' } });

        await act(async () => { await vi.advanceTimersByTimeAsync(0); });

        expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar as sugestões.');
        expect(screen.queryByText('falha do host')).not.toBeInTheDocument();
});

it('descarta a resposta antiga quando ela chega depois da busca mais nova', async () => {
        vi.useFakeTimers();
        const oldResult = createDeferred<SarakAutocompleteOption[]>();
        const newResult = createDeferred<SarakAutocompleteOption[]>();
        const searchOptions = vi.fn((query: string) => query === 'antigo' ? oldResult.promise : newResult.promise);
        renderAutocomplete({ searchOptions, debounceMs: 0 });
        const input = screen.getByRole('combobox', { name: 'Setor' });

        fireEvent.change(input, { target: { value: 'antigo' } });
        await act(async () => { await vi.advanceTimersByTimeAsync(0); });
        fireEvent.change(input, { target: { value: 'novo' } });
        await act(async () => { await vi.advanceTimersByTimeAsync(0); });

        await act(async () => { newResult.resolve([{ value: 'new', label: 'Resultado novo' }]); });
        await act(async () => { oldResult.resolve([{ value: 'old', label: 'Resultado antigo' }]); });

        expect(screen.getByRole('option', { name: 'Resultado novo' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'Resultado antigo' })).not.toBeInTheDocument();
});
