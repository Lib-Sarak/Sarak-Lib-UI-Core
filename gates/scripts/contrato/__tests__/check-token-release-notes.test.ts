// @vitest-environment node
// Teste do PRÓPRIO GATE `token-release-notes:check`: um caso que ele PEGA (token acrescentado, removido ou com
// gramática nova que a entrada da versão não cita) e um que ele DEIXA PASSAR (a entrada cita todos).
import { describe, expect, it } from 'vitest';
import { parseRemovedTokens } from '../../../../scripts/consumer-kit/collectRemovedTokens.mjs';
import {
    baselineTag,
    diffSnapshots,
    extractVersionNotes,
    missingNames,
    namesOf,
    renderTokenLists,
    snapshotTokens,
    type TokenLike,
} from '../helpers/token-release-notes-core';

const BEFORE: TokenLike[] = [
    { id: 'cardRadius', type: 'slider', min: 0, max: 24, unit: 'px' },
    { id: 'legacyGlow', type: 'color' },
    { id: 'maxContentWidth', type: 'select', options: [{ value: '1200px' }, { value: '1440px' }] },
    { id: 'steady', type: 'boolean' },
];
const AFTER: TokenLike[] = [
    { id: 'cardRadius', type: 'slider', min: 0, max: 32, unit: 'px' },
    { id: 'sidebarTone', type: 'select', options: [{ value: 'neutral' }, { value: 'primary' }] },
    { id: 'maxContentWidth', type: 'select', options: [{ value: '1200px' }, { value: '1440px' }, { value: 'fluid' }] },
    { id: 'steady', type: 'boolean' },
];

const MIGRATIONS = [
    '# Migrações',
    '## 8.1.0 — tokens',
    'Acrescentado `sidebarTone`. Removido `legacyGlow`. Com valor novo: `cardRadius`, `maxContentWidth`.',
    '## 8.0.0 — outra coisa',
    'Nada de token aqui.',
].join('\n');

describe('diffSnapshots', () => {
    const diff = diffSnapshots(snapshotTokens(BEFORE), snapshotTokens(AFTER));

    it('separa acrescentados, removidos e com gramática nova', () => {
        expect(diff.added).toEqual(['sidebarTone']);
        expect(diff.removed).toEqual(['legacyGlow']);
        expect(diff.changed.map((change) => change.id)).toEqual(['cardRadius', 'maxContentWidth']);
    });

    it('não acusa o token que ficou igual', () => {
        expect(namesOf(diff)).not.toContain('steady');
    });

    it('vê o tipo que mudou', () => {
        const before = snapshotTokens([{ id: 'colorPalette', type: 'select' }]);
        const after = snapshotTokens([{ id: 'colorPalette', type: 'string' }]);
        expect(diffSnapshots(before, after).changed.map((change) => change.id)).toEqual(['colorPalette']);
    });

    it('não vê mudança só de valor padrão (limite declarado)', () => {
        const before = snapshotTokens([{ id: 'gap', type: 'slider', min: 0, max: 8 }]);
        expect(diffSnapshots(before, snapshotTokens([{ id: 'gap', type: 'slider', min: 0, max: 8 }]))).toEqual({
            added: [], removed: [], changed: [],
        });
    });
});

describe('missingNames', () => {
    const names = namesOf(diffSnapshots(snapshotTokens(BEFORE), snapshotTokens(AFTER)));

    it('PASSA quando a entrada da versão cita todos os nomes', () => {
        expect(missingNames(names, extractVersionNotes(MIGRATIONS, '8.1.0'))).toEqual([]);
    });

    it('REPROVA nomeando o token que a entrada omite', () => {
        const withoutName = MIGRATIONS.replace('Acrescentado `sidebarTone`. ', '');
        expect(missingNames(names, extractVersionNotes(withoutName, '8.1.0'))).toEqual(['sidebarTone']);
    });

    it('não aceita o nome citado só na entrada de outra versão', () => {
        const inOtherVersion = MIGRATIONS.replace('Nada de token aqui.', '`sidebarTone`').replace('Acrescentado `sidebarTone`. ', '');
        expect(missingNames(names, extractVersionNotes(inOtherVersion, '8.1.0'))).toEqual(['sidebarTone']);
    });

    it('exige palavra inteira: `sidebarToneX` não cobre `sidebarTone`', () => {
        expect(missingNames(['sidebarTone'], '`sidebarToneX`')).toEqual(['sidebarTone']);
    });
});

describe('extractVersionNotes', () => {
    it('junta todas as seções cujo título cita a versão e ignora as outras', () => {
        const text = '## 8.0.0 — a\nAAA\n## 8.0.0 — b\nBBB\n## 7.0.0 — c\nCCC\n## 18.0.0 — d\nDDD';
        const notes = extractVersionNotes(text, '8.0.0');
        expect(notes).toContain('AAA');
        expect(notes).toContain('BBB');
        expect(notes).not.toContain('CCC');
        expect(notes).not.toContain('DDD');
    });

    it('trata a prévia pela versão-base (8.1.0-rc.1 lê a entrada 8.1.0)', () => {
        expect(extractVersionNotes('## 8.1.0 — x\nXXX', '8.1.0-rc.1')).toContain('XXX');
    });
});

describe('baselineTag', () => {
    const allTags = ['v6.3.0', 'v7.0.0', 'v8.0.0-rc.5', 'v8.0.0', 'v8.1.0'];

    it('a 8.1.0 compara com a v8.0.0', () => expect(baselineTag(allTags, '8.1.0')).toBe('v8.0.0'));
    it('a 8.0.0 e as prévias dela comparam com a v7.0.0', () => {
        expect(baselineTag(allTags, '8.0.0')).toBe('v7.0.0');
        expect(baselineTag(allTags, '8.0.0-rc.6')).toBe('v7.0.0');
    });
    it('sem tag estável anterior, devolve null', () => expect(baselineTag(['v1.0.0'], '1.0.0')).toBeNull());
});

describe('renderTokenLists', () => {
    it('escreve o removido com o `→ destino` que o gerador do kit exige', () => {
        const before = snapshotTokens(BEFORE);
        const after = snapshotTokens(AFTER);
        const text = renderTokenLists(diffSnapshots(before, after), before, after);
        expect(text).toContain('- `legacyGlow` — color → sem substituto');
        const section = ['## 9.9.0 — tokens', '', text, ''].join('\n');
        expect(parseRemovedTokens(section)).toEqual([{ id: 'legacyGlow', removedIn: '9.9.0', destination: 'sem substituto' }]);
    });


    it('escreve nome e tipo de cada token, e a opção nova de um select', () => {
        const before = snapshotTokens(BEFORE);
        const after = snapshotTokens(AFTER);
        const text = renderTokenLists(diffSnapshots(before, after), before, after);
        expect(text).toContain('`sidebarTone` — select');
        expect(text).toContain('`legacyGlow` — color');
        expect(text).toContain('`maxContentWidth` — select; opções acrescentadas: `fluid`');
    });
});
