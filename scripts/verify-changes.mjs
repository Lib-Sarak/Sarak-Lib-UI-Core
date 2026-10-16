// Verificação ESCALONADA do que mudou no worktree — a única porta de verificação do revisor.
//
// Cada mudança pede só a verificação que ela pode quebrar: documento não roda suíte; tema (JSON em .ts) roda as
// travas de tema; metadado de schema roda a paridade e a documentação; o resto roda tudo. O executor NÃO repete
// isto (a verificação é do revisor — `00-prompt-executor` §4); ele roda, no desenvolvimento, só o teste do que
// escreveu.
//
//   node scripts/verify-changes.mjs            classifica e RODA
//   node scripts/verify-changes.mjs --dry      só classifica e imprime os comandos
//   node scripts/verify-changes.mjs --tier=full|themes|schema-meta|docs   força o nível
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este script NÃO vê
// -------------------------------------------------------------------------
// 1. A classificação é por CAMINHO (e, no schema, pelas linhas do diff). Um tema que importe algo novo, ou um
//    arquivo "de tema" que mude comportamento do motor, escapa para o nível mais barato: `--tier=full` força.
// 2. NÃO roda `npm run build` nem o navegador (`cromo-css-real:check`): artefato versionado e custo próprio — o
//    revisor decide quando (mudança de CSS/componente) e roda à parte.
// 3. A simulação do Anel 0 usa os padrões de `gates/scripts/segredo/config.json` em RegExp de JavaScript; um padrão
//    que dependa de sintaxe só do Python é pulado com aviso, não silenciado.
// 4. `git diff HEAD` + arquivos não rastreados: o que foi commitado não é reverificado.
// -------------------------------------------------------------------------
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THEMES = 'src/core/Design/presets/themes/';
const THEME_INFRA = new Set(['index', 'all', 'loaders', 'registry', 'boot', 'compose', 'catalog', 'reference', 'color-engine']);
const META_KEY = /^\s*(kind|modeDependent|usage|interactsWith)\s*:/;

const posix = (file) => file.split(path.sep).join('/');
const isDoc = (file) => /^(specs|docs|sarak-ui|sarak-dev)\//.test(file) || /\.md$/.test(file);

/** Arquivo de definição de tema (não infraestrutura, não teste). */
export function isThemeFile(file) {
  if (file === `${THEMES}catalog.generated.ts`) return true;
  if (!file.startsWith(THEMES) || file.includes('/__tests__/')) return false;
  const rest = file.slice(THEMES.length);
  return /^[a-z0-9-]+\.ts$/.test(rest) && !THEME_INFRA.has(rest.replace(/\.ts$/, ''));
}

/** O diff do arquivo só toca as quatro chaves de metadado do token? (`diffLines`: linhas +/-, sem cabeçalho). */
export function isMetadataOnly(diffLines) {
  return diffLines.every((line) => META_KEY.test(line.slice(1)) || line.slice(1).trim() === '');
}

/**
 * O nível mínimo que cobre as mudanças.
 * `diffOf(file)` devolve as linhas +/- (sem `+++`/`---`) de um arquivo rastreado.
 */
export function classify(files, diffOf = () => []) {
  if (files.length === 0) return 'none';
  const rest = files.filter((file) => !isDoc(file));
  if (rest.length === 0) return 'docs';
  const themeOrAllow = (file) => isThemeFile(file) || file.startsWith(`${THEMES}__tests__/`) || /^gates\/allowlists\/[^/]+\.json$/.test(file);
  if (rest.every(themeOrAllow)) return 'themes';
  const schemaMeta = (file) => {
    if (file === 'src/core/Provider/generated/design-token-docs.json') return true;
    if (/^gates\/allowlists\/[^/]+\.json$/.test(file)) return true;
    return /^src\/core\/Design\/schema\/[^/]+\.ts$/.test(file) && isMetadataOnly(diffOf(file));
  };
  if (rest.every((file) => schemaMeta(file) || isThemeFile(file))) return 'schema-meta';
  return 'full';
}

const npm = (script, ...args) => ['npm', ['run', '-s', script, ...(args.length ? ['--', ...args] : [])]];
const node = (...args) => ['node', args];
const vitest = (...paths) => ['npx', ['vitest', 'run', ...paths]];

const ANEL1 = ['barrel:check', 'catalog:check', 'zero-brand:check', 'deep-import:check', 'gate-limits:check',
  'token-types:check', 'token-docs:check', 'themes:catalog:check', 'container-query:check', 'container-query-boundary:check',
  'persistence-doc:check', 'class-merge:check', 'icon-port:check', 'chrome-token-parity:check', 'token-reader:check',
  'css-important:check', 'fixed-translucent:check', 'variable-contract:check', 'channel-dispute:check', 'panel-contract:check',
  'kit-names:check', 'section-pointers:check', 'plan-index:check'];

/** Testes que iteram o catálogo inteiro de temas (importam `themes/all`) — descobertos, não listados à mão. */
function themeTests() {
  const out = spawnSync('git', ['grep', '-l', 'presets/themes/all', '--', '*.test.ts', '*.test.tsx', '*.test.mjs'], { cwd: ROOT, encoding: 'utf8' });
  return out.stdout.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function commandsFor(tier) {
  const kits = [npm('guide:check'), npm('dev-kit:check')];
  switch (tier) {
    case 'docs': return [npm('plan-index:check'), npm('section-pointers:check'), ...kits];
    case 'themes': return [
      npm('themes:catalog:check'), node('gates/scripts/contrato/check-theme-boot-closure.mjs', '--src'),
      vitest(`${THEMES}__tests__`, 'src/core/Provider/utils/__tests__', 'src/core/Design/utils', 'gates/scripts/audit', ...themeTests()),
      npm('themes:diversity'), npm('boot:measure'), npm('audit:baseline'), npm('plan-index:check'), ...kits,
    ];
    case 'schema-meta': return [
      npm('token-types:check'), npm('token-docs:check'), npm('catalog:check'), npm('themes:catalog:check'),
      vitest('src/core/Design', 'src/core/Provider/utils/__tests__', 'gates/scripts/contrato', 'scripts'),
      npm('audit:baseline'), npm('plan-index:check'), ...kits,
    ];
    case 'full': return [
      ['npx', ['tsc', '--noEmit']], vitest(), npm('audit:baseline', '--with-tsc'),
      ...ANEL1.map((script) => npm(script)), node('gates/scripts/contrato/check-trail-citation.mjs'), ...kits,
    ];
    default: return [];
  }
}

function changedFiles() {
  const tracked = spawnSync('git', ['-c', 'core.quotePath=false', 'diff', 'HEAD', '--name-only'], { cwd: ROOT, encoding: 'utf8' }).stdout;
  const untracked = spawnSync('git', ['-c', 'core.quotePath=false', 'ls-files', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' }).stdout;
  return [...new Set([...tracked.split('\n'), ...untracked.split('\n')].map((f) => f.trim()).filter(Boolean))]
    // saída de build e artefato local: não são mudança a classificar
    .filter((file) => !/^(dist|node_modules|test-results|browser-tests\/showcase-output)\//.test(file) && !/^src\/(core\/Provider\/)?buildInfo\.ts$/.test(file) && file !== '.claude/settings.local.json');
}

function diffLinesOf(file) {
  const out = spawnSync('git', ['diff', 'HEAD', '--unified=0', '--no-color', '--', file], { cwd: ROOT, encoding: 'utf8' }).stdout;
  return out.split('\n').filter((line) => /^[+-]/.test(line) && !/^(\+\+\+|---)/.test(line));
}

/** Simulação do Anel 0: os padrões de segredo sobre as linhas ADICIONADAS e os arquivos novos. */
function scanSecrets(files) {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'gates/scripts/segredo/config.json'), 'utf8'));
  const patterns = [];
  for (const [kind, source] of Object.entries(config.padroes ?? {})) {
    // `(?i)` inicial é a forma do Python para "sem caixa": vira a flag `i` do JavaScript.
    const insensitive = source.startsWith('(?i)');
    try { patterns.push([kind, new RegExp(insensitive ? source.slice(4) : source, insensitive ? 'i' : '')]); } catch { console.log(`  aviso: padrão "${kind}" não é RegExp de JavaScript — pulado`); }
  }
  let lines = 0;
  const hits = [];
  for (const file of files) {
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    const tracked = spawnSync('git', ['ls-files', '--error-unmatch', file], { cwd: ROOT, encoding: 'utf8' }).status === 0;
    const added = tracked ? diffLinesOf(file).filter((l) => l.startsWith('+')).map((l) => l.slice(1)) : fs.readFileSync(abs, 'utf8').split('\n');
    for (const line of added) {
      lines += 1;
      for (const [kind, rx] of patterns) if (rx.test(line)) hits.push(`${file}: ${kind}`);
    }
  }
  return { lines, hits };
}

function run([cmd, args]) {
  const label = `${cmd} ${args.join(' ')}`.slice(0, 110);
  const started = Date.now();
  const result = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 1 << 28 });
  const seconds = ((Date.now() - started) / 1000).toFixed(0);
  const ok = result.status === 0;
  console.log(`${ok ? '[OK]  ' : '[FAIL]'} ${label} (${seconds}s)`);
  if (!ok) console.log((result.stdout + result.stderr).split('\n').slice(-25).join('\n'));
  return ok;
}

function main() {
  const dry = process.argv.includes('--dry');
  const forced = process.argv.find((arg) => arg.startsWith('--tier='))?.split('=')[1];
  const files = changedFiles().map(posix);
  const tier = forced ?? classify(files, diffLinesOf);
  console.log(`--- verify-changes: ${files.length} arquivo(s) alterado(s) → nível "${tier}" ---`);
  const commands = commandsFor(tier);
  if (dry || commands.length === 0) {
    commands.forEach(([cmd, args]) => console.log(`  ${cmd} ${args.join(' ')}`));
    return 0;
  }
  const failures = commands.filter((command) => !run(command)).length;
  const secrets = scanSecrets(files);
  console.log(`${secrets.hits.length === 0 ? '[OK]  ' : '[FAIL]'} Anel 0 simulado: ${secrets.lines} linha(s), ${secrets.hits.length} achado(s)`);
  secrets.hits.forEach((hit) => console.log(`  ${hit}`));
  const total = failures + (secrets.hits.length > 0 ? 1 : 0);
  console.log(total === 0 ? `\n[OK] nível "${tier}" verde.` : `\n[ERRO] ${total} verificação(ões) falharam.`);
  return total === 0 ? 0 : 1;
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) process.exit(main());
