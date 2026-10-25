---
tipo: "plan"
titulo: "Entregar as pecas que compoem uma pagina para o importador nao montar a estrutura a mao"
objetivo: "Fazer o importador montar uma tela de lista e uma tela de detalhe so com pecas da lib, cabecalho de pagina, barra de filtros, controle segmentado, secao, linha de recurso e par rotulo-valor, com o ritmo, a hierarquia e os estados vindos do tema, e o kit ensinando os dois moldes"
dominio: "Componentes / Composição de página / Kit do consumidor"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "componentes", "composicao", "pagina", "kit", "rc"]
relacionados: ["[[03-superficie-publica]]", "[[02-design-engine]]", "[[12-kit-do-consumidor]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md + specs/12-kit-do-consumidor.md + arquitetura/02-design-engine.md"
---

# 1. Objetivo

Uma tela de lista (cabeçalho com título, subtítulo e ação; filtros; segmentado; linhas de recurso com título, selos, pares
rótulo-valor e ações; estados vazio, carregando e erro) e uma tela de detalhe (cabeçalho; seções com campos em grade) se escrevem só
com peças do barril, sem `<header>`, `<section>`, `<nav>` ou `<form>` com estilo próprio, e mantêm o mesmo ritmo e a mesma hierarquia
em qualquer tema, do celular a 2560 px.

# 2. Contexto

Auditoria no navegador do ERP (2026-10-23, revisor com o dono). O ERP ainda está migrando para a lib (campanha própria, depois da
`8.0.0-rc.3`); a tela de **propostas** é a única já migrada e é a referência. Mesmo nela, e com mais força nos módulos não migrados,
a estrutura da página é feita à mão:

- **O que o importador usa** (contagem em `modules/*/web/src` e `packages/ui-kit/src`): `SarakLink` 242, `SarakButton` 218, `SarakSelect`
  131, `SarakFlex` 124, `SarakInput` 113, `SarakBadge` 71 — e `SarakEmptyState` 0, `SarakTabs` 0, `SarakTypography` 7. 72 arquivos com
  `<form>`/`<section>`/`<header>`/`<nav>` crus.
- **O que isso produz** (medido): filtros sem espaço entre si (fornecedores); "Ativos | Inativos | Todos" como três `SarakLink` colados
  num `<nav>` sem gap (financeiro); "Nova conta"/"Nova proposta" como link solto no canto; estado vazio como `<p>` sem respiro; a linha
  da lista de propostas como `<article>` com estilo em linha, rótulos "ENVIADA EM"/"VALOR" em `<span>` de 10 px e ações "proposta ↗ /
  Ver detalhes" com 22 px de altura (abaixo do alvo de 24 px); um `<input>` próprio (`NATIVE_INPUT_STYLE`) que lê a variável de padding
  errada.
- **O que a lib tem hoje** (`src/components/atomic/`): átomos de layout (`Layouts/`: `SarakFlex`, `SarakGrid`, `SarakFormGroup`,
  `SarakDivider`, `SarakSplitPane`), cartões (`Cards/`), `SarakTabs`, `SarakEmptyState`, `SarakSkeleton`, `SarakBadge`, templates de dado
  (`Templates/`: `SarakTable`, `SarakTableCards`, `SarakCardGrid`, `SarakForm`, `SarakFilterSelect`, `SarakStats`). **Não tem** a camada
  entre o átomo e o template: o cabeçalho de página, a barra de filtros, o segmentado, a seção, a linha de recurso e o par rótulo-valor.
  É essa lacuna que faz cada tela ter o próprio ritmo.
- Decisão do dono (2026-10-23): tudo que deixar a lib "mais mastigada" para o importador vale; a plan foi aprovada.
- As peças usam os papéis de cor (título, subtítulo, destaque), o piso de 11 px e o degrau de título de cartão que a `plan-123` criou
  (aprovada e sintetizada em 2026-10-24): hoje em [[02-design-engine]] §10.3.

# 3. Escopo

## 3.1 Dentro
- Componentes novos (nomes finais conforme a convenção de prefixo e a taxonomia da [[03-superficie-publica]] §4.3/§6; o executor
  decide o lugar pela §3.1 dela — **na raiz da categoria**, para os gates enxergarem):
  - **cabeçalho de página** — título (h1), subtítulo, área de ações primária/secundária, trilha opcional (`SarakBreadcrumbs` existente),
    e o reflow no celular;
  - **barra de filtros / ferramentas** — agrupa busca, selects, segmentado e ações, com espaçamento do tema, quebra controlada e o
    botão "limpar filtros" opcional;
  - **controle segmentado** — escolha única entre poucas opções (`radiogroup` acessível), com o contrato de valor dos átomos de escolha
    ([[03-superficie-publica]] §6.4);
  - **seção** — título (degrau de seção), descrição, ações e conteúdo, com o ritmo vertical do tema; variante em cartão;
  - **linha de recurso** — título, selos, pares rótulo-valor, ações e a linha inteira clicável quando houver destino, com alvo de toque
    e foco visíveis; vira cartão empilhado no celular;
  - **par rótulo-valor** (lista de descrição) — rótulo no piso de legibilidade, valor no papel de texto certo, em linha ou empilhado,
    em grade responsiva.
- Os tokens que essas peças precisarem (só se nenhum existente servir; cada um com leitor, teste e paridade), e o valor nos 19 temas
  se forem estéticos.
- O barril, o catálogo gerado, o kit (`sarak-ui/GUIA-FRONTEND.md` — os moldes "tela de lista" e "tela de detalhe" e a árvore de decisão
  §0.1), a skill `ui-integra-consumidor` no que ela espelha do kit, `docs/migracoes.md` (`## 8.0.0`).
- Testes; casos em `browser-tests/` com uma cena de lista e uma de detalhe montadas só com as peças.

## 3.2 Fora
- Mudar `SarakTable`, `SarakCardGrid`, `SarakForm` ou os templates de dado existentes além de reutilizá-los.
- Roteamento, busca de dado, paginação no servidor — continuam do host ([[03-superficie-publica]] §6.3).
- O ERP: nenhuma linha (a migração das telas é da campanha do ERP, depois da rc.3).
- Specs fixas (síntese do revisor); versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/03-superficie-publica.md` (§2, §3.1, §4.3, §6, §6.1, §6.1.1, §6.3, §6.4, §6.9) | barril, onde o componente mora, prefixo, taxonomia, composição atômica, dado do host, contrato de valor, campos |
| Spec fixa | `arquitetura/02-design-engine.md` (§10, §10.15) | o que o token desenha; estético × funcional |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` (§6, §6.1) | reflow por contêiner |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | alvo de toque, foco, papéis ARIA, textos pelo i18n |
| Spec fixa | `specs/12-kit-do-consumidor.md` (§2, §2.2, §3) | o kit não se escreve à mão onde muda; reuso, não reimplementação |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R40-R44) | leitor, cascata, variável com um dono, cor do tema |
| Spec fixa | `arquitetura/02-design-engine.md` (§10.3) | os papéis de cor de texto, o piso de 11 px e o degrau de título de cartão que as peças usam |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-novo-componente` (componente novo no barril, catálogo e paridade) · `ui-integra-consumidor` (o kit) · `ui-criar-tema` (só se nascer token estético) | escrita, testes, componente, kit, tema |
| Código | `src/components/atomic/Layouts/`, `src/components/atomic/Cards/`, `src/components/atomic/Navigation/` (`SarakTabs`, `SarakBreadcrumbs`), `src/components/atomic/Feedback/` (`SarakEmptyState`, `SarakSkeleton`), `src/components/atomic/Templates/SarakFilterSelect.tsx`, `src/components/atomic/Templates/SarakTableCards.tsx` | o que reutilizar antes de criar |

# 5. Instruções de execução

**Dois lotes**, na ordem; cada um fecha com resumo na §9 e status 🟠.

**Lote 1 — as seis peças.**
1.1. Antes de criar, listar no resumo o que cada peça reutiliza (átomo existente) e por que não basta usar o átomo direto.
1.2. Criar as seis peças da §3.1, cada uma composta dos átomos existentes, com ritmo (gap, padding) e tipografia vindos de tokens,
`className` do chamador vencendo o padrão ([[03-superficie-publica]] §6.1.1), textos pelo i18n, reflow por contêiner.
1.3. Estados: o cabeçalho e a seção aceitam carregando (esqueleto); a lista de linhas de recurso aceita vazio (via `SarakEmptyState`),
carregando e erro — o importador não escreve nenhum dos três (`sarak-ui/GUIA-FRONTEND.md` §3.4).
1.4. Acessibilidade: cabeçalho com um único h1; seção com o nível de título configurável; segmentado como `radiogroup` com setas;
linha de recurso com um único destino focável e ações secundárias alcançáveis por teclado; alvo de toque ≥ o token `touchTargetMin`.
1.5. Testes por peça; `barrel:check`, `catalog:check`, prefixo e paridade verdes.

**Lote 2 — moldes e kit.**
2.1. Duas cenas em `browser-tests/` — lista e detalhe — escritas só com peças do barril, sem estilo próprio. Medir, em três temas e a
390, 1280 e 2560 px: espaçamentos entre blocos iguais aos tokens; nenhum texto que se lê abaixo do piso de 11 px ([[02-design-engine]] §10.3); nenhum
transbordamento horizontal; alvo de toque das ações ≥ 24 px.
2.2. O kit ganha os dois moldes (o código das cenas como exemplo copiável, gerado ou verificado pelo `guide:check`, nunca transcrito à
mão) e a árvore de decisão aponta "cabeçalho de página / filtros / lista de registros / detalhe" para as peças.
2.3. Nota em `docs/migracoes.md`: o que o importador troca (estrutura feita à mão → peça), com o "de/para".

# 6. Critérios de aceite

- [ ] Seis peças no barril e no catálogo, cada uma composta de átomos existentes, com teste.
- [ ] Estados vazio, carregando e erro entregues pela lib nas peças de lista e seção.
- [ ] Acessibilidade: h1 único, `radiogroup` com teclado, destino único por linha, alvo de toque.
- [x] Cenas de lista e detalhe só com peças, medidas em três temas e três larguras sem transbordamento nem texto abaixo do piso.
- [x] Kit com os dois moldes verificados por gate; nota de migração.
- [ ] `barrel:check`, `catalog:check`, `guide:check`, prefixo, paridade e suíte completa verdes.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — as peças entram nos gates de barril, catálogo, prefixo e kit que já existem.

- Lote 1: `npm run verify -- --tier=schema-meta` (ou `quick`, se não nascer token); vitest das peças.
- Lote 2: `npm run build` + as duas cenas novas em `browser-tests/`; `npm run guide:check`.
- Fechamento: `npm run verify -- --tier=full` e a bateria inteira do navegador.
- Leitura: as duas cenas sem `style=`/classe própria nem tag estrutural crua com estilo.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md + specs/12-kit-do-consumidor.md + arquitetura/02-design-engine.md`

- **`03` §6:** a camada de composição de página (as seis peças, o que cada uma garante, a regra "página se escreve com peças").
- **`12`:** os moldes de lista e de detalhe e como o gate os mantém verdadeiros.
- **`02` §10:** os tokens de ritmo que as peças leem, se nascerem.

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-24

**Resultado:** Bloqueado

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- `SarakPageHeader.tsx:18` — criei cabeçalho com título, subtítulo, trilha, áreas de ação e esqueleto; reutilizei `SarakBreadcrumbs` e `SarakSkeleton`, pois nenhum átomo isolado reúne essa hierarquia nem garante o único h1.
- `SarakFilterBar.tsx:15` — criei grupo responsivo de controles, ações e limpeza; reutilizei `SarakButton` para limpar. `SarakFilterSelect` atende um select por coluna, não compõe a barra inteira.
- `SarakSegmentedControl.tsx:22` — criei `radiogroup` controlado ou não, com setas, Home/End e opção desabilitada; reutilizei `SarakButton`. `SarakTabs` usa `tablist` e não atende a semântica de rádio.
- `SarakSection.tsx:30` — criei título com nível configurável, variante em cartão e estados; reutilizei `SarakCard`, `SarakAlert`, `SarakEmptyState` e `SarakSkeleton`, que isoladamente não compõem a seção com título e ações.
- `SarakResourceRow.tsx:26` — criei linha com destino único e ações separadas; reutilizei `SarakCard`, `SarakBadge`, `SarakLink`, `SarakButton` e `SarakDescriptionList`, pois cada átomo isolado cobre apenas moldura, selo, link, botão ou metadado.
- `SarakDescriptionList.tsx:13` — criei pares semânticos `<dt>/<dd>` com grade que se ajusta à largura disponível. **Pendente:** esta peça ainda não compõe `SarakGrid` ou outro átomo de layout.
- `Templates/index.ts:19-24` — exportei as seis peças e seus tipos pelo barril da categoria.
- Criei seis arquivos de teste, um por peça.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Templates/SarakPageHeader.tsx` | criado | Cabeçalho, ações, breadcrumb e estado carregando. |
| `src/components/atomic/Templates/SarakFilterBar.tsx` | criado | Grupo de filtros, ações e limpar filtros. |
| `src/components/atomic/Templates/SarakSegmentedControl.tsx` | criado | Radiogroup controlado/não controlado com teclado. |
| `src/components/atomic/Templates/SarakSection.tsx` | criado | Seção configurável, cartão e estados. |
| `src/components/atomic/Templates/SarakResourceRow.tsx` | criado | Linha com link único, selos, dados e ações. |
| `src/components/atomic/Templates/SarakDescriptionList.tsx` | criado | Pares rótulo-valor em `<dl>`. |
| `src/components/atomic/Templates/index.ts` | alterado | Exports das seis peças. |
| `src/components/atomic/Templates/__tests__/SarakPageHeader.test.tsx` | criado | h1 único e carregamento. |
| `src/components/atomic/Templates/__tests__/SarakFilterBar.test.tsx` | criado | Grupo nomeado e ação limpar. |
| `src/components/atomic/Templates/__tests__/SarakSegmentedControl.test.tsx` | criado | Teclado, opção desabilitada e valor controlado. |
| `src/components/atomic/Templates/__tests__/SarakSection.test.tsx` | criado | Nível do título, cartão e estado vazio. |
| `src/components/atomic/Templates/__tests__/SarakResourceRow.test.tsx` | criado | Destino único e ação separada. |
| `src/components/atomic/Templates/__tests__/SarakDescriptionList.test.tsx` | criado | Associação entre termo e valor. |
| `specs/plan/plan-126-pecas-de-composicao-de-pagina.md` | alterado | Este resumo e status 🟠. |

**Verificações executadas**
- Primeira tentativa de `npx vitest run` nos seis testes → bloqueada antes de iniciar por `EPERM` ao gravar o temporário do Vitest em `node_modules/.vite-temp`.
- `npx vitest run --maxWorkers=1 src/components/atomic/Templates/__tests__/SarakPageHeader.test.tsx src/components/atomic/Templates/__tests__/SarakFilterBar.test.tsx src/components/atomic/Templates/__tests__/SarakSegmentedControl.test.tsx src/components/atomic/Templates/__tests__/SarakSection.test.tsx src/components/atomic/Templates/__tests__/SarakResourceRow.test.tsx src/components/atomic/Templates/__tests__/SarakDescriptionList.test.tsx` → 6 arquivos passaram, 9 testes passaram; duração informada: 141,62 s.
- `git status --short` antes da edição → `(limpo)`.
- `git status --short` após os testes → mostrou `src/core/Design/schema/navigation.ts` modificado, além dos arquivos listados acima. Esse arquivo pertence ao trabalho paralelo informado da plan-124; parei conforme o ritual do executor. Não toquei nele.
- Não rodei `barrel:check`, `catalog:check`, prefixo, paridade ou `verify`; não regenerei artefatos compartilhados após a alteração paralela aparecer.

**Critérios de aceite**
- [ ] Seis peças no barril e no catálogo, cada uma composta de átomos existentes, com teste — os exports da categoria e os testes existem; o catálogo não foi regenerado, e `SarakDescriptionList` ainda precisa compor um átomo de layout.
- [ ] Estados vazio, carregando e erro entregues pela lib nas peças de lista e seção — a `SarakSection` contém os caminhos; só o estado vazio da seção e o carregamento do cabeçalho foram cobertos por teste.
- [ ] Acessibilidade: h1 único, `radiogroup` com teclado, destino único por linha, alvo de toque — testes cobrem h1, teclado e link; o alvo `touchTargetMin` não foi verificado por gate ou medição.
- [ ] Cenas de lista e detalhe só com peças, medidas em três temas e três larguras sem transbordamento nem texto abaixo do piso — pertence ao lote 2, não iniciado.
- [ ] Kit com os dois moldes verificados por gate; nota de migração — pertence ao lote 2, não iniciado.
- [ ] `barrel:check`, `catalog:check`, `guide:check`, prefixo, paridade e suíte completa verdes — gates pendentes; não rodei suíte completa.

**Decisões e suposições**
- Aloquei as peças em `Templates/`, a categoria da taxonomia para composição de tela.
- Como a lista não é uma das seis peças nomeadas, a `SarakSection` recebe `emptyState`, `loading` e `error` quando envolver linhas de recurso. Essa interpretação precisa ser confirmada pelo revisor.
- Não criei tokens. Usei tokens de espaçamento e tipografia já presentes nas peças lidas; a reserva de 24 px para `touchTargetMin` ainda precisa ser conferida com o contrato do token.

**Achados fora do escopo (não corrigidos)**
- `src/core/Design/schema/navigation.ts` — apareceu modificado depois da fotografia inicial e pertence à plan-124, conforme informado pelo usuário; não alterei.

**Pendências / riscos**
- A execução parou antes dos gates porque a alteração da plan-124 apareceu após a fotografia, conforme a regra de worktree compartilhado do executor.
- Falta compor `SarakDescriptionList` com átomo de layout e validar os estados de carregamento/erro da seção.
- Faltam regeneração do catálogo, gates do lote 1 e validação do `touchTargetMin`. Nenhuma peça do lote 2 foi iniciada.

---

# 10. Veredito

## Veredito — 2026-10-24 — lote 1 — 🔴 Reprovado (lote incompleto; 4 achados)

A parada não era necessária: o prompt avisou que a `plan-124` roda em paralelo no cromo (`schema/navigation.ts` é dela), então a
alteração que apareceu é a esperada — não é motivo de bloqueio. Seguir o lote 1 até o fim, sem tocar nos arquivos da `plan-124`.

Decisão do revisor sobre a dúvida registrada: **sim**, os estados vazio, carregando e erro da lista de linhas de recurso moram na
`SarakSection` (não há componente de lista entre as seis peças); o critério do passo 1.3 vale para ela.

Conferido no worktree: as seis peças existem em `Templates/`, exportadas; `barrel:check` (108, 0 faltas) e `prefix:check` verdes; testes
focados 9/9. Falta:

1. `variable-contract:check` vermelho por duas razões: `SarakSegmentedControl.tsx:96` usa `var(--sarak-touch-target-min, 24px)`,
   reserva diferente do padrão do token (44 px) — R42; e `--sarak-layout-gap-xs` é lido 5× (`SarakResourceRow.tsx:64,66,73`,
   `SarakSection.tsx:59`) mas nenhum token, CSS ou código o escreve — variável fantasma (R43). Usar um token de espaçamento que
   exista, com a reserva igual ao padrão dele.
2. `SarakDescriptionList` não compõe átomo de layout (o próprio resumo registra): a grade responsiva vem de `SarakGrid`/`SarakFlex`
   (critério "cada peça composta de átomos existentes", passo 1.2).
3. Testes que faltam (passos 1.3-1.5): carregando e erro da `SarakSection`; alvo de toque — o destino da `SarakResourceRow`, as
   ações e as opções do segmentado medem pelo menos `touchTargetMin`.
4. Gates e gerados do lote: `npm run catalog` no fim; `catalog:check`, `barrel:check`, `prefix:check`, `variable-contract:check`,
   `token-reader:check` e os testes das seis peças verdes, com as saídas coladas.

## Resumo da correção do lote 1 — 2026-10-24

**Resultado:** Corrigidos os quatro achados; entregue para revisão. O contrato de variáveis continua vermelho por três reservas em
arquivos do cromo alterados pela plan-124 em paralelo, preservados conforme instrução do usuário.

**Estado do worktree ao iniciar a correção**
- Já modificados: `specs/00-indice.md`, esta plan, `src/components/Layout/chrome/chromeStructuralStyles.ts`,
  `src/components/Layout/chrome/useChromeDesignTokens.ts`, `src/components/atomic/Navigation/SarakMenuItem.tsx`,
  `src/components/atomic/Templates/index.ts`, `src/core/Design/schema/__tests__/preferences.test.ts`,
  `src/core/Design/schema/navigation.ts` e `src/core/Design/schema/preferences.ts`.
- Já não rastreados: as seis peças e os seis testes do lote 1; `src/core/Provider/useNavigationAppearance.ts`.
- Os arquivos de cromo, navegação, schema e provider pertencem ao trabalho paralelo da plan-124. Não alterei nenhum deles.

**Correções dos achados**
1. Removi todas as leituras de `--sarak-layout-gap-xs`, que não existe, e usei o espaçamento `spacing-xs` equivalente a
   `calc(var(--sarak-layout-gap-sm, 8px) * 0.5)`. Os alvos da linha de recurso e as opções do segmentado usam
   `var(--sarak-touch-target-min, 44px)`, a reserva padrão do token.
2. `SarakDescriptionList` agora usa `SarakGrid` como malha responsiva, preservando a semântica `<dl>/<dt>/<dd>`. Também substituí
   os layouts crus sinalizados no cabeçalho, seção e linha de recurso por `SarakFlex`/`SarakGrid`; a linha não usa mais breakpoint
   arbitrário de 640 px.
3. A `SarakSection` tem testes para carregamento, erro e acionamento de tentar novamente. Os testes da linha e do segmentado
   verificam a reserva `touchTargetMin` no destino, nas ações e em todas as opções.
4. Regenerei o catálogo depois das alterações finais e rodei os gates específicos. As saídas estão abaixo.

**Arquivos alterados nesta correção**
- `src/components/atomic/Templates/SarakPageHeader.tsx`, `SarakSegmentedControl.tsx`, `SarakSection.tsx`,
  `SarakResourceRow.tsx` e `SarakDescriptionList.tsx`.
- Testes de `SarakSegmentedControl`, `SarakSection`, `SarakResourceRow` e `SarakDescriptionList`.
- `docs/component-catalog.json` e `docs/component-catalog.md`, gerados por `npm run catalog`.
- Esta plan: status `🟠 Em revisão` e este resumo append-only. Não alterei `docs/migracoes.md`, tokens nem kits.

**Checks do achado 4**
```text
Testes focados: Test Files 6 passed (6); Tests 11 passed (11).
npm run catalog: [catalog] 108 componentes → docs/component-catalog.{json,md}
npm run catalog:check: [catalog:check] catálogo em dia.
npm run barrel:check: [barrel:check] 108 componentes registrados; barril em dia (0 faltas).
npm run prefix:check: [prefix:check] 383 nomes exportados seguem a convenção; allowlist em dia.
npm run token-reader:check: [OK] Todo valor emitido tem leitor.
npm run variable-contract:check: [ERROR] 3 reservas diferentes do padrão do token:
  - components/Layout/chrome/ChromeSlots.tsx:62 var(--sarak-sidebar-brand-color, #f2f6fb)
    — padrão: var(--sarak-on-sidebar, #f2f6fb)
  - components/atomic/Navigation/SarakShellNav.tsx:160 var(--sarak-sidebar-brand-color, #f2f6fb)
    — padrão: var(--sarak-on-sidebar, #f2f6fb)
  - components/atomic/Navigation/SarakShellNav.tsx:199 var(--sarak-sidebar-category-color, rgba(242,246,251,0.385))
    — padrão: var(--sarak-on-sidebar, rgba(242,246,251,0.385))
```

`variable-contract:check` não aponta variável fantasma nem reserva incorreta nas seis peças. Os três apontamentos acima são em
arquivos da plan-124 e ficaram fora desta correção. O auditor de hardcode também deixou de apontar as peças: 0 violações estruturais;
os 6 hardcodes restantes são em `SarakMenuItem.tsx` e `SarakAppChromeMobile.tsx` da plan-124.

**Verificação rápida**
- `npm run verify -- --tier=quick`: `npx tsc --noEmit` passou; o comando terminou com 7 verificações externas falhando:
  `audit:baseline` (alterações da plan-124 em hardcodes, variáveis-fantasma, arquivo grande e paridade), `token-types:check` e
  `theme-completeness:check` (schema da navegação ainda sem os artefatos/valores correspondentes), `variable-contract:check`
  (três reservas acima), `check-trail-citation` (teste de navegação da plan-124), `guide:check` e `dev-kit:check` (kits ainda
  defasados). Os demais checks listados pela verificação passaram. Não rodei `npm run build`.

**Critérios do lote 1**
- [x] Seis peças exportadas e catalogadas, compostas com átomos existentes e cobertas por testes focados.
- [x] Estados vazio, carregando e erro na `SarakSection`, com teste para cada caminho e callback de repetição.
- [x] h1 e radiogroup com teclado cobertos pelos testes anteriores; alvo mínimo do destino, ações e opções ligado ao token e coberto.
- [ ] Cenas de lista e detalhe em três temas e larguras — lote 2, não iniciado.
- [ ] Moldes do kit e nota de migração — lote 2, não iniciado.
- [ ] Gates todos verdes — os gates do achado 4 foram executados; só `variable-contract:check` permanece vermelho por alterações
  da plan-124 fora do escopo.

**Decisão aplicada e pendências**
- A `SarakSection` é dona dos estados vazio, carregando e erro da lista de linhas de recurso, conforme a decisão do revisor no
  veredito de 2026-10-24.
- Nenhuma peça ou artefato do lote 2 foi iniciado. A verificação do navegador não foi executada; pertence ao revisor.

## Veredito — 2026-10-24 — correção 1 (lote 1) — 🟢 Aprovado; lote 1 fechado

Conferência objetiva dos 4 achados (a bateria completa fica para o fim da onda, junto com a `plan-124`):

1. `variable-contract:check` → nenhuma ocorrência em `Templates/`; as 3 restantes são de `ChromeSlots.tsx`/`SarakShellNav.tsx`, da
   `plan-124` em andamento. `SarakSegmentedControl.tsx:96` e `SarakResourceRow.tsx:54,78` usam `var(--sarak-touch-target-min, 44px)`;
   `--sarak-layout-gap-xs` saiu.
2. `SarakDescriptionList` compõe `SarakGrid` (`SarakDescriptionList.tsx:2,19`).
3. Testes das seis peças → 6 arquivos, 11 testes (rodado pelo revisor), com os estados da seção e o alvo de toque.
4. `catalog:check` em dia (rodado pelo revisor); o executor colou `barrel:check`, `prefix:check` e `token-reader:check` verdes.

## Resumo da execução — 2026-10-24

**Resultado:** lote 2 entregue para revisão. As duas cenas usam somente peças do barril público; os moldes entram no kit e na árvore
de decisão do guia, e a migração foi registrada em `docs/migracoes.md`. O estado geral da plan fica `🟠 Em revisão` porque a bateria
completa não foi rodada e há gates globais fora deste lote.

**Estado ao iniciar e fronteiras**
- Conforme informado pelo usuário, o lote 1 desta plan e o lote 1 da plan-124 já estavam aprovados e não commitados. Não refiz nem
  alterei as seis peças de `src/components/atomic/Templates/`.
- `git status --short` e os checks que dependem de `git diff` não são executáveis neste ambiente: o Git retorna
  `fatal: this operation must be run in a work tree`. O estado inicial foi registrado conforme a informação do usuário; o revisor
  confere o diff.
- Não alterei temas, cromo, navegação, schemas de navegação ou qualquer arquivo da fronteira atribuída à plan-124.
- Não rodei `npm run build`.

**Entregas do lote 2**
- `browser-tests/tela-lista.scene.tsx` e `browser-tests/tela-detalhe.scene.tsx`: moldes de lista e detalhe, compostos com peças do
  barril público e sem estilo próprio.
- `browser-tests/composition-scenes-entry.tsx`, `composition-scenes.spec.ts` e `composition-scenes.config.ts`: harness Playwright
  isolado; testa as duas cenas nos temas `sarak-sovereign`, `cyberpunk-neon` e `minimalist-airy`, nas larguras 390, 1280 e 2560 px.
- `browser-tests/build-harness.mjs`: opção para alias do barrel ao `src/index.ts`; o harness mantém CSS compilado numa pasta
  temporária e não gera `dist/`.
- `scripts/consumer-kit/buildKitOutputs.mjs` e `kitFiles.mjs`: os moldes são cópias geradas em `sarak-ui/templates/` e entram no
  `guide:check`.
- `sarak-ui/GUIA-FRONTEND.md`: árvore §0.1 e índice §4 apontam para os dois moldes. `docs/migracoes.md`: de/para da composição
  manual para as seis peças. `npm run guide` atualizou as cópias do kit.
- Nenhum teste ou código novo cita uma plan (R36).

**Cena e ajuste encontrado**
- A primeira medição da lista mostrou 10,5 px no rótulo de um `SarakBadge` em tamanho padrão. O molde usa `size="sm"`, que mantém
  esse texto no piso de 11 px. Não foi necessário corrigir qualquer peça aprovada do lote 1.

Saídas do harness, coladas da execução final:

```text
CENA lista | tema sarak-sovereign | largura 390px | gap-token 24px | blocos 24px,24px,24px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA lista | tema sarak-sovereign | largura 1280px | gap-token 36px | blocos 36px,36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA lista | tema sarak-sovereign | largura 2560px | gap-token 36px | blocos 36px,36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA lista | tema cyberpunk-neon | largura 390px | gap-token 24px | blocos 24px,24px,24px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA lista | tema cyberpunk-neon | largura 1280px | gap-token 36px | blocos 36px,36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA lista | tema cyberpunk-neon | largura 2560px | gap-token 36px | blocos 36px,36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA lista | tema minimalist-airy | largura 390px | gap-token 24px | blocos 24px,24px,24px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA lista | tema minimalist-airy | largura 1280px | gap-token 36px | blocos 36px,36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA lista | tema minimalist-airy | largura 2560px | gap-token 36px | blocos 36px,36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA detalhe | tema sarak-sovereign | largura 390px | gap-token 24px | blocos 24px,24px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA detalhe | tema sarak-sovereign | largura 1280px | gap-token 36px | blocos 36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA detalhe | tema sarak-sovereign | largura 2560px | gap-token 36px | blocos 36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA detalhe | tema cyberpunk-neon | largura 390px | gap-token 24px | blocos 24px,24px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA detalhe | tema cyberpunk-neon | largura 1280px | gap-token 36px | blocos 36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA detalhe | tema cyberpunk-neon | largura 2560px | gap-token 36px | blocos 36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA detalhe | tema minimalist-airy | largura 390px | gap-token 24px | blocos 24px,24px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA detalhe | tema minimalist-airy | largura 1280px | gap-token 36px | blocos 36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
CENA detalhe | tema minimalist-airy | largura 2560px | gap-token 36px | blocos 36px,36px | texto mínimo 11px | overflow 0px | alvos pequenos 0 | OK
2 passed (36.6s)
```

**Geração do guia**

```text
npm run guide
[guide] sarak-ui/ gerado — 111 componentes, 434 tokens de tema, 117 ícones (kitHash 676209e78aac).

npm run guide:check
[guide:check] kit em dia (9 arquivos).
```

**Verificações**
- `npx tsc --noEmit`: passou.
- Validador AST TypeScript/JavaScript: 10 arquivos do escopo, 0 achados.
- `barrel:check`, `catalog:check`, `prefix:check`, `token-reader:check`, `guide:check`, `dev-kit:check` e os demais gates
  individuais listados como `[OK]` pelo `verify --tier=quick` passaram.
- `theme-completeness:check` pertence à plan-124. Neste `verify` retornou `[OK]`; não alterei temas nem tratei esse gate como escopo
  desta plan.
- `kit-names:check` ficou vermelho porque `dist/index.d.ts` ainda não contém os exports das peças do lote 1; atualizar `dist/`
  exigiria o `npm run build` proibido pelo usuário.
- `check-trail-citation`: **não executável aqui — revisor roda**; o gate depende de `git diff` e o Git deste ambiente não reconhece
  o diretório como worktree.
- `audit:baseline` e `npm run audit` continuam vermelhos por achados fora do lote 2: seis hardcodes, 15 consumos de variáveis-fantasma,
  o tamanho de `SarakAppChromeMobile.tsx` e a paridade dos novos campos do schema de navegação pertencem à plan-124. A auditoria
  atômica também apontou `<input>` cru em `SarakMultiSelect.tsx` e `SarakUploader.tsx`, fora deste escopo. Não alterei esses arquivos.
- `npm run verify -- --tier=quick`: falha nos três gates acima (`audit:baseline`, `kit-names:check` e `check-trail-citation`);
  os demais checks exibidos passaram. A suíte completa não foi executada.

**Fechamento do lote 2**
- [x] Cenas de lista e detalhe medidas nos três temas e nas três larguras, com espaçamento pelo token, texto ≥11 px, sem overflow e
  alvos medidos em botões, âncoras e opções segmentadas ≥24 px.
- [x] Moldes gerados no kit, apontados pelo guia e conferidos por `guide:check`; nota de migração registrada.
- [ ] Bateria completa e todos os gates globais verdes — continuam para revisão após a plan-124 e a atualização dos artefatos de
  distribuição; os checks que dependem de `git diff` ficam para o revisor.

## Veredito — 2026-10-24 — lote 2 — 🟢 Aprovado; plan concluída

Conferência objetiva, rodada pelo revisor: `guide:check` (9 arquivos), `barrel:check` (108, 0 faltas), `catalog:check`, `prefix:check`
(383) e `trail-citation:check` verdes; a auditoria completa não acusa nada em `Templates/` nem nas cenas. O executor colou as 18
combinações das cenas de lista e detalhe (3 temas × 390/1280/2560 px × 2 telas): espaço entre blocos igual ao token, texto ≥ 11 px, sem
transbordamento e alvos de toque no piso; os moldes estão no kit. A bateria completa do fim da onda roda as cenas de novo com o `build`;
se elas falharem lá, esta plan reabre.
