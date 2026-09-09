---
tipo: "plan"
titulo: "Corrigir a métrica do item de navegação horizontal para caixa normal"
objetivo: "Os itens de menu da topbar deixam de ser renderizados como etiqueta e voltam a parecer navegáveis"
dominio: "Sarak-Lib-UI-Core / Componentes atômicos / Navegação"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "navegacao", "tipografia", "adr", "major"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/04-shell-e-discovery]]", "[[adr/013-item-de-navegacao-como-atomo-proprio]]"]
depende_de: "plan-67-widgets-do-cromo-por-padrao-com-opt-out"
retida_por: ""
destino_sintese: "adr/NNN-metrica-do-item-de-navegacao-horizontal.md · specs/05-cromo-e-slots.md"
---

# 1. Objetivo

O item de navegação em orientação horizontal passa a usar caixa normal e corpo legível, mantendo a pílula e
o realce de item ativo que o distinguem de uma lista.

# 2. Contexto

O dono reportou que a topbar está pobre *"em funcionalidade e aparência"*. As plans 65 a 67 tratam da
funcionalidade. Esta trata da aparência, e ela tem número medido.

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

Esta plan vem **depois** da 67 de propósito: medir a métrica do cromo final vale mais do que medir um
estado intermediário que ainda vai mudar.

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
| Código | `src/components/atomic/Navigation/SarakMenuItem.tsx:48-58` | a métrica das duas orientações |
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

---

# 10. Veredito

---

# 11. Síntese
