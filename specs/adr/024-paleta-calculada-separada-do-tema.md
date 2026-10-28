---
tipo: "adr"
titulo: "A cor sai do tema: uma paleta calculada a partir de uma cor e de um tipo de harmonia, nos dois modos"
status: "🟢 Aceito"
tags: ["adr", "paletas", "cores", "design-engine", "temas", "contraste"]
relacionados: ["[[09-temas-e-presets]]", "[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[10-seguranca-e-acessibilidade]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "Paleta como bloco de valores autorados por modo — cada paleta escreve à mão os tokens de cor do modo escuro e do claro, como os temas fazem com design e contraparte"
    custo: "cerca de 75 cores × 2 modos escritas e revisadas à mão por paleta; a hierarquia de título, subtítulo e texto continua sem regra comum, decidida paleta a paleta (o defeito que o dono apontou na rc.3); a criação de paleta pelo usuário fica inviável, porque ninguém escreve 150 valores coerentes num painel"
  - opcao: "Derivar o modo oposto da paleta existente por inversão de luminosidade (o caminho de syncThemeWithMode/shiftColorMode)"
    custo: "já medido e descartado na contraparte dos temas (09 §2.1): a inversão força faixas fixas de luminosidade e toda paleta converge para a mesma neutra; a ida e volta não é exata. Resolveria o trabalho manual e quebraria a identidade de cor"
---

# 1. Contexto e Problema

Até a rc.3 cada tema escrevia suas cores à mão, em `design` e no bloco do modo oposto (`contraparte`). A cor ficava
presa ao tema — não se usavam as cores de um tema com a estrutura de outro — e a hierarquia tipográfica de cor
(título, subtítulo, texto, texto apagado) era decidida tema a tema, sem regra comum. O dono pediu, sobre a rc.3,
paletas prontas e reutilizáveis entre temas, com o par claro/escuro coerente, mantendo o ajuste granular de cada token.

# 2. Decisão

**A paleta é só a entrada de um cálculo fixo:** `{ tipo, base, sec?, acc? }`. O token de tema `colorPalette` guarda o id
de um preset embarcado ou `custom:<tipo>:<#base>[,sec=<#hex>][,acc=<#hex>]`, e o motor (`src/core/Design/palette/`)
deriva dele todos os tokens de cor:

1. **Sementes** — primária = base; secundária e acento informados ou girados pelo tipo (`monochromatic`, `analogous`,
   `complementary`, `split-complementary`, `triadic`); neutro com o matiz da base e croma quase zero; status com matiz fixo.
2. **Escalas** — 11 tons por semente em OKLCH, com uma régua de luminosidade e uma curva de croma comuns a todas.
3. **Mapa de papéis** — uma tabela única token → tom, por modo.
4. **Correção de contraste** — cada par que a tela desenha (a mesma lista que o `auditor_contraste` mede) é levado ao
   mínimo andando o tom na escala; determinístico.

A cor declarada explicitamente (tema, `config` do host, ajuste do usuário) vence a calculada. Não há edição manual de tons:
a curadoria escolhe entradas, não resultados. O preset embarcado e a paleta criada pelo usuário passam pelo mesmo cálculo.

# 3. Consequências

- **Positivas:** uma paleta são dois a quatro valores; qualquer cor de entrada gera uma tela legível nos dois modos, o que
  abre a criação pelo usuário sem porta nova (o valor vai no tema salvo); a hierarquia de cor tipográfica tem uma regra só;
  melhoria na regra chega a todas as paletas; tema sem `colorPalette` compõe exatamente como antes.
- **Negativas (Trade-offs):** toda a qualidade visual depende da regra do cálculo — uma paleta que fica feia não se conserta
  num tom, só trocando a entrada ou ajustando a cor explícita por cima; harmonias calculadas de algumas cores-base
  combinam mal, e a única defesa é a prévia; voltar atrás exigiria reescrever presets, painel e o formato do token, que já
  está em temas salvos.
