---
tipo: "plan"
titulo: "Fechamento do arsenal: injecao sem disputa de canal, cascata e movimento que cedem ao tema, painel e descricoes que dizem a verdade, travas sem furo e contraste dos pares que faltavam"
objetivo: "Corrigir o residuo que a re-auditoria de fechamento da plan-114 mediu nos pontos cegos das travas, em tres lotes revisados um a um, fechar os furos das proprias travas e repetir a re-auditoria ate zero, antes de os temas serem refeitos"
dominio: "Design Engine / Injecao / CSS do motor / Painel / Contraste / Gates"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "design-engine", "injecao", "cascata", "movimento", "painel", "contraste", "gate", "temas"]
relacionados: ["[[02-design-engine]]", "[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "arquitetura/02-design-engine.md + specs/06-painel-de-customizacao-e-preview.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md"
---

# 1. Objetivo

O que o tema declara aparece igual nos modos App e Embarcado e sobrevive à troca de tema; nenhuma regra do motor,
nem montada em TypeScript, atropela o componente; a velocidade do tema chega a toda transição; o painel mostra a
descrição verdadeira de cada token e não apaga o que não entende; nenhum token do painel deixa de desenhar; as
travas não têm os furos medidos; e os pares de contraste desenhados que faltavam passam.

# 2. Contexto

**Decisão do dono, 2026-10-13:** criar esta plan com o resíduo da re-auditoria de fechamento da `plan-114`, antes
de refazer os temas (`plan-110`, lote 1 em espera).

A `plan-114` zerou as categorias da primeira verificação (dono de variável, nome sem dono, reserva, contrato de
tema, controle do painel, cor que busca recurso). A re-auditoria de 2026-10-13 foi instruída a procurar **o que cada
trava declara não ver** e mediu classes novas: a disputa entre o valor inline e o `<style>` responsivo, a variável
inline nunca removida, o material de superfície sempre ativo com `!important`, a duração padrão das transições
desligada do token, a descrição que o painel não mostra, tokens que o gate dá como lidos sem efeito, e furos nas
próprias travas. A lista medida, com arquivo e linha, está em
[`anexos/plan-115-residuo-da-reauditoria.md`](anexos/plan-115-residuo-da-reauditoria.md).

| Lote | Classe | Peso |
|---|---|---|
| **1 — Injeção, cascata e movimento** | canto editado que não aparece no modo App; valor do tema anterior que persiste; material com `!important` sempre ativo; padding e sombra da camada final; `!important` em TypeScript; transição a 150 ms fixos | o que o tema declara não chega, ou chega diferente por modo |
| **2 — Painel, descrições, tokens e travas** | descrição ausente em 391 controles; campo numérico sem faixa; seletor que apaga `var()`; faixas meio mortas; valores fora do passo; catálogo duplicado; descrições falsas; tokens sem efeito; leituras mortas; furos de quatro travas | o painel e o schema dizem uma coisa e a tela faz outra |
| **3 — Contraste e valores fixos** | 6 pares desenhados fora do verificador; contrapartes sem aviso/informação; valores fixos restantes em componentes e mocks | ilegível em alguns temas; mocks que não mostram o tema |

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/hooks/`, `src/core/Provider/components/` (injetor), `src/core/Provider/utils/`, `src/core/Design/schema/`, `catalog/`, `presets/themes/` (só trocar valor que o contrato exigir e a cor de contraparte que reprovar — sem redesenho), `src/styles/`, `src/components/**`, `src/features/DesignEngine/**`.
- `gates/` — os furos medidos (anexo R2.10) e as travas novas de cada lote, com limites (R18) e mutação; `gates/scripts/audit/verify_contrast.ts`.
- `browser-tests/`, testes unitários, `docs/migracoes.md` (subseção em `## 8.0.0`), artefatos regenerados.

## 3.2 Fora
- Redesenhar tema (`plan-110`). Criar componente. Token novo só quando o componente existe e o aspecto que um tema espera controlar não tem token (ex.: sombra de sobreposição) — declarado no resumo antes de criar.
- Mudar o desenho padrão sem declarar: diferença vai na nota MAJOR, com o motivo.
- Qualquer spec em `specs/` (síntese do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/plan-115-residuo-da-reauditoria.md` | a lista medida, por lote |
| Spec fixa | `arquitetura/02-design-engine.md` (§4, §9.1, §10) | emissão, camadas, o que cada token desenha, cascata, um dono, cor e texto sobre cor sólida |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` (§3) | controles e descrição |
| Spec fixa | `specs/09-temas-e-presets.md` (§4.2, §6) · `specs/10-seguranca-e-acessibilidade.md` (§2.1) | contrato de tema, travas de tema, validação |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R18, R31, R40-R44) · `specs/01-gates-e-baseline.md` (§2.2) | as regras e os gates que esta plan aperta |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-arquitetura-design` · `ui-refatorar-componente` · `dataviz` · `padrao-escrita` + `padrao-typescript` · `test-unitario` | CSS do motor, token, contraste, escrita, testes |
| Código | `src/core/Design/hooks/useDesignVariables.ts`, `src/core/Provider/components/DesignInjector.tsx`, `src/core/Provider/components/SovereignThemeInjector.tsx`, `src/styles/_surfaces.css`, `src/features/DesignEngine/Main/components/TokenControl.tsx`, `gates/scripts/contrato/helpers/variable-contract-core.ts`, `gates/scripts/contrato/check-token-reader.mjs` | onde moram os defeitos de maior peso |

# 5. Instruções de execução

**Três lotes, nesta ordem, um por vez.** Cada lote termina com resumo **num bloco novo** da §9 (append-only: não
editar bloco anterior) e status 🟠; o próximo só começa depois do veredito. Cada item do anexo termina corrigido, ou
fora com motivo medido.

1. **Lote 1 — Injeção, cascata e movimento (anexo, Lote 1).** O valor que o tema declara vale igual nos modos App e
   Embarcado, qualquer que seja o formato (escalar ou responsivo) de mestre e exceção; trocar de tema não deixa valor
   do tema anterior. O material e a moldura escolhidos por atributo não atropelam a classe do componente (o padrão do
   material mora na camada que cede, como o do cartão); padding, sombra e recorte do cartão cedem à classe; o
   injetor de modo claro não monta `!important` sobre componente que já lê o tema, e o lightbox fica legível; a
   duração e a curva padrão das transições do Tailwind vêm de `motionDuration*`/`motionEaseMain`. Prova em navegador
   para cada item, com a contraprova do padrão, nos dois modos de injeção.
2. **Lote 2 — Painel, descrições, tokens e travas (anexo, Lote 2).** O painel mostra a descrição do schema em todo
   controle; o campo numérico tem faixa, passo e unidade e não grava `NaN`; o seletor de cor não apaga `var()`,
   `color-mix()`, `hsl()`; faixas de slider só cobrem o que o CSS desenha; valores de tema na grade do `step` (e a
   validação confere a grade); o catálogo sem entrada duplicada; descrição e rótulo dizem o que o código faz (ou o
   código passa a fazer o que a descrição promete, quando o componente existe — `neumorphism` do botão, por exemplo:
   leitor, ou a opção sai); token sem efeito ganha leitor ou sai do schema (regra da `plan-113`); leituras e escritas
   mortas saem; os furos das quatro travas (anexo R2.10) fecham, cada um com caso de mutação.
3. **Lote 3 — Contraste e valores fixos (anexo, Lote 3).** Os pares desenhados que faltavam entram no verificador e
   passam nos 14 temas × 2 modos; a contraparte declara as cores que reprovam no modo oposto; os valores fixos
   restantes leem o token; os mocks do painel mostram o tema (o detector de cor fixa passa a ver hex e `rgba` quase
   preto/branco em `src/features/`).
4. **Em todo lote:** testes unitários do que é JS; casos de `browser-tests/` para cada efeito de CSS (o padrão de
   cada caso é o que a cena aplica); nota MAJOR na `## 8.0.0`; gerados regenerados (`guide` por último); simulação
   do Anel 0 sobre as linhas adicionadas.
5. **Travas:** cada classe nova fechada ganha trava (gate novo ou extensão justificada), com limites no cabeçalho
   (R18), caso de mutação, falhando no `HEAD` anterior, ligada ao Anel 1 e à CI. Em particular: valor do mesmo token
   em canais que disputam (inline × `<style>`) e variável inline órfã (lote 1); descrição exibida em todo ramo de
   controle (lote 2).

# 6. Critérios de aceite

- [ ] Lote 1: canto/mestre iguais nos dois modos em todo formato; troca de tema sem valor órfão; material, padding, sombra e recorte cedem à classe; injetor de modo claro sem atropelo; transição pelo token — com casos de navegador.
- [ ] Lote 2: descrição em todo controle; campo numérico com faixa e sem `NaN`; seletor de cor sem perda; faixas e grade; catálogo sem duplicata; descrições verdadeiras; zero token sem efeito; zero leitura/escrita morta; os quatro furos das travas fechados com mutação.
- [ ] Lote 3: os pares do anexo medidos e verdes; contrapartes completas onde reprovavam; valores fixos lidos do token; mocks seguindo o tema.
- [ ] Uma trava por classe nova, falhando no `HEAD` anterior e passando depois.
- [ ] Paridade, `auditor_presets`, `tokenContractParity`, `shippedThemesConsoleClean` e contraste verdes.
- [ ] Nota MAJOR em `## 8.0.0` a cada lote.
- [ ] Suíte completa verde numa passada (repetida depois do último conserto); `tsc` 0; `audit:baseline` sem regressão; Anel 1 inteiro; casos de `browser-tests/` escritos (o revisor roda `npm run build` e `cromo-css-real:check`); Anel 0 simulado: 0.
- [ ] Fechamento: o revisor repete a re-auditoria completa (as três frentes) e o resultado nas categorias medidas é zero.

# 7. Como verificar (uso do revisor)

- `git diff --stat` → só a §3.1 e os gerados.
- Cada item do anexo do lote: no código e, quando é CSS ou injeção, no navegador (inclusive no modo Embarcado).
- Cada trava: falha no `HEAD` anterior; mutação faz falhar.
- `npm run build` + `npm run cromo-css-real:check` · `npm run audit` · `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline -- --with-tsc` · Anel 1 · simulação do Anel 0.
- Depois do lote 3: as três re-auditorias.

# 8. Destino da síntese

**Destino:** `arquitetura/02-design-engine.md + specs/06-painel-de-customizacao-e-preview.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md`

- **`02-design-engine`:** como o motor escreve sem disputa de canal e limpa o que sai; material na camada que cede; transição padrão pelo token.
- **`06-painel`:** descrição em todo controle; campo numérico; cor sem perda.
- **`09-temas-e-presets`:** grade do `step` conferida; contrapartes; pares de contraste novos.
- **`00-regras` e `01-gates`:** as travas novas e os furos fechados (R40-R44 atualizadas, ou regra nova).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido nem reescrito. -->

## Resumo da execução (lote 1 — injeção, cascata e movimento) — 2026-10-13

**Resultado:** Concluído com pendências (as pendências são do revisor: `npm run build` e `cromo-css-real:check` oficiais; o §10.8/§9.1 da spec 02 fica desatualizado — ver *Achados fora do escopo*).

**Estado do worktree ao iniciar**
(limpo) — `HEAD` `b4096683`. Durante a execução apareceram, sem que eu os tocasse, `specs/00-indice.md`, `specs/plan/plan-110-…md` (modificados) e `specs/plan/plan-116-tema-sob-demanda.md` (novo): são do revisor.

**Como o motor passa a escrever sem disputa de canal (R1.1/R1.2)**
- Escalar vai inline, responsivo vai ao `<style>`; o inline vence. O defeito era o mestre (`cardBorderRadius`, `btnBorderRadius`) listar o canto em `cssVars` e o canto declarado vir por outro canal. Agora `collectDeclaredExceptionVars` (`designVariableHelpers.ts`) devolve o nome (autoVar e `cssVars`) de toda exceção **declarada**, e o laço de tokens não escreve esses nomes pelo mestre (`useDesignVariables.ts`, `writesVar`): **a variável de um canto declarado tem um dono só, a exceção, no canal do formato dela**; os outros cantos seguem o mestre, no formato dele. Vale igual para App e Embarcado (mesmo `variables`/`responsiveCSS`).
- Limpeza: `syncInjectedWrites` (novo, `Provider/utils/injectedWrites.ts`) lembra por elemento o que escreveu e remove variável e atributo que o tema novo não escreve; o `DesignInjector` o chama por alvo (html/body, ou a ilha). O que o host gravou por fora não é tocado.

**O que foi feito**
- R1.1/R1.2 — `useDesignVariables.ts`, `designVariableHelpers.ts`, `injectedWrites.ts`, `DesignInjector.tsx`.
- R1.3 — material (`frosted/sleek/industrial/organic`) e moldura do cartão saíram de `_surfaces.css` (camada final, `!important`) para `_card-materials.css`, em `components.sarak-elements` **depois** de `_card-defaults.css`, sem `!important`, alvo `.sarak-card`. A moldura do `.border-theme` (classe `!important` por desenho) ficou em `_surfaces.css`, por atributo com valor, só contorno.
- R1.4 — padding, `position`/`isolation`, sombra base (e as variáveis `--sarak-card-shadow-*`), sombra declarada, recorte (`--sarak-card-clip-path`) e a sombra sob o ponteiro passaram para a camada que cede (`_card-defaults.css`/`_card-materials.css`); `_cards.css` ficou só com brilho, hover-style e botão de ação; o recorte de `_atmosphere.css` e o polígono de `_cards.css` saíram.
- R1.5 — **resolvido, não declarado**: nenhuma regra do motor mira `.bg-theme-card` (era alvo em `_cards`, `_card-defaults`, `_surfaces`, `_atmosphere` ×86, `_performance`, `_utilities`); é só a utilitária de cor de `--color-theme-card`. Os 8 usos de `src/features/` que queriam cartão inteiro passaram a `sarak-card`; a etiqueta de `PresetCard.tsx` mantém `bg-theme-card` (só a cor).
- R1.6 — `.bg-theme-card:active` e o "Geometric Modifier" (`is-geometric`, nunca emitido; `data-geometric` só era lido por ele) saíram; o `transform` do `button:active` foi para `_elements.css`, sem `!important`. `data-geometric` saiu dos 4 cartões que o emitiam.
- R1.7 — `SovereignThemeInjector.tsx` reescrito: sem `!important`, seletores com `:not([data-sarak-own-palette] *)`; `SarakLightbox` põe o atributo na raiz (constante em `scope.ts`).
- R1.8 — `_theme.css` (`@theme`): `--default-transition-duration: var(--sarak-motion-dur-fast, 0.2s)` e `--default-transition-timing-function: var(--sarak-motion-ease-main, cubic-bezier(0.4, 0, 0.2, 1))`.
- R1.9 — `[data-tabular-nums=…]` saiu de `_typography.css` (o `.tabular-nums` fica).
- Para não regredir o preview e a lib: removi `shadow-*`/`backdrop-blur-*` literais de elementos `.sarak-card` que, até aqui, perdiam para o motor e agora venceriam o token (`SarakExpandableCard.tsx:56,129`, `KitchenSinkPreview.tsx:19`, `ChatMock.tsx:21,98`, `MockDocuments.tsx:66,88,111`, `MockForms.tsx:33,113,136`, `TableMock.tsx:31,89,118`, `CardsCatalog.tsx:71`).
- Travas: `check-channel-dispute.ts` (novo, Anel 1 + CI + `npm run channel-dispute:check`) e extensão do `css-important:check` para `!important` em string/template de TypeScript (`TS_EXCEPTIONS` vazia). Limites no cabeçalho dos dois (R18).
- Nota MAJOR em `docs/migracoes.md` (`## 8.0.0`), antes de "Exports removidos do barril público".

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/hooks/useDesignVariables.ts` · `designVariableHelpers.ts` | alterado | um canal por variável (exceção declarada é dona); arquivo 249 linhas |
| `src/core/Provider/utils/injectedWrites.ts` + `__tests__/injectedWrites.test.ts` | criado | escrita com limpeza por elemento |
| `src/core/Provider/components/DesignInjector.tsx` · `SovereignThemeInjector.tsx` · `src/core/Provider/scope.ts` | alterado | usa `syncInjectedWrites`; ponte sem `!important` e com saída por atributo |
| `src/components/atomic/Media/SarakLightbox.tsx` | alterado | `data-sarak-own-palette` na raiz |
| `src/components/atomic/Cards/{ActionCard,TitleCard,SearchCard,ExpandableCard}.tsx` · `Templates/components/SarakCoreCard.tsx` | alterado | sem `data-geometric`; sem `shadow-lg` literal (Expandable) |
| `src/styles/_card-materials.css` | criado | material, moldura e sombra sob o ponteiro, sem `!important` |
| `src/styles/{_card-defaults,_cards,_surfaces,_atmosphere,_performance,_utilities,_elements,_typography,_theme,sarak-base}.css` | alterado | ver "O que foi feito" |
| `src/features/DesignEngine/Canvas/**` (previews, catálogos, 4 mocks) | alterado | `bg-theme-card`→`sarak-card`; sombra/desfoque literais fora |
| `gates/scripts/contrato/check-channel-dispute.ts` + `__tests__/check-channel-dispute.test.ts` | criado | trava nova |
| `gates/scripts/contrato/check-css-important-visual.mjs` + teste · `check-fixed-translucent.mjs` | alterado | frente TypeScript; limite cita `_card-materials.css` |
| `.githooks/pre-commit` · `.github/workflows/gates.yml` · `package.json` | alterado | `channel-dispute:check` no Anel 1, na CI e nos scripts |
| `browser-tests/{injecao-sem-disputa,cartao-cede-a-classe,ponte-do-modo-claro,transicao-padrao-do-tema}.spec.ts` | criado | 38 casos, nos dois modos, com contraprova |
| `browser-tests/fixtures/harness-entry.tsx` · `build-harness.mjs` | alterado | cenas/recortes novos; `?css=escopado` |
| `src/styles/__tests__/{cartaoQueCedeAClasse,arsenalQueDesenha,atmosferaEBotoesQueDesenham}.test.ts` · `useDesignVariablesDonoUnico.test.ts` · `DesignInjector.test.tsx` | alterado | acompanham o desenho novo + casos |
| 9 `__snapshots__/*.snap` (Cards, CoreCard, Canvas) | alterado | só: `bg-theme-card`→`sarak-card`, `data-geometric`, folha da ponte |
| `docs/migracoes.md` · `sarak-ui/docs/migracoes.md` · `sarak-dev/{GUIA-MANUTENCAO,START-HERE}.md` · `sarak-dev/state.json` | alterado | nota MAJOR; gerados (`dev-kit`, depois `guide`) |

**Verificações executadas**
- Browser, **HEAD** (cópia fora do repo, `dist/` do HEAD): os 25 casos novos dos 3 specs de cascata/ponte/transição → **25 falham, 3 passam**; `injecao-sem-disputa` → 6 falham (3 por modo) nos casos escalar/responsivo e na troca de tema.
- Browser, **worktree** (cópia fora do repo, build tsup + tailwind + escopado): `playwright test browser-tests` inteiro → **264 passed**, 0 falhas (inclui os 4 specs novos e os pré-existentes).
- `npx vitest run` completo: 1ª passada 3202 passed / 9 snapshots + 1 timeout de hook; depois de atualizar os snapshots e o último conserto, 2ª passada 3209 passed, 3 arquivos com timeout **por carga da máquina** (`kitGenerator`, `check-container-query-literal`, `generate-token-types.check`), que passam isolados (14/14, 15/15, 2/2).
- `npx tsc --noEmit` → 0 erros. `audit:baseline -- --with-tsc` → "igual ao baseline de 2026-10-12" (passou por 1 violação de `auditor_cleancode` e 6 erros de `tsc` que eu mesmo introduzi e corrigi: arquivo >250 linhas, `id` fora de `SarakDesignState` em teste).
- Anel 1 (rodei cada `*:check` do `pre-commit`): barrel, catalog, zero-brand, deep-import, gate-limits, container-query(-boundary), persistence-doc, class-merge, icon-port, chrome-token-parity, token-reader, css-important, fixed-translucent, token-types, variable-contract, panel-contract, channel-dispute, dev-kit, guide → todos OK; `guide` por último (após a última edição de `src/`). `trail-citation` sem `--staged`: OK.
- Anel 0 simulado (padrões de `gates/scripts/segredo/config.json` sobre as linhas adicionadas e os não rastreados, sem `specs/`): 2204 linhas, 0 achados.
- Gate no HEAD: `check-channel-dispute.ts` com o motor do HEAD → **48 disputas**; `css-important` (frente TS) no HEAD → **8 ocorrências** em `SovereignThemeInjector.tsx`.
- Mutação (testes dos gates): motor que volta a escrever o canto inline → `dois-canais`; motor que perde o canto → `valor-errado`; escritor sem limpeza → órfão `--sarak-card-radius-tl`; template com `!important` em TS → acusado (comentário e `__tests__` não).

**Critérios de aceite (lote 1)**
- [x] canto/mestre iguais nos dois modos em todo formato — `injecao-sem-disputa.spec.ts` (3 pontos × 2 modos × 3 formatos) + gate (8 pares × 9 formatos).
- [x] troca de tema sem valor órfão — spec (computado e inline) + gate (16 trocas) + `DesignInjector.test.tsx`.
- [x] material, padding, sombra e recorte cedem à classe — `cartao-cede-a-classe.spec.ts` (gradiente, `backdrop-blur-sm`, `border-dashed`, `p-8`/`p-0`, `shadow-none`, `absolute`; recorte por varredura da CSSOM: regra em `sarak-elements`).
- [x] `bg-theme-card` só cor — mesmo spec + `cartaoQueCedeAClasse.test.ts` (nenhum CSS o contém).
- [x] injetor de modo claro sem atropelo, lightbox legível — `ponte-do-modo-claro.spec.ts` (lightbox computa igual claro × escuro; hospedeiro com `text-white` segue repintado; folha sem `!important`).
- [x] transição pelo token — `transicao-padrao-do-tema.spec.ts` (0,45 s/curva do tema; `duration-300` decide; sem tema 0,2 s).
- [x] uma trava por classe nova, falhando no HEAD e passando depois; no Anel 1 e na CI.
- [ ] R1.9 sem caso de efeito: a regra morta não computa nada — provada por varredura da CSSOM (nenhuma regra com `data-tabular-nums`).

**Decisões e suposições**
- R1.5: optei por tirar o sentido de âncora de `.bg-theme-card` (ERP: 0 usos) em vez de declarar o limite; é quebra para consumidor externo que dependia — está na nota MAJOR.
- Moldura no `.border-theme`: mantive `!important` na camada final (a classe é `!important` por desenho) e **não** repliquei a sombra da moldura nele.
- Preview/lib: removi `shadow-*`/`backdrop-blur-*` literais de `.sarak-card` para preservar o que a tela mostrava (o token) — são classes que estavam mortas e passariam a valer. Os `p-*` literais ficaram (passam a valer; mudam o respiro dos mocks).
- `position`/`isolation` do cartão também foram para a camada que cede (não estavam na lista do anexo).
- `sarak-shell-sidebar`/`-header` não têm emissor em `src/`; tirei-os dos alvos de moldura em vez de portá-los.
- O gate (ii) exercita `syncInjectedWrites` sobre elemento de mentira (JSDOM custava ~1 s por troca); que o componente o chama é do teste do injetor e do spec.
- Embarcado nos testes de transição usa `?css=escopado` (folha `sarak-scoped.css`): com a global, o padrão do Tailwind resolve no `html`, onde a ilha não escreve.
- Os dois diretórios temporários (`C:\tmp\sarak-head`, `C:\tmp\sarak-work`) foram removidos com a junção antes; `node_modules` do repo conferido.

**Achados fora do escopo (não corrigidos)**
- `arquitetura/02-design-engine.md` §9.1 ("O que ainda não cede à classe: o `transform` do botão pressionado…"), §10.8 (material/moldura "ficam com `!important`") e §10.2 (moldura "age na barra lateral e no cabeçalho do cromo") ficam desatualizados — síntese do revisor.
- `activeThemeId` aplica `{...prev, ...tema}` (`useDesignSync.ts`): token que o tema novo não declara **herda** o valor do anterior (ex.: `cardRadiusTL` escalar do tema A persiste sob o B). Não é inline órfão, é semântica do Provider; talvez mereça decisão.
- `!p-0` em `SarakChat.tsx:45` e `SarakChatEngine.tsx:62` virou redundante (o padding cede à classe).
- `scripts/consumer-kit/__tests__/kitGenerator.test.mjs` roda ~7–9 s contra o `hookTimeout` de 10 s: flutua sob carga.
- Um teste interrompido por mim (matei processos `vitest` presos) deixou `src/core/Provider/generated/design-token-ids.ts` com uma linha plantada; regenerei com `npx tsx scripts/generate-token-types.ts` e o arquivo voltou ao do HEAD (sem diff).

**Pendências / riscos**
- `dist/` e `sarak-ui/` do consumidor não foram reconstruídos aqui (o build oficial é do revisor); medi sempre numa cópia fora do repo.
- Mudança de aparência no tema padrão: transição sem duração de 150→200 ms; `p-*`/`absolute`/hover de sombra em cartões da lib e dos mocks passam a valer (nota MAJOR). Rever nos mocks do painel: `MockForms`, `MockDocuments`, `TableMock`, `ChatMock`, `KitchenSinkPreview`.
- Lote 2 e 3 não iniciados, por instrução.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-13 — lote 1 — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK; `playwright test` sobre esse `dist/`: **264/264**, com os 38 casos novos (`injecao-sem-disputa`, `cartao-cede-a-classe`, `ponte-do-modo-claro`, `transicao-padrao-do-tema`) nos dois modos de injeção; suíte completa **477/477 arquivos, 3225/3225 testes, numa passada limpa** (máquina com ~290 processos `node` de outras origens; 992 s); `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK, com o `channel-dispute:check` novo e o `css-important:check` estendido a TypeScript; varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0. Conferido no código: `syncInjectedWrites` remove só o que o injetor escreveu; `_card-materials.css` sem `!important` (as 3 ocorrências são comentário); o aperto do botão em `_elements.css`, sem `!important`.

**Decisões do executor — aceitas:** `bg-theme-card` deixa de ser âncora de cartão (R1.5 resolvido, com nota MAJOR); moldura do `.border-theme` fica `!important` por desenho; classes literais de sombra/desfoque mortas retiradas para preservar a tela; `position`/`isolation` na camada que cede; `?css=escopado` no harness para o modo Embarcado.

**Spec × código corrigida na mesma ação:** `arquitetura/02-design-engine.md` §9.1 (o `transform` do botão cede; as âncoras de cartão; `bg-theme-card` só cor), §10.2 (material e moldura em `_card-materials.css`), §10.8 (o que fica `!important`; o injetor do modo claro) e §10.12 nova (escrita sem disputa de canal, limpeza na troca, transição padrão pelo token).

**Achados do executor roteados:** a troca de tema que herda token do tema anterior (`useDesignSync.ts`) entrou na `plan-116` (aplicar tema é dela); os timeouts sob carga (R2.11) e o `!p-0` redundante (R3.5) entraram no anexo.

**Próximo:** lote 2, depois do commit deste lote.
