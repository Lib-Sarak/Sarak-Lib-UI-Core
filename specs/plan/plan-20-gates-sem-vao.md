---
tipo: "plan"
titulo: "Gates sem vão — fechar o escopo de R14, R17, R23 e R7 sem tocar em src/"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "gates", "r7", "r14", "r17", "r23"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[00-indice]]", "[[plan-17-calibrar-gates-por-falso-positivo]]"]
depende_de: "plan-19"
destino_sintese: "specs/specs/00-regras-e-invariantes.md · specs/specs/01-gates-e-baseline.md · specs/00-indice.md"
---

> 🔒 **Esta plan NÃO paga dívida.** Ela conserta o **verificador**. Violação real acesa por um detector novo é
> da `plan-21` — pagar aqui mistura as duas coisas e é exatamente o que a separação `plan-15`/`plan-17` provou
> valer a pena.
>
> ⚠️ **Dois dos quatro detectores nascem VERMELHOS de propósito.** Isso é o desenho, não falha.

# 1. Objetivo

**Quatro regras deixam de ter escopo menor que o enunciado.** Ao final, o quadro de
[[00-regras-e-invariantes]] sai de **21 ✅ / 7 ⚠️** para **25 ✅ / 3 ⚠️**.

# 2. Contexto — o que foi medido, regra a regra

## 2.1 R14 — componente em subpasta escapa do barril

**O defeito:** `scripts/publicComponents.mjs` varre só a **raiz** de cada categoria. Componente em subpasta não
é visto, não entra no barril, e **o consumidor não consegue importá-lo** — sem nada acusar.

**A saída NÃO é varredura recursiva.** A base já usa subpasta como sinal de **privacidade**, e isso não é
acidente — é como as fronteiras lazy são construídas:

```
atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx
features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl.tsx
atomic/Inputs/internal/
```

Varrer recursivamente **publicaria os `Impl`** — o oposto do que se quer.

**Decisão do dono (2026-08-09): opção (c) — virar regra.** *"Componente público mora na RAIZ da categoria;
subpasta é peça interna."* O vão vira fronteira **intencional**, e o gate deixa de ter vão porque passa a
cobrar uma regra escrita. Componente público que apareça em subpasta **muda de lugar**, não muda o gate.

## 2.2 R17 — o `00-indice` é a última tabela transcrita à mão

`00-indice` §1 é a única tabela derivada da base ainda mantida manualmente. **Travou o commit do dono duas
vezes** — a segunda em 2026-08-09, com `plan-index:check` acusando `índice=🟡 × frontmatter=🟠`.

**A causa é estrutural, não de disciplina.** O gate compara duas fontes mantidas por **atores diferentes em
momentos diferentes**: o executor move o frontmatter ao entregar; o índice só se move quando o revisor está
presente. Entre um e outro o repositório fica, por construção, incommitável — e ninguém escolheu isso.

**A saída é a que esta base já usa cinco vezes:** gerar e conferir.

| Gerador | Fonte | `--check` |
|---|---|---|
| `generate-component-catalog.mjs` | o código | `catalog:check` |
| `generate-consumer-kit.mjs` | os tokens | `guide:check` |
| `generate-dev-kit.mjs` | o repositório | `dev-kit:check` |
| `generate-token-types.ts` | os schemas | `token-types:check` |
| `generate-build-info.mjs` | o build | `build-info:check` |
| **`generate-plan-index.mjs`** *(a criar)* | **o frontmatter das plans** | `plan-index:check` |

É **R29 aplicada ao próprio índice**, e a R17 (*não transcrever fonte viva*) já proíbe o que existe hoje.

### 🔴 O MECANISMO, decidido — não deixe o executor inventar

*(Lacuna apontada e fechada pelo revisor em 2026-08-09. Sem esta seção o executor teria pelo menos três
implementações incompatíveis à escolha, e a errada destrói as colunas do revisor.)*

**A pergunta difícil não é "gerar" — é como um script reescreve UMA coluna dentro de uma tabela markdown cujas
outras colunas são editoriais.** A resposta: **ele não reescreve uma coluna. Reescreve a tabela inteira**, e
para isso todas as células precisam ter fonte.

**Medição: 4 das 6 colunas já são deriváveis hoje.**

| Coluna | Fonte | Existe? |
|---|---|---|
| `Plan` | nome do arquivo em `specs/plan/` | ✅ |
| `Depende de` | frontmatter `depende_de` | ✅ |
| `Status` | frontmatter `status` | ✅ |
| `Destino` | frontmatter `destino_sintese` | ✅ |
| `Objetivo` | — | ❌ **precisa de campo novo** |
| `#` | — | ❌ **é decisão, não dado** |

**O desenho, em três peças:**

1. **Bloco marcado.** A tabela de §1 passa a viver entre `<!-- SARAK-INDICE:FILA:INICIO -->` e
   `<!-- SARAK-INDICE:FILA:FIM -->`. **Este idioma já existe nesta base** — `sarak-dev/GUIA-MANUTENCAO.md` usa
   `<!-- SARAK-DEV:APENDICE-GERADO:INICIO -->` para exatamente isto. O gerador só toca no que está entre os
   marcadores; o resto do arquivo — os blocos `> **Como escrever:**`, a §2, a §5 — é do revisor e **nunca** é
   reescrito.

2. **`objetivo` vira campo de frontmatter** em cada plan, uma linha no infinitivo. Custo: **9 plans a tocar**,
   uma linha cada. Ganho: a plan passa a **ser dona da própria descrição**, que é onde ela deveria estar — a
   §1 de cada plan já se chama "Objetivo". Enquanto o campo faltar, o gerador **falha com o nome da plan**,
   nunca inventa texto nem deixa a célula vazia.

3. **A ordem (`#`) continua sendo do revisor, e é preservada.** O gerador lê a ordem dos slugs **do bloco
   atual**, regenera as linhas naquela ordem, e **acrescenta ao fim** qualquer plan nova que ainda não esteja
   listada. Reordenar = o revisor troca duas linhas de lugar e roda o gerador; o conteúdo se corrige sozinho.

> ⚠️ **O que NÃO fazer, e por quê:** *"o gerador faz merge, preservando o texto editorial de cada célula"*
> parece mais barato e é a pior das opções — merge em markdown é heurístico, quebra em silêncio quando alguém
> reformata a tabela, e devolve o problema de origem: duas fontes para a mesma célula.

**Sinal de que a implementação está certa:** apagar a tabela inteira do `00-indice` §1 e rodar
`npm run plan-index` reconstrói a fila com a ordem alfabética dos slugs restantes e **nenhuma perda de dado** —
porque não havia dado ali que não estivesse na fonte.

## 2.3 R23 — cobertura de 271 de 455 ponteiros (60%)

O gate decide, para cada `§N.M`, entre **validar** (271), **ignorar** como cross-documento (184) e **acusar**
(1). Duas causas independentes encolheram a fatia validada:

**Causa 1 — não distingue menção de referência.** Em `01-gates-e-baseline.md:572`, `§7.3` é a **notação sendo
definida**, não um ponteiro. Medição do corpus inteiro: existem **exatamente 4** `§N.M` dentro de crase
(`01-gates:164`, `01-gates:572`, `15-divida:70`, `15-divida:137`) e **os quatro são citação**. A regra
*"dentro de crase é citação"* custa 4 isenções verificáveis e **zera o vermelho**.

**Causa 2 — a regra de linha vizinha é larga demais.** Criada pela `plan-17` para 2 casos; custou **16
ponteiros** de cobertura, e entre eles há autorreferência legítima que o gate deixou de olhar:

```
00-contexto.md:172                "A coluna Capacidade da §4"
02-enforcement-por-commit.md:303  "nunca vão para hook (§4.1)"
02-enforcement-por-commit.md:305  "O escape da §7"
```

**Dos 2 casos que a regra comprou, 1 nem precisava dela:** `11-testes:113` cita `plan/20 §2.3` — `plan/NN` é
qualificador de documento perfeitamente reconhecível, e o `§` só foi salvo por acidente, pelo wikilink da
linha de baixo. Reconhecendo `plan/NN`, sobra **1 caso** de verdade, e aí dá para estreitar a vizinhança.

### 🔴 O CRITÉRIO do estreitamento, decidido

*(Segunda lacuna fechada pelo revisor em 2026-08-09: a plan dizia "estreite" sem dizer para quê.)*

**O caso único que sobra é `00-indice.md:64`:**

```
> **A `plan-06` ...** Ela está na **§9 de
> [`01-gates-e-baseline`](specs/01-gates-e-baseline.md)**: a matriz com os 14 vãos ...
```

A linha **termina em "de"** — a frase não fechou, e o qualificador caiu na linha seguinte. **É esse o padrão, e
é ele que a regra deve reconhecer**, não "vizinhança" em geral:

> **Consultar a linha SEGUINTE apenas quando a linha atual não termina a frase** — isto é, quando ela acaba
> sem pontuação terminal (`.` `:` `;` `!` `?` `|`) e sem fechar a célula de tabela. Continuação de linha é o
> fenômeno real; "vizinhança" era uma aproximação larga demais dele.

**A linha ANTERIOR sai do escopo por padrão.** Nos dois casos que motivaram a regra o qualificador está
**depois**, nunca antes. **Meça as duas metades separadamente** antes de remover: se a metade "linha anterior"
não resolver nenhum ponteiro sozinha, ela sai; se resolver algum, relate quantos e qual, e mantenha só o que
comprar caso real.

**O alvo é numérico, não qualitativo:** validados de **271 → ~287** de 455. **Se a cobertura cair, o conserto
está errado** — pare e relate em vez de seguir.

## 2.4 R7 — dois vãos, os dois medidos

### Vão 1 — não valida a SINTAXE do fallback

O gate confere o **nome**; nunca o que vem depois da vírgula. Foi assim que `SidebarNav:142` passou anos com
`var(--theme-primary-rgb,59,130,246)/10` — nome certo, fallback inválido, declaração inteira caindo por IACVT.

> 🔴 **A regra ingênua daria falso positivo, e isso foi TESTADO.** *"Tripla RGB crua no fallback é inválida"*
> acusaria **8 ocorrências corretas** de hoje, todas na forma
> `rgba(var(--theme-error-rgb, 239, 68, 68), 0.4)`.

**A regra precisa:** um `var()` cujo fallback é tripla numérica crua **tem de estar lexicalmente dentro de uma
função de cor** (`rgb(`, `rgba(`, `color(`, `color-mix(`). Fora dela, o valor é inválido.

- No caso histórico do `SidebarNav`: **acusa**, corretamente.
- Nas 8 de hoje: **nenhuma**.
- **Exposição hoje: ZERO.** Este detector nasce **verde** — pega o próximo, não um backlog.

### Vão 2 — nome que o manifesto declara e o runtime nunca emite

O registro do `auditor_ghostvars` trata declaração em `manifest.ts` como prova de existência. **Não é.**
Cruzamento das três fontes, feito pelo revisor em 2026-08-09:

| Medida | Valor |
|---|---|
| Entradas do manifesto com lista de `vars` | **103** |
| Sem token de mesmo `id` em schema **e** sem nenhuma var emitida | **27** |
| Nomes de variável que essas 27 declaram | **39** |
| Desses, **já consumidos** hoje | **7 nomes · 21 consumos** |

```
  9x  --sarak-button-radius        1x  --sarak-button-hover
  5x  --font-tab                   1x  --animation-speed
  2x  --font-subtitle              1x  --sarak-button-active-color
  2x  --sarak-elasticity
```

**A correção:** uma entrada do manifesto só conta como fonte se **(a)** existe token de mesmo `id` em algum
schema, **ou (b)** alguma de suas vars é comprovadamente emitida. As 27 saem do registro.

**Este detector nasce VERMELHO com 21 consumos**, e pagá-los é a `plan-21`.

> **Achado de brinde, para a `plan-21`:** a entrada `headingWeight` lista `var(--sarak-h1-weight,700)` **como
> se fosse nome de variável** — um `var()` inteiro dentro do array de nomes. Defeito no próprio manifesto.

# 3. Escopo

## 3.1 Dentro

| # | Regra | Entrega | Nasce |
|---|---|---|---|
| 1 | **R14** | a regra da raiz escrita, e o gate cobrando-a | verde |
| 2 | **R17** | `generate-plan-index.mjs` + `--check`; a coluna `Status` do `00-indice` §1 vira gerada | verde |
| 3 | **R23** | `§N.M` em crase é citação · `plan/NN` é qualificador · vizinhança estreitada | **zera o vermelho** |
| 4 | **R7a** | fallback de tripla crua fora de função de cor | verde (exposição 0) |
| 5 | **R7b** | registro deixa de aceitar entrada órfã do manifesto | 🔴 **vermelho, 21 consumos** |
| 6 | **R10** | estreitar para o `<input>` oculto acionado por programa | zera `composicaoatomica` |

## 3.2 Fora

- **Pagar os 21 consumos** e limpar as 27 entradas órfãs — é a `plan-21`.
- **Qualquer arquivo de `src/`**, com **uma exceção nomeada**: o item condicionado da §3.4 (migrar
  `Controls.tsx` e `SarakDrawer.tsx` para o `SarakScrim`, e o eventual movimento do próprio `SarakScrim`).
  Fora dele, `git diff -- src/` sai **vazio** — e o `ChatInput` deixar de ser acusado é efeito do gate, não
  edição.
- R4, R30 e R31 — não são desta plan.

## 3.3-bis ⇒ DUAS DECISÕES DO DONO, herdadas da `plan-19` (2026-08-09)

A execução da `plan-19` produziu dois achados que **mudam o escopo desta plan**. Nenhum é do executor.

### Achado A — a fronteira da R10 por PASTA está moldando a arquitetura

Duas vezes na mesma plan, a R10 decidiu onde um componente mora: o `SocialButton` **mudou de pasta** e o
`SarakScrim` **nasceu numa pasta** por causa dela. O primeiro é feliz — um botão social é um botão. **O segundo
não: um scrim não é um botão**, é elemento de layout que *usa* um botão.

**Proposta do revisor — a fronteira passa de PASTA para PAPEL:**

> A R10 não se aplica ao componente **cuja razão de existir é encapsular um controle nativo** —
> independentemente da pasta. Um átomo não pode compor a si mesmo, e é isso que a exclusão sempre quis dizer;
> `atomic/Buttons`/`atomic/Inputs` era só a aproximação disponível.

Com esse critério: `SarakScrim` volta para `atomic/Layouts/` e continua legítimo, porque **é** o
encapsulamento de um `<button>`. A pasta deixa de ser o que decide.

**⇒ DECISÃO DO DONO, e ela é de duas partes:** (1) a fronteira vira por papel? (2) em caso afirmativo, o
`SarakScrim` **muda de categoria** — e ele já está publicado (`src/index.ts:18`, 87 entradas no catálogo do
consumidor). Não quebra import (barril de raiz única, R27), mas muda a documentação que o consumidor lê.
**Quanto mais cedo, mais barato.**

### Achado B — a allowlist do `auditor_hardcoded` é chaveada por CAMINHO

Mover o `SocialButton` invalidou 4 entradas da allowlist de uma vez, porque a chave é
`caminho::valor`. O executor da `plan-19` teve de tocar o gate — cruzando uma linha vermelha — só para
**preservar** o que já estava lá. Medido: 4 removidas, 4 adicionadas, zero alargamento.

**O defeito é a chave.** Ela quebra em silêncio a cada `git mv`, e nenhuma plan que mova arquivo vai adivinhar
isso de antemão. **Proposta:** a chave passa a ser algo que sobreviva ao movimento — marcador no próprio
arquivo (comentário `sarak-allow:` na linha), ou o par `nome-do-arquivo::valor` sem o diretório.

**⇒ DECISÃO DO DONO:** qual chave, e se isto entra nesta plan ou vira item próprio. **Recomendo entrar aqui**
— é conserto de verificador, o tema exato desta plan, e a exposição é de 4 entradas.

## 3.4 A continuação herdada da `plan-19` — CONDICIONADA, e é o único item que toca `src/`

A `plan-19` criou o `SarakScrim` e deixou **duas cópias manuais do mesmo conceito** fora do escopo, nomeadas
como continuação (§3.2 dela):

| Onde | Forma hoje |
|---|---|
| `atomic/Inputs/Controls.tsx:124` | `motion.div fixed inset-0 z-40` com `onClick` |
| `atomic/Modals/SarakDrawer.tsx:103` | `div fixed inset-0 transition-opacity` |

**Elas foram o argumento que justificou criar o componente.** Se ninguém as migrar, a lib fica com um
`SarakScrim` **e** duas reimplementações à mão — pior do que antes de o componente existir, porque agora há
três formas e uma delas se chama "a oficial".

> ⚠️ **ESTE ITEM É CONDICIONADO, e a condição não é burocracia.** Ele só executa **depois** da decisão do
> achado A (§3.3-bis). Motivo: se a fronteira da R10 virar por papel, o `SarakScrim` **muda de
> `atomic/Buttons/` para `atomic/Layouts/`**. Migrar os dois consumidores antes disso significa escrever o
> import duas vezes, e a segunda numa plan que não é esta.
>
> **Ordem obrigatória:** decisão do achado A → o `SarakScrim` assume o endereço definitivo → **só então** os
> dois consumidores migram, num movimento só.

**Se o dono mantiver a fronteira por pasta**, o `SarakScrim` fica onde está e este item executa na mesma
rodada, sem espera.

**Risco a caracterizar antes:** os dois usam formas diferentes de backdrop — um com `motion.div` (animação de
opacidade), outro com `transition-opacity`. O `SarakScrim` de hoje **não anima**. Trocar sem verificar
**remove animação existente**. ⇒ Se o `SarakScrim` precisar ganhar prop de animação, isso é **superfície
pública nova** — PARE e relate, não decida.

## 3.3 O item 6, e por que ele é conserto de REGRA

`ChatInput.tsx:117` é `<input type="file" ref={fileInputRef} className="hidden" />`, disparado por `.click()`
de um `SarakIconButton` logo abaixo. **Não é campo: é mecanismo.**

**Decisão do dono: estreitar a regra, não criar exceção.** A R10 fala de *composição atômica* — de elemento
que o usuário **vê e opera**. Um `<input>` com `className="hidden"` acionado por programa não é composição, é
API do navegador. **Escrever isso na regra vale para todos os casos futuros; allowlist valeria só para este.**

O texto da regra é do revisor, na síntese. **O executor implementa o detector e relata a redação que assumiu.**

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Spec fixa | [[00-regras-e-invariantes]] → R7, R10, R14, R17, R23 | os cinco enunciados |
| Spec fixa | [[01-gates-e-baseline]] §6.3 | **não contorcer prosa para satisfazer detector** |
| Plan | [[plan-17-calibrar-gates-por-falso-positivo]] §3.3 e §3.4 | o teste calibração × afrouxamento, e a exigência de declarar todo ponto cego |
| Arquivo | `00-indice.md` §2 | quais colunas são editoriais e quais podem ser geradas |
| **Skill** | `padrao-typescript` · `test-unitario` | gate novo nasce com self-test |

# 5. Instruções de execução

1. **Um detector por vez, com self-test próprio** — um caso pego, um liberado. É o padrão da `plan-12` e da
   `plan-17`.
2. **Todo alargamento de IGNORE abre ponto cego, e ele vai DECLARADO no código** (R18), **com o número**. A
   `plan-17` declarou "sub-cobertura" sem magnitude e o revisor teve de medir depois — não repita.
3. **A R23 tem de melhorar a cobertura, não só zerar o vermelho.** Reporte os dois números: validados antes e
   depois. Esperado: de **271** para **~287** de 455. Se a cobertura cair, o conserto está errado.
4. **O detector da R7b nasce vermelho.** Regrave o baseline com o número medido e **não pague nada**.
5. `gate-limits:check` verde ao final: todo gate tocado declara o que não vê.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-20-gates-sem-vao.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md, specs/specs/01-gates-e-baseline.md (§6.3),
specs/plan/plan-17-calibrar-gates-por-falso-positivo.md (§3.3 e §3.4), e a §2 desta plan.
Skills: padrao-typescript, test-unitario, padrao-escrita.

Esta plan conserta VERIFICADOR. Você NÃO paga nenhuma violação — nem uma.
`git diff -- src/` tem de sair VAZIO ao final. Pagar é a plan-21.

SEIS ITENS. Um por vez, cada um com self-test (um caso pego, um liberado):

1. R14 — o gate passa a cobrar "componente público mora na RAIZ da categoria;
   subpasta é peça interna". NÃO torne a varredura recursiva: isso publicaria os
   *Impl (SarakPDFViewerImpl, CustomizationPanelImpl), que são fronteira lazy.
   Nasce verde.

2. R17 — crie generate-plan-index.mjs com --check, e ligue plan-index:check nele.
   ⇒ O MECANISMO ESTÁ DECIDIDO NA §2.2 DESTA PLAN. Leia antes de escrever a
     primeira linha — sem ele há três implementações incompatíveis à escolha, e a
     errada destrói as colunas do revisor. Em resumo:
       · a tabela inteira é GERADA, dentro de um bloco
         <!-- SARAK-INDICE:FILA:INICIO --> … <!-- SARAK-INDICE:FILA:FIM -->
         (mesmo idioma de sarak-dev/GUIA-MANUTENCAO.md);
       · `objetivo` vira campo de frontmatter nas 9 plans (uma linha, infinitivo);
         faltando o campo, o gerador FALHA nomeando a plan — nunca inventa texto;
       · a ORDEM vem do bloco atual e é preservada; plan nova entra no fim.
     NÃO faça merge célula a célula. Está explicado por que na §2.2.
   Nasce verde.

3. R23 — três consertos no check-section-pointers:
   (a) §N.M DENTRO DE CRASE é citação, não ponteiro. São exatamente 4 no corpus,
       os quatro citação. Zera o vermelho.
   (b) `plan/NN` passa a ser qualificador de documento reconhecido.
   (c) com (b) no lugar, ESTREITE a regra de linha vizinha. O CRITÉRIO está
       decidido na §2.3 desta plan — não invente heurística:
         · consultar a linha SEGUINTE só quando a atual NÃO termina a frase
           (sem pontuação terminal . : ; ! ? | e sem fechar célula de tabela).
           Continuação de linha é o fenômeno real; "vizinhança" era aproximação;
         · a linha ANTERIOR sai por padrão — meça as duas metades SEPARADAMENTE
           antes de remover, e se a metade "anterior" resolver algum ponteiro
           sozinha, relate quantos e qual em vez de apagá-la.
   ⇒ REPORTE OS DOIS NÚMEROS: validados antes (271) e depois (esperado ~287 de 455).
     Se a cobertura CAIR, o conserto está errado — pare e relate.

4. R7a — no auditor_ghostvars: um var() cujo fallback é tripla numérica crua
   precisa estar lexicalmente dentro de rgb(/rgba(/color(/color-mix(.
   ⚠️ O revisor TESTOU a regra ingênua e ela dá falso positivo: existem 8
   ocorrências CORRETAS hoje, na forma rgba(var(--theme-error-rgb, 239, 68, 68), 0.4).
   Seu self-test PRECISA ter uma delas como caso liberado. Exposição esperada: ZERO.

5. R7b — o registro para de aceitar entrada do manifesto como prova de existência.
   Uma entrada só conta se (a) existe token de mesmo id em algum schema, OU
   (b) alguma de suas vars é comprovadamente emitida.
   Medido pelo revisor: 103 entradas com vars, 27 órfãs, 39 nomes, 7 já consumidos
   em 21 consumos. ESTE NASCE VERMELHO — regrave o baseline e NÃO pague nada.

6. R10 — estreitar: <input> oculto (className/estilo que o esconde) acionado por
   programa não é composição atômica, é API do navegador. Fecha ChatInput.tsx:117.
   Você implementa o detector e RELATA a redação que assumiu; o texto da regra é
   do revisor, na síntese.

R18 — TODO alargamento de IGNORE abre ponto cego, e ele vai declarado no código
COM O NÚMERO. A plan-17 escreveu "sub-cobertura" sem magnitude e o revisor teve
de medir depois. Não repita.

LINHAS VERMELHAS:
  · git diff -- src/ VAZIO.
  · Você NÃO edita specs/specs/, specs/adr/, specs/arquitetura/ nem 00-indice.md
    À MÃO — o item 2 gera a coluna Status por script, o que é outra coisa.
  · Nenhuma allowlist, nenhum carve-out.

VERIFICAÇÕES, com a saída colada:
  npm run audit           (ANTES e DEPOIS, por auditor)
  npx vitest run          (INTEIRA)
  npm run gate-limits:check
  npm run plan-index:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Baseline regravado JUNTO. Não commite. Ao terminar, escreva o resumo na própria
plan e mova o status para 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] `git diff -- src/` **vazio**, salvo o item condicionado da §3.4. Nenhuma violação paga aqui.
- [ ] **§3.4:** ou a migração de `Controls.tsx`/`SarakDrawer.tsx` foi feita **depois** do endereço definitivo
      do `SarakScrim`, ou está **declarada como não executada com o motivo** — nunca esquecida.
- [ ] Se o `SarakScrim` mudou de pasta, o barril e o catálogo do consumidor acompanharam, e
      `barrel:check`/`guide:check` estão verdes.
- [ ] Os 6 detectores têm **self-test** com um caso pego e um liberado.
- [ ] O self-test da **R7a** inclui, como caso **liberado**, uma das 8 formas corretas
      (`rgba(var(--x-rgb, N,N,N), a)`).
- [ ] **R23 reporta cobertura antes e depois**, e ela **sobe**. Vermelho em 0.
- [ ] **R7b nasce vermelho**, com o número medido no baseline e **nada pago**.
- [ ] `composicaoatomica` = **0**, e a redação assumida para a R10 está no resumo.
- [ ] `plan-index:check` passa a comparar **gerado × arquivo**.
- [ ] **Prova do gerador de índice:** apagar a tabela inteira de `00-indice` §1 e rodar `npm run plan-index`
      reconstrói a fila **sem perda de dado** — porque não havia dado ali fora da fonte. Cole a saída.
- [ ] O gerador **só** toca entre os marcadores; os blocos `> **Como escrever:**`, a §2 e a §5 do `00-indice`
      saem **byte a byte iguais** de uma regeneração.
- [ ] As 9 plans ganharam `objetivo` no frontmatter, e o gerador **falha nomeando a plan** se algum faltar.
- [ ] Todo gate tocado declara o **ponto cego novo com número**; `gate-limits:check` verde.
- [ ] `npx vitest run` verde.

# 8. Como verificar

```bash
git diff -- src/                 # tem de sair vazio
npm run audit                    # composicaoatomica 0; ghostvars sobe (esperado)
npm run plan-index:check
npm run gate-limits:check
npx vitest run
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
```

# 9. Destino da síntese

`specs/specs/00-regras-e-invariantes.md` (R7, R10, R14, R17, R23 mudam de estado e de texto) ·
`specs/specs/01-gates-e-baseline.md` (o baseline e a matriz de vãos) ·
`specs/00-indice.md` §2 (quais colunas são geradas).

# 10. Resumo da execução

*(a preencher pelo executor)*

# 11. Veredito

*(a preencher pelo revisor)*
