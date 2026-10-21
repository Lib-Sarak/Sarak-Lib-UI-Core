/**
 * Tema sob demanda — o boot leva só o tema padrão; o resto chega quando é escolhido,
 * sem a tela mostrar um tema e trocar para outro.
 *
 * O cache de temas é de módulo: cada caso usa um tema embarcado DIFERENTE para não
 * herdar o que outro caso já carregou.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../SarakUIProvider';
import { sarakPreloadThemes, getLoadedThemePreset } from '../../Design/presets/themes/registry';
import { SARAK_DEFAULT_THEME_ID } from '../../Design/presets/themes';
import { SARAK_ALL_THEMES } from '../../Design/presets/themes/all';
import { SARAK_THEME_LOADERS } from '../../Design/presets/themes/loaders';
import { resolveThemeForMode } from '../../Design/presets/themes/color-engine';
import { DEFAULT_STORAGE_KEY } from '../constants';

const themeOf = (id: string) => SARAK_ALL_THEMES.find((theme) => theme.id === id)!;
const primaryOf = (id: string, mode: 'light' | 'dark' = (themeOf(id).design.mode as 'light' | 'dark') || 'dark') =>
    String(resolveThemeForMode({ design: themeOf(id).design as never, contraparte: themeOf(id).contraparte }, mode).primaryColor);

/** Registra o `primaryColor` de CADA render — a prova de que nenhum quadro mostrou o tema errado. */
const makeProbe = () => {
    const seen: string[] = [];
    const Probe = () => {
        const { design, resolvedThemeId } = useSarakUI();
        seen.push(String(design?.primaryColor));
        return (
            <div>
                <span data-testid="primary">{String(design?.primaryColor)}</span>
                <span data-testid="resolved">{String(resolvedThemeId)}</span>
            </div>
        );
    };
    return { seen, Probe };
};

afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
});

describe('o tema padrão pinta no primeiro quadro, sem espera', () => {
    it('sem nenhum pedido, o primeiro render já é a aplicação no sarak-sovereign', () => {
        const { seen, Probe } = makeProbe();
        render(<SarakUIProvider><Probe /></SarakUIProvider>);

        expect(screen.getByTestId('resolved')).toHaveTextContent(SARAK_DEFAULT_THEME_ID);
        expect(new Set(seen)).toEqual(new Set([primaryOf(SARAK_DEFAULT_THEME_ID)]));
    });
});

describe('tema embarcado forçado por código que ainda não está em memória', () => {
    it('segura a aplicação no loadingFallback e a primeira coisa que a aplicação pinta já é o tema certo', async () => {
        expect(getLoadedThemePreset('neo-brutalism')).toBeUndefined();
        const { seen, Probe } = makeProbe();

        render(
            <SarakUIProvider initialTheme="neo-brutalism" loadingFallback={<p data-testid="fallback">carregando tema</p>}>
                <Probe />
            </SarakUIProvider>,
        );

        // A porta de espera: o que existe no primeiro quadro é o fallback, nunca outro tema.
        expect(screen.getByTestId('fallback')).toBeInTheDocument();
        expect(seen).toEqual([]);

        await waitFor(() => expect(screen.getByTestId('primary')).toBeInTheDocument());
        expect(screen.getByTestId('primary')).toHaveTextContent(primaryOf('neo-brutalism'));
        expect(screen.getByTestId('resolved')).toHaveTextContent('neo-brutalism');
        // Nenhum render da aplicação viu o tema padrão nem outro.
        expect(new Set(seen)).toEqual(new Set([primaryOf('neo-brutalism')]));
    });

    it('pré-carregado por sarakPreloadThemes, o primeiro render JÁ é a aplicação — sem fallback', async () => {
        await sarakPreloadThemes(['nebula-space']);
        const { seen, Probe } = makeProbe();

        render(
            <SarakUIProvider initialTheme="nebula-space" loadingFallback={<p data-testid="fallback" />}>
                <Probe />
            </SarakUIProvider>,
        );

        expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
        expect(screen.getByTestId('primary')).toHaveTextContent(primaryOf('nebula-space'));
        expect(new Set(seen)).toEqual(new Set([primaryOf('nebula-space')]));
    });

    it('o tema SALVO pinta direto do design guardado, sem esperar o catálogo', async () => {
        expect(getLoadedThemePreset('kinetic-flow')).toBeUndefined();
        const saved = { ...themeOf('sarak-sovereign').design, primaryColor: '#abcdef' };
        localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(saved));
        const { seen, Probe } = makeProbe();

        render(
            <SarakUIProvider initialTheme="kinetic-flow" loadingFallback={<p data-testid="fallback" />}>
                <Probe />
            </SarakUIProvider>,
        );

        expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
        expect(seen[0]).toBe('#abcdef');
        expect(new Set(seen)).toEqual(new Set(['#abcdef']));
        // O id do tema salvo é carregado depois, sem tocar o design.
        await waitFor(() => expect(getLoadedThemePreset('kinetic-flow')).toBeDefined());
        expect(screen.getByTestId('primary')).toHaveTextContent('#abcdef');
    });

    it('falha do import() libera a porta e registra o erro — a aplicação nunca fica presa', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        vi.spyOn(SARAK_THEME_LOADERS, 'synthwave-retro').mockRejectedValue(new Error('rede'));
        const { Probe } = makeProbe();

        render(
            <SarakUIProvider initialTheme="synthwave-retro" loadingFallback={<p data-testid="fallback" />}>
                <Probe />
            </SarakUIProvider>,
        );

        await waitFor(() => expect(screen.getByTestId('primary')).toBeInTheDocument());
        expect(error.mock.calls.some((call) => String(call[0]).includes('"synthwave-retro"'))).toBe(true);
        expect(warn).toBeDefined();
    });
});

describe('id inexistente é decidido SEM rede, no primeiro quadro', () => {
    it('avisa nomeando o id e semeia com o tema padrão', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { Probe } = makeProbe();

        render(<SarakUIProvider initialTheme="classic"><Probe /></SarakUIProvider>);

        expect(screen.getByTestId('primary')).toHaveTextContent(primaryOf(SARAK_DEFAULT_THEME_ID));
        expect(warn.mock.calls.some((call) => String(call[0]).includes('"classic"'))).toBe(true);
    });

    it('em modo claro cai na CONTRAPARTE clara do tema padrão — nunca num escuro com o rótulo trocado', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const sovereign = themeOf(SARAK_DEFAULT_THEME_ID);
        const { Probe } = makeProbe();

        render(<SarakUIProvider initialTheme="classic" config={{ mode: 'light' }}><Probe /></SarakUIProvider>);

        expect(screen.getByTestId('primary')).toHaveTextContent(String(sovereign.contraparte?.primaryColor));
    });

    it('options.theme.defaultTheme inexistente AVISA (não cai em silêncio) e usa o padrão', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { Probe } = makeProbe();

        render(<SarakUIProvider options={{ theme: { defaultTheme: 'nao-existe' } }}><Probe /></SarakUIProvider>);

        expect(warn.mock.calls.some((call) => String(call[0]).includes('defaultTheme "nao-existe"'))).toBe(true);
        expect(screen.getByTestId('primary')).toHaveTextContent(primaryOf(SARAK_DEFAULT_THEME_ID));
    });
});

describe('trocar de tema por código: o atual fica na tela até o novo chegar', () => {
    const themeA = { id: 'tema-a', name: 'A', design: { mode: 'dark', primaryColor: '#aa0000', cardBorderRadius: 33 } };

    it('activeThemeId vai para um embarcado fora de memória: nada de tela vazia nem de referência; ao chegar, aplica e NÃO herda token do anterior', async () => {
        expect(getLoadedThemePreset('golden-hour')).toBeUndefined();
        const { seen, Probe } = makeProbe();
        const view = render(
            <SarakUIProvider customThemes={[themeA]} activeThemeId="tema-a"><Probe /></SarakUIProvider>,
        );
        expect(screen.getByTestId('primary')).toHaveTextContent('#aa0000');
        const afterA = seen.length;

        view.rerender(
            <SarakUIProvider customThemes={[themeA]} activeThemeId="golden-hour"><Probe /></SarakUIProvider>,
        );

        // Antes de chegar: continua o tema A (a aplicação não desmontou).
        expect(screen.getByTestId('primary')).toHaveTextContent('#aa0000');
        await waitFor(() => expect(screen.getByTestId('primary')).toHaveTextContent(primaryOf('golden-hour', 'dark')));
        // Nenhum quadro intermediário mostrou o padrão ou a referência.
        const between = seen.slice(afterA);
        expect(between.every((color) => color === '#aa0000' || color === primaryOf('golden-hour', 'dark'))).toBe(true);
    });
});

describe('SSR', () => {
    it('renderToString com tema embarcado fora de memória devolve o fallback e não lança', () => {
        const html = renderToString(
            <SarakUIProvider initialTheme="aurora-veil" loadingFallback={<p>carregando tema</p>}>
                <p>app</p>
            </SarakUIProvider>,
        );
        expect(html).toContain('carregando tema');
        expect(html).not.toContain('app');
    });
});
