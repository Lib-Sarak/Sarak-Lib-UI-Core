---
tipo: "adr"
titulo: "Item de navegação é átomo próprio, não variante do botão de ação"
status: "🔴 Substituído"
tags: ["adr", "atomos", "cromo", "navegacao", "superficie-publica"]
relacionados: ["[[00-regras-e-invariantes]]", "[[05-cromo-e-slots]]", "[[04-shell-e-discovery]]", "[[arquitetura/03-superficie-publica]]"]
substitui: ""
substituido_por: "[[015-metrica-do-item-de-navegacao-horizontal]]"
alternativas_consideradas:
  - opcao: "Um size/variante de cromo dentro do SarakButton"
    custo: "Nenhuma superfície pública nova — mas o átomo de AÇÃO passaria a carregar um conceito de NAVEGAÇÃO, e toda correção futura de menu viraria uma variante de botão. O acoplamento é permanente e cresce a cada ajuste."
  - opcao: "Um átomo próprio, SarakMenuItem (ESCOLHIDA)"
    custo: "Superfície pública permanente (barril, catálogo, tipo Props, cobertura 1:1, paridade) e uma isenção @sarak-encapsula a mais. Reverter é MAJOR: minor-no-removal:check barra remoção de nome do barril em minor."
---

# 1. Contexto e Problema

A **R10** proíbe `<button>` cru no que o consumidor embute, e `src/core/**` está dentro da fronteira dela.
O cromo — sidebar, topbar, drawer — foi então convertido para consumir `SarakButton`/`SarakIconButton`, os
átomos de **ação**.

Item de menu e botão de ação não têm a mesma métrica. O átomo de ação nasce com tipografia de botão
(`font-black uppercase tracking-widest`) e, no tamanho default, recuo de formulário (`py-4 px-6`). Numa
sidebar de 240px, esse recuo consome quase um quarto da largura útil e dobra a altura da linha. Cada
chamador do cromo passou a **desfazer** o default do átomo pelo `className` — e o que ele não desfazia
(recuo, peso) chegava à tela.

O problema não é o valor de uma classe: é **um átomo servindo a dois papéis**. Enquanto for o mesmo
componente, cada ajuste de menu é um ajuste no botão de ação, e vice-versa.

# 2. Decisão

**Item de navegação passa a ter átomo próprio: `SarakMenuItem`**
(`src/components/atomic/Navigation/SarakMenuItem.tsx`), com métrica de navegação e não de ação. Os
renderizadores de navegação do cromo o compõem, em vez de compor `SarakButton`.

A métrica **difere por orientação**, e essa distinção é a decisão em si — não um detalhe:

- **`vertical`** — linha de lista (sidebar, drawer): recuo, peso e caixa de menu, largura cheia resolvida
  **na origem** (nunca emite piso de `min-width`), rótulo que trunca em vez de transbordar.
- **`horizontal`** — aba compacta (topbar): pílula, caixa alta, peso forte.

A **R10 permanece intacta**: o átomo declara `@sarak-encapsula button` com razão escrita, que é a forma de
isenção por **papel** vigente desde a troca de fronteira — nenhuma pasta foi isentada, nenhuma allowlist
ampliada.

**O critério que sustenta a escolha:** a fronteira da R10 é por **papel**, não por pasta. Item de navegação
não é botão de ação — é exatamente a distinção que a fronteira por papel existe para expressar. Resolver
isso com uma variante dentro do átomo de ação contradiz a própria régua que tornou a R10 verificável.

> **Nota de nomenclatura (2026-09-08).** O átomo nasceu chamado `SarakNavItem` e foi renomeado para
> `SarakMenuItem` **antes de existir em qualquer tag**: o nome antigo colidia com o **tipo** `SarakNavItem`
> (a forma do dado de `navItems`), e em ES/TS o export explícito do tipo sombreava o `export *` do
> componente — o átomo era inalcançável pelo barril. A **decisão** deste ADR não mudou; mudou o símbolo
> escolhido para encarná-la, e o registro fica aqui para o ADR não parecer reescrito.

# 3. Consequências

- **Positivas:** a métrica de navegação deixa de depender de cada chamador desfazer o default do átomo de
  ação — ela nasce certa e é testável num lugar só. Ajuste de menu deixa de tocar o botão de ação. O átomo
  de ação para de acumular conceitos que não são dele.
- **Negativas (trade-offs):**
  - **Superfície pública permanente.** O nome e o tipo entram no barril, no catálogo gerado e na paridade;
    cobertura 1:1 passa a exigir teste próprio. **Reverter é MAJOR** — `minor-no-removal:check` barra
    remoção de nome do barril em minor.
  - **Uma isenção `@sarak-encapsula` a mais.** Cada isenção é uma linha a menos de cobertura da R10, e o
    marcador isenta o **arquivo inteiro** (limite declarado do próprio gate).
  - **Mudança de comportamento default, sem opt-in.** O cromo de todo consumidor troca de métrica; para
    quem compõe `SarakShellNav` em topbar, o rótulo passa a ser renderizado em caixa alta. A saída existe
    e é a regra geral — a `className` do chamador vence o default do átomo —, mas a mudança é visível sem
    ninguém pedir. Registrada em `docs/migracoes.md` como **MAJOR**.
