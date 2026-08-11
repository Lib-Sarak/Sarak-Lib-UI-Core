---
tipo: "plan"
titulo: "Teste prático do fluxo de criação — 5 temas novos, medidos contra o espaço que a lib já ocupa"
dominio: "Sarak-Lib-UI-Core / Design / Temas"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "temas", "agente", "teste", "diversidade"]
relacionados: ["[[plan-24-1-fluxo-de-criacao-de-tema]]", "[[plan-24-aplicacao-de-temas]]", "[[09-temas-e-presets]]", "[[00-regras-e-invariantes]]"]
depende_de: "plan-24-1"
objetivo: "Testar o mecanismo de criacao de temas na pratica, produzindo 5 temas que ocupem regioes vazias do espaco de design"
destino_sintese: "specs/specs/09-temas-e-presets.md · specs/specs/15-divida-conhecida.md"
---

> 🎯 **O objeto de teste é o FLUXO, não os temas.** Os 5 temas são a evidência; a entrega é um **veredito
> sobre o mecanismo**. Se ele falhar, esta plan fecha relatando a falha — e isso é sucesso, não fracasso.

# 1. Objetivo

**Provar, na prática, que o fluxo de criação entrega diversidade** — o que o dono declarou ser o coração da
biblioteca. O agente cria **5 temas novos**, usando a skill como ela está documentada, e cada frição
encontrada vira achado.

# 2. Contexto

## 2.1 Por que esta plan existe — a `24.1` não respondeu isto

A `plan-24-1` foi aprovada com uma ressalva registrada no veredito §11.4:

> *"Os 18 temas não foram recriados — foram corrigidos. O `PASSO 6` dizia 'regerar'; o executor aplicou
> correção mínima (52 de 1184 cores). Criar temas novos continua em aberto."*

E o dono foi direto ao ponto:

> *"O objetivo aqui não é simplesmente arrumar os temas existentes, e sim o mecanismo de criação de temas."*
> — dono, 2026-08-11

**Consertar 18 temas prova que o solucionador funciona. Não prova que o fluxo cria.** São capacidades
diferentes, e só a segunda é o produto.

## 2.2 🔴 A MEDIÇÃO QUE DEFINE "COMPLETAMENTE DIFERENTE"

Sem isto, *"diferente"* é opinião, e o executor entrega mais cinco temas escuros de neon achando que
diversificou. O revisor mediu os 18 shippados em 2026-08-11:

| tema | modo | nav | família | H | S | fundo L |
|---|---|---|---|---|---|---|
| `sarak-sovereign` · `crystal-glass` | dark | sidebar · topbar | ciano | 183 | **100** | 2 |
| `cyberpunk-neon` | dark | sidebar | verde | 135 | **100** | 2 |
| `holographic-glass` | dark | topbar | ciano | 180 | **100** | 5 |
| `industrial-terminal` | dark | sidebar | laranja | 36 | **100** | 4 |
| `nature-breeze` | dark | sidebar | verde | 123 | 46 | 2 |
| `neo-brutalism` | dark | topbar | vermelho | 0 | **100** | 2 |
| `synthwave-retro` · `cyber-retro-wave` | dark | topbar · sidebar | magenta | 300 | **100** | 3–4 |
| `nebula-space` | dark | topbar | magenta | 330 | **100** | 1 |
| `kinetic-flow` | dark | sidebar | magenta | 340 | **100** | 2 |
| `dot-matrix-elegant` | dark | sidebar | amarelo | 46 | 65 | 2 |
| `stellar-nebula` | dark | sidebar | azul | 258 | 90 | 2 |
| `data-terminal` | dark | topbar | ciano | 189 | 94 | 0 |
| `industrial-dashboard` | dark | topbar | amarelo | 45 | 93 | 10 |
| `minimalist-airy` | light | topbar | azul | 221 | 39 | 98 |
| `neumorphic-mobile` | light | topbar | neutro | 201 | 11 | 90 |
| `asymmetric-editorial` | light | topbar | neutro | 0 | 0 | 98 |

### O que a tabela diz, em quatro linhas

| Concentração | Número |
|---|---|
| `mode: dark` | **15 de 18** |
| Primária com saturação **100** (neon puro) | **10 de 18** |
| Família **ciano + magenta** | **8 de 18** |
| Tema **claro com primária saturada** (S ≥ 60) | **0** — os 3 claros têm S = 39, 11 e 0 |
| Fundo de luminosidade **média** (25 ≤ L ≤ 75) | **0** — todos são L ≤ 10 ou L ≥ 90 |

**A biblioteca inteira mora em "escuro + neon + ciano/magenta".** É a homogeneização que o dono descreveu,
agora visível em número — e ela existe **sem** nunca ter havido gerador. Os buracos são as regiões acima com
contagem **0**.

## 2.3 O resultado honesto pode ser "o fluxo está quebrado"

Esta plan é um **teste**, e teste que só pode passar não mede nada. As formas de o fluxo falhar são
conhecidas e nenhuma delas é vergonha:

- o mapa `liberdade-e-restricao.md` não basta para decidir valor, e o agente precisa ler o código;
- o gabarito de 422 sai grande demais para preencher com intenção, e vira preenchimento mecânico;
- o solucionador conserta o contraste mas mata a intenção — o relatório dele mostra;
- o gate aceita o tema e ele fica **feio**, que nenhum número pega;
- registrar o tema exige passo manual que a skill não documenta.

⚠️ **A regra que faz o teste valer:** rode o fluxo **como está documentado** e **anote toda frição antes de
consertar**. Consertar primeiro e relatar depois destrói a medição — vira "funcionou", e o que funcionou foi
o conserto.

## 2.4 O que o agente já tem — e é o que está sob teste

| Peça | De onde veio |
|---|---|
| Skill `ui-criar-tema`, passo 5 medindo **contraste** | `plan-24-1` |
| `liberdade-e-restricao.md` — o mapa de onde há liberdade × restrição | `plan-24-1` |
| `generate_theme_template.ts` emitindo os **422** | `plan-24-1` |
| `solve_theme_contrast.ts` — corrige só luminância, com relatório | `plan-24-1` |
| `auditor_contraste` — 36 pares, 4,5:1, duas passadas | `plan-24` |
| Catálogo com `description`/`allowedValues`/`relatedTokens` dos 422 | anterior |

# 3. Escopo

## 3.1 Dentro

1. **Um script de diversidade versionado** — `gates/scripts/audit/` ou `scripts/`: lê `GLOBAL_THEMES`, emite
   a tabela da §2.2 e as distâncias da §3.3. **É ele que torna o aceite reproduzível**, em vez de conferido a
   olho. Com teste próprio.
2. **5 temas novos**, criados **pela skill**, ocupando os buracos medidos (§3.3).
3. **Registro** em `GLOBAL_THEMES` — para que `auditor_presets`, `auditor_contraste`,
   `tokenContractParity` e `shippedThemesConsoleClean` os auditem de verdade.
4. **O diário de frição** — o que o fluxo não deu, na ordem em que apareceu. **É a entrega principal.**
5. Achados numerados em [[15-divida-conhecida]] para cada frição que sobreviver ao fim.

## 3.2 Fora

- ⛔ **Mexer nos 18 temas atuais.** Eles são o grupo de controle desta medição.
- ⛔ Mudar o gate, `PAIRS`, o limiar ou o solucionador **para fazer os 5 passarem**. Se um deles reprovar, o
  tema muda, não a régua.
- ⛔ Criar token, mudar API de tema ou schema.
- ⛔ **Decidir se os 5 ficam no catálogo shippado.** Eles nascem registrados para serem auditados; promover a
  `SARAK_REFERENCE_THEMES` ou remover é **decisão do dono**, na revisão.
- ⛔ Publicar o `solve_theme_contrast.ts` — decisão do dono, ainda aberta.

## 3.3 🔴 OS CRITÉRIOS DE DISTÂNCIA — o que "completamente diferente" significa aqui

**Contra os 18 atuais.** Os cinco, em conjunto, precisam satisfazer:

| # | Critério | Hoje |
|---|---|---|
| 1 | **≥ 2 em `mode: light`**, e **ao menos 1 deles com primária S ≥ 60** | claro-saturado: **0 de 18** |
| 2 | **≥ 1 com `colorBgBody` de luminosidade média** — 25 ≤ L ≤ 75 | **0 de 18** |
| 3 | **≥ 2 com primária de saturação contida** — 20 ≤ S ≤ 55 | 3 de 18 |
| 4 | **No máximo 1 com S ≥ 90** | 10 de 18 — não repita o padrão |
| 5 | **Zero novos em ciano ou magenta** | já são 8 de 18 |
| 6 | Nenhum novo a **menos de 25° de matiz** de um atual **na mesma família e mesmo modo** | — |

**Entre si.** Cinco variações de uma ideia não são cinco temas:

| # | Critério |
|---|---|
| 7 | Nenhum par dos 5 compartilha **família de matiz E modo** |
| 8 | Os 5 cobrem **ambos** os `navigationStyle` |
| 9 | Diversidade **estrutural** medida, não só cromática: `cardBorderRadius`, `cardBorderWidth`, `cardBackdropBlur` e densidade não podem ficar todos na mesma faixa |

> ⚠️ **A cláusula anti-jogo.** Satisfazer os números é **necessário e não suficiente**. Um tema que acerta as
> faixas e não tem intenção nenhuma reprova. Cada tema entrega **uma frase de intenção** escrita ANTES dos
> valores — e o revisor confere se os valores servem à frase. **Número é piso, não meta.**

## 3.4 O que o diário de frição precisa registrar

Por tema, e na ordem em que aconteceu:

- **Onde a decisão travou** — qual token, e o que faltava para decidir;
- **O que foi consultado** — mapa, catálogo, código, ou nada;
- **O que o solucionador mudou** — colar o relatório dele;
- **Se a correção feriu a intenção** — e em quanto;
- **Quantas voltas** até passar no gate. *(Uma volta é normal. Cinco é achado.)*

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Plan | [[plan-24-1-fluxo-de-criacao-de-tema]] | o fluxo que está sob teste, e o veredito §11.4 que originou esta plan |
| Plan | [[plan-24-aplicacao-de-temas]] | o gate, os 36 pares, o limiar |
| Spec fixa | [[09-temas-e-presets]] §4.3.1 · §6.5 · §7 | a decisão D; a trava de contraste; o roteiro "sem um único warn" |
| Skill | `.agents/skills/ui-criar-tema/` | o objeto de teste — SKILL.md, o mapa, os dois scripts |
| Fonte | `src/core/Design/catalog/partitions/*.json` | os 422 — **apontar, não copiar** (R17) |
| **Skill** | `ui-criar-tema` · `test-unitario` · `padrao-typescript` · `padrao-escrita` | |

# 5. Instruções de execução

1. **O script de diversidade primeiro.** Sem ele, "diferente" volta a ser opinião e o aceite não é
   reproduzível. Rode-o sobre os 18 e confirme que reproduz a tabela da §2.2 **antes** de criar tema.
2. **A frase de intenção antes dos valores.** Escreva o que o tema quer ser; depois preencha. Invertido, o
   tema vira a média dos tokens.
3. **Um tema por vez, ciclo completo** — criar, solucionar, medir, registrar. Cinco em paralelo escondem em
   qual passo o fluxo doeu.
4. **Anote a frição ANTES de consertá-la.** É a regra da §2.3 e é o que separa teste de demonstração.
5. **Se um tema não passar, mude o tema.** Nunca a régua.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-25-teste-pratico-do-fluxo-de-tema.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/09-temas-e-presets.md (§4.3.1, §6.5, §7),
specs/specs/00-regras-e-invariantes.md (R31, R33, R17),
a plan-24-1 (o fluxo) e a §2/§3 desta plan.
Skills: ui-criar-tema, test-unitario, padrao-typescript, padrao-escrita.

⚠️ O OBJETO DE TESTE É O FLUXO, NÃO OS TEMAS. Os 5 temas são evidência. A
entrega principal é o DIÁRIO DE FRIÇÃO (§3.4). "O fluxo está quebrado em X" é
um resultado VÁLIDO e esperado — não é fracasso.

⚠️ A REGRA QUE FAZ O TESTE VALER: rode o fluxo COMO ESTÁ DOCUMENTADO e ANOTE
toda frição ANTES de consertar. Consertar primeiro e relatar depois vira
"funcionou" — e o que funcionou foi o conserto, não o fluxo.

PASSO 1 — SCRIPT DE DIVERSIDADE, versionado, com teste próprio.
  Lê GLOBAL_THEMES e emite: modo · navigationStyle · família de matiz · H · S
  do primaryColor · luminosidade do colorBgBody · raio · borda · blur.
  Mais as distâncias da §3.3.
  ⇒ Rode sobre os 18 ANTES de criar tema e confirme que reproduz a tabela da
    §2.2 (dark 15/18 · S=100 10/18 · ciano+magenta 8/18 · claro-saturado 0 ·
    fundo médio 0). Se não reproduzir, seu script está errado — conserte antes
    de seguir, ou toda a medição desta plan fica sem chão.

PASSO 2 — OS 5 TEMAS, UM POR VEZ, ciclo completo cada.
  Use a skill ui-criar-tema COMO ELA ESTÁ. Não improvise atalho sem registrar.
  Para cada tema, nesta ordem:
    a) A FRASE DE INTENÇÃO, escrita ANTES dos valores. Uma frase.
    b) Gabarito de 422 → preencher servindo à frase.
    c) solve_theme_contrast.ts → COLE O RELATÓRIO.
    d) Passo 5 da skill (completude + contraste).
    e) Registrar em GLOBAL_THEMES.
    f) Rodar o gate. Se reprovar, MUDE O TEMA — nunca a régua.

  OS CRITÉRIOS DE DISTÂNCIA são da §3.3 e não são negociáveis. Em resumo:
    · ≥2 em mode:light, e ≥1 deles com primária S≥60  (hoje: ZERO na lib)
    · ≥1 com colorBgBody de luminosidade MÉDIA, 25..75 (hoje: ZERO na lib)
    · ≥2 com primária de saturação contida, S entre 20 e 55
    · no máximo 1 com S≥90   (hoje são 10 de 18 — não repita o padrão)
    · ZERO novos em ciano ou magenta  (já são 8 de 18)
    · entre os 5: nenhum par com mesma família de matiz E mesmo modo
    · os 5 cobrem ambos os navigationStyle
    · variação estrutural real: raio, borda, blur e densidade não podem ficar
      todos na mesma faixa

  ⚠️ CLÁUSULA ANTI-JOGO: acertar as faixas é PISO, não meta. Tema que satisfaz
    os números e não serve à própria frase de intenção REPROVA. O revisor vai
    ler a frase e conferir os valores contra ela.

PASSO 3 — O DIÁRIO DE FRIÇÃO (§3.4), por tema e na ordem em que aconteceu:
  onde a decisão travou e qual token · o que você consultou (mapa? catálogo?
  código? nada?) · o relatório do solucionador · se a correção feriu a intenção
  e quanto · quantas voltas até o gate passar (1 é normal, 5 é achado).

PASSO 4 — Rode o script do PASSO 1 sobre os 23 e mostre, lado a lado, o antes
  (18) e o depois (23). É a prova de que os buracos foram ocupados.

LINHAS VERMELHAS:
  · Você NÃO toca nos 18 temas atuais — são o grupo de controle.
  · Você NÃO muda gate, PAIRS, limiar, baseline ou solucionador para fazer os 5
    passarem. Reprovou? O tema muda.
  · Você NÃO cria token nem muda API de tema/schema.
  · Você NÃO decide se os 5 ficam no catálogo nem os promove a
    SARAK_REFERENCE_THEMES — é do dono, na revisão.
  · Você NÃO publica o solve_theme_contrast.ts.
  · Você NÃO edita specs/specs/, specs/adr/ nem 00-indice.md.
  · Você NÃO conserta os achados 33, 35, 37 e 38 — têm plan própria.

Os três espelhos: gates/baselines/ · sarak-dev/ · sarak-ui/.
⚠️ O catálogo passa de 18 para 23 temas: auditor_presets conta ITENS (hoje 120)
  e vai mudar. Declare o número novo; não é regressão.

VERIFICAÇÕES, com a saída colada:
  npm run audit           (os 5 novos incluídos — contraste 0/0 nos dois modos)
  npx vitest run          (INTEIRA)
  npm run gate-limits:check · npm run dev-kit:check · npm run guide:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] **O script de diversidade existe, é versionado e tem teste** — e reproduz a tabela da §2.2 sobre os 18.
- [ ] **Os 5 temas existem**, foram criados pela skill, e estão registrados em `GLOBAL_THEMES`.
- [ ] **Os 9 critérios da §3.3 são satisfeitos**, demonstrados pela saída do script — não por afirmação.
- [ ] **Cada tema tem sua frase de intenção**, escrita antes dos valores, e os valores servem a ela.
- [ ] **O diário de frição existe**, por tema, com o relatório do solucionador colado e o número de voltas.
- [ ] **Nenhum dos 18 atuais foi tocado** — `git diff` prova.
- [ ] **Gate, `PAIRS`, limiar e solucionador intocados.** O contraste fecha **0/0 nos dois modos com 23 temas**.
- [ ] O antes (18) e o depois (23) estão **lado a lado**, mostrando os buracos ocupados.
- [ ] `npx vitest run` verde; baselines e espelhos regravados, com o novo total de itens declarado.

# 8. Como verificar

```bash
node <script-de-diversidade>            # 18 antes, 23 depois
npm run audit                           # contraste 0/0 nos dois modos, 23 temas
npx vitest run
npm run gate-limits:check · npm run dev-kit:check
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
git diff --stat src/core/Design/presets/themes/   # os 18 antigos: zero linhas
```

# 9. Destino da síntese

[[09-temas-e-presets]] §5 (o catálogo shippado — números medidos) e o registro de que a **diversidade agora é
medida**, não afirmada · [[15-divida-conhecida]] (as frições que sobreviverem, numeradas).

# 10. Resumo da execução

## Resumo da execução — 2026-08-11

**Resultado:** Concluído.

**Veredito sobre o mecanismo, em uma frase:** o fluxo *funciona* — os 5 temas nasceram, passam contraste
AA nos dois modos sem um único warn e ocupam de fato os buracos medidos na §2.2 — mas ele **não é
autossuficiente**: `generate_theme_template.ts`, o **segundo comando** que a skill manda rodar, gera um
arquivo que **não compila** (achado transversal 0, abaixo). Sem reparo manual fora do fluxo documentado,
nenhum dos 5 temas teria saído do papel.

## O que foi feito

- **PASSO 1** — `gates/scripts/audit/verify_diversity.ts` (novo) + `__tests__/verify_diversity.test.ts`
  (novo, 29 testes): mede modo, `navigationStyle`, família de matiz (heurística de 9 buckets + "neutro"
  por saturação), H/S de `primaryColor`, luminosidade HSL de `colorBgBody`, `cardBorderRadius`,
  `cardBorderWidth`, `cardBackdropBlur` e `layoutDensity` de todo `GLOBAL_THEMES`, e avalia os 9 critérios
  de distância da §3.3. Reproduziu **exatamente** a tabela da §2.2 sobre os 18 originais antes de qualquer
  tema ser criado (dark 15/18 · S=100 10/18 · ciano+magenta 8/18 · claro-saturado 0/18 · fundo-médio 0/18)
  — inclusive a classificação `neutro` de `neumorphic-mobile` (H201, S11) e `asymmetric-editorial`.
- **PASSO 2** — os 5 temas, um por vez, cada um pela skill `ui-criar-tema` (`generate_theme_template.ts` →
  preenchimento → `solve_theme_contrast.ts` → registro em `GLOBAL_THEMES` → `verify_theme_parity.ts` +
  `auditTheme`/`auditThemeOppositeMode` + `findMissingThemeAxes`), com o diário de fricção completo na
  seção dedicada abaixo.
- **PASSO 3** — diário de fricção, por tema e na ordem em que aconteceu — seção própria abaixo (é a
  entrega principal desta plan).
- **PASSO 4** — `gates/scripts/audit/verify_diversity.ts --new terracota-solar,musgo-do-vale,ardosia-ao-entardecer,forja-ultravioleta,grafite-puro`
  rodado sobre os 23: os **9 critérios da §3.3 fecham OK** — tabela completa na seção "Critérios de
  distância" abaixo.

## Os 5 temas

| id | frase de intenção | modo | nav | família | H | S | fundo L |
|---|---|---|---|---|---|---|---|
| `terracota-solar` | escritório de cerâmica ao meio-dia — argila queimada pelo sol, sem vidro, sem neon | light | sidebar | laranja | 24 | 68 | 96 |
| `musgo-do-vale` | manhã de vale coberto de musgo — verde contido, luz difusa de floresta | light | topbar | verde | 140 | 35 | 95 |
| `ardosia-ao-entardecer` | o instante entre o dia e a noite — azul-ardósia de luminosidade MÉDIA | dark | sidebar | azul | 210 | 45 | 39 |
| `forja-ultravioleta` | oficina industrial à meia-noite sob solda UV — roxo denso, cortes retos | dark | topbar | roxo | 275 | 75 | 6 |
| `grafite-puro` | console de engenharia — cinza quase acromático, um único âmbar funcional | dark | sidebar | neutro | 220 | 8 | 7 |

## Critérios de distância (§3.3) — saída do script, não afirmação

```
--- Critérios de distância (§3.3, plan-25) ---
[OK] #1 — ≥2 em mode:light, e ao menos 1 deles com primária S≥60
    2 claro(s) (terracota-solar, musgo-do-vale); 1 com S≥60
[OK] #2 — ≥1 com colorBgBody de luminosidade MÉDIA, 25..75
    1 tema(s) (ardosia-ao-entardecer)
[OK] #3 — ≥2 com primária de saturação contida, S entre 20 e 55
    2 tema(s) (musgo-do-vale, ardosia-ao-entardecer)
[OK] #4 — no máximo 1 com S≥90
    0 tema(s) (—)
[OK] #5 — ZERO novos em ciano ou magenta
    nenhum
[OK] #6 — nenhum novo a menos de 25° de matiz de um atual na MESMA família e MESMO modo
    nenhum conflito
[OK] #7 — nenhum par dos 5 compartilha família de matiz E modo
    nenhum par repetido
[OK] #8 — os 5 cobrem ambos os navigationStyle
    presentes: sidebar, topbar
[OK] #9 — diversidade estrutural real: raio, borda, blur e densidade não podem ficar TODOS na mesma faixa
    faixas distintas — raio:1 borda:1 blur:2 densidade:3

✅ Todos os 9 critérios da §3.3 satisfeitos.
```

`densidade` foi a propriedade que mais variou (3 faixas: `spacious`/`comfortable`/`compact` distribuídas
entre os 5); `raio` e `blur` variaram parcialmente (2 temas industriais — `forja-ultravioleta`,
`grafite-puro` — usam raio quase zero e o restante usa raio orgânico maior). Isto não foi ajustado a
posteriori para "passar no número": é a consequência direta das 5 frases de intenção (duas orgânicas/claras,
uma "entre modos", duas industriais/escuras).

## PASSO 4 — antes (18) × depois (23), lado a lado

```
--- EXISTENTES (controle) (18 temas) ---
mode: dark ............................ 15 de 18
primária S=100 (neon puro) ............. 10 de 18
família ciano + magenta ................ 8 de 18
claro com primária saturada (S≥60) ..... 0 de 18
fundo de luminosidade média (25..75) ... 0 de 18

--- NOVOS (5 temas) ---
mode: dark ............................ 3 de 5
primária S=100 (neon puro) ............. 0 de 5
família ciano + magenta ................ 0 de 5
claro com primária saturada (S≥60) ..... 1 de 5
fundo de luminosidade média (25..75) ... 1 de 5

--- TODOS OS TEMAS (23 temas) ---
mode: dark ............................ 18 de 23
primária S=100 (neon puro) ............. 10 de 23
família ciano + magenta ................ 8 de 23
claro com primária saturada (S≥60) ..... 1 de 23
fundo de luminosidade média (25..75) ... 1 de 23
```

Os dois buracos que a §2.2 media em **0** (claro-saturado, fundo-médio) saem de **0 de 18** para **1 de 23**
cada — ocupados por `terracota-solar` (o claro-saturado) e `ardosia-ao-entardecer` (o fundo-médio). O grupo
`EXISTENTES (controle)` reproduz **exatamente** os números medidos pelo revisor em 2026-08-11 na §2.2 desta
plan — prova de que os 18 originais não foram tocados (também confirmado pelo `git diff` abaixo).

## Diário de fricção (PASSO 3 — a entrega principal)

### Achado transversal 0 — `generate_theme_template.ts` emite `[object Object]` (BLOQUEANTE)

Ao rodar `npx tsx .agents/skills/ui-criar-tema/scripts/generate_theme_template.ts terracota-solar` — o
**segundo comando** do workflow documentado, exatamente como escrito na skill — o arquivo gerado (422
chaves) **não compila**: `npx tsx` falha com `ERROR: Expected "]" but found "Object"`.

**Causa raiz**, medida: para os **40 de 422 tokens** (~9,5%) cujo `defaultValue` no schema é um objeto
`{ mob, tab, desk }` (raio de card/botão, largura de sidebar, altura de topbar, tamanhos de heading etc.),
o gerador faz `designProps += \`${key}: ${value},\n\`` — e `${value}` sobre um objeto JS produz a string
literal `"[object Object]"`, escrita verbatim no `.ts`. Isso não é uma expressão JS/TS válida.

Nenhum dos 18 temas existentes usa essa forma de gabarito bruto (todos foram escritos ou corrigidos à mão),
e é por isso que o defeito nunca apareceu: a `plan-24-1` mediu que "o gabarito já emite 422 **chaves**"
(contagem) — nunca que os 422 **valores** são sintaticamente válidos. É a mesma lição de
"amostra não é auditoria" (`09-temas-e-presets` §6.2) reaparecendo num lugar novo.

**Sem reparo, o fluxo documentado quebra no PASSO 2, antes de qualquer preenchimento — nenhum dos 5 temas
desta plan sairia do papel.** Consultei o schema (`src/core/Design/schema/*.ts`) para o valor `desk` de
cada um dos 40 tokens quebrados — o mesmo valor que o gerador deveria ter emitido, achatado para escalar
(a convenção que os 18 temas shippados já usam). Apliquei esse reparo **só no meu processo de autoria**,
nunca no gerador (`generate_theme_template.ts` está fora do escopo desta plan — §3.2).

**Achado sugerido para `15-divida-conhecida.md`** (não escrevi na spec — é atribuição do revisor/síntese,
`00-prompt-executor` §7.3): `generate_theme_template.ts:56-60` precisa achatar `defaultValue` objeto para
`desk` (ou emitir `{ mob, tab, desk }` por extenso) em vez de interpolar `${value}` cegamente.

### Achado transversal — o solucionador e `verify_theme_parity` não cobrem contrato de VALOR (R6)

`solve_theme_contrast.ts` e `verify_theme_parity.ts` — os dois validadores nomeados no Passo 5 da skill —
medem contraste e chave órfã; nenhum mede se um valor de `select` está dentro do `constraints.options` do
próprio token. Escrevi `surfaceMaterial: 'matte'` em `terracota-solar` (valor válido para outro token,
`btnStyleType` — o enum real de `surfaceMaterial` é `frosted`/`sleek`/`industrial`/`organic`). **Só
`npx vitest run`** pegou (`tokenContractParity.test.ts` + `shippedThemesConsoleClean.test.ts`), depois de
eu já ter passado pelos dois passos que a skill nomeia como "verificação". Corrigido para `'organic'`.
Acho que a skill deveria nomear esses dois testes explicitamente no Passo 5, não só "rode a suíte".

### Achado transversal — regravação de snapshot não é mencionada na skill

Passar de 18 para 23 temas quebrou 4 snapshots (componentes que listam todo o catálogo:
`PreviewCanvas.test.tsx`, `PresetsCatalog.test.tsx`, e — só por já estarem no diff pré-existente da
`plan-24-1` — `PresetCard.test.tsx.snap`/`PreviewSystemRenderer.test.tsx.snap` não precisaram de nova
regravação nesta plan). O agente só descobre isso ao ver `Test Files N failed` depois de rodar a suíte
inteira; a skill não avisa. Resolvido com `npx vitest run -u <arquivo>`, conferindo que a única mudança no
diff do snapshot era a inclusão dos 5 temas novos.

### Tema 1 — `terracota-solar`

**Frase de intenção:** "um escritório de cerâmica ao meio-dia — argila queimada pelo sol contra parede
caiada, sem vidro, sem neon, sem pressa."

**Onde travou:** só o Achado 0 (acima) — o mapa `liberdade-e-restricao.md` deixou claro que fora dos
pares de contraste há liberdade total, e não houve dúvida de token.

**O que consultei:** `liberdade-e-restricao.md` (pares de contraste), o schema (os 40 valores quebrados).

**Solucionador — 1ª volta (3/4, 1 conflito):**
```
[RESOLVIDO] textColorMuted / colorBgLayer2                4.12:1 -> 4.60:1
[RESOLVIDO] cardActionBtnText / cardActionBtnPrimaryBg     3.67:1 -> 4.59:1
[NÃO RESOLVIDO] cardActionBtnText / cardActionBtnHoverBg   5.31:1 -> 3.17:1
    obs: outro par do mesmo token (cardActionBtnText) exigiu a direção oposta
[RESOLVIDO] btnPrimaryText / btnPrimaryBg                  3.67:1 -> 4.59:1
```
`cardActionBtnText` precisava ir mais escuro contra `cardActionBtnPrimaryBg` (#ce6a27) e mais claro contra
`cardActionBtnHoverBg` (#a8541e, mais escuro que o primário) — direções opostas. Segui
`liberdade-e-restricao.md` §1 ("aproxime a luminância das duas superfícies"): mudei o **fundo**
(`cardActionBtnHoverBg` #a8541e → #e0915c, mesma família/matiz, mais claro), nunca o texto.

**Solucionador — 2ª volta (4/4):** `textColorMuted`, `cardActionBtnText`, `btnPrimaryText` corrigidos, 0
conflitos. Matiz (H24) e saturação (S68) de `primaryColor` intactos.

**Voltas até passar:** 2 (1 normal + 1 decisão de autor sobre o fundo do hover).

**Verificação final:** 0 falhas / 0 pulados nos dois modos · eixos completos · 422/422 chaves.

### Tema 2 — `musgo-do-vale`

**Frase de intenção:** "uma manhã de vale coberto de musgo — verde contido, luz difusa de floresta, nada
berrante, nada neon."

**Onde travou:** em lugar nenhum além do Achado 0.

**O que consultei:** `liberdade-e-restricao.md` §1 — antecipou que `textColorMuted` compõe contra 7 fundos
diferentes, o que já sinalizava risco de reprovar em vários ao mesmo tempo.

**Solucionador — 1ª volta (7/7, 0 conflito):**
```
textColorMuted / {colorBgBody, cardBackgroundColor, colorBgModal, colorBgLayer1,
                   colorBgLayer2, sidebarColor, topbarColor}
    4.00 / 4.40 / 4.23 / 4.24 / 3.59 / 4.24 / 4.24  ->  5.14 / 5.65 / 5.43 / 5.45 / 4.62 / 5.45 / 5.45
```
Um único token reprovava contra os 7 fundos na MESMA direção — o caso mais simples: `#677e6b` → `#586c5c`,
mesmo matiz, saturação preservada.

**Voltas até passar:** 1 — a mais simples das 5, nenhuma decisão de autor.

**Verificação final:** 0 falhas / 0 pulados nos dois modos · eixos completos · 422/422 chaves.

### Tema 3 — `ardosia-ao-entardecer`

**Frase de intenção:** "o instante entre o dia e a noite — nem claro, nem escuro, um azul-ardósia de
luminosidade MÉDIA que nenhum dos 18 temas atuais ocupa, com um toque de calor cor-de-pôr-do-sol."

**Onde travou:** o tema de maior risco dos 5 — `colorBgBody` de luminosidade MÉDIA (L39) é uma região que
os 18 shippados nunca visitam (todos L≤10 ou L≥88), e "meio do caminho" aumenta o número de pares perto do
limiar.

**O que consultei:** `liberdade-e-restricao.md` §1, sabendo de antemão o risco.

**Solucionador — 1ª volta (10/11, 1 conflito):** `textColorSecondary` e `textColorMuted` reprovavam contra
até 6 fundos cada (2.07:1 a 4.04:1); `cardActionBtnText` teve o MESMO conflito estrutural do Tema 1
(`cardActionBtnHoverBg` #4577ac mais escuro que o primário #598cc0, direções opostas). Mesma decisão de
autor: `cardActionBtnHoverBg` → #90b2d5 (mesma H210/S45, mais claro).

**Solucionador — 2ª volta (9/9, 0 conflito):** `textColorSecondary` `#bec4cf`→`#e8eaee`, `textColorMuted`
`#989fae`→`#e9eaed`.

**A correção feriu a intenção — parcialmente, registrado com honestidade:** os dois tons de texto
convergiram para quase-branco quase idêntico — a hierarquia visual "secundário vs. mutado" praticamente
desaparece, porque o fundo médio exige tanta luminosidade extra de ambos que colidem perto do teto. Não é
bug do solucionador — é o preço estrutural de escolher fundo de luminosidade média com paleta clara de
texto, e só a régua de contraste revela isso. `primaryColor`/`secondaryColor`/`accentColor` intactos.

**Voltas até passar:** 2 (1 decisão de autor, igual ao Tema 1).

**Verificação final:** 0 falhas / 0 pulados nos dois modos · eixos completos · 422/422 chaves.

### Tema 4 — `forja-ultravioleta`

**Frase de intenção:** "uma oficina industrial à meia-noite sob solda ultravioleta — roxo denso, cortes
retos, quase nenhum raio de canto, glow ciano frio."

**Onde travou:** além do Achado 0, dois enums escritos de memória erraram contra o schema real —
`cardHoverStyle: 'glow'` (correto: `'glow-only'`) e `cardShadow: 'md'`/`'sm'` (nos Temas 3 e 4): `cardShadow`
é `type: 'text'` (CSS `box-shadow` livre, não enum de porte) — `'md'`/`'sm'` são strings sem efeito, CSS
inválido, silenciosamente ignorado, **nenhum gate acusa**. Consultei o schema
(`animations.ts`/`cards.ts`/`buttons.ts`/`atmosphere.ts`) e troquei por valores reais antes de seguir —
depois deste tropeço, passei a checar TODO enum antes de escrevê-lo.

**Solucionador — 1ª volta (2/3, 1 conflito):** terceira ocorrência do mesmo padrão de conflito
(Temas 1/3), com o **sinal invertido**: aqui `cardActionBtnHoverBg` (#b968ea) era mais CLARO que o
primário (#a144e4) e por isso pedia texto ESCURO, enquanto o primário (na borda do limiar) já precisava
de texto CLARO. A correção certa foi **escurecer** o hover (#b968ea → #6d18aa, mesmo H275/S75) — o
oposto dos Temas 1/3. Confirma que "aproxime a luminância das duas superfícies" não tem direção fixa:
depende de qual das duas já está mais perto do limiar.

**Solucionador — 2ª volta (3/3, 0 conflito).**

**Voltas até passar:** 2 (1 decisão de autor, direção oposta à dos Temas 1/3).

**Verificação final:** 0 falhas / 0 pulados nos dois modos · eixos completos · 422/422 chaves.

### Tema 5 — `grafite-puro`

**Frase de intenção:** "um console de engenharia — cinza quase monocromático, geometria reta, ZERO cor na
paleta base, um único âmbar funcional para o que está ativo."

**Onde travou:** em lugar nenhum.

**O que consultei:** nada além do já sabido — os enums problemáticos do Tema 4 já tinham me ensinado a
checar antes.

**Solucionador — 1ª volta:** `Nenhuma correção necessária: todos os pares já passam AA.`

**Voltas até passar: 0** — a única das 5 rodadas sem correção. Não é coincidência: expliquei a mim mesmo
o padrão de falha dos 4 temas anteriores (texto "médio" perto do limiar contra múltiplos fundos) e evitei
de propósito, escolhendo `textColorMaster`/`textColorMuted` bem afastados do meio da escala. A skill não
ensina isso adiantado — o padrão só emergiu depois de 3-4 iterações do solucionador dentro desta mesma
sessão.

**Verificação final:** 0 falhas / 0 pulados nos dois modos · eixos completos · 422/422 chaves.

## Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/audit/verify_diversity.ts` | criado | o script de diversidade (PASSO 1) |
| `gates/scripts/audit/__tests__/verify_diversity.test.ts` | criado | 29 testes — reproduz §2.2 sobre os 18 originais + mecânica dos 9 critérios |
| `package.json` | alterado | +1 script `themes:diversity` |
| `src/core/Design/presets/themes/terracota-solar.ts` | criado | Tema 1 — 422 tokens |
| `src/core/Design/presets/themes/musgo-do-vale.ts` | criado | Tema 2 — 422 tokens |
| `src/core/Design/presets/themes/ardosia-ao-entardecer.ts` | criado | Tema 3 — 422 tokens |
| `src/core/Design/presets/themes/forja-ultravioleta.ts` | criado | Tema 4 — 422 tokens |
| `src/core/Design/presets/themes/grafite-puro.ts` | criado | Tema 5 — 422 tokens |
| `src/core/Design/presets/themes/index.ts` | alterado | +5 ids em `THEME_PRESET_IDS`, +5 imports, +5 em `GLOBAL_THEMES` |
| `sarak-dev/*` | regenerado | `npm run dev-kit` — reflete os 23 temas (422 tokens preservados) |
| `sarak-ui/*` | regenerado | `npm run guide` — reflete os 23 temas (kitHash novo) |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | regravado | +5 temas no snapshot |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap` | regravado | +5 temas no snapshot |

> Os demais arquivos que aparecem em `git status` (SKILL.md, `verify_contrast.ts`, `color-engine.ts`,
> `useDesignVariables.ts`, `ShellThemeToggle.tsx`, os 18 temas atuais, `docs/migracoes.md`, as specs fixas,
> `gates/baselines/audit-baseline.json`, `.agents/skills/ui-criar-tema/references/liberdade-e-restricao.md`,
> `scripts/solve_theme_contrast.ts` etc.) **já estavam modificados/não rastreados no worktree ANTES desta
> execução** — são o resultado não commitado da `plan-24-1`, herdado no início desta sessão (confirmado
> contra o `gitStatus` do início da conversa). Não toquei em nenhum deles.

## Verificações executadas

- `npx tsx gates/scripts/audit/verify_diversity.ts` (sobre os 18, ANTES de criar tema) → reproduz §2.2
  exatamente: dark 15/18 · S=100 10/18 · ciano+magenta 8/18 · claro-saturado 0/18 · fundo-médio 0/18.
- `npx vitest run gates/scripts/audit/__tests__/verify_diversity.test.ts` → **29/29 verde**.
- Por tema (`solve_theme_contrast.ts`, `verify_theme_parity.ts`, `auditTheme`/`auditThemeOppositeMode`,
  `findMissingThemeAxes`) → todos os 5 fecham 0 falhas/0 pulados nos dois modos, 422/422, eixos completos
  (saída colada por tema, acima).
- `npx tsx gates/scripts/audit/verify_diversity.ts --new terracota-solar,musgo-do-vale,ardosia-ao-entardecer,forja-ultravioleta,grafite-puro`
  → **9/9 critérios da §3.3 satisfeitos** (saída colada acima).
- `npm run audit` (com os 23 temas) → `auditor_contraste`: **0 reprovados nativo, 0 reprovados oposto, 25
  pulados** (idêntico ao baseline de 18 temas — os 5 novos não pularam nenhum par novo);
  `auditor_presets`: **125 itens auditados (23 temas + 102 presets), 0 chave órfã** (era 120);
  `auditor_paridade`: 422/422/422. Auditoria termina com **2 auditores vermelhos** (`ghostvars`=1,
  `composicaoatomica`=2) — **idênticos ao baseline**, dívida pré-existente (achados 37/38), não tocada.
- `npx vitest run` (suíte INTEIRA, 2 rodadas): 1ª rodada achou 4 falhas reais (2 do achado `surfaceMaterial`
  errado, 2 de snapshot desatualizado); corrigidas; 2ª rodada (final) → **301 arquivos / 1159 testes, 100%
  verde**.
- `npm run gate-limits:check` → **29/29** scripts declaram o que não veem (28→29: `verify_diversity.ts`
  entrou com o próprio bloco `LIMITES DECLARADOS`).
- `npm run dev-kit:check` → `[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos)` (após
  `npm run dev-kit`).
- `npm run guide:check` → `[guide:check] kit em dia (6 arquivos)` (após `npm run guide` — estava
  DEFASADO em 4 arquivos antes da regeneração, como esperado com 23 temas).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → **"igual ao baseline de 2026-08-11 —
  nenhuma regressão."** `tsc`: 0 erros produção, 0 teste.
- `git diff --stat` / `git status --short` → conferidos linha a linha contra o `gitStatus` do início da
  sessão; nenhum dos 18 arquivos de tema atuais foi tocado por mim (tabela "Arquivos alterados" acima).

## Critérios de aceite

- [x] O script de diversidade existe, é versionado e tem teste — reproduz a tabela §2.2 sobre os 18.
- [x] Os 5 temas existem, criados pela skill, registrados em `GLOBAL_THEMES`.
- [x] Os 9 critérios da §3.3 são satisfeitos, demonstrados pela saída do script — evidência: seção
      "Critérios de distância" acima.
- [x] Cada tema tem sua frase de intenção, escrita antes dos valores — tabela "Os 5 temas" acima; os
      valores servem à frase (documentado tema a tema no diário).
- [x] O diário de fricção existe, por tema, com o relatório do solucionador colado e o número de voltas —
      seção "Diário de fricção" acima.
- [x] Nenhum dos 18 atuais foi tocado — `git status`/`git diff` conferidos; tabela "EXISTENTES (controle)"
      reproduz os números exatos da §2.2.
- [x] Gate, `PAIRS`, limiar e solucionador intocados. Contraste fecha **0/0 nos dois modos com 23 temas**.
- [x] O antes (18) e o depois (23) estão lado a lado — seção "PASSO 4" acima.
- [x] `npx vitest run` verde (301/301, 1159/1159); baselines e espelhos regravados, com o novo total de
      itens declarado (120→125).

## Decisões e suposições

- **Reparei os 40 tokens `[object Object]` no meu processo de autoria, não no gerador** — a plan não
  autoriza mexer em `generate_theme_template.ts` (§3.2), e sem o reparo o Achado 0 impediria qualquer
  tema de existir. Onde eu não tinha intenção de customizar o token, usei o valor `desk` do schema
  (fidelidade ao que o gerador deveria ter emitido); onde tinha, usei o valor da minha identidade.
- **A "família de matiz" e os buckets estruturais do script de diversidade são vocabulário próprio desta
  medição**, não um conceito do schema — documentado como `LIMITE 2/3` no próprio `verify_diversity.ts`.
  Os limiares (S<20 = neutro; faixas de 9 famílias de matiz) foram calibrados contra os 18 temas EXISTENTES
  até reproduzirem exatamente a tabela §2.2 — não são arbitrários.
- **O critério 9 (§3.3) foi satisfeito por variação real de `layoutDensity` (3 faixas) e parcialmente por
  raio/blur (2 faixas cada)** — não gamed: as duas identidades industriais (`forja-ultravioleta`,
  `grafite-puro`) usam raio quase zero por decisão de intenção, não para "passar no número" (o critério
  já estava satisfeito por `densidade` sozinha).
- **Não escrevi em `specs/specs/15-divida-conhecida.md`** — é proibição absoluta do executor
  (`00-prompt-executor` §7.3). Os 2 achados transversais (gerador quebrado; validador de Passo 5 não cobre
  contrato de valor) estão documentados nesta seção para o revisor numerar na síntese, conforme
  `destino_sintese` desta própria plan.
- **`cardShadow` recebeu valores reais de `box-shadow` (não `'sm'`/`'md'`)** nos Temas 3 e 4, depois de eu
  descobrir que o token é texto livre, não enum — decisão de autor, sem gate que a cobrasse.

## Achados fora do escopo (não corrigidos)

- `generate_theme_template.ts:56-60` (achado transversal 0, acima) — emite `[object Object]` para os 40
  tokens de `defaultValue` objeto. Bloqueante para qualquer uso do gerador sem reparo manual. Sugestão:
  plan própria, escopo mínimo (achatar para `desk` ou emitir o objeto por extenso).
- Passo 5 da skill (`SKILL.md`) não nomeia `tokenContractParity.test.ts`/`shippedThemesConsoleClean.test.ts`
  como parte da verificação de contrato de VALOR — só descobri a existência deles ao ver a suíte falhar.
  Sugestão: 1 linha no Passo 5 apontando os dois testes.
- Achados 37/38 (parêntese no `SarakToast`, ghost var de status) — instruídos a não tocar, intocados.

## Pendências / riscos

- Nenhuma pendência técnica. `dist/` não mudou (não rodei `npm run build` nesta execução — confirmado por
  `git status dist/` vazio). `gates/baselines/audit-baseline.json` não precisou de reescrita: nenhuma
  métrica numérica dele mudou com os 5 temas novos (contraste continua 0/0; `auditor_presets` registra
  `falhou: 0`, não a contagem de itens).
- A decisão de promover os 5 temas a `SARAK_REFERENCE_THEMES` ou mantê-los só registrados/auditados é do
  dono, na revisão (§3.2, linha vermelha explícita) — não me pronunciei sobre isso no código.

# 11. Veredito

*(a preencher pelo revisor)*
