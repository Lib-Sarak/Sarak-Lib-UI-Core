---
tipo: "spec"
titulo: "Enforcement por commit — os anéis de validação e o hook versionado"
dominio: "Sarak-Lib-UI-Core / Automação / Git"
status: "🟢 Implementado"
prioridade: "Máxima"
tags: ["spec", "enforcement", "git-hook", "pre-commit", "gates", "baseline"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[05-build-e-distribuicao]]"]
---

# 1. Visão geral

Existiam **12+ verificações que só rodavam se alguém lembrasse.** O `pre-commit` instalado fazia duas coisas — varrer segredos e regenerar o índice de agentes — e **não havia CI** (`.github/` não existe). Um commit podia quebrar o barril, introduzir hardcode e desalinhar o catálogo sem nenhuma luz vermelha até alguém rodar a auditoria à mão, dias depois.

Decisão do dono: **todo commit passa por um pipeline de validação.**

Esta spec descreve o pipeline, as decisões de desenho com a justificativa de cada uma, e o que **não** foi automatizado — e por quê.

## 1.1 O que já existia e foi preservado

`git config core.hooksPath` já apontava para `.githooks/` e `.git/hooks/` está vazio: **o hook versionado é o que roda.** O gate de segredos (`verificar_commit.py`, com o catálogo de padrões de `config.json`) continua sendo a **primeira** coisa a rodar e continua bloqueando. Nada nele foi alterado.

# 2. O desenho — quatro anéis por custo e por consequência

| Anel | Quando | Consequência | Custo medido |
| --- | --- | --- | --- |
| **0 — Segurança** | Todo commit, sem exceção | **BLOQUEIA** | < 1 s |
| **1 — Contrato** | Commit que toca código/artefato | **BLOQUEIA** no vermelho | ~2,9 s |
| **2 — Auditoria** | Commit que toca código/artefato | **BLOQUEIA só em REGRESSÃO** | ~7 s (+ ~11 s se tocar `.ts`/`.tsx`) |
| **3 — Pesado** | **Manual** (§4) | Responsabilidade de quem entrega | ~3 min |

**Custo total de um commit de código:** ~10 s sem TypeScript, ~20 s com. Um commit de documentação custa **~0,6 s** (§3).

## 2.1 Anel 0 — Segurança (inalterado)

Varre o **staged** por segredos e arquivos sensíveis. Verde é a única saída aceitável, e não há escopo nem baseline: segredo é segredo.

Roda também o auto-indexador (`.agents/gerar_indice.py` + `git add .agents/index.md`), que já existia.

## 2.2 Anel 1 — Os gates de contrato

Os quatro gates que estão **verdes hoje e devem continuar verdes para sempre**:

| Gate | Regra que cobra |
| --- | --- |
| `check-barrel-parity.mjs --check` | R14 — Barril completo |
| `generate-component-catalog.mjs --check` | R17 — Não transcrever fonte viva |
| `check-zero-brand.mjs --check` | R12 — A lib nunca estampa a própria marca |
| `generate-consumer-kit.mjs --check` | R17 — Não transcrever fonte viva |

**Verde é a única saída aceitável.** Não há baseline aqui porque não há dívida: qualquer vermelho é regressão introduzida agora.

> **Por que o hook chama `node scripts/…` direto e não `npm run …`:** medido — `npm run` custa ~1,3 s por gate contra ~0,65 s da invocação direta. Nos quatro, a diferença é **5,9 s → 2,9 s por commit**. A mensagem de erro segue citando o comando `npm run` equivalente, que é o que a pessoa vai digitar para investigar.

## 2.3 Anel 2 — Auditoria contra baseline versionado

`run_audit.mjs` tem baseline **não-zero** ([[01-gates-e-baseline]] §3). Um gate binário sobre ele bloquearia todo commit; ignorá-lo deixaria a dívida crescer em silêncio. A saída é comparar contra um baseline **versionado em arquivo**:

**Arquivo:** `.githooks/audit-baseline.json` — mora ao lado do hook, viaja no repositório, aparece no diff.

**Formato:** uma entrada por auditor, com as métricas que importam para ele.

```json
{
    "medidoEm": "2026-07-28",
    "metricas": {
        "auditor_hardcoded.mjs": { "valor": 1, "estruturalLiquido": 0 },
        "auditor_ghostvars.mjs": { "consumos": 3 },
        "auditor_typescript.mjs": { "violacoes": 0 }
    },
    "tsc": { "erros": 14 }
}
```

**A regra de comparação, métrica a métrica:**

| Situação | Resultado |
| --- | --- |
| **Pior** que o baseline | ⛔ **BLOQUEIA** — é regressão |
| **Igual** ao baseline | ✅ Passa, com a linha de confirmação |
| **Melhor** que o baseline | ✅ Passa, e **AVISA** que o baseline precisa ser atualizado, com o comando |

> **O baseline nunca se atualiza sozinho.** Quem consertou a dívida roda `npm run audit:baseline -- --write` e commita o arquivo **junto do conserto**. Baseline que se auto-ajusta não cobra nada — e, pior, apagaria a evidência de uma regressão travestida de melhora.

### 2.3.1 Duas decisões de robustez do orquestrador

**A lista de auditores é LIDA de `run_audit.mjs`.** `scripts/check-audit-baseline.mjs` extrai o array `const scripts = [...]` do próprio agregador em vez de manter uma cópia. Auditor novo lá é auditor novo aqui, sem ninguém lembrar de sincronizar. Auditor sem parser conhecido cai num parser genérico que só olha o código de saída — degrada, não ignora.

**Métrica ilegível é bloqueio, não silêncio.** Se a saída de um auditor mudar de formato e o número não puder ser lido, o resultado é `null` e o commit é **bloqueado** com "não consegui ler a saída do auditor". Fail-closed: um parser quebrado nunca vira aprovação automática.

## 2.4 A decisão sobre `tsc --noEmit`

**Decisão: entra no Anel 2, com baseline de contagem, e SÓ quando o commit toca `.ts`/`.tsx`.**

O porquê, com os números:

- **A favor de incluir:** `tsc` é o único gate que enxerga os **4 erros de tipo em produção** ([[01-gates-e-baseline]] §4.4). O fato de existirem é a prova de que ninguém estava olhando. E, ao contrário da suíte, ele é **determinístico** — não depende do estado da máquina.
- **A favor de restringir:** custa **~11 s**, quase dobrando o commit. Pagar isso num commit que só mexe em JSON ou markdown é imposto sem contrapartida.
- **Por que baseline e não verde:** há 14 erros hoje. Exigir zero bloquearia tudo; ignorar deixaria o número subir.

Resultado prático: commit em TypeScript custa ~20 s e não pode aumentar a contagem de erros de tipo. Qualquer outro commit não paga.

# 3. Escopo por staged — quem não mexeu, não paga

O hook lê `git diff --cached --name-only --diff-filter=ACMR` e decide:

| Condição | Efeito |
| --- | --- |
| Staged toca `src/`, `scripts/`, `docs/`, `sarak-ui/`, `bin/`, `package.json` ou `.githooks/` | Anéis 1 e 2 **rodam** |
| Staged não toca nada disso (spec, README, `.claude/`, `.agents/`…) | Anéis 1 e 2 **PULADOS**, com a linha explicando |
| Staged contém pelo menos um `.ts`/`.tsx` | `tsc` **entra** no Anel 2 |

**Por que `docs/` e `sarak-ui/` entram na lista mesmo sendo "documentação":** os dois são **artefatos gerados**. `catalog:check` e `guide:check` comparam o commitado com o que o gerador produz agora — editar um deles à mão é exatamente o defeito que R17 existe para pegar.

**Medido:** commit só de markdown = **609 ms**; o mesmo commit tocando código = **10.042 ms**.

# 4. Anel 3 — a decisão de deixá-lo MANUAL

**Decisão: o Anel 3 NÃO vira `pre-push` nesta entrega. Fica manual, atrás de um comando único.**

```
npm run gates:full     # npm run build && npm run package:check && npx vitest run
```

Três razões, todas concretas:

1. **A suíte tem uma falha dependente do ambiente.** [[01-gates-e-baseline]] §3.1 documenta que `bin/scaffold/__tests__/packageManager.test.mjs` falha nesta máquina por causa de um `package-lock.json` no diretório do usuário — nada a ver com o repositório. Um `pre-push` bloqueante hoje **impediria todo push** por um motivo alheio à mudança. Gate vermelho no dia da instalação é gate que ensina todo mundo a usar `--no-verify`, e aí não sobra gate nenhum.
2. **`npm run build` MUTA a árvore de trabalho.** Ele regenera `dist/` e `dist/BUILD_INFO.json`. Um hook que reescreve arquivos versionados no meio de um push é armadilha: o push sai com uma árvore diferente da que foi validada.
3. **`package:check` depende de (2).** Ele roda `npm pack --dry-run` e exige `dist/` buildado — não é executável isoladamente num hook.

**Caminho de promoção, para quando isso mudar:** consertada a fragilidade da §3.1, promover a suíte a `pre-push` bloqueante é criar `.githooks/pre-push` com uma chamada a `npx vitest run` e acrescentar `'pre-push'` a `HOOK_FILES` em `scripts/install-hooks.mjs`. O `build` e o `package:check` devem continuar **fora** de hook pelo motivo (2).

# 5. Requisitos de mensagem

## 5.1 Ao bloquear: acionável, sempre

Toda mensagem de bloqueio diz **qual regra**, **qual arquivo** e **qual comando** roda para ver o detalhe. Exemplo real, capturado na prova 2:

```
[barrel:check] Componentes consumidor-facing NÃO exportados em src/index.ts:
  - SarakFlex  (exporte, ou declare em barrelExclusions.mjs com motivo)

⛔ COMMIT BLOQUEADO — Anel 1: paridade do barril público
   Regra violada : R14 — Barril completo (specs/specs/00-regras-e-invariantes.md)
   Veja o detalhe: npm run barrel:check
```

Mensagem genérica ("gate falhou") é falha de entrega, não economia de linha.

## 5.2 Ao passar: confirmação positiva

O dono pediu **"confirma regra aplicada"**, não só "acusa violação". Cada anel imprime a sua linha:

```
[Sarak] Anel 0 OK — nenhum segredo no staged.
[Sarak] Anel 1 OK — barril, catálogo, zero-marca e kit em dia.
[Sarak] Anel 2 OK — auditoria no baseline (sem regressão).
[Sarak] Commit liberado. Anel 3 (suíte, build, package) NÃO roda aqui — rode: npm run gates:full
```

Quando um anel é pulado, a linha diz **que foi pulado e por quê** — silêncio seria indistinguível de "passou".

# 6. Instalação

```
npm run hooks:install
```

`scripts/install-hooks.mjs` é **idempotente**: garante `core.hooksPath = .githooks` e o bit de execução do hook, e só escreve quando o valor está diferente.

Duas decisões dentro dele:

- **`core.hooksPath` passa a ser relativo (`.githooks`), não absoluto.** O valor encontrado nesta máquina era o caminho absoluto do repositório — funciona, mas não sobrevive a um clone em outro caminho.
- **`git update-index --chmod=+x` só é chamado quando o modo ainda não é `100755`.** Esse comando **escreve no índice**: rodar o instalador antes de um commit qualquer plantaria uma mudança de modo no staged sem ninguém pedir. Quando ele precisa agir, avisa em voz alta que o staged foi tocado. *(Descoberto na primeira execução das provas — a prova 4 rodou os anéis que deveria ter pulado, justamente porque o instalador tinha deixado `.githooks/pre-commit` no staged.)*

> **Por que NÃO existe um script `prepare`.** Seria a forma automática de instalar no clone — mas o npm também executa `prepare` quando o pacote é instalado **como dependência git**, que é exatamente o modo de distribuição desta lib ([[007-distribuicao-por-git]]). O consumidor rodaria `git config` no repositório dele. A instalação é manual **de propósito**, e está documentada aqui e no README de quem clona.

> **Por que não husky/lint-staged.** O repositório já tem `core.hooksPath` versionado, que é mais simples, é auditável no diff e **não coloca `node_modules` no caminho crítico do commit**. Nenhuma dependência nova foi adicionada.

# 7. O escape — `--no-verify`

`git commit --no-verify` pula todos os hooks e **não há como impedir isso** (é do git, não do repositório).

O uso é **excepcional**: commit de emergência, ou salvar trabalho em andamento numa branch pessoal. O que se espera de quem usa:

1. Rodar os anéis à mão depois (`node scripts/check-audit-baseline.mjs --with-tsc` e os quatro gates).
2. Consertar antes do merge.

Não é uma porta dos fundos — é uma saída de incêndio. Quem a usa e não volta está transferindo o próprio problema para o repositório.

# 8. Compatibilidade

O hook é **POSIX `sh`** e roda em Git Bash no Windows. Nada de PowerShell dentro dele. As únicas dependências externas são `python` (já exigido pelo Anel 0) e `node` (já exigido pelo projeto).

# 9. Opção em aberto — CI (decisão do dono, NÃO tomada)

**`.github/` não existe e nenhum CI foi criado nesta entrega.**

O que um CI acrescentaria, se o dono quiser:

| Ganho | Detalhe |
| --- | --- |
| Rodar o **Anel 3 em PR** | A suíte, o build e o `package:check` rodariam num ambiente limpo, sem custar tempo de commit — resolve exatamente o motivo (1) da §4 |
| Ambiente **determinístico** | A falha da §3.1 não aconteceria: o `$HOME` de um runner limpo não tem lockfile solto |
| Cobrar quem usou `--no-verify` | O escape da §7 deixa de ser invisível |
| Rodar o **Playwright** | Hoje `test-ct` e os `__e2e__` estão fora de toda automação ([[01-gates-e-baseline]] §2.6) |

**Custo:** um workflow a manter, e minutos de runner. **Não implementado** — a decisão é do dono.

# 10. Critérios de aceite

- [x] Anel 0 preservado, sem alteração no `verificar_commit.py` nem no `config.json`.
- [x] Anel 1 bloqueia no vermelho, com os quatro gates.
- [x] Anel 2 bloqueia **só** em regressão contra `.githooks/audit-baseline.json`, versionado.
- [x] `tsc` decidido, justificado e implementado (Anel 2, condicionado a `.ts`/`.tsx`).
- [x] Escopo por staged implementado com `git diff --cached --name-only` e documentado.
- [x] Mensagem de bloqueio cita regra, arquivo e comando.
- [x] Confirmação positiva por anel, incluindo a de "pulado".
- [x] Instalação idempotente (`npm run hooks:install`).
- [x] Nenhum auditor ou script de check existente foi alterado — só orquestrados.
- [x] Nenhuma dependência nova.
- [x] Anel 3 decidido (manual) **com justificativa escrita** e caminho de promoção.
- [x] CI **não** criado; registrado como opção em aberto (§9).

# 11. Plano de testes (Quality Gate) — as 5 provas, executadas

Todas foram executadas invocando `sh .githooks/pre-commit` com o índice preparado, **sem criar commit** (o repositório não tem autorização de commit). É o mesmo caminho de código que o git executa.

| # | Prova | Resultado |
| --- | --- | --- |
| 1 | Commit limpo tocando código **passa**, com confirmação de cada anel | ✅ exit 0, **10.042 ms** |
| 2 | Commit que quebra o barril (`SarakFlex` comentado em `src/index.ts:63`) é **BLOQUEADO** | ✅ exit 1, Anel 1, mensagem citando R14 + arquivo + comando. **Quebra revertida** |
| 3 | Commit que piora o `run_audit` (`p-4` em `SarakFlex.tsx:53`) é **BLOQUEADO** | ✅ exit 1, Anel 2: `auditor_hardcoded.mjs.estruturalLiquido: 0 -> 1`. **Quebra revertida** |
| 4 | Commit só de markdown **não paga** os gates de UI | ✅ exit 0, **609 ms**, com a linha "Anéis 1 e 2 PULADOS" |
| 5 | Gate de segredos **não regrediu** | ✅ exit 1 no Anel 0, chave mascarada `AKIA...LE`, arquivo de prova removido |

Verificado ao fim: `git status` sem resíduo das provas e índice vazio.
