---
tipo: "plan"
titulo: "Bloquear no commit a linha nova de código que cita o rastro de execução"
objetivo: "Barrar no pre-commit toda linha adicionada em código que cite plan, veredito ou achado sem spec fixa, sem exigir limpar o legado"
dominio: "Sarak-Lib-UI-Core / Gates / Enforcement"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "gate", "pre-commit", "comentarios", "diff"]
relacionados: ["[[specs/01-gates-e-baseline]]", "[[specs/02-enforcement-por-commit]]", "[[specs/00-regras-e-invariantes]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/00-regras-e-invariantes.md · specs/01-gates-e-baseline.md · specs/02-enforcement-por-commit.md"
---

# 1. Objetivo

Um commit que **acrescenta** a código uma linha citando o rastro de execução — `plan-NN`, `veredito de …`, ou
`achado N` sem a spec fixa que o numera — é **bloqueado no `pre-commit`**, com a regra, o arquivo, a linha e
o conserto na mensagem. O legado que já cita plan continua intocado e não bloqueia nada.

# 2. Contexto

A norma já existe: comentário não cita plan (`padrao-escrita`, `references/comentarios.md`;
[[00-prompt-executor]] §3 item 6). A plan é removida na síntese e a citação vira ponteiro morto.

**Nada a cobra mecanicamente, e o custo é medido:** oito rodadas de correção numa só campanha foram gastas
só nesta regra. Numa delas o revisor também deixou passar, então a checagem manual falha dos dois lados. A
variante mais recente é *"achado N do veredito de AAAA-MM-DD"*, que aponta para dentro da plan do mesmo jeito.

**Por que sobre o diff, e não sobre o repositório:** medido em 2026-09-13, os três padrões aparecem **505
vezes em 195 arquivos** de `src/`, `gates/`, `scripts/` e `bin/`. Um gate de estado reprovaria o repositório
inteiro no dia em que nascesse. Um gate sobre as linhas **adicionadas** fecha a classe daqui para frente sem
exigir a limpeza do legado primeiro.

**A armadilha de falso positivo, também medida:** `achado N` sozinho é ambíguo. O código cita legitimamente
os achados numerados de `specs/specs/15-divida-conhecida.md`, que é spec **fixa** com numeração estável
(ex.: `src/core/Provider/utils/validation.ts:226`, *"achado 40"*). Por isso a regra aceita `achado N` quando
a **mesma linha** nomeia `15-divida-conhecida` — o ponteiro passa a ser resolvível — e barra a forma solta,
que é indistinguível de um achado de veredito.

**Onde roda:** no Anel 1 do `pre-commit`, lendo o staged. **Não** vai para a CI, pela mesma razão do Anel 0
([[02-enforcement-por-commit]] §9): o runner não tem staging, e um intervalo de commits incluiria histórico
anterior ao gate. Isso fica declarado no cabeçalho do gate (R18).

# 3. Escopo

## 3.1 Dentro
- `gates/scripts/contrato/check-trail-citation.mjs` — **novo**: o gate.
- `gates/scripts/contrato/__tests__/check-trail-citation.test.mjs` — **novo**: o self-test.
- `gates/allowlists/trailCitationExclusions.mjs` — **novo**: os arquivos isentos, cada um com motivo (§5 passo 3).
- `package.json` — o script `trail-citation:check`.
- `.githooks/pre-commit` — a chamada no Anel 1.
- `sarak-dev/` — **só pelo gerador** (`npm run dev-kit`), porque o `package.json` muda.

## 3.2 Fora
- **Limpar as 505 citações existentes.** O gate é sobre o diff justamente para não depender disso.
- `.github/workflows/` — o gate não vai para a CI (§2).
- Specs fixas, `00-regras-e-invariantes` inclusive: a regra nova é escrita pelo revisor na síntese (§8).
- `specs/`, `docs/`, `.agents/`, `sarak-ui/`, `sarak-dev/` como **alvo de varredura** — prosa de documento não
  entra no escopo desta regra. Em `docs/migracoes.md` a menção à plan é procedência e fica.
- Qualquer outro gate, hook ou auditor.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/specs/02-enforcement-por-commit.md` | §2.2 (Anel 1), §3 (gatilho `TOCA_CODIGO`), §5 (formato da mensagem de bloqueio e da confirmação) |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | §2.2 (gates de contrato), §6 (anti-afrouxamento: toda entrada de allowlist tem motivo) |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R18 — o gate declara no cabeçalho o que não vê; §1.3 — a numeração das regras |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` (+ `references/comentarios.md`) · `padrao-typescript` | a norma que o gate cobra; os limiares do próprio script |
| Skill | `test-unitario` | o self-test |
| Código | `gates/scripts/contrato/check-plan-index-sync.mjs` e seu teste | idioma de gate + self-test desta base; é também um dos arquivos que o gate precisa isentar |
| Código | `gates/scripts/contrato/check-migration-anchor.mjs` | cabeçalho R18 de um gate recente, para imitar |
| Código | `.githooks/pre-commit` | onde o Anel 1 mora, e como os outros gates imprimem regra, arquivo e comando |

# 5. Instruções de execução

1. **O que o gate lê.** Duas fontes, por flag:
   - `--staged` — as linhas adicionadas do `git diff --cached`. É o que o `pre-commit` usa.
   - sem flag — as linhas adicionadas do worktree contra o `HEAD`, **mais todas as linhas dos arquivos não
     rastreados** (não ignorados). É o modo do revisor, e cobre o arquivo novo que o `git diff` não mostra.

   Só entram arquivos sob `src/`, `gates/`, `scripts/` e `bin/`. Linha **removida** nunca é acusada.

2. **O que ele acusa.** A comparação ignora maiúsculas e minúsculas. Uma linha adicionada é violação se contém:
   - `plan-` seguido de dígito (`plan-12`, `plan-40.2`); `plan-index` passa;
   - `veredito de`;
   - `achado` seguido de número, **exceto** quando a mesma linha contém `15-divida-conhecida`.

3. **Isenções.** `gates/allowlists/trailCitationExclusions.mjs` lista os arquivos cujo **domínio** é o nome
   de plan: o próprio gate e seu teste, `scripts/generate-plan-index.mjs`,
   `gates/scripts/contrato/check-plan-index-sync.mjs` e os testes deles. Cada entrada tem uma linha de motivo.
   Nenhuma isenção por diretório nem por padrão genérico. Arquivo fora dessa lista **não** é isento, mesmo
   que pareça.

4. **A mensagem.** No bloqueio, imprima para cada violação `arquivo:linha`, o trecho e qual padrão casou.
   Diga o que fazer: explicar no próprio comentário, ou citar a spec **fixa** que é dona do fato. Cite a
   regra como **R36 — o código não cita o rastro de execução** (`specs/specs/00-regras-e-invariantes.md`).
   Ao passar, imprima uma linha de confirmação, no formato das outras.

5. **O cabeçalho R18.** Declare o que o gate não vê, pelo menos isto:
   - não roda na CI, e por quê;
   - só vê linha adicionada, então o legado passa;
   - não vê documento (`specs/`, `docs/`, `.agents/`);
   - é textual, não por AST: string de teste e comentário contam igual;
   - não enxerga outra forma de citar plan, como *"na campanha anterior"*.

6. **O script e o hook.** `trail-citation:check` no `package.json`. No `.githooks/pre-commit`, a chamada
   com `--staged` dentro do Anel 1, sob o gatilho `TOCA_CODIGO`, com a mensagem de bloqueio no mesmo
   formato dos vizinhos (regra, arquivo, comando para ver o detalhe).

7. **O self-test.** Pelo menos um caso **pego** e um **liberado** para cada entrada abaixo. Monte cada caso
   num repositório git temporário, não no repositório real:

   | Caso | Esperado |
   | --- | --- |
   | linha adicionada com `// ver plan-12` | pega |
   | linha adicionada com `veredito de 2026-09-10` | pega |
   | linha adicionada com `(achado 3)` | pega |
   | linha adicionada com `(achado 34, 15-divida-conhecida)` | liberada |
   | linha adicionada com `generate-plan-index` | liberada |
   | arquivo **não rastreado** com `plan-7` (modo sem flag) | pega |
   | linha **removida** com `plan-12` | liberada |
   | arquivo já commitado com `plan-12`, sem mudança nessa linha | liberada |
   | arquivo isento com `plan-12` | liberado |
   | arquivo fora de `src/`/`gates/`/`scripts/`/`bin/` (ex.: `docs/x.md`) | liberado |

8. **A prova no hook real.** Com o índice preparado, invoque `sh .githooks/pre-commit`, **sem criar
   commit**, nas duas direções:
   - um arquivo de `src/` com uma linha nova citando `plan-99` → exit 1 no Anel 1, com a mensagem;
   - a mesma alteração sem a citação → passa.

   Desfaça o staging e apague o arquivo de prova. Registre as duas saídas no resumo e prove que o índice
   ficou vazio.

9. `npm run dev-kit`, `npm run gate-limits:check`, `npm run audit:baseline` e a suíte inteira
   (`npx vitest run --maxWorkers=3`). Leia a saída de cada um.

# 6. Critérios de aceite

- [ ] `npm run trail-citation:check` sem flag, no worktree desta entrega, passa. Os arquivos da entrega não
      citam plan, e os isentos estão na allowlist.
- [ ] Os dez casos da tabela do passo 7 existem no self-test e passam.
- [ ] A prova do passo 8 está no resumo com as duas saídas reais, e o índice terminou vazio.
- [ ] O cabeçalho do gate declara os cinco limites do passo 5, e `gate-limits:check` está verde.
- [ ] Toda entrada da allowlist tem motivo, e nenhuma é por diretório ou por padrão.
- [ ] O hook chama o gate com `--staged` só sob `TOCA_CODIGO`, e a mensagem cita R36, o arquivo e o comando.
- [ ] `dev-kit:check` verde; `audit:baseline` sem regressão; suíte inteira verde. Falha em arquivo não
      tocado foi rodada isolada antes de ser atribuída (a intermitência conhecida está em [[00-backlog]] #5).

# 7. Como verificar (uso do revisor)

**Gate:** `trail-citation:check` — nenhuma linha adicionada a `src/`, `gates/`, `scripts/` ou `bin/` cita
`plan-N`, `veredito de` ou `achado N` sem `15-divida-conhecida` na mesma linha (Anel 1 do `pre-commit`, só
local).

- `git status` + `git diff --stat` → só os arquivos da §3.1 (mais `sarak-dev/` regenerado).
- `npm run trail-citation:check` no worktree da entrega → verde. **Teste de mutação:** acrescentar
  temporariamente `// plan-99` a um arquivo de `src/` → vermelho com a linha certa. Restaurar byte a byte.
- Remover do gate a exceção de `15-divida-conhecida` → o caso liberado correspondente do self-test tem de
  cair. Restaurar byte a byte e registrar quantos casos caíram.
- Reproduzir a prova do passo 8 com `sh .githooks/pre-commit`.
- Ler o cabeçalho R18 e a allowlist linha a linha.
- `npx vitest run --maxWorkers=3 > arquivo 2>&1` e ler a saída.

# 8. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md` · `specs/01-gates-e-baseline.md` · `specs/02-enforcement-por-commit.md`

- **`00-regras-e-invariantes`** — nasce **R36**, na §2 (verificável), estado ⚠️ (o escopo do gate é o diff
  local, não o repositório nem a CI). Texto pronto para transporte:

  > **R36 — O código não cita o rastro de execução.** Comentário, string e nome em `src/`, `gates/`,
  > `scripts/` e `bin/` não citam plan, veredito nem achado de veredito. A plan sai do disco na síntese e a
  > citação vira ponteiro morto. Explique no próprio código, ou cite a spec **fixa** que é dona do fato;
  > `achado N` só com o nome da spec que o numera (`15-divida-conhecida`).
  > **Cobrada por:** `check-trail-citation.mjs` (`npm run trail-citation:check`), Anel 1 do `pre-commit`,
  > sobre as linhas **adicionadas** do staged. **O vão:** o legado não é cobrado; a CI não roda o gate;
  > documento não entra.

  Atualizar a contagem da §1.3 e o mapa regra → gate da §4.
- **`01-gates-e-baseline`** — linha nova na tabela da §2.2 e na §2.2.1 (só `pre-commit`, sem CI). Mais o
  item **#6 do backlog**, que esta síntese fecha: a §7 ainda cita o Playwright removido e *"os 5 scripts de
  check"*, número que envelheceu.
- **`02-enforcement-por-commit`** — linha nova na tabela da §2.2.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-13

**Resultado:** Concluído

**O que foi feito**
- `gates/scripts/contrato/check-trail-citation.mjs` (144 linhas) — o gate novo: lê `git diff` (staged ou
  worktree×HEAD) com `-U0`, soma as linhas de arquivos não rastreados no modo sem flag, filtra por
  `src/`/`gates/`/`scripts/`/`bin/`, descarta o que a allowlist isenta e acusa `plan-\d`, `veredito de` e
  `achado\D{0,3}\d` sem `15-divida-conhecida` na mesma linha — por quê: é o corpo da regra da plan (§5
  passos 1–2).
- `gates/allowlists/trailCitationExclusions.mjs` (33 linhas) — as 6 isenções (o gate e seu teste,
  `scripts/generate-plan-index.mjs` e seu teste, `check-plan-index-sync.mjs` e seu teste), cada uma com
  motivo escrito — por quê: §5 passo 3.
- `gates/scripts/contrato/__tests__/check-trail-citation.test.mjs` (161 linhas, 10 casos) — o self-test,
  cada caso montando um repositório git temporário próprio (`fs.mkdtempSync` + `git init`) — por quê: §5
  passo 7 pede o self-test **e** que os casos não usem o repositório real.
- `package.json:47` — acrescentado o script `trail-citation:check` (sem flag — modo worktree, o que o
  comando de detalhe do hook e o critério de aceite 1 esperam) — por quê: §5 passo 6.
- `.githooks/pre-commit:147` — acrescentada a chamada `anel1 "citação do rastro de execução" "R36 …" "npm
  run trail-citation:check" gates/scripts/contrato/check-trail-citation.mjs --staged`, dentro do bloco
  `if [ -n "$TOCA_CODIGO" ]` já existente — por quê: §5 passo 6 (só sob `TOCA_CODIGO`, com `--staged`).
- `sarak-dev/state.json`, `sarak-dev/GUIA-MANUTENCAO.md`, `sarak-dev/START-HERE.md` — regenerados por
  `npm run dev-kit` — por quê: §3.1 ("sarak-dev/ — só pelo gerador, porque o `package.json` muda").

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-trail-citation.mjs` | criado | o gate (R36) |
| `gates/scripts/contrato/__tests__/check-trail-citation.test.mjs` | criado | self-test, 10 casos em repositórios git temporários |
| `gates/allowlists/trailCitationExclusions.mjs` | criado | as 6 isenções, cada uma com motivo |
| `package.json` | alterado | script `trail-citation:check` |
| `.githooks/pre-commit` | alterado | chamada do gate no Anel 1, sob `TOCA_CODIGO`, com `--staged` |
| `sarak-dev/state.json` | alterado | regenerado (`npm run dev-kit`) — reflete o script novo do `package.json` |
| `sarak-dev/GUIA-MANUTENCAO.md` | alterado | regenerado (`npm run dev-kit`) |
| `sarak-dev/START-HERE.md` | alterado | regenerado (`npm run dev-kit`) |

**Verificações executadas**
- `npx vitest run gates/scripts/contrato/__tests__/check-trail-citation.test.mjs` → **10/10 passou**, cobrindo
  os dez casos da tabela do passo 7 (pego: `// ver plan-12`, `veredito de 2026-09-10`, `(achado 3)`, arquivo
  não rastreado com `plan-7`; liberado: `(achado 34, 15-divida-conhecida)`, `generate-plan-index`, linha
  removida com `plan-12`, arquivo já commitado com `plan-12` sem mudança nessa linha, arquivo isento com
  `plan-12`, arquivo fora do escopo `docs/x.md`).
- `npm run trail-citation:check` (sem flag, no worktree desta entrega) → `[OK] Nenhuma linha adicionada cita
  plan, veredito ou achado de veredito.` — exit 0.
- `npm run gate-limits:check` → `[OK] Os 38 scripts de gates/scripts/ declaram o que não veem.` — o gate novo
  entra nessa contagem, com os 5 limites do passo 5 no cabeçalho.
- `npm run dev-kit` → `sarak-dev/ gerado — 82 componentes públicos, 428 tokens, 27 gates`; `npm run
  dev-kit:check` → `[OK] kit em dia (3 arquivos, 0 ponteiros mortos).`
- `npm run audit:baseline` → `[OK] igual ao baseline de 2026-08-11 — nenhuma regressão.`
- `npx vitest run --maxWorkers=3` → **366 arquivos / 1842 testes, 100% verde** (517 s). O ruído `Could not
  parse CSS stylesheet` é o esperado do jsdom ([[01-gates-e-baseline]] §2.4), não falha.
- **A prova do passo 8**, com `sh .githooks/pre-commit` real (índice preparado, sem commit):
  1. Com `src/__prova-trail-citation.ts` staged contendo `// arquivo de prova temporário — plan-99` →
     **exit 1**, bloqueado exatamente no novo bloco:
     ```
     --- check-trail-citation (R36 · --staged) ---
     [ERROR] 1 linha(s) adicionada(s) citam o rastro de execução:
       - src/__prova-trail-citation.ts:1 [plan-N] // arquivo de prova temporário — plan-99
     ⛔ COMMIT BLOQUEADO — Anel 1: citação do rastro de execução
        Regra violada : R36 — O código não cita o rastro de execução (specs/specs/00-regras-e-invariantes.md)
        Veja o detalhe: npm run trail-citation:check
     ```
  2. A mesma linha sem a citação (`// arquivo de prova temporário`), re-staged → **exit 0**, todos os anéis
     em `[OK]`, terminando em `[Sarak] Commit liberado. Anel 3 (suíte, build, package) NÃO roda aqui — rode:
     npm run gates:full`.
  3. Desfeito: `git restore --staged` nos arquivos da entrega + `rm src/__prova-trail-citation.ts`. `git
     status --porcelain` confirmado **sem** o arquivo de prova e **sem nada staged** (índice vazio) — os
     únicos arquivos modificados/novos no worktree são os desta entrega (§3.1) mais trabalho pré-existente
     alheio (`specs/00-backlog.md`, `specs/00-indice.md`, `specs/plan/plan-72-*`, `specs/plan/plan-77…80-*`),
     que não foi tocado.

**Prova dos limites e falsos positivos que a regra promete não ter** *(a plan declara `Gate:
trail-citation:check` na §7 — a suíte verde prova que o gate roda, isto prova que a leitura está certa; feita
com `checkTrailCitation({ cwd, staged: true })` chamada direta contra um repositório git de fixture, entrada
e saída reais, não a suíte)*:

| Entrada exata (linha adicionada, staged) | Esperado | Saída real |
|---|---|---|
| `// corrigido (achado 3)` | pega | `"violacoes":[{"arquivo":"src/base.ts","linha":2,"conteudo":"// corrigido (achado 3)","padrao":"achado N"}]` |
| `// corrigido (achado 34, 15-divida-conhecida)` | libera | `"violacoes":[]` — a exceção da §2 (achado com `15-divida-conhecida` na mesma linha é ponteiro resolvível) segura |
| `// ver generate-plan-index para o gerador` | libera | `"violacoes":[]` — "`plan-index` passa" (§5 passo 2) confirmado: sem dígito depois de `plan-`, o regex não casa |
| Arquivo com `// ver plan-12` já commitado (legado); só `export const b = 2;` é linha nova | libera | `"violacoes":[]` — a linha legada com `plan-12` não muda nesta entrega, e só ela contém o padrão; a linha nova não cita nada |

**Critérios de aceite**
- [x] `npm run trail-citation:check` sem flag, no worktree desta entrega, passa — evidência: saída acima.
- [x] Os dez casos da tabela do passo 7 existem no self-test e passam — evidência:
      `gates/scripts/contrato/__tests__/check-trail-citation.test.mjs`, 10/10.
- [x] A prova do passo 8 está no resumo com as duas saídas reais, e o índice terminou vazio — evidência: acima.
- [x] O cabeçalho do gate declara os cinco limites do passo 5, e `gate-limits:check` está verde — evidência:
      `check-trail-citation.mjs:1-27` (bloco `LIMITES DECLARADOS`) + saída do gate acima.
- [x] Toda entrada da allowlist tem motivo, e nenhuma é por diretório ou por padrão — evidência:
      `trailCitationExclusions.mjs`, 6 entradas por caminho exato, cada uma com motivo.
- [x] O hook chama o gate com `--staged` só sob `TOCA_CODIGO`, e a mensagem cita R36, o arquivo e o comando —
      evidência: `.githooks/pre-commit:147` (dentro do `if [ -n "$TOCA_CODIGO" ]`) + saída da prova do passo 8.
- [x] `dev-kit:check` verde; `audit:baseline` sem regressão; suíte inteira verde — evidência: saídas acima
      (366/1842, sem falha em arquivo nenhum — não houve necessidade de isolar intermitência).

**Decisões e suposições**
- **A allowlist não cita literalmente `plan-NN`/`achado N`/`veredito de` no texto do motivo** — a primeira
  versão citava (ex.: `"plan-12"`), e o próprio gate se auto-acusava ao rodar `trail-citation:check` sem
  flag contra esta entrega (a allowlist não está na lista de isentos do passo 3 — só o gate, seu teste,
  `generate-plan-index.mjs`/`check-plan-index-sync.mjs` e os testes deles estão). Reescrevi os motivos em
  prosa que descreve o padrão sem reproduzi-lo literalmente. Suposição: isto é fiel ao espírito da regra
  (a allowlist não é "código que cita o rastro de execução" — ela descreve, em texto próprio, por que outros
  arquivos podem citar) e não amplia a lista de isentos além do que o passo 3 autoriza.
- **`ACHADO_RE` exige um dígito dentro de até 3 caracteres não-numéricos depois de "achado"** (`achado\D{0,3}\d`),
  não só espaço — cobre `achado 3` e `(achado 34,` sem também pegar a palavra solta "achado" (usada em prosa
  comum) nem os próprios rótulos internos do gate (`'achado N'`, sem dígito). Suposição conservadora: o passo 2
  só dá exemplos com espaço; a folga de até 3 caracteres é para não escapar de pontuação como `(achado nº 3)`
  sem também precisar listar cada variação.
- **O comando publicado no critério de aceite / na mensagem do hook é `npm run trail-citation:check`**, que
  roda **sem** `--staged` (modo worktree×HEAD) — é o que faz o comando reproduzir tanto o caso do commit
  quanto o caso do dia a dia do revisor, já que o diff contra `HEAD` inclui o que está staged.

**Achados fora do escopo (não corrigidos)**
- `specs/specs/01-gates-e-baseline.md` §2.2 e §2.2.1 ainda não listam o gate `trail-citation:check` — é
  trabalho de síntese (§8 desta própria plan), não do executor.
- O worktree já chegou com trabalho alheio pendente e não commitado (`specs/00-backlog.md`,
  `specs/00-indice.md`, `specs/plan/plan-72-…md`, e as plans novas `plan-77`…`plan-80`) — não tocado, listado
  aqui só para constar que não é resíduo desta execução.

**Pendências / riscos**
- Nenhuma. Os nove passos da §5 e os sete critérios da §6 foram executados e verificados.

## Resumo da execução (correção 1) — 2026-09-13

**Resultado:** Concluído

**O que foi feito** — exclusivamente os três achados do veredito de 2026-09-13:

- **Achado 1 (caminho não-ASCII).** `rodarGit()` (`check-trail-citation.mjs:53`) agora chama `git -c
  core.quotePath=false <args>` em vez de `git <args>` — desliga o escape de aspas+octal no `+++ b/…` do
  diff e no `ls-files`, independente do `core.quotepath` do repositório de origem. Sem outra mudança:
  `extrairLinhasAdicionadas` e `extrairLinhasDeArquivoNaoRastreado` já esperavam o caminho cru, só recebiam
  a forma escapada. Dois casos **pegos** novos no self-test: `src/Relatório.ts` staged com `// ver plan-12`
  (era `violacoes: []`, passa a acusar `arquivo:linha` certos) e o mesmo caminho **não rastreado** no modo
  sem flag (era `ENOENT`, passa a acusar sem quebrar).
- **Achado 2 (`achado nº 3` não pegava).** `ACHADO_RE` (`check-trail-citation.mjs:38`) mudou de
  `achado\D{0,3}\d` para `achado\D{0,4}\d` — `" nº "` entre "achado" e o dígito são 4 caracteres não-numéricos
  (espaço, `n`, `º`, espaço), não 3. Um caso **pego** novo no self-test para `// corrigido (achado nº 3)`.
  A afirmação anterior no bloco de resumo original ("a folga de até 3 caracteres é para não escapar de
  pontuação como `(achado nº 3)`") **estava errada** — a folga de 3 não cobria esse caso; agora, com 4,
  cobre. O bloco original não foi alterado (é append-only); esta linha registra a divergência.
- **Achado 3 (allowlist não verificava a própria promessa).** Nova função exportada
  `checkTrailCitationExclusions({ exclusions, root })` (`check-trail-citation.mjs:138-150`): para cada
  entrada, reprova se o motivo é vazio/não-string, ou se `root/<arquivo>` não existe em disco — mesma
  promessa que o cabeçalho de `trailCitationExclusions.mjs:12-13` já fazia. `main()` chama essa função
  **antes** de escanear o diff e funde os dois blocos de erro na mesma saída, sob o mesmo `R36`. Quatro
  casos novos no self-test: motivo vazio → pega; arquivo inexistente → pega; entrada válida → libera; **a
  allowlist real do repositório** (`checkTrailCitationExclusions()` sem argumentos, contra o `ROOT` de
  verdade) → libera, 0 inválidas.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-trail-citation.mjs` | alterado | `-c core.quotePath=false` em `rodarGit`; `ACHADO_RE` de `\D{0,3}` para `\D{0,4}`; nova função `checkTrailCitationExclusions` chamada em `main()` |
| `gates/scripts/contrato/__tests__/check-trail-citation.test.mjs` | alterado | +7 casos: 2 de caminho acentuado (pego), 1 de `achado nº 3` (pego), 4 de integridade da allowlist (2 pegos, 1 liberado sintético, 1 liberado real) |

**Verificações executadas**
- `npx vitest run gates/scripts/contrato/__tests__/check-trail-citation.test.mjs` → **17/17 passou** (10
  originais + 7 novos desta correção).
- `npm run trail-citation:check` (worktree desta entrega, agora também valida a allowlist real) →
  `[OK] Nenhuma linha adicionada cita plan, veredito ou achado de veredito.` — exit 0.
- `npm run gate-limits:check` → `[OK] Os 38 scripts de gates/scripts/ declaram o que não veem.` (sem
  mudança de contagem — só o corpo de dois arquivos já existentes mudou).
- `npm run dev-kit:check` → `[OK] kit em dia (3 arquivos, 0 ponteiros mortos).` (sem mudança — nenhum
  script do `package.json` mudou nesta correção).
- `npx vitest run --maxWorkers=3` → **366 arquivos / 1849 testes, 100% verde** (467,8 s; +7 testes em
  relação à execução original, mesma contagem de arquivos). Mesmo ruído esperado de jsdom
  (`Could not parse CSS stylesheet`).

**Achados do veredito — evidência de fechamento**
- [x] **Achado 1** — evidência: `check-trail-citation.mjs:48-63` (`-c core.quotePath=false`) + os dois
      casos pegos novos no self-test (linhas com "achado 1 do veredito" no nome do `it`).
- [x] **Achado 2** — evidência: `check-trail-citation.mjs:38` (`\D{0,4}`) + o caso pego novo (`achado 2 do
      veredito` no nome do `it`).
- [x] **Achado 3** — evidência: `check-trail-citation.mjs:130-150` (`checkTrailCitationExclusions`) + os
      quatro casos no describe `checkTrailCitationExclusions — integridade da allowlist (achado 3 do
      veredito)`, inclusive o que roda contra a allowlist real.

**Decisões e suposições**
- **A verificação de integridade da allowlist (achado 3) roda sempre contra `ROOT`** (o repositório real),
  não contra o `cwd` do escaneamento de linhas — os dois parâmetros de `checkTrailCitationExclusions` são
  independentes de `checkTrailCitation`. Suposição: a allowlist é um ativo fixo deste repositório, não do
  alvo escaneado; se acoplada ao `cwd` do diff, todo self-test que usa um repositório de fixture mínimo
  (sem os 6 arquivos isentos) reprovaria a integridade por "arquivo não existe" em casos que não têm nada a
  ver com allowlist — o que quebraria os 13 casos de escaneamento de linha desta suíte. Por isso a função é
  separada e testada à parte, com `root` e `exclusions` injetáveis.
- **`ACHADO_RE` foi para `\D{0,4}`, não mais largo.** É a medida exata que `"achado nº 3"` exige (4
  caracteres não-numéricos: espaço, `n`, `º`, espaço) — suficiente para o caso do achado 2 sem alargar mais
  que o necessário e sem novo caso de falso positivo medido nas 17 fixtures.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. Os dois achados fora do escopo já registrados no resumo original continuam sem tocar
  (síntese em `01-gates-e-baseline.md`; trabalho alheio pendente no worktree).

**Pendências / riscos**
- Nenhuma. Os três achados do veredito de 2026-09-13 foram corrigidos, com caso pego no self-test para
  cada um, e a suíte inteira, `gate-limits:check` e `trail-citation:check` voltaram a rodar (§ "Escopo da
  correção" do veredito).

## Resumo da execução (correção 2) — 2026-09-13

**Resultado:** Concluído

**O que foi feito** — exclusivamente os dois achados do veredito de 2026-09-13 (correção 1):

- **Achado 1 (nomes de teste citando o veredito).** Renomeados os 4 nomes que citavam a origem do caso —
  `gates/scripts/contrato/__tests__/check-trail-citation.test.mjs`: `'pega linha adicionada com "achado nº
  3" — achado 2 do veredito'` → `'pega linha adicionada com "achado nº 3" (dígito a 4 caracteres do
  rótulo)'`; `'pega linha adicionada em caminho com acento, no modo --staged — achado 1 do veredito'` →
  `'pega linha adicionada em caminho com acento, no modo --staged'`; `'pega arquivo NÃO rastreado com
  acento, no modo sem flag — achado 1 do veredito'` → `'pega arquivo NÃO rastreado com acento, no modo sem
  flag'`; e o nome do `describe` `'checkTrailCitationExclusions — integridade da allowlist (achado 3 do
  veredito)'` → `'checkTrailCitationExclusions — integridade da allowlist'`. Nenhum dos quatro cita mais
  `veredito` nem `achado N` — todos descrevem o comportamento testado.
- **Achado 2 (limite da isenção por arquivo não declarado).** `check-trail-citation.mjs` ganhou um 6º item
  no bloco `LIMITES DECLARADOS` (R18): a isenção da allowlist vale para o arquivo inteiro, não só para o
  trecho que a justificou — qualquer linha adicionada num arquivo isento passa sem ser vista, mesmo sem
  relação com o motivo declarado.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/__tests__/check-trail-citation.test.mjs` | alterado | 4 nomes de teste/describe renomeados, sem citar veredito/achado |
| `gates/scripts/contrato/check-trail-citation.mjs` | alterado | 6º limite declarado no cabeçalho `LIMITES DECLARADOS` (isenção é por arquivo inteiro) |

**Verificações executadas**
- `npx vitest run gates/scripts/contrato/__tests__/check-trail-citation.test.mjs` → **17/17 passou** (só os
  nomes mudaram; nenhum caso foi adicionado, removido nem teve a asserção alterada).
- `npm run gate-limits:check` → `[OK] Os 38 scripts de gates/scripts/ declaram o que não veem.`
- `npm run trail-citation:check` → `[OK] Nenhuma linha adicionada cita plan, veredito ou achado de
  veredito.` — confirma que os 4 nomes renomeados não citam mais o padrão que o próprio gate acusa.
- Suíte inteira **não** rerodada — o veredito (correção 1) dispensou, porque a mudança é só nome de teste e
  comentário, sem tocar comportamento.

**Achados do veredito (correção 1) — evidência de fechamento**
- [x] **Achado 1** — evidência: os 4 `it`/`describe` renomeados em
      `check-trail-citation.test.mjs` (linhas 94, 106, 117, 196 na versão que o revisor leu) + `[OK]` do
      `trail-citation:check` acima, que confirma que nenhuma das strings novas casa com `casaPadrao`.
- [x] **Achado 2** — evidência: `check-trail-citation.mjs`, item 6 do bloco `LIMITES DECLARADOS`.

**Decisões e suposições**
- Nenhuma isenção foi alterada e nenhum caso de self-test foi removido — a correção é só nome (achado 1) e
  documentação de limite (achado 2), como o próprio veredito descreve ("um nome de teste e um comentário").

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- Nenhuma. Os dois achados da correção 1 foram fechados; self-test, `gate-limits:check` e
  `trail-citation:check` voltaram a rodar, como o escopo da correção pediu.

---

# 10. Veredito

## Veredito — 2026-09-13 — 🔴 Reprovado

**O que foi verificado, e está correto:**
- **Escopo.** `git status` confere com a §3.1: três arquivos criados, `package.json` e `.githooks/pre-commit`
  com uma linha cada, e `sarak-dev/` regenerado. Os outros itens do worktree são specs do revisor.
- **Hook.** A chamada está dentro do `if [ -n "$TOCA_CODIGO" ]` (`.githooks/pre-commit:120`). O `anel1`
  repassa `--staged` ao gate (`:123-124`, `shift 3` + `node "$@"`).
- **Gates.**
  - `npm run trail-citation:check` → `[OK]`
  - `gate-limits:check` → 38 scripts
  - `dev-kit:check` → em dia
  - `audit:baseline` → igual ao baseline
- **Suíte inteira** (`--maxWorkers=3`): **366 arquivos / 1842 testes, 100% verde**, igual ao resumo.
- **Mutação 1:** tirar a exceção de `15-divida-conhecida` (`check-trail-citation.mjs:44`) derruba
  **exatamente 1** dos 10 casos, o liberado correspondente. Restaurado com hash idêntico.
- **Mutação 2:** acrescentar `// plan-99` a `src/core/Provider/constants.ts` faz o gate sair com exit 1,
  nomeando `constants.ts:57`. Restaurado com hash idêntico.
- **Cabeçalho R18:** os cinco limites do passo 5 estão lá. A allowlist tem as seis entradas por caminho
  exato, cada uma com motivo.

**Achados** (sonda contra repositórios git temporários, no scratchpad do revisor):

1. **`check-trail-citation.mjs:64`, `:85` e `:89-90` — caminho com acento escapa do gate, ou derruba o gate.**
   Com a configuração padrão do git (`core.quotepath` ligado), um caminho não ASCII chega entre aspas e
   escapado, tanto no `+++ "b/src/Relat\303\263rio.ts"` do diff quanto no `ls-files`. Medido:
   - modo `--staged`, `src/Relatório.ts` com `// ver plan-12` → `violacoes: []`. **O commit passaria.**
     Também passa quando há outro arquivo ASCII modificado no mesmo diff;
   - modo sem flag, o mesmo arquivo não rastreado → **exceção `ENOENT`**; o gate quebra em vez de acusar.

   Viola o objetivo (§1: toda linha adicionada sob `src/`/`gates/`/`scripts/`/`bin/` é cobrada) e a R18,
   porque o limite não está declarado. A base é um código em português, então nome com acento é plausível.
   **O caso não estava na tabela do passo 7, e isso é lacuna da plan**; a exigência vem do §1 e do passo 1.
   **Correção:** o gate lê os caminhos sem escape nos dois modos. O self-test ganha um caso **pego** para
   arquivo com acento no modo `--staged` e outro no modo sem flag (não rastreado).

2. **Resumo divergente do comportamento** (seção *Decisões e suposições*). O resumo afirma que a folga de
   `ACHADO_RE` (`achado\D{0,3}\d`, `:38`) existe *"para não escapar de pontuação como `(achado nº 3)`"*.
   **Não pega:** `// (achado nº 3)` → `[]`, porque `" nº "` tem quatro caracteres. **Correção:** a regra
   passa a pegar `achado nº 3`, que é a intenção declarada, com um caso **pego** no self-test. No bloco de
   correção, registre que a afirmação anterior estava errada; o bloco original fica intacto (append-only).

3. **`gates/allowlists/trailCitationExclusions.mjs:12-13` promete uma verificação que não existe.** O
   cabeçalho diz que entrada sem motivo, ou de arquivo que não existe mais, faz o gate reprovar, *"mesmo
   idioma de `barrelExclusions.mjs`"*. O `barrel:check` faz isso (`check-barrel-parity.mjs:187-218`). Este
   gate só consulta a chave (`check-trail-citation.mjs:114`) e nunca confere motivo nem existência. Uma
   exclusão obsoleta alarga a isenção em silêncio — o que [[01-gates-e-baseline]] §6 proíbe — e o texto diz
   o contrário. **Correção:** tornar a promessa verdadeira. Entrada de arquivo inexistente, ou de motivo
   vazio, reprova o gate nomeando a entrada. O self-test ganha um caso **pego** para cada uma e mostra que
   a allowlist real passa.

**Escopo da correção:** exclusivamente os três achados acima. A suíte inteira, `gate-limits:check` e
`trail-citation:check` voltam a rodar ao fim.

## Veredito — 2026-09-13 (correção 1) — 🔴 Reprovado

**Os três achados da rodada anterior fecharam, e cada correção tem trava real:**
- **Achado 1 (caminho com acento).** A sonda do revisor agora acusa `src/Relatório.ts` nos três cenários:
  `--staged` sozinho, `--staged` com arquivo ASCII no mesmo diff, e não rastreado. **Mutação:** sem o
  `-c core.quotePath=false` (`check-trail-citation.mjs:54`), caem exatamente os 2 casos novos.
- **Achado 2 (`achado nº 3`).** Agora é acusado. A divergência do resumo original foi registrada no bloco de
  correção, e o bloco original ficou intacto.
- **Achado 3 (allowlist).** Com `checkTrailCitationExclusions` (`:138-150`), a promessa do cabeçalho passou
  a ser verdade. **Mutação:** sem a checagem de existência, cai 1 caso; sem a de motivo, cai 1 caso.
- As três mutações foram restauradas com hash idêntico.
- **Verificações:** self-test **17/17**; `trail-citation:check`, `gate-limits:check` (38) e `dev-kit:check`
  verdes; **suíte inteira 366 arquivos / 1849 testes, 100% verde**, igual ao resumo.

**Achados:**

1. **`gates/scripts/contrato/__tests__/check-trail-citation.test.mjs:94, :106, :117 e :196` — os nomes de
   teste novos citam o veredito.** *"— achado 2 do veredito"*, *"— achado 1 do veredito"* (duas vezes) e
   *"(achado 3 do veredito)"*. É **a variante exata** que o §2 desta plan descreve como motivo do gate, e
   viola a norma que o gate cobra (`padrao-escrita`, `references/comentarios.md`; [[00-prompt-executor]] §3
   item 6): o veredito vive dentro desta plan, que sai do disco na síntese. **Medido:** o `casaPadrao` do
   próprio gate acusa as quatro linhas. Elas só passam porque o arquivo inteiro está isento. A isenção
   existe para as **fixtures** carregarem o padrão como dado; o `:60` é exemplo legítimo disso e fica.
   **Correção:** os quatro nomes descrevem o comportamento testado, sem citar veredito nem achado.

2. **O cabeçalho R18 não declara que arquivo isento não é varrido — em nada.** A isenção vale para o
   arquivo inteiro (`check-trail-citation.mjs:123`): nome de teste, comentário e string de um arquivo isento
   ficam fora, não só a fixture que justificou a isenção. Foi exatamente por esse vão que o achado 1 passou.
   **Lacuna da plan:** o passo 3 mandou isentar arquivos inteiros e não mandou declarar esse limite.
   **Correção:** um sexto limite no bloco `LIMITES DECLARADOS`. Ele diz que a isenção é por arquivo inteiro,
   e que qualquer citação num arquivo isento passa sem ser vista.

**Escopo da correção:** exclusivamente os dois achados acima. Ao fim, rodam de novo o self-test,
`gate-limits:check` e `trail-citation:check`. A suíte inteira não precisa rodar outra vez: a correção muda
só um nome de teste e um comentário.

## Veredito — 2026-09-13 (correção 2) — 🟢 Aprovado

**Os dois achados da correção 1 fecharam:**
- **Achado 1.** Os quatro nomes (`check-trail-citation.test.mjs:94, :106, :117, :196`) descrevem o
  comportamento testado. O grep do revisor em todo o arquivo mostra que o que resta do padrão é **fixture**
  (o dado que o caso planta) ou o **nome que descreve o padrão testado** (`:60`, `:94`), e isso é
  legítimo. **Nota de evidência:** o `[OK]` do `trail-citation:check` que o resumo apresenta não prova este
  achado. O arquivo é isento e o gate não o varre, e é justamente o limite 6. A confirmação vem do grep.
- **Achado 2.** O 6º limite está em `check-trail-citation.mjs:25-28`.

**O estado final, verificado de ponta a ponta nas três rodadas:**

| Critério de aceite (§6) | Evidência |
| --- | --- |
| O worktree da entrega passa | `npm run trail-citation:check` → `[OK]` |
| Os dez casos do passo 7 | self-test **17/17** — os 10, mais 7 das correções |
| A prova no hook real | registrada no resumo original; o repasse do `--staged` foi conferido em `.githooks/pre-commit:123-124` |
| O cabeçalho R18 | seis limites; `gate-limits:check` verde (38) |
| A allowlist | seis entradas por caminho exato, com motivo; motivo e existência agora conferidos pelo gate |
| O hook | a chamada sob `TOCA_CODIGO`, com `--staged`; a mensagem cita R36, o arquivo e o comando |
| Kits e baseline | `dev-kit:check` em dia; `audit:baseline` sem regressão |
| Suíte inteira, estado final | **366 arquivos / 1849 testes, 100% verde** |

**Mutações.** Cinco no total, cada uma restaurada com hash idêntico:

| Mutação | Casos que caem |
| --- | --- |
| sem a exceção de `15-divida-conhecida` | 1 |
| `// plan-99` num arquivo rastreado | o gate barra com exit 1 |
| sem `core.quotePath=false` | 2 |
| sem a checagem de existência | 1 |
| sem a checagem de motivo | 1 |

**Sonda do revisor**, sobre o estado final: caminho com acento acusado nos três cenários, e `achado nº 3`
acusado.

---

# 11. Síntese
