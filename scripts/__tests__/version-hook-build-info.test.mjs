// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { BUILD_INFO_PREPARE_OUTPUT_PATHS } from '../generate-build-info.mjs';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PACKAGE_JSON_PATH = path.join(REPOSITORY_ROOT, 'package.json');
const PACKAGE_JSON = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));

function assertVersionStagesBuildInfoOutputs(packageJson) {
    const versionScript = packageJson.scripts.version;
    const gitAddCommand = versionScript.match(/(?:^|&&)\s*git add\s+([^&]+)/);
    if (!gitAddCommand) throw new Error('O script version não contém um comando git add.');

    const gitAddPaths = gitAddCommand[1].trim().split(/\s+/);
    const unstagedOutputs = BUILD_INFO_PREPARE_OUTPUT_PATHS.filter((filePath) => !gitAddPaths.includes(filePath));
    if (unstagedOutputs.length > 0) {
        throw new Error(`O script version não inclui saídas de --prepare no git add: ${unstagedOutputs.join(', ')}.`);
    }
}

describe('script version e saídas de generate-build-info --prepare', () => {
    it('inclui no git add todos os arquivos que --prepare escreve', () => {
        expect(() => assertVersionStagesBuildInfoOutputs(PACKAGE_JSON)).not.toThrow();
    });

    for (const outputPath of BUILD_INFO_PREPARE_OUTPUT_PATHS) {
        it(`falha quando ${outputPath} é removido do git add`, () => {
            const fixture = JSON.parse(JSON.stringify(PACKAGE_JSON));
            fixture.scripts.version = fixture.scripts.version.replace(` ${outputPath}`, '');

            expect(() => assertVersionStagesBuildInfoOutputs(fixture)).toThrow(outputPath);
        });
    }
});
