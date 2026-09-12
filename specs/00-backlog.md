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
| 2 | [[07-responsividade-e-multidispositivo]] §2.1 e §6 citam linhas defasadas do cromo: `TopbarNav.tsx:111` (real 117), `SarakShell.tsx:86` (real 89), `useShellLayoutStyles.ts:33` (real 32), `ShellContent.tsx:54` (real 55) — os fatos estão certos, os ponteiros não | ritual | 2026-09-08 | baixo |
| 3 | [[04-shell-e-discovery]] §7.3 afirma que `SidebarNav.tsx:142` consome `--sarak-sidebar-active` enquanto a engine emite `--sarak-sidebar-active-color`, e que os consumos não resolvem — a ghost var JÁ FOI corrigida (`SidebarNav.tsx:152`, `TopbarNav.tsx:137-138` consomem o nome com `-color`); a spec ficou para trás | ritual | 2026-09-09 | médio |
| 4 | Comentários citando `plan-NN` são dívida pré-existente e disseminada no código (ex.: `check-container-query-boundary.mjs:1` cita `plan-41`; `grep -rlE "plan-[0-9]+" src gates` cobre dezenas) — `padrao-escrita`, `references/comentarios.md:84` proíbe, e cada plan sintetizada transforma a citação em ponteiro morto. **Custo medido nesta campanha: seis rodadas de correção gastas só nesta regra** (plans 63, 64, 71, 67 — esta duas vezes —, e 73; na 73 o próprio revisor deixou passar na primeira revisão, o que mostra que a checagem manual falha dos dois lados), porque nada a cobra mecanicamente e o precedente morre junto com a plan sintetizada. A variante nova é *"achado N do veredito de AAAA-MM-DD"*, que aponta para dentro da plan do mesmo jeito. Um gate textual sobre o **diff** (não sobre o legado) — `plan-[0-9]+`, `achado [0-9]+`, `veredito de` em `src/`, `gates/` e `scripts/` — fecha a classe sem exigir limpar a dívida antiga primeiro | plan-57 | 2026-09-08 | **alto** |
| 5 | A intermitência da suíte escalou muito além do que [[11-testes-e-cobertura]] §3.5 registra: as amostras de lá são 26 e 20 execuções com zero falhas; em 2026-09-08 foram 4 execuções vermelhas em 5, sempre por timeout e sempre verdes isoladas (`SarakPDFViewerImpl`, `generate-token-types.check`). **Em 2026-09-10 passou a bloquear o gate de release:** `npm run gates:full` caiu na etapa `coverage:check` em 4 de 5 execuções (3 do executor da plan-67, 1 do revisor), sempre por timeout nos mesmos dois arquivos, que passam isolados — e como a etapa aborta, **o piso de cobertura não chega a ser medido** | plan-57 | 2026-09-08 | **alto** |
| 6 | [[01-gates-e-baseline]] §7 (critérios de aceite) cita "o Playwright, que declara **não** cobrar regra nenhuma" como gate vivo — o aparato foi removido em 2026-08-18 ([[11-testes-e-cobertura]] §7); a mesma linha fixa "os 5 scripts de check", número que envelheceu | síntese plan-57 | 2026-09-08 | baixo |
| 7 | `LiveDraftPreviewFrame`/`PreviewSystemRenderer` não renderizam `SarakBackgroundRenderer`: escolher mídia de fundo vira `bg-transparent` sobre `--theme-surface` e a mídia nunca aparece no Gêmeo Digital — idêntico na v2.2.9, não é regressão | ritual | 2026-09-09 | médio |
| 8 | `PresetsCatalog.tsx:104` chama `sarak.setResolvedThemeId(theme.id)` num clique que só previsualiza — mas `resolvedThemeId` é estado do PROVIDER (`useResolvedThemeId.ts:15`), compartilhado com o `ShellThemeToggle`, que aplica com `applyFullConfigRaw` direto no sistema: um tema só previsualizado pode entrar no sistema pela porta lateral do toggle do cromo. O JSDoc daquele hook ainda afirma que só quem APLICA um tema chama `setResolvedThemeId` | ritual | 2026-09-09 | médio |
| 9 | [[00-prompt-executor]] §7 item 11 proíbe `git stash` ao executor, mas ele é o único mecanismo que produz um CONTROLE em HEAD limpo — a evidência mais forte para separar regressão de intermitência; já usado duas vezes, sempre com worktree restaurado. O processo precisa oferecer uma porta sancionada | ritual | 2026-09-08 | médio |
| 10 | O executor pula o `status: "🟡 Em execução"` antes da primeira edição de forma sistemática — seis execuções seguidas, todas autodenunciadas no resumo. A transição existe para o `plan-index:check` e para evitar execução concorrente; se ela é sempre esquecida, ou o ritual precisa de gatilho ou a regra precisa mudar | ritual | 2026-09-08 | médio |
| 11 | Os prompts de execução em paralelo não avisam que o worktree contém trabalho de outras plans — um executor propôs `git checkout --` em ~35 arquivos alheios, achando que eram efeito colateral próprio, e teria apagado entregas não commitadas de três plans. A disjunção por arquivo protege o veredito do revisor, não a percepção do executor | ritual | 2026-09-09 | alto |
| 12 | A aba do catálogo de atmosfera continua rotulada "Mídia Base" mas não oferece mais nenhuma mídia — os quatro presets viraram atmosfera gerada em CSS. O rótulo promete foto/vídeo e entrega textura; renomear é decisão de produto, não defeito da entrega | ritual | 2026-09-09 | baixo |
| 13 | O harness de navegador (`browser-tests/`) não cobre os tokens de cromo de cor/gap/margem/estrutura — só a métrica do item de navegação e o fundo da raiz. O gate de paridade prova que o consumo EXISTE; o efeito visual sob um tema custom não é provado em navegador. Estender exige variante de fixture que injete tema por token | ritual | 2026-09-10 | médio |
| 14 | Nove tokens do schema `navigation` não têm consumidor NEM no SarakShell (`sidebarBlur`, `sidebarShadow`, `navActiveMarkerColor`/`Glow`, `searchDropdownGap`/`Width`, `topbarNoiseOpacity`, `sidebarNoiseOpacity`, `topbarTitleColor`) — mesma classe de violação da regra "ou funciona, ou sai do schema", medida e declarada no bloco R18 do gate de paridade de cromo | ritual | 2026-09-10 | médio |
| 15 | `isSafeMediaString` normaliza o ruído da BORDA esquerda (espaço + controle C0), mas tab/LF/CR no MEIO do esquema (`java<TAB>script:`) ainda atravessa — o parser de URL do WHATWG remove esses caracteres de qualquer posição. Não alcançável por nenhum sink atual e o contrato do predicado não promete cobrir; fecha se algum dia o valor for parar num sink que parseia URL | ritual | 2026-09-10 | baixo |
| 16 | `isAutoHideEnabled` não esconde a `SidebarNav` no **Shell**: `SidebarNav.tsx:62-69` chama `setIsNavVisible`, mas nada em `SarakShell` reage a esse estado — só o `DockNav` implementa o comportamento. O token está oferecido no painel e age em um dos dois modos de nav do Shell | plan-66 | 2026-09-10 | médio |
| 17 | Nada na lib diz, em runtime, **qual build o navegador está executando**. Como o pré-bundle do consumidor reotimiza por lockfile e não por conteúdo, e mantém cache por app, medir contra código velho é indistinguível de defeito da lib — já custou dois ciclos de diagnóstico. Um selo legível na página tornaria a pergunta "estou vendo a versão nova?" respondível em um olhar | ritual | 2026-09-10 | médio |
| 18 | O guia do consumidor e dois docs ensinam a derivar tema por `{ ...t, design: { ...t.design, … } }` (`sarak-ui/GUIA-FRONTEND.md` §temas — gerado, corrigir na fonte do gerador; `docs/temas-cromo-e-multidispositivo.md:17-20`; `docs/extensibilidade-de-layout.md:30-33`). A receita preserva a `contraparte`, mas a sobreposição de chave que a contraparte carrega não chega ao modo oposto — e [[09-temas-e-presets]] §4.1.1 agora recomenda `deriveThemeFromReference`, que cobre os dois modos. Documentação atrás da spec | plan-64 | 2026-09-10 | médio |
| 19 | `SidebarNav.tsx:148,152,160` (Shell) pinta texto, ícone e marcador do item ativo com `--theme-primary` — a cor de marca — e não com `--sarak-nav-active-color`/`--sarak-nav-marker-color`. O `SarakAppChrome` e a topbar do Shell usam o token do papel; a sidebar do Shell é a única que diverge | plan-71 | 2026-09-10 | médio |
| 20 | O hover do item de navegação horizontal lê `topbarHoverColor`, cujo default é `transparent`: **12 dos 23** temas shippados ficam sem fundo de hover na topbar (antes, por `--sarak-card-bg`, era 1). O hover segue sinalizado pelo texto, e a sidebar já se comportava assim. Decisão em aberto: aceitar a coerência, autorar o hover nos temas shippados, ou dar aos dois tokens de hover um default não transparente — que não alcança tema persistido com `transparent` serializado | plan-71 | 2026-09-10 | médio |
| 21 | No **Shell**, os resultados do command palette (`SarakSearch.tsx:100-104`) têm `cursor-pointer` e nenhum manipulador: listam os módulos registrados e não levam a lugar nenhum, nem por clique nem por teclado. A correção da plan-67 dá ao palette um callback de seleção opcional; o `SarakShell` ainda não o usa | plan-67 | 2026-09-10 | médio |
| 22 | A varredura de realce do item de navegação (`SarakMenuItem.test.tsx`) usa `parseToRgba`, que devolve **preto opaco** para cor que não reconhece (`hsl()`, `var()`, gradiente). Hoje os 23 temas entregam só hex/`rgb()`/`transparent` nas seis variáveis lidas (138/138), então a medição é correta — mas um tema futuro com `hsl()` seria medido contra preto, em silêncio. O `auditor_contraste` **pula** o par nesse caso e diz que pulou; o teste deveria fazer o mesmo | plan-71 | 2026-09-10 | baixo |
| 23 | `src/styles/_utilities.css:29-35` — `button:not(.p-0) { border-radius: var(--sarak-btn-*) }` fica **fora de qualquer `@layer`** e tem especificidade (0,1,1): vence **todo** `rounded-*` do Tailwind em **todo** `<button>` da lib. O item de navegação horizontal nunca renderizou como pílula (contrato da [[05-cromo-e-slots]] §2.1.1 e do ADR-013) — computa o raio do botão de ação; o `rounded-xl` da sidebar e o `rounded-lg` recolhido também morrem. Medido em Chromium real. Provável parte do *"a topbar está pobre em aparência"*. Conserto exige decidir COMO (baixar a especificidade com `:where()`, escopar o seletor, ou levar o raio para o hook de cada átomo) e alcança todo botão | plan-68 | 2026-09-11 | **alto** |

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
