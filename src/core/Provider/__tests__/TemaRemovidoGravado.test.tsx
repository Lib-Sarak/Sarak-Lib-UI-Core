/**
 * Tema removido do catálogo e ainda gravado: quem tinha `synthwave-retro` salvo não fica sem tema nem vê erro. O id chega
 * por três portas (a prop `activeThemeId`, o cache local do Provider e o `onLoad` do consumidor) e em todas o Provider
 * cai no tema padrão, no modo pedido, descarta o design gravado sobre o tema removido, avisa UMA vez nomeando o id e
 * não grava nada na hidratação (09 §4.3). Pela persistência isso vale só para o id que a LIB removeu: outro id
 * desconhecido pode ser tema do importador que ainda está carregando, e o design gravado dele é respeitado.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../SarakUIProvider';
import { SARAK_DEFAULT_THEME_ID } from '../../Design/presets/themes';
import { isSarakThemePresetId } from '../../Design/presets/themes/registry';
import { SARAK_ALL_THEMES } from '../../Design/presets/themes/all';
import { SARAK_THEME_LOADERS } from '../../Design/presets/themes/loaders';
import { composeThemeForMode } from '../../Design/presets/themes/compose';
import { DEFAULT_STORAGE_KEY } from '../constants';
import type { SarakUIOptions } from '../types';

const REMOVED_THEME_ID = 'synthwave-retro';
/** A cor do tema removido: se ela aparecer na tela, o design gravado venceu o tema padrão. */
const REMOVED_THEME_PRIMARY = '#e54a8f';
const ID_KEY = `${DEFAULT_STORAGE_KEY}::active-theme-id`;
const IMPORTER_THEME_ID = 'meu-tema';
const IMPORTER_PRIMARY = '#123456';
/** Referência estável: o Provider exige `customThemes` estável. */
const IMPORTER_THEMES = [{ id: IMPORTER_THEME_ID, name: 'Meu tema', design: { mode: 'light', primaryColor: IMPORTER_PRIMARY } }];

const defaultTheme = SARAK_ALL_THEMES.find((theme) => theme.id === SARAK_DEFAULT_THEME_ID)!;
const defaultPrimaryIn = (mode: 'light' | 'dark') =>
    String(composeThemeForMode({ design: defaultTheme.design as never, contraparte: defaultTheme.contraparte }, mode).primaryColor);

const Probe = () => {
    const { design, resolvedThemeId } = useSarakUI();
    return (
        <div>
            <span data-testid="primary">{String(design?.primaryColor)}</span>
            <span data-testid="mode">{String(design?.mode)}</span>
            <span data-testid="resolved">{String(resolvedThemeId)}</span>
        </div>
    );
};

const spyConsole = () => ({
    warn: vi.spyOn(console, 'warn').mockImplementation(() => undefined),
    error: vi.spyOn(console, 'error').mockImplementation(() => undefined),
});
const namingRemovedId = (spy: ReturnType<typeof vi.spyOn>) =>
    spy.mock.calls.filter((call: unknown[]) => String(call[0]).includes(`"${REMOVED_THEME_ID}"`));
const saveSpy = () => vi.fn(async () => undefined);
const seedCache = (mode: 'light' | 'dark') => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify({ mode, primaryColor: REMOVED_THEME_PRIMARY }));
    localStorage.setItem(ID_KEY, REMOVED_THEME_ID);
};
const loadingTheRemovedTheme = () => vi.fn(async () => ({
    design: { mode: 'light', primaryColor: REMOVED_THEME_PRIMARY },
    activeThemeId: REMOVED_THEME_ID,
}));

afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
});

/** O que vale nas portas do cache e do onLoad: o padrão no modo pedido, id resolvido, um aviso, nenhuma gravação. */
const expectDefaultThemeApplied = async (warn: ReturnType<typeof vi.spyOn>, onSave: ReturnType<typeof saveSpy>, mode: 'light' | 'dark') => {
    await waitFor(() => expect(screen.getByTestId('primary')).toHaveTextContent(defaultPrimaryIn(mode)));
    expect(screen.getByTestId('mode')).toHaveTextContent(mode);
    expect(screen.getByTestId('resolved')).toHaveTextContent(SARAK_DEFAULT_THEME_ID);
    expect(namingRemovedId(warn)).toHaveLength(1);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onSave).not.toHaveBeenCalled();
};

describe('o id de um tema removido, gravado, carrega o tema padrão no modo pedido', () => {
    it('o id não existe mais: fora do catálogo, dos ids aceitos e dos loaders', () => {
        expect(isSarakThemePresetId(REMOVED_THEME_ID)).toBe(false);
        expect(SARAK_ALL_THEMES.some((theme) => (theme.id as string) === REMOVED_THEME_ID)).toBe(false);
        expect(Object.keys(SARAK_THEME_LOADERS)).not.toContain(REMOVED_THEME_ID);
    });

    describe('pela prop activeThemeId', () => {
        it.each(['light', 'dark'] as const)('no modo %s: pinta o tema padrão nesse modo e avisa uma vez', async (mode) => {
            const { warn, error } = spyConsole();
            render(<SarakUIProvider activeThemeId={REMOVED_THEME_ID} config={{ mode }}><Probe /></SarakUIProvider>);

            await waitFor(() => expect(screen.getByTestId('primary')).toHaveTextContent(defaultPrimaryIn(mode)));
            expect(screen.getByTestId('mode')).toHaveTextContent(mode);
            expect(namingRemovedId(warn)).toHaveLength(1);
            // O guarda de CSS do jsdom também usa console.error: só interessa que nenhum erro cite o id.
            expect(error.mock.calls.some((call) => String(call[0]).includes(REMOVED_THEME_ID))).toBe(false);
        });
    });

    describe('pelo cache local do Provider (design e id gravados em localStorage)', () => {
        it.each(['local', 'hybrid'] as const)("estratégia '%s': descarta o design gravado", async (strategy) => {
            const { warn } = spyConsole();
            seedCache('dark');
            const onSave = saveSpy();
            const persistence: SarakUIOptions['persistence'] = strategy === 'hybrid'
                ? { strategy, onSave, onLoad: async () => null }
                : { strategy, onSave };
            render(<SarakUIProvider config={{ mode: 'light' }} options={{ persistence }}><Probe /></SarakUIProvider>);

            await expectDefaultThemeApplied(warn, onSave, 'light');
        });

        it('sem config.mode, o modo é o do design descartado', async () => {
            const { warn } = spyConsole();
            seedCache('light');
            const onSave = saveSpy();
            render(<SarakUIProvider options={{ persistence: { strategy: 'local', onSave } }}><Probe /></SarakUIProvider>);

            await expectDefaultThemeApplied(warn, onSave, 'light');
        });
    });

    describe('pelo onLoad do consumidor ({ design, activeThemeId })', () => {
        it("estratégia 'remote': descarta o design gravado", async () => {
            const { warn } = spyConsole();
            const onSave = saveSpy();
            const onLoad = loadingTheRemovedTheme();
            render(<SarakUIProvider config={{ mode: 'light' }} options={{ persistence: { strategy: 'remote', onLoad, onSave } }}><Probe /></SarakUIProvider>);

            await waitFor(() => expect(onLoad).toHaveBeenCalled());
            await expectDefaultThemeApplied(warn, onSave, 'light');
        });

        it("estratégia 'hybrid': descarta o design gravado e a chave do id no cache recebe o padrão", async () => {
            const { warn } = spyConsole();
            const onSave = saveSpy();
            const onLoad = loadingTheRemovedTheme();
            render(<SarakUIProvider config={{ mode: 'light' }} options={{ persistence: { strategy: 'hybrid', onLoad, onSave } }}><Probe /></SarakUIProvider>);

            await waitFor(() => expect(onLoad).toHaveBeenCalled());
            await expectDefaultThemeApplied(warn, onSave, 'light');
            await waitFor(() => expect(localStorage.getItem(ID_KEY)).toBe(SARAK_DEFAULT_THEME_ID));
            expect(String(localStorage.getItem(DEFAULT_STORAGE_KEY))).not.toContain(REMOVED_THEME_PRIMARY);
        });

        it('um id de customThemes devolvido pelo onLoad é conhecido: nada é descartado nem avisado', async () => {
            const { warn } = spyConsole();
            const custom = { id: 'meu-tema', name: 'Meu tema', design: { mode: 'light', primaryColor: '#123456' } };
            const onLoad = vi.fn(async () => ({ design: { primaryColor: '#123456' }, activeThemeId: 'meu-tema' }));
            render(
                <SarakUIProvider customThemes={[custom]} config={{ mode: 'light' }} options={{ persistence: { strategy: 'remote', onLoad } }}><Probe /></SarakUIProvider>,
            );

            await waitFor(() => expect(screen.getByTestId('resolved')).toHaveTextContent('meu-tema'));
            expect(screen.getByTestId('primary')).toHaveTextContent('#123456');
            expect(warn.mock.calls.some((call) => String(call[0]).includes('"meu-tema"'))).toBe(false);
        });
    });
});

describe('o id de um tema do importador que ainda não chegou à lista não é tratado como removido', () => {
    const expectKept = async (warn: ReturnType<typeof vi.spyOn>, onSave: ReturnType<typeof saveSpy>) => {
        await waitFor(() => expect(screen.getByTestId('primary')).toHaveTextContent(IMPORTER_PRIMARY));
        expect(screen.getByTestId('resolved')).toHaveTextContent(IMPORTER_THEME_ID);
        expect(warn.mock.calls.some((call: unknown[]) => String(call[0]).includes(`"${IMPORTER_THEME_ID}"`))).toBe(false);
        expect(onSave).not.toHaveBeenCalled();
    };

    it('pelo cache local: mantém o design e o id gravados, sem aviso, e segue igual quando a lista chega', async () => {
        const { warn } = spyConsole();
        localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify({ mode: 'light', primaryColor: IMPORTER_PRIMARY }));
        localStorage.setItem(ID_KEY, IMPORTER_THEME_ID);
        const onSave = saveSpy();
        const options = { persistence: { strategy: 'hybrid' as const, onSave, onLoad: async () => null } };
        const view = render(<SarakUIProvider config={{ mode: 'light' }} options={options}><Probe /></SarakUIProvider>);

        await expectKept(warn, onSave);
        expect(localStorage.getItem(ID_KEY)).toBe(IMPORTER_THEME_ID);

        view.rerender(<SarakUIProvider config={{ mode: 'light' }} customThemes={IMPORTER_THEMES} options={options}><Probe /></SarakUIProvider>);
        await expectKept(warn, onSave);
        expect(localStorage.getItem(ID_KEY)).toBe(IMPORTER_THEME_ID);
        expect(String(localStorage.getItem(DEFAULT_STORAGE_KEY))).toContain(IMPORTER_PRIMARY);
    });

    it("pelo onLoad ('hybrid'): o id e o design chegam antes da lista e a lista, depois, não muda nada", async () => {
        const { warn } = spyConsole();
        const onSave = saveSpy();
        const onLoad = vi.fn(async () => ({ design: { mode: 'light', primaryColor: IMPORTER_PRIMARY }, activeThemeId: IMPORTER_THEME_ID }));
        const options = { persistence: { strategy: 'hybrid' as const, onLoad, onSave } };
        const view = render(<SarakUIProvider config={{ mode: 'light' }} options={options}><Probe /></SarakUIProvider>);

        await waitFor(() => expect(onLoad).toHaveBeenCalled());
        await expectKept(warn, onSave);
        await waitFor(() => expect(localStorage.getItem(ID_KEY)).toBe(IMPORTER_THEME_ID));

        view.rerender(<SarakUIProvider config={{ mode: 'light' }} customThemes={IMPORTER_THEMES} options={options}><Probe /></SarakUIProvider>);
        await expectKept(warn, onSave);
        expect(localStorage.getItem(ID_KEY)).toBe(IMPORTER_THEME_ID);
    });

    it('id desconhecido que nunca chega, vindo do onLoad: o design gravado vale, sem aviso', async () => {
        const { warn } = spyConsole();
        const onSave = saveSpy();
        const onLoad = vi.fn(async () => ({ design: { mode: 'light', primaryColor: IMPORTER_PRIMARY }, activeThemeId: 'tema-de-outro-sistema' }));
        render(<SarakUIProvider config={{ mode: 'light' }} options={{ persistence: { strategy: 'remote', onLoad, onSave } }}><Probe /></SarakUIProvider>);

        await waitFor(() => expect(onLoad).toHaveBeenCalled());
        await waitFor(() => expect(screen.getByTestId('primary')).toHaveTextContent(IMPORTER_PRIMARY));
        expect(screen.getByTestId('resolved')).toHaveTextContent('tema-de-outro-sistema');
        expect(warn.mock.calls.some((call: unknown[]) => String(call[0]).includes('"tema-de-outro-sistema"'))).toBe(false);
        expect(onSave).not.toHaveBeenCalled();
    });

    it('id desconhecido que nunca chega, vindo do cache local: o design gravado vale, sem aviso', async () => {
        const { warn } = spyConsole();
        localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify({ mode: 'light', primaryColor: IMPORTER_PRIMARY }));
        localStorage.setItem(ID_KEY, 'tema-de-outro-sistema');
        render(<SarakUIProvider config={{ mode: 'light' }}><Probe /></SarakUIProvider>);

        await waitFor(() => expect(screen.getByTestId('primary')).toHaveTextContent(IMPORTER_PRIMARY));
        expect(warn.mock.calls.some((call: unknown[]) => String(call[0]).includes('"tema-de-outro-sistema"'))).toBe(false);
        expect(localStorage.getItem(ID_KEY)).toBe('tema-de-outro-sistema');
    });
});

