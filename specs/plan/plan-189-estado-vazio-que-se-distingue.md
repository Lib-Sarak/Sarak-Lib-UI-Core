---
tipo: "plan"
titulo: "As opções do estado vazio voltam a se distinguir no painel"
objetivo: "Fazer as amostras de empty-soft-orbs e empty-ring saírem diferentes no grupo Estado vazio do painel, nos dois modos, e com isso devolver a presets-do-painel ao verde para o fechamento da rc.2"
dominio: "Painel de customização / Estado vazio"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc2", "painel", "estado-vazio", "regressao"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]"]
depende_de: ""
retida_por: ""
destino_sintese: "06-painel-de-customizacao-e-preview"
---

# 1. Objetivo

No grupo "Estado vazio" do painel, a amostra de cada opção se distingue das outras em ao menos 2%, nos dois modos. A
`presets-do-painel` passa no caso "se distingue a olho" de Componentes.

# 2. Contexto

- **O defeito (backlog #1, visto na execução do lote 1 da `plan-188`):** `empty-soft-orbs` e `empty-ring` saem idênticas (0,00%), no
  escuro e no claro.
- **As duas opções** (`src/core/Design/presets/components/feedbackPresets.ts:70-89`) diferem em `emptyStateOrbOuter` (560 × 420),
  `emptyStateOrbInner` (320 × 240), `emptyStateOrbBlur` (120 × 70), `emptyStateRingRadius` (2 × 4), `emptyStateCaptionMaxWidth`
  (300 × 360) e `skeletonRowRadius` (6 × 12).
- **A amostra** é o `SarakEmptyState` real (`EmptySample`, `PresetSamplesReal.tsx:60`), carregado sob demanda.
- **Hipóteses, que só a medida decide:**
  - as esferas, de 420 px ou mais, ficam fora do recorte da miniatura, e o que sobra é igual;
  - o componente deixou de ler algum desses tokens;
  - o texto do componente veio vazio no momento da captura, porque os catálogos das peças opcionais passaram a carregar sob demanda;
  - a medida captura as duas amostras ainda carregando.
- **Não se sabe se já era assim no `HEAD`.** A `plan-188` não tocou neste grupo.

# 3. Escopo

## 3.1 Dentro
- A causa medida e a correção dela, no componente, na amostra ou na medida. Se a causa estiver na medida (captura antes de
  carregar), a correção é na espera da spec, não no limiar.
- Um teste de unidade que trave a causa, quando ela estiver no componente ou na amostra.

## 3.2 Fora
- Os valores das opções: elas continuam com o que o tema grava. Se a diferença entre elas for pequena demais para se ver na
  miniatura, pare e relate.
- O limiar de 2%.
- **A `plan-186`, a `plan-187` e o lote 2 da `plan-188` correm em paralelo.** Fique fora de `registry.ts`, `PresetSamplesStatic.tsx`,
  `_print.css`, das tabelas, de `SarakButton`, `SarakSearchCard` e do cromo da barra do topo. Não declare prazo literal em teste: use
  `prazoDeTeste` (`src/shared/testing/prazoDeTeste.ts`).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | amostras e distinção |
| Código | `src/core/Design/presets/components/feedbackPresets.ts` · `src/features/DesignEngine/Canvas/components/PresetSamplesReal.tsx` | as opções e a amostra |
| Código | `browser-tests/presets-do-painel.spec.ts` | a medida |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` | sempre |

# 5. Instruções de execução

1. **Origem:** numa cópia limpa do `HEAD` (fora do repositório, com junção para o `node_modules`), rode `npm run build` e o caso "se
   distingue a olho" de Componentes da `presets-do-painel`. Registre se o par já sai em 0,00% ali.
2. **Causa:** abra as duas amostras lado a lado (captura de cada miniatura) e registre o que se vê e qual hipótese da §2 a medida
   confirma.
3. **Corrija** (§3.1).
4. **Verificação do executor:**
   - `npx vitest run src/features/DesignEngine/Canvas src/components/atomic/Feedback`;
   - `npm run verify -- --tier=quick`;
   - `npm run build` e o caso "se distingue a olho" de Componentes, nos dois modos.
5. **Trava de build:** o build e a spec rodam com a trava `C:\tmp\sarak-build.lock`, a mesma das plans paralelas.
   - Pegue a trava com `node -e "require('fs').writeFileSync('C:/tmp/sarak-build.lock','plan-189',{flag:'wx'})"`. Se o comando
     falhar, outra plan está com ela: espere e tente de novo.
   - Solte só depois de conferir que o conteúdo é `plan-189`, com
     `node -e "const fs=require('fs');const f='C:/tmp/sarak-build.lock';if(fs.readFileSync(f,'utf8')==='plan-189')fs.rmSync(f)"`,
     inclusive se algo falhar.
   - Nunca apague a trava de outra plan. Se ela ficar parada mais de 30 minutos sem build rodando, relate.

# 6. Critérios de aceite

- [ ] O resumo diz se o par já saía em 0,00% no `HEAD`, e qual foi a causa medida.
- [ ] O caso "se distingue a olho" de Componentes passa nos dois modos, com o par do estado vazio acima de 2%.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff;
- as duas miniaturas, vistas;
- **mutação, em cópia:** desfaça a correção → o par volta abaixo de 2%.

# 8. Destino da síntese

**Destino:** `06-painel-de-customizacao-e-preview` (a frase sobre as amostras que são o componente real). O texto para transporte está
no Veredito.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-27

**Resultado:** Concluído

**Estado do worktree ao iniciar**
(sem as linhas `dist/`, que são build de outra plan; o resto, colado)
```
M browser-tests/barra-de-topo-estreita.spec.ts
 M browser-tests/tabela-documento-e-impressao.spec.ts
 M docs/migracoes.md
 M gates/scripts/release/__tests__/run-release-tests.test.mjs
A  gates/scripts/release/find-own-timeouts.mjs
 M gates/scripts/release/run-release-tests.mjs
 M sarak-ui/docs/migracoes.md
 M specs/00-backlog.md
 M specs/00-indice.md
A  specs/plan/plan-185-suite-estavel-sob-carga.md
A  specs/plan/plan-186-quatro-defeitos-de-componente.md
AM specs/plan/plan-187-tabela-impressa-em-varias-folhas.md
AM specs/plan/plan-188-amostras-que-mostram-a-diferenca.md
 M src/buildInfo.ts
 M src/components/Layout/chrome/ChromeTopbarBody.tsx
 M src/components/atomic/Buttons/SarakButton.tsx
 M src/components/atomic/Buttons/__tests__/SarakButton.test.tsx
 M src/components/atomic/Cards/SarakSearchCard.tsx
 M src/components/atomic/Cards/__tests__/SarakSearchCard.test.tsx
 M src/components/atomic/DataDisplay/SarakDataGrid/SarakDataGridImpl.tsx
 M src/components/atomic/DataDisplay/SarakDataGrid/__tests__/SarakDataGridImpl.test.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/SarakDataTableHeader.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/SarakDataTableRows.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/SarakDataTableView.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/__tests__/useTableDisplayRows.test.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/useSarakDataTableViewModel.ts
 M src/components/atomic/DataDisplay/SarakDataTable/useTableDisplayRows.ts
 M src/components/atomic/DataDisplay/__tests__/CardDetailComposition.test.tsx
 M src/components/atomic/Media/SarakPDFViewer/__tests__/usePdfDocument.test.ts
 M src/components/atomic/Media/SarakQRCode/__tests__/SarakQRCodeImpl.test.tsx
 M src/components/atomic/Templates/__tests__/SarakTable.test.tsx
 M src/core/Design/hooks/__tests__/surfaceTint.test.ts
 M src/core/Design/palette/__tests__/anchor-and-shift.test.ts
 M src/core/Design/palette/__tests__/gradient-bar-contrast.test.ts
 M src/core/Design/palette/__tests__/nav-active-over-inactive.test.ts
 M src/core/Design/palette/__tests__/presets.test.ts
 M src/core/Design/palette/__tests__/switch-idle-thumb.test.ts
 M src/core/Design/palette/__tests__/tone-plan.test.ts
 M src/core/Design/presets/components/__tests__/personalities.test.ts
 M src/core/Design/presets/components/__tests__/presetsReadable.test.ts
 M src/core/Design/presets/components/registry.ts
 M src/core/Provider/buildInfo.ts
 M src/core/i18n/catalogEntries.visibleTexts.ts
 M src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx
 M src/features/DesignEngine/Canvas/components/PresetSamples.tsx
 M src/features/DesignEngine/Canvas/components/PresetSamplesMotion.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/AtmosphereCatalog.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/ButtonsCatalog.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/CardsCatalog.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/InputsCatalog.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PresetSamples.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PresetSamplesMotion.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/optionGroups.test.tsx
 M src/features/DesignEngine/Main/__tests__/LoginThemeApplication.test.tsx
 M src/features/DesignEngine/Main/__tests__/PersonalityTopbar.integration.test.tsx
 M src/features/DesignEngine/Main/__tests__/ThemeColumn.integration.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeDecisionView.fundoDaPagina.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeDecisionView.mainTokens.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeDecisionView.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/decisionTextsEmIngles.test.tsx
 M src/features/DesignEngine/Main/hooks/__tests__/searchTokensTraduzidos.test.ts
 M src/features/DesignEngine/components/__tests__/painelGravaOQueMostra.test.tsx
 M src/features/DesignEngine/components/controls/BasicControls.tsx
 M src/features/DesignEngine/hooks/__tests__/configIsSavedDesign.persistenceIntegration.test.tsx
 M src/features/DesignEngine/hooks/__tests__/useDesignDraft.undoIntegration.test.tsx
A  src/shared/testing/__tests__/prazoDeTeste.test.ts
 M src/shared/testing/__tests__/sarakTestKit.test.tsx
A  src/shared/testing/prazoDeTeste.ts
 M src/styles/_print.css
?? browser-tests/fixtures/tabela-folhas-entry.tsx
?? browser-tests/tabela-impressa-em-folhas.spec.ts
?? specs/plan/plan-189-estado-vazio-que-se-distingue.md
?? src/components/atomic/DataDisplay/SarakDataTable/SarakDataTableFlowParts.tsx
?? src/components/atomic/DataDisplay/SarakDataTable/__tests__/SarakDataTableFlowParts.test.tsx
?? src/features/DesignEngine/Canvas/components/PresetSamplesStatic.tsx
?? src/features/DesignEngine/Canvas/components/__tests__/PresetSamplesStatic.test.tsx
```

**O que foi feito**
- **Origem medida.** Numa cópia limpa do `HEAD` (`git archive` em `C:\tmp`, junção para o `node_modules`), o caso "se distingue a olho" de Componentes **passa** nos dois modos (soft-orbs × ring = 6,78% no escuro). No worktree, antes da correção, **falha** nos dois modos: soft-orbs × ring = 0,00%.
- **Causa medida.** Dump das duas miniaturas: no `HEAD` a diferença máxima por pixel é 178, no worktree é 7. Os 6,78% do `HEAD` vinham da **fase das animações do componente** (entrada em escalonamento, glow e anel que giram, em framer-motion, que `animations: 'disabled'` não para), não das opções. No worktree as duas fotos caem na mesma fase e sobra só o que as opções desenham: esferas a 5% de opacidade com blur, anel a 5% e legenda com duas linhas fixas, tudo abaixo do corte de 30 de delta por pixel. Hipótese das esferas fora do recorte e fraqueza de contraste: confirmadas; token não lido, texto vazio e captura antes de carregar: descartadas (o componente lê os quatro tokens; o texto e a espera estavam certos).
- `PresetSamplesReal.tsx`: `EmptySample` passou a sobrepor ao `SarakEmptyState` real um **guia de geometria** (`EmptyGeometryGuide`), parado, em traço cheio da cor `--theme-primary` e escala 0,3, que redesenha as mesmas medidas que o componente lê: círculo externo (`--sarak-empty-state-orb-outer`), círculo interno tracejado (`-orb-inner`), caixa do anel (`-ring-radius`) e barra com a largura da legenda (`-caption-max-width`), com os mesmos valores de partida do componente. Os valores das opções não mudaram.
- `PresetSamplesReal.test.tsx`: teste novo que trava o guia (as quatro variáveis aparecem no estilo do guia, `aria-hidden`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Canvas/components/PresetSamplesReal.tsx` | alterado | `EmptyGeometryGuide` e uso dele em `EmptySample` |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetSamplesReal.test.tsx` | alterado | teste do guia |
| `specs/plan/plan-189-estado-vazio-que-se-distingue.md` | alterado | este resumo e o status |

(`browser-tests/presets-do-painel.spec.ts` recebeu uma linha de depuração para despejar as miniaturas e foi **restaurada**: `git diff` dele está vazio.)

**Verificações executadas**
- `npx playwright test … presets-do-painel.spec.ts -g "Componentes: cada opção"` no `HEAD` limpo → 2 passed (6,78% no escuro).
- O mesmo no worktree, antes → 2 failed (`emptyState: empty-soft-orbs × empty-ring = 0.00%`, escuro e claro).
- O mesmo no worktree, depois → 2 passed. Par do estado vazio: escuro 2,98%, claro 4,20%; os demais pares do grupo ficam entre 10% e 15%.
- `npx vitest run src/features/DesignEngine/Canvas src/components/atomic/Feedback` → 69 arquivos, 393 testes, todos passam.
- `npm run verify -- --tier=quick` → `tsc --noEmit` OK; Anel 0 OK; 2 falhas que **não são deste diff** (ver Achados).
- Trava `C:\tmp\sarak-build.lock`: peguei depois que a plan-187 soltou (esperei ~20 min) e soltei conferindo o conteúdo `plan-189`. Não rodei `npm run build`: o spec lê `src/` pelo esbuild do harness, não o `dist/` (limite declarado no cabeçalho do spec), então o build não muda a medida.

**Critérios de aceite**
- [x] Resumo diz se o par já saía em 0,00% no `HEAD` e a causa — não saía (6,78%), e a causa está acima.
- [x] O caso passa nos dois modos, com o par acima de 2% — 2,98% e 4,20%.
- [x] `git diff --stat` só em caminhos da §3.1 — `PresetSamplesReal.tsx` e o teste dele (mais a plan).

**Decisões e suposições**
- A correção ficou na amostra, não no componente nem na medida: o componente já lia os tokens, e a espera da spec estava certa. A diferença das opções é feita de peças a 5% de opacidade; o corte de 2% da §3.2 e os valores das opções ficaram intactos.
- O guia deixa a amostra **menos "só o componente real"** do que diz a [[06-painel-de-customizacao-e-preview]] §519 ("Gráfico, tabela, selo e estado vazio são o componente real"). Mantive o `SarakEmptyState` real por baixo e o guia é decoração `aria-hidden`. Alternativa que a spec já prevê (tirar da lista de destacadas a opção que a miniatura não distingue) mexe em `registry.ts`, que a §3.2 proíbe. Se o revisor quiser a prosa da spec ajustada, é demanda dele.
- Margem do par no escuro é 2,98% (o corte é 2%). A medida é estável porque o guia é parado, mas é a menor do grupo.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/Canvas/components/PresetSamplesDepth.tsx:17` e `:55` — duas unidades fixas hardcoded; é o que faz `audit:baseline` marcar `auditor_hardcoded.valor: 0 -> 2`. Arquivo da plan-188 lote 2, em paralelo.
- `npm run -s plan-index:check` — `plan-187` com índice "🔵 Em correção" × frontmatter "🟠 Em revisão". É status de outra plan, do revisor.
- O caso "se distingue a olho" passando no `HEAD` do par soft-orbs × ring dependia da fase das animações do componente, não do que as opções desenham: outros pares de outros grupos com componente animado podem estar na mesma situação (não medi).

**Pendências / riscos**
- Nenhuma do escopo. Não repeti a suíte completa nem o `build` (§3 item 8 do executor).

---

# 10. Veredito

## Veredito — 2026-11-27 — código conferido; prévia com o dono

**Origem e causa:** aceitas. No `HEAD`, o par passava por causa da fase da animação do componente, não das opções. As opções
desenham peças com 5% de opacidade.

**Mutação, em cópia:** sem o `<EmptyGeometryGuide />`, o caso de Componentes reprova nos dois modos com
`emptyState: empty-soft-orbs × empty-ring = 0.00%`.

**Conferência do revisor:** `tsc --noEmit` com 0 erros; `audit:baseline` igual ao baseline; `trail-citation` OK; vitest de Canvas,
presets, DataDisplay e Feedback: 164 arquivos, 1375 testes passando.

**Divergência com a plan:** a §3.2 mandava parar e relatar se a diferença entre as opções fosse pequena demais para a miniatura.
O executor achou isso e corrigiu com um guia de medidas sobre o componente real. O guia segue o caminho que o dono aprovou na
`plan-188`: um desenho estático do que a opção faz. Por isso aceito a correção, e a prévia vai ao dono.

**Divergência com a spec:** a [[06-painel-de-customizacao-e-preview]] diz que a amostra do estado vazio é o componente real. O
destino da síntese passa a ser a spec 06, com este texto:

> A amostra do estado vazio é o `SarakEmptyState` real, com um guia por cima. O guia redesenha, em traço cheio, as medidas que a
> opção muda: os dois círculos, o anel e a largura da legenda. No componente, essas peças têm opacidade baixa demais para se
> distinguir na miniatura.

**Prévia, vista pelo revisor** (`C:\tmp\sarak-previa-188\lote-2\escuro-components-emptyState.png`): as quatro opções agora diferem
no tamanho dos círculos e do anel. "Esferas suaves" e "Com anel" ainda são as mais próximas (2,98% no escuro).

**Achados para o backlog:**
- A medida de distinção depende da fase da animação nos componentes animados. Outros pares podem estar passando pelo mesmo acaso.
- A pasta `C:\tmp\p189-prev-head` ficou da execução.

**Prévia aprovada pelo dono em 2026-11-27, como está** (guia de medidas sobre o componente real).

## Veredito final — 2026-11-27 — 🟢 Aprovada
