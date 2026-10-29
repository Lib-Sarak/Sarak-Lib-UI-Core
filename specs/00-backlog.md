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
| 5 | `gates/scripts/audit/verify_contrast.ts` (cabeçalhos) e `specs/09-temas` (`§6.5`) citam plan-24/plan-26; a R36 só barra citação nova em linha adicionada, então a trilha antiga fica | `plan-88` (lote 2) | 2026-10-04 | baixo |
| 2 | `gates/scripts/audit/verify_contrast.ts:35-49` (limite 5 do cabeçalho) justifica deixar `statusErrorColor`/`statusSuccessColor` fora de `PAIRS` porque `--sarak-status-*-color-bg` "nunca é emitida" — mas ela é (consta de `tokens.cssVars` em `sarak-ui/catalog.json`; achado 38 da `15-divida-conhecida`, fechado como não reprodutível). O cabeçalho afirma o falso e o par de texto de status pode entrar na medição; é o que segura a R31 em ⚠️ | síntese da `plan-88` | 2026-10-05 | médio |
| 10 | Procedência citando plan removida, em dois lugares que nenhum gate lê: os comentários do `.githooks/pre-commit` (linhas 46, 69, 94, 103 e 146) e a coluna *Cobra* da `01-gates-e-baseline` (`§2.2`), em que várias linhas trazem a plan de origem entre parênteses. O `trail-citation:check` só lê linha adicionada de código, e spec fica fora dele. Junto: o corpo de `anel1()` imprime `(specs/specs/00-regras-e-invariantes.md)` mesmo quando o rótulo é `—` + outra spec, o que manda o leitor ao arquivo errado | via direta (rótulos do Anel 1) | 2026-10-06 | baixo |
| 11 | A lib não faz rede (`10-seguranca-e-acessibilidade` `§3.2`) e **nenhum gate guarda isso**: o `auditor_authcoupling` só acusa rota de autenticação e sink de credencial, então um `fetch` ou cliente HTTP novo em `src/` sem rota de auth passaria. Candidato a gate de porta única, como o `icon-port:check` | síntese da `plan-96` | 2026-10-07 | médio |
| 16 | O inspetor do painel (`src/features/DesignEngine/Canvas/hooks/useInspector.ts:19`) agrupa elementos por `'.card, [class*="card"], [class*="panel"]'` — o mesmo casamento por substring de nome de classe que a `plan-90` tirou do CSS, agora só em JS: uma utilitária com `card` ou `panel` no nome vira "componente" no inspetor | execução da `plan-90` (lote 2) | 2026-10-09 | baixo |
| 19 | O Command Center (`src/features/DesignEngine/components/DynamicTokenControl.tsx`) não recebe `previewDevice` e não mostra o selo de dispositivo; [[06-painel-de-customizacao-e-preview]] §3 diz que todo controle com `isResponsive` mostra (só `TokenControl.tsx` cumpre) | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 20 | **Verificação a fazer (não é defeito conhecido): medição do dono no primeiro importador atualizado com a 8.0.0** — o `SarakKanban` em aparelho e em navegador real: (1) toque rápido + arrastar rola a página e não move o cartão; (2) pressão de ~250 ms levanta o cartão; (3) soltar entre dois cartões de outra coluna o põe naquele índice; (4) arrastar até a borda rola o quadro; (5) mouse reordena e move pelo índice, e soltar no mesmo lugar não emite evento; (6) teclado: Espaço levanta, setas movem, Espaço solta, Esc cancela, com anúncio. Falhou algum: reabre o [[019-arrastar-e-soltar-do-kanban]] (o lote do quadro volta ao dono). Saiu da `plan-102`, sintetizada sem essa medição por decisão do dono | síntese da `plan-102` | 2026-10-09 | alto |
| 21 | O `auditor_hardcoded` só varre `.tsx` (efeito do filtro de extensão, não isenção documentada): classe com medida literal em `.ts` — como as de container query em `kanbanLayout.ts` e `SarakCalendar/calendarLayout.ts` — passa sem ser vista. O idioma "classe de container query num `.ts` ao lado" depende desse ponto cego; decidir se ele vira regra escrita (a condição de container query não pode ser `var()`) ou se o auditor passa a ver `.ts` com isenção explícita para container query | execução da `plan-103` (lote 1) | 2026-10-09 | médio |
| 23 | O painel consulta o viewport num caso: `Canvas/components/LiveDraftPreviewFrame.tsx:37` usa `maxHeight: '90vh'` no lado a lado em tablet e celular; [[06-painel-de-customizacao-e-preview]] §6.2 diz que o painel não consulta o viewport | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 26 | A mensagem de bloqueio de `gates/scripts/contrato/check-agent-git-write.mjs:54-55` cita a [[17-contrato-de-operacao-git]] §2.0 mas não o número **R38**, ao contrário dos blocos do Anel 1, que imprimem a regra | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 27 | A `ALLOWLIST` de `gates/scripts/contrato/check-zero-brand.mjs` traz `LayoutTab.tsx` sem o comentário de motivo que [[08-identidade-do-host-e-zero-marca]] §7.3 exige de cada entrada | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 29 | `HyperGranularityTab` (`src/features/DesignEngine/Panels/HyperGranularityTab.tsx`) ainda declara `handleApplyToSystem` no tipo das props sem usá-lo, desde que o botão "Aplicar Soberania" saiu; o pai (`Main/components/ThemeSidebarContent.tsx`) continua passando. Tirar do tipo e do pai | revisão da via direta (porta única do painel) | 2026-10-10 | baixo |
| 22 | O `chrome-token-parity:check` (`gates/scripts/contrato/check-chrome-token-parity.mjs`) varre só `schema/navigation.ts` e parte de `system.ts`: um token de cromo em `schema/global.ts` — como o `mobileNavigationStyle` — passa sem que o gate prove o consumidor. Estender o escopo, ou declarar o limite no cabeçalho do gate e na [[05-cromo-e-slots]] §2.4.1 | revisão da `plan-109` | 2026-10-11 | médio |
| 32 | Vocabulário de forma sem token: 33 raios (`rounded-xl/lg/md/3xl`), 43 sombras (`shadow-sm…2xl`) e as molas do `framer-motion` em `src/components/` (mais no painel) não têm token que os nomeie — não é desobediência, é falta de vocabulário (ex.: raio de aba, de item de navegação, de popup; mola de movimento). Decidir se ganham token ou ficam como desenho fixo | re-auditoria de fechamento da `plan-115` | 2026-10-13 | médio |
| 35 | `src/features/DesignEngine/Panels/LayoutTab.tsx` (e o teste `Panels/__tests__/LayoutTab.test.tsx`) é componente órfão: nenhum código de produto o importa (só um comentário em `CustomizationPanelImpl.tsx:10`), e carrega uma lista local de fontes (só Outfit e Inter) que diverge de `THEME_FONTS` | `plan-118` (lote 1) | 2026-10-15 | baixo |
| 41 | Disputa de textura entre ancestrais em `src/styles/_atmosphere.css`: com mais de um `data-sx-card-texture-type` no caminho vence a regra declarada por último, não a do ancestral mais próximo; o padrão `cardTextureType: micro-dots` do tema padrão expõe isso à pré-visualização aninhada do painel de customização | revisão da `plan-110` (lote 6) | 2026-10-18 | baixo |
| 49 | `src/styles/_base.css:67` lê `--sarak-global-bg-image`, que não chega ao `style` inline quando a imagem de fundo é `data:image/…;base64,…` (a arte só aparece pelo `SarakBackgroundRenderer`); com `https` funciona. Leitura morta para `data:` | revisão da `plan-117` (lote 9) | 2026-10-18 | baixo |
| 50 | `src/styles/_atmosphere.css` (`.texture-aurora-classic`, `aurora-classic-drift`) mantém `transform: rotate(360deg) scale(1.2)`; nenhuma opção de `texture` aplica a classe na página hoje, mas o desenho é o mesmo que estourava o `scrollWidth` na `nebula`. Medir ou aposentar | revisão da `plan-117` (lote 9) | 2026-10-18 | baixo |
| 52 | O recorte `contraste-cyberpunk-claro` (`browser-tests/fixtures/harness-entry.tsx:287`) não declara `textColorMuted` e herda o padrão do schema (o do `sarak-sovereign`, escuro): o `--text-muted` sai `rgba(242, 246, 251, 0.55)` sobre branco e o botão secundário (1,09:1) não pode ser medido no estilo `cyberpunk` claro | revisão da `plan-117` (lote 7) | 2026-10-19 | baixo |
| 56 | `.agents/skills/ui-criar-tema/SKILL.md:134` (cabeçalho da §5.7) cita a `plan-110`, removida na síntese de 2026-10-19: trocar por um título sem a plan (a procedência vive no Git) | síntese da `plan-110` | 2026-10-19 | baixo |
| 58 | Rastro de plan em nomes de teste de navegador: arquivos `browser-tests/plan-122-preview-mode.spec.ts`, `plan-123-color-hierarchy.spec.ts`, `plan-124-sidebar-contrast.spec.ts`, `plan-124-isolated.config.ts` e a variável `SARAK_PLAN124_CHROMIUM_PATH` (em `cromo-css-real.spec.ts` e `residuo-da-reauditoria.spec.ts`). O `trail-citation:check` só vê `plan-N` em linha adicionada e não pega nome de arquivo nem `PLAN124`. Renomear pelo que o caso prova, unificar a variável no padrão `SARAK_CHROMIUM_EXECUTABLE_PATH` e apagar os configs isolados se a bateria única os cobrir; avaliar estender o gate a nomes de arquivo | revisão da `plan-124` | 2026-10-24 | baixo |
| 59 | CI: as actions `actions/checkout@v4`, `actions/setup-node@v4` e `actions/upload-artifact@v4` rodam forçadas em Node 24 (aviso de Node 20 descontinuado) e o rótulo `ubuntu-latest` migra para Ubuntu 26 desde 2026-10-19 — a imagem pode mudar sem aviso no meio de um release. Atualizar as actions e fixar a imagem (ex.: `ubuntu-24.04`) até medir a 26 nos jobs `gates` e `cromo-css-real` | anotações da CI da `develop` | 2026-10-25 | médio |

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
