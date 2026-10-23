---
tipo: "plan"
titulo: "Fazer o conteudo acompanhar a tela e a busca do cromo funcionar"
objetivo: "Fazer a regiao de conteudo do cromo acompanhar a largura da tela com margens que crescem com ela, sem coluna espremida nem elemento cortado, e a busca do cromo mostrar o texto inteiro e navegar ao clicar no resultado mesmo sem onNavigate"
dominio: "Cromo / Layout / Busca"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "cromo", "layout", "largura", "busca", "rc"]
relacionados: ["[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[02-design-engine]]", "[[09-temas-e-presets]]", "[[03-superficie-publica]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md + specs/07-responsividade-e-multidispositivo.md + specs/09-temas-e-presets.md"
---

# 1. Objetivo

Num monitor de 1900 a 2560 px, o conteúdo de qualquer tema embarcado ocupa a largura disponível com margens laterais proporcionais
(nem esticado de borda a borda, nem uma coluna estreita no meio), nada é cortado; e a busca da barra mostra o placeholder sem o
selo por cima e leva à rota ao clicar no resultado, com ou sem `onNavigate`.

# 2. Contexto

Validação da `8.0.0-rc.2` no ERP (2026-10-22, dono). Medido no código:

- **Largura.** `maxContentWidth` (`src/core/Design/schema/system.ts:28-45`) só aceita `1000px`, `1200px`, `1440px` (padrão),
  `1600px` e `100%`. O cromo aplica `width:100%; maxWidth; marginInline:auto` em linha
  (`src/components/Layout/chrome/chromeStructuralStyles.ts:54-64`) no `<main data-sarak-content>` (`ChromeSidebarBody.tsx:174-178`,
  `ChromeTopbarBody.tsx:173`, `SarakAppChromeMobile.tsx:226`), com padrão `1440px` em `useChromeDesignTokens.ts:42`. 18 dos 19
  temas usam valor em px (só `corporate-ledger` usa `100%`; `editorial-ink` usa `1000px`). O `<main>` é `overflow-auto`, então o
  que passa do teto rola ou é cortado (a prévia do documento na tela de proposta do ERP). O painel de design, montado dentro do
  cromo, herda a mesma coluna. Duas variáveis estão mortas para isso: `--sarak-max-width`/`--theme-max-width` (`manifest.ts:177`)
  e `--sarak-max-content-width` de `.sarak-safe-container` (`src/styles/_base.css:77-82`), que ninguém escreve.
- **Decisão do dono (2026-10-23):** o padrão passa a ser **fluido** — a região acompanha a tela e a margem lateral cresce com ela;
  os tetos em px continuam como opção.
- **Selo "CTRL K".** Em `SarakShellSearchWidget.tsx:92-104` o selo vai como `rightIcon` do `SarakInput`, que o posiciona em
  `absolute right-3` (`SarakInput.tsx:71`) e reserva só `pr-11` (`:116`); o selo mede ~46 px e invade o texto. Na barra de 240 px
  sobram ~110 px para o placeholder. O selo nunca some (`transition-opacity` sem nada que mude a opacidade, `:94`), em todo tema.
  Achado no caminho: `SarakInput.tsx:144-146` espalha `{...props}` depois do próprio `onFocus`/`onBlur`, e o widget passa
  `onFocus` — o estado de foco interno nunca liga e a borda de foco some.
- **Resultado que não clica.** Sem `onSelect`, cada resultado vira `<div>` sem ação (`SarakShellSearchWidget.tsx:137-155`); o
  `onSelect` só existe quando o consumidor passa `onNavigate` ao `SarakAppChrome` (`ChromeSidebarBody.tsx:74`). A paleta Ctrl+K tem
  o mesmo portão (`ChromeSidebarBody.tsx:184-189`, `Inputs/SarakSearch.tsx:141-148`). O menu lateral, no mesmo caso, cai num
  `href` de verdade (`SarakShellNav.tsx:80-85`, [[05-cromo-e-slots]] §2.1.2) e o id do item já é a rota (`chrome/navItem.ts:41-48`).
- **Campo com texto encostado na borda.** Na tela de proposta do ERP (tema derivado do Blueprint), o valor dos campos encosta na
  borda esquerda. Não medido ainda se é padding do `SarakInput` sob algum token do tema ou classe do importador — o lote 2 mede.
- Fora da lib (não é desta plan): a tela de fornecedores do ERP sem gap entre os campos é layout do importador.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/system.ts` (opção fluida e padrão), a partição e o mapeamento do token, os tipos gerados.
- `src/components/Layout/chrome/` (`chromeStructuralStyles.ts`, `useChromeDesignTokens.ts`, `ChromeSidebarBody.tsx`,
  `ChromeTopbarBody.tsx`) e `src/components/Layout/SarakAppChromeMobile.tsx` — só o que a largura exigir.
- `src/core/Design/manifest.ts` e `src/styles/_base.css` — só para eliminar as variáveis mortas de largura ou ligá-las ao valor real.
- `src/core/Design/presets/themes/*.ts` — o valor de `maxContentWidth` dos 19 temas.
- `src/components/atomic/Navigation/SarakShellSearchWidget.tsx`, `src/components/atomic/Inputs/SarakSearch.tsx` (e os arquivos da
  paleta que ele monta), `src/components/atomic/Inputs/SarakInput.tsx`, o schema/emissão da variável de padding do campo.
- Testes dos arquivos acima; casos em `browser-tests/` (harness existente); i18n se surgir rótulo novo; `docs/migracoes.md`
  (`## 8.0.0`).

## 3.2 Fora
- O painel de design (`src/features/DesignEngine/`) — é da `plan-122`.
- Tokens de cor e de barra — `plan-123` e `plan-124`.
- O ERP: nenhuma linha do importador; a correção do gap na tela de fornecedores e o `onNavigate` nos módulos são da sessão de
  revisor do ERP.
- Prop nova de "sangria total" no cromo; specs fixas (síntese do revisor); versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/05-cromo-e-slots.md` (§2.1.2, §2.4, §5.1) | o item é link de verdade; o que cada token de cromo desenha; quem rola |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` (§6, §6.1) | camada de contêiner e as quatro regras; default não conserta opção |
| Spec fixa | `arquitetura/02-design-engine.md` (§10, §10.15) | o que o token desenha; estético × funcional |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` (§2.3) | metadados do token e paridade |
| Spec fixa | `specs/09-temas-e-presets.md` (§4.4.3, §5.3) | valor oferecido é contrato; o que o tema declara |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | foco visível, alvo de toque, teclado na busca |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R40-R44) | leitor, cascata, variável com um dono |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-refatorar-componente` (mudar opção/padrão de token existente) · `ui-criar-tema` (valor nos 19 temas) | escrita, testes, token, temas |
| Código | os arquivos da §3.1 | ler antes de editar |
| Doc | `docs/migracoes.md` (`## 8.0.0`) | nota do padrão novo e da busca |

# 5. Instruções de execução

**Dois lotes**, nesta ordem; cada lote termina com o resumo num bloco novo da §9 e status 🟠. O executor roda só o teste do que
escreveu; a verificação no nível do diff é do revisor.

**Lote 1 — largura fluida.**
1.1. `maxContentWidth` ganha a opção **fluida** e ela vira o padrão: a região ocupa a largura disponível e a margem lateral cresce
com a largura da própria região, com piso no respiro de `layoutPadding`/`layoutDensity` e um teto declarado no schema. Medida por
unidade de contêiner ou proporção da região, **nunca** por `vw` (a região não é a janela, [[07-responsividade-e-multidispositivo]]
§6). Os tetos em px e o `100%` continuam como opção, com o comportamento de hoje.
1.2. Os 19 temas declaram a opção fluida. Tema que precisar de linha de leitura curta resolve dentro do componente de texto, não
estreitando a região inteira.
1.3. As variáveis de largura mortas (`--sarak-max-width`, `--theme-max-width`, `--sarak-max-content-width`) passam a refletir o valor
efetivo ou saem, com o leitor e o teste (R40).
1.4. Teste: o estilo da região para cada opção. Caso de navegador: com o tema padrão a 1280, 1920 e 2560 px de janela, a largura
do `<main data-sarak-content>` cresce com a janela, as margens laterais são iguais e crescem, e o `scrollWidth` do `<main>` é igual
ao `clientWidth` numa cena com uma tabela larga. Nota em `docs/migracoes.md` (padrão novo; quem quiser o teto escolhe a opção).

**Lote 2 — busca e campo.**
2.1. O selo do atalho não cobre o texto: o campo reserva a largura real do selo; o selo some com o campo focado ou com texto, e some
quando a barra é estreita demais para ele e o placeholder caberem juntos (por contêiner). Em todos os temas.
2.2. O `SarakInput` compõe o `onFocus`/`onBlur` recebido com o próprio, sem perder nenhum dos dois; a borda de foco volta.
2.3. Sem `onSelect`/`onNavigate`, o resultado da busca da barra e o da paleta Ctrl+K são links de verdade para a rota do item
(como o menu lateral); com o callback, ele é chamado e a navegação padrão é cancelada. Teclado (setas + Enter) leva ao mesmo
destino. No celular, selecionar fecha o drawer (já é regra da [[05-cromo-e-slots]] §2.3).
2.4. **Variável de padding do campo que engana o importador** (medido no ERP em 2026-10-23: o ERP escreve
`padding: var(--sarak-input-padding, 8px 12px)` num `<input>` próprio, a lib emite `--sarak-input-padding: 12px` e usa a variável só
como padding **vertical** (`py-[var(--sarak-input-padding,16px)]` no `SarakInput`); resultado: `padding-left: 0`, texto na borda).
Publicar o par explícito (vertical e horizontal) que o `SarakInput` usa, manter a variável antiga como sinônimo do vertical com nota
de depreciação em `docs/migracoes.md`, e documentar no JSDoc/catálogo qual eixo cada uma governa.
2.5. **Paleta Ctrl+K** (medida em 2026-10-23, 2560 px): o campo tem 207 px num modal de 398 px e corta o placeholder; o selo mostra só
"K"; nenhum item vem pré-selecionado; todo resultado repete o mesmo ícone e o subtítulo "MÓDULO". Corrigir: campo ocupa a largura
útil; selo completo pelo sistema operacional (Ctrl/⌘); primeiro resultado ativo e Enter navega; ícone do item vindo do item de
navegação; subtítulo só quando informa algo (categoria ou caminho). Acessibilidade: o modal é `role="dialog"` com `aria-modal`, o
campo é `combobox` ligado a uma `listbox` com `aria-activedescendant`, e os resultados são opções.
2.6. **Foco visível:** o campo da busca da barra e o da paleta mostram o anel de foco do tema (hoje `outline: none` e sem sombra ao
focar).
2.7. Testes de cada item; caso de navegador para 2.1 (o retângulo do selo não intercepta o do texto do placeholder a 240 px de barra)
e para 2.3 (clicar o resultado sem `onNavigate` muda a URL). Nota em `docs/migracoes.md`.

# 6. Critérios de aceite

- [ ] Padrão fluido: a região cresce com a tela, margens laterais proporcionais e simétricas, nenhum `vw`, nada cortado (caso de navegador nas três larguras).
- [ ] Os 19 temas declaram o padrão fluido; os tetos em px seguem funcionando como opção.
- [ ] Nenhuma variável de largura sem leitor.
- [ ] Selo do atalho nunca sobre o texto; some com foco, com texto e em barra estreita.
- [ ] Borda de foco do `SarakInput` volta com `onFocus` do chamador.
- [ ] Resultado da busca e da paleta navega sem `onNavigate`; com ele, chama o callback.
- [ ] Par explícito de padding do campo publicado; a variável antiga documentada como só vertical e depreciada.
- [ ] Paleta: campo na largura útil, selo completo, primeiro item ativo, ícone por item, `dialog` + `combobox`/`listbox` acessíveis.
- [ ] Anel de foco visível nos campos da busca e da paleta.
- [ ] Notas em `docs/migracoes.md`; `theme-completeness:check`, `token-reader:check`, `token-docs:check` e paridade verdes.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento de componente e de token, coberto por teste e caso de navegador.

- Lote 1: `npm run verify -- --tier=schema-meta` e `--tier=themes`; `npm run build` + os casos novos de largura em `browser-tests/`.
- Lote 2: `npm run verify -- --tier=quick`; vitest de `src/components/atomic/Navigation` e `Inputs`; `build` + os casos da busca.
- Fechamento: `npm run verify -- --tier=full` e a bateria inteira do navegador.
- `git diff --stat` → só a §3.1.
- Conferência no ERP (dono): `/proposals` e `/design` a 2546 px de janela, sem coluna espremida; busca clicável num módulo sem `onNavigate`.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md + specs/07-responsividade-e-multidispositivo.md + specs/09-temas-e-presets.md`

- **`05` §2.4:** a linha de `maxContentWidth` passa a dizer o padrão fluido, como a margem cresce e o teto; §2.1.2 (ou nova): o
  resultado da busca e da paleta é link de verdade como o item de navegação; o selo do atalho e quando some.
- **`07` §6:** a região de conteúdo mede a si mesma, não a janela.
- **`09` §5.3:** os temas embarcados declaram a largura fluida.

---

# 9. Resumo da execução

---

# 10. Veredito
