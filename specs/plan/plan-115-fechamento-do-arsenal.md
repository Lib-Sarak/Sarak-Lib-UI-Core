---
tipo: "plan"
titulo: "Fechamento do arsenal: injecao sem disputa de canal, cascata e movimento que cedem ao tema, painel e descricoes que dizem a verdade, travas sem furo e contraste dos pares que faltavam"
objetivo: "Corrigir o residuo que a re-auditoria de fechamento da plan-114 mediu nos pontos cegos das travas, em tres lotes revisados um a um, fechar os furos das proprias travas e repetir a re-auditoria ate zero, antes de os temas serem refeitos"
dominio: "Design Engine / Injecao / CSS do motor / Painel / Contraste / Gates"
status: "🟢 Aprovada"
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

## Resumo da execução (lote 3 — contraste e valores fixos) — 2026-10-13

**Resultado:** Concluído (sem pendência de critério; as pendências são verificações do revisor: `npm run build` e `cromo-css-real:check` oficiais, e a repetição da re-auditoria das três frentes).

**Estado do worktree ao iniciar**
(limpo) — `HEAD` `e9dd00a5` (lotes 1 e 2 commitados).

**O que foi feito**
- R3.1 — pares novos em `verify_contrast.ts` (68 → 76), grupo D: `mix:statusErrorColor` sobre a tinta a 15% da barra lateral e do topo (botão de sair), `mix:primaryColor` sobre `btnGhostHoverBg` (hover do fantasma e do contorno), `statusErrorColor` e `statusSuccessColor` sobre `colorBgBody` (estilo `cyberpunk`), `textColorMuted` e `textColorSecondary` sobre `tableHeaderBg`. O que reprovava foi consertado **no componente**: texto cru → mistura de 40% da cor com o texto de maior contraste sobre o corpo (a do badge suave) em `AuthForm.tsx:112-113` (aviso e erro), `SarakShellUserWidget.tsx` (sair: a tinta lê `--theme-error-bg/-border` com a reserva do motor; no hover o texto é `--sarak-on-error`), `SarakButton.tsx`/`SarakIconButton.tsx` (hover do fantasma e do contorno) e `useAtomicStyles.ts` (no `cyberpunk`, primário/perigo/sucesso leem a cor da própria variante; o fundo é transparente).
- R3.2 — os 14 temas × 2 modos passam nos 76 pares (`verify_contrast.ts`: 0 reprovados, 0 pulados). Valores de tema trocados só onde reprovavam (busca de luminosidade HSL mínima, mesmo matiz e saturação): `statusErrorColor`/`statusSuccessColor` no modo nativo de `synthwave-retro`, `minimalist-airy`, `golden-hour`, `blueprint-protocol` (os dois), `data-terminal` (sucesso) e `aurora-veil` (erro); na contraparte de `synthwave-retro`, `cyber-retro-wave`, `blueprint-protocol` (os dois) e `kinetic-flow` (erro); `textColorMuted` na contraparte do `sarak-sovereign`. Aviso e info não foram declarados nas contrapartes: depois do conserto nenhum componente os desenha como texto cru (ver decisões).
- R3.3 — raio do chat (`MessageList.tsx:47`, `ChatInput.tsx:56` → `--sarak-chat-radius`); sombra `rgba(var(--x,#hex),a)` inválida (`PremiumCheckbox.tsx:11`, `RecursiveMatrixNode.tsx:87` → `color-mix`); `SarakCatalogGrid.tsx:126`, `SarakFilterSelect.tsx:21`, `SarakHelpButton.tsx:42` (paleta → tema); pulso do alternador (`switchStyles.ts:17` → `motionDurationSlow`, 1,6 s no padrão), `LazyEngineWrapper.tsx:25`, atrasos do chat e das orbes (`MessageList.tsx:50-51`, `SarakChatEngine.tsx:184-185`, `AuthHero.tsx:24,50`, `AuthForm.tsx:76`); raios da matriz (`RecursiveMatrixNode.tsx:104,128,149,169,212` → `--sarak-matrix-radius`); reservas `--sarak-on-error/-success` `#ffffff` → `#020617`, `--sarak-on-muted` `#020617` → `#ffffff` e `--sarak-on-chat-user` (`MessageBubble.tsx:27`, `SarakChatEngine.tsx:100`) → `#ffffff` (o que o motor calcula sobre o padrão do token).
- R3.4 — `src/features/`: 161 classes de paleta → variável de status, texto ou borda do tema; 37 `duration-N` → `duration-[var(--sarak-motion-dur-*)]`; 4 durações e 4 atrasos de `framer-motion` → `useMotionTokens`; `ChartsMock.tsx:67-68`, `ChatMock.tsx:36`, `SettingsMock.tsx:21-22`, `MockDocuments.tsx:96`, `ButtonPresetPreview.tsx:81`, `InputPresetPreview.tsx:47`, `useDeviceStyles.ts:11,14` → cor do tema; `colorParts.ts:10` (o piso do `<input type="color">`, só hex) ganha o marcador `sarak-allow-fixed-color`.
- R3.5 — `!p-0` fora de `SarakChat.tsx:45` (o `padding: 0` passa ao `style`, porque o auditor de hardcode acusa o `p-0` estrutural em átomo) e `p-0` em `SarakChatEngine.tsx:62`. Reservas `--sarak-on-*`: ver R3.3.
- R3.6 — `variable-contract:check` julga a reserva de alias de fachada também em `.tsx` (`variable-contract-core.ts`: saiu o `continue` do nome derivado em componente); 323 leituras corrigidas por codemod em 92 arquivos (`--text-muted` 141, `--border-color` 95, `--color-theme-card` 87) para `rgba(255,255,255,0.4)`, `rgba(255,255,255,0.1)` e `rgba(15,23,42,0.6)`; 3 `defaultValue` de schema (`card-action`, `card-search`, `inputs`) levam a mesma reserva. Limite 6 reescrito no cabeçalho do gate.
- Travas: `verify_contrast.ts` (8 pares, 4 casos de mutação em `verify_contrast.test.ts`); `check-fixed-translucent.mjs` passa a acusar paleta do Tailwind, duração/atraso fixos e `rgba(var(--x,#hex),a)` em `src/components/` e `src/features/`, e hex, `rgb()` e `white`/`black` quase preto/branco em `src/features/` (limites 1 e 6 no cabeçalho; casos plantados, passantes e mutação no teste; o caso da varredura do repositório ganhou limite de 60 s); `check-variable-contract.ts` (alias em componente, caso plantado `#94a3b8` e o antigo "não julgada" trocado); `useAtomicStyles.test.ts` (cyberpunk).
- Navegador: `contraste-do-que-faltava.spec.ts` (18 casos: tela de autenticação — erro e aviso —, sair, fantasma, contorno, perigo, cyberpunk × primário/perigo/sucesso, em claro e escuro) e `valores-fixos-leem-o-token.spec.ts` (7 casos: pulso, raio e sombra da matriz, texto da ajuda); cenas `contraste-botoes`, `contraste-auth`, `valores-fixos` e recortes `contraste-*`, `fixos-*`, `modo-*` no harness.
- Nota MAJOR em `docs/migracoes.md` (`## 8.0.0`), antes de "Exports removidos do barril público".

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/audit/verify_contrast.ts` + `__tests__/verify_contrast.test.ts` | alterado | 8 pares; `VAR_RE` aceita reserva com parênteses; limites 5 e 10 |
| `gates/scripts/contrato/check-fixed-translucent.mjs` + teste | alterado | paleta, duração, sombra inválida, hex/rgb/palavra no painel; limites 1 e 6 |
| `gates/scripts/contrato/{check-variable-contract.ts,helpers/variable-contract-core.ts}` + teste | alterado | reserva de alias em componente julgada |
| `src/core/Design/presets/themes/*.ts` (9) | alterado | 18 valores de cor (status e texto mudo) |
| `src/core/Design/schema/{card-action,card-search,inputs}.ts` | alterado | reserva do alias dentro do `defaultValue` |
| `src/components/**` (84 arquivos) | alterado | reservas, texto misturado, raios, duração, paleta |
| `src/features/DesignEngine/**` (53) | alterado | paleta, duração, mocks, reservas |
| `src/components/atomic/hooks/useAtomicStyles.ts` + teste | alterado | texto do cyberpunk |
| `src/features/DesignEngine/Panels/__tests__/HyperGranularityTab.test.tsx` | alterado | o mock do Provider ganha `useSarakUIOptional` (o painel lê `useMotionTokens`) |
| `browser-tests/{contraste-do-que-faltava,valores-fixos-leem-o-token}.spec.ts` | criado | 25 casos |
| `browser-tests/fixtures/harness-entry.tsx` e 4 specs | alterado | cenas e recortes; classes de cena que a lib deixou de emitir; espera do aperto |
| 14 `__snapshots__/*.snap` | alterado | só reserva, paleta e duração |
| `docs/migracoes.md` · `sarak-ui/docs/migracoes.md` | alterado | nota MAJOR; kit regenerado (`guide` por último) |

**Verificações executadas**
- Navegador, **HEAD** (cópia fora do repo, build refeito, gates e specs novos sobre `src/` do `HEAD`): `contraste-do-que-faltava.spec.ts` → dos 16 primeiros casos, **13 falham** e 3 passam (as contraprovas: perigo sólido nos dois recortes e o primário `cyberpunk` no claro); a rodada foi interrompida no 16º; `verify_contrast.ts` com os 76 pares → **6 temas reprovam no nativo e 5 no oposto**; `check-fixed-translucent.mjs` → **175 ocorrências**; `variable-contract` → **323 reservas**.
- Navegador, **worktree** (cópia fora do repo, tsup + tailwind + escopado): bateria inteira `playwright test browser-tests` → **305 passed**, 0 falhas, repetida **depois do último ajuste de `src/`** (`SarakChat.tsx`, `KitchenSinkPreview.tsx`). A 1ª bateria deu 5 falhas, todas de teste: 3 classes de cena que a lib deixou de emitir (`from-indigo-500`, `duration-300`) e o aperto lido no meio da transição (corrigido com espera de 500 ms).
- `npx vitest run` completo, **última passada depois do último ajuste**: **480 arquivos, 3342/3342 testes**. A 1ª passada deu 18 falhas: 15 snapshots (só reserva, paleta e duração; `-u` e conferência do diff), 2 do `HyperGranularityTab` (mock do Provider sem `useSarakUIOptional`) e 1 timeout do gabarito de tema sob carga, que passa isolado; a 2ª, 1 snapshot que o `-u` não alcançou.
- `npx tsc --noEmit` → 0 erros. `audit:baseline -- --with-tsc` → "igual ao baseline de 2026-10-12" (passou por 2 regressões minhas, corrigidas: `KitchenSinkPreview.tsx` com 251 linhas e `p-0` estrutural em `SarakChat.tsx`).
- Anel 1 (cada `*:check` do `pre-commit`, repetido depois do último ajuste): barrel, catalog, zero-brand, deep-import, gate-limits, container-query(-boundary), persistence-doc, class-merge, icon-port, chrome-token-parity, token-reader, css-important, fixed-translucent, trail-citation, token-types, variable-contract (3800 leituras com dono, 2630 reservas conferidas), channel-dispute, panel-contract, dev-kit, guide → todos OK; `guide` por último.
- Anel 0 simulado (padrões de `gates/scripts/segredo/config.json` sobre as linhas adicionadas e os 2 não rastreados, sem `specs/`): 1755 linhas, **0 achados**.
- Mutação: `verify_contrast.test.ts` (cor do status clara no `cyberpunk`, texto mudo sobre cabeçalho escuro → reprova; mistura do hover passa), `check-fixed-translucent.test.mjs` (`duration-300` e hex `#0a0a0a` num mock → achado; o mesmo em teste ou em componente-hex → não), `check-variable-contract.test.ts` (`var(--text-muted, #94a3b8)` em `.tsx` → achado).

**Critérios de aceite (lote 3)**
- [x] os pares do anexo medidos e verdes — `verify_contrast.ts` (76 pares × 14 temas × 2 modos: 0 reprovados), `contraste-do-que-faltava.spec.ts`.
- [x] contrapartes completas onde reprovavam — 18 valores (ver R3.2); `auditContraparteRequired`: 0 faltando.
- [x] valores fixos lidos do token — `fixed-translucent:check` e `variable-contract:check` OK; `valores-fixos-leem-o-token.spec.ts`.
- [x] mocks seguindo o tema — `fixed-translucent:check` com hex, `rgb()` e palavra em `src/features/`: 0.
- [x] uma trava por classe nova, falhando no `HEAD` anterior e passando depois (números acima).
- [x] nota MAJOR em `## 8.0.0`.
- [x] suíte completa verde (repetida), `tsc` 0, `audit:baseline` sem regressão, Anel 1 inteiro, bateria do navegador, Anel 0 simulado: 0.

**Decisões e suposições**
- Os pares de aviso/erro do `AuthForm` e o hover fantasma/contorno foram consertados no **componente** (a mistura do badge suave), não nos 14 temas: trocar `primaryColor` e a cor de aviso em 12 a 20 de 28 casos mudaria a marca de cada tema, e um tema de consumidor ficaria sem proteção. O custo é um texto menos saturado nesses estados, declarado na nota MAJOR.
- `--theme-error-bg` e `--theme-error-border` **existem** (o motor as emite por `generateVariants` do `statusErrorColor`, a 15% e 25%): o anexo as dá como não definidas, e a reserva é que faltava. O par mede a tinta a 15%.
- Aviso e info (`statusWarningColor`, `statusInfoColor`) não entraram como texto cru em `PAIRS`: `SarakAlert` os usa em ícone e borda (não-texto, fora da R31, limite 10), e o `AuthForm` passou à mistura. `accentColor` e `tertiaryColor` não desenham texto em componente algum. Declarado em `verify_contrast.ts`.
- **Token de sombra de sobreposição NÃO foi criado** (declarado antes de criar, como a instrução manda): ~44 `shadow-sm…2xl` em modal, menu, tooltip, toast e popup não têm token, e criar um é decisão de schema (3 fontes, leitor, painel). Fica para o revisor.
- Mapa da paleta (codemod): neutros claros (200–300) → `--color-theme-title`, neutros 400+ → `--text-muted`, fundo escuro → `--color-theme-card`, borda → `--border-color`; esmeralda/verde/lima/teal → sucesso; rosa/vermelho → erro; âmbar/laranja/amarelo → aviso; azul/céu → info; ciano → primária; índigo/violeta/roxo/fúcsia → secundária. A matiz muda onde o tema muda a cor de status.
- O pulso do alternador usa o fator 2,67 sobre `motionDurationSlow` (1,6 s no padrão) e o carregamento do motor, 3,33 (2 s): o aspecto no tema padrão não muda.
- O gate de duração acusa qualquer número literal em `duration:`/`delay:`; um `delay: 300` de debounce em milissegundos precisa do marcador `sarak-allow-fixed-color` (limite 6).
- Os recortes `contraste-*` do harness definem `titleColor`/`textColorMuted`; sem eles o recorte claro deixava o título branco sobre branco (artefato do recorte, não da lib).
- O teste da varredura do repositório do `check-fixed-translucent` ganhou limite de 60 s com o motivo (a mesma regra do R2.11).
- Os dois diretórios temporários (`C:\tmp\sarak-work`, `C:\tmp\sarak-head`) foram removidos com a junção antes; `node_modules` do repo conferido.

**Achados fora do escopo (não corrigidos)**
- `DashboardMetricsGrid.tsx:93` (`!p-0` num mock do painel) segue redundante — o R3.5 só nomeava os dois do chat.
- `SarakFilterSelect.tsx:21`: a classe de texto nunca foi a cor efetiva (o `SarakSelect` pinta por `--sarak-input-text-color`); a troca de `text-slate-300` é só higiene.
- A descrição "Gera variantes automáticas de fundo/borda" dos tokens de status é verdadeira (o limite 5 antigo do `verify_contrast.ts` dizia que não): o limite foi reescrito; vale conferir a spec 02 §10 se citar a mesma frase.
- Sob carga, `generate_theme_template.test.ts` ("o gabarito compila") estourou o tempo na 1ª passada completa e passa isolado (3,4 s): o mesmo padrão do R2.11, fora da lista do anexo.

**Pendências / riscos**
- `dist/` e `sarak-ui/` (além de `docs/migracoes.md`) não foram reconstruídos aqui; o build oficial e o `cromo-css-real:check` são do revisor.
- Mudança de aparência no padrão: o texto de aviso/erro do `AuthForm` e o do hover fantasma/contorno ficam menos saturados; sem Provider, o cartão passa a ser translúcido (`rgba(15,23,42,0.6)`), o texto mudo `rgba(255,255,255,0.4)` e a borda `rgba(255,255,255,0.1)`; `p-*` dos mocks seguem valendo (lote 1).
- O token de sombra de sobreposição (ver decisões) é a única classe de valor fixo do anexo (R3.3, "suspeitas") deixada sem trava e sem conserto.

## Resumo da execução (lote 4 — o resíduo da re-auditoria de fechamento) — 2026-10-14

**Resultado:** Concluído com uma decisão a registrar (L4.4, parcial — ver *Decisões*); as pendências são verificações do revisor: `npm run build` e `cromo-css-real:check` oficiais, e a repetição da re-auditoria.

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-116-tema-sob-demanda.md
```
(`HEAD` `04e32d71`; os dois arquivos são do revisor. Durante a execução apareceu `specs/plan/anexos/plan-116-desenho.md`, também do revisor.)

**O que foi feito**
- L4.1 — 11 classes arbitrárias com espaço (`SarakTooltip.tsx:191`, `SarakAnalyticalPage.tsx:52,65`, `CardsCatalog.tsx:58`, `TypographyCatalog.tsx:35`, `PreviewCanvas.tsx:100`, `LiveDraftPreviewFrame.tsx:49,55`, `MasterControlPanel.tsx:174`, `LayoutTab.tsx:168,186`) sem espaço; `SarakTooltip` lê `--sarak-z-tooltip`. **Trava:** `fixed-translucent:check` acusa classe com espaço no colchete (`classe-com-espaço`), em componente e painel.
- L4.2 — `.transition-sarak` saiu de `_utilities.css` (`!important`) para `_elements.css` (`components.sarak-elements`), sem `!important`; o limite 4 do `css-important` deixou de citá-la.
- L4.3 — `body[data-sarak-has-media] .bg-theme-body` → `.sarak-page-surface` (`_atmosphere.css:636-639`); o `SarakAuthScreen` aplica a classe na raiz.
- L4.4 — `rounded-sarak`, `rounded-btn` e `rounded-input` entram no grupo `rounded` do `mergeSarakClasses`. A regra de CSS **ficou** na camada final (ver *Decisões*).
- L4.5 — 13 sombras de sobreposição (`shadow-lg/xl/2xl`) → `shadow-[var(--dynamic-shadow)]`, sem token novo.
- L4.6 — escada de camadas sem empate, por token: menus e busca = `--sarak-z-sidebar` + 100/200, cartão expandido = `--sarak-z-modal` − 100, ajuda +100, lightbox +200, spotlight +300; `SarakManagementGrid` lê o modal e o botão de fechar `z-[1]`; `zIndexToast` 9000 → 9100 (um passo acima do tooltip), `max` de toast e tooltip 9999 → 9900 (grade de 100); os 14 temas que declaravam `zIndexToast: 2000` (empate com o modal) declaram 9100.
- L4.7 — um dono para `--color-theme-title`: o `titleColor` (`useDesignVariables.ts` + `resolveTitleColor` em `designVariableHelpers.ts`; `_theme.css:15`). No modo claro, com o `titleColor` ainda no padrão `#ffffff`, o título segue o texto principal (sem isso a prova do modo claro, `ponte-do-modo-claro.spec.ts`, deu título branco sobre branco).
- L4.8 — `_base.css:16` `--theme-card: var(--sarak-card-bg, rgba(15, 23, 42, 0.6))`.
- L4.9 — `_theme.css`: `@theme inline { … }` (as utilitárias resolvem no elemento) **e** `:root, .sarak-design-scope { … }` com o mesmo corpo (os nomes como variável). Teste `themeNamesScope.test.ts` confere que os dois corpos são idênticos.
- L4.10 — `variable-contract:check` julga a reserva de nome derivado declarado em CSS (`declaredDefaults`/`sameLiteral` em `variable-contract-core.ts`); 30 reservas corrigidas (`--sarak-shadow-glow` ×9, `--color-theme-primary`, `--color-theme-on-primary`, `--color-theme-bg`, `--color-theme-text`, `--duration-slow`, `--duration-normal`, `--theme-sidebar`, `--theme-pad`, `--theme-card-padding`).
- L4.11 — `TextMock.tsx:93,115,122,132` leem `var(--sarak-input-border-radius, 8px)`; o gate acusa reserva sem unidade em variável com unidade.
- L4.12 — `SarakShellNav.tsx:184` `1px`; palavra-chave que não é comprimento (`thin`) acusada em variável com unidade; tolerância de alfa 0,011 → 0,001 (`TextMock.tsx:92` passou a `rgba(255,255,255,0.03)`, o padrão de `inputBg`).
- L4.13 — `releaseInjectedWrites` (`injectedWrites.ts`) + efeito de desmontagem no `DesignInjector` (variáveis, atributos, curvas, rastro do ponteiro, fonte ancorada, classe de modo, `data-sarak-has-media`, `#sarak-responsive-vars`); o `rAF` do ponteiro é cancelado ao sair.
- L4.14 — `applyAlpha` (`colorParts.ts`): o alfa de `var()`/`color-mix()` grava `color-mix(in srgb, <valor> N%, transparent)`; `ColorControl` o usa.
- L4.15 — `PresetCard.tsx:62-66` lê `cardShadowSpread` como opacidade em %.
- L4.16 — catálogo sincronizado com o schema (290 entradas: tipo, opções e faixa; `texture` +36 opções etc.); `catalog-drift.ts` + passo 8 de `verify_parity.ts` (que o `auditor_paridade` e o `audit:baseline` rodam) conferem **tipo e valores permitidos**.
- L4.17 — descrições de `animEnabled`, `isNavHidden` e `cardGeometricCut` (schema e catálogo) dizem o que o código faz; `motionDurationFast` passa a ser verdade com o L4.9.
- L4.18 — `generate_theme_template.test.ts` grava em pasta temporária (`SARAK_THEME_OUT_DIR` em `generate_theme_template.ts`); `DashboardMetricsGrid.tsx:93` `p-0`.
- Nota MAJOR em `docs/migracoes.md` (`## 8.0.0`), antes de "Exports removidos do barril público".

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/{_theme,_base,_elements,_utilities,_atmosphere}.css` + 8 parciais | alterado | `@theme inline` + escopo; `transition-sarak`; página × componente; reservas |
| `src/core/Design/hooks/{useDesignVariables,designVariableHelpers}.ts` | alterado | dono do título |
| `src/core/Provider/{components/DesignInjector.tsx,utils/injectedWrites.ts}` | alterado | limpeza ao desmontar |
| `src/core/Design/schema/{engineering,layers,animations,cards,navigation}.ts` + 10 temas | alterado | camadas, descrições |
| `src/core/Design/catalog/partitions/*.json` (10) | alterado | tipo, opções e faixa do schema; 3 descrições |
| `src/components/**` (~40) e `src/features/**` | alterado | classes com espaço, camadas, sombra, reservas |
| `src/features/DesignEngine/components/controls/{colorParts.ts,ColorControl.tsx}` | alterado | alfa vinculado |
| `gates/scripts/audit/{catalog-drift.ts,verify_parity.ts}` + `__tests__/catalog-drift.test.ts` | criado/alterado | paridade de valor |
| `gates/scripts/contrato/{check-fixed-translucent.mjs,check-variable-contract.ts,helpers/variable-contract-core.ts,check-css-important-visual.mjs}` + 2 testes | alterado | as três travas |
| testes: `injectedWrites`, `DesignInjector`, `mergeSarakClasses`, `colorParts`, `PresetCard`, `SarakToast.layerToken`, `HyperGranularity`…, `themeNamesScope`, `painelGravaOQueMostra` (limite de 30 s) | criado/alterado | casos novos |
| `browser-tests/residuo-da-reauditoria.spec.ts` + `fixtures/harness-entry.tsx` | criado/alterado | 13 casos; cenas `residuo`, `escopo-rascunho`, `desmontar` |
| `.agents/skills/ui-criar-tema/scripts/{generate_theme_template.ts,__tests__/…}` | alterado | saída fora do repositório |
| `docs/migracoes.md` · `sarak-ui/**` · `sarak-dev/**` · `docs/component-catalog.*` | alterado | nota MAJOR; gerados (`guide` por último) |
| 7 `__snapshots__/*.snap` | alterado | só reserva e espaço |

**Verificações executadas**
- **HEAD** (cópia fora do repo, gates novos sobre o `src/` do `HEAD`): `verify_parity.ts` → **424 divergências** de tipo/valor; `variable-contract` → **33 reservas** (as 30 + 3); `check-fixed-translucent.mjs` → **11** classes com espaço.
- Navegador, **worktree** (cópia fora do repo, tsup + tailwind + escopado): bateria inteira → **318 passed**, 0 falhas, depois do último ajuste de `src/` (a 1ª rodada deu 3 falhas, todas minhas: o `rounded-btn` gerado pelo Tailwind a partir do `@theme` vence a regra movida de camada — decisão L4.4; título branco sobre branco no claro — L4.7; `htmlVars: 2` na desmontagem, o `rAF` do ponteiro — L4.13).
- `npx vitest run` completo: **482 arquivos, 3374/3374 testes**, numa passada limpa depois do último ajuste. As passadas anteriores deram: 9 falhas (7 snapshots de reserva/espaço, 2 timeouts sob carga), depois 2 timeouts sob carga (`SarakTable`, `check-class-merge`), que passam isolados e ganharam limite declarado com o motivo (30 s e 60 s).
- `npx tsc --noEmit` → 0 (dentro de `audit:baseline -- --with-tsc`). `audit:baseline -- --with-tsc` → "igual ao baseline de 2026-10-12" (passou por 1 violação minha de `auditor_cleancode`: `useDesignVariables.ts` com 251 linhas).
- Anel 1 (cada `*:check` do `pre-commit`, `guide` por último) → todos OK (`variable-contract`: 3898 leituras, 2892 reservas).
- Anel 0 simulado: padrões de `gates/scripts/segredo/config.json` sobre as linhas adicionadas e os 4 não rastreados, sem `specs/`: 3809 linhas, **0 achados**.
- Mutação: `catalog-drift.test.ts` (opção a mais/a menos, tipo trocado, faixa), `check-variable-contract.test.ts` (`--radius-btn, 8px`, `--color-theme-primary, #3b82f6`, `8` sem unidade, `thin`, alfa 0,02 × 0,03), `check-fixed-translucent.test.mjs` (`z-[var(--z, 9000)]` num componente → achado).

**Critérios de aceite (lote 4)**
- [x] L4.1–L4.18 corrigidos, exceto o trecho da regra de CSS do L4.4 (decisão abaixo).
- [x] Trava nova por classe (classe com espaço; opção e tipo na paridade; reserva de nome derivado e de variável com unidade), com limites no cabeçalho (R18), mutação, falhando no `HEAD` (números acima), no Anel 1 (`fixed-translucent:check`, `variable-contract:check`) e na CI (`audit:baseline` roda a paridade).
- [x] Casos de `browser-tests/` com contraprova do padrão para cada item de CSS (L4.1–L4.9, L4.13).
- [x] Suíte completa, `tsc`, `audit:baseline`, Anel 1, Anel 0 e bateria do navegador depois do último ajuste.

**Decisões e suposições**
- **L4.4 parcial.** O Tailwind gera `rounded-btn` e `rounded-input` a partir do `--radius-*` do `@theme` (sem os quatro cantos). Mover as regras da lib para `components.sarak-elements` deixou a utilitária gerada vencer e o botão assimétrico perdeu os cantos (medido: `0px` em vez dos cantos do tema); `@utility` produz a mesma declaração duplicada. As três regras ficam na camada final, com a razão no comentário de `_theme.css`; o conflito no mesmo elemento é do `mergeSarakClasses` (que agora conhece as três). Quem escreve `rounded-btn rounded-xl` direto no HTML, fora de um átomo, continua vendo o `rounded-btn`.
- **L4.3** — o contêiner de página passa a ser marcado (`sarak-page-surface`) em vez de adivinhado: o consumidor que usava `bg-theme-body` na própria página e queria a mídia atrás aplica a classe (nota MAJOR).
- **L4.6** — `zIndexToast` 9100 (a descrição do toast já o chamava "o topo"; a do tooltip deixou de dizê-lo). O vinheta e o ruído (`z-[9999]`, `pointer-events: none`) não são sobreposição interativa e ficaram.
- **L4.9** — `@theme` duplicado (`@theme inline` + `:root, .sarak-design-scope`) em vez de reemitir 45 nomes por TypeScript; a igualdade dos dois corpos é teste.
- **L4.10** — o gate julga só cadeias que resolvem a um literal; `calc()`, `color-mix()` e lista ficam sem valor (limite 9).
- **L4.16** — o catálogo passa a carregar o tipo do schema tal como está (`slider`, `select`, `text`…): o catálogo antigo usava `number`/`string` genéricos para 236 tokens.
- **L4.17** — `isNavHidden` descrito como "recolhe a 74 px", como o anexo mediu; não reconferi a geometria da topbar no navegador.
- `--sarak-shadow-glow` sem Provider passa de 50% a 5% de opacidade (é o padrão do token); declarado na nota MAJOR.

**Achados fora do escopo (não corrigidos)**
- `PresetCard.tsx` (grade de textura): `var(--border-color,…)` virou posição de parada de gradiente (um valor de cor onde cabe comprimento) — veio do lote 3 (codemod de reserva sobre um `#334155` que já estava ali); o gradiente da textura `grid` fica sem a linha.
- `NoiseOverlay.tsx:12` e `.sarak-vignette-layer` seguem em `z-index: 9999`, acima do toast e do tooltip (decorativos, `pointer-events: none`).
- Sob carga, `SarakTable.test.tsx` e `painelGravaOQueMostra.test.tsx` estouram os 5 s do padrão; o segundo ganhou limite de 30 s com o motivo, o primeiro passa isolado.

**Pendências / riscos**
- `dist/` e o kit do consumidor não foram reconstruídos aqui (o build oficial é do revisor).
- Mudança de aparência no padrão: sombra das sobreposições segue o tema (direção/camadas); notificação 100 acima do tooltip; brilho sem Provider 5%; `cardShadowSpread` do preview em %.

## Resumo da execução (lote 4 — correção 1) — 2026-10-14

**Resultado:** Concluído (4 achados; o 4 era improcedente — registrado com a medida, sem mudança).

**Estado do worktree ao iniciar**
Worktree com o lote 4 inteiro (não commitado) e os arquivos do revisor (`specs/00-indice.md`, `specs/plan/plan-116-…`, `specs/plan/anexos/plan-116-desenho.md`); `dist/` aparecia modificado pelo build do revisor, não por mim.

**O que foi feito (um item por achado)**
1. **Catálogo sem opção (achado 1).** `catalog-drift.ts` lê as opções como a validação (`constraints.options ?? options`; `SchemaTokenLike` ganhou `options`); as 16 entradas voltaram a ter as opções do schema (as 40 texturas inclusive). **Contagem — `select` sem opção no catálogo: 16 → 0** (de 64 `select`). Antes de sincronizar conferi o resto do catálogo contra `60c137f3`: descrição vazia 26 → 26 e, em todas as chaves, só `allowedValues` tinha perdido valor (22 entradas, as 16 + 6 de outros tipos, todas restauradas; a sincronização refeita trocou 16 entradas e nenhuma outra). Testes: `catalog-drift.test.ts` — mutação com `options` no nível de cima (lida; catálogo vazio é achado), precedência `constraints.options` > `options`, e o teste do repositório que falha se houver `select` sem opção (contagem tem de ser zero).
2. **Textura `grid` (achado 2).** `PresetCard.tsx:76`: `linear-gradient(… var(--border-color,…) var(--sarak-border-width, 1px), transparent var(--sarak-border-width, 1px))` nos dois eixos — a cor deixa de ocupar a posição de parada, e a largura lê o token (o `auditor_hardcoded` acusou o `1px` literal na 1ª tentativa). Teste em `PresetCard.test.tsx`: o CSSOM aceita o gradiente e nenhuma cor precede uma parada.
3. **Atmosfera abaixo da escada (achado 3).** `NoiseOverlay.tsx:12` `z-[calc(var(--sarak-z-sidebar,500)_+_50)]` e `.sarak-vignette-layer` (`_theme.css`) `z-index: calc(var(--sarak-z-sidebar, 500) + 50)`: acima do conteúdo e da barra (o efeito segue cobrindo o cromo), abaixo de menus e busca (+100/+200), modal, tooltip e notificação. Testes: `NoiseOverlay.test.tsx`, `themeNamesScope.test.ts` (regra sem `9999`); navegador: cena `atmosfera` (vinheta + notificação aberta) → camada da vinheta > `--sarak-z-sidebar` e < modal, tooltip e a pilha do toast, medidos no computado. Nota MAJOR em `docs/migracoes.md` ajustada.
4. **`calc` do marcador (achado 4) — improcedente.** `navActiveMarkerGlow` não declara `unit` (`navigation.ts:312-320`) e o hook só anexa unidade quando `token.unit` existe; o motor emite `10`, e `calc(10 * 1px)` é válido. Medido no navegador: caso novo em `residuo-da-reauditoria.spec.ts` lê `--sarak-nav-marker-glow` (só dígitos) e confere que `box-shadow: 0 0 calc(<valor> * 1px) red` é aceito. Nada mudou em `SarakShellNav.tsx`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/audit/catalog-drift.ts` + `__tests__/catalog-drift.test.ts` | alterado | origem das opções = a da validação; 3 casos |
| `src/core/Design/catalog/partitions/*.json` | alterado | 16 `select` com as opções do schema |
| `src/features/DesignEngine/Canvas/components/PresetCard.tsx` + teste | alterado | grade da textura |
| `src/effects/NoiseOverlay.tsx` + teste · `src/styles/_theme.css` · `src/styles/__tests__/themeNamesScope.test.ts` | alterado | camada da atmosfera |
| `browser-tests/residuo-da-reauditoria.spec.ts` · `fixtures/harness-entry.tsx` | alterado | cena `atmosfera`, caso do brilho; o seletor do lightbox deixou de casar o ruído |
| 2 `__snapshots__/*.snap` (PreviewCanvas, PresetsCatalog) | alterado | camada do ruído e opções |
| `docs/migracoes.md` · `sarak-ui/**` · `sarak-dev/**` · `docs/component-catalog.*` | alterado | nota; gerados (`guide` por último) |

**Verificações executadas**
- Antes → depois: `select` do catálogo sem opção **16 → 0**; `verify_parity.ts` verde.
- `npx vitest run` completo: **482 arquivos, 3379/3379 testes**, numa passada limpa depois do último ajuste (a passada anterior deu 2 snapshots — camada do ruído e opções do catálogo —, atualizados e repetidos).
- `audit:baseline -- --with-tsc` → "igual ao baseline de 2026-10-12" (passou por 1 acusação minha do `auditor_hardcoded`: `1px` no gradiente, corrigida).
- Anel 1 (21 `*:check`, `guide` por último): todos OK (21).
- Anel 0 simulado: padrões de `gates/scripts/segredo/config.json` sobre as linhas adicionadas e os 20 não rastreados (inclui os chunks do build do revisor), sem `specs/`: 4373 linhas, **0 achados**.
- Bateria do navegador (cópia fora do repo, tsup + tailwind + escopado), depois do último ajuste de `src/`: **320 casos, 320 passam**: a corrida inteira deu 319/320 — a falha era o seletor `.fixed.inset-0` do caso do lightbox, que passou a casar o ruído (camada 550), corrigida no teste e o spec inteiro (15 casos) repetido: 15/15.

**Critérios de aceite**
- [x] 4 achados tratados; a contagem de `select` sem opção é zero e há teste que falha acima de zero.
- [x] Caso de mutação com opção no nível de cima.
- [x] Caso de navegador com toast aberto sobre a vinheta.

**Decisões e suposições**
- A atmosfera ficou em `--sarak-z-sidebar` + 50 (e não abaixo da barra): ruído e vinheta continuam cobrindo o cromo, como antes, e saem de cima de toda sobreposição.
- O `vitest -u` pendurou duas vezes aqui (processos concorrentes; a mesma execução sem `-u` passa em 4 s); os snapshots foram atualizados por execução isolada.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- `npm run build` e `cromo-css-real:check` oficiais (do revisor).

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

## Veredito — 2026-10-13 — lote 3 — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK; `playwright test` sobre esse `dist/`: **305/305**, com os 25 casos novos (`contraste-do-que-faltava`, `valores-fixos-leem-o-token`); suíte completa: 479/480 arquivos, 3328 testes verdes — a única falha é `kitGenerator.test.mjs` por `ENOENT` de um arquivo que outro teste, de 2025, grava e apaga dentro de `src/` (anexo F.1; isolado, 14/14), **não deste lote**; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK; varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0. Conferido no diff que as trocas de cor dos temas são de luminosidade (mesma matiz) e que o marcador `sarak-allow-fixed-color` tem um uso só (o piso do `<input type="color">`).

**Decisões do executor — aceitas:** texto de aviso/erro e do hover fantasma/contorno pela mistura do badge suave, no componente, sem mexer na marca dos temas; `--theme-error-bg/-border` existem como variantes (correção do anexo); aviso e info fora dos pares de texto cru (só ícone e borda); mapa da paleta do codemod; fatores do pulso e do carregamento sobre `motionDurationSlow`.

**Decisão aberta (anexo F.2):** o token de sombra de sobreposição não foi criado. Recomendação do revisor: as sobreposições leem a sombra do tema (`--dynamic-shadow`), sem token novo.

**Próximo:** fechamento — o revisor repete a re-auditoria das três frentes; o resultado, com F.1 a F.3, decide a última correção ou o fechamento da plan.

## Fechamento — 2026-10-13 — re-auditoria das três frentes: resíduo → lote 4

As três re-auditorias (variável e injeção; cascata e componentes; painel, temas e contraste) confirmam **zero** nas
categorias que as plans 114 e 115 travaram, e medem um resíduo menor, a maior parte em pontos cegos das travas:
classes arbitrárias com espaço que o Tailwind não gera (o tooltip sem z-index — conferido no `dist/`), dois
`!important` isentos, sombras e camadas fixas das sobreposições, um nome do `@theme` com dois donos
(`--color-theme-title` — conferido), o `@theme` que o `DesignScope` não alcança, o catálogo dessincronizado do
schema em opção e tipo, e descrições. A lista, com arquivo e linha, está no anexo, seção **"Lote 4"**. A herança na
troca de tema vai para a `plan-116`, e as contrapartes incompletas, para a `plan-110`.

**Lote 4** (mesma disciplina dos anteriores): cada item do anexo corrigido ou fora com motivo medido; trava para as
classes novas (classe arbitrária com espaço; opção e tipo na paridade do catálogo; reserva de nome derivado
declarado em CSS); casos de navegador para o que é CSS, inclusive dentro do `DesignScope`. O fechamento depois do
lote 4 é uma re-auditoria **dirigida** ao que o lote 4 tocou e às regressões, não uma nova varredura aberta.

## Veredito — 2026-10-14 — lote 4 — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK; `playwright test` sobre esse `dist/`: **318/318**, com os 13 casos de `residuo-da-reauditoria.spec.ts` (inclusive a prévia dentro do `DesignScope` e a desmontagem); suíte completa **482/482 arquivos, 3374/3374 testes, numa passada limpa** (a 1ª tentativa do revisor foi cortada pelo limite do comando, sem falha de teste; repetida sozinha); `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK; varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0.

**Decisões do executor — aceitas:** L4.4 parcial (as três classes de raio ficam na camada final, porque o Tailwind gera utilitária homônima a partir do `@theme` e venceria sem os quatro cantos; o conflito no mesmo elemento passa pelo `mergeSarakClasses`, que agora as conhece); `sarak-page-surface` marca o contêiner de página (L4.3); escada de camadas por token com `zIndexToast` 9100 (L4.6); `@theme inline` mais o corpo duplicado em `:root, .sarak-design-scope`, com teste de igualdade (L4.9); catálogo com o tipo do schema (L4.16).

**Achado do executor, regressão do lote 3:** `PresetCard.tsx` (grade de textura) — o codemod de reserva pôs uma cor onde o gradiente espera posição de parada; a textura `grid` do preview perde a linha. Entra na verificação dirigida de fechamento.

**Próximo:** verificação **dirigida** (o que o lote 4 tocou, as regressões dos lotes 1-4 e o achado acima), não varredura aberta.

## Veredito — 2026-10-14 — lote 4 — 🔴 Aprovação reaberta (verificação dirigida)

**Por que reabre:** a verificação dirigida de fechamento (somente leitura sobre `git diff 60c137f3 -- src/` e o worktree) achou uma regressão do próprio lote 4, conferida pelo revisor: **16 entradas `select` do catálogo ficaram sem opções** (em `60c137f3` era 1): `layoutDensity`, `maxContentWidth`, `borderStyle`, `iconFamily`, `iconWeight`, `bgGradientMode`, `surfaceMaterial`, `borderType`, `systemTone`, `texture`, `shadowOrientation`, `shadowColorMode`, `inputBorderType`, `chartType`, `flowGridStyle`, `chatBubbleStyle`. Causa: `gates/scripts/audit/catalog-drift.ts:45` (`schemaAllowedValues`) só lê `constraints.options`, e 57 tokens do schema declaram `options` no nível de cima (`atmosphere.ts:185` `options: TEXTURE_OPTIONS`, `:321` `shadowOrientation`…); o gate esperou `null` e a sincronização **apagou** as opções. A nota de `docs/migracoes.md` ("igual ao schema; a paridade confere tipo e valores permitidos") fica falsa para essas 16. O revisor aprovou sem contar as opções do catálogo antes e depois.

**Achados (correção 1):**

1. `catalog-drift.ts` lê as opções do schema como a validação lê (`constraints.options ?? options`, o mesmo de `getEnumOptions` em `validation.ts`); as 16 entradas voltam a ter as opções do schema (as 40 texturas inclusive); caso de mutação com opção declarada no nível de cima; teste que falha se o número de `select` sem opção no catálogo for maior que zero.
2. `PresetCard.tsx:76` (textura `grid` da prévia) — cor no lugar de posição de parada do gradiente: a declaração é inválida e a textura não desenha (defeito anterior à plan, mantido pelo codemod do lote 3). O gradiente desenha a grade com a cor de borda do tema.
3. `NoiseOverlay.tsx:12` (`z-[9999]`) e `.sarak-vignette-layer` (`_theme.css:212`, `z-index: 9999`) ficam acima do toast (9100) e do tooltip (9000): ruído e vinheta escurecem e granulam as sobreposições. A atmosfera decorativa fica abaixo de toda sobreposição da escada de camadas (sem perder o efeito sobre o conteúdo), por token.
4. Medir `SarakShellNav.tsx:101` (`calc(var(--sarak-nav-marker-glow, 10) * 1px)`): se o motor emitir `navActiveMarkerGlow` com unidade, o `calc` é inválido — corrigir se for o caso.

## Veredito — 2026-10-14 — lote 4 (correção 1) — 🟢 Aprovado — a plan está fechada

**Conferido no worktree:** recontagem do revisor no catálogo: 402 entradas, 64 `select`, **0 sem opção** (eram 16), `texture` com 41 opções (eram 5 em `60c137f3`), descrições vazias 26 → 26 (nada mais esvaziou); `npm run build` OK; `playwright test` sobre esse `dist/`: **320/320** (vinheta sob o toast aberto; brilho do marcador válido); suíte completa **482/482 arquivos, 3379/3379 testes, numa passada limpa**; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK; varredura do padrão "Segredo atribuido": 0.

**Achados fechados:** 1 (opções lidas como a validação; teste que falha acima de zero; mutação com opção no nível de cima), 2 (grade da textura do `PresetCard`), 3 (atmosfera em `--sarak-z-sidebar` + 50: cobre conteúdo e cromo, fica abaixo de toda sobreposição); 4 improcedente, medido (o motor emite o número sem unidade; o `calc` é válido).

**Fechamento da `plan-115`:** os quatro lotes aprovados; a verificação dirigida de fechamento achou só o que esta correção fechou. **Status: 🟢 Aprovada.** Próximo: o dono commita; o revisor sintetiza (destino da §8) e despacha o lote 1 da `plan-116`.
