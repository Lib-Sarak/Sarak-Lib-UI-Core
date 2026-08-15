---
tipo: "plan"
titulo: "O grid default da lib coloca cada filho em 1/12 da largura"
dominio: "Sarak-Lib-UI-Core / Layout / Responsividade"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "responsividade", "layout", "container-query", "defeito-ativo", "regressao", "plan-41"]
relacionados: ["[[07-responsividade-e-multidispositivo]]", "[[03-superficie-publica]]", "[[15-divida-conhecida]]", "[[01-gates-e-baseline]]"]
depende_de: ""
destino_sintese: "specs/specs/07-responsividade-e-multidispositivo.md · specs/specs/15-divida-conhecida.md"
objetivo: "Um consumidor que escreve `<SarakGrid>{cards}</SarakGrid>` — o uso zero-config canônico — recebe uma malha em que cada filho tem largura legível, e não 1/12 da tela"
---

# 1. Objetivo

`<SarakGrid>` com N filhos e **sem** `templateColumns` produz, em qualquer largura, uma malha em que **cada
filho ocupa uma célula legível**. Hoje produz **doze trilhas de ~1/12 da largura**, com um filho por trilha e
o conteúdo transbordando por cima do vizinho.

# 2. Contexto

## 2.1 O relato, com a tela na mão (2026-08-15)

O dono reportou a aba **Propostas** do ERP Earendel: antes, cada proposta ocupava uma linha horizontal
inteira e exibia todos os campos; depois da leva 39–41, as propostas viraram **sete colunas verticais
estreitas**, com título truncado (`R…`, `C…`, `XTRE…`), campos espremidos e o texto "VER DETALHES"
atravessando a borda do card vizinho. O oitavo card fica cortado na borda direita da viewport.

**Isso não é impressão de layout: é a aritmética de doze trilhas.**

## 2.2 A cadeia causal, verificada arquivo a arquivo

| # | Fato | Onde |
|---|---|---|
| 1 | O consumidor escreve `<SarakGrid>` **sem** `templateColumns`, com um `<article>` por proposta | `Modulos/Propostas/web/src/pages/Lista.tsx:62-66` |
| 2 | Sem `templateColumns`, o `SarakGrid` delega à estratégia do Design Engine | `SarakGrid.tsx:49-55` |
| 3 | A estratégia default é `layoutGridTemplate: 'col-12'` — em **todos** os 5 temas embarcados e no `defaultValue` do schema | `useStructuralStyles.ts:23`; `schema/structural.ts:53,58`; os 5 arquivos de `Design/presets/themes/` |
| 4 | `col-12` emite `grid w-full grid-cols-1 @min-[768px]:grid-cols-12` | `useStructuralStyles.ts:35` |
| 5 | A `plan-41` plantou o `@container` que faltava, e a container query **passou a casar** | `SarakGrid.tsx:73` |
| 6 | Doze trilhas `minmax(0,1fr)`, um filho por trilha, **nenhum span** — a lib não oferece nenhum | CSS publicado: `.@min-[768px]:grid-cols-12{grid-template-columns:repeat(12,minmax(0,1fr))}` |

Confirmado **no build que o ERP realmente tem instalado** (`dist/BUILD_INFO.json` → `0e5a6cd`,
`2026-08-14`, posterior à `plan-41`), não só no fonte — a armadilha do build stale
([[07-responsividade-e-multidispositivo]] §7.1) foi descartada antes de qualquer diagnóstico:

```
dist/index.js   → className:"@container w-full"  (o wrapper da plan-41)
chunk-*.js      → "col-12":"grid w-full grid-cols-1 @min-[768px]:grid-cols-12"
dist/sarak.css  → .\@min-\[768px\]\:grid-cols-12{grid-template-columns:repeat(12,minmax(0,1fr))}
```

## 2.3 De quem é o defeito: da lib, e não do importador

O consumidor não escreveu CSS, não passou prop errada e não subverteu nada — escreveu o uso mais
elementar que a API oferece. [[07-responsividade-e-multidispositivo]] §1 é literal:

> *"Se o consumidor precisou escrever CSS para consertar um componente da lib no celular, é BUG DA LIB."*

E a lib **não oferece ao consumidor nenhuma forma de declarar span**: não existe `SarakGridItem`, não existe
prop `span`, e `col-span-*` não aparece em nenhum componente público (só em mocks internos do painel e em
`gridColumn: 'span 2'` hardcoded dentro de `SarakActionCard`/`SarakCoreCard`). Um grid de doze colunas sem
mecanismo de span é um sistema **sem a metade que o torna usável**.

## 2.4 A `plan-41` não deve ser revertida — ela expôs isto, e previu

O defeito é **anterior** à `plan-41` e estava latente: a container query nunca casava, o grid ficava em
`grid-cols-1`, e "uma proposta por linha" era o **acidente** que o dono viu como certo. A `plan-41`
consertou o mecanismo corretamente e o veredito dela (2026-08-13) já apontava para cá:

> *"O que esta revisão NÃO viu: que a coluna dupla apareceu na tela. […] é o primeiro item a olhar quando o
> consumidor rodar de novo."*

O consumidor rodou de novo. Este é o item.

## 2.5 Raio de alcance — medido, não estimado

`getGridStyles()` chamado **sem `templateColumns` e sem preset** é o que cai em `col-12`. São **três**
componentes públicos, e os três estão quebrados hoje:

| Componente | Chamada | O que acontece na tela |
|---|---|---|
| `SarakGrid` (sem `templateColumns`) | `SarakGrid.tsx:55` | cada filho em 1/12 — **o caso reportado** |
| `SarakManagementGrid` | `SarakManagementGrid.tsx:63`, aplicado em `:150` | cada card de grupo em 1/12 — **não reportado, mas idêntico** |
| `SarakForm` | `SarakForm.tsx:80`, via `<SarakGrid>` interno | cada campo de formulário em 1/12 — **input de ~55px** |

**Não** caem em `col-12`, e por isso **estão corretos e ficam fora do escopo**:

| Componente | Por quê |
|---|---|
| `SarakCardGrid` · `SarakCatalogGrid` · `SarakStats` | passam `responsivePreset` — `cardsStandard`/`catalogStandard`/`statsStandard` em `useStructuralStyles.presets.ts:17-19` |
| `SarakActionCard` · `SarakCoreCard` · `AuthSocialLogin` | passam `templateColumns` explícito |

Os presets nomeados (`grid-cols-1 @min-[768px]:grid-cols-2 @min-[1280px]:grid-cols-3`) são, aliás, **a
prova de que a lib já sabe qual é a forma certa** de dispor cards — ela só não a aplica no caminho default.

# 3. Escopo

## 3.1 Dentro

1. **`src/components/atomic/hooks/useStructuralStyles.ts`** — a estratégia `col-12` e/ou a assinatura de
   `getGridStyles`, conforme a saída escolhida no passo 1.
2. **`src/components/atomic/Layouts/SarakGrid.tsx`** — se a saída escolhida exigir contrato novo de prop.
3. **`src/components/atomic/Templates/SarakManagementGrid.tsx`** e **`SarakForm.tsx`** — só o necessário
   para deixarem de cair no caso quebrado.
4. **Testes companheiros** dos arquivos acima, incluindo
   `src/components/atomic/hooks/__tests__/useStructuralStyles.test.ts:30-34`, que **hoje afirma a string
   quebrada** e vai precisar mudar junto (é asserção de forma, não de correção).
5. **`src/core/Design/schema/structural.ts`** e os 5 temas de `src/core/Design/presets/themes/` — **apenas
   se** a saída escolhida mexer no token `layoutGridTemplate`. Se mexer, a paridade 1:1:1 é obrigatória
   ([[04-contrato-de-tokens-e-paridade]]) e `npm run audit` → `auditor_paridade` tem de fechar.
6. **`docs/migracoes.md`** — entrada classificada por [[03-versionamento-e-release]] §3.

## 3.2 Fora

- ⛔ **Reverter a `plan-41`.** O `@container` fica. Tirar o container faz o sintoma sumir escondendo o
  defeito de novo, e desfaz as plans 39/40/41 inteiras. Se a sua correção "funciona" porque a query voltou a
  não casar, ela está errada.
- ⛔ **Voltar para media query de viewport.** Mesma razão da `plan-41` §3.2.
- ⛔ **Mudar qualquer número de breakpoint.** 640/768/1024/1280 continuam.
- ⛔ **Tocar no ERP Earendel.** O consumidor não recebe remendo — se ele precisar mudar uma linha para a
  tela ficar certa, a correção está no lugar errado. A validação na tela é do dono, depois.
- ⛔ **Mexer em `SarakCardGrid`, `SarakCatalogGrid`, `SarakStats`, `SarakActionCard`, `SarakCoreCard`,
  `AuthSocialLogin`** — medidos na §2.5, estão corretos.
- ⛔ **Mexer nos presets** de `useStructuralStyles.presets.ts` (a não ser para **acrescentar** um, se a saída
  escolhida for essa).
- ⛔ **Redesenhar aparência** — cor, espaçamento, tipografia, hierarquia do card. O escopo é **quantas
  colunas e de que largura**, nada além.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-41-container-query-sem-container.md` — resumo **e** veredito | o mecanismo que esta plan não pode desfazer, e a previsão deste achado |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §1 · §5 · §6 | o contrato zero-config, a tabela do que adapta, as três camadas |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | se a saída escolhida acrescentar prop/export |
| Spec fixa | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` | **só se** tocar `layoutGridTemplate` |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` §3 | classificar a entrada de `docs/migracoes.md` |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R8 · R17 · R20 | teste ao lado; não transcrever fonte viva; baseline não regride |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |
| Código | `useStructuralStyles.ts:17-52` · `useStructuralStyles.presets.ts:16-20` · `SarakGrid.tsx` · `SarakForm.tsx:80-93` · `SarakManagementGrid.tsx:60-63,150` | ler antes de editar |

# 5. Instruções de execução

## Passo 1 — escolher a saída, com a medição declarada ANTES de editar

A §2.5 já lhe entrega o raio de alcance medido: **não o refaça**. O que falta é a decisão, e ela é sua.
Quatro saídas conhecidas, com o custo de cada uma. **Declare a escolhida e o porquê no resumo, antes da
seção de implementação.**

| | Saída | Custo / risco conhecido |
|---|---|---|
| **A** | **`col-12` passa a dar um span default aos filhos diretos** (ex.: `[&>*]:col-span-12` no base, `@min-[768px]:[&>*]:col-span-6`, `@min-[1024px]:[&>*]:col-span-4`) — preserva a semântica "grid de 12 colunas" | ⚠️ **ARMADILHA MEDIDA:** o seletor `[&>*]:col-span-N` tem especificidade **maior** que uma classe `col-span-N` no próprio filho — a regra do pai **venceria** o span que o consumidor declarar. Se escolher A, isto tem de ser resolvido e **provado por teste**, não assumido |
| **B** | **O caminho sem `templateColumns` deixa de usar `col-12` e passa a usar uma forma content-aware** (`auto-fit minmax(...)` ou um preset nomeado no estilo dos que já existem) | `col-12` continua existindo como escolha de tema, mas deixa de ser o que o caminho default entrega — declare isso em `docs/migracoes.md` |
| **C** | **Contrato de span explícito** (`SarakGridItem`, ou prop `span` em `SarakGrid`) + um default sensato para quem não declara | superfície pública nova ([[03-superficie-publica]], barril, catálogo, `barrel:check`). Sem um default sensato, **não resolve** — o consumidor de hoje não declara span nenhum |
| **D** | **Trocar o `defaultValue` do token `layoutGridTemplate` para `auto-fit`** | ⚠️ **sozinho NÃO conserta:** os 5 temas embarcados chumbam `layoutGridTemplate: 'col-12'` cada um no seu arquivo, e o tema vence o `defaultValue`. Se escolher D, os 5 mudam junto e a paridade tem de fechar |

Se a medição apontar uma quinta saída melhor, **proponha — com a medição**.

**A pergunta que decide, e que o resumo tem de responder:** *depois da sua mudança, `<SarakGrid>` com 8
filhos e nenhuma prop entrega quantas colunas em 1280px, 1024px, 768px e 400px de container?* Responda com
números.

## Passo 2 — medir em navegador real, não só em jsdom

A `plan-41` só não entregou um conserto-que-não-conserta porque o executor **mediu em Chromium** que
`container-type` no mesmo elemento não casa. Repita o rigor: **jsdom não avalia container query e não tem
motor de layout** — nenhum teste deste repositório pode provar largura de coluna.

Meça em navegador real e **cole a saída no resumo**: para o HTML que o `SarakGrid` corrigido produz, o
`grid-template-columns` computado em pelo menos **1280px, 1024px, 768px e 400px** de largura de container.

## Passo 3 — implementar, com teste ao lado (R8)

Teste em cada arquivo tocado. **Cada teste novo declara, em comentário, o que ele prova e o que não prova**
— provar a *classe/estilo emitido* é legítimo; afirmar *"o layout ficou com 3 colunas"* em jsdom é o defeito
que esta família de plans existe para não repetir.

Cobertura mínima exigida:

- `SarakGrid` sem nenhuma prop → a forma emitida é a corrigida (não `grid-cols-12` cru);
- `SarakGrid` com `templateColumns` explícito → **continua** vencendo, inalterado;
- `SarakGrid` no celular → **continua** em coluna única (não regrediu o mobile);
- se escolheu **A**: um filho com span próprio **vence** o span default do pai — teste explícito;
- `SarakForm` e `SarakManagementGrid` → não emitem mais a forma quebrada;
- `useStructuralStyles.test.ts:30-34` atualizado para a forma nova, mantendo o que ele realmente protege:
  que o número do breakpoint é **literal e igual** a `BREAKPOINT_TABLET` (a razão de a `plan-39` existir).

## Passo 4 — `docs/migracoes.md`

Entrada nova no topo, classificada por [[03-versionamento-e-release]] §3, com o "antes/depois" do que o
consumidor vê. Diga com todas as letras que **o comportamento anterior a esta correção (uma coluna) era um
defeito, não um contrato** — quem tiver se acomodado a ele vai ver a tela mudar.

## Passo 5 — fechar, colando a saída real

Nesta ordem: `npx vitest run` (**a suíte INTEIRA** — pasta a dedo não vale, [[00-contexto]]) ·
`node gates/scripts/audit/run_audit.mjs` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` ·
`npx tsc --noEmit` · `npm run container-query:check` · `npm run container-query-boundary:check` ·
`npm run barrel:check` · `git diff --stat`.

> ⚠️ A `plan-46` (fila `#22`, ainda não executada) registra que **a suíte é intermitente**: uma execução em
> três falhou sem relação com o diff. Se você pegar uma falha, **rode de novo e relate as duas saídas** —
> não a esconda, e não a trate como aprovada por repetição.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-47-grid-default-coloca-cada-filho-em-um-doze-avos.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/07-responsividade-e-multidispositivo.md (§1, §5, §6),
specs/plan/plan-41-container-query-sem-container.md (resumo E veredito),
specs/specs/00-regras-e-invariantes.md R8, R17, R20,
specs/specs/03-versionamento-e-release.md §3.
Skills: padrao-escrita, padrao-typescript, test-unitario.

O DEFEITO, em uma frase: `<SarakGrid>` sem `templateColumns` entrega DOZE trilhas de
1/12 da largura, um filho por trilha, e a lib não oferece ao consumidor NENHUMA forma
de declarar span. Reportado com a tela na mão: a aba Propostas do ERP virou sete
colunas verticais com título truncado e texto atravessando o card vizinho.

O RAIO DE ALCANCE JÁ ESTÁ MEDIDO na §2.5 da plan — NÃO refaça a medição. São três
componentes públicos que caem em `col-12`: SarakGrid (sem templateColumns),
SarakManagementGrid e SarakForm. Os outros seis consumidores de getGridStyles passam
preset ou templateColumns explícito e estão CORRETOS — fora do escopo.

LINHAS VERMELHAS:
  · Você NÃO reverte a plan-41. O `@container` FICA. Se a sua correção funciona
    porque a container query voltou a não casar, ela está ERRADA.
  · Você NÃO volta para media query de viewport.
  · Você NÃO muda número de breakpoint (640/768/1024/1280 continuam).
  · Você NÃO toca no ERP. Se o consumidor precisar mudar uma linha para a tela ficar
    certa, a correção está no lugar errado.
  · Você NÃO redesenha aparência. O escopo é quantas colunas e de que largura.

PASSO 1, ANTES DE EDITAR — escolha entre as saídas A/B/C/D da §5 e declare o porquê
no resumo. Leia a armadilha da saída A (especificidade de `[&>*]:col-span-N` vence o
span do próprio filho) e o alerta da saída D (os 5 temas chumbam 'col-12', o
defaultValue sozinho não conserta). Responda com NÚMEROS: depois da sua mudança,
`<SarakGrid>` com 8 filhos e nenhuma prop dá quantas colunas em 1280/1024/768/400px?

PASSO 2 — MEÇA EM NAVEGADOR REAL e cole a saída. jsdom não avalia container query e
não tem motor de layout: nenhum teste daqui prova largura de coluna. Foi medindo em
Chromium que a plan-41 evitou um conserto-que-não-conserta.

Teste ao lado em cada arquivo tocado (R8), cada um declarando o que prova e o que NÃO
prova. Cobrir obrigatoriamente: templateColumns explícito continua vencendo; o mobile
continua em coluna única. docs/migracoes.md leva entrada classificada.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] A saída escolhida (A/B/C/D ou a quinta proposta) está declarada no resumo **com o porquê e o custo
      assumido**, antes da seção de implementação.
- [ ] A resposta em **números** está no resumo: colunas entregues em 1280px, 1024px, 768px e 400px de
      container, para `<SarakGrid>` com 8 filhos e nenhuma prop.
- [ ] A medição em **navegador real** (`grid-template-columns` computado nas 4 larguras) está colada no
      resumo. Medição só em jsdom **não atende este critério**.
- [ ] `SarakGrid` sem props não emite mais uma malha de 12 trilhas — evidência: teste + a medição acima.
- [ ] `SarakGrid` com `templateColumns` explícito **continua** vencendo — evidência: teste.
- [ ] Celular **continua** em coluna única — evidência: teste.
- [ ] `SarakForm` e `SarakManagementGrid` não caem mais no caminho quebrado — evidência: teste em cada um.
- [ ] Se a saída foi **A**: existe teste provando que o span declarado no filho vence o default do pai.
- [ ] Se a saída tocou `layoutGridTemplate`: os 5 temas e o schema mudaram junto e
      `run_audit → auditor_paridade` fecha.
- [ ] Cada teste novo declara, em comentário, o que prova e o que **não** prova.
- [ ] `useStructuralStyles.test.ts` atualizado, **mantendo** a proteção da `plan-39` (número de breakpoint
      literal, igual a `BREAKPOINT_TABLET`).
- [ ] `docs/migracoes.md` com entrada classificada, dizendo que o comportamento anterior era defeito.
- [ ] `npx vitest run` **inteira**, verde, e a contagem de testes **não encolheu**.
- [ ] `run_audit` sem regressão contra `gates/baselines/audit-baseline.json`; `npx tsc --noEmit` → 0;
      `container-query:check`, `container-query-boundary:check` e `barrel:check` verdes.
- [ ] `git diff --stat` — só os arquivos da §3.1. **Nada do ERP. O `@container` da `plan-41` intacto.**

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

# 1. o container da plan-41 continua plantado — se sumiu, é reprovação imediata
grep -rn "@container" src/components/atomic/ --include=*.tsx | grep -v __tests__

# 2. quem ainda cai no col-12 cru
grep -rn "getGridStyles()" src/ --include=*.tsx | grep -v __tests__

# 3. a estratégia col-12 hoje, e o que os presets nomeados dizem
grep -n "col-12\|auto-fit\|masonry" src/components/atomic/hooks/useStructuralStyles.ts
grep -n "" src/components/atomic/hooks/useStructuralStyles.presets.ts

# 4. nenhum breakpoint mudou
grep -rn "@min-\[" src/ --include=*.ts --include=*.tsx | grep -v __tests__

npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
npm run container-query:check && npm run container-query-boundary:check && npm run barrel:check
```

**O que reprova:**

- o `@container` da `plan-41` removido, afrouxado ou condicionado — o sintoma some porque o defeito voltou a
  ficar escondido;
- media query de viewport reintroduzida;
- número de breakpoint alterado;
- qualquer arquivo do ERP no diff;
- **medição só em jsdom** apresentada como prova de largura de coluna — o ambiente não mede isso, e afirmar
  o que o ambiente não mede é exatamente o defeito que originou as plans 39/40/41;
- saída **A** escolhida sem teste provando que o span do filho vence o do pai;
- `layoutGridTemplate` tocado sem os 5 temas e sem paridade fechando;
- teste apagado ou afrouxado para caber na forma nova (a asserção do breakpoint literal em
  `useStructuralStyles.test.ts` **protege a `plan-39`** e tem de sobreviver, com a string atualizada).

**O que esta verificação NÃO vê:** que a aba Propostas voltou a ficar legível. Isso só se prova reinstalando
no ERP (`pnpm install --force --filter @erp/ui-kit`, [[00-contexto]] §8) e olhando a tela — é do dono, depois
da aprovação, e **sem tocar em uma linha do ERP**.

# 9. Destino da síntese

**Destino:** `specs/specs/07-responsividade-e-multidispositivo.md` · `specs/specs/15-divida-conhecida.md`

**Texto pronto para transporte:**

- **`07-responsividade-e-multidispositivo.md` §5** ganha linha própria para o **`SarakGrid` sem
  `templateColumns`** — hoje a tabela do contrato só descreve o caso *com* `templateColumns`
  (`SarakGrid.tsx:44-53`), e o caminho default, que é o mais usado, não aparece em lugar nenhum. Foi
  exatamente o caminho não documentado que quebrou.
- **`07-responsividade-e-multidispositivo.md` §6** ganha a regra derivada desta plan, ao lado da que a
  `plan-41` já deixou lá: **ligar uma container query não é o fim do trabalho — a malha que ela ativa precisa
  ter sido projetada para os filhos que o consumidor realmente passa.** Um grid de 12 colunas sem mecanismo
  de span é meio sistema, e meio sistema entrega layout ilegível com todos os gates verdes.
- **`15-divida-conhecida.md`** registra o que sobrar da saída escolhida: se ficar sem contrato de span
  público (saídas A, B ou D), fica escrito que **o consumidor não tem como declarar span** e o que isso
  impede.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-08-15

**Resultado:** Concluído

## Passo 1 — a saída escolhida, e o porquê (antes de qualquer edição)

Medindo `getGridStyles(...)` nos 8 chamadores reais (`grep -rn "getGridStyles(" src/` — já feito na §2.5 da
plan, reconfirmado): **só dois** call sites chamam sem `templateColumns` **e** sem `responsivePreset` —
`SarakGrid.tsx:55` e `SarakManagementGrid.tsx:63`. `SarakForm.tsx:80` monta `<SarakGrid>` sem
`templateColumns`, então cai no mesmo caminho por herança. Os outros 6 (`SarakStats`, `SarakCatalogGrid`,
`SarakCardGrid`, `SarakActionCard`, `AuthSocialLogin`, `SarakCoreCard`) sempre passam preset ou
`templateColumns` — nunca tocam a estratégia `gridStrategies[layoutType]`. Confirmado por leitura de
`useStructuralStyles.ts`: `layoutType` só é consultado quando `hasCustomTemplate` é `false`, isto é,
exatamente nos 2 chamadores acima.

**Escolhi a saída D, executada por completo** — trocar o `defaultValue` do token `layoutGridTemplate` (schema
`structural.ts`) de `'col-12'` para `'auto-fit'`, **e** os 5 temas embarcados junto (a plan já avisa: D
sozinha, sem os temas, não conserta nada — os 5 temas chumbam `'col-12'` cada um, e o tema sempre vence o
`defaultValue` do schema).

**Por que D, e não B/A/C, com o custo medido:**

- **A** (span default via `[&>*]:col-span-N`) tem a armadilha que a própria plan nomeia — especificidade do
  seletor do pai vencendo o span do filho — e exigiria provar isso com teste antes de confiar nela. Descartei
  por complexidade desnecessária: o problema real não é "faltam spans", é "o default não deveria depender de
  span nenhum".
- **C** (contrato de span explícito, `SarakGridItem`/prop `span`) é a solução mais completa, mas é superfície
  pública nova (barril, catálogo, `barrel:check`) — desproporcional ao defeito relatado, que é sobre o
  **default**, não sobre dar controle fino ao consumidor. Fica anotada como lacuna futura (ver "Achados fora
  do escopo").
- **B**, como a própria tabela da plan descreve ("o caminho sem `templateColumns` deixa de usar `col-12`"),
  **na prática exige o mesmo mecanismo que D**: como `layoutType` é sempre `design?.layoutGridTemplate` (e os
  5 temas sempre setam esse valor), a única forma de o caminho *default* parar de entregar `col-12` é o
  próprio token parar de valer `col-12` — que é exatamente a mudança de D. Não há uma variante "só código, sem
  tocar token" que funcione para um consumidor com `SarakUIProvider` e um dos 5 temas — cheguei nisso medindo
  (não supondo) o código antes de escolher.
- **D executada por completo é, portanto, a MESMA correção que B pede**, só nomeada pela letra que a própria
  plan já descreve como precisando dos 5 temas. O mecanismo escolhido (`'auto-fit'`, já existente em
  `gridStrategies['auto-fit']` — `grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`) é, adicionalmente, o mais
  barato e mais seguro dos dois exemplos que a própria B cita ("`auto-fit minmax(...)` ou um preset nomeado"):
  reaproveita uma estratégia já testada e já presente no schema como opção rotulada "Auto-fit Responsivo",
  **não depende de container query** (ao contrário de `col-12`/`masonry`), e por isso funciona mesmo se um
  consumidor algum dia montar o grid fora de qualquer `@container` — o `@min-[…]` de `col-12`/`masonry`
  continua existindo, só deixou de ser o que o caminho zero-config entrega.

**`col-12` continua existindo como escolha explícita de tema** (o `select` do schema mantém as 3 opções) — só
o **default** mudou. Um consumidor que hoje declare `layoutGridTemplate: 'col-12'` no próprio tema continua
recebendo 12 trilhas fixas (com o mesmo problema de span ausente, se o fizer sem controlar `span` nos
próprios filhos) — isso é esperado e está registrado em `docs/migracoes.md`.

**A pergunta que decide — em números**, `<SarakGrid>` com 8 filhos e nenhuma prop, **medido em Chromium real**
(Passo 2, abaixo): **4 colunas em 1280px · 3 colunas em 1024px · 2 colunas em 768px · 1 coluna em 400px.**

## Passo 2 — medição em navegador real (Chromium via Playwright CT), não jsdom

jsdom não tem motor de layout e não resolve `grid-template-columns: repeat(auto-fit, minmax(...))` — só um
navegador real calcula quantas colunas cabem. Escrevi um spec temporário
(`src/components/atomic/Layouts/__tests__/__tmp-plan47-measure.spec.tsx`, **apagado após a medição, não faz
parte do diff final**) que monta `<SarakUIProvider><SarakGrid>` com 8 filhos e nenhuma prop, sob
`@playwright/experimental-ct-react` (Chromium real, CSS real via `@tailwindcss/vite`), e lê
`getComputedStyle(grid).gridTemplateColumns` nas 4 larguras exigidas. Saída real, colada sem edição:

```
WIDTH=1280px COLUMNS=4 RAW="320px 320px 320px 320px"
WIDTH=1024px COLUMNS=3 RAW="341.328px 341.328px 341.344px"
WIDTH=768px COLUMNS=2 RAW="384px 384px"
WIDTH=400px COLUMNS=1 RAW="400px"
  ok 1 [chromium] › SarakGrid zero-config @ 1024px (720ms)
  ok 3 [chromium] › SarakGrid zero-config @ 768px (722ms)
  ok 4 [chromium] › SarakGrid zero-config @ 400px (730ms)
  ok 2 [chromium] › SarakGrid zero-config @ 1280px (734ms)
  4 passed (39.0s)
```

Cada coluna mede, em todas as larguras, **mais que os 280px mínimos** que `minmax(280px,1fr)` garante —
título e texto (o defeito reportado: `R…`, `C…`, "VER DETALHES" atravessando o vizinho) passam a caber. Em
400px (celular), o resultado é **1 coluna** — o mobile não regrediu, e isso não depende de nenhum ramo de JS
de device (é o próprio `auto-fit` que colapsa sozinho abaixo do 2º "encaixe" de 280px+gap).

## Passo 3 — implementação, com teste ao lado (R8)

**Arquivos de produção:**

- `src/core/Design/schema/structural.ts:58` — `defaultValue` de `layoutGridTemplate`: `'col-12'` →
  `'auto-fit'`.
- Os 5 temas embarcados (`src/core/Design/presets/themes/{terracota-solar,musgo-do-vale,grafite-puro,
  forja-ultravioleta,ardosia-ao-entardecer}.ts`) — `layoutGridTemplate: 'col-12'` → `'auto-fit'`, uma linha
  cada.
- `src/components/atomic/hooks/useStructuralStyles.ts:23` — o fallback em JS (quando não há
  `design?.layoutGridTemplate`, ex.: sem `SarakUIProvider`) trocado de `'col-12'` para `'auto-fit'`, para o
  caminho "sem tema" concordar com o novo default do schema. `:47` — o fallback de `layoutType`
  desconhecido/inválido (`gridStrategies[layoutType] || gridStrategies['col-12']`) trocado para
  `gridStrategies['auto-fit']`, pelo mesmo motivo: nenhum fallback do hook deveria devolver silenciosamente a
  estratégia sem mecanismo de span.

**Nenhum outro arquivo de produção precisou mudar** — `SarakGrid.tsx`, `SarakManagementGrid.tsx` e
`SarakForm.tsx` continuam chamando `getGridStyles()` exatamente como antes; é o **valor que o token resolve**
que mudou, não quem o consome. O wrapper `@container` da `plan-41` (`SarakGrid.tsx:73`,
`SarakManagementGrid.tsx:90`) **não foi tocado** — continua lá, mesmo `auto-fit` não precisando dele (é CSS
Grid puro, sem container query).

**Testes (cada um com comentário declarando o que prova e o que NÃO prova — jsdom não tem motor de layout):**

| Arquivo | O que foi adicionado/mudado |
|---|---|
| `useStructuralStyles.test.ts` | Teste "sem SarakUIProvider" atualizado para o novo default (`auto-fit`, não mais `grid-cols-1` de `col-12`). O teste de `col-12` que protegia o número literal de `BREAKPOINT_TABLET` (razão da `plan-39`) foi **mantido**, mas passou a envolver explicitamente `layoutGridTemplate: 'col-12'` via `UIContext.Provider` — continua provando que o número é literal, agora como escolha explícita de tema, não mais como default. Um teste novo prova o novo default literal (`grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`, sem wrapper). |
| `SarakGrid.test.tsx` | 2 testes novos: (1) sem props, a classe não é mais `grid-cols-12`, é `grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`; (2) com `templateColumns` explícito, a prop do consumidor continua vencendo (`gridTemplateColumns` no `style`, classe sem `auto-fit`/`col-12`). |
| `SarakLayoutsResponsive.test.tsx` | 1 teste novo: sem `templateColumns` (zero-config), a classe emitida é a MESMA em `smartphone` e `desktop` — não existe ramo de JS que trata o caminho zero-config por device; quem resolve colunas por largura é o CSS Grid, não jsdom. Comentário explícito de que isto NÃO prova o nº de colunas em 400px — isso é a medição do Passo 2. |
| `SarakManagementGrid.test.tsx` | 1 teste novo: o grid de grupos não emite mais `col-12`, emite `auto-fit`. |
| `SarakForm.test.tsx` | 1 teste novo (arquivo antes só tinha o smoke test "defined"): com `mode="create"` (evita a chamada de rede do `useFormData`, sem precisar mockar `api`), o grid de campos não emite mais `col-12`, emite `auto-fit`. |

**Achado durante a execução, corrigido no caminho:** meu comentário original em `useStructuralStyles.ts`
(6 linhas) empurrou o arquivo de 246 para 252 linhas, estourando o teto de 250 do R9 —
`auditor_cleancode.mjs` acusou `[FAIL] ... Arquivo gigantesco`. Encurtei o comentário para 2 linhas (248
linhas no total); `auditor_cleancode.mjs` isolado confirmou `[OK]` depois.

**Snapshots atualizados como consequência mecânica e inevitável** (não são achado — nascem exatamente da
mudança de `defaultValue` autorizada pela §3.1 item 5, e são necessários para o baseline sair verde, §3 item 7
do `00-prompt-executor.md`): `PreviewCanvas.test.tsx.snap`, `PresetCard.test.tsx.snap`,
`PreviewSystemRenderer.test.tsx.snap` — os 3 usam `<SarakUIProvider>` sem tema explícito (herdam o tema
embarcado default) e renderizam o painel Design Engine, que expõe `data-sx-layout-grid-template`. Conferi
**linha a linha** (script Node comparando cada par `-`/`+` do diff, normalizando só `col-12`↔`auto-fit` e a
classe derivada `grid-cols-1 @min-[768px]:grid-cols-12`↔`grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`):
**zero diferença fora do token** nos 3 arquivos (27 pares no `PreviewCanvas`, 3 no `PresetCard` +
`PreviewSystemRenderer` combinados — na prática 1+2).

## Passo 4 — `docs/migracoes.md`

Entrada nova no topo, **classificada MAJOR** (muda um comportamento default, [[03-versionamento-e-release]]
§3), com tabela antes×depois usando os números medidos no Passo 2, o porquê (grid de 12 colunas sem
mecanismo de span era "meio sistema"), como migrar (nada a fazer; quem queria `col-12` literal pode
declará-lo explicitamente no tema, com o aviso de que reproduz o mesmo problema sem `span` próprio) e o que
NÃO mudou (templateColumns explícito, os 6 consumidores com preset, breakpoints, o `@container` da plan-41).

## Verificações executadas (saída real, colada)

- `npx vitest run` (suíte INTEIRA, 2 execuções): 1ª com `-u` fixando os 3 snapshots →
  **316 arquivos de teste / 1351 testes, 100% verde** (1 snapshot atualizado nessa passada —
  `PreviewCanvas.test.tsx.snap`); 2ª execução, sem `-u`, para provar estabilidade → **316/1351, 100% verde,
  zero snapshot desatualizado**. Contagem não encolheu (6 testes novos: 2 em `useStructuralStyles.test.ts`
  líquido +1, `SarakGrid.test.tsx` +2, `SarakLayoutsResponsive.test.tsx` +1, `SarakManagementGrid.test.tsx`
  +1, `SarakForm.test.tsx` +1).
- `node gates/scripts/audit/run_audit.mjs` → achado intermediário: `auditor_cleancode` acusou o arquivo
  estourando 250 linhas (corrigido, ver Passo 3); depois de corrigir, `auditor_cleancode.mjs` isolado →
  `[OK]`. `auditor_ghostvars` (1 fantasma `--x`) e `auditor_composicaoatomica` (2, `SarakMultiSelect`/
  `SarakUploader`) seguem vermelhos — **ambos já no baseline antes desta plan** (confirmado por
  `check-audit-baseline.mjs`, abaixo), nenhum introduzido por mim.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `"[audit:baseline] igual ao baseline de
  2026-08-11 — nenhuma regressão."`
- `npx tsc --noEmit` → **0 erros**, sem saída.
- `npm run container-query:check` → `[OK] Nenhuma classe de container query (@min-[…]) montada por
  interpolação ou com medida inválida...`.
- `npm run container-query-boundary:check` → `[OK] Todo arquivo que chama getGridStyles/... também contém a
  classe @container.`
- `npm run barrel:check` → `[barrel:check] 77 componentes registrados; barril em dia (0 faltas).`
- `grep -rln "@container" src/components/atomic/ --include=*.tsx | grep -v __tests__` → os mesmos **10**
  arquivos da `plan-41` (nenhum removido/afrouxado).
- `grep -rn "@min-\[" src/ --include=*.ts --include=*.tsx | grep -v __tests__` → os mesmos números de sempre
  (640/768/1024/1280); nenhum breakpoint alterado.
- `git diff --stat` → só os arquivos desta plan (schema, 5 temas, o hook, 5 arquivos de teste, 3 snapshots,
  `docs/migracoes.md`, mais a própria plan). `dist/BUILD_INFO.json`, `specs/00-indice.md` e
  `specs/plan/plan-46-suite-intermitente.md` **já estavam modificados antes desta execução** (confirmado
  pelo `git status` no início da conversa) — não são meus. **Nenhum arquivo do ERP.**

**Critérios de aceite**

- [x] A saída escolhida (D, executada por completo — equivalente ao mecanismo real de B para os 2 call sites
      existentes) está declarada com o porquê e o custo assumido — Passo 1.
- [x] A resposta em números está no resumo — Passo 1/2: 4 · 3 · 2 · 1 colunas em 1280/1024/768/400px.
- [x] A medição em navegador real está colada — Passo 2, saída bruta do Playwright CT em Chromium.
- [x] `SarakGrid` sem props não emite mais uma malha de 12 trilhas — evidência: teste `SarakGrid.test.tsx` +
      a medição do Passo 2.
- [x] `SarakGrid` com `templateColumns` explícito continua vencendo — evidência: teste em `SarakGrid.test.tsx`
      e cobertura pré-existente em `SarakLayoutsResponsive.test.tsx`.
- [x] Celular continua em coluna única — evidência: medição real (400px → 1 coluna) + teste declarando que o
      zero-config não depende de ramo de JS por device.
- [x] `SarakForm` e `SarakManagementGrid` não caem mais no caminho quebrado — evidência: teste em cada um.
- [ ] Saída A — **não aplicável**: não escolhi A, então não há teste de span vencendo o pai a fazer.
- [x] `layoutGridTemplate` foi tocado — os 5 temas e o schema mudaram junto; `check-audit-baseline` (que
      cobre `auditor_paridade`) fechou sem regressão.
- [x] Cada teste novo declara, em comentário, o que prova e o que NÃO prova.
- [x] `useStructuralStyles.test.ts` atualizado mantendo a proteção do número literal de `BREAKPOINT_TABLET`
      (agora sob `layoutGridTemplate: 'col-12'` explícito, já que deixou de ser o default).
- [x] `docs/migracoes.md` com entrada classificada (MAJOR), dizendo que o comportamento anterior (col-12 sem
      span) era defeito.
- [x] `npx vitest run` inteira, verde, contagem não encolheu (316/1351, 2 execuções estáveis).
- [x] `run_audit` sem regressão contra o baseline; `tsc --noEmit` → 0; `container-query:check`,
      `container-query-boundary:check` e `barrel:check` verdes.
- [x] `git diff --stat` — só os arquivos desta plan. Nada do ERP. `@container` da `plan-41` intacto.

**Decisões e suposições**

- **Tratei "Saída D" e "Saída B" como convergentes** para os 2 call sites reais do repositório, porque medi
  (não supus) que não existe forma de o caminho zero-config parar de usar `col-12` sem o próprio valor do
  token deixar de ser `'col-12'` nos temas que o consumidor de fato usa — ver Passo 1. Registrei isso
  explicitamente para o revisor julgar se concorda com a leitura.
- **Também troquei o fallback JS de `useStructuralStyles.ts:23` e o fallback de `layoutType` desconhecido
  (`:47`)**, de `'col-12'` para `'auto-fit'` — não estritamente pedido pela letra da plan (que fala do token),
  mas necessário para que "o caminho sem tema" (`SarakUIProvider` ausente) e "tema com valor inválido" não
  voltassem, em silêncio, à estratégia sem mecanismo de span que esta plan existe para não entregar por
  default.
- **O spec temporário de medição em Chromium foi apagado** antes de fechar — não é parte do diff final, só a
  saída dele (colada no Passo 2) fica registrada.

**Achados fora do escopo (não corrigidos)**

- **A lib continua sem nenhum contrato de `span` para o consumidor** (Saída C, não escolhida). `'col-12'`
  continua sendo uma escolha de tema válida, e quem a escolher explicitamente volta a ter o mesmo problema
  (1 filho por trilha) se não controlar `span` nos próprios filhos. Já está registrado em `docs/migracoes.md`
  como aviso; a plan §9 já antecipa que isso é candidato a entrada em `15-divida-conhecida.md` na síntese —
  não editei essa spec (fora da minha alçada, [[00-prompt-executor]] §7.3).

**Pendências / riscos**

- **Esta é uma mudança MAJOR de comportamento visual** para todo consumidor que hoje monta `SarakGrid`/
  `SarakManagementGrid`/`SarakForm` sem `templateColumns` — a tela muda sem o consumidor alterar uma linha.
  É o efeito pretendido (o "antes" era o defeito), mas é grande o bastante para merecer atenção na revisão.
- **A prova de que a aba Propostas do ERP ficou legível não está aqui** — por proibição explícita da plan
  (não tocar no ERP). É verificação do dono, depois da aprovação, reinstalando a lib no consumidor.
- A suíte foi executada 2 vezes, ambas 100% verdes — não reproduzi a intermitência que a `plan-46` registra
  (fila `#22`, ainda não executada); não hávia motivo para rodar uma 3ª vez.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-08-15 — 🟢 Aprovada

Verifiquei o worktree inteiro com minhas próprias ferramentas, não pelo resumo. Aprovo. Abaixo o que
verifiquei, como, e as duas coisas que esta aprovação **não** significa.

### A medição em Chromium, conferida por aritmética independente

O ponto mais frágil de qualquer entrega assim é o número que só existe colado no resumo: o spec temporário
de Playwright foi apagado, então **não posso reexecutá-lo**. Em vez de aceitar, reproduzi por conta própria.

Para `repeat(auto-fit, minmax(280px, 1fr))`, o número de trilhas é `floor((W + gap) / (280 + gap))`:

| W | com `gap: 24px` (o `globalSectionGap` dos 5 temas) | com `gap: 16px` (sem Provider) | executor alegou |
|---|---|---|---|
| 1280 | 1304 / 304 = 4,29 → **4** | 1296 / 296 = 4,38 → **4** | 4 ✅ |
| 1024 | 1048 / 304 = 3,45 → **3** | 1040 / 296 = 3,51 → **3** | 3 ✅ |
| 768 | 792 / 304 = 2,60 → **2** | 784 / 296 = 2,65 → **2** | 2 ✅ |
| 400 | 424 / 304 = 1,39 → **1** | 416 / 296 = 1,40 → **1** | 1 ✅ |

**Bate nos dois cenários de gap.** A alegação do resumo é verdadeira e agora está confirmada por um caminho
que não depende do artefato apagado.

### A armadilha que eu tinha visto e não escrevi na plan — e que a escolha resolveu sozinha

`auto-fit` emite `grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`, uma classe Tailwind de valor arbitrário
que **até agora nunca tinha sido o caminho default**. Se a regra correspondente não estivesse no CSS
publicado, isto seria uma repetição exata do defeito da `plan-39` — classe no DOM, nenhuma regra no CSS,
nada acontece, tudo verde. Fui verificar no artefato:

```
dist/sarak.css → repeat(auto-fit,minmax(280px,1fr))   ✅ presente
```

A string já era literal no fonte antes desta plan, então o scanner do Tailwind já a coletava.
`container-query:check` verde confirma. **Risco descartado por leitura do artefato, não por dedução.**

E há um ganho estrutural que a escolha trouxe de graça: `auto-fit` é CSS Grid puro — **não depende de
container query nenhuma**. O caminho zero-config deixou de depender do mecanismo que quebrou três vezes
seguidas (plans 39, 40, 41).

### Escolha da saída: D, e a justificativa se sustenta

O executor declarou "D executada por completo, mecanicamente equivalente à B para os dois call sites reais".
Conferi que é verdade e não um atalho: `getGridStyles` tem **dois** pontos de decisão do tipo de grid
(`:23` o valor do tema, `:41` o fallback do mapa de estratégias) e **os dois** foram movidos. Sem o segundo,
um tema com valor inválido cairia de volta em `col-12` — o executor não deixou essa porta aberta.

O alerta da plan sobre a saída D foi atendido: os **5 temas embarcados chumbavam `'col-12'`** cada um no seu
arquivo, e o `defaultValue` do schema sozinho não teria consertado nada. Os 5 mudaram junto.

### Escopo e regressão

| Verificação | Resultado |
|---|---|
| `git diff --stat` | só arquivos da §3.1 — schema + 5 temas + hook + 5 testes + 3 snapshots + `docs/` |
| `@container` da `plan-41` | **intacto** — 11 arquivos de produção o plantam; `SarakGrid.tsx` não foi tocado |
| Breakpoints | `git diff` no `src/` por `@min-[` → **vazio**. Nenhum número alterado |
| Worktree do ERP | `git status` → **limpo**. Nenhum arquivo tocado |
| Sobras do spec temporário de Playwright | `git status` → único `??` é a própria plan-47. Nada esquecido |
| Os 3 snapshots do painel | `git diff --word-diff` → **exatamente duas substituições**: `col-12;` → `auto-fit;` e `data-sx-layout-grid-template`. **Zero** diferença fora do token. A alegação "conferida linha a linha" é verdadeira |
| `catalog:check` | verde — o catálogo gerado não carrega `defaultValue` (`grep -c defaultValue` → 0), então não ficou obsoleto |

### Gates, rodados por mim

| | |
|---|---|
| `npx vitest run` (INTEIRA) | **316 arquivos / 1351 testes, 100% verde** — e não encolheu |
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | *"igual ao baseline de 2026-08-11 — nenhuma regressão"* |
| `run_audit` | 2 vermelhos — `ghostvars` (1) e `composicaoatomica` (2): **exatamente o baseline**, os mesmos nomeados no veredito da `plan-41`. `auditor_paridade` passou (o token mudou de **valor**, não de forma) |
| `container-query:check` · `container-query-boundary:check` · `barrel:check` · `catalog:check` · `gate-limits:check` | **todos [OK]** |
| `useStructuralStyles.ts` | **248 linhas** — sob o teto de 250 (R9); `auditor_cleancode` [OK]. O achado que o executor relatou ter corrigido no caminho é verificável |

### Os testes são honestos, e é isso que os torna aceitáveis

Meu critério de aceite pedia *"celular continua em coluna única — evidência: teste"*. **O critério estava mal
escrito, e a culpa é minha:** jsdom não tem motor de layout, e nenhum teste deste repositório pode provar
número de colunas. O executor não fingiu que podia. Ele provou o que dá para provar (a classe emitida é a
mesma em `smartphone` e `desktop` — não existe ramo quebrado por device) e **escreveu no próprio teste** que
não prova o desenho, apontando para a medição em Chromium.

Isso é exatamente o oposto do defeito que originou as plans 39/40/41, e é o que a minha própria §8 exige.
Critério atendido pela combinação teste honesto + medição reproduzível — que eu reproduzi acima.

A proteção da `plan-39` sobreviveu: a asserção do breakpoint literal igual a `BREAKPOINT_TABLET` não foi
apagada, foi **movida** para um teste que exercita `col-12` como escolha explícita de tema.

### `docs/migracoes.md`

MAJOR, com antes/depois em tabela, o caminho de volta para quem quisesse mesmo 12 colunas, e — o que mais
importa — **a advertência de que escolher `col-12` manualmente reproduz o problema**, porque a lib segue sem
contrato de span. Entrada que declara a própria limitação é o padrão certo.

*(Os valores em px por coluna da tabela — "4 colunas de 320px" — assumem `gap: 0`; com o `gap: 24` dos temas
são ~302px. A **contagem** de colunas, que é o que decide qualquer coisa, está correta em todos os casos, e
nenhum leitor age diferente por causa disso. Registro por precisão, não como achado.)*

### O que esta aprovação NÃO significa

**1. Não significa que a tela voltou a ser o que o dono viu antes.** E não deve. Na largura do print
(~950px de área de conteúdo), o resultado agora é **3 cards de ~300px por linha** — não a proposta em linha
horizontal cheia que ele lembra. Aquele layout era o *acidente* da container query morta, nunca um contrato.
A `plan-47` entregou o que se propôs — célula legível, nunca 1/12 — e a §3.2 proibia redesenhar aparência.
**Se o dono quiser as linhas cheias de volta, isso é escolha do consumidor** (`templateColumns="1fr"` na
`Lista.tsx`) ou uma plan de aparência, nova. Não é defeito desta execução, e eu não a reprovo por isso.

**2. Não significa prova na tela.** Nem os testes (jsdom) nem a minha aritmética provam pixels. A prova é
reinstalar no ERP (`pnpm install --force --filter @erp/ui-kit` — `file:` é cópia no store, não link) e olhar.
É do dono, depois do commit.

### Resíduo declarado, e o que faço com ele

O executor declarou honestamente que a lib segue **sem contrato de span** (saída C não escolhida). Isso já
tem endereço: é o `15-divida-conhecida.md` da §9 desta plan, na síntese. **Não vira plan agora** — é dívida
nomeada, não trabalho pendente.

Mas encontrei um resíduo que a §9 **não** cobria e que esta execução criou sem querer: o piso de **280px**
de `minmax(280px,1fr)` era, até ontem, o número de um caminho opcional; a partir desta plan ele é **o número
que decide o layout de todo consumidor zero-config** — e não é token, não é themeável, e vive num vão
declarado do auditor de hardcode (que só varre `.tsx`, e ele está num `.ts`). Nada disso viola regra hoje, e
o executor não tinha instrução para tocá-lo. Pela regra de que resíduo relevante **não vira nota solta em
veredito**, abri a [`plan-48`](plan-48-piso-do-grid-content-aware-e-um-numero-solto.md), no fim da fila.

### Erro meu, registrado

O critério *"celular continua em coluna única — evidência: teste"* pedia ao executor uma prova que o ambiente
de teste não pode produzir. É a segunda vez em duas plans que escrevo um critério assim (na `plan-41` pedi ao
executor que editasse spec fixa, o que o contrato dele proíbe). **Correção de método:** critério de aceite
que envolve layout renderizado declara, no próprio critério, **qual é o instrumento** — teste para a classe
emitida, navegador para o desenho. Não deixar o executor descobrir a impossibilidade e ter que me contradizer.

### Liberação

Status espelhado no [[00-indice]] na mesma ação. **Pode commitar.**

---

## Nota pós-aprovação — 2026-08-15 — a aprovação SE MANTÉM, e foi insuficiente

Poucas horas depois de eu aprovar, o dono reinstalou no ERP e **a tela não mudou**. Registro aqui porque
veredito não se reescreve, e porque a lição não é sobre a execução — é sobre a minha escopagem.

**A execução continua correta e aprovada.** Nada do que verifiquei acima deixou de ser verdade: o default
mudou, os 5 temas mudaram, os testes provam o que dizem provar, os gates estão verdes, a medição em Chromium
que eu reproduzi por aritmética está certa. **Não reprovo retroativamente, e o diff está pronto para commit.**

**O que a tela provou é que a plan estava mal escopada — por mim.** Eu ofereci quatro saídas e tratei
*"qual é o default"* como se fosse o problema. Não era. O problema é **o que `col-12` faz**, e ele continua
fazendo: 12 trilhas, um filho por trilha, zero mecanismo de span. Mudar o default não conserta a opção
quebrada — só muda quem cai nela por omissão.

**A medição que fecha o argumento**, feita por mim no consumidor depois da reinstalação, com todas as
hipóteses fáceis eliminadas primeiro (build instalado ✅, cache do Vite regerado ✅, seletor escapado presente
em `sarak.css` e `sarak-scoped.css` ✅, 26 temas sem `col-12` ✅, guia anônima ✅):

```
GET http://127.0.0.1:3000/api/v1/conector/tema
  → design.layoutGridTemplate = "col-12"   (425 chaves persistidas)
  → activeThemeId = "erp-corporativo"
```

O valor está no **servidor** do consumidor — por isso guia anônima não muda nada. E ele chega por **três
portas legítimas** que default nenhum alcança: tema persistido (o contrato que as plans 34/38/42/43
construíram), **seleção do usuário no painel** (`"Colunas (12)"` é uma opção oferecida na UI) e tema
customizado de qualquer importador.

**A conclusão do dono, e ela está certa:** *"não podemos fazer gambiarras ou adaptações no importador,
devemos corrigir"*. Eu havia proposto apagar o campo do banco dele — isso é remendo, não conserto, e ele
recusou com razão. Enquanto `col-12` estiver quebrado, **o painel de Design oferece um botão que quebra a
tela**.

**Encaminhamento:** [`plan-49`](plan-49-col-12-continua-quebrado.md), na posição `#8` — conserta `col-12` em
si (a **Saída A** que esta plan descreveu e não escolheu), com o registro do ERP **preservado como fixture**:
a prova é a tela ficar certa sem tocar em um byte do consumidor.

**Correção de método, para mim — a terceira desta leva:** quando o defeito é *"a opção X produz resultado
ruim"*, **trocar o default não é uma saída válida** e não deve nem ser oferecida como opção na plan. Enquanto
X existir no schema, ela chega por persistência e por escolha do usuário. As saídas legítimas são duas:
**consertar X**, ou **removê-la do schema**.
