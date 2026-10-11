---
tipo: "plan"
titulo: "Levar a navegacao do celular para uma barra na base, configuravel pelo tema"
objetivo: "Fazer o cromo no celular mostrar a navegacao numa barra fixa na base quando ha ate cinco destinos, com a escolha auto, base ou gaveta configuravel no painel, e tirar do navigationStyle a opcao dock que nenhum cromo implementa"
dominio: "Cromo / Multidispositivo / Navegacao"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "cromo", "mobile", "navegacao", "token", "adr"]
relacionados: ["[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]", "[[04-contrato-de-tokens-e-paridade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "adr/021-navegacao-na-base-do-celular.md + specs/05-cromo-e-slots.md + specs/07-responsividade-e-multidispositivo.md"
---

# 1. Objetivo

No celular, um sistema com até cinco destinos de navegação passa a tê-los numa **barra fixa na base** (ícone e
rótulo, na zona do polegar, sempre visível); com mais destinos, continua a gaveta. O administrador escolhe no painel
entre `auto` (o padrão), `bottom` e `drawer`.

# 2. Contexto

**Decisão do dono, 2026-10-10:** opção (c) — `auto` por padrão, configurável na aba de configuração. Veio da avaliação
contra um material de design system para mobile (zona do polegar: 49% usam uma mão só; "a sidebar não sobrevive ao
celular"; barra na base para 3 a 5 destinos frequentes; gaveta para muitos destinos raros, "o escondido é esquecido").

**Hoje** (`src/components/Layout/SarakAppChromeMobile.tsx`): no celular o cromo vira barra + hambúrguer + drawer, e a
navegação (`SarakShellNav` vertical) mora **dentro** do drawer, junto com os widgets e os slots de sidebar
([[05-cromo-e-slots]] §2.3 e §4). Não há barra na base.

**O token `navigationStyle`** (`src/core/Design/schema/global.ts:21-33`) oferece `dock` ("barra inferior estilo
mobile/dock, híbrida"), que nenhum cromo implementa desde que o `SarakShell` saiu — `useNavigationStyle` a trata como
sidebar (item 9 do backlog, promovido nesta plan). A barra na base do celular torna a opção redundante.

Regras que não mudam: o item de navegação é um link de verdade ([[05-cromo-e-slots]] §2.1.2); nenhum slot nem widget
é descartado em nenhum modo (§2.3); o painel de conteúdo é quem rola (§5.1); o modo do cromo segue a janela, e o resto
segue container query ([[07-responsividade-e-multidispositivo]] §6.1).

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/` — token novo `mobileNavigationStyle` (`auto` · `bottom` · `drawer`, padrão `auto`), na mesma seção do `navigationStyle`, com a paridade de `src/core/Design/catalog/theme_table_mapping.json` e da partição do catálogo; e a saída da opção `dock` do `navigationStyle`.
- `src/components/Layout/SarakAppChromeMobile.tsx` e `src/components/Layout/chrome/` — a barra na base (a navegação sai do drawer quando ela está ativa; o hambúrguer e o drawer continuam para widgets e slots de sidebar).
- `src/components/atomic/Navigation/` — só se a barra precisar de uma orientação nova do `SarakShellNav` ou de um item próprio.
- Painel (`src/features/DesignEngine/`) — só se o token não aparecer sozinho na seção certa.
- Testes; caso novo em `browser-tests/` (barra na base no celular emulado: posição, altura tocável, conteúdo não coberto, área segura); artefatos regenerados; `docs/migracoes.md`.

## 3.2 Fora
- O cromo de tablet e desktop; os widgets em si.
- Gestos de arrastar para abrir a gaveta.
- Qualquer spec em `specs/` (a síntese é do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/05-cromo-e-slots.md` §2.1.2, §2.2.2, §2.3, §2.4, §4, §5.1 | link de verdade, composição, degradação por modo, token de cromo com consumidor, acessibilidade do celular, rolagem |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` §5 e §6.1 | o que adapta sozinho; janela × região |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | paridade do token novo e da opção removida |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` §6.2.2 | o preview desenha o cromo real |
| ADR | `adr/018-um-cromo-so-e-o-consumidor-e-dono-das-rotas.md` | a lib não é host |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` §5 (linhas "Todo acionável" e "Todo campo") e `src/styles/_touch.css` | o token `touchTargetMin` e a variável `--sarak-touch-target-active` que a barra usa (vieram da `plan-107`, já sintetizada) |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-novo-componente` (token novo) · `ui-refatorar-componente` (opção removida) | paridade nas três fontes |
| **Skill** | `test-unitario` | os casos da §5 |
| Código | `src/components/Layout/SarakAppChromeMobile.tsx`, `src/components/Layout/SarakAppChrome.tsx`, `src/core/Design/schema/global.ts` | o estado atual |

# 5. Instruções de execução

1. Criar `mobileNavigationStyle` com paridade completa; `auto` resolve para `bottom` quando o cromo tem **até 5 itens de navegação** e para `drawer` acima disso.
2. Barra na base (`bottom`): fixa na base da raiz do cromo no celular; cada item com ícone **e** rótulo, estado ativo, `badge` e `disabled` como os do item de navegação; altura tocável pelo token `touchTargetMin` (a `--sarak-touch-target-active`, ver [[07-responsividade-e-multidispositivo]] §5); respeita a área segura (`env(safe-area-inset-bottom)`); o painel de conteúdo ganha o respiro dela e não fica coberto. Com a barra ativa, a navegação sai do drawer; o hambúrguer e o drawer continuam com os widgets e os slots de sidebar.
3. Tirar `dock` das opções do `navigationStyle`; valor salvo `dock` continua lido como `sidebar` (como hoje), com o aviso de valor fora do contrato.
4. O token aparece no painel na seção do `navigationStyle`, e o preview em celular mostra a barra.
5. Testes: `auto` com 3 e com 7 itens; `bottom` e `drawer` forçados; item ativo com `aria-current`; navegação por clique e teclado; widgets e slots continuam no drawer; `dock` salvo cai em sidebar. Em `browser-tests/`, com toque emulado: a barra está na base, os itens têm caixa ≥ o token, e o último item do conteúdo fica visível acima da barra ao rolar até o fim.
6. Regenerar artefatos; nota de migração **MAJOR** (o padrão `auto` muda a navegação do celular para quem tem até 5 itens; a opção `dock` sai do schema).
7. Rodar a verificação da §7.

# 6. Critérios de aceite

- [ ] `auto` resolve para barra na base com até 5 itens e para gaveta acima; `bottom` e `drawer` forçam.
- [ ] Barra na base com ícone e rótulo, ativo, `badge`, `disabled`, links de verdade, caixa tocável ≥ o token, área segura, conteúdo não coberto (medido em navegador).
- [ ] Nenhum widget nem slot some com a barra ativa.
- [ ] `dock` fora do schema e do catálogo; valor salvo `dock` lido como `sidebar`.
- [ ] Paridade convergente (`npm run audit` → `auditor_paridade`) e `chrome-token-parity:check` verde (o token novo tem consumidor no cromo).
- [ ] Item 9 removido do `00-backlog` pelo revisor no veredito.
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; `cromo-css-real:check` verde; catálogo, kit e barril em dia.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — o `chrome-token-parity:check` existente cobra que o token tenha consumidor no cromo.

- `git diff --stat` → só a §3.1 e os gerados.
- `npm run cromo-css-real:check` → verde, com os casos novos.
- Mutação: forçar `auto` a sempre `drawer` → o caso de 3 itens falha.
- `grep -rn "'dock'" src/core/Design/schema src/core/Design/catalog` → vazio.
- `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline` · `npm run audit` · `npm run chrome-token-parity:check` · `catalog:check` · `guide:check` · `barrel:check`.

# 8. Destino da síntese

**Destino:** `adr/021-navegacao-na-base-do-celular.md + specs/05-cromo-e-slots.md + specs/07-responsividade-e-multidispositivo.md`

**ADR-021 (novo)**, a escrever pelo revisor no transporte, com as alternativas e o custo de cada:

| Opção | Custo |
|---|---|
| Manter a gaveta para toda navegação no celular | a navegação mais usada fica escondida e no canto mais difícil de alcançar com o polegar |
| `mobileNavigationStyle` só como opção, padrão gaveta | quem não configura continua no pior caso; o padrão não é o certo |
| **`auto` por padrão (base com até 5 itens), configurável — escolhida** | muda o visual do celular de quem atualiza (MAJOR); mais um modo de cromo para manter e medir |

Voltar atrás seria caro: o padrão vira hábito do usuário final e contrato visual dos consumidores.

Para a [[05-cromo-e-slots]] §2.3, na linha do celular: com `mobileNavigationStyle` resolvido para `bottom`, a
navegação fica numa barra fixa na base (ícone e rótulo, área segura, conteúdo não coberto) e o drawer guarda os
widgets e os slots de sidebar; com `drawer`, como hoje. E na §2.4: o token novo e o `navigationStyle` sem `dock`.

Para a [[07-responsividade-e-multidispositivo]] §5, na linha do `SarakAppChrome`: o celular escolhe entre barra na base
e gaveta pelo número de itens, configurável.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
