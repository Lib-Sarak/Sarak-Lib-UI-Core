---
tipo: "plan"
titulo: "A camada atômica emite container query e não estabelece container nenhum"
dominio: "Sarak-Lib-UI-Core / Responsividade / Camada atômica"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "responsividade", "container-query", "defeito-ativo", "plan-39", "plan-40"]
relacionados: ["[[07-responsividade-e-multidispositivo]]", "[[05-cromo-e-slots]]", "[[01-gates-e-baseline]]", "[[15-divida-conhecida]]"]
depende_de: "plan-40"
destino_sintese: "specs/specs/07-responsividade-e-multidispositivo.md · specs/specs/15-divida-conhecida.md"
objetivo: "Fora do SarakShell, a responsividade estrutural da lib passa a funcionar — hoje ela não liga, porque nenhum átomo estabelece o container que as próprias classes precisam para medir"
---

# 1. Objetivo

Um consumidor que usa a lib **sem** `SarakShell` — o modo "kit de componentes", que o `SarakAppChrome`
existe para servir — recebe a responsividade estrutural funcionando. Hoje **não recebe**: as classes de
container query estão no DOM, a regra está no CSS, e nada liga, porque não há ancestral que se declare
container.

# 2. Contexto

## 2.1 A medição, num consumidor real — `plan-40`, 2026-08-13

O ERP Earendel, com dados reais na tela: **`SarakGrid` com layout `col-12` fica travado em coluna única de
500 px a 1440 px.** Três propostas, uma embaixo da outra, em qualquer largura.

A causa, verificada pelo revisor:

```
grep -rln "@container" src/ --include=*.tsx | grep -v __tests__
  → src/core/Shell/SarakShell.tsx
  → 7 arquivos dentro de src/features/DesignEngine/   (o painel, da plan-35)
```

**Oito arquivos plantam `@container` em toda a lib, e nenhum deles é átomo.**
`src/components/Layout/SarakAppChrome.tsx` planta **zero**.

E `src/components/atomic/hooks/useStructuralStyles.ts:35` emite
`grid w-full grid-cols-1 @min-[768px]:grid-cols-12`.

**Uma container query sem ancestral com `container-type` nunca casa.** Não há fallback para viewport: a
regra simplesmente não ativa, e o elemento fica no valor base — `grid-cols-1`, para sempre.

Ou seja: **a camada atômica emite classes de container query e não estabelece container nenhum.** Ela
funciona *por acidente*, quando há um `SarakShell` acima.

## 2.2 O caso-controle involuntário, do mesmo consumidor

O dono relatou que a nav do topo do ERP funciona. **Funciona mesmo** — e isso confirma o diagnóstico em vez
de contradizê-lo:

| Componente | Usa container query? | Funciona no ERP? |
|---|---|---|
| `SarakShellNav` (o que o `SarakAppChrome` renderiza) | **não** — flex puro | ✅ sim |
| `SarakGrid` `col-12` (`useStructuralStyles.ts:35`) | **sim** | ❌ não |

Dois componentes, mesmo consumidor, mesma tela. **Só o que depende de container query falha.**

## 2.3 A terceira camada do mesmo defeito

| Camada | Sintoma | Como foi descoberta |
|---|---|---|
| A classe não existia no CSS gerado | nada acontece | `plan-39`, por leitura do artefato |
| A regra existe, mas não há container para medir | nada acontece | **`plan-40`, por consumidor real** |

Ambas invisíveis pelos mesmos motivos, agora somados: **jsdom não tem motor de layout**, então container
query nunca é avaliada em teste; e nenhum gate pergunta *"esta classe tem ancestral que a faça funcionar?"*.

# 3. Escopo

## 3.1 Dentro

1. **PASSO 1 — MEDIR ANTES DE EDITAR, e o resultado entra no resumo antes de qualquer mudança.**
   - Listar **todo** componente/hook de produção que emite classe `@min-[…]` (a varredura da `plan-39`
     serve de ponto de partida: 6 arquivos, 19 classes).
   - Para cada um, responder: **em que topologias existe ancestral `@container`?** (dentro do `SarakShell`;
     dentro do painel; sob `SarakAppChrome`; átomo solto, sem cromo nenhum).
   - **Esta tabela é o produto do passo 1** e é o que torna a decisão do passo 2 informada em vez de
     palpite.
2. **PASSO 2 — decidir onde o container é plantado, com a medição na mão.** Três saídas, e a plan **não**
   escolhe por você:
   | | Onde | Custo |
   |---|---|---|
   | **A** | `SarakAppChrome` planta | 1 linha; resolve o consumidor de hoje; **não** resolve átomo solto |
   | **B** | cada componente que **usa** container query planta o seu | autossuficiente em qualquer topologia; `container-type: inline-size` **tem efeito colateral de layout** e precisa ser medido caso a caso |
   | **C** | exigir do consumidor, por documentação | ⛔ **descartada** — é a falha silenciosa que esta plan existe para fechar |
   **Declare a escolha e o porquê no resumo.** Se a medição do passo 1 apontar uma quarta saída melhor,
   proponha — com a medição.
3. **Implementar a saída escolhida**, com teste ao lado de cada arquivo tocado (R8).
4. **Gate**, se a medição mostrar que é possível: nenhum componente pode emitir `@min-[…]` sem ancestral
   `@container` garantido. **Se não for verificável estaticamente, NÃO invente um gate que finge** — declare
   o vão em [[01-gates-e-baseline]] com o motivo (R18). Vão declarado é melhor que gate decorativo.
5. **`docs/migracoes.md`** — o layout de quem consome **fora do Shell** vai mudar de aparência. Classifique
   por [[03-versionamento-e-release]] §3.

## 3.2 Fora

- ⛔ **Voltar para media query de viewport.** Resolveria o sintoma e desfaria a direção inteira das plans 35
  e 39. Container query é a decisão vigente ([[07-responsividade-e-multidispositivo]] §6).
- ⛔ **Mudar qualquer número de breakpoint.** 640/768/1024/1280 continuam.
- ⛔ **Mudar layout, espaçamento ou hierarquia visual** por achar que ficou melhor ao ligar a
  responsividade. Se algo ficar feio, **relate — não redesenhe**.
- ⛔ Tocar no `SarakShell` — ele já planta o container e está certo.
- ⛔ Mexer no consumidor. O ERP não é escopo desta plan e não recebe remendo.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-40-…md` §11 | a medição no consumidor real e a correção do revisor — **leia inteira** |
| Plan | `specs/plan/plan-39-…md` §2.2 | a varredura dos 6 arquivos e 19 classes: o ponto de partida do passo 1 |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6 | a camada 3 (container query estrutural) é o mecanismo que esta plan conserta |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` §2 | onde o gate entra — **ou onde o vão é declarado** |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R8 · R18 · R20 | teste ao lado; todo gate declara o que não vê; baseline não regride |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |
| Código | `SarakShell.tsx:89` (o container que existe), `SarakAppChrome.tsx` (o que não planta), `useStructuralStyles.ts:35` | ler antes de editar |

# 5. Instruções de execução

1. **Passo 1 inteiro antes de tocar em código.** A tabela de topologias vai no resumo primeiro.
2. **Passo 2**: escolha declarada, com o porquê e o custo assumido.
3. **Implementar**, com teste ao lado. Atenção: **jsdom não avalia container query** — o teste prova que o
   container **é plantado** (a classe/estilo está no elemento certo), não que a query casou. Escreva isso
   no próprio teste, para ninguém confundir cobertura com prova.
4. **Fechar.** Nesta ordem, colando a saída real: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` ·
   `npx tsc --noEmit` · `npm run container-query:check` · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-41-container-query-sem-container.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
a §11 INTEIRA da plan-40 (a medição em consumidor real e a correção do revisor),
a §2.2 da plan-39 (a varredura de 6 arquivos / 19 classes),
specs/specs/07-responsividade-e-multidispositivo.md §6,
specs/specs/00-regras-e-invariantes.md R8, R18, R20.
Skills: padrao-escrita, padrao-typescript, test-unitario.

O DEFEITO, em uma frase: a camada atômica EMITE classes de container query e não
ESTABELECE container nenhum. Sem ancestral com container-type, a regra nunca casa
— não cai para viewport, simplesmente não liga. Fica no valor base para sempre.

A PROVA, medida em consumidor real (plan-40): no ERP, SarakGrid com layout col-12
fica em coluna única de 500px a 1440px, com dados reais. E o caso-controle do
mesmo consumidor: SarakShellNav, que NÃO usa container query, funciona
perfeitamente. Só o que depende de container query falha.

O MAPA: `grep -rln "@container" src/ --include=*.tsx | grep -v __tests__` devolve
8 arquivos — SarakShell.tsx e 7 do painel DesignEngine. NENHUM átomo.
SarakAppChrome.tsx planta ZERO.

PASSO 1, ANTES DE QUALQUER EDIÇÃO — e o resultado vai no resumo antes do resto:
  Liste todo componente/hook de produção que emite classe @min-[…] e, para cada
  um, em que topologias existe ancestral @container: dentro do SarakShell; dentro
  do painel; sob SarakAppChrome; átomo solto sem cromo nenhum.
  ESSA TABELA É O PRODUTO DO PASSO 1. Sem ela, o passo 2 é palpite.

PASSO 2 — decida onde plantar, COM a medição na mão, e declare o porquê:
  A) SarakAppChrome planta — 1 linha, resolve o consumidor de hoje, não resolve
     átomo solto.
  B) cada componente que USA container query planta o seu — autossuficiente, mas
     container-type: inline-size TEM efeito colateral de layout; meça caso a caso.
  C) exigir do consumidor por documentação — DESCARTADA, é a falha silenciosa que
     esta plan existe para fechar.
  Se a medição apontar uma quarta saída melhor, proponha — com a medição.

LINHAS VERMELHAS:
  · Você NÃO volta para media query de viewport. Resolveria o sintoma e desfaria
    a direção das plans 35 e 39.
  · Você NÃO muda número de breakpoint (640/768/1024/1280 continuam).
  · Você NÃO redesenha layout porque "ficou feio ao ligar". Relate.
  · Você NÃO toca no SarakShell — ele já planta e está certo.
  · Você NÃO toca no consumidor (ERP). Não é escopo e não leva remendo.
  · Se não der para escrever gate honesto, NÃO invente um que finge — declare o
    vão em 01-gates-e-baseline.md com o motivo (R18).

ATENÇÃO AO TESTE: jsdom NÃO avalia container query. Seu teste prova que o
container É PLANTADO (a classe/estilo está no elemento certo), não que a query
casou. Escreva isso no próprio teste — cobertura não é prova, e este defeito
nasceu exatamente dessa confusão.

Todo conserto leva teste ao lado (R8). docs/migracoes.md leva entrada: o layout
de quem consome FORA do Shell vai mudar de aparência.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] A tabela de topologias do passo 1 está no resumo, **datada antes** das edições de código.
- [ ] A saída escolhida no passo 2 está declarada **com o porquê e o custo assumido**.
- [ ] `SarakGrid` com `col-12`, montado **sem** `SarakShell`, tem ancestral `@container` — evidência: teste.
- [ ] Cada teste novo declara que **prova o plantio, não o casamento da query** (jsdom não avalia).
- [ ] Gate novo **ou** vão declarado em [[01-gates-e-baseline]] com o motivo. Não vale gate decorativo.
- [ ] `docs/migracoes.md` com entrada classificada.
- [ ] `npx vitest run` inteira, verde, não encolheu.
- [ ] `run_audit` sem regressão; `npx tsc --noEmit` → 0; `container-query:check` verde.
- [ ] `git diff --stat` — só os arquivos da §3.1, seus testes e `docs/`. **Nada no ERP.**

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

# quem planta container depois desta plan — comparar com os 8 de hoje
grep -rln "@container" src/ --include=*.tsx | grep -v __tests__

# quem emite classe de container query
grep -rn "@min-\[" src/ --include=*.ts --include=*.tsx | grep -v __tests__

npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
npm run container-query:check
```

**O que reprova:**
- media query de viewport reintroduzida "porque funciona" — desfaz plans 35 e 39;
- gate que só passa e nunca falhou, ou gate inventado para preencher a tabela;
- teste que **afirma** responsividade em jsdom — ele não pode: jsdom não avalia container query. Teste que
  alega o que o ambiente não mede é o defeito, não a prova;
- número de breakpoint alterado;
- qualquer arquivo do ERP no diff.

**O que esta verificação não vê:** que a coluna dupla apareceu na tela. Isso só se prova em consumidor real,
com largura real — é a rodada seguinte da `plan-40`, não esta.

# 9. Destino da síntese

**Destino:** `specs/specs/07-responsividade-e-multidispositivo.md` · `specs/specs/15-divida-conhecida.md`

**Texto pronto para transporte:**

- `07-responsividade-e-multidispositivo.md` §6 (camada 3) ganha a regra que faltava: **quem emite container
  query é responsável por garantir o container**, com a topologia em que isso vale e o incidente do ERP como
  evidência.
- `15-divida-conhecida.md` registra o vão que sobrar: se o gate não for possível, **fica escrito que nada
  impede a reincidência**, e por quê.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-13

**Resultado:** Concluído

## Passo 1 — a tabela de topologias (medida ANTES de qualquer edição)

Ponto de partida: a varredura da `plan-39` §2.2 — 6 arquivos de produção emitem `@min-[…]`. Confirmei que
segue sendo exatamente esses 6, sem novos desde então:

```
grep -rln "@min-\[" src/ --include=*.ts --include=*.tsx | grep -v __tests__
```
→ `useStructuralStyles.presets.ts`, `useStructuralStyles.ts`, `ShellContent.tsx`, `TopbarNav.tsx`,
`useShellLayoutStyles.ts`, `panelResponsive.presets.ts` — os mesmos 6.

E os plantadores de `@container` hoje, confirmados: **8 arquivos** — `SarakShell.tsx` + 7 dentro de
`src/features/DesignEngine/Canvas/` (o painel). Nenhum átomo. `SarakAppChrome.tsx` planta zero — batendo com
o que a plan afirmou.

**Para cada um dos 6 arquivos, mapeei quem CONSOME as funções que emitem `@min-[…]` e em que topologia isso é
montado** — essa é a informação que faltava (a plan-39 mediu os 6 arquivos; não mediu QUEM os usa nem ONDE):

| Arquivo emissor | Função | Quem consome | Dentro do `SarakShell`? | Dentro do painel? | Sob `SarakAppChrome`? | Átomo solto? |
|---|---|---|---|---|---|---|
| `ShellContent.tsx` | — | só `SarakShell.tsx` (interno, **não exportado** no barril) | ✅ sempre | n/a | n/a — nunca é montável fora do Shell | n/a |
| `TopbarNav.tsx` | — | `SarakShell.tsx` **e** `PreviewSystemRenderer.tsx` do painel (interno, não exportado) | ✅ sempre | ✅ (`PreviewSystemRenderer.tsx:105` planta o seu) | n/a — `SarakAppChrome` usa `SarakShellNav`, **não** `TopbarNav` (confirmado lendo o import de `SarakAppChrome.tsx:2`) | n/a |
| `useShellLayoutStyles.ts` | — | `ShellContent`/`SidebarNav`/`TopbarNav`/`SarakShell` (todos internos ao Shell) | ✅ sempre | n/a | n/a | n/a |
| `panelResponsive.presets.ts` | — | 6 arquivos do painel (`ButtonsCatalog`, `CardsCatalog`, `InputsCatalog`, `PresetsCatalog`, `TypographyCatalog`, `PreviewCanvas`), cada um já dentro de um `@container` próprio | n/a | ✅ sempre (autocontido) | n/a | n/a |
| `useStructuralStyles.ts`/`.presets.ts` | `getGridStyles` (`col-12`/`masonry`/presets) | `SarakGrid`, `SarakActionCard`, `SarakCardGrid`, `SarakCatalogGrid`, `SarakManagementGrid`, `SarakStats` (públicos) + `SarakCoreCard`, `AuthSocialLogin` (internos, mas com `getGridStyles` PRÓPRIO) | ✅ (herda) | ✅ (herda) | ❌ **sem `@container` em lugar nenhum — medido real em `plan-40` (`col-12` travado em 1 coluna de 500 a 1440px)** | ❌ sem container nenhum |
| `useStructuralStyles.ts` | `getResponsiveStackStyles` | `SarakCardGrid`, `SarakCatalogGrid` | ✅ | ✅ | ❌ | ❌ |
| `useStructuralStyles.ts` | `getHeaderStyles` | `SarakCatalogGrid`, `SarakManagementGrid`, `SarakTable` | ✅ | ✅ | ❌ | ❌ |
| `useStructuralStyles.ts` | `getResponsiveSpacingStyles` | `ExpandableCard` (portal em `document.body`, fora da subárvore da raiz do card) | ✅/❌ — **não importa**: o portal escapa de qualquer container plantado na raiz do card, inclusive do `SarakShell` acima | idem | ❌ | ❌ |

**A conclusão do Passo 1, e é o que decide o Passo 2:** os 3 arquivos internos ao Shell (`ShellContent`,
`TopbarNav`, `useShellLayoutStyles`) **nunca são montáveis fora do `SarakShell`** — não são exportados no
barril (`grep -n "TopbarNav\|ShellContent\|useShellLayoutStyles" src/index.ts` → vazio) — então **sempre**
têm o container do Shell. `panelResponsive.presets.ts` está inteiramente contido no painel, que já planta o
seu. **O defeito real mora inteiro em `useStructuralStyles.ts`**, consumido por **10 componentes** — 8
públicos (exportados no barril, montáveis pelo consumidor em qualquer topologia) e 2 internos que emitem a
classe por conta própria (não herdam automaticamente de quem os hospeda).

## Passo 2 — a decisão, com o custo medido

**Antes de escolher entre A/B/C, medi empiricamente (Chromium real, não jsdom) se `container-type` no MESMO
elemento que a classe `@min-[…]` funciona.** Não funciona: `container-type` estabelece contexto para os
DESCENDENTES, nunca para o próprio elemento.

```
Elemento com container-type NUM ANCESTRAL, classe @min-[…] num filho → grid-template-columns: repeat(12,1fr) ✅
Elemento com container-type EM SI MESMO, classe @min-[…] no mesmo elemento → grid-template-columns: 1fr ❌ (nunca casa)
```

Isso descartou de saída uma variante ingênua da Opção B ("adiciona `container-type` na mesma div do grid") —
teria o mesmo defeito que esta plan existe para consertar.

**Escolhi a Opção B** (cada componente que USA container query planta o seu) — **não** a A. A razão: a
`00-regras-e-invariantes` (`specs/specs/07-responsividade-e-multidispositivo.md` §1) é explícita — *"Se o
consumidor precisou escrever CSS para consertar um componente da lib no celular, é BUG DA LIB"* — e essa regra
não abre exceção para "componente solto sem cromo". A Opção A (só o `SarakAppChrome`) deixaria o átomo solto
— um uso de primeira classe da lib, no modo "kit de componentes" — permanentemente quebrado. Rejeitei
também porque o custo real da B **acabou sendo muito menor do que eu temia antes de medir**: em vez de
"wrapper novo em todo componente", verifiquei, componente por componente, se a classe `@min-[…]` já vive
DENTRO de uma árvore que TEM um elemento raiz existente (só precisa ganhar a classe `@container`) ou se o
componente é uma única div "achatada" (aí sim precisa de wrapper novo):

| Componente | Estrutura medida | Custo real |
|---|---|---|
| `SarakGrid` | raiz **É** a própria div do grid — sem lugar para plantar sem novo nó | **wrapper novo** (1 `<div className="@container w-full">` a mais) |
| `SarakStats` | idem — raiz é a própria div do grid | **wrapper novo** |
| `SarakActionCard` | raiz é `<motion.div>` do card; a classe `@min-[…]` vive dentro do painel expansível, várias camadas abaixo | **zero nós novos** — só `@container` na classe da raiz já existente |
| `SarakCardGrid` | raiz é uma `<div>` de layout; `cardsGrid`/`headerRow` são descendentes | **zero nós novos** |
| `SarakCatalogGrid` | idem | **zero nós novos** |
| `SarakManagementGrid` | idem | **zero nós novos** |
| `SarakTable` | idem | **zero nós novos** |
| `SarakCoreCard` | idem (raiz é `<motion.div>` do card) | **zero nós novos** |
| `AuthSocialLogin` | raiz é uma `<div>` de stack; o grid de provedores é filho | **zero nós novos** |
| `ExpandableCard` | a classe `@min-[…]` vive **dentro de um `createPortal`** (renderiza em `document.body`) — a raiz do card NÃO é ancestral no DOM real, mesmo estando "acima" na árvore React | **zero nós novos, mas no lugar certo**: plantei no `<motion.div>` que já é a raiz do PORTAL (`fixed inset-0…`), não na raiz do card |
| `SarakAuthScreen` | raiz é uma `<div>` que envolve `AuthForm`→`AuthSocialLogin` | **zero nós novos** |

**Resultado: 2 componentes com wrapper novo (`SarakGrid`, `SarakStats`), 8 com `@container` acrescentado a
uma classe já existente — zero nós novos.** É uma quarta nuance dentro da própria Opção B que a plan convida
a propor ("se a medição apontar uma saída melhor, proponha, com a medição") — não é uma opção D, é a Opção B
com o custo medido caso a caso, exatamente como a plan pediu.

## O que foi implementado

**10 componentes passaram a plantar `@container`** (arquivo:linha do trecho alterado):

- `src/components/atomic/Layouts/SarakGrid.tsx:56-66` — wrapper novo.
- `src/components/atomic/Templates/SarakStats.tsx:57-102` — wrapper novo (reindentado; nenhuma lógica mudou).
- `src/components/atomic/Cards/SarakActionCard.tsx:62-66` — `@container` na classe da raiz.
- `src/components/atomic/Templates/SarakCardGrid.tsx:144-146` — idem.
- `src/components/atomic/Templates/SarakCatalogGrid.tsx:89-92` — idem.
- `src/components/atomic/Templates/SarakManagementGrid.tsx:86-89` — idem.
- `src/components/atomic/Templates/SarakTable.tsx:83-86` — idem.
- `src/components/atomic/Cards/ExpandableCard.tsx:76-83` — na raiz do **portal**, não na raiz do card.
- `src/components/atomic/Templates/SarakAuthScreen.tsx:142-144` — idem (cobre `AuthSocialLogin` por herança).
- `src/components/atomic/Templates/components/SarakCoreCard.tsx:89-93` — idem.
- `src/components/atomic/Templates/components/AuthSocialLogin.tsx:19-21` — idem.

**Gate novo**, `gates/scripts/contrato/check-container-query-boundary.mjs`: falha se algum arquivo de
produção **chamar** `getGridStyles`/`getResponsiveStackStyles`/`getHeaderStyles`/`getResponsiveSpacingStyles`
**sem** conter a classe `@container` em algum elemento do mesmo arquivo. Registrado em `package.json` como
`container-query-boundary:check`. LIMITES DECLARADOS no próprio cabeçalho (R18, confirmado por
`gate-limits:check` → 31/31, era 30): é textual (não prova ancestralidade real em JSX, só coocorrência no
arquivo), não prova que a query casa (isso é browser real), é super-conservador em `getGridStyles` (marca
até o caso `'auto-fit'`, que não usa container query, porque o layout é resolvido em runtime pelo tema), e
não enxerga composição entre arquivos (hoje não é um problema — todo chamador se autossustenta, mas se
alguém depender de um ancestral em OUTRO arquivo no futuro, o gate acusaria sem motivo).

**Caso plantado, para provar que o gate falha de verdade** (não só passa): criei um arquivo temporário
chamando `getGridStyles()` sem `@container`, rodei o gate (`[ERROR] 1 arquivo(s)... exit 1`), confirmei a
falha, e apaguei o arquivo antes de continuar.

## Sobre o gate e `01-gates-e-baseline.md` — por que NÃO editei a spec

A §3.1 item 4 e a §9 desta plan pedem para "declarar o vão em `01-gates-e-baseline.md`". **Não editei esse
arquivo.** `specs/00-prompt-executor.md` §7.3 é uma proibição absoluta e sem exceção por plan: *"NUNCA crie
nem edite outra spec... `specs/`... são do revisor."* A própria `plan-41` §9 chama isso de **"Destino da
síntese"** — que, pelo ciclo SDD de `00-contexto.md` §5, é o que o `/spec-atualizar` faz **depois** da
aprovação, não o executor durante a execução. Interpretei a instrução da §3.1 item 4 como cumprida pelo
mecanismo que o R18 realmente cobra — **o vão declarado dentro do próprio gate**, verificado por
`gate-limits:check` (31/31) — e deixei a linha da tabela em `01-gates-e-baseline.md` para a síntese, como o
texto pronto para transporte da própria §9 já antecipa. Registro esta divergência de leitura explicitamente,
para o revisor decidir se concorda.

## Testes (R8) — e a ressalva de jsdom em cada um

Cada um dos 10 componentes ganhou um teste novo (ao lado do arquivo, nos `__tests__/` já existentes — nenhum
arquivo de teste novo, todos já tinham teste 1:1). **Todo teste novo tem, no comentário acima dele, a mesma
ressalva**: prova que o elemento com `container-type` (a classe `@container`) foi **plantado como ancestral**
do que emite `@min-[…]` — **não** prova que a container query **casou**, porque `jsdom` não tem motor de
layout e não avalia `@container`. A prova de que a query casa é browser real (é o que a `plan-40` fez, e é o
que uma eventual rodada seguinte da `plan-40` teria de repetir contra este conserto).

- `SarakGrid.test.tsx` — prova que o `firstElementChild` é o wrapper `@container` e que o grid (filho dele)
  **não** repete a classe (a distinção entre "quem planta" e "quem consome").
- `SarakStats.test.tsx` — idem.
- `SarakActionCard.test.tsx`, `SarakCardGrid.test.tsx`, `SarakCatalogGrid.test.tsx`,
  `SarakManagementGrid.test.tsx`, `SarakTable.test.tsx`, `SarakAuthScreen.test.tsx`, `SarakCoreCard.test.tsx`,
  `AuthSocialLogin.test.tsx` — `container.querySelector('[class*="@container"]')` não é `null`. **Não usei
  `container.firstElementChild`**: o `SarakUIProvider` injeta um efeito de ruído global (`fixed inset-0
  pointer-events-none z-[9999]…`) como primeiro filho quando o componente está sob o Provider — descobri isso
  porque os testes falharam contra esse elemento primeiro, não contra a raiz do meu componente. Registrado
  como achado abaixo, porque não é da minha alçada consertar aqui.
- `ExpandableCard.test.tsx` — clica em "Expandir Tela Cheia" (abre o portal) e busca
  `document.body.querySelector('[class*="@container"]')` — **não** `.fixed.inset-0`, porque esse seletor
  também casa com o mesmo efeito de ruído do Provider (`z-[9999]`) antes de casar com o meu overlay
  (`z-[99999]`) — outra instância do mesmo achado.

## `docs/migracoes.md`

Entrada nova, no topo, **classificada MAJOR** — mesmo critério da entrada da `plan-39` logo abaixo dela
(comportamento default muda sem opt-in). Tabela com os 9 componentes públicos afetados (os 2 internos,
`SarakCoreCard`/`AuthSocialLogin`, não aparecem — o consumidor não os importa diretamente; o benefício chega
por `SarakCardGrid`/`SarakAuthScreen`). Seção própria para a mudança de DOM em `SarakGrid`/`SarakStats` (o
único dos 10 com um nó a mais), com o "antes/depois" em HTML e o aviso sobre `ref`/seletor/snapshot.

## Verificações executadas (saída real, colada)

- `npx vitest run` (suíte INTEIRA) → **314 arquivos de teste, 1308 testes, 100% verde** (era 314/1297 no
  fechamento da `plan-40`; cresceu +11 — os 10 testes novos mais o placeholder que o `SarakGrid.test.tsx` já
  tinha).
- `node gates/scripts/audit/run_audit.mjs` → **2 auditores vermelhos** (`auditor_ghostvars` — 1 fantasma/1
  consumo, `--x`; `auditor_composicaoatomica` — 2, `SarakMultiSelect`/`SarakUploader`), **os dois já no
  baseline, nenhum novo**. `auditor_hardcoded`, `auditor_cleancode` e `auditor_coverage` — todos `[OK]`
  (confirma que nenhuma classe `@container` acionou o detector estrutural de hardcode, e que os 10 arquivos
  tocados continuam com teste 1:1).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `"igual ao baseline de 2026-08-11 —
  nenhuma regressão."`
- `npx tsc --noEmit` → **0 erros**.
- `npm run container-query:check` (o gate da `plan-39`) → `[OK]` — minhas edições não introduziram
  interpolação nem tocaram `sarak-base.css`.
- `npm run container-query-boundary:check` (o gate novo desta plan) → `[OK]` — depois do caso plantado acima
  provar a falha.
- `npm run gate-limits:check` → `[OK] Os 31 scripts... declaram o que não veem` (era 30).
- `git status --short` / `git diff --stat` → só os 10 componentes + seus testes (+ 2 snapshots atualizados),
  o gate novo, `package.json` (1 linha), `docs/migracoes.md`, mais a própria plan e o `00-indice.md`
  pré-existente (entrada das plans 40/41, não editado por mim — confirmado via `git diff` que a única
  diferença nesse arquivo já estava lá antes da minha primeira edição). **Nenhum arquivo do ERP** — esta plan
  não tem escopo lá e não toquei nele.

**Achados durante a execução, corrigidos no caminho (não são achados fora do escopo — nasceram das próprias
edições e foram consertados antes de fechar):**

- 2 testes quebraram por depender de `container.firstElementChild` sob `SarakUIProvider`, que na verdade é o
  efeito de ruído global do Provider, não a raiz do componente sob teste — corrigido trocando para
  `querySelector('[class*="@container"]')` em todos os 8 testes que usam Provider (não só os 2 que quebraram
  — os outros 6 tinham a mesma fragilidade, só não testados contra um Provider que expõe o efeito).
- `AuthSocialLogin.test.tsx` faltava `SarakUIProvider` — `SocialButton` (usado dentro do componente) chama
  `useSarakUI()` (não a variante opcional) e lança sem Provider. Corrigido envolvendo o teste.
- 2 snapshots (`SarakActionCard.test.tsx.snap`, `SarakCoreCard.test.tsx.snap`) precisaram de `vitest -u` —
  o `className` da raiz mudou de propósito (ganhou `@container`); conferi o diff do snapshot antes de aceitar
  a atualização, linha a linha, para confirmar que a ÚNICA mudança era a classe nova.
- `ExpandableCard.test.tsx` — meu primeiro seletor (`.fixed.inset-0`) casava com o MESMO efeito de ruído do
  Provider (também `fixed inset-0`, `z-[9999]`) antes de alcançar o overlay do portal (`z-[99999]`) —
  corrigido para `[class*="@container"]`.

**Critérios de aceite**

- [x] A tabela de topologias do passo 1 está no resumo, **datada antes** das edições de código — é a
      primeira seção deste resumo, e as edições de código só começaram depois de eu medir tudo isso.
- [x] A saída escolhida no passo 2 está declarada com o porquê e o custo assumido — Opção B, com a medição
      componente a componente (2 com wrapper novo, 8 sem nó novo).
- [x] `SarakGrid` com `col-12`, montado **sem** `SarakShell`, tem ancestral `@container` — evidência: teste +
      gate.
- [x] Cada teste novo declara que prova o plantio, não o casamento da query (comentário em cada um).
- [x] Gate novo `container-query-boundary:check`, com LIMITES DECLARADOS (R18), caso plantado provando a
      falha. A linha da TABELA em `01-gates-e-baseline.md` fica para a síntese (ver seção dedicada acima) —
      não é `⏳`/vão real, é fronteira de papel entre executor e revisor.
- [x] `docs/migracoes.md` com entrada classificada (MAJOR).
- [x] `npx vitest run` inteira, verde, não encolheu (314/1297 → 314/1308).
- [x] `run_audit` sem regressão; `npx tsc --noEmit` → 0; `container-query:check` verde.
- [x] `git diff --stat` — só os arquivos da §3.1, seus testes e `docs/`. **Nada no ERP.**

**Decisões e suposições**

- **Tratei "declare o vão em `01-gates-e-baseline.md`" como cumprido pelo mecanismo de R18 (LIMITES
  DECLARADOS no próprio gate + `gate-limits:check`), não como uma instrução para editar a spec diretamente**
  — ver seção dedicada acima. Se o revisor discordar, é uma linha simples de acrescentar na síntese.
- **`SarakStats.tsx` foi reindentado inteiro** (79 linhas no diff, mas nenhuma mudança de lógica) — o wrapper
  novo empurrou um nível de indentação em todo o JSX abaixo. Conferi visualmente que o `git diff` mostra só
  reindentação + a linha do wrapper, nada de comportamento novo.
- **Não toquei `SarakStack`** como componente próprio — ele não existe como componente exportado (confirmado:
  `getResponsiveStackStyles` é consumida só por `SarakCardGrid`/`SarakCatalogGrid`, já cobertos). O nome
  "`SarakStack`" nas plans anteriores refere-se ao PADRÃO de stack responsivo, não a um átomo isolado.
- **Interpretei "10 componentes" como o escopo real da Opção B**, incluindo os 2 internos
  (`SarakCoreCard`/`AuthSocialLogin`) que a plan não cita nominalmente — decidi incluí-los porque cada um
  chama `getGridStyles` **por conta própria** (não herdam a classe do pai automaticamente só por estarem
  aninhados) e meu próprio gate os teria acusado se eu não tivesse.

**Achados fora do escopo (não corrigidos)**

- **`SarakUIProvider` injeta um elemento de efeito de ruído global (`fixed inset-0 pointer-events-none
  z-[9999] opacity-[var(--sarak-noise-opacity,0)]…`) como um dos primeiros filhos da árvore renderizada.**
  Não é um defeito — é comportamento intencional (`--sarak-noise-opacity` sugere um efeito visual
  configurável) — mas quebrou 8 dos meus testes que assumiam `container.firstElementChild` como a raiz do
  componente sob teste. Não investiguei se esse padrão (`firstElementChild` assumindo ausência de efeitos
  globais) aparece em testes MAIS ANTIGOS de outros componentes também montados sob `SarakUIProvider` — é
  fora do escopo desta plan (eu só toquei nos 10 componentes dela), mas é um padrão de teste frágil que pode
  estar repetido em outros arquivos. Sugiro medir antes de assumir que é só nos meus.

**Pendências / riscos**

- **A prova de que a container query CASA de verdade, fora do `SarakShell`, ainda não existe em consumidor
  real.** Os testes desta plan (jsdom) provam só o plantio. Uma rodada seguinte da `plan-40` — reinstalar no
  ERP e medir `SarakGrid`/os outros 9 componentes num app que usa `SarakAppChrome` — é o que fecha o ciclo
  que a `plan-40` deixou aberto.
- **A linha da tabela em `01-gates-e-baseline.md` não foi escrita** — fica para `/spec-atualizar`, conforme a
  decisão registrada acima. Se o revisor quiser que o executor escreva essa linha em uma próxima rodada
  (fora do que `00-prompt-executor.md` §7.3 permite hoje), é uma mudança de processo, não desta plan.
- **`SarakGrid`/`SarakStats` ganharam um nó a mais no DOM** — documentado em `docs/migracoes.md` com o
  antes/depois, mas é uma mudança real de estrutura que pode pegar consumidor com `ref`/seletor/snapshot
  desprevenido, mesmo classificada corretamente como MAJOR.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-13 — 🟢 Aprovada

A execução acertou o alvo e ainda descobriu, por medição em navegador real, o detalhe de CSS que decidia
entre conserto e conserto-que-não-conserta. Aprovo — com dois erros meus reconhecidos e um achado de
integridade que não é desta plan.

### A descoberta que salvou o conserto

> *"`container-type` no MESMO elemento da classe não funciona — precisa de ancestral."*

Está certo, e é a diferença entre consertar e parecer consertar. Uma container query pergunta ao **ancestral**
com containment; o elemento nunca é container de si mesmo. Um conserto plausível — pôr `@container` junto
das classes `@min-[…]` — passaria em qualquer revisão de código e continuaria quebrado em runtime, com o
agravante de parecer resolvido.

**Verifiquei que o código respeita isso, e não só no exemplo:**

- `SarakGrid.tsx` — wrapper `<div className="@container w-full">` **envolvendo** o grid; o elemento do grid
  segue recebendo `className`/`style`/`...props` do consumidor, intacto.
- Varredura em todo `src/` por elemento que carregue `@container` **e** `@min-[…]` no mesmo `className` →
  **vazio**. Nenhum elemento é container de si mesmo.

### O passo 1 fez o que a plan pediu

Dos 6 arquivos que emitem `@min-[…]`: 3 são internos ao `SarakShell` e nunca montáveis fora dele
(container garantido), `panelResponsive.presets.ts` vive dentro do painel, que já se autossustenta desde a
`plan-35`, e **o defeito inteiro mora em `useStructuralStyles.ts`** — consumido por componentes que o
consumidor monta sob `SarakAppChrome` ou soltos, as duas topologias sem `@container` em lugar nenhum. Bate
com a medição da `plan-40` no consumidor real.

E a escolha da **Opção B** está justificada pelo argumento certo: a Opção A deixaria o átomo solto
permanentemente quebrado, contra o princípio de zero-config da [[07-responsividade-e-multidispositivo]].
Custo assumido e medido: **2 dos 10** precisaram de elemento novo; os outros 8 ganharam a classe numa raiz
que já existia.

### O gate declara a própria cegueira, e é a declaração certa

`check-container-query-boundary` passa verde, e o cabeçalho dele diz o que **não** vê: é textual, por
arquivo, prova que a string `@container` existe **em algum lugar** do mesmo arquivo — *"não prova que esse
elemento é de fato um ANCESTRAL, em JSX, do elemento que recebeu a classe `@min-[…]`. Um `@container` num
elemento irmão passaria neste gate e continuaria quebrado em runtime."*

É exatamente o vão que eu fui sondar, e estava declarado antes de eu perguntar. `gate-limits:check` → **31/31**.

### Gates

| | |
|---|---|
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `container-query:check` (plan-39) · `container-query-boundary:check` (plan-41) | **verdes** |
| `gate-limits:check` | **31/31** |
| `docs/migracoes.md` | **MAJOR**, e declara também o elemento a mais no DOM — não só a mudança de comportamento |
| Escopo | 11 componentes + testes + gate + `package.json` + `docs/`. **Nada do ERP. `SarakShell` intocado. Nenhum breakpoint alterado** |

### Dois erros meus, reconhecidos

**1. Pedi ao executor algo que o contrato dele proíbe.** A §3.1 item 4 desta plan manda declarar o vão em
`specs/specs/01-gates-e-baseline.md`. O [[00-prompt-executor]] §7 item 3 é explícito: *"NUNCA crie nem edite
outra spec… `specs/` e outras plans são do revisor."* **O executor está certo em recusar**, e a recusa veio
com a citação da regra — não como desculpa.

**2. E fui inconsistente:** pedi a mesma coisa na `plan-39`, o executor **fez**, e eu **aprovei**, elogiando
a declaração de R18 que ele escreveu lá. Ou seja: aprovei uma violação do contrato do executor por não ter
lido a minha própria plan contra o prompt dele. O texto que entrou em `01-gates-e-baseline.md` pela `plan-39`
é bom e fica — mas entrou pela porta errada, e o registro precisa dizer isso.

**Correção de método, para mim:** plan que precisa de linha em spec fixa declara isso no **destino da
síntese** (§9), nunca no escopo (§3.1). A síntese é minha, por `spec-atualizar`.

### 🔎 Achado que NÃO é desta plan — a suíte não é determinística

Rodei a suíte **três vezes** neste mesmo worktree, sem tocar em nada entre as execuções:

| Execução | Resultado |
|---|---|
| 1ª | **1 arquivo / 2 testes FALHARAM** (314 arquivos, 1306/1308) |
| 2ª | 314 / 1308 verde |
| 3ª | 314 / 1308 verde |

**Não consigo nomear os testes que falharam** — capturei só o `tail` da primeira execução e perdi o detalhe.
O erro de captura é meu.

Não reprovo a `plan-41` por isto: 2 de 3 execuções verdes, e **nada liga a falha a este diff**. Mas registro
com todas as letras, porque **"suíte verde" é a fundação de toda aprovação deste repositório** — inclusive
das seis que dei nesta leva. Se ela é intermitente, todas essas aprovações têm uma margem que ninguém
mediu. Vira plan própria: reproduzir com saída completa, nomear o teste, e ou consertar ou declarar como
dívida com o número na mão.

### O que esta revisão NÃO viu

**Que a coluna dupla apareceu na tela.** Todos os testes novos provam que o container **é plantado** — e
declaram isso no próprio corpo, como a plan exigiu. jsdom não avalia container query; nenhum teste daqui
pode provar o efeito. A prova é a próxima rodada da `plan-40`, no consumidor, com largura real.

E o **wrapper novo no DOM** de `SarakGrid`/`SarakStats` é a mudança que mais pode surpreender: um elemento a
mais entre um pai flex/grid e o conteúdo pode deslocar layout de maneiras que jsdom não vê. Está declarado
na entrada de migração, e é o primeiro item a olhar quando o consumidor rodar de novo.

### Destino da síntese

Declarado na §9, **não executado por mim**. Acrescente-se a linha do gate novo em
[[01-gates-e-baseline]] — que **é minha**, por `spec-atualizar`, e não do executor.
