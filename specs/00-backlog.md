---
tipo: "processo"
titulo: "Backlog — Achados Registrados, Não Agendados"
dominio: "Governança de Specs (SDD)"
status: "🟢 Vigente"
tags: ["processo", "backlog", "achados", "sdd"]
relacionados: ["[[00-indice]]", "[[00-prompt-revisor]]", "[[00-prompt-executor]]"]
---

# 0. O que é este arquivo

O lugar onde um achado **descansa**. Nem executado, nem esquecido.

Antes deste arquivo existir, um problema encontrado no meio do caminho tinha só dois destinos: virar
trabalho **agora** (uma plan nova, um ciclo inteiro) ou se perder. Como a doutrina proíbe perder, tudo
virava trabalho — e cada execução gerava as próximas, sem caso-base. Este arquivo é o caso-base.

**Um item aqui não é uma plan.** Não tem `NN`, não tem status, não entra em fila, ninguém o executa. É uma
linha dizendo *"isto existe e alguém olhou"*. Só vira trabalho quando **o usuário** manda — e aí passa pela
triagem normal ([[00-prompt-revisor]] §4) como qualquer outra demanda.

**Quem escreve:** o **revisor**, sempre. O executor **relata** achados no resumo dele (é o formato da
[[00-prompt-executor]] §5); quem transcreve para cá é o revisor, no veredito.
**Quem promove:** só o **usuário**. Nenhum agente decide sozinho que chegou a hora de um item.
**Quem remove:** quem promoveu (o item sai daqui quando vira plan ou prompt direto) — ou o revisor, ao
registrar um achado novo (§4), quando encontra um antigo que deixou de valer. O usuário pode podar a
qualquer momento.

---

# 1. A regra que este arquivo sustenta

> **Achado descoberto durante a execução da plan-N não vira trabalho antes da plan-N fechar.**

Sem exceção. Ele desce para cá, e o ciclo em andamento termina primeiro. Isso é o que impede o aninhamento:
uma execução nunca abre outra execução por dentro.

Três coisas alimentam este arquivo:

| Origem | Quem traz | Quando |
|---|---|---|
| Achado fora do escopo | executor, no resumo | o revisor transcreve no veredito |
| Divergência entre spec fixa e código | revisor, no ritual de entrada | ao encontrar |
| Ressalva relevante que não reprova a execução | revisor, no veredito | ao aprovar |

**Nada aqui é urgente por estar aqui.** Se um achado é grave a ponto de não poder esperar, ele não é backlog
— é uma demanda que o revisor leva ao usuário na hora, em texto livre, e que vira plan ou prompt direto pela
via normal.

---

# 2. A tabela

> **Como escrever:** uma linha por achado, e **uma linha só**. Se você precisa de um parágrafo, o item não é
> achado — é uma demanda; leve ao usuário.
>
> - **#** — sequencial simples. Reaproveitável: sai um, o número volta a ficar livre. Isto **não** é `plan-NN`.
> - **Achado** — o que há de errado, em uma frase, com `arquivo:linha` quando existir.
> - **Origem** — `plan-NN`, `via direta` ou `ritual`. Rastreia de onde veio, sem prender o item a nada.
> - **Registrado em** — data absoluta (`AAAA-MM-DD`).
> - **Peso** — `alto` · `médio` · `baixo`. É uma dica ao usuário, não uma fila: nada aqui é agendado.

| # | Achado | Origem | Registrado em | Peso |
|---|---|---|---|---|
| 1 | `§N.M` como ponteiro cross-documento é frágil por construção: [[00-prompt-executor]] §7 e [[00-prompt-revisor]] §9 são listas numeradas citadas por número de fora, e o `section-pointers:check` ignora referência cross-documento (não enxerga a quebra) | plan-55 | 2026-09-02 | médio |
| 2 | `specs/adr/README.md` — a tabela "Os ADRs desta base" não lista o `adr/012-escrita-git-sob-autorizacao-do-dono.md` (criado pela plan-55); índice de navegação defasado, o ADR em si é válido | plan-55 | 2026-09-02 | baixo |
| 3 | [[07-responsividade-e-multidispositivo]] §2.1 e §6 citam linhas defasadas do cromo: `TopbarNav.tsx:111` (real 117), `SarakShell.tsx:86` (real 89), `useShellLayoutStyles.ts:33` (real 32), `ShellContent.tsx:54` (real 55) — os fatos estão certos, os ponteiros não | ritual | 2026-09-08 | baixo |
| 4 | [[04-shell-e-discovery]] §7.3 afirma que `SidebarNav.tsx:142` consome `--sarak-sidebar-active` enquanto a engine emite `--sarak-sidebar-active-color`, e que os consumos não resolvem — a ghost var JÁ FOI corrigida (`SidebarNav.tsx:152`, `TopbarNav.tsx:137-138` consomem o nome com `-color`); a spec ficou para trás | ritual | 2026-09-09 | médio |
| 5 | Comentários citando `plan-NN` são dívida pré-existente e disseminada no código (ex.: `check-container-query-boundary.mjs:1` cita `plan-41`; `grep -rlE "plan-[0-9]+" src gates` cobre dezenas) — `padrao-escrita`, `references/comentarios.md:84` proíbe, e cada plan sintetizada transforma a citação em ponteiro morto | plan-57 | 2026-09-08 | médio |
| 6 | A intermitência da suíte escalou muito além do que [[11-testes-e-cobertura]] §3.5 registra: as amostras de lá são 26 e 20 execuções com zero falhas; em 2026-09-08 foram 4 execuções vermelhas em 5, sempre por timeout e sempre verdes isoladas (`SarakPDFViewerImpl`, `generate-token-types.check`) | plan-57 | 2026-09-08 | médio |
| 7 | [[01-gates-e-baseline]] §7 (critérios de aceite) cita "o Playwright, que declara **não** cobrar regra nenhuma" como gate vivo — o aparato foi removido em 2026-08-18 ([[11-testes-e-cobertura]] §7); a mesma linha fixa "os 5 scripts de check", número que envelheceu | síntese plan-57 | 2026-09-08 | baixo |
| 8 | `LiveDraftPreviewFrame`/`PreviewSystemRenderer` não renderizam `SarakBackgroundRenderer`: escolher mídia de fundo vira `bg-transparent` sobre `--theme-surface` e a mídia nunca aparece no Gêmeo Digital — idêntico na v2.2.9, não é regressão | ritual | 2026-09-09 | médio |
| 9 | `PresetsCatalog.tsx:104` chama `sarak.setResolvedThemeId(theme.id)` num clique que (pós plan-63) só previsualiza — mas `resolvedThemeId` é estado do PROVIDER (`useResolvedThemeId.ts:15`), compartilhado com o `ShellThemeToggle`, que aplica com `applyFullConfigRaw` direto no sistema: um tema só previsualizado pode entrar no sistema pela porta lateral do toggle do cromo. O JSDoc daquele hook ainda afirma que só quem APLICA um tema chama `setResolvedThemeId` | plan-63 | 2026-09-09 | médio |
| 10 | [[00-prompt-executor]] §7 item 11 proíbe `git stash` ao executor, mas ele é o único mecanismo que produz um CONTROLE em HEAD limpo — a evidência mais forte para separar regressão de intermitência; usado duas vezes (plan-58, plan-60), sempre com worktree restaurado. O processo precisa oferecer uma porta sancionada | plan-60 | 2026-09-08 | médio |
| 11 | O executor pulou o `status: "🟡 Em execução"` antes da primeira edição em duas execuções seguidas (plan-58 e plan-60), autodenunciando nas duas — a transição existe para o `plan-index:check` e para evitar execução concorrente; se ela é sempre esquecida, ou o ritual precisa de gatilho ou a regra precisa mudar | plan-60 | 2026-09-08 | baixo |
| 12 | `SarakAppChrome.tsx` fechou a plan-61 em 249 linhas por `wc -l` e **250 pela contagem do gate** — exatamente no teto da R9 (`auditor_cleancode` conta pela API do TS, um a mais que `wc -l` quando o arquivo termina em nova linha). As plans 66 e 67 editam esse arquivo de forma substancial: a primeira linha nova o reprova, então as duas precisam extrair antes de acrescentar | plan-61 | 2026-09-09 | médio |
| 13 | Os prompts de execução em paralelo não avisam que o worktree contém trabalho de outras plans — o executor da plan-62 propôs `git checkout --` em ~35 arquivos alheios, achando que eram efeito colateral próprio, e teria apagado as entregas não commitadas das plans 61, 63 e 65. A disjunção por arquivo protege o veredito do revisor, não a percepção do executor | plan-62 | 2026-09-09 | alto |

---

# 3. Promover um item

Só o usuário dispara. Ao promover, o **revisor**:

1. Tria o item pela [[00-prompt-revisor]] §4 — plan se deixa verdade documentada, prompt direto se não.
2. Conduz a via escolhida como qualquer outra demanda.
3. **Remove a linha daqui**, na mesma ação. Item promovido não fica de lembrança: a partir daí quem responde
   por ele é o [[00-indice]] (se virou plan) ou a própria conversa (se virou prompt direto).

Promover **não** é obrigatório e não tem prazo. Um item pode ficar aqui indefinidamente sem que isso seja
dívida — é exatamente para isso que ele existe.

---

# 4. Regras de manutenção

- **Este arquivo não cresce sem limite, e o dreno tem gatilho.** Ele registra o que **ainda** é verdade.
  **Ao registrar um achado, o revisor relê os que já estão aqui** — é a única vez em que alguém abre o
  arquivo inteiro, e por isso é onde ele se drena. Achado corrigido de passagem por outra tarefa, código que
  deixou de existir, problema que a spec fixa passou a permitir: a linha **sai** na mesma ação, e o revisor
  diz isso na resposta. Regra de limpeza sem gatilho não roda — foi assim que o índice virou cemitério.
- **Não duplique.** Antes de registrar, procure — o mesmo achado visto em duas execuções é uma linha só.
- **Sem status, sem dono, sem prazo.** Se você sentiu falta de um desses campos, o item não é backlog: é
  plan. Promova ou deixe.
- **Nunca referencie um item daqui dentro do código.** Vale a mesma regra da plan: comentário não cita
  `backlog #3` (norma completa em `padrao-escrita`, `references/comentarios.md`).
- **Item que já está numa plan não fica aqui.** Um dos dois é a verdade — e é o [[00-indice]].
