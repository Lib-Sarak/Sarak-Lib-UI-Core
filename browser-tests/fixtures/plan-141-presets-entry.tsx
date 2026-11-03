import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { CustomizationPanel } from '../../src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl';

import { MASTER_DESIGN_MAP } from '../../src/core/Design/master-map';
import { measurePresetCoverage } from '../../src/core/Design/presets/components/coverage';
import { ALL_COMPONENT_PRESETS, PRESET_GROUPS } from '../../src/core/Design/presets/components/registry';

/** O registro de presets entregue ao spec: o Playwright não lê JSON do `src/`, o esbuild do harness lê. */
const coverage = measurePresetCoverage(MASTER_DESIGN_MAP.components, ALL_COMPONENT_PRESETS);
(window as unknown as { __plan141: unknown }).__plan141 = {
    presetCount: ALL_COMPONENT_PRESETS.length,
    coverage: { covered: coverage.covered, total: coverage.total, ratio: coverage.ratio, families: coverage.families.map(({ family, covered, total }) => ({ family, covered, total })) },
    groups: PRESET_GROUPS.map((group) => ({ id: group.id, decision: group.decision, count: group.presets.length, featured: group.featured.length, featuredIds: group.featured.filter((id) => group.presets.some((preset) => preset.id === id)), ids: group.presets.map((preset) => preset.id) })),
};

const params = new URLSearchParams(window.location.search);
const height = params.get('alto') ?? '900px';
const initialMode = params.get('claro') === '1' ? 'light' : 'dark';
const language = params.get('idioma') ?? 'pt';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('plan-141-presets-entry: #root ausente no harness.');

createRoot(rootElement).render(
    <SarakUIProvider
        initialTheme="sarak-sovereign"
        options={{
            fonts: params.get('fontes') === 'none' ? 'none' : 'google',
            mode: 'app',
            i18n: { languages: [language], language },
            preferences: { defaultColorMode: initialMode },
            persistence: { strategy: 'local', storageKey: `plan-141-${initialMode}-${language}` },
        }}
    >
        <div data-testid="plan-141-panel-host" style={{ width: '1600px', height }}>
            <CustomizationPanel />
        </div>
    </SarakUIProvider>,
);
