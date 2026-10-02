---
tipo: "plan"
titulo: "Dar gatilho e trava às regras de processo que a prática furou"
objetivo: "Fazer cada regra de processo que só existia em prosa ganhar um gatilho mecânico ou ser reescrita para o que a prática mostrou ser exequível"
dominio: "Governança de Specs (SDD) / Operação Git"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "processo", "sdd", "git", "hook"]
relacionados: ["[[00-prompt-executor]]", "[[00-prompt-revisor]]", "[[17-contrato-de-operacao-git]]", "[[02-enforcement-por-commit]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md + specs/02-enforcement-por-commit.md + specs/17-contrato-de-operacao-git.md"
---

# 1. Objetivo

Sete regras de processo deixam de depender de alguém lembrar: cinco ganham um **gatilho** escrito no ponto
em que são exercidas, uma é **reescrita** para o que é exequível, e a proibição de o agente commitar ganha
uma **trava no hook**.

# 2. Contexto

Cada item abaixo é uma regra que existe em prosa e foi furada na prática, com a ocorrência medida. O que as
une é a causa: **o worktree e os documentos de processo são compartilhados por várias sessões de agente, e
nada declara nem cobra quem é dono de quê.**

| # | O que aconteceu | Onde a regra mora hoje |
|---|---|---|
| A | Um executor rodando em paralelo propôs `git checkout --` em cerca de 35 arquivos alheios, achando que eram efeito colateral próprio — teria apagado entregas não commitadas de três plans. **O prompt de execução não avisa que o worktree contém trabalho de outras tarefas** | `00-prompt-revisor.md` §5.3 · `00-prompt-executor.md` §2 e §7 |
| B | O executor pulou o `status: "🟡 Em execução"` antes da primeira edição em **seis execuções seguidas**, todas autodenunciadas no resumo | `00-prompt-executor.md` §2 · `00-indice.md` §2 |
| C | A proibição de `git stash` tira do executor o único mecanismo que produz um **controle em `HEAD` limpo** — a evidência mais forte para separar regressão de intermitência. Já foi usado duas vezes, contra a regra | `00-prompt-executor.md` §7, item 11 |
| D | Duas sessões de revisor revisaram a mesma plan em paralelo e gravaram vereditos conflitantes na mesma seção append-only — um deles já vencido ao ser escrito | `00-prompt-revisor.md` §7 |
| E | O bloco `## Síntese`, que o revisor escreve na plan *"para aparecer no diff do commit de remoção"*, **nunca chega ao Git**: síntese e remoção saem na mesma ação, e o diff de uma deleção mostra o conteúdo do `HEAD`, onde o bloco novo não está | `00-prompt-revisor.md` §7.4 · `_templates/template-plan.md` §11 |
| F | Um executor **commitou** (`bd1dc1a`), com os gates verdes e sem coautoria. Outros dois indexaram os próprios arquivos. A proibição é só textual: nenhum anel do `pre-commit` pergunta quem está commitando | `00-contexto.md` §7 · `specs/17-contrato-de-operacao-git.md` §2.0 |
| G | As listas numeradas de proibições dos dois prompts são citadas **por número** de fora (`00-contexto.md:305` cita `[[00-prompt-executor]] §7.3`), e por isso os dois arquivos carregam uma nota dizendo que item novo só pode entrar no fim. O `section-pointers:check` ignora ponteiro entre documentos e não veria a quebra | `00-prompt-executor.md` §7, item 11 · `00-prompt-revisor.md` §9, item 11 |

**O que foi medido para a trava do item F** (2026-10-02, dentro de uma sessão do Claude Code): o ambiente do
shell do agente carrega `CLAUDECODE`, `AI_AGENT` e `CLAUDE_CODE_SESSION_ID`. O terminal do dono não carrega
nenhuma das três. Os marcadores de outros agentes **não foram medidos**.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `specs/00-prompt-executor.md` — §2 (ritual), §3 (o procedimento do item C), §4 (checklist), §7 (proibições).
- `specs/00-prompt-revisor.md` — §5.1, §5.3, §7.1 a §7.4, §9 e §10.
- `specs/_templates/template-plan.md` — o campo `status` do frontmatter e a §11.
- `specs/00-indice.md` — **só** a legenda da §2 (a linha do 🟡 e a nota de quem move o quê) e o último item
  da §5.
- `specs/00-contexto.md` — **só** a citação por número da linha 305 e o diagrama da §5, se ele citar o 🟡.
- `.githooks/pre-commit` e `.githooks/pre-push` — a chamada da trava do item F.
- `gates/scripts/contrato/` — o script da trava e o teste dele em `gates/scripts/contrato/__tests__/`.
- `.agents/skills/git-ci-cd/SKILL.md` — como o agente autorizado passa pela trava. O mesmo arquivo aparece
  duas vezes no `git status` (`.claude/skills` é symlink rastreado sob os dois prefixos): é esperado.
- `sarak-dev/` — regenerado por `npm run dev-kit`. Nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- `specs/specs/`, `specs/arquitetura/` e `specs/adr/` — a regra nova e o inventário de gates entram na
  síntese, pelo revisor (§8).
- `gates/scripts/segredo/` — o Anel 0 fica como está.
- `gates/scripts/contrato/check-section-pointers.mjs` — resolver ponteiro entre documentos continua fora; o
  item G se fecha deixando de citar por número.
- Qualquer mudança no fluxo SDD além dos sete itens — inclusive "melhorias" de redação nos dois prompts.
- `src/`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/17-contrato-de-operacao-git.md` | §2.0 (a fronteira é mutação, e a porta da autorização) e §3 (as proibições que autorização nenhuma dissolve) |
| Spec fixa | `specs/adr/012-escrita-git-sob-autorizacao-do-dono.md` | a decisão que a trava do item F passa a cobrar |
| Spec fixa | `specs/specs/02-enforcement-por-commit.md` | §2 (os anéis) e §5 (o que uma mensagem de bloqueio precisa trazer) |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R18 — todo gate declara, no próprio código, o que não vê |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | como ler cada gate antes de rodar |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §3.5 — por que o controle em `HEAD` limpo importa |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | o teste da trava |
| **Skill** | `git-ci-cd` | é a skill que instrui o commit autorizado — e é editada aqui |
| Código | `.githooks/pre-commit` · `.githooks/pre-push` | ler antes de editar |
| Código | `gates/scripts/contrato/check-trail-citation.mjs` | o idioma de um gate de contrato: cabeçalho de limites, função exportada e parametrizável, teste por fixture |

# 5. Instruções de execução

Os textos abaixo dizem **o que cada documento passa a afirmar**. A redação final é sua, no tom do documento
vizinho; o conteúdo, não.

1. **Item A — a fotografia do worktree.**
   - `00-prompt-executor.md` §2 ganha um passo, depois da leitura e antes da primeira edição: rodar
     `git status --short` e guardar a saída. Ela entra no resumo (§5 daquele arquivo) num campo novo,
     *Estado do worktree ao iniciar*.
   - `00-prompt-executor.md` §7 ganha a proibição: arquivo que já estava modificado na fotografia **não é
     seu** — não reverta, não restaure, não formate, não "limpe". Arquivo que aparece modificado e você não
     tocou: pare e relate.
   - `00-prompt-revisor.md` §5.3 passa a dizer que, havendo no worktree trabalho não commitado de outra
     tarefa, o prompt de execução carrega **a linha circunstancial que o nomeia** — é o caso que a própria
     §5.3 já prevê para linha extra.
2. **Item B — o 🟡 muda de mão.** Quem move a plan para `🟡` passa a ser o **revisor, ao entregar o prompt de
   execução para despacho**, na mesma ação em que roda `npm run plan-index`. O executor deixa de ter essa
   transição: a plan chega a ele em `🟡`, e ele só move para `🟠` ao entregar. Ajuste, de forma coerente:
   o ritual e o checklist do `00-prompt-executor.md`; a §5.3 e o checklist do `00-prompt-revisor.md`; o
   comentário do campo `status` no `template-plan.md`; a linha do 🟡 e a nota *"Quem move para cá"* da §2 do
   `00-indice.md`, mais o último item da §5 dele.
3. **Item C — o controle em `HEAD` limpo, sem escrever no Git.** `00-prompt-executor.md` §3 ganha o
   procedimento sancionado: exportar o `HEAD` para um diretório temporário **fora do repositório**
   (`git archive` é leitura), dar a ele acesso ao `node_modules` do repositório, rodar ali o arquivo de teste
   em questão, e desfazer. O `stash` continua proibido. **Execute o procedimento uma vez de verdade** antes
   de escrevê-lo, e registre no resumo: o `git status --short` do repositório antes e depois (têm de ser
   idênticos) e a saída do teste rodado na cópia.
   ⚠️ Se o acesso ao `node_modules` for por junção ou link, o texto manda **remover o link antes de apagar o
   diretório** — apagar recursivamente com o link dentro pode apagar o `node_modules` de verdade.
4. **Item D — um revisor por plan.** `00-prompt-revisor.md` §7 passa a mandar: **imediatamente antes de
   gravar um veredito, releia a §10 da plan no disco**. Bloco de veredito que você não escreveu nesta
   conversa significa outra sessão de revisor no comando — pare e leve ao dono, que decide qual sessão
   comanda. Entra também no checklist da §10.
5. **Item E — o rastro da síntese vai para onde o Git o guarda.** Em `00-prompt-revisor.md` §7.4, *Como
   fechar* deixa de pedir o bloco `## Síntese` na plan. No lugar: a linha de **destino demonstrado** na nota
   da §1 do `00-indice.md` (o que foi transportado e para onde), e o **texto da mensagem de commit**, entregue
   ao dono na conversa. Remova a §11 do `template-plan.md`, e ajuste a linha *Resumo / Veredito / Síntese* da
   §5.1 e o checklist da §10 do revisor.
6. **Item G — citar pelo nome, nunca pelo número.** `00-contexto.md:305` passa a citar a proibição pelo que
   ela diz. Nos dois prompts, a nota entre parênteses do item 11 das listas de proibição dá lugar à regra:
   *os itens desta lista são citados de fora pelo nome, nunca pelo número*.
7. **Item F — a trava.** Um script em `gates/scripts/contrato/`, chamado como **primeiro passo** do
   `pre-commit` e do `pre-push`, que bloqueia quando o ambiente carrega marcador de sessão de agente e **não**
   carrega a variável de autorização. Requisitos:
   - a decisão mora numa função exportada que recebe o ambiente por parâmetro — é o que permite o teste por
     fixture, sem depender do ambiente de quem roda a suíte;
   - a lista de marcadores é **dado**, num lugar só; entram os três medidos em §2, e nenhum que não tenha
     sido medido;
   - a variável de autorização vale para **aquele comando** — o agente autorizado a escreve na frente do
     `git commit`, nunca a exporta;
   - a mensagem de bloqueio é acionável: diz a regra, o motivo e como o dono autoriza;
   - o cabeçalho declara os limites (R18). No mínimo: só cobre `commit` e `push` (não há hook para `add`,
     `stash` nem `checkout`); um agente pode escrever a variável por conta própria — a trava transforma
     acidente em ato deliberado, não impede intenção; agente cujo marcador não está na lista passa.
8. **Teste da trava** — uma asserção por caso: ambiente limpo libera; cada marcador sozinho bloqueia;
   marcador com autorização libera; autorização sem marcador libera.
9. `.agents/skills/git-ci-cd/SKILL.md` passa a dizer como o agente **autorizado** commita com a trava em
   vigor.
10. `npm run dev-kit`. Depois: `npm run dev-kit:check`, `npm run section-pointers:check`,
    `npm run gate-limits:check`, `npm run plan-index:check` e `npx vitest run --maxWorkers=4 gates/` → verdes.

# 6. Critérios de aceite

- [ ] **A** — o ritual do executor manda fotografar o worktree antes da primeira edição; o formato do resumo
      tem o campo; a proibição de mexer no que não é seu está na lista; a §5.3 do revisor manda nomear
      trabalho alheio no prompt.
- [ ] **B** — nenhum dos quatro documentos atribui o `🟡` ao executor; todos dizem que é do revisor, ao
      entregar o prompt para despacho.
- [ ] **C** — o procedimento está no `00-prompt-executor.md`, foi executado de verdade, e o resumo mostra o
      `git status --short` idêntico antes e depois, mais a saída do teste na cópia. O aviso do link está no
      texto.
- [ ] **D** — a releitura da §10 antes de gravar veredito está na §7 e no checklist do revisor.
- [ ] **E** — nenhum documento pede mais o bloco `## Síntese` na plan; o molde não tem mais a §11; a §7.4
      nomeia os dois lugares onde o rastro passa a viver.
- [ ] **G** — `grep -rnE "prompt-(executor|revisor)[^§]{0,12}§[79]\.[0-9]+" specs --include=*.md` não
      encontra citação de fora, fora de `specs/plan/`.
- [ ] **F** — rodar o `pre-commit` com um marcador no ambiente e sem autorização **bloqueia**, com mensagem
      acionável, antes de qualquer outro passo. O caminho liberado é provado **pelo teste** (os quatro casos
      do passo 8), não rodando o hook: adiante ele indexa `.agents/index.md`, e isso é escrita no Git.
- [ ] A skill `git-ci-cd` descreve o commit autorizado com a trava.
- [ ] `dev-kit:check`, `section-pointers:check`, `gate-limits:check` e `plan-index:check` verdes; suíte de
      `gates/` verde.

# 7. Como verificar (uso do revisor)

**Gate:** regra nova — *agente não commita nem empurra sem autorização declarada naquele comando*. O número
dela é atribuído na síntese. É regra de gate porque vale para a **relação** entre todas as sessões que
compartilham o repositório; nenhum teste de módulo enxerga isso.

- `git status` + `git diff --stat` → só os arquivos de §3.1.
- Leitura integral do diff dos dois prompts, do molde e do índice → os sete itens, e nada além deles.
- Mutação da trava sem tocar o worktree: importar a função exportada e chamá-la com ambiente sintético —
  cada marcador de §2 bloqueia; com a autorização, libera; ambiente vazio libera.
- `sh .githooks/pre-commit` com `CLAUDECODE=1` no ambiente e nada em staging → bloqueia **antes** do Anel 0.
- Releitura do procedimento do item C contra o resumo → o `git status --short` antes e depois confere.
- O `grep` do critério G → vazio.
- `npm run dev-kit:check` · `npm run section-pointers:check` · `npm run gate-limits:check` ·
  `npm run plan-index:check` → verdes.
- `npx vitest run --maxWorkers=4 gates/` → verde.

# 8. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md + specs/02-enforcement-por-commit.md + specs/17-contrato-de-operacao-git.md`

Os cinco documentos de processo (`00-prompt-executor`, `00-prompt-revisor`, o molde, `00-indice` e
`00-contexto`) são editados **pela própria execução** — estão no escopo. O que sobra para a síntese é a
trava:

- **`00-regras-e-invariantes`** — a regra nova, com o próximo número livre: enunciado, por quê, certo ×
  errado, o gate que a cobra e o vão declarado. A contagem da §1.3 acompanha.
- **`01-gates-e-baseline`** §2.2 e §2.2.1 — a linha do gate no catálogo e na tabela de onde cada um roda.
- **`02-enforcement-por-commit`** §2 — a trava como primeiro passo dos dois hooks, antes do Anel 0.
- **`17-contrato-de-operacao-git`** §2.0 — a porta da autorização passa a ter forma mecânica: a variável
  escrita na frente do comando.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
