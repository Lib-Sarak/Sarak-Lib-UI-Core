/**
 * Renderiza o APÊNDICE GERADO do `GUIA-FRONTEND.md` (Spec 50 §5, última linha).
 *
 * Princípio: a prosa do guia é estável e APONTA para o gerado; este apêndice é o
 * gerado. Nada aqui é escrito à mão — tudo vem do `catalog.json` do kit, que por
 * sua vez vem do AST. Listas longas (props com tipo, todos os tokens de tema)
 * ficam no `catalog.json`; o apêndice dá o índice navegável.
 */

const CATEGORY_RE = /^src\/components\/(?:atomic\/)?([^/]+)\//;

/** Categoria = a pasta real do componente no código-fonte (não uma taxonomia à mão). */
const categoryOf = (info) => {
    if (!info.source) return 'Outros';
    const match = CATEGORY_RE.exec(info.source);
    if (!match) return 'Core';
    return match[1] === 'Layout' ? 'Layout' : match[1];
};

const groupByCategory = (components) => {
    const groups = new Map();
    for (const [name, info] of Object.entries(components)) {
        const category = categoryOf(info);
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push([name, info]);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
};

const renderComponents = (components) => {
    const lines = [
        `### A.1 Componentes públicos (${Object.keys(components).length})`,
        '',
        'Importe do barril: `import { X } from \'@sarak/lib-ui-core\'`. Os TIPOS de cada prop, com ' +
            'descrição, estão em `catalog.json` → `components.<Nome>.props` (e em `docs/component-catalog.md`).',
        '',
        '| Categoria | Componente | Props |',
        '| --- | --- | --- |',
    ];
    for (const [category, entries] of groupByCategory(components)) {
        for (const [name, info] of entries) {
            const props = (info.props ?? []).map((prop) => `\`${prop.name}\``).join(' · ');
            lines.push(`| ${category} | **${name}** | ${props || '_ver arquivo do componente_'} |`);
        }
    }
    return [...lines, ''];
};

const renderResponsive = (responsive) => [
    '### A.2 Contrato de responsividade (gerado do uso real)',
    '',
    `Breakpoints canônicos: **celular** < ${responsive.breakpoints.BREAKPOINT_TABLET}px · ` +
        `**tablet** ${responsive.breakpoints.BREAKPOINT_TABLET}–${responsive.breakpoints.BREAKPOINT_DESKTOP - 1}px · ` +
        `**desktop** ≥ ${responsive.breakpoints.BREAKPOINT_DESKTOP}px.`,
    '',
    '**Adaptam sozinhos** (leem o dispositivo no próprio código — você não escreve CSS nem media query):',
    '',
    responsive.autoAdapting.map((name) => `\`${name}\``).join(' · ') || '_nenhum_',
    '',
    `**Refino opcional por dispositivo** (\`SarakResponsiveValue<T>\` = \`{ mob, tab, desk }\`) — ${responsive.responsiveProps.length} props:`,
    '',
    '| Componente | Prop |',
    '| --- | --- |',
    ...responsive.responsiveProps.map((item) => `| \`${item.component}\` | \`${item.prop}\` |`),
    '',
];

const renderChromeSlots = (slots) => [
    `### A.3 Slots do \`SarakAppChrome\` (${slots.length})`,
    '',
    'Regiões do cromo que aceitam qualquer `ReactNode` (imagem, vídeo, componente animado).',
    '',
    '| Slot | O que é |',
    '| --- | --- |',
    ...slots.map((slot) => `| \`${slot.slot}\` | ${slot.doc || ''} |`),
    '',
];

const renderTokens = (catalog) => [
    '### A.4 Tokens',
    '',
    `**Espaçamento semântico** (aceito por \`gap\`/\`padding\` das primitivas): ` +
        Object.keys(catalog.tokens.spacing).map((token) => `\`${token}\``).join(' · '),
    '',
    `**CSS Variables públicas** (${catalog.tokens.cssVars.length}) — as ÚNICAS que a central emite; ` +
        'use sempre com fallback, `var(--sarak-x, valor)`. Nome fora desta lista não pinta nada:',
    '',
    catalog.tokens.cssVars.map((cssVar) => `\`${cssVar}\``).join(' · '),
    '',
    `**Tokens de TEMA** (${catalog.designTokens.count} chaves válidas de \`design\` num tema JSON) — ` +
        'lista completa com tipo em `catalog.json` → `designTokens.ids`. ' +
        `${catalog.designTokens.responsiveCapable.length} deles aceitam \`SarakResponsiveValue\`.`,
    '',
    `**Temas embutidos** (${catalog.themes.presetIds.length}): ` +
        catalog.themes.presetIds.map((id) => `\`${id}\``).join(' · '),
    '',
    `**Par de referência** (parta destes — completos em todos os eixos): ` +
        catalog.themes.referenceThemeIds.map((id) => `\`${id}\``).join(' · '),
    '',
];

const KIND_LABEL = { aesthetic: 'estético', functional: 'funcional' };

const escapeCell = (text) => String(text).replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');

/**
 * O mapa dos tokens, por pilar (grupo do schema): só o que o schema já documentou (`kind`, `modeDependent`,
 * `usage`). Token ainda sem documentação não aparece aqui — o gate `token-docs:check` mantém a lista do que falta.
 */
const renderTokenMap = (designTokens) => {
    const documented = designTokens.ids.filter((token) => token.usage);
    const lines = [
        '### A.4b Mapa dos tokens por pilar (gerado do schema)',
        '',
        `**${documented.length}** de ${designTokens.count} tokens já trazem o que mudam na tela. ` +
            '**Estético** = o tema o projeta; **funcional** = igual em todo tema (camadas, alvo de toque, larguras do cromo, ' +
            'comportamento) e o tema embarcado não o declara. **Modo** = o valor muda no modo claro/escuro, então entra na ' +
            '`contraparte` do tema. Opções e faixas ficam em `catalog.json` → `designTokens.ids`.',
        '',
    ];
    for (const [group, label] of Object.entries(designTokens.groups)) {
        const rows = documented.filter((token) => token.group === group);
        if (rows.length === 0) continue;
        lines.push(`#### ${label} (\`${group}\`)`, '', '| Token | Natureza | Modo | O que muda | Depende de |', '| --- | --- | --- | --- | --- |');
        for (const token of rows) {
            const needs = (token.interactsWith ?? []).map((id) => `\`${id}\``).join(' · ') || '—';
            const modeCell = token.modeDependent ? 'sim' : 'não';
            lines.push(
                `| \`${token.id}\` | ${KIND_LABEL[token.kind] ?? '—'} | ${modeCell} | ${escapeCell(token.usage)} | ${needs} |`,
            );
        }
        lines.push('');
    }
    return lines;
};

const renderIcons = (iconNames) => [
    `### A.5 Ícones (${iconNames.length} nomes válidos)`,
    '',
    'Valores aceitos por `<SarakIcon name>`, `navItems[].icon` e `mapping.icon`. O nome é o mesmo nas ' +
        'três famílias (`lucide`/`phosphor`/`tabler`). Nome fora da lista → `console.warn` + ícone de alerta.',
    '',
    iconNames.map((name) => `\`${name}\``).join(' · '),
    '',
];

const renderDocs = (docs) => [
    '### A.6 Guias que viajam no pacote',
    '',
    'Aprofundamento por tema, em `node_modules/@sarak/lib-ui-core/`:',
    '',
    ...docs.map((doc) => `- \`${doc.file}\` — ${doc.title}`),
    '',
];

export const renderAppendix = (catalog) =>
    [
        '## Apêndice A — Superfície viva desta versão (GERADO)',
        '',
        '> **Não edite esta seção à mão.** Ela é regenerada por `npm run guide` a partir do código-fonte ' +
            `da \`${catalog.lib.name}\` v${catalog.lib.version}; o gate \`guide:check\` derruba o build se ficar defasada. ` +
            'A fonte de máquina equivalente é o `catalog.json` ao lado deste arquivo.',
        '',
        `Exportações do barril público: **${catalog.barrelExports.length}** nomes (componentes, tipos, hooks e helpers).`,
        '',
        ...renderComponents(catalog.components),
        ...renderResponsive(catalog.responsive),
        ...renderChromeSlots(catalog.chromeSlots),
        ...renderTokens(catalog),
        ...renderTokenMap(catalog.designTokens),
        ...renderIcons(catalog.tokens.iconNames),
        ...renderDocs(catalog.shippedDocs),
    ].join('\n');
