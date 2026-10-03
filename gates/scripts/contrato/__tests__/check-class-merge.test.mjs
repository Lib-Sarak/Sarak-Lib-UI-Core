// @vitest-environment node
// Teste do PRÓPRIO GATE: `SarakButton`/`SarakIconButton` concatenavam `className` por
// template literal (`${...} ${className}`), deixando o vencedor do conflito Tailwind a
// cargo da ordem de emissão do stylesheet — acidental, não decidido. Casos PLANTADOS
// que o gate PEGA (concatenação sem allowlist, exclusão obsoleta) e os que ele DEIXA
// PASSAR (concatenação declarada com motivo, arquivo que já usa merge) — e, por fim, o
// repositório real.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it, afterEach } from 'vitest';
import {
    findRawClassNameConcatenation,
    runClassMergeCheck,
} from '../check-class-merge.mjs';

const scratchDirs = [];

function makeAtomicFixture(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-class-merge-'));
    scratchDirs.push(root);
    for (const [relPath, content] of Object.entries(files)) {
        const full = path.join(root, relPath);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
    }
    return root;
}

afterEach(() => {
    while (scratchDirs.length) {
        fs.rmSync(scratchDirs.pop(), { recursive: true, force: true });
    }
});

describe('findRawClassNameConcatenation', () => {
    it('PLANTADO: pega concatenação de template literal no className', () => {
        const root = makeAtomicFixture({
            'Buttons/BadButton.tsx': "export const BadButton = ({ className }) => <button className={`base ${className}`} />;",
        });
        const found = findRawClassNameConcatenation({ root, relativeTo: root });
        expect(found).toEqual(['Buttons/BadButton.tsx']);
    });

    it('DEIXA PASSAR: arquivo que compõe por mergeSarakClasses, sem template literal cru', () => {
        const root = makeAtomicFixture({
            'Buttons/GoodButton.tsx': [
                "import { mergeSarakClasses } from '../hooks/mergeSarakClasses';",
                'export const GoodButton = ({ className }) => <button className={mergeSarakClasses("base", className)} />;',
            ].join('\n'),
        });
        expect(findRawClassNameConcatenation({ root, relativeTo: root })).toEqual([]);
    });

    it('ignora a pasta __tests__ e arquivos que não são .tsx', () => {
        const root = makeAtomicFixture({
            'Buttons/__tests__/BadButton.test.tsx': 'const x = `${className}`;',
            'Buttons/notes.ts': 'const x = `${className}`;',
        });
        expect(findRawClassNameConcatenation({ root, relativeTo: root })).toEqual([]);
    });

    it('pega concatenação mesmo indireta (variável intermediária, ou propriedade de objeto)', () => {
        const root = makeAtomicFixture({
            'Inputs/Indirect.tsx': [
                'export const Indirect = ({ className }) => {',
                '    const baseClass = `layout ${className}`;',
                '    return <label className={baseClass.trim()} />;',
                '};',
            ].join('\n'),
        });
        expect(findRawClassNameConcatenation({ root, relativeTo: root })).toEqual(['Inputs/Indirect.tsx']);
    });
});

describe('runClassMergeCheck', () => {
    it('PLANTADO: violação SEM allowlist — reprova', () => {
        const root = makeAtomicFixture({
            'Buttons/BadButton.tsx': "export const BadButton = ({ className }) => <button className={`base ${className}`} />;",
        });
        const { naoDeclarados, obsoletas } = runClassMergeCheck({ root, relativeTo: root, exclusions: {} });
        expect(naoDeclarados).toEqual(['Buttons/BadButton.tsx']);
        expect(obsoletas).toEqual([]);
    });

    it('libera violação DECLARADA na allowlist, com motivo', () => {
        const root = makeAtomicFixture({
            'Buttons/BadButton.tsx': "export const BadButton = ({ className }) => <button className={`base ${className}`} />;",
        });
        const { naoDeclarados, obsoletas } = runClassMergeCheck({
            root,
            relativeTo: root,
            exclusions: { 'Buttons/BadButton.tsx': 'dívida conhecida, corrigir em plan própria' },
        });
        expect(naoDeclarados).toEqual([]);
        expect(obsoletas).toEqual([]);
    });

    it('PLANTADO: exclusão OBSOLETA — o arquivo da allowlist já não concatena mais', () => {
        const root = makeAtomicFixture({
            'Buttons/GoodButton.tsx': 'export const GoodButton = ({ className }) => <button className={mergeSarakClasses("base", className)} />;',
        });
        const { naoDeclarados, obsoletas } = runClassMergeCheck({
            root,
            relativeTo: root,
            exclusions: { 'Buttons/GoodButton.tsx': 'motivo qualquer, agora obsoleto' },
        });
        expect(naoDeclarados).toEqual([]);
        expect(obsoletas).toEqual(['Buttons/GoodButton.tsx']);
    });
});

describe('check-class-merge — repositório real', () => {
    it('SarakButton e SarakIconButton NÃO concatenam mais — já convertidos para mergeSarakClasses', () => {
        const violations = findRawClassNameConcatenation();
        expect(violations).not.toContain('src/components/atomic/Buttons/SarakButton.tsx');
        expect(violations).not.toContain('src/components/atomic/Buttons/SarakIconButton.tsx');
    });

    it('todo violador restante está declarado na allowlist, com motivo — nenhuma exclusão obsoleta', () => {
        const { naoDeclarados, obsoletas } = runClassMergeCheck();
        expect(naoDeclarados).toEqual([]);
        expect(obsoletas).toEqual([]);
    });
});
