---
tipo: "plan"
titulo: "Consertar as classes de container query que o código emite e o CSS publicado não tem"
dominio: "Sarak-Lib-UI-Core / Responsividade / Build"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "responsividade", "container-query", "tailwind", "gate", "defeito-ativo"]
relacionados: ["[[07-responsividade-e-multidispositivo]]", "[[01-gates-e-baseline]]", "[[00-mapa-do-modulo]]", "[[05-cromo-e-slots]]"]
depende_de: "plan-35"
destino_sintese: "specs/specs/07-responsividade-e-multidispositivo.md · specs/specs/01-gates-e-baseline.md"
objetivo: "Toda classe de container query que a lib coloca no DOM tem regra correspondente no CSS publicado, e um gate impede que volte a divergir"
---

# 1. Objetivo

O que a lib escreve no `class` do elemento existe no `dist/sarak.css`. Hoje **11 de 19** classes de
container query da lib não existem lá — a mais visível é a barra de navegação da topbar, que fica
`display:none` para sempre. E, ao fim desta plan, um gate impede que a divergência volte, porque **nenhuma
verificação existente faz essa pergunta**.

# 2. Contexto

## 2.0 🔧 EMENDA DE ESCOPO — 2026-08-12, durante a execução (decisão do revisor)

O executor reportou que `npm run build` quebra e atribuiu a causa à prosa da `plan-35.md` contaminando o
scanner. **Reproduzi, e o diagnóstico está incompleto — a causa é mais larga e mais séria.**

**O que eu medi:**

1. `npm run build:css` **não quebra**. Os seis gates que rodam antes dele também não. Quem quebra é
   `npm run build:css:scoped` — `scopeCss` (lightningcss) morre com **`Invalid media query`** ao reprocessar
   o CSS recém-gerado.
2. A regra que o mata é `@container (width >= Npx)`. `Npx` não é medida.
3. A origem dela: `grep -rn "min-\[Npx\]:flex-row"` no repositório inteiro devolve **dois arquivos, ambos
   `.md`** — `specs/plan/plan-35-…md:139` e `specs/plan/plan-39-…md:31`.

**A conclusão, e é o ponto:** a detecção automática do Tailwind v4 varre **o repositório inteiro**, `.md`
incluído. O único `@source` explícito (`sarak-base.css:13`) **soma**, não restringe. Ou seja: **qualquer
documento de spec que cite um nome de classe injeta regra no CSS publicado — ou derruba o build.** É a
mesma família do achado desta plan (o scanner enxergando o que não devia), do outro lado.

**Decisão: opção A — restringir o scan.** `@import "tailwindcss" source(none);` em
`src/styles/sarak-base.css`, mantendo o `@source "../**/*.{ts,tsx}"` que já existe. Uma linha, na causa.

**Por que não as outras duas:**

- **Editar a `plan-35.md`** conserta o sintoma de hoje e **nem isso**: a `plan-39.md` tem a mesma string, e
  qualquer spec futura que documente uma classe rebreca o build. Além disso, plan aprovada é registro — não
  se reescreve documento para agradar um build.
- **Só relatar e não reconstruir `dist/`** abandona justamente o que esta plan entrega. `dist/` é
  versionado; sem ele o consumidor continua com a topbar invisível, que é o motivo da plan existir.

**Isto estende o escopo da §3.1 em um arquivo — `src/styles/sarak-base.css` — e a extensão é obrigatória,
não opcional.** Junto com ela, duas exigências novas, porque a linha não é inócua:

1. **Meça o CSS antes e depois.** `source(none)` **remove** do bundle toda classe que hoje é colhida fora de
   `src/**/*.{ts,tsx}`. Gere a lista de seletores dos dois CSS e **diffe**. Cada classe que sumir precisa de
   veredito escrito: era uso real de arquivo de produção fora do glob (então acrescente um `@source` para
   ele) ou era lixo de documentação (então sumir é o objetivo). **Nenhuma sumindo em silêncio.**
2. **O gate novo (§3.1 item 4) passa a verificar também** que `sarak-base.css` declara `source(none)` com
   `@source` explícito — senão a porta reabre na primeira vez que alguém mexer no CSS de entrada.

⚠️ **Note que `source(none)` não fecha tudo:** comentários dentro de `src/**/*.{ts,tsx}` continuam sendo
varridos. Escrever um nome de classe completo num comentário de código continua injetando regra. Registre
isso na síntese — é dedo no olho de quem for documentar breakpoint em comentário depois.

## 2.1 O mecanismo, em uma frase

O scanner do Tailwind v4 **lê os arquivos como texto e recorta nomes de classe; não executa o código**.
Classe montada por interpolação (`@min-[${BREAKPOINT_DESKTOP}px]:flex`) deixa no texto do arquivo uma
string que não é classe válida — o Tailwind descarta, e a regra nunca é gerada. Em runtime o navegador
resolve a conta e põe `@min-[1024px]:flex` no DOM, apontando para uma regra que não existe.

**Prova de que o scanner é literal:** o `dist/sarak.css` publicado contém a regra
`@container (width >= Npx) { .[@]min-[Npx]:flex-row { … } }`. `Npx` não é medida — a string
`@min-[Npx]:` aparece **num comentário** de `useStructuralStyles.presets.ts:6`, e o scanner recortou. Se ele
avaliasse JavaScript, jamais produziria `Npx`.

## 2.2 A medição — 2026-08-12, contra o `dist/sarak.css` publicado

Sítios que montam classe de container query por interpolação: **15 linhas em 6 arquivos**
(`grep -rn '@min-\[\${' src/ --include=*.ts --include=*.tsx | grep -v __tests__`). Deles saem **19 classes
distintas**. Conferidas uma a uma contra o CSS publicado, **normalizando os escapes do seletor antes de
comparar** (ver a armadilha na §8):

| Ausente no CSS publicado | Onde é emitida | O que deixa de funcionar |
|---|---|---|
| `@min-[1024px]:flex` | `core/Shell/Components/TopbarNav.tsx:114` | 🔴 **a nav de módulos da topbar não aparece nunca** |
| `@min-[768px]:flex-row` · `@min-[1024px]:flex-row` | `useStructuralStyles.ts:96,229` | `SarakStack` nunca vira linha; cabeçalhos ficam empilhados |
| `@min-[768px]:items-center` | `useStructuralStyles.ts:229` | alinhamento do cabeçalho horizontal |
| `@min-[768px]:grid-cols-12` | `useStructuralStyles.ts:40` | o layout `col-12` fica em 1 coluna |
| `@min-[768px]:columns-2` · `@min-[1024px]:columns-3` | `useStructuralStyles.ts:42` | `masonry` fica em 1 coluna |
| `@min-[1024px]:pt-12` · `@min-[1024px]:text-5xl` | `core/Shell/Components/ShellContent.tsx:38,54` | respiro e título do Shell no tamanho de telefone em qualquer largura |
| `@min-[640px]:px-6` · `@min-[1024px]:px-8` | `core/Shell/hooks/useShellLayoutStyles.ts:33` | padding lateral do layout `center` não cresce |

As **8 restantes** existem no CSS — e é aqui que fica claro que nada disso é intencional. Nenhuma delas é
soletrada por arquivo de produção: `@min-[768px]:grid-cols-2`, `@min-[1024px]:grid-cols-3/4`,
`@min-[1280px]:grid-cols-3/4`, `@min-[640px]:p-6`, `@min-[640px]:mb-8` e `@min-[1024px]:p-8` existem porque
**um único arquivo de teste as escreve por extenso** — `useStructuralStyles.presets.test.ts:6-8` — e o
`@source "../**/*.{ts,tsx}"` de `src/styles/sarak-base.css:13` varre `__tests__` junto. **A CSS de produção
da lib é gerada por um arquivo de teste.** Reescrever aquele teste para usar interpolação apaga as 8, em
silêncio.

## 2.3 O caso da topbar, porque é o que dói

`TopbarNav.tsx:114` emite `hidden @min-[1024px]:flex …`. `.hidden{display:none}` **existe** no CSS
publicado; `@min-[1024px]:flex` **não**. Nada revoga o `display:none` — em largura nenhuma. Conferido:
`BREAKPOINT_DESKTOP = 1024` (`core/Design/breakpoints.ts:19`), e não há `safelist` nem `@source inline` em
lugar nenhum (`sarak-base.css:13` é o único `@source` do repositório).

## 2.4 Por que nenhum gate viu

Porque nenhum gate compara **classe emitida** com **CSS gerado**. `tsc`, a suíte inteira,
`auditor_hardcoded`, o baseline e o `catalog:check` passaram todos por cima: para todos eles a string
`@min-[${BREAKPOINT_DESKTOP}px]:flex` é um template literal perfeitamente válido. Os testes afirmam a
**string**, não o **efeito** — e a string está certa. É a lição de [[15-divida-conhecida]] §3.1 na forma
mais pura: **suíte verde não é produto correto.**

## 2.5 De onde veio, e por que não é culpa da plan-35

O idioma nasceu com a Spec 40.3 (multidispositivo por padrão) e é anterior a tudo desta leva. A `plan-35`
o seguiu porque a própria plan mandou seguir, e ainda assim escreveu um dos três presets dela **literal**
(`panelResponsive.presets.ts:22`) — hoje a **única** classe de container query soletrada por arquivo de
produção em todo o repositório. O achado saiu da verificação daquela plan e está registrado no veredito
dela.

# 3. Escopo

## 3.1 Dentro

1. **Os 6 arquivos que montam classe por interpolação** passam a guardar a classe **literal**:
   - `src/components/atomic/hooks/useStructuralStyles.presets.ts` (5 presets)
   - `src/components/atomic/hooks/useStructuralStyles.ts` (`:40`, `:42`, `:96`, `:229`)
   - `src/core/Shell/Components/TopbarNav.tsx:114`
   - `src/core/Shell/Components/ShellContent.tsx:38,54`
   - `src/core/Shell/hooks/useShellLayoutStyles.ts:33`
   - `src/features/DesignEngine/Canvas/panelResponsive.presets.ts:15,16`
2. **O teste companheiro de cada um afirma a igualdade contra a forma interpolada** —
   `expect(X).toBe(\`…\${BREAKPOINT_TABLET}px…\`)`. Literal para o scanner ver; interpolado no teste para
   pegar deriva se a constante mudar. O idioma já existe em
   `Canvas/__tests__/panelResponsive.presets.test.ts` — copie-o, não invente outro.
3. **O caso `useStructuralStyles.ts:96` não é uma constante, é um mapa** (`stackBreakpoints`, `md`/`lg`).
   Vira um mapa de **strings de classe literais**, não de números. Os dois valores entram, mesmo que só um
   tenha consumidor hoje.
4. **Gate novo, estático e barato** (`gates/scripts/contrato/`, junto dos outros `check-*.mjs`): nenhum
   arquivo de produção pode montar classe `@min-[…]` por interpolação; toda ocorrência tem de ser literal.
   Roda em Anel 1, sem build. Entra em `package.json` como `*:check` e na tabela de [[01-gates-e-baseline]].
5. **Rebuild do `dist/`.** `dist/` é **versionado** (é assim que a instalação por tag funciona — ADR-008):
   sem `npm run build` e o `dist/sarak.css` novo no commit, o conserto não chega a consumidor nenhum.
6. **Entrada em `docs/migracoes.md`.** O layout de quem já consome **vai mudar de aparência**: coisas
   empilhadas viram linha, a nav da topbar aparece. Consumidor que compensou o defeito com CSS próprio
   precisa saber. Classifique a severidade por [[03-versionamento-e-release]] §3.
7. Teste ao lado de cada arquivo tocado (R8), inclusive do gate novo.
8. **`src/styles/sarak-base.css` — `source(none)`** *(acrescentado pela emenda §2.0, obrigatório)*, com o
   diff de seletores antes×depois no resumo.

## 3.2 Fora

- ⛔ **Trocar `@min-[Npx]:` por breakpoint nomeado (`@md:`/`@lg:`) redefinindo a escala `--container-*`.** É
  a alternativa estruturalmente mais limpa, e por isso mesmo é **decisão de contrato de token** — precisa de
  ADR, não de execução. Com a topbar quebrada em produção, o conserto vem primeiro.
- ⛔ **`safelist` / `@source inline(...)` no CSS.** Resolveria, e cria uma segunda lista para manter em
  sincronia com o código — exatamente a duplicação de fonte que R6 existe para impedir.
- ⛔ **Mudar qualquer número.** 640/768/1024/1280 continuam os mesmos. Esta plan troca **como a classe é
  escrita**, nunca o breakpoint.
- ⛔ **Mudar layout, cor, espaçamento ou hierarquia visual** por achar que ficou melhor. Se ao ligar a
  responsividade algo ficar feio, **relate — não redesenhe**: é achado, e vira plan.
- ⛔ **"Consertar" pelo arquivo de teste** — soletrar mais classes em `__tests__` para o scanner achar. É a
  causa do problema, não a cura.
- ⛔ `src/features/DesignEngine/` além dos 2 presets citados — painel é `plan-36`/`plan-37`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6 | a "camada 3" (container query estrutural) é o mecanismo que esta plan conserta |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` §2 | onde o gate novo entra, e em que anel |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R8 · R18 · R20 | teste ao lado; **todo gate declara o que não vê**; baseline não regride |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` §3 e §5 | classificar a mudança e escrever a entrada de migração |
| Plan | `specs/plan/plan-35-…md` §11 (veredito + adendo) | a medição original e a prova; **não refaça a investigação, confirme-a** |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/features/DesignEngine/Canvas/panelResponsive.presets.ts:22` + seu teste | o idioma-alvo, já pronto no repo |

# 5. Instruções de execução

1. **Confirme a medição antes de mexer.** Rode os comandos da §8 e cole no resumo a lista de classes
   ausentes que **você** mediu. Se divergir da tabela da §2.2, a sua medição manda — relate a diferença.
   **Pronto quando** a lista estiver no resumo, datada, antes de qualquer edição.
2. **Converta arquivo por arquivo**, começando por `TopbarNav.tsx:114` (o defeito visível). A classe vira
   literal; o teste companheiro afirma a igualdade contra a forma interpolada. **Pronto quando** cada
   arquivo tiver seu teste e a suíte estiver verde.
3. **`useStructuralStyles.ts:96`** — mapa de classes literais por `'md'`/`'lg'`, não de números.
4. **Escreva o gate** em `gates/scripts/contrato/`, no padrão dos `check-*.mjs` vizinhos: falha se algum
   arquivo de produção montar `@min-[` por interpolação. Registre em `package.json` e na tabela de
   [[01-gates-e-baseline]] — **com a coluna do que ele não vê** (R18): ele é estático, não constrói CSS,
   logo não prova que a regra foi gerada; prova só que o nome está soletrado.
5. **Rode `npm run build`** e confirme, no `dist/sarak.css` novo, que as 11 ausentes passaram a existir.
   **Pronto quando** o comando de conferência da §8 voltar sem nenhuma ausente.
6. **Escreva a entrada de `docs/migracoes.md`** — o que muda de aparência, por quê, e o que fazer se o
   consumidor tinha CSS compensando.
7. **Feche.** Nesta ordem, colando a saída real: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` ·
   `npx tsc --noEmit` · o gate novo · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-39-classes-de-container-query-que-nao-chegam-ao-css.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/07-responsividade-e-multidispositivo.md §6,
specs/specs/01-gates-e-baseline.md §2,
specs/specs/00-regras-e-invariantes.md (R8, R18, R20),
e a §11 da specs/plan/plan-35-layout-responsivo-painel-design-engine.md (veredito +
adendo) — é onde está a prova; confirme-a, não a refaça do zero.
Skills a aplicar: padrao-escrita, padrao-typescript, test-unitario.

O PROBLEMA EM UMA FRASE: o scanner do Tailwind v4 lê arquivos como TEXTO e não
executa código. Classe montada por interpolação (`@min-[${CONST}px]:flex`) nunca é
vista, a regra nunca é gerada, e o elemento fica com uma classe que não existe no
CSS. Hoje 11 de 19 classes de container query da lib estão nessa situação — entre
elas `@min-[1024px]:flex` do TopbarNav.tsx:114, que deixa a nav da topbar em
display:none PARA SEMPRE.

PASSO 1, ANTES DE QUALQUER EDIÇÃO: rode a conferência da §8 e cole no resumo a
lista de classes ausentes que VOCÊ mediu. Atenção à armadilha: o seletor no CSS vem
com escapes (\@min-\[1024px\]\:flex) — normalize antes de comparar, ou você terá
falso negativo. A §8 mostra como.

O CONSERTO: a classe passa a ser escrita LITERAL no código de produção, e o teste
companheiro afirma a igualdade contra a forma interpolada — literal para o scanner
ver, interpolado no teste para pegar deriva de constante. O idioma já está pronto em
src/features/DesignEngine/Canvas/panelResponsive.presets.ts:22 e no teste dele.
Copie-o, não invente outro.

LINHAS VERMELHAS:
  · Você NÃO muda nenhum número (640/768/1024/1280 continuam iguais). Muda só COMO
    a classe é escrita.
  · Você NÃO troca para breakpoint nomeado (@md:/@lg:) — isso é decisão de escala de
    token e precisa de ADR.
  · Você NÃO usa safelist nem @source inline — seria uma segunda lista para manter
    em sincronia.
  · Você NÃO "conserta" soletrando classes em __tests__. Isso é a causa, não a cura.
  · Achou layout feio depois de ligar a responsividade? RELATE, não redesenhe.

Não esqueça: `dist/` é VERSIONADO. Rode `npm run build` e confira no dist/sarak.css
novo que as ausentes passaram a existir — sem isso o conserto não chega a consumidor
nenhum.

O gate novo vai em gates/scripts/contrato/, no padrão dos check-*.mjs vizinhos, e
entra na tabela de 01-gates-e-baseline.md COM a coluna do que ele não vê (R18).

Todo conserto leva teste ao lado (R8).

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] A lista de classes ausentes medida pelo executor está no resumo, **datada antes** das edições.
- [ ] Nenhum arquivo de produção monta classe `@min-[` por interpolação — varredura da §8 volta **vazia**.
- [ ] As **11** classes ausentes existem no `dist/sarak.css` reconstruído; nenhuma das 8 que já existiam
      sumiu.
- [ ] `TopbarNav.tsx:114` — teste provando que a classe emitida é literal, e evidência de que a regra
      existe no CSS construído.
- [ ] O gate novo falha num caso plantado (mostre a saída de falha, não só a de sucesso) e está registrado
      em [[01-gates-e-baseline]] **com o que ele não vê**.
- [ ] `docs/migracoes.md` tem entrada nova, classificada por [[03-versionamento-e-release]] §3.
- [ ] `npx vitest run` inteira, verde, não encolheu.
- [ ] `run_audit` sem regressão; `npx tsc --noEmit` → 0 erros.
- [ ] `git diff --stat` — os 6 arquivos da §3.1, seus testes, o gate novo, `package.json`, `docs/`,
      `specs/specs/01-gates-e-baseline.md` e o `dist/` reconstruído. Nada além.

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

# 1. Ninguém mais monta classe de container query por interpolação. Tem de voltar VAZIO.
grep -rn '@min-\[\${' src/ --include=*.ts --include=*.tsx | grep -v __tests__

# 2. As classes que o código usa existem no CSS publicado?
#    ARMADILHA: o seletor no CSS sai escapado (.\@min-\[1024px\]\:flex). Comparar
#    sem normalizar dá FALSO NEGATIVO — eu caí nessa na investigação original.
npm run build
tr -d '\\' < dist/sarak.css > /tmp/css-limpo
for c in "1024px]:flex " "768px]:flex-row" "768px]:grid-cols-12" "768px]:columns-2" \
         "1024px]:columns-3" "1024px]:pt-12" "1024px]:text-5xl" "1024px]:px-8" \
         "640px]:px-6" "768px]:items-center" "1024px]:flex-row"; do
  printf "%-26s" "@min-[$c"
  grep -qF ".@min-[$c" /tmp/css-limpo && echo "OK" || echo "AUSENTE"
done

# 3. As 8 que já funcionavam continuam funcionando (não podem sumir)
grep -cF ".@min-[768px]:grid-cols-2" /tmp/css-limpo

npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
```

**O que reprova, além do óbvio:**
- Gate que só foi mostrado passando. Gate que nunca falhou não é gate — exija a saída de falha.
- Classe soletrada em `__tests__` para "resolver". É a causa do defeito.
- Qualquer número de breakpoint diferente de 640/768/1024/1280.
- `dist/` não reconstruído: o worktree fica verde e o consumidor continua quebrado.

**O que esta verificação não vê:** que o layout ficou *bom*. Ela prova que a regra existe e que a classe é
literal — não que a topbar ficou bonita em 1200px. Isso é olho humano, ou E2E com motor de layout.

# 9. Destino da síntese

**Destino:** `specs/specs/07-responsividade-e-multidispositivo.md` · `specs/specs/01-gates-e-baseline.md`

**Texto pronto para transporte:**

- `07-responsividade-e-multidispositivo.md` §6 (camada 3) ganha a regra explícita: **classe de container
  query se escreve literal; a amarração com a constante mora no teste** — com o porquê (o scanner é
  textual) e o incidente como evidência.
- `01-gates-e-baseline.md` §2 ganha a linha do gate novo na tabela, com anel, o que cobre e **o que não
  vê**.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-12

**Resultado:** Concluído

**Medição inicial (antes de qualquer edição), 2026-08-12:**

`grep -rn '@min-\[\${' src/ --include=*.ts --include=*.tsx | grep -v __tests__` devolveu as **15 linhas em 6
arquivos** já listadas na §2.2 da plan. Conferidas as 19 classes derivadas contra o `dist/sarak.css` do HEAD
(normalizando escapes): as **11 mesmas** da tabela da §2.2 estavam **AUSENTES**, as **8** restantes
**PRESENTES**. Minha medição bate exatamente com a da plan — nenhuma divergência.

**O que foi feito**

1. `useStructuralStyles.presets.ts` — 5 presets (`RESPONSIVE_GRID_PRESETS` ×3, `RESPONSIVE_SPACING_PRESETS`
   ×2) viraram string literal; `BP_SM`/`BP_XL` passaram a ser **exportados** (só para o teste interpolar
   contra eles). Import de `BREAKPOINT_TABLET`/`BREAKPOINT_DESKTOP` removido (ficou sem uso).
2. `useStructuralStyles.ts:40,42` (`gridStrategies`), `:96` (mapa `stackBreakpoints`→`stackBreakpointClasses`,
   agora de **classes literais**, não números) e `:229` (`headerClass`) — todos literais.
3. `TopbarNav.tsx:114` — a classe da nav de módulos virou literal; marcador `sarak-allow-hardcode` na linha
   acima (ver "Decisões").
4. `ShellContent.tsx:38,54` — as duas classes viraram literais; mesmo marcador nas duas.
5. `useShellLayoutStyles.ts:33` (`contentStrategies.center`) — literal; `BP_SM` local (não exportado de
   `breakpoints.ts`) inline.
6. `panelResponsive.presets.ts:15,16` (`CATALOG_GRID_2COL`, `CATALOG_GRID_3COL`) — literais; import de
   `BREAKPOINT_TABLET`/`BREAKPOINT_DESKTOP` removido (só `PREVIEW_DUAL_VIEW_ROW`, já literal, sobrava).
7. Teste companheiro de cada arquivo (existente, editado, ou novo) afirma a igualdade contra a forma
   interpolada — importando `BREAKPOINT_TABLET`/`BREAKPOINT_DESKTOP` de `breakpoints.ts` (e `BP_SM`/`BP_XL`
   dos presets, quando exportados).
8. **Gate novo** `gates/scripts/contrato/check-container-query-literal.mjs` — falha se `src/**/*.{ts,tsx}`
   (exceto `__tests__/`) montar `@min-[…]` por interpolação; e falha se `src/styles/sarak-base.css` não
   declarar `source(none)` + `@source` explícito (emenda §2.0). Registrado em `package.json` como
   `container-query:check` e na tabela de `01-gates-e-baseline.md` §2.2, com a coluna do que não vê.
9. **`src/styles/sarak-base.css`** — `@import "tailwindcss" source(none);`, mantendo o `@source
   "../**/*.{ts,tsx}";` já existente (emenda §2.0 — ver "Bloqueio e emenda" abaixo).
10. `docs/migracoes.md` — entrada nova classificada **MAJOR** (comportamento default mudou sem opt-in, mesmo
    critério da `4.0.0`).
11. `dist/` reconstruído (`npm run build`, completo, sem crash).

**Bloqueio encontrado e emenda do revisor (durante a execução)**

`npm run build` já estava quebrado no HEAD, antes de qualquer edição minha: a detecção **automática** de
conteúdo do Tailwind v4 varre o repositório inteiro (`.md` incluído, respeitando só `.gitignore`) — não só o
`@source` explícito. `specs/plan/plan-35-…md:139` e o próprio `specs/plan/plan-39-…md` (§2.1/§2.2, antes da
emenda) citam `@min-[Npx]:flex-row`/`@min-[Npx]:` em prosa; o scanner tratava isso como classe, gerava
`@container (min-width:Npx)` — CSS inválida — e derrubava `build:css:scoped` (lightningcss). Reportei o
achado ao usuário (não podia editar `plan-35.md`, plan alheia); o revisor confirmou por medição própria,
corrigiu meu diagnóstico (a causa não é só `plan-35.md`; é a detecção automática em si — `plan-39.md` tinha a
mesma string) e aprovou a **opção A**, registrada na emenda §2.0: `source(none)` em `sarak-base.css`, com
diff de seletores obrigatório e o gate estendido. Executado como descrito acima (itens 8 e 9).

**Diff de seletores ANTES × DEPOIS de `source(none)` (exigência 1 da emenda)**

Extraído via `lightningcss` (visitor `Selector`, mesma API de `scripts/build-scoped-css.mjs`), comparando o
CSS de `build:css` isolado antes e depois da mudança (a regra `@container (min-width:Npx)` foi removida do
"antes" antes de parsear, por ser a própria CSS inválida que o `source(none)` existe para eliminar — sem
isso o parser não completa).

- **1669 → 1644 seletores de topo únicos.** **25 desapareceram, 0 apareceram.**
- **Veredito, um a um — todos "lixo de doc/tooling", nenhuma classe real de produção perdida:**
  - 12×`[nome-do-gate]` (`[audit:baseline]`, `[barrel:check]`, …) — prefixos de `console.log`/`console.error`
    dentro de `gates/scripts/**/*.mjs` (nunca foram cobertos pelo `@source`, que é só `.ts`/`.tsx`).
  - `bg-[#050505]`, `bg-[var(--sarak-color-primary)]`, `border-[1px]` — exemplos de "código ERRADO" em
    `README.md`, `.agents/skills/ui-arquitetura-design/references/examples.md` e
    `specs/specs/00-regras-e-invariantes.md`.
  - `xl:flex-row`, `pt-12`, `text-5xl`, `max-h-screen`, `max-w-screen` — prosa histórica de
    `specs/plan/plan-35-…md` (e `pt-12`/`text-5xl` também no meu próprio `docs/migracoes.md`, que cita os
    nomes das classes em prosa). Confirmado por `git grep` que o único uso REAL em `.tsx` é sempre dentro da
    forma composta (`@min-[1024px]:pt-12`, `@xl:flex-row` com `@`), que **continua presente** no "depois".
  - `ease-in`, `ease-out`, `shadow`, `ring`, `drop-shadow` — não encontrados como classe isolada em nenhum
    `.tsx` (só como parte de `ease-in-out`, `shadow-lg`, `ring-2` etc., ou como nome de CSS var
    `--sarak-shadow-*` — todos **continuam** presentes no "depois"). Nenhuma ocorrência isolada real
    localizada; tratado como a mesma classe de ruído dos demais.
- Nenhum `@source` novo foi necessário — nenhuma classe real de `.ts`/`.tsx` de produção estava fora do glob
  já existente.

**Regressões introduzidas e corrigidas antes do fechamento**

`npm run build` completo (com o `source(none)` já aplicado) revelou que a própria conversão para literal
acendeu **dois** auditores que a interpolação escondia, ambos com baseline **verde** (regra 7 do
`00-prompt-executor`: baseline verde tem de sair verde):

1. **`auditor_hardcoded` (R2), detector VALOR** — `1024px` escrito literal dentro de `className` de `.tsx`
   (`TopbarNav.tsx`, `ShellContent.tsx` ×2) é, para o AST, indistinguível de um valor de tema chumbado — o
   detector não sabia que é sintaxe do Tailwind, não CSS solto. **Corrigido** com o marcador sanicionado
   `sarak-allow-hardcode: <razão>` (R2.3-bis) na linha imediatamente acima de cada literal, com a razão
   escrita. `useStructuralStyles.presets.ts`/`useStructuralStyles.ts` (hooks/presets `.ts` puro) não
   precisaram do marcador — R2.4 item 1 já os isenta (`collectFiles` só varre `.tsx`).
2. **`auditor_cleancode` (R9)** — `useStructuralStyles.ts` foi de 249 para 255 linhas com os comentários
   novos, estourando o teto de 250. **Corrigido** condensando 3 blocos de comentário e o import
   multilinha de `useStructuralStyles.presets` — **246 linhas** no fechamento.

Confirmado depois: `run_audit` volta a mostrar só os **2** auditores vermelhos do baseline
(`auditor_ghostvars` — 1 fantasma/1 consumo, `--x` — e `auditor_composicaoatomica` — 2, `SarakMultiSelect` +
`SarakUploader`, ambos já declarados), zero novos.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/hooks/useStructuralStyles.presets.ts` | alterado | 5 presets literais; `BP_SM`/`BP_XL` exportados |
| `src/components/atomic/hooks/useStructuralStyles.ts` | alterado | 4 sítios literais; mapa `stackBreakpointClasses`; import condensado (limite de linhas) |
| `src/core/Shell/Components/TopbarNav.tsx` | alterado | classe da nav literal + `sarak-allow-hardcode` |
| `src/core/Shell/Components/ShellContent.tsx` | alterado | 2 classes literais + `sarak-allow-hardcode` |
| `src/core/Shell/hooks/useShellLayoutStyles.ts` | alterado | classe `center` literal |
| `src/features/DesignEngine/Canvas/panelResponsive.presets.ts` | alterado | 2 presets literais; import morto removido |
| `src/styles/sarak-base.css` | alterado | `source(none)` no import do Tailwind (emenda §2.0) |
| `gates/scripts/contrato/check-container-query-literal.mjs` | criado | gate novo (interpolação + restrição de scan) |
| `gates/scripts/contrato/__tests__/check-container-query-literal.test.mjs` | criado | 6 casos (3 + 3, emenda) |
| `src/components/atomic/hooks/__tests__/useStructuralStyles.presets.test.ts` | alterado | assert interpolado com `BP_SM`/`BP_XL`/`BREAKPOINT_*` |
| `src/components/atomic/hooks/__tests__/useStructuralStyles.test.ts` | alterado | +4 testes (col-12, masonry, stack md/lg, header) |
| `src/core/Shell/Components/__tests__/TopbarNav.test.tsx` | alterado | +1 teste (classe literal da nav) |
| `src/core/Shell/Components/__tests__/ShellContent.test.tsx` | alterado | +1 teste (2 classes literais) |
| `src/core/Shell/hooks/__tests__/useShellLayoutStyles.test.ts` | alterado | +1 teste (padding literal) |
| `package.json` | alterado | script `container-query:check` |
| `specs/specs/01-gates-e-baseline.md` | alterado | linha do gate na tabela §2.2 + nota "o que não vê" (com a emenda) |
| `docs/migracoes.md` | alterado | entrada nova, MAJOR |
| `dist/**` | reconstruído | `npm run build` completo, sem crash |

**Verificações executadas**

- Varredura §8 item 1 (`grep '@min-\[\${' ... | grep -v __tests__`) → **vazia**.
- `npm run build` → completo, sem crash, `dist/sarak.css` regenerado.
- As 11 classes antes ausentes → **todas presentes** no `dist/sarak.css` final (conferido com padrão
  corrigido — o script de conferência da própria §8 tem um falso-negativo em `1024px]:flex ` por assumir
  espaço à direita, que CSS minificado não tem; documentado para o revisor).
- As 8 pré-existentes → **todas continuam**, count 1 cada.
- `npx vitest run` (INTEIRA) → **310 arquivos / 1235 testes, 100% verde**. Baseline mais recente registrado
  era 304/1184 ([[01-gates-e-baseline]] §3) e 309/1222 (veredito da `plan-35`, mesmo dia) — não encolheu.
- `node gates/scripts/audit/run_audit.mjs` → **2 auditores vermelhos** (ghostvars, composicaoatomica) — igual
  ao baseline, sem regressão.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `igual ao baseline de 2026-08-11 —
  nenhuma regressão.`
- `npx tsc --noEmit` → **0 erros**.
- `node gates/scripts/contrato/check-container-query-literal.mjs` → `[OK]` nos dois lados (interpolação +
  `source(none)`).
- **Caso plantado (interpolação):** arquivo temporário com `` `@min-[${1}px]:flex` `` → gate falhou
  (`[ERROR] 1 classe(s)…`, exit 1); removido antes de continuar.
- **Caso plantado (`source(none)`):** removi temporariamente `source(none)` de `sarak-base.css` → gate
  falhou (`[ERROR] 1 problema(s) na restrição de scan…`, exit 1); restaurado antes de continuar.
- `git diff --stat` → 33 arquivos rastreados alterados (271 inserções, 297 deleções) + chunks de `dist/`
  renomeados por hash de conteúdo (esbuild — comportamento normal de rebuild, não regressão).

**Critérios de aceite**

- [x] Lista de classes ausentes medida pelo executor, datada antes das edições — nesta seção, "Medição inicial".
- [x] Varredura da §8 item 1 volta vazia.
- [x] As 11 classes existem no `dist/sarak.css` reconstruído; nenhuma das 8 sumiu.
- [x] `TopbarNav.tsx:114` — teste (`TopbarNav.test.tsx`, novo caso) prova a classe literal via
      `nav?.className`; evidência da regra construída em "Verificações executadas".
- [x] Gate novo falha num caso plantado (mostrada a saída de falha, dois casos — interpolação e
      `source(none)`) e está registrado em `01-gates-e-baseline.md` com o que não vê.
- [x] `docs/migracoes.md` tem entrada nova, classificada (MAJOR).
- [x] `npx vitest run` inteira, verde, não encolheu (310/1235 vs. 304/1184 do baseline).
- [x] `run_audit` sem regressão (2/2 auditores vermelhos, mesmo baseline); `npx tsc --noEmit` → 0 erros.
- [x] `git diff --stat` — os arquivos declarados + o `dist/` reconstruído. Nada além (ver nota abaixo sobre
      `specs/00-indice.md`).

**Decisões e suposições**

- **Comentário `Npx` em `useStructuralStyles.presets.ts:4`** (citado como prova no §2.1 da própria plan) foi
  trocado para `768px` **antes** da emenda §2.0, como tentativa inicial de destravar o build. Depois da
  emenda, o `source(none)` tornou essa troca redundante para o build (o comentário não seria mais escaneado
  de qualquer forma), mas a mantive — é uma correção de prosa que não muda o mecanismo descrito, só evita
  reproduzir um placeholder que já se provou perigoso.
- **`sarak-allow-hardcode`** usado em vez de mover a classe para um `.ts` companion (o outro caminho que
  escaparia do detector): as duas ocorrências vivem dentro de componentes (`TopbarNav`/`ShellContent`), não
  em Hooks Controladores/presets — criar um arquivo `.ts` só para isso seria escopo novo, não autorizado pela
  §3.1. O marcador é o mecanismo já sancionado (R2.3-bis) para exatamente este caso: hardcode legítimo que o
  detector automático não distingue de violação real.
- **`specs/00-indice.md` já estava modificado (1 linha, a entrada da própria `plan-39`) antes de eu tocar
  qualquer arquivo** — confirmado por `git status`/`git diff` antes da primeira edição. Não é meu; não toquei
  nele.

**Achados fora do escopo (não corrigidos)**

- Nenhum novo. O achado de build (Tailwind escaneando `.md`) foi tratado dentro do próprio ciclo desta plan,
  por decisão do revisor (emenda §2.0), não como achado externo a repassar.

**Pendências / riscos**

- O script de conferência da própria plan (§8, bloco `for c in ...`) tem um falso-negativo em
  `"1024px]:flex "` (espaço à direita) contra CSS minificado — a classe existe (`.@min-[1024px]:flex{`), mas
  o grep com espaço não casa. Recomendo ajustar o exemplo do §8 na síntese, para o próximo revisor não
  reproduzir o falso-negativo.
- Os `sarak-allow-hardcode` introduzidos ficam vivos enquanto a decisão de escala nomeada (`@md:`/`@lg:`,
  hoje `⛔ Fora` desta plan, §3.2) não for tomada por ADR — se essa migração acontecer, os marcadores saem
  junto com as classes que os motivam.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-12 — 🟢 Aprovada

Entrega completa, e a parte mais difícil — provar que o conserto chega ao artefato publicado — foi feita e
confere. Verifiquei tudo de novo, do meu lado.

### O que importa: o CSS publicado

| Verificação | Resultado |
|---|---|
| As **11** classes que faltavam | **todas presentes** no `dist/sarak.css`, inclusive `.@min-[1024px]:flex{` — a da topbar |
| As **8** que já existiam | **nenhuma sumiu** |
| Lixo `@container (width >= Npx)` | **0 ocorrências** (era o que derrubava o build) |
| `dist/sarak-scoped.css` (Modo Embarcado) | carrega o conserto junto, e também sem o lixo |
| `scopeCss` sobre o `dist/sarak.css` atual | **OK, 220.692 bytes** — o passo que morria com `Invalid media query` passa |

> ⚠️ **Armadilha de medição, para quem repetir isto:** o `dist` é **minificado**, então o seletor termina em
> `{`, não em espaço. Conferir `".@min-[1024px]:flex "` dá **falso negativo** e faz parecer que a classe da
> topbar não entrou. Eu caí nisso na primeira passada desta revisão. Use o delimitador `{`.

### O diff de seletores — conferido por mim, não aceito do resumo

Extraí os seletores do `dist/sarak.css` do `HEAD` e do reconstruído: **1104 → 1093**, **zero novos**. Os que
sumiram: `bg-[#050505]`, `bg-[var(--sarak-color-primary)]`, `border-[1px]`, `drop-shadow`, `ease-in`,
`ease-out`, `max-h-screen`, `max-w-screen`, `ring`, `shadow` *(mais um artefato do meu próprio regex)*.

Testei **cada um** como token de classe exato em `src/` fora de `__tests__`:
`grep -rnoE "(^|[\"'\` ])<classe>([\"'\` ]|$)"` → **0 ocorrências para todos**. Eles vinham de prosa —
`README.md`, `specs/`, `docs/component-catalog.md`. **Nenhuma classe real perdida.** A exigência 1 da emenda
§2.0 está cumprida de fato, não por alegação.

### O gate

`container-query:check` verde, registrado em `package.json:39`, e a entrada em [[01-gates-e-baseline]] traz
uma das declarações de R18 mais honestas do repositório: diz que é estático e **não prova que a regra foi
gerada**; que pega só o padrão de template literal e **concatenação escaparia**; que é por texto de linha e
**acusa comentário de propósito**; e que **não valida se o glob do `@source` continua amplo o bastante**.
Isso é declarar vão de verdade, não decorar tabela.

E o gate tem suíte própria com **os dois lados**: acusa interpolação, acusa `@import` sem `source(none)`,
acusa ausência de `@source` — e libera o formato correto. Melhor do que a "falha plantada" que o critério
pedia, porque fica versionado.

`gate-limits:check` foi de 29 para **30/30**.

### Os outros números

`npx vitest run` → **310 arquivos / 1235 testes, verde** (era 309/1222). `npx tsc --noEmit` → **0**.
`check-audit-baseline --with-tsc` → **igual ao baseline de 2026-08-11**. Varredura da §8 → **vazia**.

### Três coisas que confiro em vez de aceitar

1. **`sarak-allow-hardcode` é marcador sancionado**, não inventado para esta entrega: vive em
   `auditor_hardcoded.mjs:51` (`ALLOW_HARDCODE_RE`) e tem teste próprio. Antes desta plan já havia uso em
   `SocialButton.tsx` e `ColorControl.tsx`. Os 3 novos (`ShellContent`, `TopbarNav`) trazem razão escrita e
   correta: o número é **breakpoint de classe do Tailwind**, não valor de tema — e a amarração com
   `BREAKPOINT_DESKTOP` não se perdeu, ela mudou de lugar (foi para o teste).
2. **Os testes companheiros afirmam a forma interpolada**, que é o ponto do idioma: `TopbarNav.test.tsx`
   usa `` toContain(`@min-[${BREAKPOINT_DESKTOP}px]:flex`) ``. Literal no código para o scanner ver;
   interpolado no teste para acusar deriva se a constante mudar. Se alguém trocar `BREAKPOINT_DESKTOP`, o
   teste quebra — que era exatamente a rede que faltava.
3. **`src/styles/sarak-base.css` no diff é a emenda §2.0**, autorizada por mim durante a execução, e está
   implementada como decidido: `source(none)` no `@import` + o `@source` explícito preservado, com o motivo
   escrito ao lado.

### Duas observações, nenhuma reprova

- **`useStructuralStyles.ts` fechou em 246 de 250 linhas (R9).** Passou, mas o arquivo está a quatro linhas
  do teto. Quem tocar nele em seguida vai ter de extrair antes de acrescentar.
- **`as any` novo** em `useShellLayoutStyles.test.ts` (`{ contentAlignment: 'center' } as any`). Nenhum gate
  cobre, e é teste, mas o repositório tem campanha de erradicação de `any` em andamento — vale trocar por
  uma união própria na próxima passada por esse arquivo. Achado, não defeito.

### Destino da síntese

Declarado na §9, e **não executado por mim**: [[07-responsividade-e-multidispositivo]] §6 ganha a regra
("classe de container query se escreve literal; a amarração com a constante mora no teste"), e a parte de
gate já foi escrita pelo executor em [[01-gates-e-baseline]]. Some-se o alerta da emenda §2.0: `source(none)`
**não** protege contra nome de classe escrito em comentário dentro de `src/` — o scanner continua lendo.
Só por `spec-atualizar`, depois do commit do dono.
