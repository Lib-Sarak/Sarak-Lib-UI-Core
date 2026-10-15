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
- Nota MAJOR na `## 8.0.0`; gerados regenerados (`guide` e `dev-kit` por último); simulação do Anel 0; a verificação da §7.

**Dependência parcial (decisão do dono, 2026-10-15): a `plan-117` (pendências do arsenal) fecha antes do lote 5.** Os lotes 1 a 4 (análise e documentação dos tokens) seguem; a `plan-117` liga cinco tokens e retira dois, e é o registro vivo das pendências que estes lotes acharem. Os lotes 5 em diante só começam com a `plan-117` 🟢. **A `plan-118` (fontes embarcadas, e catálogo de tipografia ampliado) fecha antes do lote 25** e, preferencialmente, antes do lote 7: os temas escolhem fontes por valor da lista, que ela amplia.

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

**Status: 🔴 A executar** (lote 2: `typography`, `buttons`, `inputs`, `switches`, `colors`, `data`, `chat`,
`status`). O método e a infraestrutura estão prontos; o lote 2 só repete.
