// @vitest-environment node
// Sem configuração, tailwind-merge não reconhece as utilitárias PRÓPRIAS desta base
// (não geradas pelo Tailwind puro) — a classe do chamador passaria a COEXISTIR com a
// do átomo, em vez de vencê-la. Este teste prova, para cada uma das quatro, que a
// classe do chamador SUBSTITUI a do átomo (e não sobra nenhuma delas junto), mais o
// contrato geral de "a última entrada vence".
import { describe, it, expect } from 'vitest';
import { mergeSarakClasses } from '../mergeSarakClasses';

describe('mergeSarakClasses', () => {
    it('text-2xs (átomo) × text-lg (chamador) — o chamador substitui, não coexiste', () => {
        const result = mergeSarakClasses('text-2xs', 'text-lg');
        expect(result).toBe('text-lg');
    });

    it('text-3xs (átomo) × text-sm (chamador) — o chamador substitui, não coexiste', () => {
        const result = mergeSarakClasses('text-3xs', 'text-sm');
        expect(result).toBe('text-sm');
    });

    it('rounded-btn (átomo) × rounded-full (chamador) — o chamador substitui, não coexiste', () => {
        const result = mergeSarakClasses('rounded-btn', 'rounded-full');
        expect(result).toBe('rounded-full');
    });

    it('font-tab (átomo) × font-sarak-body (chamador) — o chamador substitui, não coexiste', () => {
        const result = mergeSarakClasses('font-tab', 'font-sarak-body');
        expect(result).toBe('font-sarak-body');
    });

    it('contrato geral: a ÚLTIMA entrada vence quando duas escrevem a mesma propriedade', () => {
        expect(mergeSarakClasses('uppercase', 'normal-case')).toBe('normal-case');
        expect(mergeSarakClasses('tracking-widest', 'tracking-normal')).toBe('tracking-normal');
    });

    it('classes que não conflitam sobrevivem as duas', () => {
        const result = mergeSarakClasses('flex items-center', 'gap-2');
        expect(result.split(' ').sort()).toEqual(['flex', 'gap-2', 'items-center'].sort());
    });

    it('ignora entradas falsy (undefined, null, false, string vazia)', () => {
        expect(mergeSarakClasses('flex', undefined, '', false, null, 'gap-2')).toBe('flex gap-2');
    });
});
