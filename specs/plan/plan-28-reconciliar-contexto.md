---
tipo: "plan"
titulo: "Reconciliar 00-contexto.md com o repositório medido"
dominio: "Sarak-Lib-UI-Core / Governança de Specs"
status: "🟢 Aprovada"
prioridade: "Máxima"
tags: ["plan", "specs", "contexto", "reconciliacao", "r17"]
relacionados: ["[[00-contexto]]", "[[01-gates-e-baseline]]", "[[00-regras-e-invariantes]]", "[[03-versionamento-e-release]]"]
depende_de: ""
destino_sintese: "—"
objetivo: "Fazer a porta de entrada dos agentes descrever o repositório que existe"
---

> ⚠️ **Executada pelo REVISOR, não pelo executor.** Ela só toca `specs/`, e o executor tem proibição
> explícita de criar ou editar spec ([[00-prompt-executor]] §7.3). É o desvio declarado em
> [[00-contexto]] §5.

# 1. Objetivo

Um agente que leia **apenas** `specs/00-contexto.md` recebe instrução **correta** sobre versão, baseline,
paridade e contagem de regras — hoje ele recebe instrução errada em sete pontos, e num deles ela o manda
comparar o `run_audit` com o número oposto ao verdadeiro.

# 2. Contexto

`00-contexto.md` é o primeiro arquivo que **todo** agente lê, em **toda** sessão. Medido no worktree limpo
em **2026-08-11**, ele diverge do repositório em sete pontos. Cada linha abaixo foi conferida por execução
de comando, não por leitura de outro documento:

| § | O que a spec diz | O que o repositório responde |
|---|---|---|
| §3 | *"Versão atual: **1.2.1** — e o `2.0.0` está **pronto no worktree**, aguardando a decisão de publicar"* | `package.json` = **4.0.0**; `git tag` lista 8 tags, até `v4.0.0`. Não há nada aguardando publicação |
| §2 e §8 | *"O `run_audit` fecha em **ZERO** desde 2026-08-03… as **8 métricas** do baseline estão em 0, então **não há mais folga**"* | `node gates/scripts/audit/run_audit.mjs` → **exit 1, 2 auditores vermelhos**; `gates/baselines/audit-baseline.json` traz `auditor_ghostvars.consumos: 1` e `auditor_composicaoatomica.violacoes: 2`; são **12** auditores |
| §2 | *"Paridade 1:1:1 … (hoje **409/409/409**)"* | `auditor_paridade` → **422 / 422 / 422** |
| §2 | *"O `tsc` **não** é zero (10 erros, todos em teste)"* | baseline: `tsc: { erros: 0, producao: 0, teste: 0 }` |
| §3 | tabela de comandos: *"Auditoria estrutural (**8 auditores**)"* | **12** arquivos `auditor_*.mjs` em `gates/scripts/audit/` |
| §8 | *"`design-token-ids.ts` está defasado em 105 tokens (304 × 409) e o gerador **não está registrado** em script, hook ou skill nenhuma"* | **fechado** (achado 22, `plan-12`). `npm run token-types:check` → *"em dia (422 tokens)"*, e roda no Anel 1 e no `build` |
| §2 · §4.1 | *"as **32 regras**… (**29 verificáveis e 3 de conduta**)"* | `grep -c "^## R" specs/specs/00-regras-e-invariantes.md` → **34** |

**O segundo item é o que dói de verdade:** ele não só está errado, ele **instrui errado**. A frase *"não há
mais folga"* manda o leitor tratar qualquer vermelho como regressão, quando
[[01-gates-e-baseline]] §3 e o próprio JSON de baseline dizem o contrário. É exatamente o cenário que
aquela spec abre declarando que existe para impedir.

## 2.0 🔧 EMENDA DE ESCOPO — 2026-08-12, antes da execução

A tabela acima nasceu de uma leitura **por seção**, e a varredura por regex feita ao iniciar a execução
(`grep -nE "[0-9]{2,}|ZERO|zero" specs/00-contexto.md`) achou **mais oito ocorrências da mesma classe**.
Eu — revisor, autor desta plan — **amplio o escopo aqui, antes de tocar no alvo**, em vez de estourá-lo em
silêncio ou entregar um arquivo que continua mentindo:

| # | Onde | O que diz | O que o repositório responde |
|---|---|---|---|
| 8 | §1, `:36` | *"resolve **409 tokens** em tempo de execução"* | 422 — a mesma cifra do ponto 3, noutra seção |
| 9 | §3, tabela de blocos `:106` | *"28 schemas → `MASTER_DESIGN_MAP` → **409 tokens**"* | 422. ⚠️ **"28 schemas" está CERTO** (`ls src/core/Design/schema/*.ts` → 28) e **fica** |
| 10 | §3, `:116` | aponta `arquitetura/00-mapa-do-modulo.md` **§96** | aquele arquivo tem **9** seções. `§96` não existe — é número de linha escrito como seção |
| 11 | §8 | *"**14 achados abertos** (de 31 numerados)"* | **5** abertos, e a numeração já vai até **40** |
| 12 | §8 | *"os **5 gates em fila** e as **4 ampliações de escopo**"* | a §4 da spec de dívida lista **3** (18, 23, 26) |
| 13 | §8 | *"Padrão recorrente, **ainda não medido**: o escopo do gate é menor que o da regra"* | **foi medido** — a matriz de cobertura de [[01-gates-e-baseline]], com os vãos um a um |
| 14 | §8 | *"lib **1.2.1**"*, no bullet do ERP | 4.0.0 — a mesma versão falsa do ponto 1 |

**Por que a emenda e não um "achado fora do escopo":** os oito são **literalmente a mesma classe** dos sete
já listados, no **mesmo arquivo**, e o objetivo da plan é *"o agente que ler só este arquivo recebe instrução
correta"*. Registrá-los para depois entregaria um `00-contexto` consertado que ainda afirma `409`, `1.2.1` e
`14 achados`. **O que não é aceitável é ampliar sem declarar** — por isso a emenda tem data, medição e fica
no corpo da plan, acima do resumo.

> ⚠️ **A lição, e ela é sobre o método desta própria plan:** eu levantei os sete pontos **lendo por seção** e
> só varri por padrão ao começar a executar. É o mesmo defeito que [[006-zero-marca-soberania-host]] registra
> — *"grep por UMA string não é auditoria"* — na forma inversa: **leitura sem varredura também não é.** Quem
> escrever a próxima plan de reconciliação varre **antes** de fechar o escopo.

## 2.1 A causa é conhecida, tem nome e já foi declarada fechada

Os sete pontos são **a mesma classe de defeito**: cifra absoluta escrita em prosa. É o **achado 32** de
[[15-divida-conhecida]], cujo fechamento registrou a lição em voz alta — *"total absoluto em prosa
envelhece a cada conserto; a cifra vive em fonte gerada, a prosa afirma a relação"*.

A lição foi aplicada **na linha que a produziu** e em nenhuma outra. Por isso esta plan **não troca número
velho por número novo**: onde há cifra, ela sai e entra a **relação + o ponteiro para a fonte viva**. Um
`00-contexto` consertado com os números de hoje volta a mentir na próxima plan que conserte um gate.

# 3. Escopo

## 3.1 Dentro
- `specs/00-contexto.md` — os sete pontos da §2 **mais os oito da emenda §2.0**, e **nada além deles**.

## 3.2 Fora
- ⛔ **Qualquer arquivo fora de `specs/00-contexto.md`.** As mesmas cifras envelhecidas existem em
  `00-regras`, `01-gates`, `11-testes` e `12-kit` — são a **plan-29**, de propósito: misturar as duas
  produz um diff que ninguém verifica de uma vez.
- ⛔ **Corrigir a dívida que a spec descreve.** Esta plan alinha a descrição ao estado; ela não conserta
  achado nenhum. Os achados abertos são a **plan-30**.
- ⛔ **Reescrever seção que está correta.** Os blocos `> **Como escrever:**` são contrato de manutenção e
  **permanecem** ([[00-contexto]] §0). A §5 (ciclo SDD), a §6 e a §7 não têm divergência medida — não as
  toque.
- ⛔ Criar regra nova, remover regra, ou mudar o mapa de roteamento da §4.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/01-gates-e-baseline.md` §3 | é a régua do baseline — a §2/§8 do contexto tem de **apontar** para ela, nunca reproduzi-la |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` §1.2 · §1.3 | o vocabulário de estado e a contagem que o contexto cita |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` §3.1 | a linha publicada e o motivo de cada MAJOR — é para lá que a §3 do contexto aponta |
| Spec fixa | `specs/specs/15-divida-conhecida.md` §6 (achado 32) | a lição que esta plan aplica: relação, não cifra |
| Fonte viva | `gates/baselines/audit-baseline.json` · `package.json` · `npm run audit` | a verdade que o texto novo referencia |

# 5. Instruções de execução

> **A regra que governa cada passo:** onde a spec afirmava um **total**, o texto novo afirma a **relação** e
> nomeia **onde o número vive**. Número só permanece quando ele é **identidade** (o nome de uma tag), nunca
> quando é medição.

1. **§3 — versão.** Remover a afirmação de que a versão é `1.2.1` e de que existe um `2.0.0` pronto no
   worktree aguardando decisão. No lugar: a versão vive em `package.json`, a linha publicada é `git tag`, e
   o **motivo de cada MAJOR** está em [[03-versionamento-e-release]] §3.1. **Pronto quando** a §3 não
   carregar nenhum número de versão.

2. **§2 — o regime do `run_audit`.** Substituir o bullet inteiro que hoje afirma *"fecha em ZERO desde
   2026-08-03… as 8 métricas estão em 0… não há mais folga"*. O texto novo diz o que é verdade e **inverte
   a instrução**: o baseline **não é zero**, a fonte viva é `gates/baselines/audit-baseline.json`, a régua é
   [[01-gates-e-baseline]] §3, e **compara-se com o baseline, nunca com zero**. Sem enumerar auditores nem
   métricas. **Pronto quando** a palavra "zero" não aparecer como estado do `run_audit`.

3. **§2 — paridade.** Trocar `409/409/409` pela afirmação da **convergência** das três fontes, apontando
   `npm run audit` → `auditor_paridade` e `sarak-dev/state.json` → `design.tokens` como as fontes vivas.
   **Pronto quando** não houver cifra de token na §2.

4. **§2 — `tsc`.** Remover a afirmação de que há 10 erros. O baseline de `tsc` vive no mesmo JSON do Anel 2;
   o texto aponta e não presume valor. **Pronto quando** não houver contagem de erro de `tsc` na §2.

5. **§3 — tabela de comandos vitais.** A linha da auditoria deixa de dizer "8 auditores": a lista viva é o
   array de `gates/scripts/audit/run_audit.mjs`. Manter o alerta *"compare com o baseline, não com zero"*,
   que já está certo. **Pronto quando** não houver contagem de auditores.

6. **§8 — o item do `design-token-ids.ts` SAI.** Ele descreve defeito fechado. Remover o bullet inteiro;
   **não** substituir por outro texto — [[15-divida-conhecida]] §6 já guarda o número do achado, e a §8 do
   contexto não é histórico (o próprio bloco `> **Como escrever:**` dela diz isso: *"item resolvido sai
   daqui"*). **Pronto quando** `grep -n "304" specs/00-contexto.md` não retornar nada.

7. **§2 e §4.1 — contagem de regras.** Trocar *"as 32 regras (29 verificáveis e 3 de conduta)"* pela
   estrutura, sem total: as regras vivem em [[00-regras-e-invariantes]], em **duas categorias**
   (verificáveis e de conduta), cada uma com o estado da verificação (✅ · ⚠️ · ⏳ · 🔴), e a contagem se lê
   com `grep -c "^## R"`. **Pronto quando** não houver total de regras na §2 nem na §4.1.

8. **Os oito pontos da emenda §2.0**, com a mesma regra dura (relação, não cifra):
   - **8 e 9** — as duas ocorrências de `409` fora da §2 (em §1 e na tabela de blocos da §3) saem. **"28
     schemas" fica**: é contagem de arquivo, conferida, e não é medição que se move a cada plan.
   - **10** — o ponteiro `§96` para o mapa do módulo vira referência ao arquivo, **sem seção**. Aquele
     arquivo tem 9 seções; `§96` é número de linha travestido de seção, e nenhum gate o pega (o
     `auditor_sectionpointers` só resolve autorreferência, e isso está declarado nos limites dele).
   - **11 e 12** — os totais de achado e de gate em fila saem; a §8 passa a **apontar** a spec de dívida, que
     é quem os conta. Sem número.
   - **13** — *"ainda não medido"* deixa de ser verdade: o padrão **foi** medido, e a matriz de cobertura de
     [[01-gates-e-baseline]] é o resultado. O bullet vira o registro do padrão + o ponteiro para a matriz.
   - **14** — a versão no bullet do ERP some pelo mesmo motivo do passo 1; o que importa ali é o **modo de
     consumo** (`file:` é cópia no store), não o número.

8-bis. **Conferir o que sobrou, e PARAR se houver mais.** Reler os demais bullets da §8 e o bloco "Aceito
   como característica" contra o repositório. Achado **fora das quinze linhas já declaradas** não é corrigido
   nesta execução: vai para *Achados fora do escopo* no resumo e vira passo da plan-29 ou plan nova. **A
   emenda §2.0 foi feita ANTES de tocar no alvo, e foi uma; a plan não se amplia duas vezes.**

9. **Rodar `npm run dev-kit:check` e `npm run section-pointers:check`.** O primeiro cobra ponteiro morto de
   caminho/comando; o segundo, ponteiro de seção. Editar prosa que cita `§N.N` pode quebrar os dois.

10. **Verificar o alvo de tamanho.** [[00-contexto]] §9 fixa **≤ 200 linhas preenchidas**. Esta plan só
    remove e encurta, então o número tem de cair ou ficar igual. Se subir, alguma substituição virou
    tratado — reduza.

# 6. Prompt de execução

```
Leia specs/00-prompt-revisor.md e execute specs/plan/plan-28-reconciliar-contexto.md.

Esta plan é executada pelo REVISOR (ela só toca specs/; o executor tem proibição de
editar spec — 00-prompt-executor §7.3).

Contexto obrigatório antes de começar: specs/00-contexto.md (inteiro),
specs/specs/01-gates-e-baseline.md §3, specs/specs/00-regras-e-invariantes.md §1.2-§1.3,
specs/specs/03-versionamento-e-release.md §3.1, specs/specs/15-divida-conhecida.md §6.

REGRA DURA desta plan: onde havia um TOTAL, entra a RELAÇÃO mais o ponteiro para a fonte
viva. Não troque número velho por número novo — é o achado 32, e ele reincide justamente
assim. Número só fica quando é identidade (nome de tag), nunca quando é medição.

Não toque em nenhum arquivo além de specs/00-contexto.md. Não conserte dívida.
Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] Os **sete** pontos da §2 estão corrigidos, cada um pelo passo correspondente da §5.
- [ ] **Nenhuma cifra de medição sobreviveu** na §2, na §3 e na §4.1: zero contagem de token, de auditor, de
      regra, de erro de `tsc` e de versão.
- [ ] Cada afirmação substituída **nomeia a fonte viva** (arquivo gerado, comando ou spec dona).
- [ ] O bullet do `design-token-ids.ts` **saiu** da §8 — `grep -n "304" specs/00-contexto.md` sem resultado.
- [ ] A instrução do `run_audit` **inverteu**: manda comparar com o baseline, e a palavra "zero" não descreve
      mais o estado dele.
- [ ] Os blocos `> **Como escrever:**` continuam **todos** presentes — nenhum foi removido junto.
- [ ] `npm run dev-kit:check` e `npm run section-pointers:check` verdes.
- [ ] `git diff --stat` mostra **um único arquivo**: `specs/00-contexto.md`.
- [ ] O arquivo não cresceu (alvo de ≤ 200 linhas preenchidas, [[00-contexto]] §9).

# 8. Como verificar (uso do revisor)

```bash
git diff --stat                                   # exatamente 1 arquivo
git diff specs/00-contexto.md                     # ler o diff INTEIRO, linha a linha
grep -nE "409|304|1\.2\.1|2\.0\.0 está|8 auditores|32 regras|ZERO" specs/00-contexto.md
grep -c "^> \*\*Como escrever:\*\*" specs/00-contexto.md   # os blocos de contrato sobreviveram
npm run dev-kit:check && npm run section-pointers:check
node gates/scripts/audit/run_audit.mjs            # baseline intacto: 2 vermelhos, os mesmos
```

- O terceiro comando tem de voltar **vazio** (ou só com ocorrência que a §2 desta plan não listou — e aí é
  achado, não aprovação).
- Ler cada substituição e confirmar que ela **aponta** em vez de afirmar: o teste é perguntar *"esta frase
  ainda estará certa depois da próxima plan que conserte um gate?"*. Se a resposta for "não", reprova.

# 9. Destino da síntese

**Destino:** `—`

A execução **já escreve na spec fixa** — `00-contexto.md` é editável pelo revisor por contrato
([[00-prompt-revisor]] §3.1), e é o próprio alvo. Não sobra verdade a transportar depois; o que resta é
`/spec-atualizar` remover esta plan da fila quando o usuário disparar a síntese.

---

# 10. Resumo da execução

<!-- Preenchido pelo REVISOR-executor. Append-only. -->

## Resumo da execução — 2026-08-12

**Resultado:** Concluído

**O que foi feito** — os 7 pontos da §2 e os 8 da emenda §2.0, todos em `specs/00-contexto.md`:

| # | Onde | Antes → Depois |
|---|---|---|
| 1 | §3, stack | *"Versão atual: 1.2.1 — e o 2.0.0 está pronto no worktree"* → a versão vive em `package.json`, a linha publicada é `git tag`, o motivo de cada MAJOR está em `03-versionamento-e-release` |
| 2 | §2, bullet do baseline | *"fecha em ZERO… as 8 métricas estão em 0… não há mais folga"* → **"o baseline NÃO é zero — compare com ele, nunca com zero"**, apontando `gates/baselines/audit-baseline.json` e a spec que ensina a lê-lo |
| 3 | §2, paridade | *"(hoje 409/409/409)"* → afirma a **convergência**; o número vive em `auditor_paridade` e `sarak-dev/state.json` |
| 4 | §2, `tsc` | *"não é zero (10 erros, todos em teste)"* → o `tsc` tem baseline próprio no mesmo JSON; **não presuma** |
| 5 | §3, comandos vitais | *"(8 auditores)"* → *"todos os auditores de `run_audit.mjs`"* |
| 6 | §8 | bullet inteiro do `design-token-ids.ts` **removido** (achado 22, fechado pela `plan-12`) |
| 7 | §2 e §4.1 | *"as 32 regras (29 verificáveis e 3 de conduta)"* → duas categorias + `grep -c "^## R"`; sem total |
| 8 | §1 | *"resolve 409 tokens"* → *"resolve o dicionário inteiro de tokens"* |
| 9 | §3, tabela de blocos | *"28 schemas → 409 tokens"* → *"28 schemas → o dicionário de tokens"* (**"28 schemas" ficou** — conferido, `ls src/core/Design/schema/*.ts` → 28) |
| 10 | §3 | ponteiro `§96` → referência ao arquivo, **sem seção** |
| 11 | §8 | *"14 achados abertos (de 31 numerados)"* → *"quantos estão abertos, só aquela spec diz"* |
| 12 | §8 | *"os 5 gates em fila e as 4 ampliações"* → *"a fila deles vive na seção de implementação posterior"* |
| 13 | §8 | *"Padrão recorrente, **ainda não medido**"* → *"Padrão recorrente e **JÁ MEDIDO**"*, apontando a matriz de cobertura e registrando que **R18 nasceu daí** |
| 14 | §8, bullet do ERP | *"lib **1.2.1**"* removido; o que importa ali é o modo de consumo (`file:` é cópia no store) |

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/00-contexto.md` | alterado | os 15 pontos acima — 34 inserções, 34 remoções |
| `specs/plan/plan-28-reconciliar-contexto.md` | alterado | emenda de escopo §2.0, passo 8 reescrito, `status`, este resumo |

**Verificações executadas**

- `grep -nE "409|304|1\.2\.1|2\.0\.0 está|8 auditores|32 regras|14 achados|5 gates|ZERO|§96|ainda não medido" specs/00-contexto.md` → **vazio**
- `grep -c "^> \*\*Como escrever:\*\*"` → **8** blocos de contrato, todos preservados
- `git diff --stat specs/00-contexto.md` → 1 arquivo, **34 inserções / 34 remoções**
- `wc -l specs/00-contexto.md` → **357**, idêntico a antes (o critério era não crescer)
- `npm run section-pointers:check` → `[OK] Nenhum ponteiro de seção (autorreferência) morto`
- `npm run dev-kit:check` → `kit em dia (3 arquivos, 0 ponteiros mortos)`
- `node gates/scripts/audit/run_audit.mjs` → `quebrou 2 regras estruturais` — **o baseline exato**, sem regressão

**Critérios de aceite**

- [x] Os sete pontos da §2 — evidência: linhas 1–7 da tabela acima
- [x] Nenhuma cifra de medição sobreviveu em §2, §3 e §4.1 — evidência: o `grep` vazio
- [x] Cada afirmação substituída nomeia a fonte viva — evidência: coluna "Depois"
- [x] O bullet do `design-token-ids.ts` saiu — `grep -n "304"` sem resultado
- [x] A instrução do `run_audit` **inverteu** — a palavra "zero" só aparece agora em *"nunca com zero"*
- [x] Os 8 blocos `> **Como escrever:**` presentes
- [x] `section-pointers:check` e `dev-kit:check` verdes
- [x] `git diff --stat` — `specs/00-contexto.md` é o único arquivo do alvo (mais a própria plan)
- [x] O arquivo não cresceu — 357 → 357

**Decisões e suposições**

- **A emenda de escopo (§2.0) é a decisão desta execução**, e está declarada **acima do resumo**, com data e
  medição. Ampliei de 7 para 15 pontos **antes de tocar no alvo**. O motivo: os oito extras são a mesma
  classe, no mesmo arquivo, e entregar um `00-contexto` "consertado" que ainda dissesse `409`, `1.2.1` e
  `14 achados` contradiria o objetivo da própria plan. **A plan foi ampliada uma vez, e só uma.**
- **"28 schemas" foi mantido** (ponto 9): é contagem de arquivo, conferida na hora, e não é medição que se
  move a cada plan — a regra dura vale para cifra que envelhece, não para toda cifra.
- No ponto 10, preferi **remover a seção** em vez de apontar a correta: o `auditor_sectionpointers` só
  resolve autorreferência, então um `§N` cross-documento não é verificável por gate nenhum e envelhece calado.
  Referência ao arquivo, com o assunto em prosa, é o que sobrevive a uma renumeração.

**Achados fora do escopo (não corrigidos)**

- `specs/00-contexto.md`, §8, bloco *"Aceito como característica"*, último bullet: *"O alinhamento do detector
  JS (`DeviceProvider`) **é** dívida e está na §3 da spec de dívida"*. **Não é mais dívida** — o achado 11
  fechou com a `plan-08` (F5, 2026-08-04), e `15-divida-conhecida` §6 registra o fechamento; o `DeviceProvider`
  recebe os breakpoints do tema por contexto desde então. Além disso, o `§3` ali é ponteiro cross-documento,
  que resolve contra a §3 **deste** arquivo e por isso passa no gate apontando para o lugar errado.
  **Sugestão: passo novo na plan-29** — é a mesma classe que ela já trata.

**Pendências / riscos**

- Nenhuma. Nenhum arquivo fora de `specs/` foi tocado; o baseline do `run_audit` está intacto.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-12 — 🟢 Aprovado

> ⚠️ **Declaração de conflito de papel.** Esta plan foi **executada e verificada pela mesma pessoa** — é o
> desvio previsto em [[00-contexto]] para plan que só toca `specs/`, mas ele **remove a independência** que dá
> valor ao veredito. Por isso a verificação abaixo é toda por **comando com saída**, nunca por leitura do
> resumo: o que aprova é o `grep` e o `git diff`, não a memória de quem editou.

**O que verifiquei, e como**

| Verificação | Comando | Saída real |
|---|---|---|
| Escopo — nada além do alvo | `git diff --stat` | `specs/00-contexto.md` (34+/34−) e a própria plan. **Zero arquivo fora de `specs/`** |
| Diff lido **integralmente**, linha a linha | `git diff specs/00-contexto.md` | **15 blocos alterados, todos declarados** na §2 ou na emenda §2.0. Nenhuma alteração não prevista |
| Cifra residual | `grep -nE "409\|304\|1\.2\.1\|8 auditores\|32 regras\|14 achados\|5 gates\|ZERO\|§96\|ainda não medido"` | **vazio** |
| Contrato de manutenção intacto | `grep -c "^> \*\*Como escrever:\*\*"` | **8** — os mesmos de antes |
| Tamanho | `wc -l` | **357 → 357**. O critério era não crescer |
| Ponteiro de seção | `npm run section-pointers:check` | `[OK] Nenhum ponteiro de seção (autorreferência) morto` |
| Ponteiro de caminho/comando | `npm run dev-kit:check` | `kit em dia (3 arquivos, 0 ponteiros mortos)` |
| Regressão | `node gates/scripts/audit/run_audit.mjs` | `quebrou 2 regras estruturais` — **o baseline exato**, os mesmos dois auditores |

**Duas decisões do executor que eu confirmei em vez de aceitar**

1. **O bullet do `run_audit` na §8 foi REMOVIDO, não reescrito** — enquanto o da §2 foi reescrito. Confirmei
   que está certo: a §2 passou a carregar a instrução correta, e repeti-la na §8 criaria a duplicata que esta
   base proíbe. A §8 é *estado e pendências*, e o bloco `> **Como escrever:**` dela manda **item resolvido
   sair**. Uma afirmação falsa sobre o estado, com a verdade já dita na §2, não tem o que fazer ali.
2. **"28 schemas" ficou** (ponto 9). Conferi: `ls src/core/Design/schema/*.ts` → **28**. A regra dura desta
   plan é contra **cifra que envelhece**, não contra toda cifra — e contagem de arquivo de schema não se move
   a cada plan de gate. Manter foi o julgamento certo; apagá-la seria aplicar a regra sem entendê-la.

**A emenda de escopo — por que ela não é scope creep**

Ampliar escopo no meio da execução é, normalmente, motivo de reprovação. Aqui não é, por três razões
verificáveis no próprio artefato:

- ela foi feita **antes de tocar no alvo**, e está registrada **no corpo da plan** (§2.0), com data e medição
  — não escondida no resumo;
- os oito pontos são **a mesma classe, no mesmo arquivo**, e a §2 original os teria incluído se o levantamento
  tivesse sido por varredura em vez de por leitura;
- a plan foi ampliada **uma vez**, e o passo 8-bis fechou a porta para uma segunda — o que se comprovou: o
  16º ponto encontrado depois **não** foi corrigido, foi registrado.

**A lição que fica registrada, e vale mais que a correção**

Levantei os sete pontos **lendo por seção**; a varredura por padrão, feita só ao começar a executar, achou
**mais oito**. É a lição de [[006-zero-marca-soberania-host]] na forma inversa: *grep por uma string não é
auditoria* — **e leitura sem varredura também não é**. Quem escrever a próxima plan de reconciliação **varre
antes de fechar o escopo**.

**Roteamento do achado fora do escopo**

O 16º ponto (o bullet do `DeviceProvider` na §8, que ainda chama de dívida o achado 11, fechado pela
`plan-08` F5) **não** fica como nota solta neste veredito: virou **passo declarado na plan-29**, que é a plan
irmã e trata exatamente esta classe.

**Liberado.** As alterações estão no worktree, sem commit.
