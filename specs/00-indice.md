---
tipo: "processo"
titulo: "Índice de Execução — Mapa das Plans"
dominio: "Governança de Specs (SDD)"
status: "🟢 Vigente"
tags: ["processo", "indice", "sdd"]
relacionados: ["[[00-contexto]]", "[[00-backlog]]", "[[00-prompt-revisor]]", "[[00-prompt-executor]]"]
proximo_numero_plan: "114"
---

# 0. O que é este arquivo

O **mapa de execução** do repositório: a ordem em que as specs de `plan/` devem ser executadas, suas
dependências e o estado de cada uma. Responde a três perguntas, sempre:

1. **O que executo agora?** (a primeira `🔴 A executar` sem dependência pendente)
2. **O que já foi feito e está esperando síntese?** (as `🟢 Aprovada`)
3. **Para onde cada plan vai depois?** (coluna *Destino*)

> ⚠️ **Este arquivo é um molde com instruções embutidas.** Os blocos `> **Como escrever:**` **permanecem** no
> arquivo como contrato de manutenção; as tabelas começam vazias e são mantidas pelo **agente revisor**.

**Quem escreve/atualiza:** exclusivamente o **agente revisor** ([[00-prompt-revisor]]).
**Quando atualizar:** ao criar uma plan (nova linha), ao aprovar/reprovar uma execução (mudança de status) e
ao **sintetizar** uma plan aprovada, quando a linha sai daqui junto com o arquivo ([[00-prompt-revisor]] §7.4).
**Toda mudança de status vive aqui e na própria plan — as duas, sempre, na mesma ação.**

---

# 1. Fila de execução

> **Como escrever:** uma linha por plan **ativa** (não sintetizada), **em ordem de execução** — a ordem da
> tabela **é** o plano; não use a numeração para ordenar. Colunas obrigatórias, nesta ordem:
>
> - **#** — posição na fila (1, 2, 3…). Reordenável.
> - **Plan** — link relativo: `[plan-NN-slug](plan/plan-NN-slug.md)`.
> - **Objetivo** — uma linha, no infinitivo. O que muda no sistema.
> - **Depende de** — `plan-NN` que precisa estar `🟢 Aprovada` antes, ou `—`.
> - **Status** — um dos valores da §2. **Igual** ao frontmatter da plan.
> - **Destino** — para onde o conteúdo é sintetizado depois (§3).

<!-- SARAK-INDICE:FILA:INICIO -->
| # | Plan | Objetivo | Depende de | Status | Destino |
|---|---|---|---|---|---|
| 1 | [plan-110-temas-que-mostram-a-biblioteca](plan/plan-110-temas-que-mostram-a-biblioteca.md) | Fazer os temas embarcados da lib, os 14 atuais refeitos e 5 novos, mostrarem do comeco ao fim o que o Design Engine sabe fazer, com direcao de arte de conjunto, cada tema distinto e coerente, legivel nos dois modos e provado por medicao e por vitrine aprovada pelo dono | plan-113-o-schema-que-o-painel-oferece-desenha | 🟠 Em revisão | specs/09-temas-e-presets.md |
| 2 | [plan-111-todo-token-visual-desenha](plan/plan-111-todo-token-visual-desenha.md) | Fazer cada token visual que o painel oferece desenhar o que promete, gradiente, material de superficie, cor e forma da sombra, tom do sistema, estilo do switch, ruido, fontes, texturas em tema claro e paleta de graficos, e impedir por gate que um valor emitido pelo motor volte a ficar sem leitor | — | 🟢 Aprovado | specs/09-temas-e-presets.md + arquitetura/02-design-engine.md + arquitetura/03-superficie-publica.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md |
| 3 | [plan-112-o-resto-do-arsenal-desenha](plan/plan-112-o-resto-do-arsenal-desenha.md) | Fazer os tokens visuais que a plan-111 deixou na excecao do gate desenharem, o desfoque de vidro do cartao funcionar no navegador e a cor de textura chegar a todas as texturas, e estender o token-reader ao schema inteiro, sem excecao restante | plan-111-todo-token-visual-desenha | 🟢 Aprovada | arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md |
| 4 | [plan-113-o-schema-que-o-painel-oferece-desenha](plan/plan-113-o-schema-que-o-painel-oferece-desenha.md) | Resolver os 70 tokens que a plan-112 declarou na excecao do token-reader, dando leitor ao que tem componente, fundindo duplicatas, retirando o que nao e de tema e provando por opcao o que chega por tabela, ate a ALLOWLIST ficar vazia antes de os temas serem refeitos | plan-112-o-resto-do-arsenal-desenha | 🟡 Em execução | arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md |
<!-- SARAK-INDICE:FILA:FIM -->

> **Ordem de execução (decisão do revisor, 2026-10-10):** a `plan-104` fechou (sintetizada em 2026-10-10); a ordem segue no despacho de 2026-10-10 abaixo. As três tocam `docs/migracoes.md`, cada uma na
> sua subseção da próxima versão; fora isso, são disjuntas (`DataDisplay/` · `Provider/` + `Layout/chrome/` · `Inputs/` + i18n). Paralelo
> só com a disjunção declarada pelo revisor ao despachar.
>
> 🚦 **Fila de 2026-10-11 — 113, sozinha na árvore**, depois do commit da 112 (aprovada). A `plan-110` (lote 0 aprovado) espera
> a 113: o dono decidiu fechar os 70 tokens sem leitor antes de refazer os temas. O `npm run build` e o `cromo-css-real:check` precisam de rede: quem os roda é o revisor; o executor escreve os casos
> de `browser-tests/`.

> ⚪ **A `plan-109` foi SINTETIZADA e REMOVIDA em 2026-10-11.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **109** | 🆕 [[021-navegacao-na-base-do-celular]] — barra na base × gaveta, com as alternativas e o custo de cada · [[05-cromo-e-slots]] §2.3 (a navegação do celular pelo `mobileNavigationStyle`: barra na base até 5 itens, irmã do conteúdo, área segura e alvo de toque; drawer acima) · [[07-responsividade-e-multidispositivo]] §5 (linha do `SarakAppChrome`) · `adr/README.md`. O `dock` saiu do schema e do catálogo. Ficou de fora: o escopo do `chrome-token-parity`, que não varre `global.ts` (`00-backlog` item 22), e o comentário do `SarakShellNav` que cita `dock` (item 31) |

> ⚪ **A `plan-107` foi SINTETIZADA e REMOVIDA em 2026-10-11.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **107** | [[07-responsividade-e-multidispositivo]] §5 — duas linhas novas na tabela do que adapta sozinho: todo acionável da lib com área tocável ≥ o token `touchTargetMin` com ponteiro de dedo (e a ponte `--sarak-touch-target-active` do Gantt), todo campo ≥ 16 px · [[10-seguranca-e-acessibilidade]] **§2.4e (nova)** — movimento reduzido em todo o documento (token e sistema, `MotionConfig`), tooltip por toque, teclado de busca. **Divergências corrigidas na mesma ação:** a `10` §2.4d dizia que a auditoria de contraste não existe, a lacuna 5.2 que o gate não foi construído e a 5.7 citava um teste removido. Ficou de fora: o chip do calendário em tablet e os `input` de checkbox/radio/range fora da regra do alvo (achados do executor, sem regra que os exija) |

> ⚪ **As `plan-105`, `plan-106` e `plan-108` foram SINTETIZADAS e REMOVIDAS em 2026-10-10.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **105** | [[03-superficie-publica]] §6.9 — o controle que recebe o foco tem o nome do `label`: `<label htmlFor>` quando há elemento rotulável, `aria-labelledby` quando não há, com os átomos de cada caso. Ficou de fora: nada (os textos traduzidos já estavam na §6.9; o item 19 do backlog saiu ao promover) |
> | **106** | [[09-temas-e-presets]] §4.7 — `defaultColorMode` do host (`system` segue o SO), nunca gravado, ignorado sem a preferência oferecida; preferência só é gravada quando o usuário escolhe · [[05-cromo-e-slots]] §1 — as chaves `fontSize`, `navigationStyle` e `language` de `widgets`, como teto. Ficou de fora: nada |
> | **108** | [[03-superficie-publica]] §6.3 — falha de recarregamento não apaga a tela, horário da leitura e "desatualizado", `updatedAt` · §6.3.1 — dígitos tabulares no `SarakValue` e no `SarakStats`; o `SarakBadge` de status com forma, rótulo, token de status e texto escuro na variante sólida. Ficou de fora: o limite do texto escuro com cor de status escura de tema do consumidor (registrado no veredito; não é regra) |

> ⚪ **A `plan-104` foi SINTETIZADA e REMOVIDA em 2026-10-10.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **104** | [[03-superficie-publica]] §6.3.1 (o `SarakDataTable` e o `SarakDataGrid` exigem `<Suspense>` de quem os usa; a implementação não é nome público) e §7.1 (a regra: fronteira só vale se o `Impl` não for nome do barril, com a medição do `dist/` e o teste que a trava). Ficou de fora: as notas consolidadas em `docs/migracoes.md` (doc do consumidor, não spec); o `@tanstack/react-virtual` agora só é importado sob demanda e continua peer obrigatória — `00-backlog` item 9 |

> ⚪ **A `plan-103` foi SINTETIZADA e REMOVIDA em 2026-10-09.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **103** | [[03-superficie-publica]] **§6.11 (nova)** — `SarakCalendar` (eventos de vários dias, mês controlado ou não, teclado em grade, "+N", ponto no contêiner estreito) e `SarakGantt` (casca própria, escalas, lista e cabeçalho presos, dependências término→início, altura do host, contraste do título e marcador de hoje em qualquer tema), os tons comuns e os limites declarados (500 tarefas, sem arrastar, sem horas, sem fuso); linha `DataDisplay` da §6 · [[11-testes-e-cobertura]] §7.3 — os arquivos de `browser-tests/` passam a ser listados pelo comando, e a família "visões de projeto" entra. Ficou de fora: nada (o Gantt já tinha o [[020-gantt-casca-propria]]) |

> ⚪ **As `plan-91` e `plan-102` foram SINTETIZADAS e REMOVIDAS em 2026-10-09.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **91** | [[03-superficie-publica]] §6.3 (sem `data` nem `load`, nenhum template busca nem fica preso em carregamento) · tabela da §6, linha `Cards` (o cartão composto não lê os tokens de direção e alinhamento) · **§6.9 (nova)** — o erro de campo com uma forma só (`SarakFieldError`, `role="alert"`, `aria-describedby`, `aria-invalid`) nos nove átomos, o `label` do select, os dois ícones do `SarakInput`, os rótulos acessíveis pelo i18n. Ficou de fora: o item 10 (worker do PDF) — `00-backlog` item 18, decisão do dono; os textos fixos restantes — item 19 |
> | **102** | **[[019-arrastar-e-soltar-do-kanban]] (novo)** — `@dnd-kit` como peer opcional atrás do adaptador `useKanbanDrag`, com as três alternativas medidas, a escolha pelo risco e o gatilho de reavaliação · [[03-superficie-publica]] **§6.10 (nova)** — o contrato de `onCardMove` (índice de soltura e vizinhos; nada no mesmo lugar), toque e teclado, cartão padrão, eventos opcionais, layout, os quatro blocos do detalhe do cartão; linha `DataDisplay` da §6; §7.1 (já registrado) · [[13-instalacao-e-atualizacao]] §2 (as duas peers opcionais; a contagem de peers passa ao comando que conta) · `adr/README.md`. Ficou de fora: **a medição em aparelho e em navegador real** do quadro — por decisão do dono, ela só acontece no primeiro importador atualizado com a 8.0.0 (`00-backlog` item 20); falhou, o ADR-019 se reabre |

> ⚪ **A `plan-90` foi SINTETIZADA e REMOVIDA em 2026-10-09.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **90** | [[02-design-engine]] §9.1 — o `body` mora num lugar só (`_elements.css`) e cede à classe, e sai de *"o que ainda não cede"* (fica só o `background-color !important` dele); **regra nova:** a lib alcança cartão por âncora explícita (`.sarak-card`, `.card`, `.bg-theme-card`), nunca por substring de nome de classe; custom property nunca referencia a si mesma, e a reserva vale sem o engine; o spec de navegador novo · [[11-testes-e-cobertura]] §7.3 — os dois arquivos de `browser-tests/`, as famílias novas (cascata sob textura, render sem Provider, `body`, estilo inline dos átomos, seta do select, busca do painel) e o que a medição não vê (latência de chunk). Ficou de fora: as notas de migração da 8.0.0 continuam com classificação abaixo de MAJOR em `docs/migracoes.md` (correção pela via direta, pendente) |

> ⚪ **As `plan-98`, `plan-100` e `plan-101` foram SINTETIZADAS e REMOVIDAS em 2026-10-09.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **98** | [[03-superficie-publica]] **§6.7 (nova)** — `useOverlay().confirm()` com `Promise<boolean>` (`false` em cancelar, Esc, troca de overlay e desmontagem; inerte fora do Provider), `SarakModal` com cinco tamanhos por token, `SarakEmptyState` com título/descrição/ação/ícone, `SarakProgress` (limiares, indeterminado, `progressbar`), toast com título e ação (mínimo de 5 s). Ficou de fora: nada |
> | **100** | [[06-painel-de-customizacao-e-preview]] **§2.3 (nova)** — o caminho escolher/ajustar/aplicar, "Começar de um tema", a Galeria de estilos sob demanda, a barra de ações (`Aplicar (N)` como porta única, Descartar global e por pilar, Exportar, Desfazer) e o menu Avançado · §3 (selo de dispositivo; rótulos ≥ 12 px) · §4 (toda porta que escolhe tema só altera o rascunho) · §4.2 (o desfazer na barra de ações) · §6.2 (barra do preview; empilhado pela altura do contêiner) · **§6.6 (nova)** (pilar ↔ tela em dois gestos; seis telas e "Mais telas") · §11. Ficou de fora: a medição do painel em navegador real (não há caso em `browser-tests/`; é da `plan-90`) |
> | **101** | [[03-superficie-publica]] **§6.8 (nova)** — o motor de gráficos: tema e paleta categórica, `type` opcional, várias séries, os 17 formatos (com `waterfall`, `sankey` e `calendar`), estado vazio e ARIA, `recharts` como alternativa limitada, decisão de não trocar de biblioteca · [[09-temas-e-presets]] §4.4.3 e §10 (os sete tokens de gráfico têm consumidor). Ficou de fora: nada |
>
> Na mesma ação, por divergência que o HEAD desmente: [[03-superficie-publica]] §7.1 (o `SarakKanban` passou a ser
> lazy, com `@dnd-kit` como peer opcional — a síntese completa da `plan-102` espera o veredito final dela);
> [[06-painel-de-customizacao-e-preview]] §1 (`SarakCustomizationPanel`, nome do barril) e §6.2
> (`SarakDeviceProvider`); [[00-contexto]] §4 (linhas para o painel e para tradução).

> ⚪ **As `plan-89` e `plan-97` foram SINTETIZADAS e REMOVIDAS em 2026-10-08.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **89** | [[05-cromo-e-slots]] §2.2 (o slot `secondaryContent`: vista dividida por container query da região, 1024 px; `@container` só com a vista ativa) e §2.4 (`maxContentWidth`, `layoutDensity` com `comfortable` como identidade, `isSplitViewEnabled`; `ORPHAN_TOKENS` vazia) · [[01-gates-e-baseline]] §2.2 e §9.6 (a lista de órfãos zerou) · [[11-testes-e-cobertura]] §7.3 (a medição de navegador cobre token de cromo por recorte nomeado; sai do que ela não vê) · [[07-responsividade-e-multidispositivo]] (o modo do cromo segue a janela, a vista dividida segue a região). Ficou de fora: nada |
> | **97** | [[03-superficie-publica]] **§6.3.1 (nova)** — tabela semântica com `render`/`align`/`onRowClick` e três estados (também nos cartões do celular), grade com `rowHeight` variável, paginação com resumo, os quatro formatadores públicos, `SarakValue` com cor por sinal pelos tokens de status, métrica completa. Ficou de fora: nada |

> ⚪ **As `plan-96` e `plan-99` foram SINTETIZADAS e REMOVIDAS em 2026-10-07.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **96** | [[03-superficie-publica]] §6.3 **reescrita** — o dado vem do host: `data` ou `load`, `SarakForm` por `onSubmit`, `SarakChat` por `onSend`/`loadModels`, sem controle sem callback, sem suposição de produto sobre o dado, gráficos só com o dado do host · [[10-seguranca-e-acessibilidade]] §3.1 (login-only por padrão, cadastro/MFA/social opt-in, rótulos por `labels`, `autoComplete` do navegador, `errorVariant`; o aviso de que o gate de autenticação não existia saiu, porque existe e varre todo `src/`) e §3.2 (a lib não faz rede; `axios` não é peer) · [[08-identidade-do-host-e-zero-marca]] §8 — conceito de produto também é marca · [[00-regras-e-invariantes]] R32 (exemplo, escopo do gate e o que ele não vê) · [[13-instalacao-e-atualizacao]] §2.3 e [[05-build-e-distribuicao]] §2.1/§4 — 18 peers, 9 obrigatórias (destino que a plan não declarou e o diff exigiu). **Registrado no [[00-backlog]]:** item 11, nenhum gate impede rede nova em `src/`. A nota MAJOR já está em `docs/migracoes.md`, seção 8.0.0 |
> | **99** | [[06-painel-de-customizacao-e-preview]] §2.1 **reescrita** — Impacto × Essencial × Completo, o campo `visualImpact` no catálogo e por que `importance` não serve; **§2.2 (nova)** — a busca por sentido (`searchTokens`: o que indexa, como casa, a ordem com o conceito forte e a densidade, o caminho `Pilar › Seção`, o limite do dicionário); §11 (os testes da busca e dos três modos). Ficou de fora: nada |

> ⚪ **A `plan-95` foi SINTETIZADA e REMOVIDA em 2026-10-06.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **95** | [[03-superficie-publica]] §6.2 **reescrita** — todo ícone passa pelo `SarakIcon`: nome curado, nome registrado (`sarakRegisterIcons`) ou elemento; família, peso e espessura do tema valem para todos; nome desconhecido desenha `AlertCircle` com aviso único; marca chega por `icon` no `SarakSocialButton`; o painel de autoria fica fora · [[00-regras-e-invariantes]] **R39 (nova)** — a regra, o gate `icon-port:check` e o vão; §1.3 (38 → 39 regras, ⚠️ 12 → 13), §4 e §4.1 · [[09-temas-e-presets]] §4.2 — ícone é token como os outros, `emojiSet` deixou de ser chave · [[01-gates-e-baseline]] §2.2 e §2.2.1 · [[05-build-e-distribuicao]] §2 (o gate na fase 3). **Divergência corrigida na mesma ação:** a **R26** dizia que o consumidor só escreve os nomes curados (agora ele registra os seus) e citava `ICON_NAMES`. A nota MAJOR já estava em `docs/migracoes.md`, seção 8.0.0. Ficou de fora: o rótulo `R18` com que o Anel 1 do `pre-commit` anuncia o gate novo (código; tarefa direta despachada junto) |

> ⚪ **As `plan-92` e `plan-88` foram SINTETIZADAS e REMOVIDAS em 2026-10-05.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **92** | [[05-build-e-distribuicao]] §2 (o pipeline em **fases**, com a ordem exata apontada para o script `build`: a tabela de dez etapas estava defasada), §4 (peer obrigatória × opcional, `engines.node`) e §6 (o **selo de build**: fonte única da tríade pelo `--prepare`, os dois `buildInfo.ts` gerados, o atributo `data-sarak-build-info` no `<style>` da lib ou na `.sarak-scope`, e o que o `build-info:check` confere) · [[03-superficie-publica]] **§6.6 (nova)** — `SARAK_BUILD_INFO` · [[03-versionamento-e-release]] §6 — o gancho `version` leva os dois arquivos do selo ao commit da tag · [[13-instalacao-e-atualizacao]] §2.3, §9.1 e §10 e [[12-kit-do-consumidor]] (modo "apontar", topologias, `kitStamp`, `migracoes.md` no kit, `tokens.cssVars` só com o que a engine emite, `--theme-*` internas) — **escritos durante a execução e adotados no veredito do lote 2** como síntese antecipada; conferidos de novo agora · [[00-contexto]] §4 e §8 — **três** camadas de cache, e o selo como o que diz em qual delas se está. Ficou de fora, de propósito: as 10 variáveis `--sarak-*` que o ERP consome e a lib não emite (são da plan de atualização do ERP) e a `--sarak-font-size` do CSS estático (no [[00-backlog]]) |
> | **88** | [[01-gates-e-baseline]] §2.2 (`plan-index:check` com as referências da §4; `kit-names:check` novo; `class-merge` com a porta única; `trail-citation` com *veredito d…*), §2.2.1, §2.3 (a ordem do `build` aponta para o `package.json`), §3 (contraste: 0 pulados) e **§9.8 (nova)** — os seis alcances, com o que cada gate continua sem ver · [[00-regras-e-invariantes]] R23 (dois alcances além do kit do mantenedor), R31 (toda cadeia termina em `colorBgBody`; sai "25 pares pulados"; `SARAK_GLOBAL_THEMES`), R35 (porta única do merge) e R36 (o padrão de veredito) · [[09-temas-e-presets]] §6.5 · [[15-divida-conhecida]] — achado **23** fechado (§6), achado **18** reduzido ao par de status. **Divergências corrigidas na mesma ação:** `GLOBAL_THEMES`/`THEME_PRESET_IDS` → `SARAK_*` em [[09-temas-e-presets]] e [[00-regras-e-invariantes]]; R31 dizia que o fundo de status nunca é emitido, e é. Ficou de fora: o cabeçalho do `verify_contrast.ts` que afirma o mesmo falso (é código — item **2** do [[00-backlog]]) |

> ⚪ **A `plan-94` foi SINTETIZADA e REMOVIDA em 2026-10-05.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **94** | 🆕 [[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]] — a lib não é host; **substitui só o recorte do [[005-modelo-modulos-plugin-e-apps-separados]]** que fazia da lib o host (o 005 passa a `🔴 Substituído`, e o modo "ui-kit + central" dele continua vigente) · [[01-forma-do-produto-e-modos-de-consumo]] §2, §2.1, §4 (**um** modo de consumo; sai o §4.1 do Shell-host) · [[05-cromo-e-slots]] §1, §2.1 e **§2.1.2 (nova — o item de navegação é um link de verdade)**, §2.2.1 (os oito widgets nascem montados; o que depende do consumidor aparece desabilitado, com rótulo de estado e aviso único), **§2.2.2 (a composição da barra é do sistema, nunca do tema; padrão `pinned`)**, §2.4 (todo token tem consumidor no cromo; `hidden` da busca na sidebar saiu), §2.4.1 (gate com um grupo), §9 · [[06-painel-de-customizacao-e-preview]] **§2.1.1 (nova — a seção "Composição da Barra", visível no Essencial)** e **§6.2.2 (nova — o preview desenha o cromo real)** · [[00-contexto]] §1, §3 e a tabela de roteamento · **04-shell-e-discovery retirada** (o arquivo saiu) · varredura das menções vivas ao host em [[03-superficie-publica]] (a diferença kit × gate passou de 6 para **3**), [[00-mapa-do-modulo]] (contagens refeitas), [[07-responsividade-e-multidispositivo]], [[08-identidade-do-host-e-zero-marca]], [[10-seguranca-e-acessibilidade]] §3.3 ("a lib nunca escreve na URL" voltou a ser verdade), [[11-testes-e-cobertura]], [[13-instalacao-e-atualizacao]] (o starter gera `App.tsx`) e [[01-gates-e-baseline]]. Ficou de fora, de propósito: as tabelas históricas (versões em `03-versionamento`, achados em `15-divida-conhecida`) e os ADRs 001, 002, 003, 006, 007, 009 e 014, que registram o que se sabia na época. **Dívida registrada no [[00-backlog]]:** a opção `dock` do token `navigationStyle` continua oferecida pelo schema e nenhum cromo a implementa. A mudança é **MAJOR** (`8.0.0`): 22 nomes saem do barril e o modelo de usuário do cromo é `{ name, role?, avatarUrl?, email? }` |

> ⚪ **A `plan-93` foi SINTETIZADA e REMOVIDA em 2026-10-04.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **93** | 🆕 [[017-porta-de-apagar-tema-simetrica-a-de-escrever]] — a porta de apagar; **substitui só o recorte do [[011-tema-salvo-por-uma-porta-de-escrita]]** que dizia que ela não existe (o 011 passa a `🔴 Substituído`, e o resto dele continua vigente) · [[09-temas-e-presets]] §4.3 (a ordem do tema resolvido no boot: prop controlada, par salvo, `initialTheme`), §4.4.1 (trocar `tenantId` recarrega), §4.4.2 (a porta entrega **e recebe** o par; a lib não grava sem mudança; todo caminho que aplica anuncia o id antes de gravar) e §4.6 (a porta de apagar) · [[03-superficie-publica]] **§6.5 (nova)** — o contrato de tipo do Provider para quem persiste. Ficou de fora, de propósito: os três achados do `audit` que o baseline já carrega. **Efeito colateral registrado:** a `plan-94` reservava o ADR **017** e passou a reservar o **018**. A mudança de tipo de `customThemes`/`allThemes` e o `deleteTheme` obrigatório fazem da próxima release candidata a **MAJOR** |

> ⚪ **A `plan-87` foi SINTETIZADA e REMOVIDA em 2026-10-03.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **87** | [[00-regras-e-invariantes]] **R38 (nova)** — a regra, o gate e o vão; §1.3 (37 → 38 regras, ⚠️ 11 → 12), §4 e §4.1 · [[01-gates-e-baseline]] §2.2 e §2.2.1 (o gate no catálogo e na tabela de onde roda) e §9.4 (a convenção `§7.3` deixou de valer para os prompts) · [[02-enforcement-por-commit]] **§2.0 (nova)** — a trava como primeiro passo dos dois hooks, de qualquer branch · [[17-contrato-de-operacao-git]] §2.0 — a porta da autorização tem forma mecânica · [[00-contexto]] §7. Os prompts, o molde e este índice foram editados pela própria execução. Ficou de fora, de propósito: a afirmação de que o commit pela UI do VS Code não dispara a trava (não foi medida; está no [[00-backlog]]) e as cinco citações de `[[00-prompt-revisor]] §7.4` por cabeçalho, que continuam válidas |

> ⚪ **A `plan-86` foi SINTETIZADA e REMOVIDA em 2026-10-02.** Destino demonstrado:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **86** | [[11-testes-e-cobertura]] §3.5 (*suíte verde* é `npx vitest run` sem flag; a intermitência era **contenção entre workers**, 15 execuções seguidas verdes), §5 (`maxWorkers: 4` e `exclude` de `.claude/**`, com o motivo) e §7.3 (harness de navegador buildado **uma vez**, no `globalSetup`, um worker) · [[15-divida-conhecida]] — achados **44** e **47** fecharam (§6), e o **43** deixou de depender do 44 · [[16-integracao-continua]] §4.3 — custo do `cromo-css-real` remedido (69–83 s; 37–47 s nos 22 casos). Ficou de fora, de propósito: o piso de cobertura (decisão do achado 43) |

> 🔵 **O [[00-backlog]] zerou em 2026-10-02: os 34 itens foram conferidos contra o código e promovidos pelo
> dono, agrupados por causa comum.** Nenhum deixou de valer. **Destino demonstrado** de cada linha removida
> de lá, como a [[00-contexto]] §5 exige:
>
> | Itens do backlog | Para onde foram |
> |---|---|
> | 5 · 12 | `plan-86` — paralelismo sem teto nos dois runners |
> | 1 · 9 · 10 · 11 · 31 · 32 · 35 | `plan-87` — regra de processo que só existia em prosa |
> | 16 · 25 · 26 · 27 · 34 | `plan-88` — gate que mede menos que a regra |
> | 7 · 13 · 24 · 30 | `plan-89` — token de cromo sem efeito ou sem medição |
> | 3 · 4 · 6 · 20 · 28 · 29 | `plan-90` — CSS que o `jsdom` não vê |
> | 18 · 19 · 21 · 23 · 36 · 37 | `plan-91` — a superfície promete e não entrega |
> | 22 | `plan-93` — o par design + id do tema fecha o ciclo (movido da `plan-91` em 2026-10-03, com a análise dos consumidores) |
> | 17 | `plan-92` — nada diz qual build o navegador executa |
> | 15 | [[10-seguranca-e-acessibilidade]] §2.1 — limite declarado do predicado de mídia; não é defeito |
> | 8 | [[15-divida-conhecida]] — achado **57** (o padrão sem fronteira de palavra, demanda do ecossistema) e achado **54** (o modo de leitura do Anel 0) |
>
> **A ordem da fila não é a do número:** a `plan-92` vem em terceiro porque a etapa seguinte do repositório
> — validar a lib nos sistemas que a aplicam — começa pela pergunta que ela responde. **`plan-89` → `plan-90`
> → `plan-91` são sequenciais** (as duas primeiras estendem os mesmos arquivos de `browser-tests/`; as duas
> últimas tocam `SarakSelect.tsx`), e a `plan-89` espera a `plan-86`, que estabiliza o runner de navegador.

> ⚪ **As `plan-85` e `plan-84` foram SINTETIZADAS e REMOVIDAS em 2026-09-27, e as `plan-83` e `plan-80` em 2026-09-30 A `plan-82` fechou a fila em 2026-10-02.** O arquivo saiu; a verdade delas vive nas specs
> fixas, e o rastro de execução no Git — `git log --diff-filter=D -- specs/plan/` a recupera. **Destino
> demonstrado**, como a [[00-contexto]] §5 exige de toda remoção:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **85** | [[05-cromo-e-slots]] §2.4 e §2.4.1 — o respiro do conteúdo por token, nos quatro lados e nos dois modos · o escopo do gate em **dois** schemas, sem lista fechada · e a regra nova: **CSS global não é consumo do cromo** |
> | | [[01-gates-e-baseline]] §2.2 e §2.2.1 — o `chrome-token-parity:check` entrou no catálogo e na tabela de onde cada gate roda, o que **fechou o item 2 do [[00-backlog]]** · **§9.6 (nova)** — os dois vãos que fecharam e os quatro limites que continuam declarados |
> | **84** | [[05-cromo-e-slots]] **§5 reescrita** — a raiz do cromo tem altura de janela e contém o excedente · **§5.1 (nova)** — o contrato de rolagem: o documento não rola, o painel de conteúdo rola, o `<nav>` da barra lateral rola por dentro, e as faixas ficam no lugar |
> | **83** | [[03-superficie-publica]] **§6.4 (nova)** — o contrato de valor dos átomos de escolha: `checked` de quem chama governa, `defaultChecked` semeia, a pele é o valor efetivo — e o `SarakSwitch` é a exceção, sempre controlado |
> | **80** | [[09-temas-e-presets]] §2.1 (a isenção de `contraparte` acabou), §4.3 (id de tema que sumiu → referência do modo + um `warn`), §5.2 (a tabela 18→23 sai; fica a relação e a fonte viva) e §7 (o que um tema shippado exige) · [[05-cromo-e-slots]] §2.4 — **duas** varreduras de realce: ativo e hover, este nos dois modos |
> | **82** | [[03-superficie-publica]] **§4.3 (nova)** — a convenção de prefixo por espécie de nome, a allowlist com motivo e autolimpeza, e os três limites do gate · [[00-regras-e-invariantes]] **R37** + a linha do inventário da §4.1 · [[01-gates-e-baseline]] §2.2 e §2.2.1 (o `prefix:check` roda no `build`, não no `pre-commit`) e **§9.7 (nova)** — o vão de origem do dado |

> **A ordem da coluna `#` não é a ordem do número da plan** — e isso é a feature, não um erro. Numeração é
> identidade; a coluna `#` é o plano.
>
> 🔴 **A leva 28–50 foi SINTETIZADA e removida em 2026-08-15**, e o texto que explicava a ordem dela saiu
> junto. Destino demonstrado, como manda [[00-contexto]] §5: as decisões viraram spec fixa (a camada 3 e
> suas quatro regras em `07-responsividade`, o contrato de persistência em `09-temas-e-presets`, as duas
> camadas de cache em `13-instalacao-e-atualizacao`, os gates novos em `01-gates-e-baseline`), e o rastro de
> execução vive no Git — `git log --diff-filter=D -- specs/plan/` recupera qualquer uma. **Arquivo e prosa
> saem juntos**: manter o texto apontando para plans removidas produziria ponteiro morto em spec, que a
> **R23** proíbe (é a mesma razão pela qual a §4 esvaziou).
>
> **A síntese de 2026-08-15 fechou TODAS as 21 aprovadas** — inclusive as quatro que dependiam de
> `15-divida-conhecida.md`, a mais delicada da leva: cinco achados saíram da §3.1 para a §6 **com o motivo
> de cada um** (três *corrigidos*, dois por *não se reproduzirem* — distinção que um "fechado" genérico
> apagaria), dois achados novos foram numerados (**41** e **42**), e a spec passou a afirmar a **relação**
> — todo número em exatamente uma seção — em vez de um total que envelhece no dia seguinte.
>
> ⚪ **As plans 51, 48, 46 e 11 foram SINTETIZADAS e REMOVIDAS em 2026-08-18.** Os arquivos saíram; a
> verdade delas vive nas specs fixas, e o rastro de execução no Git — `git log --diff-filter=D -- specs/plan/`
> recupera qualquer uma. **Esta tabela é o destino demonstrado** que a [[00-contexto]] §5 exige de toda
> remoção:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **51** | [[03-versionamento-e-release]] §6 — o gancho `version` regenera os **três** kits · [[14-artefatos-do-mantenedor]] §5 |
> | **48** | [[07-responsividade-e-multidispositivo]] §2.1 e §5 — o token `layoutGridMinCell` · [[04-contrato-de-tokens-e-paridade]] (paridade **423**, estruturais **18**) · [[01-gates-e-baseline]] §3 |
> | **46** | [[11-testes-e-cobertura]] §3.5 — o que *"suíte verde"* significa, com os tetos **por base** · [[15-divida-conhecida]] achado **44** |
> | **11** | [[11-testes-e-cobertura]] §7 — a ausência declarada · [[15-divida-conhecida]] achado **45** · **R24 → ⚠️** em [[00-regras-e-invariantes]] |
>
> ⚪ **As plans 52, 05, 10, 53 e 54 foram SINTETIZADAS e REMOVIDAS em 2026-08-19** — o ciclo do pipeline,
> inteiro. **Destino demonstrado**, como a [[00-contexto]] §5 exige de toda remoção:
>
> | Plan | Onde a verdade dela está agora |
> |---|---|
> | **52** | [[02-enforcement-por-commit]] §2.2.1 (o kit com gatilho próprio) e §3.1 (custo remedido) · [[01-gates-e-baseline]] §2.2.1 · [[11-testes-e-cobertura]] §5.1 (ambiente por arquivo, **−40,2%**) · [[14-artefatos-do-mantenedor]] §5 · achados **46** e **47** |
> | **05** | 🆕 [[16-integracao-continua]] — **a spec nasceu desta plan** · [[02-enforcement-por-commit]] §4.3.1 e §9 · [[03-versionamento-e-release]] §6.0 · [[15-divida-conhecida]] §3.4 (**categoria nova**) e achados **48**, **50**–**54**, **56** |
> | **10** | [[13-instalacao-e-atualizacao]] §5.3 e §9.4 — o `sarak-ui update` e o `^` que sumia duas vezes no Windows · achados **49** e **55** |
> | **53** | [[03-versionamento-e-release]] §3.1 (12 tags, 6 majors), §5.1 e §5.2 — os dois gates e **a assimetria** · [[01-gates-e-baseline]] §2.2 |
> | **54** | 🆕 [[17-contrato-de-operacao-git]] — **a spec nasceu desta plan** · [[00-contexto]] §4 e §7 |
>
> ⚠️ **Uma coisa mudou de significado ao ser transportada, e fica registrada aqui porque a plan sumiu.** A
> `plan-53` afirmava que a obrigação de `docs/migracoes.md` fora *"pulada 3×"*. **Não foi.** As notas dos três
> majors **estavam escritas**; faltava o **número da versão no título**, porque o leitor que exige esse
> formato nasceu dias depois delas. Sintetizar a alegação teria posto uma acusação falsa numa spec fixa — a
> [[03-versionamento-e-release]] §5.1 registra o fato correto.
>
> 🔎 **A fila esvaziou pela primeira vez em 2026-08-19, e isso expôs um defeito** que nenhum estado anterior
> alcançava: `scripts/generate-plan-index.mjs` **estourava** com `ENOENT` quando `specs/plan/` deixava de
> existir (o git remove diretório que esvazia). O diretório foi preservado com um `.gitkeep`; **tornar o
> gerador tolerante à ausência é conserto de código, e não é do revisor** — segue como decisão do dono.
>
> *(Registro datado. Consulte a tabela acima para o estado corrente da fila — prosa que afirma estado
> envelhece no dia seguinte, e é o padrão que [[15-divida-conhecida]] §3.3 cataloga.)*

> **Tarefa que não é plan não aparece nesta tabela.** As de **via direta** — instrução completa, sem
> arquivo de plan — estão na **§6**, com os prompts guardados em `plan/prompts/`.

# 2. Legenda de status

| Status | Significado | Quem move para cá |
|---|---|---|
| 🔴 A executar | Spec escrita. Aguarda a **sua vez na fila** — não é autorização para começar (§5). | revisor (ao criar) |
| 🟡 Em execução | Executor trabalhando. | revisor (ao entregar o prompt de execução para despacho) |
| 🟠 Em revisão | Execução concluída no worktree, aguardando veredito. | executor (ao entregar) |
| 🔵 Em correção | Reprovada. Prompt de correção emitido, executor refazendo. | revisor (ao reprovar) |
| 🟢 Aprovada | Verificada pelo revisor. Pronta para o usuário commitar. | revisor (ao aprovar) |
| ⚪ Sintetizada | Já absorvida nas specs fixas pelo **revisor**, autorizado pelo usuário ([[00-prompt-revisor]] §7.4). Estado **transitório**: a plan **sai do disco** e a linha sai daqui, na mesma ação. | revisor (na síntese) |
| ⛔ Bloqueada | Impedida por dependência externa/decisão pendente. **Exige motivo** na coluna Objetivo. | revisor |

> Um status só avança na ordem `🔴 → 🟡 → 🟠 → (🔵 ⇄ 🟠) → 🟢 → ⚪`. **🔵 não volta para 🔴** — correção não é
> execução nova; a plan e o histórico de vereditos são os mesmos.

> 🔴 **A coluna "Quem move para cá" fala do `status` DA PLAN, não deste arquivo** *(esclarecido em 2026-08-07)*.
> Ela e a §5 pareciam se contradizer: aqui o executor "move" 🟠, e lá está escrito que *"só o revisor edita
> este arquivo"*. **As duas estão certas, e o sujeito é que era ambíguo:** o executor move o `status` no
> frontmatter da plan — que é a **fonte da verdade** (§5) — e o revisor **espelha aqui**. O executor nunca abre
> este arquivo.
>
> **Isso deixou de ser detalhe quando o gate nasceu.** O `plan-index:check` (`plan-12`) compara os dois e
> **bloqueia o commit** na divergência. O 🟡 é do **revisor**, que o move ao despachar o prompt e roda
> `npm run plan-index` na mesma ação ([[00-prompt-revisor]] §5.3); o executor só move para 🟠
> ao entregar ([[00-prompt-executor]] §5) — e **essa transição cria uma divergência que só o revisor pode
> fechar**, e o bloqueio cai sobre quem commita, que é o dono.
>
> **A regra operacional que resolve, e é do revisor:** *espelhar o status aqui **antes de liberar qualquer
> commit**, inclusive nas liberações parciais no meio de uma execução.* Foi a falha que apareceu na `plan-15`:
> liberei os lotes 1–3 com a plan em 🟡 e o índice ainda em 🔴. Autorização pontual ao executor para editar
> este arquivo **é remendo, não solução** — repete-se a cada transição e corrói a regra de propriedade.

---

# 3. Coluna *Destino* — valores válidos

Toda plan declara, **desde o momento em que é escrita**, para onde seu conteúdo será sintetizado:

| Valor | Quando usar |
|---|---|
| `arquitetura/NN-<nome>.md` | Mudou design estrutural, stack, fronteira de módulo, contrato de API. |
| `adr/NNN-<nome>.md` | Foi tomada uma decisão técnica com trade-off. **ADR é imutável** — decisão nova = ADR novo. |
| `specs/NN-<nome>.md` | Mudou regra de negócio ou comportamento de funcionalidade. |
| `00-contexto.md` | Mudou regra inegociável, stack ou mapa de roteamento. |
| **`—` (nenhum)** | Execução que não altera verdade documentada: correção de bug sem mudança de regra, refactor de conformidade, ajuste de build/CI, limpeza. |

> Vários destinos são permitidos (`arquitetura/03-api.md` + `adr/004-...`). `—` é uma resposta legítima e
> comum — **não invente destino** só para preencher a coluna.

---

# 4. Histórico — plans sintetizadas

> 🔴 **Convenção trocada em 2026-08-11, por decisão do dono.** Até aqui a plan sintetizada era **movida**
> para `plan/executadas/` e ganhava uma linha nesta tabela *(convenção de 2026-08-07)*. Agora ela é
> **removida**: o conteúdo virou verdade consolidada na spec fixa, e o rastro de como se chegou lá vive no
> Git — `git log --diff-filter=D -- specs/plan/` recupera qualquer uma.
>
> **Por que a tabela esvaziou junto.** As linhas antigas **linkavam para os arquivos**. Apagar os arquivos e
> manter as linhas produziria ponteiro morto em spec, que a **R23** proíbe — e nenhum gate pegaria, porque o
> `deadPointers.mjs` cobre o kit gerado, não este índice. Arquivo e linha saem **juntos**, sempre.
>
> ⚠️ **A seção fica, vazia e de propósito:** é aqui que voltaria o histórico se a convenção mudar de novo, e
> a numeração das seções seguintes não se move. **Nada a escrever aqui ao concluir uma síntese.**

| Plan | Sintetizada em | Spec fixa atualizada |
|---|---|---|

---

# 5. Regras de manutenção

- **Numeração é monotônica e definitiva.** `plan-07` é `plan-07` para sempre. **Nunca renumere** uma plan já
  criada — links, vereditos e histórico apontam para ela. Ordem de execução se muda na coluna **#**, não no nome.
- **`proximo_numero_plan`, no frontmatter, é a ÚNICA fonte de `NN`.** Leia dali, use o valor e incremente na
  mesma ação — **não escaneie `specs/plan/`**, que só tem as plans ativas; as sintetizadas já saíram do disco.
  O campo **nunca regride**, nem quando uma plan é removida: número queimado é mais barato que link ambíguo.
  Ele vive **fora** dos marcadores de propósito — o gerador reescreve o bloco marcado inteiro a cada rodada.
- **A linha sai quando a plan sai.** Síntese e remoção são uma ação só ([[00-prompt-revisor]] §7.4): o
  arquivo é removido e esta linha some junto, no mesmo commit. Plan **abandonada** é caso diferente — vira
  `⛔ Bloqueada` com o motivo, e a remoção dela é **manual do usuário**, nunca de um agente.
- **Status duplicado é status divergente.** O valor aqui e no frontmatter da plan são atualizados na **mesma
  ação**. Divergiu? A **plan** é a fonte da verdade e este índice está errado — corrija aqui.
- **Dependência é contrato: não MANDE EXECUTAR uma plan cuja dependência não esteja `🟢` ou `⚪`.** O status
  `🔴` diz apenas que a **spec está escrita** — ele não é autorização para começar. Quem governa é a **ordem da
  coluna `#`**, lida junto com a coluna *Depende de*: **as plans são executadas na ordem da fila**
  *(decisão do dono, 2026-08-01)*. Por isso é normal e correto ver várias `🔴` ao mesmo tempo com dependência
  ainda aberta — a fila é que as sequencia.
- **Uma plan `🟡 Em execução` por vez**, salvo plans comprovadamente disjuntas (arquivos sem interseção) — o
  revisor declara a disjunção ao liberar as duas.
- **Só o revisor edita este arquivo.** O executor nunca o toca; ele escreve apenas na plan que executou.
- **O revisor espelha o status ANTES de liberar qualquer commit** — inclusive liberação parcial no meio de uma
  execução. O `plan-index:check` bloqueia o commit na divergência, e a divergência nasce de um movimento
  **legítimo** do executor (🟠 ao entregar; o 🟡 já foi movido pelo revisor ao despachar). Espelhar no veredito basta para o fluxo normal;
  espelhar **ao liberar** é o que cobre a liberação parcial. Ver a nota da §2.

---

# 6. Tarefas diretas pendentes — os prompts guardados

Estas **não são plans**: são tarefas de [via direta](00-prompt-revisor.md) (§6), sem `NN`, sem status de
fila e fora da tabela gerada acima. O que as traz para cá é uma decisão do dono, de 2026-09-19: os prompts
não seriam executados na mesma conversa em que nasceram, e ficariam perdidos.

⚠️ **Prompt guardado em arquivo envelhece** — é por isso que a [[00-prompt-revisor]] §1 manda mantê-lo só na
conversa. Cada arquivo diz a data em que foi escrito e o que foi medido nela. **Antes de despachar um,
confira que o código ainda é o que o bloco afirma.** Uma vez executada, a tarefa sai desta tabela e o
arquivo dela é removido: quem responde pelo resultado é o veredito do revisor, na conversa.

Origem: o relatório do agente que integra a lib no ERP Earendel, triado em 2026-09-19. A ordem é de
execução, e os arquivos vivem em [`plan/prompts/`](plan/prompts/).

> ✅ **A fila zerou em 2026-10-02.** As doze tarefas diretas e a `plan-82` foram executadas,
> revisadas e removidas; os arquivos de prompt saíram com elas, como esta seção manda. A tabela volta a
> existir quando houver prompt guardado — e o `plan/prompts/` fica, vazio, porque é onde eles moram.
