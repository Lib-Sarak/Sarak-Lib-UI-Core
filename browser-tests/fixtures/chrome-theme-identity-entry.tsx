import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome } from '../../src/components/Layout/SarakAppChrome';
import { SarakUIProvider, useSarakUI } from '../../src/core/Provider/SarakUIProvider';
import { useNavigationAppearance } from '../../src/core/Provider/useNavigationAppearance';
import { sarakPreloadThemes } from '../../src/core/Design/presets/themes/registry';

const THEME_IDS = ['sarak-sovereign', 'cyberpunk-neon', 'industrial-terminal', 'blueprint-protocol'];
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('O contêiner do harness não existe.');

const ThemeReadout = (): React.ReactElement => {
    const ui = useSarakUI();
    const appearance = useNavigationAppearance();
    return (
        <main
            data-testid="theme-readout"
            data-theme-id={ui.resolvedThemeId}
            data-sidebar-background-style={appearance.sidebarBackgroundStyle}
            data-sidebar-active-style={appearance.sidebarActiveItemStyle}
            data-sidebar-item-text-color={ui.design.sidebarItemTextColor}
            data-sidebar-brand-color={ui.design.sidebarBrandColor}
            data-sidebar-border-color={ui.design.sidebarBorderColor}
        >
            <span>Identidade da navegação</span>
        </main>
    );
};

const ThemeHarness = (): React.ReactElement => {
    const [themeId, setThemeId] = useState(THEME_IDS[0]);

    return (
        <>
            <nav aria-label="Temas">
                {THEME_IDS.map((id) => (
                    <button key={id} type="button" onClick={() => setThemeId(id)}>{id}</button>
                ))}
            </nav>
            <SarakUIProvider config={{ mode: 'dark' }} activeThemeId={themeId}>
                <SarakAppChrome
                    navigationStyle="sidebar"
                    brand={{ name: 'Identidade de teste' }}
                    nav={[
                        { label: 'Visão geral', route: '/overview' },
                        { label: 'Relatórios', route: '/reports' },
                    ]}
                    activeRoute="/overview"
                >
                    <ThemeReadout />
                </SarakAppChrome>
            </SarakUIProvider>
        </>
    );
};

createRoot(rootElement).render(<div><ThemeHarness /></div>);
void sarakPreloadThemes(THEME_IDS).catch((error: unknown) => {
    rootElement.textContent = error instanceof Error ? error.message : String(error);
});
