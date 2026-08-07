---
tipo: "plan"
titulo: "Achados de comportamento — o código fazendo coisa diferente do que promete"
dominio: "Sarak-Lib-UI-Core / Comportamento"
status: "⚪ Sintetizada"
prioridade: "Máxima"
tags: ["plan", "bug", "comportamento", "seguranca-de-dados"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[07-responsividade-e-multidispositivo]]", "[[15-divida-conhecida]]"]
depende_de: "plan-06"
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md · specs/07-responsividade-e-multidispositivo.md · specs/04-shell-e-discovery.md"
---

> ⚠️ **O escopo desta plan é PROVISÓRIO até a plan-03** — a triagem decide quais destes seis viram conserto e
> quais são aceitos como característica. O revisor reescreve antes de liberar.

# 1. Objetivo

Os seis comportamentos que contradizem a promessa da lib ou passam a cumpri-la, ou deixam de prometê-la — e
nenhum deles depende de sorte para não causar dano.

# 2. Contexto

Seis defeitos que **nenhum gate vê**. Nenhum é falha de documentação: é **o código fazendo coisa diferente do
que promete**.

**A ordem F1 → F2 não é preferência, é segurança.** O `CustomizationPanel` importa 7 abas e renderiza **uma**;
uma das mortas é a que contém o `localStorage.clear()`. Restaurar a navegação **ativa** a perda de dados.
Decidir na ordem inversa é a única forma de transformar código morto em bug de produção.

# 3. Escopo

## 3.1 Dentro — em ordem obrigatória

**F1 · `localStorage.clear()` — PRIMEIRO, e sozinho** *(achado 8)*
`AdvancedTab.tsx:21` apaga a **origem inteira** do consumidor e recarrega a página, enquanto o `confirm()`
promete "TODAS as configurações visuais". Token de sessão, preferências, carrinho — tudo o que o importador
guardou naquela origem.
**Conserto:** remover **apenas as chaves da lib** (o `storageKey` do Provider) e alinhar o texto do `confirm()`
ao que de fato acontece.
Hoje é **inalcançável**. Foi por isso que adiar foi seguro; é por isso também que **não pode ser adiado outra
vez** sem antes fechar F2.

**F2 · As abas inalcançáveis — decisão do dono, DEPOIS de F1**
7 abas importadas, 1 renderizada (`CustomizationPanel.tsx:3-9` × `:40`). As outras estão no bundle e fora de
alcance. As opções: **restaurar a navegação** (só depois de F1) ou **remover os imports mortos** (menos bundle,
menos superfície).

**F3 · `isGlass` é ramo morto** *(achado 9)* que renderizaria nav nenhuma. Só é inalcançável porque
`validateDesign` descarta o valor — está protegido **por acidente, não por desenho**. Ou o ramo passa a
funcionar, ou sai.

**F4 · `focusRingWidth` ignorado** *(achado 10)* pela regra global de foco. Token que existe, é validado e não
move nada — é um `--sx-*` com outra roupa: **promessa sem emissor**.

**F5 · Token de breakpoint move só 1 dos 3 caminhos** *(achado 11)* de responsividade. Trocar o token não muda
o comportamento nos outros dois, o que quebra a promessa "breakpoints são tokens do tema".

**F6 · `SarakTable` sem opt-out de colapso mobile** *(achado 12)*, enquanto o `SarakDataTable` tem
`responsive={false}`. Inconsistência de API entre dois componentes irmãos.

## 3.2 Fora
- ⛔ **F2 antes de F1.** Restaurar as abas antes de consertar o `clear()` **ativa a perda de dados** — é
  reprovação automática, mesmo que tudo o mais esteja certo.
- ⛔ Mudar a superfície pública (`src/index.ts`) — é a plan-09.
- Itens do baseline de auditoria — plan-07.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` | o contrato do painel (F1/F2) |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | os 3 caminhos de responsividade (F5/F6) |
| Spec fixa | `specs/04-shell-e-discovery.md` | o cromo e a nav (F3) |
| Spec fixa | `specs/15-divida-conhecida.md` §3.1, §3.4 | os achados e o acoplamento que impõe a ordem |
| Skill | `test-unitario` | F1 e F5 exigem teste; ver §7 |

# 5. Instruções de execução

1. **F1 primeiro e sozinho.** Trocar `localStorage.clear()` por remoção das chaves da lib. Escrever o teste que
   prova que **uma chave alheia sobrevive ao reset** — é o critério que define o conserto.
2. Alinhar o texto do `confirm()` ao que o código faz. Prometer mais do que se faz é a origem do defeito.
3. **Só então F2** — apresentar as duas opções ao dono e aplicar a decisão dele.
4. F3: decidir com o dono se `isGlass` volta a funcionar ou sai. **Não deixar protegido por acidente.**
5. F4: ou `focusRingWidth` passa a mover a regra de foco, ou o token sai das 3 fontes. Token sem consumidor é
   promessa sem emissor.
6. F5: fazer o token mover os **três** caminhos, com teste nos três.
7. F6: dar ao `SarakTable` o mesmo opt-out do `SarakDataTable` — a API dos irmãos passa a ser a mesma.
8. **F1 e F6 exigem entrada em `docs/migracoes.md`** — mudam comportamento observável pelo consumidor.
9. Para cada item, declarar **qual gate passaria a pegá-lo** — ou que **nenhum** pega.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-08-achados-comportamento.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/06-painel-de-customizacao-e-preview.md,
specs/specs/07-responsividade-e-multidispositivo.md, specs/specs/15-divida-conhecida.md.
Skills a aplicar: padrao-typescript, test-unitario.

A ORDEM F1 → F2 É OBRIGATÓRIA E É SEGURANÇA: restaurar as abas antes de consertar o
localStorage.clear() ATIVA a perda de dados do consumidor. F2, F3 e F4 têm decisão do
dono — pare e pergunte, não escolha por ele.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] **F1 tem teste que prova que uma chave alheia sobrevive ao reset.** Sem esse teste, F1 não está feito.
- [ ] O texto do `confirm()` descreve exatamente o que o código faz.
- [ ] F2 executado **depois** de F1, com a decisão do dono registrada.
- [ ] F3 e F4 com decisão do dono; nada permanece "protegido por acidente".
- [ ] **F5 com teste nos três caminhos** de responsividade.
- [ ] F6: `SarakTable` e `SarakDataTable` com a mesma API de opt-out.
- [ ] Entrada em `docs/migracoes.md` cobrindo F1 e F6.
- [ ] Cada item declara o gate que passaria a pegá-lo — ou que nenhum pega.
- [ ] Suíte verde; baseline de auditoria inalterado (ou regravado com justificativa).

# 8. Como verificar

- Teste de F1: gravar `chave-alheia` no `localStorage`, disparar o reset, confirmar que **sobreviveu**
- `git log --oneline` → o commit de F1 antecede o de F2
- Teste de F5: trocar o token de breakpoint e verificar os **3** caminhos
- `grep -n "responsive" src/components/**/SarakTable*` → o opt-out existe
- `docs/migracoes.md` → entrada com antes/depois de F1 e F6
- `npx vitest run` → verde

# 9. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md` (F1/F2) ·
`specs/07-responsividade-e-multidispositivo.md` (F5/F6) · `specs/04-shell-e-discovery.md` (F3) ·
`specs/00-regras-e-invariantes.md` se F4 virar regra de "token sem consumidor" ·
`specs/15-divida-conhecida.md` (as linhas fechadas saem)

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-04

**Resultado:** Concluído com pendências *(F2 e F3 aguardam decisão do dono; a plan segue
`🟡 Em execução` porque não foi entregue — os dois itens são executados nesta mesma conversa
assim que a decisão chegar)*

**O que foi feito**

- **F1 · `localStorage.clear()` — feito, primeiro e sozinho.**
  - `src/core/Provider/constants.ts:3-4` — nasce `LANGUAGE_STORAGE_KEY = 'sarak_lang'`, porque a
    chave estava escrita à mão em `Controls.tsx` e o reset precisava de uma fonte única.
  - `src/core/Provider/utils/storage.ts` (novo) — `clearSarakStorage(storageKey?)` remove **só** as
    chaves da lib (as fixas + a `persistence.storageKey` do Provider) e devolve as que existiam.
  - `src/features/DesignEngine/Panels/AdvancedTab.tsx:26-42` — o `handleHardReset` chama
    `clearSarakStorage(sarak.options?.persistence?.storageKey)` no lugar de `localStorage.clear()`.
  - `AdvancedTab.tsx:33-36` — texto do `confirm()` reescrito: nomeia o que apaga (tema e idioma) e
    declara que nada mais do site é afetado. O "TODAS as configurações visuais" saiu.
  - `AdvancedTab.tsx:106` — o subtítulo do cartão dizia "Limpar cache local", que prometia mais do
    que o código faz; passou a descrever o escopo real.
  - `AdvancedTab.tsx:20-21` — o `1000` do `setTimeout` virou `RESET_DELAY_MS` (zero hardcoded).
  - `src/components/atomic/Inputs/Controls.tsx:27,31` — passa a ler a constante em vez do literal.

- **F4 · `focusRingWidth` — feito.** `src/styles/_utilities.css:58` — a regra global de foco passou
  de `outline: 2px solid …` para `outline: var(--sarak-focus-width, 2px) solid …`. O token deixa de
  ser promessa sem emissor e passa a mover o anel de botão junto com o de link (`SarakLink.tsx:72`,
  que já o honrava). Verificado que era a única largura de foco chumbada em `src/`.

- **F5 · Token de breakpoint — feito na metade que a triagem (plan-03) deixou em pé.**
  - `src/core/Provider/DeviceProvider.tsx:4-27` — `DeviceBreakpoints`,
    `DEFAULT_DEVICE_BREAKPOINTS` e `deviceForWidth(width, breakpoints?)` (2º parâmetro **opcional**:
    aditivo, o comportamento sem ele é idêntico).
  - `DeviceProvider.tsx:41-52,78-92` — novo `DeviceBreakpointsContext` (default = os canônicos) e a
    prop `breakpoints` no `DeviceProvider`; `useSarakDevice` detecta e reage ao `resize` com os
    limiares em vigor.
  - `src/core/Provider/SarakUIProvider.tsx:180-190` — memoiza `breakpointTablet`/`breakpointDesktop`
    do tema ativo e os desce ao `DeviceProvider`, com a mesma leitura que `useDesignVariables.ts:58`
    já fazia. **Por que contexto e não `useSarakUI` dentro do hook:** `SarakUIProvider` importa
    `DeviceProvider`, então ler o Provider de dentro do hook fecharia um ciclo de import; e o default
    canônico garante que, se o contexto não atravessar uma fronteira de bundle, o pior caso é o
    comportamento que já existia hoje — nunca algo pior.

- **F6 · `SarakTable` — feito.** `src/components/atomic/Templates/SarakTable.tsx:32-37,44,46,116` —
  prop `responsive?: boolean` com default `true`, `collapseToCards = responsive && device ===
  'smartphone'`. Mesma prop, mesmo default e mesmo efeito do `SarakDataTableImpl.tsx:41-42,71`.

- **Artefatos gerados** — `npm run catalog` e `npm run guide` regerados (não editados à mão): o
  diff dos dois é exclusivamente a superfície nova de F5/F6.

- **`docs/migracoes.md:7-45`** — duas entradas novas (F1 e F6), com antes/depois e "como migrar".

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/utils/storage.ts` | criado | `clearSarakStorage` — remove só as chaves da lib |
| `src/core/Provider/utils/__tests__/storage.test.ts` | criado | 4 testes; o 1º é o critério da chave alheia |
| `src/styles/__tests__/focusRing.test.ts` | criado | 3 testes: o token alcança a regra global de foco |
| `src/core/Provider/constants.ts` | alterado | `LANGUAGE_STORAGE_KEY` |
| `src/features/DesignEngine/Panels/AdvancedTab.tsx` | alterado | reset por chave + textos alinhados + `RESET_DELAY_MS` |
| `src/features/DesignEngine/Panels/__tests__/AdvancedTab.test.tsx` | alterado | +3 testes de comportamento do reset |
| `src/features/DesignEngine/Panels/__tests__/__snapshots__/AdvancedTab.test.tsx.snap` | alterado | regravado (mudança de texto intencional) |
| `src/components/atomic/Inputs/Controls.tsx` | alterado | usa `LANGUAGE_STORAGE_KEY` |
| `src/styles/_utilities.css` | alterado | anel de foco lê `--sarak-focus-width` |
| `src/core/Provider/DeviceProvider.tsx` | alterado | limiares por contexto + `deviceForWidth` parametrizado |
| `src/core/Provider/SarakUIProvider.tsx` | alterado | desce os tokens de breakpoint ao `DeviceProvider` |
| `src/core/Provider/__tests__/DeviceProvider.test.tsx` | alterado | +4 testes dos limiares vindos do tema |
| `src/core/Provider/__tests__/SarakUIProvider.test.tsx` | alterado | mock de `DeviceProvider` virou parcial (`importOriginal`) |
| `src/core/Design/hooks/__tests__/useDesignVariables.test.ts` | alterado | +2 testes do caminho media-query |
| `src/components/atomic/Templates/SarakTable.tsx` | alterado | prop `responsive` |
| `src/components/atomic/Templates/__tests__/SarakTable.responsive.test.tsx` | alterado | +3 testes do opt-out |
| `docs/component-catalog.json` · `.md` | alterado | **gerado** por `npm run catalog` |
| `sarak-ui/catalog.json` · `VERSION` · `GUIA-FRONTEND.md` · `START-HERE.md` | alterado | **gerado** por `npm run guide` |
| `docs/migracoes.md` | alterado | entradas de F1 e F6 |

**Verificações executadas**

- `npx vitest run` (suíte COMPLETA) → **281 arquivos, 947 testes, 0 falhas**. Antes desta execução a
  suíte tinha 928 testes; os 19 novos são de F1 (7), F4 (3), F5 (6) e F6 (3).
- `npx tsc --noEmit` → **10 erros**, todos pré-existentes e em arquivos que não toquei
  (`BarrelParity.test.ts`, `ZeroBrand.test.ts`, `Spec21.spec.tsx`,
  `shippedThemesConsoleClean.test.ts`). **Nenhum erro novo.**
- `npm run audit` (8 auditores) → **exit 0, todos OK**; paridade **410/410/410**, presets sem chave
  órfã. Rodado antes e depois das edições: mesmo resultado.
- `npm run barrel:check` → OK, 81 componentes, 0 faltas.
- `npm run catalog:check` → acusou defasagem; `npm run catalog` regerado; **OK**.
- `npm run guide:check` → acusou defasagem; `npm run guide` regerado; **OK**.
- `npm run zero-brand:check` → OK, 362 arquivos, zero marca.
- `npm run dev-kit:check` → **FALHA, pré-existente e não minha** — ver *Achados fora do escopo*.

**Critérios de aceite**

- [x] **F1 tem teste que prova que uma chave alheia sobrevive ao reset** — evidência:
      `src/core/Provider/utils/__tests__/storage.test.ts:8` (unitário) e
      `src/features/DesignEngine/Panels/__tests__/AdvancedTab.test.tsx:53` (pelo clique no botão,
      provando que a aba está de fato ligada ao conserto).
- [x] O texto do `confirm()` descreve exatamente o que o código faz — evidência:
      `AdvancedTab.tsx:33-36` + o teste `AdvancedTab.test.tsx:76` que reprova se o texto voltar a
      prometer "TODAS".
- [ ] **F2 executado depois de F1, com a decisão do dono registrada** — F1 está fechado; F2 aguarda
      a decisão (relatório entregue ao usuário). A ordem obrigatória foi respeitada: nada do painel
      foi restaurado antes de o `clear()` sair.
- [ ] **F3 e F4 com decisão do dono** — F4 fechado (a triagem da plan-03 já havia decidido: a spec
      15 §3.4 fixa `outline: var(--sarak-focus-width, 2px) solid …` como destino, então não havia o
      que perguntar). **F3 aguarda decisão.**
- [x] **F5 com teste nos caminhos de responsividade** — com a ressalva de escopo abaixo:
      caminho CSS (`useDesignVariables.test.ts:23-32`), caminho JS
      (`DeviceProvider.test.tsx:79-104`). O 3º caminho (classes `@min-[768px]`) **não é executável**
      — ver *Decisões e suposições*.
- [x] F6: `SarakTable` e `SarakDataTable` com a mesma API de opt-out — evidência:
      `SarakTable.tsx:37` × `SarakDataTableImpl.tsx:42`, e o teste
      `SarakTable.responsive.test.tsx:57`, gêmeo do `SarakDataTableImpl.test.tsx:99`.
- [x] Entrada em `docs/migracoes.md` cobrindo F1 e F6 — `docs/migracoes.md:7-45`.
- [x] Cada item declara o gate que passaria a pegá-lo — tabela abaixo.
- [x] Suíte verde; auditoria inalterada (exit 0 antes e depois, sem regravar baseline).

**Qual gate pegaria cada item (§5.9)**

| Item | Gate que pegaria hoje | Rede que ficou no lugar |
|---|---|---|
| F1 | **Nenhum.** Nenhum dos 8 auditores olha para `localStorage`. O gate seria um auditor que proíbe `localStorage.clear()`/`sessionStorage.clear()` em `src/` — a regra candidata que a spec 15 §3.1 já nomeia (*a lib não apaga dado do host*) | 7 testes de suíte |
| F4 | **Nenhum.** O `auditor_hardcoded` só varre `.tsx`; este defeito era `.css`. O gate seria estendê-lo a `src/styles/**/*.css` — vizinho da ampliação que a spec 15 §4.2 já prevê para o `auditor_ghostvars` | `src/styles/__tests__/focusRing.test.ts` |
| F5 | **Nenhum.** O gate seria proibir import de `BREAKPOINT_*` fora de `breakpoints.ts` e dos geradores, forçando todo consumidor a passar pelo token | 6 testes nos dois caminhos executáveis |
| F6 | **Nenhum.** `catalog:check`/`guide:check` publicam as props dos dois componentes, mas **não comparam irmãos** — divergência de API entre componentes públicos não é cobrada por nada | 3 testes de opt-out |

**Decisões e suposições**

1. **O escopo escrito nesta plan diverge da triagem aprovada (plan-03), e eu segui a plan.** A plan
   ainda traz o aviso *"escopo PROVISÓRIO até a plan-03"* e lista 6 itens (F1–F6). A `plan-03:240`,
   já `🟢 Aprovada`, fixou o escopo real da plan-08 em **8, 9, 10, 11 (só o `DeviceProvider`), 12,
   17, 24, 25 + as metades de código de 13, 22 e 29**. Executei **só o que está escrito nesta plan**
   (achados 8, 9, 10, 11, 12), porque sair do escopo declarado é proibido. **Ficaram de fora, e
   pertencem à plan-08 segundo a triagem:** achado 17 (`playwright.config.ts:7`), achado 24
   (`mainTsx.mjs:36-40`), achado 25 (`context.mjs:7-10`) e as metades de código de 13 (testes para
   `useSarakRouter`/`useModuleDiscovery`), 22 (regenerar `design-token-ids.ts`) e 29 (texto `§5.1`).
   **Decisão do revisor:** reescrever a plan e mandar uma rodada de correção, ou tratá-los em plan
   nova.
2. **F5 — "os três caminhos" não é executável, e a triagem já dizia isso.** A plan §5.6 pede o token
   movendo os 3 caminhos. A spec 15 §3.4 (achado 11) e o `00-contexto` §8 registram o contrário: as
   classes `@min-[768px]` de `useStructuralStyles*` são resolvidas em **build-time** pelo Tailwind e
   **não aceitam `var()`** — essa metade foi **aceita como característica**, com o motivo escrito, e
   o `00-contexto` §8 diz explicitamente *"não proponha conserto para isto"*. Segui a triagem (mais
   recente e aprovada) e fiz a metade do `DeviceProvider`, exatamente como a `plan-03:240` recorta.
   Os dois caminhos que **são** governáveis por token agora têm teste.
3. **F4 não foi ao HITL.** A plan §5.5 oferece "ou move, ou o token sai das 3 fontes", mas a triagem
   já escolheu: spec 15 §3.4, achado 10, destino *"Corrigir — `outline: var(--sarak-focus-width,
   2px) solid …`"*. Perguntar de novo o que o dono já decidiu custaria uma rodada por nada.
4. **A superfície pública ganhou 2 nomes, sem eu tocar em `src/index.ts`.** `src/index.ts:25` faz
   `export * from './core/Provider/DeviceProvider'`, então `DeviceBreakpoints` e
   `DEFAULT_DEVICE_BREAKPOINTS` saíram publicados junto com F5 (253 → 255 nomes no barril). É
   **aditivo** — nenhum símbolo saiu, nenhum tipo mudou — logo **`minor`**, e não colide com a
   plan-09, que trata das quebras. O tipo precisa ser público porque tipa uma prop pública; o
   default é a documentação executável do fallback. Se o revisor preferir superfície mínima,
   `DEFAULT_DEVICE_BREAKPOINTS` pode virar interno numa correção de 1 linha.
5. **`sarak-dev/` foi deliberadamente NÃO regenerado** — ver o achado 2 abaixo.
6. **`AdvancedTab` é código inalcançável hoje** (é a aba que o `CustomizationPanel` não monta). O
   conserto e os testes valem mesmo assim: é exatamente essa a razão de F1 vir antes de F2.

**Achados fora do escopo (não corrigidos)**

1. `sarak-dev/state.json:224,228,250` — o carimbo de estado do kit do mantenedor está **defasado**:
   publica `auditor_hardcoded=1`, `auditor_ghostvars=2` e `tsc=14 erros`, enquanto a medição real
   hoje é **0, 0 e 10**. É resíduo da `plan-07` (quitou o baseline e não re-rodou `npm run dev-kit`).
   Rodei o gerador para **medir** o diff, confirmei que **100% dele é resíduo da plan-07 e nada meu**,
   e **revertí** (`git checkout -- sarak-dev/`) para não misturar trabalho de outra plan no meu diff.
   Consequência: **`npm run dev-kit:check` está vermelho no HEAD e continua vermelho** — não é
   regressão desta execução. Sugestão: rodar `npm run dev-kit` numa plan de fechamento da plan-07.
2. `specs/01-gates-e-baseline.md` / `00-contexto.md:312` — os dois ainda dizem que o `run_audit`
   *"fecha em exit 1 no HEAD limpo (2 regras estruturais em vermelho)"*. Medido nesta execução:
   **`npm run audit` sai 0, com os 8 auditores OK**. A `plan-07` quitou o baseline e a spec não
   acompanhou. Sugestão: síntese/plan nova — não toquei porque spec é do revisor.
3. `src/core/Provider/generated/design-token-ids.ts` — segue publicando **304** tokens contra **410**
   reais (achado 22). O `sarak-ui/VERSION` que **regerei** carrega esse número falso
   (`designTokens=304`): o gerador do kit lê o tipo defasado, não o schema. Não corrigi porque a
   metade de código do 22 não está no escopo **escrito** desta plan (embora esteja no da triagem —
   ver *Decisões* 1).

**Pendências / riscos**

- **F2 e F3 aguardam decisão do dono.** O relatório com contexto, opções e recomendação foi entregue
  ao usuário na conversa. Nada do painel foi restaurado — a ordem F1 → F2 está preservada.
- **Risco baixo, mas real, em F5:** se o build fragmentar `DeviceProvider.tsx` entre chunks, o
  `DeviceBreakpointsContext` pode não atravessar e o hook cai no default canônico (768/1024) — que é
  **exatamente o comportamento de hoje**. Degradação para o estado atual, nunca para pior.
- **Um `stash` meu ficou pendurado.** Para medir se `guide:check`/`dev-kit:check` já estavam
  vermelhos no HEAD limpo, usei `git stash push`/`pop`; o `pop` aplicou (verifiquei que
  `git diff stash@{0}` contra o worktree é **vazio**), mas a entrada `stash@{0} "plan08-wip"`
  sobreviveu e o `git stash drop` foi barrado pelo harness. **Nenhum trabalho foi perdido** — a
  entrada é cópia idêntica do worktree e pode ser descartada pelo usuário com
  `git stash drop stash@{0}`. (`stash@{1}` é anterior a esta execução e **não** é meu.)
- Nada commitado.

---

## Resumo da execução (continuação — F2 e F3) — 2026-08-04

**Resultado:** Concluído

O dono decidiu na mesma conversa: **F2 → opção B** (remover os imports mortos) e
**F3 → opção A** (remover o ramo `isGlass`). Este bloco cobre só esses dois itens; o resto da
execução está no bloco anterior, intacto.

**O que foi feito**

- **F2 · As 7 abas — imports mortos removidos.**
  `src/features/DesignEngine/Library/CustomizationPanel.tsx:1-11` — saíram os 6 imports de abas
  nunca renderizadas (`LayoutTab`, `LanguageTab`, `ShortcutsTab`, `AdvancedTab`,
  `EngineCustomizationTab`, `HyperGranularityTab`), mais o que só existia para servi-los: o import
  de 7 ícones do `lucide-react`, o `useState` não usado e o `type TabId` (5 valores, zero
  consumidor). Ficou o único import que o JSX usa: `ThemeCustomizationTab`. O arquivo caiu de
  **49 para 35 linhas**.
  **Os componentes NÃO foram apagados** — seguem em `../Panels/` com os seus testes. Foi verificado
  antes que o `CustomizationPanel` era a **única** referência de produção às seis abas (as demais são
  os próprios testes), então a remoção não deixa chamador órfão. O JSDoc do componente registra o
  porquê e que restaurar a navegação continua possível.
  **F1 estava fechado antes desta edição** — a ordem obrigatória da §3.2 foi cumprida.

- **F3 · `isGlass` — ramo morto removido.**
  `src/core/Shell/SarakShell.tsx:78-83` — saiu `const isGlass = design?.navigationStyle === 'glass'`
  e o `&& !isGlass` da derivação de `isSidebar`, que agora é
  `navigationStyle === 'sidebar' || (!isTopbar && !isDock)`. Comentário no lugar explicando que a
  sidebar é o fallback de qualquer valor fora de topbar/dock, que é o que impede a tela de ficar sem
  navegação. **Zero mudança de comportamento:** `'glass'` nunca foi opção do schema
  (`Design/schema/global.ts:24-33`), então `isGlass` era sempre `false`.

**Arquivos alterados (deste bloco)**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Library/CustomizationPanel.tsx` | alterado | 6 imports de aba + ícones + `useState` + `TabId` removidos (49 → 35 linhas) |
| `src/core/Shell/SarakShell.tsx` | alterado | `isGlass` removido; `isSidebar` simplificado |
| `src/core/Shell/__tests__/SarakShell.test.tsx` | alterado | +3 testes de paridade `navigationStyle` shell ↔ schema |

**Verificações executadas (após F2 e F3)**

- `npx vitest run` (suíte COMPLETA) → **281 arquivos, 950 testes, 0 falhas** (947 → 950: os 3 de F3).
- `npm run audit` → **exit 0**, 8 auditores OK, paridade 410/410/410.
- `npx tsc --noEmit` → **10 erros**, os mesmos pré-existentes. Nenhum novo.
- `npm run barrel:check` · `catalog:check` · `guide:check` · `zero-brand:check` → **todos OK**
  (F2/F3 não mexem em prop pública, então os artefatos gerados não se moveram outra vez).
- `npm run dev-kit:check` → segue vermelho **pelo motivo pré-existente já declarado**.

**Critérios de aceite (os que estavam abertos)**

- [x] **F2 executado depois de F1, com a decisão do dono registrada** — decisão: **opção B**,
      2026-08-04. Evidência: `CustomizationPanel.tsx:1-11`. F1 já estava fechado quando esta edição
      começou.
- [x] **F3 com decisão do dono; nada permanece "protegido por acidente"** — decisão: **opção A**,
      2026-08-04. Evidência: `SarakShell.tsx:78-83` e os 3 testes em
      `SarakShell.test.tsx:70-101`, que reprovam se alguém voltar a comparar `navigationStyle` com
      valor fora do schema **ou** quebrar o fallback para sidebar.

**Qual gate pegaria cada item (§5.9)**

| Item | Gate que pegaria hoje | Rede que ficou no lugar |
|---|---|---|
| F2 | **Nenhum.** Import usado só como import — sem JSX correspondente — não é cobrado por auditor nenhum; o `auditor_cleancode` não olha para alcance de símbolo. Um gate seria "todo componente importado num `.tsx` aparece no JSX do arquivo" | nenhuma automatizada: o alcance foi verificado à mão (`grep` por cada aba) |
| F3 | **Nenhum.** Nada cruza os literais comparados no código com as `options` do schema | `SarakShell.test.tsx:70-101` — paridade nos dois sentidos, vale para qualquer valor futuro, não só `'glass'` |

**Decisões e suposições**

1. **F2 removeu os imports, não os arquivos.** A opção B foi enunciada como *"remover os imports
   mortos (menos bundle, menos superfície)"* — apagar os 6 componentes é uma decisão maior e não
   estava na opção. Efeito prático já obtido: eles saem do grafo de módulos do painel e param de
   pesar no bundle. **Consequência declarada:** os 6 arquivos ficam sem consumidor de produção
   (só testes). Se o revisor quiser a deleção também, é plan nova — e aí `AdvancedTab.tsx` sairia
   junto com o conserto de F1, o que só faz sentido se ninguém for restaurar a navegação.
2. **`AdvancedTab` continua consertado e testado mesmo tendo perdido o import.** Reverter F1 porque
   a aba ficou mais distante seria trocar código correto por código perigoso: se alguém restaurar a
   navegação um dia, o `localStorage.clear()` voltaria com ela.

**Achados fora do escopo (não corrigidos)**

- Os três do bloco anterior seguem valendo, sem mudança:
  `sarak-dev/state.json` defasado (resíduo da plan-07) · `specs/01`/`00-contexto §8` descrevendo um
  baseline de auditoria que a plan-07 já quitou · `design-token-ids.ts` publicando 304 de 410.

**Pendências / riscos**

- **Nenhuma pendência de execução: os 6 itens da §3.1 estão fechados.**
- Segue de pé a divergência de escopo entre esta plan e a triagem da `plan-03:240` (achados 17, 24,
  25 e as metades de código de 13, 22 e 29) — **decisão do revisor**, detalhada no bloco anterior.
- O `stash@{0} "plan08-wip"` segue pendurado (cópia idêntica do worktree, verificada); o
  `git stash drop` foi barrado pelo harness. Descarte com `git stash drop stash@{0}`.
- Nada commitado.

---

## Resumo da execução (correção 1) — 2026-08-04

**Resultado:** Concluído

Veredito de 2026-08-04: os 6 itens aprovados, **1 bloqueio** — `dev-kit:check` vermelho contra
baseline verde. Escopo desta rodada: **exclusivamente** esse achado.

**Achado 1 — `dev-kit:check` vermelho (regressão contra baseline)**

**Resolvido.** `npm run dev-kit` rodado; os três arquivos foram **regerados, não editados**.

O que o gerador mudou — os números que a `plan-07` fez cair e o carimbo nunca acompanhou:

| Arquivo | Campo | Antes | Depois |
|---|---|---|---|
| `sarak-dev/state.json:224` | `auditor_hardcoded.valor` | 1 | **0** |
| `sarak-dev/state.json:228` | `auditor_ghostvars.consumos` | 2 | **0** |
| `sarak-dev/state.json:250` | `tsc.erros` | 14 | **10** |
| `sarak-dev/GUIA-MANUTENCAO.md:342,344,352` | mesmos 3 números na tabela de tolerância | 1 · 2 · 14 | **0 · 0 · 10** |
| `sarak-dev/START-HERE.md:80` | `carimbo do estado` | `faa6a95ff9ed` | **`e7ff3c15b1c0`** |

Evidência de que resolveu:

```
$ npm run dev-kit
[dev-kit] sarak-dev/ gerado — 81 componentes públicos, 410 tokens, 9 gates (devKitHash e7ff3c15b1c0).

$ npm run dev-kit:check
[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos).
exit=0
```

**O gerador NÃO acusou ponteiro morto** — a instrução de parar e relatar não foi acionada. O achado
29 (`buildDevState.mjs:63` citando um `§5.1` inexistente) **não foi tocado** e segue aberto para a
plan-12: o `dev-kit:check` de hoje valida caminho, `npm run` e `node`, mas ainda **não** valida
ponteiro de seção `§N.N` — é exatamente a metade de gate registrada em
[[15-divida-conhecida]] §4.2. O "0 ponteiros mortos" acima é verdadeiro **dentro do escopo que o
gate mede hoje**, e não é prova de que o `§5.1` foi resolvido.

**Arquivos alterados (desta rodada)**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `sarak-dev/state.json` | alterado | **gerado** — 3 métricas realinhadas à medição real |
| `sarak-dev/GUIA-MANUTENCAO.md` | alterado | **gerado** — os mesmos 3 números na tabela de tolerância |
| `sarak-dev/START-HERE.md` | alterado | **gerado** — carimbo do estado |

Nenhum arquivo de código foi tocado nesta rodada: os 6 itens aprovados continuam como o revisor os
verificou.

**Verificações executadas**

```
$ npm run audit
[OK] Nenhum hardcoded detectado!
[OK] Nenhuma variável-fantasma consumida.
[OK] Nenhuma tipagem 'any' detectada!
[OK] Todos os componentes possuem testes!
[OK] Nenhuma quebra de hierarquia encontrada!
[OK] Nenhum crime de Clean Code detectado!
✅ SUCESSO ABSOLUTO: Paridade 1:1:1:1:1 garantida! 410 tokens validados nas 3 fontes da verdade
AUDITORIA FINALIZADA COM SUCESSO: O Módulo Sarak UI Core está 100% íntegro.
exit=0

$ npm run dev-kit:check
[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos).
exit=0

$ npx vitest run
 Test Files  281 passed (281)
      Tests  950 passed (950)
   Duration  190.56s
```

**Divergência registrada (não é discordância do veredito)**

O veredito está certo e a correção foi feita. Registro só a causa, porque ela vale para a próxima
rodada: **eu havia regerado estes três arquivos na execução original e os revertí de propósito** —
o diff era 100% resíduo da `plan-07`, e o §3 desta plan não o inclui. Declarei a reversão no bloco
anterior (*Achados fora do escopo*, item 1) e apontei o `dev-kit:check` vermelho como
pré-existente. **A leitura errada foi minha:** "pré-existente" não é licença para entregar um gate
vermelho — o baseline dele é verde, e regressão contra baseline reprova independentemente de quem
a causou. O critério que passo a aplicar: **gate cujo baseline é verde precisa sair verde**, e o
conserto entra na rodada mesmo quando a causa é de outra plan; o que não se faz é aproveitar a
carona para consertar outra coisa.

**Achados fora do escopo (não corrigidos)**

Os três do bloco original seguem valendo; um deles **encolheu**:

- ~~`sarak-dev/state.json` defasado~~ → **fechado nesta rodada**.
- `specs/01-gates-e-baseline.md` · `00-contexto.md:312` — ainda dizem que o `run_audit` *"fecha em
  exit 1 no HEAD limpo (2 regras estruturais em vermelho)"*. Medido de novo agora: **exit 0, 8
  auditores OK**. Spec é do revisor; não toquei.
- `src/core/Provider/generated/design-token-ids.ts` — segue publicando **304** tokens contra **410**
  reais (achado 22).

**Pendências / riscos**

- Nenhuma. Os 6 itens da §3.1 e o achado do veredito estão fechados; auditoria em exit 0,
  `dev-kit:check` verde, suíte completa verde.
- Segue de pé, para o revisor: a divergência de escopo com a `plan-03:240` (achados 17, 24, 25 e as
  metades de código de 13, 22 e 29).
- O `stash@{0} "plan08-wip"` continua pendurado — cópia idêntica do worktree, `git stash drop`
  barrado pelo harness. Descarte com `git stash drop stash@{0}`.
- Nada commitado.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-04 — 🔴 Reprovado (1 bloqueio, e ele é do revisor)

**Os 6 itens estão certos. Reprovo por um gate vermelho que eu deixei passar na plan-07.**

### O bloqueio

**`dev-kit:check` está VERMELHO**, e o baseline dele é **verde** — logo, é regressão contra o baseline, não
dívida tolerada. Três artefatos defasados: `sarak-dev/state.json`, `GUIA-MANUTENCAO.md`, `START-HERE.md`.

**A causa é a plan-07** — ela levou a paridade de 409 para 410 e rodou `npm run build`, que regenera
`docs/` e `sarak-ui/` mas **não** o `sarak-dev/` (o dev-kit não está na cadeia do `build`; está no
`gates:full`). **E eu aprovei a plan-07 sem rodar `dev-kit:check`** — rodei `audit`, `audit:baseline` e a
suíte. Décima vez nesta campanha que verifico o lado que olhei e não o lado que mudou junto.

Chamar de "pré-existente e declarado" foi correto quanto ao fato e insuficiente quanto ao efeito: gate vermelho
contra baseline verde **não sai por declaração**. Correção: `npm run dev-kit`.

### Verificado, e passa

| | Medido por mim |
|---|---|
| `npm run audit` | **exit 0 — 100% íntegro**, paridade 410/410/410 |
| `barrel` · `catalog` · `guide` · `zero-brand` | verdes |
| Escopo | 27 arquivos; `src/` coerente com os 6 itens |
| `CustomizationPanel` | 49 → 35 linhas; os componentes **não** foram apagados, seguem em `../Panels/` com testes |
| `SarakShell` | `isGlass` fora; `isSidebar` com fallback explícito |

**Os 3 testes novos do `SarakShell` são o melhor da entrega.** Cruzar os literais comparados no shell com as
`options` do schema reprova **qualquer** ramo inalcançável futuro, não só o `glass`. É teste que cobre a
**classe** do defeito, e não o exemplar — o oposto do que a caracterização costuma produzir.

### Decisão 1 — os "11 vs 6" não são divergência, são roteamento

Conferi os 5 que ficaram de fora. Quatro têm dono; **um é órfão de verdade**:

| Item | Onde está |
|---|---|
| Achados **24 e 25** | ✅ **feitos na `plan-07`** (item 8 — higiene do scaffold) |
| Achado **13**, metade de código | ✅ **feita na `plan-07`** (item 7 — os 4 testes) |
| Achado **17** (`testDir` do Playwright) | **`plan-11`** — a triagem já o roteou para lá |
| Achado **22**, metade de código | **`plan-12`** (vão nº 1) |
| Achado **29**, metade de código | 🔴 **ÓRFÃO** — `scripts/dev-kit/buildDevState.mjs:63` ainda diz *"regenere com o script do §5.1 do guia"*, e o `GUIA-MANUTENCAO.md` não tem §5.1 |

**Destino do 29: `plan-12`, com as duas metades juntas.** A metade de gate (ensinar `§N.N` ao `dev-kit:check`)
já está lá; consertar só o texto agora o deixaria apodrecer de novo — e é literalmente o vão nº 7.

### Decisão 2 — a superfície +2 fica, e **muda o nível do release**

Confirmei: `src/index.ts:25` faz `export * from './core/Provider/DeviceProvider'`, e `DeviceBreakpoints` e
`DEFAULT_DEVICE_BREAKPOINTS` são exportados de lá (`:7`, `:13`). **Eles alcançam o contrato público.**

**Aceito** — expor os breakpoints default é coerente com o item que os tornou configuráveis; esconder metade
da configuração seria pior. Mas há consequência, e ela corrige o que eu disse antes:

> **O próximo release é `minor` (1.3.0), não `patch`.** Símbolo novo na superfície pública = aditivo = minor
> (ADR-008 §2.2). Eu havia dito `npm version patch` quando o único delta era documentação do kit; **não vale
> mais**.

### Decisão 3 — o stash

**Não descarte antes do commit.** Depois de commitado, `git stash drop stash@{0}`. O `stash@{1}` não é seu —
não toque.

### Prompt de correção

```
Leia specs/00-prompt-executor.md e corrija a execução de specs/plan/plan-08-achados-comportamento.md.

Veredito de 2026-08-04: os 6 itens estão APROVADOS. Um bloqueio, e a causa é da plan-07:

1. `dev-kit:check` está VERMELHO e o baseline dele é VERDE — regressão contra baseline.
   `sarak-dev/state.json`, `GUIA-MANUTENCAO.md` e `START-HERE.md` estão defasados desde que a
   paridade foi de 409 para 410. Rode `npm run dev-kit` e confirme `dev-kit:check` verde.

   NÃO edite os três à mão: são gerados. Se o gerador acusar ponteiro morto, PARE e relate —
   pode ser o achado 29 (`buildDevState.mjs:63` cita um `§5.1` que não existe), que é da plan-12.

Escopo: EXCLUSIVAMENTE isso. Nenhum item novo, nenhum conserto.
Rode depois: `npm run audit` (exit 0), `dev-kit:check` (verde) e `npx vitest run`. Cole as saídas.

Acrescente "## Resumo da execução (correção 1) — AAAA-MM-DD" ao final. Status: "🟠 Em revisão".
Não commite. Devolva para revisão.
```

## Veredito (correção 1) — 2026-08-04 — 🟢 Aprovado

**Bloqueio fechado. A `plan-08` está aprovada.**

| Verificação | Minha medição |
|---|---|
| Escopo desta rodada | **exatamente 3 arquivos** — os `sarak-dev/` gerados. Zero `src/`, `bin/`, `gates/`, `scripts/` |
| `dev-kit:check` | ✅ kit em dia (3 arquivos, 0 ponteiros mortos) |
| `state.json` | `valor: 0` · `consumos: 0` · `erros: 10` — o carimbo alcançou a realidade |
| `npm run audit` | **exit 0 — 100% íntegro**, 410/410/410 |
| `barrel` · `catalog` · `zero-brand` · `guide` · `audit:baseline` | verdes |
| **`npx vitest run`** | **281 arquivos / 950 testes**, exit 0 — rodada por mim, capturando a saída inteira |

**A ressalva sobre o `0 ponteiros mortos` é precisa e importa.** Ele é verdadeiro **dentro do que o gate mede
hoje** — caminho, `npm run`, `node`. O `§5.1` do `buildDevState.mjs:63` continua invisível porque validar
ponteiro de **seção** é a metade de gate do achado 29. Declarar isso em vez de deixar o verde falar por si é a
diferença entre um gate que **informa** e um que **tranquiliza**.

### A sua leitura da causa virou regra permanente

> *"'Pré-existente' não é licença para entregar gate vermelho quando o baseline dele é verde. Gate de baseline
> verde sai verde, mesmo que a causa seja de outra plan; o que não se faz é aproveitar a carona para consertar
> outra coisa."*

Isso resolve uma tensão que a base tinha e não sabia nomear: **"não deixar vermelho"** e **"não fazer scope
creep"** parecem opostos e não são — **a fronteira é o gate, não o defeito**. Virou a **§3.7 do
[[00-prompt-executor]]**, com a origem creditada.

### Resíduos corrigidos por mim nesta ação

O `00-contexto` descrevia um mundo que a `plan-07` já tinha mudado:

- **`run_audit` "NÃO está em zero"** (§2 e §4.1) — falso desde 2026-08-03. Reescrito com o que mudou de fato:
  **fecha em zero, e o regime mudou** — as 8 métricas em 0 significam **sem folga**, qualquer regressão bloqueia
  no Anel 2. E a ressalva que evita a leitura errada: **o `tsc` não é zero** (10 erros, todos em teste) e não é
  gate.
- **§8** — o bullet do "exit 1 com 2 auditores vermelhos" virou o registro do estado atual.
- **Os `409` de §1, §2 e §3** → **410**. A `plan-07` criou um token e a porta de entrada seguia publicando o
  número velho.

---

## Fecho da plan-08

**Seis itens de comportamento corrigidos**, e o melhor da entrega não foi nenhum deles: foram os **3 testes do
`SarakShell`** que cruzam os literais comparados com as `options` do schema. Eles reprovam **qualquer** ramo
inalcançável futuro, não só o `glass` — teste que cobre a **classe** do defeito, não o exemplar.

**Decisões registradas:** o achado **29 é órfão → `plan-12`** com as duas metades · a superfície pública ganhou
**+2 símbolos** (`DeviceBreakpoints`, `DEFAULT_DEVICE_BREAKPOINTS`), aditivos, então **o próximo release é
`minor` — 1.3.0, não 1.2.1**.

**Destino da síntese:** `specs/06` · `specs/07` · `specs/04` (comportamento) · `00-contexto` (**já escrito**)

**Liberado: pode commitar.**

---

## Síntese — 2026-08-07

Sintetizada em: `specs/specs/06-painel-de-customizacao-e-preview.md` §§9.2-9.3-9.5 (F1, F2) ·
`specs/specs/07-responsividade-e-multidispositivo.md` §§2.1, §5, §8 (F5, F6) ·
`specs/specs/04-shell-e-discovery.md` §4.1, §7.1-7.2 (F3) · `00-contexto.md` (já escrito).

Observações: F4 (`focusRingWidth`) não tinha destino de spec fixa declarado além de
`15-divida-conhecida.md` (achado 10, já fechado no Bloco 1) — nenhuma regra nova nasceu dele, então não há
outro arquivo a tocar. Nada desta plan ficou de fora.
