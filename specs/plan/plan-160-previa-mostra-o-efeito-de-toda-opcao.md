---
tipo: "plan"
titulo: "Fazer a prévia do painel mostrar o efeito de toda opção"
objetivo: "Fazer a prévia do painel mostrar o efeito de toda opção destacada, por espiada ou escolha, desenhando os componentes reais na largura real do sistema, com as paletas espiando como as outras opções e o menu da prévia dentro da moldura"
dominio: "Painel de customização / Prévia"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "painel", "previa", "espiada", "mocks"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[08-identidade-do-host-e-zero-marca]]"]
depende_de: "plan-158"
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Passar o mouse ou escolher qualquer opção destacada do painel muda a prévia de um jeito visível, numa tela que mostra o componente
afetado, e a prévia desktop tem a largura do sistema real.

# 2. Contexto

**Medido no ERP (lib `v8.0.0`, 2026-11-10, 1440×900, comparação por pixel com limiar e linha de base tirada antes de cada hover).**

1. **Componentes (item 4 do dono): 31 de 49 opções mudam 0 px.** A decisão Componentes abre a prévia na tela "Texto", que não tem os
   componentes dos grupos. Mesmo na tela Componentes, interruptores (3) e selos (4) mudam 0 px, porque `ComponentsMock.tsx:42-43`
   desenha o interruptor com `div` e `:54-57` os selos com `span rounded-full` fixo. Na tela Tabela, os 6 presets de tabela só mexem a
   barra de rolagem: `TableMock.tsx:47,132` é `<table>` cru. Gráficos: 4 de 6 mudam. Isso contraria [[06-painel-de-customizacao-e-preview]]
   §6.3 ("telas falsas que exercitam os componentes reais").
2. **A prévia desktop tem 1.204 px a 50%.** É a largura do container (06 §6.2: `desktop: 100%`), menor que o sistema real (1.440 no
   ERP); as larguras de conteúdo 1.000, 1.200 e 1.440 px **nunca aparecem** na prévia, embora funcionem no sistema real.
3. **Presets de Topbar mudam 0 px com a navegação lateral**, e os de Sidebar com a navegação no topo: a prévia não mostra a barra que
   a opção altera.
4. **Paletas não espiam.** `Main/components/PaletteGallery.tsx` só tem `onSelect`; o hover numa paleta não muda a prévia, ao contrário
   do que 06 §6.4 promete para toda opção. Depois do primeiro clique, as setas do teclado *escolhem* (gravam no rascunho), o que parece
   espiada mas não é.
5. **O menu ⚙ da prévia** abre em tamanho real e fora da moldura, por cima do painel: margens desproporcionais, botões cortados ou
   sobrepostos.
6. **Itens da navegação da prévia são links reais** (`<a href="/tabela">`): o clique é interceptado, mas Ctrl+clique, botão do meio ou
   "abrir em nova aba" abrem a rota no sistema do importador, onde ela não existe.
7. **Tablet:** títulos dos cards cortados ("CPU Clus…", "System H…") e o menu da prévia cortado ("Gráfic"); no celular, o botão do
   inspetor flutua sobre a borda da moldura.
8. **Marca d'água "SARAK TWIN"** (pedido do dono, 2026-11-10): `LiveDraftPreviewFrame.tsx:86-89` desenha atrás da prévia, a
   10rem e opacidade 0,02, o texto "SARAK TWIN" girado; aparece claramente na prévia Mobile, dos dois lados do aparelho. É marca da
   lib no painel do importador ([[08-identidade-do-host-e-zero-marca]]) e sai, sem substituto.
9. **Espiada:** 350-400 ms do hover à prévia; 150 ms são `PEEK_DELAY_MS` (`Canvas/components/peek.ts:8`), de propósito. O resto é
   desempenho, tratado na `plan-158`.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/Canvas/Mocks/` — `ComponentsMock.tsx`, `TableMock.tsx`, `ChartsMock.tsx` e o mock que cada grupo de preset
  precisar para ter onde aparecer; os testes de `Canvas/Mocks/__tests__/`.
- `src/features/DesignEngine/config/design-decisions.json` — a tela de cada grupo de preset.
- `src/features/DesignEngine/Main/hooks/usePeekPreview.ts`, `usePreviewUIState.ts`; `src/features/DesignEngine/Canvas/components/peek.ts`,
  `PreviewSystemRenderer.tsx`, `PreviewToolbar.tsx`; `src/features/DesignEngine/Canvas/hooks/useDeviceStyles.ts` e
  `useContainerScale.ts`.
- `src/features/DesignEngine/Main/components/PaletteGallery.tsx` e `PaletteSection.tsx` (espiada de paleta).
- `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx` e o cartão `PresetCardPending` (espiada do tema ainda não carregado; acrescentado pelo revisor em 2026-11-12, veredito da correção do lote 1).
- `src/features/DesignEngine/Canvas/components/LiveDraftPreviewFrame.tsx` (a marca d'água sai).
- Um spec de navegador novo em `browser-tests/` e os testes de unidade dos arquivos acima.
- `docs/migracoes.md` se o importador vir diferença.

## 3.2 Fora
- O desenho das amostras (miniaturas) das opções e a rolagem das decisões: `plan-161`.
- O cromo real e as preferências: `plan-159`. A prévia monta o `SarakAppChrome` real (06 §6.2.2); corrigir o cromo é lá.
- O tempo de render da espiada e da escolha: `plan-158`.
- Traduzir o conteúdo de exemplo das telas falsas; a padronização de termos é da `plan-161`.
- Qualquer arquivo de importador. Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` §2.3, §2.4, §6 inteira | o caminho do painel, paletas, o Gêmeo Digital, mocks, catálogos, espiada, decisão e tela |
| Spec fixa | `specs/05-cromo-e-slots.md` §2.1.2, §2.2.2 | o item de navegação é link de verdade (no sistema; na prévia não pode sair) e a composição da barra |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` §6.1, §7 | camada 3 e o limite de prova da prévia |
| Spec fixa | `specs/08-identidade-do-host-e-zero-marca.md` | confira se o nome de exemplo "Sarak Preview" (`PreviewSystemRenderer.tsx:98`) está na allowlist; se não estiver, troque por nome neutro |
| Spec fixa | `specs/11-testes-e-cobertura.md` | onde os testes entram |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` · `ui-arquitetura-design` | escrita, testes, regra do Design Engine |
| Código | `src/features/DesignEngine/Canvas/Mocks/ComponentsMock.tsx:42-57` · `src/features/DesignEngine/Canvas/Mocks/TableMock.tsx:47` e `:132` · `src/features/DesignEngine/Main/components/PaletteGallery.tsx` · `src/features/DesignEngine/Canvas/components/peek.ts` · `src/features/DesignEngine/Canvas/hooks/useDeviceStyles.ts` · `src/features/DesignEngine/config/design-decisions.json` | ler antes de editar |
| Teste existente | `browser-tests/plan-141-presets-do-painel.spec.ts` (a distinção por pixel das amostras) · `browser-tests/plan-135-paletas-no-painel.spec.ts` · `browser-tests/cromo-css-real.spec.ts` | o molde da medição por pixel e o que não pode regredir |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.**

**Lote 1 — a medição que manda.**
1.1. Spec de navegador novo: para cada decisão, cada grupo e cada opção destacada, espiar a opção (hover) e medir a diferença de pixels
da prévia contra a linha de base tirada imediatamente antes, com limiar que ignora a barra de rolagem. Registre a contagem por grupo
**antes** de mudar código (o número medido no ERP foi 31 de 49 em Componentes).
1.2. A regra do spec: toda opção destacada muda a prévia acima do limiar. Opção que só muda em animação ou só no outro modo fica
listada no próprio spec, com o motivo; a opção **já aplicada** (o design já tem o que ela
escreve) também, identificada pelo spec por mecanismo e não por nome. São as únicas exceções *(a terceira é emenda do revisor, 2026-11-12, veredito do lote 1, achado 2)*.

**Lote 2 — a prévia tem onde mostrar.**
2.1. Cada grupo de preset declara em `design-decisions.json` a tela em que o componente aparece. A espiada de uma opção leva a prévia a
essa tela enquanto dura e volta à tela anterior ao sair; escolher a opção mantém a tela. Abrir a decisão continua levando à tela
canônica (06 §6.6).
2.2. `ComponentsMock` e `TableMock` passam a usar os componentes reais da lib (interruptor, selo, tabela). Os outros grupos que o
spec do lote 1 apontar com 0 px ganham, no mock da tela deles, o componente real.
2.3. Espiar um preset de Topbar com a navegação lateral (e de Sidebar com navegação no topo) mostra, na prévia e só durante a
espiada, a barra que o preset altera.
2.4. Paletas: hover e foco espiam, como as outras opções; as setas do teclado movem o foco e espiam, e só Enter ou clique escolhem.
2.5. Cartão de tema ainda não carregado (`PresetCardPending`): espiar carrega o tema e mostra a prévia dele quando chega; sair antes de
chegar não aplica nada. O item sai de `KNOWN_PENDING` no spec (acrescentado pelo revisor em 2026-11-12).

**Lote 3 — moldura e largura.**
3.1. Desktop: a prévia renderiza na largura real da janela do sistema (no mínimo 1.280 px) e é reduzida para caber no espaço do
painel. As larguras de conteúdo aparecem na prévia. Tablet e celular continuam na largura do aparelho (06 §6.2).
3.2. O menu ⚙ e todo popover do cromo da prévia abrem dentro da moldura, na escala da prévia.
3.3. Nenhum item da navegação da prévia leva o navegador para fora do painel (Ctrl+clique, botão do meio, nova aba).
3.4. Tablet: títulos dos cards e o menu da prévia sem corte; celular: nenhum botão do painel por cima da moldura.
3.5. A marca d'água "SARAK TWIN" sai de `LiveDraftPreviewFrame.tsx`, sem substituto. Confira por que o `zero-brand:check` não a
acusou (allowlist ou padrão de busca) e relate no resumo; se for lacuna do gate, vai para os achados fora do escopo.

**Em todo lote:** o spec do lote 1 roda e a contagem sobe; nada que passava passa a reprovar.

# 6. Critérios de aceite

- [ ] Spec de navegador: toda opção destacada muda a prévia; as exceções listadas no spec, com motivo; contagem de antes no resumo.
- [ ] Componentes: 49 de 49 (ou as exceções listadas) mudam a prévia, contra 18 de 49 antes.
- [ ] Interruptor, selo e tabela da prévia são os componentes reais da lib.
- [ ] Espiada leva à tela do grupo e volta ao sair; escolher mantém.
- [ ] Preset de Topbar com navegação lateral (e o inverso) muda a prévia durante a espiada.
- [ ] Paletas espiam no hover e no foco; só Enter ou clique escolhem.
- [ ] Prévia desktop na largura do sistema (≥ 1.280 px), reduzida; as três larguras de conteúdo distintas na prévia.
- [ ] Menu ⚙ dentro da moldura e na escala; nenhum item da prévia leva para fora do painel.
- [ ] Tablet e celular sem corte nem botão sobre a moldura.
- [ ] Nenhuma marca d'água na prévia, em nenhum dispositivo.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1; `npm run build` + `cromo-css-real:check`.
- [ ] Prévia para o dono em `C:\tmp\sarak-previa-160\index.html` (lotes 2 e 3), com capturas reais; o lote só fecha com o ok do dono nela.

# 7. Como verificar (uso do revisor)

**Gate:** teste — o spec de navegador "toda opção destacada muda a prévia"; nenhuma regra de gate nova.

- Lote 1: rodo o spec no código de antes e confiro a contagem de Componentes contra a do ERP (31 de 49 com 0 px).
- Lote 2: a mesma contagem depois; leio `ComponentsMock` e `TableMock` (componente real, nenhum `div` no lugar do interruptor).
- Lote 3: abro a prévia no harness a 1440×900 e confiro a largura e o ⚙; Ctrl+clique num item.
- Cada lote: `npm run verify -- --tier=full`.

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md`

- §6.2: a largura desktop da prévia (a do sistema, reduzida), no lugar de `desktop: 100%`.
- §6.3: os mocks com componentes reais e a tela de cada grupo.
- §6.4: a espiada leva à tela do grupo, inclui a barra que a opção altera e vale para paletas; o teclado nas paletas.
- §6.6: a relação entre a tela canônica da decisão e a tela da espiada.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->
## Resumo da execução (lote 1) — 2026-11-12

**Resultado:** Concluído (lote 1). Lotes 2 e 3 não executados, como a nota do revisor manda.

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-160-previa-mostra-o-efeito-de-toda-opcao.md
 M specs/plan/plan-164-paleta-do-tema-paleta-por-cima-e-paletas-salvas.md
```

**O que foi feito**
- `browser-tests/plan-160-previa-mostra-a-opcao.spec.ts` (novo): para cada decisão (Tema, Cores, Fontes, Forma, Componentes, Layout), abre o painel, e para cada opção destacada (`[data-option-tile]` e radios da galeria de paletas) tira a linha de base da prévia com o mouse fora, espia (hover, espera 900 ms) e mede a fração de pixels diferentes (soma dos canais > 30, faixa de 24 px da barra de rolagem ignorada). Limiar: 0,03% da área. Opção que não muda na primeira espiada ganha uma segunda tentativa (vale a maior diferença): "Pílula flutuante" variou 0,012 → 0,000 entre rodadas sem a segunda tentativa.
- `browser-tests/fixtures/plan-160-previa-entry.tsx` (novo): harness com `SarakUIProvider` + `SarakCustomizationPanel` importados de `@sarak/lib-ui-core`, ou seja, do `dist/`.
- Como o spec roda verde agora e vira trava depois: as opções sem efeito estão em `KNOWN_PENDING` (por `decisão/grupo`, com o motivo e os nomes). O spec reprova nos dois sentidos: opção fora da lista que não muda a prévia (regressão) e opção da lista que passou a mudar ("tire-a da lista"). Quando o lote 2 corrigir um grupo, o spec obriga a esvaziar a lista dele.
- Nenhum arquivo de `src/` foi alterado por mim.

**Contagem por grupo, antes de qualquer mudança de código (mudam a prévia / total)**
| Decisão | Grupo: mudam/total |
|---|---|
| Tema | personalities 10/10 |
| Cores | Paletas prontas **0/19** |
| Fontes (14/21) | fontPairs 4/8 · typeScale 5/5 · fonts 5/8 |
| Forma (19/33) | cards 6/6 · corners 3/3 · density 5/5 · shadow 0/2 · shadowDirection 0/2 · border 2/2 · material 3/4 · glass 0/3 · atmosphere 0/4 · gradient 0/2 |
| **Componentes (18/49)** | buttons 7/7 · inputs 5/5 · icons 6/7 · **tables 0/6 · charts 0/6 · modal 0/1 · notice 0/3 · switch 0/3 · scroll 0/1 · badge 0/4 · emptyState 0/4 · motion 0/1 · pageTransition 0/1** → 31 de 49 com 0 px, igual ao ERP (18 de 49 mudam) |
| Layout (8/20) | sidebar 7/8 · topbar **0/8** · contentWidth 1/4 |

Fora da contagem (sem `data-option-tile`): o grupo `themes` do Tema e `globalBlock` do Layout.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/plan-160-previa-mostra-a-opcao.spec.ts` | criado | o spec |
| `browser-tests/fixtures/plan-160-previa-entry.tsx` | criado | o harness |
| `specs/plan/plan-160-previa-mostra-o-efeito-de-toda-opcao.md` | alterado | este resumo e o status 🟠 |

**Verificações executadas**
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-160-previa-mostra-a-opcao.spec.ts`, duas vezes seguidas, com a lista final: 6 passed (13,4 min) e 6 passed (13,9 min).
- `npm run -s verify -- --tier=quick` → verde (rodado depois do spec final; nenhuma linha fora de `[OK]`).
- Antes da lista final, quatro rodadas de medição para calibrar (limiar, nome das opções, segunda tentativa); registradas em Decisões.

**Critérios de aceite (lote 1)**
- [x] Spec de navegador mede cada opção destacada, com exceções listadas e o motivo — `KNOWN_PENDING`.
- [x] Contagem de antes registrada — tabela acima (Componentes 18/49, ou 31 de 49 com 0 px).
- [x] Spec verde 2 vezes seguidas contra o `dist/` atual; `verify --tier=quick` verde.
- Os demais critérios da §6 pertencem aos lotes 2 e 3.

**Decisões e suposições**
- A medição é contra o `dist/` (como a plan pede), no harness do painel, não no ERP; o número 31/49 coincidiu com o do ERP.
- Limiar 0,03% (não 0,1%): opções como "Retos" (0,0007), "Plano e discreto" (0,0008), "Dois tons" (0,0009) mudam pouco mas de verdade, e os zeros reais ficam em 0,0000–0,0001. A margem do limiar para "Limpa" (sidebar, 0,0001) é estreita.
- O nome da opção é o último `h3` do tile: o primeiro é o título da amostra (três cards se chamavam "Receita do mês").
- Os motivos por grupo em `KNOWN_PENDING` são hipóteses a partir da §2 da plan (tela sem o componente, mock sem componente real, paleta sem espiada, barra não mostrada, largura da prévia). Só os da plan foram verificados por leitura; os de Fontes, Forma e "outros" são genéricos ("não altera o visível na tela aberta") e o lote 2 deve refiná-los.
- Playwright e Chromium: nenhum outro processo de automação rodava antes de abrir o navegador.

**Achados fora do escopo (não corrigidos)**
- Durante a execução apareceram no worktree, e não estavam na fotografia, `dist/` (rebuild: chunks trocados, `BUILD_INFO.json`, `index.*`), `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts`, `sarak-dev/*`, `sarak-ui/*`, `src/core/Design/presets/themes/*` (3 temas novos), um snapshot de `PresetsCatalog`, `specs/adr/027-…` e a plan-162. Parecem da plan-162 (lote 2) em paralelo. Não fiz build, não toquei nesses arquivos e **não restaurei** `dist/` nem os `buildInfo.ts`: eles não são resultado do meu trabalho. O `dist/index.js` foi regravado às 12:25 enquanto uma das rodadas de calibração corria; as duas rodadas finais verdes rodaram depois disso.
- `PresetsCatalog.test.tsx.snap` modificado por essa outra execução.

**Pendências / riscos**
- O spec leva ~14 min (6 decisões × ~100 espiadas com espera). Possível reduzir no lote 2.
- Flakiness residual perto do limiar (ver acima); a segunda tentativa a atenua.
- O spec depende dos nomes em português das opções (`KNOWN_PENDING.options`); mudar o texto de uma opção exige atualizar a lista.


## Resumo da execução (correção do lote 1) — 2026-11-12

**Resultado:** Concluído com pendência no achado 5 (o spec leva ~8 min, não 5).

**Estado do worktree ao iniciar**
Mesmo worktree compartilhado da execução anterior: `dist/` regravado, `src/core/Design/presets/themes/*`, `sarak-dev/*`, `sarak-ui/*`, `specs/adr/027-…`, plans 162 e 164 e `00-indice.md` já modificados por outras tarefas; do lote 1, o spec e o harness como não rastreados. Não toquei em nada disso. Antes de abrir o navegador conferi processos: nenhum Playwright/Chromium de outra execução (plan-162) rodava.

**O que foi feito (só `browser-tests/`; nada em `src/`, nenhum build)**
- **Achado 1** — `fixtures/plan-160-previa-entry.tsx`: o Provider agora usa `fonts: { source: 'bundled', baseUrl }`, e o spec passa `dist/fonts` pela URL (como `fontes-no-painel.spec.ts`). Fontes medida de novo: 20 de 21 (antes 14 de 21 com `fonts: 'none'`).
- **Achado 2** — "já aplicada" por mecanismo, duas provas: (a) clique: depois da medição, o spec escolhe a 1ª opção do grupo (a 2ª, para a própria 1ª) e espia de novo cada zero, contra uma linha de base nova; a que passa a mudar estava aplicada (`markApplied`); (b) dado: o harness expõe o registro de presets (`window.__plan160`) com os tokens de cada opção e se todos já valem no design do harness (padrão do sistema + `sarak-sovereign`).
- **Achado 3** — duas listas: `PERMANENT_EXCEPTIONS` (9 itens, cada um com `kind` e motivo; o spec exige a prova do `kind` e reprova sem ela) e `KNOWN_PENDING` (só defeito do painel, 11 grupos e o cartão de tema pendente, cada um com o motivo da medição). Trava nos dois sentidos, como antes. `other-mode` existe no tipo e nenhuma opção cai nele; a espiada no outro modo não é medida (declarado no cabeçalho).
- **Achado 4** — o spec mede os 23 cartões da galeria de temas (`[data-theme-id]`, grupo `themes`) e o cartão não carregado: o harness aceita `?hold=<id>` e usa o `__SARAK_TEST_THEME_IMPORT_GATE__` do `build-harness.mjs` para segurar o import de `neo-brutalism`, e o teste "Tema: o cartão de tema ainda não carregado…" exige `aria-busy="true"` no cartão antes de espiá-lo.
- **Achado 5** — espera por estabilidade: `settlePreview` espera o DOM da prévia ficar 90 ms sem mudar (piso 260 ms, teto 1,5 s) em vez de esperas fixas; linha de base única por decisão; sem segunda tentativa de foto (se nenhuma variável do escopo mudou no piso, espera mais 500 ms antes da foto); o mouse é movido direto, sem o `hover()` do Playwright (~340 ms cada); teste de "aplicada" por grupo com uma linha de base por clique.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/plan-160-previa-mostra-a-opcao.spec.ts` | criado (reescrito) | spec com as duas listas, as provas e a espera por estabilidade |
| `browser-tests/fixtures/plan-160-previa-entry.tsx` | criado (alterado) | fontes `bundled`, `?hold=`, dado do registro de presets |
| `specs/plan/plan-160-previa-mostra-o-efeito-de-toda-opcao.md` | alterado | este resumo e o status 🟠 |

**Nova contagem por grupo (mudam a prévia / total; fontes carregadas, temas incluídos)**
| Decisão | Resultado |
|---|---|
| Tema 33/33 | personalities 10/10 · **themes 23/23** |
| Cores 0/19 | Paletas prontas 0/19 |
| Fontes 20/21 | fontPairs 7/8 · typeScale 5/5 · fonts 8/8 |
| Forma 33/33 | cards 6/6 · corners 3/3 · density 5/5 · shadow 2/2 · shadowDirection 2/2 · border 2/2 · material 4/4 · glass 3/3 · atmosphere 4/4 · gradient 2/2 |
| Componentes 18/49 | buttons 7/7 · inputs 5/5 · icons 6/7 · tables 0/6 · charts 0/6 · modal 0/1 · notice 0/3 · switch 0/3 · scroll 0/1 · badge 0/4 · emptyState 0/4 · motion 0/1 · pageTransition 0/1 |
| Layout 8/20 | sidebar 7/8 · topbar 0/8 · contentWidth 1/4 |
| Cartão de tema pendente | 0/1 (não espia) |

Forma subiu de 19/33 para 33/33 e Fontes de 14/21 para 20/21 com a fonte carregada: os zeros que eu atribuía ao painel naquele grupo eram do harness. Componentes continua 18/49 (31 de 49 com 0 px, igual ao ERP).

**Exceções permanentes e a prova de cada uma**
- `applied` por clique e por dado: `fonts/fontPairs/Moderno` (os dois), `layout/contentWidth/Fluida` (os dois).
- `applied` por clique: `components/icons/Preenchidos`, `layout/sidebar/Limpa`.
- `applied` por dado (todos os tokens dela já valem no design do harness): `components/charts/Área suave`, `components/notice/Suave`, `components/switch/Tátil`.
- `animation` por dado (a opção só escreve tokens `motion*` / `pageTransition*`): `components/motion/Instantâneo`, `components/pageTransition/Esmaecer`. (`Esmaecer` também é "aplicada" por dado; o spec aceita qualquer prova que sustente o `kind` listado.)

**Motivos revisados de `KNOWN_PENDING`, pelo que a medição mostrou**
- Paletas (19): nenhuma variável do escopo da prévia muda e nenhum pixel: a galeria não espia.
- tables, charts, modal, notice, switch, scroll, badge, emptyState: as variáveis do grupo CHEGAM ao escopo da prévia (3 a 7 por opção), e nenhum pixel muda: a tela aberta (Texto) não desenha o componente que as lê; tabela, interruptor e selo ainda são `<table>`/`div`/`span` crus (§2 da plan, não recomprovado por mim).
- topbar (8): variáveis `--sarak-topbar-*` chegam e nenhum pixel muda: a prévia navega pela lateral.
- contentWidth Média e Larga: `--sarak-max-content-width` chega, mas a prévia desktop tem a largura do container; só a largura de 1.000 px aparece (Estreita 5,4% dos pixels).
- Cartão de tema pendente: `PresetCardPending` não recebe `peekTokens`/`onPeek` (`PresetsCatalog.tsx:72-79` os passa só ao `PresetCard`).
- Motivos que escrevi antes e agora retiro: "mesma família já em uso" (Fontes), "a tela aberta não mostra a superfície" (Forma): não valem, Forma não tem zero.

**Verificações executadas**
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-160-previa-mostra-a-opcao.spec.ts`, duas vezes seguidas: 7 passed (8,5 min) e 7 passed (8,0 min).
- `npm run -s verify -- --tier=quick` → verde (nenhuma linha fora de `[OK]`).
- Nas medições de calibração anteriores à lista final, vi falhas esperadas (listas vazias).

**Critérios de aceite**
- [x] Spec verde 2 vezes seguidas — acima.
- [x] Contagem por grupo, com Fontes de fonte carregada e temas — tabela acima.
- [x] Cada exceção com motivo provado por mecanismo — seção acima.
- [x] `verify --tier=quick` verde.
- [ ] Alvo de 5 min do achado 5 — **8,0 a 8,5 min**. Antes: 14 min. Motivo: o gargalo é a foto da prévia, ~0,5 s cada com Chromium headless (medido: 'disabled' ou 'allow', png ou jpeg, igual), e o spec tira ~330 por rodada (174 opções + a espiada de reforço + as linhas de base). Pontos que cortaram tempo: foto de estabilidade (4 por opção → 1), segunda tentativa, `hover()` do Playwright. Medir as seis decisões em páginas paralelas travou o hover (página fora de foco não pinta) e foi descartado. Para chegar a 5 min seria preciso diminuir o número de fotos (por exemplo, dispensar a foto quando nenhuma variável nem nó do DOM da prévia muda, ao custo de não ver mudança só em canvas), o que não fiz sem ordem.

**Decisões e suposições**
- Limiar mantido em 0,03%; o cartão do tema do próprio harness (`sarak-sovereign`) muda 0,09%, perto do limiar (3×), e entra como "muda".
- Prova de `animation` pelos tokens que a opção escreve (registro), não pelas variáveis do escopo: `pageTransitionType` não é variável CSS e não apareceria.
- O registro (`PRESET_GROUPS`) é importado de `src/` só como dado no harness, enquanto o painel vem do `dist/`; se o `dist/` ficar defasado do `src/`, a prova de dado pode divergir do painel medido.
- `?hold=` depende do chunk `neo-brutalism` do `dist/` e do `gateNeoBrutalismThemeImport` do `build-harness.mjs`.

**Achados fora do escopo (não corrigidos)**
- Playwright reinicia o worker depois de um teste que falha e roda o `beforeAll` de novo; com o spec em falha, o tempo dobra. Só afeta diagnóstico.

**Pendências / riscos**
- Tempo (8 min) acima do alvo.
- `dist/`, `src/core/Design/presets/themes/*` e outros arquivos de outras tarefas continuam modificados no worktree; só relato, como mandado.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Nota do revisor — 2026-11-12 — lote 1 liberado antes da `plan-158`

O `depende_de: plan-158` vale para os lotes 2 e 3, que mexem na prévia e no tempo dela. O lote 1 só cria o spec de navegador
que mede a diferença de pixels da espiada; nada do que a 158 muda (o que se grava e o desempenho) altera o que ele mede. O
lote 1 roda já, e os lotes 2 e 3 esperam a 158 fechar.

**Lote 1 liberado.**

## Veredito — 2026-11-12 — lote 1 — 🔴 Reprovado (achados 1 a 5)

**Conferido por mim:**
- Li o spec e o harness inteiros e cruzei cada grupo de `KNOWN_PENDING` com os presets
  (`src/core/Design/presets/components/`), com o tema do harness (`sarak-sovereign.ts`) e com o markup das galerias.
- A contagem de Componentes (18 de 49) bate com a do ERP. A trava nos dois sentidos (regressão e "tire-a da lista") é o
  desenho certo. Nenhum arquivo de `src/` foi tocado.
- Não rodei o spec (14 min): os achados saem da leitura, e cada um diz como se prova.

Os achados atacam o motivo de vários zeros. Hoje a lista atribui ao painel defeitos que são do harness ou do estado atual, e o
lote 2 mudaria código para resolver o que não está quebrado.

1. **Os zeros de Fontes medem o harness, não o painel.** O harness passa `fonts: 'none'`
   (`fixtures/plan-160-previa-entry.tsx:17`), então nenhuma família é carregada: a fonte que a máquina não tem instalada cai na
   genérica.
   - Os 4 pares que não mudam (Moderno, Técnico, Corporativo, Futurista) e as 3 fontes (Inter, Outfit, Space Grotesk) só têm
     família de genérica `sans-serif`.
   - Os pares que mudam, entre os que conferi (Editorial, Humanista, Retrô), caem em `serif` ou `monospace`
     (`typographyKits.ts:20-31`, `schema/typography.ts`).
   - O motivo escrito ("mesma família já em uso") não se sustenta.
   - **Correção:** o harness carrega as fontes do `dist/`, como `fontes-no-painel.spec.ts:51` faz
     (`source: 'bundled'` com `baseUrl` da pasta `dist/fonts`), e Fontes é medida de novo.

2. **Opção já aplicada não é distinguida e entra na lista com motivo errado.** Espiar a opção que o design já tem não pode
   mudar a prévia, por definição. São pelo menos três casos:
   - **"Preenchidos"** (ícones): é `phosphor`/`fill`, exatamente o que o tema já tem (`sarak-sovereign.ts:40-42`). O motivo
     escrito, "a decisão abre a tela de texto", é desmentido pelos outros 6 de 7 ícones, que mudam a prévia na mesma tela.
   - **"Limpa"** (sidebar): é o design do tema a menos do `sidebarBlur` (`layout.ts:9-16`). Os 0,01% medidos são esse blur, não
     "o que a tela não desenha".
   - **"Moderno"** (Outfit/Inter): é o par do tema (`sarak-sovereign.ts:150-151`).
   - Na lista de pendências, essas opções nunca saem, e o spec aceitaria o zero delas para sempre.
   - **Correção:** o spec identifica a opção já aplicada **por mecanismo**, não por nome. Uma forma: no fim de cada grupo,
     escolher (clique) outra opção do grupo e espiar de novo cada zero; a que passa a mudar estava aplicada.
   - Essas opções vão para uma lista de exceções permanentes com o motivo "já aplicada".
   - **Emenda do revisor à §5, item 1.2:** "já aplicada" é a terceira exceção legítima, ao lado de "só muda em animação" e "só
     no outro modo".

3. **Exceções permanentes estão misturadas com pendências.** "Instantâneo" (motion) e "Esmaecer" (pageTransition) só mudam
   animação, e o spec fotografa com `animations: 'disabled'`: nunca vão mudar. Elas são a exceção que o item 1.2 prevê, e a
   lista diz "a decisão abre a tela de texto".
   - **Correção:** duas listas no spec.
     - **Exceções:** animação, outro modo e já aplicada, cada uma com o motivo. Fica para sempre.
     - **`KNOWN_PENDING`:** só os defeitos do painel. Tem de estar vazia ao fim do lote 3; é o critério que torna a §6
       conferível por máquina.

4. **A galeria de temas ficou fora da contagem, e ela espia.** Os cartões de tema (`PresetCard`) têm `peekTokens` e `onPeek`
   (`PresetsCatalog.tsx:72-79`). Só não têm o marcador `[data-option-tile]`, e o spec os declarou limite (R18).
   - É a opção mais vista do painel, e a §5, item 1.1, pede "cada grupo".
   - **Correção:** o spec mede os cartões da galeria de temas por um seletor próprio. O cartão de tema ainda não carregado
     (`PresetCardPending`) conta como opção. Se ele não espia, é pendência real e entra em `KNOWN_PENDING`.
   - O `globalBlock` do Layout é de controles de token, não de opção destacada, e continua fora com razão.

5. **O spec põe 14 min no gate de fechamento.** `cromo-css-real:check` roda todo `browser-tests/` (`package.json:71`), e ele
   fecha cada release.
   - O tempo vem de esperas fixas: 500 ms de linha de base, 900 ms de espiada e segunda tentativa, em ~100 opções por decisão.
   - **Correção:** trocar a espera fixa por espera de estabilidade (dois quadros seguidos iguais, com teto). **Alvo:** o spec
     inteiro em até 5 min. Se não der, o resumo diz quanto deu e por quê.

**Pronto quando:**
- o spec roda verde 2 vezes seguidas;
- a nova contagem por grupo está no resumo, com Fontes medida com fonte carregada e o grupo de temas incluído;
- cada opção da lista de exceções tem o motivo provado (a já aplicada, pelo mecanismo);
- `verify --tier=quick` está verde.

## Nota do revisor — 2026-11-12 — prévia HTML para o dono aprovar

A pedido do dono, como nas campanhas anteriores: ao fim de lotes 2 e 3, o executor gera `C:\tmp\sarak-previa-160\index.html`
com capturas reais do `dist/` ou do código-fonte (como as prévias da 136 a 149), mostrando cada decisão com uma opção espiada (antes e depois), a prévia desktop na largura real, o menu ⚙ dentro da moldura, e a prévia em tablet e celular. O resumo do lote dá o caminho.
O revisor confere a prévia antes do veredito, e o lote só fecha com o ok do dono nela (critério acrescentado à §6). A projeção da
campanha inteira, feita à mão, está em `C:\tmp\sarak-previa-campanha-9\index.html`: é referência de intenção, não de pixel.

## Veredito — 2026-11-12 — correção do lote 1 — 🟢 Aprovado; o lote 1 fecha (lotes 2 e 3 esperam a `plan-158`)

**Conferido por mim:**
- Li o spec reescrito e o harness. O `git status` confirma que só eles mudaram em `browser-tests/`, e nada em `src/`.
- Não repeti a rodada de 8 min: o executor rodou 2 vezes seguidas, e conferi as travas pelo código.

**Achados 1 a 5:**
1. Achado 1 fechado. Com a fonte carregada, Fontes vai a 20 de 21 e Forma a 33 de 33. Os zeros desses grupos eram do harness,
   como o veredito apontava. Isso tira do lote 2 o trabalho que ele faria à toa.
2. Achado 2 fechado. A opção já aplicada tem duas provas por mecanismo: o clique (escolher outra opção e espiar de novo) e o
   dado (os tokens da opção já valem no design do harness).
   - A trava das linhas 349 e 353 reprova exceção sem a prova do motivo e item de lista que passou a mudar. A exceção mal
     classificada não fica escondida.
   - Risco aceito e declarado: a prova por dado lê o registro de `src/` e o painel vem do `dist/`. Com o `dist/` defasado, a prova
     pode divergir; a trava da linha 353 acusa o caso visível.
3. Achado 3 fechado. São 9 exceções permanentes, cada uma com `kind` e prova. `KNOWN_PENDING` só tem defeito do painel, com o
   motivo medido: as variáveis chegam ao escopo da prévia e o pixel não muda.
4. Achado 4 fechado. Os 23 cartões de tema entram na medição, 23 de 23 mudam a prévia, e o cartão ainda não carregado é medido
   com o import seguro.
   - Ele não espia, e isso é **defeito real**: `PresetCardPending` não recebe `peekTokens` nem `onPeek`.
   - Acrescentei esse caso ao lote 2: o item 2.5 e o `PresetsCatalog.tsx` na §3.1.
5. Achado 5 aceito com o tempo medido: 8,0 a 8,5 min, contra 14 antes e o alvo de 5.
   - O motivo foi medido: ~0,5 s por foto, ~330 fotos.
   - A saída que o executor recusou, pular a foto quando nada muda no DOM, deixaria de ver mudança só em canvas, e os
     gráficos são canvas. A recusa foi correta.
   - Se o tempo do `cromo-css-real:check` incomodar no fechamento, a decisão é do dono.

**O que os lotes 2 e 3 têm de esvaziar** (`KNOWN_PENDING`):
- Paletas: 19.
- Componentes: tables, charts, modal, notice, switch, scroll, badge e emptyState.
- Topbar: 8.
- contentWidth: Média e Larga.
- O cartão de tema pendente.

**Lote 1 fechado.**
