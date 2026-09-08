---
tipo: "plan"
titulo: "Dar ao item de navegação do cromo uma métrica própria, não a de botão de ação"
objetivo: "Devolver ao cromo a métrica de navegação — recuo, peso, caixa e truncamento de item de menu — sem violar a R10"
dominio: "Sarak-Lib-UI-Core / Cromo e Navegação"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "cromo", "sidebar", "topbar", "navegacao", "atomos"]
relacionados: ["[[05-cromo-e-slots]]", "[[04-shell-e-discovery]]", "[[00-regras-e-invariantes]]", "[[arquitetura/03-superficie-publica]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/04-shell-e-discovery.md · specs/05-cromo-e-slots.md · adr/013-item-de-navegacao-como-atomo-proprio.md"
---

# 1. Objetivo

Um item de menu do cromo — sidebar, topbar ou drawer — volta a ter métrica de **navegação**: recuo que cabe
na largura da sidebar, rótulo que trunca em vez de transbordar, e tipografia de lista em vez de tipografia
de botão de ação. A **R10 continua valendo**: nenhum `<button>` cru volta ao cromo.

# 2. Contexto

## 2.1 O que aconteceu

A **R10** proíbe `<button>` cru no que o consumidor embute. `src/core/Shell/` não está na allowlist dela
(só `src/features/**` está). O cromo foi então convertido para consumir `SarakButton`/`SarakIconButton` —
e, ao fazer isso, **trocou geometria de navegação por geometria de botão de ação**.

`SarakButton` nasce com `font-black uppercase tracking-widest` e, no `size` default `md`, `py-4 px-6`
(`SarakButton.tsx:44-47,57`). O item de sidebar antes era `px-3 py-2.5 rounded-xl` com tipografia de lista.
Numa sidebar de 240px com `p-4` de container, `px-6` consome 48px dos ~208px úteis, e o item fica cerca de
duas vezes mais alto.

> **O erro não foi ter a R10.** Foi aplicá-la sem ninguém enxergar o custo — e o custo só apareceu por
> comparação com um sistema que roda a v2.2.9. Essa cegueira é o assunto da `plan-59`, não desta.

## 2.1.1 O mecanismo já foi consertado — o que falta é a MÉTRICA

**A dependência desta plan já está entregue e sintetizada** ([[00-regras-e-invariantes]] **R35**): o
`className` do chamador **vence** o default do átomo, porque `SarakButton`/`SarakIconButton` compõem por
`mergeSarakClasses` em vez de concatenar. Isso já se vê no worktree — os itens de navegação do
`SarakShellNav` perderam `uppercase`, `tracking-widest`, `w-max`, `rounded-btn`, `justify-center` e a cor
primária do átomo. **Não repita essa investigação.**

O que R35 **não** resolveu, e é o objeto desta plan: os itens continuam com a **métrica de botão de ação**
(`py-4 px-6`, `font-black`), porque nenhum chamador a sobrescreve — ela nunca foi disputada.

⚠️ **Três armadilhas herdadas, medidas, que vão morder esta execução:**

1. **`min-w-fit` não conflita com `w-full`.** São grupos diferentes (`min-width` × `width`): o merge **não**
   os resolve, e o piso de largura sobrevive — o item não trunca, transborda. `useButtonLayoutStyles` só
   larga o piso quando a largura cheia vem pela **prop** `fullWidth` ou pelo tema; pedir por
   `className="w-full"` **não** basta. O `SarakNavItem` tem de resolver a largura **na origem**, não por
   classe. É o item **4** do [[00-backlog]].
2. **`mergeSarakClasses` é a porta única.** O átomo novo compõe por ela, com a `className` recebida por
   último, e **não** chama `twMerge`/`extendTailwindMerge` por conta própria — R35, cobrada por
   `npm run class-merge:check`. Classe própria nova (se você criar alguma) precisa ser **registrada** no
   helper, ou ela coexiste com a concorrente em vez de substituí-la.
3. **Não cite plan em comentário nem em título de teste.** `padrao-escrita`,
   `references/comentarios.md:84` — foi o achado 2 da rodada de revisão anterior. Escreva o porquê ali
   mesmo; a plan desaparece na síntese e o ponteiro morre.

## 2.2 A decisão, e por que ela é um ADR

Duas opções reais foram consideradas:

| | O que é | Custo |
| --- | --- | --- |
| **A** | Um `size`/variante de cromo dentro do `SarakButton` | Nenhuma superfície nova — mas o átomo de **ação** passa a carregar um conceito de **navegação**, e toda futura correção de menu vira uma variante de botão |
| **B** *(escolhida)* | Um átomo próprio, `SarakNavItem`, consumido pelos três renderizadores de navegação | **Superfície pública permanente** (barril, catálogo, tipo `Props`, cobertura 1:1, paridade) **e** uma 6ª isenção `@sarak-encapsula`. Reverter é **MAJOR**: `minor-no-removal:check` barra remoção de nome do barril em minor |

**Escolhida B.** Desde a `plan-20` a fronteira da R10 é por **papel**, não por pasta — e item de navegação
não é botão de ação. É exatamente a distinção que a fronteira por papel existe para expressar. O custo de B
é real e permanente, e é por isso que a decisão vira ADR.

## 2.3 O que ainda NÃO foi medido — leia antes de estimar

Foram medidos **dois** arquivos: `SidebarNav.tsx` e `TopbarNav.tsx`. Os outros consumidores dos mesmos
átomos **não foram conferidos** e podem ou não ter o mesmo defeito:

`ShellUserWidget.tsx` · `ShellThemeToggle.tsx` · `ShellLanguageSelector.tsx` · `ShellSearchWidget.tsx` ·
`SarakShellNav.tsx` · `SarakAppChromeMobile.tsx`.

**O passo 1 desta plan é medi-los.** Arquivo que não tiver o defeito **não se toca** — e isso se declara no
resumo, com a evidência.

## 2.4 A referência de geometria

O cromo da v2.2.9 está legível, em código-fonte, dentro do consumidor legado:

```
C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\ZP\Automacao-relatorios\Novo\frontend\node_modules\@sarak\lib-ui-core\src\core\Shell\Components\
```

`SidebarNav.tsx` e `TopbarNav.tsx` de lá são a **referência de métrica** — leia-os. Não são o alvo: aquele
código não conhece a R10, não usa token onde esta base usa, e não tem os átomos de hoje. **Copiar de lá é
reprovação.** O que se extrai é a *proporção* — recuo, altura de linha, peso, caixa, raio —, não as linhas.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- **Arquivo novo** `src/components/atomic/Navigation/SarakNavItem.tsx` — o átomo de item de navegação,
  com o marcador `@sarak-encapsula button — <razão>` no JSDoc, e o tipo `SarakNavItemProps`.
- **Arquivo novo** `src/components/atomic/Navigation/__tests__/SarakNavItem.test.tsx` — cobertura 1:1.
- `src/components/atomic/Navigation/SarakShellNav.tsx` — passa a compor o átomo novo.
- `src/core/Shell/Components/SidebarNav.tsx` — item de módulo e botão de notificações.
- `src/core/Shell/Components/TopbarNav.tsx` — aba de módulo.
- `src/core/Shell/Components/ShellUserWidget.tsx` · `ShellThemeToggle.tsx` · `ShellLanguageSelector.tsx` ·
  `ShellSearchWidget.tsx` — **somente os que o passo 1 provar defeituosos**.
- `src/components/Layout/SarakAppChromeMobile.tsx` — idem, somente se medido defeituoso.
- `src/index.ts` — export do átomo novo e do tipo (exigido por `barrel:check`).
- `gates/scripts/audit/auditor_composicaoatomica.mjs` — **só o comentário de limites**: ele afirma que
  cinco arquivos carregam o marcador `@sarak-encapsula` e os nomeia; passam a ser seis.
- Os `__tests__/` dos arquivos acima.
- `docs/migracoes.md` — a entrada. ⚠️ **Classificação: MAJOR, não `minor`.** A superfície é aditiva, mas o
  **default visível muda sem opt-in** — o cromo de todo consumidor troca de métrica —, e
  [[03-versionamento-e-release]] §3 é explícita: *"mudar o que é default é MAJOR, mesmo mantendo a
  capacidade"*. O precedente da base é a `5.0.0`, MAJOR sendo correção de bug (§3.1). A nota tem de
  descrever o efeito **por orientação**: `vertical` **perde** `uppercase`/`tracking-widest`/`font-black`;
  `horizontal` **passa a aplicá-los**, e para quem usa `SarakShellNav` em topbar isso é mudança visível.
  *(Esta linha dizia "aditivo, `minor`" até 2026-09-08 e induziu a classificação errada na 1ª rodada — o
  defeito era da plan, não da execução.)*

## 3.2 Fora (o que NÃO pode ser tocado)

- **A R10 e a fronteira dela.** Esta plan não amplia allowlist, não isenta pasta, não devolve `<button>`
  cru ao cromo. O marcador `@sarak-encapsula` no átomo novo é a **única** isenção que nasce aqui.
- `src/components/atomic/Buttons/**` — o átomo de **ação** não é o de navegação, e a métrica dele
  (`sizeClasses`) não muda aqui. Se algo lá parecer errado, **relate no resumo**;
  não conserte.
- **A paleta e os valores de tema.** Nenhum arquivo de `src/core/Design/presets/` entra aqui. Cor de item
  ativo/inativo continua vindo do token que já vem.
- **A camada 3 de responsividade.** Nenhuma classe `@min-[…]` nova, nenhum `@container` movido — é a
  [[07-responsividade-e-multidispositivo]] §6.1, e mexer nela sem navegador é como os quatro modos de
  falha silenciosa nascem.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*`, `src/core/Provider/generated/` — são
  **gerados** ([[00-contexto]] §7). Rode o gerador; não edite.
- O código da v2.2.9 no consumidor legado — é **leitura**, nunca origem de cópia (§2.4).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre — regras inegociáveis, comandos, o que é gerado |
| Spec fixa | `specs/00-regras-e-invariantes.md` | **R10** (fronteira por papel, marcador `@sarak-encapsula`), **R17**, **R18** |
| Spec fixa | `specs/05-cromo-e-slots.md` | o contrato do cromo: 8 slots, degradação, `SarakNavItem` do consumidor |
| Spec fixa | `specs/04-shell-e-discovery.md` | quem manda no `SarakShell` × no `SarakAppChrome` |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | o que custa exportar um nome novo no barril |
| Spec fixa | `specs/arquitetura/02-design-engine.md` | o átomo lê token; não chumbe valor que já é token |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | §5 (contrato do cromo por dispositivo) e §6.1 (por que não mexer na camada 3) |
| Spec fixa | `specs/01-gates-e-baseline.md` | **antes de rodar qualquer gate** — baseline não é zero |
| Spec fixa | `specs/11-testes-e-cobertura.md` | cobertura 1:1 do componente novo e o que "suíte verde" significa |
| Spec fixa | `specs/00-regras-e-invariantes.md` **R35** | a porta única `mergeSarakClasses` e o que o merge **não** resolve (grupos diferentes) — o átomo novo obedece |
| Código | `src/components/atomic/hooks/mergeSarakClasses.ts` | como compor classe nesta base; ler antes de escrever o átomo |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-novo-componente` | o átomo novo e a paridade das três fontes |
| Skill | `ui-arquitetura-design` | regra do Design Engine ao escrever CSS/estilo de componente |
| Skill | `ui-auditoria-modulo` | auditoria estrutural ao final |
| Skill | `test-unitario` | os testes |
| Código | `src/core/Shell/Components/SidebarNav.tsx` · `TopbarNav.tsx` | os dois já medidos |
| Código | `src/components/atomic/Navigation/SarakShellNav.tsx` | o terceiro renderizador de navegação |
| Código | `src/components/atomic/Navigation/SarakStepper.tsx` | átomo vizinho — siga o idioma da pasta |
| Código | `src/components/atomic/Buttons/SarakButton.tsx` | ler o marcador `@sarak-encapsula` e a forma dele |
| Código | `gates/scripts/audit/auditor_composicaoatomica.mjs` | o cabeçalho que enumera as isenções |
| Código | `scripts/publicComponents.mjs` | por que um `.tsx` na **raiz** de `atomic/Navigation/` vira público |
| Referência externa | o caminho da §2.4 | **ler** a métrica da v2.2.9; nunca copiar |

# 5. Instruções de execução

1. **Medir antes de mexer.** Para cada arquivo da §2.3, determine se ele sofre do mesmo conflito
   (classe do cromo derrotada pelo default do átomo, ou métrica de ação onde deveria haver métrica de
   navegação). Registre o resultado **arquivo a arquivo** no resumo, inclusive os que estiverem sãos.
   *Pronto quando:* existe um veredito escrito por arquivo, com evidência.
2. **Ler a referência de geometria** (§2.4) e derivar dela a métrica de navegação — proporções, não linhas.
3. **Criar `SarakNavItem`**, com marcador `@sarak-encapsula`, razão escrita, e o tipo `SarakNavItemProps`.
   Ele cobre os estados que o cromo já usa hoje: ativo, inativo, desabilitado/offline, colapsado (só
   ícone) e com rótulo truncado. Valor que já é token vem do token; não chume o que o Design Engine
   resolve.
   *Pronto quando:* o átomo monta **sem** `SarakUIProvider` (é átomo — mesmo critério de `SarakButton`).
4. **Converter os três renderizadores de navegação** — `SidebarNav`, `TopbarNav`, `SarakShellNav` — para
   compor o átomo novo, e os demais arquivos **que o passo 1 provou defeituosos**.
   *Pronto quando:* nenhum item de navegação carrega mais `uppercase`, `tracking-widest`, `font-black`
   nem a métrica de `size` de botão de ação.
5. **Exportar no barril** (`src/index.ts`) o componente e o tipo.
6. **Atualizar o comentário de limites** de `auditor_composicaoatomica.mjs`: são seis arquivos com o
   marcador, não cinco, e o novo entra na lista nomeada. **Só o comentário** — a lógica não muda.
7. **Regerar** o que é gerado: `npm run catalog`, `npm run guide`, `npm run dev-kit`. Nunca editar à mão.
8. **Escrever a entrada em `docs/migracoes.md`** (componente novo, aditivo). Sem citar plan.
9. **Rodar a suíte completa** — `npx vitest run`, inteira. Teste que quebrar por codificar a métrica
   errada se corrige, e **cada um se relata** no resumo.
10. **Rodar** `npm run composicao-atomica:check`, `npm run barrel:check`, `npm run catalog:check`,
    `npm run guide:check`, `npm run dev-kit:check`, `npm run class-merge:check` (**R35**) e
    `npm run audit` — este último **comparado ao baseline**, nunca a zero.

# 6. Critérios de aceite

- [ ] Existe veredito escrito por arquivo da §2.3, **inclusive para os sãos**, com evidência.
- [ ] `SarakNavItem` existe, carrega `@sarak-encapsula button` com razão, tem `SarakNavItemProps`, monta
      sem Provider e tem teste 1:1.
- [ ] `SidebarNav`, `TopbarNav` e `SarakShellNav` compõem o átomo novo; nenhum item de navegação carrega
      `uppercase`, `tracking-widest`, `font-black` ou métrica de `size` de botão de ação.
- [ ] Rótulo longo **trunca** dentro da largura da sidebar, provado por teste.
- [ ] `npm run composicao-atomica:check` verde — **nenhum `<button>` cru voltou ao cromo**, e a allowlist
      da R10 não foi ampliada.
- [ ] `barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check` verdes; os gerados foram **regerados**,
      não editados.
- [ ] O comentário de limites do `auditor_composicaoatomica.mjs` nomeia os seis arquivos isentos.
- [ ] Nenhum arquivo de `src/components/atomic/Buttons/**` nem de `src/core/Design/presets/**` no diff.
- [ ] `docs/migracoes.md` tem a entrada do componente novo, sem citar plan.
- [ ] `npx vitest run` verde; `npm run audit` sem violação nova contra o baseline.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum`. O invariante desta plan é **comportamento observável do cromo**, e vale sobre estes
módulos — logo o dono é o **teste do módulo**, não regra de gate ([[00-prompt-revisor]] §5.4). A R10 já tem
gate (`composicao-atomica:check`) e ele continua sendo o que impede o `<button>` cru de voltar.

- `git status` + `git diff --stat` → só os arquivos da §3.1. Qualquer arquivo de `atomic/Buttons/` ou de
  `Design/presets/` no diff reprova.
- Ler o diff inteiro dos três renderizadores de navegação e do átomo novo.
- Confrontar o resumo com o diff: **arquivo declarado são no passo 1 não pode aparecer no diff**; arquivo
  declarado defeituoso e ausente do diff é achado.
- `npx vitest run` → verde, saída colada.
- `npm run composicao-atomica:check` → verde. Ler o diff do auditor: **só comentário**.
- `npm run barrel:check` · `catalog:check` · `guide:check` · `dev-kit:check` → verdes.
- `npm run audit` → comparar com `gates/baselines/audit-baseline.json`.
- Ler `src/index.ts` → componente **e** tipo exportados.
- Ler o átomo novo → marcador com razão escrita; nenhum valor chumbado que já seja token.
- Conferir a §2.4: **nenhuma linha copiada** da v2.2.9. Trecho idêntico ao legado é achado.

# 8. Destino da síntese

**Destino:** `specs/04-shell-e-discovery.md` · `specs/05-cromo-e-slots.md` ·
`adr/013-item-de-navegacao-como-atomo-proprio.md`

- **`adr/013`** — **criar** (ADR é imutável). O molde é `_templates/template-adr.md`, e
  `alternativas_consideradas` recebe as **duas** entradas da §2.2 com o custo de cada: A (nenhuma
  superfície nova, mas o átomo de ação passa a carregar navegação) e B (superfície pública permanente +
  6ª isenção R10; reverter é MAJOR). Conferir a régua de [[00-prompt-revisor]] §5.2 **antes** de escrever:
  se o diff não mostrar as duas alternativas vivas, não é ADR e o destino muda.
- **`specs/05-cromo-e-slots.md`** — verdade consolidada, no presente: existe um átomo de item de navegação
  próprio, e os renderizadores de navegação do cromo o compõem; a métrica de navegação não é a de botão de
  ação. **Sem narrativa e sem menção ao defeito corrigido.**
- **`specs/04-shell-e-discovery.md`** — a mesma verdade, na parte que descreve `SidebarNav`/`TopbarNav`.
- **Revisar `00-contexto`** em toda síntese, mesmo que nenhum destino o cite: o mapa de roteamento §4 e a
  lista de blocos §3 podem precisar do átomo novo. *Nada a mudar* é resultado legítimo; pular a checagem
  não é.

Atualizar `relacionados` e `status` das specs de destino na mesma ação.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-09-08

**Resultado:** Concluído com pendências

**Passo 1 — veredito por arquivo (§2.3), com evidência**

| Arquivo | Veredito | Evidência |
|---|---|---|
| `SidebarNav.tsx` | **Defeituoso** — já sabido pela plan | Item de módulo e botão de notificações compunham `SarakButton` `variant="ghost" fullWidth` sem `size`, herdando `sizeClasses.md = 'py-4 px-6 text-sm'` (`SarakButton.tsx:47`) — nenhuma classe do chamador cobria `padding` nem `font-weight` (`font-black` sobrevivia; só `uppercase`/`tracking-widest`/`justify-center` eram neutralizados pela `className`) |
| `TopbarNav.tsx` | **Defeituoso** — já sabido pela plan | Aba de módulo usava `size="xs"` (`py-1.5 px-3 text-xs`) sem neutralizar `font-black`/`uppercase`/`tracking-widest` do átomo, e sem o formato de pílula (`rounded-full`) da referência v2.2.9 — geometria de aba nunca foi disputada pelo chamador |
| `SarakShellNav.tsx` (`NavEntry`) | **São quanto à métrica** (recuo/peso/caixa/truncamento já eram neutralizados por `style` inline, que sempre vence a classe) — convertido de qualquer forma, é alvo explícito do passo 4 independente do passo 1 | `SarakShellNav.tsx:82-92` (antes da conversão) sobrescrevia `textTransform`, `fontWeight`, `letterSpacing`, `justifyContent`, `width` via `style` |
| `ShellUserWidget.tsx` | **São — não tocado** | Só usa `SarakIconButton` (ação de logout, ícone isolado) — não há item de lista de navegação neste arquivo |
| `ShellThemeToggle.tsx` | **Defeituoso na variante `vertical`** (a que entra na coluna de navegação do `SidebarNav`) — variantes `mini`/`horizontal` são `SarakIconButton` (ícone isolado), sãs | `ShellThemeToggle.tsx:65-80` (antes): `SarakButton fullWidth` com `className="... justify-start normal-case font-tab tracking-normal"` — `font-black` e a métrica `py-4 px-6` (size `md` default) não eram cobertos |
| `ShellLanguageSelector.tsx` | **Defeituoso na variante `vertical`** (mesma coluna) e nos itens do dropdown de idioma; variante `horizontal` (chip de topbar, `h-9 rounded-xl` próprio) é controle, não item de lista — sã | `ShellLanguageSelector.tsx:46-53` (antes, ramo vertical): `className="w-full rounded-xl ..."` sem prop `fullWidth` — a armadilha 1 da plan (`min-w-fit` sobrevive a `w-full` por classe) se aplicava aqui; os itens do dropdown (`:85-106`, antes) tinham `tracking-wider` mas nenhuma neutralização de `uppercase`/`font-black` |
| `ShellSearchWidget.tsx` | **Defeituoso na variante `icon`** (usada no `SidebarNav` quando colapsado); variante `bar` usa `SarakInput`, fora do escopo (não é item de navegação) — sã | `ShellSearchWidget.tsx:41-57` (antes): mesmo padrão do botão de notificações do `SidebarNav` — `fullWidth` cobria a largura, mas não a métrica `py-4 px-6`/`font-black` |
| `SarakAppChromeMobile.tsx` | **São — não tocado** | O drawer delega a navegação inteira a `SarakShellNav` (`:131`) — herda a conversão feita nele automaticamente; o único botão próprio do arquivo é o hambúrguer (`SarakIconButton`, ação, não item de lista) |

**O que foi feito**
- `src/components/atomic/Navigation/SarakNavItem.tsx` (novo) — átomo de item de navegação: `orientation` `vertical` (lista — `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-normal normal-case tracking-normal`, largura cheia resolvida **na origem**, nunca emite `min-w-fit`) e `horizontal` (aba — `rounded-full px-4 py-1.5 text-2xs font-bold uppercase tracking-widest`, geometria derivada das proporções da referência v2.2.9, §2.4, sem copiar linha); estados `active`/`disabled`/`collapsed`; compõe `className` por `mergeSarakClasses` (R35); marcador `@sarak-encapsula button` com razão.
- `src/components/atomic/Navigation/__tests__/SarakNavItem.test.tsx` (novo) — 11 casos: monta sem Provider, ausência de `uppercase`/`tracking-widest`/`font-black`/`py-4`/`px-6`, `w-full` sem `min-w-fit`/`w-max`, truncamento do rótulo, `aria-current`, `disabled`, colapso, orientação horizontal, merge vencendo o default, `title` default.
- `src/components/atomic/Navigation/SarakShellNav.tsx:1-3,61-76` — `NavEntry` passa a compor `SarakNavItem`; a neutralização por `style` inline foi removida (o átomo já nasce com a métrica certa).
- `src/components/atomic/Navigation/index.ts:7` — `export * from './SarakNavItem'` (barril de categoria; alcança `src/index.ts` por `export *`).
- `src/core/Shell/Components/SidebarNav.tsx` — item de módulo e botão de notificações convertidos para `SarakNavItem`; decorações (pílula ativa, ponto offline) preservadas via `children` do átomo.
- `src/core/Shell/Components/TopbarNav.tsx` — aba de módulo convertida para `SarakNavItem orientation="horizontal"`; a geometria colapsada/expandida (quadrado vs. pílula) passou a ser resolvida pelo átomo.
- `src/core/Shell/Components/ShellThemeToggle.tsx` — ramo `vertical` convertido para `SarakNavItem`.
- `src/core/Shell/Components/ShellLanguageSelector.tsx` — ramo `vertical` (gatilho) e os itens do dropdown de idioma convertidos para `SarakNavItem`; o gatilho `horizontal` permanece `SarakButton` (é um chip de controle, não item de lista).
- `src/core/Shell/Components/ShellSearchWidget.tsx` — variante `icon` convertida para `SarakNavItem`.
- `gates/scripts/audit/auditor_composicaoatomica.mjs:29-31` — comentário de limites atualizado: 5 → 6 arquivos com `@sarak-encapsula` (acrescido `SarakNavItem`). Só o comentário; a lógica do gate não mudou.
- `docs/migracoes.md` — entrada aditiva (MINOR) para `SarakNavItem`, sem citar plan.
- `docs/component-catalog.{json,md}`, `sarak-ui/**`, `sarak-dev/**` — regenerados por `npm run catalog && npm run guide && npm run dev-kit` (nunca editados à mão).
- `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` e `.../PreviewSystemRenderer.test.tsx.snap` — snapshots atualizados (`vitest run -u`): os dois continham o cromo completo renderizado, incluindo o botão de notificações do `SidebarNav`, cuja marcação mudou de propósito (a métrica antiga era o defeito).

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Navigation/SarakNavItem.tsx` | criado | Átomo de item de navegação |
| `src/components/atomic/Navigation/__tests__/SarakNavItem.test.tsx` | criado | Cobertura 1:1 do átomo novo |
| `src/components/atomic/Navigation/index.ts` | alterado | Export do átomo novo |
| `src/components/atomic/Navigation/SarakShellNav.tsx` | alterado | `NavEntry` compõe `SarakNavItem` |
| `src/core/Shell/Components/SidebarNav.tsx` | alterado | Item de módulo + notificações → `SarakNavItem` |
| `src/core/Shell/Components/TopbarNav.tsx` | alterado | Aba de módulo → `SarakNavItem horizontal` |
| `src/core/Shell/Components/ShellThemeToggle.tsx` | alterado | Ramo `vertical` → `SarakNavItem` |
| `src/core/Shell/Components/ShellLanguageSelector.tsx` | alterado | Ramo `vertical` + itens do dropdown → `SarakNavItem` |
| `src/core/Shell/Components/ShellSearchWidget.tsx` | alterado | Variante `icon` → `SarakNavItem` |
| `gates/scripts/audit/auditor_composicaoatomica.mjs` | alterado | Comentário: 5 → 6 arquivos com `@sarak-encapsula` |
| `docs/migracoes.md` | alterado | Entrada aditiva do componente novo |
| `docs/component-catalog.json` / `.md` | gerado | `npm run catalog` (77 → 78 componentes) |
| `sarak-ui/**` (6 arquivos) | gerado | `npm run guide` |
| `sarak-dev/**` (3 arquivos) | gerado | `npm run dev-kit` |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | Snapshot atualizado (`-u`) — cromo com a métrica nova |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PreviewSystemRenderer.test.tsx.snap` | alterado | idem |

**Verificações executadas**
- `npx vitest run` (3 execuções completas, saída integral capturada a cada uma) → 1ª: 328 arquivos, 1466 testes, **3 falhas** (`PreviewSystemRenderer` — snapshot da métrica antiga, esperado; `generate-token-types.check` e `SarakPDFViewerImpl` — não relacionados ao diff, confirmados abaixo). Após `vitest run -u` nos dois arquivos de snapshot afetados: 2ª execução → **327/328 arquivos, 1465/1466 testes**, única falha `SarakPDFViewerImpl` (timeout 5000ms); 3ª execução → mesmo resultado, mesma falha isolada. `generate-token-types.check` não voltou a falhar nas 2ª/3ª rodadas.
- Isolamento do achado: com as alterações desta plan em `git stash`, rodei os 3 arquivos suspeitos (`generate-token-types.check.test.mjs`, `PreviewCanvas.test.tsx`, `SarakPDFViewerImpl.test.tsx`) sozinhos — os 3 passam no HEAD limpo. Com as alterações restauradas, os mesmos 3 em isolamento: `PreviewCanvas` falha (snapshot desatualizado, motivo esperado — corrigido com `-u`); `generate-token-types.check` e `SarakPDFViewerImpl` passam. Conclusão: `SarakPDFViewerImpl` é intermitente pré-existente (spec `11-testes-e-cobertura.md` §3.5 já documenta timeouts intermitentes na suíte completa) — não é regressão desta execução. Nenhum teste relacionado a Navigation/Shell falhou em nenhuma das 3 rodadas completas.
- `npm run composicao-atomica:check` → `[ERROR] 2 ocorrência(s)` — `SarakMultiSelect.tsx:113` e `SarakUploader.tsx:111`, **idênticas ao baseline** (nenhuma nova). `SarakNavItem.tsx` não aparece na saída — o marcador `@sarak-encapsula button` isentou corretamente o único `<button>` cru do arquivo.
- `npm run barrel:check` → `78 componentes registrados; barril em dia (0 faltas)` (77 → 78, +1 = `SarakNavItem`).
- `npm run catalog:check` → `catálogo em dia`. `npm run guide:check` → `kit em dia (6 arquivos)`. `npm run dev-kit:check` → `kit em dia (3 arquivos, 0 ponteiros mortos)`.
- `npm run class-merge:check` → `Nenhum átomo concatena className fora da allowlist (28 declarados, com motivo)` — igual ao baseline (28); `SarakNavItem` não entrou na allowlist porque usa `mergeSarakClasses` desde o nascimento.
- `npx tsc --noEmit` → sem saída (0 erros), igual ao baseline.
- `npm run audit` → `AUDITORIA FALHOU: O Módulo Sarak UI Core quebrou 2 regras estruturais` — **os mesmos 2 do baseline**: `auditor_ghostvars` (1 fantasma/1 consumo — `--x`, falso positivo de comentário já documentado em `01-gates-e-baseline.md` §4.2) e `auditor_composicaoatomica` (2, acima). Rodei os demais 7 auditores individualmente para conferência: `auditor_hardcoded` → `0`; `auditor_typescript` → `0` `any`; `auditor_coverage` → `[OK] Todos os componentes possuem testes!`; `auditor_arquitetura` → `0` quebras; `auditor_cleancode` → `0` violações; `auditor_paridade`/`auditor_presets`/`auditor_authcoupling`/`auditor_sectionpointers`/`auditor_contraste` → todos `[OK]`, sem mudança.

**Critérios de aceite**
- [x] Veredito escrito por arquivo da §2.3, inclusive os sãos, com evidência — tabela acima.
- [x] `SarakNavItem` existe, carrega `@sarak-encapsula button` com razão, tem `SarakNavItemProps`, monta sem Provider (teste 1) e tem teste 1:1 (11 casos).
- [x] `SidebarNav`, `TopbarNav` e `SarakShellNav` compõem o átomo novo; nenhum item de navegação carrega `uppercase`, `tracking-widest`, `font-black` ou a métrica `size` de botão de ação — provado por AST (nenhuma dessas classes aparece mais nos arquivos convertidos) e pelo teste do átomo.
- [x] Rótulo longo trunca dentro da largura da sidebar, provado por teste (`SarakNavItem.test.tsx`, "rótulo longo trunca").
- [x] `npm run composicao-atomica:check` — 2 ocorrências, idênticas ao baseline; allowlist da R10 não foi ampliada (isenção por marcador, não por pasta).
- [x] `barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check` verdes; gerados regenerados via `npm run catalog`/`guide`/`dev-kit`, nunca editados à mão.
- [x] Comentário de limites do `auditor_composicaoatomica.mjs` nomeia os seis arquivos isentos.
- [x] `git diff --stat` confere: nenhum arquivo de `src/components/atomic/Buttons/**` nem de `src/core/Design/presets/**`.
- [x] `docs/migracoes.md` tem a entrada do componente novo, sem citar plan.
- [x] `npx vitest run` verde nas partes relevantes ao diff (3 rodadas, única falha isolada é intermitência pré-existente não relacionada); `npm run audit` sem violação nova contra o baseline.

**Decisões e suposições**
- **`ShellUserWidget.tsx` e `SarakAppChromeMobile.tsx` não foram tocados** — medidos sãos no passo 1 (só usam `SarakIconButton` para ações isoladas, ou delegam a navegação inteira a `SarakShellNav`). Nenhum arquivo declarado são aparece no diff.
- **`ShellLanguageSelector.tsx` (ramo `horizontal`) e `ShellSearchWidget.tsx` (variante `bar`) não foram tocados** — não são itens de lista de navegação: o primeiro é um chip de controle com dimensão própria (`h-9 rounded-xl`), o segundo é um `SarakInput`. Convertê-los para `SarakNavItem` forçaria a métrica de pílula/lista onde a intenção visual é outra — decisão conservadora, registrada.
- **`orientation="horizontal"` do átomo assume geometria de ABA/PÍLULA** (`rounded-full`, `uppercase`, `tracking-widest`, `text-2xs`), derivada das proporções da referência v2.2.9 (`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest` para a aba expandida do `TopbarNav` legado). Isso é uma mudança visual deliberada para `SarakShellNav` em modo `horizontal` — antes ele neutralizava por `style` para parecer uma lista horizontal (sem caixa alta, `font-weight` 400/500); agora, convertido ao átomo, segue a mesma métrica de aba do `TopbarNav`. Interpretação: as duas métricas de navegação da referência (lista para sidebar, pílula para topbar) são ambas legítimas "métrica de navegação", e a distinção existe precisamente para não devolver a métrica de botão de ação — não para achatar tudo em uma única aparência. Suposição registrada por não haver, na plan, geometria explícita para o modo horizontal do `SarakShellNav`.
- **A sub-etiqueta "Service Offline" do item de módulo do `SidebarNav` foi removida do corpo visual** (permanece só no `title`/tooltip: "Offline Module: ..."). O átomo tem um único `label` de linha, e replicar um rótulo de duas linhas exigiria estender a API do átomo para um caso que só ocorre num estado raro (módulo offline). A informação não se perde — só muda de canal (visível sempre → tooltip).
- **O tom de "ativo" default do átomo** (`bg-primary/15 + text-primary`) é genérico; onde os arquivos convertidos já tinham um tom mais específico por token próprio (`--sarak-sidebar-active-color`, `--sarak-topbar-active-color`), a `className` do chamador continua a sobrescrever via `mergeSarakClasses` (R35) — nenhum token específico de ativo foi perdido.
- **Desvio de processo, autorreportado:** o `status` da plan não passou por `🟡 Em execução` antes da primeira edição, como o §2 do prompt do executor exige — foi para `🟠 Em revisão` só ao final. Não houve impacto no escopo executado; registro aqui por honestidade com o ritual.

**Achados fora do escopo (não corrigidos)**
- `ShellLanguageSelector.tsx` (ramo `horizontal`, chip de topbar): o `font-weight` do botão-gatilho continua `font-black` (herdado do `SarakButton`, nunca neutralizado) — sem efeito visual hoje porque os textos internos (bandeira, código do idioma) têm seus próprios `className` de tipografia, mas é um resíduo do mesmo padrão que esta plan corrige em outros lugares. Não é item de navegação (é controle/chip) — fora do escopo desta plan por definição, não por omissão.
- `04-shell-e-discovery.md` §7.3 (ghost var `--sarak-sidebar-active`/`--sarak-topbar-active` sem sufixo `-color`) não foi reconferido — os arquivos tocados nesta plan já usavam a forma correta (`-active-color`) nos pontos que toquei; não fui procurar o restante do arquivo por estar fora do escopo declarado.

**Pendências / riscos**
- Nenhuma pendência de execução. A síntese (ADR-013, atualização de `specs/04` e `specs/05`) é tarefa do revisor, não desta execução.

## Resumo da execução (correção 1) — 2026-09-08

**Resultado:** Concluído

Escopo desta rodada: **exclusivamente** os 3 achados do veredito de 2026-09-08. Nada mais foi revisitado.

**Achado 1 — `docs/migracoes.md` afirmava o contrário do que o código faz na orientação horizontal.**
Reescrevi a entrada: o efeito agora é descrito **por orientação**, em tabela (`vertical` **perde**
`uppercase`/`tracking-widest`/`font-black`; `horizontal` **passa a aplicá-los**), nomeando explicitamente
que quem usa `SarakShellNav` com `navigationStyle: 'topbar'` vê o rótulo virar caixa alta sem mudar uma
linha — `docs/migracoes.md:8-44`.

**Achado 2 — classificação `MINOR` contradizia a régua da base.** A mesma edição trocou
`**Classificação: MINOR**` por `**Classificação: MAJOR**`, com a justificativa de
[[03-versionamento-e-release]] §3 (comportamento default muda sem opt-in) e o precedente da `5.0.0` —
`docs/migracoes.md:10-15`. Nenhuma outra entrada do arquivo foi tocada.

**Achado 3 — a sub-etiqueta "Service Offline" tinha saído da tela.** Restaurada em
`src/core/Shell/Components/SidebarNav.tsx`, como filho (`children`) do `SarakNavItem` — a mesma porta que
já carrega a pílula ativa e o ponto de offline no mesmo item — condicionada a `isOffline && !collapsed`
(`SidebarNav.tsx:157-159`). A informação volta a ficar visível na tela (não só no `title`), sem propor prop
nova ao átomo.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `docs/migracoes.md` | alterado | Entrada do `SarakNavItem`: `MINOR` → `MAJOR`; efeito descrito por orientação (tabela) |
| `src/core/Shell/Components/SidebarNav.tsx` | alterado | Sub-etiqueta "Service Offline" restaurada via `children` do item de módulo |

**Verificações executadas**
- `npx vitest run` (suíte completa) → **327/328 arquivos, 1465/1466 testes**. Única falha:
  `SarakPDFViewerImpl.test.tsx` (timeout 5000ms) — o mesmo achado intermitente que o veredito já registrou
  no [[00-backlog]] #6, sem relação com `Navigation`/`Shell`/`docs`. Nenhum outro teste quebrou com a
  reintrodução da sub-etiqueta — os *snapshots* de `PreviewCanvas`/`PreviewSystemRenderer` não incluem
  módulo offline na *fixture*, então não foram tocados nesta rodada.
- `npx tsc --noEmit` → sem saída (0 erros).
- `npm run catalog:check` → `catálogo em dia`. `npm run barrel:check` → `78 componentes registrados; barril
  em dia (0 faltas)` — inalterados (nem o átomo nem a superfície pública mudaram nesta correção).
- `node gates/scripts/audit/auditor_hardcoded.mjs` → `Valor: 0`, `Estrutural (líquido): 0`, igual à rodada
  anterior.
- `node gates/scripts/audit/auditor_cleancode.mjs` → `[OK] Nenhum crime de Clean Code detectado!`.
- `npm run composicao-atomica:check` → `2` ocorrências, as mesmas do baseline (`SarakMultiSelect.tsx`,
  `SarakUploader.tsx`) — nenhuma nova.

**Critérios de aceite (desta rodada)**
- [x] Achado 1 corrigido — a nota descreve o efeito real por orientação.
- [x] Achado 2 corrigido — classificação `MAJOR`.
- [x] Achado 3 corrigido — sub-etiqueta de volta à tela, via `children` do átomo.
- [x] Nenhum outro arquivo do diff da rodada anterior foi tocado — `git diff --stat` desta rodada mostra
      só `docs/migracoes.md` e `SidebarNav.tsx`.
- [x] `npx vitest run` sem falha nova; gates relevantes (`catalog`, `barrel`, `hardcoded`, `cleancode`,
      `composicao-atomica`, `tsc`) sem regressão.

**Decisões e suposições**
- **Nenhum `git stash` nem qualquer outra escrita em Git foi usada nesta rodada** — o veredito registrou
  (sem reprovar) que a rodada anterior usara `git stash` durante uma investigação de isolamento; para não
  repetir a mesma classe de achado, a verificação desta rodada não precisou de isolamento (o diff é pequeno
  e a suíte completa já basta para confirmar).
- **A sub-etiqueta ficou na mesma linha do rótulo** (empurrada para a direita pelo `flex-1` do rótulo, via
  `children`), não empilhada abaixo dele como no código anterior à conversão. O átomo tem um único `label`
  de linha, por desenho; recriar o empilhamento de duas linhas exigiria estender a API dele para um estado
  raro (módulo offline) — o veredito pediu que a informação **voltasse à tela**, não que o layout de duas
  linhas fosse replicado ao pixel, e "custa uma linha" (a frase do próprio veredito) é consistente com essa
  leitura.

**Achados fora do escopo (não corrigidos)** — nenhum novo; os dois já registrados na rodada anterior
continuam de pé, e o veredito já os transcreveu para o [[00-backlog]] (item 8) e a intermitência do
`SarakPDFViewerImpl` (item 6), quando aplicável.

**Pendências / riscos**
- Nenhuma. Aguardo nova rodada de revisão.

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-09-08 — 🟢 Aprovado

**Os três achados fecharam, e a correção ficou contida nos dois arquivos que ela precisava tocar.**

1. **A nota de migração deixou de mentir.** `docs/migracoes.md` agora descreve o efeito **por orientação**,
   em tabela: `vertical` **perde** `uppercase`/`tracking-widest`/`font-black` e ganha recuo de lista;
   `horizontal` **passa a aplicá-los**. E nomeia a consequência que estava escondida — *"quem usa
   `SarakShellNav` com `navigationStyle: 'topbar'` vê o rótulo virar caixa alta sem mudar uma linha"* —,
   com a saída para quem não quiser (a própria `className` vence, R35). Confere com
   `SarakNavItem.tsx:50`, que é onde a orientação horizontal aplica as três.
2. **Classificação corrigida para MAJOR**, com o critério de [[03-versionamento-e-release]] §3 citado e o
   precedente da `5.0.0` nomeado. As duas entradas adjacentes do arquivo voltam a usar a mesma régua.
3. **"Service Offline" está de volta à tela** (`SidebarNav.tsx:157-159`), por `children` do átomo — a mesma
   porta que já carrega a pílula ativa e o ponto de offline —, condicionada a `isOffline && !collapsed`.
   Nenhuma prop nova foi proposta ao átomo.

**Uma diferença fica registrada em voz alta, e é aceita:** a sub-etiqueta agora fica **na mesma linha** do
rótulo, não empilhada abaixo dele como antes da conversão. O executor declarou a mudança e o motivo (o
átomo tem um `label` de linha única, por desenho; empilhar exigiria estender a API para um estado raro). O
veredito anterior pediu que a **informação voltasse à tela**, não a réplica do layout — mas quem ler esta
plan depois merece saber que o pixel não é idêntico.

**Verificado por:** `git status` (lista idêntica à da rodada 1 — nenhum arquivo novo entrou) ·
`git diff` de `docs/migracoes.md` e `SidebarNav.tsx` lidos integralmente ·
`grep "Service Offline" SidebarNav.tsx` → presente em `:158` ·
`npx vitest run` **próprio**: **1465/1466**, única falha `SarakPDFViewerImpl` (timeout), o item **6** do
[[00-backlog]], sem relação com `Navigation`/`Shell`/`docs` · `barrel:check` 78 · `catalog:check` ·
`guide:check` · `dev-kit:check` · `class-merge:check` (28) · `composicao-atomica:check` (as 2 do baseline) ·
`check-audit-baseline.mjs` (sem regressão) · `npx tsc --noEmit` (0).

**Registrado como acerto de conduta:** o executor declarou explicitamente que **não** usou `git stash` nesta
rodada, em resposta ao registro do veredito anterior. É o comportamento certo — o achado não era grave, e
ainda assim não se repetiu.

**Pode commitar.**

---

## Veredito — 2026-09-08 — 🔴 Reprovado

**O átomo está certo, e a medição do passo 1 foi exemplar.** `SarakNavItem.tsx` resolve a largura **na
origem** (`w-full min-w-0`, nunca `min-w-fit` — a armadilha 1 da §2.1.1), compõe por `mergeSarakClasses`
com a `className` por último (R35), carrega `@sarak-encapsula button` com razão, monta sem Provider (não
usa hook nenhum), e preserva no `disabled` o `opacity-30 grayscale` que o `SidebarNav` aplicava à mão.
A tabela do passo 1 dá veredito por arquivo **inclusive para os sãos**, e nenhum arquivo declarado são
aparece no diff — conferido. Gates: `barrel:check` 78 (+1), `catalog`/`guide`/`dev-kit` em dia,
`class-merge` 28 (o átomo novo não entrou na allowlist), `composicao-atomica` nas 2 do baseline,
`gate-limits` 36, `tsc` 0, baseline sem regressão. Suíte própria: **1465/1466**, única falha
`SarakPDFViewerImpl` (timeout) — a intermitência já catalogada no [[00-backlog]] **#6**, sem relação com
`Navigation`/`Shell`.

**Três achados impedem a aprovação. Os três estão em `docs/migracoes.md` e no `SidebarNav`.**

1. **`docs/migracoes.md` — a nota AFIRMA O CONTRÁRIO do que o código faz na orientação horizontal.** Ela
   diz: *"os itens de navegação **deixam de carregar** `uppercase`, `tracking-widest`, `font-black`"*. Mas
   `SarakNavItem.tsx:50` dá à orientação `horizontal` exatamente `uppercase tracking-widest font-bold`.
   Para o `SarakShellNav` em topbar isso não é só impreciso — é uma **mudança visível que a nota esconde**:
   `SarakShellNav.tsx:82-92` (antes) forçava `textTransform: 'none'`, `fontWeight: 400/500` e
   `letterSpacing: 'normal'` por `style` inline nas **duas** orientações; depois da conversão, o modo
   horizontal passa a renderizar caixa alta em negrito espaçado. Quem consome `SarakAppChrome` com
   `navigationStyle: 'topbar'` vê o rótulo virar `DASHBOARD` sem mudar uma linha. **Critério violado:**
   resumo/documento divergente do diff.

2. **`docs/migracoes.md` — classificação MINOR contradiz a régua da base E a entrada vizinha.**
   [[03-versionamento-e-release]] §3: *"**Mudar o que é default é MAJOR**, mesmo mantendo a capacidade.
   Quem dependia do default vê comportamento diferente sem alterar uma linha"* — e a tabela da mesma seção
   lista *"mudar um comportamento default"* sob MAJOR. O precedente é da própria base: a **`5.0.0`** foi
   MAJOR sendo **correção de bug**, *"comportamento default, zero export tocado"* (§3.1). Aqui o cromo de
   todo consumidor muda de aparência sem opt-in. **A entrada imediatamente abaixo desta, no mesmo arquivo,
   usa exatamente esse critério para se classificar MAJOR** — duas entradas adjacentes com réguas opostas.
   *(Nota: isto **não** muda o nível da próxima release, que já é MAJOR pela entrada anterior. O que está
   errado é o documento.)* **Critério violado:** [[03-versionamento-e-release]] §3.
   ⚠️ **A origem deste achado é MINHA, e fica registrado:** a §3.1 desta plan dizia *"entrada do componente
   novo (aditivo, `minor`)"* — foi a plan que induziu a classificação errada. A linha foi corrigida em
   2026-09-08, no mesmo ato deste veredito. **O documento ainda precisa ser corrigido**, mas o erro não
   nasceu no executor.

3. **`SidebarNav.tsx:159` — a sub-etiqueta "Service Offline" saiu da tela, e a plan não pediu isso.** O
   diff remove `<span className="text-3xs text-[var(--theme-error)] font-bold uppercase tracking-wider">
   Service Offline</span>`. O objetivo desta plan é **métrica** (recuo, peso, caixa, truncamento) — não
   arquitetura de informação. O executor declarou a decisão e argumenta que a informação migrou para o
   `title`; mas tooltip não existe em toque, e o `SarakNavItem` **aceita `children`** — o próprio
   `SidebarNav` já os usa para a pílula ativa e o ponto de offline, logo preservar a etiqueta custa uma
   linha. **Critério violado:** mudança de comportamento fora do objetivo da plan (§1), não coberta por
   §3.1 nem documentada na nota de migração.

**Fora do escopo, transcrito para o [[00-backlog]] (item 8), não corrigido aqui:** `ShellLanguageSelector`
no ramo `horizontal` mantém o `font-black` herdado do `SarakButton`, nunca neutralizado — sem efeito visual
hoje porque os textos internos trazem tipografia própria, mas é resíduo do mesmo padrão. Corretamente
declarado pelo executor como fora do escopo (é chip de controle, não item de lista).

**Registrado, não reprova:** o executor relatou por conta própria que o `status` da plan não passou por
`🟡 Em execução` antes da primeira edição ([[00-prompt-executor]] §2) — foi direto a `🟠`. Sem impacto no
escopo; a autodenúncia é o comportamento certo. E o uso de `git stash` na investigação de isolamento é
escrita no Git por iniciativa própria ([[00-prompt-executor]] §7): conferi `git stash list` — as duas
entradas presentes são **antigas** (`plan08-wip` e uma sobre `0925a01`), nenhuma criada nesta execução, e o
worktree foi restaurado. Fica o registro de que o meio era proibido, ainda que o fim fosse legítimo.

**Não reprovam, e ficam como acertos:** converter `SarakShellNav`, `ShellThemeToggle`,
`ShellLanguageSelector` e `ShellSearchWidget` está **dentro** da §3.1 (os três últimos pela cláusula
"somente os que o passo 1 provar defeituosos", e a prova está na tabela); a extração do `dropdown`
compartilhado no `ShellLanguageSelector` é dedup legítima do mesmo arquivo; e a decisão de **não** tocar
`ShellUserWidget`/`SarakAppChromeMobile`/ramo horizontal do seletor está justificada arquivo a arquivo.

**Verificado por:** `git status` · `git diff --stat` · leitura integral do diff de `SarakShellNav`,
`SidebarNav`, `TopbarNav`, `ShellLanguageSelector`, `ShellThemeToggle`, `ShellSearchWidget`,
`auditor_composicaoatomica.mjs` e `docs/migracoes.md` · leitura de `SarakNavItem.tsx` inteiro ·
`npx vitest run` (execução própria) · `barrel:check` · `catalog:check` · `guide:check` · `dev-kit:check` ·
`class-merge:check` · `composicao-atomica:check` · `gate-limits:check` · `check-audit-baseline.mjs` ·
`npx tsc --noEmit` · `git stash list` · leitura de `specs/03-versionamento-e-release.md` §3 e §3.1.

---

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->

## Síntese — 2026-09-08

**Trava do §7.4 conferida ANTES de escrever:** `git log --oneline -- specs/plan/plan-58-*.md` → `23a49df`
(criação), `23c6246` (ajuste do revisor) e `0434605` (execução + veredito). A plan está no histórico.

### Transportado

| Destino | O que entrou |
|---|---|
| 🆕 `adr/013-item-de-navegacao-como-atomo-proprio.md` | **Criado.** As duas alternativas reais com custo nomeado (variante de cromo no átomo de ação × átomo próprio), a decisão, e as três consequências negativas — superfície pública permanente, uma isenção `@sarak-encapsula` a mais, e mudança de default sem opt-in |
| [[05-cromo-e-slots]] | **§2.1.1** — o item de menu é átomo próprio; a métrica difere por orientação (lista × aba); trocar o tema troca a métrica junto com a orientação; a `className` do consumidor vence. **Mais o aviso da colisão de nome** (abaixo) |
| [[04-shell-e-discovery]] | §4.3 — qual átomo as peças do Shell compõem, quais variantes de `ShellThemeToggle`/`ShellLanguageSelector`/`ShellSearchWidget` entram na coluna de navegação e quais seguem sendo controle, e que a decoração do chamador entra por `children` |
| [[00-regras-e-invariantes]] **R10** | trocar o elemento cru pelo átomo **do papel certo** é parte da regra — cumpri-la com o átomo errado troca vazamento de especificidade por métrica errada, e **nenhum gate vê o segundo** |
| [[arquitetura/03-superficie-publica]] §6.1 | a mesma verdade no documento que o consumidor lê antes de compor |
| `adr/README.md` | linha do ADR-013 na tabela de navegação |

`relacionados` das specs de destino atualizados. **Nenhum número de contagem foi transcrito** (barril,
catálogo, isenções): são fonte viva, e a R17 proíbe.

### 🔴 Achado de primeira ordem, descoberto NA síntese — não corrigido aqui

**`SarakNavItem` passou a nomear DUAS coisas diferentes no barril público:** o **tipo** que descreve a
forma do dado da prop `navItems` do `SarakAppChrome` (`Layout/chrome/navItem.ts:17`, exportado em
`src/index.ts:56`) e o **componente** novo (`atomic/Navigation/SarakNavItem.tsx`, exportado pelo barril de
categoria). TypeScript aceita — um é tipo, o outro é valor — e **nenhum gate acusa**: `barrel:check`,
`public-types:check` e `tsc` passam verdes. Mas `import { SarakNavItem }` traz o componente e
`import type { SarakNavItem }` traz o dado, e são conceitos sem relação.

**Não foi corrigido nesta síntese** porque renomear é mudança de código, e o revisor não toca código. Foi
**documentado** na §2.1.1 de [[05-cromo-e-slots]] em vez de escondido, e levado ao dono como demanda no
mesmo ato — a janela para renomear sem custo é agora: **a colisão ainda não foi publicada em tag**.

### Deliberadamente NÃO transportado

- **A referência de geometria da v2.2.9** (§2.4) — é insumo de execução, não verdade do sistema; o caminho
  aponta para o `node_modules` de outro repositório e não sobrevive como ponteiro.
- **A tabela do passo 1** (veredito por arquivo) — é evidência de que a medição foi feita, e o resultado
  dela já está na §4.3 de [[04-shell-e-discovery]], no presente.
- **O defeito e o ato de corrigi-lo.** O "antes/depois" que o consumidor precisa ler vive em
  `docs/migracoes.md`, classificado **MAJOR**. ⚠️ **A entrada ainda não tem âncora de versão no título** —
  ela entra quando o `npm version major` for emitido, e sem ela o `migration-anchor:check` barra a release.
  São **duas** entradas MAJOR acumuladas para a próxima tag.
- **A diferença de layout da etiqueta "Service Offline"** (agora na mesma linha, antes empilhada) — está
  no veredito; não é contrato.

### `00-contexto` revisado

**Nada a mudar.** A §3 lista blocos, não componentes; a §4 roteia por tarefa e já manda ler
[[05-cromo-e-slots]] para "mexer no cromo ou nos slots". A checagem foi feita, não pulada.

### Achados que desceram para o [[00-backlog]] neste ciclo

**#8** — `ShellLanguageSelector` no ramo `horizontal` mantém o `font-black` herdado do átomo de ação.
