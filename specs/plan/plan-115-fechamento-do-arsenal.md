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

## Resumo da execução (lote 2 — painel, descrições, tokens sem efeito e as travas) — 2026-10-13

**Resultado:** Concluído (sem pendência de critério; as pendências são verificações do revisor: `npm run build` e `cromo-css-real:check` oficiais).

**Estado do worktree ao iniciar**
(limpo) — `HEAD` `4fb63916` (lote 1 commitado).

**O que foi feito**
- R2.1 — `description` repassada em todo ramo de `ControlRegistry` (`TokenControl.tsx`) e nos ramos `color`/`select`/`font` do `DynamicTokenControl.tsx`. **Trava:** `descricaoEmTodoRamo.test.tsx` abre o `?` de um token por (despachante × tipo × responsivo) e exige o texto do schema (e nunca o genérico), mais "nenhum token sem descrição" e uma mutação (controle que esquece `description` é acusado).
- R2.2 — `number` da aba de tema é o mesmo `SliderControl` do `slider` (faixa, passo, unidade). `InputControl` numérico: texto próprio, só grava número finito, leva a `[min,max]`, repassa `min/max/step`; `""` e `"-"` não gravam `NaN`.
- R2.3 — `colorParts.ts`: `hsl()/hsla()` são literais; `resolveColorParts` pergunta ao navegador pela cor de `var()`/`color-mix()` (computado `rgb()`/`color(srgb …)`) e cai na reserva literal; `ColorControl` parte dela (swatch e alfa). O texto continua a verdade e nada é gravado sem o usuário mexer.
- R2.4 — `cardShadowSpread` máx 100 (o CSS satura em `min(100%, …)`); `vignetteSoftness` máx 60 (62,5 zera a parada) com `kinetic-flow` e `synthwave-retro` 100→60; `_theme.css` usa o fator 1,6% como os outros dois leitores.
- R2.5 — **o passo, não o tema**: `glassRoughness`, `shadowAmbientAlpha`, `shadowProjectionAlpha`, `scrollTrackOpacity`, `motionDurationFast/Normal` → 0,01; `motionDurationSlow` → 0,05; `iconStrokeWidth` → 0,25. `isOffTokenGrid` (`tokenBounds.ts`) entra em `auditTokenContract` (a função que a validação e o gate usam).
- R2.6 — 7 duplicatas do catálogo removidas (a entrada cujo `schemaOrigin` é o do schema fica; `colorBgBody/Layer1/Layer2` ganham `schemaOrigin: atmosphere.ts`); teste `catalogoSemDuplicata.test.ts`.
- R2.7 — descrições e rótulos (schema **e** catálogo): `primaryColor`, `accentColor`, `shadowIntensity`, `textColorMaster`, `bodySize`, `btnStyleType`; 13 rótulos sem o valor padrão. `btnStyleType: neumorphism` **ganhou ramo** (`useAtomicStyles.ts`, `SarakIconButton.tsx`, relevo em repouso e sombra interna no ponteiro).
- R2.8 — **leitor, não remoção**, em cada um: `identityAlignment`/`identityHoverEffect` (`.sarak-chrome-brand`, `_elements.css`), `glassSpecularity`/`glassRoughness` (`.sarak-glass`, `_atmosphere.css`; saem `--sarak-surface-specular/-roughness`), `zIndexSidebar` (`aside` do `ChromeSidebarBody`), `badgeRadius` (`SarakBadge`); `h1Weight`, `h2Weight`, `bodyWeight`, `headingTransform`: leitor `direto` declarado em `_elements.css` + `tipografiaQueChegaDireto.test.ts` (22 casos).
- R2.9 — saem: `[data-performance]`/`[data-perf-mode]` (fica `.sarak-eco-mode`), `[data-glass]`, `[data-font-scale]` e `--font-size-factor`, `[data-sx-theme]`/`[data-sx-surface]`, `aurora-classic` por atributo, `data-tabular-nums` (lote 1), `--animation-speed` (a barra do gráfico lê `motionDurationSlow`), `--sarak-on-accent`.
- R2.10 — `variable-contract`: reserva do canal `-rgb` conferida como lista (`variantFallbackMatches`), reserva de nome derivado (canais `emitColorChannels` e aliases do `aliasPairs`, só em CSS da lib), declaração sob seletor `[data-…]` sem escritor não é dono (`liveDeclaredIn`); as 14 reservas que isso acusou foram consertadas (inclusive `_base.css:34`, `_colors.css:11`). `token-reader`: `optionValues` lê o `id` na falta do `value`. `panel-contract`: grade conferida (limite 3 reescrito).
- R2.11 — limite declarado, com o motivo, em `kitGenerator.test.mjs` (hook 60 s), `check-container-query-literal.test.mjs` (30 s) e `generate-token-types.check.test.mjs` (60 s).
- Nota MAJOR em `docs/migracoes.md` (`## 8.0.0`), antes de "Exports removidos do barril público".

**Arquivos alterados** (74 alterados + 4 criados; os que importam)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/{Main/components/TokenControl.tsx, components/DynamicTokenControl.tsx, components/controls/{BasicControls,ColorControl,colorParts}.ts*}` | alterado | descrição em todo ramo; número com faixa; cor resolvida |
| `src/core/Design/schema/{cards,atmosphere,scrollbars,motion,icons,typography,colors,global}.ts` | alterado | faixas, passos, descrições, rótulos |
| `src/core/Design/catalog/partitions/*.json` (5) | alterado | 7 duplicatas, 3 descrições, 13 nomes, `schemaOrigin` |
| `src/core/Design/utils/tokenBounds.ts` · `Provider/utils/validation.ts` | alterado | `isOffTokenGrid` na auditoria |
| `src/core/Design/presets/themes/{kinetic-flow,synthwave-retro}.ts` | alterado | `vignetteSoftness` 100→60 |
| `src/components/atomic/{hooks/useAtomicStyles.ts, Buttons/SarakIconButton.tsx, Feedback/SarakBadge.tsx, Templates/SarakChart.tsx, Cards/SarakExpandableCard.tsx}` · `Layout/chrome/{ChromeSlots,ChromeSidebarBody}.tsx` | alterado | neumorphism; selo; z-index; marca; mortos |
| `src/styles/{_elements,_atmosphere,_theme,_typography,_card-defaults,_cards,_performance,_surfaces,_background,_base,_colors}.css` | alterado | leitores novos, mortos fora, reservas no padrão |
| `src/core/Design/hooks/designVariableHelpers.ts` | alterado | `--sarak-on-accent` sai |
| `gates/scripts/contrato/{check-variable-contract.ts,helpers/variable-contract-core.ts,check-token-reader.mjs,check-panel-contract.ts}` + 3 testes | alterado | os furos (R2.10) com mutação |
| testes novos: `descricaoEmTodoRamo.test.tsx`, `catalogoSemDuplicata.test.ts`, `tipografiaQueChegaDireto.test.ts`, `browser-tests/leitores-que-faltavam.spec.ts` | criado | travas e efeitos |
| testes ajustados (BasicControls, ColorControl, colorParts, TokenControl, useThemeCustomizationData, tokenBounds, useAtomicStyles, 4 de `src/styles/__tests__`, gates, `cascata-que-cede.spec.ts`), 9 snapshots | alterado | seguem o desenho novo |
| `scripts/**/__tests__` (3) · `browser-tests/{fixtures/harness-entry.tsx,build-harness.mjs}` · `docs/migracoes.md` · `sarak-ui/docs/migracoes.md` · `sarak-dev/*` | alterado | R2.11; cenas; nota; gerados |

**Verificações executadas**
- Navegador, **HEAD** (cópia fora do repo, build refeito): `leitores-que-faltavam.spec.ts` → **14 falham, 2 passam**.
- Navegador, **worktree** (cópia fora do repo, build tsup + tailwind + escopado): bateria `browser-tests` inteira → **278 passed, 2 failed** (as duas da vinheta, por eu medir `::after` do `body` com textura `none`); corrigi o caso (variantes `vinheta-*` sobre `texture: noise`) e rodei os dois → **2 passed**. O restante (278) é de antes dessa correção de teste; o código de produção não mudou depois dela, exceto o refator de `neumorphismButtonShadow` (mesmo valor) e a compressão de `BasicControls` — cobertos pela suíte e não repetidos no navegador.
- `npx vitest run` completo, **2 passadas**: a 1ª (3302/3302, 480/480 arquivos) e a 2ª depois do último conserto (480/480, 3302/3302), sem timeout.
- `npx tsc --noEmit` → 0 erros. `audit:baseline -- --with-tsc` → "igual ao baseline" (passei por: arquivo de 252 linhas, `tsc` em teste, 4 `px` em `SarakIconButton` — todos corrigidos).
- Anel 1 (cada `*:check` do `pre-commit`): barrel, catalog, zero-brand, deep-import, gate-limits, container-query(-boundary), persistence-doc, class-merge, icon-port, chrome-token-parity, token-reader, css-important, fixed-translucent, token-types, variable-contract, panel-contract, channel-dispute, dev-kit, guide → todos OK; `dev-kit` e `guide` (por último) regerados após a última edição de `src/`. `trail-citation` OK.
- Anel 0 simulado (padrões de `config.json` sobre as linhas adicionadas e os não rastreados, sem `specs/`): 1183 linhas, **0 achados**.
- Os gates no HEAD (cópia do `HEAD`, só os scripts novos): `token-reader` → **25 valores** sem leitor; `variable-contract` → **14 reservas + 1 nome sem dono** (`--font-size-factor`); `panel-contract` → **13 valores fora da grade**.
- Mutação (testes dos gates): canal `-rgb` "banana" e de outra cor → acusado; alias e canal emitido fora do laço com reserva errada → acusado; declaração sob `[data-font-scale]` → não é dono; opção só com `id` e sem leitor → achado por opção; valor 0,025 num passo de 0,01 → "fora da grade"; controle sem `description` → acusado.

**Critérios de aceite (lote 2)**
- [x] descrição em todo controle — `descricaoEmTodoRamo.test.tsx` (22 casos).
- [x] campo numérico com faixa e sem `NaN`; seletor de cor sem perda — `BasicControls.test.tsx`, `ColorControl.test.tsx`, `colorParts.test.ts`.
- [x] faixas e grade — `check-panel-contract` (164 fontes, 241 tokens), `atmosferaEBotoesQueDesenham.test.ts`, navegador (`vignetteSoftness` 4%/20%/95%).
- [x] catálogo sem duplicata — `catalogoSemDuplicata.test.ts`.
- [x] descrições verdadeiras; zero token sem efeito; zero leitura/escrita morta — `check-token-reader` OK, `check-variable-contract` OK, navegador (`leitores-que-faltavam.spec.ts`, 16 casos nos dois modos).
- [x] os quatro furos das travas fechados com mutação — ver acima.
- [x] R2.11 — três arquivos com limite declarado.
- [x] uma trava por classe nova, falhando no HEAD e passando depois.

**Decisões e suposições**
- R2.5: refinei o **passo** em vez de mover o valor do tema, para nenhum tema mudar de aparência (os valores 0,02/0,18/1,75… são desenho deliberado); o ônus é um slider mais fino. A "validação" que confere a grade é `auditTokenContract` (gate + testes); o `validateDesign` de runtime não encaixa na grade (declarado no limite 3 do gate).
- R2.4: `vignetteSoftness` limitado a 60, não reparametrizado a 0–100, para o padrão (50 → 20%) e todos os temas ≤ 60 não mudarem; os dois que declaravam 100 viram 60 (parada de 4% em vez de 0% — imperceptível).
- R2.8: dei leitor a todos em vez de tirar do schema (nenhum token saiu, então `removedTokenKeys.ts` ficou intacto). Os efeitos de `identityHoverEffect` (padrão `opacity`) e `badgeRadius` (padrão 99) **mudam o aspecto no tema padrão** (nota MAJOR).
- R2.9: o modo eco fica só como classe `sarak-eco-mode` (o atributo ninguém escrevia; ERP: 0 usos).
- R2.10: a reserva de **componente** com alias de fachada (359 leituras em TS, 323 divergentes: `var(--text-muted, #94a3b8)`) **não** é julgada — só a do CSS da lib; declarado no limite 6. Uniformá-las é trabalho de outra plan.
- `--sarak-surface-specular/-roughness` saíram de `@theme` (Tailwind descarta variável de tema não usada por utilitária, então o leitor lê `--sarak-glass-*` direto).
- Os dois diretórios temporários (`C:\tmp\sarak-head`, `C:\tmp\sarak-work`) foram removidos com a junção antes; `node_modules` do repo conferido.

**Achados fora do escopo (não corrigidos)**
- 323 reservas de alias de fachada em componentes (`--text-muted`, `--border-color`, `--color-theme-card`) divergem do padrão do token — ver acima.
- O modo eco não tem escritor em lugar nenhum (nem token nem Provider): é só a classe, que o consumidor aplica. Pode merecer token (`performanceMode` consta vazio no manifesto).
- `specs/arquitetura/02-design-engine.md` §10.2/§10.4 e `specs/specs/06` §3 ficam a atualizar (leitores novos, faixas, descrição por ramo) — síntese do revisor.

**Pendências / riscos**
- `dist/` e `sarak-ui/` do consumidor não foram reconstruídos aqui (o build oficial é do revisor).
- Mudança de aparência no padrão: marca do cromo esmaece a 70% no hover; selos de `rounded-md` a pílula; `z-index` 500 na sidebar; barra do gráfico 0,6 s. Rever com o dono se a pílula como padrão do selo é o desejado.
- Lote 3 não iniciado, por instrução.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-13 — lote 1 — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK; `playwright test` sobre esse `dist/`: **264/264**, com os 38 casos novos (`injecao-sem-disputa`, `cartao-cede-a-classe`, `ponte-do-modo-claro`, `transicao-padrao-do-tema`) nos dois modos de injeção; suíte completa **477/477 arquivos, 3225/3225 testes, numa passada limpa** (máquina com ~290 processos `node` de outras origens; 992 s); `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK, com o `channel-dispute:check` novo e o `css-important:check` estendido a TypeScript; varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0. Conferido no código: `syncInjectedWrites` remove só o que o injetor escreveu; `_card-materials.css` sem `!important` (as 3 ocorrências são comentário); o aperto do botão em `_elements.css`, sem `!important`.

**Decisões do executor — aceitas:** `bg-theme-card` deixa de ser âncora de cartão (R1.5 resolvido, com nota MAJOR); moldura do `.border-theme` fica `!important` por desenho; classes literais de sombra/desfoque mortas retiradas para preservar a tela; `position`/`isolation` na camada que cede; `?css=escopado` no harness para o modo Embarcado.

**Spec × código corrigida na mesma ação:** `arquitetura/02-design-engine.md` §9.1 (o `transform` do botão cede; as âncoras de cartão; `bg-theme-card` só cor), §10.2 (material e moldura em `_card-materials.css`), §10.8 (o que fica `!important`; o injetor do modo claro) e §10.12 nova (escrita sem disputa de canal, limpeza na troca, transição padrão pelo token).

**Achados do executor roteados:** a troca de tema que herda token do tema anterior (`useDesignSync.ts`) entrou na `plan-116` (aplicar tema é dela); os timeouts sob carga (R2.11) e o `!p-0` redundante (R3.5) entraram no anexo.

**Próximo:** lote 2, depois do commit deste lote.

## Veredito — 2026-10-13 — lote 2 — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK; `playwright test` sobre esse `dist/`: **280/280**, com os 16 casos de `leitores-que-faltavam.spec.ts` (inclusive os dois da vinheta corrigidos) — o executor não tinha repetido a bateria inteira depois do último ajuste; suíte completa **480/480 arquivos, 3302/3302 testes, numa passada limpa**; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK; varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0. Conferida a escada de camadas depois de `zIndexSidebar` passar a valer (60 → 500): modal 2000, drawer acima de 1000, lightbox 1100, menu de contexto no nível do tooltip, busca 600 — nenhuma sobreposição fica sob a barra lateral.

**Decisões do executor — aceitas:** refinar o `step` em vez de mover valor de tema (R2.5); `vignetteSoftness` até 60 (R2.4); leitor para todos os tokens sem efeito, nenhum removido (R2.8); modo eco só como classe (R2.9).

**Para o dono:** o selo passa a pílula no padrão (`badgeRadius` 99) e a marca do cromo esmaece no hover (`identityHoverEffect` `opacity`) — ambos são valores **estéticos**, que o lote 2 da `plan-110` redefine a partir do tema padrão.

**Spec × código corrigida na mesma ação:** `arquitetura/02-design-engine.md` §10.6 (os leitores novos, `neumorphism`, o modo eco como classe do consumidor) e `specs/06-painel-de-customizacao-e-preview.md` §3 (descrição em todo ramo, campo numérico, cor resolvida).

**Roteado:** as 323 reservas de alias de fachada em componentes (limite 6 do `variable-contract`) entram no lote 3 (R3.6).

**Próximo:** lote 3, depois do commit deste lote.
