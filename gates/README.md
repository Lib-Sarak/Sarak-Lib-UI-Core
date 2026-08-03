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
| `npm run audit` | R1 R2 R3 R4 R5 R7 R8 R9 | agrega 8 auditores; os limites de cada um estão abaixo. **Sai 1 no baseline** — 2 auditores vermelhos por dívida conhecida, não por regressão |
| `npm run barrel:check` | R14 | componente em **subpasta** de categoria sem barril de categoria — só a raiz é varrida |
| `npm run zero-brand:check` | R12 | só conta `StringLiteral`, `JsxText` e parte fixa de template literal — comentário que documenta a marca não é acusado, de propósito |
| `npm run package:check` | R19 | **exige `dist/` buildado**; por isso mora no `prepublishOnly`/`gates:full` e não na cadeia do `build` |
| `npm run audit:baseline` | R20 · R30 *(contagem)* | compara **números**, não conteúdo. O `tsc` só entra com `--with-tsc`, e o pre-commit só o liga quando há `.ts`/`.tsx` no staged. **Não exige `tsc` verde** — impede subir de 14 |
| `npm run release:check` | R21 | só push para `refs/heads/main`; só `dist/` + `sarak-ui/`. **Não decide o nível do bump** — sugere, e diz que é sugestão |
| `python gates/scripts/segredo/verificar_commit.py --raiz .` | R22 | **só o staged.** Segredo já commitado passa em silêncio — histórico é escopo da skill `git-especialista-repositorio` |

## Os auditores de `npm run audit`, um a um

| Auditor | Cobra | O que ele **NÃO** vê |
| --- | --- | --- |
| `audit/auditor_hardcoded.mjs` | R2 | só `.tsx`; classe em `const` interpolada escapa do detector estrutural; `_` no lugar de espaço escapa da regex; fallback **negativo** (`var(--x, -1px)`) vira falso-positivo |
| `audit/auditor_ghostvars.mjs` | R7 | **`src/styles/` e `src/core/`** — e é lá que vivem os 2 usos do namespace proibido `--sx-*`. Varre linha a linha por regex, então **comentário conta como consumo**. O registro **não** inclui variável emitida só em runtime |
| `audit/auditor_typescript.mjs` | R3 | o **token** `any` na AST, não o compilador. `__tests__/` e `Mocks/` fora do escopo |
| `audit/auditor_coverage.mjs` | R8 | **`src/shared/`**; arquivos `index*`; e `.ts` cujo nome não começa com `use` |
| `audit/auditor_arquitetura.mjs` | R1 | `require()`/`import()` dinâmico; a checagem é por **substring**, não por resolução de módulo |
| `audit/auditor_cleancode.mjs` | R9 | isenção declarada do teto de linhas para `/presets/themes/`, `/Design/schema/` e `/Design/master-map` |
| `audit/auditor_paridade.mjs` → `verify_parity.ts` | R4 | o **tipo gerado** (`design-token-ids.ts`) não é uma das 3 fontes cruzadas — a deriva de 105 tokens mora nesse vão |
| `audit/auditor_presets.mjs` → `verify_presets.ts` | R5 | tema **do consumidor**; e mede ausência de órfã, **não completude por tema** |

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

`gates/scripts/lib/` e `gates/scripts/gerado/` **não existem ainda** — nada move para elas nesta rodada, e o
git não rastreia diretório vazio. Nascem na `plan-12`, com o primeiro arquivo.

> **`gates/scripts/segredo/config.json` viaja com o `.py`**: `verificar_commit.py:73` resolve o config como
> `Path(__file__).parent / "config.json"`. Separá-los tiraria o default do gate — mudança de comportamento.

## O que fica em `scripts/`

Geradores (`generate-*`, `componentCatalog`, `consumer-kit/`, `dev-kit/`, `build-scoped-css`, `inject-css`,
`copy-base-css`, `install-hooks`) e a **biblioteca compartilhada** `catalogAst.mjs` + `publicComponents.mjs`.

Os dois últimos são lidos por um gate **e** por três geradores. Movê-los para `gates/` inverteria a
dependência — os geradores passariam a importar de `gates/`, o que é pior que a assimetria de hoje. Ficam
declarados como **biblioteca**, não como gate.
</content>
