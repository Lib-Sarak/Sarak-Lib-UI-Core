/**
 * As paletas salvas pelo caminho real (ADR-027): o painel (`useDesignDraft` + `useSavedPalettes` + Aplicar) e o Provider com o
 * cache local e a porta do consumidor (`onSave`/`onLoad`) em `'hybrid'`. Salvar é rascunho; o `Aplicar` grava a lista junto do
 * design; recarregar a devolve; a troca de tema não a apaga; apagar e aplicar a tira do gravado.
 */
import React from 'react';
import { act, cleanup, configure, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useDesignDraft } from '../useDesignDraft';
import { useSavedPalettes, type SavedPalettesApi } from '../../Main/hooks/useSavedPalettes';
import { sarakLoadThemePreset } from '../../../../core/Design/presets/themes/registry';
import { resolveThemeForMode } from '../../../../core/Design/presets/themes/color-engine';
import { upgradeThemePayload } from '../../../../core/Design/master-map';
import { savedPalettesOf } from '../../../../core/Design/palette/savedPalettes';
import type { SarakDesignState, SarakThemeEntry, SarakUIOptions } from '../../../../core/Provider/types';
import type { SarakTokenValue } from '../../../../core/Design/types';

// Cada caso monta o Provider real com persistência e espera o onLoad; sob carga passam do `waitFor` padrão (1 s).
const MOUNT_TIMEOUT_MS = 30_000;
const CASE_TIMEOUT_MS = 4 * MOUNT_TIMEOUT_MS;
configure({ asyncUtilTimeout: MOUNT_TIMEOUT_MS });

type DesignRecord = Record<string, unknown>;
const BLUE = 'custom:analogous:#2563eb';
const WARM = 'custom:complementary:#aa3366';

let highContrast: SarakThemeEntry;
beforeAll(async () => { highContrast = await sarakLoadThemePreset('high-contrast') as SarakThemeEntry; });
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

interface Panel {
    apply: () => void;
    preview: (theme: SarakThemeEntry) => void;
    palettes: SavedPalettesApi;
    draft: DesignRecord;
}
let panel: Panel;
let systemDesign: DesignRecord = {};
let hydrated = false;

const Harness = (): React.ReactElement => {
    const sarak = useSarakUI();
    const { handleThemePreview, handleApplyToSystem, updateDraft, draft } = useDesignDraft(sarak);
    const palettes = useSavedPalettes({ draft: draft as unknown as DesignRecord, updateDraft: updateDraft as (id: string, value: SarakTokenValue) => void });
    const mode = draft.mode === 'light' ? 'light' : 'dark';
    panel = {
        apply: handleApplyToSystem,
        preview: (theme) => handleThemePreview(
            upgradeThemePayload(resolveThemeForMode({ design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte }, mode) as DesignRecord) as Partial<SarakDesignState>,
            undefined,
            theme.id,
        ),
        palettes,
        draft: draft as unknown as DesignRecord,
    };
    systemDesign = (sarak.systemDesign ?? sarak.design) as unknown as DesignRecord;
    hydrated = sarak.isHydrated === true;
    return <span data-testid="resolved">{String(sarak.resolvedThemeId)}</span>;
};

type Stored = { design: DesignRecord; activeThemeId?: string; format?: number };

/** Um servidor de consumidor: guarda o que `onSave` recebe e devolve no `onLoad`. */
const createServer = () => {
    const stored: { value: Stored | null } = { value: null };
    const onSave = vi.fn(async (design: DesignRecord, activeThemeId?: string, format?: number) => {
        stored.value = { design, activeThemeId, ...(format === undefined ? {} : { format }) };
    });
    const onLoad = vi.fn(async () => stored.value);
    return { stored, onSave, onLoad };
};
type Server = ReturnType<typeof createServer>;

const mounted = async (server: Server) => {
    hydrated = false;
    const options = { persistence: { strategy: 'hybrid', strictBackendSync: true, onSave: server.onSave, onLoad: server.onLoad } } as unknown as SarakUIOptions;
    const view = render(<SarakUIProvider options={options}><Harness /></SarakUIProvider>);
    await waitFor(() => expect(hydrated).toBe(true));
    await waitFor(() => expect(server.onLoad).toHaveBeenCalled());
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
    return view;
};

const reload = async (server: Server, view: ReturnType<typeof render>) => {
    view.unmount();
    return mounted(server);
};

const applyDraft = async (server: Server) => {
    const calls = server.onSave.mock.calls.length;
    await act(async () => { panel.apply(); });
    await waitFor(() => expect(server.onSave.mock.calls.length).toBe(calls + 1));
};

describe('paletas salvas — salvar, aplicar, recarregar, apagar', () => {
    it('salvar é rascunho; o Aplicar grava a lista como uma escolha do design; recarregar a devolve', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const server = createServer();
        const view = await mounted(server);

        await act(async () => { expect(await panel.palettes.save('Marca azul', BLUE)).toBe('saved'); });
        expect(savedPalettesOf(panel.draft)).toEqual([{ id: 'sp-1', name: 'Marca azul', value: BLUE }]);
        expect(savedPalettesOf(systemDesign)).toEqual([]);
        expect(server.onSave).not.toHaveBeenCalled();

        await applyDraft(server);
        expect(savedPalettesOf(systemDesign)).toEqual([{ id: 'sp-1', name: 'Marca azul', value: BLUE }]);
        expect(server.stored.value?.design.savedPalettes).toBe(`sp-1|Marca azul|${BLUE}`);
        expect(server.stored.value?.format).toBe(2);

        await reload(server, view);
        expect(savedPalettesOf(systemDesign)).toEqual([{ id: 'sp-1', name: 'Marca azul', value: BLUE }]);
        expect(panel.palettes.saved).toEqual([{ id: 'sp-1', name: 'Marca azul', value: BLUE }]);
    }, CASE_TIMEOUT_MS);

    it('a troca de tema aplicada não apaga a lista', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const server = createServer();
        const view = await mounted(server);

        // Dois salvamentos, como dois cliques: cada um lê a lista que o anterior deixou no rascunho.
        await act(async () => { await panel.palettes.save('Marca azul', BLUE); });
        await act(async () => { await panel.palettes.save('Quente', WARM); });
        await act(async () => { panel.preview(highContrast); });
        expect(panel.palettes.saved.map((entry) => entry.name)).toEqual(['Marca azul', 'Quente']);
        await applyDraft(server);
        await waitFor(() => expect(screen.getByTestId('resolved')).toHaveTextContent('high-contrast'));
        expect(savedPalettesOf(systemDesign).map((entry) => entry.name)).toEqual(['Marca azul', 'Quente']);

        await reload(server, view);
        expect(savedPalettesOf(systemDesign).map((entry) => entry.name)).toEqual(['Marca azul', 'Quente']);
    }, CASE_TIMEOUT_MS);

    it('apagar pede confirmação, sai do rascunho, e o Aplicar tira a lista do gravado (recarregar não a traz de volta)', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const server = createServer();
        const view = await mounted(server);
        await act(async () => { await panel.palettes.save('Marca azul', BLUE); });
        await applyDraft(server);

        let removal: Promise<void> = Promise.resolve();
        await act(async () => { removal = panel.palettes.remove(panel.palettes.saved[0]); });
        fireEvent.click(await screen.findByRole('button', { name: 'Apagar' }));
        await act(async () => { await removal; });
        expect(panel.palettes.saved).toEqual([]);
        expect(savedPalettesOf(systemDesign)).toHaveLength(1);

        await applyDraft(server);
        expect(server.stored.value?.design.savedPalettes ?? '').toBe('');
        await reload(server, view);
        expect(savedPalettesOf(systemDesign)).toEqual([]);
    }, CASE_TIMEOUT_MS);
});
