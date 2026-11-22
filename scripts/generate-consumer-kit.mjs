/**
 * Gerador do KIT DE USO DO CONSUMIDOR — `sarak-ui/` na raiz do pacote (Spec 50).
 *
 * O kit é o que o importador recebe junto com a lib para saber COMO escrever o
 * frontend: `START-HERE.md`, `GUIA-FRONTEND.md` (as 4 topologias + todos os casos),
 * `skill/` (a `ui-integra-consumidor` espelhada), `templates/` (esqueletos copiáveis),
 * `catalog.json` (a superfície viva) e `VERSION` (carimbo para re-sincronizar).
 *
 * Princípio central: **nunca escrever à mão o que muda.** A prosa e os templates são
 * estáveis e editados à mão; toda LISTA (componentes, props, tokens, ícones, contrato
 * de responsividade, slots) é derivada do código por AST — reusando o MESMO pipeline
 * do `npm run catalog`, sem reimplementar travessia.
 *
 * Uso: `node scripts/generate-consumer-kit.mjs` (gera) | `--check` (falha se defasado).
 * O `--check` roda no `npm run build`: kit defasado = build vermelho, e por
 * consequência é impossível publicar uma versão cujo kit não bata com a API.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { ROOT } from './catalogAst.mjs';
import { buildKitOutputs } from './consumer-kit/buildKitOutputs.mjs';
import { GUIDE, injectBlock } from './consumer-kit/kitFiles.mjs';

const ARCHETYPES_MARKER = 'SARAK-KIT:ARQUETIPOS';
const THEME_CATALOG = path.join(ROOT, 'src/core/Design/presets/themes/catalog.generated.ts');

const stringProperty = (object, name) => {
    const property = object.properties.find((entry) =>
        ts.isPropertyAssignment(entry) && entry.name.getText().replaceAll(/["']/g, '') === name,
    );
    return property && ts.isStringLiteralLike(property.initializer) ? property.initializer.text : '';
};

/** O guia usa os nomes e descrições do catálogo gerado de temas como arquétipos. */
export const readThemeArchetypes = (catalogPath = THEME_CATALOG) => {
    const source = ts.createSourceFile(catalogPath, fs.readFileSync(catalogPath, 'utf8'), ts.ScriptTarget.Latest, true);
    let entries = [];
    const visit = (node) => {
        if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'SARAK_THEME_CATALOG' && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
            entries = node.initializer.elements
                .filter(ts.isObjectLiteralExpression)
                .map((entry) => ({
                    id: stringProperty(entry, 'id'),
                    name: stringProperty(entry, 'name'),
                    description: stringProperty(entry, 'description'),
                }))
                .filter((entry) => entry.id && entry.name && entry.description);
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    if (entries.length === 0) throw new Error(`[guide] nenhum tema legível em ${catalogPath}`);
    return entries;
};

const renderThemeArchetypes = (themes) => [
    '| Arquétipo embarcado | Demonstra |',
    '| --- | --- |',
    ...themes.map(({ id, name, description }) => `| \`${id}\` — ${name} | ${description.replaceAll('|', '\\|').replaceAll(/\s*\n\s*/g, ' ')} |`),
].join('\n');

export const injectThemeArchetypes = (guide, themes = readThemeArchetypes()) => injectBlock({
    content: guide,
    marker: ARCHETYPES_MARKER,
    body: renderThemeArchetypes(themes),
    file: 'sarak-ui/GUIA-FRONTEND.md',
});

const updateThemeArchetypeOutput = (outputs) => {
    const guide = outputs.get(GUIDE);
    if (!guide) throw new Error('[guide] saída do guia ausente no kit gerado.');
    outputs.set(GUIDE, injectThemeArchetypes(guide));
};

const relative = (file) => path.relative(ROOT, file).split(path.sep).join('/');

const staleFiles = (outputs) =>
    [...outputs.entries()]
        .filter(([file, content]) => !fs.existsSync(file) || fs.readFileSync(file, 'utf-8') !== content)
        .map(([file]) => relative(file));

const runCheck = (outputs) => {
    const stale = staleFiles(outputs);
    if (stale.length > 0) {
        console.error(`[guide:check] kit do consumidor DEFASADO em ${stale.length} arquivo(s):`);
        for (const file of stale) console.error(`  - ${file}`);
        console.error('Rode `npm run guide` e commite o resultado.');
        process.exit(1);
    }
    console.log(`[guide:check] kit em dia (${outputs.size} arquivos).`);
};

const runWrite = ({ outputs, catalog, kitHash }) => {
    for (const [file, content] of outputs.entries()) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
    }
    console.log(
        `[guide] sarak-ui/ gerado — ${Object.keys(catalog.components).length} componentes, ` +
            `${catalog.designTokens.count} tokens de tema, ${catalog.tokens.iconNames.length} ícones (kitHash ${kitHash}).`,
    );
};

const main = () => {
    const isCheck = process.argv.includes('--check');
    let plan;
    try {
        plan = buildKitOutputs();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
    updateThemeArchetypeOutput(plan.outputs);
    if (isCheck) runCheck(plan.outputs);
    else runWrite(plan);
};

if (path.resolve(process.argv[1] || '') === path.resolve(fileURLToPath(import.meta.url))) main();
