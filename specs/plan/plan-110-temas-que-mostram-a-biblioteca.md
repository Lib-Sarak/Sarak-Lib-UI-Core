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
- `specs/plan/anexos/plan-110-tema-<id>.md` (**um anexo por tema**, dos lotes 8 a 24: nota de conceito, medições, o que o tema
  ensinou e achados; ver "Modelo de execução dos lotes 8 a 24" na §5), `specs/plan/anexos/plan-110-direcao-de-arte.md` (só o revisor) e
  `specs/plan/anexos/plan-110-tokens-funcionais.md` (lote 1).
- `docs/migracoes.md` — subseção dentro de `## 8.0.0` nos lotes 1 a 7 e no lote 25; **nos lotes 8 a 24 não se toca**
  (a nota dos temas é uma só, no lote 25); artefatos regenerados pelo revisor.

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
modo muda); fundo por atmosfera do motor ou SVG próprio embutido; paleta de gráfico validada pelas regras do anexo
(A8: as cores de status são reservadas e não entram como série; cada série distinta das vizinhas; 3:1 não textual) —
a skill `dataviz` não existe neste repositório e, se existir na sessão, vale como apoio, não como exigência; fontes pelo
valor exato da lista; o tema sai da lista de exceção da trava.
7.2. O arquivo do tema é a ficha: comentários curtos nos valores não óbvios, e a **nota de conceito** (arquétipo de
identidade, que tokens carregam a personalidade, o que o tema demonstra da lib) no anexo de direção.
7.3. O que o tema ensinou entra no schema (metadados), no mapa "o que a lib já faz" e no guia do importador
(receita, armadilha, padrão) — **no mesmo lote**.
7.4. Capturas da vitrine → conferência do revisor.
7.5. **Insights do tema (todo lote de tema).** O procedimento que o executor segue é o da skill `ui-criar-tema`
(gabarito, preenchimento, registro, completude e contraste, contraparte): ele o **segue e o corrige onde a prática o
desmentir**. O resumo traz a tabela **"o que o tema ensinou"**: cada decisão não óbvia (por que esse valor), cada
armadilha (o que quebrou e como foi achado: medição, gate ou captura) e cada medida (contraste por par, peso gzip) com a
coluna **onde foi gravada** (a skill `ui-criar-tema`, o GUIA do importador, o `usage` de um token ou a nota de conceito).
Item sem destino não foi ensinado. Mínimo por tema: uma receita ou armadilha **nova** na skill, ou a frase "nada novo,
porque …" com o motivo; não repetir o que a skill já diz (R17). O revisor confere a tabela contra o diff.
7.0. **Só no lote 7, antes do tema — o procedimento precisa funcionar e conhecer o `sarak-sovereign`.** (a) O
solucionador de contraste da skill (`scripts/solve_theme_contrast.ts`) importa `getDefaultDesignState`, que não existe
(achado do lote 6, que ajustou o contraste à mão): conserte o import, prove com o teste da skill e diga no resumo
o que ele resolve e o que não resolve. (b) Registre na `ui-criar-tema` as lições do lote 6, que o próximo tema já
precisa: o medidor de contraste não atravessa cadeias `var()` (valor concreto no tema onde o contraste é medido);
derivados que o tema repete (`rangeActiveColor`, `tooltip*`, `inputIconColor`, `aiGlowColor`…) para quem troca só a
primária; token responsivo mantém `{ mob, tab, desk }`; `identityFontFamily` é valor de `THEME_FONTS`; ordem de trabalho
(modo principal, contraparte, contraste por modo, captura); e que a leitura de contraste na tela só vale depois das
transições de hidratação terminarem. (c) Confira o que a skill ainda diz do padrão antigo (`#00f2ff`, `matte`, `grid`,
`none` de textura): o padrão do sistema agora é o do `sarak-sovereign`.

**Modelo de execução dos lotes 8 a 24 (decisão do dono, 2026-10-18).** Lote de tema é **só o tema**: os temas são independentes e
se agrupam **quatro por execução**: **um executor faz quatro temas em sequência** (A: 8–11 · B: 12–15 · C: 16–19 · D: 20–24), e
duas execuções de lotes diferentes podem correr em paralelo se os arquivos forem disjuntos (cada uma só toca o que a lista abaixo
permite). As regras 7.1 a 7.5 acima valem, **menos** onde esta seção disser o contrário:
- **O que o executor toca:** o arquivo do tema (`src/core/Design/presets/themes/<id>.ts`), o anexo dele
  (`specs/plan/anexos/plan-110-tema-<id>.md`) e **a própria linha** do tema em `gates/allowlists/themeCompletenessPending.json`
  (a trava bloqueia tema completo que continua na lista) **e o snapshot** `PresetsCatalog.test.tsx.snap` (e o de `PreviewCanvas` se
  mudar), porque a miniatura de tema depende do conteúdo do tema: `-u` restrito a esses arquivos, conferindo que só mudaram
  linhas do próprio tema. **Nada mais.**
- **O que o executor não faz:** não toca a skill `ui-criar-tema`, o GUIA, o mapa "o que a lib já faz", `docs/migracoes.md`, o anexo de
  direção de arte nem o bloco de resumo da plan; não roda `themes:catalog` (o revisor regenera o catálogo uma vez por lote de temas),
  `build`, `guide`, `dev-kit` nem `token-types`; não corrige defeito do arsenal ou do fluxo de criação de tema — **registra** no anexo.
- **O anexo do tema** (uma só estrutura, em português): (1) nota de conceito; (2) medições: contraste por par e por modo, contraste
  não textual, peso gzip; (3) descrição das capturas (as 10 imagens geradas a partir de `src/` fora do repositório, com as fontes
  reais lidas de `dist/fonts`, abertas e descritas contra a nota de conceito); (4) tabela **"o que o tema ensinou"** (decisão,
  armadilha, medida) com a coluna **destino proposto** (skill `ui-criar-tema`, GUIA, `usage` de token, mapa) — a consolidação é
  do lote 25; (5) **achados do arsenal ou do fluxo**, cada um com `arquivo:linha` e a medição, para o revisor transcrever.
- **O resumo do executor** vai nos anexos dos temas e no chat (não na plan); o revisor mantém a tabela "Estado dos temas" na §9.
- **Defeito essencial: o executor PARA e devolve.** O que torne o tema errado ou bloqueie os seguintes (ferramenta quebrada, token que
  não desenha, bug de componente, token que falta para a ficha) faz o executor **parar no tema em que o achou**, entregar o que já
  está pronto (os temas anteriores do lote, com anexo) e descrever o defeito com `arquivo:linha` e a medição. O revisor corrige
  (prompt direto ou lote da `plan-117`) e despacha a continuação. O que não for essencial, o executor **registra no anexo e
  segue**; espera o lote 25 ou o `00-backlog`. Em dúvida, é essencial: a aplicação dos temas é o refinamento final.
- **Pragmatismo:** nada de rodar gate completo por tema. O executor roda **só** o que prova o tema: `theme-completeness:check`,
  `variable-contract:check`, **`panel-contract:check`** (valor de tema na grade e na faixa do token), o contraste (R31), o
  `themes:diversity` e o peso, e o vitest dos arquivos de tema, **`tokenContractParity.test.ts`**, **um `grep` do id do tema em `src/**/__tests__` (teste que fixa valor do tema se atualiza)** **e do
  `gates/scripts/contrato/__tests__/check-channel-dispute.test.ts`** (a troca de um tema pelo outro deixa variável do anterior?). O Anel 1 inteiro e o
  nível `themes` são do revisor, **uma vez por execução** de quatro temas.
- **Verificação por execução de quatro temas, não por tema:** o revisor regenera o catálogo uma vez, roda `verify --tier=themes` (com o
  Anel 1 inteiro) e abre as capturas que o executor entregou. **Um** `build`, a bateria completa do navegador e a vitrine contra o `dist/`
  só no fim do último lote de temas e no lote 25. O registro dos temas novos (`index.ts`, `all.ts`, `loaders.ts`, `catalog`) é do
  revisor, por prompt direto, antes do lote D.

**Lote 25 — conjunto, documentação consolidada e roteiro de validação.**
25.1. Cobertura do **conjunto**: os 19 usam juntos pelo menos 15 texturas de cartão, 10 fontes, as 3 famílias de
ícone com pelo menos 4 pesos, e nenhum par repete a mesma combinação de textura + estilo de botão + fonte de título
(teste, com mutação); `themes:diversity` verde. (O critério "4 modos de gradiente" volta, porque o gradiente agora
desenha — D6 do lote 0 está superada.)
25.1b. **Consolidação das lições dos temas:** ler os 18 anexos `plan-110-tema-<id>.md` e aplicar **uma vez**, e sem repetir, na skill
`ui-criar-tema`, no GUIA do importador, no mapa "o que a lib já faz" e na nota de `docs/migracoes.md`; reescrever ou aposentar
o `generate_theme_template.ts` (backlog) e fechar o anexo de direção com as notas de conceito.
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
- Lotes de tema (8 a 24, por lote de 4): o tema contra a ficha e o anexo dele; completude (a trava); contraste nos dois modos; peso; **as capturas (o revisor
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

## Estado dos temas (mantido pelo revisor)

| Lote | Tema | Estado | Peso gzip | Menor contraste (escuro / claro) | Revisão |
|---|---|---|---|---|---|
| 6 | `sarak-sovereign` | 🟢 | 3.4 KB | — | aprovado |
| 7 | `cyberpunk-neon` | 🟢 | 3.472 B | 5,52 / 4,61 | aprovado |
| 8 | `industrial-terminal` | 🟢 | 3.421 B | 4,84 / 4,76 | aprovado (commitado) |
| 9 | `neo-brutalism` | 🟢 | 3.346 B | 6,20 / 4,79 | aprovado |
| 10 | `synthwave-retro` | 🟢 | 4.199 B (93%) | 4,51 / 4,67 | aprovado |
| 11 | `nebula-space` | 🟢 | 3.569 B | 5,06 / 4,84 | aprovado; `texture: nebula` restaurada (P27 fechado) |
| 12 | `kinetic-flow` | 🟢 | 3.528 B | 4,53 / 4,63 | aprovado |
| 13 | `cyber-retro-wave` | 🟢 | 3.586 B | 4,53 / 4,67 | aprovado |
| 14 | `blueprint-protocol` | 🟢 | 3.561 B | 4,70 / 4,67 | aprovado |
| 15 | `minimalist-airy` | 🟢 | 3.534 B | 4,89 / 4,98 | aprovado |

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

## Resumo da execução — lote 6 — 2026-10-17

**Resultado:** Concluído com pendências (gerados defasados para o revisor regenerar; teto de peso por tema só proposto, como mandou o prompt; a skill `dataviz` não existe em `.agents/skills`).

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- **6.1** `sarak-sovereign.ts` reescrito pela ficha (§7.1 do anexo), do esqueleto completo: **os 300 tokens estéticos** no modo principal e **os 104 que carregam modo, mais `mode`** na `contraparte` (clara: corpo `#f3f6fa`, camadas `#ffffff`, primária `#087782`); nenhum funcional (saíram `navigationStyle`, larguras do cromo, `zIndex*`, `focusRingWidth`, `reducedMotion`, `cardVariant` etc.). `enabledLanguages` com os seis idiomas. Comentários curtos nos valores não óbvios. Removi só `sarak-sovereign` de `gates/allowlists/themeCompletenessPending.json`; `theme-completeness:check`: "1 de 14 temas completos; 13 em exceção".
- **6.2** `defaultValue` de **94 tokens estéticos** passou a ser o do `sarak-sovereign` (`src/core/Design/schema/`; conferido por script que `defaultValue === design[id]` nos 300, com a exceção `identityFontFamily` abaixo). Reservas `var(--x, F)` reescritas por `fix-fallbacks.ts --write` até convergir; `variable-contract:check` verde. Comentário de `SarakMenuItem.tsx` que citava `#00f2ff` atualizado.
- **6.3** peso medido (abaixo); `PER_THEME_CEILING_BYTES` **não** editado.
- **6.4** vitrine do `sarak-sovereign` capturada (10 imagens) e aberta.
- 20 arquivos de teste e 16 snapshots mudaram só no valor de padrão (diff conferido); `docs/migracoes.md` ganhou a nota MAJOR em `## 8.0.0`; o anexo `plan-110-direcao-de-arte.md` ganhou a §11 (nota de conceito).

**Arquivos alterados** (a lista completa é o `git diff --stat`)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/sarak-sovereign.ts`, `catalog.generated.ts` | alterado | tema refeito; swatch regenerado (`npm run themes:catalog`) |
| `src/core/Design/schema/*.ts` (23 arquivos) | alterado | só `defaultValue` (94 linhas) |
| `src/**` (componentes, `src/styles/*.css`, `SovereignThemeInjector.tsx`, `presets/components/inputs.ts`) | alterado | só a reserva `var(--x, F)` |
| 20 testes + 16 `.snap` | alterado | valor esperado de padrão |
| `gates/allowlists/themeCompletenessPending.json` | alterado | −`sarak-sovereign` |
| `docs/migracoes.md`, `specs/plan/anexos/plan-110-direcao-de-arte.md`, esta plan | alterado | nota MAJOR, nota de conceito, resumo e `status` |

**Verificações executadas**
- `npm run verify -- --tier=quick` → tudo `[OK]` (`tsc`, `audit:baseline --with-tsc`, 25 `*:check`, Anel 0 simulado: 2044 linhas, 0 achado) **exceto `guide:check`** (`sarak-ui/docs/migracoes.md` defasado: gerado, do revisor).
- `npx vitest run src gates --reporter=dot -u` → **476 arquivos, 3380 testes verdes** (rodei `-u` só depois de ler cada falha; antes eram 47 falhas de valor de padrão e 3 reais, abaixo).
- `node gates/scripts/audit/auditor_contraste.mjs` → R31: 0 abaixo de AA no nativo e no oposto; `auditor_presets` sem chave órfã; `verify_contrast.test.ts` 49/49.
- **Falhas reais que a medição achou e corrigi:** `cardTitleFontWeight: '800'` fora das opções (padrão e tema; ficou `'900'`); `cardSurfaceOpacity` 0,72 fora do passo 0,05 (ficou 0,7; clara 0,9); `identityFontFamily` do tema precisa ser valor de `THEME_FONTS`; `colorBgLayer2`, `cardActionBtnHoverBg` e `cardSearchTextFocusColor` são concretos porque o contraste pula cadeia de `var()`; `cardActionBtnHoverBg` claro teve de escurecer (3,99:1 → acima de 4,5:1).
- **Peso** (método do §4.1 do anexo: `esbuild` minify + `gzip -9` por arquivo): `sarak-sovereign` **2.510 → 3.535 B gzip** (raw 7.129 → 12.115 B); os 13 outros hoje 2.248–2.709 B. `node scripts/measure-consumer-boot.mjs`: boot 342,4 KB gzip contra teto relativo 345,3 KB (ok); **"tema sarak-sovereign pesa 3,5 KB gzip, acima de 3,0 KB"**, a falha esperada do teto por tema. O boot cresce cerca de +1,0 KB (só o `sarak-sovereign` está no fecho).
- **Contraste não textual** (apoio, 3:1): escuro — foco do campo 12,7, interruptor 11,5, marcador 12,8, séries 4,2 a 11,5; claro — foco 4,9, interruptor 5,3, séries 5,3 a 6,5. Abaixo de 3:1, deliberado: borda do cartão × corpo 1,2:1 (vidro) e borda do campo em repouso 1,9:1 (escuro) e 2,1:1 (claro).
- **Vitrine:** Chromium headless (`PLAYWRIGHT_BROWSERS_PATH` absoluto em `node_modules/.cache/ms-playwright`, `chromium.launch()` sem `executablePath`), `generate-showcase.mts` copiado para o scratchpad com o harness trocado por um build de `src/` e o CSS por Tailwind (fora do repositório): 10 capturas, 0 falha. **Abri** `dark/sidebar/desktop/telas`, `light/sidebar/desktop/telas`, `dark/sidebar/mobile/modal`, `light/sidebar/mobile/telas` e recortes do topo de claro e escuro. Escuro: fundo quase preto azulado, sidebar mais funda, botão primário ciano com texto escuro, secundário e contorno de vidro, selos legíveis, cartões de vidro com brilho ciano, tabela com cabeçalho ciano, gráfico de área ciano→violeta, calendário com hoje em ciano, estado vazio e chat legíveis. Claro: corpo `#f3f6fa`, cartões brancos com borda fina e sombra suave, primária verde-azulada escura, perigo e sucesso com texto branco, gráfico de área, tabela e chat legíveis. Celular: navegação de base, tabela em cartões, modal escuro com véu desfocado e botão de fechar com anel. Na primeira captura clara o interruptor desligado sumia (polegar branco sobre trilho claro): `switchThumbBg` claro virou `#334155`.

**Critérios de aceite**
- [x] `sarak-sovereign` completo nos dois modos e fora da exceção — `theme-completeness:check`.
- [x] Padrões estéticos = valores do `sarak-sovereign`; reservas acompanham — script de conferência e `variable-contract:check`.
- [x] Contraste R31 verde nos dois modos; `tokenContractParity`, `shippedThemesConsoleClean` e `googleFontsUrl` verdes na suíte.
- [x] Nota MAJOR em `## 8.0.0`, dizendo que os outros 13 temas herdam os padrões novos.
- [x] Peso medido e teto por tema proposto (abaixo); `PER_THEME_CEILING_BYTES` intacto.
- [ ] `guide:check` — pendente: gerado, do revisor. Vitrine contra o `dist/` — do revisor.

**Decisões e suposições**
- **Proposta de teto por tema: 4,5 KB gzip** (o valor D5 aprovado no lote 0). O `sarak-sovereign` completo pesa 3,45 KB (77% do teto); os 13 outros, ao ficarem completos, devem andar de 3,3 a 4 KB (estimativa, não medida); os dois temas com arte SVG embutida (≤1,5 KB de base64 por arquivo, cerca de +1,1 KB gzip cada) cabem justos. Os 3,0 KB atuais não comportam nem o tema padrão. Boot: +1,0 KB já medido.
- Primária e item ativo claros `#087782` em vez do `#0a7f8a` da ficha (este dava 4,20:1 contra o corpo). O solucionador `solve_theme_contrast.ts` está quebrado, então ajustei à mão pelo `auditor_contraste`.
- Tokens responsivos mantêm a forma `{mob,tab,desk}` no tema (`cardBorderRadius` 10/14/14, `btnBorderRadius` 8/10/10 etc.), para não perder o ajuste ao celular.
- Tokens cujo padrão é derivado (`rangeActiveColor`, `tooltip*`, `inputIconColor`, `cardActionBtnPrimaryBg`, `aiGlowColor`, `colorBgModal`, `cardSearchPlaceholderColor`) repetem a cadeia no tema, para o consumidor que troca só a primária levar o derivado.
- **Exceção à regra "padrão = tema":** `identityFontFamily` — o teste exige valor de `THEME_FONTS` no tema e a herança da fonte de títulos é o padrão documentado (`09` §4.4.4); o resultado visual é o mesmo (`Outfit`).
- `colorBgLayer2` deixa de ter a primária como padrão (o teste `atmosferaEBotoesQueDesenham` foi atualizado): a terceira mancha da malha `mesh` de quem não declara o token muda.
- `textureOpacity` 0,3 (em vez de 0,12) para a constelação aparecer; mesmo assim aparece pouco (achado abaixo).
- `scripts/verify-changes.mjs` e `scripts/__tests__/verify-changes.test.mjs` aparecem modificados: são do prompt direto paralelo, não toquei neles.

**Achados fora do escopo (não corrigidos)**
- A textura `constellation` e o gradiente radial quase não se veem em tela cheia: `_atmosphere.css:468-478` desenha estrelas só dentro de uma máscara de traço de 0,5 px, e o cromo e o `main` pintam camadas opacas por cima; só aparecem listras na borda esquerda.
- A fonte `Outfit` não carrega no harness a partir de `src/` (as fontes embarcadas são geradas no build): as capturas mostram os títulos em reserva. A vitrine contra o `dist/` (revisor) mostra a tipografia real.
- `DEFAULT_INDUSTRIAL_SEED` (`src/core/Provider/constants.ts:19`) tem `#00f2ff` e nenhum uso.
- `.agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts:22` importa `getDefaultDesignState`, que não existe.
- Aviso "`searchPositionSidebar` fora do contrato — hidden" em testes de cromo (pré-existente).

**Pendências / riscos**
- **Gerados defasados (revisor regenera):** `sarak-ui/docs/migracoes.md` e o que o `guide` carimba (apêndice do GUIA, `sarak-ui/catalog.json`, `SKILL.md`); `sarak-dev/*` pode carimbar contagens (`dev-kit`). `token-types:check` passou sem regenerar. Não rodei `guide`, `dev-kit`, `token-types` nem build.
- `boot:measure` e `gates:full` falham no teto por tema (3,0 KB) até o revisor editar `PER_THEME_CEILING_BYTES`.
- Os 13 temas ainda na exceção mudam de aparência (herdam os padrões novos) até o lote de cada um; mudança de padrão classifica o diff como `full` no `verify-changes`.
- Legibilidade da tipografia real e do texto sobre o gráfico só se confirmam na vitrine sobre o `dist/`.

## Veredito — 2026-10-17 — lote 6 — 🔴 Reprovado (6 achados)

**O que está certo (conferido):** `sarak-sovereign` completo no modo principal e na contraparte (`theme-completeness:check`: 1 de
14, 13 em exceção); 94 `defaultValue` estéticos passam a ser os dele (script do executor + diff dos schemas: só
`defaultValue`); as reservas `var(--x, F)` convergiram (`variable-contract:check` verde); os testes de unidade mudaram só no
valor esperado (li `componenteQueLeOToken`, `atmosferaEBotoesQueDesenham`, `cartaoQueCedeAClasse`: nenhuma asserção
afrouxada). Nível **`full` verde**: `tsc`, suíte completa, baseline, Anel 1, R36, Anel 0 (2.136 linhas, 0 achados);
`npm run build` real verde; vitrine contra o `dist/` real: 10 capturas, 0 falha. `boot:measure`: boot 342,3 KB contra o teto
relativo 345,3; a única falha é a esperada, o teto por tema (`sarak-sovereign` 3,4 KB contra 3,0).

**O que reprova — a bateria do navegador contra o `dist/`: 348 de 376, 28 falhas.** O resumo diz que não rodou o navegador
contra o `dist/`, e o prompt só dispensava a **vitrine**; a bateria inteira era o que provaria uma troca de 94 padrões em
150 arquivos. Descontadas as duas intermitências conhecidas (`gantt-altura-e-contraste:159` e `tema-sob-demanda:86`, backlog
36), as 26 restantes são:

1. **Legibilidade medida na tela, não no tema (R31 por renderização) — 5 falhas reais.** `contraste-do-que-faltava`:
   "botão de sair do usuário" 1,69:1 (mín. 4,5); estilo `cyberpunk` com texto do botão primário 1,81:1, perigo 2,77:1,
   sucesso 1,92:1; `modo-claro-legivel`: badge suave de sucesso sobre o corpo claro 2,17:1. O `auditor_contraste` do executor mede
   o **tema**; estas medem o componente com os padrões novos (`btnPrimaryText` `#04121a`, cores de status, `btnStyleType`).
   Corrija os **valores** (padrões, derivações ou o tema), nunca o limiar do caso.
2. **`btnStyleType` do padrão passou de `matte` para `frosted` e quebra o que a `plan-117` fechou.** `arsenal-lote4:76` (P10: a
   sombra da categoria não muda com os três tokens): `SarakButton` só preserva o `style` inline no `matte`. Os `usage` dos
   três `actionGlowShadow*` em `schema/buttons.ts`, o GUIA e o cabeçalho do spec dizem "`matte`, o padrão" — agora é falso.
   Decida e registre: o caso fixa `btnStyleType: 'matte'` e a documentação passa a dizer "só com `matte` (não é mais o padrão)",
   ou o padrão volta a um estilo que preserve o `style`. Em qualquer caso a doc fica fiel.
3. **Texturas — 4 falhas reais.** `arsenal-restante-desenha:358` (stripes na cor de textura), `:378` (carbon),
   `token-que-desenha:349` (brushed e frosted): o recorte pede a textura X e o elemento mede
   `radial-gradient(rgb(31, 41, 55) 0.5px …)`, ou seja, o padrão novo (`cardTextureType: micro-dots`, `texture:
   constellation`) está **vencendo ou se somando** ao que o caso escolheu. Descobrir a causa (o caso não zera o padrão
   novo? o CSS soma camadas?) e corrigir o que for defeito; só trocar o valor esperado se o caso estiver medindo o
   elemento errado.
4. **Vitrine: o ícone da busca aparece borrado.** Em `sarak-sovereign__dark__sidebar__desktop__telas.png` o ícone do campo
   "Busca inteligente" e o dos campos "Buscar ferramenta…" saem como uma mancha, não como lupa (no lote 5 saíam nítidos).
   É efeito do padrão novo de campo/vidro (`inputBackdropBlur`, `btnBackdropBlur` ou o estilo `frosted`) borrando o que está
   atrás do campo, inclusive o ícone. Achar a causa e corrigir o padrão ou o `z-index` do ícone.
5. **Casos que fixam o padrão antigo — 14 falhas de valor esperado** (atualizar o **valor** para o do `sarak-sovereign`, ou
   fazer o caso fixar o token que quer provar; não afrouxar): `arsenal-restante-desenha:348` e `:413` (`0, 242, 255` →
   `25, 227, 240`); `cascata-que-cede:80` e `schema-que-desenha:228` (raio do cartão 12 → 14 px); `schema-que-desenha:284`
   (peso da marca 700 → 800); `transicao-padrao-do-tema` (curva de fábrica `cubic-bezier(0.4,0,0.2,1)` →
   `(0.16,1,0.3,1)`, as duas); `componente-le-o-token:129, 151, 162, 202` e `residuo-da-reauditoria:102` (o cartão deixou de ser
   translúcido: `cardBackgroundColor` `#101622` opaco); `schema-que-desenha:117, 137` (`cardHoverTranslate` -4 → -2 e
   brilho no hover); `schema-que-desenha:303` (`btnGhostHoverBg`); `arsenal-lote5:120` (P14, 0,322 contra < 0,3: reconferir
   depois da troca da curva padrão, pode ser só o valor esperado). **Cada caso mostrado, entrada e valor, no resumo.**
6. **Teto de peso por tema** — decisão do revisor: **4,5 KB gzip** (o D5 aprovado no lote 0; o `sarak-sovereign` completo tem
   3,4 KB e os outros devem ficar entre 3,3 e 4). Vai por prompt direto separado (é o `PER_THEME_CEILING_BYTES`); o lote 7
   só começa depois dele.

**Verificação do conserto, para não repetir a falha:** o executor roda a **bateria inteira do navegador num build à parte**
(fora do repositório) e entrega a contagem; o revisor confirma uma vez contra o `dist/`. Para o achado 4, entregar a captura
nova da vitrine, aberta e descrita.

**Status: 🔵 Em correção.**

## Resumo da execução (correção 1) — lote 6 — 2026-10-17

**Resultado:** Concluído com pendências (gerados defasados; uma intermitência conhecida). Escopo: só os achados 1 a 5.

**Bateria do navegador** (`npx playwright test --config=browser-tests/playwright.config.ts`, 376 casos), num **build temporário fora do repositório**: cópia da árvore no scratchpad (`node_modules` por junção), `esbuild` com alias para `src/index.ts` e o CSS injetado no bundle como o `inject-css` faz, CSS por Tailwind (`sarak.css` e `sarak-scoped.css`), Chromium headless de `node_modules/.cache/ms-playwright` por caminho absoluto, `chromium.launch()` sem `executablePath`. Não rodei guide, dev-kit, token-types nem build do repositório.
- **Antes** (estado do lote 6): **346 passaram, 30 falharam.** Cinco dessas 30 (`cartao-cede-a-classe:151` e `leitores-que-faltavam:79, 91, 141, 162`, só no modo embarcado) eram defeito do meu harness: o build de `src/` não tinha o CSS injetado no JS (o `inject-css` do build real) e as duas leituras de folha falham em `file://`. Corrigi o harness e as cinco passam (30/30 nos dois arquivos). As 25 restantes batem com as do veredito (28 contra o `dist/`, menos as duas intermitências e três que só aparecem lá).
- **Depois** (bateria inteira): **372 passaram, 4 falharam**: `gantt-altura-e-contraste:159` (intermitência conhecida, não é minha) e três de medição de hover (`componente-le-o-token:202`, `schema-que-desenha:139` e `:307`), que **corrigi em seguida** (abaixo) e **reexecutei só esses dois arquivos: 42 de 42.** Não reexecutei a bateria inteira depois dessa última correção: a contagem final completa é do revisor contra o `dist/`.

**O que foi feito, por achado**
1. **Legibilidade na tela (5 falhas).** Causa medida: o `body` tem `background-color: var(--bg-body) !important` e, na hidratação, ele entra por **transição CSS** (`getAnimations()` mostrou 4 `CSSTransition` em curso); o caso lê o `background-color` do corpo no meio dela (transparente) e compõe o texto sobre o branco do navegador. Amostrei o mesmo corpo em 0, 300 e 1.500 ms: `rgba(0,0,0,0)` → `rgb(5,5,5)` → `rgb(5,5,5)`. **Os valores (`btnPrimaryText`, status, `btnStyleType`) não eram o defeito**; nenhum limiar mudou. Em `contraste-do-que-faltava.spec.ts` e `modo-claro-legivel.spec.ts` o `withScene` passou a esperar as `CSSTransition` terminarem antes de medir. Resultado: 25/25 dos dois arquivos (botão de sair, `cyberpunk` primário/perigo/sucesso e badge suave de sucesso, que eram as 5 falhas).
2. **`frosted` × `matte`.** Decisão: **o padrão fica `frosted`** (é a ficha do tema padrão) e a doc passa a dizer a verdade. `schema/buttons.ts`: o `usage` dos três `actionGlowShadow*` agora diz "`matte`, que não é o padrão do tema padrão: o `frosted` o apaga". `arsenal-lote4.spec.ts` e `fixtures/harness-entry.tsx`: o caso P10 fixa `btnStyleType: 'matte'` nos temas `acao-brilho-base/-y/-desfoque/-espalhamento`, e o cabeçalho do spec diz o mesmo. P10 passa.
3. **Texturas (4 falhas).** Causa: o padrão novo `cardTextureType: 'micro-dots'` está no ancestral raiz, e o caso põe a textura X num invólucro (`[data-sx-card-texture-type="X"] .sarak-card::after`); as duas regras de ancestral têm a mesma especificidade e a que vem **depois no `_atmosphere.css`** vence, então `micro-dots` ganha de `stripes`, `carbon`, `brushed` e `frosted` (declaradas antes) e perde das demais. O CSS não soma camadas; o caso media com o padrão do tema por baixo. Correção no caso: dois temas de cena, `textura-limpa` e `tema-claro-textura-limpa` (`cardTextureType: 'none'`), usados em `texturas-cor` (`arsenal-restante-desenha.spec.ts`) e `texturas-claras` (`token-que-desenha.spec.ts`). Nenhum CSS alterado; ver achado abaixo.
4. **Ícone da busca borrado.** Causa medida no código: em `SarakInput.tsx` o `div` do ícone vem **antes** do `<input>` no DOM e é `absolute` sem camada; o padrão novo `inputBackdropBlur: 8` põe `backdrop-filter: blur(8px)` no campo, que desfoca tudo atrás dele, o ícone inclusive. Correção: `ICON_SIDE_CLASS` ganhou `z-10` (`SarakInput.tsx:69-71`, com comentário). Captura nova `sarak-sovereign__dark__sidebar__desktop__telas.png` (vitrine contra `src/`), aberta e recortada em dois pontos: na busca da sidebar ("Busca inteligente", lupa pequena e nítida, ao lado do atalho CTRL K) e no campo "Buscar ferramenta, registro ou config…" dos cartões, a lupa nítida à esquerda do texto. Dois snapshots (`SarakSearchCard`, `PreviewCanvas`) mudaram só a classe `z-10` do ícone.
5. **Casos que fixavam o padrão antigo.** Cada caso, entrada e valor:
   - `arsenal-restante-desenha:348, 413`: `PRIMARY_RGB` `0, 242, 255` → `25, 227, 240` (a primária do `sarak-sovereign`).
   - `cascata-que-cede:80`: o caso media `catalogSectionRadius: 1` (1rem); `bodySize` padrão é 14px, então 1rem = 14px = o raio novo do cartão e o caso deixou de distinguir. O tema da cena passou a `catalogSectionRadius: 2` (28px; o padrão é 3rem); a reserva de referência do caso virou `10px`.
   - `schema-que-desenha:228` (`tableBorderRadius`): `12px` → `14px`; `:284` (peso da marca): `700` → `800`.
   - `transicao-padrao-do-tema:87` (as duas): `DEFAULT_EASE` `cubic-bezier(0.4, 0, 0.2, 1)` → `cubic-bezier(0.16, 1, 0.3, 1)`.
   - `componente-le-o-token:129, 151, 162` e `residuo-da-reauditoria:102`: **a causa não era só o valor**: os `className` das sondas (`bg-[var(--color-theme-card,rgba(15,23,42,0.6))]`, `hover:bg-[var(--sarak-btn-primary-bg,#00f2ff)]`, `hover:border-[color-mix(…#00f2ff…)]`) são classes que o Tailwind só gera se algum arquivo de `src/` citar o texto exato, e o `fix-fallbacks` trocou essas reservas em `src/`; a classe antiga deixou de existir no CSS e a sonda ficou sem estilo. As sondas e as expressões do caso agora usam `#101622` e `#19e3f0` (e `1106`, `css-que-so-o-navegador-mede:273`). `residuo-da-reauditoria:102` ("sem Provider, o cartão é a cor do token"): `rgba(15, 23, 42, 0.6)` → `rgb(16, 22, 34)` (o token é opaco, a "translúcida" saiu do título).
   - `componente-le-o-token:202` (`glow-only`): o padrão do tema agora **já é** `glow-only`, então a contraprova "lift" medida com `undefined` media `glow-only`. Criei o tema de cena `componente-lift` e a contraprova o usa.
   - `schema-que-desenha:117, 137` (`cardHoverTranslate`, `cardHoverGlowIncrease`): o padrão `glow-only` não move o cartão, e o caso media o deslocamento no padrão. `schema-cartao` passou a fixar `cardHoverStyle: 'lift'`; criei `schema-hover-lift` para o "padrão" do deslocamento (−2 do token); o brilho esperado virou `0,75` (intensidade base 0,25 do tema padrão + 0,5 do caso) e o do contêiner `0,25` (a base; o aumento não o alcança).
   - `arsenal-lote5:120` (P14) e `schema-que-desenha:303` (`btnGhostHoverBg`): não falharam no meu build; a medição de hover dos dois depende de espera fixa (ver abaixo).
   - **Medição de hover com espera fixa** (`componente-le-o-token:202`, `schema-que-desenha:139` e `:307`): na bateria "depois" mediram 0,9876 em vez de 1, 0,687 em vez de 0,75 e o fundo do ghost ainda transparente. Em página assentada o brilho chega a 0,99 em 547 ms e o ghost aplica o fundo em 300 ms; as falhas eram a transição de hidratação ainda em curso. O `withScene` desses dois arquivos passou a esperar as `CSSTransition` terminarem. Reexecutados: 42/42.

**Arquivos alterados nesta correção**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Inputs/SarakInput.tsx` | alterado | `z-10` no ícone do campo (achado 4) |
| `src/core/Design/schema/buttons.ts` | alterado | `usage` dos três `actionGlowShadow*` (achado 2) |
| `src/components/atomic/Cards/__tests__/__snapshots__/SarakSearchCard.test.tsx.snap`, `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | só a classe `z-10` |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | temas de cena novos (`acao-brilho-base`, `textura-limpa`, `tema-claro-textura-limpa`, `componente-lift`, `schema-hover-lift`), `schema-cartao` com `lift`, `catalogSectionRadius` 2, classes das sondas, comentários |
| `browser-tests/{arsenal-lote4,arsenal-restante-desenha,token-que-desenha,cascata-que-cede,componente-le-o-token,residuo-da-reauditoria,schema-que-desenha,transicao-padrao-do-tema,css-que-so-o-navegador-mede,contraste-do-que-faltava,modo-claro-legivel}.spec.ts` | alterado | valores esperados e espera de transição, conforme acima |
| esta plan | alterado | este bloco e o `status` |

**Verificações executadas**
- Bateria do navegador, antes e depois (acima); reexecução de `componente-le-o-token` + `schema-que-desenha` (42/42), `contraste-do-que-faltava` + `modo-claro-legivel` (25/25), `cartao-cede-a-classe` + `leitores-que-faltavam` (30/30).
- `npx vitest run src gates --reporter=dot` → 476 arquivos; 2 falharam só por snapshot do `z-10`, atualizados com `-u` e conferidos no diff (só a classe) e relidos: 8/8 nos dois arquivos.
- `npm run verify -- --tier=quick` → tudo `[OK]` (`tsc`, baseline com `tsc`, Anel 1, Anel 0: 2.260 linhas, 0 achado) **exceto `token-types:check`**: o texto novo do `usage` de `buttons.ts` defasou `src/core/Provider/generated/design-token-docs.json` (gerado, do revisor).

**Critérios de aceite**
- [x] Achados 1 a 5 tratados, cada caso com entrada e valor acima.
- [x] Bateria do navegador entregue, antes (346/376) e depois (372/376; os 3 de hover corrigidos e reexecutados).
- [x] Captura nova da vitrine, aberta e descrita (achado 4).
- [ ] `token-types:check` (e o que o `guide` carimba de `usage`): pendente, gerado.

**Decisões e suposições**
- Achado 1: tratei como defeito de medição (transição em curso), porque a medição pós-assentamento mostra o corpo opaco e os valores passam. Se o revisor preferir que a lib **não** faça a transição de entrada do fundo do corpo, é outra decisão (fora do escopo).
- Achado 2: o padrão não volta a `matte`; a ficha pede `frosted`.
- Achado 3: preferi não mexer na ordem do CSS das 41 texturas; a disputa só ocorre com ancestrais com texturas diferentes e o cartão real carrega o próprio atributo.
- O harness temporário injeta o CSS no bundle como o `inject-css` (sem isso o modo embarcado e a leitura de camadas falham em `file://`); é só do build temporário.

**Achados fora do escopo (não corrigidos)**
- Disputa de textura entre ancestrais (`_atmosphere.css`): com mais de um `data-sx-card-texture-type` no caminho, vence a regra declarada por último, não a do ancestral mais próximo; hoje o padrão `micro-dots` expõe isso ao painel de customização (pré-visualização aninhada de um tema com outra textura).
- A transição do `background-color` do corpo na hidratação faz o fundo sair de transparente (`getComputedStyle` lê `rgba(0,0,0,0)` por alguns quadros): é o que causou a leitura errada nos casos de contraste.

**Pendências / riscos**
- Gerados defasados: `src/core/Provider/generated/design-token-docs.json` (`npm run token-types`) e o que o `guide` carimba (`sarak-ui/*`, apêndice do GUIA); `dev-kit` pode carimbar contagens.
- A bateria inteira depois da última correção só foi reexecutada nos arquivos tocados; o revisor confirma uma vez contra o `dist/`.
- `gantt-altura-e-contraste:159` segue intermitente (conhecida).

## Veredito — 2026-10-18 — correção 1 (lote 6) — 🔴 Reprovado (1 achado, pequeno)

**O que está certo (conferido contra o `dist/` reconstruído):** `verify --tier=full` verde (`tsc`, suíte completa, baseline,
Anel 1, R36, Anel 0: 2.331 linhas, 0 achados); `npm run build` verde; `boot:measure` **`[OK]`** — boot 342,3 KB e
`sarak-sovereign` 3,4 KB contra o teto por tema de 4,5 KB; bateria do navegador: **374 de 376**. Das 28 falhas do veredito
anterior, 26 fecharam: legibilidade (as medições liam o corpo no meio da transição de hidratação; os valores estavam
certos), textura (os casos agora usam um tema de cena com `cardTextureType: 'none'`), os casos que fixavam o padrão antigo e
o P10 (que passou a fixar `btnStyleType: 'matte'`, com o `usage` dizendo a verdade). **Achado 4 conferido:** abri a captura
nova da vitrine gerada contra o `dist/` — a lupa do campo "Busca inteligente" e a dos campos "Buscar ferramenta…" saem
**nítidas** (o `z-10` no ícone de `SarakInput` resolveu o desfoque).

**Achado 1 — `arsenal-lote4.spec.ts:124` (P11: `colorDepth`/`colorVariation` alteram o hover e o pressionado) falha 3 vezes em 3**
contra o `dist/` (`Expected: not "rgba(0, 0, 0, 0)"`: o fundo do botão em hover e pressionado ainda é transparente aos 250
ms, tanto na base quanto nos extremos, então a comparação não distingue nada). É a mesma causa que o executor achou e
corrigiu em `componente-le-o-token`, `schema-que-desenha` e nos casos de contraste — o `hover()` logo depois da
hidratação, com as `CSSTransition` do corpo e do botão ainda em curso — mas **o `arsenal-lote4.spec.ts` ficou de fora** (no
build temporário do executor passou por folga de tempo; no `dist/`, não). **Correção:** o `measure`/`openScene` desse spec
espera as `CSSTransition` terminarem antes de medir, como nos outros specs (mesma forma, sem nova espera fixa), e prova
**três execuções seguidas verdes** do arquivo. Revisar no mesmo gesto os outros specs que fazem `hover()`/`mouse.down()` e
lêem `background-color` com espera fixa (`arsenal-lote5.spec.ts`, `toque-no-celular.spec.ts`, `cromo-css-real.spec.ts`) e
aplicar a mesma espera onde faltar.

**Para o `00-backlog` (feito):** (40) a transição de entrada do `background-color` do corpo na hidratação faz o fundo sair de
transparente (`getComputedStyle` lê `rgba(0,0,0,0)` por alguns quadros): é a raiz das leituras erradas de contraste e
convém decidir se a lib deve fazer essa transição; (41) disputa de textura entre ancestrais em `_atmosphere.css`: com mais de
um `data-sx-card-texture-type` no caminho vence a regra declarada por último, e o padrão `micro-dots` expõe isso à
pré-visualização aninhada do painel.

**Já resolvido na rodada (para constar):** o teto de peso por tema (4,5 KB) foi por prompt direto e está aprovado.

**Status: 🔵 Em correção.**

## Resumo da execução (correção 2) — lote 6 — 2026-10-18

**Resultado:** Concluído. Escopo: só o achado único (P11 de `arsenal-lote4.spec.ts` falhando contra o `dist/`).

**Reprodução (build temporário fora do repositório:** cópia da árvore no scratchpad, `esbuild` com alias para `src/index.ts` e CSS injetado no bundle, CSS por Tailwind, Chromium de `node_modules/.cache/ms-playwright` por caminho absoluto, `chromium.launch()` sem `executablePath`; nada de guide, dev-kit, token-types nem build do repositório). Sem carga, P11 passa 3 em 3 (o que o executor viu). Com 8 processos ocupando a CPU, **falhou 1 de 3** com o mesmo erro do veredito (`Expected: not "rgba(0, 0, 0, 0)"`): é a corrida da hidratação, o `hover()` e a espera fixa de 250 ms contra as `CSSTransition` do botão e do corpo ainda em curso. Era a única das duas formas de `openScene`/`withScene` desses specs sem a espera.

**O que foi feito**
- `browser-tests/arsenal-lote4.spec.ts` (`openScene`) e `browser-tests/arsenal-lote5.spec.ts` (`withScene`): depois do `waitForFunction` do atributo, esperam as `CSSTransition` terminarem (`document.getAnimations().filter(CSSTransition).map(finished)`), a mesma forma dos outros specs, sem espera fixa nova.
- Revisão dos outros specs com `hover()`/`mouse.down()`: `cromo-css-real.spec.ts` (`:702`, `:714`) lê com `toHaveCSS`, que repete até 5 s, e a leitura em repouso vem antes do `hover()`: não precisa; `toque-no-celular.spec.ts` não faz `hover()` nem lê `background-color` com espera fixa: não precisa; `arsenal-lote5.spec.ts` recebeu a espera (a leitura de opacidade da saída já esperava `opacity === '1'`).

**Verificações executadas** (build temporário, 6 arquivos: `arsenal-lote4`, `arsenal-lote5`, `componente-le-o-token`, `schema-que-desenha`, `contraste-do-que-faltava`, `modo-claro-legivel`, 88 casos)
- **Três execuções seguidas sem carga: 88/88, 88/88, 88/88.**
- **Três execuções seguidas sob carga (8 processos de CPU):** P11 e os casos de hover/contraste verdes nas três; em duas delas falhou **um** caso de `arsenal-lote5.spec.ts:123` ("P14: … motionEaseIn muda a opacidade no meio da saída"), que amostra a opacidade quadro a quadro com `requestAnimationFrame` e perde precisão quando a CPU segura os quadros. Não é o achado nem mexe em hover; não alterei.

**Arquivos alterados:** `browser-tests/arsenal-lote4.spec.ts`, `browser-tests/arsenal-lote5.spec.ts`, esta plan.

**Decisões e suposições:** a carga sintética (8 laços de CPU) foi o jeito de reproduzir no build temporário a folga de tempo que o `dist/` não tem; a mutação é a própria versão anterior do spec (3 execuções com carga: 1 falha).

**Achados fora do escopo (não corrigidos)**
- `arsenal-lote5.spec.ts:123` (P14, `motionEaseIn` no meio da saída) é sensível à carga da máquina (falhou 2 de 3 execuções sob 8 processos); amostragem por `requestAnimationFrame` com meta de 250 ms.

**Pendências / riscos:** a confirmação contra o `dist/` é do revisor; os gerados defasados da correção 1 (`token-types`, o que o `guide` carimba) seguem como estavam.

## Veredito — 2026-10-18 — correção 2 (lote 6) — 🟢 Aprovado; lote 6 fechado

**Conferido:** `arsenal-lote4.spec.ts` (`openScene`) e `arsenal-lote5.spec.ts` (`withScene`) passaram a esperar as
`CSSTransition` terminarem antes de medir, na mesma forma dos outros specs, sem espera fixa nova; o executor revisou
`cromo-css-real` e `toque-no-celular` e justificou que não precisam (leitura por `toHaveCSS`, que repete, e sem `hover()`).
**Medido por mim contra o `dist/` reconstruído:** os seis arquivos do achado (`arsenal-lote4`, `arsenal-lote5`,
`componente-le-o-token`, `schema-que-desenha`, `contraste-do-que-faltava`, `modo-claro-legivel`) rodados **três vezes
seguidas: 88/88, 88/88, 88/88**, incluindo o P11 que falhava 3 em 3. O diff de `src/` não mudou desde a verificação
completa da correção 1 (`full` verde, build verde, `boot:measure` `[OK]` com o `sarak-sovereign` em 3,4 KB contra 4,5 KB), então
essa verificação segue valendo.

**Fora do escopo → backlog 42:** `arsenal-lote5.spec.ts:123` (P14, curva `motionEaseIn` no meio da saída) amostra a opacidade
quadro a quadro e falhou 2 de 3 sob uma carga sintética de 8 processos; passou nas minhas rodadas com a máquina em uso
normal. Endurecer pela Web Animations API se voltar a aparecer.

**Lote 6 fechado.** O `sarak-sovereign` está refeito nos dois modos; os padrões estéticos são os dele; teto por tema de
4,5 KB; a trava de completude acusa 13 temas em exceção. **Próximo: lote 7** (`cyberpunk-neon`, o primeiro dos 13 temas
atuais), nível `themes` na verificação.

**Status: 🔴 A executar (lote 7).**

## Resumo da execução — lote 7 — 2026-10-18

**Resultado:** Concluído com pendências (gerados defasados para o revisor; quatro achados de arsenal e de documentação; a skill `dataviz` não existe neste repositório).

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-110-temas-que-mostram-a-biblioteca.md
```
(Os dois são do revisor e já não aparecem no `git status` de agora; não os toquei, só acrescentei este bloco.)

**O que foi feito**
- **7.0 (a)** `.agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts`: o import `getDefaultDesignState` (inexistente) virou `sarakGetDefaultDesignState`. A leitura do tema saiu de `main()` para `loadMergedDesign(id, opposite)` (exportada) e a CLI ganhou `--contraparte`. Teste novo em `solve_theme_contrast.test.ts` (2 casos). Mutação: trocando a chamada por `getDefaultDesignState`, o teste falha com `getDefaultDesignState is not a function`; antes o teste da skill passava mesmo com o import quebrado, porque o erro só estoura na chamada. **Resolve:** o design do tema sobre os padrões do dicionário (e a contraparte por cima), deslocando só a luminosidade do texto que reprova. **Não resolve:** cadeia `var()` (par pulado), fundo, matiz, saturação, contraste não textual.
- **7.0 (b)** `SKILL.md` §5.7 nova: ordem de trabalho; medidor não atravessa `var()`; derivados repetidos; `{mob,tab,desk}`; `identityFontFamily` de `THEME_FONTS`; grade do `step`; leitura de contraste só depois da hidratação. **7.0 (c)** a skill não citava `#00f2ff`, `matte`, `grid` nem `none` de textura (conferido por grep); o que estava desatualizado era o gabarito: acrescentei que ele escreve todo token (funcional inclusive), não traz contraparte, importa o tipo inexistente `ThemePreset`, e que o ponto de partida real é o `sarak-sovereign.ts`.
- **7.1/7.2** `cyberpunk-neon.ts` refeito do `sarak-sovereign.ts` pela ficha §7.2: 300 estéticos no modo principal e 104 + `mode` na contraparte, nenhum funcional; comentários nos valores não óbvios. Fontes `JetBrains Mono` / `Space Grotesk` (valor exato). Removida a entrada `cyberpunk-neon` de `themeCompletenessPending.json`. `themes:catalog` regenerado.
- **Nota de conceito** no anexo (§11), nota MAJOR em `docs/migracoes.md` (`## 8.0.0`), uma frase no GUIA §6.5.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/cyberpunk-neon.ts` | alterado | tema completo nos dois modos |
| `src/core/Design/presets/themes/catalog.generated.ts` | alterado | amostra de cor do tema |
| `gates/allowlists/themeCompletenessPending.json` | alterado | −`cyberpunk-neon` |
| `.agents/skills/ui-criar-tema/SKILL.md`, `scripts/solve_theme_contrast.ts`, `scripts/__tests__/solve_theme_contrast.test.ts` | alterado | 7.0 e 7.5 (`.claude/skills` é o mesmo conteúdo, symlink) |
| `sarak-ui/GUIA-FRONTEND.md`, `docs/migracoes.md`, `specs/plan/anexos/plan-110-direcao-de-arte.md` | alterado | armadilha do `cyberpunk`, nota MAJOR, nota de conceito |
| esta plan | alterado | este bloco e o `status` |

**Verificações executadas**
- `npm run verify -- --tier=themes` → `themes:catalog:check`, `theme-completeness:check` ("2 de 14 completos; 12 em exceção"), `theme-boot`, vitest de `presets/themes/__tests__`, `Provider/utils/__tests__` e `Design/util` (tokenContractParity e shippedThemesConsoleClean inclusos), `themes:diversity`, `boot:measure` ("maior tema: sarak-sovereign 3,4 KB, teto 4,5"), `audit:baseline`, `plan-index:check`, `dev-kit:check` e Anel 0 (640 linhas, 0 achado) **[OK]**; **`guide:check` [FAIL]**: gerado defasado (`sarak-ui/docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md`), é do revisor.
- A 1ª rodada de `tokenContractParity` reprovou 3 valores (`sidebarNoiseOpacity` e `topbarNoiseOpacity` 0,04; `cardSpotlightOpacity` 0,14: fora da grade de 0,05); corrigidos para 0,05/0,05/0,15 e a suíte passou.
- `npx vitest run src/components/Layout` (inclui a varredura de hover do `SarakMenuItem`) → verde; `.agents/skills/ui-criar-tema` → 8/8.
- `auditor_contraste` (R31): 0 par reprovado, 0 pulado, nativo e oposto. `auditor_presets`: 0 órfã.
- Não rodei guide, dev-kit, token-types, build, nem a suíte completa.

**Contraste textual por modo** (valor concreto, `verify_contrast.PAIRS`, 76 pares por modo, nenhum pulado)
| Modo | Menor razão | Os mais baixos |
|---|---|---|
| escuro | 5,52 | `statusErrorColor`/cartão 5,52 · `on:statusErrorColor` 5,79 · `statusErrorColor`/corpo 5,85 · `textColorMuted`/`tableHeaderBg` 6,06 |
| claro | 4,61 | `navItemActiveColor`/item ativo 4,61 (sidebar e topbar) · `statusSuccessColor`/corpo 4,79 · `textColorMuted`/`btnSecondaryBg` 4,79 · `primaryColor`/corpo 4,94 |

**Contraste não textual (3:1, apoio, não gate):** escuro: foco do campo 6,4; marcador do item ativo 15,3; trilho do interruptor 15,0; borda do campo 4,2; borda do cartão 3,5; séries 6,0 a 17,1. Claro: foco 5,7; marcador 5,5; trilho 4,9; borda do campo 3,6; séries 5,4 a 6,3; **borda do cartão 2,9 (abaixo de 3, deliberado: contorno fino de papel)**. Séries vizinhas (1–2, 2–3, 3–4) se distinguem por matiz; razão de luminosidade 2,36/2,85/2,85 no escuro e 1,16/1,17/1,06 no claro. Paleta validada pelas regras do anexo (A8: as cores de status não entram como série no código atual; 3:1 não textual), **não pela skill `dataviz`, que não existe aqui**.

**Peso** (método §4.1, `esbuild` minify + `gzip -9` do arquivo): `cyberpunk-neon` **3.472 B gzip** (raw 11.652 B), 77% do teto de 4,5 KB.

**Capturas** (Chromium headless, `PLAYWRIGHT_BROWSERS_PATH` absoluto, `chromium.launch()` sem `executablePath`, bundle de `src/` e CSS por Tailwind em scratchpad fora do repositório, fontes lidas de `dist/fonts` só para leitura; 10 imagens, 0 falha; a vitrine contra o `dist/` é do revisor). **Abri** as do escuro desktop (telas), claro desktop (telas), topo escuro desktop, celular escuro (telas) e modal claro no celular, mais recortes. Contra a nota de conceito:
- *Escuro, desktop:* fundo quase preto esverdeado; barra lateral ainda mais escura com borda verde fina; H1 "TÍTULO DE VITRINE" em mono maiúsculo com brilho verde; botões wireframe quadrados (primário, contorno e fantasma verdes, perigo em vermelho-rosa, sucesso em menta); campos quadrados com borda verde e fundo verde-escuro; selos com forma legíveis; cartões com **quina cortada**, borda verde e linhas de scanline discretas; tabela com cabeçalho em botões quadrados; gráfico de linha verde sem suavização; calendário com "hoje" em bloco verde; bolha do chat em verde sólido com texto escuro. Coerente com a nota: néon ácido, quina, mono, wireframe.
- *Claro, desktop:* corpo `#eef5ef`, cartões brancos com a mesma quina cortada e borda verde-papel, botões wireframe em verde escuro, mono maiúsculo nos títulos sem brilho; selos sólidos legíveis; mantém a identidade (corte, mono, wireframe).
- *Topo:* cromo horizontal com marca mono, busca, itens com realce verde, seletores P/M/G e Lateral/Topo com o ativo em verde sólido.
- *Celular:* menu hambúrguer quadrado, botões e campos em largura total, cartões com corte empilhados, modal claro com cabeçalho mono maiúsculo e botão "Confirmar" wireframe.
- **O que a captura mostra e não é como a ficha pede:** o ícone do botão de ícone do cartão (canto do "Ver mais") sai **invisível** nos dois modos (achado 1); o fundo da página não mostra o `circuit-pro` nem o `systemTone` (o `main` e o cromo pintam camadas opacas por cima); o item ativo da lateral tem cantos arredondados que nenhum token de raio que declarei remove.

**O que o tema ensinou** (7.5)
| Item | Tipo | Onde foi gravado |
|---|---|---|
| Import do solucionador quebrado passava no teste, que só chamava outra função; `loadMergedDesign` + teste com mutação; `--contraparte` | armadilha | skill (§5 e teste) |
| O solucionador não atravessa `var()` nem mede 3:1; o que resolve | decisão | skill §5 |
| Gabarito escreve funcionais, sem contraparte, e importa `ThemePreset` (inexistente) | armadilha | skill §2 |
| Ordem de trabalho; contraparte só com `modeDependent`; `texture`/`cardTextureType` não carregam modo | receita | skill §5.7 |
| Derivados repetidos, `{mob,tab,desk}`, `identityFontFamily`, grade do `step` (0,05), hidratação | receita/armadilha | skill §5.7 |
| `cyberpunk` é wireframe: `btnNeonPulseSpeed` não desenha; o ícone do botão de ícone some | armadilha | skill §5.7, GUIA §6.5, nota MAJOR, nota de conceito |
| `cardGeometricCut` recorta borda diagonal e sombra | armadilha | skill §5.7 |
| `cyber-binary` pinta com a primária, opacidade fixa 0,05 (a ficha dizia "branco fixo") | armadilha | skill §5.7, nota de conceito |
| Fundo opaco do cromo/`main` cobre a textura da página | armadilha | skill §5.7, nota de conceito |
| `cardTitleFontWeight` sem `800` | armadilha | skill §5.7 |
| Sucesso em matiz vizinho da primária verde | decisão | skill §5.7, comentário no tema |
| Borda translúcida compõe sobre o corpo para o 3:1 | receita | skill §5.7 |
| Contraste textual (mín. 5,52 escuro, 4,61 claro), não textual e peso 3.472 B | medida | esta tabela e a nota de conceito |

**Critérios de aceite**
- [x] Tema completo nos dois modos e fora da exceção — `theme-completeness:check` verde, "2 de 14 completos".
- [x] Contraparte troca só o que carrega modo — a trava (`contraparte-declares-fixed-aesthetic`) não acusa.
- [x] Fontes pelo valor exato; seis idiomas; posições de preferência e funcionais não declarados — completude e `tokenContractParity`.
- [x] Contraste R31 nos dois modos; hover de navegação — `auditor_contraste`, varredura do `SarakMenuItem`.
- [x] Peso 3.472 B gzip, abaixo de 4,5 KB.
- [x] 7.0 e 7.5 — skill, teste e tabela acima.
- [ ] `guide:check` — pendente: gerado, do revisor. Vitrine contra o `dist/` — do revisor.

**Decisões e suposições**
- Ficha revista pelo código: `texture: circuit-pro` nos dois modos (a ficha trocava `cyber-binary` por `circuit-pro` na contraparte, que `texture` não permite); `btnNeonPulseSpeed: 0`; `systemTone: cyber` (a ficha não o dava a este tema).
- Terciária `#4d8dff` e sucesso `#1de9b6` são escolhas minhas (a ficha só dá três cores). `switchStyleType: asymmetric` por distinção; o polegar oval fica pouco visível com o interruptor desligado no escuro.
- `colorBgModal` concreto (não `var(--theme-surface)`) para o par ser medido.
- Borda do campo e do cartão no claro foram escurecidas (`#5a8a6b` e `#6f9a7e`) depois de medir 2,87:1 e 1,73:1.

**Achados fora do escopo (não corrigidos)**
1. `src/components/atomic/Buttons/SarakIconButton.tsx:137`: no estilo `cyberpunk` o fundo vira transparente mas o texto da variante primária fica `btnPrimaryText`, então o ícone some (`SarakButton` evita isso com `CYBERPUNK_TEXT_COLORS` em `useAtomicStyles.ts:16`). Candidato à tabela da §5.1 da `plan-117`.
2. `.agents/skills/ui-criar-tema/scripts/generate_theme_template.ts`: escreve todo token (funcional inclusive), sem contraparte, e importa `ThemePreset`, que não existe (`SarakThemePreset`).
3. O item ativo/hover da lateral mantém cantos arredondados com todos os raios do tema em 0; `texture` e `systemTone` mal aparecem por causa das camadas opacas do cromo e do `main` (visto no lote 6 com `constellation`).
4. `cyber-binary` (`_atmosphere.css`): opacidade fixa 0,05 e uma linha de 28 caracteres, praticamente invisível. A ficha e o §3.3 do anexo estão errados ao chamá-la de "branco fixo".

**Pendências / riscos**
- **Gerados defasados (revisor regenera):** `sarak-ui/docs/migracoes.md`, o apêndice do GUIA e o que o `guide` carimba (`npm run guide`); `dev-kit:check` passou.
- Os outros 12 temas na exceção seguem herdando os padrões do `sarak-sovereign` até o lote de cada um.
- A tipografia real e as capturas contra o `dist/` são do revisor.

## Veredito — 2026-10-18 — lote 7 (`cyberpunk-neon`) — 🟢 Aprovado

**Conferido:** `cyberpunk-neon.ts` refeito do `sarak-sovereign.ts` pela ficha: 300 estéticos no modo principal e 104 + `mode`
na contraparte, nenhum funcional, fontes pelo valor exato (`JetBrains Mono`/`Space Grotesk`); saiu da exceção da trava
(`theme-completeness:check`: 2 de 14 completos). Regenerei `token-types`, `guide`, `dev-kit` e `plan-index`; `npm run
build` real verde; **nível `themes` verde**: catálogo, completude, fecho do boot, vitest de `presets/themes`, `Provider/utils`
e `Design/util` (`tokenContractParity` e `shippedThemesConsoleClean` inclusos), `themes:diversity`, `boot:measure`, baseline,
kits e Anel 0 (754 linhas, 0 achados). Contraste: o executor mediu os 76 pares por modo com valor concreto (mín. 5,52:1 no
escuro e 4,61:1 no claro) e `auditor_contraste` fecha com 0 reprovado e 0 pulado. Peso: 3.472 B gzip (77% do teto de
4,5 KB). Passo 7.0: o solucionador de contraste da skill voltou a funcionar (o import quebrado passava no teste antigo
porque ele só chamava outra função; agora há teste com mutação) e a `ui-criar-tema` ganhou a §5.7 com as lições do
`sarak-sovereign`. A tabela "o que o tema ensinou" (7.5) traz 13 itens, cada um com destino gravado.

**Capturas — abri as geradas contra o `dist/` real** (`cyberpunk-neon__dark__sidebar__desktop__telas.png` e
`__light__`): escuro — fundo quase preto esverdeado, barra lateral mais funda com borda verde, título em mono maiúsculo com
brilho verde, botões e campos quadrados wireframe, selos legíveis, **cartões com a quina cortada** e borda verde, tabela com
cabeçalho em botões quadrados, gráfico de linha verde sem suavização, "hoje" no calendário em bloco verde, bolha do chat em
verde sólido; claro — corpo `#eef5ef`, cartões brancos com o mesmo corte, botões wireframe em verde escuro, mantendo
corte, mono e wireframe. Distinto do `sarak-sovereign` e fiel à nota de conceito. **O que as capturas mostram e a ficha
não pede:** o botão de ícone do cartão (canto de "Ver mais") sai **vazio nos dois modos** — é o achado 1 do executor,
confirmado (P23 abaixo); o fundo da página quase não mostra `circuit-pro` nem `systemTone` (candidata P24); o item ativo da
lateral mantém cantos arredondados (candidata P25).

**Achados do lote levados ao registro da `plan-117` (§5.1):** **P23** (corrigir: o botão de ícone some no estilo
`cyberpunk`), **P24** e **P25** (candidatas, decisão do dono). O `generate_theme_template.ts` da skill (escreve todo token,
sem contraparte, importa tipo inexistente) vai ao `00-backlog` (43) para o lote 25, onde a `ui-criar-tema` se consolida.

**Lote 7 fechado.** O lote 8 (`industrial-terminal`) espera o lote 7 da `plan-117` (P23): corrige-se antes de o tema
seguinte ser ajustado.

**Status: 🔴 A executar (lote 8, depois da `plan-117`).**

## Veredito — 2026-10-18 — lote 7 reaberto pelo pre-commit — 🔴 Reprovado (1 achado)

O commit foi bloqueado pelo Anel 1: **`variable-contract:check` acusa 10 reservas em `cyberpunk-neon.ts`** cuja reserva difere do
padrão do token (linhas 117, 127, 137, 225, 324, 412, 417, 421, 441 e 484): `var(--sarak-primary-color, #00ff6a)` (padrão
`#19e3f0`), `var(--text-muted, rgba(214,255,224,0.58))` (padrão `rgba(242, 246, 251, 0.55)`) e `var(--color-theme-title,
#eafff1)` (padrão `#f2f6fb`). **A falha é minha também:** aprovei o lote 7 com o nível `themes` do `verify`, que **não inclui o
`variable-contract:check`** (ele está no Anel 1, que só o `quick` e o `full` rodam); o gate lê os arquivos de tema e o
executor, que seguiu o prompt (`--tier=themes`), não tinha como vê-lo. O furo do `verify` vai por prompt direto separado.

**Achado 1 — reservas de cadeia `var()` no tema com a reserva errada.** O tema repete a cadeia derivada
(`var(--sarak-primary-color, …)`, `var(--text-muted, …)`, `var(--color-theme-title, …)`) para quem troca só a primária — a
lição certa do lote 6 —, mas escreveu como reserva o valor **do próprio tema** (`#00ff6a`, `rgba(214,255,224,0.58)`,
`#eafff1`). A regra do contrato (`02` §4 e §9.1) é que a reserva de `var(--x, F)` é o **padrão do token `x`** no schema, em
qualquer arquivo. **Correção:** nas dez linhas, a reserva passa a ser o padrão atual do token (`#19e3f0`, `rgba(242, 246, 251,
0.55)`, `#f2f6fb`; confirme em `variable-contract:check` ou com a ferramenta `fix-fallbacks.ts`, que reescreve a reserva
sem tocar no valor concreto do tema); a cor visível do tema continua a do próprio `primaryColor`, `textColorMuted` e
`titleColor` declarados nele, pois a cadeia só cai na reserva se a variável faltar. **Registre a lição na `ui-criar-tema`**
(§5.7, a linha dos "derivados repetidos"): a reserva de uma cadeia repetida no tema é o padrão do token, nunca o valor do
tema — e o `variable-contract:check` é o gate que a acusa. **Prova:** `npm run variable-contract:check` verde, `npm run verify
-- --tier=quick` verde, e a vitrine do tema sem mudança visível (descreva em duas frases).

**Status: 🔵 Em correção.**

## Resumo da execução (correção 1) — lote 7 — 2026-10-18

**Resultado:** Concluído. Escopo: só o achado 1 (reservas de cadeia `var()` com o valor do tema em vez do padrão do token).

**Achado 1 — reservas.** `variable-contract:check` antes: `[ERROR] 10 reserva(s) diferente(s) do padrão do token` (linhas 117, 127, 137, 225, 324, 412, 417, 421, 441, 484 de `cyberpunk-neon.ts`). Troquei, por substituição exata e só dentro das cadeias: `var(--sarak-primary-color, #00ff6a)` → `…, #19e3f0)` (3 ocorrências: `cardActionBtnPrimaryBg` e `aiGlowColor`, principal e contraparte); `var(--text-muted, rgba(214,255,224,0.58))` → `…, rgba(242, 246, 251, 0.55))` (4: `cardSearchPlaceholderColor` e `inputIconColor`, nos dois blocos); `var(--color-theme-title, #eafff1)` → `…, #f2f6fb)` (2: `tooltipTextColor`, nos dois blocos). O diff do arquivo é 10 linhas trocadas por 10, nenhum valor concreto tocado. Não usei `fix-fallbacks.ts` (reescreve em `src/` inteiro; as dez linhas eram exatas).

**Skill:** `.agents/skills/ui-criar-tema/SKILL.md` §5.7, linha dos derivados repetidos: a reserva de uma cadeia repetida é o padrão do token `x`, nunca o valor do tema; `variable-contract:check` (Anel 1, fora do nível `themes`) a acusa e `fix-fallbacks.ts` a reescreve.

**Verificações executadas**
- `npm run variable-contract:check` → `[OK] um dono por variável; 3949 leituras com dono; 2920 reservas conferidas contra o padrão.`
- `npm run verify -- --tier=quick` → **tudo `[OK]`** (`tsc`, `audit:baseline --with-tsc`, 25 `*:check` do Anel 1, `guide:check` e `dev-kit:check` inclusos, Anel 0: 830 linhas, 0 achado). Nada de guide, dev-kit, token-types ou build foi rodado por mim.

**Vitrine:** sem mudança visual, por construção e não por nova captura: a cadeia `var(--x, F)` só cai em `F` se `--x` não existir, e `--sarak-primary-color`, `--text-muted` e `--color-theme-title` são emitidos pelo motor com o `primaryColor`, o `textColorMuted` e o `titleColor` do próprio tema (concretos, intactos). Não gerei captura nova.

**Critérios de aceite**
- [x] Dez reservas = padrão do token — `variable-contract:check` verde.
- [x] Lição na `ui-criar-tema` §5.7.
- [x] `verify --tier=quick` verde.

**Decisões e suposições:** a falha de processo (o nível `themes` não inclui `variable-contract:check`) é do revisor, já registrada por ele; a skill agora diz que o gate existe e onde roda.

**Achados fora do escopo:** nenhum novo.

**Pendências / riscos:** o worktree está com o lote 7 staged (índice do usuário); só alterei o arquivo de trabalho, não o índice. O `SKILL.md` precisará do `git add` para entrar no commit.

## Veredito — 2026-10-18 — correção 1 (lote 7) — 🟢 Aprovado; lote 7 fechado

**Conferido:** o diff do tema nas dez linhas acusadas troca só a reserva das cadeias `var()` pelo padrão do token
(`var(--sarak-primary-color, #19e3f0)`, `var(--text-muted, rgba(242, 246, 251, 0.55))`, `var(--color-theme-title, #f2f6fb)`), sem
tocar no valor concreto do tema; a linha dos "derivados repetidos" na `ui-criar-tema` §5.7 passou a dizer que a reserva é o
padrão do token e que o `variable-contract:check` a acusa. **Medido por mim:** `variable-contract:check` verde ("2.920
reservas conferidas contra o padrão"); `verify --tier=quick` e `--tier=themes` verdes em tudo (Anel 1, `tsc`, baseline,
completude, diversidade, fecho do boot, contrato de valor, Anel 0 com 855 linhas e 0 achados), com a única falha
`plan-index:check` por status divergente, que é desta atualização de veredito (o executor moveu a plan para 🟠) e fecha
ao regenerar o índice. Sem mudança visual: a cadeia só cai na reserva se a variável faltar, e o motor emite as três com os
valores do próprio tema.

**Lote 7 fechado.** O lote 8 (`industrial-terminal`) segue o novo modelo de execução dos lotes de tema (um anexo por tema, sem
`build` nem documentação compartilhada por tema, verificação por lote de temas) assim que o dono confirmar a proposta.

**Status: 🔴 A executar (lote 8).**

## Veredito — 2026-10-18 — lotes 8 a 11 (lote A: `industrial-terminal`, `neo-brutalism`, `synthwave-retro`, `nebula-space`) — 🟢 Aprovado; commit após o lote 9 da `plan-117`

**Conferido:** os quatro temas completos nos dois modos, nenhum funcional, fora da trava (`theme-completeness:check` verde com 6 de 14
completos); anexo de cada tema no formato do modelo (nota de conceito, medições, capturas, o que ensinou, achados). Regenerei o
catálogo (`themes:catalog`) e os kits; `npm run build` verde; `verify --tier=quick` e `--tier=themes` com **uma única falha, a
mesma nos dois**: `channel-dispute:check` (e seu teste): **"synthwave-retro → nebula-space deixa
`--sarak-global-background-image-url` e `--sarak-global-bg-image` no html/body"** — o `synthwave-retro` declara a arte de fundo
embutida e o `nebula-space` declara `globalBackgroundImageUrl: ''`; o motor não limpa a variável do tema anterior na troca.
É **defeito do arsenal** (P26, essencial: o usuário final que troca de tema leva a arte do anterior), não do tema. Vitest de
`Canvas` verde (32 arquivos, 103/103). Contraste textual medido pelo executor (valor concreto, 76 pares por modo, 0 pulado, 0
reprovado): menores razões 4,84/4,76 (`industrial-terminal`), 6,20/4,79 (`neo-brutalism`), 4,51/4,67 (`synthwave-retro`) e
5,06/4,84 (`nebula-space`), escuro/claro; pesos 3.421, 3.346, 4.199 (93% do teto) e 3.569 B gzip.

**Capturas — abri as geradas contra o `dist/`:** `industrial-terminal` escuro desktop (âmbar sobre quase preto, chapa e quina,
cartão de listra, botões só contorno) e claro no topo (papel quente, âmbar-escuro); `neo-brutalism` claro no topo (papel creme, borda
preta grossa, sombra dura deslocada, amarelo e rosa chapados) e escuro; `synthwave-retro` escuro (rosa sobre roxo-noite, a
arte do sol listrado e do horizonte atrás do conteúdo, brilho nos cartões); `nebula-space` escuro (azul-noite com vinheta,
violeta, vidro espesso e raio 24, estrelas nos cartões). Os quatro se distinguem entre si e do `sarak-sovereign` e do
`cyberpunk-neon`. **Limite da captura:** a vitrine contra o `dist/` não carrega as fontes embutidas (o harness não passa `baseUrl`;
os títulos aparecem em reserva), então a tipografia real é a das capturas do executor, que as lê de `dist/fonts` (anexo §3).

**Decisões do revisor sobre os achados (nenhum fica sem dono):**
- **Essenciais, corrigidos agora no lote 9 da `plan-117`:** **P26** (a troca de tema deixa variável da arte de fundo do anterior),
  **P27** (as texturas de página animadas — `nebula`, `stars`, `aurora-flow` — fazem o `scrollWidth` do documento crescer sem parar:
  1440 → 1599 em 35 s; é a decisão pedida do achado 1 do `nebula-space`: **corrigir o motor** e o tema volta à `texture: nebula` da
  ficha), **P28** (a barra de topo estreita os itens de navegação: "Início" vira um filete, "Configurações" vira "Conf" — visto nos
  quatro temas), **P29** (`ShellFontSizeControl` usa a cor do item ativo como fundo e a cor sobre a primária como texto, e fica
  ilegível quando as duas divergem — o `neo-brutalism` teve de contornar).
- **Não essenciais → `00-backlog`:** a textura `carbon` não acompanha o modo e o `usage` de `texture` não avisa (44); o modal
  desenha borda fina e sombra suave, sem token de borda/sombra de modal (45); a arte de fundo se ajusta à altura do conteúdo e
  rola com ele, sem token para fixá-la (46); a vitrine contra o `dist/` não carrega as fontes (47); as fichas do anexo de direção
  tratam como escolha do tema o que a decisão do dono tornou funcional (`mobileNavigationStyle`, `touchTargetMin`,
  `navigationStyle`, `sidebarPosition`) e pedem `3d-tilt`, que não existe: o anexo de direção se reescreve no lote 25 (48).

**Lotes 8 a 11 fechados.** O commit deles espera o P26: o `channel-dispute` bloqueia o pre-commit com os quatro juntos. Os lotes B,
C e D podem seguir em paralelo, porque os temas são independentes do motor.

**Status: 🟡 Em execução (lotes 12 a 24).**

## Veredito — 2026-10-18 — lotes 12 a 15 (lote B: `kinetic-flow`, `cyber-retro-wave`, `blueprint-protocol`, `minimalist-airy`) — 🔴 Reprovado (1 achado)

**O que está certo (conferido):** os quatro temas completos nos dois modos, nenhum funcional (18 a 20 valores funcionais legados
removidos em cada um), fora da trava (`theme-completeness:check` verde, 10 de 14 completos); anexos no formato do modelo com as
capturas salvas em `node_modules/.cache/capturas-dos-temas/<id>/` (copiei as 40 imagens para a pasta do Desktop e atualizei a
galeria); regenerei catálogo e kits. **Abri uma captura de cada tema:** `kinetic-flow` escuro (coral sobre grafite, grade coral de
fundo, títulos pesados, gráfico coral suavizado), `cyber-retro-wave` claro (vidro iridescente prata, azul e verde, botão ciano
elétrico, raios generosos), `blueprint-protocol` claro no topo (papel azul-claro, traço tracejado, mono, azul técnico) e
`minimalist-airy` claro (branco e tinta, primário preto, respiro). Os quatro se distinguem entre si e dos seis anteriores. Contraste
textual (escuro/claro): 4,53/4,63, 4,53/4,67, 4,70/4,67 e 4,89/4,98; pesos 3.528, 3.586, 3.561 e 3.534 B gzip (78 a 80% do
teto). `quick` e `themes` verdes exceto **uma falha, a mesma nos dois: o contrato de valor de tema** (`panel-contract:check` e
`tokenContractParity.test.ts`).

**Achado 1 — 13 valores de tema fora do contrato numérico do token** (o painel regravaria ou a validação cortaria em silêncio):
- `cyber-retro-wave`: `cardGlowIntensity` 0,18 · `cardSpotlightOpacity` 0,12 · `textureOpacity` 0,055 · `vignetteOpacity` 0,12 (fora da
  grade do passo); `btnBorderRadius`, `btnRadiusTL/TR/BL/BR` e `inputBorderRadius` = `{999,999,999}` (fora de min/max: **a faixa
  do token é 0 a 120**, a validação cortaria para a borda).
- `minimalist-airy`: `cardGlowIntensity` 0,18 · `vignetteOpacity` 0,12 (fora da grade).
- `blueprint-protocol`: `motionDurationSlow` 0,32 (fora da grade).
- `kinetic-flow`: sem valor fora do contrato.
O executor deste lote não rodou esses dois checks (a lista de pragmatismo do modelo só os tinha no nível `themes`, que é meu): a
lição já estava nos anexos do lote A ("faixas do contrato que a pílula e os raios esbarram": raio ≤ 120, passos de 0,05) e na
`ui-criar-tema` §5.7. **Correção:** ajustar só os 13 valores para a grade e a faixa do token (múltiplos do passo; raio de pílula
120), sem mudar a intenção do tema; rodar `panel-contract:check` e `tokenContractParity.test.ts` e entregar a saída verde;
reconferir o contraste dos pares afetados se um valor de opacidade subir ou descer. **O modelo da plan agora inclui os dois checks
no ciclo do executor** (§5).

**Achados dos anexos, sem dono ainda:** todos não essenciais. As divergências de ficha (`navigationStyle`, `mobileNavigationStyle`,
`touchTargetMin`, `sidebarPosition`, textura diferente na contraparte, o branco fixo de `wave-pulse`) já estão no backlog 48; o
fato de a `texture` não carregar modo (a ficha do `kinetic-flow` e do `blueprint-protocol` pede outra textura no claro e a
`blueprint-pro` fica sem contraste no papel branco) vai ao backlog 51.

**Status: 🔵 Em correção** (só o achado 1); os temas 12 a 15 não entram em commit antes.

## Veredito — 2026-10-18 — correção 1 (lote B) — 🔴 Reprovado (1 achado, resto da mesma correção)

**O que fechou:** os 13 valores fora do contrato (`cyber-retro-wave`, `minimalist-airy`, `blueprint-protocol`) foram para a grade e a
faixa do token (passos de 0,05, 0,06 e 0,30 s; raios de pílula 999 → 120), com os valores antigos e novos e o R31 nos anexos.
**Medido por mim:** `panel-contract:check` e `tokenContractParity` verdes; `verify --tier=quick` **verde** (Anel 1 inteiro, `tsc`,
baseline, Anel 0 com 2.637 linhas e 0 achados); no `themes` fecham catálogo, completude, fecho do boot, diversidade, peso, baseline e
kits.

**Achado 1 — o teste de caracterização do `minimalist-airy` ainda afirma o tema antigo.** `src/core/Provider/utils/__tests__/
shippedThemesConsoleClean.test.ts`, bloco "Caracterização — minimalist-airy antes/depois da reconciliação (Spec 40.4 L4)": três
asserções vermelhas porque o tema foi reescrito (`motionEaseOut` `cubic-bezier(0, 0, 0.2, 1)`, `navigationStyle` `'topbar'`, que o
tema não declara mais por ser funcional, e o terceiro `expect` do mesmo bloco). É o único teste do repositório que fixa valores de um
tema entregue; os lotes A e os outros temas não têm. **Correção:** atualizar as asserções para o que o `minimalist-airy` é agora,
**sem enfraquecer** o que o teste prova (as chaves descartadas na reconciliação continuam fora do design; cor, tipografia e
cromo do tema, os valores novos), rodar `src/core/Provider/utils/__tests__/shippedThemesConsoleClean.test.ts` e o `themes`
inteiro do `Provider/utils` verdes e entregar a saída. Este arquivo passa a fazer parte do que um lote de tema pode tocar quando o
próprio tema aparece nele (grep do id do tema em `src/**/__tests__` antes de entregar).

**Status: 🔵 Em correção** (só este achado); os temas 12 a 15 não entram em commit antes.

## Veredito — 2026-10-18 — correção 1, segunda rodada (lote B) — 🔴 Reprovado (1 achado, o último conhecido)

**Fechou:** o bloco de caracterização do `minimalist-airy` em `shippedThemesConsoleClean.test.ts` foi reescrito sem enfraquecer (os sete eixos estéticos declarados e
aplicados, as chaves funcionais descartadas fora do design, cor, tipografia e cromo atuais); `src/core/Provider/utils/__tests__`
inteiro verde (17 arquivos, 246 testes).

**Achado 1 — mais um teste que fixa o par de referência: `src/core/Design/utils/__tests__/themeAxes.test.ts:38`** ("o par de referência difere
em modo, cromo e fonte"). Ele exige `light.navigationStyle` diferente de `dark.navigationStyle`; agora o `minimalist-airy` e o
`sarak-sovereign` **não declaram** `navigationStyle` (é funcional), então os dois são `undefined` e o teste falha (apareceu na
rodada do `themes`, que o executor não roda por inteiro). **Correção:** trocar o eixo de "cromo" do teste por um token **estético** de cromo que o
par realmente declare e que difira (por exemplo `sidebarColor`, `navItemActiveColor` ou `navItemRadius`), mantendo o que o teste
prova (modo, cromo e fonte diferem entre os dois temas de referência); **antes de entregar, rodar
`npx vitest run src/core/Design src/core/Provider src/features/DesignEngine`** (não a suíte inteira) e corrigir **todo** teste que
ainda fixe valor funcional ou antigo de um tema entregue; entregar a saída verde.

**Status: 🔵 Em correção** (só este achado).

## Veredito — 2026-10-18 — correção 1, terceira rodada (lote B: lotes 12 a 15) — 🟢 Aprovado; lote B fechado

**Conferido:** `themeAxes.test.ts` agora compara `sidebarColor` (estético, declarado e diferente nos dois temas de referência) e mantém modo e tipografia;
`validation.test.ts` deixou de citar o `nebula-space` e segue provando que o invólucro legado `url()` é aceito sem aviso; o snapshot de
`PreviewCanvas` foi atualizado com os valores atuais dos temas. O vitest que o executor rodou, `src/core/Design`, `src/core/Provider` e
`src/features/DesignEngine`: **171 arquivos, 1.146 testes verdes**. **Medido por mim:** `verify --tier=quick` e `--tier=themes`
**verdes** (Anel 1 inteiro, `tsc`, baseline, completude, fecho do boot, diversidade, peso, kits, `panel-contract` e `tokenContractParity`; Anel 0:
2.839 linhas, 0 achados).

**Lote B fechado:** `kinetic-flow` (3.528 B), `cyber-retro-wave` (3.586 B), `blueprint-protocol` (3.561 B) e `minimalist-airy`
(3.534 B), todos completos nos dois modos, com contraste mínimo de 4,53 a 4,89 (escuro) e 4,63 a 4,98 (claro) e capturas na galeria
do dono. Dez de quatorze temas atuais recriados. Falta o lote C (`data-terminal`, `neumorphic-mobile`, `golden-hour`, `aurora-veil`) e,
depois do registro, o lote D (os cinco novos).

**Status: 🟡 Em execução (lotes 16 a 24).**
