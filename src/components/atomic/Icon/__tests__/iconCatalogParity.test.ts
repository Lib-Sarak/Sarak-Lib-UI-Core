import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ICON_NAMES } from '../iconNames';

/**
 * Gate de paridade nome↔catálogo (Spec 41 §2.3 / §4).
 *
 * O ícone era a exceção não documentada da "regra dura de tokens": todo valor
 * que o consumidor escreve tem que estar no catálogo gerado. Este teste é a
 * versão em suíte do `npm run catalog:check` — pega a defasagem já no vitest,
 * sem depender de alguém rodar o build.
 */
describe('Paridade nomes de ícone ↔ catálogo gerado', () => {
    const catalogo = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'docs/component-catalog.json'), 'utf-8')
    ) as { tokens: { iconNames: string[] } };

    it('o catálogo publica exatamente os nomes de ICON_NAMES, na mesma ordem', () => {
        expect(catalogo.tokens.iconNames).toEqual([...ICON_NAMES]);
    });

    it('o catálogo não publica nome de ícone vazio ou repetido', () => {
        const nomes = catalogo.tokens.iconNames;
        expect(nomes.every((nome) => nome.length > 0)).toBe(true);
        expect(new Set(nomes).size).toBe(nomes.length);
    });
});
