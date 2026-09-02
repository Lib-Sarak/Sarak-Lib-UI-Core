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
central resolve o dicionário inteiro de tokens em tempo de execução, e os componentes leem esses tokens em vez
de terem estilo fixo.

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

**Específicas deste repositório** — as regras vivem em [`specs/00-regras-e-invariantes.md`](specs/00-regras-e-invariantes.md),
em **duas categorias** (verificáveis e de conduta), cada uma com o estado da verificação: ✅ · ⚠️ · ⏳ · 🔴.
Quantas são se conta com `grep -c "^## R"` naquele arquivo — **não presuma o número**. As cinco que um agente
viola sem perceber:

- **O código é a fonte da verdade.** Onde um documento desta pasta contradiz o código, **o código vence**.
  Toda afirmação estrutural tem de ser confirmável por `arquivo:linha`. Spec que descreve código inexistente é
  pior que spec nenhuma: custa a mesma leitura e entrega instrução errada com a autoridade de estar versionada.
- **Nunca transcreva fonte viva** *(R17)*. Lista de tokens, de componentes, de props ou de ícones **não** é
  copiada para markdown — aponte para o artefato gerado (`docs/component-catalog.json`, `sarak-ui/catalog.json`)
  ou para a função que a produz. Cópia estática vira mentira na primeira mudança de código.
- **Paridade 1:1:1 dos tokens.** Schema ↔ `theme_table_mapping` ↔ partições do catálogo têm de bater — o que
  vale é a **convergência**, e o número vive em `npm run audit` → `auditor_paridade` e em
  `sarak-dev/state.json` → `design.tokens`. Detalhe em [`arquitetura/04-contrato-de-tokens-e-paridade.md`](arquitetura/04-contrato-de-tokens-e-paridade.md).
- **Zero marca.** Nenhum nome, logo ou cor da Sarak vaza para a UI do host ([[adr/006-zero-marca-soberania-host]]),
  cobrado por `npm run zero-brand:check`.
- **O baseline do `run_audit` NÃO é zero — compare com ele, nunca com zero.** A fonte viva é
  `gates/baselines/audit-baseline.json`, versionado, regravado a cada plan que conserta ou constrói gate; o
  `tsc` tem baseline próprio dentro do mesmo JSON. **Leia [`specs/01-gates-e-baseline.md`](specs/01-gates-e-baseline.md)
  antes de rodar qualquer gate** — é ela que ensina a ler cada saída. **Não presuma nenhum desses valores:**
  quem os afirma em prosa acerta por um dia e mente pelo resto.

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
testes `vitest` — **não há E2E nem regressão visual** ([[specs/11-testes-e-cobertura]] §7) · gerenciador
**npm** · distribuída por **git com tag**, sem registry
([[adr/007-distribuicao-por-git]] · [[adr/008-releases-com-tag-e-semver-em-git]]). A versão vive em
`package.json`; a linha publicada é `git tag`; e o **motivo de cada MAJOR** está em
[`specs/03-versionamento-e-release.md`](specs/03-versionamento-e-release.md).

**Camada de padrão da linguagem:** skill `padrao-typescript` (+ `padrao-escrita`, sempre).

| Bloco | Responsabilidade | Detalhe em |
|---|---|---|
| `src/core/Design/` | O Design Engine: 28 schemas → `MASTER_DESIGN_MAP` → o dicionário de tokens | [`arquitetura/02`](arquitetura/02-design-engine.md) |
| `src/core/Provider/` | `SarakUIProvider`, validação da fronteira, tipos gerados | [`arquitetura/04`](arquitetura/04-contrato-de-tokens-e-paridade.md) |
| `src/core/Shell/` · `Discovery/` | Cromo, rotas e os módulos-plugin | [`specs/04`](specs/04-shell-e-discovery.md) · [`specs/05`](specs/05-cromo-e-slots.md) |
| `src/core/Security/` | Sanitização e limites anti-DoS | [`specs/10`](specs/10-seguranca-e-acessibilidade.md) |
| `src/components/` | `atomic/` (átomos) · `engines/` (motores lazy) · `Layout/` | [`arquitetura/03`](arquitetura/03-superficie-publica.md) |
| `src/features/DesignEngine/` | Painel de customização e preview | [`specs/06`](specs/06-painel-de-customizacao-e-preview.md) |

**Fronteiras de dependência:** só **duas** regras são cobradas (`components/` não importa `features/`;
`core/` não importa `components/`). As demais pastas (`shared/`, `styles/`, `effects/`, `constants/`,
`types/`) **não são cobradas por nenhum auditor** — está declarado em
[`arquitetura/00-mapa-do-modulo.md`](arquitetura/00-mapa-do-modulo.md), na seção da regra de dependência.

**Comandos vitais** (todos verificados):

| Para | Comando |
|---|---|
| Suíte completa | `npx vitest run` |
| Auditoria estrutural (todos os auditores de `run_audit.mjs`) | `npm run audit` — **compare com o baseline, não com zero** |
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
- **O `preversion` roda `gates:full`, e o `dev-kit:check` é o primeiro a barrar — quase sempre.** `sarak-dev/`
  é **gerado** e carrega números recontados a cada geração; qualquer leva que mude contagem (testes, gates,
  arquivos) o defasa. O conserto é `npm run dev-kit` + commit — **nunca** editar os arquivos à mão, que
  morrem na próxima geração enquanto o gate volta a acusar.
  > ✅ **O ritual de release NÃO é mais uma dessas causas** *(desde 2026-08-18)*. O gancho `version` passou a
  > regenerar os **três** kits que carimbam a `version` — consumidor, `dist/` e `sarak-dev/` — no mesmo commit
  > da tag. Antes disso, toda tag saía com o kit do mantenedor um release atrás e a release seguinte nascia
  > bloqueada por ela. Detalhe em [`specs/03-versionamento-e-release.md`](specs/03-versionamento-e-release.md) §6.
- **Ele publica sozinho:** `preversion` roda `gates:full`, `version` regenera `dist/` + `sarak-ui/` **no mesmo
  commit** (é o que o anel cobra) e `postversion` faz `git push --follow-tags`. Por isso a §7 o reserva ao usuário.
- **Todo MAJOR precisa da nota de migração ANCORADA — e isso virou gate** *(2026-08-19)*. O gancho `version`
  abre com `migration-anchor:check`: sem uma entrada em `docs/migracoes.md` cujo título cite `X.0.0` por
  extenso, o `npm version major` **para antes de criar a tag**. Um segundo gate, `minor-no-removal:check`,
  barra minor/patch que remova nome do barril público.

## 3.2 O trabalho não acontece mais na `main` *(desde 2026-08-18)*

`main` = **produção**; `develop` = **desenvolvimento**. Três consequências que um agente descobre do jeito
difícil:

- **O `pre-push` quase não dispara mais** — ele só age para `refs/heads/main`. A suíte completa e o anel de
  release passaram para a **CI**, que os roda em `push:develop`, `push:main` e no **PR, antes do merge**.
- **A `main` é protegida, com exceção de administrador — e a exceção é deliberada.** Sem ela o `postversion`
  seria recusado pela própria regra que a CI impõe, e o `npm version` morreria no último passo.
- **`--no-verify` deixou de ser invisível.** O job de CI roda a união dos anéis sem consultar o que foi pulado
  localmente.

Fluxo completo, gatilhos, custo medido e o que a CI **não** cobre:
[`specs/16-integracao-continua.md`](specs/16-integracao-continua.md).

Detalhe completo do release em [`specs/03-versionamento-e-release.md`](specs/03-versionamento-e-release.md).

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
> `package.json`, os hooks e — **desde 2026-08-18** — o pipeline de CI. O inventário de quem executa o quê
> está em [`specs/00-regras-e-invariantes.md`](specs/00-regras-e-invariantes.md) §4.1; **onde** cada gate roda
> está em [`specs/01-gates-e-baseline.md`](specs/01-gates-e-baseline.md) §2.2.1.
>
> ⚠️ **`git-ci-cd` é a primeira skill local não-`ui-*`, e ela é de uma classe diferente.** As demais
> executam; esta **só instrui** — o dono digita todo comando. O contrato que a governa é
> [`specs/17-contrato-de-operacao-git.md`](specs/17-contrato-de-operacao-git.md), e ele vale para **qualquer**
> agente, não só para ela.

| Tipo de tarefa | Leia antes (specs fixas) | Capacidade |
|---|---|---|
| Adicionar token ou componente novo | `arquitetura/04` + `specs/00-regras-e-invariantes` | skill local `ui-novo-componente` |
| Remover/alterar assinatura de token | `arquitetura/04` | skill local `ui-refatorar-componente` |
| Mexer em CSS/estilo de componente | `arquitetura/02` | skill local `ui-arquitetura-design` |
| Criar tema, ou preset parcial | `specs/09-temas-e-presets` | skill local `ui-criar-tema` · `ui-criar-preset` |
| Auditar a base / validar um PR | `specs/01-gates-e-baseline` | skill local `ui-auditoria-modulo` |
| Instalar a lib num consumidor | `specs/12` + `specs/13` | skill local `ui-integra-consumidor` |
| **Atualizar** a lib num consumidor (≠ instalar) | `specs/13-instalacao-e-atualizacao` — as duas camadas de cache entre o `dist/` e o navegador | skill local `ui-integra-consumidor` |
| Mexer no Shell, rotas ou módulos-plugin | `specs/04-shell-e-discovery` | [[00-knowledge]] |
| Mexer no cromo ou nos slots | `specs/05-cromo-e-slots` | [[00-knowledge]] |
| Alterar a superfície pública (barril) | `arquitetura/03` + `specs/00-regras-e-invariantes` | [[00-knowledge]] |
| **Operar Git**: commit, PR, merge na `main`, emitir release | `specs/17-contrato-de-operacao-git` (quem faz o quê) + `specs/03` + `specs/16` + `adr/008` | skill local **`git-ci-cd`** — ela **instrui, nunca executa** |
| Mudar gate, hook ou pipeline | `specs/02-enforcement-por-commit` + `specs/01` + `specs/16-integracao-continua` | [[00-knowledge]] |
| Escrever teste | `specs/11-testes-e-cobertura` | [[00-knowledge]] (`test-*`) |
| Mudar decisão estrutural | todos os `adr/` + `arquitetura/` | [[00-knowledge]] |
| **Registrar um achado que não é para agora** | [`00-backlog.md`](00-backlog.md) — uma linha, sem status e sem fila; só o **usuário** promove | quem escreve é o revisor |

## 4.1 Ambientação — a ordem de leitura de quem chega

A tabela acima roteia **por tarefa**. Quem ainda não tem tarefa, e só precisa se ambientar, lê nesta ordem:

| # | Leia | Por quê |
|---|---|---|
| 0 | [`sarak-dev/START-HERE.md`](../sarak-dev/START-HERE.md) | O índice operacional e o **carimbo de estado** — números recontados a cada geração, nunca escritos à mão |
| 1 | [`specs/00-regras-e-invariantes.md`](specs/00-regras-e-invariantes.md) | **O contrato único.** As regras em duas categorias, cada uma com o gate que a cobra — ou a admissão de que **nenhum** cobre |
| 2 | [`arquitetura/01-forma-do-produto-e-modos-de-consumo.md`](arquitetura/01-forma-do-produto-e-modos-de-consumo.md) | O que a lib **é** hoje, e os dois modos de consumo |
| 3 | [`arquitetura/00-mapa-do-modulo.md`](arquitetura/00-mapa-do-modulo.md) | Onde cada coisa mora e o que pode importar o quê |
| 4 | [`sarak-dev/GUIA-MANUTENCAO.md`](../sarak-dev/GUIA-MANUTENCAO.md) | O roteador de fluxos: o passo a passo do que você vai mexer e **qual spec é dona** daquilo |
| 5 | [`specs/01-gates-e-baseline.md`](specs/01-gates-e-baseline.md) | **Antes de rodar qualquer gate.** O baseline do `run_audit` **não é zero** — compare com `gates/baselines/audit-baseline.json`, nunca com zero (§2) |

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
demanda chega ao revisor
      ↓
TRIAGEM (00-prompt-revisor §4): "sobra verdade que um agente futuro precise ler?"
      ├─ NÃO → VIA DIRETA: a instrução vive só na conversa
      │        (sem arquivo, sem linha no índice, sem NN queimado)
      └─ SIM → VIA DA PLAN: revisor escreve specs/plan/plan-NN-<slug>.md
                            + linha no [[00-indice]]
      ↓
executor lê  00-prompt-executor  + a instrução (a plan, ou o bloco direto) e executa
      ↓
alterações ficam no worktree (nenhum agente commita)
      ↓
revisor VERIFICA diretamente (não confia no resumo do executor)
      ├─ reprovado → prompt de correção → executor corrige → repete
      └─ aprovado  → status da plan + [[00-indice]] atualizados
      ↓
usuário commita
      ↓
revisor SINTETIZA a plan nas specs fixas (adr/ · arquitetura/ · specs/) e a REMOVE,
na mesma ação — gatilho do usuário, nunca por conta própria (00-prompt-revisor.md §7.4)

          ── em qualquer ponto ──
achado que não é a tarefa de agora  →  [[00-backlog]]  (uma linha, sem fila, ninguém executa)
                                        só o usuário promove
```

| Papel | Spec de entrada | Pode escrever | Nunca faz |
|---|---|---|---|
| **Revisor** | [[00-prompt-revisor]] | specs, plans, [[00-backlog]], prompts, mensagens | tocar código · escrever no Git |
| **Executor** | [[00-prompt-executor]] | o que a §3.1 da plan declara no escopo + o resumo na própria plan | criar/alterar spec **por iniciativa própria** · escrever no Git |
| **Usuário** | — | qualquer coisa | — (é quem commita, **autoriza a síntese** e **promove** item do backlog) |

**Desvios deste repositório:**

- **O papel não muda com o tipo de alvo.** Quem executa é sempre o **executor**; quem aprova é sempre o
  **revisor** — inclusive em plan que só escreve documento *(decisão do dono, 2026-09-02: "agente revisor
  apenas escreve specs e plan, agente executor faz as alterações e o revisor aprova")*. Isto **substitui** o
  desvio anterior, que mandava o revisor executar plan de `specs/`; o que restringe o executor agora está na
  [[00-prompt-executor]] §7.3, e é mais estreito: ele nunca cria nem edita spec **por iniciativa própria**,
  mas edita o arquivo que a §3.1 da plan declara dentro do escopo.
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
- **NUNCA adicione co-autoria — este eixo não tem exceção.** Nenhuma linha `Co-Authored-By` de agente, em
  hipótese nenhuma. ⚠️ **E o alcance inclui o commit que um agente apenas INSTRUI**, inclusive dentro de uma
  sequência de release ([`specs/17-contrato-de-operacao-git.md`](specs/17-contrato-de-operacao-git.md) §4).
- **Não escreva no Git por iniciativa própria.** `commit`, `push`, `merge`, `tag`, `npm version`: a escrita é
  do dono, e o padrão é o agente **instruir** — ele entrega o comando pronto e quem digita é o dono. A **única**
  porta é o dono **solicitar e autorizar** naquela conversa, e ela vale para aquele ato, não para os seguintes
  ([`specs/17`](specs/17-contrato-de-operacao-git.md) §2.0 · [`adr/012`](adr/012-escrita-git-sob-autorizacao-do-dono.md)).
  **Ler é livre e esperado** — `status`, `log`, `diff`, `fetch`, os `*:check`. As seis proibições absolutas,
  que autorização nenhuma dissolve, estão na §3 daquela spec.
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

- **A dívida conhecida está catalogada** em [`specs/15-divida-conhecida.md`](specs/15-divida-conhecida.md),
  cada achado com arquivo:linha, exposição medida, **a regra que viola** e **destino decidido pelo dono**. Não
  é lista de desejos — é o que já foi verificado no código e ainda não foi corrigido. **Quantos estão abertos,
  só aquela spec diz**; leia-a antes de "descobrir" um problema.
- **Gate que nunca existiu não é dívida — é implementação posterior** *(decisão do dono, 2026-08-01)*. A ordem
  é: **fechar o conjunto de regras primeiro, construir a verificação depois.** Gate erguido antes de a régua
  estar pronta cobra a régua errada, e gate errado custa mais que gate ausente porque ninguém desconfia dele. A
  fila deles vive na seção de implementação posterior de
  [`specs/15-divida-conhecida.md`](specs/15-divida-conhecida.md) — fora da contagem de dívida, de propósito.
- **Padrão recorrente e JÁ MEDIDO: o escopo do gate costuma ser menor que o escopo da regra.** Ele apareceu
  quatro vezes por acaso antes de alguém procurá-lo de propósito; a varredura sistemática existe e é a
  **matriz de cobertura** de [`specs/01-gates-e-baseline.md`](specs/01-gates-e-baseline.md), que lista vão a
  vão o que cada gate não enxerga. **R18 nasceu daí** — todo gate declara, no próprio código, o que não vê.
- **O ERP Earendel é o único consumidor** e está em desenvolvimento simultâneo, consumindo por **caminho
  local** (`file:`) — decisão do dono enquanto os dois repositórios são ajustados juntos; a migração para
  `github:…#semver:` vem depois. É um workspace pnpm com 13 projetos e lockfile canônico.
- 🔴 **Entre o `dist/` da lib e a tela do consumidor existem DUAS camadas de cache, e as duas falham em
  silêncio.** É a armadilha mais cara desta base — já custou três rodadas de investigação **na lib**, que
  estava certa nas três. (1) `file:` no pnpm é **cópia no store, não link**: todo rebuild exige
  `pnpm install --force --filter <pacote>`. (2) O **pré-bundle do bundler** (Vite: `node_modules/.vite/`)
  re-otimiza por lockfile + versão + config, **nunca por conteúdo** — com dependência local nenhum dos três
  muda, e o dev server segue servindo o build anterior. **Medir a lib por um consumidor não reinstalado, ou
  com o cache do bundler quente, é medir o passado.** O `sarak-ui check` avisa da segunda camada com rótulo
  próprio; o procedimento na ordem certa — inclusive **provar a deleção** — está em
  [`specs/13-instalacao-e-atualizacao.md`](specs/13-instalacao-e-atualizacao.md) §9.1.
- ⚠️ **Valor persistido vence default, por desenho.** Um consumidor que salvou tema não recebe mudança de
  `defaultValue` de token nenhum — e o painel de Design oferece cada valor do schema como opção clicável.
  Consequência para quem projeta token: **trocar o default não conserta um valor ruim; só muda quem cai
  nele por omissão.** Detalhe em [`specs/09-temas-e-presets.md`](specs/09-temas-e-presets.md) §4.4.
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
  O alinhamento do detector JS (`DeviceProvider`) **não é mais dívida**: fechou com a `plan-08` (F5,
  2026-08-04) — ele passou a receber os breakpoints do tema por contexto. Achado 11, fechado, em
  [`specs/15-divida-conhecida.md`](specs/15-divida-conhecida.md).

---

# 9. Contrato de manutenção desta spec

- **Alvo de tamanho:** ≤ 200 linhas preenchidas. Estourou? O conteúdo pertence a uma spec fixa — mova e aponte.
- **Referencie, nunca duplique.** Esta spec é um **mapa**, não território.
- **Ponteiro órfão é defeito.** Toda spec citada existe; todo comando citado roda.
- **Só o revisor edita esta spec.** Em regra, no contexto de uma plan — e **também fora do ciclo, quando o
  usuário pede** ([[00-prompt-revisor]] §3). O que nenhum agente faz é editá-la por iniciativa própria.
- **Sincronia obrigatória:** se uma plan mudou stack, fronteira ou regra, a mesma plan atualiza esta spec.
  Contexto desatualizado é pior que contexto ausente — o agente confia nele.
