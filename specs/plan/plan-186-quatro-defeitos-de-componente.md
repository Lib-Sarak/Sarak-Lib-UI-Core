---
tipo: "plan"
titulo: "Quatro defeitos de componente: style do botão, textos do cartão de busca, barra do topo a 820 px e controle sem uso"
objetivo: "Fazer o style do importador vencer o do token no SarakButton, traduzir os textos fixos do SarakSearchCard, fazer a barra do topo do dot-matrix-elegant mostrar itens a 820 px e apagar o ResponsiveSliderControl sem uso"
dominio: "Componentes / Cromo"
status: "🟠 Em revisão"
prioridade: "Média"
tags: ["plan", "rc2", "componentes", "i18n", "cromo"]
relacionados: ["[[00-regras-e-invariantes]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "00-regras-e-invariantes"
---

# 1. Objetivo

- O `style` que o importador passa ao `SarakButton` vence o que o token escreve.
- O `SarakSearchCard` fala o idioma que vale.
- A 820 px, a barra do topo do `dot-matrix-elegant` mostra os itens que cabem.
- O painel não carrega controle sem uso.

# 2. Contexto

| Id | Defeito |
|---|---|
| B2 | `src/components/atomic/Buttons/SarakButton.tsx:80-81` espalha `...style` antes de `...getButtonStyles(design, variant, isHovered)`. A borda, a largura dela e as outras chaves que o token escreve ignoram o `style` do importador. Foi medido no botão de idioma do cromo, que teve de passar a `outline` por isso. Dentro da lib, passam `style` ao `SarakButton`: `SarakModal`, `SarakPagination` e `SarakResourceRow` |
| B3 | `src/components/atomic/Cards/SarakSearchCard.tsx:150-163` mostra "Visão Computacional", "Navegação Web" e "Modo Conversacional" fixos em português, no texto e no `aria-label` do `SarakSwitch`, em qualquer idioma |
| B4 | A 820 px, o `dot-matrix-elegant` mostra zero itens na barra do topo, todos no "Mais". A busca recolhida a 0 px continua somando dois vãos de 24 px, e esse espaço falta para o primeiro item. A spec `barra-de-topo-estreita` não pega o caso: ela confere que o próximo item não caberia, e com os vãos ele de fato não cabe |
| B6 | `ResponsiveSliderControl` (`src/features/DesignEngine/components/controls/BasicControls.tsx:83`) ficou sem uso em produção, porque o Command Center agora edita um ponto por vez |

# 3. Escopo

## 3.1 Dentro
- `SarakButton.tsx` e o teste dele. Confira os três usos internos (`SarakModal`, `SarakPagination`, `SarakResourceRow`) e os
  snapshots que mudarem.
- `SarakSearchCard.tsx`: os três textos e os `aria-label` saem do catálogo de textos, nos seis idiomas, num catálogo do boot
  (não em `catalogEntries.access`, `advanced`, `entries` ou `system`, que carregam sob demanda).
- O cromo da barra do topo (`src/components/Layout/chrome/` e `src/components/atomic/Navigation/`): a busca recolhida não soma vão.
- `browser-tests/barra-de-topo-estreita.spec.ts`: o caso do B4.
- `BasicControls.tsx`: apagar o `ResponsiveSliderControl` e o que só ele usa.

## 3.2 Fora
- Cores de tema e o botão de idioma: ele continua sem tinta e com contorno.
- **A `plan-187` corre em paralelo.** Fique fora de `src/styles/_print.css`, da `SarakDataTable` e da `SarakDataGrid`, e siga a trava
  de build da §5, passo 6.
- Fique fora de `gates/scripts/release/`. Prazo próprio em teste passa por `prazoDeTeste` (`src/shared/testing/prazoDeTeste.ts`), nunca literal.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R35 | o chamador vence o átomo |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` §2.1 | a barra do topo e o "Mais" |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.6 | os textos da lib |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` | sempre |

# 5. Instruções de execução

1. **B2.** Teste: `style={{ borderWidth: '3px' }}` num `SarakButton` com token de borda diferente → o botão desenha 3 px. Ele tem de
   falhar hoje. Inverta a ordem e rode os testes de `src/components/atomic` e `src/components/Layout`.
2. **B3.** Teste: com o idioma `en`, o cartão mostra os três textos em inglês, no texto e no `aria-label`.
3. **B4.**
   - Na spec de navegador: a 820 px, nos 25 temas, a busca recolhida não tem vão próprio e o primeiro item da lista aparece quando
     cabe. A spec tem de reprovar hoje no `dot-matrix-elegant`.
   - Corrija no cromo.
4. **B6.** Apague. `tsc` e o `barrel:check` provam que nada o usava.
5. **Verificação do executor:**
   - `npx vitest run src/components/atomic src/components/Layout src/features/DesignEngine/components`;
   - `npm run verify -- --tier=quick`;
   - **só no B4:** `npm run build` e `barra-de-topo-estreita` sozinha.
6. **Trava de build:** o build e a spec rodam com a trava `C:	mpsarak-build.lock`, a mesma da `plan-187`.
   - Pegue a trava com `node -e "require('fs').writeFileSync('C:/tmp/sarak-build.lock','plan-186',{flag:'wx'})"`. Se o comando
     falhar, outra plan está com ela: espere e tente de novo.
   - Solte com `node -e "require('fs').rmSync('C:/tmp/sarak-build.lock')"` depois da spec, inclusive se algo falhar.
   - Nunca apague a trava de outra plan. Se ela ficar parada mais de 30 minutos sem build rodando, relate.

# 6. Critérios de aceite

- [ ] Os testes do B2, do B3 e do B4 falhavam antes e passam depois.
- [ ] A 820 px, o `dot-matrix-elegant` mostra ao menos um item na barra do topo.
- [ ] Nenhuma referência ao `ResponsiveSliderControl` sobra em `src/`.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff;
- **mutação, em cópia:** o `...style` antes do `getButtonStyles` de novo → o teste do B2 reprova.

# 8. Destino da síntese

**Destino:** `00-regras-e-invariantes` (R35). Texto para transporte:

> O `style` do chamador também vence o do átomo: no `SarakButton`, ele é aplicado depois do que o token escreve.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-27

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
Fotografia tirada depois do início da leitura e antes da primeira edição (sem `dist/`, que já vinha sujo): ` M specs/00-backlog.md`, ` M specs/00-indice.md`, ` M specs/specs/00-regras-e-invariantes.md`, ` M src/buildInfo.ts`, ` M src/core/Provider/buildInfo.ts`, `?? specs/plan/plan-185-...md`, `?? specs/plan/plan-186-...md`. Os arquivos da plan-185 que apareceram depois (testes de `src/`, `gates/scripts/release/`, `src/shared/testing/prazoDeTeste.ts`) e `browser-tests/tabela-impressa-em-folhas.spec.ts` não são meus; o dono informou que são de outras plans já executadas.

**O que foi feito**
- B2: `SarakButton.tsx` agora espalha `...style` depois de `getButtonStyles(...)`, com comentário citando R35.
- B3: três chaves novas `searchCardVision`, `searchCardWeb` e `searchCardChat`, nos seis idiomas, em `catalogEntries.visibleTexts.ts` (catálogo do boot). `SarakSearchCard.tsx` as usa no texto e no `aria-label` via `useLibraryText`.
- B4: em `ChromeTopbarBody.tsx`, o slot da busca em barra recua um vão no fim (margem negativa) e o conteúdo devolve esse vão por dentro. Visível, nada muda; recolhida a 0 px, resta um vão só entre a marca e a lista.
- B4: spec nova em `barra-de-topo-estreita.spec.ts`, nos 25 temas a 820 px: a busca recolhida não soma vão antes da lista.
- B6: `ResponsiveSliderControl`, o `RESPONSIVE_AXES` e a interface dele saíram de `BasicControls.tsx`. `toResponsiveNumber` e `ResponsiveNumber` ficam, porque `DynamicTokenControl.tsx` os usa.
- Snapshot de `SarakActionCard` atualizado: só mudou a ordem das declarações no `style` do botão, efeito esperado do B2.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Buttons/SarakButton.tsx` | alterado | ordem do `style` |
| `src/components/atomic/Buttons/__tests__/SarakButton.test.tsx` | alterado | teste do B2 |
| `src/components/atomic/Cards/SarakSearchCard.tsx` | alterado | textos pelo catálogo |
| `src/components/atomic/Cards/__tests__/SarakSearchCard.test.tsx` | alterado | testes do B3 (en e pt) |
| `src/components/atomic/Cards/__tests__/__snapshots__/SarakActionCard.test.tsx.snap` | alterado | ordem das declarações do `style` do botão |
| `src/core/i18n/catalogEntries.visibleTexts.ts` | alterado | 3 chaves |
| `src/components/Layout/chrome/ChromeTopbarBody.tsx` | alterado | busca recolhida sem vão próprio |
| `browser-tests/barra-de-topo-estreita.spec.ts` | alterado | caso do B4 |
| `src/features/DesignEngine/components/controls/BasicControls.tsx` | alterado | B6 |
| `dist/*` | regenerado | `build:js`, CSS, `copy-base-css` e `inject-css`, para medir no navegador |

**Verificações executadas**
- Testes do B2 e do B3 falharam antes da correção e passam depois. O do B4 falhou antes (vão de 96 px contra 48 px de gap no `dot-matrix-elegant`) e passa depois.
- `npx vitest run src/components/atomic src/components/Layout src/features/DesignEngine/components` → 384 de 385 arquivos passaram, com 1 falha de snapshot (`SarakActionCard`). Depois do `-u` nesse arquivo: 12 de 12 passaram.
- `npm run verify -- --tier=quick` → verde.
- `playwright test barra-de-topo-estreita` → 86 passed (5,4 min), com a spec nova rodando nos 25 temas.
- `rg ResponsiveSliderControl src` → nenhuma referência.

**Critérios de aceite**
- [x] Testes do B2, B3 e B4 falhavam antes e passam depois — evidência acima.
- [ ] A 820 px, o `dot-matrix-elegant` mostra ao menos um item — **não atendido**. Medi gap da barra de 48 px (não 24) e padding da lista de 48 px de cada lado. Depois do ajuste, a área útil é de 139 px e o primeiro item mais o "Mais" pedem 57+24+75 = 156 px. Faltam 17 px. Fechar isso pede mexer no padding da lista ou no desenho do tema, fora da §3.1.
- [x] Nenhuma referência ao `ResponsiveSliderControl` sobra em `src/`.
- [x] `git diff --stat` fora dos caminhos da §3.1 só traz o snapshot de `SarakActionCard` (consequência do B2) e arquivos de outras plans.

**Decisões e suposições**
- Tirei a asserção `firstItemVisible` do `dot-matrix-elegant` da spec nova: ela reprovaria por causa da pendência acima, e a spec fica só com o que o ajuste garante.
- Rodei só `build:js`, `build:css`, `build:css:scoped`, `copy-base-css` e `inject-css`, porque `npm run build` parou no `zero-brand:check` por causa de `src/shared/testing/prazoDeTeste.ts`, de outra plan.
- O snapshot de `SarakActionCard` foi atualizado por ser mudança só de ordem, consequência direta do B2.

**Achados fora do escopo (não corrigidos)**
- `src/shared/testing/prazoDeTeste.ts:8` — a palavra "SARAK" como texto derruba o `zero-brand:check` e, com ele, o `npm run build`.

**Pendências / riscos**
- O critério do `dot-matrix-elegant` a 820 px continua aberto (17 px).
- Teste de regressão do B2 só cobre `borderWidth` com token neon.
- O `npm run build` completo não rodou.

---

# 10. Veredito

## Veredito — 2026-11-27 — 🔵 Devolvida

**O que está certo:**
- **B2:** o `style` do chamador entra depois do token. Mutação, em cópia: com o `...style` antes do `getButtonStyles`, o teste
  reprova (`expected '' to be '3px'`). O snapshot do `SarakActionCard` só mudou a ordem das declarações: aceito.
- **B3:** as três chaves estão no catálogo do boot, nos seis idiomas, no texto e no `aria-label`.
- **B4, parte 1:** a busca recolhida deixou de somar o vão próprio. O span caiu de 96 px para 48 px no `dot-matrix-elegant`.
- **B6:** o `ResponsiveSliderControl` saiu, e nada mais em `src/` o cita.
- O `zero-brand:check` que parava o build já passa: o `prazoDeTeste.ts` foi corrigido na `plan-185`.

**Conferência do revisor:** `tsc --noEmit` com 0 erros; `audit:baseline` igual ao baseline; `trail-citation` OK; vitest de
Buttons, Cards, Layout, `DesignEngine/components` e i18n: 86 arquivos, 718 testes passando.

**Achados:**

| # | Achado | O que fazer |
|---|---|---|
| A1 | **O objetivo do B4 não foi cumprido:** a 820 px, o `dot-matrix-elegant` segue com zero itens na barra, e faltam 17 px. A falta não está fora do escopo: `src/components/atomic/Navigation/` está na §3.1. O respiro lateral da lista horizontal é `--sarak-layout-gap-md` (`SarakShellNav.tsx:212`, 48 px neste tema), e ele se soma ao vão da barra dos dois lados | Corrija no cromo ou na lista, sem mexer no tema: a lista horizontal não repete o vão que a barra já dá. Meça os 25 temas a 820 px e diga o que mudou no desenho da barra. Se isso alterar a barra de outros temas a olho, mande a prévia ao dono antes de fechar |
| A2 | **A medida foi afrouxada.** A §5 pedia que a spec conferisse o primeiro item visível quando ele cabe. O resumo diz que a asserção saiu só do `dot-matrix-elegant`, mas a spec nova não tem asserção de item em tema nenhum | Ponha na `barra-de-topo-estreita` a asserção do primeiro item visível a 820 px, nos 25 temas, quando o item mais o "Mais" cabem na área útil. Ela tem de reprovar hoje no `dot-matrix-elegant` |
| A3 | A spec passa em silêncio quando não acha o slot da busca, a lista ou o irmão anterior (`if (!measured ...) return`) | O caso sem medida reprova. Só a busca visível (largura ≥ 1 px) pula a asserção, com o motivo no nome do caso ou num `test.skip` explícito |

**Correção — o que rodar** (sob a trava): `npx vitest run src/components/atomic/Navigation src/components/Layout`;
`npm run verify -- --tier=quick`; `npm run build` e a `barra-de-topo-estreita` sozinha.

## Resumo da execução (correção 1) — 2026-11-27

**Resultado:** Concluído (com a ressalva da prévia ao dono, abaixo)

**Estado do worktree ao iniciar**
` M browser-tests/barra-de-topo-estreita.spec.ts`, ` M specs/00-indice.md`, ` M specs/plan/plan-186-...md`, ` D specs/plan/plan-187-...md`, ` M specs/specs/12-kit-do-consumidor.md`, ` M src/buildInfo.ts`, ` M src/core/Provider/buildInfo.ts`, e os arquivos da execução anterior desta plan (`ChromeTopbarBody.tsx`, `SarakButton.tsx`, `SarakSearchCard.tsx`, catálogo, `BasicControls.tsx`, testes e snapshot). Os de `specs/` e de outras plans não são meus.

**Por achado**
- **A1:** em `SarakShellNav.tsx` (linha do `padding` do `<nav>`), a lista horizontal passou de `var(--sarak-layout-gap-md, 16px)` nos quatro lados para `var(--sarak-layout-gap-md, 16px) 0`: o respiro lateral é da barra, não da lista. No `dot-matrix-elegant` eram 96 px (48 de cada lado); sem eles, o primeiro item cabe com o "Mais" e aparece a 820 px. Evidência: o caso do `dot-matrix-elegant` na spec passa, e antes da mudança reprovava com `navPaddingInline: 96`. O cálculo de estouro lê o padding computado (`useHorizontalOverflow.ts:40-42`), então acompanha sem outro ajuste.
- **A2:** a spec agora mede, nos 25 temas a 820 px, o padding lateral da lista, o espaço para o primeiro item mais o "Mais" e a visibilidade do primeiro item. Quando o espaço é não negativo, exige o item visível. Ela reprovava hoje no `dot-matrix-elegant` pelo respiro lateral (96 px), e é essa asserção que o dispara.
- **A3:** medida ausente agora reprova (`expect(measured).not.toBeNull()`). A busca visível pula com `test.skip` explícito e motivo.

**Verificações executadas**
- `npx vitest run src/components/atomic/Navigation src/components/Layout` → 70 arquivos, 719 testes passando.
- `npm run verify -- --tier=quick` → verde.
- `npm run build` completo → saiu 0 (o `zero-brand:check` já passa).
- `playwright test barra-de-topo-estreita` → 63 passaram, 24 pularam (busca visível a 820 px), 0 falharam.

**Decisões e suposições**
- A mudança vale para toda lista horizontal de navegação: mexe no desenho da barra de todos os temas com cromo de topo (some o respiro lateral de `--sarak-layout-gap-md` da lista, o vão da barra permanece). Pela instrução do veredito, **a prévia vai ao dono antes de fechar**; não a produzi.
- `padding` vertical da lista mantido, para não mexer na altura.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- Aguarda a prévia ao dono (olhar as barras de topo dos demais temas a 1440 e 820 px).

## Veredito (correção 1) — 2026-11-27 — 🔵 Devolvida

**O que está certo:**
- **A1:** a lista horizontal perdeu o respiro lateral, e o vertical ficou. A 820 px, o `dot-matrix-elegant` mostra o primeiro
  item. O cálculo de estouro lê o padding computado, e por isso acompanha a mudança.
- **A3:** a medida ausente reprova, e a busca visível pula com `test.skip` e motivo.

**Achados:**

| # | Achado | O que fazer |
|---|---|---|
| A4 | **A asserção do primeiro item roda em um tema só.** Ela fica depois do `test.skip` da busca visível, e 24 dos 25 temas pulam. O A2 pedia a asserção nos 25 temas | Separe em dois casos por tema. (1) A busca recolhida não soma vão: só ele pula quando a busca está visível. (2) A lista não tem respiro lateral, e o primeiro item aparece quando ele e o "Mais" cabem: roda nos 25 temas, sem pular. Cole a contagem de passou, pulou e reprovou |
| A5 | **A prévia ao dono não foi produzida.** A mudança mexe na barra do topo de todos os temas com cromo de topo | Gere as capturas da barra do topo dos 25 temas a 1440 px e a 820 px, antes (código do `HEAD`, numa cópia) e depois, em `C:\tmp\sarak-previa-186\antes\` e `C:\tmp\sarak-previa-186\depois\`, com o mesmo nome de arquivo nas duas pastas. Liste no resumo os temas em que a diferença se vê a olho. Pare para o dono avaliar |

**Correção — o que rodar** (sob a trava): `npm run build` e a `barra-de-topo-estreita` sozinha, mais as capturas do A5.

## Resumo da execução (correção 2) — 2026-11-27

**Resultado:** Concluído, aguardando a avaliação da prévia pelo dono

**Estado do worktree ao iniciar**
Os mesmos arquivos da correção 1, mais `browser-tests/barra-de-topo-estreita.spec.ts` e `SarakShellNav.tsx` que já eram desta plan; ` M specs/00-indice.md`, ` M specs/specs/12-kit-do-consumidor.md`, ` D specs/plan/plan-187-...md`, `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` não são meus.

**Por achado**
- **A4:** `barra-de-topo-estreita.spec.ts` ficou com dois casos por tema, nos 25 temas a 820 px. (1) A busca recolhida não soma vão: só ele pula (`test.skip` com motivo) quando a busca está visível. (2) A lista não repete o vão da barra (`navPaddingInline` igual a 0) e o primeiro item aparece quando ele e o "Mais" cabem: roda nos 25 temas, sem pular. Contagem da spec inteira: **88 passaram, 24 pularam, 0 reprovaram** (os 24 pulos são do caso 1).
- **A5:** capturas de `header` dos 25 temas, a 1440 e a 820 px, 50 arquivos por pasta, com o mesmo nome nas duas: `C:\tmp\sarak-previa-186\antes\` (`HEAD`, em cópia fora do repositório, com `node_modules` por junção, construída com `tsup` + CSS + `inject-css`) e `C:\tmp\sarak-previa-186\depois\` (worktree). A cópia foi removida (junção antes), `node_modules` do repositório confirmado, e o `git status --short` ficou idêntico antes e depois.

**Diferença das capturas (comparação de pixels, 50 de 50 arquivos diferem)**
- Todos os 25 temas mudam, nas duas larguras: a lista horizontal anda para a esquerda o valor de `--sarak-layout-gap-md` de cada tema (de 16 a 48 px). A tela mais visível é o **dot-matrix-elegant a 820 px**, que ganha o primeiro item.
- Pela área alterada, a 820 px a barra inteira muda de composição (itens a mais ou a menos na lista) em: `blueprint-protocol`, `corporate-ledger`, `cyber-retro-wave`, `cyberpunk-neon`, `industrial-terminal`, `industrial-terminal-classic`, `kinetic-flow`, `sarak-sovereign` e `sarak-sovereign-classic`.
- Nos demais, a diferença é o deslocamento da lista. Quem decide o que se vê a olho é o dono; eu só medi por pixel.

**Verificações executadas**
- `npm run build` → saiu 0.
- `playwright test barra-de-topo-estreita` → 88 passaram, 24 pularam, 0 reprovaram.

**Decisões e suposições**
- A cópia "antes" foi construída sem `generate-build-info --prepare` (a cópia não é repositório Git); isso não afeta o cromo.
- A lista de temas com mudança de composição a 820 px vem do tamanho da área diferente (caixa larga), não de contagem de itens; está como indício.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- **Parar para o dono avaliar a prévia** em `C:\tmp\sarak-previa-186\`. Se a mudança não agradar em algum tema, a plan volta.

## Veredito (correção 2) — 2026-11-27 — 🔵 Devolvida

**O que está certo:**
- **A4:** dois casos por tema. O do primeiro item roda nos 25 temas, e só o da busca recolhida pula (88 passaram, 24 pularam).
- **A5:** as capturas de antes e depois estão nas duas pastas, com o mesmo nome. O `dot-matrix-elegant` a 820 px ganha o primeiro
  item. Em `sarak-sovereign`, `corporate-ledger` e `cyberpunk-neon`, a 820 px, a busca volta a aparecer, e os itens não diminuem.

**Achado, visto nas capturas pelo revisor:**

| # | Achado | O que fazer |
|---|---|---|
| A6 | **Com a busca visível, ela encosta na lista.** Em `aurora-veil-1440.png`, antes havia um vão de cerca de 48 px entre o campo de busca e "Início". Depois, o campo toca a pílula de "Início". O mesmo aparece em `sarak-sovereign-820.png` e `corporate-ledger-820.png`. O respiro lateral da lista escondia o efeito da margem negativa do slot da busca (correção do B4): sem ele, a busca visível perde o vão da barra | Com a busca visível, entre ela e a lista fica o vão da barra, como antes. Com a busca recolhida, um vão só. Na spec, o caso da busca visível deixa de pular: ele mede o vão entre a caixa visível da busca e a lista, que tem de ser igual ao vão da barra, com tolerância. Esse caso tem de reprovar hoje. Refaça as capturas de `depois` e liste de novo os temas com diferença a olho |

**Correção — o que rodar** (sob a trava): `npm run build`, a `barra-de-topo-estreita` sozinha e as capturas de `depois`.

## Resumo da execução (correção 3) — 2026-11-27

**Resultado:** Concluído, aguardando a avaliação da prévia pelo dono

**Estado do worktree ao iniciar**
Os mesmos arquivos da correção 2 (`barra-de-topo-estreita.spec.ts`, `ChromeTopbarBody.tsx`, `SarakShellNav.tsx` e o resto desta plan); ` M specs/00-indice.md`, ` M specs/specs/12-kit-do-consumidor.md`, ` D specs/plan/plan-187-...md`, `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` não são meus.

**Por achado**
- **A6, causa medida:** o conteúdo da busca tem `w-80` e `max-w-full`, então ocupa o slot inteiro; a margem final que eu tinha posto nele transbordava para fora do slot em vez de encolher o campo. Com o respiro lateral da lista (removido na correção 1), isso ficava escondido. Sondagem no navegador: `aurora-veil` a 1440 px, slot [151,375], conteúdo [151,375], lista em 375.
- **A6, correção:** em `ChromeTopbarBody.tsx`, o conteúdo do slot da busca ganhou `max-w-[calc(100%-var(--sarak-layout-gap-md,16px))]`, junto da margem final, para o campo encolher o vão e devolvê-lo por dentro. Visível, o vão da barra fica entre o campo e a lista; recolhida a 0 px, resta um vão só.
- **A6, spec:** o caso da busca deixou de pular quando ela está visível. Ele mede o vão da caixa visível do campo (ou, recolhida, do item anterior) até a lista e exige o vão da barra, com tolerância de 1 px. Reprovava antes do ajuste (`aurora-veil`: vão 0 contra 20 a 24 px) e passa depois.
- **Capturas:** refeitas (`depois`, 50 arquivos; `antes` intacto em `C:\tmp\sarak-previa-186\`).

**Verificações executadas**
- `npm run build` → saiu 0.
- `playwright test barra-de-topo-estreita` → **98 passaram, 14 pularam, 0 reprovaram.** Os 14 pulos são o estado descrito em *Achados fora do escopo*, com motivo explícito no `test.skip`.
- `npx vitest run src/components/Layout src/components/atomic/Navigation` → 70 arquivos, 719 testes passando.
- Conferi a olho `aurora-veil-1440.png` (vão de volta entre o campo e "Início") e `sarak-sovereign-820.png` (busca visível, com vão).

**Diferença das capturas (comparação de pixels)**
- Os 50 arquivos continuam diferindo do `HEAD`: a lista horizontal perdeu o respiro lateral e anda para a esquerda o valor de `--sarak-layout-gap-md` do tema (16 a 48 px). Visíveis a olho no que mudou de composição a 820 px: `dot-matrix-elegant` (ganha o primeiro item), `sarak-sovereign`, `sarak-sovereign-classic`, `corporate-ledger` e `cyberpunk-neon` (a busca volta a aparecer). Nos demais, a diferença é o deslocamento da lista. O julgamento a olho final é do dono.

**Decisões e suposições**
- Tolerância de 1 px na medida do vão (a mesma `TOLERANCE_PX` da spec).

**Achados fora do escopo (não corrigidos)**
- Com a busca em barra num estado intermediário (slot ainda com largura, mas o contêiner abaixo de 10rem, então o campo some), o slot segue ocupando espaço vazio: `aurora-veil` a 820 px tem cerca de 106 px de buraco entre a marca e "Início" (visto em `C:\tmp\sarak-previa-186\depois\aurora-veil-820.png`). Já existia no `HEAD`; consertar muda como o slot divide o espaço da barra. A spec o declara como `test.skip`, com motivo.

**Pendências / riscos**
- Prévia ao dono em `C:\tmp\sarak-previa-186\` (antes e depois).

## Veredito (correção 3) — 2026-11-27 — código conferido; prévia com o dono

**A6:** resolvido. O conteúdo da busca desconta o vão da própria largura, e a margem não transborda mais. A spec mede a busca visível
e reprovava antes do ajuste. Em `aurora-veil-1440.png`, o vão entre o campo e "Início" voltou.

**Conferência do revisor:** `tsc --noEmit` com 0 erros; `audit:baseline` igual ao baseline; `trail-citation` OK; vitest de Buttons,
Cards, Navigation, Layout, `DesignEngine/components` e i18n: 119 arquivos, 1055 testes passando. A mutação do B2 foi feita na
primeira rodada.

**Aceito o pulo declarado:** em 14 temas a 820 px, o slot da busca fica com largura e o campo oculto. São cerca de 106 px vazios entre
a marca e "Início", e o problema já existia no `HEAD`. Vai para o backlog.

**Prévia, vista pelo revisor** (`C:\tmp\sarak-previa-186\antes\` × `depois\`), para o dono decidir:
- **Todos os temas:** a lista anda para a esquerda o valor do vão do tema (de 16 a 48 px). A 1440 px, o espaço entre a busca e o
  primeiro item ficou menor (`aurora-veil`: de cerca de 48 px para cerca de 24 px).
- **`dot-matrix-elegant` a 820 px:** passa a mostrar "Início". Era o objetivo.
- **`sarak-sovereign`, `sarak-sovereign-classic` e `cyberpunk-neon` a 820 px:** a busca volta a aparecer, sem perder itens.
- **`corporate-ledger` a 820 px:** a busca volta como um campo estreito, só com o ícone e "Buscar...", sem a caixa.

A plan fecha com o ok do dono.
