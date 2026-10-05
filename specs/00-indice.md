---
tipo: "processo"
titulo: "Índice de Execução — Mapa das Plans"
dominio: "Governança de Specs (SDD)"
status: "🟢 Vigente"
tags: ["processo", "indice", "sdd"]
relacionados: ["[[00-contexto]]", "[[00-backlog]]", "[[00-prompt-revisor]]", "[[00-prompt-executor]]"]
proximo_numero_plan: "99"
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
| 1 | [plan-92-selo-de-build-em-runtime](plan/plan-92-selo-de-build-em-runtime.md) | Permitir responder em um olhar qual build da lib o navegador executa, e fazer a instalacao pedir so o que o consumidor usa, com as tres camadas de cache e o kit documentados como sao | — | 🟢 Aprovada | specs/13-instalacao-e-atualizacao.md + arquitetura/05-build-e-distribuicao.md + arquitetura/03-superficie-publica.md + specs/12-kit-do-consumidor.md + specs/03-versionamento-e-release.md |
| 2 | [plan-88-vaos-de-gate-medidos](plan/plan-88-vaos-de-gate-medidos.md) | Fazer cinco gates passarem a ver o que a regra deles já cobra e eles hoje deixam passar, cada um provado por um caso que falha | — | 🟢 Aprovada | specs/01-gates-e-baseline.md + specs/00-regras-e-invariantes.md + specs/09-temas-e-presets.md + specs/15-divida-conhecida.md |
| 3 | [plan-94-um-cromo-so](plan/plan-94-um-cromo-so.md) | Descartar o modo host (SarakShell, descoberta de modulos e roteador proprio) e deixar o SarakAppChrome como o unico cromo da lib, com a barra completa por padrao, configuravel pelo sistema e com item de navegacao que e link de verdade | — | 🔴 A executar | adr/018 (nova) + arquitetura/01-forma-do-produto-e-modos-de-consumo.md + specs/05-cromo-e-slots.md + specs/04-shell-e-discovery.md (retirada) + specs/06-painel-de-customizacao-e-preview.md + 00-contexto.md |
| 4 | [plan-95-icones-por-uma-porta-aberta-ao-consumidor](plan/plan-95-icones-por-uma-porta-aberta-ao-consumidor.md) | Fazer a familia e o peso de icone escolhidos no painel valerem para todo icone da lib, e permitir ao consumidor trazer os proprios icones por registro ou por elemento, sem lista fechada | plan-94-um-cromo-so | 🔴 A executar | arquitetura/03-superficie-publica.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md |
| 5 | [plan-89-tokens-de-cromo-ligados-e-medidos](plan/plan-89-tokens-de-cromo-ligados-e-medidos.md) | Fazer todo token de layout que o painel oferece ter efeito no cromo, com a medição de navegador cobrindo tema que sobrescreve token de cromo | plan-94-um-cromo-so | 🔴 A executar | specs/05-cromo-e-slots.md + specs/11-testes-e-cobertura.md + specs/01-gates-e-baseline.md + specs/07-responsividade-e-multidispositivo.md |
| 6 | [plan-96-templates-sem-dominio-embutido](plan/plan-96-templates-sem-dominio-embutido.md) | Fazer nenhum componente da lib conhecer URL, cliente HTTP, rota de dominio, texto fixo em portugues ou conceito de um produto, de modo que os templates sirvam a qualquer sistema | plan-95-icones-por-uma-porta-aberta-ao-consumidor | 🔴 A executar | arquitetura/03-superficie-publica.md + specs/10-seguranca-e-acessibilidade.md + specs/08-identidade-do-host-e-zero-marca.md + specs/00-regras-e-invariantes.md |
| 7 | [plan-90-css-que-so-o-navegador-mede](plan/plan-90-css-que-so-o-navegador-mede.md) | Fazer cinco defeitos de CSS da lib terem caso de navegador que falha hoje e passa depois do conserto, e medir um relato de perda de digitação no painel | plan-89-tokens-de-cromo-ligados-e-medidos | 🔴 A executar | arquitetura/02-design-engine.md + specs/11-testes-e-cobertura.md |
| 8 | [plan-97-dados-tabela-estados-valor-e-metrica](plan/plan-97-dados-tabela-estados-valor-e-metrica.md) | Dar a lib o que quatro sistemas refizeram a mao para exibir dado: tabela semantica com celula customizada e os tres estados, paginacao com tamanho e resumo, valor numerico formatado com cor por sinal e cartao de metrica completo | plan-96-templates-sem-dominio-embutido | 🔴 A executar | arquitetura/03-superficie-publica.md |
| 9 | [plan-91-superficie-entrega-o-que-promete](plan/plan-91-superficie-entrega-o-que-promete.md) | Alinhar ao contrato publicado os pontos em que a superfície pública promete uma coisa e entrega outra, com o erro de campo passando a ter uma forma só | plan-90-css-que-so-o-navegador-mede | 🔴 A executar | arquitetura/03-superficie-publica.md |
| 10 | [plan-98-dialogo-e-feedback](plan/plan-98-dialogo-e-feedback.md) | Dar a lib as pecas de dialogo e feedback que tres sistemas refizeram a mao: confirmacao imperativa, modal com tamanhos, estado de pagina com titulo e acao, barra de progresso e toast com titulo e acao | plan-97-dados-tabela-estados-valor-e-metrica | 🔴 A executar | arquitetura/03-superficie-publica.md |
<!-- SARAK-INDICE:FILA:FIM -->

> 🌊 **A ordem da tabela segue as ondas de execução** *(decisão do dono, 2026-10-04: encurtar o ciclo entre
> execução e correção)*. É plano, não estado — o estado corrente é a coluna *Status* acima. Duas plans da mesma
> onda só correm juntas se o **revisor declarar a disjunção ao despachar as duas** (§5), na mesma árvore, com a
> suíte completa de **uma** por vez e a verificação conjunta no fim.
>
> | Onda | Plans | O que a torna possível | Restrição |
> |---|---|---|---|
> | 1 | **92** (lote 2) ‖ **88** | Disjuntas na fonte; o `package.json` é tocado em chaves diferentes (`peerDependenciesMeta`/`engines` × `scripts`) | O kit final da 92 tem de passar no gate de nomes do kit da 88 |
> | 2 | **94** | Caminho crítico: libera a 89 e a 95, e por elas todas as outras | **Sozinha na árvore** — ela remove o modo host e pode deixar o projeto sem compilar por longos trechos |
> | 3 | **95** | A cadeia 95→96→97→98 é a mais longa | A 89 colide com ela (`navItem.ts`, `schema/system.ts`), por isso não é par |
> | 4 | **89** ‖ **96** | Só dividem `docs/migracoes.md` | Cada uma põe a nota dela, sem reescrever o arquivo |
> | 5 | **90** ‖ **97** | Sem interseção de arquivo | — |
> | 6 | **91** ‖ **98** | Dividem `src/core/i18n/` | Coordenar as chaves de texto, ou rodar a 91 antes da 98 |
>
> Dentro de uma onda de duas, o primeiro veredito a chegar não espera o outro. Commit é por plan, com
> `git add` por caminho; os artefatos gerados (`dist/`, `sarak-ui/`, `sarak-dev/`) são regenerados uma vez,
> pelo último a terminar.

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
