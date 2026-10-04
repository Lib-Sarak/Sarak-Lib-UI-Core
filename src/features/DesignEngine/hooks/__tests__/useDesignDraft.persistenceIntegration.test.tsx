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
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useDesignDraft } from '../useDesignDraft';

const Harness = (): React.ReactElement => {
    const sarak = useSarakUI();
    const { updateDraft, handleThemePreview, handleApplyToSystem } = useDesignDraft(sarak);
    return (
        <div>
            <button data-testid="btn-edit" onClick={() => updateDraft('primaryColor', '#654321')}>Editar</button>
            <button data-testid="btn-preview-theme" onClick={() => handleThemePreview({ primaryColor: '#123456' }, undefined, 'tema-aplicado')}>Preview tema</button>
            <button data-testid="btn-apply" onClick={() => handleApplyToSystem()}>Aplicar</button>
        </div>
    );
};

const AUTO_PERSIST_DEBOUNCE_MS = 1500;
const DESIGN_STORAGE_KEY = 'sarak-theme-design-persistence-integration';

/**
 * A persistência automática só roda 1500 ms após `design` mudar; afirmar que
 * não chamou antes do prazo não detecta uma gravação atrasada. Timers falsos
 * avançam além do limite sem esperar pelo relógio real.
 */
const advancePastAutoPersistDebounce = async (): Promise<void> => {
    await act(() => vi.advanceTimersByTimeAsync(AUTO_PERSIST_DEBOUNCE_MS + 1));
};

const verifyLocalStoragePort = async (): Promise<void> => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    render(
        <SarakUIProvider options={{ persistence: { storageKey: DESIGN_STORAGE_KEY } }}>
            <Harness />
        </SarakUIProvider>
    );

    const hasDesignStorageWrite = (): boolean =>
        setItemSpy.mock.calls.some(([key]) => key === DESIGN_STORAGE_KEY);

    await advancePastAutoPersistDebounce();
    expect(hasDesignStorageWrite()).toBe(false);

    fireEvent.click(screen.getByTestId('btn-edit'));
    await advancePastAutoPersistDebounce();
    expect(hasDesignStorageWrite()).toBe(false);

    fireEvent.click(screen.getByTestId('btn-apply'));
    expect(hasDesignStorageWrite()).toBe(true);
    setItemSpy.mockRestore();
};

const verifyPersistenceOnSavePort = async (): Promise<void> => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
        <SarakUIProvider options={{ persistence: { onSave } }}>
            <Harness />
        </SarakUIProvider>
    );

    await advancePastAutoPersistDebounce();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('btn-edit'));
    await advancePastAutoPersistDebounce();
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
        fireEvent.click(screen.getByTestId('btn-apply'));
    });
    expect(onSave).toHaveBeenCalled();
};

const verifyThemeChangePort = async (): Promise<void> => {
    const onThemeChange = vi.fn();

    render(
        <SarakUIProvider onThemeChange={onThemeChange}>
            <Harness />
        </SarakUIProvider>
    );

    await advancePastAutoPersistDebounce();
    expect(onThemeChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('btn-edit'));
    await advancePastAutoPersistDebounce();
    expect(onThemeChange).not.toHaveBeenCalled();

    await act(async () => {
        fireEvent.click(screen.getByTestId('btn-apply'));
    });
    expect(onThemeChange).toHaveBeenCalled();
};

describe('Editar o rascunho não grava nem espalha — só "Aplicar" grava, pelas três portas', () => {
    // O jsdom preserva `localStorage`; sem limpar, o valor aplicado vaza para o
    // boot seguinte, iguala rascunho e sistema (`isDirty` falso) e "Aplicar" não grava.
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('localStorage: nenhuma escrita enquanto edita — mesmo depois do prazo da gravação automática; "Aplicar" grava', verifyLocalStoragePort);
    it('persistence.onSave: não chama enquanto edita — mesmo depois do prazo da gravação automática; "Aplicar" chama', verifyPersistenceOnSavePort);
    it('onThemeChange (a porta do tema): não chama enquanto edita — mesmo depois do prazo da gravação automática; "Aplicar" chama', verifyThemeChangePort);

    it('aplicar um tema persiste o design e o id novo já na primeira chamada de onSave', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);
        const customThemes = [{ id: 'tema-aplicado', name: 'Tema Aplicado', design: { primaryColor: '#123456' } }];

        render(
            <SarakUIProvider customThemes={customThemes} options={{ persistence: { onSave } }}>
                <Harness />
            </SarakUIProvider>,
        );

        await advancePastAutoPersistDebounce();
        expect(onSave).not.toHaveBeenCalled();

        act(() => {
            fireEvent.click(screen.getByTestId('btn-preview-theme'));
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('btn-apply'));
        });

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ primaryColor: '#123456' }),
            'tema-aplicado',
        );
    });
});
