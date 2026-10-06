---
tipo: "plan"
titulo: "Fazer a busca do painel de temas achar por sentido e dar a ele um modo de poucas opções de grande impacto"
objetivo: "Fazer quem edita um tema encontrar o controle certo escrevendo do jeito que fala (cor texto, fonte, escrita) e poder trabalhar num terceiro modo, Impacto, com poucos controles que mudam o visual inteiro"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel de customização"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "design-engine", "painel", "busca", "modos"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[02-design-engine]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Quem edita um tema no painel acha o controle que quer escrevendo como fala — `cor texto`, `cor do tex`, `fonte`,
`escrita`, `letra` — e vê coisas **coerentes**, sem que nenhum rótulo mude. E o painel ganha um **terceiro modo,
Impacto**, com poucos controles que, sozinhos, mudam o visual inteiro: fontes, cores, textura de fundo, tipo de
card.

Duas frentes, **dois lotes independentes**, uma conversa de execução por lote, veredito entre eles. Estão na
mesma plan (e não em duas) porque tocam os mesmos arquivos do painel, e plans paralelas ali colidiriam.

# 2. Contexto

**Pedido do dono (2026-10-04):** (1) a busca é exata por palavra — `cor texto` não acha `Cor do Texto…` — e deve
ter um mecanismo "inteligente" que ligue os pontos: escrever *fonte*, *escrita* ou *texto* deve mostrar tudo o que
é de fonte; **não se muda o que está escrito, só se exibem opções coerentes**. (2) Hoje há Essencial e Completo;
falta um terceiro modo com **poucas opções de grande impacto visual**.

**O que foi medido (2026-10-04):**

| Fato | Onde |
|---|---|
| A busca da aba de tema casa **a frase inteira** como substring do rótulo do **schema** ou do id: `cor texto` acha 0 pela frase, `cor do tex` acha 4 | `src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts:44-50` |
| **Há três cópias** da mesma busca ingênua: a da aba de tema, a do catálogo (planilha) e a do Command Center | `useThemeCustomizationData.ts:44-50` · `Main/MasterControlPanel.tsx:53-60` · `Panels/hooks/useSovereignSearch.ts:27-43` |
| A tela **mostra** o `name` do catálogo, mas a busca casa o `label` do schema: **140 dos 427 tokens** têm os dois diferentes — `identityAlignment` aparece como "Alinhamento do Logo/Marca" e a busca só conhece "Alinhamento"; `logo` não o acha. O usuário digita o que lê e não acha | `ThemeSidebarContent.tsx:73-74` · medido por cruzamento `MASTER_DESIGN_MAP` × `TokenCatalog` |
| O catálogo **já tem** o material para busca por sentido e a busca não o usa: `tags`, `categories`, `description` e `relatedTokens` em todos os 427 tokens. Mas o vocabulário é misto (inglês e português) e ralo: `cor` está em **0** tags, `color` em 34; `tipografia` está em 50 categorias, `fonte` em 2 | partições de `src/core/Design/catalog/partitions/` |
| O modo é um **booleano** `isEssentialMode` (padrão `true`); Essencial = catálogo com `importance >= 80` = **135 dos 427** ids do schema (eram 127 até a `plan-94` levar os oito tokens de composição da barra a `importance: 80`; 7 ids estão duplicados no catálogo). Não é "essencial": é cerca de um terço do painel | `Main/hooks/usePreviewUIState.ts:11` · `useThemeCustomizationData.ts:29-34` |
| `importance` **não mede impacto visual**: `zIndexTooltip`, `reducedMotion`, `isNavHidden`, `breakpointTablet` e `easeMain` estão em 85–95, mais alto que `cardVariant` (85) e `texture` (80). Um corte mais alto nele não dá o modo pedido | catálogo, ordenado por `importance` |
| O modo filtra os **pilares** (`ThemePillarsList`) mas não o bloco global (3 tokens, todos essenciais) nem o da barra de preferências (5) | `Main/components/ThemeGlobalSettings.tsx:68-100` |
| Três tokens de layout que o painel oferece **não têm efeito** no cromo hoje (dívida declarada do gate de paridade): `layoutDensity`, `maxContentWidth`, `isSplitViewEnabled` — nenhum pode entrar no Impacto | `check-chrome-token-parity.mjs` · `plan-89` |
| A spec 06 §2.1 dizia que o Essencial vem de "`importance >= 80` no schema do token" e que ele são "os tokens de maior impacto visual" — o campo mora no **catálogo** e não mede impacto visual. **Corrigido na spec em 2026-10-05**; a §2.1 ainda diz que o Command Center "não é uma terceira curadoria", e isso a síntese preserva | `specs/specs/06-painel-de-customizacao-e-preview.md` §2.1 |

**O princípio da §2.1 da spec 06 precisa sobreviver:** o painel não tem lista curada à mão que envelhece; o dado
que separa os modos mora **no token**. Por isso o Impacto é um **campo no catálogo** (`visualImpact` na
entrada do token, com o nome do grupo), não uma lista num arquivo de configuração: token novo de grande impacto se declara onde nasce.

**Contexto:** a `plan-94` já tocou o painel e as partições do catálogo (a seção "Composição da Barra" e os oito tokens de composição); esta plan parte dessa árvore. A `plan-90` (item 6) mede o campo de busca em
`ThemeSidebarHeader.tsx`: este plan roda **antes** dela e **não troca nem remonta o `<input>`**.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

**Lote 1 — busca por sentido**
- `src/features/DesignEngine/utils/token-search.ts` — **novo**: a função única de busca (§5).
- `src/features/DesignEngine/config/token-search-concepts.json` — **novo**: grupos de termos equivalentes.
- `src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts` · `Main/MasterControlPanel.tsx` ·
  `Panels/hooks/useSovereignSearch.ts` — os três passam a chamar a função única.
- `src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx` — resultado na ordem de relevância, contagem
  no título e estado vazio.
- Testes ao lado de cada um (`utils/__tests__/`, `Main/hooks/__tests__/`, `Panels/hooks/__tests__/`,
  `Main/components/__tests__/`).

**Lote 2 — modo Impacto**
- `src/core/Design/catalog/partitions/*.json` — **só** o campo `visualImpact` (o grupo) nas entradas escolhidas.
- `src/features/DesignEngine/Main/components/ThemeImpactList.tsx` — **novo**: a lista plana do modo Impacto.
- `src/features/DesignEngine/Main/hooks/usePreviewUIState.ts` · `Main/ThemeCustomizationTab.tsx` ·
  `Main/hooks/useThemeCustomizationData.ts` · `Main/components/ThemeSidebarHeader.tsx` ·
  `Main/components/ThemeSidebarContent.tsx` · `Main/components/ThemePillarsList.tsx` — o booleano vira um modo de
  três valores, e o controle vira um seletor de três.
- Testes ao lado, inclusive os que hoje afirmam "Modo Avançado" e o `switch` (`ThemeSidebarHeader.test.tsx`,
  `ThemeCustomizationTab.test.tsx`, `ThemePillarsList.test.tsx`, `ThemeSidebarContent.test.tsx`,
  `useThemeCustomizationData.test.ts`).

**Nos dois lotes:** `dist/`, `sarak-ui/`, `sarak-dev/` regenerados pelos comandos, nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Nenhum rótulo, `name`, `description` ou `label` muda.** A busca só decide o que aparece e em que ordem.
- A regra do **Essencial** (`importance >= 80`) e o **bloco global** e o da **barra de preferências**
  (`ThemeGlobalSettings.tsx`): ficam como estão, em todos os modos.
- A **aba de busca de outras listas** (`LanguageTab.tsx`, `ShortcutsTab.tsx`): não são busca de token.
- O **Command Center** como tela (`HyperGranularityTab.tsx`): só a função de busca que ele usa muda.
- Os ids duplicados e as 28 entradas sem `name`/`tags` do catálogo (vão para o backlog): **não corrija**, e a busca
  tem de degradar bem sobre elas (cai no `label` do schema).
- **Dependência nova.** Nada de biblioteca de busca difusa (`fuse.js` e afins): o painel viaja no bundle do
  consumidor, e a busca determinística é testável caso a caso.
- Persistir o modo (não é pedido; hoje não persiste) · tokens de schema, `theme_table_mapping.json` · textos do
  painel em outros idiomas (o painel é pt-BR hoje) · `src/styles/` · o `<input>` de busca (não trocar de elemento
  nem remontar).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | §2 e §2.1 (a folksonomia e os dois modos — o princípio a preservar), §11 (tabela de testes) |
| Spec fixa | `specs/arquitetura/02-design-engine.md` | schema × catálogo × mapeamento: o que é uma "chave real" |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R9 (arquivo ≤ 250 linhas), a regra de paridade das três fontes (um campo no catálogo não a quebra), R36 (comentário não cita plan) |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §2.4 — o seletor de três modos é teclado e ARIA |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os casos da busca e do modo |
| **Skill** | `ui-novo-componente` | o seletor de três valores |
| Código | `src/features/DesignEngine/utils/dynamic-categories.ts` | o dicionário de redução de categorias (§2 da spec 06): outra cola de sinônimos — **não reutilize, mas leia** para não duplicar nem contradizer |
| Código | `src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts` · `src/features/DesignEngine/Main/components/ThemePillarsList.tsx` · `src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx` · `src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx` · `src/features/DesignEngine/Panels/hooks/useSovereignSearch.ts` · `src/features/DesignEngine/Main/MasterControlPanel.tsx` | ler antes de editar |
| Código | `src/core/Design/catalog/index.ts` · `src/features/DesignEngine/config/design-pillars.json` | de onde vêm os dados |

# 5. Instruções de execução

**Lote 1 — busca por sentido**

1. Crie `utils/token-search.ts` com **uma** função pública, `searchTokens(query, tokens, catalogMap)`, que devolve
   os tokens **ordenados por relevância**. Cada token é indexado por palavras normalizadas de: o `label` do
   schema **e** o `name` do catálogo (as duas — a tela mostra uma, o schema guarda a outra), o `id` quebrado em
   `camelCase`, as `tags`, as `categories`, a `description` e o rótulo do componente de origem.
2. **Normalização.** Minúsculas, sem acento, separação por não-alfanumérico; descartar os termos vazios e as
   palavras de ligação (`de do da dos das o a os as e em no na para com um uma`). Termo de 1 caractere é
   descartado.
3. **Casamento de um termo** (todo termo da consulta precisa casar — E):
   - **palavra inteira** igual a uma palavra do índice;
   - **conceito:** o termo pertence a um grupo de `token-search-concepts.json` e **qualquer membro** do grupo é
     palavra inteira do índice;
   - **prefixo, só no último termo digitado** (busca enquanto digita: `cor do tex` → `texto`), com 2 ou mais
     caracteres. Termo que não é o último **não** casa por prefixo — é o que impede `cor` de puxar `corpo` a
     cada espaço.
4. **Relevância.** Por termo, vale o melhor casamento: palavra inteira no nome/rótulo (3) > conceito no
   nome/rótulo (2) > palavra inteira ou conceito em tag, categoria, descrição, id ou componente (1) > só prefixo
   (0,5). Soma por token; empate, ordem do schema. Resultado com menos de todos os termos casados **não entra**.
5. **`config/token-search-concepts.json`:** lista de grupos de termos equivalentes, já normalizados (sem acento,
   minúsculos), pt-BR **e** os termos em inglês que o catálogo usa (`font`, `color`, `radius`…). Comece por, no
   mínimo, estes grupos e complete pelo que a leitura do catálogo mostrar: **tipografia** (fonte, fontes, escrita,
   texto, letra, tipografia, tipo, font, typography, family) · **cor** (cor, cores, color, colors, tom) ·
   **fundo** (fundo, background, bg) · **textura** (textura, texture, padrao, pattern, ruido, noise) ·
   **card** (card, cards, cartao, cartoes) · **borda** (borda, bordas, contorno, moldura, border, stroke) ·
   **arredondamento** (arredondamento, raio, radius, cantos, curvatura) · **sombra** (sombra, shadow,
   elevacao, profundidade) · **vidro** (vidro, glass, blur, desfoque, transparencia) · **animacao** (animacao,
   movimento, motion, transicao, duracao) · **espaco** (espaco, espacamento, gap, padding, margem) ·
   **icone** · **botao** · **navegacao** (menu, navegacao, nav, sidebar, lateral, topbar, topo, barra).
6. **Troque as três cópias** pela função única. `MasterControlPanel` mantém o filtro de categoria por cima.
   `useSovereignSearch` mantém a regra "se o componente casa pelo rótulo, mostra seus tokens".
7. `ThemeSidebarContent`: os resultados saem **na ordem de relevância** (não na do schema); o título passa a
   `Resultados da busca (N)`; busca sem resultado mostra **uma linha de estado vazio** (hoje a área fica em
   branco). **Cada resultado mostra, abaixo do rótulo, onde o controle mora no modo Completo** — `Pilar › Seção`,
   por exemplo "Tipografia e Escala › Fontes" —, lido de `groupedStructure` (a estrutura que já alimenta os
   pilares); token que não está em nenhum grupo não mostra caminho (não inventa um). O `<input>` não muda de
   elemento nem de posição.
8. Testes (skill `test-unitario`), cada um com um caso que **falha** se o comportamento sumir — ver §6.
9. Entregue o lote 1 e **pare para o veredito**.

**Lote 2 — modo Impacto**

10. **Escolha dos tokens.** O objetivo é **poucos controles, grande efeito visual**: o dono nomeou fontes, cores,
    textura de fundo e tipo de card. Ponto de partida (**candidatos, não decisão**), 26 tokens:
    - *Fontes:* `headingFont`, `bodyFont`, `bodySize`, `h1Size`
    - *Cores:* `primaryColor`, `secondaryColor`, `accentColor`, `bgBaseColor`, `colorBgBody`, `textColorMaster`,
      `colorPalette`, `mode`
    - *Fundo e textura:* `texture`, `surfaceMaterial`, `bgGradientMode`, `systemTone`
    - *Cards:* `cardVariant`, `cardTextureType`, `cardBorderRadius`, `cardBackgroundColor`, `shadowIntensity`,
      `borderType`
    - *Forma e estrutura:* `btnBorderRadius`, `btnStyleType`, `navigationStyle`

    **Cada candidato precisa de prova de efeito:** cite no resumo, por token, o `arquivo:linha` que **lê** o valor
    (a variável CSS ou o id) e muda o que se vê. O que não provar sai da lista (já se sabe que `layoutDensity`
    não entra: sem consumidor no cromo). Pode **trocar** um candidato por outro de efeito provado; **não** passe
    de **30** nem fique abaixo de **20** ids únicos, e **mantenha** ao menos um token de cada área nomeada pelo
    dono (fonte, cor, textura de fundo, card). `bgBaseColor` × `colorBgBody` são quase o mesmo controle: fique com
    um só se o efeito for o mesmo.
11. Marque `"visualImpact": "<grupo>"` na entrada de cada token escolhido, nas partições, com o grupo em
    `fontes` · `cores` · `fundo` · `cards` · `forma` (os cinco blocos do passo 10; id duplicado no catálogo:
    marque **as duas** entradas, com o mesmo grupo — o teste conta ids únicos). **Nenhum outro campo** das
    partições muda.
12. Troque `isEssentialMode: boolean` por um modo de **três valores** (`'impact' | 'essential' | 'complete'`),
    com tipo exportado, em `usePreviewUIState` e em tudo que o repassa. **O padrão continua `'essential'`.** O que
    cada modo mostra: **Impacto** — os tokens com `visualImpact`; **Essencial** — `importance >= 80`, igual a
    hoje; **Completo** — tudo (era o "Avançado"). `useThemeCustomizationData` devolve a regra de visibilidade do
    modo no lugar de `dynamicEssentialTokens`; `ThemePillarsList` a consome; as contagens por pilar e por seção
    refletem só o visível; pilar e seção sem token visível somem (já é assim).

    **No Impacto não há acordeão.** Em vez de pilar → seção → controle (3 cliques), o painel mostra a **lista
    plana** (`ThemeImpactList.tsx`): cinco blocos com título — `Fontes`, `Cores`, `Fundo e textura`, `Cards`,
    `Forma e estrutura` — **todos abertos**, cada um com os controles do seu grupo, na ordem do passo 10. Os
    controles são os mesmos `TokenControl` (mesmo valor, mesmo rascunho). Essencial e Completo seguem com os
    pilares. A lista plana substitui só a lista de pilares: o bloco global e o da barra de preferências
    continuam acima dela, como hoje.
13. O controle de modo vira um **seletor de três opções** — `Impacto` · `Essencial` · `Completo` —, em **linha
    própria** no cabeçalho (o `Empilhar Previews` continua um `switch`). ARIA: grupo de rádio com nome
    acessível ("Modo de edição"), setas movem a seleção, a opção ativa tem `aria-checked`. Tem de caber na barra
    lateral estreita (≈ 320–420 px de contêiner) **sem rolagem horizontal**: nada de largura fixa.
14. **A busca ignora o modo** (como hoje): mostra o que casa em qualquer modo.
15. Testes e os ajustes dos que afirmam "Modo Avançado"/`switch`.
16. `npx tsc --noEmit` · `npm run build` · `npm run guide` · `npm run catalog` · `npm run dev-kit` ·
    `npx vitest run` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → verdes, sem regressão.

# 6. Critérios de aceite

**Lote 1**
- [ ] Existe **uma** função de busca de token; as três telas a chamam; nenhuma tem mais `includes(query)` sobre o
      rótulo.
- [ ] `cor texto` e `cor do texto` devolvem **a mesma lista, na mesma ordem** (`do` é palavra de ligação);
      `cor do tex` (a digitação em curso) devolve **todos** os 4 que a busca antiga devolvia para ela, e os
      três tokens da captura do dono estão entre eles ("Cor do Título (Card)", "Cor do Texto do Botão de Ação
      (Card)", "Cor do Texto (Foco) - Busca"); a ordem põe quem tem as palavras no nome antes de quem só as tem
      em tag ou descrição (teste com a ordem afirmada).
- [ ] `fonte`, `escrita`, `texto`, `letra` e `tipografia` trazem `headingFont`, `bodyFont` e `monoFont` entre os
      **10 primeiros** (teste, uma consulta por termo).
- [ ] A consulta com **acento ou caixa diferente** devolve o mesmo (`Tipográfia` = `tipografia`).
- [ ] `cor` não põe um token só-de-prefixo (`corpo`) acima de um token que tem a palavra `cor` (teste).
- [ ] A busca acha pelo **`name` do catálogo** que a tela mostra: `logo` acha `identityAlignment` (hoje não
      acha: o `label` do schema é só "Alinhamento"); teste com esse par.
- [ ] Cada resultado mostra o caminho `Pilar › Seção` lido de `groupedStructure` (teste com um token que mora
      num grupo, e outro que não mora em nenhum e não mostra caminho).
- [ ] Consulta sem resultado → `[]` e a tela mostra o estado vazio; **nenhum rótulo mudou**.
- [ ] Todo grupo de `token-search-concepts.json` casa **2 ou mais tokens** (teste: grupo morto reprova) e tem
      2 ou mais termos.
- [ ] Nenhuma dependência nova no `package.json`; `token-search.ts` ≤ 250 linhas e função ≤ 40.

**Lote 2**
- [ ] Entre 20 e 30 ids únicos com `visualImpact` nas partições, cada um com valor em `fontes`, `cores`,
      `fundo`, `cards` ou `forma` (valor fora disso reprova no teste); todo id existe no schema; as âncoras
      `headingFont` (fontes), `bodyFont` (fontes), `primaryColor` (cores), `texture` (fundo) e `cardVariant`
      (cards) estão entre eles, cada uma no grupo indicado (teste).
- [ ] O resumo traz, **por token marcado**, o `arquivo:linha` do consumidor; `layoutDensity`, `maxContentWidth` e
      `isSplitViewEnabled` **não** estão marcados.
- [ ] O modo é `'impact' | 'essential' | 'complete'`; `grep -n "isEssentialMode" src` devolve nada; o padrão é
      `'essential'` (teste).
- [ ] Em `impact`, o painel mostra a **lista plana**: os cinco blocos (`Fontes`, `Cores`, `Fundo e textura`,
      `Cards`, `Forma e estrutura`), todos abertos, sem nenhum acordeão de pilar ou seção, com **exatamente** os
      tokens marcados (contagem, teste); em `essential`, os pilares com os de `importance >= 80` (igual a hoje);
      em `complete`, os pilares com todos.
- [ ] O seletor tem `role` de grupo de rádio, nome acessível e **três** opções com os rótulos `Impacto`,
      `Essencial`, `Completo`; seta para a direita/esquerda muda a seleção (teste); o `switch` de
      `Empilhar Previews` segue existindo.
- [ ] O `<input>` de busca é o **mesmo elemento** ao trocar de modo (teste: a referência não muda).
- [ ] `npx tsc --noEmit` → 0; `check-audit-baseline --with-tsc` → igual ao baseline; `npm run build` e
      `npx vitest run` verdes.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — a busca e o modo são invariantes **deste módulo**, e a regra que protege o campo novo já
existe: uma entrada de catálogo só é real se o `tokenId` dela existe no schema (paridade das três fontes), então
um `visualImpact` num id fantasma não passa o `catalog:check`/build.

- `git status` + `git diff --stat` → só o §3.1 de cada lote; nenhum `.json` de partição com mudança que não seja
  a linha `"visualImpact"`; o `ThemeImpactList.tsx` é o único arquivo novo do lote 2.
- **Lote 1, medido por mim, não só pelos testes:** rodar `searchTokens` (por um script fora do repositório, via
  `tsx`) com as consultas do dono — `cor texto`, `cor do tex`, `fonte`, `escrita`, `texto`, `letra`, `logo`,
  `cor`, `xyzq` — e **ler a lista devolvida**; confrontar `cor do tex` com os 4 que a busca antiga devolve.
- **Mutação:** apagar o grupo `tipografia` do JSON → o teste de `escrita` falha; trocar o casamento por prefixo
  para valer em **todo** termo → o teste de `cor`/`corpo` falha. Mostrar o resultado.
- **Lote 2:** conferir **cada** `arquivo:linha` de consumidor citado; contar os ids marcados com um script
  (não confiar no resumo); abrir o painel no navegador (servidor de desenvolvimento) nos três modos e medir que o
  seletor não gera rolagem horizontal a ≈ 320 px de contêiner.
- `npx tsc --noEmit` · `check-audit-baseline --with-tsc` · `npm run build` · `npx vitest run` (um por vez, sem
  outro `vitest` ativo).
- Leitura do diff: nenhum rótulo/`description` alterado; nenhum comentário cita plan (R36).

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md`

Texto pronto para transporte:

- **§2.1** passa de *"Essencial × Avançado — os dois modos"* a ***"Impacto × Essencial × Completo — os três
  modos"***: **Impacto** — os tokens que declaram `visualImpact` (o grupo: `fontes`, `cores`, `fundo`, `cards`
  ou `forma`) na entrada do catálogo (de 20 a 30; cada um com efeito visível provado), mostrados numa **lista
  plana** em cinco blocos abertos, sem acordeão; **Essencial** — `importance >= 80` no catálogo (a spec já foi corrigida quanto ao "no schema");
  **Completo** — o dicionário inteiro (era "Avançado"). O padrão é Essencial; o modo não persiste; a busca
  ignora o modo; o bloco global e o da barra de preferências não são filtrados. **Preservar o princípio:** nenhum
  modo é lista curada num arquivo de configuração — o dado que o separa mora **no token**. `importance` **não**
  mede impacto visual (z-index e breakpoint estão acima de `texture`), por isso o Impacto tem campo próprio.
- **§2.2 (nova) — A busca de token:** uma função única (`utils/token-search.ts`) usada pelas três telas;
  indexa o **`label` do schema e o `name` do catálogo** (a tela mostra um, o schema guarda o outro: 140 de 427
  diferem), o id em `camelCase`, `tags`, `categories`, `description`; normaliza acento e caixa, ignora palavras de
  ligação; casa por palavra inteira, por **conceito** (`config/token-search-concepts.json`) ou, **só no último
  termo**, por prefixo; todo termo precisa casar; ordena por onde casou (nome > conceito > tag/descrição >
  prefixo). Não muda rótulo nenhum. **Limite:** o vocabulário do catálogo é misto (pt/en) e ralo — o
  dicionário de conceitos é a única manutenção manual, e grupo que não casa 2 tokens reprova no teste.
- **§11:** linhas para `utils/__tests__/token-search.test.ts` e para o seletor de modo.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-10-05 (Lote 1)

**Resultado:** Concluído (só o lote 1, passos 1–9; o lote 2 não foi iniciado)

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- `utils/token-search.ts` (novo, 138 linhas) — `searchTokens(query, tokens, catalogMap)` única; indexa `label` do schema + `name` do catálogo, id em camelCase (e inteiro), `tags`, `categories`, `description` (schema e catálogo) e rótulo do componente; normaliza acento/caixa/palavras de ligação; palavra inteira (3) > conceito no nome (2) > palavra/conceito em tag, categoria, descrição, id ou componente (1) > prefixo (só no último termo, ≥2 caracteres). Exporta também `matchesText`, `locateToken`, `buildCatalogMap`, `normalizeText`, `tokenizeText`.
- `config/token-search-concepts.json` (novo) — 18 grupos nomeados (os 14 pedidos + `brilho`, `tamanho`, `identidade`, `tabela`).
- `Main/hooks/useThemeCustomizationData.ts` — `filteredResults` chama `searchTokens` (catálogo próprio via `buildCatalogMap`).
- `Main/MasterControlPanel.tsx` — filtro de categoria por cima, busca por `searchTokens`; o campo `pilarName` virou `componentLabel` (só este arquivo o usava).
- `Panels/hooks/useSovereignSearch.ts` — tokens por `searchTokens`; regra "componente casa pelo rótulo → mostra seus tokens" mantida via `matchesText`.
- `Main/components/ThemeSidebarContent.tsx` — título `Resultados da busca (N)`, estado vazio (`role="status"`), linha `Pilar › Seção` por resultado via `locateToken` (`data-testid="search-result-path"`); ordem recebida = relevância. `ThemeSidebarHeader.tsx` não foi tocado.
- Testes: `utils/__tests__/token-search.test.ts` (novo, 36 casos), e casos novos em `useThemeCustomizationData.test.ts`, `useSovereignSearch.test.ts` (o teste-esqueleto com TODO foi trocado por 5 casos), `ThemeSidebarContent.test.tsx`, `MasterControlPanel.test.tsx`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/utils/token-search.ts` | criado | função única de busca + helpers |
| `src/features/DesignEngine/config/token-search-concepts.json` | criado | grupos de conceitos pt-BR/en |
| `src/features/DesignEngine/utils/__tests__/token-search.test.ts` | criado | 36 casos (§6) |
| `src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts` | alterado | `filteredResults` → `searchTokens` |
| `src/features/DesignEngine/Main/MasterControlPanel.tsx` | alterado | busca → `searchTokens`; `pilarName`→`componentLabel` |
| `src/features/DesignEngine/Panels/hooks/useSovereignSearch.ts` | alterado | busca → `searchTokens`/`matchesText` |
| `src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx` | alterado | contagem, estado vazio, caminho |
| `src/features/DesignEngine/Main/hooks/__tests__/useThemeCustomizationData.test.ts` | alterado | +2 casos (sentido, `logo`, `chrome`/`barra` → os 8) |
| `src/features/DesignEngine/Panels/hooks/__tests__/useSovereignSearch.test.ts` | alterado | 5 casos no lugar do TODO |
| `src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx` | alterado | +3 casos (contagem/ordem, caminho, vazio) |
| `src/features/DesignEngine/Main/__tests__/MasterControlPanel.test.tsx` | alterado | +1 caso (sentido + filtro de categoria) |

**Verificações executadas**
- `npx tsc --noEmit` → 0 erros.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
- `trail-citation:check`, `class-merge:check`, `section-pointers:check`, `plan-index:check`, `kit-names:check` → todos `[OK]`.
- `npx vitest run` (completo, sem outro vitest/tsup ativo — conferi por contagem de processos) → 392 arquivos, 2164 testes, todos passando.
- Saída da busca medida por script fora do repositório (`tsx`, scratchpad), com a árvore real (`MASTER_DESIGN_MAP` + `TokenCatalog`), primeiros resultados:
  - `cor texto` (26): cardTitleColor, cardSearchTextFocusColor, inputTextColor, cardActionBtnText, textColorMaster, textColorSecondary… — `cor do texto` devolve a mesma lista (o teste compara as listas inteiras).
  - `cor do tex` (29): textureColor, cardTitleColor, cardSearchTextFocusColor, inputTextColor, surfaceColor, cardActionBtnText… — contém todos os que a busca antiga devolvia (o teste compara com o `includes('cor do tex')` sobre o schema) e os 3 da captura.
  - `fonte` (88): bodyFont, identityFontFamily, headingFont, bodySize, monoFont, identityFontWeight…
  - `escrita` (88): mesmo topo de `fonte` (um só conceito); `texto`, `letra` e `tipografia` idem — headingFont/bodyFont/monoFont entre os 5 primeiros em todos.
  - `logo` (18): identityAlignment (1º), identityPadding, identityFontFamily, identityFontWeight, identityTracking, identityRedirectUrl…
  - `cor` (145): surfaceColor, primaryColor, secondaryColor, tertiaryColor, accentColor, textureColor…
  - `xyzq` → 0 resultados. `chrome` → 8 (os oito de `chrome-composition`); `barra` → 80, contendo os oito (teste afirma).
- Mutação 1 (apagar o grupo `tipografia` do JSON): 5 testes falham — `escrita`, `texto`, `letra`, `tipografia` (fontes fora dos 10 primeiros) e `matchesText`. JSON restaurado (diff idêntico ao backup).
- Mutação 2 (prefixo em todo termo, tirando `isLast`): falham `prefixo só vale no último termo: cor texto não acha corpo texto` e `matchesText`. O caso de um termo só (`cor` × `corpo`) não detecta essa mutação, porque `cor` já é o último termo; quem a detecta é o caso de dois termos. Arquivo restaurado (diff idêntico).
- `grep "includes(query" src/features/DesignEngine` (fora de testes) → só `Panels/LanguageTab.tsx:37` (fora do escopo, §3.2).

**Critérios de aceite**
- [x] Uma função de busca; as três telas a chamam — `token-search.ts`; `useThemeCustomizationData.ts`, `MasterControlPanel.tsx`, `useSovereignSearch.ts`.
- [x] `cor texto` = `cor do texto`; `cor do tex` ⊇ busca antiga e os 3 da captura; ordem nome > tag/descrição — casos de `token-search.test.ts` (inputTextColor antes de textColorMaster e tooltipTextColor).
- [x] `fonte`, `escrita`, `texto`, `letra`, `tipografia` → as 3 fontes entre os 10 primeiros — `it.each` no teste.
- [x] Acento/caixa — `Tipográfia` = `tipografia`.
- [x] `cor` não põe só-prefixo acima de quem tem a palavra — teste com `Corpo do Texto` × `Cor Base`.
- [x] `logo` acha `identityAlignment` (o label do schema não contém "logo": asserção no teste).
- [x] Caminho `Pilar › Seção` (token num grupo / token fora de grupo) — `ThemeSidebarContent.test.tsx` e `locateToken`.
- [x] Sem resultado → `[]` e estado vazio na tela; nenhum rótulo alterado (o diff só toca busca/exibição).
- [x] Cada grupo do JSON tem ≥2 termos e casa ≥2 tokens (um caso por grupo; 18 casos).
- [x] Nenhuma dependência nova; `token-search.ts` 138 linhas, nenhuma função acima de 40.

**Decisões e suposições**
- A pontuação literal do passo 4 não cumpria o critério "as 3 fontes entre os 10 primeiros" para `texto`/`escrita`/`letra`/`tipografia` (palavra inteira no nome vale 3, conceito 2; dezenas de tokens têm "texto" no nome; headingFont ficava em 11º–13º). Acrescentei duas regras, ambas mantendo a ordem nome > tag/descrição: (a) **conceito forte** — casamento por conceito no nome (nível 2) sobe a 3 quando o token tem ≥3 membros distintos do grupo no índice (headingFont: fonte, font, family, tipografia, typography); (b) **densidade** — +0,1 por membro do grupo presente (máx. 9). Conceito só em tag/categoria (como `textColorMaster` para `cor`) **não** é promovido.
- Prefixo: 0,5 se o prefixo está no nome/rótulo e 0,25 se só em tag/descrição/id/componente (o plano dava 0,5 para ambos). Efeito medido: `cor do tex` põe "Cor da Textura" antes de "Cor do Texto…", por ser prefixo legítimo.
- O caminho `Pilar › Seção` aparece **acima** do controle, não abaixo do rótulo: o rótulo vive dentro do widget (`TokenControl`/`DesignControls`), fora do escopo §3.1.
- Mantive `tipo` no grupo `tipografia` (estava na lista mínima do plano); sozinho ele não promove nada (precisa de ≥3 membros).
- Quatro grupos além dos pedidos (`brilho`, `tamanho`, `identidade`, `tabela`), todos com ≥2 tokens medidos pelo teste.
- `componentLabel` é carregado por cópia rasa do token (`{...token, componentLabel}`) nos chamadores, para `searchTokens` ficar pura (sem importar o mapa mestre); `buildCatalogMap` monta o mapa de busca em cada tela (na de Sovereign, uma vez por módulo).
- Não rodei `npm run build`: o lote 1 não toca barril, catálogo, schema nem nada que `dist/`, `sarak-ui/` ou `sarak-dev/` carimbem; nenhum arquivo gerado foi tocado.
- Os arquivos editados mantêm CRLF (o Git avisa que os normaliza); os três novos foram criados em LF.
- Não abri o painel no navegador (a verificação visual de layout fica para o lote 2, onde o seletor de modo entra).

**Achados fora do escopo (não corrigidos)**
- `Panels/LanguageTab.tsx:37` — `name.includes(query)`: busca ingênua de idioma (declarada fora do escopo na §3.2).

**Pendências / riscos**
- Lote 2 não iniciado (aguarda a plan-95 por tocar as partições do catálogo).
- A lista de relevância foi validada contra o catálogo atual; o vocabulário é misto (pt/en) e o dicionário é a única manutenção manual (o teste reprova grupo que deixe de casar 2 tokens).
- Sem verificação visual no navegador do estado vazio e da linha de caminho (cobertos só por teste de componente).

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-05 — 🔴 Reprovado (Lote 1)

**Achados**

1. `src/features/DesignEngine/utils/token-search.ts:48-51` e as quatro chamadas —
   `Main/MasterControlPanel.tsx:55`, `Panels/hooks/useSovereignSearch.ts:16`,
   `Main/hooks/useThemeCustomizationData.ts:45`, `utils/__tests__/token-search.test.ts:10` — o parâmetro de
   `buildCatalogMap` é tipado como `readonly { tokenId: string }[]`, o que obriga cada chamada a um
   `TokenCatalog as unknown as { tokenId: string }[]` e o corpo a um `entry as CatalogSearchEntry`. São cinco casts
   que calam um tipo que **já está certo**. Medido numa cópia fora do repositório: com o parâmetro
   `readonly (CatalogSearchEntry & { tokenId: string })[]`, o `map.set(entry.tokenId, entry)` sem cast e as quatro
   chamadas como `buildCatalogMap(TokenCatalog)`, o `tsc --noEmit` dá **0 erros** em `src/features/DesignEngine/`.
   Critério violado: sinal de atalho (cast para calar tipo) — `padrao-typescript`; valor de tipo conhecido não
   passa por `unknown`. **Escopo:** só essas cinco linhas e a assinatura. Os casts que já existiam em
   `useThemeCustomizationData.ts:27,34,40` **não** são deste achado: não os toque.

**O que foi verificado e está correto** (não refazer)
- Escopo: os 11 arquivos do resumo, todos no §3.1 do lote 1; nenhuma dependência nova. Os demais arquivos de
  `src/features/DesignEngine/` modificados no worktree (`PreviewCanvas*`, `ThemeCustomizationTab.tsx`, as remoções
  de `ThemeEditor`/`useThemePreview`/`LanguageTab`/`ShortcutsTab`) são da `plan-95` (remoção do `emojiSet` e dos
  arquivos que ela apaga), não desta.
- Busca medida por `tsx` sobre `MASTER_DESIGN_MAP` + `TokenCatalog` reais: `cor texto` = `cor do texto` (26, mesma
  ordem); `cor do tex` contém os 4 da busca antiga nas posições 1, 2, 3 e 5, e os 3 da captura; `fonte`, `escrita`,
  `texto`, `letra` trazem `bodyFont`, `headingFont` e `monoFont` entre os 5 primeiros; `logo` põe
  `identityAlignment` em 1º; `xyzq` e `de` → 0.
- Mutação (cópia fora do repositório): sem o grupo `tipografia` → 5 falhas; prefixo em todo termo → 2; sem o estado
  vazio → 1; sem a linha de caminho → 1. A troca de `matchesText(comp.label)` por `false` em `useSovereignSearch`
  não muda nada observável, porque o rótulo do componente já está indexado em cada token; não é lacuna.
- Desvios declarados e aceitos: promoção do conceito forte e bônus de densidade (o critério das fontes no top 10
  não se cumpria com a pontuação literal do passo 4; a ordem nome > tag/descrição continua valendo: 1 + 0,9 < 2); prefixo 0,25 fora do
  nome; caminho acima do controle (o rótulo mora em `TokenControl`, fora do §3.1). O texto da síntese (§8) vai
  descrever a ordenação **como ela é**, não a do passo 4.
- `npx tsc --noEmit` → 0. Nenhum `skip`/`only`/`TODO`/comentário citando plan nas linhas adicionadas.
- `npx vitest run` completo → 2126/2165; as **39 falhas estão todas em arquivos da `plan-95`**, ainda em execução
  (átomos sem Provider, snapshots, contrato de ícones, a allowlist do `ZeroBrand` com o `LanguageTab.tsx` que ela
  apagou). **Nenhuma** em arquivo desta plan. A suíte integrada e o baseline com `--with-tsc` serão repetidos
  quando a 95 entregar, antes da liberação deste lote.

## Resumo da execução (correção 1) — 2026-10-05

**Achado 1 — casts em `buildCatalogMap`: corrigido.**
- `utils/token-search.ts:48` — o parâmetro passou a `readonly (CatalogSearchEntry & { tokenId: string })[]`; `:50` — `map.set(entry.tokenId, entry)` sem cast.
- As quatro chamadas viraram `buildCatalogMap(TokenCatalog)`: `Main/MasterControlPanel.tsx:55`, `Panels/hooks/useSovereignSearch.ts:16`, `Main/hooks/useThemeCustomizationData.ts:45` (saiu também o `?? []`, conforme o veredito) e `utils/__tests__/token-search.test.ts:10`.
- Os casts pré-existentes de `useThemeCustomizationData.ts:27,34,40` não foram tocados.

**Verificações**
- `npx tsc --noEmit` → 0 erros.
- `npx vitest run` só nos arquivos desta plan (`utils`, `Main/hooks`, `ThemeSidebarContent`, `MasterControlPanel`, `Panels/hooks`; sem outro vitest/tsup ativo) → 11 arquivos, 76 testes verdes.
- `grep "as unknown as"` em `token-search.ts`, `token-search.test.ts` e `MasterControlPanel.tsx` → nada. `trail-citation:check` → `[OK]`.
- A suíte completa e o baseline `--with-tsc` não foram repetidos: o veredito os adia para quando a plan-95 entregar.

**Arquivos alterados nesta rodada:** `utils/token-search.ts`, `utils/__tests__/token-search.test.ts`, `Main/MasterControlPanel.tsx`, `Main/hooks/useThemeCustomizationData.ts`, `Panels/hooks/useSovereignSearch.ts` (só as linhas acima).

## Veredito — 2026-10-05 — 🟢 Aprovado (Lote 1) · liberação parcial

**Achado 1 — corrigido.** `utils/token-search.ts:48` tipa o parâmetro como
`readonly (CatalogSearchEntry & { tokenId: string })[]`, `:50` grava sem cast, e as quatro chamadas são
`buildCatalogMap(TokenCatalog)` (`MasterControlPanel.tsx:55`, `useSovereignSearch.ts:16`,
`useThemeCustomizationData.ts:45`, `token-search.test.ts:10`). Os três casts pré-existentes de
`useThemeCustomizationData.ts` seguem intactos (`grep -c "as unknown as"` → 3). O `--stat` dos quatro arquivos de
código é o mesmo da rodada 1: nada além do achado mudou.

**Verificado:** `npx tsc --noEmit` → 0 · os 11 arquivos de teste da plan → 76/76 ·
`check-audit-baseline --with-tsc` → uma regressão, `auditor_composicaoatomica` 2 → 3, em
`src/components/atomic/Buttons/SarakSocialButton.tsx:108`, arquivo da `plan-95` (em execução), não desta.

**Liberação parcial:** o lote 1 está aprovado; a plan volta a `🟡` até o lote 2, que só se despacha com a
`plan-95` aprovada. A suíte integrada fica para a revisão da 95, com os arquivos desta plan na árvore: uma
falha neles ali reabre este lote.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
