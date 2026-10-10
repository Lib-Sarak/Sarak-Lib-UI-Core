---
tipo: "plan"
titulo: "Fechar a fronteira lazy da grade e as notas de migracao da 8.0.0"
objetivo: "Fazer o SarakDataTable e o SarakDataGrid sairem do chunk de abertura do barril e deixar docs/migracoes.md com toda nota da 8.0.0 dentro da entrada ancorada e classificada"
dominio: "Superficie publica / Empacotamento / Release"
status: "🟡 Em execução"
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
