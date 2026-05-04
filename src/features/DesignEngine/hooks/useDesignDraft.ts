import { useState, useEffect } from 'react';
import { PRESETS_LIBRARY } from '../../../core/Design/presets';

export const useDesignDraft = (sarak: any) => {
    // Sincronização Unidirecional (v12.0)
    // Inicializamos o rascunho com o estado atual, mas evitamos resets reativos.
    const [draft, setDraft] = useState<any>(() => ({
        ...sarak,
        // Fallbacks para garantir que o rascunho nunca seja indefinido
        layout: sarak.layout || 'glass',
        mode: sarak.mode || 'dark',
        borderRadius: sarak.borderRadius || { sm: 12, md: 24, lg: 40 },
        layoutGap: sarak.layoutGap || { sm: 12, md: 24, lg: 40 },
        cardPadding: sarak.cardPadding || { sm: 16, md: 32, lg: 48 },
    }));

    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    // 2. Sincronização de Re-hidratação Inteligente (v10.3)
    useEffect(() => {
        if (!isDirty && sarak) {
            setDraft((prev: any) => ({
                ...prev,
                ...sarak
            }));
        }
    }, [sarak, isDirty]);

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const updateDraft = (key: string, value: any) => {
        setIsDirty(true);
        setDraft((prev: any) => {
            if (prev[key as keyof typeof prev] === value) return prev;

            const newDraft = { 
                ...prev, 
                [key]: value
            };

            // Se a mudança não for estrutural, marcamos como custom
            const structuralKeys = ['layout', 'mode', 'systemName', 'logoUrl', 'logoDarkUrl'];
            if (!structuralKeys.includes(key)) {
                newDraft.layout = 'custom';
            }

            return newDraft;
        });
    };

    /**
     * Aplica um patch granular ao rascunho (v12.0)
     * Permite aplicar múltiplos tokens de uma vez (presets atômicos)
     */
    const applyPatch = (patch: Record<string, any>, sourceId?: string) => {
        setIsDirty(true);
        setDraft((prev: any) => {
            const newDraft = { ...prev, ...patch };
            
            if (sourceId) {
                newDraft.layout = sourceId;
            } else {
                newDraft.layout = 'custom';
            }

            return newDraft;
        });
    };

    const handleThemePreview = (id: string) => {
        const theme = PRESETS_LIBRARY.layouts?.find((t: any) => t.id === id);
        if (theme && theme.tokens) {
            applyPatch(theme.tokens, id);
        }
    };

    const handleApplyToSystem = () => {
        if (sarak.applyFullConfig) {
            sarak.applyFullConfig(draft);
            showToast('success', 'Design aplicado com sucesso a todo o sistema.');
        }
    };

    return {
        draft,
        updateDraft,
        applyPatch,
        handleThemePreview,
        handleApplyToSystem,
        toast,
        showToast
    };
};

