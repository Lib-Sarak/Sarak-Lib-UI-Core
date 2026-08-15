---
tipo: "plan"
titulo: "col-12 continua quebrado — mudar o default só desviou dele"
dominio: "Sarak-Lib-UI-Core / Layout / Responsividade"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "responsividade", "layout", "defeito-ativo", "plan-47", "persistencia"]
relacionados: ["[[07-responsividade-e-multidispositivo]]", "[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[15-divida-conhecida]]"]
depende_de: "plan-47"
destino_sintese: "specs/specs/07-responsividade-e-multidispositivo.md · specs/specs/09-temas-e-presets.md"
objetivo: "`col-12` produz uma malha legível venha de onde vier — default, tema persistido ou seleção do usuário no painel — sem que nenhum consumidor precise limpar dado ou escrever CSS"
---

# 1. Objetivo

`layoutGridTemplate: 'col-12'` produz uma malha em que **cada filho ocupa uma célula legível**, sem que o
consumidor declare span, escreva CSS ou apague dado persistido.

# 2. Contexto

## 2.1 O que a `plan-47` consertou, e o que ela não tocou

A `plan-47` (🟢 2026-08-15) trocou o **default** de `layoutGridTemplate` de `'col-12'` para `'auto-fit'`.
A execução foi correta e está aprovada — **ela não é para ser revertida.**

Mas ela escolheu, entre as saídas que **eu** ofereci, a que **desvia** do defeito em vez de consertá-lo.
`col-12` continua exatamente como estava: `grid-cols-1 @min-[768px]:grid-cols-12`, doze trilhas, um filho
por trilha, **nenhum mecanismo de span**. Trocar o default só mudou quem cai nele por omissão.

## 2.2 A medição no consumidor, 2026-08-15 — depois da `plan-47` instalada

O dono reinstalou e a tela **não mudou**: a aba Propostas do ERP segue com sete tiras verticais, título
truncado e texto atravessando o card vizinho. Investiguei fonte por fonte, e eliminei todas as hipóteses
fáceis antes de chegar na verdadeira:

| Hipótese | Verificação | Resultado |
|---|---|---|
| Build velho no consumidor | `BUILD_INFO` instalado + chunks | ❌ eliminada — `builtAt 04:51`, chunks novos |
| Cache do Vite servindo bundle velho | `.vite/deps/` mtime + nomes de chunk | ❌ eliminada — regerado, chunks novos |
| Classe sem regra no CSS (o defeito da `plan-39`) | seletor no CSS instalado | ❌ eliminada — `.grid-cols-\[repeat\(auto-fit\,minmax\(280px\,1fr\)\)\]` presente em `sarak.css` **e** `sarak-scoped.css` |
| Algum tema embarcado ainda com `col-12` | 26 arquivos de tema | ❌ eliminada — só 5 declaram o token, todos já `auto-fit` |
| Cache do navegador | teste em **guia anônima** | ❌ eliminada — mesmo resultado |
| **Valor persistido vencendo o default** | `GET /api/v1/conector/tema` | ✅ **CONFIRMADA** |

```
GET http://127.0.0.1:3000/api/v1/conector/tema
  → design.layoutGridTemplate = "col-12"
  → activeThemeId = "erp-corporativo"
  → 425 chaves no dicionário persistido
```

**Guia anônima não muda nada porque o valor não está no navegador — está no servidor.** Todo navegador,
toda máquina, toda aba nova busca de lá e recebe `col-12`.

## 2.3 As três portas por onde `col-12` chega, e nenhuma delas é ilegítima

Trocar o default não fecha nenhuma:

| Porta | Onde | Por que é legítima |
|---|---|---|
| **Tema persistido** | `useDesignManager.ts:97-101` — `{ ...seed, ...salvo }`; e `useDesignRemoteLoader.ts:51` — `{ ...prev, ...remoto }` | é o contrato de persistência que as plans 34/38/42/43 construíram. Valor salvo **deve** vencer default, senão toda atualização da lib apagaria o tema do usuário |
| **Seleção do usuário no painel** | `schema/structural.ts:52-56` — a opção **"Colunas (12)"** é oferecida na UI | o painel existe para o usuário final escolher. Uma opção oferecida não pode entregar tela quebrada |
| **Tema customizado do importador** | qualquer `design` que o consumidor monte | idem |

**Enquanto `col-12` estiver quebrado, o painel de Design oferece um botão que quebra a tela.**

## 2.4 O erro de método, que é meu e não do executor

Eu ofereci a Saída D na `plan-47` e aprovei o resultado. O executor fez exatamente o que a plan pedia, mediu
em navegador real e relatou com honestidade — **a execução dele não tem defeito**. O defeito é da minha
escopagem: eu tratei *"qual é o default"* como se fosse o problema, quando o problema era *"o que `col-12`
faz"*. Mudar o default é o conserto que passa em todos os gates e continua quebrado na tela do usuário.

E não foi por falta de contexto: as plans 34, 38, 42 e 43 desta mesma fila são **inteiramente sobre
persistência de tema**. Eu tinha lido as quatro e ainda assim escrevi uma plan cuja solução não alcança
valor persistido.

# 3. Escopo

## 3.1 Dentro

1. **`src/components/atomic/hooks/useStructuralStyles.ts:34-38`** — a estratégia `col-12`.
2. **Testes companheiros** de `useStructuralStyles`, `SarakGrid`, `SarakManagementGrid`, `SarakForm`.
3. **`docs/migracoes.md`** — entrada classificada por [[03-versionamento-e-release]] §3.

## 3.2 Fora

- ⛔ **Reverter a `plan-47`.** `auto-fit` continua sendo o default. Esta plan conserta a **outra** opção.
- ⛔ **Remover `col-12` do schema ou do painel.** Tirar a opção é fugir do problema, e quebraria todo tema
  que já a persistiu. Ela tem de **funcionar**, não sumir.
- ⛔ **Tocar no ERP Earendel — inclusive nos DADOS dele.** Ver §5, passo 4: o registro com `col-12` é o
  *fixture* desta plan. Apagar campo do banco do consumidor é a gambiarra que esta plan existe para tornar
  desnecessária.
- ⛔ **Escrever migração de dado persistido.** É problema real, é de outra plan, e não é este. Aqui o valor
  antigo continua válido — ele passa a **funcionar**.
- ⛔ **Mudar número de breakpoint** (640/768/1024/1280 continuam) ou mexer no `@container` da `plan-41`.
- ⛔ **Redesenhar aparência.** O escopo é quantas colunas e de que largura.
- ⛔ **Mexer em `masonry`, nos presets nomeados ou em quem passa `templateColumns` explícito.**

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-47-…md` — §5 **Saída A** e o veredito | a opção que não foi escolhida e a armadilha já documentada nela |
| Plan | `specs/plan/plan-44-…md` | como NÃO escrever classe de container query em comentário — já derrubou o build duas vezes |
| Plan | `specs/plan/plan-39-…md` | classe montada por interpolação nunca vira CSS. **Toda classe nova é literal** |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §1 · §6 | zero-config e a camada 3 |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | `col-12` é opção oferecida ao usuário final |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R8 · R20 | teste ao lado; baseline não regride |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |
| Código | `useStructuralStyles.ts:17-52` · `SarakGrid.tsx:56-83` (o wrapper `@container` da plan-41) | ler antes de editar |

# 5. Instruções de execução

## Passo 1 — resolver a armadilha de especificidade ANTES de escolher a forma

A `plan-47` §5 já documentou o risco, e ele é o coração desta plan:

> um seletor de filho (`[&>*]:col-span-N`) tem especificidade **maior** que uma classe `col-span-N` no
> próprio filho — a regra do pai **venceria** o span que o consumidor declarar.

**Isso é inaceitável:** quebraria todo consumidor que já usa `col-12` corretamente, com spans próprios. Não
é hipótese — é o público-alvo de um grid de 12 colunas.

Resolva **antes** de implementar, e **prove com teste**. Duas direções conhecidas (há outras — proponha,
com a medição):

- **`:where()`** — `[&>*:where(*)]` ou equivalente zera a especificidade do seletor, deixando qualquer
  classe no filho vencer. É o mecanismo padrão de CSS para exatamente este caso.
- **span aplicado só quando o filho não declara o seu** — mais frágil, exige detectar a ausência.

**Declare a escolha, o porquê, e o teste que a sustenta.**

## Passo 2 — a forma da malha

`col-12` continua sendo um grid de **12 colunas** — isso não muda, é o significado do nome e o que o painel
promete. O que muda é que o filho que **não** declara span passa a receber um default sensato, de modo que
N filhos soltos formem uma malha legível, com **1 coluna no celular**.

A plan **não** fixa os números: escolha, e responda com eles no resumo — *"`col-12` com 8 filhos e nenhum
span dá quantas colunas em 1280px, 1024px, 768px e 400px?"*

⚠️ **Toda classe nova é escrita LITERAL** (`plan-39`) — o scanner do Tailwind lê o arquivo como texto, e
classe montada por interpolação nunca gera CSS. E **em comentário, nunca cole prefixo + medida + utilitário
num trecho contínuo** (`plan-44`) — foi isso que derrubou `npm run build` duas vezes.

## Passo 3 — medir em navegador real

jsdom não avalia container query nem mede layout. Cole no resumo o `grid-template-columns` **e o
`grid-column` de um filho**, computados em **1280 / 1024 / 768 / 400px**, para dois casos:

1. filho **sem** span declarado → recebe o default;
2. filho **com** `col-span-6` próprio → **o dele vence**.

## Passo 4 — a prova que fecha esta plan, e ela não é em jsdom

> **Não limpe o dado do ERP. Ele é o fixture.**

O conector do ERP tem `layoutGridTemplate: "col-12"` persistido (§2.2), e **deve continuar tendo**. A prova
de que esta plan funcionou é: reinstalar a lib no ERP, **sem tocar em um byte do consumidor**, e a aba
Propostas ficar legível.

Você **não** roda essa prova — não é seu escopo tocar no ERP, nem para instalar. **Declare no resumo que ela
é o passo do dono**, e diga exatamente o que ele deve ver. Se a sua correção precisa que alguém apague dado,
ela não é a correção.

## Passo 5 — fechar, colando a saída real

`npx vitest run` (INTEIRA) · `node gates/scripts/audit/run_audit.mjs` ·
`node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` ·
`npm run container-query:check` · `npm run container-query-boundary:check` · `npm run build` ·
`git diff --stat`.

> `npm run build` entra na lista **de propósito**: esta plan cria classe de container query nova, e é
> exatamente aí que a `plan-44` quebrou duas vezes. Rodar só o `vitest` não pega isso.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-49-col-12-continua-quebrado.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/plan/plan-47-grid-default-coloca-cada-filho-em-um-doze-avos.md (a §5 Saída A
E o veredito), specs/plan/plan-44 e plan-39 (por que classe se escreve LITERAL e
por que comentário derruba o build),
specs/specs/07-responsividade-e-multidispositivo.md §1 e §6,
specs/specs/06-painel-de-customizacao-e-preview.md.
Skills: padrao-escrita, padrao-typescript, test-unitario.

O DEFEITO: `col-12` (useStructuralStyles.ts:34-38) entrega 12 trilhas com um filho
por trilha e NENHUM mecanismo de span. A plan-47 trocou o DEFAULT para longe dele,
mas não o consertou — e `col-12` chega por três portas legítimas: tema persistido,
seleção do usuário no painel ("Colunas (12)") e tema customizado.

MEDIDO NO CONSUMIDOR, 2026-08-15, DEPOIS da plan-47 instalada: a tela do ERP NÃO
mudou. Build novo instalado, cache do Vite regerado, CSS com a regra correta, guia
anônima — tudo eliminado. O que sobrou:
  GET /api/v1/conector/tema → design.layoutGridTemplate = "col-12" (425 chaves)
O valor está no SERVIDOR, não no navegador. Por isso guia anônima não muda nada.

PASSO 1, ANTES DE ESCOLHER A FORMA — resolva a armadilha de especificidade: um
seletor de filho (`[&>*]:col-span-N`) VENCE uma classe `col-span-N` no próprio
filho. Isso quebraria todo consumidor que já usa col-12 com spans próprios — que é
o público-alvo de um grid de 12 colunas. `:where()` zera especificidade e é o
mecanismo padrão para isto. Escolha, declare o porquê, e PROVE COM TESTE.

PASSO 2 — col-12 continua sendo 12 colunas (é o que o nome e o painel prometem).
O que muda: filho SEM span declarado ganha um default sensato, e 1 coluna no
celular. Responda com NÚMEROS: 8 filhos sem span dão quantas colunas em
1280/1024/768/400px?

PASSO 3 — MEÇA EM NAVEGADOR REAL. Cole grid-template-columns E o grid-column de um
filho, nas 4 larguras, para: (a) filho sem span; (b) filho com col-span-6 próprio,
que TEM de vencer.

PASSO 4 — NÃO limpe o dado do ERP; ele é o fixture. A prova é reinstalar a lib e a
tela ficar certa SEM tocar em um byte do consumidor. Você não roda essa prova (não
toca no ERP nem para instalar) — declare no resumo que é o passo do dono e o que
ele deve ver. Se a sua correção exige apagar dado, ela não é a correção.

LINHAS VERMELHAS:
  · Você NÃO reverte a plan-47. `auto-fit` continua o default.
  · Você NÃO remove `col-12` do schema nem do painel. Ela tem de FUNCIONAR.
  · Você NÃO escreve migração de dado persistido (é outra plan).
  · Você NÃO toca no ERP, nem no código nem nos dados.
  · Você NÃO muda breakpoint nem mexe no @container da plan-41.
  · Toda classe nova é LITERAL (plan-39). Em comentário, NUNCA cole prefixo +
    medida + utilitário num trecho contínuo (plan-44 derrubou o build 2x).

Rode `npm run build` no fecho, além do vitest — classe de container query nova é
exatamente onde a plan-44 quebrou. Teste ao lado (R8), cada um declarando o que
prova e o que NÃO prova. Não commite. Ao terminar, escreva o resumo na própria plan
e mova o status para 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] A solução da armadilha de especificidade está declarada **com o porquê**, e há **teste** provando que
      um filho com `col-span-6` próprio **vence** o span default do pai.
- [ ] A resposta em números está no resumo: `col-12` com 8 filhos sem span → colunas em 1280/1024/768/400px.
- [ ] Medição em **navegador real** colada no resumo, com `grid-template-columns` **e** `grid-column` do
      filho, nos dois casos (com e sem span próprio). Medição só em jsdom **não atende**.
- [ ] `col-12` no celular → **1 coluna**.
- [ ] `col-12` continua existindo no schema e como opção do painel — nada removido.
- [ ] `SarakGrid`, `SarakManagementGrid` e `SarakForm` sob `col-12` não emitem mais a forma quebrada —
      evidência: teste em cada um.
- [ ] Quem passa `templateColumns` explícito **continua** vencendo — evidência: teste.
- [ ] Toda classe nova é literal no fonte; nenhum comentário cola prefixo+medida+utilitário.
- [ ] O resumo declara que **a prova final é do dono**, sem tocar no ERP, e o que ele deve ver.
- [ ] `docs/migracoes.md` com entrada classificada.
- [ ] `npx vitest run` inteira, verde, sem encolher. **`npm run build` passa.**
- [ ] `run_audit` sem regressão; `npx tsc --noEmit` → 0; `container-query:check` e
      `container-query-boundary:check` verdes.
- [ ] `git diff --stat` — só os arquivos da §3.1. **Nada do ERP.**

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

# a estratégia col-12 depois desta plan
grep -n "col-12" src/components/atomic/hooks/useStructuralStyles.ts

# toda classe nova tem regra no CSS gerado? (o defeito da plan-39)
npm run build
grep -o 'col-span[^{}]*{[^}]*}' dist/sarak.css | head

# nenhum breakpoint mudou; o @container segue plantado
git diff -U0 -- src | grep -E "^[+-].*@min-\["
grep -rl "@container" src/components/atomic/ --include=*.tsx | grep -v __tests__ | wc -l

npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
```

**Verificação minha, no consumidor, antes de aprovar:** `GET /api/v1/conector/tema` tem de **continuar**
respondendo `layoutGridTemplate = "col-12"`. Se o valor sumiu, alguém "consertou" limpando dado — e isso
**reprova**, mesmo que a tela esteja bonita.

**O que reprova:**

- span do pai vencendo o span declarado pelo filho (quebra quem já usa `col-12` direito);
- `col-12` removido do schema/painel em vez de consertado;
- dado do consumidor alterado — por qualquer motivo;
- classe nova montada por interpolação, ou comentário que derruba o `npm run build` (`plan-44`);
- `auto-fit` deixando de ser o default (reversão disfarçada da `plan-47`);
- medição só em jsdom apresentada como prova de layout.

# 9. Destino da síntese

**Destino:** `specs/specs/07-responsividade-e-multidispositivo.md` · `specs/specs/09-temas-e-presets.md`

**Texto pronto para transporte:**

- **`07-responsividade-e-multidispositivo.md` §6** ganha a regra que esta plan comprova, e que vale além do
  grid: **trocar um default não conserta a opção quebrada, só muda quem cai nela.** Enquanto a opção existir
  no schema, ela chega por tema persistido e por escolha do usuário no painel — duas portas que nenhum
  default alcança. O incidente do ERP (2026-08-15) é a evidência: `plan-47` aprovada, gates verdes, tela
  idêntica.
- **`09-temas-e-presets.md`** ganha a consequência para quem projeta token: **todo valor oferecido no schema
  é um contrato com o usuário final** — o painel o oferece, o tema o persiste, e ele sobrevive a
  atualizações da lib por desenho. Valor que não funciona não é "default ruim", é opção quebrada, e o
  conserto é fazê-la funcionar ou removê-la do schema — nunca deixá-la de pé e desviar o default.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-08-15

**Resultado:** Concluído

## Passo 1 — a armadilha de especificidade, resolvida ANTES de implementar

A plan já media o risco: `[&>*]:col-span-N` (um seletor de filho no PAI) e `.col-span-N` (uma classe no
PRÓPRIO filho) compilam para o **mesmo class name inteiro** virando o seletor — `.\[\&\>\*\]\:col-span-N > *`
tem especificidade **(0,1,0)**, exatamente igual a `.col-span-N` **(0,1,0)**. Empate de especificidade se
resolve por **ordem de geração do CSS**, não por "quem o consumidor escreveu por último" — e essa ordem é
implementação interna do Tailwind, não algo que o autor do filho controla. Confirmei isso segurando o
mecanismo ingênuo antes de escolher a saída.

**Escolhi `:where()` ao redor da referência ao próprio grid** (a saída que a própria plan já indicava como
"mecanismo padrão de CSS para exatamente este caso"): `[:where(&)>*]:col-span-N`. `:where()` zera a
especificidade de **tudo** que carrega dentro — inclusive `&` (a referência ao seletor do próprio elemento) —
então o seletor final fica `:where(.CLASSE-INTEIRA) > *`, especificidade **(0,0,0)**. Qualquer classe de span
no filho, mesmo a mais simples (`.col-span-6`, (0,1,0)), vence **sempre**, **não importa a ordem de geração do
CSS** — o desempate por especificidade acontece antes de qualquer desempate por ordem.

**Prova, em três camadas:**

1. **CSS gerado** (`npm run build:css`, isolado, antes de tocar em mais nada): `dist/sarak.css` passou a
   conter exatamente `:where(.\@min-\[768px\]\:\[\:where\(\&\)\>\*\]\:col-span-6)>*{grid-column:span
   6/span 6}` — confirma que o Tailwind aceita a sintaxe e o `lightningcss` (o mesmo que quebrou o build duas
   vezes nas plans 39/44) não recusa `:where()`.
2. **Teste jsdom** (`useStructuralStyles.presets.test.ts`, `useStructuralStyles.test.ts`,
   `SarakGrid.test.tsx`, `SarakManagementGrid.test.tsx`, `SarakForm.test.tsx`) — prova que a classe é a
   emitida corretamente e que a classe do filho sobrevive intacta no DOM; **não prova cascata** (jsdom não
   resolve especificidade CSS real), e cada teste diz isso no próprio corpo.
3. **Medição em Chromium real** (Passo 3, abaixo) — a prova que fecha: um filho com `col-span-6` **próprio**
   ficou com `grid-column: span 6 / span 6` computado nas 4 larguras, **mesmo onde o default da largura seria
   outro** (`span 3` a 1280px, `span 4` a 1024px) — o filho sempre venceu.

## Passo 2 — a forma da malha, com os números

`col-12` continua sendo um grid de **12 colunas fixas** — não mudei `grid-cols-1 @min-[768px]:grid-cols-12`.
O que mudei: o filho que **não** declara span próprio ganha um default por breakpoint, usando os MESMOS
números de breakpoint já existentes (`BREAKPOINT_TABLET`=768, `BREAKPOINT_DESKTOP`=1024, `BP_XL`=1280 — os
três já usados pelos presets nomeados `cardsStandard`/`catalogStandard`, nenhum breakpoint novo):

| Breakpoint | Default de span | Colunas visuais (12 ÷ span) |
|---|---|---|
| < 768px (base) | nenhum (filho fica `auto` = span 1; só 1 trilha existe) | 1 |
| ≥ 768px | `col-span-6` | 2 |
| ≥ 1024px | `col-span-4` | 3 |
| ≥ 1280px | `col-span-3` | 4 |

**A pergunta que decide, em números** — `col-12` com 8 filhos e nenhum span: **4 colunas em 1280px · 3
colunas em 1024px · 2 colunas em 768px · 1 coluna em 400px** — medido em Chromium real (Passo 3), e são os
MESMOS números que `auto-fit` já entrega no caminho zero-config (`plan-47`) — a lib passa a se comportar de
forma consistente entre a estratégia default e a estratégia escolhida manualmente.

Não usei nenhum breakpoint novo (640/768/1024/1280 continuam os únicos), e toda classe nova é **literal**
(`plan-39`) — sem interpolação, sem prefixo+medida+utilitário colados num texto de comentário contínuo
(`plan-44`): os comentários que escrevi descrevem o mecanismo em prosa, sem soletrar `@min-[…]:algo`.

## Passo 3 — medição em navegador real (Chromium via Playwright CT)

jsdom não resolve cascata CSS nem motor de layout — a prova de especificidade e de largura real só existe em
navegador. Escrevi um spec temporário (`src/components/atomic/Layouts/__tests__/__tmp-plan49-measure.spec.tsx`,
**apagado após medir, não está no diff final**) que monta `<SarakUIProvider config={{ layoutGridTemplate:
'col-12' }}>` (achado no caminho: `SarakThemePayload` é **flat** — `Partial<SarakDesignTokens> &
extras` — o token vai direto na raiz do `config`, não sob uma chave `design` aninhada; meu primeiro rascunho
tentou `config={{ design: { layoutGridTemplate: 'col-12' } }}` e o override **não pegou**, caindo de volta no
`auto-fit` — os números batiam exatamente com os do `auto-fit` da `plan-47`, o que denunciou o erro antes de
eu confiar na medição errada) com `<SarakGrid>` de 8 filhos, medindo `getComputedStyle` nas 4 larguras, em
dois casos. Saída real, colada sem edição:

```
CASO 1 — filho SEM span próprio (recebe o default):
WIDTH=1280px gridTemplateColumns="106.656px ×12" child.gridColumn="span 3 / span 3"   → 12÷3 = 4 colunas
WIDTH=1024px gridTemplateColumns="85.3281px ×12" child.gridColumn="span 4 / span 4"   → 12÷4 = 3 colunas
WIDTH=768px  gridTemplateColumns="64px ×12"       child.gridColumn="span 6 / span 6"   → 12÷6 = 2 colunas
WIDTH=400px  gridTemplateColumns="400px"          child.gridColumn="auto"              → 1 coluna

CASO 2 — filho COM col-span-6 PRÓPRIO (tem de vencer o default do pai):
WIDTH=1280px gridTemplateColumns="106.656px ×12" child.gridColumn="span 6 / span 6"  ← venceu o default (span 3)
WIDTH=1024px gridTemplateColumns="85.3281px ×12" child.gridColumn="span 6 / span 6"  ← venceu o default (span 4)
WIDTH=768px  gridTemplateColumns="64px ×12"       child.gridColumn="span 6 / span 6"  ← igual ao default (span 6)
WIDTH=400px  gridTemplateColumns="400px"          child.gridColumn="span 6 / span 6"  ← não há default ativo; classe própria vale
```

**O que isso prova:** em TODAS as 4 larguras, um filho com span próprio mantém o PRÓPRIO valor —
inclusive nas duas larguras (1280px, 1024px) onde o default do pai seria um número **diferente**. É a prova
de que `:where()` realmente zera a especificidade do lado do pai e o filho vence sempre, não só quando os
valores coincidem.

## Implementação

**`src/components/atomic/hooks/useStructuralStyles.presets.ts`** — a `Record` de estratégias de grid
(`gridStrategies`, antes local a `useStructuralStyles.ts`) foi **extraída para cá** como
`GRID_LAYOUT_STRATEGIES`, no mesmo idioma de `RESPONSIVE_GRID_PRESETS`/`RESPONSIVE_SPACING_PRESETS` que já
moram neste arquivo. `'col-12'` ganhou os três segmentos de default de span; `'auto-fit'`/`'masonry'`
permanecem byte-a-byte idênticos.

**`src/components/atomic/hooks/useStructuralStyles.ts`** — importa `GRID_LAYOUT_STRATEGIES` do companion no
lugar do `Record` local; `getGridStyles` inalterado na assinatura e no comportamento fora do valor da
estratégia `col-12`.

**Nenhum outro arquivo de produção mudou** — `SarakGrid.tsx`, `SarakManagementGrid.tsx`, `SarakForm.tsx`,
`schema/structural.ts` e os 5 temas continuam exatamente como a `plan-47` os deixou. `col-12` continua no
schema e na opção "Colunas (12)" do painel — nada removido, nenhuma migração de dado.

## Testes (R8) — cada um declarando o que prova e o que NÃO prova

| Arquivo | O que foi adicionado |
|---|---|
| `useStructuralStyles.presets.test.ts` | Teste novo: `GRID_LAYOUT_STRATEGIES['col-12']` bate literal com `BREAKPOINT_TABLET`/`BREAKPOINT_DESKTOP`/`BP_XL` — protege o número do breakpoint (razão da `plan-39`), agora nos 4 segmentos da string. |
| `useStructuralStyles.test.ts` | O teste de `col-12` como escolha explícita (da `plan-47`) foi atualizado para a string nova, inteira. Teste novo: com `templateColumns` explícito, o default de span **não entra** — a forma continua `'grid w-full'`, sem os segmentos de `col-span`. |
| `SarakGrid.test.tsx` | 2 testes novos: (1) sob `col-12` explícito, a malha emite os 3 segmentos de default de span (não mais a forma sem span nenhum); (2) um filho com `col-span-6` **próprio** mantém a classe intacta no DOM (a vitória em cascata é a medição do Passo 3, não este teste). |
| `SarakManagementGrid.test.tsx` | 1 teste novo: sob `col-12`, o grid de grupos emite o default de span. |
| `SarakForm.test.tsx` | 1 teste novo: sob `col-12`, o grid de campos emite o default de span. |

## `docs/migracoes.md`

Entrada nova no topo, **classificada MAJOR** (muda o comportamento visual de uma opção já selecionável —
schema, painel, tema persistido — sem tocar em assinatura pública), com a tabela antes×depois usando os
números medidos no Passo 3, a explicação de por que quem já controla `span` não é afetado, e a nota
explícita: **nada a migrar** — quem tinha `col-12` persistido (como o ERP) recebe o conserto automaticamente.

## Verificações executadas (saída real, colada)

- `npx vitest run` (suíte INTEIRA) → **316 arquivos de teste / 1357 testes, 100% verde** (era 316/1351 no
  fechamento da `plan-47` — cresceu +6, exatamente os testes novos listados acima).
- `node gates/scripts/audit/run_audit.mjs` → **2 auditores vermelhos** (`auditor_ghostvars` — 1 fantasma
  `--x`; `auditor_composicaoatomica` — 2, `SarakMultiSelect`/`SarakUploader`), **ambos já no baseline antes
  desta plan** — confirmado pelo `check-audit-baseline`, abaixo. `auditor_cleancode` → `[OK]` (a extração
  para `.presets.ts` manteve os dois arquivos sob o teto de 250 linhas: 241 + 41).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `"[audit:baseline] igual ao baseline de
  2026-08-11 — nenhuma regressão."`
- `npx tsc --noEmit` → **0 erros**, sem saída.
- `npm run container-query:check` → `[OK] Nenhuma classe de container query (@min-[…]) montada por
  interpolação ou com medida inválida...` — a nova classe `@min-[768px]:[:where(&)>*]:col-span-6` **não**
  forma candidato para o detector de medida inválida (o caractere logo após `]:` é `[`, não uma letra — o
  regex do gate exige `[A-Za-z]` ali), e como a medida (768/1024/1280) é sempre válida, não haveria problema
  de qualquer forma.
- `npm run container-query-boundary:check` → `[OK] Todo arquivo que chama getGridStyles/... também contém a
  classe @container.` — `useStructuralStyles.presets.ts` não CHAMA nenhuma dessas funções (só exporta a
  `Record` de strings), então fica fora do escopo desse gate por definição, sem precisar de `@container`
  nele.
- **`npm run build`** (o comando que a plan pede EXPLICITAMENTE por causa do histórico das plans 39/44) →
  **exit 0**, `grep -ci "invalid\|error"` na saída completa → **0**. `build:css` e `build:css:scoped`
  passaram sem nenhum warning. Conferido no artefato final: `dist/sarak.css` contém
  `@container (min-width:768px){:where(.\@min-\[768px\]\:\[\:where\(\&\)\>\*\]\:col-span-6)>*{grid-column:
  span 6/span 6}}` (e os equivalentes 1024/1280) — a regra que o Passo 1 previu está no CSS publicado, não só
  no código-fonte.
- `git diff --stat -- src/ docs/` → só `useStructuralStyles.ts`, `useStructuralStyles.presets.ts`, os 5
  arquivos de teste e `docs/migracoes.md` — exatamente a §3.1. `git status --short` mostra também `dist/*`
  (subproduto do `npm run build` mandatório — nomes de chunk com hash mudam a cada rebuild do `tsup`, não é
  edição manual) e `dist/BUILD_INFO.json`/`specs/00-indice.md`/`specs/plan/plan-47-…md` **já estavam
  modificados antes desta execução começar** (confirmado no `git status` do início da conversa — não são
  meus). **Nenhum arquivo do ERP.**

**Critérios de aceite**

- [x] A solução da armadilha de especificidade está declarada com o porquê, e há teste provando que um filho
      com `col-span-6` próprio vence o span default do pai — Passo 1 (jsdom prova a forma; Chromium, colado
      no Passo 3, prova a vitória em cascata nas 4 larguras, inclusive onde o default seria diferente).
- [x] A resposta em números está no resumo — Passo 2/3: 4 · 3 · 2 · 1 colunas em 1280/1024/768/400px, sem
      span.
- [x] Medição em navegador real colada, com `grid-template-columns` **e** `grid-column` do filho, nos dois
      casos — Passo 3.
- [x] `col-12` no celular → 1 coluna — evidência: medição (400px → `gridTemplateColumns="400px"`,
      `gridColumn="auto"`).
- [x] `col-12` continua existindo no schema e como opção do painel — nada removido (não toquei em
      `schema/structural.ts` nem nos temas nesta plan).
- [x] `SarakGrid`, `SarakManagementGrid` e `SarakForm` sob `col-12` não emitem mais a forma quebrada —
      evidência: teste em cada um.
- [x] Quem passa `templateColumns` explícito continua vencendo — evidência: teste novo em
      `useStructuralStyles.test.ts` (o default de span do col-12 não entra) + cobertura pré-existente da
      `plan-47` em `SarakGrid.test.tsx`/`SarakLayoutsResponsive.test.tsx`.
- [x] Toda classe nova é literal no fonte; nenhum comentário cola prefixo+medida+utilitário — confirmado por
      `container-query:check` verde e por leitura dos comentários que escrevi.
- [x] O resumo declara que a prova final é do dono, sem tocar no ERP, e o que ele deve ver — seção dedicada
      abaixo.
- [x] `docs/migracoes.md` com entrada classificada (MAJOR).
- [x] `npx vitest run` inteira, verde, sem encolher (316/1357). `npm run build` passa — evidência acima.
- [x] `run_audit` sem regressão; `npx tsc --noEmit` → 0; `container-query:check` e
      `container-query-boundary:check` verdes.
- [x] `git diff --stat` — só os arquivos da §3.1 (+ testes companheiros + `docs/`, como a própria §3.1
      autoriza). Nada do ERP.

## Passo 4 — a prova final é do dono, e é isto que ele deve ver

**Eu não toquei no ERP** — nem no código, nem no dado. O registro do conector (`layoutGridTemplate: "col-12"`,
`activeThemeId: "erp-corporativo"`, os 425 chaves persistidas) continua exatamente como estava, porque é o
**fixture** desta plan — a prova de que o conserto é real é ele continuar lá e a tela ficar certa mesmo assim.

**O que o dono deve fazer:** reinstalar a lib no ERP (`pnpm install --force --filter @erp/ui-kit` —
`file:` é cópia no store do pnpm, não link; rebuild sem reinstalar não chega lá, [[00-contexto]] §8).

**O que ele deve ver, na aba Propostas (ou em qualquer tela que use `SarakGrid`/`SarakManagementGrid`/
`SarakForm` sob o tema `erp-corporativo` com `col-12`):** os cards deixam de ser sete tiras verticais
estreitas — a malha passa a ter várias colunas (o número exato depende da largura real do container e de
quantos campos por card do jeito que a `Lista.tsx` já está — não é algo que eu meço sem a tela real), cada
uma larga o bastante para o título e o "VER DETALHES" caberem sem atravessar o card vizinho. **Se a tela
continuar igual**, o próximo lugar a olhar é se o **build reinstalado** é realmente o desta plan (mesma
armadilha da `plan-47`: `dist/BUILD_INFO.json` do consumidor tem de refletir um commit posterior a este).

**Decisões e suposições**

- **Escolhi os números 6/4/3 (span) → 2/3/4 (colunas visuais) nos mesmos breakpoints 768/1024/1280** que os
  presets nomeados já usam, e propositalmente **iguais** aos números que `auto-fit` já entrega (`plan-47`) —
  não é coincidência nem exigência da plan, é decisão minha para que a lib se comporte de forma previsível
  entre as duas estratégias (o consumidor que troca de `auto-fit` para `col-12` no painel não vê o número de
  colunas mudar, só a mecânica por trás). Se o revisor preferir números diferentes, é só trocar a string.
- **Extraí `gridStrategies` para `useStructuralStyles.presets.ts`**, fora da letra literal da §3.1 (que só
  cita `useStructuralStyles.ts:34-38`) — necessário porque a nova string de `col-12` empurrava
  `useStructuralStyles.ts` para 251 linhas, estourando o teto de 250 do R9 (o mesmo limite que a `plan-47` já
  tinha raspado). Em vez de espremer comentário até a ilegibilidade (o que já fiz uma vez na `plan-47` e não
  quis repetir), usei o companion que **já existe para exatamente este propósito** — `.presets.ts` já guarda
  os outros mapas de classe literal do mesmo hook (`RESPONSIVE_GRID_PRESETS`, `RESPONSIVE_SPACING_PRESETS`).
  Comportamento idêntico, zero arquivo novo, `auditor_cleancode` confirma `[OK]` nos dois arquivos depois.
- **O spec temporário de medição em Chromium foi apagado** antes de fechar — só a saída dele (Passo 3) fica
  registrada.

**Achados fora do escopo (não corrigidos)**

- Nenhum novo. O achado da `plan-47` (lib sem contrato de `span` explícito, Saída C não escolhida) segue de
  pé para quem não usa `col-12`/`auto-fit` — mas essa lacuna era sobre o consumidor **não ter como** declarar
  span; esta plan mostra que quando ele declara (`col-span-N` cru, como o ERP faria hoje), o mecanismo
  funciona e vence o default. Não é a mesma lacuna, e não vira achado novo.

**Pendências / riscos**

- A prova de que a tela do ERP ficou legível **não está aqui** — é o Passo 4, do dono, depois da aprovação.
- Não reproduzi intermitência de suíte (registrada na `plan-46`, ainda não executada) — rodei a suíte
  completa uma vez, 100% verde; não houve motivo para repetir.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-08-15 — 🟢 Aprovada

Verifiquei tudo no worktree e no artefato publicado. Aprovo — e com uma correção de fato do executor sobre a
minha própria plan, que ele fez e está certo.

### O critério que eu pus como intransigente, conferido primeiro

> *"O registro do ERP tem de CONTINUAR respondendo `col-12`. Se sumiu, alguém consertou limpando dado — e
> isso reprova, mesmo com a tela bonita."*

```
GET http://127.0.0.1:3000/api/v1/conector/tema
  → design.layoutGridTemplate = "col-12"
  → 425 chaves
```

**Intacto.** O fixture foi preservado, e `git diff` não tem uma linha do ERP. O conserto não passa por
mexer no consumidor — que era a exigência do dono e o motivo desta plan existir.

### A especificidade: o executor me corrigiu, e a correção procede

Minha plan afirmou que o seletor do pai teria especificidade **maior** que a classe no filho. **Está errado,
e o executor mediu certo:** `[&>*]:col-span-6` gera `.classe > *` = **(0,1,0)**, e o `.col-span-6` do filho é
**(0,1,0)** — é **empate**, decidido pela ordem de geração do Tailwind. Ou seja: não é "o pai vence", é
**"não é determinístico"** — que é pior, porque quebraria de forma intermitente conforme a ordem das classes
no CSS mudasse entre builds.

A solução dele elimina a categoria inteira do problema, e eu conferi **no CSS publicado**, não no relato:

```
:where(.\@min-\[768px\]\:\[\:where\(\&\)\>\*\]\:col-span-6)>*{grid-column:span 6/span 6}
```

`:where()` contribui **0** e `>*` contribui **0** → o default do pai é **(0,0,0)**. Qualquer classe no filho
é no mínimo (0,1,0). **O filho vence sempre, por aritmética de especificidade, independente de ordem de
geração.** Não é "provavelmente funciona": é impossível não funcionar.

### As regras chegaram ao CSS — nas DUAS variantes

Esta é a verificação que a `plan-39` existe para cobrar, e eu quase a dei por boa com um `grep` mal escapado.
Refiz com parser de blocos e confirmei o aninhamento:

| | `dist/sarak.css` (modo app) | `dist/sarak-scoped.css` (modo embarcado) |
|---|---|---|
| `@container width>=768px` | filho recebe `span 6` | `span 6` |
| `@container width>=1024px` | `span 4` | `span 4` |
| `@container width>=1280px` | `span 3` | `span 3` |

**Conferi o `sarak-scoped.css` de propósito:** o modo embarcado ([[specs/24]]) é gerado por um passo separado
(`build-scoped-css.mjs`), e um conserto que só chegasse ao CSS de modo app seria um vão silencioso para todo
consumidor embarcado. Chegou aos dois, com paridade exata.

**Abaixo de 768px nenhuma regra de span existe** → `grid-cols-1` → **1 coluna no celular**, como a plan
exigia. Isso não vem de teste: vem de as três regras estarem *dentro* das container queries.

### Os números, conferidos por aritmética independente

12 trilhas ÷ span do filho: `12/6 = 2` · `12/4 = 3` · `12/3 = 4`. Bate exatamente com a medição em Chromium
que o executor colou (2 @768, 3 @1024, 4 @1280, 1 @400) — e por um caminho que não depende do artefato de
medição, que não posso reexecutar.

### Gates, rodados por mim

| | |
|---|---|
| `npx vitest run` (INTEIRA) | **316 arquivos / 1357 testes, 100% verde** — não encolheu (1351 → 1357, +6) |
| **`npm run build`** | **exit 0** — rodei porque a `plan-44` derrubou este build duas vezes com classe de container query nova. `dist/sarak-scoped.css` gerado, CSS injetado, `BUILD_INFO` regravado |
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `container-query:check` · `container-query-boundary:check` · `barrel:check` · `catalog:check` | **todos [OK]** |
| R9 (teto 250) | `useStructuralStyles.ts` → **241 linhas** |
| Armadilha da `plan-44` | nenhum comentário cola prefixo + medida + utilitário. Conferido por varredura |

### Escopo — um arquivo a mais, legítimo e declarado

`useStructuralStyles.presets.ts` não estava na minha §3.1, que nomeava só `useStructuralStyles.ts:34-38`. A
extração foi **forçada pelo R9**: o arquivo estava em 248 linhas e a estratégia nova o estouraria. O executor
declarou a razão no resumo **e no comentário do código**. Aceito — é consequência necessária, não scope creep,
e o destino é o arquivo companheiro que já existia para exatamente este tipo de conteúdo.

Fora isso: `col-12` continua no schema e no painel (**nada removido**), `auto-fit` continua o default
(`plan-47` intacta), `masonry` intocado, nenhum breakpoint alterado, nenhuma migração de dado escrita.

### Os testes são honestos, e a prova real está fora deles

Meu critério pedia *"teste provando que o span do filho vence o do pai"*. **jsdom não resolve cascata de
stylesheet** — nenhum teste daqui pode provar isso, e o executor não fingiu que podia: os testes provam a
classe emitida e o DOM do filho, e cada um **declara em comentário** o que não prova, apontando para a
medição em Chromium.

Critério atendido pela combinação, e neste caso com uma prova **mais forte** que teste: a aritmética de
especificidade sobre o CSS publicado, que fiz acima. É a terceira vez nesta leva que escrevo um critério
pedindo prova que o ambiente de teste não pode dar — ver a correção de método no fim.

A proteção da `plan-39` não só sobreviveu como foi **estendida**: as três classes novas entram na asserção
literal contra `BREAKPOINT_TABLET`/`DESKTOP`/`BP_XL`.

### Achado menor, registrado e não bloqueante

O CSS traz **3 regras a mais** sem prefixo de breakpoint (`.[:where(&)>*]:col-span-3|4|6`, fora de qualquer
container query). São artefato do scanner do Tailwind, que coleta o fragmento da classe além da forma
prefixada. **Inertes:** a lib nunca emite a classe sem prefixo, então nenhuma delas casa com elemento algum.
Não é defeito, não vira plan — fica escrito para o próximo que grepar o CSS e estranhar.

### O que esta revisão NÃO viu

**Que a aba Propostas ficou legível.** O passo 4 da plan é do dono: reinstalar a lib no ERP e olhar, **com o
`col-12` persistido no lugar**. É a única prova que fecha o ciclo, e é a que as plans 47 e 49 juntas tornaram
possível sem tocar no consumidor.

### Correção de método — a terceira, e agora com regra

Escrevi *"prove com teste que o filho vence"* sabendo que o repositório roda em jsdom. Já pedi ao executor da
`plan-41` que editasse spec fixa (o contrato dele proíbe) e ao da `plan-47` que provasse coluna em jsdom.
**Regra que fica:** todo critério de aceite sobre comportamento renderizado nomeia o **instrumento** —
`teste` para classe/DOM emitido, `navegador` para cascata e layout, `leitura do artefato` para o que o CSS
publicado contém. Critério sem instrumento nomeado obriga o executor a me contradizer para ser honesto.

### Liberação

Status espelhado no [[00-indice]] na mesma ação.

⚠️ **`dist/` mudou** (chunks novos, `sarak.css`, `sarak-scoped.css`, `BUILD_INFO`): o anel de `pre-push`
vai exigir **tag nova**. A leva 47+49 é **MAJOR** — mas `npm version major` é decisão sua, e exige árvore
limpa. **Pode commitar.**
