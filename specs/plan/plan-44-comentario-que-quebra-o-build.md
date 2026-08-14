---
tipo: "plan"
titulo: "Comentário de código com nome de classe derruba o build — e o gate não vê"
dominio: "Sarak-Lib-UI-Core / Build / Gates"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "build", "container-query", "gate", "defeito-ativo", "plan-41"]
relacionados: ["[[01-gates-e-baseline]]", "[[07-responsividade-e-multidispositivo]]", "[[05-build-e-distribuicao]]"]
depende_de: ""
destino_sintese: "specs/specs/01-gates-e-baseline.md · specs/specs/07-responsividade-e-multidispositivo.md"
objetivo: "`npm run build` volta a passar, e o gate passa a recusar nome de classe de container query com valor inválido — a causa que já derrubou o build duas vezes"
---

# 1. Objetivo

`npm run build` passa. E um comentário de código que soletra um nome de classe com valor inválido passa a
ser **recusado por gate**, em vez de derrubar o build de quem for construir depois.

# 2. Contexto

## 2.1 O build está quebrado AGORA — 2026-08-13

```
> @sarak/lib-ui-core@5.0.0 build:css:scoped
> node scripts/build-scoped-css.mjs
SyntaxError: Invalid media query
    at scopeCss (scripts/build-scoped-css.mjs:101:22)
```

Antes disso, o próprio Tailwind já avisa:

```
Found 1 warning while optimizing generated CSS:
    @container (width >= …) {
                       ^-- Invalid media query
      .\@min-\[…\]\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
```

## 2.2 A causa, medida

Duas linhas de **comentário** soletram um nome de classe completo com valor inválido:

| Arquivo | O que o comentário contém |
|---|---|
| `src/components/atomic/Layouts/SarakGrid.tsx:57` | `` `@min-[…]:grid-cols-N` `` |
| `src/components/atomic/Layouts/__tests__/SarakGrid.test.tsx:12` | `` `@min-[…]:grid-cols-12` `` |

O scanner do Tailwind lê arquivo como **texto** e não sabe o que é comentário. Vê `@min-[…]:grid-cols-12`,
aceita como candidato, e emite `@container (width >= …)`. O `…` não é medida — o `lightningcss` do
`build:css:scoped` recusa e morre.

**Outros dezoito comentários citam `@min-[…]` sem utilitário depois** (`@min-[…]` sozinho). Esses são
inofensivos: sem `:<utilitário>`, não formam candidato. **A linha entre inofensivo e fatal é o
`:` seguido de utilitário válido.**

## 2.3 É a segunda vez, e a primeira estava prevista por escrito

A `plan-39` teve o build derrubado exatamente assim — `@min-[Npx]:flex-row` citado em prosa de duas plans.
A saída foi `source(none)` em `sarak-base.css`, restringindo o scan a `src/**/*.{ts,tsx}`.

E a emenda §2.0 daquela plan deixou escrito, palavra por palavra:

> ⚠️ **`source(none)` não fecha tudo:** comentários dentro de `src/**/*.{ts,tsx}` continuam sendo varridos.
> Escrever um nome de classe completo num comentário de código continua injetando regra.

A `plan-41` acrescentou dezenove comentários explicando container query — e dois deles soletraram a classe
inteira. **O aviso existia, no repositório, e não virou verificação.**

## 2.4 Por que nenhum gate viu, e por que o revisor também não

`container-query:check` (`plan-39`) procura **interpolação** (`@min-[${`). Estes comentários são literais —
passa verde. Confirmado agora: com o build quebrado, o gate responde `[OK]`.

E `npm run build` está **permanentemente fora dos hooks** ([[02-enforcement-por-commit]]) por custo. Então
nada, em nenhum anel, roda o passo que quebra.

O revisor aprovou a `plan-41` tendo rodado suíte, `tsc`, baseline, `gate-limits` e os dois gates de
container query — **e não rodou `npm run build`**, porque a §5 daquela plan não o pedia. É a terceira vez
que uma lista de fecho ad-hoc omite o comando que importava (a `plan-38` omitiu `guide:check`).

# 3. Escopo

## 3.1 Dentro

1. **Consertar os dois comentários** (`SarakGrid.tsx:57`, `SarakGrid.test.tsx:12`) para que não soletrem
   classe completa. O texto tem de continuar explicando a mesma coisa — **não apague a explicação**, ela é
   o que impede a reintrodução do defeito da `plan-41`. Escreva de forma que nenhum scanner reconheça
   candidato.
2. **Endurecer `check-container-query-literal.mjs`**: além da interpolação, recusar em `src/**/*.{ts,tsx}`
   qualquer `@min-[X]:<utilitário>` em que `X` **não seja uma medida válida** (número + unidade). Isso pega
   `…`, `Npx`, `N`, e qualquer outro placeholder — inclusive em comentário, que é o ponto.
   - O gate **vale para comentário também**, de propósito: o scanner não distingue, então o gate não pode
     distinguir.
   - Atualize a declaração de R18 do script com o que ele passa a ver e o que continua sem ver.
3. **Teste do gate** (R8) com caso plantado: `@min-[…]:grid-cols-12` num arquivo de fixture **reprova**;
   `@min-[768px]:grid-cols-12` **passa**; `@min-[…]` sem utilitário **passa** (não é candidato).
4. **Fechar rodando `npm run build`** — e ele tem de passar.

## 3.2 Fora

- ⛔ **Reverter a `plan-41`.** O conserto dela está certo e aprovado; o defeito é o texto de dois
  comentários, não o `@container`.
- ⛔ **Apagar as explicações dos comentários.** Elas são a defesa contra alguém "limpar" o wrapper por não
  entender para que serve.
- ⛔ Mexer em `source(none)` ou no `@source` do `sarak-base.css` — a restrição da `plan-39` está certa e não
  é o problema aqui.
- ⛔ Pôr `build` dentro de hook. Ele está fora por custo, e isso é decisão vigente
  ([[02-enforcement-por-commit]]). A defesa é o gate estático, que é barato.
- ⛔ Mudar qualquer classe real, breakpoint ou componente.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-39-…md` §2.0 | a primeira vez que isto derrubou o build, e o aviso que previu esta |
| Plan | `specs/plan/plan-41-…md` §11 | o veredito que aprovou os comentários — leia o que foi verificado e o que não foi |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` §2 | onde o gate endurecido é registrado |
| Spec fixa | `specs/specs/02-enforcement-por-commit.md` | por que `build` está fora dos hooks |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R8 · R18 | teste ao lado; gate declara o que não vê |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |
| Código | `gates/scripts/contrato/check-container-query-literal.mjs` | o gate que passa verde com o build quebrado |

# 5. Instruções de execução

1. **Reproduza primeiro.** Rode `npm run build` e cole o erro real no resumo. Sem reproduzir, você não sabe
   se consertou.
2. **Conserte os dois comentários.** **Pronto quando** `npm run build` passa **e** a explicação continua lá.
3. **Endureça o gate**, com o teste plantado. **Pronto quando** o gate reprova o texto exato que estava em
   `SarakGrid.test.tsx:12` — mostre a saída de falha.
4. **Fechar.** Nesta ordem, colando a saída real: `npm run build` (INTEIRO — é o ponto desta plan) ·
   `npx vitest run` · `node gates/scripts/audit/run_audit.mjs` ·
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` ·
   `npm run container-query:check` · `npm run guide:check` · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-44-comentario-que-quebra-o-build.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
a §2.0 da plan-39 (a primeira vez que isto derrubou o build — e o aviso que
previu esta), a §11 da plan-41, specs/specs/00-regras-e-invariantes.md R8 e R18.

O BUILD ESTÁ QUEBRADO AGORA. `npm run build:css:scoped` morre com
"SyntaxError: Invalid media query", porque o Tailwind gerou
`@container (width >= …)`.

A CAUSA: duas linhas de COMENTÁRIO soletram um nome de classe completo com valor
inválido —
  src/components/atomic/Layouts/SarakGrid.tsx:57         `@min-[…]:grid-cols-N`
  src/components/atomic/Layouts/__tests__/SarakGrid.test.tsx:12  `@min-[…]:grid-cols-12`
O scanner do Tailwind lê arquivo como TEXTO e não sabe o que é comentário.
Outros 18 comentários citam `@min-[…]` SEM utilitário depois — esses são
inofensivos, não formam candidato. A linha entre inofensivo e fatal é o `:`
seguido de utilitário válido.

PASSO 1: rode `npm run build` e cole o erro real no resumo. Reproduza antes de
consertar.

PASSO 2: conserte os DOIS comentários de forma que nenhum scanner reconheça
candidato — e SEM apagar a explicação. Aquele texto é a defesa contra alguém
"limpar" o wrapper da plan-41 por não entender para que serve.

PASSO 3: endureça gates/scripts/contrato/check-container-query-literal.mjs. Hoje
ele procura só INTERPOLAÇÃO e por isso responde [OK] com o build quebrado —
confirmado. Ele passa a recusar também qualquer `@min-[X]:<utilitário>` em
src/**/*.{ts,tsx} onde X NÃO seja medida válida (número + unidade). Isso pega
`…`, `Npx`, `N` e qualquer placeholder.
  · Vale para COMENTÁRIO também, de propósito: o scanner não distingue, então o
    gate não pode distinguir.
  · Teste plantado obrigatório: `@min-[…]:grid-cols-12` REPROVA;
    `@min-[768px]:grid-cols-12` PASSA; `@min-[…]` sozinho PASSA.
  · Atualize a declaração de R18 do script.

LINHAS VERMELHAS:
  · Você NÃO reverte a plan-41. O conserto dela está certo; o defeito é o TEXTO
    de dois comentários.
  · Você NÃO apaga as explicações.
  · Você NÃO mexe em source(none) nem no @source do sarak-base.css.
  · Você NÃO põe build dentro de hook — ele está fora por custo, é decisão
    vigente. A defesa é o gate estático.
  · Você NÃO muda classe real, breakpoint nem componente.

FECHE RODANDO `npm run build` INTEIRO — é o ponto desta plan, e ele tem de passar.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] O erro real do build reproduzido está colado no resumo, **antes** do conserto.
- [ ] `npm run build` passa, do início ao fim.
- [ ] As explicações dos dois comentários **continuam lá** — o conserto é na forma, não no conteúdo.
- [ ] O gate recusa `@min-[…]:grid-cols-12` — **com saída de falha demonstrada**, não só a de sucesso.
- [ ] O gate continua aceitando `@min-[768px]:grid-cols-12` e `@min-[…]` sem utilitário.
- [ ] A declaração de R18 do script foi atualizada; `gate-limits:check` verde.
- [ ] `npx vitest run` inteira, verde, não encolheu; `run_audit` sem regressão; `tsc` → 0.
- [ ] `git diff --stat` — os dois arquivos de comentário, o gate, seu teste. Nada além.

# 8. Como verificar (uso do revisor)

```bash
npm run build            # ← O COMANDO DESTA PLAN. Tem de passar.

# nenhuma classe com valor inválido sobrou em src/
grep -rn "@min-\[[^]0-9]" src/ --include=*.ts --include=*.tsx

# o gate reprova o texto exato que quebrou o build?
# (plante num fixture e rode — exija a saída de falha no resumo)
npm run container-query:check

npx vitest run
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
npm run gate-limits:check
```

**O que reprova:**
- `npm run build` não rodado, ou rodado e não colado — é literalmente o objetivo desta plan;
- gate mostrado só passando;
- explicação apagada em vez de reescrita — o comentário existe para proteger o wrapper da `plan-41`;
- `plan-41` revertida.

**O que esta verificação não vê:** outros formatos de nome de classe que o Tailwind aceite e o
`lightningcss` recuse. Esta plan fecha a família `@min-[X]:` com `X` inválido, que já quebrou o build duas
vezes. **Não afirme que fecha o resto** — declare no resumo se encontrar outra família.

# 9. Destino da síntese

**Destino:** `specs/specs/01-gates-e-baseline.md` · `specs/specs/07-responsividade-e-multidispositivo.md`

- `01-gates-e-baseline.md` — a linha do gate endurecido, com o que ele passa a ver, e o registro de que
  `build` fora dos hooks significa que **defeito de build só é pego por gate estático ou por olho humano**.
- `07-responsividade-e-multidispositivo.md` §6 — a regra prática: **nunca soletre um nome de classe completo
  em comentário de código**; cite o prefixo, ou descreva sem formar candidato. Com os dois incidentes como
  evidência.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-14

**Resultado:** Concluído

**Passo 1 — reprodução, antes de qualquer conserto**

`npm run build` (o comando inteiro), saída real:

```
> @sarak/lib-ui-core@5.0.0 build:css
> npx @tailwindcss/cli -i ./src/styles/sarak-base.css -o ./dist/sarak.css --minify

Found 1 warning while optimizing generated CSS:
│   @container (width >= …) {
┆                         ^-- Invalid media query
│     .\@min-\[…\]\:grid-cols-12 {
│       grid-template-columns: repeat(12, minmax(0, 1fr));

> @sarak/lib-ui-core@5.0.0 build:css:scoped
> node scripts/build-scoped-css.mjs

C:\...\node_modules\lightningcss\node\index.js:56
      return call(options);
             ^
SyntaxError: Invalid media query
    at ... scopeCss (file:///.../scripts/build-scoped-css.mjs:101:22)
```

Confirmado: exatamente o erro descrito na plan, com a classe `.\@min-\[…\]\:grid-cols-12`
(vinda de `SarakGrid.test.tsx:12`) apontada pelo próprio Tailwind.

**O que foi feito**
- `src/components/atomic/Layouts/SarakGrid.tsx:57-70` — o comentário do wrapper `@container`
  reescrito para não soletrar `@min-[…]:grid-cols-N` como texto contínuo: o prefixo `` `@min-[` ``,
  a palavra "medida" e `` `]:` `` (mais o utilitário `` `grid-cols-N` ``, citado à parte) agora vivem
  em trechos separados por texto comum, então nenhuma sequência de caracteres do arquivo forma
  `@min-[X]:<utilitário>` contígua. **A explicação técnica original foi preservada por inteiro**
  (por que o wrapper existe, o que foi medido, o que o consumidor continua recebendo) — só a forma
  mudou. Acrescentei um segundo parágrafo de aviso explicando por quê (para não ser desfeito por
  alguém "arrumando" o comentário).
- `src/components/atomic/Layouts/__tests__/SarakGrid.test.tsx:12-18` — mesmo tratamento no
  comentário que citava `@min-[…]:grid-cols-12` — este era o que efetivamente aparecia no erro do
  Tailwind. Explicação preservada; forma quebrada; aviso acrescentado.
- `gates/scripts/contrato/check-container-query-literal.mjs` — nova função
  `findInvalidMeasureContainerQueries`: varre `@min-\[([^\]]*)\]:([A-Za-z][\w-]*)` LITERAL (sem
  `${`) e reprova quando o conteúdo do colchete não é `número + unidade CSS` (`isValidMeasure`,
  14 unidades aceitas). **Decisão deliberada, além do que a plan pedia ao pé da letra:** esta
  varredura **não exclui `__tests__/`** — ao contrário da varredura de interpolação existente
  (`findInterpolatedContainerQueries`, que continua excluindo, sem mudança). O motivo está medido
  no próprio incidente: o segundo comentário que derrubou o build morava **dentro** de
  `SarakGrid.test.tsx`, sob `__tests__/`; se a nova varredura reusasse a exclusão antiga, ela nunca
  teria pegado esse caso — o próprio bug que motivou a plan. Documentei a decisão e o porquê no
  bloco `LIMITES DECLARADOS` (item 3) e no cabeçalho do arquivo.
- `main()` do gate atualizado para rodar e reportar as três checagens (interpolação, medida
  inválida, restrição de `sarak-base.css`) com mensagens distintas por tipo.
- Bloco `LIMITES DECLARADOS` (R18) reescrito: 7 itens agora (era 5), cobrindo o escopo
  DIFERENTE dos dois checadores de literal (item 3), a não-validação de utilitário real (item 4,
  falso positivo aceito de propósito) e a fronteira explícita de família (item 7 — só
  `@min-[X]:`, não generaliza para `@max-[…]`/`data-[…]`).
- `gates/scripts/contrato/__tests__/check-container-query-literal.test.mjs` — 9 testes novos:
  `isValidMeasure` (2), `findInvalidMeasureContainerQueries` com **o texto EXATO** que quebrou o
  build (`@min-[…]:grid-cols-12`) tanto em arquivo de produção quanto **dentro de `__tests__/`**
  (2 casos plantados, o segundo é a prova de que o buraco fechou), medida válida libera, `@min-[…]`
  sozinho libera, interpolação é ignorada por esta função (delega), e 2 testes contra o
  **repositório real** (nenhuma medida inválida, nenhuma interpolação sobrou).

**Saída de FALHA demonstrada com o texto exato que quebrou o build (não só fixture)**

Anexei `// PLANTADO plan-44: @min-[…]:grid-cols-12` ao final de `SarakGrid.test.tsx` (dentro de
`__tests__/`, de propósito) e rodei o gate real:

```
--- check-container-query-literal (plan-39 + plan-44) ---
[ERROR] 1 classe(s) de container query com MEDIDA INVÁLIDA — literal, sem interpolação, e é
exatamente o que já derrubou "npm run build" (SyntaxError: Invalid media query no lightningcss):
  - src/components/atomic/Layouts/__tests__/SarakGrid.test.tsx:37 — @min-[…]:grid-cols-12
EXIT=1
```

Revertido em seguida (`cp` do backup) e reconferido verde antes de prosseguir.

**Achado durante a execução, corrigido na hora (não é achado fora do escopo — nasceu do meu
próprio texto):** ao escrever o aviso de "não faça isto" no comentário de `SarakGrid.tsx`, a
primeira versão citou o próprio padrão perigoso como exemplo — `` `@min-[algo]:grid-cols-N` ``
colado — reintroduzindo, no MEU comentário, exatamente a junção que a plan pede para evitar.
Não derrubou o build desta vez porque `grid-cols-N` não é um utilitário Tailwind real (só
`grid-cols-<número>` existe), mas era o mesmo padrão de risco. Reescrevi para não colar nenhum
exemplo literal, e é a mesma técnica que meu próprio gate agora reprovaria se `grid-cols-N` fosse
um utilitário real — conferido rodando `npm run build:css` antes e depois da correção.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Layouts/SarakGrid.tsx` | alterado | comentário reescrito (forma, não conteúdo) + aviso novo |
| `src/components/atomic/Layouts/__tests__/SarakGrid.test.tsx` | alterado | idem |
| `gates/scripts/contrato/check-container-query-literal.mjs` | alterado | nova checagem `findInvalidMeasureContainerQueries` + `isValidMeasure`; `main()` atualizado; R18 reescrito |
| `gates/scripts/contrato/__tests__/check-container-query-literal.test.mjs` | alterado | 9 testes novos, incluindo 2 casos plantados com o texto exato do incidente |
| `dist/*` | regenerado | subproduto de `npm run build` (mandatório pela plan) — ver nota abaixo |
| `specs/00-indice.md` | — | já estava modificado antes desta execução começar (não é meu) |

**Verificações executadas**
- `npm run build` (INTEIRO) → **passa do início ao fim**, sem warning de CSS nem erro de
  `lightningcss`. Saída completa colada acima do "Passo 1" (build quebrado) e confirmação de
  sucesso na seção de verificações finais desta execução.
- `npx vitest run gates/scripts/contrato/__tests__/check-container-query-literal.test.mjs`
  (isolado) → **15/15 verde** (era 6, +9).
- `npx vitest run` (suíte INTEIRA) → **315 arquivos / 1335 testes, 100% verde** (213,0 s). Era
  315/1326 antes desta plan — cresceu exatamente os 9 testes novos, nenhum arquivo a mais nem a
  menos.
- `node gates/scripts/audit/run_audit.mjs` → **2 auditores vermelhos**, os mesmos de sempre
  (`auditor_composicaoatomica` em `SarakMultiSelect.tsx`/`SarakUploader.tsx`, variável-fantasma),
  sem relação com esta plan.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `igual ao baseline de
  2026-08-11 — nenhuma regressão`.
- `npx tsc --noEmit` → **0 erros**, exit 0.
- `npm run container-query:check` → `[OK] Nenhuma classe de container query (@min-[…]) montada
  por interpolação ou com medida inválida em src/ (comentário incluído), e sarak-base.css
  restringe o scan do Tailwind`.
- `npm run guide:check` → `kit em dia (6 arquivos)`.
- `npm run gate-limits:check` → `[OK] Os 32 scripts de gates/scripts/ declaram o que não veem`
  — confirma que o R18 reescrito foi reconhecido.
- `git diff --stat` / `git status --short` → os arquivos da tabela acima, mais `dist/*`.

**Nota sobre `dist/*` no diff — não é scope creep**

`git status` já mostrava `dist/` modificado **antes** de eu tocar em qualquer arquivo (resíduo do
build quebrado, parcialmente executado antes desta sessão: `build:js` tinha rodado e gerado
chunks novos com hash novo; `build:css`/`build:css:scoped` nunca chegaram a rodar). A §5 item 4 da
plan manda fechar rodando `npm run build` **inteiro**, e ele **é** o ponto da plan — não rodá-lo
não prova o conserto. `npm run build` regenera `dist/` por inteiro, e `tsup` usa nomes de chunk
com hash de conteúdo, então qualquer rebuild troca nomes de arquivo mesmo quando o conteúdo lógico
mal muda — esse churn já existia no `git status` do início da execução, antes de eu editar
qualquer coisa. Não editei nada em `dist/` à mão; é saída inteiramente do comando que a plan exige
rodar. Deixei como o build produziu, para o revisor conferir com o próprio `npm run build`.

**Critérios de aceite**
- [x] O erro real do build reproduzido está colado no resumo, antes do conserto — evidência:
      "Passo 1" acima.
- [x] `npm run build` passa, do início ao fim — evidência: seção "Verificações executadas".
- [x] As explicações dos dois comentários continuam lá — evidência: diff colado, mesmo conteúdo
      técnico, só forma reescrita.
- [x] O gate recusa `@min-[…]:grid-cols-12`, com saída de falha demonstrada — evidência: seção
      dedicada acima, com o texto exato do incidente, plantado DENTRO de `__tests__/`.
- [x] O gate continua aceitando `@min-[768px]:grid-cols-12` e `@min-[…]` sem utilitário — evidência:
      testes `'libera @min-[768px]:grid-cols-12 — medida válida'` e `'libera @min-[…] SOZINHO…'`.
- [x] R18 atualizado; `gate-limits:check` verde — evidência acima.
- [x] `npx vitest run` inteira verde, não encolheu; `run_audit` sem regressão; `tsc` → 0 —
      evidência acima.
- [x] `git diff --stat` — os dois arquivos de comentário, o gate, seu teste, mais `dist/*`
      (subproduto do `npm run build` mandatório — justificado na nota acima, não é código
      adicional escrito por mim).

**Decisões e suposições**
- **Varrer `__tests__/` na nova checagem de medida inválida, diferente da checagem de
  interpolação.** A plan não distinguiu escopo entre as duas explicitamente, mas o próprio caso
  real (`SarakGrid.test.tsx:12`) só existe porque a exclusão de `__tests__/` (correta para
  interpolação, que é inerte para o build) escondia comentários literais perigosos também. Reusar
  a mesma exclusão teria reproduzido o buraco dentro do próprio conserto. Documentado como decisão
  no R18 e no cabeçalho do gate.
- **Não validar se `<utilitário>` é um nome real do Tailwind.** Qualquer identificador
  `[A-Za-z][\w-]*` logo após `]:` conta como candidato — aceito o risco de falso positivo (baixo
  custo: reescrever um comentário) para não arriscar falso negativo (alto custo: build quebrado em
  consumidor). Foi exatamente essa folga que pegou meu próprio erro de redação, descrito acima.
- **Não toquei em `TODO` pré-existente** em `SarakGrid.test.tsx:9` (`// TODO: Injetar testes de
  montagem profunda...`) — fora do escopo declarado da plan, não relacionado ao defeito.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. Os 2 auditores vermelhos de `run_audit` já eram vermelhos no baseline. A própria
  plan já avisa (§"O que esta verificação não vê") que outras famílias de variante arbitrária do
  Tailwind (`@max-[…]`, `data-[…]`, etc.) não foram varridas — não encontrei nenhuma ocorrência
  delas com valor suspeito no repositório, mas não afirmo que a família inteira está coberta:
  só `@min-[X]:` fechou, como a plan pediu.

**Pendências / riscos**
- Nenhuma pendência conhecida dentro do escopo desta plan.
- A síntese para `specs/specs/01-gates-e-baseline.md` e
  `specs/specs/07-responsividade-e-multidispositivo.md` §6 é do revisor/`spec-atualizar`, fora do
  escopo do executor (§9 da plan).

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-14 — 🟢 Aprovada

O build volta a passar, e o gate agora pega a causa. Mas o que aprova esta execução é o executor ter ido
**além da letra da plan pelo motivo certo** — e ter contado.

### O build

```
[generate-build-info] dist/BUILD_INFO.json — baseCommit 0e5a6cd, builtAt 2026-08-14T02:53:06.318Z
```

`npm run build` inteiro, do começo ao fim, **exit 0**, e `grep -ci "invalid"` na saída → **0**. O aviso do
Tailwind e o `SyntaxError` do `lightningcss` sumiram.

### A extensão de escopo, e por que está certa

A plan mandava recusar `@min-[X]:<utilitário>` com `X` inválido. O executor **também estendeu ao
`__tests__/`**, que a checagem de interpolação exclui de propósito — e explicou por quê no próprio script:

> *"foi exatamente um comentário dentro de `__tests__/` que quebrou o build"*

Está certo, e eu não tinha pedido. O segundo comentário culpado morava em
`SarakGrid.test.tsx:12`; reusar a exclusão existente teria deixado o buraco aberto **no arquivo exato do
incidente**. As duas checagens agora têm escopos diferentes, cada um com sua razão escrita.

### O conserto dos comentários

A explicação **não foi apagada** — foi reescrita para não formar candidato:

> *"prefixo `@min-[` + medida + `]:` seguido do utilitário, ex.: `grid-cols-N`"*

O nome da classe deixou de existir como texto contíguo, e quem lê continua entendendo exatamente a mesma
coisa. Era o critério mais fácil de falhar (apagar resolve o build e destrói a defesa do wrapper da
`plan-41`) e passou.

Varredura de confirmação, excluindo a forma interpolada — que é o idioma legítimo dos testes companheiros:

```
grep -rn "@min-\[[^]$]*\]:[a-zA-Z]" src/ | grep -vE "@min-\[[0-9]+(px|rem|em)\]"
  → vazio
```

### Gates

| | |
|---|---|
| `npm run build` | **verde, inteiro**, zero avisos de CSS inválida |
| `npx vitest run` | **1335 testes, verde** (era 1326) |
| `container-query:check` | verde, e a mensagem agora diz *"por interpolação **ou com medida inválida**… (comentário incluído)"* |
| `gate-limits:check` | **32/32** |
| `npx tsc --noEmit` · baseline | **0** · igual ao baseline de 2026-08-11 |

### O achado que o executor contou sobre si mesmo

> *"meu próprio primeiro rascunho do comentário-aviso reintroduziu acidentalmente o padrão perigoso como
> exemplo — corrigido na hora, documentado no resumo."*

Isso é a melhor evidência de que o gate era necessário. O defeito é **tão fácil de reintroduzir** que
reincidiu dentro da própria execução que o consertava — escrevendo o aviso contra ele. Sem o gate, teria
saído no commit.

### O que continua sem cobertura, declarado

Esta plan fecha a família `@min-[X]:` com `X` inválido. **Não fecha** outros formatos que o Tailwind aceite
e o `lightningcss` recuse — se existirem, aparecem do mesmo jeito: quebrando o build de quem construir. A
defesa estrutural continua sendo `npm run build` rodar antes da tag, e ele está fora dos hooks por custo.

### A lição que é minha, e vai para a síntese

Três vezes uma lista de fecho minha omitiu o comando que importava: `guide:check` na `plan-38`, `build` na
`plan-41`, e foi só a `plan-41` chegar ao dono para o defeito aparecer. **Lista de fecho ad-hoc não é
método.** Toda plan que toca `src/` e pode afetar CSS ou bundle fecha com `npm run build`; toda plan que
toca superfície pública fecha com `guide:check`. Isso entra na síntese de [[01-gates-e-baseline]], não como
recomendação, mas como parte do checklist do revisor.

### Destino da síntese

Declarado na §9, **não executado por mim**: `01-gates-e-baseline.md` ganha a linha do gate endurecido e o
registro de que **`build` fora dos hooks significa que defeito de build só é pego por gate estático ou por
olho humano**; `07-responsividade-e-multidispositivo.md` §6 ganha a regra prática — **nunca soletre um nome
de classe completo em comentário de código** — com os dois incidentes como evidência.
