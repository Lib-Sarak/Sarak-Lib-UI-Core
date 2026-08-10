---
tipo: "plan"
titulo: "Gates sem vão — fechar o escopo de R14, R17, R23 e R7 sem tocar em src/"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "gates", "r7", "r14", "r17", "r23"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[00-indice]]", "[[plan-17-calibrar-gates-por-falso-positivo]]"]
depende_de: "plan-19"
destino_sintese: "specs/specs/00-regras-e-invariantes.md · specs/specs/01-gates-e-baseline.md · specs/00-indice.md"
objetivo: "Fechar o escopo de R14, R17, R23 e R7 — sem tocar em src/"
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
| 6 | **R10** | estreitar para o `<input>` oculto acionado por programa | fecha o `ChatInput` |
| 7 | **R10** | **A1** — fronteira passa de pasta para papel, via `@sarak-encapsula <tag>` | 🔴 **vermelho novo, a medir** |
| 8 | **R2** | **B1** — allowlist vira marcador no arquivo; `VALUE_ALLOWLIST` some | verde (4 entradas migram) |
| 9 | — | `SarakScrim` volta para `atomic/Layouts/` (habilitado pelo item 7) | — |
| 10 | — | §3.4: `Controls.tsx` e `SarakDrawer.tsx` passam a usar o `SarakScrim` | — |

## 3.2 Fora

- **Pagar os 21 consumos** e limpar as 27 entradas órfãs — é a `plan-21`.
- **Qualquer arquivo de `src/`**, com **uma exceção nomeada**: o item condicionado da §3.4 (migrar
  `Controls.tsx` e `SarakDrawer.tsx` para o `SarakScrim`, e o eventual movimento do próprio `SarakScrim`).
  Fora dele, `git diff -- src/` sai **vazio** — e o `ChatInput` deixar de ser acusado é efeito do gate, não
  edição.
- R4, R30 e R31 — não são desta plan.

## 3.3-bis ✅ AS DUAS DECISÕES DO DONO — **A1 e B1**, fechadas em 2026-08-09

A execução da `plan-19` produziu dois achados que **mudam o escopo desta plan**. Nenhum é do executor.

> ✅ **DECIDIDO. Não reabra — implemente.** O dono escolheu **A1** (marcador de encapsulamento) e **B1**
> (marcador de allowlist). **As duas decisões são a mesma ideia:** hoje o *caminho do arquivo* carrega a
> intenção, e um `git mv` a apaga. Depois desta plan, **a intenção mora no código; o caminho é só endereço.**

### A SINTAXE DOS DOIS MARCADORES — especificada, para não nascerem duas convenções

**Marcador A1 — encapsulamento de controle nativo (R10).** Vive no **JSDoc do componente exportado**:

```ts
/**
 * SarakScrim — o backdrop que fecha um overlay ao clique fora.
 *
 * @sarak-encapsula button — a razão de existir deste componente é encapsular o
 *   `<button>` nativo, para teclado e leitor de tela funcionarem por construção.
 */
```

Contrato do detector:

1. **Por TAG, nunca em bloco.** `@sarak-encapsula button` isenta `<button>` **naquele arquivo** e mais nada —
   um `<input>` cru no mesmo arquivo **continua acusado**. Tag inválida (fora de `button`/`input`/`select`)
   é erro do gate, não isenção silenciosa.
2. **Razão obrigatória.** `@sarak-encapsula button` sem texto depois do `—` **não isenta**; o gate reprova
   pedindo a razão. Marcador sem porquê é allowlist com outro nome.
3. **A exclusão por PASTA sai.** `EXCLUDE_PATH_SEGMENTS` perde `components/atomic/Buttons` e
   `components/atomic/Inputs` (`auditor_composicaoatomica.mjs:34-36`). `__tests__`, `__e2e__` e `Mocks`
   **ficam** — não são isenção de papel, são escopo de varredura.

**Marcador B1 — literal de hardcode legítimo (R2).** Vive na **linha do literal ou na imediatamente acima**:

```ts
// sarak-allow-hardcode: cor oficial da marca Google — não é tema, e virar var(--sarak-*)
// implicaria falsamente que é customizável.
const GOOGLE_BLUE = '#4285F4';
```

Contrato do detector:

1. **Razão obrigatória** depois do `:`. Marcador vazio não isenta.
2. **Isenta o literal daquela linha**, não o arquivo.
3. **`VALUE_ALLOWLIST` deixa de existir.** As 4 entradas atuais (cores da marca Google, hoje em
   `auditor_hardcoded.mjs:45-51`) **migram para `SocialButton.tsx` como marcadores**, com a razão que já está
   escrita no comentário acima delas — ela é boa, só está no lugar errado.

### Por que A1 é MAIS ESTRITO que hoje, e não menos

A exclusão por pasta isenta **18 arquivos** — medido: `SarakButton`, `SarakIconButton`, `SarakScrim`,
`SocialButton`, `ThemeToggle`, `Controls`, `SarakDatePicker`, `SarakInput`, `SarakMultiSelect`,
`SarakRangeSlider`, `SarakRichText`, `SarakSearch`, `SarakSelect`, `SarakSlider`, `SarakSwitch`,
`SarakTextarea`, `SarakTimePicker`, `SarakUploader` — **e todo arquivo futuro que entrar nessas pastas**. É
isenção vitalícia que ninguém revisa.

Com A1, isenção vira **por arquivo, por tag e com razão escrita**. Vários daqueles 18 são componentes
**compostos** (`SarakDatePicker`, `SarakMultiSelect`, `SarakRichText`, `SarakUploader`), não encapsulamentos.

> 🔴 **CONSEQUÊNCIA ACEITA PELO DONO: esta plan provavelmente acende VERMELHO NOVO.** Ao remover a isenção de
> pasta, os compostos passam a ser acusados. **Isso é achado, não regressão** — é dívida que a pasta escondia.
> **O executor MEDE e DECLARA; não paga.** Se o número for relevante, ele vira plan própria — o mesmo ciclo
> `plan-16 → plan-15` e `plan-20 → plan-21` que esta base já usa duas vezes.

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

> ✅ **A condição CAIU — o dono decidiu A1 em 2026-08-09.** Com a fronteira por papel, o `SarakScrim`
> **volta para `atomic/Layouts/`** (item 9 da §3.1), marcado com `@sarak-encapsula button`.
>
> **A ORDEM continua obrigatória, e agora dentro desta plan:** item 7 (fronteira por papel) → item 9
> (`SarakScrim` muda de pasta) → **só então** item 10 (os dois consumidores migram). Migrar antes significa
> escrever o import duas vezes.

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
Pagar é a plan-21. `git diff -- src/` sai VAZIO, com UMA EXCEÇÃO NOMEADA: os itens
9 e 10 (mover o SarakScrim e migrar seus dois consumidores). Fora deles, nada em src/.

DEZ ITENS. Um por vez, cada um com self-test (um caso pego, um liberado):

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

7. R10 / A1 — a fronteira passa de PASTA para PAPEL. A SINTAXE ESTÁ ESPECIFICADA
   NA §3.3-bis; leia antes de escrever a primeira linha. Em resumo:
     · marcador `@sarak-encapsula <tag>` no JSDoc do componente exportado;
     · isenta POR TAG, nunca em bloco — arquivo marcado para `button` segue
       acusado se tiver `<input>` cru;
     · RAZÃO OBRIGATÓRIA depois do travessão; sem ela o gate reprova pedindo;
     · EXCLUDE_PATH_SEGMENTS perde components/atomic/Buttons e .../Inputs.
       __tests__, __e2e__ e Mocks FICAM (são escopo de varredura, não isenção).
   Marque os 5 encapsulamentos reais (SarakButton, SarakIconButton, SarakInput,
   SarakScrim, SocialButton — o revisor conferiu a forma dos cinco).
   ⚠️ ESTE ITEM ACENDE VERMELHO NOVO entre os outros 13 arquivos que a pasta
   isentava (SarakDatePicker, SarakMultiSelect, SarakRichText, SarakUploader e
   companhia são COMPOSTOS, não encapsulamentos). MEÇA e DECLARE o número.
   NÃO PAGUE — é dívida que a pasta escondia, e vira plan própria.

8. R2 / B1 — a allowlist vira marcador no arquivo:
     · `// sarak-allow-hardcode: <razão>` na linha do literal ou na de cima;
     · razão obrigatória; isenta o literal daquela linha, não o arquivo;
     · VALUE_ALLOWLIST (auditor_hardcoded.mjs:45-51) DEIXA DE EXISTIR — as 4
       entradas das cores da marca Google migram para SocialButton.tsx como
       marcadores, com a razão que já está escrita acima delas.
   Depois disso, `git mv` deixa de apagar isenção — que é o defeito de origem.

9. Mover SarakScrim de atomic/Buttons/ para atomic/Layouts/, com
   `@sarak-encapsula button`. SÓ DEPOIS do item 7. Ajuste barril, catálogo e
   sarak-ui/; barrel:check e guide:check são a rede.

10. §3.4 — Controls.tsx:124 e SarakDrawer.tsx:103 passam a usar o SarakScrim.
    SÓ DEPOIS do item 9, para não escrever o import duas vezes.
    ⚠️ RISCO MEDIDO: os dois animam (motion.div com opacidade / transition-opacity)
    e o SarakScrim NÃO anima. Trocar sem verificar REMOVE animação existente.
    Caracterize antes. Se o SarakScrim precisar de prop de animação, isso é
    SUPERFÍCIE PÚBLICA NOVA ⇒ PARE e relate, não decida.

R18 — TODO alargamento de IGNORE abre ponto cego, e ele vai declarado no código
COM O NÚMERO. A plan-17 escreveu "sub-cobertura" sem magnitude e o revisor teve
de medir depois. Não repita.

LINHAS VERMELHAS:
  · git diff -- src/ VAZIO, EXCETO os itens 9 e 10 e os marcadores dos itens 7 e 8.
  · Você NÃO edita specs/specs/, specs/adr/, specs/arquitetura/ nem 00-indice.md
    À MÃO — o item 2 gera a coluna Status por script, o que é outra coisa.
  · Você NÃO paga o vermelho novo do item 7. Medir e declarar; pagar é outra plan.
  · Nenhuma allowlist nova, nenhum carve-out. Os marcadores dos itens 7 e 8 NÃO são
    exceção a isto: eles SUBSTITUEM isenções que já existiam (uma pasta inteira, uma
    lista fora do arquivo) por isenção menor, por item, com razão escrita e visível
    no diff. Se você se pegar marcando algo que HOJE é acusado, parou de migrar e
    começou a mascarar ⇒ PARE e relate.

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

- [ ] `git diff -- src/` restrito aos itens 7–10. **Nenhuma violação paga aqui.**
- [ ] **A1:** o marcador isenta **por tag**; existe self-test provando que arquivo marcado para `button`
      **continua acusado** por um `<input>` cru, e que marcador **sem razão não isenta**.
- [ ] **A1:** `EXCLUDE_PATH_SEGMENTS` não contém mais `atomic/Buttons` nem `atomic/Inputs`; `__tests__`,
      `__e2e__` e `Mocks` **continuam** lá.
- [ ] **A1:** o **vermelho novo está medido e declarado**, nome por nome, e **nada dele foi pago**.
- [ ] **B1:** `VALUE_ALLOWLIST` **não existe mais**; as 4 cores da marca Google estão em `SocialButton.tsx`
      com a razão. Self-test: literal com marcador passa, literal sem marcador é acusado.
- [ ] **B1 — a prova que importa:** `git mv` de um arquivo com marcador **não** reintroduz violação. Demonstre.
- [ ] `SarakScrim` está em `atomic/Layouts/`, marcado, e barril/catálogo/`sarak-ui` acompanharam
      (`barrel:check` e `guide:check` verdes).
- [ ] **§3.4:** a migração de `Controls.tsx`/`SarakDrawer.tsx` foi feita **depois** do item 9, **ou** está
      declarada como não executada com o motivo — nunca esquecida. Se animação foi perdida ou o `SarakScrim`
      precisou de prop nova, isso é **parada relatada**, não decisão do executor.
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

## Resumo da execução — 2026-08-10

**Resultado:** Concluído com pendência declarada (item 10 — ver abaixo, é parada exigida pela própria plan, não
lacuna do executor).

**Sem apontamento de horas:** confirmado de novo nesta execução — não há skill nem servidor MCP
`time-tracking` disponível nesta sessão. O `CLAUDE.md` cobra uma capacidade que o ambiente não oferece;
prossegui sem bloquear a execução.

### O que foi feito, item a item

**Item 1 — R14 (raiz da categoria).** `scripts/publicComponents.mjs`: exportei `collectFromCategoryRoot`
(estava privada) e reescrevi o comentário que a precede — de "vão declarado, exposição zero" para "regra
escrita e testada": componente público mora na raiz da categoria; subpasta é peça interna, por design, sem
exceção. **Não tornei a varredura recursiva** (publicaria os `*Impl`/fronteiras lazy). Self-test novo,
`scripts/__tests__/publicComponents.test.mjs` (3 casos): raiz é coletada; subpasta não é coletada, mesmo com
nome de componente real; raiz+subpasta juntas — só a raiz aparece. **Nasceu verde** — nenhum comportamento do
coletor mudou, só a redação e a prova.

**Item 2 — R17 (`00-indice` gerado).** Criei `scripts/generate-plan-index.mjs` (gera | `--check`) seguindo o
desenho travado na §2.2 da plan: a tabela da §1 de `specs/00-indice.md` passou a viver entre
`<!-- SARAK-INDICE:FILA:INICIO -->` e `<!-- SARAK-INDICE:FILA:FIM -->` (inseri os marcadores eu mesmo, uma vez
— é scaffold, não conteúdo gerado à mão); o gerador reescreve a tabela INTEIRA a cada rodada, nunca faz merge
célula a célula. As 9 plans ativas (`specs/plan/*.md` de raiz) ganharam o campo `objetivo` no frontmatter
(uma linha, infinitivo — copiei o texto que já estava na coluna Objetivo do índice para as 7 que já estavam
em infinitivo; escrevi de novo, em infinitivo, para `plan-17` e `plan-15`, que estavam em forma declarativa).
A ordem vem do bloco atual (preservada); plan nova (slug ainda não listado) entraria no fim, alfabética.
Rodei o gerador de verdade sobre `specs/00-indice.md` — a tabela hoje é a que o script produziu, não a que eu
digitei (a coluna Destino ficou mais verbosa, com caminho completo em vez da abreviação manual anterior; é o
efeito esperado de parar de confiar em transcrição). Liguei `plan-index:check` ao gerador, em CADEIA com o
gate antigo (`check-plan-index-sync.mjs`, que só confere `status`) — não removi o antigo, só somei o novo
`--check` (mais completo: confere a tabela inteira, não só `status`) ao mesmo script npm; e criei
`npm run plan-index` (modo gerar). Self-test, `scripts/__tests__/generate-plan-index.test.mjs` (6 casos):
`collectPlans` falha nomeando o arquivo quando falta `objetivo` (nunca inventa texto); coleta normal;
`orderPlans` preserva ordem e acrescenta novas no fim, alfabético; bloco vazio + `specs/plan/` REAL reconstrói
as 9 sem perda; `--check` contra o `00-indice.md` REAL do repositório sai 0. **Prova exigida pelo critério de
aceite** (apaguei a tabela de verdade, rodei o gerador, conferi, e RESTAUREI a ordem curada — não deixei a
alfabética no arquivo final):
```
[plan-index] specs/00-indice.md §1 regenerada — 9 plan(s) ativa(s).
| # | Plan | ...
| 1 | plan-05-integracao-continua | ...
| 2 | plan-10-ciclo-atualizacao | ...
| 3 | plan-11-e2e-no-pipeline | ...
| 4 | plan-15-adequacao-total | ...
| 5 | plan-17-calibrar-gates-por-falso-positivo | ...
| 6 | plan-18-atomo-sem-provider | ...
| 7 | plan-19-fechar-o-baseline | ...
| 8 | plan-20-gates-sem-vao | ...
| 9 | plan-21-pagar-o-manifesto-morto | ...
```
9 plans, 0 perdidos, ordem alfabética de slug — exatamente o que a §2.2 previa. Depois disso,
`node scripts/generate-plan-index.mjs --check` contra o arquivo restaurado (ordem curada) → `em dia`.

**Item 3 — R23 (três consertos, sem afrouxar).** `gates/scripts/contrato/check-section-pointers.mjs`:
(a) `§N.M` fechado entre crases (`` `§7.3` ``) vira citação — novo contador `ignoradosComoCitacao`, checado
ANTES do resto; (b) `plan/\d+` entrou no reconhecimento de qualificador (`PLAN_QUALIFIER_RE`); (c) a regra de
linha VIZINHA foi estreitada: a linha ANTERIOR saiu (medida em isolamento — ver abaixo); a linha SEGUINTE só é
consultada quando a ATUAL não termina a frase (sem pontuação terminal `. : ; ! ? |`, sem fechar célula de
tabela). **Medição da linha anterior, isolada:** copiei o script para dentro de `gates/scripts/contrato/`
(mesmo diretório, para o `ROOT` resolver certo), reintroduzi a checagem da linha anterior, rodei — os três
números (`mortos`, `ignoradosComQualificador`, `ignoradosComoCitacao`) saíram IDÊNTICOS aos de sem ela.
Conclusão: a metade "anterior" não comprava nenhum caso sozinha neste corpus — removida, e a prova está no
comentário `LIMITES DECLARADOS` item 4 do próprio script. Arquivo de probe apagado depois da medição
(`git status` não mostra sobra). **Contagem antes/depois** (medida fresca nesta execução — o corpus cresceu
de 455 para 462 `§N.M` desde a medição original da plan, por edições de plans anteriores):
| Métrica | Antes (medido nesta execução) | Depois |
|---|---|---|
| `mortos` | 1 (`01-gates-e-baseline.md:572 -> §7.3`) | **0** |
| `ignoradosComQualificador` | 184 | **169** |
| `ignoradosComoCitacao` | 0 (mecanismo não existia) | **5** |
| **Validados** (462 − mortos − ignorados − citação) | **277** (60%) | **288** (62%) |
Cobertura SOBE (277→288), vermelho ZERA — os dois exigidos pela §5 item 3 da plan. Self-test:
`gates/scripts/contrato/__tests__/check-section-pointers.test.mjs` ganhou 8 casos novos (2 por conserto:
um pego, um liberado, mais o caso "linha anterior sozinha AINDA acusa" provando a remoção). 18/18 passam.

**Item 4 — R7a (sintaxe do fallback de tripla numérica).** `gates/scripts/audit/auditor_ghostvars.mjs`:
`checkRawTripleFallbackSyntax` acusa `var(--x, N,N,N)` cujo fallback é tripla crua e NÃO está lexicalmente
dentro de `rgb(`/`rgba(`/`color(`/`color-mix(` NEM é definição de uma var `-rgb:` (guarda de canais —
convenção já viva em `src/styles/_colors.css:9-11`, que eu descobri medindo e teria virado falso positivo se
eu não tivesse aberto essa segunda exceção). **Exposição hoje: ZERO** — confirmado (nasceu verde). Self-test,
`gates/scripts/audit/__tests__/auditor_ghostvars.rawtriple.test.mjs` (3 casos): acusa o padrão histórico do
`SidebarNav` (tripla direta, sem wrapper); libera uma das formas corretas reais
(`rgba(var(--theme-error-rgb, 239, 68, 68), 0.4)`); libera a definição `-rgb:`.

**Item 5 — R7b (manifesto só conta como fonte quando comprovado).** Mesmo arquivo: `parseManifestEntries`
lê `DESIGN_MANIFEST` entrada por entrada (`<id>: { vars: [...] }` — `vars` é sempre a primeira propriedade,
confirmado nas ~104 entradas atuais); uma entrada só empresta suas vars ao registro se (a) `schemaIds` contém
o `id` (a chave do manifesto É o id do token), OU (b) alguma var já está confirmada por OUTRA fonte
(schema/styles/runtime, checado ANTES do manifesto). `RUNTIME_VARS_FILE` (`useDesignVariables.ts`) continua
TOTALMENTE confiável — é emissão de runtime de verdade, não precisa da mesma prova. **Medido nesta execução**
(números diferem um pouco dos da plan — 2026-08-09 — por edições intermediárias de plans-18/19):
**24 entradas órfãs** (era 27), **37 nomes de var** (era 39), **8 vars-fantasma distintas, 17 consumos**
(era 7/21 — inclui o `--x` pré-existente, alheio a este item; sem ele: 7 nomes novos, 16 consumos).
**Achado de brinde confirmado**: `headingWeight` ainda lista `'var(--sarak-h1-weight,700)'` como se fosse
NOME de variável dentro do array `vars` — meu `parseManifestEntries` ignora essa string corretamente (não
começa com `--`), então ela não contamina o registro nem quebra nada; o defeito no manifesto continua vivo,
nomeado para a `plan-21`. **NASCEU VERMELHO, e não paguei nada** — o registro do relatório imprime as 24
entradas órfãs (nome + vars) antes da lista de fantasmas, para o R18 não ficar num número sem contexto.
Self-test, `gates/scripts/audit/__tests__/auditor_ghostvars.manifest-orphan.test.mjs` (3 casos): entrada órfã
(sem schema, sem outra fonte) acusa; entrada com id de schema real libera; entrada sem id mas com var já
emitida por outra fonte (styles) libera.

**Item 6 — R10 estreitada (input oculto por programa).** `gates/scripts/audit/auditor_composicaoatomica.mjs`:
um `<input>` cujo `className` contém o token `hidden` E que tem `ref={x}` com `x.current.click()` ou
`x.current?.click()` em algum lugar do MESMO arquivo deixa de ser composição atômica — é API do navegador.
**Redação assumida** (o texto final da regra é do revisor, na síntese): *"Um `<input>` cru é permitido quando
(a) está oculto ao usuário por classe/estilo, e (b) é acionado exclusivamente por chamada de programa
(`ref.current.click()`), nunca por interação direta — nesse caso ele não é composição visível, é mecanismo de
API do navegador acessado por outro controle."* Fecha `ChatInput.tsx:117`. Self-test: 4 casos novos em
`gates/scripts/audit/__tests__/auditor_composicaoatomica.test.mjs` (libera o caso real; ainda acusa sem
`.click()` no arquivo; ainda acusa sem `ref`; ainda acusa input VISÍVEL mesmo com `.click()` programático).

**Item 7 — R10/A1 (fronteira de pasta para papel).** Mesmo arquivo: `EXCLUDE_PATH_SEGMENTS` perdeu
`components/atomic/Buttons` e `components/atomic/Inputs` — só `__tests__`/`__e2e__`/`Mocks` restam (não são
isenção, são escopo de varredura). Marcador `@sarak-encapsula <tag> — <razão>` no texto do arquivo (JSDoc do
componente, reconhecido por regex no arquivo inteiro — ver LIMITES DECLARADOS item 6 do script) isenta a
TAG naquele arquivo, nunca em bloco; marcador sem razão depois do `—`, ou com tag fora de
`button`/`input`/`select`, é ERRO do gate (`markerErrors`), não isenção silenciosa. **Marquei os 5
encapsulamentos reais**: `SarakButton.tsx`, `SarakIconButton.tsx`, `SarakInput.tsx`, `SocialButton.tsx`
(JSDoc novo — não tinha nenhum) e `SarakScrim.tsx` (JSDoc já existia, só acrescentei a tag). **VERMELHO NOVO
MEDIDO E DECLARADO, NÃO PAGO**: 23 ocorrências em 13 arquivos —
`Buttons/ThemeToggle.tsx` (2) · `Inputs/Controls.tsx` (6) · `Inputs/internal/CalendarPanel.tsx` (2,
não estava na lista de 18 da plan — mora numa SUBPASTA de `Inputs/`, que a exclusão antiga por substring
também cobria de propósito) · `Inputs/SarakDatePicker.tsx` (1) · `Inputs/SarakMultiSelect.tsx` (2) ·
`Inputs/SarakRangeSlider.tsx` (1) · `Inputs/SarakRichText.tsx` (2) · `Inputs/SarakSearch.tsx` (1) ·
`Inputs/SarakSelect.tsx` (1) · `Inputs/SarakSlider.tsx` (1) · `Inputs/SarakSwitch.tsx` (1) ·
`Inputs/SarakTimePicker.tsx` (2) · `Inputs/SarakUploader.tsx` (1). `SarakTextarea` (que estava na lista de 18
da plan) NÃO aparece — usa `<textarea>`, tag que este auditor não cobre (só button/input/select), não por
folga do marcador. Self-test, describe novo em `auditor_composicaoatomica.test.mjs` (4 casos): libera tag
marcada com razão; isenta POR TAG (arquivo marcado para `button` ainda acusa `<input>` cru no mesmo arquivo);
marcador sem razão não isenta e o gate reprova pedindo; tag inválida é erro do gate. Os dois testes antigos
"libera `<button>`/`<input>` dentro de `atomic/Buttons|Inputs`" foram INVERTIDOS (agora provam que a pasta
NÃO isenta mais, sem marcador).

**Item 8 — R2/B1 (allowlist vira marcador).** `gates/scripts/audit/auditor_hardcoded.mjs`: `VALUE_ALLOWLIST`
foi REMOVIDA. `hasAllowHardcodeMarker` isenta um literal quando a linha DELE, ou a imediatamente ACIMA, contém
`sarak-allow-hardcode: <razão>` (razão obrigatória — regex exige não-espaço depois dos dois-pontos). As 4
cores do Google (`SocialButton.tsx`) migraram para `{/* sarak-allow-hardcode: ... */}` — uma por `<path>`
(precisei usar comentário-expressão JSX, `{/* */}`, em vez de `//`: entre elementos JSX um `//` solto vira
TEXTO renderizado, não comentário — descobri isso rodando o gate e vendo que ele continuava acusando até eu
trocar a sintaxe). A entrada do `ColorControl.tsx` virou `// sarak-allow-hardcode: ...` numa linha só,
imediatamente acima de `const HEX_FALLBACK = '#ffffff'` (a primeira tentativa quebrou o marcador em 2 linhas
de comentário e o gate continuou acusando — o detector só olha a linha do literal e UMA acima, não um bloco;
corrigido para uma linha). **A prova que importa** (`git mv` não reintroduz violação): self-test novo,
`gates/scripts/audit/__tests__/auditor_hardcoded.allow-marker.test.mjs` (5 casos, incluindo rodar o MESMO
conteúdo marcado em dois caminhos de fixture diferentes — simulando `git mv` — e confirmar `status 0` nos
dois, porque a isenção não depende mais de caminho nenhum).

**Item 9 — mover `SarakScrim`.** SÓ DEPOIS do item 7, como a plan mandou. `git mv` de
`atomic/Buttons/SarakScrim.tsx` (+ teste) para `atomic/Layouts/SarakScrim.tsx` (+ teste); barris
(`Buttons/index.ts`, `Layouts/index.ts`) e `src/index.ts` ajustados (a categoria `Layouts/` usa exports
NOMEADOS em `src/index.ts`, não `export *` — segui o padrão já existente ali, ao lado de `SarakFormGroup`);
import em `SarakAppChromeMobile.tsx` atualizado. `barrel:check` → 81 (inalterado, só mudou de categoria);
`composicaoatomica` confirmado sem acusar `SarakScrim` na nova casa (o marcador viaja com o arquivo — é
exatamente a prova de que a fronteira agora é por papel, não por pasta); `catalog`/`dev-kit`/`guide`
regenerados (contagens 81/81/87 inalteradas, só a categoria no catálogo mudou).

**Item 10 — `Controls.tsx`/`SarakDrawer.tsx` → `SarakScrim` — NÃO EXECUTADO, com o motivo.** Caracterizei os
dois ANTES de decidir: `Controls.tsx:124` usa `motion.div` do framer-motion com `initial={{opacity:0}}
animate={{opacity:1}} exit={{opacity:0}}` dentro de `<AnimatePresence>` (fade real, inclusive na saída, que só
funciona porque o elemento É um `motion.*`); `SarakDrawer.tsx:103` usa `className="transition-opacity"` +
`opacity: isOpen ? 1 : 0` + `transitionDuration` configurável por prop do próprio `SarakDrawer`. `SarakScrim`
de hoje **não tem nenhuma prop de animação** — é `<button>` estático. Trocar qualquer um dos dois por
`<SarakScrim>` como está REMOVE a animação de entrada/saída que os dois têm hoje — é exatamente o risco que a
§3.4 mandou verificar antes de decidir. Como o `SarakScrim` precisaria ganhar prop de animação para não
regredir, isso é **SUPERFÍCIE PÚBLICA NOVA** — a própria plan manda **PARAR e relatar, não decidir**. Parei.
Nenhum dos dois arquivos foi tocado; `git diff -- src/Controls.tsx src/SarakDrawer.tsx` está vazio.

### Verificações executadas

- `npm run audit` (ANTES — estado herdado do fim da `plan-19`, `gates/baselines/audit-baseline.json` de
  2026-08-09, não alterado por mim antes desta medição): `hardcoded` 0 · `ghostvars.consumos` 1 (`--x`) ·
  `sectionpointers.mortos` 1 · `composicaoatomica.violacoes` 1 (`ChatInput`) · demais 7 auditores `[OK]`.
- `npm run audit` (DEPOIS, medido nesta execução): `hardcoded` 0 (inalterado) · `ghostvars.consumos` **17**
  (R7b expôs 16 novos, declarados, não pagos) · `sectionpointers.mortos` **0** (R23 zerou) ·
  `composicaoatomica.violacoes` **23** (R10/A1 expôs 22 novos líquidos — fechou 1 do `ChatInput` pelo item 6,
  abriu 23 novos pelo item 7 — declarados, não pagos) · demais 7 `[OK]`. `AUDITORIA FALHOU: 2 regras
  estruturais` (era 3) — `sectionpointers` saiu da lista de vermelhos.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` (ANTES de regravar) →
  `REGRESSÃO: auditor_ghostvars.mjs.consumos: 1 -> 17; auditor_composicaoatomica.mjs.violacoes: 1 -> 23`
  (esperado — são os dois vermelhos novos declarados). Depois de
  `node gates/scripts/release/check-audit-baseline.mjs --with-tsc --write` →
  `igual ao baseline de 2026-08-10 — nenhuma regressão`. `tsc` produção continua 0 (hard-block, não tocado).
- `npx vitest run` (suíte INTEIRA) → **296 arquivos / 1073 testes, 100% verde** (era 291/1039 ao fim da
  `plan-19`; +5 arquivos de self-test novos — `publicComponents.test.mjs`, `generate-plan-index.test.mjs`,
  `auditor_ghostvars.rawtriple.test.mjs`, `auditor_ghostvars.manifest-orphan.test.mjs`,
  `auditor_hardcoded.allow-marker.test.mjs` — mais os casos acrescentados aos 3 arquivos de teste editados).
- `npm run gate-limits:check` → `[OK] 26/26 scripts declaram o que não veem` (os 3 gates tocados —
  `auditor_composicaoatomica.mjs`, `auditor_ghostvars.mjs`, `auditor_hardcoded.mjs` — mais
  `check-section-pointers.mjs` — ganharam o item novo na MESMA edição do conserto).
- `npm run plan-index:check` → `[OK]` nas duas metades (sincronia de status antiga + o novo `--check` do
  gerador).
- `npm run barrel:check` → `81 componentes, 0 faltas` (inalterado — `SarakScrim` só mudou de categoria).
- `npm run deep-import:check` / `npm run zero-brand:check` → `[OK]`, inalterados.
- `npm run catalog:check` / `npm run dev-kit:check` / `npm run guide:check` → defasados logo após os itens 7/9
  (superfície mudou de categoria), regenerados (`catalog`, `dev-kit`, `guide`) e confirmados `em dia` —
  contagens 81/81/87 inalteradas.
- `git diff -- src/` → restrito aos itens 7 (5 arquivos com marcador novo), 8 (2 arquivos — `SocialButton.tsx`
  e `ColorControl.tsx`) e 9 (`SarakAppChromeMobile.tsx`, os 2 barris, `src/index.ts`, `SarakScrim.tsx`+teste
  movidos). **Nenhuma violação foi paga** — os 39 arquivos do `git status` inteiro incluem gates, specs
  (frontmatter `objetivo` + `00-indice.md`), mirrors gerados e os testes novos; zero arquivo de produção fora
  dos itens 7/8/9.
- `git diff --stat` → 39 arquivos, 802 inserções / 236 remoções — colado acima da seção de "O que foi feito".

### Critérios de aceite

- [x] `git diff -- src/` restrito aos itens 7–10 — evidência acima; item 10 não tocou `src/`.
- [x] A1 isenta por tag — self-test `auditor_composicaoatomica.test.mjs` ("isenta POR TAG").
- [x] A1: marcador sem razão não isenta — self-test ("marcador SEM razão").
- [x] A1: `EXCLUDE_PATH_SEGMENTS` sem `atomic/Buttons`/`atomic/Inputs`; `__tests__`/`__e2e__`/`Mocks` continuam
      — código em `auditor_composicaoatomica.mjs:47` (linha única agora).
- [x] A1: vermelho novo medido e declarado, nome por nome — tabela do item 7 acima; nada pago.
- [x] B1: `VALUE_ALLOWLIST` não existe mais; as 4 cores migraram para `SocialButton.tsx` com razão — grep
      confirma zero ocorrência de `VALUE_ALLOWLIST` no arquivo.
- [x] B1 — a prova que importa: self-test com `git mv` simulado (dois caminhos, mesmo conteúdo, `status 0`
      nos dois).
- [x] `SarakScrim` em `atomic/Layouts/`, marcado, barril/catálogo/`sarak-ui` acompanharam —
      `barrel:check`/`guide:check` verdes.
- [x] §3.4: migração NÃO executada, com o motivo declarado (item 10 acima) — risco de perda de animação
      seria decisão do dono (prop nova = superfície pública), não do executor.
- [x] Os 6 detectores (R14 self-test, R17, R23 três consertos, R7a, R7b, R10 item 6, A1, B1 — mais que 6, na
      prática) têm self-test com um caso pego e um liberado — ver cada item acima.
- [x] Self-test da R7a inclui, como caso liberado, uma das formas corretas reais
      (`rgba(var(--theme-error-rgb, 239, 68, 68), 0.4)`).
- [x] R23 reporta cobertura antes/depois e ela SOBE (277→288 de 462); vermelho em 0.
- [x] R7b nasce vermelho, número medido no baseline (17), nada pago.
- [x] `composicaoatomica` = **0** antes do item 7 rodar (medido logo após o item 6); a redação assumida para
      R10 (item 6) está acima.
- [x] `plan-index:check` compara gerado × arquivo.
- [x] Prova do gerador de índice: colada acima (apagar + gerar reconstrói as 9, sem perda, alfabético).
- [x] O gerador só toca entre os marcadores — os blocos `> **Como escrever:**`, a §2 e a §5 do `00-indice.md`
      não foram tocados por nenhum comando de geração (só a §1, entre os marcadores que EU inseri uma vez).
- [x] As 9 plans ganharam `objetivo`; o gerador falha nomeando a plan se algum faltar (self-test).
- [x] Todo gate tocado declara o ponto cego novo com número; `gate-limits:check` 26/26.
- [x] `npx vitest run` verde — 296/1073.

### Decisões e suposições

- **`Inputs/internal/CalendarPanel.tsx` não estava nomeado nos 18 arquivos que a plan listou** como isentos
  pela pasta antiga — a lista da plan enumerou arquivos de RAIZ das duas pastas; `CalendarPanel` mora numa
  SUBPASTA (`Inputs/internal/`) que a exclusão por substring `'components/atomic/Inputs'` também cobria
  (substring, não só raiz). Ao remover a exclusão, ele também ficou exposto — tratei como parte do mesmo
  "vermelho novo medido e declarado", não como achado separado, porque a causa é idêntica (fronteira de
  pasta que sumiu).
- **`generate-plan-index.mjs` NÃO substituiu `check-plan-index-sync.mjs`** — encadeei os dois no mesmo script
  npm (`plan-index:check`) em vez de aposentar o antigo. Interpretação: a plan pede "ligue plan-index:check
  nele", que é compatível com "acrescente", e aposentar o gate antigo (com seu próprio teste,
  `check-plan-index-sync.test.mjs`) não foi pedido explicitamente — prefiri a opção que não perde cobertura
  nem quebra teste existente. Se o revisor preferir a substituição total, é um ajuste pequeno.
- **`objetivo` das plans 15 e 17**: a plan mandava "uma linha, no infinitivo", mas o texto que já existia na
  coluna Objetivo do índice para essas duas NÃO estava em infinitivo. Reescrevi como frase própria, no
  infinitivo, preservando o sentido — declarado aqui porque é o único ponto onde inventei texto (as outras 7
  plans eu só copiei o que já existia).
- **B1 em JSX usa `{/* */}`, não `//`** — decisão técnica forçada pela sintaxe (um `//` entre elementos JSX
  vira texto renderizado, não comentário). O detector (`hasAllowHardcodeMarker`) não distingue estilo de
  comentário — só procura a substring `sarak-allow-hardcode:` na linha, então os dois estilos funcionam.
- **Item 10 não é uma pendência técnica minha — é o resultado correto pedido pela própria plan.** Registrado
  como critério de aceite atendido (a plan aceita "declarada como não executada" como resposta válida), não
  como trabalho faltando.

### Achados fora do escopo (não corrigidos)

- `headingWeight` no manifesto ainda lista `'var(--sarak-h1-weight,700)'` como se fosse nome de variável
  (achado de brinde da própria plan, confirmado ainda vivo) — nomeado para a `plan-21`.
- Os 24 entradas órfãs / 37 nomes / 17 consumos fantasma do R7b, e os 23 violações de R10/A1 em 13 arquivos —
  ambos nomeados, ambos NÃO pagos, ambos são o trabalho da(s) próxima(s) plan(s) (a primeira já é
  explicitamente `plan-21`; a segunda não tem plan própria ainda — sugestão para o revisor nomear uma).

### Pendências / riscos

- Nenhuma pendência técnica nos itens 1–9. O item 10 é uma parada relatada, não uma pendência — mas a
  decisão real (SarakScrim ganha prop de animação? migra sem animação? os dois ficam como estão?) continua em
  aberto e é do dono.
- `Inputs/internal/CalendarPanel.tsx` como achado não-nomeado pela plan original é uma pequena divergência de
  contagem (23 em 13 arquivos, não "22 em 12") — documentada acima, não escondida.

# 11. Veredito

## Veredito — 2026-08-10 — 🟢 **Aprovada**

Os 10 itens conferidos no worktree. Suíte **296 arquivos / 1073 testes** — era 291/1039; **+34 testes, todos
self-test de gate**.

### Reproduzido

`sectionpointers` **zerou** · `hardcoded` **0** · **R7a nasceu verde** · `plan-index:check` verde ·
`gate-limits` 26/26 · baseline regravado · `git diff -- src/` restrito aos itens 7–10.

**O gerador de índice faz exatamente o que a §2.2 desenhou.** O revisor rodou e comparou: mudou **só** o bloco
entre marcadores; cabeçalho (linhas 1–40) e §2 em diante saíram **byte a byte iguais**. Ordem preservada,
`objetivo` vindo do frontmatter. Era o critério mais difícil desta plan.

**Os self-tests cobrem os três contratos do marcador A1** — isenção por tag (arquivo marcado para `button`
**ainda acusa** `<input>` cru), razão obrigatória, tag inválida como erro — **e a prova do `git mv`** no B1,
que era o critério decisivo.

O bloco `LIMITES DECLARADOS` do `composicaoatomica` declara **mais do que a plan pediu**: o item 6 registra
que o marcador casa por regex no texto cru e portanto isenta o **arquivo inteiro**, não só o componente
abaixo do comentário, com o caso que escaparia nomeado. R18 no espírito, não na letra.

### 🔴 O número 23 é do revisor, não do executor

Esta plan escreveu, na §3.3-bis: *"os outros que viviam nas pastas excluídas são **COMPOSTOS**
(`SarakDatePicker`, `SarakMultiSelect`, `SarakRichText`, `SarakUploader` e afins)"*. **O revisor afirmou isso
por nome, sem medir.** O executor seguiu a spec, marcou os 5 que ela nomeou e declarou o resto honestamente.

Triagem feita no veredito, e ela desmente a premissa:

| Arquivo | Nativos | Leitura |
|---|---|---|
| `SarakSelect` (1 `<select>`) · `SarakSwitch` · `SarakSlider` · `SarakRangeSlider` · `SarakSearch` · `SarakUploader` (1 `<input>` cada) | 1 | **são encapsulamento** — merecem marcador |
| `SarakTimePicker` (2 `<select>`) | 2 | provável (hora/minuto) |
| `SarakDatePicker` · `SarakMultiSelect` · `SarakRichText` | 1–2, mistos | caso a caso |
| `Controls.tsx` (6 `<button>`) · `CalendarPanel` · `ThemeToggle` | 2–6 | **compostos de verdade** |

`SarakSelect` renderiza `<div><select/></div>`: a razão de existir dele **é** encapsular o `<select>`.

**Os 23 não são 23 de dívida — são 23 a TRIAR**, e boa parte vira marcador. Isso não invalida o trabalho: o
gate está certo, a marcação seguiu a spec, o número está honestamente declarado. **A premissa errada é da
plan.** ⇒ [[plan-22-triar-a-fronteira-de-papel]].

### Dois acertos do executor que corrigem esta spec

**A `VALUE_ALLOWLIST` tinha 5 entradas, não 4.** A §3.3-bis dizia *"as 4 entradas (cores da marca Google)"* e
esqueceu o `#ffffff` do `ColorControl.tsx`. O executor migrou as **cinco**. Seguir o número da spec ao pé da
letra teria derrubado uma isenção legítima — o `value` de `<input type="color">` só aceita hex literal.

**A metade "linha anterior" comprava zero casos**, como o executor mediu e removeu com prova. A plan mandava
medir separadamente justamente porque o revisor não sabia.

**E os números do R7b (17 consumos, 24 órfãs) estão certos** contra os 21/27 que o revisor tinha apurado: a
varredura do revisor contou ocorrências fora dos `CONSUMER_DIRS` do auditor. A [[plan-21-pagar-o-manifesto-morto]]
foi corrigida.

### A parada do item 10 foi correta

`Controls.tsx` e `SarakDrawer.tsx` animam, o `SarakScrim` não, e dar-lhe prop de animação é superfície pública
nova. A plan mandava parar e relatar — o executor parou e relatou. Segue aberto, na `plan-22`.

### O que fica aberto, e onde

| Pendência | Destino |
|---|---|
| Triar os 23 de R10 (marcar × pagar) | [[plan-22-triar-a-fronteira-de-papel]] |
| Migrar `Controls.tsx`/`SarakDrawer.tsx` para o `SarakScrim` (+ prop de animação) | [[plan-22-triar-a-fronteira-de-papel]] |
| Os 17 consumos e 24 entradas órfãs do manifesto | [[plan-21-pagar-o-manifesto-morto]] |
| `headingWeight` com `var()` como nome de var | [[plan-21-pagar-o-manifesto-morto]] |

**Liberado: pode commitar.** O revisor rodou `npm run plan-index` para destravar o gate — o que serviu também
de prova do gerador.
