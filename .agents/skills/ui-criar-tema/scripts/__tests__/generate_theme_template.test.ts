// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { buildThemeTemplateContent, writeThemeTemplate } from '../generate_theme_template';

let outputDirectory: string;

beforeEach(() => {
    outputDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-theme-template-'));
});

afterEach(() => {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
});

describe('generate_theme_template — eixos estéticos e contraparte', () => {
    it('gera um tema estético com contraparte parcial e compila a sintaxe', () => {
        const outputFile = writeThemeTemplate('tema-de-exemplo', 'light', outputDirectory);
        const content = fs.readFileSync(outputFile, 'utf8');
        const counterpartContent = content.slice(content.indexOf('    contraparte: {'));

        expect(content).toContain("import type { SarakThemePreset } from './index';");
        expect(content).toContain('id: "tema-de-exemplo" as SarakThemePreset[\'id\']');
        expect(content).toContain('"mode": "light"');
        expect(content).toMatch(/"mob":\d+,"tab":\d+,"desk":\d+/);
        expect(content).not.toMatch(/navigationStyle|reducedMotion/);
        expect(counterpartContent).toContain('"primaryColor":');
        expect(counterpartContent).not.toContain('"cardTextureType":');
        expect(content).not.toContain('[object Object]');

        const { diagnostics } = ts.transpileModule(content, {
            reportDiagnostics: true,
            compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
        });
        const syntaxErrors = (diagnostics ?? []).filter((diagnostic) =>
            diagnostic.category === ts.DiagnosticCategory.Error,
        );
        const detail = syntaxErrors
            .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
            .join('\n');

        expect(syntaxErrors, detail).toHaveLength(0);
    });

    it('rejeita ids que não são kebab-case seguro', () => {
        expect(() => buildThemeTemplateContent('../tema-invalido')).toThrow(/kebab-case/);
    });

    it('não substitui um arquivo que já existe', () => {
        const outputFile = writeThemeTemplate('tema-existente', 'dark', outputDirectory);

        expect(() => writeThemeTemplate('tema-existente', 'dark', outputDirectory)).toThrow(/já existe/);
        expect(fs.existsSync(outputFile)).toBe(true);
    });
});
