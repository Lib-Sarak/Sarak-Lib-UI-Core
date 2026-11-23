// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { collect, findOrphanKeys } from '../verify_presets.ts';
import { ALL_COMPONENT_PRESETS, PRESET_GROUPS } from '../../../../src/core/Design/presets/components/registry.ts';
import { TABLE_PRESETS } from '../../../../src/core/Design/presets/components/dataPresets.ts';
import { SARAK_ALL_THEMES } from '../../../../src/core/Design/presets/themes/all.ts';
import { PAYLOAD_EXTRA_KEYS } from '../../../../src/core/Provider/payloadExtraKeys.ts';

// Teste do PRÓPRIO GATE (R5). Trava a MECÂNICA de `findOrphanKeys` — não o
// número de temas/presets embarcados, que é baseline e muda a cada lote da
// recalibração do catálogo.

describe('findOrphanKeys', () => {
    const scaffold = { colorPrimary: '#000', borderRadius: 8 };

    it('não acusa chave presente no gabarito visual', () => {
        expect(findOrphanKeys({ colorPrimary: '#fff' }, scaffold)).toEqual([]);
    });

    it('não acusa chave de payload legítima fora do gabarito (enabledLanguages)', () => {
        expect(findOrphanKeys({ enabledLanguages: ['pt', 'en'] }, scaffold)).toEqual([]);
    });

    it('não acusa NENHUMA chave de PAYLOAD_EXTRA_KEYS — a lista inteira é conhecida', () => {
        const design = Object.fromEntries(PAYLOAD_EXTRA_KEYS.map((key) => [key, 'valor-qualquer']));
        expect(findOrphanKeys(design, scaffold)).toEqual([]);
    });

    it('acusa chave que não é nem do gabarito nem de PAYLOAD_EXTRA_KEYS — uma órfã de verdade continua reprovando', () => {
        expect(findOrphanKeys({ totallyMadeUpTokenThatDoesNotExist: 1 }, scaffold)).toEqual([
            'totallyMadeUpTokenThatDoesNotExist',
        ]);
    });

    it('mistura: só a chave de verdade órfã volta, o resto (gabarito + extra) some da lista', () => {
        const design = {
            colorPrimary: '#fff',
            enabledLanguages: ['pt'],
            totallyMadeUpTokenThatDoesNotExist: 1,
        };
        expect(findOrphanKeys(design, scaffold)).toEqual(['totallyMadeUpTokenThatDoesNotExist']);
    });
});

// A lista do que se audita vem dos grupos de `registry.ts`, não de arquivos de preset
// enumerados à mão: os grupos novos (barra, forma, tabela, movimento…) ficavam de fora.
describe('collect — cobre todo grupo do registro de presets', () => {
    it('todo preset de PRESET_GROUPS entra na auditoria, uma vez só', () => {
        const ids = collect().map((item) => item.id);
        const presetIds = PRESET_GROUPS.flatMap((group) => group.presets.map((preset) => preset.id));
        const missing = [...new Set(presetIds)].filter((id) => !ids.includes(id));
        expect(missing).toEqual([]);
        expect(ids.length - SARAK_ALL_THEMES.length).toBe(ALL_COMPONENT_PRESETS.length);
    });

    it('o rótulo diz de que grupo o preset veio', () => {
        const table = collect().find((item) => item.id === TABLE_PRESETS[0].id);
        expect(table?.label).toContain('tables');
    });
});
