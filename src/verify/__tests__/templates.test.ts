// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { Linter } from 'eslint';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import plugin from '../plugin';

const TEMPLATES_DIR = path.join(process.cwd(), 'sarak-ui', 'templates');

const listSources = (directory: string): string[] =>
    fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) return listSources(full);
        return /\.tsx?$/.test(entry.name) ? [full] : [];
    });

/**
 * O ESLint do projeto não traz parser de TypeScript (ele só existe no importador): os tipos saem pelo
 * compilador e o JSX fica como está, que é o que as regras leem. As linhas do achado são as do texto sem tipos.
 */
const stripTypes = (source: string): string =>
    ts.transpileModule(source, {
        compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true },
    }).outputText;

/** O que o importador liga ao seguir o guia: o `recommended` mais a regra do elemento nativo. */
const lintTemplate = (file: string) => {
    const linter = new Linter({ configType: 'flat', cwd: TEMPLATES_DIR });
    const recommended = plugin.configs.recommended as { rules: Record<string, string> };
    return linter.verify(
        stripTypes(fs.readFileSync(file, 'utf-8')),
        [{
            files: ['**/*.tsx', '**/*.ts'],
            plugins: { sarak: plugin as never },
            languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
            rules: { ...recommended.rules, 'sarak/prefer-sarak-component': 'error' },
        }],
        { filename: file },
    );
};

describe('moldes de sarak-ui/templates/', () => {
    const sources = listSources(TEMPLATES_DIR);

    it('há moldes para verificar', () => {
        expect(sources.length).toBeGreaterThan(0);
    });

    it.each(sources.map((file) => [path.relative(TEMPLATES_DIR, file).split(path.sep).join('/'), file]))(
        '%s passa no plugin (recommended + prefer-sarak-component) sem achado',
        (_name, file) => {
            const found = lintTemplate(file).map((m) => `${m.ruleId}:${m.line} ${m.message}`);
            expect(found).toEqual([]);
        },
    );
});
