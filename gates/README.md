# `gates/` — o que reprova mora aqui

**Um endereço só.** Arquivo que **só reprova** vive em `gates/scripts/`; arquivo que **escreve** fica em
`scripts/`. Quem for montar o CI ([[plan-05]]) lê **esta tabela** em vez de varrer cinco diretórios.

Este README é **índice operacional**, não tratado. A regra que cada gate cobra está em
[`specs/specs/00-regras-e-invariantes.md`](../specs/specs/00-regras-e-invariantes.md); o baseline de cada um,
em [`specs/specs/01-gates-e-baseline.md`](../specs/specs/01-gates-e-baseline.md); **quando** cada um roda, em
[`specs/specs/02-enforcement-por-commit.md`](../specs/specs/02-enforcement-por-commit.md). Duplicar aquilo aqui
seria a violação de R17 que este repositório mais persegue.

## A terceira coluna é a mais importante

**"O que NÃO vê" é requisito de R18**, não cortesia. Um gate cujo escopo é menor que o da regra fica **verde
com a regra violada** — já aconteceu três vezes aqui, e todas as três foram descobertas por acaso. Ampliar o
escopo de um gate sem atualizar esta coluna é regressão.

# Os gates

| Comando | Cobra | O que ele **NÃO** vê |
| --- | --- | --- |
| `npm run audit` | R1 R2 R3 R4 R5 R7 R8 R9 R17 R23 R32 | agrega 10 auditores (2 novos na `plan-12`); os limites de cada um estão abaixo |
| `npm run barrel:check` | R14 | componente em **subpasta** de categoria sem barril de categoria — só a raiz é varrida |
| `npm run zero-brand:check` | R12 | só conta `StringLiteral`, `JsxText` e parte fixa de template literal — comentário que documenta a marca não é acusado, de propósito |
| `npm run package:check` | R19 | **exige `dist/` buildado**; por isso mora no `prepublishOnly`/`gates:full` e não na cadeia do `build` |
| `npm run deep-import:check` *(plan-12)* | R27 | só confere o campo `exports`; não confere se o barril cobre tudo que o consumidor precisa (isso é R14) |
| `npm run token-types:check` *(plan-12)* | R4 · R29 | compara byte a byte o artefato gerado com a fonte; não confere se `MASTER_DESIGN_MAP` em si está correto (isso é R4/`auditor_paridade`) |
| `npm run build-info:check` *(plan-12)* | R29 | não confere `baseCommit` contra o HEAD (por construção é sempre o commit anterior) nem `builtAt`; exige `dist/` buildado |
| `npm run plan-index:check` *(plan-12)* | vão 12 | só a §1 (Fila) do índice; não confere a §4 (Histórico) nem a ordem/dependência |
| `npm run section-pointers:check` *(plan-12)* | R23 · R17 | só AUTORREFERÊNCIA (`§N.N` dentro do próprio arquivo) — `§N.N` com qualificador de outro documento é ignorado nesta versão, não validado |
| `npm run gate-limits:check` *(plan-12)* | R18 | só confere que existe um marcador reconhecível — não que o texto declarado seja verdadeiro ou completo |
| `npm run coverage:check` *(plan-12)* | R8.1 | piso móvel sobre UM número agregado (`lines.pct`); depende de `coverage/coverage-summary.json` já gerado (`vitest run --coverage`) |
| `npm run audit:baseline` | R20 · R30 *(produção hard-block + teste em contagem)* | compara **números**, não conteúdo. O `tsc` só entra com `--with-tsc`. **`tsc.producao` é SEMPRE hard-block, fora do baseline** (plan-12) — `tsc.teste` continua tolerado como antes |
| `npm run release:check` | R21 | só push para `refs/heads/main`; só `dist/` + `sarak-ui/`. **Não decide o nível do bump** — sugere, e diz que é sugestão |
| `python gates/scripts/segredo/verificar_commit.py --raiz .` | R22 | **só o staged.** Segredo já commitado passa em silêncio — histórico é escopo da skill `git-especialista-repositorio` |

## Os auditores de `npm run audit`, um a um

| Auditor | Cobra | O que ele **NÃO** vê |
| --- | --- | --- |
| `audit/auditor_hardcoded.mjs` | R2 | só `.tsx`; agora inclui `src/core/` (**plan-12**, vão 5); classe em `const` interpolada escapa do detector estrutural; `_` no lugar de espaço escapa da regex; fallback **negativo** (`var(--x, -1px)`) vira falso-positivo |
| `audit/auditor_ghostvars.mjs` | R7 | ampliado na **plan-12** (vãos 2 e 3) para `src/styles/` (também como consumidora) e `src/core/`. Ainda varre linha a linha por regex, mas comentário de bloco/linha é **removido antes** de contar (conserto da plan-12) — o que resta é literal de exemplo dentro de STRING de código real (não comentário), classe residual aceita e declarada |
| `audit/auditor_typescript.mjs` | R3 | o **token** `any` na AST, não o compilador. `__tests__/` e `Mocks/` fora do escopo |
| `audit/auditor_coverage.mjs` | R8 | ampliado na **plan-12** (vão 6) para `src/shared/`, `src/effects/`, `src/constants/`. Ainda ignora arquivos `index*` e `.ts` cujo nome não começa com `use` |
| `audit/auditor_arquitetura.mjs` | R1 | `require()`/`import()` dinâmico; a checagem é por **substring**, não por resolução de módulo |
| `audit/auditor_cleancode.mjs` | R9 | isenção declarada do teto de linhas para `/presets/themes/`, `/Design/schema/` e `/Design/master-map` |
| `audit/auditor_paridade.mjs` → `verify_parity.ts` | R4 | o **tipo gerado** (`design-token-ids.ts`) não é uma das 3 fontes cruzadas — R29/`token-types:check` (plan-12) cobre esse vão pelo outro lado |
| `audit/auditor_presets.mjs` → `verify_presets.ts` | R5 | tema **do consumidor**; e mede ausência de órfã, **não completude por tema** |
| `audit/auditor_authcoupling.mjs` *(plan-12, R32)* | R32 | só sinks de credencial (`localStorage`/`sessionStorage`/cookie/`Authorization`) e rota embutida que **começa com `/`** — não proíbe `fetch`/`axios` em geral (templates de dados são agnósticos por design) |
| `audit/auditor_sectionpointers.mjs` → `contrato/check-section-pointers.mjs` *(plan-12)* | R23 · R17 | wrapper fino (nome `auditor_*` exigido por `buildDevState.mjs`); a lógica real e os limites estão em `check-section-pointers.mjs` — só autorreferência, ver linha própria acima |

## Gates que NÃO moram aqui, e por quê

| Gate | Onde | Motivo |
| --- | --- | --- |
| `catalog:check` · `guide:check` · `dev-kit:check` | `scripts/generate-*.mjs` | São **um arquivo só** que gera **e** confere (`--check`). Partir em dois criaria duas fontes da verdade do mesmo formato. Cobram R17 · R23 · R29 |
| `npx vitest run` | `src/**/__tests__/` | R8 exige teste **ao lado** do código. Movê-los violaria a regra que eles cobram. A suíte é gate: bloqueia no Anel 3 do `pre-push`, e cobre R6 · R13 · R24 · R25 · R26 |
| `pre-commit` · `pre-push` | `.githooks/` | São o **gatilho**, não o gate. Eles chamam `gates/scripts/…` |

## A árvore

```
gates/
  README.md              # este arquivo
  baselines/             # audit-baseline.json — o piso versionado do Anel 2
  allowlists/            # barrelExclusions.mjs — exclusão só com motivo escrito
  scripts/
    audit/               # run_audit + 8 auditores + os 3 verify_*
    contrato/            # barril, zero-marca, empacotamento
    release/             # tag por artefato, baseline de auditoria
    segredo/             # verificar_commit.py + o config.json dos padrões
```

Cada pasta de `gates/scripts/*/` tem um `__tests__/` com o teste do PRÓPRIO gate (um caso que ele pega, um
que libera — regra da `plan-12`, §5). `audit/__tests__/helpers/runGateFixture.mjs` roda um gate contra uma
árvore de arquivos plantada num diretório temporário isolado, sem tocar o repositório real.

`gates/scripts/lib/` e `gates/scripts/gerado/` **não existem ainda** — nada move para elas nesta rodada, e o
git não rastreia diretório vazio.

> **`gates/scripts/segredo/config.json` viaja com o `.py`**: `verificar_commit.py:73` resolve o config como
> `Path(__file__).parent / "config.json"`. Separá-los tiraria o default do gate — mudança de comportamento.

## O que fica em `scripts/`

Geradores (`generate-*`, `componentCatalog`, `consumer-kit/`, `dev-kit/`, `build-scoped-css`, `inject-css`,
`copy-base-css`, `install-hooks`) e a **biblioteca compartilhada** `catalogAst.mjs` + `publicComponents.mjs`.

Os dois últimos são lidos por um gate **e** por três geradores. Movê-los para `gates/` inverteria a
dependência — os geradores passariam a importar de `gates/`, o que é pior que a assimetria de hoje. Ficam
declarados como **biblioteca**, não como gate.
</content>
