import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { DynamicTokenControl } from '../DynamicTokenControl';
import { TokenControl } from '../../Main/components/TokenControl';
import { exceptionRelationOf } from '../ExceptionRelation';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';
import type { SarakDesignToken, SarakTokenValue } from '../../../../core/Design/types';
import type { SarakDesignState } from '../../../../core/Provider/types';

/**
 * A relação mestre × canto do raio: o canto só vale quando declarado (diferente do padrão do schema) e, declarado,
 * ignora o mestre. O painel mostra isso e devolve o canto ao mestre.
 */
const withProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);
const tokenById = (id: string): SarakDesignToken => {
    const token = sarakGetAllDesignTokens().find((candidate) => candidate.id === id);
    if (!token) throw new Error(`token ${id} não existe no schema`);
    return token;
};
const draftOf = (values: Record<string, SarakTokenValue>) => values as unknown as SarakDesignState;

describe('exceptionRelationOf', () => {
    it('token fora de qualquer par mestre × canto não tem relação', () => {
        expect(exceptionRelationOf(tokenById('cardSurfaceOpacity'), {})).toBeNull();
    });

    it('o canto no padrão não conta como declarado; fora do padrão, conta', () => {
        const master = tokenById('cardBorderRadius');
        expect(exceptionRelationOf(master, {})?.declared).toEqual([]);
        expect(exceptionRelationOf(master, { cardRadiusBL: { mob: 0, tab: 0, desk: 0 } })?.declared.map((t) => t.id)).toEqual(['cardRadiusBL']);
    });
});

describe('raio mestre × canto', () => {
    it('o mestre mostra quantos cantos têm valor próprio e devolve todos ao mestre', () => {
        const updateDraft = vi.fn();
        withProvider(
            <DynamicTokenControl
                token={tokenById('cardBorderRadius')}
                draft={draftOf({ cardRadiusTL: { mob: 0, tab: 0, desk: 0 } })}
                updateDraft={updateDraft}
            />,
        );
        const note = screen.getByTestId('exception-relation');
        expect(note).toHaveTextContent('1 de 4 cantos');

        fireEvent.click(within(note).getByRole('button', { name: 'Voltar todos ao mestre' }));
        expect(updateDraft).toHaveBeenCalledTimes(1);
        expect(updateDraft).toHaveBeenCalledWith('cardRadiusTL', tokenById('cardRadiusTL').defaultValue);
    });

    it('o canto declarado ignora o mestre e volta a segui-lo pelo botão; o não declarado só informa', () => {
        const updateDraft = vi.fn();
        const corner = tokenById('cardRadiusTL');
        const { unmount } = withProvider(
            <DynamicTokenControl token={corner} draft={draftOf({ cardRadiusTL: { mob: 0, tab: 0, desk: 0 } })} updateDraft={updateDraft} />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Voltar ao mestre' }));
        expect(updateDraft).toHaveBeenCalledWith('cardRadiusTL', corner.defaultValue);
        unmount();

        withProvider(<DynamicTokenControl token={corner} draft={draftOf({})} updateDraft={updateDraft} />);
        expect(screen.getByTestId('exception-relation')).toHaveTextContent('Segue o mestre');
        expect(screen.queryByRole('button', { name: 'Voltar ao mestre' })).toBeNull();
    });

    it('a aba de tema mostra a mesma relação quando recebe o rascunho', () => {
        withProvider(
            <TokenControl
                token={tokenById('cardBorderRadius')}
                value={tokenById('cardBorderRadius').defaultValue}
                onChange={vi.fn()}
                draft={{ cardRadiusTR: { mob: 0, tab: 0, desk: 0 } }}
                updateDraft={vi.fn()}
            />,
        );
        expect(screen.getByTestId('exception-relation')).toHaveTextContent('1 de 4 cantos');
    });
});
