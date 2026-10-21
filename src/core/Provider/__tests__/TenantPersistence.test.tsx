import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SarakUIProvider, useSarakUI } from '../SarakUIProvider';
import { DEFAULT_STORAGE_KEY } from '../constants';
import type { SarakThemePayload, SarakUIOptions } from '../types';

type TenantPersistence = NonNullable<SarakUIOptions['persistence']>;

const TenantDesignProbe = () => {
    const ui = useSarakUI();
    const currentDesign = ui.systemDesign ?? {};
    return (
        <>
            <output data-testid="tenant-primary-color">{ui.systemDesign?.primaryColor}</output>
            <button
                type="button"
                onClick={() => ui.setDesign({ ...currentDesign, primaryColor: '#45ab67' } as SarakThemePayload)}
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

describe('SarakUIProvider — persistência ao trocar tenant', () => {
    beforeEach(() => {
        localStorage.removeItem(DEFAULT_STORAGE_KEY);
        localStorage.removeItem('provider-tenant-persistence');
        ['tenant-a', 'tenant-b', 'tenant-c'].forEach((tenantId) =>
            localStorage.removeItem(`provider-tenant-persistence::tenant:${tenantId}`),
        );
    });

    afterEach(() => {
        localStorage.removeItem(DEFAULT_STORAGE_KEY);
        localStorage.removeItem('provider-tenant-persistence');
        ['tenant-a', 'tenant-b', 'tenant-c'].forEach((tenantId) =>
            localStorage.removeItem(`provider-tenant-persistence::tenant:${tenantId}`),
        );
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
        await waitFor(() => expect(onLoadTenantA).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#111111'));

        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        rerender(renderProvider({
            strategy: 'remote',
            storageKey: 'provider-tenant-persistence',
            tenantId: 'tenant-b',
            onLoad: onLoadTenantB,
            onSave: onSaveTenantB,
        }));
        await waitFor(() => expect(onLoadTenantB).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#222222'));

        await act(async () => new Promise((resolve) => setTimeout(resolve, 1600)));
        expect(onSaveTenantA).not.toHaveBeenCalled();
        expect(onSaveTenantB).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        await waitFor(() => expect(onSaveTenantB).toHaveBeenCalledTimes(1), { timeout: 3000 });
        expect(onSaveTenantB).toHaveBeenCalledWith(expect.objectContaining({ primaryColor: '#45ab67' }), expect.any(String));

        rerender(renderProvider({
            strategy: 'remote',
            storageKey: 'provider-tenant-persistence',
            tenantId: 'tenant-c',
            onLoad: onLoadTenantC,
            onSave: onSaveTenantC,
        }));
        await waitFor(() => expect(onLoadTenantC).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#123456'));
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

        await waitFor(() => expect(onLoadTenantA).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#111111'));
        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        await waitFor(() => expect(onSaveTenantA).toHaveBeenCalledTimes(1), { timeout: 3000 });

        rerender(renderDefaultStrategyProvider({
            tenantId: 'tenant-b',
            onLoad: onLoadTenantB,
            onSave: onSaveTenantB,
        }));

        await waitFor(() => expect(onLoadTenantB).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#222222'));
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

        await waitFor(() => expect(onLoadTenantA).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#111111'));
        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        await waitFor(() => expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#45ab67'));

        rerender(renderDefaultStrategyProvider({
            tenantId: 'tenant-b',
            onLoad: onLoadTenantB,
            onSave: onSaveTenantB,
        }));

        await waitFor(() => expect(onLoadTenantB).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#222222'));
        await act(async () => new Promise((resolve) => setTimeout(resolve, 1600)));

        expect(onSaveTenantA).not.toHaveBeenCalled();
        expect(onSaveTenantB).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Editar tema' }));
        await waitFor(() => expect(onSaveTenantB).toHaveBeenCalledTimes(1), { timeout: 3000 });
        expect(onSaveTenantB).toHaveBeenCalledWith(expect.objectContaining({ primaryColor: '#45ab67' }), expect.any(String));
        expect(onSaveTenantA).not.toHaveBeenCalled();
    });
});
