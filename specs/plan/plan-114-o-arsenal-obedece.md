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

## Resumo da execução — lote 2 (variável) — 2026-10-12

**Resultado:** Concluído (lote 2), com **três decisões abertas para o revisor** (itens 1, 3 e 6 de *Decisões e suposições*) e uma correção de causa raiz fora da lista do anexo (`validateDesign` forçava `borderRadius` a 12).

**Estado do worktree ao iniciar**
```
(limpo)
```
(`git status --short` vazio; `HEAD` `fc257131`, o lote 1 commitado. Nada em `specs/` foi tocado, salvo esta plan: o `status` e este bloco.)

**O que foi feito**
- **L2.1 — mestre + exceção.** `exceptionOf` entra em `SarakDesignToken` (`src/core/Design/types.ts`) e nos oito cantos (`schema/cards.ts` `cardRadiusTL/TR/BL/BR`, `schema/buttons.ts` `btnRadiusTL/TR/BL/BR`). O laço de tokens de `useDesignVariables.ts` não escreve o canto quando ele está ausente ou igual ao padrão do schema (`designVariableHelpers.ts`, `isUndeclaredException`, que compara o responsivo por ponto: a validação reordena as chaves e a comparação por `JSON.stringify` falhava em silêncio). O mestre, que já listava as variáveis dos cantos em `cssVars`, passa a chegar a eles — nos dois modos, porque só um escritor sobra.
- **L2.1 — nome próprio.** `--radius-theme` fica só com `borderRadius` (`cards.ts`: saiu de `cardBorderRadius`); `--theme-gap`, só com `layoutGap` (saiu de `cardPaddingMd`); `--theme-border-width`, só com `borderWidth` (saiu de `cardBorderWidth`; `_surfaces.css:73` lê `--sarak-card-border-width`); `--theme-surface`, só com `surfaceColor` (saiu de `cardBackgroundColor`, `colors.ts:125`; `_base.css:17` deixa de ler `--theme-surface-border`); `--theme-card-border` fica só como variante derivada do fundo do cartão (saiu de `cardBorderColor`, `colors.ts:134`); `--sarak-bg-base`, só com `bgBaseColor` (saiu de `colorBgBody`, `atmosphere.ts:65` — o valor que a tela já via).
- **Temas embarcados** (`presets/themes/*.ts`, 10 arquivos, 72 linhas removidas): os cantos que repetiam o mestre saíram — sem mudar o desenho, e sem isso o slider mestre continuaria sem efeito nesses temas. Os cantos que diferem do mestre ficaram (cyberpunk-neon, minimalist-airy, neo-brutalism, neumorphic-mobile têm mestre ≠ cantos por desenho).
- **Causa raiz achada pelo navegador:** `src/core/Provider/utils/validation.ts:240` forçava todo `borderRadius` que não fosse número a `12`, descartando o responsivo do tema e do painel (a prosa acima dele afirmava o contrário). Agora só a ausência recebe o piso.
- **L2.2 — nome lido existe.** `_colors.css` lia `--sarak-bg-body-rgb`/`--sarak-sidebar-bg-rgb`, que ninguém emitia (por isso `--bg-body-rgb` era sempre `248, 250, 252`): o hook os emite (`designVariableHelpers.ts`, `emitColorChannels`). `_base.css:78` lê `--sarak-max-content-width`. Os 10 nomes dos mocks do painel (`--theme-text-sec`, `--sarak-radius`, `--sarak-radius-sm`, `--sarak-status-success/-error`, `--theme-main`, `--theme-shadow`, `--font-tab/-subtitle/-body`) leem as variáveis reais.
- **L2.3 — reserva = padrão.** 298 reservas em 88 arquivos reescritas com `gates/scripts/contrato/helpers/fix-fallbacks.ts` (ferramenta de manutenção, `--write`): 137 da primária (`#3b82f6` → `#00f2ff`), 9 de `-bg`, o resto em fundo, texto, borda, tipografia, espaçamento e textura. `PresetCard.tsx` deixou de ler chaves de token responsivo que nunca entram em `variables` e de usar cor como largura de borda.
- **L2.4.** `BEZIER_CURVES` grava `--sarak-bezier-standard/-decelerate/-accelerate/-sharp` (`constants.ts`); a prosa falsa saiu de `atmosphere.ts` (`bgBaseColor`, `colorBgLayer1/2`), `colors.ts:131`, `layers.ts:37` (afirmava `zIndexModal` duplicado: medido, 0 ids duplicados) e `_base.css:43-47`.
- **Trava** `gates/scripts/contrato/check-variable-contract.ts` (+ `helpers/variable-contract-core.ts`), `npm run variable-contract:check`: três regras (um dono, nome lido existe, reserva = padrão), LIMITES DECLARADOS no cabeçalho, `ALLOWLIST` vazia que acusa entrada vencida. Ligada ao Anel 1 (`.githooks/pre-commit`, bloco após o `token-types:check`) e à CI (`.github/workflows/gates.yml`).
- **Testes.** `gates/.../__tests__/check-variable-contract.test.ts` (17, com casos plantados), `src/core/Design/hooks/__tests__/useDesignVariablesDonoUnico.test.ts` (12). Navegador: `browser-tests/variavel-com-dono.spec.ts` (9) e, em `fixtures/harness-entry.tsx`, o recorte `dono-*` (tema ativo do consumidor, não `config`: o tema vence a config) e `?modo=embarcado`.
- Testes existentes ajustados ao padrão novo: `NoiseOverlay`, `SarakScrim`, `SarakModal.surfaceTokens`, `SarakInput.paddingToken`, `SarakTooltip.radiusToken`, `ChromeSidebarBody`, `MessageList`, `atmosferaEBotoesQueDesenham`, `cartaoQueCedeAClasse`; 13 snapshots regravados.
- `docs/migracoes.md` — subseção MAJOR na `## 8.0.0` (e o parêntese da `aurora-classic`, do lote 1, que ficou falso); `gates/baselines/audit-baseline.json` regravado (`--write`); `sarak-dev/` e `sarak-ui/` regenerados.

**Arquivos alterados** (151 modificados e 6 novos, fora `specs/`; a lista é a do `git status`)
| Grupo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/types.ts`, `schema/{cards,buttons,colors,atmosphere,layers}.ts` | alterado | `exceptionOf`, donos únicos, prosa |
| `src/core/Design/hooks/useDesignVariables.ts`, `designVariableHelpers.ts` (novo) | alterado/criado | exceção não declarada não escreve; canais `r, g, b` |
| `src/core/Provider/utils/validation.ts`, `constants.ts`, `components/DesignInjector.tsx` | alterado | `borderRadius` responsivo; Bezier com `--`; reserva da fonte |
| `src/core/Design/presets/themes/*.ts` (10) | alterado | cantos redundantes removidos |
| `src/styles/*.css` (12), `src/components/**` e `src/features/**` (≈100) | alterado | reservas = padrão; leitores migrados; mocks |
| `gates/scripts/contrato/check-variable-contract.ts`, `helpers/variable-contract-core.ts`, `helpers/fix-fallbacks.ts` | criado | a trava e a ferramenta de reescrita |
| `.githooks/pre-commit`, `.github/workflows/gates.yml`, `package.json` | alterado | liga a trava |
| testes e 13 snapshots | alterado/criado | ver acima |
| `browser-tests/variavel-com-dono.spec.ts` (novo), `fixtures/harness-entry.tsx` | criado/alterado | 9 casos, nos dois modos |
| `docs/migracoes.md`, `sarak-ui/docs/migracoes.md`, `sarak-dev/*`, `gates/baselines/audit-baseline.json` | alterado | nota MAJOR e gerados |

**Verificações executadas**
- `npx vitest run` (suíte completa) → 466 arquivos, 3046 testes: **3044 passaram, 2 falharam** — `check-class-merge` (timeout de 5 s sob carga; passa isolado) e meu próprio gate (o `designVariableHelpers.ts` novo não estava na lista de arquivos que escrevem variável; consertado). Os dois arquivos, rodados de novo juntos: **32 de 32**. **Não repeti a suíte inteira depois desse conserto.**
- `npx tsc --noEmit` → 0 erros. `check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-10-12" (antes: `hardcoded` 0→2 e `cleancode` 0→2 por meu código; consertados — `PresetCard.tsx` com `var()`+reserva, `validation.ts` ≤ 250 linhas).
- Anel 1, na ordem do hook, `guide:check` por último: 20 gates (plan×índice, `dev-kit`, barril, catálogo, zero-marca, deep-import, gate-limits, container-query (2), persistence-doc, class-merge, icon-port, chrome-token-parity, token-reader, css-important, trail-citation, token-types, **variable-contract**, migration-anchor, guide). Primeira passada: 19 com exit 0 e `trail-citation` acusando uma linha minha em `validation.ts` (juntei dois comentários antigos e a linha passou a contar como adicionada); consertado, `trail-citation` exit 0 e `audit:baseline` igual ao baseline em seguida. Não repeti os outros 19 depois disso (o conserto só tocou comentário).
- Anel 0 simulado (`config.json` do hook sobre as linhas adicionadas do `git diff HEAD` e os 7 arquivos novos de fora de `specs/`): 1606 linhas, 139 arquivos, **0 achados** (feito antes deste bloco).
- **Trava contra o `HEAD` anterior:** o gate novo rodado sobre `git archive HEAD src` → **exit 1: 14 variáveis com dois donos, 14 nomes sem dono, 298 reservas fora do padrão**; no worktree → exit 0 (3428 leituras, 1974 reservas conferidas). Casos plantados no `check-variable-contract.test.ts` (dois donos, exceção sem mestre, nome sem dono, nome citado só em array, reserva azul, variante `-bg` antiga).
- **Navegador, fora do repositório e sem tocar `dist/`:** o `npm run build` reescreveria os 40 arquivos rastreados de `dist/`; em vez disso compilei o worktree em `%TEMP%` (`tsup` + `@tailwindcss/cli` + `inject-css`, sem `--dts` nem os `*:check`), com junção para `node_modules`, e removi no fim. Suíte inteira do `playwright` sobre ele: **199 de 199** (190 anteriores + 9 novos), duas vezes (a segunda, com o código final). Os 9 casos sobre o código do **`HEAD`** (mesmo procedimento, `git archive`): **8 falham, 1 passa** (a contraprova "sem tema"). Isto **não substitui** o `npm run build` + `cromo-css-real:check` do revisor.

**Critérios de aceite**
- [x] Lote 2: zero variável com dois donos (mestre + exceção funcionando) — evidência: `variable-contract:check` exit 0 (14 no `HEAD`); `variavel-com-dono.spec.ts` casos 1-6, nos modos App e Embarcado.
- [x] Zero nome lido sem dono — gate (14 no `HEAD`); inclui os mocks do painel.
- [x] Zero reserva divergente do padrão — gate (298 no `HEAD`); 1974 conferidas.
- [x] Bezier com `--` — `constants.ts`; teste `DesignInjector` existente verde.
- [x] `--theme-surface` igual a `--surface-color` — caso 8 do spec e teste do hook.
- [x] Travas do lote com limites no cabeçalho, caso de mutação e falha no `HEAD` — acima.
- [ ] **"Uma trava por classe… falhando no `HEAD` anterior e passando depois"** vale para as três regras do lote 2, mas o `auditor_ghostvars` **não foi estendido** (decisão 2).

**Decisões e suposições**
1. **O canto é exceção quando difere do padrão do schema, não "quando existe na chave".** O estado do Provider é `{ ...padrões, ...tema, ...config }`: a chave do canto sempre existe, com o objeto padrão. "Declarado" só pode significar "diferente do padrão". Efeito colateral aceito: um tema que quer o canto **igual ao padrão do schema** (8/12/12) com mestre diferente não consegue expressá-lo. Tema que declara canto escalar (todos os embarcados com cantos diferentes do mestre) segue mandando.
2. **Gate novo em TypeScript (`tsx`), não extensão do `auditor_ghostvars`.** O auditor tem quatro limites que o plano pede para fechar: aceita qualquer literal como emissor, expande `-rgb`/`-bg`… de **qualquer** base (por isso `--sarak-bg-body-rgb` passava), pula a pasta `Mocks` e lê o manifesto, que "nunca alimentou CSS". Um gate que importa o schema de verdade (`master-map.ts`) resolve a emissão pela mesma lógica do hook e confere o padrão de cada token; o auditor segue como está (e melhorou 1 consumo: o literal `var(--x, 16px)` numa mensagem de `resolveToken.ts`, reescrita).
3. **O anexo L2.2 lista nomes que SÃO emitidos.** `--sarak-primary-color-bg`, `--sarak-status-*-color-bg/-border`, `--theme-error-bg`, `--theme-primary-border`, `--theme-secondary-border` nascem das variantes cromáticas (`generateVariants`) dos tokens `primaryColor`, `statusErrorColor`… — o gate modela a emissão do hook e não os acusa. O conjunto real foi de 14 nomes: 2 de `_colors.css`, 1 de `_base.css` (`--sarak-max-width`), 10 dos mocks do painel e 1 literal de mensagem em `resolveToken.ts`. Os `-bg` e `-border` entraram em L2.3 por outro motivo: a reserva azul contradizia a variante do tema.
4. **Reserva de token responsivo = o ponto `mob`** (piso mobile-first); o gate aceita qualquer dos três pontos. Reserva em `rem` virou `px` do padrão do schema (`1rem` → `16px`): o `html` desta lib tem `font-size` de 14 px, então `1rem` não era 16 px.
5. **Reserva interpolada em template** (`${flowNodeRadius || 12}px`, `SarakFlowEngine`) não é julgada: o valor vem de prop, não de tema.
6. **Cada reserva reescrita é o padrão do token, mesmo onde o efeito sem Provider piora ou é estranho** — o revisor pode querer exceção declarada: `opacity: var(--sarak-card-surface-opacity, 0.8)` (`_cards.css`; o `0,8` já é a opacidade que o cartão tem com Provider, e é o defeito L3.13 do lote 3); `--sarak-btn-neon-pulse-speed` `0s` (a classe `.sarak-btn-neon-pulse` não anima sem Provider); `--sarak-noise-density` `0,05` (o `NoiseOverlay` tinha `0` de propósito, "invisível até o tema pedir"; o Provider sempre emite a variável, então só afeta o primeiro quadro); `--sarak-card-hover-y` `-4px` (o cartão interativo sobe sem Provider); `--sarak-sidebar-active-color`/`-hover-color` `transparent` (o item ativo perde o tom azul sem Provider).
7. **Os quatro temas com mestre ≠ cantos não foram redesenhados** (§3.2): o mestre segue "ignorado" para o cartão neles, por desenho deles; é assunto da plan-110.
8. `_base.css` ainda redeclara `--theme-gap`/`--radius-theme`/`--theme-surface`/`--theme-card` no `body` como piso; com um dono só, deixou de sombrear um valor concorrente, e o inline do motor no `body` vence.
9. `SarakTableView.tsx:17-22` mantém o workaround `--sarak-card-radius-*` (do lote da tabela).

**Achados fora do escopo (não corrigidos)**
- `NoiseOverlay` e a classe `.sarak-btn-neon-pulse`: ver decisão 6 — se a reserva "de proposta" deve ser regra declarada, é a `ALLOWLIST` do gate.
- Os temas `cyberpunk-neon`, `minimalist-airy`, `neo-brutalism`, `neumorphic-mobile`: mestre ≠ cantos (decisão 7).
- `minimalist-airy`: `btnRadiusTL…BR` = 9999, que `validateDesign` corta a 120 (L5.10, lote 5).
- `PresetCard.tsx`: `backdropFilter` com `var(--sarak-layout-gap-md,16px)` como reserva de desfoque (gap usado como blur).
- O painel (lote 5): o slider mestre agora alcança os cantos nos temas sem canto; um tema com canto escalar salvo segue "preso" até o canto ser limpo — o controle do painel não limpa o canto ao mover o mestre.

**Pendências / riscos**
- O efeito na tela dos 298 reservas só aparece **sem Provider**; com Provider a variável existe. O que muda COM Provider: `--theme-surface` (modal, dica, aba ativa, badge `soft`) passa de translúcido a `surfaceColor`; `--radius-theme` do sistema passa a ser o responsivo 8/10/12 (era sempre 12 por causa de `validation.ts`); `--bg-body-rgb`/`--bg-sidebar-rgb` passam a ser o tema (eram sempre o claro). Nada disso tem caso de navegador próprio além de `--theme-surface` e `--radius-theme`.
- Não repeti a suíte completa do `vitest` depois do último conserto do gate (decisão acima); a do `playwright` foi repetida com o código final.
- Não rodei `npm run build`, `cromo-css-real:check` nem o `build:css:scoped` com este código; o `dist/` está intacto no `git status`.

## Resumo da execução — lote 3 (componente) — 2026-10-12

**Resultado:** Concluído (lote 3), com **cinco decisões abertas para o revisor** (itens 1, 2, 3, 4 e 5 de *Decisões e suposições*).

**Estado do worktree ao iniciar**
```
(limpo)
```
(`git status --short` vazio; `HEAD` `596af0ba`, o lote 2 commitado. Nada em `specs/` foi tocado, salvo esta plan: o `status` e este bloco.)

**O que foi feito** (cada item do anexo reconferido no `HEAD` atual)
- **L3.1** `SarakButton.tsx:62-63` e `SarakIconButton.tsx:61-62`: o primário lê `--sarak-btn-primary-bg` / `--sarak-btn-primary-text` (reservas `#00f2ff`/`#000000`, o padrão dos tokens); no `borderline` o hover preenche com o par. Texto `--text-muted` sobre a primária saiu.
- **L3.2** `SarakButton.tsx:66`, `SarakIconButton.tsx:65,96,121`, `useAtomicStyles.ts:55,92`: o secundário lê `--sarak-btn-secondary-bg` em todo estilo (o `cyberpunk` segue contorno, por desenho); hover com o par primário.
- **L3.3** `_cards.css` (bloco "SOMBRA DECLARADA"): `cardShadow` declarada vira `--sarak-card-shadow-full` e a sombra do hover; `none` deixa a composta. Para o CSS distinguir os dois, `useDesignVariables.ts:173-176` passa a emitir `data-sx-*` também para token `text`. Descrição do schema (`cards.ts:473`) corrigida (dizia que `none` desativava a sombra).
- **L3.4** `SarakTableViewParts.tsx:96,133,149`: `--sarak-table-header-bg`, `--sarak-table-row-hover`, `--sarak-table-border`, `--sarak-skeleton-row-radius`.
- **L3.5** `SarakAnalyticalPage.tsx:89,108` e `SarakSpotlight.tsx:122`: `--sarak-modal-overlay-color` + `--sarak-modal-blur` (Spotlight: `--sarak-search-backdrop-blur`).
- **L3.6** `PremiumSwitch.tsx`: polegar `--sarak-switch-thumb`. **L3.7** `SarakModal.tsx:102,106,122`: `rounded-md` saiu, vale `rounded-btn`.
- **L3.8** `SarakIconButton.tsx:40,54-56`: brilho é a variável `--sarak-btn-neon-glow-color` (vale também no escopo embarcado) e o do perigo é `color-mix` da cor de erro do tema (era `rgba(239,68,68,0.5)`).
- **L3.9** Title/Action/SearchCard: etiqueta de rascunho `bg-[--color-theme-card]` + sombra `--sarak-card-glow-color` (era `bg-black/60` + ciano fixo).
- **L3.10** `MessageBubble.tsx`: etiquetas `rounded-[var(--sarak-chat-radius,12px)]`; a bolha `shadow-[var(--dynamic-shadow)]` (era `shadow-xl`).
- **L3.11** `AuthForm.tsx`: aviso/erro/fundo/ponto leem `--sarak-status-warning/error/success-color` (`color-mix`); sombra lateral usa `--sarak-card-shadow-color`; classe `border-…-border` quebrada corrigida.
- **L3.12** 15 `duration-200/300/500/700` → `duration-[var(--duration-fast|normal|slow,…)]` (`SarakSwitch`, `SarakProgress`, `SarakCheckbox`, `SarakRadio`, `ChromeSidebarBody`, `ChromeTopbarBody`, 4 cartões, `SarakActionCard`, `SarakImageCard`×2, `MessageList`) e `KanbanColumn.tsx:93` (`120ms` → `--duration-fast`).
- **L3.13** `_cards.css`: `opacity` do cartão inteiro saiu; `cardSurfaceOpacity` age só no `color-mix` do fundo, **inclusive sem tema montado** (mesma expressão, agora também em `.card`).
- **L3.14** `_cards.css` (`glow-only`): camada de brilho a opacidade 1 e halo na cor primária a 40% no hover; `SarakImageCard.tsx:42-45,98`: o brilho de `glow-only` é a primária (não o `cardGlowColor` de 5%).
- **L3.15** `SarakActionCard.tsx`: `--sarak-shadow-glow` como cor de texto → `--sarak-primary-color`.
- **L3.16** 17 cartões/contêineres da lib perderam `bg-[var(--color-theme-card,…)]` **e** `border-[var(--border-color,…)]` (a cor de borda também cedia à classe); a superfície (fundo e cor da borda, com as opacidades) mora em `_card-defaults.css` (`components.sarak-elements`), para `.sarak-card`, `.bg-theme-card` e `.card`; só o `clip-path` ficou em `_atmosphere.css`. O guarda `css-que-so-o-navegador-mede.spec.ts` ("um cartão real da lib computa a superfície de cartão") segue verde.
- **L3.17** `.bg-theme-card:active { background-color }` saiu de `_utilities.css` para `_card-defaults.css`. **L3.18** `.bg-theme-card { box-shadow }` morta saiu de `_theme.css`.
- **L3.19** `PresetCard.tsx:61`: reserva do desfoque é `var(--sarak-card-backdrop-blur, 12px)` (era o token de gap).
- **Fora da lista, necessário para o gate:** `SarakFlowEngine.tsx:22-27,46` lê `flowGridStyle` por nome (`dots`/`lines`) — só o painel lia `dots`.
- **Trava** `gates/scripts/contrato/check-token-reader.mjs`: o painel (`/features/DesignEngine/`) deixa de contar como leitor; só conta para `PANEL_OWN_TOKENS` (32 tokens, cada um com motivo), com achado `panel` para entrada obsoleta (token inexistente, já lido pela lib, ou que nem o painel lê). Limite 6 do cabeçalho (R18) reescrito; regra (iv) documentada. Já ligada ao Anel 1 e à CI.
- `docs/migracoes.md`: subseção MAJOR nova na `## 8.0.0` e o parágrafo "O que não muda" do lote 1 corrigido (dizia que a classe de fundo não vencia a superfície). `sarak-ui/docs/migracoes.md` regenerado (`guide`).

**Arquivos alterados** (57 modificados e 2 novos, fora `specs/`)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/_card-defaults.css`, `_cards.css`, `_atmosphere.css`, `_theme.css`, `_utilities.css` | alterado | superfície na camada que cede; sombra declarada; glow-only; sem opacity no cartão; mortos removidos |
| `src/components/atomic/Buttons/SarakButton.tsx`, `SarakIconButton.tsx`, `hooks/useAtomicStyles.ts` | alterado | tokens do botão |
| `src/components/**` (cartões, tabela, sobreposição, switch, modal, chat, AuthForm, durações, FlowEngine) | alterado | valores fixos → token |
| `src/core/Design/hooks/useDesignVariables.ts`, `schema/cards.ts` | alterado | atributo para token `text`; descrição do `cardShadow` |
| `src/features/DesignEngine/Canvas/components/PresetCard.tsx` | alterado | reserva do desfoque |
| `gates/scripts/contrato/check-token-reader.mjs` + `__tests__/check-token-reader.test.mjs` | alterado | regra (iv), `PANEL_OWN_TOKENS`, 8 casos novos |
| `src/components/atomic/__tests__/componenteQueLeOToken.test.tsx` | criado | 19 casos (classe/estilo e texto dos fontes) |
| `src/core/Design/hooks/__tests__/useDesignVariablesDonoUnico.test.ts`, `src/styles/__tests__/cartaoQueCedeAClasse.test.ts`, `atmosferaEBotoesQueDesenham.test.ts` | alterado | atributo `text`; textos dos parciais no novo lugar |
| 9 `*.snap` (ActionCard, SearchCard, TitleCard, Chart, CoreCard, PreviewCanvas, PresetsCatalog, ThemeSidebarContent, EngineCustomizationTab) | alterado | regravados; o diff é só classe/atributo/reserva acima |
| `browser-tests/componente-le-o-token.spec.ts` | criado | 16 casos, com contraprova |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | cena `componente` e 7 recortes `componente-*` |
| `docs/migracoes.md`, `sarak-ui/docs/migracoes.md` | alterado | nota MAJOR (e cópia do kit) |

**Verificações executadas**
- `npx vitest run` (suíte completa, depois do último conserto de código) → **467 arquivos, 3080 testes, todos verdes**.
- `npx tsc --noEmit` → 0 (um erro TS2709 meu em `SarakFlowEngine.tsx` foi corrigido; repetido, 0). `check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-10-12 — nenhuma regressão".
- Anel 1, na ordem do hook, `guide:check` por último: dev-kit, barril, catálogo, zero-marca, deep-import, gate-limits, container-query (2), persistence-doc, class-merge, icon-port, chrome-token-parity, token-reader, css-important, trail-citation, token-types, variable-contract, migration-anchor, guide → **19 de 19 com exit 0** (`dev-kit` e `guide` regenerados antes).
- Anel 0 simulado (`config.json` do hook sobre as linhas adicionadas do `git diff HEAD` e os 2 arquivos novos de fora de `specs/`) → 1088 linhas, **0 achados**.
- **Navegador, fora do repositório, sem tocar `dist/`** (o `npm run build` reescreveria os arquivos rastreados de `dist/`): worktree copiado para `%TEMP%` (`tsup` + `@tailwindcss/cli` + `build-scoped-css` + `copy-base-css` + `inject-css`, sem `--dts` nem os `*:check`, junção para `node_modules`), removido ao fim. Suíte inteira do `playwright`: **215 de 215** (199 anteriores + 16 novos). O `componente-le-o-token.spec.ts` sobre o build do **`HEAD`** (`git archive` + o spec e o harness novos): **13 falham, 3 passam** — os 3 são contraprovas (cardShadow sem declaração, superfície sem classe, secundário neon, que já lia o token). **Isto não substitui o `npm run build` + `cromo-css-real:check` do revisor.**
- **A trava contra o `HEAD`:** o gate novo sobre `git archive HEAD src` → exit 1 com `btnPrimaryBg`, `btnPrimaryText`, `cardShadow`, `tableRowHoverBg` e `flowGridStyle = "dots"`; no worktree, exit 0. **Mutação:** cópia de `src/` com `--sarak-btn-primary-bg` trocado por `--sarak-primary-color` nos componentes (o painel ainda o lê) → exit 1 acusando `btnPrimaryBg`.

**Critérios de aceite**
- [x] Lote 3: L3.1–L3.15 obedecem ao token — evidência: spec do navegador (16) e `componenteQueLeOToken.test.tsx` (19).
- [x] L3.16–L3.19 — evidência: guarda `css-que-so-o-navegador-mede` verde; `cartaoQueCedeAClasse.test.ts`; `bg-*`/`hover:bg-*` por classe vencem (casos 7 e 9 do spec).
- [x] O painel não conta como leitor — evidência: gate no `HEAD` (exit 1) e mutação.
- [x] Casos de `browser-tests/` com contraprova do padrão — acima.
- [x] Suíte completa, `tsc`, `audit:baseline`, Anel 1, Anel 0 — acima.
- [x] Nota MAJOR do lote em `## 8.0.0`.

**Decisões e suposições**
1. **`data-sx-*` passa a ser emitido para token `text`** (6 tokens: `cardShadow`, `inputShadow`, `sidebarShadow`, `motionEaseMain/Out/In`), não só `cardShadow`. Era o jeito de o CSS distinguir "declarada" de `none` sem comparar valor; custa 6 atributos novos no `html`/`body`. Alternativa mais estreita: derivar só um atributo para `cardShadow` no hook. Se preferir, troco.
2. **`PANEL_OWN_TOKENS` é declaração humana, não dedução** (o gate não sabe "tem componente na lib"). 32 entradas: geometria da pré-visualização (`preset*`, `device*`, `designEngine*`, `layoutPreviewMaxH`), `cardHoverLift`, `controlHeightToggle`, `progressBarMaxWidth`, e **quatro que são pendência de produto, não do painel**: `securityShieldGlow`/`securityPulseSpeed` (o schema já declara "sem componente consumidor") e `trackingSubtle`/`typeScaleDisplay` (escala sem variante de componente que a use — dar leitura exigiria variante nova no `SarakTypography`, API pública). O revisor decide se vira plan.
3. **O padrão visual muda em quatro pontos, todos na nota MAJOR:** texto do primário passa de `#94a3b8` a `#000000` (o esperado); o secundário passa da cor do cartão a 5% de branco (valor do `btnSecondaryBg`); o texto do cartão deixa de sair a 80% de opacidade; o véu do `AnalyticalPage`/`Spotlight` passa de 50% a 40% de preto. Mais as durações de 500/700 ms → 0,6 s e o Kanban 0,12 → 0,2 s.
4. **Tirei também `border-[var(--border-color)]` dos cartões da lib, não só o fundo** — com a superfície na camada que cede, a classe de cor de borda venceria `cardBorderColor`/`cardBorderOpacity`. O `.card` ganhou o fundo/borda do tema também fora de escopo (antes só sob `.sarak-design-scope`/textura), para tirar a classe sem deixar `.card` sem fundo sem Provider.
5. **Sem token novo.** A sombra da bolha do chat não tem token: usa `--dynamic-shadow` (sombra do tema, a mesma de `SarakSearch`). A cor do halo de `glow-only` é a primária a 40%, não `cardGlowColor` (padrão com alfa 0,05, invisível).
6. Durações de `framer-motion` (JavaScript) ficaram fixas — L3.12 lista classes `duration-*`; ver *Achados*.
7. L3.8 reconferido: a leitura do `design.btnNeonGlowColor` já existia; o "fixo" era a reserva literal e o vermelho do perigo — ambos corrigidos.
8. Os 9 snapshots foram regravados com `-u` depois de conferir o diff (só classe, atributo `data-sx-*` e reserva de desfoque).
9. `.sarak-card:hover { border-color }` (`_cards.css`, camada final) continua vencendo `hover:border-*`: o pedido do lote 3 era o fundo; não toquei.

**Achados fora do escopo (não corrigidos)**
- `SarakCatalogGrid.tsx:148` — `hover:border-[var(--border-color,#334155)]-primary/30` é classe quebrada (resíduo de substituição), não gera CSS.
- `PremiumSwitch.tsx:9` — `shadow-[0_0_10px_rgba(var(--sarak-primary-color,#00f2ff),0.3)]` é inválido (`rgba(var(#hex))`): o brilho do alternador ligado não aparece.
- `framer-motion` com `duration` literal: `SarakExpandableCard.tsx:88`, `SarakExpandableMatrix.tsx:185`, `SarakPageTransition.tsx:63`, `SarakImageCard.tsx:61`, `AuthForm.tsx:79`, `AuthHero.tsx:34,48`, `SarakTooltip.tsx:185`, `MessageList.tsx:47-49`.
- `SarakStats.tsx:105` — `hover:bg-white/[0.04]` agora aparece (e some no claro: L4). `MessageBubble.tsx:37-39` — estilo `solid` pinta o texto na mesma cor do fundo (L4).
- `SarakIconButton.tsx` frosted — bordas `rgba(255,255,255,0.1)` e sombra preta fixas (L4).
- `cardHoverLift` e `cardHoverTranslate` são tokens que fazem a mesma coisa (o primeiro só no "kitchen sink").

**Pendências / riscos**
- Não rodei `npm run build` nem `cromo-css-real:check` por inteiro (acima); `dist/` está intacto no `git status`.
- Consumidor que escrevia `bg-*`/`hover:bg-*` num cartão e via a superfície do tema vencer passa a ver a própria classe (nota MAJOR); não abri o ERP.
- O `DesignEngine` mostra a primária com o par `btnPrimaryBg`/`btnPrimaryText` — agora igual ao componente; temas com `btnPrimaryBg: transparent` (golden-hour, blueprint-protocol, cyberpunk-neon) passam a ter o botão primário transparente de fato. Contraste desses pares é do lote 4.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-12 — lote 1 — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK; `playwright test` sobre esse `dist/`: **190/190**, com os 11 casos de `cascata-que-cede.spec.ts`; suíte completa 464/464 arquivos, 3017/3017 testes; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK, com o `css-important:check` novo; a trava contra o CSS do `HEAD` (extraído por `git archive`, `--styles-dir`) acusa `_atmosphere.css` e `_cards.css` e sai com erro; no worktree, OK. `_card-defaults.css` não tem `!important` (as 4 ocorrências da palavra são comentário); os dois `!important` que restam em `_atmosphere.css` são do fundo de mídia, sob atributo com valor. Varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0.

**Decisão 1 do executor (a superfície do tema segue na camada final, sem `!important`) — aceita para este lote.** O guarda `css-que-so-o-navegador-mede.spec.ts` ("um cartão real da lib computa a superfície de cartão") é contrato vigente, e os cartões da lib repetem `bg-[var(--color-theme-card,…)]`, que apagaria `cardSurfaceOpacity`. O caminho que cumpre as duas metades do pedido passa a ser do **lote 3**: tirar dos cartões da lib a classe de fundo redundante (a superfície vem do tema, de um lugar só) e então rebaixar a superfície para a camada que cede, para que `bg-*`/`hover:bg-*` do componente e do consumidor vençam. Entram no lote 3, junto: `_utilities.css:33` (`.bg-theme-card:active` na camada final vence `active:bg-*`) e `_theme.css:100-102` (sombra de `.bg-theme-card` sempre vencida). O anexo ganha esses itens em L3.

**Próximo:** lote 2 (variável), depois do commit deste lote.

## Veredito — 2026-10-12 — lote 2 — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK; `playwright test` sobre esse `dist/`: **199/199**, com os 9 casos de `variavel-com-dono.spec.ts` (modos App e Embarcado); suíte completa 466/466 arquivos, 3046/3046 testes (repetida pelo revisor depois do último conserto do executor); `tsc` 0; `audit:baseline --with-tsc` igual ao baseline — o baseline regravado só **apertou** (`auditor_ghostvars` 1 → 0; campo novo `contraparteFaltando` em 0), nada afrouxou; Anel 1 inteiro OK, com o `variable-contract:check` novo; varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0. **Mutação feita pelo revisor** (cópia de `src/` fora do repo, `buildReport`): uma reserva azul e um nome sem dono plantados → 1 e 1 acusados; contra o `src` do `HEAD` anterior → 298 reservas e 15 nomes sem dono.

**Decisões do executor:**
1. Canto é exceção quando difere do padrão do schema — **aceita**; o limite (tema que quer o canto igual ao padrão com mestre diferente não o expressa) vai declarado na síntese.
2. Gate novo em vez de estender o `auditor_ghostvars` — **aceita** (o gate modela a emissão do hook; os limites do auditor estão declarados em `01-gates-e-baseline` §4.3).
3. O anexo L2.2 listava nomes que são emitidos como variantes cromáticas — **correção aceita**; o erro era do anexo.
4. e 5. Reserva de token responsivo = `mob`; reserva interpolada de prop não julgada — **aceitas**.
6. Reserva = padrão mesmo onde o efeito sem Provider muda — **aceita como regra**: sem Provider a lib desenha o tema padrão; nenhuma exceção declarada.

**Para os lotes seguintes (entram no anexo):** `PresetCard.tsx` com reserva de gap no desfoque (L3.19); o slider mestre do painel não limpa o canto declarado de um tema salvo (L5.11).

**Próximo:** lote 3 (componente), depois do commit deste lote.

## Veredito — 2026-10-12 — lote 3 — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK; `playwright test` sobre esse `dist/`: **215/215**, com os 16 casos de `componente-le-o-token.spec.ts` e o guarda "um cartão real da lib computa a superfície de cartão" verde; suíte completa 467/467 arquivos, 3080/3080 testes; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK; varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0. Conferido no código o botão primário (`SarakButton.tsx:60-63`): o par `btnPrimaryBg`/`btnPrimaryText`; nos três temas com `btnPrimaryBg: transparent` o estilo é contorno (`borderline`/`cyberpunk`), com o texto do tema — legível; o contraste desses pares é do lote 4.

**Decisões do executor:**
1. Atributo `data-sx-*` também para token `text` — **aceita** (6 atributos; mesma convenção dos demais tipos).
2. `PANEL_OWN_TOKENS` (32, declaração humana com motivo) — **aceita como mecanismo**, mas as quatro entradas que são pendência de produto não ficam na lista: `securityShieldGlow`, `securityPulseSpeed` (sem componente consumidor), `trackingSubtle`, `typeScaleDisplay` (sem variante que os use) e o par `cardHoverLift` × `cardHoverTranslate` entram no **lote 5** com a regra da `plan-113`: componente existe → leitor; não existe → sai do schema; duplicata → funde.
3. e 4. Mudanças de padrão declaradas na nota MAJOR; fundo **e** cor de borda fora dos cartões — **aceitas**.
5. Sem token novo (sombra da bolha = `--dynamic-shadow`; halo de `glow-only` = primária a 40%) — **aceita**.
9. `.sarak-card:hover { border-color }` na camada final vence `hover:border-*` — mesma classe de L3.16: entra no **lote 4**.

**Achados do executor roteados** (anexo, "herdado do veredito do lote 3"): lote 4 — `SarakStats.tsx:105` (hover branco que agora aparece), `MessageBubble.tsx:37-39` (estilo `solid` com texto da cor do fundo), `SarakIconButton` `frosted` (borda e sombra fixas), hover de borda do cartão, `SarakCatalogGrid.tsx:148` (classe quebrada), `PremiumSwitch.tsx:9` (sombra inválida), durações literais de `framer-motion`; lote 5 — os itens da decisão 2.

**Próximo:** lote 4 (modo claro e contraste), depois do commit deste lote.
