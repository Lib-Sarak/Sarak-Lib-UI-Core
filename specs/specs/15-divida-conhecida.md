---
tipo: "spec"
titulo: "Dívida conhecida — o registro dos defeitos medidos e ainda não corrigidos"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida técnica"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["spec", "divida-tecnica", "achados", "auditoria", "roteamento"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[00-contexto]]"]
---

# 1. Propósito

O registro **único** dos defeitos que já foram **verificados no código** e ainda não corrigidos. Um agente que
leia esta spec para de "descobrir" o que já está catalogado — e para de propor conserto para o que já foi
decidido manter.

Quatro coisas que este documento **não** é:

- **Não é lista de desejos.** Todo item tem `arquivo:linha` e exposição medida. Suspeita sem medição não entra.
- **Não é backlog de prioridade.** A ordem de execução vive em [[00-indice]]; aqui a ordem é a de descoberta.
- **Não é histórico.** Item fechado **sai** da §3 (o histórico é o `git` e o veredito da plan que o fechou).
- **Não é a fila de gates a construir.** Verificação que nunca existiu **não é dívida** — é implementação
  posterior, e mora na §4. A §3 é só código que viola regra **já formada**.

**Como ler:** §3 é a dívida. §4 é o trabalho de gate que ainda não teve a sua vez. §5 e §6 guardam os números
que saíram, para que nenhum seja reaproveitado.

> **Regra de manutenção:** toda plan que fecha um achado **remove a linha dele aqui**, na mesma execução. Achado
> que sobrevive à sua própria correção vira ruído, e ruído faz a spec inteira perder credibilidade.

---

# 2. Origem e numeração

Os achados 1–31 vêm da campanha de reescrita da base de specs (2026-07-28 → 2026-08-01), em quatro rodadas de
auditoria. **A numeração é definitiva e nunca reaproveitada** — achado fechado não devolve o número.

Eles não são erros das specs antigas: são **defeitos e ambiguidades do módulo**, encontrados porque alguém foi
conferir no código em vez de copiar do material anterior.

**Estado em 2026-08-01, após a triagem (plan-03):** 31 numerados · **10 fechados** (§6) · **2 aceitos como
característica** (§5) · **5 movidos para implementação posterior** (§4) · **14 abertos** (§3). Soma: 31.

> ⚠️ **Correção de contagem.** Até esta triagem o cabeçalho declarava *"9 fechados · 22 abertos"*. Contado item
> a item: eram **8 fechados e 23 abertos** (8 + 23 = 31). Os dois números estavam errados; a numeração, não.

---

# 3. Achados ABERTOS — a dívida de verdade

Todos foram **reconfirmados no código em 2026-08-01** (plan-03) e todos têm **destino decidido pelo dono**. A
coluna *Regra* é a mais informativa da tabela: onde ela diz **nenhuma**, estamos cobrando algo que não está
escrito — e isso é candidato a regra nova, não a conserto silencioso.

## 3.1 🔴 Capaz de destruir dado de terceiro

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 8 | **`localStorage.clear()`** apaga a **origem inteira** do consumidor — token de sessão, preferências, tudo — não só as chaves da lib, e recarrega a página. O `confirm()` promete "configurações visuais". **Hoje inalcançável**: o componente é importado (`CustomizationPanel.tsx:7`) e nunca renderizado (`:40` monta só a `ThemeCustomizationTab`) | `src/features/DesignEngine/Panels/AdvancedTab.tsx:21` | **nenhuma** | **Corrigir** — apagar só as chaves `sarak-*`. Candidato a regra nova: *a lib não apaga dado do host* |

> ⚠️ **Acoplamento que impõe ordem de execução.** O `CustomizationPanel` importa 7 abas e renderiza **uma**
> (`CustomizationPanel.tsx:3-9` × `:40`); uma das mortas é justamente a `AdvancedTab`. Logo: **restaurar as abas
> ATIVA a perda de dados.** Consertar o `clear()` vem **primeiro**; decidir se as abas voltam vem depois.
> Decidir na ordem inversa é a única forma de transformar código morto em bug de produção.

## 3.2 🔴 Artefato gerado que publica número falso

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 22 | **Tipo público defasado em 105 tokens.** Recontado em 2026-08-01: **304 propriedades** na `SarakDesignTokens` × **409** tokens reais. Nenhum gate acusa: o `auditor_paridade` cruza schema × mapping × partições, e o tipo gerado **não é uma das três fontes**. O número falso **vaza para o consumidor** via `sarak-ui/catalog.json` (`designTokens.count = 304`) | `src/core/Provider/generated/design-token-ids.ts` · gerador `scripts/generate-token-types.ts` | **nenhuma** | **Corrigir (metade de código)** — regenerar. A outra metade (registrar o gerador num pipeline) é gate: §4 |

> **Este achado tem duas metades e elas foram separadas na triagem.** Regenerar o artefato é dívida — o número
> falso está publicado agora. Registrar o gerador num pipeline é **construção de gate**, e gate vem depois das
> regras (§4). Fechar só a primeira metade faz o artefato apodrecer de novo; é por isso que as duas ficam
> escritas, cada uma no seu lugar, em vez de uma sumir.

## 3.3 Violação de regra **já formada** que nenhum gate vê

Estes três não são "gate faltando" — a regra existe, está escrita, e o código a viola **agora**. O gate não
enxergar é agravante, não a causa. A ampliação de escopo de cada auditor está em §4; o conserto do código é
aqui.

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 1 | **`--sx-*` vivo** como fallback de 2º nível. Ninguém emite `--sx-color-primary-base`: o fallback **resolve para vazio** e o thumb do range fica sem cor quando `--sarak-range-active-bg` falta | `src/styles/_utilities.css:80,89` | **R7** (namespace PROIBIDO) | **Corrigir (metade de código)** — as 2 linhas de CSS. Ampliar o `auditor_ghostvars` a `src/styles/` é gate: §4 |
| 13 | `src/shared/` **fora do escopo** do `auditor_coverage` (`:52-60` varre `components`, `features`, `core`). Recontado: **4 arquivos, 0 testes** — `useSarakRouter.ts` e `useModuleDiscovery.ts` são **violação de R8 na letra**; `services/api.ts` (`.ts` que não começa com `use`) e `types/index.ts` (`index*`) **não são cobrados nem pela regra** | `src/shared/` · `auditor_coverage.mjs:52-60` | **R8** (2 dos 4) | **Corrigir (metade de código)** — testes para os 2 hooks. Ampliar o escopo do auditor é gate: §4 |
| 29 | Bloco **gerado** manda "regenere com o script do **§5.1 do guia**". Medido: `GUIA-MANUTENCAO.md` tem §5 = *"Mexer no cromo"*, **sem 5.1**; o alvo real é o §2 (paridade). O texto sai em dois artefatos gerados | `sarak-dev/GUIA-MANUTENCAO.md:308` · `sarak-dev/state.json:44` · gerador `scripts/dev-kit/renderDevAppendix.mjs` | **R17** (metade sem gate) | **Corrigir (metade de código)** — o texto do gerador. Ensinar `§N.N` ao `dev-kit:check` é gate: §4 |

## 3.4 Comportamento

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 10 | **`focusRingWidth` é token de acessibilidade que não move nada.** O schema emite `--sarak-focus-width` (faixa 0–6, default 2); a regra global de foco **chumba** `outline: 2px solid`. Nenhum tema altera o anel de foco | `src/core/Design/schema/engineering.ts:12` × `src/styles/_utilities.css:54-58` | **nenhuma na letra** (o `auditor_hardcoded` só varre `.tsx`) | **Corrigir** — `outline: var(--sarak-focus-width, 2px) solid …`. Candidato a regra nova: *token de a11y tem de alcançar o CSS* |
| 11 | **Token de breakpoint move só 1 dos 3 caminhos.** Medido: só `useDesignVariables.ts:58` lê `design.breakpointTablet`. `DeviceProvider.tsx:8` e `useStructuralStyles.ts:40,42,86,229` + `.presets.ts:13,14` usam a **constante** 768/1024. Quem muda o token desalinha CSS × JS | `src/core/Provider/DeviceProvider.tsx:8` · `src/components/atomic/hooks/useStructuralStyles*` | **nenhuma** | **Corrigir em parte** — o `DeviceProvider` é JS e sai barato. As classes `@min-[768px]` são build-time e **não aceitam `var()`**: essa metade é **aceita**, com o motivo em `00-contexto` §8 |
| 12 | **`SarakTable` sem opt-out de colapso mobile:** `:113` troca por cards no smartphone sem prop nenhuma, enquanto o irmão `SarakDataTableImpl` tem `responsive?: boolean` (`:42,71,77`) com teste dedicado. Dois componentes públicos, APIs divergentes | `src/components/atomic/Templates/SarakTable.tsx:113` | **nenhuma** | **Corrigir** — `responsive?: boolean` com default `true`. É **aditivo → minor**, não precisa esperar o major |
| 9 | `isGlass` é ramo morto que renderizaria **nav nenhuma**. Confirmado: `global.ts:21-33` só oferece `sidebar\|topbar\|dock`, então `validateDesign` descarta `'glass'` e o ramo é inalcançável. Exposição hoje: **zero** | `src/core/Shell/SarakShell.tsx:80-81` | **nenhuma** | **Corrigir** — higiene barata e sem risco; hoje é uma armadilha para quem acrescentar a opção |
| 2 | `upgradeThemePayload(partialMode)` — parâmetro morto. Confirmado: **1 única ocorrência** em todo o repositório, a própria assinatura | `src/core/Design/master-map.ts:148` | **nenhuma** | **Corrigir → plan-09** — remover parâmetro é mudança de assinatura pública (**major**) |

## 3.5 Superfície pública e higiene

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 3 | `CustomizationPanel` sai **eager** do barril, e ainda é importado eager pelo efeito colateral de `:126-131` — paga custo de boot quem nunca abre o painel | `src/index.ts:50` · `:126-131` | **R15** (violação declarada) | **Corrigir → plan-09** — `React.lazy` muda o tipo público para `LazyExoticComponent`: **breaking change** |
| 24 | O `main.tsx` que **todo consumidor novo recebe** cita o `Sarak-MyService`, obsoleto e inacessível ao importador. Comentário que viaja para o consumidor é documentação pública | `bin/scaffold/generators/mainTsx.mjs:36-40` | **R17** (metade sem gate) | **Corrigir** — troca de texto |
| 25 | Ponteiro morto: afirma que `templates/app-starter.manifest.json` "segue publicado (`SARAK_STARTER_MANIFEST`)". Reconfirmado: a pasta `templates/` **não existe** na raiz e o símbolo tem **1 ocorrência em todo o código-fonte** — o próprio comentário | `bin/scaffold/context.mjs:7-10` | **R17** (metade sem gate) | **Corrigir** — remover as 4 linhas |

## 3.6 Segurança e medição

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 17 | `testDir: './e2e'` — **a pasta não existe**; `playwright test` não acha nada e **sai verde**. As specs E2E reais vivem em `src/core/Provider/__e2e__/` e `src/features/DesignEngine/__e2e__/` | `playwright.config.ts:7` | **nenhuma** | **Corrigir** — defeito de configuração, 1 linha. Ligar o Playwright ao pipeline é a plan-11 |

---

# 4. Implementação posterior — os gates que ainda NÃO existem

> 🔒 **Isto não é dívida.** Decisão do dono (plan-03, 2026-08-01): *"tudo que é relacionado ao gate de
> verificação ainda não foi implementado — não é dívida, é implementação posterior. Devemos ter todas as
> regras formadas, para então criar a verificação para o gate."*

A diferença é de sequência, não de rigor. Um gate que **nunca foi construído** não é um defeito do código: é
trabalho que ainda não chegou a sua vez. Construí-lo antes de o conjunto de regras estar fechado produz gate que
cobra a régua errada — e gate errado é mais caro que gate ausente, porque ninguém desconfia dele.

**A ordem é:** fechar o conjunto de regras ([[00-regras-e-invariantes]]) → mapear escopo de gate × escopo de
regra (plan-06) → **só então** construir/ampliar as verificações.

> ✅ **O primeiro degrau foi dado em 2026-08-02 (plan-13):** o conjunto fechou em **32 regras** — 29 verificáveis
> e 3 de conduta. Três achados desta seção **ganharam a regra que lhes faltava** e deixaram de ser "nenhuma":
> **14 → R32** (a lib é indiferente ao sistema de autenticação) · **15 → R8.1** (cobertura em %, piso móvel) ·
> **18 → R31** (contraste AA nos 18 temas shippados). O que falta neles agora é só o gate — plan-12.

## 4.1 Gates integralmente ausentes

| # | O que falta | Onde | Regra que ele cobraria |
|---|---|---|---|
| 14 | **Gate anti-acoplamento de auth.** Confirmado: **0 arquivos** `AuthCoupling*`. Um plano antigo o previu e se declarou concluído sem criar nada | — | **R32** *(escrita em 2026-08-02)* — a lib é indiferente ao sistema de autenticação. A regra existe; falta o gate. ⚠️ Ela **nasce com uma violação**: o `SarakSecurityOrchestrator`, roteado à plan-09 |
| 15 | **Cobertura em %.** `@vitest/coverage-v8` em `package.json:100`, **nenhum script o invoca** | `package.json:100` | **R8.1** *(decidido em 2026-08-02)* — o % entra como **segunda rede** do 1:1, com **piso móvel**: mede, grava, e o piso só sobe |
| 18 | **Medição de contraste WCAG AA.** Confirmado: **0 cálculos** de razão de contraste em `src/`. (`useMediaLuminance.ts` mede luminância de mídia para escolher cor de texto — **não** é contraste WCAG) | — | **R31** *(escrita em 2026-08-02)* — AA garantido nos **18 temas shippados**; **sem promessa** para tema do consumidor. Pode nascer vermelha: ninguém mediu os 18 |
| 23 | **Gate de conteúdo sobre `sarak-ui/templates/`.** Medido: `kitFiles.mjs:16-22` não lista `templates/`; `tsconfig.json:20` é `include: ["src"]`; `check-package-contents.mjs` cobra **só presença** de 3 dos 5 itens — `componente-proprio.tsx` e `templates/ui-kit/` existem e **nada os cobra**. Template citando componente removido sai verde em tudo | `sarak-ui/templates/` | **R17**, cuja metade de prosa manual não tem gate. O achado 24 é a prova de que já aconteceu |
| 26 | **Automação que exercite um `install` de verdade.** Confirmado: **0 ocorrências** de `child_process`/`execSync` nos testes de `bin/scaffold/`. As provas de npm/pnpm/yarn foram feitas à mão, uma vez. Idem o `check --notify` do `predev` | — | Nenhuma regra escrita. Depende de CI (plan-05) e é o escopo da **plan-11** |

## 4.2 Ampliações de escopo — a metade "gate" dos achados partidos

Cada linha aqui é a **segunda metade** de um achado que continua aberto em §3 pela metade de código. As duas
metades existem porque fechar só uma deixa o vão de pé para a próxima violação — é a lição do achado 4
(fechado ampliando o escopo do `barrel:check` **junto** com o conserto).

| Achado | Metade de código (§3) | Metade de gate (aqui) |
|---|---|---|
| **1** | as 2 linhas de `--sx-*` em `_utilities.css` | `auditor_ghostvars.mjs:14` tratar `src/styles/` também como **consumidora**, não só como fonte. ⚠️ Ampliar o escopo **sem ampliar o registro** produz acusação falsa — ver [[01-gates-e-baseline]] §4.3.c |
| **13** | testes para `useSarakRouter` e `useModuleDiscovery` | `auditor_coverage.mjs:52-60` incluir `src/shared/` |
| **22** | regenerar `design-token-ids.ts` | registrar `scripts/generate-token-types.ts` em script/hook/pipeline, para não apodrecer de novo |
| **29** | o texto `§5.1` no gerador do `sarak-dev/` | `dev-kit:check` aprender a validar ponteiro de **seção** (`§N.N`), hoje só valida caminho, `npm run` e `node` |

> **O padrão que estas duas seções nomeiam é o mais caro do repositório:** *o escopo do gate é menor que o
> escopo da regra*. Os primeiros casos apareceram **por acaso**, não por método — e o antigo achado 30 provou
> que atenção humana não o pega: a classe reapareceu pela mão que a acabara de catalogar. **Quantos faltam é
> desconhecido**, e responder isso é exatamente o produto da plan-06.

---

# 5. Aceitos como característica — migrados para `00-contexto` §8

Saíram da dívida por decisão do dono: o custo do conserto supera o dano, **e o motivo está escrito** no
destino. Registrados aqui só para a numeração não ser reaproveitada.

| # | O que era | Por que deixou de ser dívida |
|---|---|---|
| 16 | "5 sinks de `dangerouslySetInnerHTML` — auditar se algum é vetor real" | **A auditoria foi feita** (2026-08-01, um a um): os 5 são `<style>` com CSS. Dois são literais estáticos; três derivam de `design`, que já passou por `validateDesign` (R6 bloqueia `[<>{};]`). **Nenhum recebe HTML de origem não confiável.** O achado era uma pergunta, e ela foi respondida |
| 27 | "`chromeSlots` conta 9 para as 8 regiões" | `topbarActions` é alias legado de `topbarEnd`, e o **próprio `doc` do slot diz isso** ao consumidor no `catalog.json`. Imprecisão de derivação por tipo, autodeclarada no artefato |

---

# 6. Achados FECHADOS (2026-07-28 → 2026-08-01)

Registrados só para que a numeração não seja reaproveitada. O detalhe está no `git`.

| # | Fechado por |
|---|---|
| 4 | 3 das 4 categorias de `engines/` entraram no barril |
| 5 | `README.md` deixou de mandar instalar `pg` |
| 6 | Decisão do dono: `atomic/Tables/` **fica como está** — o hook é `structuralConsumer` de 2 tokens |
| 7 | Era imprecisão de relatório, não defeito |
| 19 | "A lib nunca controla a URL" era falso (`useSarakRouter.ts:49,51`); a spec nova registra o comportamento real |
| 20 | Status falso na spec antiga de presets |
| 21 | Duplicação entre specs antigas, resolvida pela consolidação |
| 28 | JSDoc citando arquivo de plano inexistente, removido |
| 30 | **Não se reproduz** (verificado 2026-08-01). Dizia que `verify_presets.ts:16` apontava para um `arquitetura/04 §9` inexistente. O alvo existe e é o certo: `04-contrato-de-tokens-e-paridade.md:252` = `# 9. Anti-drift de tema e preset` — exatamente o assunto do script. A reescrita da base (plan-01) criou o §9 |
| 31 | **Não se reproduz** (verificado 2026-08-01). Dizia que a ponte para `specs/` era SOFT. `CLAUDE.md:3` hoje aponta **duro** para `specs/00-contexto.md`, os dois prompts e o `00-indice`. `.agents/index.md` segue com 0 referências a `specs/`, mas a ponte não passa mais por ele |

---

# 7. Critérios de aceite desta spec

- [x] Todo achado aberto tem **arquivo:linha** ou a declaração explícita de que a localização é o próprio vão.
- [x] Nenhum achado aberto está sem categoria.
- [x] A numeração é contínua de 1 a 31, sem reaproveitamento.
- [x] Todo achado aberto tem **regra nomeada** — ou a declaração explícita de que **nenhuma regra o cobre**.
- [x] Todo achado aberto tem **destino decidido pelo dono** (plan-03, 2026-08-01).
- [x] **Soma fechada:** 14 abertos (§3) + 5 implementação posterior (§4) + 2 aceitos (§5) + 10 fechados (§6) = **31**.
- [ ] Toda plan que fecha um achado **remove a linha** aqui e cita o número no veredito.
- [x] `00-contexto` §8 aponta para cá em vez de listar achado.

---

# 8. Contrato de manutenção

- **Só entra o que foi medido.** Suspeita vira plan de investigação, não linha nesta spec.
- **Item fechado sai** — na mesma execução que o fechou, não "depois".
- **Numeração definitiva.** Achado novo pega o próximo número livre (a partir de 32).
- Achado que o dono decidir **aceitar como dívida permanente** sai da §3 e vira linha em `00-contexto` §8, com
  o motivo — porque aí deixou de ser dívida e virou característica. O §5 desta spec guarda só o número.
- **Gate que nunca existiu não é dívida** — vai para a §4. Dívida é código que viola regra **já formada**;
  gate ausente é trabalho em fila, e a fila começa depois de as regras fecharem. Misturar os dois faz a lista
  de dívida crescer com trabalho que ninguém prometeu, e a métrica perde o sentido.
- **Achado com duas metades declara as duas** (§4.2). Fechar só a de código deixa o vão aberto para a próxima
  violação; apagar a de gate destrói trabalho que ninguém fez e ninguém vai lembrar de refazer.
- **`nenhuma` na coluna *Regra* é resultado, não lacuna de preenchimento.** É o sinal de que estamos cobrando
  algo que não está escrito — leia como candidato a regra nova, não como achado de segunda classe.
