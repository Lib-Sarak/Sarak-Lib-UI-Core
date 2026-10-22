import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ROOT_MODULES = path.join(ROOT, 'node_modules');
const TEMP_ROOT = mkdtempSync(path.join(os.tmpdir(), 'sarak-optional-peer-consumer-'));
const CONSUMER_DIR = path.join(TEMP_ROOT, 'consumer');
const PACKAGE_DIR = path.join(CONSUMER_DIR, 'node_modules', '@sarak', 'lib-ui-core');
const PACK_DIR = path.join(TEMP_ROOT, 'pack');
const CACHE_DIR = path.join(TEMP_ROOT, 'npm-cache');
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
        env: { ...process.env, npm_config_cache: CACHE_DIR, npm_config_ignore_scripts: 'true' },
    });
}

function createJunction(targetPath, sourcePath) {
    if (existsSync(targetPath)) return;
    symlinkSync(sourcePath, targetPath, 'junction');
    LINKED_MODULE_PATHS.push(targetPath);
}

function linkWorkspaceDependencies({ includeOptionalPeers }) {
    const consumerModules = path.join(CONSUMER_DIR, 'node_modules');
    const entries = readdirSync(ROOT_MODULES, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.name === '.bin' || entry.name === '.cache' || entry.name === '.vite') continue;
        const source = path.join(ROOT_MODULES, entry.name);
        if (!entry.isDirectory()) continue;

        if (entry.name.startsWith('@')) {
            const scopeTarget = path.join(consumerModules, entry.name);
            mkdirSync(scopeTarget, { recursive: true });
            for (const scopedPackage of readdirSync(source, { withFileTypes: true })) {
                if (!scopedPackage.isDirectory()) continue;
                const packageName = `${entry.name}/${scopedPackage.name}`;
                if (!includeOptionalPeers && OPTIONAL_PEERS.has(packageName)) continue;
                createJunction(path.join(scopeTarget, scopedPackage.name), path.join(source, scopedPackage.name));
            }
            continue;
        }

        if (!includeOptionalPeers && OPTIONAL_PEERS.has(entry.name)) continue;
        createJunction(path.join(consumerModules, entry.name), source);
    }
}

function buildConsumer() {
    const viteEntry = path.join(ROOT_MODULES, 'vite', 'bin', 'vite.js');
    const configPath = path.join(CONSUMER_DIR, 'vite.config.mjs');
    return run(process.execPath, [viteEntry, 'build', '--config', configPath, '--logLevel', 'error'], { cwd: CONSUMER_DIR });
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

    linkWorkspaceDependencies({ includeOptionalPeers: false });
    assertNoOptionalPeersAreLinked();
    const peerFreeBuild = buildConsumer();
    if (peerFreeBuild.status !== 0) {
        throw new Error(`Vite 8 consumer build failed without optional peers.\n${peerFreeBuild.output}`);
    }
    console.log('[optional-peer-consumer] pass: Vite 8 build without optional peers.');

    const mutationPath = findVirtualizerChunk();
    const originalChunk = readFileSync(mutationPath, 'utf8');
    writeFileSync(mutationPath, `import { useVirtualizer as __sarakMutation } from '@tanstack/react-virtual'; void __sarakMutation;\n${originalChunk}`);
    const mutationBuild = buildConsumer();
    if (mutationBuild.status === 0 || !/MISSING_EXPORT|useVirtualizer/.test(mutationBuild.output)) {
        throw new Error(`The named-import mutation was not rejected as expected.\n${mutationBuild.output}`);
    }
    writeFileSync(mutationPath, originalChunk);
    console.log('[optional-peer-consumer] pass: named-import mutation fails with the missing-export diagnostic.');

    linkWorkspaceDependencies({ includeOptionalPeers: true });
    const fullPeerBuild = buildConsumer();
    if (fullPeerBuild.status !== 0) {
        throw new Error(`Vite 8 consumer build failed with all optional peers.\n${fullPeerBuild.output}`);
    }
    console.log('[optional-peer-consumer] pass: Vite 8 build with all optional peers.');
} finally {
    for (const modulePath of [...LINKED_MODULE_PATHS].reverse()) {
        rmSync(modulePath, { recursive: true, force: true });
    }
    rmSync(TEMP_ROOT, { recursive: true, force: true });
}
