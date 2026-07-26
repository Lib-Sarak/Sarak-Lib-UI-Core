/**
 * Montagem do catálogo de componentes — a camada ALTA do pipeline.
 *
 * `buildCatalog()` é a fonte da verdade DERIVADA do código-fonte, consumida por
 * dois geradores: `generate-component-catalog.mjs` (docs/component-catalog.*) e
 * `generate-consumer-kit.mjs` (o `sarak-ui/catalog.json` da Spec 50). Nenhum dos
 * dois reimplementa travessia de AST — os coletores vivem em `catalogAst.mjs`.
 */

import path from 'node:path';
import { collectPublicComponentNames } from './publicComponents.mjs';
import {
    ROOT,
    buildPropsIndex,
    collectIconNames,
    collectPublicCssVars,
    collectSpacingTokens,
    collectVariantUnions,
} from './catalogAst.mjs';

export const DOCS_DIR = path.join(ROOT, 'docs');
export const JSON_OUT = path.join(DOCS_DIR, 'component-catalog.json');
export const MD_OUT = path.join(DOCS_DIR, 'component-catalog.md');

export const buildCatalog = () => {
    const propsIndex = buildPropsIndex();
    const components = {};
    for (const name of collectPublicComponentNames()) {
        const entry = propsIndex.get(`${name}Props`);
        components[name] = entry
            ? { propsInterface: `${name}Props`, source: entry.file, extends: entry.extends || undefined, props: entry.props }
            : { propsInterface: null, source: null, props: [], note: 'Props não expostas por interface nomeada — consulte o arquivo do componente.' };
    }
    return {
        $comment:
            'GERADO por scripts/generate-component-catalog.mjs — NÃO edite à mão. Regenerar: npm run catalog.',
        schemaVersion: 2,
        components,
        tokens: {
            spacing: collectSpacingTokens(),
            variants: collectVariantUnions(components),
            cssVars: collectPublicCssVars(),
            iconNames: collectIconNames(),
        },
    };
};

/** Seção "Tokens e valores permitidos" (Spec 16) — medidas de espaçamento semânticas. */
const renderTokensSection = (tokens) => {
    const lines = [
        '## Tokens e valores permitidos',
        '',
        '> Valores de espaçamento aceitos pelas primitivas estruturais (`gap`, `padding`). ' +
            'Fora desta lista, o resolutor AVISA (`console.warn` com sugestão) e cai no default do Design Engine.',
        '',
        '### Espaçamento semântico (`gap`, `padding`)',
        '',
        'Traduzidos por `resolveToken` (`core/Design/resolveToken.ts`). Qualquer comprimento CSS válido também passa direto: `16px`, `1rem`, `0`, `var(--x, 16px)`, `calc(...)`.',
        '',
        '| Token | Traduz para |',
        '| --- | --- |',
    ];
    for (const [name, value] of Object.entries(tokens.spacing)) {
        lines.push(`| \`${name}\` | \`${value}\` |`);
    }
    lines.push('', '### Variantes literais por componente', '');
    if (tokens.variants.length === 0) {
        lines.push('_Nenhuma união literal exposta pelas props._');
    } else {
        lines.push('| Componente | Prop | Valores aceitos |', '| --- | --- | --- |');
        for (const variant of tokens.variants) {
            const values = variant.values.map((value) => `\`${value}\``).join(' · ');
            lines.push(`| \`${variant.component}\` | \`${variant.prop}\` | ${values} |`);
        }
    }
    lines.push(
        '',
        '### CSS Variables públicas (namespace `--sarak-*`)',
        '',
        'Vars REAIS emitidas pelo Design Engine. Use SEMPRE com fallback — `var(--sarak-x, valor)`. Nomes fora desta lista NÃO existem e não pintam nada.',
        '',
        tokens.cssVars.map((cssVar) => `\`${cssVar}\``).join(' · '),
        '',
        `### Ícones (${tokens.iconNames.length} nomes válidos)`,
        '',
        'Valores aceitos por `<SarakIcon name>`, por `navItems[].icon` (`SarakAppChrome`/`SarakShellNav`) e por ' +
            '`mapping.icon` nos cards. O nome é o MESMO nas três famílias (`iconFamily`: `lucide` · `phosphor` · `tabler`) — ' +
            'trocar a família repinta todos os ícones sem mexer em nome nenhum.',
        '',
        'Nome fora desta lista **não renderiza o ícone pedido**: o `SarakIcon` avisa no console ' +
            '(`console.warn`, uma vez por nome) e desenha `AlertCircle` no lugar — degradação visível, nunca tela quebrada.',
        '',
        tokens.iconNames.map((name) => `\`${name}\``).join(' · '),
        '',
    );
    return lines;
};

export const renderMarkdown = (catalog) => {
    const lines = [
        '# Catálogo de Componentes — Sarak-Lib-UI-Core',
        '',
        '> **GERADO** por `scripts/generate-component-catalog.mjs` a partir do código-fonte (componentes + interfaces).',
        '> Não edite à mão — rode `npm run catalog`. O build falha se este arquivo estiver defasado.',
        '',
        ...renderTokensSection(catalog.tokens),
        `## Componentes públicos (${Object.keys(catalog.components).length})`,
        '',
    ];
    for (const [type, info] of Object.entries(catalog.components)) {
        lines.push(`### ${type}`);
        if (!info.propsInterface) {
            lines.push('', `_${info.note}_`, '');
            continue;
        }
        lines.push('', `Props (\`${info.propsInterface}\` — \`${info.source}\`):`, '');
        lines.push('| Prop | Tipo | Obrigatória | Descrição |');
        lines.push('| --- | --- | --- | --- |');
        for (const prop of info.props) {
            const type_ = prop.type.replace(/\|/g, '\\|');
            lines.push(`| \`${prop.name}\` | \`${type_}\` | ${prop.optional ? 'não' : 'sim'} | ${prop.doc || ''} |`);
        }
        if (info.extends) lines.push('', `Estende: \`${info.extends}\``);
        lines.push('');
    }
    return `${lines.join('\n')}\n`;
};
