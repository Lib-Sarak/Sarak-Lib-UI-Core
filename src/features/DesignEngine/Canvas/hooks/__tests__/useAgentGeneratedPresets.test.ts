import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAgentGeneratedPresets } from '../useAgentGeneratedPresets';

describe('useAgentGeneratedPresets', () => {
    it('começa vazio', () => {
        const { result } = renderHook(() => useAgentGeneratedPresets());
        expect(result.current.themes).toEqual([]);
        expect(result.current.presetsByCategory).toEqual({});
    });

    it('addTheme insere um tema de sessão com id único e prefixado por agent-', () => {
        const { result } = renderHook(() => useAgentGeneratedPresets());

        act(() => {
            result.current.addTheme({ primaryColor: '#123456' }, 'Tema escuro');
        });

        expect(result.current.themes).toHaveLength(1);
        expect(result.current.themes[0]).toMatchObject({
            name: 'Tema escuro',
            design: { primaryColor: '#123456' },
        });
        expect(result.current.themes[0].id.startsWith('agent-theme-')).toBe(true);
    });

    it('addComponentPresets agrupa por categoria e preserva presets de categorias anteriores', () => {
        const { result } = renderHook(() => useAgentGeneratedPresets());

        act(() => {
            result.current.addComponentPresets([
                { category: 'buttons', design: { btnRadius: 12 } },
            ], 'Botões arredondados');
        });
        act(() => {
            result.current.addComponentPresets([
                { category: 'cards', design: { cardBorderRadius: 8 } },
            ], 'Cards suaves');
        });

        expect(result.current.presetsByCategory.buttons).toHaveLength(1);
        expect(result.current.presetsByCategory.cards).toHaveLength(1);
        expect(result.current.presetsByCategory.buttons[0].design).toEqual({ btnRadius: 12 });
    });

    it('clear reseta temas e presets de sessão', () => {
        const { result } = renderHook(() => useAgentGeneratedPresets());

        act(() => {
            result.current.addTheme({ primaryColor: '#fff' }, 'Tema claro');
            result.current.addComponentPresets([{ category: 'cards', design: {} }], 'Cards');
        });
        act(() => {
            result.current.clear();
        });

        expect(result.current.themes).toEqual([]);
        expect(result.current.presetsByCategory).toEqual({});
    });
});
