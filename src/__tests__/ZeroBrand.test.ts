/**
 * GATE ZERO-MARCA (Spec 49 — L2).
 *
 * A lib NUNCA estampa a própria marca ('Sarak Lib'/'Sarak OS'/'Sarak AI') como TEXTO
 * de saída em componente consumidor-facing. Mesma checagem AST que roda no
 * `npm run build` (`npm run zero-brand:check`, `scripts/check-zero-brand.mjs`).
 *
 * Se falhar, NÃO afrouxe a allowlist: neutralize a string (marca/`systemName` do
 * consumidor, senão um rótulo genérico de função) ou, se for legitimamente um painel
 * INTERNO do Design Engine (ferramenta de autoria da própria lib), declare a exclusão
 * com motivo em `scripts/check-zero-brand.mjs` (ALLOWLIST).
 */

import { describe, expect, it } from 'vitest';
import { runZeroBrandCheck } from '../../gates/scripts/contrato/check-zero-brand.mjs';

describe('Gate Zero-Marca — L2 (nenhum "Sarak Lib"/"Sarak OS"/"Sarak AI" renderizado fora da allowlist)', () => {
    const result = runZeroBrandCheck();

    it('nenhum componente consumidor-facing renderiza a marca da lib como texto', () => {
        expect(
            result.violations,
            `Marca da lib renderizada fora da allowlist: ${result.violations
                .map((v) => `${v.file}:${v.line} ("${v.literal}")`)
                .join(', ')}`,
        ).toEqual([]);
    });

    it('nenhuma entrada da allowlist é obsoleta', () => {
        expect(result.staleAllowlist, `Entradas obsoletas: ${result.staleAllowlist.join(', ')}`).toEqual([]);
    });
});
