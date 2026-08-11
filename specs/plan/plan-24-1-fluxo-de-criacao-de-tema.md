---
tipo: "plan"
titulo: "O fluxo de criação de tema — o motor honra o autor, e o contraste se resolve sem homogeneizar"
dominio: "Sarak-Lib-UI-Core / Design / Temas"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "r31", "temas", "agente", "acessibilidade"]
relacionados: ["[[plan-24-aplicacao-de-temas]]", "[[09-temas-e-presets]]", "[[00-regras-e-invariantes]]", "[[04-contrato-de-tokens-e-paridade]]"]
depende_de: "plan-24"
objetivo: "Fazer o motor honrar o valor escrito pelo autor e o agente criar tema com liberdade, sem homogeneizar"
destino_sintese: "specs/specs/09-temas-e-presets.md · specs/specs/00-regras-e-invariantes.md · specs/specs/01-gates-e-baseline.md"
---

> 🎯 **O coração da lib é a diversidade de temas.** Tudo nesta plan existe para que o contraste seja garantido
> **sem** que os temas fiquem parecidos entre si.

# 1. Objetivo

**O agente cria tema com liberdade total nos 422 tokens**, e o contraste se resolve por correção mínima — não
por derivação. Ao final, a **R31 vira ✅**.

# 2. Contexto

## 2.1 A restrição de produto que define esta plan

> *"Em tentativas anteriores, ao utilizar um gerador, todos os temas ficavam extremamente parecidos. O coração
> desta biblioteca é a capacidade de criar temas com grande diversidade e temáticas diferentes."*
> — dono, 2026-08-10

**Isso não foi acidente: é o que um gerador de paleta faz por definição.** Ele toma as decisões de estilo no
lugar do autor, e decisão tomada por fórmula converge. O revisor havia proposto um gerador paramétrico e
**retirou a proposta** diante desta medição do dono.

## 2.2 A inversão — solucionador, não gerador

**Contraste é uma restrição, não um estilo.** Ele governa **uma** relação: a distância de luminância entre um
texto e o fundo dele. Não diz nada sobre matiz, saturação, efeito, ruído, curva, raio ou tipografia — que é
**onde mora a identidade de um tema**.

| | Gerador *(descartado)* | **Solucionador** *(esta plan)* |
|---|---|---|
| Quem escolhe matiz, saturação, efeito | **ele** | **o autor** |
| O que faz | deriva as 422 chaves | mexe **só** no que reprova |
| O que ajusta | tudo | **só a luminância** do par que falha |
| Resultado | temas parecidos | o tema do autor, legível |

**Um rosa neon que falha 4,5:1 não precisa deixar de ser rosa neon. Precisa de mais luz.** O solucionador
calcula quanta, mexe só nisso, e devolve o mesmo rosa.

### O caso que prova a diferença

`neo-brutalism`: `#000000` sobre `#050505` = **1.03:1**.

Um gerador substituiria a paleta e **mataria a intenção brutalista**. O solucionador mantém o
preto-sobre-quase-preto como decisão de fundo e informa: *"para ser AA, o texto precisa ir a `#767676`"* — e o
autor escolhe entre aceitar ou mudar o fundo. **A intenção sobrevive à correção.**

## 2.3 O relatório é obrigatório, e é o que impede a correção de virar dano

O risco honesto do solucionador: devolver uma cor que satisfaz o número e **fica feia** — um cinza morto onde
havia um tom de marca.

Por isso ele **não corrige em silêncio**. Devolve o tema **e** o relatório: qual par, quanto faltava, que
valor entrou, quanto mudou. Isso transforma a correção automática numa **proposta revisável**, não num fato
consumado. Se a correção ficar ruim com frequência, o sinal aparece no relatório — **não na tela do
consumidor**.

## 2.4 O que o agente já tem hoje — e o que falta

Medido pelo revisor em 2026-08-10:

| | Existe? |
|---|---|
| Skill `ui-criar-tema` com workflow (parâmetros → gabarito → preenchimento → registro → verificação) | ✅ 99 linhas |
| `generate_theme_template.ts` e `references/examples.md` | ✅ |
| Catálogo com `description`, `type`, `allowedValues`, `relatedTokens`, `cssVariables` **para os 422** | ✅ |
| **Medição de contraste no passo 5 da skill** | ❌ — mede completude de eixos, **não contraste** |
| **Mapa de onde há liberdade × onde há restrição** | ❌ **não existe** |

**Foi por isso que 12 de 18 nasceram reprovados.** O agente cria o tema e não tem como saber se ficou legível.

## 2.5 🔴 O mapa NÃO pode transcrever o catálogo

O catálogo já documenta os 422 tokens, e é **gerado**. Reescrevê-lo num guia violaria a **R17** — a mesma
regra que produziu o achado 32 e as seis descrições erradas de gate. **Guia que copia fonte viva envelhece no
primeiro token novo.**

O que falta é outra coisa: **quais tokens formam par de contraste**. O catálogo diz *o que cada token é*; não
diz *com quem ele compõe*. Essa lista é a saída do passo 2 da [[plan-24-aplicacao-de-temas]], e **é a única
informação que não existe em lugar nenhum hoje**.

## 2.6 Tema novo nasce completo; tema antigo não é obrigado *(decisão do dono, 2026-08-10)*

| | |
|---|---|
| **Gerar** um tema | preenche os **422** — máxima granularidade explícita |
| **Aceitar** um tema | qualquer subconjunto; o que falta cai no default do token |

O mecanismo já existe e está certo: `findMissingThemeAxes` **avisa e não lança**. O que muda é o **padrão de
saída** do gabarito, não a validação.

> ⚠️ **Consequência a assumir:** hoje um tema tem ~263 chaves; passará a ter 422. E **cada cor preenchida
> explicitamente vira um par a verificar** — o que torna o solucionador **mais** necessário, não menos.

## 2.7 A fronteira do que um tema alcança — e as três saídas

**A lib entrega tokens e composições; o importador monta a página.** O `DynamicRenderer` recebe contratos
visuais e constrói sem conhecer o módulo — o manifesto é do consumidor.

Logo, ao replicar uma referência visual:

| A referência pede | O tema resolve? |
|---|---|
| paleta, tipografia, raio, sombra, glass, ruído, animação | ✅ inteiramente |
| densidade, gaps, largura de conteúdo, cromo, posição de sidebar | ✅ são tokens (131 de layout/estrutura) |
| **um carrossel de métricas, um gráfico específico** | ❌ **é composição** — manifesto ou componente novo |

**As três saídas, na ordem *(decisão do dono)*:**

1. **Compor com o que existe.** Primeira tentativa, sempre.
2. **⇒ RELATAR a lacuna** — *"a linguagem visual está replicada; a estrutura X não existe na lib"*. **Isto é
   obrigatório**, não opcional: a lacuna relatada é o **insumo da expansão sob demanda**. Agente que entrega o
   tema calado sobre o que não conseguiu replicar destrói o sinal que alimenta o roadmap.
3. **O importador resolve pontualmente**, se não puder esperar. Legítimo e **não ideal** — e vale dizer por
   quê: composição feita fora da lib não recebe token, não entra no catálogo e **não é coberta pelo gate de
   contraste**. É dívida do consumidor, não da lib — mas é dívida.

## 2.8 🔴 O MOTOR SOBRESCREVE O AUTOR — decisões D e C *(dono, 2026-08-10)*

> **Descoberto na revisão da `plan-24`** (ver o veredito §11.2 de lá). Sem isto, **esta plan não funciona**:
> o solucionador consertaria o token e o motor sobrescreveria o conserto na emissão. Token certo, tela igual.

`useDesignVariables.ts:43` chama `syncThemeWithMode` **sem condição** — não existe "se o modo mudou". Medido
sobre os 18 temas, cada um **no seu próprio modo nativo**: **1299 de 1316 valores de cor são alterados**, e
**178 de 648 veredictos de contraste divergem** entre o escrito e o emitido.

O motor mexe **só em luminosidade** — matiz e saturação passam intactos
(`Provider/utils/color-engine.ts:112,149`). As faixas de `shiftColorMode`:

| papel | escuro | claro |
|---|---|---|
| `bg` | L ≤ 15 | L ≥ 88 |
| `text` | L ≥ 85 | L ≤ 25 |
| `border` | **L = 20 fixo** | **L = 90 fixo** |
| `primary` | L ≥ 45 | L ≤ 55 |

**`bg` e `text` são complementares** — 15 contra 85 garante separação, e é por isso que texto estrutural quase
nunca falha. **`text` e `primary` se sobrepõem**: `text` sobe para L ≥ 85 e `primary` só garante L ≥ 45,
aceitando até 100. Botão primário é exatamente texto sobre primária:

```
btnPrimaryText  #000000  (text,    L=0)   → L=100  #ffffff
btnPrimaryBg    #00f2ff  (primary, L=50)  → L=50   #00f2ff   =  1,39:1
                                            o autor escreveu  = 15,14:1
```

O autor acertou e o motor destruiu o acerto. `border` é pior em natureza: `newL = 20` **descarta** `l`, não é
teto, é substituição.

### As duas decisões

**D — não inverter no modo nativo.** `syncThemeWithMode` só age quando o modo pedido **difere** do modo
declarado no tema. No modo nativo, **emitido = escrito**.

**C — papel `onPrimary`.** Na geração da contraparte, tokens que renderizam *sobre* uma primária calculam L
**em relação ao fundo real**, não por faixa fixa. O insumo já existe: a lista `PAIRS` da `plan-24` diz quem
senta sobre quem.

### Por que D, e não apertar as faixas

O motor faz **dois trabalhos** e só um foi pedido: *gerar a contraparte clara/escura* (legítimo) e *garantir
legibilidade* (aplicado sempre, como efeito colateral). O segundo é uma **reescrita silenciosa do valor do
autor** — e é o oposto do padrão desta base, onde a **R6** descarta chave fora do domínio **com
`console.warn`** e todo gate mede e declara. Aqui o motor muda o valor e não conta a ninguém.

Apertar a faixa de `primary` no escuro (a alternativa óbvia) é instrumento cego: apagaria primárias claras
vibrantes, cutucando justamente a diversidade da §2.1.

### O que D destrava

O **gate volta a ser verdadeiro** no modo nativo · o **solucionador passa a funcionar**, porque consertar o
token passa a consertar o render · a **granularidade volta a ser real**: `btnPrimaryText: #000000` a 15:1
sobrevive.

### ⚠️ O sequenciamento, que é onde isso pode dar errado

Os 18 temas foram autorados **contra** o motor forçando — os valores crus deles são ruins de propósito. O
`tooltipTextColor` idêntico ao `tooltipBg` no default é o retrato: cru dá 1:1, e só o motor resgata para
18:1.

**Logo D, sozinho, é uma regressão** — sai de 108 falhas visíveis para 188. É por isso que D **não é plan
própria**: ela não teria aceite possível ("a biblioteca ficou pior"). D é atômico com a regeração dos temas,
e por isso mora aqui.

# 3. Escopo

## 3.1 Dentro

1. **D — `syncThemeWithMode` só age em troca de modo** (§2.8). **Vem primeiro**: sem D, tudo abaixo é
   consertar token que o motor sobrescreve depois.
2. **Solucionador de contraste** — recebe um tema, mede os pares (usando o gate da `plan-24`), e **corrige só
   a luminância** dos que reprovam, preservando matiz e saturação. Devolve tema **+ relatório**.
3. **`liberdade-e-restricao.md`** em `.agents/skills/ui-criar-tema/references/` — o mapa. **Aponta** para o
   catálogo; nunca o transcreve.
4. **Gabarito completo** — `generate_theme_template.ts` passa a emitir os **422**.
5. **Passo 5 da skill** passa a medir **contraste**, além de completude.
6. **Regerar os temas** pelo agente, com liberdade, passando pelo solucionador. `minimalist-airy` **primeiro**
   — é `SARAK_REFERENCE_THEMES`, e a `09-temas-e-presets` §4.1 manda o consumidor cloná-lo.
7. **C — papel `onPrimary`** na geração da contraparte (§2.8), fechando a sobreposição `text`×`primary`.
8. **O gate ganha a segunda passada** — mede também o **modo oposto**. Sem ela, **C não é verificável**: hoje
   o gate só olha o modo nativo, então a contraparte gerada é território sem medição nenhuma.
9. **R31 ⚠️ → ✅** — a anotação é do revisor, na síntese. *(A `plan-24` já a tirou de ⏳: o gate existe. O que
   falta para ✅ são os dois vãos declarados nela — modo nativo e contraparte sem medição — e os temas.)*

## 3.2 Fora

- ⛔ **Gerador de paleta.** Descartado pelo dono, com motivo medido (§2.1). Se o solucionador começar a
  escolher matiz, virou gerador — **PARE**.
- ⛔ **Construir** o gate. É a `plan-24`; esta plan **usa** o que ela deixou. A única alteração permitida nele
  é a **segunda passada** do item 8 — que não muda a medição existente, acrescenta o modo oposto.
- ⛔ Criar token, mudar API de tema ou schema. **D e C mexem no motor de cores
  (`syncThemeWithMode`/`shiftColorMode`), não no contrato de tokens** — nenhum `tokenId` nasce, some ou muda
  de tipo.
- ⛔ **Apertar as faixas de `shiftColorMode`** como atalho para C (§2.8): apaga primária clara vibrante.
- ⛔ Criar componente novo para atender referência. É a saída 3 da §2.7, e é do dono.

## 3.3 O que o mapa precisa ter — e o que não pode ter

| Tem | Não tem |
|---|---|
| A **lista de pares** (`tokenId` de texto × `tokenId` de fundo), vinda da `plan-24` | a descrição dos 422 tokens — **isso é o catálogo** |
| **Onde não há restrição nenhuma**: matiz, saturação, efeito, atmosfera, textura, raio, tipografia, animação, sombra | valores sugeridos por token |
| Os temas atuais como **demonstração de amplitude** — um brutalista, um neon, um glass, um minimalista | gabarito a copiar |
| Como ler o catálogo (`categories`, `allowedValues`, `relatedTokens`) | cópia de qualquer campo dele |

> **O mapa responde uma pergunta que o catálogo não responde:** *"onde eu posso ser radical sem quebrar
> nada?"* — e a resposta é: em quase tudo, **menos** na relação de luminância dos pares listados.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Plan | [[plan-24-aplicacao-de-temas]] | o gate, a lista de pares e a composição de alfa |
| Skill | `.agents/skills/ui-criar-tema/` | o workflow a alterar (passo 5) e o gabarito |
| Fonte | `catalog/partitions/*.json` | a documentação dos 422 — **para apontar, não copiar** |
| Spec fixa | [[00-regras-e-invariantes]] → **R17**, **R11**, **R31** | não transcrever; não inventar token; o alvo |
| Utilitário | `src/core/Design/utils/themeAxes.ts` | completude por eixo — **avisa, não lança** |
| **Skill** | `ui-criar-tema` · `test-unitario` · `padrao-typescript` | |

# 5. Instruções de execução

1. **D antes de tudo.** Enquanto o motor sobrescrever no modo nativo, todo conserto de token é invisível na
   tela. Espere a biblioteca **piorar** logo depois de D (108 → 188 falhas) — é o esperado, e é a regeração
   dos temas que paga.
2. **Solucionador antes dos temas.** Se os temas vierem antes, o solucionador nasce sem caso real
   para se provar.
3. **Prove que ele NÃO homogeneiza.** É o critério que define esta plan: rode-o sobre dois temas de intenções
   opostas — um brutalista e um glass — e mostre que **matiz e saturação sobreviveram** em ambos.
4. **O relatório é entrega, não log.** Estrutura fixa: par, valor antes, valor depois, delta, razão atingida.
5. **`minimalist-airy` primeiro** entre os temas — cada dia reprovado é um consumidor herdando o defeito.
6. **Um tema por vez**, com o relatório do solucionador colado.
7. **C por último**, com a segunda passada do gate junto — construir C sem ela é entregar sem medição.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-24-1-fluxo-de-criacao-de-tema.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md (R17, R11, R31),
specs/specs/09-temas-e-presets.md, a plan-24 (o gate e a lista de pares),
.agents/skills/ui-criar-tema/SKILL.md, e a §2 desta plan.
Skills: ui-criar-tema, test-unitario, padrao-typescript, padrao-escrita.

⚠️ A RESTRIÇÃO DE PRODUTO QUE DEFINE ESTA PLAN: o dono já tentou gerador de
paleta, e TODOS OS TEMAS FICARAM PARECIDOS. O coração da lib é a diversidade.
Se o que você construir começar a ESCOLHER matiz ou saturação, virou gerador ⇒ PARE.

PASSO 1 — DECISÃO D: o motor para de sobrescrever o autor.
  `useDesignVariables.ts:43` chama `syncThemeWithMode` SEM CONDIÇÃO. Passe a
  chamá-la só quando o modo pedido DIFERIR do modo declarado no tema. No modo
  nativo, emitido = escrito.
  Medido pelo revisor: hoje 1299/1316 valores de cor mudam e 178/648 veredictos
  divergem, com os temas no PRÓPRIO modo nativo.

  ⚠️ ESPERE A BIBLIOTECA PIORAR: 108 → 188 falhas de contraste. É o esperado —
    os 18 temas foram autorados CONTRA o motor forçando, e é o PASSO 6 que paga.
    NÃO reverta D ao ver o número subir.
  ⚠️ D é pré-requisito de tudo abaixo: sem ele, o solucionador conserta o token
    e o motor sobrescreve o conserto na emissão. Token certo, tela igual.

PASSO 2 — SOLUCIONADOR DE CONTRASTE.
  Recebe um tema; usa o gate da plan-24 para medir os pares; e onde reprova,
  ajusta SÓ A LUMINÂNCIA, preservando matiz e saturação.
  Devolve o tema E UM RELATÓRIO: par, valor antes, valor depois, delta, razão.
  O relatório é ENTREGA, não log — é ele que torna a correção uma proposta
  revisável em vez de um fato consumado.

  ⇒ A PROVA QUE DEFINE O ACEITE: rode sobre dois temas de intenções OPOSTAS
    (um brutalista, um glass) e demonstre que matiz e saturação SOBREVIVERAM.
    Sem essa prova, você construiu um gerador e não percebeu.

PASSO 3 — `liberdade-e-restricao.md` em .agents/skills/ui-criar-tema/references/.
  ⚠️ NÃO TRANSCREVA O CATÁLOGO. Ele já documenta os 422 tokens (description,
    type, allowedValues, relatedTokens) e é GERADO — copiar viola a R17 e
    envelhece no primeiro token novo.
  O mapa tem: a LISTA DE PARES (da plan-24) · onde NÃO há restrição (matiz,
  saturação, efeito, atmosfera, textura, raio, tipografia, animação, sombra) ·
  os temas atuais como demonstração de AMPLITUDE, não como gabarito ·
  como ler o catálogo. Ver §3.3 — tem uma tabela do que pode e do que não pode.

PASSO 4 — generate_theme_template.ts passa a emitir os 422 tokens.
  Gerar completo; ACEITAR continua permissivo (findMissingThemeAxes avisa e não
  lança — não mexa nisso, é o que protege tema antigo).

PASSO 5 — passo 5 da skill passa a medir CONTRASTE, além de completude.
  Hoje ele roda audit + vitest e mede eixos com findMissingThemeAxes. Não mede
  contraste porque o gate não existia. Sem isso, o agente segue criando tema
  reprovado e descobrindo depois.

PASSO 6 — regerar os temas, UM POR VEZ, com o relatório do solucionador colado.
  minimalist-airy PRIMEIRO: é SARAK_REFERENCE_THEMES e o consumidor o CLONA.
  Liberdade total de estilo; o solucionador cuida do contraste.

PASSO 7 — DECISÃO C: papel `onPrimary`, e a SEGUNDA PASSADA do gate.
  Depois de D, a inversão só roda na TROCA de modo — e é lá que sobra o defeito
  estrutural: as faixas de `shiftColorMode` para `text` (escuro: L ≥ 85) e
  `primary` (escuro: L ≥ 45, aceita até 100) SE SOBREPÕEM. Botão primário é
  texto sobre primária, e o par não tem separação garantida.
  C: tokens que renderizam SOBRE uma primária calculam L em relação ao FUNDO
  REAL, não por faixa fixa. O insumo é a lista PAIRS da plan-24 — ela já diz
  quem senta sobre quem. NÃO aperte a faixa de `primary`: isso apagaria
  primárias claras vibrantes e cutuca a diversidade que é o coração da lib.

  ⇒ JUNTO, a SEGUNDA PASSADA: o gate passa a medir também o MODO OPOSTO. Hoje
    ele só olha o nativo, então a contraparte gerada é território SEM MEDIÇÃO.
    Sem ela, C não é verificável — você teria consertado no escuro.

LINHAS VERMELHAS:
  · Você NÃO constrói gerador de paleta. Ver o aviso no topo.
  · Você NÃO constrói o gate — é a plan-24; esta USA o que ela deixou. A única
    mudança permitida nele é a SEGUNDA PASSADA do PASSO 7.
  · Você NÃO cria token nem muda API de tema/schema. D e C mexem no MOTOR DE
    CORES, não no contrato de tokens — nenhum tokenId nasce, some ou muda.
  · Você NÃO aperta as faixas de shiftColorMode como atalho para C.
  · Você NÃO reverte D ao ver as falhas subirem de 108 para 188 — é o esperado.
  · Você NÃO transcreve o catálogo no mapa.
  · Você NÃO cria componente para atender referência — é decisão do dono.

META: R31 ⚠️ → ✅, com todos os temas passando e o solucionador provado como
não-homogeneizador. (A síntese da plan-24 já tirou R31 de ⏳ para ⚠️: o gate
EXISTE e está vermelho. O que falta para ✅ são os vãos declarados nela — o
modo nativo (D) e a contraparte sem medição (segunda passada) — mais os temas.)

Os três espelhos: gates/baselines/ · sarak-dev/ · sarak-ui/.

VERIFICAÇÕES, com a saída colada:
  npm run audit           (ANTES e DEPOIS — o gate da plan-24 fecha em VERDE)
  npx vitest run          (INTEIRA)
  npm run gate-limits:check · npm run dev-kit:check · npm run guide:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] **A prova de não-homogeneização existe**: dois temas de intenções opostas, com matiz e saturação
      preservados, demonstrado lado a lado. **Sem ela, a plan não fecha.**
- [ ] **D entregue**: `syncThemeWithMode` não roda no modo nativo, e existe **teste** de que um tema no
      próprio modo emite **exatamente** o que o autor escreveu — `btnPrimaryText: #000000` sai `#000000`.
- [ ] O salto **108 → 188** logo após D está **relatado**, e o número final volta a **0** depois do passo 6.
- [ ] **C entregue**: nenhum par texto-sobre-primária reprova **na contraparte gerada**, e a faixa de
      `primary` **não foi apertada** para consegui-lo.
- [ ] **A segunda passada existe**: o gate mede os dois modos, e o número do modo oposto está no baseline.
- [ ] O solucionador ajusta **só luminância** — nenhuma escolha de matiz ou saturação no código.
- [ ] O **relatório** tem estrutura fixa (par, antes, depois, delta, razão) e sai em toda correção.
- [ ] `liberdade-e-restricao.md` **não contém** descrição de token copiada do catálogo — só ponteiros.
- [ ] O gabarito emite os **422**; `findMissingThemeAxes` **continua avisando sem lançar**.
- [ ] O passo 5 da skill mede **contraste**.
- [ ] `minimalist-airy` foi o **primeiro**, com relatório colado.
- [ ] O gate da `plan-24` fecha **verde**; R31 ⏳ → ✅.
- [ ] `npx vitest run` verde; baseline e espelhos regravados junto.

# 8. Como verificar

```bash
npm run audit                    # o gate de contraste, agora VERDE
npx vitest run
npm run gate-limits:check
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
```

# 9. Destino da síntese

`specs/specs/09-temas-e-presets.md` (o fluxo de criação, o solucionador e o mapa) ·
`specs/specs/00-regras-e-invariantes.md` (R31 ⏳ → ✅) ·
`specs/specs/01-gates-e-baseline.md` (baseline).

# 10. Resumo da execução

*(a preencher pelo executor)*

# 11. Veredito

*(a preencher pelo revisor)*
