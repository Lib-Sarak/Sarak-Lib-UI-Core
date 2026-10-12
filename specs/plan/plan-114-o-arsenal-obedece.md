---
tipo: "plan"
titulo: "O arsenal obedece: cascata que cede ao componente, uma variavel com um dono, componente que le o proprio token, modo claro legivel e painel que grava o que mostra"
objetivo: "Corrigir tudo o que a verificacao completa de 2026-10-12 mediu entre o token e a tela, em cinco lotes revisados um a um, e travar cada classe de defeito com gate, antes de os temas serem refeitos"
dominio: "Design Engine / CSS do motor / Componentes / Painel de customizacao / Contraste"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "design-engine", "tokens", "css", "cascata", "painel", "contraste", "gate", "temas"]
relacionados: ["[[02-design-engine]]", "[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[04-contrato-de-tokens-e-paridade]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md"
---

# 1. Objetivo

O que o tema declara é o que a tela mostra, em qualquer componente, nos dois modos, e o painel grava o que exibe.
Cada classe de defeito que a verificação completa mediu é corrigida **e** travada por gate, para não voltar.

# 2. Contexto

**Decisão do dono, 2026-10-12:** aceitar esta plan com "uma verificação completa para localizarmos e corrigirmos
os problemas" antes de refazer os temas (`plan-110`, lote 1 em espera).

As plans 111-113 fizeram cada token **ter leitor**. A verificação de 2026-10-12 (três auditorias somente-leitura no
`HEAD` `56c3324b`, conferidas pelo revisor nos pontos de maior impacto) mostrou o degrau seguinte: **ter leitor não
garante que a tela obedeça.** A lista medida, com arquivo e linha, está em
[`anexos/plan-114-achados-da-verificacao.md`](anexos/plan-114-achados-da-verificacao.md). Em resumo:

| Lote | Classe de defeito | Peso |
|---|---|---|
| **1 — Cascata** | o bloco `!important` do cartão (`_atmosphere.css:659-679`) vale sempre, pelo `.sarak-design-scope`, e atropela raio, fundo, borda, hover, transição e o modo eco; o reset de `main`/`section`/`article` deixa o Kanban transparente | causa raiz: enquanto ele existir, corrigir componente não aparece |
| **2 — Variável** | 14 variáveis com dois donos (o raio mestre nunca chega aos cantos; `--theme-surface` ≠ `--surface-color`); ~20 nomes lidos que nada emite; 266 reservas divergentes do padrão (134 só do `#3b82f6`); curvas Bezier gravadas sem `--` | o tema muda um token e outro vence |
| **3 — Componente** | o botão primário não lê `btnPrimaryBg`/`btnPrimaryText` e desenha texto `--text-muted` sobre a primária; tabela, sobreposições, switch, modal, cartões e chat com valor fixo onde há token; 16 durações literais; o gate conta o painel como leitor | o tema declara e o componente ignora |
| **4 — Modo claro** | ~44 brancos/pretos translúcidos que somem no claro; 202 pares desenhados abaixo de 4,5:1 fora do verificador; contrapartes que herdam cor do modo nativo | ilegível em tema claro |
| **5 — Painel** | 37 sliders responsivos mostram `NaN` e apagam os breakpoints; um `select` que não grava nada válido; 7 tokens sem controle; sufixo `px` em 48 sliders sem unidade; cor com alfa perdida em 43; 41 valores de tema cortados sem aviso | o painel mente sobre o valor |

# 3. Escopo

## 3.1 Dentro
- `src/styles/` (cascata, leitores, reservas), `src/components/**` (leitura de token, modo claro), `src/core/Design/schema/`, `catalog/`, `src/core/Provider/` (emissor, injetor, validação, `removedTokenKeys.ts`), `src/core/Design/presets/themes/` (só trocar valor que o contrato corrigido exigir e cor de contraparte reprovada — sem redesenho), `src/features/DesignEngine/` (controles do painel, pré-visualização, mocks).
- `gates/` — uma trava por classe (§5, passo 7), com limites declarados (R18) e caso de mutação; `gates/scripts/audit/verify_contrast.ts`.
- `browser-tests/`, testes unitários, `docs/migracoes.md` (subseção em `## 8.0.0`), artefatos regenerados.

## 3.2 Fora
- Redesenhar tema (é a `plan-110`). Criar componente. Token novo só quando o componente existe e não há token para o aspecto que um tema espera controlar (ex.: sombra de sobreposição) — declarado no resumo.
- Mudar o desenho padrão sem declarar: o padrão continua igual, ou a diferença vai na nota MAJOR com o motivo.
- Qualquer spec em `specs/` (síntese do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/plan-114-achados-da-verificacao.md` | a lista medida, por lote |
| Spec fixa | `arquitetura/02-design-engine.md` (§9.1, §10) | camadas CSS, o que cede à classe, o que cada token desenha |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` | o painel e a pré-visualização |
| Spec fixa | `specs/09-temas-e-presets.md` (§4.2, §4.4.3, §4.4.4, §6) · `arquitetura/04-contrato-de-tokens-e-paridade.md` | contrato de valor, paridade, travas de tema |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R7, R18, R31, R34, R35, R40) · `specs/01-gates-e-baseline.md` (§2.2, §4.3) | regras e gates que esta plan estende |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | contraste e movimento reduzido |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-arquitetura-design` · `ui-refatorar-componente` · `ui-novo-componente` | CSS do motor, token e paridade |
| **Skill** | `dataviz` (critério de contraste e cor de status) · `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/core/Design/hooks/useDesignVariables.ts`, `src/core/Provider/components/DesignInjector.tsx`, `src/core/Provider/utils/validation.ts`, `gates/scripts/contrato/check-token-reader.mjs`, `gates/scripts/audit/verify_contrast.ts` | emissor, injetor, validação, gates |

# 5. Instruções de execução

**Cinco lotes, nesta ordem, um por vez.** Cada lote termina com resumo na §9 e status 🟠; o próximo só começa
depois do veredito do revisor. Cada item do anexo termina corrigido, ou fora com motivo medido no resumo.

1. **Lote 1 — Cascata (anexo L1).** O motor não escreve, com `!important` em seletor amplo, propriedade visual que
   o componente controla por token ou por classe: a superfície do cartão sob o tema continua chegando, mas raio,
   fundo, borda, hover e transição do componente vencem; o modo eco e o movimento reduzido continuam vencendo o
   cartão. O reset de `main`/`section`/`article` não apaga fundo de componente nem do consumidor. Durações do motor
   leem `motionDuration*`. Prova em navegador: raio de `catalogSectionRadius`, hover de borda do cartão, fundo do
   Kanban, eco sem desfoque no `.sarak-card`, transição do token — cada um com a contraprova do padrão.
2. **Lote 2 — Variável (anexo L2).** Uma variável, um dono: o mestre de raio chega aos cantos quando o canto não é
   declarado (o canto é exceção, não sobrescrita incondicional); as duas semânticas que dividem `--radius-theme`,
   `--theme-gap`, `--theme-border-width`, `--theme-surface` e `--theme-card-border` ganham nomes próprios e os
   leitores migram; `--sarak-bg-base` tem um dono. Todo nome lido existe (emitido ou declarado em CSS), inclusive
   nos mocks do painel. Toda reserva `var(--x, F)` é o padrão do token (piso mobile-first e palavra-chave são
   aceitos), inclusive a da primária. As curvas Bezier são gravadas com `--`. A prosa falsa do schema sai.
3. **Lote 3 — Componente (anexo L3).** Cada componente lê o token que o nomeia; o primário lê `btnPrimaryBg` e
   `btnPrimaryText`; durações leem `motionDuration*`; `cardSurfaceOpacity` age só na superfície; `glow-only` acende o
   brilho. O `token-reader:check` deixa de contar o painel como leitor de token que tem componente na lib.
4. **Lote 4 — Modo claro e contraste (anexo L4).** Nenhum branco/preto translúcido fixo em componente onde o tema
   decide a cor; o texto sobre cor sólida (badge, botão, bolha do chat) é escolhido pelo contraste, não fixo; o
   verificador de contraste mede os pares **que os componentes desenham** (inclusive os do anexo L4.2), e as
   contrapartes reprovadas recebem a cor que as faz passar (troca de valor, não redesenho).
5. **Lote 5 — Painel e contrato numérico (anexo L5).** O slider de token responsivo edita os três breakpoints sem
   perdê-los; `select` grava o `value` da opção (o `id` e o `value` de `cardTitleFontWeight` se alinham); todo tipo
   do schema tem controle; o sufixo é a unidade declarada (sem `px` presumido); o controle de cor preserva alfa e
   aceita `var()`; padrões dentro de `min/max/step`; o schema oferece as intenções que os temas declaram e hoje são
   cortadas ("desligado", "pílula", a unidade do tracking), e valor de tema fora do contrato numérico é acusado
   pela trava de tema em vez de cortado em silêncio.
6. **Em todo lote:** testes unitários do que é JS; casos de `browser-tests/` para cada efeito de CSS (a cena que o
   harness monta é o padrão do caso); nota MAJOR na subseção da `## 8.0.0`; gerados regenerados (`guide` por
   último); simulação do Anel 0 sobre as linhas adicionadas.
7. **Travas (uma por classe, no lote em que a classe fecha):** `!important` visual em seletor amplo do motor
   (lote 1); variável com mais de um dono, nome lido sem dono e reserva divergente do padrão (lote 2); painel não
   conta como leitor (lote 3, no `token-reader:check`); pares desenhados no verificador de contraste (lote 4);
   valor de tema fora do contrato numérico (lote 5). Gate novo ou extensão de um existente, à escolha justificada do
   executor; cada um com limites no cabeçalho (R18), caso de mutação no teste, ligado ao Anel 1 e à CI (ou ao
   `run_audit`, se nascer com dívida medida), e falhando no `HEAD` anterior.

# 6. Critérios de aceite

- [ ] Lote 1: nenhum `!important` visual em seletor amplo atropela token ou classe de componente; Kanban com fundo; eco e movimento reduzido vencem o cartão; casos de navegador verdes.
- [ ] Lote 2: zero variável com dois donos (mestre + exceção funcionando); zero nome lido sem dono; zero reserva divergente do padrão; Bezier com `--`.
- [ ] Lote 3: os itens L3.1–L3.15 obedecem ao token; o painel não conta como leitor.
- [ ] Lote 4: zero branco/preto translúcido fixo em componente onde o tema decide; os pares desenhados medidos e verdes nos 14 temas × 2 modos.
- [ ] Lote 5: L5.1–L5.10 resolvidos; valor de tema fora do contrato acusado.
- [ ] Uma trava por classe, falhando no `HEAD` anterior e passando depois.
- [ ] Paridade convergente; `auditor_presets`, `tokenContractParity`, `shippedThemesConsoleClean` e contraste verdes.
- [ ] Nota MAJOR em `## 8.0.0` a cada lote.
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; Anel 1 inteiro; casos de `browser-tests/` escritos (o revisor roda `npm run build` e `cromo-css-real:check`); Anel 0 simulado: 0.

# 7. Como verificar (uso do revisor)

- `git diff --stat` → só a §3.1 e os gerados.
- Cada item do anexo do lote: conferido no código e, quando é CSS, no navegador.
- Cada trava: falha no `HEAD` anterior; mutação (reintroduzir o defeito) faz falhar.
- `npm run build` + `npm run cromo-css-real:check` · `npm run audit` · `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline -- --with-tsc` · Anel 1 · simulação do Anel 0.

# 8. Destino da síntese

**Destino:** `arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md`

- **`02-design-engine`:** a cascata (o que o motor impõe e o que cede), um dono por variável, mestre + exceção, reserva = padrão, componentes que leem os próprios tokens, texto sobre cor sólida por contraste.
- **`09-temas-e-presets`:** o contrato numérico acusado (não cortado em silêncio), as intenções novas do schema, as contrapartes.
- **`06-painel`:** controle por tipo, slider responsivo, unidade, cor com alfa.
- **`00-regras` e `01-gates`:** as travas novas (regra nova ou extensão de R7/R31/R40, a decidir na síntese pelo que o gate cobrar).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — lote 1 (cascata) — 2026-10-12

**Resultado:** Concluído (lote 1), com **uma decisão aberta para o revisor** (item 1 de *Decisões e suposições*): a classe `bg-*`/`hover:bg-*` num cartão da lib não vence a superfície do tema.

**Estado do worktree ao iniciar**
```
 M specs/00-contexto.md
 M specs/00-indice.md
 M specs/arquitetura/02-design-engine.md
 M specs/arquitetura/03-superficie-publica.md
 M specs/plan/plan-110-temas-que-mostram-a-biblioteca.md
 D specs/plan/plan-111-todo-token-visual-desenha.md
 D specs/plan/plan-112-o-resto-do-arsenal-desenha.md
 D specs/plan/plan-113-o-schema-que-o-painel-oferece-desenha.md
 M specs/specs/00-regras-e-invariantes.md
 M specs/specs/01-gates-e-baseline.md
 M specs/specs/09-temas-e-presets.md
?? specs/plan/anexos/plan-114-achados-da-verificacao.md
?? specs/plan/plan-114-o-arsenal-obedece.md
```
(`HEAD` `56c3324b`. Tudo em `specs/` acima é anterior e não foi tocado, salvo esta plan: o `status` e este bloco.)

**O que foi feito**
- `src/styles/_card-defaults.css` (novo, 89 linhas), importado em `sarak-base.css:16` na subcamada `components.sarak-elements`, **sem nenhum `!important`**: raio (4 cantos), traço, largura da borda (4 lados), desfoque e transição do `.sarak-card`/`.bg-theme-card` (piso) e, sob `[data-sx-texture]`/`.sarak-design-scope`, também do `.card`; mais o reset de `main`/`section`/`article`/`.sarak-module-container` como **padrão transparente**. A classe utilitária e o `style` do componente vencem — L1.1, L1.2.
- `src/styles/_atmosphere.css:636-650`: o bloco que escrevia 11 propriedades com `!important` virou só a **superfície do tema** (`background-color` e `border-color` com as opacidades, e `clip-path: var(--sarak-card-clip-path, none)`), sem `!important` e sem o atalho `background`. O reset `!important` de `main`/`section`/`article` (antes `:643-657`) saiu daqui.
- `src/styles/_atmosphere.css:393-395`: `aurora-classic` — `opacity: 0.7 !important` virou a leitura de `--sarak-card-texture-opacity`/`--sarak-bg-pattern-opacity`/`--theme-texture-opacity` (reserva 0,7); `#8b5cf6`/`#06b6d4` viraram `var(--theme-secondary, …)`/`var(--theme-accent, …)` — L1.3.
- `src/styles/_cards.css:1-14`: o fundo do `.sarak-card, .bg-theme-card` perdeu o `!important` (L1.4) e o raio, a borda, o desfoque e a transição saíram para `_card-defaults.css`; `:64` o brilho lê `--duration-slow`.
- `src/styles/_performance.css:20-30`: regra de eco que mira `.sarak-card`, `.bg-theme-card` e `.card` (empata em especificidade com o material `frosted` de `_surfaces.css` e vem depois) — o eco tira o desfoque do `.sarak-card` sob o material padrão.
- `src/styles/_theme.css:100`: `.bg-theme-card` perdeu `background-color`/`backdrop-filter`, que `_cards.css` já vencia (código morto que, na camada final, venceria o padrão rebaixado).
- Durações (L1.6) — `_card-defaults.css:38-41,62,88`, `_cards.css:64`, `_atmosphere.css:18,47`, `_elements.css:33,70,75` leem `--duration-fast/normal/slow` (o que `motionDuration*` emite), com a reserva igual ao literal anterior.
- Comentários que descreviam o `!important` removido: `SarakTableView.tsx:11-15`, `CardsCatalog.tsx:62-67`.
- **Trava** `gates/scripts/contrato/check-css-important-visual.mjs` (`npm run css-important:check`): nova, com LIMITES DECLARADOS (R18) no cabeçalho, uma exceção declarada (`_base.css` `body { background-color }`, e acusa exceção vencida), ligada ao Anel 1 (`.githooks/pre-commit:156`) e à CI (`.github/workflows/gates.yml:94,105`), `package.json` (`css-important:check`).
- Testes: `gates/scripts/contrato/__tests__/check-css-important-visual.test.mjs` (22 casos: plantados, passantes, exceção vencida, repositório real), `src/styles/__tests__/cartaoQueCedeAClasse.test.ts` (16), `atmosferaEBotoesQueDesenham.test.ts:118-120` (ajustado ao novo lugar do `border-style`/`border-color`).
- Navegador: `browser-tests/cascata-que-cede.spec.ts` (11 casos) e a cena `?cena=cascata` + recorte `cascata-raio-catalogo` em `browser-tests/fixtures/harness-entry.tsx`.
- `docs/migracoes.md:207` — subseção MAJOR na `## 8.0.0`; gerados regenerados (`dev-kit`, depois `guide`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/_card-defaults.css` | criado | padrão do cartão e do contêiner, na camada que cede, sem `!important` |
| `src/styles/sarak-base.css` | alterado | importa o parcial novo em `components.sarak-elements` |
| `src/styles/_atmosphere.css` | alterado | bloco do cartão/reset removido; superfície do tema sem `!important`; aurora; durações |
| `src/styles/_cards.css` | alterado | `!important` do fundo fora; raio, borda, desfoque e transição para o parcial novo; duração do brilho |
| `src/styles/_performance.css` | alterado | eco corta o desfoque do cartão inteiro |
| `src/styles/_theme.css` | alterado | `.bg-theme-card` sem o fundo e o desfoque mortos |
| `src/styles/_elements.css` | alterado | 3 durações literais leem o token |
| `src/components/atomic/Templates/SarakTableView.tsx`, `src/features/DesignEngine/Canvas/components/CardsCatalog.tsx` | alterado | só comentário (descrevia o `!important` que saiu) |
| `gates/scripts/contrato/check-css-important-visual.mjs` + `__tests__/check-css-important-visual.test.mjs` | criado | a trava e o teste dela |
| `.githooks/pre-commit`, `.github/workflows/gates.yml`, `package.json` | alterado | liga a trava ao Anel 1, à CI e ao `npm run` |
| `src/styles/__tests__/cartaoQueCedeAClasse.test.ts` | criado | texto dos parciais |
| `src/styles/__tests__/atmosferaEBotoesQueDesenham.test.ts` | alterado | asserção do estilo de borda no novo lugar |
| `browser-tests/cascata-que-cede.spec.ts` | criado | 11 casos de navegador, com contraprova |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | cena `cascata`, recorte `cascata-raio-catalogo`, imports `SarakCatalogGrid`/`SarakKanban` |
| `docs/migracoes.md`, `sarak-ui/docs/migracoes.md` | alterado | nota MAJOR (e a cópia do kit) |
| `sarak-dev/state.json`, `GUIA-MANUTENCAO.md`, `START-HERE.md` | alterado (gerado) | `npm run dev-kit` |

**Verificações executadas**
- `npx vitest run` → **464 arquivos, 3017 testes, todos verdes** (985 s). A saída traz 213 linhas `Could not parse CSS stylesheet` (jsdom); **não medi contra o `HEAD`** se já existiam.
- `npx tsc --noEmit` → 0 erros. `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
- Anel 1, na ordem do hook, `guide:check` por último: plan×índice, `dev-kit`, barril, catálogo, zero-marca, deep-import, gate-limits, container-query (2), persistence-doc, class-merge, icon-port, chrome-token-parity, token-reader, **css-important**, trail-citation, token-types, migration-anchor, guide → **19 de 19 com exit 0**.
- Anel 0 simulado (`config.json` do hook sobre as linhas adicionadas do `git diff HEAD` + os 5 arquivos novos, **antes** de escrever este bloco; não varri `sarak-dev/`/`sarak-ui/`, que são cópia de texto já varrido) → 966 linhas, 19 arquivos, **0 achados**.
- **Navegador — fora do repositório, sem tocar `dist/`:** `npm run build` reescreveria os 40 arquivos rastreados de `dist/`, então abortei um build que iniciei e montei uma cópia em `%TEMP%` (`dist/` do `HEAD` + `sarak.css` compilado do worktree por `@tailwindcss/cli` + o CSS injetado nos 2 `.js` trocado pelo novo + `browser-tests/`, junção para `node_modules`), removida ao fim. Resultado contra o CSS **novo**: **190 de 190** (suíte inteira do `playwright`, 6,3 min); contra o CSS do **`HEAD`**: o `cascata-que-cede.spec.ts` dá **7 falhas e 4 passes** — os 4 passes são as contraprovas (raio do `.card` sem classe, superfície do cartão, `<section>` solto transparente, transição padrão). O `build:css:scoped` rodou na mesma cópia: as regras novas saem escopadas em `.sarak-scope`. **Isto não substitui o `npm run build` + `cromo-css-real:check` do revisor** (o build também roda `build:js` e os `*:check`, que eu não encadeei).
- **A trava contra o `HEAD` anterior:** `check-css-important-visual.mjs --styles-dir <CSS do HEAD>` → **exit 1, 79 declarações** (`_atmosphere.css:643` e `:659`, `_cards.css:2`); no worktree → exit 0. Mutação na cópia do worktree: `.sarak-design-scope .sarak-card { border-radius: 1px !important }` → exit 1; `[data-sx-texture] main { background-color: transparent !important }` em `_card-defaults.css` → exit 1.

**Critérios de aceite**
- [x] Lote 1: nenhum `!important` visual em seletor amplo atropela token ou classe de componente — evidência: `css-important:check` exit 0 (e 79 acusações no `HEAD`).
- [x] Kanban com fundo — `cascata-que-cede.spec.ts` "fundo: a coluna e o cartão do Kanban…" (verde no novo, vermelho no `HEAD`); `<section>` solto segue transparente (contraprova).
- [x] Eco e movimento reduzido vencem o cartão — casos "eco" (desfoque `none`, transição `0.1s`) e "movimento reduzido" (`prefers-reduced-motion`, < 0,001 s); verdes só no CSS novo.
- [x] Raio de `catalogSectionRadius`, hover de borda, transição pelo token — casos 1, 4 e 10 do spec, cada um com contraprova.
- [x] Durações do motor leem `motionDuration*` — `cartaoQueCedeAClasse.test.ts` ("durações do motor…") e o caso `schema-movimento` → `0.7s`.
- [ ] **"Toda `bg-*` de cartão e o `hover:bg-*`" (a coluna "O que atropela" de L1.1)** — **não atendido**; ver *Decisões* 1 e *Pendências*.
- [x] Resumo "lote 1" na §9; status 🟠.

**Decisões e suposições**
1. **A superfície do tema (cor do fundo e da borda) continua do motor, na camada final e sem `!important`; só raio, largura/traço da borda, desfoque e transição foram para a camada que cede.** O prompt pede duas coisas que, para a COR do fundo, se excluem: "a superfície do cartão sob o tema continua chegando" e "o fundo do componente vence". Implementei primeiro as duas pelo lado do componente (fundo na camada que cede) e o guarda que já existe — `css-que-so-o-navegador-mede.spec.ts:95` "NÃO MUDA NADA: … um cartão real da lib computa a superfície de cartão" — **falhou**, porque todo cartão da lib repete `bg-[var(--color-theme-card,#1e293b)]` (SarakTitleCard, SarakCatalogGrid, SarakChart, SarakStats…) e a classe apagaria `cardSurfaceOpacity`. Fiquei com a leitura que preserva o guarda e a aparência. **Consequência:** `hover:bg-*` num `.card`/`.sarak-card` **continua não aparecendo** (a superfície vence por camada, não por `!important`); o `background-image` do componente e o `style` inline passam a aparecer. Se o dono quer o contrário, é trocar a classe de fundo dos cartões da lib (lote 3) e rebaixar o fundo — o parcial novo já tem o lugar.
2. **L1.5 não se reproduz:** nenhum componente da lib carrega `.sarak-shell-sidebar`/`.sarak-shell-header` (só o CSS cita) e não há token `sidebarBorderColor`/`topbarBorderColor` no schema. A regra de moldura (`_surfaces.css:60-83`) é escolha explícita por atributo com valor e passa na trava. Sem mudança.
3. **`clip-path` fica na camada final, sem `!important`**: `--sarak-card-clip-path` é `none` sem corte; o polígono de `_cards.css` com corte 0 ainda recortaria a sombra do cartão. Não é propriedade que componente controle por classe.
4. **O gate classifica por forma do seletor** (alvo amplo × estreitado por atributo com valor, pseudo-estado, classe de modo ou `@media`); `[data-sx-texture]` sem valor e `.sarak-design-scope` **não** estreitam. Uma lista de âncoras de componente e uma exceção (`body`). Gate novo, não extensão: nenhum existente olha `src/styles/`.
5. **Valores que mudam no tema padrão por tokenizar duração** (todos declarados na nota MAJOR): `transform`/`box-shadow` do cartão sem tema 0,4→0,3 s; brilho e camada de textura 0,5→0,6 s; `main`/`section` e títulos 0,4→0,3 s. Botão e campo seguem 0,2 s. A reserva de cada `var(--duration-*, …)` é o literal antigo.
6. A tabela mantém o workaround `--sarak-card-radius-*` (`SarakTableView.tsx:17-22`): ficou redundante com o raio por classe, mas é do lote da tabela; só o comentário mudou.
7. O `SarakKanban` ganha o fundo declarado e **não foi alterado**.

**Achados fora do escopo (não corrigidos)**
- `SarakStats.tsx:105` — `hover:bg-white/[0.04]` num `.card` nunca aparece (decisão 1); idem `hover:bg-*` em qualquer `.sarak-card`.
- `_utilities.css:33` — `.bg-theme-card:active { background-color: var(--theme-primary-active) }` na camada final, vence `active:bg-*`.
- `_theme.css:100-102` — `box-shadow: var(--sarak-dynamic-shadow)` em `.bg-theme-card` é sempre vencida por `_cards.css` (mesma especificidade, depois).
- `_performance.css:5,26` — `0.1s !important` literal: é o eco, intencional; não é leitura de token.
- `_atmosphere.css` — a textura `aurora-classic` ainda anima em `30s linear infinite` literais (animação, não transição).

**Pendências / riscos**
- Os componentes que repetem `bg-[var(--color-theme-card,…)]` num `.card` seguem recebendo a superfície por cima da própria classe — por desenho (decisão 1). O revisor decide se isso fecha L1.1.
- Quem tem `rounded-*`/`border-2`/`transition-*` num `.sarak-card`/`.card` passa a ver a própria classe (nota MAJOR). Procurei no próprio repositório: os componentes de L1.1 passam a ter o raio que declaram; não abri o ERP.
- Não rodei `npm run build` nem `cromo-css-real:check` por inteiro (acima); `dist/` está intacto no `git status`.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-12 — lote 1 — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK; `playwright test` sobre esse `dist/`: **190/190**, com os 11 casos de `cascata-que-cede.spec.ts`; suíte completa 464/464 arquivos, 3017/3017 testes; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK, com o `css-important:check` novo; a trava contra o CSS do `HEAD` (extraído por `git archive`, `--styles-dir`) acusa `_atmosphere.css` e `_cards.css` e sai com erro; no worktree, OK. `_card-defaults.css` não tem `!important` (as 4 ocorrências da palavra são comentário); os dois `!important` que restam em `_atmosphere.css` são do fundo de mídia, sob atributo com valor. Varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0.

**Decisão 1 do executor (a superfície do tema segue na camada final, sem `!important`) — aceita para este lote.** O guarda `css-que-so-o-navegador-mede.spec.ts` ("um cartão real da lib computa a superfície de cartão") é contrato vigente, e os cartões da lib repetem `bg-[var(--color-theme-card,…)]`, que apagaria `cardSurfaceOpacity`. O caminho que cumpre as duas metades do pedido passa a ser do **lote 3**: tirar dos cartões da lib a classe de fundo redundante (a superfície vem do tema, de um lugar só) e então rebaixar a superfície para a camada que cede, para que `bg-*`/`hover:bg-*` do componente e do consumidor vençam. Entram no lote 3, junto: `_utilities.css:33` (`.bg-theme-card:active` na camada final vence `active:bg-*`) e `_theme.css:100-102` (sombra de `.bg-theme-card` sempre vencida). O anexo ganha esses itens em L3.

**Próximo:** lote 2 (variável), depois do commit deste lote.
