---
tipo: "plan"
titulo: "Consolidar o modo essencial do painel Design Engine — rótulo, curadoria e o Command Center solto"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "painel", "modo-essencial", "folksonomia", "ux"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]"]
depende_de: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
objetivo: "O painel expõe dois modos claramente nomeados — Essencial e Avançado — e o Essencial cobre de fato os tokens de maior impacto visual, sem lacuna de dados"
---

# 1. Objetivo

Quem abre o painel de customização entende, sem ambiguidade, que existem dois modos — **Essencial** e
**Avançado** — o rótulo do controle diz o que ele faz, e o modo Essencial cobre de verdade os tokens de
maior impacto visual (cards, cores, fontes, fundo), sem tokens órfãos por falta de dado.

# 2. Contexto

O pedido original ("criar um modo essencial") revelou, na investigação, que **o mecanismo já existe** —
só está mal exposto e com uma lacuna de dado. `arquivo:linha`:

- `src/features/DesignEngine/Main/hooks/usePreviewUIState.ts:11` — `isEssentialMode: true` é o **default**.
- `src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx:100-111` — o switch visível no painel
  hoje se apresenta como **"Modo Avançado (Hyper-Granular)"**, com a posição "ligada" correspondendo a
  `!isEssentialMode` — ou seja, comunica o oposto do que seria mais claro ("aqui está o Essencial").
- `src/features/DesignEngine/Main/components/ThemePillarsList.tsx:82` — o filtro esconde **token a token**:
  `visibleTokens = tokens.filter(token => !isEssentialMode || dynamicEssentialTokens.has(token.id))`.
- `src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts:29-34` —
  `dynamicEssentialTokens = new Set(TokenCatalog.filter(t => (t.importance || 0) >= 80).map(...))` — a
  curadoria já usa um campo `importance` que já existe na maioria das partições do catálogo
  (`src/core/Design/catalog/partitions/*.json`).
- **A lacuna medida:** `components_base.json` tem só **45 de 73** tokens com `importance` — os outros **28**
  caem em `0` via `t.importance || 0` e **nunca** aparecem no modo Essencial, mesmo que devessem.

  > ✅ **Reconferido pelo revisor em 2026-08-12, e o dado reforça a plan:** varrendo as **13** partições
  > (`tokenId` × `importance`, arquivo a arquivo), **doze estão 100% preenchidas** — `cards_engine` 94/94,
  > `colors_and_atmosphere` 63/63, `layout_and_navigation` 48/48, `data_and_charts` 40/40, `typography`
  > 34/34, `branding_config` 30/30, `motion_and_animation` 17/17, `specialized_engines` 16/16, `structural`
  > 11/11 e as três de valor único 1/1. **Só `components_base` diverge (45/73).**
  >
  > Isso muda a leitura do achado: não é curadoria incompleta por toda parte — é **uma anomalia isolada num
  > arquivo só**, o que torna o passo 3 da §3.1 um preenchimento de lacuna, não um projeto de curadoria. E
  > confirma a linha vermelha da §3.2: **não há o que mexer fora de `components_base.json`.**
- **O terceiro painel desconectado:** `src/features/DesignEngine/Panels/HyperGranularityTab.tsx` — um
  "Command Center" com busca livre sobre 200+ tokens (`:62`) — **ignora `isEssentialMode`/
  `dynamicEssentialTokens` por completo**. Não é o mesmo componente do switch do print; é um sistema à parte.

**Decisão desta plan (revisor, não redesenho do zero):** consertar o que existe — corrigir rótulo, fechar a
lacuna de dado, e dar ao Command Center uma entrada própria e claramente nomeada em vez de deixá-lo solto e
sem relação com o toggle Essencial/Avançado. Não se reescreve a folksonomia dinâmica
(`dynamic-categories.ts`) nem se introduz taxonomia nova — o campo `importance` já é a fonte certa.

# 3. Escopo

## 3.1 Dentro
1. **Medir a curadoria atual, primeiro passo, antes de qualquer mudança de dado.** Para os domínios que o
   dono citou como exemplo — cards (`cards.ts`), cores (`colors.ts`/`atmosphere.ts`), tipografia
   (`typography.ts`), fundo/atmosfera (`atmosphere.ts`) — listar quais tokens têm `importance >= 80` hoje.
   Esta lista entra no resumo **antes** do passo 3 — é o "loop de completude" desta plan.
2. **`ThemeSidebarHeader.tsx:100-111`** — trocar o rótulo/posição do switch para comunicar dois estados
   nomeados (**Essencial** / **Avançado**), não um switch binário de "modo avançado".
3. **Preencher `importance` nos 28 tokens de `components_base.json` sem o campo** — usando como referência o
   padrão de `importance` dos tokens irmãos na mesma categoria daquele arquivo. Declarar a lista completa
   (token → valor atribuído → motivo) no resumo.
4. **Dar ao `HyperGranularityTab` uma entrada própria e nomeada** — em vez de um terceiro sistema
   desconectado, ele passa a ser acessível por um ponto de entrada explícito (ex.: "Buscar token (avançado)")
   dentro do painel, separado do toggle Essencial/Avançado, sem fingir ser o mesmo mecanismo. **Não fundir**
   o Command Center com o filtro de `isEssentialMode` — são interações diferentes (busca livre vs. navegação
   por pilar) e forçar a fusão é redesenho, fora do escopo desta plan.
5. Testes ao lado de cada arquivo tocado (R8).

## 3.2 Fora
- ⛔ Reescrever `dynamic-categories.ts` ou a folksonomia dinâmica em si.
- ⛔ Adicionar campo novo ao schema de tokens — usar o `importance` já existente.
- ⛔ Fundir `HyperGranularityTab` com o filtro de `isEssentialMode` — ver §3.1 item 4.
- ⛔ Layout/CSS (`plan-35`) ou performance (`plan-36`).
- ⛔ Mudar `importance` de qualquer token **fora** de `components_base.json` — a lacuna medida é só ali; se a
  auditoria do passo 1 achar curadoria errada em outro schema, **relate, não corrija** — vira achado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2 | a folksonomia dinâmica — o mecanismo que esta plan documenta pela primeira vez |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R11 | Configuração × Expansão — preencher `importance` é dado (Configuração), não código novo |
| **Skill** | `padrao-escrita` · `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | sempre |
| Código | `src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts`, `ThemeSidebarHeader.tsx`, `ThemePillarsList.tsx`, `Panels/HyperGranularityTab.tsx` | ler antes de editar |
| Código | `src/core/Design/catalog/partitions/components_base.json` | os 28 tokens sem `importance` |

# 5. Instruções de execução

1. **Passo 1 da §3.1** — auditar e listar a curadoria atual dos 4 domínios citados. Apresentar a lista no
   resumo **antes** de tocar em código.
2. **Corrigir o rótulo do switch** em `ThemeSidebarHeader.tsx:100-111`.
3. **Preencher os 28 `importance` faltantes** em `components_base.json`, um a um, com o valor e o motivo
   declarados no resumo — não um valor arbitrário genérico para todos.
4. **Dar entrada própria ao Command Center** — botão/link nomeado, fora do fluxo do toggle Essencial/
   Avançado.
5. Testes: cobrir o novo rótulo/estado do switch, a leitura correta de `importance` nos 28 tokens antes
   órfãos, e a entrada nova do Command Center.
6. **Fechar.** Rodar, nesta ordem, e colar a saída real no resumo: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` (`auditor_presets` cruza contra o gabarito vivo — confirmar que
   preencher `importance` não quebra a paridade) ·
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-37-consolidar-modo-essencial-painel.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/06-painel-de-customizacao-e-preview.md §2 (folksonomia dinâmica),
specs/specs/00-regras-e-invariantes.md R11 (Configuração × Expansão).
Skills a aplicar: padrao-escrita, padrao-typescript, test-unitario.

PASSO 1, ANTES DE QUALQUER EDIÇÃO: audite e liste quais tokens de cards/colors/
atmosphere/typography têm importance >= 80 hoje. Cole a lista no resumo. Só depois
disso toque em código.

O MECANISMO JÁ EXISTE — isEssentialMode, dynamicEssentialTokens, o campo importance no
catálogo. Você NÃO está criando um modo novo do zero: está consertando rótulo,
preenchendo lacuna de dado, e dando entrada própria ao HyperGranularityTab.

LINHAS VERMELHAS:
  · Você NÃO reescreve dynamic-categories.ts nem a folksonomia.
  · Você NÃO adiciona campo novo ao schema — usa importance, que já existe.
  · Você NÃO funde o HyperGranularityTab com o filtro de isEssentialMode — são
    interações diferentes.
  · Você NÃO mexe em importance fora de components_base.json. Achou curadoria errada
    noutro schema? RELATE, não corrija.
  · Você NÃO mexe em layout/CSS (plan-35) nem em performance (plan-36).

Todo conserto leva teste ao lado (R8).

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] A lista de curadoria atual (4 domínios) está no resumo, **datada antes** das edições de código.
- [ ] O switch comunica claramente dois estados nomeados — evidência: captura ou descrição do texto/aria
      novo.
- [ ] Os 28 tokens de `components_base.json` têm `importance` preenchido, cada um com o valor e o motivo
      listados.
- [ ] O `HyperGranularityTab` tem entrada própria, nomeada, separada do toggle Essencial/Avançado.
- [ ] `auditor_presets` continua em paridade (0 chaves órfãs) depois de preencher `importance`.
- [ ] `npx vitest run` inteira, verde, não encolheu.
- [ ] `run_audit` sem regressão; `npx tsc --noEmit` → 0 erros.
- [ ] `git diff --stat` — só os arquivos de §3.1 (mais os testes correspondentes).

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff
grep -c "importance" src/core/Design/catalog/partitions/components_base.json
npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
```

O terceiro comando tem de subir — hoje são 45 de 73; depois desta plan, os 73 têm `importance`. Confira a
lista do passo 1 do resumo contra o `grep` real do catálogo antes de aprovar — é a mesma disciplina de
"medição, não alegação" das outras plans desta leva.

# 9. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md`

**Texto pronto para transporte:** a §2 (folksonomia dinâmica) ganha uma subseção nova documentando o modo
Essencial/Avançado — o campo `importance`, o limiar `>= 80`, `dynamicEssentialTokens`, e a entrada separada
do Command Center — que hoje existe no código e não é mencionado em spec nenhuma.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-12

**Resultado:** Concluído

### Passo 1 — Auditoria da curadoria atual (ANTES de qualquer edição)

Contagem de tokens com `importance >= 80` nos 4 domínios citados pelo dono, extraída por leitura direta dos
JSONs de partição (`grep "tokenId"|"importance"` + leitura integral para confirmar contexto):

**`cards_engine.json`** (94/94 tokens já tinham `importance`) — `>= 80`:
`cardLayoutDirection` (90), `cardImagePosition` (85), `cardTextAlign` (80), `cardBorderRadius` (85),
`cardBackgroundColor` (90), `cardBackdropBlur` (85), `cardTextureType` (85), `cardTextureOpacity` (80),
`cardHoverTranslate` (80), `cardSpotlightOpacity` (85), `cardPaddingMd` (90), `cardVariant` (85).

**`colors_and_atmosphere.json`** (63/63 já tinham `importance`, cobre `colors.ts`/`atmosphere.ts`/`status.ts`/`media.ts`) — `>= 80`:
`colorPalette` (95), `primaryColor` (100), `secondaryColor` (90), `tertiaryColor` (80), `accentColor` (85),
`surfaceColor` (85), `titleColor` (80), `colorBgBody` (95, 2 entradas), `colorBgLayer1` (90, 2 entradas),
`colorBgLayer2` (85, 2 entradas), `colorBgModal` (85), `cardBackgroundColor` (80), `bgBaseColor` (90),
`bgGradientMode` (85), `surfaceMaterial` (95), `surfaceIntensity` (80), `borderType` (85), `systemTone` (95),
`texture` (80), `glassBlur` (85), `glassOpacity` (85), `shadowIntensity` (85), `globalSaturation` (85),
`globalContrast` (85), `statusSuccessColor`/`statusErrorColor`/`statusWarningColor`/`statusInfoColor` (90),
`globalBackgroundImageUrl` (85).

**`typography.json`** (34/34 já tinham `importance`) — `>= 80`:
`headingFont` (95), `bodyFont` (95), `monoFont` (80), `textColorMaster` (95), `textColorSecondary` (90),
`textColorMuted` (85), `h1Size` (95), `h1Weight` (90), `h1LineHeight` (85), `h1LetterSpacing` (80),
`h2Size` (90), `h2Weight` (85), `h2LineHeight` (80), `bodyLineHeight` (90), `bodyWeight` (90).

**`components_base.json`** — a lacuna medida: **45/73** tokens tinham `importance` antes desta plan. Os 28
sem o campo caíam sempre em `0` via `t.importance || 0` (`useThemeCustomizationData.ts:33`) e nunca apareciam
no modo Essencial, mesmo quando deveriam. Este é o "loop de completude" que o passo 3 fecha, abaixo.

A auditoria confirmou, com contagem real (não a alegação da plan), que a lacuna é isolada a
`components_base.json` — as outras 12 partições estavam 100% preenchidas, batendo com o reconferido do
revisor em 2026-08-12.

### O que foi feito

- **Preenchidos os 28 `importance` de `components_base.json`** (`src/core/Design/catalog/partitions/components_base.json`)
  — cada um com o valor e o motivo, usando como referência os tokens irmãos da mesma categoria funcional já
  presentes no mesmo arquivo (não um valor genérico):

  | Token | `importance` | Motivo (sibling de referência) |
  |---|---|---|
  | `tableZebraStriping` | 55 | decoração de tabela on/off, abaixo de `tableBorderColor` (60) |
  | `tableBorderRadius` | 70 | geometria de tabela, nível de `tableHeaderBg` (70) |
  | `inputPadding` | 80 | espaçamento de input, nível de `inputBg`/`inputTextColor` (80) |
  | `inputBorderType` | 70 | estilo de borda, nível de `inputBorderColor` (70) |
  | `inputBackdropBlur` | 60 | efeito de vidro, nível de `btnBackdropBlur`/`switchBackdropBlur` (60) |
  | `inputShadow` | 55 | decorativo, abaixo de `inputBackdropBlur` |
  | `inputIconColor` | 70 | cor de detalhe do input, abaixo de `inputIconPosition` (80) |
  | `inputErrorColor` | 85 | feedback crítico de validação, nível de `inputFocusBorderColor` (85) |
  | `inputSuccessColor` | 80 | feedback de validação, par simétrico de `inputErrorColor` |
  | `iconButtonGlowBlurSm/Md/Lg` | 35/40/45 | variantes de um micro-efeito decorativo |
  | `iconButtonFrostedShadowOffsetY/Blur` | 30/35 | detalhe de sombra decorativa, nicho |
  | `themeDropdownMaxHeight` | 30 | constraint de layout raramente ajustado |
  | `actionGlowShadowOffsetY/Blur/Spread` | 30/35/30 | mesmo grupo decorativo de `iconButton*` |
  | `kanbanHeaderPaddingY/Tracking` | 35/30 | detalhe de espaçamento/tracking de componente de nicho |
  | `kanbanCardRadius` | 45 | geometria de nicho, nível de `btnRadiusTL` (50) |
  | `toastMinWidth/MaxWidth` | 45/45 | constraint de dimensão de feedback visível |
  | `toastAccentWidth` | 35 | detalhe decorativo do toast |
  | `contextMenuMinWidth` | 35 | constraint de layout de nicho |
  | `multiSelectInputMinWidth` | 30 | constraint de layout de nicho |
  | `searchBackdropBlur` | 55 | efeito de vidro, nível de `inputBackdropBlur` |
  | `rangeActiveColor` | 75 | cor de estado ativo, nível de `switchTrackActiveBg`/`checkboxActiveColor` (80) |

  Confirmado por leitura em runtime: `73/73` tokens do arquivo agora têm `importance` (antes: `45/73`).

- **`ThemeSidebarHeader.tsx:100-119`** — o switch trocou "Modo Avançado (Hyper-Granular)" (rótulo fixo, que
  comunicava o oposto do estado quando `isEssentialMode=true`) por rótulo dinâmico "Modo Essencial" /
  "Modo Avançado", conforme o próprio `isEssentialMode`. Adicionado `role="switch"` +
  `aria-checked={isEssentialMode}` + `aria-label` descritivo — antes o controle não tinha semântica de switch
  nenhuma.

- **`ThemeSidebarHeader.tsx:44-54`** — o seletor de `viewMode` (antes 3 ícones: preview/catálogo/templates)
  ganhou um 4º botão nomeado ("Buscar token (avançado)", ícone `Command`) que aponta para o modo
  `command-center` — a entrada própria do `HyperGranularityTab`, **fora** do fluxo do toggle
  Essencial/Avançado, sem tocar em `isEssentialMode`/`dynamicEssentialTokens`.

- **`usePreviewUIState.ts:9,45`** — o tipo de `viewMode` ganhou o 4º valor `'command-center'` (era
  `'preview' | 'catalog' | 'templates'`).

- **`ThemeSidebarContent.tsx:7,119-122`** — novo branch que monta `<HyperGranularityTab />` quando
  `viewMode === 'command-center'`. O componente já é autocontido (gerencia o próprio `useDesignDraft` e busca
  via `useSovereignSearch`) — não recebeu props novas, só ganhou o ponto de montagem que faltava.

### Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/catalog/partitions/components_base.json` | alterado | 28 tokens ganharam `importance` (dado, R11 Configuração) |
| `src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx` | alterado | rótulo dinâmico do switch + `role="switch"`/`aria-*` + 4º botão do viewMode (Command Center) |
| `src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx` | alterado | branch novo que monta `HyperGranularityTab` no modo `command-center` |
| `src/features/DesignEngine/Main/hooks/usePreviewUIState.ts` | alterado | tipo de `viewMode` ganhou `'command-center'` |
| `src/features/DesignEngine/Main/components/__tests__/ThemeSidebarHeader.test.tsx` | alterado | testes do rótulo/estado do switch + do botão do Command Center |
| `src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx` | alterado | teste do branch `command-center` (mock de `HyperGranularityTab`) |
| `src/features/DesignEngine/Main/hooks/__tests__/useThemeCustomizationData.test.ts` | alterado | teste da leitura de `importance` nos 28 tokens antes órfãos + regressão de `cards_engine` |

### Verificações executadas

- `npx vitest run` (suíte INTEIRA) → **313 arquivos de teste, 1272 testes, todos verdes** (número real medido
  após as alterações). Não medi a contagem exata antes de tocar código — o que confirmo é que nenhum arquivo
  de teste foi removido, nenhum `it`/`describe` foi apagado ou marcado `skip` (só adicionei casos a 3
  arquivos existentes), então a contagem só pode ter crescido, nunca encolhido.
- `node gates/scripts/audit/run_audit.mjs` → `auditor_paridade`: **422 tokens** nas 3 fontes, paridade 1:1:1
  mantida (preencher `importance` não mexeu em `tokenId`, schema nem mapping). `auditor_presets`: 125 itens
  auditados, 0 chave órfã. Único auditor com `[ERROR]`: `auditor_composicaoatomica` — **2 ocorrências**
  (`SarakMultiSelect.tsx:113`, `SarakUploader.tsx:111`), que são exatamente as 2 do baseline documentado em
  R10 (`specs/00-regras-e-invariantes.md`) — não tocadas por esta plan.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `[audit:baseline] igual ao baseline de
  2026-08-11 — nenhuma regressão.` (saída real, exit code 0).
- `npx tsc --noEmit` → **0 erros** (exit code 0).
- `git diff --stat` → 7 arquivos, `147 insertions(+), 16 deletions(-)` — todos dentro do escopo §3.1 (mais os
  testes correspondentes).

### Critérios de aceite

- [x] A lista de curadoria atual (4 domínios) está no resumo, **datada antes** das edições de código —
      evidência: seção "Passo 1" acima, escrita antes de qualquer `Edit` neste resumo.
- [x] O switch comunica claramente dois estados nomeados — evidência: `ThemeSidebarHeader.tsx:115` (rótulo
      dinâmico) + `role="switch"`/`aria-checked`/`aria-label` (`:107-111`); teste em
      `ThemeSidebarHeader.test.tsx`.
- [x] Os 28 tokens de `components_base.json` têm `importance` preenchido, cada um com o valor e o motivo
      listados — evidência: tabela acima + `grep -c "importance" components_base.json` = 73 (medido).
- [x] O `HyperGranularityTab` tem entrada própria, nomeada, separada do toggle Essencial/Avançado —
      evidência: botão "Buscar token (avançado)" em `ThemeSidebarHeader.tsx:44-54`, wired a
      `viewMode==='command-center'` em `ThemeSidebarContent.tsx`, sem tocar `isEssentialMode`.
- [x] `auditor_presets` continua em paridade (0 chaves órfãs) depois de preencher `importance` — evidência:
      saída do `run_audit.mjs` acima, "0 chave órfã encontrada".
- [x] `npx vitest run` inteira, verde, não encolheu — evidência: 313 arquivos/1272 testes (cresceu com os
      testes novos, nenhum removido).
- [x] `run_audit` sem regressão; `npx tsc --noEmit` → 0 erros — evidência: `check-audit-baseline.mjs
      --with-tsc` = "igual ao baseline", `tsc --noEmit` exit 0.
- [x] `git diff --stat` — só os arquivos de §3.1 (mais os testes correspondentes) — evidência: tabela de
      arquivos alterados acima, 7 arquivos, todos no escopo.

### Decisões e suposições

- **Nome do modo novo: `'command-center'`.** A plan não determinou o nome técnico da 4ª entrada de `viewMode`
  — só o rótulo visível ("Buscar token (avançado)", sugestão textual da própria plan §3.1 item 4). Escolhi
  `'command-center'` porque é o nome que o próprio `HyperGranularityTab.tsx:38` já usa para se descrever
  ("THE COMMAND CENTER"), mantendo consistência interna. Suposição de baixo impacto: é um valor de união
  interno, não superfície pública.
- **Entrada integrada ao seletor de `viewMode` existente, não um botão/modal separado.** A plan pedia
  "botão/link nomeado, fora do fluxo do toggle Essencial/Avançado" (§3.1 item 4) sem prescrever o mecanismo.
  Escolhi estender o padrão já existente (o seletor de 3 ícones preview/catálogo/templates em
  `ThemeSidebarHeader.tsx:44`) com um 4º ícone, em vez de inventar um mecanismo novo (modal, rota separada) —
  é a interpretação mais conservadora: reusa a infraestrutura de navegação que já existe no painel, e mantém
  a separação exigida (o novo modo não lê nem escreve `isEssentialMode`/`dynamicEssentialTokens`).
- **Valores de `importance` dos 28 tokens são julgamento, não medição.** A plan pediu "valor e motivo" por
  token, não um algoritmo determinístico — apliquei o mesmo raciocínio comparativo que os tokens vizinhos já
  demonstravam no arquivo (decorativo/nicho → baixo; feedback crítico/dimensão de uso frequente → alto).
  Documentado token a token na tabela acima para o revisor auditar cada escolha.

### Achados fora do escopo (não corrigidos)

- **`src/core/Design/catalog/partitions/components_base.json` (os 28 tokens antes órfãos)** — usam um shape
  de entrada mais pobre que o resto do catálogo: `label` + `cssVars` em vez de `name` + `description` +
  `categories` + `schemaOrigin` + `digitalTwins` + `cssVariables` + `allowedValues` + `relatedTokens`. Isso é
  **anterior** a esta plan e **não** foi tocado (o escopo era só `importance`) — mas os 28 tokens continuam
  sem `description` (a ajuda que `HelpTooltip` exibiria, `specs/specs/06-painel-de-customizacao-e-preview.md`
  §3) e sem `categories` (o que os deixa fora da folksonomia dinâmica de `dynamic-categories.ts`, então não
  aparecem em pilar/grupo nenhum do painel, independentemente do modo Essencial/Avançado). Sugestão: plan
  nova de enriquecimento de schema desses 28 tokens.
- **`HyperGranularityTab` usa uma instância de `useDesignDraft(sarak)` própria e paralela**
  (`HyperGranularityTab.tsx:44`), separada da instância de `ThemeCustomizationTab.tsx:65-77` que alimenta o
  resto do painel. Isso já existia no componente — esta plan só deu a ele um ponto de montagem alcançável.
  **Consequência agora visível ao usuário:** editar um token pelo Command Center não aparece como "dirty" no
  toggle Essencial/Avançado nem no botão "Aplicar Alterações Globais" do header, porque são dois rascunhos
  diferentes. A própria plan proíbe fundir os dois mecanismos (§3.1 item 4, linha vermelha), então não
  corrigi — mas antes desta plan o problema era invisível (o componente era inalcançável); agora que tem
  entrada, é observável. Sugestão: plan nova para decidir se os dois rascunhos devem compartilhar estado (o
  que reabriria a linha vermelha desta plan) ou se o Command Center precisa de aviso visual de que é um
  contexto de edição separado.

### Pendências / riscos

- Nenhuma pendência técnica identificada nos critérios de aceite. O risco documentado acima (dois rascunhos
  paralelos no painel) é pré-existente e está explicitamente fora do escopo desta plan — fica registrado
  para decisão do revisor/dono.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-12 — 🔵 Em correção (dois achados)

O trabalho de **dado** está impecável. O que reprova é o efeito de ter tornado alcançável um painel que
ninguém alcançava.

### O que está muito bem-feito

**A curadoria não é preenchimento cego.** Contei a distribuição dos 73 `importance` de
`components_base.json`: **73/73 preenchidos**, em **13 valores distintos** (`30`×7, `35`×6, `40`, `45`×5,
`50`×6, `55`×3, `60`×7, `65`×3, `70`×8, `75`×2, `80`×17, `85`×6, `90`×2). Um executor apressado teria posto
`80` nos 28 e passado no critério. Este graduou, e declarou o motivo de cada um.

**A auditoria do passo 1 veio antes das edições**, como a §5 exigia, e confirmou a medição da plan (12 das
13 partições já 100%).

**Os rótulos do seletor de `viewMode`** ganharam `title` + `aria-label` por um mapa nomeado
(`VIEW_MODE_LABELS`) — não era pedido, e conserta botões que antes eram só ícones mudos.

| Gate | Saída |
|---|---|
| `npx vitest run` | **313 arquivos / 1272 testes, verde** (era 313/1265) |
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `auditor_paridade` | **422 tokens**, paridade mantida — preencher `importance` não quebrou o gabarito |

### 🔵 Achado 1 — o `role="switch"` promete o que o teclado não cumpre

`ThemeSidebarHeader.tsx:117-122` — o `role="switch"` + `aria-checked` foram postos num `<div>` **sem
`tabIndex`, sem `onKeyDown`**, dentro de um `<label>` cujo `onClick` é o único acionador. Não há `<input>`
por baixo.

O resultado: a tecnologia assistiva passa a anunciar *"switch, marcado"* para um elemento que **nenhum
teclado alcança ou aciona**. ARIA em elemento não-focável é promessa que o produto não cumpre — e é pior que
o silêncio anterior, porque agora o leitor de tela afirma que dá para operar.

**Sendo justo:** a inoperabilidade por teclado é **anterior** a esta plan; o `label` com `onClick` já era
assim. O que a plan acrescentou foi o **anúncio**. Mas o critério da §7 é *"o switch comunica claramente dois
estados nomeados — evidência: o texto/aria novo"*, e um aria que mente não comunica. O conserto é pequeno:
`tabIndex={0}` + `onKeyDown` para Espaço/Enter, ou — melhor — um `input type="checkbox"` visualmente
escondido dentro do `label`, que resolve foco, teclado e semântica de uma vez. O `label` irmão logo abaixo
tem a mesma estrutura; se o conserto servir para os dois, aplique nos dois.

### 🔵 Achado 2 — a entrada nova reativa o segundo rascunho que a `plan-36` acabou de remover

`ThemeSidebarContent.tsx:120-123` monta o `HyperGranularityTab` no `viewMode` novo. E
`HyperGranularityTab.tsx:44` instancia **a própria `useDesignDraft(sarak)`**, com o próprio
`handleApplyToSystem` (`:172`).

`ThemeCustomizationTab.tsx:77` **também** tem a sua, e **continua montada** enquanto o `viewMode` troca — o
`ThemeSidebarContent` é filho dela. Logo, no modo novo passam a existir **duas instâncias vivas de
`useDesignDraft`**, cada uma com o seu `useDesignDraftSync` escrevendo em `sarak.setDraftDesign`.

**É exatamente a configuração que a `plan-36` eliminou** — o item 4 dela removeu a instância paralela do
`MasterControlPanel` e a fez receber `draft`/`updateDraft`/`resetToken` por prop, justamente para haver
**fonte única de rascunho**. Aprovei aquilo hoje. Esta plan devolve o padrão pela porta dos fundos, e desta
vez **com botão para o usuário**.

Há um agravante de contexto: a `plan-36` também trocou, no `useDesignDraftSync`, a comparação
`JSON.stringify` por `===`. Aprovei essa troca com base em que, **num regime de um escritor só**, o setter
cru preserva a referência. Com **dois** escritores a premissa deixa de ser óbvia, e **nenhum teste monta os
dois ao mesmo tempo** — não afirmo que há loop; afirmo que a premissa que sustentou uma aprovação minha
mudou de regime sem cobertura.

**O executor registrou o problema no resumo**, e isso conta a favor. Mas a §3.2 desta plan proibia fundir o
Command Center com o **filtro de `isEssentialMode`** — coisa diferente de consumir o rascunho compartilhado.
Fazer o `HyperGranularityTab` receber o rascunho por prop **não era proibido**, é o padrão que a plan
anterior já construiu no mesmo arquivo, e é o que fecha o achado.

### Prompt de correção

```
Leia specs/00-prompt-executor.md e corrija a execução de
specs/plan/plan-37-consolidar-modo-essencial-painel.md.

Veredito de 2026-08-12: DOIS achados. Todo o resto está APROVADO — os 28 importance,
a auditoria do passo 1, o rótulo dinâmico do switch e os aria-label do seletor de
viewMode ficam como estão.

ACHADO 1 — ThemeSidebarHeader.tsx:117-122
  O role="switch" + aria-checked foram postos num <div> SEM tabIndex e SEM onKeyDown,
  dentro de um <label> cujo onClick é o único acionador — não há <input> por baixo.
  O leitor de tela passa a anunciar um switch que NENHUM teclado alcança ou aciona.
  CONSERTO: torne-o operável de fato. Preferência: um <input type="checkbox">
  visualmente escondido dentro do <label> (resolve foco, teclado e semântica de uma
  vez, e o <label> passa a acioná-lo nativamente). Alternativa: tabIndex={0} +
  onKeyDown para Espaço e Enter. O <label> IRMÃO logo abaixo tem a mesma estrutura —
  se o conserto servir para os dois, aplique nos dois; se não servir, RELATE.
  TESTE: acionar por teclado alterna o modo. Sem teste de teclado, o achado volta.

ACHADO 2 — ThemeSidebarContent.tsx:120-123 + HyperGranularityTab.tsx:44
  O HyperGranularityTab instancia a PRÓPRIA useDesignDraft(sarak), e o
  ThemeCustomizationTab.tsx:77 continua montado com a dele — duas instâncias vivas,
  cada uma com seu useDesignDraftSync escrevendo em sarak.setDraftDesign. É a mesma
  configuração que a plan-36 acabou de remover do MasterControlPanel.
  CONSERTO: faça o HyperGranularityTab receber o rascunho por PROP, exatamente como o
  MasterControlPanel passou a receber na plan-36 — o threading por ThemeSidebarContent
  já existe, siga-o. Ele usa draft, updateDraft, handleApplyToSystem, resetComponent,
  resetToken e toast: passe o que ele precisar da MESMA instância, e remova a chamada
  a useDesignDraft de dentro dele.
  Se o threading NÃO for mecânico (ex.: toast não é threadável sem redesenho), PARE e
  RELATE em vez de improvisar — vira achado, não puxadinho.
  TESTE: montar ThemeSidebarContent com viewMode='command-center' e provar que existe
  UMA fonte de rascunho — uma edição feita no Command Center aparece no draft do
  painel, sem segunda instância.

LINHAS VERMELHAS:
  · Você NÃO mexe em components_base.json — os 28 importance estão aprovados.
  · Você NÃO funde o Command Center com o filtro de isEssentialMode (a §3.2 continua
    valendo) — compartilhar o RASCUNHO não é fundir os MECANISMOS.
  · Você NÃO mexe em useDesignDraftSync.ts nem em useDesignDraft.ts. O conserto é do
    lado do consumidor.
  · Você NÃO remove a entrada nova do Command Center — ela é o objetivo da plan.

Rode e cole: npx vitest run (INTEIRA) · run_audit · check-audit-baseline --with-tsc ·
npx tsc --noEmit · npm run container-query:check · git diff --stat.

Não commite. Acrescente um bloco NOVO de resumo (o anterior permanece intacto) e mova
o status para 🟠 Em revisão.
```

### Achado registrado, não corrigido

O executor relatou que os 28 tokens preenchidos usam um shape de catálogo mais pobre (sem
`description`/`categories`) e por isso ficam fora da folksonomia dinâmica. **Concordo em não corrigir aqui**
— é dado de catálogo, escopo de outra plan. Fica anotado para virar uma.

---

## Resumo da execução (correção 1) — 2026-08-12

**Resultado:** Concluído

**Escopo desta rodada:** exclusivamente os dois achados do veredito de 2026-08-12. Não toquei em
`components_base.json` (os 28 `importance` seguem exatamente como aprovados), não mexi em
`useDesignDraftSync.ts` nem em `useDesignDraft.ts`, e a entrada do Command Center continua no painel.

### Achado 1 — `role="switch"` num `<div>` não-focável → conserto: `<input type="checkbox" role="switch">` real

- **`ThemeSidebarHeader.tsx:109-125`** (toggle Essencial/Avançado) e **`:127-140`** (toggle "Empilhar
  Previews") — os dois `<div role="switch">` sem `tabIndex`/`onKeyDown` viraram `<input type="checkbox"
  role="switch" className="sr-only">` reais dentro do próprio `<label>`, seguindo **o mesmo padrão já
  canônico** de `src/components/atomic/Inputs/SarakSwitch.tsx:43-52` (input `sr-only` + track/thumb
  puramente visuais como `<div aria-hidden="true">` irmãos). O `<label>` continua acionando o input pelo
  comportamento nativo do HTML — não precisa mais de `onClick`/`preventDefault` manual, que foi removido dos
  dois.
- Apliquei o conserto **nos dois** labels, como o prompt de correção pediu ("se o conserto servir para os
  dois, aplique nos dois") — o `<label>` irmão ("Empilhar Previews") tinha exatamente a mesma estrutura
  quebrada.
- `aria-checked` e `aria-label` migraram do `<div>` para o `<input>`, que é agora o elemento com `role`
  correto e foco nativo (tabindex implícito de `<input>`).

**Teste:** `ThemeSidebarHeader.test.tsx` ganhou 2 testes novos que usam `@testing-library/user-event` para
simular teclado de verdade (não `fireEvent.keyDown`, que não replica o comportamento nativo de Espaço em
checkbox): focar o `<input>` e disparar `user.keyboard(' ')`, confirmando que `setIsEssentialMode`/
`setIsPreviewStacked` são chamados — prova que o controle é operável por teclado, não só que tem o atributo
ARIA.

### Achado 2 — `HyperGranularityTab` tinha `useDesignDraft(sarak)` própria → conserto: rascunho por prop

- **`HyperGranularityTab.tsx`** — removida a chamada a `useDesignDraft(sarak)` e o import correspondente. O
  componente ganhou `export interface HyperGranularityTabProps { draft, updateDraft, handleApplyToSystem,
  resetComponent, resetToken, toast }` e passou a receber tudo isso por prop, exatamente como
  `MasterControlPanel` já recebe `draft`/`updateDraft`/`resetToken` desde a `plan-36`. `useSarakUI()`
  **continua** no componente — não é a causa do achado (é só leitura de contexto, não uma segunda instância
  de rascunho); a única coisa removida foi o `useDesignDraft(sarak)`.
- **`ThemeSidebarContent.tsx`** — o branch `viewMode === 'command-center'` agora passa
  `draft`/`updateDraft`/`handleApplyToSystem`/`resetComponent`/`resetToken`/`toast` ao
  `HyperGranularityTab` — as MESMAS instâncias que o resto do painel usa (o mesmo `draft`/`updateDraft` que
  alimentam `ThemePillarsList`, `ThemeGlobalSettings` e `MasterControlPanel`). O tipo de `resetComponent` na
  interface do componente foi alargado de `(id: string) => void` para `(schemaIdOrSchemas: string | string[])
  => void` — o tipo real que `useDesignDraft` sempre teve; a interface antiga era mais estreita que a
  implementação e só não dava erro porque ninguém ainda passava `resetComponent` adiante para um consumidor
  que precisava do lado `string[]`.
- **`ThemeCustomizationTab.tsx`** — passa `handleApplyToSystem={handleApplyToSystemWrapper}` e `toast={toast}`
  (ambos já existiam no componente, vindos da MESMA `useDesignDraft(sarak)` que alimenta todo o resto) para
  `ThemeSidebarContent`.
- **O threading foi mecânico**, como o prompt de correção previu — não houve nenhum caso como "toast não é
  threadável sem redesenho" que exigisse parar e relatar. `toast` já subia até `ThemeCustomizationTab` e só
  precisou de mais um nível de prop-drilling via `ThemeSidebarContent`.

**Teste — prova de fonte única (não só "existe"):**
- `ThemeSidebarContent.test.tsx` ganhou um teste que captura os props recebidos pelo `HyperGranularityTab`
  mockado e verifica **identidade de referência** (`toBe`, não `toEqual`) entre `draft`/`updateDraft`/
  `handleApplyToSystem`/`resetComponent`/`resetToken`/`toast` passados para `ThemeSidebarContent` e os que
  chegam ao `HyperGranularityTab` — é a mesma disciplina do teste já existente da `plan-36` para
  `MasterControlPanel` (mesma seção do arquivo, mesmo padrão).
- `HyperGranularityTab.test.tsx` foi reescrito (era só um placeholder "está definido") para testes
  comportamentais reais: clicar em "Aplicar Soberania" chama o `handleApplyToSystem` recebido por prop (não
  um handler interno), o botão reflete o `draft` recebido via prop (não estado interno), e o toast exibido é
  o recebido por prop (não um `showToast` local).

### Arquivos alterados nesta rodada

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx` | alterado | os 2 switches viraram `<input type="checkbox" role="switch" className="sr-only">` reais (achado 1) |
| `src/features/DesignEngine/Panels/HyperGranularityTab.tsx` | alterado | removida a instância própria de `useDesignDraft`; recebe tudo por prop (achado 2) |
| `src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx` | alterado | passa `handleApplyToSystem`/`toast` adiante; tipo de `resetComponent` alargado (achado 2) |
| `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` | alterado | passa `handleApplyToSystem`/`toast` para `ThemeSidebarContent` (achado 2) |
| `src/features/DesignEngine/Main/components/__tests__/ThemeSidebarHeader.test.tsx` | alterado | 2 testes de teclado (`userEvent.keyboard(' ')`) para os dois switches |
| `src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx` | alterado | teste de identidade de referência dos props repassados ao `HyperGranularityTab` |
| `src/features/DesignEngine/Panels/__tests__/HyperGranularityTab.test.tsx` | alterado | de placeholder para 3 testes comportamentais reais (props em vez de estado interno) |

**Não alterados nesta rodada** (linhas vermelhas do prompt de correção, respeitadas): `components_base.json`,
`useDesignDraft.ts`, `useDesignDraftSync.ts`, `dynamic-categories.ts`, o filtro de `isEssentialMode`.

### Verificações executadas

- `npx vitest run` (suíte INTEIRA) → **313 arquivos de teste, 1278 testes, todos verdes** (era 313/1272 antes
  desta correção — cresceu com os 6 testes novos: 2 de teclado + 1 de identidade de referência + 3 do
  `HyperGranularityTab`; nenhum arquivo nem teste removido).
- `node gates/scripts/audit/run_audit.mjs` → único `[ERROR]` é `auditor_composicaoatomica`, **2 ocorrências**
  (`SarakMultiSelect.tsx:113`, `SarakUploader.tsx:111`) — confirmado por `grep -A2 FAIL` na saída: são
  **exatamente** as mesmas 2 do baseline de R10, nenhum arquivo desta correção entre elas.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `[audit:baseline] igual ao baseline de
  2026-08-11 — nenhuma regressão.` (saída real, exit code 0).
- `npx tsc --noEmit` → **0 erros** (exit code 0). *(Nota: a primeira tentativa do teste de identidade de
  referência em `ThemeSidebarContent.test.tsx` — variável `let` module-level reatribuída dentro do mock e
  lida via `?.` no teste — produzia `TS2339: Property 'draft' does not exist on type 'never'`, um efeito
  conhecido de estreitamento de controle de fluxo do TS sobre `let`/propriedade capturada por closure através
  de chamadas de função. Resolvido trocando para um objeto wrapper `const` mais uma leitura para variável
  local antes das asserções — sem `any`, sem suprimir o erro.)*
- `npm run container-query:check` → `[OK]` (0 classes de container query montadas por interpolação — gate
  pedido pelo prompt de correção, não relacionado a este achado, sem regressão).
- `git diff --stat` (escopo de código, excluindo `specs/`) → **10 arquivos**, `318 insertions(+), 40
  deletions(-)` — todos dentro do escopo desta correção (mais os 3 arquivos de `§3.1` já aprovados da rodada
  anterior, que constam no diff cumulativo mas não foram tocados nesta rodada).

### Achados fora do escopo

- **`git status` mostra arquivos em `specs/` que esta execução não tocou:** `specs/00-indice.md`,
  `specs/adr/010-temas-salvos-pelo-usuario.md`, `specs/adr/README.md`,
  `specs/plan/plan-38-salvar-tema-em-runtime.md` (modificados) e `specs/adr/011-tema-salvo-por-uma-porta-de-
  escrita.md` (novo, não rastreado). Nenhum deles foi criado, editado ou lido por esta execução — parecem
  trabalho de outra plan (`plan-38`) em andamento no mesmo worktree. Registro por honestidade de relato
  (R "o resumo tem de bater com o `git diff`"), não como achado desta plan.

### Pendências / riscos

- Nenhuma. Os dois achados do veredito foram corrigidos e verificados com teste específico para cada um.

## Veredito (correção 1) — 2026-08-12 — 🟢 Aprovada

Os dois achados estão fechados, e os dois consertos são melhores do que o prompt pedia.

### Achado 1 — o switch

`ThemeSidebarHeader.tsx` — virou um `input type="checkbox"` real com `role="switch"` e `sr-only`, dentro do
`label`. O `onClick` com `preventDefault` no `label` saiu; agora é `onChange`, e o `label` aciona o controle
nativamente. **Foco, teclado e semântica resolvidos de uma vez**, que era a preferência do prompt.

Dois detalhes que eu não pedi e estão certos:

- **`aria-hidden="true"` na pílula decorativa.** Sem isso, a tecnologia assistiva leria o controle e o
  enfeite como duas coisas. Não estava no prompt.
- **Os dois `label` foram consertados** — o de Essencial/Avançado e o de "Empilhar Previews"
  (`grep -c 'type="checkbox"'` → **2**). O prompt dizia "se servir para os dois, aplique nos dois"; serviu.

**E o teste é o certo.** `userEvent.setup()` + `user.keyboard(' ')` — Espaço de verdade, com foco real. O
prompt não especificou a ferramenta, e `fireEvent.keyDown` teria passado sem provar nada, porque não
reproduz o acionamento nativo do checkbox. Dois casos, um por toggle.

**Conferi a armadilha da `plan-39`, porque `sr-only` é classe nova neste arquivo:** construí o CSS e a regra
`.sr-only` **é gerada** (a classe está literal no `.tsx`, dentro do `@source`). Se não fosse, o checkbox
apareceria cru ao lado da pílula.

### Achado 2 — a fonte única de rascunho

`HyperGranularityTab.tsx` deixou de importar `useDesignDraft`; ganhou `HyperGranularityTabProps` com os seis
membros e o comentário que explica **por quê** — no mesmo formato que a `plan-36` deixou no
`MasterControlPanel`. O `useSarakUI()` que ficou é para outras leituras, não para rascunho.

**O teste prova identidade, não existência:**

```
expect(captured?.draft).toBe(draft);
expect(captured?.updateDraft).toBe(updateDraft);
… (os seis)
```

`toBe` é a asserção certa aqui: prova que é **a mesma instância** do painel, não um objeto equivalente. Um
teste com `toEqual` teria passado com duas instâncias paralelas — que era exatamente o defeito.

### Gates, saída real

| | |
|---|---|
| `npx vitest run` | **313 arquivos / 1278 testes, verde** (era 313/1272) — **+6**, nenhum sumiu |
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `container-query:check` | **[OK]** |
| R9 | `ThemeCustomizationTab` 240 · `HyperGranularityTab` 235 · `ThemeSidebarHeader` 157 · `ThemeSidebarContent` 143 |

### Linhas vermelhas

`git diff --stat` restrito aos três arquivos proibidos: `components_base.json` mostra as **mesmas 28
inserções** da rodada anterior (não foi tocado nesta), e `useDesignDraft.ts` e `useDesignDraftSync.ts`
**não aparecem** — intactos. Nenhum improviso: o threading era mecânico e o executor não precisou usar a
saída de emergência que o prompt oferecia.

### Sobre o "achado fora do escopo" que o executor reportou

Ele registrou que há arquivos em `specs/` modificados no worktree que não são dele — `00-indice.md`, os
ADRs, a `plan-38`. **São meus**, desta mesma sessão: o ADR-011, a reescrita da `plan-38` e o espelho do
índice. Está certo em não tocar e certo em declarar; é a disciplina que evita que um executor "arrume" spec
alheia no meio da execução.

### Fechamento do ciclo 34–39

Com esta aprovação, a leva inteira fecha: **34, 35, 36, 37 e 39 aprovadas**; a **38** desbloqueada e pronta
para execução, com o ADR-011 escrevendo o recorte. Duas das cinco precisaram de rodada de correção, e nos
dois casos o achado veio de **ler o diff perguntando o que mudou de regime** — não de rodar comando. Todos
os comandos passaram nas duas entregas reprovadas.

### Destino da síntese

Declarado na §9, **não executado por mim**: `06-painel-de-customizacao-e-preview.md` §2 ganha a subseção do
modo Essencial/Avançado (`importance`, limiar `>= 80`, `dynamicEssentialTokens`) e a entrada própria do
Command Center. Some-se, agora, que o Command Center **consome o rascunho do painel por prop** — a mesma
regra de fonte única que a `plan-36` fixou. Só por `spec-atualizar`, depois do commit do dono.
