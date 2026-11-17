import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider, SarakCustomizationPanel, sarakGetDefaultDesignState } from '@sarak/lib-ui-core';
import { PRESET_GROUPS } from '../../src/core/Design/presets/components/registry';
import { sarakSovereignTheme } from '../../src/core/Design/presets/themes/sarak-sovereign';

const params = new URLSearchParams(window.location.search);
const height = params.get('alto') ?? '900px';
const width = params.get('largura') ?? '1600px';
const initialMode = params.get('claro') === '1' ? 'light' : 'dark';

/** `?hold=<id>`: segura o import desse tema embarcado, para o cartão dele ficar "ainda não carregado" na galeria até `window.__releaseTheme()`. */
const heldTheme = params.get('hold');
if (heldTheme) {
    const released = new Promise<void>((resolve) => { (window as unknown as { __releaseTheme: () => void }).__releaseTheme = resolve; });
    (globalThis as unknown as { __SARAK_TEST_THEME_IMPORT_GATE__: (id: string, load: () => Promise<unknown>) => Promise<unknown> }).__SARAK_TEST_THEME_IMPORT_GATE__ = (id, load) => (id === heldTheme ? released.then(load) : load());
}

/**
 * O registro de presets, só como dado (o painel vem do `dist/`): para cada opção, quais tokens ela escreve e se todos já valem
 * no design do harness (padrão do sistema + tema `sarak-sovereign`). É a prova de "já aplicada" e de "só mexe em movimento".
 */
const currentDesign: Record<string, unknown> = { ...(sarakGetDefaultDesignState() as unknown as Record<string, unknown>), ...(sarakSovereignTheme.design as Record<string, unknown>) };
/** A prévia do harness é desktop: um token responsivo (`{ mob, tab, desk }`) vale o seu valor de desktop. */
const atDesktop = (value: unknown): unknown => (value !== null && typeof value === 'object' && 'desk' in value ? (value as { desk: unknown }).desk : value);
(window as unknown as { __plan160: unknown }).__plan160 = Object.fromEntries(PRESET_GROUPS.flatMap((group) => group.presets.map((preset) => {
    const keys = Object.keys(preset.design);
    const applied = keys.every((key) => JSON.stringify(atDesktop(currentDesign[key])) === JSON.stringify(atDesktop((preset.design as Record<string, unknown>)[key])));
    return [`${group.id}/${preset.name}`, { keys, applied }];
})));

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('plan-160-previa-entry: #root ausente no harness.');

createRoot(rootElement).render(
    <SarakUIProvider
        initialTheme="sarak-sovereign"
        options={{
            fonts: { source: 'bundled' as const, baseUrl: params.get('fontes') ?? undefined },
            mode: 'app',
            i18n: { languages: ['pt'], language: 'pt' },
            preferences: { defaultColorMode: initialMode },
            persistence: { strategy: 'local', storageKey: `plan-160-${initialMode}` },
        }}
    >
        <div data-testid="plan-160-panel-host" style={{ width, height }}>
            <SarakCustomizationPanel />
        </div>
    </SarakUIProvider>,
);
