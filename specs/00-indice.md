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
| 1 | [plan-28-reconciliar-contexto](plan/plan-28-reconciliar-contexto.md) | Fazer a porta de entrada dos agentes descrever o repositório que existe | — | 🟢 Aprovada | — |
| 2 | [plan-29-erradicar-cifra-em-prosa](plan/plan-29-erradicar-cifra-em-prosa.md) | Fazer as quatro specs fixas pararem de afirmar totais que já envelheceram | plan-28 | 🔴 A executar | — |
| 3 | [plan-30-pagar-divida-aberta](plan/plan-30-pagar-divida-aberta.md) | Zerar a seção de achados abertos da spec de dívida conhecida | — | 🔴 A executar | specs/15-divida-conhecida.md · specs/01-gates-e-baseline.md |
| 4 | [plan-11-remover-e2e-falso-verde](plan/plan-11-remover-e2e-falso-verde.md) | Remover o aparato de E2E que produz verde falso, deixando a capacidade declarada como adiada | — | 🔴 A executar | specs/specs/11-testes-e-cobertura.md · specs/specs/15-divida-conhecida.md |
| 5 | [plan-05-integracao-continua](plan/plan-05-integracao-continua.md) | Rodar os gates num ambiente que não é a máquina de ninguém | — | 🔴 A executar | specs/16-integracao-continua.md · specs/02-enforcement-por-commit.md · specs/01-gates-e-baseline.md |
| 6 | [plan-10-ciclo-atualizacao](plan/plan-10-ciclo-atualizacao.md) | Dar comando de atualização a quem só recebia aviso | plan-05 | 🔴 A executar | specs/13-instalacao-e-atualizacao.md |
<!-- SARAK-INDICE:FILA:FIM -->

> **A ordem da coluna `#` não é a ordem do número da plan** — e isso é a feature, não um erro. Numeração é
> identidade; a coluna `#` é o plano.
>
> **A ordem de hoje é `28 → 29 → 30 → 11 → 05 → 10`: descrever certo → parar de envelhecer → pagar a dívida
> medida → remover o verde falso → rodar fora da máquina de alguém.**
> *(fixada pelo revisor em 2026-08-11, na auditoria de entrada.)*
>
> **A `plan-28` vem primeiro porque a porta de entrada está INSTRUINDO ERRADO.** `00-contexto.md` §2 afirma que
> o `run_audit` "fecha em ZERO" e que "não há mais folga" — o repositório responde **exit 1 com 2 auditores
> vermelhos**, e o baseline versionado é não-zero. Todo agente que começa hoje entra com a régua invertida, e
> **cada hora que ela fica de pé custa uma investigação inteira** de regressão que não existe. É o cenário que
> [`01-gates-e-baseline`](specs/01-gates-e-baseline.md) abre declarando que existe para impedir.
>
> **A `plan-29` depende da 28** e generaliza o mesmo conserto às quatro specs fixas onde a cifra em prosa
> sobreviveu. As duas são de prosa, só tocam `specs/`, e por isso são executadas pelo **revisor** — é o desvio
> declarado em [[00-contexto]], na seção do ciclo SDD.
>
> **A `plan-29` vem ANTES da `plan-11` de propósito.** As duas editam
> [`11-testes-e-cobertura`](specs/11-testes-e-cobertura.md): a 29 faz a spec **parar de descrever um arquivo
> deletado**; a 11 **remove** o aparato que sobrou e declara a ausência. Descrever corretamente o que existe é
> pré-requisito de removê-lo com honestidade — na ordem inversa, a remoção seria escrita por cima de um texto
> que já mente.
>
> **A `plan-30` não depende de ninguém e pode ser puxada para a frente.** Ela é a única desta leva que toca
> código, e carrega o achado **39** — o gerador de gabarito de tema emite arquivo que não compila, o que
> **quebra o segundo passo do fluxo documentado de criação de tema**. Se criar tema for iminente, ela sobe
> para o `#1`; a ordem da fila é do revisor e se muda trocando duas linhas aqui e rodando `npm run plan-index`.
>
> **A `plan-05` (CI) segue no fim, por decisão do dono (2026-08-03).** Ela não depende de ninguém e poderia
> rodar hoje — a escolha foi montar o pipeline **uma vez, completo**, em vez de acrescentar linhas a cada gate
> novo. Custo aceito e registrado: até lá, toda prova continua dependendo da máquina de quem executa. A
> `plan-10` depende dela.
>
> 🔴 **A cadeia anterior (`13 → 14 → 06 → [07 · 08 · 09] → 12 → 15 → 05`) foi CONCLUÍDA e o texto que a
> explicava saiu daqui em 2026-08-11.** Destino demonstrado, como manda [[00-contexto]] §5: **as decisões
> viraram spec fixa** (a matriz de cobertura em `01-gates-e-baseline`, as regras em
> `00-regras-e-invariantes`, os achados em `15-divida-conhecida`), e **o rastro de execução vive no Git** —
> `git log --diff-filter=D -- specs/plan/` recupera qualquer uma das plans removidas. O texto antigo roteava
> plans que não existem mais em nenhuma fila: era mapa de um caminho já andado.

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
