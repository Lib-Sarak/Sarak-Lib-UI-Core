/**
 * SarakScopeRoot (Spec 24) — a raiz da ilha embarcada.
 *
 * Regra central: no Modo App o componente é um NO-OP ESTRUTURAL (nenhum nó extra no
 * DOM), senão a promessa de "zero breaking change" do modo default cairia.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakScopeRoot } from '../SarakScopeRoot';
import { SARAK_SCOPE_CLASS, useSarakScopeClass } from '../../scope';

const ClasseDeEscopo: React.FC = () => <span data-testid="classe">{useSarakScopeClass() || '(vazia)'}</span>;

describe('SarakScopeRoot', () => {
    it('Modo App: não cria nó nenhum — devolve os filhos crus', () => {
        const { container } = render(
            <SarakScopeRoot mode="app">
                <p data-testid="filho">conteúdo</p>
            </SarakScopeRoot>,
        );
        expect(container.firstChild).toBe(screen.getByTestId('filho'));
        expect(container.querySelector(`.${SARAK_SCOPE_CLASS}`)).toBeNull();
    });

    it('Modo App: publica classe de escopo VAZIA (portais não se envelopam)', () => {
        render(
            <SarakScopeRoot mode="app">
                <ClasseDeEscopo />
            </SarakScopeRoot>,
        );
        expect(screen.getByTestId('classe')).toHaveTextContent('(vazia)');
    });

    it('Modo Embarcado: materializa o container `.sarak-scope` ao redor dos filhos', () => {
        render(
            <SarakScopeRoot mode="embedded">
                <p data-testid="filho">conteúdo</p>
            </SarakScopeRoot>,
        );
        const root = document.querySelector(`[data-sarak-scope-root="true"]`);
        expect(root).toHaveClass(SARAK_SCOPE_CLASS);
        expect(root).toContainElement(screen.getByTestId('filho'));
    });

    it('Modo Embarcado: publica a classe de escopo para os portais', () => {
        render(
            <SarakScopeRoot mode="embedded">
                <ClasseDeEscopo />
            </SarakScopeRoot>,
        );
        expect(screen.getByTestId('classe')).toHaveTextContent(SARAK_SCOPE_CLASS);
    });

    it('entrega o elemento do container por callback (e `null` no unmount)', () => {
        const onScopeElement = vi.fn();
        const { unmount } = render(
            <SarakScopeRoot mode="embedded" onScopeElement={onScopeElement}>
                <p>conteúdo</p>
            </SarakScopeRoot>,
        );
        const recebido = onScopeElement.mock.calls[0][0] as HTMLElement;
        expect(recebido).toHaveClass(SARAK_SCOPE_CLASS);

        unmount();
        expect(onScopeElement).toHaveBeenLastCalledWith(null);
    });
});
