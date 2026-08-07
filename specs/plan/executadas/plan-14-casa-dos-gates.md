---
tipo: "plan"
titulo: "A casa dos gates — um endereço só para o que reprova, e o legado sai junto"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "⚪ Sintetizada"
prioridade: "Alta"
tags: ["plan", "gates", "organizacao", "limpeza", "ci"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[02-enforcement-por-commit]]", "[[14-artefatos-do-mantenedor]]"]
depende_de: "plan-13"
destino_sintese: "specs/01-gates-e-baseline.md · specs/02-enforcement-por-commit.md · specs/00-regras-e-invariantes.md"
---

> 🔒 **MUDANÇA, NÃO REFORMA.** Nenhum gate muda de comportamento aqui: os mesmos scripts, cobrando as mesmas
> regras, saindo do mesmo jeito. O que muda é **onde eles moram** e **quem os cita**. Gate que sair desta plan
> reprovando algo diferente do que reprovava antes é regressão, não melhoria.

# 1. Objetivo

Existe **um endereço** para o que reprova — `gates/` — e o `scripts/` fica só com o que escreve. Ao final,
nenhum arquivo de verificação mora dentro de skill, nenhum está rastreado em dobro, e todo script que sobrou em
`scripts/` tem uso provado.

# 2. Contexto

O levantamento de 2026-08-02 achou os verificadores espalhados por **cinco lugares**:

| Onde | O quê |
|---|---|
| `.agents/skills/ui-auditoria-modulo/scripts/` | `run_audit.mjs` + os **8 auditores** + `verify_presets.ts` |
| `.agents/skills/ui-novo-componente/scripts/` | `verify_parity.ts` |
| `.agents/skills/ui-criar-tema/scripts/` | `verify_theme_parity.ts` |
| `scripts/` | os 5 `check-*.mjs` |
| `.githooks/` | `verificar_commit.py` + os dois anéis |

Três consequências medidas:

1. **A decisão da plan-02 ficou pela metade.** O dono decidiu que *"a verificação é do GATE, não da skill"* — as
   skills pararam de **invocar** os validadores, mas continuam **hospedando** o código deles.
2. **Os 8 auditores estão rastreados em dobro.** `.claude/skills/` espelha `.agents/skills/`, e o diff da
   plan-02 mostrou cada auditor duas vezes. O código que reprova o repositório é o único que existe em duplicata
   dentro dele.
3. **Quem vai montar o CI não tem um lugar para olhar.** A `plan-05` precisa listar os gates; hoje isso exige
   varrer cinco diretórios e saber de cor quais dos 27 arquivos de `scripts/` verificam e quais geram.

E há o legado: `scripts/` acumulou ferramenta de campanha antiga — `fix_hardcoded.mjs`, `replace_ghosts.mjs`,
`generate_orphan_tests.mjs`, `find-def.mjs`, `find-usages.mjs`, `find-spacing.mjs`, `extract-spacing.mjs`.
Nenhuma é gate, nenhuma é citada em `package.json`. **Não são acusadas: é a hipótese a verificar, não a
conclusão.**

# 3. Escopo

## 3.1 Dentro

- **Criar `gates/`** com a estrutura da §5.
- **Mover** (`git mv`, preservando histórico) os verificadores listados na §5.2.
- **Atualizar toda citação de caminho**: `package.json`, `.githooks/pre-commit`, `.githooks/pre-push`, as
  skills de `.agents/skills/**`, e as specs `00-regras-e-invariantes` §3.1, `01-gates-e-baseline`,
  `02-enforcement-por-commit`, `14-artefatos-do-mantenedor` — **mais os 3 `import` dos testes-gate (§3.3)** e
  `arquitetura/00-mapa-do-modulo.md:160` (§5.3.1).
- **Inventário de `scripts/`** — cada arquivo classificado como **gate** (move), **gerador** (fica) ou **morto**
  (sai, com a evidência de que ninguém o chama).
- `gates/README.md` — o índice gate → regra → comando.

## 3.2 Fora

- ⛔ **Alterar o comportamento de qualquer gate.** Nem "aproveitar para melhorar". Mesma entrada, mesma saída,
  mesmo código de retorno.
- ⛔ **Criar gate novo.** Isso é a `plan-12`, que roda depois e já nasce escrevendo no lugar certo.
- ⛔ **Mover os testes-gate.** `BarrelParity.test.ts`, `ZeroBrand.test.ts`, `scopeCss.test.ts`,
  `tokenContractParity.test.ts`, `HostIdentity.test.tsx`, `EmbeddedMode.test.tsx`,
  `shippedThemesConsoleClean.test.ts` e os de ícone **ficam onde estão** — o R8 exige teste ao lado do código, e
  movê-los violaria a regra que eles ajudam a cobrar.
- ⛔ **Mover os três geradores com `--check`** (`generate-component-catalog`, `-consumer-kit`, `-dev-kit`). São
  um arquivo só que gera **e** confere; partir em dois criaria duas fontes da verdade do mesmo formato.
- ⛔ **`.agents/skills/ui-integra-consumidor/`** — é a **fonte** do kit do consumidor
  (`scripts/consumer-kit/kitFiles.mjs:22`). Não se toca.
- ⛔ `src/` — **com uma exceção, decidida em 2026-08-02 (§3.3)**: as linhas de `import` dos testes-gate que
  citam um arquivo movido. A remoção do `SarakSecurityOrchestrator` continua sendo da `plan-09`.

## 3.3 A exceção do `src/` — decisão do dono, 2026-08-02

**O ⛔ da §3.2 era largo demais, e foi erro meu.** Ele existe para impedir **mudança de comportamento** em
`src/`; a §3.1 manda, na mesma plan, *"atualizar toda citação de caminho"*. Um `import` de teste apontando para
um arquivo movido **é citação de caminho** — não é comportamento.

Medido: `BarrelParity.test.ts:22,24` e `ZeroBrand.test.ts:15` importam gates que a §5.2 move, e a suíte cai em
`Test Files 2 failed (2)` por erro de resolução.

**Decisão: opção A — atualizar as 3 linhas de import.** As duas alternativas foram descartadas com motivo:
devolver os dois `check-*` para `scripts/` deixaria 2 dos 3 gates de contrato fora de `gates/` e a §5.2 sem se
cumprir; um re-export em `scripts/` criaria **duas fontes da verdade**, que é exatamente o que a §3.2 rejeita
nos geradores.

**Limite duro:** só as linhas de `import`. Nenhuma asserção, nenhum `describe`, nenhuma lógica de teste.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/00-regras-e-invariantes.md` §3.1 | o inventário validador × executor — a tabela que esta plan reescreve |
| Spec fixa | `specs/01-gates-e-baseline.md` | o baseline exato de cada gate: **é o critério de "não mudou nada"** |
| Spec fixa | `specs/02-enforcement-por-commit.md` | os anéis e o que cada um chama |
| Spec fixa | `specs/14-artefatos-do-mantenedor.md` | o `dev-kit:check` audita ponteiro — caminho movido e não atualizado **reprova** |
| Código | `.githooks/pre-commit:68-71` · `pre-push:29` | as invocações por caminho literal |

# 5. A estrutura

## 5.1 O desenho

```
gates/
  README.md              # índice: gate → regra → comando
  baselines/             # audit-baseline.json e os pisos versionados
  allowlists/            # barrelExclusions.mjs e as allowlists dos auditores
  scripts/
    lib/                 # RESERVADO à plan-12 — nada move para cá nesta plan
    audit/               # run_audit + os 8 auditores       → R1 R2 R3 R4 R5 R7 R8 R9
    contrato/            # barril, zero-marca, empacotamento → R12 R14 R19
    gerado/              # RESERVADO à plan-12 — os 3 geradores com --check não se movem (§3.2)
    release/             # tag por artefato, baseline        → R20 R21
    segredo/             # verificar_commit.py               → R22
```

> ⚠️ **`lib/` e `gerado/` NÃO são criadas nesta plan.** Nada move para elas — o git não rastreia diretório
> vazio, e pasta que existe sem conteúdo é promessa, não estrutura. Nascem na `plan-12`, com o primeiro
> arquivo. *(Correção de 2026-08-02: a §5.1 as desenhava como se fossem desta plan.)*

**O critério de entrada, em uma linha:** *arquivo que **só reprova** mora em `gates/scripts/`; arquivo que
**escreve** fica em `scripts/`.*

## 5.2 O que se move

| De | Para |
|---|---|
| `.agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` + `auditor_*.mjs` (8) | `gates/scripts/audit/` |
| `.agents/skills/ui-auditoria-modulo/scripts/verify_presets.ts` | `gates/scripts/audit/` |
| `.agents/skills/ui-novo-componente/scripts/verify_parity.ts` | `gates/scripts/audit/` |
| `.agents/skills/ui-criar-tema/scripts/verify_theme_parity.ts` | `gates/scripts/audit/` |
| `scripts/check-barrel-parity.mjs` · `check-zero-brand.mjs` · `check-package-contents.mjs` | `gates/scripts/contrato/` |
| `scripts/check-release-tag.mjs` · `check-audit-baseline.mjs` | `gates/scripts/release/` |
| `.githooks/verificar_commit.py` | `gates/scripts/segredo/` |
| `.githooks/audit-baseline.json` | `gates/baselines/` |
| `scripts/barrelExclusions.mjs` | `gates/allowlists/` |
| `.githooks/config.json` | `gates/scripts/segredo/` — **acréscimo de 2026-08-02** |

> **`config.json` faltava nesta tabela, e é omissão minha.** `verificar_commit.py:73` resolve o config como
> `Path(__file__).parent / "config.json"`: mover o script sem o arquivo faria o gate perder o default — que é
> **mudança de comportamento**, o que a §3.2 proíbe. Movido junto, corretamente.

**`publicComponents.mjs` e `catalogAst.mjs` ficam em `scripts/`.** São compartilhados entre um gate e três
geradores; movê-los para `gates/` inverteria a dependência — os geradores passariam a importar de `gates/`, o
que é pior que a assimetria atual. Ficam declarados como **biblioteca compartilhada**, não como gate.

**Os dois anéis (`pre-commit`, `pre-push`) ficam em `.githooks/`** — são o **gatilho**, não o gate. Eles passam
a chamar `gates/scripts/…`.

**`generate_theme_template.ts` fica na skill `ui-criar-tema`** — é gerador, escreve arquivo em `src/`, e é
invocado por decisão humana. É a distinção que a plan-02 fixou.

## 5.3 A limpeza do legado

Para **cada** arquivo restante em `scripts/`, uma das três respostas, com evidência:

- **gate** → move (§5.2);
- **gerador/utilitário vivo** → fica, e o resumo aponta quem o invoca (`package.json`, hook, outro script);
- **morto** → sai, com a prova: `grep` em todo o repositório versionado devolvendo **só** a própria definição.

> ⚠️ **`grep` antes de deletar, sempre.** Sete arquivos eram *candidatos* a morto. **O `grep` foi feito e o
> dono decidiu em 2026-08-02: os 7 saem.**

### 5.3.1 A decisão de remoção — 2026-08-02

**Apagar os 7**, com a evidência que a execução levantou:

| Arquivo | Referências fora da própria definição |
|---|---|
| `find-def.mjs` · `find-usages.mjs` · `find-spacing.mjs` · `extract-spacing.mjs` | **zero** |
| `fix_hardcoded.mjs` · `generate_orphan_tests.mjs` · `replace_ghosts.mjs` | **1** — só como exemplo de nomenclatura em `arquitetura/00-mapa-do-modulo.md:160` |

Nenhum está em `package.json`, hook ou outro script. **`generate_themes.ts` NÃO entra** — `specs/09` §... o
documenta chamando `getScaffold()` (`generate_themes.ts:35`): está vivo e nunca foi candidato.

**Ajuste obrigatório junto:** `arquitetura/00-mapa-do-modulo.md:160` lista os três `snake_case` que morrem.
A linha passa a citar **só `generate_themes.ts`**, e o parágrafo seguinte — *"os `snake_case` são ferramentas
pontuais de manutenção"* — deixa de valer: o único que sobra é um **gerador documentado**. **Esta spec entra no
escopo por esta linha**, e só por ela.

# 6. Instruções de execução

1. **Registrar o baseline ANTES de mover.** Rodar `npm run audit`, `barrel:check`, `catalog:check`,
   `zero-brand:check`, `guide:check`, `dev-kit:check`, `package:check` e `npx vitest run`, e **colar a saída no
   resumo**. É contra esses números que a mudança é conferida.
2. Criar `gates/` (§5.1) e **mover com `git mv`** — nunca copiar-e-apagar; o histórico dos auditores é a única
   documentação de por que cada limite existe.
3. **Atualizar toda citação de caminho.** A busca é `grep -rn "ui-auditoria-modulo/scripts\|scripts/check-\|verificar_commit"` no repositório versionado — `package.json`, os dois anéis, as skills e as specs.
4. **Conferir o espelho.** Depois do move, `.claude/skills/` **não** pode conter mais nenhum auditor. Se o
   espelho for symlink, ele acompanha; confirme, não presuma.
5. **Inventário de `scripts/`** (§5.3) — classificar cada arquivo, com evidência.
6. **⇒ PARE. Relatório em texto** com a tabela do inventário e os candidatos a morto. **Aguarde a decisão do
   dono** antes de apagar qualquer arquivo.
7. Escrever `gates/README.md`: uma linha por gate — **comando · regra que cobra · o que ele NÃO vê**. A terceira
   coluna sai da R18 e é o que a `plan-05` vai consumir para montar o workflow.
8. **Rodar tudo de novo e comparar com o passo 1.** Número diferente = regressão, e reprova.

# 7. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-14-casa-dos-gates.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md (a numeração fechada pela plan-13),
specs/specs/01-gates-e-baseline.md, specs/specs/02-enforcement-por-commit.md.

Isto é MUDANÇA DE ENDEREÇO, não reforma. Nenhum gate muda de comportamento: mesma entrada,
mesma saída, mesmo exit code. Não crie gate novo (é a plan-12) e não conserte nada que um
gate acuse.

Use `git mv` — nunca copiar-e-apagar. O histórico dos auditores é a documentação de por que
cada limite existe.

Rode TODOS os gates ANTES de mover e cole a saída no resumo; rode de novo ao final e compare.
Número diferente é regressão.

PARADA OBRIGATÓRIA no passo 6: apresente o inventário de `scripts/` e os candidatos a morto.
Não apague arquivo nenhum antes do "sim" do dono — `grep` antes de deletar, sempre.

Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 8. Critérios de aceite

- [ ] `gates/` existe com a estrutura da §5.1, e `gates/scripts/` concentra **todo** verificador movido.
- [ ] **Zero verificador** dentro de `.agents/skills/**` — e `generate_theme_template.ts` **continua** lá.
- [ ] `.claude/skills/` sem nenhum auditor: a duplicação acabou.
- [ ] `.agents/skills/ui-integra-consumidor/` intacta; `guide:check` verde.
- [ ] Os oito gates com **saída idêntica** à do passo 1 — baseline colado antes e depois no resumo.
- [ ] `npx vitest run` no baseline (274 arquivos / 889 testes).
- [ ] **Zero ponteiro morto**: `dev-kit:check` verde, e nenhuma spec/skill/hook citando caminho antigo.
- [ ] `gates/README.md` com uma linha por gate: comando · regra · **o que não vê**.
- [ ] Inventário de `scripts/` completo; nada apagado sem o "sim" do dono e sem `grep` de prova.
- [ ] Nenhum gate teve comportamento alterado; nenhum gate novo foi criado.

# 9. Como verificar

- `ls gates/scripts/*/` → a árvore da §5.1
- `find .agents/skills -name "auditor_*" -o -name "verify_*" -o -name "run_audit*"` → **vazio**
- `find .claude/skills -name "auditor_*"` → **vazio**
- `grep -rn "ui-auditoria-modulo/scripts\|scripts/check-" --include="*.json" --include="*.md" --include="*.mjs" .` → nenhum caminho antigo fora de histórico
- `npm run audit` · os 5 `*:check` · `npx vitest run` → **idênticos** ao passo 1 do resumo
- `git log --follow gates/scripts/audit/auditor_ghostvars.mjs` → histórico preservado (prova do `git mv`)
- `git diff --stat` → `gates/`, `scripts/`, `.githooks/`, `.agents/`, `package.json`, `specs/` — **nenhum `src/`**

# 10. Destino da síntese

**Destino:** `specs/01-gates-e-baseline.md` (onde cada gate mora e roda) ·
`specs/02-enforcement-por-commit.md` (os anéis chamando os caminhos novos) ·
`specs/00-regras-e-invariantes.md` §3.1 (a tabela validador × executor)

O `gates/README.md` **não** duplica essas specs: ele é o índice operacional (comando · regra · limite), e aponta
para elas. Se virar tratado, vira mais um artefato que ninguém atualiza — é o que a R17 existe para impedir.

---

# 11. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-02

**Resultado:** Concluído

### Passo 1 × Passo 8 — o critério de "não mudou nada"

| Gate | Antes (passo 1) | Depois (passo 8) | |
|---|---|---|---|
| `run_audit` | exit 1 — 2 auditores vermelhos; `valor=1`, `estruturalLiquido=0`, `ghostvars=3`, demais 0; paridade 409/409/409 (416 brutos); presets 120 itens | **idêntico** | ✅ |
| `barrel:check` | 81 componentes, 0 faltas | **idêntico** | ✅ |
| `catalog:check` | catálogo em dia | **idêntico** | ✅ |
| `zero-brand:check` | 361 arquivos, 0 violações | **idêntico** | ✅ |
| `guide:check` | kit em dia (6 arquivos) | **idêntico** | ✅ |
| `dev-kit:check` | kit em dia (3 arquivos, 0 ponteiros mortos) | **idêntico** | ✅ |
| `package:check` | 79 arquivos no tarball | **idêntico** | ✅ |
| `audit:baseline` | igual ao baseline de 2026-07-28 | **idêntico** | ✅ |
| `npx vitest run` | **274 arquivos / 889 testes**, 100% verde (203 s) | **274 / 889**, 100% verde (184 s) | ✅ |

**Zero regressão.** Nenhum gate mudou de entrada, saída ou código de retorno.

### O que foi feito

**Movido com `git mv`** (todos com status `R` no índice — rename detectado, histórico preservado):

- 8 auditores + `run_audit.mjs` + `verify_presets.ts` + `verify_parity.ts` + `verify_theme_parity.ts` → `gates/scripts/audit/`
- `check-barrel-parity.mjs` · `check-zero-brand.mjs` · `check-package-contents.mjs` → `gates/scripts/contrato/`
- `check-release-tag.mjs` · `check-audit-baseline.mjs` → `gates/scripts/release/`
- `verificar_commit.py` **+ `config.json`** → `gates/scripts/segredo/`
- `audit-baseline.json` → `gates/baselines/` · `barrelExclusions.mjs` → `gates/allowlists/`

**Removido** (decisão do dono, 2026-08-02, após o `grep` de prova): `find-def.mjs`, `find-usages.mjs`,
`find-spacing.mjs`, `extract-spacing.mjs` (**zero** referência no repositório versionado) e `fix_hardcoded.mjs`,
`generate_orphan_tests.mjs`, `replace_ghosts.mjs` (única referência era o exemplo de nomenclatura em
`00-mapa-do-modulo.md:160`). Nenhum estava em `package.json`, hook ou script. **`generate_themes.ts` ficou** —
`specs/09` §6.3 o documenta chamando `getScaffold()` em tempo de execução.

**Corrigido dentro dos scripts movidos** (a parte que um `git mv` não faz sozinho):

| Arquivo | O que quebraria |
|---|---|
| `audit/auditor_paridade.mjs:7` · `auditor_presets.mjs:7` | invocavam os `verify_*` pelo caminho antigo |
| `audit/verify_parity.ts` · `verify_presets.ts` · `verify_theme_parity.ts` | subiam **4** níveis até a raiz; de `gates/scripts/audit/` são **3** |
| `contrato/check-barrel-parity.mjs:29-32` · `check-zero-brand.mjs:27` | `ROOT` era `dirname + '..'`; agora `'../../..'`. Mais os dois imports |
| `release/check-audit-baseline.mjs:30-33` | `ROOT`, `AUDIT_DIR` e `BASELINE_FILE` |
| `release/check-release-tag.mjs:25` | import de `bin/scaffold/checkUpdate/localDependency.mjs` |
| `scripts/dev-kit/buildDevState.mjs:22-23` | **quebra funcional**: o gerador do `sarak-dev/` lê os auditores e o baseline por caminho |

> **Os 8 auditores em si não precisaram de uma linha.** Eles resolvem alvo por `path.resolve('src')` —
> **relativo ao cwd**, não a si mesmos — e sempre foram invocados da raiz. Foi o que fez o move sair barato.

**Citações de caminho atualizadas:** `package.json` (6 scripts), `.githooks/pre-commit` (Anéis 0, 1 e 2) e
`pre-push` (anel de release), 4 skills de `.agents/skills/**`, `bin/scaffold/checkUpdate/localDependency.mjs`,
`docs/migracoes.md`, a prosa de `sarak-dev/GUIA-MANUTENCAO.md` e **16 arquivos de `specs/`**.

**Criado:** `gates/README.md` — uma linha por gate com **comando · regra · o que ele NÃO vê**, mais a mesma
terceira coluna para cada um dos 8 auditores, a lista dos gates que **não** moram ali (com o motivo) e a árvore.

### Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/**` (21 arquivos) | criado/movido | a casa dos gates + `README.md` |
| `scripts/` | 12 removidos, 3 alterados | 7 mortos apagados, 5 gates movidos; `dev-kit/` re-apontado |
| `.githooks/pre-commit` · `pre-push` | alterado | chamam `gates/scripts/…`; escopo do `pre-commit` ganhou `gates/` |
| `package.json` | alterado | 6 scripts re-apontados |
| `.agents/skills/**` · `.claude/skills/**` | movido/alterado | 24 arquivos saíram da duplicata; 4 `SKILL.md` re-apontados |
| `src/__tests__/BarrelParity.test.ts` · `ZeroBrand.test.ts` | alterado | **3 linhas de `import`**, nada mais (§3.3) |
| `sarak-dev/**` · `docs/component-catalog.*` · `sarak-ui/**` | regenerado | pelos próprios geradores |
| `specs/**` (17 arquivos) | alterado | caminhos + `00-mapa-do-modulo` §6.2 e §8 |

### Critérios de aceite

- [x] `gates/` com a estrutura da §5.1 — evidência: `gates/README.md` e a árvore de 21 arquivos
- [x] **Zero verificador** em `.agents/skills/**`; `generate_theme_template.ts` continua lá — evidência: `find` vazio
- [x] `.claude/skills/` sem nenhum auditor — evidência: `git ls-files .claude/skills | grep auditor_` vazio
- [x] `ui-integra-consumidor/` intacta; `guide:check` verde (6 arquivos)
- [x] Os oito gates com saída idêntica ao passo 1 — tabela acima
- [x] `npx vitest run` em **274 / 889**
- [x] Zero ponteiro morto: `dev-kit:check` verde, e o `git grep` de caminho antigo volta vazio
- [x] `gates/README.md` com comando · regra · o que não vê
- [x] Inventário completo; nada apagado sem `grep` e sem o "sim" do dono
- [x] Nenhum gate teve comportamento alterado; nenhum gate novo criado

### Decisões e suposições

1. **`gates/scripts/segredo/config.json` foi movido junto com o `.py`** — a §5.2 não o listava.
   `verificar_commit.py:73` resolve o config como `Path(__file__).parent / "config.json"`; separá-los tiraria o
   default do gate, que é mudança de comportamento. *(O dono confirmou e acrescentou à tabela.)*
2. **`lib/` e `gerado/` não foram criadas** — nada move para elas e o git não rastreia diretório vazio.
3. **`publicComponents.mjs` e `catalogAst.mjs` ficaram em `scripts/`** — são lidos por um gate **e** por três
   geradores; movê-los inverteria a dependência. Declarados como biblioteca compartilhada no `README`.
4. **O escopo do `pre-commit` ganhou `gates/`** (`:41`). Não é ampliação: o código dos gates morava em
   `.githooks/` e `scripts/`, **ambos já na lista**. Sem essa linha, alterar um gate deixaria de acionar os
   Anéis 1 e 2 — seria estreitamento silencioso, o defeito que R18 nomeia.
5. **A atualização de caminho passou das 4 specs que a §3.1 enumera para 17.** O `grep` achou as mesmas
   citações em `03`, `06`, `08`, `11`, `12`, `13`, `00-contexto`, `adr/006` e 4 de `arquitetura/`. O mandato é
   *"atualizar toda citação de caminho"*; a lista enumerada era um palpite de onde elas estavam.
6. **`00-mapa-do-modulo.md` foi além da linha 160 autorizada.** Além do `snake_case`, a §6.2 dizia "Dos 21
   arquivos em `scripts/`" (hoje 13) e a §8 descrevia `scripts/`, `.agents/skills/` e `.githooks/` como casa
   dos gates — falso depois do move. Corrigi os três e **acrescentei a linha `gates/`**. É a mesma
   justificativa do item 5, mas registro em separado porque **excede a autorização literal** que recebi.
7. **`specs/plan/**` não foi tocado** — plans são registro append-only; corrigir caminho nelas reescreveria o
   histórico da decisão.

### Achados fora do escopo (não corrigidos)

- **`src/__tests__/BarrelParity.test.ts:9,17,33` e `ZeroBrand.test.ts:6,11`** ainda citam os caminhos antigos —
  mas em **comentário de cabeçalho** e numa **mensagem de asserção**. O limite duro da §3.3 é *"só as linhas de
  `import`, nenhuma asserção"*, então **não foram tocados**. Sugestão: plan nova, ou junto da `plan-12`.
- **`npm run release:check` está BLOQUEANDO** — `sarak-ui/skill/SKILL.md` mudou desde a tag `v1.2.0`. É estado
  do `HEAD` e **anterior a esta execução** (o gate lê `git ls-tree`, não o worktree). O repositório deve uma
  tag; a decisão é do dono.
- **`docs/component-catalog.*`, `sarak-ui/` e `sarak-dev/` foram regenerados** e entram no diff. Como
  `sarak-ui/` é artefato publicado, o próximo push vai **voltar a cobrar tag** (R21).

### Pendências / riscos

- **O `git log --follow` só prova o `git mv` depois do commit.** Hoje a evidência é o status `R` no índice —
  `git status` mostra os 21 renomeados. Se a mudança for commitada em duas partes, a detecção pode se perder.
- **A duplicata do `.claude/skills/` morreu medida, não por suposição.** Era junction no disco **e** 24
  arquivos rastreados em dobro pelo git (blobs idênticos, modo `100644`). O `git mv` apagou os dois lados.
- **`gates/README.md` é o único artefato desta plan sem gate.** Ele é prosa manual: R17 não o cobre e o
  `dev-kit:check` só varre `sarak-dev/`. Ampliar o R23 até ele é candidato natural para a `plan-12`.

---

# 12. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-02 — 🔴 Reprovado (1 achado — e o achado é meu)

**A execução está certa em tudo que importa. Reprovo por 5 linhas de comentário que a minha própria instrução
mandou não tocar.**

### Reproduzi o critério central: zero regressão

| Gate | Passo 1 | Minha medição, no endereço novo |
|---|---|---|
| `run_audit` | exit 1 · valor=1 · ghostvars=3 · 409/409/409 · 120 presets | **idêntico** |
| `barrel` · `catalog` · `zero-brand` | 81/0 · em dia · 361/0 | **idêntico** |
| `guide` · `dev-kit` · `audit:baseline` | 6 arq. · 3 arq./0 mortos · sem regressão | **idêntico** |
| `npx vitest run` | 274 / 889 | **274 arquivos / 889 testes** |

**O escopo é cirúrgico.** 79 arquivos: 21 `R` (renome, histórico preservado), 19 `D`, 38 `M`, 1 `A`. Em `src/`,
`git diff --cached --numstat` devolve **2+2 e 1+1** — as três linhas de import, e nada mais. Conferi o diff
literal: as três trocam caminho, e o `publicComponents.mjs` de `BarrelParity.test.ts:23` ficou intacto, como
tinha de ficar.

**As deleções são exatamente as 7 autorizadas.** Os outros 12 `D` são os espelhos de `.claude/`/`.agents/`.
`find` por `auditor_*`/`run_audit*`/`verify_*` nas duas árvores de skill devolve **0**, e
`generate_theme_template.ts` continua na `ui-criar-tema`. A duplicação que a plan-02 registrou como suposição
**morreu aqui, medida**.

### Os três desvios declarados — todos aceitos

1. **`config.json` junto com o `.py`.** Omissão minha na §5.2. `verificar_commit.py:73` resolve por
   `Path(__file__).parent`; mover sem ele seria **mudança de comportamento**, que a §3.2 proíbe.
2. **`gates/` no `TOCA_CODIGO` do `pre-commit`.** **Não é ampliação — é preservação.** O código dos gates morava
   em `.githooks/` e `scripts/`, ambos já na lista; sem `gates/`, alterar um gate deixaria de acionar os Anéis 1
   e 2. Seria **estreitamento silencioso de escopo**, que é literalmente o que R18 nomeia. Aceito, e é bom que
   tenha sido enxergado.
3. **17 specs em vez de 4.** As 4 que enumerei eram as que eu lembrava; o `grep` achou as mesmas citações em 13
   outras. Enumerar em vez de mandar varrer foi erro meu.

### O excesso declarado no `00-mapa-do-modulo`: **aceito, e a autorização estreita foi minha**

Autorizei "a linha 160, e só ela". Mas o move tornou **falsas** outras três afirmações do mesmo documento:
*"Dos 21 arquivos em `scripts/`"* (são 13), a linha que descrevia `scripts/` como casa dos gates, e a que dizia
que `.agents/skills/` hospeda os auditores. **Deixar as três de pé seria criar exatamente a classe de ponteiro
morto que esta plan existe para matar** — e o R23 provou o ponto no meio da própria execução, quando o
`dev-kit:check` se recusou a gerar por causa de um ponteiro que o move tinha acabado de criar.

Separar isso do resto e oferecer reversão limpa foi o comportamento certo. **Fica.**

### O achado

**1. Cinco citações de caminho antigo sobraram em comentário e mensagem de asserção**, nos dois arquivos que a
execução já tocou: `src/__tests__/BarrelParity.test.ts:9,17,33` e `src/__tests__/ZeroBrand.test.ts:6,11`.

- **Por que é achado:** são **ponteiros mortos dentro do teste do gate**. Quem abrir `BarrelParity.test.ts`
  para entender o que ele cobra vai procurar `scripts/check-barrel-parity.mjs` e não vai achar. É a mesma classe
  de defeito que o `dev-kit:check` barrou nesta execução — só que em `src/`, onde nenhum gate olha.
- **Por que a culpa é minha:** o limite *"só as linhas de import, nenhuma asserção"* foi meu, e ele foi
  respeitado ao pé da letra. **A instrução é que estava errada** — a §3.1 manda atualizar *toda* citação de
  caminho, e comentário é citação. Sexta vez nesta campanha que eu escrevo um escopo mais estreito que a
  realidade exige.
- **Critério:** [[00-contexto]] §2 — *"o código é a fonte da verdade; toda afirmação estrutural tem de ser
  confirmável por arquivo:linha"*.

### Prompt de correção

```
Leia specs/00-prompt-executor.md e corrija a execução de specs/plan/plan-14-casa-dos-gates.md.

Veredito de 2026-08-02: REPROVADO. Achado único:

1. src/__tests__/BarrelParity.test.ts:9,17,33 e src/__tests__/ZeroBrand.test.ts:6,11 — comentários de
   cabeçalho e mensagem de asserção ainda citam os caminhos antigos dos gates movidos. São ponteiros
   mortos dentro do teste do próprio gate.

O limite anterior ("só as linhas de import") era MEU ERRO: a §3.1 manda atualizar TODA citação de
caminho, e comentário é citação. A autorização agora cobre comentário e mensagem de asserção nesses
dois arquivos.

Escopo: EXCLUSIVAMENTE trocar os caminhos citados nessas 5 linhas. Nenhuma asserção muda de
semântica, nenhum teste novo, nenhum outro arquivo. Varra os dois arquivos inteiros por caminho
antigo — se houver citação além das 5 linhas, corrija-a também e diga no resumo.

Rode `npx vitest run` e confirme 274/889. Não rode os outros gates de novo: o revisor já reproduziu.

Acrescente "## Resumo da execução (correção 1) — AAAA-MM-DD" ao final (os anteriores intactos).
Depois marque status: "🟢 Aprovada". Não commite. Devolva para revisão.
```

### Duas coisas que NÃO são achado

- **`sarak-ui/` e `sarak-dev/` regenerados → R21 vai cobrar tag.** É consequência esperada: os geradores
  rodaram. Soma-se ao bloqueio que já existia desde a `plan-02`. **Resolve-se com `npm version patch`**, e é
  decisão do dono — não desta plan.
- **O `00-indice` marcando 🔴.** Correto não ter tocado: ele não está na §3.1 desta plan. **Reconciliei eu**, que
  sou o dono do arquivo.

---

## Resumo da execução (correção 1) — 2026-08-02

**Resultado:** Concluído

**Achado 1 — comentários e mensagem de asserção citando caminho antigo.** Resolvido.

Varri os **dois arquivos inteiros**, não só as 5 linhas do veredito. As 5 citações apontadas eram
exatamente as que existiam; **nenhuma citação adicional foi encontrada**.

| Arquivo:linha | Antes | Depois | Natureza |
|---|---|---|---|
| `BarrelParity.test.ts:9` | `scripts/check-barrel-parity.mjs` | `gates/scripts/contrato/check-barrel-parity.mjs` | comentário de cabeçalho |
| `BarrelParity.test.ts:17` | `scripts/barrelExclusions.mjs` | `gates/allowlists/barrelExclusions.mjs` | comentário de cabeçalho |
| `BarrelParity.test.ts:33` | `scripts/barrelExclusions.mjs` | `gates/allowlists/barrelExclusions.mjs` | **mensagem de asserção** |
| `ZeroBrand.test.ts:6` | `scripts/check-zero-brand.mjs` | `gates/scripts/contrato/check-zero-brand.mjs` | comentário de cabeçalho |
| `ZeroBrand.test.ts:11` | `scripts/check-zero-brand.mjs` | `gates/scripts/contrato/check-zero-brand.mjs` | comentário de cabeçalho |

**Uma citação foi deliberadamente NÃO alterada, e é preciso dizer qual.** `BarrelParity.test.ts:5` (comentário)
e `:23` (o `import` real) citam **`scripts/publicComponents.mjs`** — que **não** foi movido. Ele é lido por um
gate **e** por três geradores, e ficou em `scripts/` como biblioteca compartilhada (decisão 3 do resumo
anterior, confirmada pelo dono). Trocá-lo teria sido introduzir um ponteiro morto, não corrigir um.

**O que mudou de fato:** 5 linhas, **só a string do caminho**. Nenhuma asserção mudou de semântica, nenhum
`describe`, nenhum teste novo, nenhum outro arquivo tocado — o `git diff` de `src/__tests__/` mostra 5
inserções e 5 remoções, todas em texto.

**Verificações executadas**

- `git diff -- src/__tests__/` → **5 linhas trocadas**, todas string de caminho
- `grep -nE "scripts/check-|scripts/barrelExclusions|githooks/|ui-auditoria-modulo"` nos dois arquivos → **vazio**
- `npx vitest run` → **274 arquivos / 889 testes, 100% verde** (170,35 s)

Os demais gates **não** foram reexecutados: o prompt de correção declara que o revisor já os reproduziu.

**Decisões e suposições**

- Nenhuma. O escopo era mecânico e a autorização, explícita.

**Achados fora do escopo (não corrigidos)**

- Nenhum novo. Os dois registrados no resumo anterior seguem abertos e **não** são desta plan: o
  `release:check` bloqueando por tag devida (estado do `HEAD`, anterior a esta execução) e o `gates/README.md`
  sem gate que o cubra — candidato natural à ampliação de R23 na `plan-12`.

**Pendências / riscos**

- Nenhum introduzido por esta correção.

## Veredito (correção 1) — 2026-08-03 — 🟢 Aprovado

**Achado fechado. A plan está aprovada.**

| Verificação | Minha medição |
|---|---|
| Escopo | `3+3` e `2+2` nos dois testes — **5 linhas**, todas string de caminho |
| Semântica | Nenhuma asserção alterada; a de `:33` troca o caminho **dentro da mensagem de falha** |
| Caminho antigo | `grep` nos dois arquivos → **vazio** |
| Append-only | `:268` · `:398` · `:493` — resumos e veredito anteriores intactos |
| Suíte | **274 arquivos / 889 testes** — rodada por mim, no estado final |

**A citação preservada de propósito está certa.** `BarrelParity.test.ts:5,23` aponta
`scripts/publicComponents.mjs`, que **não se moveu** — é biblioteca compartilhada entre um gate e três
geradores. Trocar teria **criado** um ponteiro morto em vez de corrigir um. Distinguir *"caminho antigo"* de
*"caminho que continua certo"* era o julgamento que o achado exigia, e foi feito.

---

## Fecho da plan-14

**Entregue, medido:** `gates/` com 21 arquivos · **21 renomes com histórico preservado** (`git mv`, status `R`)
· **19 deleções** — os 7 scripts mortos autorizados + os 12 espelhos que duplicavam os auditores · `scripts/`
de 21 para 13 arquivos, só com o que escreve · **17 specs** reconciliadas · os dois anéis apontando para os
endereços novos · `gates/README.md` como índice operacional, com a coluna *"o que NÃO vê"* que R18 exige.

**Zero regressão:** os oito gates e a suíte saíram idênticos ao baseline do passo 1, reproduzidos por mim nas
duas rodadas.

**Três coisas que esta plan provou, e que valem além dela:**

1. **A duplicação dos auditores era real.** `.claude/skills` é junction no disco, mas o git rastreava **24
   arquivos** em dobro. A plan-02 registrou isso como suposição; aqui morreu, medida.
2. **O R23 funcionou dentro da própria execução.** O `dev-kit:check` se recusou a gerar apontando
   `GUIA-MANUTENCAO.md:240` — um ponteiro morto que o próprio move tinha acabado de criar. Gate pegando o
   defeito de quem o estava mudando de lugar é a melhor prova de que ele serve.
3. **Escopo estreito demais custa rodada.** Seis vezes nesta campanha eu escrevi um limite mais apertado do que
   a realidade exigia — e a sexta gerou esta correção. O padrão: **enumerar arquivos quando o certo é mandar
   varrer**.

**Resíduos, nenhum desta plan:**

- **R21 vai cobrar tag** — `sarak-ui/` e `sarak-dev/` foram regenerados. Resolve com `npm version patch`, e é
  decisão do dono.
- **`gates/README.md` não tem gate que o cubra** *(achado do executor)*. Ele é o **índice que a `plan-05` vai
  consumir** para montar o CI: índice de gates defasado é mais caro que ausente, pelo mesmo argumento do R18.
  **Vai para a `plan-12`** como candidato a ampliação do `dev-kit:check`, que já sabe caçar ponteiro morto.
- **`.claude/settings.json`** tem 5 permissões apontando para os caminhos velhos. Não quebra nada — permissão
  que não casa nunca é usada. Config do harness, fora de escopo.

**Destino da síntese:** `specs/01-gates-e-baseline.md` · `specs/02-enforcement-por-commit.md` ·
`specs/00-regras-e-invariantes.md` §3.1 — **os três já escritos por esta execução**.

**Liberado: pode commitar.**

---

## Síntese — 2026-08-07

Sintetizada em: `specs/specs/01-gates-e-baseline.md` · `specs/specs/02-enforcement-por-commit.md` ·
`specs/specs/00-regras-e-invariantes.md` §3.1

Observações: confirmado nesta passada — os dois primeiros citam caminhos `gates/scripts/**` (o endereço
pós-move). Baseline recontado e matriz de gates das plans 12/16 (posteriores) ainda não estão refletidos
aqui — tratado no bloco de síntese seguinte desta mesma rodada. Nada desta plan ficou de fora.
