import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PACKAGE_SOURCE = path.resolve(process.env.SARAK_OPTIONAL_PEER_PACKAGE_SOURCE ?? ROOT);
const ALL_PEERS_ONLY = process.env.SARAK_OPTIONAL_PEER_SCENARIO === 'all';
const ROOT_MODULES = path.join(ROOT, 'node_modules');
const TEMP_ROOT = mkdtempSync(path.join(os.tmpdir(), 'sarak-optional-peer-consumer-'));
const CONSUMER_DIR = path.join(TEMP_ROOT, 'consumer');
const PACKAGE_DIR = path.join(CONSUMER_DIR, 'node_modules', '@sarak', 'lib-ui-core');
const PACK_DIR = path.join(TEMP_ROOT, 'pack');
const CACHE_DIR = path.join(TEMP_ROOT, 'npm-cache');
const VITEST_ENTRY = path.join(ROOT_MODULES, 'vitest', 'vitest.mjs');
const OPTIONAL_PEERS = new Set([
    '@dnd-kit/core',
    '@dnd-kit/sortable',
    '@tanstack/react-virtual',
    'echarts',
    'echarts-for-react',
    'pdfjs-dist',
    'react-markdown',
    'react-syntax-highlighter',
    'reactflow',
    'recharts',
]);
const LINKED_MODULE_PATHS = [];
const MAX_OUTPUT_BYTES = 12 * 1024 * 1024;

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        cwd: options.cwd ?? ROOT,
        encoding: 'utf8',
        maxBuffer: MAX_OUTPUT_BYTES,
        env: options.env ?? process.env,
    });
    if (result.error) throw result.error;
    return { status: result.status ?? 1, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

function runChecked(command, args, options = {}) {
    const result = run(command, args, options);
    if (result.status !== 0) {
        throw new Error(`${command} ${args.join(' ')} failed (${result.status}).\n${result.output}`);
    }
    return result.output;
}

function runNpm(args) {
    const npmCli = process.env.npm_execpath;
    if (!npmCli) throw new Error('npm_execpath is unavailable; run this consumer check through npm.');
    return runChecked(process.execPath, [npmCli, ...args], {
        cwd: PACKAGE_SOURCE,
        env: { ...process.env, npm_config_cache: CACHE_DIR, npm_config_ignore_scripts: 'true' },
    });
}

function createJunction(targetPath, sourcePath) {
    if (existsSync(targetPath)) return;
    symlinkSync(sourcePath, targetPath, 'junction');
    LINKED_MODULE_PATHS.push(targetPath);
}

function linkScopedDependencies(scopeEntry, consumerModules, includeOptionalPeers) {
    const source = path.join(ROOT_MODULES, scopeEntry.name);
    const scopeTarget = path.join(consumerModules, scopeEntry.name);
    mkdirSync(scopeTarget, { recursive: true });

    for (const scopedPackage of readdirSync(source, { withFileTypes: true })) {
        if (!scopedPackage.isDirectory()) continue;
        const packageName = `${scopeEntry.name}/${scopedPackage.name}`;
        if (!includeOptionalPeers && OPTIONAL_PEERS.has(packageName)) continue;
        createJunction(path.join(scopeTarget, scopedPackage.name), path.join(source, scopedPackage.name));
    }
}

function linkWorkspaceDependencies({ includeOptionalPeers }) {
    const consumerModules = path.join(CONSUMER_DIR, 'node_modules');
    const entries = readdirSync(ROOT_MODULES, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.name === '.bin' || entry.name === '.cache' || entry.name === '.vite' || !entry.isDirectory()) continue;
        if (entry.name.startsWith('@')) {
            linkScopedDependencies(entry, consumerModules, includeOptionalPeers);
            continue;
        }
        if (!includeOptionalPeers && OPTIONAL_PEERS.has(entry.name)) continue;
        createJunction(path.join(consumerModules, entry.name), path.join(ROOT_MODULES, entry.name));
    }
}

function writeReport(message) {
    process.stdout.write(`${message}\n`);
}

function buildConsumer() {
    const viteEntry = path.join(ROOT_MODULES, 'vite', 'bin', 'vite.js');
    const configPath = path.join(CONSUMER_DIR, 'vite.config.mjs');
    return run(process.execPath, [viteEntry, 'build', '--config', configPath], { cwd: CONSUMER_DIR });
}

function collectJavaScriptBuildMetrics(directoryPath, metrics = { files: 0, bytes: 0, assets: [] }) {
    for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
        const entryPath = path.join(directoryPath, entry.name);
        if (entry.isDirectory()) {
            collectJavaScriptBuildMetrics(entryPath, metrics);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            const bytes = statSync(entryPath).size;
            metrics.files += 1;
            metrics.bytes += bytes;
            metrics.assets.push({ file: path.relative(directoryPath, entryPath).split(path.sep).join('/'), bytes });
        }
    }
    return metrics;
}

function collectBuildWarnings(output) {
    const warningsByCode = new Map();
    const warningCodePattern = /\[([A-Z][A-Z0-9_]*)\]\s*(.*)/;
    const warningHeaderPattern = /^(?:\(!\)|warning\b|warn(?:ing)?\s*:|\[[^\]]+\]\s*warning\b)/i;

    for (const rawLine of output.split(/\r?\n/)) {
        const line = rawLine.replace(/\u001b\[[0-9;]*m/g, '').trim();
        if (!line) continue;

        const codeMatch = line.match(warningCodePattern);
        const warningCode = codeMatch && !['WARN', 'WARNING'].includes(codeMatch[1])
            ? codeMatch[1]
            : warningHeaderPattern.test(line)
                ? 'SEM_CODIGO'
                : undefined;
        if (!warningCode) continue;

        const warningGroup = warningsByCode.get(warningCode) ?? { count: 0, example: line, details: new Set() };
        warningGroup.count += 1;
        if (warningCode === 'IMPORT_IS_UNDEFINED') warningGroup.details.add(line);
        warningsByCode.set(warningCode, warningGroup);
    }

    return warningsByCode;
}

function printUndefinedImportDetails(warningGroup) {
    for (const warning of warningGroup.details) {
        if (warning !== warningGroup.example) writeReport(`    ${warning}`);
    }
}

function printBuildWarnings(scenario, output) {
    const warningGroups = collectBuildWarnings(output);
    const totalWarnings = [...warningGroups.values()].reduce((total, group) => total + group.count, 0);
    writeReport(`[optional-peer-consumer] ${scenario}: ${totalWarnings} warning(s) across ${warningGroups.size} code(s).`);

    for (const [code, group] of [...warningGroups].sort(([left], [right]) => left.localeCompare(right))) {
        writeReport(`  [${code}] ${group.count}: ${group.example}`);
        if (code === 'IMPORT_IS_UNDEFINED') printUndefinedImportDetails(group);
    }
}

function writeTestingConsumerFiles() {
    writeFileSync(path.join(CONSUMER_DIR, 'vitest.setup.js'), `
import { installSarakTestEnvironment } from '@sarak/lib-ui-core/testing';
installSarakTestEnvironment();
`);
    writeFileSync(path.join(CONSUMER_DIR, 'vitest.config.mjs'), `
import { defineConfig } from 'vitest/config';
import { filterSarakTestConsoleLog } from '@sarak/lib-ui-core/testing';
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/*.test.js'],
    onConsoleLog: filterSarakTestConsoleLog,
  },
});
`);
    writeFileSync(path.join(CONSUMER_DIR, 'src', 'consumer.test.js'), `
import { expect, it } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { SarakUIProvider } from '@sarak/lib-ui-core';
it('parses the library stylesheet inside a jsdom consumer', () => {
  const result = render(React.createElement(SarakUIProvider, { options: { fonts: 'none' } }, 'Consumer ready'));
  expect(result.getByText('Consumer ready')).toBeDefined();
  const stylesheet = document.getElementById('sarak-ui-core-styles');
  expect(stylesheet).not.toBeNull();
  void (stylesheet).sheet?.cssRules.length;
  const developmentStylesheet = document.createElement('style');
  developmentStylesheet.textContent = '__SARAK_CSS_PLACEHOLDER__';
  document.head.appendChild(developmentStylesheet);
  expect(developmentStylesheet.sheet).not.toBeNull();
});
`);
}

function runTestingConsumer() {
    return run(process.execPath, [VITEST_ENTRY, 'run', '--config', path.join(CONSUMER_DIR, 'vitest.config.mjs')], {
        cwd: CONSUMER_DIR,
    });
}

function assertTestingConsumerOutput(output, shouldContainWarning) {
    const containsWarning = output.includes('Could not parse CSS stylesheet');
    if (containsWarning !== shouldContainWarning) {
        const expected = shouldContainWarning ? 'contain' : 'omit';
        throw new Error(`Vitest consumer output should ${expected} the jsdom stylesheet warning.\n${output}`);
    }
}

function extractPackedPackage(tarballPath) {
    mkdirSync(PACKAGE_DIR, { recursive: true });
    const relativeTarballPath = path.relative(PACKAGE_DIR, tarballPath).split(path.sep).join(path.posix.sep);
    runChecked('tar', ['-xzf', relativeTarballPath, '--strip-components=1'], { cwd: PACKAGE_DIR });
}

function findVirtualizerChunk() {
    const distPath = path.join(PACKAGE_DIR, 'dist');
    const candidates = readdirSync(distPath).filter((fileName) => fileName.endsWith('.js'));
    const fileName = candidates.find((candidate) =>
        readFileSync(path.join(distPath, candidate), 'utf8').includes('@tanstack/react-virtual'),
    );
    if (!fileName) throw new Error('No packed dist chunk imports @tanstack/react-virtual.');
    return path.join(distPath, fileName);
}

function assertNoOptionalPeersAreLinked() {
    for (const peerName of OPTIONAL_PEERS) {
        const peerPath = path.join(CONSUMER_DIR, 'node_modules', ...peerName.split('/'));
        if (peerName.startsWith('@')) {
            if (readdirSync(path.dirname(peerPath)).includes(path.basename(peerPath))) {
                throw new Error(`Optional peer ${peerName} unexpectedly exists in the peer-free consumer.`);
            }
        } else if (readdirSync(path.join(CONSUMER_DIR, 'node_modules')).includes(peerName)) {
            throw new Error(`Optional peer ${peerName} unexpectedly exists in the peer-free consumer.`);
        }
    }
}

try {
    mkdirSync(CONSUMER_DIR, { recursive: true });
    mkdirSync(PACK_DIR, { recursive: true });
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(path.join(CONSUMER_DIR, 'package.json'), JSON.stringify({ name: 'sarak-optional-peer-consumer', private: true, type: 'module' }, null, 2));
    writeFileSync(path.join(CONSUMER_DIR, 'index.html'), '<!doctype html><html><head><meta charset="UTF-8"><title>Consumer</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>');
    mkdirSync(path.join(CONSUMER_DIR, 'src'), { recursive: true });
    writeFileSync(path.join(CONSUMER_DIR, 'src', 'main.jsx'), `
import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sarak from '@sarak/lib-ui-core';
Object.assign(window, {
  SarakKanban: Sarak.SarakKanban,
  SarakDataGrid: Sarak.SarakDataGrid,
  SarakDataTable: Sarak.SarakDataTable,
  SarakChartEngine: Sarak.SarakChartEngine,
  SarakPDFViewer: Sarak.SarakPDFViewer,
  SarakChatEngine: Sarak.SarakChatEngine,
  SarakMarkdownRenderer: Sarak.SarakMarkdownRenderer,
  SarakFlowEngine: Sarak.SarakFlowEngine,
});
createRoot(document.getElementById('root')).render(React.createElement('div', null, 'Consumer ready'));
`);
    writeFileSync(path.join(CONSUMER_DIR, 'vite.config.mjs'), `
export default {
  build: { outDir: 'build', emptyOutDir: true },
};
`);

    const viteVersion = JSON.parse(readFileSync(path.join(ROOT_MODULES, 'vite', 'package.json'), 'utf8')).version;
    if (!viteVersion.startsWith('8.')) throw new Error(`Expected Vite 8, found ${viteVersion}.`);

    const npmOutput = runNpm(['pack', '--pack-destination', PACK_DIR, '--cache', CACHE_DIR]);
    const tarballName = readdirSync(PACK_DIR).find((fileName) => fileName.endsWith('.tgz'));
    if (!tarballName) throw new Error(`npm pack completed without a tarball.\n${npmOutput}`);
    extractPackedPackage(path.join(PACK_DIR, tarballName));

    if (!ALL_PEERS_ONLY) {
        linkWorkspaceDependencies({ includeOptionalPeers: false });
        assertNoOptionalPeersAreLinked();
        const peerFreeBuild = buildConsumer();
        if (peerFreeBuild.status !== 0) {
            throw new Error(`Vite 8 consumer build failed without optional peers.\n${peerFreeBuild.output}`);
        }
        printBuildWarnings('without optional peers', peerFreeBuild.output);
        writeReport('[optional-peer-consumer] pass: Vite 8 build without optional peers.');

        writeTestingConsumerFiles();
        const testingConsumer = runTestingConsumer();
        if (testingConsumer.status !== 0) {
            throw new Error(`Vitest jsdom consumer failed.\n${testingConsumer.output}`);
        }
        assertTestingConsumerOutput(testingConsumer.output, false);
        writeReport('[optional-peer-consumer] pass: Vitest jsdom consumer suppresses the stylesheet warning through setup.');

        const mutationPath = findVirtualizerChunk();
        const originalChunk = readFileSync(mutationPath, 'utf8');
        writeFileSync(mutationPath, `import { useVirtualizer as __sarakMutation } from '@tanstack/react-virtual'; void __sarakMutation;\n${originalChunk}`);
        const mutationBuild = buildConsumer();
        if (mutationBuild.status === 0 || !/MISSING_EXPORT|useVirtualizer/.test(mutationBuild.output)) {
            throw new Error(`The named-import mutation was not rejected as expected.\n${mutationBuild.output}`);
        }
        writeFileSync(mutationPath, originalChunk);
        writeReport('[optional-peer-consumer] pass: named-import mutation fails with the missing-export diagnostic.');
    }

    linkWorkspaceDependencies({ includeOptionalPeers: true });
    const fullPeerBuild = buildConsumer();
    if (fullPeerBuild.status !== 0) {
        throw new Error(`Vite 8 consumer build failed with all optional peers.\n${fullPeerBuild.output}`);
    }
    printBuildWarnings('with all optional peers', fullPeerBuild.output);
    const fullPeerMetrics = collectJavaScriptBuildMetrics(path.join(CONSUMER_DIR, 'build'));
    for (const asset of fullPeerMetrics.assets.sort((left, right) => left.file.localeCompare(right.file))) {
        writeReport(`  [JS] ${asset.file}: ${asset.bytes} bytes`);
    }
    writeReport(
        `[optional-peer-consumer] with all optional peers: ${fullPeerMetrics.bytes} JavaScript bytes `
        + `across ${fullPeerMetrics.files} JS files (${(fullPeerMetrics.bytes / 1024).toFixed(2)} KiB).`,
    );
    writeReport('[optional-peer-consumer] pass: Vite 8 build with all optional peers.');
} finally {
    for (const modulePath of [...LINKED_MODULE_PATHS].reverse()) {
        rmSync(modulePath, { recursive: true, force: true });
    }
    rmSync(TEMP_ROOT, { recursive: true, force: true });
}
