// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { extractMigrationNotes, splitEntries } from '../migrationNotes.mjs';

const FIXTURE = [
    '# Migrações',
    '',
    'Prosa introdutória, não é entrada.',
    '',
    '---',
    '',
    '## Entrada nova (plan-9)',
    '',
    'Corpo da entrada nova.',
    '',
    '---',
    '',
    '## 3.0.0 — quebra grande',
    '',
    'Corpo da 3.0.0.',
    '',
    '---',
    '',
    '## Entrada entre 2 e 3 (plan-5)',
    '',
    'Corpo do meio.',
    '',
    '---',
    '',
    '## 2.0.0 — a limpeza',
    '',
    'Corpo da 2.0.0.',
    '',
    '---',
    '',
].join('\n');

describe('splitEntries — cada bloco "## título" até o separador', () => {
    it('ignora a prosa introdutória e devolve só entradas "## "', () => {
        const entries = splitEntries(FIXTURE);
        expect(entries).toHaveLength(4);
        expect(entries[0]).toContain('Entrada nova (plan-9)');
        expect(entries[3]).toContain('2.0.0 — a limpeza');
    });
});

describe('splitEntries — CRLF (achado real: docs/migracoes.md pode estar em CRLF no checkout)', () => {
    it('mesmo texto em CRLF produz as MESMAS entradas que em LF', () => {
        expect(splitEntries(FIXTURE.replace(/\n/g, '\r\n'))).toEqual(splitEntries(FIXTURE));
    });
});

describe('extractMigrationNotes — o corte "entre a instalada e a mais nova" (plan-10)', () => {
    it('acha a âncora da versão instalada (major=3) e devolve só o que veio DEPOIS dela', () => {
        const { bounded, notes } = extractMigrationNotes({ migracoesText: FIXTURE, installedMajor: 3 });
        expect(bounded).toBe(true);
        expect(notes).toHaveLength(1);
        expect(notes[0]).toContain('Entrada nova (plan-9)');
    });

    it('major=2 -> devolve as 3 entradas publicadas depois da 2.0.0 (a própria 2.0.0 fica de fora)', () => {
        const { bounded, notes } = extractMigrationNotes({ migracoesText: FIXTURE, installedMajor: 2 });
        expect(bounded).toBe(true);
        expect(notes).toHaveLength(3);
        expect(notes.some((n) => n.includes('2.0.0'))).toBe(false);
    });

    it('sem âncora para o major instalado (ex.: 5) -> bounded:false, TODAS as entradas voltam (nunca finge um corte)', () => {
        const { bounded, notes } = extractMigrationNotes({ migracoesText: FIXTURE, installedMajor: 5 });
        expect(bounded).toBe(false);
        expect(notes).toHaveLength(4);
    });
});
