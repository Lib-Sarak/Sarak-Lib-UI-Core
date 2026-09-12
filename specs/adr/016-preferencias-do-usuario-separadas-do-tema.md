---
tipo: "adr"
titulo: "Preferência do usuário é uma camada separada do tema — sobreposta ao renderizar, nunca gravada nele"
status: "🟢 Aceito"
tags: ["adr", "preferencias", "persistencia", "design-engine", "superficie-publica", "major"]
relacionados: ["[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[05-cromo-e-slots]]", "[[009-persistencia-tenant-aware]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "Preferência dentro do tema (o modelo anterior)"
    custo: "Nenhuma superfície nova. Mas o tema é persistido sozinho e o host o grava num lugar só: um clique de um usuário — trocar o modo, recolher a navegação — reescreve o sistema de todos. Foi medido no único consumidor real."
  - opcao: "Um tema clonado por usuário"
    custo: "Isola as escolhas, mas multiplica temas por usuários, e toda edição do administrador deixa de chegar a quem já clonou — o tema do sistema deixa de existir na prática."
  - opcao: "Camada de preferências sobreposta ao tema (ESCOLHIDA)"
    custo: "É MAJOR: os alternadores da barra deixam de mudar o tema do sistema. Cria superfície pública permanente — um hook e uma porta opcional do host. E passa a haver duas fontes para entender o que está na tela: o tema e a preferência de quem olha."
---

# 1. Contexto e Problema

Decidido com o dono em **2026-09-11**; implementado e aprovado em **2026-09-12**.

O dono quis que o usuário final personalizasse a barra — claro/escuro, tamanho da fonte, navegação no topo
ou na lateral, idioma —, com uma regra de acesso: *"apenas o administrador terá acesso à aba de
personalização, o usuário final apenas utilizará o que foi configurado"*.

A lib não tinha onde guardar isso. Tudo era `design` — o tema —, e o `design` é **persistido sozinho**:
toda mudança chega ao `localStorage` e à porta `onSave` do host sem ação de ninguém. O único consumidor
real liga essa porta a uma gravação do design inteiro no **tema único do sistema**. Consequência medida:
um usuário alternando o modo, ou recolhendo a navegação, mudava o sistema de **todos**; o tema salvo no
servidor carregava escolhas feitas por uma pessoa em teste.

Pôr mais preferências na barra sobre esse modelo multiplicaria o problema.

# 2. Decisão

**Tema e preferência são estados distintos.** O tema é do administrador e do sistema inteiro; a
preferência é de cada usuário. O que os componentes recebem é o **design efetivo** — o tema com as
preferências oferecidas aplicadas por cima. **Só o tema é persistido como tema**; o painel de
personalização edita o tema, nunca o design efetivo de quem o está usando.

**O tema decide o que é oferecido**, por token de tema — um por preferência, com três posições: não
oferecida, no menu, fixa na barra. Por ser token, a escolha do administrador é persistida pelo mesmo
caminho do resto do tema, sem o host mudar nada. **Chave ausente vale o padrão de fábrica do token**, nunca
*oferecida*: um design que chega sem essas chaves não abre nada que o administrador não abriu.

**A preferência é guardada por usuário**: no `localStorage`, com chave própria isolada por tenant, gravada
**no ato** e sincronizada entre abas; e, se o host quiser, numa porta opcional própria. A lib não conhece o
usuário — quem associa a preferência a ele é o host, pela porta.

**A troca de modo mexe só nas chaves que carregam modo.** Três regras fecham o comportamento, e cada uma
veio de um defeito medido durante a implementação:

1. o modo pedido igual ao modo atual do design **não muda nada** — a personalização do administrador fica;
2. mudando de modo, as chaves que a contraparte declara vêm da contraparte, no modo oposto ao nativo, ou do
   próprio tema, no nativo — **qualquer que seja o modo em que o tema foi salvo**;
3. todo o resto é o design atual do tema.

# 3. Consequências

- **Positivas:**
  - A escolha de um usuário não alcança mais ninguém, nem o tema do servidor.
  - O administrador controla o que a barra oferece, e o controle sobrevive a recarregamento pelo caminho
    que o tema já tinha.
  - O host que quiser preferência por usuário no servidor tem uma porta pronta; o que não quiser tem o
    comportamento correto sem escrever nada.

- **Negativas (Trade-offs):**
  - **MAJOR**: quem usava o alternador de modo ou o de recolher para mudar o sistema passa a usar o painel.
  - **Duas fontes para o que está na tela.** Um relato de *"a tela está diferente"* pode ser tema ou
    preferência de quem relata — diagnóstico precisa olhar os dois.
  - **A troca de modo substitui as chaves de modo que o administrador personalizou**, quando o usuário pede
    o modo oposto: a contraparte é um conjunto fixo de valores. É a mesma limitação que o painel já aceitava
    ao trocar de modo, e o motivo de a regra 1 existir.
  - No `localStorage`, a preferência é por **navegador**, não por pessoa: num computador compartilhado, as
    pessoas compartilham a preferência até o host usar a porta.
