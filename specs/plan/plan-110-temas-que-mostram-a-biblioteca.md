---
tipo: "plan"
titulo: "Elevar o conjunto de temas embarcados ao padrao que a biblioteca entrega, e ensinar o importador a extrair isso"
objetivo: "Fazer os temas embarcados da lib, os 14 atuais refeitos e 5 novos, mostrarem do comeco ao fim o que o Design Engine sabe fazer, cada um com todo token estetico projetado nos dois modos, com direcao de arte de conjunto, valores padrao dos tokens redefinidos a partir do tema padrao, legiveis nos dois modos, provados por medicao e por vitrine aprovada pelo dono, e a documentacao de criar tema enriquecida"
dominio: "Design Engine / Temas embarcados / Design e UX"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "temas", "design", "ux", "design-engine", "direcao-de-arte"]
relacionados: ["[[09-temas-e-presets]]", "[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]", "[[12-kit-do-consumidor]]", "[[022-tema-sob-demanda]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md + arquitetura/02-design-engine.md + arquitetura/04-contrato-de-tokens-e-paridade.md + specs/12-kit-do-consumidor.md"
---

# 1. Objetivo

Quem abre a galeria de temas da lib vê **19 temas** — os 14 atuais refeitos e 5 novos — que, cada um do começo ao
fim, usam o arsenal do Design Engine (cor, textura, atmosfera de fundo, cartão, botão, campo, ícone, tipografia,
gráfico, movimento, densidade e cromo) com intenção de design, são distintos entre si como **conjunto**, legíveis
nos dois modos e confortáveis no celular.

E quem **importa** a lib para um sistema com identidade visual própria encontra, no kit e na documentação, o
caminho do cliente ao tema: o que cada token faz, o que a lib já entrega (para não recriar), e 19 temas completos
como modelos reais. O diferencial da lib é a **granularidade** — adaptar o visual à marca do cliente token a token —
e esta plan o torna aprendível: o **schema** é o mapa (enriquecido), cada tema é um **JSON completo** que serve de
exemplo, e o kit do importador ensina a usar.

# 2. Contexto

**Os temas embarcados são o reflexo de qualidade da lib** (decisão do dono, 2026-10-11): o que um consumidor vê
primeiro, e o que mostra a capacidade de tudo o que foi construído — inclusive o que entrou neste ciclo (navegação
na base, alvo de toque, movimento reduzido, família e peso de ícone, os sete tokens de gráfico, densidade, largura
máxima do conteúdo, selo de status com forma). **Não é uma revisão de configuração:** é elevar o padrão, pensando o
conjunto inteiro e cada tema do início ao fim.

**Quem executa esta plan trabalha como especialista em design e UX** — e como quem escreve a documentação de um
produto: tudo o que o tema ensina vira conhecimento no schema, no kit e na skill. O critério é de direção de arte e
de experiência — hierarquia, ritmo, contraste, personalidade, conforto de leitura, toque, movimento com propósito.
Os gates são o **piso**, não a meta: um tema que passa em tudo e é genérico não cumpre esta plan.

**Medido em 2026-10-14** (sobre `SARAK_ALL_THEMES`, `themes/all.ts`, e `MASTER_DESIGN_MAP`; os números de 2026-10-11
do lote 0 mudaram porque 27 tokens saíram do schema nas plans 111–115):

| Medida | Hoje |
|---|---|
| Tokens no dicionário | **402**, em 29 grupos de schema |
| Tokens que cada tema define | 223 a 239 (cerca de 55 a 60%) |
| Tokens que **nenhum** tema define | **156**, todos de componente — cada componente cai no padrão de fábrica |
| Chaves da `contraparte` por tema | 46 a 58 |
| Peso do maior tema (módulo sozinho, minificado, gzip) | 2,6 KB (`blueprint-protocol`) — o boot só leva o `sarak-sovereign` |
| Texturas de cartão (`cardTextureType`) | **3** usadas de **41** (`none`, `grid`, `scanlines`) — medido em 2026-10-11 |
| Fontes (`headingFont`/`bodyFont`) | cerca de 7 usadas de 20 opções — medido em 2026-10-11 |
| `cardVariant` | todos `classic` (e **deve continuar**: ele escolhe o card da grade, não um estilo) |
| Modo nativo | 9 escuros, quase todos na família neon/cyber/terminal — **pouca distância de personalidade entre eles** |

**Restrições que vêm das specs fixas e não mudam** ([[09-temas-e-presets]] §2.1, §4.3.2, §4.3.3, §4.4, §4.7, §5.1, §6, §7):

- **Os 14 ids continuam** (tema salvo de consumidor guarda o id); os 5 novos ganham ids novos e entram no catálogo
  pela regra de registro da `09` §2 obs. 3 (id + arquivo + `all.ts` + `loaders.ts` + `npm run themes:catalog`).
  **Nunca** importar um tema no `index.ts` nem no barril — a trava `theme-boot:check` falha.
- Todo tema embarcado tem **`contraparte` autorada** (sem isenção), **`enabledLanguages`** com os seis idiomas, as
  **posições de preferência no padrão de fábrica**, o fundo de hover do item de navegação perceptivelmente distinto
  do repouso nas duas orientações, e passa no procedimento da §7.
- **Todo fundo funciona offline** (§5.1): atmosfera do motor de textura da lib (`_atmosphere.css`, `TEXTURE_OPTIONS`)
  ou arte **própria** embutida como `data:image/svg+xml;base64,…` (aceita pelo `isSafeMediaString`,
  [[10-seguranca-e-acessibilidade]] §2.1). **Nunca** URL de terceiro.
- **A composição da troca de tema** (`composeThemeDesign`, `09` §4.3.3): padrões do schema → identidade → `config` do
  host → tema. Um tema que **não declara** um token vale o padrão do schema; por isso declarar todo estético é o que
  impede um tema de "herdar" a cara do padrão.
- **Fonte de tema é o valor exato da lista** (`THEME_FONTS`, ex.: `"'Fraunces', serif"`); a lista é a fonte única do
  carregador de webfonts. As fontes vêm do Google Fonts por `@import` (offline, cai na reserva) — dependência de
  terceiro aceita e **declarada na documentação do importador**.
- **Valor salvo vence o embarcado** (§4.4): quem já salvou tema não recebe o refinamento — por isso a nota de
  migração e o MAJOR.
- Contraste de texto ≥ 4,5:1 nos dois modos (**R31**, `auditor_contraste`); diversidade medida
  (`themes:diversity`); nenhum aviso no console (`shippedThemesConsoleClean.test.ts`); valor dentro do contrato do
  token (`tokenContractParity.test.ts`); nenhuma chave órfã (`auditor_presets`).
- **O contraste mede o que os componentes desenham:** `verify_contrast.ts` cobre os pares de texto sobre corpo e
  cartão, inclusive a primária, as de status e a de erro de campo **como texto**. A primária de um tema é, portanto,
  também uma cor de texto: a direção escolhe uma primária que passe 4,5:1 sobre o corpo nos dois modos, ou o tema
  reprova. O texto sobre cor sólida (badge, botão de perigo/sucesso, bolha do chat) é escolhido pelo motor.

**O arsenal passou por correção antes desta plan** (plans 111–115, conferido no código em 2026-10-14): `bgGradientMode`
e `bgGradientAngle` desenham (`_background.css`); `surfaceMaterial` e `shadowColorMode` têm regra (`_surfaces.css`,
`_card-materials.css`); `systemTone` desenha `cyber` e `tactical`; a geometria da sombra do cartão é token
(`--sarak-card-shadow-offset-*`, `-blur`, `-expansion`); as texturas pintam com `--theme-texture-color`; as fontes
vêm de `THEME_FONTS`; `cardVariant` deixou de ser `visualImpact`; as cores de status saíram das séries do gráfico.
**Os achados A1 a A10 do anexo de direção estão fechados no código; o A11 (fontes por Google Fonts, offline cai na
reserva) continua e é tema de documentação.** O anexo foi escrito antes — onde ele diz "não desenha", **vale o
código**: o executor reconfere cada alavanca antes de usá-la, e a direção que contornava uma alavanca quebrada é
revista para usá-la.

**Decisões do dono, 2026-10-13 e 2026-10-14:**

- **Todo token estético é projetado em todo tema, e cada tema é pensado do início ao fim.** Os temas não podem se
  parecer por herdar o padrão. O schema separa os tokens em **estéticos** (cor, elevação, textura, tipografia,
  geometria visual, densidade visual, movimento) e **funcionais** (camadas, alvo de toque, larguras e posições do
  cromo, breakpoints, comportamento); todo tema embarcado declara **todos os estéticos** no modo principal e, na
  `contraparte`, todos os estéticos que dependem do modo (cor, elevação, textura, sombra, vinheta) — geometria,
  tipografia e movimento são herdados do modo principal de propósito, e é isso que preserva a identidade entre os
  modos. Os funcionais **não** são declarados por tema: valem o padrão do sistema, igual em todos.
- **O mapa dos tokens é o schema.** A análise de cada token (o que desenha, quem lê, estético ou funcional, depende
  do modo, faixa útil, interações, nota de uso, exemplo real) entra como **metadado no próprio schema**, e o catálogo,
  o kit e a skill o **derivam** pelos geradores. Não existe documento paralelo escrito à mão (R17).
- **A ficha de um tema é o JSON completo** (`design` + `contraparte`), no mesmo formato que o painel exporta. O
  porquê dos valores não óbvios fica como comentário no arquivo do tema e numa nota de conceito curta; elas viram os
  exemplos da documentação.
- **O tema padrão é o `sarak-sovereign`** (o que carrega quando ninguém escolhe).
- **Os valores padrão dos tokens são redefinidos:** os funcionais, revisados um a um como decisão de sistema; os
  estéticos, iguais aos do tema padrão — assim o primeiro quadro, o componente sem Provider e o tema parcial do
  consumidor já mostram o tema padrão. As reservas `var(--x, F)` acompanham (R42).
- **Temas sob demanda** (`plan-116`, sintetizada): o boot leva só o `sarak-sovereign`. O teto de peso é **por tema**,
  hoje 3 KB gzip, e **é medido e ajustado no lote do tema padrão** com a evidência (um tema que declara todo token
  estético tende a pesar mais que os 2,6 KB de hoje). O ajuste é feito pelo revisor em
  `PER_THEME_CEILING_BYTES` (`scripts/measure-consumer-boot.mjs`) com a medição no resumo.
- **O dono valida no importador, no fim**, depois do merge e de uma **candidata `8.0.0-rc.1`** (tag de teste; quem a
  emite é o dono, `git-ci-cd`). Por isso esta plan **não depende da aprovação do dono por tema**: cada lote se prova
  por trava automática, e o **revisor** confere as capturas da vitrine antes de aprovar o lote. A plan entrega, ao
  final, o **roteiro de validação** do importador.
- **A documentação do importador é entrega de primeira classe** (§5, passo de cada lote e lote final): ensina a usar a
  granularidade, do cliente ao tema, **e o que a lib já faz** — para o importador não recriar funcionalidade
  disponível.
- **Um tema por lote**, independentes entre si.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/themes/` — os 14 temas, os 5 novos, o registro (`index.ts` ids, `all.ts`, `loaders.ts`,
  `catalog.generated.ts` por `npm run themes:catalog`) e testes em `__tests__/`. Um tema pode virar pasta com partes
  por pilar se o tamanho pedir (o `auditor_cleancode` isenta `/presets/themes/`).
- `src/core/Design/schema/`, `src/core/Design/types.ts` e `catalog/` — os **metadados novos por token** (`kind`
  estético/funcional, `modeDependent`, `usage`, e `interactsWith`/`example` quando houver), o `defaultValue` (lotes 5
  e 6), com a paridade; **nenhum token novo, nenhuma opção nova, nenhuma mudança de leitor**.
- Os geradores que levam o schema ao consumidor: `scripts/consumer-kit/` (`collectKitSources`, `renderAppendix`,
  `buildKitCatalog`), `scripts/generate-component-catalog.mjs` e o gate de documentação de token (§5, lote 1).
- As reservas `var(--x, F)` que acompanham o `defaultValue` novo (pela ferramenta do `variable-contract`), em
  `src/styles/`, `src/components/` e `src/features/`.
- `gates/` — a trava de completude estética e a de documentação de token; `gates/scripts/audit/` só se um tema expuser
  defeito de medição já existente.
- `scripts/measure-consumer-boot.mjs` — somente o `PER_THEME_CEILING_BYTES`, pelo revisor.
- `browser-tests/` — a vitrine (`generate-showcase.mts`, `fixtures/showcase-entry.tsx`) estendida e usada em todo lote.
- **Documentação do importador:** `sarak-ui/GUIA-FRONTEND.md` (autoria; o apêndice é gerado), `.agents/skills/ui-criar-tema/`
  e `.agents/skills/ui-integra-consumidor/` (fonte do kit). A §7 da `09` e a `12` são do revisor, na síntese.
- `specs/plan/anexos/plan-110-direcao-de-arte.md` (o executor acrescenta a nota de conceito de cada tema) e
  `specs/plan/anexos/plan-110-tokens-funcionais.md` (lote 1).
- `docs/migracoes.md` — subseção dentro de `## 8.0.0` a cada lote; artefatos regenerados.

## 3.2 Fora
- Componentes e CSS do motor: esta plan **usa** o arsenal. Defeito achado no caminho vai para o resumo, como achado.
- Token novo, opção nova, mudança de leitor.
- Mudar o que é exigido de tema embarcado (§7 da `09`), as regras de contraste e de diversidade.
- Versão e tag: nenhuma plan mexe; a MAJOR é aplicada no merge e a rc pelo dono.
- Qualquer spec em `specs/` além dos anexos (a síntese é do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/plan-110-direcao-de-arte.md` | a direção aprovada no lote 0: mapa do conjunto, fichas, direções novas (os "não desenha" da §3.2 dele estão **superados pelo código**, ver §2) |
| Spec fixa | `specs/09-temas-e-presets.md` (inteira; em especial §2.1, §4.1.1, §4.3.2, §4.3.3, §4.4, §4.4.4, §4.7, §5, §5.1, §5.2, §6, §7) | tema, contraparte, composição, carga sob demanda, persistência, catálogo, travas e o procedimento do tema embarcado |
| Spec fixa | `arquitetura/02-design-engine.md` (§3.3, §4, §10) | como o motor transforma token em CSS; o que cada token desenha |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | o dicionário, o contrato de valor e a paridade que os metadados novos respeitam |
| Spec fixa | `specs/05-cromo-e-slots.md` §2.4 · `specs/07-responsividade-e-multidispositivo.md` §5 | cromo, navegação, toque |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §2.1 e §2.4 | mídia, contraste, movimento reduzido e toque |
| Spec fixa | `specs/12-kit-do-consumidor.md` | onde mora o guia do importador e o que o kit gera |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R17, R18, R31, R40-R44) | não transcrever fonte viva, limites de gate, contraste, leitor, cascata, variável, cor fixa, painel |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-criar-tema` · `ui-criar-preset` · `ui-arquitetura-design` · `ui-integra-consumidor` · `dataviz` | procedimento de tema, presets, CSS do motor, kit do importador, paleta de gráfico |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/core/Design/presets/themes/` (incl. `all.ts`, `loaders.ts`, `compose.ts`), `src/core/Design/master-map.ts` (`getScaffold`), `src/core/Design/schema/`, `src/core/Design/catalog/partitions/` | os temas, o esqueleto completo e o arsenal |
| Código | `gates/scripts/audit/verify_contrast.ts`, `verify_diversity.ts`, `gates/scripts/contrato/check-variable-contract.ts`, `check-theme-boot-closure.mjs`, `src/core/Provider/utils/__tests__/shippedThemesConsoleClean.test.ts`, `tokenContractParity.test.ts` | as travas que todo tema passa |
| Código | `scripts/measure-consumer-boot.mjs`, `scripts/consumer-kit/`, `browser-tests/generate-showcase.mts`, `browser-tests/fixtures/` | peso por tema, geradores do kit, vitrine |

# 5. Instruções de execução

**Lote 0 — auditoria e direção de arte.** ✅ Entregue e aprovado pelo dono (§9 e §10). O que mudou depois está em §2.

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 (append-only) e status 🟠; o próximo só começa
depois do veredito.** Em **todo** lote que toca código:

- **Enriquecer o schema e a documentação com o que o lote ensinou** (metadado do token, receita, armadilha, exemplo
  real) — o conhecimento não fica no resumo.
- Contraste não textual relatado por tema e modo (WCAG 1.4.11, 3:1 — apoio, não gate).
- Nota MAJOR na `## 8.0.0`; gerados regenerados (`guide` e `dev-kit` por último).
- **A verificação não é do executor** (decisão do dono, 2026-10-16): suíte, `tsc`, baseline, Anel 0/1, R36 e navegador são rodados **uma vez, pelo revisor**, no nível que o diff pede (`npm run verify`). Lote de **tema** (só os `.ts` de tema e anexos) roda o nível `themes`: trava de completude, catálogo, fecho do boot, contraste, diversidade, peso por tema e testes que iteram `themes/all` — **sem** suíte completa nem `tsc`. Lotes 1–4 (metadado de schema) rodam `schema-meta`. O executor roda só o teste do que escreveu e relata isso.

**Dependência parcial (decisão do dono, 2026-10-15): a `plan-117` (pendências do arsenal) fecha antes do lote 5.** Os lotes 1 a 4 (análise e documentação dos tokens) seguem; a `plan-117` ligou cinco tokens e retirou três (`cardContentAlignment`, `tableActionPosition`, `cardImagePosition`), e **fechou em 2026-10-16** (sintetizada, mas **mantida aberta como registro**, retida por esta plan e removida com ela). Os lotes 5 em diante estão liberados quanto a ela; pendência nova do arsenal que a aplicação dos temas achar entra na tabela da §5.1 dela e é corrigida lá, antes do tema seguinte (decisão do dono, 2026-10-16). **A `plan-118` (fontes embarcadas, e catálogo de tipografia ampliado) fechou em 2026-10-16** (sintetizada): os temas escolhem fonte pelo `value` exato de `THEME_FONTS` (`typography.ts`, 41 famílias), e o que a `ui-criar-tema` e o kit ensinam sobre fontes está em [[09-temas-e-presets]] §4.4.4 e no ADR 023. Os lotes 7 e 25 estão liberados quanto a ela.

**Lote 0.1 — pré-requisito (prompt direto do revisor, fora desta plan):** `generate-showcase.mts` volta a funcionar
(`SARAK_ALL_THEMES`; o harness passa pela porta de espera do tema sob demanda) e a aba "Temas e JSON" (`TemplatesTab`)
usa `themeCatalog` com carga sob demanda. O lote 1 só começa depois.

**Lotes 1 a 4 — a análise profunda de todos os tokens, e o schema como mapa.** Quatro lotes, por grupos de schema,
para que cada token seja realmente entendido (nenhum "preenchido em bloco"):

| Lote | Grupos de schema |
|---|---|
| 1 | `cards`, `cardTitle`, `cardAction`, `cardSearch`, `overlays`, `tables` |
| 2 | `typography`, `buttons`, `inputs`, `switches`, `colors`, `data`, `chat`, `status` |
| 3 | `atmosphere`, `animations`, `motion`, `engineering`, `specialized`, `scrollbars`, `layers`, `advanced`, `media` |
| 4 | `global`, `branding`, `system`, `navigation`, `structural`, `preferences` |

Em cada lote, para **cada token do grupo**, o executor abre o leitor no código, **confere no navegador** (vitrine ou
harness) o que o valor muda, e registra no schema:
1. `kind`: **estético** ou **funcional** (critério no anexo `plan-110-tokens-funcionais.md`: funcional é o que deve
   ser igual em todo tema por segurança, acessibilidade ou consistência de comportamento);
2. `modeDependent`: carrega modo (entra na `contraparte`) ou não;
3. `usage`: uma ou duas frases — **o que muda na tela, e onde** — em português, sem repetir o rótulo;
4. `interactsWith` (ids) quando um token só tem efeito com outro (ex.: cor de textura × `cardTextureType`);
5. a faixa útil e o que quebra fora dela, quando o contrato numérico não bastar.
O lote 1 também cria a **infraestrutura**: os campos no tipo do token e na paridade, o **gate de documentação de
token** (todo token tem `kind`, `modeDependent` e `usage`; exceção por token que se esvazia a cada lote; limites R18,
mutação), a renderização no catálogo (`catalog.json`) e no apêndice do kit por pilar, e o **mapa "o que a lib já faz"**
(§ próxima) em esqueleto. O painel continua oferecendo os dois tipos. Token que o executor julgar **sem efeito visível**
não é "documentado como tal": vai para o resumo como achado (§3.2).

**O mapa "o que a lib já faz — não recrie".** No kit do importador (GUIA e skill `ui-integra-consumidor`), uma seção
gerada do catálogo e curada à mão **por capacidade**: para cada necessidade comum do importador (navegação, cromo e
slots, tabela, formulário e validação, gráfico, calendário/Gantt/Kanban, modal e toast, i18n, preferências do usuário,
persistência de tema, modo embarcado, painel de customização, tema derivado da marca…), **qual componente/token/porta
da lib a atende e por que não reconstruir**. Nasce no lote 1 (esqueleto) e cada lote acrescenta o que descobriu; o
último consolida.

**Lote 5 — padrões funcionais, vitrine e trava.**
5.1. Revisar o `defaultValue` de cada token **funcional** como decisão de sistema (escada de camadas, alvo de toque,
larguras, posições, comportamento), cada mudança com o motivo no anexo; reservas acompanham; nota MAJOR.
5.2. Estender a vitrine (`npm run themes:showcase`) para montar as telas representativas (cromo com navegação,
painel com cartões, tabela, formulário com erro, gráfico, calendário, selos de status, estado vazio, modal, chat) e
capturar um tema nos dois modos, em desktop e celular.
5.3. **Trava de completude:** todo tema embarcado declara todos os tokens estéticos no modo principal e, na
`contraparte`, todos os estéticos que dependem do modo; nenhum funcional. Gate ou teste (escolha justificada), com
limites (R18), caso de mutação, e **lista de exceção por tema que se esvazia** a cada lote.

**Lote 6 — o tema padrão e os padrões estéticos.**
6.1. Refazer o `sarak-sovereign` do começo ao fim pela ficha, com todo token estético projetado, nos dois modos.
6.2. Os `defaultValue` estéticos passam a ser os valores do `sarak-sovereign` no modo principal; reservas acompanham;
o `variable-contract:check` confere.
6.3. **Medir o peso do tema** (`measure-consumer-boot.mjs`, método do §4.1 do anexo) e propor o **teto por tema** com a
evidência; o revisor ajusta `PER_THEME_CEILING_BYTES`. Se o peso exigir, a estrutura do tema pode virar partes por
pilar (não a perda de tokens).
6.4. Capturas da vitrine → **conferência do revisor** (§7).

**Lotes 7 a 19 — os outros 13 temas atuais**, um por lote, na ordem do anexo de direção; **lotes 20 a 24 — os 5
novos**, um por lote, registrados pela regra da `09` §2 obs. 3.
7.1. Cada tema parte do esqueleto completo (`getScaffold`), nunca de `{}`, segue a sua ficha do anexo (revista pelo
que o código já entrega, §2) e declara todo token estético; a `contraparte` preserva a identidade (só o que carrega
modo muda); fundo por atmosfera do motor ou SVG próprio embutido; paleta de gráfico validada pela skill `dataviz`;
fontes pelo valor exato da lista; o tema sai da lista de exceção da trava.
7.2. O arquivo do tema é a ficha: comentários curtos nos valores não óbvios, e a **nota de conceito** (arquétipo de
identidade, que tokens carregam a personalidade, o que o tema demonstra da lib) no anexo de direção.
7.3. O que o tema ensinou entra no schema (metadados), no mapa "o que a lib já faz" e no guia do importador
(receita, armadilha, padrão) — **no mesmo lote**.
7.4. Capturas da vitrine → conferência do revisor.

**Lote 25 — conjunto, documentação consolidada e roteiro de validação.**
25.1. Cobertura do **conjunto**: os 19 usam juntos pelo menos 15 texturas de cartão, 10 fontes, as 3 famílias de
ícone com pelo menos 4 pesos, e nenhum par repete a mesma combinação de textura + estilo de botão + fonte de título
(teste, com mutação); `themes:diversity` verde. (O critério "4 modos de gradiente" volta, porque o gradiente agora
desenha — D6 do lote 0 está superada.)
25.2. **Guia do importador consolidado** (kit e skills), com exemplos tirados dos temas reais:
- **Do cliente ao tema:** da identidade visual (marca, tipografia, cantos, densidade, tom, movimento) aos pilares e
  tokens que a carregam, com a ordem de decisão recomendada;
- **Os 19 temas como arquétipos:** qual tema e quais tokens demonstram qual capacidade;
- **Receitas** do mínimo (poucas chaves sobre uma referência derivada) ao completo, e o que muda em cada nível;
- **Armadilhas medidas** (eixo omitido não muda; contraste da primária como texto; contraparte só troca o que carrega
  modo; a fonte exige o valor exato da lista; Google Fonts offline);
- **O que a lib já faz** (o mapa, consolidado);
- o JSON completo de um tema como modelo, e **como exportar do painel** e colar.
25.3. **Roteiro de validação para o importador** (documento entregue ao dono): o que testar em cada tema e em cada
token-chave, em desktop e celular, nos dois modos, e como reportar — para que o teste na rc gere correção mapeada.
25.4. Vitrine dos 19 temas × 2 modos × desktop e celular, gerada; **conferência final do revisor**.

# 6. Critérios de aceite

- [ ] Lote 0 aprovado pelo dono (✅) e o pré-requisito 0.1 entregue.
- [ ] **Os 402 tokens** com `kind`, `modeDependent` e `usage` no schema, derivados ao catálogo e ao apêndice do kit;
  gate de documentação de token com lista de exceção **vazia** no fim e caso de mutação.
- [ ] Padrões funcionais revisados, cada mudança com motivo; padrões estéticos = valores do `sarak-sovereign`;
  reservas acompanhando (`variable-contract:check` verde).
- [ ] Trava de completude estética com lista de exceção **vazia** no fim; caso de mutação.
- [ ] 19 temas no catálogo; os 14 ids antigos preservados; cada um com **todo token estético projetado** e o arquivo
  como ficha completa (JSON no formato do painel).
- [ ] **Todo tema tem claro e escuro, e o modo oposto preserva a identidade:** a `contraparte` troca só o que
  carrega modo.
- [ ] Todo tema com `contraparte`, seis idiomas, preferências no padrão de fábrica, hover de navegação distinto, fundo
  offline e peso dentro do teto por tema medido e ajustado no lote 6.
- [ ] Cobertura do conjunto (teste, com mutação); `themes:diversity` verde.
- [ ] Contraste (R31) e paridade verdes; `auditor_presets`, `shippedThemesConsoleClean`, `tokenContractParity`,
  `panel-contract` verdes.
- [ ] Capturas de cada tema conferidas pelo revisor; vitrine final gerada.
- [ ] **Kit do importador** (GUIA e skills) consolidado: do cliente ao tema, receitas, armadilhas, **mapa "o que a
  lib já faz"**, exemplos dos temas reais; `guide:check` e `kit-names:check` verdes.
- [ ] Roteiro de validação do importador entregue.
- [ ] Nota MAJOR em `## 8.0.0`.
- [ ] Suíte completa verde numa passada; `tsc` 0; `audit:baseline` sem regressão; Anel 1; `cromo-css-real:check`;
  catálogo, kit e barril em dia; Anel 0 simulado: 0.

# 7. Como verificar (uso do revisor)

- Lotes 1–4: **amostra** de tokens por grupo contra o leitor no código e o efeito na vitrine (o `usage` diz a
  verdade?); o gate de documentação com mutação; o apêndice do kit gerado; nenhum token novo.
- Lote 5: cada padrão funcional mudado e o motivo; a trava de completude com mutação; a vitrine estendida.
- Lotes de tema: o tema contra a ficha; completude (a trava); contraste nos dois modos; peso; **as capturas (o revisor
  abre as imagens)** nos dois modos, desktop e celular, contra a nota de conceito — registra no veredito o que viu;
  o que foi ensinado ao schema e ao kit.
- Lote 25: o guia lido de ponta a ponta como se fosse um importador (alguém consegue ir do cliente ao tema e evitar
  recriar o que a lib tem?); o roteiro de validação.
- `git diff --stat` → só a §3.1 e os gerados.
- `npm run build` + `npm run cromo-css-real:check` + `npm run themes:showcase` · `npm run boot:measure` ·
  `npm run audit` · `npm run themes:diversity` · `npx vitest run` · `npx tsc --noEmit` ·
  `npm run audit:baseline -- --with-tsc` · Anel 1 · Anel 0.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md + arquitetura/02-design-engine.md + specs/12-kit-do-consumidor.md + arquitetura/04-contrato-de-tokens-e-paridade.md`

- **`09`:** o padrão do tema embarcado (todo estético projetado, contraparte do que carrega modo, funcionais do
  sistema), o mapa do conjunto em tabela curta (id → conceito → modo nativo), o teto por tema medido, as travas de
  completude e de conjunto; a §7 ganha o procedimento enriquecido.
- **`02`:** estético × funcional; o padrão dos tokens estéticos é o tema padrão.
- **`04`:** os metadados novos do token (`kind`, `modeDependent`, `usage`, `interactsWith`) e o gate de documentação.
- **`12`:** o que o kit gera, o guia do importador e o mapa "o que a lib já faz".
- Os anexos saem com a plan; o que é regra vai para as specs, o resto fica no Git.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Histórico consolidado dos lotes 0 a 2 (aprovados)

> O texto integral dos resumos e das tabelas por token está no histórico do Git
> (`git log -p -- specs/plan/plan-110-temas-que-mostram-a-biblioteca.md`, a partir de `5877b789`). Aqui fica o que um
> executor novo precisa saber.

| Lote | Resultado | Onde a verdade vive agora |
|---|---|---|
| **0** — auditoria e direção de arte (2026-10-11) | Anexo de direção de arte: auditoria dos 14 temas, arsenal que desenha e o que não desenha, decisões D1 a D7, as 19 fichas, as 5 direções novas e os ids. Aprovado pelo dono. | `specs/plan/anexos/plan-110-direcao-de-arte.md` |
| **0.1** — pré-requisito (prompt direto) | `generate-showcase.mts` volta a funcionar e a aba "Temas e JSON" usa o catálogo sob demanda. | código (`browser-tests/`, `TemplatesTab`) |
| **1** (2026-10-14/15) — `cards`, `cardTitle`, `cardAction`, `cardSearch`, `overlays`, `tables`: 120 tokens | Infraestrutura (campos `kind`/`modeDependent`/`usage`/`interactsWith` no tipo e na paridade; gate `token-docs:check` com exceção que se esvazia; catálogo e apêndice do kit; esqueleto do mapa "o que a lib já faz"). **7 tokens sem efeito** achados no navegador (spotlight, traço luminoso, zoom, escala do clique, `cardContentAlignment`, `tableActionPosition`) mais código morto e `cardImagePosition` sem leitor — todos resolvidos pela `plan-117`. Os 23 tokens do painel ficaram documentados pelo leitor (aceito). | schema, `gates/allowlists/tokenDocumentationPending.json`, anexo `plan-110-tokens-funcionais.md`, GUIA §6, skill `ui-integra-consumidor` |
| **2** (2026-10-16/17) — `typography`, `buttons`, `inputs`, `switches`, `colors`, `data`, `chat`, `status`: 111 tokens | Reprovado uma vez (sem medição no navegador); a correção mediu os 111 em Chromium (tabela por token no histórico). Achados: `actionGlowShadow*` (3), `colorDepth`/`colorVariation`, `chartType` `radar`/`heatmap` (quebram o ECharts) e `rangeActiveColor` (o trilho ignora o token) — viraram P10 a P13 da `plan-117`. `usage` de `headingFont` corrigido. | schema, anexo, GUIA §6.5–§6.6, skill |
| **3** (2026-10-17) — `advanced`, `animations`, `atmosphere`, `engineering`, `layers`, `media`, `motion`, `scrollbars`, `specialized`: 92 tokens | Medidos em Chromium 153 (tabela por token no histórico): 90 documentados; **2 sem efeito**, `motionEaseIn` (tem leitor, a medição não viu efeito) e `matrixGap` (`--matrix-gap` definida e nunca lida), na exceção `achado-lote-3` e no registro da `plan-117` (P14, P15). Quatro `description` que diziam o contrário do medido foram corrigidas (`globalSaturation`, `globalContrast`, `bgNoiseDensity`, `motionEaseOut`). | schema, anexo §6, GUIA §6 e §6.7, skill |

**Decisões que valem para os lotes seguintes:** o schema é o mapa; a ficha é o JSON completo do tema; sem aprovação do
dono por tema (a validação é no importador, na `8.0.0-rc.1`, e o lote 25 entrega o roteiro); o kit do importador é
entrega de primeira classe; **a medição no navegador é obrigatória por token** (Chromium headless com
`PLAYWRIGHT_BROWSERS_PATH` absoluto em `node_modules/.cache/ms-playwright`, `chromium.launch()` sem `executablePath`, cena
de `src/` fora do repositório); token sem efeito é achado, nunca "documentado como tal"; a verificação é só do revisor,
no nível do diff (`schema-meta` nos lotes 1–4).

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Vereditos consolidados dos lotes 0 a 2

- **Lote 0 — 2026-10-11 — aprovado pelo dono.** D1 a D7 aprovadas como o anexo recomenda; regra reforçada: todo tema tem
  claro e escuro e o modo oposto preserva a identidade. Os achados A1–A11 do anexo foram conferidos no código em
  2026-10-14: A1–A10 fechados pelas plans 111–115, A11 (Google Fonts) fechado pelo embarque de fontes; D6 superada.
- **Revisão da plan — 2026-10-14.** Plan reescrita pelo revisor com o dono: fatos atualizados contra o código; o schema
  como mapa; ficha = JSON completo; kit do importador como entrega de primeira classe; teto por tema medido e ajustado no
  lote 6; candidata `8.0.0-rc.1` antes da `8.0.0`.
- **Lote 1 — 2026-10-15 — 🟢 aprovado.** Diff dos schemas só acrescenta metadados; gates verdes; suíte completa
  3466/3466; 14 `usage` conferidos contra o leitor; os sete "sem efeito" reabertos e confirmados.
- **Lote 2 — 2026-10-16 — 🔴 reprovado** (nenhum token medido no navegador; `usage` de `headingFont` desatualizado) e
  **2026-10-17 — correção 🟢 aprovada**: 111 tokens medidos em Chromium 153, `schema-meta` verde, quatro pendências do
  arsenal enviadas ao registro da `plan-117`.

- **Lote 3 — 2026-10-17 — 🟢 aprovado.** 92 tokens medidos; diff só de metadado de schema; `schema-meta` verde (318 de 399
  documentados, 81 em exceção: 79 do lote 4 e os 2 achados); os dois achados conferidos por `git grep` e levados ao
  registro da `plan-117`.

**Próximo: lote 4.** Os gerados (`guide`, `dev-kit`, `token-types`) já saem regenerados pelo revisor.

## Resumo da execução — lote 4 — 2026-10-17

**Resultado:** Concluído com pendências (dois tokens sem efeito entregues como achado; gerados defasados para o revisor regenerar).

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-110-temas-que-mostram-a-biblioteca.md
```
(O lote 4 da plan-117 já estava commitado — `c4674f15`; não o toquei nem o reli para limpar.)

**O que foi feito**
- Medi no Chromium 153 (Playwright 1.63, `PLAYWRIGHT_BROWSERS_PATH` absoluto em `node_modules/.cache/ms-playwright`, `chromium.launch()` sem `executablePath`) os **79 tokens** dos seis grupos. Cena montada de `src/` por alias, CSS gerado por Tailwind e bundle em scratchpad, **fora do repositório**: cromo lateral e do topo (com usuário, notificações, painel secundário, logo, busca aberta), viewport de celular (390 px) e de 600/1000/1280 px para os breakpoints, e uma cena estrutural (`SarakGrid`, `SarakFlex`, `SarakFormGroup`, `SarakSwitch`/`Checkbox`/`Radio`, `SarakSplitPane`, `SarakTable`, `SarakCatalogGrid`, `SarakActivityFeed`, `SarakAccordion`, ícones). Método: diferença de estilo computado de todo elemento e pseudoelemento, em repouso, hover, foco, pressionado, rolagem e recolhimento do cromo; elementos que surgem ou somem contam como mudança.
- **Preferências do usuário:** o padrão de posição (`preference*Position`, `chrome*Position`) lê só o `design` do `config`, sem porta extra; medi a posição pelo cromo (o controle sai da barra, vai para o ⚙ ou some). Para `navigationStyle`, `bodySize` e `mode` liguei a **porta pública `useSarakPreferences().updatePreferences`** (`pref` na cena) e comparei: a preferência vence o valor do tema (ver tabela).
- `kind`, `modeDependent`, `usage` e `interactsWith` em **77 tokens** (`global.ts`, `branding.ts`, `system.ts`, `icons.ts`, `navigation.ts`, `structural.ts`, `preferences.ts`); os 5 de preferência entram pelo auxiliar `buildPositionToken` (`preferences.ts`) com o mapa `POSITION_USAGE`, porque o id nasce de constante, não de literal. Removi os 77 de `gates/allowlists/tokenDocumentationPending.json`; `contentAlignment` e `sidebarCollapsedWidth` ficam na exceção com o rótulo `achado-lote-4`.
- Corrigi a `description` de `mode` (dizia "alterna a aplicação inteira"; o valor sozinho não repinta a tela).
- Documentação: GUIA §6 (linhas "navegação, cromo e slots" e "escolhas do usuário" preenchidas; estado do mapa) e novo §6.8; skill `ui-integra-consumidor` (linhas e armadilhas); `docs/migracoes.md` (subseção do lote 4 em `## 8.0.0`); anexo `plan-110-tokens-funcionais.md` §7.

**Tabela da medição — token → propriedade, antes → depois** (valor candidato; cena `chrome` lateral salvo se dito)
| Token | Propriedade (elemento): antes → depois |
|---|---|
| `mode` | `light` (com e sem tema carregado): só `d` do ícone do alternador (sol → lua) e `--sarak-mode`, `--sarak-vignette-color` .3 → 0; `body` segue `rgb(5,5,5)`. Com preferência `colorMode: light` + tema: `body` → `rgb(249,250,250)`; `mode: light` + preferência `dark` → escuro |
| `navigationStyle` | `topbar` (`navigationStyle="auto"`): `aside` e 150 elementos deixam de existir, `header` surge, `[conteudo]` 944 → 1216 px; com preferência `sidebar` o resultado é igual ao da base (a preferência vence) |
| `mobileNavigationStyle` | 390 px, 7 itens: `bottom` cria `nav` fixa (37 elementos), `main` 736 → 668,5 px; 4 itens: `drawer` remove a barra da base, `main` 668,5 → 736 px |
| `bodySize` | `20px`: `font-size` (`html`) 14px → 20px, `line-height` 21 → 30px, bloco da marca 75,4 → 94 px; com preferência `sm`: 12 → 18 px |
| `identityAlignment` | `center`/`right`: `justify-content` (bloco da marca, lateral e topo) flex-start → center / flex-end |
| `identityPadding` | `24`: `padding-block` (bloco da marca) 16 → 24px, altura 85 → 101px |
| `identityFontFamily` | `'Playfair Display', serif`: `font-family` (nome da marca) Inter → "Playfair Display", serif |
| `identityFontWeight` | `300`: `font-weight` 700 → 300 |
| `identityTracking` | `4`: `letter-spacing` normal → 4px, largura do bloco 125,5 → 145,5 px |
| `identityHoverEffect` | em hover: `none` `opacity` 0.7 → 1; `glow` `filter` none → drop-shadow(… 0 0 8px); `scale` `transform` none → scale(1.04) |
| `layoutDensity` | `compact`/`spacious`: `padding-block` (`main`) 32 → 24 / 40px |
| `maxContentWidth` | `1000px`: `max-width` (`main`) 1440 → 1000px, `margin-inline` 0 → 4px |
| `layoutPadding` | `5` e `{5,5,5}`: `padding` (`main`) 32 → 5px |
| `isSplitViewEnabled` | `true`: surgem 4 elementos (grade do painel secundário) em `main` |
| `isAutoHideEnabled` | `true`: `aside` e 151 elementos somem no primeiro quadro, `main` 1008 → 1280 px |
| `borderRadius` | `30`: `border-*-radius` (`SarakAccordion`) 12 → 30px; `2` → 2px; `0`: só a variável (o acordeão trata 0 como ausente) |
| `borderWidth` | `4`: `border-inline-start-width` (feed de atividade) 1 → 4px; `width` (divisória do painel dividido) 1 → 4px |
| `borderStyle` | `dashed`: `border-*-style` (`aside`, divisória do painel dividido, 217 propriedades) solid → dashed |
| `layoutGap` | `60` (cena estrutural): `column-gap`/`row-gap` (`SarakFlex`) 24 → 60px |
| `layoutGapSm` | `40`: `height` (campo de busca do cromo) 30,4 → 44,4px, `bottom` 13 → 6px (346 mudanças) |
| `layoutGapMd` | `40`: `column-gap` (grupos do cromo) 6 → 10px, `padding-block` (`nav`) 24 → 40px |
| `layoutGapLg` | `60`: altura da página (cena `main`) 2574 → 2694 px, posição do orbe do estado vazio −7,75 → 16,25px |
| `iconFamily` | `lucide`/`tabler`: 18–24 elementos de ícone refeitos; `fill` rgb(0,242,255) → none, `stroke` none → cor, `stroke-linecap` butt → round |
| `iconWeight` | `bold`: Phosphor `path d` do ícone refeito; Tabler `stroke-width` 2,5 → 2px |
| `iconStrokeWidth` | `0.5`/`3`: `stroke-width` (ícone Lucide) 3 → 1,5 / 4,5px; Tabler 2,5 → 1,25 / 3,75px; Phosphor só a variável |
| `isNavHidden` | `true`: lateral `width` 240 → 200px (piso), 76 elementos some (rótulos), bloco da marca 75 → 53px; topo `height` 64 → 40px, logo 68 → 32px |
| `sidebarPosition` | `right`: `flex-direction` (corpo) row → row-reverse, borda do `aside` passa do lado direito para o esquerdo; `floating`: `border-radius` 0 → 12px nos 4 cantos e margem |
| `sidebarWidth` | `300` e `{300,300,300}`: `width` (`aside`) 240 → 300px |
| `shellBrandLogoSize` | `48` (com logo): altura do bloco da marca 85 → 101px |
| `sidebarLabelMaxWidth` | `60`: `max-width` (nome da marca) 120 → 60px |
| `sidebarMinWidth` | `300`: `min-width` (`aside`) 200 → 300px |
| `sidebarMaxWidth` | `260`: `max-width` (`aside`) 450 → 260px |
| `sidebarColor` | `#ff0000`: `background-color` (`aside`) rgb(0,0,0) → rgb(255,0,0) |
| `sidebarHoverColor` | `#ff0000`, hover no 2º item: `background-color` rgba(255,255,255,.06) → rgb(255,0,0) |
| `sidebarActiveColor` | `#ff0000`: `background-color` (item ativo) transparente → rgb(255,0,0) |
| `sidebarNoiseOpacity` | `0.5`: `opacity` (camada de grão do `aside`) 0 → 0.5 |
| `sidebarBlur` | `40`: `backdrop-filter` (`aside`) blur(10px) → blur(40px) |
| `sidebarShadow` | `10px 0 30px rgba(255,0,0,1)`: `box-shadow` (`aside`) rgba(0,0,0,.5) → rgb(255,0,0) |
| `navItemActiveColor` | `#ff0000`: `border-*-color`, texto e ícone do item ativo rgb(0,242,255) → rgb(255,0,0) |
| `navActiveMarkerColor` | `#ff0000`: `background-color` e `box-shadow` (marcador) rgb(0,242,255) → rgb(255,0,0) |
| `navActiveMarkerGlow` | `0`/`40`: `box-shadow` (marcador) 0 0 10px → 0 0 0 / 0 0 40px |
| `tabGap` | `23`: `column-gap`/`row-gap` (lista de itens) 4 → 11,5px, altura 154 → 176,5px |
| `tabSectionMargin` | `23`: `margin-block` (`aside`) 16 → 23px |
| `searchPositionSidebar` | `bottom`: `padding-block` (bloco da busca) 0/7 → 7/0px |
| `chromeSearchPosition` | `menu`/`off`: o campo de busca da lateral deixa de existir (68/67 elementos) e o bloco muda de fundo/borda |
| `chromeUserPosition` | `menu`/`off`: 15/10 elementos do widget de usuário somem; `nav` 404,7 → 453,3 / 485,2px de altura |
| `chromeNotificationsPosition` | `menu`/`off`: 53/52 elementos do widget de notificações somem; `nav` 453,2 → 453,3 / 485,2px |
| `searchDropdownGap` | `2` (busca aberta): `margin-top` (paleta) 97 → 118px |
| `searchDropdownWidth` | `600`: `max-width`/`width` (paleta) 400 → 600px |
| `navbarLayout` | topo; `inline`: `position` (`header`) sticky → relative; `hidden`: `display` flex → none (1.371 mudanças) |
| `topbarHeight` | `100` e `{100,100,100}`: `height` (`header`) 64 → 100px |
| `topbarCollapsedHeight` | `24` com `isNavHidden`: `height` (`header`) 40 → 24px; sem `isNavHidden` só a variável |
| `brandLogoSizeCollapsed` | `32` com `isNavHidden` e logo: `width`/`height` (logo do topo) 52 → 64px |
| `topbarColor` | `#ff0000`: `background-color` (`header`) rgb(0,0,0) → rgb(255,0,0) |
| `topbarHoverColor` | `#ff0000`, hover: `background-color` (item) rgba(255,255,255,.06) → rgb(255,0,0) |
| `topbarActiveColor` | `#ff0000`: `background-color` (item ativo) transparente → rgb(255,0,0) |
| `topbarNoiseOpacity` | `0.5`: `opacity` (grão do `header`) 0 → 0.5 |
| `topbarTitleColor` | `#ff0000`: `color`/`border-color` (nome da marca no topo) rgb(255,255,255) → rgb(255,0,0) |
| `topbarLabelMaxWidth` | `60`: `max-width` (nome da marca no topo) 150 → 60px |
| `searchPositionTopbar` | `right`: busca vai para o grupo final (90 elementos refeitos, x 154 → 201px); `hidden`: 77 elementos somem; `center`: igual a `left` com itens (x 154), 170 × 158px sem itens |
| `preferenceModePosition` | `off`/`menu`: o alternador "Modo Claro" (5/10 elementos) sai da barra; `nav` 453,2 → 488,7 / 456,8px |
| `preferenceFontSizePosition` | `off`/`menu`: o seletor P/M/G (18/23 elementos) sai da barra; `nav` 453,2 → 522,2 / 490,3px |
| `preferenceNavigationStylePosition` | `off`/`menu`: o seletor Lateral/Topo (17/22 elementos) sai da barra; `nav` → 522,2 / 490,3px |
| `preferenceNavCollapsePosition` | `off`/`menu`: o botão "Recolher navegação" (3/8 elementos) sai da barra |
| `preferenceLanguagePosition` | `off`/`menu`: o seletor de idioma (8/13 elementos) sai da barra; `nav` 453,2 → 491,7 / 459,8px |
| `breakpointTablet` | `1100` com janela de 1000 px: o `aside` some e surge o `header` do celular (93 elementos); `500` com 600 px: o inverso |
| `breakpointDesktop` | `900` com 1000 px e `layoutPadding` `{5,10,50}`: padding passa de 10 para 50 px e `[conteudo]` 980 → 628 px; `1500` com 1280 px: 50 → 10 px |
| `layoutGridTemplate` | `col-12`: `grid-column` (item) auto → span 4, largura 312 → 416px; `masonry`: `display` grid → block, `column-count` auto → 3 |
| `layoutGridMinCell` | `160`/`480`: largura da célula 312 → 178,3 / 624px |
| `globalSectionGap` | `60`: `row-gap` (`SarakGrid`) 24 → 60px; `column-gap` (catálogo) 24 → 60px |
| `globalFlowDirection` | `row`: `flex-direction` (catálogo) column → row, `flex-wrap` nowrap → wrap |
| `globalFlowAlign` | `center`: `align-items` (catálogo) normal → center |
| `headerAlignment` | `center`/`start`: `justify-content` (cabeçalho da tabela) space-between → center / flex-start |
| `formLabelPosition` | `left`: `flex-direction` (`SarakFormGroup`) column → row, `align-items` normal → center, rótulo 1248 → 40,5px |
| `formFieldDensity` | `tight`/`relaxed`: `row-gap` (`SarakFormGroup`) 6 → 3 / 24px |
| `switchLabelPosition` | `left`: `flex-direction` (`SarakSwitch`) row → row-reverse; `space-between`: `justify-content` normal → space-between; `SarakCheckbox` e `SarakRadio` não mudam |
| `splitPaneMinWidth` | `300`: `min-width` (painel esquerdo) 100 → 300px |
| `contentAlignment` | **sem efeito** — ver Achados |
| `sidebarCollapsedWidth` | **sem efeito** — ver Achados |

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/{global,branding,system,icons,navigation,structural,preferences}.ts` | alterado | `kind`/`modeDependent`/`usage`/`interactsWith` em 77 tokens (`preferences.ts` por `buildPositionToken` + `POSITION_USAGE`); `description` de `mode` corrigida (nenhum `defaultValue`, opção ou leitor) |
| `gates/allowlists/tokenDocumentationPending.json` | alterado | −77 exceções do lote 4; `contentAlignment` e `sidebarCollapsedWidth` → `achado-lote-4` |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | linhas do mapa §6, estado do mapa, novo §6.8 |
| `.agents/skills/ui-integra-consumidor/SKILL.md` (= `.claude/skills/…`, symlink) | alterado | linhas do mapa e armadilhas |
| `docs/migracoes.md` | alterado | subseção do lote 4 em `## 8.0.0` |
| `specs/plan/anexos/plan-110-tokens-funcionais.md` | alterado | §7 (decisões e achados do lote 4) |
| `specs/plan/plan-110-temas-que-mostram-a-biblioteca.md` | alterado | este resumo e o `status` |

**Verificações executadas**
- `npm run token-docs:check` → "395 de 399 tokens documentados; 4 em exceção" (os 4 são os achados dos lotes 3 e 4; a lista de exceção dos lotes 1–4 fica sem nenhum token por documentar).
- `npm run verify -- --tier=schema-meta` → **3 verificações falham, as três por gerado defasado** (instrução do lote: eu não regenero): `token-types:check` (`design-token-docs.json` DEFASADO), o teste `generate-token-types.check.test.mjs` (o mesmo JSON; 1 falha em 89 s, o resto de `src/core/Design`, `Provider/utils`, `gates/scripts/contrato` e `scripts` passou) e `guide:check` (`sarak-ui/docs/migracoes.md` e `sarak-ui/skill/SKILL.md`). Passaram: `catalog:check`, `themes:catalog:check`, `audit:baseline`, `plan-index:check`, `dev-kit:check` e Anel 0 simulado (408 linhas, 0 achados).
- Não escrevi nem alterei teste; não rodei `guide`, `dev-kit`, `token-types` nem build; não rodei suíte completa, `tsc` nem Anel 1.

**Gerados que ficam defasados (para o revisor regenerar):** `src/core/Provider/generated/design-token-docs.json` (`npm run token-types`); `sarak-ui/docs/migracoes.md`, `sarak-ui/skill/SKILL.md`, o apêndice A.4b de `sarak-ui/GUIA-FRONTEND.md` e `sarak-ui/catalog.json` (`npm run guide`, depois do `token-types`); `sarak-dev/*` pode carimbar contagens (`dev-kit`).

**Critérios de aceite**
- [x] Cada token dos 6 grupos aberto no leitor e medido no navegador — evidência: tabela acima.
- [x] Token sem efeito tratado como achado, não como documentado — `contentAlignment` e `sidebarCollapsedWidth`.
- [x] `kind`/`modeDependent`/`usage` (e `interactsWith`) nos tokens com efeito — `token-docs:check` verde, 395/399.
- [x] Tokens de preferência medidos com a porta de preferências ligada onde ela vence o tema (`navigationStyle`, `bodySize`, `mode`) e pelo cromo onde a posição basta (`preference*Position`, `chrome*Position`).
- [x] Nenhum `defaultValue`, opção ou leitor alterado; nenhum tema tocado; nada do lote 4 da plan-117 tocado.
- [ ] `schema-meta` verde — pendente: três falhas por gerado defasado (acima).

**Decisões e suposições**
- Classificação pelo critério do anexo (§1). Dúvidas assumidas: `maxContentWidth`, `layoutPadding`, `layoutGap*`, `bodySize` e `formFieldDensity` → estético (densidade visual); `layoutGridTemplate`/`layoutGridMinCell`/`globalFlow*`/`formLabelPosition`/`switchLabelPosition`/`splitPaneMinWidth` → funcional (estrutura e posição dos controles, no precedente `buttonIconPosition` do lote 2); `searchDropdown*` → funcional (largura e posição do cromo). O revisor pode reclassificar.
- `mode` é estético e não carrega modo: é o eixo da contraparte, declarado por tema.
- Os 5 `preference*Position` ficam com `usage` num mapa dentro de `preferences.ts` porque o id é constante do módulo; o gate lê o valor avaliado, então basta.
- `searchPositionTopbar` e `iconWeight` documentados com o efeito parcial medido, não como achado (um valor muda a tela).

**Achados fora do escopo (não corrigidos)**
- **`contentAlignment` sem efeito**: `chromeStructuralStyles.ts:37` põe `max-w-7xl mx-auto w-full px-*` no mesmo elemento que recebe `maxWidth`, `marginInline`, `width` e `padding` em linha (`resolveChromeContentStyle`); o estilo em linha vence e nada muda (lateral e topo, com `maxContentWidth` 1000 px).
- **`sidebarCollapsedWidth` sem efeito**: `ChromeSidebarBody.tsx:107` lê o token, mas `min-width: var(--sidebar-min-width, 150px)` (`:111`) vence — a lateral recolhida mede 200 px (74 e 100) e 150 px com `sidebarMinWidth: 150`; o piso do contrato do `sidebarMinWidth` (150) é maior que o teto do token (100).
- **`borderRadius: 0` ignorado pelo acordeão**: `SarakAccordion.tsx` usa `(design?.borderRadius) || 'var(--sarak-card-radius,12px)'`, e 0 é falso: o raio fica em 12 px.
- **`switchLabelPosition` não alcança `SarakCheckbox` nem `SarakRadio`**, apesar de os dois lerem `useStructuralStyles` (`getCheckboxLayoutStyles`, `getRadioLayoutStyles`): nenhuma propriedade mudou nos dois.
- **`searchPositionTopbar: center`**: `mx-auto` (`ChromeTopbarBody.tsx:112`) não se distingue de `left` quando a navegação tem `flex-1` (o caso com itens).
- **Aviso de console da cena estrutural** ("Function components cannot be given refs"), presente em todas as variantes da cena `struct`; não identifiquei o componente (a cena monta `SarakSplitPane`, `SarakCatalogGrid`, `SarakCheckbox`, `SarakRadio` e outros).

**Pendências / riscos**
- `schema-meta` não fica verde sem `npm run token-types` e `npm run guide` (e `dev-kit`), todos do revisor.
- Os 77 `usage` foram escritos pela medição e pelo leitor; `modeDependent` seguiu a regra de opacidade/cor/sombra do anexo (1.1), sem medir no modo claro (nenhum tema tocado).
- `mobileNavigationStyle`, `breakpoint*` e `topbarHeight` foram medidos em janela de 390/600/1000/1280 px sem toque simulado (`pointer: coarse`).
- Como este é o último lote de análise, o mapa "o que a lib já faz" ainda tem linhas ⏳ (i18n da lib, persistência do tema, modo embarcado, painel, tema derivado da marca, calendário/Gantt/Kanban); o lote 25 consolida.

## Veredito — 2026-10-17 — lote 4 — 🟢 Aprovado; a análise dos 399 tokens está concluída

**Conferido:** 79 tokens dos seis grupos medidos em Chromium 153 (tabela por token no resumo; preferências do usuário
medidas com a porta `useSarakPreferences().updatePreferences` onde ela vence o tema, e pelo cromo onde a posição basta);
77 documentados e 2 achados (`contentAlignment`, `sidebarCollapsedWidth`). O diff dos schemas é só metadado (274
acréscimos, 1 remoção: a `description` de `mode`, corrigida); `buildPositionToken` ganhou `usage` por um mapa sem mudar
comportamento; nenhum `defaultValue`, opção ou leitor tocado; nada do lote 4 da `plan-117` mexido. Regenerei
`token-types`, `guide`, `dev-kit` e `plan-index`; **`schema-meta` verde** (`token-docs:check` **395 de 399**, os 4 em
exceção são os achados dos lotes 3 e 4; vitest; baseline; kits; Anel 0: 1.553 linhas, 0 achados). Conferi no código dois
achados: `chromeStructuralStyles.ts:37` e a faixa mínima de `ChromeSidebarBody.tsx:111` (`min-width` vence a largura do
recolhido).

**Pendências do arsenal achadas neste lote → registro da `plan-117` (P16 a P21, lote 5 dela):** `contentAlignment` e
`sidebarCollapsedWidth` (sem efeito), `borderRadius: 0` ignorado pelo acordeão, `switchLabelPosition` que não alcança
`SarakCheckbox` e `SarakRadio`, `searchPositionTopbar: center` indistinguível de `left`, e o aviso "Function components
cannot be given refs" da cena estrutural.

**Lotes 1 a 4 fechados.** A análise de tokens está completa (399 classificados e medidos). **O lote 5 só começa depois que
a `plan-117` fechar os lotes 4 e 5 dela:** ele revisa o `defaultValue` dos tokens funcionais e cria a trava de completude, e
os tokens que a `plan-117` ligar ou retirar mudam o conjunto sobre o qual a trava e os padrões são calculados.

**Status: 🔴 A executar (lote 5, depois da `plan-117`).**

## Resumo da execução — lote 5 — 2026-10-17

**Resultado:** Concluído com pendências (gerados defasados para o revisor regenerar; a vitrine foi medida a partir de `src/`, não do `dist/`).

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- **5.1** Revi os 98 tokens funcionais (padrão × leitor × os outros padrões; navegador onde o risco é de tela). **Uma mudança:** `topbarCollapsedHeight` 40 → 48 (`schema/navigation.ts`), com o motivo e a medição no anexo `plan-110-tokens-funcionais.md` §10. A reserva `var(--sarak-topbar-collapsed-height, 40px)` virou 48px em `ChromeTopbarBody.tsx:101` pela ferramenta (`fix-fallbacks.ts --write`); o `usage` do token ganhou a razão. Os demais ficam, cada família com o porquê (§10.2). Nenhum estético mudou.
- **5.2** `showcase-entry.tsx`: formulário com erro, selos de status com forma, gráfico, calendário, estado vazio e chat (cada um em `data-showcase`), mais a cena `?cena=modal`. `generate-showcase.mts`: eixos modo × dispositivo (desktop 1440×960; celular 390×844 com toque real) × cena (`telas`, `modal`), `--tema=` e `--dispositivos=`, e a janela cresce até o fim do contêiner que rola (antes `fullPage` só mostrava a primeira tela).
- **5.3** Trava de completude `theme-completeness:check`: `helpers/theme-completeness-core.ts`, `check-theme-completeness.ts`, `gates/allowlists/themeCompletenessPending.json` (os 14 temas, com o lote em que saem: 6 a 19), teste do gate. Ligada em `package.json`, `.githooks/pre-commit` (Anel 1) e `.github/workflows/gates.yml` (o título do passo passou de 15 para 16 `*:check`).
- Nota MAJOR em `docs/migracoes.md` (`## 8.0.0`). Dois snapshots atualizados só na variável nova (40px → 48px).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/navigation.ts` | alterado | `topbarCollapsedHeight` padrão 48 e `usage` |
| `src/components/Layout/chrome/ChromeTopbarBody.tsx` | alterado | reserva 48px |
| `...PreviewCanvas.test.tsx.snap`, `...PresetCard.test.tsx.snap` | alterado | 40px → 48px (16 + 1 ocorrências) |
| `gates/scripts/contrato/check-theme-completeness.ts`, `helpers/theme-completeness-core.ts` | criado | a trava e seu núcleo puro |
| `gates/scripts/contrato/__tests__/check-theme-completeness.test.ts` | criado | casos plantados, tema sintético completo e 3 mutações |
| `gates/allowlists/themeCompletenessPending.json` | criado | os 14 temas |
| `package.json`, `.githooks/pre-commit`, `.github/workflows/gates.yml` | alterado | script, Anel 1 e CI |
| `browser-tests/fixtures/showcase-entry.tsx`, `browser-tests/generate-showcase.mts` | alterado | a vitrine estendida |
| `docs/migracoes.md`, `specs/plan/anexos/plan-110-tokens-funcionais.md` | alterado | nota MAJOR; §10 do anexo |

**Verificações executadas**
- `npx vitest run gates/scripts/contrato/__tests__/check-theme-completeness.test.ts` → 15/15 (+ `check-gate-limits` 4/4).
- **Gate (8.1), entrada → resultado:** estético ausente no principal → `missing-aesthetic`; ausente na contraparte → `missing-mode-aesthetic`; sem contraparte → `contraparte-missing`; funcional no tema / na contraparte → `declares-functional` / `contraparte-declares-functional`; estético fixo na contraparte → `contraparte-declares-fixed-aesthetic`; exceção de tema completo ou inexistente → `staleExceptions`; passam: tema completo, `mode` na contraparte, `enabledLanguages`, `0`/`false`/`null`/`''` como declarados, tema em exceção e um tema sintético completo derivado do dicionário real. Mutação no dicionário real: sem `cardBorderRadius` no principal, sem `cardBackgroundColor` na contraparte, com `sidebarWidth` no tema — cada uma derruba só o gate esperado. Hoje: 0 de 14 completos, 14 em exceção; medido: 79 a 94 estéticos faltando no principal, 47 a 59 na contraparte e 17 a 20 funcionais declarados por tema; contraparte com estético fixo: 0.
- Chromium 153 (`PLAYWRIGHT_BROWSERS_PATH` absoluto, `chromium.launch()` sem `executablePath`), build de `src/` e CSS por Tailwind em scratchpad, fora do repositório: barra recolhida 40 × 48 × 56 com mouse (1200 px) e toque (1024 px); grade, modal e rolagem horizontal a 320/360/390 px; vitrine do `sarak-sovereign`: 10 capturas, 0 falha, imagens abertas (desktop escuro, celular claro com modal).
- `npm run verify -- --tier=quick` → `tsc` ok, `audit:baseline --with-tsc` ok, 22 `*:check` do Anel 1 ok, Anel 0 simulado 0 achado. Falharam: `token-types:check` e `guide:check` (gerados defasados, abaixo), `dev-kit:check` (idem) e `check-trail-citation` — este eu corrigi depois (comentário do gate citava o anexo) e reexecutei: verde.
- Vitest (pastas `features/DesignEngine`, `Layout`, `core/Design`, `core/Provider`): só os 2 snapshots falharam, e foram atualizados.

**Critérios de aceite**
- [x] Padrões funcionais revisados, cada mudança com motivo — anexo §10.
- [x] Reservas acompanham — `variable-contract:check` verde.
- [x] Vitrine estendida e medida em navegador, dois modos, desktop e celular — 10 capturas.
- [x] Trava de completude com limites (R18, no cabeçalho), mutação e lista de exceção por tema — teste do gate.
- [ ] Vitrine pelo `npm run themes:showcase` (lê `dist/`) — não rodei (sem build); o gerador foi exercitado numa cópia que só troca o harness por um build de `src/`.

**Decisões e suposições**
- Só um padrão funcional mudou: os demais não tinham defeito medido ou lido; não troquei padrão por gosto (e §4.4.3 da `09`: padrão não conserta valor ruim oferecido).
- Contraparte com estético que não carrega modo é falha da mesma regra (§6 da plan: "troca só o que carrega modo"); `mode` é a única exceção. Hoje nenhum tema o faz.
- Valor da lista de exceção = lote em que o tema sai, na ordem do anexo de direção (sovereign 6; cyberpunk-neon 7 … aurora-veil 19). Não é conferido.
- Não alterei `scripts/verify-changes.mjs` (é do revisor, fora da §3.1): a trava não está no `ANEL1` nem no nível `themes` dele.
- Calendário da vitrine marca o dia de hoje (comportamento do componente); o resto é dado fixo.

**Achados fora do escopo (não corrigidos)**
- Anexo §10.3: faixa de `topbarCollapsedHeight` (24–56) abaixo do alvo de toque; `focusRingWidth` aceita 0; faixas de `zIndexSidebar` e `zIndexModal` se tocam; temas declaram funcionais que divergem do padrão.

**Pendências / riscos**
- **Gerados defasados (revisor regenera):** `src/core/Provider/generated/design-token-docs.json` (`npm run token-types`, o `usage` mudou); `sarak-ui/docs/migracoes.md` e o que o `guide` carimba; `sarak-dev/*` (`dev-kit`). Não rodei guide, dev-kit, token-types nem build.
- A vitrine por `dist/` e o `cromo-css-real` dependem do build do revisor; a mudança de 48 px não altera o `cromo-css-real.spec.ts` (compara recolhida ≠ expandida).
- Mudança de padrão classifica o diff como `full` no `verify-changes`.

## Veredito — 2026-10-17 — lote 5 — 🟢 Aprovado

**Conferido:**
- **5.1** — os 98 tokens funcionais foram revistos; **uma** mudança, `topbarCollapsedHeight` 40 → 48 (`schema/navigation.ts`), com
  motivo e medição no anexo §10; a reserva do `ChromeTopbarBody` acompanhou pela ferramenta do `variable-contract`;
  nenhum estético mudou; dois snapshots atualizados só na variável nova.
- **5.2** — a vitrine passou a montar as telas que a plan lista: cromo com navegação, formulário com erro, selos com forma,
  tabela, cartões, gráfico, calendário, estado vazio, chat e a cena do modal, em modo × dispositivo (desktop 1440 e celular
  390 com toque). **Abri eu mesmo** `sarak-sovereign__dark__sidebar__desktop__telas.png` e
  `sarak-sovereign__light__sidebar__mobile__telas.png`, geradas pelo `npm run themes:showcase` contra o `dist/`
  reconstruído: 10 capturas, 0 falha, todas as telas presentes e legíveis (no celular, navegação de base e tabela em cartões).
- **5.3** — `theme-completeness:check`: uma regra só, limites declarados (R18), casos plantados, três mutações no dicionário
  real e a lista de exceção por tema (`themeCompletenessPending.json`, os 14 temas, com o lote em que saem); ligada ao
  `package.json`, ao pre-commit e à CI. Roda no repositório: "0 de 14 temas completos; 14 em exceção", o estado esperado.

**Verificação (nível `full`, uma vez):** regenerei `token-types` (398), `guide`, `dev-kit` e `plan-index`; `npm run build`
real verde; **`verify --tier=full` verde** (`tsc`, suíte completa, baseline com `tsc`, Anel 1, R36, Anel 0: 771 linhas, 0
achados); bateria completa do navegador contra o `dist/`: **376/376**.

**Achados do executor fora do escopo (§10.3 do anexo):**
- faixa de `topbarCollapsedHeight` (24–56) abaixo do alvo de toque;
- `focusRingWidth` aceita 0;
- faixas de `zIndexSidebar` e `zIndexModal` que se tocam.
Vão ao `00-backlog` (item 39): são decisões de contrato de faixa, não token que não desenha. O quarto ("temas declaram
funcionais que divergem do padrão") é o próprio trabalho dos lotes 6 a 24: a trava acusa `declares-functional` e cada tema
sai da exceção ao ficar completo.

**Dois itens do revisor, fora do lote:** o `scripts/verify-changes.mjs` não tem o `theme-completeness:check` no nível `themes`
nem no Anel 1 (o executor não podia tocá-lo) — vira prompt direto separado; a **fotografia** do lote 6 (a seguir) inclui a
mudança de todos os `defaultValue` estéticos para os do `sarak-sovereign`.

**Lote 5 fechado.** Próximo: lote 6 (o `sarak-sovereign` refeito, os padrões estéticos e o teto de peso por tema).

**Status: 🟡 Em execução (lote 6 despachado).**
