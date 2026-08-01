# Prompts de Execução — CAMPANHA 2: "Adequação do Sistema"

> **Este arquivo nasceu em 2026-07-31, no P25 da Campanha 1.** O conteúdo anterior (os prompts P0–P28 da campanha "Reescrita da Base de Specs", todos executados) está preservado no git e resumido em `00-progresso.md`.
>
> **A ordem das duas campanhas é uma decisão, não acaso:** *primeiro corrigimos e limpamos as specs; depois adequamos o sistema ao que ficou escrito.* Adequar antes de escrever seria consertar contra um alvo que ainda se movia.

**Ponto de partida.** A base de specs está escrita e verdadeira; o `specs/plan/` foi esvaziado da Campanha 1; e o sistema tem uma dívida **inteiramente documentada e nenhuma paga**. **A Campanha 1 mediu; a Campanha 2 conserta.**

Cada fase abaixo tem **briefing**, não prompt. Os **prompts nascem quando o dono for executar cada fase** — foi assim que a Campanha 1 funcionou, e é o que impede um prompt de envelhecer meses antes de alguém o usar.

---

# REGRAS COMUNS A TODOS OS PROMPTS

### 1. Preparação obrigatória (nesta ordem)
1. Acione a skill **`ui-contexto-repositorio`** — sempre primeiro.
2. Leia **`sarak-dev/START-HERE.md`** e **`sarak-dev/GUIA-MANUTENCAO.md`** — o kit do mantenedor é o índice operacional da base.
3. Leia **este arquivo inteiro** — o mapa da campanha.
4. Leia **`specs/specs/00-regras-e-invariantes.md`** (o contrato único) e **`specs/specs/01-gates-e-baseline.md`** (o baseline) — nesta ordem.
5. Leia **o material-fonte listado na sua tarefa**, inteiro.
6. **CONFIRME NO CÓDIGO** cada afirmação que for escrever ou consertar.

### 2. O princípio inegociável (herdado da Campanha 1)

> **O CÓDIGO É A FONTE DA VERDADE.** Onde uma spec contradiz o código, o **código vence**. Toda afirmação estrutural tem de ser confirmada por `arquivo:linha`. **Não invente estado.**

Na Campanha 2 há um corolário: **quando o conserto fizer a spec ficar errada, a spec é atualizada no MESMO commit.** Uma campanha de adequação que deixa a spec para trás recria exatamente o problema que a Campanha 1 passou seis fases corrigindo.

### 3. Frontmatter obrigatório
Todo documento novo nasce do template correspondente em `specs/_templates/`. Nada de campo inventado. `status` honesto, `dominio` preenchido, `relacionados` com WikiLinks reais.

### 4. Não transcreva fonte viva *(R17)*
Lista de tokens, de componentes, de props, de ícones: **jamais** copiada para dentro de markdown. Aponte para a fonte gerada (`docs/component-catalog.json`, `sarak-ui/catalog.json`, `sarak-dev/state.json`, `getAllDesignTokens()`, `getScaffold()`).

### 5. O BASELINE dos gates — MEDIDO em 2026-07-31, ao fim do P25

`run_audit.mjs` **NÃO está em 0**. Este é o baseline exato; **qualquer coisa diferente disto é regressão sua** — exceto quando a sua tarefa for justamente pagar a dívida, e aí o baseline é regravado **no mesmo commit do conserto**.

| Gate | Comando | Baseline |
| --- | --- | --- |
| `run_audit` | `npm run audit` | ❌ **exit 1 — 2 regras vermelhas** |
| ↳ `auditor_hardcoded` | | **1 violação de Valor:** `src/components/atomic/Atoms/SarakTypography.tsx:39` → `var(--sarak-h1-ls, -1px)` (fallback negativo). Estrutural líquido = **0** |
| ↳ `auditor_ghostvars` | | **3 consumos:** `--token`, `--sarak-button-radius`, `--sarak-shell-brand-logo-size` |
| ↳ typescript / coverage / arquitetura / cleancode / paridade / presets | | ✅ **6 verdes** (409/409/409 tokens; 120 itens de tema/preset) |
| `barrel:check` | `npm run barrel:check` | ✅ **81 componentes, 0 faltas** |
| `catalog:check` | `npm run catalog:check` | ✅ em dia |
| `zero-brand:check` | `npm run zero-brand:check` | ✅ **361 arquivos, 0 violações** (a contagem é de arquivos VARRIDOS; o número que importa é o de violações) |
| `guide:check` | `npm run guide:check` | ✅ **kit do consumidor em dia (6 arquivos)** |
| `dev-kit:check` | `npm run dev-kit:check` | ✅ **kit do mantenedor em dia (3 arquivos, 0 ponteiros mortos)** |
| suíte completa | `npx vitest run` | ✅ **274 arquivos / 889 testes, 100% verde** (~160 s) |
| `tsc` | `npx tsc --noEmit` | ❌ **14 erros** — 10 em teste, **4 em produção** (`useStructuralStyles.ts:30,71,94`; `ThemeCustomizationTab.tsx:86`). **Não é gate hoje.** |
| `build` + DTS | `npm run build` | encadeia catalog→barrel→zero-brand→guide→tsup→css→scoped→copy→inject→build-info |
| `package:check` | `npm run package:check` | roda no `prepublishOnly`; exige `dist/` buildado |

**Tarefa que só escreve markdown não pode mover nenhum número acima.** Se moveu, algo saiu errado.

### 6. Regra de DIVERGÊNCIA (crítica — leia duas vezes)

> Se você encontrar **qualquer coisa divergente deste plano** — o código não bate com o que o plano afirma, o material-fonte aponta para algo que não existe, o escopo proposto não fecha, ou você acha que a rota de um achado está errada:
>
> **PARE. NÃO DECIDA SOZINHO. NÃO CONTORNE.**
>
> Registre a divergência com: (a) o que o plano diz, (b) o que o código mostra (com `arquivo:linha`), (c) as opções que você vê, (d) sua recomendação. E **peça aprovação explícita** antes de seguir.
>
> Obstáculo se **REGISTRA**, não se contorna.

### 7. O RELATÓRIO DE ENTREGA (formato obrigatório)

```
## 1. ENTREGA
Arquivos criados/alterados: <caminho> (<n> linhas) — um por linha.

## 2. RASTREABILIDADE
Tabela: | Afirmação estrutural | Comprovação (arquivo:linha) |

## 3. ACHADOS FECHADOS
Tabela: | # do achado | Como foi fechado | Prova (teste/gate que agora o pega) |

## 4. GATES
Saída NUMÉRICA de cada gate rodado, comparada com o baseline da §5.
Explicite: "baseline exato" ou "mudou: <o quê e por quê>".
Se o baseline ENCOLHEU, mostre o `npm run audit:baseline` no mesmo commit.

## 5. DIVERGÊNCIAS
Conforme a §6. "Nenhuma" é resposta válida — mas só se for verdade.

## 6. NÃO FEITO
O que ficou de fora do escopo e por quê. Silêncio aqui é proibido.
```

### 8. Ao terminar cada tarefa
1. Marque o checkbox no Roteiro de Execução **deste arquivo**.
2. Adicione uma entrada em `specs/plan/00-progresso.md`.
3. Rode `npm run dev-kit` se qualquer contagem do repositório mudou.
4. **NÃO COMMITE sem autorização explícita do dono.**

### 9. Fronteiras globais
- **NÃO** faça deploy, publish, `npm version`, tag ou push sem autorização.
- **NÃO** afrouxe gate: não relaxe allowlist para mascarar violação real, nem exclua pasta do escopo de um auditor para baixar contagem.
- **NÃO** maquie número. Mover código para `.ts`, para uma `const` interpolada ou trocar espaço por `_` para escapar de um detector é **fraude, não arquitetura**.
- **NÃO** invente numeração, nome de arquivo ou categoria diferente da que o prompt fixa.

### 10. 🔒 Só sai deste arquivo o que foi EXECUTADO

> **Regra absoluta, acima de qualquer tarefa deste plano.**
>
> **Deste arquivo só se remove conteúdo cujo checkbox está `[x]`.** Qualquer item com checkbox `[ ]` — tarefa, briefing, decisão pendente, achado sem rota fechada — **NUNCA é removido.** Não por limpeza, não por "esvaziar o plan", não por achar que já não serve.

**Por quê.** Este arquivo é a **única fonte executável do que ainda vai acontecer**. Apagar uma etapa não executada não "limpa o plano": **destrói trabalho que ninguém fez ainda e que ninguém vai lembrar de refazer.** Ao encerrar esta campanha, conte os `[ ]` ANTES de remover qualquer coisa e prove que **todos** aparecem no plano seguinte.

---

# REGISTRO DE DECISÕES DO DONO

Decisões tomadas em conversa, com data. **Nenhum agente re-litiga o que está aqui.** Se você acha que uma delas está errada, isso é DIVERGÊNCIA — registra e pergunta; não decide por conta.

| # | Decisão | Data | Consequência |
| --- | --- | --- | --- |
| **D1** | **`atomic/Tables/` fica como está.** A categoria não tem componente (só `hooks/useTableLayoutStyles.ts`), mas **não é obsoleta**: o hook é importado por `Templates/SarakTable.tsx:18` e é `structuralConsumer` de dois tokens (`schema/tables.ts:25` e `:40`). Apagar quebraria a paridade estrutural; as três alternativas custam mais que a anomalia. | 2026-07-28 | **Sem tarefa.** Documentada em `arquitetura/00-mapa-do-modulo` §9 |
| **D2** | **Engines: apagar o barril órfão, expor Chat+Flow, remover Visual, ampliar o gate.** | 2026-07-28 | ✅ executado (P26 da Campanha 1) |
| **D3** | **Versão renumerada para `1.0.0`.** | 2026-07-27 | ✅ executado (P12) |
| **D4** | **Distribuição: tags + `#semver:` como caminho RECOMENDADO; `github:` puro segue SUPORTADO.** Nenhum consumidor existente precisa mexer no `package.json` no dia em que a tag nasce; quem pina por commit continua podendo; e a decisão é reversível. | 2026-07-28 | ✅ executado (P12-C) |
| **D5** | **Emissão de tag: semi-automática, com BLOQUEIO no push.** O gatilho é *"o artefato publicado mudou"*, não *"houve commit"*. O nível do bump é **decidido por humano**, não derivado de mensagem de commit. | 2026-07-28 | ✅ executado (P12-C) |
| **D6** | **O `Sarak-MyService` é OBSOLETO.** Deixa de ser consumidor de referência. | 2026-07-28 | Varreduras de consumidor real consideram só o **ERP** |
| **D7** | **`Template-Ts/` SAI do repositório.** Template de backend de chat, 85 arquivos, sem referência na lib, invisível a todos os gates exceto a suíte — onde produzia **falso verde**. *"Esta é uma biblioteca genérica e não deve depender de nenhum módulo."* | 2026-07-28 | ✅ executado (P20-A) |
| **D8** | **Anel 3 → `pre-push`: PROMOVER, mas só a SUÍTE.** `npm run build` e `package:check` ficam FORA de hook para sempre — o build MUTA a árvore de trabalho, e esse motivo não expira. | 2026-07-28 | ✅ executado (P27) |
| **D9** | **CI ganha FASE PRÓPRIA.** É o único item que resolve a classe inteira de "verde que depende da máquina" — o `$HOME` de um runner limpo não tem lockfile solto nem `node_modules` de projeto alheio. | 2026-07-28 | **Fase A** |
| **D10** | **Registry npm: NÃO agora.** O `#semver:` + tag já entrega o `npm update`. O ganho que falta é **tirar o `dist/` do git** — e ele só compensa quando houver consumidor fora da órbita do dono. | 2026-07-28 | Registrado; sem tarefa |
| **D11** | **O ciclo de atualização do consumidor precisa de dois comandos**, refletindo a única fronteira que importa em semver: `sarak-ui update` (dentro da faixa, seguro) e `sarak-ui update --latest` (ATRAVESSA o major, mostrando quantos majors pula + as entradas de `docs/migracoes.md` entre as duas versões, e pedindo confirmação). "Subir uma versão de cada vez" **não existe** no npm e não faz sentido. | 2026-07-28 | **Fase D** |
| **D12** | **As quebras de contrato acumuladas são agrupadas num ÚNICO major.** `CustomizationPanel` lazy, dedup do `SarakTabs` e o destino dos ids legados do Discovery saem juntos numa `2.0.0`, com uma entrada só em `docs/migracoes.md`. Três releases breaking separadas custariam três migrações ao consumidor. | 2026-07-28 | **Fase C** |
| **D13** | **O ERP é o ÚNICO consumidor real, e a importação é LOCAL por enquanto.** `ERP/packages/ui-kit/package.json` declara `"@sarak/lib-ui-core": "file:../../../../Biblioteca/Sarak-Lib-UI-Core"`. As duas pontas estão em desenvolvimento simultâneo — por isso `file:`; **a importação por `github:` vem depois**. | 2026-07-28 | **Fase 0**, e revalidação obrigatória na **Fase C** |
| **D14** | **O ERP ganha uma FASE DE ALINHAMENTO própria, ANTES da Fase A.** A auditoria do P28 achou **8 defeitos estruturais no ERP** (não na lib). Enquanto existirem, o ERP é instrumento de medição pouco confiável: o `pnpm install` sempre sai `exit 1`, os 4 apps `web` **não são projetos do workspace**, e a atualização da lib só chega a eles por *junction* manual — **funcionou por acidente favorável**. | 2026-07-30 | **Fase 0** |
| **D15** | **A campanha ganha uma fase de INVESTIGAÇÃO, antes de conserto.** Quatro achados independentes têm a mesma forma — **o escopo do gate é menor que o escopo da regra**. Os quatro apareceram **por acaso**, não por método. Suspeita do dono: **há mais casos ainda não descobertos.** | 2026-07-30 | **Fase G** — roda entre A e B, e **B/F/C dependem dela** |

> ### 📌 Fatos do ERP que quem executar a Fase 0 precisa saber (medidos em 2026-07-29/30)
> - **É workspace pnpm, sem ambiguidade:** `pnpm-lock.yaml`, `pnpm-workspace.yaml` e `packageManager: "pnpm@11.17.0"`.
> - **Modo `file:` = cópia no store.** Rebuildar a lib **NÃO** chega ao ERP sozinho. Arquivo existente reescrito propaga por hardlink; arquivo **adicionado/removido não** — e o `tsup` gera chunks com **hash no nome**, que mudam a cada build. Sem reinstalar, o `dist/index.js` do ERP importa chunks que a cópia dele não tem.
> - **Comando validado** (medido no próprio ERP): `pnpm install --force --filter <nome-do-pacote>`.
> - ⚠️ **NUNCA `npm install` ali.** Foi isso que quebrou um consumidor pnpm na Spec 51 — o npm entra no `node_modules/.pnpm/` e tenta rodar o `prepare` de pacote de terceiro.
> - ⚠️ **`pnpm` pode não estar no PATH.** O campo `packageManager` **declara** o gerenciador, não o instala. `corepack enable pnpm` **FALHA nesta máquina** com `EPERM` em `Program Files` (exige terminal elevado). **O caminho que funciona sem elevação é `corepack pnpm <args>`.** **Declarado ≠ invocável.**
> - **O ERP TEM `sarak:check`**, em `packages/ui-kit/package.json:15`. O que **não existe é o FIO**: nenhum `predev` o invoca. O comando existe e nunca dispara sozinho, o que é **pior que não existir** — dá a impressão de que o ciclo de aviso está montado.

---

# ROTEIRO DE EXECUÇÃO (ordem única — de cima para baixo, um item por vez)

- [ ] **Fase 0** — **Alinhamento do ERP** *(D14)* ⚠️ repositório de fora
- [ ] **Fase A** — Integração contínua *(D9)*
- [ ] **Fase G** — **Auditoria de cobertura dos gates** *(D15)* — INVESTIGAÇÃO antes de conserto; produz a lista das outras
- [ ] **Fase B** — Quitação do baseline + lacunas de gate
- [ ] **Fase F** — Achados de comportamento *(inclui o `localStorage.clear()`)*
- [ ] **Fase C** — Limpeza do contrato público → `2.0.0` *(D12)*
- [ ] **Fase D** — Ciclo de atualização do consumidor *(D11)*
- [ ] **Fase E** — E2E no pipeline

```
0 (ERP)  →  A (CI)  →  G (cobertura dos gates)  →  B (baseline)  →  F (comportamento)  →  C (2.0.0)  →  D (update)  →  E (E2E)
```

**G antes de B, F e C** porque ela é a única fase que **descobre trabalho em vez de executá-lo**. Quitar baseline, consertar comportamento ou quebrar contrato antes de saber o que os gates realmente enxergam é consertar no escuro — e os quatro casos conhecidos apareceram todos por acaso, não por método.

**0 antes de tudo** porque o ERP é o **instrumento de medição** desta campanha — é nele que a Fase C vai provar que um `2.0.0` migra de verdade. Hoje esse instrumento funciona por acidente (junction manual) e grita vermelho a cada install. Validar quebra de contrato contra um consumidor assim é evidência fraca. E é a única fase que não toca a biblioteca, então não compete com nada.

**A primeiro** porque é o único item que torna todos os outros verificáveis: sem ambiente limpo, cada conserto continua sendo validado na máquina que já provou duas vezes que mente. **B antes de F** porque consertar comportamento com a auditoria vermelha impede distinguir regressão nova de dívida velha. **F antes de C** porque `F1` e `F2` são pré-requisito de qualquer decisão sobre o painel, e a Fase C mexe justamente no `CustomizationPanel`. **C depois de B e F** porque quebrar contrato com auditoria vermelha e comportamento duvidoso mistura três fontes de risco no mesmo release. **E por último** porque depende de A e é a única que pode esperar sem custo.

> **Se você só puder fazer duas fases:** **A** (para os números pararem de mentir) e **F1** (o único achado da campanha inteira capaz de destruir dado de terceiro).

---

# 🔒 REGRA DE ESCOPO — o escopo da Campanha 1 estava FECHADO

Decisão do dono (2026-07-29): **nenhum achado foi consertado na Campanha 1.** Ela tinha uma fronteira só — *escrever a base de specs* — e ela não cresceu. Achado encontrado enquanto se escrevia foi **registrado e roteado para cá**, nunca resolvido de passagem.

Isso valeu inclusive para o achado mais grave (o `localStorage.clear()`), que hoje é **código inalcançável** — e é justamente essa inalcançabilidade que tornou adiá-lo seguro.

**Esta campanha tem a fronteira inversa:** ela existe para fechar esses achados. O que ela **não** faz é crescer para features novas. Achado novo encontrado aqui se registra na tabela abaixo e recebe rota — não vira escopo da fase em curso.

---

# Os 31 achados da Campanha 1 — e onde cada um entra

> **Contagem:** 27 herdados das Fases 2/4/5 + 2 do P24 (28, 29) + 2 da revisão da Fase 6 (30, 31). O **28 já está fechado**; os outros 30 estão roteados abaixo.

Duas rodadas de auditoria produziram achados que **não são erros das specs**: são defeitos e ambiguidades do módulo, encontrados justamente porque alguém foi conferir no código em vez de copiar do material antigo. **Nenhum foi corrigido.**

Esta é a rota oficial. Quem executar uma fase **fecha os itens da sua linha**; o que não conseguir fechar vira DIVERGÊNCIA, nunca silêncio.

## Da Fase 2 (7 achados)

| # | Achado | Rota |
| --- | --- | --- |
| 1 | `--sx-*` vivo em `src/styles/_utilities.css:80,89` + `auditor_ghostvars` não varre `styles/` | **Fase B** |
| 2 | `upgradeThemePayload(partialMode)` — parâmetro morto (`master-map.ts:148`) | **Fase B** |
| 3 | `CustomizationPanel` sai **eager** do barril (`src/index.ts:50`) | **Fase C** |
| 4 | 3 das 4 categorias de `engines/` fora do barril | ✅ **fechado** (P26) |
| 5 | `README.md` mandando instalar `pg` | ✅ **fechado** (P24) |
| 6 | `atomic/Tables/` categoria sem componente | ✅ **fechado** por decisão **D1** — fica como está |
| 7 | Local do `verify_parity.ts` | ✅ **fechado** — era imprecisão de relatório |

## Da Fase 4 (14 achados)

**Grupo 1 — Bugs de comportamento → Fase F**

| # | Achado | Gravidade |
| --- | --- | --- |
| 8 | **`AdvancedTab.tsx:21` chama `localStorage.clear()`** — apaga a ORIGEM inteira do consumidor (token de sessão, preferências, tudo), não só as chaves da lib, e recarrega a página. O `confirm()` promete "configurações visuais". **Hoje é inalcançável** (importado e nunca renderizado) | 🔴 **o único capaz de destruir dado de terceiro** |
| 9 | `isGlass` é ramo morto que renderizaria nav nenhuma — só é inalcançável porque `validateDesign` descarta o valor | 🟡 |
| 10 | `focusRingWidth` ignorado pela regra global de foco | 🟡 |
| 11 | Token de breakpoint move só 1 dos 3 caminhos de responsividade | 🟡 |
| 12 | `SarakTable` sem opt-out de colapso mobile (o `SarakDataTable` tem `responsive={false}`) | 🟡 inconsistência de API |

**Grupo 2 — Lacunas de gate → Fase B**

| # | Achado |
| --- | --- |
| 13 | `src/shared/` **fora do escopo** do `auditor_coverage` (`:52-60`): 3 arquivos sem teste, incluindo `useSarakRouter` e `api.ts`. **Gate verde, regra violada** |
| 14 | **O gate anti-acoplamento de auth NÃO EXISTE** — o plano antigo o previu, se marcou concluída, e nenhum arquivo `AuthCoupling*` foi criado. *(É a prova mais limpa de por que a Campanha 1 existiu: uma spec declarou um gate entregue e o gate nunca existiu.)* |
| 15 | Cobertura em % — `@vitest/coverage-v8` instalado e **nunca medido** |
| 16 | 5 sinks de `dangerouslySetInnerHTML`, não "uma exceção" — auditar se os 5 são legítimos (CSS gerado pela engine) ou se algum é vetor real |

**Grupo 3 — Pipeline e medição → Fase E**

| # | Achado |
| --- | --- |
| 17 | `playwright.config.ts:7` aponta `testDir: './e2e'` — **a pasta não existe**; `playwright test` não acha nada. As specs E2E reais vivem em `src/**/__e2e__/` |
| 18 | Contraste **WCAG AA não é medido em lugar nenhum** — a lib não pode prometê-lo sem medir (axe-core na CI) |

**Grupo 4 — Já resolvidos pela própria reescrita** *(sem ação de código)*

| # | Achado | Por que fecha |
| --- | --- | --- |
| 19 | "A lib nunca controla a URL" era falso (`useSarakRouter.ts:49,51` fazem `pushState`/`replaceState`) | ✅ a spec nova registra o comportamento real |
| 20 | Status falso na spec antiga de presets | ✅ a spec nova corrigiu |
| 21 | Duplicação de conteúdo entre specs antigas | ✅ resolvido pela consolidação |

## Da Fase 5 (6 achados — P21/P22/P23, 2026-07-31)

| # | Achado | Rota |
| --- | --- | --- |
| 22 | 🔴 **`src/core/Provider/generated/design-token-ids.ts` DEFASADO em 105 tokens** (304 no tipo público × 409 no catálogo) — e o gerador `scripts/generate-token-types.ts` **não está em script nem hook nenhum**. Nenhum gate acusa: o `auditor_paridade` cruza schema × mapping × partições, e o tipo gerado **não é uma das três fontes**. Efeito colateral grave: o `sarak-ui/catalog.json` publica `designTokens.count = 304` ao consumidor, que é **falso**. Detalhe em `specs/specs/14-artefatos-do-mantenedor.md` §7.1 | **Fase B** — conserto em DUAS metades: regenerar **e** registrar o gerador num pipeline, senão apodrece de novo |
| 23 | **`sarak-ui/templates/` está fora de todo gate de conteúdo**: não está no plano de saída do `guide:check` e o `tsconfig` não o compila (`include: ['src']`). O `package:check` só cobra **presença de caminho**. Um template citando componente removido sai verde em tudo | **Fase B** (lacuna de gate) |
| 24 | **O `main.tsx` que todo consumidor novo recebe cita o `Sarak-MyService`** (`bin/scaffold/generators/mainTsx.mjs:37-40`), OBSOLETO por **D6** e inacessível ao importador. Comentário que viaja para o consumidor é documentação pública | **Fase B** (higiene de superfície) |
| 25 | **Ponteiro morto em `bin/scaffold/context.mjs:5-10`** — afirma que `templates/app-starter.manifest.json` "segue publicado (`SARAK_STARTER_MANIFEST`)". Medido: a pasta `templates/` **não existe** e o símbolo tem **0 ocorrências** fora do próprio comentário | **Fase B** |
| 26 | **Nenhum teste automatizado exercita um `install` de verdade.** As provas ponta a ponta de npm/pnpm/yarn foram feitas à mão, uma vez, e nenhum gate as repete. Idem para o `check --notify` no `predev` — o comando que mais executa na vida do importador é o menos coberto | **Fase A/E** (CI é o único lugar onde isso cabe) |
| 27 | **`chromeSlots` gerado conta 9 para as 8 regiões** documentadas: `topbarActions`, alias legado de `topbarEnd`, é prop opcional de `ReactNode` e o coletor captura por TIPO, não por semântica. Não é erro — é imprecisão de derivação | **Fase C** (sai junto do dedup do contrato público) |

## Achados acrescentados no P24 (2026-07-31)

| # | Achado | Rota |
| --- | --- | --- |
| 28 | JSDoc de código-fonte citando arquivo de plano inexistente (`src/core/Design/types.ts`) | ✅ **fechado** no P25 |
| 29 | O bloco **gerado** do `sarak-dev/GUIA-MANUTENCAO.md` (§B.1) manda "regenere com o script do §5.1 do guia" — **o guia não tem §5.1**. Ponteiro de prosa dentro de bloco gerado, invisível ao `dev-kit:check`, que só verifica caminho/gate/comando. Conserto é no gerador (`scripts/dev-kit/renderDevAppendix.mjs`) | **Fase G** — é exatamente um caso de "o escopo do gate é menor que o da regra" |

## Achados acrescentados na revisão da Fase 6 (2026-07-31)

| # | Achado | Rota |
| --- | --- | --- |
| 30 | ⚠️ **O conserto do P24 criou um ponteiro morto novo.** `.agents/skills/ui-auditoria-modulo/scripts/verify_presets.ts:16` aponta para `specs/arquitetura/04-contrato-de-tokens-e-paridade.md §9` — **o arquivo é o certo, mas o §9 não existe** (a numeração vai até §8.3). O alvo real é **§4.5** ("descartar com aviso, nunca lançar"), que é literalmente o comportamento descrito na frase acima do ponteiro. Trocou-se um ponteiro morto (`arquitetura/09 §4`, backend removido) por outro, mais discreto | **Fase G** — mesma classe do 29, e a **prova viva** dela: a classe reapareceu pela mão que a acabara de catalogar. Nenhum gate viu |
| 31 | **A ponte `CLAUDE.md` → base de specs é SOFT.** `CLAUDE.md` manda ler `.agents/index.md`; o `index.md` é auto-gerado e tem **0 referências a `specs/`**; o `specs/INDEX.md` tem **0 referências a `.agents/`**. A ponte real existe e é boa — a skill `ui-contexto-repositorio` traz **13** ponteiros para `specs/` com ordem de leitura — mas ela depende de o agente **acionar a skill pela description**, não de um ponteiro duro. Agente que leia `CLAUDE.md` → `index.md` e comece a codificar **nunca descobre que a base de specs existe** | **Fase G** — é a versão de onboarding do mesmo padrão. Conserto candidato: **uma linha em `CLAUDE.md`** apontando para `specs/INDEX.md`. Barato; o risco é 100% do tempo em que não é acionada |

## ⚠️ O acoplamento que muda a ordem de execução

**`localStorage.clear()` e "as abas inalcançáveis" são o mesmo problema visto de dois lados.**

O `CustomizationPanel` importa 7 componentes de aba e renderiza **um** (`CustomizationPanel.tsx:3-9` × `:40`). Uma das abas mortas é justamente o `AdvancedTab`, que contém o `localStorage.clear()`.

Consequência: **"restaurar as abas" ATIVA a perda de dados.** A ordem é obrigatória e não é negociável:

1. **Primeiro** consertar o `clear()` para apagar só as chaves da lib (o `storageKey` do Provider).
2. **Depois** decidir se as abas voltam ou saem.

Decidir na ordem inversa é a única forma de transformar código morto em bug de produção.

---

# Fase 0 — Alinhamento do ERP *(decisão D14)* ⚠️ REPOSITÓRIO DE FORA

> **Roda ANTES da Fase A.** É a primeira coisa da campanha, e a única que não toca a biblioteca.

**Problema.** O ERP é o **único consumidor real** e, por isso, o **instrumento de medição** desta campanha inteira — é nele que a Fase C vai provar que um `2.0.0` migra. A auditoria do P28 achou 8 defeitos estruturais nele, e o mais desconfortável é este: **a atualização da lib chegou aos 4 apps por acidente favorável** (*junction* manual), não porque o gerenciador a levou. Um instrumento que funciona por acidente não serve para validar mudança de contrato.

**Quem executa.** O dono disse que corrige direto (2026-07-30). Se um agente executar, vale o **mesmo protocolo do P28**: diagnóstico read-only → relatório em texto → aprovação → execução. Nada é escrito no ERP sem "sim".

### A ordem é obrigatória — o passo 2 derruba o install se o 1 não vier antes

**0.1 · Blindar o `_template`** *(faça primeiro)*
`Modulos/_template/web/package.json` tem `"name": "@erp/<modulo>-web"` — **placeholder literal**. Hoje é inofensivo porque `_template` está fora do workspace. Corrigir o 0.2 o coloca dentro, e um `name` com `<modulo>` **derruba o `pnpm install`**. Excluir do glob (`!Modulos/_template/*`) ou dar um nome válido.

**0.2 · O glob do workspace não casa com a pasta real** 🔴 *o item central*
`pnpm-workspace.yaml:6-7` declara `'modulos/*/web'` e `'modulos/*/api'`; a pasta é **`Modulos/`**. O NTFS é case-insensitive para abrir arquivo, mas o glob compara **string** — não casa.
Efeito: os 4 apps `web` e as `api` **não são projetos do workspace** (`pnpm ls -r` vê 5: raiz + 2 `adapters` + 2 `packages`); `--filter @erp/conector-web` → *"No projects matched"*.
⚠️ **Bomba de portabilidade:** os 5 scripts `dev:*-web`/`dev:conector-api` do root usam `--prefix modulos/...` minúsculo. Windows resolve; **Linux não**. Qualquer CI do ERP quebra no primeiro dia.
Corrigir isto **resolve 0.6 e 0.7 de tabela**.

**0.3 · `allowBuilds` com placeholder literal**
`pnpm-workspace.yaml:11-12`: `better-sqlite3: set this to true or false` e `esbuild: idem` — strings onde se espera booleano → **todo install termina `exit 1`** (`ERR_PNPM_IGNORED_BUILDS`). Efeito prático hoje é nulo, e é exatamente por isso que é insidioso: **install que sempre sai vermelho treina a ignorar o vermelho.**

**0.4 · Convenção de nome de módulo**
`Contratos`/`Projetos`/`Propostas` capitalizados; `conector`/`_template` minúsculos. Escolher uma e aplicar — senão o 0.2 volta em outra forma.

**0.5 · `conector:build` e `conector:test` são provavelmente no-op**
Usam `turbo run … --filter=@erp/conector-*`, e o turbo lê o mesmo workspace do pnpm. Sem os apps como projetos (0.2), o filtro não casa nada e o comando **sai 0 sem rodar**. Vale para `npm run test` do root também.
*Inferência derivada do 0.2 — CONFIRMAR rodando e vendo quantos pacotes o turbo reporta.*

**0.6 · `sarak:check` existe e nunca dispara**
`packages/ui-kit/package.json:15`, com `|| true`, e nenhum `predev` o invoca. **Pior que não existir** — parece montado.
⚠️ Ao ligar: o `predev` do root já é ocupado (`matar-portas-dev.mjs`) — **encadear, não substituir**. O `|| true` pode sair (o `check` já é `exit 0` por contrato).
⚠️ **Sobreposição declarada:** a **Fase D** também mexe no ciclo de aviso, mas do lado da LIB. O fio no ERP é aqui; a Fase D revisita se o comando mudar.

**0.7 · Junctions manuais como único elo**
`Modulos/*/web/node_modules/@erp/ui-kit` existe nos 4 — acoplamento **fora do gerenciador**. Foi o que fez a atualização do P28 chegar neles; e é o que pode ser apagado por um install que recrie `node_modules`, sem nada acusar até um build falhar. **Corrigir 0.2 elimina a necessidade.**

**0.8 · O ADR 009 do ERP nunca foi superado**
Ele registra a **remoção** do Sarak; o Sarak foi **reintroduzido** como `packages/ui-kit` e o ADR novo ficou como *"follow-up do dono, não gate"* — nunca feito. É um ADR vigente que descreve o oposto do código: o mesmo defeito que a Campanha 1 passou seis fases corrigindo do lado da lib. ADR é imutável — cria-se um novo com `substitui`/`substituido_por` e o 009 vira `🔴 Substituído`.

### Fora de escopo desta fase — registrado para não confundir

- **`file:` exigir `pnpm install --force` após cada rebuild** não é defeito: é o preço da escolha deliberada da **D13**, e desaparece quando o ERP migrar para `github:…#semver:^1.x`. **Não "consertar".**
- **`pnpm` não invocável** é da **máquina**, não do ERP. Hoje o caminho é `corepack pnpm <args>`; definitivo é terminal elevado ou `corepack enable --install-directory <pasta já no seu PATH>`.

**Ordem sugerida:** `0.1 → 0.2 → 0.3 → 0.5 → 0.6 → 0.4 → 0.8`. Os dois primeiros provavelmente resolvem três problemas com uma edição.

**Spec a criar:** nenhuma **nesta** base — os oito itens são do repositório do ERP. Do lado da lib, só a atualização do bloco "📌 Fatos do ERP" e da **D13**, quando 0.2/0.7 mudarem a topologia.
**Aceite:** `pnpm install` sai **0**; `pnpm ls -r` lista os 4 apps `web`; `--filter @erp/conector-web` casa; os builds funcionam **sem** junction manual; e `npm run sarak:check` dispara sozinho num `npm run dev`.

---

# Fase A — Integração contínua *(decisão D9)*

**Problema.** Duas vezes na Campanha 1 um "verde" foi falso por causa da máquina: um `package-lock.json` solto no `$HOME` derrubava um teste, e um `node_modules/` não versionado fazia 6 arquivos de um projeto alheio passarem. Nenhum gate local pega essa classe — por definição, o ambiente local é o problema. **`.github/` não existe** neste repositório.

**Escopo.** Rodar num ambiente limpo o que não cabe em hook: suíte completa, `npm run build`, `package:check`, e o `run_audit` comparado ao baseline versionado. Cobrar quem usou `--no-verify` — hoje esse escape é invisível.

**Escopo adicional — achado 26:** nenhum teste exercita um `install` de verdade. A CI é o único lugar onde isso cabe.

**Spec a criar:** `specs/specs/15-integracao-continua.md`.
**Também atualiza:** `02-enforcement-por-commit.md` (a §9 "opção em aberto" morre) e `01-gates-e-baseline.md` (onde cada gate roda).
**Aceite:** um PR com teste quebrado é reprovado pela automação, não pela memória de alguém; e a suíte roda num `$HOME` que não é o do dono.

---

# Fase G — Auditoria de cobertura dos gates *(INVESTIGAÇÃO antes de conserto)*

> **Roda entre A e B.** É a única fase da campanha que **começa sem lista de tarefas** — a lista é o produto dela.

**A suspeita, e ela tem evidência.** Quatro achados independentes têm a **mesma forma**:

| Regra | Gate que a cobra | O que o gate NÃO vê |
| --- | --- | --- |
| Namespace `--sx-*` proibido | `auditor_ghostvars` | `src/styles/` — tratado como fonte emissora, nunca como consumidora → **2 usos vivos** |
| Cobertura 1:1 | `auditor_coverage` | `src/shared/` — fora do escopo → **3 arquivos sem teste** |
| Barril completo | `barrel:check` | `components/engines/` — fora do escopo → **3 categorias inalcançáveis** *(fechado no P26)* |
| Paridade do dicionário | `auditor_paridade` | o **tipo gerado** `design-token-ids.ts` não é uma das 3 fontes → **105 tokens de deriva** |

Quatro vezes o mesmo padrão: **o escopo do gate é menor que o escopo da regra.** Nenhum é gate quebrado — todos passam, com convicção, dentro do recorte deles. **O defeito é o recorte.**

**Quatro instâncias do mesmo padrão não são coincidência.** A hipótese desta fase é que **há mais casos ainda não descobertos**, e que encontrá-los por acaso — que foi como os quatro apareceram — não é método. Esta fase os procura de propósito.

## METADE 1 — INVESTIGAÇÃO (read-only). É o produto principal desta fase.

**Nada é consertado aqui.** A entrega é uma **matriz de cobertura**, e ela é o insumo das fases seguintes.

Para **cada regra** de `specs/specs/00-regras-e-invariantes.md` (são 17), responder com `arquivo:linha`:

| Coluna | O que responder |
| --- | --- |
| **Regra** | o enunciado |
| **Gate** | qual script a cobra — ou **"nenhum"**, honestamente |
| **Escopo do gate** | quais diretórios/arquivos ele **de fato** varre (lido no código, não no comentário) |
| **Escopo da regra** | onde a regra **deveria** valer |
| **Δ (o vão)** | a diferença — e se ela é **declarada** ou **silenciosa** |
| **Exposição** | o que hoje vive dentro do vão (**medir, não estimar**) |

**A distinção que organiza tudo:** um limite **declarado** é honesto (o `auditor_hardcoded` tem "known limitations"; o `tagComparison` declara que só lê o MAJOR; o `check-release-tag` usa `caminho:tamanho` e é cego a mudança de mesmo tamanho). Um vão **silencioso** é o gate mentindo por omissão. **Só o segundo é defeito.**

**Cubra também os gates que não nascem de uma regra numerada:** `catalog:check`, `guide:check`, `dev-kit:check`, `package:check`, `audit:baseline`, os dois anéis do `pre-commit`/`pre-push`, e os gates-teste (`BarrelParity`, `ZeroBrand`, `tokenContractParity`, `shippedThemesConsoleClean`, `EmbeddedMode`, `scopeCss`). Para cada um, a mesma pergunta: **o que ele NÃO vê?**

**Cinco pistas concretas para começar** (não são a lista — são o ponto de partida):
- **Artefatos GERADOS que nenhum gate cruza contra a fonte.** O `design-token-ids.ts` era um. Há outros? (`src/core/Provider/manifest.ts`, `docs/component-catalog.*`, `sarak-ui/catalog.json`, `sarak-dev/state.json` — quais têm gate de frescor e quais dependem de alguém lembrar?)
- **Geradores não registrados.** `generate-token-types.ts` não está em `package.json`, hook nem `.agents/`. Varra `scripts/` inteiro: quais outros geram artefato versionado e **não** são invocados por nada?
- **Diretórios de `src/` que nenhum auditor varre.** Os auditores varrem `components`/`features`/`core`. E `styles/`, `shared/`, `effects/`, `constants/`, `types/`?
- **Prosa dentro de bloco gerado** — o achado 29 é um caso: o `dev-kit:check` verifica caminho, gate e comando, mas **não** referência de seção. Quantos outros ponteiros de prosa vivem fora de qualquer verificação?
- **Referência a SEÇÃO (`§N`) em comentário de código e em spec** — o achado **30** prova que a classe é reincidente e que a atenção humana não a pega: o conserto do P24 trocou um ponteiro morto por outro. **Varra `§` em todo `.ts`/`.mjs`/`.md` versionado e resolva cada um contra o heading real do arquivo-alvo.** É um detector barato e não existe.
- **Ponteiros de ONBOARDING** — o achado **31**: a rota `CLAUDE.md` → `.agents/index.md` → base de specs é **soft** (depende de a skill ser acionada pela description). Que outros caminhos de entrada dependem de convenção em vez de ponteiro duro?

**⇒ PARE. Relatório em texto com a matriz + os vãos ordenados por exposição medida. Aguarde aprovação.**

## METADE 2 — ROTEAMENTO (não necessariamente conserto)

Cada vão achado recebe **um** destino, e a decisão é do dono:

1. **Ampliar o gate** — quando a regra vale mesmo naquele escopo (ex.: `barrel:check` ganhando `engines/` no P26). ⚠️ **Ampliar escopo exige ampliar o registro junto** — o caso do `auditor_ghostvars`, que não lê `useDesignVariables.ts`: escopo maior com registro menor produz **acusação falsa**, que é pior que a lacuna.
2. **Declarar o limite** — quando ampliar custa mais do que vale. O limite entra **no código**, ao lado da implementação.
3. **Corrigir a regra** — quando o vão revela que a regra estava escrita larga demais para o que alguém pretende cobrar.

**Regra nova proposta para `00-regras-e-invariantes.md`** — e esta é a entrega que impede a quinta ocorrência:

> **R18 — Todo gate declara o que NÃO vê.** Um gate sem limite declarado é lido como cobertura total, e é assim que uma regra passa anos sendo violada dentro do vão do próprio verificador. Ao criar ou ampliar um gate, o escopo e as exclusões ficam escritos **no código do gate** e refletidos na spec de gates. Ampliar escopo sem ampliar o registro/allowlist correspondente é regressão, não melhoria.

**Spec a criar:** nenhuma. Atualiza `00-regras-e-invariantes.md` (R18 + a coluna "Cobrada por" onde a matriz corrigir) e `01-gates-e-baseline.md` (a matriz vira seção permanente).
**Aceite:** as 17 regras têm escopo de gate mapeado com `arquivo:linha`; todo vão está **declarado** ou **fechado**; e nenhum vão novo pode nascer silencioso, porque a R18 passa a cobrá-lo.
**Depende de:** nada. Mas **B, F e C dependem dela**.

---

# Fase B — Quitação do baseline de auditoria

**Problema.** `run_audit` não está em zero, e **nenhuma tarefa da Campanha 1 consertou isso** — ela documentou a dívida com precisão e não agendou pagamento. Baseline permanente deixa de ser dívida e vira norma.

**Escopo, item a item** (o detalhe com `arquivo:linha` está em `01-gates-e-baseline.md`):
- **Achado 1** — `--sx-*` vivo em `_utilities.css:80` e `:89` **+ ampliar o escopo do `auditor_ghostvars` para `src/styles/`** — as duas metades juntas, senão o conserto de um lado não é cobrado pelo outro. ⚠️ Ao ampliar o escopo, **ampliar o registro junto**: o auditor não lê `useDesignVariables.ts`, e escopo maior sem registro maior produz **acusação falsa**.
- `--sarak-button-radius` → o token real é `--sarak-btn-border-radius` (erro de grafia).
- `--sarak-shell-brand-logo-size` → não existe token nenhum: é **Expansão** (criar nas 3 fontes), não renomeação.
- `--token` → **NÃO corrigir.** É falso positivo dentro de um JSDoc; trocar a grafia do comentário baixaria o número sem consertar nada. É maquiagem, e a §9 a proíbe por escrito.
- `SarakTypography.tsx:39` → fallback negativo; a convenção é `calc(var(--token, <positivo>) * -1)`.
- **`tsc`: os 4 erros de PRODUÇÃO** (`useStructuralStyles.ts:30,71,94` — `ResponsiveValue<number>` recusado por um helper que só aceita `string|number`; `ThemeCustomizationTab.tsx:86` — união de tipo de toast). Os 10 de teste entram depois.
- **Achado 2** — `upgradeThemePayload(partialMode)`, parâmetro morto.
- **Os 7 ids de token duplicados**, no schema **e** no roteamento de persistência — 4 em duas colunas diferentes (ambiguidade real) e 3 repetidos na mesma coluna (redundância literal). São dois defeitos sob o mesmo sintoma; consertar muda **qual definição vence** em `getDefaultDesignState()`, então **exige caracterização antes**.

**Escopo adicional — as LACUNAS DE GATE (achados 13–16, 22–25).** São diferentes dos itens acima: ali o gate acusa e ninguém consertou; aqui **o gate não acusa**, e é o gate que precisa mudar.
- **Achado 13** — `src/shared/` fora do escopo do `auditor_coverage`: ampliar o escopo **e** escrever os testes que faltam — ampliar sem cobrir só troca verde por vermelho.
- **Achado 14** — criar o gate anti-acoplamento de auth, **ou registrar por escrito que ele não vai existir**.
- **Achado 15** — medir cobertura em %. Ou se mede e se declara o piso, ou se remove a dependência e se para de prometer.
- **Achado 16** — auditar os 5 sinks de `dangerouslySetInnerHTML` (`DesignScope:54`, `DesignInjector:173`, `SovereignThemeInjector:116`, `PreviewCanvas:181`, `MasterControlPanel:199`) — confirmar um por um que é CSS gerado pela engine, e não conteúdo que atravessa fronteira. Onde for legítimo, o motivo fica escrito ao lado.
- **Achado 22** 🔴 — regenerar `design-token-ids.ts` **e** registrar `generate-token-types.ts` num pipeline. **As duas metades, ou apodrece de novo.**
- **Achado 23** — `sarak-ui/templates/` fora de todo gate de conteúdo.
- **Achados 24 e 25** — higiene de superfície do scaffold (`mainTsx.mjs`, `context.mjs`).

**Spec a criar:** nenhuma. Atualiza `01-gates-e-baseline.md` (o baseline encolhe), `11-testes-e-cobertura.md`, `10-seguranca-e-acessibilidade.md` (os 5 sinks auditados) e `.githooks/audit-baseline.json` — via `npm run audit:baseline`, **junto do conserto que o justificou**, nunca sozinho.
**Aceite:** cada item fechado com o baseline regravado no mesmo commit; e o `--token` continua no baseline, com o motivo escrito.

---

# Fase F — Achados de comportamento

**Problema.** Cinco defeitos de comportamento que nenhum gate vê, achados ao escrever as specs da Fase 4. Nenhum é falha de documentação — são **o código fazendo coisa diferente do que promete**.

**Escopo, em ordem obrigatória:**

**F1 · `localStorage.clear()` — PRIMEIRO, e sozinho.** *(achado 8)*
`AdvancedTab.tsx:21` apaga a **origem inteira** do consumidor e recarrega a página, enquanto o `confirm()` promete "TODAS as configurações visuais". Token de sessão, preferências, carrinho — tudo o que o importador guardou naquela origem. Conserto: remover **apenas as chaves da lib** (o `storageKey` do Provider), e alinhar o texto do `confirm()` ao que de fato acontece.
Hoje é **inalcançável** — o `AdvancedTab` é importado (`CustomizationPanel.tsx:7`) e nunca renderizado. É por isso que adiar foi seguro; é por isso também que **não pode ser adiado mais uma vez** sem antes fechar F2.

**F2 · As abas inalcançáveis — decisão do dono, DEPOIS de F1.**
O `CustomizationPanel` importa 7 abas e renderiza 1 (`:3-9` × `:40`). As outras estão no bundle e fora de alcance. Restaurar a navegação **ativa** o `clear()` — daí a ordem. As opções: restaurar a navegação (depois de F1), ou remover os imports mortos (menos bundle, menos superfície).

**F3 · `isGlass` é ramo morto** *(achado 9)* que renderizaria nav nenhuma. Só é inalcançável porque `validateDesign` descarta o valor — ou seja, está protegido **por acidente**, não por desenho. Ou o ramo passa a funcionar, ou sai.

**F4 · `focusRingWidth` ignorado** *(achado 10)* pela regra global de foco. Token que existe, é validado, e não move nada — é um `--sx-*` com outra roupa: promessa sem emissor.

**F5 · Token de breakpoint move só 1 dos 3 caminhos** *(achado 11)* de responsividade. Trocar o token não muda o comportamento nos outros dois, o que quebra a promessa "breakpoints são tokens do tema".

**F6 · `SarakTable` sem opt-out de colapso mobile** *(achado 12)*, enquanto o `SarakDataTable` tem `responsive={false}`. Inconsistência de API entre dois componentes irmãos.

**Spec:** nenhuma nova. Atualiza `06-painel-de-customizacao-e-preview.md` (F1/F2), `07-responsividade-e-multidispositivo.md` (F5/F6), `04-shell-e-discovery.md` (F3) e `00-regras-e-invariantes.md` se F4 virar regra de token sem consumidor. **F1 e F6 exigem entrada em `docs/migracoes.md`** (mudam comportamento observável).
**Aceite:** F1 com teste que prova que **uma chave alheia sobrevive ao reset**; F5 com teste nos três caminhos; e cada item com o gate que passaria a pegá-lo, ou a declaração de que nenhum pega.

---

# Fase C — Limpeza do contrato público → `2.0.0` *(decisão D12)*

**Problema.** Três quebras de contrato estão paradas porque cada uma, sozinha, custaria uma migração ao consumidor.

**Escopo — as três saem juntas, num único major:**
- **`CustomizationPanel` lazy** *(achado 3)*. Hoje sai *eager* do barril (`src/index.ts:50`) e ainda é importado eager pelo efeito colateral de `:119-125` — é o painel inteiro do Design Engine no caminho crítico de todo consumidor. Tornar lazy muda o tipo público para `LazyExoticComponent`.
- **Dedup do `SarakTabs`.** Dois componentes, mesmo nome, APIs incompatíveis (`items`/`defaultActiveId` × `tabs`/`activeTab`/`onChange`). Exige decidir qual API sobrevive.
- **Os 2 ids legados do Discovery** (`mx-customization`, `personalization`), registrados por efeito colateral de import: manter ou remover.
- **Achado 27** — `chromeSlots` contando 9 para 8 regiões: resolver o alias legado `topbarActions` junto.

**Specs:** atualiza `arquitetura/03-superficie-publica.md` (as três dívidas da §8 morrem) e **exige uma entrada única em `docs/migracoes.md`** cobrindo as três, com antes/depois e como migrar. Avalie se a decisão de API do `SarakTabs` merece **ADR** — se sobreviver uma e morrer outra, sim.
**Aceite:** `npm version major` → `2.0.0` com uma nota de migração só; e o consumidor atravessa o major uma vez, não três.
⚠️ **Revalidação do ERP é OBRIGATÓRIA aqui** (decisão **D13**) — é a única fase que quebra contrato público de propósito, e o ERP é o único consumidor real. Reuse o protocolo do P28: diagnóstico read-only → relatório em texto → aprovação do dono → execução. **Um major que não foi provado no consumidor real é um major que ninguém sabe se migra.**

---

# Fase D — Ciclo de atualização do consumidor *(decisão D11)*

**Problema.** O consumidor é avisado de que há versão nova (`sarak-ui check`), mas não tem comando para agir. Dentro da faixa ele descobre sozinho que é `npm update`; **atravessar um major** exige editar o `package.json` à mão, sem ninguém dizer o que quebra.

**Escopo:**
- `sarak-ui update` — atualiza **dentro da faixa**, com o comando do gerenciador detectado. ⚠️ Regra herdada: **comando não executado de verdade não entra.**
- `sarak-ui update --latest` — **ATRAVESSA o major**: mostra quantos majors pula, imprime as entradas de `docs/migracoes.md` **entre a versão instalada e a nova**, pede confirmação e só então reescreve a faixa no `package.json`. O caminho seguro é um comando; o caminho que quebra é um comando **com o que quebra na tela**.
- **Corrigir o filtro de faixa** (`tagComparison.mjs:54-59`): hoje lê só o MAJOR, então `~1.2.0` é tratado como `^1.2.0` e o consumidor recebe aviso de um `v1.9.0` que o `npm update` nunca vai lhe dar — aviso permanente, exatamente o ruído que o comando existe para combater. Capturar o minor e filtrar por major+minor quando a faixa for `~`. Corrigir também o rótulo que imprime `(^N)` para quem escreveu `~`.
- ⚠️ **Sobreposição com a Fase 0.6:** o fio do `predev` no ERP é da Fase 0; esta fase revisita **se o comando mudar**.

**Specs:** atualiza `13-instalacao-e-atualizacao.md` e o `sarak-ui/GUIA-FRONTEND.md` §2.7.
**Aceite:** provado num consumidor real de cada gerenciador — dentro da faixa e atravessando um major, com a nota de migração aparecendo antes da confirmação.

---

# Fase E — E2E no pipeline

**Problema.** Playwright CT está instalado (`npm run test-ct`) e existem specs em `src/core/Provider/__e2e__/` e `src/features/DesignEngine/__e2e__/` — **nada disso roda em automação nenhuma**, e algumas exigem `npm run build` antes.

**Escopo.** Levar E2E para a CI da Fase A (é o único lugar onde o `build` prévio não atrapalha, porque lá a árvore é descartável). Definir quais jornadas são bloqueantes e quais são informativas.

**Escopo adicional:**
- **Achado 17** — `playwright.config.ts:7` aponta `testDir: './e2e'` e **a pasta NÃO EXISTE**. Hoje `playwright test` sai verde sem rodar nada — **o pior tipo de verde**, porque é indistinguível de sucesso. Corrigir o `testDir` é a **primeira linha desta fase**, antes de qualquer jornada nova.
- **Achado 18** — contraste WCAG AA não é medido em lugar nenhum. Ou entra medição real (axe-core na CI, sobre o conjunto atômico) ou a promessa de nível AA sai do texto. **A lib não pode prometer o que não mede** — e prometer sem medir é a mesma classe de defeito do gate de auth que nunca existiu (achado 14).
- **Achado 26** — o `install` real e o `check --notify` no `predev`.

**Spec:** atualiza `11-testes-e-cobertura.md`, `10-seguranca-e-acessibilidade.md` e `15-integracao-continua.md`.
**Aceite:** o não-vazamento do modo embarcado — hoje só verificável à mão — passa a ser cobrado a cada PR; e `playwright test` deixa de sair verde sem executar nada.
**Depende de:** Fase A.
