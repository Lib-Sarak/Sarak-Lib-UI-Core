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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
