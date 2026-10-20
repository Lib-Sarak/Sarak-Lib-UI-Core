---
tipo: "plan"
titulo: "Corrigir antes da 8.0.0 tudo o que o backlog sabe que afeta o importador e o usuario final"
objetivo: "Fazer a 8.0.0 sair sem defeito conhecido que o importador ou o usuario final sinta: campos, props e mensagens que mentem, instalacao e PDF que exigem contorno, tokens que deixam quebrar o foco e as camadas, modal e arte de fundo fora do tema do cliente, painel com texto ilegivel e busca incompleta, e o teste que pode deixar o PR vermelho"
dominio: "Componentes / Instalação / Tema do cliente / Painel"
status: "🔴 A executar"
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

# 6. Critérios de aceite

- [ ] Os 17 itens corrigidos, cada um com teste (e caso de navegador onde o `jsdom` não enxerga).
- [ ] `workerSrc` obrigatório e documentado; `@tanstack/react-virtual` opcional; lock gerado no Linux sem versão mudada.
- [ ] Faixas novas dos tokens funcionais, com o valor salvo fora da faixa ajustado e avisado.
- [ ] Modal no tema pelos tokens do cartão; arte de fundo fixável pelo token novo, declarado nos 19 temas.
- [ ] Notas MAJOR em `docs/migracoes.md` para as props removidas, o `workerSrc`, as faixas e o token novo.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1; bateria do navegador; `npm ci` e `gates:full` verdes na CI.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — cada correção é comportamento de componente ou de token, coberto por teste e por caso de navegador.

- Lote 1: `verify --tier=quick` e o vitest de `src/components/atomic`; o catálogo sem `dock`.
- Lote 2: `npm ci` e `gates:full` no Linux (ou na CI, depois do push do dono); o diff do lock; o `SarakPDFViewer` sem `workerSrc`.
- Lote 3: `verify --tier=quick` e `--tier=themes`; `build` e os casos de navegador do foco, do fundo na hidratação, do modal e da
  arte de fundo; a completude dos 19 temas.
- Lote 4: `verify --tier=quick` e o vitest de `src/features/DesignEngine`.
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
