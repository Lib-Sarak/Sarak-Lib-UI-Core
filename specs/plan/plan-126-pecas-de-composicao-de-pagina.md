---
tipo: "plan"
titulo: "Entregar as pecas que compoem uma pagina para o importador nao montar a estrutura a mao"
objetivo: "Fazer o importador montar uma tela de lista e uma tela de detalhe so com pecas da lib, cabecalho de pagina, barra de filtros, controle segmentado, secao, linha de recurso e par rotulo-valor, com o ritmo, a hierarquia e os estados vindos do tema, e o kit ensinando os dois moldes"
dominio: "Componentes / Composição de página / Kit do consumidor"
status: "🟡 Em execução"
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
- [ ] Cenas de lista e detalhe só com peças, medidas em três temas e três larguras sem transbordamento nem texto abaixo do piso.
- [ ] Kit com os dois moldes verificados por gate; nota de migração.
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

---

# 10. Veredito
