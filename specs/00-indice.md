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

| # | Plan | Objetivo | Depende de | Status | Destino |
|---|---|---|---|---|---|
| 1 | [plan-01-migrar-para-fluxo-sdd](plan/plan-01-migrar-para-fluxo-sdd.md) | Migrar a base de specs para o fluxo SDD | — | 🟢 Aprovada | `00-contexto.md` · `specs/15-divida-conhecida.md` |
| 2 | [plan-03-triagem-divida-conhecida](plan/plan-03-triagem-divida-conhecida.md) | Decidir o destino de cada achado aberto *(análise, não conserto)* | plan-01 | 🟢 Aprovada | `specs/15-divida-conhecida.md` · `00-contexto.md` |
| 3 | [plan-02-adequar-skills-locais](plan/plan-02-adequar-skills-locais.md) | Adequar as 9 skills locais ao fluxo SDD | plan-01 | 🟢 Aprovada | `00-contexto.md` · `specs/00-regras-e-invariantes.md` · `arquitetura/02` |
| 4 | [plan-04-alinhamento-erp](plan/plan-04-alinhamento-erp.md) | Alinhar o ERP — o instrumento de medição da lib | — | 🟢 Aprovada | `—` |
| 5 | [plan-13-fechar-conjunto-de-regras](plan/plan-13-fechar-conjunto-de-regras.md) | Tudo que se cobra aqui vira regra numerada; conduta em categoria própria | — | 🟠 Em revisão | `specs/00-regras-e-invariantes.md` |
| 6 | [plan-14-casa-dos-gates](plan/plan-14-casa-dos-gates.md) | Concentrar todo verificador em `gates/` e limpar o legado de `scripts/` | plan-13 | 🟢 Aprovada | `specs/01` · `specs/02` · `specs/00-regras-e-invariantes.md` |
| 7 | [plan-06-auditoria-cobertura-gates](plan/plan-06-auditoria-cobertura-gates.md) | Mapear o escopo real de cada gate contra o escopo da regra *(investigação)* | plan-14 | 🔴 A executar | `specs/00-regras-e-invariantes.md` · `specs/01` · `specs/15` |
| 8 | [plan-05-integracao-continua](plan/plan-05-integracao-continua.md) | Rodar os gates num ambiente que não é a máquina de ninguém | — | 🔴 A executar | `specs/16-integracao-continua.md` *(nova)* · `specs/02` · `specs/01` |
| 9 | [plan-07-quitacao-baseline](plan/plan-07-quitacao-baseline.md) | Quitar o baseline de auditoria | plan-06 | 🔴 A executar | `specs/01` · `specs/11` · `specs/10` |
| 10 | [plan-08-achados-comportamento](plan/plan-08-achados-comportamento.md) | Corrigir o código que faz coisa diferente do que promete | plan-06 | 🔴 A executar | `specs/06` · `specs/07` · `specs/04` |
| 11 | [plan-09-contrato-publico-2-0-0](plan/plan-09-contrato-publico-2-0-0.md) | As quebras de contrato saem juntas num único major | plan-06 | 🔴 A executar | `arquitetura/03` · `adr/009-*` · `docs/migracoes.md` |
| 12 | [plan-12-construcao-dos-gates](plan/plan-12-construcao-dos-gates.md) | Dar dono e verificação aos gates que hoje só estão escritos | plan-06 | 🔴 A executar | `specs/00-regras-e-invariantes.md` · `specs/01` · `specs/02` · `specs/15` |
| 13 | [plan-10-ciclo-atualizacao](plan/plan-10-ciclo-atualizacao.md) | Dar comando de atualização a quem só recebia aviso | plan-05 | 🔴 A executar | `specs/13-instalacao-e-atualizacao.md` |
| 14 | [plan-11-e2e-no-pipeline](plan/plan-11-e2e-no-pipeline.md) | Parar de sair verde sem executar nada | plan-05 | 🔴 A executar | `specs/11` · `specs/10` · `specs/16` |

> **A ordem da coluna `#` não é a ordem do número da plan** — e isso é a feature, não um erro. A `plan-03`
> (triagem) roda **antes** da `plan-02` porque ela decide o escopo real de 07, 08 e 09; a `plan-02` só depende
> da `plan-01`. Numeração é identidade; a coluna `#` é o plano.
>
> **A cadeia `13 → 14 → 06 → 12 → 05` é a ordem que o dono fixou: regra → casa → medir → construir → rodar.**
> A `plan-13` fecha o conjunto de regras (nenhum gate é criado nela); a `plan-14` concentra os verificadores em
> `gates/` e limpa o legado; a `plan-06` mede o escopo real de cada gate contra a regra **já fechada**, e mede
> nos **caminhos definitivos**; a `plan-12` constrói o que faltar, já nascendo no lugar certo; a `plan-05` roda
> tudo fora da máquina de alguém.
>
> **A `plan-14` vem ANTES da `plan-06` de propósito:** a 06 registra `arquivo:linha` de cada gate. Medir antes
> de mover obrigaria a reescrever todas as referências depois — e é assim que matriz vira documento morto.
>
> **A `plan-06` é a única que começa sem lista de tarefas** — a lista é o produto dela, e é por isso que 07, 08,
> 09 e 12 dependem dela. Os escopos de 07 e 08 seguem marcados como **provisórios** dentro dos próprios
> arquivos; o da 09 foi **fixado em 2026-08-01** pela triagem da `plan-03` (achado 27 saiu, achado 2 entrou).
>
> **O escopo da `plan-06` ENCOLHEU em 2026-08-02, com a execução da `plan-13`.** As quatro perguntas de
> **regra** que ela herdaria da triagem foram respondidas pelo dono e já entraram na spec como regra escrita:
> R10 saiu da conduta e virou ⏳; a promessa de AA virou **R31** (só os 18 temas de referência); o acoplamento
> de auth virou **R32**; e a cobertura em % virou **R8.1**, com piso móvel. A `plan-06` volta a ser **só** o que
> o nome diz — **medir escopo de gate contra escopo de regra**, agora contra as **32** regras fechadas e nos
> caminhos definitivos que a `plan-14` fixa. Ela **não decide mais nenhuma regra**.
>
> **A `plan-12` roda DEPOIS de 07, 08 e 09, e não antes** — embora dependa formalmente só da `plan-06`. O motivo
> é operacional: ela liga verificação, e gate ligado antes do conserto correspondente acende vermelho que
> pertence a outra plan. Consertar primeiro, cobrar depois, é o que mantém o baseline legível.

---

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

> **Como escrever:** ao concluir `/spec-atualizar`, mova a linha da §1 para cá, com a **data absoluta**
> (`AAAA-MM-DD`) da síntese e a spec fixa efetivamente atualizada. O arquivo da plan **permanece** em `plan/`
> (é rastro auditável) — só sai da fila. Esta tabela é append-only: nada é editado nem removido.

| Plan | Sintetizada em | Spec fixa atualizada |
|---|---|---|
| — | — | — |

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
