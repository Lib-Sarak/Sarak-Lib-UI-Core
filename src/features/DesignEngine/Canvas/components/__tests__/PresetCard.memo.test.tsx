import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PresetCard } from '../PresetCard';
import type { SarakThemePreset } from '../../../../../core/Design/presets/themes';

/**
 * Um tema cuja `contraparte` conta as leituras. O `PresetCard` a lê uma vez na lista de dependências do
 * `useMemo` e, só quando o cálculo roda, mais uma dentro dele: a diferença entre as duas é o cálculo refeito.
 */
const countingTheme = (primaryColor = '#ff0000'): { theme: SarakThemePreset; reads: () => number } => {
    let reads = 0;
    const theme = { id: 'test', name: 'Test Theme', design: { primaryColor, surfaceColor: '#000000', mode: 'dark' } };
    Object.defineProperty(theme, 'contraparte', { get: () => { reads += 1; return undefined; }, enumerable: true });
    return { theme: theme as unknown as SarakThemePreset, reads: () => reads };
};

const READS_ON_FIRST_RENDER = 2;

describe('PresetCard — o tema resolvido é memorizado', () => {
    it('um novo render do painel com o mesmo tema e o mesmo modo não refaz o cálculo', () => {
        const { theme, reads } = countingTheme();
        const { rerender } = render(<PresetCard theme={theme} currentMode="dark" onApply={() => {}} />);
        expect(reads()).toBe(READS_ON_FIRST_RENDER);

        rerender(<PresetCard theme={theme} currentMode="dark" onApply={() => {}} />);
        // A miniatura é memorizada: com o mesmo tema e o mesmo modo ela nem renderiza de novo.
        expect(reads()).toBe(READS_ON_FIRST_RENDER);
    });

    it('trocar o modo refaz o cálculo', () => {
        const { theme, reads } = countingTheme();
        const { rerender } = render(<PresetCard theme={theme} currentMode="dark" onApply={() => {}} />);
        rerender(<PresetCard theme={theme} currentMode="light" onApply={() => {}} />);
        expect(reads()).toBe(READS_ON_FIRST_RENDER + READS_ON_FIRST_RENDER);
    });
});
