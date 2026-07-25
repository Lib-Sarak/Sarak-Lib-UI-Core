/**
 * GATE DE PARIDADE DO BARRIL PÚBLICO (Spec 40.1 — L1).
 *
 * Contraparte INVERSA do `RegistryParity.test.tsx`. Enquanto aquele cobra que todo
 * export público é alcançável via manifesto, ESTE cobra que todo componente
 * consumidor-facing (registrado em `NATIVE_COMPONENTS`) está EXPORTADO no barril
 * público `src/index.ts` — o componente E o seu tipo `<Nome>Props`.
 *
 * Duas camadas de verificação:
 *  - ESTÁTICA (AST, `scripts/check-barrel-parity.mjs`): resolve a cadeia de `export *`
 *    e valida valores + tipos Props; é a mesma checagem que roda no `npm run build`
 *    (`npm run barrel:check`). Pega tipo Props não exportado (o motor de manifesto não vê).
 *  - RUNTIME (import real de `../../../index`): confirma que cada chave registrada é um
 *    export vivo de valor — bulletproof contra falha do coletor estático.
 *
 * Se falhar, NÃO afrouxe: exporte o símbolo em `src/index.ts` (componente + `Props`)
 * ou declare a exclusão com motivo em `scripts/barrelExclusions.mjs`.
 */

import { describe, expect, it } from 'vitest';
import * as PublicAPI from '../../../index';
import { NATIVE_COMPONENTS } from '../Registry/nativeComponents';
import { runBarrelParityCheck } from '../../../../scripts/check-barrel-parity.mjs';
import { BARREL_VALUE_EXCLUSIONS } from '../../../../scripts/barrelExclusions.mjs';

describe('Gate de Paridade de Barril Público — L1 (Registry → src/index.ts)', () => {
    const result = runBarrelParityCheck();

    it('todo componente consumidor-facing está exportado como valor (+Props) no barril', () => {
        expect(
            result.missingValues,
            `Componentes registrados SEM export no barril público: ${result.missingValues.join(', ')}. ` +
                `Exporte em src/index.ts ou declare em scripts/barrelExclusions.mjs com motivo.`,
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

    it('cross-check em runtime: toda chave registrada é um export vivo (valor)', () => {
        const missing = Object.keys(NATIVE_COMPONENTS).filter(
            (key) => !(key in PublicAPI) && !(key in BARREL_VALUE_EXCLUSIONS),
        );
        expect(
            missing,
            `Chaves de NATIVE_COMPONENTS ausentes do import público em runtime: ${missing.join(', ')}.`,
        ).toEqual([]);
    });
});
