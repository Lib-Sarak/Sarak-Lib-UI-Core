// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { findOrphanKeys } from '../verify_presets.ts';
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
