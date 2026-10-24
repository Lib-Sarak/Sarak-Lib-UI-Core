---
tipo: "plan"
titulo: "Recalibrar o teto de peso por tema pela medicao atual"
objetivo: "Fazer o boot:measure voltar a passar com os 19 temas embarcados, com o teto de peso por tema recalibrado para 15 KB por decisao do dono, para a trava continuar pegando inchaco sem barrar a rc.3"
dominio: "Temas / Travas de peso"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "temas", "peso", "boot", "gate", "rc"]
relacionados: ["[[09-temas-e-presets]]", "[[022-tema-sob-demanda]]", "[[01-gates-e-baseline]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md"
---

# 1. Objetivo

`npm run boot:measure` passa com os 19 temas embarcados, o teto de peso por tema é **15 KB gzip**, e o motivo do número está escrito
junto da constante, para a próxima pessoa saber quando ele pode subir de novo e quando um tema está inchando.

# 2. Contexto

- `boot:measure` (`scripts/measure-consumer-boot.mjs`, no `gates:full` e portanto na release) reprova os **19** temas: de 5,8 a
  6,8 KB gzip contra `PER_THEME_CEILING_BYTES = 4.5 * 1024` (`:38`). Medido pelo revisor em 2026-10-24.
- **Não é regressão de uma plan.** O `dist/` do commit anterior à `plan-123` já pesava o mesmo (chunk de `synthwave-retro`: 4.219 B
  gzip no `HEAD`, 4.248 B depois da `plan-123`, +0,7%). Os temas cresceram por decisão de produto: a `plan-110` passou a exigir que todo
  tema declare todo token estético ([[09-temas-e-presets]] §5.3) e a `plan-123` somou os papéis de cor de texto; a `plan-124` ainda vai
  somar os tokens da barra aos 19 temas (estimativa: ~0,5 KB gzip por tema).
- **O peso do tema não é custo de boot:** o boot leva só o tema padrão (§4.3.2); os outros chegam por `import()` quando escolhidos, e o
  tema atual fica na tela até o novo chegar. O teto é trava contra inchaço, não orçamento de desempenho.
- **Decisão do dono (2026-10-24):** aumentar o teto (opção "recalibrar"), não enxugar os temas agora. Enxugar sem perda visual (guardar só
  o que difere do padrão e recompor ao carregar) fica como melhoria possível depois da rc.3.
- **Número (decisão do dono, 2026-10-24): 15 KB.** O revisor propôs 8 KB (maior tema 6,8 KB + ~0,5 KB da `plan-124`) e
  mediu ~12 KB como o limite em que a troca de tema não é sentida em nenhuma rede. O dono escolheu 15 KB: o tema é personalizado
  uma vez e quase não é trocado depois de aplicado, e o peso só pesa no carregamento sob demanda, nunca no uso (o tema do cliente
  volta do design salvo e nem depende do módulo embarcado). Custo aceito: a galeria do painel com os 19 temas a 15 KB levaria ~5,7 s
  no 3G lento (só no painel do administrador). Conteúdo pesado (imagem, SVG de textura, fonte) nunca entra no módulo do tema: vai
  como arquivo próprio, sob demanda.
- A `plan-122` (lote 3) e a `plan-123` estão em correção no mesmo worktree; esta plan não toca nenhum arquivo delas.

# 3. Escopo

## 3.1 Dentro
- `scripts/measure-consumer-boot.mjs` — a constante `PER_THEME_CEILING_BYTES`, o cabeçalho (regra 3 e o limite declarado 2, que supõe
  "um tema volta ao boot ≈ 1–2 KB", hoje falso: com temas de ~6 KB, um tema que volte ao boot também estoura a folga relativa de 3 KB —
  a frase passa a dizer isso).
- O teste do script, se existir; se não existir, nenhum teste novo é exigido (a trava é o próprio script, e a §7 a roda).

## 3.2 Fora
- Os temas (`src/core/Design/presets/themes/**`), a folga relativa (`SLACK_BYTES`), a trava estrutural e qualquer enxugamento.
- `specs/09-temas-e-presets.md` (a síntese é do revisor).
- Arquivos das `plan-122` e `plan-123`. Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/09-temas-e-presets.md` (§4.3.2, §5.3) | o boot só com o tema padrão; o teto por tema e a regra de completude que fez os temas crescerem |
| Spec fixa | `specs/01-gates-e-baseline.md` | como ler e quando mudar uma trava |
| ADR | `adr/022-tema-sob-demanda.md` | por que o peso do tema não pesa no boot |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | escrita |
| Código | `scripts/measure-consumer-boot.mjs` | ler antes de editar |

# 5. Instruções de execução

Um lote; resumo na §9 e status 🟠.

1. `PER_THEME_CEILING_BYTES` passa a 15 KB; um comentário curto junto da constante diz de onde vem o número (decisão do dono: o tema é
   carregado sob demanda e quase não é trocado, nunca pesa no uso; conteúdo pesado não entra no módulo do tema) e
   que subir de novo exige nova medição e decisão — acima dele, enxugar antes.
2. O cabeçalho do script diz 15 KB na regra 3 e corrige o limite declarado 2 (com temas de ~6 KB, um tema que volte ao boot passa da folga
   relativa de 3 KB; a trava estrutural continua sendo a que pega primeiro).
3. Rodar `npm run boot:measure` e colar a saída inteira: os 19 temas abaixo do teto e o boot dentro do teto relativo.

# 6. Critérios de aceite

- [ ] `PER_THEME_CEILING_BYTES` = 15 KB, com o porquê junto da constante.
- [ ] Cabeçalho do script coerente com o número e com o peso real dos temas.
- [ ] `npm run boot:measure` verde, com a saída colada.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — a trava `boot:measure` existente muda de número.

- `npm run boot:measure` → verde, 19 temas abaixo de 15 KB.
- `git diff --stat` → só `scripts/measure-consumer-boot.mjs` (e o teste dele, se houver).

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md`

- **§5.3:** "O peso de cada tema … tem teto de **15 KB**", com uma frase sobre o porquê (todo estético declarado + papéis de cor de texto +
  tokens de barra; o peso do tema não pesa no boot, §4.3.2) e que enxugar sem perda visual é a alternativa se o teto voltar a apertar.

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-24

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```text
 M browser-tests/fixtures/plan-122-preview-mode-entry.tsx
 M browser-tests/login-theme-application.spec.ts
 M browser-tests/plan-122-preview-mode.spec.ts
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-QC54VK7H.js
 D dist/SarakChartEngine-N6TUI3GP.js
 D dist/SarakChatEngine-XKT27WGA.js
 D dist/SarakDataGridImpl-RA3XJBNK.js
 D dist/SarakDataTableImpl-BQAHJ66X.js
 D dist/SarakFlowEngine-FYMR35HB.js
 D dist/SarakKanbanImpl-ARYZHDWB.js
 D dist/SarakMarkdownRendererImpl-XZPG7R3X.js
 D dist/SarakPDFViewerImpl-X2D736W5.js
 D dist/aurora-veil-W6LR5NTA.js
 D dist/blueprint-protocol-ZBH7HH5P.js
 D dist/chunk-47HNXFKM.js
 D dist/chunk-66MZSA46.js
 D dist/chunk-7GQ72JNV.js
 D dist/chunk-A4JAXQLA.js
 D dist/chunk-DKLQG65X.js
 D dist/chunk-NNQIJWOG.js
 D dist/chunk-W7MJBIJ2.js
 D dist/chunk-XLW6RO55.js
 D dist/chunk-YOTK2UHU.js
 D dist/chunk-Z62HSJUU.js
 D dist/corporate-ledger-N52BPYEI.js
 D dist/cyber-retro-wave-NLOQMODW.js
 D dist/cyberpunk-neon-4ITIENOY.js
 D dist/data-terminal-UVILZ2NW.js
 D dist/editorial-ink-OS75Y4CD.js
 D dist/golden-hour-MU4LEJJ2.js
 D dist/high-contrast-OPXSIYMX.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 D dist/industrial-terminal-GP3Q46Y2.js
 D dist/kinetic-flow-DXM24PM3.js
 D dist/minimalist-airy-CMV5754W.js
 D dist/nebula-space-SLMSOJ3D.js
 D dist/neo-brutalism-OYG2OMEW.js
 D dist/neumorphic-mobile-3JPACE67.js
 D dist/organic-clay-POXNPBSF.js
 D dist/playful-pastel-6IP4KGW6.js
 M dist/sarak-scoped.css
 M dist/sarak.css
 M dist/styles/_colors.css
 M dist/styles/_elements.css
 M dist/styles/_theme.css
 D dist/synthwave-retro-DYQELJF2.js
 M docs/component-catalog.json
 M docs/component-catalog.md
 M docs/migracoes.md
 M gates/scripts/audit/__tests__/verify_contrast.test.ts
 M gates/scripts/audit/verify_contrast.ts
 M sarak-dev/GUIA-MANUTENCAO.md
 M sarak-dev/START-HERE.md
 M sarak-dev/state.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M sarak-ui/docs/migracoes.md
 M specs/00-indice.md
 M specs/plan/plan-122-painel-modo-claro-previas-e-selects.md
 M specs/plan/plan-123-hierarquia-de-cor-no-texto.md
 M specs/specs/09-temas-e-presets.md
 M src/buildInfo.ts
 M src/components/Layout/SarakAppChromeMobile.tsx
 M src/components/Layout/chrome/ChromeNotificationsWidget.tsx
 M src/components/Layout/chrome/ChromeSidebarBody.tsx
 M src/components/Layout/chrome/ChromeTopbarBody.tsx
 M src/components/atomic/Atoms/SarakAvatar.tsx
 M src/components/atomic/Atoms/SarakTypography.tsx
 M src/components/atomic/Atoms/__tests__/SarakTypography.test.tsx
 M src/components/atomic/Buttons/SarakSocialButton.tsx
 M src/components/atomic/Cards/SarakActionCard.tsx
 M src/components/atomic/Cards/SarakCardHeader.tsx
 M src/components/atomic/Cards/SarakSearchCard.tsx
 M src/components/atomic/Cards/SarakTitleCard.tsx
 M src/components/atomic/Cards/__tests__/SarakActionCard.test.tsx
 M src/components/atomic/Cards/__tests__/SarakSearchCard.test.tsx
 M src/components/atomic/Cards/__tests__/SarakTitleCard.test.tsx
 M src/components/atomic/Cards/__tests__/__snapshots__/SarakActionCard.test.tsx.snap
 M src/components/atomic/Cards/__tests__/__snapshots__/SarakSearchCard.test.tsx.snap
 M src/components/atomic/Cards/__tests__/__snapshots__/SarakTitleCard.test.tsx.snap
 M src/components/atomic/Cards/__tests__/cardTokensQueDesenham.test.tsx
 M src/components/atomic/DataDisplay/SarakCalendar/CalendarDayCell.tsx
 M src/components/atomic/DataDisplay/SarakCalendar/SarakCalendar.tsx
 M src/components/atomic/DataDisplay/SarakCalendar/__tests__/CalendarDayCell.test.tsx
 M src/components/atomic/DataDisplay/SarakGantt/GanttTimeline.tsx
 M src/components/atomic/DataDisplay/SarakGantt/SarakGantt.tsx
 M src/components/atomic/DataDisplay/SarakGantt/__tests__/GanttTimeline.test.tsx
 M src/components/atomic/DataDisplay/SarakKanban/KanbanCardContent.tsx
 M src/components/atomic/DataDisplay/SarakKanban/KanbanColumn.tsx
 M src/components/atomic/DataDisplay/SarakKanban/__tests__/KanbanColumn.test.tsx
 M src/components/atomic/Feedback/SarakBadge.tsx
 M src/components/atomic/Inputs/internal/SarakSearchDialog.tsx
 M src/components/atomic/Inputs/internal/__tests__/SarakSearchDialog.test.tsx
 M src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx
 M src/components/atomic/Media/SarakMarkdownRenderer/__tests__/SarakMarkdownRendererImpl.test.tsx
 M src/components/atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx
 M src/components/atomic/Modals/SarakModal.tsx
 M src/components/atomic/Modals/__tests__/SarakModal.test.tsx
 M src/components/atomic/Navigation/SarakShellLanguageSelector.tsx
 M src/components/atomic/Navigation/SarakShellSearchWidget.tsx
 M src/components/atomic/Navigation/SarakShellThemeToggle.tsx
 M src/components/atomic/Navigation/SarakShellUserWidget.tsx
 M src/components/atomic/Navigation/__tests__/SarakShellUserWidget.test.tsx
 M src/components/atomic/Navigation/internal/SarakShellSearchResults.tsx
 M src/components/atomic/Navigation/internal/__tests__/SarakShellSearchResults.test.tsx
 M src/components/atomic/Templates/Chat/ChatInput.tsx
 M src/components/atomic/Templates/Chat/MessageBubble.tsx
 M src/components/atomic/Templates/SarakCatalogGrid.tsx
 M src/components/atomic/Templates/SarakChart.tsx
 M src/components/atomic/Templates/SarakHelpButton.tsx
 M src/components/atomic/Templates/__tests__/SarakCatalogGrid.test.tsx
 M src/components/atomic/Templates/__tests__/SarakChart.test.tsx
 M src/components/atomic/Templates/__tests__/__snapshots__/SarakChart.test.tsx.snap
 M src/components/atomic/Templates/components/AuthForm.tsx
 M src/components/atomic/Templates/components/AuthSocialLogin.tsx
 M src/components/atomic/Templates/components/__tests__/AuthForm.test.tsx
 M src/components/atomic/UX/SarakTabs.tsx
 M src/components/atomic/UX/SarakTooltip.tsx
 M src/components/atomic/UX/__tests__/SarakTabs.test.tsx
 M src/components/atomic/UX/__tests__/SarakTooltip.radiusToken.test.tsx
 M src/core/Design/catalog/partitions/cards_engine.json
 M src/core/Design/catalog/partitions/colors_and_atmosphere.json
 M src/core/Design/catalog/partitions/typography.json
 M src/core/Design/catalog/theme_table_mapping.json
 M src/core/Design/hooks/__tests__/useDesignVariables.test.ts
 M src/core/Design/hooks/useDesignVariables.ts
 M src/core/Design/presets/components/cards.ts
 M src/core/Design/presets/components/inputs.ts
 M src/core/Design/presets/themes/__tests__/themeSetCoverage.test.ts
 M src/core/Design/presets/themes/aurora-veil.ts
 M src/core/Design/presets/themes/blueprint-protocol.ts
 M src/core/Design/presets/themes/color-engine.ts
 M src/core/Design/presets/themes/corporate-ledger.ts
 M src/core/Design/presets/themes/cyber-retro-wave.ts
 M src/core/Design/presets/themes/cyberpunk-neon.ts
 M src/core/Design/presets/themes/data-terminal.ts
 M src/core/Design/presets/themes/editorial-ink.ts
 M src/core/Design/presets/themes/golden-hour.ts
 M src/core/Design/presets/themes/high-contrast.ts
 M src/core/Design/presets/themes/industrial-terminal.ts
 M src/core/Design/presets/themes/kinetic-flow.ts
 M src/core/Design/presets/themes/minimalist-airy.ts
 M src/core/Design/presets/themes/nebula-space.ts
 M src/core/Design/presets/themes/neo-brutalism.ts
 M src/core/Design/presets/themes/neumorphic-mobile.ts
 M src/core/Design/presets/themes/organic-clay.ts
 M src/core/Design/presets/themes/playful-pastel.ts
 M src/core/Design/presets/themes/sarak-sovereign.ts
 M src/core/Design/presets/themes/synthwave-retro.ts
 M src/core/Design/schema/__tests__/variableOwners.test.ts
 M src/core/Design/schema/card-title.ts
 M src/core/Design/schema/cards.ts
 M src/core/Design/schema/colors.ts
 M src/core/Design/schema/overlays.ts
 M src/core/Design/schema/typography.ts
 M src/core/Provider/buildInfo.ts
 M src/core/Provider/components/SovereignThemeInjector.tsx
 M src/core/Provider/components/__tests__/SovereignThemeInjector.test.tsx
 M src/core/Provider/generated/design-token-docs.json
 M src/core/Provider/generated/design-token-ids.ts
 M src/core/Provider/utils/__tests__/__snapshots__/consumerThemeContract.test.ts.snap
 M src/core/i18n/catalogEntries.part3.ts
 M src/features/DesignEngine/Canvas/__tests__/panelResponsive.presets.test.ts
 M src/features/DesignEngine/Canvas/components/PresetCard.tsx
 M src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PresetCard.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx
 D src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetCard.test.tsx.snap
 M src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap
 M src/features/DesignEngine/Canvas/panelResponsive.presets.ts
 M src/features/DesignEngine/Main/__tests__/LoginThemeApplication.test.tsx
 M src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx
 M src/features/DesignEngine/Main/components/ThemeActionBar.tsx
 M src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeActionBar.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/__snapshots__/ThemeSidebarContent.test.tsx.snap
 M src/features/DesignEngine/components/controls/LayoutControls.tsx
 M src/features/DesignEngine/components/controls/__tests__/LayoutControls.test.tsx
 M src/styles/_colors.css
 M src/styles/_elements.css
 M src/styles/_theme.css
?? browser-tests/fixtures/plan-123-color-hierarchy-entry.tsx
?? browser-tests/plan-123-color-hierarchy.spec.ts
?? dist/CustomizationPanelImpl-ZYV7Q3ZU.js
?? dist/SarakChartEngine-2UK2O7U4.js
?? dist/SarakChatEngine-BIMJNQNT.js
?? dist/SarakDataGridImpl-VVNFU44B.js
?? dist/SarakDataTableImpl-KDIYI5V6.js
?? dist/SarakFlowEngine-2FTSQRLA.js
?? dist/SarakKanbanImpl-WW24LQIG.js
?? dist/SarakMarkdownRendererImpl-S63BLEXU.js
?? dist/SarakPDFViewerImpl-F4KWDATQ.js
?? dist/aurora-veil-A2QJWPM5.js
?? dist/blueprint-protocol-ST4IDRKF.js
?? dist/chunk-66AFC5NU.js
?? dist/chunk-E4YZX6FM.js
?? dist/chunk-EQZ2YSGP.js
?? dist/chunk-PYSVIDXC.js
?? dist/chunk-S6TGH4GR.js
?? dist/chunk-UOWV6DUI.js
?? dist/chunk-UWRKLLPO.js
?? dist/chunk-VHNHJS73.js
?? dist/chunk-XC44MA7E.js
?? dist/chunk-YCMIYTP6.js
?? dist/corporate-ledger-HI6GCARS.js
?? dist/cyber-retro-wave-4QMV2AMS.js
?? dist/cyberpunk-neon-X4BL7VCH.js
?? dist/data-terminal-H26XHT45.js
?? dist/editorial-ink-HQOSXZJD.js
?? dist/golden-hour-E5Q2RJWV.js
?? dist/high-contrast-IU7CVCND.js
?? dist/industrial-terminal-OOZKMWX7.js
?? dist/kinetic-flow-FIMN5QUR.js
?? dist/minimalist-airy-S7X5RCBA.js
?? dist/nebula-space-Z2E5QUEU.js
?? dist/neo-brutalism-2GTTZAVJ.js
?? dist/neumorphic-mobile-CRVQ5AHP.js
?? dist/organic-clay-QZWG5PYX.js
?? dist/playful-pastel-PQHZKQ3S.js
?? dist/synthwave-retro-7UKYVBTH.js
?? specs/plan/plan-127-teto-de-peso-por-tema-recalibrado.md
```

**O que foi feito**
- `scripts/measure-consumer-boot.mjs:12` — atualizei o cabeçalho para declarar o teto de 15 KB por tema.
- `scripts/measure-consumer-boot.mjs:21-23` — corrigi a descrição da folga de 3 KB: um tema de ~6 KB que volte ao boot excede a folga, e a trava estrutural acende primeiro.
- `scripts/measure-consumer-boot.mjs:38-40` — alterei o limite para `15 * 1024` e registrei a decisão do dono, o carregamento sob demanda, o uso raro, o conteúdo pesado separado e a condição para nova elevação.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `scripts/measure-consumer-boot.mjs` | alterado | Cabeçalho e teto por tema ajustados para 15 KB, com comentário da decisão. |
| `specs/plan/plan-127-teto-de-peso-por-tema-recalibrado.md` | alterado | Status atualizado e resumo acrescentado à §9 conforme autorização. |

**Verificações executadas**
- `npm run boot:measure` → exit 0; saída completa:
```text
boot (src, só o tema padrão + catálogo): 353.9 KB gzip / 1283.7 KB raw (13 pedaço(s))
referência (só o padrão, sem catálogo):  350.7 KB gzip
catálogo leve:                           2.2 KB gzip
teto relativo (ref + catálogo + 3 KB):   355.9 KB gzip
maior tema: synthwave-retro — 6.8 KB gzip (teto 15.0 KB)
[OK] boot do consumidor dentro do teto; nenhum tema fora do padrão no fecho estático.
```
- `git diff --stat -- scripts/measure-consumer-boot.mjs` → 1 arquivo, 7 inserções e 5 remoções.
- `git diff -- scripts/measure-consumer-boot.mjs` → diff completo:
```diff
diff --git a/scripts/measure-consumer-boot.mjs b/scripts/measure-consumer-boot.mjs
index 7cd1b188..64497c6b 100644
--- a/scripts/measure-consumer-boot.mjs
+++ b/scripts/measure-consumer-boot.mjs
@@ -9,7 +9,7 @@
 //      + 3 KB de folga. O teto acompanha o resto da lib: nenhum número congelado.
 //   2. ESTRUTURAL — nenhum módulo de tema ≠ padrão (nem `all.ts`) entre os inputs
 //      dos pedaços do fecho estático, lidos do `metafile` do bundler do consumidor.
-//   3. POR TEMA — cada tema, empacotado sozinho e gzipado, ≤ 4,5 KB.
+//   3. POR TEMA — cada tema, empacotado sozinho e gzipado, ≤ 15 KB.
 //
 // -------------------------------------------------------------------------
@@ -18,9 +18,9 @@
 //    e o delta de tema nele é coberto pela trava estrutural do `dist`
 //    (`check-theme-boot-closure.mjs --dist`). Com `--dist` este script só IMPRIME o
 //    boot do artefato, para o revisor comparar — não o julga.
-// 2. O teto relativo tem 3 KB de folga (decisão do dono): UM tema que volte ao boot
-//    (~1–2 KB gzip) cabe nela. É por isso que a regra 2 existe — a estrutural
-//    acende com um tema só, e o teto relativo acende com vários.
+// 2. O teto relativo tem 3 KB de folga (decisão do dono): com temas de ~6 KB gzip,
+//    UM tema que volte ao boot passa dessa folga. A trava estrutural continua sendo
+//    a que acende primeiro.
 // 3. Um bundler que não seja o esbuild (Vite/Rollup, webpack) pode dividir de outro
 //    jeito; os números absolutos mudam, a ESTRUTURA (quem está no fecho) não.
 // 4. Não executa o app: mede o que é carregado, não o que o navegador pinta.
@@ -35,7 +35,9 @@ import { fileURLToPath } from 'url';
 const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
 const THEMES_DIR = 'src/core/Design/presets/themes';
 export const SLACK_BYTES = 3 * 1024;
-export const PER_THEME_CEILING_BYTES = 4.5 * 1024;
+// Decisão do dono: 15 KB aceita tema sob demanda, quase nunca trocado e sem custo no uso;
+// conteúdo pesado fica em arquivo próprio. Nova alta exige medição e decisão; acima, enxugue.
+export const PER_THEME_CEILING_BYTES = 15 * 1024;
 
 const gzipSize = (content) => zlib.gzipSync(content, { level: 9 }).length;
```

**Critérios de aceite**
- [x] `PER_THEME_CEILING_BYTES` = 15 KB, com a justificativa da decisão do dono junto da constante — evidência: `scripts/measure-consumer-boot.mjs:38-40`.
- [x] Cabeçalho coerente com 15 KB e com o peso real dos temas — evidência: `scripts/measure-consumer-boot.mjs:12,21-23`.
- [x] `npm run boot:measure` verde, com saída registrada — evidência: exit 0, `[OK]`, maior tema medido em 6,8 KB gzip.

**Decisões e suposições**
- Nenhum teste correspondente ao script foi encontrado; não criei teste novo, conforme a §3.1.

**Achados fora do escopo (não corrigidos)**
- As alterações preexistentes da fotografia inicial, incluindo as das plans 122 e 123 e artefatos gerados, foram preservadas.

**Pendências / riscos**
- Nenhuma pendência nesta execução. Não rodei build nem suíte completa; a verificação ficou restrita a `boot:measure` e diff.

---

# 10. Veredito

## Veredito — 2026-10-24 — 🟢 Aprovado; plan concluída

Verificação da §7, rodada pelo revisor:

- `git diff scripts/measure-consumer-boot.mjs` → só o script: `PER_THEME_CEILING_BYTES = 15 * 1024`, com o porquê junto (decisão do
  dono; tema sob demanda, quase nunca trocado, sem custo no uso; conteúdo pesado em arquivo próprio; nova alta exige medição e decisão),
  a regra 3 do cabeçalho em 15 KB e o limite declarado 2 corrigido (com temas de ~6 KB, um tema que volte ao boot passa da folga
  relativa; a trava estrutural acende primeiro).
- `npm run boot:measure` → `[OK]`; maior tema `synthwave-retro` 6,8 KB gzip (teto 15,0 KB); boot 353,9 KB dentro do teto relativo de
  355,9 KB.

Critérios da §6 atendidos. (O título do bloco de resumo vinha com um `+` de diff no início; corrigido pelo revisor para manter a seção.)
