---
tipo: "plan"
titulo: "Limpar o contrato público — as quebras saem juntas num único major"
dominio: "Sarak-Lib-UI-Core / Superfície pública"
status: "⚪ Sintetizada"
prioridade: "Alta"
tags: ["plan", "breaking-change", "major", "superficie-publica", "migracao"]
relacionados: ["[[03-superficie-publica]]", "[[03-versionamento-e-release]]", "[[15-divida-conhecida]]"]
depende_de: "plan-06"
destino_sintese: "arquitetura/03-superficie-publica.md · adr/009-* (se o SarakTabs exigir) · docs/migracoes.md"
---

> ⚠️ **A única plan que quebra contrato público de propósito.** Revalidação no ERP é **obrigatória** — ele é o
> único consumidor real. *Um major que não foi provado no consumidor real é um major que ninguém sabe se migra.*

# 1. Objetivo

`npm version major` → **`2.0.0`** com **uma** nota de migração só, e o consumidor atravessa o major **uma vez,
não três**.

# 2. Contexto

As quebras de contrato estão paradas há tempo, e sempre pelo mesmo motivo: **cada uma, sozinha, custaria uma
migração ao consumidor.** Migrações separadas custam ao importador várias vezes o mesmo trabalho de leitura,
teste e ajuste — por isso saem juntas ou não saem.

> **Escopo revisado em 2026-08-01, pela triagem da plan-03** (veredito 🟢). Duas trocas, ambas já decididas pelo
> dono e registradas em [[15-divida-conhecida]]: o **achado 27 SAIU** — `chromeSlots` contando 9 para 8 foi
> **aceito como característica** (§5 da spec de dívida; o `doc` do próprio slot avisa o consumidor de que
> `topbarActions` é alias de `topbarEnd`), e o **achado 2 ENTROU** — `upgradeThemePayload(partialMode)` é
> parâmetro morto cuja remoção muda assinatura pública.
>
> **Acréscimo de 2026-08-02:** a `plan-13` escreveu **R32** e a única violação dela é pública — o
> `SarakSecurityOrchestrator`. Removê-lo é breaking, então entra aqui.
>
> **Reconciliação de 2026-08-04** *(decisão do dono: remover todo obsoleto)*: as duas perguntas em aberto
> fecharam — o `SarakTabs` duplicado **sai** e os 2 ids legados do Discovery **saem**. E a medição mostrou que
> o duplicado **não é público**, o que dispensa o ADR que a versão anterior previa.
> **5 itens, 4 operações, 3 quebras reais.**

# 3. Escopo

> ✅ **Reconciliado em 2026-08-04, contra o código de hoje.** As duas perguntas que estavam abertas foram
> respondidas pela decisão do dono — *"tudo que for obsoleto deve ser removido; código limpo e sem legado"* — e
> a medição mudou a natureza de um item: **o `SarakTabs` de `Layouts/` não é público**. Ver §3.3.

## 3.1 Dentro — 5 operações

**São 5 itens e 4 operações**, porque dois deles se resolvem na mesma edição.

| # | Operação | Onde | Quebra contrato? |
|---|---|---|---|
| 1 | **`CustomizationPanel` lazy** + **remover os 2 ids legados do Discovery** | `src/index.ts:50` (o export) e `:125-131` (o bloco de efeito colateral) | ⚠️ **só os ids** — ver §3.5 |
| 2 | **Remover `Layouts/SarakTabs`** — o duplicado | `Layouts/SarakTabs.tsx` · `Layouts/index.ts:6` · `Layouts/__tests__/SarakTabs.test.tsx` · o comentário de `src/index.ts:58-62` | ❌ **NÃO** — é código morto não-público. Ver §3.3 |
| 3 | **`upgradeThemePayload(partialMode)`** — remover o parâmetro morto | `src/core/Design/master-map.ts:148` | ✅ **SIM** — assinatura pública |
| 4 | **Remover o `SarakSecurityOrchestrator`** | `Templates/SarakSecurityOrchestrator.tsx` · `components/SecurityOrchestratorSetup.tsx` · `hooks/useSecurityOrchestratorState.ts` · `Templates/index.ts:14` · os testes | ✅ **SIM** — símbolo público removido |

**Três operações quebram contrato. Continua sendo major** — basta uma.

## 3.2 As operações 1 e 3 são a mesma edição

O bloco `src/index.ts:125-131` faz **as duas coisas ao mesmo tempo**: importa o `CustomizationPanel` de forma
**eager** e registra os **dois ids legados** (`mx-customization`, `personalization`) por efeito colateral.

**Apagar o bloco remove os dois ids E o import eager de uma vez.** Sobra tornar o `export *` de `:50` lazy —
que é a outra metade da operação 1. Por isso "5 itens, 4 operações": os ids legados não são trabalho
separado, são consequência.

## 3.3 🔴 O `SarakTabs` de `Layouts/` NÃO é público — e isso encolhe a plan

A versão anterior mandava *"decidir qual API sobrevive"* e previa **um ADR**, porque tratava os dois como
concorrentes públicos. **Medido em 2026-08-04, não são:**

| Fato | Evidência |
|---|---|
| `Layouts/index.ts:6` o exporta | mas o barril de categoria **não** chega ao público |
| `src/index.ts` **não** faz `export *` de `Layouts/` | usa exports **nomeados** (`:63-70`) — 4 dos 6 componentes |
| O motivo está escrito no próprio código | `src/index.ts:58-62`: *"colide de nome com `UX/SarakTabs`… a deduplicação fica para uma spec de refatoração dedicada"* |
| **Ninguém o importa** | `grep` em `src/`: zero consumidores. O único import de `../Layouts` é `SarakForm.tsx:7`, e pega `SarakGrid`/`SarakFormGroup` |

**Consequências:**

1. **Não há trade-off entre duas APIs públicas** — há **remoção de código morto**. A decisão do dono resolve
   direto, e **o ADR previsto na versão anterior deixa de ser necessário**.
2. **A operação 2 não quebra contrato.** Poderia sair em qualquer versão; sai aqui porque é a plan que limpa a
   superfície, e porque **libera o `src/index.ts`** do workaround.
3. ⚠️ **Um vão de gate, achado nesta reconciliação:** o `barrel:check` está **verde** hoje, com
   `Layouts/SarakTabs` exportado pelo barril de categoria e **ausente** do barril público. Ele confere **por
   nome**, e o nome `SarakTabs` está exportado — vindo do `UX/`. **Dois componentes diferentes com o mesmo nome
   mascaram a falta.** Registre no resumo; o gate é da `plan-12`.

**Não troque os exports nomeados por `export *`** ao remover o duplicado: `Layouts/index.ts` exporta **6** e o
barril público leva **4**; `export *` acrescentaria `SarakFormGroup` à superfície pública — mudança aditiva que
esta plan não pediu. **Só apague o comentário obsoleto de `:58-62`.**

## 3.4 Fora

- ⛔ Emitir o `npm version major` **antes** da revalidação no ERP.
- ⛔ **Trocar os exports nomeados de `Layouts/` por `export *`** — ver §3.3.
- ⛔ Qualquer outra quebra não listada. **O major não é carona.**
- ⛔ Ampliar gate — é da `plan-12`, inclusive o vão do `barrel:check` achado na §3.3.

## 3.5 🔴 O `CustomizationPanel` lazy NÃO quebra contrato — a §3.1 previa errado

*(corrigido em 2026-08-04, depois da execução)*

A §3.1 dizia que tornar lazy *"muda o tipo público para `LazyExoticComponent`"*. **Falso**, e a contradição
estava dentro desta própria plan: a **§5.2 manda seguir o padrão do `SarakChartEngine`**
([[03-superficie-publica]] §7.1), e esse padrão **reexporta um `React.FC` com `Suspense` interno** — o tipo
público é preservado, e o consumidor continua escrevendo `<CustomizationPanel />` sem `Suspense`.

A execução seguiu a **instrução operativa** (§5.2) em vez da previsão (§3.1), o que é a ordem certa: instrução
manda, previsão descreve. **Erro do revisor, apanhado na execução.**

**O que isso muda:** o major segue justificado, mas por **3 quebras** — os 2 ids legados do Discovery, o
`partialMode` e o `SarakSecurityOrchestrator`. O ganho de boot (**−75,1%**) entra na nota de migração como
**melhoria sem custo de migração**, que é a melhor linha que uma nota de major pode ter.

## 3.6 Operação 5 — o token órfão do MFA *(acrescentada em 2026-08-04)*

**`mfaQrCodeSize` (`src/core/Design/schema/cards.ts:564,572` → `--sarak-mfa-qr-code-size`) ficou sem
consumidor** quando o `SarakSecurityOrchestrator` saiu. Ele continua nas 3 fontes — a paridade segue
410/410/410 — mas **não move mais nada**.

**Entra no major, e não é carona.** A §3.4 proíbe carona: item **alheio** pegando o major de graça. Este não é
alheio — é a **cauda da operação 4**. O token existia para o componente removido; deixá-lo é entregar a
operação pela metade e precisar de **outro major** para tirá-lo, já que remover id de token muda o tipo público
`SarakDesignTokens`.

**Como fazer:** remover das **3 fontes** (schema, `theme_table_mapping`, partição), regenerar o catálogo, e
confirmar paridade **409/409/409**. A regra é a R4 ao contrário — token morre nas três ou não morre.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/03-superficie-publica.md` §8 | as três dívidas que morrem aqui |
| Spec fixa | `specs/03-versionamento-e-release.md` | o ciclo `npm version` e o anel de release |
| ADR | `adr/008-releases-com-tag-e-semver-em-git` | como o consumidor resolve a faixa |
| Spec fixa | `specs/12-kit-do-consumidor.md` | o que o kit publica e precisa acompanhar |
| Plan | `plan-04-alinhamento-erp` | o ERP precisa estar alinhado para a prova valer |

# 5. Instruções de execução

1. **Apagar o bloco `src/index.ts:125-131`** — sai o import eager **e** os 2 ids legados na mesma edição
   (§3.2). Verificar antes quem mais registra em `core/Discovery/registry`.
2. **Tornar lazy o export de `:50`** — reexportar o índice que declara o `React.lazy`, no padrão do
   `SarakChartEngine` ([[03-superficie-publica]] §7.1). **Medir o boot antes e depois**: o ganho é o argumento
   da nota de migração.
3. **Remover `Layouts/SarakTabs`** — o `.tsx`, a linha `:6` do barril de categoria, o teste, e o comentário
   obsoleto de `src/index.ts:58-62`. **Sem ADR** (§3.3) e **sem trocar os exports nomeados por `export *`**.
4. **Remover `partialMode`** de `upgradeThemePayload` (`master-map.ts:148`), confirmando por busca no
   repositório inteiro que nenhum chamador o passava.
5. **Remover o `SarakSecurityOrchestrator`** — os 3 arquivos, o export de `Templates/index.ts:14` e os testes.
   Conferir que nenhum outro componente importa o hook. ⚠️ O critério é **`grep` → 0**, não a lista da §3.1:
   a coluna "Onde" subdimensionou o item, e quem manda é a busca.
6. **Remover o token `mfaQrCodeSize`** (§3.6) — das 3 fontes, com o catálogo regenerado e paridade
   **409/409/409**.
6. **Uma entrada única em `docs/migracoes.md`**, cobrindo as cinco: antes/depois e como migrar. Uma entrada,
   não cinco separadas — é o ponto inteiro desta plan.
7. **⇒ PARE. Revalidar no ERP** *antes* do `npm version`: diagnóstico read-only → relatório → **"sim" do dono**
   → execução. O ERP tem de subir e funcionar com o `2.0.0`.
8. Só então emitir o major, pelo ciclo normal (`npm version major`).

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-09-contrato-publico-2-0-0.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/arquitetura/03-superficie-publica.md, specs/specs/03-versionamento-e-release.md,
specs/specs/12-kit-do-consumidor.md.
Skills a aplicar: padrao-typescript, test-unitario.

A §3 foi RECONCILIADA em 2026-08-04 contra o código de hoje. Leia a §3.3 antes de comecar:
o SarakTabs de Layouts/ NAO e publico, entao removê-lo e limpeza de codigo morto, NAO quebra
de contrato — e o ADR que a versao anterior previa NAO e necessario.

As duas perguntas que estavam abertas ja foram decididas pelo dono (remover todo obsoleto):
o SarakTabs duplicado sai, e os 2 ids legados do Discovery saem. Nao pergunte de novo.

Sao 5 itens em 4 operacoes — as operacoes 1 e 3 sao a mesma edicao (§3.2).
NAO troque os exports nomeados de Layouts/ por `export *` (§3.3, ultimo paragrafo).
As mudancas produzem UMA entrada em docs/migracoes.md, nao cinco.

Você NÃO emite `npm version major` — quem publica é o usuário, e só depois da revalidação
no ERP.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] `CustomizationPanel` fora do caminho crítico; o import eager por efeito colateral removido.
- [ ] Ganho de boot **medido**, antes e depois.
- [ ] **Um só** `SarakTabs` no repositório — o de `UX/`. O de `Layouts/` e seu teste removidos, e o comentário
      de `src/index.ts:58-62` some junto.
- [ ] Os **2 ids legados** do Discovery removidos, e o bloco de efeito colateral com eles.
- [ ] **`barrel:check` e `catalog:check` verdes com a contagem NOVA** — e o resumo diz qual é, porque remover
      componente muda o número (era 81).
- [ ] `upgradeThemePayload` sem o parâmetro `partialMode`, e nenhum chamador quebrado.
- [ ] `SarakSecurityOrchestrator` e suas 2 peças removidos; `grep -rn "mfa/" src/` → **0**.
- [ ] **Uma** entrada em `docs/migracoes.md` cobrindo as cinco, com antes/depois.
- [ ] `arquitetura/03-superficie-publica.md` §8 sem as três dívidas — **feito pelo revisor**, não pelo executor.
- [ ] Token `mfaQrCodeSize` fora das 3 fontes; paridade **409/409/409**.
- [ ] `npm run gates:full` verde — **inclusive `package:check`**, que é o único que enxerga o conteúdo do tarball.
- [ ] **ERP revalidado com o `2.0.0`** — sobe, navega e builda.
- [ ] Suíte verde; `npm run gates:full` verde; DTS gerado sem erro.
- [ ] O `npm version major` **não** foi rodado pelo agente.

# 8. Como verificar

- `grep -n "CustomizationPanel" src/index.ts` → export lazy; sem import por efeito colateral
- `find src -name "SarakTabs*"` → **só** `UX/` (o `.tsx` e os 2 testes)
- `grep -n "registerLocalComponent" src/index.ts` → **nada**
- `grep -rn "partialMode" src/` → **0 ocorrências**
- `grep -rn "SecurityOrchestrator\|mfa/" src/` → **0 ocorrências**
- `docs/migracoes.md` → **uma** entrada nova cobrindo as cinco
- No ERP: `pnpm install && npm run dev` → sobe com o `2.0.0`; as telas navegam
- `npx vitest run` · `npm run gates:full` → verdes

# 9. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md` (as dívidas da §8 morrem) · `adr/009-*` (se o `SarakTabs`
exigir) · `docs/migracoes.md` (a entrada única) · `specs/15-divida-conhecida.md` (achados **2 e 3** saem da §3) ·
`specs/00-regras-e-invariantes.md` (R32 deixa de ter violação declarada)

> **Correção a levar junto na síntese** *(medida pelo revisor em 2026-08-01)*:
> `arquitetura/03-superficie-publica.md:177` cita o import por efeito colateral em `src/index.ts:119-125`.
> O real hoje é **`:126-131`** (`:50` é o export). Divergência spec × código, pequena e viva — some quando a
> §8 for reescrita por esta plan.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-05

**Resultado:** Concluído com pendências *(as 4 operações estão feitas e verdes; a plan para no
passo §5.7 — a revalidação no ERP exige "sim" do dono, e o `npm version major` é do usuário)*

**O que foi feito**

**Operação 1 + os 2 ids legados** *(a mesma edição, §3.2)*

- `src/index.ts` — o bloco de efeito colateral (7 linhas, antigas `:125-131`) **apagado**: saíram
  juntos o import eager do painel e os dois `registerLocalComponent('mx-customization' |
  'personalization')`.
- `src/index.ts:50-52` — o `export *` virou export nomeado do índice lazy.
- `src/features/DesignEngine/Library/CustomizationPanel/index.tsx` (novo) — declara o `React.lazy`
  e embrulha em `LazyEngineWrapper`, **no padrão do `SarakChartEngine`** que a §5.2 manda seguir.
- `CustomizationPanel.tsx` → `CustomizationPanel/CustomizationPanelImpl.tsx` (`git mv`), e o teste
  junto, seguindo a forma dos outros lazy (`SarakDataTable/SarakDataTableImpl.tsx`).
- **⚠️ Duas edições que a §3.1 não lista, e sem as quais a operação 1 entrega código quebrado —
  ver *Decisões* 1:**
  `src/core/Provider/hooks/useRegistryManager.ts:21-33` — removido o `registerSarakModule({id:
  'mx-customization', …, priority: 9999})`; e `src/core/Shell/useSarakShell.ts:21-32` — removido o
  desempate que elegia `mx-customization` como tela inicial.

**Operação 2 — o `SarakTabs` duplicado**

- Removidos `Layouts/SarakTabs.tsx` e `Layouts/__tests__/SarakTabs.test.tsx`; a linha `:6` saiu de
  `Layouts/index.ts`; o comentário obsoleto de `src/index.ts:58-62` foi substituído pela razão real
  de os exports serem nomeados. **Sem ADR** (§3.3) e **sem trocar por `export *`** (§3.4).

**Operação 3 — `partialMode`**

- `src/core/Design/master-map.ts:148` — parâmetro removido. Confirmado por busca no repositório
  inteiro que a única ocorrência era a própria assinatura; **zero chamadores** o passavam.

**Operação 4 — `SarakSecurityOrchestrator`**

- **10 arquivos removidos**, não 3: o componente, as **três** peças privadas (`Setup`, `Status`,
  `Disable` — a §3.1 nomeava só o `Setup`), o hook `useSecurityOrchestratorState` e os 5 testes.
- `Templates/index.ts:14` — export removido.
- **⚠️ Quatro pontas que a §3.1 não lista e que o critério `grep → 0` obriga** — ver *Decisões* 2:
  `ContractRenderer.tsx:2,96-105` (import + o `case 'SECURITY_ORCHESTRATOR'`), o teste do case,
  `Spec21.spec.tsx` (4 testes visuais + imports), `shared/services/api.ts:5` (JSDoc), e o membro
  `'SECURITY_ORCHESTRATOR'` do union público `VisualContractType` em **dois** arquivos
  (`core/Discovery/types.ts:28` e `constants/discovery.ts:13`).
- `catalog/partitions/cards_engine.json:1882` — `digitalTwins` do token `mfaQrCodeSize` esvaziado.
  **O token NÃO foi removido** — ver *Decisões* 3 e *Achados*.

**Gate bloqueou, causa corrigida**

- `scripts/copy-base-css.mjs:23-28` — o `package:check` derrubou o `gates:full` acusando
  `dist/styles/__tests__/focusRing.test.ts` **no tarball publicado**. Causa: o script copia
  `src/styles/` inteiro para `dist/`, e a **plan-08 criou um `__tests__/` ali**. Regressão minha,
  de duas rodadas atrás. Corrigido na causa: o `cpSync` ganhou `filter` que barra `__*` e
  `*.test|spec.*`. **Não foi contorno** — o gate segue cobrando o mesmo.

**Ganho de boot — medido, antes e depois** *(§5.2 e critério 2)*

Duas builds completas, mesma máquina, `dist/index.js` (o chunk de boot):

| | bytes | KB |
|---|---|---|
| **Antes** | 674.011 | 658,2 |
| **Depois** | 167.684 | 163,8 |
| **Ganho** | **−506.327** | **−494,4 KB · −75,1%** |

O Design Engine inteiro saiu do caminho crítico e virou `dist/CustomizationPanelImpl-2NMXLZIS.js`.
É o argumento da nota de migração, como a plan pediu.

**Contagem nova de componentes** *(critério 5)*

**81 → 80** no `barrel:check` e no catálogo; **87 → 86** no kit do consumidor.
**Só −1, e isso é a prova do vão da §3.3:** removi **dois** componentes (o orquestrador e o
`Layouts/SarakTabs`), e o gate só enxergou um — porque ele confere **por nome** e `SarakTabs`
continua exportado, vindo do `UX/`. O vão está confirmado empiricamente; o gate é da `plan-12`.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Library/CustomizationPanel/index.tsx` | criado | fronteira lazy + `Suspense` interno |
| `src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl.tsx` | movido | era `Library/CustomizationPanel.tsx` |
| `src/features/DesignEngine/Library/CustomizationPanel/__tests__/CustomizationPanelImpl.test.tsx` | movido + alterado | +2 testes da fronteira lazy |
| `src/index.ts` | alterado | bloco de efeito colateral apagado · export lazy · comentário obsoleto |
| `src/core/Provider/hooks/useRegistryManager.ts` | alterado | módulo `mx-customization` não é mais registrado |
| `src/core/Shell/useSarakShell.ts` | alterado | sem desempate por `mx-customization` |
| `src/components/atomic/Layouts/SarakTabs.tsx` + teste | **removidos** | duplicado não-público |
| `src/components/atomic/Layouts/index.ts` | alterado | linha `:6` removida |
| `src/core/Design/master-map.ts` | alterado | `partialMode` removido |
| `SarakSecurityOrchestrator.tsx` + `Setup`/`Status`/`Disable` + hook + 5 testes | **removidos** | 10 arquivos |
| `src/components/atomic/Templates/index.ts` | alterado | export removido |
| `src/core/Discovery/components/ContractRenderer.tsx` + teste | alterado | `case` e import removidos |
| `src/core/Discovery/types.ts` · `src/constants/discovery.ts` | alterado | `'SECURITY_ORCHESTRATOR'` fora do union |
| `src/components/atomic/Templates/__tests__/Spec21.spec.tsx` | alterado | −4 testes visuais |
| `src/shared/services/api.ts` | alterado | JSDoc |
| `src/core/Design/catalog/partitions/cards_engine.json` | alterado | `digitalTwins: []` em `mfaQrCodeSize` |
| `scripts/copy-base-css.mjs` | alterado | não publica mais `__tests__/` |
| `docs/migracoes.md` | alterado | **uma** entrada, cobrindo as cinco |
| `docs/component-catalog.*` · `sarak-ui/*` · `sarak-dev/*` · `dist/*` | alterado | **gerados** |

**Verificações executadas**

- `npm run gates:full` → **exit 0** (`dev-kit:check` → `build` → `package:check` → `vitest`).
- `npx vitest run` → **275 arquivos, 942 testes, 0 falhas**. Eram 281/950: **−6 arquivos e −8
  testes** são exatamente os testes dos componentes removidos, **+2** são os da fronteira lazy.
- `npm run audit` → **exit 0**, 8 auditores OK. **Paridade 410/410/410 intacta** — nenhum token
  saiu.
- `npx tsc --noEmit` → **10 erros**, os mesmos pré-existentes (os do `Spec21` só mudaram de linha).
- `npm run barrel:check` → **80 componentes, 0 faltas**. `catalog:check` · `guide:check` ·
  `zero-brand:check` · `package:check` → OK.
- `grep -rn "SecurityOrchestrator\|mfa/" src/` → **0** · `partialMode` → **0** ·
  `SECURITY_ORCHESTRATOR` → **0** · `registerLocalComponent` em `src/index.ts` → **0** ·
  `find src -name "SarakTabs*"` → só `UX/`.
- **DTS gerado sem erro:** `dist/index.d.ts` 118.516 bytes.

**Critérios de aceite**

- [x] `CustomizationPanel` fora do caminho crítico; import eager removido — `src/index.ts:50-52`.
- [x] Ganho de boot medido — **−75,1%**, tabela acima.
- [x] Um só `SarakTabs`; teste e comentário `:58-62` removidos juntos.
- [x] Os 2 ids legados removidos, e o bloco com eles.
- [x] `barrel:check` e `catalog:check` verdes com a contagem nova — **80** (era 81).
- [x] `upgradeThemePayload` sem `partialMode`, nenhum chamador quebrado.
- [x] `SarakSecurityOrchestrator` removido; `grep -rn "mfa/" src/` → 0.
- [x] **Uma** entrada em `docs/migracoes.md`, com antes/depois e como migrar.
- [ ] `arquitetura/03-superficie-publica.md` §8 sem as três dívidas — **não executado, e de
      propósito:** [[00-prompt-executor]] §7.3 proíbe o executor de editar spec fixa. A §9 desta
      plan lista esse arquivo como **destino de síntese**; é o revisor quem o reescreve.
- [ ] **ERP revalidado com o `2.0.0`** — a plan manda **PARAR** aqui (§5.7). Relatório de
      diagnóstico entregue ao usuário; aguarda o "sim".
- [x] Suíte verde; `npm run gates:full` verde; DTS gerado sem erro.
- [x] O `npm version major` **não** foi rodado pelo agente.

**Decisões e suposições**

1. **Operação 1 exigiu duas edições fora da coluna "Onde" da §3.1, e sem elas ela entrega código
   quebrado.** Medido antes de editar: `useRegistryManager.ts:35-42` registra o **módulo**
   `mx-customization` com `priority: 9999` e o comentário `:41` declara que *"o componente será
   resolvido através de `registerLocalComponent` no entrypoint"* — o entrypoint que a plan manda
   apagar. Apagar só o bloco deixaria: (a) um item de menu que não renderiza nada, (b) um
   `console.warn` do `registry.ts:108` em todo boot, e (c) o `useSarakShell.ts:31`
   **auto-navegando** para esse módulo quebrado como tela inicial. Removi as três pontas.
   **Não é carona:** é a operação 1 chegando ao fim. Reverter custa ~10 linhas se o revisor
   discordar. **Consequência visível para o ERP:** o menu "Design Engine" some se o consumidor não
   registrar o par — está na nota de migração, com o código pronto.
2. **A §3.1 subdimensiona a operação 4, e o critério de aceite resolve.** A tabela nomeia 3
   arquivos; o componente tinha 10, mais 6 pontas fora dele (`ContractRenderer`, o teste, `Spec21`,
   `api.ts`, e o union `VisualContractType` em **dois** arquivos). Segui o critério
   `grep -rn "SecurityOrchestrator\|mfa/" src/` → **0**, que é inequívoco. O membro
   `'SECURITY_ORCHESTRATOR'` do union **não** casa com esse grep, mas mantê-lo deixaria um contrato
   público que não renderiza nada — mesma classe de defeito do módulo órfão do item 1. Saiu, e está
   na nota de migração.
3. **NÃO removi o token `mfaQrCodeSize`, e é uma escolha, não esquecimento.** Ele é um dos 410 e o
   **único** consumidor de `--sarak-mfa-qr-code-size` era `SecurityOrchestratorSetup.tsx:49,53`.
   Removê-lo das 3 fontes seria uma **5ª quebra** (o tipo público `SarakDesignTokens` encolhe), e a
   §3.4 é explícita: *"Qualquer outra quebra não listada. O major não é carona."* Esvaziei só o
   `digitalTwins` (que o critério `grep → 0` obriga) e registrei o órfão como achado.
4. **Segui a §5.2 (padrão `SarakChartEngine`) e não a previsão da §3.1** ("o tipo público vira
   `LazyExoticComponent`). As duas se contradizem: o padrão do `SarakChartEngine` embrulha em
   `Suspense` interno e **preserva** o tipo `React.FC`. Escolhi o que a instrução operativa manda e
   o que é melhor para o consumidor — de quebra, é uma quebra a menos, e a §3.4 diz que o major não
   é carona. **A operação 1 continua quebrando contrato**, só que pela remoção dos ids, não pelo
   tipo. O major segue justificado por 3 quebras: ids legados (op 1), `partialMode` (op 3) e o
   orquestrador (op 4).
5. **A §3.3 erra uma contagem, e o erro não muda a conclusão.** Ela diz que o barril público leva
   **4 dos 6** de `Layouts/` e que `export *` acrescentaria `SarakFormGroup`. Medido: o barril leva
   **5 dos 6** — `SarakFormGroup` **já é público** (`src/index.ts:70-71`); o único de fora era o
   `SarakTabs`. Isso significa que, depois desta remoção, `export *` seria de fato equivalente.
   **Mantive os exports nomeados assim mesmo**, porque a §3.4 e o prompt os travam — e a razão que
   escrevi no lugar do comentário obsoleto é a verdadeira: manter a superfície declarada aqui, e
   não herdada do barril de categoria.
6. **`dist/` foi reconstruído** (duas vezes, para medir). Ele é versionado e o `npm version`
   regenera de qualquer forma; deixá-lo velho faria o artefato divergir do fonte.

**Achados fora do escopo (não corrigidos)**

1. **Token órfão novo: `mfaQrCodeSize`** (`schema/cards.ts:564` · `theme_table_mapping.json:314` ·
   `cards_engine.json:1873`). Depois desta plan, `--sarak-mfa-qr-code-size` **não tem mais nenhum
   emissor no CSS** — é exatamente a classe "promessa sem emissor" que a `plan-08` F4 acabou de
   fechar para o `focusRingWidth`. Ou uma plan nova o remove das 3 fontes (quebra de
   `SarakDesignTokens`, cabe num major), ou ele fica declarado como dívida. **Decisão do revisor.**
2. **Vão do `barrel:check` confirmado empiricamente** (§3.3, item 3): remover
   `Layouts/SarakTabs` mudou a contagem em **zero**, porque o gate confere por nome e `SarakTabs`
   segue exportado pelo `UX/`. Já está roteado para a `plan-12`; aqui fica a medição.
3. **`specs/01-gates-e-baseline.md` · `00-contexto.md:312`** seguem dizendo que o `run_audit` fecha
   em exit 1 no HEAD limpo. Medido de novo: **exit 0**. Herdado da `plan-08`; spec é do revisor.
4. **`design-token-ids.ts` publica 304 de 410** (achado 22) — o `sarak-ui/VERSION` que regerei
   carrega o número falso.

**Pendências / riscos**

- **A plan para no §5.7, por desenho.** Falta a revalidação no ERP e, depois dela, o
  `npm version major` — que é do usuário. Relatório de diagnóstico entregue na conversa.
- **Risco concentrado no item 1 da migração:** o ERP pode depender do registro automático de
  `mx-customization` para a sua tela inicial. É o primeiro ponto a olhar na revalidação, e a nota
  de migração já traz o código de reposição.
- `arquitetura/03-superficie-publica.md` §8 continua listando as três dívidas que esta plan matou —
  é síntese do revisor, não do executor.
- Nada commitado.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito (rodada 1) — 2026-08-04 — 🔴 Reprovado (0 achados — falta a operação 5)

**As 4 operações estão certas e o ganho é o maior já medido nesta base.** Reprovo apenas porque acrescentei uma
quinta operação depois da entrega (§3.6) — não há defeito no que foi feito.

### Reproduzi

| | Medido por mim |
|---|---|
| Boot | **674.011 → 167.684 bytes · −494,4 KB · −75,1%** |
| `barrel:check` | **80** componentes (era 81) · `catalog:check` verde |
| `npm run audit` | exit 0, paridade **410/410/410** |
| Greps do §8 | `SecurityOrchestrator\|mfa/`, `partialMode`, `SECURITY_ORCHESTRATOR`, `registerLocalComponent` → **todos 0** |
| `SarakTabs` | só em `UX/` — o `.tsx` e os 2 testes |

### As três divergências: aceitas, e duas apontam erro meu

1. **As edições fora da coluna "Onde"** (`useRegistryManager.ts:35-42`, `useSarakShell.ts:31`). Apagar só o
   bloco entregaria **item de menu que não renderiza nada + `console.warn` em todo boot**. As três pontas são um
   defeito só.
2. **A operação 4 eram 10 arquivos, não 3.** A coluna "Onde" subdimensionou; o critério certo é **`grep` → 0**,
   e está escrito agora na §5.5.
3. **A §3.1 previa `LazyExoticComponent` e estava errada** — a §5.2, na mesma plan, mandava seguir o padrão do
   `SarakChartEngine`, que **preserva o tipo**. Seguir a instrução operativa em vez da previsão foi a ordem
   certa. Registrado na §3.5: **o `CustomizationPanel` não quebra contrato**, e o major se sustenta em **3**
   quebras.

### A revalidação no ERP — passo 7 CUMPRIDO

O dono executou e aprovou em 2026-08-04. Medido por mim na cópia instalada:

| | Resultado |
|---|---|
| Versão instalada | **1.2.1** — igual ao repo e à tag `v1.2.1` |
| `SarakSecurityOrchestrator` no `dist/index.d.ts` | **0** |
| `mx-customization` no `dist/index.js` | **0** |
| Boot instalado | **167.684 bytes** |
| `sarak:check` | Atualizado, exit 0 |

**O código do futuro `2.0.0` está no ERP sob o rótulo `1.2.1`, e é o estado correto do passo 7** — prova-se o
código, carimba-se a versão depois. *(Correção: a minha instrução anterior dizia "a versão instalada tem de ser
2.0.0". Errado — o `2.0.0` só nasce no passo 8.)*

**Custo de migração medido para o único consumidor real: zero linha de código.** Só o reinstall.

### O aviso de peer NÃO é desta plan, e não é da lib

```
unmet peer react: instalado 19.2.8 · lucide-react@0.376.0 quer ^16.5.1 || ^17.0.0 || ^18.0.0
```

Medido: a lib declara `lucide-react` como **peer `>=0.284.0`** e `react >=18.0.0` — faixa aberta, sem pino.
**Quem fixa `lucide-react: "0.376.0"` é o ERP**, em `packages/ui-kit/package.json`, e essa versão é anterior ao
React 19. `git diff` do `package.json` da lib não tem uma linha de `lucide`.

**É item do backlog do ERP**, não desta plan: subir o `lucide-react` para uma versão que declare React 19. Hoje
é só aviso — mas com `strict-peer-dependencies=true` vira **falha de install**.

### Falta a operação 5, e depois dela um reinstall

A §3.6 acrescentou a remoção do token `mfaQrCodeSize` — a **cauda da operação 4**, não carona. Depois dela a
paridade cai para **409/409/409** e o `sarak-ui/catalog.json` muda, então o ERP precisa de **mais um
`corepack pnpm install --force --filter @erp/ui-kit`** antes do release.

**Não precisa repetir a navegação:** o token removido não tem consumidor, no ERP nem em lugar nenhum. Basta o
reinstall + `sarak:check` verde + o build do ERP.

### Prompt de correção

```
Leia specs/00-prompt-executor.md e feche specs/plan/plan-09-contrato-publico-2-0-0.md.

Veredito de 2026-08-04: as 4 operações estão APROVADAS e o passo 7 (ERP) está CUMPRIDO.
Zero achado no seu trabalho. Falta a operação 5, que o revisor acrescentou depois da entrega:

1. Remover o token `mfaQrCodeSize` (§3.6) das TRÊS fontes — `src/core/Design/schema/cards.ts:564,572`,
   o `theme_table_mapping.json` e a partição do catálogo. Regenerar o catálogo.
   Critério: paridade **409/409/409** e `npm run audit` exit 0.

2. Acrescentar o token removido à entrada única de `docs/migracoes.md` — ele muda o tipo público
   `SarakDesignTokens`, então é a 4ª quebra e o consumidor precisa saber.

3. `npm run gates:full` verde — inclusive `package:check`.

Escopo: EXCLUSIVAMENTE isso. Não mexa em mais nada, não repita a revalidação do ERP.
NÃO emita `npm version major` — é do dono, e só depois deste veredito.

Acrescente "## Resumo da execução (correção 1) — AAAA-MM-DD" ao final. Status: "🟠 Em revisão".
Não commite. Devolva para revisão.
```


---

## Resumo da execução (correção 1) — 2026-08-05

**Resultado:** Concluído

Veredito de 2026-08-04: as 4 operações **aprovadas**, passo 7 (ERP) **cumprido**, zero achado.
Faltava a **operação 5** (§3.6), acrescentada pelo revisor depois da entrega. Escopo desta rodada:
**exclusivamente** ela. O ERP **não** foi revalidado de novo, e o `npm version major` **não** foi
emitido.

**Operação 5 — o token órfão do MFA**

Removido das **três** fontes, na mesma edição — a R4 ao contrário, como a §3.6 formula: *token morre
nas três ou não morre*.

| Fonte | Onde | O que saiu |
|---|---|---|
| Schema | `src/core/Design/schema/cards.ts:562-574` | o bloco inteiro do token `mfaQrCodeSize`, mais o comentário de seção `// --- TEMPLATES: SECURITY / MFA (Spec 27) ---`, que existia só para ele |
| Banco | `src/core/Design/catalog/theme_table_mapping.json:314` | a entrada `"mfaQrCodeSize"` |
| Catálogo | `src/core/Design/catalog/partitions/cards_engine.json:1872-1886` | o objeto do token (15 linhas), incluindo o `cssVariables: ["--sarak-mfa-qr-code-size"]` |

**29 linhas a menos, e `grep mfaQrCodeSize` nas 3 fontes → 0 em cada uma.**

Três snapshots foram regravados porque o `useDesignVariables` deixou de emitir a variável — não é
mudança de teste, é o efeito do token sumindo:
`PreviewCanvas.test.tsx.snap` (20 ocorrências), `PresetCard.test.tsx.snap` e
`PreviewSystemRenderer.test.tsx.snap` (1 cada).

**Nota de migração — a 4ª quebra**

`docs/migracoes.md:76-88` — item **4** novo na entrada única, com antes/depois (410 → 409 tokens) e
o "como migrar": remover a chave de tema próprio e trocar `var(--sarak-mfa-qr-code-size)` por valor
do host. Registrei também o que **não** quebra: tema em JSON puro ignora a chave a mais em runtime;
o erro só aparece para quem tipa o tema com `SarakDesignTokens` — que é o caminho recomendado.

O cabeçalho da entrada e a numeração acompanharam: *"Cinco mudanças"* → **"Seis mudanças"**, e o
`SarakTabs` virou o item **5**. **Continua sendo UMA entrada**, como a §5.6 exige.

**Arquivos alterados (desta rodada)**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/cards.ts` | alterado | token removido (−13 linhas) |
| `src/core/Design/catalog/theme_table_mapping.json` | alterado | entrada removida (−1) |
| `src/core/Design/catalog/partitions/cards_engine.json` | alterado | objeto removido (−15) |
| `docs/migracoes.md` | alterado | item 4 novo + contagem do cabeçalho |
| 3 arquivos `__snapshots__` | alterado | regravados (a variável deixou de ser emitida) |
| `sarak-dev/*` | alterado | **gerado** — carimbo passa a 409 tokens |

`docs/component-catalog.*` e `sarak-ui/*` foram regerados e **não mudaram**: o catálogo de
componentes publica props, não tokens, e o kit do consumidor publica a contagem a partir do tipo
gerado defasado (achado 22, ainda aberto).

**Verificações executadas**

```
$ npm run audit
  📐 Schema (MASTER_DESIGN_MAP): 409 tokens
  🗄️  Banco de Dados (theme_table_mapping): 409 tokens
  📦 Catálogo JSON (partitions/): 409 tokens em 13 arquivos
✅ SUCESSO ABSOLUTO: Paridade 1:1:1:1:1 garantida! 409 tokens validados nas 3 fontes da verdade
✅ Nenhuma chave órfã encontrada. Todos os Presets/Temas estão em paridade com o Gabarito Dinâmico.
AUDITORIA FINALIZADA COM SUCESSO
exit=0

$ npm run gates:full
[check-package-contents] OK — 81 arquivos no tarball, allowlist respeitada.
 Test Files  275 passed (275)
      Tests  942 passed (942)
exit=0

$ npx tsc --noEmit
10 erros — os mesmos pré-existentes, nenhum novo

$ npm run dev-kit
[dev-kit] sarak-dev/ gerado — 80 componentes públicos, 409 tokens, 9 gates
```

**Critérios do veredito**

- [x] Token removido das **três** fontes e catálogo regenerado — evidência: tabela acima, `grep` → 0
      em cada fonte.
- [x] **Paridade 409/409/409** e `npm run audit` **exit 0** — saída acima.
- [x] Token na entrada única de `docs/migracoes.md` como **4ª quebra**, com o efeito no tipo público
      `SarakDesignTokens` explicitado — `docs/migracoes.md:76-88`.
- [x] `npm run gates:full` **verde, inclusive `package:check`** — exit 0.
- [x] Escopo respeitado: nada além disto foi tocado; ERP não revalidado de novo;
      `npm version major` **não** emitido.

**Decisões e suposições**

1. **Removi junto o comentário de seção `// --- TEMPLATES: SECURITY / MFA (Spec 27) ---`.** Ele
   rotulava um grupo que agora tem zero tokens; deixá-lo seria um cabeçalho sem conteúdo apontando
   para uma feature que não existe mais. É a mesma edição, não item novo.
2. **Os 3 snapshots foram regravados, não ajustados à mão.** A mudança neles é consequência
   mecânica: sem o token, `useDesignVariables` não emite mais a variável.
3. **Nenhum dos 18 temas declarava `mfaQrCodeSize`** (verificado antes da remoção), por isso o
   `auditor_presets` não acusou chave órfã — a remoção não exigiu tocar em preset nenhum.

**Achados fora do escopo (não corrigidos)**

Um da rodada anterior **fechou** — o token órfão era exatamente esta operação 5. Seguem os outros:

- `sarak-ui/VERSION` publica **304** tokens (o real agora é **409**) — achado 22, o gerador do kit lê
  o tipo defasado `design-token-ids.ts` em vez do schema. Esta rodada **alargou a defasagem em 1**.
- `specs/01-gates-e-baseline.md` · `00-contexto.md:312` seguem descrevendo um baseline de auditoria
  que já foi quitado (`run_audit` mede **exit 0**).
- `arquitetura/03-superficie-publica.md` §8 segue listando as três dívidas que esta plan matou — é
  destino de **síntese** do revisor, não do executor.

**Pendências / riscos**

- **Nenhuma pendência de execução.** As 5 operações estão fechadas, `gates:full` verde e a nota de
  migração cobre as 6 mudanças numa entrada só.
- **Falta só o `npm version major`, e ele é do dono** — a plan e o veredito reservam o passo a você.
  O anel de `pre-push` vai cobrar a tag, e o `version` regenera `dist/` + `sarak-ui/` no mesmo
  commit.
- ⚠️ **Ao publicar, o `sarak-ui/VERSION` sairá dizendo 304 tokens** enquanto o real é 409. É o
  achado 22, pré-existente e conhecido — vale saber que o major carrega esse número falso para o
  consumidor.
- Nada commitado.

## Veredito (correção 1) — 2026-08-05 — 🟢 Aprovado

**Operação 5 fechada. A `plan-09` está aprovada.**

| Verificação | Minha medição |
|---|---|
| Paridade | **409 / 409 / 409** — Schema, mapping e catálogo |
| `mfaQrCodeSize` nas 3 fontes | `grep -c` → **0, 0, 0** |
| `npm run audit` | **exit 0 — 100% íntegro**, zero chave órfã |
| `gates:full` | exit 0 · `package:check` **81 arquivos no tarball, allowlist respeitada** |
| Suíte | 275 arquivos / 942 testes |

**Tirar o comentário de seção `// --- TEMPLATES: SECURITY / MFA ---` junto foi o detalhe certo:** ele existia
só para aquele token, e cabeçalho de seção vazio é o começo de uma seção que alguém repovoa por engano.

**A nota de migração está honesta nos dois sentidos.** Registrar **o que NÃO quebra** — tema em JSON puro
ignora a chave a mais em runtime; o erro só aparece para quem tipa com `SarakDesignTokens` — vale mais que a
lista de quebras. É a diferença entre uma nota que assusta e uma que orienta.

---

## Fecho da plan-09

**Cinco operações, quatro quebras de contrato, e a maior medição desta base:**

| | Antes | Depois |
|---|---|---|
| Chunk de boot | 674.011 bytes | **167.684 — −75,1%** |
| Componentes públicos | 81 | 80 |
| Tokens | 410 | 409 |
| Símbolos removidos | — | `SarakSecurityOrchestrator` · `partialMode` · 2 ids do Discovery · `mfaQrCodeSize` |

**As três "dívidas nomeadas" da [[03-superficie-publica]] §8 morreram** — reescrita pelo revisor nesta ação,
com o desfecho de cada uma. E a lição que ficou: **duas das três não eram decisão de design, eram código morto
que ninguém tinha medido.** O `SarakTabs` esperava uma "spec de refatoração dedicada" que nunca precisou
existir.

**Três operações foram acrescentadas por mim DEPOIS da entrega** (a 5, e as duas correções de §3). Isso é
falha de planejamento minha, não de execução: a plan foi liberada com a §3 subdimensionada em dois itens e com
uma previsão errada. O executor mediu e corrigiu as três vezes.

**Destino da síntese:** `arquitetura/03-superficie-publica.md` §8 (**já escrita**) · `docs/migracoes.md` (a
entrada única, com 6 mudanças) · `specs/15-divida-conhecida.md` (achados 2 e 3 saem da §3) ·
`specs/00-regras-e-invariantes.md` (**R32 deixa de ter violação declarada**)

**Liberado: pode commitar.** O `npm version major` é seu — mas leia a recomendação sobre o momento, na mensagem.

---

## Síntese — 2026-08-07

Sintetizada em: `arquitetura/03-superficie-publica.md` (já escrita) · `docs/migracoes.md` (já escrita) ·
`specs/specs/15-divida-conhecida.md` (achados 2 e 3 fechados, movidos para §6) ·
`specs/specs/00-regras-e-invariantes.md` (R32 sem violação declarada, gate nasceu verde).

Observações: os 4 destinos confirmados nesta passada de `/spec-atualizar`. Nenhuma pendência.
