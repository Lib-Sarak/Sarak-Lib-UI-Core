---
tipo: "plan"
titulo: "Design gravado só com as escolhas, e presets e personalidades que aplicam o que prometem"
objetivo: "Fazer o design gravado conter só o que o usuário escolheu em qualquer forma de carga do tema, manter a opacidade da textura nos dois modos, fazer Compacta, fundo à mão e as 4 personalidades de topo aplicarem o que a migração promete, e alinhar os textos da migração ao painel"
dominio: "Persistência do design / Presets / Painel"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "rc2", "persistencia", "formato-do-design", "presets", "personalidades"]
relacionados: ["[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[026-design-gravado-guarda-so-as-escolhas]]", "[[027-paleta-do-tema-paleta-por-cima-e-paletas-salvas-no-design]]"]
depende_de: ""
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

O `onSave` recebe só as chaves que o usuário escolheu, venha o tema por `onLoad`, `initialTheme` ou `config`. Escolhas de opacidade,
tom, fundo e personalidade aparecem na tela como a migração da 9.0.0 descreve.

# 2. Contexto

Defeitos medidos pela validação da 9.0.0-rc.1 (plans 172 e 173), num consumidor completo montado com o `dist/` da tag. O D0 (troca de
tema apagando escolhas com `config`) já foi corrigido pela `plan-175` (opção `configIsSavedDesign`), e esta plan não o reabre.

**Lote 1 — o que o design gravado guarda** ([[026-design-gravado-guarda-so-as-escolhas]])

| Id | Defeito |
|---|---|
| D2 | **436 chaves gravadas.** Reprodução: `persistence.onLoad` devolve `{design:{}, activeThemeId:'neo-brutalism', format:2}`, sem `initialTheme` nem `config`. Barras → tom "Invertida" → Aplicar. O `onSave` recebe 436 chaves; o esperado é `{sidebarTone:'inverse'}`. Reproduz com neo-brutalism, cyberpunk-neon e industrial-terminal, e não com sarak-sovereign. Com `initialTheme` a mesma ação grava 4 chaves. **Hipótese a confirmar pela medida:** a linha de base da extração é composta com o tema padrão quando o tema chega só por `onLoad` |
| D16 | **Chaves não escolhidas.** Com sarak-sovereign, toda aplicação que não troca o tema acrescenta `layout:"glass"`. Aplicar o modo escuro acrescenta `mode` e 11 cores calculadas (`cardHeaderBorder`, `surfaceColor`, `colorBgBody`, `bgBaseColor`…) |
| D3 | `cardTextureOpacity` 0,5 pinta 0,5 no modo nativo do tema e **0,05 ou 0,06 no oposto** (sovereign escuro, neo-brutalism claro, industrial escuro). A migração diz "nos dois modos". O par de modo (`contraparte`) vence o valor do usuário |
| PD | **Diálogo "Trocar de paleta?"** diz "Você ajustou 15 cores à mão" (21 ou 87 em outros temas) sem nenhum ajuste feito. A contagem compara contra a mesma linha de base do D2 |

**Lote 2 — presets e personalidades**

| Id | Defeito |
|---|---|
| D4 | "Compacta" (`sidebar-compact`) não declara `sidebarTone`. A lateral fica neutra (`#061011`), e a migração ("a barra lateral Compacta passa do tom Neutro ao Superfície") promete o tom Superfície |
| D5 | **Cor de fundo à mão não pinta.** Cores → Ajustes principais → "Cor de Fundo Base" = `#f3eadb` → Aplicar → recarregar: grava, mas o fundo não muda. `src/styles/_base.css:57` pinta o `body` com `var(--bg-body) !important`, e `--bg-body` não segue `--sarak-bg-base-color` |
| D11 | Executivo, Editorial, Brutalista e Vidro (as 4 com `navigationStyle: "topbar"`) não aplicam pelo painel: o clique volta à lista e "Aplicar" fica desabilitado |
| D9 | Ao abrir a prévia de gráficos, o console avisa `[Sarak:Icon] ícone "Gauge" fora do contrato`. Origem: `src/features/DesignEngine/Canvas/Mocks/ChartsMock.tsx:25` |

**Lote 3 — texto da migração**

| Id | Defeito |
|---|---|
| D15 | `docs/migracoes.md`, seção "P e G do tamanho da fonte…": diz que os tokens ficam na decisão Layout, e o painel os mostra em Barras. Seção "nomes visíveis do painel": promete "Dark mode (padrão)/Light mode" como rótulo, e o seletor de modo mostra "Claro/Escuro" e "Light/Dark", com controle próprio |

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/` e `src/core/Provider/utils/`: a linha de base da extração e a semente do tema (D2, D16, PD).
- `src/features/DesignEngine/Main/utils/paletteDraft.ts`: a contagem do diálogo (PD).
- `src/core/Design/presets/themes/compose.ts`: só o que o D3 exigir (o valor do usuário vence o par de modo nos tokens que ele
  escolheu).
- `src/core/Design/presets/components/layout.ts`: `sidebarTone: 'surface'` na Compacta (D4).
- `src/styles/_base.css`: `--bg-body` passa a seguir a cor de fundo base (D5).
- `src/core/Design/presets/components/personalities.ts`, `src/features/DesignEngine/Main/utils/personalityDraft.ts`,
  `src/features/DesignEngine/Canvas/components/PersonalityCatalog.tsx` (D11).
- `src/features/DesignEngine/Canvas/Mocks/ChartsMock.tsx`: um ícone do contrato no lugar de `Gauge` (D9).
- `docs/migracoes.md`: as duas frases do D15, mais uma nota por comportamento visível que mudar. Depois, `npm run guide` para o kit
  derivado.
- Testes de unidade e de integração dos itens acima.

## 3.2 Fora
- A opção `configIsSavedDesign`, `useDesignSync` e `useThemeSeed` com `activeThemeId` controlado. São da `plan-175` e do backlog
  #95, salvo se a causa do D2 estiver comprovadamente no mesmo trecho; nesse caso, relate antes de mexer.
- Cores de tema e `chromeToneContrast.ts` (`plan-176`); componentes do cromo e do painel por foco e nome (`plan-177`). As três correm
  em paralelo.
- `src/core/Design/presets/themes/color-engine.ts`: se a causa do D3 estiver nele, pare e relate.
- Mudar o rótulo do seletor de modo no painel: o D15 se resolve no texto da migração, que acompanha o que o painel faz.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| ADR | `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` | a promessa e a linha de base |
| ADR | `specs/adr/027-paleta-do-tema-paleta-por-cima-e-paletas-salvas-no-design.md` | paleta e paletas salvas |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | composição, par de modo e preservação |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | personalidades, diálogo da paleta e prévia |
| Doc | `docs/persistencia-de-tema.md` | as três formas de carga (`onLoad`, `initialTheme`, `config`) |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `test-unitario` | caso que falha antes da correção |
| Código | `src/features/DesignEngine/hooks/__tests__/configIsSavedDesign.persistenceIntegration.test.tsx` | molde de integração com o Provider e o painel |

# 5. Instruções de execução

Em cada item, **o teste que falha vem antes da correção**. Registre no resumo a falha antes e a passagem depois.

## Lote 1 — o que o design gravado guarda

1. **D2.** Teste de integração com o Provider: `onLoad` com neo-brutalism, sem `initialTheme`, tom "Invertida", Aplicar → `onSave`
   recebe só `sidebarTone`. Isole a causa pela medida e corrija.
2. **D16.** No mesmo molde, com sarak-sovereign:
   - aplicar uma escolha qualquer não grava `layout`;
   - aplicar o modo escuro grava `mode` e nenhuma cor calculada.
3. **D3.** `cardTextureOpacity: 0.5` escolhido vale 0,5 nos dois modos, nos três temas do contexto.
4. **PD.** Sem ajuste à mão, trocar de paleta não abre o diálogo. Com 2 cores ajustadas, o diálogo diz 2.

## Lote 2 — presets e personalidades

1. **D4.** Compacta grava e pinta `sidebarTone: 'surface'`.
2. **D5.** Com "Cor de Fundo Base" `#f3eadb`, o `body` pinta `#f3eadb`. Se a medida no jsdom não alcançar a cascata real, use uma
   spec de navegador curta em `browser-tests/` e rode só ela.
3. **D11.** As 4 personalidades de topo aplicam pelo painel e habilitam "Aplicar". O teste cobre as 10.
4. **D9.** Abrir a prévia de gráficos não gera aviso `[Sarak:Icon]`.

## Lote 3 — texto da migração

1. **D15.** Corrija as duas frases de `docs/migracoes.md` para o que o painel faz e rode `npm run guide`.

## Verificação do executor (uma vez, no fim)

- `npx vitest run` com filtro nos testes novos, nos testes de `src/core/Provider`, `src/features/DesignEngine/Main` e
  `src/features/DesignEngine/hooks`, e nos de `src/core/Design/presets`;
- `npm run verify -- --tier=quick`;
- `npm run build`, mais a spec de navegador do D5, se tiver sido criada.

**Não** rode a suíte completa nem a bateria `cromo-css-real:check` inteira. As duas rodam uma vez, no fechamento da campanha da rc.2.

# 6. Critérios de aceite

- [ ] Cada id (D2, D16, D3, PD, D4, D5, D11, D9) tem um teste que falhava antes da correção e passa depois. O resumo traz as duas
      saídas.
- [ ] A causa do D2 está descrita no resumo pela medida, com `arquivo:linha`.
- [ ] `docs/migracoes.md` descreve o painel como ele é, e o kit derivado está em dia.
- [ ] Os comandos da verificação do executor passam, e o resumo traz a saída final de cada um.
- [ ] `git diff --stat` mostra só caminhos da §3.1, mais os arquivos do kit derivado.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor **não repete** os comandos do executor. Ele confere:
- `git diff --stat` contra a §3.1.
- **Mutação, em cópia fora do repositório:** desfaça a correção do D2, do D3 e do D4, uma por vez → o teste correspondente tem de
  reprovar.
- Leitura da causa do D2 no código, no `arquivo:linha` do resumo.

# 8. Destino da síntese

**Destino:** `—`. Os comportamentos já estão prometidos pelo ADR-026 e pela migração da 9.0.0; esta plan corrige o código para
cumpri-los. O texto que muda (D15) é a própria migração, corrigida nesta execução.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-25

**Resultado:** Concluído com pendências (D5 e D11 não corrigidos; motivo abaixo)

**Estado do worktree ao iniciar**
Modificados: dist/ (BUILD_INFO, index.*, chunks removidos), specs/00-indice.md, src/buildInfo.ts, src/core/Provider/buildInfo.ts. Não rastreados: dist/ (chunks novos), plan-176, plan-177, plan-178.

**O que foi feito**
- D2 — causa medida: com `onLoad` sem `initialTheme`, o tema embarcado do id gravado nunca entrava em memória (só `useThemeReadiness.ts:48` carrega, e só o id pedido por código). `toPersisted` (`useDesignChoices.ts:84-88`) não achava o tema (`findThemeEntry`) e gravava o design inteiro (436 chaves). A hipótese do plan (linha de base composta com o tema padrão) não se confirmou. Correção: `useResolvedThemeLoad.ts` (novo), chamado em `SarakUIProvider.tsx:102`.
- D16 — `useDesignDraft.ts` inventava `layout: 'glass'` no rascunho (linha removida; `ThemeCustomizationTab.tsx:213` já tem o recuo 'glass'). Modo claro e a volta ao escuro não gravaram cor calculada em nenhuma medida.
- D3 — causa: `applyColorMode` (`overlayPreferences.ts`) reescrevia, nos dois caminhos, o valor escolhido com o da contraparte. Novo `chosenModeValues.ts`: valor não-cor que difere do declarado no modo atual (ou do padrão do schema) não volta ao par. Não toquei em color-engine nem compose.ts.
- PD — causa: a referência era só a paleta pura, e o tema declara/corrige cores por cima (21 em neo-brutalism, 1 em cyberpunk-neon, 3 em industrial-terminal). `findThemeColorAdjustments` (paletteDraft.ts) usa a linha de base de `extractDesignChoices`; `usePaletteSelection` recebe `theme` (de PaletteSection, BrandShortcut, ThemeDecisionOptions, ThemeSidebarContent) e lê `getHostConfig` do Provider.
- D4 — `layout.ts`: `sidebarTone: 'surface'` na Compacta (e o comentário do arquivo). `presetsReadable.test.ts:78` listava só os 5 presets de tom; incluí `sidebar-compact`.
- D9 — `ChartsMock.tsx:25`: 'Gauge' → 'Thermometer' (está em `SARAK_ICON_NAMES`).
- D15 — `docs/migracoes.md`: P/G ficam em Barras, pergunta "O que aparece" (confirmado em design-decisions.json); o seletor de modo do topo segue "Claro/Escuro". `npm run guide` rodou.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| src/core/Provider/hooks/useResolvedThemeLoad.ts | criado | carrega o tema embarcado resolvido |
| src/core/Provider/SarakUIProvider.tsx | alterado | chama o hook |
| src/core/Provider/utils/chosenModeValues.ts | criado | valores escolhidos que a troca de modo preserva |
| src/core/Provider/utils/overlayPreferences.ts | alterado | usa chosenModeValues nos dois caminhos |
| src/features/DesignEngine/hooks/useDesignDraft.ts | alterado | sem `layout` inventado |
| src/features/DesignEngine/Main/utils/paletteDraft.ts | alterado | findThemeColorAdjustments |
| src/features/DesignEngine/Main/hooks/usePaletteSelection.ts | alterado | usa a linha de base do tema |
| Main/components/PaletteSection, BrandShortcut, ThemeDecisionOptions, ThemeSidebarContent (.tsx) | alterado | passam o tema |
| src/core/Design/presets/components/layout.ts | alterado | Compacta com sidebarTone surface |
| src/features/DesignEngine/Canvas/Mocks/ChartsMock.tsx | alterado | ícone do contrato |
| docs/migracoes.md, sarak-ui/docs/migracoes.md | alterado | D15 (o segundo é derivado) |
| testes criados: designGravado.persistenceIntegration, personalitiesApply.integration, PersonalityTopbar.integration, chosenModeValues, useResolvedThemeLoad, layoutPresets | criado | cobertura |
| testes alterados: usePaletteSelection, paletteDraft, ChartsMock, presetsReadable | alterado | cobertura |

**Verificações executadas**
- Falha antes / passa depois, por mutação local: D2 (3 casos falham sem a chamada do hook, passam com ela); D3 (3 falham sem o filtro, 9/9 com ele); D9 (falha com 'Gauge', passa com 'Thermometer'); D16 (o teste acusou `layout:'glass'` antes da remoção, passa depois); PD (6 casos falharam sem o tema: 8, 3 e 5 cores contra 0, e "2" não aparecia).
- Bateria src/core/Provider, core/Design/presets, DesignEngine/{hooks,Main,Canvas/Mocks}: 180/181 arquivos, 1726/1727 testes. O único vermelho (presetsReadable:76) foi corrigido e o arquivo passa (27/27). Não reexecutei a bateria inteira depois.
- `npm run verify -- --tier=quick`: 3 falhas — (a) audit:baseline órfão de cobertura = meu hook sem teste, corrigido com useResolvedThemeLoad.test.ts, auditor_coverage agora OK; (b) plan-index:check: plan-176 (índice 🟡 × frontmatter 🟠), não é minha; (c) dev-kit:check: sarak-dev defasado, não regenerei (fora do escopo). Não reexecutei o quick completo depois das correções.
- `npm run build` NÃO rodado: dist/ é compartilhado com a plan-176 em paralelo.

**Critérios de aceite**
- [ ] Todo id com teste que falhava antes — D5 sem correção; D11 sem teste que falhe (abaixo).
- [x] Causa do D2 descrita com arquivo:linha.
- [x] docs/migracoes.md corrigido e kit derivado em dia (guide:check OK).
- [ ] Comandos de verificação: build não rodado; quick com 2 falhas alheias.
- [x] git diff dentro da §3.1, mais testes, hook/módulo novos em src/core/Provider e o kit derivado.

**Decisões e suposições**
- D3: cor fica fora da regra (a troca de modo continua substituindo-a, com o aviso existente de discardsCustomColor).
- D5 NÃO implementado: a §3.1 cita `--sarak-bg-base-color`, que não existe; a variável do token é `--sarak-bg-base`. O schema (atmosphere.ts:98-104) diz que bgBaseColor pinta o vidro e que o corpo é colorBgBody (dono de `--bg-body`). Fazer `--bg-body` seguir bgBaseColor cria segundo dono da variável (R41) e, como bgBaseColor é sempre injetado, colorBgBody deixaria de pintar o corpo. Nos temas embarcados os dois valem o mesmo. Decisão do revisor: (1) `--bg-body` segue bgBaseColor (colorBgBody perde o efeito no corpo); (2) a edição de "Cor de Fundo Base" no painel grava também colorBgBody; (3) só rótulo/descrição, dizendo que o corpo é "Fundo Global (Body)".
- D11 NÃO reproduzido: as 10 Personalidades aplicam e habilitam o Aplicar no rascunho (personalitiesApply.integration) e no painel completo em jsdom (PersonalityTopbar.integration), então esses testes passam antes e depois. Hipótese não confirmada: no consumidor real, mudar `navigationStyle` para topbar remonta o painel no cromo. Pede spec de navegador (browser-tests/), que não rodei por causa do dist/ compartilhado. Os dois testes ficam como regressão.
- Nenhuma nota nova em migracoes.md: D2/D3/D4/D16 cumprem promessas já escritas.

**Achados fora do escopo (não corrigidos)**
- plan-index:check acusa plan-176; dev-kit defasado.
- O rótulo "Cor de Fundo Base" induz a crer que pinta a página (ligado ao D5).

**Pendências / riscos**
- D5 e D11 (acima). Build e quick completo por rodar.
- Um crash de worker do vitest apareceu uma vez sob carga da máquina, não se repetiu.

---

# 10. Veredito

## Veredito — 2026-11-25 — 🔴 Devolvida para completar (D5, D11 e o build)

O que foi entregue está correto e pode ser commitado agora como lote. A plan volta para o D5, o D11 e a verificação que faltou.

**O que foi verificado:**
- **Diff:** dentro da §3.1. Os dois arquivos novos de `src/core/Provider/` (`useResolvedThemeLoad.ts` e `chosenModeValues.ts`) estão sob
  "`src/core/Provider/` e `src/core/Provider/utils/`".
- **Causa do D2**, lida no código: o id que chega pelo `onLoad` não passa pela espera do Provider, e o `toPersisted` não acha o tema.
  O hook novo em `SarakUIProvider.tsx:103` fecha isso.
- **Mutação, em cópia fora do repositório:**

  | Mutação | Teste | Resultado |
  |---|---|---|
  | sem `useResolvedThemeLoad` (D2) | `designGravado.persistenceIntegration` | 3 de 6 reprovam |
  | `chosenModeValueKeys` vazio (D3) | `chosenModeValues` | 3 reprovam, um por tema |
  | Compacta sem `sidebarTone` (D4) | `layoutPresets` | 2 de 2 reprovam |

- **Sonda do D3 nos 25 temas:** `chosenModeValueKeys` sobre `composeThemeForMode(tema, modo)`, sem nenhuma escolha. Deu 0 chaves nos
  50 pares, então nenhum valor do tema é tomado por escolha e a troca de modo continua trocando o que o tema declara.
- **`npx tsc --noEmit`:** 0 erros.

**Achados:**

1. **D5: a decisão é a opção (3), estendida.** O schema já define os donos. `colorBgBody` pinta o corpo e é dono de `--bg-body`.
   `bgBaseColor` pinta o vidro, a gaveta e os painéis, e é dono de `--sarak-bg-base` (`src/core/Design/schema/atmosphere.ts:55-108`).
   O defeito é o painel chamar de "Cor de Fundo Base" um controle que não pinta a página.
   - A opção (1) dá a `--bg-body` um segundo dono (R41).
   - A opção (2) grava `colorBgBody` sem o usuário escolher (ADR-026).

   **Correção:**
   - O rótulo e a descrição de `bgBaseColor`, nos seis idiomas, dizem o que ele pinta (vidro, gaveta, painéis).
   - Em Cores → Ajustes principais, o controle que pinta a página é o `colorBgBody`, com rótulo que diz isso. Se ele não estiver
     nesse grupo, entra nele.
   - **Teste:** nesse grupo, editar o controle da página para `#f3eadb` faz `--bg-body` valer `#f3eadb`.
   - Uma nota em `docs/migracoes.md`, porque um rótulo visível muda.
   - **Arquivos:** o schema, o catálogo de idiomas e o agrupamento do painel. Entram na §3.1 só para isto.
2. **D11 não foi reproduzido onde o defeito foi medido.** A `plan-173` mediu com o painel **dentro do cromo**, numa rota do app: o
   harness monta `SarakCustomizationPanel` na rota `/design` dentro do `SarakUIProvider` com `SarakAppChrome`
   (`C:\Users\Igor\AppData\Local\Temp\sarak-rc1-completo\harness\entry.tsx`, linhas 61-62, 91-100 e 117-126). O jsdom com o painel solto não
   tem esse caminho.

   **Correção:**
   - **Spec de navegador curta** em `browser-tests/`: o painel nessa montagem, Personalidades → Executivo. A spec espera que o
     cartão fique selecionado e que "Aplicar" fique habilitado. Rode só ela, depois do `npm run build`.
   - Se reproduzir, corrija a causa medida. A hipótese do resumo é que o rascunho com `navigationStyle: "topbar"` troca o cromo e
     remonta o conteúdo.
   - `src/components/Layout/chrome/` entra na §3.1 só para essa causa. A `plan-177` ainda não começou.
   - Se não reproduzir, registre a medida e feche o D11 como "não é da lib".
3. **Verificação que faltou:** `npm run build` e `npm run verify -- --tier=quick`, uma vez, no fim desta rodada.
   - O `plan-index:check` fica verde: o índice foi regenerado.
   - O `dev-kit:check` defasado não é desta plan: o kit se regenera no fechamento da campanha.

**Arquivos proibidos nesta rodada:** a `plan-176` passa a mexer em `src/core/Provider/utils/overlayPreferences.ts`, no caminho de
modo do Provider e em `src/components/atomic/Navigation/SarakShellUserWidget.tsx`. Não toque neles.
