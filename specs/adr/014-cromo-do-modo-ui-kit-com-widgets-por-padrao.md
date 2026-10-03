---
tipo: "adr"
titulo: "O cromo do modo ui-kit nasce com os widgets montados, e o consumidor desliga o que não quiser"
status: "🟢 Aceito"
tags: ["adr", "cromo", "zero-config", "widgets", "superficie-publica"]
relacionados: ["[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[arquitetura/01-forma-do-produto-e-modos-de-consumo]]", "[[arquitetura/03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "Opt-in — cada widget liga por uma prop explícita"
    custo: "Nenhuma quebra para quem já integrou. Mas uma linha de integração em todo consumidor, para sempre, para ter o cromo completo — contradiz o zero-config que a base já decidiu duas vezes, e mantém a lib entregando menos do que tem."
  - opcao: "Default com opt-out — os widgets nascem montados (ESCOLHIDA)"
    custo: "É MAJOR: muda a tela de todo consumidor existente sem ele tocar em nada, e quem já montava tema/usuário à mão passa a vê-los em dobro até desligar o default. Reverter seria outro MAJOR, mais caro a cada consumidor que passar a depender do default."
---

# 1. Contexto e Problema

Decidido pelo dono em **2026-09-09**; implementado e aprovado em **2026-09-10**.

O dono comparou um sistema antigo, integrado pelo modo módulos-plugin (`SarakShell`), com o sistema atual,
integrado pelo modo ui-kit (`SarakAppChrome`), e concluiu: *"o sistema atual recebeu evoluções funcionais e
está muito mais robusto, porém na prática a usabilidade e a experiência ficaram piores"*. Um dos sintomas
nomeados foi *"o campo de busca não aparece"*.

A causa não era defeito, era ausência de decisão. O `SarakShell` sempre entregou busca, alternância de
tema, usuário e colapso prontos. O `SarakAppChrome` nasceu para fechar um sintoma pontual — *"topbar e
sidebar não aparecem"* — como o mínimo para o cromo existir, e virou o cromo do único consumidor vivo sem
nunca ter sido comparado com o que substituía. Os widgets eram públicos; montá-los era trabalho do
consumidor, e ninguém o fazia.

A base já tinha respondido a mesma pergunta duas vezes, no mesmo sentido:
[[07-responsividade-e-multidispositivo]] §1 — layout multidispositivo é **por padrão**, e exigir trabalho do
consumidor para o comportamento correto é bug da lib; e os hosts de toast e overlay nascem montados pelo
`SarakUIProvider`. O cromo era a única superfície que ainda exigia montagem manual.

# 2. Decisão

**O `SarakAppChrome` nasce com quatro widgets montados** — busca (com o atalho Ctrl/Cmd+K), alternância de
tema, widget de usuário e colapso da navegação —, e o consumidor desliga cada um, isolado, pela prop
`widgets` (`{ search?, themeToggle?, user?, collapse? }`: omitido = ligado, só `false` desliga).

**Um widget default só monta quando tem com o que funcionar.** Esta é a regra que a implementação ensinou,
e ela vale para qualquer default futuro do cromo:

- nenhum monta fora do `SarakUIProvider` — todos dependem do estado do Design Engine;
- a busca é alimentada pela **própria navegação** do cromo e seleciona pelo mesmo `onNavigate` que o host
  já entrega — o modo ui-kit não tem registro de módulos para buscar;
- o widget de usuário só monta quando o host entrega `user`, e o botão de sair só existe com `logout` — a
  lib não conhece o usuário ([[10-seguranca-e-acessibilidade]] §3.1) e não inventa identidade;
- o atalho de teclado só é escutado quando a busca default está de fato em uso.

**O conteúdo do consumidor vence o default que corresponde a ele.** Com o slot `search` preenchido, a busca
inteira é do consumidor — gatilho, palette e atalho. Tema e usuário **não têm slot**: nascem numa região
própria, fora do contrato de slots, para não quebrar o *"slot ausente = região não renderiza"*
([[05-cromo-e-slots]] §2.2).

**Fora do default, por decisão:** seletor de idioma, redimensionamento por arraste e auto-hide. Continuam
disponíveis por slot, prop ou token — cada um é superfície pública permanente, e são refinamento.

# 3. Consequências

- **Positivas:**
  - Quem instala a lib e declara marca e navegação recebe o cromo completo, sem escrever mais nada.
  - O cromo do modo ui-kit passa a exibir o mesmo conjunto acionável do modo módulos-plugin, e o preview
    do painel deixa de mostrar um sistema que o consumidor não tem.
  - A regra *"só monta quando tem com o que funcionar"* impede que um default vire controle morto — o
    padrão que motivou a campanha: funcionalidade que existe e não está ligada.

- **Negativas (Trade-offs):**
  - **MAJOR.** A tela de todo consumidor muda sem ele tocar em nada; a nota de migração ensina a voltar ao
    cromo vazio.
  - **Duplicação para quem já monta tema/usuário à mão**: como esses dois não têm slot, o conteúdo manual do
    consumidor não os substitui — ele precisa desligar o default. Documentado na migração; o custo
    alternativo era dar precedência a `topbarEnd`/`sidebarFooter`, e aí qualquer botão posto ali apagaria
    tema e usuário sem aviso.
  - **Paridade incompleta, declarada:** o `SarakAppChrome` não implementa o modo `dock` nem o sino de
    notificações do Shell; a busca do **Shell** lista módulos, mas os resultados ainda não levam a lugar
    nenhum ([[00-backlog]]).
