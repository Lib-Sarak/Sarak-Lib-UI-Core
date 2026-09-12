/**
 * A preferência do usuário nunca pode chegar à porta de persistência do
 * TEMA. Antes desta camada, o alternador de tema (`ShellThemeToggle`) e o
 * toggle de recolher do cromo (`ChromeCollapseToggle`, via
 * `useChromeDefaultWidgets`) gravavam direto no `design` do sistema
 * (`applyFullConfigRaw`/`applyConfig`) — e a persistência automática
 * (`useDesignManager.ts`, debounce de 1500ms) levava a mudança para
 * `persistence.onSave`: o clique de UM usuário reescrevia o tema de TODOS.
 *
 * Este teste falha SEM a camada de preferências (os dois cliques chegam a
 * `onSave`) e passa COM ela (a preferência fica separada, nunca gravada nela).
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SarakUIProvider from '../SarakUIProvider';
import { ShellThemeToggle } from '../../../components/atomic/Navigation/ShellThemeToggle';
import { SarakAppChrome } from '../../../components/Layout/SarakAppChrome';

describe('Preferências não vazam para a porta de persistência do tema', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
    });
    afterEach(() => vi.useRealTimers());

    it('acionar o alternador de tema não chama persistence.onSave', () => {
        const onSave = vi.fn();
        render(
            <SarakUIProvider options={{ persistence: { onSave } }}>
                <ShellThemeToggle variant="mini" />
            </SarakUIProvider>,
        );

        // O boot grava a semente 1,5s depois de montar, com ou sem clique nenhum
        // (`useDesignManager.ts`, persistência automática) — isola-se ANTES do
        // clique para que a asserção meça só o EFEITO do clique.
        act(() => {
            vi.advanceTimersByTime(1600);
        });
        onSave.mockClear();

        fireEvent.click(screen.getByRole('button'));
        act(() => {
            vi.advanceTimersByTime(1600); // > debounce de persistDesign (1500ms)
        });

        expect(onSave).not.toHaveBeenCalled();
    });

    it('acionar o toggle de recolher do cromo não chama persistence.onSave', () => {
        const onSave = vi.fn();
        render(
            <SarakUIProvider options={{ persistence: { onSave } }}>
                <SarakAppChrome>
                    <div>conteúdo</div>
                </SarakAppChrome>
            </SarakUIProvider>,
        );

        act(() => {
            vi.advanceTimersByTime(1600);
        });
        onSave.mockClear();

        fireEvent.click(screen.getByLabelText('Recolher navegação'));
        act(() => {
            vi.advanceTimersByTime(1600);
        });

        expect(onSave).not.toHaveBeenCalled();
    });
});
