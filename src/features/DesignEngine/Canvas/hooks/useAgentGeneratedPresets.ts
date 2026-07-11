import { useCallback, useRef, useState } from 'react';
import { DesignAgentComponentPreset, SarakDesignState } from '../../../../core/Provider/types';

/** Mesmo shape de `ComponentPreset` (core/Design/presets/components/cards.ts) e `ThemePreset`
 * (core/Design/presets/themes) — só com `id` livre (os catálogos estáticos usam uniões
 * fechadas de id que uma sugestão do agente não pertence). */
export interface AgentPresetEntry {
    id: string;
    name: string;
    description: string;
    design: Partial<SarakDesignState>;
}

export interface UseAgentGeneratedPresetsResult {
    /** Temas completos sugeridos pelo agente nesta sessão (Preset 2, aba "Globais"). */
    themes: AgentPresetEntry[];
    /** Presets por componente sugeridos nesta sessão, indexados por categoria (cards/buttons/...). */
    presetsByCategory: Record<string, AgentPresetEntry[]>;
    addTheme: (design: Partial<SarakDesignState>, label: string) => void;
    addComponentPresets: (presets: DesignAgentComponentPreset[], label: string) => void;
    clear: () => void;
}

/**
 * Estado só-de-sessão (nunca persistido) das sugestões do Design Agent. Reseta ao
 * desmontar/recarregar — salvar de verdade continua sendo decisão do usuário via
 * `SaveThemeModal` (fluxo humano convencional).
 */
export const useAgentGeneratedPresets = (): UseAgentGeneratedPresetsResult => {
    const counterRef = useRef(0);
    const [themes, setThemes] = useState<AgentPresetEntry[]>([]);
    const [presetsByCategory, setPresetsByCategory] = useState<Record<string, AgentPresetEntry[]>>({});

    const addTheme = useCallback((design: Partial<SarakDesignState>, label: string) => {
        counterRef.current += 1;
        const entry: AgentPresetEntry = {
            id: `agent-theme-${counterRef.current}`,
            name: label,
            description: 'Gerado pela IA a partir das suas referências.',
            design,
        };
        setThemes(prev => [entry, ...prev]);
    }, []);

    const addComponentPresets = useCallback((presets: DesignAgentComponentPreset[], label: string) => {
        counterRef.current += 1;
        const suffix = counterRef.current;
        setPresetsByCategory(prev => {
            const next = { ...prev };
            presets.forEach((preset, i) => {
                const entry: AgentPresetEntry = {
                    id: `agent-${preset.category}-${suffix}-${i}`,
                    name: label,
                    description: 'Gerado pela IA a partir das suas referências.',
                    design: preset.design,
                };
                next[preset.category] = [entry, ...(next[preset.category] || [])];
            });
            return next;
        });
    }, []);

    const clear = useCallback(() => {
        setThemes([]);
        setPresetsByCategory({});
    }, []);

    return { themes, presetsByCategory, addTheme, addComponentPresets, clear };
};
