// @vitest-environment node
// Teste do PRÓPRIO GATE (plan-53): um caso que ele PEGA (MAJOR emitido sem
// entrada ancorada em docs/migracoes.md) e um que ele DEIXA PASSAR (MAJOR
// ancorado, e qualquer minor/patch — a obrigação da 03 §5 é só sobre major).
import { describe, expect, it } from 'vitest';
import { checkMigrationAnchor } from '../check-migration-anchor.mjs';

const MIGRACOES = ['## 2.0.0 — algo quebrou', 'texto', '---', '## 1.0.0 — origem', 'texto'].join('\n');

describe('checkMigrationAnchor', () => {
    it('bloqueia um MAJOR sem entrada ancorada', () => {
        const r = checkMigrationAnchor({ version: '3.0.0', migracoesText: MIGRACOES });
        expect(r.applicable).toBe(true);
        expect(r.ok).toBe(false);
        expect(r.error).toContain('3.0.0');
    });

    it('libera um MAJOR com entrada ancorada', () => {
        const r = checkMigrationAnchor({ version: '2.0.0', migracoesText: MIGRACOES });
        expect(r).toMatchObject({ applicable: true, ok: true, major: 2 });
    });

    it('não se aplica a minor nem a patch', () => {
        expect(checkMigrationAnchor({ version: '2.1.0', migracoesText: MIGRACOES }).applicable).toBe(false);
        expect(checkMigrationAnchor({ version: '2.0.1', migracoesText: MIGRACOES }).applicable).toBe(false);
    });
});
