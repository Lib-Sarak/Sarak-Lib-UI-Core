import { useState } from 'react';

/**
 * Estado de UI da "Persistência" do Design Engine (Spec 44 — sem backend
 * próprio): não há mais tema com ID/origem de banco de dados — "salvar" É
 * exportar um JSON (ver `useThemePersistenceHandlers`/`exportTheme.ts`). Este
 * hook guarda só o necessário para o modal de exportação.
 */
export function usePersistenceState() {
    const [state, setState] = useState({
        currentThemeName: '',
        isSaveModalOpen: false,
        isSaving: false
    });

    const updateState = (updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    return {
        currentThemeName: state.currentThemeName,
        setCurrentThemeName: (v: string) => updateState({ currentThemeName: v }),
        isSaveModalOpen: state.isSaveModalOpen,
        setIsSaveModalOpen: (v: boolean) => updateState({ isSaveModalOpen: v }),
        isSaving: state.isSaving,
        setIsSaving: (v: boolean) => updateState({ isSaving: v })
    };
}
