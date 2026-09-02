---
tipo: "processo"
titulo: "Índice de Execução — Mapa das Plans"
dominio: "Governança de Specs (SDD)"
status: "🟢 Vigente"
tags: ["processo", "indice", "sdd"]
relacionados: ["[[00-contexto]]", "[[00-backlog]]", "[[00-prompt-revisor]]", "[[00-prompt-executor]]"]
proximo_numero_plan: "57"
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
ao **sintetizar** uma plan aprovada, quando a linha sai daqui junto com o arquivo ([[00-prompt-revisor]] §7.4).
**Toda mudança de status vive aqui e na própria plan — as duas, sempre, na mesma ação.**

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
> ⚪ **As plans 51, 48, 46 e 11 foram SINTETIZADAS e REMOVIDAS em 2026-08-18.** Os arquivos saíram; a
> verdade delas vive nas specs fixas, e o rastro de execução no Git — `git log --diff-filter=D -- specs/plan/`
> recupera qualquer uma. **Esta tabela é o destino demonstrado** que a [[00-contexto]] §5 exige de toda
> remoção:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **51** | [[03-versionamento-e-release]] §6 — o gancho `version` regenera os **três** kits · [[14-artefatos-do-mantenedor]] §5 |
> | **48** | [[07-responsividade-e-multidispositivo]] §2.1 e §5 — o token `layoutGridMinCell` · [[04-contrato-de-tokens-e-paridade]] (paridade **423**, estruturais **18**) · [[01-gates-e-baseline]] §3 |
> | **46** | [[11-testes-e-cobertura]] §3.5 — o que *"suíte verde"* significa, com os tetos **por base** · [[15-divida-conhecida]] achado **44** |
> | **11** | [[11-testes-e-cobertura]] §7 — a ausência declarada · [[15-divida-conhecida]] achado **45** · **R24 → ⚠️** em [[00-regras-e-invariantes]] |
>
> ⚪ **As plans 52, 05, 10, 53 e 54 foram SINTETIZADAS e REMOVIDAS em 2026-08-19** — o ciclo do pipeline,
> inteiro. **Destino demonstrado**, como a [[00-contexto]] §5 exige de toda remoção:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **52** | [[02-enforcement-por-commit]] §2.2.1 (o kit com gatilho próprio) e §3.1 (custo remedido) · [[01-gates-e-baseline]] §2.2.1 · [[11-testes-e-cobertura]] §5.1 (ambiente por arquivo, **−40,2%**) · [[14-artefatos-do-mantenedor]] §5 · achados **46** e **47** |
> | **05** | 🆕 [[16-integracao-continua]] — **a spec nasceu desta plan** · [[02-enforcement-por-commit]] §4.3.1 e §9 · [[03-versionamento-e-release]] §6.0 · [[15-divida-conhecida]] §3.4 (**categoria nova**) e achados **48**, **50**–**54**, **56** |
> | **10** | [[13-instalacao-e-atualizacao]] §5.3 e §9.4 — o `sarak-ui update` e o `^` que sumia duas vezes no Windows · achados **49** e **55** |
> | **53** | [[03-versionamento-e-release]] §3.1 (12 tags, 6 majors), §5.1 e §5.2 — os dois gates e **a assimetria** · [[01-gates-e-baseline]] §2.2 |
> | **54** | 🆕 [[17-contrato-de-operacao-git]] — **a spec nasceu desta plan** · [[00-contexto]] §4 e §7 |
>
> ⚠️ **Uma coisa mudou de significado ao ser transportada, e fica registrada aqui porque a plan sumiu.** A
> `plan-53` afirmava que a obrigação de `docs/migracoes.md` fora *"pulada 3×"*. **Não foi.** As notas dos três
> majors **estavam escritas**; faltava o **número da versão no título**, porque o leitor que exige esse
> formato nasceu dias depois delas. Sintetizar a alegação teria posto uma acusação falsa numa spec fixa — a
> [[03-versionamento-e-release]] §5.1 registra o fato correto.
>
> 🔎 **A fila esvaziou pela primeira vez em 2026-08-19, e isso expôs um defeito** que nenhum estado anterior
> alcançava: `scripts/generate-plan-index.mjs` **estourava** com `ENOENT` quando `specs/plan/` deixava de
> existir (o git remove diretório que esvazia). O diretório foi preservado com um `.gitkeep`; **tornar o
> gerador tolerante à ausência é conserto de código, e não é do revisor** — segue como decisão do dono.
>
> *(Registro datado. Consulte a tabela acima para o estado corrente da fila — prosa que afirma estado
> envelhece no dia seguinte, e é o padrão que [[15-divida-conhecida]] §3.3 cataloga.)*

# 2. Legenda de status

| Status | Significado | Quem move para cá |
|---|---|---|
| 🔴 A executar | Spec escrita. Aguarda a **sua vez na fila** — não é autorização para começar (§5). | revisor (ao criar) |
| 🟡 Em execução | Executor trabalhando. | executor (ao iniciar) |
| 🟠 Em revisão | Execução concluída no worktree, aguardando veredito. | executor (ao entregar) |
| 🔵 Em correção | Reprovada. Prompt de correção emitido, executor refazendo. | revisor (ao reprovar) |
| 🟢 Aprovada | Verificada pelo revisor. Pronta para o usuário commitar. | revisor (ao aprovar) |
| ⚪ Sintetizada | Já absorvida nas specs fixas pelo **revisor**, autorizado pelo usuário ([[00-prompt-revisor]] §7.4). Estado **transitório**: a plan **sai do disco** e a linha sai daqui, na mesma ação. | revisor (na síntese) |
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
> a numeração das seções seguintes não se move. **Nada a escrever aqui ao concluir uma síntese.**

| Plan | Sintetizada em | Spec fixa atualizada |
|---|---|---|

---

# 5. Regras de manutenção

- **Numeração é monotônica e definitiva.** `plan-07` é `plan-07` para sempre. **Nunca renumere** uma plan já
  criada — links, vereditos e histórico apontam para ela. Ordem de execução se muda na coluna **#**, não no nome.
- **`proximo_numero_plan`, no frontmatter, é a ÚNICA fonte de `NN`.** Leia dali, use o valor e incremente na
  mesma ação — **não escaneie `specs/plan/`**, que só tem as plans ativas; as sintetizadas já saíram do disco.
  O campo **nunca regride**, nem quando uma plan é removida: número queimado é mais barato que link ambíguo.
  Ele vive **fora** dos marcadores de propósito — o gerador reescreve o bloco marcado inteiro a cada rodada.
- **A linha sai quando a plan sai.** Síntese e remoção são uma ação só ([[00-prompt-revisor]] §7.4): o
  arquivo é removido e esta linha some junto, no mesmo commit. Plan **abandonada** é caso diferente — vira
  `⛔ Bloqueada` com o motivo, e a remoção dela é **manual do usuário**, nunca de um agente.
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
