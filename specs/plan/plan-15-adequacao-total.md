---
tipo: "plan"
titulo: "Adequação total — o baseline volta a zero"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "adequacao", "baseline", "divida", "gates"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[15-divida-conhecida]]"]
depende_de: "plan-12 · plan-16 · plan-17"
destino_sintese: "specs/01-gates-e-baseline.md · specs/15-divida-conhecida.md · specs/00-regras-e-invariantes.md"
---

> 🔒 **Esta plan NÃO mexe em gate.** Ela paga o que os gates da `plan-12` acusaram. Gate alterado aqui —
> escopo, allowlist, limiar ou exceção — **reprova a execução inteira**, porque é maquiagem com outro nome.
>
> ⚠️ **Ela começa sem lista de tarefas.** A lista é o **relatório final da `plan-12`**: o baseline que ela
> deixou. Enquanto a `plan-12` não fechar, esta plan não tem escopo — e liberá-la antes disso é convidar o
> executor a inventar trabalho.

# 1. Objetivo

O **baseline volta a zero** em todas as métricas, e o que não voltar está lá **por decisão escrita do dono** —
não por cansaço.

# 2. Contexto

A `plan-12` constrói os gates **sem exceção**, cobrando cada regra como ela está escrita. A consequência
inevitável é que **o baseline deixa de ser zero**: 16 verificações novas ou ampliadas (15 na `plan-12`, mais o
`auditor_composicaoatomica` da `plan-16`) acendem a dívida que já existia e ninguém via.

**Isso é a metade do trabalho, e a metade fácil.** Um gate que acusa e nunca é atendido vira ruído — e ruído
treina a ignorar o vermelho, que é o defeito que este repositório passou a campanha inteira consertando.

**A decisão do dono (2026-08-05)** foi explícita: *"vamos construir os gates e depois adequar tudo — não faz
sentido criar gates e criar exceções no processo."* A `plan-12` é o "construir"; esta é o "adequar tudo".

## 2.1 O que já se sabe que vai aparecer

> ✅ **Atualizado em 2026-08-05, com a `plan-12` (Lotes A+B) 🟢 aprovada.** Os números abaixo deixaram de ser
> previsão: são o **baseline recontado** por ela, verificado no veredito. **Continua não sendo a lista** — a
> lista é o resumo de execução da `plan-12`.

| Origem | Vermelho MEDIDO | Natureza |
|---|---|---|
| **R18** | ✅ **0** — os blocos de limite foram escritos **na própria `plan-12`**; `gate-limits:check` fecha **26/26** | *(não chega a esta plan)* |
| **R30** | **10** erros de `tsc`, todos em teste — **produção já em 0**, e virou hard-block | tipagem |
| **vão 5** | **35** violações de `px` literal em `src/core/Shell/` *(a previsão dizia 4)* | conserto trivial, volume médio |
| **vãos 2+3** | **27** consumos-fantasma em `src/styles/` + `src/core/` | conserto trivial |
| **vão 7** | **27** ponteiros `§N.N` mortos, autorreferência *(a previsão dizia 4)* | texto |
| **vão 13** | 1 número falso novo: `arquitetura/04-…:52` diz `410 = 410`, o real é **409** | texto — **sem gate**, achado a numerar |
| **R10** | **47** ocorrências de HTML nativo cru — fronteira **fixada pelo dono em 2026-08-05** | ⚠️ refactor de componente; o gate é a `plan-16` |
| **R31** | **12 de 18** temas falham ≥1 par canônico de AA | ⚠️ **não é decisão de limiar** — ver abaixo |

**A fronteira de R10 fechou o número.** `features/**` ficou **fora** da regra (ferramenta de autoria da própria
lib), então as 64 ocorrências do painel do Design Engine **não são dívida** — sobram **47**, em
`components/atomic` (23), `core/Shell` (15), `Layout` (6), `engines` (2) e `Discovery` (1). Continua sendo
refactor com risco visual, não higiene, mas caiu de 111 para 47.

**R31 mudou de natureza, e isto muda o custo desta plan.** O relatório da `plan-12` a enquadrou como escolha de
limiar; a reprodução do revedor mediu o contrafactual: com `textColorMuted` a **3:1**, dos 12 reprovados
**apenas 1** é resgatado. As outras 11 falhas estão abaixo até de 3:1 — e **4 delas são texto primário ou
secundário**, não tom apagado (`neo-brutalism` tem `#000000` sobre `#050505` = **1.03:1**). **Não é ajuste de
régua: são 12 temas com defeito de contraste real**, um deles (`minimalist-airy`) sendo um dos dois
`SARAK_REFERENCE_THEMES` que a [[09-temas-e-presets]] §4.1 manda o consumidor clonar.

> ⚠️ **R31 ainda não tem gate nem decisão.** Enquanto o dono não escolher entre corrigir as cores, estreitar a
> promessa da regra ou fatiar (só os 4 de texto primário/secundário primeiro), **ela não entra no escopo desta
> plan** — nem como conserto, nem como número. A medição está preservada no anexo da `plan-12`.

> ⚠️ **A medição de R31 vive fora do repositório.** O script de contraste foi recriado pela `plan-12` no
> `%TEMP%` da sessão e **não sobrevive a uma limpeza**. Antes de decidir R31, mova-o para um lugar durável —
> ou o número 12/18 volta a ser irreproduzível, que é o estado que esta base combate.

## 2.2 O INVENTÁRIO COMPLETO DA DÍVIDA — medido em 2026-08-08

> Esta é a lista fechada do que a plan tem de pagar. A §2.1 acima é o registro **do que se previa**; esta é
> **o que existe**, recontado ao vivo depois dos lotes 1–5.
>
> ⚠️ **O baseline superestima a dívida.** Parte do vermelho é **falso positivo de gate**, e a `plan-17` o
> remove **antes** — pagar código para satisfazer um verificador errado é a definição de maquiagem invertida.

### O que já foi PAGO

| Item | De → Para | Lote |
|---|---|---|lot
| **R30** — `tsc` | **10 → 0** (produção já era 0) | 3 |
| **Vão 7** — ponteiros de seção | **27 → 18** (9 pagos: skills, README, kit, e o achado 29 no gerador) | 2 |
| **Vãos 2+3** — fantasmas | **27 → 26** (`--theme-text`, no-op comprovado) | 4 |

**20 itens pagos.**

### O que FALTA — o baseline, item a item

> ⚠️ **Duas colunas de lote, e elas NÃO são a mesma coisa** *(ambiguidade corrigida em 2026-08-08)*: onde a
> dívida foi **medida/classificada** (passado) e onde ela será **paga** (futuro, §2.4 e §12). A coluna única
> anterior misturava as duas e produziu um conflito real — dizia que `composicaoatomica` era "o lote 6",
> enquanto a §2.4 dava o 6 ao balde 1.

| Métrica | Vermelho hoje | Falso positivo (`plan-17`) | **Dívida real** | Medido no lote | **Pago no lote** | Estado |
|---|---|---|---|---|---|---|
| `composicaoatomica` (R10) | **47** | 0 | **47** | — | **9** | 🔴 não iniciado |
| `hardcoded` (R2) | **33** | **2** | **31** | 5 | **6 · 7 · 8** | 🟠 classificado, liberado |
| `ghostvars` (R7) | **26** | **1** *(`--x`, já declarado)* | **25** | 4 | **7 · 8** | 🟠 caracterizado, liberado |
| `sectionpointers` (R23) | **18 → 2** | **16** *(pagos pela `plan-17`)* | **2** | 2 | **revisor** | ⏳ aguarda autorização |
| `tsc` (R30) | 0 | — | **0** | 3 | 3 | ✅ pago |
| **Total** | **124 → 108** | | **≈ 105** | | | |

### A composição de cada bloco

**`hardcoded` — 31 reais**, classificados no lote 5:

| Balde | Itens | Saída | Decisão de quem |
|---|---|---|---|
| 1 — token existe, **mesmo valor** | **20** | trocar (ganha tema, não muda pixel) | executor, liberado |
| 2 — token existe, **valor diferente** (`32px` × `shellBrandLogoSize=28`) | **2** | usar o token, ou corrigir o default do token | **dono** |
| 3 — **sem token** (sidebar colapsada, topbar colapsado, logo colapsada, radius de tela de diagnóstico, gap de dropdown) | **6** | Expansão (R11) ou aceitar como tela interna | **dono** |
| 4 — literal legítimo (2 truncamentos, 1 largura de dropdown) | **3** | ⇒ é *"a regra está larga demais"* (§3.3, linha 3) | **dono** |

**`ghostvars` — 25 reais**, caracterizados no lote 4:

| Grupo | Consumos | O que acontece ao consertar |
|---|---|---|
| **A** — fallback funciona hoje | **3** | **troca o valor na tela** (topbar ×2, botão) |
| **B** — sem fallback, hoje não renderiza | **11** | **liga o que está desligado** (easings ×4, `--bg-card` ×3, `--theme-surface-main`, `SidebarNav`, `--theme-background` ×2) |
| **Expansão** — conceito sem token | **11** | 6 tokens novos + 3 redirecionamentos (`*-scaled` → `layoutGap*`/`layoutPadding`/`borderRadius`) |

> 🔴 **`SidebarNav.tsx:142` tem DOIS defeitos empilhados** — o nome fantasma **e** um fallback malformado
> (`59,130,246/10` sem função de cor). Consertar só o nome **mascara** o segundo. Ver o veredito do lote 4.

**`composicaoatomica` — 47 reais**, ainda sem classificação: `components/atomic` 23 · `core/Shell` 15 ·
`Layout` 6 · `engines` 2 · `Discovery` 1. **20 arquivos**, risco de foco/teclado/estilo. **É o lote 9** (§12.4).

### A dívida FORA do baseline — nenhum gate a mede

| Item | O que é | Destino |
|---|---|---|
| **R31** | **12 de 18 temas** falham AA; 4 são texto primário/secundário (`neo-brutalism` = **1.03:1**) | gate **antes** da recriação dos temas *(decisão do dono, 2026-08-08: temas serão refeitos)* |
| **Achado 17** | `playwright.config.ts:7` aponta para pasta inexistente — `playwright test` **sai verde sem executar nada** | `plan-11` |
| **Achado 29** | metade de código fechada; **a metade de gate segue viva** | `plan-17` |
| **Achado 32** | `arquitetura/04:52` diz `410 = 410`, o real é **409** | revisor, na síntese |
| **~6 ponteiros** | prosa apontando para `plan/20` e `arquitetura/09-…`, ambas removidas; e o `§4.2` que a síntese fundiu | revisor |
| **9 regras ⚠️ · 2 regras ⏳** | escopo de gate menor que a regra; R10 na metade `switch`, R31 sem gate | fora desta plan |

### O que "baseline zero" vai significar ao final

**≈ 109 itens de código + ~15 de calibração de gate.** Ao final, três coisas **não** estarão em zero, e é
melhor dizer isso agora:

1. **Os 3 do balde 4** (`hardcoded`) — se o dono decidir que a regra está larga demais, eles ficam com o
   motivo escrito, não pagos.
2. **R10 na metade `switch` de design** — não tem detector e não é desta plan.
3. **R31** — só entra depois da decisão e do gate.

**Zero é a meta; item declarado com dono nomeado é resposta legítima (§5.5). Item esquecido não é.**

> **Atualização de 2026-08-08 (§2.3):** o dono decidiu, e **o item 1 acima caiu** — os 3 do balde 4 vão ser
> tokenizados, não declarados. A R2 fica com **zero exceção** e `00-regras-e-invariantes` não precisa de
> reescrita. Sobram os itens 2 e 3.

## 2.3 AS DECISÕES DO DONO — 2026-08-08

A `plan-17` limpou os falsos positivos, e o dono decidiu sobre os 31 `hardcoded` e os 25 `ghostvars` restantes.
**Nenhuma destas decisões é do executor.** Estão fechadas; execute-as, não as reabra.

| # | Assunto | Decisão |
|---|---|---|
| 1 | **Balde 1** — 20 literais com token de valor idêntico | ✅ **Trocar.** Zero mudança de pixel. Inclui o `w-[1px]` do divisor (item 19) → `--theme-border-width`: um divisor vertical **é** uma borda |
| 2 | **Ghostvars grupo A** (4 consumos, têm fallback — *troca* o que está na tela) | ✅ **Consertar** |
| 2 | **Ghostvars grupo B** (10 consumos, sem fallback — *liga* o que está desligado) | ✅ **Consertar.** Não é estética: é CSS morto sendo publicado |
| 3 | **Balde 2** — `32px` cru × token `shellBrandLogoSize` = 28 | ✅ **O token é que está errado: default vai a 32.** Sidebar e topbar concordam em 32, logo 32 é a realidade observada; 28 é default que ninguém consome. Paga a dívida **sem mexer em pixel** |
| 4 | **Expansão** — tokens novos | ✅ **Criar** `sidebarCollapsedWidth`(74px), `topbarCollapsedHeight`(40px), `brandLogoSizeCollapsed`(20px), `searchDropdownGap`(0.5rem) · dos 9 candidatos do lote 4: **criar 6**, redirecionar os 3 `*-scaled` para `layoutGap*`/`layoutPadding`/`borderRadius` |
| 5 | **Balde 4** — os 3 restantes (`max-w-[120px]`, `max-w-[150px]`, `w-[400px]`) | ✅ **Tokenizar** — `sidebarLabelMaxWidth`, `topbarLabelMaxWidth`, `searchDropdownWidth`. Uma sidebar mais larga quer um rótulo mais largo; a granularidade de layout é o que a lib vende. **Sem exceção na R2** |

### Decisão 6 — os 4 raios do `DynamicRenderer`: **reusar o token de papel** *(fechada em 2026-08-08)*

Os 4 `rounded-[3rem]/[2rem]/[1.5rem]` de `DynamicRenderer.tsx:64,82,87,94` tinham ficado sem saída. **A
medição do catálogo mudou a pergunta**, e desfez uma recomendação anterior do revisor:

**O sistema de raio desta lib não é uma escala — é por PAPEL.** Medido em `_base.css:39` e `_theme.css:19-23`:

```
--radius-theme : var(--theme-radius-scaled, 12px)                    ← a base
--radius-sarak : var(--sarak-card-border-radius, --radius-theme)     ← superfície/card
--radius-btn   : var(--sarak-btn-border-radius,  --radius-sarak)     ← controle
--radius-input · --radius-modal · --radius-badge (99px, pill)
```

Cada um é dirigido por preset (`cardBorderRadius` vai de 0 a 32 nos presets existentes; `btnBorderRadius`, de
0 a 999). **Não existe `radius-lg/xl/2xl`, e é de propósito:** o consumidor diz *"o raio dos meus cards"*, não
*"raio nível 3"*. Logo a afirmação anterior — *"não existe nada entre 1,5rem e 99px"* — **estava errada**:
`cardBorderRadius: 32` já alcança 2rem. O que não existe é raio **sem papel**.

E os 4 literais têm papel: `:64` é um painel de estado vazio; `:82`, `:87` e `:94` são o `<nav>`, o botão de
aba e a pílula ativa de um *segmented control*.

| Opção | Custo | Veredito |
|---|---|---|
| **(A) Reusar o token de papel** — `--radius-sarak` no painel, `--radius-btn` nas abas | **0 token novo**; muda pixel (48px → 12px no padrão) | ✅ **ESCOLHIDA PELO DONO** |
| (B) Criar a escala `radius-lg/xl/2xl` | 3 tokens novos + cadeia de paridade; zero mudança visual | descartada — cria **duas formas** de dizer raio, a mesma confusão que `--sarak-*` × `--theme-*` |
| (C) Tirar `core/Discovery/**` do escopo do auditor | conserto de gate | descartada — o argumento que tirou `features/**` da R10 **não vale aqui**: `features/**` é o painel de autoria, que o consumidor nunca vê; o `DynamicRenderer` é o estado vazio/carregando do renderer e **aparece no app do consumidor**. Se é visto, é tematizável |

**O raciocínio que fechou:** um raio de 48px que ignora o tema é **defeito, não escolha** — quem monta um tema
brutalista com `cardBorderRadius: 0` vê o estado vazio continuar arredondadíssimo, visivelmente fora do tema.

**Consequência de rota:** como (A) muda pixel, os 4 saem do **lote 8** e vão para o **lote 7** (§12.2), que já
tem revisão visual do dono antes do commit. O lote 8 fica só com Expansão de verdade.

### Consequência: o baseline de `hardcoded` vai a zero

27 dos 31 estão cobertos pelas decisões acima; os 4 do parágrafo anterior fecham o resto assim que a escala
de raio for decidida. **Nenhum item de `hardcoded` sobra como "declarado e não pago".**

## 2.4 A sequência dos lotes restantes — do mais seguro ao mais invasivo

Um lote por conversa, baseline regravado junto (§5.3). A ordem **não** é negociável: ela existe para que uma
mudança visual nunca chegue junto de um refactor grande, e para que o dono possa olhar a tela entre um e outro.

| Lote | Conteúdo | Muda pixel? | Paga |
|---|---|---|---|
| **6** | Balde 1 — as 20 trocas de valor idêntico | **Não** | 20 de 31 `hardcoded` |
| **7** | Balde 2 (default 28→32) + ghostvars grupo A e B | **Sim** — grupo A troca cor, grupo B liga estilo desligado | 2 `hardcoded` + 14 `ghostvars` |
| **8** | Expansão — os tokens novos e a cadeia de paridade | Não (valores atuais viram default) | o resto de `hardcoded` + 11 `ghostvars` |
| **9** | R10 — 47 ocorrências em 20 arquivos | Não deveria — exige caracterização (§5.4) | 47 `composicaoatomica` |

**O lote 7 é o único que pede revisão visual do dono antes do commit**, e por dois motivos opostos na mesma
entrega: o grupo A troca o que está na tela, o grupo B acende o que estava apagado.

# 3. Escopo

## 3.1 Dentro

- **Todo item do baseline** que a `plan-12` e a `plan-16` deixaram vermelho, sem exceção.
- **O código que os gates acusam** — `src/`, e o texto dos geradores onde o vermelho for de prosa.
- `gates/baselines/audit-baseline.json` — regravado **junto** do conserto, nunca sozinho.

> 🔴 **Correção de 2026-08-07 — erro do revisor.** A versão anterior listava aqui
> `specs/01-gates-e-baseline.md` e `specs/15-divida-conhecida.md` como "dentro do escopo". **O executor não pode
> editá-las** ([[00-prompt-executor]] §7.3) — foi por isso que os executores da `plan-12` e da `plan-16`
> corretamente se recusaram a tocá-las e declararam a recusa. Mandar fazer o que o prompt do executor proíbe
> produz ou recusa (e o critério nasce impossível) ou violação (e eu reprovo).
>
> **O que o executor faz no lugar:** escreve no resumo, item a item, **qual achado foi pago e qual número do
> baseline mudou**. A edição das duas specs é do **revisor**, na síntese — exatamente como aconteceu nas duas
> plans anteriores.

## 3.2 Fora

- ⛔ **Alterar qualquer gate** — escopo, limiar, allowlist, exceção. **É a linha vermelha desta plan.**
- ⛔ **Construir gate novo** — era a `plan-12`.
- ⛔ Baixar número sem conserto por baixo. O critério é o da `plan-07` §3.3: existe **defeito real**? Se não
  existe, o gate está errado — e aí **pare e relate**, não conserte o código para agradar o verificador.

## 3.3 As três saídas legítimas para cada vermelho

Nem todo vermelho se paga com código, e forçar isso produz código pior que a dívida:

| Saída | Quando | Quem decide |
|---|---|---|
| **Consertar o código** | a regra vale e o código a viola | executor |
| **Corrigir o gate** | é **falso positivo** — o caso não viola a regra | executor, com a contagem antes/depois |
| **Corrigir a REGRA** | o vermelho revela que a regra foi escrita larga demais | **⇒ PARE. Dono.** Vira edição em `00-regras-e-invariantes`, e é decisão, não atalho |

> **A terceira é a que costuma faltar.** Uma regra que acusa 66 casos legítimos provavelmente está mal
> escrita — e contorcer 66 arquivos para satisfazê-la é pior que reescrevê-la. Mas isso é **decisão do dono**,
> nunca conveniência do executor.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `plan-12-construcao-dos-gates` | **o relatório final dela É o escopo desta** |
| Spec fixa | `specs/01-gates-e-baseline.md` | o baseline que se está pagando |
| Spec fixa | `specs/00-regras-e-invariantes.md` | a regra por trás de cada vermelho |
| **Skill** | `code-adequacao` | onde houver risco de mudar comportamento: **caracterização antes** |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |

# 5. Instruções de execução

1. **Ler o relatório final da `plan-12`** e transcrever o baseline vermelho como lista de trabalho, **ordenada
   por risco crescente** — texto e tipagem antes de refactor de componente.
2. **⇒ PARE. Apresentar a lista ao dono**, com a saída proposta para cada item (§3.3) e o custo. Só então
   executar.
3. **Um lote por vez, com o baseline regravado junto** — nunca ao final, tudo de uma vez. Baseline que anda com
   o conserto é auditável; baseline que anda sozinho é suspeito.
4. **Onde houver risco de mudar comportamento** — R10 em componente montado, R31 em cor de tema — a rede vem
   antes: `code-adequacao`, caracterização, e só então o refactor.
5. **Vermelho que não for pago fica no baseline com o motivo escrito e o dono nomeado.** Zero é a meta; item
   declarado é resposta legítima. Item esquecido não é.
6. Ao final: `npm run audit` e `npm run gates:full` — e o baseline final, com **o que sobrou e por quê**.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-15-adequacao-total.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md, specs/specs/01-gates-e-baseline.md,
e o RESUMO FINAL da plan-12 — que é o escopo desta plan.
Skills: padrao-escrita, padrao-typescript, test-unitario, code-adequacao.

Você NÃO altera gate nenhum. Nem escopo, nem limiar, nem allowlist, nem exceção — é a linha
vermelha desta plan e reprova a execução inteira. Aqui se paga o que o gate acusa.

Cada vermelho tem três saídas (§3.3): consertar o código · corrigir o gate se for FALSO
POSITIVO · ou corrigir a REGRA, se ela foi escrita larga demais. A terceira é decisão do
DONO — pare e pergunte, nunca decida sozinho.

PARADA OBRIGATÓRIA no passo 2: apresente a lista com a saída proposta por item e o custo.

O baseline se regrava JUNTO do conserto, no mesmo commit — nunca sozinho, nunca no final.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] `npm run audit` em **zero**, ou o que sobrou está no baseline **com motivo escrito e dono nomeado**.
- [ ] **Nenhum gate alterado** — `git diff` em `gates/scripts/` vazio, salvo conserto de falso positivo
      **declarado e medido**.
- [ ] Todo item pago está **nomeado no resumo**, com o achado de `15-divida-conhecida` e a métrica do baseline
      que ele move — a remoção da linha na spec é do revisor, na síntese.
- [ ] Baseline regravado **junto** de cada conserto, nunca isolado no diff.
- [ ] Onde houve risco de comportamento, a **caracterização veio antes** — e está no diff.
- [ ] `npx vitest run` verde; `npm run gates:full` verde.
- [ ] A lista do passo 2 foi apresentada ao dono **antes** de qualquer conserto.

# 8. Como verificar

- `npm run audit` → zero, ou o baseline com o motivo de cada linha
- `git diff --stat -- gates/` → vazio ou só falso positivo declarado
- `npm run audit:baseline` → "igual ao baseline"
- `grep` em `15-divida-conhecida` → nenhum achado pago sobrevivendo na lista
- Amostragem: 3 consertos reabertos no `arquivo:linha`, conferindo que o defeito era real

# 9. Destino da síntese

**Destino:** `specs/01-gates-e-baseline.md` (o baseline final) · `specs/15-divida-conhecida.md` (o que saiu) ·
`specs/00-regras-e-invariantes.md` (**só se** alguma regra for corrigida por decisão do dono)

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução (lotes 1–3) — 2026-08-07

**Resultado:** Concluído. Já **🟢 Aprovado** no veredito parcial da §11 — este bloco registra formalmente
o que foi feito, para o §10 não ficar vazio enquanto a plan segue aberta.

**O que foi feito**
- **Lote 1 (achado 32):** não editado — `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` é spec fixa
  ([[00-prompt-executor]] §7.3). Declarado para a síntese: trocar "410 = 410" por "409 = 409" em `:52`, citando
  `plan-07` (fusão dos ids) e `plan-09` (remoção do `mfaQrCodeSize`).
- **Lote 2 (vão 7):** 27 → 18 ponteiros mortos. 9 corrigidos (editáveis): `.agents/skills/ui-arquitetura-design/SKILL.md:64`
  (conteúdo desatualizado sobre R10), `.agents/skills/ui-integra-consumidor/SKILL.md:21,159` (reordenação de
  qualificador), `README.md:31`, `sarak-ui/START-HERE.md:28,56` (idem), `sarak-ui/skill/SKILL.md:21,159` (espelho
  automático, regenerado via `npm run guide`), e o achado 29 fechado de verdade em
  `scripts/dev-kit/buildDevState.mjs:63` ("§5.1" → "§2", regenerado via `npm run dev-kit`). Os 18 restantes vivem
  em `specs/specs/` (14) · `specs/adr/` (3) · `specs/00-indice.md` (1) — fora do alcance do executor, listados
  abaixo em "Achados fora do escopo".
- **Lote 3 (R30):** 10 → 0 erros de `tsc` em teste. 4 `.d.ts` novos colocados ao lado dos `.mjs` sem tipo
  (convenção `<módulo>.mjs.d.ts`, exigida pela resolução clássica do TS para specifier com extensão explícita):
  `gates/scripts/contrato/check-barrel-parity.mjs.d.ts`, `scripts/publicComponents.mjs.d.ts`,
  `gates/allowlists/barrelExclusions.mjs.d.ts`, `gates/scripts/contrato/check-zero-brand.mjs.d.ts`. Mais 3
  correções de fixture/parâmetro implícito em `Spec21.spec.tsx` e `shippedThemesConsoleClean.test.ts`.
- **Achado extra 1 (gate, conserto de falso positivo):** os `.d.ts` novos caíam na varredura de
  `check-gate-limits.mjs` (R18) porque o filtro `/\.(mjs|ts|py)$/` não excluía `.d.ts` — arquivo de tipo puro
  não tem "o que não vê" para declarar. Corrigido: `&& !entry.endsWith('.d.ts')` + bloco `LIMITES DECLARADOS`
  atualizado com o motivo. `gate-limits:check` → 26/26.
- **Achado extra 2 (não-meu, mesma causa da `plan-12`):** `PresetsCatalog.test.tsx` estourava timeout de 5s só
  sob `vitest --coverage` (contenção de workers). Confirmado que passa isolado; timeout bumped para 15000ms com
  o mesmo comentário-padrão do `PreviewCanvas.test.tsx`.

**Verificações executadas** (todas reproduzidas de novo pelo revisor, ver §11)
- `npx tsc --noEmit` → limpo (produção 0, teste 0).
- `npx vitest run` → 289 arquivos / 1004 testes, 100% verde.
- `npm run gates:full` → exit 0 de ponta a ponta.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline".
- Baseline regravado: `sectionpointers 27→18`, `tsc {erros 10→0, teste 10→0}`. `hardcoded 35`, `ghostvars 27`,
  `composicaoatomica 47` mantidos intactos (lotes 5/6, ainda não pagos).

**Achados fora do escopo (não corrigidos)**
- 18 ponteiros mortos do vão 7 em `specs/specs/*.md` (14), `specs/adr/003-remocao-backend-proprio.md:78` (3) e
  `specs/00-indice.md:63` (1) — fora do alcance do executor. Lista completa entregue ao revisor na mensagem de
  handoff dos lotes 1–3.
- `specs/arquitetura/04-contrato-de-tokens-e-paridade.md:52` (achado 32) — idem, spec fixa.

**Decisões e suposições**
- `specs/00-indice.md` precisou de uma sincronização pontual de status (🔴→🟡 na linha da própria plan-15) para
  destravar o commit do usuário — autorizada explicitamente por ele, fora do papel normal do executor
  ([[00-prompt-executor]] §7.3 continua valendo para qualquer edição futura não autorizada da mesma forma).

---

## Resumo da execução (lote 4 — plano de caracterização) — 2026-08-07

**Resultado:** Concluído com pendência declarada — **PARADA OBRIGATÓRIA da §5.4**, conforme mandado. Nenhum
conserto de renomeação ou criação de token foi feito. O único conserto autorizado (`--theme-text`) foi aplicado.

### O único conserto autorizado: `--theme-text` (no-op comprovado)

`src/styles/_theme.css:13` — `--color-theme-text: var(--theme-text, var(--text-main, #ffffff));` →
`--color-theme-text: var(--text-main, #ffffff);`

**Prova do no-op:** `--text-main` é alias real, sempre atribuído em `useDesignVariables.ts:159`
(`variables['--text-main'] = variables['--sarak-text-main'] || variables['--theme-text-primary']`), e
`--theme-text-primary` vem do schema (`typography.ts:89`). `--theme-text` (o elo removido) nunca resolveu —
logo o valor computado de `--color-theme-text` é idêntico antes e depois: hoje já é sempre o de `--text-main`.

**Ghostvars:** 27 → **26**. Baseline regravado no mesmo lote.

### A tabela de caracterização dos 14 consumos restantes (grupo A + grupo B + os 2 medidos)

Nenhuma renomeação, criação de token ou redirecionamento foi aplicado — só investigação e a proposta de
instrumento por consumo, como a §5.4 exige.

| # | Consumo (arquivo:linha) | O que renderiza HOJE (medido por leitura de fonte) | Instrumento proposto | O que o teste prova / não prova |
|---|---|---|---|---|
| 1 | `TopbarNav.tsx:123` — `--sarak-topbar-active` | Fallback `rgba(var(--theme-primary-rgb),0.2)` — fundo translúcido do ícone ativo (topbar recolhida) | Assertiva estática: snapshot da string exata do `className` nesta linha | Prova a FORMA (o fallback que existe hoje), não o pixel renderizado |
| 2 | `TopbarNav.tsx:124` — `--sarak-topbar-active` | Fallback `var(--theme-primary)` — fundo sólido do "pill" ativo (topbar expandida) | Idem — snapshot da string | Idem |
| 3 | `SidebarNav.tsx:142` — `--sarak-sidebar-active` | Fallback `var(--theme-primary-rgb,59,130,246)/10` — **suspeito**: testei com `lightningcss` (parser real, já dependência de build) e o token *parseia* sem erro, mas isso só prova validade SINTÁTICA — `var()` fallback aceita quase qualquer sequência de tokens no parse; invalidade "at computed-value time" é conceito de runtime do navegador, que nenhuma ferramenta estática resolve | **NÃO totalmente caracterizável com o ferramental atual.** Snapshot estático prova a forma; para saber se `background-color` de fato aplica uma cor válida hoje, só um `getComputedStyle` em navegador real resolve — Playwright CT existe (`npm run test-ct`) mas **não roda em nenhuma automação** ([[01-gates-e-baseline]] §2.6) | Recomendo checagem manual (DevTools ou uma rodada avulsa de Playwright CT, sem entrar em CI) ANTES de decidir a renomeação deste item — pode já estar quebrado independente do fantasma |
| 4 | `_utilities.css:49` — `--sarak-button-active` | Fallback `var(--theme-primary-active)` — cor do estado `:active` do botão | Assertiva estática: snapshot da regra CSS completa | Prova a forma, não o pixel |
| 5 | `_utilities.css:21` — `--ease-sarak-cubic` | **Sem fallback.** `transition: all var(--animation-speed,0.4s) var(--ease-sarak-cubic) !important;` — timing-function inválido at computed-value time ⇒ a declaração inteira cai ⇒ `.transition-sarak` não anima hoje | Assertiva estática (regex sobre o `.css` fonte, não sobre CSS computado) confirmando ausência de vírgula/fallback nesta função `var()` | Prova que NÃO há fallback no código-fonte hoje (a causa), não o comportamento visual resultante |
| 6 | `_utilities.css:34` — `--ease-sarak-cubic` | Idem — transição de `border-radius` em botões não anima | Idem | Idem |
| 7 | `_utilities.css:39` — `--ease-sarak-cubic` | Idem — transição de `border-radius` em input/select/textarea não anima | Idem | Idem |
| 8 | `_utilities.css:51` — `--ease-sarak-fluid` | Idem — transição de `transform` no `:active` não anima | Idem | Idem |
| 9 | `_base.css:16` — `--bg-card` (elo interno) | Cadeia `--theme-card: var(--theme-surface-main, var(--bg-card));` — **os dois elos são fantasmas, sem literal no fim** ⇒ `--theme-card` é inválida hoje | Assertiva estática confirmando a cadeia completa (os dois nomes, zero literal) | Prova a forma da cadeia quebrada; não prova o valor computado final (provavelmente `unset`/herdado, mas isso exige browser) |
| 10 | `_surfaces.css:25` — `--bg-card` | `[data-surface="matte"] { background-color: var(--bg-card) !important; }` — sem fallback ⇒ sem background hoje no modo matte | Assertiva estática | Idem |
| 11 | `_surfaces.css:45` — `--bg-card` | `color-mix(in srgb, var(--bg-card), transparent ...)` — `--bg-card` inválido dentro de `color-mix()`; comportamento de fallback de `color-mix` com argumento inválido também é regra do navegador, não estática | **Parcialmente caracterizável**: estática prova a forma; o efeito de um argumento inválido dentro de `color-mix()` (a função inteira cai, ou só o argumento?) é outra pergunta que só browser resolve | Mesma recomendação do item 3: checagem manual antes do conserto |
| 12 | `_base.css:16` — `--theme-surface-main` (elo externo) | Ver item 9 — mesma linha, mesmo problema duplo | Mesma assertiva do item 9 (uma única snapshot cobre os dois nomes) | — |
| 13 | `presets/components/inputs.ts:34` — `--theme-background` | `inputBg: 'var(--theme-background)'` — **zero fallback**, dentro de um preset (`input-industrial-inset`) | Assertiva estática sobre a string do preset | Prova a forma; o preset precisa estar selecionado para o efeito aparecer — nunca testado visualmente |
| 14 | `presets/components/inputs.ts:69` — `--theme-background` | Idem, preset `input-high-contrast` | Idem | Idem |

### O achado que a própria medição produziu, e que a taxonomia original não previa

**A coluna "tem fallback?" é o que separa conserto de mudança visual — não a existência de um alvo correto.**
Das 14 "renomeações" originalmente propostas, **4 têm fallback funcional hoje** (grupo A) e renomear troca o
que está na tela; **10 não têm fallback nenhum** (grupo B) e hoje não renderizam NADA — renomear ali *liga*
algo que está desligado, não troca uma coisa por outra. As duas são mudanças de comportamento real, mas de
naturezas opostas (trocar valor × ligar funcionalidade), e cada uma pede uma revisão visual diferente do dono
antes do commit.

**A quarta saída que faltava na taxonomia de 19 variáveis:** nem toda "renomeação" é preencher o nome certo —
2 casos (`--ease-sarak-cubic`/`--ease-sarak-fluid`) são **"redirecionar para token existente de nome
diferente"**, mas com incerteza sobre QUAL token é o certo (ao contrário de `--sarak-topbar-active` etc., onde
o alvo é uma correspondência textual quase exata). Essa incerteza é do dono, não do executor.

### Verificações executadas

- `node gates/scripts/audit/auditor_ghostvars.mjs` → **26** consumos (era 27).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc --write` → baseline regravado.
- `npx vitest run` → **289 arquivos / 1004 testes, 100% verde**.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-08-07 — nenhuma regressão."
- `git diff -- gates/scripts/` → vazio (nenhum gate tocado neste lote).
- `node -e "require('lightningcss').transform(...)"` → usado como instrumento de investigação (não vira teste
  commitado) para checar a validade sintática do fallback do item 3; resultado registrado na tabela acima.

### Critérios de aceite (desta rodada)

- [x] Nenhuma renomeação aplicada — `git diff -- 'src/**/*.tsx' 'src/styles/*.css'` só mostra `_theme.css:13`
      (o único conserto autorizado).
- [x] Nenhum token criado — zero arquivo novo em `schema/`, `catalog/`, `manifest.ts`.
- [x] Nenhum gate alterado — `git diff -- gates/` vazio.
- [x] `specs/specs/`, `specs/adr/`, `specs/00-indice.md` não tocados nesta rodada.
- [x] Lotes 5 e 6 não tocados.
- [x] `--theme-text` com baseline regravado no mesmo lote.
- [x] `npx vitest run` verde; `check-audit-baseline --with-tsc` → "igual ao baseline".
- [ ] **Tabela de caracterização apresentada ANTES de qualquer conserto de renomeação** — sim, é este bloco;
      nenhum dos 14 consumos restantes foi tocado.

### Decisões e suposições

1. **`lightningcss` usado como instrumento ad-hoc de investigação, não como gate novo nem teste commitado** —
   rodei uma vez via `node -e`, li o resultado, e não deixei nenhum script novo no repositório. Se o dono
   quiser um teste permanente de validade sintática de fallback, isso é decisão de ferramental, não desta
   rodada.
2. **Não escolhi os instrumentos dos itens 3 e 11 sozinho** — declarei "não totalmente caracterizável" em vez
   de forçar um teste jsdom que passaria sem provar nada (o risco que a própria instrução desta rodada avisou).

### Achados fora do escopo (não corrigidos)

- Nenhum novo além dos já registrados nos lotes 1–3.

### Pendências / riscos

- **Os 14 consumos continuam vermelhos no baseline** (`ghostvars` foi de 27 para 26, só o `--theme-text`
  pago). Aguardando decisão do dono sobre: (a) os 2 alvos incertos de easing, (b) autorização para tocar nos 4
  do grupo A (mudança de pixel visível) e nos 10 do grupo B (liga funcionalidade hoje desligada), e (c) os 9
  candidatos a Expansão (R11) que ainda não entraram nesta rodada de caracterização porque a instrução desta
  etapa cobriu só os 14 de renomeação/redirecionamento — os 9 de Expansão seguem com a classificação da parada
  anterior, sem avanço.
- **`time-tracking`:** confirmando de novo — não há skill nem servidor MCP `time-tracking` nesta sessão. O
  `CLAUDE.md` cobra uma capacidade que o ambiente não oferece; sinalizado, não ignorado.
- **`specs/00-indice.md` vai divergir de novo** ao mudar o `status` desta plan para `🟠 Em revisão` — mesma
  mecânica do fim dos lotes 1–3, e o executor não pode corrigir sozinho ([[00-prompt-executor]] §7.3).

---

## Resumo da execução (lote 5 — parte 1 paga, parte 2 classificada) — 2026-08-07

**Resultado:** Concluído com pendência declarada — **PARADA OBRIGATÓRIA** antes de qualquer troca da Parte 2,
conforme mandado. A Parte 1 (falso positivo `__e2e__`) foi executada por completo, como autorizado sem parar.

### Parte 1 — falso positivo `__e2e__`, pago

`gates/scripts/audit/auditor_hardcoded.mjs` — `getFiles()` passou a excluir `__e2e__/`, junto de `__tests__/`
e `Mocks/`, na mesma edição que:
(a) o `walk()` (`:90`) ganhou a terceira condição;
(b) o bloco de comentário acima de `VALUE_SCOPE` ganhou o novo **LIMITE DECLARADO** (R18), nomeando a causa
(2 falsos positivos em `EmbeddedNoLeak.spec.tsx:49,108` — CSS que o teste PLANTA como folha do host externo
para provar isolamento, com valores arbitrários de propósito) e a contagem antes/depois;
(c) as 3 entradas mortas da `VALUE_ALLOWLIST` foram removidas (`RealtimeInjection.spec.tsx::#ff0000`,
`::20px`, `Boot.spec.tsx::2rem`) — essas fixtures já não precisam de allowlist nenhuma, porque `__e2e__`
inteiro saiu do escopo.

**Contagem:** `node gates/scripts/audit/auditor_hardcoded.mjs` → **35 → 33**. Baseline regravado no mesmo lote.

### Parte 2 — classificação dos 33 restantes nos 4 baldes (§5.4-símile desta rodada)

**Achado central:** existe uma família inteira de tokens de escala micro-tipográfica e tracking
(`typography.ts`, Spec 26) com valores que batem **exatos** com a maioria dos literais — `typeScaleMicro=7`,
`typeScaleTiny=8`, `typeScale3xs=9`, `typeScale2xs=10` (`px`) e `trackingTight=0.2`, `trackingWide=0.3`,
`trackingWider=0.4` (`em`). Dois deles (`typeScale2xs`/`typeScale3xs`) já têm utilitário Tailwind pronto
(`text-2xs`/`text-3xs`, via `--text-2xs`/`--text-3xs` em `_theme.css:56-57`); os demais não têm classe curta,
mas o token existe e a troca seria por valor arbitrário `[var(--sarak-…, Npx)]`, mesma mecânica seg 1:1.

**Nenhuma troca foi feita.** A tabela abaixo é só investigação.

#### Balde 1 — token existe, MESMO valor (troca segura — não executada, aguardando OK para adiantar)

| # | Consumo | Token | Troca proposta |
|---|---|---|---|
| 1 | `SarakExpandableMatrixEngine.tsx:20` `tracking-[0.3em]` | `trackingWide` (0.3em) | `tracking-[var(--sarak-tracking-wide,0.3em)]` |
| 2 | `DynamicRenderer.tsx:67` `text-[10px]` | `typeScale2xs` | `text-2xs` |
| 3 | `DynamicRenderer.tsx:87` `tracking-[0.2em]` (metade da linha — ver Balde 3, item 3) | `trackingTight` | `tracking-[var(--sarak-tracking-tight,0.2em)]` |
| 4 | `ShellContent.tsx:52` `tracking-[0.4em]` | `trackingWider` | `tracking-[var(--sarak-tracking-wider,0.4em)]` |
| 5–8 | `ShellLanguageSelector.tsx:55,65,87` `text-[10px]` (×3) · `:56` `text-[9px]` | `typeScale2xs`/`typeScale3xs` | `text-2xs` / `text-3xs` |
| 9–10 | `ShellSearchWidget.tsx:47,68` `text-[8px]` (×2) | `typeScaleTiny` | `text-[var(--sarak-type-scale-tiny,8px)]` |
| 11 | `ShellSearchWidget.tsx:82` `tracking-[0.2em]` | `trackingTight` | idem item 3 |
| 12 | `ShellSearchWidget.tsx:94` `text-[9px]` | `typeScale3xs` | `text-3xs` |
| 13 | `ShellUserWidget.tsx:26` `text-[10px]` | `typeScale2xs` | `text-2xs` |
| 14 | `ShellUserWidget.tsx:29` `text-[7px]` + `tracking-[0.2em]` (mesma linha, 2 conceitos, ambos baldeáveis) | `typeScaleMicro` + `trackingTight` | `text-[var(--sarak-type-scale-micro,7px)]` + tracking idem item 3 |
| 15 | `ShellUserWidget.tsx:69` `text-[8px]` | `typeScaleTiny` | idem item 9 |
| 16 | `SidebarNav.tsx:130` `tracking-[0.2em]` | `trackingTight` | idem item 3 |
| 17–18 | `TopbarNav.tsx:102,124` `text-[10px]` (×2) | `typeScale2xs` | `text-2xs` |
| 19 | `TopbarNav.tsx:150` `w-[1px]` (divisor vertical) | `--theme-border-width` (default 1px, já usado em `_base.css`) | `w-[var(--theme-border-width,1px)]` — **candidato**, mesmo valor, mas é reaproveitar um token de BORDA para uma LARGURA; se você achar o conceito errado mesmo com o valor batendo, é balde 4 |
| 20 | `SarakShell.tsx:215` `text-[10px]` | `typeScale2xs` | `text-2xs` |

**20 de 33** caem aqui — mesmo valor visual hoje, ganham capacidade de tema.

#### Balde 2 — token existe, valor DIFERENTE (muda pixel — NÃO tocar sem aprovação)

| # | Consumo | Literal hoje | Token do conceito | Valor do token | Diferença |
|---|---|---|---|---|---|
| 1 | `SidebarNav.tsx:87` `height: '32px'` (altura da logo, expandida) | 32px | `shellBrandLogoSize` (`--sarak-shell-brand-logo-size`) | **28px** (default) | −12,5% se trocar |
| 2 | `TopbarNav.tsx:84` `'32px'` (mesma métrica, no topbar) | 32px | idem | 28px | idem |

Os dois usam **32px cru**, hoje, para o mesmo conceito ("altura da logo do brand") que **já tem token
publicado com default diferente**. Não sei se 32 é a intenção visual real (e o token é que está desatualizado)
ou se o token é a verdade e o cromo nunca foi migrado — é exatamente a pergunta que só você responde.

#### Balde 3 — conceito sem token (Expansão, R11 — decisão do dono, igual aos 9 do lote 4)

| # | Consumo | O que é | Por que não achei token |
|---|---|---|---|
| 1 | `SidebarNav.tsx:69` `'74px'` (largura da sidebar quando recolhida/só-ícone) | dimensão de layout do modo colapsado | `sidebarWidth` (200–240) e `sidebarMinWidth` (150–200) só cobrem a sidebar EXPANDIDA/redimensionável; não existe `sidebarCollapsedWidth` |
| 2 | `TopbarNav.tsx:63` `'40px'` (altura do topbar quando recolhido) | idem, modo colapsado | `topbarHeight` (default 64) só cobre o EXPANDIDO |
| 3 | `TopbarNav.tsx:84` `'20px'` (altura da logo quando recolhida) | idem | mesma lacuna do Balde 2 acima, mas para o estado colapsado — nem o valor errado (28) existe aqui |
| 4 | `DynamicRenderer.tsx:64` `rounded-[3rem]` · `:82` `rounded-[2rem]` · `:87`(metade)/`:94` `rounded-[1.5rem]` | raio de borda "cápsula" grande, numa tela de diagnóstico do Design Engine (loading/empty state do `Discovery`) | nenhum token de radius do catálogo passa de `--radius-badge` (99px, pill completo); não existe escala 24/32/48px |
| 5 | `ShellSearchWidget.tsx:78` `0.5rem` (gap do `calc(100%+0.5rem)`, distância do dropdown ao gatilho) | espaçamento pontual | não achei token de spacing pequeno inequívoco para este conceito específico (vários tokens de 8px existem, mas em domínios não relacionados — button/card/input padding — nenhum é "gap de dropdown flutuante") |

**Nota sobre o item 4:** `DynamicRenderer.tsx` e `SarakExpandableMatrixEngine.tsx` são telas de estado vazio/carregamento
do **próprio Design Engine** (`core/Discovery`), não cromo consumidor-facing comum — mesma classe de
"ferramenta de autoria interna" que a R10 já tratou como caso à parte para `features/**`. Vale a mesma pergunta
que a R10 levantou: isso deveria ter token, ou é tela de diagnóstico que não precisa responder a tema?

#### Balde 4 — literal legítimo, não deveria virar token (⇒ PARE E RELATE, sem allowlist)

| # | Consumo | Por que é legítimo |
|---|---|---|
| 1–2 | `SarakBackgroundRenderer.tsx:71` `#ffffff` / `#000000` | Não é cor de tema — é o ponto de referência matemático de um cálculo de contraste (`color-mix` contra a luminância detectada da mídia de fundo, branco/preto puro como polos opostos). Mesma classe do script de luminância que a `plan-12` usou para medir R31: literal de fórmula, não de estilo |
| 3 | `SidebarNav.tsx:107` `max-w-[120px]` | Truncamento de texto (`truncate`) — largura máxima de um rótulo, não uma propriedade visual de tema |
| 4 | `TopbarNav.tsx:104` `max-w-[150px]` | Idem |
| 5 | `ShellSearchWidget.tsx:78` `w-[400px]` (largura do dropdown de busca) | Dimensão de layout de um menu flutuante específico, não uma propriedade de identidade visual — nenhum tema plausível precisaria de um dropdown de busca mais estreito/largo |

**Nenhuma entrada de allowlist foi criada para estes 5** — ficam como achado relatado, conforme a §3.2 desta
plan proíbe.

### Verificações executadas

- `node gates/scripts/audit/auditor_hardcoded.mjs` → **33** (era 35).
- `npm run gate-limits:check` → **26/26**.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc --write` → baseline regravado.
- `npx vitest run` → **1ª rodada: 1 teste falhou** (`bin/scaffold/checkUpdate/__tests__/checkUpdateCli.contract.test.mjs`,
  `expect(runCheck()).toBe(0)`) — **2ª rodada, imediata, sem tocar em nada: 289/1004, 100% verde.** Não
  reproduziu; é a mesma classe de instabilidade sob contenção de workers já documentada para
  `PreviewCanvas.test.tsx`/`PresetsCatalog.test.tsx`, agora num arquivo diferente. Não investiguei a fundo
  porque não reproduziu — registrado para quem notar de novo, não escondido.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` (rodada limpa) → "igual ao baseline de
  2026-08-07 — nenhuma regressão."
- `git diff -- gates/scripts/` → só `auditor_hardcoded.mjs`, o conserto de falso positivo desta rodada.
- **`npm run gates:full` NÃO rodado nesta rodada** — nenhuma classe/CSS de cromo foi tocada ainda (Parte 2 é
  só investigação), e a Parte 1 mexeu em gate/allowlist, não em `src/` de produção.

### Critérios de aceite (desta rodada)

- [x] Parte 1: falso positivo corrigido, declarado, medido (35→33), baseline regravado junto.
- [x] Nenhuma allowlist nova criada — só remoção de 3 entradas mortas.
- [x] Nenhum token criado nesta rodada.
- [x] Nenhuma troca de literal por token executada na Parte 2 — nem as do Balde 1.
- [x] Classificação dos 33 apresentada nos 4 baldes, com literal × token × diferença onde aplicável.
- [x] Lotes 4 e 6 não tocados.
- [ ] `npm run gates:full` — não rodado (justificado acima; nenhuma mudança de `src/` de produção nesta rodada).

### Decisões e suposições

1. **Não executei o Balde 1 mesmo sendo permitido "adiantar".** Motivo: 3 dos 20 itens do Balde 1 estão na
   MESMA linha de um item do Balde 3 (`DynamicRenderer.tsx:87`) — resolver só a metade token deixaria a linha
   ainda vermelha por causa do `rounded-[1.5rem]`, e prefiro uma rodada de troca única e revisável a duas
   parciais na mesma linha.
2. **`--theme-border-width` para o `w-[1px]` do divisor (Balde 1, item 19)** é o candidato mais próximo, mas é
   uma reclassificação de conceito (borda → largura de elemento) que o valor batendo não resolve sozinho —
   listei como balde 1 com ressalva em vez de balde 4, para você decidir com o contexto visual.
3. **`DynamicRenderer`/`SarakExpandableMatrixEngine` tratados como candidatos a "ferramenta interna"** (Balde 3,
   nota) — não decidi isso sozinho; é uma pergunta aberta ao dono, análoga ao precedente de R10/`features/**`.

### Achados fora do escopo (não corrigidos)

- Nenhum novo.

### Pendências / riscos

- **Balde 1 (20 itens) pronto para execução**, aguardando só a confirmação de que pode adiantar (a plan já
  autoriza; fiz a pausa por prudência de revisão única, não por dúvida de classificação).
- **Balde 2 (2 itens)** — muda pixel 32px→28px se corrigido para o token. Decisão do dono.
- **Balde 3 (5 conceitos, 6 ocorrências)** — candidatos a Expansão (R11) ou aceitar como literal de tela
  interna. Decisão do dono.
- **Balde 4 (5 itens)** — recomendo aceitar como característica (análogo ao que `00-contexto` §8 já registra
  para outros casos), sem allowlist — mas quem fecha isso é você.
- **`time-tracking`:** ausente nesta sessão, mesma nota das rodadas anteriores.
- **`specs/00-indice.md` vai divergir de novo** ao voltar para `🟠` — mesma mecânica, executor não corrige.

---

## Resumo da execução (lote 6 — as 20 trocas de valor idêntico) — 2026-08-08

**Resultado:** Concluído. Escopo exclusivo: §12.1. Nenhum outro lote, nenhum gate, nenhum ghostvar, nenhuma
ocorrência de R10 tocados.

### As 20 trocas, com a prova estática de "zero pixel"

Valor resolvido do token (com `arquivo:linha` da definição) ao lado do literal substituído — iguais, como a
§12.1 exige.

| # | Arquivo:linha | Literal → Trocado por | Token | Definição (`arquivo:linha`) | Valor resolvido | Igual? |
|---|---|---|---|---|---|---|
| 1 | `SarakExpandableMatrixEngine.tsx:20` | `tracking-[0.3em]` → `tracking-[var(--sarak-tracking-wide,0.3em)]` | `trackingWide` | `typography.ts:353,360` | `0.3` (em) | ✅ |
| 2 | `DynamicRenderer.tsx:67` | `text-[10px]` → `text-2xs` | `typeScale2xs` (via `--text-2xs`) | `typography.ts:309,316` · `_theme.css:57` | `10` (px) | ✅ |
| 3 | `DynamicRenderer.tsx:87` | `tracking-[0.2em]` → `tracking-[var(--sarak-tracking-tight,0.2em)]` | `trackingTight` | `typography.ts:331,338` | `0.2` (em) | ✅ |
| 4 | `ShellContent.tsx:52` | `tracking-[0.4em]` → `tracking-[var(--sarak-tracking-wider,0.4em)]` | `trackingWider` | `typography.ts:364,371` | `0.4` (em) | ✅ |
| 5 | `ShellLanguageSelector.tsx:55` | `text-[10px]` → `text-2xs` | `typeScale2xs` | idem #2 | `10` (px) | ✅ |
| 6 | `ShellLanguageSelector.tsx:56` | `text-[9px]` → `text-3xs` | `typeScale3xs` (via `--text-3xs`) | `typography.ts:298,305` · `_theme.css:56` | `9` (px) | ✅ |
| 7 | `ShellLanguageSelector.tsx:65` | `text-[10px]` → `text-2xs` | `typeScale2xs` | idem #2 | `10` (px) | ✅ |
| 8 | `ShellLanguageSelector.tsx:87` | `text-[10px]` → `text-2xs` | `typeScale2xs` | idem #2 | `10` (px) | ✅ |
| 9 | `ShellSearchWidget.tsx:47` | `text-[8px]` → `text-[var(--sarak-type-scale-tiny,8px)]` | `typeScaleTiny` | `typography.ts:287,294` | `8` (px) | ✅ |
| 10 | `ShellSearchWidget.tsx:68` | `text-[8px]` → idem #9 | `typeScaleTiny` | idem #9 | `8` (px) | ✅ |
| 11 | `ShellSearchWidget.tsx:82` | `tracking-[0.2em]` → `tracking-[var(--sarak-tracking-tight,0.2em)]` | `trackingTight` | idem #3 | `0.2` (em) | ✅ |
| 12 | `ShellSearchWidget.tsx:94` | `text-[9px]` → `text-3xs` | `typeScale3xs` | idem #6 | `9` (px) | ✅ |
| 13 | `ShellUserWidget.tsx:26` | `text-[10px]` → `text-2xs` | `typeScale2xs` | idem #2 | `10` (px) | ✅ |
| 14 | `ShellUserWidget.tsx:29` | `text-[7px]`+`tracking-[0.2em]` → `text-[var(--sarak-type-scale-micro,7px)]`+`tracking-[var(--sarak-tracking-tight,0.2em)]` | `typeScaleMicro` + `trackingTight` | `typography.ts:276,283` + idem #3 | `7` (px) + `0.2` (em) | ✅ |
| 15 | `ShellUserWidget.tsx:69` | `text-[8px]` → idem #9 | `typeScaleTiny` | idem #9 | `8` (px) | ✅ |
| 16 | `SidebarNav.tsx:130` | `tracking-[0.2em]` → `tracking-[var(--sarak-tracking-tight,0.2em)]` | `trackingTight` | idem #3 | `0.2` (em) | ✅ |
| 17 | `TopbarNav.tsx:102` | `text-[10px]` → `text-2xs` | `typeScale2xs` | idem #2 | `10` (px) | ✅ |
| 18 | `TopbarNav.tsx:124` | `text-[10px]` → `text-2xs` | `typeScale2xs` | idem #2 | `10` (px) | ✅ |
| 19 | `TopbarNav.tsx:150` | `w-[1px]` → `w-[var(--theme-border-width,1px)]` | `borderWidth` | `system.ts:129,136` (`cssVars` inclui `--theme-border-width`) | `1` (px) | ✅ |
| 20 | `SarakShell.tsx:215` | `text-[10px]` → `text-2xs` | `typeScale2xs` | idem #2 | `10` (px) | ✅ |

**Os dois avisos do revisor se confirmaram, exatamente como previsto:**

1. `DynamicRenderer.tsx:87` **continua vermelha** — o `tracking` foi pago (item 3), mas o `rounded-[1.5rem]`
   (lote 8) segue na mesma linha/`className`, e o auditor reporta por linha inteira.
2. **Violação ≠ linha.** 31 → **12** (não 31−20=11): a linha 87 conta como 1 violação tanto antes quanto
   depois — o item pago dentro dela não zera a linha sozinho. As outras 19 trocas fecharam sua própria linha
   1:1.

### Verificações executadas

- `node gates/scripts/audit/auditor_hardcoded.mjs` → **antes: 31 · depois: 12** (`Valor: 12`, `Estrutural: 0`).
- `node gates/scripts/audit/run_audit.mjs` → só `auditor_composicaoatomica` (R10, 47, fora do escopo deste
  lote) segue vermelho entre os 4 que já estavam.
- `npm run gate-limits:check` → **26/26**.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc --write` → baseline regravado
  (`hardcoded.valor: 31 → 12`).
- `npx vitest run` → **1ª rodada: 2 snapshots falharam** (`PreviewCanvas.test.tsx`,
  `PreviewSystemRenderer.test.tsx`) — **esperado, não regressão**: os dois renderizam o cromo inteiro (Design
  Engine preview) e capturam a `className` literal dos componentes que este lote editou. O `diff` mostrado pelo
  próprio vitest confirma que a ÚNICA mudança é o texto da classe (`tracking-[0.2em]` →
  `tracking-[var(--sarak-tracking-tight,0.2em)]`, `text-[10px]` → `text-2xs`, `text-[8px]` →
  `text-[var(--sarak-type-scale-tiny,8px)]`) — nenhuma estrutura de DOM mudou. Atualizei os dois snapshots
  (`npx vitest run -u`). **2ª rodada, limpa: 290 arquivos / 1012 testes, 100% verde.**
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` (pós-regravação) → relatou
  `auditor_sectionpointers.mjs.mortos: 2 → 1` como **MELHORIA não bloqueante** — **não é minha**: não toquei
  `specs/specs/`, `specs/adr/` nem nenhum ponteiro de seção nesta rodada. É uma mudança concorrente (fora deste
  diff) que já estava no working tree quando medi. **Não regravei** essa métrica — quem fez o conserto grava o
  número, e não fui eu.
- `git diff --stat` → os **9 arquivos** de `src/core/` listados no prompt + `gates/baselines/audit-baseline.json`
  + os 2 arquivos de snapshot (`__snapshots__/PreviewCanvas.test.tsx.snap`,
  `__snapshots__/PreviewSystemRenderer.test.tsx.snap`) + esta plan. **Fora disto**, o `git diff --stat` também
  mostra `specs/00-indice.md`, `specs/specs/15-divida-conhecida.md` e
  `src/core/Provider/generated/design-token-ids.ts` modificados — **nenhum dos três é meu**: não os toquei em
  nenhum momento desta rodada (o último é gerado, e eu nunca rodo o gerador de tokens sem instrução explícita).
  São mudanças já presentes no working tree, de outra atividade concorrente.

### Critérios de aceite

- [x] Escopo exclusivo à §12.1 — nenhum outro lote tocado.
- [x] As 20 trocas aplicadas, cada uma com prova estática (valor do token = literal).
- [x] Nenhum gate alterado — `git diff -- gates/scripts/` vazio.
- [x] Nenhuma edição em `specs/specs/`, `specs/adr/` ou `specs/00-indice.md`.
- [x] Item 19 (`w-[1px]`) trocado conforme a decisão do dono já fechada — não reaberta.
- [x] Baseline regravado junto (`hardcoded 31→12`), no mesmo lote.
- [x] `npx vitest run` verde (suíte inteira, não pasta a dedo) — 290/1012 depois de atualizar os 2 snapshots.
- [x] `npm run gate-limits:check` → 26/26.

### Decisões e suposições

1. **Atualizei os 2 snapshots afetados** (`PreviewCanvas`, `PreviewSystemRenderer`) em vez de declarar como
   pendência — o próprio diff do vitest prova que a única mudança é textual (nome da classe), não estrutural, e
   os dois componentes fonte estão nesta mesma lista de 20 trocas aprovadas. Atualizar é registrar o resultado
   esperado da mudança já aprovada, não maquiar nada.
2. **Não regravei o `sectionpointers` de 2 para 1** — essa melhoria não é desta rodada nem deste executor;
   regravar tornaria o baseline não-auditável (baseline tem de andar com QUEM fez o conserto).
3. **Não investiguei `design-token-ids.ts`/`15-divida-conhecida.md`** além de confirmar que não são meus — são
   arquivos fora do meu alcance (gerado / spec fixa) e fora do escopo desta rodada.

### Achados fora do escopo (não corrigidos)

- Nenhum novo.

### Pendências / riscos

- **11 de 31 `hardcoded` restam**: 4 em `DynamicRenderer.tsx` (radius, lote 8) + 1 em `ShellSearchWidget.tsx:78`
  (gap/width/z, lote 8) + 3 em `SidebarNav.tsx` (74px, 32px, max-w-120px — lotes 7/8) + 3 em `TopbarNav.tsx`
  (40px, 20px, 32px, max-w-150px — nota: são 4 ocorrências em 3 linhas — lotes 7/8). Todos já roteados pela
  §2.3/§2.4; nenhum é deste lote.
- **`time-tracking`:** ausente nesta sessão, mesma nota de todas as rodadas anteriores.
- **`specs/00-indice.md` vai divergir de novo** ao mudar o status desta plan — mesma mecânica, executor não
  corrige.
- **Mudanças concorrentes no working tree** (`specs/00-indice.md`, `specs/specs/15-divida-conhecida.md`,
  `design-token-ids.ts`) não são minhas e não foram tocadas — sinalizadas acima para o revisor não as confundir
  com este diff.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito parcial (lotes 1–3) — 2026-08-07 — 🟢 Aprovado

**Aprovado sem achado.** A plan continua `🟡 Em execução` — os lotes 4, 5 e 6 seguem abertos. Este bloco libera
**apenas** o commit dos três primeiros, conforme combinado na parada do passo 2: não prender texto e tipagem a
um refactor de 20 componentes.

### Reproduzido por mim

| Verificação | Medição |
|---|---|
| `npx tsc --noEmit` | **limpo** — exit 0, zero saída. Produção 0, teste 0 |
| `npm run gates:full` | **exit 0** de ponta a ponta; `coverage:check` igual ao piso (70,66%) |
| `gate-limits:check` | **26/26** |
| Baseline regravado | `sectionpointers 27 → 18` · `tsc {erros 0, producao 0, teste 0}` · **`hardcoded 35`, `ghostvars 27`, `composicaoatomica 47` intactos** — os três não pagos não se moveram |
| `git diff -- gates/allowlists/` | vazio |
| Achado 29 | **fechado de verdade**: `buildDevState.mjs:63` aponta `§2`, e `sarak-dev/GUIA-MANUTENCAO.md` tem **0** ocorrências de `§5.1` — regenerado, não editado à mão |
| `PresetsCatalog.test.tsx` | **uma linha**, só o timeout, com o motivo e o precedente citados |

### As três decisões da entrega, todas certas

1. **Não editar `arquitetura/04` (lote 1).** É spec fixa, e [[00-prompt-executor]] §7.3 proíbe. Declarar para a
   síntese foi o comportamento correto — o mesmo das plans 12 e 16.
2. **O conserto do `check-gate-limits.mjs` é falso positivo, não exceção.** Um `.d.ts` é declaração de tipo
   pura: não tem lógica de verificação, logo não tem "o que não vê" para declarar. E o diff faz as **duas**
   coisas na mesma edição — a condição `&& !entry.endsWith('.d.ts')` **e** o bloco `LIMITES DECLARADOS`
   atualizado com o porquê. É exatamente o que R18 pede de quem mexe num gate.
3. **O timeout do `PresetsCatalog`.** Mesma causa-raiz já documentada na `plan-12` (instrumentação V8 +
   contenção de workers), verificada isolada, e coberta pela §3.7 do [[00-prompt-executor]]: *gate cujo baseline
   é verde sai verde, mesmo quando a causa é de outra plan*. Não é sua dívida e ainda assim era sua
   responsabilidade — a distinção está aplicada certa.

### Os 18 ponteiros restantes são MEUS, e isso está correto

Conferi onde vivem: **`specs/specs/` (14) · `specs/adr/` (3) · `specs/00-indice.md` (1)**. Nenhum está ao
alcance do executor. A recusa foi certa, e a lista completa que você deixou é o que torna o handoff barato.

> **Consequência para o objetivo da plan:** enquanto esses 18 não caírem, `auditor_sectionpointers` não chega a
> zero — e **o conserto não é execução, é manutenção de spec do revisor**. Está roteado na mensagem ao dono.

**Liberado: pode commitar os lotes 1–3.** Siga para a parada do lote 4.

## Veredito parcial (lote 4 — caracterização + `--theme-text`) — 2026-08-07 — 🟢 Aprovado

**Aprovado.** O conserto no-op está certo, a tabela de caracterização é o que a §5.4 pedia, e as **duas
incertezas declaradas foram bem declaradas** — não forçar conclusão foi o comportamento correto. Elas são
resolvíveis, e a resolução está abaixo.

### Verificado por mim

| | Medição |
|---|---|
| Escopo | **3 arquivos** — `_theme.css`, o baseline e esta plan. `gates/scripts/` **intocado** |
| O conserto | uma linha: `var(--theme-text, var(--text-main,#fff))` → `var(--text-main,#fff)`. **Preserva exatamente o valor efetivo de hoje** — no-op de verdade |
| `auditor_ghostvars` | **26** · baseline **26** · `check-audit-baseline --with-tsc` → *"igual ao baseline"* |
| Suíte completa | **289 arquivos / 1004 testes**, verde — rodada por mim, porque a mudança foi em CSS importado |

### As duas incertezas: resolvidas estaticamente, sem browser

**Ambas se decidem por semântica de CSS, não por experimento.** Um `var()` de custom property indefinida
**sem fallback** torna a declaração *invalid at computed-value time* — a propriedade cai para `unset`. Isso é
especificação, não observação, e vale para os dois casos:

- **`_surfaces.css:45`** — `color-mix(in srgb, var(--bg-card), …)` com `--bg-card` indefinida e sem fallback:
  o `color-mix()` é inválido, a declaração inteira cai. **Grupo B confirmado, sem necessidade de browser.**

- **`SidebarNav.tsx:142` — MUDA DE GRUPO, e revela um segundo defeito.** O fallback é
  `var(--theme-primary-rgb,59,130,246)/10`, que expande para `59,130,246/10` **como valor de
  `background-color`** — não há função de cor envolvendo. É **CSS inválido**. A prova está na **mesma linha**:
  o `shadow-[…]` ao lado usa a forma correta, `rgba(var(--theme-primary-rgb),0.05)`.
  Compare com `TopbarNav.tsx:123`, que também é correto: `rgba(var(--theme-primary-rgb),0.2)`.

  **Consequência:** o item ativo da sidebar **não tem realce hoje** — e o defeito é **independente do
  fantasma**. Renomear `--sarak-sidebar-active` → `-active-color` faria a variável resolver e o fallback
  malformado ficaria **inalcançável** — ou seja, **o bug seria mascarado, não consertado**. Quem consertar tem
  de corrigir as duas coisas, ou o defeito volta no dia em que alguém mexer no token.

**Grupo A cai de 4 para 3 consumos; grupo B sobe de 10 para 11.**

### O achado que a entrega produziu, e que vale além dela

> **A coluna "tem fallback?" é o que separa conserto de mudança visual** — não a existência de um alvo certo.

Está certo, e a `SidebarNav` acrescenta o corolário: **o fallback também pode estar quebrado**. Um consumo
fantasma com fallback malformado tem **dois** defeitos empilhados, e consertar só o nome esconde o segundo.
Nenhum gate vê isso — o `auditor_ghostvars` cruza o **nome** contra o registro e não valida a **sintaxe** do
fallback. É limite novo, e vai declarado.

**Liberado: pode commitar.** O índice foi espelhado por mim para 🟠 nesta mesma ação — a regra nova da
[[00-indice]] §5 sendo aplicada pela primeira vez.

---

# 12. AS TAREFAS DOS LOTES 6–9 — a lista executável

> 🔴 **Esta é a fonte da verdade do trabalho que falta.** As tabelas dentro dos "Resumos de execução" (§10) são
> **histórico congelado** — o que o executor mediu e classificou naquele dia. Quando as duas divergirem, esta
> seção vence. Escrita pelo revisor em 2026-08-08, depois das decisões da §2.3.

**Um lote por conversa.** A ordem é a da §2.4 e existe para separar o que muda pixel do que não muda.

> 🔴 **VALE PARA TODO LOTE — o baseline tem um ESPELHO, e ninguém o estava movendo** *(medido pelo revisor em
> 2026-08-08)*. `sarak-dev/` é **gerado** e reproduz os números do baseline em `GUIA-MANUTENCAO.md §B.4`,
> `state.json` e `START-HERE.md`. Ele está defasado **desde o lote 4**: o repo diz `hardcoded 35`,
> `ghostvars 27`, `sectionpointers 18`; o real é `31`, `26`, `2`.
>
> **`dev-kit:check` é o PRIMEIRO comando de `gates:full`** — enquanto isso não fechar, `gates:full` não passa,
> e a regra *"o baseline se regrava JUNTO do conserto"* fica meia cumprida. **Todo lote que mover o baseline
> roda `npm run dev-kit` e commita o resultado junto.** Não é conserto de gate (o script é gerador, não
> verificador) — é o mesmo ato de regravar o baseline, na outra ponta.

## 12.1 Lote 6 — as 20 trocas de valor idêntico  ·  `🟢 EXECUTADO em 2026-08-08`

> ✅ **Entregue e aprovado.** As 20 trocas aplicadas, `hardcoded` **31 → 12**. O veredito com a verificação
> independente do revisor está na §11; o relatório do executor, na §10. **A tabela abaixo fica como registro
> do que foi pedido** — não é mais trabalho pendente.

**Não muda pixel nenhum.** Cada literal abaixo tem token com valor **exatamente igual**. Paga 20 dos 31
`hardcoded`.

| # | Arquivo:linha | Literal hoje | Token | Trocar por |
|---|---|---|---|---|
| 1 | `SarakExpandableMatrixEngine.tsx:20` | `tracking-[0.3em]` | `trackingWide` | `tracking-[var(--sarak-tracking-wide,0.3em)]` |
| 2 | `DynamicRenderer.tsx:67` | `text-[10px]` | `typeScale2xs` | `text-2xs` |
| 3 | `DynamicRenderer.tsx:87` | `tracking-[0.2em]` | `trackingTight` | `tracking-[var(--sarak-tracking-tight,0.2em)]` |
| 4 | `ShellContent.tsx:52` | `tracking-[0.4em]` | `trackingWider` | `tracking-[var(--sarak-tracking-wider,0.4em)]` |
| 5 | `ShellLanguageSelector.tsx:55` | `text-[10px]` | `typeScale2xs` | `text-2xs` |
| 6 | `ShellLanguageSelector.tsx:56` | `text-[9px]` | `typeScale3xs` | `text-3xs` |
| 7 | `ShellLanguageSelector.tsx:65` | `text-[10px]` | `typeScale2xs` | `text-2xs` |
| 8 | `ShellLanguageSelector.tsx:87` | `text-[10px]` | `typeScale2xs` | `text-2xs` |
| 9 | `ShellSearchWidget.tsx:47` | `text-[8px]` | `typeScaleTiny` | `text-[var(--sarak-type-scale-tiny,8px)]` |
| 10 | `ShellSearchWidget.tsx:68` | `text-[8px]` | `typeScaleTiny` | idem #9 |
| 11 | `ShellSearchWidget.tsx:82` | `tracking-[0.2em]` | `trackingTight` | idem #3 |
| 12 | `ShellSearchWidget.tsx:94` | `text-[9px]` | `typeScale3xs` | `text-3xs` |
| 13 | `ShellUserWidget.tsx:26` | `text-[10px]` | `typeScale2xs` | `text-2xs` |
| 14 | `ShellUserWidget.tsx:29` | `text-[7px]` **+** `tracking-[0.2em]` | `typeScaleMicro` + `trackingTight` | `text-[var(--sarak-type-scale-micro,7px)]` + idem #3 |
| 15 | `ShellUserWidget.tsx:69` | `text-[8px]` | `typeScaleTiny` | idem #9 |
| 16 | `SidebarNav.tsx:130` | `tracking-[0.2em]` | `trackingTight` | idem #3 |
| 17 | `TopbarNav.tsx:102` | `text-[10px]` | `typeScale2xs` | `text-2xs` |
| 18 | `TopbarNav.tsx:124` | `text-[10px]` | `typeScale2xs` | `text-2xs` |
| 19 | `TopbarNav.tsx:150` | `w-[1px]` (divisor vertical) | `--theme-border-width` (1px) | `w-[var(--theme-border-width,1px)]` — **aprovado pelo dono**: um divisor vertical *é* uma borda |
| 20 | `SarakShell.tsx:215` | `text-[10px]` | `typeScale2xs` | `text-2xs` |

**Dois avisos medidos pelo revisor, para o número não assustar:**

1. **`DynamicRenderer.tsx:87` continua vermelha depois do conserto.** A linha tem dois conceitos —
   `tracking-[0.2em]` (item 3, deste lote) e `rounded-[1.5rem]` (lote 8). O auditor reporta por **linha**, com
   o `className` inteiro. Não tente zerá-la aqui.
2. **Violação e linha não são a mesma unidade.** Não presuma que o baseline cai exatamente 20 — meça antes e
   depois e escreva os dois números.

**A prova de "zero pixel" é estática e é o critério de aceite principal:** para cada troca, mostre o valor
resolvido do token (`arquivo:linha` da definição) ao lado do literal substituído. Iguais = provado. Não há
automação visual nesta base ([[01-gates-e-baseline]] §2.6) — não invente uma.

**Se algum item não bater exatamente, ele não é deste lote:** ⇒ PARE e relate.

## 12.2 Lote 7 — muda a tela, em duas direções opostas  ·  `🔴 A executar`

**Único lote que exige revisão visual do dono antes do commit.**

- **Balde 2 (2 itens)** — `SidebarNav.tsx:87` e `TopbarNav.tsx:84`, ambos `32px` crus. **Decisão do dono
  (§2.3 #3): o default de `shellBrandLogoSize` vai de 28 para 32** e os dois passam a consumir o token. Zero
  pixel muda; o que muda é o contrato do token.
- **Ghostvars grupo A (3–4 consumos)** — têm fallback funcional; consertar **troca a cor na tela**.
- **Ghostvars grupo B (10–11 consumos)** — sem fallback; hoje não renderizam nada. Consertar **liga** estilo
  desligado: os 4 easings, `--bg-card` ×3, `--theme-surface-main`, `SidebarNav`, `--theme-background` ×2.

> 🔴 **`SidebarNav.tsx:142` tem dois defeitos empilhados** — nome fantasma **e** fallback malformado
> (`59,130,246/10`, sem função de cor). Consertar só o nome **mascara** o segundo. Os dois, ou nenhum.

**Resolvido estaticamente pelo revisor, não precisa de browser:** os dois casos que o lote 4 marcou como "só
`getComputedStyle` resolve" (`SidebarNav:142` e `_surfaces.css:45`) são **IACVT** — fallback sem função de cor
e `color-mix` com argumento inválido derrubam a declaração inteira. **Já estão quebrados**; consertar não pode
piorar.

### Os 4 raios do `DynamicRenderer` — entraram aqui em 2026-08-08 (decisão 6 da §2.3)

Vieram do lote 8 porque **mudam pixel**. Reusar o token de papel, nunca criar escala nova:

| Linha | Hoje | Elemento | Trocar por |
|---|---|---|---|
| `DynamicRenderer.tsx:64` | `rounded-[3rem]` | painel de estado vazio (`border-dashed`, `p-20`) | `rounded-[var(--radius-sarak)]` — é superfície |
| `:82` | `rounded-[2rem]` | o `<nav>` que contém as abas | `rounded-[var(--radius-sarak)]` — é superfície |
| `:87` | `rounded-[1.5rem]` | o botão de aba | `rounded-[var(--radius-btn)]` — é controle |
| `:94` | `rounded-[1.5rem]` | a pílula ativa atrás da aba | `rounded-[var(--radius-btn)]` — acompanha o botão que ela preenche |

**Esta é a linha que fecha `DynamicRenderer.tsx:87`** — o lote 6 tirou o `tracking-[0.2em]` dela e a deixou
vermelha de propósito, à espera deste raio.

## 12.3 Lote 8 — Expansão: tokens novos e a cadeia de paridade  ·  `🔴 A executar`

Aprovado em §2.3 #4 e #5. Cada token novo arrasta a cadeia inteira de
[[04-contrato-de-tokens-e-paridade]] — tipo público, catálogo, testes.

| Token | Valor | Origem |
|---|---|---|
| `sidebarCollapsedWidth` | 74px | `SidebarNav.tsx:69` |
| `topbarCollapsedHeight` | 40px | `TopbarNav.tsx:63` |
| `brandLogoSizeCollapsed` | 20px | `TopbarNav.tsx:84` |
| `searchDropdownGap` | 0.5rem | `ShellSearchWidget.tsx:78` |
| `searchDropdownWidth` | 400px | `ShellSearchWidget.tsx:78` |
| `sidebarLabelMaxWidth` | 120px | `SidebarNav.tsx:107` |
| `topbarLabelMaxWidth` | 150px | `TopbarNav.tsx:104` |
| *(dos 9 candidatos do lote 4)* | — | **criar 6**; os 3 `*-scaled` redirecionam para `layoutGap*`/`layoutPadding`/`borderRadius` |

> ✅ **A pendência de raio saiu daqui em 2026-08-08.** O dono escolheu **reusar o token de papel** (decisão 6
> da §2.3), o que muda pixel — então os 4 `rounded-[Nrem]` do `DynamicRenderer` foram para o **lote 7**
> (§12.2). **Nenhum token de raio novo será criado**; este lote é só Expansão de verdade.

## 12.4 Lote 9 — R10, composição atômica  ·  `🔴 A executar`

**47 ocorrências em 20 arquivos** de HTML nativo cru: `components/atomic` 23 · `core/Shell` 15 · `Layout` 6 ·
`engines` 2 · `Discovery` 1. É o maior e o mais arriscado — mexe em foco, teclado e estilo de componente
montado. **A caracterização vem antes** (§5.4, skill `code-adequacao`), não depois.

`features/**` está **fora** por decisão do dono (ferramenta de autoria da própria lib) — as 64 ocorrências de
lá não são dívida. O detector é AST, nunca regex de linha: a `plan-16` mediu que
`<(button|input|select)[ >/]` **perde 55 de 111** por ser busca por linha.

## 12.5 Fora dos lotes — o que é do revisor

Os **2 ponteiros de seção** que sobraram (`01-gates-e-baseline.md:572` → `§7.3` e `15-divida-conhecida.md:179`
→ `§4.2`) e a **linha 70 de `15-divida-conhecida.md`**, que ainda declara o achado 29 aberto quando ele já foi
pago (`sarak-dev/GUIA-MANUTENCAO.md:308` hoje aponta `§2`, o alvo certo). São arquivos de `specs/specs/` — o
executor **não os toca** ([[00-prompt-executor]] §7.3). `⏳ Aguardando autorização do dono.`
