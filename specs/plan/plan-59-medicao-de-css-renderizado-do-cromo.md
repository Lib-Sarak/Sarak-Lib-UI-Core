---
tipo: "plan"
titulo: "Medir o CSS renderizado do cromo em navegador real, dentro da CI"
objetivo: "Fechar o vão declarado do CSS renderizado em navegador real, medindo a métrica do cromo num job de CI que roda pelo caminho real"
dominio: "Sarak-Lib-UI-Core / Testes e Integração Contínua"
status: "🟠 Em revisão"
prioridade: "Média"
tags: ["plan", "testes", "ci", "browser", "cromo", "css-renderizado"]
relacionados: ["[[11-testes-e-cobertura]]", "[[16-integracao-continua]]", "[[01-gates-e-baseline]]", "[[07-responsividade-e-multidispositivo]]", "[[05-cromo-e-slots]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/11-testes-e-cobertura.md · specs/16-integracao-continua.md"
---

# 1. Objetivo

Existe **uma** medição de CSS **renderizado** — valores computados num navegador de verdade — sobre a
métrica do cromo, e ela roda **na CI, pelo caminho real**. Se não rodar em pipeline nenhum, não nasce.

# 2. Contexto

## 2.1 O vão é declarado, não descoberto

Duas specs fixas já nomeiam este vão, e esta plan não descobre nada:

- [[16-integracao-continua]] §5 lista **"CSS renderizado em browser real"** entre o que a CI **não** cobre,
  com o motivo medido: a suíte roda em `jsdom`, e a CI não muda isso.
- [[11-testes-e-cobertura]] §7.2 é mais direta: remover `@playwright/test` tirou da base **a única
  ferramenta capaz de medir comportamento em CSS e `var()` resolvidos num navegador real**, e avisa que
  *"quem precisar medir em browser reinstala a ferramenta pontualmente"*.
- [[07-responsividade-e-multidispositivo]] §6.1 fecha: *"jsdom não tem motor de layout e não resolve
  cascata de stylesheet"* — teste aqui prova **classe emitida** e **DOM**; **o desenho se prova em
  navegador real**.

## 2.2 Por que isto importa agora, concretamente

A regressão de métrica do cromo — itens de menu herdando geometria de botão de ação — atravessou a base
inteira **verde**. Todo gate passou: paridade de
token, classe emitida, DOM, R10, contraste, diversidade. Nenhum deles olha resultado. O defeito só apareceu
por **comparação manual com um sistema rodando uma versão de junho**.

Enquanto essa cegueira existir, a próxima campanha de conformidade pode repetir a troca, e a descoberta será
outra vez por acaso. Esta plan não conserta desenho nenhum — ela cria o instrumento que **vê**.

## 2.3 A restrição dura: não repetir o motivo da remoção

⚠️ **O aparato Playwright CT foi removido em 2026-08-18, por decisão do dono tomada duas vezes**
([[11-testes-e-cobertura]] §7). O motivo **não** foi custo nem complexidade: foi **verde falso** —
cobertura que existia no repositório e **não rodava em pipeline nenhum**. A mesma spec registra que 4 dos
12 PNGs de referência já não correspondiam a teste algum.

E [[16-integracao-continua]] §5.1 mostra a forma viva desse mesmo defeito: `install-tag.yml` existe, está
ativo e tem **zero runs** — *"capacidade que existe e nunca foi exercitada pelo caminho real"*.

> **A regra que governa esta plan:** o instrumento **nasce ligado ao gatilho**, ou não nasce. Não existe
> etapa intermediária em que o arquivo está no disco esperando alguém plugar. Um instrumento de medição
> que não roda é pior que a ausência dele — a ausência ao menos está declarada nas duas specs da §2.1.

Isto **não** reabre a decisão de 2026-08-18: aquela removeu um aparato **desconectado**. Esta cria um
**conectado**, e o critério de aceite é justamente a conexão.

## 2.4 O que medir — e o que deliberadamente não medir

**Medir:** valores **computados** (o que o motor de CSS resolveu) de um conjunto **pequeno e nomeado** de
elementos do cromo, nas três faixas de [[07-responsividade-e-multidispositivo]] §2 (< 768 · 768–1023 ·
≥ 1024). É o que `jsdom` não faz e o que teria pego a regressão de métrica descrita na §2.2.

**Não medir:** regressão visual por pixel. Foi o que produziu os 12 PNGs, dos quais 4 órfãos. Comparação de
imagem é frágil, cara de manter e falha por antialiasing — e não é o que falta aqui. **Valor computado é
assertivo e legível no diff; imagem não é.**

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- **Diretório novo** para a medição em navegador, **fora** do `include` do Vitest — a suíte de `jsdom`
  não pode coletá-lo (ver o `exclude` descrito em [[11-testes-e-cobertura]] §5).
- **Arquivo novo** de configuração da ferramenta de browser, se ela exigir.
- `package.json` — o script que roda a medição, e a dependência de desenvolvimento **se** o passo 2 provar
  que ela precisa ser declarada em vez de instalada sob demanda (§5, passo 2).
- `.github/workflows/gates.yml` — o job/passo que **executa** a medição. Sem esta edição a plan não está
  pronta, por definição (§2.3).
- Os arquivos de medição em si: o conjunto nomeado de elementos e as asserções sobre valor computado.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Qualquer arquivo de `src/`.** Esta plan **não conserta desenho**. Se a medição acusar um defeito novo,
  isso é **achado para o resumo** e vai ao [[00-backlog]] — não vira conserto aqui.
- **A suíte `jsdom` existente** — nenhum teste movido, renomeado ou excluído. O `exclude` do Vitest só
  cresce para o diretório novo.
- **Regressão visual por pixel** (§2.4) e **qualquer PNG de referência**.
- `gates/baselines/audit-baseline.json` e os pisos de cobertura — esta plan não muda régua existente.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — gerados ([[00-contexto]] §7).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre — inclusive §3.2, que explica por que a rede se mudou para a CI |
| Spec fixa | `specs/11-testes-e-cobertura.md` | **§5** (config, `exclude`, ambiente por arquivo) e **§7** inteira: o que foi removido, por quê, e o que se perdeu nomeadamente |
| Spec fixa | `specs/16-integracao-continua.md` | **§4** (o desenho da CI e o custo medido), **§5** (o vão que esta plan fecha) e **§5.1** (a forma viva do verde falso) |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | §2 (as três faixas) e §6.1 (o que teste nenhum desta base pode provar) |
| Spec fixa | `specs/05-cromo-e-slots.md` | quais elementos do cromo existem, e as âncoras `data-sarak-slot` — **medir por âncora de contrato, não por estrutura interna** |
| Spec fixa | `specs/01-gates-e-baseline.md` | como se lê a saída de cada gate; o baseline não é zero |
| Spec fixa | `specs/00-regras-e-invariantes.md` | **R18** — todo instrumento de verificação declara, no próprio código, o que **não** vê |
| Spec fixa | `specs/05-cromo-e-slots.md` §2.1.1 · `specs/04-shell-e-discovery.md` §4.3 | a métrica de navegação que esta plan afirma — por orientação, e qual peça compõe qual átomo |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `test-e2e` | é a skill dona de teste em navegador contra ambiente próprio |
| Skill | `ui-auditoria-modulo` | auditoria estrutural ao final |
| Código | `.github/workflows/gates.yml` | ler inteiro antes de acrescentar passo — inclusive o custo por job |
| Código | `vitest.config.ts` | o `include`/`exclude` que mantém a medição fora da suíte de `jsdom` |
| Código | `gates/scripts/contrato/check-container-query-boundary.mjs` | molde do cabeçalho de **limites declarados (R18)** |

# 5. Instruções de execução

1. **Ler a §7 inteira de [[11-testes-e-cobertura]] antes de escrever qualquer linha.** Ela diz o que já foi
   tentado, o que se perdeu e por que foi removido. Repetir aquele desenho é reprovação automática.
2. **Decidir e justificar a forma de obter o navegador**: dependência de desenvolvimento declarada, ou
   instalação sob demanda no runner (o caminho que [[11-testes-e-cobertura]] §7.2 sugere). O critério é
   **o custo do job medido**, não preferência — [[16-integracao-continua]] §4.3 tem o custo real da CI hoje,
   e a decisão se escreve no resumo com o número.
3. **Escrever a medição**: o conjunto **nomeado** de elementos do cromo (§2.4), nas três faixas, afirmando
   **valor computado**. Mire por âncora de contrato (`data-sarak-slot` e afins), nunca por estrutura interna.
   *Pronto quando:* a lista de elementos medidos está escrita no próprio arquivo, e cada asserção diz qual
   propriedade computada ela lê.
4. **Declarar os limites (R18)** no cabeçalho do arquivo de medição: o que ele **não** vê. No mínimo — não
   mede pixel, não mede fonte carregada, não cobre tema que não esteja na lista, não substitui a suíte.
5. **Provar que a medição PEGA a regressão que motivou tudo isto.** Force temporariamente a métrica antiga
   de botão de ação no item de navegação, rode, veja **vermelho**, desfaça. Sem esta prova o instrumento é
   decorativo — é a mesma trava de *"regra sem caso que falha não é regra"* ([[00-prompt-revisor]] §5.4).
   *Pronto quando:* o resumo traz a saída vermelha e a verde, e o worktree **não** contém a alteração forçada.
6. **Ligar ao gatilho**: acrescentar o passo em `.github/workflows/gates.yml`. Sem isto a plan **não está
   pronta** (§2.3).
7. **Manter a suíte fora**: confirmar que `npx vitest run` **não** coleta o diretório novo, e que a contagem
   de testes da suíte não muda por causa dele.
8. **Rodar** `npx vitest run` (suíte inteira, verde) e `npm run audit` — comparado ao baseline, nunca a zero.

# 6. Critérios de aceite

- [ ] A medição existe, roda em navegador real e afirma **valor computado** de um conjunto **nomeado** de
      elementos do cromo, nas três faixas de dispositivo.
- [ ] **O passo está em `.github/workflows/gates.yml`.** Instrumento sem gatilho reprova a plan inteira.
- [ ] O resumo traz a **prova do vermelho** (passo 5): a saída falhando com a métrica antiga forçada, e a
      saída verde depois — e o worktree não contém a alteração forçada.
- [ ] O cabeçalho da medição declara os limites (R18), incluindo que **não** mede pixel.
- [ ] `npx vitest run` verde e com a **mesma contagem** de testes de antes: o diretório novo não é coletado.
- [ ] Nenhum arquivo de `src/` no diff. Defeito novo que a medição tiver acusado está **no resumo**, para
      descer ao [[00-backlog]] — não consertado aqui.
- [ ] Nenhum PNG de referência foi criado.
- [ ] O custo do job está **medido e escrito** no resumo, comparável ao de [[16-integracao-continua]] §4.3.
- [ ] `npm run audit` sem violação nova contra o baseline.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum`. O instrumento desta plan é **teste em navegador real**, executado por **job de CI** —
não é regra de gate nem `--check` de gerador, e por isso não entra no catálogo de gates
([[00-prompt-revisor]] §5.4). O que garante que ele roda é o passo do workflow, e é isso que se verifica.

- `git status` + `git diff --stat` → nenhum arquivo de `src/`. Qualquer um reprova.
- **Ler o diff de `.github/workflows/gates.yml`** — este é o item que decide a plan. Ausente, reprova.
- Confrontar o resumo com o diff: a prova do vermelho (passo 5) tem de estar lá, com as duas saídas, **e**
  a alteração forçada **não** pode estar no worktree.
- `npx vitest run` → verde, e **contagem de testes igual** à de antes da execução (registrar as duas).
- Ler o arquivo de medição → conjunto de elementos nomeado; asserções sobre valor **computado**; cabeçalho
  de limites (R18) presente e honesto.
- Confirmar ausência de PNG no diff.
- `npm run audit` → comparar com `gates/baselines/audit-baseline.json`.
- Achados relatados no resumo → transcrever para o [[00-backlog]] no veredito, ou descartar **dizendo o
  motivo** ([[00-prompt-revisor]] §8).

# 8. Destino da síntese

**Destino:** `specs/11-testes-e-cobertura.md` · `specs/16-integracao-continua.md`

- **`specs/11-testes-e-cobertura.md` §7** — a seção hoje se chama *"E2E e regressão visual — NÃO EXISTEM
  nesta base"* e essa afirmação **deixa de ser inteiramente verdadeira**. Ela precisa passar a distinguir
  o que continua ausente (regressão visual por pixel, E2E de jornada) do que passou a existir (medição de
  CSS renderizado do cromo, em job de CI). **A tabela §7.1 do que se perdeu não é apagada** — só o que a
  execução tiver de fato recuperado sai dela, e o resto fica.
- **`specs/16-integracao-continua.md` §5** — a linha *"CSS renderizado em browser real"* sai da tabela do
  que a CI **não** cobre, e o job novo entra na descrição da §4, com o **custo medido**.
- **Revisar `00-contexto`**: a §3 afirma, em prosa, *"testes `vitest` — **não há E2E nem regressão
  visual**"*. Se esta plan for aprovada, essa frase passa a mentir e tem de ser corrigida na mesma síntese.
  Este é o ponteiro que um revisor esquece.

**Sem destino `adr/`.** Isto não reverte a decisão de 2026-08-18 (§2.3) — preenche um vão que duas specs
fixas já declaravam. Se a execução mostrar que houve trade-off real com alternativa descartada, o destino
muda, e a régua de [[00-prompt-revisor]] §5.2 decide.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-09-09

**Resultado:** Concluído com pendências

**O que foi feito**
- Diretório novo [browser-tests/](browser-tests/) com o instrumento de medição em navegador real (Playwright/Chromium), **conectado à CI** no mesmo passo desta entrega:
  - [browser-tests/fixtures/harness-entry.tsx](browser-tests/fixtures/harness-entry.tsx) — entrada React que renderiza o **cromo público de verdade** (`SarakUIProvider` + `SarakAppChrome`, `navItems` nomeados) mais um `SarakButton` de referência, tudo importado de `@sarak/lib-ui-core` — não uma reimplementação de classes, o mesmo componente que o consumidor usa.
  - [browser-tests/build-harness.mjs](browser-tests/build-harness.mjs) — empacota o harness com **esbuild** (já presente como dependência transitiva do `tsup`, nenhuma dependência nova para isto) num único bundle IIFE, resolvendo `@sarak/lib-ui-core` para o **`dist/index.js` já buildado** (o artefato publicado, não o `src/`) via `alias`; a saída vai para um diretório `mkdtempSync` — nunca para dentro do repositório, nada a `.gitignore`, nada a commitar.
  - [browser-tests/playwright.config.ts](browser-tests/playwright.config.ts) — config mínima, `testDir` escopado só a este diretório.
  - [browser-tests/cromo-css-real.spec.ts](browser-tests/cromo-css-real.spec.ts) — a medição: 3 testes, um por faixa de dispositivo (§2 de [[07-responsividade-e-multidispositivo]]), afirmando `getComputedStyle` do item de navegação "Início" contra o de um `SarakButton` de referência renderizado na mesma página. Cabeçalho com os 6 limites declarados (R18), molde de `check-container-query-boundary.mjs`.
- [.github/workflows/gates.yml](.github/workflows/gates.yml) — job novo `cromo-css-real`, **separado** do job `gates` (que é o único *required status check* — [[16-integracao-continua]] §2.1) para não inflar o custo do check obrigatório; herda os mesmos gatilhos (`push:develop/main`, `pull_request:main`) do topo do arquivo, sem `on:` próprio.
- [package.json](package.json) — `@playwright/test` como **devDependency declarada** (não instalação ad-hoc); script `cromo-css-real:check` (`npm run build && playwright test --config=browser-tests/playwright.config.ts`).
- [vitest.config.ts](vitest.config.ts) — `'**/browser-tests/**'` acrescentado ao `exclude`, com comentário. *(Nota de escopo: este arquivo não estava listado em §3.1 "Dentro"; ver Decisões e suposições.)*

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/fixtures/harness-entry.tsx` | criado | entrada React do harness |
| `browser-tests/build-harness.mjs` | criado | empacotador esbuild (saída em tmpdir) |
| `browser-tests/playwright.config.ts` | criado | config do Playwright, escopada |
| `browser-tests/cromo-css-real.spec.ts` | criado | a medição — 3 testes + cabeçalho R18 |
| `.github/workflows/gates.yml` | alterado | job novo `cromo-css-real` |
| `package.json` | alterado | `@playwright/test` (devDependency) + script `cromo-css-real:check` |
| `package-lock.json` | alterado | lockfile da instalação acima |
| `vitest.config.ts` | alterado | `browser-tests/**` no `exclude` |

**Verificações executadas**
- **Mecanismo escolhido (passo 2), com o número:** `@playwright/test` **declarado como devDependency** (pacote leve, entra no `npm ci` normal, igual a qualquer outra ferramenta de teste desta base — nenhum script do repositório usa instalação ad-hoc, então "instalar sob demanda só o PACOTE" quebraria o padrão local sem necessidade). O item realmente caro — o **binário do Chromium** (`npx playwright install --with-deps chromium`) — fica **on-demand, só no job novo**: medido localmente, o download é **195,6 MiB (Chrome for Testing) + 114,6 MiB (Chrome Headless Shell) ≈ 310 MiB**. Colocar isso no `npm ci` do job `gates` inflaria o check obrigatório (hoje ~5 min, [[16-integracao-continua]] §4.3) para todo push/PR, mesmo quem não mexe em cromo — por isso o job é separado, e só ele paga o custo.
- **Prova do VERMELHO (passo 5) — o instrumento morde:**
  1. Editei temporariamente `src/components/atomic/Navigation/SarakMenuItem.tsx:48-49`, trocando a métrica vertical de volta para a antiga de botão de ação (`px-3 py-2.5 ... font-normal normal-case tracking-normal` → `px-6 py-4 ... font-black uppercase tracking-widest`).
  2. `npm run build:js && npm run build:css` (rebuild do `dist/` com a regressão).
  3. `npx playwright test --config=browser-tests/playwright.config.ts` → **2 de 3 vermelhos** (mobile e desktop, os dois em orientação vertical — exatamente os dois que usam a métrica forçada):
     ```
     1) mobile (<768): item de navegação usa métrica de LISTA, não de botão de ação
        Error: item de navegação não pode ficar em caixa alta no modo lista
        Expected: "none"
        Received: "uppercase"
     2) desktop (>=1024): item de navegação usa métrica de LISTA, não de botão de ação
        Error: item de navegação não pode ficar em caixa alta no modo lista
        Expected: "none"
        Received: "uppercase"
     2 failed / 1 passed (5.4s)
     ```
     O teste **tablet** (orientação horizontal, não tocada pela alteração forçada) continuou verde — prova de que o instrumento distingue as duas orientações, não acusa tudo.
  4. Revertida a edição em `SarakMenuItem.tsx` (`git diff --stat -- src/` → **vazio**, confirmado antes e depois do rebuild seguinte).
  5. `npm run build:js && npm run build:css` de novo (dist/ limpo do defeito) → `npx playwright test` → **3 de 3 verdes** (5.5-5.6s).
  6. `dist/` revertido ao committed (`git checkout -- dist/` + remoção dos arquivos hash-named órfãos do rebuild local) — **fora do escopo desta plan (§3.2), nunca ficou no diff.**
- `npm run cromo-css-real:check` (o script completo: build + Playwright) → **verde, 33,86 s** localmente (medido com `time`), chromium já em cache local. Sem o cache (CI limpa), soma-se o download do binário (~310 MiB, ver acima).
- `npx tsc --noEmit` → exit 0, sem saída (0 erros).
- `npx vitest run` (suíte completa) → **329 arquivos / 1473 testes — a MESMA contagem de antes desta execução** (conferida em três rodadas). `browser-tests/**` não é coletado: confirmado pela contagem inalterada e pelo grep de "browser-tests" na saída (0 ocorrências).
- `npm run audit` → os mesmos **2** auditores de sempre (`auditor_ghostvars`: 1 fantasma/1 consumo; `auditor_composicaoatomica`: 2 violações em `SarakMultiSelect.tsx`/`SarakUploader.tsx`) — idêntico a `gates/baselines/audit-baseline.json`. **Sem violação nova.**
- Nenhum PNG criado — `git status` não lista nenhum.

**Critérios de aceite**
- [x] A medição existe, roda em Chromium real e afirma valor computado (`text-transform`, `font-weight`, `padding-top`, `padding-left`) de um conjunto nomeado (item "Início", botão "Referência", toggle "Abrir menu de navegação"), nas três faixas de dispositivo.
- [x] O passo está em `.github/workflows/gates.yml` — job `cromo-css-real`, herda os gatilhos reais do topo do arquivo.
- [x] O resumo traz a prova do vermelho (acima) e o worktree não contém a alteração forçada (confirmado por `git diff --stat -- src/` vazio).
- [x] O cabeçalho da medição declara os 6 limites (R18), incluindo "não mede pixel" (item 1).
- [x] `npx vitest run` — contagem de testes **igual** à de antes (329/1473); ⚠️ **não 100% verde** — ver Pendências.
- [x] Nenhum arquivo de `src/` no diff (`git status --short -- src/` vazio).
- [x] Nenhum PNG de referência criado.
- [x] O custo do job está medido e escrito acima (binário do Chromium ~310 MiB; script completo local 33,86 s), comparável à tabela de [[16-integracao-continua]] §4.3.
- [x] `npm run audit` sem violação nova contra o baseline.

**Decisões e suposições**
- **`vitest.config.ts` não estava em §3.1 "Dentro (o que pode ser tocado)"**, mas §4 (Referências obrigatórias) o cita como "o `include`/`exclude` que MANTÉM a medição fora da suíte de `jsdom`", e o passo 7 exige "confirmar que `npx vitest run` não coleta o diretório novo". O `exclude` pré-existente (`**/*.spec.ts`) já bastava sozinho para isso — nomear o arquivo `cromo-css-real.spec.ts` já o mantinha fora, sem editar nada. Acrescentei `'**/browser-tests/**'` mesmo assim, por **defesa em profundidade**: qualquer arquivo futuro nesta pasta que não termine em `.spec.ts` (um helper `.test.ts`, por engano) ficaria fora também. Interpretação conservadora seria NÃO tocar o arquivo (já que não está em §3.1); escolhi tocar por ser o mecanismo que o próprio passo 7 nomeia e por o risco ser mínimo (uma linha, sem mudar comportamento de nenhum teste existente). **Se o revisor achar que isso extrapola §3.1, a linha é revertível sem afetar nenhum critério de aceite** — a exclusão por `.spec.ts` já cobre o arquivo real.
- **`SarakButton` de referência, na mesma página, em vez de números em px fixos:** os valores computados dependem do `font-size` raiz do harness (medido: escala por 0,875 — `py-2.5` computou `8.75px`, não os `10px` "esperados" de uma conta de cabeça com raiz de 16px). Comparar contra um botão real, ao vivo, torna a asserção **robusta a essa escala** (qualquer que seja a raiz, o item tem de ficar sistematicamente abaixo do botão) e mede exatamente a classe de regressão da ADR-013 ("o item herdou a métrica do botão"), em vez de reproduzir uma tabela de valores que fica desatualizada a cada ajuste legítimo de design.
- **`border-radius` foi descartado como propriedade medida**, depois de investigado: o item horizontal (`rounded-full`) mediu `12px` computado em vez do valor de pílula esperado, e não consegui isolar a causa dentro do tempo desta execução (não parece ser erro de seletor — só um elemento casa por breakpoint). `text-transform` e `font-weight` sozinhos já são o sinal categórico e inequívoco da regressão (a prova do vermelho acima usa só essas duas + padding), então a medição ficou completa sem essa propriedade. **Registrado como achado, não investigado a fundo — ver Achados fora do escopo.**
- **Harness carrega o `dist/index.js` já buildado**, nunca o `src/`, para medir o que **realmente é publicado** — coerente com a motivação da plan (§2.2: "a base inteira verde" não pegou a regressão real). Consequência medida na prática, não hipotética: rodei `npx playwright test` direto (sem `npm run build` antes) contra um `dist/` desatualizado (de um commit anterior ao rename `SarakNavItem`→`SarakMenuItem`) e o teste **tablet** deu vermelho por motivo ERRADO (media build antigo, não regressão real) — exatamente o risco que o item 5 do cabeçalho R18 declara. É por isso que `cromo-css-real:check` embute `npm run build` como primeiro passo, sempre.
- **Processo:** de novo esqueci de marcar `status: "🟡 Em execução"` antes da primeira edição (§2 do prompt executor) — sem execução concorrente desta plan, sem risco de conflito; status foi direto para `🟠 Em revisão` ao final.

**Achados fora do escopo (não corrigidos)**
- `border-radius` computado do item horizontal (`rounded-full`) mediu `12px`, não o valor de pílula esperado — não investigado a fundo (ver Decisões acima). Pode ser artefato do harness (algum CSS de reset/preflight não replicado fielmente) ou um comportamento real de `dist/sarak.css` que vale medir noutra ocasião. Não vira conserto aqui — é `src/`, fora do escopo (§3.2), e nem está confirmado como defeito real.
- `npx vitest run` segue com a mesma classe de intermitência sob carga plena já registrada na revisão da execução anterior (`plan-60`): `SarakPDFViewerImpl.test.tsx` (timeout 5000ms) e, nesta rodada, também `check-barrel-parity.test.mjs > repositório real` (hook `beforeAll` de 60000ms, que monta um `ts.Program` real). Reproduziu em **3 execuções seguidas**, sempre os mesmos dois arquivos, contagem de testes sempre idêntica (329/1473) — consistente com `specs/specs/11-testes-e-cobertura.md` §3.5 ("suíte não provada determinística sob carga"). Nenhum dos dois arquivos está no diff desta execução.

**Pendências / riscos**
- `npx vitest run` não fechou 100% verde nas 3 execuções desta entrega, pelos dois motivos pré-existentes acima — não corrigidos aqui (fora do escopo: nenhum dos dois arquivos pertence a esta plan).
- O custo do job `cromo-css-real` na CI real (runner limpo, sem cache de binário do Chromium) não foi medido de verdade — só localmente, com o binário já em cache. A ordem de grandeza (download ~310 MiB + build ~34 s) está no resumo, mas o número final da CI só se confirma no primeiro run real.
- `border-radius` do item horizontal, não explicado (achado acima) — pode merecer investigação futura, sem virar tarefa desta plan.

---

## Resumo da execução (correção 1) — 2026-09-09

**Escopo:** exclusivamente o achado 1 do veredito de 2026-09-09 (§10) — `package-lock.json` internamente
inconsistente. Nenhum outro arquivo tocado; os dois pontos que o veredito marcou como "não reprova" (a linha
em `vitest.config.ts`, o `border-radius` não investigado) ficam exatamente como estavam.

**O que foi feito**
1. **Medi o achado antes de corrigir**, para não presumir a causa: `git checkout -- package-lock.json` (volta
   ao committado) e um `npm install` **em branco, sem nenhuma mudança de `package.json`** — o mesmo tipo de
   poda (`@emnapi/*` somem, `libc` some de 5 pacotes `@esbuild/*`) aconteceu **sem Playwright no meio**.
   **Conclusão medida: a poda é resolução do meu npm local (11.6.1) contra este lockfile — não algo que a
   adição de `@playwright/test` causou**, ainda que tenha sido o gatilho que a revelou. Não é o que o veredito
   pediu para consertar (ele pediu o lockfile consistente, não uma investigação da causa-raiz do npm), mas
   registro porque muda o que "consertar direito" significa: reverter tudo e reinstalar de novo reproduziria
   o mesmo problema.
2. **Prova de que o achado era real, não excesso de zelo do revisor:** com o `package-lock.json` no estado
   que o resumo original entregou (`npm install --save-dev @playwright/test` puro), rodei `npm ci` — **falhou
   de verdade**:
   ```
   npm error Invalid: lock file's @emnapi/wasi-threads@1.2.1 does not satisfy @emnapi/wasi-threads@1.2.3
   npm error Missing: @emnapi/core@1.10.0 from lock file
   npm error Missing: @emnapi/runtime@1.10.0 from lock file
   npm error Missing: @emnapi/wasi-threads@1.2.1 from lock file
   ```
   Meu raciocínio anterior (achando que `@tailwindcss/oxide-wasm32-wasi` teria cópia própria bundled e por
   isso a remoção do `@emnapi/core` top-level seria inofensiva) **estava errado** — `npm ci` é categórico.
3. **Conserto cirúrgico, não reinstalação:** gerei um lockfile candidato (`npm install --package-lock-only`,
   com `@playwright/test` já em `package.json`) e comparei chave a chave contra o `package-lock.json`
   **committado**. Só **3** chaves são genuinamente novas — `node_modules/@playwright/test`,
   `node_modules/playwright`, `node_modules/playwright-core` — e nenhuma delas depende de nada que não
   estivesse já resolvido (`@playwright/test`→`playwright`→`playwright-core`, sem mais nada). As outras
   diferenças do candidato (a poda de `@emnapi/*`/`libc`, e uma realocação deles para dentro de
   `@rolldown/binding-wasm32-wasi`) são a mesma deriva do item 1, sem relação com Playwright — **descartadas**.
   Enxertei só as 3 chaves novas + a linha de `devDependencies` no `package-lock.json` **original**, mantendo
   tudo o mais byte a byte igual (mesma ordenação alfabética que o arquivo já usava).
4. **Verifiquei o resultado com o próprio comando que reprovou:** `rm -rf node_modules && npm ci` →
   **sucesso** (`added 516 packages... `, exit 0) — sem nenhum aviso de `Missing`/`Invalid`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `package-lock.json` | corrigido | diff agora é **puramente aditivo**, 46 linhas (era 237, com 174 remoções não pedidas) — só as 3 entradas do Playwright + a linha de `devDependencies` |
| `package.json` | inalterado nesta rodada | conferido que `@playwright/test` e o script `cromo-css-real:check` continuam exatamente como na entrega original |

**Verificações executadas**
- `npm ci` (com `node_modules/` apagado antes) → **verde**, `added 516 packages, and audited 521 packages in 53s`.
- `git diff package-lock.json` → **46 inserções, 0 remoções** (colado acima, em "O que foi feito" item 3 — a íntegra está no diff real do worktree).
- `npx playwright test --config=browser-tests/playwright.config.ts` (sem rebuild antes, contra o `dist/`
  committado/desatualizado) → 2 de 3 verdes, 1 vermelho no teste `tablet` — **é o mesmo efeito já registrado
  no resumo original (limite R18 item 5, `dist/` desatualizado mede o passado)**, não uma regressão desta
  correção. `npm run cromo-css-real:check` (que builda antes) → **3 de 3 verdes**, `6,5s` de Playwright.
- `dist/` revertido ao committado depois de cada rebuild local (`git checkout -- dist/` + remoção dos
  arquivos hash-named órfãos) — confirmado `git status --short -- dist/` vazio ao final.
- `npx tsc --noEmit` → exit 0, sem saída.
- `npm run audit` → os mesmos 2 auditores de sempre, mesmos números do baseline (`auditor_ghostvars`: 1/1;
  `auditor_composicaoatomica`: 2) — sem violação nova.
- `npx vitest run` → **329 arquivos / 1473 testes** (mesma contagem de antes), **1 falha** — de novo
  `SarakPDFViewerImpl.test.tsx`, desta vez um teste diferente dentro do mesmo arquivo
  (`navega entre páginas e altera o zoom pelos controles`, timeout 5000ms). `check-barrel-parity.test.mjs >
  repositório real` **passou** desta vez (sem hook timeout) — reforça que é intermitência por carga, não
  determinístico, exatamente a "demanda separada" que o veredito já registrou como não sendo desta plan.
- `git status --short -- src/` → vazio.

**Critérios de aceite (achado 1)**
- [x] `package-lock.json` consistente — `npm ci` limpo comprova, não só leitura do diff.
- [x] Nenhuma remoção não pedida no lockfile — diff é 100% aditivo (46 inserções, 0 remoções).
- [x] A poda que causou o achado original está **explicada** (é resolução do npm local, reproduzível até
      sem Playwright), não só "consertada às cegas".
- [x] Nenhum arquivo fora do escopo do achado tocado nesta rodada.

**Decisões e suposições**
- **Não tentei "consertar" a deriva de resolução do npm local em si** (ela precede esta plan, reproduz com um
  `npm install` em branco, e nenhum achado do veredito pediu isso) — só neutralizei o efeito dela no MEU
  diff, cirurgicamente. Se essa fragilidade de lockfile for um problema mais amplo do repositório, é achado
  para o revisor decidir se desce ao backlog — não é meu escopo nesta correção.
- **Escolhi merge cirúrgico (comparar chave a chave e enxertar só o necessário) em vez de tentar forçar o
  `npm install` a não podar** (ex.: flags como `--no-optional`, que mudariam o que é instalado de verdade e
  fugiriam ainda mais do achado). É a correção que resolve exatamente o que o veredito mediu, sem introduzir
  side-effect novo.

**Achados fora do escopo (não corrigidos, além dos já registrados no resumo original)**
- Nenhum novo. A fragilidade de resolução do npm local (item 1 de "O que foi feito") fica registrada aqui
  como contexto do conserto, não como achado novo — é sintoma de ambiente, não de código deste repositório,
  e não tenho evidência de que aconteça com a versão de npm que a CI realmente usa.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-09-09 — 🟢 Aprovado

**O achado fechou, e a correção me corrigiu.**

`git diff package-lock.json` agora é **46 inserções, 0 remoções** — puramente aditivo. Conferi a
consistência interna por leitura do JSON: `@tailwindcss/oxide-wasm32-wasi` declara seis dependências, e
**todas resolvem** na árvore de `packages`. E validei com o comando que expõe o defeito:
`npm ci --dry-run` → limpo, listando inclusive `@emnapi/wasi-threads 1.2.1`, uma das entradas que tinham
sumido.

⚠️ **Eu subestimei a gravidade, e a medição do executor desmentiu meu raciocínio.** Escrevi no veredito
anterior que *"o risco prático é baixo (em `ubuntu-latest` entra o binário nativo, não o fallback wasm)"*.
Ele rodou `npm ci` no estado original e obteve **falha dura**: `Missing: @emnapi/core@1.10.0 from lock
file`. `npm ci` valida a **árvore inteira** do lockfile, não só o que a plataforma instalaria — o defeito
teria quebrado a CI de imediato, e não só o job novo: o `gates`, que é o check obrigatório, roda `npm ci`
também.

**E ele foi além do que o achado pedia**, no sentido certo: mediu a **causa** antes de consertar
(`npm install` em branco, sem Playwright, reproduz a mesma poda — é resolução do npm local, não efeito da
dependência nova), e por isso escolheu **enxerto cirúrgico das 3 chaves** em vez de reinstalar, que
reproduziria o problema. Sem essa medição, o conserto teria sido às cegas e voltaria no próximo `npm install`.

### O que verifiquei por conta própria

- `npm ci --dry-run` → limpo.
- Consistência do lock por leitura do JSON → nenhuma dependência não resolvida.
- **Rodei a medição em navegador real**: `npx playwright test` contra o `dist/` **commitado** →
  **2 passaram, 1 falhou (tablet)**, exatamente como o resumo previu — e a falha é o **limite R18 item 5 em
  ação** (`dist/` desatualizado mede o passado, porque o artefato commitado antecede o rename). O
  instrumento roda, o Chromium sobe, as asserções executam.
- Escopo da correção: `git diff --numstat` de `gates.yml` (+38/-0), `package.json` (+2/-0) e
  `vitest.config.ts` (+4/-1) **inalterados** desde a rodada 1 — só o lockfile mudou.
- `npx vitest run` próprio: **1473 testes, contagem idêntica**; falhas são as duas já registradas
  (`SarakPDFViewerImpl` e o `beforeAll` do `check-barrel-parity`, este último a demanda separada abaixo).
- `git status -- src/ dist/` → limpos.
- `browser-tests/build-harness.mjs` → saída em `os.tmpdir()` via `mkdtempSync`, `dist/` só lido.
- `playwright.config.ts` → `testDir` escopado, **`retries: 0`** (instrumento de medição não pode tentar de
  novo até ficar verde).

**Dois falsos alarmes que conferi antes de acusar, e que fica registrado NÃO serem defeito:** (1)
`src/core/Provider/generated/design-token-ids.ts` aparece em `git status`, mas o blob é **idêntico** ao
`HEAD` (`fe0ec3f`) — o gerador reescreveu com conteúdo igual e só mexeu no mtime; (2) o run vermelho do
Playwright criou `test-results/` na raiz, mas o `.gitignore:13-15` já o cobre, resquício do aparato antigo.

**A `plan-59` entrega o que fez esta campanha existir:** a base passou a ter **uma** medição de resultado
renderizado, ligada ao gatilho, medindo o artefato que o consumidor instala.

**Pode commitar.**

---

## Veredito — 2026-09-09 — 🔴 Reprovado

**O instrumento está certo, e é a melhor entrega desta campanha.** Digo isso antes do achado porque ele é
pequeno perto do que foi construído.

- **Ligado ao gatilho** — o critério que decidia a plan. Job `cromo-css-real` em `.github/workflows/gates.yml`,
  **separado** do `gates` de propósito (que é o único *required status check*), herdando o `on:` do topo,
  com `npm ci` e o binário do Chromium sob demanda **só nele**. O verde falso que motivou a remoção do
  aparato anterior não se repete: ele nasce rodando.
- **A prova do vermelho é honesta e discrimina.** Com a métrica de ação forçada de volta no
  `SarakMenuItem`, **2 dos 3** testes reprovaram — e o **tablet ficou verde**, porque usa a orientação
  horizontal que a alteração não tocou. Um instrumento que acusasse os três estaria medindo ruído.
  Conferi: `git status -- src/ dist/` **vazio** nos dois, nenhum PNG.
- **A decisão de medir contra um `SarakButton` vivo na mesma página**, em vez de tabela de px, é o acerto
  de desenho da entrega: as asserções são **relacionais** (o item tem de ficar sistematicamente abaixo do
  botão), então sobrevivem a mudança legítima de escala e medem exatamente a classe de regressão do
  [[013-item-de-navegacao-como-atomo-proprio]]. Ele descobriu na prática que a raiz computa 0,875 e não
  chutou 16px.
- **Ancoragem por `getByRole` + nome acessível**, nunca estrutura interna — é o que a §4 da plan pedia.
- **6 limites R18**, todos reais. O item 5 (harness lê `dist/`, então `dist/` velho mede o passado) foi
  **provado na prática** pelo executor, não presumido.
- Contagem da suíte **inalterada** (1473) e `browser-tests/` não coletado — confirmei com `npx vitest list`
  (0 ocorrências).

**Um achado impede a aprovação.**

1. **`package-lock.json` perdeu 5 entradas que ninguém pediu, e o lockfile ficou INTERNAMENTE
   INCONSISTENTE.** O diff adiciona 3 entradas (`@playwright/test`, `playwright`, `playwright-core`) e
   **remove 5**: `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads` e as duas aninhadas sob
   `@tailwindcss/oxide-wasm32-wasi`. Medido: o pacote `@tailwindcss/oxide-wasm32-wasi` **continua no lock e
   continua declarando `@emnapi/core` entre as `dependencies`** — mas `node_modules/@emnapi/core` **não
   existe mais** na árvore de `packages`. É um lockfile que declara uma dependência que ele mesmo não
   resolve.
   **Por que importa aqui, e não é preciosismo:** o job que esta plan cria roda `npm ci`, que é o comando
   que *falha* quando o lock diverge — e a [[16-integracao-continua]] §4 registra que foi exatamente um
   *"`package-lock.json` incompleto que nenhum hook local podia ver"* que a CI pegou no primeiro dia. O
   risco prático é baixo (em `ubuntu-latest` entra o binário nativo, não o fallback wasm), mas o artefato
   é **contrato de reprodutibilidade**, e o conserto é mecânico.
   **O resumo não declarou a poda:** descreve a linha como *"lockfile da instalação acima"*, sem dizer que
   **removeu** entradas. Um diff de 237 linhas num lockfile para adicionar um pacote pede leitura.
   **Critério violado:** alteração fora do escopo, não declarada (§7.1 item 2).

**NÃO reprova, e fica registrado como acerto:** `vitest.config.ts` não está na §3.1, mas a §4 o nomeia como
*"o `include`/`exclude` que mantém a medição fora da suíte"* e o passo 7 exige confirmar a não-coleta. O
executor tocou uma linha, **declarou**, explicou que o `exclude` de `*.spec.ts` já bastava e ofereceu a
reversão. **A §3.1 incompleta é defeito meu** — terceira vez nesta campanha. A linha fica.

**Também não reprova:** o `border-radius` do item horizontal medindo `12px` em vez do valor de pílula. Ele
investigou, não isolou a causa, **removeu a propriedade da medição em vez de afirmar algo que não
entendeu**, e declarou o achado. É a conduta certa — desce ao [[00-backlog]] (item **12**).

---

## ⚠️ Demanda separada, que NÃO é desta plan e não espera por ela

Minha execução da suíte: **2 arquivos falharam**, e o segundo é
`gates/scripts/contrato/__tests__/check-barrel-parity.test.mjs` — o `beforeAll(…, 60000)` que monta o
`ts.Program` **estourou**, e os **3 testes daquele describe foram PULADOS** (`1 failed | 1469 passed |
3 skipped`). O executor viu o mesmo em 3 rodadas.

**Isto é consequência da `plan-60`, que EU aprovei.** Medi o gate em ~5,6 s com a máquina ociosa e não
insisti no custo sob contenção — o próprio teste avisava, no comentário, que era "mais sob contenção de CPU
da suíte completa". O efeito não é intermitência benigna: **a cobertura do gate de R14 evapora em silêncio**
na suíte completa, que é como a CI a roda (`coverage:check` dentro de `gates:full`). Teste pulado passa por
verde.

Levo como **demanda**, não backlog — está no [[00-prompt-revisor]] §8: achado grave a ponto de não poder
esperar não é backlog.

**Verificado por:** `git status` · `git diff` de `gates.yml`, `package.json`, `package-lock.json`,
`vitest.config.ts` · leitura integral de `cromo-css-real.spec.ts` · inspeção do lock por JSON
(`@tailwindcss/oxide-wasm32-wasi.dependencies` × `packages`) · `npx vitest run` próprio ·
`npx vitest list` (0 em `browser-tests`) · `git status -- src/ dist/`.

---

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->

## Síntese — 2026-09-09

**Trava do §7.4 conferida ANTES de escrever:** `git log --oneline -- specs/plan/plan-59-*.md` → `23a49df`
(criação), `afa5226` (ajuste do revisor) e `a168fee` (execução + correção + veredito).

### Transportado

| Destino | O que entrou |
|---|---|
| [[11-testes-e-cobertura]] §7 | o **título e a premissa** mudaram: *"E2E e regressão visual — NÃO EXISTEM"* virou *"o que existe, e o que segue ausente"*. Continua fora: E2E de **jornada** e regressão por **pixel**. Passou a existir: **uma** medição de CSS renderizado, ligada ao job da CI |
| [[11-testes-e-cobertura]] **§7.3** (nova) | o contrato da medição: asserções **relacionais** contra um `SarakButton` vivo na mesma página (não tabela de pixel), âncora por `getByRole`, três faixas de dispositivo, e os **seis limites R18** resumidos — com destaque para o quinto, que é o que morde: `dist/` velho faz a medição medir o passado |
| [[16-integracao-continua]] §5 | a linha *"CSS renderizado em browser real"* saiu da tabela do que a CI **não** cobre, marcada como **fechada**, com o que continua fora nomeado ao lado |
| [[16-integracao-continua]] **§4.2.1** (nova) | por que o job é **separado** do `gates`: o binário do Chromium é o item caro e o `gates` é o único nome em `required_status_checks` — inflar o check que trava merge faria todo push pagar por uma medição de cromo |
| [[16-integracao-continua]] §4.3 | linha do job na tabela de custo, **declarando que o número de runner limpo ainda não existe** |
| [[00-contexto]] §3 | a prosa dizia *"não há E2E nem regressão visual"* — passou a mentir pela metade e foi corrigida. **É o ponteiro que um revisor esquece**, e estava previsto na §8 desta plan |

### A tabela §7.1 do que se perdeu NÃO foi apagada

Ela lista quatro coberturas que sumiram com o aparato de 2026-08-18. **Nenhuma delas foi recuperada por
esta plan** — a medição nova cobre o cromo, não o não-vazamento do modo embarcado (R24), nem o boot do
painel, nem `var()` resolvendo, nem regressão visual dos 8 componentes. Apagar a tabela porque "agora tem
browser" teria trocado uma verdade específica por uma vaga.

### Deliberadamente NÃO transportado

- **O custo em runner limpo.** Ninguém mediu — só a ordem de grandeza (~310 MiB + ~34 s local, com cache).
  A spec **declara que não foi medido** em vez de publicar um número inventado.
- **O `border-radius` anômalo** (12px onde se esperava pílula). Não foi isolado; virou [[00-backlog]] **12**.
  Spec fixa não carrega hipótese não confirmada.
- **O incidente do lockfile.** É defeito corrigido — vive no veredito e no Git, não em spec fixa.

### `00-contexto` revisado — e desta vez ELE MUDOU

Diferente das sínteses anteriores, a checagem do `00-contexto` **produziu edição**: a §3 afirmava, em prosa,
que não há E2E nem regressão visual. Metade disso deixou de valer. Vale como lembrete de que *"nada a
mudar"* é resultado legítimo da checagem, mas só depois de fazê-la.

### O que esta plan fecha, e o que ela não fecha

Ela entrega o instrumento que **faltava desde sempre**: a base tinha ~36 gates que provam estrutura — token,
classe emitida, DOM, contraste, paridade — e **nenhum** que olhasse resultado renderizado. Foi por isso que
a regressão de métrica do cromo atravessou tudo verde e só apareceu por comparação manual com um build de
junho.

**O que ela não fecha:** a medição cobre o **cromo**, no tema **default**, em **Chromium**. Não é uma rede
geral de regressão visual, e a §7.3 diz isso com todas as letras.
