import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDesignVariables } from '../../core/Design/hooks/useDesignVariables';
import { sarakGetDefaultDesignState } from '../../core/Design/master-map';

/**
 * Peso dos títulos e do corpo e caixa dos títulos: o valor da opção é o próprio valor CSS e chega à propriedade
 * pela variável do token (`@sarak-token-reader … direto`, em `_elements.css`). Aqui, por opção: o motor emite o
 * valor na variável e a regra de elemento a lê. O efeito computado é de `browser-tests/`.
 */
const elements = fs.readFileSync(path.join(process.cwd(), 'src/styles/_elements.css'), 'utf-8');

const emitted = (id: string, value: string, variable: string): string | undefined =>
    renderHook(() => useDesignVariables({ ...sarakGetDefaultDesignState(), [id]: value })).result.current.variables[variable];

describe('o motor entrega o valor da opção, inteiro, na variável que o elemento lê', () => {
    it.each([
        ['h1Weight', '300'], ['h1Weight', '400'], ['h1Weight', '600'], ['h1Weight', '700'], ['h1Weight', '800'], ['h1Weight', '900'],
    ])('%s = %s → --sarak-h1-weight', (id, value) => {
        expect(emitted(id, value, '--sarak-h1-weight')).toBe(value);
    });

    it.each([
        ['h2Weight', '300'], ['h2Weight', '400'], ['h2Weight', '600'], ['h2Weight', '700'], ['h2Weight', '800'], ['h2Weight', '900'],
    ])('%s = %s → --sarak-h2-weight', (id, value) => {
        expect(emitted(id, value, '--sarak-h2-weight')).toBe(value);
    });

    it.each([
        ['bodyWeight', '300'], ['bodyWeight', '400'], ['bodyWeight', '500'],
    ])('%s = %s → --sarak-body-weight', (id, value) => {
        expect(emitted(id, value, '--sarak-body-weight')).toBe(value);
    });

    it.each([
        ['headingTransform', 'uppercase'], ['headingTransform', 'capitalize'], ['headingTransform', 'none'],
    ])('%s = %s → --sarak-h-transform', (id, value) => {
        expect(emitted(id, value, '--sarak-h-transform')).toBe(value);
    });
});

describe('a regra de elemento lê a variável (e a opção vale na propriedade, sem tabela)', () => {
    it.each([
        ['h1', '--sarak-h1-weight', 'font-weight'],
        ['h2', '--sarak-h2-weight', 'font-weight'],
        ['body', '--sarak-body-weight', 'font-weight'],
        ['h1', '--sarak-h-transform', 'text-transform'],
    ])('%s lê %s em %s', (_selector, variable, property) => {
        expect(elements).toMatch(new RegExp(`${property}:\\s*var\\(${variable}[,)]`));
    });
});
