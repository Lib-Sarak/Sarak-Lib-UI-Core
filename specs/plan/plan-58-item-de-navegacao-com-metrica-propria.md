---
tipo: "plan"
titulo: "Dar ao item de navegação do cromo uma métrica própria, não a de botão de ação"
objetivo: "Devolver ao cromo a métrica de navegação — recuo, peso, caixa e truncamento de item de menu — sem violar a R10"
dominio: "Sarak-Lib-UI-Core / Cromo e Navegação"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "cromo", "sidebar", "topbar", "navegacao", "atomos"]
relacionados: ["[[05-cromo-e-slots]]", "[[04-shell-e-discovery]]", "[[00-regras-e-invariantes]]", "[[arquitetura/03-superficie-publica]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: "plan-57-classe-do-chamador-vence-no-atomo"
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

Três dos overrides que o cromo tenta hoje **perdem** — medido no `dist/sarak.css` e registrado na `plan-57`
§2.1. A `plan-57` conserta o mecanismo (o `className` do chamador passa a vencer); ela **não** decide qual
deve ser a métrica. Esta plan decide.

> **O erro não foi ter a R10.** Foi aplicá-la sem ninguém enxergar o custo — e o custo só apareceu por
> comparação com um sistema que roda a v2.2.9. Essa cegueira é o assunto da `plan-59`, não desta.

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
- `docs/migracoes.md` — entrada do componente novo (aditivo, `minor`).

## 3.2 Fora (o que NÃO pode ser tocado)

- **A R10 e a fronteira dela.** Esta plan não amplia allowlist, não isenta pasta, não devolve `<button>`
  cru ao cromo. O marcador `@sarak-encapsula` no átomo novo é a **única** isenção que nasce aqui.
- `src/components/atomic/Buttons/**` — é a `plan-57`. Se algo lá parecer errado, **relate no resumo**;
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
| Plan | `specs/plan/plan-57-classe-do-chamador-vence-no-atomo.md` | dependência: §2.1 tem a medição que **não** se repete aqui |
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
    `npm run guide:check`, `npm run dev-kit:check`, `npm run class-merge:check` (da `plan-57`) e
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
