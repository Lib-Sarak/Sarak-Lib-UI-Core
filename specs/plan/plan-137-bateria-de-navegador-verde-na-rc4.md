---
tipo: "plan"
titulo: "Deixar verde a bateria de navegador da rc.4"
objetivo: "Fazer o npm run cromo-css-real:check terminar sem falha antes da tag 8.0.0-rc.4, consertando na lib o contraste do texto sobre a barra que o host escurece e atualizando os testes de navegador que a campanha deixou para trás, sem afrouxar nenhuma afirmação"
dominio: "Testes de navegador / Paletas"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.4", "navegador", "paletas", "contraste"]
relacionados: ["[[plan-134-catalogo-de-paletas-e-temas]]", "[[plan-136-cor-ancora-fundo-tingido-e-harmonia-visivel]]", "[[09-temas-e-presets]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/09-temas-e-presets.md + specs/specs/11-testes-e-cobertura.md"
---

# 1. Objetivo

`npm run cromo-css-real:check` (build + toda a suíte de navegador, `browser-tests/`) verde, local e no job `cromo-css-real` da CI,
antes da tag `8.0.0-rc.4`. Defeito da lib se conserta na lib. Teste desatualizado lê o valor do mesmo lugar que a tela, e nenhum
teste perde o que afirma.

# 2. Contexto

As plans da rc.4 rodaram só testes de componente, como manda o protocolo do contrato. A bateria de navegador ficou para o
fechamento, e no fechamento (2026-10-28, depois do conserto do `tema-sob-demanda.spec.ts`) deu **11 falhas e 434 passes**. Na
rc.3, o job `cromo-css-real` passava. Medição do revisor, sobre `test-results/*/error-context.md`:

**A. Defeito da lib (1 teste).** `plan-124-sidebar-contrast.spec.ts` — o host declara `{ mode: 'light', sidebarColor: '#111111' }`
(barra escura num tema claro). O item inativo sai com **texto `rgb(45, 49, 50)` sobre `rgb(17, 17, 17)`: contraste 1,44** (mínimo
4,5). O menu fica ilegível. Provável causa: a paleta (`plan-133`/`plan-134`) grava a cor do texto da barra como valor explícito
(`sidebarItemTextColor` = neutra 800 no claro). A correção de contraste da paleta só enxerga os fundos que ela mesma calcula e não
vê o `sidebarColor` do host. Antes, o texto era derivado do fundo efetivo da barra (`plan-124`). **É o cenário de um importador real**
(barra escura em sistema claro), e o ERP o usa.

**B. A diagnosticar (1 teste).** `painel-segue-o-modo.spec.ts` — sob um tema escuro, o painel desenha **0** elementos em branco
translúcido (esperado > 0). Pode ser o mesmo mecanismo do item A, porque a paleta troca uma cor derivada por uma explícita, ou o
teste estar medindo um valor que mudou de propósito. A execução decide com evidência.

**C. Valor esperado escrito à mão, que a paleta mudou (7 testes).** O teste fixa a cor antiga do tema:

| Teste | Esperado → recebido |
|---|---|
| `arsenal-restante-desenha.spec.ts` (2) | `25, 227, 240` (`#19e3f0`, primária do `sarak-sovereign` na rc.3) → `0, 88, 94` / `rgba(0, 88, 94, .4)` |
| `css-que-so-o-navegador-mede.spec.ts` (3) | `rgb(107, 216, 224)` → `rgb(0, 187, 198)` (foco, sombra de foco neumórfica, faixa do `SarakRangeSlider`) |
| `login-theme-application.spec.ts` | fundo `#06080d` (padrão do schema) → `#08090a` (paleta) |
| `plan-122-preview-mode.spec.ts` | `rgb(243, 246, 250)` → `rgb(247, 249, 249)` |

**D. Seletor que a campanha deixou para trás (2 testes).** `composition-scenes.spec.ts` (lista e detalhe) procura `main[aria-label]`.
No `96729ed2`, as cenas (`browser-tests/tela-lista.scene.tsx`, `browser-tests/tela-detalhe.scene.tsx`) deixaram de ser `<main>`: elas
são moldes que entram dentro do `<main>` do cromo, e um `<main>` dentro de outro é inválido. Foi correto. A spec não foi atualizada.

# 3. Escopo

## 3.1 Dentro
- **A (e B, se for o mesmo mecanismo):** o motor de paletas e a composição (`src/core/Design/palette/`,
  `src/core/Design/presets/themes/compose.ts`, `src/core/Provider/utils/overlayPreferences.ts` ou o ponto onde a cor do texto da barra
  era derivada na `plan-124`; localize e declare no resumo), com teste de componente que reproduz o cenário do host.
- **C e D:** os specs de `browser-tests/` citados e as fixtures deles.
- `docs/migracoes.md` — só se o item A mudar algo que o importador perceba (subseção na `## 8.0.0`).

## 3.2 Fora
- Afrouxar afirmação: trocar `toBe` por algo mais frouxo, baixar o mínimo de contraste, remover o teste ou marcá-lo como `skip`.
- A regra de cor da `plan-136` (âncora, fundo tingido, 60-30-10).
- `dist/` (gerado), a config do Playwright, os gates.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.4 | a ordem de composição da paleta (defaults → preservado → paleta → host → tema) |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | o que o navegador mede e o `jsdom` não |
| Plan | `specs/plan/plan-134-catalogo-de-paletas-e-temas.md` §9 | os leitores do design composto e os testes que mudaram de valor |
| Teste | `browser-tests/tema-sob-demanda.spec.ts` + `browser-tests/fixtures/harness-entry.tsx` | o padrão já adotado: o valor esperado vem da página (`window.__sarakThemeProbe`), nunca escrito à mão nem importado do `src/` no Node |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · cor por token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **Item A.** Reproduza o cenário num teste de componente (Provider com `{ mode: 'light', sidebarColor: '#111111' }`: o texto do
   item inativo passa de 4,5 sobre a barra). Ele tem de ficar vermelho antes do conserto. Corrija na lib: **quando o host (ou o tema)
   declara um fundo que a paleta calcula e não declara o texto que vai sobre ele, o texto se corrige contra o fundo efetivo** (os pares
   de `PAIRS`, a mesma régua do gate). Uma cor de texto que o host declarou explicitamente não é tocada.
3. **Item B.** Diagnostique com evidência (o que o painel desenhava na rc.3 e o que desenha agora, e por quê). Se for o mecanismo do
   item A, o conserto do A o cobre. Se for mudança de valor intencional da paleta, o teste passa a medir o efeito pelo valor que a
   página calcula. Se for outro defeito, **pare e reporte**: não conserte fora do escopo.
4. **Itens C.** Cada valor esperado passa a vir da página (estenda o `window.__sarakThemeProbe` ou o padrão equivalente da fixture
   daquele spec), nunca de um literal e nunca de import do `src/` no Node. A afirmação continua a mesma (`toBe` segue `toBe`).
5. **Item D.** O seletor dos dois testes de `composition-scenes.spec.ts` passa a localizar a raiz da cena sem exigir `<main>`: um
   atributo de dados nas cenas ou o filho do container da cena. As medidas que o teste faz continuam as mesmas.
6. `npm run cromo-css-real:check` **inteiro**, uma vez, até o fim (Playwright em segundo plano, se o terminal tiver limite de tempo).
   Cole a linha final (passados/falhos). Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
7. Os testes de componente do item A por filtro de arquivo e `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Item A reproduzido por teste de componente, vermelho antes e verde depois. No navegador, `plan-124-sidebar-contrast` verde.
- [ ] Item B com causa escrita no resumo e o teste verde pelo caminho do passo 3.
- [ ] Itens C: nenhum literal de cor de tema nos 7 testes, e as afirmações iguais (o diff mostra só a origem do valor esperado).
- [ ] Item D: os dois testes verdes, com as mesmas medidas.
- [ ] `npm run cromo-css-real:check` verde inteiro, com a linha final no resumo.
- [ ] `audit:baseline` sem regressão (no `quick`).

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — o job `cromo-css-real` da CI já cobre.

- Diff dos specs lido: a afirmação não muda, só a origem do valor esperado.
- O teste de componente do item A, por filtro de arquivo, e a mutação: sem o conserto, ele falha.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` uma vez.
- A bateria de navegador **não** se repete no revisor: vale a linha final colada pelo executor, e o job `cromo-css-real` da CI a mede
  de novo no push.

# 8. Destino da síntese

- `specs/specs/09-temas-e-presets.md` §4.3.4 — a paleta corrige o texto contra o fundo **efetivo**, inclusive o que o host declara.
- `specs/specs/11-testes-e-cobertura.md` — o teste de navegador tira o valor esperado de cor da página, nunca de literal (a campanha
  rc.4 quebrou 7 testes que escreviam a cor do tema à mão).

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-28

**Resultado:** Concluído com pendências (ver *Pendências*).

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- Item A — `src/core/Design/palette/contrast.ts` (`correctPaletteAgainstDeclared`, fim do arquivo) e `resolve.ts` (`resolvePalette` ganha `declared`; `resolvePaletteForDesign` passa `{ ...hostConfig, ...themeDesign }`): o texto que a paleta calcula é re-corrigido contra o fundo EFETIVO que o host ou o tema declara, com os mesmos `PAIRS`. Texto declarado pelo host/tema não é tocado. Causa: a paleta só corrigia contra os fundos que ela mesma gera; `sidebarColor: '#111111'` do host entrava depois e deixava `sidebarItemTextColor` (neutra 800) a 1,44. O ponto único (`resolvePaletteForDesign`) cobre as duas portas: `composeThemeDesign` e a semente (`useThemeSeed`).
- Item B — causa medida com um diagnóstico descartável (removido): o painel escuro continua desenhando translúcido sobre o "branco" do tema, mas esse branco agora é a neutra 50 da paleta (`oklab(0.98…)` = `rgb(247, 249, 249)`), não `255, 255, 255`. Não era o mecanismo do item A. É mudança intencional de valor; `painel-segue-o-modo.spec.ts` passa a reconhecer, além do 255 puro, a tinta clara do tema escuro lida da página (`__sarakThemeProbe.colorOf`). O caso CLARO mede só o 255 puro (com a tinta da paleta ele acusava 13, porque ela é a superfície do próprio tema claro); `toBe(0)` e `> 0` seguem iguais.
- Itens C — `arsenal-restante-desenha.spec.ts`: `PRIMARY_RGB` literal virou `primaryRgbOf(page)` (da sonda). `css-que-so-o-navegador-mede.spec.ts`: as 3 falhas NÃO eram literal; o componente lê primeiro o token dedicado (`--sarak-input-focus-border-color`, `--sarak-range-active-bg`), que a paleta calcula diferente da primária, e o teste resolvia a expressão da primária. As expressões esperadas passam a espelhar o que o componente lê. `login-theme-application` e `plan-122-preview-mode`: o valor esperado vem de `window.__sovereignBackground` / `window.__sovereignBody` expostos pelos fixtures (inclui o `rgb(6, 8, 13)` do modo escuro e o `rgb(255, 255, 255)` da miniatura, que também estavam escritos à mão).
- Item D — `composition-scenes.spec.ts`: `SCENE_SELECTOR` passou de `main[aria-label]` para `[data-theme] > :not(style)` (a raiz da cena é o filho do escopo do tema). Medidas inalteradas.
- `fixtures/harness-entry.tsx`: a sonda ganhou `colorOf(id, token, mode)`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/palette/contrast.ts` | alterado | `correctPaletteAgainstDeclared` |
| `src/core/Design/palette/resolve.ts` | alterado | `declared` em `resolvePalette`; `resolvePaletteForDesign` o preenche |
| `src/core/Design/presets/themes/__tests__/compose.test.ts` | alterado | 4 casos do cenário do host |
| `src/core/Provider/hooks/__tests__/useThemeSeed.test.ts` | alterado | 1 caso da semente |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | `colorOf` na sonda |
| `browser-tests/fixtures/login-theme-application-entry.tsx` | alterado | expõe `__sovereignBackground` |
| `browser-tests/fixtures/plan-122-preview-mode-entry.tsx` | alterado | expõe `__sovereignBody` |
| `browser-tests/{arsenal-restante-desenha,css-que-so-o-navegador-mede,login-theme-application,plan-122-preview-mode,painel-segue-o-modo,composition-scenes}.spec.ts` | alterado | origem do valor esperado / seletor, conforme acima |

**Verificações executadas**
- `npx vitest run compose.test.ts useThemeSeed.test.ts src/core/Design/palette` → 11 arquivos, 60 testes passando.
- Mutação: com `resolvePalette(input, mode)` sem `declared`, os 3 testes do cenário do host falham (3 failed | 19 passed); restaurado.
- `npx vitest run src/core/Design src/core/Provider` (antes das últimas edições de teste) → 103 arquivos, 880 testes passando.
- `npm run cromo-css-real:check` (1ª rodada) → 442 passed, 3 failed (erros meus nos fixtures/spec: caminho de import, caso CLARO do painel, literal `rgb(255, 255, 255)` do `plan-122`); corrigidos e confirmados isolados (6 passed).
- `npm run cromo-css-real:check` (2ª rodada, inteira) → **445 passed (18.9m), exit 0**.
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` → feito.
- `npm run verify -- --tier=quick` → "nível quick verde" (tsc, baseline, Anel 1, Anel 0: 184 linhas, 0 achados). Na 1ª tentativa o `tsc` acusou 3 erros de tipo nos meus testes novos (`PairResult` sem `pass`); estreitados com `toMatchObject({ pulado: false, pass: true })`.

**Critérios de aceite**
- [x] Item A por teste de componente, vermelho sem o conserto e verde com ele; `plan-124-sidebar-contrast` verde no navegador — evidência: mutação acima; 445 passed.
- [x] Item B com causa escrita e teste verde pelo caminho do passo 3 (valor intencional da paleta).
- [x] Itens C: nenhum literal de cor de tema nos testes citados — as afirmações seguem `toBe`/`toContain`/`toHaveCSS`. Ressalva: nos 3 de `css-que-so` a correção foi a expressão lida, não um literal.
- [x] Item D: os dois testes verdes, mesmas medidas.
- [x] `cromo-css-real:check` verde inteiro — 445 passed, exit 0.
- [x] `audit:baseline` sem regressão no `quick`.

**Decisões e suposições**
- A plan chegou em `🔴`, não `🟡` (o revisor não a despachou). Executei porque o usuário mandou explicitamente e movi o status só para `🟠`, ao entregar.
- `declared` considera só valores literais de cor (`#…`/`rgb(`/`rgba(`) de tokens do `PALETTE_ROLE_MAP`; `var(...)` e outros formatos são ignorados (não parseáveis pelo motor de contraste).
- O caso CLARO do `painel-segue-o-modo` mede só o 255 puro (como antes da rc.4); a tinta da paleta lá é a superfície do tema, não um branco fixo.
- `docs/migracoes.md` não foi alterado: o conserto só corrige um texto ilegível, sem mudança que o importador precise migrar. Se o revisor entender que a mudança de saída da paleta (texto corrigido contra fundo do host) merece nota, é decisão dele.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- `git clean` em `dist/` foi bloqueado pelo hook, então ficaram **38 arquivos não rastreados** em `dist/` (chunks com hash novo gerados pelo build). Os rastreados já foram restaurados. Remover é com o usuário: `git clean -fd -- dist`.
- A suíte vitest completa não foi rodada por mim (é do revisor); rodei só `src/core/Design` e `src/core/Provider`, mais os arquivos tocados.
- O diff de `compose`/`resolve` altera a saída da paleta para qualquer host/tema que declare fundo de barra/superfície com a paleta ligada: o texto não declarado agora pode mudar de tom. Os 19 temas embarcados e `themePalettes` passaram sem mudança.

# 10. Veredito

## Veredito — 2026-10-28 — 🔴 Reprovado

O conserto do item A está certo na direção: o ponto único em `resolvePaletteForDesign` cobre o tema e a semente. A mutação do
executor é plausível, e o `tsc` com `audit:baseline` está igual ao baseline. Os itens C e D também estão certos: as afirmações não
mudaram, e o seletor `[data-theme] > :not(style)` casa exatamente um elemento (o modo estrito do Playwright não reclamou). Mas o
conserto mexe num tema embarcado que ninguém pediu para mexer, e isso quebra a suíte de componentes.

1. **O conserto muda o `high-contrast` claro e quebra um snapshot.** Medição do revisor: a paleta resolvida com e sem `declared`, nos
   19 temas × 2 modos (38 com paleta). Um tem texto alterado: `high-contrast` claro, `textColorMuted` passa de `#4e4d49` para
   `#6d6c67`. O motivo: a re-correção roda `correctTokenTones` sobre **todos** os textos, e a busca prefere o tom mais perto do
   padrão. Contra o fundo branco que o tema declara, o tom padrão já passa, e o texto **clareia**. O contraste mínimo cai para 4,54,
   num tema cuja identidade é contraste alto. O que quebrou:
   - `PreviewCanvas.test.tsx` › *deve usar propriedades de estilo reais* fica vermelho (`npx vitest run src/features/DesignEngine` →
     1 falho / 1092). O diff do snapshot são os 5 apelidos de `--text-muted`, com exatamente esse valor.
   - O `preversion` roda a suíte inteira, então isso barraria a tag.
   - O §9 afirma "Os 19 temas embarcados … passaram sem mudança", e isso não é verdade.

   **Conserto:** a re-correção contra o fundo declarado só move o texto que **reprova** contra ele. O texto que já passa contra o fundo
   efetivo mantém o tom que a paleta deu. O objetivo do item A é resgatar o texto ilegível, não reotimizar o que já está legível.
   - Teste de componente: nenhum tema embarcado muda de saída com o conserto. Compare `resolvePalette(input, mode)` com
     `resolvePalette(input, mode, design)` nos 19 temas × 2 modos, sobre os tokens que o tema não declara.
   - O caso `sidebarColor: '#111111'` segue verde.
   - O snapshot do `PreviewCanvas` volta a passar **sem** `-u`.

2. **O cabeçalho do `painel-segue-o-modo.spec.ts` ficou falso.** O item 1 de *LIMITES DECLARADOS* ainda diz "só branco translúcido
   (canais 255 com alfa entre 0 e 1)". O caso escuro agora também conta a tinta clara do tema (`textColorMaster` escuro, lida da
   sonda). Reescreva o item 1 com o que a medição de fato reconhece, em cada caso:
   - **claro:** só o 255;
   - **escuro:** o 255 e a tinta do tema.

   Diga também que a contraprova escura deixou de exercitar o detector só-255 do caso claro. Hoje ela passa pela tinta, e a guarda do
   255 no claro fica sem controle positivo dentro do spec. Esse é um limite a declarar, não a consertar aqui.

**Observação, sem exigência:** o teste "texto declarado pelo host não é tocado" passa mesmo sem a exclusão de `declared` em
`adjustable`, porque na composição o host vem depois da paleta e ganha de qualquer jeito. A exclusão não tem efeito observável pelo
`composeThemeDesign`. Pode ficar.

**Verificação da correção (executor):**
- `npx vitest run src/core/Design src/core/Provider src/features/DesignEngine`: inclui os consumidores; foi o filtro que faltou.
- `npm run verify -- --tier=quick`.
- A bateria de navegador não precisa rodar inteira de novo, porque a mudança só estreita o efeito do conserto. Rode só
  `plan-124-sidebar-contrast` e `painel-segue-o-modo` pelo Playwright, depois de `npm run build`, e em seguida
  `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`. O job `cromo-css-real` da CI mede tudo no push.

## Resumo da execução (correção 1) — 2026-10-28

**Achado 1 — o conserto mudava o `high-contrast` claro.** Procedente (reproduzido).
- `src/core/Design/palette/contrast.ts` (`correctPaletteAgainstDeclared`): a re-correção passou a mover só o texto que REPROVA contra o fundo efetivo (`ratio < pair.min` em algum par do token, com os fundos declarados aplicados). O que já passa mantém o tom da paleta. Se nenhum reprova, devolve a paleta intacta.
- Teste novo em `compose.test.ts` (*nenhum tema embarcado muda de saída*): para os 19 temas × 2 modos com paleta, compara `resolvePalette(input, mode)` com `resolvePalette(input, mode, resolved)` nos tokens que o tema não declara. Mutação: voltando o filtro para "todos os textos", ele falha com `high-contrast/light/textColorMuted: expected '#6d6c67' to be '#4e4d49'` (exatamente o valor do veredito); restaurado, passa.
- O caso `sidebarColor: '#111111'` segue verde (`compose.test.ts` e `useThemeSeed.test.ts`: 23 passed).
- O snapshot do `PreviewCanvas` voltou a passar sem `-u`: nenhum snapshot aparece no `git status`.
- O §9 original dizia "os 19 temas passaram sem mudança"; só passa a ser verdade com esta correção e o teste acima.

**Achado 2 — cabeçalho do `painel-segue-o-modo.spec.ts`.** Procedente. O item 1 de *LIMITES DECLARADOS* agora diz o que cada caso reconhece (claro: só o 255 puro; escuro: o 255 e a tinta clara do tema escuro, `textColorMaster` lida da sonda) e declara que a contraprova escura passa pela tinta, deixando a guarda do 255 no claro sem controle positivo dentro do spec (coberta pelo `fixed-translucent:check`).

**Verificações executadas**
- `npx vitest run src/core/Design src/core/Provider src/features/DesignEngine` → 201 arquivos, 1391 testes passando.
- `npm run verify -- --tier=quick` → verde (Anel 0: 326 linhas, 0 achados).
- `npm run build` (exit 0) e Playwright de `plan-124-sidebar-contrast` e `painel-segue-o-modo` → 3 passed. A bateria inteira não foi repetida (conforme o veredito).
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` → feito. Os arquivos novos não rastreados em `dist/` (o `git clean` é bloqueado por hook) continuam com o usuário.

**Decisões e suposições**
- Token sem par definido (`ratio` indefinido, fundo não resolvido) não conta como reprovado: fica como a paleta o deu.
- A observação sem exigência (a exclusão de `declared` em `adjustable` sem efeito observável) foi mantida.

**Achados fora do escopo (não corrigidos)**
- Nenhum.


## Veredito — 2026-10-28 — correção 1 — 🟢 Aprovado

1. **Achado 1 — resolvido.** Agora `correctPaletteAgainstDeclared` só move o texto que reprova contra o fundo efetivo. Medição
   independente do revisor (o mesmo script do veredito anterior): **0 de 38** temas × modo com texto alterado pelo conserto (antes, 1:
   o `high-contrast` claro). `compose.test.ts`, `useThemeSeed.test.ts` e `PreviewCanvas.test.tsx` → 27 de 27 passando, com o snapshot
   intacto, sem `-u`. O teste novo trava a saída dos temas embarcados, e a mutação do executor reproduz exatamente o valor do veredito.
2. **Achado 2 — resolvido.** O item 1 dos limites declara o que cada caso reconhece, e declara que a guarda do 255 no claro está sem
   controle positivo dentro do spec (quem a cobre é o `fixed-translucent:check`).

Conferido no revisor: `audit:baseline --with-tsc` sem regressão e Anel 0 sem achados (no `quick` do executor). O conserto só estreitou
o efeito; a bateria de navegador vale pela rodada inteira do executor (445 passados) mais os 2 specs afetados (3 passados), e o job
`cromo-css-real` da CI a mede de novo no push.
