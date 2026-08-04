---
tipo: "plan"
titulo: "Quitar o baseline de auditoria — pagar a dívida que foi documentada e nunca agendada"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "baseline", "gates", "divida-tecnica"]
relacionados: ["[[01-gates-e-baseline]]", "[[15-divida-conhecida]]", "[[11-testes-e-cobertura]]"]
depende_de: "plan-06"
destino_sintese: "specs/01-gates-e-baseline.md · specs/11-testes-e-cobertura.md · specs/10-seguranca-e-acessibilidade.md"
---

> ✅ **Escopo FIXADO em 2026-08-03.** A `plan-03` e a `plan-06` fecharam 🟢, e a §3 foi reescrita contra o código
> de hoje. **Liberada para execução.**

# 1. Objetivo

O `run_audit` fecha em zero — ou o que sobrar no baseline está lá **com o motivo escrito**, como decisão e não
como esquecimento.

# 2. Contexto

O `run_audit` não está em zero, e **nenhuma tarefa da campanha anterior consertou isso**: ela documentou a
dívida com precisão e não agendou pagamento.

**Baseline permanente deixa de ser dívida e vira norma** — e norma que ninguém decidiu adotar é a pior espécie.

Há duas naturezas aqui, e confundi-las é o erro a evitar:

- **Itens que o gate acusa** e ninguém consertou → conserta-se o **código**.
- **Lacunas de gate**, onde o gate **não acusa** → conserta-se o **gate**. Se a plan-06 já ampliou o gate, aqui
  se escreve o que faltava dentro do escopo novo.

# 3. Escopo

> ✅ **Reescrita em 2026-08-03, com a `plan-03` e a `plan-06` fechadas** — era o que o cabeçalho prometia.
> A versão anterior desta seção listava 16 itens; **7 foram removidos** (concluídos, obsoletos ou de outra
> plan) e **1 era factualmente falso**. A reconciliação item a item está na §3.4, para que nada suma sem
> destino.

## 3.1 Dentro — os 8 itens que sobreviveram à reconciliação

Todos medidos em 2026-08-03, contra o código de hoje.

| # | Item | Onde | Natureza |
|---|---|---|---|
| 1 | **`--sx-*` vivo** — namespace PROIBIDO (R7) | `src/styles/_utilities.css:80,89` | **só a metade de código**: as 2 linhas. Ampliar o escopo do auditor é o **vão nº 2**, e é da `plan-12` |
| 2 | **`--sarak-shell-brand-logo-size`** — consumido, **nunca emitido** | `src/components/atomic/Navigation/SarakShellNav.tsx:134` | **Expansão** (R11): criar nas 3 fontes com `ui-novo-componente`. **É o único fantasma de token real do repositório** |
| 3 | **`--token` em JSDoc** | `src/components/atomic/Atoms/SarakTypography.tsx:32` | **reescrever a prosa** — ver §3.3 |
| 4 | **Fallback negativo** — `var(--sarak-h1-ls, -1px)` | `SarakTypography.tsx:39` | `calc(var(--sarak-h1-ls, 1px) * -1)`. É o `valor=1` do baseline |
| 5 | **`tsc` — os 4 erros de PRODUÇÃO** | `useStructuralStyles.ts` (3) · `ThemeCustomizationTab.tsx` (1) | os 10 de teste ficam fora (§3.5) |
| 6 | **7 ids de token duplicados** — 4 em colunas diferentes, 3 na mesma | schema + `theme_table_mapping` | ⚠️ muda **qual definição vence** em `getDefaultDesignState()` — **caracterização ANTES** (`code-adequacao`) |
| 7 | **Testes dos 4 arquivos sem cobertura** *(metade-dívida do achado 13)* | `shared/hooks/useModuleDiscovery.ts` · `useSarakRouter.ts` · `effects/NoiseOverlay.tsx` · `constants/icon-packs.tsx` | **são 4, não 3** — a `plan-06` achou os dois últimos. Ampliar o **escopo** do `auditor_coverage` é o vão nº 6, da `plan-12`; aqui se **escrevem os testes** |
| 8 | **Achados 24 e 25** — higiene de superfície do scaffold | `bin/scaffold/generators/mainTsx.mjs:36-40` · `context.mjs:7-10` | troca de texto: comentário citando `Sarak-MyService` obsoleto e ponteiro para `templates/` inexistente |

**Ao fim disto o baseline vai a `valor=0` e `ghostvars=0`, e o `run_audit` fecha em zero** — que é o objetivo
declarado da §1, agora alcançável de verdade.

## 3.2 O item que era FALSO — removido

> 🔴 **`--sarak-button-radius` → "o token real é `--sarak-btn-border-radius`, erro de grafia"** era **falso**, e
> executá-lo teria **introduzido um bug**.
>
> Medido: `src/core/Provider/manifest.ts:198` declara
> `buttonRadius: { vars: ['--button-radius', '--sarak-button-radius'], unit: 'px' }`. A variável **é emitida**, o
> consumo em `SarakShellNav.tsx:70` **sempre resolveu**, e "corrigir a grafia" trocaria um consumo que funciona
> por um que aponta para outro token.
>
> **Por que a plan errou:** foi escrita olhando **só o schema** — a mesma cegueira que o registro do
> `auditor_ghostvars` tinha, e que a `plan-06` corrigiu (registro de 2 → 4 fontes). O auditor **confirmava a
> leitura errada**, e a leitura errada validava o auditor. Foi a ampliação do registro que derrubou a acusação
> sozinha, levando o baseline de 3 para 2 fantasmas.
>
> **A lição fica registrada porque vale além desta plan:** gate incompleto não apenas deixa passar — ele
> **produz documentação falsa que parece verificada**.

## 3.3 `--token`: reverto a posição anterior, e explico por quê

A versão anterior mandava **não corrigir**, com o argumento de que trocar a grafia do comentário *"baixaria o
número sem consertar nada — é maquiagem"*.

**Reverto.** O argumento presumia que o único efeito seria o número. Medido, há um segundo: a prosa
`/** … 100% via var(--token, fallback) … */` **ensina um nome de token que não existe**. É exatamente a classe
que a triagem da `plan-03` catalogou em `SarakUploader.tsx:47` e `SarakContextMenu.tsx:9` — *"prosa que ensina
o namespace errado a quem ler o código"*.

**Reescrever prosa que mente é conserto; o número cair é consequência, não propósito.** O critério de maquiagem
continua valendo e não é violado aqui: maquiagem é baixar o número **sem** defeito real por baixo.

⚠️ **O que NÃO se conserta aqui:** o `auditor_ghostvars` **não distingue prosa de código** — o próximo JSDoc com
`var(--qualquer-coisa)` reintroduz o falso positivo. Isso é **limite de gate**, e vai para a `plan-12` como
item novo: ou o auditor aprende a pular comentário, ou o limite fica **declarado no código** (R18).

## 3.4 Reconciliação — o destino dos 8 itens removidos

Nada sumiu sem destino ([[00-contexto]] §5):

| Item da versão anterior | Destino |
|---|---|
| `--sarak-button-radius` "erro de grafia" | **FALSO** — removido, com a evidência na §3.2 |
| Achado 2 — `upgradeThemePayload(partialMode)` | **`plan-09`** — mudança de assinatura pública é major ([[15-divida-conhecida]]:97) |
| Achado 13 — ampliar o escopo do `auditor_coverage` | **`plan-12`** (vão nº 6). A **metade de testes** ficou aqui, item 7 |
| Achado 14 — gate anti-acoplamento de auth | **OBSOLETO** — virou **R32** na `plan-13`; o gate é da `plan-12` |
| Achado 15 — cobertura em % | **OBSOLETO** — virou **R8.1** com piso móvel; o gate é da `plan-12` |
| Achado 16 — auditar os 5 sinks de `dangerouslySetInnerHTML` | **JÁ FECHADO** em 2026-08-01 — a auditoria foi feita, os 5 são legítimos ([[15-divida-conhecida]] §5) |
| Achado 22 — `design-token-ids.ts` + registrar o gerador | **`plan-12`** (vão nº 1) |
| Achado 23 — `sarak-ui/templates/` fora de gate de conteúdo | **`plan-12`** |
| Ampliar o escopo do `auditor_ghostvars` (metade do achado 1) | **`plan-12`** (vãos nº 2 e 3) |

## 3.5 Fora

- ⛔ **Baixar número de auditoria sem consertar a causa.** Maquiagem reprova a execução inteira. O critério é
  se **existe defeito real por baixo** — ver §3.3.
- ⛔ **Rodar `npm run audit:baseline` sozinho.** O baseline se regrava **junto do conserto que o justificou, no
  mesmo commit**. Separados, o diff mostra um número que melhorou sem conserto visível — que é o que a §6.1 da
  spec de gates proíbe.
- ⛔ **Ampliar escopo de gate.** Nenhum. Toda ampliação é da `plan-12`, e ampliar sem ampliar o registro produz
  acusação falsa — a `plan-06` mediu o custo: ~85 falsos.
- Os **10 erros de `tsc` em arquivos de teste**.
- Achados de comportamento (`plan-08`) e de contrato público (`plan-09`).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/01-gates-e-baseline.md` | o baseline exato e o `arquivo:linha` de cada item |
| Spec fixa | `specs/15-divida-conhecida.md` | os achados, com a triagem da plan-03 |
| Spec fixa | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` §2.2 | a duplicação dos 7 ids, já apurada *(caminho corrigido: `specs/04-*` é a spec de Shell)* |
| Skill | `code-adequacao` | caracterização **antes** de mexer nos 7 ids duplicados |
| Skill | `ui-refatorar-componente` | alterar token sem quebrar a paridade das 3 fontes |

# 5. Instruções de execução

1. Um item por vez, na ordem da §3.1 e depois da §3.2. **Cada item fecha com o baseline regravado no mesmo
   commit**, não ao final.
2. Antes dos **7 ids duplicados**: caracterizar `getDefaultDesignState()` — o teste tem de provar qual
   definição vence **hoje**, antes de a ordem mudar.
3. Ao ampliar qualquer escopo de gate, ampliar o **registro/allowlist** na mesma edição. Rodar o gate e
   confirmar **zero acusação falsa**.
4. `--sarak-shell-brand-logo-size` é **criação de token**: as 3 fontes, com a skill `ui-novo-componente`.
5. Achado 22 — regenerar **e** registrar o gerador. A execução que só regenerar está **incompleta**.
6. Achado 16 — os 5 sinks, um a um, com o veredito escrito **ao lado do código**.
7. Ao fim, `npm run audit` e comparar: cada item que saiu do baseline tem um conserto correspondente no diff.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-07-quitacao-baseline.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/01-gates-e-baseline.md, specs/specs/15-divida-conhecida.md,
specs/arquitetura/04-contrato-de-tokens-e-paridade.md.
Skills a aplicar: padrao-typescript, code-adequacao (antes dos 7 ids duplicados),
ui-refatorar-componente, ui-novo-componente, test-unitario.

NUNCA baixe um número de auditoria sem consertar a causa. O `--token` NÃO se corrige —
é falso positivo e fica no baseline com o motivo. Regrave o baseline junto do conserto
que o justificou, nunca sozinho.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] Cada item fechado com o baseline regravado **no mesmo commit** que o conserto.
- [ ] `--token` **continua** no baseline, com o motivo escrito.
- [ ] `--sarak-shell-brand-logo-size` criado nas **3 fontes**; paridade segue 1:1:1.
- [ ] Os 7 ids duplicados: caracterização **antes**, e o teste prova que a definição vencedora não mudou.
- [ ] Achado 22 com **as duas metades** — regenerado **e** o gerador invocado por um pipeline.
- [ ] Achado 13 com escopo ampliado **e** os testes escritos (não só o escopo).
- [ ] Achado 14 com o gate criado **ou** a declaração escrita de que não existirá.
- [ ] Os 5 sinks auditados, com o motivo ao lado de cada um.
- [ ] Nenhum gate ampliado produz acusação falsa.
- [ ] Suíte verde; `npm run gates:full` verde.

# 8. Como verificar

- `npm run audit` → o baseline novo bate com `.githooks/audit-baseline.json`
- `git log -p .githooks/audit-baseline.json` → cada mudança acompanhada do conserto que a justifica
- `npx tsc --noEmit` → os 4 erros de produção sumiram
- `node scripts/generate-token-types.ts` (ou o script que o registrou) → sem diff, e o comando existe no pipeline
- `npm run audit` após ampliar cada gate → zero acusação falsa
- `npx vitest run` → verde

# 9. Destino da síntese

**Destino:** `specs/01-gates-e-baseline.md` (o baseline encolhe) · `specs/11-testes-e-cobertura.md` ·
`specs/10-seguranca-e-acessibilidade.md` (os 5 sinks) · `specs/15-divida-conhecida.md` (as linhas fechadas saem)

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-03

**Resultado:** Concluído com pendências — **7 dos 8 itens fechados**. O item 4 está **bloqueado por prescrição
factualmente errada**, medida e documentada abaixo; é a mesma classe do item que a §3.2 já havia removido.

### O placar do baseline

| Métrica | Antes | Depois |
|---|---|---|
| `auditor_ghostvars` | 2 consumos | **0** ✅ |
| `auditor_hardcoded` — valor | 1 | **1** ⚠️ *(item 4 — ver abaixo)* |
| `auditor_hardcoded` — estrutural líquido | 0 | 0 |
| `tsc` — erros de **produção** | 4 | **0** ✅ |
| `tsc` — total | 14 | **10** *(só os de teste, fora do escopo §3.5)* |
| Paridade | 409/409/409, **416 brutos** | **410/410/410, 410 brutos** ✅ |
| `run_audit` | exit 1, **2** auditores vermelhos | exit 1, **1** auditor vermelho |
| Suíte | 274 arquivos / 889 testes | **279 / 928**, 100% verde |

### Item a item

**1 · `--sx-*` (R7)** — `_utilities.css:80,89`. O namespace proibido saiu. Medido no caminho: o primeiro nível
(`--sarak-range-active-bg`) **também não é emitido por ninguém**, então a declaração inteira resolvia para vazio
e o thumb do range ficava **sem cor**. Encadeei num token real (`--theme-primary`, emitido em `manifest.ts:32`),
o que conserta o defeito de verdade, não só o namespace.

**2 · `--sarak-shell-brand-logo-size`** — criado nas 3 fontes: `schema/navigation.ts` (slider px, 16–64,
default 28 — o mesmo do fallback, então nada muda visualmente), `theme_table_mapping.json` e a partição
`layout_and_navigation.json`. Paridade foi de 409 para **410/410/410**.

**3 · `--token` em JSDoc** — prosa reescrita. Ela ensinava um nome de token inexistente; agora aponta para
`schema/typography.ts`, que é onde os nomes reais vivem.

**4 · Fallback negativo** — ⛔ **NÃO EXECUTADO.** Ver a seção própria abaixo.

**5 · `tsc`, 4 erros de produção** — `resolveGap` recebia o valor cru de `design.layoutGap`, que é um token
**responsivo** e chega como `ResponsiveValue<number>`; a assinatura só admitia `string | number` e o valor é
**repassado sem tocar**. Criei o tipo `GapValue` e alarguei a assinatura (`useStructuralStyles.gap.ts`) — os 3
`TS2345` caíram juntos. Isso aflorou um `TS2322` novo em `SarakFormGroup.tsx:23`, porque `getFormGroupStyles`
era o único dos quatro irmãos **sem** `as React.CSSProperties`; alinhado. O 4º erro (`ThemeCustomizationTab.tsx:86`)
era o inverso do que parecia: o **consumidor** declarava `'success' | 'warning' | 'error'` e **nenhuma das 6
chamadas usa `'error'`** — inclusive a de falha usa `'warning'`. Estreitei a declaração para a união real (R3).

**6 · Os 7 ids duplicados** — caracterização **antes**, como a plan exige: criei
`src/core/Design/__tests__/master-map.test.ts` com snapshot dos valores vencedores. Removi a declaração
**perdedora** de cada par e desdupliquei também o `theme_table_mapping.json` (4 em colunas diferentes + 3
repetidos na mesma). Paridade agora fecha **410 brutos = 410 únicos** — some a divergência "416 × 409" que a
[[04-contrato-de-tokens-e-paridade]] §2.2 documentava.

**7 · Os 4 arquivos sem teste** — 4 arquivos novos, **39 testes**: `useSarakRouter` (9), `useModuleDiscovery`
(11, com as duas fronteiras mockadas), `NoiseOverlay` (6), `icon-packs` (7, incluindo paridade de chaves entre
os 8 packs). O escopo do `auditor_coverage` **não foi ampliado** — é o vão nº 6, da `plan-12`.

**8 · Achados 24 e 25** — o comentário do `main.tsx` deixou de citar o `Sarak-MyService` (que o consumidor não
alcança) e as 4 linhas sobre `templates/app-starter.manifest.json` saíram de `context.mjs`.

### O erro que a caracterização NÃO pegou, e como apareceu

O item 6 quebrou **3 snapshots**, e a causa merece registro porque é a lição da plan:

**`getAllDesignTokens()` não deduplica** (`master-map.ts:75` é um `flatMap`). As duas declarações de um id
duplicado eram **ambas emitidas** — logo, os `cssVars` das duas iam para o DOM. Remover a perdedora apagou
**51 variáveis**: todas as variantes cromáticas de `cardBackgroundColor` (`-rgb`, `-bg`, `-10`…`-50`, `-hover`,
`-active`, `-light`) e o `--theme-body`.

Duas causas distintas, medidas contra o `git HEAD`:
- **`cardBackgroundColor`**: a flag `generateVariants: true` vivia **só** na declaração de `cards.ts` — a que
  removi. É ela que dispara as 51 variantes.
- **`colorBgBody`**: a declaração de `colors.ts` tinha **3 aliases a mais** (`--theme-body`, `--bg-body`,
  `--sarak-bg-base`).

**A duplicata não era redundância: era uma UNIÃO de aliases e flags.** Desduplicar é **fundir**, não escolher um
lado. Corrigi herdando as duas coisas para os vencedores, e **reforcei a caracterização** com os dois testes que
teriam pego isso (`nenhum alias de CSS var foi PERDIDO`, `o token que emite variantes continua marcado`).

Os 3 snapshots foram regenerados **com o delta integralmente explicado e conferido variável a variável**:
`sumiram: []`, `mudaram: []`, e **12 novas** — `--sarak-shell-brand-logo-size` (item 2) e 11 variantes de
`--theme-card-bg`, que agora existem porque a fusão uniu `generateVariants` ao conjunto completo de aliases.
**Nenhuma perda, nenhuma mudança de valor.**

### ⛔ Item 4 — a prescrição está errada, e executá-la introduziria um bug visível

A §3.1 manda trocar `var(--sarak-h1-ls, -1px)` por **`calc(var(--sarak-h1-ls, 1px) * -1)`**.

**Medido em `schema/typography.ts:154-163`:** `h1LetterSpacing` é `type: 'slider'`, `unit: 'px'`,
`constraints: { min: -5, max: 10 }`, `defaultValue: -1`. **O token carrega o próprio sinal.** A engine emite
`--sarak-h1-ls: -1px`, e a prescrição calcula `calc(-1px * -1)` = **`+1px`**: o espaçamento do H1 **inverte**
para todo consumidor, e piora quanto mais o usuário mexe no slider.

A convenção `calc(var(--x, 1px) * -1)` funciona quando o token é **magnitude** e só o fallback precisa do sinal.
Aqui não é o caso.

**E passar no gate não conserta nada:** `sanitizeFallbacks` (`auditor_hardcoded.mjs:122-127`) limparia o
`var(--sarak-h1-ls, 1px)` e o `* -1` sobreviveria sem unidade — **o número cairia para 0 com a tela errada**.
É exatamente o que a [[01-gates-e-baseline]] §6.3 proíbe: *"corrigir o sintoma que o detector vê em vez do
defeito"*.

**O defeito real não está no componente.** A §4.1 daquela mesma spec já o classificava:
*"**Limitação do detector, não hardcode real** — a regex não aceita sinal negativo"*. As duas saídas que ela
própria enumera:

| | O que fazer | Custo |
|---|---|---|
| **A** *(recomendada)* | aceitar sinal em `sanitizeFallbacks`: `[0-9.]+` → `[-+]?[0-9.]+` | **muda um gate** — e a §3.5 desta plan reserva gate à `plan-12`. Não é *ampliar* escopo: remove um falso-positivo |
| **B** | trocar o fallback para `0px` | **muda um átomo**, mas altera o default de quem renderiza sem Provider, para satisfazer um linter |

**Parei e não escolhi**, porque A esbarra na §3.5 e B é o padrão que a §6.3 condena. É decisão de dono.

### Verificações executadas

- `npm run audit` → `valor=1` · `estrutural=0` · **`ghostvars: Nenhuma variável-fantasma consumida`** ·
  `any=0` · `coverage=0` · `arquitetura=0` · `cleancode=0` · **paridade 410/410/410** · 120 presets ·
  `AUDITORIA FALHOU: 1 regras estruturais` *(era 2)*
- `npx vitest run` → **279 arquivos / 928 testes, 100% verde**
- `npx tsc --noEmit` → **0 erros de produção**, 10 em teste

### Decisões e suposições

1. **`--sarak-range-active-bg` foi mantido como primeiro nível** no item 1. Ele também é fantasma, mas criá-lo é
   Expansão e não está na §3.1 — encadeei num token real para o defeito visível sumir sem inventar escopo.
2. **O default do token novo é 28** — igual ao fallback que já estava no código, para o item 2 não mudar pixel
   nenhum.
3. **Desduplicação = fusão**, não descarte (seção acima). Onde o perdedor era subconjunto do vencedor (5 dos 7),
   removi direto.
4. **Snapshots regenerados**, não reescritos à mão, e só depois de o delta estar conferido item a item.
5. **Não rodei `audit:baseline --write`.** A §3.5 manda regravar junto do conserto, no mesmo commit — e como o
   item 4 segue aberto, `valor` ainda é 1. Regravar agora congelaria um estado intermediário.

### Achados fora do escopo (não corrigidos)

- **`--sarak-range-active-bg` não é emitido por fonte nenhuma** — mesmo perfil do token que criei no item 2.
  Candidato natural à mesma Expansão, mas não está na §3.1.
- **`arquitetura/04-contrato-de-tokens-e-paridade.md` §2.2 está obsoleta**: descreve os 7 ids duplicados e a
  divergência "416 × 409" que esta execução fechou. A síntese (§9 da plan) já a tem como destino.

### Pendências / riscos

- 🔴 **Item 4 aberto** — `run_audit` fecha com **1** auditor vermelho, não em zero. O objetivo da §1 depende
  dessa decisão.
- **`gates/baselines/audit-baseline.json` não foi regravado** (item 5 das decisões). Quando o item 4 fechar,
  `valor` e `ghostvars` vão a 0 e o baseline se regrava junto do conserto.
- **`docs/component-catalog.*` e `sarak-ui/` não foram regenerados** nesta execução; o token novo muda a
  contagem publicada. `catalog:check`/`guide:check` vão acusar até o `npm run build` rodar.


---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

---

## Resumo da execução (correção 1) — 2026-08-03

**Resultado:** Concluído — **`run_audit` fecha em ZERO**, que é o objetivo da §1.

```
AUDITORIA FINALIZADA COM SUCESSO: O Módulo Sarak UI Core está 100% íntegro.   (exit 0)
```

### 1 · Item 4 pela opção A — a regex do detector

`gates/scripts/audit/auditor_hardcoded.mjs:126` — `[0-9.]+` → `[-+]?[0-9.]+`. **Uma linha.**
`UNIT_RE` e `HEX_RE` **não** foram tocados, então valor negativo escrito **solto** (fora de `var(...)`) segue
sendo violação; o que mudou é só o reconhecimento do **fallback documentado**.

**O limite corrigido está escrito no cabeçalho da função (R18)**, com o porquê: a "convenção"
`calc(var(--x, 1px) * -1)` inverteria o valor sempre que o token carregasse o próprio sinal — e
`h1LetterSpacing` é slider de faixa **−5..10**, default **−1**.

**Prova de que nada mais deixou de ser acusado.** Rodei as **duas** versões da regex sobre todo literal de
string do `VALUE_SCOPE` (`src/components/` + `src/features/`), comparando o veredito de cada uma:

```
literais de string analisados: 6720
vereditos que MUDARAM: 1

  src/components/atomic/Atoms/SarakTypography.tsx:43  ACUSAVA -> passa
     var(--sarak-h1-ls, -1px)

Deixaram de ser acusados : 1
PASSARAM a ser acusados   : 0   (deve ser 0 — a mudanca so RELAXA)
```

**Exatamente 1 veredito mudou, e é o alvo.** Nenhum átomo foi tocado: o defeito estava no detector, e é onde
foi consertado. `Valor (hex/px/rem/em) : 0`.

### 2 · `arquitetura/04` §2.2 — classificação corrigida

A seção afirmava que a consequência da duplicação era *"a última declaração sobrescreve a primeira"* e que as
três entradas repetidas eram *"redundância literal … inofensivo hoje"*. **A segunda afirmação era falsa.**

`getAllDesignTokens()` (`master-map.ts:75`) é um `flatMap` e **não deduplica** — as duas declarações eram
**ambas processadas pelo injetor**. O "sobrescreve" valia só para o `defaultValue`; para as **variáveis
emitidas** o efeito era de **união**. Foi o que apagou 51 variáveis quando removi a duplicata sem fundir.

A seção foi reescrita com: a tabela dos 7 mostrando **o que cada segunda declaração acrescentava** (só 2 dos 7
acrescentavam algo — `generateVariants` e 3 aliases), o relato do erro, e a regra que sobra: **desduplicar é
fundir, não escolher um lado.** Só a §2.2 foi tocada.

### 3 · `01-gates-e-baseline` §4.1 — a escolha registrada

Reescrita como **✅ FECHADO**, com: por que a "convenção" não servia (o token carrega o sinal, e a troca
inverteria a tela **passando no gate** — §6 item 3), a correção aplicada, o que deliberadamente **não** mudou
(`UNIT_RE`/`HEX_RE`), e a prova dos 6.720 literais.

Ficou registrada a lição que vale além do caso: `calc(var(--x, N) * -1)` **só** é convenção válida quando o
token é magnitude e apenas o fallback precisa do sinal. **A regra geral estava escrita larga demais.**

### 4 · Artefatos regenerados — e uma previsão minha que estava errada

Eu havia registrado como pendência que `catalog:check` e `guide:check` iriam acusar por causa do token novo.
**Não acusaram** — e o motivo é instrutivo:

| Gate | Estado | Por quê |
|---|---|---|
| `catalog:check` · `guide:check` | **em dia, sem regenerar** | publicam a contagem de tokens a partir de `design-token-ids.ts`, que está **defasado em 105** e não é regenerado por ninguém — é o **vão nº 1** da matriz |
| `dev-kit:check` | **defasado em 3 arquivos** → regenerado | lê a contagem **viva**: 409 → **410 tokens** |

Ou seja: **o vão nº 1 mascarou a mudança nos artefatos publicados.** O consumidor continua vendo 304 tokens.
Isso não é regressão desta execução — é a dívida do achado 22, e reforça por que ela é da `plan-12`.

`npm run build` rodou completo e verde (4 gates + 6 etapas), `dist/BUILD_INFO.json` em `baseCommit 622121a`.

### 5 · Baseline regravado, junto dos consertos

```
npm run audit:baseline -- --write
[audit:baseline] baseline regravado em gates/baselines/audit-baseline.json

npm run audit:baseline
[audit:baseline] igual ao baseline de 2026-08-03 — nenhuma regressão.
```

`gates/baselines/audit-baseline.json` — **todas as 8 métricas em 0**, e `tsc.erros` de **14 → 10**:

| Métrica | Antes | Depois |
|---|---|---|
| `auditor_hardcoded.valor` | 1 | **0** |
| `auditor_ghostvars.consumos` | 2 | **0** |
| demais 6 auditores | 0 | 0 |
| `tsc.erros` | 14 | **10** |

### 6 · Suíte

```
Test Files  279 passed (279)
     Tests  928 passed (928)
```

### O placar final da plan-07

| | Início | Fim |
|---|---|---|
| `run_audit` | exit 1, **2 auditores vermelhos** | **exit 0 — 100% íntegro** |
| `hardcoded` valor · `ghostvars` | 1 · 3 | **0 · 0** |
| `tsc` produção · total | 4 · 14 | **0 · 10** |
| Paridade | 409/409/409, 416 brutos | **410/410/410, 410 brutos** |
| Suíte | 274 / 889 | **279 / 928** |

### Achados fora do escopo (não corrigidos)

- **`arquitetura/04` §2.1 ficou desatualizada**: o aviso *"Se você somar a distribuição acima, chega a 416 — não
  a 409"* deixou de valer (hoje 410 = 410). A autorização desta rodada era **só a §2.2**, e o aviso já aponta o
  leitor para lá. Sugestão: corrigir na síntese.
- **O vão nº 1 segue aberto e agora tem consequência medida**: `design-token-ids.ts` defasado faz o catálogo
  publicado **não reagir** a token novo. Já é da `plan-12`; o dado novo é que ele **esconde mudança real**, não
  só publica número velho.

### Pendências / riscos

- **`gates/baselines/audit-baseline.json` tem de ser commitado JUNTO** dos consertos que o justificam — em
  especial `auditor_hardcoded.mjs` e os schemas. É a exigência da §3.5 e da §6.1 da spec de gates.
- **O baseline agora é ZERO.** A partir daqui, qualquer regressão bloqueia o commit no Anel 2 — que é o
  objetivo, e vale avisar: não há mais folga.

## Veredito (correção 1) — 2026-08-03 — 🟢 Aprovado

**`run_audit` fecha em ZERO.** O objetivo da §1 — *"o `run_audit` fecha em zero, ou o que sobrar está lá com o
motivo escrito"* — foi alcançado pela primeira metade, que era a difícil.

```
npm run audit          → AUDITORIA FINALIZADA COM SUCESSO: 100% íntegro   (exit 0)
npm run audit:baseline → igual ao baseline de 2026-08-03 — nenhuma regressão
npx vitest run         → 279 arquivos / 928 testes
```

| | Início da plan-07 | Fim — medido por mim |
|---|---|---|
| `run_audit` | exit 1, **2** vermelhos | **exit 0** |
| hardcoded · ghostvars | 1 · 3 | **0 · 0** |
| `tsc` produção · total | 4 · 14 | **0 · 10** |
| Paridade | 409/409/409, **416** brutos | **410/410/410, 410** brutos |
| Suíte | 274 / 889 | **279 / 928** |

### A prova da regex é o padrão que eu queria ver

Você não afirmou que a mudança era segura: **mediu**. 6.720 literais, os dois vereditos comparados um a um,
**1 mudou e 0 passaram a ser acusados**. Isso é a diferença entre "acho que não quebra" e "conferi que não
quebra" — e conferi o diff: só a linha `:126` mudou; `UNIT_RE` e `HEX_RE` intactos, então negativo escrito
solto continua sendo violação. O limite consertado está escrito no cabeçalho da função, como R18 exige.

### O achado nº 4 é o mais valioso da rodada

> *"`catalog:check` e `guide:check` não acusaram — eles publicam a contagem a partir do `design-token-ids.ts`
> defasado."*

**A sua previsão errada valeu mais que uma certa.** O vão nº 1 não apenas publica número velho: ele **esconde
mudança**. A plan criou um token (409 → 410) e **os dois gates de contrato passaram verdes** sobre um artefato
publicado que mudou. É a mesma família do `--sarak-button-radius`: a ferramenta incompleta **fabrica
tranquilidade**.

Ampliei o achado 22 em [[15-divida-conhecida]] §3.2 com essa dimensão — ela muda a prioridade do item na
`plan-12`.

### O item 6, de novo: fundir não é escolher

A §2.2 dizia *"redundância literal… inofensivo hoje"*. Era falso, e você provou no código: `getAllDesignTokens()`
é `flatMap` e não deduplica. **Só 2 dos 7 acrescentavam algo** — mas remover a perdedora apagaria 51 variáveis.
A regra que sobra — *desduplicar é fundir, não escolher um lado* — é conhecimento que não estava escrito em
lugar nenhum.

### Resíduos, corrigidos por mim nesta ação

- **`arquitetura/04` §2.1** — o aviso *"se você somar, chega a 416"* virou falso no instante em que os ids foram
  fundidos, e o documento passou a se contradizer (§2.1 dizia 416, §2.2 dizia FECHADA). Rotulei como histórico,
  com o estado de hoje: **410 = 410**. Você declarou em vez de tocar, e a autorização era só a §2.2 — correto.
- **[[15-divida-conhecida]] achado 22** — ampliado com a dimensão nova.

### O que muda a partir de agora, e vale um aviso

**O baseline é ZERO em todas as 8 métricas.** Não há mais folga: qualquer regressão bloqueia no Anel 2, sem
margem. É o objetivo — mas é uma mudança de regime, e a primeira reprovação vai surpreender alguém.

**Destino da síntese:** `specs/01-gates-e-baseline.md` (baseline zerado + §4.1 fechada — **já escrito**) ·
`specs/arquitetura/04-contrato-de-tokens-e-paridade.md` §2.1-2.2 (**já escrito**) ·
`specs/15-divida-conhecida.md` (achados 1, 22, 24, 25 e o achado 13 pela metade de teste)

**Liberado: pode commitar** — `audit-baseline.json`, `auditor_hardcoded.mjs` e os schemas **no mesmo commit**.
