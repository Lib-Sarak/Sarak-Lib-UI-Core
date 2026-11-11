---
tipo: "plan"
titulo: "Fazer a prévia do painel mostrar o efeito de toda opção"
objetivo: "Fazer a prévia do painel mostrar o efeito de toda opção destacada, por espiada ou escolha, desenhando os componentes reais na largura real do sistema, com as paletas espiando como as outras opções e o menu da prévia dentro da moldura"
dominio: "Painel de customização / Prévia"
status: "🔴 A executar"
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
listada no próprio spec, com o motivo, e é a única exceção.

**Lote 2 — a prévia tem onde mostrar.**
2.1. Cada grupo de preset declara em `design-decisions.json` a tela em que o componente aparece. A espiada de uma opção leva a prévia a
essa tela enquanto dura e volta à tela anterior ao sair; escolher a opção mantém a tela. Abrir a decisão continua levando à tela
canônica (06 §6.6).
2.2. `ComponentsMock` e `TableMock` passam a usar os componentes reais da lib (interruptor, selo, tabela). Os outros grupos que o
spec do lote 1 apontar com 0 px ganham, no mock da tela deles, o componente real.
2.3. Espiar um preset de Topbar com a navegação lateral (e de Sidebar com navegação no topo) mostra, na prévia e só durante a
espiada, a barra que o preset altera.
2.4. Paletas: hover e foco espiam, como as outras opções; as setas do teclado movem o foco e espiam, e só Enter ou clique escolhem.

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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
