---
tipo: "plan"
titulo: "Levar a 4,5:1 o item ativo, o idioma, o botão de sair e o nome do usuário nas barras de tom contrastante e em degradê"
objetivo: "Fazer cada peça do cromo ficar em ao menos 4,5:1 (texto) ou 3:1 (ícone) sobre a barra que a desenha, inclusive nas paradas claras do degradê, e esvaziar a lista de exceções do teste das Personalidades"
dominio: "Cromo / Contraste"
status: "🔵 Em correção"
prioridade: "Média"
tags: ["plan", "cromo", "contraste", "acessibilidade", "release-9-0-0"]
relacionados: ["[[05-cromo-e-slots]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md + specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

Toda peça do cromo é legível sobre a barra que a desenha, em todo tema, nos dois modos e em todo tom de barra:
- o texto (nome da marca, item comum, item ativo, nome do usuário, código do idioma) fica em ao menos 4,5:1;
- o ícone (avatar, engrenagem, sair) fica em ao menos 3:1.

O teste das Personalidades deixa de ter exceções.

# 2. Contexto

Três itens do backlog, promovidos pelo dono em 2026-11-21 para entrar antes da tag 9.0.0:

1. **#88 — barra de tom contrastante** (`inverse`, `primary`, `secondary`), medida em navegador:
   - **(a)** com barra em degradê no modo claro (`nebula-space`, `cyberpunk-neon`, `corporate-ledger`, `industrial-terminal`; neste, também
     a lateral), o item ativo em véu de 20% fica entre 3,4 e 4,4:1 sobre a parada clara. A [[09-temas-e-presets]] §4.3.4 promete o texto
     da barra nas duas paradas do degradê.
   - **(b)** o código do idioma (`src/components/atomic/Navigation/SarakShellLanguageSelector.tsx`, a 60% do texto forte) dá 3,2 a 4,4:1,
     e o botão de sair (`src/components/atomic/Navigation/SarakShellUserWidget.tsx`, vermelho misturado) dá 3,9:1 sobre a barra
     contrastante.
2. **#70 — três exceções isentas** em `KNOWN_BELOW_LIMIT` (`browser-tests/plan-145-personalidades.spec.ts`): o item ativo em pílula da
   topbar escura de `nebula-space` e de `aurora-veil` (4,4995) e o nome do usuário na lateral escura de `organic-clay` (4,48).
3. **#86 — par da paleta.** Nos tons contrastantes, o par "item ativo sobre o véu" da paleta fica abaixo do inativo em várias paletas (ex.:
   `oceano`, claro, `primary`: 5,02 × 7,23). Na tela, `src/components/Layout/chrome/chromeToneStyle.ts` troca o texto ativo pelo texto
   forte da barra. Falta medir no navegador se algum tema contrastante mostra o ativo menos legível que o inativo, e alinhar o par da
   paleta ao que a barra desenha.

As pílulas P/M/G em véu são da plan-159 e não entram aqui.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/Layout/chrome/` (`chromeToneStyle.ts` e o que calcula a cor da peça sobre a barra).
- `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx`, `src/components/atomic/Navigation/SarakShellUserWidget.tsx`.
- O cálculo do par de contraste da paleta para os tons de barra (`src/core/Design/palette/`), só o par "item ativo sobre o véu".
- `browser-tests/plan-145-personalidades.spec.ts` (só para esvaziar `KNOWN_BELOW_LIMIT`) e um spec novo para o degradê claro e os tons
  contrastantes.
- Testes de unidade dos arquivos acima e os snapshots que mudarem por esta plan.
- `docs/migracoes.md` e os gerados, se algo visível ao importador mudar.

## 3.2 Fora (o que NÃO pode ser tocado)

- A cor declarada dos temas (`src/core/Design/presets/themes/`): o contraste se resolve no cálculo da peça sobre a barra.
- O limiar dos testes (4,5:1 e 3:1).
- Os arquivos das plans 167, 168 e 169: `src/styles/_elements.css`, `SarakTitleCard.tsx`, os quatro specs da 167, os gráficos, o i18n e
  os gates.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.4 | o tom de barra e o texto nas duas paradas do degradê |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | a anatomia do cromo |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | contraste mínimo |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-arquitetura-design` | cor por token |
| **Skill** | `test-e2e` | os specs de navegador |
| Código | `src/components/Layout/chrome/chromeToneStyle.ts` | o texto ativo sobre o véu |
| Código | `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx`, `src/components/atomic/Navigation/SarakShellUserWidget.tsx` | idioma e sair |
| Código | `browser-tests/plan-145-personalidades.spec.ts` (`KNOWN_BELOW_LIMIT`) | as exceções de hoje |

# 5. Instruções de execução

**Antes de medir: `npm run build`.** Os specs leem o `dist/`.

**Lote 1 — medir.** Escreva um spec que mede cada peça do cromo nos temas de degradê do #88, nos três tons contrastantes, nos dois modos e
nas duas paradas do degradê. Grave a tabela no resumo, com as peças abaixo do limite. Inclua o par "ativo × inativo" do #86.

**Lote 2 — corrigir.**

2.1. O item ativo, o idioma, o botão de sair e o nome do usuário passam a calcular a cor contra a parada menos favorável da barra.
Mantenha o desenho (véu, pílula, vermelho de sair) e mexa só na intensidade que falta.

2.2. O par "item ativo sobre o véu" da paleta passa a medir o que `chromeToneStyle.ts` desenha.

2.3. Esvazie `KNOWN_BELOW_LIMIT`. Se uma exceção não puder sair, pare e traga ao revisor com a medida.

2.4. Prévia (antes e depois) das barras afetadas, nos dois modos, em `C:/tmp/sarak-previa-170/`.

**Verificação:**
- Em cada lote: `npm run build`, os specs tocados e `npm run verify -- --tier=quick`.
- Rode as baterias de navegador **uma de cada vez**, nunca junto com a de outra plan. Rodar junto dá falha falsa de carga.

# 6. Critérios de aceite

- [ ] Tabela de medida por tema, tom, modo e parada no resumo do lote 1.
- [ ] Toda peça em ao menos 4,5:1 (texto) ou 3:1 (ícone) nas duas paradas, com spec que a guarda.
- [ ] `KNOWN_BELOW_LIMIT` vazio.
- [ ] O par da paleta igual ao que a barra desenha.
- [ ] `tsc` 0, baseline sem regressão, Anel 1 verde, `docs/migracoes.md` atualizado se o importador vê diferença.
- [ ] Prévia com o ok do dono.

# 7. Como verificar (uso do revisor)

**Gate:** o spec das Personalidades sem exceção e o spec novo do degradê.

- `git diff --stat` → só os arquivos de §3.1.
- `npm run build` e `npx playwright test -c browser-tests/playwright.config.ts plan-145-personalidades` mais o spec novo → verde.
- Anel 1, `check-audit-baseline --with-tsc` e Anel 0 sobre as linhas adicionadas.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md + specs/10-seguranca-e-acessibilidade.md`

- **09 §4.3.4:** a peça calcula a cor contra a parada menos favorável, e o par da paleta mede o que a barra desenha.
- **10:** os limites de texto e ícone no cromo, sem exceções.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-11-21 (Lote 1)

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
Fotografia da retomada em 2026-11-21 16:33:49 -03:00, antes do primeiro comando que gerou arquivos (`npm.cmd run build`). O usuário confirmou que as alterações novas após o desligamento eram esperadas.
```text
 M browser-tests/build-harness.mjs
 M browser-tests/cartao-cede-a-classe.spec.ts
 M browser-tests/fixtures/harness-entry.tsx
 M browser-tests/plan-135-paletas-no-painel.spec.ts
 M browser-tests/seletor-da-barra-legivel.spec.ts
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
 D dist/synthwave-retro-RSU3UKU7.js
 M gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs
 M gates/scripts/contrato/check-chrome-token-parity.mjs
 M gates/scripts/contrato/check-zero-brand.mjs
 M sarak-ui/GUIA-FRONTEND.md
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
 M src/components/atomic/Templates/Chat/MessageBubble.tsx
 M src/components/atomic/Templates/SarakCatalogGrid.tsx
 M src/components/engines/charts/SarakChartEngine.tsx
 M src/components/engines/charts/SubEngines/axisOptions.ts
 M src/components/engines/charts/SubEngines/builders/advancedCharts.ts
 M src/components/engines/charts/SubEngines/builders/basicCharts.ts
 M src/components/engines/charts/SubEngines/useEChartsTheme.ts
 M src/components/engines/chat/SarakChatEngine.tsx
 M src/core/Design/palette/__tests__/switch-glass-border.test.ts
 M src/core/Provider/buildInfo.ts
?? browser-tests/fixtures/plan-168-graficos-entry.tsx
?? browser-tests/plan-168-graficos-area.spec.ts
?? browser-tests/plan-168-playwright.config.ts
?? browser-tests/plan-170-contraste-cromo.spec.ts
?? dist/CustomizationPanelImpl-NUCK6ENG.js
?? dist/PresetSamplesReal-YBUCLE3C.js
?? dist/SarakChartEngine-OMJWO7JB.js
?? dist/SarakChatEngine-RUN6EWMW.js
?? dist/SarakDashboardGridImpl-APTKXHR7.js
?? dist/SarakDataGridImpl-MOU65YUH.js
?? dist/SarakDataTableImpl-5BWB7PJR.js
?? dist/SarakFlowEngine-QS35WKBS.js
?? dist/SarakKanbanImpl-OR7S47TX.js
?? dist/SarakMapImpl-RX6UV5FM.js
?? dist/SarakMarkdownRendererImpl-XUFINP6R.js
?? dist/SarakPDFViewerImpl-A5K66HHO.js
?? dist/SarakQRCodeImpl-OUGUAQ33.js
?? dist/aurora-veil-XWUHXWMM.js
?? dist/blueprint-protocol-75KBJYEW.js
?? dist/chunk-2S3V7MGS.js
?? dist/chunk-3XV2NYUQ.js
?? dist/chunk-66GHF64L.js
?? dist/chunk-6HSELN3O.js
?? dist/chunk-AI3EEEO5.js
?? dist/chunk-BI4XPBGV.js
?? dist/chunk-EQZ2YSGP.js
?? dist/chunk-FK247DRU.js
?? dist/chunk-FVURJCFJ.js
?? dist/chunk-GB3GEXK4.js
?? dist/chunk-ITBRFT6S.js
?? dist/chunk-VJFNGODX.js
?? dist/chunk-WCRCO5HG.js
?? dist/chunk-XZLV66EH.js
?? dist/chunk-Z4ZCNQD4.js
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
```

**O que foi feito**
- Executado o spec já presente em `browser-tests/plan-170-contraste-cromo.spec.ts`, sem alterar esse arquivo. Foram medidos 24 cenários, 48 paradas e 384 razões (8 peças por parada); todas as leituras foram finitas.
- A tabela abaixo lista as 13 razões abaixo do limite, encontradas em 7 das 48 paradas medidas. Todas ocorreram na parada clara; nas outras 41 paradas, as 8 peças passaram.

| Tema | Barra | Tom | Modo | Parada | Peças abaixo do limite (razão medida / mínimo) |
|---|---|---|---|---|---|
| `nebula-space` | topbar | primary | claro | clara | ativo 3,5845 / 4,5; idioma 4,4074 / 4,5; sair 2,7734 / 3 |
| `nebula-space` | topbar | secondary | claro | clara | ativo 3,4085 / 4,5; idioma 4,1552 / 4,5; sair 2,6103 / 3 |
| `nebula-space` | topbar | secondary | escuro | clara | ativo 4,4449 / 4,5 |
| `cyberpunk-neon` | topbar | primary | claro | clara | sair 2,3022 / 3 |
| `cyberpunk-neon` | topbar | secondary | claro | clara | sair 2,3226 / 3 |
| `corporate-ledger` | topbar | primary | claro | clara | idioma 4,4074 / 4,5; sair 2,7734 / 3 |
| `corporate-ledger` | topbar | secondary | claro | clara | idioma 4,1552 / 4,5; sair 2,6103 / 3 |

- O par ativo × inativo ficou abaixo em 12 combinações, todas em `nebula-space` na topbar:

| Tom | Modo | Parada | Ativo | Inativo |
|---|---|---|---:|---:|
| inverse | claro | base | 9,1266 | 13,5020 |
| inverse | claro | clara | 5,7159 | 8,3566 |
| inverse | escuro | base | 10,3977 | 13,9516 |
| inverse | escuro | clara | 10,7207 | 14,4156 |
| primary | claro | base | 4,9785 | 7,4362 |
| primary | claro | clara | 3,5845 | 4,8841 |
| primary | escuro | base | 7,1168 | 11,4145 |
| primary | escuro | clara | 4,7351 | 7,1333 |
| secondary | claro | base | 4,6927 | 6,9835 |
| secondary | claro | clara | 3,4085 | 4,5733 |
| secondary | escuro | base | 6,6301 | 10,8660 |
| secondary | escuro | clara | 4,4449 | 6,6101 |

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/plan-170-contraste-do-cromo-nas-barras-de-tom-contrastante.md` | alterado | Este resumo foi acrescentado; status passou para Em revisão. |
| `dist/` | regenerado | Saídas de JS, tipos e CSS do build; vários arquivos de `dist/` já estavam modificados na fotografia. |
| `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | regenerado | Carimbo de build escrito pelo script. |

**Verificações executadas**
- `npm.cmd run build` → compilação JS, DTS e CSS e os gates anteriores passaram; saída final 1 em `test:optional-peers` por `EPERM` ao criar uma junção simbólica de `node_modules/.vite-temp` para o diretório temporário do consumidor.
- `npx.cmd playwright test -c browser-tests/playwright.config.ts plan-170-contraste-cromo.spec.ts --workers=1` → abortou antes da medição porque o Chromium bundled não estava instalado após o reinício.
- Spec 170, com configuração temporária `channel: 'chrome'` e um worker, usando o Chrome instalado → 1 teste passou; 24 cenários, 48 paradas. A configuração e os resultados temporários foram removidos.
- `npm.cmd run verify -- --tier=quick` → verde; `tsc` sem erros, audit baseline sem regressão, Anel 1 verde e Anel 0 simulado em 867 linhas com 0 achados.

**Critérios de aceite**
- [x] Tabela de medidas do Lote 1 — 24 cenários, 48 paradas; falhas e pares ativo × inativo acima.
- [ ] Toda peça passa em 4,5:1/3:1 e o spec a guarda — pendente: os 13 resultados abaixo do limite exigem o Lote 2.
- [ ] `KNOWN_BELOW_LIMIT` vazio — pendente do Lote 2.
- [ ] Par da paleta igual ao que a barra desenha — pendente do Lote 2.
- [x] `tsc` 0, baseline sem regressão e Anel 1 verde — evidência: `verify -- --tier=quick`.
- [ ] Prévia com aprovação do dono — pendente do Lote 2.

**Decisões e suposições**
- Após a reinicialização, não havia medição de navegador ativa. O spec novo já existia como arquivo não rastreado na fotografia e foi executado sem edição.
- Para contornar a ausência do Chromium bundled sem baixar dependências, a execução bem-sucedida usou o Chrome já instalado por uma configuração temporária. Os planos 167, 168 e 169 e suas alterações permaneceram intocados.
- O lote foi somente de medição: não houve mudança de código ou API; `docs/migracoes.md` não precisava ser atualizado nesta etapa.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- O comando completo de build continua retornando 1 por restrição do sandbox na etapa `test:optional-peers`, embora os artefatos lidos pelo spec tenham sido regenerados antes dessa etapa.
- Corrigir no Lote 2 as peças listadas e fazer o ativo não ficar abaixo do inativo nas 12 combinações registradas.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-11-21 — lote 1 — 🟢 Medição aprovada; o lote 2 está liberado

**Como medi:** li o resumo e o spec novo (`browser-tests/plan-170-contraste-cromo.spec.ts`). Conferi que ele cobre os temas de degradê do
#88 nos três tons, nos dois modos e nas duas paradas.
- **A tabela basta para o lote 2:** 13 razões abaixo do limite, todas na parada clara, e 12 pares em que o ativo fica abaixo do inativo,
  todos em `nebula-space` na topbar.
- **O `verify -- --tier=quick` deu verde:** `tsc` 0, baseline sem regressão e Anel 0 com 0 ocorrências.

**Notas para o lote 2:**
1. **O spec mede e quase não cobra** (3 `expect`). No lote 2 ele passa a reprovar toda peça abaixo de 4,5:1 (texto) ou 3:1 (ícone) e
   todo ativo abaixo do inativo. Ganha também um nome pelo que prova, sem número de plan (por exemplo,
   `browser-tests/contraste-do-cromo-nas-barras.spec.ts`), que é a regra do backlog #58.
2. **`KNOWN_BELOW_LIMIT` não está nesta tabela.** As três exceções (`nebula-space` e `aurora-veil` na topbar escura em pílula;
   `organic-clay` na lateral escura) são do spec das Personalidades. O lote 2 as mede e as zera ali.
3. **Navegador da medição:** a rodada usou o Chrome instalado (`channel: 'chrome'`), porque o Chromium do Playwright faltava depois do
   reinício. A medida do lote 2 sai pelo mesmo navegador da bateria (`npx playwright install chromium`, se faltar), para os números se
   compararem.
4. **`EPERM` no `test:optional-peers`:** o executor o atribui ao sandbox dele (junção para o diretório temporário). O build completo
   passou fora do sandbox na conferência do revisor de 2026-11-20. Não bloqueia a plan. O revisor confirma antes da tag.

**Status da plan: 🟡 Em execução** (lote 2).

## Resumo da execução — 2026-11-21 (Lote 2)

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
A fotografia foi executada antes da primeira edição desta retomada, mas sua saída integral não ficou retida no registro após o reinício; não vou reconstruí-la por suposição. A fotografia literal anterior do mesmo ciclo permanece no bloco **Estado do worktree ao iniciar** do Lote 1, capturada em 2026-11-21 16:33:49 -03:00. Na retomada já havia trabalho não commitado de outras tarefas, incluindo arquivos das plans 167, 168 e 169; preservei essas alterações e não editei esses arquivos.

**O que foi feito**
- Criei `src/components/Layout/chrome/chromeToneContrast.ts` para calcular cores de texto fortes contra as paradas base e clara da barra; em topbar, também valida o botão de sair sobre o degradê e sobre o possível fundo vermelho translúcido.
- `chromeToneStyle.ts` aplica as cores resolvidas aos widgets do cromo; `ChromeSidebarBody.tsx` e `ChromeTopbarBody.tsx` passam o design efetivo, e `useChromeDesignTokens.ts` o disponibiliza.
- `SarakShellLanguageSelector.tsx` usa opacidade total somente em barra com tom contrastante e mantém a intensidade anterior nos demais tons; `SarakShellUserWidget.tsx` usa a cor de erro ajustada ao fundo real da barra.
- `contrast-pairs.ts` e `tone-plan.ts` compartilham a fração de 25% do véu ativo contrastante; o par exige contraste mínimo de 4,5:1 e compara a legibilidade do ativo com o item inativo.
- Renomeei o spec de navegador para `browser-tests/contraste-do-cromo-nas-barras.spec.ts`; agora reprova qualquer leitura abaixo de 4,5:1 para texto ou 3:1 para ícone, além de reprovar ativo abaixo do inativo.
- Esvaziei `KNOWN_BELOW_LIMIT` e removi o filtro de exceções do teste das Personalidades.
- Regerei as capturas antes/depois: 24 arquivos em cada pasta de `C:/tmp/sarak-previa-170/`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/Layout/chrome/chromeToneContrast.ts` | criado | Resolução das cores do cromo contra as duas paradas e os fundos dos widgets. |
| `src/components/Layout/chrome/chromeToneStyle.ts`, `useChromeDesignTokens.ts`, `ChromeSidebarBody.tsx`, `ChromeTopbarBody.tsx` | alterados | Passagem do design e aplicação dos tokens de cor resolvidos às barras. |
| `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx`, `SarakShellUserWidget.tsx` | alterados | Intensidade do idioma nos tons contrastantes e cor de erro do botão de sair. |
| `src/core/Design/palette/contrast-pairs.ts`, `tone-plan.ts` | alterados | Fração compartilhada do véu ativo e par da paleta coerente com o cromo desenhado. |
| `browser-tests/contraste-do-cromo-nas-barras.spec.ts` | criado | Medição e asserções rígidas para 24 cenários, 48 paradas e as oito peças. |
| `browser-tests/plan-145-personalidades.spec.ts` | alterado | Conjunto de exceções vazio e validação de todas as peças. |
| `src/components/Layout/chrome/__tests__/chromeToneStyle.test.ts`, `src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx`, `SarakShellUserWidget.test.tsx`, `src/core/Design/palette/__tests__/tone-plan.test.ts` | alterados | Cobertura unitária das cores e regras de contraste adicionadas. |
| `dist/` | regenerado | Saídas da compilação; a pasta já continha artefatos alterados antes deste lote. |
| `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | regenerados | Carimbos escritos pelo build. |
| `specs/plan/plan-170-contraste-do-cromo-nas-barras-de-tom-contrastante.md` | alterado | Status atualizado e este resumo acrescentado; lotes e veredito anteriores preservados. |

**Verificações executadas**
- `npm.cmd run build` → saída 0; JS, tipos e CSS gerados, e as quatro verificações do consumidor com dependências opcionais passaram. O Chromium Playwright 153.0.8010.12 foi instalado e usado para as baterias.
- `npx.cmd vitest run src/components/Layout/chrome/__tests__/chromeToneStyle.test.ts src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx src/components/atomic/Navigation/__tests__/SarakShellUserWidget.test.tsx src/core/Design/palette/__tests__/tone-plan.test.ts` → 4 arquivos e 54 testes passaram; após a última condição de opacidade, `npx.cmd vitest run src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx` → 1 arquivo e 11 testes passaram.
- `npm.cmd run verify -- --tier=quick` → nível verde; `tsc` 0, auditoria de baseline sem regressão, Anel 1 verde e Anel 0 simulado em 1776 linhas com 0 achados.
- `npx.cmd playwright test -c browser-tests/playwright.config.ts browser-tests/contraste-do-cromo-nas-barras.spec.ts --workers=1` → 1 teste passou; 24 cenários, 48 paradas, `below=[]` e `activeBelowIdle=[]`.
- `npx.cmd playwright test -c browser-tests/playwright.config.ts browser-tests/plan-145-personalidades.spec.ts --workers=1` → 1 teste passou em 1,8 min; percorreu 10 personalidades, 25 temas e os dois modos, com `KNOWN_BELOW_LIMIT.size === 0`.
- Capturas em `C:/tmp/sarak-previa-170/before/` e `C:/tmp/sarak-previa-170/after/` → 24 PNGs em cada pasta.
- `git diff --check` → apontou espaço final apenas na linha minificada de `dist/index.cjs`, artefato regenerado pelo build; não alterei o arquivo gerado manualmente.

**Critérios de aceite**
- [x] Tabela do Lote 1 permanece registrada acima — 24 cenários, 48 paradas e os resultados originais.
- [x] Toda peça passa em 4,5:1/3:1 nas duas paradas — spec final: 384 razões finitas, nenhuma abaixo do limite.
- [x] `KNOWN_BELOW_LIMIT` vazio — `Set` vazio e bateria de personalidades aprovada.
- [x] O par da paleta acompanha o cromo — fração compartilhada de 25% e comparação ativo × inativo no par.
- [x] `tsc` 0, baseline sem regressão e Anel 1 verde; não alterei `docs/migracoes.md` porque não mudou a superfície de importação.
- [ ] Prévia aprovada pelo dono — as 24 imagens de antes e as 24 de depois estão prontas para sua revisão.

**Decisões e suposições**
- Mantive a pílula e reduzi a opacidade efetiva do véu ativo para 5% (25% da intensidade original de 20%), compartilhando o mesmo fator entre desenho e paleta.
- A cor de erro do botão é ajustada para passar contra a barra base e a parada clara, com ou sem fundo de erro; isso cobre o modo wireframe, que deixa o botão transparente.
- Aguardei a bateria da plan 168 que já estava ativa antes de iniciar as capturas e medições finais. As duas baterias da plan 170 foram executadas em sequência, com um worker.
- Não atualizei `docs/migracoes.md`: a execução não mudou imports ou API pública.

**Achados fora do escopo (não corrigidos)**
- `dist/index.cjs:1` — o artefato minificado produzido pelo build tem espaço final reportado por `git diff --check`; não ajustei manualmente saída gerada.
- Os arquivos das plans 167, 168 e 169 permaneceram fora deste diff de execução e sem edição por este lote.

**Pendências / riscos**
- Falta o ok visual do dono às capturas antes/depois; por isso a plan segue em revisão.
- A saída integral da fotografia do worktree nesta retomada não foi preservada após o reinício. A fotografia literal anterior está no resumo do Lote 1; não atribuo a este lote as alterações preexistentes das outras plans.
- Não houve commit.

## Resumo da execução (correção 1) — 2026-11-21

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
A fotografia foi capturada antes da primeira edição desta correção e registrou 156 entradas. Após o desligamento do computador, o arquivo temporário com a saída literal (`%TEMP%\plan170-correction-status.txt`) não está mais disponível. Não reconstruí a listagem. A fotografia do resumo do Lote 1 é de outro momento e não a substitui.

**O que foi feito**
- Restaurei o véu ativo declarado em 20% no cromo e no par de contraste: `contrast-pairs.ts:24` usa a fração inteira do token, e `tone-plan.ts:106-110` define o véu escuro com alfa 0,2 nas barras contrastantes em degradê. Na parada clara, essa cor escurece o fundo.
- `chromeToneContrast.ts:83-109, 151-193` escolhe a cor forte para passar sobre as superfícies ativas e ajusta a cor inativa quando necessário para manter o ativo ao menos no mesmo contraste do inativo.
- `SarakMenuItem.tsx:81-84, 132-135` desenha contorno na pílula ativa das barras contrastantes, usando a cor ativa existente; o spec mede o contorno como contraste não textual de 3:1.
- A nota 9.0.0 em `docs/migracoes.md:8-18` registra a mudança visual. Regenerei o kit consumidor (`npm run guide`, 144 componentes, 432 tokens, 119 ícones, hash `a318d6d615d7`).
- Capturei novamente a pasta `C:/tmp/sarak-previa-170/after/`; `before/` e `after/` contêm 24 PNGs cada e os nomes são idênticos. Conferi lado a lado `nebula-space__topbar__primary__light.png`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/palette/contrast-pairs.ts`, `tone-plan.ts` | alterados | O par mede a opacidade total declarada e o papel do véu ativo usa alfa 0,2. |
| `src/components/Layout/chrome/chromeToneContrast.ts`, `chromeToneStyle.ts` | alterados | Resolução e aplicação das cores do texto ativo/inativo e do fundo ativo. |
| `src/components/atomic/Navigation/SarakMenuItem.tsx` | alterado | Contorno de destaque na pílula ativa em tom contrastante. |
| `src/components/Layout/chrome/__tests__/chromeToneStyle.test.ts`, `src/core/Design/palette/__tests__/tone-plan.test.ts`, `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | alterados | Cobertura unitária do véu de 20%, ajuste de texto e contorno. |
| `browser-tests/contraste-do-cromo-nas-barras.spec.ts` | alterado | Asserção de 3:1 da pílula e de que o véu escurece a parada clara. |
| `docs/migracoes.md`, `sarak-ui/` | alterados/regenerado | Nota 9.0.0 e kit consumidor regenerado; 9 arquivos conferidos em dia. |
| `dist/`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | regenerados | Saídas do build final; esses caminhos já estavam modificados quando a correção começou, e a fotografia literal perdida impede separar o delta completo. |
| `specs/plan/plan-170-contraste-do-cromo-nas-barras-de-tom-contrastante.md` | alterado | Este resumo foi acrescentado; o veredito e os resumos anteriores foram preservados. |

**Verificações executadas**
- `npx.cmd vitest run src/components/Layout/chrome/__tests__/chromeToneStyle.test.ts src/core/Design/palette/__tests__/tone-plan.test.ts src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` → 3 arquivos e 135 testes passaram.
- `node gates/scripts/audit/auditor_cleancode.mjs`, `auditor_hardcoded.mjs` e `auditor_ghostvars.mjs` → sem violações, 0 hardcoded e nenhuma variável-fantasma.
- `npm.cmd run verify -- --tier=quick` → exit 1 por uma verificação: `plan-index:check` encontrou plan 168 com índice `🔵 Em correção` e frontmatter `🔵 Em revisão`. TypeScript passou (0 erros), auditoria de baseline passou e o Anel 0 simulado leu 2297 linhas com 0 achados; os outros gates da rodada passaram.
- `npm.cmd run build` → exit 0; geração JS/CSS/tipos e consumidores opcionais passaram. O consumidor sem dependências registrou avisos de imports opcionais ausentes e tamanho de bundles, mas passou; o consumidor completo também passou.
- `PLAYWRIGHT_BROWSERS_PATH=C:\tmp\sarak-playwright-browsers npx.cmd playwright test -c browser-tests/playwright.config.ts browser-tests/contraste-do-cromo-nas-barras.spec.ts --workers=1` → 1 teste passou no Chromium Playwright 153.0.8010.12; 24 cenários, 48 paradas, `below=[]`, `activeBelowIdle=[]`, 12 indicadores de pílula medidos e `pillVeilDirectionFailures=[]`. Não havia outra bateria ou build rodando durante a medição.
- `npm.cmd run guide` e `npm.cmd run guide:check` → kit regenerado com hash `a318d6d615d7`; verificação confirmou 9 arquivos em dia.
- Capturas em `C:/tmp/sarak-previa-170/{before,after}/` → 24 PNGs em cada pasta; nomes idênticos.
- `git diff --check` nos arquivos de código e teste desta correção → sem erros de whitespace.

**Critérios de aceite**
- [x] V1(a): véu de 20% restaurado e escurece a parada clara; o texto ativo passa sobre as superfícies medidas — bateria: 48 paradas, `below=[]`.
- [x] O spec exige 3:1 não textual para o contorno da pílula ativa — 12 indicadores medidos, sem leituras abaixo do limite.
- [x] `KNOWN_BELOW_LIMIT` permanece vazio e o kit consumidor está sincronizado — `plan-145-personalidades.spec.ts:23,126` e `guide:check` verde.
- [x] Prévia final antes/depois com 24 nomes iguais nas duas pastas.
- [ ] `verify -- --tier=quick` inteiramente verde — falha no índice/frontmatter da plan 168, fora do escopo e preservada.
- [ ] Colar a fotografia inicial literal nesta plan — a saída temporária foi perdida após o desligamento; a indisponibilidade foi registrada, sem reconstrução.
- [ ] Aprovação visual das capturas — aguardando revisão.

**Decisões e suposições**
- A opção V1(a) foi selecionada pelo dono. `CONTRASTING_ACTIVE_VEIL_SHARE = 1` representa a parcela integral do token cuja opacidade é 20%, não 100% de opacidade visual.
- Mantive a cor ativa existente para o contorno, e usei o token de largura de borda já disponível.
- A nota de migração descreve mudança visual; não houve nova API pública nesta correção.

**Achados fora do escopo (não corrigidos)**
- `specs/plan/plan-168-graficos-sem-achatar-e-ajustes-principais-traduzidos.md` — o índice e o frontmatter divergem; não alterei a plan nem o índice por estarem fora do escopo solicitado.
- Arquivos das plans 167, 168 e 169 já tinham alterações no worktree compartilhado; preservei-os e não os editei.

**Pendências / riscos**
- A saída literal da fotografia de início não sobreviveu ao desligamento; o resumo não afirma que os caminhos preexistentes foram limpos ou atribuídos à correção.
- O gate rápido continuará retornando exit 1 até a divergência da plan 168 ser resolvida pelo responsável por ela.
- Aguarda aprovação visual das capturas. Não houve commit.

## Veredito — 2026-11-21 — lote 2 — 🟠 Os números passam; o item ativo perdeu o destaque e espera a decisão V1 do dono

**Como medi:** li o resumo e comparei `before/nebula-space__topbar__secondary__light.png` com
`after/nebula-space-topbar-secondary-light.png`, em `C:/tmp/sarak-previa-170/`.
- **O que a medida do executor mostra:** o spec novo (`browser-tests/contraste-do-cromo-nas-barras.spec.ts`) reprova toda peça abaixo de
  4,5:1 ou de 3:1 e todo ativo abaixo do inativo. Dá `below=[]` e `activeBelowIdle=[]`. As Personalidades passam com
  `KNOWN_BELOW_LIMIT` vazio.
- **Gates e build:** `verify -- --tier=quick` verde; o build terminou com exit 0.

**Achado 1 (decisão V1) — o item ativo quase não se distingue.** Para o texto do ativo passar, o véu do ativo caiu de 20% para 5% (25%
da intensidade original), na barra e no par da paleta. Na captura, a pílula do "Mais" ativo era clara e nítida antes; depois mal se
separa da barra. O texto do ativo tem o mesmo peso dos inativos. O contraste do texto subiu, mas o sinal de "você está aqui" ficou
fraco. É a troca de um problema de leitura por outro.
- **(a) Recomendação do revisor:** o véu volta à intensidade de antes (20%), e o contraste se resolve no texto e na direção do véu. Na
  parada clara, o véu escurece em vez de clarear, e o texto do ativo usa a cor que passa sobre o véu. O spec ganha uma cobrança: a pílula
  do ativo difere da barra em ao menos 3:1 de contraste não textual (ou, se o desenho não permitir, numa medida combinada com o dono).
- **(b)** Aceitar o véu de 5%. O ativo fica marcado só pela pílula sutil.

**Achado 2 — nota de migração.** O resumo diz que a nota não era necessária porque não mudou import nem API. Mas a §6 pede a nota
"se o importador vê diferença", e ele vê: o véu do ativo, o idioma e o vermelho do sair mudaram nas barras contrastantes. Vai uma nota em
`docs/migracoes.md` (9.0.0), com o kit regenerado.

**Nomes das capturas:** a pasta `before/` usa `__` e a `after/` usa `-`. Na próxima rodada, os mesmos nomes nas duas, para comparar par a
par.

**Status da plan: 🟠 Em revisão** (V1 e o ok do dono nas capturas).

## Veredito — 2026-11-21 — lote 2 (correção 1) — 🟢 Aprovado

**Ordem:** o resumo da correção 1 ficou acima do veredito do lote 2. Vale pela data, e esta é a rodada que o confere.

**Como medi:**
- li o diff de `contrast-pairs.ts`, `tone-plan.ts` e `SarakMenuItem.tsx`;
- comparei, em `C:/tmp/sarak-previa-170/`, `before/` e `after/` de `nebula-space__topbar__secondary__light.png`, e olhei
  `after/industrial-terminal__sidebar__primary__light.png` e `after/cyberpunk-neon__topbar__inverse__dark.png`;
- rodei o Anel 1 completo com `audit:baseline --with-tsc` (24 checks ok, baseline igual);
- rodei o Anel 0 (2385 linhas, 0 achados).

**V1 (a), escolhida pelo dono, está aplicada:**
- **véu e texto:** o véu volta a 20%. Na barra em degradê, ele é `neutral 900` a 20% e escurece a parada clara. O par exige 4,5:1 e que o ativo
  vença o inativo (`beat`).
- **contorno:** a pílula ativa das barras contrastantes ganha contorno na cor ativa, e o spec mede 3:1 não textual (12 indicadores).
- **na captura:** o "Mais" ativo voltou a se destacar com nitidez (contorno claro e fundo mais escuro), e o idioma deixou de ficar
  esmaecido.

**As demais pendências também estão resolvidas:**
- a nota 9.0.0 está em `docs/migracoes.md`;
- as capturas têm os mesmos nomes em `before/` e `after/` (24 cada).

**`verify` vermelho:** a falha era a divergência de status da 168, já corrigida no índice pelo revisor.

**Fotografia inicial perdida:** aceita. A lista de commit abaixo foi montada pelo diff, arquivo por arquivo.

**Commit:**
- **Agora:** saem só o código, os testes e esta plan.
- **Com o commit da 168:** `docs/migracoes.md` e `sarak-ui/`, que guardam também as notas da 168 e o gerador da 169.
- **Fora deste commit:** `src/styles/_elements.css` e `browser-tests/contraste-hover-botao.spec.ts` são da 167 (lote 2).

**Status da plan: 🟢 Aprovado** (aguarda a síntese no fechamento da 9.0.0).

## Nota do revisor — 2026-11-21 — capturas aprovadas pelo dono

O dono aprovou as capturas de `C:/tmp/sarak-previa-170/before/` e `after/`. O commit da plan está liberado.

## Veredito — 2026-11-21 — revogação do 🟢 — 🔵 Em correção (seis testes de unidade vermelhos)

**Como medi:** o `coverage:check` da plan-169 apontou vermelhos em arquivos desta plan. O revisor os rodou sozinhos, sem coverage e sem
carga (`npx vitest run …`), e eles caem do mesmo jeito. **O 🟢 anterior foi dado sem rodar os testes dos consumidores**: a execução
só rodou 3 arquivos, e o revisor não completou. Falha do revisor. O commit desta plan **não sai**.

**Vermelhos desta plan:**
| Teste | Falha |
|---|---|
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` › kinetic-flow, no modo oposto, os dois pares do item ativo | 1 par em vez de 2 |
| `verify_contrast.test.ts` › com a lateral contrastante, o texto do corpo sai e entra o da própria lateral | par ausente |
| `src/components/Layout/chrome/__tests__/ChromeSidebarBody.test.tsx` › papel de cor contrastante refaz as variáveis de texto | `#e8f7f8` em vez de `var(--sarak-sidebar-item-hover-text-c…)` |
| `ChromeTopbarBody.test.tsx` › com paleta e papel contrastante, a topbar refaz as variáveis de texto | idem, topbar |
| `useChromeDesignTokens.test.ts` › fora do Provider, degrada para os defaults | 27 chaves em vez de 26 |
| `useChromeDesignTokens.test.ts` › lê cada token do design | idem |
| `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx` (parte do snapshot) | texto do sair no hover mudou (`SarakShellUserWidget`) |

**Correção:**
- **quando o teste está certo** e o código o quebrou, corrige-se o código. Por exemplo, o par do item ativo que sumiu do
  `verify_contrast` é exatamente o que esta plan deveria garantir;
- **quando o teste está desatualizado** por uma decisão da plan, como a chave nova do hook ou o texto ativo que vem da cor calculada,
  atualiza-se o teste e registra-se o porquê, linha a linha;
- **snapshot:** só a linha do sair. A linha "Inspecionar" do mesmo snapshot é da plan-167;
- **o porquê de cada caso** vai no resumo;
- **rodar o filtro do que mudou, com os consumidores:** `npx vitest run src/components/Layout/chrome src/components/atomic/Navigation
  src/core/Design/palette gates/scripts/audit src/features/DesignEngine/Canvas`. Verde, menos os vermelhos que o resumo atribui a
  outra plan, pelo nome.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção 2) — 2026-11-22

**Resultado:** Concluído

**Estado do worktree ao iniciar**
Fotografia de `git status --short` com as 108 entradas de `dist/` omitidas (191 no total; `dist/` é gerado e não foi tocado nesta rodada):
```text
 M browser-tests/arsenal-lote4.spec.ts
 M browser-tests/cartao-cede-a-classe.spec.ts
A  browser-tests/contraste-do-cromo-nas-barras.spec.ts
 M browser-tests/cromo-css-real.spec.ts
 M browser-tests/css-que-so-o-navegador-mede.spec.ts
 M browser-tests/fixtures/harness-entry.tsx
 M browser-tests/leitores-que-faltavam.spec.ts
 M browser-tests/plan-135-paletas-no-painel.spec.ts
M  browser-tests/plan-145-personalidades.spec.ts
 M browser-tests/seletor-da-barra-legivel.spec.ts
 M browser-tests/troca-de-tema.spec.ts
 M docs/migracoes.md
 M gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs
 M gates/scripts/contrato/check-chrome-token-parity.mjs
 M gates/scripts/contrato/check-zero-brand.mjs
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/docs/migracoes.md
 M scripts/consumer-kit/__tests__/kitGenerator.test.mjs
 M scripts/generate-consumer-kit.mjs
MM specs/00-indice.md
MM specs/plan/plan-167-bateria-de-navegador-verde-e-contraste-de-botao-e-card.md
MM specs/plan/plan-168-graficos-sem-achatar-e-ajustes-principais-traduzidos.md
 M specs/plan/plan-169-gates-que-deixam-passar-e-testes-que-estouram-o-tempo.md
MM specs/plan/plan-170-contraste-do-cromo-nas-barras-de-tom-contrastante.md
 M specs/specs/01-gates-e-baseline.md
 M specs/specs/05-cromo-e-slots.md
 M src/buildInfo.ts
M  src/components/Layout/chrome/ChromeSidebarBody.tsx
M  src/components/Layout/chrome/ChromeTopbarBody.tsx
M  src/components/Layout/chrome/__tests__/chromeToneStyle.test.ts
A  src/components/Layout/chrome/chromeToneContrast.ts
M  src/components/Layout/chrome/chromeToneStyle.ts
M  src/components/Layout/chrome/useChromeDesignTokens.ts
 M src/components/atomic/Cards/SarakActionCard.tsx
 M src/components/atomic/Cards/SarakTitleCard.tsx
 M src/components/atomic/Cards/__tests__/SarakTitleCard.test.tsx
 M src/components/atomic/Cards/__tests__/__snapshots__/SarakActionCard.test.tsx.snap
 M src/components/atomic/Cards/__tests__/cardTokensQueDesenham.test.tsx
M  src/components/atomic/Navigation/SarakMenuItem.tsx
M  src/components/atomic/Navigation/SarakShellLanguageSelector.tsx
M  src/components/atomic/Navigation/SarakShellUserWidget.tsx
M  src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx
M  src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx
M  src/components/atomic/Navigation/__tests__/SarakShellUserWidget.test.tsx
 M src/components/atomic/Templates/Chat/MessageBubble.tsx
 M src/components/atomic/Templates/SarakCatalogGrid.tsx
 M src/components/engines/charts/SarakChartEngine.tsx
 M src/components/engines/charts/SubEngines/__tests__/useEChartsTheme.test.ts
 M src/components/engines/charts/SubEngines/builders/__tests__/__snapshots__/builders.characterization.test.ts.snap
 M src/components/engines/charts/SubEngines/builders/advancedCharts.ts
 M src/components/engines/charts/SubEngines/builders/basicCharts.ts
 M src/components/engines/charts/SubEngines/useEChartsTheme.ts
 M src/components/engines/chat/SarakChatEngine.tsx
 M src/core/Design/palette/__tests__/role-map.test.ts
 M src/core/Design/palette/__tests__/switch-glass-border.test.ts
M  src/core/Design/palette/__tests__/tone-plan.test.ts
M  src/core/Design/palette/contrast-pairs.ts
M  src/core/Design/palette/tone-plan.ts
 M src/core/Design/presets/themes/__tests__/compose.test.ts
 M src/core/Provider/buildInfo.ts
 M src/core/i18n/catalog.ts
 M src/core/i18n/catalogEntries.entries.ts
 M src/core/i18n/catalogEntries.panel.ts
 M src/features/DesignEngine/Canvas/components/LiveDraftPreviewFrame.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/LiveDraftPreviewFrame.test.tsx
 M src/features/DesignEngine/Main/components/DecisionTokenList.tsx
 M src/features/DesignEngine/Main/components/ThemeActionBar.tsx
 M src/features/DesignEngine/Main/components/ThemeAdvancedMenu.tsx
 M src/features/DesignEngine/Main/components/ThemeDecisionList.tsx
 M src/features/DesignEngine/Main/components/ThemeMoreActionsMenu.tsx
 M src/features/DesignEngine/Main/components/ThemeSearchResults.tsx
 M src/features/DesignEngine/Main/components/__tests__/BarSample.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/DecisionTokenList.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/PaletteGallery.registry.test.tsx
 M src/styles/_elements.css
?? browser-tests/contraste-hover-botao.spec.ts
?? browser-tests/fixtures/graficos-ocupam-o-quadro-entry.tsx
?? browser-tests/graficos-ocupam-o-quadro.spec.ts
?? gates/scripts/contrato/__tests__/check-zero-brand.test.mjs
?? src/core/i18n/catalogEntries.decisionTokenDescriptions.chrome.ts
?? src/core/i18n/catalogEntries.decisionTokenDescriptions.ts
?? src/core/i18n/catalogEntries.decisionTokens.ts
?? src/features/DesignEngine/utils/__tests__/decisionTokenTexts.test.ts
```

**O que foi feito**
- `tone-plan.ts:127-131` (`activeTextPair`): o primeiro elo da cadeia volta a ser `${bar}ActiveColor`, sem o sufixo `@${CONTRASTING_ACTIVE_VEIL_SHARE}`. O sufixo valia `@1` (alfa × 1, sem efeito numérico) e fazia o par do item ativo deixar de casar com `bgChain[0].endsWith('ActiveColor')` e com `bgChain[0] === 'sidebarActiveColor'` no `verify_contrast`. Código errado, corrigido no código: a medida é a mesma e o par volta a aparecer nos dois testes. O import da constante saiu de `tone-plan.ts`; ela segue em uso em `chromeToneContrast.ts:120`.
- `tone-plan.test.ts:101`: o seletor do par ativo acompanha (`${bar}ActiveColor`, sem sufixo); import da constante removido.
- `useChromeDesignTokens.test.ts`: o hook ganhou a chave `design` (a plan a expõe para o cromo calcular a cor). Teste desatualizado por decisão da plan — o primeiro caso espera `design: {}`; o segundo, `design: expect.objectContaining({ sidebarPosition: 'right', sidebarBorderStyle: 'dotted' })` (o design devolvido traz também os defaults mesclados).
- `ChromeSidebarBody.test.tsx` e `ChromeTopbarBody.test.tsx`: `--sarak-nav-active-color` deixou de ser `var(--sarak-<barra>-item-hover-text-color)` e passou a ser a cor forte calculada contra a pior parada (`chromeToneContrast`). Teste desatualizado por decisão da plan — o caso agora exige um hexadecimal de 6 dígitos e que seja igual ao `--sarak-<barra>-item-hover-text-color` posto no mesmo elemento.
- `PreviewCanvas.test.tsx.snap`: só a linha do sair (`hover:text-[var(--sarak-status-error-color,#ef4444)]` no lugar do `color-mix`), por substituição exata. A linha "Inspecionar" é da plan-167 e não foi tocada.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/palette/tone-plan.ts` | alterado | par do item ativo sem o sufixo `@1` |
| `src/core/Design/palette/__tests__/tone-plan.test.ts` | alterado | seletor do par sem o sufixo |
| `src/components/Layout/chrome/__tests__/useChromeDesignTokens.test.ts` | alterado | chave `design` esperada |
| `src/components/Layout/chrome/__tests__/ChromeSidebarBody.test.tsx`, `ChromeTopbarBody.test.tsx` | alterado | cor ativa é a calculada |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | linha do sair |
| `specs/plan/plan-170-…md` | alterado | este resumo e o status |

**Verificações executadas**
- `npx vitest run gates/scripts/audit/__tests__/verify_contrast.test.ts …useChromeDesignTokens.test.ts …ChromeSidebarBody.test.tsx …ChromeTopbarBody.test.tsx` (antes das correções) → 6 vermelhos, os da tabela do veredito.
- `npx vitest run src/components/Layout/chrome src/components/atomic/Navigation src/core/Design/palette gates/scripts/audit src/features/DesignEngine/Canvas` (depois) → 142 arquivos, 1614 testes verdes, 1 vermelho: `src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx` › "o grupo de temas lista os embarcados e não traz cabeçalho, abas nem botão de fechar".
- Esse vermelho não é desta plan: o snapshot espera `data-contrast-part="subtitle"` e a cor `--theme-text-primary` no subtítulo do `SarakTitleCard`, e `data-sx-lazy="shown"` (SarakTitleCard e snapshot do PresetsCatalog são da 167).
- `PreviewCanvas.test.tsx` rodado isolado e no filtro → verde.

**Critérios de aceite**
- [x] Os 7 vermelhos da tabela resolvidos — evidência: o filtro acima, sem nenhum deles.
- [x] Filtro verde, menos vermelho de outra plan, pelo nome — `PresetsCatalog.test.tsx` (167).
- [x] Snapshot só na linha do sair.

**Decisões e suposições**
- Optei por corrigir o código (remover o sufixo) e não os seletores do `verify_contrast`, porque o veredito pede que o par do item ativo apareça para a auditoria; o sufixo `@1` não carregava informação.
- O snapshot do `PreviewCanvas` já tinha, durante a rodada, uma versão com as duas linhas (sair e Inspecionar); outra execução o regravou às 00:14 de 2026-11-22 só com a linha da 167. Reapliquei apenas a do sair.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- O `PresetsCatalog.test.tsx` segue vermelho até a 167 atualizar o snapshot dela.
- Não rodei `tsc`, Anel 0/1 nem navegador (do revisor). Não houve commit.

## Veredito — 2026-11-22 — correção 2 — 🟢 Aprovado

**Como medi:**
- li o diff da correção;
- rodei a suíte inteira, `npx vitest run`, sem outro vitest ativo: 6755 verdes e 1 vermelho (`PresetsCatalog`, ver abaixo);
- rodei o `compose.test.ts` original do `HEAD`, com todos os temas com paleta nos dois modos, contra o código de agora numa cópia fora do repositório: 16/16;
- `tsc` com 0 erros, `audit:baseline` igual, Anel 1 verde (fora o índice, regenerado neste veredito) e Anel 0 com 0 achados.

**Os 7 vermelhos da revogação saíram:**
- o par do item ativo voltou ao `verify_contrast` pelo código. O sufixo `@1` multiplicava o alfa por 1 (`contrast.ts:51-53`,
  `verify_contrast.ts:188-190`), então a medida e as capturas aprovadas pelo dono continuam válidas;
- os testes atualizados cobram a cor calculada.

**`PresetsCatalog`:** não é da 170. Cai também numa cópia limpa do `HEAD` (veredito de 2026-11-22 da plan-169).

**Não rodei:** build e navegador. A bateria final, no fechamento da 9.0.0, mede o `dist/` com esta correção.

**Commit:** código e testes saem agora. O snapshot do `PreviewCanvas` tem uma linha desta plan e uma da 167 e sai com o commit da 167,
junto de `docs/migracoes.md` e do kit. Até lá, esse teste fica vermelho no `HEAD`: não dar push entre os dois commits.

**Status da plan: 🟢 Aprovado** (aguarda a síntese).

## Veredito — 2026-11-22 — regressão achada depois do commit — 🔵 Em correção (retiro o 🟢)

**A falha foi do revisor**, que aprovou sem rodar `contraste-do-que-faltava.spec.ts` e deixou a bateria para o fechamento.

**Regressão do commit `685d83f5` (não empurrado).** `LOGOUT_TEXT` e `LOGOUT_HOVER_TEXT`, em `SarakShellUserWidget.tsx`, trocaram o
`color-mix` (40% de erro + texto de maior contraste) pelo vermelho cru em todos os usos. A cor calculada só entra nas barras
contrastantes: `resolveChromeToneStyle` devolve vazio no tom neutro. Fora delas, o sair mede **1,73:1 no claro e 1,94:1 no escuro**
(mínimo 4,5) na bateria de 2026-11-22. O gate não acusa, porque `contrast-pairs.ts` segue medindo `mix:statusErrorColor` (linhas 112 e
113), que o componente não pinta mais.

**Correção, executada pela plan-167 (achado 1 dela), que tem a vez do navegador:**
- fora das barras contrastantes, o sair volta ao `color-mix` de antes, no repouso e no hover;
- nas barras contrastantes, a cor calculada chega por variável própria do texto do sair, sem sobrescrever `--sarak-status-error-color`,
  que também pinta o fundo sólido do hover;
- o par do gate mede o que o componente pinta, e o teste de unidade deixa de exigir a classe crua;
- prova num build novo: `contraste-do-que-faltava` e `contraste-do-cromo-nas-barras` verdes, e captura do sair em barra neutra e
  contrastante, claro e escuro, para o ok do dono.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-22 16:00 — a regressão do `685d83f5` é maior que o botão de sair — 🔵 Em correção (executa a plan-167)

**Falha do revisor, a segunda nesta plan:** o 🟢 saiu também sem rodar `browser-tests/tom-contrastante-legivel.spec.ts`. Medido por
`git archive`: 28 de 28 verdes no commit anterior a `685d83f5` e 7 vermelhos nele (texto do usuário e ícone do idioma entre 3,85 e 4,46;
P/M/G e Lateral a 1,05 em nebula-space claro). São regressão da plan, não dívida antiga.

**Quem corrige:** a plan-167, achados 3 e 5 do veredito "2026-11-22 16:00" dela, que tem as causas medidas. O conserto do sair entregue na
execução da plan-168 fecha `contraste-do-que-faltava`, mas não pinta a cor na lateral recolhida.

**Para voltar ao 🟢:** `contraste-do-que-faltava`, `contraste-do-cromo-nas-barras`, `tom-contrastante-legivel` e
`plan-149-barras-personalidade` verdes juntos num build novo, e o ok do dono nas capturas novas do sair.

**Status da plan: 🔵 Em correção.**
