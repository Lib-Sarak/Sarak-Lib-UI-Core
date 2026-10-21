import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getScaffold, sarakGetAllDesignTokens } from '../../../../src/core/Design/master-map.ts';
import type { SarakThemePreset } from '../../../../src/core/Design/presets/themes/index.ts';

export type ThemeMode = 'dark' | 'light';

function assertThemeId(themeId: string): void {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(themeId)) {
        throw new Error('O id deve usar kebab-case e começar com uma letra.');
    }
}

function formatThemeName(themeId: string): string {
    return themeId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function serializeDesignEntries(entries: Record<string, unknown>): string {
    return Object.entries(entries)
        .map(([tokenId, value]) => '        ' + JSON.stringify(tokenId) + ': ' + JSON.stringify(value) + ',')
        .join('\n');
}

export function buildThemeTemplateContent(themeId: string, nativeMode: ThemeMode = 'dark'): string {
    assertThemeId(themeId);

    const scaffold = getScaffold();
    const aestheticTokens = sarakGetAllDesignTokens().filter((token) => token.kind === 'aesthetic' && token.id !== 'mode');
    const designEntries: Record<string, unknown> = { mode: nativeMode };
    const counterpartEntries: Record<string, unknown> = {};

    for (const token of aestheticTokens) {
        const defaultValue = scaffold[token.id];
        if (defaultValue === undefined) continue;

        designEntries[token.id] = defaultValue;
        if (token.modeDependent) counterpartEntries[token.id] = defaultValue;
    }

    const componentName = themeId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    const counterpart = serializeDesignEntries(counterpartEntries);

    return [
        "import type { SarakThemePreset } from './index';",
        '',
        'export const ' + componentName + 'Theme: SarakThemePreset = {',
        '    id: ' + JSON.stringify(themeId) + " as SarakThemePreset['id'],",
        '    name: ' + JSON.stringify(formatThemeName(themeId)) + ',',
        "    description: 'Complete os eixos estéticos para a identidade visual desejada.',",
        '    design: {',
        serializeDesignEntries(designEntries),
        '    },',
        '    contraparte: {',
        counterpart,
        '    },',
        '};',
        '',
    ].join('\n');
}

export function writeThemeTemplate(
    themeId: string,
    nativeMode: ThemeMode = 'dark',
    targetDirectory = path.join(process.cwd(), 'src/core/Design/presets/themes'),
): string {
    assertThemeId(themeId);
    const outputDirectory = path.resolve(targetDirectory);
    const outputFile = path.join(outputDirectory, themeId + '.ts');

    if (fs.existsSync(outputFile)) {
        throw new Error('O arquivo ' + outputFile + ' já existe.');
    }

    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(outputFile, buildThemeTemplateContent(themeId, nativeMode), 'utf8');
    return outputFile;
}

async function main(): Promise<void> {
    const themeId = process.argv[2];
    const nativeMode = process.argv[3] ?? 'dark';

    if (!themeId || (nativeMode !== 'dark' && nativeMode !== 'light')) {
        throw new Error('Uso: npx tsx generate_theme_template.ts <id-do-tema> [dark|light]');
    }

    console.log('Template estético gerado em: ' + writeThemeTemplate(themeId, nativeMode));
}

function isDirectExecution(): boolean {
    const scriptPath = process.argv[1];
    return Boolean(scriptPath) && import.meta.url === pathToFileURL(path.resolve(scriptPath!)).href;
}

if (isDirectExecution()) {
    main().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Falha ao gerar o tema: ' + message);
        process.exitCode = 1;
    });
}
