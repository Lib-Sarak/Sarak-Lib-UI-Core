/**
 * O design gravado guarda só o que foi escolhido (ADR-026): pelo caminho do painel (`useDesignDraft` + Aplicar) e pelo
 * Provider real, com o cache local e a porta do consumidor (`onSave`/`onLoad`) em `'hybrid'`. O que a paleta calcula é
 * refeito a cada carga; o dado gravado antes do formato 2 é corrigido pela lib ao carregar, sem ação do importador.
 */
import React from 'react';
import { act, cleanup, configure, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useDesignDraft } from '../useDesignDraft';
import { sarakLoadThemePreset } from '../../../../core/Design/presets/themes/registry';
import { resolveThemeForMode } from '../../../../core/Design/presets/themes/color-engine';
import { composeThemeDesign } from '../../../../core/Design/presets/themes/compose';
import { resolvePaletteForDesign } from '../../../../core/Design/palette/resolve';
import { upgradeThemePayload } from '../../../../core/Design/master-map';
import { validateDesign } from '../../../../core/Provider/utils/validation';
import { DEFAULT_STORAGE_KEY } from '../../../../core/Provider/constants';
import { buildPaletteDraftPatch, barTonesOf } from '../../Main/utils/paletteDraft';
import type { SarakDesignState, SarakThemeEntry, SarakUIOptions } from '../../../../core/Provider/types';
import type { SarakTokenValue } from '../../../../core/Design/types';

// Cada caso monta o Provider real com persistência e espera o onLoad; os de 1.1 e 1.2 ainda desmontam e remontam o Provider
// várias vezes. Com a máquina ocupada (a suíte inteira em paralelo) passam do `waitFor` padrão (1 s) e do teste padrão (5 s):
// os limites são declarados para a montagem e para cada recarga, não deixados à sorte.
const MOUNT_TIMEOUT_MS = 30_000;
/** Teto de um caso que só monta o Provider. */
const MOUNT_CASE_TIMEOUT_MS = MOUNT_TIMEOUT_MS + 15_000;
/** Teto de um caso que recarrega o Provider: até seis montagens (1.2, um Aplicar e uma recarga por tom). */
const RELOAD_CASE_TIMEOUT_MS = 6 * MOUNT_TIMEOUT_MS;
configure({ asyncUtilTimeout: MOUNT_TIMEOUT_MS });

type Mode = 'light' | 'dark';
type Theme = Pick<SarakThemeEntry, 'design' | 'contraparte'>;
type DesignRecord = Record<string, unknown>;

const SOVEREIGN_ID = 'sarak-sovereign';
/** Outra paleta do registro, para a troca de paleta por cima do tema. */
const OTHER_PALETTE = 'amarelo-contraste';
const SURFACE_KEYS = ['colorBgBody', 'bgBaseColor', 'surfaceColor', 'colorBgLayer1', 'colorBgLayer2', 'cardBackgroundColor'];

let highContrast: SarakThemeEntry;
let sovereign: SarakThemeEntry;

beforeAll(async () => {
    highContrast = await sarakLoadThemePreset('high-contrast') as SarakThemeEntry;
    sovereign = await sarakLoadThemePreset(SOVEREIGN_ID) as SarakThemeEntry;
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
});

const resolvedFor = (theme: Theme, mode: Mode): DesignRecord =>
    resolveThemeForMode({ design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte }, mode) as DesignRecord;

/** O que a galeria do painel entrega ao rascunho (`PresetsCatalog`): o tema resolvido para o modo do rascunho. */
const galleryPayload = (theme: Theme, mode: Mode): Partial<SarakDesignState> =>
    upgradeThemePayload(resolvedFor(theme, mode)) as Partial<SarakDesignState>;

/** O tema composto limpo, como a troca de tema o produz a partir do padrão do schema. */
const composedClean = (theme: Theme, mode: Mode): DesignRecord =>
    validateDesign(composeThemeDesign(galleryPayload(theme, mode), { mode })) as unknown as DesignRecord;

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/** As chaves em que `design` não é o Sovereign limpo e é, em vez dele, o valor do High Contrast. */
const highContrastLeftovers = (design: DesignRecord, mode: Mode): string[] => {
    const clean = composedClean(sovereign, mode);
    const contrast = composedClean(highContrast, mode);
    return Object.keys(contrast).filter((key) => !same(design[key], clean[key]) && same(design[key], contrast[key]));
};

interface Panel {
    preview: (theme: Theme, id: string) => void;
    apply: () => void;
    update: (key: string, value: SarakTokenValue) => void;
    draft: DesignRecord;
    setColorMode: (mode: Mode) => void;
}
let panel: Panel;
let systemDesign: DesignRecord = {};
let effectiveDesign: DesignRecord = {};
let hydrated = false;

const Harness = (): React.ReactElement => {
    const sarak = useSarakUI();
    const { handleThemePreview, handleApplyToSystem, updateDraft, draft } = useDesignDraft(sarak);
    const mode: Mode = draft.mode === 'light' ? 'light' : 'dark';
    panel = {
        preview: (theme, id) => handleThemePreview(galleryPayload(theme, mode), undefined, id),
        apply: handleApplyToSystem,
        update: updateDraft,
        draft: draft as unknown as DesignRecord,
        setColorMode: (colorMode) => sarak.updatePreferences?.({ colorMode }),
    };
    systemDesign = (sarak.systemDesign ?? sarak.design) as unknown as DesignRecord;
    effectiveDesign = sarak.design as unknown as DesignRecord;
    hydrated = sarak.isHydrated === true;
    return <span data-testid="resolved">{String(sarak.resolvedThemeId)}</span>;
};

/** Sem o painel: o Provider como a aplicação o monta, para o modo claro sem rascunho por cima. */
const AppHarness = (): React.ReactElement => {
    const sarak = useSarakUI();
    panel = { ...panel, setColorMode: (colorMode) => sarak.updatePreferences?.({ colorMode }) };
    effectiveDesign = sarak.design as unknown as DesignRecord;
    hydrated = sarak.isHydrated === true;
    return <span data-testid="resolved">{String(sarak.resolvedThemeId)}</span>;
};

type Stored = { design: DesignRecord; activeThemeId?: string; format?: number };

/** Um servidor de consumidor: guarda o que `onSave` recebe e devolve no `onLoad`, como o ERP. */
const createServer = (initial: Stored | null = null) => {
    const stored: { value: Stored | null } = { value: initial };
    const onSave = vi.fn(async (design: DesignRecord, activeThemeId?: string, format?: number) => {
        stored.value = { design, activeThemeId, ...(format === undefined ? {} : { format }) };
    });
    const onLoad = vi.fn(async () => stored.value);
    return { stored, onSave, onLoad };
};
type Server = ReturnType<typeof createServer>;

/**
 * `config`: o que o host passa ao Provider. O ERP injeta no HTML o design que gravou e o passa como `config` no boot
 * seguinte (`injectedThemePayload`); por isso o gravado volta como cor declarada pelo host.
 */
const mountProvider = (server: Server, config?: DesignRecord, app = false) => {
    const options = { persistence: { strategy: 'hybrid', strictBackendSync: true, onSave: server.onSave, onLoad: server.onLoad } } as unknown as SarakUIOptions;
    return render(
        <SarakUIProvider options={options} config={config as never}>
            {app ? <AppHarness /> : <Harness />}
        </SarakUIProvider>,
    );
};

const mounted = async (server: Server, config?: DesignRecord, app = false) => {
    hydrated = false;
    const view = mountProvider(server, config, app);
    await waitFor(() => expect(hydrated).toBe(true));
    await waitFor(() => expect(server.onLoad).toHaveBeenCalled());
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
    return view;
};

const reload = async (server: Server, view: ReturnType<typeof render>, injectSaved: boolean) => {
    view.unmount();
    return mounted(server, injectSaved ? server.stored.value?.design : undefined);
};

const chooseAndApply = async (theme: Theme, id: string) => {
    await act(async () => { panel.preview(theme, id); });
    await act(async () => { panel.apply(); });
    await waitFor(() => expect(screen.getByTestId('resolved')).toHaveTextContent(id));
};

const applyDraft = async (server: Server) => {
    const calls = server.onSave.mock.calls.length;
    await act(async () => { panel.apply(); });
    await waitFor(() => expect(server.onSave.mock.calls.length).toBe(calls + 1));
};

describe('1.1 — trocar de tema pelo painel não deixa valor do tema anterior', () => {
    it.each([
        ['cache local e onLoad', false],
        ['gravado devolvido como `config` do host, como o ERP', true],
    ])('High Contrast → Aplicar → recarregar → Sarak Sovereign → Aplicar (%s): nada do High Contrast fica', async (_label, injectSaved) => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const server = createServer();
        let view = await mounted(server);

        await chooseAndApply(highContrast, 'high-contrast');
        await waitFor(() => expect(server.onSave).toHaveBeenCalledTimes(1));
        view = await reload(server, view, injectSaved);

        await chooseAndApply(sovereign, SOVEREIGN_ID);
        await waitFor(() => expect(server.onSave).toHaveBeenCalledTimes(2));
        expect(highContrastLeftovers(systemDesign, 'dark')).toEqual([]);

        await reload(server, view, injectSaved);
        expect(highContrastLeftovers(systemDesign, 'dark')).toEqual([]);
    }, RELOAD_CASE_TIMEOUT_MS);
});

/** A cor de fundo que a paleta do Sovereign dá a uma barra com o tom pedido. */
const barColorFor = (bar: 'sidebar' | 'topbar', tone: string): unknown =>
    resolvePaletteForDesign({ ...resolvedFor(sovereign, 'dark'), [`${bar}Tone`]: tone }, undefined, 'dark')[`${bar}Color`];

describe('1.2 — o tom da barra e a paleta mudam a cor depois de qualquer número de aplicações', () => {
    it.each([['sidebar'], ['topbar']] as const)('depois de Aplicar, trocar o tom da %s para primary, surface e inverse muda a cor dela, inclusive depois de recarregar', async (bar) => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const server = createServer();
        let view = await mounted(server);
        await chooseAndApply(sovereign, SOVEREIGN_ID);

        for (const tone of ['primary', 'surface', 'inverse']) {
            await act(async () => { panel.update(`${bar}Tone`, tone); });
            expect(panel.draft[`${bar}Color`]).toBe(barColorFor(bar, tone));
            await applyDraft(server);
            expect(systemDesign[`${bar}Color`]).toBe(barColorFor(bar, tone));
            view = await reload(server, view, true);
            expect(systemDesign[`${bar}Color`]).toBe(barColorFor(bar, tone));
        }
    }, RELOAD_CASE_TIMEOUT_MS);

    it('escolher outra paleta muda as superfícies; ida e volta: gravar → recarregar → o mesmo design, e da paleta só `colorPalette` é gravado', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const server = createServer();
        const view = await mounted(server);
        await chooseAndApply(sovereign, SOVEREIGN_ID);
        const before = Object.fromEntries(SURFACE_KEYS.map((key) => [key, systemDesign[key]]));

        const patch = buildPaletteDraftPatch(OTHER_PALETTE, 'dark', [], barTonesOf(panel.draft));
        await act(async () => { Object.entries(patch).forEach(([key, value]) => panel.update(key, value)); });
        await applyDraft(server);
        const applied = { ...systemDesign };
        SURFACE_KEYS.forEach((key) => expect(applied[key]).not.toBe(before[key]));
        SURFACE_KEYS.forEach((key) => expect(applied[key]).toBe(patch[key]));

        const savedPaletteKeys = Object.keys(server.stored.value?.design ?? {}).filter((key) => key in patch);
        expect(savedPaletteKeys).toEqual(['colorPalette']);
        expect(server.stored.value?.format).toBe(2);

        await reload(server, view, false);
        const changed = Object.keys(applied).filter((key) => !same(systemDesign[key], applied[key]));
        expect(changed).toEqual([]);
    }, RELOAD_CASE_TIMEOUT_MS);
});

/** O caso medido no ERP: o Sovereign gravado no formato de hoje, com as cores de superfície do High Contrast e a secundária de outra paleta. */
const measuredLegacyDesign = (): DesignRecord => ({
    ...composedClean(sovereign, 'dark'),
    bgBaseColor: '#000000',
    colorBgBody: '#000000',
    topbarColor: '#000000',
    sidebarColor: '#000000',
    surfaceColor: '#000000',
    colorBgLayer1: '#000000',
    colorBgLayer2: '#000000',
    cardBackgroundColor: '#000000',
    secondaryColor: '#518133',
    subtitleColor: '#5b8c3e',
    colorPalette: 'ciano-violeta',
    sidebarTone: 'inverse',
});

const seedLegacyCache = (design: DesignRecord) => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(design));
    localStorage.setItem(`${DEFAULT_STORAGE_KEY}::active-theme-id`, SOVEREIGN_ID);
};

/** O Sovereign limpo com a escolha que o dado gravado traz (a lateral Invertida), no modo pedido. */
const cleanWithInverse = (mode: Mode): DesignRecord => {
    const resolved = { ...resolvedFor(sovereign, mode), sidebarTone: 'inverse' };
    return validateDesign(composeThemeDesign(upgradeThemePayload(resolved), { mode })) as unknown as DesignRecord;
};
const COLOR_KEYS = ['colorBgBody', 'sidebarColor', 'topbarColor', 'cardBackgroundColor', 'secondaryColor', 'subtitleColor'];
const colorsOf = (design: DesignRecord) => Object.fromEntries(COLOR_KEYS.map((key) => [key, design[key]]));

describe('1.3 — design gravado no formato de hoje é corrigido pela lib ao carregar', () => {
    it('cache local e onLoad com as chaves do caso medido, em hybrid: o fundo, o tom e o modo claro saem iguais ao design limpo', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        seedLegacyCache(measuredLegacyDesign());
        const server = createServer({ design: measuredLegacyDesign(), activeThemeId: SOVEREIGN_ID });
        await mounted(server, undefined, true);

        expect(colorsOf(effectiveDesign)).toEqual(colorsOf(cleanWithInverse('dark')));
        expect(effectiveDesign.sidebarTone).toBe('inverse');

        await act(async () => { panel.setColorMode('light'); });
        await waitFor(() => expect(effectiveDesign.mode).toBe('light'));
        expect(colorsOf(effectiveDesign)).toEqual(colorsOf(cleanWithInverse('light')));
        expect(server.onSave).not.toHaveBeenCalled();
    }, MOUNT_CASE_TIMEOUT_MS);
});

/** As variáveis emitidas na raiz do escopo do Provider. */
const emitted = (name: string): string => {
    const root = document.querySelector('[data-sx-topbar-tone]') as HTMLElement | null;
    return root?.style.getPropertyValue(name) ?? '';
};
const EMITTED = ['--sarak-color-bg-body', '--sarak-sidebar-bg', '--sarak-card-bg'];

describe('1.5 — modo claro com o design do caso medido', () => {
    it('alternar claro/escuro 4 vezes muda o fundo do corpo, da lateral e do cartão em todas', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        seedLegacyCache(measuredLegacyDesign());
        const server = createServer({ design: measuredLegacyDesign(), activeThemeId: SOVEREIGN_ID });
        await mounted(server, undefined, true);

        let previous = EMITTED.map(emitted);
        expect(previous.every((value) => value !== '')).toBe(true);
        for (const mode of ['light', 'dark', 'light', 'dark'] as const) {
            await act(async () => { panel.setColorMode(mode); });
            await waitFor(() => expect(effectiveDesign.mode).toBe(mode));
            const current = EMITTED.map(emitted);
            current.forEach((value, index) => expect(value, `${EMITTED[index]} → ${mode}`).not.toBe(previous[index]));
            previous = current;
        }
    }, MOUNT_CASE_TIMEOUT_MS);
});
