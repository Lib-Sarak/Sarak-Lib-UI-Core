---
tipo: "processo"
titulo: "Contexto do Repositório — Briefing de Entrada"
dominio: "Governança de Specs (SDD)"
status: "🟢 Vigente"
tags: ["processo", "contexto", "sdd"]
relacionados: ["[[00-knowledge]]", "[[00-indice]]", "[[00-prompt-revisor]]", "[[00-prompt-executor]]"]
---

# 0. O que é este arquivo

Esta é a **porta de entrada de qualquer agente** neste repositório. Um agente que leu esta spec — e só ela —
deve saber: **o que** o repositório é, **quais regras** governam qualquer alteração, **onde** está cada
informação e **como** se trabalha aqui.

> ⚠️ **Este arquivo é um molde com instruções embutidas.** Ele chega ao repositório **vazio de conteúdo
> específico**: cada seção traz um bloco `> **Como escrever:**` (a instrução, que **permanece** no arquivo como
> contrato de manutenção) e um bloco `<!-- PREENCHER -->` (o conteúdo real, que o **agente revisor** escreve).
> Preencher esta spec é a **primeira** plan de qualquer repositório novo.

**Quem escreve/atualiza:** exclusivamente o **agente revisor** ([[00-prompt-revisor]]).
**Quando atualizar:** sempre que uma plan aprovada mudar stack, arquitetura, fronteiras de módulo, regra
inegociável ou o mapa de roteamento. Nunca por conta própria fora de uma plan.

---

# 1. Identidade do repositório

> **Como escrever:** 3 a 6 linhas, em prosa direta. Responda: **o que este repositório é** (produto? base de
> conhecimento? biblioteca? site?), **qual problema resolve**, **quem consome** (usuário final, outros repos,
> agentes) e **o que ele explicitamente NÃO é**. Sem marketing, sem histórico. Um agente lê isto e para de
> supor. Proibido descrever a estrutura de pastas aqui — isso é da §3.

**`@sarak/lib-ui-core` é uma biblioteca React de Design System** — não um app, não um serviço, não tem backend.
Ela resolve o problema de o host ter identidade visual própria sem reescrever componentes: um Design Engine
central resolve 409 tokens em tempo de execução, e os componentes leem esses tokens em vez de terem estilo
fixo.

**Quem consome:** outros repositórios React (hoje o ERP Earendel), por dependência **git com tag**, nunca por
registry npm. O consumo é feito de dois modos ortogonais — como **host do Shell** (a lib desenha o cromo) ou
como **kit de componentes** com o Provider (o host desenha o seu).

**O que ela NÃO é:** não é aplicação, não tem servidor, não persiste nada por conta própria e **não impõe
marca** — a identidade visível é sempre do host ([[adr/006-zero-marca-soberania-host]]).

---

# 2. Regras inegociáveis (resumo operante)

> **Como escrever:** liste **apenas** as regras que um agente pode violar sem perceber, em forma de bullets
> curtos e verificáveis. Duas fontes, nesta ordem:
> 1. **Universais do ecossistema** — não reescreva: aponte para `CLAUDE.md` (raiz) e para a skill
>    `padrao-escrita`. Cite no máximo os limiares que causam reprovação imediata (SRP; função ≤ 40 linhas;
>    aninhamento ≤ 3; ≤ 4 parâmetros; zero hardcoded; segredos só em `.env`; consumo só via `api/` de outro
>    módulo; `shared/` sem lógica).
> 2. **Específicas deste repositório** — o que só vale aqui (convenções de nomes locais, uma biblioteca
>    proibida, um diretório que não se toca, um formato de retorno obrigatório).
>
> **Regra de ouro: referencie, nunca duplique.** Se uma regra já está numa spec fixa ou numa skill, escreva
> uma linha e o ponteiro. Conteúdo duplicado desatualiza e passa a mentir.

**Universais do ecossistema:** `CLAUDE.md` da raiz + skill `padrao-escrita` + `padrao-typescript`. Não são
reescritas aqui.

**Específicas deste repositório** — as **32 regras** vivem em [`specs/00-regras-e-invariantes.md`](specs/00-regras-e-invariantes.md)
(**29 verificáveis e 3 de conduta**, cada uma com o estado da verificação: ✅ · ⚠️ · ⏳ · 🔴). As cinco que um agente viola sem perceber:

- **O código é a fonte da verdade.** Onde um documento desta pasta contradiz o código, **o código vence**.
  Toda afirmação estrutural tem de ser confirmável por `arquivo:linha`. Spec que descreve código inexistente é
  pior que spec nenhuma: custa a mesma leitura e entrega instrução errada com a autoridade de estar versionada.
- **Nunca transcreva fonte viva** *(R17)*. Lista de tokens, de componentes, de props ou de ícones **não** é
  copiada para markdown — aponte para o artefato gerado (`docs/component-catalog.json`, `sarak-ui/catalog.json`)
  ou para a função que a produz. Cópia estática vira mentira na primeira mudança de código.
- **Paridade 1:1:1 dos tokens.** Schema ↔ `theme_table_mapping` ↔ partições do catálogo têm de bater
  (hoje 409/409/409). Detalhe em [`arquitetura/04-contrato-de-tokens-e-paridade.md`](arquitetura/04-contrato-de-tokens-e-paridade.md).
- **Zero marca.** Nenhum nome, logo ou cor da Sarak vaza para a UI do host ([[adr/006-zero-marca-soberania-host]]),
  cobrado por `npm run zero-brand:check`.
- **O `run_audit` NÃO está em zero.** Existe dívida conhecida e medida. **Leia
  [`specs/01-gates-e-baseline.md`](specs/01-gates-e-baseline.md) antes de rodar qualquer gate** — acusar
  regressão onde há dívida registrada custa uma rodada inteira de trabalho.

---

# 3. Stack e arquitetura em uma página

> **Como escrever:** o mínimo para orientar, com ponteiro para o detalhe. Inclua:
> - **Stack**: linguagens + versões, frameworks, banco, runtime, gerenciador de pacotes.
> - **Camada de padrão da linguagem**: qual skill `padrao-*` se aplica (`padrao-python`, `padrao-typescript`,
>   `padrao-go`, `padrao-java`).
> - **Mapa de módulos/domínios**: tabela `módulo → responsabilidade → onde vive (backend/frontend)`.
> - **Fronteiras**: quem pode chamar quem, e por onde (contrato `api/`).
> - **Comandos vitais**: instalar, rodar, testar, lintar, buildar — copiáveis, verificados.
>
> Cada item aponta para a spec fixa em `arquitetura/` que o detalha. Esta seção é o índice, não o tratado.

**Stack:** TypeScript + React `>=18` (peer) · Tailwind CSS `>=4` · build `tsup` (ESM + CJS + DTS) ·
testes `vitest` + `playwright-ct` · gerenciador **npm** · distribuída por **git com tag**, sem registry
([[adr/007-distribuicao-por-git]] · [[adr/008-releases-com-tag-e-semver-em-git]]). Versão atual: **1.2.0**.

**Camada de padrão da linguagem:** skill `padrao-typescript` (+ `padrao-escrita`, sempre).

| Bloco | Responsabilidade | Detalhe em |
|---|---|---|
| `src/core/Design/` | O Design Engine: 28 schemas → `MASTER_DESIGN_MAP` → 409 tokens | [`arquitetura/02`](arquitetura/02-design-engine.md) |
| `src/core/Provider/` | `SarakUIProvider`, validação da fronteira, tipos gerados | [`arquitetura/04`](arquitetura/04-contrato-de-tokens-e-paridade.md) |
| `src/core/Shell/` · `Discovery/` | Cromo, rotas e os módulos-plugin | [`specs/04`](specs/04-shell-e-discovery.md) · [`specs/05`](specs/05-cromo-e-slots.md) |
| `src/core/Security/` | Sanitização e limites anti-DoS | [`specs/10`](specs/10-seguranca-e-acessibilidade.md) |
| `src/components/` | `atomic/` (átomos) · `engines/` (motores lazy) · `Layout/` | [`arquitetura/03`](arquitetura/03-superficie-publica.md) |
| `src/features/DesignEngine/` | Painel de customização e preview | [`specs/06`](specs/06-painel-de-customizacao-e-preview.md) |

**Fronteiras de dependência:** só **duas** regras são cobradas (`components/` não importa `features/`;
`core/` não importa `components/`). As demais pastas (`shared/`, `styles/`, `effects/`, `constants/`,
`types/`) **não são cobradas por nenhum auditor** — está declarado em
[`arquitetura/00-mapa-do-modulo.md`](arquitetura/00-mapa-do-modulo.md) §96.

**Comandos vitais** (todos verificados):

| Para | Comando |
|---|---|
| Suíte completa | `npx vitest run` |
| Auditoria estrutural (8 auditores) | `npm run audit` — **compare com o baseline, não com zero** |
| Todos os gates de release | `npm run gates:full` |
| Barril público ↔ componentes | `npm run barrel:check` |
| Catálogo · kit do consumidor · kit do mantenedor | `npm run catalog:check` · `guide:check` · `dev-kit:check` |
| Build (roda 4 gates antes) | `npm run build` |
| Emitir release (gates + tag + push) | `npm version <major\|minor\|patch>` — ⚠️ **só o usuário roda** (§7) |

## 3.1 Release e tag — o que bloqueia o push

O consumidor resolve a versão por **tag** (`#semver:^1.x`), não por commit. Daí decorrem quatro fatos que um
agente descobre do jeito difícil se não estiverem escritos:

- **Mudou o artefato publicado, precisa de tag nova.** O anel de `pre-push` (`gates/scripts/release/check-release-tag.mjs`)
  compara `dist/` + `sarak-ui/` entre a última tag e o HEAD e **bloqueia o push** se mudaram sem tag nova.
  Sem ela o importador fica no artefato antigo **em silêncio** — é o incidente que o [[adr/007-distribuicao-por-git]]
  registra. Não é release? `--no-verify` é a saída legítima, e é decisão do usuário.
- **O nível vem da superfície pública, não das mensagens de commit.** A sugestão que o gate imprime é derivada
  dos prefixos `feat:`/`fix:` e **não é decisão**. O critério real: compare os identificadores exportados de
  `dist/index.d.ts` entre a tag e o HEAD — **só aditivo → `minor`**; **símbolo removido ou tipo alterado →
  `major`**; nenhum dos dois → `patch`. Prosa de JSDoc que entra e sai **não** conta como superfície.
- **`npm version` exige árvore limpa** e aborta com *"Git working directory not clean"*. Aprovar um comando
  novo durante a execução pode sujar `.claude/settings.json`, que é versionado — commite antes.
- **Ele publica sozinho:** `preversion` roda `gates:full`, `version` regenera `dist/` + `sarak-ui/` **no mesmo
  commit** (é o que o anel cobra) e `postversion` faz `git push --follow-tags`. Por isso a §7 o reserva ao usuário.

Detalhe completo em [`specs/03-versionamento-e-release.md`](specs/03-versionamento-e-release.md).

---

# 4. Mapa de roteamento — "que spec eu leio para esta tarefa?"

> **Como escrever:** esta é a seção **mais valiosa** do arquivo e a razão de ele existir. Uma tabela que
> responde à pergunta que todo agente faz ao receber uma tarefa. Uma linha por tipo de tarefa recorrente
> no repositório, com caminhos **relativos a `specs/`** e clicáveis.
>
> Preencha a coluna "Leia antes" com **specs fixas** (`arquitetura/`, `specs/`, `adr/`) — para skills e
> commands, aponte para [[00-knowledge]], que é o roteador de capacidades.
>
> | Tipo de tarefa | Leia antes (specs fixas) | Capacidade |
> |---|---|---|
> | Alterar regra de negócio de \<módulo\> | `specs/NN-<modulo>.md` | [[00-knowledge]] |
> | Criar/alterar endpoint | `arquitetura/NN-api.md` + spec do módulo | [[00-knowledge]] |
> | Mexer em schema/migration | `arquitetura/NN-dados.md` + ADR relevante | [[00-knowledge]] |
> | Mudar decisão estrutural | todos os `adr/` + `arquitetura/` | [[00-knowledge]] |
>
> Mantenha entre 6 e 15 linhas. Se passar disso, o repositório precisa de specs melhores, não de mais linhas
> aqui. **Ponteiro órfão é defeito**: toda spec citada tem de existir.

> ⚠️ **Este repositório tem skills LOCAIS**, em `.agents/skills/` — o [[00-knowledge]] é universal e não as
> conhece. A coluna *Capacidade* da §4 é o único roteador delas. Skill local é **procedimento**; a spec fixa
> é a **regra**. As duas se leem juntas.
>
> **A verificação é do gate, não da skill.** Nenhuma skill invoca validador direto; quem executa é o
> `package.json` e, adiante, o pipeline de CI/CD. O inventário de quem executa o quê está em
> [`specs/00-regras-e-invariantes.md`](specs/00-regras-e-invariantes.md) §4.1.

| Tipo de tarefa | Leia antes (specs fixas) | Capacidade |
|---|---|---|
| Adicionar token ou componente novo | `arquitetura/04` + `specs/00-regras-e-invariantes` | skill local `ui-novo-componente` |
| Remover/alterar assinatura de token | `arquitetura/04` | skill local `ui-refatorar-componente` |
| Mexer em CSS/estilo de componente | `arquitetura/02` | skill local `ui-arquitetura-design` |
| Criar tema | `specs/09-temas-e-presets` | skill local `ui-criar-tema` |
| Criar preset parcial | `specs/09-temas-e-presets` | skill local `ui-criar-preset` |
| Auditar a base / validar um PR | `specs/01-gates-e-baseline` | skill local `ui-auditoria-modulo` |
| Instalar a lib num consumidor | `specs/12` + `specs/13` | skill local `ui-integra-consumidor` |
| Mexer no Shell, rotas ou módulos-plugin | `specs/04-shell-e-discovery` | [[00-knowledge]] |
| Mexer no cromo ou nos slots | `specs/05-cromo-e-slots` | [[00-knowledge]] |
| Alterar a superfície pública (barril) | `arquitetura/03` + `specs/00-regras-e-invariantes` | [[00-knowledge]] |
| Emitir release / mudar versionamento | `specs/03-versionamento-e-release` + `adr/007` + `adr/008` | [[00-knowledge]] |
| Mudar gate, hook ou pipeline | `specs/02-enforcement-por-commit` + `specs/01` | [[00-knowledge]] |
| Escrever teste | `specs/11-testes-e-cobertura` | [[00-knowledge]] (`test-*`) |
| Mudar decisão estrutural | todos os `adr/` + `arquitetura/` | [[00-knowledge]] |

## 4.1 Ambientação — a ordem de leitura de quem chega

A tabela acima roteia **por tarefa**. Quem ainda não tem tarefa, e só precisa se ambientar, lê nesta ordem:

| # | Leia | Por quê |
|---|---|---|
| 0 | [`sarak-dev/START-HERE.md`](../sarak-dev/START-HERE.md) | O índice operacional e o **carimbo de estado** — números recontados a cada geração, nunca escritos à mão |
| 1 | [`specs/00-regras-e-invariantes.md`](specs/00-regras-e-invariantes.md) | **O contrato único.** As 32 regras em duas categorias, cada uma com o gate que a cobra — ou a admissão de que **nenhum** cobre |
| 2 | [`arquitetura/01-forma-do-produto-e-modos-de-consumo.md`](arquitetura/01-forma-do-produto-e-modos-de-consumo.md) | O que a lib **é** hoje, e os dois modos de consumo |
| 3 | [`arquitetura/00-mapa-do-modulo.md`](arquitetura/00-mapa-do-modulo.md) | Onde cada coisa mora e o que pode importar o quê |
| 4 | [`sarak-dev/GUIA-MANUTENCAO.md`](../sarak-dev/GUIA-MANUTENCAO.md) | O roteador de fluxos: o passo a passo do que você vai mexer e **qual spec é dona** daquilo |
| 5 | [`specs/01-gates-e-baseline.md`](specs/01-gates-e-baseline.md) | **Antes de rodar qualquer gate.** O `run_audit` **NÃO está em zero** |

Os **ADRs** (`adr/`) respondem *por quê*. Leia-os quando a pergunta for "por que isto é assim?" ou antes de
propor reverter uma decisão — é o que evita repropor o que já falhou. São **imutáveis**: decisão errada não se
edita, cria-se um ADR novo (protocolo em [`adr/README.md`](adr/README.md)).

> Esta ordem veio da skill `ui-contexto-repositorio`, **removida em 2026-08-01** (plan-02): ela reescrevia
> sete regras do contrato e competia com esta spec. A ordem de leitura era a única parte dela sem destino, e
> este é o destino.

---

# 5. Como se trabalha aqui (ciclo SDD)

> **Como escrever:** esta seção é **universal — copie o bloco abaixo como está**. Só acrescente desvios reais
> deste repositório (por exemplo: "toda plan que toca `pagamentos/` exige ADR"). Não reescreva o ciclo.

**Toda e qualquer alteração passa por uma spec.** Nada é alterado "direto no código".

```
revisor escreve  specs/plan/plan-NN-<slug>.md
      ↓
executor lê  00-prompt-executor  +  plan-NN  e executa
      ↓
alterações ficam no worktree (nenhum agente commita)
      ↓
revisor VERIFICA diretamente (não confia no resumo do executor)
      ├─ reprovado → prompt de correção → executor corrige → repete
      └─ aprovado  → status da plan + [[00-indice]] atualizados
      ↓
usuário commita
      ↓
periodicamente: /spec-atualizar sintetiza as plans aprovadas nas specs fixas (adr/ · arquitetura/ · specs/)
```

| Papel | Spec de entrada | Pode escrever | Nunca faz |
|---|---|---|---|
| **Revisor** | [[00-prompt-revisor]] | specs, prompts, mensagens | tocar código · commitar |
| **Executor** | [[00-prompt-executor]] | código + resumo na própria plan | criar/alterar outras specs · commitar |
| **Usuário** | — | qualquer coisa | — (é quem commita e dispara `/spec-atualizar`) |

**Desvios deste repositório:**

- **Plan que só toca `specs/` é executada pelo próprio revisor.** O executor tem proibição explícita de criar
  ou editar spec ([[00-prompt-executor]] §7.3, que nomeia `00-contexto` e `00-indice`). Plan de documentação
  entra na fila normalmente, mas o campo *executor* dela é o revisor.
- **O usuário nomeia as specs no prompt.** Via de regra, é ele quem diz ao agente quais specs ler. O ritual de
  entrada dos dois prompts continua obrigatório — a menção do usuário reforça, não substitui.
- **Nada é apagado sem destino demonstrado.** Ao remover um documento, mostre onde o conteúdo dele foi parar.
  Sem destino provado, o arquivo não sai — vira divergência.
- **Só sai o que foi EXECUTADO.** Item ainda aberto migra íntegro para o artefato seguinte. Apagar etapa não
  executada não limpa nada: destrói trabalho que ninguém fez e que ninguém vai lembrar de refazer.
- **Documento permanente não carrega histórico de execução.** "Antes era assim, agora é assado" vai para um
  `adr/` (se foi decisão) ou para `docs/migracoes.md` (se afeta o consumidor) — nunca para uma spec fixa.

---

# 6. Capacidades disponíveis

> **Como escrever:** seção **universal — não a preencha com conteúdo**. Apenas mantenha o ponteiro. As
> skills, commands, agents e hooks **não vivem neste repositório**: vêm da memória/plugin do agente. O
> catálogo e as regras de roteamento estão em [[00-knowledge]].

Antes de escolher **como** fazer algo, leia **[[00-knowledge]]** — é o roteador de capacidades
(situação → skill/command/agent/hook) e o único lugar onde esse catálogo é mantido.

---

# 7. Fronteiras — o que nunca fazer neste repositório

> **Como escrever:** bullets no imperativo negativo, cada um com o **porquê** em meia linha. Só o que é
> específico deste repositório (as proibições de papel já estão na §5 e nas specs de prompt). Exemplos do
> tipo de item: diretórios gerados que não se editam à mão; arquivos que só o usuário altera; operações
> irreversíveis que exigem confirmação; integrações que não podem ser chamadas em desenvolvimento.

- **Não edite `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` nem
  `src/core/Provider/generated/`** — são **gerados**. Edite a fonte e rode o gerador; edição à mão morre no
  próximo build e o gate acusa.
- **Não apague `.agents/skills/ui-integra-consumidor/`** — é a **fonte** do kit do consumidor
  (`scripts/consumer-kit/kitFiles.mjs:22`). Removê-la derruba `guide:check`, que roda dentro do `npm run build`.
- **Não commite, e não empurre.** Quem commita é o usuário — vale para todo agente, sem exceção e sem
  co-autoria.
- **Não rode `npm version` por conta própria.** Ele cria tag e faz `push` no `postversion`: é publicação, e
  publicação é decisão do usuário. O que fazer quando o push é bloqueado está na §3.1.
- **Não contorne gate, hook ou teste.** Bloqueio é informação; corrija a causa. Contornar reprova a execução
  inteira.
- **Não invente gate para preencher tabela.** Regra sem gate é declarada como conduta, em negrito. Gate falso é
  pior que lacuna declarada.

---

# 8. Estado e pendências conhecidas

> **Como escrever:** o que um agente descobriria do jeito difícil. Dívidas técnicas aceitas, áreas em
> migração, incoerências conhecidas entre código e spec, decisões em aberto. **Datas sempre absolutas**
> (`2026-07-31`, nunca "semana passada"). Item resolvido sai daqui — esta seção não é histórico; o histórico
> é o `git` e os `adr/`.

- **A dívida conhecida está catalogada** em [`specs/15-divida-conhecida.md`](specs/15-divida-conhecida.md):
  **14 achados abertos** (de 31 numerados), cada um com arquivo:linha, exposição medida, **a regra que viola** e
  **destino decidido pelo dono** (triagem de 2026-08-01). Não é lista de desejos — é o que já foi verificado no
  código e ainda não foi corrigido. Leia antes de "descobrir" um problema.
- **Gate que nunca existiu não é dívida — é implementação posterior** *(decisão do dono, 2026-08-01)*. A ordem
  é: **fechar o conjunto de regras primeiro, construir a verificação depois.** Gate erguido antes de a régua
  estar pronta cobra a régua errada, e gate errado custa mais que gate ausente porque ninguém desconfia dele. Os
  **5 gates em fila** e as **4 ampliações de escopo** estão em
  [`specs/15-divida-conhecida.md`](specs/15-divida-conhecida.md) §4 — fora da contagem de dívida, de propósito.
- **O `run_audit` fecha em exit 1 no HEAD limpo** (2 regras estruturais em vermelho). O baseline exato está em
  [`specs/01-gates-e-baseline.md`](specs/01-gates-e-baseline.md).
- **Padrão recorrente, ainda não medido: o escopo do gate é menor que o escopo da regra.** Quatro casos
  independentes já apareceram — sempre por acaso. Quantos faltam é desconhecido, e é o que a plan de auditoria
  de cobertura existe para responder.
- **`src/core/Provider/generated/design-token-ids.ts` está defasado em 105 tokens** (304 publicados × 409
  reais) e o gerador não está registrado em script, hook ou skill nenhuma. O número falso **vaza para o
  consumidor** via `sarak-ui/catalog.json`.
- **O ERP Earendel é o único consumidor** e está em desenvolvimento simultâneo, consumindo por **caminho
  local** (`file:`) — decisão do dono enquanto os dois repositórios são ajustados juntos; a migração para
  `github:…#semver:` vem depois. **Alinhado em 2026-08-02** (plan-04 🟢): workspace com 13 projetos, lockfile
  canônico, lib **1.2.0**, junctions manuais substituídas pelo elo do gerenciador e aviso de defasagem no
  `predev`. ⚠️ **`file:` é cópia no store do pnpm, não link** — todo rebuild da lib exige
  `pnpm install --force --filter @erp/ui-kit` no ERP para chegar lá. Medir a lib por um ERP não reinstalado é
  medir o passado.
- **Migração em curso (2026-08-01):** este fluxo SDD substituiu o modelo de "campanha em três arquivos fixos"
  em `plan/`. Plans antigas foram sintetizadas nas specs fixas e removidas; o histórico está no git.

**Aceito como característica — não proponha conserto para isto:**

- **Os 5 `dangerouslySetInnerHTML` de `src/` são a forma como a engine injeta CSS, e são legítimos.**
  Auditados um a um em 2026-08-01: `DesignScope.tsx:54`, `DesignInjector.tsx:173` e
  `SovereignThemeInjector.tsx:116` recebem CSS derivado de `design` — que já passou por `validateDesign`, o
  qual bloqueia breakout `[<>{};]` (R6). `PreviewCanvas.tsx:181` e `MasterControlPanel.tsx:199` são **literais
  estáticos**, sem interpolação. **Nenhum recebe HTML de origem não confiável.**
- **`chromeSlots` publica 9 entradas para 8 regiões, e está certo assim.** `topbarActions` é alias legado de
  `topbarEnd`; o coletor deriva por **tipo** (`ReactNode` opcional), não por semântica, e o `doc` do próprio
  slot avisa o consumidor de que é alias. Consertar o coletor custa mais que declarar a imprecisão.
- **O token de breakpoint alcança o CSS, não as classes utilitárias.** `useDesignVariables.ts:58` lê
  `design.breakpointTablet` e gera a media-query; as classes `@min-[768px]` de `useStructuralStyles*` são
  resolvidas em **build-time** pelo Tailwind e **não aceitam `var()`** — limitação da ferramenta, não omissão.
  O alinhamento do detector JS (`DeviceProvider`) **é** dívida e está na §3 da spec de dívida.

---

# 9. Contrato de manutenção desta spec

- **Alvo de tamanho:** ≤ 200 linhas preenchidas. Estourou? O conteúdo pertence a uma spec fixa — mova e aponte.
- **Referencie, nunca duplique.** Esta spec é um **mapa**, não território.
- **Ponteiro órfão é defeito.** Toda spec citada existe; todo comando citado roda.
- **Só o revisor edita**, e só no contexto de uma plan aprovada.
- **Sincronia obrigatória:** se uma plan mudou stack, fronteira ou regra, a mesma plan atualiza esta spec.
  Contexto desatualizado é pior que contexto ausente — o agente confia nele.
