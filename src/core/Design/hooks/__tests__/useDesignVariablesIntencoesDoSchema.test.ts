import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDesignVariables } from '../useDesignVariables';
import { sarakGetDefaultDesignState } from '../../master-map';
import { validateDesign } from '../../../Provider/utils/validation';

/**
 * As intenções que os temas declaravam e a validação cortava em silêncio chegam ao CSS: "desligado" (duração 0),
 * a unidade do espaçamento do nome da marca (px) e a faixa que o painel e a validação compartilham. O navegador
 * confirma o computado; aqui se prova o que o motor ESCREVE depois da validação.
 */
const emitted = (overrides: Record<string, unknown>) => {
    const validated = validateDesign({ ...sarakGetDefaultDesignState(), ...overrides }) as unknown as Record<string, unknown>;
    return renderHook(() => useDesignVariables({ ...sarakGetDefaultDesignState(), ...validated })).result.current.variables;
};

describe('intenções do schema que chegam à tela', () => {
    it('duração 0 é "desligado": a validação não a corta para o mínimo antigo e o motor escreve 0s', () => {
        const variables = emitted({ motionDurationFast: 0, motionDurationNormal: 0, motionDurationSlow: 0 });
        expect(variables['--sarak-motion-dur-fast']).toBe('0s');
        expect(variables['--sarak-motion-dur-normal']).toBe('0s');
        expect(variables['--sarak-motion-dur-slow']).toBe('0s');
    });

    it('duração menor que o mínimo antigo do "lento" (0,35 s) vale como declarada', () => {
        expect(emitted({ motionDurationSlow: 0.35 })['--sarak-motion-dur-slow']).toBe('0.35s');
    });

    it('o espaçamento do nome da marca é em pixels e o valor de tema (4) chega inteiro', () => {
        expect(emitted({ identityTracking: 4 })['--sarak-identity-tracking']).toBe('4px');
    });

    it('um valor acima do máximo continua sendo cortado pela validação (e é o que o gate acusa)', () => {
        expect(emitted({ identityTracking: 40 })['--sarak-identity-tracking']).toBe('8px');
    });
});
