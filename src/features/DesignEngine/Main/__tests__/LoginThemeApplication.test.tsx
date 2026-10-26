import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeCustomizationTab } from '../ThemeCustomizationTab';
import { SarakUIProvider, useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { SarakThemePayload, SarakUIOptions } from '../../../../core/Provider/types';

const STORAGE_KEY = 'login-theme-application';
const TENANT_ID = 'tenant-acme';
const TENANT_STORAGE_KEY = `${STORAGE_KEY}::tenant:${TENANT_ID}`;
const TENANT_ACTIVE_THEME_STORAGE_KEY = `${TENANT_STORAGE_KEY}::active-theme-id`;
const TENANT_DESIGN: SarakThemePayload = {
    mode: 'dark',
    primaryColor: '#123456',
    colorBgBody: '#123456',
};
const APPLIED_TENANT_DESIGN: SarakThemePayload = {
    ...TENANT_DESIGN,
    primaryColor: '#06080d',
    colorBgBody: '#06080d',
};

type TenantOnLoad = NonNullable<NonNullable<SarakUIOptions['persistence']>['onLoad']>;
type TenantOnSave = NonNullable<NonNullable<SarakUIOptions['persistence']>['onSave']>;
type ThemeOnSave = NonNullable<NonNullable<SarakUIOptions['theme']>['onSave']>;

interface LoginThemeScenarioProps {
    onLoad: TenantOnLoad;
    onSave: TenantOnSave;
    onSaveTheme: ThemeOnSave;
    showCustomizationPanel?: boolean;
}

const TenantDesignProbe = (): React.ReactElement => {
    const { systemDesign } = useSarakUI();
    return (
        <>
            <output data-testid="tenant-primary-color">{systemDesign?.primaryColor}</output>
            <output data-testid="tenant-system-background">{systemDesign?.colorBgBody}</output>
        </>
    );
};

const TenantThemeApplyControl = (): React.ReactElement => {
    const { applyFullConfigRaw, setResolvedThemeId, persistDesign } = useSarakUI();
    const applyTenantTheme = (): void => {
        applyFullConfigRaw(APPLIED_TENANT_DESIGN);
        setResolvedThemeId?.('sarak-sovereign');
        persistDesign?.(APPLIED_TENANT_DESIGN);
    };

    return <button type="button" onClick={applyTenantTheme}>Aplicar tema do tenant</button>;
};

const LoginThemeScenario = ({ onLoad, onSave, onSaveTheme, showCustomizationPanel = true }: LoginThemeScenarioProps): React.ReactElement => {
    const [tenantId, setTenantId] = useState<string | undefined>();
    const persistence: NonNullable<SarakUIOptions['persistence']> = tenantId
        ? { storageKey: STORAGE_KEY, crossTabSync: true, tenantId, onLoad, onSave }
        : { storageKey: STORAGE_KEY, crossTabSync: true };
    const options: SarakUIOptions = {
        fonts: 'none',
        persistence,
        theme: tenantId ? { onSave: onSaveTheme } : undefined,
    };

    return (
        <>
            <button type="button" onClick={() => setTenantId(TENANT_ID)}>Fazer login</button>
            <SarakUIProvider options={options}>
                <TenantDesignProbe />
                {showCustomizationPanel ? <ThemeCustomizationTab /> : <TenantThemeApplyControl />}
            </SarakUIProvider>
        </>
    );
};

const parsePersistedTenantDesign = (): SarakThemePayload =>
    JSON.parse(localStorage.getItem(TENANT_STORAGE_KEY) ?? 'null') as SarakThemePayload;

const clearTenantStorage = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TENANT_STORAGE_KEY);
    localStorage.removeItem(TENANT_ACTIVE_THEME_STORAGE_KEY);
};

const testSuccessfulTenantThemeApplication = (): void => {
    it('carrega o tenant e só persiste o tema aplicado', async () => {
        const onLoad = vi.fn<TenantOnLoad>().mockResolvedValue(TENANT_DESIGN);
        const onSave = vi.fn<TenantOnSave>();
        const onSaveTheme = vi.fn<ThemeOnSave>();

        render(<LoginThemeScenario onLoad={onLoad} onSave={onSave} onSaveTheme={onSaveTheme} showCustomizationPanel={false} />);
        fireEvent.click(screen.getByRole('button', { name: 'Fazer login' }));

        await act(async () => { await onLoad.mock.results[0]?.value; });
        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#123456');
        expect(screen.getByTestId('tenant-system-background')).toHaveTextContent('#123456');
        expect(parsePersistedTenantDesign()).toMatchObject(TENANT_DESIGN);
        expect(onSave).not.toHaveBeenCalled();
        expect(onSaveTheme).not.toHaveBeenCalled();
        expect(parsePersistedTenantDesign()).toMatchObject(TENANT_DESIGN);

        vi.useFakeTimers();
        fireEvent.click(screen.getByRole('button', { name: 'Aplicar tema do tenant' }));

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('tenant-system-background')).toHaveTextContent('#06080d');
        const persistedDesign = parsePersistedTenantDesign();
        expect(persistedDesign).toMatchObject(APPLIED_TENANT_DESIGN);
        expect(localStorage.getItem(TENANT_ACTIVE_THEME_STORAGE_KEY)).toBe('sarak-sovereign');
        expect(onSave).toHaveBeenCalledWith(persistedDesign, 'sarak-sovereign');
        expect(onSaveTheme).not.toHaveBeenCalled();
    }, 15000);
};

const testRejectedTenantSaveApplication = (): void => {
    it('mede uma única tentativa do tenant quando onSave rejeita após aplicar', async () => {
        const onLoad = vi.fn<TenantOnLoad>().mockResolvedValue(TENANT_DESIGN);
        const onSave = vi.fn<TenantOnSave>().mockRejectedValue(new Error('tenant validation failed'));
        const onSaveTheme = vi.fn<ThemeOnSave>();

        render(<LoginThemeScenario onLoad={onLoad} onSave={onSave} onSaveTheme={onSaveTheme} showCustomizationPanel={false} />);
        fireEvent.click(screen.getByRole('button', { name: 'Fazer login' }));

        await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#123456'));
        vi.useFakeTimers();
        fireEvent.click(screen.getByRole('button', { name: 'Aplicar tema do tenant' }));

        await act(async () => { await vi.advanceTimersByTimeAsync(0); });
        await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível salvar o tema.');
        await act(async () => { await vi.advanceTimersByTimeAsync(1800); });

        expect(onSave).toHaveBeenCalledTimes(1);
    }, 15000);
};

describe('SarakUIProvider — aplicar tema depois do login', () => {
    afterEach(() => {
        vi.useRealTimers();
        clearTenantStorage();
    });
    testSuccessfulTenantThemeApplication();
    testRejectedTenantSaveApplication();
});
