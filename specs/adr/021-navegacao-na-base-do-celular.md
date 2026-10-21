---
tipo: "adr"
titulo: "No celular, a navegação vai para uma barra na base quando cabe — auto por padrão, configurável pelo tema"
status: "🟢 Aceito"
tags: ["adr", "cromo", "mobile", "navegacao", "token", "toque"]
relacionados: ["[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]", "[[014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "Manter a gaveta para toda navegação no celular"
    custo: "a navegação mais usada fica escondida atrás do hambúrguer, no canto superior — o ponto mais difícil de alcançar com o polegar numa pegada de uma mão; o escondido é esquecido"
  - opcao: "Token mobileNavigationStyle só como opção, com a gaveta como padrão"
    custo: "quem não configura continua no pior caso; o padrão da lib deixa de ser o certo para o caso comum (3 a 5 destinos)"
---

# 1. Contexto e Problema

**Data da decisão: 2026-10-10 (decisão do dono, opção c), executada pela `plan-109` em 2026-10-11.**

No celular, o `SarakAppChrome` virava barra + hambúrguer + drawer, e a navegação morava **dentro** do drawer, junto
com os widgets e os slots de sidebar. A avaliação contra um material de design system para mobile apontou o custo:
quase metade das pessoas usa o celular com uma mão só, a zona natural do polegar é a base da tela, e a borda da tela
é um alvo "infinito" na direção dela (lei de Fitts). O padrão recomendado é **barra na base para 3 a 5 destinos
frequentes**; a gaveta serve a muitos destinos raros.

O token `navigationStyle` ainda oferecia `dock` ("barra inferior, híbrida"), que nenhum cromo implementava desde que
o `SarakShell` saiu — oferta sem consumidor no painel.

# 2. Decisão

**O token `mobileNavigationStyle` (`auto` · `bottom` · `drawer`) decide onde a navegação mora no celular, e o padrão
é `auto`:** barra fixa na base quando o cromo tem até **5** itens de navegação, gaveta acima disso. `bottom` e
`drawer` forçam. O token é do tema — o administrador o escolhe no painel, ao lado do `navigationStyle`.

Com a barra ativa, a navegação sai do drawer; o hambúrguer e o drawer continuam com os widgets e os slots de sidebar
(nenhum slot nem widget é descartado — [[05-cromo-e-slots]] §2.3). A barra é irmã do painel de conteúdo na coluna do
cromo: nunca cobre o conteúdo, respeita a área segura do aparelho e tem a área tocável do token `touchTargetMin`.

A opção `dock` sai do `navigationStyle`; valor salvo `dock` continua lido como `sidebar`.

# 3. Consequências

- **Positivas:**
  - O caso comum (3 a 5 destinos) passa a ter a navegação sempre visível e na zona do polegar, sem o consumidor
    escrever nada.
  - O painel deixa de oferecer uma opção sem consumidor (`dock`).
- **Negativas (Trade-offs):**
  - **Muda o visual do celular de quem atualiza** e tem até 5 itens — a mudança sai como MAJOR na 8.0.0
    ([[03-versionamento-e-release]] §3).
  - Mais um modo de cromo para manter e medir (`browser-tests/navegacao-na-base.spec.ts`).
  - Com o slot `footer` em uso, ele fica abaixo da barra (é a última faixa do cromo).
- **Voltar atrás seria caro:** o padrão vira hábito do usuário final e contrato visual dos consumidores; trocar de
  novo seria outra MAJOR e outra reeducação.
