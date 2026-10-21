---
tipo: "adr"
titulo: "A lib embarca as próprias fontes e as carrega sob demanda — o Google Fonts deixa de ser o padrão e vira opção do host"
status: "🟢 Aceito"
tags: ["adr", "fontes", "tipografia", "bundle", "privacidade", "lgpd", "provider"]
relacionados: ["[[09-temas-e-presets]]", "[[05-build-e-distribuicao]]", "[[10-seguranca-e-acessibilidade]]", "[[12-kit-do-consumidor]]", "[[022-tema-sob-demanda]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "Manter o Google Fonts como padrão (o comportamento até a 7.x: @import da folha css2 com todas as famílias e preconnect para fonts.googleapis.com e fonts.gstatic.com)"
    custo: "toda visita entrega o IP do usuário final a um terceiro (transferência que o host tem de declarar na LGPD); offline, ou com o domínio bloqueado, todo tema cai na fonte de reserva; o host precisa liberar os dois domínios em font-src/style-src. O que ela poupava era o peso: zero byte de fonte no pacote, contra ~1,7 MB embarcados"
  - opcao: "Embarcar com os arquivos inlinados em base64 no CSS da lib"
    custo: "o CSS da lib é injetado como string dentro do JS (scripts/inject-css.mjs), então os ~1,7 MB entrariam no boot de todo consumidor, inclusive as famílias que o tema não usa; anula o carregamento sob demanda que o boot exige (theme-boot:check, boot:measure)"
  - opcao: "Deixar o consumidor importar @fontsource por conta própria"
    custo: "a fonte deixa de seguir o tema: o importador tem de saber, para cada tema e cada troca, quais famílias importar, e importa todas para não errar; a lista de famílias passa a viver em dois lugares (o schema e o código do importador), e o painel oferece famílias que o host pode não ter carregado"
---

# 1. Contexto e Problema

**Data da decisão: 2026-10-15 (decisão do dono), executada pela `plan-118` (lotes 1 a 5, até 2026-10-16).**

As fontes da lib vinham do Google Fonts em runtime: `useSarakUIEffects` injetava um `<style>` com `@import` da URL
`css2` (montada por `googleFontsUrl.ts` com toda família de `THEME_FONTS`) e dois `<link rel="preconnect">`. Três
custos medidos ou lidos no código:

- **Privacidade:** cada visita expõe o IP do usuário final a um terceiro, e o host passa a ter de declarar essa
  transferência e de liberar os domínios do Google na política de segurança de conteúdo.
- **Disponibilidade:** offline, ou com o domínio bloqueado, todo tema cai na fonte de reserva (achado A11 do anexo de
  direção da `plan-110`).
- **Catálogo travado:** temas pediam famílias que a lista não tinha (Orbitron, Chakra Petch, VT323, Fira Code — achado
  A6), e crescer a lista só aumentava a folha que o Google servia a todos.

O desenho tinha uma restrição de build: o CSS da lib é injetado como string no JS, então um `url(...)` relativo nele
resolveria contra a página, não contra o `dist/`.

# 2. Decisão

**A lib entrega as próprias fontes e o Provider carrega só as famílias que o tema no ar usa; a origem é escolha do
host.**

- **O pacote leva `dist/fonts/`:** 41 famílias (as 19 de antes, com o mesmo `value`, mais 22), woff2, subconjunto
  `latin`, só o eixo `wght` das variáveis e só os pesos com arquivo das estáticas; `manifest.json` e
  `THIRD-PARTY-FONTS` (licença e crédito de cada família, todas redistribuíveis: SIL OFL 1.1 e Apache 2.0). Tudo
  gerado de `THEME_FONTS` pelo passo `fonts:embed`; o gate `fonts:check` (no `build`, no Anel 1 e na CI) cobra
  arquivo, licença e orçamento (3 MB no total, 150 KB por família). Medido: 60 arquivos, 1.690.020 B.
- **Carga em runtime, sob demanda.** Um `@font-face` por família em uso (título, corpo, mono e a fonte do logo),
  injetado uma vez, com `font-display: swap`; o arquivo é resolvido por um `new URL('./fonts/<arquivo>',
  import.meta.url)` **literal por arquivo**, no módulo gerado a partir do manifesto (o único formato que o Vite em dev
  reescreve). Nada em base64.
- **`options.fonts`:** `'bundled'` (padrão) · `{ baseUrl }` (bundler que não reescreve o `new URL`, como esbuild puro
  e CJS no navegador, ou CDN própria) · `'google'` (o comportamento anterior, opt-in explícito) · `'none'` (o host
  carrega). Sem rede de terceiros com `'bundled'` e `'none'`, nem `preconnect`.
- **Falha nunca é silenciosa:** a família que não carrega gera um aviso que a nomeia, com a origem tentada e a dica do
  `baseUrl`; a página segue com a genérica da pilha.
- **O catálogo é o ponto de partida, não o teto:** o host registra famílias próprias em `options.fonts.custom`
  (nome e URL validados; a lib não copia os arquivos), que o carregador e o painel tratam como as da lib. Registrar
  não muda o que o tema aceita — a pilha de fontes segura continua valendo.
- **Modo Embarcado:** sem `options.embedded.injectGlobalFonts` a ilha não carrega fonte nenhuma; fonte é recurso do
  documento.

# 3. Consequências

- **Positivas:**
  - Nenhuma requisição a terceiros para desenhar texto no padrão: sai a transferência de IP ao Google, a tipografia
    funciona offline e a política de segurança de conteúdo do host fica em `font-src 'self'`.
  - O catálogo cresceu de 19 para 41 famílias sem custo para o boot: o navegador só baixa a família em uso.
  - A licença de cada família viaja com os arquivos, gerada dos pacotes, sem texto à mão.
- **Negativas (Trade-offs):**
  - **~1,7 MB a mais no pacote**, e no `vite build` do importador os 60 arquivos viram assets (em disco; o navegador
    só baixa os usados).
  - **Contrato muda (MAJOR na 8.0.0):** o padrão deixa de ser o Google; quem tinha os domínios dele em `font-src`, ou
    usa esbuild puro ou CJS no navegador, tem de agir (`baseUrl`). Nota em `docs/migracoes.md`.
  - O boot leva o carregador, o manifesto e o registro das fontes do host (medido em 2026-10-16: `boot:measure`
    331,6 KB gzip contra o teto relativo de 334,3 KB). A folga do teto encolheu para ~2,7 KB.
  - `latin-ext` ficou de fora (+882 KB): `ẞ` e `Ÿ` caem na fonte do sistema por glifo. O manifesto guarda o
    subconjunto como campo para entrar depois sem MAJOR.
  - Os eixos `opsz`, `wdth`, `SOFT` e `WONK` não entram, e os pesos que uma estática não tem são sintetizados pelo
    navegador: o tema escolhe pesos que a família tem.
  - Duas ilhas que registram o **mesmo nome** de família com arquivos diferentes disputam o `@font-face` do documento;
    o primeiro vence.
- **Voltar atrás seria caro:** o importador passa a depender de `options.fonts` e da pasta `fonts/` no pacote;
  devolver o Google ao padrão seria outra MAJOR e reabriria a transferência de dados que esta decisão fechou.
