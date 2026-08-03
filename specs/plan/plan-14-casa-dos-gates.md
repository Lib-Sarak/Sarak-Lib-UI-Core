---
tipo: "plan"
titulo: "A casa dos gates — um endereço só para o que reprova, e o legado sai junto"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "🔴 A executar"
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
  `02-enforcement-por-commit`, `14-artefatos-do-mantenedor`.
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
- ⛔ `src/` — com **uma** exceção: nenhuma. A remoção do `SarakSecurityOrchestrator` é da `plan-09`.

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
    lib/                 # helpers de AST, publicComponents, deadPointers
    audit/               # run_audit + os 8 auditores       → R1 R2 R3 R4 R5 R7 R8 R9
    contrato/            # barril, zero-marca, empacotamento → R12 R14 R19
    gerado/              # artefato × fonte                  → R17 R29
    release/             # tag por artefato, baseline        → R20 R21
    segredo/             # verificar_commit.py               → R22
```

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

**Os dois anéis (`pre-commit`, `pre-push`) ficam em `.githooks/`** — são o **gatilho**, não o gate. Eles passam
a chamar `gates/scripts/…`.

**`generate_theme_template.ts` fica na skill `ui-criar-tema`** — é gerador, escreve arquivo em `src/`, e é
invocado por decisão humana. É a distinção que a plan-02 fixou.

## 5.3 A limpeza do legado

Para **cada** arquivo restante em `scripts/`, uma das três respostas, com evidência:

- **gate** → move (§5.2);
- **gerador/utilitário vivo** → fica, e o resumo aponta quem o invoca (`package.json`, hook, outro script);
- **morto** → sai, com a prova: `grep` em todo o repositório versionado devolvendo **só** a própria definição.

> ⚠️ **`grep` antes de deletar, sempre.** Sete arquivos são *candidatos* a morto — `fix_hardcoded.mjs`,
> `replace_ghosts.mjs`, `generate_orphan_tests.mjs`, `find-def.mjs`, `find-usages.mjs`, `find-spacing.mjs`,
> `extract-spacing.mjs`. **Candidato não é sentença.** Ferramenta de campanha antiga pode ser a única
> documentação executável de como uma migração foi feita: se a dúvida existir, **pergunte ao dono** em vez de
> apagar.

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

---

# 12. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
