---
tipo: "plan"
titulo: "Elevar o conjunto de temas embarcados ao padrao que a biblioteca entrega"
objetivo: "Fazer os temas embarcados da lib, os 14 atuais refeitos e 5 novos, mostrarem do comeco ao fim o que o Design Engine sabe fazer, com direcao de arte de conjunto, cada tema distinto e coerente, legivel nos dois modos e provado por medicao e por vitrine aprovada pelo dono"
dominio: "Design Engine / Temas embarcados / Design e UX"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "temas", "design", "ux", "design-engine", "direcao-de-arte"]
relacionados: ["[[09-temas-e-presets]]", "[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "plan-114-o-arsenal-obedece"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md"
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

**Os temas são carregados na abertura do barril** (`SARAK_GLOBAL_THEMES` é exportado): cada KB a mais pesa no boot
de todo consumidor. Por isso o lote 0 mede o peso atual e propõe um teto.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/themes/` — os 14 temas, os 5 novos, `index.ts` (`SARAK_THEME_PRESET_IDS`, `SARAK_GLOBAL_THEMES`) e testes em `__tests__/`. Um tema pode virar pasta com partes por pilar se o tamanho pedir (o `auditor_cleancode` isenta `/presets/themes/`).
- `specs/plan/anexos/plan-110-direcao-de-arte.md` — o documento de direção do lote 0 (criado pelo executor; sai junto com a plan na síntese).
- `browser-tests/` — a cena e o script da vitrine (lote 3) e casos de medição, se precisar; `.gitignore` para a pasta de saída da vitrine; `package.json`, só o script da vitrine.
- `gates/scripts/audit/` — **só** se um tema novo expuser defeito de medição já existente; nenhum gate novo.
- `docs/migracoes.md` — subseção dentro da entrada `## 8.0.0`.
- Artefatos regenerados (`npm run catalog`, `npm run guide`, `npm run dev-kit`, `npm run token-types` se preciso).

## 3.2 Fora
- O schema de tokens e os componentes (`src/core/Design/schema/`, `src/components/`): esta plan **usa** o arsenal, não o muda. Defeito de token ou de componente achado no caminho vai para o resumo, como achado.
- Os presets parciais da galeria (`src/core/Design/presets/components/`), salvo se a direção pedir um novo — então ele entra declarado no resumo.
- Mudar o que é exigido de tema embarcado (§7 da `09`), as regras de contraste e de diversidade.
- Qualquer spec em `specs/` além do anexo (a síntese é do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/09-temas-e-presets.md` (inteira; em especial §2.1, §4.1.1, §4.4, §4.7, §5, §5.1, §5.2, §6, §7) | o que é tema, contraparte, persistência, catálogo, travas e o procedimento do tema embarcado |
| Spec fixa | `arquitetura/02-design-engine.md` | como o motor transforma token em CSS; camadas; o que cede à classe |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | o dicionário e o contrato de valor de cada token |
| Spec fixa | `specs/05-cromo-e-slots.md` §2.4 | os tokens de cromo e o hover do item de navegação |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` §5 | navegação na base, alvo de toque e campo no celular |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §2.1 (c-bis) e §2.4 | predicado de mídia; contraste, movimento reduzido e toque |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` §2.1 | o campo `visualImpact` do catálogo e por que ele define o que pesa |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-criar-tema` | o procedimento de tema completo (derivar da referência, contraparte, completude) |
| **Skill** | `ui-criar-preset` | variantes visuais por componente, quando a direção pedir |
| **Skill** | `ui-arquitetura-design` | regra arquitetural do CSS do Design Engine |
| **Skill** | `dataviz` | a paleta categórica de gráfico de cada tema (fórmula e validador de cor) |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os dois testes novos da §5 |
| Código | `src/core/Design/presets/themes/index.ts`, `src/core/Design/presets/themes/reference.ts`, `src/core/Design/presets/themes/minimalist-airy.ts`, `src/core/Design/presets/themes/sarak-sovereign.ts` | o formato e as duas referências |
| Código | `src/core/Design/master-map.ts`, `src/core/Design/schema/`, `src/core/Design/catalog/partitions/` | o arsenal inteiro: tokens, opções e `visualImpact` |
| Código | `src/styles/_atmosphere.css`, `src/styles/_cards.css`, `src/styles/_touch.css`, `src/styles/_motion.css` | o que cada textura, atmosfera, cartão e regra de toque/movimento desenha |
| Código | `gates/scripts/audit/verify_contrast.ts`, `gates/scripts/audit/verify_diversity.ts`, `src/core/Provider/utils/__tests__/shippedThemesConsoleClean.test.ts`, `src/core/Provider/utils/__tests__/tokenContractParity.test.ts` | as travas que todo tema passa |
| Código | `browser-tests/generate-showcase.mts`, `browser-tests/fixtures/harness-entry.tsx`, `browser-tests/css-que-so-o-navegador-mede.spec.ts` | a vitrine que já existe e o harness de navegador |

# 5. Instruções de execução

**Lote 0 — auditoria e direção de arte (não toca código).**
1. Auditar o conjunto atual como designer: para cada um dos 14, o que ele comunica, onde é genérico, onde colide com
   outro tema, o que do arsenal ignora. Medir o peso atual dos temas no `dist/` (gzip do que `SARAK_GLOBAL_THEMES`
   acrescenta ao boot) — o método vai no anexo.
2. Escrever `specs/plan/anexos/plan-110-direcao-de-arte.md` com: (a) o **mapa do conjunto** — os 19 temas
   posicionados por personalidade, público, modo nativo, família de matiz, temperatura e densidade, provando que
   nenhum par é redundante; (b) uma **ficha por tema** — conceito em uma frase, público, paleta nos dois modos,
   tipografia, família e peso de ícone, textura e atmosfera de fundo, cartão, botão, campo, gráfico, movimento,
   densidade, navegação (inclusive no celular), e o que ele mostra da lib que os outros não mostram; (c) as
   **5 direções novas** — ponto de partida sugerido pelo revisor, que o executor pode trocar com justificativa:
   *editorial* (papel, serifa, leitura longa), *orgânico* (terra, madeira, estuque), *alto contraste* (mirando AAA,
   7:1), *corporativo sóbrio* (denso, para ERP e finanças), *lúdico* (pastel, arredondado, movimento suave);
   (d) a **proposta de teto de peso** do conjunto e das artes SVG embutidas; (e) os ids dos 5 novos.
3. **Parar e entregar.** O dono aprova a direção (e o teto) antes de qualquer código. O resumo do lote 0 aponta o
   anexo.

**Lote 1 — refazer os 14** (depois da aprovação).
4. Cada tema, do começo ao fim, segue a sua ficha: escolhe explicitamente **todos os tokens com `visualImpact`** e os
   de componente que o tema torna visíveis (cartão, botão, campo, navegação, gráfico, estado), os tokens deste
   ciclo, e a `contraparte` desenhada à mão para o modo oposto. Fundo por atmosfera do motor ou SVG próprio
   embutido, dentro do teto. Paleta categórica de gráfico validada pela skill `dataviz`.

**Lote 2 — criar os 5 novos**, no mesmo padrão, registrados em `SARAK_THEME_PRESET_IDS` e `SARAK_GLOBAL_THEMES`.

**Lote 3 — vitrine e calibragem.**
5. **Estender** a vitrine que já existe (`npm run themes:showcase` → `browser-tests/generate-showcase.mts`, saída em
   `browser-tests/showcase-output/`, documentada na skill `ui-criar-tema`) para que ela monte as telas representativas
   (cromo com navegação, painel com cartões, tabela, formulário com erro, gráfico, calendário, selos de status, estado
   vazio) e capture cada tema, nos dois modos, em desktop e celular. O revisor roda a vitrine (precisa de build) e o
   dono aprova as capturas.
6. Calibrar pelo que a vitrine mostrar; repetir até a aprovação.

**Em todos os lotes que tocam código:**
7. Dois testes novos em `src/core/Design/presets/themes/__tests__/`: (a) todo tema embarcado define explicitamente
   cada token marcado com `visualImpact` no catálogo; (b) cobertura do **conjunto** — os 19 usam juntos pelo menos
   15 texturas de cartão, 10 fontes, as 3 famílias de ícone com pelo menos 4 pesos, os 4 modos de gradiente, e
   nenhum par de temas repete a mesma combinação de textura + estilo de botão + fonte de título.
8. Relatar, por tema e modo, o contraste não textual (borda de campo e de cartão contra o fundo, WCAG 1.4.11, 3:1) —
   medida de apoio, não gate ([[15-divida-conhecida]] achado 59).
9. Nota de migração **MAJOR** dentro da entrada `## 8.0.0` (o visual de todo tema muda; os 5 novos; tema salvo não
   recebe o refinamento).
10. Rodar a verificação da §7.

# 6. Critérios de aceite

- [ ] Anexo de direção de arte aprovado pelo dono **antes** do lote 1 (registrado no resumo).
- [ ] 19 temas em `SARAK_GLOBAL_THEMES`; os 14 ids antigos preservados.
- [ ] Cada tema segue a sua ficha aprovada; nenhum par redundante no mapa do conjunto.
- [ ] Teste (a) e teste (b) da §5 passo 7, cada um com um caso que falha contra o `HEAD`.
- [ ] **Todo tema tem claro e escuro, e o modo oposto preserva a identidade** (decisão do dono, 2026-10-11): a `contraparte` troca só o que carrega modo — conceito, tipografia, ícone, textura, cartão, botão, movimento e densidade continuam os mesmos; uma textura não pode ser trocada por outra só porque some no modo oposto. A vitrine mostra os dois modos lado a lado, e os dois são aprovados.
- [ ] Todo tema com `contraparte`, seis idiomas, preferências no padrão de fábrica, hover de navegação distinto, fundo offline (atmosfera do motor ou SVG próprio), peso dentro do teto aprovado.
- [ ] `npm run audit` → contraste e paridade verdes, `auditor_presets` sem órfã; `npm run themes:diversity` verde; `shippedThemesConsoleClean` e `tokenContractParity` verdes.
- [ ] Contraste não textual relatado por tema e modo.
- [ ] Vitrine capturada (19 temas × 2 modos × desktop e celular) e **aprovada pelo dono**.
- [ ] Nota MAJOR em `## 8.0.0`.
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; gates do Anel 1; `cromo-css-real:check`; catálogo, kit e barril em dia.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — os invariantes (tokens de impacto definidos, cobertura do conjunto) são deste módulo e ficam nos testes da §5 passo 7; contraste, diversidade, paridade e chaves órfãs já têm gate.

- Lote 0: ler o anexo inteiro; conferir o mapa do conjunto contra os temas e o peso medido; levar ao dono.
- `git diff --stat` → só a §3.1 e os gerados.
- `npm run audit` (contraste, paridade, presets) · `npm run themes:diversity` · `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline`.
- Anel 1: `container-query:check`, `container-query-boundary:check`, `class-merge:check`, `icon-port:check`, `chrome-token-parity:check`, `zero-brand:check`, `barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check`.
- `npm run build` + `npm run cromo-css-real:check` + a vitrine (o revisor roda, com rede); peso dos temas no `dist/` contra o teto.
- Mutação: tirar um token de `visualImpact` de um tema → o teste (a) falha; trocar dois temas para a mesma combinação → o teste (b) falha.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md`

O que vai para a §5 (o catálogo embarcado), escrito como verdade consolidada no transporte: o padrão do tema
embarcado (define todo token de impacto visual e os de componente que torna visíveis; fundo por atmosfera do motor
ou arte própria embutida dentro do teto de peso; paleta de gráfico validada), o mapa do conjunto em uma tabela curta
(id → conceito em uma frase → modo nativo), o teto de peso aprovado e os dois testes que travam o padrão. A §7 ganha
o passo "siga a ficha de direção" para tema embarcado novo. O anexo de direção sai junto com a plan; o que dele é
regra vai para a §5, o resto fica no Git.

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
