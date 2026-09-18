/**
 * Integra `SarakUIProvider` (core/) real — sem mockar `useDesignManager` — com
 * `useDesignDraft` (features/) real, por isso mora aqui e não em
 * `core/Provider/__tests__/` (mesmo motivo de `DuasPortasModoTema.test.tsx`:
 * `core/` não pode importar `features/`, R1, e o auditor de arquitetura não
 * isenta `__tests__/`).
 *
 * Prova as três portas de escrita que "enquanto o painel está aberto, editar o
 * rascunho não grava nem espalha nada" promete: `localStorage` (a mesma escrita
 * que dispara `storage` em outra aba — sem ela, não há o que espalhar),
 * `persistence.onSave` e `onThemeChange` (a porta do tema). Cada teste também
 * prova, no MESMO harness, que a porta dispara de verdade quando "Aplicar" é
 * chamado — sem isso, "não dispara enquanto edita" não provaria nada (podia só
 * estar desconectada).
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useDesignDraft } from '../useDesignDraft';

const Harness = () => {
    const sarak = useSarakUI();
    const { updateDraft, handleApplyToSystem } = useDesignDraft(sarak);
    return (
        <div>
            <button data-testid="btn-edit" onClick={() => updateDraft('primaryColor', '#654321')}>Editar</button>
            <button data-testid="btn-apply" onClick={() => handleApplyToSystem()}>Aplicar</button>
        </div>
    );
};

describe('Editar o rascunho não grava nem espalha — só "Aplicar" grava, pelas três portas', () => {
    // Cada teste monta um Provider novo, mas o `localStorage` do jsdom sobrevive
    // entre testes do mesmo arquivo — sem isto, o valor aplicado por um teste
    // "vaza" para o boot do próximo, e o rascunho nasce igual ao sistema (sem
    // divergência, `isDirty` falso, e "Aplicar" nem chega a gravar nada).
    beforeEach(() => {
        localStorage.clear();
    });

    // A gravação automática de `useDesignManager.ts:148-154` só dispara 1500ms
    // depois de `design` mudar — conferir "não chama" ANTES desse prazo passar
    // não prova nada: uma trava quebrada que gravasse o rascunho com atraso
    // passaria por baixo. Os três testes esperam além do prazo antes de olhar.
    //
    // Ela também dispara UMA VEZ ao montar (o próprio boot muda `design` de
    // "nada" para o valor semeado) — sem relação com o rascunho. Medido: sem
    // isolar essa gravação de boot, os três testes acusavam falso-positivo
    // ("chamou") mesmo sem nenhum clique em "Editar". Por isso cada teste espera
    // o boot assentar e LIMPA o espião antes de editar — só assim "não chama"
    // mede a EDIÇÃO, não o boot.
    const AUTO_PERSIST_DEBOUNCE_MS = 1500;
    const waitPastAutoPersistDebounce = async () => {
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, AUTO_PERSIST_DEBOUNCE_MS + 100));
        });
    };

    it('localStorage: nenhuma escrita enquanto edita — mesmo depois do prazo da gravação automática; "Aplicar" grava', async () => {
        render(
            <SarakUIProvider>
                <Harness />
            </SarakUIProvider>
        );

        // Deixa a gravação de BOOT (dispara uma vez ao montar, sem relação com o
        // rascunho) assentar, e limpa o espião — só depois disso "não chama" mede
        // o efeito da edição, não o boot.
        await waitPastAutoPersistDebounce();
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

        fireEvent.click(screen.getByTestId('btn-edit'));
        await waitPastAutoPersistDebounce();
        expect(setItemSpy).not.toHaveBeenCalled();

        fireEvent.click(screen.getByTestId('btn-apply'));
        expect(setItemSpy).toHaveBeenCalled();
        setItemSpy.mockRestore();
    });

    it('persistence.onSave: não chama enquanto edita — mesmo depois do prazo da gravação automática; "Aplicar" chama', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);

        render(
            <SarakUIProvider options={{ persistence: { onSave } }}>
                <Harness />
            </SarakUIProvider>
        );

        await waitPastAutoPersistDebounce();
        onSave.mockClear();

        fireEvent.click(screen.getByTestId('btn-edit'));
        await waitPastAutoPersistDebounce();
        expect(onSave).not.toHaveBeenCalled();

        await act(async () => {
            fireEvent.click(screen.getByTestId('btn-apply'));
        });
        expect(onSave).toHaveBeenCalled();
    });

    it('onThemeChange (a porta do tema): não chama enquanto edita — mesmo depois do prazo da gravação automática; "Aplicar" chama', async () => {
        const onThemeChange = vi.fn();

        render(
            <SarakUIProvider onThemeChange={onThemeChange}>
                <Harness />
            </SarakUIProvider>
        );

        await waitPastAutoPersistDebounce();
        onThemeChange.mockClear();

        fireEvent.click(screen.getByTestId('btn-edit'));
        await waitPastAutoPersistDebounce();
        expect(onThemeChange).not.toHaveBeenCalled();

        await act(async () => {
            fireEvent.click(screen.getByTestId('btn-apply'));
        });
        expect(onThemeChange).toHaveBeenCalled();
    });
});
