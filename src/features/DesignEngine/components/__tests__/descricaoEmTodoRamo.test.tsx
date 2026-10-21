import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DynamicTokenControl } from '../DynamicTokenControl';
import { TokenControl, ControlRegistry } from '../../Main/components/TokenControl';
import { ColorControl } from '../DesignControls';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';
import type { SarakDesignToken, SarakTokenValue } from '../../../../core/Design/types';

/**
 * A descrição do schema é o que o painel mostra no `?` de TODO controle — dos dois despachantes (o do
 * Command Center e o da aba de tema), em todo ramo de tipo e nos dois formatos (escalar e responsivo).
 * Antes ela só atravessava no ramo `boolean`: o resto mostrava "Configuração granular para o parâmetro…".
 * A trava abre o `?` de um token por (despachante × tipo × responsivo) e exige o texto do schema.
 */
// O uploader de mídia lê `onMediaUpload` do Provider; aqui só a descrição importa, então o contexto é vazio.
vi.mock('../../../../core/Provider/SarakUIProvider', async (importActual) => ({
    ...(await importActual<typeof import('../../../../core/Provider/SarakUIProvider')>()),
    useSarakUI: () => ({}),
}));

const GENERIC_FALLBACK = 'Configuração granular para o parâmetro';

const tokens = sarakGetAllDesignTokens() as SarakDesignToken[];

/** Um token por combinação (tipo, responsivo): o ramo do despachante é decidido por elas. */
const representatives = (): SarakDesignToken[] => {
    const seen = new Map<string, SarakDesignToken>();
    for (const token of tokens) {
        const key = `${token.type}:${token.isResponsive ? 'responsivo' : 'escalar'}`;
        if (!seen.has(key)) seen.set(key, token);
    }
    return [...seen.values()];
};

const valueOf = (token: SarakDesignToken): SarakTokenValue => token.defaultValue;

/** Abre o primeiro `?` do controle renderizado e diz se o texto do schema apareceu (e o genérico não). */
function showsSchemaDescription(ui: React.ReactElement, description: string): boolean {
    const { container, unmount } = render(ui);
    try {
        const help = container.querySelector('button.cursor-help');
        if (!help) return false;
        fireEvent.mouseEnter(help);
        const shown = screen.queryByText(description) !== null;
        return shown && screen.queryByText(new RegExp(GENERIC_FALLBACK)) === null;
    } finally {
        unmount();
        cleanup();
    }
}

describe('todo token do schema tem descrição para o painel mostrar', () => {
    it('nenhum dos tokens está sem descrição', () => {
        const without = tokens.filter((token) => !token.description || token.description.trim().length < 10).map((token) => token.id);
        expect(without).toEqual([]);
    });
});

describe('a descrição do schema aparece no `?` de todo ramo dos dois despachantes', () => {
    afterEach(() => cleanup());

    const reps = representatives();

    it('há representante para cada tipo do schema', () => {
        expect(new Set(reps.map((token) => token.type)).size).toBeGreaterThanOrEqual(8);
    });

    it.each(reps.map((token) => [`${token.type}${token.isResponsive ? ' (responsivo)' : ''}`, token] as const))(
        'Command Center — %s',
        (_label, token) => {
            const ui = <DynamicTokenControl token={token} draft={{}} updateDraft={vi.fn()} />;
            expect(showsSchemaDescription(ui, token.description as string)).toBe(true);
        },
    );

    it.each(reps.filter((token) => ControlRegistry[token.type]).map((token) => [`${token.type}${token.isResponsive ? ' (responsivo)' : ''}`, token] as const))(
        'aba de tema — %s',
        (_label, token) => {
            const ui = <TokenControl token={token} value={valueOf(token)} onChange={vi.fn()} />;
            expect(showsSchemaDescription(ui, token.description as string)).toBe(true);
        },
    );
});

describe('MUTAÇÃO: o controle que não repassa a descrição é acusado', () => {
    afterEach(() => cleanup());

    it('um despachante que esquece `description` no ramo de cor cai no texto genérico', () => {
        const token = tokens.find((candidate) => candidate.type === 'color') as SarakDesignToken;
        const forgetful = <ColorControl label={token.label} value={token.defaultValue as string} onChange={vi.fn()} />;
        expect(showsSchemaDescription(forgetful, token.description as string)).toBe(false);
    });

    it('o controle certo passa pelo mesmo teste', () => {
        const token = tokens.find((candidate) => candidate.type === 'color') as SarakDesignToken;
        const correct = <ColorControl label={token.label} description={token.description} value={token.defaultValue as string} onChange={vi.fn()} />;
        expect(showsSchemaDescription(correct, token.description as string)).toBe(true);
    });
});
