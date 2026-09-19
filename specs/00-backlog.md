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
| 2 | [[01-gates-e-baseline]] §2.2.1 (onde cada gate roda) não tem a linha do `chrome-token-parity:check`, que roda no Anel 1 do `pre-commit` **e** no passo explícito dos `*:check` da CI (`.github/workflows/gates.yml:100`) — a tabela que existe para impedir gate órfão omite um gate vivo | síntese plan-76 | 2026-09-13 | baixo |
| 3 | `src/styles/_atmosphere.css:618-623` — `[data-sx-texture] [class*="card"]` força `background`/`backdrop-filter` com `!important` casando pelo **nome** da classe: qualquer utilitária com `card` no nome, da lib ou do consumidor (`hover:bg-[var(--color-theme-card,…)]`), perde o fundo quando há textura; as regras `[class*="card"]::after` de `:84` a `:578` usam o mesmo mecanismo. É a classe de defeito que a camada de padrões de elemento fechou para `[class*="border"]` | plan-77 | 2026-09-13 | médio |
| 4 | `src/styles/_base.css:26-34` — `--theme-primary-hover: var(--theme-primary-hover, …)` (e `-active`, `-focus`, os pares `secondary`/`accent`) referenciam a si mesmas no `body`: custom property cíclica é inválida, então a reserva `color-mix(...)` nunca é usada. Com o Design Engine montado o valor injetado vence e o hover funciona; sem ele, não há hover de botão | plan-77 | 2026-09-13 | médio |
| 5 | A intermitência da suíte escalou muito além do que [[11-testes-e-cobertura]] §3.5 registra: as amostras de lá são 26 e 20 execuções com zero falhas; em 2026-09-08 foram 4 execuções vermelhas em 5, sempre por timeout e sempre verdes isoladas (`SarakPDFViewerImpl`, `generate-token-types.check`). **Em 2026-09-10 passou a bloquear o gate de release:** `npm run gates:full` caiu na etapa `coverage:check` em 4 de 5 execuções (3 do executor da plan-67, 1 do revisor), sempre por timeout nos mesmos dois arquivos, que passam isolados — e como a etapa aborta, **o piso de cobertura não chega a ser medido** | plan-57 | 2026-09-08 | **alto** |
| 6 | O `body` não cede à classe utilitária: os padrões dele estão divididos entre `src/styles/_base.css:12-56` (inclusive `line-height: 1.5` literal, `:55`) e `src/styles/_typography.css` (os tokens de tamanho, peso e entrelinha), e o token de entrelinha só vence o literal por ordem de arquivo na mesma camada. Unificar as duas regras é o que permite mover o `body` para a camada de padrões de elemento | plan-77 | 2026-09-13 | baixo |
| 7 | `browser-tests/fixtures/harness-entry.tsx:2` aponta para `browser-tests/README.md`, que não existe — o papel dele é coberto por `build-harness.mjs`, `playwright.config.ts` e [[11-testes-e-cobertura]] §7 | plan-77 | 2026-09-13 | baixo |
| 8 | O Anel 0 (`gates/scripts/segredo/verificar_commit.py`) tem dois vãos que só aparecem no commit do dono: (a) o padrão *"Segredo atribuído"* (`config.json:14`) não tem fronteira de palavra, então identificador que TERMINA em `token`/`secret`/`key` seguido de string de 8+ caracteres é acusado (ex.: a chave `borderByToken` com um rótulo de texto como valor); (b) ele só lê o **staged**, então nem o executor nem o revisor conseguem rodá-lo sobre a entrega antes de o dono dar `git add` — um modo worktree + não rastreados, como o de `trail-citation:check`, fecharia isso. O `config.json` é derivado do catálogo do ecossistema (`cyber-segredos`), então a mudança de padrão é dele | plan-77 | 2026-09-13 | médio |
| 9 | [[00-prompt-executor]] §7 item 11 proíbe `git stash` ao executor, mas ele é o único mecanismo que produz um CONTROLE em HEAD limpo — a evidência mais forte para separar regressão de intermitência; já usado duas vezes, sempre com worktree restaurado. O processo precisa oferecer uma porta sancionada | ritual | 2026-09-08 | médio |
| 10 | O executor pula o `status: "🟡 Em execução"` antes da primeira edição de forma sistemática — seis execuções seguidas, todas autodenunciadas no resumo. A transição existe para o `plan-index:check` e para evitar execução concorrente; se ela é sempre esquecida, ou o ritual precisa de gatilho ou a regra precisa mudar | ritual | 2026-09-08 | médio |
| 11 | Os prompts de execução em paralelo não avisam que o worktree contém trabalho de outras plans — um executor propôs `git checkout --` em ~35 arquivos alheios, achando que eram efeito colateral próprio, e teria apagado entregas não commitadas de três plans. A disjunção por arquivo protege o veredito do revisor, não a percepção do executor | ritual | 2026-09-09 | alto |
| 12 | O `cromo-css-real:check` é intermitente: o `beforeAll` de `browser-tests/cromo-css-real.spec.ts` chama `buildHarness()` com o timeout padrão de 30 s do Playwright, e o bundle do harness leva **16,6 s a frio** (2,5 s a quente); logo depois do `npm run build` completo — que é como o script e o job de CI o encadeiam — a passada a frio passou dos 30 s em 1 de 2 rodadas do revisor e em 1 de 2 do executor (2026-09-13), derrubando os 16 casos sem nenhuma asserção de CSS ter rodado | plan-77 | 2026-09-13 | **alto** |
| 13 | O harness de navegador (`browser-tests/`) não cobre os tokens de cromo de cor/gap/margem/estrutura — só a métrica do item de navegação e o fundo da raiz. O gate de paridade prova que o consumo EXISTE; o efeito visual sob um tema custom não é provado em navegador. Estender exige variante de fixture que injete tema por token | ritual | 2026-09-10 | médio |
| 14 | [[00-mapa-do-modulo]] §6 (linha 152) afirma *"2 usos vivos de `--sx-*`"* em `src/styles/_utilities.css:80` e `:89` — não existe mais nenhum `--sx-` em `src/styles/` (o fallback do range usa `--theme-primary`); a spec descreve dívida já paga e ponteiros que não resolvem | síntese plan-77 | 2026-09-13 | baixo |
| 15 | `isSafeMediaString` normaliza o ruído da BORDA esquerda (espaço + controle C0), mas tab/LF/CR no MEIO do esquema (`java<TAB>script:`) ainda atravessa — o parser de URL do WHATWG remove esses caracteres de qualquer posição. Não alcançável por nenhum sink atual e o contrato do predicado não promete cobrir; fecha se algum dia o valor for parar num sink que parseia URL | ritual | 2026-09-10 | baixo |
| 16 | O registro do `auditor_ghostvars` conta como variável emitida o `id` de **qualquer** objeto do schema, inclusive o `id` das OPÇÕES de um `select` (`constraints.options`) — `{ id: 'overlay' }` criava `--sarak-overlay` e, pela expansão de sufixo, `--sarak-overlay-bg`. Enquanto a opção existiu, um consumo fantasma real ficou mascarado (medido na plan-78). Enquanto o registro aceitar id de opção, o gate pode aprovar consumo que ninguém emite | plan-78 | 2026-09-17 | médio |
| 18 | `docs/extensibilidade-de-layout.md:54-55` ainda lista `globalBackgroundBlendMode` entre os tokens do fundo global — o token saiu do schema na 7.0.0, então a doc aponta para o que não existe | plan-78 | 2026-09-17 | baixo |
| 19 | Textos da lib que ainda não seguem o idioma que vale, fora do escopo da plan-79: o fallback de categoria `'Sistema'` em `src/shared/hooks/useModuleDiscovery.ts:36` (é o que de fato chega à tela no Shell) e os fallbacks em português fixo de `SarakRangeSlider.tsx:106,117` e `SarakTimePicker.tsx:66` | plan-79 | 2026-09-17 | baixo |
| 17 | Nada na lib diz, em runtime, **qual build o navegador está executando**. Como o pré-bundle do consumidor reotimiza por lockfile e não por conteúdo, e mantém cache por app, medir contra código velho é indistinguível de defeito da lib — já custou dois ciclos de diagnóstico. Um selo legível na página tornaria a pergunta "estou vendo a versão nova?" respondível em um olhar | ritual | 2026-09-10 | médio |
| 20 | A busca de token do painel de design pode descartar a primeira digitação logo depois de abrir a aba Design: relatado no ERP por automação (`.value` via JS e `puppeteer_fill`) e **não** reproduzido em jsdom (quatro métodos, com o Provider e a aba reais). Hipótese: o painel carrega sob demanda, e o campo que recebeu a primeira digitação é substituído por uma nova montagem. Se for isso, um usuário que digita logo ao abrir também perde a primeira digitação. Reproduzir exige navegador real (`browser-tests/`) | plan-81 | 2026-09-18 | médio |
| 21 | `src/features/DesignEngine/Canvas/PreviewCanvas.tsx:112` e `Canvas/components/PreviewSystemRenderer.tsx:87`: o parâmetro `useSystemDesign` lê `sarak.design`, que agora inclui o rascunho. Nenhum ponto de chamada passa `true` (é código morto), mas o nome promete o sistema e entregaria o rascunho | plan-81 | 2026-09-18 | baixo |
| 22 | "Aplicar Alterações Globais" com tema do catálogo entrega ao `persistence.onSave` o design novo com o id do tema **anterior**: `handleApplyToSystem` (`useDesignDraft.ts`) chama `persistDesign` antes de `setResolvedThemeId`, e `persistDesign` lê o id de uma ref que só se atualiza no render seguinte. A gravação automática corrige o par 1,5 s depois; quem fecha a aba nesse intervalo guarda o par errado no backend (medido: `[design do minimalist-airy, "sarak-sovereign"]`) | plan-81 | 2026-09-18 | médio |
| 23 | `SarakStats` sem `data` e sem `endpoint` fica em carregamento para sempre: `useSarakStatsData.ts:7` nasce com `loading: !initialData` e o efeito não busca sem `endpoint`. `SarakTable` e `SarakCardGrid` já tratam o caso ([[03-superficie-publica]] §6.3) | síntese plan-81 | 2026-09-18 | baixo |
| 24 | No tablet (900px), com a topbar compacta, um item de navegação ("Contratos", no ERP) apareceu só com ícone, sem rótulo, entre itens rotulados. Pode ser overflow por falta de espaço; não foi aprofundado | plan-72 | 2026-09-18 | baixo |
| 25 | O `trail-citation:check` (`gates/scripts/*/check-trail-citation.mjs:41`, `VEREDITO_RE = /veredito de/i`) só casa "veredito **de**": "veredito do lote 1", "veredito da correção" passam, e a citação do rastro chega ao código sem o gate ver (medido em `verify_presets.ts:30`) | plan-80 | 2026-09-18 | médio |
| 26 | Com `sidebarColor`/`topbarColor` translúcidos (`nebula-space`, `kinetic-flow`), o `auditor_contraste` pula os pares de texto sobre a barra nos dois modos: a legibilidade da navegação desses temas não é medida por nenhum gate. Medir exige compor a barra sobre o fundo efetivo (`colorBgBody`), como a varredura de hover já faz | plan-80 | 2026-09-18 | médio |

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
