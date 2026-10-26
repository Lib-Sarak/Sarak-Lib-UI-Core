import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SarakUIProvider, useSarakUI } from '../SarakUIProvider';
import { DEFAULT_STORAGE_KEY } from '../constants';
import type { SarakThemePayload, SarakUIOptions } from '../types';

type TenantPersistence = NonNullable<SarakUIOptions['persistence']>;

const PERSISTENCE_DEBOUNCE_MS = 1500;
const TENANT_SWITCH_SETTLE_MS = 1600;
const EXTRA_STORAGE_KEYS = [
    'provider-theme-pair::tenant:tenant-a',
    'provider-theme-pair::tenant:tenant-a::active-theme-id',
    'provider-config-wins-cache',
    'provider-save-warning',
    'provider-save-warning::active-theme-id',
    'provider-save-warning-first',
    'provider-save-warning-first::active-theme-id',
    'provider-save-warning-second',
    'provider-save-warning-second::active-theme-id',
];

const TenantDesignProbe = () => {
    const ui = useSarakUI();
    const currentDesign = ui.systemDesign ?? {};
    const primaryColor = currentDesign.primaryColor === '#45ab67' ? '#67ab45' : '#45ab67';
    return (
        <>
            <output data-testid="tenant-primary-color">{ui.systemDesign?.primaryColor}</output>
            <output data-testid="tenant-active-theme-id">{ui.resolvedThemeId}</output>
            <button
                type="button"
                onClick={() => ui.setDesign({ ...currentDesign, primaryColor } as SarakThemePayload)}
            >
                Editar tema
            </button>
        </>
    );
};

const renderProvider = (persistence: TenantPersistence) => (
    <SarakUIProvider
        config={{ primaryColor: '#123456' } as SarakThemePayload}
        options={{ fonts: 'none', persistence }}
    >
        <TenantDesignProbe />
    </SarakUIProvider>
);

const renderDefaultStrategyProvider = (persistence?: TenantPersistence) => (
    <SarakUIProvider
        config={{ primaryColor: '#123456' } as SarakThemePayload}
        options={persistence ? { fonts: 'none', persistence } : { fonts: 'none' }}
    >
        <TenantDesignProbe />
    </SarakUIProvider>
);

const advanceFakeTimers = (durationMs: number): void => {
    act(() => vi.advanceTimersByTime(durationMs));
};

const advanceFakeTimersAsync = async (durationMs: number): Promise<void> => {
    await act(async () => { await vi.advanceTimersByTimeAsync(durationMs); });
};

const flushRemoteLoad = async () => {
    await act(async () => {});
};

describe('SarakUIProvider — persistência ao trocar tenant', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.removeItem(DEFAULT_STORAGE_KEY);
        localStorage.removeItem('provider-tenant-persistence');
        ['tenant-a', 'tenant-b', 'tenant-c'].forEach((tenantId) =>
            localStorage.removeItem(`provider-tenant-persistence::tenant:${tenantId}`),
        );
        EXTRA_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.removeItem(DEFAULT_STORAGE_KEY);
        localStorage.removeItem('provider-tenant-persistence');
        ['tenant-a', 'tenant-b', 'tenant-c'].forEach((tenantId) =>
            localStorage.removeItem(`provider-tenant-persistence::tenant:${tenantId}`),
        );
        EXTRA_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    });

    it('entra no tenant depois do mount, aplica as cargas seguintes e só grava edições do tenant ativo', async () => {
        const onLoadTenantA = vi.fn().mockResolvedValue({ primaryColor: '#111111' });
        const onLoadTenantB = vi.fn().mockResolvedValue({ primaryColor: '#222222' });
        const onLoadTenantC = vi.fn().mockResolvedValue(null);
        const onSaveTenantA = vi.fn();
        const onSaveTenantB = vi.fn();
        const onSaveTenantC = vi.fn();
        const { rerender } = render(renderProvider({ strategy: 'remote', storageKey: 'provider-tenant-persistence' }));

        rerender(renderProvider({
            strategy: 'remote',
            storageKey: 'provider-tenant-persistence',
            tenantId: 'tenant-a',
            onLoad: onLoadTenantA,
            onSave: onSaveTenantA,
        }));
        await flushRemoteLoad();
        expect(onLoadTenantA).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#111111');

        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        rerender(renderProvider({
            strategy: 'remote',
            storageKey: 'provider-tenant-persistence',
            tenantId: 'tenant-b',
            onLoad: onLoadTenantB,
            onSave: onSaveTenantB,
        }));
        await flushRemoteLoad();
        expect(onLoadTenantB).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#222222');

        advanceFakeTimers(TENANT_SWITCH_SETTLE_MS);
        expect(onSaveTenantA).not.toHaveBeenCalled();
        expect(onSaveTenantB).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        advanceFakeTimers(PERSISTENCE_DEBOUNCE_MS);
        expect(onSaveTenantB).toHaveBeenCalledTimes(1);
        expect(onSaveTenantB).toHaveBeenCalledWith(expect.objectContaining({ primaryColor: '#45ab67' }), expect.any(String));

        rerender(renderProvider({
            strategy: 'remote',
            storageKey: 'provider-tenant-persistence',
            tenantId: 'tenant-c',
            onLoad: onLoadTenantC,
            onSave: onSaveTenantC,
        }));
        await flushRemoteLoad();
        expect(onLoadTenantC).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#123456');
    });

    it('a configuração padrão do Provider carrega o tenant ao receber as portas após o mount', async () => {
        const onLoadTenantA = vi.fn().mockResolvedValue({ primaryColor: '#111111' });
        const onLoadTenantB = vi.fn().mockResolvedValue({ primaryColor: '#222222' });
        const onSaveTenantA = vi.fn();
        const onSaveTenantB = vi.fn();
        const { rerender } = render(renderDefaultStrategyProvider());

        rerender(renderDefaultStrategyProvider({
            tenantId: 'tenant-a',
            onLoad: onLoadTenantA,
            onSave: onSaveTenantA,
        }));

        await flushRemoteLoad();
        expect(onLoadTenantA).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#111111');
        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        advanceFakeTimers(PERSISTENCE_DEBOUNCE_MS);
        expect(onSaveTenantA).toHaveBeenCalledTimes(1);

        rerender(renderDefaultStrategyProvider({
            tenantId: 'tenant-b',
            onLoad: onLoadTenantB,
            onSave: onSaveTenantB,
        }));

        await flushRemoteLoad();
        expect(onLoadTenantB).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#222222');
    });

    it('a configuração padrão cancela a gravação pendente de A ao trocar para B', async () => {
        const onLoadTenantA = vi.fn().mockResolvedValue({ primaryColor: '#111111' });
        const onLoadTenantB = vi.fn().mockResolvedValue({ primaryColor: '#222222' });
        const onSaveTenantA = vi.fn();
        const onSaveTenantB = vi.fn();
        const { rerender } = render(renderDefaultStrategyProvider());

        rerender(renderDefaultStrategyProvider({
            tenantId: 'tenant-a',
            onLoad: onLoadTenantA,
            onSave: onSaveTenantA,
        }));

        await flushRemoteLoad();
        expect(onLoadTenantA).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#111111');
        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#45ab67');

        rerender(renderDefaultStrategyProvider({
            tenantId: 'tenant-b',
            onLoad: onLoadTenantB,
            onSave: onSaveTenantB,
        }));

        await flushRemoteLoad();
        expect(onLoadTenantB).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#222222');
        advanceFakeTimers(TENANT_SWITCH_SETTLE_MS);

        expect(onSaveTenantA).not.toHaveBeenCalled();
        expect(onSaveTenantB).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        advanceFakeTimers(PERSISTENCE_DEBOUNCE_MS);
        expect(onSaveTenantB).toHaveBeenCalledTimes(1);
        expect(onSaveTenantB).toHaveBeenCalledWith(expect.objectContaining({ primaryColor: '#45ab67' }), expect.any(String));
        expect(onSaveTenantA).not.toHaveBeenCalled();
    });

    it('restaura o id do cache até o onLoad responder e atualiza o par sem chamar onSave', async () => {
        const storageKey = 'provider-theme-pair';
        const tenantStorageKey = `${storageKey}::tenant:tenant-a`;
        const activeThemeStorageKey = `${tenantStorageKey}::active-theme-id`;
        localStorage.setItem(tenantStorageKey, JSON.stringify({ primaryColor: '#111111' }));
        localStorage.setItem(activeThemeStorageKey, 'cache-theme');

        let resolveLoad: ((value: { design: SarakThemePayload; activeThemeId: string }) => void) | undefined;
        const onLoad = vi.fn(() => new Promise<{ design: SarakThemePayload; activeThemeId: string }>((resolve) => {
            resolveLoad = resolve;
        }));
        const onSave = vi.fn();
        render(
            <SarakUIProvider
                options={{ fonts: 'none', persistence: { storageKey, tenantId: 'tenant-a', onLoad, onSave } }}
            >
                <TenantDesignProbe />
            </SarakUIProvider>,
        );

        await act(async () => {});
        expect(screen.getByTestId('tenant-active-theme-id')).toHaveTextContent('cache-theme');
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#111111');

        await act(async () => {
            resolveLoad?.({ design: { primaryColor: '#222222' }, activeThemeId: 'server-theme' });
            await Promise.resolve();
        });

        expect(screen.getByTestId('tenant-active-theme-id')).toHaveTextContent('server-theme');
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#222222');
        expect(JSON.parse(localStorage.getItem(tenantStorageKey) ?? 'null')).toMatchObject({ primaryColor: '#222222' });
        expect(localStorage.getItem(activeThemeStorageKey)).toBe('server-theme');
        expect(onSave).not.toHaveBeenCalled();
    });

    it('permite que o config injetado vença o design do cache no primeiro render', () => {
        const storageKey = 'provider-config-wins-cache';
        localStorage.setItem(storageKey, JSON.stringify({ primaryColor: '#111111' }));

        render(
            <SarakUIProvider
                config={{ primaryColor: '#333333' } as SarakThemePayload}
                options={{ fonts: 'none', persistence: { strategy: 'local', storageKey, preferConfigOverCache: true } }}
            >
                <TenantDesignProbe />
            </SarakUIProvider>,
        );

        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#333333');
        expect(JSON.parse(localStorage.getItem(storageKey) ?? 'null')).toMatchObject({ primaryColor: '#111111' });
    });

    it('avisa ao falhar e tenta novamente só depois de uma mudança posterior', async () => {
        const onSave = vi.fn().mockRejectedValueOnce(new Error('backend unavailable')).mockResolvedValue(undefined);
        render(renderProvider({ storageKey: 'provider-save-warning', onSave }));

        await flushRemoteLoad();
        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        await advanceFakeTimersAsync(PERSISTENCE_DEBOUNCE_MS);

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível salvar o tema.');

        await advanceFakeTimersAsync(PERSISTENCE_DEBOUNCE_MS * 2);
        expect(onSave).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        await advanceFakeTimersAsync(PERSISTENCE_DEBOUNCE_MS);
        expect(onSave).toHaveBeenCalledTimes(2);
    });

    it('mostra o aviso somente no Provider que recebeu a falha de onSave', async () => {
        const failingOnSave = vi.fn().mockRejectedValue(new Error('backend unavailable'));
        const otherOnSave = vi.fn();
        render(
            <>
                <SarakUIProvider options={{
                    fonts: 'none',
                    persistence: { storageKey: 'provider-save-warning-first', onSave: failingOnSave },
                }}>
                    <TenantDesignProbe />
                </SarakUIProvider>
                <SarakUIProvider options={{
                    fonts: 'none',
                    persistence: { storageKey: 'provider-save-warning-second', onSave: otherOnSave },
                }}>
                    <TenantDesignProbe />
                </SarakUIProvider>
            </>,
        );

        await flushRemoteLoad();
        fireEvent.click(screen.getAllByRole('button', { name: 'Editar tema' })[0]);
        await advanceFakeTimersAsync(PERSISTENCE_DEBOUNCE_MS);

        expect(failingOnSave).toHaveBeenCalledTimes(1);
        expect(otherOnSave).not.toHaveBeenCalled();
        expect(screen.getAllByRole('alert')).toHaveLength(1);
        expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível salvar o tema.');
    });
});
