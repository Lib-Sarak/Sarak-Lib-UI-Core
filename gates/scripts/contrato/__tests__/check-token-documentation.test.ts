// @vitest-environment node
// Teste do PRÓPRIO GATE `token-docs:check`: casos plantados que ele PEGA (sem `usage`, sem `kind`, sem
// `modeDependent`, `usage` que repete o rótulo, `interactsWith` para id inexistente, exceção obsoleta) e os que
// ele DEIXA PASSAR (token completo, token em exceção), mais a mutação sobre o schema real: remover um `usage`
// ou um `kind` de um token documentado derruba o gate.
import { describe, expect, it } from 'vitest';
import { MASTER_DESIGN_MAP } from '../../../../src/core/Design/master-map';
import { buildReport, readPending } from '../check-token-documentation';
import {
    USAGE_MAX_LENGTH,
    buildDocumentationReport,
    type DocumentedTokenLike,
} from '../helpers/token-documentation-core';

const complete: DocumentedTokenLike = {
    id: 'cardBorderWidth',
    label: 'Espessura da Borda',
    kind: 'aesthetic',
    modeDependent: false,
    usage: 'Espessura do contorno de todo cartão; zero deixa só a sombra demarcar o cartão.',
};

const reasonsOf = (tokens: DocumentedTokenLike[], pending: Record<string, unknown> = {}): string[] =>
    buildDocumentationReport(tokens, pending).gaps.map((gap) => gap.reason);

describe('token-docs:check — casos plantados', () => {
    it('deixa passar o token completo', () => {
        expect(reasonsOf([complete])).toEqual([]);
    });

    it('pega a ausência de cada campo', () => {
        expect(reasonsOf([{ ...complete, usage: undefined }])).toContain('usage-missing');
        expect(reasonsOf([{ ...complete, kind: undefined }])).toContain('kind-missing');
        expect(reasonsOf([{ ...complete, modeDependent: undefined }])).toContain('mode-missing');
    });

    it('pega kind fora dos dois valores, usage curto, longo ou igual ao rótulo', () => {
        expect(reasonsOf([{ ...complete, kind: 'visual' }])).toContain('kind-invalid');
        expect(reasonsOf([{ ...complete, usage: 'Borda.' }])).toContain('usage-too-short');
        expect(reasonsOf([{ ...complete, usage: 'x'.repeat(USAGE_MAX_LENGTH + 1) }])).toContain('usage-too-long');
        expect(reasonsOf([{ ...complete, label: 'Espessura do contorno de todo cartão; zero deixa só a sombra demarcar o cartão.' }])).toContain(
            'usage-repeats-label',
        );
    });

    it('pega interactsWith para id inexistente, para o próprio token e fora de lista', () => {
        expect(reasonsOf([{ ...complete, interactsWith: ['naoExiste'] }])).toContain('interacts-unknown');
        expect(reasonsOf([{ ...complete, interactsWith: ['cardBorderWidth'] }])).toContain('interacts-unknown');
        expect(reasonsOf([{ ...complete, interactsWith: 'cardTextureType' }])).toContain('interacts-invalid');
    });

    it('aceita interactsWith para token que existe', () => {
        const other: DocumentedTokenLike = { ...complete, id: 'cardTextureType', interactsWith: undefined };
        expect(reasonsOf([{ ...complete, interactsWith: ['cardTextureType'] }, other])).toEqual([]);
    });

    it('deixa passar o token em exceção e acusa a exceção obsoleta', () => {
        const bare: DocumentedTokenLike = { id: 'tokenSemDoc', label: 'Sem doc' };
        const pending = { tokenSemDoc: 2 };
        expect(buildDocumentationReport([bare], pending).gaps).toEqual([]);
        expect(buildDocumentationReport([complete], { cardBorderWidth: 2 }).staleExceptions).toEqual(['cardBorderWidth']);
        expect(buildDocumentationReport([complete], { fantasma: 2 }).staleExceptions).toEqual(['fantasma']);
    });
});

describe('token-docs:check — o schema real', () => {
    const tokens = MASTER_DESIGN_MAP.components.flatMap((component) => component.tokens);

    it('o repositório passa: nenhuma lacuna e nenhuma exceção obsoleta', () => {
        const report = buildReport();
        expect(report.gaps).toEqual([]);
        expect(report.staleExceptions).toEqual([]);
    });

    it('a lista de exceção só tem token que existe e ainda não está documentado', () => {
        const ids = new Set(tokens.map((token) => token.id));
        for (const id of Object.keys(readPending())) expect(ids.has(id)).toBe(true);
    });

    it('MUTAÇÃO: remover o usage de um token documentado derruba o gate', () => {
        const documented = tokens.find((token) => token.usage !== undefined && !(token.id in readPending()));
        expect(documented).toBeDefined();
        const mutated = tokens.map((token) => (token.id === documented!.id ? { ...token, usage: undefined } : token));
        const report = buildDocumentationReport(mutated, readPending());
        expect(report.gaps.map((gap) => gap.tokenId)).toContain(documented!.id);
    });

    it('MUTAÇÃO: remover o kind de um token documentado derruba o gate', () => {
        const documented = tokens.find((token) => token.kind !== undefined && !(token.id in readPending()));
        expect(documented).toBeDefined();
        const mutated = tokens.map((token) => (token.id === documented!.id ? { ...token, kind: undefined } : token));
        const report = buildDocumentationReport(mutated, readPending());
        expect(report.gaps.map((gap) => `${gap.tokenId}:${gap.reason}`)).toContain(`${documented!.id}:kind-missing`);
    });
});
