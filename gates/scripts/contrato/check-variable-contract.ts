// Contrato das variáveis de design — três regras, um script, o mesmo escopo (`src/`):
//
//   (i)   UM DONO. Uma variável CSS é escrita por um token só. A exceção é o par mestre + exceção:
//         `cardBorderRadius` escreve os quatro cantos e `cardRadiusTL…BR` os sobrescrevem quando o tema os
//         declara (campo `exceptionOf` do schema). Dois donos "iguais" fazem o último do mapa vencer em
//         silêncio — o slider mestre nunca chegava aos cantos, `--theme-surface` era a cor do cartão e não a
//         da superfície.
//   (ii)  TODO NOME LIDO EXISTE. `var(--x)` em CSS, em componente, em mock do painel ou em padrão de schema
//         tem de ser emitido por um token (variável, `cssVars` ou variante de cor com `generateVariants`),
//         declarado em CSS da lib, escrito pelo `useDesignVariables` fora do laço de tokens, ou declarado
//         (`'--x':`, `setProperty`) no próprio código. Leitura de nome que ninguém escreve cai no fallback
//         para sempre — foi o caso de `--sarak-bg-body-rgb`, que fazia `--bg-body-rgb` ser sempre a cor
//         clara.
//   (iii) A RESERVA É O PADRÃO. `var(--x, F)` de variável de token carrega em `F` o padrão do token (em
//         token responsivo, qualquer dos três pontos — piso mobile-first incluso — ou palavra-chave, ou outra
//         leitura). `var(--sarak-primary-color, #3b82f6)` com padrão `#00f2ff` pintava de azul toda tela sem
//         Provider e contradizia o tema nas telas com ele.
//
// Uso: `npx tsx gates/scripts/contrato/check-variable-contract.ts`. Toda ausência é bloqueio; as exceções
// vivem em `ALLOWLIST`, com motivo, e esvaziam sozinhas (entrada que deixou de ser achado também bloqueia).
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. ESCOPO: `src/**/*.{css,ts,tsx}` sem `__tests__`, `generated` e `catalog`. Não vê `docs/`, `sarak-ui/`,
//    `dist/` nem o CSS do consumidor.
// 2. É TEXTUAL. Leitura é `var(--x…)` literal: nome montado por template (`var(--sarak-${id})`) e valor lido
//    por `getPropertyValue` ficam fora. Declaração é `--x:` literal, chave `'--x':` ou `setProperty('--x'`;
//    um nome citado só em array ou constante de TS não conta como dono (rigor deliberado: foi esse o
//    caso que escapava do `auditor_ghostvars`, que aceita qualquer literal e o sufixo `-rgb` de qualquer base).
// 3. (i) só conhece os tokens do schema. Dois escritores no CSS (`_base.css` redeclara `--theme-gap` no
//    `body`) ou um derivado do hook que repete nome de token não são conflito de TOKEN, e ficam fora.
// 4. (iii) só julga a reserva LITERAL e única (`var(--x, 12px)`): a reserva que é outro `var()`, vazia ou
//    palavra-chave passa; composta (`0 20px 50px`) só passa se for IGUAL ao padrão; reserva de variante de
//    cor só é julgada nas que não dependem do modo (`-rgb`, `-bg`, `-border`, `-10`…`-50`). Em token
//    responsivo qualquer dos três pontos vale — não prova que o ponto é o do dispositivo.
// 5. Não prova que o consumo é correto nem que o efeito aparece; o efeito é de `browser-tests/`.
// 6. Os nomes escritos pelo `useDesignVariables` fora do laço são lidos do texto dele e do de
//    `designVariableHelpers` (literais entre aspas): um nome citado lá em código real ou em mensagem conta
//    como escrito. Os aliases de fachada (`aliasPairs`) e os canais `-rgb` emitidos fora do laço entram no
//    índice com a reserva julgada — só a do CSS da lib (o piso sem Provider). A de COMPONENTE não é
//    julgada: em 2026-10-13 eram 359 leituras de alias em TS, 323 com reserva diferente do padrão
//    (`var(--text-muted, #94a3b8)` contra `rgba(255, 255, 255, 0.4)`), e a decisão de uniformá-las é da
//    plan que as tocar. Um alias que o gate não consegue ler no `aliasPairs` (outra forma de escrever o
//    par) segue sem reserva conferida.
// 7. A declaração sob seletor que nunca casa NÃO conta como dono quando o seletor exige `[data-…]` de um
//    atributo que nenhum token select/boolean/font/text emite nem literal de TypeScript escreve. Seletor
//    morto por outro motivo (classe que ninguém aplica, elemento que não existe) continua contando como dono.
// 8. A reserva do canal `-rgb` é conferida como texto (a lista `r, g, b` do padrão), e a das outras
//    variantes como cor: um canal "banana" é acusado. O canal só é julgado se o nome do token dono é
//    conhecido; um canal de nome montado em template fica fora (limite 2).
// -------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { computeColorVariants } from '../../../src/core/Provider/utils/color-engine';
import {
    addDerivedNames,
    declaredIn,
    emittedNames,
    indexByName,
    liveDeclaredIn,
    loadTokens,
    ownerConflicts,
    readsIn,
    runtimeNames,
    scanFallbacks,
    sourceFiles,
    stripComments,
    toKebab,
    type FallbackFinding,
    type OwnerConflict,
    type TokenLike,
    type VarRead,
} from './helpers/variable-contract-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/** Nome lido que ninguém escreve e que é aceito, com o motivo. Esvazia sozinha. */
export const ALLOWLIST: Array<{ name: string; reason: string }> = [];

/** O Tailwind escreve `--tw-*` por conta própria; os demais `--color-*`… só valem quando o CSS da lib os declara. */
const isTailwindInternal = (name: string): boolean => name.startsWith('--tw-');

export interface ContractReport {
    conflicts: OwnerConflict[];
    ownerless: Array<{ name: string; count: number; where: string[] }>;
    fallbacks: FallbackFinding[];
    staleAllowlist: string[];
    reads: number;
    fallbacksChecked: number;
}

/** Os atributos `data-…` que alguém escreve: o `data-sx-<kebab>` de token select/boolean/font/text e todo literal de TS. */
export function attributeWriters(tokens: TokenLike[], codeTexts: string[]): Set<string> {
    const names = new Set<string>();
    for (const token of tokens) {
        if (['select', 'boolean', 'font', 'text'].includes(token.type ?? '')) names.add(`data-sx-${toKebab(token.id)}`);
    }
    for (const text of codeTexts) {
        for (const match of text.matchAll(/['"`{ ](data-[a-z][\w-]*)/g)) names.add(match[1]);
    }
    return names;
}

function computeVariant(color: string, suffix: string): string | null {
    const variants = computeColorVariants(color, '#000000') as unknown as Record<string, string>;
    return variants[suffix] ?? null;
}

export function buildReport({ srcDir = path.join(ROOT, 'src'), tokens = loadTokens() as TokenLike[] }: { srcDir?: string; tokens?: TokenLike[] } = {}): ContractReport {
    const defined = new Set<string>();
    for (const item of emittedNames(tokens)) defined.add(item.name);

    const reads: VarRead[] = [];
    // O hook e o módulo de derivados que ele chama escrevem variáveis fora do laço de tokens.
    const runtimeFiles = ['useDesignVariables.ts', 'designVariableHelpers.ts'].map((name) => path.resolve(srcDir, 'core', 'Design', 'hooks', name));
    const runtimeTexts: string[] = [];
    const files = sourceFiles(srcDir).map((file) => ({ file, text: stripComments(fs.readFileSync(file, 'utf8'), file.endsWith('.css')) }));
    const writers = attributeWriters(tokens, files.filter((entry) => !entry.file.endsWith('.css')).map((entry) => entry.text));
    for (const { file, text } of files) {
        const isCss = file.endsWith('.css');
        const relative = path.relative(srcDir, file).split(path.sep).join('/');
        for (const name of isCss ? liveDeclaredIn(text, writers) : declaredIn(text)) defined.add(name);
        if (runtimeFiles.includes(path.resolve(file))) {
            runtimeNames(text).forEach((name) => defined.add(name));
            runtimeTexts.push(text);
        }
        reads.push(...readsIn(text, relative));
    }

    const allowed = new Set(ALLOWLIST.map((entry) => entry.name));
    const usedAllow = new Set<string>();
    const byName = new Map<string, VarRead[]>();
    for (const read of reads) {
        if (defined.has(read.name) || isTailwindInternal(read.name)) continue;
        if (allowed.has(read.name)) {
            usedAllow.add(read.name);
            continue;
        }
        byName.set(read.name, [...(byName.get(read.name) ?? []), read]);
    }
    const ownerless = [...byName.entries()]
        .map(([name, list]) => ({ name, count: list.length, where: [...new Set(list.map((item) => `${item.file}:${item.line}`))].slice(0, 4) }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const index = indexByName(tokens);
    addDerivedNames(index, runtimeTexts);
    const { findings, checked } = scanFallbacks(reads, index, computeVariant);

    return {
        conflicts: ownerConflicts(tokens),
        ownerless,
        fallbacks: findings,
        staleAllowlist: [...allowed].filter((name) => !usedAllow.has(name)),
        reads: reads.length,
        fallbacksChecked: checked,
    };
}

function main(): void {
    console.log('--- check-variable-contract ---');
    const report = buildReport();
    let failed = false;

    if (report.conflicts.length > 0) {
        failed = true;
        console.log(`[ERROR] ${report.conflicts.length} variável(is) com mais de um dono (declare mestre + exceção com \`exceptionOf\` ou dê nome próprio):`);
        report.conflicts.forEach((c) => console.log(`  - ${c.name} <= ${c.owners.join(', ')}`));
    }
    if (report.ownerless.length > 0) {
        failed = true;
        console.log(`[ERROR] ${report.ownerless.length} nome(s) lido(s) que nenhum token, CSS ou código escreve:`);
        report.ownerless.forEach((o) => console.log(`  - ${o.name} (${o.count}x) ${o.where.join(' ')}`));
    }
    if (report.fallbacks.length > 0) {
        failed = true;
        console.log(`[ERROR] ${report.fallbacks.length} reserva(s) diferente(s) do padrão do token:`);
        report.fallbacks.slice(0, 60).forEach((f) => console.log(`  - ${f.file}:${f.line} var(${f.name}, ${f.fallback}) — padrão: ${f.expected}`));
        if (report.fallbacks.length > 60) console.log(`  … +${report.fallbacks.length - 60}`);
    }
    if (report.staleAllowlist.length > 0) {
        failed = true;
        console.log(`[ERROR] ${report.staleAllowlist.length} exceção(ões) que deixou(aram) de existir — remova da ALLOWLIST: ${report.staleAllowlist.join(', ')}`);
    }

    if (failed) process.exit(1);
    console.log(`[OK] um dono por variável; ${report.reads} leituras com dono; ${report.fallbacksChecked} reservas conferidas contra o padrão.`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
    main();
}
