---
tipo: "plan"
titulo: "Dar ao painel de temas um caminho simples: escolher um tema, ajustar o que pesa, aplicar"
objetivo: "Fazer o painel de temas contar um caminho de tres passos sem jargao, com poucos botoes, uma galeria que abre sob demanda, preview que acompanha o que se edita e um unico jeito de aplicar"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel de customização"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "design-engine", "painel", "ux", "preview"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[02-design-engine]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "plan-99-achar-e-priorizar-no-painel-de-temas"
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Quem abre o painel de temas entende, sem ler nada, o que fazer: **1. escolher um tema → 2. ajustar o que pesa →
3. aplicar**. O topo da barra lateral tem só o essencial; há **um** verbo para guardar o trabalho; a galeria de
estilos **abre quando se pede**; o preview mostra a tela do que se está editando; as telas do preview têm nome de
gente; e escolher um tema **nunca** grava sem o usuário aplicar.

Três lotes, **um por conversa de execução**, veredito entre eles. Dependem da **plan-99** (busca e modo Impacto):
as duas mexem no cabeçalho e na lista de controles da barra lateral, e a ordem evita colisão de arquivo.

# 2. Contexto

**Pedido do dono (2026-10-05), sobre o que já existia:** o painel deve ser **intuitivo e simples**. Das treze
observações que a análise levantou, o dono aceitou todas menos o reset por controle (descartado); a de busca com
caminho e a lista plana do modo Impacto foram para a plan-99. Duas decisões dele moldam esta plan: **o botão
"Empilhar" existe para as duas prévias ficarem uma abaixo da outra, ambas ocupando praticamente toda a tela**
— e a galeria "pode abrir sob demanda".

**O que foi medido (2026-10-05):**

| Fato | Onde |
|---|---|
| O cabeçalho da barra lateral junta, antes do primeiro controle: título com versão, quatro botões **só de ícone** (Preview, Catálogo, Templates, Command Center), Exportar, três botões de dispositivo, busca, dois interruptores e "Aplicar Alterações Globais" — cerca de **40 % da altura** na captura do dono | `Main/components/ThemeSidebarHeader.tsx:41-171` |
| **Cinco verbos** para guardar/descartar: "Commit {pilar}" (um por pilar, termo de Git), "Aplicar Alterações Globais", "Exportar"/"**Exportado**" (rótulo de quando nada mudou, parece uma confirmação), "Desfazer última aplicação" e "Descartar Alterações neste Pilar" | `components/controls/LayoutControls.tsx:52-66` · `ThemeSidebarHeader.tsx:72,156,168` |
| **Dois comportamentos para a mesma ação:** escolher tema pela galeria só altera o **rascunho**; escolher pela aba Templates **aplica e grava na hora** (`applyFullConfig` + `persistDesign`). O código do próprio painel explica por que a regra é o rascunho | `Main/TemplatesTab.tsx:21-28` × `Main/ThemeCustomizationTab.tsx:97-108` |
| A aba Templates ensina "Passe para o **DesignProvider**" — nome que **não existe** na lib (o provedor é o `SarakUIProvider`) | `Main/TemplatesTab.tsx:58` |
| A galeria de estilos (Temas, Cards, Tipografia, Atmosfera, Botões, Campos) é a **metade direita** do modo Preview, sempre aberta. Com a barra lateral de 320 px, o preview do usuário vira uma faixa estreita. O cabeçalho dela é "Design Intelligence Catalog" e as abas, em inglês ("Typography", "Atmosphere", "Buttons", "Inputs") | `Canvas/PreviewCanvas.tsx:109-134` · `Canvas/components/PresetsCatalog.tsx:29-35,59` |
| O **"Empilhar"** põe as duas prévias uma sobre a outra, mas com **`45vh` de altura fixa** cada — unidade de **janela**, não do contêiner. A spec do painel diz que ele se adapta ao **contêiner** (spec 06 §6.2.1); embutido numa aba ou drawer, o `45vh` erra | `Canvas/hooks/useDeviceStyles.ts:21` · `PreviewCanvas.tsx:127` |
| A ligação **tela do preview → pilar** existe (um `useEffect`); a ligação **pilar → tela**, só para um pilar (`advanced` → `matrix`). Abrir "Tipografia" não leva o preview à tela de tipografia. O mesmo `useEffect` **sobrescreve na montagem** o pilar inicial (`brand` vira `surfaces`) | `Main/hooks/usePreviewUIState.ts:20-39` · `Main/components/ThemePillarsList.tsx:71` |
| O menu do preview lista as **14 telas pelo id cru** ("caixas texto", "kitchen sink", "forms", "matrix", "auth", "tabela"), em inglês e português misturados | `Canvas/components/PreviewSystemRenderer.tsx:44-52` · `Canvas/hooks/usePreviewApps.tsx:15-28` |
| Os rótulos de controle usam **maiúsculas, 8–10 px e espaçamento largo** (`uppercase tracking-…`); cada seção tem `p-6` numa barra de 320 px | `components/controls/LayoutControls.tsx:40,98,111` · `ThemeSidebarHeader.tsx:128` |
| **Ruído de desenvolvedor** no painel: "Central de Comando", um selo vermelho pulsando "**v13.9 – AUDIT ACTIVE**", outro "**v12.0 Sovereign**", "Design Engine **v14.0**" (três números que não são a versão da lib), e pilares numerados "1." a "7." | `Library/CustomizationPanel/CustomizationPanelImpl.tsx:19-28` · `ThemeSidebarHeader.tsx:49` · `config/design-pillars.json` |
| O **dispositivo** escolhido decide qual valor de um token responsivo se edita (`mob`/`tab`/`desk`), e nada na tela diz isso | `Main/components/TokenControl.tsx:46-60` |
| Duas taxonomias de pilar convivem: 7 em `design-pillars.json` e 6 em `SOVEREIGN_PILLARS` (Command Center). **Não é escopo desta plan** — vai ao backlog | `Panels/hooks/useSovereignSearch.ts:6-13` |
| `ThemeCustomizationTab.tsx` tem **243 linhas**: o teto da R9 é 250. Todo o encaixe novo precisa de **extração**, não de linha a mais ali | `Main/ThemeCustomizationTab.tsx` |

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

**Lote 1 — cabeçalho, verbos, legibilidade, ruído**
- `src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx` — enxuto: título, busca, seletor de modo
  (o da plan-99).
- `src/features/DesignEngine/Main/components/ThemeActionBar.tsx` — **novo**: a barra fixa embaixo.
- `src/features/DesignEngine/Canvas/components/PreviewToolbar.tsx` — **novo**: a barra do preview.
- `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` · `Main/components/ThemeSidebarContent.tsx` — o
  encaixe (com extração; ver §2, teto da R9).
- `src/features/DesignEngine/components/controls/LayoutControls.tsx` · `components/controls/*.tsx` (rótulos de
  controle) · `Main/components/ThemeGlobalSettings.tsx` — sem "Commit", sem número de pilar, caixa normal,
  respiro menor.
- `src/features/DesignEngine/config/design-pillars.json` — **só** o `title` e a numeração; `id` e `categories`
  não mudam.
- `src/features/DesignEngine/hooks/useDesignDraft.ts` — a contagem de alterações; sai o que ficar sem uso
  (`handleApplyComponent`) **com os seus testes**.
- `src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl.tsx` — sem selos nem título de
  jargão.
- Testes ao lado.

**Lote 2 — começar por um tema, preview que acompanha, telas com nome**
- `src/features/DesignEngine/Canvas/PreviewCanvas.tsx` · `Canvas/hooks/useDeviceStyles.ts` ·
  `Canvas/components/LiveDraftPreviewFrame.tsx` — a galeria aberta/fechada e o empilhado sem unidade de janela.
- `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx` — título e rótulos das abas em português, mais
  o botão de fechar.
- `src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx` — o bloco "Começar de um tema".
- `src/features/DesignEngine/Main/hooks/usePreviewUIState.ts` · `Main/components/ThemePillarsList.tsx` — a
  ligação pilar ↔ tela sem laço.
- `src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx` · `Canvas/hooks/usePreviewApps.tsx` ·
  `src/features/DesignEngine/Canvas/Mocks/MoreScreensMock.tsx` (**novo**) — telas com nome e "Mais telas".
- `src/features/DesignEngine/Main/TemplatesTab.tsx` — escolher passa a alterar só o rascunho; o guia
  desatualizado sai.
- Testes ao lado.

**Lote 3 — controles e menu Avançado**
- `src/features/DesignEngine/Main/components/TokenControl.tsx` — o selo de dispositivo.
- `src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx` — os três botões de ícone que sobraram
  (Catálogo, Templates, Command Center) viram **um** menu "Avançado".
- Testes ao lado.

**Nos três lotes:** `dist/`, `sarak-ui/`, `sarak-dev/` regenerados pelos comandos, nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- A **busca** e o **modo Impacto** (plan-99): ela já tem o seletor de modo e a lista plana; esta plan só os
  reencaixa no cabeçalho novo.
- **Reset por controle** (o dono descartou) · reescrever **nomes de token** do catálogo (`name`, `description`)
  — esta plan muda os títulos de **pilar**, não os dos controles.
- `HyperGranularityTab.tsx` e a taxonomia de 6 pilares dele (vão ao backlog) · `MasterControlPanel.tsx` (a
  tabela do catálogo) — só **o jeito de chegar** neles muda.
- A **geometria dos dispositivos** (largura 375/768, molduras) e o `useContainerScale`.
- O motor de design, o schema, `theme_table_mapping.json`, o catálogo de tokens.
- `src/components/Layout/**` e o cromo (ADR-018 e plan-89) · `src/styles/` (plan-90) · textos do painel em
  outros idiomas (o painel é pt-BR hoje).
- **Dependência nova.**

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | §4 (rascunho × persistido: a regra de "aplicar"), §4.2 (desfazer), §6.2 e §6.2.1 (preview, e o painel mede o **contêiner**, não a janela), §9 |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | §6 e §6.1 — a camada de container query: o empilhado não pode usar unidade de janela |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §2.4 — teclado e ARIA nos controles novos (barra, menu Avançado, galeria) |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R9 (arquivo ≤ 250 linhas), R36 (comentário não cita plan), a regra de zero hardcode (tamanhos por token) |
| Spec fixa | `specs/arquitetura/02-design-engine.md` | o ciclo rascunho → sistema |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | cada comportamento novo |
| **Skill** | `ui-novo-componente` | a barra de ações, a barra do preview e a tela "Mais telas" |
| **Skill** | `ui-arquitetura-design` | estilo por token nos controles e rótulos |
| Código | `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` · `src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx` · `src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx` · `src/features/DesignEngine/Main/components/ThemePillarsList.tsx` · `src/features/DesignEngine/Main/components/TokenControl.tsx` · `src/features/DesignEngine/Main/hooks/usePreviewUIState.ts` · `src/features/DesignEngine/Main/TemplatesTab.tsx` | ler antes de editar |
| Código | `src/features/DesignEngine/Canvas/PreviewCanvas.tsx` · `src/features/DesignEngine/Canvas/hooks/useDeviceStyles.ts` · `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx` · `src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx` · `src/features/DesignEngine/Canvas/hooks/usePreviewApps.tsx` | ler antes de editar |
| Código | `src/features/DesignEngine/components/controls/LayoutControls.tsx` · `src/features/DesignEngine/hooks/useDesignDraft.ts` · `src/features/DesignEngine/config/design-pillars.json` · `src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl.tsx` | ler antes de editar |

# 5. Instruções de execução

**Lote 1 — cabeçalho, verbos, legibilidade, ruído**

1. **A barra do preview** (`PreviewToolbar.tsx`), acima do preview: o seletor de **dispositivo** (Desktop, Tablet,
   Mobile) e o interruptor **"Empilhar previews"**, que saem do cabeçalho da barra lateral. Mesmo estado, mesmos
   manipuladores, só mudam de lugar.
2. **O cabeçalho da barra lateral** fica com: título curto ("Design", **sem versão**), a **busca** e o **seletor de
   modo** da plan-99. Os quatro botões de ícone **continuam** neste lote (saem no lote 3), mas **com rótulo
   visível ou `title`** já existente — não os remova ainda. Sai daqui o dispositivo, o "Empilhar", o Exportar e o
   Aplicar.
3. **A barra de ações** (`ThemeActionBar.tsx`), **fixa embaixo** da barra lateral (a área de controles rola entre
   o cabeçalho e ela): **`Aplicar (N)`**, onde N = número de tokens do rascunho que diferem do sistema (`0` →
   botão desabilitado e sem número); **`Descartar`** (volta o rascunho ao sistema); **`Exportar`** (rótulo fixo,
   **nunca** "Exportado"; segue desabilitado enquanto não há o que exportar, como hoje); **`Desfazer última
   aplicação`** como link discreto, só quando `canUndoLastApply`. Os textos vêm de constantes do módulo, não
   espalhados pelo JSX.
4. **Some o "Commit {pilar}"** e o aplicar por pilar. **Fica** o descartar por pilar (ícone ↺ com
   `title`/`aria-label` "Descartar alterações deste pilar"). `handleApplyComponent` e o que só ele usava saem
   **com os testes**; se algo ainda o usar, pare e relate.
5. **Legibilidade.** Rótulo de **controle** (`ColorControl`, `SliderControl`, `SelectControl`, `SwitchControl`,
   `InputControl` e demais em `components/controls/`) em **caixa normal**, sem `uppercase` nem espaçamento largo,
   com tamanho **≥ 12 px** pelos tokens de tipografia do projeto (nunca px solto). Maiúsculas continuam só em
   etiqueta curta de seção. O respiro das seções cai de `p-6` para um valor menor, por token de espaçamento.
6. **Ruído.** O `CustomizationPanelImpl` perde os dois selos e o título vira **"Personalizar o tema"**.
   `design-pillars.json`: tira o número do `title` e o número do selo do pilar, e passa os títulos a: **Marca e
   cores** · **Fontes e texto** · **Superfícies e cards** · **Botões, campos e animação** · **Navegação e
   layout** · **Dados e gráficos** · **Avançado**. `id` e `categories` ficam como estão.
7. Mantenha `ThemeCustomizationTab.tsx` **≤ 250 linhas**: o encaixe novo vai em hooks/componentes extraídos.
8. Testes (skill `test-unitario`): ver §6. Entregue o lote 1 e **pare para o veredito**.

**Lote 2 — começar por um tema, preview que acompanha, telas com nome**

9. **Galeria sob demanda.** Novo estado `isGalleryOpen` (padrão **`false`**). Fechada: o preview do rascunho ocupa
   **toda** a área. Aberta: a galeria aparece **ao lado** do preview ou, com "Empilhar previews" ligado,
   **abaixo**, cada uma ocupando **metade da altura do contêiner** (flex, `min-h-0`), **sem `vh`** e sem altura
   fixa em unidade de janela — o objetivo do "Empilhar" é as duas ficarem grandes ocupando o espaço, e isso tem
   de valer dentro de qualquer host. O "Empilhar previews" só tem efeito com a galeria aberta: fechada, o
   interruptor fica **inativo** (`aria-disabled`), com `title` dizendo o motivo.
10. **"Começar de um tema"** (primeira coisa da área de controles, acima do bloco global): um bloco com uma frase
    e o botão **"Abrir galeria"** / **"Fechar galeria"** (o mesmo estado). A galeria ganha também um botão de
    fechar no cabeçalho dela.
11. A galeria passa a se chamar **"Galeria de estilos"** e as abas, **Temas · Cards · Tipografia · Atmosfera ·
    Botões · Campos** (hoje "Globais", "Typography", "Atmosphere", "Buttons", "Inputs").
12. **Templates (defeito).** Escolher um tema em `TemplatesTab` passa a **só alterar o rascunho**, pelo **mesmo
    caminho** que a galeria usa (`handleApplyFullTheme`); sem `applyFullConfig`, sem `persistDesign`, sem
    `setResolvedThemeId` ao clicar. Sai o "Guia Rápido" (cita um nome que não existe). O que **grava** continua
    sendo só o `Aplicar` da barra de ações.
13. **Ligação pilar ↔ tela, sem laço.** Troque o `useEffect` de `usePreviewUIState` por **dois gestos
    explícitos**: `selecionarTela(app)` — vindo do menu do preview — define a tela e o pilar dela; e
    `selecionarPilar(id)` — vindo da barra lateral — define o pilar e a **tela canônica** dele. Tabela inicial
    (o executor ajusta e **justifica no resumo** se uma tela não existir): `brand` → `auth` · `typography` →
    `typography` · `surfaces` → `dashboard` · `interaction` → `caixas-texto` · `navigation` → `dashboard` ·
    `systems` → `settings` · `advanced` → `matrix`. **Cada gesto muda o outro lado uma vez e para** — selecionar
    o pilar `navigation` **não** pode devolver o pilar a `surfaces` por a tela `dashboard` pertencer a ele. O
    estado inicial é um **par coerente** (pilar e tela que se correspondem), não um pilar sobrescrito na
    montagem. Pilar já aberto cuja tela atual o contém: não troca a tela.
14. **Telas com nome.** Um mapa de rótulos humanos para as telas, e **seis principais** no menu do preview, nesta
    ordem: **Painel** (`dashboard`) · **Formulário** (`forms`) · **Tabela** (`tabela`) · **Texto**
    (`caixas-texto`) · **Gráficos** (`graficos`) · **Tipografia** (`typography`). Um sétimo item, **"Mais
    telas"**, mostra a tela `MoreScreensMock` — uma grade de botões com as telas restantes (**Componentes,
    Entrar, Chat, Registros, Configurações, Documentos, Matriz, Todos os componentes**), cada uma levando à sua
    tela; quando uma delas está ativa, o item "Mais telas" aparece como o ativo. Nada de submenu no cromo.
15. Testes e entrega do lote 2: **pare para o veredito**.

**Lote 3 — controles e menu Avançado**

16. **Selo de dispositivo.** Em todo controle de token com `isResponsive`, um selo pequeno ao lado do rótulo:
    **"Só no Mobile"**, **"Só no Tablet"** ou **"Desktop"**, conforme o dispositivo do preview, com `title`:
    "Este valor vale só para <dispositivo>. Troque o dispositivo na barra do preview para editar os outros."
    Token **não** responsivo não mostra selo.
17. **Menu "Avançado".** Os três botões de ícone que restaram no cabeçalho (Catálogo, Templates, Command Center)
    viram **um** botão **"Avançado"** que abre um menu com três entradas — **Tabela de tokens**, **Busca por
    pilar**, **Temas e JSON** — e uma volta explícita ao modo normal. A tela principal (os pilares) é o padrão e
    não tem botão. Teclado: abre com Enter/Espaço, setas navegam, Esc fecha e devolve o foco.
18. `npx tsc --noEmit` · `npm run build` · `npm run guide` · `npm run catalog` · `npm run dev-kit` ·
    `npx vitest run` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → verdes, sem regressão.

# 6. Critérios de aceite

**Lote 1**
- [ ] O cabeçalho da barra lateral **não** contém dispositivo, "Empilhar", Exportar nem Aplicar; a **barra do
      preview** contém dispositivo e "Empilhar previews", e mudar de dispositivo continua trocando o preview e
      o valor responsivo editado (teste).
- [ ] A barra de ações mostra `Aplicar (N)` com N = tokens do rascunho que diferem do sistema (teste com 0, 1 e
      3 alterações); `Descartar` volta o rascunho ao sistema (teste); `Exportar` **nunca** vira "Exportado"
      (teste); `Desfazer última aplicação` só aparece com `canUndoLastApply`.
- [ ] `git grep -n "Commit " -- src/features/DesignEngine` não devolve texto de interface; não há aplicar por
      pilar; o descartar por pilar existe (teste).
- [ ] Nenhum rótulo de controle tem `uppercase`/espaçamento largo nem tamanho abaixo de 12 px (teste de classe
      sobre os controles); nenhuma medida solta (a auditoria de hardcode não piora).
- [ ] Os dois selos e o título antigo saíram do `CustomizationPanelImpl`; `design-pillars.json` não tem número no
      `title`, tem os sete títulos novos e os mesmos `id` e `categories` (teste).
- [ ] `ThemeCustomizationTab.tsx` ≤ 250 linhas e nenhum arquivo novo acima disso.

**Lote 2**
- [ ] `isGalleryOpen` padrão `false`: com a galeria fechada, o preview ocupa toda a área e **só** o preview
      existe (teste); aberta, os dois existem; fechada de novo, um só.
- [ ] Empilhado: nenhuma classe/estilo com unidade `vh` define a altura das duas prévias
      (`git grep -n "45vh\|vh\]" -- src/features/DesignEngine/Canvas` não devolve o empilhado); as duas ocupam
      metade da altura do contêiner (**medido pelo revisor no navegador**, não por jsdom).
- [ ] "Empilhar previews" fica `aria-disabled` com a galeria fechada e ativo com ela aberta (teste).
- [ ] O bloco "Começar de um tema" abre e fecha a galeria (teste); o cabeçalho dela diz "Galeria de estilos" e
      as abas, em português.
- [ ] Escolher um tema em `TemplatesTab` **não** chama `applyFullConfig`, `persistDesign` nem
      `setResolvedThemeId` — chama só o caminho do rascunho (teste que **falha** se alguém reintroduzir a
      chamada); o texto "DesignProvider" não existe mais.
- [ ] Clicar num pilar leva o preview à tela canônica dele e o pilar **continua** o clicado (teste, um por
      pilar da tabela, inclusive `navigation` → `dashboard` sem voltar a `surfaces`); trocar a tela no menu do
      preview leva ao pilar dela; o estado inicial é um par coerente.
- [ ] O menu do preview tem seis telas com rótulo humano mais "Mais telas"; a grade de "Mais telas" leva a cada
      uma das oito restantes e marca "Mais telas" como ativo (teste).

**Lote 3**
- [ ] Controle de token `isResponsive` mostra o selo com o dispositivo certo nos três dispositivos; token não
      responsivo não mostra (teste).
- [ ] O cabeçalho não tem os três botões de ícone; o menu "Avançado" tem as três entradas, abre e fecha por
      teclado e devolve o foco (teste); cada entrada abre a mesma tela que o botão abria.
- [ ] `npx tsc --noEmit` → 0; `check-audit-baseline --with-tsc` → igual ao baseline; `npm run build` e
      `npx vitest run` verdes.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o painel é **este módulo**, e cada invariante é comportamento observável dele (teste). O
único limite que vale para todo módulo, o teto de 250 linhas, a R9 já cobra.

- `git status` + `git diff --stat` → só o §3.1 de cada lote; `design-pillars.json` com mudança só em `title` e
  na numeração.
- **No navegador, por mim** (servidor de desenvolvimento, não só testes): abrir o painel e medir — (a) a altura
  do cabeçalho da barra lateral antes e depois (era ≈ 40 % da altura); (b) com a galeria **aberta e empilhada**,
  as duas prévias com **altura próxima de metade do contêiner** e, **dentro de um contêiner menor que a
  janela**, o mesmo (é o que o `vh` errava); (c) com a galeria fechada, o preview em tela cheia; (d) clicar em
  cada pilar e ver a tela mudar; (e) a barra de ações fixa, sem sobrepor o último controle.
- **Mutação do lote 2:** reintroduzir `persistDesign` em `TemplatesTab` → o teste falha; devolver o
  `useEffect` de pilar → o teste de `navigation` falha por voltar a `surfaces`. Mostrar o resultado.
- `npx tsc --noEmit` · `check-audit-baseline --with-tsc` · `npm run build` · `npx vitest run` (um por vez, sem
  outro `vitest` ativo).
- Leitura do diff: nenhum token de catálogo/nome de controle alterado; nenhum comentário cita plan (R36).

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md`

Texto pronto para transporte:

- **Nova §2.3 — O caminho do painel:** três passos — **escolher um tema** (galeria de estilos, que **abre sob
  demanda**), **ajustar o que pesa** (modos Impacto/Essencial/Completo, plan-99), **aplicar** (`Aplicar (N)` na
  barra de ações). Verbos: **Aplicar**, **Descartar** (global e por pilar) e **Exportar** (secundário); sem
  "commit" nem aplicar por pilar. Escolher tema **só altera o rascunho**, em toda porta (galeria e Templates).
- **§4 (rascunho × persistido):** a única porta de gravação é o `Aplicar` da barra de ações.
- **§6.2:** a **barra do preview** (dispositivo e "Empilhar previews"); o empilhado divide a **altura do contêiner**
  (nunca `vh`) — consequência direta de §6.2.1; a galeria é um segundo preview que abre sob demanda.
- **Nova §6.6 — Pilar e tela:** abrir um pilar leva o preview à **tela canônica** dele (tabela), e trocar a tela
  leva ao pilar dela; cada gesto muda o outro lado **uma vez**. O menu do preview mostra **seis telas** nomeadas
  e **"Mais telas"**.
- **§3 (controles):** token responsivo mostra **para qual dispositivo** o valor vale; rótulos em caixa normal
  (≥ 12 px); o menu **Avançado** reúne Tabela de tokens, Busca por pilar e Temas e JSON.
- **§11:** linhas para a barra de ações, a barra do preview, a ligação pilar ↔ tela, o menu Avançado e o selo de
  dispositivo.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
