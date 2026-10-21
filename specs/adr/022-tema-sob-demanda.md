---
tipo: "adr"
titulo: "Os temas embarcados são carregados sob demanda — o boot leva só o tema padrão, e a UX não muda"
status: "🟢 Aceito"
tags: ["adr", "temas", "bundle", "lazy", "provider", "superficie-publica"]
relacionados: ["[[09-temas-e-presets]]", "[[02-design-engine]]", "[[03-superficie-publica]]", "[[05-build-e-distribuicao]]", "[[00-regras-e-invariantes]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "A — o consumidor importa o tema por nome e o passa em customThemes"
    custo: "o peso só some se o bundler do consumidor fizer DCE por export (o CJS e o consumidor sem tree-shaking carregam todos); colide com a regra de fronteira lazy da superfície pública ([[03-superficie-publica]] §7.1: valor exportado ao lado de uma fronteira import() a anula); initialTheme=\"<id embarcado>\", o caminho que a spec 09 recomenda, passa a ser id inexistente em silêncio"
  - opcao: "C — o Provider espera sempre, sem pré-carregamento"
    custo: "é a B sem saída: todo consumidor com tema não-padrão passa pelo fallback no primeiro quadro, para sempre"
  - opcao: "Pintar o padrão e trocar quando o tema chegar"
    custo: "é o flash que [[02-design-engine]] §3.2 registra como erro — a tela mostra um tema e troca para outro"
  - opcao: "Um .css por tema"
    custo: "o motor escreve as variáveis a partir do estado (design), não de folha; o tema precisa estar como dado no estado para o painel, a contraparte e a persistência"
---

# 1. Contexto e Problema

**Data da decisão: 2026-10-14 (decisão do dono, alternativa B), executada pela `plan-116`.**

O `SarakUIProvider` arrastava o catálogo inteiro de temas embarcados para o boot de todo consumidor, por dois caminhos
independentes do barril público (`useThemeCollection` e `useDesignManager` importavam o array). Medido no bundler de um
consumidor mínimo: os temas custavam ~12 KB gzip do boot (~0,93 KB gzip cada, e não os ~2,5 KB do arquivo-fonte), e a
`plan-110` (todo token estético explícito nos dois papéis, 19 temas) os leva à ordem de 27–40 KB gzip. Todo consumidor
pagava por temas que não usa.

Além do peso, o desenho antigo carregava dois defeitos: o tema padrão apontava para um id que não existe (`'classic'`,
que caía no primeiro tema em silêncio) e a troca de tema aplicava `{ ...anterior, ...tema }`, de modo que o token que o
tema novo não declara **herdava o valor do tema anterior** e a tela passava a depender da ordem das escolhas.

# 2. Decisão

**O boot leva só o tema padrão (`SARAK_DEFAULT_THEME_ID = 'sarak-sovereign'`); os demais temas chegam por `import()`
quando são escolhidos — e a interface não muda.**

- **Carregador assíncrono com cache síncrono.** `sarakLoadThemePreset(id)`, `sarakPreloadThemes(ids)` e
  `sarakLoadAllThemePresets()` populam um cache em memória que o Provider lê no inicializador do estado, sem efeito.
  A lista (nome, modo, amostra de cor `swatch`/`swatchOpposite`) é o catálogo leve `SARAK_THEME_CATALOG`, **gerado**
  dos próprios temas (`npm run themes:catalog`, conferido no build) — o metadado nunca é escrito à mão.
- **A UX fica como era.** O primeiro acesso abre no tema padrão, que está no boot; ao escolher outro, **o atual
  continua na tela até o novo chegar** (nunca tela vazia, nunca fallback); o tema aplicado fica salvo e, no acesso
  seguinte, pinta direto do `design` guardado, sem carregar nada e sem passar pelo padrão.
- **A porta de espera só existe quando o consumidor força, por código, um tema embarcado que não está em memória**
  (`initialTheme`/`activeThemeId`/`options.theme.defaultTheme`) e não há `design` salvo que pinte sozinho. Ali o
  Provider segura a aplicação e mostra `loadingFallback` (nada, por padrão) por um `import()` curto; o consumidor que
  quer zero espera chama `await sarakPreloadThemes([...])` antes do render. A porta fecha **uma vez**: depois do
  primeiro quadro, uma troca por código nunca desmonta a aplicação.
- **Id inexistente é decidido sem rede**, no primeiro quadro: aviso nomeando o id e o tema padrão no modo pedido
  (a contraparte autorada). `options.theme.defaultTheme` inexistente também avisa.
- **Troca de tema nunca herda token do tema anterior.** Uma só função, `composeThemeDesign`, parte do padrão de todo
  token do schema, preserva só o que não é do tema (identidade do host e o modo do usuário) e aplica o tema resolvido
  para o modo. É chamada pelo Provider (`useDesignSync`) e pela prévia do painel (`useDesignDraft`) — duas portas, um
  resolvedor.
- **O catálogo inteiro é só de ferramenta.** `themes/all.ts` (a lista estática) fica fora do barril; gates e testes
  que iteram o catálogo importam dele. O produto não alcança esse módulo.
- **Duas travas** impedem o retorno: a **estrutural** (`theme-boot:check` — nenhum tema além do padrão, nem `all.ts`,
  no fecho estático do entry em `src/` e no `dist/`) e a **medida** (`boot:measure` — o boot do consumidor cabe em:
  o boot com só o tema padrão e sem catálogo, medido na mesma execução, + o catálogo + 3 KB). Cada tema embarcado
  tem teto de 3 KB gzip.

# 3. Consequências

- **Positivas:**
  - O boot de todo consumidor deixa de pagar por temas que ele não usa, e cada tema novo (a `plan-110`) custa zero
    ao boot.
  - A lista de temas do seletor e do painel nasce completa, na hora, sem carregar nenhum `design`.
  - Acabam o `'classic'` fantasma e a herança de token entre temas.
- **Negativas (Trade-offs):**
  - **Contrato público muda (MAJOR na 8.0.0):** `SARAK_GLOBAL_THEMES` e `sarakGetThemePreset` saem; `allThemes`
    passa a trazer só os temas com `design` em memória (a lista de tudo é `themeCatalog`);
    `sarakDeriveThemeFromReference` aceita o id do tema padrão ou um preset já carregado; `SARAK_REFERENCE_THEMES`
    é só a referência escura — o par claro vem de `sarakLoadReferenceThemes()`.
  - **A única concessão de UX:** sem pré-carregar, o consumidor que força por código um tema não-padrão vê o
    `loadingFallback` por um `import()` em vez de "o primeiro quadro já é a aplicação".
  - **SSR não espera o `import()`:** o servidor renderiza o `loadingFallback` até o consumidor pré-carregar o tema
    antes de `renderToString`.
  - O teto relativo tem 3 KB de folga: um tema isolado que volte ao boot cabe nela; é a trava estrutural que o pega.
  - Trocar de tema deixa de preservar customização solta que o tema não declara (volta ao padrão do schema).
- **Voltar atrás seria caro:** o consumidor passa a depender de `sarakLoadThemePreset` e do catálogo leve; reverter
  seria outra MAJOR.
