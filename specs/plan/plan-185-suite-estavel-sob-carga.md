---
tipo: "plan"
titulo: "A suíte não cai por prazo com a máquina carregada"
objetivo: "Fazer o caminho da release valer o prazo de 30 s também para os testes que declaram prazo próprio, e tirar do prazo padrão de 5 s o teste de integração que estoura sob carga"
dominio: "Testes / Caminho da release"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc2", "testes", "release", "prazo"]
relacionados: ["[[11-testes-e-cobertura]]", "[[03-versionamento-e-release]]"]
depende_de: ""
retida_por: ""
destino_sintese: "11-testes-e-cobertura"
---

# 1. Objetivo

O `npm version` não aborta porque um teste correto passou do prazo com a máquina carregada. Um teste que trava de verdade continua
reprovando.

# 2. Contexto

- **O caminho da release:** `preversion` → `gates:full` → `coverage:release` → `gates/scripts/release/run-release-tests.mjs`. O
  script roda a suíte com `--testTimeout=30000` e `--hookTimeout=30000` (`RELEASE_TIMEOUT_MS`). O uso diário continua nos 5 s do
  `vitest.config.ts`.
- **A falha (backlog #1):** prazo declarado no próprio caso ou gancho, como `it(..., 20_000)`, `{ timeout }` e `vi.setConfig`, vence a
  flag da linha de comando. Há cerca de 40 ocorrências em 28 arquivos de teste, por exemplo `SarakQRCodeImpl.test.tsx:21-24` (gancho de
  30 s, caso de 20 s). Com a máquina carregada, o gancho do QR code estourou no caminho da rc.1.
- **A falha (backlog #5):** `src/features/DesignEngine/hooks/__tests__/configIsSavedDesign.persistenceIntegration.test.tsx`, nos casos
  das linhas 79 e 85, não declara prazo e estoura os 5 s com a máquina carregada. Ele cai no `HEAD` e, com plans em paralelo, cai de
  forma intermitente.

# 3. Escopo

## 3.1 Dentro
- Uma porta única para o prazo próprio de teste. Ela devolve o maior entre o prazo declarado e o prazo do caminho da release, que
  `run-release-tests.mjs` passa por variável de ambiente. Fora da release, vale o prazo declarado.
- Os testes de `src/` que declaram prazo próprio passam a usar a porta.
- Uma trava que reprova prazo numérico declarado fora da porta em `src/**/__tests__/**`. Ela fica num teste de
  `gates/scripts/release/__tests__/`, que o vitest já roda.
- `configIsSavedDesign.persistenceIntegration.test.tsx`: medir quanto os casos levam isolados.
  - Se a demora vier do teste (montagem repetida, espera fixa), corrija no teste.
  - Se o custo for real, declare o prazo pela porta.
- `run-release-tests.mjs` e o teste dele.

## 3.2 Fora
- O `vitest.config.ts`: o prazo padrão de 5 s e o `maxWorkers` não mudam.
- Código de produção.
- **A `plan-186` corre em paralelo.** Fique fora de `SarakButton`, `SarakSearchCard`, `ResponsiveSliderControl` e do cromo da barra do
  topo. A `plan-187` também corre em paralelo: fique fora de `src/styles/_print.css`, da `SarakDataTable` e da `SarakDataGrid`.
  Esta plan não roda build.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | o teto de contenção e os prazos |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | o `preversion` |
| Código | `gates/scripts/release/run-release-tests.mjs` | o prazo da release e os limites declarados |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |

# 5. Instruções de execução

1. **Falha antes:** um teste em `gates/scripts/release/__tests__/` mostra que um caso com prazo próprio de 20 s ignora o prazo da
   release. Use um caso sintético que dure mais que o prazo declarado e menos que 30 s. O teste tem de falhar hoje.
2. **A porta e a trava** (§3.1). Migre as ocorrências e registre no resumo a contagem de antes e de depois.
3. **O backlog #5:** registre a medida dos dois casos isolados e diga qual dos dois caminhos da §3.1 foi o escolhido.
4. **Verificação do executor:**
   - `npx vitest run gates/scripts/release` e os arquivos de teste migrados;
   - `npm run verify -- --tier=quick`.

# 6. Critérios de aceite

- [ ] O teste do passo 1 falhava antes e passa depois.
- [ ] Nenhum prazo numérico declarado fora da porta em `src/**/__tests__/**`; a trava prova isso.
- [ ] Os dois casos do `configIsSavedDesign` passam isolados e no filtro de `src/features/DesignEngine/hooks`, com a medida no resumo.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** a trava de prazo fora da porta.

O revisor não repete os comandos do executor. Ele confere:
- o diff;
- **mutação, em cópia:**
  - um `it(..., 20_000)` literal num teste de `src/` → a trava reprova;
  - a porta devolvendo só o prazo declarado → o teste do passo 1 reprova.

# 8. Destino da síntese

**Destino:** `11-testes-e-cobertura`. Texto para transporte:

> Teste que declara prazo próprio usa a porta do prazo. No caminho da release, ela devolve o maior entre o prazo declarado e o da
> release (30 s). Prazo literal fora dela é reprovado pela trava.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-27

**Resultado:** Concluído com pendências (um check do `verify quick` não pôde rodar, ver Pendências)

**Estado do worktree ao iniciar**
```
 M dist/... (build anterior; só dist)
 M specs/00-backlog.md
 M specs/00-indice.md
 M specs/specs/00-regras-e-invariantes.md
 M src/buildInfo.ts
 M src/core/Provider/buildInfo.ts
?? specs/plan/plan-185-suite-estavel-sob-carga.md
?? specs/plan/plan-186-quatro-defeitos-de-componente.md
```

**O que foi feito**
- Porta `prazoDeTeste(declaredMs, env)` em `src/shared/testing/prazoDeTeste.ts`: devolve o maior entre o declarado e `RELEASE_TEST_TIMEOUT_MS`; sem a variável, o declarado.
- `run-release-tests.mjs`: exporta `RELEASE_TIMEOUT_ENV` e passa `RELEASE_TEST_TIMEOUT_MS=30000` ao vitest filho; limite declarado 2 atualizado.
- Trava `gates/scripts/release/find-own-timeouts.mjs` (AST do TypeScript): reprova prazo numérico (literal, constante literal, aritmética de literais) como último argumento ou `{ timeout }` de it/test/describe/ganchos (inclui `it.each(...)(...)`) e em `vi.setConfig({ testTimeout|hookTimeout })`. `waitFor`/`findBy*` ficam fora.
- Migração: 32 arquivos de teste de `src/` passam a usar a porta. Contagem **antes: 55 ocorrências em 32 arquivos; depois: 0** (a trava varre a árvore e prova).
- Backlog #5 (`configIsSavedDesign.persistenceIntegration.test.tsx`): isolados, os dois casos levam **3708 ms (linha 79) e 2968 ms (linha 85)**; o terceiro, 1046 ms. Cada caso monta o Provider duas vezes (hub e controle), então o custo é real, não montagem repetida nem espera fixa. Caminho escolhido: **declarar o prazo pela porta** (`describe(..., { timeout: prazoDeTeste(30_000) })`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/shared/testing/prazoDeTeste.ts` | criado | a porta |
| `src/shared/testing/__tests__/prazoDeTeste.test.ts` | criado | teste da porta (cobertura 1:1) |
| `gates/scripts/release/find-own-timeouts.mjs` | criado | scanner da trava |
| `gates/scripts/release/run-release-tests.mjs` | alterado | variável de ambiente ao filho |
| `gates/scripts/release/__tests__/run-release-tests.test.mjs` | alterado | passo 1 (literal reprova × porta passa) e a trava |
| 33 arquivos `src/**/__tests__/*.test.ts(x)` | alterado | prazo próprio passa pela porta (inclui o `configIsSavedDesign`) |

**Verificações executadas**
- Passo 1: caso sintético que dura 1200 ms, prazo declarado 300 ms, release 5000 ms. Com literal `300`, o vitest sai com código ≠ 0 (reprova — o comportamento antigo); com `prazoDeTeste(300)` passa. Está em `run-release-tests.test.mjs`.
- `npx vitest run gates/scripts/release src/shared/testing` → 5 arquivos, 28 testes passam (rodada final).
- `npx vitest run` dos 34 arquivos migrados → 34 arquivos, 779 testes passam.
- `npx vitest run src/features/DesignEngine/hooks` → 18 arquivos, 84 testes passam.
- `npm run verify -- --tier=quick`: tudo OK exceto `zero-brand:check` (corrigido: renomeei a variável de `SARAK_…` para `RELEASE_TEST_TIMEOUT_MS`; reexecutei só esse check → verde) e `kit-names:check` (ver Pendências). Anel 0: 0 achado.

**Critérios de aceite**
- [x] Passo 1 falha antes e passa depois — `run-release-tests.test.mjs`, casos "literal reprova" e "porta passa".
- [x] Nenhum prazo numérico fora da porta em `src/**/__tests__/**` — teste "nenhum teste de src/ declara prazo fora da porta".
- [x] Dois casos do `configIsSavedDesign` passam isolados e no filtro `src/features/DesignEngine/hooks`, medidas acima.
- [x] `git diff --stat` só em caminhos da §3.1 — as demais modificações do worktree (SarakButton, SarakSearchCard, tabela, Topbar, `_print.css`, browser-tests) são de plans 186-188 em paralelo.

**Decisões e suposições**
- A porta mora em `src/shared/testing/` (fora do barril); `RELEASE_TEST_TIMEOUT_MS` sem a palavra da marca porque o `zero-brand:check` reprova.
- Constante de módulo com literal passada como prazo foi migrada na declaração da constante; `waitFor`/`findBy*` não são prazo de caso e ficaram.
- O caso sintético do passo 1 grava um `.test.ts` temporário em `gates/scripts/release/__tests__/` (fora de `src/`, para a trava não o ver em paralelo) e o remove no `finally`.
- A migração foi feita por script de AST descartável (não versionado).

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- `kit-names:check` falhou por `dist/index.d.ts` ausente (um build de outra plan em paralelo apagou o `dist`); não é consequência desta plan, que não toca o barril nem roda build. Precisa ser repetido pelo revisor com o `dist` presente.
- Não rodei o caminho completo `coverage:release`; a variável chega ao filho pelo `spawnSync` (código lido, não medido ponta a ponta).

---

# 10. Veredito

## Veredito — 2026-11-27 — 🟢 Aprovada

**Diff:** a porta `prazoDeTeste` (`src/shared/testing/`, fora do barril e do subcaminho `testing`), a variável que
`run-release-tests.mjs` passa ao vitest filho, a trava `find-own-timeouts.mjs` (por AST) e 55 prazos em 32 arquivos de teste
migrados para a porta. O `configIsSavedDesign` mede 3,7 s e 3,0 s isolados, porque monta o Provider duas vezes, e declara o prazo
pela porta.

**Mutações, numa cópia do worktree:**
- um prazo literal de volta em `SarakQRCodeImpl.test.tsx`: reprova "nenhum teste de src/ declara prazo fora da porta";
- a porta devolvendo só o prazo declarado: reprova "prazo pela porta vale o da release e passa".

**Conferência do revisor:**
- `tsc --noEmit`: 0 erros.
- `trail-citation`, `zero-brand`, `gate-limits` e `kit-names` em dia. O `kit-names` foi rodado com o `dist/` presente, que era a
  pendência do executor.
- `audit:baseline`: o detector de valor foi de 0 a 1, em `PresetSamplesStatic.tsx:111`. O arquivo é da `plan-188`, em execução, e não
  desta plan.

**Ressalva:** o caminho completo do `coverage:release` não foi medido de ponta a ponta. O fechamento da campanha o roda.
