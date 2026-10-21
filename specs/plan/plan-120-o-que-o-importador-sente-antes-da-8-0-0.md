---
tipo: "plan"
titulo: "Corrigir antes da 8.0.0 tudo o que o backlog sabe que afeta o importador e o usuario final"
objetivo: "Fazer a 8.0.0 sair sem defeito conhecido que o importador ou o usuario final sinta: campos, props e mensagens que mentem, instalacao e PDF que exigem contorno, tokens que deixam quebrar o foco e as camadas, modal e arte de fundo fora do tema do cliente, painel com texto ilegivel e busca incompleta, e o teste que pode deixar o PR vermelho"
dominio: "Componentes / Instalação / Tema do cliente / Painel"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "importador", "8.0.0", "componentes", "tokens", "painel", "backlog"]
relacionados: ["[[03-superficie-publica]]", "[[13-instalacao-e-atualizacao]]", "[[02-design-engine]]", "[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md + specs/13-instalacao-e-atualizacao.md + arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

A `8.0.0` sai sem defeito conhecido que o importador ou o usuário final sinta: o que está no backlog e afeta quem importa a
lib é corrigido aqui, antes da versão; o que fica no backlog é manutenção interna, sem efeito na tela nem na integração.

# 2. Contexto

**Decisão do dono, 2026-10-20:** corrigir a lib para a versão nova **sem deixar para trás o que afeta o importador e já é
conhecido**. O revisor separou o `00-backlog` pelo efeito prático em quem importa: os 17 itens abaixo afetam o importador, o
usuário final ou o PR do lançamento, e foram **promovidos** para esta plan (saíram do backlog na mesma ação); os 25 que ficaram
não têm efeito no importador. Achados novos dos importadores não entram aqui: vivem no registro da `plan-119`.

**A 8.0.0 é MAJOR:** remover prop pública e apertar a faixa de um token cabem nesta versão, com nota em `docs/migracoes.md`
(`## 8.0.0`).

**Decisões do revisor sob veto do dono (2026-10-20):**
- **Worker do PDF (item 18):** `workerSrc` passa a ser **obrigatório** no `SarakPDFViewer`, documentado com a linha que o
  importador escreve no bundler dele. Preterida: copiar o worker para o `dist/` no build (funciona sem configurar, mas pode
  divergir da versão de `pdfjs-dist` que o importador instalou, e a peer é `>=4`).
- **Props inertes (item 25):** **remover** do tipo público (é MAJOR); nota de migração.
- **Duas taxonomias do painel (item 8):** o Command Center passa a **ler os mesmos pilares** da tela principal
  (`design-pillars.json`), sem remover a tela.
- **Modal no tema (item 45):** sem token novo — o `SarakModal` usa **a borda e a sombra do cartão do tema** (os tokens de
  borda e de sombra do cartão já existem e já são declarados pelos 19 temas). Token estético novo obrigaria a declarar valor nos
  19 temas, e o modal é uma superfície da mesma família do cartão.
- **Arte de fundo fixa (item 46):** **token estético novo** (fixar ou rolar a arte de fundo), com leitor, paridade, metadados
  (`kind`, `modeDependent`, `usage`) e padrão igual ao valor do `sarak-sovereign`; **declarado nos 19 temas** (a trava
  `theme-completeness:check` cobra todo estético) — rola em todos, salvo onde a direção de arte pedir a arte fixa (registrar qual
  e por quê).

**Ordem com o resto do trabalho:** o lote 2 mexe em `package.json`, que a correção da CI (prompt direto em curso: `tsx` e
`@tailwindcss/cli` declarados, lock regenerado no Linux) também mexe — o lote 2 só começa depois que ela for aprovada e
commitada. Lock regenerado nesta plan é **gerado no Linux (WSL) com npm ≥ 11.10.1**, nunca no Windows com o npm 11.6.1 (o
defeito do npm/cli #8805 omite entradas que o `npm ci` da CI exige).

# 3. Escopo

## 3.1 Dentro

**Lote 1 — componentes:**
- **14** `src/components/atomic/Inputs/SarakAutocomplete.tsx` — o `disabled` é tirado das props e não chega ao `SarakInput`
  (`AutocompleteDisplay`): o campo segue editável e focável.
- **17** `src/components/atomic/Templates/SarakCatalogGrid.tsx:148` — a classe `border-[var(--border-color,#334155)]-border`
  (sufixo solto, o Tailwind não a gera).
- **25** props declaradas e nunca lidas: `role`, `density`, `importance` em `src/components/atomic/Templates/SarakStats.tsx:33-35`
  e `src/components/atomic/Templates/SarakForm.tsx:29-31`; `importance` em `src/components/atomic/Templates/SarakTableProps.ts:36`.
- **31** `src/components/atomic/Navigation/SarakShellNav.tsx:46` — o JSDoc cita `dock`, opção que não existe (e o catálogo
  gerado o copia).
- **37** `src/components/atomic/Modals/SarakDrawer.tsx` e `src/components/atomic/Layouts/SarakScrim.tsx` — o véu da gaveta sai
  por `animate`/`shouldRender`, sem a curva `motionEaseIn`.
- **38** `src/components/atomic/Templates/SarakExpandableMatrix.tsx` e
  `src/components/atomic/Templates/components/RecursiveMatrixNode.tsx` — filhos aninhados (8 px) e lista de linhas (4 px) com
  espaçamento fixo, fora de `matrixGap`.
- **53** `src/components/atomic/hooks/useAtomicStyles.ts` — a borda do `SarakButton` no estilo `cyberpunk` lê
  `design?.btnNeonGlowColor` cru, e o `SarakIconButton` lê a variável `--sarak-btn-neon-glow-color`: um só caminho, o da
  variável (vale no escopo embarcado).

**Lote 2 — instalação e mídia:**
- **9** `package.json` — `@tanstack/react-virtual` em `peerDependenciesMeta` como **opcional** (só os chunks sob demanda das duas
  grades o importam), e `package-lock.json` regenerado no Linux.
- **18** `src/components/atomic/Media/SarakPDFViewer/usePdfDocument.ts:22` e o tipo do `SarakPDFViewer` — `workerSrc`
  obrigatório; sem ele, mensagem clara no componente (nunca tela quebrada) e aviso único no console.

**Lote 3 — tema do cliente:**
- **39** faixas dos tokens funcionais: `topbarCollapsedHeight` (`src/core/Design/schema/navigation.ts:227`, hoje 24–56, abaixo do
  alvo de toque de 44), `focusRingWidth` (`src/core/Design/schema/engineering.ts:12`, aceita 0: o anel de foco some),
  `zIndexSidebar` e `zIndexModal` (`src/core/Design/schema/layers.ts:27,40`, faixas que se tocam). Partições e tipos
  acompanham.
- **40** `src/styles/_elements.css:125` (e o `body` de `src/styles/_base.css`) — a transição de `background-color` do `body` faz o
  fundo sair de transparente na hidratação.
- **45** `src/components/atomic/Modals/SarakModal.tsx` — borda e sombra do modal pelos tokens do cartão do tema.
- **46** `src/core/Design/components/SarakBackgroundRenderer.tsx` (`isFixed`) e o schema de mídia/atmosfera — o token novo, com
  partição, mapeamento, tipos gerados, leitor, teste e os 19 temas em `src/core/Design/presets/themes/`.

**Lote 4 — painel e CI:**
- **7** `src/core/Design/catalog/partitions/components_base.json` — 26 entradas sem `name` nem `tags` (de `tableZebraStriping` a
  `rangeActiveColor`).
- **8** `src/features/DesignEngine/Panels/hooks/useSovereignSearch.ts:6-13` (`SOVEREIGN_PILLARS`) passa a ler
  `src/features/DesignEngine/config/design-pillars.json`.
- **28** `src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx:82-84` — título e estado vazio da busca em 8 px
  (`--sarak-type-scale-tiny`), abaixo do piso de 12 px.
- **30** `gates/scripts/contrato/__tests__/check-container-query-literal.test.mjs` — o caso "repositório real" com timeout
  explícito, como os outros testes que varrem o repositório.
- **Os testes de navegador intermitentes** (promovidos pelo dono em 2026-10-20: a CI roda a bateria inteira, e um caso que falha
  por acaso deixa o PR vermelho sem defeito real):
  - **15** `browser-tests/cromo-css-real.spec.ts`, caso "isSplitViewEnabled responde à largura da região…": a comparação estrita
    de borda falhou 1 vez em 6 (o `bottom` do primeiro painel 2 px abaixo do `top` do segundo, 2813,02 × 2811,02), sensível a
    arredondamento de subpixel;
  - **36** `browser-tests/tema-sob-demanda.spec.ts:86` ("o fallback fica na tela até o tema chegar…": exige ao menos um quadro só
    com o fallback, que não existe quando o tema chega rápido — falhou 3 de 4 vezes isolado em 2026-10-20) e
    `browser-tests/gantt-altura-e-contraste.spec.ts` ("o harness liga mesmo o tema claro", falhou sob a bateria completa);
  - **42** `browser-tests/arsenal-lote5.spec.ts:123` (a curva `motionEaseIn` na saída do modal, amostrada quadro a quadro com
    `requestAnimationFrame`, meta de 250 ms; falha sob carga de CPU).
  E as fixtures que esses casos usam em `browser-tests/fixtures/`, se a medição determinística pedir.

**Em todo lote:** os testes de cada correção, os casos de navegador que a mudança pedir (no harness existente), a nota em
`docs/migracoes.md` (`## 8.0.0`) para o que muda para o importador, e os gerados (`npm run token-types`, `npm run guide`,
`npm run dev-kit`, por último).

## 3.2 Fora
- Os 25 itens que ficam no `00-backlog` e qualquer achado que não esteja na §3.1.
- Specs fixas (a síntese é do revisor). Versão e tag.
- Token novo além do item 46; mudança de leitor além dos itens desta plan.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/03-superficie-publica.md` (§6.3, §6.7, §6.9, §6.11) | contrato dos componentes, modal, campos e erro de campo |
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` (§2.3) | peers obrigatórias × opcionais |
| Spec fixa | `arquitetura/02-design-engine.md` (§10, §10.9, §10.14, §10.15) | o que cada token desenha, reserva = padrão, escada de camadas, estético × funcional |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` (§2.3) | metadados do token e paridade (item 46) |
| Spec fixa | `specs/09-temas-e-presets.md` (§5.3) | o tema embarcado declara todo estético (item 46) |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` (§3) | rótulos ≥ 12 px, pilares |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` (§2.4, §3.6) | foco, alvo de toque, textos pelo i18n |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R31, R40-R44) | contraste, leitor, cascata, variável, cor fixa, painel |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-novo-componente` (item 46: token novo e paridade) · `ui-refatorar-componente` (itens 25 e 39) · `ui-criar-tema` (item 46 nos 19 temas) | escrita, testes, token, assinatura, tema |
| Código | os arquivos da §3.1 | ler antes de editar |
| Doc | `docs/migracoes.md` (`## 8.0.0`) | onde a nota de cada mudança visível entra |

# 5. Instruções de execução

**Um lote por vez**, na ordem 1 → 4; cada lote termina com o resumo num bloco novo da §9 e status 🟠, e o próximo só começa depois
do veredito. O executor roda só o teste do que escreveu; a verificação no nível do diff é do revisor. Em todo lote: nota em
`docs/migracoes.md` para o que o importador vê mudar, e os gerados por último.

**Lote 1 — componentes.**
1.1. **14** o `SarakAutocomplete` com `disabled` entrega o atributo ao campo: não edita, não abre a lista, não recebe foco por
clique; teste por esses três.
1.2. **25** retirar `role`, `density` e `importance` dos tipos e dos componentes que não os leem; nota MAJOR com o "de/para"
("não havia efeito; remova a prop").
1.3. **17, 31, 37, 38, 53** a classe correta da borda; o JSDoc sem `dock` (o catálogo regenerado deixa de citá-lo); o véu da
gaveta saindo pela curva e duração do token, como o modal; todo espaçamento da matriz pelo `matrixGap`; a borda `cyberpunk` do
`SarakButton` pela variável. Teste de cada um; o 37 e o 38 com caso de navegador se o `jsdom` não enxergar.

**Lote 2 — instalação e mídia.** (Só depois da correção da CI aprovada e commitada.)
2.1. **9** `@tanstack/react-virtual` opcional em `peerDependenciesMeta`; o `package-lock.json` regenerado no Linux (WSL), npm
≥ 11.10.1, com o diff provando que nenhuma versão mudou; `npm run package:check` e o `install-sha` da CI continuam verdes.
2.2. **18** `workerSrc` obrigatório no tipo do `SarakPDFViewer`; sem ele, o componente mostra a mensagem de erro dele (i18n) e um
aviso único no console nomeando a prop; o JSDoc e o guia mostram a linha do bundler (Vite e Webpack); nota MAJOR.

**Lote 3 — tema do cliente.**
3.1. **39** faixas novas: `topbarCollapsedHeight` com mínimo no alvo de toque (44); `focusRingWidth` com mínimo 1; `zIndexSidebar`
e `zIndexModal` em faixas que não se cruzam (a lateral sempre abaixo do modal, pela escada da `02` §10.14). Valor salvo fora da
faixa nova é ajustado pela validação, com aviso; nota MAJOR com as faixas antigas e novas. `panel-contract:check` e
`tokenContractParity` verdes.
3.2. **40** o fundo do `body` não faz transição na primeira pintura: a transição vale para a troca de tema, não para a entrada.
Caso de navegador: o `background-color` computado do `body` já é o do tema no primeiro quadro depois da hidratação.
3.3. **45** o `SarakModal` desenha a borda (largura, estilo, cor) e a sombra dos tokens do cartão do tema; caso de navegador com
dois temas de borda e sombra diferentes.
3.4. **46** o token de fixar a arte de fundo: schema (com `kind: aesthetic`, `modeDependent`, `usage`), partição, mapeamento,
tipos gerados (`npm run token-types`), leitor no `SarakBackgroundRenderer`, teste e caso de navegador; padrão = o valor do
`sarak-sovereign`; declarado nos 19 temas (e na `contraparte` só se carregar modo). `theme-completeness:check`,
`token-docs:check`, `token-reader:check` e a paridade verdes.

**Lote 4 — painel e CI.**
4.1. **7** `name` e `tags` nas 26 entradas, tirados do schema (não inventados); a busca do painel encontra cada uma pelo nome.
4.2. **8** o Command Center lê os pilares de `design-pillars.json`; nenhum nome de pilar diferente entre as duas telas.
4.3. **28** os textos da busca do painel no piso de 12 px.
4.4. **30** timeout explícito no caso "repositório real" de `check-container-query-literal.test.mjs`, no valor que os outros
testes que varrem o repositório usam.
4.5. **15, 36, 42** cada caso intermitente passa a medir de forma **determinística**, provando a mesma coisa que prova hoje — nunca
afrouxando a afirmação para ela passar:
- antes de mudar, **medir a taxa de falha** de cada um contra o `dist/` (`npm run build`, depois o caso isolado 10 vezes; cole a
  contagem);
- **36** controlar o tempo do carregamento do tema na própria cena (por exemplo, segurar o `import()` do tema até o caso liberar),
  para que o quadro só com o fallback exista por construção; o caso do Gantt, achar por que o tema claro às vezes não liga sob
  carga e esperar pelo estado, não por tempo;
- **42** pausar a animação de saída pela Web Animations API e ler a opacidade em pontos fixos da curva, em vez de amostrar quadros;
- **15** comparar as bordas com tolerância de subpixel declarada (no máximo 1 px de arredondamento, com o motivo no caso), sem
  aceitar sobreposição real;
- depois, cada caso **10 de 10** isolado e a bateria do navegador inteira **duas vezes seguidas** sem falha (cole as saídas). Um
  caso que não ficar determinístico sem afrouxar a prova é relatado, não contornado.

# 6. Critérios de aceite

- [ ] Os 17 itens corrigidos, cada um com teste (e caso de navegador onde o `jsdom` não enxerga).
- [ ] `workerSrc` obrigatório e documentado; `@tanstack/react-virtual` opcional; lock gerado no Linux sem versão mudada.
- [ ] Faixas novas dos tokens funcionais, com o valor salvo fora da faixa ajustado e avisado.
- [ ] Modal no tema pelos tokens do cartão; arte de fundo fixável pelo token novo, declarado nos 19 temas.
- [ ] Notas MAJOR em `docs/migracoes.md` para as props removidas, o `workerSrc`, as faixas e o token novo.
- [ ] Os casos intermitentes (15, 36, 42) determinísticos: 10 de 10 isolados e a bateria inteira duas vezes seguidas sem falha.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1; bateria do navegador; `npm ci` e `gates:full` verdes na CI.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — cada correção é comportamento de componente ou de token, coberto por teste e por caso de navegador.

- Lote 1: `verify --tier=quick` e o vitest de `src/components/atomic`; o catálogo sem `dock`.
- Lote 2: `npm ci` e `gates:full` no Linux (ou na CI, depois do push do dono); o diff do lock; o `SarakPDFViewer` sem `workerSrc`.
- Lote 3: `verify --tier=quick` e `--tier=themes`; `build` e os casos de navegador do foco, do fundo na hidratação, do modal e da
  arte de fundo; a completude dos 19 temas.
- Lote 4: `verify --tier=quick` e o vitest de `src/features/DesignEngine`; os casos 15, 36 e 42 isolados, 10 vezes cada, contra
  um `dist/` novo, e a bateria inteira do navegador.
- Fechamento: `verify --tier=full` e a bateria inteira do navegador.
- `git diff --stat` → só a §3.1 do lote.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md + specs/13-instalacao-e-atualizacao.md + arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md`

- **`03`:** `workerSrc` obrigatório no `SarakPDFViewer`; o modal com a borda e a sombra do cartão; o `disabled` do autocomplete.
- **`13` §2.3:** `@tanstack/react-virtual` entre as peers opcionais.
- **`02` §10:** as faixas dos tokens funcionais e o porquê de cada mínimo; o fundo sem transição na entrada; a arte de fundo fixa
  pelo token novo.
- **`09`:** o token novo na lista do que o tema declara.
- **`06` §3:** uma taxonomia de pilares para as duas telas.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Rodada 1 — Lote 1 (2026-10-20)

**Escopo executado:** itens 14, 17, 25, 31, 37, 38 e 53; passos 1.1 a 1.3. Os lotes 2, 3 e 4 permanecem pendentes.

**Resultado:** concluído para revisão.

### Alterações

- **14:** `SarakAutocomplete` encaminha `disabled` ao `SarakInput`; testes cobrem edição, abertura da lista e foco por clique.
- **25:** removidas as props sem consumidor (`role`, `density`, `importance` de `SarakStats` e `SarakForm`; `importance` de `SarakTableProps`); testes de tipo e nota MAJOR com de/para em `docs/migracoes.md`.
- **17:** corrigidos os sufixos de borda inválidos no cabeçalho e no estado vazio do `SarakCatalogGrid`, com teste.
- **31:** JSDoc do `SarakShellNav` não cita mais `dock`/`glass`; o catálogo foi regenerado e o teste de valor desconhecido usa `unknown`.
- **37:** o scrim do `SarakDrawer` usa `motionDurationFast` e `motionEaseIn`; caso de navegador mede duração e curva.
- **38:** os espaços entre linhas e filhos de `SarakExpandableMatrix`/`RecursiveMatrixNode` consomem `matrixGap`; testes cobrem os layouts alterados.
- **53:** o brilho cyberpunk do botão usa `--sarak-btn-neon-glow-color`, em paridade com o `SarakIconButton`; testes cobrem a variável.
- Acrescentada a migração 8.0.0. Regenerados catálogo, tipos de tokens, guia e kit de desenvolvimento.

**Arquivos de implementação:** `src/components/atomic/Inputs/SarakAutocomplete.tsx`; `src/components/atomic/Templates/SarakStats.tsx`, `SarakForm.tsx`, `SarakTableProps.ts`, `SarakCatalogGrid.tsx`, `SarakExpandableMatrix.tsx` e `components/RecursiveMatrixNode.tsx`; `src/components/atomic/Navigation/SarakShellNav.tsx`; `src/components/atomic/Modals/SarakDrawer.tsx`; `src/components/atomic/Layouts/SarakScrim.tsx`; `src/components/atomic/hooks/useAtomicStyles.ts`.

**Testes e artefatos:** testes unitários nos arquivos `__tests__` correspondentes dos componentes acima; caso P37 em `browser-tests/arsenal-lote5.spec.ts` e `browser-tests/fixtures/harness-entry.tsx`; nota em `docs/migracoes.md`; catálogo em `docs/component-catalog.{json,md}`; saída do guia em `sarak-ui/`.

### Verificações

- `npx.cmd vitest run` nos 10 arquivos unitários do lote — **10 arquivos, 78 testes passaram**.
- Caso P37 no Playwright — **1 passou** usando o Chrome instalado localmente, pois o Chromium empacotado do Playwright não está instalado. O caminho do Chrome foi configurado temporariamente para a execução e revertido; o clique programático no scrim só aciona o fechamento para observar a animação de saída.
- `npm.cmd run verify -- --tier=quick` — **verde**, incluindo TypeScript, baseline, catálogos, tipos, guia, kit e anel 0. A primeira execução encontrou a importação ausente de `describe` no teste novo; a importação foi corrigida e a execução final passou.
- `npm.cmd run catalog`, `npm.cmd run token-types`, `npm.cmd run guide` e `npm.cmd run dev-kit` — **passaram**.
- `git diff --check` nos arquivos do lote — **sem erros**.

### Preservação e observação

- Snapshot de status capturado antes da primeira edição: ` M specs/00-indice.md`; ` M specs/plan/plan-120-o-que-o-importador-sente-antes-da-8-0-0.md`; `?? .claude/settings.local.json`.
- Nenhuma operação de stage, reset ou commit foi feita. Os arquivos da outra tarefa indicados no pedido não foram editados nem formatados.
- Achado fora dos itens deste lote: `SarakCatalogGrid.tsx:54` ainda tem um sufixo inválido na borda do indicador de carregamento. O item 17 da plan aponta a classe do cabeçalho; o spinner não foi alterado.
- Artefatos temporários gerados pelo Playwright foram removidos.
- Após a mudança do status para 🟠, `npm run -s plan-index:check` aponta divergência porque `specs/00-indice.md` ainda informa 🟡. O quick verify verde foi executado antes dessa transição; o índice permanece intocado conforme o pedido e precisa ser sincronizado pela tarefa responsável por ele.

## Resumo da execução — 2026-10-20 — correção do achado 1

**Resultado:** Concluído.

**Estado do worktree ao iniciar**
```text
 M browser-tests/arsenal-lote5.spec.ts
 M browser-tests/fixtures/harness-entry.tsx
 M docs/component-catalog.json
 M docs/component-catalog.md
 M docs/migracoes.md
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M sarak-ui/docs/migracoes.md
 M specs/00-indice.md
 M specs/plan/plan-120-o-que-o-importador-sente-antes-da-8-0-0.md
 M src/components/atomic/Buttons/__tests__/SarakButton.test.tsx
 M src/components/atomic/Inputs/SarakAutocomplete.tsx
 M src/components/atomic/Inputs/__tests__/SarakAutocomplete.test.tsx
 M src/components/atomic/Layouts/SarakScrim.tsx
 M src/components/atomic/Modals/SarakDrawer.tsx
 M src/components/atomic/Navigation/SarakShellNav.tsx
 M src/components/atomic/Navigation/__tests__/SarakShellNav.test.tsx
 M src/components/atomic/Templates/SarakCatalogGrid.tsx
 M src/components/atomic/Templates/SarakExpandableMatrix.tsx
 M src/components/atomic/Templates/SarakForm.tsx
 M src/components/atomic/Templates/SarakStats.tsx
 M src/components/atomic/Templates/SarakTableProps.ts
 M src/components/atomic/Templates/__tests__/SarakCatalogGrid.test.tsx
 M src/components/atomic/Templates/__tests__/SarakExpandableMatrix.test.tsx
 M src/components/atomic/Templates/__tests__/SarakForm.test.tsx
 M src/components/atomic/Templates/__tests__/SarakStats.test.tsx
 M src/components/atomic/Templates/__tests__/SarakTableProps.test.ts
 M src/components/atomic/Templates/components/RecursiveMatrixNode.tsx
 M src/components/atomic/Templates/components/__tests__/RecursiveMatrixNode.test.tsx
 M src/components/atomic/hooks/__tests__/useAtomicStyles.test.ts
 M src/components/atomic/hooks/useAtomicStyles.ts
?? .claude/settings.local.json
```

**O que foi feito**
- `SarakCatalogGrid.tsx:54` — substituí o sufixo arbitrário inválido por `border-theme-primary/10`, mantendo a borda superior `border-t-theme-primary`.
- `SarakExpandableCard.tsx:121` e `AuthHero.tsx:37` — removi `-border` após a variável arbitrária de cor; a classe `border` existente define a largura e a variável define a cor.
- Acrescentei uma asserção de classe renderizada para cada um dos três casos nos testes correspondentes.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Templates/SarakCatalogGrid.tsx` | alterado | Classe de cor válida para o anel do spinner. |
| `src/components/atomic/Cards/SarakExpandableCard.tsx` | alterado | Classe de cor da borda do botão de fechar válida. |
| `src/components/atomic/Templates/components/AuthHero.tsx` | alterado | Classe de cor da borda do quadro da marca válida. |
| `src/components/atomic/Templates/__tests__/SarakCatalogGrid.test.tsx` | alterado | Asserção da cor translúcida do spinner. |
| `src/components/atomic/Cards/__tests__/SarakExpandableCard.test.tsx` | alterado | Asserção da variável de borda no botão de fechar expandido. |
| `src/components/atomic/Templates/components/__tests__/AuthHero.test.tsx` | alterado | Asserção da variável de borda no quadro da marca. |
| `specs/plan/plan-120-o-que-o-importador-sente-antes-da-8-0-0.md` | alterado | Este resumo append-only e status Em revisão. |

**Verificações executadas**
- `npx.cmd vitest run src/components/atomic/Templates/__tests__/SarakCatalogGrid.test.tsx src/components/atomic/Cards/__tests__/SarakExpandableCard.test.tsx src/components/atomic/Templates/components/__tests__/AuthHero.test.tsx --reporter=dot` → 3 arquivos, 9 testes passaram.
- `rg -n --pcre2 '(?:border|bg|text|ring|shadow)-\[[^\]]*\]-[A-Za-z]' src` → nenhuma ocorrência (código 1 do `rg`, esperado para zero resultados).
- `npm.cmd run verify -- --tier=quick` → verde: `tsc`, baseline, catálogos, tipos, guia, kit, plan-index e anel 0. Rodado antes da transição deste frontmatter para 🟠.
- `npm.cmd run -s plan-index:check` após a transição para 🟠 → falhou apenas pela divergência com `00-indice`, que continua em 🔵; o índice permanece intocado.
- `git diff --check` nos sete arquivos desta correção → sem erros.

**Critérios de aceite**
- [x] As três ocorrências nomeadas no veredito foram corrigidas e têm teste de classe renderizada.
- [x] A busca do padrão prescrito em `src/` não encontra ocorrências.

**Decisões e suposições**
- `border-theme-primary/10` preserva a intenção indicada por `-primary/10` e acompanha o `border-t-theme-primary` do mesmo spinner.

**Achados fora do escopo (não corrigidos)**
- Nenhum achado adicional foi tratado nesta correção.

**Pendências / riscos**
- O veredito foi preservado. O status da plan passou a 🟠; `specs/00-indice.md` foi mantido intocado conforme a instrução anterior, portanto `plan-index:check` seguirá divergente até a tarefa responsável sincronizá-lo.

---

## Resumo da execução — 2026-10-20 — lote 2

**Resultado:** Concluído com pendências.

**Estado do worktree ao iniciar**
```text
?? .claude/settings.local.json
```

**O que foi feito**
- **2.1:** marquei `@tanstack/react-virtual` como peer opcional em `package.json:136` e regenerei o lock no Linux com npm 11.10.1. A comparação encontrou zero versões ou caminhos de pacote alterados.
- **2.2:** tornei `workerSrc` obrigatório em `SarakPDFViewerProps` (`SarakPDFViewerImpl.tsx:31`); sem URL, o hook publica erro traduzido e não inicia o carregamento (`usePdfDocument.ts:30`), e o componente emite um aviso único nomeando a prop (`SarakPDFViewerImpl.tsx:59`).
- Documentei o MAJOR em `docs/migracoes.md:1163`, acrescentei exemplos Vite/Webpack 5 ao guia e regenerei os catálogos e os kits consumidores.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `package.json` | alterado | `@tanstack/react-virtual` marcado como peer opcional. |
| `package-lock.json` | alterado | Lock Linux/npm 11.10.1 regenerado; versões e caminhos de pacotes preservados. |
| `src/components/atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx` | alterado | `workerSrc` obrigatório, JSDoc de bundlers e aviso único. |
| `src/components/atomic/Media/SarakPDFViewer/usePdfDocument.ts` | alterado | Validação do worker e erro localizado antes de carregar o PDF. |
| `src/components/atomic/Media/SarakPDFViewer/__tests__/SarakPDFViewerImpl.test.tsx` | alterado | Prop incluída nos casos existentes e teste de mensagem/aviso único. |
| `src/components/atomic/Media/SarakPDFViewer/__tests__/usePdfDocument.test.ts` | alterado | Teste para worker ausente e casos existentes atualizados. |
| `src/core/i18n/catalogEntries.part5.ts` | alterado | Mensagem de `workerSrc` em seis idiomas. |
| `docs/migracoes.md` | alterado | Nota MAJOR da mudança pública no PDF viewer. |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | Exemplos de configuração Vite e Webpack 5. |
| `docs/component-catalog.json` | alterado | Catálogo reflete `workerSrc` obrigatório e seu JSDoc. |
| `docs/component-catalog.md` | alterado | Tabela pública reflete `workerSrc` obrigatório. |
| `sarak-ui/catalog.json` | alterado | Catálogo do kit reflete o novo contrato e hash. |
| `sarak-ui/docs/migracoes.md` | alterado | Cópia gerada da nota MAJOR. |
| `sarak-ui/START-HERE.md` | alterado | Carimbo do kit atualizado. |
| `sarak-ui/VERSION` | alterado | Hash do kit atualizado. |
| `specs/plan/plan-120-o-que-o-importador-sente-antes-da-8-0-0.md` | alterado | Este resumo append-only e status 🟠. |

**Verificações executadas**
- Comparação do lock regenerado com o lock de `HEAD` → zero versões alteradas; zero caminhos adicionados ou removidos; `peerDependenciesMeta.@tanstack/react-virtual.optional` = `true`. O diff também remove metadados `libc` de dependências opcionais.
- `npx.cmd vitest run src/components/atomic/Media/SarakPDFViewer/__tests__/SarakPDFViewerImpl.test.tsx src/components/atomic/Media/SarakPDFViewer/__tests__/usePdfDocument.test.ts --pool=forks --maxWorkers=1 --reporter=verbose` → 2 arquivos, 7 testes passaram.
- `npm.cmd --cache .tmp-npm-cache run package:check` → passou; 184 arquivos no tarball. O cache temporário foi removido.
- `npm.cmd run catalog`, `npm.cmd run token-types`, `npm.cmd run guide` e `npm.cmd run dev-kit` → passaram; catálogos e kits regenerados.
- `git diff --check` → sem erros de whitespace.

**Critérios de aceite**
- [x] Peer opcional e lock regenerado em Linux sem mudança de versões/caminhos; `package:check` passou.
- [x] `workerSrc` obrigatório, exemplos para Vite e Webpack 5, erro localizado e aviso único; nota MAJOR adicionada.
- [ ] `install-sha` da CI verde — não verificado nesta execução porque o diff segue sem commit/push; requer execução na CI.

**Decisões e suposições**
- WSL não tinha Node/npm disponíveis; usei o container Linux efêmero `node:22-bookworm-slim` com npm 11.10.1 para cumprir o requisito de geração. Nenhuma instalação persistente foi feita.
- A tentativa com o pool `threads` é incompatível com o `execArgv` de memória configurado no Vitest; a execução final passou com o pool `forks` em um worker.

**Achados fora do escopo (não corrigidos)**
- Nenhum achado adicional foi tratado neste lote.

**Pendências / riscos**
- O `install-sha` e os gates completos do Linux/CI continuam pendentes para a revisão após o push. O diff do lock merece conferência do revisor: além da entrada opcional, npm 11.10.1 removeu metadados `libc`, sem alterar versões nem caminhos de pacotes.

---
## Resumo da execução (correção 2) — 2026-10-20 — lote 2

**Resultado:** os dois achados foram corrigidos; pronto para revisão.

**Achados corrigidos**
- **Achado 1 — lock:** restaurei `package-lock.json` de `HEAD` e regenerei em Linux com Node 22/npm 11.21.1. A comparação reportou `changedPackagePaths: [""]`, zero caminhos adicionados/removidos, zero versões alteradas e `libc` preservado em 10 de 10 entradas; apenas a entrada raiz passou a declarar `@tanstack/react-virtual` opcional.
- **Achado 2 — clean code:** removi o aviso/efeito do `SarakPDFViewerImpl` e o emiti no ramo de `workerSrc` ausente do efeito já existente em `usePdfDocument`. O componente deixou de ter os quatro hooks `useState`/`useEffect` apontados pelo auditor; nenhum limiar foi alterado.

**Arquivos desta correção**
| Arquivo | Mudança |
|---|---|
| `package-lock.json` | Regenerado a partir de `HEAD` com npm 11.21.1; o diff contém somente a entrada raiz. |
| `src/components/atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx` | Removido o efeito dedicado ao aviso de `workerSrc`. |
| `src/components/atomic/Media/SarakPDFViewer/usePdfDocument.ts` | Aviso único movido para o hook que já valida o worker e inicia o carregamento. |
| `specs/plan/plan-120-o-que-o-importador-sente-antes-da-8-0-0.md` | Este registro append-only e status 🟠. |

**Verificações executadas**
- `npm.cmd run audit:baseline -- --with-tsc` → igual ao baseline de 2026-10-12; nenhuma regressão.
- `npm.cmd run verify -- --tier=quick` → verde; TypeScript, `audit:baseline`, `plan-index` e demais gates quick passaram; Anel 0 simulou 191 linhas e encontrou 0 achados. Executado antes da transição do status para 🟠.
- `npx.cmd vitest run src/components/atomic/Media src/core/i18n --pool=forks --maxWorkers=1 --reporter=dot` → 7 arquivos, 25 testes passaram.
- Comparação de `package-lock.json` com `HEAD` → uma entrada alterada (raiz), 0 caminhos adicionados/removidos, 0 versões alteradas, `libc`: 10 → 10.
- `git diff --check` → sem erros de whitespace.

**Pendências / preservação**
- A verificação `install-sha` da CI, já registrada no resumo anterior, permanece pendente após push; ela não faz parte dos dois achados deste veredito. `specs/00-indice.md` e as demais alterações preexistentes foram preservados.

---
## Resumo da execução — 2026-10-20 — lote 3

**Resultado:** passos 3.1–3.4 executados; pronto para revisão.

### Alterações
- **39 — faixas funcionais:** `topbarCollapsedHeight` passou de 24–56 para 44–56; `focusRingWidth`, de 0–6 para 1–6; `zIndexSidebar`, de 10–1000 para 10–790 (passo 10). `zIndexModal` permanece em 1000–5000 (passo 100); mesmo com até 200 níveis derivados, a navegação termina em 990. Valores salvos fora das novas faixas são ajustados e geram aviso com o valor recebido e o valor final.
- **40 — pintura do body:** em modo App, o Provider habilita a transição de fundo após dois quadros; a primeira pintura continua imediata e a limpeza restaura o atributo anterior. O modo embarcado não altera o `body`.
- **45 — modal:** a superfície de `SarakModal` usa largura de borda por lado, `borderStyle`, cor/opacidade e sombra dos tokens do cartão, sem puxar fundo, textura ou padding do cartão.
- **46 — arte global:** entrou `globalBackgroundPosition` (`absolute`/`fixed`, default `absolute`) no schema, partição, mapeamento, tipos e leitor. Os 19 temas declaram o token; `synthwave-retro` usa `fixed`, os demais usam `absolute`. `DesignScope` e Provider passam a respeitar o token no renderer.
- A nota MAJOR em `docs/migracoes.md` registra as faixas antiga e nova, o clamp, a superfície do modal e a posição da arte. Foram regenerados o catálogo, os tipos, o guia e o kit de desenvolvimento.

### Verificações
- `npm.cmd run build` → concluído.
- `npx.cmd vitest run src/core/Provider/hooks/__tests__/useBodyThemeTransition.test.ts src/core/Provider/utils/__tests__/validation.test.ts src/core/Provider/__tests__/SarakUIProvider.test.tsx src/core/Provider/utils/__tests__/tokenContractParity.test.ts src/core/Design/components/__tests__/SarakBackgroundRenderer.test.tsx src/components/atomic/Modals/__tests__/SarakModal.surfaceTokens.test.tsx` → 6 arquivos, 85 testes passaram.
- `npx.cmd playwright test --config=browser-tests/playwright.config.ts lote3-tema-cliente.spec.ts` → 4 casos passaram: anel de foco, modal em dois temas, primeira pintura/troca de tema e posição rolável/fixa da arte.
- `npm.cmd run verify -- --tier=themes` → verde; completude dos 19 temas, testes de tema, boot, baseline, guia/dev-kit e Anel 0 sem achados.
- `npm.cmd run verify -- --tier=quick` → verde; `tsc`, baseline, paridade, leitores, contratos, `plan-index`, guia/dev-kit e Anel 0 sem achados. Ambos foram executados antes da mudança de status para revisão.
- `npm.cmd run catalog`, `token-types`, `guide` e `dev-kit` → concluídos; `git diff --check` → sem erros de whitespace.

### Preservação
- `specs/00-indice.md` e as alterações dos lotes anteriores foram preservados. Os artefatos temporários de Playwright foram removidos; os arquivos compilados de `dist/` e os timestamps de build foram restaurados após a verificação. `.claude/settings.local.json`, já presente antes desta execução, foi mantido.

## Resumo da execução — 2026-10-20 — correção do achado 1 (lote 3)

**Resultado:** os dois snapshots passaram a refletir o atributo e a variável CSS emitidos por `globalBackgroundPosition`; achado corrigido e pronto para revisão.

### Arquivos alterados
- `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap`
- `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetCard.test.tsx.snap`
- Esta plan, com o registro da correção e a transição de status.

### Verificações
- Comparação dos snapshots com `HEAD`, removendo do snapshot atualizado as linhas de `data-sx-global-background-position` (`absolute`/`fixed`) e `--sarak-global-background-position` → ambos ficaram idênticos ao original; as mudanças se limitam a esse token.
- `npx.cmd vitest run src/features/DesignEngine --reporter=dot` → **89 arquivos e 449 testes passaram** (código de saída 0).
- `git diff --check` nos dois snapshots e nesta plan → sem erros de whitespace.

**Preservação:** nenhum arquivo de implementação foi alterado nesta correção; `specs/00-indice.md` e as demais alterações preexistentes foram preservados.

---
# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-20 — lote 1 — 🔴 Reprovado (1 achado)

**O que está certo (conferido no diff):** 14 — o `SarakAutocomplete` repassa `disabled` ao campo (`AutocompleteDisplay` recebe
`{ ...inputProps, disabled }`), com teste de edição, lista e foco; 25 — `role`, `density` e `importance` saíram de `SarakStats`,
`SarakForm` e `SarakTableProps`, com nota MAJOR e "de/para"; 31 — o JSDoc do `SarakShellNav` sem `dock`, catálogo regenerado; 37 —
o véu da gaveta sai pela curva `motionEaseIn` na duração de `motionDurationFast` (`SarakDrawer.tsx`, `SarakScrim.tsx`), com caso
de navegador; 38 — os espaçamentos da matriz pelo `matrixGap`; 53 — a borda `cyberpunk` do `SarakButton` pela variável
`--sarak-btn-neon-glow-color`, o mesmo caminho do `SarakIconButton`. **Medido por mim:** `npm run verify -- --tier=quick` verde
(`tsc`, baseline, Anel 1, R36, Anel 0, kits) salvo o `plan-index:check`, que é do revisor (sincronizado agora); `npx vitest run
src/components/atomic` — **212 arquivos, 1.199/1.199**.

**Achado 1 — o item 17 ficou pela metade: o mesmo defeito segue em três lugares.** A classe com sufixo solto depois do valor
arbitrário (o Tailwind não a gera, e a borda fica por conta do acaso) foi corrigida no cabeçalho e no estado vazio do
`SarakCatalogGrid`, mas continua em:
- `src/components/atomic/Templates/SarakCatalogGrid.tsx:54` — `border-[var(--border-color,…)]-primary/10` (o anel do indicador de
  carregamento; o próprio relato o apontou);
- `src/components/atomic/Cards/SarakExpandableCard.tsx:121` — `border-[var(--border-color,…)]-b…`;
- `src/components/atomic/Templates/components/AuthHero.tsx:37` — `border-[var(--border-color,…)]-b…`.
O item 17 é esse defeito, não uma linha: os três entram no escopo desta correção (decisão do revisor). **Correção:** a classe
que o desenho pretende em cada um (por exemplo, o lado da borda como classe própria e a cor pela variável), com teste que fixa a
classe gerada; e a busca do padrão `(border|bg|text|ring|shadow)-[var(…)]-<letra>` em `src/` sem nenhuma ocorrência no fim
(cole a saída).

**Status: 🔵 Em correção** (só o achado 1). O caso de navegador do item 37 roda pelo revisor contra o `dist/` na aprovação.

## Veredito — 2026-10-20 — correção 1 (lote 1) — 🟢 Aprovado; lote 1 fechado

**Achado fechado:** as três classes com sufixo solto foram para a forma válida — `SarakCatalogGrid.tsx:54`
(`border-theme-primary/10`, o anel do indicador de carregamento), `SarakExpandableCard.tsx:121` e `AuthHero.tsx:37` (a largura pela
classe `border`, a cor pela variável) —, cada uma com asserção da classe renderizada. **Medido por mim:** a busca do padrão
`(border|bg|text|ring|shadow)-[…]-<letra>` em `src/` não acha nenhuma ocorrência; `npm run verify -- --tier=quick` verde; `npx vitest
run src/components/atomic/Templates src/components/atomic/Cards` — **66 arquivos, 241/241** (o resto do lote já tinha passado: 212
arquivos, 1.199 testes em `src/components/atomic`).

**O caso de navegador do item 37** (véu da gaveta pela curva do token) não rodou contra um `dist/` novo nesta máquina: o `build`
precisa do binário `tailwindcss`, que entrou como dependência na correção da CI e ainda não está instalado aqui (o dono roda `npm ci`
antes do lote 2). Ele roda na bateria completa do fechamento desta plan (§7), com os demais.

**Lote 1 fechado (itens 14, 17, 25, 31, 37, 38, 53).** Segue o lote 2.

**Status: 🟡 Em execução (lote 2).**

## Veredito — 2026-10-20 — lote 2 — 🔴 Reprovado (2 achados)

**O que está certo (conferido no diff):** 18 — `workerSrc` obrigatório no tipo do `SarakPDFViewer`
(`SarakPDFViewerImpl.tsx`), sem ele o hook publica o erro traduzido e não tenta carregar (`usePdfDocument.ts`), aviso nomeando a
prop, JSDoc com a linha do Vite e do Webpack 5, a mensagem nos seis idiomas e a nota MAJOR; 9 — `@tanstack/react-virtual` opcional em
`peerDependenciesMeta`. **Medido por mim:** `npx vitest run src/components/atomic/Media src/core/i18n` — 7 arquivos, 25/25.

**Achado 1 — o lock regenerado apaga metadado que o npm usa no Linux.** O lock foi gerado num container com Node 22 e npm 11.10.1,
e o diff **remove o campo `libc` de 10 entradas** (as variantes `gnu`/`musl` dos binários opcionais): o `npm ci` do Linux deixa de
saber qual variante instalar. **Medi:** regenerando com o npm 11.21.1 (o da máquina do dono), a partir do lock do `HEAD` e do
`package.json` deste lote, o lock difere do `HEAD` em **uma** entrada — a raiz, com `@tanstack/react-virtual` opcional — e
**preserva os 10 `libc`**; o do executor difere em 11. **Correção:** regenerar o `package-lock.json` com npm ≥ 11.21 (o do
Windows já serve; ou o WSL com o mesmo npm), partindo do lock do `HEAD`, e provar que o diff é só a entrada raiz (cole a contagem
de entradas diferentes e a de `libc` antes e depois).

**Achado 2 — clean code: violação nova.** `npm run audit:baseline -- --with-tsc` reprova: `auditor_cleancode` 0 → 1 em
`src/components/atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx:41` (4 `useState`/`useEffect` no componente, depois do aviso de
`workerSrc` ausente). Extrair o aviso (ou a lógica de estado) para um hook próprio, sem afrouxar o limiar; rodar
`npm run verify -- --tier=quick` verde, que o relato não rodou.

**Status: 🔵 Em correção** (os dois achados).

## Veredito — 2026-10-20 — correção 2 (lote 2) — 🟢 Aprovado; lote 2 fechado

**Achado 1 fechado:** o `package-lock.json` difere do `HEAD` em **uma** entrada (a raiz, com `@tanstack/react-virtual` opcional) e
mantém o `libc` nas 10 entradas que o têm — medido por mim, comparando com o lock do `HEAD`. **Achado 2 fechado:** o aviso de
`workerSrc` ausente saiu do componente e mora no efeito que já valida o worker em `usePdfDocument.ts`; o `SarakPDFViewerImpl`
voltou ao limite. **Medido por mim:** `npm run verify -- --tier=quick` **verde** (`tsc`, `audit:baseline --with-tsc` sem regressão,
Anel 1, R36, Anel 0, kits); `npx vitest run src/components/atomic/Media` — 4 arquivos, 16/16 (o executor rodou também
`src/core/i18n`: 7 arquivos, 25/25). O `install-sha` da CI fica para o push do dono.

**Lote 2 fechado (itens 9 e 18).** Segue o lote 3.

**Status: 🟠 Em revisão (lote 3).**

## Veredito — 2026-10-20 — lote 3 — 🔴 Reprovado (1 achado)

**O que está certo (conferido no diff):** 39 — `topbarCollapsedHeight` 44–56, `focusRingWidth` 1–6, `zIndexSidebar` 10–790 abaixo de
`zIndexModal` (1000–5000), valor salvo fora da faixa ajustado com aviso (`validationFunctionalRangeWarnings.ts`); 40 — a transição
do fundo do `body` só passa a valer depois da primeira pintura (`useBodyThemeTransition.ts`), e o modo embarcado não toca o `body`;
45 — o `SarakModal` usa a borda (por lado, estilo, cor) e a sombra do cartão do tema; 46 — `globalBackgroundPosition`
(`absolute` | `fixed`, estético, sem modo, com `usage`) no schema, partição, mapeamento, tipos e leitor (`SarakBackgroundRenderer`,
`DesignScope`), declarado nos **19** temas (só o `synthwave-retro` em `fixed`); a nota MAJOR com faixas antigas e novas.
**Medido por mim:** `verify --tier=quick` e `--tier=themes` **verdes**; `npm run build` verde; navegador contra o `dist/` novo:
os 4 casos do lote (`lote3-tema-cliente.spec.ts`), `cromo-css-real`, `arsenal-lote5` (inclui o véu da gaveta do lote 1) — **51 de
52**; vitest de `src/core`, `src/features/DesignEngine` e `Modals` — **187 de 189 arquivos**.

**Achado 1 — dois snapshots não acompanham o token novo.** `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx` e
`src/features/DesignEngine/Canvas/components/__tests__/PresetCard.test.tsx` falham: o rascunho passou a emitir
`data-sx-global-background-position` e a variável correspondente, e os snapshots são de antes. **Correção:** atualizar só esses
dois snapshots (`-u` restrito a eles), conferindo que as únicas linhas novas são as do token `globalBackgroundPosition`; rodar
`npx vitest run src/features/DesignEngine` verde e colar.

**Não é achado deste lote:** a falha de `browser-tests/tema-sob-demanda.spec.ts:86` ("houve um quadro só com o fallback") é a
intermitência do `00-backlog` 36 — falhou 3 de 4 vezes isolado contra o `dist/` novo e passou na quarta; o caso exige ao menos um
quadro com o fallback sozinho, que não existe quando o tema chega rápido, e não mede cor nem fundo (o que o item 40 mudou).

**Status: 🟠 Em revisão** (só o achado 1).

## Veredito — 2026-10-20 — correção 1 (lote 3) — 🟢 Aprovado; lote 3 fechado

**Achado fechado:** os snapshots de `PreviewCanvas` e `PresetCard` foram atualizados só neles. **Medido por mim:** removendo das
linhas alteradas o atributo `data-sx-global-background-position` e a variável `--sarak-global-background-position`, **não sobra
nenhuma diferença** (`PreviewCanvas`: 21 linhas trocadas e 2 novas, todas do token; `PresetCard`: 1); `npx vitest run
src/features/DesignEngine` — **89 arquivos, 449/449**. O resto do lote já tinha passado em `quick`, `themes`, `build` e no navegador.
O relato desta correção deixou o `status` em 🟡 em vez de 🟠 ao entregar; sem efeito, e a plan segue para o lote 4.

**Lote 3 fechado (itens 39, 40, 45, 46).** Segue o lote 4.

**Status: 🟡 Em execução (lote 4).**

## Resumo da execução — 2026-10-20

**Resultado:** Concluído — lote 4, pronto para revisão.

**Estado do worktree ao iniciar**

```text
 M specs/00-backlog.md
 M specs/plan/plan-120-o-que-o-importador-sente-antes-da-8-0-0.md
 M src/core/Design/components/SarakBackgroundRenderer.tsx
 M src/styles/_base.css
?? .claude/settings.local.json
```

**O que foi feito**

- **7:** preenchi `name` com o `label` do schema e `tags` com termos do vocabulário existente nas 48 entradas anteriores do catálogo; não acrescentei tags aos schemas TypeScript. A busca do Command Center agora encontra os 26 nomes.
- **8:** o Command Center deriva ids, títulos, categorias e pilares de `design-pillars.json`, filtra tokens pelas categorias do catálogo e usa o primeiro pilar configurado como estado inicial.
- **28:** o cabeçalho de resultados e o estado vazio da busca usam a escala `caption` com piso de 12 px.
- **30:** o teste já tinha `REPO_SCAN_TIMEOUT_MS = 30_000` explícito nos casos que varrem o repositório; não precisei alterar esse arquivo.
- **15:** o caso de split view calcula sobreposição entre bordas e tolera no máximo 1 CSS px para arredondamento subpixel.
- **36:** o Gantt espera o tema claro pelo estado de cor computada; o teste do fallback segura o import real do tema até observar o quadro sem aplicação e então libera a carga.
- **42:** o teste pausa a animação de saída pela Web Animations API e mede a opacidade em 125, 250 e 375 ms.

### Rastreamento dos 26 nomes e tags

`HEAD` tinha 48 entradas com tags e 50 termos únicos no vocabulário delas. Todos os tags abaixo pertencem a esse vocabulário; a busca foi verificada para cada nome contra o `label` do schema.

| Token | `name` (label do schema) | `tags` e origem de cada tag |
|---|---|---|
| `tableZebraStriping` | `Listras Alternadas (Zebra)` | `table` ← grupo `tables.ts`; `color` e `layout` ← aspecto de listras alternadas no id/label, com termos já existentes. |
| `tableBorderRadius` | `Arredondamento da Tabela` | `table` ← grupo `tables.ts`; `border` ← id; `radius` ← label “Arredondamento”. |
| `inputPadding` | `Espaçamento Interno (Y)` | `input` e `form` ← grupo `inputs.ts`; `padding` e `layout` ← id `inputPadding` e label “Espaçamento Interno”. |
| `inputBorderType` | `Estilo da Borda` | `input` e `form` ← grupo `inputs.ts`; `border` e `style` ← id/label “Borda” e “Estilo”. |
| `inputBackdropBlur` | `Desfoque de Fundo (Blur)` | `input` e `form` ← grupo `inputs.ts`; `backdrop` e `blur` ← id/label. |
| `inputShadow` | `Sombra do Campo (CSS ou "neumorphism")` | `input` e `form` ← grupo `inputs.ts`; `style` ← o label descreve CSS/neumorphism. |
| `inputIconColor` | `Cor dos Ícones` | `input` e `form` ← grupo `inputs.ts`; `icon` e `color` ← label. |
| `inputErrorColor` | `Cor de Erro` | `input` e `form` ← grupo `inputs.ts`; `color` ← label. |
| `iconButtonGlowBlurSm` | `Glow do Icon Button: Desfoque Pequeno` | `button` ← grupo `buttons.ts`; `icon`, `glow`, `blur` e `small` ← id/label. |
| `iconButtonGlowBlurMd` | `Glow do Icon Button: Desfoque Médio` | `button` ← grupo `buttons.ts`; `icon`, `glow`, `blur` e `medium` ← id/label. |
| `iconButtonGlowBlurLg` | `Glow do Icon Button: Desfoque Grande` | `button` ← grupo `buttons.ts`; `icon`, `glow`, `blur` e `large` ← id/label. |
| `iconButtonFrostedShadowOffsetY` | `Sombra Frosted do Icon Button: Offset Y` | `button` ← grupo `buttons.ts`; `icon` e `layout` ← id/label; `glass` ← “Frosted”, termo já usado no catálogo. |
| `iconButtonFrostedShadowBlur` | `Sombra Frosted do Icon Button: Desfoque` | `button` ← grupo `buttons.ts`; `icon` e `blur` ← id/label; `glass` ← “Frosted”, termo já usado no catálogo. |
| `actionGlowShadowOffsetY` | `Sombra de Ação: Offset Y` | `button` ← grupo `buttons.ts`; `action` e `glow` ← id/label; `layout` ← “Offset Y”. |
| `actionGlowShadowBlur` | `Sombra de Ação: Desfoque` | `button` ← grupo `buttons.ts`; `action`, `glow` e `blur` ← id/label. |
| `actionGlowShadowSpread` | `Sombra de Ação: Espalhamento` | `button` ← grupo `buttons.ts`; `action` e `glow` ← id/label; não há tag `spread` no vocabulário existente. |
| `kanbanHeaderPaddingY` | `Kanban: Padding Vertical do Cabeçalho da Coluna` | `table` ← grupo `tables.ts`; `header`, `padding` e `layout` ← id/label. |
| `kanbanHeaderTracking` | `Kanban: Tracking do Cabeçalho da Coluna` | `table` ← grupo `tables.ts`; `header` e `text` ← id/label. |
| `kanbanCardRadius` | `Kanban: Arredondamento do Card` | `table` ← grupo `tables.ts`; `radius` e `layout` ← id/label e geometria do card no Kanban. |
| `toastMinWidth` | `Toast: Largura Mínima` | `overlay` ← grupo `overlays.ts`; `width` ← id/label. |
| `toastMaxWidth` | `Toast: Largura Máxima` | `overlay` ← grupo `overlays.ts`; `width` ← id/label. |
| `toastAccentWidth` | `Toast: Largura da Borda de Destaque` | `overlay` ← grupo `overlays.ts`; `width` ← id; `border` e `color` ← label “Borda de Destaque”. |
| `contextMenuMinWidth` | `Context Menu: Largura Mínima` | `overlay` ← grupo `overlays.ts`; `width` ← id; `layout` ← geometria indicada por “Context Menu”. |
| `multiSelectInputMinWidth` | `Multi-Select: Largura Mínima do Input Interno` | `input` e `form` ← grupo `inputs.ts`; `width` ← id/label. |
| `searchBackdropBlur` | `Search Palette: Desfoque do Backdrop` | `input` ← grupo `inputs.ts`; `overlay` ← “Search Palette”; `backdrop` e `blur` ← id/label. |
| `rangeActiveColor` | `Range Slider: Cor Ativa` | `input` e `form` ← grupo `inputs.ts`; `active` e `color` ← id/label. |

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/catalog/partitions/components_base.json` | alterado | Rótulos do schema e tags existentes nas 26 entradas. |
| `src/features/DesignEngine/Panels/hooks/useSovereignSearch.ts` | alterado | Pilares e categorias passam a vir da configuração compartilhada e do catálogo. |
| `src/features/DesignEngine/Panels/HyperGranularityTab.tsx` | alterado | Estado inicial usa o id `brand` presente na configuração. |
| `src/features/DesignEngine/Panels/hooks/__tests__/useSovereignSearch.test.ts` | alterado | Paridade dos pilares, indicador de rascunho e busca dos 26 nomes. |
| `src/features/DesignEngine/Panels/components/__tests__/PillarSelector.test.tsx` | alterado | Snapshot usa o pilar configurado. |
| `src/features/DesignEngine/Panels/components/__tests__/__snapshots__/PillarSelector.test.tsx.snap` | alterado | Snapshot atualizado para o pilar configurado. |
| `src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx` | alterado | Escala tipográfica mínima de 12 px na busca. |
| `src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx` | alterado | Teste confirma a escala mínima nos dois textos. |
| `browser-tests/arsenal-lote5.spec.ts` | alterado | Opacidade amostrada em tempos fixos com Web Animations API. |
| `browser-tests/cromo-css-real.spec.ts` | alterado | Sobreposição de split view tolera até 1 CSS px. |
| `browser-tests/gantt-altura-e-contraste.spec.ts` | alterado | Espera o estado computado de tema claro com timeout nomeado. |
| `browser-tests/tema-sob-demanda.spec.ts` | alterado | Controla e libera o import do tema na própria cena. |
| `browser-tests/build-harness.mjs` | alterado | Expõe um gate de teste para o import lazy do tema no harness. |
| `specs/plan/plan-120-o-que-o-importador-sente-antes-da-8-0-0.md` | alterado | Status e este resumo append-only do lote 4. |

**Verificações executadas**

- `npm.cmd run catalog:check` → passou.
- `npm.cmd run build` → passou; gerou tipos, bundle e CSS, e os artefatos gerados foram restaurados ao conteúdo anterior do worktree.
- `npx.cmd vitest run src/features/DesignEngine/Panels/hooks/__tests__/useSovereignSearch.test.ts src/features/DesignEngine/Panels/components/__tests__/PillarSelector.test.tsx src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx` → 3 arquivos, 19/19 testes aprovados.
- `npx.cmd vitest run gates/scripts/contrato/__tests__/check-container-query-literal.test.mjs` → 1 arquivo, 15/15 testes aprovados; o timeout de 30 s já existia em `HEAD`.
- Validador AST `padrao-typescript` nos 11 arquivos TS/JS alterados → exit code 0; comparação com `HEAD`: zero novos achados.
- `npm.cmd run verify -- --tier=quick` → passou após as alterações finais; `tsc`, baseline, Anel 1 e demais checks rápidos verdes; Anel 0 simulado: 637 linhas, 0 achados.
- Baseline isolado antes das mudanças, 10 repetições por caso (50 execuções): item 15 passou 10/10; item 36, Gantt passou 10/10 e o fallback falhou 5/10; item 42, modal passou 10/10 e paleta de busca passou 9/10.
- `npx.cmd playwright test --config=browser-tests/playwright.config.ts --grep 'isSplitViewEnabled|fallback fica na tela|harness liga mesmo o tema claro|motionEaseIn muda a opacidade' --repeat-each=10` → 50/50 aprovados (10/10 para cada um dos cinco casos selecionados).
- `npx.cmd playwright test --config=browser-tests/playwright.config.ts` → duas execuções consecutivas, cada uma com 423/423 aprovados (20,5 min e 20,1 min).
- `git diff --check` → sem erros de whitespace.

Uma tentativa focal dentro do sandbox não iniciou os testes porque o executável local do Chromium não estava visível. A mesma repetição foi executada com acesso ao binário local e passou 50/50; as duas baterias completas também passaram com esse acesso.

**Critérios de aceite deste lote**

- [x] 4.1 — os 26 nomes são os labels do schema; cada um é encontrado pela busca; todos os tags vêm do vocabulário anterior de 50 termos.
- [x] 4.2 — as duas telas usam os mesmos ids e títulos definidos em `design-pillars.json`.
- [x] 4.3 — título e estado vazio da busca usam a escala caption com piso de 12 px.
- [x] 4.4 — o caso de repositório real conserva timeout explícito de 30 s; o arquivo de teste passa 15/15.
- [x] 4.5 — os casos foram tornados determinísticos; cinco casos isolados passaram 10/10 cada e a bateria inteira passou duas vezes em sequência.

**Decisões e suposições**

- Apliquei a regra confirmada pelo usuário para o item 7: `name` igual ao `label` do schema; `tags` restritos ao vocabulário existente e derivados do grupo do schema ou de fatos do id/label. Não acrescentei tags ao schema TypeScript.
- Item 30 já estava satisfeito em `HEAD`; preservei o teste sem alterações.

**Achados fora do escopo (não corrigidos)**

- Nenhum identificado nesta execução.

**Pendências / riscos**

- Nenhuma pendência nos itens do lote 4. `npm ci` e `gates:full` na CI permanecem no fechamento geral da plan, fora do recorte executado nesta rodada.

## Veredito — 2026-10-20 — lote 4 e fechamento da plan — 🟢 Aprovado; plan concluída

**Lote 4, conferido no diff:** 7 — as 26 entradas de `components_base.json` com `name` = o `label` do schema e `tags` só do
vocabulário que o catálogo já usava (a tabela da origem de cada tag está no relato), achadas pela busca; 8 — o Command Center deriva
pilares e categorias de `design-pillars.json` (`useSovereignSearch.ts`, `HyperGranularityTab.tsx`); 28 — título e estado vazio da
busca no piso de 12 px; 30 — o teste já tinha timeout explícito de 30 s no `HEAD` (o item do backlog estava defasado); 15, 36, 42 — o
split view compara com tolerância de subpixel declarada (≤ 1 px), o tema sob demanda segura o `import()` na cena até observar o quadro
só com o fallback, o Gantt espera o estado de cor computada, e a saída do modal pausa pela Web Animations API e lê a opacidade em
pontos fixos. O executor mediu antes (o fallback falhava 5 de 10) e depois (50 de 50; a bateria inteira duas vezes, 423/423).

**Fora da plan, descartado:** `src/core/Design/components/SarakBackgroundRenderer.tsx` e `src/styles/_base.css` apareceram modificados
no worktree entre o commit do lote 3 e o início do lote 4, sem plan nem prompt (a regra nova do `_base.css` apagava a textura de página
quando havia arte de fundo); o dono não os alterou e os descartou (`git restore`). A verificação de fechamento abaixo rodou sem eles.

**Fechamento, medido por mim sobre o worktree limpo:** `npm run verify -- --tier=full` **verde** (`tsc`, **suíte completa**, baseline
com `tsc`, Anel 1, R36, Anel 0); `npm run build` verde; **bateria inteira do navegador: 423/423** (17,9 min), com os casos do véu da
gaveta (lote 1), do tema do cliente (lote 3) e os antes intermitentes.

**A plan está concluída:** os 17 itens do backlog que afetavam o importador, mais os três intermitentes (15, 36, 42), corrigidos antes da
8.0.0. A síntese (destino na §8) espera a autorização do dono.

**Status: 🟢 Aprovada.**
