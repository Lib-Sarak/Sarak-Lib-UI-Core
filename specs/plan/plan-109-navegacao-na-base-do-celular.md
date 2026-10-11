---
tipo: "plan"
titulo: "Levar a navegacao do celular para uma barra na base, configuravel pelo tema"
objetivo: "Fazer o cromo no celular mostrar a navegacao numa barra fixa na base quando ha ate cinco destinos, com a escolha auto, base ou gaveta configuravel no painel, e tirar do navigationStyle a opcao dock que nenhum cromo implementa"
dominio: "Cromo / Multidispositivo / Navegacao"
status: "🟢 Aprovada"
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

## Resumo da execução — 2026-10-11

**Resultado:** Concluído com pendências (as execuções de navegador — `npm run build` e `cromo-css-real:check` — ficam para o revisor, por instrução do dono: sem rede nesta máquina).

**Estado do worktree ao iniciar**
```
M  specs/00-indice.md
D  specs/plan/plan-107-toque-e-entrada-no-celular.md
M  specs/plan/plan-109-navegacao-na-base-do-celular.md
M  specs/specs/07-responsividade-e-multidispositivo.md
M  specs/specs/10-seguranca-e-acessibilidade.md
```
(Estavam staged; foram commitados por outra ação durante a sessão — `29dfb52c`. Não toquei em nenhum além desta plan.)

**O que foi feito**
- `src/core/Design/schema/global.ts` — token `mobileNavigationStyle` (`auto`·`bottom`·`drawer`, padrão `auto`) logo abaixo do `navigationStyle`; opção `dock` e a menção a ela na descrição removidas.
- `src/core/Design/catalog/partitions/navigation_style.json` e `theme_table_mapping.json` — token novo na coluna `navigation_style`; `dock` fora de `allowedValues`/descrição. `src/core/Provider/generated/design-token-ids.ts` regenerado (`npm run token-types`).
- `src/core/Design/schema/navigation.ts:16` — descrição de `isNavHidden` deixou de citar `dock`.
- `src/components/Layout/chrome/mobileNavigation.ts` (novo) — regra pura: `auto` → barra com ≤ 5 itens, gaveta acima; `bottom`/`drawer` forçam; 0 itens → gaveta; valor desconhecido → `auto`.
- `src/components/Layout/chrome/ChromeBottomNav.tsx` (novo) — a barra: `<nav data-sarak-bottom-nav>`, um `SarakMenuItem` por destino (link, `aria-current`, `badge`, `disabled`), ícone sobre rótulo, `min-height/min-width: var(--sarak-touch-target-active, 0px)`, `padding-bottom` com `env(safe-area-inset-bottom)`, marcador do ativo.
- `src/components/Layout/SarakAppChromeMobile.tsx` — com a barra ativa a navegação sai do drawer (um espaçador mantém o rodapé do drawer embaixo) e a barra é irmã do painel de conteúdo; hambúrguer, drawer, widgets e slots de sidebar intactos.
- `src/components/Layout/chrome/useChromeDesignTokens.ts` — lê `mobileNavigationStyle` (tolerante).
- `docs/migracoes.md` — nota MAJOR sob 8.0.0. Gerados: `sarak-ui/*`, `sarak-dev/*` (`docs/component-catalog.*` sem mudança).
- Testes: `chrome/__tests__/mobileNavigation.test.ts` e `ChromeBottomNav.test.tsx` (novos); casos novos em `SarakAppChromeMobile.test.tsx`, `SarakAppChrome.test.tsx`, `SarakAppChrome.tokens.test.tsx` (`dock` salvo → sidebar), `useChromeDesignTokens.test.ts`, `validation.test.ts`, `PreviewSystemRenderer.test.tsx` (preview em celular mostra a barra). Casos antigos que abriam o drawer para achar a navegação passaram a forçar `mobileNavigationStyle: 'drawer'`. Snapshots `PreviewCanvas` e `PresetCard` regravados (diff = só o token novo).
- `browser-tests/navegacao-na-base.spec.ts` (novo) + cenas `navegacao-celular`/`navegacao-celular-7` e variantes de token em `browser-tests/fixtures/harness-entry.tsx`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/global.ts` | alterado | token novo; `dock` removido |
| `src/core/Design/schema/navigation.ts` | alterado | descrição de `isNavHidden` sem `dock` |
| `src/core/Design/catalog/partitions/navigation_style.json` | alterado | token novo; `dock` removido |
| `src/core/Design/catalog/theme_table_mapping.json` | alterado | token na coluna `navigation_style` |
| `src/core/Provider/generated/design-token-ids.ts` | gerado | +`mobileNavigationStyle` |
| `src/components/Layout/chrome/mobileNavigation.ts` | criado | regra de escolha |
| `src/components/Layout/chrome/ChromeBottomNav.tsx` | criado | barra da base |
| `src/components/Layout/SarakAppChromeMobile.tsx` | alterado | usa a regra e a barra |
| `src/components/Layout/chrome/useChromeDesignTokens.ts` | alterado | lê o token |
| testes (ver acima) e 2 snapshots | criado/alterado | cobertura da §5 |
| `browser-tests/navegacao-na-base.spec.ts`, `fixtures/harness-entry.tsx` | criado/alterado | casos de navegador |
| `docs/migracoes.md` | alterado | nota MAJOR |
| `sarak-ui/*`, `sarak-dev/*` | gerado | recontagem/catálogo |

**Verificações executadas**
- `npx vitest run` (completa) → 440 passaram / 3 falharam (443 arquivos): 2 snapshots pelo token novo (regravados) e `check-container-query-literal.test.mjs` com timeout de 5 s sob carga. Reexecutados: PreviewCanvas+PresetCard verdes; o gate de container query 15/15 isolado; `src/core/Design` + `src/features/DesignEngine/Canvas` 44 arquivos/204 testes verdes após a última edição. **Não repeti a suíte completa inteira depois dessas últimas edições.**
- `npx tsc --noEmit` → sem saída (0 erros).
- `container-query:check`, `container-query-boundary:check`, `class-merge:check`, `icon-port:check`, `chrome-token-parity:check` (43/43), `zero-brand:check` → OK; também `catalog:check`, `guide:check`, `dev-kit:check`, `barrel:check`, `token-types:check`, `migration-anchor:check` → OK.
- `npm run audit` → `auditor_paridade` 439/439/439. A falha do `audit` (ghostvars `--x` e `_base.css:27`; composição atômica em `SarakMultiSelect`/`SarakUploader`) é pré-existente: `npm run audit:baseline` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
- Mutação: `auto` sempre `drawer` → 5 falhas (`mobileNavigation.test.ts` com 3 itens e 4 casos de `SarakAppChromeMobile.test.tsx`); revertida.
- `grep "'dock'" src/core/Design/schema src/core/Design/catalog` → vazio.
- **Não rodei:** `npm run build`, `cromo-css-real:check`, `navegacao-na-base.spec.ts` (instrução do dono).

**Critérios de aceite**
- [x] `auto` resolve base ≤ 5 / gaveta acima; `bottom`/`drawer` forçam — `mobileNavigation.test.ts`, `SarakAppChromeMobile.test.tsx`.
- [ ] Barra medida em navegador (posição, caixa ≥ token, área segura, conteúdo não coberto) — DOM/atributos provados em `ChromeBottomNav.test.tsx`; a medição está em `browser-tests/navegacao-na-base.spec.ts` e **não foi executada**.
- [x] Nenhum widget nem slot some — `SarakAppChromeMobile.test.tsx` ("com a barra ativa o hambúrguer e o drawer seguem…").
- [x] `dock` fora de schema/catálogo; salvo `dock` lido como sidebar — `validation.test.ts`, `SarakAppChrome.tokens.test.tsx`.
- [x] Paridade convergente e `chrome-token-parity:check` verde — ver achado 1 (o gate não enxerga `global.ts`).
- [ ] Item 9 do `00-backlog` — é do revisor.
- [ ] Suíte completa verde final / `cromo-css-real:check` — suíte só reexecutada em recortes; navegador não rodado.

**Decisões e suposições**
- A barra é irmã do painel de conteúdo dentro da coluna do cromo (flex, não `position: fixed`): o conteúdo nunca fica coberto, sem padding compensatório. Consequência: o slot `footer` (última faixa do `ChromeFrame`) fica abaixo da barra — preservei "footer é a última faixa" (spec 05 §2.2).
- "Até 5 itens" conta `nav.length` (inclusive `disabled`); 0 itens → gaveta, mesmo com `bottom`.
- `bottom` forçado com > 5 itens mostra todos (a barra rola na horizontal se não couber).
- A barra segue os tokens de topbar e reusa a orientação `horizontal` do `SarakMenuItem`; sem orientação nova no `SarakShellNav`.
- O token mora em `global.ts`/coluna `navigation_style` e aparece sozinho em Configurações globais → Preferências Globais (a seção renderiza todos os tokens do schema `global`); nenhuma mudança no painel.
- A descrição de `isNavHidden` (navigation.ts:16) foi tratada como parte de "saída do `dock`".

**Achados fora do escopo (não corrigidos)**
1. `gates/scripts/contrato/check-chrome-token-parity.mjs` só varre `schema/navigation.ts` e parte de `system.ts`: `mobileNavigationStyle` (em `global.ts`) não é coberto pelo gate — o verde não prova o consumidor dele. O consumidor existe (`useChromeDesignTokens.ts`, `SarakAppChromeMobile.tsx`), por conferência minha.
2. `src/components/atomic/Navigation/SarakShellNav.tsx:46` (e o catálogo gerado que o copia) ainda cita `'dock'` como valor do shell legado.
3. `gates/scripts/contrato/__tests__/check-container-query-literal.test.mjs:143` estoura o timeout de 5 s sob suíte completa (intermitente).

**Pendências / riscos**
- `npm run build` + `cromo-css-real:check` por rodar; os casos de `navegacao-na-base.spec.ts` nunca foram executados e podem exigir ajuste de seletor.
- A área segura só se prova em aparelho real (headless vale 0; declarado no cabeçalho do spec).
- Rodar a suíte completa uma última vez antes de commitar.
- MAJOR: o padrão `auto` muda o visual do celular de quem tem ≤ 5 itens (nota em `docs/migracoes.md`).

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-11 — 🟢 Aprovado

**Verificado:** `npm run cromo-css-real:check` (build oficial, rodado pelo revisor com rede) → **99/99** verdes, inclusive os casos novos de `navegacao-na-base.spec.ts` (barra na base, caixa ≥ token, conteúdo não coberto; a área segura vale 0 em headless, como o cabeçalho do spec declara); `npx vitest run` → 443 arquivos, 2717 testes verdes; `tsc` 0; `audit:baseline` igual; `npm run audit` → paridade convergente com **439** tokens; Anel 1 do `pre-commit` e `barrel`, `catalog`, `guide`, `dev-kit`, `token-types`, `public-types`, `migration-anchor` verdes; `grep "'dock'" src/core/Design/schema src/core/Design/catalog` vazio. A mutação do executor (`auto` sempre `drawer` → 5 falhas) prova a regra. Diff lido: `mobileNavigation.ts` puro (desconhecido → `auto`; 0 itens → gaveta); `ChromeBottomNav` com `SarakMenuItem` (link, `aria-current`, `badge`, `disabled`), tokens de topbar, `env(safe-area-inset-bottom)` e o token de toque; a barra é irmã do painel de conteúdo (não cobre o conteúdo; o slot `footer` fica abaixo dela, coerente com "footer é a última faixa").

**Critérios de aceite:** todos atendidos. O item 9 original do `00-backlog` (`dock` sem consumidor) já tinha saído ao promover esta plan.

**Achados do executor transcritos para o `00-backlog`:** o `chrome-token-parity` não varre `schema/global.ts` (o token novo tem consumidor, conferido à mão, mas o gate não o prova); `SarakShellNav.tsx:46` ainda cita `dock`. O timeout do `check-container-query-literal.test.mjs` já é o item 30.
