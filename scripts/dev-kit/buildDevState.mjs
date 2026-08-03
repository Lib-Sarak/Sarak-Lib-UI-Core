/**
 * Monta o `sarak-dev/state.json` — o ESTADO do repositório, derivado, nunca escrito
 * à mão (Spec 14 §3).
 *
 * É este arquivo que impede o `GUIA-MANUTENCAO.md` de envelhecer: a prosa descreve
 * FLUXOS (que mudam raramente) e aponta para números que são recontados a cada
 * geração. Foi exatamente a ausência disso que deixou as skills do mantenedor
 * mandando registrar componente num arquivo removido meses antes.
 *
 * Reuso, não reimplementação: os coletores de AST vêm de `catalogAst.mjs`,
 * `publicComponents.mjs` e `consumer-kit/collectKitSources.mjs`. Nada de travessia
 * nova.
 */

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SRC } from '../catalogAst.mjs';
import { collectPublicComponentNames } from '../publicComponents.mjs';
import { collectDesignTokens } from '../consumer-kit/collectKitSources.mjs';

const DESIGN_DIR = path.join(SRC, 'core/Design');
const AUDITOR_DIR = path.join(ROOT, 'gates/scripts/audit');
const BASELINE_FILE = path.join(ROOT, 'gates/baselines/audit-baseline.json');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));

const dirsOf = (dir, ignore = new Set()) =>
    fs
        .readdirSync(dir)
        .filter((entry) => !ignore.has(entry) && fs.statSync(path.join(dir, entry)).isDirectory())
        .sort();

const mdFilesOf = (dir) =>
    fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').sort() : [];

/**
 * Tokens de design vistos pelas TRÊS fontes que a paridade cruza, mais o tipo público.
 * Os quatro números aparecem lado a lado de propósito: divergência entre eles é a
 * primeira coisa que alguém precisa ver ao mexer em token.
 */
const collectDesignState = () => {
    const mapping = readJson(path.join(DESIGN_DIR, 'catalog/theme_table_mapping.json'));
    const colunas = Object.values(mapping).filter(Array.isArray);
    const idsUnicos = new Set(colunas.flat());

    const partitionsDir = path.join(DESIGN_DIR, 'catalog/partitions');
    const partitionFiles = fs.readdirSync(partitionsDir).filter((f) => f.endsWith('.json')).sort();
    const catalogTokens = new Set(
        partitionFiles.flatMap((file) => readJson(path.join(partitionsDir, file)).map((t) => t.tokenId)),
    );

    const tipados = collectDesignTokens();
    const schemaFiles = fs.readdirSync(path.join(DESIGN_DIR, 'schema')).filter((f) => f.endsWith('.ts')).sort();
    const masterMap = fs.readFileSync(path.join(DESIGN_DIR, 'master-map.ts'), 'utf-8');

    return {
        schemaFiles: { count: schemaFiles.length, files: schemaFiles },
        masterMapVersion: masterMap.match(/version:\s*'([^']+)'/)?.[1] ?? null,
        tokens: {
            nota:
                'Os quatro números têm de convergir. `idsUnicos` é o total real; `entradasBrutas` ' +
                'maior que ele significa id roteado para mais de uma coluna. `tipoPublico` menor ' +
                'significa que `design-token-ids.ts` está DEFASADO (regenere com o script do §5.1 do guia).',
            mapeamento: {
                colunas: colunas.length,
                entradasBrutas: colunas.flat().length,
                idsUnicos: idsUnicos.size,
            },
            particoes: { arquivos: partitionFiles.length, tokens: catalogTokens.size },
            tipoPublico: {
                interface: 'SarakDesignTokens',
                ids: tipados.length,
                responsivos: tipados.filter((t) => t.responsive).length,
            },
        },
    };
};

/** Gates registrados: derivados dos `scripts` do `package.json`, nunca listados à mão. */
const collectGates = (pkg) => {
    const isGate = (name) => name.endsWith(':check') || name === 'audit' || name === 'gates:full';
    return Object.entries(pkg.scripts)
        .filter(([name]) => isGate(name))
        .map(([name, comando]) => ({ nome: `npm run ${name}`, comando }))
        .sort((a, b) => a.nome.localeCompare(b.nome));
};

/** Os auditores que o agregador roda, lidos do próprio `run_audit.mjs`. */
const collectAuditores = () => {
    const source = fs.readFileSync(path.join(AUDITOR_DIR, 'run_audit.mjs'), 'utf-8');
    return [...source.matchAll(/'(auditor_[\w]+\.mjs)'/g)].map((m) => m[1]);
};

export const buildDevState = () => {
    const pkg = readJson(path.join(ROOT, 'package.json'));
    const publicos = collectPublicComponentNames();

    return {
        $comment:
            'GERADO por scripts/generate-dev-kit.mjs (npm run dev-kit) — NÃO edite à mão. ' +
            'É o estado REAL deste repositório: as skills e o GUIA-MANUTENCAO.md leem daqui ' +
            'em vez de duplicar contagens que envelhecem.',
        schemaVersion: 1,
        lib: { name: pkg.name, version: pkg.version },
        design: collectDesignState(),
        componentes: {
            categoriasAtomicas: dirsOf(path.join(SRC, 'components/atomic'), new Set(['hooks', '__tests__'])),
            categoriasDeEngine: dirsOf(path.join(SRC, 'components/engines'), new Set(['__tests__'])),
            publicos: { count: publicos.length, nomes: publicos },
        },
        gates: collectGates(pkg),
        auditores: collectAuditores(),
        baseline: readJson(BASELINE_FILE),
        base: {
            adr: mdFilesOf(path.join(ROOT, 'specs/adr')),
            arquitetura: mdFilesOf(path.join(ROOT, 'specs/arquitetura')),
            specs: mdFilesOf(path.join(ROOT, 'specs/specs')),
        },
        docs: fs.readdirSync(path.join(ROOT, 'docs')).filter((f) => f.endsWith('.md')).sort(),
    };
};
