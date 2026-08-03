/**
 * GATE DE PARIDADE DO BARRIL PÚBLICO (Spec 40.1 — L1; re-apontado na Spec 46 §3.1).
 *
 * Cobra que todo componente consumidor-facing (derivado por AST do código-fonte —
 * `scripts/publicComponents.mjs`) está EXPORTADO no barril público `src/index.ts` —
 * o componente E o seu tipo `<Nome>Props`.
 *
 * Duas camadas de verificação:
 *  - ESTÁTICA (AST, `gates/scripts/contrato/check-barrel-parity.mjs`): resolve a cadeia de `export *`
 *    e valida valores + tipos Props; é a mesma checagem que roda no `npm run build`
 *    (`npm run barrel:check`). Pega tipo Props não exportado.
 *  - RUNTIME (import real de `../index`): confirma que cada nome derivado é um export
 *    vivo de valor OU está numa exclusão declarada — bulletproof contra falha do
 *    coletor estático.
 *
 * Se falhar, NÃO afrouxe: exporte o símbolo em `src/index.ts` (componente + `Props`)
 * ou declare a exclusão com motivo em `gates/allowlists/barrelExclusions.mjs`.
 */

import { describe, expect, it } from 'vitest';
import * as PublicAPI from '../index';
import { runBarrelParityCheck } from '../../gates/scripts/contrato/check-barrel-parity.mjs';
import { collectPublicComponentNames } from '../../scripts/publicComponents.mjs';
import { BARREL_VALUE_EXCLUSIONS } from '../../gates/allowlists/barrelExclusions.mjs';

describe('Gate de Paridade de Barril Público — L1 (código-fonte → src/index.ts)', () => {
    const result = runBarrelParityCheck();

    it('todo componente consumidor-facing está exportado como valor (+Props) no barril', () => {
        expect(
            result.missingValues,
            `Componentes registrados SEM export no barril público: ${result.missingValues.join(', ')}. ` +
                `Exporte em src/index.ts ou declare em gates/allowlists/barrelExclusions.mjs com motivo.`,
        ).toEqual([]);
        expect(
            result.missingProps,
            `Tipos Props existentes mas NÃO exportados publicamente: ${result.missingProps.join(', ')}.`,
        ).toEqual([]);
    });

    it('nenhuma exclusão da allowlist é obsoleta', () => {
        expect(result.staleValueExclusions, `Exclusões de valor obsoletas: ${result.staleValueExclusions.join(', ')}`).toEqual([]);
        expect(result.stalePropsExclusions, `Exclusões de Props obsoletas: ${result.stalePropsExclusions.join(', ')}`).toEqual([]);
    });

    it('cross-check em runtime: todo nome derivado do código-fonte é um export vivo (valor) ou exclusão declarada', () => {
        const names = collectPublicComponentNames();
        const missing = names.filter(
            (name) => !(name in PublicAPI) && !(name in BARREL_VALUE_EXCLUSIONS),
        );
        expect(
            missing,
            `Nomes públicos ausentes do import real do barril em runtime: ${missing.join(', ')}.`,
        ).toEqual([]);
    });
});
