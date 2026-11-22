---
tipo: "plan"
titulo: "Deixar a bateria de navegador verde num build novo e corrigir o contraste do hover de botão e do SarakTitleCard"
objetivo: "Fazer o cromo-css-real:check passar inteiro num build novo do HEAD antes da tag 9.0.0, decidindo caso a caso se o teste ficou velho ou se o código perdeu algo, e levar a 4,5:1 o botão sob o ponteiro e o texto do SarakTitleCard"
dominio: "Qualidade / Bateria de navegador e contraste"
status: "🔵 Em correção"
prioridade: "Alta"
tags: ["plan", "navegador", "contraste", "acessibilidade", "release-9-0-0"]
relacionados: ["[[10-seguranca-e-acessibilidade]]", "[[05-cromo-e-slots]]", "[[06-painel-de-customizacao-e-preview]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/10-seguranca-e-acessibilidade.md + specs/05-cromo-e-slots.md"
---

# 1. Objetivo

A tag 9.0.0 sai com a bateria de navegador (`npm run cromo-css-real:check`) inteira verde num build novo. Um botão sob o ponteiro e o
texto do `SarakTitleCard` ficam em ao menos 4,5:1 contra o próprio fundo, nos dois modos.

# 2. Contexto

Três itens do backlog, promovidos a esta plan pelo dono em 2026-11-21 para entrar antes da tag:

1. **#92 — 8 casos falham num build novo.** O controle do revisor de 2026-11-20 (cópia `git archive HEAD` com build completo) mostrou
   isso. Hoje os casos passam só porque o `dist/` rastreado é o da 8.0.0. O `npm version` reconstrói e commita o `dist/`, e o `gates:full`
   não roda navegador: a tag sairia com esses casos vermelhos sem ninguém ver.
   - `browser-tests/cartao-cede-a-classe.spec.ts` (material, modos app e embarcado, 2 casos): o gradiente da classe sai `none`. A fixture
     `browser-tests/fixtures/harness-entry.tsx` usa classes de gradiente com valor arbitrário que nenhum fonte de `src/` cita, e o
     Tailwind da lib não varre `browser-tests/`. É o mesmo caso que o backlog #83 registrou em 2026-11-14, que sai do backlog por esta plan.
   - `browser-tests/seletor-da-barra-legivel.spec.ts` (6 casos): espera 2 botões com `aria-pressed` no menu de preferências e acha 0. A
     plan-159 trocou as escolhas do menu por linhas com seleção (`menuitemradio`) e criou o grupo compacto da barra
     (`ShellPreferenceChoiceGroup`), ver [[05-cromo-e-slots]] §2.2.2.
   - Na mesma bateria há dois vermelhos de fora do #92:
     - `browser-tests/plan-135-paletas-no-painel.spec.ts` já falha no `HEAD`: não acha o grupo "Paletas prontas", porque a galeria de
       paletas virou grupos na plan-164.
     - `browser-tests/fontes-no-painel.spec.ts` é intermitente, no caso "bundled".
2. **#90 — hover global de botão.** A regra `button:hover:not(.p-0)` (`src/styles/_elements.css`, linha 91) pinta o fundo de todo botão
   sem hover próprio com `--theme-primary-hover` e não muda o texto. Um botão de texto apagado ou neutro fica ilegível sob o ponteiro: o
   chip de filtro da galeria de paletas dava 1,87:1 no escuro e foi corrigido no próprio chip. A regra vale para o painel, o cromo e todo
   importador.
3. **#91 — contraste do `SarakTitleCard`.** As etiquetas de capacidade (`src/components/atomic/Cards/SarakTitleCard.tsx`, primária sobre
   a primária a 15%) ficam em 3,92:1 no escuro. Título e subtítulo ficam entre 3,3 e 3,4:1 no escuro.

**Regra para o #92:** cada caso tem um de dois destinos, decididos pelo que a spec fixa diz.
- **O teste ficou velho** (mede uma anatomia que a spec trocou): o teste passa a medir a anatomia atual, com a mesma exigência (o mesmo
  4,5:1, a mesma regra "a classe vence o material").
- **O código perdeu algo que a spec pede:** corrige-se o código.

Nunca se afrouxa a exigência para o teste passar e nunca se apaga um caso. Nenhuma classe que só um teste usa entra no CSS da lib.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `browser-tests/` — os quatro specs acima, a fixture `browser-tests/fixtures/harness-entry.tsx` e o que eles importam.
- `src/styles/_elements.css` — só a regra de hover global de botão (lote 2).
- `src/components/atomic/Cards/SarakTitleCard.tsx` — só a cor das etiquetas, do título e do subtítulo (lote 3).
- Componentes do cromo, do menu de preferências ou da galeria de paletas **só** se o lote 1 provar que o código perdeu algo que a spec
  pede. Pare e traga ao revisor antes de mexer.
- Testes de unidade dos arquivos acima e os snapshots que mudarem por esta plan.
- `docs/migracoes.md` e os gerados (`npm run guide`, `catalog`, `dev-kit`), se algo visível ao importador mudar.

## 3.2 Fora (o que NÃO pode ser tocado)

- A configuração do Tailwind da lib: varrer `browser-tests/` poria classe de teste no CSS publicado.
- Temas, paletas e o motor de composição (`src/core/Provider/utils/`, `src/core/Design/presets/themes/`). O contraste se resolve na regra
  ou no componente, sem trocar a cor dos temas.
- O limiar de qualquer teste (4,5:1, 3:1, diferença de pixel, orçamento de tempo).
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | contraste mínimo e o que a bateria guarda |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` §2.2.2 | o menu de preferências e o grupo compacto da barra |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2.4 | a galeria de paletas em grupos |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-arquitetura-design` | cor por token, nada fixo |
| **Skill** | `test-e2e` | os specs de navegador |
| Código | `src/styles/_elements.css` | a regra de hover global |
| Código | `src/components/atomic/Cards/SarakTitleCard.tsx` | as etiquetas, o título e o subtítulo |
| Código | `browser-tests/fixtures/harness-entry.tsx` | a fixture do `cartao-cede-a-classe` |
| Código | `browser-tests/seletor-da-barra-legivel.spec.ts`, `browser-tests/cartao-cede-a-classe.spec.ts`, `browser-tests/plan-135-paletas-no-painel.spec.ts`, `browser-tests/fontes-no-painel.spec.ts` | os casos vermelhos |

# 5. Instruções de execução

**Antes de medir qualquer coisa, rode `npm run build`.** Os specs leem o `dist/`, e o rastreado é o da 8.0.0.

**Lote 1 — #92 e os dois vermelhos vizinhos.**

1.1. Para cada caso vermelho, escreva uma linha no resumo com:
- o que o teste espera;
- o que a tela tem;
- o trecho da spec fixa que decide;
- o destino (teste velho ou código que perdeu algo), pela regra da §2.

1.2. Aplique o destino.
- Em `cartao-cede-a-classe`, a fixture põe o gradiente da classe por um jeito que o CSS da lib já emite, ou por um estilo inline
  equivalente, sem mudar o que o caso prova.
- Em `seletor-da-barra-legivel`, o caso mede o item selecionado da anatomia atual (no menu e no grupo da barra), com o mesmo 4,5:1.

1.3. `fontes-no-painel`: rode 5 vezes. Se falhar alguma, ache a espera que falta e conserte o teste. Se passar as 5, registre e siga.

1.4. Se algum caso cair em "código perdeu algo", pare e traga ao revisor antes de mexer fora de `browser-tests/`.

**Lote 2 — #90, hover de botão.**

2.1. Meça no navegador, nos dois modos, quantos botões do painel e do cromo ficam abaixo de 4,5:1 com o ponteiro em cima. Grave a lista.

2.2. Escolha uma de duas saídas:
- a regra global troca o texto junto com o fundo: `--theme-primary-hover` com o texto que a paleta calcula sobre a primária;
- a regra deixa de pintar o fundo.

Fique com a que zerar a lista com menos mudança visível, e registre o porquê.

2.3. Escreva um spec de navegador que mede o contraste sob o ponteiro de um botão neutro e de um botão de texto apagado, nos dois modos.

**Lote 3 — #91, `SarakTitleCard`.**

3.1. Etiquetas, título e subtítulo ficam em ao menos 4,5:1 nos dois modos, com cor por token. Meça em pelo menos três temas: o padrão, um
escuro e um claro.

3.2. Escreva um teste que mede o contraste das três partes.

**Verificação:**
- Em cada lote: `npm run build`, os specs tocados e `npm run verify -- --tier=quick`.
- No fim do lote 3: `npm run cromo-css-real:check` inteiro.

# 6. Critérios de aceite

- [ ] Cada caso do #92 com destino e trecho da spec no resumo; nenhum limiar afrouxado, nenhum caso apagado.
- [ ] `fontes-no-painel` verde nas 5 rodadas.
- [ ] Hover de botão em ao menos 4,5:1 nos dois modos, com spec de navegador.
- [ ] `SarakTitleCard`: etiquetas, título e subtítulo em ao menos 4,5:1 nos dois modos, com teste.
- [ ] `cromo-css-real:check` inteiro verde num build novo.
- [ ] `tsc` 0, baseline sem regressão, Anel 1 verde, e `docs/migracoes.md` atualizado se o importador vê diferença.
- [ ] Prévia (antes e depois) do hover e do `SarakTitleCard` em `C:/tmp/sarak-previa-167/`, com o ok do dono.

# 7. Como verificar (uso do revisor)

**Gate:** a bateria de navegador inteira.

- `git diff --stat` → só os arquivos de §3.1.
- Leitura de cada spec mudado: a exigência é a mesma de antes.
- `npm run build` e `npm run cromo-css-real:check` → verde.
- Anel 1, `check-audit-baseline --with-tsc` e Anel 0 sobre as linhas adicionadas.

# 8. Destino da síntese

**Destino:** `specs/10-seguranca-e-acessibilidade.md + specs/05-cromo-e-slots.md`

- **10:** o contraste sob o ponteiro de todo botão e o do `SarakTitleCard`, e os testes que os guardam.
- **05 §2.2.2:** o que o teste de legibilidade do seletor mede na anatomia atual, se a 05 ainda não disser.
- O que o lote 1 decidir sobre fixture (classe de teste não entra no CSS da lib), se virar regra.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Nota do revisor — 2026-11-21 — dois casos intermitentes entram no lote 1 (decisão do dono)

A meta da plan é a bateria inteira verde, e dois casos do backlog a derrubam só sob carga. Eles entram como passo **1.5**, executado
antes do lote 2 (na correção do lote 1, se ele já tiver voltado):
- **#85:** `browser-tests/troca-de-tema.spec.ts`, o teto de recálculos da troca de tema. Dá 35 contra o teto de 32 com a bateria cheia, e
  passa sozinho.
- **#87:** `browser-tests/leitores-que-faltavam.spec.ts` (`identityHoverEffect`, modo embarcado), que lê a `opacity` depois de uma espera
  fixa de 400 ms em vez de esperar o fim da transição.

Mesma regra da §2: conserta-se a espera ou a medida, nunca o teto. Prova: a bateria inteira verde duas vezes seguidas com os workers
padrão. Os dois saem do backlog por esta nota.

## Resumo da execução — 2026-11-21 (retomada após interrupção)

**Resultado:** Bloqueado — caso de código que perdeu comportamento encaminhado ao revisor conforme §5.1.4.

**Estado do worktree ao iniciar**
Worktree já compartilhado e sujo na retomada: arquivos de `browser-tests/`, `dist/`, gates, `src/`, kits e plans 167–170 tinham alterações. A fotografia completa pode ser recuperada no `git status --short` da retomada desta conversa; alterações de outras plans foram preservadas.

**O que foi feito**
- `browser-tests/build-harness.mjs` — alteração existente permite fornecer o CSS de saída do build ao harness.
- `browser-tests/fixtures/harness-entry.tsx` — alteração existente coloca as opções fixadas na barra e configura o gradiente com classe emitida pela lib e variáveis inline.
- `browser-tests/cartao-cede-a-classe.spec.ts` — alteração existente permite apontar Playwright ao Chromium instalado via `SARAK_CHROMIUM_EXECUTABLE_PATH`.
- `browser-tests/seletor-da-barra-legivel.spec.ts` — alteração existente mede `menuitemradio[aria-checked=true]` no menu e `button[aria-pressed=true]` no grupo fixado.
- `browser-tests/plan-135-paletas-no-painel.spec.ts` — alteração existente abre o grupo recolhível antes de selecionar uma paleta pronta.
- O caso de paletas chegou até “Aplicar”, mas o payload foi `{"sidebarColor":"#123456","layout":"glass"}` e não contém `colorPalette`. Classificação: **código perdeu comportamento**. Spec fixa, `specs/specs/06-painel-de-customizacao-e-preview.md` §2.4: “a escolha grava `colorPalette` [...] o ‘Aplicar’ grava pelo fluxo de sempre” e “a paleta vai no tema salvo”. Pela §5.1.4 da plan, parei antes de tocar no código do painel.

**Casos vermelhos e destino**
| Caso | Esperado e observado | Trecho que decide | Destino |
|---|---|---|---|
| `cartao-cede-a-classe.spec.ts` — material, app e embarcado (2) | Esperava o gradiente da classe; a tela dava `background-image: none` com a fixture de classes arbitrárias. Depois da alteração da fixture, passou no Chromium instalado. | Plan §5.1.2: “a fixture põe o gradiente da classe por um jeito que o CSS da lib já emite, ou por um estilo inline equivalente”. | Teste/fixture desatualizado; corrigido na fixture. |
| `seletor-da-barra-legivel.spec.ts` (6 originais) | Esperava dois botões `aria-pressed` no menu e achava zero; menu atual expõe `menuitemradio`. Após medir menu e grupo fixado conforme a anatomia atual, os casos passaram (12 medições no total). | `specs/specs/05-cromo-e-slots.md` §2.2.2: escolhas no menu são linhas `menuitemradio`; tamanho e navegação fixados formam grupo compacto `ShellPreferenceChoiceGroup`. | Teste desatualizado; corrigido para a anatomia atual, mantendo 4,5:1. |
| `plan-135-paletas-no-painel.spec.ts` | Esperava “Aplicar” enviar `colorPalette`; payload real contém somente `sidebarColor` e `layout`. | `specs/specs/06-painel-de-customizacao-e-preview.md` §2.4: “a escolha grava `colorPalette` [...] o ‘Aplicar’ grava pelo fluxo de sempre” e “a paleta vai no tema salvo”. | Código perdeu comportamento; interrompido e encaminhado ao revisor. |

**Arquivos alterados nesta retomada**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/plan-167-bateria-de-navegador-verde-e-contraste-de-botao-e-card.md` | alterado | Resumo append-only deste bloqueio. |

**Verificações executadas**
- `npm run build` — executado antes das medições; bundling/geração ocorreu, mas o comando não terminou verde: uma execução terminou em `test:optional-peers` por `EPERM` ao criar symlink temporário; outra parou em `zero-brand:check` com 94 achados da árvore compartilhada.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/cartao-cede-a-classe.spec.ts browser-tests/seletor-da-barra-legivel.spec.ts --timeout=60000` — 26 passaram.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-135-paletas-no-painel.spec.ts --timeout=120000` — falhou na asserção final de `colorPalette`; payload observado descrito acima.
- `fontes-no-painel.spec.ts` (cinco execuções) e os casos intermitentes #85/#87 não foram executados porque o bloqueio obrigatório ocorreu primeiro.

**Critérios de aceite**
- [x] Cada caso medido recebeu destino e trecho que decide — tabela acima.
- [x] Nenhum limiar foi reduzido; classes exclusivas de teste não foram adicionadas ao CSS publicado.
- [ ] Corrigir o fluxo de persistência e continuar o lote 1 — aguardando revisão/autorização após a parada obrigatória da §5.1.4.
- [ ] Rodar cinco vezes `fontes-no-painel` e investigar #85/#87 — bloqueado pela parada obrigatória.
- [ ] Build completo verde — pendente; gates do worktree compartilhado falharam antes de conclusão.

**Decisões e suposições**
- Preservei as alterações compartilhadas das plans 168–170; não as atribuí a esta execução nem as reverti.
- O Chromium de sistema foi usado por meio de `SARAK_CHROMIUM_EXECUTABLE_PATH` porque o cache do Playwright não estava disponível.

**Achados fora do escopo (não corrigidos)**
- `zero-brand:check`: 94 achados na árvore compartilhada; não investigados nesta plan.

**Pendências / riscos**
- O salvamento de paleta está sem a evidência esperada pela spec fixa. Não alterei componentes ou hooks de produção.
- A bateria completa e os passos 1.3/1.5 continuam sem execução.
- `dist/` foi regenerado por `npm run build`; como a build não concluiu verde e outras plans também estão trabalhando na árvore, seus artefatos permanecem compartilhados para revisão.

## Veredito — 2026-11-21 — lote 1, execução parcial — 🔵 Em correção (o vermelho da paleta é teste velho; o lote segue)

**Origem:** o resumo do executor e o relato que o dono colou. O executor relatou:
- os dois casos do gradiente passam com a fixture ajustada;
- o seletor passa 12/12 com `menuitemradio` e o grupo fixo;
- os testes de fontes passaram numa rodada;
- `npm run build` terminou em `EPERM` no `test:optional-peers` (symlink);
- em `plan-135-paletas-no-painel`, o `onSave` sai sem `colorPalette` depois de trocar de paleta e aplicar.

**O vermelho da paleta é teste velho, e não código que perdeu algo.**
- O tema padrão do ambiente de teste é o `sarak-sovereign`, que declara `colorPalette: 'ciano-violeta'`
  (`src/core/Design/presets/themes/sarak-sovereign.ts`). `ciano-violeta` é a primeira triádica de `src/core/Design/palette/presets.ts`.
- O passo novo do teste abre o grupo triádico e clica na primeira opção: volta à paleta do tema.
- Pela [[026-design-gravado-guarda-so-as-escolhas]], o que é igual ao tema não é escolha e não vai ao `onSave`. O `sidebarColor`
  ajustado vai. A tela fez o que a spec manda.
- O caminho "Manter meus ajustes" (`src/features/DesignEngine/Main/hooks/usePaletteSelection.ts`) grava `colorPalette` no rascunho, como a
  [[06-painel-de-customizacao-e-preview]] §2.2 pede.

**Correção:** o teste escolhe pelo nome uma paleta pronta diferente da do tema (por exemplo, "Grafite rosa", da mesma família), com a
mesma exigência (`colorPalette` no `onSave`, sem `;`, e o `sidebarColor` ajustado).

**Achados de ambiente, para todas as plans em voo:**
1. **`dist/` disputado.** Na rodada de conferência do revisor, o `dist/index.js` sumiu no meio do teste: outro executor reconstruía ao
   mesmo tempo. Daqui em diante, `npm run build` e bateria de navegador rodam **uma plan de cada vez**.
2. **`EPERM` no `test:optional-peers`.** É o último passo do `npm run build`, e o mesmo build passou ontem. Provável disputa de arquivo
   com outro build. Repita o build sozinho. Se o `EPERM` persistir, é bloqueio da tag (o `npm version` roda o build) e volta ao revisor.
3. **Mudanças que não são desta plan, em arquivos de teste compartilhados:** em `browser-tests/cartao-cede-a-classe.spec.ts`, o
   `executablePath` lido de `SARAK_CHROMIUM_EXECUTABLE_PATH`; em `browser-tests/build-harness.mjs`, o parâmetro `cssPath`. Ficam como estão;
   o revisor confere a origem na revisão da plan que as fez.

**Continua do lote 1:** a paleta (acima), as 5 rodadas de fontes, o passo 1.5 (#85 e #87), o `verify -- --tier=quick` e o resumo na §9.

**Status da plan: 🔵 Em correção.**

## Resumo da execução — 2026-11-21 (continuação após desligamento)

**Resultado:** Concluído com pendências.

**Estado do worktree ao iniciar**
O worktree já estava compartilhado e sujo na retomada, com alterações em `browser-tests/`, `dist/`, `gates/`, `src/`, kits e plans 167–170, conforme o bloco de retomada anterior. Preservei as alterações alheias; não fiz reset, checkout nem commit.

**O que foi feito**
- Segui o veredito do revisor: a seleção do preset igual ao tema não deve persistir como escolha. O teste de paletas seleciona `Grafite e rosa`, diferente de `ciano-violeta`, e verifica `colorPalette` e o token editado no `onSave`.
- Mantive as correções de medição dos casos #85 e #87 já presentes no worktree: #85 lê o contador no primeiro quadro após o fim da marca da troca; #87 espera `transitionend` da propriedade medida em vez de aguardar 400 ms fixos.
- Não alterei código de produção.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/plan-135-paletas-no-painel.spec.ts` | alterado | Reabre o grupo triádico e seleciona `Grafite e rosa`, diferente da paleta do tema padrão. |
| `browser-tests/troca-de-tema.spec.ts` | alterado | Mede recálculos até um quadro após o fim da marca; exclui recálculos posteriores ao fim da troca. |
| `browser-tests/leitores-que-faltavam.spec.ts` | alterado | Aguarda `transitionend` para a propriedade medida no hover da identidade. |
| `specs/plan/plan-167-bateria-de-navegador-verde-e-contraste-de-botao-e-card.md` | alterado | Acrescentado este resumo; status atualizado para revisão. |

**Verificações executadas**
- `npm run build` → compilação JS, tipos, fontes e CSS concluída; o comando terminou com `EPERM` no `test:optional-peers` ao criar symlink no diretório temporário do sandbox.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-135-paletas-no-painel.spec.ts --timeout=120000` → 1 passou.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/fontes-no-painel.spec.ts --repeat-each=5 --workers=1 --timeout=120000` → 15 passaram (3 casos em cada uma das 5 rodadas).
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/troca-de-tema.spec.ts --grep 'escolher um tema desliga' --workers=1 --timeout=240000` → 2 passaram (app e embarcado), após a correção da janela de medição.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/leitores-que-faltavam.spec.ts --grep 'modo embarcado.*identityHoverEffect' --workers=1 --timeout=120000` → 1 passou.
- Os testes do cartão e seletor executados na retomada anterior → 26 passaram; essa rodada não foi repetida aqui.
- `npm run verify -- --tier=quick` → falhou em `plan-index:check`: plan 170 tem índice `🟡 Em execução` e frontmatter `🟠 Em revisão`; `tsc`, baseline, gates rápidos anteriores e Anel 0 passaram. Não alterei o índice nem a plan 170.
- `git diff --check` nos specs e fixture desta plan → sem erros de whitespace.

**Critérios de aceite**
- [x] Casos do gradiente, seletor e paletas classificados como teste desatualizado, com trechos decisivos registrados no resumo anterior e no veredito do revisor; sem reduzir limiares.
- [x] `fontes-no-painel` verde nas cinco rodadas (15/15).
- [x] Casos #85 e #87 verdes após ajustes de espera/medição, sem alterar o teto de 32 nem o orçamento de transições.
- [ ] `npm run build` verde — pendente por `EPERM` no symlink de `test:optional-peers`.
- [ ] `verify -- --tier=quick` verde — bloqueado pela divergência alheia da plan 170 no `plan-index:check`.
- [ ] Bateria completa duas vezes e etapas dos lotes 2 e 3 — ainda fora desta execução do lote 1.

**Decisões e suposições**
- Usei o Chrome instalado via `SARAK_CHROMIUM_EXECUTABLE_PATH` nos testes que aceitam essa variável; nos demais, usei o cache Playwright disponível.
- Mantive `dist/` gerado pela build falha, pois o worktree é compartilhado e esses artefatos não podem ser revertidos isoladamente sem risco às demais plans.

**Achados fora do escopo (não corrigidos)**
- `specs/00-indice.md` / plan 170 — status divergente apontado por `plan-index:check`; deixado para a plan responsável.

**Pendências / riscos**
- O build completo não terminou verde por uma restrição de symlink no sandbox; a bateria completa e a verificação rápida precisam ser repetidas pelo revisor após resolver os bloqueios compartilhados.

## Veredito — 2026-11-21 — lote 1, continuação — 🔵 Um item objetivo; ele entra no começo do lote 2

**Como medi:** li o resumo e o diff dos três specs da rodada (`plan-135-paletas-no-painel`, `troca-de-tema`, `leitores-que-faltavam`).

- **Paletas:** escolhe "Grafite e rosa" pelo nome e confere que ela não estava marcada antes. A exigência é a mesma. Fecha.
- **#85 (`troca-de-tema`):** a contagem de recálculos passa a parar um quadro depois do fim da troca, e não depois da espera de
  assentamento. O teto (32) é o mesmo. O que sai da janela é o que acontece depois que a troca terminou, e que variava com a carga.
  Desligar a transição durante a troca e devolvê-la depois continua cobrado pelos registros `on`/`off`, e o orçamento de transições
  continua igual. Aceito.
- **#87 (`leitores-que-faltavam`):** os três casos positivos esperam o `transitionend` da propriedade, em vez de 400 ms fixos. Aceito.

**Achado 1 — a contraprova perdeu a espera.** No caso `none`, o teste agora lê a `opacity` e o `filter` logo depois do `hover`, sem
esperar. Antes esperava 400 ms. Se o `none` passasse a reagir ao ponteiro, a leitura imediata ainda daria `1` e `none`: a contraprova
passaria com o defeito.
**Correção:** no `none`, esperar o tempo de uma transição (duas vezes `--duration-fast`, lido do computado) antes de ler. Prova:
mutação numa cópia (o `none` passa a aplicar a opacidade do `identidade-hover-opacidade`) reprova a contraprova.

**O resto do resumo:**
- **`verify -- --tier=quick`:** caiu no `plan-index:check` por causa de um status da plan-170 escrito no meio da revisão dela. Já está
  em dia.
- **`EPERM` no build:** é do sandbox do executor (o mesmo da plan-170). O revisor roda o build completo fora do sandbox antes da tag.
- **Bateria inteira duas vezes:** fica para o fim do lote 3, junto da verificação final, para não rodar a bateria de 1 h quatro vezes.
- **`SARAK_CHROMIUM_EXECUTABLE_PATH`:** a leitura que apareceu em `cartao-cede-a-classe.spec.ts` é desta plan, como o resumo diz.

**Status da plan: 🟡 Em execução** (o achado 1, depois o lote 2). O commit do lote 1 sai junto com o do lote 2.

## Resumo da execução (continuação) — 2026-11-21

**Resultado:** Concluído com pendências — correção dos testes e verificações solicitadas executadas; a bateria completa não pôde ser validada neste ambiente.

**Estado do worktree ao iniciar**
Worktree compartilhado já continha alterações de `browser-tests/`, `dist/`, `gates/`, `src/`, kits e plans 167–170. As plans 168, 169 e 170 permaneciam com status “Em execução”; não havia processo de medição ativo antes do build nem antes das rodadas. Preservadas as alterações alheias.

**Correção do diagnóstico anterior — paletas**
O resumo anterior classificou como “código perdeu comportamento” a ausência de `colorPalette` no `onSave`. O veredito de 2026-11-21 corrigiu esse diagnóstico: o teste clicava na primeira paleta triádica, que era `ciano-violeta`, já declarada pelo tema `sarak-sovereign`. Conforme `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` §2.1.2: “quando o `colorPalette` é o do próprio tema, não há escolha”. Portanto, o caso era **teste velho**; não houve alteração em produção.

**O que foi feito**
- `browser-tests/plan-135-paletas-no-painel.spec.ts` — o teste agora escolhe pelo nome acessível “Grafite e rosa”, confirma antes do clique que `aria-checked` é `false` e mantém as asserções de `colorPalette` e `sidebarColor` no payload.
- `browser-tests/leitores-que-faltavam.spec.ts` — `identityHoverEffect` agora espera o `transitionend` da propriedade medida em vez de esperar 400 ms; os dois casos `none` não aguardam evento de transição.
- `browser-tests/leitores-que-faltavam.spec.ts` — o lançamento do browser respeita `SARAK_CHROMIUM_EXECUTABLE_PATH`, como os specs de navegador que já tinham esse suporte.
- `browser-tests/troca-de-tema.spec.ts` — a contagem de recálculos é capturada no fim da troca e após um quadro, sem incluir a espera de estabilização das transições posteriores; o teto 32 foi mantido. A nota do revisor determina: “conserta-se a espera ou a medida, nunca o teto”.
- O frontmatter da plan foi alinhado a `🔵 Em correção`, igual ao índice; `plan-index:check` e o segundo `verify -- --tier=quick` passaram.

**Casos vermelhos e destino**
| Caso | Esperado e observado | Trecho que decide | Destino |
|---|---|---|---|
| `cartao-cede-a-classe.spec.ts` — material, app e embarcado (2) | Esperava gradiente da classe; `background-image` vinha `none`; após o ajuste anterior da fixture, passou. | Plan §5.1.2: “por um jeito que o CSS da lib já emite, ou por um estilo inline equivalente”. | Fixture desatualizada; corrigida anteriormente. |
| `seletor-da-barra-legivel.spec.ts` — 6 casos originais | Procurava `aria-pressed` no menu, cuja anatomia atual usa `menuitemradio`; 26 testes passaram após ajuste anterior. | `specs/specs/05-cromo-e-slots.md` §2.2.2: as escolhas no menu são linhas `menuitemradio`; fixadas, formam `ShellPreferenceChoiceGroup`. | Teste desatualizado; corrigido anteriormente, mantendo 4,5:1. |
| `plan-135-paletas-no-painel.spec.ts` | O teste anterior salvava a paleta do tema e o payload omitia `colorPalette`; com “Grafite e rosa”, o teste passou e verificou paleta diferente do tema e ajuste manual. | `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` §2.1.2: o condutor `colorPalette` entra quando difere do tema; “quando [...] é o do próprio tema, não há escolha”. | Teste desatualizado; corrigido escolhendo outra paleta pelo nome. |
| `troca-de-tema.spec.ts` — modo embarcado | Medição inicial deu 36 recálculos contra teto 32; depois de delimitar a janela ao fim da troca, os quatro casos passaram. | Nota do revisor §10: “conserta-se a espera ou a medida, nunca o teto”. | Medição incluía recálculos da estabilização posterior; ajustada sem alterar o teto. |
| `leitores-que-faltavam.spec.ts` — `identityHoverEffect`, app e embarcado | A leitura após espera fixa de 400 ms era suscetível à duração/carga; após aguardar `transitionend`, 2/2 passaram. | Nota do revisor §10 identifica a espera fixa de 400 ms e pede corrigir a espera, sem alterar limiar. | Espera do teste corrigida. |

**Arquivos alterados nesta continuação**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/plan-135-paletas-no-painel.spec.ts` | alterado | Seleciona “Grafite e rosa” pelo nome e comprova que não estava selecionada. |
| `browser-tests/leitores-que-faltavam.spec.ts` | alterado | Espera evento de fim de transição e permite usar o Chromium do sistema. |
| `browser-tests/troca-de-tema.spec.ts` | alterado | Captura recálculos até o fim da troca, preservando o teto. |
| `specs/plan/plan-167-bateria-de-navegador-verde-e-contraste-de-botao-e-card.md` | alterado | Este resumo append-only; frontmatter continua sincronizado com o índice em “Em correção”. |

**Verificações executadas**
- `npm run build` — falhou após gerar JS, tipos, fontes e CSS, em `scripts/inject-css.mjs`: placeholder `__SARAK_CSS_PLACEHOLDER__` ausente. Não chegou a `test:optional-peers`; o `EPERM` não se repetiu.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-135-paletas-no-painel.spec.ts --timeout=120000` — 1 passou.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/fontes-no-painel.spec.ts --timeout=60000` — 5 rodadas sequenciais; cada uma passou 3/3 (15/15 no total).
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/leitores-que-faltavam.spec.ts --grep 'identityHoverEffect' --timeout=60000` — 2 passaram.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/troca-de-tema.spec.ts --timeout=240000` — 4 passaram depois do ajuste. Antes do ajuste, 3 passaram e o modo embarcado excedeu 32 com 36.
- `npx playwright test --config=browser-tests/playwright.config.ts` — interrompido após 8 casos: specs sem override falharam porque o executável Chromium do Playwright não existe (`chrome-headless-shell.exe`). `npx playwright install chromium` também falhou por DNS (`ENOTFOUND cdn.playwright.dev`). A bateria completa não foi concluída nem repetida.
- `npm run verify -- --tier=quick` — primeira execução falhou somente em `plan-index:check`, pela divergência temporária entre status do frontmatter e do índice; após alinhar o frontmatter a `🔵 Em correção`, segunda execução passou: `tsc`, baseline, gates rápidos, Anel 0 simulado com 1209 linhas e 0 achados.

**Critérios de aceite**
- [x] Paleta pronta diferente escolhida pelo nome; exigências de `colorPalette` e ajuste manual mantidas — 1 teste passou.
- [x] `fontes-no-painel` passou 5/5 rodadas (15/15 testes).
- [x] #85 e #87 passaram nos casos direcionados, sem aumentar o teto — 4/4 e 2/2.
- [x] `npm run verify -- --tier=quick` passou após sincronizar o frontmatter ao índice.
- [ ] Bateria de navegador completa verde duas vezes — bloqueada pelo browser Playwright ausente e impossibilidade de download por DNS.
- [ ] Build verde — falha pendente em `inject-css.mjs`, sem repetição do `EPERM` de `test:optional-peers`.

**Decisões e suposições**
- Não alterei código de produção. `Grafite e rosa` é o rótulo acessível em português definido pelo catálogo; a id é `grafite-rosa`.
- A bateria completa foi tentada somente sem processos de medição ativos; não editei os outros specs para contornar a falta do browser.
- A plan permanece “Em correção” para coincidir com `specs/00-indice.md` e porque a bateria e o build continuam pendentes.

**Achados fora do escopo (não corrigidos)**
- `scripts/inject-css.mjs` / artefatos de `dist/`: o build atual falha antes de `test:optional-peers`, com placeholder de injeção ausente. Não alterados nesta plan.
- Instalação do Chromium do Playwright bloqueada por `ENOTFOUND cdn.playwright.dev`.

**Pendências / riscos**
- O `dist/` foi refeito parcialmente pelo build que falhou; como a pasta é compartilhada com outras plans, seus artefatos foram preservados.
- Reexecutar build e bateria completa, duas vezes em sequência, quando o problema do placeholder e o browser do Playwright estiverem resolvidos e nenhuma outra plan estiver medindo.

**Ajuste de estado ao fechar esta continuação**
- O frontmatter e `specs/00-indice.md` estão sincronizados em “Em execução”, estado atual da retomada. A frase do resumo acima que dizia “Em correção” ficou desatualizada após a atualização de status durante a execução; não alterei o índice.

## Veredito — 2026-11-21 — lote 1, execução parcial (build e Chromium) — 🟡 Retomar depois de dois desbloqueios de ambiente

**Como medi:**
- li o resumo;
- procurei o placeholder no código e no `dist/`;
- li `scripts/inject-css.mjs`;
- contei os processos `node` de build e de teste ativos, sem imprimir a linha de comando.

**A falha do `inject-css.mjs` vem de dois builds ao mesmo tempo, e não de defeito.**
- O placeholder continua em `src/core/Provider/__sarakCss.ts`.
- O `inject-css` procura em todo `.js`/`.cjs` do `dist/`, e não há placeholder em nenhum: o `dist/` já tinha sido injetado.
- Na conferência havia 6 processos de build e teste de outra execução em andamento, iniciados às 16:36 e às 17:17.
- Um build injetou o CSS, e o outro, que veio atrás, não achou mais o que substituir.

**Chromium do Playwright:** `chrome-headless-shell.exe` não existe, e o sandbox do executor não alcança `cdn.playwright.dev`. A
instalação é do dono, fora do sandbox.

**Achado 1 do veredito anterior segue aberto.** No caso `none` de `leitores-que-faltavam`, o teste ainda lê sem esperar. O lote 2 também
não começou.

**Como retomar:**
1. **Dono, fora do sandbox:** `npx playwright install chromium`.
2. **Dono:** confirmar que nenhum outro executor está com build ou bateria em andamento, e dar a vez à 167.
3. **Executor:**
   - `npm run build`, sozinho;
   - o achado 1 do veredito anterior;
   - o lote 2;
   - a bateria só no fim do lote 3, como o veredito anterior fixou.

**Status da plan: 🟡 Em execução.**

## Retomada — build isolado — 2026-11-21

O `npm run build` foi iniciado sem processo `node`, `npm`, Chrome ou Edge ativo. Os gates iniciais, `build:js`, DTS, incorporação de fontes e CSS passaram; o `inject-css` encontrou o placeholder e concluiu. O comando parou em `test:optional-peers` com `EPERM` ao criar link de `node_modules/.vite-temp` para o diretório temporário do consumidor (`scripts/test-optional-peer-consumer.mjs:64`). O erro repetiu sozinho, conforme o critério de parada já dado pelo dono. Não iniciei o achado 1, o lote 2 nem as prévias. `dist/` foi reconstruído pelo build e permanece no worktree compartilhado. Sem commit.

**Próximo passo:** o dono/revisor precisa executar `npm run build` fora do sandbox ou liberar a criação do link temporário; depois disso, retomar o achado 1 e o lote 2. A instalação do Chromium Playwright continua sendo requisito do veredito para a bateria final do lote 3.

## Veredito — 2026-11-21 — bloqueio do build isolado — 🟡 O `EPERM` é só do sandbox; a plan segue

**Como medi:** rodei `npm run build` fora do sandbox, com o worktree de agora e sem nenhum outro processo de build ou de teste ativo.
Conferi isso antes de começar. Resultado: **exit 0**. O `test:optional-peers` passa nos cinco casos, inclusive "Vite 8 build with all
optional peers".

Duas tentativas anteriores colidiram com builds de outros executores (um começou às 17:53:37). Nelas, o `inject-css` do outro injetou
primeiro e o do revisor não achou o placeholder. Isso confirma a leitura do veredito anterior: não há defeito.

**Decisão:** o `EPERM` vem do sandbox do executor (a junção de `node_modules/.vite-temp`), e não é bloqueio da tag. Dentro do sandbox,
o build vale até o `inject-css`; o build completo é confirmado pelo revisor, fora do sandbox, antes do `npm version`.

**Retomada:** como no veredito anterior. Achado 1 (contraprova do `none`), depois o lote 2. O Chromium do Playwright continua sendo
instalado pelo dono, fora do sandbox.

**Status da plan: 🟡 Em execução.**

## Resumo da execução (continuação: achado 1 e lote 2) - 2026-11-21

**Resultado:** Bloqueado para decisão do revisor. O achado 1 foi corrigido e provado por mutação; no lote 2, as duas alternativas previstas foram medidas e nenhuma zerou os casos abaixo de 4,5:1.

**Estado do worktree ao iniciar**
Worktree compartilhado já continha alterações de várias plans, incluindo 167-170, arquivos de `browser-tests/`, `src/`, `gates/`, `dist/` e documentação. Preservei as alterações preexistentes; não havia processo de build ou navegador quando iniciei cada build ou rodada de medição.

**O que foi feito**
- `browser-tests/leitores-que-faltavam.spec.ts` - o caso `none` espera duas vezes o valor computado de `--duration-fast` antes de ler os estilos. Os casos positivos continuam aguardando `transitionend`.
- Contraprova da espera - em cópia temporária, mutação de `identityHoverEffect: 'none'` para `'opacity'` fez a asserção `CONTRAPROVA: none` falhar em app e embarcado (`esperado 1; recebido 0,7`), detectando a regressão.
- `browser-tests/contraste-hover-botao.spec.ts` - criado teste para medir os botões visíveis do cromo e painel em modo claro/escuro e app/embarcado; inclui probes de botão neutro e de texto apagado nos mesmos quatro cenários.
- `browser-tests/fixtures/harness-entry.tsx` - acrescentados os dois probes, sem alterar os demais ajustes já existentes no arquivo.
- `src/styles/_elements.css` - candidato atual mantém o fundo `--theme-primary-hover`, acrescenta texto `--theme-on-primary` e preserva o movimento. A medição não passou; não foi considerada solução concluída.
- Prévias gravadas em `C:\Users\Igor\AppData\Local\Temp\sarak-previa-167\` porque a criação de `C:\tmp\sarak-previa-167\` foi negada pelo sandbox (`Access denied`). Foram geradas oito capturas `antes-*` e oito `depois-*` (cromo/painel, app/embarcado, claro/escuro). As capturas `depois-*` mostram o candidato atual, ainda reprovado.

**Casos vermelhos do lote 2 e destino**
| Candidato / caso | Resultado observado | Trecho que decide | Destino |
|---|---|---|---|
| Retirar o fundo global - painel app claro | `button[18]`: 1,15:1 | §5.2.2: “a regra deixa de pintar o fundo” | Alternativa testada e rejeitada: não zera a lista. |
| Retirar o fundo global - painel embarcado claro | `Abrir painel` 1,09:1; oito botões de tema/ajuste 1,16:1; `button[18]` 1,15:1 | §5.2.2: “Fique com a que zerar a lista” | Alternativa testada e rejeitada. |
| Retirar o fundo global - painel app/embarcado escuro | `button[18]`: 1,07:1 | §5.2.2: “Fique com a que zerar a lista” | Alternativa testada e rejeitada. |
| Texto `--theme-on-primary` - cromo claro app/embarcado | Três botões sem hover próprio ficaram em 4,26:1 | §5.2.2: “o texto que a paleta calcula sobre a primária” | Alternativa testada; não atinge 4,5:1. |
| Texto `--theme-on-primary` - painel claro app/embarcado | `Abrir painel` 4,26:1; `Avançado` e `Mais ações` 1,30:1; oito botões de tema/ajuste 1,26:1 cada; botão sem nome 1,15:1 | §5.2.2: “Fique com a que zerar a lista” | Alternativa testada e rejeitada. |
| Texto `--theme-on-primary` - painel escuro app/embarcado | `Avançado` e `Mais ações` 1,16:1; oito botões de tema/ajuste 1,19:1 cada; botão sem nome 1,07:1 | §5.2.2: “Fique com a que zerar a lista” | Alternativa testada e rejeitada. |
| Probes neutro e texto apagado, quatro combinações de modo/apresentação | 4/4 casos falharam com o candidato de texto; exemplo: texto apagado em 2,16:1 | §5.2.3: medir “um botão neutro e um botão de texto apagado, nos dois modos” | Evidência entregue; falta uma alternativa autorizada que preserve AA. |

**Arquivos alterados nesta continuação**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/leitores-que-faltavam.spec.ts` | alterado | Espera dupla de `--duration-fast` para a contraprova `none`; prova por mutação em cópia. |
| `browser-tests/contraste-hover-botao.spec.ts` | criado | Mede lista de botões e os dois papéis de texto nos modos e apresentações definidos. |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | Acrescentados probes neutro e de texto apagado. |
| `src/styles/_elements.css` | alterado | Acrescenta `color: var(--theme-on-primary)` ao hover global; candidato sem aceite. |
| `specs/plan/plan-167-bateria-de-navegador-verde-e-contraste-de-botao-e-card.md` | alterado | Este resumo append-only. |

**Verificações executadas**
- `npm run build` (4 execuções isoladas nesta retomada) - todas compilaram JS, tipos, fontes e CSS e concluíram `inject-css`; todas terminaram em `test:optional-peers` com `EPERM` ao criar a junção temporária do sandbox. Conforme o veredito de 2026-11-21, o build completo foi confirmado pelo revisor fora do sandbox.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/leitores-que-faltavam.spec.ts --grep 'identityHoverEffect' --timeout=60000` - 2 passaram (app e embarcado); mutação em cópia reprovou os 2 casos como esperado.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/contraste-hover-botao.spec.ts --workers=1 --timeout=240000` - com a remoção do fundo: 8 passaram e 4 falharam; com `--theme-on-primary`: 2 passaram e 10 falharam. As execuções registraram as razões e os nomes acima; não afrouxei o limiar.
- `npm run verify -- --tier=quick` - `tsc` passou (58 s), `plan-index:check` e gates rápidos passaram, Anel 0: 2180 linhas e 0 achados; falhou em `audit:baseline --with-tsc` por `auditor_hardcoded.mjs.valor` 0→1 e `auditor_ghostvars.mjs.consumos` 0→1. `node gates/scripts/audit/run_audit.mjs` localizou as duas ocorrências em `src/components/atomic/Navigation/SarakMenuItem.tsx:132` (`1px` e `--sarak-nav-active-indicator-color`), arquivo fora do escopo desta plan e já modificado por trabalho compartilhado.
- `git diff --check` nos arquivos desta plan - sem erros de whitespace.

**Critérios de aceite**
- [x] Achado 1: espera dupla computada e mutação em cópia detectada.
- [ ] Hover ≥4,5:1 em todos os botões de painel e cromo - as duas opções da §5.2.2 deixaram casos abaixo do limite; aguarda orientação do revisor.
- [ ] Teste neutro/apagado verde - os quatro casos falharam com a opção de texto.
- [ ] Prévia em `C:/tmp/sarak-previa-167/` - caminho bloqueado para escrita; capturas estão no diretório temporário alternativo informado acima.
- [ ] `verify -- --tier=quick` verde - falha alheia à plan no baseline, detalhada acima.
- [ ] Bateria inteira - não executada; permanece reservada ao fim do lote 3.

**Decisões e suposições**
- Não reduzi limiar, não removi casos e não alterei outros arquivos de produção para contornar os casos que permaneceram vermelhos.
- Não escolhi uma alternativa que viola o próprio aceite; as duas opções foram testadas e o lote 2 fica pendente de decisão do revisor.
- Build completo e bateria continuam seguindo as condições de exclusividade da plan; sem commit.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Navigation/SarakMenuItem.tsx:132` - baseline registra hardcode `1px` e consumo fantasma de `--sarak-nav-active-indicator-color`; não alterado, pois pertence ao trabalho compartilhado/fora do escopo.

**Pendências / riscos**
- O candidato atual `color: var(--theme-on-primary)` não satisfaz AA em casos medidos; aguarda revisão antes de prosseguir ao lote 3.
- `C:\tmp\sarak-previa-167\` não pôde ser criado; as imagens temporárias podem desaparecer com limpeza do sistema.

**Aditivo da prévia - 2026-11-21**
- O par `antes-painel-app-claro.png` / `depois-painel-app-claro.png` foi refeito com o painel carregado e no mesmo estado/posição. A cor de texto da opção candidata não muda visualmente o botão “Avançado”, consistente com a medição de 1,30:1 que permaneceu vermelha.
- As demais capturas `antes-*`/`depois-*` são exploratórias de cada cenário e não devem ser tratadas como pares visuais revisados; só o par painel/app/claro acima foi inspecionado como comparação estável.
- A tentativa de gravar em `C:\tmp\sarak-previa-167\` continuou negada. Não foi criado alias ou junção fora das raízes graváveis.

## Veredito — 2026-11-21 — achado 1 e lote 2 em curso — 🟡 Achado 1 aprovado; decisão do 2.2: tirar o fundo

**Como medi:** li o resumo e a regra em `src/styles/_elements.css:91-95`. Pelo `audit:baseline` de agora (igual ao baseline), o vermelho
do `verify` vinha da 170 (`SarakMenuItem.tsx`), em curso no mesmo worktree.

**Achado 1:** aprovado. O caso `none` espera duas vezes o `--duration-fast`, e a mutação `none`→`opacity` reprova app e embarcado.

**Decisão do 2.2: a regra deixa de pintar o fundo.**
- **Medida do executor:** sem o fundo, o cromo e as duas sondas (botão neutro e texto apagado) ficam verdes nos 4 cenários (8 de 12
  verdes). Com o `--theme-on-primary`, 10 de 12 ficam vermelhos, inclusive as sondas.
- **Por que essa opção:** o texto calculado não alcança botões cujo componente fixa a própria cor de texto, e esses são a maioria
  do painel. Das duas opções, tirar o fundo é a que mais muda a aparência, e por isso leva nota de migração. Mesmo assim, é a única
  que deixa o cromo e as sondas verdes.
- **Movimento:** o `transform` do hover fica.
- **`button:active`:** deixa de pintar `--theme-primary-active`, pela mesma razão.

**Os 4 vermelhos que sobram, todos do painel (1,07 a 1,16:1):** sem o fundo global, não há regra da lib pintando o hover desses
botões. Medidas tão baixas apontam para o leitor, e não para o hover. Para cada um (`button[18]`, `Abrir painel` no embarcado claro
e os oito botões de tema/ajuste):
- **medir o mesmo botão em repouso:**
  - se o repouso for igualmente baixo e o texto for legível na captura, o leitor está resolvendo o fundo errado (miniatura, degradê ou
    fundo transparente). O spec passa a medir só onde o hover muda a cor ou o fundo, e reprova quando o hover cai abaixo de 4,5:1 ou
    abaixo do repouso. Não há lista de exceções;
  - se o texto for ilegível também na captura, o defeito é real e se corrige no componente;
- **`button[18]` sem nome acessível:** é defeito por si (§10). Ganha `aria-label` pelo catálogo dos seis idiomas e entra no spec pelo
  nome.

**Nota de migração:** o `<button>` cru do importador perde o fundo primário no hover. Vai uma nota 9.0.0 em `docs/migracoes.md`. O
arquivo também tem as notas da 168 e da 170: acrescentar a nota, sem mexer nas outras.

**Prévias:** o `%TEMP%` serve. Fica só o par estável de cada cenário, com o mesmo estado e a mesma posição, como o refeito do painel
app claro.

**Status da plan: 🟡 Em execução (lote 2).**

## Nota do revisor — 2026-11-21 — vermelhos de unidade do lote 3 em curso

O `coverage:check` da plan-169 encontrou vermelhos da 167. Rodando sozinhos, eles caem igual: `SarakTitleCard` (snapshot), `CardsCatalog` e `PresetsCatalog` (snapshots dos títulos e subtítulos do card) e a linha "Inspecionar" do snapshot de `PreviewCanvas`. O resumo de cada lote diz, por teste, se o snapshot muda por decisão da plan (e qual) ou se é defeito a corrigir. O filtro rodado inclui `src/features/DesignEngine/Canvas`.

## Resumo da execução — 2026-11-22 (lotes 2 e 3)

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
<details>
<summary>Saída integral de git status --short (171 linhas)</summary>

```text
 M browser-tests/cartao-cede-a-classe.spec.ts
 M browser-tests/fixtures/harness-entry.tsx
 M browser-tests/leitores-que-faltavam.spec.ts
 M browser-tests/plan-135-paletas-no-painel.spec.ts
 M browser-tests/plan-145-personalidades.spec.ts
 M browser-tests/seletor-da-barra-legivel.spec.ts
 M browser-tests/troca-de-tema.spec.ts
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-CTY64WST.js
 D dist/SarakChartEngine-ID4U5SYY.js
 D dist/SarakChatEngine-OOZGJ2G6.js
 D dist/SarakDashboardGridImpl-ZBQMEY2V.js
 D dist/SarakDataGridImpl-R5KIZ6UD.js
 D dist/SarakDataTableImpl-CNDSUI6Z.js
 D dist/SarakFlowEngine-IEU4GZFT.js
 D dist/SarakKanbanImpl-TKQ4LNZP.js
 D dist/SarakMapImpl-4O3ZBJOG.js
 D dist/SarakMarkdownRendererImpl-T7ZHMJHB.js
 D dist/SarakPDFViewerImpl-OMMHKBZ6.js
 D dist/SarakQRCodeImpl-4AFYXUIU.js
 D dist/aurora-veil-UQTK43DZ.js
 D dist/blueprint-protocol-QPKJSR7E.js
 D dist/chunk-4W4ANSWR.js
 D dist/chunk-FGKLIREI.js
 D dist/chunk-GKK6FXDV.js
 D dist/chunk-IKLPDPBN.js
 D dist/chunk-JWLC7QCL.js
 D dist/chunk-Q2OA2F4Z.js
 D dist/chunk-RDGXJDGZ.js
 D dist/chunk-SMNNQELX.js
 D dist/chunk-WNV3YFQ4.js
 D dist/chunk-WZI4SRYK.js
 D dist/corporate-ledger-XY2EBRYF.js
 D dist/cyber-retro-wave-UO5NTZZT.js
 D dist/cyber-retro-wave-classic-GYMBB7RW.js
 D dist/cyberpunk-neon-MLKRVYEO.js
 D dist/cyberpunk-neon-classic-X2LJIQHR.js
 D dist/data-terminal-YW4GFMPN.js
 D dist/editorial-ink-HWSH76WX.js
 D dist/golden-hour-SINERRKG.js
 D dist/high-contrast-YTD3JRDY.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 D dist/industrial-terminal-2GHFGPPG.js
 D dist/industrial-terminal-classic-BPG27COZ.js
 D dist/kinetic-flow-BNLLZQRY.js
 D dist/minimalist-airy-HIMIGPV5.js
 D dist/nebula-space-W4BRZS26.js
 D dist/neo-brutalism-4VSJIOQS.js
 D dist/neumorphic-mobile-BCYRXVMX.js
 D dist/organic-clay-VMFYVOU3.js
 D dist/playful-pastel-ZJI4J4IP.js
 M dist/sarak-scoped.css
 D dist/sarak-sovereign-classic-BE527MTI.js
 M dist/sarak.css
 M dist/styles/_atmosphere.css
 M dist/styles/_background.css
 M dist/styles/_card-defaults.css
 M dist/styles/_card-materials.css
 M dist/styles/_elements.css
 D dist/synthwave-retro-RSU3UKU7.js
 M docs/migracoes.md
 M gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs
 M gates/scripts/contrato/check-chrome-token-parity.mjs
 M gates/scripts/contrato/check-zero-brand.mjs
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/docs/migracoes.md
 M scripts/consumer-kit/__tests__/kitGenerator.test.mjs
 M scripts/generate-consumer-kit.mjs
 M specs/00-indice.md
 M specs/plan/plan-167-bateria-de-navegador-verde-e-contraste-de-botao-e-card.md
 M specs/plan/plan-168-graficos-sem-achatar-e-ajustes-principais-traduzidos.md
 M specs/plan/plan-169-gates-que-deixam-passar-e-testes-que-estouram-o-tempo.md
 M specs/plan/plan-170-contraste-do-cromo-nas-barras-de-tom-contrastante.md
 M specs/specs/01-gates-e-baseline.md
 M specs/specs/05-cromo-e-slots.md
 M src/buildInfo.ts
 M src/components/Layout/chrome/ChromeSidebarBody.tsx
 M src/components/Layout/chrome/ChromeTopbarBody.tsx
 M src/components/Layout/chrome/__tests__/chromeToneStyle.test.ts
 M src/components/Layout/chrome/chromeToneStyle.ts
 M src/components/Layout/chrome/useChromeDesignTokens.ts
 M src/components/atomic/Navigation/SarakMenuItem.tsx
 M src/components/atomic/Navigation/SarakShellLanguageSelector.tsx
 M src/components/atomic/Navigation/SarakShellUserWidget.tsx
 M src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx
 M src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx
 M src/components/atomic/Navigation/__tests__/SarakShellUserWidget.test.tsx
 M src/components/atomic/Templates/Chat/MessageBubble.tsx
 M src/components/atomic/Templates/SarakCatalogGrid.tsx
 M src/components/engines/charts/SarakChartEngine.tsx
 M src/components/engines/charts/SubEngines/__tests__/useEChartsTheme.test.ts
 M src/components/engines/charts/SubEngines/builders/__tests__/__snapshots__/builders.characterization.test.ts.snap
 M src/components/engines/charts/SubEngines/builders/advancedCharts.ts
 M src/components/engines/charts/SubEngines/builders/basicCharts.ts
 M src/components/engines/charts/SubEngines/useEChartsTheme.ts
 M src/components/engines/chat/SarakChatEngine.tsx
 M src/core/Design/palette/__tests__/switch-glass-border.test.ts
 M src/core/Design/palette/__tests__/tone-plan.test.ts
 M src/core/Design/palette/contrast-pairs.ts
 M src/core/Design/palette/tone-plan.ts
 M src/core/Provider/buildInfo.ts
 M src/core/i18n/catalog.ts
 M src/core/i18n/catalogEntries.entries.ts
 M src/features/DesignEngine/Main/components/DecisionTokenList.tsx
 M src/features/DesignEngine/Main/components/ThemeSearchResults.tsx
 M src/features/DesignEngine/Main/components/__tests__/DecisionTokenList.test.tsx
 M src/styles/_elements.css
?? .claude/settings.local.json
?? browser-tests/contraste-do-cromo-nas-barras.spec.ts
?? browser-tests/contraste-hover-botao.spec.ts
?? browser-tests/fixtures/graficos-ocupam-o-quadro-entry.tsx
?? browser-tests/graficos-ocupam-o-quadro.spec.ts
?? dist/CustomizationPanelImpl-HJN27CUE.js
?? dist/PresetSamplesReal-R5K6HQE2.js
?? dist/SarakChartEngine-L7PYLW23.js
?? dist/SarakChatEngine-IUY2UYQI.js
?? dist/SarakDashboardGridImpl-6YGH3DCI.js
?? dist/SarakDataGridImpl-QX5U6VDH.js
?? dist/SarakDataTableImpl-NOYRYQL7.js
?? dist/SarakFlowEngine-ZQP6QOM7.js
?? dist/SarakKanbanImpl-RCGJLWTL.js
?? dist/SarakMapImpl-UVN6GABR.js
?? dist/SarakMarkdownRendererImpl-D4XN5O62.js
?? dist/SarakPDFViewerImpl-KNHWLRQY.js
?? dist/SarakQRCodeImpl-RGN33VKJ.js
?? dist/aurora-veil-XWUHXWMM.js
?? dist/blueprint-protocol-75KBJYEW.js
?? dist/chunk-2S3V7MGS.js
?? dist/chunk-6K5ADXVM.js
?? dist/chunk-EQZ2YSGP.js
?? dist/chunk-FLCTBH5F.js
?? dist/chunk-FMJBXDHM.js
?? dist/chunk-FVURJCFJ.js
?? dist/chunk-GBBAWCJQ.js
?? dist/chunk-HF2HCGVU.js
?? dist/chunk-NFRW7VSE.js
?? dist/chunk-O3YAHAUR.js
?? dist/chunk-QWOKUPH6.js
?? dist/chunk-TPMXDUUW.js
?? dist/chunk-UAY6PEK6.js
?? dist/chunk-WFYQBDSY.js
?? dist/chunk-XRTVYD2M.js
?? dist/corporate-ledger-2WFXC6MO.js
?? dist/cyber-retro-wave-KL6WDMZL.js
?? dist/cyber-retro-wave-classic-VRXPK7FU.js
?? dist/cyberpunk-neon-R4GOM7PS.js
?? dist/cyberpunk-neon-classic-SAFXK5OS.js
?? dist/data-terminal-PAMPBFDM.js
?? dist/dot-matrix-elegant-7CGGUKNT.js
?? dist/editorial-ink-TIODSI2K.js
?? dist/golden-hour-OJRUWHNB.js
?? dist/high-contrast-3F3ZJ7JL.js
?? dist/industrial-terminal-3VOY2VMR.js
?? dist/industrial-terminal-classic-XPUZ2OQ2.js
?? dist/kinetic-flow-EEXW2GQJ.js
?? dist/minimalist-airy-BZDNBR75.js
?? dist/nature-breeze-UZ3BE37W.js
?? dist/nebula-space-MNEXCY2X.js
?? dist/neo-brutalism-7UQW4ZAO.js
?? dist/neo-brutalism-classic-NHIHA3KQ.js
?? dist/neumorphic-mobile-74CDNO3V.js
?? dist/organic-clay-DT5TTXM4.js
?? dist/playful-pastel-PHB6UCAF.js
?? dist/sarak-sovereign-classic-7L67NWCZ.js
?? gates/scripts/contrato/__tests__/check-zero-brand.test.mjs
?? src/components/Layout/chrome/chromeToneContrast.ts
?? src/core/i18n/__tests__/decisionTokens.test.ts
?? src/core/i18n/catalogEntries.decisionTokens.ts
```
</details>

**O que foi feito**
- src/styles/_elements.css:91-99 — retirado o fundo global no hover e no active; os transform foram mantidos. O candidato color: var(--theme-on-primary) não está na regra final.
- browser-tests/contraste-hover-botao.spec.ts:121-190 — o painel registra repouso e hover. A regra ignora a leitura quando a assinatura visual não muda e reprova quando o hover muda e fica abaixo do limite ou do repouso; não há lista de exceções. Os probes neutro e texto apagado cobrem app/embarcado e claro/escuro.
- Medições do painel: Abrir painel no embarcado claro deu 1,09:1 em repouso e hover, sem mudança visual; a captura mostra texto legível sobre o degradê, então classifiquei como erro de leitura do fundo. Inspecionar deu 4,26→4,33:1 no claro e 4,70→4,73:1 no escuro; é ícone sem texto e fica acima do mínimo não textual da spec. ESCURO, TABLET e MOBILE deram 4,10→10,87:1 no claro e melhoraram no hover. EXECUTAR era 7,46→4,59:1, uma queda real; SarakActionCard agora mantém o fundo da ação no hover e passou a 7,46→7,46:1 no claro e 8,00→8,00:1 no escuro.
- src/components/atomic/Cards/SarakTitleCard.tsx — título, subtítulo e etiquetas usam o token de texto legível, sem troca de cor do título no hover; o spec mede as três partes nos temas padrão, escuro e claro.
- src/features/DesignEngine/Canvas/components/LiveDraftPreviewFrame.tsx — button[18] recebe aria-label por previewInspect; o teste verifica pt, en, es, fr, de e it.
- Snapshots de SarakTitleCard, CardsCatalog, PresetsCatalog e PreviewCanvas foram atualizados apenas nas saídas correspondentes a esta plan. A expectativa de Sair no PreviewCanvas foi preservada para não incorporar a alteração da plan 170.
- A nota 9.0.0 foi acrescentada ao início de docs/migracoes.md; as notas existentes da 168 e da 170 foram preservadas.
pm run guide regenerou o kit consumidor. Os pares estáveis estão em %TEMP%\sarak-previa-167\: hover do painel app claro e SarakTitleCard escuro, cada um com antes/depois.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| src/styles/_elements.css | alterado | Fundo global removido em hover/active; movimento preservado. |
| browser-tests/contraste-hover-botao.spec.ts | alterado | Repouso/hover medidos sem lista de exceções. |
| browser-tests/fixtures/harness-entry.tsx | alterado | Cenas e probes necessários às medições de lote 2/3. |
| browser-tests/arsenal-lote4.spec.ts | alterado | P11 agora verifica fundo estável e tokens de hover/active ainda calculados. |
| browser-tests/cromo-css-real.spec.ts | alterado | Teste de botão sem hover próprio acompanha a regra global atual e ainda prova o transform. |
| browser-tests/css-que-so-o-navegador-mede.spec.ts | alterado | Expectativas com/sem Provider acompanham a regra sem fundo global. |
| src/components/atomic/Cards/SarakActionCard.tsx | alterado | Botão preenchido conserva a cor de fundo no hover. |
| src/components/atomic/Cards/SarakTitleCard.tsx | alterado | Tokens legíveis nas três partes e sem troca de cor do título no hover. |
| src/components/atomic/Cards/__tests__/SarakActionCard.test.tsx.snap | alterado | Snapshot do botão de ação atualizado. |
| src/components/atomic/Cards/__tests__/cardTokensQueDesenham.test.tsx | alterado | Regressão do fundo estável coberta. |
| src/components/atomic/Cards/__tests__/SarakTitleCard.test.tsx | alterado | Caracterização dos tokens de contraste atualizada. |
| src/components/atomic/Cards/__tests__/__snapshots__/SarakTitleCard.test.tsx.snap | alterado | Snapshot das três partes atualizado. |
| src/features/DesignEngine/Canvas/components/LiveDraftPreviewFrame.tsx | alterado | Nome acessível vindo do catálogo. |
| src/features/DesignEngine/Canvas/components/__tests__/LiveDraftPreviewFrame.test.tsx | alterado | Seis idiomas verificados. |
| src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap | alterado | Só a saída de Inspecionar foi atualizada. |
| src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/CardsCatalog.test.tsx.snap | alterado | Títulos e etiquetas atualizados. |
| src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap | alterado | Apenas saídas existentes dos cards atualizadas; placeholders lazy preservados. |
| src/features/DesignEngine/Main/components/ThemeDecisionList.tsx | alterado | Hover de marca/decisões não introduz fundo de baixa leitura. |
| src/features/DesignEngine/Main/components/ThemeAdvancedMenu.tsx | alterado | Texto de botão mantém a cor estável no hover. |
| src/features/DesignEngine/Main/components/ThemeMoreActionsMenu.tsx | alterado | Texto de botão mantém a cor estável no hover. |
| docs/migracoes.md | alterado | Nota 9.0.0 acrescentada, sem remover entradas existentes. |
| sarak-ui/GUIA-FRONTEND.md, sarak-ui/docs/migracoes.md | gerados | Kit consumidor regenerado com as notas presentes. |
| specs/plan/plan-167-bateria-de-navegador-verde-e-contraste-de-botao-e-card.md | alterado | Este resumo append-only; status passou a Em revisão. |

**Verificações executadas**
- npm run build na cópia isolada em %TEMP% → exit 0; inclui guide:check e os ensaios com e sem peers opcionais.
- npm run verify -- --tier=quick na cópia isolada → exit 0; TypeScript, baseline, Anel 1 e Anel 0 passaram; Anel 0 percorreu 3.152 linhas com 0 achados.
- npx vitest run SarakTitleCard.test.tsx SarakActionCard.test.tsx cardTokensQueDesenham.test.tsx CardsCatalog.test.tsx LiveDraftPreviewFrame.test.tsx → 5 arquivos, 63 testes passaram.
- npx vitest run PresetsCatalog.test.tsx → 17 passaram; 1 falhou pelo timeout padrão de 5 s, inclusive rodando sozinho. O teste espera até 10 s internamente; não alterei o limite.
- npx playwright test --config=browser-tests/playwright.config.ts browser-tests/contraste-hover-botao.spec.ts → 16/16 passaram após a correção do componente.
- npm run cromo-css-real:check → a rodada completa anterior terminou com 857 aprovados, 24 falhas e 2 ignorados. Quatro falhas de expectativa desta plan foram corrigidas depois e passaram nos specs focados; a bateria completa não foi repetida.
- git diff --check nos arquivos desta plan → sem erros de whitespace.

**Critérios de aceite**
- [x] Hover global deixa o fundo intacto, active mantém o transform, sem candidato de cor global — evidência: src/styles/_elements.css e P11/specs direcionados.
- [x] Leituras de repouso e hover registradas; erro do leitor separado do defeito real; EXECUTAR corrigido no componente — evidência: medições e 16/16 testes do spec de contraste.
- [x] button[18] tem rótulo do catálogo em seis idiomas — evidência: LiveDraftPreviewFrame.test.tsx.
- [x] SarakTitleCard atende às três partes nos temas padrão, escuro e claro — evidência: spec de navegador, 16/16.
- [x] Nota 9.0.0 acrescentada, kit regenerado, quatro capturas finais em dois pares estáveis em %TEMP%.
- [ ] Bateria completa verde em build novo — a última execução completa ainda teve falhas fora do escopo e não foi repetida depois dos ajustes focados.
- [ ] Aprovação visual do dono para os pares antes/depois — capturas disponíveis para revisão.

**Decisões e suposições**
- Abrir painel no embarcado claro foi classificado como erro do leitor porque a assinatura não muda entre repouso e hover e a captura está legível sobre o degradê.
- O ícone Inspecionar usa o mínimo de contraste não textual da spec; sua razão melhora no hover e permanece acima de 3:1.
- O defeito real de EXECUTAR foi resolvido localmente no componente, preservando o token de fundo gerado.
- Usei a cópia isolada para build/verify e navegador porque o dist/ raiz é compartilhado e estava sob uso de outras plans. Nenhum arquivo de plan 168, 169 ou 170 foi editado.

**Achados fora do escopo (não corrigidos)**
- A bateria completa anterior também falhou em amostras-reais-custo, contraste-do-que-faltava, plan-140, plan-141, plan-149, plan-161 e tom-contrastante; não alterei esses specs nem as plans 168–170.
- PreviewCanvas.test.tsx ainda contém diferença de snapshot na saída Sair, originada em SarakShellUserWidget da plan 170; mantive essa parte intacta.
- PresetsCatalog.test.tsx expira em 5 s antes de concluir a espera configurada para 10 s; o limite não foi aumentado.

**Pendências / riscos**
- O aceite da bateria completa permanece pendente: a execução longa ainda não está verde e não houve repetição integral após os quatro ajustes focados.
- As capturas estão prontas em %TEMP%\sarak-previa-167\; falta o parecer visual do dono.
## Nota do revisor — 2026-11-22 — `PresetsCatalog` passa para a plan-169

O vermelho de `PresetsCatalog.test.tsx` já existe no `HEAD` (snapshot que depende do instante). A plan-169 torna o teste determinístico e
regenera o snapshot, inclusive as linhas do card desta plan. A 167 não edita mais esse arquivo. Os lotes 2 e 3 ainda não foram revisados.

## Veredito — 2026-11-22 — lotes 2 e 3 — 🔴 Reprovado (5 achados; a bateria inteira não está verde)

**Como medi:** `git status` e `git diff` dos arquivos de produção e dos specs desta plan; leitura integral de `browser-tests/contraste-hover-botao.spec.ts`;
`npm run token-reader:check` (OK); `npx vitest run` de SarakTitleCard, SarakActionCard, cardTokensQueDesenham, CardsCatalog, LiveDraftPreviewFrame
e DecisionTokenList (6 arquivos, 67 testes verdes). **Não rodei `npm run build`, a bateria nem `verify -- --tier=full`:** há `npm` e `node` de outra
execução ativos desde 04:19, e a regra é uma plan de cada vez no `dist/`. A conferência no navegador fica para a correção.

**O que passa:** a decisão do 2.2 (fundo global fora, `transform` mantido) está em `src/styles/_elements.css:91-99`; os specs `cromo-css-real`,
`css-que-so-o-navegador-mede` e `arsenal-lote4` acompanham a regra sem afrouxar limiar; `LiveDraftPreviewFrame` ganhou `aria-label` do catálogo; a
nota 9.0.0 está em `docs/migracoes.md`; as prévias existem em `%TEMP%\sarak-previa-167\` (dois pares).

**Achados:**
1. `specs/plan/…167….md` §9, resumo de 2026-11-22, critério "Bateria completa verde em build novo" — **não atendido.** A última rodada completa teve 24
   falhas e não foi repetida; o resumo lista como "fora do escopo" `amostras-reais-custo`, `contraste-do-que-faltava`, `plan-140`, `plan-141`, `plan-149`,
   `plan-161` e `tom-contrastante`. A meta desta plan é a bateria inteira verde, então nenhum vermelho é "fora do escopo". Dois deles (`contraste-do-que-faltava`,
   `plan-141`) leem contraste e hover, e podem ser efeito da remoção do fundo no hover ou do `SarakTitleCard`. Para cada um: rodar sozinho num build
   novo, dizer se o HEAD limpo já o derruba, e corrigir o teste velho ou o código. Fechamento: bateria inteira verde duas vezes seguidas.
2. `src/core/Design/schema/colors.ts:167` e `:180` — o `description` de `colorDepth` e `colorVariation` afirma que `--theme-primary-hover` e
   `--theme-primary-active` são "lidos pelos estados globais de hover e pressionado de `button` em `_elements.css`". **Passou a ser falso:** o `grep` em
   `src/` só acha `_base.css` (a declaração), o schema e um teste. A regra R40 ("token sem leitor não entra") e `browser-tests/arsenal-lote4.spec.ts` (P11, que
   agora só confere que a *variável* muda, sem leitor na tela) ficam sem prova de efeito. Os dois tokens têm outro leitor visível? Se sim, a descrição
   cita esse; se não, o ajuste do painel não muda a tela e isso precisa ir ao dono (escopo da plan: `colors.ts` está fora, então **pare e traga ao revisor**
   com a medição antes de mexer).
3. `browser-tests/contraste-hover-botao.spec.ts:~226-233` — o bloco do `SarakTitleCard` tem os acentos corrompidos nos nomes (`padrÃ£o`, `tÃ­tulo`,
   `subtÃ­tulo`, `nÃ£o`, `visÃ­vel`): o arquivo foi regravado com a codificação errada. Corrigir para UTF-8 (`padrão`, `título`…), e conferir os demais arquivos
   desta plan com `grep -c "Ã"`.
4. `src/components/atomic/Cards/SarakTitleCard.tsx:99-104` — o subtítulo passou a usar `--theme-text-primary`, a mesma cor do título, e o título perdeu a cor
   de hover (`group-hover:text-…`). O contraste fecha, mas some a hierarquia subtítulo/título e o aceno do hover. Decidir por token que mantém 4,5:1 e a
   distinção (por exemplo, `--theme-text-secondary` se alcançar o limite), medir nos três temas e deixar no resumo a escolha e o porquê. Se não houver, o
   dono decide com as prévias.
5. **Prévia sem parecer.** O critério "prévia com o ok do dono" segue aberto. Os dois pares em `%TEMP%` precisam ir ao dono (hover do painel e `SarakTitleCard`
   escuro), e o lote só fecha com a resposta. O `C:/tmp/sarak-previa-167/` foi negado pelo sandbox; copiar o par final para lá, quando o dono liberar, ou
   manter no `%TEMP%` e avisar o caminho.

**Fora do escopo desta plan, no mesmo diff (não é da 167, fica de fora do commit dela):** `DecisionTokenList.tsx`, `ThemeSearchResults.tsx`, `ThemeActionBar.tsx`,
`catalogEntries.*` e `decisionTokens` são da plan-168; `SarakMenuItem.tsx`, `chromeTone*` e `SarakShellUserWidget.tsx`, da plan-170;
`PresetsCatalog.test.tsx` e o snapshot dele, da plan-169. O commit da 167 sai com `git commit -- <caminhos>` limitado a esta plan.
`SarakActionCard.tsx`, `ThemeAdvancedMenu.tsx`, `ThemeMoreActionsMenu.tsx` e `ThemeDecisionList.tsx` ficam fora da lista literal da §3.1, mas o veredito de 2026-11-21 mandou
corrigir no componente o botão que cai abaixo de 4,5:1; aceitos por isso.

**Escopo da correção:** exclusivamente os achados acima. Build e bateria rodam sozinhos, com a vez dada pelo dono.

**Status da plan: 🔵 Em correção.**

## Nota do revisor — 2026-11-22 — achado 2 medido: decisão D1 do dono

**O achado do executor procede.** Nenhum arquivo de `src/` lê as variantes que `colorDepth` e `colorVariation` moldam. Os dois únicos
leitores eram as linhas de `_elements.css` que a decisão 2.2 tirou. A falha foi do revisor, que decidiu o 2.2 sem medir quem mais dependia
delas.

**Religar no botão primário reabre o defeito que esta plan fecha.** Medido nos 25 temas × 2 modos, com `btnPrimaryText` sobre as variantes
de `btnPrimaryBg`, no ajuste que cada tema declara: 12 de 50 ficam abaixo de 4,5:1 no hover e 28 de 50 no pressionado (mínimo 3,77). Nos
50 existe algum ajuste do painel que reprova. No repouso os 50 passam.

**D1 — decisão do dono:**
- **a) recomendada:** remover os dois tokens na 9.0.0. As variáveis `-hover` e `-active` continuam emitidas com o fator 1, porque são
  públicas. 48 dos 50 casos já usam 1/1; os dois com profundidade 0 mudam só o valor da variável, que a lib não lê.
- **b)** manter para o importador, fora do painel, com descrição verdadeira e exceção declarada à R40.
- **c)** religar com correção de contraste no motor: trabalho novo, muda o botão nos temas e volta atrás no 2.2.

**Escopo do achado 2, se o dono escolher (a):** `schema/colors.ts`, as chaves nos temas, catálogo e mapeamento, manifesto, `constants.ts`,
`coverage.ts`, a leitura em `useDesignVariables.ts`, `REMOVED_TOKEN_KEYS`, os testes que os citam, os gerados e a entrada 9.0.0 de
`docs/migracoes.md` nomeando os dois. Os gerados se regeneram depois que a plan-169 parar, porque ela também os regenera.

**Codificação (achado 3):** conferida pelo revisor, 0 ocorrências. O `grep -c "Ã"` que o veredito pediu dá falso positivo; vale o padrão
estrito.

**Build e navegador:** os vermelhos individuais em cópia isolada; medição de tempo só com a máquina livre; as duas baterias finais na raiz,
com as plans 168 e 169 paradas.

## Nota do revisor — 2026-11-22 — decisão D1 do dono: (a), remover

**Decisão do dono:** (a). `colorDepth` e `colorVariation` saem na 9.0.0.

**O escopo da nota anterior só olhava `src/`. Entram também, pela varredura do repositório inteiro:**
- `src/core/Provider/utils/color-engine.ts`: `ColorVariantShape` e o parâmetro de forma saem; a saída fica idêntica à do fator 1;
- navegador: `arsenal-lote4.spec.ts` (P11), `arsenal-restante-desenha.spec.ts` (os casos dos dois tokens) e as cenas `cor-profunda` e
  `cor-variada` de `browser-tests/fixtures/harness-entry.tsx`. Um teste de unidade passa a provar que `-hover` e `-active` seguem
  emitidas com o valor do fator 1;
- snapshots `AtmosphereCatalog` e `PreviewCanvas`: regenerar só eles e conferir que o diff é só das variáveis removidas;
- gerados: `design-token-ids.ts`, `design-token-docs.json`, `docs/component-catalog.{md,json}`, `sarak-ui/catalog.json`,
  `sarak-ui/GUIA-FRONTEND.md` e a cópia de `docs/migracoes.md` no kit;
- a entrada 9.0.0 diz três coisas: o valor salvo é descartado com aviso; as chaves saem do tipo público `SarakDesignTokens` (objeto de
  tema em TypeScript que as cite deixa de compilar); `--sarak-color-depth` e `--sarak-color-variation` deixam de existir, e
  `industrial-terminal-classic`, o único com profundidade 0, passa a emitir `-hover` e `-active` com o fator 1.
- As entradas antigas de `docs/migracoes.md` são histórico e não mudam.

**Do revisor, na síntese:** `specs/arquitetura/02-design-engine.md` §10.3.

## Nota do revisor — 2026-11-22 08:22 — passagem para uma conversa nova

A conversa anterior não gravou resumo na §9 depois do veredito dos 5 achados. Estado medido pelo revisor:

| Achado | Estado |
|---|---|
| 1 — bateria | em andamento na cópia `%TEMP%\sarak-167-copia` (sincronizada 08:06, build 08:10), com um laço por spec gravando em `logs2\` e `logs2\ordem.txt`. O laço é solto da conversa e pode seguir rodando |
| 2 — D1 (a) | código, temas, testes de navegador e a entrada 9.0.0 editados na raiz desde 08:01, **sem revisão**. Faltam os gerados (`token-types:check`, `catalog:check` e `guide:check` vermelhos), a cópia de `docs/migracoes.md` no kit e os snapshots `PreviewCanvas` e `AtmosphereCatalog` |
| 3 — codificação | pronto e conferido |
| 4 — card de título | não começou: título e subtítulo seguem com `--theme-text-primary`, sem hover no título |
| 5 — prévias | não começou: as quatro de `%TEMP%\sarak-previa-167\` são de 2026-11-21 |

**Resultados parciais em `logs2\`:**
- verdes: `arsenal-lote4`, `arsenal-restante-desenha` e `plan-140-painel-coluna-unica`;
- `contraste-hover-botao`: 2 de 16 vermelhos (painel app claro e painel embarcado claro);
- `contraste-do-que-faltava`: 2 de 24 vermelhos, o botão de sair em `contraste-claro` e `contraste-escuro` (1,73 e 1,94 para um mínimo
  de 4,5). Conferir no `HEAD` e contra o commit `685d83f5` (plan-170), que mexeu na cor desse botão;
- em andamento: `plan-141-presets-do-painel`;
- sem resultado novo, da última bateria completa (24 falhas): `amostras-reais-custo`, `plan-149`, `plan-161` e `tom-contrastante`.

**Antivírus:** entre 07:32 e 07:57 o Defender pôs 7 `bundle.js` do harness em quarentena (`Trojan:Win32/Bearfoos.A!ml`, falso positivo
provável). Os timeouts dessa janela em `logs\` não valem. Timeout novo: conferir `Get-MpThreatDetection` antes de classificar. Havendo
detecção nova, parar e avisar o dono. Nunca permitir a ameaça, criar exclusão ou mudar o build para escapar do antivírus.

**Ordem dos gerados:** os da D1 podem sair já, porque o que resta da plan-169 não os altera. Só o snapshot `PreviewCanvas` espera a 169
parar.

**Nomes na nota acima:** `plan-140`, `plan-141`, `plan-149` e `plan-161` são **arquivos de teste**, não plans abertas (as plans com esses
números já foram sintetizadas): `browser-tests/plan-140-painel-coluna-unica.spec.ts`, `browser-tests/plan-141-presets-do-painel.spec.ts`,
`browser-tests/plan-149-barras-personalidade.spec.ts` e `browser-tests/plan-161-catalogo-proporcional.spec.ts`.

## Resumo da execução (correção 1, passo 1 — D1) — 2026-11-22

**Passo 1 — D1 (a), remover `colorDepth` e `colorVariation`: concluído, exceto o snapshot `PreviewCanvas` (espera a plan-169 parar; há um vitest dele rodando na raiz às 08:26).**

- Diff conferido contra as duas notas da D1: schema (`colors.ts`), 25 temas (50 linhas removidas, só as duas chaves), `constants.ts`, `manifest.ts`, `coverage.ts` (`PALETTE_IDS`), `color-engine.ts` (`ColorVariantShape`, `rotateHue` e o parâmetro de forma saem; hover = ×1,1, active = ×0,9), `useDesignVariables.ts`, `designVariableHelpers.ts`, `REMOVED_TOKEN_KEYS`, testes (`useDesignVariables`, `removedTokenKeys`, `manifest`) e a entrada 9.0.0 de `docs/migracoes.md` com os três pontos. As entradas antigas não mudaram. Os dois tokens só aparecem agora em teste que prova a ausência, em `REMOVED_TOKEN_KEYS` e na migração.
- Gerados regenerados pelos scripts: `npm run token-types` (430 tokens), `npm run catalog` (139 componentes), `npm run guide` (kit com a cópia de `docs/migracoes.md`).
- Snapshot `AtmosphereCatalog` regenerado com `-u` só nele; o diff por palavra tem exatamente 4 remoções de `--sarak-color-depth: 1; --sarak-color-variation: 1`.
- Verificações: `token-types:check`, `catalog:check`, `guide:check`, `token-reader:check`, `theme-completeness:check` verdes (25/25); `tsc --noEmit` sem saída (0 erros); `audit:baseline --with-tsc` "igual ao baseline… nenhuma regressão"; `vitest run src/core/Design src/core/Provider` → 130 arquivos, 1934 testes verdes.
- Pendência do passo: `PreviewCanvas.test.tsx.snap` (2 ocorrências das variáveis), regenerar com `-u` só nele quando a 169 parar. `dev-kit:check` não foi rodado (fora da lista do passo).

## Nota do revisor — 2026-11-22 — a causa do vermelho do botão de sair

É regressão da plan-170 (`685d83f5`), já provada: não precisa do controle no `HEAD`. A correção é desta plan, pelo veredito
"regressão achada depois do commit" da §10 da plan-170. `SarakShellUserWidget.tsx`, `chromeToneStyle.ts`, `chromeToneContrast.ts`,
`contrast-pairs.ts` e os testes deles entram no escopo. O limiar e o `contraste-do-que-faltava.spec.ts` não mudam.

## Resumo da execução (correção 1, passo 2 — achado 4, `SarakTitleCard`) — 2026-11-22

- **Escolha:** subtítulo em `--sarak-text-sec` (fallback `--theme-text-primary`); título em `--theme-text-primary` no repouso e, no hover, mistura de 60% de `--sarak-primary-color` com `--theme-text-primary` (`color-mix`). Etiquetas seguem em texto primário. `src/components/atomic/Cards/SarakTitleCard.tsx`.
- **Por quê:** `textColorSecondary` entra nos pares de contraste da paleta contra o cartão (`palette/contrast-pairs.ts:35-41`, mínimo 4,5), logo mantém a hierarquia (abaixo do título) sem tema novo. A primária pura no hover ficou em 4,54–4,66 nos três temas, margem curta; a mistura dá folga.
- **Medido no navegador (sonda na cópia, transição desligada), razão sobre o fundo composto do cartão:**

| tema | subtítulo `--sarak-text-sec` | título repouso | título hover (mistura 60%) | primária pura (descartada) |
|---|---|---|---|---|
| padrão (escuro) | 13,91 | 16,86 | 8,03 | 4,66 |
| cyberpunk-neon (escuro) | 13,71 | 16,72 | 7,90 | 4,61 |
| minimalist-airy (claro) | 15,31 | 17,48 | 8,32 | 4,54 |

- **Teste:** `browser-tests/contraste-hover-botao.spec.ts` (bloco do card): mantém 4,5:1 em hover para as três partes; a segunda asserção "hover não reduz o contraste do repouso" deixa de valer só para o **título**, que muda de cor de propósito (o limiar de 4,5:1 não mudou).
- **Unidade:** `SarakTitleCard.test.tsx` atualizado; snapshots `SarakTitleCard` e `CardsCatalog` regenerados com `-u` só neles (diff = só as classes do título e do subtítulo). `PresetsCatalog` e `PreviewCanvas` (plan-169) ainda não foram regenerados.
- **Verificação:** `npx vitest run src/components/atomic/Cards` (16 verdes + o snapshot regenerado); build novo na cópia `%TEMP%\sarak-167-copia` (`GIT_DIR` só inline no comando do build; a cópia não é repositório) e `contraste-hover-botao -g SarakTitleCard` → 3/3 verdes, com `color-mix` presente em `dist/sarak.css`. Uma primeira rodada deu 3/3 num `dist` velho porque o build tinha falhado por falta de `.git`; descartada.

## Nota do revisor — 2026-11-22 09:30 — três gates desta plan bloqueiam o commit de todas

- `dev-kit:check`: a D1 tirou dois tokens e o `sarak-dev/` ainda conta 432. Rodar `npm run dev-kit`.
- `variable-contract:check`: não vê `style['--x'] = …` em `chromeToneStyle.ts`. Escrever `--sarak-shell-logout-text-color` como chave de
  objeto (por exemplo, `Object.assign(style, { '--sarak-shell-logout-text-color': cor })`).
- `audit:baseline` (`auditor_ghostvars` 0 → 2): `src/components/Layout/chrome/chromeToneStyle.ts` escreve variável em runtime e entra em
  `RUNTIME_VARS_FILES` de `gates/scripts/audit/auditor_ghostvars.mjs`, com o motivo. É fonte real, não isenção.

O revisor testou as duas últimas juntas numa cópia: os dois gates ficam verdes. Nada entra no baseline.

## Resumo da execução (correção 1, passos 3 e 4 — achado 1 e achado 5) — 2026-11-22

**Passo 3 — cada vermelho, sozinho, num build novo da cópia `%TEMP%\sarak-167-copia` (build com `GIT_DIR` só inline) e, para os que caem, no controle `%TEMP%\sarak-167-head` (`git archive HEAD` de `20b5a460`, build próprio, `node_modules` por junção).** Defender: última detecção 07:57 (as 7 já conhecidas); nenhuma nova.

| spec | cópia (worktree) | HEAD limpo | destino |
|---|---|---|---|
| `arsenal-lote4` (10), `arsenal-restante-desenha` (27), `plan-140` (8), `plan-141` (27), `plan-161` (25), `amostras-reais-custo` (31, 2 skipped, 12,6 min) | verdes | não rodado | nada a fazer. `plan-161` e `amostras-reais-custo` estavam sem resultado; `amostras-reais-custo` mede tempo e passou com a máquina carregada pela raiz |
| `contraste-hover-botao` | 2 de 16 vermelhos → **16/16 depois do conserto** | n/a (spec novo da 167) | **código perdeu algo:** o texto do `SarakButton` `ghost` era a cor primária crua e dava 4,10:1 sobre a superfície tingida do painel no tema claro (botões ESCURO/TABLET/MOBILE/VIEW ALL HISTORY), já em repouso. Conserto em `SarakButton.tsx` (`ghost`): `color-mix(in srgb, primária 85%, --sarak-on-surface)`. Medido: 5,22:1 claro e 5,68:1 escuro (antes 4,10 e 4,54). Snapshot `SarakDataTable.semPropsNovas` regenerado (diff = só essa classe) |
| `contraste-do-que-faltava` (botão de sair, 2 casos: 1,73 e 1,94) | 2 vermelhos | **cai igual** (2 vermelhos) | **fora da 167, é da plan-170.** O commit `685d83f5` trocou o texto do sair por `--sarak-status-error-color` cru. O worktree já traz o conserto da 170 (`SarakShellUserWidget.tsx` e `chromeToneStyle.ts`, modificados às 08:51, com `--sarak-shell-logout-text-color`); a cópia é de 08:06 e não o tem. Não toquei |
| `plan-149-barras-personalidade` (sair, lateral recolhida, primary/light: 1,11) | 1 vermelho | **cai igual** | mesma causa, plan-170. O `chromeToneContrast.ts:182` só calcula a cor do sair para a topbar, e a lateral recolhida fica sem ela |
| `tom-contrastante-legivel` (28 casos) | 7 vermelhos (depois de reverter o IconButton; ver abaixo) | **cai igual: os mesmos 7** | **fora da 167, é da plan-170** (contraste do cromo em barra contrastante): ícone da barra a 3,85–4,21 e texto "user" a 4,39–4,46 em `minimalist-airy` claro e `sarak-sovereign` claro, texto "Lateral"/"M" a 1,05 em `nebula-space` claro (degradê). Leituras no log da cópia `logs2\tom.r3.log` |

- **Erro meu, corrigido:** a primeira versão do conserto também mudou o ghost do `SarakIconButton`; isso derrubou 9 casos a mais de `tom-contrastante-legivel` (o `ChromeCollapseToggle` usa o `SarakIconButton` ghost e caiu a 4,44:1). Revertido: só o `SarakButton` mudou. Depois da reversão o conjunto vermelho ficou idêntico ao do HEAD.
- **Aviso ao dono:** `contraste-do-que-faltava` (sair), `plan-149` (sair) e `tom-contrastante-legivel` (7) dependem da plan-170. Provado que caem no HEAD limpo e que a causa está em arquivos da 170. Não consegui deixá-los verdes dentro da 167.
- `fontes-no-painel` não está na lista do achado 1; não rodei.
- Verificação de unidade: `vitest run src/components/atomic/Buttons src/components/atomic/DataDisplay/SarakDataTable` → 45 arquivos, 287 testes, depois de regenerar o snapshot do DataTable.
- Nota de migração do ghost adicionada em `docs/migracoes.md` (9.0.0) e kit regenerado (`guide:check` verde).

**Passo 4 — capturas antes/depois do hover e do `SarakTitleCard`** (antes = HEAD `20b5a460`; depois = worktree da cópia). Todas em `C:\Users\Igor\AppData\Local\Temp\sarak-previa-167\passo4\`: `antes-botao-{neutro,texto-apagado,fantasma}-hover-{modo-claro,modo-escuro}.png` e `depois-…` (12 imagens), `antes-titlecard-hover-{padrao,escuro,claro}.png` e `depois-…` (6). **Aguardando o ok do dono.**

## Veredito — 2026-11-22 16:00 — correção 1, passos 1 a 4, e o botão de sair — 🔵 Em correção (6 achados)

**Como medi:** cópia do worktree com build novo, fora da raiz. Suíte inteira: 7017 de 7020 (os 3 vermelhos são desta plan: achados 1 e 2).
Navegador: 92 de 99 nos cinco specs de contraste do achado 1 anterior (os 7 vermelhos são o achado 5). Sonda nos 25 temas × 2 modos ×
3 tons × lateral recolhida e topo, no código entregue e num conserto candidato em cópia descartável. O `dist/` da raiz (08:53) não serve
de prova: `SarakIconButton.tsx` mudou às 09:30, depois dele.

**Aprovados:** D1 no código e na migração; codificação; o `ghost` do `SarakButton` (85%) com a nota; `contraste-do-que-faltava`,
`contraste-do-cromo-nas-barras`, `plan-149-barras-personalidade` e `contraste-hover-botao` verdes no worktree com build novo.

**Achados, nesta ordem:**

1. **Três gates seguem vermelhos e bloqueiam o commit de todas as plans** (nota "09:30"). É o primeiro passo, antes de qualquer outro:
   `npm run dev-kit`; a chave de objeto em `chromeToneStyle.ts`; `RUNTIME_VARS_FILES` em `auditor_ghostvars.mjs`.
2. **Dois snapshots vermelhos.** `SarakDataTable.semPropsNovas` guarda a classe do `SarakIconButton` que foi revertida (regenerado 08:54,
   revertido 09:30; os 287 verdes do resumo são anteriores à reversão). `PreviewCanvas` já pode ser regenerado: a 169 está parada e o
   patch dela não depende do worktree. `-u` só nos dois.
3. **O botão de sair da lateral recolhida não pinta a cor dele (150 de 150 cenas medidas).** Causa: o `tailwind-merge` lê
   `text-[var(...,color-mix(...40%...))]` como tamanho de fonte, por causa do `%`. Não remove a cor do fantasma nem
   `text-[var(--theme-muted)]`, que vence, e apaga o `text-xs` do botão. A dependência de ordem alfabética relatada vem daí.
   - `text-[color:var(...)]` e `hover:text-[color:var(...)]` em `SarakShellUserWidget.tsx`: medido, a cor certa em todas as cenas e o
     tamanho de volta. Sem depender do nome da variável.
   - `chromeToneContrast.ts`: calcular a cor do sair também na lateral, sobre parada + tinta da faixa (5%) + tinta de erro (15%), com
     folga de arredondamento (3,05). Só com o tipo, a recolhida em tom contrastante cai abaixo de 3:1; com os dois, nenhuma cena medida cai.
   - Teste que caia sem o tipo (a classe apagada some e `text-xs` fica) e cena de navegador da recolhida que confira a cor pintada.
4. **`SarakTitleCard` deixou de obedecer a `cardTitleColor` e a `subtitleColor`: regressão de tokens públicos.** Medido com magenta e
   verde no config: o `HEAD` pinta as duas; o worktree, nenhuma (`--theme-text-primary` sempre existe e vence). A sugestão de
   `--theme-text-secondary` do achado 4 anterior era do revisor e estava errada. Título: `--sarak-card-title-color` no repouso e mistura
   de 60% da primária com ele no hover; subtítulo: `--sarak-subtitle-color`. Testado na cópia: os tokens pintam e
   `contraste-hover-botao` segue verde. O teste de unidade volta a exigir os dois tokens.
5. **Os 7 vermelhos de `tom-contrastante-legivel` são regressão de `685d83f5` e fecham nesta plan.** Controle por `git archive`: 28 de
   28 verdes no commit anterior, 7 vermelhos no `685d83f5`. Os arquivos já estão no escopo; `tone-plan.ts` entra se a causa exigir.
   - 6 casos: `resolveIdleForeground` mede só a parada nua, e o texto inativo aparece também sobre a faixa do usuário (5%) e o botão de
     idioma (10% da própria cor). Medir esses fundos fecha os 6, mas muda a tinta em que o texto forte se apoia e derruba
     `contraste-do-cromo-nas-barras` (idioma 4,46 em nebula-space): **o inativo e o forte se resolvem juntos.**
   - `nebula-space` claro, lateral (1,05:1): o ramo do papel `surface` em `resolveChromeToneStyle` aplica um texto forte calculado para
     um fundo que não é o pintado. Sem esse ramo, o caso passa. Achar a divergência sem desfazer o que o ramo corrige nos outros temas.
   - Limiares e specs não mudam.
6. **As capturas não servem ao ok do dono.** As quatro `sair-*` mostram a lateral expandida, onde o sair é mudo e não mudou; o par do
   fantasma é idêntico byte a byte (a mudança é no repouso, e a foto é do hover); as do card mudam com o achado 4. Refazer: sair na
   recolhida e no topo, neutro e contrastante, claro e escuro; fantasma em repouso; card em repouso e hover.

**Prova da correção:** num build novo da cópia, posterior à última edição, os cinco specs acima verdes juntos; `vitest` de
`Layout/chrome`, `Navigation`, `Buttons`, `Cards`, `DataDisplay` e `DesignEngine/Canvas`; os três gates. As duas baterias inteiras na raiz
vêm depois do ok das capturas. Até lá, a 168 e a 169 ficam paradas.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção 2, achado 1 — três gates) — 2026-11-22

- `npm run dev-kit` (sarak-dev/ regenerado: 430 tokens, 139 componentes, 45 gates).
- `chromeToneStyle.ts`: `--sarak-shell-logout-text-color` passou a chave de objeto (`Object.assign(style, { '…': cor })`).
- `auditor_ghostvars.mjs`: `chromeToneStyle.ts` entra em `RUNTIME_VARS_FILES`, com o motivo em comentário. Nada no baseline.
- Verdes: `dev-kit:check`, `variable-contract:check`, `audit:baseline` (igual ao baseline, nenhuma regressão).
- **Parei aqui, como pedido, para o dono commitar a plan-169.** Achados 2 a 6 não iniciados.

## Veredito — 2026-11-22 17:58 — correção 2, achado 1 — aprovado; a plan segue 🔵 nos achados 2 a 6

**Como medi:** na raiz, os três gates e o resto do Anel 1 verdes. Em cópia do worktree, duas mutações no `auditor_ghostvars`: uma
variável inexistente consumida em `chromeToneStyle.ts` reprova, e apagar a linha que emite a cor do sair reprova os dois consumos dela.
A entrada em `RUNTIME_VARS_FILES` não cegou o gate.

**Segue:** achados 2 a 6 do veredito "2026-11-22 16:00", depois que o dono commitar a 169 e a 168. O ok de hoje do dono é das capturas
da 168 e não vale para as desta plan, que ainda serão refeitas.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção 2, achados 2 a 6) — 2026-11-22

**Achado 2 — snapshots.** `SarakDataTable.semPropsNovas` e `PreviewCanvas` regenerados com `-u` só neles; `CardsCatalog` e `SarakTitleCard` de novo ao fim (classes do achado 4). Diff do `PreviewCanvas` também traz o `aria-label="Inspecionar"` e `text-[var(--theme-primary)]`, que vêm de código já no worktree (168), não desta plan.

**Achado 3 — sair da lateral recolhida.** `SarakShellUserWidget.tsx`: `text-[color:var(...)]` e `hover:text-[color:var(...)]`, com o motivo no comentário. `chromeToneContrast.ts`: o sair é medido também na lateral (parada + tinta de 5% do marcador + tinta de erro de 15%), mínimo 3,05. Testes: `SarakShellUserWidget.test.tsx` (cai sem o prefixo `color:`, provado por mutação), `chromeToneStyle.test.ts` (lateral entrega a cor), e `plan-149` confere a cor pintada = cor calculada (lateral recolhida e topbar, 2 modos × 3 tons).

**Achado 4 — `SarakTitleCard`.** Título `--sarak-card-title-color` no repouso e mistura de 60% da primária com ele no hover; subtítulo `--sarak-subtitle-color` → `--sarak-text-sec`. A reserva do `--sarak-text-sec` passou a `rgba(242,246,251,0.72)` (o `variable-contract:check` acusou `#f2f6fb`). Teste de unidade exige os dois tokens.

**Achado 5 — 7 vermelhos de `tom-contrastante-legivel`.**
- 6 casos: o texto inativo agora também é medido sobre a faixa do usuário (5%) e o botão de idioma (10% da própria cor), e **inativo e forte se resolvem juntos** (até 4 rodadas), em `chromeToneContrast.ts`. Teste numérico em `chromeToneStyle.test.ts` (cai se as superfícies extras saírem: 4,11 < 4,5, provado por mutação).
- `nebula-space` claro, lateral (1,05:1): no papel de superfície, a cor forte corrigida passava a pintar o controle escolhido (`--sarak-nav-active-color`), mas o texto sobre ele seguia o do botão primário. `chromeToneStyle.ts` agora define `--sarak-on-nav-active` como o fundo da barra. Teste de unidade.
- Limiares e specs não mudaram.

**Prova (cópia `%TEMP%\sarak-167-copia`, build novo às 19:34, posterior à última edição; `GIT_DIR` só inline):** `tom-contrastante-legivel` (28/28), `contraste-do-cromo-nas-barras`, `contraste-do-que-faltava` (24/24), `plan-149-barras-personalidade` (30/30) e `contraste-hover-botao` (16/16), todos com exit 0 (logs em `logs5\`). Gates na raiz: `dev-kit:check`, `variable-contract:check`, `catalog:check`, `guide:check`, `token-reader:check`, `token-types:check`, `theme-completeness:check`, `audit:baseline --with-tsc` e `tsc --noEmit` verdes. `vitest` de `Layout/chrome`, `Navigation`, `Buttons`, `Cards`, `DataDisplay`, `DesignEngine`, `Templates`, `Layout`, `core/Design/palette`: verdes, **exceto** `MasterControlPanel.test.tsx` (ver abaixo).

**Fora desta plan, para o dono:** `MasterControlPanel.test.tsx` não carrega: o mock de `core/Design/master-map` não define `sarakGetDefaultDesignState`, que `designVariableHelpers.ts` (alteração não commitada, dos 29 achados da 169, `DEFAULT_BODY_BG`) agora importa. Não é desta plan; o teste precisa do export no mock.

**Achado 6 — capturas** (antes = HEAD `20b5a460`; depois = worktree), todas em `C:\Users\Igor\AppData\Local\Temp\sarak-previa-167\passo6\`, com prefixo `antes-` e `depois-`:
- `sair-recolhida-{neutro,contrastante}-{claro,escuro}.png`
- `sair-topo-{neutro,contrastante}-{claro,escuro}.png`
- `botao-fantasma-repouso-modo-{claro,escuro}.png`
- `titlecard-{repouso,hover}-{padrao,escuro,claro}.png`

(32 arquivos.) O sair da recolhida em tom contrastante claro aparecia vermelho e apagado (1,1:1) e agora é claro. **Aguardando o ok do dono**; as duas baterias inteiras na raiz só depois dele.

## Resumo da execução (correção 2, bateria final na raiz) — 2026-11-22

Ok do dono nas capturas recebido (passo6). Rodei `npm run cromo-css-real:check` na raiz (build novo + playwright): **a bateria não chega a rodar**. O playwright aborta ao carregar os specs:

`TypeError: Module ".../src/core/Design/catalog/partitions/mode.json" needs an import attribute of "type: json"`

- **Causa (não é desta plan, é da 168):** `browser-tests/paletas-cabem-na-coluna.spec.ts:15` importa `LIBRARY_TEXT_CATALOG` de `src/core/i18n/catalog`, que agora reexporta `src/core/i18n/catalogEntries.decisionTokens.ts` (linhas 1–2: `import { TokenCatalog } from '../Design/catalog'`, que importa os `.json` de `Design/catalog/partitions/`). Esse arquivo foi criado no commit `7febd22b` (plan-168) e não existe em `20b5a460`. O Node nativo não importa JSON sem atributo, e o carregador do Playwright não o injeta.
- **Dono:** plan-168 (`catalogEntries.decisionTokens.ts`). Não editei: é arquivo da 168 e o conserto (o spec não pode importar o catálogo que puxa JSON, ou o catálogo precisa ler o JSON de outro jeito) é decisão dela. Não afrouxei nem toquei o spec.
- Os cinco specs desta plan e os demais que rodei isolados passam; só o carregamento da suíte inteira cai.
- A bateria na raiz (duas rodadas verdes) fica pendente desse conserto da 168.
