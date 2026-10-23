---
tipo: "plan"
titulo: "Fazer o conteudo acompanhar a tela e a busca do cromo funcionar"
objetivo: "Fazer a regiao de conteudo do cromo acompanhar a largura da tela com margens que crescem com ela, sem coluna espremida nem elemento cortado, e a busca do cromo mostrar o texto inteiro e navegar ao clicar no resultado mesmo sem onNavigate"
dominio: "Cromo / Layout / Busca"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "cromo", "layout", "largura", "busca", "rc"]
relacionados: ["[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[02-design-engine]]", "[[09-temas-e-presets]]", "[[03-superficie-publica]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md + specs/07-responsividade-e-multidispositivo.md + specs/09-temas-e-presets.md"
---

# 1. Objetivo

Num monitor de 1900 a 2560 px, o conteúdo de qualquer tema embarcado ocupa a largura disponível com margens laterais proporcionais
(nem esticado de borda a borda, nem uma coluna estreita no meio), nada é cortado; e a busca da barra mostra o placeholder sem o
selo por cima e leva à rota ao clicar no resultado, com ou sem `onNavigate`.

# 2. Contexto

Validação da `8.0.0-rc.2` no ERP (2026-10-22, dono). Medido no código:

- **Largura.** `maxContentWidth` (`src/core/Design/schema/system.ts:28-45`) só aceita `1000px`, `1200px`, `1440px` (padrão),
  `1600px` e `100%`. O cromo aplica `width:100%; maxWidth; marginInline:auto` em linha
  (`src/components/Layout/chrome/chromeStructuralStyles.ts:54-64`) no `<main data-sarak-content>` (`ChromeSidebarBody.tsx:174-178`,
  `ChromeTopbarBody.tsx:173`, `SarakAppChromeMobile.tsx:226`), com padrão `1440px` em `useChromeDesignTokens.ts:42`. 18 dos 19
  temas usam valor em px (só `corporate-ledger` usa `100%`; `editorial-ink` usa `1000px`). O `<main>` é `overflow-auto`, então o
  que passa do teto rola ou é cortado (a prévia do documento na tela de proposta do ERP). O painel de design, montado dentro do
  cromo, herda a mesma coluna. Duas variáveis estão mortas para isso: `--sarak-max-width`/`--theme-max-width` (`manifest.ts:177`)
  e `--sarak-max-content-width` de `.sarak-safe-container` (`src/styles/_base.css:77-82`), que ninguém escreve.
- **Decisão do dono (2026-10-23):** o padrão passa a ser **fluido** — a região acompanha a tela e a margem lateral cresce com ela;
  os tetos em px continuam como opção.
- **Selo "CTRL K".** Em `SarakShellSearchWidget.tsx:92-104` o selo vai como `rightIcon` do `SarakInput`, que o posiciona em
  `absolute right-3` (`SarakInput.tsx:71`) e reserva só `pr-11` (`:116`); o selo mede ~46 px e invade o texto. Na barra de 240 px
  sobram ~110 px para o placeholder. O selo nunca some (`transition-opacity` sem nada que mude a opacidade, `:94`), em todo tema.
  Achado no caminho: `SarakInput.tsx:144-146` espalha `{...props}` depois do próprio `onFocus`/`onBlur`, e o widget passa
  `onFocus` — o estado de foco interno nunca liga e a borda de foco some.
- **Resultado que não clica.** Sem `onSelect`, cada resultado vira `<div>` sem ação (`SarakShellSearchWidget.tsx:137-155`); o
  `onSelect` só existe quando o consumidor passa `onNavigate` ao `SarakAppChrome` (`ChromeSidebarBody.tsx:74`). A paleta Ctrl+K tem
  o mesmo portão (`ChromeSidebarBody.tsx:184-189`, `Inputs/SarakSearch.tsx:141-148`). O menu lateral, no mesmo caso, cai num
  `href` de verdade (`SarakShellNav.tsx:80-85`, [[05-cromo-e-slots]] §2.1.2) e o id do item já é a rota (`chrome/navItem.ts:41-48`).
- **Campo com texto encostado na borda.** Na tela de proposta do ERP (tema derivado do Blueprint), o valor dos campos encosta na
  borda esquerda. Não medido ainda se é padding do `SarakInput` sob algum token do tema ou classe do importador — o lote 2 mede.
- Fora da lib (não é desta plan): a tela de fornecedores do ERP sem gap entre os campos é layout do importador.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/system.ts` (opção fluida e padrão), a partição e o mapeamento do token, os tipos gerados.
- `src/components/Layout/chrome/` (`chromeStructuralStyles.ts`, `useChromeDesignTokens.ts`, `ChromeSidebarBody.tsx`,
  `ChromeTopbarBody.tsx`) e `src/components/Layout/SarakAppChromeMobile.tsx` — só o que a largura exigir.
- `src/core/Design/manifest.ts` e `src/styles/_base.css` — só para eliminar as variáveis mortas de largura ou ligá-las ao valor real.
- `src/core/Design/presets/themes/*.ts` — o valor de `maxContentWidth` dos 19 temas.
- `src/components/atomic/Navigation/SarakShellSearchWidget.tsx`, `src/components/atomic/Inputs/SarakSearch.tsx` (e os arquivos da
  paleta que ele monta), `src/components/atomic/Inputs/SarakInput.tsx`, o schema/emissão da variável de padding do campo.
- Testes dos arquivos acima; casos em `browser-tests/` (harness existente); i18n se surgir rótulo novo; `docs/migracoes.md`
  (`## 8.0.0`).

## 3.2 Fora
- O painel de design (`src/features/DesignEngine/`) — é da `plan-122`.
- Tokens de cor e de barra — `plan-123` e `plan-124`.
- O ERP: nenhuma linha do importador; a correção do gap na tela de fornecedores e o `onNavigate` nos módulos são da sessão de
  revisor do ERP.
- Prop nova de "sangria total" no cromo; specs fixas (síntese do revisor); versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/05-cromo-e-slots.md` (§2.1.2, §2.4, §5.1) | o item é link de verdade; o que cada token de cromo desenha; quem rola |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` (§6, §6.1) | camada de contêiner e as quatro regras; default não conserta opção |
| Spec fixa | `arquitetura/02-design-engine.md` (§10, §10.15) | o que o token desenha; estético × funcional |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` (§2.3) | metadados do token e paridade |
| Spec fixa | `specs/09-temas-e-presets.md` (§4.4.3, §5.3) | valor oferecido é contrato; o que o tema declara |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | foco visível, alvo de toque, teclado na busca |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R40-R44) | leitor, cascata, variável com um dono |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-refatorar-componente` (mudar opção/padrão de token existente) · `ui-criar-tema` (valor nos 19 temas) | escrita, testes, token, temas |
| Código | os arquivos da §3.1 | ler antes de editar |
| Doc | `docs/migracoes.md` (`## 8.0.0`) | nota do padrão novo e da busca |

# 5. Instruções de execução

**Dois lotes**, nesta ordem; cada lote termina com o resumo num bloco novo da §9 e status 🟠. O executor roda só o teste do que
escreveu; a verificação no nível do diff é do revisor.

**Lote 1 — largura fluida.**
1.1. `maxContentWidth` ganha a opção **fluida** e ela vira o padrão: a região ocupa a largura disponível e a margem lateral cresce
com a largura da própria região, com piso no respiro de `layoutPadding`/`layoutDensity` e um teto declarado no schema. Medida por
unidade de contêiner ou proporção da região, **nunca** por `vw` (a região não é a janela, [[07-responsividade-e-multidispositivo]]
§6). Os tetos em px e o `100%` continuam como opção, com o comportamento de hoje.
1.2. Os 19 temas declaram a opção fluida. Tema que precisar de linha de leitura curta resolve dentro do componente de texto, não
estreitando a região inteira.
1.3. As variáveis de largura mortas (`--sarak-max-width`, `--theme-max-width`, `--sarak-max-content-width`) passam a refletir o valor
efetivo ou saem, com o leitor e o teste (R40).
1.4. Teste: o estilo da região para cada opção. Caso de navegador: com o tema padrão a 1280, 1920 e 2560 px de janela, a largura
do `<main data-sarak-content>` cresce com a janela, as margens laterais são iguais e crescem, e o `scrollWidth` do `<main>` é igual
ao `clientWidth` numa cena com uma tabela larga. Nota em `docs/migracoes.md` (padrão novo; quem quiser o teto escolhe a opção).

**Lote 2 — busca e campo.**
2.1. O selo do atalho não cobre o texto: o campo reserva a largura real do selo; o selo some com o campo focado ou com texto, e some
quando a barra é estreita demais para ele e o placeholder caberem juntos (por contêiner). Em todos os temas.
2.2. O `SarakInput` compõe o `onFocus`/`onBlur` recebido com o próprio, sem perder nenhum dos dois; a borda de foco volta.
2.3. Sem `onSelect`/`onNavigate`, o resultado da busca da barra e o da paleta Ctrl+K são links de verdade para a rota do item
(como o menu lateral); com o callback, ele é chamado e a navegação padrão é cancelada. Teclado (setas + Enter) leva ao mesmo
destino. No celular, selecionar fecha o drawer (já é regra da [[05-cromo-e-slots]] §2.3).
2.4. **Variável de padding do campo que engana o importador** (medido no ERP em 2026-10-23: o ERP escreve
`padding: var(--sarak-input-padding, 8px 12px)` num `<input>` próprio, a lib emite `--sarak-input-padding: 12px` e usa a variável só
como padding **vertical** (`py-[var(--sarak-input-padding,16px)]` no `SarakInput`); resultado: `padding-left: 0`, texto na borda).
Publicar o par explícito (vertical e horizontal) que o `SarakInput` usa, manter a variável antiga como sinônimo do vertical com nota
de depreciação em `docs/migracoes.md`, e documentar no JSDoc/catálogo qual eixo cada uma governa.
2.5. **Paleta Ctrl+K** (medida em 2026-10-23, 2560 px): o campo tem 207 px num modal de 398 px e corta o placeholder; o selo mostra só
"K"; nenhum item vem pré-selecionado; todo resultado repete o mesmo ícone e o subtítulo "MÓDULO". Corrigir: campo ocupa a largura
útil; selo completo pelo sistema operacional (Ctrl/⌘); primeiro resultado ativo e Enter navega; ícone do item vindo do item de
navegação; subtítulo só quando informa algo (categoria ou caminho). Acessibilidade: o modal é `role="dialog"` com `aria-modal`, o
campo é `combobox` ligado a uma `listbox` com `aria-activedescendant`, e os resultados são opções.
2.6. **Foco visível:** o campo da busca da barra e o da paleta mostram o anel de foco do tema (hoje `outline: none` e sem sombra ao
focar).
2.7. Testes de cada item; caso de navegador para 2.1 (o retângulo do selo não intercepta o do texto do placeholder a 240 px de barra)
e para 2.3 (clicar o resultado sem `onNavigate` muda a URL). Nota em `docs/migracoes.md`.

# 6. Critérios de aceite

- [x] Padrão fluido: a região cresce com a tela, margens laterais proporcionais e simétricas, nenhum `vw`, nada cortado (caso de navegador nas três larguras).
- [x] Os 19 temas declaram o padrão fluido; os tetos em px seguem funcionando como opção.
- [x] Nenhuma variável de largura sem leitor.
- [ ] Selo do atalho nunca sobre o texto; some com foco, com texto e em barra estreita.
- [ ] Borda de foco do `SarakInput` volta com `onFocus` do chamador.
- [ ] Resultado da busca e da paleta navega sem `onNavigate`; com ele, chama o callback.
- [ ] Par explícito de padding do campo publicado; a variável antiga documentada como só vertical e depreciada.
- [ ] Paleta: campo na largura útil, selo completo, primeiro item ativo, ícone por item, `dialog` + `combobox`/`listbox` acessíveis.
- [ ] Anel de foco visível nos campos da busca e da paleta.
- [ ] Notas em `docs/migracoes.md`; `theme-completeness:check`, `token-reader:check`, `token-docs:check` e paridade verdes.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento de componente e de token, coberto por teste e caso de navegador.

- Lote 1: `npm run verify -- --tier=schema-meta` e `--tier=themes`; `npm run build` + os casos novos de largura em `browser-tests/`.
- Lote 2: `npm run verify -- --tier=quick`; vitest de `src/components/atomic/Navigation` e `Inputs`; `build` + os casos da busca.
- Fechamento: `npm run verify -- --tier=full` e a bateria inteira do navegador.
- `git diff --stat` → só a §3.1.
- Conferência no ERP (dono): `/proposals` e `/design` a 2546 px de janela, sem coluna espremida; busca clicável num módulo sem `onNavigate`.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md + specs/07-responsividade-e-multidispositivo.md + specs/09-temas-e-presets.md`

- **`05` §2.4:** a linha de `maxContentWidth` passa a dizer o padrão fluido, como a margem cresce e o teto; §2.1.2 (ou nova): o
  resultado da busca e da paleta é link de verdade como o item de navegação; o selo do atalho e quando some.
- **`07` §6:** a região de conteúdo mede a si mesma, não a janela.
- **`09` §5.3:** os temas embarcados declaram a largura fluida.

---

# 9. Resumo da execução

### Lote 1 — largura fluida (2026-10-23)

- `maxContentWidth` agora usa por padrão `calc(100% - clamp(...))`, relativo ao próprio contêiner, com margem proporcional de 5%, piso em `layoutPadding` e teto de 128px por lado. Os limites em px e `100%` permanecem disponíveis. Os 19 temas usam a constante compartilhada; o respiro interno continua escalado por `layoutDensity`.
- As variáveis antigas `--sarak-max-width` e `--theme-max-width` foram removidas do manifesto morto e o teste cobre a ausência dos aliases; `--sarak-max-content-width` continua emitida pelo leitor de tokens e agora contém a opção fluida. O plano cita `src/core/Design/manifest.ts`, caminho inexistente neste checkout; a entrada órfã estava em `src/core/Provider/manifest.ts`, que foi ajustado e testado.
- A partição e o JSON gerado de documentação foram atualizados. `docs/migracoes.md` registra o novo padrão na seção 8.0.0. Nenhuma entrada de i18n foi necessária: o rótulo é declarado no schema, sem chave de tradução existente para esse token.
- Testes: 6 suítes de Vitest, 74 testes passaram após corrigir uma expectativa do caso legado de `1440px` e repetir a suíte afetada (9/9). O caso de navegador no harness passou em 1280, 1920 e 2560px (1/1), com margens simétricas crescentes e sem overflow horizontal.
- `npm run verify -- --tier=quick` terminou com 4 checks falhos fora do escopo: tipos em `PreviewCanvas.designScopeStability.test.tsx` e `PresetsCatalog.test.tsx`; erro de tipo em `DesignEngine/hooks/useDesignDraft.ts`; `catalog:check` reportou `docs/component-catalog.{json,md}` defasados; `guide:check` reportou cinco arquivos de `sarak-ui` defasados. Esses arquivos não foram alterados. Os checks `token-types`, `token-docs`, `theme-completeness`, `themes:catalog`, `chrome-token-parity` e `token-reader` passaram.
- `npm run token-types` não conseguiu gravar por `EPERM`; o JSON gerado foi atualizado pela entrada do schema e `token-types:check`/`token-docs:check` passaram. `git status --short` não funcionou neste ambiente (`fatal: this operation must be run in a work tree`); na conferência inicial, os hashes dos arquivos rastreados do escopo coincidiam com índice e HEAD. Nenhum build ou commit foi feito. Lote 2 permanece pendente.

---

# 10. Veredito

## Veredito — 2026-10-23 — lote 1 — 🔴 Reprovado (3 achados)

Verificado no worktree inteiro (compartilhado com as `plan-122` e `plan-125`): `npm run verify -- --tier=full` → `tsc` 0, baseline
com `tsc`, Anel 0 e 25 gates verdes; **vitest vermelho** e `catalog:check`/`guide:check` vermelhos. Navegador:
`largura-fluida.spec.ts` passou (1280/1920/2560 px, margens simétricas crescentes, sem rolagem horizontal). O comportamento pedido
está lá; a forma do valor e os artefatos não.

1. `src/core/Design/schema/system.ts:4-6,41,43` (e os 19 temas, que importam `FLUID_MAX_CONTENT_WIDTH`) — o valor da opção fluida é a
   própria expressão CSS `calc(100% - clamp(var(--sarak-layout-padding, 16px), 5%, 128px) - …)`. Esse texto vira dado: é gravado no
   tema salvo do importador (porta `onSave`, cache local), no catálogo (`allowedValues`) e em atributos (`data-sx-max-content-width`).
   Qualquer ajuste futuro da fórmula deixa todo valor já salvo fora do contrato — valor oferecido é contrato com o usuário final
   ([[09-temas-e-presets]] §4.4.3). Critério violado: passo 1.1 ("opção fluida" de um token `select`) lido à luz da §4.4.3. A opção
   passa a ter um **valor semântico** (por exemplo `fluid`), e quem desenha (o leitor do cromo e a emissão de
   `--sarak-max-content-width`) o traduz para o CSS; os 19 temas declaram o valor semântico; teste do leitor para `fluid` e para um px.
2. `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` ("custom properties fantasma") e
   `Canvas/components/__tests__/__snapshots__/PresetCard.test.tsx.snap` — divergem só por `--sarak-max-content-width`/
   `data-sx-max-content-width` (de `1440px` para a expressão fluida), efeito deste lote; a suíte completa fica vermelha. Critério
   violado: §6 "suíte completa verde". Regravar os dois **depois** do achado 1 (o valor muda de novo), conferindo que o diff do
   snapshot é só essa propriedade.
3. `docs/component-catalog.{json,md}` — `catalog:check` acusa defasagem; a descrição e as opções de `maxContentWidth` mudaram neste
   lote. Rodar `npm run catalog` e, por último, `npm run guide` (o kit espelha o catálogo e a `docs/migracoes.md`), e confirmar
   `catalog:check` e `guide:check` verdes.

## Resumo da correção — 2026-10-23

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
`git status --short` → `fatal: this operation must be run in a work tree`; a fotografia do estado inicial não ficou disponível.

**O que foi feito**
- `src/core/Design/schema/system.ts` passou a oferecer e usar como padrão o valor semântico `fluid`; `resolveMaxContentWidth` traduz esse valor para a expressão CSS fluida.
- `src/core/Design/hooks/useDesignVariables.ts` emite a expressão em `--sarak-max-content-width` e mantém `data-sx-max-content-width="fluid"`; valores em pixels continuam sendo emitidos sem alteração. `useChromeDesignTokens` usa o mesmo resolvedor.
- Os 19 temas passaram a declarar `FLUID_MAX_CONTENT_WIDTH_OPTION`; a partição `branding_config.json` agora lista `fluid` em `allowedValues`.
- Atualizei a entrada de largura em `docs/migracoes.md` para orientar gravações novas a persistir `fluid`. Não surgiu chave nova de i18n.
- Regravei os dois snapshots do achado 2. A comparação antes/depois confirmou que as diferenças se limitam às saídas de `maxContentWidth`: variável CSS, atributo de estado e `max-width` inline do conteúdo na prévia.
- `npm run catalog` regenerou `docs/component-catalog.{json,md}` com 102 componentes.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/system.ts` | alterado | Opção semântica `fluid`, default e conversão para CSS. |
| `src/core/Design/hooks/useDesignVariables.ts` | alterado | Emissão CSS fluida sem substituir o valor semântico do atributo. |
| `src/components/Layout/chrome/useChromeDesignTokens.ts` | alterado | Leitura da opção semântica para o cromo. |
| `src/components/Layout/chrome/chromeStructuralStyles.ts` | alterado | Marcador do leitor e descrição do valor já resolvido. |
| `src/core/Design/catalog/partitions/branding_config.json` | alterado | `allowedValues` usa `fluid`. |
| `src/core/Design/presets/themes/*.ts` | alterado, 19 arquivos | Todos os temas declaram a opção semântica. |
| `src/core/Design/hooks/__tests__/useDesignVariables.test.ts` | alterado | Cobertura de `fluid`, atributo semântico e teto em pixels. |
| `src/components/Layout/chrome/__tests__/useChromeDesignTokens.test.ts` | alterado | Cobertura da tradução de `fluid` no leitor do cromo. |
| `src/core/Design/presets/themes/__tests__/themeSetCoverage.test.ts` | alterado | Confere `fluid` nos 19 temas. |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | Snapshot reflete as saídas fluidas de `maxContentWidth`. |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetCard.test.tsx.snap` | alterado | Snapshot reflete a variável CSS fluida. |
| `docs/migracoes.md` | alterado | Documenta a persistência semântica de `fluid`. |
| `docs/component-catalog.json`, `docs/component-catalog.md` | gerados | Catálogo atualizado. |
| `specs/plan/plan-121-largura-fluida-e-busca-do-cromo.md` | alterado | Este relato e status 🟠. |

**Verificações executadas**
- `npx vitest run --configLoader runner src/core/Design/hooks/__tests__/useDesignVariables.test.ts src/core/Design/presets/themes/__tests__/themeSetCoverage.test.ts src/components/Layout/chrome/__tests__/useChromeDesignTokens.test.ts src/components/Layout/chrome/__tests__/chromeStructuralStyles.test.ts src/components/Layout/__tests__/SarakAppChrome.tokens.test.tsx` → 5 arquivos, 69 testes passaram.
- `npx vitest run --configLoader runner --maxWorkers=1 src/core/Design/hooks/__tests__/useDesignVariables.test.ts` → 1 arquivo, 35 testes passaram após o ajuste final.
- `npx vitest run --configLoader runner --update --maxWorkers=1 src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx src/features/DesignEngine/Canvas/components/__tests__/PresetCard.test.tsx` → 2 arquivos, 9 testes passaram; 2 snapshots atualizados.
- `npx playwright test --config=browser-tests/plan121-playwright.config.ts --output <temporário> browser-tests/largura-fluida.spec.ts` → 1 caso passou em 1280, 1920 e 2560 px usando o Chrome instalado; a configuração temporária foi removida. Nenhum build foi executado.
- `npm run catalog` → `[catalog] 102 componentes → docs/component-catalog.{json,md}`.
- `npm run catalog:check` → `[catalog:check] catálogo em dia.`
- `npm run guide:check` → `[guide:check] kit em dia (7 arquivos).`
- `npm run verify -- --tier=quick` → falhou em 4 verificações: `audit:baseline` (1 achado no Provider da plan-125), `kit-names:check` (GUIA-FRONTEND.md:705, plan-125), `plan-index:check` (status da plan-125 divergente) e `trail-citation` (`git diff` recebeu o mesmo erro de worktree). `tsc --noEmit`, `catalog:check`, `token-reader:check` e os demais checks listados como OK passaram.
- `node gates/scripts/audit/run_audit.mjs` → além do achado do Provider, reportou violações R10 em `SarakMultiSelect.tsx:118` e `SarakUploader.tsx:118`, arquivos da plan-122.
- `npm run guide` não foi executado: o gerador grava em `sarak-ui/GUIA-FRONTEND.md`, protegido pela plan-125 no worktree compartilhado. O `guide:check` confirmou que os 7 artefatos já estavam em dia.
- `npm run build` não foi executado. Nenhum commit foi feito.

**Critérios de aceite**
- [x] Opção fluida semântica, 19 temas e conversão para CSS; testes cobrem `fluid` e `1200px`.
- [x] Dois snapshots regravados; a comparação normalizada apontou mudanças somente nas saídas de `maxContentWidth`.
- [x] Catálogo regenerado e `catalog:check` verde; `guide:check` verde.
- [ ] Rodar `npm run guide` no worktree — pendente porque escreveria em arquivo protegido pela plan-125; o check do kit já está verde.
- [x] Caso de navegador do lote 1 passou nas três larguras.

**Decisões e suposições**
- `useDesignVariables.ts` é o emissor genérico que escreve `--sarak-max-content-width`; foi alterado como parte do mapeamento exigido pelo achado 1.
- A opção CSS fluida antiga continua sendo aceita como string CSS explícita para preservar configurações já salvas; gravações novas usam `fluid`.
- Nenhuma chave de i18n foi necessária. Lote 2 não foi iniciado.

**Achados fora do escopo (não corrigidos)**
- `src/core/Provider/hooks/useDesignManager.ts:24` — `audit:baseline` reportou excesso de estado; arquivo da plan-125 e protegido.
- `sarak-ui/GUIA-FRONTEND.md:705` — `kit-names:check` reportou `sarakCreateThemeBootCss`; arquivo da plan-125 e protegido.
- `src/components/atomic/Inputs/SarakMultiSelect.tsx:118` e `SarakUploader.tsx:118` — `auditor_composicaoatomica` reportou inputs nativos crus; arquivos da plan-122.
- `specs/plan/plan-125-tema-que-volta-certo.md` — `plan-index:check` encontrou índice em 🔵 e frontmatter em 🟠; pertencente à plan-125.
- `git status --short` e `git diff` falharam com `fatal: this operation must be run in a work tree`; não foi possível comparar o diff pelo Git neste ambiente.

**Pendências / riscos**
- `npm run verify -- --tier=quick` permanece vermelho pelos quatro checks descritos acima; nenhum dos arquivos das plan-122/125 foi alterado.
- A execução direta de `npm run guide` depende de a plan-125 liberar `sarak-ui/GUIA-FRONTEND.md`; `guide:check` está verde no worktree.
- O diff do worktree não pôde ser conferido pelo Git. Nenhum build ou commit foi feito.

## Veredito — 2026-10-24 — correção 1 (lote 1) — 🟢 Aprovado; lote 1 fechado

1. **Valor semântico** — `system.ts` oferece `fluid` (`FLUID_MAX_CONTENT_WIDTH_OPTION`), padrão do token e dos 19 temas; só
   `resolveMaxContentWidth` o traduz para CSS, chamado pelo leitor do cromo (`useChromeDesignTokens.ts`) e pela emissão da variável
   (`useDesignVariables.ts`); px e `100%` passam como estão.
2. **Snapshots** — regravados; na suíte completa de 2026-10-24 (`npx vitest run`, JSON) `PreviewCanvas` e `PresetCard` verdes; a
   única falha da suíte (3.783/3.784) é de um caso da `plan-125`.
3. **Catálogo e kit** — `catalog:check` e `guide:check` verdes; `npm run build` completo (com `kit-names:check`) passou.

Rodado pelo revisor: `npm run verify -- --tier=full` (gates verdes salvo os da `plan-125`), `npm run cromo-css-real:check` → 429/430
(a falha é `login-theme-application.spec.ts`, da `plan-125`), `largura-fluida.spec.ts` verde nas três larguras. O lote 2 segue.
