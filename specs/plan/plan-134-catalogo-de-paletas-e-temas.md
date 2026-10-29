---
tipo: "plan"
titulo: "Entregar o catálogo de paletas e fazer os 19 temas usarem paleta"
objetivo: "Fazer a lib embarcar de 12 a 15 paletas prontas cobrindo os cinco tipos de harmonia e os 19 temas declararem uma paleta em vez de cores escritas à mão, com a hierarquia de título refeita pela regra comum e aprovada pelo dono numa prévia antes e depois"
dominio: "Temas / Paletas"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "rc.4", "paletas", "temas"]
relacionados: ["[[anexos/rc4-contrato]]", "[[plan-133-motor-de-paletas]]", "[[09-temas-e-presets]]"]
depende_de: "plan-133-motor-de-paletas"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md"
---

# 1. Objetivo

Os 19 temas embarcados tiram as cores de uma paleta (`colorPalette`) e guardam só as sobrescritas de cor intencionais; o catálogo tem de
12 a 15 presets nomeados; o dono aprova o resultado visual antes do veredito.

# 2. Contexto

O motor e a regra do cálculo são da `plan-133` (leia o §2 dela). Um preset é **só a entrada**: `{ id, nome, tipo, base, sec?, acc? }`.
A curadoria aqui é **escolher boas entradas**, não editar tons.

**Os temas mudam de cor de propósito** — a hierarquia de título feita à mão em cada tema é o defeito que o dono apontou. Mas **nenhum
tema perde a identidade**: a entrada da paleta de cada tema nasce das cores que ele tem hoje (`primaryColor`, `secondaryColor`,
`accentColor` do modo padrão viram `base`, `sec`, `acc`), e temas com cores parecidas podem compartilhar o mesmo preset.

Cada tema hoje declara cor em `design` e no bloco `contraparte` (ex.: `minimalist-airy.ts:244-353` e `:547-574`). O que a paleta passa
a produzir sai dos dois blocos; o que fica é sobrescrita **justificada** (um comentário de uma linha por chave mantida: por quê).

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/palette/presets.ts` — os presets (substitui o preset de teste da `plan-133`), com rótulos no
  `catalogEntries.palette.ts`.
- Os 19 arquivos de `src/core/Design/presets/themes/<id>.ts` — `colorPalette` e a poda das cores.
- `src/core/Design/presets/themes/catalog.generated.ts` — regenerado por `npm run themes:catalog` (é desta plan: nenhuma outra toca temas).
- Testes de tema que fixam valores de cor (atualizar o valor esperado, nunca afrouxar a asserção).
- A prévia (§5 passo 4), **fora do repositório**.
- `docs/migracoes.md` — subseção na `## 8.0.0` (Q8 do contrato).

## 3.2 Fora
- O motor (`palette/` além de `presets.ts`), o painel, o kit.
- Tokens que não são cor; temas de importador.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-133-motor-de-paletas.md` §2 | a regra do cálculo |
| Contrato | `specs/plan/anexos/rc4-contrato.md` §1.9, §5 Q8, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/09-temas-e-presets.md` §2.1, §5.2, §5.3, §6 | contraparte, diversidade medida, o que o tema declara, travas |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-criar-tema` · `ui-criar-preset` | sempre · temas e presets |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Presets: de 12 a 15, com ao menos dois de cada tipo, e as entradas que os 19 temas pedem. **Nenhum id pode ser `default`,
   `matrix`, `neon`, `slate` ou `sunset`:** são os valores do `colorPalette` antigo (removido antes da 8.0.0 e reintroduzido pela
   `plan-133` com outro significado), que podem estar em temas salvos por importadores; um id igual aplicaria uma paleta que ninguém
   escolheu. Um teste sobre o registro trava essa lista, e outro prova que um design salvo com um desses valores cai no
   comportamento sem paleta.
3. Temas: `colorPalette` + poda; cada cor mantida tem a linha de justificativa.
   Depois, remova a marca `optionalForTheme` de `colorPalette` (`src/core/Design/schema/colors.ts`) e, se nenhum outro token a usar, o
   mecanismo inteiro (`src/core/Design/types.ts`, `gates/scripts/contrato/helpers/theme-completeness-core.ts` e o cabeçalho de
   `check-theme-completeness.ts`): o tema embarcado volta a declarar todo token estético (`theme-completeness:check` verde com os 19).
4. **Prévia para o dono** (a execução não para nela): capturas PNG dos 19 temas × 2 modos no `HEAD` e no worktree, com a mesma tela
   de amostra (título, subtítulo, texto, cartão, botão, tabela, status), lado a lado, mais uma grade dos presets (cada um × 2 modos),
   numa página `C:\tmp\sarak-rc4-previa\134\index.html` — imagens na mesma pasta, caminhos relativos, abre com dois cliques, sem
   servidor. Cada captura com legenda: tema, modo, preset. O comando que regenera a página vai no resumo.
5. `npm run themes:catalog`, subseção em `docs/migracoes.md`, `npm run verify -- --tier=quick` uma vez, resumo colado com o caminho da
   prévia. O dono aprova a prévia **durante a revisão**, com o revisor; ajuste pedido volta como correção (entrada de preset).

# 6. Critérios de aceite

- [ ] De 12 a 15 presets, ≥ 2 por tipo — teste sobre o registro.
- [ ] Os 19 temas declaram `colorPalette` — teste sobre o registro de temas. Toda cor mantida tem justificativa — conferido na leitura
  do diff (comentário não é testável).
- [ ] `auditor_contraste` e as travas da [[09-temas-e-presets]] §6 sem regressão (no `audit:baseline` do `quick`).
- [ ] Diversidade do catálogo (`themes:diversity`) não piora — número antes/depois no resumo.
- [ ] Prévia gerada em `C:\tmp\sarak-rc4-previa\134\index.html`, cobrindo 19 temas × 2 modos (antes e depois) e os presets × 2 modos;
  a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — o `auditor_contraste` e as travas de tema já cobrem.

- `npx vitest run src/core/Design/presets src/core/Design/palette` — uma vez.
- `npm run themes:diversity` — uma vez (número antes/depois).
- O revisor confere que a prévia cobre os 19 × 2 e os presets × 2 e passa o caminho ao dono; o veredito só fecha com a aprovação dele.
- Diff dos temas lido: só cor e `colorPalette` mudaram; cada cor mantida justificada.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md` — §5 (catálogo) ganha: "Os temas embarcados tiram a cor de uma paleta; o que declaram de cor é
sobrescrita justificada", e o número de presets por tipo sai do registro (R17, nunca transcrito).

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-28

**Resultado:** Concluído com pendências (1 teste vermelho, causa no motor da `plan-133`; ver *Achados* e *Pendências*)

**Estado do worktree ao iniciar**
(limpo) — a saída de `git status --short` veio vazia. Durante a execução apareceram, vindos da `plan-135` em paralelo, `docs/migracoes.md`,
`src/core/i18n/catalogEntries.palette.ts`, `sarak-ui/GUIA-FRONTEND.md`, os `.agents/skills/ui-criar-tema` e o painel
(`src/features/DesignEngine/Main/…`, `browser-tests/*plan-135*`); não os toquei, salvo as duas edições por acréscimo abaixo.

**Prévia para o dono:** `C:\tmp\sarak-rc4-previa\134\index.html` (dois cliques; imagens em `antes/`, `depois/` e `presets/`, caminhos
relativos). 19 temas × 2 modos, antes (rc.3) e depois, com legenda tema · modo · preset, e a grade dos 15 presets × 2 modos. A tela de
amostra tem título, subtítulo, texto, texto apagado, três botões, quatro selos de status e uma tabela, renderizados pelos componentes
reais com o `SarakUIProvider` (`initialTheme` + preferência de modo). O "antes" saiu do worktree antes da primeira edição de tema
(igual ao `HEAD` nos temas e na paleta; a `plan-135` já tinha mexido só no painel). Para regenerar, na raiz do repositório:
`npx tsx C:/tmp/sarak-rc4-previa/134/gerar-previa.mts depois` (um tema por vez: `… depois <id-do-tema>`), depois
`… presets` e `… pagina` (reescreve o `index.html`); `… antes` refaz o lado do `HEAD` e só vale num worktree limpo.

**O que foi feito**
- `src/core/Design/palette/presets.ts` — 15 presets (substitui o de teste; `oceano` segue como preset real): analógica 2, complementar 6,
  monocromática 2, complementar dividida 2, triádica 3; `SARAK_PALETTE_PRESET_TEXT_KEYS` liga cada id ao nome no catálogo;
  `SARAK_LEGACY_PALETTE_IDS` lista os cinco ids proibidos.
- `src/core/i18n/catalogEntries.palette.ts` — 15 nomes de preset em seis idiomas (acréscimo ao fim do arquivo).
- Os 19 temas: `colorPalette` + poda a partir do `HEAD` (até 184 linhas de cor por tema removidas). Ficam só sobrescritas, cada uma com uma linha de
  motivo: o fundo de hover do item de navegação (2 chaves, nos 19 temas), a família de superfícies em 7 temas (`cyber-retro-wave`,
  `neumorphic-mobile`, `synthwave-retro`, `blueprint-protocol`, `organic-clay`, `high-contrast`, `neo-brutalism`), as bordas chapadas em
  `neo-brutalism` e `high-contrast`, e seis cores de texto em `organic-clay`. Por tema, cores mantidas (design = contraparte): 2 em 12 temas,
  10 em 4, 16 em `organic-clay`, 17 em `neo-brutalism` e `high-contrast`. Também saíram os comentários que explicavam só o token podado.
- Mapa tema → preset: `sarak-sovereign` e `cyber-retro-wave` → `ciano-violeta`; `cyberpunk-neon` → `verde-neon`; `industrial-terminal` e
  `golden-hour` → `ambar-industrial`; `neo-brutalism` → `cobalto-vivo`; `synthwave-retro` → `rosa-synthwave`; `nebula-space`, `aurora-veil`,
  `corporate-ledger` → `ametista-petroleo`; `kinetic-flow` → `coral-cinetico`; `minimalist-airy` → `oceano`; `data-terminal` →
  `verde-tecnico`; `neumorphic-mobile` → `grafite-rosa`; `blueprint-protocol` → `azul-projeto`; `editorial-ink` → `tinta-vinho`;
  `organic-clay` → `terra-argila`; `high-contrast` → `amarelo-contraste`; `playful-pastel` → `rosa-pastel`.
- Marca `optionalForTheme` removida por inteiro (`schema/colors.ts`, `types.ts`, `theme-completeness-core.ts`, cabeçalho de
  `check-theme-completeness.ts`): o tema volta a declarar todo token estético.
- `catalog.generated.ts` regenerado (`npm run themes:catalog`); `docs/migracoes.md` — subseção na `## 8.0.0` (Q8).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/palette/presets.ts` | alterado | 15 presets, chaves de nome, ids legados |
| `src/core/Design/palette/__tests__/presets.test.ts` | alterado | registro: 12–15, ≥2 por tipo, nomes em 6 idiomas, ids legados caem sem paleta |
| `src/core/Design/presets/themes/<19 temas>.ts` | alterado | `colorPalette` + poda das cores + sobrescritas com motivo; cabeçalho de 6 temas corrigido |
| `src/core/Design/presets/themes/catalog.generated.ts` | alterado | regenerado |
| `src/core/Design/presets/themes/__tests__/themePalettes.test.ts` | criado | os 19 temas declaram preset existente; só sobrescrita; contraparte simétrica; design composto completo |
| `src/core/i18n/catalogEntries.palette.ts` | alterado | nomes dos presets (acréscimo) |
| `src/core/Design/schema/colors.ts`, `src/core/Design/types.ts` | alterado | sai `optionalForTheme` |
| `gates/scripts/contrato/helpers/theme-completeness-core.ts`, `check-theme-completeness.ts`, `__tests__/check-theme-completeness.test.ts` | alterado | tema com paleta não é cobrado pela cor que ela calcula; sobrescrita no `design` exige a da contraparte; sem `optionalForTheme` |
| `docs/migracoes.md` | alterado | subseção da `plan-134` (acréscimo) |
| `specs/plan/plan-134-catalogo-de-paletas-e-temas.md` | alterado | este resumo e o `status` |
| **Fora da §3.1, exigidos para o objetivo (ver Decisões):** | | |
| `src/core/Design/presets/themes/compose.ts` | alterado | `composeThemeForMode` e `withThemePalette` |
| `src/core/Design/presets/themes/catalog.ts` | alterado | a amostra de cor do catálogo lê o design composto |
| `gates/scripts/audit/verify_contrast.ts`, `verify_diversity.ts` | alterado | medem o design composto (paleta expandida) |
| `src/core/Provider/hooks/useThemeSeed.ts` | alterado | a semente do primeiro quadro expande a paleta |
| `src/features/DesignEngine/Canvas/components/PresetCard.tsx` | alterado | a miniatura do tema expande a paleta |
| `src/core/Design/utils/themeAxes.ts` | alterado | `colorPalette` válido cobre os eixos de cor e cromo |
| testes: `themeAxes`, `useThemeSeed`, `useDesignManager`, `TemaSobDemanda`, `TemaRastreavel`, `shippedThemesConsoleClean`, `useDesignVariables`, `compose`, `contraparteReferencia`, `themeSetCoverage`, `SarakBadge`, `SarakMenuItem`, `PresetsCatalog` (+ `.snap`) | alterado | valor esperado passa a ser o do design composto; asserção mantida |
| `browser-tests/tema-sob-demanda.spec.ts`, `fixtures/plan-122-preview-mode-entry.tsx`, `fixtures/plan-123-color-hierarchy-entry.tsx` | alterado | leem o design composto (não rodados) |

**Verificações executadas**
- `npx vitest run` sobre os 45 arquivos que importam temas + `src/core/Design/palette`, `presets`, `schema`, `utils`, `src/core/i18n`,
  `src/core/Provider/utils`, `gates/scripts/audit`, `gates/scripts/contrato` → 116 arquivos, 1365 testes: 1364 passam, **1 falha**
  (`themeSetCoverage` › `declara cores hierárquicas acessíveis no tema e em cada contraparte`, causa no mapa de papéis; ver Achados).
- `npx tsx gates/scripts/audit/verify_contrast.ts` → antes (HEAD) e depois, idêntico: 0 de 19 temas abaixo de AA, 0 pares reprovados, 0 pulados,
  0 no modo oposto, 19/19 com contraparte. (Com paleta e sem a poda de hover o resultado era o mesmo; só `organic-clay` reprovava 6 pares até as seis cores de texto serem mantidas.)
- `npm run themes:diversity` — antes → depois: `mode: dark` 8 → 8 de 19; primária S=100 10 → 5; família ciano+magenta 3 → 3; claro com primária
  saturada (S≥60) 5 → 6; fundo de luminosidade média (25–75) 2 → 2; famílias de matiz presentes 9 → 9 (ciano, verde, laranja, azul, magenta,
  roxo, vermelho, neutro, amarelo; `neumorphic-mobile` e `editorial-ink` seguem "neutro"); diversidade do cromo: 4/4 OK, igual.
- `npm run verify -- --tier=quick` → `tsc` OK; `audit:baseline --with-tsc` igual ao baseline de 2026-10-12; `theme-completeness:check` 19/19;
  `themes:catalog:check`, `token-types`, `token-docs`, `token-reader`, `channel-dispute`, `panel-contract`, Anel 0 (2415 linhas, 0 achados) OK.
  Falham `plan-index:check` (a `plan-135` está 🟠 no frontmatter e 🟡 no índice; o índice é do revisor) e `guide:check`
  (`sarak-ui/docs/migracoes.md` defasado; gerado, falha por desenho nesta etapa).
- Não rodei suíte completa, build nem navegador (§9 do contrato); os três pontos de navegador que li no código foram ajustados, sem execução.

**Critérios de aceite**
- [x] De 12 a 15 presets, ≥ 2 por tipo — `presets.test.ts` (15; analógica 2, monocromática 2, complementar 6, complementar dividida 2, triádica 3).
- [x] Os 19 temas declaram `colorPalette` — `themePalettes.test.ts`. Toda cor mantida tem justificativa — **a conferir na leitura do diff** (uma linha `//` acima de cada chave).
- [x] `auditor_contraste` e travas sem regressão — `verify_contrast` idêntico ao do HEAD; `audit:baseline` igual ao baseline.
- [x] Diversidade não piora — números acima (famílias 9 → 9, ciano+magenta 3 → 3, mode dark 8 → 8; "neon S=100" cai de 10 para 5, esperado: a escala reduz o croma nas pontas).
- [ ] A aprovação do dono na prévia — **pendente, é do revisor**: `C:\tmp\sarak-rc4-previa\134\index.html`. Ajuste pedido volta como correção de entrada de preset.

**Decisões e suposições**
- **Fora da §3.1, mas sem outro jeito de cumprir o objetivo** (cada um com teste): (a) `verify_contrast`/`verify_diversity` liam `theme.design`
  cru — com a poda mediriam o padrão do schema, não o tema (o §7 da `plan-133` já prometia o `auditor_contraste` medindo a paleta); (b)
  `catalog.ts` — sem isso a amostra do catálogo sairia vazia; (c) `useThemeSeed` — o primeiro quadro do Provider pintava o tema
  padrão com o padrão do schema (o teste de `useDesignManager` mostrou `#06080d` no lugar da paleta); (d) `PresetCard` — a miniatura
  do tema saía sem cor; (e) `themeAxes` — o tema de referência passava a ser "incompleto" em cor e cromo, e o consumidor veria o aviso.
- **O gate de completude** passou a aceitar que o tema com `colorPalette` não declare o que o motor calcula (`PALETTE_ROLE_MAP`), e a
  acusar a sobrescrita que está só no `design` (vazaria para o outro modo). Sem isso a poda era impossível: `optionalForTheme` não
  cobre a cor, que é obrigatória. O gate continua cobrando todo token que a paleta NÃO calcula.
- **Os 15 presets e o mapa** são escolha minha a partir das cores `primary/secondary/accent` de cada tema no modo padrão; onde a cor era
  quase neutra (`editorial-ink`, `neumorphic-mobile`) a base é a de baixa saturação e o acento é o que dá o matiz, para a família continuar
  "neutro" na diversidade. Temas com cores parecidas dividem preset (7 temas em 3 presets). O limite de 15 foi o que forçou o compartilhamento.
- **Sobrescrita de hover em todo tema:** o fundo de hover da escala (`primary 100/900` a 16%) fica abaixo de ΔE 2,3 sobre a barra em
  todos os temas e todos os modos; os 18 testes de realce do `SarakMenuItem` falharam. Mantive o hover autorado como sobrescrita
  justificada em vez de afrouxar o teste ou mexer no mapa de papéis (fora do escopo).
- **Famílias de superfície mantidas** onde a neutra da paleta destoa do fundo do tema (ΔE do corpo ≥ 0,08 em algum modo) e em
  `neo-brutalism` (papel creme); sempre nos dois blocos (`design` e `contraparte`).
- Teste `themeSetCoverage` e os de `SarakBadge`/`SarakMenuItem`/`useDesignVariables` passaram a medir o design composto, com a mesma asserção.
- O `PresetsCatalog.test.tsx.snap` foi atualizado só com `-u` neste arquivo; a diferença são só as cores da miniatura.
- Os nomes de preset ficam em `SARAK_PALETTE_PRESET_TEXT_KEYS` (id → chave do catálogo), não no registro, para o `PaletteInput` e o
  parser seguirem iguais; a galeria da `plan-135` (rótulo = id capitalizado hoje) pode lê-las.

**Achados fora do escopo (não corrigidos)**
- **Mapa de papéis (`palette/role-map.ts`, plan-133):** `titleColor` e `cardTitleColor` = `neutral 950/50`, o mesmo tom de `textColorMaster`
  (e `subtitleColor` = `textColorSecondary`); o exemplo do §2 da `plan-133` era título = primária 800/200. Na prévia, o título tem a cor do
  texto nos 19 temas — a "hierarquia refeita" fica só no tamanho e no peso. No escuro, `textColorMuted` (neutra 200) é quase o texto
  secundário (neutra 100). Mesma origem: o fundo de hover/ativo da barra, a 16–20%, quase não aparece.
- `docs/migracoes.md`, subseção da `plan-133`: diz que `colorPalette` "aceita o preset de teste `oceano`" — não é mais verdade (arquivo
  compartilhado, só por acréscimo; a minha subseção registra a mudança).
- O padrão do schema para as cores (`defaultValue`) é o do `sarak-sovereign` antigo (`#19e3f0`…); o tema agora pinta a paleta
  (`#6bd8e0`…). Componente sem Provider e `sarak-sovereign` com Provider deixam de ter a mesma cor.
- `resolvePaletteForDesign` lê `colorPalette` do tema antes do `config` do host: o host não troca a paleta de um tema que declara a sua.
- `plan-index:check`: `plan-135` 🟠 no frontmatter × 🟡 no índice (arquivo do revisor).

**Pendências / riscos**
- **1 teste vermelho:** `themeSetCoverage.test.ts` › `declara cores hierárquicas acessíveis no tema e em cada contraparte` — o título repete
  `textColorMaster` no design composto (achado acima). Não afrouxei a asserção nem toquei o motor. Decisão do revisor: reabrir o mapa de papéis
  da `plan-133` (uma linha por papel) ou aceitar a hierarquia só por tamanho. O mesmo vale para `plan-123-color-hierarchy.spec.ts`
  (navegador, título ≠ corpo), que falhará pela mesma causa.
- Os três arquivos de navegador ajustados e o `tema-sob-demanda.spec.ts` não foram executados (bateria do fechamento).
- `cyber-retro-wave` divide o preset `ciano-violeta` com `sarak-sovereign` e troca o acento (lima → rosa); só a prévia diz se o dono aceita.
- Fotografia inicial vazia, mas a `plan-135` mexeu em `docs/migracoes.md` e no catálogo de textos durante a execução; fiz só acréscimo por substituição exata.

---

# 10. Veredito

## Veredito — 2026-10-28 — 🔴 Reprovado

**O que o revisor mediu:** `npx vitest run` sobre `src/core/Design`, `src/features/DesignEngine`, `src/core/Provider`, `src/core/i18n`,
`gates/scripts/contrato`, `gates/scripts/audit`, `SarakBadge` e `SarakMenuItem` → 2071 verdes, 7 vermelhos (o desta plan está abaixo; os
outros 6 são do painel e foram para a `plan-135`); `check-audit-baseline` → igual ao baseline; diff dos 19 temas lido (só cor e
`colorPalette`, cada cor mantida com linha de motivo); prévia aberta (`depois/minimalist-airy-light.png`: título preto, igual ao texto).
Os arquivos fora da §3.1 (`compose.ts`, `catalog.ts`, `verify_contrast`, `verify_diversity`, `useThemeSeed`, `PresetCard`, `themeAxes`,
o gate de completude) são aceitos: cada um é consequência direta da poda e tem teste.

1. `src/core/Design/palette/role-map.ts:80` e `:40` — `titleColor` e `cardTitleColor` são `neutral 950/50`, o mesmo tom de
   `textColorMaster` (`:55`). A `plan-133` §2 item 3 (retida, aponta para cá) define título = **primária 800 no claro, 200 no escuro**.
   É o defeito que motivou a campanha ("cores de títulos não ficaram boas"). O teste `themeSetCoverage` › `declara cores hierárquicas
   acessíveis…` está vermelho por isso. Corrija o mapa conforme a 133: `titleColor` e `cardTitleColor` vão para a primária 800/200. A
   correção de contraste (`PAIRS`, que já tem `titleColor` sobre cinco fundos) garante o AA. **O escopo desta correção inclui o
   `role-map.ts` e o teste dele.**
2. `src/core/Design/palette/role-map.ts:55-57` e `:81` — no escuro a hierarquia de texto se espreme: mestre 50, secundário 100,
   apagado 200 (no claro: 950, 800, 500). Espelhe os degraus do claro no escuro, para que mestre, secundário/subtítulo e apagado sejam
   distinguíveis nos dois modos. Escolha os tons e informe-os no resumo. `textColorMuted` continua passando nos pares de `PAIRS`.
3. `src/core/Design/palette/role-map.ts:11-12` (e `topbarHoverColor`/`topbarActiveColor`, `:13-14`) — o fundo de hover/ativo
   (`primary 100/900` a 16–20%) fica abaixo de ΔE 2,3 sobre a barra em todos os temas. Por isso **os 19 temas** carregam 2 sobrescritas
   de hover. Uma sobrescrita que todo tema repete não é exceção justificada: é o mapa errado (§2 da plan, "o que fica é sobrescrita
   **justificada**"). Ajuste o mapa até os testes de realce do `SarakMenuItem` passarem **sem** a sobrescrita (ativo mais forte que
   hover) e remova as 2 chaves de hover dos 19 temas (design e contraparte), com as linhas de motivo delas.
4. Prévia: depois dos itens 1–3, regenere o lado `depois` e a grade de `presets` em `C:\tmp\sarak-rc4-previa\134\` (o `antes` fica).

**Pronto quando:** `npx vitest run src/core/Design src/core/Provider src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx
src/components/atomic/Feedback/__tests__/SarakBadge.test.tsx gates/scripts` verde; `npx tsx gates/scripts/audit/verify_contrast.ts`
com 0 reprovados; `npm run themes:diversity` com os números antes/depois no resumo; o `quick` uma vez. O navegador fica para o fechamento.

## Correção — 2026-10-28 (resposta ao veredito acima)

1. **Título.** `titleColor` e `cardTitleColor` foram para a primária 800 (claro) / 200 (escuro) em `role-map.ts`. O `themeSetCoverage` › "declara
   cores hierárquicas acessíveis…" voltou a passar; `PAIRS` segue garantindo o AA (`verify_contrast`: 0 reprovados, nativo e oposto).
2. **Hierarquia do texto no escuro.** Tons: mestre 50 (igual), secundário e `subtitleColor` **200** (era 100), apagado **300** (era 200). O claro
   fica 950 / 800 / 500. O espelho exato do apagado seria 500 (400 também foi tentado), mas `blueprint-protocol` mantém o fundo azul-médio
   (`colorBgLayer2` `#2d537e`) e 400/500 reprovam AA ali; 300 é o tom mais escuro que passa nos 19 temas.
3. **Hover/ativo da barra.** O mapa foi para hover = primária 200/800 a 60% e ativo = primária 300/700 a 60% (`sidebar` e `topbar`). As 2
   sobrescritas de hover saíram dos 19 temas (design e contraparte, com as linhas de motivo). **Exceção justificada, 2 temas:**
   `neumorphic-mobile` e `blueprint-protocol` mantêm o fundo da barra próprio, então o hover parte dele e não da neutra; as 2 chaves voltaram só
   nesses dois, nos dois blocos, com motivo. Os testes de realce do `SarakMenuItem` passam.
4. **Teste do mapa.** `role-map.test.ts` ganhou 2 casos: título/título do card = primária 800/200; mestre, secundário e apagado em degraus
   distintos nos dois modos (e `subtitleColor` = secundário).
5. **Prévia.** Lado `depois` dos 19 temas e grade de `presets` regenerados em `C:\tmp\sarak-rc4-previa\134\index.html` (o `antes` ficou). No
   `minimalist-airy` claro o título agora é azul-primária, distinto do texto.

**Medição:** `npx vitest run src/core/Design src/core/Provider SarakMenuItem SarakBadge gates/scripts` → 148 arquivos, 1553 testes, todos verdes;
`verify_contrast` 0 reprovados; `themes:diversity` depois = dark 8, S=100 5, ciano+magenta 3, claro saturado 6, fundo médio 2
(antes: 8 / 10 / 3 / 5 / 2); `verify -- --tier=quick`: só `guide:check` falha (kit gerado, por desenho nesta etapa). Navegador não rodado
(fica para o fechamento); `plan-123-color-hierarchy.spec.ts` deve voltar a passar, mas não foi executado.

## Veredito — 2026-10-28 — correção 1 — 🟢 Aprovado

**Verificado:** o filtro do veredito anterior (`src/core/Design`, `src/core/Provider`, `SarakMenuItem`, `SarakBadge`, `gates/scripts`) →
148 arquivos, 1553 testes verdes; `check-audit-baseline --with-tsc` → igual ao baseline; `role-map.ts` lido (título e título do
cartão = primária 800/200; texto 950/800/500 no claro e 50/200/300 no escuro, com o motivo de 300 medido no `blueprint-protocol`;
hover/ativo no mapa); sobrescritas de hover só em `blueprint-protocol` e `neumorphic-mobile`, com motivo, nos dois blocos. **O dono
aprovou a prévia** `C:\tmp\sarak-rc4-previa\134\index.html` em 2026-10-28 ("ficou excelente"). Os pontos que ele levantou (a cor que
muda entre os modos, os fundos quase pretos e brancos, a harmonia que não aparece) estão na `plan-136`: a regra do motor muda, mas o
que esta plan pediu está entregue.
