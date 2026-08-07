---
tipo: "plan"
titulo: "Auditoria de cobertura dos gates — procurar de propósito o que apareceu por acaso"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "⚪ Sintetizada"
prioridade: "Máxima"
tags: ["plan", "gates", "investigacao", "cobertura", "read-only"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[15-divida-conhecida]]"]
depende_de: "plan-03"
destino_sintese: "specs/00-regras-e-invariantes.md · specs/01-gates-e-baseline.md · specs/15-divida-conhecida.md"
---

> 🔒 **A METADE 1 É READ-ONLY E É O PRODUTO PRINCIPAL.** Esta é a única plan da fila que **começa sem lista de
> tarefas** — a lista é a entrega dela. Executor que pular para o conserto destrói o valor da plan.

# 1. Objetivo

As **29 regras verificáveis** têm o escopo do seu gate **mapeado com `arquivo:linha`**, todo vão está **declarado ou fechado**,
e nenhum vão novo pode nascer silencioso.

# 2. Contexto

**Quatro achados independentes têm a mesma forma:**

| Regra | Gate que a cobra | O que o gate NÃO vê | Exposição |
|---|---|---|---|
| Namespace `--sx-*` proibido | `auditor_ghostvars` | `src/styles/` — tratado como fonte emissora, nunca consumidora | **2 usos vivos** |
| Cobertura 1:1 | `auditor_coverage` | `src/shared/` — fora do escopo | **3 arquivos sem teste** |
| Barril completo | `barrel:check` | `components/engines/` | 3 categorias *(fechado)* |
| Paridade do dicionário | `auditor_paridade` | o **tipo gerado** não é uma das 3 fontes | **105 tokens de deriva** |

Quatro vezes o mesmo padrão: **o escopo do gate é menor que o escopo da regra.** Nenhum é gate quebrado —
todos passam, com convicção, dentro do próprio recorte. **O defeito é o recorte.**

**Quatro instâncias não são coincidência.** Os quatro apareceram **por acaso**, não por método. E o achado 30
provou que atenção humana não pega essa classe: o conserto de um ponteiro morto criou outro, na mesma entrega
em que a classe foi catalogada.

# 3. Escopo

## 3.1 Dentro
- **Metade 1 (read-only):** leitura de `.agents/skills/ui-auditoria-modulo/scripts/*`, `scripts/*`,
  `.githooks/*`, `src/**/__tests__/*` de gate, `package.json`
- **Metade 2 (só após aprovação):** os gates que o dono mandar ampliar, e as specs abaixo
- `specs/00-regras-e-invariantes.md` — R18 + a coluna "Cobrada por" onde a matriz corrigir
- `specs/01-gates-e-baseline.md` — a matriz vira seção permanente
- `specs/15-divida-conhecida.md` — os vãos novos entram numerados a partir de 32

## 3.2 Fora
- ⛔ **Qualquer conserto na metade 1.** Nem um. A metade 1 termina em relatório.
- ⛔ Consertar o **conteúdo** que vive dentro de um vão (isso é da plan-07) — aqui se mexe no **gate**.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/00-regras-e-invariantes.md` | as **32 regras** — 29 verificáveis, 3 de conduta (fechadas pela plan-13) |
| Spec fixa | `specs/01-gates-e-baseline.md` | o baseline e o que cada gate garante hoje |
| Spec fixa | `specs/15-divida-conhecida.md` §3.3 | os 4 casos já conhecidos, para não recontá-los |
| Código | `.agents/skills/ui-auditoria-modulo/scripts/` | os 8 auditores — ler o **código**, não o comentário |

# 5. Instruções de execução

## Metade 1 — INVESTIGAÇÃO (read-only)

1. Para **cada uma das 29 regras verificáveis** (as 3 de conduta ficam fora — não têm gate por decisão), preencher com `arquivo:linha`:

| Coluna | O que responder |
|---|---|
| **Regra** | o enunciado |
| **Gate** | qual script a cobra — ou **"nenhum"**, honestamente |
| **Escopo do gate** | o que ele **de fato** varre, **lido no código, não no comentário** |
| **Escopo da regra** | onde a regra **deveria** valer |
| **Δ (o vão)** | a diferença — e se é **declarada** ou **silenciosa** |
| **Exposição** | o que hoje vive dentro do vão — **medir, não estimar** |

2. **A distinção que organiza tudo:** limite **declarado** é honesto (o `auditor_hardcoded` tem "known
   limitations"; o `tagComparison` declara que só lê o MAJOR; o `check-release-tag` usa `caminho:tamanho` e é
   cego a mudança de mesmo tamanho). Vão **silencioso** é o gate mentindo por omissão. **Só o segundo é defeito.**

3. **Cobrir também os gates sem regra numerada:** `catalog:check`, `guide:check`, `dev-kit:check`,
   `package:check`, `audit:baseline`, os dois anéis de `pre-commit`/`pre-push`, e os gates-teste
   (`BarrelParity`, `ZeroBrand`, `tokenContractParity`, `shippedThemesConsoleClean`, `EmbeddedMode`,
   `scopeCss`). Mesma pergunta: **o que ele NÃO vê?**

4. **Seis pistas para começar** — são ponto de partida, **não a lista**:
   - **Artefatos gerados que nenhum gate cruza contra a fonte.** O `design-token-ids.ts` era um. E
     `src/core/Provider/manifest.ts`, `docs/component-catalog.*`, `sarak-ui/catalog.json`, `sarak-dev/state.json`?
   - **Geradores não registrados.** `generate-token-types.ts` não está em `package.json`, hook nem `.agents/`.
     Varra `scripts/` inteiro: quais outros produzem artefato versionado e **não são invocados por nada**?
   - **Diretórios de `src/` que nenhum auditor varre** — `styles/`, `shared/`, `effects/`, `constants/`, `types/`.
   - **Prosa dentro de bloco gerado** (achado 29) — o `dev-kit:check` verifica caminho, gate e comando, **não**
     referência de seção.
   - **Referência a seção `§N`** (achado 30) — varra `§` em todo `.ts`/`.mjs`/`.md` versionado e resolva cada
     um contra o heading real do alvo. **Detector barato, e não existe.**
   - **Ponteiros de onboarding** (achado 31) — que outros caminhos de entrada dependem de convenção em vez de
     ponteiro duro?
   - **Contagens declaradas que nenhum gate cruza contra a fonte.** "409 tokens", "81 componentes", "17
     regras", "8 auditores", "22 achados abertos", "1.2.0" — vivem em prosa de spec e envelhecem sozinhas.
     *(Duas specs escritas na mesma entrega, em 2026-08-01, já divergiam no número de achados.)* O
     `dev-kit:check` cruza **algumas**; quais ficam de fora?

5. **⇒ PARE. Relatório em texto: a matriz + os vãos ordenados por exposição medida. Aguarde aprovação.**

## Metade 2 — ROTEAMENTO — **escopo fixado pelo revisor em 2026-08-03**

> 🔒 **A Metade 2 NÃO constrói gate.** A Metade 1 mediu **14 vãos** e **7 regras sem gate nenhum** — cerca de
> **21 itens**. Isso é plan de construção, e plan de construção é a `plan-12`. Se a Metade 2 os executasse,
> esta plan deixaria de ser investigação e viraria a 12 com outro nome.
>
> **A Metade 2 faz três coisas, e só três:**
>
> 1. **Amplia o REGISTRO do `auditor_ghostvars`** (vão nº 4) — e nada mais de escopo. É pré-requisito medido
>    dos vãos 2, 3 e 5: sem ele, ampliar escopo produz **~85 acusações falsas** (36/128 → 22/109 → 16/24, a
>    cadeia que a Metade 1 mediu). É a advertência do §4.3.c virando número.
> 2. **Declara no código o limite** dos vãos de exposição zero — **nº 9** (subpasta de categoria) e **nº 10**
>    (zero-marca fora de `src/`). R18 torna isso obrigatório: gate sem limite declarado é lido como cobertura
>    total.
> 3. **Entrega a matriz** como seção permanente de [[01-gates-e-baseline]], com os 14 vãos e o destino de cada
>    um — que é a **lista de compras da plan-12**.

### As decisões de roteamento — 2026-08-03

| # | Vão | Destino |
|---|---|---|
| 4 | registro lê 2 de 4 fontes emissoras (+73 vars invisíveis) | **Metade 2 — sozinho e primeiro** |
| 9 · 10 | subpasta de categoria · zero-marca fora de `src/` — **exposição zero** | **Metade 2 — declarar o limite no código** |
| 2 · 3 · 5 | `src/styles/` · `src/core/` no ghostvars · `src/core/` no hardcoded | **plan-12**, e cada um com a contagem de falsos medida antes e depois |
| 7 | ponteiro de seção `§N.N` | **plan-12.** ⚠️ **Não é barato ainda**: 16 dos 23 achados são ruído. As duas convenções de falso-positivo — `§7.3` como *item 3 da seção 7*, e alvo com `## 2.1` sem `# 2` pai — têm de estar codificadas **antes** de ligar. **E o detector ignora `specs/plan/`**: plan é rastro append-only, e cobrar ponteiro nela reprovaria o repositório para sempre |
| 6 | `shared/`, `effects/`, `constants/` fora do coverage | **plan-12 (o gate)** + **plan-07 (a dívida)**. Ampliar revela **4 arquivos sem teste**; escrever esses testes não é trabalho de gate |
| 1 | tipo gerado fora das 3 fontes (105 tokens) | **plan-12** — já tem dono (achado 22) |
| 8 | `dist/BUILD_INFO.json` sem `--check` | **plan-12** |
| 11 | `.githooks/pre-push:53` sem `gates/` — mexer num gate não dispara a suíte | **plan-12.** Criado pela plan-14; correção de uma linha |
| 12 | sincronia plan × índice sem gate — falhou 2× na campanha | **plan-12** |
| 13 | **R17** cobre só o artefato gerado; prosa manual sem gate | **plan-12.** É o vão por onde os ponteiros mortos da plan-13 passaram |
| 14 | **R30** — o Anel 2 cobra a contagem, não o zero | **plan-12** |

**R15 permanece conduta** *(decisão do dono, 2026-08-03)* — mensurável, deliberadamente não medida. Registrado
na própria regra para não ser reproposto.

### O roteiro original (mantido como referência)

6. Cada vão recebe **um** destino, e a decisão é do dono:
   - **Ampliar o gate** — a regra vale mesmo naquele escopo. ⚠️ **Ampliar escopo exige ampliar o registro
     junto**: o `auditor_ghostvars` não lê `useDesignVariables.ts`, e escopo maior com registro menor produz
     **acusação falsa** — pior que a lacuna.
   - **Declarar o limite** — ampliar custa mais do que vale. O limite entra **no código**, ao lado da implementação.
   - **Corrigir a regra** — o vão revela que a regra estava escrita larga demais.
7. Propor **R18** em `00-regras-e-invariantes.md`:

> **R18 — Todo gate declara o que NÃO vê.** Um gate sem limite declarado é lido como cobertura total, e é assim
> que uma regra passa anos sendo violada dentro do vão do próprio verificador. Ao criar ou ampliar um gate, o
> escopo e as exclusões ficam escritos **no código do gate** e refletidos na spec de gates. Ampliar escopo sem
> ampliar o registro correspondente é **regressão**, não melhoria.

8. Vãos que não forem fechados nesta plan entram em `15-divida-conhecida.md`, numerados a partir de **32**.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-06-auditoria-cobertura-gates.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md, specs/specs/01-gates-e-baseline.md,
specs/specs/15-divida-conhecida.md.

A METADE 1 É READ-ONLY e é o produto principal: você monta a matriz de cobertura e PARA.
Não conserte nada antes da aprovação — nem um vão "óbvio". Leia o ESCOPO REAL de cada
gate no código, nunca no comentário dele.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] As **29 regras verificáveis** com escopo de gate mapeado por `arquivo:linha`, lido no código.
- [ ] Os gates sem regra numerada cobertos pela mesma pergunta.
- [ ] Cada Δ classificado como **declarado** ou **silencioso**.
- [ ] Exposição **medida** em cada vão silencioso — nenhum "provavelmente".
- [ ] Relatório apresentado e aprovado **antes** de qualquer edição de gate.
- [ ] Todo vão **declarado** (limite escrito no código) ou **fechado** (gate ampliado + registro ampliado junto).
- [ ] **R18** escrita em `00-regras-e-invariantes.md`; a matriz vira seção permanente em `01-gates-e-baseline.md`.
- [ ] Nenhum gate ampliado sem o registro/allowlist correspondente ampliado — **acusação falsa reprova**.
- [ ] Vãos não fechados registrados em `15-divida-conhecida.md` a partir do nº 32.

# 8. Como verificar

- Metade 1: `git status --porcelain` → **vazio**. Qualquer arquivo alterado antes da aprovação reprova.
- Metade 2: para cada gate ampliado, rodar e confirmar que **não** produz acusação falsa
- `npm run audit` → o baseline muda **só** pelo que foi decidido, e `npm run audit:baseline` regrava junto
- `grep -n "R18" specs/specs/00-regras-e-invariantes.md` → existe
- Amostragem: 3 linhas da matriz reconferidas abrindo o script do gate

# 9. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md` (R18 + coluna "Cobrada por") ·
`specs/01-gates-e-baseline.md` (a matriz) · `specs/15-divida-conhecida.md` (vãos abertos)

**Nenhuma spec nova.** A matriz não é documento à parte: ela pertence à spec de gates, senão vira mais um
artefato que ninguém atualiza.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-03

**Resultado:** Concluído com pendências — **uma métrica do baseline mudou, e a decisão de regravar é do dono** (ver *Pendências*).

A Metade 1 foi entregue e aceita em 2026-08-02 (relatório em texto, `git status` sem gate nem spec tocados).
Este resumo cobre a **Metade 2**, executada em 2026-08-03 contra o roteamento da §5.

### Entrega 1 — o registro do `auditor_ghostvars` (vão nº 4)

**Só o registro. `CONSUMER_DIRS` não foi tocado** — ampliar escopo é da `plan-12`.

| O que entrou | Onde |
|---|---|
| `src/core/Provider/manifest.ts` — o mapa token→var (`vars: [...]`), **173 vars** | `auditor_ghostvars.mjs:29-30`, lido em `:63-70` |
| `src/core/Design/hooks/useDesignVariables.ts` — emissão de runtime, **37 vars** | idem |
| **Bloco de LIMITES DECLARADOS (R18)** no cabeçalho | `auditor_ghostvars.mjs:4-26` |

**Registro: 14.179 → 15.394** variáveis emitidas.

> ⚠️ **Uma correção ao enunciado da tarefa, e ela importa.** O prompt pedia acrescentar "a família de nome
> computado `${v}-rgb`". **Ela já estava lá** — `-rgb` é o primeiro item de `GENERATED_SUFFIXES` (`:22`) desde
> sempre. O que faltava não era o sufixo, era a **base**: o sufixo só resolve `--theme-primary-rgb` se
> `--theme-primary` estiver no registro, e é o manifesto que a fornece. Não escrevi código novo para isso;
> escrevi o **porquê** ao lado da constante (`:17-21`), que é o que R18 pede.

### Entrega 2 — limites declarados no código (vãos nº 9 e nº 10)

| Vão | Arquivo | O que passou a estar escrito |
|---|---|---|
| **9** | `scripts/publicComponents.mjs:172-194` | categoria sem barril só tem a **raiz** varrida; componente em subpasta escapa de R14 e do catálogo. **Exposição medida: ZERO** — `Cards/`, `Icon/` e `Tables/` não têm subpasta com `.tsx` |
| **10** | `gates/scripts/contrato/check-zero-brand.mjs:19-40` | escopo é **só `src/`**; não vê `sarak-ui/templates/`, `bin/scaffold/generators/` nem `docs/`. **Exposição medida: ZERO real** — os 2 acertos em `docs/` são prosa que documenta a correção |

Os dois trazem o número medido e **o que muda a conta** (uma subpasta nova; um template `.tsx` novo), para que
recontar seja um `find` e não uma auditoria.

### Entrega 3 — a matriz como seção permanente

**`specs/specs/01-gates-e-baseline.md` §9** (nova, 107 linhas): §9.1 o vocabulário `declarado × silencioso`,
§9.2 **os 14 vãos** com regra · gate `arquivo:linha` · o que não vê · exposição medida · Δ · destino,
§9.3 a cadeia do nº 4, §9.4 por que o detector de `§N.N` ainda não sobe.

**Numeração preservada:** a matriz entrou como **§9**, ao final. Inserir no meio deslocaria §5–§8 e quebraria a
citação viva `01-gates §6.1` de `00-regras-e-invariantes.md:585`. Um ponteiro para a §9 foi acrescentado à §1.

**As três correções à matriz da Metade 1 foram aplicadas:** os 4 vãos que faltavam (11, 12, 13, 14) entraram;
**R19 saiu** da lista de vãos e está entre as regras limpas; e os "7 ponteiros mortos" foram reclassificados
para **4 vivos + 4 rastro** — as 4 citações em `specs/plan/` descrevem o que era verdade na execução daquela
plan, e plan é append-only.

### Verificações executadas

| | ANTES | DEPOIS |
|---|---|---|
| `auditor_hardcoded` | valor **1** · estrutural líquido **0** | **idêntico** |
| `auditor_ghostvars` — registro | **14.179** | **15.394** *(cresceu, como pedido)* |
| `auditor_ghostvars` — fantasmas | **3** | ⚠️ **2** — ver *Pendências* |
| `auditor_typescript` · `coverage` · `arquitetura` · `cleancode` | 0 · 0 · 0 · 0 | **idêntico** |
| `auditor_paridade` | **409/409/409** (416 brutos) | **idêntico** |
| `auditor_presets` | **120 itens**, 0 órfã | **idêntico** |
| `run_audit` | ❌ exit 1 — **2 auditores vermelhos** | **idêntico** |
| `npx vitest run` | 274 / 889 | **274 arquivos / 889 testes, 100% verde** |
| `npm run audit:baseline` | — | `MELHOROU … 3 -> 2`, **exit 0, não bloqueia** |

### Decisões e suposições

1. **Não regravei o baseline.** `npm run audit:baseline -- --write` faria o número virar 2 no arquivo
   versionado. A §6.1 desta spec desconfia, por princípio, de baseline que melhora sem conserto — e aqui **não
   houve conserto de código**. Houve conserto do **verificador**, que é a única razão legítima para o número
   cair, mas quem decide é o dono. O Anel 2 não bloqueia enquanto isso.
2. **A matriz entrou como §9, não no meio da spec** — numeração é identidade (item 1 acima).
3. **Não toquei em `specs/15-divida-conhecida.md`.** O §7 da plan prevê numerar os vãos abertos a partir de 32,
   mas a §5 fixou **três** entregas para a Metade 2, e essa não é uma delas. Os 12 vãos abertos estão na §9.2
   com destino, que é o que a `plan-12` consome. Registrado como pendência, não como esquecimento.

### Achados fora do escopo (não corrigidos)

- **Os 4 ponteiros de seção vivos** (`00-regras-e-invariantes §3.1` → hoje **§4.1**) continuam mortos em
  `.agents/skills/ui-auditoria-modulo/SKILL.md:140`, `ui-criar-tema/SKILL.md:95`,
  `ui-novo-componente/SKILL.md:123` e `specs/00-contexto.md:175`. Consertá-los é conteúdo dentro de um vão —
  §3.2 proíbe nesta plan. **São 4 edições de um caractere.**
- **Vão nº 11** (`.githooks/pre-push:53` sem `gates/`) é correção de **uma linha** e foi criado pela `plan-14`.
  Está roteado para a `plan-12`, mas é o item de maior razão valor/custo da lista.

### Pendências / riscos

- 🔴 **A contagem de fantasmas caiu de 3 para 2, contrariando o critério do prompt.** Não é regressão nem
  maquiagem: `manifest.ts:198` declara `buttonRadius: { vars: ['--button-radius', '--sarak-button-radius'] }`,
  então o consumo de `SarakShellNav.tsx:70` **sempre resolveu**. O veredito de "fantasma REAL" na §4.2 estava
  errado porque foi escrito olhando só o schema — **com a mesma cegueira que o registro do auditor tinha**. A
  ferramenta confirmava a leitura errada. Reclassifiquei a §4.2 e registrei a cadeia na §9.3.
  **Duas saídas, e a escolha é do dono:** (a) regravar o baseline para 2, aceitando que o gate ficou mais
  preciso; (b) manter 3 e conviver com o aviso `MELHOROU` até a `plan-12`.
- **O `--sarak-shell-brand-logo-size` é agora o único fantasma real do repositório**, e continua sendo
  Expansão (R11), não renomeação.


---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito (Metade 2) — 2026-08-03 — 🔴 Reprovado (0 achados — falta um comando)

**As três entregas estão certas. O critério que "não fechou" era MEU, e estava errado.** Reprovo só porque a
resposta à sua pergunta gera uma ação que ainda não foi executada — não há defeito no que você entregou.

### A queda 3 → 2 é correta, e eu conferi no código

Não aceitei o argumento: fui ver.

```
src/core/Provider/manifest.ts:198
  buttonRadius: { vars: ['--button-radius', '--sarak-button-radius'], unit: 'px' }

npm run audit  → Registro real: 15394 variáveis (era 14.179)
               → 2 variáveis-fantasma distintas, 2 consumos
npm run audit:baseline → MELHOROU: consumos 3 -> 2 (nada bloqueado)
```

`--sarak-button-radius` **sempre resolveu**. O baseline registrava uma **acusação falsa**, e a §4.2 da spec
documentava a explicação errada — *"escreveram `button` onde a engine emite `btn`"* — porque foi escrita
olhando só o schema, **com a mesma cegueira que o registro do auditor tinha**. A ferramenta confirmava a
leitura errada, e a leitura errada validava a ferramenta.

**Isso não é efeito colateral da plan: é o produto dela.** O vão nº 4 dizia que o registro lia 2 de 4 fontes;
a prova de que dizia a verdade é uma acusação falsa caindo sozinha quando as outras duas entraram.

**O meu critério estava mal escrito.** Eu disse *"número diferente reprova"*. O certo era **"número diferente
sem explicação medida reprova"** — a regra existia para pegar registro inflado escondendo fantasma real, que é
o oposto do que aconteceu. Oitava vez nesta campanha que escrevo um limite mais rígido do que o raciocínio que
o justifica.

### Decisão: **regravar o baseline para 2**

Você perguntou; respondo com o motivo, porque a §6.1 desconfiar de baseline que melhora sem conserto é uma boa
regra e ela merece ser satisfeita, não contornada:

1. **A desconfiança da §6.1 está satisfeita.** Ela existe para pegar melhora **inexplicada**. Esta tem causa
   nomeada (`manifest.ts:198`), mecanismo (registro de 2 → 4 fontes) e foi **reconferida pelo revisor no
   código**, não aceita pelo relato.
2. **Manter 3 abre um buraco.** O baseline é **teto**. Com 3, um fantasma **novo e real** pode aparecer e o
   gate não bloqueia — 2 → 3 continua dentro do teto. Manter o número inflado é literalmente reservar uma vaga
   grátis para a próxima regressão.
3. **O conserto foi no verificador, e é o que esta plan existia para fazer.** Baseline que não acompanha o
   verificador volta a medir a régua velha.

### O que verifiquei nas três entregas

| Entrega | Evidência |
|---|---|
| Registro ampliado | `14.179 → 15.394`; `CONSUMER_DIRS` intocado — **escopo não mudou**, só o registro |
| Limites declarados (vãos 9, 10) | com o número medido (zero) e o que muda a conta |
| Matriz | §9 de `01-gates-e-baseline`, ao final para não deslocar §5–§8 — há citação viva a `01-gates §6.1`. Cuidado certo |
| Correções aplicadas | vãos 11–14 entraram · R19 foi para as limpas · ponteiros viraram **4 vivos + 4 rastro** |
| §4.2 corrigida | a classificação errada foi **reclassificada em `:283-289`**, com o motivo — não apagada |
| Baseline restante | valor=1 · estrutural=0 · any/coverage/arquitetura/cleancode=0 · 409/409/409 · 120 presets · exit 1 |
| Suíte | 274 / 889 |

**A sua correção ao meu enunciado procede.** A família `-rgb` já era `GENERATED_SUFFIXES[0]`; o que faltava era
a **base** no registro — o sufixo só resolve `--theme-primary-rgb` se `--theme-primary` existir, e é o
manifesto que fornece. Meu prompt mandou "ensinar a família `-rgb`", que era diagnóstico errado. Escrever o
porquê ao lado da constante, em vez de código desnecessário, foi a resposta certa.

**A pendência declarada do §7 (numerar os vãos a partir de 32 em `15-divida-conhecida`) está aceita como
pendência**: a minha §5 fixou três entregas e essa não era uma. Vai junto com a síntese.

### Prompt de correção

```
Leia specs/00-prompt-executor.md e feche a Metade 2 de specs/plan/plan-06-auditoria-cobertura-gates.md.

Veredito de 2026-08-03: as três entregas estão APROVADAS. Zero achado no seu trabalho.
Falta executar a decisão do revisor sobre a pergunta que você abriu:

1. REGRAVAR O BASELINE para 2 consumos-fantasma:  npm run audit:baseline -- --write
   Motivo (registre-o no resumo, não só o comando): o baseline é TETO. Mantê-lo em 3 quando o real
   é 2 reserva uma vaga grátis para o próximo fantasma real — 2 -> 3 não bloquearia. A desconfiança
   da §6.1 está satisfeita: a melhora tem causa nomeada (manifest.ts:198), mecanismo (registro de
   2 para 4 fontes) e foi reconferida no código pelo revisor.

2. Confirme com `npm run audit:baseline` que ele volta a dizer "igual ao baseline", e cole a saída.

3. Se a §4.2 ou o §3 de 01-gates-e-baseline citarem "3 consumos" como baseline vigente, atualize o
   número — a spec não pode ficar dizendo 3 depois da regravação.

Escopo: EXCLUSIVAMENTE isso. Nenhum gate, nenhum escopo, nenhum conserto.

Acrescente "## Resumo da execução (correção 1) — AAAA-MM-DD" ao final. Status: "🟠 Em revisão".
Não commite. Devolva para revisão.
```

### Resíduos

- **`specs/00-contexto.md:175` (`§3.1` → `§4.1`): corrigido por mim nesta ação.** Era ponteiro morto vivo no
  arquivo de entrada, e o arquivo é meu.
- **Os 3 ponteiros nas skills** e o **vão nº 11** (`pre-push:53`) seguem para a `plan-12`, como roteado. Você
  tem razão sobre o valor/custo: são 4 edições de um caractere e uma linha.

---

## Resumo da execução (correção 1) — 2026-08-03

**Resultado:** Concluído

A pergunta que a Metade 2 deixou aberta foi respondida pelo revisor e executada. Escopo: **só isso** — nenhum
gate, nenhum escopo, nenhum conserto.

### 1. Baseline regravado

```
npm run audit:baseline -- --write
[audit:baseline] baseline regravado em gates/baselines/audit-baseline.json
[audit:baseline] COMMITE este arquivo junto do conserto que o justificou.
```

`gates/baselines/audit-baseline.json` — **uma métrica mudou, e só uma**:

| Campo | Antes | Depois |
|---|---|---|
| `medidoEm` | `2026-07-28` | **`2026-08-03`** |
| `auditor_ghostvars.consumos` | `3` | **`2`** |
| `auditor_hardcoded` (`valor` · `estruturalLiquido`) | 1 · 0 | **1 · 0** |
| `typescript` · `coverage` · `arquitetura` · `cleancode` · `paridade` · `presets` | 0 | **0** |
| `tsc.erros` | 14 | **14** |

**O motivo, escrito para quem for ler o diff daqui a seis meses — porque o comando sozinho não o explica:**

> **O baseline é TETO, não retrato.** Mantê-lo em 3 quando o real é 2 reservaria uma **vaga grátis**: o próximo
> fantasma real levaria a contagem de 2 para 3 e **não bloquearia nada**. Um teto folgado é um gate desligado
> pela metade — e teria sido pior que o problema original, porque ninguém desconfia de um número que "sempre
> esteve ali".

**A desconfiança da §6.1 está satisfeita, e é assim que se satisfaz** — não por confiança, por evidência:

- **causa nomeada:** `src/core/Provider/manifest.ts:198` declara
  `buttonRadius: { vars: ['--button-radius', '--sarak-button-radius'] }`;
- **mecanismo nomeado:** o registro do `auditor_ghostvars` passou de **2 para 4** fontes emissoras;
- **reconferência independente:** o revisor reabriu o código e confirmou antes de autorizar.

Nenhum código de produto foi consertado nesta rodada. O que foi consertado é o **verificador** — a única razão
legítima para este número cair.

### 2. Confirmação

```
npm run audit:baseline
[audit:baseline] igual ao baseline de 2026-08-03 — nenhuma regressão.
```

Exit **0**. O Anel 2 deixou de emitir `MELHOROU … 3 -> 2` e voltou a ser uma comparação limpa.

### 3. A spec alinhada

| Onde | O que mudou |
|---|---|
| `01-gates-e-baseline.md:132` (§3) | `3 consumos … registro de 14.179` → **`2 consumos … 15.394`**, com a linha do que mudou e por quê |
| `01-gates-e-baseline.md:148` (§3) | `audit:baseline` → *"igual ao baseline de **2026-08-03**"* |
| `01-gates-e-baseline.md` §4.2 | a nota dizia que o arquivo *"continua em 3"* e que regravar *"é decisão do dono"* — **estava obsoleta na hora em que a decisão saiu**. Reescrita com o argumento do teto e as três evidências |

**Verificação:** `grep` por `3 consumos` / `baseline de 2026-07-28` como valor **vigente** → nenhuma ocorrência.
A única menção ao 3 que restou é histórica e está rotulada como tal.

### Decisões e suposições

- Nenhuma. A decisão era do revisor e veio escrita; esta rodada é execução.

### Achados fora do escopo (não corrigidos)

- **`01-gates-e-baseline.md` §4.3.a e §4.3.b** ainda trazem os números da sonda antiga — *"29 variáveis / 43
  consumos"* em `src/styles/` e *"7 / 20"* em `src/core/`. Foram medidos com o **registro incompleto**, e a
  §9.2 desta mesma spec agora traz os números com o registro completo: **16 / 24** e **4 / 11**. Os dois pares
  convivem no mesmo documento e o leitor não tem como saber qual vale. Não toquei: o escopo desta correção era
  exclusivamente o baseline vigente. **Sugestão: plan nova, ou junto da `plan-12`**, que já vai mexer nesses
  vãos.

### Pendências / riscos

- **`gates/baselines/audit-baseline.json` precisa ser commitado JUNTO** da ampliação do registro em
  `auditor_ghostvars.mjs`. Separados, o commit do baseline sozinho vira exatamente o que a §6.1 proíbe: um
  número que melhora sem conserto visível no mesmo diff.

## Veredito (correção 1) — 2026-08-03 — 🟢 Aprovado

**Fechada. A `plan-06` está aprovada.**

| Verificação | Minha medição |
|---|---|
| Diff do baseline | **exatamente 2 linhas**: `consumos: 3 → 2` e `medidoEm: 2026-07-28 → 2026-08-03`. `valor: 1`, `estruturalLiquido: 0`, `tsc.erros: 14` e os seis zeros **intactos** |
| Confirmação | `[audit:baseline] igual ao baseline de 2026-08-03 — nenhuma regressão`, **exit 0**. O `MELHOROU` sumiu |
| Spec alinhada | `:132` com 2 consumos / registro 15.394 e o `3` rotulado como histórico · `:148` na data nova · a nota da §4.2 reescrita |
| `grep` de número obsoleto vigente | nenhuma ocorrência |

**O motivo foi escrito, não só o comando** — *"o baseline é teto, não retrato"*. É a frase que faltava na §6.1
e que impede a próxima pessoa de reabrir a discussão.

### O achado fora do escopo: resolvido por mim, agora

Você viu certo, e a decisão de não tocar foi correta — o escopo era o baseline vigente. Mas **não mando para a
`plan-12`**: um documento que traz `29/43` na §4.3.a e `16/24` na §9.2, sobre a mesma coisa, **mente para quem
lê hoje**, e ficaria mentindo por cinco plans.

Reconciliei a §4.3 com um bloco no topo: os números de lá são de 2026-07-27, foram medidos com o registro
incompleto, e **a §9.2 é o que vale**. A seção **fica** — porque a diferença entre os dois pares **é a medida do
vão nº 4**, a prova quantitativa de que ampliar escopo sem ampliar registro produziria ~85 acusações falsas.
Número velho com data e motivo é histórico; número velho sem rótulo é mentira.

### O risco de commit que você levantou — e ele é o mais importante desta rodada

> *"`audit-baseline.json` precisa entrar no mesmo commit que a ampliação do registro em `auditor_ghostvars.mjs`.
> Separados, o baseline sozinho vira exatamente o que a §6.1 proíbe — um número que melhora sem conserto visível
> no diff."*

**Está certo, e é a lição que sobrevive a esta plan.** O `audit:baseline` compara número contra número; ele não
sabe ler intenção. O que distingue "regravei porque consertei o verificador" de "regravei porque o vermelho
incomodava" **não é o gate — é a atomicidade do commit**. Registrado na mensagem ao dono.

---

## Fecho da plan-06

**A investigação entregou o que se pedia dela:** a matriz das **29 regras verificáveis**, **14 vãos** com
exposição medida e destino nomeado, e a §9 permanente de [[01-gates-e-baseline]] que é a **lista de compras da
`plan-12`** — ~21 itens, contra os 9 que a spec de dívida previa.

**O que ela provou, e vale além dela:**

1. **O vão nº 4 era o mais perigoso, e a prova é quantitativa.** 36/128 → 22/109 → 16/24. A advertência do
   §4.3.c era prosa; agora é número.
2. **A ferramenta confirmava a leitura errada.** `--sarak-button-radius` foi classificado como fantasma REAL
   numa spec **porque quem escreveu olhou só o schema — a mesma cegueira do registro do auditor**. Gate
   incompleto não só deixa passar: ele **produz** documentação falsa que parece verificada.
3. **A classe do ponteiro morto é reincidente e imune a atenção humana.** Achado 30, depois a plan-13, depois a
   plan-14 — três entregas seguidas, duas delas passando pelo meu veredito.

**Resíduo declarado:** os vãos não fechados **não** foram numerados a partir de 32 em [[15-divida-conhecida]].
Foi decisão minha ao fixar três entregas para a Metade 2 — a matriz da §9 cumpre o papel de lista, e a
numeração entra na síntese.

**Destino da síntese:** `specs/01-gates-e-baseline.md` (a matriz, §9 — **já escrita**) ·
`specs/15-divida-conhecida.md` (os vãos a numerar) · `specs/00-regras-e-invariantes.md` (R15 reavaliada e
mantida como conduta — **já escrito**)

**Liberado: pode commitar.**

---

## Síntese — 2026-08-07

Sintetizada em: `specs/specs/15-divida-conhecida.md` (achado 32 novo, achado 29 com a metade de gate fechada) ·
`specs/specs/01-gates-e-baseline.md` §9 (já escrita por esta execução; recontada agora nas plans 12/16) ·
`specs/specs/00-regras-e-invariantes.md` (já escrito).

Observações: os 14 vãos que esta plan mapeou foram consumidos pelas plans 12 e 16, que fecharam 12 deles.
Nada desta plan ficou de fora.
