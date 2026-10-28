import { describe, expect, it } from 'vitest';
import {
    areSarakDatePresetValuesAllowed,
    findNextEnabledSarakDate,
    isDateWithinSarakBounds,
    parseSarakDateInput,
    parseSarakDatePickerInput,
    resolveSarakDatePreset,
} from '../datePresets';

const REFERENCE_DATE = new Date(2025, 2, 12, 15, 30);

describe('atalhos de período do SarakDatePicker', () => {
    it('resolve os atalhos de dia e de intervalo', () => {
        expect(resolveSarakDatePreset('today', REFERENCE_DATE)).toBe('2025-03-12');
        expect(resolveSarakDatePreset('yesterday', REFERENCE_DATE)).toBe('2025-03-11');
        expect(resolveSarakDatePreset('last7Days', REFERENCE_DATE)).toEqual(['2025-03-06', '2025-03-12']);
        expect(resolveSarakDatePreset('last30Days', REFERENCE_DATE)).toEqual(['2025-02-11', '2025-03-12']);
    });

    it('resolve mês, trimestre e ano com limites de calendário', () => {
        expect(resolveSarakDatePreset('thisMonth', REFERENCE_DATE)).toEqual(['2025-03-01', '2025-03-12']);
        expect(resolveSarakDatePreset('lastMonth', REFERENCE_DATE)).toEqual(['2025-02-01', '2025-02-28']);
        expect(resolveSarakDatePreset('thisQuarter', REFERENCE_DATE)).toEqual(['2025-01-01', '2025-03-12']);
        expect(resolveSarakDatePreset('thisYear', REFERENCE_DATE)).toEqual(['2025-01-01', '2025-03-12']);
    });

    it('valida texto digitado, limites e a busca pelo próximo dia disponível', () => {
        expect(parseSarakDateInput('12/03/2025', 'dd/MM/yyyy')).toEqual(new Date(2025, 2, 12));
        expect(parseSarakDateInput('31/02/2025', 'dd/MM/yyyy')).toBeNull();
        expect(isDateWithinSarakBounds(new Date(2025, 2, 12), '2025-03-01', '2025-03-31')).toBe(true);
        expect(isDateWithinSarakBounds(new Date(2025, 2, 12), '2025-03-13')).toBe(false);
        expect(findNextEnabledSarakDate(new Date(2025, 2, 12), 1, 3, (date) => date.getDate() < 15))
            .toEqual(new Date(2025, 2, 15));
    });
});

describe('entrada e restrições do SarakDatePicker', () => {
    it('interpreta intervalos digitados e rejeita data fora do limite ou desabilitada', () => {
        expect(parseSarakDatePickerInput(
            '10/03/2025 - 12/03/2025', {
                mode: 'range', rangeSeparator: ' - ', displayFormat: 'dd/MM/yyyy', min: '2025-03-01', max: '2025-03-31',
            },
        )).toEqual(['2025-03-10', '2025-03-12']);
        expect(parseSarakDatePickerInput(
            '10/03/2025 - 12/03/2025', {
                mode: 'range', rangeSeparator: ' - ', displayFormat: 'dd/MM/yyyy', min: '2025-03-11',
            },
        )).toBeNull();
        expect(parseSarakDatePickerInput(
            '10/03/2025', {
                mode: 'single', rangeSeparator: ' - ', displayFormat: 'dd/MM/yyyy',
                isDateDisabled: (iso) => iso === '2025-03-10',
            },
        )).toBeNull();
    });

    it('aceita atalhos dentro dos limites e rejeita atalhos com datas desabilitadas', () => {
        expect(areSarakDatePresetValuesAllowed(['2025-03-10', '2025-03-12'], '2025-03-01', '2025-03-31')).toBe(true);
        expect(areSarakDatePresetValuesAllowed('2025-03-12', undefined, undefined, (iso) => iso === '2025-03-12')).toBe(false);
    });
});
