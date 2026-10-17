---
tipo: "plan"
titulo: "Elevar o conjunto de temas embarcados ao padrao que a biblioteca entrega, e ensinar o importador a extrair isso"
objetivo: "Fazer os temas embarcados da lib, os 14 atuais refeitos e 5 novos, mostrarem do comeco ao fim o que o Design Engine sabe fazer, cada um com todo token estetico projetado nos dois modos, com direcao de arte de conjunto, valores padrao dos tokens redefinidos a partir do tema padrao, legiveis nos dois modos, provados por medicao e por vitrine aprovada pelo dono, e a documentacao de criar tema enriquecida"
dominio: "Design Engine / Temas embarcados / Design e UX"
status: "🔴 A executar"
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

## Resumo da execução — lote 0 — 2026-10-11

**Resultado:** Concluído (lote 0). **Parado para a aprovação do dono**, como manda a §5 passo 3. O lote 1 não foi
iniciado.

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
?? specs/plan/plan-110-temas-que-mostram-a-biblioteca.md
```

**O que foi feito**
- Criei `specs/plan/anexos/plan-110-direcao-de-arte.md`, o anexo de direção de arte da §5 passo 2, com os itens
  (a) a (e). O mapa do conjunto está na §5, as 19 fichas na §7, as 5 direções novas e os ids na §8 e o teto de peso
  na §4.4. Ele traz ainda a auditoria dos 14 (§1), o arsenal que desenha e o que não desenha (§3), as decisões D1 a
  D7 que cabem ao dono (§0) e os achados fora do escopo (§9).
- Toda medição foi feita por script de **leitura** fora do repositório (no scratchpad da sessão), sobre
  `SARAK_GLOBAL_THEMES`, `MASTER_DESIGN_MAP`, as partições do catálogo, `src/styles/` e o `dist/`. O método está
  escrito no anexo (§4.1, §3), para o revisor reproduzir.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/anexos/plan-110-direcao-de-arte.md` | criado | o anexo de direção de arte do lote 0 |
| `specs/plan/plan-110-temas-que-mostram-a-biblioteca.md` | alterado | este resumo e o `status` |

**Verificações executadas**
- Contagem sobre `SARAK_GLOBAL_THEMES`: 439 tokens; 256 a 268 por tema; 169 que nenhum tema define; 11 com o mesmo
  valor nos 14. São os números da §2 desta plan, e eles conferem. Há **22** tokens com `visualImpact`;
  `mobileNavigationStyle` está definido em 0 de 14 temas e `texture` em 12 de 14.
- Peso (`esbuild` com bundle, minify e ESM, mais `gzip -9`): `SARAK_GLOBAL_THEMES` dá 106,5 KB minificado e
  **14,1 KB gzip**; cada tema, 2,3 a 2,8 KB gzip. O boot do `dist/` (`index.js` mais 9 chunks estáticos) soma
  **209,2 KB gzip**, então os temas são **6,8%** do boot. Os temas estão em `dist/chunk-SF4ILM6Z.js`, um dos chunks
  estáticos. O `dist/` foi gerado sobre `29dfb52`, e `git diff --stat 29dfb52 HEAD -- src/core/Design/presets/themes`
  saiu vazio.
- Projeção para 19 temas com os 440 tokens: **21,8 KB gzip**. Os 14 atuais no mesmo formato dão 14,4 KB, o que bate
  com os 14,1 KB do bundle.
- `npm run themes:diversity` (o quadro atual): 9 de 14 temas escuros; 9 de 14 com primária S=100; 4 de 14 na
  família ciano+magenta; 2 com fundo de luminosidade média.
- Distância par a par sobre 10 eixos (script): **hoje, 3** (2 pares); **na proposta, 5**. Triplas textura + botão +
  título repetidas: 2 hoje, 0 na proposta. Na proposta há 16 texturas de cartão, 15 fontes, Phosphor com 6 pesos e
  Lucide e Tabler com 4 cada, os 6 estilos de botão e as 5 transições.
- Contrato dos tokens citados nas fichas conferido no schema: `chartThickness` tem passo 1; `iconStrokeWidth` tem
  passo 0,5; `borderStyle: dashed`, `inputBorderType: underline`, `sidebarPosition: right/floating` e
  `contentAlignment: center` existem. Corrigi no anexo os valores fora do passo antes de entregar.
- Busca de consumidor de token, pelo id e pelas `cssVars` em `src/`, fora de schema, presets, catálogo, gerados e
  testes. Resultado no anexo §3.2 e achados A1 a A5.
- Padrões de segredo de `gates/scripts/segredo/config.json` aplicados ao anexo e à plan: 0 achados.
- **Não rodei** suíte, `tsc`, `audit` nem build: o lote 0 não toca código.

**Critérios de aceite**
- [ ] Anexo de direção de arte aprovado pelo dono antes do lote 1 — **pendente: é a parada deste lote**. O anexo
  está entregue, e as decisões estão em §0 (D1 a D7).
- Os demais critérios da §6 são dos lotes 1 a 3, que não foram iniciados.

**Decisões e suposições**
- As cores das fichas são **âncoras**: o solucionador de contraste ajusta só a luminosidade do texto no lote 1. A
  aprovação pedida é da direção (matiz, saturação, recurso, estrutura), não do hex final.
- Propus trocar o modo nativo de dois temas existentes (`neo-brutalism` e `cyber-retro-wave`, ambos para claro) e
  reconceituar `cyber-retro-wave` como Y2K cromado e `data-terminal` como caderno de laboratório. Os ids são
  mantidos. Isso fica para o dono decidir (D2), porque muda a cara de um id que o consumidor pode ter salvo.
- Troquei duas coisas do ponto de partida do revisor para o "orgânico": a cor de marca é musgo, não terracota, e a
  textura de cartão é `wood`, não `stucco`. As razões (critério 6 do medidor e textura de branco fixo) estão no
  anexo §8.
- Li o critério "3 famílias de ícone com pelo menos 4 pesos" do teste (b) como ≥4 pesos no conjunto. A proposta
  cumpre também a leitura mais forte, ≥4 por família.
- Os temas não declaram posição de preferência nem de composição da barra: chave ausente vale o padrão de fábrica
  (`09` §4.7; `06` §2.1.1).

**Achados fora do escopo (não corrigidos)** — detalhados no anexo §9, de A1 a A11:
- `src/core/Design/schema/atmosphere.ts:96-120` — `bgGradientMode`/`bgGradientAngle` não têm consumidor. O
  critério "os 4 modos de gradiente" do teste (b) cobra variedade de um token que não desenha (D6).
- `src/core/Provider/manifest.ts:126` × `src/styles/_surfaces.css` — nenhuma opção de `surfaceMaterial` (marcado
  `visualImpact`) tem regra CSS. Defeito da mesma classe em `shadowColorMode`, `systemTone` (só `cyber` desenha) e
  `switchStyleType`; `--sarak-noise-opacity` é emitido e ninguém o lê.
- `src/core/Provider/hooks/useSarakUIEffects.ts` — `Orbitron`, `Chakra Petch`, `VT323` e `Fira Code`, usadas por
  temas de hoje, não são carregadas: na tela, cai a fonte de reserva.
- `src/styles/_atmosphere.css` — seis texturas desenham em branco fixo e somem em superfície clara.
- `src/components/engines/charts/SubEngines/builders/types.ts:20-23` — as cores de status entram como séries 4 a 7
  do gráfico, contra a regra da `dataviz`.
- `src/styles/_cards.css:24-26` — a sombra de cartão tem geometria fixa, e por isso o brutalismo não alcança sombra
  dura.
- **Divergência entre a plan e o código, §5 passo 5:** a vitrine já existe (`npm run themes:showcase` →
  `browser-tests/generate-showcase.mts`). O lote 3 seria estender a cena, não escrevê-la.

**Pendências / riscos**
- O lote 1 depende de D1 a D7.
- `organic-clay` tem fundo de luminosidade média (é o que satisfaz o critério 2 do medidor). Ali, o texto
  secundário e o mudo têm pouca margem de contraste, e a saída declarada é subir o fundo para L≈70.
- `high-contrast` mira 7:1, mas o gate mede 4,5. A razão por par será relatada no lote 1, à mão.


## Resumo da execução — lote 1 — 2026-10-14

**Resultado:** Concluído com pendências (ver *Pendências / riscos*: os 23 tokens do painel foram abertos pelo leitor, não confirmados em navegador).

**Estado do worktree ao iniciar**
```
M  browser-tests/fixtures/showcase-entry.tsx
M  browser-tests/generate-showcase.mts
MM specs/00-indice.md
MM specs/plan/plan-110-temas-que-mostram-a-biblioteca.md
M  src/features/DesignEngine/Main/TemplatesTab.tsx
M  src/features/DesignEngine/Main/__tests__/TemplatesTab.test.tsx
```
(O pré-requisito 0.1 foi commitado pelo dono durante a execução, `67bdb283`; depois disso o worktree só tinha `specs/00-indice.md` e esta plan modificados, e nenhum deles foi tocado por mim além do bloco abaixo e do `status`.)

**O que foi feito**

*Infraestrutura*
- `src/core/Design/types.ts` — o tipo do token ganha `kind` (`aesthetic` | `functional`), `modeDependent`, `usage` e `interactsWith`, opcionais (R33: obrigatório no tipo quebraria o tema de consumidor; a obrigatoriedade é do gate).
- `scripts/generate-token-types.ts` — além de `design-token-ids.ts`, gera `src/core/Provider/generated/design-token-docs.json` (id, pilar, rótulo e os quatro campos); o `--check` (que roda no `build`) compara os dois arquivos byte a byte. É a fonte única que o kit lê: o coletor do kit é Node puro e não importa TS.
- `scripts/consumer-kit/collectKitSources.mjs`, `buildKitCatalog.mjs`, `renderAppendix.mjs` — o `catalog.json` do kit traz os campos em `designTokens.ids[]` e `designTokens.groups`; o apêndice do guia ganha **A.4b — Mapa dos tokens por pilar** (uma tabela por pilar: natureza, modo, o que muda, depende de), só com o que o schema documentou.
- **Gate de documentação de token** — `gates/scripts/contrato/check-token-documentation.ts` (+ núcleo puro em `helpers/token-documentation-core.ts`), `npm run token-docs:check`, no `build` (depois do `token-types:check`), no Anel 1 (`.githooks/pre-commit`) e na CI (`gates.yml`, que passa de 13 para 14 `*:check`). Confere forma: `kind` válido, `modeDependent` booleano, `usage` de 25 a 420 caracteres e diferente do rótulo, `interactsWith` só com ids do schema e sem citar o próprio token. Exceção por token em `gates/allowlists/tokenDocumentationPending.json` (`{ id: lote }`), que **se esvazia**: entrada de token já documentado ou inexistente também bloqueia. Limites R18 declarados no cabeçalho.
- Teste do gate com **mutação** (`gates/scripts/contrato/__tests__/check-token-documentation.test.ts`): remover o `usage` e remover o `kind` de um token documentado do schema real derrubam o gate.
- Mapa **"o que a lib já faz — não recrie"**: `sarak-ui/GUIA-FRONTEND.md` §6 (nova linha na árvore §0.1) e seção equivalente em `.agents/skills/ui-integra-consumidor/SKILL.md`, preenchidos para cartões, sobreposições e tabelas; as demais necessidades ficam marcadas ⏳.
- `docs/migracoes.md` — subseção em `## 8.0.0` (aditiva, MINOR dentro da MAJOR).
- `specs/plan/anexos/plan-110-tokens-funcionais.md` — o critério estético × funcional, o que carrega modo, as decisões não óbvias por token e os tokens sem efeito.

*Análise dos tokens (120 dos seis grupos)* — método: leitor no código; efeito em navegador por **diferença de estilo computado** (cena de `src/`, não do `dist/`, com um exemplar de cada componente; valor-padrão × valores extremos/opções, em repouso, sob o ponteiro, com foco e pressionado, com pseudoelementos). 144 variantes de 97 tokens na cena principal e nas sobreposições, 23 no painel; os que não mudaram nada foram reabertos à mão (tooltip, toast, placeholder, zoom da imagem, brilho no hover). Resultado: **113 documentados** (78 estéticos, 35 funcionais, 29 carregam modo) e **7 sem efeito visível** (achados; ficam na lista de exceção com o rótulo `achado-lote-1`).

Lista (id → natureza, modo):
- `cards` (75): cardBorderRadius → estético, sem modo; cardRadiusTL → estético, sem modo; cardRadiusTR → estético, sem modo; cardRadiusBL → estético, sem modo; cardRadiusBR → estético, sem modo; cardGeometricCut → estético, sem modo; cardBackdropBlur → estético, sem modo; cardSurfaceOpacity → estético, modo; cardBorderWidth → estético, sem modo; cardBorderOpacity → estético, modo; cardBorderTop → estético, sem modo; cardBorderBottom → estético, sem modo; cardBorderLeft → estético, sem modo; cardBorderRight → estético, sem modo; cardInnerGlowColor → estético, modo; cardInnerGlowWidth → estético, sem modo; cardTextureType → estético, sem modo; cardTextureOpacity → estético, modo; cardHeaderBg → estético, modo; cardHeaderBorder → estético, modo; cardHeaderPadding → estético, sem modo; cardFooterBg → estético, modo; cardFooterBorder → estético, modo; cardShadowSpread → estético, modo; cardShadowOffsetX → estético, sem modo; cardShadowOffsetY → estético, sem modo; cardShadowBlur → estético, sem modo; cardShadowExpansion → estético, sem modo; cardGlowColor → estético, modo; cardGlowIntensity → estético, modo; cardHoverTranslate → estético, sem modo; cardHoverGlowIncrease → estético, modo; cardSpotlightOpacity → SEM EFEITO VISÍVEL (achado); cardPaddingMd → estético, sem modo; cardLayoutDirection → estético, sem modo; cardImagePosition → estético, sem modo; cardTextAlign → estético, sem modo; cardContentAlignment → SEM EFEITO VISÍVEL (achado); cardShadow → estético, modo; borderBeamEnabled → SEM EFEITO VISÍVEL (achado); cardVariant → funcional, sem modo; imageCardOverlayOpacity → estético, modo; imageCardHoverZoom → SEM EFEITO VISÍVEL (achado); imageCardShadowOffsetY → estético, sem modo; imageCardShadowBlur → estético, sem modo; imageCardShadowSpread → estético, sem modo; imageCardGlowBlur → estético, sem modo; managementGroupListMaxHeight → funcional, sem modo; matrixNodeMinWidth → funcional, sem modo; catalogFilterMinWidth → funcional, sem modo; catalogSectionRadius → estético, sem modo; catalogItemRadius → estético, sem modo; presetCardHoverShadowOffsetY → funcional, sem modo; presetGlowShadowBlur → funcional, sem modo; presetGlowShadowBlurLg → funcional, sem modo; presetPreviewPaddingY → funcional, sem modo; presetMatteShadowBlur1 → funcional, sem modo; presetMatteShadowSpread1 → funcional, sem modo; presetMatteShadowOffsetY2 → funcional, sem modo; presetMatteShadowBlur2 → funcional, sem modo; presetMatteShadowSpread2 → funcional, sem modo; presetPreviewMinHeight → funcional, sem modo; presetMiniCardMaxWidth → funcional, sem modo; presetMiniCardHeight → funcional, sem modo; presetCardShadowOffsetY → funcional, sem modo; presetCardShadowBlur → funcional, sem modo; presetCardShadowSpread → funcional, sem modo; presetGridTextureSize → funcional, sem modo; controlHeightToggle → funcional, sem modo; progressBarMaxWidth → funcional, sem modo; devicePhoneHeight → funcional, sem modo; deviceTabletHeight → funcional, sem modo; devicePhoneNotchRadius → funcional, sem modo; deviceFrameRadius → funcional, sem modo; deviceDesktopMinWidth → funcional, sem modo
- `cardTitle` (6): cardTitleFontSize → estético, sem modo; cardTitleColor → estético, modo; cardTitleFontWeight → estético, sem modo; cardTitleLetterSpacing → estético, sem modo; cardTitleIconGlow → estético, modo; cardTitleIconGlowBlur → estético, sem modo
- `cardAction` (6): cardActionBtnPrimaryBg → estético, modo; cardActionBtnHoverBg → estético, modo; cardActionBtnText → estético, modo; cardActionBtnBorderRadius → estético, sem modo; cardActionBtnPadding → estético, sem modo; cardActionClickScale → SEM EFEITO VISÍVEL (achado)
- `cardSearch` (4): cardSearchBgFocus → estético, modo; cardSearchBorderBeamActive → SEM EFEITO VISÍVEL (achado); cardSearchPlaceholderColor → estético, modo; cardSearchTextFocusColor → estético, modo
- `overlays` (18): modalActionAlignment → estético, sem modo; modalHeaderStyle → estético, sem modo; modalOverlayColor → estético, modo; modalOverlayBlur → estético, sem modo; modalBorderRadius → estético, sem modo; modalWidthSm → funcional, sem modo; modalWidthMd → funcional, sem modo; modalWidthLg → funcional, sem modo; modalWidthXl → funcional, sem modo; modalWidthFull → funcional, sem modo; tooltipBg → estético, modo; tooltipRadius → estético, sem modo; tooltipTextColor → estético, modo; tooltipBorderColor → estético, modo; toastMinWidth → funcional, sem modo; toastMaxWidth → funcional, sem modo; toastAccentWidth → estético, sem modo; contextMenuMinWidth → funcional, sem modo
- `tables` (11): tableDensity → estético, sem modo; tableActionPosition → SEM EFEITO VISÍVEL (achado); tableHeaderBg → estético, modo; tableRowHoverBg → estético, modo; tableZebraStriping → estético, sem modo; tableBorderRadius → estético, sem modo; tableCellPadding → estético, sem modo; tableBorderColor → estético, modo; kanbanHeaderPaddingY → estético, sem modo; kanbanHeaderTracking → estético, sem modo; kanbanCardRadius → estético, sem modo

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/types.ts` | alterado | quatro campos opcionais no tipo do token |
| `src/core/Design/schema/{cards,card-title,card-action,card-search,overlays,tables}.ts` | alterado | `kind`, `modeDependent`, `usage`, `interactsWith` nos 113 tokens documentados (nenhum `defaultValue`, opção ou leitor mudou) |
| `scripts/generate-token-types.ts` | alterado | gera e confere `design-token-docs.json` |
| `src/core/Provider/generated/design-token-docs.json` | criado (gerado) | documentação por token, com o rótulo de cada pilar |
| `scripts/consumer-kit/{collectKitSources,buildKitCatalog,renderAppendix}.mjs` | alterado | campos no `catalog.json`; apêndice A.4b |
| `gates/scripts/contrato/check-token-documentation.ts`, `helpers/token-documentation-core.ts` | criado | o gate e o núcleo |
| `gates/scripts/contrato/__tests__/check-token-documentation.test.ts` | criado | casos plantados + mutação sobre o schema real |
| `gates/allowlists/tokenDocumentationPending.json` | criado | 289 exceções: 282 dos lotes 2–4 e 7 achados |
| `package.json`, `.githooks/pre-commit`, `.github/workflows/gates.yml` | alterado | `token-docs:check` no build, no Anel 1 e na CI |
| `scripts/__tests__/generate-token-types.check.test.mjs`, `scripts/consumer-kit/__tests__/kitGenerator.test.mjs` | alterado | deriva do JSON de documentação; campos no catálogo e A.4b |
| `sarak-ui/GUIA-FRONTEND.md`, `.agents/skills/ui-integra-consumidor/SKILL.md` | alterado | §6 "o que a lib já faz" e a seção equivalente na skill |
| `docs/migracoes.md` | alterado | subseção do lote em `## 8.0.0` |
| `specs/plan/anexos/plan-110-tokens-funcionais.md` | criado | critério e decisões |
| `sarak-ui/*` (`catalog.json`, `GUIA-FRONTEND.md`, `START-HERE.md`, `VERSION`, `skill/SKILL.md`, `docs/migracoes.md`), `sarak-dev/*` (`GUIA-MANUTENCAO.md`, `START-HERE.md`, `state.json`) | regenerados | `npm run guide` e `npm run dev-kit`, por último |

**Verificações executadas**
- `npx tsc --noEmit` → exit 0, nenhum erro (repetido depois do último conserto).
- `npx vitest run` (suíte completa, sozinha na árvore, repetida depois do último conserto) → **3464 de 3466 testes, 492 de 494 arquivos**. As 2 falhas são *timeout* de 5 s sob a carga da suíte inteira (1.624 s no total, com ~200 processos `node` de outras sessões na máquina): `gates/scripts/contrato/__tests__/check-theme-boot-closure.test.ts` ("a árvore real passa em src/", falhou também na 1ª passada) e `src/features/DesignEngine/hooks/__tests__/useDesignDraft.undoIntegration.test.tsx`. Isoladas, as duas passam (11 de 11). A 1ª passada tinha 3 falhas: `generate-token-types --check` (JSON gerado defasado por uma edição minha, **corrigida**), o mesmo `check-theme-boot-closure` e `PreviewCanvas.test.tsx` (passa isolada e passou na 3ª passada). Não toquei em nenhuma das rotas dos dois testes que estouram.
- Suítes novas e alteradas, isoladas: `check-token-documentation.test.ts` (inclui 2 casos de mutação), `kitGenerator.test.mjs`, `generate-token-types.check.test.mjs` → 29 de 29.
- `npm run audit:baseline -- --with-tsc` → "igual ao baseline de 2026-10-12 — nenhuma regressão".
- Anel 1 (`npm run`): `barrel:check`, `catalog:check`, `zero-brand:check`, `deep-import:check`, `gate-limits:check`, `container-query:check`, `container-query-boundary:check`, `persistence-doc:check`, `class-merge:check`, `icon-port:check`, `chrome-token-parity:check`, `token-reader:check`, `css-important:check`, `fixed-translucent:check`, `variable-contract:check`, `channel-dispute:check`, `panel-contract:check`, `token-types:check`, `token-docs:check` (novo), `themes:catalog:check`, `plan-index:check` → todos OK. **Por último:** `npm run guide` e `npm run dev-kit`, e depois `guide:check`, `dev-kit:check` e `kit-names:check` → OK.
- R36: `node gates/scripts/contrato/check-trail-citation.mjs` → "nenhuma linha adicionada cita plan, veredito ou achado de veredito".
- Anel 0 (simulado em Node, porque o Python do hook não existe nesta máquina): os 12 padrões de `gates/scripts/segredo/config.json` sobre as linhas adicionadas de `git diff HEAD` e sobre os arquivos não rastreados → 5.716 linhas, **0 achados**, 0 arquivos sensíveis novos.
- Gate de documentação, estado real: `npm run token-docs:check` → "113 de 402 tokens documentados; 289 em exceção". Para cada limite que o gate promete: entrada plantada e resultado no teste (`kind` ausente → `kind-missing`; `usage` ausente → `usage-missing`; `usage` de 6 caracteres → `usage-too-short`; 421 caracteres → `usage-too-long`; `usage` igual ao rótulo → `usage-repeats-label`; `interactsWith: ['naoExiste']` → `interacts-unknown`; `interactsWith` citando o próprio token → `interacts-unknown`; `interactsWith` como texto → `interacts-invalid`; exceção de token já documentado → `staleExceptions`; exceção de id inexistente → `staleExceptions`; token completo e token em exceção passam).
- Medição em navegador (cena montada de `src/`, fora do repositório, Chromium headless): 144 variantes dos 97 tokens fora do painel e 23 do painel; o que não mudou foi reaberto à mão (tooltip: `rgb(255,51,102)`/`12px`/`rgb(0,255,0)`/`rgb(0,0,255)` com os quatro tokens; toast: `min-width` 210 → 420 px, `max-width` 315 → 560 px, faixa 4 → 12 px; placeholder: `rgba(255,255,255,0.4)` → `rgb(255,51,102)`; zoom da imagem: `transform: none` nos três pontos testados com 1,05 e com 1,5).
- `git status` ao fim: só os arquivos da tabela acima; nada commitado, nada em `dist/`.

**Critérios de aceite** (do lote)
- [x] Campos no tipo, paridade com o JSON gerado (`token-types:check`) e derivação ao `catalog.json` e ao apêndice por pilar — evidência: `scripts/generate-token-types.ts`, `scripts/consumer-kit/renderAppendix.mjs`, teste `kitGenerator.test.mjs`.
- [x] Gate de documentação de token com exceção que se esvazia, limites R18 e mutação — `check-token-documentation.ts:1-34`, teste de mutação (2 casos).
- [x] Os seis grupos: cada token aberto no leitor e no navegador, ou declarado como achado — 113 + 7 = 120 (tabela acima).
- [x] Esqueleto do mapa no GUIA e na skill, preenchido para cartões, sobreposições e tabelas — `GUIA-FRONTEND.md` §6, `SKILL.md`.
- [x] O que o lote ensinou entra no kit — GUIA §6.1 a §6.4 e a skill (textura × cor × modo, vidro, divisória, sombra, recorte, alcance dos tokens de layout, dois componentes de tabela).
- [x] Nenhum token novo, opção nova, mudança de leitor ou de `defaultValue`; nenhum tema tocado — `git diff` dos schemas só acrescenta as quatro chaves.
- [ ] Os 23 tokens do painel confirmados em navegador — motivo: ver pendências.

**Decisões e suposições**
- **Paridade 1:1:1.** Li "gravados no schema, com a paridade 1:1:1" como: o schema é a única fonte dos campos, e o artefato derivado (JSON gerado → catálogo → apêndice) é conferido byte a byte. **Não** copiei `usage` para as partições do catálogo (`partitions/*.json`): seria uma segunda cópia da prosa à mão, o que a plan proíbe (R17). A comparação de valor do `verify_parity` (`catalog-drift`) segue em tipo e opções.
- **Gate, não teste.** O resultado tem de bloquear commit e `build`, e a lista de exceção é dado versionado que esvazia a cada lote — comportamento de gate (mesmo molde de `check-variable-contract`). O teste cobre o gate (mutação), não substitui.
- **Valores em inglês no tipo** (`aesthetic`/`functional`), rótulos em português só no kit (ADR-023).
- **Pilar = grupo do schema** (`cards`, `overlays`, …), com o `label` do `ComponentSchema`.
- **Tokens sem efeito visível ficam na lista de exceção** (não documentados), com o rótulo `achado-lote-1`. Isso mantém o gate verde sem fingir documentação, mas a lista só esvazia quando o revisor decidir (remover o token, ligar o leitor ou aceitar).
- `cardVariant` é **funcional**: escolhe qual cartão a grade desenha, e o tema o declara `classic`. `modalActionAlignment`/`modalHeaderStyle` são **estéticos** (disposição, não comportamento). Os `preset*`, `device*`, `controlHeightToggle` e `progressBarMaxWidth` são **funcionais** (só o painel os lê). Cada decisão com motivo no anexo.
- `cardImagePosition` foi documentado como **parcial** (só `direita` com direção em linha muda algo); `left`, `top` e `none` não mudam nada hoje. Não o tratei como "sem efeito" porque um valor muda a tela.
- `modeDependent`: cor, opacidade de superfície/borda/textura, força e cor da sombra e do brilho; geometria, tipografia, movimento e comportamento ficam no modo principal (regra do anexo §1.1).

**Achados fora do escopo (não corrigidos)**
- **Sete tokens sem efeito visível** (o motivo de cada um está no anexo §4): `cardSpotlightOpacity` (`SarakTitleCard.tsx:66-70` e irmãos escrevem `data-spotlight` e `.spotlight-effect`; nenhuma regra CSS os lê), `borderBeamEnabled` e `cardSearchBorderBeamActive` (`.border-beam-effect` sem regra; `_animations.css:21-30` declara `beam-rotate`/`--beam-angle` que ninguém usa), `cardActionClickScale` (`SarakActionCard.tsx:59`, variável calculada e não usada), `cardContentAlignment` (`useStructuralStyles.ts:100`, `getCardStyles` nunca chamado), `imageCardHoverZoom` (`SarakImageCard.tsx:66-77`: `whileHover` na camada da imagem, coberta pelo véu e pelo conteúdo; escala medida `none` ao passar o ponteiro em três pontos), `tableActionPosition` (`useTableLayoutStyles.ts:27-35`, classe calculada sem consumidor; a `SarakTable` não tem coluna de ação). O gate `token-reader:check` não os acusa porque o id aparece em componente — é o vão "textual" que o próprio gate declara (limite 2).
- `schema/cards.ts` — `cardVariant` tem `axis: 'texture'` (selecionar o cartão da grade não é textura).
- `useStructuralStyles.ts:100-127` — `getCardStyles` exportado e sem chamador, e o `structuralConsumer` de `cardImagePosition`/`cardContentAlignment` em `schema/cards.ts` o cita como leitor.

**Pendências / riscos**
- **Painel (23 tokens `preset*`, `device*`, `controlHeightToggle`, `progressBarMaxWidth`):** documentados pelo **leitor** (`src/features/DesignEngine/Canvas/...`) e classificados como funcionais. A diferença de estilo no painel inteiro, com cada um no valor extremo, não mostrou efeito mensurável (só ruído de nome de classe): o valor chega à pré-visualização por rascunho do painel, não pelo `config` do Provider, e eu não abri cada aba para dirigir o rascunho. **Não confirmei em navegador.** Se o revisor quiser, é a única parte do lote que pede uma conferência manual no painel.
- `build` e `cromo-css-real:check` **não rodados** (instrução do lote); `kit-names:check` leu o `dist/index.d.ts` que já existia.
- A suíte completa teve **3 falhas na primeira passada** (`generate-token-types --check` por JSON gerado defasado por uma edição minha de `usage` depois da geração; `check-theme-boot-closure` por *timeout* de 5 s sob carga; `PreviewCanvas.test.tsx`, que passa isolada e passou na segunda passada). Corrigi a causa da primeira e repeti a suíte inteira depois do último conserto.
- Os 282 tokens dos lotes 2–4 estão na lista de exceção do gate; ela só esvazia com esses lotes.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Conferência do lote 0 — 2026-10-11 — aprovado pelo dono, lote 1 em espera

**Conferido pelo revisor:** o anexo inteiro (mapa do conjunto, 19 fichas, teto de peso, achados); por amostragem no código, os achados A1 (nada lê `--sarak-bg-gradient-*`), A2 (o CSS desenha `metallic`/`brushed`/`acrylic`/`matte`, que não são opções de `surfaceMaterial`), A6 (Orbitron, Chakra Petch, VT323 e Fira Code fora do carregador de fontes) e a vitrine existente (`npm run themes:showcase`) — o passo 5 da §5 foi corrigido para estender a vitrine.

**Decisões do dono (2026-10-11):** D1 a D7 **aprovadas** como o anexo recomenda. **Regra reforçada:** todo tema tem claro e escuro e o modo oposto preserva a identidade (critério novo na §6). **Os achados A1–A10 do anexo serão corrigidos antes do lote 1**, numa plan própria; o lote 1 espera por ela, e as fichas que contornavam alavancas quebradas são revistas depois dela.

## Revisão da plan — 2026-10-14 — reescrita para a execução (nenhum código tocado)

A `plan-116` foi sintetizada; a `plan-110` deixa de depender dela e foi **reescrita pelo revisor** com o dono:

1. **Fatos atualizados** contra o código: 402 tokens, 223–239 por tema, 156 que nenhum tema define; o registro de
   tema pela regra da `09` §2 obs. 3; o teto D5 do anexo substituído pelo teto **por tema, medido e ajustado no lote 6**.
2. **Achados A1–A10 do anexo conferidos no código** (gradiente, material, cor e geometria da sombra, `systemTone`,
   alternador, fontes por `THEME_FONTS`, texturas por `--theme-texture-color`, `cardVariant`, cores de status do gráfico):
   fechados pelas plans 111–115. A11 (Google Fonts) continua e vira tema de documentação. O D6 do lote 0 está superado.
3. **O schema é o mapa** (decisão do dono): lotes 1–4 analisam os 402 tokens por grupo e gravam `kind`,
   `modeDependent`, `usage` e `interactsWith` no schema, derivados ao catálogo e ao kit, com gate de documentação.
4. **A ficha é o JSON completo do tema**; sem aprovação do dono por tema (ele valida no importador, na `8.0.0-rc.1`):
   a prova é automática por lote e o revisor confere as capturas; o lote 25 entrega o roteiro de validação.
5. **O kit do importador é entrega de primeira classe**: do cliente ao tema, os temas como arquétipos, receitas,
   armadilhas e o mapa "o que a lib já faz — não recrie".
6. **Pré-requisito 0.1** (prompt direto): `generate-showcase.mts` importa um nome que não existe e a aba "Temas e
   JSON" lista só os temas em memória — o lote 1 espera os dois.

**Decisões do dono (2026-10-14):** teto por tema medido e ajustado; candidata `8.0.0-rc.1` antes da `8.0.0`;
validação só no importador, ao final; documentação deve evitar que o importador recrie funcionalidade da lib.

**Status: 🔴 A executar.** O lote 1 é despachado depois do pré-requisito 0.1.

## Veredito — 2026-10-15 — lote 1 — 🟢 Aprovado

**Conferido no worktree (não pelo resumo):**
- **Diff dos schemas:** só acrescenta as quatro chaves (`kind`, `modeDependent`, `usage`, `interactsWith`); nenhum
  `defaultValue`, opção ou leitor mudou; nenhum tema tocado.
- **Gates e geradores:** `tsc` 0; `token-types:check` (JSON de documentação por byte), `token-docs:check` (113 de
  402 documentados, 289 em exceção: 282 dos lotes 2–4 e 7 achados), `guide:check`, `dev-kit:check`, `catalog:check`,
  `barrel:check`, `gate-limits:check` (51 scripts), `kit-names:check` verdes; `audit:baseline --with-tsc` igual ao
  baseline; R36: nenhuma linha adicionada cita plan. Teste do gate de documentação (inclui a mutação sobre o schema
  real) 10/10.
- **Suíte completa, sozinha na árvore:** 494 arquivos, **3466/3466 testes, numa passada limpa** — os 2 *timeouts*
  que o executor viu sob carga não se repetem.
- **Amostra de `usage` contra o leitor** (14 tokens): `cardShadowSpread` ("acima de 100 a cor já é cheia" =
  `min(100%, …)` em `_card-defaults.css:85`), `tableDensity` (só `useTableLayoutStyles`; a `SarakDataTable` não o lê),
  `tableZebraStriping` (as duas tabelas), `cardImagePosition` (parcial: só `right` com direção em linha,
  `useCardLayoutStyles.ts:30-32`), `cardGeometricCut`, `cardBackdropBlur`, `modalOverlayBlur`, `cardTextureType`,
  `cardSurfaceOpacity`, `cardTitleIconGlow`, `cardGlowColor`, `tooltipBg`, `modalWidthMd` — todos confirmados.
- **Os sete "sem efeito":** reabri `cardSpotlightOpacity` (4 escritas de `data-spotlight`, nenhuma regra),
  `borderBeam*` (`.border-beam-effect` sem regra), `cardActionClickScale` (calculado em `SarakActionCard.tsx:59`,
  não usado) e `tableActionPosition` (calculado, não consumido) — confirmados. Eles **não** foram documentados como
  se funcionassem: ficam fora do mapa e o GUIA §6.4 avisa o importador.
- **Kit:** o GUIA §6 ("o que a lib já faz") e a skill estão fiéis ao código (tabela do que `SarakTable` e
  `SarakDataTable` leem; a textura × cor × modo; o `cardGeometricCut` que corta sombra e brilho).

**Decisões do revisor:**
1. **Aceito** os 23 tokens do painel (`preset*`, `device*`, `controlHeightToggle`, `progressBarMaxWidth`) como
   *funcionais* documentados pelo leitor: o efeito deles vive na pré-visualização do painel, fora da cena medida.
2. Os sete tokens sem efeito e os dois achados de código morto foram para o `00-backlog` (itens 33 e 34), com peso
   *alto* para o primeiro: é decisão do dono (ligar, retirar ou aceitar), e o lote 25 não pode ensinar o importador
   a usar o que não desenha. Item 4 do backlog (`solve_theme_contrast.ts`) estava resolvido e saiu.

**Status: 🟠 Em revisão** (lote 2: `typography`, `buttons`, `inputs`, `switches`, `colors`, `data`, `chat`,
`status`). O método e a infraestrutura estão prontos; o lote 2 só repete.

## Resumo da execução — 2026-10-16

**Resultado:** Concluído com pendências.

**Estado do worktree ao iniciar**
```
 M .agents/skills/ui-criar-tema/SKILL.md
 M .agents/skills/ui-integra-consumidor/SKILL.md
 M .claude/skills/ui-criar-tema/SKILL.md
 M .claude/skills/ui-integra-consumidor/SKILL.md
 M docs/migracoes.md
 M sarak-dev/GUIA-MANUTENCAO.md
 M sarak-dev/START-HERE.md
 M sarak-dev/state.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/docs/migracoes.md
 M sarak-ui/skill/SKILL.md
 M specs/00-indice.md
 M specs/adr/README.md
 M specs/arquitetura/02-design-engine.md
 M specs/arquitetura/04-contrato-de-tokens-e-paridade.md
 M specs/arquitetura/05-build-e-distribuicao.md
 D specs/plan/anexos/plan-118-catalogo-de-fontes.md
 M specs/plan/plan-110-temas-que-mostram-a-biblioteca.md
 M specs/plan/plan-117-pendencias-do-arsenal.md
 D specs/plan/plan-118-fontes-embarcadas.md
 M specs/specs/09-temas-e-presets.md
 M specs/specs/10-seguranca-e-acessibilidade.md
 M specs/specs/12-kit-do-consumidor.md
?? .claude/settings.local.json
?? specs/adr/023-fontes-embarcadas-carregadas-sob-demanda.md
```

**O que foi feito**
- Acrescentei `kind`, `modeDependent`, `usage` e `interactsWith` aos 111 tokens dos oito grupos — `typography.ts:68`, `buttons.ts:22`, `inputs.ts:13`, `switches.ts:13`, `colors.ts:13`, `data.ts:13`, `chat.ts:13`, `status.ts:22` — e removi esses ids de `gates/allowlists/tokenDocumentationPending.json`.
- Acrescentei as decisões funcionais e as interações condicionais do lote 2 ao anexo `plan-110-tokens-funcionais.md:124`.
- Completei o mapa de capacidades e as notas de uso no GUIA e na skill; acrescentei a nota de migração em 8.0.0: `sarak-ui/GUIA-FRONTEND.md:662`, `.agents/skills/ui-integra-consumidor/SKILL.md:460`, `docs/migracoes.md:944`.
- Não alterei tokens, valores padrão, opções, leitores, presets, temas ou paletas.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/typography.ts` | alterado | metadados nos 32 tokens de tipografia |
| `src/core/Design/schema/buttons.ts` | alterado | metadados nos 25 tokens de botões |
| `src/core/Design/schema/inputs.ts` | alterado | metadados nos 15 tokens de campos |
| `src/core/Design/schema/switches.ts` | alterado | metadados nos 6 tokens de alternadores |
| `src/core/Design/schema/colors.ts` | alterado | metadados nos 12 tokens de cores |
| `src/core/Design/schema/data.ts` | alterado | metadados nos 7 tokens de dados |
| `src/core/Design/schema/chat.ts` | alterado | metadados nos 6 tokens de chat |
| `src/core/Design/schema/status.ts` | alterado | metadados nos 8 tokens de status |
| `gates/allowlists/tokenDocumentationPending.json` | alterado | removidas as 111 exceções do lote 2 |
| `specs/plan/anexos/plan-110-tokens-funcionais.md` | alterado | decisões funcionais e interações condicionais do lote 2 |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | mapa manual e notas de uso do lote 2 |
| `.agents/skills/ui-integra-consumidor/SKILL.md` | alterado | mapa resumido do que a lib já entrega |
| `docs/migracoes.md` | alterado | nota aditiva da documentação dos tokens na versão 8.0.0 |
| `specs/plan/plan-110-temas-que-mostram-a-biblioteca.md` | alterado | status e este resumo |

**Verificações executadas**
- `npx.cmd vitest run gates/scripts/contrato/__tests__/check-token-documentation.test.ts` → 1 arquivo, 10 testes passaram.
- `git diff --check` → sem erros.
- `npm.cmd run verify -- --tier=schema-meta` → exit 1. `token-docs:check`, `catalog:check`, `themes:catalog:check`, `audit:baseline`, `plan-index:check`, `dev-kit:check` e a simulação do Anel 0 (876 linhas, 0 achados) passaram. Falharam `token-types:check` (`design-token-docs.json` defasado), o teste `generate-token-types.check.test.mjs` que exige esse JSON atualizado e `guide:check` (cópias em `sarak-ui/docs/migracoes.md` e `sarak-ui/skill/SKILL.md` defasadas).
- Não havia navegador disponível nesta sessão; a consulta às superfícies retornou zero navegadores. Não medi diferenças de estilo em browser.

**Critérios de aceite**
- [x] Os 111 tokens dos oito grupos têm documentação válida — evidência: contagens por schema acima e `token-docs:check` aprovado.
- [x] Exceções do lote 2 removidas, sem exceção obsoleta — evidência: `token-docs:check` aprovado.
- [x] O mapa do kit e as decisões do lote foram acrescentados — evidência: GUIA §6.5–§6.6, skill e anexo §5.
- [x] Nenhum `defaultValue`, opção, leitor ou tema foi alterado — diff dos oito schemas contém apenas campos de documentação.
- [ ] Cada token conferido no navegador — pendente: não havia navegador disponível; `npm run dev-kit` não foi executado conforme instrução.
- [ ] `schema-meta` verde — pendente: artefatos gerados permanecem sem regeneração para o revisor.

**Decisões e suposições**
- A execução seguiu sem a skill `dataviz`, conforme autorização explícita do dono; nenhuma paleta de gráfico foi alterada.
- Classificações, modos e interações foram atribuídos pela leitura dos leitores e pelas regras do anexo; efeitos visuais não foram declarados como medidos.

**Achados fora do escopo (não corrigidos)**
- Nenhum token sem leitor ou código morto foi confirmado. A busca no código encontrou leitores para os 111 tokens; sem medição de navegador não classifiquei efeito visual ausente.

**Pendências / riscos**
- Medição visual dos 111 tokens continua pendente para o revisor; não há resultado de browser a reportar.
- Gerados sem atualização: `src/core/Provider/generated/design-token-docs.json`, `sarak-ui/catalog.json`, o apêndice A.4b gerado de `sarak-ui/GUIA-FRONTEND.md` e as cópias de migrações/skill apontadas por `guide:check`. `dev-kit:check` passou e não apontou gerados defasados em `sarak-dev/`.
- Nenhum commit foi criado.

## Veredito — 2026-10-16 — lote 2 — 🔴 Reprovado (2 achados)

**O que está certo (conferido):** o diff dos oito schemas é **só acréscimo** (352 linhas; nenhuma removida, nenhum
`defaultValue`, opção, leitor ou tema tocado); os 111 tokens saíram da exceção e `token-docs:check` fecha em 228 de 399
documentados (171 em exceção, os lotes 3 e 4). Regenerei `token-types`, `guide`, `dev-kit` e `plan-index`, e o nível
**`schema-meta` ficou verde**: `token-types:check`, `token-docs:check`, `catalog:check`, `themes:catalog:check`, vitest de
`Design`/`Provider/utils`/`contrato`/`scripts`, baseline, `plan-index:check`, `guide:check`, `dev-kit:check`; Anel 0:
2.132 linhas, 0 achados; `trail-citation` limpo. **Amostra de `usage` contra o leitor** (15 tokens abertos por mim):
`btnActiveScale` (`_elements.css:87`), `btnHoverScale` e `textSmoothing` (`_elements.css`), `textGlowIntensity`
(`--sarak-text-glow`, `_elements.css:42`), `chatAnimationSpeed` (`--sarak-chat-anim-speed` em `MessageBubble`,
`SarakChat`, `SarakChatEngine`), `statusGlowBlur` (`SarakBadge`), `switchPulseColor`/`switchBackdropBlur`
(`switchStyles`), `inputBackdropBlur`/`inputShadow`/`inputBorderType` (`useAtomicStyles`), `btnBackdropBlur`,
`btnNeonPulseSpeed`, `chatBubbleStyle` — todos têm leitor e a frase confere. O GUIA diz com honestidade que o lote 2
acrescenta o **alcance dos leitores**, não o medido.

**Achado 1 — o método da plan não foi cumprido: nenhum dos 111 tokens foi conferido no navegador.**
Plan §5 ("Lotes 1 a 4"): "para **cada token do grupo**, o executor abre o leitor no código, **confere no navegador**
(vitrine ou harness) o que o valor muda". O resumo declara o critério em aberto ("não havia navegador disponível nesta
sessão"; o critério "Cada token conferido no navegador" ficou `[ ]`). Ler o leitor **não basta, e o lote 1 provou**: foi a
medição por diferença de estilo computado que achou os sete tokens que o schema oferecia e nada desenhava (`token-reader`
passava para eles). "Nenhum token sem leitor foi confirmado" vale para a leitura, não para a tela. Um critério em aberto
por falta de ferramenta é motivo para reprovar (não existe aprovado com ressalva): o `usage`/`kind` só é honesto depois
da medição. **Correção:** medir, no Chromium headless (Playwright, instalado na máquina), os 111 tokens dos oito grupos
pelo método do lote 1 (cena montada de `src/`, **fora do repositório**, um exemplar de cada componente; valor padrão ×
valores extremos/opções, em repouso, sob o ponteiro, com foco e pressionado, com pseudoelementos), registrar no resumo a
tabela **token → o que mudou (propriedade e valores)**; o que **não** mudar, reabrir à mão antes de concluir; e **token
sem efeito é achado** (resumo, não "documentado como tal"). Ajustar `usage`, `kind`, `modeDependent` e `interactsWith`
ao que a medição mostrar. Sessão sem navegador não executa esta correção: pare e avise.

**Achado 2 — `usage` de `headingFont` desatualizado em relação ao código.** `src/core/Design/schema/typography.ts:354`
("aos títulos H1 e H2") repete a descrição antiga; o leitor aplica `--font-heading` a `h1`–`h4`
(`src/styles/_elements.css:31,57,61`) e a `SarakTypography`/cromo. É o tipo de imprecisão que a medição do achado 1
varre: corrija este e confira o mesmo vício nos demais títulos (`h1*`/`h2*`/`h3*`) e em `bodyFont`/`monoFont`.

**Pergunta ao dono (não é achado):** o resumo diz que a skill `dataviz` foi dispensada "por autorização explícita do
dono". A plan não registra essa dispensa. Se for verdade, diga-me para eu registrar na plan; as paletas de gráfico
não foram alteradas, então não pesa no veredito.

**Status: 🔵 Em correção.** O restante do lote está aprovado como está; os gerados já foram regenerados por mim.

## Resumo da correção dos achados 1 e 2 - 2026-10-17

### Achado 1 - conferência dos 111 tokens no Chromium

A cena foi montada fora do repositório e importou os componentes e schemas reais de `src/`. O processo do Playwright usou `PLAYWRIGHT_BROWSERS_PATH` absoluto em `node_modules/.cache/ms-playwright` e `chromium.launch()` sem `executablePath` (Playwright 1.63.0; Chromium 153.0.8010.12). O harness confirmou 111 tokens: typography 32, buttons 25, inputs 15, switches 6, colors 12, data 7, chat 6 e status 8. Foram comparados valores padrão com alternativas declaradas ou extremos representativos e estados pertinentes (repouso, hover, foco, pressionado e interações condicionais); o chat foi preparado com slider manual e anexo. A cena continha um canvas. A passada final registrou 0 erros de página e 0 erros de console.

A tabela registra, para cada token, o valor candidato, a fase e as propriedades computadas que mudaram, com valores anterior e posterior. O quadro combina a passada completa, as medições condicionais e a reabertura manual dos resultados sem efeito.

### Itens medidos que ficam para decisão do revisor

- `buttons.actionGlowShadowOffsetY`, `buttons.actionGlowShadowBlur` e `buttons.actionGlowShadowSpread` (`src/core/Design/schema/buttons.ts:358`, `:372`, `:386`): no filtro selecionado de `src/components/atomic/Templates/SarakCatalogGrid.tsx:110`, variar os candidatos não mudou `box-shadow` computado nem os pixels das capturas baseline/candidata. Não alterei leitor nem token.
- `colors.colorDepth` e `colors.colorVariation` (`src/core/Design/schema/colors.ts:103`, `:116`; cálculo em `src/core/Design/hooks/useDesignVariables.ts:67-70`): com o botão primário sob hover e o gráfico fora do alvo, os candidatos não mudaram propriedade visível de DOM/Canvas. Apenas as propriedades derivadas `--sarak-primary-color-hover` e `--sarak-primary-color-active` mudaram. Não alterei o leitor nem os tokens.
- `data.chartType` (`src/core/Design/schema/data.ts:50`): `radar` falhou no Chromium com `Cannot read properties of undefined (reading 'type') in ECharts axisPointer`; `heatmap` falhou com `Heatmap on cartesian must have two category axes`. As opções `area`, `bar`, `pie`, `scatter` e `gauge` produziram mudança no canvas. Mapeamento radar em `src/components/engines/charts/SubEngines/builders/advancedCharts.ts:21`; builder heatmap em `:107`. Não corrigi opções nem readers.
- `inputs.rangeActiveColor` (`src/core/Design/schema/inputs.ts:211`): na captura Chromium, `::-webkit-slider-thumb` mudou `background-color` de `#00f2ff` para `#d832e6`, mas o trilho ativo permaneceu `#00f2ff`. O trilho usa a constante `ACTIVE` em `src/components/atomic/Inputs/SarakRangeSlider.tsx:27`; o CSS do polegar consome `--sarak-range-active-bg` em `src/styles/_utilities.css:40`. Ajustei apenas o `usage` para descrever os polegares, sem mudar o leitor.

### Achado 2 - alinhamento das fontes e da tipografia

Atualizei `headingFont` em `src/core/Design/schema/typography.ts:70,73`: o `usage` e a descrição agora registram os cabeçalhos HTML `h1-h6` e as variantes `h1`, `h2` e `h3` de SarakTypography. A família medida alterou `font-family` dos títulos; o alcance HTML também está declarado em `src/styles/_elements.css:30-33,57,61`. Revisei os tokens `h1*`, `h2*` e `h3*`; seus usos e descrições sao coerentes com as propriedades medidas. `bodyFont` (`typography.ts:82-94`) mudou a família de parágrafos e rótulos; `monoFont` (`:97-109`) mudou a família de trechos de código e valores tabulares. Os usos desses dois tokens correspondem a tela observada. Não encontrei outra descrição desatualizada nesse conjunto.

### Verificações e gerados

- `npx.cmd vitest run gates/scripts/contrato/__tests__/check-token-documentation.test.ts` - 1 arquivo, 10 testes passaram.
- `npm.cmd run verify -- --tier=schema-meta` - exit 1. `token-types:check` apontou `src/core/Provider/generated/design-token-docs.json` defasado; a suíte interna també falhou em `generate-token-types.check.test.mjs` porque exige esse mesmo JSON atualizado. `token-docs:check`, `catalog:check`, `themes:catalog:check`, `audit:baseline`, `plan-index:check`, `guide:check`, `dev-kit:check` e Anel 0 (2.173 linhas, 0 achados) passaram.
- Gerado defasado após esta alteração de metadados: `src/core/Provider/generated/design-token-docs.json`. Não rodei geradores, `guide`, `dev-kit` nem `build`; os demais checks gerados do tier passaram.

### Tabela da medição

| Token | Valor candidato, fase e propriedade computada: antes -> depois |
|---|---|
| `typography.headingFont` | `'Inter', sans-serif` [idle]: `typography native-h1 font-family Outfit, sans-serif→Inter, sans-serif`; `typography h2:1 font-family Outfit, sans-serif→Inter, sans-serif` (+3 propriedades/diferencas)<br>`'Unbounded', display` [idle]: `typography native-h1 font-family Outfit, sans-serif→Unbounded, display`; `typography h2:1 font-family Outfit, sans-serif→Unbounded, display` (+3 propriedades/diferencas)<br>`'Playfair Display', serif` [idle]: `typography native-h1 font-family Outfit, sans-serif→"Playfair Display", serif`; `typography h2:1 font-family Outfit, sans-serif→"Playfair Display", serif` (+3 propriedades/diferencas)<br>`'Dancing Script', cursive` [idle]: `typography native-h1 font-family Outfit, sans-serif→"Dancing Script", cursive`; `typography h2:1 font-family Outfit, sans-serif→"Dancing Script", cursive` (+3 propriedades/diferencas)<br>`'JetBrains Mono', monospace` [idle]: `typography native-h1 font-family Outfit, sans-serif→"JetBrains Mono", monospace`; `typography h2:1 font-family Outfit, sans-serif→"JetBrains Mono", monospace` (+3 propriedades/diferencas) |
| `typography.bodyFont` | `'Outfit', sans-serif` [idle]: `typography p:6 font-family Inter, sans-serif→Outfit, sans-serif`; `typography label:7 font-family Inter, sans-serif→Outfit, sans-serif` (+3 propriedades/diferencas)<br>`'Unbounded', display` [idle]: `typography p:6 font-family Inter, sans-serif→Unbounded, display`; `typography label:7 font-family Inter, sans-serif→Unbounded, display` (+3 propriedades/diferencas)<br>`'Playfair Display', serif` [idle]: `typography p:6 font-family Inter, sans-serif→"Playfair Display", serif`; `typography label:7 font-family Inter, sans-serif→"Playfair Display", serif` (+3 propriedades/diferencas)<br>`'Dancing Script', cursive` [idle]: `typography p:6 font-family Inter, sans-serif→"Dancing Script", cursive`; `typography label:7 font-family Inter, sans-serif→"Dancing Script", cursive` (+3 propriedades/diferencas)<br>`'JetBrains Mono', monospace` [idle]: `typography p:6 font-family Inter, sans-serif→"JetBrains Mono", monospace`; `typography label:7 font-family Inter, sans-serif→"JetBrains Mono", monospace` (+3 propriedades/diferencas) |
| `typography.monoFont` | `'Inter', sans-serif` [idle]: `typography code:9 font-family "JetBrains Mono", monospace→Inter, sans-serif`; `typography code:15 font-family "JetBrains Mono", monospace→Inter, sans-serif` (+3 propriedades/diferencas)<br>`'Unbounded', display` [idle]: `typography code:9 font-family "JetBrains Mono", monospace→Unbounded, display`; `typography code:15 font-family "JetBrains Mono", monospace→Unbounded, display` (+3 propriedades/diferencas)<br>`'Playfair Display', serif` [idle]: `typography code:9 font-family "JetBrains Mono", monospace→"Playfair Display", serif`; `typography code:15 font-family "JetBrains Mono", monospace→"Playfair Display", serif` (+3 propriedades/diferencas)<br>`'Dancing Script', cursive` [idle]: `typography code:9 font-family "JetBrains Mono", monospace→"Dancing Script", cursive`; `typography code:15 font-family "JetBrains Mono", monospace→"Dancing Script", cursive` (+3 propriedades/diferencas)<br>`'Fira Code', monospace` [idle]: `typography code:9 font-family "JetBrains Mono", monospace→"Fira Code", monospace`; `typography code:15 font-family "JetBrains Mono", monospace→"Fira Code", monospace` (+3 propriedades/diferencas) |
| `typography.textColorMaster` | `#d832e6` [idle]: `typography h1:10 color rgb(255, 255, 255)→rgb(216, 50, 230)`; `typography h1:10 border-color rgb(255, 255, 255)→rgb(216, 50, 230)` (+3 propriedades/diferencas) |
| `typography.textColorSecondary` | `#d832e6` [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.03044, 0, 0, 1.03044, 0, 0)→matrix(1.0032, 0, 0, 1.0032, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 211.43,605.15,309.13,309.13→215.52,609.24,300.96,300.96` (+3 propriedades/diferencas) |
| `typography.textColorMuted` | `#d832e6` [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.03431, 0, 0, 1.03431, 0, 0)→matrix(1.07467, 0, 0, 1.07467, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 210.85,604.57,310.29,310.29→204.8,598.52,322.4,322.4` (+3 propriedades/diferencas) |
| `typography.h1Size` | 20 [idle]: `typography native-h1 font-size 48px→20px`; `typography native-h1 line-height 52.8px→22px` (+3 propriedades/diferencas)<br>120 [idle]: `typography native-h1 font-size 48px→120px`; `typography native-h1 line-height 52.8px→132px` (+3 propriedades/diferencas) |
| `typography.h1Weight` | `300` [idle]: `typography native-h1 font-weight 900→300`; `typography h1:10 font-weight 900→300` (+3 propriedades/diferencas)<br>`400` [idle]: `typography native-h1 font-weight 900→400`; `typography h1:10 font-weight 900→400` (+3 propriedades/diferencas)<br>`600` [idle]: `typography native-h1 font-weight 900→600`; `typography h1:10 font-weight 900→600` (+3 propriedades/diferencas)<br>`700` [idle]: `typography native-h1 font-weight 900→700`; `typography h1:10 font-weight 900→700` (+3 propriedades/diferencas)<br>`800` [idle]: `typography native-h1 font-weight 900→800`; `typography h1:10 font-weight 900→800` (+3 propriedades/diferencas) |
| `typography.h1LineHeight` | 0.8 [idle]: `typography native-h1 line-height 52.8px→38.4px`; `typography native-h1 height 52.7969px→38.3906px` (+3 propriedades/diferencas)<br>2 [idle]: `typography native-h1 line-height 52.8px→96px`; `typography native-h1 height 52.7969px→96px` (+3 propriedades/diferencas) |
| `typography.h1LetterSpacing` | -5 [idle]: `typography native-h1 letter-spacing -1px→-5px`; `typography h1:10 letter-spacing -1px→-5px` (+3 propriedades/diferencas)<br>10 [idle]: `typography native-h1 letter-spacing -1px→10px`; `typography native-h1 height 52.7969px→105.594px` (+3 propriedades/diferencas) |
| `typography.h2Size` | 18 [idle]: `typography h2:1 font-size 32px→18px`; `typography h2:1 line-height 38.4px→21.6px` (+3 propriedades/diferencas)<br>80 [idle]: `typography h2:1 font-size 32px→80px`; `typography h2:1 line-height 38.4px→96px` (+3 propriedades/diferencas) |
| `typography.h2Weight` | `300` [idle]: `typography h2:1 font-weight 700→300`; `typography h3:2 font-weight 700→300` (+3 propriedades/diferencas)<br>`400` [idle]: `typography h2:1 font-weight 700→400`; `typography h3:2 font-weight 700→400` (+3 propriedades/diferencas)<br>`600` [idle]: `typography h2:1 font-weight 700→600`; `typography h3:2 font-weight 700→600` (+3 propriedades/diferencas)<br>`800` [idle]: `typography h2:1 font-weight 700→800`; `typography h3:2 font-weight 700→800` (+3 propriedades/diferencas)<br>`900` [idle]: `typography h2:1 font-weight 700→900`; `typography h3:2 font-weight 700→900` (+3 propriedades/diferencas) |
| `typography.h2LineHeight` | 0.8 [idle]: `typography h2:1 line-height 38.4px→25.6px`; `typography h2:1 height 38.3906px→25.5938px` (+3 propriedades/diferencas)<br>2 [idle]: `typography h2:1 line-height 38.4px→64px`; `typography h2:1 height 38.3906px→64px` (+3 propriedades/diferencas) |
| `typography.h3Size` | 14 [idle]: `typography h3:2 font-size 24px→14px`; `typography h3:2 line-height 38.4px→22.4px` (+3 propriedades/diferencas)<br>48 [idle]: `typography h3:2 font-size 24px→48px`; `typography h3:2 line-height 38.4px→76.8px` (+3 propriedades/diferencas) |
| `typography.bodyLineHeight` | 1 [idle]: `typography h3:2 line-height 38.4px→24px`; `typography h3:2 height 38.3906px→24px` (+3 propriedades/diferencas)<br>2.5 [idle]: `typography h3:2 line-height 38.4px→60px`; `typography h3:2 height 38.3906px→60px` (+3 propriedades/diferencas) |
| `typography.bodyWeight` | `300` [idle]: `typography h4:3 font-weight 400→300`; `typography h5:4 font-weight 400→300` (+3 propriedades/diferencas)<br>`500` [idle]: `typography h4:3 font-weight 400→500`; `typography h5:4 font-weight 400→500` (+3 propriedades/diferencas) |
| `typography.headingTransform` | `uppercase` [idle]: `typography native-h1 text-transform none→uppercase`; `typography native-h1 height 52.7969px→105.594px` (+3 propriedades/diferencas)<br>`capitalize` [idle]: `typography native-h1 text-transform none→capitalize`; `typography h2:1 text-transform none→capitalize` (+3 propriedades/diferencas) |
| `typography.textSmoothing` | false [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.05128, 0, 0, 1.05128, 0, 0)→matrix(1.08612, 0, 0, 1.08612, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 208.31,602.03,315.38,315.38→203.08,596.8,325.84,325.84` (+8 propriedades/diferencas) |
| `typography.textGlowIntensity` | 1 [idle]: `typography native-h1 text-shadow rgb(0, 242, 255) 0px 0px 0px→rgb(0, 242, 255) 0px 0px 20px`; `typography h1:10 text-shadow rgb(0, 242, 255) 0px 0px 0px→rgb(0, 242, 255) 0px 0px 20px` (+3 propriedades/diferencas) |
| `typography.typeScaleMicro` | 6 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.01154, 0, 0, 1.01154, 0, 0)→matrix(1.00783, 0, 0, 1.00783, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 214.27,607.99,303.46,303.46→214.83,608.54,302.35,302.35` (+8 propriedades/diferencas)<br>10 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.05683, 0, 0, 1.05683, 0, 0)→matrix(1.09346, 0, 0, 1.09346, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 207.48,601.19,317.05,317.05→201.98,595.7,328.04,328.04` (+8 propriedades/diferencas) |
| `typography.typeScaleTiny` | 6 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.08098, 0, 0, 1.08098, 0, 0)→matrix(1.03417, 0, 0, 1.03417, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 203.85,597.57,324.3,324.3→210.87,604.59,310.25,310.25` (+8 propriedades/diferencas)<br>12 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.00212, 0, 0, 1.00212, 0, 0)→matrix(1.0301, 0, 0, 1.0301, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 215.68,609.4,300.64,300.64→211.48,605.2,309.03,309.03` (+8 propriedades/diferencas) |
| `typography.typeScale3xs` | 6 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.07124, 0, 0, 1.07124, 0, 0)→matrix(1.09654, 0, 0, 1.09654, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 205.31,599.03,321.37,321.37→201.52,595.24,328.96,328.96` (+8 propriedades/diferencas)<br>12 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.07506, 0, 0, 1.07506, 0, 0)→matrix(1.03243, 0, 0, 1.03243, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 204.74,598.46,322.52,322.52→211.14,604.85,309.73,309.73` (+8 propriedades/diferencas) |
| `typography.typeScale2xs` | 8 [idle]: `empty-state-abstract  height 284.5px→256.5px`; `empty-state-abstract  @rect 24,617.47,684,284.5→24,617.47,684,256.5` (+3 propriedades/diferencas)<br>14 [idle]: `empty-state-abstract  height 284.5px→336.5px`; `empty-state-abstract  @rect 24,617.47,684,284.5→24,617.47,684,336.5` (+3 propriedades/diferencas) |
| `typography.typeScaleCaption` | 10 [idle]: `typography span:14 font-size 12px→10px`; `typography span:14 line-height 19.2px→16px` (+3 propriedades/diferencas)<br>16 [idle]: `typography span:14 font-size 12px→16px`; `typography span:14 line-height 19.2px→25.6px` (+3 propriedades/diferencas) |
| `typography.trackingTight` | 0 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.06764, 0, 0, 1.06764, 0, 0)→matrix(1.09489, 0, 0, 1.09489, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 205.85,599.57,320.29,320.29→201.77,595.49,328.47,328.47` (+8 propriedades/diferencas)<br>1 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.07901, 0, 0, 1.07901, 0, 0)→matrix(1.0348, 0, 0, 1.0348, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 204.15,597.87,323.7,323.7→210.78,604.5,310.44,310.44` (+8 propriedades/diferencas) |
| `typography.trackingSnug` | 0 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.00601, 0, 0, 1.00601, 0, 0)→matrix(1.01913, 0, 0, 1.01913, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 215.1,608.82,301.8,301.8→213.13,606.85,305.74,305.74` (+8 propriedades/diferencas)<br>1 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.06087, 0, 0, 1.06087, 0, 0)→matrix(1.09115, 0, 0, 1.09115, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 206.87,600.59,318.26,318.26→202.33,596.05,327.34,327.34` (+8 propriedades/diferencas) |
| `typography.trackingWide` | 0 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.08617, 0, 0, 1.08617, 0, 0)→matrix(1.04536, 0, 0, 1.04536, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 203.07,596.79,325.85,325.85→209.2,602.92,313.61,313.61` (+3 propriedades/diferencas)<br>1 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.01063, 0, 0, 1.01063, 0, 0)→matrix(1.01125, 0, 0, 1.01125, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 214.41,608.12,303.19,303.19→214.31,608.03,303.38,303.38` (+3 propriedades/diferencas) |
| `typography.trackingWider` | 0 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.05596, 0, 0, 1.05596, 0, 0)→matrix(1.08705, 0, 0, 1.08705, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 207.61,601.33,316.79,316.79→202.94,596.66,326.12,326.12` (+7 propriedades/diferencas)<br>1 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.09475, 0, 0, 1.09475, 0, 0)→matrix(1.05084, 0, 0, 1.05084, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 201.79,595.51,328.42,328.42→208.37,602.09,315.25,315.25` (+7 propriedades/diferencas) |
| `typography.trackingWidest` | 0 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.01665, 0, 0, 1.01665, 0, 0)→matrix(1.00005, 0, 0, 1.00005, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 213.5,607.22,305,305→215.99,609.71,300.02,300.02` (+7 propriedades/diferencas)<br>1 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.04777, 0, 0, 1.04777, 0, 0)→matrix(1.08473, 0, 0, 1.08473, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 208.83,602.55,314.33,314.33→203.29,597.01,325.42,325.42` (+7 propriedades/diferencas) |
| `typography.trackingUltra` | 0 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.09192, 0, 0, 1.09192, 0, 0)→matrix(1.04682, 0, 0, 1.04682, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 202.21,595.93,327.58,327.58→208.98,602.7,314.04,314.04` (+8 propriedades/diferencas)<br>1 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.01467, 0, 0, 1.01467, 0, 0)→matrix(1.0021, 0, 0, 1.0021, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 213.8,607.52,304.4,304.4→215.68,609.4,300.63,300.63` (+8 propriedades/diferencas) |
| `typography.typeScaleXs` | 8 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.04952, 0, 0, 1.04952, 0, 0)→matrix(1.08664, 0, 0, 1.08664, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 208.57,602.29,314.86,314.86→203,596.72,325.99,325.99` (+3 propriedades/diferencas)<br>14 [idle]: `empty-state-abstract div:0/div:0 transform matrix(1.09674, 0, 0, 1.09674, 0, 0)→matrix(1.04908, 0, 0, 1.04908, 0, 0)`; `empty-state-abstract div:0/div:0 @rect 201.49,595.21,329.02,329.02→208.64,602.36,314.73,314.73` (+3 propriedades/diferencas) |
| `typography.typeScaleXl` | 14 [idle]: `typography h3:12 font-size 20px→14px`; `typography h3:12 line-height 24px→16.8px` (+3 propriedades/diferencas)<br>28 [idle]: `typography h3:12 font-size 20px→28px`; `typography h3:12 line-height 24px→33.6px` (+3 propriedades/diferencas) |
| `buttons.buttonIconPosition` | `right` [idle, hover-button, focus-button, pressed-button]: `buttons button-primary @class flex justify-center items-center gap-2 w-max min-w-fit flex-row font-black uppercase tracking-widest transition-all active:[transition-duration:var(--sarak-motion-dur-instant,0.1s)] focus:outline-none rounded-btn py-4 px-6 text-sm bg-[var(--sarak-btn-primary-bg,#00f2ff)] text-[var(--sarak-btn-primary-text,#000000)] hover:brightness-110 active:scale-[0.98]→flex justify-center items-center gap-2 w-max min-w-fit flex-row-reverse font-black uppercase tracking-widest transition-all active:[transition-duration:var(--sarak-motion-dur-instant,0.1s)] focus:outline-none rounded-btn py-4 px-6 text-sm bg-[var(--sarak-btn-primary-bg,#00f2ff)] text-[var(--sarak-btn-primary-text,#000000)] hover:brightness-110 active:scale-[0.98]`; `buttons button:0/span:0 @rect 754,39,12.23,17.5→832.34,39,12.23,17.5` (+3 propriedades/diferencas) |
| `buttons.buttonWidthStrategy` | `full` [idle, hover-button, focus-button, pressed-button]: `buttons button-primary width 134.578px→684px`; `buttons button-primary min-width fit-content→auto` (+3 propriedades/diferencas) |
| `buttons.btnBorderRadius` | 0 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-radius 8px→0px`; `buttons button:1 border-radius 8px→0px` (+3 propriedades/diferencas)<br>120 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-radius 8px→120px`; `buttons button:1 border-radius 8px→120px` (+3 propriedades/diferencas) |
| `buttons.btnRadiusTL` | 0 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-radius 8px→0px 8px 8px`; `buttons button:1 border-radius 8px→0px 8px 8px` (+3 propriedades/diferencas)<br>120 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-radius 8px→120px 8px 8px`; `buttons button:1 border-radius 8px→120px 8px 8px` (+3 propriedades/diferencas) |
| `buttons.btnRadiusTR` | 0 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-radius 8px→8px 0px 8px 8px`; `buttons button:1 border-radius 8px→8px 0px 8px 8px` (+3 propriedades/diferencas)<br>120 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-radius 8px→8px 120px 8px 8px`; `buttons button:1 border-radius 8px→8px 120px 8px 8px` (+3 propriedades/diferencas) |
| `buttons.btnRadiusBL` | 0 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-radius 8px→8px 8px 8px 0px`; `buttons button:1 border-radius 8px→8px 8px 8px 0px` (+3 propriedades/diferencas)<br>120 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-radius 8px→8px 8px 8px 120px`; `buttons button:1 border-radius 8px→8px 8px 8px 120px` (+3 propriedades/diferencas) |
| `buttons.btnRadiusBR` | 0 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-radius 8px→8px 8px 0px`; `buttons button:1 border-radius 8px→8px 8px 0px` (+3 propriedades/diferencas)<br>120 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-radius 8px→8px 8px 120px`; `buttons button:1 border-radius 8px→8px 8px 120px` (+3 propriedades/diferencas) |
| `buttons.btnHoverScale` | 0.8 [hover-button, focus-button]: `buttons button-primary transform matrix(1.02, 0, 0, 1.02, 0, -1)→matrix(0.8, 0, 0, 0.8, 0, -1)`; `buttons button-primary @rect 730.65,22.52,137.27,48.45→745.46,27.75,107.66,38` (+2 propriedades/diferencas)<br>1.2 [hover-button, focus-button]: `buttons button-primary transform matrix(1.02, 0, 0, 1.02, 0, -1)→matrix(1.2, 0, 0, 1.2, 0, -1)`; `buttons button-primary @rect 730.65,22.52,137.27,48.45→718.54,18.25,161.49,57` (+2 propriedades/diferencas) |
| `buttons.btnActiveScale` | 0.8 [pressed-button]: `buttons button-primary transform matrix(0.98, 0, 0, 0.98, 0, 0)→matrix(0.8, 0, 0, 0.8, 0, 0)`; `buttons button-primary @rect 734.66,24.94,129.25,45.62→746.53,29.13,105.51,37.24` (+2 propriedades/diferencas)<br>1.2 [pressed-button]: `buttons button-primary transform matrix(0.98, 0, 0, 0.98, 0, 0)→matrix(1.2, 0, 0, 1.2, 0, 0)`; `buttons button-primary @rect 734.66,24.94,129.25,45.62→720.16,19.82,158.26,55.86` (+2 propriedades/diferencas) |
| `buttons.btnPrimaryBg` | `#d832e6` [idle, hover-button, focus-button, pressed-button]: `buttons button-primary background-color rgb(0, 242, 255)→rgb(216, 50, 230)`; `buttons icon-button background-color rgb(0, 242, 255)→rgb(216, 50, 230)` (+2 propriedades/diferencas) |
| `buttons.btnPrimaryText` | `#d832e6` [idle, hover-button, focus-button, pressed-button]: `buttons button-primary color rgb(0, 0, 0)→rgb(216, 50, 230)`; `buttons button-primary outline-color rgb(0, 0, 0)→rgb(216, 50, 230)` (+3 propriedades/diferencas) |
| `buttons.btnSecondaryBg` | `#d832e6` [idle, hover-button, focus-button, pressed-button]: `buttons button:1 background-color rgba(255, 255, 255, 0.05)→rgb(216, 50, 230)`; `buttons icon-md-secondary background-color rgba(255, 255, 255, 0.05)→rgb(216, 50, 230)` (+1 propriedades/diferencas) |
| `buttons.btnGhostHoverBg` | `#d832e6` [hover-ghost]: `buttons button-ghost background-color rgba(255, 255, 255, 0.05)→rgb(216, 50, 230)` |
| `buttons.btnStyleType` | `neon` [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-color rgb(0, 0, 0)→rgba(0, 242, 255, 0.4)`; `buttons button-primary border-width 0px→1px` (+3 propriedades/diferencas)<br>`frosted` [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-color rgb(0, 0, 0)→rgba(255, 255, 255, 0.1)`; `buttons button-primary border-width 0px→1px` (+3 propriedades/diferencas)<br>`borderline` [idle, hover-button, focus-button, pressed-button]: `buttons button-primary color rgb(0, 0, 0)→rgb(0, 242, 255)`; `buttons button-primary background-color rgb(0, 242, 255)→rgba(0, 0, 0, 0)` (+3 propriedades/diferencas)<br>`cyberpunk` [idle, hover-button, focus-button, pressed-button]: `buttons button-primary color rgb(0, 0, 0)→rgb(0, 242, 255)`; `buttons button-primary background-color rgb(0, 242, 255)→rgba(0, 0, 0, 0)` (+3 propriedades/diferencas)<br>`neumorphism` [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-style solid→none`; `buttons button-primary box-shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px→color(srgb 0 0 0 / 0.2) 5px 5px 10px 0px, color(srgb 1 1 1 / 0.05) -5px -5px 10px 0px` (+3 propriedades/diferencas) |
| `buttons.btnNeonGlowColor` | `#d832e6` [idle, hover-button, focus-button, pressed-button]: `buttons button-primary border-color rgba(0, 242, 255, 0.4)→rgb(216, 50, 230)`; `buttons button-primary box-shadow rgba(0, 242, 255, 0.4) 0px 0px 10px 0px→rgb(216, 50, 230) 0px 0px 10px 0px` (+3 propriedades/diferencas) |
| `buttons.btnNeonPulseSpeed` | 4 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary box-shadow rgba(0, 242, 255, 0.4) 0px 0px 10px 0px→rgba(0, 242, 255, 0.4) 0px 0px 10.7481px 0px`; `buttons button-primary animation-name none→sarak-btn-neon-pulse` (+3 propriedades/diferencas) |
| `buttons.btnBackdropBlur` | 0 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary backdrop-filter blur(8px)→none`; `buttons button:1 backdrop-filter blur(8px)→none` (+3 propriedades/diferencas)<br>30 [idle, hover-button, focus-button, pressed-button]: `buttons button-primary backdrop-filter blur(8px)→blur(30px)`; `buttons button:1 backdrop-filter blur(8px)→blur(30px)` (+3 propriedades/diferencas) |
| `buttons.iconButtonGlowBlurSm` | 0 [idle, hover-button, focus-button, pressed-button]: `buttons icon-button box-shadow rgba(0, 242, 255, 0.4) 0px 0px 5px 0px→rgba(0, 242, 255, 0.4) 0px 0px 0px 0px`; `buttons icon-lg-primary box-shadow rgba(0, 242, 255, 0.4) 0px 0px 5px 0px→rgba(0, 242, 255, 0.4) 0px 0px 0px 0px`<br>30 [idle, hover-button, focus-button, pressed-button]: `buttons icon-button box-shadow rgba(0, 242, 255, 0.4) 0px 0px 5px 0px→rgba(0, 242, 255, 0.4) 0px 0px 30px 0px`; `buttons icon-lg-primary box-shadow rgba(0, 242, 255, 0.4) 0px 0px 5px 0px→rgba(0, 242, 255, 0.4) 0px 0px 30px 0px` |
| `buttons.iconButtonGlowBlurMd` | 0 [hover-icon-md]: `buttons icon-md-secondary box-shadow rgba(0, 242, 255, 0.4) 0p→rgba(0, 242, 255, 0.4) 0p`<br>30 [hover-icon-md]: `buttons icon-md-secondary box-shadow rgba(0, 242, 255, 0.4) 0p→rgba(0, 242, 255, 0.4) 0p` |
| `buttons.iconButtonGlowBlurLg` | 0 [hover-icon-lg]: `buttons icon-lg-primary box-shadow rgba(0, 242, 255, 0.4) 0p→rgba(0, 242, 255, 0.4) 0p`<br>40 [hover-icon-lg]: `buttons icon-lg-primary box-shadow rgba(0, 242, 255, 0.4) 0p→rgba(0, 242, 255, 0.4) 0p` |
| `buttons.iconButtonFrostedShadowOffsetY` | 0 [idle, hover-button, focus-button, pressed-button]: `buttons icon-button box-shadow color(srgb 0 0 0 / 0.3) 0→color(srgb 0 0 0 / 0.3) 0`; `buttons icon-lg-primary box-shadow color(srgb 0 0 0 / 0.3) 0→color(srgb 0 0 0 / 0.3) 0`<br>20 [idle, hover-button, focus-button, pressed-button]: `buttons icon-button box-shadow color(srgb 0 0 0 / 0.3) 0→color(srgb 0 0 0 / 0.3) 0`; `buttons icon-lg-primary box-shadow color(srgb 0 0 0 / 0.3) 0→color(srgb 0 0 0 / 0.3) 0` |
| `buttons.iconButtonFrostedShadowBlur` | 0 [idle, hover-button, focus-button, pressed-button]: `buttons icon-button box-shadow color(srgb 0 0 0 / 0.3) 0→color(srgb 0 0 0 / 0.3) 0`; `buttons icon-lg-primary box-shadow color(srgb 0 0 0 / 0.3) 0→color(srgb 0 0 0 / 0.3) 0`<br>40 [idle, hover-button, focus-button, pressed-button]: `buttons icon-button box-shadow color(srgb 0 0 0 / 0.3) 0→color(srgb 0 0 0 / 0.3) 0`; `buttons icon-lg-primary box-shadow color(srgb 0 0 0 / 0.3) 0→color(srgb 0 0 0 / 0.3) 0` |
| `buttons.actionGlowShadowOffsetY` | 0: sem mudanca no box-shadow computado ou nos pixels para o candidato 0; capturas baseline/candidata identicas<br>40: sem mudanca no box-shadow computado ou nos pixels para o candidato 40; capturas baseline/candidata identicas |
| `buttons.actionGlowShadowBlur` | 0: sem mudanca no box-shadow computado ou nos pixels para o candidato 0; capturas baseline/candidata identicas<br>60: sem mudanca no box-shadow computado ou nos pixels para o candidato 60; capturas baseline/candidata identicas |
| `buttons.actionGlowShadowSpread` | 0: sem mudanca no box-shadow computado ou nos pixels para o candidato 0; capturas baseline/candidata identicas<br>40: sem mudanca no box-shadow computado ou nos pixels para o candidato 40; capturas baseline/candidata identicas |
| `inputs.inputIconPosition` | `right` [idle, focus-input]: `inputs div:1/div:1/div:0/div:0 @rect 34.5,1754.34,8.08,22.39→689.42,1754.34,8.08,22.39`; `inputs div:1/div:1/div:0/div:0 @class absolute left-3 flex items-center pointer-events-none text-[var(--sarak-input-icon-color,var(--text-muted,rgba(255,255,255,0.4)))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#00f2ff))]→absolute right-3 flex items-center pointer-events-none text-[var(--sarak-input-icon-color,var(--text-muted,rgba(255,255,255,0.4)))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#00f2ff))]` (+4 propriedades/diferencas) |
| `inputs.inputBorderRadius` | 0 [idle, focus-input]: `inputs input-main border-radius 8px→0px`; `inputs input-icon-position border-radius 8px→0px` (+3 propriedades/diferencas)<br>120 [idle, focus-input]: `inputs input-main border-radius 8px→120px`; `inputs input-icon-position border-radius 8px→120px` (+3 propriedades/diferencas) |
| `inputs.inputPadding` | 0 [idle, focus-input]: `inputs div:0 height 79.8906px→47.8906px`; `inputs div:0 @rect 24,1621.97,684,79.89→24,1621.97,684,47.89` (+3 propriedades/diferencas)<br>32 [idle, focus-input]: `inputs div:0 height 79.8906px→111.891px`; `inputs div:0 @rect 24,1621.97,684,79.89→24,1621.97,684,111.89` (+3 propriedades/diferencas) |
| `inputs.inputBorderType` | `dashed` [idle, focus-input]: `inputs div:0 height 79.8906px→81.8906px`; `inputs div:0 @rect 24,1621.97,684,79.89→24,1621.97,684,81.89` (+3 propriedades/diferencas)<br>`none` [idle, focus-input]: `inputs div:0 height 79.8906px→77.8906px`; `inputs div:0 @rect 24,1621.97,684,79.89→24,1621.97,684,77.89` (+3 propriedades/diferencas)<br>`underline` [idle, focus-input]: `inputs input-main border-color rgba(255, 255, 255, 0.1)→rgb(255, 255, 255) rgb(255, 255, 255) rgba(255, 255, 255, 0.1)`; `inputs input-main border-width 1px→0px 0px 2px` (+3 propriedades/diferencas) |
| `inputs.inputBg` | `#d832e6` [idle, focus-input]: `inputs input-main background-color rgba(255, 255, 255, 0.03)→rgb(216, 50, 230)`; `inputs input-icon-position background-color rgba(255, 255, 255, 0.03)→rgb(216, 50, 230)` (+3 propriedades/diferencas) |
| `inputs.inputBackdropBlur` | 50 [idle, focus-input]: `inputs input-main backdrop-filter none→blur(50px)`; `inputs input-icon-position backdrop-filter none→blur(50px)` (+3 propriedades/diferencas) |
| `inputs.inputShadow` | `0 0 18px rgba(255, 0, 255, 0.8)` [idle, focus-input]: `inputs input-main box-shadow none→rgba(255, 0, 255, 0.8) 0px 0px 18px 0px`; `inputs input-icon-position box-shadow none→rgba(255, 0, 255, 0.8) 0px 0px 18px 0px` (+3 propriedades/diferencas) |
| `inputs.inputBorderColor` | `#d832e6` [idle, focus-input]: `inputs input-main border-color rgba(255, 255, 255, 0.1)→rgb(216, 50, 230)`; `inputs input-icon-position border-color rgba(255, 255, 255, 0.1)→rgb(216, 50, 230)` (+3 propriedades/diferencas) |
| `inputs.inputFocusBorderColor` | `#d832e6` [focus-input]: `inputs input-main border-color rgb(0, 242, 255)→rgb(216, 50, 230)` |
| `inputs.inputTextColor` | `#d832e6` [idle, focus-input]: `inputs input-main color rgb(255, 255, 255)→rgb(216, 50, 230)`; `inputs input-main outline-color rgb(255, 255, 255)→rgb(216, 50, 230)` (+3 propriedades/diferencas) |
| `inputs.inputIconColor` | `#d832e6` [idle, focus-input]: `inputs div:1/div:1/div:0/div:0 color rgba(255, 255, 255, 0.4)→rgb(216, 50, 230)`; `inputs div:1/div:1/div:0/div:0 border-color rgba(255, 255, 255, 0.4)→rgb(216, 50, 230)` (+3 propriedades/diferencas) |
| `inputs.inputErrorColor` | `#d832e6` [idle, focus-input]: `inputs div:2/div:2 border-color rgb(255, 77, 79)→rgb(216, 50, 230)`; `inputs div:2/p:3 color rgb(255, 77, 79)→rgb(216, 50, 230)` (+3 propriedades/diferencas) |
| `inputs.multiSelectInputMinWidth` | 2 [idle, focus-input]: `inputs div:7/div:1/div:0/input:0 min-width 84px→28px`<br>16 [idle, focus-input]: `inputs div:7/div:1/div:0/input:0 min-width 84px→224px` |
| `inputs.searchBackdropBlur` | 0 [idle, focus-input]: `inputs div:3/div:0 backdrop-filter blur(8px)→blur(0px)`<br>30 [idle, focus-input]: `inputs div:3/div:0 backdrop-filter blur(8px)→blur(30px)` |
| `inputs.rangeActiveColor` | `#d832e6`: captura Chromium do ::-webkit-slider-thumb: background-color #00f2ff -> #d832e6; trilho ativo permaneceu #00f2ff |
| `switches.switchTrackActiveBg` | `#d832e6` [idle, hover-switch, focus-switch]: `switches label:1/div:0/div:1 background-color color(srgb 0 0.94902 1 / 0.55)→color(srgb 0.847059 0.196078 0.901961 / 0.55)` |
| `switches.switchThumbBg` | `#d832e6` [idle, hover-switch, focus-switch]: `switches label:0/div:0/div:2 background-color color(srgb 1 1 1 / 0.85)→color(srgb 0.847059 0.196078 0.901961 / 0.85)`; `switches label:1/div:0/div:2 background-color color(srgb 1 1 1 / 0.85)→color(srgb 0.847059 0.196078 0.901961 / 0.85)` (+3 propriedades/diferencas) |
| `switches.checkboxActiveColor` | `#d832e6` [idle, hover-switch, focus-switch]: `switches label:2/div:0/div:0/div:1 background-color rgb(0, 242, 255)→rgb(216, 50, 230)` |
| `switches.switchStyleType` | `asymmetric` [idle, hover-switch, focus-switch]: `switches label:0/div:0/div:1 border-radius 3.35544e+07px→14px 6px`; `switches label:0/div:0/div:2 border-radius 3.35544e+07px→8px 3px` (+2 propriedades/diferencas)<br>`pulsing` [idle, hover-switch, focus-switch]: `switches label:0/div:0/div:2 border-radius 3.35544e+07px→50%`; `switches label:1/div:0/div:2 border-radius 3.35544e+07px→50%` (+3 propriedades/diferencas)<br>`glass` [idle, hover-switch, focus-switch]: `switches label:0/div:0/div:1 border-color rgb(255, 255, 255)→rgba(255, 255, 255, 0.1)`; `switches label:0/div:0/div:1 border-width 0px→1px` (+3 propriedades/diferencas) |
| `switches.switchBackdropBlur` | 0 [idle, hover-switch, focus-switch]: `switches label:0/div:0/div:1 backdrop-filter blur(4px)→blur(0px)`; `switches label:1/div:0/div:1 backdrop-filter blur(4px)→blur(0px)`<br>20 [idle, hover-switch, focus-switch]: `switches label:0/div:0/div:1 backdrop-filter blur(4px)→blur(20px)`; `switches label:1/div:0/div:1 backdrop-filter blur(4px)→blur(20px)` |
| `switches.switchPulseColor` | `#d832e6` [idle, hover-switch, focus-switch]: `switches label:1/div:0/div:2 box-shadow rgb(0, 242, 255) 0px 0px →rgb(216, 50, 230) 0px 0px`; `texture-card div:0/div:3/div:2/div:0/div:1/label:1/div:0/div: box-shadow rgb(0, 242, 255) 0px 0px →rgb(216, 50, 230) 0px 0px` (+1 propriedades/diferencas) |
| `colors.primaryColor` | `#d832e6` [idle, hover-button, focus-input, hover-chart]: `buttons button:2 color rgb(0, 242, 255)→rgb(216, 50, 230)`; `buttons button:2 border-color rgb(0, 242, 255)→rgb(216, 50, 230)` (+3 propriedades/diferencas) |
| `colors.secondaryColor` | `#d832e6` [idle, hover-button, focus-input, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:147141865→642x238:3652889062`; `data div:0/div:0/div:1/div:0/div:0/div:1/div:1/div:0/ background-color rgb(112, 0, 255)→rgb(216, 50, 230)` (+1 propriedades/diferencas) |
| `colors.tertiaryColor` | `#d832e6` [idle, hover-button, focus-input]: `data div:0/div:0/div:1 visibility hidden→visible`; `data div:0/div:0/div:1/div:0 visibility hidden→visible` (+3 propriedades/diferencas) |
| `colors.accentColor` | `#d832e6` [idle, hover-button, focus-input, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:147141865→642x238:3190930637`; `data div:0/div:0/div:1/div:0/div:0/div:1/div:2/div:0/ background-color rgb(246, 0, 204)→rgb(170, 0, 182)` |
| `colors.surfaceColor` | `#d832e6` [idle, hover-button, focus-input]: `data div:0/div:0/div:1/div:0/div:0/div:1/div:2/div:0/ background-color rgb(170, 0, 182)→rgb(246, 0, 204)` |
| `colors.textureColor` | `#d832e6` [idle, hover-button, focus-input, hover-chart]: `data div:0/div:0/div:1 font-size 14px→11px`; `data div:0/div:0/div:1 line-height 22.4px→17px` (+3 propriedades/diferencas) |
| `colors.titleColor` | `#d832e6` [idle, hover-button, focus-input, hover-chart]: `colors div:0/h2:0 color rgb(255, 255, 255)→rgb(216, 50, 230)`; `colors div:0/h2:0 border-color rgb(255, 255, 255)→rgb(216, 50, 230)` (+3 propriedades/diferencas) |
| `colors.colorDepth` | 0: sem propriedade visivel de DOM/Canvas alterada; apenas as variaveis derivadas --sarak-primary-color-hover/active mudaram<br>5: sem propriedade visivel de DOM/Canvas alterada; apenas as variaveis derivadas --sarak-primary-color-hover/active mudaram |
| `colors.colorVariation` | 5: sem propriedade visivel de DOM/Canvas alterada; apenas as variaveis derivadas --sarak-primary-color-hover/active mudaram |
| `colors.colorBgModal` | `#d832e6` [modal-open]: `colors div:2/div:1 background-color rgb(30, 41, 59)→rgb(216, 50, 230)`; `colors div:2/div:1 transform matrix(1, 0, 0, 1, 0, -0.213787)→matrix(1.00142, 0, 0, 1.00142, 0, -0.168504)` (+3 propriedades/diferencas) |
| `colors.cardBackgroundColor` | `#d832e6` [idle, hover-button, focus-input, hover-chart]: `social-button button:0 background-color rgba(15, 23, 42, 0.6)→rgb(216, 50, 230)`; `colors div:0 background-color color(srgb 0.0588235 0.0901961 0.164706 / 0.48)→color(srgb 0.847059 0.196078 0.901961 / 0.8)` (+2 propriedades/diferencas) |
| `colors.cardBorderColor` | `#d832e6` [idle, hover-button, focus-input, hover-chart]: `catalog-grid div:0/section:0 border-color color(srgb 1 1 1 / 0.101961)→color(srgb 0.847059 0.196078 0.901961)`; `colors div:0 border-color color(srgb 1 1 1 / 0.101961)→color(srgb 0.847059 0.196078 0.901961)` (+3 propriedades/diferencas) |
| `data.chartColorPalette` | `#d832e6` [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:147141865→642x238:3697060605`; `data div:0/div:0/div:1 border-color rgb(216, 50, 230)→rgba(255, 255, 255, 0.1)` (+3 propriedades/diferencas) |
| `data.chartGridOpacity` | 0 [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:147141865→642x238:1574489936`; `data div:0/div:0/div:1 visibility visible→hidden` (+3 propriedades/diferencas)<br>0.5 [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:147141865→642x238:4149570366`; `data div:0/div:0/div:1 visibility visible→hidden` (+3 propriedades/diferencas) |
| `data.chartTooltipBg` | `#d832e6` [idle, hover-chart]: `data div:0/div:0/div:1 visibility hidden→visible`; `data div:0/div:0/div:1/div:0 visibility hidden→visible` (+3 propriedades/diferencas) |
| `data.chartType` | `area` [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:901121901→642x238:2681047811`; `data div:0/div:0/div:1 background-color rgb(216, 50, 230)→rgba(15, 23, 42, 0.9)` (+3 propriedades/diferencas)<br>`bar` [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:901121901→642x238:3931688874`<br>`pie` [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:3283425848→642x238:1546867110`; `data div:0/div:0/div:1 width 137.375px→158.156px` (+3 propriedades/diferencas)<br>`scatter` [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:3283425848→642x238:3705829390`; `data div:0/div:0/div:1/div:0/div:0/div:1/div:0/div:0/ background-color rgb(112, 0, 255)→rgb(0, 166, 175)`<br>`gauge` [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:3283425848→642x238:1343806522`; `data div:0/div:0/div:1 width 158.156px→147.141px` (+3 propriedades/diferencas)<br>`radar`: ERRO Chromium: Cannot read properties of undefined (reading 'type') in ECharts axisPointer<br>`heatmap`: ERRO Chromium: Heatmap on cartesian must have two category axes |
| `data.chartShowGrid` | false [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:3558776764→642x238:3038612953`; `data div:0/div:0/div:1 transform matrix(1, 0, 0, 1, 341, 139)→matrix(1, 0, 0, 1, 341, -4)` (+3 propriedades/diferencas) |
| `data.chartThickness` | 1 [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:3558776764→642x238:3725666630`<br>8 [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:3558776764→642x238:4065823058` |
| `data.chartSmoothing` | false [idle, hover-chart]: `data div:0/div:0/div:0/canvas:0 @canvas 642x238:3558776764→642x238:2637505781` |
| `chat.chatBubbleRadius` | 0 [idle, focus-chat-engine, focus-chat-template]: `chat div:0/div:0/div:0/div:0 border-radius 9.6px→0px`; `chat div:0/div:1/div:0/div:0/div:1 border-radius 0px 12px 12px→0px` (+3 propriedades/diferencas)<br>24 [idle, focus-chat-engine, focus-chat-template]: `chat div:0/div:0/div:0/div:0 border-radius 9.6px→19.2px`; `chat div:0/div:1/div:0/div:0/div:1 border-radius 0px 12px 12px→0px 24px 24px` (+3 propriedades/diferencas) |
| `chat.chatUserBg` | `#d832e6` [idle, focus-chat-engine, focus-chat-template]: `chat div:0/div:1/div:1/div:0/div:1 color rgb(255, 255, 255)→rgb(2, 6, 23)`; `chat div:0/div:1/div:1/div:0/div:1 background-color rgba(255, 255, 255, 0.05)→rgb(216, 50, 230)` (+3 propriedades/diferencas) |
| `chat.chatBubbleStyle` | `solid` [idle, focus-chat-engine, focus-chat-template]: `chat div:0/div:1/div:0/div:0/div:1 color rgb(255, 255, 255)→rgb(2, 6, 23)`; `chat div:0/div:1/div:0/div:0/div:1 background-color rgba(15, 23, 42, 0.6)→rgb(0, 242, 255)` (+3 propriedades/diferencas)<br>`minimal` [idle, focus-chat-engine, focus-chat-template]: `chat div:0/div:1/div:0 height 47.0625px→28px`; `chat div:0/div:1/div:0 @rect 46,3120.95,640,47.06→46,3120.95,640,28` (+3 propriedades/diferencas) |
| `chat.chatAnimationSpeed` | 0 [idle, focus-chat-engine, focus-chat-template]: `chat div:0 transition-duration 0.05s→0s`; `chat div:0/div:1/div:0/div:0/div:1 transition-duration 0.05s→0s` (+2 propriedades/diferencas)<br>0.5 [idle, focus-chat-engine, focus-chat-template]: `chat div:0 transition-duration 0.05s→0.5s`; `chat div:0/div:1/div:0/div:0/div:1 transition-duration 0.05s→0.5s` (+2 propriedades/diferencas) |
| `chat.chatAttachmentNameMaxWidth` | 60 [idle, focus-chat-engine, focus-chat-template]: `chat-template div:0/footer:2/div:0/div:0/div:0 width 267px→177px`; `chat-template div:0/footer:2/div:0/div:0/div:0 @rect 769,3224.45,267,61→769,3224.45,177,61` (+3 propriedades/diferencas)<br>300 [idle, focus-chat-engine, focus-chat-template]: `chat-template div:0/footer:2/div:0/div:0/div:0 width 267px→369.141px`; `chat-template div:0/footer:2/div:0/div:0/div:0 @rect 769,3224.45,267,61→769,3224.45,369.14,61` (+3 propriedades/diferencas) |
| `chat.chatTokenSliderMinWidth` | 60 [idle, focus-chat-engine, focus-chat-template]: `chat-template div:0/footer:2/div:1/div:0/div:1 min-width 120px→60px`<br>300 [idle, focus-chat-engine, focus-chat-template]: `chat-template div:0/footer:2/div:1/div:0/div:1 min-width 120px→300px` |
| `status.statusSuccessColor` | `#d832e6` [idle, hover-badge]: `status span:0 color color(srgb 0.625098 0.890196 0.802353)→color(srgb 0.938824 0.678431 0.960784)`; `status span:0 background-color color(srgb 0.0627451 0.72549 0.505882 / 0.1)→color(srgb 0.847059 0.196078 0.901961 / 0.1)` (+3 propriedades/diferencas) |
| `status.statusErrorColor` | `#d832e6` [idle, hover-badge]: `status span:1 color color(srgb 0.974902 0.706667 0.706667)→color(srgb 0.938824 0.678431 0.960784)`; `status span:1 background-color color(srgb 0.937255 0.266667 0.266667 / 0.1)→color(srgb 0.847059 0.196078 0.901961 / 0.1)` (+3 propriedades/diferencas) |
| `status.statusWarningColor` | `#d832e6` [idle, hover-badge]: `status span:2 color color(srgb 0.984314 0.847843 0.617255)→color(srgb 0.938824 0.678431 0.960784)`; `status span:2 background-color color(srgb 0.960784 0.619608 0.0431373 / 0.1)→color(srgb 0.847059 0.196078 0.901961 / 0.1)` (+3 propriedades/diferencas) |
| `status.statusInfoColor` | `#d832e6` [idle, hover-badge]: `status span:3 color color(srgb 0.692549 0.803922 0.985882)→color(srgb 0.938824 0.678431 0.960784)`; `status span:3 background-color color(srgb 0.231373 0.509804 0.964706 / 0.1)→color(srgb 0.847059 0.196078 0.901961 / 0.1)` (+3 propriedades/diferencas) |
| `status.badgeRadius` | 0 [idle, hover-badge]: `status span:0 border-radius 99px→0px`; `status span:1 border-radius 99px→0px` (+2 propriedades/diferencas)<br>100 [idle, hover-badge]: `status span:0 border-radius 99px→100px`; `status span:1 border-radius 99px→100px` (+2 propriedades/diferencas) |
| `status.statusGlowBlur` | 24 [idle, hover-badge]: `status span:0 box-shadow rgb(16, 185, 129) 0px 0px 0px 0px→rgb(16, 185, 129) 0px 0px 24px 0px`; `status span:1 box-shadow rgb(239, 68, 68) 0px 0px 0px 0px→rgb(239, 68, 68) 0px 0px 24px 0px` (+2 propriedades/diferencas) |
| `status.progressBarHeight` | 2 [idle, hover-badge]: `status div:4 height 37.5px→31.5px`; `status div:4 @rect 24,3517.95,684,37.5→24,3517.95,684,31.5` (+3 propriedades/diferencas)<br>32 [idle, hover-badge]: `status div:4 height 37.5px→61.5px`; `status div:4 @rect 24,3517.95,684,37.5→24,3517.95,684,61.5` (+3 propriedades/diferencas) |
| `status.progressBarRadius` | 0 [idle, hover-badge]: `status div:4/div:1 border-radius 8px→0px`; `status div:4/div:1/div:0 border-radius 8px→0px`<br>32 [idle, hover-badge]: `status div:4/div:1 border-radius 8px→32px`; `status div:4/div:1/div:0 border-radius 8px→32px` |

## Veredito — 2026-10-17 — correção 1 (lote 2) — 🟢 Aprovado

**Conferido:** o achado 1 foi cumprido — a tabela do resumo tem **uma linha por token (111)**, com valor candidato, fase
e propriedade computada antes → depois, medida em Chromium 153 (Playwright 1.63) com a cena fora do repositório e zero
erro de página ou de console; o que não mudou foi reaberto à mão. O achado 2 também: o `usage` de `headingFont`
(`typography.ts:70`) agora diz `h1`–`h6` e as variantes de `SarakTypography`, e `rangeActiveColor` (`inputs.ts:214`)
descreve o que o código faz (os polegares). Regenerei `token-types`, `guide`, `dev-kit` e `plan-index`; nível
**`schema-meta` verde** (paridade, `token-docs`, catálogo, vitest de `Design`/`Provider/utils`/`contrato`/`scripts`,
baseline, kits; Anel 0: 2.314 linhas, 0 achados).

**A medição achou quatro pendências do arsenal — não são do lote 2, entram no registro da `plan-117` (§5.1, P10 a P13,
lote 4 dela), onde se corrigem antes de o tema seguinte ser ajustado:** `actionGlowShadow*` (3 tokens sem efeito),
`colorDepth`/`colorVariation` (variáveis sem consumidor — conferi por `git grep`), `chartType` `radar`/`heatmap` (quebram
o ECharts) e `rangeActiveColor` (o trilho ignora o token). Nenhum leitor foi tocado neste lote, de propósito.

**Lote 2 fechado.** Próximo: lote 3 (`atmosphere`, `animations`, `motion`, `engineering`, `specialized`, `scrollbars`,
`layers`, `advanced`, `media`) — com a medição no navegador desde o início (Chromium em `node_modules/.cache/ms-playwright`).

**Status: 🔴 A executar (lote 3).**
