/**
 * Renderiza o APÊNDICE GERADO do `GUIA-MANUTENCAO.md` (Spec 14 §3).
 *
 * Regra igual à do kit do consumidor: a prosa do guia descreve FLUXOS e aponta para
 * aqui; aqui não há uma linha escrita à mão — tudo vem do `state.json`. Listas longas
 * (os 81 nomes públicos, os 28 arquivos de schema) ficam no JSON; o apêndice dá o
 * índice legível.
 */

const tabela = (cabecalho, linhas) => [
    `| ${cabecalho.join(' | ')} |`,
    `| ${cabecalho.map(() => '---').join(' | ')} |`,
    ...linhas,
];

const renderDesign = (design) => [
    '### B.1 Design — as fontes que a paridade cruza',
    '',
    `\`MASTER_DESIGN_MAP\` v${design.masterMapVersion} · **${design.schemaFiles.count} arquivos de schema** ` +
        '(lista completa em `state.json` → `design.schemaFiles.files`).',
    '',
    ...tabela(
        ['Fonte', 'Medida', 'Valor'],
        [
            `| \`catalog/theme_table_mapping.json\` | colunas | ${design.tokens.mapeamento.colunas} |`,
            `| \`catalog/theme_table_mapping.json\` | entradas brutas | ${design.tokens.mapeamento.entradasBrutas} |`,
            `| \`catalog/theme_table_mapping.json\` | **ids únicos** | **${design.tokens.mapeamento.idsUnicos}** |`,
            `| \`catalog/partitions/\` | arquivos | ${design.tokens.particoes.arquivos} |`,
            `| \`catalog/partitions/\` | tokens | ${design.tokens.particoes.tokens} |`,
            `| \`SarakDesignTokens\` (tipo público) | ids | ${design.tokens.tipoPublico.ids} |`,
            `| \`SarakDesignTokens\` (tipo público) | responsivos | ${design.tokens.tipoPublico.responsivos} |`,
        ],
    ),
    '',
    `> ${design.tokens.nota}`,
    '',
];

const renderComponentes = (componentes) => [
    '### B.2 Componentes',
    '',
    `**Categorias atômicas (${componentes.categoriasAtomicas.length})** — ` +
        componentes.categoriasAtomicas.map((c) => `\`${c}\``).join(' · '),
    '',
    `**Categorias de engine (${componentes.categoriasDeEngine.length})** — ` +
        componentes.categoriasDeEngine.map((c) => `\`${c}\``).join(' · '),
    '',
    `**Componentes públicos: ${componentes.publicos.count}** — é o número que o \`barrel:check\` cobra. ` +
        'A lista completa está em `state.json` → `componentes.publicos.nomes`.',
    '',
];

const renderGates = (state) => [
    `### B.3 Gates registrados (${state.gates.length})`,
    '',
    ...tabela(
        ['Comando', 'O que roda'],
        state.gates.map((gate) => `| \`${gate.nome}\` | \`${gate.comando}\` |`),
    ),
    '',
    `**Auditores agregados por \`run_audit.mjs\` (${state.auditores.length}):** ` +
        state.auditores.map((a) => `\`${a}\``).join(' · '),
    '',
    '> A suíte (`npx vitest run`) **não é um script do `package.json`** e por isso não aparece na ' +
        'tabela acima — ela é invocada direto. Ver o guia, §6.',
    '',
];

const renderBaseline = (baseline) => [
    `### B.4 Baseline dos auditores (medido em ${baseline.medidoEm})`,
    '',
    `> ${baseline._leitura}`,
    '',
    ...tabela(
        ['Auditor', 'Métrica', 'Máximo tolerado'],
        Object.entries(baseline.metricas).flatMap(([auditor, metricas]) =>
            Object.entries(metricas).map(([nome, valor]) => `| \`${auditor}\` | ${nome} | **${valor}** |`),
        ),
    ),
    '',
    `\`npx tsc --noEmit\`: **${baseline.tsc.erros} erros** tolerados — não é gate hoje.`,
    '',
    'Fonte: `.githooks/audit-baseline.json`. **Não edite à mão** — o número muda com ' +
        '`npm run audit:baseline`, no mesmo commit do conserto que o justificou.',
    '',
];

const renderBase = (base) => [
    '### B.5 A base de specs',
    '',
    `**ADR (${base.adr.length})** — decisões imutáveis: ` + base.adr.map((f) => `\`${f}\``).join(' · '),
    '',
    `**Arquitetura (${base.arquitetura.length})** — visão macro viva: ` +
        base.arquitetura.map((f) => `\`${f}\``).join(' · '),
    '',
    `**Specs (${base.specs.length})** — feature e regra: ` + base.specs.map((f) => `\`${f}\``).join(' · '),
    '',
];

export const renderDevAppendix = (state) =>
    [
        '## Apêndice B — Estado deste repositório (GERADO)',
        '',
        '> **Não edite esta seção à mão.** Ela é regenerada por `npm run dev-kit` a partir do próprio ' +
            `repositório (\`${state.lib.name}\` v${state.lib.version}); o gate \`npm run dev-kit:check\` ` +
            'derruba se ficar defasada. A fonte de máquina equivalente é o `state.json` ao lado deste arquivo.',
        '',
        ...renderDesign(state.design),
        ...renderComponentes(state.componentes),
        ...renderGates(state),
        ...renderBaseline(state.baseline),
        ...renderBase(state.base),
    ].join('\n');
