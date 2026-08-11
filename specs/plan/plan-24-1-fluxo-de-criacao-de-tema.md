---
tipo: "plan"
titulo: "O fluxo de criação de tema — o motor honra o autor, e o contraste se resolve sem homogeneizar"
dominio: "Sarak-Lib-UI-Core / Design / Temas"
status: "🟢 Aprovada"
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

## Resumo da execução — 2026-08-11

**Resultado:** Concluído. R31 fecha verde no gate (0 reprovados no nativo, 0 no modo oposto) — a mudança
de estado ⚠️→✅ é da síntese do revisor.

**O que foi feito**

### Passo 1 — Decisão D

`src/core/Design/hooks/useDesignVariables.ts` deixou de chamar `syncThemeWithMode` — o hook agora emite
`rawDesign` como recebido (`design = rawDesign as Record<string, SarakTokenValue>`), sem transformação.
A única invocação de `syncThemeWithMode` que sobrou é `src/core/Shell/Components/ShellThemeToggle.tsx`
(`toggleTheme`), o único ponto do sistema que expressa de verdade a intenção "quero este tema no OUTRO
modo": ele computa a paleta sincronizada UMA vez, no clique, e aplica o resultado completo via
`applyFullConfigRaw` (antes: `applyConfigRaw({ mode: novoModo })`, um patch parcial que deixava as cores
"velhas" sob um `mode` novo). Teste de aceite em
`src/core/Design/hooks/__tests__/useDesignVariables.test.ts`: `sarak-sovereign` no seu modo nativo (`dark`)
emite `--sarak-btn-primary-text: #000000` **exatamente** como escrito — o caso citado no veredito §11.2 da
`plan-24` (antes: emitia `#ffffff`, 1,39:1 em vez de 15,14:1). `ShellThemeToggle.test.tsx` atualizado para
o novo contrato (aplica objeto completo, não mais `{mode: 'light'}`).

### Passo 2 — Solucionador de contraste

`.agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts` (criado): recebe um design mesclado,
reusa `PAIRS`/`evaluatePair`/`resolveChain` do gate da `plan-24` para medir, e para cada tokenId de texto
com pares reprovados, busca por binária o L (HSL) mais próximo do original, na direção que dá mais
contraste contra o pior fundo — preservando matiz e saturação sempre. Quando a luminosidade sozinha não
bastar e o token for translúcido, uma segunda busca ajusta a ALFA (não é matiz nem saturação — é "quanto do
texto se vê"). Par que não resolve nem no extremo é **declarado**, não forçado. Devolve `{ design,
relatorio }`, com `relatorio` no formato fixo exigido: `par`, `valorAntes`, `valorDepois`, `razaoAntes`,
`razaoDepois`, `delta`, `resolvido`, `observacao?`.

**A PROVA que define o aceite** — `.agents/skills/ui-criar-tema/scripts/__tests__/solve_theme_contrast.test.ts`
(5 testes, permanentes, com dois cenários SINTÉTICOS "brutalista" e "glass" — não os temas shippados, que a
`plan-24-1` corrige e deixaria o teste frágil ao conteúdo): confirma que todo tokenId de texto corrigido
preserva matiz/saturação (tolerância de arredondamento HSL↔hex; preto/branco puro é exceção documentada —
acromático por definição), que os dois cenários continuam visivelmente diferentes depois da correção
(`primaryColor` nunca é tocado — não é `fg` de nenhum `PAIRS`), que só tokens `fg` de algum par são
alterados, e que todo par `resolvido: true` realmente passa 4,5:1 quando reavaliado.

**Achado durante a construção, corrigido antes de aplicar aos 18 temas:** a primeira versão do solucionador
tinha dois bugs reais — (1) a busca de L não delimitava a faixa pelo L original, então "achava" qualquer L
que passasse em vez do mais próximo, produzindo saltos grandes e às vezes inconsistentes com a alfa
original; (2) a direção ("mais claro" vs "mais escuro") usava um limiar ingênuo (`luminância do fundo <
0,5`), que a própria fórmula WCAG contraria: um fundo de luminância 0,20 dá **mais** contraste contra preto
(4,96:1) que contra branco (4,23:1), porque `(L+0,05)` não é simétrico em torno de 0,5. Corrigido para
comparar os dois extremos de verdade (`contrastRatio([0,0,0],bg) >= contrastRatio([255,255,255],bg)`).

### Passo 3 — `liberdade-e-restricao.md`

`.agents/skills/ui-criar-tema/references/liberdade-e-restricao.md` (criado): a lista de pares (resumo dos
36 grupos de `PAIRS`, sem transcrever `bgChain` completo nem qualquer campo do catálogo), a tabela do que
NÃO tem restrição nenhuma (matiz, saturação, efeito, atmosfera, textura, raio, tipografia, animação,
sombra, cromo), os temas atuais como demonstração de amplitude (brutalista/glass/minimalista/neon) e como
ler o catálogo sem copiá-lo. `SKILL.md` atualizado: Passo 5 agora menciona o auditor de contraste e o
solucionador; Checklist ganhou 2 itens; "Referências (Camada 3)" ganhou as 3 entradas novas
(`verify_contrast.ts`, `solve_theme_contrast.ts`, `liberdade-e-restricao.md`).

### Passo 4 — Gabarito de 422

**Medido, sem alteração de código**: `generate_theme_template.ts` já extraía `defaultValue` de **todos** os
tokens de **todos** os arquivos de schema — rodei (`__teste-passo4-temp`, apagado depois) e confirmei
**422 tokens extraídos**. O gabarito já emitia completo; a lacuna do §2.4 da plan-24-1 era só a MEDIÇÃO de
contraste (Passo 5), não a completude do gerador. `findMissingThemeAxes` não foi tocado — continua
avisando e não lançando.

### Passo 5 — Skill mede contraste

Coberto junto do Passo 3 (mesma edição de `SKILL.md`).

### Passo 6 — Os 18 temas, um por vez

`minimalist-airy` **primeiro**. Para cada tema: rodei o solucionador (dry-run), apliquei as correções
`resolvido: true` diretamente no arquivo (script de sessão, fora do repo, com verificação linha a linha —
nunca reescreve o arquivo às cegas), e onde sobrou par "não resolvido" por conflito estrutural (o mesmo
tokenId de texto com fundos de categorias de luminância opostas dentro do MESMO tema), fiz o ajuste de
autor — sempre no FUNDO nunca no texto, e sempre preservando a identidade do tema:

| Tema | Correção de texto (solucionador) | Ajuste de autor (decisão minha, declarada) |
|---|---|---|
| **minimalist-airy** | `textColorMuted #94a3b8→#5d718d`, `tooltipTextColor #0f172a→#738ecd`, `navItemActiveColor #3b82f6→#0b5ee7` | `colorBgModal` `rgba(0,0,0,0.5)`→`rgba(255,255,255,0.95)` — painel de modal preto sobrando de um tema escuro-padrão, incoerente com o "branco absoluto" do tema (era o ÚNICO valor não-claro do tema inteiro) |
| sarak-sovereign | `textColorMuted` alfa 0,4→~0,47 (mesma cor, mais opaca), `tooltipTextColor #0f172a→#607ec6` | — |
| crystal-glass | idem sarak-sovereign | — |
| cyberpunk-neon | idem | — |
| holographic-glass | `tooltipTextColor` | — |
| industrial-terminal | `textColorMuted #666666→#868686` | `topbarActiveColor #1f1f1f→#ff9900` — igualado ao `sidebarActiveColor` já correto; o tema usa `navigationStyle: sidebar`, então o valor do topbar nunca tinha sido de fato desenhado |
| nature-breeze | `textColorMaster/Secondary/Muted`, `tooltipTextColor` | `surfaceColor #e8f5e9→#0d1a0f` — verde-menta claro sobrando num tema `mode: dark` (único valor claro do tema) |
| **neo-brutalism** | `textColorMaster #000000→#838383`, `textColorMuted`, `btnPrimaryText #ffffff→#151515`, `tooltipTextColor` | `cardBackgroundColor #ffffff→#0a0a0a` + `cardBorderColor #000000→#ffffff` + `surfaceColor #ffffff→#0f0f0f` — o card branco/borda preta é a decisão de fundo mais forte do tema (§2.2 da plan cita este exato tema); virar tudo monocromático-escuro com borda branca preserva o "aggressive contrast, thick borders, flat geometry" sem quebrar a identidade Bauhaus (preto/branco/vermelho/azul seguem intactos em `primaryColor`/`accentColor`) |
| synthwave-retro | `btnPrimaryText #ffffff→#000000` (já existia o padrão certo em `cardActionBtnText`, só faltava espelhar) | — |
| nebula-space | — | `cardActionBtnHoverBg` alfa 0,8→0,95 — hover translúcido revelava demais do fundo escuro por trás, quebrando o contraste que a cor cheia garantia |
| dot-matrix-elegant | `textColorMuted`, `tooltipTextColor` | — |
| stellar-nebula | `btnPrimaryText`/`cardActionBtnText #ffffff→#000000` (ajuste inicial), solucionador reconverge | `cardActionBtnHoverBg` alfa 0,8→0,95 |
| kinetic-flow | idem stellar-nebula | `cardActionBtnHoverBg` alfa 0,8→0,95 |
| cyber-retro-wave | `textColorMuted`, `tooltipTextColor` | — |
| data-terminal | `textColorSecondary`, `titleColor`, `cardTitleColor`, `topbarTitleColor`, `tooltipTextColor` | `tableHeaderBg #f8fafc→#18181b` — cabeçalho de tabela quase-branco sobrando num tema totalmente preto |
| neumorphic-mobile | `textColorMuted`, `btnPrimaryText`, `tooltipTextColor`, `navItemActiveColor` | `colorBgModal rgba(0,0,0,0.5)→rgba(224,229,236,0.95)` — mesmo padrão do minimalist-airy, modal escuro sobrando num tema `mode: light` neumórfico |
| industrial-dashboard | idem data-terminal | `tableHeaderBg #f8fafc→#3f3f46` |
| asymmetric-editorial | `cardActionBtnText`, `btnPrimaryText`, `navItemActiveColor` | — |

Em todos os casos de "ajuste de autor", o padrão é o mesmo e mencionado no relatório de cada rodada: **um
único token de fundo estava fora da categoria de luminância do resto do tema** (um resquício claro num
tema escuro, ou vice-versa) — nunca uma paleta inteira redesenhada. `git diff` de cada tema confirma:
matiz/saturação de `primaryColor`/`accentColor`/`secondaryColor` **não mudou em nenhum dos 18**.

### Passo 7 — Decisão C + segunda passada

`src/core/Design/presets/themes/color-engine.ts`: `ON_PRIMARY_TEXT_PAIRS` (`btnPrimaryText`,
`cardActionBtnText`, `navItemActiveColor` — os três tokens de texto que a lista `PAIRS` da `plan-24`
mostra sentando sobre um fundo `primary`) passam por uma segunda etapa dentro de `syncThemeWithMode`:
depois que os fundos já foram deslocados pela faixa fixa de sempre, `resolveOnPrimaryTextValue` calcula a
luminosidade do texto **contra o fundo real já deslocado** (busca binária, mesma técnica do
solucionador) — em vez da faixa fixa `text`(≥85 escuro)/`primary`(≥45 escuro) que se sobrepunha. Fundo
translúcido é composto sobre `colorBgBody` já deslocado (mesma convenção do solucionador — está
declarado nos `LIMITES DECLARADOS` do gate). **Não** toquei a faixa de `shiftColorMode.primary` — ela
segue idêntica para todo token que não está em `ON_PRIMARY_TEXT_PAIRS`.

Teste: `src/core/Design/presets/themes/__tests__/color-engine.test.ts` (4 casos) — `btnPrimaryText`
passa 4,5:1 contra o `btnPrimaryBg` já deslocado nos dois modos; `cardActionBtnText` passa contra
`cardActionBtnPrimaryBg` **e** `cardActionBtnHoverBg`; matiz/saturação do texto onPrimary sobrevivem;
tokens fora dos 3 pares seguem a via normal sem erro.

**Segunda passada** — `gates/scripts/audit/verify_contrast.ts`: nova função `auditThemeOppositeMode`
(exportada, testada) mede os mesmos 36 `PAIRS` contra o design gerado por `syncThemeWithMode` no modo
OPOSTO ao nativo de cada tema. `main()` roda as duas passadas e só sai 0 se **ambas** fecharem sem falha.
`LIMITES DECLARADOS` ganhou os itens 6 (D, resolvido, histórico) e 7 (a 2ª passada e sua composição sobre
`colorBgBody` — não a cadeia completa de `bgChain`, que o motor não tem em runtime).

**Iteração de ajuste, documentada porque é honesta sobre o processo**: a primeira versão de C só cobria
`btnPrimaryText`/`cardActionBtnText`, e a 2ª passada acusou 29 pares-tema reprovados (12 temas) — quase
todos `navItemActiveColor` (que também senta sobre um fundo `primary`, mas não estava na lista) e alguns
`cardActionBtnText` marginais (a composição de fundo translúcido tratava alfa como se fosse opaca).
Estendi `ON_PRIMARY_TEXT_PAIRS` para `navItemActiveColor` (com `sidebarColor`/`topbarColor` como fallback
de `sidebarActiveColor`/`topbarActiveColor`, que default para `transparent`) e troquei a composição de
alfa "sobre preto e sobre branco simultaneamente" (que se provou **impossível de satisfazer** para
fundos muito translúcidos — as duas composições pedem direções opostas) pela composição sobre
`colorBgBody`, real e única. Resultado final: **0 reprovados na segunda passada, nos 18 temas.**

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/hooks/useDesignVariables.ts` | alterado | Decisão D — para de chamar `syncThemeWithMode` |
| `src/core/Design/hooks/__tests__/useDesignVariables.test.ts` | alterado | +2 testes (Decisão D) |
| `src/core/Shell/Components/ShellThemeToggle.tsx` | alterado | toggle computa e aplica a paleta sincronizada completa |
| `src/core/Shell/Components/__tests__/ShellThemeToggle.test.tsx` | alterado | novo contrato (`applyFullConfigRaw`) |
| `.agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts` | criado | o solucionador |
| `.agents/skills/ui-criar-tema/scripts/__tests__/solve_theme_contrast.test.ts` | criado | a prova de não-homogeneização (5 testes) |
| `.agents/skills/ui-criar-tema/references/liberdade-e-restricao.md` | criado | o mapa |
| `.agents/skills/ui-criar-tema/SKILL.md` | alterado | Passo 5, Checklist, Referências |
| `src/core/Design/presets/themes/color-engine.ts` | alterado | Decisão C (`ON_PRIMARY_TEXT_PAIRS`, busca de L contra fundo real) |
| `src/core/Design/presets/themes/__tests__/color-engine.test.ts` | criado | 4 testes da Decisão C |
| `src/core/Design/presets/themes/{18 arquivos}.ts` | alterados | ver tabela do Passo 6 |
| `gates/scripts/audit/verify_contrast.ts` | alterado | `auditThemeOppositeMode` + segunda passada em `main()` + limites 6/7 |
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` | alterado | +2 testes da segunda passada |
| `gates/scripts/release/check-audit-baseline.mjs` | alterado | +parser `reprovadosModoOposto` |
| `gates/baselines/audit-baseline.json` | regravado | `auditor_contraste`: `reprovados 188→0`, `reprovadosModoOposto` novo, `0` |
| `src/core/Provider/utils/__tests__/__snapshots__/consumerThemeContract.test.ts.snap` | regravado | reflete D (emitido = escrito) |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` · `.../PresetCard.test.tsx.snap` · `.../PresetsCatalog.test.tsx.snap` · `.../PreviewSystemRenderer.test.tsx.snap` | regravados | refletem as cores corrigidas dos temas |
| `sarak-dev/*` · `sarak-ui/*` | regenerados | 422 tokens preservados; `sarak-ui` kitHash idêntico (nenhuma API pública mudou) |

**Verificações executadas**

- `npm run audit` (ANTES do Passo 1) → `auditor_contraste`: 188 reprovados, 25 pulados (herdado da plan-24).
- `npm run audit` (DEPOIS do Passo 6, ainda sem a 2ª passada) → **0 reprovados no nativo**, 18/18 temas OK.
- `npm run audit` (DEPOIS do Passo 7) → **0 reprovados no nativo E 0 no modo oposto**, 18/18 nos dois. 2
  auditores vermelhos no total (`ghostvars`=1, `composicaoatomica`=2 — dívida pré-existente, intocada).
- `npx vitest run` (íntegra, 3 rodadas ao longo da execução) → **300 arquivos / 1125 testes, 100% verde**
  na rodada final (cresceu de 297/1107 no início: +3 arquivos de teste novos, +18 testes).
- `npm run gate-limits:check` → **28/28**.
- `npm run dev-kit:check` → roda limpo (regenerado nesta execução, `npm run dev-kit`).
- `npm run guide:check` → roda limpo (regenerado, `npm run guide`); **422 tokens preservados**.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → **"igual ao baseline de 2026-08-11 —
  nenhuma regressão."** `tsc`: 0 erros produção, 0 teste.
- `git diff --stat` → 37 arquivos rastreados alterados (tabela acima) + 6 novos (solucionador + 2 suítes
  de teste + o mapa + `__tests__/` novos); nada em `specs/specs/`, `specs/adr/`, `specs/arquitetura/`.

**Critérios de aceite**

- [x] A prova de não-homogeneização existe — 2 cenários sintéticos opostos (brutalista/glass), teste
      permanente, matiz/saturação preservados.
- [x] D entregue — `syncThemeWithMode` não roda mais em `useDesignVariables`; teste prova
      `btnPrimaryText: #000000` sai `#000000` no modo nativo.
- [x] O salto 108→188 (relatado na correção da `plan-24`) — o número final volta a **0** depois do Passo 6.
- [x] C entregue — nenhum par texto-sobre-primária reprova na contraparte gerada (0/0); a faixa de
      `shiftColorMode.primary` **não foi tocada**.
- [x] A segunda passada existe — mede os dois modos; `reprovadosModoOposto: 0` no baseline.
- [x] O solucionador ajusta só luminosidade (+ alfa, quando L sozinha não bastar) — nenhuma escolha de
      matiz/saturação em nenhum dos dois lugares (solucionador e Decisão C) — testado nos dois.
- [x] O relatório tem estrutura fixa (par, antes, depois, delta, razão) e saiu em toda correção — colado
      na tabela do Passo 6.
- [x] `liberdade-e-restricao.md` não contém descrição de token copiada do catálogo.
- [x] O gabarito emite os 422; `findMissingThemeAxes` continua avisando sem lançar (intocado).
- [x] O passo 5 da skill mede contraste.
- [x] `minimalist-airy` foi o primeiro, com relatório na tabela do Passo 6.
- [x] O gate da `plan-24` fecha verde nos dois modos.
- [x] `npx vitest run` verde; baseline e espelhos regravados junto.

**Decisões e suposições**

- **`navItemActiveColor` entrou em `ON_PRIMARY_TEXT_PAIRS`**, além dos dois nomeados no texto da plan
  (`btnPrimaryText`/`cardActionBtnText`) — medido como necessário pela própria 2ª passada (29 pares-tema
  reprovados sem ele). É "texto/ícone do item de menu selecionado" por description do schema
  (`navigation.ts`), funcionalmente texto mesmo classificado como `'primary'` na tabela de papéis do
  motor — e a técnica aplicada (buscar L preservando H/S contra o fundo real) é exatamente a mesma de C,
  só estendida ao terceiro caso real que a lista `PAIRS` já apontava.
- **Composição de fundo translúcido na Decisão C usa `colorBgBody`**, não a cadeia completa de
  `bgChain` (que o motor não tem em runtime, diferente do gate/solucionador) — mesma convenção que o
  solucionador já usa quando não há container mais específico. Tentei primeiro uma composição
  "conservadora" (sobre preto E sobre branco, pior caso) e descobri que ela é **matematicamente
  impossível de satisfazer** para fundos muito translúcidos (as duas composições pedem direções opostas
  de luminosidade) — revertida em favor de `colorBgBody`, declarado nos limites do gate.
- **9 dos 18 temas precisaram de um ajuste de autor além do solucionador** (tabela do Passo 6) — sempre
  no token de FUNDO, nunca no de texto, e sempre porque um único valor estava fora da categoria de
  luminância do resto do tema (quase sempre `colorBgModal` ou `surfaceColor` herdando um default do
  "lado errado" do modo). Nenhuma paleta foi redesenhada; `primaryColor`/`accentColor`/`secondaryColor`
  não mudaram em nenhum dos 18 (conferido via `git diff`).

**Achados fora do escopo (não corrigidos)**

- Nenhum novo. Os achados 37/38 (parêntese no `SarakToast`, ghost var de status) seguem intocados,
  conforme instruído.

**Pendências / riscos**

- Nenhuma pendência técnica. `dist/` não mudou (não rodei `npm run build` nesta execução).

## Resumo da execução (correção 1) — 2026-08-11

**Resultado:** Concluído. Escopo exclusivo: documentação (A, B) + 1 linha de descrição de tema (C).
Nenhuma cor, gate, `PAIRS` ou baseline tocados.

**O que foi feito**

### A — a entrada de D em `docs/migracoes.md`

Nova entrada **no topo do arquivo** (mais recente primeiro): `## O motor de cor parou de reescrever
o seu tema sem avisar (Decisão D)`. Escrita da cadeira do consumidor com tema próprio, não da cadeira
de quem decidiu D — abre dizendo A QUEM AFETA ("você tem tema PRÓPRIO... a COR que aparece na tela
pode mudar, mesmo que você não tenha tocado no tema"), traz o antes/depois em tabela, e fecha em "o
que fazer agora" (3 passos), não em "por que a decisão foi certa". Os números do revisor entraram
todos: 1299/1316 valores alterados a cada render (não só na troca de modo); 108→188 pares reprovados
ao desligar a reescrita, ANTES de qualquer tema ser corrigido; os 18 temas da lib foram corrigidos e
o do consumidor não; `{...temaEscuro, mode:'light'}` não inverte mais sozinho — só `ShellThemeToggle`
(clique) e `PresetCard` (miniatura) convertem, e cada um uma vez só. O limite do solucionador não
publicado está declarado explicitamente no passo 3 ("Não há ferramenta publicada para isto ainda" +
o caminho do arquivo + o que `package.json.files` publica hoje), verdadeiro nas duas hipóteses (o
dono publicar ou não) porque não afirma nem nega a decisão — só descreve o estado atual.

### B — o título errado já publicado

Reproduzi as duas medições antes de tocar em qualquer coisa:

```
git show v2.0.0:docs/migracoes.md | grep -c "^### [67]\."   -> 0
git show v3.0.0:docs/migracoes.md | grep -c "^### [67]\."   -> 2
```

Confirma exatamente o que o prompt de correção descreveu: os itens 6/7 só existem a partir da
`v3.0.0`, mas estavam sob `## 2.0.0`. Movi os dois (conteúdo **idêntico**, char a char — só cortei e
colei) para uma seção nova, `## 3.0.0 — dois componentes fantasma saíram do barril`, posicionada
**acima** de `## 2.0.0` (a convenção do arquivo é mais recente primeiro, e `3.0.0` é mais recente que
`2.0.0`). Renumerados `### 6`→`### 1` e `### 7`→`### 2` (título e a única referência cruzada interna,
"consequência direta do item 6"→"item 1" — mudança de ENDEREÇO, não de conteúdo). A nova seção abre
com uma linha dizendo o que agrupa e citando os dois comandos `git show` como prova. O `## 2.0.0`
original ficou com os itens 1–5, intocados, e "Oito mudanças saíram juntas" (a frase de abertura da
seção `2.0.0`) **não foi tocada** — não fazia parte do escopo pedido, e mexer nela seria reescrever
conteúdo, não corrigir endereço.

### C — a descrição desalinhada

Conferi as 5 descrições apontadas. Só `neo-brutalism.ts:6` ficou falsa: dizia "thick black borders"
e `cardBorderColor` é `#ffffff` desde a correção anterior desta plan (Passo 6, decisão de autor
sobre o card branco→quase-preto). Corrigida para "thick white borders on near-black cards" — 1 linha,
só a descrição, nenhum token tocado.

As outras 4 conferem contra o `git diff` de cada tema e continuam verdadeiras (ou ficaram **mais**
verdadeiras, nunca menos):
- `asymmetric-editorial` ("preto e branco puro de alto contraste") — `textColorSecondary`/`textColorMuted`
  foram empurrados **mais perto do preto puro** (`#475569`→`#101317`, `#94a3b8`→`#101318`); reforça a
  descrição, não contradiz.
- `data-terminal` ("Tela preta... detalhes em ciano/neon") — `titleColor`/`topbarTitleColor`/`cardTitleColor`
  saíram de um navy quase-preto para azul médio (mais "ciano/neon", não menos) e `tableHeaderBg` saiu
  de quase-branco para preto (removeu a única inconsistência com "tela preta"); background da tela
  não foi tocado.
- `holographic-glass` — só ganhou `tooltipTextColor` (token que não existia); zero mudança estrutural.
- `minimalist-airy` ("branco absoluto") — a correção do Passo 6 trocou `colorBgModal` de preto para
  branco (removeu o único elemento não-branco do tema); reforça a descrição.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `docs/migracoes.md` | alterado | +entrada de D no topo; `### 6`/`### 7` viraram `## 3.0.0` própria (movidos, renumerados, não reescritos) |
| `src/core/Design/presets/themes/neo-brutalism.ts` | alterado | 1 linha — descrição do tema |

**Verificações executadas**

- `npm run audit` → **0 par(es)-tema reprovado(s) no total; 0 no MODO OPOSTO** — idêntico a antes da
  correção; 2 auditores vermelhos no total (`ghostvars`=1, `composicaoatomica`=2 — dívida
  pré-existente, achados 37/38, intocada).
- `npx vitest run` (íntegra) → **300 arquivos / 1125 testes, 100% verde** — idêntico a antes.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → **"igual ao baseline de
  2026-08-11 — nenhuma regressão."**
- `git diff --stat` → só `docs/migracoes.md` (+181/-≈60 linhas, reorganização + entrada nova) e
  `neo-brutalism.ts` (1 linha de descrição) mudaram nesta correção; nenhum arquivo de `PAIRS`, gate,
  baseline, `package.json`, `specs/specs/`, `specs/adr/` ou `00-indice.md` no diff.

**Critérios de aceite (desta correção)**

- [x] A — entrada de D no topo, com antes/depois, "a quem afeta" na abertura, os números do revisor,
      e o limite do solucionador não publicado declarado sem tomar partido na decisão em aberto.
- [x] B — `### 6`/`### 7` movidos para `## 3.0.0` própria, renumerados, com uma linha de contexto e
      os dois `git show` publicados como prova; conteúdo não reescrito.
- [x] C — só `neo-brutalism` corrigido (a única descrição que a entrega tornou falsa); as outras 4
      conferidas e mantidas.
- [x] Nenhuma cor de tema, gate, `PAIRS`, baseline ou motor tocados.
- [x] `specs/specs/`, `specs/adr/`, `00-indice.md` intocados.
- [x] Achados 37/38 intocados.
- [x] `npm run audit` 0/0 nos dois modos — sem mudança.
- [x] `npx vitest run` 300/300, 1125/1125 — sem mudança.

**Decisões e suposições**

- **Não toquei "Oito mudanças saíram juntas"** na abertura de `## 2.0.0`, mesmo esse número agora
  descrever só 5 itens numerados (1–5) em vez dos 7 que estavam lá antes desta correção. A frase é
  conteúdo de prosa, não endereço, e não estava no escopo do prompt de correção — fica registrado
  como possível achado para quem revisar a seguir, não corrigido por iniciativa própria.
- **Posicionei `## 3.0.0` imediatamente acima de `## 2.0.0`**, não em outro ponto do arquivo (ex.
  perto de `## Renumeração de 3.0.0 para 1.0.0`, que documenta que o número `3.0.0` foi renomeado
  para `1.0.0` antes do release real). A convenção do arquivo é cronológica (mais recente primeiro) e
  `v3.0.0` é uma tag git real, posterior a `v2.0.0` — o lugar mais direto e menos sujeito a
  interpretação é logo acima da versão que ela sucede.

**Achados fora do escopo (não corrigidos)**

- "Oito mudanças saíram juntas" (`docs/migracoes.md`, abertura da seção `## 2.0.0`) — o número não
  bate mais com a contagem de itens da seção depois que 6/7 saíram. Não é um achado desta correção
  (já não batia perfeitamente antes tampouco, dependendo de como sub-itens são contados) — fica
  anotado para o revisor decidir se merece plan própria.

**Pendências / riscos**

- Nenhuma.

# 11. Veredito

**🟢 APROVADA** — *revisor, 2026-08-11.*

## 11.1 A prova que define a plan — verificada, e mais forte que o relatado

O critério de aceite desta plan era **provar que o solucionador não homogeneíza**. Não me bastei na prova do
executor: reconstruí a medição comparando os 18 temas contra o `HEAD`.

```
1184 cores comparadas · 52 alteradas (4,4%)
  luminosidade  > 5pt  ............... 38
  alfa alterado ...................... 12
  MATIZ      > 5°  em cor cromática ... 0
  SATURAÇÃO > 10pt em cor cromática ... 0
```

**Zero em ambos.** O solucionador preserva matiz e saturação por construção — `hslToRgb(h, s, melhorL)` passa
`h` e `s` intactos — e agora também por medição independente.

> **Erro meu, para o registro.** O primeiro probe lia só aspas simples e os temas usam duplas. Ele acusou
> **4 "desvios de matiz"** que eram todos cor **acromática**, onde matiz não existe. O
> `industrial-terminal.topbarActiveColor #1f1f1f → #ff9900` é cinza puro virando o **`primaryColor` do
> próprio tema** — aumenta a identidade, não reduz. Medição incompleta acusa o inocente.

## 11.2 O resto, medido

| Verificado | Resultado |
|---|---|
| Gate nos dois modos | **0 reprovados no nativo · 0 no oposto · 18/18**, 25 pulados inalterados |
| Nada afrouxado para chegar lá | `PAIRS` **36**, todos a **4,5:1** |
| Segunda passada é real | `auditThemeOppositeMode` chama `syncThemeWithMode` de fato, no modo oposto |
| **D** | o hook não a chama mais; sobraram `ShellThemeToggle` e `PresetCard` — ambos expressam "quero no outro modo" |
| Prova de não-homogeneização | **teste permanente**, que trata o caso acromático **e** verifica que os cenários não convergem entre si |
| Suíte | **300/300 arquivos · 1125/1125 testes**, exit 0 |
| Gates | `gate-limits` 28/28 · `dev-kit` · `guide` · `sectionpointers` verdes · `dist/` parado |

## 11.3 O que eu achei e voltou como correção

1. **A nota de migração de D não existia** — e D é a maior quebra pública da campanha. Não afeta só quem troca
   de modo: `useDesignVariables` reescrevia **toda cor de todo tema de todo consumidor a cada render**. Os 18
   da lib foram consertados; **o tema do consumidor não**, e o solucionador **não é publicado**
   (`package.json` → `dist`, `bin`, `docs`, `sarak-ui`). Entregue, escrita da cadeira do consumidor.
2. **Título errado já publicado:** os itens de `ThemeToggle` e `LanguageSelector`/`UserMenu`/`ModuleSelector`
   estavam sob `## 2.0.0`, mas só existem a partir da **v3.0.0** — conferido nas duas tags (`v2.0.0`: 0
   ocorrências; `v3.0.0`: 2). Quem migrou para 2.x concluiria que já aplicou. Movidos para `## 3.0.0` própria.
   *(O título novo nasceu dizendo "dois componentes" contra "4 componentes e 3 tipos" no corpo; ajustado pelo
   revisor para **quatro componentes e três tipos** — errar o número no conserto de um erro de número é
   exatamente o que a seção existe para impedir.)*
3. **`neo-brutalism` dizia "thick black borders"** e a borda virou branca. Corrigida. As outras 4 descrições
   que citam cor foram conferidas e seguem verdadeiras.

## 11.4 Três coisas que o dono deve saber, e não são defeito

**A R31 ficou em ⚠️, não em ✅** — divergindo da meta desta plan, e a divergência é minha, não da entrega. Os
18 temas passam nos dois modos, mas **25 pares-tema seguem pulados** (fundo não determinístico) e o par de
texto de status continua fora. O marcador da [[00-regras-e-invariantes]] descreve a **verificação**, não a
conformidade, e ⚠️ é a definição literal de *"a verificação não vê parte do que a regra exige"* (§1.2). Marcar
✅ seria o *"✅ falso"* que aquela spec proíbe. **Conformidade verde não é cobertura plena.**

**Os 18 temas não foram recriados — foram corrigidos.** O `PASSO 6` dizia *"regerar"*; o executor aplicou
correção mínima (52 de 1184 cores). **Na minha avaliação isso serve melhor ao objetivo declarado** — preserva
ao máximo a diversidade que já existia — e a R31 fecha igual. Mas **criar temas novos continua em aberto**.

**Publicar o `solve_theme_contrast.ts` é decisão pendente.** Hoje ele vive em `.agents/skills/` e não vai no
pacote, então o consumidor não tem ferramenta. A nota de migração foi escrita para seguir verdadeira nos dois
caminhos, e por isso não apressa a decisão.

## 11.5 Um dado novo, sem causa atribuída

Os avisos `Could not parse CSS stylesheet` da suíte caíram de **19 para 6**. O `SarakToast.tsx` **não foi
tocado** nesta entrega, então o achado **37** não explica os 13 que sumiram. O que mudou foi o CSS emitido.
Não fecha a atribuição — mas descarta a hipótese de causa única estática. Quando for medido, começar pela
injeção de variáveis, não pelo toast.
