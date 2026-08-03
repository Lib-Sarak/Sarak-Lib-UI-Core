/**
 * Anel 2 do enforcement por commit (spec `specs/specs/02-enforcement-por-commit.md`).
 *
 * `run_audit.mjs` tem baseline NÃO-ZERO (dívida conhecida e documentada em
 * `specs/specs/01-gates-e-baseline.md`). Um gate binário sobre ele bloquearia todo
 * commit; ignorá-lo deixaria a dívida crescer em silêncio. A saída é comparar a
 * MEDIÇÃO ATUAL contra um baseline VERSIONADO:
 *
 *   pior que o baseline  -> BLOQUEIA (é regressão)
 *   igual ao baseline    -> passa, com aviso do que ainda é dívida
 *   melhor que o baseline-> passa, e AVISA que o baseline precisa ser atualizado
 *
 * O baseline NUNCA é atualizado sozinho: quem consertou a dívida roda
 * `npm run audit:baseline -- --write` e commita o arquivo junto do conserto. Baseline
 * que se auto-ajusta é baseline que não cobra nada.
 *
 * Este script ORQUESTRA os auditores — não altera nenhum deles. A lista de auditores é
 * LIDA de `run_audit.mjs` para não haver drift: auditor novo lá é auditor novo aqui.
 *
 * Uso:
 *   node gates/scripts/release/check-audit-baseline.mjs            # compara (exit 1 se regrediu)
 *   node gates/scripts/release/check-audit-baseline.mjs --write    # regrava o baseline com a medição atual
 *   node gates/scripts/release/check-audit-baseline.mjs --with-tsc # inclui a contagem do `tsc --noEmit`
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const AUDIT_DIR = path.join(ROOT, 'gates/scripts/audit');
const RUN_AUDIT = path.join(AUDIT_DIR, 'run_audit.mjs');
const BASELINE_FILE = path.join(ROOT, 'gates/baselines/audit-baseline.json');

/** Lê a lista de auditores do próprio `run_audit.mjs` — evita drift entre os dois. */
const auditorList = () => {
    const src = fs.readFileSync(RUN_AUDIT, 'utf8');
    const block = src.match(/const scripts = \[([\s\S]*?)\]/);
    if (!block) throw new Error('Não consegui ler a lista de auditores em run_audit.mjs');
    return [...block[1].matchAll(/'([^']+\.mjs)'/g)].map((m) => m[1]);
};

const num = (output, regex) => {
    const hit = output.match(regex);
    return hit ? Number(hit[1]) : null;
};

/**
 * Extrai as métricas de cada auditor da saída dele. `null` = não consegui ler, e nesse
 * caso o resultado é tratado como bloqueio (fail-closed) quando o auditor reprovou.
 */
const PARSERS = {
    'auditor_hardcoded.mjs': (out) => ({
        valor: num(out, /Valor \(hex\/px\/rem\/em\)\s*:\s*(\d+)/),
        estruturalLiquido: num(out, /Estrutural \(líquido\)\s*:\s*(\d+)/),
    }),
    'auditor_ghostvars.mjs': (out) => ({
        consumos: /Nenhuma variável-fantasma consumida/.test(out)
            ? 0
            : num(out, /Total:\s*(\d+) consumos de variáveis-fantasma/),
    }),
    'auditor_typescript.mjs': (out) => ({
        violacoes: /Nenhuma tipagem 'any' detectada/.test(out) ? 0 : num(out, /Encontradas (\d+) violações de uso de 'any'/),
    }),
    'auditor_coverage.mjs': (out) => ({
        orfaos: /Todos os componentes possuem testes/.test(out) ? 0 : num(out, /Encontrados (\d+) componentes órfãos/),
    }),
    'auditor_arquitetura.mjs': (out) => ({
        violacoes: /Nenhuma quebra de hierarquia/.test(out) ? 0 : num(out, /Encontradas (\d+) violações de arquitetura/),
    }),
    'auditor_cleancode.mjs': (out) => ({
        violacoes: /Nenhum crime de Clean Code/.test(out) ? 0 : num(out, /Encontradas (\d+) violações de Clean Code/),
    }),
    'auditor_paridade.mjs': (out) => ({ falhou: /SUCESSO ABSOLUTO/.test(out) ? 0 : 1 }),
    'auditor_presets.mjs': (out) => ({ falhou: /Nenhuma chave órfã/.test(out) ? 0 : 1 }),
};

/** Auditor sem parser conhecido cai no genérico: só o status de saída. */
const genericParser = (out, status) => ({ falhou: status === 0 ? 0 : 1 });

const runAuditors = () => {
    const medicao = {};
    for (const script of auditorList()) {
        const result = spawnSync('node', [path.join(AUDIT_DIR, script)], { encoding: 'utf8', cwd: ROOT });
        const output = `${result.stdout || ''}\n${result.stderr || ''}`;
        const parser = PARSERS[script];
        medicao[script] = parser ? parser(output) : genericParser(output, result.status);
        medicao[script]._status = result.status;
    }
    return medicao;
};

/**
 * Conta os erros do compilador. Invoca o `tsc` de `node_modules` pelo próprio Node
 * (nada de `npx` com `shell: true`, que dispara DeprecationWarning e ainda paga a
 * resolução do npx a cada commit).
 */
const tscErrorCount = () => {
    const tscBin = path.join(ROOT, 'node_modules/typescript/bin/tsc');
    const result = spawnSync(process.execPath, [tscBin, '--noEmit'], { encoding: 'utf8', cwd: ROOT });
    const output = `${result.stdout || ''}\n${result.stderr || ''}`;
    return { erros: (output.match(/error TS\d+/g) || []).length };
};

/** Data LOCAL (YYYY-MM-DD). `toISOString()` usa UTC e carimbaria o dia seguinte à noite. */
const hojeLocal = () => {
    const agora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}`;
};

const readBaseline = () => {
    if (!fs.existsSync(BASELINE_FILE)) return null;
    return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
};

const writeBaseline = (metricas, tsc) => {
    const limpo = {};
    for (const [script, valores] of Object.entries(metricas)) {
        limpo[script] = Object.fromEntries(Object.entries(valores).filter(([k]) => !k.startsWith('_')));
    }
    const conteudo = {
        _doc: 'Baseline do Anel 2 (specs/specs/02-enforcement-por-commit.md). NÃO editar à mão: rode `npm run audit:baseline -- --write` DEPOIS de consertar a dívida, e commite junto do conserto.',
        _leitura: 'Cada número é o MÁXIMO tolerado. Maior que isto = regressão = commit bloqueado.',
        medidoEm: hojeLocal(),
        metricas: limpo,
        ...(tsc ? { tsc } : {}),
    };
    fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(conteudo, null, 4)}\n`, 'utf8');
};

/** Compara uma família de métricas; devolve as regressões e as melhoras. */
const comparar = (nome, atual, esperado) => {
    const regressoes = [];
    const melhoras = [];
    for (const [chave, valor] of Object.entries(atual)) {
        if (chave.startsWith('_')) continue;
        const limite = esperado?.[chave] ?? 0;
        if (valor === null) {
            regressoes.push(`${nome}.${chave}: não consegui ler a saída do auditor`);
            continue;
        }
        if (valor > limite) regressoes.push(`${nome}.${chave}: ${limite} -> ${valor}`);
        if (valor < limite) melhoras.push(`${nome}.${chave}: ${limite} -> ${valor}`);
    }
    return { regressoes, melhoras };
};

const main = () => {
    const write = process.argv.includes('--write');
    const withTsc = process.argv.includes('--with-tsc') || write;

    const metricas = runAuditors();
    const tsc = withTsc ? tscErrorCount() : null;

    if (write) {
        writeBaseline(metricas, tsc);
        console.log(`[audit:baseline] baseline regravado em gates/baselines/audit-baseline.json`);
        console.log('[audit:baseline] COMMITE este arquivo junto do conserto que o justificou.');
        return;
    }

    const baseline = readBaseline();
    if (!baseline) {
        console.error('[audit:baseline] BLOQUEADO — gates/baselines/audit-baseline.json não existe.');
        console.error('  Gere com: npm run audit:baseline -- --write');
        process.exit(1);
    }

    const regressoes = [];
    const melhoras = [];
    for (const [script, atual] of Object.entries(metricas)) {
        const r = comparar(script, atual, baseline.metricas?.[script]);
        regressoes.push(...r.regressoes);
        melhoras.push(...r.melhoras);
    }
    if (tsc) {
        const r = comparar('tsc', tsc, baseline.tsc);
        regressoes.push(...r.regressoes);
        melhoras.push(...r.melhoras);
    }

    if (regressoes.length > 0) {
        console.error(`\n[audit:baseline] REGRESSÃO — a auditoria piorou em relação ao baseline de ${baseline.medidoEm}:`);
        for (const linha of regressoes) console.error(`  - ${linha}`);
        console.error('\n  Veja o detalhe (arquivo e linha) com:');
        console.error('    node gates/scripts/audit/run_audit.mjs');
        console.error('  As regras estão em specs/specs/00-regras-e-invariantes.md; a dívida tolerada, em 01-gates-e-baseline.md.\n');
        process.exit(1);
    }

    if (melhoras.length > 0) {
        console.log('[audit:baseline] MELHOROU em relação ao baseline (nada bloqueado):');
        for (const linha of melhoras) console.log(`  + ${linha}`);
        console.log('  Atualize o baseline com: npm run audit:baseline -- --write');
        return;
    }

    console.log(`[audit:baseline] igual ao baseline de ${baseline.medidoEm} — nenhuma regressão.`);
};

main();
