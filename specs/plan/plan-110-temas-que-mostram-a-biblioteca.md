---
tipo: "plan"
titulo: "Elevar o conjunto de temas embarcados ao padrao que a biblioteca entrega"
objetivo: "Fazer os temas embarcados da lib, os 14 atuais refeitos e 5 novos, mostrarem do comeco ao fim o que o Design Engine sabe fazer, cada um com todo token estetico projetado nos dois modos, com direcao de arte de conjunto, valores padrao dos tokens redefinidos a partir do tema padrao, legiveis nos dois modos, provados por medicao e por vitrine aprovada pelo dono, e a documentacao de criar tema enriquecida"
dominio: "Design Engine / Temas embarcados / Design e UX"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "temas", "design", "ux", "design-engine", "direcao-de-arte"]
relacionados: ["[[09-temas-e-presets]]", "[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "plan-116-tema-sob-demanda"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md + arquitetura/02-design-engine.md + specs/12-kit-do-consumidor.md"
---

# 1. Objetivo

Quem abre a galeria de temas da lib vê **19 temas** — os 14 atuais refeitos e 5 novos — que, cada um do começo ao
fim, usam o arsenal do Design Engine (cor, textura, atmosfera de fundo, cartão, botão, campo, ícone, tipografia,
gráfico, movimento, densidade e cromo) com intenção de design, são distintos entre si como **conjunto**, legíveis
nos dois modos e confortáveis no celular — e o dono aprovou a direção antes e o resultado depois.

# 2. Contexto

**Os temas embarcados são o reflexo de qualidade da lib** (decisão do dono, 2026-10-11): o que um consumidor vê
primeiro, e o que mostra a capacidade de tudo o que foi construído — inclusive o que entrou neste ciclo (navegação
na base, alvo de toque, movimento reduzido, família e peso de ícone, os sete tokens de gráfico, densidade, largura
máxima do conteúdo, selo de status com forma). **Não é uma revisão de configuração:** é elevar o padrão, pensando o
conjunto inteiro.

**Quem executa esta plan trabalha como especialista em design e UX.** O critério é de direção de arte e de
experiência — hierarquia, ritmo, contraste, personalidade, conforto de leitura, toque, movimento com propósito.
Os gates são o **piso**, não a meta: um tema que passa em tudo e é genérico não cumpre esta plan.

**Medido em 2026-10-11** (script de contagem sobre `SARAK_GLOBAL_THEMES` e `MASTER_DESIGN_MAP`):

| Medida | Hoje |
|---|---|
| Tokens no dicionário | 439 |
| Tokens que cada tema define | 256 a 268 (cerca de 60%) |
| Tokens que **nenhum** tema define | **169**, todos de componente — cada componente cai no padrão de fábrica |
| Tokens que **todos** definem com o **mesmo** valor | 11 |
| Texturas de cartão (`cardTextureType`) | **3** usadas de **41** (`none`, `grid`, `scanlines`) |
| Fontes (`headingFont`/`bodyFont`) | cerca de 7 usadas de 20 opções |
| Gradiente de fundo (`bgGradientMode`) | `mesh` nunca usado |
| Fundo de tela (`globalBackgroundImageUrl`) | nenhum tema |
| Ícones | os 5 temas claros: todos Lucide regular |
| `cardVariant` | todos `classic` |
| Tokens novos deste ciclo (`mobileNavigationStyle`, `touchTargetMin`, `chartType`…) | nenhum tema escolhe valor |
| Modo nativo | 9 escuros, quase todos na família neon/cyber/terminal (`cyberpunk-neon`, `synthwave-retro`, `cyber-retro-wave`, `kinetic-flow`, `nebula-space`, `industrial-terminal`, `blueprint-protocol`…) — **pouca distância de personalidade entre eles** |

**Restrições que vêm das specs fixas e não mudam** ([[09-temas-e-presets]] §2.1, §4.4, §4.7, §5.1, §6, §7):

- **Os 14 ids continuam** (tema salvo de consumidor guarda o id); os 5 novos ganham ids novos.
- Todo tema embarcado tem **`contraparte` autorada** (sem isenção), **`enabledLanguages`** com os seis idiomas, as
  **posições de preferência no padrão de fábrica**, o fundo de hover do item de navegação perceptivelmente distinto
  do repouso nas duas orientações, e passa no procedimento da §7.
- **Todo fundo funciona offline** (§5.1): atmosfera do motor de textura da lib (`_atmosphere.css`, `TEXTURE_OPTIONS`)
  ou arte **própria** embutida como `data:image/svg+xml;base64,…` (aceita pelo `isSafeMediaString`,
  [[10-seguranca-e-acessibilidade]] §2.1). **Nunca** URL de terceiro.
- **Valor salvo vence o embarcado** (§4.4): quem já salvou tema não recebe o refinamento — por isso a nota de
  migração e o MAJOR.
- Contraste de texto ≥ 4,5:1 nos dois modos (**R31**, `auditor_contraste`); diversidade medida
  (`themes:diversity`); nenhum aviso no console (`shippedThemesConsoleClean.test.ts`); valor dentro do contrato do
  token (`tokenContractParity.test.ts`); nenhuma chave órfã (`auditor_presets`).
- **O contraste mede o que os componentes desenham** (`plan-114`, lote 4): `verify_contrast.ts` cobre 67 pares,
  inclusive a cor primária, as de status e a de erro de campo **como texto** sobre o corpo e o cartão (botão
  contorno e fantasma, link, badge, mensagem de erro). A primária de um tema é, portanto, também uma cor de texto: a
  direção de arte escolhe uma primária que passe 4,5:1 sobre o corpo nos dois modos, ou o tema reprova. O texto
  sobre cor sólida (badge, botão de perigo/sucesso, bolha do chat) é escolhido pelo motor por contraste — o tema não
  o declara. Em 2026-10-12 o lote 4 trocou a luminosidade de 84 valores dos temas atuais para passar; o lote 1
  desta plan os redesenha.

**Decisões do dono, 2026-10-13** (revisam o desenho de lotes e o teto D5 do anexo de direção; o resto do lote 0
continua aprovado):

- **Todo token estético é projetado em todo tema.** Os temas não podem se parecer por herdar o padrão. O schema
  separa os tokens em **estéticos** (cor, elevação, textura, tipografia, geometria visual, densidade visual,
  movimento) e **funcionais** (camadas, alvo de toque, larguras e posições do cromo, breakpoints, comportamento);
  todo tema embarcado declara **todos os estéticos** no modo principal e, na `contraparte`, todos os estéticos que
  dependem do modo (cor, elevação, textura, sombra, vinheta) — geometria, tipografia e movimento são herdados do
  modo principal de propósito, e é isso que preserva a identidade entre os modos. Os funcionais **não** são
  declarados por tema: valem o padrão do sistema, igual em todos.
- **O tema padrão é o `sarak-sovereign`** (o que carrega quando ninguém escolhe).
- **Os valores padrão dos tokens são redefinidos:** os funcionais, revisados um a um como decisão de sistema (valem
  para todos os temas); os estéticos, iguais aos do tema padrão — assim o primeiro quadro, o componente sem
  Provider e o tema parcial do consumidor já mostram o tema padrão, sem troca visível. As reservas
  `var(--x, F)` acompanham (R42).
- **Temas sob demanda** (`plan-116`, da qual esta depende): o boot leva só o tema que vai ao ar; o teto D5 de 28 KB
  para o conjunto deixa de existir; fica um teto **por tema**, medido no lote 2.
- **Um tema por lote**, com a aprovação das capturas pelo dono antes do próximo.
- **A documentação de criar tema é enriquecida durante o processo** — a skill `ui-criar-tema`, a §7 da
  [[09-temas-e-presets]] e o guia do kit do consumidor (`sarak-ui/`) —, e o último lote a consolida com exemplos
  tirados dos temas reais.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/themes/` — os 14 temas, os 5 novos, o registro (na forma que a `plan-116` entregar) e testes em `__tests__/`. Um tema pode virar pasta com partes por pilar se o tamanho pedir (o `auditor_cleancode` isenta `/presets/themes/`).
- `src/core/Design/schema/` e `catalog/` — **só** a classificação estético × funcional de cada token (metadado) e o `defaultValue` (lotes 1 e 2), com a paridade; nenhum token novo, nenhuma opção nova.
- As reservas `var(--x, F)` que acompanham o `defaultValue` novo (pela ferramenta do `variable-contract`), em `src/styles/`, `src/components/` e `src/features/`.
- `gates/` — a trava de completude estética (§5, lote 1); `gates/scripts/audit/` só se um tema expuser defeito de medição já existente.
- `browser-tests/` — a vitrine (`generate-showcase.mts`) estendida no lote 1 e usada em todo lote de tema.
- Documentação de criar tema: `.agents/skills/ui-criar-tema/`, o guia do kit do consumidor (fonte de `npm run guide`) — a §7 da `09` é do revisor, na síntese.
- `specs/plan/anexos/plan-110-direcao-de-arte.md` (o executor acrescenta a ficha completa de cada tema ao fazê-lo) e `specs/plan/anexos/plan-110-tokens-funcionais.md` (lote 1).
- `docs/migracoes.md` — subseção dentro de `## 8.0.0` a cada lote; artefatos regenerados.

## 3.2 Fora
- Componentes e CSS do motor: esta plan **usa** o arsenal. Defeito achado no caminho vai para o resumo, como achado.
- Token novo, opção nova, mudança de leitor.
- Mudar o que é exigido de tema embarcado (§7 da `09`), as regras de contraste e de diversidade.
- Qualquer spec em `specs/` além dos anexos (a síntese é do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/plan-110-direcao-de-arte.md` | a direção aprovada no lote 0: mapa do conjunto, fichas, direções novas |
| Spec fixa | `specs/09-temas-e-presets.md` (inteira; em especial §2.1, §4.1.1, §4.4, §4.4.4, §4.7, §5, §5.1, §5.2, §6, §7) | tema, contraparte, persistência, catálogo, travas e o procedimento do tema embarcado |
| Spec fixa | `arquitetura/02-design-engine.md` (§4, §10) | como o motor transforma token em CSS; o que cada token desenha |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | o dicionário e o contrato de valor de cada token |
| Spec fixa | `specs/05-cromo-e-slots.md` §2.4 · `specs/07-responsividade-e-multidispositivo.md` §5 | cromo, navegação, toque |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §2.1 e §2.4 | mídia, contraste, movimento reduzido e toque |
| Spec fixa | `specs/12-kit-do-consumidor.md` | onde mora o guia de criar tema do consumidor |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R31, R40-R44) | contraste, leitor, cascata, variável, cor fixa, painel |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-criar-tema` · `ui-criar-preset` · `ui-arquitetura-design` · `dataviz` | procedimento de tema, presets, CSS do motor, paleta de gráfico |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/core/Design/presets/themes/`, `src/core/Design/master-map.ts` (`getScaffold`), `src/core/Design/schema/`, `src/core/Design/catalog/partitions/` | os temas, o esqueleto completo e o arsenal |
| Código | `gates/scripts/audit/verify_contrast.ts`, `gates/scripts/audit/verify_diversity.ts`, `gates/scripts/contrato/check-variable-contract.ts`, `src/core/Provider/utils/__tests__/shippedThemesConsoleClean.test.ts`, `src/core/Provider/utils/__tests__/tokenContractParity.test.ts` | as travas que todo tema passa |
| Código | `browser-tests/generate-showcase.mts`, `browser-tests/fixtures/harness-entry.tsx` | a vitrine e o harness |

# 5. Instruções de execução

**Lote 0 — auditoria e direção de arte.** ✅ Entregue e aprovado pelo dono (§9 e §10). O que mudou depois está em §2
(decisões de 2026-10-13).

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 (append-only) e status 🟠; o próximo só começa
depois do veredito e, nos lotes de tema, da aprovação das capturas pelo dono.**

**Lote 1 — fundação: estético × funcional, padrões funcionais, vitrine e trava.**
1. Classificar os tokens do schema em estéticos e funcionais (metadado no schema, com paridade no catálogo), com o
   critério no anexo `plan-110-tokens-funcionais.md`: funcional é o que deve ser igual em todo tema por segurança,
   acessibilidade ou consistência de comportamento. O painel continua oferecendo os dois.
2. Revisar o `defaultValue` de cada token **funcional** como decisão de sistema (escada de camadas, alvo de toque,
   larguras, posições, comportamento), cada mudança com o motivo no anexo; reservas acompanham; nota MAJOR.
3. Estender a vitrine (`npm run themes:showcase`) para montar as telas representativas (cromo com navegação, painel
   com cartões, tabela, formulário com erro, gráfico, calendário, selos de status, estado vazio, modal, chat) e
   capturar um tema nos dois modos, em desktop e celular.
4. **Trava de completude:** todo tema embarcado declara todos os tokens estéticos no modo principal e, na
   `contraparte`, todos os estéticos que dependem do modo; nenhum funcional. Gate ou teste (escolha justificada),
   com limites (R18), caso de mutação, e **lista de exceção por tema que se esvazia** a cada lote (os temas ainda não
   refeitos estão nela; o último lote de tema a deixa vazia).

**Lote 2 — o tema padrão e os padrões estéticos.**
5. Refazer o `sarak-sovereign` do começo ao fim pela ficha, com todo token estético projetado, nos dois modos.
6. Os `defaultValue` estéticos passam a ser os valores do `sarak-sovereign` no modo principal; reservas
   acompanham pela ferramenta; o `variable-contract:check` confere.
7. Medir o peso do tema e propor o **teto por tema** (o conjunto deixa de ter teto de boot, pela `plan-116`).
8. Capturas da vitrine → aprovação do dono.

**Lotes 3 a 15 — os outros 13 temas atuais**, um por lote, na ordem do anexo de direção; **lotes 16 a 20 — os 5
novos**, um por lote, registrados no catálogo.
9. Cada tema parte do esqueleto completo (`getScaffold`), nunca de `{}`, segue a sua ficha e declara todo token
   estético; a ficha completa (token → valor → motivo dos não óbvios) entra no anexo de direção; a `contraparte`
   preserva a identidade (só o que carrega modo muda); fundo por atmosfera do motor ou SVG próprio embutido; paleta
   de gráfico validada pela skill `dataviz`; o tema sai da lista de exceção da trava.
10. A documentação de criar tema ganha o que o tema ensinou (decisão, armadilha, padrão), na skill e no guia do kit.
11. Capturas da vitrine → aprovação do dono.

**Lote 21 — documentação consolidada e conjunto.**
12. Consolidar o guia de criar tema (skill e kit do consumidor) com exemplos tirados dos temas reais: a ficha de um
    tema como modelo, como derivar a contraparte preservando a identidade, o que é estético e o que é funcional.
13. Cobertura do **conjunto**: os 19 usam juntos pelo menos 15 texturas de cartão, 10 fontes, as 3 famílias de ícone
    com pelo menos 4 pesos, os 4 modos de gradiente, e nenhum par repete a mesma combinação de textura + estilo de
    botão + fonte de título (teste, com mutação); `themes:diversity` verde.
14. Vitrine dos 19 temas × 2 modos × desktop e celular → aprovação final do dono.

**Em todo lote que toca código:** contraste não textual relatado por tema e modo (WCAG 1.4.11, 3:1 — apoio, não
gate); nota MAJOR na `## 8.0.0`; gerados regenerados (`guide` por último); simulação do Anel 0; a verificação da §7.

# 6. Critérios de aceite

- [ ] Lote 0 aprovado pelo dono (✅).
- [ ] Tokens classificados (estético × funcional), com o critério no anexo; padrões funcionais revisados, cada mudança com motivo.
- [ ] Padrões estéticos = valores do `sarak-sovereign`; reservas acompanhando (`variable-contract:check` verde).
- [ ] Trava de completude estética com lista de exceção **vazia** no fim; caso de mutação.
- [ ] 19 temas no catálogo; os 14 ids antigos preservados; cada um com todo token estético projetado e a ficha completa no anexo.
- [ ] **Todo tema tem claro e escuro, e o modo oposto preserva a identidade** (decisão do dono, 2026-10-11): a `contraparte` troca só o que carrega modo.
- [ ] Todo tema com `contraparte`, seis idiomas, preferências no padrão de fábrica, hover de navegação distinto, fundo offline, peso dentro do teto por tema aprovado.
- [ ] Cobertura do conjunto (teste, com mutação); `themes:diversity` verde.
- [ ] Contraste (R31) e paridade verdes; `auditor_presets`, `shippedThemesConsoleClean`, `tokenContractParity`, `panel-contract` verdes.
- [ ] Capturas de cada tema aprovadas pelo dono; vitrine final aprovada.
- [ ] Documentação de criar tema consolidada (skill e kit do consumidor).
- [ ] Nota MAJOR em `## 8.0.0`.
- [ ] Suíte completa verde numa passada; `tsc` 0; `audit:baseline` sem regressão; Anel 1; `cromo-css-real:check`; catálogo, kit e barril em dia; Anel 0 simulado: 0.

# 7. Como verificar (uso do revisor)

- Lote 1: a classificação token a token contra o critério do anexo; cada padrão funcional mudado e o motivo; a trava com mutação.
- Lotes de tema: o tema contra a ficha; completude (a trava); contraste nos dois modos; peso; a vitrine (o revisor roda, com build) → capturas ao dono.
- `git diff --stat` → só a §3.1 e os gerados.
- `npm run build` + `npm run cromo-css-real:check` + `npm run themes:showcase` · `npm run audit` · `npm run themes:diversity` · `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline -- --with-tsc` · Anel 1 · Anel 0.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md + arquitetura/02-design-engine.md + specs/12-kit-do-consumidor.md`

- **`09`:** o padrão do tema embarcado (todo estético projetado, contraparte do que carrega modo, funcionais do sistema), o mapa do conjunto em tabela curta (id → conceito → modo nativo), o teto por tema, as travas de completude e de conjunto; a §7 ganha o procedimento enriquecido.
- **`02`:** estético × funcional; o padrão dos tokens estéticos é o tema padrão.
- **`12`:** onde o consumidor aprende a criar tema.
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Conferência do lote 0 — 2026-10-11 — aprovado pelo dono, lote 1 em espera

**Conferido pelo revisor:** o anexo inteiro (mapa do conjunto, 19 fichas, teto de peso, achados); por amostragem no código, os achados A1 (nada lê `--sarak-bg-gradient-*`), A2 (o CSS desenha `metallic`/`brushed`/`acrylic`/`matte`, que não são opções de `surfaceMaterial`), A6 (Orbitron, Chakra Petch, VT323 e Fira Code fora do carregador de fontes) e a vitrine existente (`npm run themes:showcase`) — o passo 5 da §5 foi corrigido para estender a vitrine.

**Decisões do dono (2026-10-11):** D1 a D7 **aprovadas** como o anexo recomenda. **Regra reforçada:** todo tema tem claro e escuro e o modo oposto preserva a identidade (critério novo na §6). **Os achados A1–A10 do anexo serão corrigidos antes do lote 1**, numa plan própria; o lote 1 espera por ela, e as fichas que contornavam alavancas quebradas são revistas depois dela.
