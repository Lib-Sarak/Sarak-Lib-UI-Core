/**
 * A composição da troca de tema, pelas DUAS portas e pelo Provider real:
 * padrões → identidade → `config` do host → tema. O tema vence o que declara,
 * o `config` vale no resto e o tema anterior nunca herda.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useDesignDraft } from '../useDesignDraft';
import { sarakGetDefaultDesignState } from '../../../../core/Design/master-map';
import type { SarakDesignState } from '../../../../core/Provider/types';

const DEFAULT_RADIUS = sarakGetDefaultDesignState().cardBorderRadius;
// O validador pode reordenar as chaves de um valor responsivo: compara pelo conteúdo, não pela ordem.
const sorted = (value: unknown): string => JSON.stringify(value, Object.keys(value as object).sort());
const DEFAULT_RADIUS_TEXT = sorted(DEFAULT_RADIUS);

// A declara dois tokens; B só a primária. `layoutMaxWidth` é do `config` do host.
const themeA = { id: 'tema-a', name: 'A', design: { mode: 'dark', primaryColor: '#aa0000', cardBorderRadius: 33 } };
const themeB = { id: 'tema-b', name: 'B', design: { mode: 'dark', primaryColor: '#0000bb' } };
const THEMES = [themeA, themeB];

afterEach(() => localStorage.clear());

const Probe = () => {
    const { design, systemDesign } = useSarakUI();
    return (
        <div>
            <span data-testid="primary">{String(design.primaryColor)}</span>
            <span data-testid="radius">{sorted(design.cardBorderRadius)}</span>
            <span data-testid="width">{String(design.layoutMaxWidth)}</span>
            <span data-testid="system-radius">{sorted(systemDesign?.cardBorderRadius)}</span>
        </div>
    );
};

describe('Provider — o `config` do host sobrevive à aplicação do tema', () => {
    it('na montagem: token do `config` que o tema não declara fica; o que o tema declara vence o `config`', () => {
        render(
            <SarakUIProvider config={{ layoutMaxWidth: 777, primaryColor: '#999999' }} customThemes={THEMES} activeThemeId="tema-a">
                <Probe />
            </SarakUIProvider>,
        );

        expect(screen.getByTestId('width')).toHaveTextContent('777');
        expect(screen.getByTestId('primary')).toHaveTextContent('#aa0000');
        expect(screen.getByTestId('radius')).toHaveTextContent('33');
    });

    it('numa troca A→B: o `config` continua, e o que só o A declarava volta ao padrão (não herda)', () => {
        const view = render(
            <SarakUIProvider config={{ layoutMaxWidth: 777 }} customThemes={THEMES} activeThemeId="tema-a">
                <Probe />
            </SarakUIProvider>,
        );
        expect(screen.getByTestId('radius')).toHaveTextContent('33');

        view.rerender(
            <SarakUIProvider config={{ layoutMaxWidth: 777 }} customThemes={THEMES} activeThemeId="tema-b">
                <Probe />
            </SarakUIProvider>,
        );

        expect(screen.getByTestId('primary')).toHaveTextContent('#0000bb');
        expect(screen.getByTestId('width')).toHaveTextContent('777');
        expect(screen.getByTestId('radius')).toHaveTextContent(DEFAULT_RADIUS_TEXT);
    });

    it('se o host fixou o token que o A declarava, a troca para B devolve o valor do `config`, não o do A', () => {
        const view = render(
            <SarakUIProvider config={{ cardBorderRadius: 7 }} customThemes={THEMES} activeThemeId="tema-a">
                <Probe />
            </SarakUIProvider>,
        );
        expect(screen.getByTestId('radius')).toHaveTextContent('33');

        view.rerender(
            <SarakUIProvider config={{ cardBorderRadius: 7 }} customThemes={THEMES} activeThemeId="tema-b">
                <Probe />
            </SarakUIProvider>,
        );
        expect(screen.getByTestId('radius')).toHaveTextContent('7');
    });

    it('`config` inline (referência nova a cada render) não reaplica o tema nem entra em loop', () => {
        const view = render(
            <SarakUIProvider config={{ layoutMaxWidth: 700 }} customThemes={THEMES} activeThemeId="tema-a"><Probe /></SarakUIProvider>,
        );
        for (let i = 0; i < 5; i += 1) {
            view.rerender(
                <SarakUIProvider config={{ layoutMaxWidth: 700 }} customThemes={THEMES} activeThemeId="tema-a"><Probe /></SarakUIProvider>,
            );
        }
        expect(screen.getByTestId('width')).toHaveTextContent('700');
    });
});

describe('Prévia do painel — não herda de A ao mostrar B, e o "Aplicar" grava esse estado', () => {
    const Harness = () => {
        const sarak = useSarakUI();
        const { draft, handleThemePreview, handleApplyToSystem } = useDesignDraft(sarak);
        const radius = (draft as Record<string, unknown>).cardBorderRadius;
        return (
            <div>
                <span data-testid="draft-radius">{sorted(radius)}</span>
                <span data-testid="draft-width">{String((draft as Record<string, unknown>).layoutMaxWidth)}</span>
                <span data-testid="draft-primary">{String((draft as Record<string, unknown>).primaryColor)}</span>
                <span data-testid="system-radius">{sorted((sarak.systemDesign as Record<string, unknown> | undefined)?.cardBorderRadius)}</span>
                <button data-testid="preview-a" onClick={() => handleThemePreview(themeA.design as Partial<SarakDesignState>, undefined, 'tema-a')}>A</button>
                <button data-testid="preview-b" onClick={() => handleThemePreview(themeB.design as Partial<SarakDesignState>, undefined, 'tema-b')}>B</button>
                <button data-testid="apply" onClick={() => handleApplyToSystem()}>Aplicar</button>
            </div>
        );
    };

    it('A declara o raio e B não: depois de B o raio da prévia é o padrão, o `config` fica, e o Aplicar grava assim', async () => {
        render(
            <SarakUIProvider config={{ layoutMaxWidth: 777 }} customThemes={THEMES} initialTheme="tema-a">
                <Harness />
            </SarakUIProvider>,
        );

        await act(async () => { fireEvent.click(screen.getByTestId('preview-a')); });
        expect(screen.getByTestId('draft-radius')).toHaveTextContent('33');

        await act(async () => { fireEvent.click(screen.getByTestId('preview-b')); });
        expect(screen.getByTestId('draft-primary')).toHaveTextContent('#0000bb');
        expect(screen.getByTestId('draft-radius')).toHaveTextContent(DEFAULT_RADIUS_TEXT);
        expect(screen.getByTestId('draft-width')).toHaveTextContent('777');

        await act(async () => { fireEvent.click(screen.getByTestId('apply')); });
        expect(screen.getByTestId('system-radius')).toHaveTextContent(DEFAULT_RADIUS_TEXT);
    });
});
