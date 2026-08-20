---
tipo: "spec"
titulo: "Enforcement por commit e por push — os anéis de validação e os hooks versionados"
dominio: "Sarak-Lib-UI-Core / Automação / Git"
status: "🟢 Implementado"
prioridade: "Máxima"
tags: ["spec", "enforcement", "git-hook", "pre-commit", "pre-push", "gates", "baseline", "release"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[03-versionamento-e-release]]", "[[16-integracao-continua]]", "[[008-releases-com-tag-e-semver-em-git]]", "[[05-build-e-distribuicao]]"]
---

# 1. Visão geral

Existiam **12+ verificações que só rodavam se alguém lembrasse.** O `pre-commit` instalado fazia duas coisas — varrer segredos e regenerar o índice de agentes — e **não havia CI** (`.github/` não existia — passou a existir em 2026-08-18, §9). Um commit podia quebrar o barril, introduzir hardcode e desalinhar o catálogo sem nenhuma luz vermelha até alguém rodar a auditoria à mão, dias depois.

Decisão do dono: **todo commit passa por um pipeline de validação.**

Esta spec descreve o pipeline, as decisões de desenho com a justificativa de cada uma, e o que **não** foi automatizado — e por quê.

> **Escopo ampliado em 2026-07-28:** existe agora um anel que **não é por commit, é por push** — o gate
> de release do [[008-releases-com-tag-e-semver-em-git]] (§4.1). Ele mora aqui, e não numa spec própria,
> porque é o **mesmo pipeline**: mesma filosofia de anéis por custo e consequência, mesma pasta
> `.githooks/` versionada, mesma instalação (`npm run hooks:install`) e o mesmo escape. Separar criaria
> duas specs que se referenciam a cada parágrafo.

## 1.1 O que já existia e foi preservado

`git config core.hooksPath` já apontava para `.githooks/` e `.git/hooks/` está vazio: **o hook versionado é o que roda.** O gate de segredos (`verificar_commit.py`, com o catálogo de padrões de `config.json`) continua sendo a **primeira** coisa a rodar e continua bloqueando. Nada nele foi alterado.

# 2. O desenho — quatro anéis por custo e por consequência

| Anel | Quando | Consequência | Custo medido |
| --- | --- | --- | --- |
| **0 — Segurança** | Todo commit, sem exceção | **BLOQUEIA** | < 1 s |
| **1 — Contrato** | Commit que toca código/artefato | **BLOQUEIA** no vermelho | ~2,9 s |
| **2 — Auditoria** | Commit que toca código/artefato | **BLOQUEIA só em REGRESSÃO** | ~7 s (+ ~11 s se tocar `.ts`/`.tsx`) |
| **Push — Release** | `git push` para `main` (§4.3) | **BLOQUEIA** artefato alterado sem tag nova | < 1 s |
| **3 — Suíte** | `git push` para `main` que toca código (§4) | **BLOQUEIA** no vermelho | ~170 s |
| **3 — Build/pacote** | **Manual**, `npm run gates:full` (§4.1) | Responsabilidade de quem entrega | ~1 min |

**Custo total de um commit de código:** ~10 s sem TypeScript, ~20 s com. Um commit de documentação custa **~0,6 s** (§3). **Custo de um push da `main` com código:** ~170 s; de qualquer outro push: instantâneo.

> A tabela tem cinco linhas para quatro anéis porque o **Anel 3 foi partido em dois** em P27: a suíte virou hook, o `build`/`package:check` não — e não vai virar. O porquê está na §4.1.

## 2.1 Anel 0 — Segurança (inalterado)

Varre o **staged** por segredos e arquivos sensíveis. Verde é a única saída aceitável, e não há escopo nem baseline: segredo é segredo.

Roda também o auto-indexador (`.agents/gerar_indice.py` + `git add .agents/index.md`), que já existia.

## 2.2 Anel 1 — Os gates de contrato

Os gates que estão **verdes hoje e devem continuar verdes para sempre**:

| Gate | Regra que cobra |
| --- | --- |
| `check-barrel-parity.mjs --check` | R14 — Barril completo |
| `generate-component-catalog.mjs --check` | R17 — Não transcrever fonte viva |
| `check-zero-brand.mjs --check` | R12 — A lib nunca estampa a própria marca |
| `generate-consumer-kit.mjs --check` | R17 — Não transcrever fonte viva |
| `check-no-deep-import.mjs` | R27 — Zero deep import *(entrou em 2026-08-05, `plan-12`)* |
| `check-gate-limits.mjs` | R18 — Todo gate declara o que não vê *(entrou em 2026-08-05, `plan-12`)* |
| `generate-token-types.ts --check` | R4 · R29 — tipo gerado bate com o schema *(entrou em 2026-08-05, `plan-12`; roda logo no início, porque `guide`/`dev-kit` leem esse arquivo)* |
| `check-container-query.mjs` | — *(`plan-40.2`)* — container query sem interpolação de template literal *(entrou em 2026-08-18, `plan-52`)* |
| `check-container-query-boundary.mjs` | — *(`plan-41`)* — todo `@min-[…]` tem ancestral `container-type` *(entrou em 2026-08-18, `plan-52`)* |
| `check-persistence-doc.mjs` | R17 — paridade doc × código de persistência *(entrou em 2026-08-18, `plan-52`)* |

**Verde é a única saída aceitável.** Não há baseline aqui porque não há dívida: qualquer vermelho é regressão introduzida agora.

### 2.2.1 O kit do mantenedor — um bloco de Anel 1 com gatilho PRÓPRIO

`node scripts/generate-dev-kit.mjs --check` bloqueia o commit desde 2026-08-18 (`plan-52`, decisão do dono).
Ele **não** vive dentro do bloco condicional dos gates acima, e a razão é medida:

> **O `sarak-dev/` é defasado justamente pelos commits que o Anel 1 pula.** Ele rastreia os `scripts` do
> `package.json` **e** o conteúdo de `specs/`; um commit que só mexe em spec o desatualiza e, sob o gatilho de
> código, sairia sem nenhuma cobrança.

Por isso ele dispara na **união** dos dois gatilhos da §3 — e a prova é a linha dupla que o hook imprime num
commit que só cria arquivo em `specs/specs/`:

```
[Sarak] Anel 1 PULADO — o commit só toca doc/spec (nenhum gate de contrato de código a rodar).
[Sarak] Anel 1 (kit do mantenedor) — sarak-dev/ em dia...
⛔ COMMIT BLOQUEADO — Anel 1: kit do mantenedor
```

**As duas linhas juntas são o desenho:** o Anel 1 de contrato pula, e o kit barra assim mesmo. O bloco fica
**fora** do `if` de código, depois do `exit 0` que encerra o commit sem gatilho nenhum — chegar até ali já
prova que a união disparou, sem duplicar a checagem.

*(Consequência aceita, escrita porque piorou: o commit "só de spec" passou a pagar ~14,8 s, quando antes
pagava zero. Ver §3.)*

> **Duas seções condicionais entraram no `pre-commit` fora do bloco de código (`plan-12`, 2026-08-05):**
> `check-plan-index-sync.mjs` dispara quando o staged toca `specs/plan/` ou `specs/00-indice.md` — e roda **mesmo
> sem tocar código**; `check-section-pointers.mjs` (via `auditor_sectionpointers.mjs`) entra pelo Anel 2, junto
> dos demais auditores.

> **Por que o hook chama `node scripts/…` direto e não `npm run …`:** medido — `npm run` custa ~1,3 s por gate contra ~0,65 s da invocação direta. Nos quatro, a diferença é **5,9 s → 2,9 s por commit**. A mensagem de erro segue citando o comando `npm run` equivalente, que é o que a pessoa vai digitar para investigar.

## 2.3 Anel 2 — Auditoria contra baseline versionado

`run_audit.mjs` tem baseline **não-zero** ([[01-gates-e-baseline]] §3). Um gate binário sobre ele bloquearia todo commit; ignorá-lo deixaria a dívida crescer em silêncio. A saída é comparar contra um baseline **versionado em arquivo**:

**Arquivo:** `gates/baselines/audit-baseline.json` — mora ao lado do hook, viaja no repositório, aparece no diff.

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

**A lista de auditores é LIDA de `run_audit.mjs`.** `gates/scripts/release/check-audit-baseline.mjs` extrai o array `const scripts = [...]` do próprio agregador em vez de manter uma cópia. Auditor novo lá é auditor novo aqui, sem ninguém lembrar de sincronizar. Auditor sem parser conhecido cai num parser genérico que só olha o código de saída — degrada, não ignora.

**Métrica ilegível é bloqueio, não silêncio.** Se a saída de um auditor mudar de formato e o número não puder ser lido, o resultado é `null` e o commit é **bloqueado** com "não consegui ler a saída do auditor". Fail-closed: um parser quebrado nunca vira aprovação automática.

## 2.4 A decisão sobre `tsc --noEmit`

**Decisão: entra no Anel 2, e SÓ quando o commit toca `.ts`/`.tsx`.**

O porquê, com os números:

- **A favor de incluir:** `tsc` é o único gate que enxerga erro de tipo real ([[01-gates-e-baseline]] §4.4). E, ao contrário da suíte, ele é **determinístico** — não depende do estado da máquina.
- **A favor de restringir:** custa **~11 s**, quase dobrando o commit. Pagar isso num commit que só mexe em JSON ou markdown é imposto sem contrapartida.
- **Por que produção é verde-obrigatório e teste é baseline:** *(ampliado em 2026-08-05, `plan-12`)* a contagem passou a **separar produção de teste** (`classifyTscOutput`). Erro de **produção** é **hard-block a zero**, fora do mecanismo de baseline — a `plan-07` já tinha zerado esse lado. Erro de **teste** continua contra o piso do baseline (hoje 10): exigir zero bloquearia tudo por ruído de fixture; ignorar deixaria o número subir sem controle.

Resultado prático: commit em TypeScript custa ~20 s, não pode introduzir **nenhum** erro de tipo em produção, e não pode aumentar a contagem de erros em teste.

# 3. Escopo por staged — quem não mexeu, não paga

O hook lê `git diff --cached --name-only --diff-filter=ACMR` e decide:

São **dois** gatilhos independentes, e a diferença entre eles é a parte que mais confunde:

| Condição | Efeito |
| --- | --- |
| **`TOCA_CODIGO`** — staged toca `src/`, `scripts/`, `gates/`, `docs/`, `sarak-ui/`, `bin/`, `package.json`, `.githooks/` ou `.github/` | Anéis 1 e 2 **rodam** |
| **`TOCA_DOC_COM_SECAO`** — staged toca `specs/specs/`, `specs/adr/`, `specs/arquitetura/`, `specs/00-`, `.agents/skills/` ou `sarak-dev/` | Anel 1 de contrato **PULADO**; Anel 2 **roda** |
| Nenhum dos dois (README solto, `.claude/`…) | Anéis 1 e 2 **PULADOS**, com a linha explicando |
| **A união dos dois** | `dev-kit:check` **roda sempre** (§2.2.1) |
| Staged contém pelo menos um `.ts`/`.tsx` | `tsc` **entra** no Anel 2 |
| Staged toca `specs/plan/` ou `specs/00-indice.md` | `check-plan-index-sync.mjs` **entra**, mesmo sem tocar código |

> **`gates/` entrou no escopo em 2026-08-02 (`plan-14`).** Não é ampliação: o código dos gates morava em
> `.githooks/` e `scripts/`, ambos já na lista. Sem esta linha, alterar um gate deixaria de acionar os Anéis 1
> e 2 — seria estreitamento silencioso de escopo, o que R18 existe para impedir.

> **`.github/` entrou em 2026-08-18 (`plan-05`), pela mesma razão e com mais urgência.** Um commit que só
> mexesse no workflow pularia os Anéis 1 e 2 inteiros — **a peça que valida todo o resto seria a única sem
> validação nenhuma**. `.github/workflows/*.yml` é configuração executável, parente direto de `.githooks/`.

**Por que `docs/` e `sarak-ui/` entram na lista mesmo sendo "documentação":** os dois são **artefatos gerados**. `catalog:check` e `guide:check` comparam o commitado com o que o gerador produz agora — editar um deles à mão é exatamente o defeito que R17 existe para pegar.

## 3.1 O custo, remedido em 2026-08-18

O número publicado antes (*"markdown 609 ms, código 10.042 ms"*) envelheceu — e a remedição está aqui
**inclusive tendo piorado**, que é a condição para o número continuar valendo alguma coisa.

| Classe de commit | Antes *(2026-07-28)* | **Agora** *(2026-08-18)* |
| --- | --- | --- |
| Fora de qualquer gatilho (README solto) | 609 ms | **688 ms** |
| Só spec com seção (`specs/specs/`, kit em dia) | *(não existia como classe — caía em "com código")* | **14.817 ms** |
| Com código, sem `.ts` staged | 10.042 ms | **20.395 ms** |
| Com código, **com** `.ts` staged (`tsc` entra) | — | **33.492 ms** |

**Por que subiu, item a item:** os três gates novos da §2.2 somam ~2,4 s; o `dev-kit:check` soma ~2 s **e
alcança uma classe que antes não pagava nada**; e o Anel 2 sozinho, remedido, custa 11.860 ms — 22.605 ms com
`tsc`.

> **É a consequência aceita de fechar o vão.** A alternativa era manter três gates rodados por ninguém e um
> kit de mantenedor que apodrecia em silêncio.

# 4. Anel 3 — a SUÍTE no push; `build` e `package:check` fora de hook, por decisão

**Decisão atual (P27, decisão D8, 2026-07-29): o Anel 3 foi PARTIDO em dois, e só metade dele virou hook.**

| Peça do antigo "Anel 3" | Onde roda hoje | Por quê |
| --- | --- | --- |
| `npx vitest run` | **`pre-push`, BLOQUEANTE** (push da `main`) | O motivo que a segurava expirou |
| `npm run build` | **fora de hook, permanentemente** | Ele **muta a árvore de trabalho** |
| `npm run package:check` | **fora de hook, permanentemente** | Depende do `build` |

```
npm run gates:full     # npm run build && npm run package:check && npx vitest run
```

O comando único continua existindo e continua sendo o que se roda antes de entregar. O que mudou é que **a metade verificável dele deixou de depender de alguém lembrar**.

## 4.1 Por que só a suíte foi promovida — os três motivos tinham validades diferentes

Este é o registro do raciocínio original, preservado porque ele é o que impede alguém de "completar" o Anel 3 no futuro achando que faltou peça:

1. ~~**A suíte tem uma falha dependente do ambiente.**~~ **CAÍDA em 2026-07-28 (P11-D) e reforçada em 2026-07-29 (P20-A).** Era o motivo principal: `bin/scaffold/__tests__/packageManager.test.mjs` falhava nesta máquina por causa de um `package-lock.json` no diretório do usuário, e um `pre-push` bloqueante teria impedido **todo push** por um motivo alheio à mudança — gate vermelho no dia da instalação ensina todo mundo a usar `--no-verify`, e aí não sobra gate nenhum. O teste foi tornado hermético ([[01-gates-e-baseline]] §3.1) e o `Template-Ts/` — que fechava verde só por causa de um `node_modules/` local não versionado — saiu do repositório (§3.2). Com as duas metades fechadas, **este motivo expirou**: a suíte hoje fecha 100% verde em clone limpo.
2. **`npm run build` MUTA a árvore de trabalho** — regenera `dist/`, `sarak-ui/` e `dist/BUILD_INFO.json`. Um hook que reescreve arquivos versionados no meio de um push é armadilha: **o push sai com uma árvore diferente da que foi validada**. Este motivo **não expira nunca**, porque não é sobre o estado do repositório — é sobre o que a operação faz.
3. **`package:check` depende de (2).** Roda `npm pack --dry-run` e exige `dist/` buildado; não é executável isoladamente num hook.

> **Isto é decisão fechada, não pendência.** `build` e `package:check` **não** vão para hook nenhum. O lugar deles é o `npm run gates:full` (à mão, antes de entregar) e o gancho `preversion` de `npm version` ([[03-versionamento-e-release]] §6) — ali a mutação da árvore é o **objetivo** da operação, não um efeito colateral.

## 4.2 O desenho do anel da suíte

| Item | Valor | Justificativa |
| --- | --- | --- |
| **Ordem** | O anel de **release roda primeiro**; a suíte depois | O release é `< 1 s` (só lê o git) e a suíte custa ~3 min. **Rodar o barato primeiro devolve o "não" mais rápido** — é o que respeita quem está do outro lado do terminal |
| **Escopo de branch** | **Só `refs/heads/main`** | Mesmo critério do anel de release: um modelo mental só, um lugar só para olhar. **Quebrar teste em branch de trabalho é parte de trabalhar** — push de WIP, backup, branch compartilhada para revisão. Bloquear ali ensinaria o reflexo do `--no-verify`, que desligaria **os dois** anéis de uma vez. E como neste repositório o trabalho acontece direto na `main` (ADR-008), a concessão é quase gratuita na prática |
| **Escopo de conteúdo** | Roda quando a faixa empurrada toca `src/`, `scripts/`, `gates/`, `bin/`, `package(-lock).json`, `tsconfig*.json` ou `vitest.config/setup.ts` | Mesmo princípio da §3: quem não mexeu, não paga. Um push só de `specs/` custa **zero**. *(`gates/` entrou em 2026-08-05, `plan-12`, vão nº 11 — antes, mexer só num gate não disparava a suíte, embora `BarrelParity`/`ZeroBrand` importem gates)* |
| **Fail-safe** | Qualquer incerteza sobre a faixa **RODA** a suíte | Ref remota nova (sha zerado) ou sha remoto que não existe localmente = sem base de comparação. Um pulo errado aqui produziria exatamente o "verde que não é" que este anel existe para impedir |
| **stdin** | Capturado **uma vez** no topo do hook e repassado | O stdin do `pre-push` só pode ser lido uma vez. O `vitest` roda com `< /dev/null` — um runner que tente ler stdin já consumido trava o push |

**Custo medido (2026-07-29):** push da `main` tocando código = **169–179 s** (~3 min), sendo ~1 s de anel de release e o resto de suíte. Push de branch, ou push da `main` só com markdown = **instantâneo**.

> ⚠️ **Três minutos é o teto.** Está no limite do que um hook pode custar sem começar a ser contornado por reflexo. É por isso que o escopo de conteúdo (§4.2) não é luxo: sem ele, cada push de spec desta campanha pagaria 3 minutos por nada, e o `--no-verify` viraria hábito. Se a suíte crescer além disso, a saída é a CI (§9), não afrouxar o anel.

## 4.3 O anel de PUSH — o release que não pode ser esquecido

**Decisão: [[008-releases-com-tag-e-semver-em-git]] (D5).** Zero tags em 331 commits nunca foi falta de conhecimento — foi falta de gatilho. E o consumidor que instala com `#semver:` depende de tag: sem tag nova, ele fica no artefato velho **em silêncio**, que é o incidente do ADR-007 se repetindo.

| Item | Valor |
| --- | --- |
| Hook | `.githooks/pre-push` (POSIX `sh`, repassa o stdin do git) |
| Lógica | `gates/scripts/release/check-release-tag.mjs` |
| À mão | `npm run release:check` (avalia o `HEAD`, sem precisar empurrar nada) |

**Bloqueia quando as três forem verdade:** o push é para `refs/heads/main`; o **artefato publicado** mudou desde a última tag `v*`; e o commit empurrado **não** carrega tag.

**O que é "o artefato publicado":** `dist/` + `sarak-ui/` — a MESMA definição do `sarak-ui check`, reusando `SIGNED_DIRS` e `hashInventoryLines` de `bin/scaffold/checkUpdate/localDependency.mjs`. A assinatura é o inventário `caminho:tamanho`, só que lido de `git ls-tree` em vez do disco. **Duas noções concorrentes de "artefato" seria a porta para o gate dizer uma coisa e o aviso do consumidor dizer outra.**

**Por que "o artefato mudou" e não "houve commit":** aqui todo trabalho acontece direto na `main`. Taggear por commit produziria centenas de tags e o número viraria contador de build. Commit que só mexe em `specs/` não muda artefato, não pede tag e **não incomoda ninguém** — foi exercitado exatamente assim.

**O nível do bump é SUGERIDO, nunca decidido.** O bloqueio lê os commits desde a última tag e sugere `major`/`minor`/`patch`, dizendo no próprio texto que é sugestão. O motivo está no ADR-008: os 8 commits mais recentes são todos `feat:`, inclusive remoções e correções — uma heurística sobre eles diria `minor` sempre, e um dia diria `minor` num breaking. **Tag errada é pior que tag ausente**, porque o consumidor confia na faixa.

Os dois cenários, exercitados contra um remoto de verdade (2026-07-28):

```
# só markdown alterado
[release:check] OK — o artefato publicado é idêntico ao de v1.0.0 (e0c9d4029336). Nenhuma tag devida.

# sarak-ui/ alterado, sem tag nova
⛔ PUSH BLOQUEADO — o artefato publicado mudou desde a última tag, e não há tag nova.
   última tag : v1.0.0   (dist + sarak-ui → e0c9d4029336)
   a empurrar : 324c603…  (dist + sarak-ui → 33a110e22d33)
       npm version <major|minor|patch>      # sugestão desta faixa: minor
```

**Quando o repositório não tem tag nenhuma, ele não bloqueia** — avisa que não há o que comparar e libera. Cobrar uma tag num repositório que nunca teve nenhuma é punir um estado que o ritual ainda não alcançou; a partir da primeira, ele cobra as seguintes.

### 4.3.1 ⚠️ O `pre-push` deixou de rodar no dia a dia — e os dois anéis mudaram de lugar

**Mudança de comportamento de 2026-08-18 (`plan-05`), que sumiria sem aviso se ninguém a escrevesse.**

O hook só age quando o destino é `refs/heads/main`. Com o modelo de branches ([[16-integracao-continua]] §2),
o trabalho diário passou para a `develop` — então **o `pre-push` raramente dispara**, e quando o merge acontece
pelo botão do GitHub **nenhum hook local roda**.

| Anel | Continua coberto? |
| --- | --- |
| **Anel 3** — a suíte completa | ✅ **sim, e melhor** — o job `gates` a roda em `push:develop`, `push:main` **e no PR, antes do merge** |
| **Anel de release** — *"o artefato mudou e não há tag"* | ✅ **sim** — o job `release-tag` roda o **mesmo** `check-release-tag.mjs` no evento `push` da `main` |

**Não é perda: é a rede mudando de lugar, para um lugar melhor.** Sem o segundo, um PR que altere o artefato
publicado entraria na `main` pelo botão **sem tag e sem ninguém reclamar** — o incidente do ADR-007 de novo.

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

E no push (saída real da prova 1 do P27):

```
[release:check] OK — o artefato publicado é idêntico ao de v1.1.0 (dd5dd4f0b1eb). Nenhuma tag devida.
[Sarak] Anel 3 — suíte completa (npx vitest run). Isto leva ~3 min.
 Test Files  273 passed (273)
      Tests  877 passed (877)
[Sarak] Anel 3 OK — suíte completa verde.
[Sarak] Push liberado. Fora de hook, por decisão: npm run build e package:check
        (o build muta a árvore — rode com npm run gates:full).
```

Quando um anel é pulado, a linha diz **que foi pulado e por quê** — silêncio seria indistinguível de "passou":

```
[Sarak] Anel 3 PULADO — nada sendo empurrado para main.
[Sarak] Anel 3 PULADO — nada que a suíte enxergue mudou nesta faixa
        (src/, scripts/, bin/, package.json, tsconfig, vitest.config/setup).
```

# 6. Instalação

```
npm run hooks:install
```

`scripts/install-hooks.mjs` é **idempotente**: garante `core.hooksPath = .githooks` e o bit de execução dos hooks, e só escreve quando o valor está diferente. `HOOK_FILES` cobre **`pre-commit` e `pre-push`** — os dois viajam versionados e são instalados pelo mesmo comando.

Duas decisões dentro dele:

- **`core.hooksPath` passa a ser relativo (`.githooks`), não absoluto.** O valor encontrado nesta máquina era o caminho absoluto do repositório — funciona, mas não sobrevive a um clone em outro caminho.
- **`git update-index --chmod=+x` só é chamado quando o modo ainda não é `100755`.** Esse comando **escreve no índice**: rodar o instalador antes de um commit qualquer plantaria uma mudança de modo no staged sem ninguém pedir. Quando ele precisa agir, avisa em voz alta que o staged foi tocado. *(Descoberto na primeira execução das provas — a prova 4 rodou os anéis que deveria ter pulado, justamente porque o instalador tinha deixado `.githooks/pre-commit` no staged.)*

> **Por que NÃO existe um script `prepare`.** Seria a forma automática de instalar no clone — mas o npm também executa `prepare` quando o pacote é instalado **como dependência git**, que é exatamente o modo de distribuição desta lib ([[007-distribuicao-por-git]]). O consumidor rodaria `git config` no repositório dele. A instalação é manual **de propósito**, e está documentada aqui e no README de quem clona.

> **Por que não husky/lint-staged.** O repositório já tem `core.hooksPath` versionado, que é mais simples, é auditável no diff e **não coloca `node_modules` no caminho crítico do commit**. Nenhuma dependência nova foi adicionada.

# 7. O escape — `--no-verify`

`git commit --no-verify` pula todos os hooks e **não há como impedir isso** (é do git, não do repositório). O mesmo vale para `git push --no-verify`, que pula **os dois anéis de push de uma vez** — o de release e o da suíte. Lá o custo do escape é diferente: não é só dívida técnica que fica no repositório, é um consumidor que fica para trás sem saber, ou uma `main` vermelha que ninguém vê.

> É por causa desse "de uma vez" que o anel da suíte vale **só para a `main`** (§4.2). Um gate que incomoda em branch de trabalho seria contornado por reflexo — e o reflexo derrubaria junto o anel de release, que é o mais barato e o mais consequente dos dois.

O uso é **excepcional**: commit de emergência, ou salvar trabalho em andamento numa branch pessoal. O que se espera de quem usa:

1. Rodar os anéis à mão depois (`node gates/scripts/release/check-audit-baseline.mjs --with-tsc` e os quatro gates).
2. Consertar antes do merge.

Não é uma porta dos fundos — é uma saída de incêndio. Quem a usa e não volta está transferindo o próprio problema para o repositório.

# 8. Compatibilidade

O hook é **POSIX `sh`** e roda em Git Bash no Windows. Nada de PowerShell dentro dele. As únicas dependências externas são `python` (já exigido pelo Anel 0) e `node` (já exigido pelo projeto).

# 9. A CI — decisão tomada, e o que ela mudou aqui

**A opção deixou de estar em aberto em 2026-08-18** (`plan-05`). `.github/workflows/` existe, com dois
workflows e quatro jobs. **O fluxo inteiro é [[16-integracao-continua]]** — esta seção registra apenas o que a
CI mudou **para os anéis locais**, que é o assunto desta spec.

| O que a CI acrescentou | Como |
| --- | --- |
| `build` e `package:check` em **ambiente limpo** | São as duas peças que nunca vão para hook (§4.1) porque mutam a árvore. No runner a árvore é descartável, e a objeção deixa de existir |
| Ambiente **determinístico** | Achou, no primeiro dia, um `package-lock.json` incompleto que **nenhum hook local podia ver** — o defeito que dependia de estado da máquina |
| Cobrar quem usou `--no-verify` | O escape da §7 deixa de ser invisível: o job roda a união dos anéis, sem consultar o que foi ou não pulado localmente |
| Os 5 `*:check` que ficavam de fora | `plan-index` (a metade que o hook não roda), `gate-limits`, `container-query`, `container-query-boundary`, `persistence-doc` |

**Custo real: ~5 min por run.**

> ⛔ **O que a CI NÃO absorveu, e é desta spec: o Anel 0.** `verificar_commit.py` lê só `git diff --cached`, e
> no runner não há staging — ele reportaria "nenhum segredo" **sempre, em silêncio**. Um passo verde que não
> olha nada é pior que passo ausente. **O Anel 0 continua exclusivamente local**, e essa é a única parte deste
> pipeline sem rede remota nenhuma.

*(O Playwright não entrou na conta: foi removido da base em 2026-08-18 — [[01-gates-e-baseline]] §2.6.)*

# 10. Critérios de aceite

- [x] Anel 0 preservado, sem alteração no `verificar_commit.py` nem no `config.json`.
- [x] Anel 1 bloqueia no vermelho, com os quatro gates.
- [x] Anel 2 bloqueia **só** em regressão contra `gates/baselines/audit-baseline.json`, versionado.
- [x] `tsc` decidido, justificado e implementado (Anel 2, condicionado a `.ts`/`.tsx`).
- [x] Escopo por staged implementado com `git diff --cached --name-only` e documentado.
- [x] Mensagem de bloqueio cita regra, arquivo e comando.
- [x] Confirmação positiva por anel, incluindo a de "pulado".
- [x] Instalação idempotente (`npm run hooks:install`).
- [x] Nenhum auditor ou script de check existente foi alterado — só orquestrados.
- [x] Nenhuma dependência nova.
- [x] Anel 3 decidido **com justificativa escrita** e caminho de promoção — percorrido em P27.
- [x] CI **não** criado; registrado como opção em aberto (§9).

Do anel de push (2026-07-28):

- [x] `.githooks/pre-push` criado e `'pre-push'` acrescentado a `HOOK_FILES`.
- [x] A definição de "artefato publicado" **reusada** de `localDependency.mjs`, não reimplementada.
- [x] Bloqueio exercitado nos dois cenários contra um remoto real, com a saída registrada (§4.3).
- [x] Nível do bump **sugerido** e rotulado como sugestão na própria mensagem.
- [x] Repositório sem tag nenhuma **não** é bloqueado.
- [x] Nenhuma dependência nova.

Da promoção da suíte (2026-07-29, P27):

- [x] Pré-requisito confirmado: P20-A concluído (`Template-Ts/` fora), suíte 100% verde em 273/877.
- [x] Suíte acrescentada ao `pre-push` **convivendo** com o anel de release, que continua rodando primeiro.
- [x] Ordem e escopo de branch **decididos e justificados** (§4.2).
- [x] `build` e `package:check` **fora de hook**, registrado como decisão fechada e não como pendência (§4.1).
- [x] `HOOK_FILES` conferido — `'pre-push'` já estava lá desde o P12-C; `install-hooks.mjs` **não** precisou de alteração.
- [x] Mensagem de bloqueio acionável: regra, comando que reproduz, e onde está a dívida tolerada.
- [x] stdin do `pre-push` capturado uma vez e repassado; `vitest` com `< /dev/null`.
- [x] As 4 provas executadas com saída real (§11.1). Quebra deliberada **revertida**.
- [x] Custo medido e registrado (169–179 s), com o teto discutido em voz alta.
- [x] Nenhum auditor alterado, `pre-commit` intocado, nenhuma dependência nova, nenhum push real.

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

## 11.1 As 4 provas do anel da suíte (P27, 2026-07-29)

Executadas invocando `sh .githooks/pre-push` com o **protocolo real do git no stdin** (`<ref local> <sha local> <ref remota> <sha remoto>`), **sem push de verdade**. É o mesmo caminho de código que o git executa.

| # | Prova | Resultado |
| --- | --- | --- |
| 1 | Push da `main` com código na faixa e suíte **verde** | ✅ **exit 0** — release OK, `273 passed / 877 passed`, "Anel 3 OK". **169 s** |
| 2 | Push da `main` com um teste **quebrado de propósito** | ✅ **exit 1** — `1 failed | 273 passed`, mensagem citando **R8**, o comando que reproduz e onde está a dívida tolerada. **Quebra revertida** e o verde reconfirmado (prova 1 re-executada depois) |
| 3a | Anel de release: artefato mudou desde a tag, **sem tag nova** | ✅ **exit 1**, `v1.1.0 (dd5dd4f0b1eb)` × `dbf2d18 (6cbac86216ad)`, sugestão `patch` — e a suíte **nem chegou a rodar**, que é o ponto da ordem escolhida |
| 3b | Anel de release: artefato **idêntico** ao da tag | ✅ **exit 0**, "o artefato publicado é idêntico ao de v1.1.0" |
| 4 | Escopo: push de **branch de trabalho**, e push da `main` sem código na faixa | ✅ **exit 0** instantâneo, com a linha "Anel 3 PULADO — …". O filtro foi conferido também contra uma faixa real só-de-markdown do histórico (`1a9f318..dbf2d18` → nenhum caminho de código) |

**Custo total medido:** 169 s e 179 s em duas execuções da prova 1 (~3 min), das quais **< 1 s** é o anel de release. Fora da `main`, ou sem código na faixa: **instantâneo**. O teto de 3 minutos está discutido na §4.2 — não é confortável, e é a razão de o escopo de conteúdo existir.
