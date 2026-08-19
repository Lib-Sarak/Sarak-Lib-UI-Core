// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { EngineeringSchema } from '../../core/Design/schema/engineering';

/**
 * plan-08 F4 (achado 10) — `focusRingWidth` era token de acessibilidade sem emissor:
 * o schema publicava `--sarak-focus-width` e a regra global de foco chumbava
 * `outline: 2px`, então nenhum tema conseguia mexer no anel dos botões.
 *
 * Este teste cobra o outro lado do contrato: se o token existe nas 3 fontes, tem de
 * existir CSS que o leia. Só o `SarakLink` o honrava — o auditor de hardcode não
 * enxerga `.css`, então a suíte é quem cobra.
 */
describe('Anel de foco governado por token (F4)', () => {
    const utilities = fs.readFileSync(
        path.join(process.cwd(), 'src/styles/_utilities.css'),
        'utf-8'
    );
    const focusVar = EngineeringSchema.tokens.find((t) => t.id === 'focusRingWidth');

    it('o token focusRingWidth continua emitindo --sarak-focus-width', () => {
        expect(focusVar?.cssVars).toContain('--sarak-focus-width');
    });

    it('a regra global de foco lê o token, com o default do schema como fallback', () => {
        expect(utilities).toMatch(/button:focus-visible\s*\{[^}]*outline:\s*var\(--sarak-focus-width,\s*2px\)/);
        expect(focusVar?.defaultValue).toBe(2);
    });

    it('nenhuma regra de foco em _utilities.css chumba a largura do outline', () => {
        const outlines = utilities.match(/outline:\s*[^;]+;/g) ?? [];
        const chumbadas = outlines.filter((regra) => /outline:\s*\d/.test(regra));
        expect(chumbadas).toEqual([]);
    });
});
