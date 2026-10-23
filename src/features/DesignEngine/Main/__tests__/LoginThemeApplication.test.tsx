import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeCustomizationTab } from '../ThemeCustomizationTab';
import { SarakUIProvider, useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { SarakThemePayload, SarakUIOptions } from '../../../../core/Provider/types';

const STORAGE_KEY = 'login-theme-application';
const TENANT_ID = 'tenant-acme';
const TENANT_STORAGE_KEY = `${STORAGE_KEY}::tenant:${TENANT_ID}`;
const TENANT_DESIGN: SarakThemePayload = {
    mode: 'dark',
    primaryColor: '#123456',
    colorBgBody: '#123456',
};

type TenantOnLoad = NonNullable<NonNullable<SarakUIOptions['persistence']>['onLoad']>;
type TenantOnSave = NonNullable<NonNullable<SarakUIOptions['persistence']>['onSave']>;
type ThemeOnSave = NonNullable<NonNullable<SarakUIOptions['theme']>['onSave']>;

interface LoginThemeScenarioProps {
    onLoad: TenantOnLoad;
    onSave: TenantOnSave;
    onSaveTheme: ThemeOnSave;
}

const TenantDesignProbe = (): React.ReactElement => {
    const { systemDesign, draftDesign } = useSarakUI();
    return (
        <>
            <output data-testid="tenant-primary-color">{systemDesign?.primaryColor}</output>
            <output data-testid="tenant-system-background">{systemDesign?.colorBgBody}</output>
            <output data-testid="tenant-draft-background">{draftDesign?.colorBgBody}</output>
        </>
    );
};

const LoginThemeScenario = ({ onLoad, onSave, onSaveTheme }: LoginThemeScenarioProps): React.ReactElement => {
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
                <ThemeCustomizationTab />
            </SarakUIProvider>
        </>
    );
};

const selectBootLoadedTheme = async (): Promise<void> => {
    fireEvent.click(screen.getByRole('button', { name: 'Abrir galeria' }));
    const galleryHeading = await screen.findByRole('heading', { name: 'Galeria de estilos' });
    const gallery = galleryHeading.closest('#presets-catalog');
    expect(gallery).not.toBeNull();
    fireEvent.click(within(gallery as HTMLElement).getByRole('button', { name: /Sarak Sovereign/ }));
    await waitFor(() => expect(screen.getByTestId('tenant-draft-background')).toHaveTextContent('#06080d'));
};

const getApplyButton = (): HTMLButtonElement => {
    const actionBar = screen.getByRole('group', { name: 'Ações do tema' });
    return within(actionBar).getByRole('button', { name: /^Aplicar/ }) as HTMLButtonElement;
};

const parsePersistedTenantDesign = (): SarakThemePayload =>
    JSON.parse(localStorage.getItem(TENANT_STORAGE_KEY) ?? 'null') as SarakThemePayload;

const clearTenantStorage = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TENANT_STORAGE_KEY);
};

const testSuccessfulTenantThemeApplication = (): void => {
    it('carrega o tenant e só persiste a escolha da galeria ao aplicar o rascunho', async () => {
        const onLoad = vi.fn<TenantOnLoad>().mockResolvedValue(TENANT_DESIGN);
        const onSave = vi.fn<TenantOnSave>();
        const onSaveTheme = vi.fn<ThemeOnSave>();

        render(<LoginThemeScenario onLoad={onLoad} onSave={onSave} onSaveTheme={onSaveTheme} />);
        fireEvent.click(screen.getByRole('button', { name: 'Fazer login' }));

        await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(1));
        expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#123456');
        expect(localStorage.getItem(TENANT_STORAGE_KEY)).toBeNull();

        await selectBootLoadedTheme();
        expect(screen.getByTestId('tenant-system-background')).toHaveTextContent('#123456');
        const applyButton = getApplyButton();
        expect(applyButton).toHaveTextContent(/^Aplicar \(\d+\)$/);
        expect(applyButton).toBeEnabled();
        expect(onSave).not.toHaveBeenCalled();
        expect(onSaveTheme).not.toHaveBeenCalled();
        expect(localStorage.getItem(TENANT_STORAGE_KEY)).toBeNull();

        fireEvent.click(applyButton);

        await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
        expect(screen.getByTestId('tenant-system-background')).toHaveTextContent('#06080d');
        const persistedDesign = parsePersistedTenantDesign();
        expect(persistedDesign.primaryColor).not.toBe(TENANT_DESIGN.primaryColor);
        expect(onSave).toHaveBeenCalledWith(persistedDesign, 'sarak-sovereign');
        expect(onSaveTheme).not.toHaveBeenCalled();
    }, 15000);
};

const testRejectedTenantSaveApplication = (): void => {
    it('mede uma única tentativa do tenant quando onSave rejeita após aplicar', async () => {
        const onLoad = vi.fn<TenantOnLoad>().mockResolvedValue(TENANT_DESIGN);
        const onSave = vi.fn<TenantOnSave>().mockRejectedValue(new Error('tenant validation failed'));
        const onSaveTheme = vi.fn<ThemeOnSave>();

        render(<LoginThemeScenario onLoad={onLoad} onSave={onSave} onSaveTheme={onSaveTheme} />);
        fireEvent.click(screen.getByRole('button', { name: 'Fazer login' }));

        await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByTestId('tenant-primary-color')).toHaveTextContent('#123456'));
        await selectBootLoadedTheme();
        fireEvent.click(getApplyButton());

        await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
        await new Promise((resolve) => setTimeout(resolve, 1800));

        expect(onSave).toHaveBeenCalledTimes(1);
    }, 15000);
};

describe('SarakUIProvider — aplicar tema depois do login', () => {
    afterEach(clearTenantStorage);
    testSuccessfulTenantThemeApplication();
    testRejectedTenantSaveApplication();
});
