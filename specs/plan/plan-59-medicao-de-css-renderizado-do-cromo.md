---
tipo: "plan"
titulo: "Medir o CSS renderizado do cromo em navegador real, dentro da CI"
objetivo: "Fechar o vão declarado do CSS renderizado em navegador real, medindo a métrica do cromo num job de CI que roda pelo caminho real"
dominio: "Sarak-Lib-UI-Core / Testes e Integração Contínua"
status: "🔴 A executar"
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
