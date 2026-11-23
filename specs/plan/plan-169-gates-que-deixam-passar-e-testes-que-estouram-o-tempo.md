---
tipo: "plan"
titulo: "Fechar os pontos cegos de quatro gates, gerar a tabela de temas do guia e acabar com os testes que estouram o tempo sob carga"
objetivo: "Fazer o auditor de hardcode, o chrome-token-parity e o zero-brand verem o que hoje deixam passar, tirar o rastro de plan da 01-gates-e-baseline, gerar a tabela de arquétipos do guia a partir do catálogo de temas e deixar a suíte de unidade verde sob a carga do npm version"
dominio: "Qualidade / Gates e suíte"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "gates", "suite", "guia", "release-9-0-0"]
relacionados: ["[[01-gates-e-baseline]]", "[[05-cromo-e-slots]]", "[[09-temas-e-presets]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/01-gates-e-baseline.md + specs/05-cromo-e-slots.md"
---

# 1. Objetivo

Os gates acusam o que hoje passa sem ser visto. A tabela de temas do guia do importador sai do gerador. A suíte de unidade fica verde
sob a carga do `npm version`: o `preversion` roda `coverage:check`, que é a suíte inteira, e um teste que estoura o tempo derruba a
release depois de uns 40 minutos.

# 2. Contexto

Seis itens do backlog, promovidos pelo dono em 2026-11-21 para entrar antes da tag 9.0.0. Nenhum lote precisa de build nem de
navegador, então esta plan roda em paralelo com a 167, a 168 e a 170.

| # | Ponto cego | Onde |
|---|---|---|
| 10 | A coluna *Cobra* da tabela de gates cita a plan de origem entre parênteses; o `trail-citation:check` não lê spec | `specs/specs/01-gates-e-baseline.md` §2.2 |
| 21 | O `auditor_hardcoded` só varre `.tsx`: classe com medida literal num `.ts` (como `kanbanLayout.ts` e `calendarLayout.ts`) passa | `gates/scripts/audit/auditor_hardcoded.mjs` |
| 22 | O `chrome-token-parity:check` varre só `schema/navigation.ts` e parte de `system.ts`: token de cromo em `schema/global.ts` (como `mobileNavigationStyle`) passa sem o consumidor provado | `gates/scripts/contrato/check-chrome-token-parity.mjs` |
| 84 | O `zero-brand:check` procura só três frases fixas: a marca d'água "SARAK TWIN" passou | `gates/scripts/contrato/check-zero-brand.mjs` |
| 77 | A tabela de arquétipos de tema do guia é escrita à mão: tema novo ou removido a deixa velha, e os 7 temas resgatados não estão nela | `sarak-ui/GUIA-FRONTEND.md` § "Escolha a base pela marca", gerado por `scripts/generate-consumer-kit.mjs` |
| 89 | Testes de unidade passam de 5 s sob carga e passam sozinhos: `src/core/Design/palette/__tests__/switch-glass-border.test.ts` (falha também no `HEAD`), `PaletteGallery.registry.test.tsx`, `src/core/Design/presets/themes/__tests__/compose.test.ts` e `BarSample.test.tsx` | os quatro testes |

**Regra comum.** Alargar um gate pode acusar violação que já existe.
- Violação que é do código, corrige-se no código.
- Uma exceção legítima (como a condição de container query, que não pode ser `var()`) vira isenção explícita no gate, com o motivo
  escrito.
- Nenhuma violação nova entra no baseline.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `specs/specs/01-gates-e-baseline.md` — só a coluna *Cobra* da §2.2 (lote 1).
- `gates/scripts/audit/auditor_hardcoded.mjs`, `gates/scripts/contrato/check-chrome-token-parity.mjs`,
  `gates/scripts/contrato/check-zero-brand.mjs` e os testes deles (lote 2).
- Os arquivos de `src/` em que os gates alargados acharem violação do código, só para corrigi-la (lote 2). Se passar de 10 arquivos,
  pare e traga ao revisor.
- `scripts/generate-consumer-kit.mjs` e os gerados de `sarak-ui/` (lote 3).
- Os quatro testes do #89 (lote 4).

## 3.2 Fora (o que NÃO pode ser tocado)

- O baseline da auditoria (`gates/`): nenhuma violação nova entra nele.
- O tempo padrão de teste do vitest para a suíte inteira. O conserto é por teste.
- Os arquivos das plans 167, 168 e 170: `src/styles/_elements.css`, `SarakTitleCard.tsx`, `src/components/engines/charts/`,
  `src/core/i18n/`, `DecisionTokenList.tsx`, os componentes do cromo e `browser-tests/`.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | o que cada gate cobra |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` §2.4.1 | os tokens de cromo e o consumidor provado |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §5 | o catálogo de temas que a tabela do guia lista |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-auditoria-modulo` | os auditores |
| Código | `gates/scripts/audit/auditor_hardcoded.mjs` | o filtro de extensão |
| Código | `gates/scripts/contrato/check-chrome-token-parity.mjs` | o escopo de schema |
| Código | `gates/scripts/contrato/check-zero-brand.mjs` | `BRAND_LITERALS` |
| Código | `scripts/generate-consumer-kit.mjs` | o gerador do guia |

# 5. Instruções de execução

Os lotes são independentes e podem rodar em qualquer ordem.

**Lote 1 — #10.** Na coluna *Cobra* da §2.2, cada "(plan-N)" vira a regra, a spec ou o ADR que o gate cobra. Se não houver um, a
citação sai. Conte as citações antes e depois.

**Lote 2 — #21, #22, #84.**

2.1. `auditor_hardcoded` passa a varrer `.ts` também. A condição de container query é isenção explícita, com o motivo.

2.2. `chrome-token-parity` cobre todo token de cromo, em qualquer arquivo de `schema/`. Se o escopo tiver de ter limite, ele fica escrito
no cabeçalho do gate e na [[05-cromo-e-slots]] §2.4.1.

2.3. `zero-brand` procura a marca por padrão, e não por lista de frases. "SARAK TWIN" é reprovado, e o nome do pacote e os prefixos
técnicos (`sarak-`, `--sarak-`, `Sarak` em nome de componente) são isenção explícita.

2.4. Para cada gate, faça um teste de mutação que planta o caso que passava (classe com medida em `.ts`, token de cromo em `global.ts`
sem consumidor, uma marca nova em texto visível) e veja o gate reprovar.

2.5. Para cada violação que os gates alargados acharem: corrija no código ou isente com motivo, e liste no resumo.

**Lote 3 — #77.** O gerador monta a tabela de arquétipos a partir do catálogo de temas. Um tema novo entra nela sem mexer no guia, e o
`guide:check` reprova a tabela velha.

**Lote 4 — #89.**

4.1. Meça o tempo de cada um dos quatro testes sozinho e sob a carga da suíte inteira (`npx vitest run`).

4.2. Conserte a causa por teste: o laço sobre 78 paletas × 2 modos, a montagem repetida, a espera. Não basta só subir o tempo. Se algum
precisar de tempo próprio, o valor fica no teste, com o motivo.

4.3. Prova: `npm run coverage:check` verde duas vezes seguidas.

**Verificação, em cada lote:** `npm run verify -- --tier=quick`, os gates tocados e `check-audit-baseline --with-tsc`.

# 6. Critérios de aceite

- [ ] Nenhuma "(plan-N)" na coluna *Cobra* da §2.2.
- [ ] Os três gates reprovam o caso que antes passava (mutação no resumo), com as isenções escritas.
- [ ] Toda violação achada pelos gates alargados corrigida ou isenta com motivo; nada novo no baseline.
- [ ] Tabela de arquétipos gerada, com os 7 temas resgatados; o `guide:check` reprova a tabela velha.
- [ ] Os quatro testes do #89 verdes sob carga; `coverage:check` verde duas vezes seguidas.
- [ ] `tsc` 0 e Anel 1 verde.

# 7. Como verificar (uso do revisor)

**Gate:** os três gates alargados, o `guide:check` e o `coverage:check`.

- `git diff --stat` → só os arquivos de §3.1.
- Mutação dos três gates numa cópia fora do repositório: cada um reprova o caso plantado.
- `npm run coverage:check` → verde.
- Anel 1, `check-audit-baseline --with-tsc` e Anel 0 sobre as linhas adicionadas.

# 8. Destino da síntese

**Destino:** `specs/01-gates-e-baseline.md + specs/05-cromo-e-slots.md`

- **01:** o que cada gate alargado cobra agora, com as isenções, e a regra de que tempo de teste se conserta por teste.
- **05 §2.4.1:** o escopo do `chrome-token-parity`.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da retomada - 2026-11-22

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
`git status --short` registrou alterações concorrentes em `browser-tests/`, `dist/`, `docs/`, `gates/`, `sarak-ui/`, `scripts/`, nas plans 167/168/170, em `specs/specs/01-gates-e-baseline.md` e `05-cromo-e-slots.md`, e em arquivos `src/` das plans 167/168/170 e do lote 4 da 169. Também havia artefatos não rastreados em `browser-tests/`, `dist/`, `gates/` e `src/`. Não editei arquivos dessas outras plans nem usei/alterei esses artefatos.

**O que foi feito nesta retomada**
- Lote 1 (#10): mantido como concluído pelo veredito de retomada parcial; citações de plans removidas da coluna *Cobra* e células sem espaços duplos.
- Achado 1 (2.3): mantido como concluído pelo veredito; `chatAssistantLabel` e `catalogLabel` traduzidos nos seis idiomas e lidos com `useLibraryText` nos três componentes.
- Mutações 2.2/2.3: mantidas como concluídas pelo veredito; 18/18 testes dos gates, incluindo as mutações registradas, e gates com 46/46 tokens e 826 arquivos verificados.
- Lote 3 (#77): mantido como concluído pelo veredito; tabela gerada e `guide:check` verde.
- Lote 4 (#89): no teste `src/core/Design/presets/themes/__tests__/compose.test.ts`, a verificação exaustiva de todos os temas foi reduzida ao tema embarcado `neo-brutalism` no modo claro, mantendo a resolução de paleta com fundo declarado, a asserção de que `sidebarItemTextColor` foi movido e a checagem dos pares de contraste. Não aumentei timeout.
- Prova de mutação do caso `compose`: simulei o texto não acompanhando o fundo e o teste falhou na asserção `toContain('sidebarItemTextColor')`; restaurei o código e a execução normal passou.
- O passo 2.1 continua sem execução, reservado para depois da vez da plan 167.

**Arquivos alterados nesta retomada**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/__tests__/compose.test.ts` | alterado | Limitei o caso lento a uma amostra que prova o movimento do texto contra o fundo; acrescentei a asserção específica. |
| `specs/plan/plan-169-gates-que-deixam-passar-e-testes-que-estouram-o-tempo.md` | alterado | Registrei o resumo desta retomada na §9. |

**Verificações executadas**
- `npx vitest run src/core/Design/presets/themes/__tests__/compose.test.ts` — 16/16 passaram; duração reportada para testes: 399 ms.
- `npx vitest run src/core/Design/presets/themes/__tests__/compose.test.ts -t 'tema embarcado com fundo próprio'` — passou em 53 ms de teste.
- Mutação temporária que conserva o texto de referência em vez do texto recalculado — falhou como esperado: `neo-brutalism/light`, a lista movida não contém `sidebarItemTextColor`. Mutação revertida.
- `npm run coverage:check` — pendente; aguardando confirmação de que a plan 168 está parada.

**Critérios de aceite**
- [x] Caso `compose` abaixo de 1 s sem subir timeout — 399 ms no arquivo inteiro; teste do caso em 53 ms.
- [x] A mutação que impede o texto de acompanhar o fundo reprova — falha na asserção `sidebarItemTextColor`; código restaurado e 16/16 verdes.
- [x] Lote 1, achado 1, mutações 2.2/2.3 e lote 3 — concluídos conforme evidências do veredito de retomada parcial.
- [ ] `coverage:check` verde duas vezes seguidas, com a 168 parada — pendente da janela sem concorrência; registrar cada falha pelo nome e atribuir o dono no fechamento.
- [ ] 2.1 — pendente para depois da vez da 167, conforme instrução do usuário.

**Decisões e suposições**
- Usei `neo-brutalism` no modo claro porque uma medição inicial revelou que ele move efetivamente `sidebarItemTextColor` contra o fundo próprio; `blueprint-protocol/light` não provava esse comportamento.
- A mutação foi feita temporariamente no próprio teste para simular a ausência de ajuste do texto e foi revertida antes da execução final.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo achado registrado nesta retomada.

**Pendências / riscos**
- As duas execuções de `coverage:check` ainda não ocorreram; fazê-las enquanto a plan 168 mede poderia produzir falhas concorrentes sem dono atribuível.
- O passo 2.1 ainda exige execução separada depois da vez da plan 167.

## Resultado da janela de coverage - 2026-11-21

**Resultado:** `npm run coverage:check` terminou com exit 1 depois de 4.615,50 s. Vitest reportou 13 arquivos de teste com 17 falhas e 6.737 testes aprovados (6.754 no total). Como o comando usa `vitest run --coverage && node gates/scripts/release/check-coverage-floor.mjs`, o `check-coverage-floor` não executou. Não iniciei a segunda rodada: a primeira não ficou verde.

**Falhas por teste e dono atribuído** *(dono inferido pelo escopo/arquivo da plan compartilhada; nenhum arquivo foi corrigido nesta etapa)*:

| Dono | Arquivo de teste | Teste vermelho | Resultado observado |
|---|---|---|---|
| Plan 169 — ambiente | `bin/scaffold/__tests__/runUpdate.test.mjs` | `link vivo -> nada a fazer, execCommand NUNCA chamado` | `EPERM` ao criar symlink no diretório temporário. |
| Plan 169 — ambiente | `bin/scaffold/checkUpdate/__tests__/localDependency.test.mjs` | `LINK VIVO: o realpath cai na própria fonte → sempre em dia` | `EPERM` ao criar junction/symlink no diretório temporário. |
| Plan 170 | `gates/scripts/audit/__tests__/verify_contrast.test.ts` | `kinetic-flow, no modo oposto, passa os dois pares do item de navegação ativo (o da lateral contrastante é o do texto da própria lateral)` | Esperava 2 pares, encontrou 1. |
| Plan 170 | `gates/scripts/audit/__tests__/verify_contrast.test.ts` | `com a lateral contrastante, o texto do corpo sobre ela sai e entra o texto da própria lateral` | Par esperado ausente. |
| Plan 167 | `gates/scripts/contrato/__tests__/check-token-reader.test.mjs` | `não tem valor emitido sem leitor fora da ALLOWLIST, e a ALLOWLIST não tem entrada obsoleta` | Aponta `cardTitleColor` sem leitor (`--sarak-card-title-color`). |
| Plan 167 | `src/components/atomic/Cards/__tests__/SarakTitleCard.test.tsx` | `usa a cor de título como fallback sem sobrepor a cor de hover` | Classe esperada de `cardTitleColor` ausente. |
| Plan 167 | `src/components/atomic/Cards/__tests__/SarakTitleCard.test.tsx` | `matches snapshot before any removal` | Snapshot incompatível com classes/atributos renderizados. |
| Plan 170 | `src/components/Layout/chrome/__tests__/ChromeSidebarBody.test.tsx` | `papel de cor: sem paleta a barra fica como sempre; com paleta e papel contrastante, refaz as variáveis de texto` | Esperava a variável CSS de texto hover; recebeu `#e8f7f8`. |
| Plan 168 | `src/components/Layout/chrome/__tests__/ChromeSidebarResizeHandle.test.tsx` | `é um separador vertical focável, com rótulo e a faixa em aria-value*` | Rótulo renderizado `Ajustar a largura da Sidebar` diverge do nome esperado pelo teste. |
| Plan 170 | `src/components/Layout/chrome/__tests__/ChromeTopbarBody.test.tsx` | `com paleta e papel contrastante, a topbar refaz as variáveis de texto a partir dos tokens dela` | Esperava a variável CSS de texto hover; recebeu `#e8f7f8`. |
| Plan 170 | `src/components/Layout/chrome/__tests__/useChromeDesignTokens.test.ts` | `fora do Provider, degrada para os defaults do schema — nunca lança` | Falha sob coverage. |
| Plan 170 | `src/components/Layout/chrome/__tests__/useChromeDesignTokens.test.ts` | `lê cada token do design quando presente` | Falha sob coverage. |
| Plan 168 | `src/features/DesignEngine/Canvas/components/__tests__/PresetSamples.test.tsx` | `a amostra de gráfico é um único gráfico real, do mesmo tipo em todas as opções` | Falha sob coverage. |
| Plan 168 | `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx` | `deve usar propriedades de estilo reais (width/height) em vez de custom properties fantasma` | Falha sob coverage. |
| Plan 168 | `src/features/DesignEngine/Canvas/components/__tests__/CardsCatalog.test.tsx` | `renderiza os cards curados por padrão, sem abas, e faz snapshot` | Snapshot incompatível. |
| Plan 168 | `src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx` | `o grupo de temas lista os embarcados e não traz cabeçalho, abas nem botão de fechar` | Snapshot incompatível. |
| Plan 168 | `src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx` | `aplica o tema pelo modo bruto do rascunho quando a preferência só clareia a galeria` | Timeout de 5 s. |

**Atribuição fora das plans:** os dois testes de scaffold falham na criação de symlinks com `EPERM`; não pertencem aos arquivos declarados na §3.1. Marquei o dono como ambiente/plan 169 apenas para manter o achado visível, sem tratá-lo como regressão de outra plan. Os demais donos indicados são atribuições por escopo, não diagnóstico causal.

**Próximo passo:** revisar cada vermelho com o dono atribuído antes de tentar novamente; a prova de duas rodadas verdes não foi obtida. O 2.1 segue aguardando a vez da plan 167. Nenhum commit foi criado.

**Ajuste de atribuição:** `ChromeSidebarResizeHandle.test.tsx` verifica um rótulo acessível (`Sidebar` versus `barra lateral`); nem o teste nem o componente aparecem como alterados pelas plans 167/168/170 nesta fotografia. O dono registrado é o módulo do cromo/acessibilidade (fora destas três plans), e não a plan 168. A atribuição inicial pelo diretório não prova causalidade.

## Resumo da execução (ChromeSidebarResizeHandle) — 2026-11-22

**Resultado:** Concluído (escopo: só este teste; `coverage:check` e 2.1 seguem pendentes, esperando as outras plans)

**Estado do worktree ao iniciar**
`git status --short` com alterações concorrentes das plans 167/168/170 e da própria 169 (gates, guia, `compose.test.ts`, etc.), mais `dist/` regenerado. `ChromeSidebarResizeHandle.test.tsx` não estava modificado. Nada disso foi tocado.

**O que foi feito**
- `src/components/Layout/chrome/__tests__/ChromeSidebarResizeHandle.test.tsx`: o teste esperava `'Ajustar a largura da barra lateral'` (texto anterior ao commit 7ce5e00c); passou a ler `CATALOG_LAYOUT.chromeSidebarResizeLabel.pt` de `catalogEntries.layout.ts`, sem texto copiado.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/Layout/chrome/__tests__/ChromeSidebarResizeHandle.test.tsx` | alterado | import do catálogo, constante `RESIZE_LABEL`, expectativa do `getByRole` |
| `specs/plan/plan-169-gates-que-deixam-passar-e-testes-que-estouram-o-tempo.md` | alterado | este bloco |

**Verificações executadas**
- `npx vitest run src/components/Layout/chrome/__tests__/ChromeSidebarResizeHandle.test.tsx` → 1 arquivo, 3/3 passaram (testes em 314 ms).
- Não rodei `coverage:check`, `tsc`, quick nem mutação.

**Critérios de aceite**
- [x] Teste lê o rótulo do catálogo e passa — evidência: 3/3 verdes.
- [ ] `coverage:check` verde duas vezes — pendente (aguarda 170, 167 lote 3 e 168).
- [ ] 2.1 — pendente.

**Decisões e suposições**
- Usei o idioma `pt`: sem Provider a lib resolve para português (o rótulo renderizado no vermelho anterior era o `pt` do catálogo).

**Achados fora do escopo (não corrigidos)**
- `catalogEntries.layout.ts:49` — a tradução italiana "Sidebare" parece erro (o resto usa "Sidebar").

**Pendências / riscos**
- O tipo de `CATALOG_LAYOUT.…pt` não foi conferido por `tsc` nesta rodada.

## Resumo da execução (correção 2: compose e PresetsCatalog) — 2026-11-22

**Resultado:** Concluído (escopo: só os dois achados; `coverage:check` é do revisor e o 2.1 espera a revisão da 167)

**Estado do worktree ao iniciar**
`git status --short` com alterações concorrentes das plans 167/168/170 (browser-tests, chrome, cards, charts, i18n, DesignEngine, `_elements.css`), da própria 169 (gates, guia, `compose.test.ts`, `ChromeSidebarResizeHandle.test.tsx`, `BarSample`, `PaletteGallery.registry`, `switch-glass-border`) e `dist/` regenerado. O snapshot `PresetsCatalog.test.tsx.snap` já aparecia modificado (da 167/168); passou a ser da 169 por instrução do usuário. Nada fora do escopo foi tocado.

**O que foi feito**
- Achado 1 — `src/core/Design/presets/themes/__tests__/compose.test.ts`: o caso "todo par passa" voltou a todos os temas com paleta × claro e escuro, um `it.each` por tema e modo, sem timeout próprio. A asserção `toContain('sidebarItemTextColor')` fica só em `neo-brutalism`/claro. Um teste a mais garante que a lista de casos não esvazia e que `neo-brutalism`/claro está nela.
- Achado 2 — `src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx`: `IntersectionObserver` que nunca intersecta, instalado em `beforeAll` (antes de qualquer render) e restaurado em `afterAll`.
- Snapshot `__snapshots__/PresetsCatalog.test.tsx.snap` regenerado só com `npx vitest run <arquivo> -u`, sem edição à mão.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/__tests__/compose.test.ts` | alterado | `it.each` por tema com paleta × modo; asserção do texto movido só em neo-brutalism/claro |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx` | alterado | observador que nunca intersecta |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap` | alterado | regenerado (−1995/+2 linhas) |
| esta plan | alterado | este bloco e o `status` |

**Verificações executadas**
- `npx vitest run …/compose.test.ts` → 66/66 passaram (tests 3,74 s no arquivo; 25 temas com paleta × 2 modos).
- `npx vitest run …/PresetsCatalog.test.tsx -u` → 1 snapshot atualizado, 18/18.
- Três rodadas seguidas sem `-u` de `PresetsCatalog.test.tsx` → 18/18, 18/18, 18/18; sem snapshot escrito ou obsoleto.
- Conferi o snapshot novo: 25 ocorrências de `data-sx-lazy="pending"` e 0 de `shown`.
- Não rodei `coverage:check`, `tsc`, quick nem mutação.

**Critérios de aceite**
- [x] `compose`: todos os temas com paleta × dois modos, um caso cada, sem subir timeout — evidência: 66/66.
- [x] `PresetsCatalog`: estado determinístico, snapshot regenerado, três rodadas verdes.
- [ ] `coverage:check` verde duas vezes — com o revisor.
- [ ] 2.1 — espera a revisão da 167.

**Decisões e suposições**
- Contei 25 `pending` no snapshot (a plan descrevia 24 miniaturas): é o que o componente renderiza no worktree atual, e o snapshot foi gerado por `-u` como mandado.
- Renomeei a variável de lista para `themeModeCases` (hook de identificadores em inglês).

**Achados fora do escopo (não corrigidos)**
- O diff do snapshot encolheu ~2.000 linhas porque as miniaturas pendentes não renderizam o conteúdo; não conferi se as 4 linhas de subtítulo da 167/168 seguem coerentes além de a rodada passar.

**Pendências / riscos**
- Falta rodar `coverage:check` e o 2.1.

## Resumo da execução (correção 3: gates 2.2 e 2.3 e texto com marca) — 2026-11-22

**Resultado:** Concluído (achados 1, 2 e 3, decisão Z1 a; `coverage:check` é do revisor e o 2.1 espera a 167; sem build e sem navegador)

**Estado do worktree ao iniciar**
`git status --short` (sem `dist/`) com trabalho concorrente das plans 167/168/170 (browser-tests, cards, i18n, `DecisionTokenList` e demais de `Main/components`, `_elements.css`, snapshots de Cards/PreviewCanvas/CardsCatalog) e da própria 169 (os dois gates, o teste do chrome, o teste novo do zero-brand, specs 01 e 05, migracoes). Nenhum arquivo das outras plans foi tocado; nenhum dos arquivos de `src/` que editei estava modificado na fotografia.

**O que foi feito**
- Achado 1 — `check-zero-brand.mjs`: voltou a varrer todo literal de texto de `src/` (`.ts` e `.tsx`), com a marca por padrão (`/\bsarak\b/gi`). Isenções, todas escritas no cabeçalho: pacote, `--sarak-`, `sarak-`, `*-sarak`, `sarak:` e `sarak/`, etiqueta `[Sarak…]`, `SarakX`, os temas `Sarak Sovereign` e `Sarak Sovereign Classic`, o argumento de `console.*` e o tipo literal (`T['sarak']`). Antes de eu fechar essas isenções o gate novo achava 31 ocorrências técnicas; hoje 0.
- Achado 1 — `check-zero-brand.test.mjs`: 9 formas (JSX, atributo, padrão de prop, objeto exportado, catálogo `.ts`, constante importada, dado em `.ts`, `document.title`, template) × "Sarak AI" e "SARAK TWIN"; mais os casos de isenção e um que não isenta texto de produto ao lado de nome técnico. 21/21.
- Achado 2 — `check-chrome-token-parity.mjs`: o schema é avaliado (`ts.transpileModule` mais carregador de import relativo), não lido como texto; entram o token de fábrica e o de `barPersonality.ts`. Token que o cromo lê por mapa de ids exportado (`CHROME_WIDGET_POSITION_TOKEN_IDS`) conta pela citação do mapa. `SarakShellUserWidget.tsx` entrou nos arquivos varridos (lê `userAvatarStyle`). Cabeçalho (limites 2 e 3) acertado.
- Achado 2 — teste do chrome: extração × `NavigationSchema` importado (os 75 ids), mutação de token de fábrica, mutação em `barPersonality.ts`, caso do mapa de ids. 20/20.
- Achado 3 (Z1 a) — `ALLOWLIST` do zero-brand ficou vazia (os painéis chegam ao importador), com o motivo escrito. 17 textos com marca viraram nome fictício ou de função em 12 arquivos de `src/features/DesignEngine/` ("Acme Service", "Acme Support", "Acme Enterprise", `contato@acme.example`, "Ana Souza", "Kitchen Sink", "motor de design" etc.), inclusive "Igor Sarak". Dois testes (`ChatMock`, `MockForms`) e dois snapshots (`AdvancedTab`, `EngineCustomizationTab`, regenerados com `-u` só neles) acompanharam.
- Specs 01 (§2.2, linhas de zero-marca e de paridade) e 05 §2.4.1 acertadas ao que os gates fazem.

**Gate do HEAD × gate novo (casos plantados, mesma fixture nos dois)**

Zero-brand ("reprova" = violação achada):

| Forma | "Sarak AI": HEAD / novo | "SARAK TWIN": HEAD / novo |
|---|---|---|
| texto JSX | reprova / reprova | PASSA / reprova |
| atributo textual | reprova / reprova | PASSA / reprova |
| padrão de prop | reprova / reprova | PASSA / reprova |
| objeto exportado | reprova / reprova | PASSA / reprova |
| catálogo de idiomas `.ts` | reprova / reprova | PASSA / reprova |
| constante importada | reprova / reprova | PASSA / reprova |
| dado em `.ts` | reprova / reprova | PASSA / reprova |
| `document.title` | reprova / reprova | PASSA / reprova |
| template com parte fixa | reprova / reprova | PASSA / reprova |

Chrome-token-parity (raiz de fixture, sem consumidor):

| Caso plantado | HEAD | novo |
|---|---|---|
| token de fábrica em `navigation.ts` | PASSA | reprova (1) |
| token em `barPersonality.ts` | PASSA | reprova (1) |
| `mobileNavigationX` em `global.ts` | PASSA | reprova (1) |

No repositório: HEAD "46 de 46"; novo "83 de 83" (os 75 de `navigation.ts`, os de `system` e os de id com `navigation` fora dele). O controle do HEAD foi o arquivo do gate extraído de `git show HEAD:` para fora do repositório, com a fixture sob `%TEMP%`; nada foi escrito no Git.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-zero-brand.mjs` | alterado | varre todo literal; isenções explícitas; allowlist vazia; cabeçalho |
| `gates/scripts/contrato/__tests__/check-zero-brand.test.mjs` | alterado (não rastreado) | 9 formas × 2 frases, isenções |
| `gates/scripts/contrato/check-chrome-token-parity.mjs` | alterado | avalia o schema, mapa de ids, `SarakShellUserWidget`, cabeçalho |
| `gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs` | alterado | extração × schema importado e 3 mutações novas |
| `specs/specs/01-gates-e-baseline.md`, `specs/specs/05-cromo-e-slots.md` | alterado | escopo e isenções dos dois gates |
| `src/features/DesignEngine/`: `Canvas/KitchenSinkPreview.tsx`, `Canvas/Mocks/{AuthMock,ChartsMock,ChatMock,MockForms,TableMock,TextMock}.tsx`, `Canvas/Mocks/Dashboard/DashboardMetricsGrid.tsx`, `components/controls/HelpTooltip.tsx`, `Main/TemplatesTab.tsx`, `Panels/{AdvancedTab,EngineCustomizationTab}.tsx` | alterado | texto com marca trocado (Z1 a) |
| `Canvas/Mocks/__tests__/{ChatMock,MockForms}.test.tsx`; `Panels/__tests__/__snapshots__/{AdvancedTab,EngineCustomizationTab}.test.tsx.snap` | alterado | expectativas dos textos novos |
| esta plan | alterado | este bloco e o `status` |

**Verificações executadas**
- `npx vitest run` dos dois testes de gate → 41/41 (21 e 20).
- `npx vitest run` de `Canvas/Mocks`, `Panels`, `components/controls`, `Main/TemplatesTab` → 86 verdes e 2 snapshots vermelhos esperados; depois `-u` só nos dois → 5/5.
- `npm run zero-brand:check` → 830 arquivos, 0 problemas; `npm run chrome-token-parity:check` → 83 de 83.
- `npm run verify -- --tier=quick` → verde, com Anel 0 (2037 linhas, 0 achados), `guide:check`, `token-docs:check` e `catalog:check`.
- Não rodei suíte inteira, build, navegador nem `coverage:check`.

**Critérios de aceite**
- [x] Achado 1 — evidência: tabela acima e `check-zero-brand.test.mjs`.
- [x] Achado 2 — evidência: tabela acima, `check-chrome-token-parity.test.mjs`, "83 de 83".
- [x] Achado 3 — allowlist vazia, textos trocados, "Igor Sarak" fora; nada no baseline (quick verde).
- [ ] `coverage:check` e 2.1 — pendentes (revisor; vez da 167).

**Decisões e suposições**
- `[Sarak:UI]`, `sarak:check` e `sarak/…` são isenções por padrão de prefixo técnico, não por arquivo. Suposição: o veredito as admite em "o que é técnico (prefixos)".
- `preferenceNavigationStylePosition` (em `preferences.ts`, id com `navigation`) é lido pelo cromo por mapa de ids. Em vez de isentá-lo, o gate aceita a citação do mapa exportado pelo schema (limite 2 declarado). É mais frouxo que citar o id: um mapa citado vale para todos os ids dele.
- Os 12 arquivos de `src/` com texto trocado, mais 2 testes e 2 snapshots, passam dos 10 do §3.1; autorizado pela Z1 a.
- "Ana Souza" e o domínio `acme.example` são os nomes fictícios.
- Não regenerei catálogo nem kits: nenhuma descrição de token mudou (o gate não achou marca nelas).

**Achados fora do escopo (não corrigidos)**
- `src/shared/types/index.ts:2` — comentário de cabeçalho "Sarak Matrix UI Types"; é comentário, o gate não o vê e ele não vira texto de produto.

**Pendências / riscos**
- O `dist/` só muda no próximo build; não rodei build.

## Resumo da execução (correção 4: achados 1 a 5 do veredito "correção 3") — 2026-11-22

**Resultado:** Concluído com uma ressalva (achado 3 e `PresetSamples` abaixo); `coverage:check` é do revisor, o 2.1 espera a 167; sem build e sem navegador.

**Estado do worktree ao iniciar**
`git status --short` (sem `dist/`) com 76 entradas: trabalho das plans 167/168/170 (browser-tests, cards, i18n `catalogEntries.*`, `Main/components`, `_elements.css`, snapshots) e da própria 169 (os dois gates e seus testes, specs 01/05, guia, o lote anterior do zero-brand). Os arquivos que editei nesta rodada e que já estavam modificados por outra plan: os snapshots de `SarakActionCard`, `SarakTitleCard` e `PreviewCanvas` (ver Decisões).

**O que foi feito**
- Achado 1 — `check-zero-brand.mjs`: isenções reescritas para o uso técnico real, todas em minúsculas ou por existência: pacote, `--sarak-`, `sarak-`, `sarak:`/`sarak/`, utilitárias `transition-sarak` e `rounded-sarak`; etiqueta de diagnóstico só nas formas exatas (`[Sarak]`, `[Sarak:Design|UI|Preferences|Link|Icon]`, `[sarak verify]`); palavra com a marca só se for identificador que existe em `src/` ou chave em minúsculas com prefixo (`sarak_lang`) ou sentinela `__SARAK_X__`; nome de tema só nos arquivos do tema e no gerado `cardsThemes.generated.ts`. A marca passou a ser procurada como trecho (`SarakOS`, `SARAKTWIN`, `Sarak_OS` contam). Caminho de módulo (`import`/`export from`) não é texto.
- Achado 1 — o comentário CSS de `SovereignThemeInjector.tsx` perdeu a marca, sem isenção (e o teste e 5 snapshots acompanharam a linha de comentário).
- Achado 2 — o gate varre os `.json` de `src/` (valores, não chaves). Três descrições trocadas em `catalog/partitions/{layout_and_navigation,motion_and_animation,specialized_engines}.json` ("scrollbar", "páginas completas", "Matriz"). O gate novo achou também 5 nomes de componente que não existem em `src/` na lista `digitalTwins` (`SarakContainer` ×2, `SarakHeader`, `SarakOverlay` ×2, nenhum consumidor no código): saíram da lista. `'SarakStack'` (rótulo de aviso em `useResponsiveStyles.ts`) virou `'useResponsiveStyles'` e o `Symbol('sarakStylesheetWarningFiltered')` de `testing.ts` virou `Symbol('stylesheetWarningFiltered')`. `token-docs:check`, `token-types:check`, `catalog:check`, `guide:check` e `themes:catalog:check`/`card-presets:check` (pelo quick) já estavam em dia: nenhum gerado mudou, porque as três descrições não entram neles.
- Achado 3 — `check-chrome-token-parity.mjs`: `MAPA.chave` prova só a chave dele; citar o nome do mapa não aprova mais nada. Leitor genérico só conta se estiver declarado em `GENERIC_READERS` (`splitChromeWidgetsByPlacement` para o mapa de widgets, `getNavCollapsePositionTopbar` para o token do recolher da Topbar), se a função existir em `src/` (`staleReaders`) e se o cromo a chamar. `preferences.ts` entrou (menos os dois passos de tamanho de fonte, em `NOT_CHROME_TOKENS`, com o motivo `overlayPreferences.ts`). `system.ts` passou a ser avaliado (corte no primeiro token depois do marcador de bordas). Cabeçalho (limites 1 a 3) e as specs 01 e 05 acertados. Repositório: 88 de 88 (eram 83).
- Achado 4 — `PresetSamples.test.tsx`: os três `waitFor` sob demanda passaram de 1 s para `LAZY_MODULE_WAIT_MS` (10 s) e os testes de table/badge/empty ganharam o teto de 30 s, com o motivo escrito (o módulo real chega por import sob demanda e leva mais que 1 s com a máquina carregada).
- Achado 5 — nomes genéricos pelo catálogo nos seis idiomas: 6 chaves novas em `catalogEntries.layout.ts` (`sampleTextBrand`=Marca, `sampleTextName`=Nome, `sampleTextSystem`=Sistema, `sampleTextCompany`=Empresa, `sampleTextSupport`=Suporte, `sampleTextThemeName`=Nome do tema). "Acme Service/Support/Enterprise", "SISTEMA ACME", "Ana Souza" (Dashboard, TextMock, `PreviewSystemRenderer`), "Digital Twin OS" e o placeholder de `SaveThemeModal.tsx` leem do catálogo via `useLibraryText`; os e-mails viraram `nome@example.com` (não traduzido). `PreviewSystemRenderer`: o usuário de amostra passou a `{ name: text('sampleTextName'), role }`.

**Gate do HEAD × gate novo (mesma fixture nos dois; 4 formas por texto: JSX, objeto `.ts`, padrão de prop, `document.title`)**

| Texto | HEAD | novo |
|---|---|---|
| "Sarak AI", "[Sarak AI] Olá", "[Sarak OS]" | reprova 4/4 | reprova 4/4 |
| "SARAK TWIN", "Sarak: bem-vindo", "Sarak/AI", "SARAK-TWIN", "Sarak-OS", "SarakOS", "SarakAI", "Powered-by-Sarak", "SARAKTWIN", "Sarak_OS", "Ex: Sarak Sovereign Customizado" | PASSA 0/4 | reprova 4/4 |
| uso técnico (`@sarak/lib-ui-core`, `--sarak-x`, `data-sarak-slot`, `transition-sarak`, `sarak:check`, `[Sarak:UI] aviso`, `[sarak verify]`, `sarak_lang`) | passa | passa |

No teste, as 10 formas (as 9 anteriores mais valor de `.json`) × 18 textos reprovam, os usos técnicos passam, `SarakButton` só passa se o identificador existe, o nome do tema só passa em arquivo do tema. 185/185.

Chrome-token-parity (fixture, sem leitor; o gate do HEAD não vê mapa nem preferências):

| Caso plantado | HEAD | novo |
|---|---|---|
| id inventado no mapa (cromo lê só `POSITION_IDS.colorMode`) | PASSA | reprova (`tokenInventado`) |
| token de fábrica em `system.ts`, antes do marcador | PASSA | reprova (`layoutDeFabrica`) |
| posição de preferência sem leitor | PASSA | reprova (`preferenceModePosition`) |

**Arquivos alterados** (os desta rodada; sem listar o que já constava no resumo anterior)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-zero-brand.mjs`, `__tests__/check-zero-brand.test.mjs` | alterado | isenções estreitas, `.json`, caminho de módulo; 185 casos |
| `gates/scripts/contrato/check-chrome-token-parity.mjs`, `__tests__/check-chrome-token-parity.test.mjs` | alterado | chave, leitores declarados, `preferences.ts`, `system.ts` avaliado; 25 casos |
| `specs/specs/01-gates-e-baseline.md`, `specs/specs/05-cromo-e-slots.md` | alterado | escopo e isenções |
| `src/core/i18n/catalogEntries.layout.ts` | alterado | 6 chaves de texto de amostra |
| `src/features/DesignEngine/Canvas/Mocks/{AuthMock,ChatMock,MockForms,TableMock,TextMock}.tsx`, `Mocks/Dashboard/{DashboardMetricsGrid,DashboardHeader}.tsx`, `Canvas/components/PreviewSystemRenderer.tsx`, `Main/components/SaveThemeModal.tsx` | alterado | texto de amostra pelo catálogo |
| `src/features/DesignEngine/Canvas/components/__tests__/{PresetSamples,PreviewSystemRenderer}.test.tsx`, `Canvas/Mocks/__tests__/{ChatMock,MockForms}.test.tsx`, `Main/components/__tests__/SaveThemeModal.test.tsx`, `src/core/Provider/components/__tests__/SovereignThemeInjector.test.tsx` | alterado | espera do `waitFor` e textos novos |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap`; `src/components/atomic/Cards/__tests__/__snapshots__/{SarakActionCard,SarakSearchCard,SarakTitleCard}.test.tsx.snap`; `src/components/atomic/Templates/components/__tests__/__snapshots__/SarakCoreCard.test.tsx.snap` | alterado | só 1 a 3 linhas cada (comentário CSS da ponte; no `PreviewCanvas` também "Nome"/"N" do usuário de amostra), editadas à mão |
| `src/core/Provider/components/SovereignThemeInjector.tsx` | alterado | comentário CSS sem a marca |
| `src/core/Design/catalog/partitions/{layout_and_navigation,motion_and_animation,specialized_engines,components_base,structural}.json` | alterado | 3 descrições e 5 nomes de componente inexistentes |
| `src/components/atomic/hooks/useResponsiveStyles.ts`, `src/testing.ts` | alterado | rótulo e descrição de Symbol sem a marca |

**Verificações executadas**
- `npx vitest run` dos dois testes de gate → 210/210 (185 e 25).
- `npm run zero-brand:check` → 0 problemas (agora varrendo `.json`); `npm run chrome-token-parity:check` → 88 de 88.
- `PresetSamples.test.tsx` sob carga: 16 processos de CPU em laço (16 núcleos) durante as rodadas 1 e 2; 3 rodadas seguidas, 29/29 cada. A 1ª levou 289 s e a 2ª 237 s por causa da carga; a 3ª (38 s) já correu com a carga quase no fim. O teste antes falhava com `expected +0 to be 1` (1 s de `waitFor`) e não falhou nas três.
- `npx vitest run src/features/DesignEngine/Canvas` → 53 arquivos, 281/281; os testes de Cards, hooks, Provider/components, i18n e `testing` rodaram verdes em uma execução (depois de corrigir o `text` fora do escopo em `PreviewSystemRenderer`, que quebrou 20 testes e foi consertado).
- `npm run verify -- --tier=quick` (rodado de novo, com o código de saída) → 30 verificações OK e 1 falha: `plan-index:check` (índice "🔵 Em correção" × frontmatter "🟠 Em revisão"). O índice é do revisor; o frontmatter foi movido para 🟠 por mim, como manda o ritual. As demais (`tsc`, baseline, Anel 1, Anel 0) passaram. A afirmação "sem erro" que escrevi antes vinha de uma saída filtrada e estava errada.
- Não rodei suíte inteira, build, navegador, `coverage:check`.

**Critérios de aceite**
- [x] Achado 1 — evidência: tabela e `check-zero-brand.test.mjs`.
- [x] Achado 2 — três descrições trocadas; `.json` varrido; gerados em dia.
- [x] Achado 3 — evidência: tabela, 25/25, 88 de 88.
- [x] Achado 4 — 3 rodadas verdes sob carga.
- [x] Achado 5 — nomes genéricos pelo catálogo; sem nome de pessoa nem de empresa.
- [ ] `coverage:check` e 2.1 — pendentes.

**Decisões e suposições**
- Os snapshots de `SarakActionCard` e `SarakTitleCard` (arquivos da 167) levaram só a troca da linha de comentário CSS que o veredito mandou tirar do injetor, editada à mão com `sed`, sem `-u`; o de `PreviewCanvas` (também com diff de outras plans) levou essa linha e a do usuário de amostra. Não toquei no resto.
- `PreviewSystemRenderer.test.tsx` esperava as iniciais "AS" de "Ana Souza"; passou a esperar "N" (de "Nome").
- O gate varre `.json` de `src/` exceto `*.golden.json` e `*.validation.json`.
- Os dois leitores de `GENERIC_READERS` foram escolhidos por existirem hoje em `src/` e serem os que o cromo chama; `getNavCollapsePositionTopbar` cobre o token `preferenceNavCollapsePositionTopbar`, que não tem chave de mapa.
- Marca como trecho, sem limite de palavra: qualquer texto com "sarak" dentro, fora das isenções, reprova.

**Achados fora do escopo (não corrigidos)**
- `catalogEntries.layout.ts:49` — a tradução italiana "Sidebare" (já relatada na correção 1) segue lá.
- `digitalTwins` das partições do catálogo não tem consumidor no código; poderia sair do JSON.
- `src/shared/types/index.ts:2` — comentário com "Sarak Matrix UI Types" (comentário, o gate não vê).

**Pendências / riscos**
- O `dist/` só muda no próximo build; não rodei build nem os snapshots dos kits.
- A prova de carga do `PresetSamples` cobriu 2 rodadas com a máquina saturada e 1 com ela terminando.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Resumo da execução - 2026-11-21

**Resultado:** Bloqueado

**Estado do worktree ao iniciar**
Fotografia capturada antes de qualquer edição: já havia alterações e arquivos não rastreados em `dist/`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts`, arquivos de charts sob `src/components/engines/charts/`, `browser-tests/plan-168-*` e nas plans 167 e 168. O restante da saída inicial enumerava os arquivos gerados em `dist/`; nenhum deles foi tocado nesta execução.

**O que foi feito**
- Executei `node gates/scripts/audit/auditor_hardcoded.mjs` após ampliar temporariamente a coleta para `.ts`; o gate reportou 74 arquivos `.ts` de `src/` com violações, acima do limite de 10 arquivos declarado na §3.1 da plan. Parei a execução conforme essa condição.
- Desfiz a alteração experimental do gate e do teste; não ficou mudança em código de produção ou teste.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/plan-169-gates-que-deixam-passar-e-testes-que-estouram-o-tempo.md` | alterado | Registro desta execução bloqueada e status para revisão. |

**Verificações executadas**
- `node gates/scripts/audit/auditor_hardcoded.mjs` com coleta experimental de `.ts` — exit 1; 1.055 violações totais e 74 arquivos `.ts` distintos de `src/` na saída.
- Nenhum teste automatizado, build ou navegador foi executado.

**Critérios de aceite**
- [ ] Os lotes 1–4 concluídos — bloqueado no lote 2: o escopo de correção excedeu o teto de 10 arquivos de `src/`.
- [ ] Violações ampliadas corrigidas/isentas sem baseline novo — pendente de decisão do revisor sobre os 74 arquivos `.ts` apontados.
- [ ] Provas de mutação dos três gates, tabela de arquétipos e quatro testes sob carga — não executadas após a condição de parada.

**Decisões e suposições**
- O limite de 10 arquivos de `src/` é uma condição de parada, não autorização para adicionar exceções em massa nem ampliar o baseline.

**Achados fora do escopo (não corrigidos)**
- Nenhum registrado; a varredura foi interrompida pela condição de parada prevista na plan.

**Pendências / riscos**
- Revisão necessária para decidir como tratar a cobertura de 74 arquivos `.ts` antes de continuar os lotes 1–4.

## Veredito — 2026-11-21 — lotes 1-4 — 🟠 A parada procede; o lote 2.1 espera a decisão H1 do dono; os outros passos seguem

**Como medi:** repeti a varredura do executor numa cópia temporária do auditor, com `.ts` além de `.tsx` (a cópia foi apagada), e
separei as violações por camada.

| Camada | Arquivos | Violações | Leitura |
|---|---|---|---|
| Dado de design: `src/core/Design/presets/`, `schema/`, `palette/` (temas, paletas, padrões, catálogo gerado) | 51 | 951 | o hex e o px **são** o valor do token; não é hardcode |
| Condição de container query (`@min-[…]`) | 3 | 25 | isenção já prevista na §5 |
| Código: geradores de estilo dos átomos, Provider, cromo, gráficos, painel | 23 | 104 | o que o gate deveria ver |

**A parada procede.** O teto de 10 arquivos existia para isto. Mas o executor parou a plan inteira. Os lotes 1, 3 e 4, e os passos 2.2
(`chrome-token-parity`) e 2.3 (`zero-brand`), não dependem do 2.1 e seguem.

**Decisão H1 do dono — o escopo do auditor de hardcode em `.ts`:**
- **(a) Recomendação do revisor:** o auditor varre `.ts` fora do dado de design, com três isenções escritas no gate e cada uma com o
  motivo:
  - o dado de design (`src/core/Design/presets/`, `schema/`, `palette/`);
  - a condição de container query;
  - as constantes de matemática de cor e de contraste (`colorMath.ts`, `on-color.ts`, `colorParts.ts`).

  O que sobra (cerca de 20 arquivos e uns 100 achados) é corrigido nesta plan, com o teto subindo de 10 para 25 arquivos.
- **(b)** Mesmo escopo, mas os achados que sobram entram no baseline e voltam ao backlog para outra plan. O gate passa a ver `.ts` já na
  9.0.0, e a dívida fica registrada e não cresce.
- **(c)** O #21 sai desta plan. Fica só a regra escrita (a condição de container query não pode ser `var()`), e o item volta ao backlog.

**Status da plan: 🟠 Em revisão** (o lote 2.1 espera H1; o resto segue).

## Nota do revisor — 2026-11-21 — decisão H1 do dono: (a)

**Passo 2.1, com o escopo da decisão:**
1. **Varredura:** o `auditor_hardcoded` varre `.ts` além de `.tsx`.
2. **Isenções:** três, escritas no gate, cada uma com o motivo:
   - o dado de design (`src/core/Design/presets/`, `src/core/Design/schema/`, `src/core/Design/palette/`), onde o hex e o px são o valor do
     token;
   - a condição de container query (`@min-[…]`), que não pode ser `var()`;
   - as constantes de matemática de cor e de contraste (`colorMath.ts`, `on-color.ts`, `colorParts.ts`).
3. **Correção:** o que sobra (cerca de 20 arquivos e uns 100 achados) é corrigido no código, com valor por token ou com `var()` e
   reserva. O teto da §3.1 sobe de 10 para **25 arquivos**. Um achado que não for hardcode de verdade vira isenção pontual, com motivo,
   e é listado no resumo. Nada entra no baseline.
4. **Prova:**
   - mutação: uma classe com medida literal num `.ts` de `src/components/` é reprovada, e o mesmo valor num tema passa;
   - `check-audit-baseline --with-tsc` sem regressão;
   - `npm run build`, porque os geradores de estilo dos átomos mudam o CSS que a tela usa;
   - `npm run cromo-css-real:check` rodado sozinho, sem outra plan medindo, como prova de que nada mudou na tela.

## Nota do revisor — 2026-11-21 — o executor travou sem gravar resumo; o estado pelo worktree

**Como medi:** `git diff` dos arquivos da §3.1 e os gates tocados rodados pelo revisor.

| Passo | Estado | Prova |
|---|---|---|
| Lote 1 (#10) | **parcial** | Saíram 2 citações (`plan-45`, `plan-52`). Restam 5 na §2.2: `plan-39`, `plan-41`, `plan-45` e 2 de `plan-53`. As células limpas ficaram com espaço duplo (`—  `). |
| 2.1 (hardcode em `.ts`, H1 a) | **não começou** | `gates/scripts/audit/` sem mudança |
| 2.2 (`chrome-token-parity`) | feito, sem prova de mutação no resumo | `chrome-token-parity:check` OK: 46 tokens de 46 nos schemas; teste do gate +22 linhas; 05 ajustada |
| 2.3 (`zero-brand`) | feito, com um achado | `zero-brand:check` OK em 825 arquivos; teste novo `gates/scripts/contrato/__tests__/check-zero-brand.test.mjs` |
| Lote 3 (#77) | feito | `scripts/generate-consumer-kit.mjs` gera a tabela; `guide:check` OK; teste do gerador +20 linhas |
| Lote 4 (#89) | **1 de 4** | só `switch-glass-border.test.ts` mudou; `PaletteGallery.registry`, `compose` e `BarSample` intactos; `coverage:check` não rodou |

**Achado 1 (2.3) — texto visível escrito à mão em português.** Para tirar a marca, "Sarak Assistant" e "Sarak Catalog Engine" viraram
"Assistente" e "Catálogo" escritos direto em `src/components/atomic/Templates/Chat/MessageBubble.tsx`,
`src/components/engines/chat/SarakChatEngine.tsx` e `src/components/atomic/Templates/SarakCatalogGrid.tsx`. Texto visível passa pelo
catálogo dos seis idiomas (`useLibraryText`), como o resto da lib.
**Correção:** chaves novas no catálogo, nos seis idiomas, lidas pelo `useLibraryText`. `zero-brand:check` continua verde.

**Retomada (em outra conversa):**
- fechar o lote 1 e tirar os espaços duplos;
- o achado 1;
- a prova de mutação dos gates 2.2 e 2.3;
- os 3 testes que faltam do lote 4, com `coverage:check` verde duas vezes;
- o 2.1 por último, porque pede build e bateria, que são da vez da 167;
- o resumo na §9.

**Status da plan: 🟡 Em execução.**

## Veredito — 2026-11-21 — retomada parcial — 🟡 Quase tudo conferido; faltam o `compose`, o `coverage:check` e o 2.1

**Por que este registro:** o executor não conseguiu gravar o resumo. A sessão recusou edições com `invalid sandbox permission path:
'file:///workspace'`. O relato chegou pelo dono, e o revisor registra aqui o que mediu no worktree.

| Passo | Estado | Prova do revisor |
|---|---|---|
| Lote 1 (#10) | feito | `specs/specs/01-gates-e-baseline.md`: nenhuma citação de `plan-39`, `-41`, `-45` ou `-53` e nenhum `—  ` |
| Achado 1 (2.3) | feito | `chatAssistantLabel` e `catalogLabel` nos seis idiomas em `catalogEntries.entries.ts`, lidos pelo `useLibraryText` nos três componentes |
| 2.2 e 2.3 com mutação | feito | casos `MUTAÇÃO:` em `check-zero-brand.test.mjs` (1) e `check-chrome-token-parity.test.mjs` (3); 18/18 verdes; `zero-brand:check` com 826 arquivos e `chrome-token-parity:check` com 46/46 ok |
| Lote 4 (#89) | **3 de 4** | os 4 testes juntos dão 24/24 verdes. `switch-glass-border` leva 6 ms, `PaletteGallery.registry` 6 ms e `BarSample` 1,2 s no caso mais lento. `compose.test.ts` **não mudou** e leva **2,2 s sozinho** ("tema embarcado com fundo próprio"); sob a carga da suíte inteira, passa de novo dos 5 s |
| `coverage:check` 2× | não fechou | 1ª rodada sem resultado final e 4 vermelhos sem nome, com o lote 2 da 168 mexendo no catálogo de idiomas no mesmo momento |
| 2.1 (H1 a) | não começou | espera a vez da 167 |

**`PaletteGallery.registry`:** aceito. O teste agora confere o dado do registro: cada paleta uma vez, a partição por tipo e nenhum
Claro/Escuro. O que a tela mostra continua coberto por `PaletteGallery.test.tsx`.

**Falta:**
- **`compose.test.ts`:** o caso do tema embarcado cai abaixo de 1 s sem perder o que prova. Por exemplo, compõe uma amostra
  representativa em vez de todos os temas × paletas, desde que a mutação do texto movido contra o fundo continue reprovando. O teto de
  tempo não sobe.
- **`coverage:check` verde duas vezes seguidas:** só depois do resumo da 168, com o worktree parado. Cada vermelho vai ao resumo pelo nome,
  com o dono atribuído.
- **o 2.1**, por último.
- **o resumo na §9**, numa sessão com permissão de escrita.

**Status da plan: 🟡 Em execução.**

## Veredito — 2026-11-21 — `compose` e janela de coverage — 🟡 Os 17 vermelhos têm dono; a 169 só herda um

**Como medi:** rodei os 15 vermelhos que não são de scaffold sozinhos, sem coverage: 12 caem do mesmo jeito (não é carga) e 3 passam.
O `compose.test.ts` está aceito (16/16, 399 ms, com mutação de `sidebarItemTextColor`).

**Donos confirmados pelo diff:**
- **plan-170:** `verify_contrast` ×2, `ChromeSidebarBody`, `ChromeTopbarBody`, `useChromeDesignTokens` ×2 e a linha do sair no snapshot do
  `PreviewCanvas`. O 🟢 da 170 foi revogado;
- **plan-167 (lote 3 em curso):** `SarakTitleCard` (snapshot), `CardsCatalog` e `PresetsCatalog` (os títulos e subtítulos do card) e a
  linha "Inspecionar" do `PreviewCanvas`. O `check-token-reader` (`cardTitleColor`) passou na minha rodada: era estado intermediário
  da 167;
- **plan-168:** `PresetSamples` › a amostra de gráfico (`STACK_TRACE_ERROR`);
- **a 169 herda o `ChromeSidebarResizeHandle.test.tsx`:** é teste desatualizado no `HEAD`. O commit 7ce5e00c (2026-11-18) trocou "barra lateral" por "Sidebar" no
  catálogo (`catalogEntries.layout.ts:48`), e o teste ainda espera "barra lateral". Nenhuma das quatro plans o causou. Entra no lote 4
  (#89), atualizando a expectativa para o texto do catálogo, lido do próprio catálogo e não escrito no teste;
- **scaffold ×2 (`EPERM` de symlink):** sandbox. Fora dele, passam.

**Próximo `coverage:check`:** só depois que a 170, a 167 (lote 3) e a 168 entregarem as correções. Até lá, rodar só o
`ChromeSidebarResizeHandle`.

**Status da plan: 🟡 Em execução.**

## Veredito — 2026-11-22 — `ChromeSidebarResizeHandle` e suíte inteira — 🔵 Em correção (dois testes)

**Como medi:** li o diff, rodei a suíte inteira fora do sandbox (6755 verdes, 1 vermelho), o `tsc` (0 erros) e o `audit:baseline`
(igual), e usei cópias do `HEAD` fora do repositório como controle.

**`ChromeSidebarResizeHandle`: aprovado.** Lê o rótulo do catálogo.

**Achado 1 — o `compose.test.ts` perdeu cobertura. Retiro o aceite de 2026-11-21; a falha foi do revisor**, que sugeriu a amostra e
aceitou sem ler o diff. O caso "todo par passa" conferia todos os temas com paleta nos dois modos e hoje confere só `neo-brutalism` no
claro. É um gate que deixa passar, o defeito que esta plan fecha.
**Correção:** voltar a todos os temas com paleta × claro e escuro, um caso por tema e modo (`it.each`), cada um com o próprio teto de 5 s.
A asserção nova de `sidebarItemTextColor` fica só onde vale (`neo-brutalism`, claro). O original leva 2 s no total e passa no código de
agora (16/16): não há motivo para reduzir.

**Achado 2 — `PresetsCatalog.test.tsx` é desta plan (#89). Corrijo a atribuição de 2026-11-21, que o dava inteiro à 167.**
- **Já cai no `HEAD` limpo:** o snapshot depende do instante. Espera 24 miniaturas `data-sx-lazy="pending"` e recebe as 24 `shown`,
  porque sem `IntersectionObserver` o `useOnFirstVisible` mostra na hora e o snapshot compete com o efeito.
- **Além disso:** o snapshot no worktree trocou 4 linhas de subtítulo, e 2 delas são de cards que não mudaram (`SarakActionCard` e
  `SarakSearchCard`).
**Correção:**
- o teste instala um `IntersectionObserver` que nunca intersecta antes do render e o remove depois;
- regenera-se só esse snapshot (`npx vitest run <arquivo> -u`, com o `-u` no fim), sem editar à mão;
- três rodadas seguidas verdes.

**`coverage:check` sai do executor.** Os dois testes de scaffold criam symlink e nunca passam no sandbox; fora dele passaram nesta rodada.
O revisor roda o `coverage:check` no fechamento, com o worktree parado.

**2.1:** depois da revisão da 167.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-22 — correção 2 — 🔵 Em correção (os dois testes aprovados; os gates 2.2 e 2.3 reprovados)

**Como medi:** li os diffs; rodei os testes da plan numa cópia do `HEAD` só com os arquivos dela; mutei o `compose`, o `zero-brand` e o
`chrome-token-parity` nessa cópia, com o gate do `HEAD` como controle; rodei no worktree os gates do Anel 1, o `audit:baseline` (igual) e
o Anel 0 (0 achados). Não rodei build, navegador, suíte inteira nem `coverage:check`.

**Achados da correção 2: aprovados.**
- `compose`: 25 temas × 2 modos; um texto ilegível plantado em `nature-breeze`/escuro (fora da amostra antiga) derruba só esse caso.
- `PresetsCatalog`: verde e determinístico. As 1.995 linhas que saíram do snapshot eram a única miniatura que escapava na corrida; o
  desenho sob demanda continua coberto por `PresetCard.test.tsx`.

**Retiro o aceite dos passos 2.2 e 2.3 (2026-11-21). A falha foi do revisor**, que aceitou os testes de mutação da execução sem plantar
os próprios casos.

**Achado 1 (2.3) — o `zero-brand` novo deixa passar o que o do `HEAD` reprovava.** `scanFile` só olha string ligada a JSX no mesmo arquivo.
"Sarak AI", "Sarak OS" e "Sarak Lib", plantados em 6 de 9 formas, eram reprovados no `HEAD` e hoje passam: padrão de prop, objeto
exportado, catálogo de idiomas em `.ts`, constante importada, dado em `.ts` e `document.title`.
**Correção:** voltar a varrer todo literal de texto, com a marca por padrão. São isenções explícitas o que é técnico (pacote, prefixos,
componente), o diagnóstico de console e os nomes dos temas embarcados. O teste planta as 9 formas, com uma frase antiga e uma nova.

**Achado 2 (2.2) — o `chrome-token-parity` não vê 36 dos 75 tokens de `NavigationSchema`.** `extractSchemaTokens` só lê objeto literal:
perde o que nasce de fábrica (`createChromeSelectToken('brandDisplay', …)`) e o que vem de `barPersonality.ts`. O recorte por
`/navigation/` no id também não pega `sidebarTone`, `topbarTone`, `sidebarResizable` nem `sidebarLogoPlacement`. Um token sem consumidor
plantado em `barPersonality.ts` passa com "46 de 46". O cabeçalho e as specs 01 e 05 dizem "`navigation.ts` inteiro", e é falso.
**Correção:** o gate cobre os 75, mais os de `system` e `global` que já cobre; um teste compara a extração com o schema importado; a
mutação planta um token de fábrica e um em `barPersonality.ts`. Dos 36, 35 já têm consumidor pelo critério do gate. `userAvatarStyle` é
lido em `SarakShellUserWidget.tsx`, fora dos arquivos varridos: entra o arquivo, não uma exceção. Acertar o cabeçalho e as duas specs.

**Achado 3 (2.5) — 13 isenções novas com motivo que não procede.** O comentário diz que os painéis não chegam ao consumidor. O
`SarakCustomizationPanel` é público, e o `dist/` do `HEAD` carrega "Igor Sarak", "Sarak MyService", "Sarak Support", "Sarak v13.0" e
"ecossistema Sarak UI". A spec 08 §7.3 só admite isenção do que não é consumidor-facing. A tensão está registrada lá e na 06 §8 para um
arquivo; ampliá-la para treze é decisão do dono.

**Z1 — decisão do dono:**
- **a) recomendada:** o painel é produto. Os textos com marca que entram no pacote viram nomes fictícios ou de função, inclusive as
  descrições do catálogo de tokens; na allowlist fica só o que não entra no pacote, com esse motivo. Autorizado passar dos 10 arquivos
  do §3.1 para essa troca de texto.
- **b)** o painel segue isento, e o motivo passa a dizer que chega ao importador.
- **Nas duas:** "Igor Sarak" vira nome fictício, porque é nome de pessoa.

**Spec 01:** corrigi nesta revisão os erros de prosa da execução ("dúvida" por "dívida", o `×`, o travessão e duas frases).

**Commit parcial liberado:** testes (#89, `ChromeSidebarResizeHandle`, `PresetsCatalog`), "Assistente"/"Catálogo" e gerador com o guia.
Fecham sobre o `HEAD` sem os gates. Os gates, os testes deles e as specs 01 e 05 esperam a correção.

**Seguem pendentes:** o 2.1, quando a 167 liberar build e bateria; o `coverage:check`, do revisor, no fechamento. A síntese também
atualiza a 08 §7, a 06 §8 e a R12.

**Status da plan: 🔵 Em correção.**

## Nota do revisor — 2026-11-22 — decisão Z1 do dono: (a), com nome genérico

**Decisão do dono:** "a base é genérica e deve usar nomes genéricos e intuitivos, como (marca, nome...)". Texto de exemplo diz a função
do campo. Não usa nome de pessoa nem de empresa inventada.

**A correção 3 terminou antes da decisão completa e usou nomes inventados. Corrigir:**
- "Ana Souza" → "Nome", em `DashboardMetricsGrid.tsx`, `TextMock.tsx` e também `PreviewSystemRenderer.tsx`, que já o trazia;
- "Acme Service", "Acme Support", "Acme Enterprise" e "SISTEMA ACME" → "Marca", "Suporte", "Empresa" e "Sistema", conforme a função;
- `contato@acme.example` e `admin@acme.example` → `nome@example.com`;
- "DIGITAL TWIN OS" → "Sistema";
- o placeholder "Ex: Sarak Sovereign Customizado" de `SaveThemeModal.tsx` → "Nome do tema";
- esses nomes saem do catálogo de idiomas, nos seis: reusar chave que já exista ou criar em `catalogEntries.layout.ts`, fora dos arquivos
  da plan-168.

Os nomes dos temas embarcados ("Sarak Sovereign") continuam: são o id público do tema, como a opção (a) dizia.

**Os gates da correção 3 ainda não foram revisados.** Entram na revisão junto com esta troca.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-22 — correção 3 — 🔵 Em correção (a base dos dois gates passa; as isenções e três recortes não)

**Como medi:** rodei os arquivos da correção sobre o `HEAD` isolado (33 arquivos, 179 testes, `tsc` 0, gates verdes); plantei 20 textos em
9 formas contra o gate novo e o do `HEAD`; comparei a extração do `chrome-token-parity` com o schema importado e plantei tokens sem
leitor; rodei `src/features/DesignEngine/Canvas` no worktree. Não rodei build, navegador, suíte inteira nem `coverage:check`.

**Aprovado:** a varredura de todo literal (as 6 formas que regrediam voltaram a reprovar), a allowlist vazia, os 75 de 75 tokens de
`NavigationSchema` e os plantios de fábrica, de `barPersonality.ts` e de `global.ts`.

**Achado 1 — isenções largas do `zero-brand`.**
- Regressão: "[Sarak AI] Olá" e "[Sarak OS]" eram reprovados em 9 de 9 formas no `HEAD` e hoje passam em todas.
- Também passam: "Sarak: bem-vindo", "Sarak/AI", "SARAK-TWIN", "Sarak-OS", "SarakOS", "SarakAI", "Powered-by-Sarak", "SARAKTWIN",
  "Sarak_OS" e "Ex: Sarak Sovereign Customizado".
**Correção:** cada isenção casa só o uso técnico real. Etiqueta de diagnóstico pela forma exata das que existem; prefixo, comando e
plugin só em minúsculas; `SarakX` só quando é identificador que existe em `src/`; nome de tema só nos arquivos e gerados do tema. O
comentário CSS de `SovereignThemeInjector.tsx` perde a marca, sem isenção. Todos esses textos entram no teste, junto dos usos técnicos
que devem passar.

**Achado 2 — as descrições do catálogo, que a Z1 citava, ficaram com marca.** "scrollbar do Sarak", "páginas completas do Sarak" e
"Matriz Sarak" estão em `src/core/Design/catalog/partitions/*.json` e aparecem na ajuda do painel. O resumo diz que não havia nenhuma
porque o gate só lê `.ts` e `.tsx`.
**Correção:** trocar as três, o gate varre esses `.json` e os gerados se regeneram.

**Achado 3 — três buracos no `chrome-token-parity`.**
- **Mapa:** citar `PREFERENCE_POSITION_TOKEN_IDS.navCollapsed` aprova qualquer id do mapa; um id inventado passa. É assim que
  `preferenceNavigationStylePosition` passa hoje. `MAPA.chave` prova só aquela chave; leitor genérico só conta se declarado e chamado.
- **`preferences.ts`:** os tokens de posição de preferência são do cromo e ficam fora. Entram. Os dois passos de tamanho de fonte ficam
  fora com o motivo verdadeiro (quem os lê é `overlayPreferences.ts`, do Provider).
- **`system.ts`:** segue lido como texto, e um token de fábrica plantado passa. Avaliar como os outros.
Acertar o cabeçalho, o comentário velho de `extractSchemaTokens` e as specs 01 e 05, que dizem "os outros grupos descrevem superfícies
fora do cromo".

**Achado 4 — `PresetSamples.test.tsx` cai sob carga (#89). O arquivo passa da plan-168 para esta, com o diff que já tem.** Caiu com a CPU
em 88% (`expected +0 to be 1`) e passa sozinho. O teto de 30 s, que o revisor aceitou, não alcança a causa: cada `waitFor` espera só
1 s pelo componente sob demanda.
**Correção:** eliminar a espera que compete com a carga (carregar o módulo antes do laço) ou dar prazo ao `waitFor`, com o motivo; três
rodadas verdes com a máquina carregada.

**Achado 5 — a nota Z1 acima (nomes genéricos) ainda não foi executada.**

**Commit:** nada de código desta correção até os achados fecharem. O 2.1 e o `coverage:check` seguem pendentes.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-22 — correção 4 — 🔵 Em correção (gates e descrições aprovados; falta o resto da varredura Z1)

**Como medi:** li o diff; plantei 25 textos em 9 formas no `zero-brand` e no do `HEAD`, e uma marca num `.json` do catálogo; plantei no
`chrome-token-parity` token em `barPersonality.ts`, fábrica em `system.ts`, posição de preferência sem leitor e id inventado num mapa;
rodei gates, `tsc` (0) e testes tocados sobre o `HEAD` isolado; varri a prévia por nome de pessoa e de empresa.

**Aprovados:**
- **Achado 1:** os 23 textos de produto reprovam em 9 de 9 formas e os 2 usos técnicos passam. Nenhuma regressão contra o `HEAD`.
- **Achado 2:** as três descrições sem marca; marca plantada num `.json` reprova. Aceitos os 5 nomes inexistentes tirados de
  `digitalTwins`, o rótulo do hook e o `Symbol` (nenhum tem leitor pelo nome antigo).
- **Achado 3:** os quatro plantios reprovam e a chave citada continua passando; 88 de 88.
- **Achado 4:** a espera de 10 s ataca a causa. A prova final é a suíte inteira.

**Achado 5, o que resta — empresas e produtos reais na prévia.** A nota Z1 do revisor não os listou, mas a decisão do dono os cobre:
- `TableMock.tsx`: "AWS Hosting", "Stripe Payout", "Github Copilot", "Vercel Pro" e "Google Cloud" viram nomes de função (Hospedagem,
  Recebimento, Licença, Assinatura, Armazenamento);
- `DashboardSidePanel.tsx`: "GPT-4o" vira "Modelo".
Os botões de login social continuam: o provedor é a função deles. De carona, a tradução italiana "Sidebare" de `catalogEntries.layout.ts`
vira "Sidebar".

**Commit parcial:** depende da suíte inteira desta revisão. Dois snapshots (`SarakActionCard`, `SarakTitleCard`) levam também linhas da
plan-167: com só a linha do comentário passam sobre o `HEAD`, então saem no commit dela.

**Seguem pendentes:** o 2.1 (vez da 167) e o `coverage:check` (do revisor, no fechamento).

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção 5: achado 5 do veredito "correção 4") — 2026-11-22

**Resultado:** Concluído

**Estado do worktree ao iniciar:** worktree compartilhado e sujo (trabalho das plans 167/168 e desta); `TableMock.tsx` e `catalogEntries.layout.ts` já constavam como modificados. Editei só as linhas abaixo, por substituição exata.

**O que foi feito**
- `TableMock.tsx:36-41` — `AWS Hosting`→`Hospedagem`, `Stripe Payout`→`Recebimento`, `Github Copilot`→`Licença`, `Vercel Pro`→`Assinatura`, `Google Cloud`→`Armazenamento`.
- `Dashboard/DashboardSidePanel.tsx:17` — `GPT-4o`→`Modelo` (mensagem agora `New Model Injected: Modelo`).
- `catalogEntries.layout.ts:55` — `Sidebare`→`Sidebar` (italiano).
- `__tests__/TableMock.test.tsx:62` — a asserção citava `AWS Hosting`; passou a `Hospedagem` (consequência necessária da troca).
- Login social intocado, como mandado.

**Verificações executadas**
- `npx vitest run …/Mocks/__tests__/TableMock.test.tsx …/DashboardMock.test.tsx` → 2 arquivos, 9 testes verdes.
- `npx vitest run src/features/DesignEngine/Canvas/Mocks src/core/i18n src/features/DesignEngine/Canvas/__tests__` → 119 verdes, 1 falha (abaixo).
- `grep` por `AWS Hosting|GPT-4o|Sidebare|Stripe Payout|Vercel Pro|Github Copilot|Google Cloud` em `src` → sem ocorrências restantes (fora o login social).

**Critérios de aceite**
- [x] Cinco nomes do TableMock, GPT-4o e Sidebare trocados.
- [ ] "Regenerar o snapshot afetado com `-u`": **não feito — nenhum snapshot cita os textos trocados** (grep em `*.snap`: zero). O único snapshot vermelho, `PreviewCanvas.test.tsx.snap`, diverge em ordem/presença de variáveis `--sarak-color-*` no `style` do cromo — efeito de trabalho de outra tarefa (o `.snap` e `useDesignVariables`/`colors.ts` já estavam modificados na fotografia), não da minha troca. Rodar `-u` ali regravaria trabalho alheio; deixei como está.

**Decisões e suposições**
- Editei `TableMock.test.tsx` mesmo fora da lista literal, pois a asserção quebraria.
- "Modelo" no painel lateral foi literal do pedido, ainda que a frase fique em inglês+português.

**Achados fora do escopo (não corrigidos)**
- `PreviewCanvas.test.tsx` vermelho por snapshot desatualizado em relação ao trabalho em andamento nas variáveis de cor; quem regenera é o dono dessa mudança.

**Pendências / riscos**
- 2.1 segue esperando a 167; `coverage:check` é do revisor. Sem build, navegador ou commit.

## Veredito — 2026-11-22 — correção 5 — 🔵 Em correção (achado 5 aprovado; um nome de pessoa que a varredura do revisor não viu)

**Como medi:** li o diff; varri `src/` inteiro, `bin/` e os templates do kit por nome de pessoa, empresa e produto; montei `HEAD` + só os
arquivos desta plan numa cópia e rodei os gates (verdes) e o `tsc` (0). A suíte inteira roda nessa cópia.

**Achado 5 da correção 4: aprovado.** Os seis textos e o "Sidebare" saíram. O português dentro de frase em inglês é do backlog #94.

**Achado 1 — "Maria Souza" nas amostras do painel.** `sampleInputValue` (`src/core/i18n/catalogEntries.panel.ts`) leva nome de pessoa nos
seis idiomas, e aparece na amostra de campo e nas quatro linhas da de tabela. As duas varreduras anteriores do revisor só olharam
`features/` e `components/`.
**Correção:** o valor vira Nome, Name, Nombre, Nom, Name e Nome (pt, en, es, fr, de, it), e `SampleParts.test.tsx` acompanha. É a única
linha a mudar nesse arquivo, que também tem diff da plan-168. Os testes e o spec de navegador da assinatura usam dado próprio e não mudam.

**Commit parcial:** sai se a suíte da cópia isolada passar, com as linhas desta plan dos três snapshots compartilhados por patch no índice.

**Seguem pendentes:** o 2.1 (vez da 167) e o `coverage:check` (do revisor, no fechamento).

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção 6: achado 1 do veredito "correção 5") — 2026-11-22

**Resultado:** Concluído

**Estado do worktree ao iniciar:** worktree compartilhado e sujo (trabalho das plans 167/168 e desta); `catalogEntries.panel.ts` já constava modificado (diff da 168).

**O que foi feito**
- `src/core/i18n/catalogEntries.panel.ts:37` — `sampleInputValue` de "Maria Souza"/"María Souza"/"Marie Souza" para Nome, Name, Nombre, Nom, Name, Nome (pt, en, es, fr, de, it). Só essa linha, por substituição por número de linha.
- `SampleParts.test.tsx:59` — valor esperado `'Maria Souza'` → `'Nome'` (o teste roda em pt; a primeira tentativa com `'Name'` falhou e foi corrigida).

**Verificações executadas**
- `npx vitest run …/SampleParts.test.tsx …/PresetSamples.test.tsx` → 2 arquivos verdes.

**Critérios de aceite**
- [x] Seis idiomas trocados — `catalogEntries.panel.ts:37`.
- [x] Teste de SampleParts acompanha; testes de assinatura não tocados.

**Achados fora do escopo (não corrigidos):** nenhum.

**Pendências / riscos:** 2.1 aguarda a 167; `coverage:check` é do revisor. Sem build, navegador nem commit.

## Veredito — 2026-11-22 — correção 6 — 🟡 Correções aprovadas; resta o 2.1

**Como medi:** rodei a suíte inteira numa cópia com `HEAD` + só os arquivos desta plan: **6986 de 6986 testes verdes em 779 arquivos**,
com a máquina carregada por outras sessões (a prova do `PresetSamples`). Sobre ela, a correção 6: 359 testes das pastas consumidoras
verdes, `tsc` 0 e `zero-brand:check` verde.

**Aprovados:** o achado 1 da correção 5 e, com ele, os gates 2.2 e 2.3, a Z1 e o lote 4.

**Commit parcial liberado:** os arquivos testados na cópia, com as linhas desta plan de `SarakActionCard`, `SarakTitleCard` e
`PreviewCanvas` por patch no índice. Só passa no hook depois que a plan-167 deixar `audit:baseline`, `variable-contract:check` e
`dev-kit:check` verdes.

**Resta:** o 2.1 (H1 a), quando a 167 liberar build e navegador, e o `coverage:check`, do revisor, no fechamento.

**Status da plan: 🟡 Em execução.**

## Veredito — 2026-11-22 16:00 — nova revisão sem entrega nova — 🟡 O veredito "correção 6" continua valendo

**Como medi:** nenhum resumo nem arquivo desta plan mudou depois do veredito "correção 6". O conjunto do commit parcial segue idêntico ao
testado (6986 de 6986), o patch dos três snapshots ainda aplica no índice, e na suíte inteira do worktree de hoje (7017 de 7020) nenhum
vermelho é desta plan. Num conjunto isolado, `HEAD` + 169 + 168, os gates que bloqueiam o commit ficam verdes: o bloqueio vem só da 167
(achado 1 do veredito "2026-11-22 16:00" dela).

**Resta:** o commit parcial, o 2.1 depois que a 167 liberar build e navegador, e o `coverage:check`, do revisor, no fechamento. Sem
execução nova desta plan até a 167 fechar.

**Status da plan: 🟡 Em execução.**

## Resumo da execução (passo 2.1, decisão H1 a) — 2026-11-22

**Resultado:** Concluído com pendências: os achados que esperam a 167 ou o dono e o `cromo-css-real:check`.

**Estado do worktree ao iniciar**
`git status --short` antes da primeira edição: trabalho concorrente da 167 e de outras tarefas em `browser-tests/`, `dist/`, `docs/`, `sarak-dev/`, `sarak-ui/`, `gates/scripts/audit/auditor_ghostvars.mjs`, `src/components/Layout/chrome/`, `Buttons/SarakButton.tsx`, `Cards/`, `SarakShellUserWidget`, os 25 temas, `schema/colors.ts`, `Design/hooks/{designVariableHelpers,useDesignVariables}.ts`, `Provider/{constants,manifest}.ts`, `color-engine.ts`, `removedTokenKeys.ts`, os snapshots de `PreviewCanvas`, `CardsCatalog`, `AtmosphereCatalog`, `SarakActionCard`, `SarakTitleCard` e `SarakDataTable`, `Main/components/Theme*`, `_elements.css` e `?? browser-tests/contraste-hover-botao.spec.ts`. Nenhum dos arquivos que editei estava nessa lista. No fim, `git status --short` comparado com a fotografia acusa só os 16 arquivos abaixo.

**O que foi feito**
- `gates/scripts/audit/auditor_hardcoded.mjs`: o gate passou a varrer `.ts` além de `.tsx` (`SCANNED_EXTENSIONS`; `.d.ts` fica de fora). O comentário de "ponto cego conhecido" virou a declaração do escopo. As três isenções estão escritas no cabeçalho, cada uma com o motivo:
  - `DESIGN_DATA_DIRS`: `.ts` de `presets/`, `schema/` e `palette/`. Um `.tsx` nessas pastas continua cobrado.
  - `COLOR_MATH_FILES`: os três caminhos exatos.
  - `CONTAINER_QUERY_CONDITION_RE`: tira da leitura só a condição `@min-[…]`/`@max-[…]`. A classe que ela liga continua cobrada.
- O detector estrutural também lê `.ts`. Medido: ele fica em 0, porque só acha classe dentro de `className` ou de um helper de classe.
- `gates/scripts/audit/__tests__/auditor_hardcoded.ts-scope.test.mjs` (novo): 11 casos do próprio gate. Cobre o `.ts` em `components/`, o tema, `schema/` e `palette/`, um `.tsx` em pasta de dado, o `.d.ts`, o marcador, a condição isenta contra a classe cobrada, o `.tsx` com condição e a matemática de cor pelo caminho exato contra o mesmo nome em outra pasta.
- Correções no código, dentro do teto (14 arquivos de `src/`, teto 25):
  - `overlayPreferences.ts`: o `'14px'` de reserva virou `DEFAULT_BODY_SIZE`, lido do `defaultValue` de `bodySize` no schema (o valor é o mesmo).
  - `manifest-transformers.ts`: a sombra em camadas virou a lista `LAYERED_SHADOW_STEPS` com `join`. O template de várias linhas não aceitava o marcador no meio. O valor CSS é o mesmo, sem as quebras de linha.
- Os demais achados meus viraram isenção pontual (lista abaixo). Em todos, a saída fica idêntica.

**Medição (raiz, só leitura)**
| Momento | Valor | Arquivos de código |
|---|---|---|
| gate do `HEAD` (só `.tsx`) | 0 | — |
| `.ts` sem nenhuma isenção | 1080 | 80 (51 dado de design: 951; 3 matemática de cor: 5; 26 código: 124) |
| com as três isenções de escopo | 99 | 20 (a condição de container query respondia por 25) |
| depois das correções e isenções pontuais | **34** | 7, todos em espera (abaixo) |

**Isenções pontuais (`sarak-allow-hardcode:` com motivo)**
| Arquivo | Linhas do `HEAD` | Motivo escrito |
|---|---|---|
| `atomic/hooks/buttonStyles.ts` | 27, 33, 40, 41, 56 | o raio do brilho neon (5 a 20 px) é desenho do acabamento, sem token |
| `atomic/hooks/buttonStyles.ts` | 77 | a sombra é só a reserva composta de `var(--sarak-dynamic-shadow)`; o detector só limpa reserva de valor único |
| `atomic/hooks/choiceStyles.ts` | 22, 37 | piso funcional: `--sarak-border-width` aceita 0 e apagaria o controle desmarcado |
| `atomic/hooks/inputStyles.ts` | 15, 17, 18 | piso funcional: o traço de 2 px é o desenho das variantes sublinhada e tracejada, e o de 1 px é o contorno do campo; o token aceita 0 |
| `atomic/hooks/neumorphismStyles.ts` | 5, 6, 9, 10 | os deslocamentos e o desfoque da sombra dupla são o relevo do neumorfismo, sem token |
| `atomic/hooks/switchStyles.ts` | 17, 19 | piso funcional: o contorno de 1 px do vidro sustenta o contraste de 3:1 |
| `atomic/hooks/switchStyles.ts` | 52, 53 | os raios assimétricos são o desenho da variante, sem token |
| `atomic/hooks/useStructuralStyles.presets.ts` | 40 | a coluna mínima de 280 px da estratégia auto-fit; o Tailwind exige a classe literal |
| `engines/charts/SubEngines/categoricalPalette.ts` | 52 | o ECharts desenha em canvas, que não lê `var()`; é a reserva do cálculo |
| `engines/charts/SubEngines/useEChartsTheme.ts` | 10, 11 | idem |
| `DesignEngine/Canvas/hooks/useDeviceStyles.ts` | 12, 13 | 768 e 375 px são a largura do aparelho simulado na prévia |
| `DesignEngine/Canvas/hooks/useDeviceStyles.ts` | 20, 23, 25 | o raio, a moldura e a sombra desenham o aparelho simulado; classe literal |
| `DesignEngine/Canvas/panelResponsive.presets.ts` | 16, 21, 23, 28 | a largura mínima da opção na grade, conferida pelo teste companheiro; classe literal |
| `DesignEngine/Canvas/panelResponsive.presets.ts` | 42, 43 | a altura de 32rem da coluna empilhada; classe literal |
| `core/Design/resolveToken.ts` | 109 | os comprimentos são exemplos no texto do aviso ao desenvolvedor |
| `core/Provider/fontLoader.ts` | 76 | `1em` é exigido pela sintaxe de `font` em `document.fonts.load`; a sonda não desenha nada |
| `core/Provider/utils/manifest-transformers.ts` | 3, 9-13, 31, 40-42 | o transformador é a origem do valor do token; não há `var()` para onde levá-lo |

**Achados em espera (não corrigidos, fora do baseline, sem isenção) — os 34 que o gate acusa hoje**
- **Espera a 167** (área dela):
  - `src/components/Layout/chrome/chromeStructuralStyles.ts:72` (`, 1px)`) e `noiseTexture.ts:16` (`200px 200px`).
  - `src/components/atomic/hooks/buttonStyles.ts` (linhas 29, 36 e 73 no worktree): o contorno `1px solid` do botão neon e do fosco. O conserto certo é `var(--sarak-border-width, 1px)`, como no ramo cyberpunk do mesmo arquivo. Mas `Buttons/__tests__/SarakButton.test.tsx:30` fixa `toContain('1px solid')` e reprovaria. Fica para quando a 167 fechar, e o teste muda junto.
- **Espera o dono do trabalho não commitado** (os arquivos já estavam modificados na fotografia e não constam da lista da 167 que recebi; não li o diff). Os 29 achados já existem no `HEAD`: rodei o gate novo sobre a versão de `git show HEAD:` e deu a mesma contagem.
  - `src/core/Design/hooks/designVariableHelpers.ts`: 91, 107 (5 hex).
  - `src/core/Design/hooks/useDesignVariables.ts`: 63, 193, 199 (5 hex).
  - `src/core/Provider/constants.ts`: 21, 36-38, 43-45 (7 hex).
  - `src/core/Provider/manifest.ts`: 29-81 (12 hex).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/audit/auditor_hardcoded.mjs` | alterado | `.ts` varrido; três isenções de escopo com motivo; condição de container query fora da leitura |
| `gates/scripts/audit/__tests__/auditor_hardcoded.ts-scope.test.mjs` | criado (não rastreado) | 11 casos do gate |
| `src/components/atomic/hooks/{buttonStyles,choiceStyles,inputStyles,neumorphismStyles,switchStyles,useStructuralStyles.presets}.ts` | alterado | só comentários de isenção |
| `src/components/engines/charts/SubEngines/{categoricalPalette,useEChartsTheme}.ts` | alterado | só comentários de isenção |
| `src/features/DesignEngine/Canvas/hooks/useDeviceStyles.ts`, `Canvas/panelResponsive.presets.ts` | alterado | só comentários de isenção |
| `src/core/Design/resolveToken.ts`, `src/core/Provider/fontLoader.ts` | alterado | só comentários de isenção |
| `src/core/Provider/utils/manifest-transformers.ts` | alterado | isenções e `LAYERED_SHADOW_STEPS` |
| `src/core/Provider/utils/overlayPreferences.ts` | alterado | `DEFAULT_BODY_SIZE` do schema no lugar de `'14px'` |
| esta plan | alterado | este bloco e o `status` |

**Verificações executadas**
- Mutação, com os dois gates na cópia fora da raiz e a fixture em `C:\tmp\fx`, caso `export const LAYOUT = 'shrink-0 w-[12px]';`:

  | Onde plantei | gate do `HEAD` | gate novo |
  |---|---|---|
  | `src/components/atomic/DataDisplay/Fixture/fixtureLayout.ts` | exit 0, Valor 0 (passava) | **exit 1, Valor 1** |
  | `src/core/Design/presets/themes/fixture-theme.ts` | exit 0 | **exit 0** |
- `npx vitest run gates/scripts/audit/__tests__/auditor_hardcoded*` → 4 arquivos, 20/20 (11 novos e 9 antigos).
- `npx vitest run` das pastas tocadas e das que as consomem (`atomic/hooks`, `atomic/Inputs`, `atomic/Navigation`, `atomic/Templates`, `engines/charts/SubEngines`, `core/Provider`, `core/Design/__tests__`, `core/Design/palette`, `core/Design/presets/components`, `DesignEngine/Canvas/{hooks,__tests__,components/__tests__}`) → 320 arquivos; 2926/2928 verdes.
  - Os 2 vermelhos: `PreviewCanvas.test.tsx` ("propriedades de estilo reais") e `CardsCatalog.test.tsx` (snapshot). Os snapshots deles já estavam modificados na fotografia.
  - Controle: na cópia, com os meus 14 arquivos de `src/` trocados pela versão do `HEAD`, os dois falham igual (2 failed, 9 passed). Não são desta entrega. Não usei `-u`.
- Build na cópia `C:\tmp\p169-build`: tar dos arquivos rastreados e não rastreados, mais junção do `node_modules`.
  - A cadeia de `npm run build` rodou passo a passo, com `GIT_DIR` passado só às duas chamadas de `generate-build-info` (`git rev-parse HEAD`). **25/25 passos ok.**
  - O último passo (`test:optional-peers`) exige `npm_execpath`. Rodei-o com `npm run test:optional-peers`, sem `GIT_DIR` → exit 0, "pass: Vite 8 build with all optional peers".
- CSS: recompilei `dist/sarak.css` com os meus 14 arquivos de `src/` no estado do `HEAD`. Ficou **idêntico byte a byte** ao do build (281.114 bytes): os comentários não geram classe.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` na cópia → exit 1. A única linha é `auditor_hardcoded.mjs.valor: 0 -> 34`, os 34 em espera acima. `tsc` e os demais auditores sem regressão.
- Desmontagem: `fs.unlinkSync` da junção (confirmei `isSymbolicLink`), depois a cópia apagada. O `node_modules` real está intacto. `git status --short` final = fotografia + os 16 arquivos desta entrega.
- Não rodei `npm run verify -- --tier=quick`: o `tsc` e o baseline já rodaram na cópia, e o Anel 1 não rodou. Não rodei a bateria de navegador nem o build na raiz.

**Critérios de aceite (2.1)**
- [x] O gate varre `.ts`, com as três isenções escritas e cada motivo — `auditor_hardcoded.mjs`, cabeçalho de `SCANNED_EXTENSIONS`/`DESIGN_DATA_DIRS`/`COLOR_MATH_FILES`/`CONTAINER_QUERY_CONDITION_RE`.
- [x] Mutação: a classe com medida num `.ts` de `src/components/` reprova, e o mesmo valor num tema passa (tabela acima e teste do gate).
- [x] Teto de 25: 14 arquivos de `src/`, 16 com o gate e o teste.
- [x] Isenções pontuais listadas com motivo; nada entrou no baseline.
- [x] Build novo na cópia: 25/25.
- [ ] Gate verde e `check-audit-baseline --with-tsc` sem regressão — **não**: 34 achados em espera (3 + 2 da 167, 29 do dono dos arquivos de Provider e Design/hooks).
- [ ] `npm run cromo-css-real:check` sozinho — pendente, depois que a 167 fechar a bateria dela.

**Decisões e suposições**
- Uso `var(--sarak-border-width, 1px)` só onde o contorno é decorativo. Onde o contorno é a única demarcação do controle (campo, caixa de seleção, trilho do switch), o token aceita 0 e apagaria o controle. Ali o valor ficou como piso funcional, com isenção, como a lib já faz no marcador de hoje do calendário.
- Toquei os dois arquivos de `engines/charts/` (a §3.2 os listava como da 168) só com comentário. A 168 está aprovada e commitada (7febd22b), e eles não estavam modificados na fotografia.
- Isenção de dado de design só para `.ts`: não há `.tsx` nessas pastas hoje, e um futuro componente ali continua cobrado.
- A isenção da condição de container query vale também em `.tsx`: a regra é a mesma. Os `.tsx` seguem em 0.
- Tratei os 4 arquivos de Provider e Design/hooks como de outra tarefa, porque já estavam modificados na fotografia, mesmo fora da lista da 167.

**Achados fora do escopo (não corrigidos)**
- `auditor_hardcoded.mjs`: identificadores em português anteriores a esta entrega (`nomes`, `textoAntes`, `textoDepois`, `atual`, `pai`, `nomeVariavel`, `structuralBruto`), apontados pelo hook de ADR-023.
- `PreviewCanvas.test.tsx` e `CardsCatalog.test.tsx` vermelhos no worktree de hoje, com os snapshots em edição por outra tarefa.

**Pendências / riscos**
- O gate só fica verde quando os 34 achados em espera forem tratados pelos donos. Até lá, o `audit:baseline` bloqueia o commit desta entrega.
- `npm run cromo-css-real:check`, sozinho, depois da bateria da 167.
- `coverage:check`, do revisor, no fechamento.

## Veredito — 2026-11-22 19:03 — passo 2.1 — 🔵 Em correção (o gate entregue deixa a raiz vermelha)

**Como medi:** gates na raiz. Cópia do worktree com mutações do revisor no `auditor_hardcoded` e o `vitest` de
`gates/scripts/audit/__tests__` (169 de 169). Os quatro arquivos dos 29 achados conferidos contra a plan-167.

**Aprovado:**
- o escopo novo do gate e as três isenções, com o motivo de cada uma;
- a mutação do revisor: medida literal num `.ts` de `components/` reprova; a mesma classe atrás de `@min-[…]` também reprova; a
  condição sozinha passa; hex num tema passa; hex em `Design/hooks/` reprova; um nome parecido com o da matemática de cor, em outra
  pasta, reprova;
- `DEFAULT_BODY_SIZE` lido do schema e `LAYERED_SHADOW_STEPS` com o mesmo valor;
- as isenções pontuais. O brilho do neon e o relevo do neumorfismo ficam isentos porque criar token público novo está fora do escopo
  desta plan. A síntese registra isso.
- Medido e não é falha desta entrega: o marcador vale para a própria linha e para a de baixo, regra que já estava no `HEAD`.

**Achados, nesta ordem:**

1. **A raiz está vermelha por causa desta entrega e bloqueia o commit de todas as plans, inclusive o da 167.** O `audit:baseline` foi de
   0 para 34 no `auditor_hardcoded`, e o hook mede o worktree. É a mesma falha do achado 1 da 167. Tire do worktree a mudança do gate e
   o teste novo dele:
   - guarde os dois num patch em `%TEMP%`;
   - volte `auditor_hardcoded.mjs` ao `HEAD` e retire o teste;
   - os comentários de isenção nos 14 arquivos ficam: o gate de hoje não os lê.
   Prova: o `audit:baseline` da raiz sem a linha do `auditor_hardcoded`.
2. **Os 29 achados "do dono do trabalho não commitado" são da plan-167.** `designVariableHelpers.ts`, `useDesignVariables.ts`,
   `constants.ts` e `manifest.ts` estão no escopo da D1 dela. O prompt do revisor não citou esses arquivos: a falha é do revisor. Os
   29 já existem no `HEAD` e são hardcode de verdade: reserva de cor repetida no transformador e nos padrões. Eles se corrigem como o
   `bodySize`, lendo o padrão do schema. Isenção só com motivo de verdade, e nada no baseline.
3. **Os 5 achados da área da 167** (`chromeStructuralStyles.ts`, `noiseTexture.ts`, o `1px solid` de `buttonStyles.ts`) se corrigem
   como o próprio resumo propõe. O `SarakButton.test.tsx` muda junto.

**Ordem:** o achado 1 agora. Os achados 2 e 3 e a reaplicação do patch vêm depois do commit da 167. Depois, `npm run cromo-css-real:check`
sozinho, com o gate em 0. Um único commit leva o gate, o teste e as correções.

**Fora desta plan:** o `variable-contract:check` da raiz está vermelho no `SarakTitleCard.tsx:99` (reserva `#f2f6fb`). É o achado 4 da
167, em execução.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção 7: achado 1 do veredito "2026-11-22 19:03") — 2026-11-22

**Resultado:** Concluído (só o achado 1). Os achados 2 e 3, a reaplicação do patch e o `cromo-css-real:check` ficam para depois do commit da 167.

**Estado do worktree ao iniciar**
`git status --short`: 215 linhas. É a fotografia da execução anterior (trabalho da 167 e de outras tarefas) mais os 16 arquivos desta plan, entre eles `M gates/scripts/audit/auditor_hardcoded.mjs` e `?? gates/scripts/audit/__tests__/auditor_hardcoded.ts-scope.test.mjs`.

**O que foi feito**
- Gravei a mudança do gate e o teste novo num patch: `C:\Users\Igor\AppData\Local\Temp\plan-169-auditor-hardcoded-ts.patch`.
  - Tem 10.158 bytes e dois blocos `diff --git`: `auditor_hardcoded.mjs` e o teste novo, este como arquivo criado (`--- /dev/null`).
  - Montei o patch com `git diff --binary` do auditor e `git diff --no-index --binary /dev/null <teste>`.
- Conferi a reaplicação numa cópia fora do repositório (`C:\tmp\p169-patchcheck`, já apagada).
  - A cópia partiu do `auditor_hardcoded.mjs` de `git show HEAD:`.
  - `git apply --check` e `git apply` passaram.
  - Os dois arquivos resultantes ficaram iguais aos do worktree, comparados sem o `\r`.
- Voltei `auditor_hardcoded.mjs` ao `HEAD` (`git show HEAD:… >` o arquivo). O blob do disco, do índice e do `HEAD` é o mesmo: `26de7c7f`.
- Retirei o teste novo do worktree (`fs.rmSync`).
- Os comentários `sarak-allow-hardcode:` dos 14 arquivos de `src/`, o `DEFAULT_BODY_SIZE` e o `LAYERED_SHADOW_STEPS` ficaram como estavam.
- Não toquei os arquivos da plan-167, nem os quatro dos 29 achados.

**Verificações executadas**
- `npm run audit:baseline` na raiz → exit 0: `[audit:baseline] igual ao baseline de 2026-10-12 — nenhuma regressão.` A linha do `auditor_hardcoded` sumiu.
- `git status --short` final comparado com o inicial: a única diferença é a saída de `?? gates/scripts/audit/__tests__/auditor_hardcoded.ts-scope.test.mjs`.
  - `auditor_hardcoded.mjs` ainda aparece como ` M`, mas `git diff --quiet` não acusa diferença e o blob é o mesmo do `HEAD`. Sobrou só o carimbo de data do índice, que o `git status` não renovou.
  - Não rodei `git update-index --refresh` porque escreve no índice.

**Critérios de aceite (achado 1)**
- [x] Patch em `%TEMP%`, com o caminho completo acima, que reaplica numa cópia.
- [x] Auditor no `HEAD` e teste fora do worktree.
- [x] Comentários de isenção mantidos nos 14 arquivos.
- [x] `audit:baseline` da raiz sem a linha do `auditor_hardcoded`.

**Pendências / riscos**
- Depois do commit da 167, nesta ordem:
  1. Os achados 2 e 3 (os 29 hex lidos do padrão do schema, e os 5 da área da 167 com o `SarakButton.test.tsx`).
  2. A reaplicação do patch.
  3. `npm run cromo-css-real:check` sozinho, com o gate em 0.
  4. Um único commit para o gate, o teste e as correções.
- O patch foi gerado contra o `HEAD` `f10c36b2`. Se o commit da 167 mexer em `auditor_hardcoded.mjs`, ele pode precisar de ajuste.

## Veredito — 2026-11-22 19:11 — correção 7 (achado 1) — 🟡 Aprovado; o resto do 2.1 espera o commit da 167

**Como medi:** na raiz, `audit:baseline`, `variable-contract:check` e `dev-kit:check` verdes. O `auditor_hardcoded.mjs` está igual ao
`HEAD` e o teste novo saiu do worktree. O patch `C:\Users\Igor\AppData\Local\Temp\plan-169-auditor-hardcoded-ts.patch` aplica no worktree
e, sobre o `HEAD`, devolve o auditor e o teste idênticos aos que o revisor testou com mutação no veredito "19:03". Os 46 marcadores de
isenção continuam em `src/`.

**Segue, depois do commit da 167:** os achados 2 e 3 do veredito "19:03", a reaplicação do patch, o `cromo-css-real:check` sozinho e um
commit único.

**Status da plan: 🟡 Em execução.**

## Resumo da execução (correção 8: achado 2 do veredito "2026-11-22 19:03", nos quatro arquivos) — 2026-11-22

**Resultado:** Concluído com uma decisão pendente: 2 dos 29 achados (`buttonColor` e `buttonHoverColor` do seed) não têm token no schema, e a escolha vai ao dono, abaixo.

**Estado do worktree ao iniciar**
`git status --short`: 214 linhas. É a fotografia da correção 7. Os quatro arquivos já tinham as mudanças da D1 da 167 (sem `colorDepth`/`colorVariation`, nem `variantShape`, nem o terceiro argumento de `computeColorVariants`). Li só o diff desses quatro, para preservá-lo. As mudanças da D1 ficaram intactas: nenhuma linha minha cai num trecho que a D1 mexeu.

**O que foi feito**
- `src/core/Provider/manifest.ts` (12 achados): as 14 entradas de cor passam por `colorVariantsWithSchemaDefault(tokenId)`, que usa como reserva o `defaultValue` do token, lido de `sarakGetDefaultDesignState()`.
  - `errorColor`, `successColor` e `warningColor` leem `statusErrorColor`, `statusSuccessColor` e `statusWarningColor`. São os tokens que emitem a mesma variável, com o mesmo valor.
  - As duas `rgba` (`cardBackgroundColor`, `cardBorderColor`) não eram achado, mas repetiam a mesma reserva e entraram no mesmo leitor.
- `src/core/Provider/constants.ts` (5 de 7): `primaryColor`, `secondaryColor`, `tertiaryColor`, `textureColor` e `titleColor` do `DEFAULT_INDUSTRIAL_SEED` leem `SCHEMA_DEFAULTS`.
- `src/core/Design/hooks/useDesignVariables.ts` (5):
  - a âncora do modo virou `MODE_ANCHOR_DARK`/`MODE_ANCHOR_LIGHT`;
  - a reserva do primário virou o `defaultValue` de `primaryColor`, do mesmo `tokens` que a linha do título já usa;
  - o texto sobre o primário virou `ON_COLOR_DARK`/`ON_COLOR_LIGHT`, que já existiam com os mesmos valores.
- `src/core/Design/hooks/designVariableHelpers.ts` (5):
  - O fundo de reserva do corpo virou `DEFAULT_BODY_BG` (`colorBgBody` do schema) no escuro e a âncora branca no claro.
  - O título de reserva virou o `tokenDefault` que a função já recebe no escuro (sem ele, `ON_COLOR_LIGHT`) e `ON_COLOR_DARK` no claro.
  - O JSDoc citava `#ffffff` como padrão do token, mas o schema diz `#f2f6fb`, inclusive no `HEAD`. Ficou sem o valor.
- `src/core/Provider/utils/on-color.ts` (um dos três arquivos de matemática de cor isentos): acrescentei `MODE_ANCHOR_DARK = '#000000'` e `MODE_ANCHOR_LIGHT = '#ffffff'`, com o motivo no JSDoc: são operandos do cálculo das variantes e dos canais, não cor de tema.
- Nenhuma isenção nova: os 27 achados corrigidos viraram leitura do schema ou de uma constante do arquivo de matemática de cor.

**Valores que mudam** (só na reserva, que entra quando o valor chega vazio)
| Onde | Antes | Agora (padrão do schema) |
|---|---|---|
| manifesto `primaryColor` | `#3b82f6` | `#19e3f0` |
| manifesto `secondaryColor` | `#6366f1` | `#7c5cff` |
| manifesto `tertiaryColor` | `#10b981` | `#34d399` |
| manifesto `accentColor` | `#f43f5e` | `#ff4fd8` |
| manifesto `surfaceColor` | `#1e293b` | `#101622` |
| manifesto `textureColor` | `#ffffff` | `#cfe9ff` |
| manifesto `sidebarColor`, `topbarColor` | `#000000` | `#04060a` |
| manifesto `cardBackgroundColor` | `rgba(30, 41, 59, 0.4)` | `#101622` |
| manifesto `cardBorderColor` | `rgba(255, 255, 255, 0.1)` | `rgba(255, 255, 255, 0.09)` |
| manifesto `titleColor` | `#ffffff` | `#f2f6fb` |
| seed `primaryColor`, `textureColor` | `#00f2ff` | `#19e3f0`, `#cfe9ff` |
| seed `secondaryColor`, `tertiaryColor`, `titleColor` | `#6366f1`, `#10b981`, `#ffffff` | `#7c5cff`, `#34d399`, `#f2f6fb` |
| `useDesignVariables`, reserva do primário | `#3b82f6` | `#19e3f0` |
| `emitOnColors`, corpo no escuro sem literal | `#050505` | `#06080d` |
| `resolveTitleColor`, sem nada declarado | escuro `#ffffff`, claro `#0f172a` | escuro: o padrão do token (`#f2f6fb`); claro: `#020617` |

Nos status (erro, sucesso, aviso), na âncora e no texto sobre o primário, o valor não muda.

Alcance:
- No manifesto, `computeColorVariants(String(v), …)` só usa a reserva quando `String(v)` é vazio.
- O seed não tem leitor nenhum em `src/`, `scripts/`, `gates/`, `bin/`, `sarak-ui/`, `sarak-dev/` e `docs/`, e não sai no barril.
- O `SARAK_DESIGN_MANIFEST` é exportado em `src/index.ts`. Um importador que chame `transform('')` recebe as variantes do padrão novo.

**Decisão pendente (dono)**
- `constants.ts:48-49` (linhas do worktree): `buttonColor: '#00f2ff'` e `buttonHoverColor: '#60a5fa'` do `DEFAULT_INDUSTRIAL_SEED`. Nenhum dos dois é token do schema, então não há padrão para ler.
  - (a) **Recomendação:** remover o `DEFAULT_INDUSTRIAL_SEED` inteiro. Ele não tem leitor e não é público; a D1 já tirou dele `colorDepth`/`colorVariation`.
  - (b) Remover só as duas chaves.
  - (c) `buttonColor` lê `btnPrimaryBg` (mesmo papel, `#19e3f0`) e `buttonHoverColor` sai.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/manifest.ts` | alterado | `SCHEMA_DEFAULTS` e `colorVariantsWithSchemaDefault`; 14 entradas de cor |
| `src/core/Provider/constants.ts` | alterado | `SCHEMA_DEFAULTS`; 5 cores do seed |
| `src/core/Design/hooks/useDesignVariables.ts` | alterado | âncora, primário e texto sobre o primário |
| `src/core/Design/hooks/designVariableHelpers.ts` | alterado | `DEFAULT_BODY_BG`, âncora, título de reserva e JSDoc |
| `src/core/Provider/utils/on-color.ts` | alterado | `MODE_ANCHOR_DARK`/`MODE_ANCHOR_LIGHT` |
| esta plan | alterado | este bloco |

Teto: são 19 arquivos de `src/` nesta plan (os 14 do 2.1 e estes 5), dentro dos 25.

**Verificações executadas**
- Os 29 achados, com o gate do patch `C:\Users\Igor\AppData\Local\Temp\plan-169-auditor-hardcoded-ts.patch` aplicado numa cópia `C:\tmp\p169-gate` (`src/` e `gates/` do worktree, mais junção do `node_modules`): o Valor foi de **34 para 7**.
  - Os 7 que restam: os 5 da área da 167 (`buttonStyles.ts` 29/36/73, `chromeStructuralStyles.ts:72`, `noiseTexture.ts:16`) e os 2 do seed acima. Zero em `manifest.ts`, `useDesignVariables.ts` e `designVariableHelpers.ts`.
  - A junção saiu com `fs.unlinkSync`, depois a cópia foi apagada, e o `node_modules` real está intacto.
- `node node_modules/typescript/bin/tsc --noEmit` na raiz → exit 0, 0 erros.
- `npx vitest run` das pastas tocadas e das que as consomem (`src/core/Design`, `src/core/Provider`, `Layout/chrome`, `atomic/{Cards,Feedback,Navigation,Tables/hooks}`, `engines/charts/SubEngines`, `DesignEngine/{Canvas/Mocks,Canvas/components,Panels,hooks}`, `src/styles`) → **296 arquivos, 3277/3277 verdes**. Sem `-u`.
- `npm run audit:baseline` na raiz, com o gate no `HEAD` → "igual ao baseline de 2026-10-12 — nenhuma regressão".
- `git status --short` final comparado com o inicial: só entrou ` M src/core/Provider/utils/on-color.ts`. Os outros quatro já estavam modificados.
- Sem build, sem navegador, sem commit.

**Critérios de aceite (achado 2, nos quatro arquivos)**
- [x] Cada cor repetida lê o padrão do schema (ou a constante de matemática de cor), sem isenção nova — 27 de 29, gate do patch na cópia.
- [x] Mudanças da D1 preservadas — nenhuma linha da D1 no meu diff; tsc 0; 3277/3277.
- [ ] `buttonColor`/`buttonHoverColor` do seed — decisão do dono (acima).

**Decisões e suposições**
- A âncora preto/branco foi para `on-color.ts` em vez de virar isenção pontual: ela é matemática de cor, e esse arquivo já é isento por isso.
- No claro, o fundo de reserva é a própria âncora branca. Era o mesmo `#ffffff`, e o schema não declara padrão do modo claro.
- No claro, o título de reserva é `ON_COLOR_DARK`: o schema não tem padrão claro de `titleColor`, e essa é a tinta que o motor já usa sobre fundo claro.
- `on-color.ts` é o único arquivo fora dos quatro, e o acréscimo é de duas constantes.

**Pendências / riscos**
- A decisão do seed.
- Depois do commit da 167:
  1. os 5 achados da área dela;
  2. a reaplicação do patch;
  3. `npm run cromo-css-real:check` sozinho;
  4. o commit único.

## Veredito — 2026-11-22 19:56 — correção 8 (os 29 achados nos quatro arquivos) — 🔵 Em correção (um teste do painel deixou de carregar)

**Como medi:** diff dos cinco arquivos lido linha a linha. A D1 da 167 está preservada. `vitest` dos testes que simulam
`core/Design/master-map`. Controle numa cópia do worktree: só o mock com a função nova.

**Aprovado:**
- cada reserva de cor passa a ser o padrão do token no schema. É a mesma regra que o `variable-contract` cobra: reserva = padrão do
  token;
- a âncora preta e branca foi para `on-color.ts`, que já é isento como matemática de cor;
- a tabela de valores que mudam é honesta. Eles só valem quando o valor chega vazio;
- o JSDoc que citava o padrão errado foi corrigido.

**Achados, nesta ordem:**

1. **`src/features/DesignEngine/Main/__tests__/MasterControlPanel.test.tsx` não carrega por causa desta entrega.** O mock de `master-map` não
   define `sarakGetDefaultDesignState`, que `manifest.ts`, `constants.ts` e `designVariableHelpers.ts` agora chamam ao importar.
   Medido na cópia: com a função no mock, o arquivo passa 7 de 7; sem ela, não carrega. Pôr a leitura dentro das funções não basta, porque
   a de `constants.ts` continua no import. O mock ganha a função, e ela devolve o padrão de verdade
   (`vi.importActual`), para o teste não fixar outro valor.
2. **A seleção de pastas deixou de fora um consumidor.** Os três arquivos são importados por quase toda a lib. A prova desta correção é a
   suíte inteira (`npx vitest run`), com os vermelhos atribuídos por controle contra o `HEAD`.
3. **`SARAK_DESIGN_MANIFEST` é público, e a reserva de 14 cores mudou.** A entrada 9.0.0 de `docs/migracoes.md` ganha uma linha: a
   reserva passa a ser o padrão do token. Essa linha entra no commit final, depois do commit da 167, que também edita esse arquivo.

**Decisão S1 do dono** (`buttonColor` e `buttonHoverColor` do `DEFAULT_INDUSTRIAL_SEED`): o revisor recomenda **(a)**, remover a semente
inteira. Medido: o único uso dela em `src/`, `scripts/`, `gates/`, `bin/`, `sarak-ui/`, `docs/` e `browser-tests/` é a própria
declaração, e ela não sai no barril. Com (a), a leitura do schema no import de `constants.ts` também some.

**Status da plan: 🔵 Em correção.**

## Nota do revisor — 2026-11-22 20:08 — decisão S1 do dono: (a)

O `DEFAULT_INDUSTRIAL_SEED` sai inteiro de `src/core/Provider/constants.ts`, preservando a D1 da 167 no arquivo. O resto do veredito
"correção 8" vale como está.

## Veredito — 2026-11-22 21:02 — correção 9 (achados 1 e 2 do veredito "correção 8", S1 a) — 🟡 Aprovado; o resto do 2.1 espera o commit da 167

**Como medi:**
- `constants.ts`: o diff contra o `HEAD` só apaga a semente, e ela não tem mais nenhum uso fora de `specs/` e `dist/`;
- o mock do `MasterControlPanel` devolve a função real;
- `vitest` de `src/core` e de `DesignEngine/Main` na raiz: 2395 de 2395, em 196 arquivos;
- `tsc` 0; `audit:baseline`, `variable-contract:check` e `dev-kit:check` verdes.

**Aceito da execução:** a suíte inteira, 7024 de 7024, e os 5 achados restantes com o patch do gate, todos na área da 167.

**Falta no registro:** o resumo desta correção veio só na conversa. Ele entra nesta plan junto com o resto do 2.1.

**Segue, depois do commit da 167:** a reaplicação do patch, os 5 achados, a linha da migração, o `cromo-css-real:check` sozinho e o
commit único.

**Status da plan: 🟡 Em execução.**

## Nota do revisor — 2026-11-23 01:30 — o commit da 167 leva as correções 7 a 9; dois itens entram no resto do 2.1

- As correções 7 a 9 vão no commit da plan-167, porque dividem arquivos com ela e foram testadas juntas (duas baterias e 7024 de 7024). O
  commit único desta plan fica com o patch do gate, os 5 achados, a linha da migração e os dois itens abaixo.
- **`fontes-no-painel.spec.ts:59`:** a espera aceita qualquer face `Outfit` carregada, mas a linha 60 confere o peso 700. Esperar por
  `document.fonts.load('700 32px "Outfit"')`, ou pela própria conferência, antes do `expect`. Sem afrouxar o `expect`. Rodar com
  `--repeat-each`.
- **`chromeToneContrast.ts:12`:** `ICON_MINIMUM` ficou sem leitor desde a plan-167. Remover a constante.
- O resumo da correção 9 veio só na conversa. Ele entra no resumo do resto do 2.1.

**Status da plan: 🟡 Em execução.**
