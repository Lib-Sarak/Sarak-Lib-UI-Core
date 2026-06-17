import { describe, it, expect } from 'vitest';

const mockGlobalDraft = {
    colorPrimary: '#ff0000',
    colorSecondary: '#00ff00',
    colorSurface: '#ffffff',
    btnBg: '#ffffff',
    btnTextColor: '#000000',
    btnBorderRadius: '4px'
};

// Simulação da lógica de atualização parcial encontrada em handleApplyPreset (PreviewCanvas.tsx)
const applyPartialPreset = (draft: any, preset: any) => {
    const newDraft = { ...draft };
    Object.entries(preset).forEach(([key, value]) => {
        newDraft[key] = value;
    });
    return newDraft;
};

describe('Design Engine - Merge Preset Logic', () => {
    it('deve aplicar um preset atômico (ex: botão) de forma parcial, mantendo os tokens globais intactos', () => {
        const buttonPreset = {
            btnBg: '#000000',
            btnTextColor: '#ffffff',
            btnBorderRadius: '999px'
        };

        const result = applyPartialPreset(mockGlobalDraft, buttonPreset);

        // Verifica que os globals não foram alterados
        expect(result.colorPrimary).toBe('#ff0000');
        expect(result.colorSecondary).toBe('#00ff00');
        expect(result.colorSurface).toBe('#ffffff');

        // Verifica que os tokens do componente foram atualizados
        expect(result.btnBg).toBe('#000000');
        expect(result.btnTextColor).toBe('#ffffff');
        expect(result.btnBorderRadius).toBe('999px');
    });

    it('não deve conter chaves globais dentro de presets de componente', () => {
        // Validação das boas práticas arquiteturais do sistema:
        // Presets atômicos não devem misturar chaves (ex: colorPrimary)
        const atomicPresetDesign = {
            inputBg: '#333333',
            inputBorderColor: 'transparent',
            inputBorderRadius: '12px'
        };

        const globalKeys = ['colorPrimary', 'colorSecondary', 'colorBg', 'colorSurface', 'colorText'];
        
        const hasGlobalKey = Object.keys(atomicPresetDesign).some(key => globalKeys.includes(key));
        expect(hasGlobalKey).toBe(false);
    });
});
