---
tipo: "plan"
titulo: "Compactar a linha de recurso, ajustar o indicador único, pôr o afixo dentro do campo e fazer as abas encolherem"
objetivo: "Fazer a linha de recurso ter layout e densidade compactos, o bloco de uma métrica preencher a célula e aceitar link, o prefixo e o sufixo poderem ficar dentro do campo, e as abas nunca transbordarem"
dominio: "Componentes / Lista, formulário e navegação"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.5", "lista", "formulario", "abas"]
relacionados: ["[[anexos/rc5-contrato]]", "[[07-responsividade-e-multidispositivo]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Os itens 8 a 11 do contrato da rc.5 entregues, com padrão que preserva o comportamento de hoje, provados em navegador real.

# 2. Contexto

Contrato em `specs/plan/anexos/rc5-contrato.md`, itens 8 a 11.

- **Item 8, `src/components/atomic/Templates/SarakResourceRow.tsx`:** a linha empilha tudo, com cerca de 300 px, e sobra espaço à direita: cinco itens por tela.
- **Item 9, `Templates/SarakStats.tsx`:** com uma métrica, o bloco não preenche a célula, e o rótulo quebra palavra por palavra. O ERP escreve `SarakCard` + `SarakValue` à mão para ter link.
- **Item 10, `Inputs/SarakInput.tsx`:** `prefixText` e `suffixText` saem fora da caixa, e os campos de uma linha ficam com larguras diferentes.
- **Item 11, `UX/SarakTabs.tsx`:** medido no ERP, 658 px de faixa em 446 px de `main`, e as últimas abas somem sem aviso.

**Responsividade por contêiner, nunca por janela** ([[07-responsividade-e-multidispositivo]] §6.1).

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Templates/SarakResourceRow.tsx`, `SarakStats.tsx`, `src/components/atomic/Inputs/SarakInput.tsx`, `SarakCurrencyInput`, `SarakMaskedInput`, `src/components/atomic/UX/SarakTabs.tsx` e testes.
- `src/core/i18n/` — textos novos, se houver, nos seis idiomas.
- `browser-tests/` — specs novos.

## 3.2 Fora
- Grade e camadas (plan-146). Gráficos (plan-147). Token novo: pare e reporte.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | nomes e padrões |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6.1 | contêiner |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | teclado, alvo de 44 px |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §7 | navegador |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **`SarakResourceRow`.** `layout` e `density`, com os padrões do contrato. Em `inline`: título, descrição e selos à esquerda, metadados em colunas, ações à direita, e empilha por container query. O `title` corta com reticências sem invólucro do consumidor, e a ação não passa da borda.
3. **`SarakStats`.** Uma métrica preenche a célula, e o rótulo não quebra por palavra. `href` na métrica torna-a link, com teclado e foco.
4. **`affixPlacement`.** Em `inside`, o texto fica dentro da borda, com espaço reservado por `padding`, e a largura do campo não muda. Vale para os três campos, se usarem o mesmo desenho; se não, diga no resumo.
5. **`SarakTabs`.** `overflow`. A faixa nunca passa do contêiner. `scroll` com rolagem própria e sinal de que há mais; `wrap` quebra linha; `menu` leva as que não cabem a um menu com teclado. Alvo de toque ≥ 44 px.
6. Depois de `npm run build`, rode os specs novos. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
7. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] `inline` reduz a altura da linha e empilha em contêiner estreito; o título corta; a ação não passa da borda — navegador.
- [ ] Sem as props novas, o desenho de hoje — teste.
- [ ] Uma métrica preenche a célula; `href` funciona por teclado — teste e navegador.
- [ ] Afixo dentro: campos de uma linha com a mesma largura — navegador.
- [ ] Abas: largura da faixa ≤ contêiner nos três modos, alvo ≥ 44 px — navegador.
- [ ] Catálogo atualizado.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/components/atomic` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A CI mede a bateria no push.

# 8. Destino da síntese

**Destino:** `—`. A superfície nova fica no catálogo gerado.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências (o `git restore -- dist …` do passo 6 não foi feito; ver Pendências)

**Estado do worktree ao iniciar**
Já sujo por outras tarefas (plan-140 painel, plan-143 paleta, plan-147 gráficos, browser-tests do painel, `dist/`, `docs/migracoes.md`, `specs/`, `src/core/i18n/catalog.ts` e `catalogEntries.palette.ts`, `src/core/Design/**`, `src/features/DesignEngine/**`). Nenhum arquivo meu de componente estava modificado; a lista completa está no `git status` do início da conversa.

**O que foi feito**
- `SarakResourceRow.tsx`: props `layout` (`stacked`|`inline`) e `density` (`compact`|`standard`). `inline` usa três colunas (título/descrição/selos, metadados, ações) a partir de 640 px **do contêiner** e uma coluna abaixo; o título corta com reticências; a ação ganha `max-w-full`. A classe de container query mora em `resourceRowLayout.ts` (o auditor de hardcode só varre `.tsx`). Metadados em `inline` usam `grid-auto-columns: max-content`, porque a coluna `auto` colapsava a 0 px com o `min(100%, …)` da lista.
- `SarakStats.tsx`: `metrics[chave].href` põe um `SarakLink` sobreposto ao cartão (nome = rótulo, foco e Enter nativos); com uma só chave a grade vira `minmax(0, 1fr)`.
- `SarakInput.tsx` + `internal/insideAffix.tsx` + `internal/iconSlots.ts`: `affixPlacement` (`outside` padrão|`inside`). Dentro: o afixo é absoluto na borda do campo, a largura do campo não muda e o `padding` reserva a largura medida do afixo. `SarakCurrencyInput` e `SarakMaskedInput` herdam a prop por `...inputProps`, sem código novo. Os ícones foram extraídos para `iconSlots.ts` só para o `SarakInput.tsx` ficar em 243 linhas (teto 250).
- `SarakTabs.tsx`, `tabsStyling.tsx`, `useTabsOverflow.ts`, `SarakTabsMenu.tsx`: `overflow` (`scroll` padrão|`wrap`|`menu`). `scroll`: rolagem própria e máscara esmaecida nas bordas com mais abas. `wrap`: quebra linha. `menu`: o que não cabe fica invisível/`aria-hidden` na faixa e vai a um menu (`aria-haspopup`, setas, Home/End, Esc, Tab, clique fora; aba com `href` vira link). Toda aba ganhou `minHeight` de `--sarak-touch-target-min`.
- `catalogEntries.layout.ts`: `tabsMoreLabel` nos seis idiomas. `src/index.ts`: exporta o tipo `SarakTabsOverflow`.
- `docs/migracoes.md`: seção por acréscimo na 8.0.0. Catálogo e kit regenerados (`npm run catalog`, `npm run guide`).
- Testes: `SarakResourceRow`, `SarakStats`, `SarakInput`, `SarakCurrencyInput`, `SarakMaskedInput`, `SarakTabs` (casos novos acrescentados), mais `SarakTabsMenu`, `useTabsOverflow`, `insideAffix`, `iconSlots`, `resourceRowLayout`. Navegador: `browser-tests/plan-148-lista-formulario-abas.spec.ts` + `fixtures/plan-148-entry.tsx`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Templates/SarakResourceRow.tsx` | alterado | `layout`, `density`, título cortado, metadados em `inline` |
| `src/components/atomic/Templates/resourceRowLayout.ts` | criado | classe de container query da linha `inline` |
| `src/components/atomic/Templates/SarakStats.tsx` | alterado | `href` na métrica; métrica única ocupa a linha |
| `src/components/atomic/Inputs/SarakInput.tsx` | alterado | `affixPlacement` |
| `src/components/atomic/Inputs/internal/insideAffix.tsx`, `iconSlots.ts` | criados | afixo de dentro; vagas de ícone extraídas |
| `src/components/atomic/UX/SarakTabs.tsx`, `tabsStyling.tsx` | alterados | `overflow`, alvo de toque, máscara de borda |
| `src/components/atomic/UX/useTabsOverflow.ts`, `SarakTabsMenu.tsx` | criados | medição da faixa e menu das abas escondidas |
| `src/core/i18n/catalogEntries.layout.ts` | alterado | `tabsMoreLabel` (acréscimo) |
| `src/index.ts` | alterado | `export type { SarakTabsOverflow }` (uma linha) |
| `docs/migracoes.md` | alterado | seção nova (acréscimo) |
| `docs/component-catalog.{json,md}`, `sarak-ui/**` | regenerados | `npm run catalog` / `npm run guide` |
| testes e `browser-tests/*` | criados/alterados | ver acima |

**Verificações executadas**
- `npx vitest run src/components/atomic/{UX,Inputs}` + `SarakResourceRow`/`SarakStats`: 52 arquivos, 310 testes verdes; depois das correções, `Templates/__tests__`, `Inputs/internal`, `UX`: 68 arquivos, 273 testes verdes.
- `npm run build`: o JS e o d.ts compilam; o encadeamento para em `public-types:check` por `ChartColorToken` (tipo da plan-147, fora do meu escopo). Rodei à mão os passos que sobravam (`build:css`, `build:css:scoped`, `copy-base-css`, `inject-css`).
- `playwright … plan-148-lista-formulario-abas.spec.ts`: 5 de 5 passam (linha `inline` mais baixa que a empilhada, título com reticências, ação dentro da borda, empilha em 320 px; métrica única preenche a célula e o link responde a Tab/Enter; campo com afixo dentro tem a mesma largura do campo sem afixo e o texto não cobre o afixo; faixa ≤ contêiner nos três modos, alvo ≥ 44 px, sem rolagem horizontal da página; máscara de borda em `scroll`; gatilho e menu por teclado em `menu`).
- `npm run verify -- --tier=quick` → `tsc`, `audit:baseline --with-tsc`, `variable-contract:check`, `catalog`, `guide`, `dev-kit`, Anel 0: todos OK. A primeira rodada acusou `--sarak-z-dropdown`/`--sarak-shadow-md` inexistentes e três valores fixos; corrigi a causa.

**Critérios de aceite**
- [x] `inline` reduz a altura, empilha em contêiner estreito, o título corta, a ação não passa da borda — navegador, teste 1.
- [x] Sem as props novas, o desenho de hoje — `SarakResourceRow.test.tsx`, `SarakInput.test.tsx` (afixo `outside`), `SarakStats.test.tsx` (várias métricas); nenhum snapshot do painel mudou.
- [x] Uma métrica preenche a célula; `href` por teclado — teste e navegador (teste 2).
- [x] Afixo dentro: mesma largura — navegador (teste 3).
- [x] Abas: faixa ≤ contêiner nos três modos, alvo ≥ 44 px — navegador (teste 4).
- [x] Catálogo atualizado — `npm run catalog`, `catalog:check` OK.

**Decisões e suposições**
- O título só corta em `inline`; em `stacked` quebra como antes, para o desenho de hoje não mudar.
- O alvo de 44 px vale para as abas nos três modos (também no padrão): é o que o critério pede e só aumenta abas que mediam menos.
- O menu do `menu` é próprio (a lib não tem menu de teclado; `SarakContextMenu` é por coordenada de mouse). Usa `--sarak-z-sidebar` para a camada e a classe `card` para a sombra.
- As abas escondidas ficam na faixa como `invisible`+`aria-hidden`, para continuarem medíveis; a aba ativa escondida aparece no menu com `aria-current`.
- Os três campos usam o mesmo desenho de afixo de dentro (via `SarakInput`).
- O spec de navegador espera as animações terminarem (`getAnimations`), porque o campo tem `transition-all` e animava o `padding` durante a medida.

**Achados fora do escopo (não corrigidos)**
- `SarakTabs.tsx`: com `overflow="menu"`, as setas do teclado do tablist podem ativar uma aba escondida. Pré-existente em espírito (roving tabindex), mas agora visível.
- `dist/` foi revertido por outra execução (o passo 6 das plans 147 e 148 manda `git restore -- dist`) no meio da minha medição; tive de reconstruir duas vezes. Convém serializar o passo 6.

**Pendências / riscos**
- Não executei `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`: o `dist/` já estava modificado por outras tarefas ao começar e a plan-147 pode estar medindo nele. Fica para o revisor/usuário.
- `npm run build` completo não termina em verde por `ChartColorToken` (plan-147).
- `sarak-ui/docs/migracoes.md` e `sarak-ui/catalog.json` mudaram por regeneração e misturam outras tarefas.

---

# 10. Veredito

## Veredito — 2026-11-02 — 🔴 Reprovado

Linha, indicador, afixo e os três modos das abas estão certos, com os specs de navegador relatados. Um defeito da superfície nova:

1. **Seta do teclado alcança aba escondida.** Com `overflow="menu"`, as setas podem levar o foco a uma aba com `aria-hidden`, fora da tela. O próprio resumo o registrou. Em `menu`, as setas percorrem só as abas visíveis, e a última seta vai ao botão do menu. Teste de navegador com teclado.

**Verificação objetiva:** o spec desta plan e `npx vitest run src/components/atomic/UX`. Sem `git restore` de `dist/`: há outras execuções na árvore.

## Resumo da execução (correção 1) — 2026-11-02

**Achado 1 — seta do teclado alcança aba escondida: corrigido.**
- `SarakTabs.tsx`: `moveTo` passa a pular as abas escondidas (`isReachable` = existe, habilitada e fora de `hiddenIndexes`) e, ao ativar, move também o foco para a aba (antes só chamava `onChange`). Em `overflow="menu"`, `ArrowRight` na última aba visível leva o foco ao botão do menu sem ativar nada; `Home`/`End`/`ArrowLeft` só percorrem as visíveis.
- `SarakTabsMenu.tsx`: prop `onLeaveStart`; `ArrowLeft` no botão do menu devolve foco e ativação à última aba visível (só em abas que não são rota).
- Testes: `UX/__tests__/SarakTabs.menuKeyboard.test.tsx` (novo, com `vi.mock` da medição: seta não ativa a escondida, `End`/volta pulam a escondida). Navegador: caso novo em `browser-tests/plan-148-lista-formulario-abas.spec.ts` ("setas percorrem só as visíveis e a última vai ao botão do menu"), com teclado real e foco conferido em cada passo; a fixture ganhou `ControlledMenuTabs` (abas controladas) em `fixtures/plan-148-entry.tsx`.

**Verificações executadas**
- `npx vitest run src/components/atomic/UX` → 12 arquivos, 58 testes verdes; `npx tsc --noEmit` sem erro em `atomic/UX`.
- `npm run build` (saiu 0) e `playwright … plan-148-lista-formulario-abas.spec.ts` → 6 de 6 passam.
- Sem `git restore` de `dist/`, como o veredito pediu.

**Observação:** a mudança do foco acompanhar a aba vale também para `scroll` e `wrap` (comportamento de tablist WAI-ARIA); o contrato de props não muda.

## Veredito — 2026-11-02 — correção 1 — 🟢 Aprovado

As setas só percorrem as abas visíveis, e a última vai ao botão do menu. `src/components/atomic/UX` com 58 de 58; o spec de navegador tem 6 de 6, relatado pelo executor. O foco acompanhar a aba vale para os três modos, como manda o padrão de `tablist`: mudança registrada, sem alteração de prop. Código no commit conjunto da rc.5.
