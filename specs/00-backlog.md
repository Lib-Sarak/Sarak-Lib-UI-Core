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
| 3 | `.agents/skills/git-ci-cd/SKILL.md:785-786` cita `00-prompt-executor.md:165` e `00-prompt-revisor.md:67`/`:246` por **número de linha**, e já não apontam para a regra de co-autoria desde antes da `plan-87` (no `HEAD` eram uma linha vazia, uma de 3 caracteres e outro item) — citar pelo nome | `plan-87` | 2026-10-03 | baixo |
| 4 | `.agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts` importa `GLOBAL_THEMES`, que já não existe — o script quebra ao rodar | `plan-88` (lote 2) | 2026-10-04 | médio |
| 5 | `gates/scripts/audit/verify_contrast.ts` (cabeçalhos) e `specs/09-temas` (`§6.5`) citam plan-24/plan-26; a R36 só barra citação nova em linha adicionada, então a trilha antiga fica | `plan-88` (lote 2) | 2026-10-04 | baixo |
| 6 | `collectEmittedSarakCssVars.mjs` só lê a engine; `--sarak-font-size` é emitida em runtime por `src/styles/_typography.css:14-18` (sob `[data-font-scale]`) e não consta de `tokens.cssVars`. Além disso o `manifest.ts` lista em `vars:` seis nomes sem emissor (`--sarak-palette`, `--sarak-error-color`, `--sarak-success-color`, `--sarak-warning-color`, `--sarak-card-border`, `--sarak-font-scale`) e o ERP já os consome | `plan-92` (lote 2) | 2026-10-04 | médio |
| 7 | O catálogo de tokens (`src/core/Design/catalog/partitions/*.json`) tem **7 `tokenId` duplicados** (`colorBgBody` e `colorBgLayer1` aparecem com o sufixo "- Duplicado" no `name`, entre outros) e **28 entradas sem `name` nem `tags`** (por exemplo `inputErrorColor`, `inputPadding`, `inputSuccessColor`); a tela cai no `label` do schema e a busca fica sem material para esses | ritual (medido ao escrever a `plan-99`) | 2026-10-04 | baixo |
| 8 | O painel de temas tem **duas taxonomias de pilar**: 7 em `src/features/DesignEngine/config/design-pillars.json` (a tela principal) e 6 em `SOVEREIGN_PILLARS` (`src/features/DesignEngine/Panels/hooks/useSovereignSearch.ts:6-13`, o Command Center — "Fundação (DNA)", "Core Engine"); a mesma coisa tem nome diferente conforme a tela. Decidir se o Command Center deixa de existir (a busca nova e a tabela do catálogo cobrem o uso) ou passa a ler o JSON de pilares | análise do painel (2026-10-05), `plan-100` | 2026-10-05 | médio |
| 9 | O token `navigationStyle` (`src/core/Design/schema/global.ts:24-29`) continua oferecendo a opção **`dock`** ("Doca Flutuante") e o catálogo a lista (`partitions/navigation_style.json`), mas nenhum cromo a implementa desde que o `SarakShell` saiu — `useNavigationStyle` a trata como sidebar e o `SarakShellNav` a lê como vertical. Oferta sem consumidor no painel; decidir entre remover a opção (MAJOR no schema) ou implementá-la no `SarakAppChrome` | síntese da `plan-94` (ADR-018) | 2026-10-05 | médio |
| 2 | `gates/scripts/audit/verify_contrast.ts:35-49` (limite 5 do cabeçalho) justifica deixar `statusErrorColor`/`statusSuccessColor` fora de `PAIRS` porque `--sarak-status-*-color-bg` "nunca é emitida" — mas ela é (consta de `tokens.cssVars` em `sarak-ui/catalog.json`; achado 38 da `15-divida-conhecida`, fechado como não reprodutível). O cabeçalho afirma o falso e o par de texto de status pode entrar na medição; é o que segura a R31 em ⚠️ | síntese da `plan-88` | 2026-10-05 | médio |
| 10 | Procedência citando plan removida, em dois lugares que nenhum gate lê: os comentários do `.githooks/pre-commit` (linhas 46, 69, 94, 103 e 146) e a coluna *Cobra* da `01-gates-e-baseline` (`§2.2`), em que várias linhas trazem a plan de origem entre parênteses. O `trail-citation:check` só lê linha adicionada de código, e spec fica fora dele. Junto: o corpo de `anel1()` imprime `(specs/specs/00-regras-e-invariantes.md)` mesmo quando o rótulo é `—` + outra spec, o que manda o leitor ao arquivo errado | via direta (rótulos do Anel 1) | 2026-10-06 | baixo |
| 11 | A lib não faz rede (`10-seguranca-e-acessibilidade` `§3.2`) e **nenhum gate guarda isso**: o `auditor_authcoupling` só acusa rota de autenticação e sink de credencial, então um `fetch` ou cliente HTTP novo em `src/` sem rota de auth passaria. Candidato a gate de porta única, como o `icon-port:check` | síntese da `plan-96` | 2026-10-07 | médio |
| 1 | `src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx:61` mocka `core/Design/master-map` sem `sarakGetDefaultDesignState`, que `Main/utils/exportTheme.ts:18` importa; o stderr da CI acusa `No "sarakGetDefaultDesignState" export is defined` e o teste "exporta o tema como JSON" passa mesmo assim — talvez sem provar o que promete (resíduo do rename `965bc44`) | ritual (log da CI do `80785e5`) | 2026-10-03 | médio |

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
