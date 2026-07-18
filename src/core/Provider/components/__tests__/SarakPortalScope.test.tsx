/**
 * SarakPortalScope (Spec 24) — devolve o escopo ao conteúdo que sai da ilha via portal.
 *
 * Sem ele, um toast/drawer disparado pelo manifesto renderizaria em `document.body`,
 * fora de `.sarak-scope`, e portanto SEM nenhum estilo do CSS escopado.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakPortalScope } from '../SarakPortalScope';
import { SARAK_SCOPE_CLASS, SarakScopeContext } from '../../scope';

const renderComEscopo = (scopeClass: string) =>
    render(
        <SarakScopeContext.Provider value={scopeClass}>
            <SarakPortalScope>
                <p data-testid="conteudo">portalizado</p>
            </SarakPortalScope>
        </SarakScopeContext.Provider>,
    );

describe('SarakPortalScope', () => {
    it('Modo App (classe vazia): não envelopa — nenhum nó extra no DOM', () => {
        const { container } = renderComEscopo('');
        expect(container.firstChild).toBe(screen.getByTestId('conteudo'));
        expect(container.querySelector(`[data-sarak-portal-scope="true"]`)).toBeNull();
    });

    it('Modo Embarcado: envelopa o conteúdo com a classe de escopo', () => {
        renderComEscopo(SARAK_SCOPE_CLASS);
        const envelope = screen.getByTestId('conteudo').closest(`[data-sarak-portal-scope="true"]`);
        expect(envelope).not.toBeNull();
        expect(envelope).toHaveClass(SARAK_SCOPE_CLASS);
    });

    it('o envelope não recebe estilo (não vira containing block de `position: fixed`)', () => {
        renderComEscopo(SARAK_SCOPE_CLASS);
        const envelope = screen
            .getByTestId('conteudo')
            .closest(`[data-sarak-portal-scope="true"]`) as HTMLElement;
        // `transform`/`filter`/`contain` inline ancorariam filhos fixos no envelope.
        expect(envelope.getAttribute('style')).toBeNull();
    });

    it('fora de qualquer Provider degrada para o comportamento do Modo App', () => {
        const { container } = render(
            <SarakPortalScope>
                <p data-testid="conteudo">portalizado</p>
            </SarakPortalScope>,
        );
        expect(container.querySelector(`[data-sarak-portal-scope="true"]`)).toBeNull();
        expect(screen.getByTestId('conteudo')).toBeInTheDocument();
    });
});
