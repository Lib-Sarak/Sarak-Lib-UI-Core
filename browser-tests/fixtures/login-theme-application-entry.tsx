import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakCustomizationPanel, SarakUIProvider, useSarakUI } from '@sarak/lib-ui-core';
import type { SarakThemePayload, SarakUIOptions } from '../../../src/core/Provider/types';

const STORAGE_KEY = 'login-theme-application';
const TENANT_ID = 'tenant-acme';
const TENANT_DESIGN: SarakThemePayload = {
    mode: 'dark',
    primaryColor: '#123456',
    colorBgBody: '#123456',
};

declare global {
    interface Window {
        __tenantThemeSave?: { design: SarakThemePayload; activeThemeId?: string };
        __namedThemeSaveCalled?: boolean;
    }
}

const TenantDesignProbe = (): React.ReactElement => {
    const { systemDesign, draftDesign } = useSarakUI();
    return (
        <>
            <output data-probe="tenant-primary-color">{systemDesign?.primaryColor}</output>
            <output data-probe="tenant-system-background">{systemDesign?.colorBgBody}</output>
            <output data-probe="tenant-draft-background">{draftDesign?.colorBgBody}</output>
        </>
    );
};

const LoginThemeScenario = (): React.ReactElement => {
    const [tenantId, setTenantId] = useState<string | undefined>();
    const persistence: NonNullable<SarakUIOptions['persistence']> = tenantId
        ? {
            storageKey: STORAGE_KEY,
            crossTabSync: true,
            tenantId,
            onLoad: () => TENANT_DESIGN,
            onSave: (design, activeThemeId) => { window.__tenantThemeSave = { design, activeThemeId }; },
        }
        : { storageKey: STORAGE_KEY, crossTabSync: true };
    const options: SarakUIOptions = {
        fonts: 'none',
        persistence,
        theme: tenantId ? { onSave: () => { window.__namedThemeSaveCalled = true; } } : undefined,
    };

    return (
        <>
            <button type="button" onClick={() => setTenantId(TENANT_ID)}>Fazer login</button>
            <SarakUIProvider options={options}>
                <TenantDesignProbe />
                <SarakCustomizationPanel />
            </SarakUIProvider>
        </>
    );
};

const root = document.getElementById('root');
if (!root) throw new Error('login-theme-application-entry: #root ausente no harness.');
createRoot(root).render(<LoginThemeScenario />);
