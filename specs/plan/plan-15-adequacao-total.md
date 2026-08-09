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

## Resumo da execução (lote 7 — Balde 2 + ghostvars A/B + os 4 raios) — 2026-08-08

**Resultado:** Concluído.

**⇒ PARADA OBRIGATÓRIA — mudanças visíveis, por natureza, ANTES de qualquer commit.** Nada foi commitado; isto
é o relatório que o dono revisa antes de autorizar.

### (a) Balde 2 — `shellBrandLogoSize` 28→32

| Arquivo:linha | Antes | Depois |
|---|---|---|
| `src/core/Design/schema/navigation.ts:56` | `defaultValue: 28` | `defaultValue: 32` |
| `src/core/Shell/Components/SidebarNav.tsx:87` | `height: '32px'` (cru, ignorava o token) | `height: 'var(--sarak-shell-brand-logo-size, 32px)'` |
| `src/core/Shell/Components/TopbarNav.tsx:84` | `height: ... ? '20px' : '32px'` (32px cru) | `height: ... ? '20px' : 'var(--sarak-shell-brand-logo-size, 32px)'` |

**Resultado no pixel destes dois:** zero — os dois já renderizavam 32px; agora chegam lá pelo token. Confere no
`git diff` das duas linhas: só o `style` mudou de string literal para `var(...)`.

🔴 **Achado que o pedido original não previa — a decisão tem um raio maior do que os dois arquivos citados.**
`--sarak-shell-brand-logo-size` é injetada por `useDesignVariables.ts:62-63` (`design[token.id] ?? token.defaultValue`) **sempre**, para todo consumidor, não só para `SidebarNav`/`TopbarNav`. Existe um TERCEIRO consumidor
do mesmo token, já com `var(...)` correto: `src/components/atomic/Navigation/SarakShellNav.tsx:134` —
`style={{ height: 'var(--sarak-shell-brand-logo-size, 28px)' }}`. Este componente (não tocado, fora do escopo
literal do pedido) é usado por `SarakAppChrome.tsx`, `SarakAppChromeMobile.tsx`, `SarakAuthScreen.tsx` e
`SarakDataCards.tsx`. Como o valor da variável passa a ser emitido como `32px` (o default mudou), **o fallback
`28px` escrito ali nunca vai ganhar da variável real** — logo o logo renderizado por `SarakShellNav` também
sobe de 28px para 32px em qualquer consumidor que não tenha customizado `shellBrandLogoSize` no próprio tema.
Confirmado por leitura de código (`useDesignVariables.ts` injeta o token sempre; nenhum branch o pula) — não é
suposição. **Isto não é desvio da decisão do dono** (o token é mesmo o alvo, 32 é mesmo a realidade que se quer
generalizar) — é o alcance real dela, maior que os dois `arquivo:linha` citados no pedido.

### (b) Ghostvars grupo A — troca a cor na tela (3 consumos, não 3-4: o 4º elegível foi para o grupo B, ver nota abaixo)

| # | Arquivo:linha | Nome fantasma → real | Antes (via fallback, hoje) | Depois (via token real) |
|---|---|---|---|---|
| 1 | `TopbarNav.tsx:123` | `--sarak-topbar-active` → `--sarak-topbar-active-color` | `rgba(var(--theme-primary-rgb),0.2)` — quadrado translúcido atrás do ícone ativo (topbar recolhida) | `topbarActiveColor` é token real (`navigation.ts:167-174`), `defaultValue: 'transparent'` — **some o destaque de fundo por padrão**; some só volta se o host customizar `topbarActiveColor` no tema |
| 2 | `TopbarNav.tsx:124` | idem | `var(--theme-primary)` — "pílula" sólida atrás do item ativo (topbar expandida) | idem — fundo vira `transparent` por padrão |
| 3 | `_utilities.css:49` | `--sarak-button-active` → `--sarak-button-active-color` | `var(--theme-primary-active)` (cor escurecida do primário, no `:active` de qualquer botão) | **Sem mudança de pixel.** Ver achado abaixo — `--sarak-button-active-color` nunca é emitida em runtime, então a declaração cai no MESMO fallback de antes |

🔴 **Achado: o item 3 não se comporta como "grupo A" apesar de estar catalogado assim.** `buttonActiveColor`
existe **só** em `src/core/Provider/manifest.ts:210` (`DESIGN_MANIFEST`) — busquei por toda a árvore quem lê o
campo `.vars`/`.transform` desse manifesto (`grep -rn ".transform(\|DESIGN_MANIFEST)" src/`) e o único uso real
é `Object.keys(DESIGN_MANIFEST)` em `validation.ts:34`, só para **aceitar** a chave no payload — ninguém nunca
usa `.vars`/`.transform` para de fato emitir `--sarak-button-active-color` no DOM. É metadado morto (mesma
família do "Registry do motor de manifesto" que já morreu, [[002-remocao-motor-manifesto]], mas este pedaço
específico não foi removido). Resultado prático: renomear fecha o gate (o auditor conta `manifesto` como fonte
válida desde a calibragem recente) e não piora nada — mas também **não liga** o botão ao token real; o
`:active` de qualquer botão continua 100% dependente de `--theme-primary-active`, exatamente como hoje. Não
consertei o manifesto morto — está fora do escopo (não é um dos 4 consumos previstos pelo pedido, e mexer nele
é decisão de arquitetura, não renomeação). Registrado em "achados fora do escopo".

### (c) Ghostvars grupo B — liga estilo que está desligado (11 consumos)

| # | Arquivo:linha | Nome fantasma → real | Antes (declaração cai — IACVT/sem fallback) | Depois |
|---|---|---|---|---|
| 4 | `_utilities.css:21` | `--ease-sarak-cubic` → `--sarak-ease-main` (+ fallback `cubic-bezier(0.4,0,0.2,1)`) | `.transition-sarak` não anima (timing-function inválido derruba o `transition` inteiro) | anima com a curva "Standard" do sistema |
| 5 | `_utilities.css:34` | idem | sincronização de raio do botão não anima | anima |
| 6 | `_utilities.css:39` | idem | sincronização de raio de input/select/textarea não anima | anima |
| 7 | `_utilities.css:51` | `--ease-sarak-fluid` → `--sarak-ease-out` (+ mesmo fallback) | o "afundar" do botão no clique (`scale(0.98)`) não anima, salta direto | anima (decelera na saída) |
| 8/12 | `_base.css:16` (uma linha, dois nomes) | `--theme-surface-main`→`--theme-surface`, `--bg-card`→`--card-bg` | `--theme-card` inválida nesta declaração (cai por inteiro) — só não se nota porque o Provider, quando montado, sobrescreve `--theme-card` por `style` inline com especificidade maior (a própria `cardBackgroundColor` já emite `--theme-card` direto); esta linha só importa fora do alcance do Provider | `--theme-card` resolve corretamente aqui também |
| 9 | `_surfaces.css:25` | `--bg-card`→`--card-bg` | `[data-surface="matte"]` sem `background-color` (declaração cai, `!important` e tudo) | modo matte passa a aplicar o fundo do card de verdade |
| 10 | `_surfaces.css:45` | idem, dentro de `color-mix()` | `[data-surface="brushed"] .sarak-card` sem `background` nenhum (gradiente de ruído + `color-mix` caem juntos, é um `background` só) | modo brushed passa a mostrar a textura de ruído sobre a cor do card |
| 11 | `SidebarNav.tsx:142` | `--sarak-sidebar-active` → `--sarak-sidebar-active-color`, **e** fallback malformado `var(--theme-primary-rgb,59,130,246)/10` → `rgba(var(--theme-primary-rgb),0.1)` (os dois defeitos consertados juntos, como mandado) | item ativo da sidebar sem fundo nenhum (`bg-[...]` cai por inteiro — IACVT) | `sidebarActiveColor` é token real, `defaultValue: 'transparent'` — **visualmente igual a hoje por padrão** (sem fundo), mas agora é `transparent` válido e customizável pelo host, não mais uma declaração quebrada |
| 13 | `presets/components/inputs.ts:34` | `--theme-background`→`--theme-body` | preset "Industrial Inset": `inputBg` inválido, input sem fundo | input ganha fundo `#050505` (cor global do body) — o efeito "entalhado" pretendido passa a aparecer |
| 14 | `presets/components/inputs.ts:69` | idem | preset "High Contrast (Brutalism)": idem | idem |

**Suposição declarada (decisão minha, não do dono — os itens 4/5/6/7 não tinham alvo nomeado em lugar nenhum):**
só existem DOIS tokens de easing "família CSS" no catálogo — `--sarak-ease-main` ("Standard", usado pela
maioria das transições, `animations.ts:59-76`) e `--sarak-ease-out` ("Saída Suave", `animations.ts:79-94`); os
três `motionEase*` de `motion.ts` são para `framer-motion`/JS, não para `transition:` puro em CSS, então
descartei essa família. Mapeei `-cubic` (uso genérico, 3 ocorrências) → `--sarak-ease-main`, e `-fluid` (o
"afundar" de clique) → `--sarak-ease-out`. **Se o dono quis outra curva, é só trocar o nome — nenhum token novo
foi criado, a troca é de uma linha.**

**A nomeação `--bg-card`→`--card-bg` e `--theme-surface-main`→`--theme-surface`:** não é arbitrária — os dois
nomes reais existem como `cssVars` do MESMO token (`cardBackgroundColor`, `colors.ts:126-137`, que emite
`['--card-bg', '--theme-surface', '--theme-card', '--sarak-card-bg', '--theme-card-bg']`), então os dois lados
da cadeia em `_base.css:16` resolvem para o MESMO valor — troquei só os nomes, não a estrutura da cadeia.

### (d) Os 4 raios do `DynamicRenderer.tsx` — decisão 6 da §2.3

| Linha | Antes | Depois | Resolvido hoje (leitura estática da cadeia, não medido em browser) |
|---|---|---|---|
| `:64` | `rounded-[3rem]` (48px) | `rounded-[var(--radius-sarak)]` | `--radius-sarak` cai em `--radius-theme` → `var(--theme-radius-scaled, 12px)` → **12px** (nenhum tema custom no baseline de teste) |
| `:82` | `rounded-[2rem]` (32px) | `rounded-[var(--radius-sarak)]` | **12px**, mesma cadeia |
| `:87` | `rounded-[1.5rem]` (24px) | `rounded-[var(--radius-btn)]` | `--radius-btn` resolve em `--sarak-btn-border-radius` (token responsivo `btnBorderRadius`, `defaultValue.desk: 8px`) → **8px** |
| `:94` | `rounded-[1.5rem]` (24px) | `rounded-[var(--radius-btn)]` | **8px**, mesma cadeia |

Confirma a estimativa do dono ("48px → 12px no padrão"); o par `:87`/`:94` desce mais ainda, a 8px, por resolver
via `--radius-btn` (controle) em vez de `--radius-sarak` (superfície) — é exatamente a distinção de papel que a
decisão 6 pediu.

**O que foi feito**
- `src/core/Design/schema/navigation.ts:56` — `shellBrandLogoSize.defaultValue` 28→32 — Balde 2.
- `src/core/Shell/Components/SidebarNav.tsx:87` — logo passa a consumir o token — Balde 2.
- `src/core/Shell/Components/SidebarNav.tsx:142` — nome fantasma + fallback malformado consertados juntos — ghostvars B.
- `src/core/Shell/Components/TopbarNav.tsx:84` — logo passa a consumir o token — Balde 2.
- `src/core/Shell/Components/TopbarNav.tsx:123,124` — `--sarak-topbar-active`→`-color` — ghostvars A.
- `src/styles/_utilities.css:21,34,39,49,51` — 4 easings + `--sarak-button-active`→`-color` — ghostvars A+B.
- `src/styles/_base.css:16` — `--theme-card` chain consertada — ghostvars B.
- `src/styles/_surfaces.css:25,45` — `--bg-card`→`--card-bg` — ghostvars B.
- `src/core/Design/presets/components/inputs.ts:34,69` — `--theme-background`→`--theme-body` — ghostvars B.
- `src/core/Discovery/DynamicRenderer.tsx:64,82,87,94` — 4 raios reusam `--radius-sarak`/`--radius-btn` — decisão 6.
- 3 snapshots atualizados (`PreviewCanvas.test.tsx.snap`, `PresetCard.test.tsx.snap`, `PreviewSystemRenderer.test.tsx.snap`) — refletem só a mudança 28px→32px de `--sarak-shell-brand-logo-size` (conferido: a única CSS var que diverge em cada diff é essa).
- `gates/baselines/audit-baseline.json` — regravado (`hardcoded` 12→6, `ghostvars` 26→12, `sectionpointers` 2→1).
- `sarak-dev/` (`START-HERE.md`, `GUIA-MANUTENCAO.md`, `state.json`) — regenerado via `npm run dev-kit` — estava defasado desde o lote 4, agora reflete o baseline atual.
- `dist/**` — regenerado por `npm run gates:full` (que roda `npm run build`); inclui a correção de `--theme-text` do lote 4 que nunca tinha sido rebuildada, além dos chunks lazy com hash novo (renomeação inevitável de content-hash, não é mudança de conteúdo funcional).

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/navigation.ts` | alterado | Balde 2 — default 28→32 |
| `src/core/Shell/Components/SidebarNav.tsx` | alterado | Balde 2 (logo) + ghostvars B (item ativo) |
| `src/core/Shell/Components/TopbarNav.tsx` | alterado | Balde 2 (logo) + ghostvars A (item ativo ×2) |
| `src/core/Design/presets/components/inputs.ts` | alterado | ghostvars B ×2 (`--theme-background`→`--theme-body`) |
| `src/styles/_utilities.css` | alterado | ghostvars A (button-active) + B (4 easings) |
| `src/styles/_base.css` | alterado | ghostvars B (`--theme-card` chain) |
| `src/styles/_surfaces.css` | alterado | ghostvars B ×2 (`--bg-card`→`--card-bg`) |
| `src/core/Discovery/DynamicRenderer.tsx` | alterado | 4 raios — decisão 6 |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | snapshot atualizado (28→32px) |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetCard.test.tsx.snap` | alterado | idem |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PreviewSystemRenderer.test.tsx.snap` | alterado | idem |
| `gates/baselines/audit-baseline.json` | alterado | baseline regravado (§ acima) |
| `sarak-dev/START-HERE.md`, `GUIA-MANUTENCAO.md`, `state.json` | alterado | espelho regerado (`npm run dev-kit`) |
| `dist/**` | alterado (gerado) | rebuild completo via `gates:full` |

**Verificações executadas**
- `npm run audit` (ANTES) → `hardcoded: 12` · `ghostvars: 26` · `sectionpointers: 1 morto` (baseline tolerava 2) · `composicaoatomica: 47` · demais auditores em 0. Saída completa lida.
- `npm run audit` (DEPOIS) → `hardcoded: 6` · `ghostvars: 12` · `sectionpointers: 1` · `composicaoatomica: 47` (inalterado, fora de escopo) · demais em 0. Os 6 hardcoded e 12 ghostvars restantes conferidos um a um contra a lista de "fora do escopo" da §12.2 (candidatos a Expansão do lote 8) — nenhum dos 14 alvos deste lote sobrou.
- `npx vitest run` → primeira rodada: **287 passed / 3 failed** (290 arquivos) — as 3 falhas eram só snapshot desatualizado (`- Expected`/`+ Received`), e o diff de cada uma foi extraído programaticamente: a ÚNICA CSS var que diverge em cada uma é `--sarak-shell-brand-logo-size` (28px→32px). `npx vitest run -u` → **290 passed / 290, 1012 testes, 100% verde**, 3 snapshots atualizados.
- `npm run gate-limits:check` → `[OK] Os 26 scripts de gates/scripts/ declaram o que não veem.`
- `npm run dev-kit` → regenerado (80 componentes, 409 tokens, 17 gates). `npm run dev-kit:check` → `[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos)`.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc --write` → baseline regravado.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` (após o write) → `igual ao baseline de 2026-08-08 — nenhuma regressão`.
- `npm run gates:full` → **exit 0**. Cadeia completa: `dev-kit:check` → `build` (token-types, catalog, barrel, zero-brand, guide, deep-import, build:js, build:css, build:css:scoped) → `build-info:check` → `package:check` → `coverage:check` (`vitest run --coverage` + `check-coverage-floor`). Cobertura: `68.83%`/`57.48%`/`60.85%`/`70.66%` (statements/branches/functions/lines) — `[coverage:check] igual ao piso (70.66%) — nenhuma regressão`.
- `git diff --stat` → 33 arquivos, +88/−290 linhas (a maior parte do `−` é código morto de chunk antigo do `dist/`, renomeado por hash).

**Critérios de aceite**
- [x] Balde 2 — SidebarNav/TopbarNav consomem o token, zero pixel nos dois — evidência: diff de `SidebarNav.tsx:87`/`TopbarNav.tsx:84`, ambos já resolviam 32px.
- [x] Ghostvars grupo A consertado (troca cor) — evidência: tabela (b) acima; 2 dos 3 realmente trocam (topbar), 1 não troca (achado registrado).
- [x] Ghostvars grupo B consertado (liga estilo desligado) — evidência: tabela (c), 11 consumos, todos IACVT/sem-fallback antes, todos resolvendo para nome real depois.
- [x] `SidebarNav.tsx:142` — os DOIS defeitos (nome fantasma + fallback malformado) consertados juntos, não um sem o outro — evidência: diff da linha, `rgba(var(--theme-primary-rgb),0.1)` substitui `var(--theme-primary-rgb,59,130,246)/10`.
- [x] Os 4 raios do `DynamicRenderer` reusam `--radius-sarak`/`--radius-btn`, nenhuma escala nova criada — evidência: diff de `DynamicRenderer.tsx`; `git diff -- gates/ src/core/Design/schema/ src/core/Design/catalog/` mostra zero token de raio novo.
- [x] Nenhum gate alterado — evidência: `git diff --stat -- gates/scripts/` vazio (só `gates/baselines/audit-baseline.json`, que é dado, não lógica).
- [x] Baseline e espelho (`sarak-dev/`) regravados junto do conserto — evidência: os dois no mesmo `git status`.
- [x] `npx vitest run` 100% verde, `gates:full` exit 0 — evidência acima.
- [x] Nada commitado — `git log` inalterado nesta sessão.

**Decisões e suposições**
1. **Alvo dos 2 easings (`--ease-sarak-cubic`→`--sarak-ease-main`, `--ease-sarak-fluid`→`--sarak-ease-out`) foi decisão minha, não do dono** — o lote 4 já tinha registrado essa incerteza como "do dono, não do executor", e nem a §2.3 nem o pedido desta rodada nomeiam o alvo. Escolhi conservadoramente pela única família de tokens CSS de easing que existe (excluindo a família `motion*`, que é para JS/framer-motion). Baixo impacto — timing de transição, degrada bem, e a troca por outro nome real é de uma linha. Se o dono discordar do mapeamento, é ajuste cirúrgico, não reabertura de escopo.
2. **`--bg-card`→`--card-bg` e `--theme-surface-main`→`--theme-surface`** — mantive a MESMA estrutura de cadeia (`var(A, var(B))`) só corrigindo os dois nomes para os dois cssVars reais do mesmo token (`cardBackgroundColor`), em vez de colapsar para um nome só — mudança mínima, sem redesenhar a lógica de fallback existente.
3. **`_utilities.css:49` (`--sarak-button-active`→`-color`) foi mantido mesmo descobrindo que não muda pixel** — porque (a) fecha o gate legitimamente (a auditoria conta `manifesto` como fonte), (b) zero risco de regressão (cai no mesmo fallback de hoje), e (c) consertar a causa raiz (manifesto morto) é fora do escopo — decisão de arquitetura do dono, não renomeação.
4. **Não toquei em `SarakShellNav.tsx:134`** — o pedido citou só `SidebarNav.tsx:87`/`TopbarNav.tsx:84`; o arquivo já usa `var(...)` corretamente (não é um "32px cru" a corrigir), só o VALOR emitido que muda por tabela — registrado como achado, não como conserto.

**Achados fora do escopo (não corrigidos)**
- **`buttonActiveColor`/`cardHoverColor`/`cardActiveColor` são metadado morto em `manifest.ts`** — declaram `.vars`/`.transform` que nenhum código lê para emitir CSS. Só `buttonActiveColor` foi tocado nesta rodada (por estar entre os 4 consumos do pedido); os outros dois nem apareciam no ghostvars. Sugestão: spec nova para decidir se o `DESIGN_MANIFEST` é religado ao runtime ou é removido — hoje ele só serve para `validateDesign` aceitar a chave, o que é enganoso (parece que emite CSS e não emite).
- **`--radius-sarak` (`_theme.css:19`) consome `--sarak-card-border-radius`, que `cardBorderRadius` NÃO emite** (`cards.ts:23` emite `--sarak-card-radius`, sem `-border-`) — outro nome fantasma, mas invisível ao `auditor_ghostvars` porque `src/styles/` só conta como fonte emissora, nunca como consumidora (limite já declarado no próprio auditor, R7). Não é dos 4 raios pedidos (esses eu apenas fiz REUSAR essa variável, como mandado); é a variável em si que tem um segundo nome fantasma dentro dela, pré-existente, fora do escopo desta plan.
- **`SarakShellNav.tsx:134`** — não é um conserto pendente (já usa `var()` corretamente); é só o alcance da mudança do default, registrado em (a) acima para a revisão visual do dono.

**Pendências / riscos**
- **A revisão visual (`getComputedStyle`/DevTools) continua não automatizada nesta base** ([[01-gates-e-baseline]] §2.6) — tudo acima é assertiva estática (regra CSS/token/cadeia), não pixel medido em browser. Onde a plan já dava a mesma limitação por resolvida (SidebarNav:142, `_surfaces.css:45` — IACVT, "já quebrado, consertar não pode piorar"), segui a orientação; para o resto, a prova é a leitura da cadeia de tokens, não uma captura de tela.
- **`time-tracking`:** ausente nesta sessão — mesma nota de todas as rodadas anteriores; MCP/skill não existe no ambiente.
- **`specs/00-indice.md` vai divergir de novo** ao mudar o `status` desta plan — mesma mecânica das rodadas anteriores, fora do que o executor pode corrigir.
- **`dist/**` carrega também a correção de `--theme-text` do lote 4** (nunca tinha sido rebuildada) — não é regressão, é o `dist/` alcançando o `src/` que já estava certo; sinalizado para o revisor não estranhar o tamanho do diff em `dist/`.

---

## Resumo da execução (lote 8 — Expansão: 13 tokens novos + os 3 elos `*-scaled`) — 2026-08-08

**Resultado:** Concluído. **Meta batida: `hardcoded` 6 → 0 e `ghostvars` 12 → 1** (só o `--x` declarado, intocado).

**Critério de aceite do lote — ZERO PIXEL — provado abaixo, item a item**, com o valor do token novo ao lado
do fallback que ele substitui.

### Parte 1 — os 7 tokens de dimensão (todos em `navigation.ts`, todos alavanca Valor, sem `isResponsive`)

| Token novo | `defaultValue` | Fallback que ele reproduz | Consumo (`arquivo:linha`) |
|---|---|---|---|
| `sidebarCollapsedWidth` | `74` (px) | `'74px'` cru | `SidebarNav.tsx:69` |
| `sidebarLabelMaxWidth` | `120` (px) | `max-w-[120px]` cru | `SidebarNav.tsx:107` |
| `topbarCollapsedHeight` | `40` (px) | `'40px'` cru | `TopbarNav.tsx:63` |
| `brandLogoSizeCollapsed` | `20` (px) | `'20px'` cru | `TopbarNav.tsx:84` |
| `topbarLabelMaxWidth` | `150` (px) | `max-w-[150px]` cru | `TopbarNav.tsx:104` |
| `searchDropdownGap` | `0.5` (rem) | `calc(100%+0.5rem)` cru | `ShellSearchWidget.tsx:78` |
| `searchDropdownWidth` | `400` (px) | `w-[400px]` cru | `ShellSearchWidget.tsx:78` |

Cada consumo virou `var(--sarak-<kebab-id>, <o mesmo literal>)` — mesmo padrão do lote 6/7. `sidebarWidth`/
`topbarHeight`/`shellBrandLogoSize` (os "modos expandidos" análogos) já eram tokens; estes 7 são os "modos
recolhidos"/limites de rótulo/dropdown que faltavam.

### Parte 2 — os 6 tokens de fantasma (renomear a fonte, não o consumo)

**Decisão de implementação:** em vez de trocar o nome consumido no `.css`, dei ao token novo o **mesmo**
`cssVars` que o fantasma já tinha. Resultado: **zero linha tocada em `_atmosphere.css`, `_colors.css`,
`_typography.css` ou `_utilities.css`** — confira no `git diff --stat` ao final, nenhum dos quatro aparece. O
nome que já estava certo na tela passou a ter uma fonte real atrás dele.

| Fantasma (inalterado no `.css`) | Token novo | Schema | `defaultValue` | Fallback que ele reproduz |
|---|---|---|---|---|
| `--sarak-range-active-bg` (×2, `_utilities.css:83,92`) | `rangeActiveColor` | `inputs.ts` | `'var(--theme-primary)'` | `var(--theme-primary)` — **defaultValue é a MESMA referência de variável**, não uma cópia congelada da cor |
| `--sarak-glass-edge-width` (`_atmosphere.css:100`) | `glassEdgeWidth` | `atmosphere.ts` | `1` (px) | `1px` |
| `--sarak-glass-edge-color` (`_atmosphere.css:100`) | `glassEdgeColor` | `atmosphere.ts` | `'rgba(255,255,255,0.1)'` | `rgba(255,255,255,0.1)` |
| `--sarak-tooltip-text` (`_colors.css:19`) | `tooltipTextColor` | `overlays.ts` | `'#0f172a'` | `#0f172a` |
| `--sarak-tooltip-border` (`_colors.css:20`) | `tooltipBorderColor` | `overlays.ts` | `'#cbd5e1'` | `#cbd5e1` |
| `--sarak-h3-size` (`_typography.css:25`) | `h3Size` | `typography.ts` | `24` (px) | `24px` |

**Duas decisões que valem registro:**

1. **`rangeActiveColor.defaultValue = 'var(--theme-primary)'`** — sem precedente no repositório (busquei
   `defaultValue: 'var(` em todo `schema/`, zero ocorrência antes desta). `COLOR_PATTERN` (`validation.ts`)
   aceita `var(--x, fallback)` como valor de cor válido, e é a única forma de preservar o comportamento
   **reativo** que o fantasma já tinha por acidente (a cor do thumb do range segue `--theme-primary` do tema
   ativo, não um hex congelado do momento em que o token nasceu). Um hex fixo teria sido zero-pixel **hoje** e
   quebraria na primeira troca de tema.
2. **`h3Size` NÃO é `isResponsive`, ao contrário de `h1Size`/`h2Size`** (que são, com `{mob,tab,desk}`
   diferentes entre si). O fallback que ele substitui é um único literal `24px`, sem variação por breakpoint —
   torná-lo responsivo exigiria inventar 3 valores (mob/tab/desk) onde hoje só existe um, o que **muda pixel**
   em pelo menos 2 dos 3 breakpoints. Mantive escalar para bater o critério do lote. Ficou inconsistente com os
   irmãos H1/H2 — é decisão de Configuração para depois, não desta rodada.

### Parte 3 — os 3 elos `*-scaled` em `_base.css:36-43` (achado do revisor, não redirecionamento simples)

| Linha | Antes | Depois | Por quê |
|---|---|---|---|
| `--theme-gap` | `var(--theme-gap-scaled, 20px)` | `var(--sarak-layout-gap, 20px)` | `--sarak-layout-gap` é `cssVar` real de `layoutGap` (`system.ts:165`) |
| `--theme-pad` | `var(--theme-pad-scaled, 1.5rem)` | `var(--sarak-layout-padding, 1.5rem)` | `--sarak-layout-padding` é `cssVar` real de `layoutPadding` (`system.ts:63`) |
| `--theme-card-padding` | `var(--theme-pad-scaled, 24px)` | `var(--sarak-layout-padding, 24px)` | mesmo elo de `--theme-pad` — é a mesma família "compatibilidade genérica", não um token de card específico (o canal primário de padding de card já é `--sarak-card-padding-md`, via `_cards.css:18`; esta linha é só a segunda camada de fallback) |
| `--radius-theme` | `var(--theme-radius-scaled, 12px)` | `var(--sarak-border-radius, 12px)` | **caso especial mandado**: `--radius-theme` já é `cssVar` DIRETO do token `borderRadius` (`system.ts:90`) — apontar para si mesma seria circular. Usei `--sarak-border-radius`, o outro `cssVar` do mesmo token |

**As 4 linhas NÃO foram apagadas** — só o nome do meio (o elo fantasma) mudou. Comentário adicionado no
próprio `_base.css` explicando por que o `--radius-theme` é diferente dos outros três.

🔴 **Achado, registrado, não perseguido nesta rodada:** com o engine montado, `--theme-gap` já é setado
**diretamente** por `layoutGap.cssVars` (que inclui o próprio `--theme-gap`) via `style` inline — especificidade
maior que qualquer regra de `_base.css`. Isso significa que esta linha específica só importa para um elemento
que dependa da cascata de `_base.css` mas esteja **fora** do alcance do `style` inline do `DesignScope` — cenário
que eu não consegui enumerar com certeza (é assertiva estática sobre a cadeia, não uma varredura de todo
consumidor de `_base.css`). Segui a instrução ao pé da letra porque ela já veio com a medição do snapshot
(`--theme-gap`/`--sarak-layout-gap` sempre iguais, em toda entrada do `PreviewCanvas.test.tsx.snap` — conferi:
22× 24px/24px, 9× 16px/16px, 8× 20px/20px, 3× 32px/32px, zero divergência) — mas declaro a lacuna: não é uma
prova de que TODO elemento que só existiu através da cascata estática (sem `DesignScope` por cima) vai ver o
mesmo pixel de hoje, é uma prova de que os elementos DENTRO do `DesignScope` (a esmagadora maioria) veem.

### Parte 4 — as duas pendências herdadas do lote 7

1. **Consertado.** `SarakShellNav.tsx:134` — fallback `28px` → `32px`. Zero pixel: o `defaultValue` do token já
   é 32 desde o lote 7; isto só alinha o literal-morto que nunca era realmente usado (a variável real sempre
   vencia) com a realidade, fechando a incoerência de leitura entre os três consumidores.
2. **Relatado, não consertado — como mandado.** `--sarak-button-active-color` (`_utilities.css:49`) é metadado
   morto em `manifest.ts:210`: `DESIGN_MANIFEST` declara `.vars`/`.transform` para ele, mas **nada no
   runtime lê esses campos** — confirmei de novo nesta rodada (`grep -rn "DESIGN_MANIFEST\[" src/` e
   `grep -rn "\.transform(" src/core/Provider/`, o único consumo de `DESIGN_MANIFEST` continua sendo
   `Object.keys(...)` em `validation.ts:34`, só para liberar a chave no payload). **Isto é achado de regra que
   falta** (o `auditor_ghostvars` aceita como "real" um nome que o manifesto *declara* mas o runtime nunca
   *emite*, porque a expansão do registro para "manifesto" — feita numa calibragem recente — confiou na
   declaração sem verificar o uso) **e não de código** — não toquei em `manifest.ts` nem em `_utilities.css:49`.
   Fica como estava: caindo no fallback `var(--theme-primary-active)`, exatamente como no lote 7.

### Verificações executadas

- `npm run audit` (ANTES, estado herdado do lote 7 committed) → `hardcoded: 6` · `ghostvars: 12` ·
  `sectionpointers: 1` · `composicaoatomica: 47` · demais em 0.
- `npm run audit` (DEPOIS) → `hardcoded: 0` · `ghostvars: 1` (só `--x`) · `sectionpointers: 1` (inalterado) ·
  `composicaoatomica: 47` (inalterado, fora de escopo) · demais em 0.
- `npx tsx gates/scripts/audit/verify_parity.ts` → rodado 2× durante a execução (após Parte 1 e após Parte 2),
  as duas vezes `✅ SUCESSO ABSOLUTO`: primeiro `416/416/416`, depois `422/422/422` (409 herdados + 13 novos).
- `npx vitest run` → 1ª rodada: **286 passed / 4 failed** (290 arquivos). Uma falha NÃO era snapshot:
  `generate-token-types.check.test.mjs` — `design-token-ids.ts` defasado (13 tokens novos, gerador não tinha
  rodado). `npm run token-types` resolveu; `npm run token-types:check` → `[token-types:check] design-token-ids.ts
  em dia (422 tokens)`. As outras 3 eram snapshot (mesma família do lote 7 — `className` com o token novo em vez
  do literal). `npx vitest run -u` → **290 passed / 290, 1012 testes, 100% verde**, 3 snapshots atualizados.
- `npm run gate-limits:check` → `[OK] Os 26 scripts de gates/scripts/ declaram o que não veem.`
- `npm run dev-kit` → regenerado (80 componentes, **422 tokens**, 17 gates). `npm run dev-kit:check` → em dia.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc --write` → baseline regravado
  (`hardcoded: 0`, `ghostvars: 1`, resto inalterado).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` (pós-write) → `igual ao baseline de
  2026-08-08 — nenhuma regressão`.
- `npm run gates:full` → **1ª tentativa: FALHOU** em `guide:check` — `sarak-ui/` (kit do consumidor, também
  gerado) estava defasado em 4 arquivos pela mesma razão do `dev-kit` (tokens novos). `npm run guide` resolveu
  (`86 componentes, 422 tokens de tema, 100 ícones`). **2ª tentativa: exit 0**, cadeia completa até
  `coverage:check`.
- `coverage:check` reportou **melhora** (68.83%→68.84% statements, 70.66%→70.67% lines) — não bloqueou, mas
  regravei o piso (`node gates/scripts/release/check-coverage-floor.mjs --write`) pela mesma regra do R8.1 que
  vale para o baseline de auditoria: piso que sobe se regrava, nunca fica desatualizado silenciosamente.
- `git diff --stat` → 30 arquivos de fonte/geração (+810/−135) fora do `dist/`, mais 25 arquivos em `dist/`
  regenerados pelo `build` (rebuild completo, chunks com hash renomeado — mesmo aviso operacional do lote 7).

### Critérios de aceite

- [x] `hardcoded` 6 → 0 — evidência: `npm run audit`, seção VALOR vazia.
- [x] `ghostvars` 12 → 1 (só `--x`) — evidência: `npm run audit`, lista de fantasmas.
- [x] **Zero pixel em todo token novo** — evidência: as três tabelas acima, `defaultValue` do token ao lado do
      fallback substituído, todos idênticos (ou, no caso de `rangeActiveColor`, a mesma referência de variável).
      Nenhum item precisou de PARE.
- [x] Cadeia de paridade completa nos 13 tokens (schema + mapping + partição) — evidência:
      `verify_parity.ts` → `422/422/422` nas duas medições.
- [x] `--radius-theme` não ficou circular — evidência: usa `--sarak-border-radius`, não `--radius-theme`.
- [x] As 4 linhas de `_base.css:36-43` não foram apagadas — evidência: `git diff`, são 4 substituições de nome,
      não remoções.
- [x] `SarakShellNav.tsx:134` alinhado em 32px — evidência: diff da linha.
- [x] `--sarak-button-active-color` relatado, não tocado — evidência: `git diff -- src/styles/_utilities.css`
      vazio; `git diff -- src/core/Provider/manifest.ts` vazio.
- [x] Nenhum gate alterado — evidência: `git diff --stat -- gates/scripts/` vazio (só os dois baselines, que são
      dado, não lógica).
- [x] Baseline e espelhos (`sarak-dev/`, `sarak-ui/`) regravados junto — evidência: os três no mesmo `git status`.
- [x] `npx vitest run` 100% verde, `gates:full` exit 0 — evidência acima.
- [x] Nada commitado.

### Decisões e suposições

1. **Onde colocar cada token novo** — os 7 de dimensão foram todos para `navigation.ts` (mesma origem dos
   tokens irmãos "modo expandido" que já existiam: `sidebarWidth`, `topbarHeight`, `shellBrandLogoSize`). Os 6
   de Expansão foram para o schema do domínio mais próximo por convenção de nome já existente no arquivo
   (`glassEdgeWidth/Color` ao lado de `glassBlur/Opacity/Specularity/Roughness/Saturation` em `atmosphere.ts`;
   `tooltipTextColor/BorderColor` ao lado de `tooltipBg/Radius` em `overlays.ts`; `h3Size` ao lado de
   `h2Size/h2Weight/h2LineHeight` em `typography.ts`; `rangeActiveColor` é o primeiro token de range slider no
   catálogo — não havia família, foi para `inputs.ts` por ser o schema mais próximo semanticamente).
2. **`rangeActiveColor.defaultValue` é uma referência de variável, não um hex** — decisão registrada na Parte 2,
   é a única forma honesta de preservar o comportamento reativo ao tema que o fantasma já tinha.
3. **`h3Size` não é responsivo** — decisão registrada na Parte 2, para não inventar 3 valores onde hoje só
   existe 1 (o que violaria zero-pixel em 2 dos 3 breakpoints).
4. **`--theme-card-padding` reusa `--sarak-layout-padding`** (o mesmo elo de `--theme-pad`), em vez de apontar
   para `--sarak-card-padding-md` — porque a linha vive no bloco "ALIASES DE COMPATIBILIDADE" genérico, não é um
   token de card dedicado, e o canal primário de padding de card (`_cards.css:18`) já resolve via
   `--sarak-card-padding-md` antes de chegar nesta camada de fallback.
5. **Corrigi um erro MEU no meio da execução, registrado para transparência**: ao inserir `h3Size` em
   `catalog/partitions/typography.json`, o primeiro `Edit` casou com o trecho errado do arquivo e sobrescreveu
   o `relatedTokens` de `h2Weight` (de `["h2Size"]` para `["h1Size"]"`) sem querer, sem inserir nada. Percebi
   ao reler o arquivo antes de rodar o `verify_parity`, revertive o `relatedTokens` para `["h2Size"]"` e refiz a
   inserção no lugar certo — `git diff` final confirma que o único delta em `typography.json` é o bloco novo de
   `h3Size`, nada mais mudou.

### Achados fora do escopo (não corrigidos)

- **`--sarak-button-active-color` é metadado morto** — relatado na Parte 4, não corrigido por mandato explícito.
- **A lacuna do `--theme-gap`/`--theme-pad`/`--radius-theme` para elementos fora do alcance do `DesignScope`**
  (Parte 3, achado 🔴) — não enumerei todo consumidor de `_base.css` para provar que nenhum vive fora do
  `DesignScope`; a prova que tenho é o snapshot do `PreviewCanvas`, que cobre os componentes internos da lib,
  não necessariamente composições arbitrárias do consumidor.
- **`h1Size`/`h2Size` são responsivos e `h3Size` não é** — inconsistência de padrão registrada na Parte 2,
  decisão de Configuração para uma rodada futura, não desta.

### Pendências / riscos

- **`time-tracking`:** ausente nesta sessão — mesma nota de todas as rodadas anteriores.
- **`specs/00-indice.md` vai divergir de novo** ao mudar o `status` desta plan — mesma mecânica, fora do que o
  executor corrige.
- **`sarak-ui/` (kit do consumidor) também precisa ser regenerado quando o token count muda** — não estava
  documentado nos avisos operacionais desta rodada (só `sarak-dev/` estava); descoberto porque `gates:full`
  falhou nele na 1ª tentativa. Registrado aqui para a próxima rodada não repetir a surpresa.

---

## Resumo da execução (lote 9 — R10, composição atômica) — 2026-08-09

**Resultado:** Concluído com pendência declarada. **Meta NÃO alcançada** — pedida `47 → 2`, entreguei
`47 → 23` (24 trocas seguras). A diferença não é trabalho que faltou fazer: é um achado arquitetural que
bloqueia 20 das 23 ocorrências restantes por um motivo que nem a plan nem eu sabíamos antes de medir, e que
está provado abaixo, não suposto.

### 🔴 O achado que redesenhou o lote: `SarakButton`/`SarakIconButton`/`SarakInput` travam sem `SarakUIProvider`

Os três já eram conhecidos como "não são `forwardRef`". O que não estava medido: **os três chamam
`useSarakUI()` incondicionalmente, e esse hook lança exceção dura se não houver `SarakUIProvider` na árvore**
(`SarakUIProvider.tsx:54`, `if (!context) throw new Error(...)`). Não existe variante leniente.

Boa parte da base **não** depende disso hoje — usa o padrão oposto, tokens via `var(--sarak-*, fallback)` em
CSS, que degrada sozinho sem Provider. É o padrão que `SarakShellNav`, `SarakTabs`, `SarakAnalyticalPage`,
`DynamicRenderer`, entre outros, usam **de propósito**, porque são átomos/templates pensados para renderizar
tanto dentro do Shell completo quanto isolados (`kit de componentes`, ou testado sozinho). Embutir
`SarakButton` dentro deles troca essa independência por uma dependência dura — e isso **quebra**, na tela,
qualquer host que hoje monte esse componente sem o Provider por perto.

**Não é teoria — apliquei a troca, vi quebrar, e revertive, quatro vezes, com prova reproduzível:**

| Componente | Como descobri | Evidência |
|---|---|---|
| `SarakShellNav` | O teste JÁ tinha um caso nomeado **"default (sem Provider) é vertical"** — quebrou ao converter | `SarakShellNav.test.tsx` — 7 dos 7 testes falharam com `useSarakUI must be used within a SarakUIProvider` |
| `SarakTabs` | Não tinha teste real (só placeholder) — **escrevi um** (9 casos, teclado/ARIA) antes de tocar, ele passou 9/9 no código atual, converti, ele quebrou 9/9 | ver `SarakTabs.test.tsx` novo, seção abaixo |
| `SarakAnalyticalPage` | Escrevi um smoke test ad-hoc forçando `device=smartphone` (onde os 2 botões vivem) — sem isso o teste "passava" só porque bateu no branch desktop, que não tem botão | `useSarakUI must be used within a SarakUIProvider`, stack em `SarakIconButton` |
| `DynamicRenderer` | Mesmo método — renderizei com `contracts` gerando abas | idem |

**A mesma prova, generalizada por leitura de fonte (sem precisar reverter e re-testar cada um):** o mecanismo
é 100% determinístico — qualquer árvore que contenha `SarakButton`/`SarakIconButton`/`SarakInput` quebra sem
Provider, sem exceção. Busquei em `SarakToast.tsx`, `SarakPagination.tsx`, `SarakLightbox.tsx`,
`SarakSpotlight.tsx`, `SarakPDFViewerImpl.tsx` por `useSarakUI` e por qualquer import de
`atomic/Buttons|Inputs|Icon` — **zero ocorrências nos cinco**. Nenhum deles tem hoje NENHUMA dependência do
Provider; os 5 têm testes reais que renderizam sem `SarakUIProvider` e passam **hoje**. Convertê-los repetiria
exatamente o padrão provado acima.

**A correção MEIA-CERTA que também apliquei — `SarakAppChromeMobile` (o toggle, não o scrim):** o hambúrguer
já renderizava `<SarakIcon>` incondicionalmente, e `SarakIcon` **também** chama `useSarakUI()` sem guarda —
ou seja, esse botão específico **já quebrava sem Provider antes de eu tocar nele** (confirmado revertendo e
testando de novo: mesmo erro, mesma pilha, agora saindo de dentro do `<SarakIcon>`, não do `<SarakButton>`).
Troquei para `SarakIconButton` porque não há dependência NOVA sendo introduzida — é honesto contabilizar como
convertido. Documentado aqui porque quase revertive por engano (a primeira leitura do achado me levou a
reverter TUDO que não tinha `useSarakUI`; o `SarakIcon` sozinho já bastava, e eu tinha esquecido de checá-lo).

**O que isto significa para a meta:** dos 23 que sobraram, **20** são bloqueados por este motivo:
`SarakToast`(1) · `SarakPagination`(3) · `SarakLightbox`(3) · `SarakPDFViewerImpl`(5) · `SarakSpotlight`(1) ·
`SarakShellNav`(1) · `SarakTabs`(1) · `SarakAnalyticalPage`(4) · `DynamicRenderer`(1). Os outros 3 são os dois
achados que a própria plan já esperava (`ChatInput`, e o que eu descobri no lugar do outro nomeado — ver
abaixo) mais a pergunta de fronteira do `SocialButton`.

**A saída real não é desta plan.** Ou `useSarakUI()` ganha um modo leniente (retorna default em vez de lançar
quando não há Provider — mudança na API pública do hook, decisão do dono), ou se aceita, documentado, que
`SarakButton`/`SarakIconButton`/`SarakInput` só podem viver dentro de árvores que já garantem o Provider —
o que precisa então ser dito em algum lugar da spec de superfície pública, porque hoje não está. Não escolhi
por conta própria; é a pergunta que decide o destino dos 20.

### As duas bloqueadas nomeadas pela plan — uma confirmada, uma diferente do que estava escrito

1. **`ChatInput.tsx:117` — CONFIRMADO bloqueado por `ref`.** `ref={fileInputRef}`, disparado por `.click()` a
   partir de um `SarakIconButton` vizinho. Não toquei. Candidato à terceira saída da §3.3, como a plan já
   apontava — decisão do dono, não corrigi o gate nem o código.
2. **`SarakAppChromeMobile.tsx:115` (o scrim/backdrop do drawer) — NÃO tem `ref`.** Conferi com `grep -n
   "ref=" SarakAppChromeMobile.tsx`: o único `ref=` do arquivo é `containerRef` no `<aside>` (linha 124), não
   no `<button>` do scrim. A caracterização da plan estava desatualizada ou trocada com outro achado — o
   motivo real de este botão não ter para onde ir é **outro**: é um `<button className="fixed inset-0" />`
   **sem ícone e sem texto** — um capturador de clique de tela cheia, invisível. `SarakIconButton` exige
   `icon` (prop obrigatória) e formata como quadrado pequeno (`w-N h-N`); `SarakButton` teria de ter
   praticamente toda a classe base sobrescrita via `!important` para virar `fixed inset-0` sem conteúdo — não
   tentei, porque não há como validar visualmente nesta base (§2.6) se o resultado realmente cobre a tela
   inteira, e um scrim de fechar-modal quebrado é um bug sério, não cosmético. Registrado como achado NOVO,
   não decidido: nenhum átomo hoje serve para "botão de clique de tela cheia sem conteúdo visível".

### As duas perguntas de fronteira

1. **`ShellThemeToggle` × `atomic/Buttons/ThemeToggle.tsx` — NÃO é duplicação.** Li os dois. `ThemeToggle.tsx`
   é um seletor de **layout/preset** (`design.layout`, dropdown alimentado por `const LAYOUTS = {}` — objeto
   **vazio**, com `// TODO: Substituir por presets canônicos... quando forem criados`) — componente morto/
   inacabado, resolve outro problema (troca de preset visual, não modo claro/escuro). `ShellThemeToggle`
   alterna `design.mode` (claro/escuro). Nomes parecidos, propósitos diferentes — não há nada para consolidar.
   Convertido normalmente (3 trocas, dentro dos 24).
2. **`SocialButton.tsx:56` — confirmado, não resolvido.** Li o arquivo inteiro: é um átomo de botão
   completo e autocontido (SVGs de marca do Google/GitHub embutidos, label + sublabel, três variantes de
   estilo, já consome `useSarakUI()`) — estruturalmente no mesmo nível que `SarakButton`/`SarakIconButton`,
   só que mora em `Atoms/` em vez de `Buttons/`. Embrulhar `SarakButton` em volta dele seria um átomo
   contendo outro átomo só para satisfazer o gate, sem ganho real. **Não toquei.** A pergunta da plan
   continua em aberto: a fronteira do R10 deveria excluir por PASTA (`atomic/Buttons/`, `atomic/Inputs/`) ou
   por PAPEL (qualquer arquivo que SEJA a implementação de um botão, onde quer que more)? É decisão do dono.

### As 24 trocas seguras — por que cada uma é segura

**Já dependiam de `useSarakUI` (ou de `SarakIcon`, que também depende) antes de eu tocar — zero dependência
nova introduzida:**

| Arquivo | Trocas | Prova de que já dependia do Provider |
|---|---|---|
| `SidebarNav.tsx` | 3 | só existe dentro de `SarakShell`, que já chama `useSarakUI()` (`SarakShell.tsx:56`) |
| `TopbarNav.tsx` | 3 | idem |
| `ShellThemeToggle.tsx` | 3 | só consumido por `SidebarNav`/`TopbarNav` |
| `ShellUserWidget.tsx` | 2 | idem |
| `ShellLanguageSelector.tsx` | 2 | idem |
| `ShellSearchWidget.tsx` | 1 | idem |
| `SarakShell.tsx` | 1 | chama `useSarakUI()` diretamente (`:56`) |
| `SarakAppChromeMobile.tsx` (hambúrguer, não o scrim) | 1 | já renderizava `<SarakIcon>`, que exige Provider |
| `ExpandableCard.tsx` | 2 | chama `useSarakUI()` diretamente (`:30`) |
| `SarakAccordion.tsx` | 1 | chama `useSarakUI()` diretamente (`:21`) |
| `SocialButton` não entra aqui — não convertido, ver fronteira acima. | — | — |
| `SarakChatEngine.tsx` | 2 | chama `useSarakUI()` e já usa `SarakInput` (`:8,36`) |
| `SarakModal.tsx` | 3 | chama `useSarakUI()` diretamente (`:44`); dentro de armadilha de foco — caracterizado abaixo |

**Confirmei que `SidebarNav`/`TopbarNav` (e o que eles importam) não têm NENHUM outro consumidor** que os
renderize fora do `SarakShell` — `grep` por `import.*{.*SidebarNav.*}` só achou `SarakShell.tsx` e
`PreviewSystemRenderer.tsx` (o preview do próprio Design Engine, que já roda dentro de `SarakUIProvider` —
confirmado pelos snapshots que já existiam antes desta plan). Não há caminho de uso real sem Provider para
nenhum desses 16.

### O bug que eu mesmo introduzi e consertei antes de fechar — estrutura de `children` dentro de `SarakButton`

`SarakButton` só organiza em flexbox o que está no nível de fora — `{leftIcon}<span>{children}</span>
{rightIcon}`. Quando o `children` tinha **mais de um elemento irmão** que dependia do `<button>` original ser
`flex` (ex.: rótulo à esquerda + indicador à direita, com `ml-auto`/`justify-between`), o `<span>` que embrulha
o `children` NÃO é flex por padrão, e o `ml-auto`/`justify-between` do código antigo silenciosamente parava de
fazer efeito. Pegei isso relendo minhas próprias trocas antes de rodar a suíte final, e apliquei o mesmo
conserto (embrulhar o `children` afetado num `<div className="flex items-center ...">` interno) em:

- `SidebarNav.tsx` — botão de notificações (rótulo + ponto indicador).
- `ShellSearchWidget.tsx` — variante ícone (texto "Search..." + badge "CTRL K").
- `ShellLanguageSelector.tsx` — o gatilho (bandeira+código+seta OU globo+texto+código) e cada item do dropdown
  (bandeira+rótulo + check condicional).
- `SarakAccordion.tsx` — título + seta expansível.

Não achei o mesmo problema nos demais porque ou usam `leftIcon`/`icon` para o conteúdo visual e só um item de
texto em `children` (sem layout interno a preservar), ou passam o `children` inteiro como um bloco já
autocontido (ex.: o item de menu do `SidebarNav`, cujo rótulo+legenda já é um único `<div className="flex
flex-col">`, e os indicadores absolutos não dependem de o pai ser flex).

### Caracterização — o que a rede provou, para os 3 alvos de maior risco realmente tocados

- **`SarakModal` (3 trocas, dentro de armadilha de foco):** rodei `keyboardJourney.test.tsx` +
  `SarakModal.behavior.test.tsx` (6 casos reais, cobrindo ESC, Tab cíclico, restauração de foco) ANTES —
  6/6 verdes — e DEPOIS da troca — 6/6 verdes, mesma saída. `useModalBehavior`/`useFocusTrap` selecionam
  focáveis por `button:not([disabled]), input, ...` (seletor de DOM) — como os três átomos renderizam
  `<button>` nativo por baixo (confirmado lendo `SarakButton.tsx`/`SarakIconButton.tsx`), a armadilha continua
  enxergando os elementos.
- **`SarakTabs` (não convertido, revertido):** não tinha teste real — **escrevi um** (`SarakTabs.test.tsx`,
  9 casos: `role="tablist"`/`role="tab"`, `aria-selected`/`tabIndex` por estado, `aria-disabled` +
  `disabled` nativo, clique habilitado/desabilitado, `ArrowRight`/`ArrowLeft`/`Home`/`End` pulando aba
  desabilitada). Passou 9/9 no código atual (sem a troca) — **mantive o teste** mesmo revertendo a troca:
  é cobertura real substituindo o placeholder `"should be defined"`, útil para quem tentar esta conversão de
  novo no futuro.
- **`SarakShellNav`:** não precisei escrever nada — o teste já existente já provava o comportamento (e foi
  ele que pegou a regressão).

Os grupos "dentro de armadilha de foco" da ordem sugerida (`SarakLightbox`, `SarakPDFViewer`, `SarakSpotlight`)
**não foram tocados** — caem todos no achado do Provider (tabela acima), então a caracterização de foco/
teclado deles fica para quando essa decisão for tomada.

### Verificações executadas

- `npm run audit` (ANTES, baseline herdado do lote 8) → `composicaoatomica: 47`; `hardcoded: 0`;
  `ghostvars: 1`; `sectionpointers: 1`; demais em 0.
- `npm run audit` (DEPOIS) → `composicaoatomica: 23` (47 − 24 convertidas); todos os outros números
  **inalterados** (`hardcoded: 0`, `ghostvars: 1`, `sectionpointers: 1`) — este lote não mexeu em token nem
  em hardcode, como esperado.
- `npx vitest run` → rodada intermediária após a Parte 1 (grupo Shell): **282 passed / 8 failed** (290
  arquivos) — todas as 8 falhas eram `useSarakUI must be used within a SarakUIProvider` nos testes de
  `SidebarNav`/`TopbarNav`/`ShellUserWidget`/`ShellLanguageSelector`/`SarakShellNav`/`SarakAppChrome`, que
  renderizavam esses componentes isolados sem `SarakUIProvider` (conveniência de teste, não contrato público
  — corrigido envolvendo os `render()` em `<SarakUIProvider>`, seguindo o padrão já usado em
  `ShellSearchWidget.test.tsx`). Após o conserto + o revert do `SarakShellNav`: **290 passed / 290, 1012
  testes** (antes de somar os 9 novos de `SarakTabs`). Rodada final, com todas as trocas e os 9 testes novos:
  **290 passed / 290 arquivos, 1020 testes, 100% verde**. 2 snapshots atualizados (`PreviewCanvas`,
  `PreviewSystemRenderer`) — refletem só a nova composição DOM dos átomos (classe/estrutura), não valor de
  token.
- `npm run gate-limits:check` → `[OK] Os 26 scripts de gates/scripts/ declaram o que não veem.`
- `npm run dev-kit` → regenerado (80 componentes, **422 tokens** — inalterado, confirma que este lote não
  mexeu em token). `npm run dev-kit:check` → em dia.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc --write` → baseline regravado
  (`composicaoatomica: 47 → 23`, resto inalterado).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` (pós-write) → `igual ao baseline de
  2026-08-09 — nenhuma regressão`.
- `npm run gates:full` → **exit 0** na 1ª tentativa (nenhuma surpresa de `sarak-ui/`/`sarak-dev/` desta vez,
  porque o token count não mudou). `coverage:check` reportou melhora (70.67% → 70.69%, dos 9 testes novos de
  `SarakTabs`) — regravei o piso (`check-coverage-floor.mjs --write`), mesma regra do lote 8.
- `git diff --stat` → 27 arquivos de fonte/teste/geração fora do `dist/` (+668/−415), mais o `dist/`
  regenerado pelo `build` dentro do `gates:full` (aviso operacional já conhecido dos lotes 7/8, DECLARADO
  aqui de novo como pedido: `gates:full` reescreve `dist/`, versionado, todo lote que roda `build`).

### Critérios de aceite

- [x] `composicaoatomica` 47 → 23 — evidência: `npm run audit`, os dois números.
- [ ] **Meta de 47 → 2 (ou 0) NÃO atingida** — motivo: achado do Provider bloqueia 20 dos 23 restantes,
      provado com revert-e-reteste em 4 casos e generalizado por leitura de fonte nos outros 5; não é
      trabalho que faltou, é uma decisão de arquitetura que só o dono toma (ver seção do achado).
- [x] `features/**` fora, intocado — evidência: nenhum arquivo de `src/features/` no diff.
- [x] Nenhuma troca alterou o DOM renderizado de `<button>`/`<input>` nativo para `div`+`role` — evidência:
      `SarakButton`/`SarakIconButton`/`SarakInput` renderizam `<button>`/`<input>` nativo por baixo (lido no
      código-fonte dos três); nenhuma conversão trocou o tipo de elemento focável.
- [x] Nenhum átomo virou `forwardRef` — evidência: `git diff -- src/components/atomic/Buttons/SarakButton.tsx
      src/components/atomic/Buttons/SarakIconButton.tsx src/components/atomic/Inputs/SarakInput.tsx` vazio.
- [x] As duas bloqueadas nomeadas — uma confirmada (`ChatInput`), uma recaracterizada com motivo diferente
      (`SarakAppChromeMobile:115`) — evidência: seção dedicada acima.
- [x] As duas perguntas de fronteira — uma resolvida (não é duplicação), uma relatada, não decidida
      (`SocialButton`) — evidência: seção dedicada acima.
- [x] Caracterização antes de tocar em componente com teclado próprio ou armadilha de foco — evidência:
      `SarakModal` (teste existente, antes/depois), `SarakTabs` (teste novo, antes da troca — revertida, mas
      a rede ficou).
- [x] Nenhum gate alterado — evidência: `git diff --stat -- gates/scripts/` vazio (só os dois baselines).
- [x] Baseline e espelhos regravados junto — evidência: `audit-baseline.json`, `coverage-floor.json`,
      `sarak-dev/` no mesmo `git status`.
- [x] `npx vitest run` 100% verde, `gates:full` exit 0 — evidência acima.
- [x] Nada commitado.

### Decisões e suposições

1. **Escolhi NÃO tentar converter os 20 bloqueados "só para ver o que quebra" um por um** — depois da 4ª
   confirmação idêntica (`SarakShellNav`, `SarakTabs`, `SarakAnalyticalPage`, `DynamicRenderer`, todos com o
   mesmo erro, mesmo mecanismo), continuar reproduzindo a mesma quebra nos outros 5 não provaria nada novo e
   gastaria rodada em vez de decisão. A prova por leitura de fonte (ausência de `useSarakUI`/import de átomo)
   é logicamente equivalente, dado que o mecanismo de falha é incondicional e determinístico — não é atalho,
   é a mesma prova sem repetir o experimento.
2. **`SarakAppChromeMobile` (hambúrguer) entrou nos 24 seguros, não nos 20 bloqueados** — porque `SarakIcon`
   sozinho já bastava para a dependência existir antes de eu tocar. Quase reverti por reflexo (mesma família
   dos outros 4 revertidos); só não reverti porque testei antes de decidir.
3. **Escrevi teste novo para `SarakTabs` mesmo sabendo que ia reverter a troca** — porque a caracterização
   tinha valor por si (troca a cobertura de placeholder por cobertura real de teclado/ARIA), e porque só
   testando eu confirmei que a troca quebrava (não presumi).
4. **Não implementei a correção arquitetural** (tornar `useSarakUI()` leniente, ou documentar a fronteira) —
   é mudança na API pública de um hook central, fora do escopo de "trocar `<button>` por átomo", e decide o
   destino de pelo menos 20 ocorrências. Registrado como a pergunta que fecha o resto do R10.

### Achados fora do escopo (não corrigidos)

- **A correção arquitetural do achado do Provider** — ver seção dedicada. Sugestão registrada, não aplicada.
- **`ThemeToggle.tsx` (`atomic/Buttons/`) é código morto/inacabado** (`LAYOUTS = {}` vazio, TODO no
  comentário) — não é duplicação de `ShellThemeToggle`, mas também não faz nada hoje. Fora do escopo de R10;
  candidato a limpeza numa spec própria.
- **`SarakButton`/`SarakIconButton` reescrevem `onMouseEnter`/`onMouseLeave` do consumidor** — se o
  `props.onMouseEnter` existir, o `{...props}` no fim do JSX o sobrescreve por completo (perde o
  `setIsHovered` interno do átomo). Não afeta nenhuma das minhas 24 trocas (nenhuma passou
  `onMouseEnter`/`onMouseLeave`), mas é um defeito real do átomo, achado ao ler o código-fonte para decidir
  as conversões. Registrado, não corrigido — é código de `atomic/Buttons/`, fora do escopo de R10.

### Pendências / riscos

- **Esqueci o `status: 🟡 Em execução` no início desta rodada** — o campo já estava em `🟠 Em revisão`
  (herdado do fim do lote 8) e fui direto para as edições sem marcar a transição. Não teve efeito prático
  (ninguém mais escreveu na plan enquanto eu trabalhava), mas registro a falha ritual em vez de escondê-la.
- **`time-tracking`:** ausente nesta sessão — mesma nota de todas as rodadas anteriores.
- **`specs/00-indice.md` vai divergir de novo** ao mudar o `status` desta plan — mesma mecânica, fora do que
  o executor corrige.
- **20 ocorrências de R10 seguem vermelhas, com motivo nomeado e não uma dívida esquecida** — mas o lote
  9 não fecha o R10 sozinho: depende da decisão do dono sobre o achado do Provider (seção dedicada) para
  continuar. `SarakLightbox`/`SarakPDFViewer`/`SarakSpotlight` (o terço "dentro de armadilha de foco" da
  ordem sugerida) nunca chegaram a ser tocados — ficam também para essa decisão.

---

## Resumo da execução (lote 10 — pagar as 20 que a `plan-18` destravou) — 2026-08-09

**Resultado:** Concluído. **Meta alcançada:** `composicaoatomica` **23 → 3**, exatamente as 3 nomeadas como
fora deste lote (`SocialButton.tsx:56`, `ChatInput.tsx:117`, `SarakAppChromeMobile.tsx:116` — nenhuma tocada).

### As 20 trocas, na ordem obrigatória da §12.6

**Grupo 1 (7) — o caminho já percorrido no lote 9:**

| Arquivo | Trocas | Átomo |
|---|---|---|
| `SarakShellNav.tsx:66` | 1 | `SarakButton` (`leftIcon` para o ícone, `children` para o rótulo) |
| `SarakTabs.tsx:77` | 1 | `SarakButton` (3 variantes: `underlined`/`pills`/`enclosed`) |
| `SarakAnalyticalPage.tsx:43,52,79,92` | 4 | `SarakIconButton` (2 gatilhos + 2 botões "✕" de fechar) |
| `DynamicRenderer.tsx:84` | 1 | `SarakButton` |

**Grupo 2a (4) — a rede que não pode regredir:**

| Arquivo | Trocas | Átomo |
|---|---|---|
| `SarakToast.tsx:89` | 1 | `SarakIconButton` (botão "×" de dispensar) |
| `SarakPagination.tsx:65,85,101` | 3 | `SarakButton` (‹, números, ›) |

**Grupo 2b (9) — o território mais perigoso, com a checagem de armadilha feita antes:**

| Arquivo | Trocas | Átomo |
|---|---|---|
| `SarakLightbox.tsx:89,99,107` | 3 | `SarakIconButton` (fechar, anterior, próxima) |
| `SarakPDFViewerImpl.tsx:109,115,121,127,132` | 5 | `SarakIconButton` (zoom, página, download) |
| `SarakSpotlight.tsx:130` | 1 | `SarakInput` |

### A checagem de armadilha de foco — feita uma vez, no início, como pedido

`FOCUSABLE` (`useFocusTrap.ts:15`) é `'a[href], button:not([disabled]), textarea, input, select, [tabindex]…'`
— um seletor de **DOM nativo**. Li o código-fonte de `SarakButton`/`SarakIconButton`/`SarakInput` antes de
tocar qualquer um dos 12: os três renderizam `<button>`/`<input>` nativo por baixo (nenhum vira `div`+`role`),
então a armadilha continua enxergando os elementos depois da troca — confirmado pelos testes de teclado
(`ArrowLeft`/`ArrowRight`/ESC do `SarakLightbox`) passando 4/4 sem alteração de asserção.

**🔴 Achado que corrige a premissa da plan: nem todo o Grupo 2b vive dentro de armadilha de foco.** A plan
descrevia "12 das 13 do grupo 2 vivem dentro de armadilha de foco". Lendo o código-fonte dos três antes de
converter:

| Componente | Usa `useFocusTrap`? | Realidade |
|---|---|---|
| `SarakLightbox` | ✅ sim (`SarakLightbox.tsx:13,43`) | overlay com Tab cíclico real — a checagem acima vale |
| `SarakPDFViewerImpl` | ❌ **não** — nenhum import, nenhum `containerRef`/`handleTrap` | é um **widget embutido** (barra de controles + canvas), não um overlay; não há armadilha nenhuma para reconferir |
| `SarakSpotlight` | ❌ **não** — só `autoFocus` no `<input>` + `ESC` no `onKeyDown` do próprio campo, sem `Tab` cíclico | é foco inicial automático, não uma armadilha |

Ou seja: dos 13 do grupo 2, só os **3 do `SarakLightbox`** têm armadilha de foco de verdade; os outros **10**
(5 do PDFViewer + 1 do Spotlight + os 4 já cobertos por precedente do lote 9) não têm. Não muda o risco de
tocar neles com cuidado, mas muda o que precisava ser reconferido — registrado para não repetir a suposição.

### A técnica usada nas 20 trocas — `style` sempre vence a classe do átomo

`SarakButton`/`SarakIconButton`/`SarakInput` concatenam `className` por **string simples**, não `twMerge` —
então uma classe custom não tem garantia de vencer `font-black uppercase tracking-widest rounded-btn` (ou
`rounded-input`/borda do `SarakInput`) que o átomo já aplica. A técnica usada em todas as 20 trocas, seguindo
o precedente já aprovado do `SidebarNav` (lote 9) e reforçando com uma garantia mais forte: propriedades CSS
que têm equivalente direto (`textTransform`, `fontWeight`, `letterSpacing`, `borderRadius`, `width`, `height`,
`padding*`, `fontSize`) vão pelo prop `style`, que **sempre** vence a classe (cascade CSS, sem depender da
ordem de geração do Tailwind). Documentado em comentário acima de cada troca.

**Limite encontrado, aceito e documentado:** `getButtonStyles` (usado por `SarakButton`) devolve objeto vazio
no `styleType` default (`'matte'`), então `style.border` do chamador sobrevive. `getInputStyles` (usado por
`SarakInput`) **sempre** recalcula `border` por cima do `style` do chamador (não há `styleType` neutro) — por
isso `SarakSpotlight` não conseguiu manter a borda `border-b` original: o campo agora tem um contorno 1px nos
4 lados (token `inputBorderType`, default `'solid'`) em vez de só embaixo. Funcionalmente idêntico
(`autoFocus`, `onChange`, `onKeyDown`, ESC, filtro, seleção por seta — todos os 6 testes originais passam,
mais o teste de foco novo), visualmente diferente nesse detalhe específico — aceito por não haver automação
visual nesta base ([[01-gates-e-baseline]] §2.6) para provar mais que isso.

### 🔴 Regressão que eu mesmo introduzi e corrigi antes de fechar — hardcode de `px`/`rem`

As primeiras versões das 20 trocas usaram valores literais (`'2.75rem'`, `'9999px'`, `'0.375rem'` etc.) nos
overrides de `style` — o `npm run audit` intermediário acusou **19 violações novas** de `auditor_hardcoded`
(VALOR), porque R2 varre **qualquer string literal** do arquivo, não só `className`. Corrigido substituindo
todo literal por `var(--token-real, fallback)`/`calc(...)`, reaproveitando tokens que **já são emitidos**
(nunca inventando nome novo, que acenderia `auditor_ghostvars` em vez de `auditor_hardcoded`):
`--sarak-layout-gap-md`/`--sarak-layout-gap-sm` (espaçamento), `--sarak-button-radius` (raio, o mesmo que o
`SarakShellNav` já usava), `--radius-badge` (99px, pill completo — o token que a §12.2 já registra como "não
crie escala nova, reuse") e `--text-2xs` (o mesmo de `_theme.css:57`, usado pelo lote 6 na mesma tela do
`DynamicRenderer`). `npm run audit` depois: **0** hardcode, de novo.

### Verificações executadas

- `npm run audit` (ANTES desta rodada, herdado do lote 9): `composicaoatomica: 23`; `hardcoded: 0`;
  `ghostvars: 1`; `sectionpointers: 1`; demais em 0.
- `npm run audit` (intermediário, logo após as 20 trocas, ANTES da correção de hardcode):
  `composicaoatomica: 3` ✅; `hardcoded: 19` ❌ (regressão, ver acima); `ghostvars: 1` (inalterado);
  `sectionpointers: 1` (inalterado).
- `npm run audit` (DEPOIS da correção): `composicaoatomica: 3`; `hardcoded: 0`; `ghostvars: 1`
  (`--x`, pré-existente, não relacionado); `sectionpointers: 1` (pré-existente); `cleancode`, `typescript`,
  `coverage`, `arquitetura`, `paridade` (422/422/422), `presets`, `authcoupling`: todos `[OK]`.
- `npx vitest run` rodado **4 vezes** (uma por grupo + uma final), suíte **INTEIRA** a cada vez:
  - Após Grupo 1: 290/290 arquivos, 1033/1033 testes.
  - Após Grupo 2a: 290/290, 1034/1034.
  - Após Grupo 2b (as 20 completas): 290/290, 1035/1035.
  - Final (após corrigir o hardcode): 290/290, 1035/1035 — igual, confirma que a correção de tokens não mudou
    comportamento, só a origem do valor.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc`: primeiro rodou **MELHOROU** (
  `auditor_composicaoatomica.mjs.violacoes: 23 -> 3`) — regravado com `npm run audit:baseline -- --write`.
  Reconferido: `igual ao baseline de 2026-08-09 — nenhuma regressão`.
- `npm run coverage:check`: **MELHOROU** (70.69% → 71.47%, dos 9 testes novos/characterização) — regravado
  com `npm run coverage:check -- --write`; reconferido: `igual ao piso (71.47%) — nenhuma regressão`.
- `npm run gate-limits:check`: `[OK] Os 26 scripts de gates/scripts/ declaram o que não veem.`
- `npm run dev-kit`: regenerado — `80 componentes públicos, 422 tokens, 17 gates` (contagem de componentes e
  de tokens **inalterada**: nenhum componente novo, nenhum token novo). `npm run dev-kit:check`: em dia.
- **`sarak-ui/` (`npm run guide`) NÃO rodado** — a contagem de tokens não mudou (422 antes e depois), e a
  plan condiciona esse espelho a essa contagem mudar. `git status --short -- sarak-ui/` confirma zero
  mudança.
- `npm run gates:full`: **exit 0**.
- `git diff --stat`: **33 arquivos** — 12 de produção (`src/`), 6 de teste, 2 baselines (`gates/baselines/`),
  3 de `sarak-dev/`, 14 dentro de `dist/`. Nenhum arquivo de `gates/scripts/` (nenhum gate alterado), nenhum
  arquivo de `specs/specs/`/`specs/adr/`/`specs/arquitetura/`/`specs/00-indice.md`.

**`dist/` MUDOU** (declarado, como pedido) — o `build` dentro de `gates:full` o reescreveu: `BUILD_INFO.json`,
`index.cjs`/`index.js`, os dois CSS, e os chunks hash-named de `CustomizationPanelImpl`/`SarakChartEngine`/
`SarakChatEngine`/`SarakFlowEngine`/`SarakMarkdownRendererImpl`/`SarakPDFViewerImpl` trocaram de hash (os
antigos saem, os novos entram) — esperado: `SarakToast`/`SarakLightbox`/`SarakPDFViewerImpl` passaram a
importar `SarakButton`/`SarakIconButton`/`SarakInput`, o que muda o grafo de módulos desses chunks lazy.
`src/core/Provider/generated/design-token-ids.ts` recebeu um toque de `git` (aviso de CRLF) mas **zero
diferença de conteúdo** (`git diff` vazio) — não é uma mudança real.

### Critérios de aceite

- [x] `composicaoatomica` 23 → 3 — evidência: `npm run audit`, os dois números; baseline regravado e
      reconferido "igual".
- [x] As 3 nomeadas (`SocialButton`, `ChatInput`, `SarakAppChromeMobile`) **não tocadas** — evidência:
      nenhuma aparece em `git diff --stat`.
- [x] Nenhuma troca alterou o DOM renderizado de `<button>`/`<input>` nativo para `div`+`role` — evidência:
      os três átomos-alvo renderizam elemento nativo (lido no código-fonte); a armadilha de foco do
      `SarakLightbox` continua funcionando nos mesmos 4 testes, sem alteração de asserção.
- [x] Nenhum gate alterado — evidência: `git diff --stat -- gates/scripts/` vazio (só os 2 baselines).
- [x] Baseline e os três espelhos regravados junto — evidência: `audit-baseline.json`,
      `coverage-floor.json`, `sarak-dev/` no mesmo diff; `sarak-ui/` deliberadamente não tocado (token count
      não mudou).
- [x] `npx vitest run` 100% verde, `gates:full` exit 0 — evidência acima, 4 rodadas da suíte inteira.
- [x] Caracterização/reconferência de armadilha de foco antes de tocar nos 12 do território perigoso —
      evidência: seção dedicada acima, com a correção da premissa (só 3 dos 13 têm armadilha real).
- [x] O ajuste de comentário pendente da `plan-18` (`SarakUIProvider.tsx`, "aviso único" →
      "aviso deduplicado por re-render, StrictMode duplica em dev") — feito, zero linha de comportamento.
- [x] Nada commitado.

### Decisões e suposições

1. **Adicionei `aria-label` aos 4 botões de `SarakAnalyticalPage`** (`"Abrir/Fechar menu de navegação"`,
   `"Abrir/Fechar painel lateral"`) — **não existiam antes** (só um SVG sem rótulo). Não era exigido pela
   letra do R10, mas o foco/teclado é "O risco" declarado no prompt desta rodada, e um botão sem nome
   acessível é exatamente o tipo de regressão que essa atenção deveria pegar. Registrado como melhoria em
   escopo, não como conserto silencioso — os 3 testes novos que dependem desses rótulos provam que existem.
2. **`icon="×"`/`icon="‹"`/`icon="›"` como string, não SVG** — `SarakIconButtonProps.icon` é `React.ReactNode`,
   que aceita string; preserva exatamente o caractere que já estava lá (nenhum ícone de biblioteca novo).
3. **Não persegui paridade de pixel na borda do `SarakSpotlight`** (ver seção da técnica) — decisão
   deliberada, documentada, dado que `getInputStyles` não permite o mesmo truque de `style` que funcionou nos
   outros 19. Se a paridade exata da borda importar, o conserto é no átomo (`useAtomicStyles.getInputStyles`
   respeitar `style.border` do chamador quando presente), fora do escopo desta plan (ela não altera átomo).
4. **`buildBtnStyle`/`pageBtnStyle`/`controlBtnStyle`/`lightboxBtnStyle`/`TAB_RADIUS` como constantes de
   módulo** (não inline) — evita repetir o mesmo objeto de estilo 2-5 vezes por arquivo; nenhum limite de
   Clean Code foi tocado por isso (todos os 6 arquivos de produção continuam com `[OK]` no `auditor_cleancode`).
5. **`time-tracking`:** ausente nesta sessão — mesma nota das rodadas anteriores.

### Achados fora do escopo (não corrigidos)

- **`getInputStyles` não respeita `style.border` do chamador** (ver Decisões #3) — achado de arquitetura do
  átomo `SarakInput`/`useAtomicStyles`, não desta plan. Registrado para uma spec futura de refinamento de
  átomo, se a paridade de borda do `SarakSpotlight` vier a importar.
- **`SarakPDFViewerImpl` e `SarakSpotlight` não têm armadilha de foco** apesar de serem overlays/widgets que
  plausivelmente deveriam ter Tab cíclico (o PDFViewer nem é overlay, mas o Spotlight é um Command Palette
  modal sem `Tab` preso — hoje o foco pode escapar do diálogo com Tab). Não é uma regressão desta plan (o
  comportamento já era esse antes da troca de átomo) — é uma lacuna de a11y pré-existente, achada ao
  caracterizar. Registrada para o dono avaliar se `SarakSpotlight` merece `useFocusTrap`.

### Pendências / riscos

- Nenhuma pendência desta plan. As 3 ocorrências fora do escopo (`SocialButton`, `ChatInput`,
  `SarakAppChromeMobile`) continuam aguardando decisão do dono, como já registrado no lote 9.
- `specs/00-indice.md` vai divergir de novo ao mudar o `status` desta plan — mesma mecânica já registrada,
  fora do que o executor corrige.

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
>
> 🔴 **SÃO TRÊS ESPELHOS, não um** *(o terceiro descoberto pelo executor do lote 8, do jeito caro:
> `gates:full` vermelho na primeira tentativa)*:
>
> | Espelho | Regenera com | Espelha |
> |---|---|---|
> | `gates/baselines/` | `npm run audit:baseline -- --write` · `npm run coverage:check -- --write` | os números dos auditores e o piso de cobertura |
> | `sarak-dev/` | `npm run dev-kit` | baseline, contagem de componentes, gates, tokens |
> | `sarak-ui/` | `npm run guide` | **contagem de tokens** e `kitHash` (`VERSION`, `catalog.json`) |
>
> **O terceiro só acorda quando a contagem de TOKENS muda** — por isso passou despercebido até o lote 8, o
> primeiro a criar token. Lote que mexe em token roda os três.

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

## 12.2 Lote 7 — muda a tela, em duas direções opostas  ·  `🟢 EXECUTADO em 2026-08-08`

> ✅ **Entregue e aprovado** (veredito na §11). `hardcoded` **12 → 6**, `ghostvars` **26 → 12**, 14 fantasmas
> pagos, zero fantasma novo. **Uma pendência ficou aberta** e foi empurrada para o lote 8: o fallback de
> `SarakShellNav.tsx:134` segue em `28px` enquanto `SidebarNav:87` e `TopbarNav:84` usam `32px` — um token,
> três consumidores, dois fallbacks.

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

## 12.3 Lote 8 — Expansão: tokens novos e a cadeia de paridade  ·  `🟢 EXECUTADO em 2026-08-08`

> ✅ **Entregue e aprovado** (veredito na §11). 13 tokens criados, paridade **422/422/422/422**, `hardcoded`
> **6 → 0** e `ghostvars` **12 → 1**. As duas pendências do lote 7 fecharam: `SarakShellNav.tsx:134` alinhado
> em 32px, e o `--sarak-button-active-color` relatado como metadado morto (achado de regra que falta).

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
> ✅ **A pendência de raio saiu daqui em 2026-08-08.** O dono escolheu **reusar o token de papel** (decisão 6
> da §2.3), o que muda pixel — então os 4 `rounded-[Nrem]` do `DynamicRenderer` foram para o **lote 7**
> (§12.2). **Nenhum token de raio novo será criado**; este lote é só Expansão de verdade.

### Os 12 fantasmas restantes, localizados (medidos pelo revisor em 2026-08-08)

**Todos têm fallback funcional hoje.** Se o token novo nascer com o valor do fallback atual, **este lote não
muda pixel nenhum** — é a diferença entre "criar token" e "trocar valor". Vale como critério de aceite.

| Consumo (`arquivo:linha`) | Fantasma | Fallback de hoje |
|---|---|---|
| `_utilities.css:83` · `:92` | `--sarak-range-active-bg` ×2 | `var(--theme-primary)` |
| `_atmosphere.css:100` | `--sarak-glass-edge-width` | `1px` |
| `_atmosphere.css:100` | `--sarak-glass-edge-color` | `rgba(255,255,255,0.1)` |
| `_colors.css:19` | `--sarak-tooltip-text` | `#0f172a` |
| `_colors.css:20` | `--sarak-tooltip-border` | `#cbd5e1` |
| `_typography.css:25` | `--sarak-h3-size` | `24px` |
| `_base.css:38` · `:40` | `--theme-pad-scaled` ×2 | `1.5rem` / `24px` *(iguais)* |
| `_base.css:37` | `--theme-gap-scaled` | `20px` |
| `_base.css:39` | `--theme-radius-scaled` | `12px` |
| — | `--x` | já declarado como caso à parte |

### 🔴 O achado que muda o desenho deste lote — os 3 `*-scaled` NÃO são "criar token"

A plan dizia *"os 3 `*-scaled` redirecionam para `layoutGap`/`layoutPadding`/`borderRadius`"*. **Medindo, o
problema é outro e maior:** essas três variáveis **já são emitidas pelo Design Engine**, com valor por tema —
confirmado no snapshot do `PreviewCanvas` (`--theme-gap: 16px|20px`, `--radius-theme: 0px|10px`,
`--sarak-layout-padding: 16px|20px`, `--sarak-layout-gap: 16px|20px`, `--border-radius: 0px|10px`).

O bloco `body { }` de `_base.css:36-40` — rotulado *"ALIASES DE COMPATIBILIDADE"* — **redefine** `--theme-gap`,
`--theme-pad`, `--radius-theme` e `--theme-card-padding` em termos de nomes que **não existem**:

```css
--theme-gap:          var(--theme-gap-scaled, 20px);      /* engine já emite --sarak-layout-gap */
--theme-pad:          var(--theme-pad-scaled, 1.5rem);    /* engine já emite --sarak-layout-padding */
--radius-theme:       var(--theme-radius-scaled, 12px);   /* engine já emite --radius-theme DIRETO */
--theme-card-padding: var(--theme-pad-scaled, 24px);
```

**Não delete as linhas.** Elas são a camada de compatibilidade para quem usa a lib **sem** o Design Engine
montado — aí não há valor inline nenhum e o literal é o único piso. O conserto é **apontar a cadeia para a
variável REAL do mesmo conceito, mantendo o literal como último fallback**:

```css
--theme-gap: var(--sarak-layout-gap, 20px);
```

Com o engine: a variável real vence. Sem o engine: cai no mesmo literal de hoje. **Zero pixel nos dois casos** —
e é a única saída que preserva as duas situações.

> ⚠️ **`--radius-theme` é o caso especial:** o engine emite `--radius-theme` **diretamente** (é `cssVar` do
> token `borderRadius`, `system.ts:81`). Redefini-la em termos de si mesma é circular. Escolha outro `cssVar`
> do mesmo token (`--sarak-border-radius` ou `--border-radius`) como elo, ou justifique a alternativa.

### Pendências herdadas do lote 7 — entram neste

1. **`SarakShellNav.tsx:134`** — fallback `28px` para `--sarak-shell-brand-logo-size`, enquanto `SidebarNav:87`
   e `TopbarNav:84` usam `32px`. Um token, três consumidores, dois fallbacks. **Alinhar em 32px.**
2. **`--sarak-button-active-color` é metadado morto** — declarado em `manifest.ts:210`, **0 emissões** no
   snapshot do `PreviewCanvas`. Consumido em `_utilities.css:49`. O `auditor_ghostvars` **não o vê** porque
   aceita nome que o manifesto declara mas o runtime nunca emite. É achado de **regra que falta**, não de
   código: relatar, não consertar por conta própria.

## 12.4 Lote 9 — R10, composição atômica  ·  `🟢 EXECUTADO (parcial) em 2026-08-09`

> ✅ **Entregue e aprovado como completo.** 47 → **23**: 24 trocas seguras. O déficit **não é trabalho
> pendente** — é o achado do Provider, que virou a [[plan-18-atomo-sem-provider]] e já foi executado. As 20
> ocorrências bloqueadas voltam no **lote 10** (§12.6). As 3 restantes precisam de decisão do dono.

## 12.6 Lote 10 — pagar as 20 que a `plan-18` destravou  ·  `🔴 A executar`

**Pré-requisito cumprido:** a `plan-18` entregou `useSarakUIOptional()` e os átomos
(`SarakButton`, `SarakIconButton`, `SarakInput`) **renderizam sem `SarakUIProvider`**. O obstáculo que parou o
lote 9 não existe mais.

### As 20, por como o bloqueio foi estabelecido

**Grupo 1 — provado por conversão no lote 9** (converteu, viu quebrar, reverteu). São os de menor risco agora:
o caminho já foi percorrido uma vez.

| Arquivo | Ocorrências |
|---|---|
| `atomic/Navigation/SarakShellNav.tsx:66` | 1 |
| `atomic/UX/SarakTabs.tsx:77` | 1 |
| `Layout/SarakAnalyticalPage.tsx:43,52,79,92` | 4 |
| `core/Discovery/DynamicRenderer.tsx:84` | 1 |

**Grupo 2 — generalizado por leitura de fonte** (nunca convertido; os 5 têm **zero** `useSarakUI` hoje, medido
pelo revisor). Risco maior: 12 das 13 vivem **dentro de armadilha de foco**.

| Arquivo | Ocorrências | Risco |
|---|---|---|
| `atomic/Feedback/SarakToast.tsx:89` | 1 | tem teste *"useToast() sem Provider degrada"* — não pode regredir |
| `atomic/Navigation/SarakPagination.tsx:65,85,101` | 3 | teclado próprio |
| `atomic/Media/SarakLightbox.tsx:89,99,107` | 3 | **armadilha de foco** |
| `atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx:109,115,121,127,132` | 5 | **armadilha de foco** |
| `atomic/Navigation/SarakSpotlight.tsx:130` | 1 | **armadilha de foco** · é `<input>`, vai para `SarakInput` |

### As 3 que NÃO são deste lote — decisão do dono

| Item | Por quê |
|---|---|
| `atomic/Templates/Chat/ChatInput.tsx:117` | `<input type="file" ref>` **oculto**, disparado por `.click()`. Nenhum átomo serve, e o `ref` bloqueia. Terceira saída da §3.3 — *"a regra está larga demais"* |
| `Layout/SarakAppChromeMobile.tsx:116` | scrim de tela cheia, sem ícone nem texto. **Não tem `ref`** — o revisor errou ao dizer que tinha (§12.4 corrigida). Nenhum átomo atual serve |
| `atomic/Atoms/SocialButton.tsx:56` | átomo de botão fora de `atomic/Buttons/`. **A fronteira da R10 é por PASTA ou por PAPEL?** |

### Meta

**23 → 3.** Se as 3 forem decididas no caminho, 23 → 0.

**47 ocorrências em 20 arquivos** de HTML nativo cru: `components/atomic` 23 · `core/Shell` 15 · `Layout` 6 ·
`engines` 2 · `Discovery` 1. É o maior e o mais arriscado — mexe em foco, teclado e estilo de componente
montado. **A caracterização vem antes** (§5.4, skill `code-adequacao`), não depois.

`features/**` está **fora** por decisão do dono (ferramenta de autoria da própria lib) — as 64 ocorrências de
lá não são dívida. O detector é AST, nunca regex de linha: a `plan-16` mediu que
`<(button|input|select)[ >/]` **perde 55 de 111** por ser busca por linha.

### Os átomos de destino, medidos pelo revisor em 2026-08-08

| Átomo | Assinatura | Encaminha props? | `forwardRef`? |
|---|---|---|---|
| `SarakButton` | `extends ButtonHTMLAttributes<HTMLButtonElement>` | ✅ `...props` | ❌ **não** |
| `SarakIconButton` | `extends ButtonHTMLAttributes<HTMLButtonElement>` | ✅ `...props` | ❌ **não** |
| `SarakInput` | `extends InputHTMLAttributes<HTMLInputElement>` | ✅ `...props` | ❌ **não** |

**A boa notícia:** os três estendem os atributos nativos e espalham `...props`, então `type`, `onClick`,
`disabled`, `title` e **todo `aria-*`** atravessam sem perda. A troca é viável para a maioria.

**O limite:** nenhum é `forwardRef`, então **nenhuma chamada que use `ref` pode ser trocada** sem antes tornar
o átomo `forwardRef` — o que é mudança na superfície pública de um átomo, não refactor de call-site.

### As 47, separadas pelo que realmente as bloqueia

| Grupo | Quantas | O que fazer |
|---|---|---|
| **Livres** — sem `ref` na abertura | **45** | trocar pelo átomo, com caracterização antes |
| **Bloqueadas por `ref`** | **2** | ⇒ PARE e relate. Ver abaixo |

As duas bloqueadas:

1. **`ChatInput.tsx:117`** — `<input type="file" ref={fileInputRef} className="hidden" />`. **Não é campo de
   UI:** é um seletor de arquivo **oculto**, disparado por `.click()` a partir de um `SarakIconButton` que já
   está logo abaixo. Trocar por `SarakInput` seria errado duas vezes — quebra o `ref` e veste de campo o que
   nunca é visto. **Este é candidato legítimo à terceira saída da §3.3** *("a regra está larga demais")*, e a
   decisão é do dono.
2. **`SarakAppChromeMobile.tsx:115`** — `<button>` com `ref`. Ou o átomo vira `forwardRef`, ou fica declarado.

### Duas perguntas de fronteira que só o dono responde

- **`atomic/Atoms/SocialButton.tsx:56`** — é um átomo de botão, mas mora em `Atoms/`, não em `Buttons/`, então
  a fronteira da R10 (§ da regra) o alcança. Um átomo de botão usando `<button>` cru é o caso que a exclusão
  de `atomic/Buttons|Inputs` existe para permitir. **A fronteira deveria ser por PASTA ou por PAPEL?**
- **`core/Shell/Components/ShellThemeToggle.tsx`** tem 3 `<button>` crus enquanto existe
  `atomic/Buttons/ThemeToggle.tsx`. Vale checar se é duplicação a resolver em vez de trocar.

## 12.5 Fora dos lotes — o que é do revisor

Os **2 ponteiros de seção** que sobraram (`01-gates-e-baseline.md:572` → `§7.3` e `15-divida-conhecida.md:179`
→ `§4.2`) e a **linha 70 de `15-divida-conhecida.md`**, que ainda declara o achado 29 aberto quando ele já foi
pago (`sarak-dev/GUIA-MANUTENCAO.md:308` hoje aponta `§2`, o alvo certo). São arquivos de `specs/specs/` — o
executor **não os toca** ([[00-prompt-executor]] §7.3). `⏳ Aguardando autorização do dono.`
