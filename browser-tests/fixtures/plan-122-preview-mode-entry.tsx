import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import type { SarakDesignState } from '../../src/core/Provider/types';
import { SarakDesignScope } from '../../src/core/Design/components/DesignScope';
import { sarakSovereignTheme } from '../../src/core/Design/presets/themes/sarak-sovereign';
import { cyberpunkneonTheme } from '../../src/core/Design/presets/themes/cyberpunk-neon';
import { neobrutalismTheme } from '../../src/core/Design/presets/themes/neo-brutalism';
import { minimalistAiry } from '../../src/core/Design/presets/themes/minimalist-airy';
import { SarakSelect } from '../../src/components/atomic/Inputs/SarakSelect';
import { CustomizationPanel } from '../../src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl';

const OPTION_THEME_SCOPES = [
    { id: 'sarak-sovereign', mode: 'dark', design: sarakSovereignTheme.design },
    { id: 'cyberpunk-neon', mode: 'dark', design: cyberpunkneonTheme.design },
    { id: 'neo-brutalism', mode: 'light', design: neobrutalismTheme.design },
    { id: 'minimalist-airy', mode: 'light', design: minimalistAiry.design },
] as const;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('plan-122-preview-mode-entry: #root ausente no harness.');

createRoot(rootElement).render(
    <SarakUIProvider
        initialTheme="sarak-sovereign"
        options={{ fonts: 'none', preferences: { defaultColorMode: 'light' } }}
    >
        <div data-testid="plan-122-panel-host" style={{ width: '1600px', height: '900px' }}>
            <CustomizationPanel />
        </div>
        <div data-testid="plan-122-select-contrast-matrix" style={{ position: 'fixed', left: '-10000px', top: 0 }}>
            {OPTION_THEME_SCOPES.map(({ id, mode, design }) => (
                <SarakDesignScope
                    key={id}
                    className={mode}
                    data-testid={`plan-122-select-scope-${id}`}
                    design={design as unknown as SarakDesignState}
                    style={{ width: 'fit-content', height: 'fit-content' }}
                >
                    <SarakSelect data-testid={`plan-122-select-${id}`} aria-label={`Opções do tema ${id}`}>
                        <option value="readable">Opção legível</option>
                    </SarakSelect>
                </SarakDesignScope>
            ))}
        </div>
    </SarakUIProvider>,
);
