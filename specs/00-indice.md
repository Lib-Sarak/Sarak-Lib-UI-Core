---
tipo: "processo"
titulo: "Índice de Execução — Mapa das Plans"
dominio: "Governança de Specs (SDD)"
status: "🟢 Vigente"
tags: ["processo", "indice", "sdd"]
relacionados: ["[[00-contexto]]", "[[00-prompt-revisor]]", "[[00-prompt-executor]]"]
---

# 0. O que é este arquivo

O **mapa de execução** do repositório: a ordem em que as specs de `plan/` devem ser executadas, suas
dependências e o estado de cada uma. Responde a três perguntas, sempre:

1. **O que executo agora?** (a primeira `🔴 A executar` sem dependência pendente)
2. **O que já foi feito e está esperando síntese?** (as `🟢 Aprovada`)
3. **Para onde cada plan vai depois?** (coluna *Destino*)

> ⚠️ **Este arquivo é um molde com instruções embutidas.** Os blocos `> **Como escrever:**` **permanecem** no
> arquivo como contrato de manutenção; as tabelas começam vazias e são mantidas pelo **agente revisor**.

**Quem escreve/atualiza:** exclusivamente o **agente revisor** ([[00-prompt-revisor]]).
**Quando atualizar:** ao criar uma plan (nova linha), ao aprovar/reprovar uma execução (mudança de status) e
após `/spec-atualizar` (movimentação para o histórico). **Toda mudança de status vive aqui e na própria plan —
as duas, sempre, na mesma ação.**

---

# 1. Fila de execução

> **Como escrever:** uma linha por plan **ativa** (não sintetizada), **em ordem de execução** — a ordem da
> tabela **é** o plano; não use a numeração para ordenar. Colunas obrigatórias, nesta ordem:
>
> - **#** — posição na fila (1, 2, 3…). Reordenável.
> - **Plan** — link relativo: `[plan-NN-slug](plan/plan-NN-slug.md)`.
> - **Objetivo** — uma linha, no infinitivo. O que muda no sistema.
> - **Depende de** — `plan-NN` que precisa estar `🟢 Aprovada` antes, ou `—`.
> - **Status** — um dos valores da §2. **Igual** ao frontmatter da plan.
> - **Destino** — para onde o conteúdo é sintetizado depois (§3).

<!-- SARAK-INDICE:FILA:INICIO -->
| # | Plan | Objetivo | Depende de | Status | Destino |
|---|---|---|---|---|---|
| 1 | [plan-51-release-deixa-o-kit-do-mantenedor-para-tras](plan/plan-51-release-deixa-o-kit-do-mantenedor-para-tras.md) | O ritual de release passa a regenerar o kit do mantenedor junto com o resto, e deixa de emitir toda tag com o sarak-dev defasado | — | 🟢 Aprovada | specs/specs/03-versionamento-e-release.md · specs/specs/14-artefatos-do-mantenedor.md |
| 2 | [plan-48-piso-do-grid-content-aware-e-um-numero-solto](plan/plan-48-piso-do-grid-content-aware-e-um-numero-solto.md) | A largura mínima de célula que decide o layout de todo consumidor zero-config deixa de ser um literal invisível e passa a ser ajustável como qualquer outra decisão de layout | — | 🟢 Aprovada | specs/specs/07-responsividade-e-multidispositivo.md · specs/arquitetura/04-contrato-de-tokens-e-paridade.md · specs/specs/01-gates-e-baseline.md |
| 3 | [plan-46-suite-intermitente](plan/plan-46-suite-intermitente.md) | Saber QUAIS são os dois testes que falham de forma intermitente, e então consertá-los ou declará-los como dívida com número — hoje 'suíte verde' é probabilidade, não fato | — | 🟢 Aprovada | specs/specs/11-testes-e-cobertura.md · specs/specs/15-divida-conhecida.md |
| 4 | [plan-11-remover-e2e-falso-verde](plan/plan-11-remover-e2e-falso-verde.md) | Remover o aparato de E2E que produz verde falso, deixando a capacidade declarada como adiada | — | 🔴 A executar | specs/specs/11-testes-e-cobertura.md · specs/specs/15-divida-conhecida.md |
| 5 | [plan-05-integracao-continua](plan/plan-05-integracao-continua.md) | Rodar os gates num ambiente que não é a máquina de ninguém | — | 🔴 A executar | specs/specs/16-integracao-continua.md · specs/specs/02-enforcement-por-commit.md · specs/specs/01-gates-e-baseline.md |
| 6 | [plan-10-ciclo-atualizacao](plan/plan-10-ciclo-atualizacao.md) | Dar comando de atualização a quem só recebia aviso | plan-05 | 🔴 A executar | specs/specs/13-instalacao-e-atualizacao.md |
<!-- SARAK-INDICE:FILA:FIM -->

> **A ordem da coluna `#` não é a ordem do número da plan** — e isso é a feature, não um erro. Numeração é
> identidade; a coluna `#` é o plano.
>
> 🔴 **A leva 28–50 foi SINTETIZADA e removida em 2026-08-15**, e o texto que explicava a ordem dela saiu
> junto. Destino demonstrado, como manda [[00-contexto]] §5: as decisões viraram spec fixa (a camada 3 e
> suas quatro regras em `07-responsividade`, o contrato de persistência em `09-temas-e-presets`, as duas
> camadas de cache em `13-instalacao-e-atualizacao`, os gates novos em `01-gates-e-baseline`), e o rastro de
> execução vive no Git — `git log --diff-filter=D -- specs/plan/` recupera qualquer uma. **Arquivo e prosa
> saem juntos**: manter o texto apontando para plans removidas produziria ponteiro morto em spec, que a
> **R23** proíbe (é a mesma razão pela qual a §4 esvaziou).
>
> **A síntese de 2026-08-15 fechou TODAS as 21 aprovadas** — inclusive as quatro que dependiam de
> `15-divida-conhecida.md`, a mais delicada da leva: cinco achados saíram da §3.1 para a §6 **com o motivo
> de cada um** (três *corrigidos*, dois por *não se reproduzirem* — distinção que um "fechado" genérico
> apagaria), dois achados novos foram numerados (**41** e **42**), e a spec passou a afirmar a **relação**
> — todo número em exatamente uma seção — em vez de um total que envelhece no dia seguinte.
>
> **A fila é `51 → 48 → 46 → 11 → 05 → 10`.** As **três primeiras estão 🟢 Aprovadas e aguardam síntese**
> *(2026-08-18)*; as três seguintes são de execução. Enquanto a síntese não rodar, elas ficam aqui — é o
> §4 desta spec que as remove, e só depois de o conteúdo virar verdade consolidada na spec fixa.
>
> 🟢 **A `plan-51` abriu a fila por ser a única BLOQUEANTE, e foi APROVADA em 2026-08-18.** Ela passou na
> frente das cinco por um motivo medido, não por prioridade declarada: o gancho `version` do `npm version`
> não regenerava `sarak-dev/`, então **toda tag publicada levava o kit do mantenedor um release atrás** —
> `v4.0.1` levou 4.0.0, `v5.0.0` levou 4.0.1, `v6.0.0` levou 5.0.0. Como `preversion` roda `gates:full` e o
> **primeiro** gate dele é o `dev-kit:check`, **o repositório não emitia release nenhuma** até isso fechar;
> foi assim que ela apareceu — `dev-kit:check` vermelho numa árvore limpa, no HEAD `33fdef0`. O conserto foi
> uma linha no `package.json`, com a não-reincidência provada por reprodução direta (veredito em `plan/51` §11).
> **Aguarda commit do dono e depois `/spec-atualizar`;** enquanto não for sintetizada, fica aqui.
>
> 🟢 **A `plan-48` foi APROVADA em 2026-08-18.** O literal `280px` do `minmax(280px,1fr)` — que decidia o
> layout de todo consumidor zero-config sem ser token, sem ser alcançável e dentro de um vão declarado do
> `auditor_hardcoded` — virou o token **`layoutGridMinCell`**, nas três fontes da paridade (**422 → 423**), com
> o valor chegando ao CSS por `style.gridTemplateColumns` (`var()` não funciona em valor arbitrário de classe
> Tailwind). O default efetivo **continua 280px**, e o revisor reproduziu a medição em Chromium.
> **Aguarda commit e `/spec-atualizar`** — e a síntese dela toca **três** specs, não duas: a
> [[01-gates-e-baseline]] §3 entrou no destino no veredito, porque afirma `422/422/422` em quatro lugares.
>
> 🟢 **A `plan-46` foi APROVADA em 2026-08-18 — medindo, não consertando.** A intermitência **não foi
> reproduzida em 46 execuções controladas** e segue **sem nome**, então a plan fechou pela saída que ela mesma
> autorizava: declarar. ⚠️ **O veredito corrigiu o número:** as 46 são **duas amostras de bases diferentes** —
> 26 na base onde o defeito foi visto (1345 testes) e 20 numa base posterior (1376). Os tetos honestos são
> **11,5%** e **15%** por base, não os 6,5% do agrupamento. **Não está descartada — está sem nome**, e pode
> tanto ser rara quanto ter morrido por acidente nas plans que entraram no meio.
>
> **A `plan-11` (E2E de verde falso) é da mesma família:** as duas tratam de *prova que não prova*. A `46`
> mediu a intermitência; a `11` remove o aparato que produz verde falso. Nenhuma depende da outra.
>
> **A `plan-05` (CI) segue no fim, por decisão do dono (2026-08-03).** Ela não depende de ninguém e poderia
> rodar hoje — a escolha foi montar o pipeline **uma vez, completo**, em vez de acrescentar linhas a cada
> gate novo. Custo aceito e registrado: até lá, toda prova continua dependendo da máquina de quem executa.
> A `plan-10` depende dela.

# 2. Legenda de status

| Status | Significado | Quem move para cá |
|---|---|---|
| 🔴 A executar | Spec escrita. Aguarda a **sua vez na fila** — não é autorização para começar (§5). | revisor (ao criar) |
| 🟡 Em execução | Executor trabalhando. | executor (ao iniciar) |
| 🟠 Em revisão | Execução concluída no worktree, aguardando veredito. | executor (ao entregar) |
| 🔵 Em correção | Reprovada. Prompt de correção emitido, executor refazendo. | revisor (ao reprovar) |
| 🟢 Aprovada | Verificada pelo revisor. Pronta para o usuário commitar. | revisor (ao aprovar) |
| ⚪ Sintetizada | Já absorvida nas specs fixas via `/spec-atualizar`. Sai da fila (§4). | revisor (após síntese) |
| ⛔ Bloqueada | Impedida por dependência externa/decisão pendente. **Exige motivo** na coluna Objetivo. | revisor |

> Um status só avança na ordem `🔴 → 🟡 → 🟠 → (🔵 ⇄ 🟠) → 🟢 → ⚪`. **🔵 não volta para 🔴** — correção não é
> execução nova; a plan e o histórico de vereditos são os mesmos.

> 🔴 **A coluna "Quem move para cá" fala do `status` DA PLAN, não deste arquivo** *(esclarecido em 2026-08-07)*.
> Ela e a §5 pareciam se contradizer: aqui o executor "move" 🟡 e 🟠, e lá está escrito que *"só o revisor edita
> este arquivo"*. **As duas estão certas, e o sujeito é que era ambíguo:** o executor move o `status` no
> frontmatter da plan — que é a **fonte da verdade** (§5) — e o revisor **espelha aqui**. O executor nunca abre
> este arquivo.
>
> **Isso deixou de ser detalhe quando o gate nasceu.** O `plan-index:check` (`plan-12`) compara os dois e
> **bloqueia o commit** na divergência. Como o executor legitimamente move a plan para 🟡 antes da primeira
> edição ([[00-prompt-executor]] §2) e para 🟠 ao entregar (§5), **toda execução cria uma divergência que só o
> revisor pode fechar** — e o bloqueio cai sobre quem commita, que é o dono.
>
> **A regra operacional que resolve, e é do revisor:** *espelhar o status aqui **antes de liberar qualquer
> commit**, inclusive nas liberações parciais no meio de uma execução.* Foi a falha que apareceu na `plan-15`:
> liberei os lotes 1–3 com a plan em 🟡 e o índice ainda em 🔴. Autorização pontual ao executor para editar
> este arquivo **é remendo, não solução** — repete-se a cada transição e corrói a regra de propriedade.

---

# 3. Coluna *Destino* — valores válidos

Toda plan declara, **desde o momento em que é escrita**, para onde seu conteúdo será sintetizado:

| Valor | Quando usar |
|---|---|
| `arquitetura/NN-<nome>.md` | Mudou design estrutural, stack, fronteira de módulo, contrato de API. |
| `adr/NNN-<nome>.md` | Foi tomada uma decisão técnica com trade-off. **ADR é imutável** — decisão nova = ADR novo. |
| `specs/NN-<nome>.md` | Mudou regra de negócio ou comportamento de funcionalidade. |
| `00-contexto.md` | Mudou regra inegociável, stack ou mapa de roteamento. |
| **`—` (nenhum)** | Execução que não altera verdade documentada: correção de bug sem mudança de regra, refactor de conformidade, ajuste de build/CI, limpeza. |

> Vários destinos são permitidos (`arquitetura/03-api.md` + `adr/004-...`). `—` é uma resposta legítima e
> comum — **não invente destino** só para preencher a coluna.

---

# 4. Histórico — plans sintetizadas

> 🔴 **Convenção trocada em 2026-08-11, por decisão do dono.** Até aqui a plan sintetizada era **movida**
> para `plan/executadas/` e ganhava uma linha nesta tabela *(convenção de 2026-08-07)*. Agora ela é
> **removida**: o conteúdo virou verdade consolidada na spec fixa, e o rastro de como se chegou lá vive no
> Git — `git log --diff-filter=D -- specs/plan/` recupera qualquer uma.
>
> **Por que a tabela esvaziou junto.** As linhas antigas **linkavam para os arquivos**. Apagar os arquivos e
> manter as linhas produziria ponteiro morto em spec, que a **R23** proíbe — e nenhum gate pegaria, porque o
> `deadPointers.mjs` cobre o kit gerado, não este índice. Arquivo e linha saem **juntos**, sempre.
>
> ⚠️ **A seção fica, vazia e de propósito:** é aqui que voltaria o histórico se a convenção mudar de novo, e
> a numeração das seções seguintes não se move. **Nada a escrever aqui ao concluir `/spec-atualizar`.**

| Plan | Sintetizada em | Spec fixa atualizada |
|---|---|---|

---

# 5. Regras de manutenção

- **Numeração é monotônica e definitiva.** `plan-07` é `plan-07` para sempre. **Nunca renumere** uma plan já
  criada — links, vereditos e histórico apontam para ela. Ordem de execução se muda na coluna **#**, não no nome.
- **Nunca remova uma linha.** Plan abandonada vira `⛔ Bloqueada` com o motivo; plan concluída vai para a §4.
- **Status duplicado é status divergente.** O valor aqui e no frontmatter da plan são atualizados na **mesma
  ação**. Divergiu? A **plan** é a fonte da verdade e este índice está errado — corrija aqui.
- **Dependência é contrato: não MANDE EXECUTAR uma plan cuja dependência não esteja `🟢` ou `⚪`.** O status
  `🔴` diz apenas que a **spec está escrita** — ele não é autorização para começar. Quem governa é a **ordem da
  coluna `#`**, lida junto com a coluna *Depende de*: **as plans são executadas na ordem da fila**
  *(decisão do dono, 2026-08-01)*. Por isso é normal e correto ver várias `🔴` ao mesmo tempo com dependência
  ainda aberta — a fila é que as sequencia.
- **Uma plan `🟡 Em execução` por vez**, salvo plans comprovadamente disjuntas (arquivos sem interseção) — o
  revisor declara a disjunção ao liberar as duas.
- **Só o revisor edita este arquivo.** O executor nunca o toca; ele escreve apenas na plan que executou.
- **O revisor espelha o status ANTES de liberar qualquer commit** — inclusive liberação parcial no meio de uma
  execução. O `plan-index:check` bloqueia o commit na divergência, e a divergência nasce de um movimento
  **legítimo** do executor (🟡 ao iniciar, 🟠 ao entregar). Espelhar no veredito basta para o fluxo normal;
  espelhar **ao liberar** é o que cobre a liberação parcial. Ver a nota da §2.
