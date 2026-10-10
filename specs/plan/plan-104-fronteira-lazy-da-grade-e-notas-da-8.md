---
tipo: "plan"
titulo: "Fechar a fronteira lazy da grade e as notas de migracao da 8.0.0"
objetivo: "Fazer o SarakDataTable e o SarakDataGrid sairem do chunk de abertura do barril e deixar docs/migracoes.md com toda nota da 8.0.0 dentro da entrada ancorada e classificada"
dominio: "Superficie publica / Empacotamento / Release"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "barril", "lazy", "bundle", "migracao", "release"]
relacionados: ["[[03-superficie-publica]]", "[[03-versionamento-e-release]]", "[[05-build-e-distribuicao]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

O `dist/index.js` deixa de carregar a implementação da grade virtualizada (e o `@tanstack/react-virtual`) na
abertura do barril, e `docs/migracoes.md` passa a ter **toda** nota da próxima MAJOR dentro da entrada
`## 8.0.0`, cada uma com a linha `Classificação:`.

# 2. Contexto

**A fronteira lazy declarada em [[03-superficie-publica]] §7.1 não existe no pacote.** Medido em 2026-10-10 no
`dist/` do `HEAD`:

- `src/components/atomic/DataDisplay/SarakDataTable/index.ts:13` e `SarakDataGrid/index.ts:16` exportam, além do
  `lazy(() => import(...))`, a implementação **como valor** (`SarakDataTableImpl`, `SarakDataGridImpl`). O barril
  público (`src/index.ts`, `export *` de `DataDisplay`) leva os dois nomes adiante.
- Com isso o esbuild põe a implementação inteira num chunk carregado pelo `dist/index.js` na abertura
  (`chunk-VJS5Y2CB.js`, 15 KB, importa `@tanstack/react-virtual`); os chunks "lazy" `SarakDataTableImpl-*.js`
  e `SarakDataGridImpl-*.js` têm 146 e 57 bytes e só reexportam esse chunk.
- Quem importa o `Impl` hoje: só os testes (`SarakDataTable/__tests__/SarakDataTableImpl.test.tsx` e
  `SarakDataGrid/__tests__/SarakDataGridImpl.test.tsx` importam do arquivo; `DataDisplay/__tests__/SarakDataGrid.test.tsx`
  importa `SarakDataGridImpl` **pelo índice**). O próprio comentário dos índices diz que o export existe "para
  teste direto".
- Remover os dois nomes do barril é **MAJOR**. A próxima versão já é MAJOR (8.0.0, 22 nomes removidos), e é o
  único momento em que isso não custa uma MAJOR própria.
- O `SarakDataTable` é um `React.lazy` cru: exige `<Suspense>` de quem o usa, enquanto os outros motores lazy da lib
  embutem o `Suspense`. A §6.3.1 não avisa.

**`docs/migracoes.md` tem três notas fora do lugar e uma sem classificação** (medido em 2026-10-10):

- As entradas das linhas 8 ("A superfície de cartão…"), 24 ("O motor de gráficos…") e 45 ("O `SarakKanban`…")
  dizem "MAJOR (sai na 8.0.0)" mas estão **acima** da âncora `## 8.0.0 — um cromo por aplicação` (linha 64), como
  `##` próprias. O leitor do `sarak-ui update` (`bin/scaffold/checkUpdate/migrationNotes.mjs`) separa entradas por
  `\n---\n` e corta pela âncora que cita a versão instalada: depois do release, quem estiver na 8.x verá as três
  de novo, como se fossem posteriores à 8.0.0.
- A entrada "A persistência do tema ativo restaura também o id" (linha 218) é a única nota nova desde a `v7.0.0`
  **sem** `Classificação:` — e traz mudança de tipo quebrante (`deleteTheme` obrigatório no contexto, `customThemes`
  de `unknown[]` para `SarakThemeEntry[]`).
- Dois subtítulos da seção 8.0.0 citam plan (`(plan-97)`, `(plan-91)`) — o leitor é o consumidor, para quem o
  número de plan não significa nada.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/DataDisplay/SarakDataTable/index.ts` e `SarakDataGrid/index.ts` — deixam de exportar o `Impl` como valor (os tipos continuam).
- `src/components/atomic/DataDisplay/__tests__/SarakDataGrid.test.tsx` e os testes de `SarakDataTable/__tests__/`, `SarakDataGrid/__tests__/` — importam o `Impl` do arquivo dele.
- Teste novo que prova a fronteira (§5, passo 3).
- `docs/migracoes.md` — só a seção da 8.0.0, as três notas de cima e a nota da persistência.
- Artefatos regenerados (`npm run catalog`, `npm run guide`, `npm run build`).

## 3.2 Fora
- Qualquer outro motor lazy, o `SarakKanban`, o `SarakTable` (que é outro componente).
- Embutir `Suspense` no `SarakDataTable` — é mudança de comportamento; aqui só se **documenta** a exigência (§8).
- `package.json` (as peers e a flag `--external` não mudam), qualquer spec em `specs/`.
- Notas de versões anteriores à 8.0.0 em `docs/migracoes.md`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/03-superficie-publica.md` §7 e §7.1 | a fronteira medida e o que conta como eager |
| Spec fixa | `specs/03-versionamento-e-release.md` §3 e §5 | nível do bump e a âncora de migração |
| Spec fixa | `arquitetura/05-build-e-distribuicao.md` §2.1 | "meça o `dist/`, não a flag" |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | o teste da fronteira |
| **Skill** | `ui-refatorar-componente` | remoção de nome público sem quebrar o barril/catálogo |
| Código | `src/components/atomic/DataDisplay/SarakDataTable/index.ts`, `src/components/atomic/DataDisplay/SarakDataGrid/index.ts`, `src/index.ts` | o export a remover |
| Código | `bin/scaffold/checkUpdate/migrationNotes.mjs` | como o leitor corta as notas |
| Código | `gates/scripts/release/` (`migration-anchor`, `minor-no-removal`) | o que os gates de release conferem |

# 5. Instruções de execução

1. Remover o export de valor do `Impl` nos dois índices; ajustar os testes para importar do arquivo da implementação. Os tipos públicos (`SarakDataTableProps`, `SarakDataTableRowHeight`, `SarakDataGridProps`) continuam no barril.
2. `npm run build` e medir: nenhum chunk importado estaticamente por `dist/index.js` contém `@tanstack/react-virtual`.
3. Escrever um teste que **falhe no código atual** e prove a fronteira pelo artefato ou pela fonte — por exemplo, que `SarakDataTableImpl`/`SarakDataGridImpl` não são nomes do barril e que a implementação só é alcançada por `import()` dinâmico. A forma é do executor; o caso que falha hoje é obrigatório.
4. Em `docs/migracoes.md`: levar as três notas de cima para dentro da entrada `## 8.0.0` como subseções `###` (sem separador `---` entre elas e a âncora); dar `Classificação:` à nota da persistência e decidir, com o motivo na resposta, se ela entra na 8.0.0 (o tipo mudou depois da `v7.0.0`, então entra); acrescentar a subseção da remoção dos dois `Impl`, com o que o consumidor troca; tirar `(plan-NN)` dos subtítulos.
5. Regenerar catálogo e kit (`npm run catalog && npm run guide`) e o build.
6. Rodar a verificação da §7 inteira.

# 6. Critérios de aceite

- [ ] `SarakDataTableImpl` e `SarakDataGridImpl` não aparecem em `dist/index.d.ts`; os três tipos continuam.
- [ ] Nenhum chunk importado estaticamente por `dist/index.js` contém `@tanstack/react-virtual`; o chunk lazy de cada componente traz a implementação.
- [ ] Teste novo que falha no `HEAD` anterior e passa depois.
- [ ] `docs/migracoes.md`: nenhuma entrada `##` acima da âncora `## 8.0.0` fala da 8.0.0; toda subseção da 8.0.0 tem `Classificação:`; existe a nota da remoção dos dois `Impl`; nenhum subtítulo cita plan.
- [ ] Simulação do leitor: `extractMigrationNotes({ migracoesText, installedMajor: 8 })` (`bin/scaffold/checkUpdate/migrationNotes.mjs`) devolve `bounded: true` e `notes` vazio.
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; catálogo, kit e barril em dia.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — o invariante (a implementação não sai eager) é deste módulo e fica no teste do passo 3.

- `git diff --stat` → só os arquivos da §3.1 e os gerados.
- `for c in $(grep -oE 'chunk-[A-Z0-9]+\.js' dist/index.js | sort -u); do grep -l react-virtual dist/$c; done` → vazio.
- `grep -c "SarakDataTableImpl\|SarakDataGridImpl" dist/index.d.ts` → 0.
- Mutação: devolver o export de valor num índice → o teste do passo 3 falha.
- `node --input-type=module -e` chamando `extractMigrationNotes({ migracoesText, installedMajor: 8 })` com o texto de `docs/migracoes.md` → `{ bounded: true, notes: [] }`.
- `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline` · `npm run barrel:check` · `catalog:check` · `guide:check` · `dev-kit:check`.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md`

Texto para a §6.3.1, no item do `SarakDataTable`, pronto para transporte:

> O `SarakDataTable` e o `SarakDataGrid` são carregados sob demanda e **exigem um `<Suspense>`** de quem os usa;
> a implementação não é nome público.

E na §7.1: a linha das duas grades passa a valer como medida (sem nota de exceção).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

### Execução — 2026-10-10

**Implementado:** removidos os exports de valor `SarakDataTableImpl` e `SarakDataGridImpl`, preservados os três tipos públicos e ajustado o teste da grade para importar a implementação diretamente. Adicionado teste da fronteira lazy. A anotação genérica de `SarakDataTable` mantém a forma `lazy(() => import(...))`, reconhecida pelo gerador de responsividade do kit. `docs/migracoes.md` agora concentra e classifica as notas da 8.0.0, inclui a migração dos dois nomes removidos e a exigência de `<Suspense>`; as cópias do catálogo e do kit foram regeneradas.

**Validações aprovadas:** `npm run catalog`, `npm run guide`, `npm run build:js`, `npx tsc --noEmit`, `npm run audit:baseline`, `npm run barrel:check`, `npm run catalog:check`, `npm run guide:check` e `npm run public-types:check`. O teste novo passou isoladamente; sua mutação falhou ao restaurar temporariamente os exports antigos, e os dois índices foram restaurados byte a byte. `scripts/consumer-kit/__tests__/kitGenerator.test.mjs` passou (14/14) após a correção. Medição final: nenhum arquivo no grafo estático de `dist/index.js` contém `@tanstack/react-virtual`; os dois chunks lazy incluem a dependência e suas implementações. `dist/index.d.ts` não contém os nomes `Impl` e conserva `SarakDataTableProps`, `SarakDataTableRowHeight` e `SarakDataGridProps`. O leitor de migrações para major 8 retornou `{ bounded: true, notes: [] }`; as subseções da 8.0.0 estão classificadas, sem títulos com `plan-NN` ou notas major fora da âncora.

**Validações pendentes:** `npm run build` chegou aos gates e à geração JS/DTS, mas parou em `build:css`: `@tailwindcss/cli` não está disponível localmente e o registry npm respondeu `ENOTFOUND`. A suíte completa terminou com 420 arquivos aprovados, 7 falhos, 12 testes falhos, 3 ignorados e 7 erros de worker; incluiu falhas de timeout/EPERM de symlink no ambiente Windows. Um dos testes falhos apontou a regressão de responsividade descrita acima; ela foi corrigida e o arquivo de teste do kit passou isoladamente, mas a suíte completa não foi repetida. `npm run dev-kit:check` continua apontando os três arquivos do kit do mantenedor (`sarak-dev/state.json`, `sarak-dev/GUIA-MANUTENCAO.md`, `sarak-dev/START-HERE.md`) como defasados; estão fora do escopo e não foram alterados.

**Preservação:** nenhuma edição preexistente do revisor em `specs/` foi revertida, formatada ou usada para limpeza; nenhum commit foi criado.

### Complemento — 2026-10-10

Após o `build:js --clean`, a ausência da CLI Tailwind também havia deixado os CSS de `dist/` removidos. Para não deixar o pacote parcial, gerei `dist/sarak.css` com o `@tailwindcss/node` e o scanner `@tailwindcss/oxide` já instalados (Tailwind 4.3.0), usando a fonte explícita equivalente `src/**/*.{ts,tsx}`. Em seguida passaram `build:css:scoped`, `copy-base-css.mjs`, `inject-css.mjs` e `generate-build-info.mjs`; os arquivos CSS rastreados estão presentes novamente. A chamada convencional `npm run build` continua sem confirmação de sucesso porque `npx @tailwindcss/cli` não consegue acessar o registry.

### Verificação final — 2026-10-10

O teste de fronteira foi reforçado para verificar os nomes do barril e as duas chamadas `lazy(() => import(...))`; passou (2/2). `npx tsc --noEmit` passou novamente. Ao repetir a mutação com o teste final, a reexportação antiga fez o teste de privacidade falhar, enquanto o teste das chamadas lazy passou; os índices foram restaurados byte a byte.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-10 — 🔴 Reprovado

**Verificado e aprovado nesta rodada:** o diff de `src/` (os dois índices sem o `Impl` como valor, os tipos públicos mantidos, o genérico do `SarakDataTable` preservado pela anotação), o teste `SarakDataLazyBoundary.test.ts`, `tsc` 0, `audit:baseline` igual ao baseline, `barrel:check` (102 componentes, 0 faltas), `catalog:check`, `guide:check`, `public-types:check`. **`dist/`:** o `dist/sarak.css` gerado pelo caminho alternativo (`@tailwindcss/node` com varredura própria) **diferia** do oficial (194.386 × 193.962 bytes); o revisor rodou o `npm run build` oficial nesta revisão (com rede), e o `dist/` do worktree é agora o do script. Nele: nenhum chunk importado estaticamente por `dist/index.js` contém `@tanstack/react-virtual`; `SarakDataTableImpl-*.js` tem 12,5 KB; `index.d.ts` sem os dois nomes e com os três tipos. `minor-no-removal:check` acusa a remoção, como esperado de uma MAJOR.

**Achados:**

1. `docs/migracoes.md:188` — há um separador `---` **dentro** da entrada `## 8.0.0`, entre "Os templates deixam rede…" e "Largura máxima e densidade…". O leitor (`bin/scaffold/checkUpdate/migrationNotes.mjs`, `ENTRY_SEPARATOR`) corta a entrada ali e descarta o bloco seguinte, que não começa com `## `. Medido: `extractMigrationNotes({ migracoesText, installedMajor: 7 })` devolve **uma** nota cujo último subtítulo é "Os templates deixam rede, domínio e fluxo de autenticação ao consumidor" — somem de quem atualiza da 7.x as subseções Largura máxima, Vista dividida, Exibição de dados, A cor do texto principal, O `SarakInput`…, **A persistência do tema ativo** e **As implementações de SarakDataTable e SarakDataGrid deixam de ser públicas**, as duas últimas movidas por esta execução. Viola o passo 4 da §5 ("sem separador `---` entre elas e a âncora") e o critério "toda nota da 8.0.0 dentro da entrada ancorada". A verificação feita só com `installedMajor: 8` não alcança esse caso.
2. `sarak-dev/` defasado — `npm run dev-kit:check` pede regeneração (contagens de teste desta execução e das duas tarefas diretas ao lado). É artefato gerado, e o commit o exige: regenerar com `npm run dev-kit`.

**Suíte completa:** em execução no momento deste veredito; resultado anexado na rodada seguinte.

### Correção dos achados — 2026-10-10

**Resultado:** corrigidos exclusivamente os dois achados numerados no veredito desta data. Removido o separador interno da entrada 8.0.0 em `docs/migracoes.md`; a documentação foi sincronizada em `sarak-ui/docs/migracoes.md`. Os três artefatos pedidos pelo revisor foram regenerados por `npm run dev-kit`.

**Estado do worktree ao iniciar esta correção (`git status --short`):**

```text
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-NJSGHLWW.js
 D dist/SarakChartEngine-AXGKUJIK.js
 D dist/SarakChatEngine-5X5FENIP.js
 D dist/SarakDataGridImpl-7Q5IUISS.js
 D dist/SarakDataTableImpl-RWEW5T5H.js
 D dist/SarakFlowEngine-FUQGNSNK.js
 D dist/SarakKanbanImpl-EUWF3PMA.js
 D dist/SarakMarkdownRendererImpl-KYVCAFXX.js
 D dist/SarakPDFViewerImpl-FY3ANYIB.js
 D dist/chunk-2AM3EPOL.js
 D dist/chunk-4PQYTYA3.js
 D dist/chunk-5BKKEEHI.js
 D dist/chunk-7UU3QZ36.js
 D dist/chunk-FHXTXLMM.js
 D dist/chunk-FQADMIWL.js
 D dist/chunk-HPXFN247.js
 D dist/chunk-VJS5Y2CB.js
 D dist/chunk-YQ4Q42OE.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M dist/sarak-scoped.css
 M dist/sarak.css
 M docs/component-catalog.json
 M docs/component-catalog.md
 M docs/migracoes.md
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M sarak-ui/docs/migracoes.md
M  specs/00-backlog.md
M  specs/00-contexto.md
MM specs/00-indice.md
M  specs/adr/019-arrastar-e-soltar-do-kanban.md
M  specs/arquitetura/02-design-engine.md
M  specs/arquitetura/03-superficie-publica.md
M  specs/arquitetura/05-build-e-distribuicao.md
AM specs/plan/plan-104-fronteira-lazy-da-grade-e-notas-da-8.md
A  specs/plan/plan-105-rotulo-dos-campos-e-textos-traduzidos.md
A  specs/plan/plan-106-controle-do-host-sobre-as-preferencias.md
A  specs/plan/plan-107-toque-e-entrada-no-celular.md
A  specs/plan/plan-108-dado-e-status-que-nao-somem.md
A  specs/plan/plan-109-navegacao-na-base-do-celular.md
M  specs/specs/00-regras-e-invariantes.md
M  specs/specs/01-gates-e-baseline.md
M  specs/specs/02-enforcement-por-commit.md
M  specs/specs/03-versionamento-e-release.md
M  specs/specs/05-cromo-e-slots.md
M  specs/specs/06-painel-de-customizacao-e-preview.md
M  specs/specs/07-responsividade-e-multidispositivo.md
M  specs/specs/08-identidade-do-host-e-zero-marca.md
M  specs/specs/09-temas-e-presets.md
M  specs/specs/15-divida-conhecida.md
M  specs/specs/16-integracao-continua.md
 M src/buildInfo.ts
 M src/components/atomic/DataDisplay/SarakDataGrid/index.ts
 M src/components/atomic/DataDisplay/SarakDataTable/index.ts
 M src/components/atomic/DataDisplay/__tests__/SarakDataGrid.test.tsx
 M src/components/atomic/Templates/SarakAuthScreen.tsx
 M src/components/atomic/Templates/__tests__/SarakAuthScreen.test.tsx
 M src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl.tsx
 M src/features/DesignEngine/Main/components/ThemeActionBar.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeActionBar.test.tsx
 M src/features/DesignEngine/Panels/HyperGranularityTab.tsx
 M src/features/DesignEngine/Panels/__tests__/HyperGranularityTab.test.tsx
?? dist/CustomizationPanelImpl-Q6AA6YZY.js
?? dist/SarakChartEngine-2KZ2VLPP.js
?? dist/SarakChatEngine-AAOQLCWB.js
?? dist/SarakDataGridImpl-ZVWL5VJ6.js
?? dist/SarakDataTableImpl-SPGUHA6C.js
?? dist/SarakFlowEngine-OXIFRAGW.js
?? dist/SarakKanbanImpl-6T3YKHEZ.js
?? dist/SarakMarkdownRendererImpl-SPMDVJ3E.js
?? dist/SarakPDFViewerImpl-6MIUQICE.js
?? dist/chunk-4Y2EQXWH.js
?? dist/chunk-6W5DCUJX.js
?? dist/chunk-7UMKUGNC.js
?? dist/chunk-F6HK5323.js
?? dist/chunk-J352F6EB.js
?? dist/chunk-J4C7JUIJ.js
?? dist/chunk-WSGDL2ZQ.js
?? dist/chunk-XEFMFFAL.js
?? src/components/atomic/DataDisplay/__tests__/SarakDataLazyBoundary.test.ts
```

**Alterações desta correção:**

| Arquivo | Alteração |
|---|---|
| `docs/migracoes.md` | Removido apenas o separador `---` que truncava as notas da 8.0.0 para instalações 7.x. |
| `sarak-ui/docs/migracoes.md` | Cópia sincronizada pela geração do kit de consumidor. |
| `sarak-dev/state.json`, `sarak-dev/GUIA-MANUTENCAO.md`, `sarak-dev/START-HERE.md` | Artefatos regenerados por `npm run dev-kit`, conforme o achado 2. |

**Verificações:** `npm run guide` terminou com sucesso; `npm run dev-kit` terminou com sucesso (102 componentes públicos, 437 tokens, 30 gates); `npm run dev-kit:check` passou (3 arquivos em dia, 0 ponteiros mortos). O leitor com `installedMajor: 7` retornou a entrada 8.0.0 completa, com a última subseção `As implementações de SarakDataTable e SarakDataGrid deixam de ser públicas`; com `installedMajor: 8`, retornou `{ bounded: true, notes: [] }`. `git diff --check` não apontou erros de whitespace.

**Critérios dos achados:** (1) todas as notas destinadas a consumidores 7.x permanecem dentro da entrada ancorada `## 8.0.0`; (2) `npm run dev-kit:check` confirma os três artefatos atualizados. Ambos atendidos.

**Decisões e limites:** não foi executado `npm run build` e nenhum arquivo de `dist/` foi alterado nesta correção; o estado do `dist/` permaneceu idêntico ao capturado antes da edição. Os arquivos `SarakAuthScreen`, `ThemeActionBar`, `HyperGranularityTab` e `CustomizationPanelImpl` não foram abertos nem modificados. Alterações preexistentes do revisor em `specs/` foram preservadas. Nenhum commit foi criado. Não há pendências relativas aos dois achados corrigidos.

## Veredito — 2026-10-10 — 🟢 Aprovado

**Achados da rodada anterior, conferidos:** (1) o separador interno da entrada `## 8.0.0` saiu — `extractMigrationNotes({ migracoesText, installedMajor: 7 })` devolve a entrada inteira (17 títulos, o último "As implementações de SarakDataTable e SarakDataGrid deixam de ser públicas"); com `installedMajor: 8`, `{ bounded: true, notes: [] }`; `sarak-ui/docs/migracoes.md` idêntico ao `docs/migracoes.md`. (2) `npm run dev-kit:check` em dia (3 arquivos, 0 ponteiros mortos).

**Suíte completa:** `npx vitest run` → 434 arquivos e 2612 testes verdes, na árvore final (o aviso do mock de `sarakGetDefaultDesignState` no stderr é o item 1 do `00-backlog`, anterior a esta plan). `guide:check` e `catalog:check` em dia; o resto da verificação está no bloco anterior e não mudou (a correção tocou só `docs/migracoes.md` e os kits gerados).

**Critérios de aceite:** todos atendidos — os dois nomes fora de `dist/index.d.ts` com os três tipos mantidos; nenhum chunk estático de `dist/index.js` com `@tanstack/react-virtual` (medido no `dist/` do build oficial); teste da fronteira que falha com o export de volta; notas da 8.0.0 dentro da entrada ancorada, classificadas, sem `plan-NN` nos subtítulos; simulação do leitor; suíte, `tsc`, `audit:baseline`, catálogo, kit e barril.
