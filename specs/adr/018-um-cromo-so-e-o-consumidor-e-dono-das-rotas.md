---
tipo: "adr"
titulo: "Um cromo só — o consumidor é dono das rotas, e a lib não é host"
status: "🟢 Aceito"
tags: ["adr", "arquitetura", "modos-de-consumo", "cromo", "shell", "ui-kit"]
relacionados: ["[[005-modelo-modulos-plugin-e-apps-separados]]", "[[014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]", "[[016-preferencias-do-usuario-separadas-do-tema]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[05-cromo-e-slots]]", "[[03-superficie-publica]]"]
substitui: "[[005-modelo-modulos-plugin-e-apps-separados]]"
substituido_por: ""
alternativas_consideradas:
  - opcao: "Manter os dois cromos e portar defeito a defeito do `SarakShell` para o `SarakAppChrome` (e o contrário)"
    custo: "Trabalho dobrado permanente: toda correção de cromo se faz duas vezes, e o gate de paridade de tokens precisa cobrar dois grupos de consumidores para sempre. Os defeitos que o Shell já tinha (topbar que vaza, sem navegação no tablet, gaveta do celular sem ESC e foco, logo fixo, sino sem ação) ficariam como dívida de um modo que nenhum consumidor da geração atual usa"
  - opcao: "Transformar o `SarakShell` numa camada fina sobre o `SarakAppChrome`, mantendo o registro de módulos, o Discovery e o roteador próprio"
    custo: "Preservaria o modelo host sem custo de cromo, mas manteria 740 linhas de Discovery e o roteador que escreve na URL (`history.pushState`) para um modo sem consumidor atual — e o registro global, que dá à lib um papel de dona das rotas que a fronteira layout × look nega"
---

# 1. Contexto e Problema

**Data da decisão: 2026-10-02 e 2026-10-03 (dono). Implementada e aprovada em 2026-10-05.**

O [[005-modelo-modulos-plugin-e-apps-separados]] reconheceu **dois** modos de consumo: o *Shell-host* (a lib é dona do
layout e das rotas) e o *ui-kit + central* (o consumidor é dono). Os dois pintavam o **mesmo cromo** a partir dos mesmos
tokens, em duas implementações: `src/core/Shell/` (14 arquivos, 1.270 linhas) e `src/components/Layout/` (17 arquivos,
1.497 linhas), mais `src/core/Discovery/` (8 arquivos, 740 linhas) para o registro de módulos.

O que a medição de 2026-10-02 mostrou:

- **Nenhum sistema da geração atual usava o Shell.** O ERP e o `login-completo` usam o `SarakAppChrome`; o Cripto tem
  roteador próprio. Só o legado `Novo` (uma versão de junho da lib) montava o `SarakShell`.
- **O Shell tinha defeitos que o `SarakAppChrome` já não tinha**: topbar com `w-full` somado à margem (vaza), sem navegação
  no tablet em modo topbar, gaveta do celular sem ESC e sem foco, logo `"S"` fixo e sino decorativo sem ação.
- **O preview do painel de temas desenhava a barra do Shell**, não a do cromo que os sistemas reais usam — o administrador
  configurava uma barra e o usuário final via outra.
- **O `sarak-ui init` gerava um app de modo host** (`SarakShell` + registro de módulos), o contrário do que a lib recomenda.

# 2. Decisão

**A lib tem um cromo só, o `SarakAppChrome`, e deixa de ser host.** O consumidor monta o cromo, fornece os `navItems` e
controla as próprias rotas (`onNavigate`); a lib não registra módulos, não descobre módulos e não escreve na URL.

- **Saem** o `SarakShell`, o Discovery (`registerSarakModule`, `sarakRegisterLocalComponent`, `sarakGetLocalComponent`,
  `useModuleDiscovery`, `SarakDynamicRenderer`…), o `useSarakRouter` e o registro global — **22 nomes do barril**, todos
  na nota `8.0.0` de `docs/migracoes.md`.
- **Ficam e passam a ser do cromo único** os widgets (`SarakShellSearchWidget`, `SarakShellUserWidget`,
  `SarakShellLanguageSelector`, `SarakShellThemeToggle`, `SarakShellNav`, `SarakMenuItem`), que sempre foram componentes
  públicos montáveis em slot.
- **O preview do painel desenha o `SarakAppChrome`**, e o `sarak-ui init` gera um app com ele e roteamento do próprio app.
- **O modo "ui-kit + central" do 005 é o único modo de consumo.** O que o 005 decidiu sobre ele — o cromo por-app, a central
  que alcança todas as telas por código compartilhado mais `localStorage`, o limite de mesma origem — **continua vigente**.

Junto com a remoção, o cromo único passou a ser o que o modo host prometia ser, **para todo consumidor**: barra completa por
padrão (todo widget nasce `pinned`, e a composição é do **sistema**, nunca do tema), widget que depende do importador
aparece **desabilitado** até ele o ligar, e o item de navegação é um **link de verdade**.

# 3. Consequências

- **Positivas:**
  - **Um cromo, um conjunto de defeitos, um consumidor por token.** O gate de paridade de cromo cobra um grupo.
  - **A lib cumpre o que a fronteira layout × look diz:** o importador possui o layout e as rotas; a base possui o look.
  - **Preview e produto mostram a mesma barra.**
  - **Menos superfície a manter:** 22 nomes saem do barril, e `src/core/Shell/` e `src/core/Discovery/` deixam de existir.

- **Negativas (Trade-offs):**
  - **É MAJOR (`8.0.0`).** Quem montava `SarakShell` migra para `SarakAppChrome` + `navItems`; a nota de migração tem o
    antes e o depois de cada nome.
  - **O legado `Novo` precisa migrar** — é o único consumidor que usava o modo host.
  - **O modo `dock` de navegação e o redimensionar por arraste saem** e não têm substituto — o dono não os pediu; se fizerem
    falta, voltam por demanda. **Limite registrado:** a opção `dock` do token `navigationStyle` continua oferecida pelo
    schema e o cromo a trata como sidebar; é dívida declarada no [[00-backlog]].
  - **A lib deixa de ser a única dona da URL**, o que também significa que **não há mais "navegação gratuita"**: quem não
    passa `onNavigate` recebe âncoras que o navegador segue.

> **Escopo:** este ADR substitui **só** o recorte do 005 que fazia da lib o host — o modo Shell-host e o registro. O restante
> do 005 (apps separados, a central, a propagação de tema) continua vigente; leia os dois juntos. A implementação é a `plan-94`.
