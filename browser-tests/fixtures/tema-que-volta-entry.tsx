import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider, useSarakUI } from '../../src/core/Provider/SarakUIProvider';
import type { SarakDesignState, SarakThemeEntry, SarakUIOptions } from '../../src/core/Provider/types';
import { ThemeCustomizationTab } from '../../src/features/DesignEngine/Main/ThemeCustomizationTab';

const STORAGE_KEY = 'browser-theme-restore';
const TENANT_ID = 'org-a';
const THEMES: SarakThemeEntry[] = [
    { id: 'old-theme', name: 'Tema antigo', design: { mode: 'dark', primaryColor: '#8a1111' } },
    { id: 'config-theme', name: 'Tema do config', design: { mode: 'dark', primaryColor: '#123456', colorBgBody: '#123456' } },
    { id: 'server-theme', name: 'Tema do servidor', design: { mode: 'dark', primaryColor: '#265f87' } },
];

declare global {
    interface Window {
        __resolveRestoredTheme?: () => void;
    }
}

const RestoredThemeProbe: React.FC = () => {
    const ui = useSarakUI();
    const updateDesign = (): void => {
        ui.setDesign({ ...ui.systemDesign, primaryColor: '#5d3489' } as SarakDesignState);
    };

    return (
        <>
            <output data-testid="restored-active-theme-id">{ui.resolvedThemeId}</output>
            <output data-testid="restored-primary-color">{ui.systemDesign?.primaryColor}</output>
            <button type="button" data-testid="change-applied-design" onClick={updateDesign}>Mudar tema aplicado</button>
        </>
    );
};

const loadServerTheme = (): Promise<{ design: SarakDesignState; activeThemeId: string }> =>
    new Promise((resolve) => {
        window.__resolveRestoredTheme = () => resolve({
            design: { mode: 'dark', primaryColor: '#265f87', colorBgBody: '#265f87' },
            activeThemeId: 'server-theme',
        });
    });

const options: SarakUIOptions = {
    fonts: 'none',
    persistence: {
        strategy: 'hybrid',
        storageKey: STORAGE_KEY,
        tenantId: TENANT_ID,
        preferConfigOverCache: true,
        onLoad: loadServerTheme,
        onSave: async () => { throw new Error('backend unavailable'); },
    },
    theme: { onSave: async () => undefined },
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Harness root ausente.');

createRoot(rootElement).render(
    <SarakUIProvider
        initialTheme="config-theme"
        config={{ mode: 'dark', primaryColor: '#123456', colorBgBody: '#123456' }}
        customThemes={THEMES}
        options={options}
    >
        <RestoredThemeProbe />
        <ThemeCustomizationTab />
    </SarakUIProvider>,
);
