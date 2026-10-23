---
tipo: "plan"
titulo: "Dar a titulo, subtitulo e destaque cor propria em cada tema"
objetivo: "Fazer titulos, subtitulos e textos de destaque aparecerem com cor propria, distinta do texto corrido, em todos os componentes que os desenham e em cada um dos 19 temas, com contraste medido"
dominio: "Design Engine / Tipografia / Temas"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "tokens", "tipografia", "cor", "temas", "contraste", "rc"]
relacionados: ["[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[09-temas-e-presets]]", "[[03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Em cada tema embarcado, um título, um subtítulo e um texto de destaque têm cada um a sua cor, diferente da do texto corrido e
escolhida pelo tema; todo componente da lib que desenha título, subtítulo ou destaque lê a cor certa; e o contraste de cada par passa
no auditor.

# 2. Contexto

Pedido do dono (2026-10-22): hoje todos os temas parecem monocromáticos. Medido no código (`src/` salvo indicação):

- **Tokens.** `textColorMaster` (`core/Design/schema/typography.ts:114-124`) emite `--sarak-text-main`, `--theme-text-primary` **e
  `--theme-title`** — a variável chamada "título" carrega a cor do corpo. `titleColor` (`schema/colors.ts:91-101`) emite
  `--theme-title-color`/`--sarak-title-color`, ligadas a `--color-theme-title` (`styles/_theme.css:22,117`) e `--text-title`
  (`styles/_colors.css:14`). `cardTitleColor` (`schema/card-title.ts:27-36`) só no `SarakTitleCard`. **Não existe** token de
  subtítulo nem de destaque; `accentColor` (`schema/colors.ts:51-61`) não é lido por componente de texto.
- **Leitores errados.** `SarakTypography.tsx:78` faz h1-h3 lerem `--sarak-text-main` (sem valor `title` no `color`);
  `SarakTitleCard.tsx:103-108` sobrescreve a classe de título com estilo em linha cuja reserva é a cor do corpo (e anula o hover);
  `SarakMarkdownRendererImpl.tsx:54-56`, `SarakCatalogGrid.tsx:81,151`, `AuthForm.tsx:98`, `CalendarDayCell.tsx:36`,
  `KanbanColumn.tsx:107`, `GanttTimeline.tsx:134` e os widgets do cromo que usam `text-[var(--theme-title)]`
  (`SarakShellUserWidget.tsx`, `SarakShellSearchWidget.tsx`, `SarakShellThemeToggle.tsx`, `SarakShellLanguageSelector.tsx`) e os presets
  `presets/components/cards.ts:91-92`, `inputs.ts:70` leem o corpo. Já leem o título: `h1`-`h6` crus (`styles/_elements.css:30-33`),
  `SarakModal`, `SarakEmptyState`, `SarakActionCard`, `SarakSearchCard`, `SarakExpandableCard`, `SarakDataTableHeader`, `ChatHeader`.
- **Temas.** Em 30 dos 38 blocos de modo, `titleColor` = `textColorMaster`; nos 8 restantes, só um tom vizinho do mesmo matiz.
  `cardTitleColor` igual ao corpo quase sempre.
- **Conclusão:** só configurar os temas não basta — falta token (subtítulo, destaque), falta leitor e há uma variável com nome trocado.
- **Legibilidade vista nos prints:** rótulos de 8-9 px em caixa-alta (datas, "VALOR", selos de status, rótulos de campo) e o selo "v1"
  preto sobre azul. A escala `tiny` padrão é 8 px.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/` (`typography.ts`, `colors.ts`, e onde morarem os tokens novos), partições, mapeamento, tipos gerados.
- `src/styles/_theme.css`, `_colors.css`, `_elements.css` — as pontes das variáveis de título, subtítulo e destaque.
- Os leitores listados na §2 e os que a busca por `--theme-title`/`--sarak-text-main` em título revelar.
- `src/core/Design/presets/themes/*.ts` (os 19, com contraparte), `presets/components/cards.ts`, `inputs.ts`.
- O auditor de contraste (pares novos) e os testes; casos em `browser-tests/`; `docs/migracoes.md` (`## 8.0.0`).

## 3.2 Fora
- Tokens da barra (texto da barra é da `plan-124`); o painel (`plan-122`).
- Mudança de fonte ou de tamanho dos temas além do piso de legibilidade do passo 2.4.
- Specs fixas (síntese do revisor); versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/02-design-engine.md` (§10, §10.10, §10.12, §10.15) | o que o token desenha; um dono por variável; estético × funcional |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` (§2, §2.3) | paridade 1:1:1 e metadados do token |
| Spec fixa | `specs/09-temas-e-presets.md` (§2.1, §5.2, §5.3, §6.5, §6.7) | contraparte; diversidade medida; o tema declara todo estético; contraste mede o que o componente desenha |
| Spec fixa | `arquitetura/03-superficie-publica.md` | a prop `color` do `SarakTypography` é contrato público |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | contraste e tamanho mínimo |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R4, R31, R40-R44) | paridade; contraste; leitor; variável com um dono |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-novo-componente` (tokens novos e paridade) · `ui-refatorar-componente` (a variável `--theme-title` e a prop `color`) · `ui-criar-tema` (os 19 temas) | escrita, testes, token, assinatura, tema |
| Código | os arquivos da §3.1 | ler antes de editar |

# 5. Instruções de execução

**Dois lotes**, na ordem; cada um fecha com resumo na §9 e status 🟠.

**Lote 1 — motor e leitores.**
1.1. Tokens novos `subtitleColor` e `emphasisColor` (estéticos, com modo, `usage` e `interactsWith`), padrão = o valor do
`sarak-sovereign` depois do lote 2 (até lá, o título e o primário, respectivamente), com leitor e teste no mesmo commit (R40).
1.2. `--theme-title` passa a ter um dono só, o título: `textColorMaster` deixa de emiti-la. Quem lia `--theme-title` querendo o
corpo passa a ler a variável do corpo; quem queria título continua. Nota MAJOR se o importador puder ler a variável.
1.3. `SarakTypography`: h1-h3 leem o título por padrão; a prop `color` ganha `title`, `subtitle` e `emphasis`. `SarakTitleCard` usa o
título como reserva sem anular o hover. Os demais leitores da §2 passam a ler título, subtítulo ou destaque conforme o papel do texto
(título de coluna, cabeçalho de dia, nome de catálogo, título de formulário). Os widgets do cromo leem o corpo ou o título de propósito,
nunca pela variável trocada.
1.4. Piso de legibilidade: texto de rótulo e selo legível nunca abaixo de 11 px renderizados (a escala `tiny` e o que a usar para
texto que se lê); o piso de 12 px do painel continua. **Medido no ERP em 2026-10-23:** `--sarak-type-scale-tiny` = 8 px; na lista de
propostas, 71 textos a 10-10,5 px (selos do `SarakBadge`, rótulos "ENVIADA EM"/"VALOR"); no detalhe, todos os rótulos de campo a
10,5 px em caixa-alta.
1.5. **Escala do título de cartão:** o cabeçalho de cartão (`--sarak-card-header-*`) hoje herda o tamanho de h2 da página (32 px, fonte
de display em caixa-alta, sobre uma faixa de fundo própria) — no detalhe de proposta, cada cartão grita tanto quanto o título da
página. O título de cartão passa a ter degrau próprio na escala, abaixo do h2 de página, e a faixa de fundo do cabeçalho só aparece
quando o tema a declara.
1.6. Testes de cada leitor; `auditor_contraste` cobre título, subtítulo e destaque contra o fundo e a superfície do cartão.

**Lote 2 — os 19 temas.**
2.1. Cada tema (e a contraparte) declara `titleColor`, `subtitleColor`, `emphasisColor` e `cardTitleColor` com papéis distintos e
coerentes com a identidade do tema: o título se separa do corpo por matiz ou por luminosidade clara, o subtítulo fica entre os dois e
o destaque usa a cor de acento do tema. Nenhum dos quatro igual ao texto corrido.
2.2. Contraste ≥ 4,5:1 para subtítulo e destaque em texto corrido e ≥ 3:1 para título grande, nos dois modos de cada tema.
2.3. Teto de peso por tema ([[09-temas-e-presets]] §5.3) respeitado; se algum tema estourar, relatar — não subir o teto.
2.4. A diversidade do catálogo (§5.2) continua passando; caso de navegador com três temas: a cor computada do h1 do `SarakTypography`,
de um subtítulo e de um destaque diferem da do parágrafo.

# 6. Critérios de aceite

- [ ] `subtitleColor` e `emphasisColor` com leitor, teste, paridade e documentação.
- [ ] `--theme-title` com um dono só (o título); nenhum leitor de título lendo o corpo.
- [ ] `SarakTypography` h1-h3 no título e `color` com `title`/`subtitle`/`emphasis`; `SarakTitleCard` com hover vivo.
- [ ] Nenhum texto que se lê abaixo de 11 px renderizados.
- [ ] Título de cartão num degrau próprio, abaixo do h2 de página; faixa de cabeçalho só quando o tema a declara.
- [ ] Os 19 temas com título, subtítulo, destaque e título de cartão distintos do corpo, nos dois modos, com contraste passando.
- [ ] `theme-completeness:check`, `token-reader:check`, `token-docs:check`, paridade, `auditor_contraste` e diversidade verdes.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — os pares entram no `auditor_contraste` existente; o resto é teste e caso de navegador.

- Lote 1: `npm run verify -- --tier=schema-meta`; vitest dos leitores; `npm run audit` comparado ao baseline.
- Lote 2: `npm run verify -- --tier=themes`; `build` + o caso de navegador das cores computadas.
- Fechamento: `npm run verify -- --tier=full`.
- Leitura: busca por `--theme-title` em `src/` → só leitores de título.

# 8. Destino da síntese

**Destino:** `arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + arquitetura/03-superficie-publica.md`

- **`02` §10:** título, subtítulo e destaque — os tokens, a variável de cada um e quem a lê; o piso de 11 px para texto que se lê.
- **`09` §5.3:** o tema declara os quatro papéis de cor de texto, distintos do corpo, com os pisos de contraste.
- **`03`:** a prop `color` do `SarakTypography` e o padrão dos títulos.

---

# 9. Resumo da execução

---

# 10. Veredito
