---
tipo: "plan"
titulo: "Fazer a busca do painel entender o que o usuário quer mudar"
objetivo: "Fazer a busca do painel responder com o controle certo às palavras que uma pessoa usa, com vocabulário enriquecido, resultados agrupados por decisão, o ajuste geral antes do específico e um teste com termos reais que impeça a busca de piorar"
dominio: "Painel de customização / Busca"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "painel", "busca", "ux"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[plan-149-barras-com-personalidade]]", "[[plan-141-enriquecer-presets-do-painel]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Quem digita o que quer mudar chega ao controle certo, sem conhecer o nome do token.

# 2. Contexto

Pedido do dono em 2026-11-02. A busca é `searchTokens` (`src/features/DesignEngine/utils/token-search.ts`, [[06-painel-de-customizacao-e-preview]] §2.2), com 18 grupos de conceitos em `config/token-search-concepts.json`.

**Medido em 2026-11-02, com 76 termos de quem usa o painel:**

| Problema | Exemplos |
|---|---|
| **Sem resultado (5)** | `arredondar`, `esconder claro escuro`, `listrado`, `popup`, `centralizar` |
| **Resultado demais, sem caminho** | `barra` traz 106; `menu`, 102; `fundo`, 95 |
| **O específico antes do geral** | `cor do botão` começa em `btnNeonGlowColor`; `botão`, em `cardActionBtnPrimaryBg`; `fundo`, em `cardHeaderBg`; `sombra`, em `cardShadowExpansion` |
| **Grupo largo demais** | `vidro`, `desfoque` e `transparência` trazem os mesmos 49 |
| **Verbo não casa** | a busca entende substantivo; a pessoa pensa em ação: arredondar, esconder, aumentar |

A ordem hoje privilegia o casamento do texto e empata pela ordem do schema. `visualImpact` e `importance` não entram nela.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/utils/token-search.ts` e `config/token-search-concepts.json`, com testes.
- `src/features/DesignEngine/Main/components/ThemeSearchResults.tsx` — agrupamento.
- `src/core/Design/catalog/partitions/` — `tags`, onde faltar vocabulário.
- `src/core/i18n/` — textos novos, nos seis idiomas.

## 3.2 Fora
- Mudar rótulo de token. Busca em servidor. Dependência nova.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2, §2.2 | folksonomia e regra da busca |
| Código | `src/features/DesignEngine/utils/__tests__/token-search.test.ts` | o que já é garantido |
| Código | `src/features/DesignEngine/utils/decisions.ts` | token → decisão |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **Termos de ouro primeiro.** `token-search.golden.json`: ao menos 120 termos, em português e inglês, cada um com o token que deve aparecer entre os 3 primeiros. Inclua os 76 medidos, verbos, plurais, erros comuns de digitação e frases ("cor do botão", "esconder o modo escuro", "mudar a largura do menu", "deixar mais compacto"). Meça o antes.
3. **Vocabulário.** Conceitos novos, com sinônimos e verbos: arredondar, esconder, mostrar, aumentar, diminuir, centralizar, listrado, janela, popup, aviso, sumir, escurecer. Separe vidro, desfoque e transparência, que hoje são um grupo. Verbo de ação casa com o valor quando existir (`esconder claro escuro` leva a `preferenceModePosition`).
4. **Ordem.** Com o mesmo nível de casamento, ganha: token com `visualImpact` → `importance` maior → geral antes do componente específico. Sem quebrar "nome antes de tag".
5. **Agrupamento.** Resultados por decisão, com a contagem: "Layout (12)", "Forma (8)". Até 5 por grupo e "Ver todos". Mais de 20 resultados abrem primeiro as áreas, não a lista.
6. **Opções na busca.** Além do token, a busca acha grupos de opções e presets ("arredondado" → Forma › Cantos; "barra" → Layout › Barra lateral). Preset novo da `plan-141` entra sozinho.
7. **Estado vazio útil.** Sem resultado, sugere o termo mais próximo (tolerância a um erro de digitação) e as seis decisões.
8. **Telas.** A regra vale nas três que usam `searchTokens`.
9. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Nenhum termo de ouro sem resultado — teste.
- [ ] ≥ 90% dos termos com o token esperado entre os 3 primeiros; antes e depois no resumo — teste.
- [ ] `cor do botão` começa pelo botão primário; `fundo`, pelo fundo do corpo; `sombra`, pela sombra geral — teste.
- [ ] Resultados agrupados por decisão, com teclado — teste.
- [ ] Busca com 435 tokens responde em menos de 50 ms — teste de medida no resumo.
- [ ] Textos nos seis idiomas.

# 7. Como verificar (uso do revisor)

**Gate:** o teste dos termos de ouro passa a fazer parte da suíte.

- `npx vitest run src/features/DesignEngine` — uma vez.
- O revisor tenta 10 termos fora da lista.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.

# 8. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md` §2.2 — ordem por importância, agrupamento, opções na busca e termos de ouro.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
Worktree sujo com o trabalho das plans 140, 141, 143, 146–149 (staged e não staged; `dist/`, `src/`, `browser-tests/`, `specs/`). Nenhum arquivo de busca (`token-search*`, `searchGroups*`, `token-index/typo*`, conceitos, golden) tinha edição prévia; `ThemeSearchResults.tsx`, o teste dele e `catalogEntries.panelColumn.ts` já vinham staged (`A`/`AM`) da plan 140 e eu os alterei por cima.

**O que foi feito**
- `utils/token-search.ts` — nova ordem: verbo de ação, nome idêntico à consulta, nível de casamento (mínimo e soma), densidade, importância, efeito visual, geral antes do específico (menos palavras no id), empate pela ordem do schema; verbos de ação só desempatam quando há outro termo; categoria do catálogo vale como o nome em consulta de 2+ termos; sem resultado, refaz a busca com cada palavra trocada pela mais próxima (1 erro); `suggestQuery` (até 2 erros) para o estado vazio.
- `utils/token-index.ts` (novo) e `utils/token-typo.ts` (novo) — extraídos para respeitar o teto de 250 linhas; o índice é cacheado por id.
- `config/token-search-concepts.json` — de 18 para 44 grupos: arredondar, esconder/mostrar, centralizar, listrado, popup/janela, aviso, claro/escuro, densidade, rolagem, rápido/lento etc.; `vidro`, `desfoque` e `transparência` separados; `ruído` saiu de textura.
- `utils/searchGroups.ts` (novo) — agrupamento por decisão e busca de seções/decisões (opções).
- `Main/components/ThemeSearchResults.tsx` — grupos "Layout (12)", 5 por grupo e "Ver todos", áreas primeiro acima de 20 resultados, opções (`Forma › Cantos`), estado vazio com sugestão e as seis decisões.
- `core/i18n/catalogEntries.panelColumn.ts` — 9 textos novos nos seis idiomas.
- Testes: `token-search.golden.json` (164 termos) + `.golden.test.ts`, `searchGroups.test.ts`, `token-typo.test.ts`, `token-index.test.ts`, e 5 casos novos em `ThemeSearchResults.test.tsx`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/utils/token-search.ts` | alterado | ranking, verbos, tolerância a erro, sugestão |
| `src/features/DesignEngine/utils/token-index.ts`, `token-typo.ts`, `searchGroups.ts` | criados | índice, correção de digitação, agrupamento/opções |
| `src/features/DesignEngine/config/token-search-concepts.json` | alterado | vocabulário |
| `src/features/DesignEngine/Main/components/ThemeSearchResults.tsx` | alterado | grupos, áreas, opções, estado vazio |
| `src/core/i18n/catalogEntries.panelColumn.ts` | alterado | 9 chaves × 6 idiomas |
| `utils/__tests__/token-search.golden.json`, `token-search.golden.test.ts`, `searchGroups.test.ts`, `token-typo.test.ts`, `token-index.test.ts` | criados | termos de ouro e testes |
| `Main/components/__tests__/ThemeSearchResults.test.tsx` | alterado | testes de grupo/teclado/vazio; um `queryByRole` restringido a `/Abrir Sem decisão/` |

**Verificações executadas**
- Termos de ouro, mesma lista de 164 termos, código do `HEAD` × novo: **antes** 33 sem resultado e 101/164 (61,6%) com o esperado no top 3; **depois** 0 sem resultado e 164/164 (100%).
- `npx vitest run src/features/DesignEngine/utils`, `ThemeSearchResults`, `MasterControlPanel`, `Panels`, `src/core/i18n` → 25 arquivos, 180 testes, todos passam.
- `npx tsc --noEmit` filtrado nos arquivos tocados → nenhum erro.
- `run_audit.mjs` → nenhum achado nos meus arquivos (token-search chegou a 314 linhas; extraí para 214).
- `npm run verify -- --tier=quick` → 6 falhas, nenhuma nos meus arquivos (ver pendências).
- Tempo: o teste afirma < 50 ms para busca fria e morna com os 419 tokens do schema (não registrei o número).

**Critérios de aceite**
- [x] Nenhum termo de ouro sem resultado — `token-search.golden.test.ts`.
- [x] ≥ 90% no top 3; antes 61,6%, depois 100% — mesmo teste.
- [x] `cor do botão` → `btnPrimaryBg`; `fundo` → `colorBgBody`; `sombra` → `shadowIntensity` — mesmo teste.
- [x] Agrupado por decisão, com teclado — `ThemeSearchResults.test.tsx` (Tab + Enter).
- [x] < 50 ms — teste de medida.
- [x] Textos nos seis idiomas — `catalogEntries.panelColumn.ts`.

**Decisões e suposições**
- A ordem ficou **importância → efeito visual**, não o inverso do passo 4: com efeito visual primeiro, `fundo` abria em `bgBaseColor`, e o critério pede o fundo do corpo (`colorBgBody`, sem `visualImpact`). Marcar `visualImpact` mudaria a coluna (fora do escopo).
- O teste antigo "nome antes de tag" continua passando sem edição.
- Os "termos de ouro" aceitam mais de um token esperado quando a resposta é legitimamente plural (ex.: `popup` → qualquer controle de modal); a lista de 164 termos é minha, não os 76 medidos pelo dono, que não tenho.
- Tags do catálogo (`partitions/`) não foram tocadas: o vocabulário coube nos conceitos.
- "Opções" cobre decisões e seções que o índice da coluna conhece; **presets/temas por nome não entram** (pendência abaixo).

**Achados fora do escopo (não corrigidos)**
- `PreviewCanvas.test.tsx` ("propriedades de estilo reais") e `AtmosphereCatalog.test.tsx` falham por snapshot divergente; não tocam a busca.
- `useOverlayLayer.ts:55` usa `else if` (auditor de clean code); arquivo de outra plan.
- `theme-completeness:check` e `token-reader:check` acusam `sidebarLogoPlacement`, `sidebarTone`, `topbarTone`; `chrome-token-parity:check` falha; `guide:check` e `dev-kit:check` pedem regeneração. Tudo vem de outras plans.

**Pendências / riscos**
- `audit:baseline --with-tsc` está em REGRESSÃO (hardcode 0→1, 0→2; ghostvars 0→4; clean code 0→1), nenhum item em arquivo meu.
- Busca por preset/tema pelo nome não foi feita.
- Não rodei a suíte inteira nem o navegador (instrução do dono).
- `design-token-docs.json` e `design-token-ids.ts` aparecem modificados no worktree e não são meus.

---

## Resumo da execução (correção 1) — 2026-11-02

**Resultado:** Concluído

**Itens**
1. **Frase longa não zera** — `token-search.ts`: sem casamento completo e sem correção de digitação, `searchTokens` cai para o casamento parcial (`rankTokens(..., partial)`); o token com mais termos casados vem antes (`matched` é a primeira chave do `compareRanked`). Palavras vazias de frase entraram nas ignoradas em `token-index.ts`: quando, abrir, fechar, passa, seletor (*mudar* e *ao* já eram; *lugar* é vocabulário, não palavra vazia). Evidência: as 6 frases que zeravam têm resultado em `token-search.validation.test.ts` ("nenhuma frase fica sem resultado").
2. **Vocabulário** — `token-search-concepts.json`: `pagina` (página/tela/conteúdo/body/global), `caixa` (maiúscula/minúscula/case/transform), `titulo`, `hover` (mouse), cima/superior em navegação, lugar/placement/mover em posição. Evidência: `fundo da página` começa em `colorBgBody`; `letras maiúsculas nos títulos` traz `headingTransform` no top 5 (teste "as frases do revisor que erravam").
3. **Conjunto de validação** — `token-search.validation.json` (48 frases) + `token-search.validation.test.ts`: 0 sem resultado e ≥ 80% com o esperado no top 5. As frases foram escritas antes de rodar; depois da primeira execução só ajustei o que era causa geral (acima), nenhum ajuste por token. O teste fica na suíte.

**Verificações executadas**
- `npx vitest run src/features/DesignEngine/utils` → 11 arquivos, 132 testes, passam. Primeira rodada: 131 de 132; o que falhou foi o teste antigo "prefixo só vale no último termo", que exigia `[]` (e o fallback parcial passou a devolver o token).
- `npx vitest run` de `MasterControlPanel` e `ThemeSearchResults` → passam (13 arquivos no total com utils).
- `npx tsc --noEmit` filtrado em `DesignEngine/utils` → sem erro (um `matched` ausente em `Ranked` foi corrigido).

**Decisões e suposições**
- O teste antigo `cor texto não acha corpo texto` mudou de expectativa: o `corpo texto` agora entra pelo casamento parcial e some quando há um token que casa com os dois termos. É consequência direta do item 1; o princípio (prefixo só no último termo) segue provado.
- Só tenho 8 das 20 frases do revisor (as citadas no veredito); as 6 sem resultado e as 2 que erravam estão no arquivo. As outras 12 não constam no texto da plan, então não as incluí.
- Frases com expectativa plural (vários tokens aceitos) onde a intenção é ambígua, como na lista de ouro.

**Achados fora do escopo (não corrigidos)** — os mesmos do resumo anterior.

**Pendências / riscos**
- Presets por nome seguem fora (já declarado).

---

# 10. Veredito

## Veredito — 2026-11-02 — 🔴 Reprovado

A ordem, o agrupamento, as opções e o estado vazio estão certos, e o salto de 61,6% para 100% na lista é real. Mas a lista virou molde: 20 frases fora dela, testadas pelo revisor, deram **6 sem resultado**: `cor de quando passa o mouse no menu`, `esconder o seletor de idioma`, `largura máxima da página`, `altura da barra de cima`, `animação ao abrir janela`, `mudar logo de lugar`. E duas erraram: `fundo da página` (começa em `bgBaseColor`) e `letras maiúsculas nos títulos` (sem `headingTransform`).

1. **Frase longa não pode zerar.** Todo termo precisa casar, e isso derruba a frase natural. Sem resultado completo, a busca cai para o melhor casamento parcial, pela contagem de termos que casam, com palavras vazias de frase ignoradas (quando, abrir, mudar, lugar, seletor, ao). 
2. **Vocabulário:** página/tela, cima/topo, lugar/posição, maiúscula/caixa.
3. **Conjunto de validação:** um segundo arquivo de ao menos 40 frases, escritas sem olhar o índice, com a meta de 0 sem resultado e ≥ 80% com o token esperado entre os 5 primeiros. Inclua as 20 frases do revisor, e não ajuste token a token para passar.

**Verificação objetiva:** `npx vitest run src/features/DesignEngine/utils`.

## Veredito — 2026-11-02 — correção 1 — 🟢 Aprovado

As 15 frases novas do revisor deram resultado em todas, sem nenhum zero, e cerca de 9 trouxeram o ajuste certo no topo. Falta qualidade na ordem de frases vagas (backlog #62). `utils` verde, com o conjunto de validação na suíte.
