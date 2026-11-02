---
tipo: "plan"
titulo: "Desenhar toda opção do painel com o componente real e mostrar o efeito antes de escolher"
objetivo: "Fazer cada opção da galeria do painel aparecer com o componente real e o rascunho atual, com miniaturas de tema legíveis nos dois modos e prévia do efeito na tela grande ao passar o mouse ou focar uma opção, sem gravar nada"
dominio: "Painel de customização"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "painel", "ux", "previa"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[plan-140-painel-coluna-unica]]", "[[anexos/painel-design-prototipo]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Toda opção mostra o que será aplicado, com o componente real. Passar o mouse ou focar uma opção mostra o efeito na prévia grande, sem
gravar.

# 2. Contexto

Segunda de quatro plans do redesenho (referência visual: `specs/plan/anexos/painel-design-prototipo.html`). Hoje os catálogos ficam em
`Canvas/components/` (`PresetCard`, `CardsCatalog`, `ButtonsCatalog`, `InputsCatalog`, `AtmosphereCatalog`, `TypographyCatalog`). A
miniatura de tema usa barras cinza, um cartão dentro de outro, e o nome cobre a imagem; quase todos parecem iguais. Os presets de cartão
mostram barras no lugar de conteúdo.

**Regra desta plan:** a opção é desenhada com o componente real, com a opção aplicada por cima do rascunho, dentro de um `DesignScope`
([[06-painel-de-customizacao-e-preview]] §6.1). Nada de barra cinza.

**Orçamento:** componentes reais pesam mais que barras cinza. O spec de orçamento de recálculo (`browser-tests/troca-de-tema.spec.ts`) segue verde sem subir o teto, e
cada miniatura leva só as variáveis que usa. A espiada só funciona se compor um tema for quase instantâneo.

**Prepare para a plan-140:** cada grupo de opções sai como componente que não sabe onde está. A 140 os muda da galeria para a coluna sem
reescrevê-los.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/Canvas/components/` — os catálogos, os cartões e a miniatura de tema, com testes.
- `src/features/DesignEngine/Canvas/` e `Main/hooks/` — o estado de espiada e seu efeito em `PreviewCanvas`.
- `src/core/i18n/` — textos de amostra, por acréscimo, nos seis idiomas.
- Snapshots alterados por estas mudanças.

## 3.2 Fora
- A coluna única e o fim dos modos (plan-140).
- Presets novos e categorias novas (plan-141).
- `src/core/Design/presets/`: os dados dos presets não mudam aqui.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/painel-design-prototipo.html` | telas Tema, Forma e Componentes; a espiada ao passar o mouse |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §4, §4.1, §6.1, §6.2.1, §6.4 | rascunho, desempenho do rascunho, barreira de CSS, contêiner |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.2 | o tema carrega sob demanda |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6.1 | contêiner, nunca janela |
| Código | `src/features/DesignEngine/Canvas/components/useCatalogThemes.ts` · `PresetCardPending.tsx` | a miniatura de tema que ainda não chegou |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree. Capture o antes das seis abas.
2. **Miniatura de tema.** Mini tela real dividida em duas metades, claro e escuro, com título, cartão, gráfico e botão. Nome fora da imagem.
   Sem cartão dentro de cartão. Tema pendente mantém o estado de carregamento atual.
3. **Cartões:** título, valor e botão reais. **Botões:** repouso, hover, foco e inativo lado a lado, com a classe e o estado reais, sem simular
   por cor escrita. **Campos:** repouso e foco. **Atmosfera:** um cartão por cima do fundo, porque é assim que ela se usa.
4. **Sem tema escuro fixo:** a amostra segue o modo do rascunho.
5. **Espiada.** Com o mouse sobre uma opção ou o foco nela, a prévia grande compõe a opção por cima do rascunho, sem chamar `updateDraft`.
   Ao sair, volta. O texto da barra da prévia diz que é só uma prévia. Na troca de tema, o tema precisa estar carregado; enquanto não chega,
   a prévia não muda. **Sem espiada em toque:** nele, o toque já escolhe. Espera curta antes de compor, para não piscar ao atravessar a lista
   (valor em constante nomeada, com teste).
6. **Desempenho.** Lista longa desenha só o que está visível. Meça antes e depois o tempo de abrir a aba Temas, e cole no resumo.
7. **Prévia para o dono:** `C:\tmp\sarak-previa-139\index.html`, com antes e depois de cada aba, nos dois modos.
8. Rode `plan-135-paletas-no-painel`, `plan-122-preview-mode`, `painel-segue-o-modo` e `cromo-css-real` pelo Playwright, depois de
   `npm run build`. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
9. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Nenhum catálogo desenha barra cinza no lugar de conteúdo; todo cartão usa o átomo real — teste por catálogo.
- [ ] Trocar o modo do rascunho muda as amostras — teste.
- [ ] Espiar não altera o rascunho, não conta como mudança e reverte ao sair; funciona por teclado — teste.
- [ ] Sem espiada em dispositivo de toque — teste.
- [ ] Os grupos de opções não dependem do contêiner da galeria (importáveis sozinhos) — teste.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/features/DesignEngine src/core/Design` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A prévia aberta; o caminho vai ao dono; o veredito só fecha com a aprovação dele.
- Sondagem no navegador: espiar um tema escuro sobre rascunho claro, sair e conferir o rascunho igual.

# 8. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md` — §6.4: a opção é desenhada com o componente real sobre o rascunho; a
espiada compõe sem gravar e não existe em toque.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-01

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```
 M src/core/Design/palette/__tests__/role-map.test.ts
 M src/core/Design/palette/__tests__/scale.test.ts
 M src/core/Design/palette/contrast.ts
 M src/core/Design/palette/role-map.ts
 M src/core/Design/palette/scale.ts
?? src/core/Design/palette/__tests__/three-bands.test.ts
?? dist/… (18 chunks soltos de um build anterior; o `npm run build` os apagou na limpeza e gerou 18 novos, que apaguei depois)
```
Execução iniciada com a plan-139 em `🔴 A executar` e a plan-144 em `🟠 Em revisão`, por autorização expressa do dono na conversa ("prossiga").

**O que foi feito**
- `Canvas/components/peek.ts` (novo) — `PEEK_DELAY_MS = 150`, `canPeekHere()` (sem espiada quando `(hover: none)`), `usePeekHandlers` (mouse e foco; espera antes de compor; `null` ao sair e ao desmontar).
- `Main/hooks/usePeekPreview.ts` (novo) + `Main/ThemeCustomizationTab.tsx` — estado da espiada fora do rascunho: nada passa por `updateDraft`, então não conta como mudança.
- `Canvas/PreviewCanvas.tsx`, `PreviewCanvasLayout.tsx` — `peekTokens` entra por cima do rascunho só em `previewTokens` (prévia grande e apps); o escopo externo, o contexto e a galeria seguem o rascunho. `draft` e `onPeek` descem à galeria.
- `components/PreviewToolbar.tsx` + `core/i18n/catalogEntries.panel.ts` — aviso "Prévia: nada foi gravado" enquanto espia; nove textos de amostra novos, nos seis idiomas.
- `components/OptionTile.tsx` (novo) — uma opção: amostra + nome/descrição fora da imagem + botão transparente por cima (a amostra tem botão real; botão dentro de botão não é HTML válido). Não depende do contêiner da galeria.
- `components/SampleParts.tsx`, `SampleScope.tsx`, `LazyWhenVisible.tsx` (novos) — cartão real (`SarakCard` + `SarakButton`), botão nos 4 estados, campo (`SarakInput`) em repouso e foco; escopo = rascunho + opção + modo do rascunho; a amostra só é desenhada ao entrar na área visível.
- `components/ThemeMiniScreen.tsx` (novo) e `PresetCard.tsx` — miniatura de tema = duas metades (claro e escuro) com título, `SarakCard` real, gráfico e botão; nome fora da imagem; sem cartão dentro de cartão; só as famílias de variável que as peças leem (`THUMBNAIL_VARIABLE_PREFIXES`).
- `CardsCatalog`, `ButtonsCatalog`/`ButtonPresetPreview`, `InputsCatalog`/`InputPresetPreview`, `AtmosphereCatalog`, `TypographyCatalog`, `PresetsCatalog` — usam os blocos acima e recebem `draft`/`onPeek`. Os dois `*PresetPreview` foram mantidos (o catálogo gerado de tokens os cita).
- `browser-tests/plan-122-preview-mode.spec.ts` — a asserção da miniatura passou a ler a metade clara (`[data-theme-half="light"]`); a estrutura antiga (`:scope > div`) deixou de existir.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `Canvas/components/{peek.ts,OptionTile,SampleParts,SampleScope,LazyWhenVisible,ThemeMiniScreen}.ts(x)` | criado | blocos novos (acima) |
| `Main/hooks/usePeekPreview.ts` | criado | estado da espiada |
| `Canvas/components/{PresetCard,PresetsCatalog,CardsCatalog,ButtonsCatalog,ButtonPresetPreview,InputsCatalog,InputPresetPreview,AtmosphereCatalog,TypographyCatalog,PreviewToolbar}.tsx` | alterado | componente real + espiada |
| `Canvas/{PreviewCanvas,PreviewCanvasLayout}.tsx`, `Main/ThemeCustomizationTab.tsx` | alterado | fiação da espiada |
| `core/i18n/catalogEntries.panel.ts` | alterado | textos de amostra (6 idiomas) |
| testes novos: `peek`, `optionGroups`, `OptionTile`, `SampleParts`, `SampleScope`, `LazyWhenVisible`, `ThemeMiniScreen`, `PreviewCanvas.peek`, `usePeekPreview` | criado | cobertura dos critérios |
| testes alterados: `PresetCard`, `PresetCard.memo`, `PreviewToolbar`, `ButtonsCatalog` (só prazo de 30 s) + 4 snapshots (`PreviewCanvas`, `PresetsCatalog`, `CardsCatalog`, `AtmosphereCatalog`) | alterado | nova estrutura |
| `browser-tests/plan-122-preview-mode.spec.ts` | alterado | ver acima |

**Verificações executadas**
- `npx tsc --noEmit` → 0 erros.
- `npx vitest run src/features/DesignEngine src/core/i18n src/core/Design` → 1050 passaram, 1 falhou (`ThemeSidebarContent` snapshot, ver achados).
- `npm run build` → exit 0; Playwright `plan-135-paletas-no-painel`, `plan-122-preview-mode`, `painel-segue-o-modo`, `cromo-css-real` → todos passaram (40 passaram na rodada que incluiu também `troca-de-tema`).
- `troca-de-tema` (orçamento de recálculo) → **estourou na 1ª tentativa** (164 e 296 recálculos contra o teto 32). Medi por exclusão: a causa era o `SarakButton` real nas miniaturas (assina o contexto global; ×N). Troquei o botão da miniatura por um elemento com a classe e as variáveis do botão do tema; resultado: 4 passaram, **teto não foi alterado**.
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` feito; chunks novos de `dist/` apagados.
- `npm run verify -- --tier=quick` → tsc OK, baseline (hardcode/ghostvars/órfãos) OK após correção, Anel 0 OK (6664 linhas, 0 achado); **1 falha: `token-reader:check`** (ver pendências).
- Medição de abrir a aba Temas (até o recálculo assentar, Chromium headless, 1600×900, 5 rodadas cada, máquina com ruído): antes (cópia do `HEAD`) 2247/1830/1056/1787/3169 ms, mediana **1830**; depois 2161/2029/1233/2010/2097 ms, mediana **2029**. Diferença dentro do ruído; **não houve ganho medido** de abertura.
- Controle com `HEAD`: cópia em `C:\tmp\sarak-head-139` (git archive + junção), junção removida antes do `Remove-Item`; `Test-Path` do `node_modules` do repositório = True; `git status --short` (sem `dist/`) idêntico antes/depois do controle.

**Critérios de aceite**
- [x] Nenhum catálogo desenha barra cinza; todo cartão usa o átomo real — `optionGroups.test.tsx` ("não desenha barra cinza", "átomo real"), `PresetCard.test.tsx`, `ThemeMiniScreen.test.tsx`. Ressalva: o gráfico da miniatura é feito de `<i>` coloridas por variável do tema e o botão da miniatura não é o átomo (custo, ver acima).
- [x] Trocar o modo do rascunho muda as amostras — `optionGroups.test.tsx` (classe `light`/`dark` do escopo).
- [x] Espiar não altera o rascunho, não conta como mudança, reverte ao sair, funciona por teclado — `peek.test.tsx`, `PreviewCanvas.peek.test.tsx` (`onUpdateDraft` não chamado), `usePeekPreview.test.ts`.
- [x] Sem espiada em toque — `peek.test.tsx` ("em dispositivo de toque…").
- [x] Grupos importáveis sozinhos — `optionGroups.test.tsx` ("monta sozinho, fora da galeria").
- [ ] Prévia gerada — gerada em `C:\tmp\sarak-previa-139\index.html` (antes e depois das 6 abas, nos 2 modos); a aprovação é do dono. A espiada em si não aparece em imagem estática. **Sondagem no navegador (espiar tema escuro sobre rascunho claro, sair e conferir o rascunho igual): não executada**, só por teste de unidade.

**Decisões e suposições**
- Espera da espiada: 150 ms (a plan não fixou o valor).
- A espiada compõe os tokens só em `previewTokens`; contexto e escopo externo seguem o rascunho, para a galeria não recolorir ao passar o mouse.
- Mantive `ButtonPresetPreview` e `InputPresetPreview` (nomes citados em `cards_engine.json`).
- O foco de verdade é estado do navegador e não cabe em 4 amostras: o anel de foco usa a mesma declaração de `button:focus-visible` (`_elements.css`), lida de `--sarak-focus-width` e `--theme-primary-focus`; o hover e o foco do campo são disparados pelos eventos que o React escuta (`mouseover`, `focusin`), não por cor escrita.
- Editei `plan-122-preview-mode.spec.ts` (fora da lista do §3.1) porque a asserção dependia da estrutura removida.
- Prazo de 30 s em `ButtonsCatalog.test.tsx` e `optionGroups.test.tsx`: a lista com componentes reais passa dos 5 s sob a suíte em paralelo.
- A miniatura mostra sempre os dois modos (a regra "segue o modo do rascunho" vale para os catálogos de componente).

**Achados fora do escopo (não corrigidos)**
- `ThemeSidebarContent.test.tsx` (snapshot) falha por cores de amostras de paleta; as diferenças são de `rgb(...)` das paletas, compatíveis com as edições não commitadas em `core/Design/palette/` da fotografia. Não confirmei com cópia do `HEAD`. Não atualizei o snapshot.
- Os snapshots que atualizei trazem cores calculadas pelo código de paleta com as edições não commitadas; podem precisar de novo `-u` quando a plan-143 for commitada.
- `PreviewCanvas.test.tsx` ("propriedades de estilo reais") é instável sob a suíte inteira (falhou em duas rodadas completas, passa isolado); depende do tempo de carga dos temas.
- `auditor_atomic` (R10): `SarakMultiSelect.tsx` e `SarakUploader.tsx` violam a composição atômica — já estava assim, não tocado.

**Pendências / riscos**
- **`token-reader:check` vermelho (R40):** 15 tokens `preset*` de geometria da prévia (`presetCardHoverShadowOffsetY`, `presetGlowShadowBlur(Lg)`, `presetPreviewPaddingY`, `presetMatteShadow*` ×5, `presetPreviewMinHeight`, `presetMiniCardHeight`, `presetCardShadow*` ×3, `presetGridTextureSize`) só eram lidos pelas miniaturas desenhadas à mão, que a plan manda apagar. Ficaram sem leitor. O conserto correto é retirar os tokens (schema, partições, mapeamento, catálogo gerado) e as entradas de `PANEL_OWN_TOKENS`: escopo de outra plan (skill `ui-refatorar-componente`), que eu não abri. Decisão do revisor.
- Sem ganho medido no tempo de abrir a aba Temas (ver acima); a lista só desenha o visível, mas cada miniatura custa mais que as barras.
- Aprovação do dono da prévia e sondagem de navegador da espiada pendentes.

---

## Resumo da execução (correção 1) — 2026-11-02

**Resultado:** Concluído (itens 1 a 5). Verificação feita só a que o item 2 define, mais os specs de navegador dos itens 3 e 4; sem suíte inteira, sem `audit:baseline` e sem `verify` desta vez.

**Item 1 — tokens `preset*` retirados**
- `core/Design/schema/cards.ts`: 15 blocos removidos (`presetCardHoverShadowOffsetY`, `presetCardShadowBlur`, `presetCardShadowOffsetY`, `presetCardShadowSpread`, `presetGlowShadowBlur`, `presetGlowShadowBlurLg`, `presetGridTextureSize`, `presetMatteShadowBlur1/2`, `presetMatteShadowOffsetY2`, `presetMatteShadowSpread1/2`, `presetMiniCardHeight`, `presetPreviewMinHeight`, `presetPreviewPaddingY`).
- `catalog/theme_table_mapping.json`: 15 linhas; `catalog/partitions/cards_engine.json`: 89 → 74 entradas, e as referências em `relatedTokens` limpas.
- `gates/scripts/contrato/check-token-reader.mjs`: 15 entradas de `PANEL_OWN_TOKENS`. `presetMiniCardMaxWidth` ficou, porque `CardsCatalog` e `AtmosphereCatalog` ainda leem `--sarak-preset-mini-card-max-width`.
- Regerados: `npm run token-types` (design-token-ids.ts e design-token-docs.json, 420 tokens), `npm run themes:catalog`, `npm run catalog`, `npm run guide`, `npm run dev-kit` (`sarak-ui/*`, `sarak-dev/*`).
- Nenhum tema declara os tokens: `grep` no repositório, fora de `node_modules`, `dist` e `.git`, só os achou nos arquivos acima.
- Nota em `docs/migracoes.md`, na seção 8.0.0 ("Saem 15 tokens `preset*` da geometria interna do painel").
- Resultado: `token-reader:check` → "Todo valor emitido tem leitor"; `auditor_paridade` → 420 tokens nas 3 fontes; `auditor_presets` → nenhuma chave órfã; `token-types:check` e `token-docs:check` em dia (420 de 420); `tsc` 0 erros.

**Item 2 — snapshots**
- Cópia `git archive HEAD` em `C:\tmp\sarak-clean-139` (junção do `node_modules`), com só os 54 arquivos da plan por cima (sem `core/Design/palette/`, sem `specs/00-indice`, sem plans 141/145, sem o snapshot de `ThemeSidebarContent`). Regerei os quatro `.snap` lá e os trouxe de volta. O `-u` do `PreviewCanvas.test.tsx` não terminou em 10 minutos (travou também no repositório); apaguei o `.snap` da cópia e rodei sem `-u`, que o escreveu.
- Linha final de `npx vitest run src/features/DesignEngine gates/scripts/contrato/__tests__/check-token-reader.test.mjs`, na cópia: `Test Files  113 passed (113)` / `Tests  636 passed (636)`. A primeira execução completa falhou 1 teste (o snapshot do `PreviewCanvas`, o mesmo instável sob carga que relatei antes); a segunda passou, sem mudar nada. `src/features/DesignEngine/Canvas` sozinho: 43 arquivos, 171 testes, passou.
- Navegador: `troca-de-tema` 4 passaram, `plan-122-preview-mode` e `miniatura-de-tema` passaram. A primeira rodada de `troca-de-tema` (modo embarcado) falhou porque `dist/sarak-scoped.css` era do build anterior; depois de `npm run build:css:scoped` passou, teto intacto.
- A cópia e a junção foram removidas; `node_modules` do repositório: presente.

**Item 3 — cor da miniatura**
- `ThemeMiniScreen.tsx`: o gráfico lê `--sarak-secondary-color` e `--sarak-primary-color`; o botão, `--sarak-btn-primary-bg` (com `--sarak-primary-color` de reserva) e `--sarak-btn-primary-text`; o texto da metade, `--sarak-text-main`. `--sarak-text` entrou na lista de prefixos da miniatura. `SampleScope.tsx` e `SampleParts.tsx` pelo mesmo motivo: o fundo é `--sarak-bg-base`, a legenda `--theme-text-muted`.
- Achado no caminho: as barras tinham altura 0 (percentual de pai sem altura definida) e nenhum teste de jsdom via isso. O gráfico agora usa `aspect-[3/1]`, a miniatura `h-36` com `overflow-hidden`, e o cartão `!gap-0`.
- Teste no navegador: `browser-tests/miniatura-de-tema.spec.ts`, "dois temas de cores diferentes geram barras diferentes" (Sarak Sovereign contra Cyberpunk Neon, claro e escuro) → passou. Testes de unidade em `ThemeMiniScreen.test.tsx` e `SampleScope.test.tsx` conferem que nenhuma cor lê `--color-theme-*` nem classe `text-theme-*`/`bg-theme-*`.

**Item 4 — esmaecimento**
- Causa medida: a moldura da galeria (`PreviewCatalogFrame`, `PreviewCanvasLayout.tsx`) é `.sarak-card` e herdava a opacidade do cartão do rascunho, 0,65 no tema padrão; todo o conteúdo da galeria saía a 65%. Achei lendo a opacidade computada de cada ancestral da miniatura. Não é o momento da captura (mesmo valor aos 0 e aos 3 s).
- Correção: `style={{ ...frameStyle, opacity: 1 }}` na moldura (`PreviewCanvasLayout.tsx`). Teste de navegador: nenhum ancestral da miniatura tem `opacity` diferente de 1 → passou.
- Contraste medido, tema padrão: título da miniatura 15,87:1 (claro) e 16,44:1 (escuro); título do cartão de amostra da aba Cards 10,85:1. Todos acima de 4,5:1.
- Observação: com o código antigo (texto lendo a variável do `@theme`) o contraste do tema padrão também passava, porque a página está no mesmo tema; o esmaecimento era a opacidade, não a cor do texto.

**Item 5 — prévia**
- `C:\tmp\sarak-previa-139\index.html` regerado depois dos itens 3 e 4: "antes" (HEAD) e "depois" (código corrigido), 6 abas nos 2 modos. Conferi à vista `depois-escuro-Temas.png` e `depois-claro-Cards.png`: cores vivas, barras diferentes por tema, texto legível. A aprovação é do dono.

**Arquivos alterados nesta correção**
`Canvas/PreviewCanvasLayout.tsx`, `Canvas/components/{ThemeMiniScreen,PresetCard,SampleScope,SampleParts}.tsx`, testes `ThemeMiniScreen.test.tsx` e `SampleScope.test.tsx`, `browser-tests/miniatura-de-tema.spec.ts` (novo), `core/Design/schema/cards.ts`, `catalog/theme_table_mapping.json`, `catalog/partitions/cards_engine.json`, `gates/scripts/contrato/check-token-reader.mjs`, gerados (`core/Provider/generated/*`, `sarak-ui/*`, `sarak-dev/*`), `docs/migracoes.md`, os quatro `.snap`. `dist/` restaurado com `git restore`; `core/Design/palette/` não tocado.

**Achados fora do escopo (não corrigidos)**
- `vitest run -u` do `PreviewCanvas.test.tsx` não termina; o teste sem `-u` leva ~25 s.
- O snapshot do `PreviewCanvas` é instável quando a suíte do painel inteira roda em paralelo (falhou 1 de 2 rodadas completas na cópia limpa).
- `ThemeSidebarContent` continua como antes (cor da 143), não tocado.

**Pendências / riscos**
- `audit:baseline`, `verify --tier=quick` e a bateria de navegador completa não foram rodados nesta correção, por instrução. Convém que o revisor confirme que as classes novas (`h-36`, `aspect-[3/1]`, `grid-rows-[auto_1fr_auto]`) não acusam no auditor de hardcode.
- Aprovação do dono da prévia.

## Resumo da execução (correção 2) — 2026-11-02

**Resultado:** Concluído (itens 1 a 4 do bloco "prévia do dono"). Cards curados, Botões e Campos não foram tocados. `core/Design/palette/` não foi tocado.

**Item 1 — Temas volta ao original**
- `PresetCard.tsx` voltou ao desenho de `HEAD` (`git show HEAD:…`), com só a espiada acrescentada (props `peekTokens`/`onPeek`, `usePeekHandlers`, espalhados no `motion.button`); o `useMemo` ficou como estava em `HEAD`.
- Removidos: `ThemeMiniScreen.tsx`, `ThemeMiniScreen.test.tsx`, `THUMBNAIL_VARIABLE_PREFIXES`, `browser-tests/miniatura-de-tema.spec.ts`. `plan-122-preview-mode.spec.ts`, `PresetCard.test.tsx` e `PresetCard.memo.test.tsx` voltaram à versão de `HEAD` (`git checkout HEAD --`). A moldura sem opacidade herdada ficou.
- Consequência que o veredito não previu: o `PresetCard` de `HEAD` lê quatro variáveis dos tokens que a correção 1 retirou (`--sarak-preset-card-shadow-offset-y`, `-blur`, `-spread`, `--sarak-preset-grid-texture-size`); `variable-contract:check` e `audit:baseline` (variáveis-fantasma 0 → 8) falharam. Troquei as leituras pelos mesmos valores (4px, 10px, -2px, 8px) em `components/presetCardGeometry.ts` (novo). O desenho não muda; o `HEAD` usava esses mesmos valores como reserva.

**Item 2 — Fontes que parecem iguais**
- `TypographyCatalog.tsx`: um "Aa" grande (`text-7xl`, na fonte de título do preset, cor primária) ao lado do título, e a linha `Gg Qq Rr 0123` na fonte de corpo; a frase em português e o valor ficaram. Altura mínima `min-h-56`.
- Gerador da prévia (fora do repositório, `shots2.mjs`): serve `dist/fonts` por `file://` (`?fontes=`), usa `fonts: bundled` e, antes de cada captura, espera `document.fonts.check` de cada amostra visível e `document.fonts.ready`. Famílias com `FontFace` carregada na captura: escuro — Inter, JetBrains Mono, Outfit; claro — Inter, JetBrains Mono, Open Sans, Outfit, Work Sans (só as dos cartões que apareceram na tela, como o painel faz). Conferi à vista que Inter, Outfit, Work Sans e Open Sans se distinguem no "Aa".

**Item 3 — Atmosfera e texturas**
- `AtmosphereCatalog.tsx`: sem cartão central. A atmosfera ou a textura ocupa o tile (`h-48`), com o rótulo pequeno no canto superior e uma mini peça (o botão real, `SampleButton`) no canto inferior; grade em duas colunas pela mesma consulta de contêiner das outras. A textura vira `data-sx-texture` + `texture-active` no escopo da amostra.
- Textura da amostra: `SAMPLE_TEXTURE_STYLE` em `SampleParts.tsx` (opacidade 0,7 e traço na cor do texto do escopo, porque o traço do tema quase some sobre o fundo). É só da amostra: o clique chama `onApplyPreset(preset.design, true)` com o valor do preset, e há teste que confere que 0,7 não está no payload.
- Textura de card (`CardsCatalog`, sub-aba Texturas; Curados não foi tocado): a textura aparece no próprio cartão, `min-h-40`. A regra de cartão (`.sarak-card[data-sx-card-texture-type]::after`) perde para a do ancestral (a textura do rascunho, acima da galeria), então a amostra mostrava sempre a do rascunho; por isso o `SampleCard` desenha uma camada com `data-sx-texture` (mesmas imagens, por nome) dentro do cartão.
- Achado que afetava todas as abas de opção: o botão transparente do `OptionTile` era pintado de ciano e movido pelo CSS global `button:hover`/`button:active` (`_elements.css`) ao passar o mouse, cobrindo a amostra e a legenda. Corrigi com `p-0`, a exceção que o próprio CSS prevê; teste em `OptionTile.test.tsx`. Isso também vale para Cards curados, Botões e Campos (sem outra mudança neles).

**Item 4 — Prévia**
- `C:\tmp\sarak-previa-139\index.html` regerado só com Temas, Tipografia, Atmosfera (atmosferas e texturas) e texturas de card, nos dois modos; "antes" (HEAD) onde houve captura, "depois" com o código final, mouse fora da tela durante a captura. 26 imagens, nenhuma quebrada (conferido abrindo o arquivo no navegador e pela tela). Conferi à vista: Temas, Tipografia (escuro e claro), Atmosfera, texturas de atmosfera (grade nítida) e texturas de card (ruído e grão nítidos; "quadrados" e "listras" são padrões de pouco contraste no próprio CSS da lib).
- As imagens "antes" de Tipografia foram feitas sem as fontes servidas; só as "depois" têm as fontes reais.

**Verificação (a objetiva do veredito)**
- `npx vitest run src/features/DesignEngine/Canvas`, na cópia `git archive HEAD` só com os arquivos da plan: `Test Files 43 passed (43)` / `Tests 215 passed (215)` (com `check-token-reader.test.mjs` junto). Os quatro `.snap` (`PreviewCanvas`, `PresetsCatalog`, `CardsCatalog`, `AtmosphereCatalog`) foram regerados lá, apagando o arquivo e rodando sem `-u`, e trazidos de volta.
- No worktree (com a paleta da plan-143 por cima), a mesma pasta dá 168 de 170: `PreviewCanvas` e `PresetsCatalog` falham só por cor (`border-color: rgb(...)` das miniaturas). Na cópia limpa passam.
- `npm run token-reader:check` → "Todo valor emitido tem leitor". `npm run verify -- --tier=quick` → sem falhas (depois de `npm run guide`, que o `guide:check` pedia por causa da nota em `docs/migracoes.md`, e do `presetCardGeometry.ts`).
- Navegador: `troca-de-tema` (4) e `fontes-no-painel` (3) → 7 passaram, teto intacto, depois de `build:css` e `build:css:scoped`.
- Prazo: os testes de catálogo (Buttons, Inputs, Cards, Atmosphere, optionGroups) ganharam `vi.setConfig({ testTimeout: 30000 })`; sob carga a lista com componentes reais passava dos 5 s.
- Cópia e junção removidas; `node_modules` do repositório presente; `dist/` e `buildInfo` restaurados.

**Arquivos alterados nesta correção**
`PresetCard.tsx` (volta ao `HEAD` + espiada), `presetCardGeometry.ts` (novo), `OptionTile.tsx`, `SampleParts.tsx`, `SampleScope.tsx`, `CardsCatalog.tsx`, `AtmosphereCatalog.tsx`, `TypographyCatalog.tsx`; testes `optionGroups`, `OptionTile`, `SampleParts`/`SampleScope` (ajustes), timeouts em cinco arquivos; quatro `.snap`; `sarak-ui/docs/migracoes.md` (gerado). Removidos: `ThemeMiniScreen.tsx` e teste, `miniatura-de-tema.spec.ts`.

**Achados fora do escopo (não corrigidos)**
- `ThemeSidebarContent` (snapshot) continua falhando por cor da plan-143, não tocado.
- `PreviewCanvas.test.tsx` continua instável sob a suíte inteira em paralelo e o `vitest -u` dele não termina.
- O nome do tema quebra letra a letra ("SAR/AK/SO…") na miniatura estreita; é o `PresetCard` de `HEAD`, vale também para o "antes".

**Pendências / riscos**
- A suíte inteira e a bateria de navegador inteira não foram rodadas (por instrução); o `audit:baseline` rodou dentro do `verify --tier=quick`.
- Aprovação do dono da prévia.

# 10. Veredito

## Veredito — 2026-11-01 — 🔴 Reprovado

Medido numa cópia limpa, `HEAD` + 139, sem a 143: `npm run build` verde, bateria de navegador 455 de 455, suíte com 4.542 de 4.544. Os componentes reais, os grupos independentes e o orçamento de recálculo, com o teto intacto, estão certos.
**A espiada funciona:** sondagem do revisor no navegador, sobre o painel real: ao passar o mouse em Golden Hour o aviso aparece, nenhuma alteração é contada, e ao sair o aviso some e o rascunho segue igual.

1. **`token-reader:check` vermelho.** 15 tokens `preset*` perderam o leitor, e o teste `check-token-reader` falha. Isso barra o commit. Retire-os do schema, das partições, do mapeamento e de `PANEL_OWN_TOKENS`, pelo roteiro da skill `ui-refatorar-componente`, e regenere o que for gerado. São geometria
   interna do painel; confirme que nenhum tema os declara. Nota em `docs/migracoes.md`, na seção da próxima versão.
2. **Snapshots contaminados.** O `PreviewCanvas` falha na cópia limpa só por cor: `--sarak-card-header-bg` esperado `#d2f9eb`, recebido `#def4ed`. Os `.snap` foram gerados com a paleta da 143 na árvore. Regenere os quatro numa cópia `git archive HEAD` só com os arquivos desta plan, e traga-os de volta.
   Nessa cópia, rode só `npx vitest run src/features/DesignEngine gates/scripts/contrato/__tests__/check-token-reader.test.mjs` e cole a linha final. Sem bateria de navegador inteira: rode `troca-de-tema` e o spec da miniatura.
3. **Miniatura de tema com a cor errada.** O gráfico de `ThemeMiniScreen` sai igual em todos os temas: medido, `rgb(139, 214, 190)` em toda barra da primeira cor. Ele lê `--color-theme-secondary`, e a variável do `@theme` é resolvida em `:root`, então não muda dentro do escopo. Leia
   `--sarak-secondary-color` e `--sarak-primary-color`, ou o que de fato muda no escopo, e confira `--theme-*` nas demais peças. Teste no navegador: dois temas de cores diferentes geram barras diferentes.
4. **Amostras esmaecidas.** Nas capturas, a miniatura e o cartão de amostra saem lavados: texto de pouco contraste e cor apagada, em `depois-escuro-Temas.png` e `depois-claro-Cards.png`. Não há `opacity` nos arquivos da plan, então a causa está em outro lugar. Ache-a e meça: o contraste do título da amostra passa de 4,5:1 nas
   miniaturas do tema padrão, nos dois modos. Se a causa for o momento da captura, regenere a prévia e diga isso no resumo.
5. **Prévia.** Regenere `C:\tmp\sarak-previa-139\index.html` depois dos itens 3 e 4. Sem ganho medido ao abrir a aba Temas, o que está aceito: a galeria muda de lugar na `plan-140`.

**`ThemeSidebarContent`:** a falha é de cor da 143, e a cópia limpa a isola.

**Prévia:** o veredito só fecha com a aprovação do dono.

## Veredito — 2026-11-02 — correção 1 — técnica conferida, aguarda o dono

Os itens 1 a 5 estão resolvidos. Conferido pelo revisor, sem repetir a bateria, por decisão do dono: `token-reader:check` verde, `src/features/DesignEngine/Canvas` e o teste do gate com 215 de 216; a falha é o snapshot do `PreviewCanvas`, cujo diff na árvore compartilhada são 38 linhas só de cor
(paleta da 143). `verify --tier=quick` verde, inclusive `tsc`, `audit:baseline` e Anel 0, com duas exceções sem relação com a execução: `plan-index:check`, do status desta plan, e `guide:check`, resolvido por `npm run guide` antes do commit. Na prévia, as barras mudam por tema e as amostras saíram do esmaecimento.

A causa do esmaecimento era a opacidade do cartão herdada pela moldura da galeria. Falta a aprovação do dono sobre `C:\tmp\sarak-previa-139\index.html`.

## Veredito — 2026-11-02 — prévia do dono — 🔴 Ajustes

O dono avaliou a prévia. **Cards, Botões e Campos: aprovados.** Tipografia melhorou, mas as fontes parecem iguais. Temas piorou. Atmosfera e texturas não ficaram boas.

1. **Temas: volta o original.** Decisão do dono: a miniatura antiga, a de `HEAD`, fica melhor. Volte `PresetCard.tsx` ao desenho de `HEAD` e retire `ThemeMiniScreen.tsx`, o teste dele e `THUMBNAIL_VARIABLE_PREFIXES`, com `browser-tests/miniatura-de-tema.spec.ts` e o ajuste de `plan-122-preview-mode.spec.ts`. Mantêm-se o `useMemo` e a espiada.
   O critério "nenhuma barra cinza" fica sem efeito só para a aba Temas. A moldura sem opacidade herdada continua.
2. **Fontes que parecem iguais.** Medido pelo revisor no painel real: os títulos têm larguras diferentes (214 e 204 px) e as fontes carregam, mas só as visíveis, e Inter e Outfit são parecidas nessa frase. Na prévia, as fontes não foram servidas ao gerador. Faça a diferença aparecer: um "Aa" grande na fonte, ao lado do título, e
   uma linha com letras que distinguem (`Gg Qq Rr 0123`). Mantenha a amostra em português. Antes de capturar, aguarde `document.fonts.check`, e sirva `dist/fonts` no gerador da prévia.
3. **Atmosfera e texturas.** O cartão no centro esconde o que se quer ver. Sem cartão central em Atmosfera. A atmosfera ou textura de fundo ocupa o cartão inteiro, com rótulo pequeno e uma mini peça discreta num canto, para dar escala. **Textura de cartão:** a textura aparece no próprio cartão, com tamanho suficiente para ser reconhecida. A amostra usa uma opacidade visível, e o valor aplicado
   ao clicar não muda. Agrupe o tile em duas colunas, se isso ajudar a comparar.
4. **Prévia:** regenere `C:\tmp\sarak-previa-139\index.html` só com Temas, Tipografia e Atmosfera, mais as texturas de cartão.

**Verificação objetiva:** `npx vitest run src/features/DesignEngine/Canvas`, `npm run token-reader:check`, `troca-de-tema` e `fontes-no-painel` no navegador, e `npm run verify -- --tier=quick`. Snapshots só na cópia `git archive HEAD`. Sem suíte inteira e sem bateria inteira.

## Veredito — 2026-11-02 — correção 2 — 🟢 Aprovado

O dono seguiu para o commit depois de ver a prévia da correção 2. Conferido nas capturas: Temas com o desenho original, Tipografia com as fontes reais e o "Aa", atmosfera e texturas visíveis. Na árvore compartilhada, 213 de 215: `PreviewCanvas` e `PresetsCatalog`, por cor da 143, segundo o executor,
que mediu 215 de 215 na cópia limpa. A CI confirma no push. Rótulos com jargão ficam para a `plan-141`, e o nome quebrado na miniatura estreita, para a `plan-140`.

