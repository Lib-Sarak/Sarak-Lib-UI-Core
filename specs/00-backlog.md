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
| 7 | `src/core/Design/catalog/partitions/components_base.json` tem **26 entradas sem `name` nem `tags`** (de `tableZebraStriping`, `:1489`, a `rangeActiveColor`, `:1860`); os `tokenId` duplicados que este item registrava já não existem (o teste de unicidade os cobre) | `plan-88` · reconferido na `plan-117` (lote 3) | 2026-10-16 | baixo |
| 8 | O painel de temas tem **duas taxonomias de pilar**: 7 em `src/features/DesignEngine/config/design-pillars.json` (a tela principal) e 6 em `SOVEREIGN_PILLARS` (`src/features/DesignEngine/Panels/hooks/useSovereignSearch.ts:6-13`, o Command Center — "Fundação (DNA)", "Core Engine"); a mesma coisa tem nome diferente conforme a tela. Decidir se o Command Center deixa de existir (a busca nova e a tabela do catálogo cobrem o uso) ou passa a ler o JSON de pilares | análise do painel (2026-10-05), `plan-100` | 2026-10-05 | médio |
| 9 | Com a `plan-104`, o `@tanstack/react-virtual` passou a ser importado **só** pelos chunks sob demanda das duas grades (`dist/index.js` não o referencia), e pela regra de [[05-build-e-distribuicao]] §4 peer que só código sob demanda importa é **opcional** — mas o `package.json` não o marca em `peerDependenciesMeta` e a [[13-instalacao-e-atualizacao]] §2.3 o lista entre as obrigatórias. Tornar opcional é aditivo (não quebra quem instala) | síntese da `plan-104` | 2026-10-10 | médio |
| 2 | `gates/scripts/audit/verify_contrast.ts:35-49` (limite 5 do cabeçalho) justifica deixar `statusErrorColor`/`statusSuccessColor` fora de `PAIRS` porque `--sarak-status-*-color-bg` "nunca é emitida" — mas ela é (consta de `tokens.cssVars` em `sarak-ui/catalog.json`; achado 38 da `15-divida-conhecida`, fechado como não reprodutível). O cabeçalho afirma o falso e o par de texto de status pode entrar na medição; é o que segura a R31 em ⚠️ | síntese da `plan-88` | 2026-10-05 | médio |
| 10 | Procedência citando plan removida, em dois lugares que nenhum gate lê: os comentários do `.githooks/pre-commit` (linhas 46, 69, 94, 103 e 146) e a coluna *Cobra* da `01-gates-e-baseline` (`§2.2`), em que várias linhas trazem a plan de origem entre parênteses. O `trail-citation:check` só lê linha adicionada de código, e spec fica fora dele. Junto: o corpo de `anel1()` imprime `(specs/specs/00-regras-e-invariantes.md)` mesmo quando o rótulo é `—` + outra spec, o que manda o leitor ao arquivo errado | via direta (rótulos do Anel 1) | 2026-10-06 | baixo |
| 12 | O `build:css` roda `npx @tailwindcss/cli` (`package.json`, script `build:css`), mas o `@tailwindcss/cli` **não está em nenhuma dependência**: só há `@tailwindcss/vite` em `node_modules/@tailwindcss/`. Cada `npm run build` baixa a CLI do registry, **sem versão fixada** — o build quebra sem rede (visto na execução da `plan-89`, lote 3: `ENOTFOUND`) e pode mudar de versão em silêncio entre dois builds, inclusive no `version` do release | revisão da `plan-89` | 2026-10-07 | alto |
| 11 | A lib não faz rede (`10-seguranca-e-acessibilidade` `§3.2`) e **nenhum gate guarda isso**: o `auditor_authcoupling` só acusa rota de autenticação e sink de credencial, então um `fetch` ou cliente HTTP novo em `src/` sem rota de auth passaria. Candidato a gate de porta única, como o `icon-port:check` | síntese da `plan-96` | 2026-10-07 | médio |
| 13 | O `tsx` **não está declarado** em nenhuma dependência do `package.json` (nem no lockfile do HEAD `fbaa2d6c`), mas `scripts/generate-token-types.ts`, `scripts/consumer-kit/collectEmittedSarakCssVars.mjs` (importa `tsx/esm/api`), `scripts/generate_themes.ts` e os auditores `auditor_contraste`, `auditor_paridade`, `auditor_presets` e `verify_theme_parity` dependem dele. Um `npm install` da rodada de 2026-10-08 o podou do `node_modules` e derrubou `npm run guide`, o `build` e o `kitGenerator.test.mjs`; foi reposto com `--no-save`, então o próximo `npm install` pode podá-lo de novo. Mesma família do item 12 | revisão da `plan-101` (lote 3) | 2026-10-09 | alto |
| 14 | `SarakAutocomplete` (`src/components/atomic/Inputs/SarakAutocomplete.tsx`) tira `disabled` das props e só o passa ao controlador: o `<input>` nunca recebe o atributo, então o campo segue editável e focável com `disabled`. O `SarakAssigneePicker` contorna com `readOnly` + `aria-disabled`; consumidor direto do autocomplete não | execução da `plan-102` (lote 3) | 2026-10-09 | médio |
| 15 | O caso de navegador `isSplitViewEnabled responde à largura da região…` (`browser-tests/cromo-css-real.spec.ts`) é intermitente: falhou 1 vez em 6 execuções (o `bottom` do primeiro painel 2 px abaixo do `top` do segundo no empilhamento, 2813,02 × 2811,02) e passou no controle do `HEAD`. A comparação estrita de borda pode estar sensível a arredondamento de subpixel; medir antes de afrouxar | execução da `plan-90` (lote 1) | 2026-10-09 | baixo |
| 16 | O inspetor do painel (`src/features/DesignEngine/Canvas/hooks/useInspector.ts:19`) agrupa elementos por `'.card, [class*="card"], [class*="panel"]'` — o mesmo casamento por substring de nome de classe que a `plan-90` tirou do CSS, agora só em JS: uma utilitária com `card` ou `panel` no nome vira "componente" no inspetor | execução da `plan-90` (lote 2) | 2026-10-09 | baixo |
| 17 | `src/components/atomic/Templates/SarakCatalogGrid.tsx:148` tem a classe `border-[var(--border-color,#334155)]-border`, com o sufixo `-border` solto depois do valor arbitrário: o Tailwind não gera essa classe, e a borda depende do que mais o elemento tiver | execução da `plan-90` (lote 2) | 2026-10-09 | baixo |
| 18 | **Decisão do dono — o worker do `SarakPDFViewer`.** O default `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` (`Media/SarakPDFViewer/usePdfDocument.ts:22`) resolve **relativo ao `dist/` da lib** (`dist/pdfjs-dist/build/…`, que não existe), em qualquer forma de instalação; o ERP contorna com a prop `workerSrc` (demanda 8). Opções: (a) copiar o worker para o `dist/` no build — arrisca versão diferente da peer `pdfjs-dist >=4` do consumidor; (b) tornar `workerSrc` obrigatório e documentar a linha que o consumidor escreve no próprio bundler. Saiu da `plan-91` (item 10) | revisão da `plan-91` | 2026-10-09 | médio |
| 19 | O Command Center (`src/features/DesignEngine/components/DynamicTokenControl.tsx`) não recebe `previewDevice` e não mostra o selo de dispositivo; [[06-painel-de-customizacao-e-preview]] §3 diz que todo controle com `isResponsive` mostra (só `TokenControl.tsx` cumpre) | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 20 | **Medição do dono, no primeiro importador atualizado com a 8.0.0** — o `SarakKanban` em aparelho e em navegador real: (1) toque rápido + arrastar rola a página e não move o cartão; (2) pressão de ~250 ms levanta o cartão; (3) soltar entre dois cartões de outra coluna o põe naquele índice; (4) arrastar até a borda rola o quadro; (5) mouse reordena e move pelo índice, e soltar no mesmo lugar não emite evento; (6) teclado: Espaço levanta, setas movem, Espaço solta, Esc cancela, com anúncio. Falhou algum: reabre o [[019-arrastar-e-soltar-do-kanban]] (o lote do quadro volta ao dono). Saiu da `plan-102`, sintetizada sem essa medição por decisão do dono | síntese da `plan-102` | 2026-10-09 | alto |
| 21 | O `auditor_hardcoded` só varre `.tsx` (efeito do filtro de extensão, não isenção documentada): classe com medida literal em `.ts` — como as de container query em `kanbanLayout.ts` e `SarakCalendar/calendarLayout.ts` — passa sem ser vista. O idioma "classe de container query num `.ts` ao lado" depende desse ponto cego; decidir se ele vira regra escrita (a condição de container query não pode ser `var()`) ou se o auditor passa a ver `.ts` com isenção explícita para container query | execução da `plan-103` (lote 1) | 2026-10-09 | médio |
| 23 | O painel consulta o viewport num caso: `Canvas/components/LiveDraftPreviewFrame.tsx:37` usa `maxHeight: '90vh'` no lado a lado em tablet e celular; [[06-painel-de-customizacao-e-preview]] §6.2 diz que o painel não consulta o viewport | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 24 | O fundo do drawer do celular (`src/components/Layout/SarakAppChromeMobile.tsx:183`) termina num hexadecimal (`var(--bg-body, #0f172a)`), fora da tabela de tokens do cromo de [[05-cromo-e-slots]] §6, que dá à sidebar `var(--sarak-sidebar-bg, var(--theme-sidebar-bg, transparent))` | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 25 | Props públicas declaradas e nunca lidas: `role`, `density` e `importance` em `Templates/SarakStats.tsx:33-35` e `Templates/SarakForm.tsx:29-31`, `importance` em `Templates/SarakTableProps.ts:36` — o consumidor passa e nada muda; remover é MAJOR, documentar como inertes é a alternativa | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 26 | A mensagem de bloqueio de `gates/scripts/contrato/check-agent-git-write.mjs:54-55` cita a [[17-contrato-de-operacao-git]] §2.0 mas não o número **R38**, ao contrário dos blocos do Anel 1, que imprimem a regra | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 27 | A `ALLOWLIST` de `gates/scripts/contrato/check-zero-brand.mjs` traz `LayoutTab.tsx` sem o comentário de motivo que [[08-identidade-do-host-e-zero-marca]] §7.3 exige de cada entrada | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 28 | O título e o estado vazio da busca do painel (`Main/components/ThemeSidebarContent.tsx:82-84`) usam `--sarak-type-scale-tiny` (8 px), em caixa alta e `tracking-widest` — abaixo do piso de 12 px que [[06-painel-de-customizacao-e-preview]] §3 dá aos rótulos | contraprova de paridade desde a `v7.0.0` | 2026-10-10 | baixo |
| 29 | `HyperGranularityTab` (`src/features/DesignEngine/Panels/HyperGranularityTab.tsx`) ainda declara `handleApplyToSystem` no tipo das props sem usá-lo, desde que o botão "Aplicar Soberania" saiu; o pai (`Main/components/ThemeSidebarContent.tsx`) continua passando. Tirar do tipo e do pai | revisão da via direta (porta única do painel) | 2026-10-10 | baixo |
| 30 | O caso "repositório real" de `gates/scripts/contrato/__tests__/check-container-query-literal.test.mjs` varre `src/` inteiro e roda perto do limite padrão de 5 s do vitest: com a máquina carregada (um build em paralelo) estourou em 5075 ms e passou na repetição (2026-10-10). Dar timeout explícito ao caso, como os outros testes que varrem o repositório | revisão da via direta (`SarakAuthScreen`) | 2026-10-10 | médio |
| 22 | O `chrome-token-parity:check` (`gates/scripts/contrato/check-chrome-token-parity.mjs`) varre só `schema/navigation.ts` e parte de `system.ts`: um token de cromo em `schema/global.ts` — como o `mobileNavigationStyle` — passa sem que o gate prove o consumidor. Estender o escopo, ou declarar o limite no cabeçalho do gate e na [[05-cromo-e-slots]] §2.4.1 | revisão da `plan-109` | 2026-10-11 | médio |
| 31 | `src/components/atomic/Navigation/SarakShellNav.tsx:46` (e o catálogo gerado, que copia o JSDoc) ainda cita `dock` como valor de orientação, opção que saiu do `navigationStyle` | revisão da `plan-109` | 2026-10-11 | baixo |
| 1 | `src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx:61` mocka `core/Design/master-map` sem `sarakGetDefaultDesignState`, que `Main/utils/exportTheme.ts:18` importa; o stderr da CI acusa `No "sarakGetDefaultDesignState" export is defined` e o teste "exporta o tema como JSON" passa mesmo assim — talvez sem provar o que promete (resíduo do rename `965bc44`) | ritual (log da CI do `80785e5`) | 2026-10-03 | médio |
| 32 | Vocabulário de forma sem token: 33 raios (`rounded-xl/lg/md/3xl`), 43 sombras (`shadow-sm…2xl`) e as molas do `framer-motion` em `src/components/` (mais no painel) não têm token que os nomeie — não é desobediência, é falta de vocabulário (ex.: raio de aba, de item de navegação, de popup; mola de movimento). Decidir se ganham token ou ficam como desenho fixo | re-auditoria de fechamento da `plan-115` | 2026-10-13 | médio |
| 35 | `src/features/DesignEngine/Panels/LayoutTab.tsx` (e o teste `Panels/__tests__/LayoutTab.test.tsx`) é componente órfão: nenhum código de produto o importa (só um comentário em `CustomizationPanelImpl.tsx:10`), e carrega uma lista local de fontes (só Outfit e Inter) que diverge de `THEME_FONTS` | `plan-118` (lote 1) | 2026-10-15 | baixo |
| 36 | Dois casos de navegador medem tempo de quadro e são intermitentes: `tema-sob-demanda.spec.ts` ("o fallback fica na tela até o tema chegar…", exige um quadro só com o fallback; falhou 2 de 4 execuções isoladas) e `gantt-altura-e-contraste.spec.ts` ("o harness liga mesmo o tema claro", falhou sob a bateria completa, passou isolado). Medir a taxa antes de afrouxar; ambos passam no controle do `HEAD` | revisão da `plan-118` (lote 4) | 2026-10-16 | baixo |
| 37 | `SarakScrim.tsx:59,76` lê `motionEaseIn` num `exit`, mas a `SarakDrawer` anima o véu por `animate` e `shouldRender`, não por `AnimatePresence`: o véu da gaveta segue sem tocar a curva do token (o modal e a paleta já a tocam) | revisão da `plan-117` (lote 5) | 2026-10-17 | baixo |
| 38 | `SarakExpandableMatrix`/`RecursiveMatrixNode`: os filhos aninhados (`gap` de 8 px) e a lista de linhas (4 px) têm espaçamento fixo próprio, fora de `matrixGap` (só o contêiner dos sub-itens lê o token) | revisão da `plan-117` (lote 5) | 2026-10-17 | baixo |
| 39 | Faixas de token funcional que o contrato permite e o sistema não deveria: `topbarCollapsedHeight` (24–56) fica abaixo do alvo de toque de 44; `focusRingWidth` aceita 0 (anel de foco some); as faixas de `zIndexSidebar` e `zIndexModal` se tocam (a lateral pode passar o modal). Decidir faixa mínima por token, com o que cada uma quebra | revisão da `plan-110` (lote 5) | 2026-10-17 | médio |

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
