---
tipo: "plan"
titulo: "Corrigir a métrica do item de navegação horizontal para caixa normal"
objetivo: "Os itens de menu da topbar deixam de ser renderizados como etiqueta e voltam a parecer navegáveis"
dominio: "Sarak-Lib-UI-Core / Componentes atômicos / Navegação"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "navegacao", "tipografia", "adr", "major"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/04-shell-e-discovery]]", "[[adr/013-item-de-navegacao-como-atomo-proprio]]"]
depende_de: ""
retida_por: ""
destino_sintese: "adr/NNN-metrica-do-item-de-navegacao-horizontal.md · specs/05-cromo-e-slots.md"
---

# 1. Objetivo

O item de navegação em orientação horizontal passa a usar caixa normal e corpo legível, mantendo a pílula e
o realce de item ativo que o distinguem de uma lista.

# 2. Contexto

O dono reportou que a topbar está pobre *"em funcionalidade e aparência"*. A funcionalidade já está
entregue — tokens de cromo, widgets por padrão e realce do item ([[05-cromo-e-slots]] §2.2.1 e §2.4). Esta
trata da aparência, e ela tem número medido.

Medição em Chromium real, sobre o `dist/` publicado, no item de navegação do `SarakAppChrome`:

| Propriedade computada | topbar (horizontal) | sidebar (vertical) |
| --- | --- | --- |
| `font-size` | **10px** | 12,25px |
| `text-transform` | **uppercase** | none |
| `letter-spacing` | **1px** | normal |

Um rótulo de menu em caixa alta, a 10 pixels, com 1px de espaçamento entre letras, é a tipografia que se usa
para **rotular uma seção** — aplicada ao alvo de clique principal do sistema. É a causa mais provável da
impressão de que o menu não parece um menu.

**Isto não é bug: é paridade deliberada.** O `TopbarNav` do Shell sempre desenhou assim, e a campanha da
ADR-013 alinhou o `SarakMenuItem` a ele — antes, o `SarakShellNav` neutralizava por `style` inline e
renderizava como lista horizontal. A mudança está em `docs/migracoes.md` como MAJOR, com escape pela
`className`, e a decisão foi levada ao dono **três vezes sem resposta**. Ele decidiu em 2026-09-09:
**reverter a caixa alta**.

**Consequência formal que define o destino desta plan:** a ADR-013 fixa, na lista de decisões,
*"`horizontal` — aba compacta (topbar): pílula, caixa alta, peso forte"*. ADR é imutável
([[00-contexto]] §4.1): decisão que substitui outra **cria um ADR novo**, com `substitui` preenchido, e o
013 recebe `substituido_por`. O que se preserva do 013 é o núcleo — o item de navegação é átomo próprio,
com métrica de navegação e não de botão de ação. O que muda é um valor tipográfico de uma das duas
orientações.

Achado do backlog que fecha junto: `border-radius` computado do item horizontal mediu **12px** em vez do
valor de pílula, no harness de navegador. Não foi isolado à época — pode ser artefato do harness (reset ou
preflight não replicado) ou comportamento real de `dist/sarak.css`. A propriedade foi retirada da medição
em vez de se afirmar o que não se entendeu. Como esta plan mexe exatamente nessa classe e a medição já está
montada, **é aqui que isso se resolve**: ou se explica, ou se corrige.

Outro achado do backlog, da mesma família: `useButtonLayoutStyles.ts:20` só larga o `min-w-fit` quando a
largura cheia vem por prop ou por tema; quem pede por `className="w-full"` mantém o piso de largura no
conteúdo.

A métrica se mede sobre o cromo final — com os widgets montados e o realce do item já corrigido —, não
sobre um estado intermediário. **Atenção:** o ramo `horizontal` do `SarakMenuItem` já teve a cor revista
(§2.4 da spec 05: fundo, texto e hover lêem cada um o seu token); esta plan muda só a tipografia dele, e a
varredura de realce do catálogo (`SarakMenuItem.test.tsx`) tem de continuar verde.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Navigation/SarakMenuItem.tsx` — a métrica do ramo `horizontal`.
- `src/core/Shell/Components/TopbarNav.tsx` — só se ele tiver métrica própria concorrente, para os dois
  cromos saírem coerentes.
- `src/components/atomic/hooks/useButtonLayoutStyles.ts` — o piso de `min-width` com largura cheia pedida
  por classe.
- `browser-tests/cromo-css-real.spec.ts` — atualizar os valores esperados e **reintroduzir a medição de
  `border-radius`**, isolando o que ela mede.
- Testes dos componentes tocados e os snapshots afetados.
- `docs/migracoes.md` — nota MAJOR.

## 3.2 Fora
- O ramo `vertical` do `SarakMenuItem` — está correto e foi validado pela ADR-013.
- A pílula, o `rounded-full` e o realce de item ativo — são o que distingue aba de lista; permanecem.
- A precedência da `className` do chamador (R35) — continua vencendo.
- O `SarakButton` e a métrica de botão de ação.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `adr/013-item-de-navegacao-como-atomo-proprio.md` | a decisão que esta plan substitui em parte; ler antes de escrever a nova |
| Spec fixa | `specs/adr/README.md` | o protocolo de ADR que substitui outro |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.1.1 — a métrica por orientação como contrato |
| Spec fixa | `specs/04-shell-e-discovery.md` | §4.3 — quais peças compõem o átomo e em que variante |
| Spec fixa | `specs/00-regras-e-invariantes.md` | R35 — a `className` do chamador vence o default do átomo |
| Spec fixa | `specs/11-testes-e-cobertura.md` | §7 — o que a medição de navegador cobre |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-arquitetura-design` | métrica visual de componente |
| Código | `src/components/atomic/Navigation/SarakMenuItem.tsx:48-50` | a métrica das duas orientações |
| Código | `src/components/atomic/hooks/useButtonLayoutStyles.ts:20` | o piso de `min-width` |
| Código | `browser-tests/cromo-css-real.spec.ts` | o harness e os valores esperados |
| Código | `docs/migracoes.md` | a entrada da métrica, que passa a ter continuação |

# 5. Instruções de execução

1. Ler as referências da §4, incluindo a ADR-013 inteira.
2. Ajustar a métrica do ramo `horizontal`: sai a caixa alta e o espaçamento largo entre letras, o corpo sobe
   para um tamanho legível de navegação. Permanecem a pílula, o `rounded-full`, o peso de item ativo e o
   truncamento. **Pronto quando** o item lê como alvo de navegação e continua distinguível de uma lista.
3. Conferir o `TopbarNav` do Shell: os dois cromos têm de sair coerentes. Se ele tiver métrica própria
   concorrente, alinhá-la; se não tiver, não tocar.
4. Corrigir o piso de `min-width` quando a largura cheia é pedida por `className`, preservando o
   comportamento nos demais casos.
5. Reintroduzir a medição de `border-radius` no harness, **isolando** primeiro se os 12px medidos vêm do
   harness ou do CSS publicado. Registrar a conclusão no resumo — os dois desfechos são aceitáveis, chutar
   não é.
6. Atualizar os valores esperados do harness e os snapshots afetados.
7. Escrever a nota MAJOR em `docs/migracoes.md`, encadeando com a entrada existente da métrica.
8. Rodar `npx vitest run`, `npm run cromo-css-real:check` e `npm run class-merge:check`.

# 6. Critérios de aceite

- [ ] O item horizontal computa `text-transform: none` e corpo legível, medido em navegador.
- [ ] Pílula, `rounded-full`, realce de ativo e truncamento permanecem.
- [ ] O ramo vertical não mudou.
- [ ] A `className` do chamador continua vencendo o default (R35), provado por teste.
- [ ] Largura cheia pedida por `className` não mantém mais o piso de `min-width`.
- [ ] A medição de `border-radius` voltou ao harness, com a origem dos 12px explicada ou corrigida.
- [ ] `docs/migracoes.md` tem a nota MAJOR encadeada com a entrada anterior.
- [ ] `npx vitest run` verde; `cromo-css-real:check` verde; `class-merge:check` verde.
- [ ] Snapshots atualizados de propósito, e a mudança de cada um é explicável.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é o valor computado de um átomo, e ele já tem dono: a medição de navegador
do `cromo-css-real:check`. Esta plan atualiza a régua existente em vez de criar outra.

- `git diff --stat` → só os arquivos de §3.1.
- `npm run cromo-css-real:check` → verde, com os valores novos e a medição de raio de volta.
- `npx vitest run src/components/atomic` → verde.
- Leitura do diff dos snapshots → cada mudança corresponde à métrica alterada; nenhuma é colateral.
- `npm run class-merge:check` → verde.
- Leitura do resumo → a origem dos 12px está explicada.
- `npx vitest run` → verde.

# 8. Destino da síntese

**Destino:** `adr/NNN-metrica-do-item-de-navegacao-horizontal.md` · `specs/05-cromo-e-slots.md`

**ADR novo, que substitui em parte a ADR-013** (protocolo em `specs/adr/README.md`): preencher `substitui`
apontando o 013, e `substituido_por` no 013. O núcleo do 013 — item de navegação é átomo próprio, com
métrica de navegação e não de botão de ação — **permanece vigente**; o que muda é o valor tipográfico do
ramo horizontal.

`alternativas_consideradas`, as duas reais: manter a paridade com o `TopbarNav` histórico (custo: o alvo de
clique principal segue com tipografia de etiqueta) × caixa normal com corpo legível (custo: `major`, e
diverge da aparência histórica do Shell).

Em `specs/05`, atualizar a linha `horizontal` da tabela da §2.1.1 para a métrica corrente.

Ao registrar o achado, remover do [[00-backlog]] os itens que fecham aqui — o do `border-radius` medido em
12px e o do piso de `min-width` com `w-full`.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-11

**Resultado:** Concluído

**O que foi feito**
- Ramo `horizontal` do `SarakMenuItem` deixou de aplicar caixa alta e espaçamento largo entre letras e subiu o
  corpo do rótulo — `src/components/atomic/Navigation/SarakMenuItem.tsx:50` — de
  `text-2xs font-bold uppercase tracking-widest` para `text-sm font-bold normal-case tracking-normal`. Pílula
  (`rounded-full`), peso e truncamento continuam; o ramo `vertical` não foi tocado.
- `TopbarNav.tsx` do Shell foi lido (§4) e não tem métrica própria concorrente para o item de menu — só
  `whitespace-nowrap font-tab` e cor condicional por estado ativo, nenhuma delas de tipografia. Nada foi
  alterado ali, conforme a instrução 3 ("se não tiver, não tocar").
- `useButtonLayoutStyles` passou a aceitar um terceiro parâmetro `className` e a considerar `w-full` pedido
  por ele (via `/\bw-full\b/`) como largura cheia — `src/components/atomic/Buttons/hooks/useButtonLayoutStyles.ts:12,22,43`.
  Antes, só `fullWidth` (prop) ou `design.buttonWidthStrategy === 'full'` suprimiam o `min-w-fit`; quem pedia
  largura cheia só por `className="w-full"` ficava com o piso de `min-width` do conteúdo preso (grupo de
  propriedade diferente de `width`, R35).
- `SarakButton.tsx:39` passou a repassar a própria `className` ao hook — sem isso a correção acima não tem
  efeito, porque é o único chamador do hook na base (`grep -rn "useButtonLayoutStyles"` confirma).
- Reintroduzida a medição de `border-radius` no harness de navegador
  (`browser-tests/cromo-css-real.spec.ts:74-92`, campo novo em `ComputedMetric`) e **isolada** a origem do
  achado de "12px medido no item horizontal": não é artefato do harness. É comportamento REAL do
  `dist/sarak.css` publicado — `src/styles/_utilities.css:29-35` declara
  `button:not(.p-0) { border-radius: var(--sarak-btn-radius-tl, var(--sarak-btn-border-radius, 8px)) ... }`,
  um seletor de ELEMENTO (`button` + `:not()`) com especificidade maior que uma única classe Tailwind
  (`.rounded-full`/`.rounded-btn`). Esse seletor **sobrescreve silenciosamente** o raio de QUALQUER `<button>`
  sem a classe `p-0` na base inteira — não só o item de navegação. Medido ao vivo em Chromium real (script
  isolado, depois removido): o item horizontal (`.rounded-full`, um valor de `calc(infinity*1px)`) e o
  `SarakButton` de referência (`.rounded-btn`, um token) computam **exatamente o mesmo** `border-radius`
  (8px, no tema default) — a mesma prova de que os dois estão sob o mesmo mecanismo de override, não sob a
  própria classe Tailwind. Teste novo em `cromo-css-real.spec.ts:159-166` prova essa igualdade; item 8 dos
  LIMITES DECLARADOS (`:57-69`) documenta o mecanismo com `arquivo:linha`. **Não corrigido** — ver "Achados
  fora do escopo".
- `docs/migracoes.md` ganhou uma entrada nova no topo (mais recente primeiro), encadeada por texto com a
  entrada existente `## \`SarakNavItem\` — átomo próprio para item de navegação do cromo`: título
  "Revisão da métrica do item de navegação horizontal — a caixa alta sai, o corpo sobe (plan-68)",
  classificação MAJOR, tabela antes/depois das três propriedades e nota do achado do `min-width` corrigido
  junto.
- Testes novos/atualizados (ver tabela) cobrindo a métrica horizontal revisada e o piso de `min-width` por
  `className`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Navigation/SarakMenuItem.tsx` | alterado | ramo `horizontal`: `text-2xs uppercase tracking-widest` → `text-sm normal-case tracking-normal` |
| `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | alterado | novo teste: horizontal em caixa normal, `rounded-full`/`tracking-normal` presentes, `uppercase`/`tracking-widest`/`text-2xs` ausentes |
| `src/components/atomic/Buttons/hooks/useButtonLayoutStyles.ts` | alterado | hook aceita `className`; `w-full` por classe também suprime `min-w-fit` |
| `src/components/atomic/Buttons/hooks/__tests__/useButtonLayoutStyles.test.ts` | alterado | 2 testes novos: `w-full` só por `className` suprime o piso; substring que não bate na palavra inteira (`not-w-fullish`) não conta |
| `src/components/atomic/Buttons/SarakButton.tsx` | alterado | repassa `className` ao hook (necessário para a correção acima ter efeito) |
| `src/components/atomic/Buttons/__tests__/SarakButton.test.tsx` | alterado | teste novo: `className="w-full"` sem `fullWidth` produz `w-full` de fato, sem `min-w-fit` |
| `browser-tests/cromo-css-real.spec.ts` | alterado | `ComputedMetric.borderRadius` novo; teste de tablet: `textTransform` `uppercase`→`none`, mais asserção de `border-radius`; item 8 dos LIMITES DECLARADOS explica o mecanismo real |
| `docs/migracoes.md` | alterado | entrada MAJOR nova, encadeada com a entrada do `SarakNavItem` |
| `dist/*` | regenerado | efeito colateral do `npm run build` embutido em `cromo-css-real:check` (§4 explica) — nenhuma edição manual |

**Verificações executadas**
- `npx vitest run src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx src/components/atomic/Buttons/__tests__/SarakButton.test.tsx src/components/atomic/Buttons/hooks/__tests__/useButtonLayoutStyles.test.ts` → 3 arquivos, **54 testes, 100% verde**.
- `npx vitest run src/components/atomic` → **122 de 123 arquivos verdes, 445/446 testes**; a 1 falha
  (`SarakPDFViewerImpl.test.tsx`, timeout de 5000ms) é a intermitência PRÉ-EXISTENTE já documentada em
  [[11-testes-e-cobertura]] §3.5.1 e no backlog #5 — não toca nenhum arquivo desta entrega. Rodado **isolado**
  logo em seguida: `npx vitest run src/components/atomic/Media/SarakPDFViewer/__tests__/SarakPDFViewerImpl.test.tsx`
  → 1 arquivo, **3 testes, 100% verde** — confirma o padrão "falha agregada, passa isolado" já registrado.
- `npx vitest run` (suíte completa) → **342 de 345 arquivos verdes, 1714/1719 testes**. As 3 falhas
  (`check-barrel-parity.test.mjs`, `generate-token-types.check.test.mjs`,
  `SarakPDFViewerImpl.test.tsx`) são todas timeout de hook/teste, nenhuma toca arquivo desta entrega. Rodadas
  **isoladas** em seguida (`npx vitest run gates/scripts/contrato/__tests__/check-barrel-parity.test.mjs
  scripts/__tests__/generate-token-types.check.test.mjs src/components/atomic/Media/SarakPDFViewer/__tests__/SarakPDFViewerImpl.test.tsx`)
  → 3 arquivos, **12 testes, 100% verde**.
- `npm run cromo-css-real:check` (builda e roda o Playwright) → **5 de 5 testes verdes**, incluindo o teste de
  tablet revisado (`textTransform: 'none'`) e a nova asserção de `border-radius`.
- `npm run class-merge:check` → `[OK] Nenhum átomo concatena className fora da allowlist (28 declarados, com motivo)`.

**Critérios de aceite**
- [x] O item horizontal computa `text-transform: none` e corpo legível, medido em navegador — evidência:
  `cromo-css-real.spec.ts` teste de tablet, verde (`textTransform` afirmado `'none'`).
- [x] Pílula, `rounded-full`, realce de ativo e truncamento permanecem — evidência: só a linha de
  `text-2xs/uppercase/tracking-widest` mudou em `SarakMenuItem.tsx:50`; `rounded-full` e o bloco `tone`
  (realce) e o `<span className="truncate">` não foram tocados.
- [x] O ramo vertical não mudou — evidência: `git diff` de `SarakMenuItem.tsx` mostra uma única linha
  alterada (a do ramo `horizontal`); suíte de `SarakMenuItem.test.tsx` (testes de orientação vertical, não
  alterados) continua verde.
- [x] A `className` do chamador continua vencendo o default (R35), provado por teste — evidência:
  `SarakMenuItem.test.tsx:72-77` ("a className do chamador VENCE os defaults", não alterado, continua verde).
- [x] Largura cheia pedida por `className` não mantém mais o piso de `min-width` — evidência:
  `useButtonLayoutStyles.test.ts` (teste novo) e `SarakButton.test.tsx` (teste novo), ambos verdes.
- [x] A medição de `border-radius` voltou ao harness, com a origem dos 12px **explicada** — evidência: item 8
  dos LIMITES DECLARADOS em `cromo-css-real.spec.ts:57-69` e a seção "O que foi feito" acima, com
  `arquivo:linha` do mecanismo real (`_utilities.css:29-35`). Escolhido **explicar**, não corrigir — ver
  "Achados fora do escopo".
- [x] `docs/migracoes.md` tem a nota MAJOR encadeada com a entrada anterior — evidência: nova entrada no topo
  do arquivo, com a seção "Encadeamento com a entrada abaixo" apontando nominalmente para a entrada do
  `SarakNavItem`.
- [x] `npx vitest run` verde; `cromo-css-real:check` verde; `class-merge:check` verde — evidência acima
  (verde de fato, ou intermitência pré-existente comprovada por reexecução isolada).
- [x] Snapshots atualizados de propósito, e a mudança de cada um é explicável — não havia snapshot algum
  referenciando `SarakMenuItem`/`SarakMenuItemOrientation` (`grep` confirmado); nenhum `.snap` foi tocado.

**Decisões e suposições**
- **Caminho de `useButtonLayoutStyles.ts` divergente do citado na plan.** A §4 cita
  `src/components/atomic/hooks/useButtonLayoutStyles.ts:20`; o arquivo real é
  `src/components/atomic/Buttons/hooks/useButtonLayoutStyles.ts` (único no repositório — `Glob` confirmado).
  Tratado como imprecisão de caminho na instrução, não como arquivo diferente.
- **`SarakButton.tsx` editado sem estar nomeado em §3.1.** É o único chamador de `useButtonLayoutStyles` na
  base; sem repassar a `className` a ele, a correção do hook não tem efeito nenhum observável. Tratado como
  parte necessária de "corrigir o piso de `min-width`" (§5 item 4), não como escopo novo.
- **`border-radius`: explicar, não corrigir.** O mecanismo achado (`button:not(.p-0)` em
  `_utilities.css:29-35` sobrescrevendo o raio de QUALQUER botão sem `.p-0` na base inteira) é real, mas
  corrigi-lo está fora de `src/components/atomic/Navigation/SarakMenuItem.tsx`/`useButtonLayoutStyles.ts`, os
  únicos arquivos de produção que a §3.1 autoriza tocar — e o alcance do bug (todo `<button>`, não só o item
  de navegação) é maior que esta plan. A própria §5 item 5 permite os dois desfechos ("os dois desfechos são
  aceitáveis"); registrado como achado fora do escopo abaixo.
- **`dist/*` regenerado, não editado.** `npm run cromo-css-real:check` builda antes de medir (é o próprio
  harness que exige isto — lê `dist/`, não `src/`); os chunks com hash no nome mudaram de nome porque o
  conteúdo deles mudou (a string de classe do `SarakMenuItem`). Não editei `dist/` manualmente, e não reverti
  a regeneração — o modelo de distribuição deste repositório é "git com tag" (`00-contexto` §3), e o
  `dist/` publicado precisa refletir a mudança de `src/` que esta plan faz.

**Achados fora do escopo (não corrigidos)**
- `src/styles/_utilities.css:29-35` — a regra `button:not(.p-0) { border-radius: ... }` é um seletor de
  ELEMENTO com especificidade maior que uma classe Tailwind isolada (`.rounded-full`, `.rounded-btn`,
  `.rounded-lg`, `.rounded-xl`...) e sobrescreve **silenciosamente** o raio de QUALQUER `<button>` da base
  que não tenha a classe `p-0` — não só o `SarakMenuItem`. Hoje isso faz `rounded-full` (a pílula que a
  ADR-013 e a spec `05-cromo-e-slots.md` §2.1.1 descrevem como parte do contrato do item horizontal) nunca
  chegar a renderizar como pílula de fato: o raio publicado é sempre o de `--sarak-btn-border-radius`
  (default 8px), igual ao de qualquer outro botão da base. É provavelmente a mesma classe de mecanismo que
  produziu o "12px" do achado original (um fallback antigo desse mesmo token, ou um valor de tema
  diferente) — o número mudou, o mecanismo é o mesmo. Corrigir isto exige decidir COMO (abaixar a
  especificidade da regra global, escopar o seletor, ou mover a "sincronização de geometria" para dentro do
  Hook Controlador de cada átomo) e alcança todo `<button>` da base, não só navegação — maior que esta plan.

**Pendências / riscos**
- Nenhuma pendência nos critérios de aceite desta plan. O achado do `border-radius` acima é risco
  **pré-existente** (não introduzido por esta execução) e já estava fora de alcance do harness antes desta
  plan — agora está medido, explicado e coberto por teste de regressão (a igualdade item/referência), mas
  não corrigido.

---

# 10. Veredito

## Veredito — 2026-09-11 — 🔴 Reprovado

**A métrica está certa, e a investigação do raio é a melhor coisa desta entrega.** O executor não aceitou
os 12px como ruído: isolou, mediu em navegador real e achou o mecanismo verdadeiro — uma regra global que
sobrescreve o raio de todo `<button>` da lib. A reprovação é porque o teste que registra esse achado
**afirma o defeito como se fosse o contrato**.

### O que verifiquei e está certo

- `SarakMenuItem.tsx:50` — só o ramo `horizontal` mudou: `text-sm font-bold normal-case tracking-normal`.
  Pílula (`rounded-full`), peso, realce e truncamento intactos; o ramo vertical, intocado.
- `TopbarNav.tsx` corretamente **não** tocado — não tem métrica tipográfica concorrente.
- **O mecanismo do raio é real, conferido por mim:** `src/styles/_utilities.css:29-35`,
  `button:not(.p-0) { border-radius: … }`, fica **fora de qualquer `@layer`** e tem especificidade (0,1,1) —
  vence todo `rounded-*` do Tailwind em todo `<button>`. Não é artefato do harness.
- `useButtonLayoutStyles` + `SarakButton` repassando `className`: largura cheia por classe larga o
  `min-w-fit`, com teste nos dois níveis. `SarakButton.tsx` estava na §3.2 como *fora*, mas é o **único**
  chamador do hook que a §3.1 mandava corrigir — a contradição é da plan, e o executor a declarou.
  O caminho do hook citado na §4 também estava errado na plan (`atomic/hooks/` → `atomic/Buttons/hooks/`).
- **Execuções, feitas por mim:** suíte completa (`--maxWorkers=3`) → **345 arquivos / 1719 testes, verde**.
  `cromo-css-real:check` → **5 passed**. `class-merge` · `chrome-token-parity` · `barrel` · `catalog` ·
  `guide` · `dev-kit` → verdes. `audit:baseline --with-tsc` → igual ao baseline.

### Achados

**1. O teste novo de raio trava o defeito no lugar.**
`browser-tests/cromo-css-real.spec.ts`, teste do tablet:
`expect(item.borderRadius, …).toBe(reference.borderRadius)` — exige que o item de navegação tenha **o
mesmo raio do botão de ação**. A [[05-cromo-e-slots]] §2.1.1 e o [[013-item-de-navegacao-como-atomo-proprio]]
dizem o contrário: o item horizontal é **pílula**, e o item de menu *"nunca carrega a métrica de botão de
ação"*. O próprio LIMITE 8 do arquivo admite que a asserção *"não prova geometria de pílula"*. Resultado:
no dia em que alguém consertar a regra global, **este teste quebra** — ele protege o defeito contra o
conserto. A §5 item 5 aceitava *explicar* em vez de corrigir; explicar não é afirmar o comportamento errado
como esperado.
**Conserto:** a medição do raio sai do teste do tablet (que continua provando o resto da métrica) e vai
para um teste próprio, que afirma **o contrato** — o raio do item horizontal difere do raio do botão de
ação — marcado como falha esperada (`test.fail`), com o motivo escrito: a regra global de
`_utilities.css`. Assim o defeito fica visível no relatório, e quando for consertado o Playwright acusa o
*"passou quando devia falhar"* e obriga a tirar a marcação. O motivo no código descreve o mecanismo, **sem**
número de backlog (a numeração do backlog anda).

**2. Mensagem de asserção narrando mudança.** `cromo-css-real.spec.ts`, teste do tablet: *"aba compacta da
topbar **volta à** caixa normal — … **revisão do que a ADR-013 fixava**"*. `padrao-escrita`,
`references/comentarios.md:82`. A mensagem diz o que a métrica **é**. E a menção ao ADR-013 ficaria errada
de qualquer forma: a síntese desta plan cria o ADR que o substitui neste ponto.

### Não são achados desta execução

- **O status ficou em 🔴 durante toda a execução** — nem 🟡 ao começar, nem 🟠 ao terminar
  (`00-prompt-executor` §2). Ajustado aqui. É o padrão já registrado no [[00-backlog]].
- **A regra global de raio** não é desta plan, e o executor fez certo em não corrigir: ela alcança todo
  `<button>` da lib. Vai para o [[00-backlog]] com peso alto — é, muito provavelmente, parte do *"a topbar
  está pobre em aparência"* que abriu esta campanha.

---

## Resumo da execução (correção 1) — 2026-09-11

**Resultado:** Concluído

**Escopo:** exclusivamente os dois achados do veredito de 2026-09-11, só em
`browser-tests/cromo-css-real.spec.ts` — nada mais foi tocado nesta rodada.

**Um item por achado**

- **Achado 1 (teste trava o defeito no lugar).** A asserção
  `expect(item.borderRadius, …).toBe(reference.borderRadius)` saiu do teste de tablet. No lugar dela, o teste
  de tablet volta a terminar só com as asserções de `text-transform`/`font-weight` (`:154-162`). Uma segunda
  `test.fail` nova (`:165-183`) afirma o **contrato** — o raio do item horizontal deveria ser o de pílula,
  diferente do raio do botão de referência (`expect(item.borderRadius, …).not.toBe(reference.borderRadius)`)
  — marcada com `test.fail(...)`, que é a forma documentada do Playwright de declarar uma falha esperada já
  na definição do teste (`test.fail(title, body)`, não só `test.fail()` dentro do corpo). O motivo do
  mecanismo (a regra `button:not(.p-0)` de `src/styles/_utilities.css:29-35`) está escrito no comentário
  acima do teste, sem número de backlog. Confirmado rodando: o relatório do Playwright mostra o teste 1
  marcado `x` (falhou, como esperado) e o resultado agregado continua **"6 passed"** — no dia em que a regra
  global for corrigida, essa mesma execução passa a acusar "passou quando devia falhar" e força remover a
  marcação. O item 8 dos LIMITES DECLARADOS (`:57-70`) foi reescrito para descrever o teste novo, não mais a
  asserção de igualdade que saiu.
- **Achado 2 (mensagem de asserção narrando mudança).** A mensagem do `text-transform` no teste de tablet —
  *"aba compacta da topbar volta à caixa normal — … revisão do que a ADR-013 fixava"* — virou *"aba compacta
  da topbar usa caixa normal — pílula com corpo legível, nunca a caixa alta de rótulo de seção"*
  (`:157`): descreve o que a métrica **é**, sem narrar a mudança e sem citar a ADR-013 (que a síntese desta
  plan substitui exatamente neste ponto — citá-la aqui ficaria com ponteiro errado assim que o ADR novo
  existir).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/cromo-css-real.spec.ts` | alterado | achado 1: asserção de raio virou teste `test.fail` próprio, afirmando o contrato; achado 2: mensagem do `text-transform` reescrita; item 8 dos LIMITES DECLARADOS atualizado |
| `dist/*` | regenerado | efeito colateral do `npm run build` embutido em `cromo-css-real:check` — nenhuma edição manual |

**Verificações executadas**
- `npm run cromo-css-real:check` → build verde + **6 testes, "6 passed"** (o teste de raio aparece marcado
  `x` no relatório — falha esperada, contabilizada como passe pelo `test.fail`).
- `git status --short` (excluindo `dist/`) → só `browser-tests/cromo-css-real.spec.ts` mudou nesta rodada,
  além do próprio arquivo da plan; `src/`, `docs/migracoes.md` e os demais arquivos da execução anterior
  permanecem exatamente como o veredito os aprovou (nenhum achado os mirava).

**Critérios de aceite**
- [x] Achado 1 corrigido — evidência: `cromo-css-real.spec.ts:165-183` (teste `test.fail` novo, contrato
  afirmado, não o defeito) e a execução acima (`x` esperado, agregado "6 passed").
- [x] Achado 2 corrigido — evidência: `cromo-css-real.spec.ts:157` (mensagem reescrita, sem narrar mudança e
  sem citar ADR-013).
- [x] Escopo respeitado à letra — evidência: `git status --short` acima.

**Decisões e suposições**
- **Onde colocar o teste `test.fail` novo.** Logo depois do teste de tablet (agrupamento por breakpoint,
  mesma ordem de leitura), não no fim do arquivo — mantém as duas medições do mesmo breakpoint próximas.
- **Título do teste `test.fail`.** Descreve o contrato esperado ("deveria ser o da PÍLULA, distinto do botão
  de ação"), não o defeito, para o relatório do Playwright não parecer afirmar o bug como normal.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo — o achado da regra global de raio (`_utilities.css:29-35`) já foi registrado pelo revisor no
  veredito anterior como "não é desta plan" e destinado ao backlog; esta correção só muda COMO o harness
  representa esse achado, não o corrige.

**Pendências / riscos**
- Nenhuma.

---

## Veredito — 2026-09-11 (correção 1) — 🟢 Aprovado

**Os dois achados estão fechados, e a correção ficou só em `browser-tests/cromo-css-real.spec.ts`.**

1. A asserção de igualdade de raio saiu do teste do tablet, que segue provando o resto da métrica. Um
   `test.fail` próprio afirma o **contrato** — o raio do item horizontal difere do raio do botão de ação —
   com o mecanismo da regra global descrito no comentário, sem número de backlog. **Rodei por mim:** build +
   Playwright com relatório `list` → o teste aparece como `x` (falha esperada) e o total fecha em **6
   passed**. O risco próprio de `test.fail` — engolir uma quebra do harness como se fosse a falha esperada —
   está coberto: o teste do tablet, logo acima, lê **os mesmos dois elementos** e passa; a falha esperada é
   a do contrato.
2. A mensagem do `text-transform` descreve o que a métrica **é**, sem narrar e sem citar o ADR que a
   síntese vai substituir.

A rodada anterior já tinha fechado o resto com evidência minha (suíte completa 1719/1719, gates verdes,
baseline igual); nenhum arquivo além do harness mudou desde então.

Critérios de aceite: **9/9 atendidos.** O de *"a origem dos 12px explicada ou corrigida"* foi atendido
por **explicação**, desfecho que a §5 item 5 aceitava — e a explicação virou achado de peso alto no
[[00-backlog]].

---

# 11. Síntese
