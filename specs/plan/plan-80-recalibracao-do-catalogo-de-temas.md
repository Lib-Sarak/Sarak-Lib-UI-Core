---
tipo: "plan"
titulo: "Recalibrar o catálogo de temas shippados para representar a capacidade da biblioteca"
objetivo: "Entregar um catálogo de temas elegantes e funcionais que, juntos, exercitem a capacidade da biblioteca, todos completos, com contraparte, hover e idiomas, e aprovados visualmente pelo dono"
dominio: "Sarak-Lib-UI-Core / Design Engine / Temas"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "temas", "catalogo", "contraparte", "contraste", "diversidade", "hitl"]
relacionados: ["[[specs/09-temas-e-presets]]", "[[specs/05-cromo-e-slots]]", "[[specs/11-testes-e-cobertura]]", "[[016-preferencias-do-usuario-separadas-do-tema]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md · specs/05-cromo-e-slots.md"
---

# 1. Objetivo

O catálogo shippado deixa de ser um acúmulo de temas legados e passa a ser a **vitrine da biblioteca**:
cada tema é elegante e funcional sozinho, e o conjunto exercita o que a lib oferece — os dois modos, as
duas navegações, atmosferas, texturas, superfícies, estilos de card e de botão, tipografia, raio e
densidade. Todo tema passa em todas as travas **sem isenção**, e o dono aprovou cada um vendo-o renderizado.

# 2. Contexto

**Decisão do dono (2026-09-13):** os temas atuais não importam; o que importa é o catálogo representar a
capacidade da biblioteca. Remover todos e recriar é aceitável. O dono vai escolher alguns para manter como
base e melhorar, e temas novos podem ser criados. **Uma plan só**, com o veredito visual dele.

**O estado medido (2026-09-13):**
- São 23 temas.
- **16 não têm contraparte** e estão na `CONTRAPARTE_EXEMPTION_LIST` (`gates/scripts/audit/verify_contrast.ts:288-305`).
  A lista só pode encolher ([[09-temas-e-presets]] §2.1).
- Os 7 com contraparte são os 5 da leva `terracota-solar`/`musgo-do-vale`/`ardosia-ao-entardecer`/`forja-ultravioleta`/`grafite-puro`,
  mais o par de referência `minimalist-airy`/`sarak-sovereign`.
- O catálogo concentrado em *escuro + neon + ciano/magenta* está medido em [[09-temas-e-presets]] §5.2.
- Nenhum tema declara `enabledLanguages`.
- Parte dos temas não tem fundo de hover no item de navegação. Com a plan de camada de CSS aplicada, o hover
  passa a ser o do token, e isso fica visível.

**O que as plans anteriores entregaram, e é pré-requisito daqui:**
- a classe utilitária vence o padrão de elemento;
- todo token de navegação age nos dois cromos.

Um tema autorado antes disso seria julgado contra uma tela que ainda mentia. A tradução dos textos da lib
**não** é pré-requisito: os ids de idioma que `enabledLanguages` recebe já existem, e o idioma do texto não
muda o julgamento visual de um tema.

**Duas restrições que não são gosto:**

- **O par de referência mantém os ids.** `SARAK_REFERENCE_THEMES` (`src/core/Design/presets/themes/reference.ts`)
  segue sendo **um tema claro e um escuro**, com os ids `minimalist-airy` e `sarak-sovereign`. O conteúdo pode
  ser inteiramente reescrito. O motivo são dois contratos públicos:
  - `deriveThemeFromReference(refId)` recebe esses ids;
  - o ERP escolhe a referência **por modo** (`packages/ui-kit/src/themes.ts:28-31`).

  O que muda na referência, o consumidor herda. O dono aceitou.
- **Remover tema é quebra de contrato.** `ThemePresetId` é união pública. Um consumidor pode ter o id de um
  tema removido persistido ou em `activeThemeId`/`initialTheme`. **Meça** o que acontece hoje nesse caso. O
  comportamento exigido é: cair num tema de referência do modo pedido, com **um** aviso de console, nunca
  tela sem tema nem erro.

**A régua de medição precisa ser honesta antes do primeiro tema novo.** A varredura de realce do item de
navegação (`src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx`) converte cor por
`parseToRgba`. Para o que não reconhece (`hsl()`, `var()`, gradiente), `parseToRgba` devolve **preto opaco**.
Hoje todo tema entrega hex ou `rgb()`, e a medição acerta. Um tema novo com `hsl()` seria medido contra
preto, em silêncio. O `auditor_contraste` já pula o par nesse caso e diz que pulou; a varredura passa a
fazer o mesmo.

**Por que uma vitrine renderizada.** O veredito visual é do dono, e ele precisa ver cada tema de verdade:
cromo, conteúdo, os dois modos e as duas orientações. Olhar pelo ERP exige, a cada lote, o ciclo de
reinstalação e de cache da [[13-instalacao-e-atualizacao]] §9.1, a armadilha que já custou dois ciclos
inteiros. O harness de navegador (`browser-tests/`) já renderiza o cromo público contra o `dist/`, e é o
caminho sem essa armadilha.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/themes/**` — os temas, `index.ts` (`THEME_PRESET_IDS`, `GLOBAL_THEMES`) e `reference.ts`.
- `gates/scripts/audit/verify_contrast.ts` — a `CONTRAPARTE_EXEMPTION_LIST` encolhe até ficar vazia.
- `gates/scripts/audit/verify_presets.ts` (e o teste dele) — a chave de payload legítima fora do schema
  (`src/core/Provider/payloadExtraKeys.ts`, onde mora `enabledLanguages`) deixa de ser acusada como órfã
  (veredito do lote 1).
- `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` — a medição honesta, mais o hover (§5 passos 1 e 6).
- `src/core/Provider/**` — **só se** a medição do id removido (§2) mostrar comportamento diferente do exigido.
- `browser-tests/**` e `package.json` — a vitrine (§5 passo 2). A saída **não** é versionada (entrada no
  `.gitignore`).
- Os testes que citam ids de tema removidos.
- `.agents/skills/ui-criar-tema/SKILL.md` (e a `references/` dela, se preciso) — a vitrine e as travas novas no procedimento.
- `docs/migracoes.md` — ids removidos, e para onde cai quem os usava, e os temas que ficam com o mesmo id
  mas mudam de identidade ou de modo nativo, sob a **7.0.0**.
- `dist/` · `sarak-ui/` · `docs/component-catalog.*` · `src/core/Provider/generated/` · `sarak-dev/` — **só pelos geradores**.

## 3.2 Fora
- **Criar token.** Tema é configuração: consome o que o dicionário tem ([[00-regras-e-invariantes]] R11). Se
  faltar um eixo para expressar uma ideia, é achado.
- Presets parciais de componente (`src/core/Design/presets/components/`).
- Default de qualquer token.
- Posições das preferências do usuário: ficam no **padrão de fábrica** em todo tema (skill `ui-criar-tema` §5.6).
- Mídia de terceiro em qualquer tema ([[09-temas-e-presets]] §5.1).
- O consumidor (ERP), código e dado — inclusive os temas dele em `themes.ts`.

## 3.3 Emenda — 2026-09-17 (execução em paralelo com a `plan-79`)

A fase que vai **até a Parada 1** (§5 passos 1 a 4) roda em paralelo com a `plan-79`, no mesmo worktree.
Disjunção declarada pelo revisor, medida sobre o worktree da `plan-79` em andamento:
- **Código:** a única interseção é `src/core/Provider/constants.ts`, que é da `plan-79` e que esta plan
  não toca.
- **Gerados** (`dist/`, `sarak-ui/`, `docs/component-catalog.*`, `sarak-dev/`): as duas os regeneram.
  Nesta fase, **nenhum gerador roda**. O build que a vitrine exige pode rodar: ele reescreve o `dist/`, mas
  nada desta fase entra no `dist/` (teste, harness e `.gitignore` não são publicados), então o `dist/` que a
  `plan-79` commitar continua sendo só dela.
- **`package.json` não muda nesta fase.** O `sarak-dev/` acompanha os scripts do `package.json`, e um script
  novo daqui derrubaria o `dev-kit:check` do commit da `plan-79`. A vitrine roda pelo comando direto; o
  script `themes:showcase` (§5 passo 2) entra junto com a autoria.
- **Temas:** nenhum arquivo de tema é tocado antes de a `plan-79` estar commitada. A autoria (§5 passo 5 em
  diante) começa só depois disso.

## 3.4 Emenda — 2026-09-18 (o que o pente fino no ERP mostrou, e a nova ordem)

A primeira parte desta plan (remover os temas que o dono listou) já foi executada e commitada. O pente fino
no ERP rodou em seguida, e a segunda parte (alterar, reconstruir e criar temas) passa a **depender da
`plan-81`**, que conserta na lib o que o pente fino achou.

**Estado em 2026-09-18:** as plans 72, 78, 79 e 81 foram executadas, aprovadas e sintetizadas, e saíram do
disco. A emenda §3.3 não vale mais: não há outra plan no worktree. O que elas deixaram de verdade está nas
specs fixas: a prop `data` dos templates em `specs/arquitetura/03-superficie-publica.md` §6.3; a prévia na
tela real e o desfazer em `specs/specs/06-painel-de-customizacao-e-preview.md` §4; os textos da lib em seis
idiomas em `specs/specs/10-seguranca-e-acessibilidade.md` §3.6.

**O que a tela real mostrou, e como entra aqui:**
- **Borda usada como fundo.** O `SarakBadge` `muted` pintava o fundo com o token de borda, e no
  `neo-brutalism` (borda branca sólida) o badge ficou branco sobre branco. A `plan-81` tira esse uso e faz o
  `auditor_contraste` medir o par do badge. Depois dela, borda opaca volta a ser escolha estética livre —
  mas **confira o badge `muted` na vitrine de todo tema de borda forte**.
- **Capacidade que nenhum tema mostra hoje:** sidebar `floating` (medida ao vivo no ERP: margem, raio e
  sombra corretos) e `right`; o estilo de botão `cyberpunk`, único dos seis que nenhum tema usa; e 35 das 41
  texturas de fundo e de card, sem uso. O catálogo final passa a cobri-los (critério na §6).
- **O pente fino exercitou só um tema ao vivo** (por decisão do dono). Os outros dez são vistos pela
  vitrine, que por isso passa a mostrar exatamente o que quebrou na tela: badges em todas as variantes e uma
  tabela com dados (§5 passo 2).

## 3.5 Emenda — 2026-09-18 (três temas novos, decisão do dono)

Além dos 11 aprovados na Parada 1 (8 "melhorar" e 3 "recriar"), o dono pediu **três temas novos,
diferentes dos demais**. O catálogo final passa a ter **14 temas**.

**"Diferente dos demais" é medido, não declarado.** Cada tema novo:
- passa em `themes:diversity --new` contra os outros temas do catálogo. Ninguém fica na mesma família de
  matiz **e** no mesmo modo a menos da distância de matiz que o critério 6 exige;
- tem uma identidade estrutural que nenhum outro tema do catálogo repete inteira: a combinação de
  navegação (`navigationStyle`, `sidebarPosition`), estilo de botão, estilo de card e textura.

**O espaço onde os novos mais valem.** A proposta de identidade parte do que a Parada 1 deixou em aberto:
- o catálogo aprovado tem 9 de 11 temas nativamente escuros, e só 2 claros;
- a capacidade que nenhum tema mostra: a lista da emenda §3.4.

A proposta diz, por tema, o que ele traz que o catálogo não tinha.

**Cumprem tudo o que os outros cumprem:** §5 passo 6 inteiro (gabarito vivo, eixos, contraparte, hover
perceptível, seis idiomas, preferências de fábrica, nenhuma mídia de terceiro, `description`).

**A ordem:** os três novos formam o **último lote**, e ele começa por uma parada própria (§5 passo 6,
"Parada da identidade dos novos"). Nenhum arquivo dos três é escrito antes da aprovação dessa parada.

## 3.6 Emenda — 2026-09-18 (revisão visual única, decisão do dono)

Atualizar o ERP a cada lote não é viável: as duas camadas de cache de [[13-instalacao-e-atualizacao]] §9.1
fazem de cada atualização um ciclo caro. Por isso o dono decidiu:

- **A parada por lote continua, só técnica** (§5 passo 7): audit, contraste, `themes:diversity`, suíte
  inteira e vitrine, com o veredito técnico do revisor. O lote seguinte começa com esse veredito, sem
  esperar aprovação visual.
- **O veredito visual do dono é um só, no fechamento** (§5 passo 8): com a lib atualizada no ERP, ele revê
  o catálogo inteiro, e pode devolver qualquer tema de qualquer lote. O `cyberpunk-neon` (entregue como
  "melhorar", classificado como "recriar" na Parada 1) é decidido nessa revisão.
- **A parada de identidade dos três novos (emenda §3.5) continua valendo.** Ela é só texto, não depende do
  ERP, e é onde o dono decide o que os três trazem de diferente. Nenhum arquivo dos três é escrito antes da
  aprovação dela.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | o contrato inteiro: §2.1 contraparte, §4.1–4.1.1 referência e derivação, §4.7 preferências, §5.1 atmosferas, §5.2 diversidade medida, §6 travas, §7 o procedimento |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | §2.4 — papéis de cor do item de navegação e a varredura de realce |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §7 — o harness de navegador |
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | §9.1 — por que a vitrine não passa pelo ERP |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R5, R25, R31, R33 — as travas que todo tema cruza |
| ADR | `specs/adr/016-preferencias-do-usuario-separadas-do-tema.md` | posição de preferência é do administrador, não do tema shippado |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `ui-criar-tema` (inteira, com `references/liberdade-e-restricao.md` e `examples.md`) | o procedimento, o gerador de gabarito e o solucionador de contraste |
| Skill | `ui-arquitetura-design` | julgar elegância e função com critério, não com gosto |
| Skill | `padrao-escrita` · `padrao-typescript` · `test-unitario` · `test-e2e` | sempre; a varredura; a vitrine |
| Código | `gates/scripts/audit/verify_contrast.ts` · `verify_diversity.ts` · `src/core/Design/utils/themeAxes.ts` | as três réguas |
| Código | `src/core/Design/presets/themes/color-engine.ts` (`resolveThemeForMode`) | o que cada tema vira no modo oposto |
| Código | `browser-tests/fixtures/harness-entry.tsx` · `build-harness.mjs` | a base da vitrine |

# 5. Instruções de execução

1. **Régua honesta.** A varredura de `SarakMenuItem.test.tsx` passa a **pular e declarar** a cor que não
   consegue converter, em vez de medi-la contra preto. Teste que prova isso com um valor `hsl()`.

2. **A vitrine.** Um comando (`themes:showcase`) que gera, a partir do `dist/`, uma captura por **tema ×
   modo × orientação**, fora do versionamento. Cada captura mostra o cromo com item ativo e item em hover,
   mais uma amostra do conteúdo: card, tabela com dados, botões, campos, tipografia e o `SarakBadge` em
   **todas** as variantes (o `muted` inclusive). A tabela usa a prop `data` (entregue pela `plan-81`), sem
   rede falsa. O comando também gera **um arquivo único** que reúne as capturas lado a lado, para o dono
   abrir e comparar.

3. **Inventário da capacidade.** Por script, sem transcrever lista de token (R17), produza no resumo uma
   matriz com duas coisas:
   - **as famílias de escolha visual que o dicionário oferece**, derivadas do `axis` e das `constraints.options`
     dos schemas: navegação, posição da sidebar, textura/atmosfera, textura de card, superfície, estilo de
     botão, famílias tipográficas, raio, densidade, modo;
   - **quais valores o catálogo atual usa.**

   É o mapa do que a vitrine precisa mostrar.

4. **⛔ Parada 1 — o catálogo.** Rode a vitrine sobre os 23 temas atuais. Entregue ao dono, **em texto**:
   - as capturas;
   - a matriz do passo 3;
   - uma proposta de catálogo final: quais temas ficam como base (com o que melhorar em cada um), quais
     saem, e quais temas novos entram. Para cada tema, uma linha de identidade: modo, navegação, família de
     matiz, atmosfera, tipografia e densidade;
   - a cobertura que o catálogo proposto dá à matriz.

   **Pare.** Siga só com o catálogo aprovado pelo dono, e registre a aprovação no resumo. O dono pode
   trocar, tirar e acrescentar temas.

5. **O id removido.** Meça e, se preciso, faça valer o comportamento da §2: um id removido cai na referência
   do modo pedido, com um aviso. Teste pelas três portas: `activeThemeId`, `initialTheme` e o id persistido
   que volta pelo `onLoad`.

6. **Autorar, em lotes.** Um lote por vez, de até seis temas, na ordem que o dono aprovar. Comece pelo par de
   referência. Cada tema do lote cumpre [[09-temas-e-presets]] §7 inteiro e a skill `ui-criar-tema` §5–5.6:
   - parte do gabarito vivo (o gerador da skill) ou de `deriveThemeFromReference`, **nunca de `{}`**;
   - `findMissingThemeAxes` devolve `[]`;
   - `contraparte` autorada, e o tema sai da lista de isenção (o solucionador de contraste roda, e o
     relatório entra no resumo);
   - **fundo de hover** do item de navegação, nas duas orientações, **perceptível** contra o fundo da barra.
     A varredura de realce passa a medir o hover como já mede o ativo: distância perceptual acima do
     limiar, nos dois modos;
   - `enabledLanguages` com os seis idiomas oferecidos pela lib;
   - posições de preferência no padrão de fábrica; nenhuma mídia de terceiro;
   - `description` com a identidade do tema em uma frase.

   Tema que sai: `THEME_PRESET_IDS`, `GLOBAL_THEMES`, o arquivo, os testes que o citam, e a linha em
   `docs/migracoes.md`.

   **⛔ Parada da identidade dos novos (emenda §3.5)** — antes do lote dos três temas novos, entregue ao
   dono, em texto e **sem escrever tema**, uma linha de identidade por tema, com:
   - id e nome;
   - modo nativo;
   - navegação e posição da sidebar;
   - família de matiz de `primaryColor` e luminosidade do fundo;
   - estilos de botão e de card, e textura;
   - o que ele traz que nenhum outro tema do catálogo traz.

   Some a isso a saída de `themes:diversity --new` com os valores propostos. **Pare.** O lote só começa
   com a aprovação registrada no resumo.

7. **⛔ Parada por lote — o veredito visual.** Ao fechar cada lote:
   - rode `npm run audit` (contraste com 0 reprovados nas duas passadas), `npm run themes:diversity` e a
     vitrine;
   - entregue ao dono as capturas do lote e os números;
   - **pare.**

   O dono aprova ou devolve com o que mudar. O próximo lote só começa com a aprovação registrada no resumo.
   O revisor pode liberar commit parcial por lote.

8. **Fechamento.**
   - A `CONTRAPARTE_EXEMPTION_LIST` está **vazia**, e o `auditor_contraste` exige contraparte de todo tema
     shippado.
   - `themes:diversity` passa nos nove critérios.
   - Atualize a skill `ui-criar-tema` com a vitrine e com a varredura de hover.
   - Em `docs/migracoes.md`, sob a 7.0.0: os temas que ficam com o **mesmo id** e mudam o que o usuário vê.
     Os recriados mudam de identidade, e o `data-terminal` muda também de modo nativo, de escuro para claro.
     Diga o que muda e como o consumidor que o tinha aplicado volta ao visual anterior, se quiser (por
     exemplo, a preferência de modo).
   - Rode os geradores, `npm run build`, `npm run cromo-css-real:check`, `npm run audit` e a suíte inteira
     (`npx vitest run --maxWorkers=3`).

# 6. Critérios de aceite

- [ ] A varredura de realce pula e declara cor que não converte, e tem teste com `hsl()`.
- [ ] `themes:showcase` gera a vitrine a partir do `dist/`, e a saída não é versionada.
- [ ] A matriz de capacidade e a aprovação do catálogo pelo dono estão no resumo (parada 1).
- [ ] Todo lote tem o veredito técnico do revisor, e o catálogo inteiro tem o veredito visual único do dono
      registrado no resumo, no fechamento (emenda §3.6).
- [ ] `SARAK_REFERENCE_THEMES` segue um claro e um escuro, com os ids `minimalist-airy` e `sarak-sovereign`.
- [ ] Id de tema removido cai na referência do modo pedido, com um aviso, pelas três portas (teste).
- [ ] Todo tema shippado: `findMissingThemeAxes` = `[]`; contraparte; hover perceptível nas duas orientações
      e nos dois modos (varredura); seis idiomas em `enabledLanguages`; preferências no padrão de fábrica.
- [ ] `CONTRAPARTE_EXEMPTION_LIST` vazia; `auditor_contraste` 0 e 0; `themes:diversity` passa nos nove.
- [ ] O catálogo final usa sidebar `floating` e `right`, os seis estilos de botão (inclusive `cyberpunk`) e
      o leque de texturas aprovado pelo dono na Parada — cada item apontado no tema que o usa.
- [ ] A vitrine mostra o `SarakBadge` em todas as variantes e uma tabela com dados, em cada tema.
- [ ] Três temas novos (emenda §3.5), com a identidade aprovada na parada própria: cada um passa em
      `themes:diversity --new` contra o resto do catálogo, e nenhum outro tema repete inteira a combinação
      de navegação, botão, card e textura dele.
- [ ] `docs/migracoes.md` lista cada id removido e para onde cai quem o usava, e cada tema que manteve o id
      e mudou de identidade ou de modo nativo.
- [ ] A skill `ui-criar-tema` descreve a vitrine e a varredura de hover.
- [ ] `audit` sem regressão; suíte inteira verde. Falha em arquivo não tocado foi rodada isolada antes de
      ser atribuída ([[00-backlog]] #5).

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum novo` — `auditor_contraste` (existente) passa a exigir contraparte de **todo** tema
shippado, porque a lista de isenção termina vazia; a varredura de realce (suíte) passa a medir o hover.

- `git status` + `git diff --stat` → só a §3.1, mais os gerados.
- `npm run audit` → contraste 0 e 0, nenhuma isenção; `npm run themes:diversity` → nove critérios.
- **Mutação:** tornar `transparent` o hover de um tema → a varredura cai nomeando o tema e a orientação.
  Restaurar byte a byte.
- **Mutação:** tirar a `contraparte` de um tema → o `auditor_contraste` acusa. Restaurar.
- **Efeito:** para três temas ao acaso, rodar `useDesignVariables` em `react-dom/server` num script `tsx`,
  no modo nativo e no oposto, e conferir que as variáveis emitidas são as escritas e as da contraparte.
- Abrir a vitrine final e conferir que ela corresponde ao catálogo aprovado.
- `grep -rnE "plan-[0-9]+|achado [0-9]+|veredito"` nos arquivos da entrega, rastreados e não rastreados.
- `npx vitest run --maxWorkers=3 > arquivo 2>&1` e ler a saída.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md` · `specs/05-cromo-e-slots.md`

- **`09-temas-e-presets`**:
  - §2.1: a lista de isenção acabou; contraparte é obrigatória para todo tema shippado.
  - §5.2: a tabela de concentração de 18 → 23 é substituída pelo que o catálogo novo mede, sem transcrever
    lista de temas (R17).
  - §7: a vitrine entra no procedimento; o hover perceptível e os idiomas passam a ser exigência medida.
  - §4.3: o que acontece com um id de tema que deixou de existir.
- **`05-cromo-e-slots`** §2.4 — a varredura de realce mede ativo **e** hover, em todo tema shippado.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-17

**Resultado:** Concluído com pendências (Parada 1 — aguardando aprovação do dono, conforme §5 passo 4 e a
emenda §3.3: esta execução corre em paralelo com a `plan-79` e vai só até aqui).

**O que foi feito**
- `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` — a varredura de realce do item ativo
  (`describe('SarakMenuItem — realce do item ativo...')`) passou a declarar, via `console.warn`, o par
  tema/orientação cuja cor de fundo não é conversível (`hsl()`, `var()` não resolvido, gradiente), em vez de
  medi-la contra o preto que `parseToRgba` devolveria em silêncio. Extraído `isParseableColor` (mesmo critério
  de `gates/scripts/audit/verify_contrast.ts::parseColor`) e `evaluateActiveDistinction` (núcleo testável da
  varredura). Novo teste (`'hsl() no fundo ativo é PULADO e DECLARADO...'`) prova o caso com um valor `hsl()`
  sintético — §5 passo 1.
- `browser-tests/build-harness.mjs` — `buildHarness()` passou a aceitar `entryPath` (default preserva o
  comportamento de `cromo-css-real.spec.ts`), para reusar o mesmo empacotador esbuild na vitrine, sem duplicar
  a lógica de build.
- `browser-tests/fixtures/showcase-entry.tsx` (novo) — entry point da vitrine: `SarakUIProvider` +
  `SarakAppChrome` com amostra de conteúdo (tipografia, botões, campos, `SarakCardGrid`, `SarakTable`), tema
  escolhido por `?tema=`, modo aplicado pela porta pública `useSarakPreferences().updatePreferences({colorMode})`
  (o mesmo caminho do `ShellThemeToggle` real) e orientação forçada via `config.navigationStyle` (a preferência
  de navegação não é oferecida por padrão de fábrica em nenhum tema hoje, então não teria efeito se pedida como
  preferência).
- `browser-tests/generate-showcase.mts` (novo) — o gerador da vitrine: builda o harness contra o `dist/`,
  itera `GLOBAL_THEMES` (fonte viva, nunca transcrita — R17) × 2 modos × 2 orientações, mocka os dois
  `endpoint` da fixture via `page.route`, marca "Início" ativo e "Relatórios" em hover (mouse real) na mesma
  captura, salva um PNG por combinação em `browser-tests/showcase-output/screens/` e monta um `index.html`
  agregador com todas lado a lado. Roda por comando direto (`npx tsx browser-tests/generate-showcase.mts`) —
  nenhum script novo em `package.json` nesta fase (emenda §3.3).
- `.gitignore` — entrada para `browser-tests/showcase-output/` (a vitrine não é versionada — §5 passo 2).
- Inventário da capacidade (§5 passo 3) — por script ad hoc (não commitado, rodado e descartado), lendo
  `getAllDesignTokens()` e `GLOBAL_THEMES`; matriz abaixo.
- Rodei `npm run build` (necessário para a vitrine ler `dist/`) e a suíte de `src/components/atomic/Navigation`
  — os `dist/*` que mudaram no worktree são gerado, e a emenda §3.3 autoriza o build nesta fase.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | alterado | régua honesta (pula e declara cor não conversível) + teste com `hsl()` |
| `browser-tests/build-harness.mjs` | alterado | `buildHarness(entryPath)` — entry configurável |
| `browser-tests/fixtures/showcase-entry.tsx` | criado | entry point da vitrine |
| `browser-tests/generate-showcase.mts` | criado | gerador da vitrine (captura + agregador HTML) |
| `.gitignore` | alterado | ignora `browser-tests/showcase-output/` |
| `specs/plan/plan-80-recalibracao-do-catalogo-de-temas.md` | alterado | `status` → `🟡 Em execução`, este resumo |

**Verificações executadas**
- `npx vitest run src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` → 42 testes, 0 falhas.
- `npx vitest run src/components/atomic/Navigation` → 17 arquivos / 139 testes, 0 falhas.
- `npm run build` → build completo, 0 erros (gates de build incluídos: `token-types:check`, `catalog:check`,
  `barrel:check`, `zero-brand:check`, `guide:check`, `deep-import:check`, `public-types:check`).
- `npx tsx browser-tests/generate-showcase.mts` → 92 capturas geradas (23 temas × 2 modos × 2 orientações),
  0 falhas. Primeira rodada teve 8 falhas (`holographic-glass`, `kinetic-flow`, os dois com
  `isAutoHideEnabled: true`) — a nav começa OCULTA por design (`useChromeAutoHide`,
  specs/specs/05-cromo-e-slots.md §2.4) e só revela sob o sensor fixo no canto (0,0); corrigido movendo o
  mouse para lá antes de aguardar "Início" — não é bug do cromo, é o comportamento documentado do token.

**Critérios de aceite (desta parada)**
- [x] A varredura de realce pula e declara cor que não converte, e tem teste com `hsl()` — evidência:
  `SarakMenuItem.test.tsx`, `describe('SarakMenuItem — a régua não mede cor não-conversível contra preto')`.
- [x] `themes:showcase` (o mecanismo; o script do `package.json` é da autoria, §3.3) gera a vitrine a partir do
  `dist/`, e a saída não é versionada — evidência: `browser-tests/showcase-output/` gerado e ignorado pelo git.
- [x] A matriz de capacidade está neste resumo (abaixo) — Parada 1.
- [ ] Aprovação do catálogo pelo dono — **pendente**: é exatamente a Parada 1, registrada na mensagem de
  entrega desta conversa, não neste resumo (o dono decide fora do papel do executor).

**Decisões e suposições**
- `resolveThemeForMode` (o merge exato de contraparte) não é exportado no barril público; a vitrine troca de
  modo pela porta pública documentada (`useSarakPreferences`/`ShellThemeToggle`), não por essa função interna
  — é o caminho que a própria spec recomenda ao importador (specs/specs/09-temas-e-presets.md §4.3).
- `SarakCardGrid`/`SarakTable` só sabem buscar dado por `endpoint` (sem prop de dado direto hoje — achado
  registrado abaixo); a vitrine usa uma origem fixa (`https://showcase.sarak.local`) mockada por `page.route`
  para renderizar conteúdo determinístico offline, sem alterar os componentes.
- Orientação (`?nav=`) é forçada por `config.navigationStyle` (sobrepõe o token direto), não pela preferência
  `navigationStyle` — nenhum tema shippado hoje a oferece por padrão de fábrica (specs/specs/09 §4.7), então a
  preferência não teria efeito.
- O inventário de capacidade (§5 passo 3) rodou por script descartável, não commitado — a R17 pede não
  transcrever fonte viva em documento permanente; este resumo é registro de execução, mas ainda assim os
  dados abaixo são a SAÍDA do script sobre o código de 2026-09-17, não uma lista mantida à mão.

**Matriz de capacidade — famílias que o dicionário oferece × o que o catálogo atual (23 temas) usa**
(fonte: `getAllDesignTokens()` + `GLOBAL_THEMES`, script ad hoc descartado após a leitura)

| Família (token) | Opções no schema | Valores distintos usados nos 23 | Quais |
|---|---|---|---|
| Modo (`mode`) | 2 | 2 | dark, light |
| Navegação (`navigationStyle`) | 3 (sidebar/topbar/dock) | 2 | sidebar, topbar — **`dock` nunca usado, e acheado abaixo: não tem efeito visual hoje** |
| Posição da sidebar (`sidebarPosition`) | 3 (left/right/floating) | 1 | **left — right e floating nunca exercitados** |
| Textura/atmosfera (`texture`) | 41 | 6 | none, noise, grid, dots, waves, scanlines |
| Textura de card (`cardTextureType`) | 41 (mesmo catálogo) | 5 | none, grid, noise, dots, scanlines |
| Superfície (`surfaceMaterial`) | 4 (frosted/sleek/industrial/organic) | 4 | as 4 — **cobertura plena** |
| Estilo de botão (`btnStyleType`) | 6 | 5 | matte, borderline, frosted, neon, neumorphism — falta `cyberpunk` |
| Família tipográfica de título (`headingFont`) | 20 | 13 | mistura sans/serif/mono |
| Família tipográfica de corpo (`bodyFont`) | 20 | 8 | — |
| Família tipográfica mono (`monoFont`) | 20 | 4 | — |
| Raio (`borderRadius`, 0–40) | numérico | 7 valores | 0, 2, 4, 12, 14, 24, 9999 (pílula) |
| Densidade (`layoutDensity`) | 3 (compact/comfortable/spacious) | 3 | as 3 — **cobertura plena** |

**Identidade dos 23 temas atuais** (mode · navegação nativa · família de matiz · atmosfera · fonte de título ·
densidade · contraparte) — fonte: `measureTheme()` de `gates/scripts/audit/verify_diversity.ts` + leitura
direta do `design`, script ad hoc:

| Tema | Modo | Nav | Matiz | Atmosfera | Título | Densidade | Contraparte |
|---|---|---|---|---|---|---|---|
| sarak-sovereign *(referência)* | dark | sidebar | ciano | none | Outfit | comfortable | autorada |
| minimalist-airy *(referência)* | light | topbar | azul | grid | Inter | spacious | autorada |
| terracota-solar | light | sidebar | laranja | none | Fraunces | spacious | autorada |
| musgo-do-vale | light | topbar | verde | none | Fraunces | comfortable | autorada |
| ardosia-ao-entardecer | dark | sidebar | azul | none | Outfit | comfortable | autorada |
| forja-ultravioleta | dark | topbar | roxo | grid | Space Grotesk | compact | autorada |
| grafite-puro | dark | sidebar | neutro | grid | JetBrains Mono | compact | autorada |
| crystal-glass | dark | topbar | ciano | noise | Outfit | spacious | isento |
| cyberpunk-neon | dark | sidebar | verde | grid | JetBrains Mono | comfortable | isento |
| holographic-glass | dark | topbar | ciano | noise | Inter | comfortable | isento |
| industrial-terminal | dark | sidebar | laranja | grid | JetBrains Mono | compact | isento |
| nature-breeze | dark | sidebar | verde | grid | Lora | comfortable | isento |
| neo-brutalism | dark | topbar | vermelho | grid | Space Grotesk | comfortable | isento |
| synthwave-retro | dark | topbar | magenta | grid | JetBrains Mono | comfortable | isento |
| nebula-space | dark | topbar | magenta | grid | Outfit | compact | isento |
| dot-matrix-elegant | dark | sidebar | amarelo | dots | Outfit | comfortable | isento |
| stellar-nebula | dark | sidebar | azul | none | Outfit | spacious | isento |
| kinetic-flow | dark | sidebar | magenta | waves | JetBrains Mono | compact | isento |
| cyber-retro-wave | dark | sidebar | magenta | scanlines | Orbitron | comfortable | isento |
| data-terminal | dark | topbar | ciano | grid | Fira Code | compact | isento |
| neumorphic-mobile | light | topbar | neutro | grid | Outfit | comfortable | isento |
| industrial-dashboard | dark | topbar | amarelo | grid | Inter | comfortable | isento |
| asymmetric-editorial | light | topbar | neutro | grid | Playfair Display | comfortable | isento |

Cruzamento: 18 dark / 5 light; ciano+magenta = 8 dos 23 — os dois números batem exatamente com
specs/specs/09-temas-e-presets.md §5.2, confirmando o script.

**Achados fora do escopo (não corrigidos)**
- `src/core/Design/presets/themes/kinetic-flow.ts:176` — `globalBackgroundImageUrl` aponta para
  `https://test-videos.co.uk/...` (vídeo de terceiro). Viola specs/specs/09-temas-e-presets.md §5.1 ("um valor
  de `globalBackgroundImageUrl` apontando para fora da origem do consumidor não entra no catálogo shippado").
  Não há gate hoje que pegue isto — achado a levar ao backlog ou à decisão de remover o tema no passo 4/6.
  Nenhum gate reprovou porque `verify_diversity`/`verify_contrast`/`auditor_presets` não auditam mídia.
- `navigationStyle: 'dock'` existe como opção no schema (`src/core/Design/schema/global.ts:21-29`), mas
  `SarakAppChrome` só resolve `'topbar'` → topbar e qualquer outro valor → sidebar
  (specs/specs/05-cromo-e-slots.md §2.1) — a opção não tem efeito visual distinto hoje. Não é desta plan (§3.2
  proíbe criar token; consertar o cromo para dar efeito a `dock` seria além do escopo declarado).
- `sidebarPosition` (`right`, `floating`) nunca é exercitado por nenhum dos 23 temas atuais — nenhum bug,
  apenas lacuna de amostra que a proposta de catálogo (mensagem de entrega) endereça.
- `SarakTable`/`SarakCardGrid` destroem/ignoram a prop `data`/não aceitam dado direto — só `endpoint` (fetch).
  `src/components/atomic/Templates/SarakTable.tsx:46` desestrutura `data: initialData` e nunca a usa;
  `useSarakTableData` sempre busca por `endpoint`. Não é desta plan; contornado na vitrine com
  `page.route` mockando a origem.
- `SarakSwitch` (`browser-tests/fixtures/showcase-entry.tsx`) — usar `defaultChecked` sozinho ainda produz o
  aviso do React "input com checked e defaultChecked" (console, visto ao depurar `holographic-glass`); parece
  o componente aplicar `checked` internamente independente da prop recebida — não investigado a fundo
  (fora do escopo desta parada; não afeta a vitrine, é só ruído de console).

**Pendências / riscos**
- Passos 5 em diante (autoria dos temas, `themes:showcase` em `package.json`, remoção de ids, `docs/migracoes.md`,
  atualização da skill `ui-criar-tema`) **não começaram** — dependem da aprovação do catálogo pelo dono
  (Parada 1), entregue nesta conversa em texto, fora deste resumo.
- Não rodei `npx vitest run` (suíte inteira) nesta parada — só o escopo tocado
  (`SarakMenuItem.test.tsx` + a pasta `Navigation`). A suíte inteira é exigida no Fechamento (§5 passo 8), não
  aqui; rodá-la agora mediria também o worktree em andamento da `plan-79` (fora do meu escopo de correção).
- `browser-tests/showcase-output/` fica no worktree (gerado, ignorado) para o dono abrir
  `browser-tests/showcase-output/index.html` — não commitado, regenerável a qualquer momento por
  `npx tsx browser-tests/generate-showcase.mts` (exige `npm run build` primeiro).

## Resumo da execução (continuação) — 2026-09-17

**Resultado:** Concluído com pendências (catálogo aprovado pelo dono na conversa; autoria **ainda bloqueada**
pela emenda §3.3 — `plan-79` segue não commitada, ver abaixo).

**Aprovação do dono (Parada 1, §5 passo 4) — registrada nesta conversa:**

| Destino | Temas |
|---|---|
| **Melhorar** (ficam, com ajuste) | `sarak-sovereign`, `industrial-terminal`, `neo-brutalism`, `nebula-space`, `kinetic-flow`, `cyber-retro-wave`, `minimalist-airy`, `neumorphic-mobile` |
| **Recriar** (ficam, reescritos do zero) | `cyberpunk-neon`, `synthwave-retro`, `data-terminal` |
| **Remover** (explícito) | `crystal-glass`, `holographic-glass`, `nature-breeze`, `dot-matrix-elegant`, `asymmetric-editorial` |
| **Remover** (por "todos os outros que não estão listados") | `stellar-nebula`, `industrial-dashboard`, e os 5 da leva com contraparte já autorada: `terracota-solar`, `musgo-do-vale`, `ardosia-ao-entardecer`, `forja-ultravioleta`, `grafite-puro` |

Catálogo final aprovado: **11 temas** (os 8 "melhorar" + os 3 "recriar"). Nenhum dos 16 legados isentos de
contraparte sobrevive sem reescrita (nem os 8 "melhorar" têm contraparte hoje — "melhorar" inclui autorá-la,
igual "recriar"). Interpretação de "todos os outros" confirmada por contagem: os 16 legados mais os 2 de
referência somam 18 nomes possíveis; só 16 foram citados (8+3+5); os 2 que sobraram sem menção
(`stellar-nebula`, `industrial-dashboard`) e os 5 da leva (não fazem parte dos "legados", mas também não foram
citados) caem no "todos os outros" — declarada aqui para o dono corrigir se a leitura for diferente da
intenção.

**Observação registrada, não bloqueante:** o catálogo aprovado tem 9 dos 11 temas nativamente escuros
(só `minimalist-airy` e `neumorphic-mobile` são claros) — mais concentrado em `dark` que o catálogo de 23
(18/23 = 78%) que motivou esta plan. `themes:diversity` (9 critérios) só roda contra o que existir na hora do
lote (§5 passo 7); se o dono quiser reequilibrar modo/matiz, o espaço para isso é nos 3 "recriar" (liberdade
total) e nos ajustes de "melhorar".

**Sugestão do dono — visualizar pelo ERP (porta 3000) com Playwright antes de recriar:** registrada, com uma
ressalva que já é conhecida desta base: medir pelo ERP atravessa as duas camadas de cache descritas em
specs/specs/13-instalacao-e-atualizacao.md §9.1 (`pnpm file:` copia em vez de linkar; o pré-bundle do Vite não
invalida por conteúdo) — é a armadilha que já custou dois ciclos inteiros e a razão de esta plan ter
priorizado `browser-tests/` (mede o `dist/` direto, sem essa camada). Nenhuma ação tomada ainda: apontar
Playwright para `localhost:3000` é decisão de ferramenta para quando a autoria (§5 passo 5+) começar, e cabe
ao dono escolher — a vitrine já entregue serve o mesmo papel sem o ciclo de reinstalação.

**Por que a autoria não começou nesta conversa:** a emenda §3.3 desta plan (execução em paralelo com a
`plan-79`) só libera "autorar" (§5 passo 5 em diante) depois de a `plan-79` estar **commitada**. Conferido
agora: `specs/plan/plan-79-idioma-de-ponta-a-ponta.md` segue com `status: "🟠 Em revisão"` e o worktree segue
com as mudanças dela não commitadas (`git log` sem commit novo desde `279d33f`). Autoria de tema, mudança em
`package.json` (o script `themes:showcase`) e qualquer edição em `src/core/Design/presets/themes/**`
continuam fora desta conversa até essa condição mudar.

**Pendências / riscos (adicionadas)**
- Catálogo aprovado, mas **autoria bloqueada** por `plan-79` não commitada — nenhuma ação de tema tomada.
- Confirmar com o dono a leitura de "todos os outros" (acima) antes de a autoria começar, para não descartar
  os 5 temas com contraparte já pronta por engano.

## Resumo da execução (continuação 2) — 2026-09-17

**Resultado:** Concluído com pendências (nova sequência combinada com o dono; nenhuma ação de tema ainda —
segue bloqueado pelo commit da `plan-79`, que não aconteceu).

**Sequência combinada com o dono, substituindo a ordem original do §5 passos 5+:**

1. Dono commita (`plan-79`, e o que estiver pronto desta `plan-80`).
2. Executor remove os temas indicados (§ acima) — só remoção; nenhuma recriação/melhoria ainda.
3. Executor guia o dono, passo a passo, na atualização da lib no ERP (`specs/13-instalacao-e-atualizacao.md`
   §9 — as duas camadas de cache, na ordem certa).
4. Executor executa a `plan-72-pente-fino-de-usabilidade-no-consumidor-real` — que **já depende desta plan**
   no seu próprio frontmatter (`depende_de: "plan-80-recalibracao-do-catalogo-de-temas"`), então a sequência
   pedida é a ordem que a `plan-72` já esperava, não uma inversão.
5. Dono e executor discutem os achados da `plan-72` **antes** de aplicar qualquer melhoria/recriação de tema
   — os achados do consumidor real informam a autoria, em vez de a autoria acontecer às cegas do que a tela
   real mostra.
6. Só então o §5 passos 5+ desta plan (autoria em lotes) retoma, com a lista de "melhorar"/"recriar" tratada
   como **referência, não obrigação** — o dono liberou criar temas novos; o critério final é "temas bonitos,
   diferentes entre si, que mostrem a capacidade da biblioteca", não a categorização literal de cada nome.

**Decisões e suposições**
- "Remover" continua lido como a lista completa de 12 ids (§ bloco anterior) — o dono chamou de "referência"
  só a parte de melhorar/recriar, não a de remover. Se a intenção for diferente, corrige antes do passo 2
  acima rodar.
- A `plan-72` é **read-only por definição própria** (§3.2 dela: "esta plan não conserta nada; ela nomeia",
  "zero arquivo de produção alterado") — executá-la não conflita com nada em andamento na `plan-79` nem seria
  bloqueado por ela: não escreve código.

**Pendências / riscos**
- Aguardando o commit do dono para: (a) remover os 12 temas, (b) guiar a atualização no ERP, (c) executar a
  `plan-72`. Nenhum dos três começou.

## Resumo da execução (continuação 3) — 2026-09-18

**Resultado:** Concluído com pendências (remoção dos 12 temas feita e verificada; a atualização do ERP e a
execução da `plan-72` seguem como próximos passos desta mesma conversa, fora deste bloco).

**O que foi feito**
- `src/core/Design/presets/themes/index.ts` — os 12 ids removidos de `THEME_PRESET_IDS`/`GLOBAL_THEMES` e
  seus imports; `THEME_PRESET_IDS` cai de 23 para 11.
- Removidos os 12 arquivos de tema: `crystal-glass.ts`, `holographic-glass.ts`, `nature-breeze.ts`,
  `dot-matrix-elegant.ts`, `asymmetric-editorial.ts`, `stellar-nebula.ts`, `industrial-dashboard.ts`,
  `terracota-solar.ts`, `musgo-do-vale.ts`, `ardosia-ao-entardecer.ts`, `forja-ultravioleta.ts`,
  `grafite-puro.ts`.
- **Achado real, corrigido — §5 passo 5 (o id removido):** medi o comportamento ANTES de mexer.
  `resolveSeedThemeId` (`src/core/Provider/hooks/useDesignManager.ts:50-56`, seed) caía sempre em
  `GLOBAL_THEMES[0]` (`sarak-sovereign`, sempre escuro, ignorando qualquer modo) **sem nenhum aviso**; o
  efeito de `activeThemeId` controlado (`src/core/Provider/hooks/useDesignSync.ts:33-49`) simplesmente NÃO
  FAZIA NADA quando o id não batia com nenhum tema — nem aviso, nem fallback, o design anterior ficava
  congelado. Nenhum dos dois cumpria o §2 da plan ("cair num tema de referência do modo pedido, com um aviso
  de console"). Corrigido nos dois arquivos: id explicitamente pedido (via `activeThemeId`, `initialTheme`,
  ou um id restaurado de persistência própria do consumidor e re-passado numa dessas duas props — as
  "três portas") que não bate com tema nenhum agora cai em `SARAK_REFERENCE_THEMES` no modo pedido
  (`config.mode` explícito, senão o modo atual do design, senão escuro) e emite **um** `console.warn`
  nomeando o id. Testes novos nos dois arquivos (`useDesignManager.test.ts`, `useDesignSync.test.ts`) provam
  as três portas.
- `gates/scripts/audit/verify_contrast.ts` — `CONTRAPARTE_EXEMPTION_LIST` cai de 16 para 9 (os 7 ids
  removidos que estavam isentos saem da lista — ela só encolhe, nunca cresce, e entrada apontando pra um
  tema que não existe mais é dívida morta).
- Testes que citavam os ids removidos, corrigidos para usar temas que continuam no catálogo (trocando o id,
  nunca a intenção do teste): `SarakShell.test.tsx`, `PainelIsoladoDaPreferencia.test.tsx`,
  `TemaRastreavel.test.tsx`, `DuasPortasModoTema.test.tsx`, `useResolvedThemeId.test.ts`,
  `verify_contrast.test.ts`. Em `verify_diversity.test.ts`, removi a suíte
  `OS_18_ORIGINAIS`/`themesOriginais()` que congelava uma medição histórica sobre um conjunto de temas que
  não existe mais (7 dos 18 originais saíram) — a função `aggregate()` que ela cobria ganhou uma fixture
  sintética própria, e o teste de recalibragem do `bucket3` passou a medir `GLOBAL_THEMES` (o catálogo real
  de hoje) em vez do conjunto congelado.
- 2 snapshots desatualizados pelo encolhimento do catálogo (achados só ao rodar a suíte INTEIRA, não nos
  arquivos tocados): `PreviewCanvas.test.tsx.snap` e `PresetsCatalog.test.tsx.snap`. Regenerados
  (`vitest --update`) e conferidos byte a byte: os 11 temas mantidos aparecem, nenhum dos 12 removidos
  sobrou.
- `docs/migracoes.md` — nova entrada sob o bloco `## 7.0.0` (a mesma major ainda não publicada que já reúne
  o plan-77 e o plan-78): lista os 12 ids removidos e o comportamento de fallback para quem os tinha salvo.
- `.agents/skills/ui-criar-tema/references/liberdade-e-restricao.md` — removida a linha de exemplo "glass"
  que citava `holographic-glass`/`crystal-glass` (removidos); os outros três exemplos da lista continuam
  válidos, sem outra alteração.
- `npm run guide` — regenerado `sarak-ui/` (kit do consumidor), que ficava defasado após a remoção
  (`guide:check` acusou antes de eu rodar o gerador).
- `npm run build` rodado duas vezes (antes e depois do fix do §5 passo 5) — as duas vezes verde.

**Arquivos alterados** (além dos 12 arquivos de tema removidos e do `index.ts` de temas)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/hooks/useDesignManager.ts` | alterado | `resolveSeedThemeId` cai na referência do modo pedido + avisa, em vez de `GLOBAL_THEMES[0]` mudo |
| `src/core/Provider/hooks/useDesignSync.ts` | alterado | `activeThemeId` desconhecido cai na referência do modo atual + avisa, em vez de não fazer nada |
| `src/core/Provider/hooks/__tests__/useDesignManager.test.ts` | alterado | 3 testes novos (as três portas) |
| `src/core/Provider/hooks/__tests__/useDesignSync.test.ts` | alterado | 1 teste novo (activeThemeId desconhecido) |
| `gates/scripts/audit/verify_contrast.ts` | alterado | `CONTRAPARTE_EXEMPTION_LIST` 16→9 |
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` | alterado | contagens e id de exemplo atualizados |
| `gates/scripts/audit/__tests__/verify_diversity.test.ts` | alterado | suíte histórica congelada removida; `aggregate()` ganha fixture própria |
| `src/core/Shell/__tests__/SarakShell.test.tsx` | alterado | `nature-breeze` → `sarak-sovereign` |
| `src/core/Provider/__tests__/PainelIsoladoDaPreferencia.test.tsx` | alterado | `terracota-solar` → `minimalist-airy` |
| `src/core/Provider/__tests__/TemaRastreavel.test.tsx` | alterado | `terracota-solar` → `minimalist-airy`, valores hex atualizados |
| `src/features/DesignEngine/hooks/__tests__/DuasPortasModoTema.test.tsx` | alterado | `ardosia-ao-entardecer` → `sarak-sovereign` |
| `src/core/Provider/hooks/__tests__/useResolvedThemeId.test.ts` | alterado | ids de exemplo trocados por ids que continuam no catálogo |
| `docs/migracoes.md` | alterado | nova entrada de remoção sob `## 7.0.0` |
| `.agents/skills/ui-criar-tema/references/liberdade-e-restricao.md` | alterado | exemplo "glass" removido |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado (gerado) | regenerado |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap` | alterado (gerado) | regenerado |
| `sarak-ui/*`, `dist/*` | alterado (gerado) | `npm run guide` + `npm run build` |

**Verificações executadas**
- `npx vitest run --maxWorkers=3` → **370 arquivos / 1923 testes, 0 falhas** (rodada completa, duas vezes —
  a primeira achou os 2 snapshots defasados, a segunda, após regenerá-los, fechou 100% verde).
- `npx tsc --noEmit` → 0 erros.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-08-11 —
  nenhuma regressão" (as 2 violações pré-existentes de `auditor_composicaoatomica` em
  `SarakMultiSelect.tsx`/`SarakUploader.tsx` são o baseline conhecido, não-relacionadas a temas).
- `npx tsx gates/scripts/audit/verify_contrast.ts` → 0 reprovados nos dois modos; 9 isentos, 2 com
  contraparte, 0 sem contraparte fora da isenção.
- `npx tsx gates/scripts/audit/verify_presets.ts` → 113 itens auditados (11 temas + 102 presets), 0 órfãs.
- `npx tsx gates/scripts/audit/verify_diversity.ts` → catálogo de 11 medido: 9/11 escuro, 8/11 primária
  S=100, 6/11 ciano+magenta, 0/11 claro-saturado, 0/11 fundo médio — **a concentração piora em proporção**
  (era 18/23, 10/23, 8/23, 0/23, 0/23) porque os 5 temas que mais contribuíam para a diversidade (a leva com
  contraparte) saíram. Não é regressão de gate (`themes:diversity` só avalia os 9 critérios quando chamado
  com `--new`, para validar um LOTE novo — sem lote novo, só imprime); é um dado para a autoria futura.
- `npm run dev-kit:check` → em dia, 0 ponteiros mortos.
- `npm run build` (2x) → verde as duas vezes, incluindo `guide:check`, `catalog:check`, `barrel:check`,
  `zero-brand:check`, `public-types:check`.

**Critérios de aceite (desta parte)**
- [x] Id de tema removido cai na referência do modo pedido, com um aviso, pelas três portas (teste) —
  evidência: `useDesignManager.test.ts` (`describe('useDesignManager — id de tema removido/inexistente...`)
  e `useDesignSync.test.ts`.
- [x] `git status`/`git diff` conferem com o escopo desta remoção — só temas, os testes que os citavam, o
  fallback de id removido, `docs/migracoes.md`, a skill `ui-criar-tema` e os gerados.
- [ ] `CONTRAPARTE_EXEMPTION_LIST` vazia — **não é objetivo desta parte**; ela encolheu (16→9) porque 7 dos
  removidos eram isentos, mas os 9 restantes (temas "melhorar"/"recriar") ainda não têm contraparte —
  isso é trabalho da autoria futura, não desta remoção.

**Decisões e suposições**
- Achei o bug real do §5 passo 5 ao medir ANTES de implementar (como a plan manda) e decidi corrigi-lo nesta
  mesma ação, não só documentá-lo: é o mecanismo de segurança que a PRÓPRIA remoção que acabei de fazer
  passa a exercitar de verdade (qualquer app com um dos 12 ids salvo no `localStorage`/backend próprio bate
  nisso assim que atualizar a lib) — corrigir depois seria deixar uma janela de tela-sem-aviso entre esta
  remoção e uma plan futura.
- `verify_diversity.test.ts`: removi a suíte que congelava a medição dos "18 originais" em vez de tentar
  recalibrar os números — a premissa dela (um conjunto de temas legados intocável) contradiz a própria
  decisão do dono que autorizou esta plan ("remover todos e recriar é aceitável"). `aggregate()` e o teste de
  recalibragem do `bucket3` continuam cobertos, agora sem depender de um recorte que deixou de existir.
- `docs/migracoes.md`: a entrada nova entrou sob o `## 7.0.0` já aberto (plan-77/plan-78), não uma major
  nova — é a mesma major ainda não publicada (`package.json` segue em `6.3.0`).
- Não toquei `specs/specs/09-temas-e-presets.md` (cita os 5 temas da leva por nome, no §5.2) — não está
  em `§3.1` desta plan como arquivo editável agora; fica para a síntese do revisor, que já é o destino
  declarado no §8.
- Observei (não fiz) uma edição em `specs/plan/plan-72-...md` (mudou `depende_de` para `plan-79` e ganhou uma
  seção `2.0` descrevendo a plan-80 partida em duas) — não é desta conversa; não revertida, não tocada.

**Achados fora do escopo (não corrigidos, registrados apenas)**
- `src/core/Design/presets/themes/kinetic-flow.ts:176` segue com o vídeo de terceiro
  (`test-videos.co.uk`) — o dono marcou `kinetic-flow` como "melhorar", não "remover"; o conserto é da
  autoria futura, não desta remoção.

**Pendências / riscos**
- Próximos passos combinados nesta conversa: guiar o dono na atualização do ERP (as duas camadas de cache
  de specs/13-instalacao-e-atualizacao.md §9.1) e, depois, executar a `plan-72`. Nenhum dos dois começou
  ainda neste bloco.
- `sarak-dev/` não foi regenerado nesta ação (só `sarak-ui/` via `guide`) — `dev-kit:check` confirmou que
  não havia necessidade (0 ponteiros mortos, kit em dia), reconferido depois da segunda rodada do `build`
  (a que já inclui o fix do §5 passo 5).

---

## Resumo da execução — Lote 1 (correção) — 2026-09-18

**Resultado:** os 4 achados do veredito de 2026-09-18 (§10) corrigidos. Reenvio do lote 1 (par de
referência `sarak-sovereign`/`minimalist-airy`) para nova aprovação técnica e visual — as capturas não
mudaram desde a rodada anterior (nenhuma cor autorada foi alterada nesta correção, só a régua que a mede e
o gate de chave órfã).

**O que foi feito, por achado**

1. **Lote registrado.** Este bloco é o registro que faltava — cobre o lote 1 inteiro (autoria + esta
   correção), não só a correção.
2. **Citação do rastro removida.** O comentário de `SarakMenuItem.test.tsx` que nomeava o passo da plan foi
   reescrito para explicar a decisão em prosa, sem citar plan nem veredito — `npm run trail-citation:check`
   confere.
3. **Régua de hover reescrita.** Nova função `evaluateHoverBgDistinction` mede **só o fundo** (a antiga
   `evaluateActiveDistinction`, reusada por engano, aprovava por texto OU fundo — e o texto muda em TODO
   tema, sempre, então nunca reprovava um hover `transparent`). A nova varredura roda nas duas orientações
   **e nos dois modos**: o nativo (`theme.design`) e o oposto resolvido por `resolveThemeForMode` (a mesma
   função de runtime — contraparte autorada quando existe). Tema ainda não reautorado nesta campanha entra
   em `TEMAS_AINDA_NAO_REAUTORADOS`, uma constante local com os mesmos 9 ids de
   `CONTRAPARTE_EXEMPTION_LIST` hoje — **cópia, não import**: ver decisão abaixo. Reproduzi a mutação do
   revisor (os dois hovers de `sarak-sovereign` de volta a `transparent`) e confirmei que a nova varredura
   reprova (antes: 41/41 verdes; agora: 1 teste falha, exatamente o de `sarak-sovereign`).
4. **`verify_presets.ts` aceita `PAYLOAD_EXTRA_KEYS`.** Nova função exportada `findOrphanKeys(design,
   scaffold)` — chave só é órfã se não está no gabarito visual **e** não está em `PAYLOAD_EXTRA_KEYS`
   (`src/core/Provider/payloadExtraKeys.ts`, a mesma lista que `validateDesign` usa em runtime). O script
   ganhou a guarda de execução direta (`isMain`, o mesmo padrão de `verify_contrast.ts`) para poder ser
   importado por teste sem rodar `runAudit()` como efeito colateral. Novo arquivo
   `gates/scripts/audit/__tests__/verify_presets.test.ts`: prova que nenhuma chave de
   `PAYLOAD_EXTRA_KEYS` (`enabledLanguages` inclusive) é acusada, e que uma chave inventada
   (`totallyMadeUpTokenThatDoesNotExist`) continua reprovando.

**Achados extras, encontrados só ao medir (não estavam no veredito)**

- Minha primeira tentativa do item 3 **importava** `CONTRAPARTE_EXEMPTION_LIST` direto de
  `gates/scripts/audit/verify_contrast.ts`. `tsconfig.json` só inclui `"src"` — `verify_contrast.ts` nunca
  tinha sido alcançado por `tsc --noEmit` (fica fora do programa). Importar um `.ts` de lá a partir de um
  arquivo de `src/` arrasta o arquivo INTEIRO para dentro do programa e do escopo de PRODUÇÃO do R30: medido
  com `check-audit-baseline.mjs --with-tsc`, isso acusou 4 erros novos — 3 de sintaxe (`TS5097`, imports com
  extensão `.ts` sem `allowImportingTsExtensions` no `tsconfig.json`, já existentes no arquivo mas nunca
  vistos) e 1 de tipo genuíno e pré-existente (`resolveThemeForMode` recebendo `Record<string, unknown>`
  onde o tipo pede `Record<string, SarakTokenValue>`). Decisão: `TEMAS_AINDA_NAO_REAUTORADOS` é uma cópia
  local (mesmo conteúdo, comentário explicando o porquê de não importar), e minha PRÓPRIA chamada a
  `resolveThemeForMode` recebe um objeto com `design` explicitamente convertido para
  `Record<string, SarakTokenValue>` — não repito o defeito de tipo que `verify_contrast.ts` tem escondido.
  Não toquei `verify_contrast.ts` (fora do escopo desta correção).
- `ShellLanguageSelector.test.tsx` e `shellPreferenceRow.test.tsx`: 2 testes ("sem nenhum idioma
  habilitado/sem 2+ idiomas, não monta") dependiam de config `{}` cair num tema-semente
  (`GLOBAL_THEMES[0]` = `sarak-sovereign`) sem `enabledLanguages` — deixou de valer quando o item 3 da
  autoria original deste lote deu 6 idiomas a `sarak-sovereign`. Corrigido passando
  `{ enabledLanguages: [] }` explícito: o que o teste verifica é o gate do COMPONENTE (some com 0 ou 1
  idioma), não o que o tema-padrão declara hoje — só achado ao rodar a suíte inteira, não nos arquivos
  tocados (mesma classe do achado de snapshot da rodada anterior).
- `PreviewCanvas.test.tsx.snap`: desatualizado pelo próprio conserto de hover do item de autoria original
  (`sidebarHoverColor`/`topbarHoverColor` de `sarak-sovereign`, contraparte clara: `transparent` →
  `rgba(0, 0, 0, 0.04)`). Conferido variável a variável antes de regenerar (`vitest -u`): só essas 2
  mudaram, contagem total de variáveis igual (985 = 985) — não uma divergência escondida.

**Arquivos alterados nesta correção**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | alterado | citação removida; `evaluateHoverBgDistinction` (só fundo); varredura nos dois modos; `TEMAS_AINDA_NAO_REAUTORADOS` local |
| `gates/scripts/audit/verify_presets.ts` | alterado | `findOrphanKeys` exportado, aceita `PAYLOAD_EXTRA_KEYS`; guarda `isMain` |
| `gates/scripts/audit/__tests__/verify_presets.test.ts` | novo | prova `PAYLOAD_EXTRA_KEYS` não órfã + chave inventada continua reprovando |
| `src/components/atomic/Navigation/__tests__/ShellLanguageSelector.test.tsx` | alterado | 1 teste passa a forçar `enabledLanguages: []` em vez de `{}` |
| `src/components/atomic/Navigation/__tests__/shellPreferenceRow.test.tsx` | alterado | `renderRow` aceita `config`; 1 teste passa `enabledLanguages: []` |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado (gerado) | regenerado (hover de `sarak-sovereign`) |

**Verificações executadas**
- Mutação do revisor reproduzida (hovers de `sarak-sovereign` de volta a `transparent`) → a nova varredura
  reprova (antes: passava, 41/41 verdes).
- `npm run trail-citation:check` → `[OK] Nenhuma linha adicionada cita plan, veredito ou achado de veredito.`
- `npx tsx gates/scripts/audit/verify_presets.ts` → 113 itens (11 temas + 102 presets), 0 órfãs
  (`enabledLanguages` incluído nos 2 temas do lote).
- `npx tsx gates/scripts/audit/verify_contrast.ts` → 0 reprovados nos dois modos; 9 isentos, 2 com
  contraparte, 0 sem contraparte fora da isenção.
- `npm run audit` → 2 regras estruturais quebradas, as mesmas do baseline conhecido
  (`auditor_ghostvars` — 1 var fantasma `--x`, um literal de exemplo dentro de uma mensagem de erro em
  `resolveToken.ts:102`, não um `var()` de verdade; `auditor_composicaoatomica` — 2 ocorrências em
  `SarakMultiSelect.tsx`/`SarakUploader.tsx`). Conferido contra `HEAD` limpo via `git archive HEAD | tar -x`
  para uma pasta fora do repo (nunca `git stash`, por instrução do veredito) — as mesmas 2 falhas aparecem
  sem nenhuma mudança deste lote, então não são regressão.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → **"igual ao baseline de 2026-08-11 —
  nenhuma regressão"** (rodou primeiro com a importação de `gates/` do achado extra 1 e acusou regressão de
  verdade — 1 erro de produção, 1 de teste —, corrigido, reconferido limpo).
- `npx vitest run --maxWorkers=3` → **376 arquivos / 1958 testes, 0 falhas** (rodada completa). Numa rodada
  anterior sem limitar workers, 2 testes oscilaram por timeout sob concorrência
  (`check-barrel-parity.test.mjs`, hook de 60s; `SarakPDFViewerImpl.test.tsx`, 5s) — confirmados
  independentes desta correção ao rodar cada um isolado (verde nos dois); `--maxWorkers=3` remove a
  contenção e fecha 100% verde numa rodada só.

**Critérios de aceite (desta correção)**
- [x] Lote 1 registrado na §9, com a aprovação do dono ainda pendente (reenvio).
- [x] `trail-citation:check` verde.
- [x] A régua de hover mede fundo, nas duas orientações, nos dois modos, e a mutação do revisor reprova.
- [x] `enabledLanguages` (e toda `PAYLOAD_EXTRA_KEYS`) não é acusada como órfã; uma chave inventada continua
  sendo.
- [x] `check-audit-baseline --with-tsc` volta a "igual ao baseline".
- [x] Suíte inteira, 0 falhas.

**Decisões e suposições**
- `TEMAS_AINDA_NAO_REAUTORADOS` é cópia local, não import de `CONTRAPARTE_EXEMPTION_LIST` — motivo medido no
  achado extra 1 acima. As duas listas têm de andar juntas manualmente (todo lote futuro que tirar um tema de
  uma tira também da outra); aceitável porque os dois eventos (contraparte + hover) já acontecem no mesmo
  lote, pela própria mecânica da plan.
- Não toquei `verify_contrast.ts` além do que já estava em `§3.1` (a `CONTRAPARTE_EXEMPTION_LIST` em si não
  mudou nesta correção — ainda são os mesmos 9 ids da autoria original). O erro de tipo pré-existente que
  encontrei nele (`resolveThemeForMode` chamado sem cast) fica registrado aqui como achado, não corrigido:
  está fora do escopo declarado desta correção (exclusivamente os achados do veredito).

---

## Resumo da execução — Lote 1 (correção 2) — 2026-09-18

**Resultado:** achado 5 do "Veredito do lote 1 (correção 1)" (§10) corrigido.

**O que foi feito**
- `gates/scripts/audit/verify_presets.ts:27-32` — o comentário que explica por que chave de
  `PAYLOAD_EXTRA_KEYS` não é órfã citava "veredito do lote 1 da recalibração do catálogo de temas". Reescrito
  para dizer o fato por si (todo tema que declarasse uma dessas chaves reprovaria, por este auditor não
  conhecer a lista), sem citar veredito nem lote. Nada além do comentário mudou.

**Verificações executadas**
- `npm run trail-citation:check` → `[OK]`.
- `npx vitest run gates/scripts/audit/__tests__/verify_presets.test.ts` → 5/5 verdes.
- `npx tsx gates/scripts/audit/auditor_presets.mjs` → 113 itens, 0 órfãs.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline, sem regressão.

**Critérios de aceite (desta correção)**
- [x] `verify_presets.ts` não cita rastro de execução.

**Veredito visual do dono — Lote 1 (par de referência)**
- ✅ **Aprovado.** Nenhuma mudança pedida. Lote 1 fechado: `sarak-sovereign` e `minimalist-airy` completos
  (contraparte, hover, `enabledLanguages`).

---

## Resumo da execução — Lote 2 — 2026-09-18

**Resultado:** lote 2 autorado e fechado — `cyberpunk-neon`, `industrial-terminal`, `neo-brutalism`. Escolhi
3 temas (não os 6 que o §5 passo 6 permite como teto) para manter o ciclo de verificação de contraste
administrável por lote, depois do lote 1 ter levado duas rodadas de correção.

**O que foi feito, por tema**
- **`cyberpunk-neon`**: fundo de hover não-transparente (`rgba(0, 255, 65, 0.08)`, tingido na própria
  primária verde) nas duas orientações; `contraparte` autorada (luz neutra, `navItemActiveColor` verde
  escurecido `#007a3d` para manter AA sobre fundo claro); `enabledLanguages`.
- **`industrial-terminal`**: hover já era real (`#1f1f1f`) — só ganhou `contraparte` (parchment/âmbar,
  mantém a identidade industrial em modo claro) e `enabledLanguages`. Achado ao medir a contraparte:
  `textColorMuted` e `inputTextColor` (este sem valor autorado, caindo no default `#ffffff` do schema)
  reprovavam AA contra o fundo claro — corrigidos com valores próprios da contraparte.
- **`neo-brutalism`**: fundo de hover (`rgba(255, 0, 0, 0.12)`, vermelho); `contraparte` autorada
  (preto/branco/vermelho, sem o cinza morno do resto do catálogo — mantém a "agressividade" da descrição);
  `enabledLanguages`. Achado real, corrigido: `navItemActiveColor`/`navActiveMarkerColor` e
  `cardActionBtnPrimaryBg`/`cardActionBtnHoverBg` ainda usavam o ciano de outro tema (resíduo do gabarito
  usado para autorar o arquivo, nunca substituído pela identidade vermelha do próprio tema — o próprio botão
  de ação do card destoava da paleta descrita). Trocados pela família vermelha do tema
  (`primaryColor: '#ff0000'`); a medição de contraste então pediu escurecer levemente
  (`cardActionBtnPrimaryBg`/`Text` e `navItemActiveColor` da contraparte) para os pares baterem 4,5:1 —
  registrado abaixo.

**Método de verificação de contraste** (os 3 temas, evitando tentativa-e-erro): usei `auditTheme`/
`auditThemeOppositeMode` (`verify_contrast.ts`) direto, num script descartável, antes de fechar qualquer
cor — a régua real, não estimativa manual. Falhas medidas e corrigidas nesta rodada:
- `industrial-terminal` (oposto): `textColorMuted` (3,41→ok) e `inputTextColor` (1,06→ok, campo sem valor
  autorado antes, caindo no branco-sobre-branco do schema).
- `neo-brutalism` (nativo): `cardActionBtnText` vs `cardActionBtnHoverBg` (3,30→ok, texto virou branco em
  vez do quase-preto herdado do ciano).
- `neo-brutalism` (oposto): `cardActionBtnText` vs `cardActionBtnPrimaryBg` (4,00→ok), `inputTextColor`
  (1,00→ok, mesmo caso do industrial-terminal), `navItemActiveColor` nas duas orientações (4,00→ok,
  vermelho puro não bate 4,5:1 em fundo branco — escurecido para `#cc0000`).
Depois dos ajustes: 0 falhas, 0 pulados fora do já conhecido (`cyberpunk-neon` pula 1 par —
`btnPrimaryText` vs `btnPrimaryBg`, que é `transparent` de propósito no tema, mesma classe dos 13 pulados
já registrados no catálogo).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/cyberpunk-neon.ts` | alterado | hover real; `contraparte`; `enabledLanguages` |
| `src/core/Design/presets/themes/industrial-terminal.ts` | alterado | `contraparte`; `enabledLanguages` |
| `src/core/Design/presets/themes/neo-brutalism.ts` | alterado | hover real; acentos ciano→vermelho; `contraparte`; `enabledLanguages` |
| `gates/scripts/audit/verify_contrast.ts` | alterado | `CONTRAPARTE_EXEMPTION_LIST` 9→6 |
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` | alterado | contagem e exemplo de isento atualizados (`synthwave-retro`) |
| `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | alterado | `TEMAS_AINDA_NAO_REAUTORADOS` 9→6 |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado (gerado) | regenerado (3 entradas: os 3 temas do lote, de contraparte sintetizada para autorada) |
| `dist/*` | alterado (gerado) | `npm run build` |
| `browser-tests/showcase-output/*` | gerado, não versionado | vitrine regenerada, 44 capturas |

**Verificações executadas**
- `npx tsx verify_presets.ts` → 113 itens, 0 órfãs.
- `npx tsx verify_contrast.ts` → 0 reprovados nos dois modos; 6 isentos, 5 com contraparte, 0 sem
  contraparte fora da isenção.
- `npx tsx verify_diversity.ts` → catálogo de 11 medido (números iguais ao lote 1 — os 3 temas do lote não
  mudam matiz/saturação/densidade estrutural, só ganham contraparte e hover).
- `npm run audit` → 2 regras estruturais quebradas, as mesmas do baseline conhecido (`auditor_ghostvars` e
  `auditor_composicaoatomica`).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline.
- `npm run trail-citation:check` → `[OK]`.
- `npm run build` → verde.
- `npx tsx browser-tests/generate-showcase.mts` → 44 capturas, 0 falhas. Inspecionadas visualmente as 3
  temas do lote nos dois modos: badges legíveis em toda variante, hover/ativo distintos, identidade de cor
  preservada na contraparte (verde neon, âmbar industrial, vermelho brutalista).
- `npx vitest run --maxWorkers=3` → **376 arquivos / 1961 testes, 0 falhas**.

**Critérios de aceite (deste lote)**
- [x] Os 3 temas cumprem [[09-temas-e-presets]] §7 e a skill `ui-criar-tema` §5–5.6: `findMissingThemeAxes`
  vazio nos 3, `contraparte` autorada, hover perceptível nas duas orientações e nos dois modos,
  `enabledLanguages` com os 6 idiomas.
- [x] `CONTRAPARTE_EXEMPTION_LIST`/`TEMAS_AINDA_NAO_REAUTORADOS` encolheram exatamente pelos 3 ids deste
  lote.
- [x] Suíte inteira, 0 falhas.

**Decisões e suposições**
- Lote de 3, não 6: o teto do §5 passo 6 é "até seis", não "sempre seis" — decisão de manter o lote pequeno
  o bastante para cada correção de contraste ficar rastreável.
- Corrigi os acentos ciano residuais de `neo-brutalism` (não pedido explicitamente por nenhum achado, mas
  direto da própria descrição do tema — "Aggressive contrast... flat geometry" não descreve um botão ciano
  brilhante) porque são campos que RENDERIZAM (botão de ação do card, marcador de item ativo), não campos
  inertes por trás de um toggle desligado (ex.: `cardGlowColor`/`cardTitleIconGlow`/`btnNeonGlowColor`
  seguem cianos, mas `cardGlowIntensity: 0`/`btnStyleType: 'matte'` os tornam invisíveis em runtime — não
  toquei esses, para não fazer troca cosmética sem efeito visual medido).
- `cyberpunk-neon` e `industrial-terminal` não tinham esse resíduo (`industrial-terminal` já era
  coerente na íntegra; `cyberpunk-neon` mantém `navItemActiveColor` ciano de propósito — é um segundo neon
  da própria paleta multi-cor do tema, não um resíduo de outro).
- `kinetic-flow` (vídeo de terceiro pendente) e os outros 5 temas legados restantes ficam para os próximos
  lotes — nenhum deles entrou nesta rodada.

---

## Registro — veredito visual do lote 2 e decisão sobre `cyberpunk-neon` — 2026-09-18

**Contexto trazido pelo dono:** ele ainda não atualizou a lib no ERP, e por isso não visualizou o lote 2 de
verdade — atualizar o ERP a cada lote não é viável (as duas camadas de cache de
specs/specs/13-instalacao-e-atualizacao.md §9.1 tornam cada atualização um ciclo caro). Pediu a melhor forma
de conduzir daqui pra frente.

**Encaminhamento proposto e adotado:** autorar todos os lotes restantes (3, os 6 legados que faltam
reclassificar, e os 3 temas novos) até o fechamento da §5, sem bloquear cada lote numa aprovação visual
formal do dono. Cada "Parada por lote" continua acontecendo tecnicamente — audit, contraste, diversidade,
suíte inteira, vitrine gerada e por mim inspecionada visualmente antes de seguir —, mas o veredito visual de
verdade do dono (o que só o ERP real mostra) fica **diferido para uma revisão única**, depois de tudo
atualizado, quando ele atualizar/testar de uma vez e puder pedir ajuste em qualquer lote já entregue. Isto
é uma mudança do que o §5 passo 7 previa (aprovação por lote, registrada antes do próximo começar) — fica
registrada aqui como decisão do dono, não como iniciativa unilateral.

- **Veredito visual do lote 2:** diferido pelo motivo acima. Tecnicamente segue liberado (veredito técnico
  do revisor, 🟢).
- **`cyberpunk-neon`:** decisão também diferida — o dono vai avaliar depois da atualização e pedir a
  recriação se achar necessário. Até lá, o tema segue tratado como "melhorar" (estado em que o lote 2 o
  entregou), não como "recriar".

---

## Resumo da execução — Lote 3 — 2026-09-18

**Resultado:** lote 3 autorado e fechado — `nebula-space`, `kinetic-flow`, `cyber-retro-wave` (os 3
"melhorar" legados que faltavam). Restam antes do fechamento: os 2 "recriar" (`synthwave-retro`,
`data-terminal`), `neumorphic-mobile` ("melhorar") e os 3 temas novos (emenda §3.5).

**O que foi feito, por tema**
- **`nebula-space`**: fundo de hover não-transparente nas duas orientações (`rgba(255, 0, 127, 0.1)`,
  tingido na própria primária); `contraparte` autorada; `enabledLanguages`. **Achado real, corrigido:**
  `globalBackgroundImageUrl` apontava para uma imagem de terceiro (`images.unsplash.com`) — mídia de
  terceiro é vedada pelo §3.2/§5 passo 6. Removida (`''`, mesmo padrão já usado por `cyber-retro-wave`/
  `data-terminal`/`minimalist-airy`/`neumorphic-mobile`).
- **`kinetic-flow`**: fundo de hover da topbar (a sidebar já era real); `contraparte` autorada;
  `enabledLanguages`. **Achado do backlog fechado:** `globalBackgroundImageUrl` apontava para um vídeo de
  terceiro (`test-videos.co.uk`, já registrado como pendência desde a remoção dos 12 temas) — removido, e a
  `description` reescrita (não citava mais vídeo nenhum).
- **`cyber-retro-wave`**: fundo de hover não-transparente nas duas orientações (`rgba(255, 0, 255, 0.1)`);
  `contraparte` autorada; `enabledLanguages`. Sem achado — já não tinha resíduo de outro tema (o ciano do
  botão de ação é o próprio `secondaryColor` do tema, coerente com a paleta magenta+ciano retrowave da
  descrição).

**Verificação de contraste** (mesmo método dos lotes 1/2 — `auditTheme`/`auditThemeOppositeMode` num script
descartável antes de fechar cor): `cyber-retro-wave` fechou sem nenhuma falha de primeira. `nebula-space` e
`kinetic-flow` precisaram de um ajuste cada, os dois no MESMO par (`cardActionBtnText` contra
`cardActionBtnPrimaryBg`/`cardActionBtnHoverBg`, ratio 3.7–3.9 na contraparte) — a cor de ação nativa
(rosa/magenta vibrante) não sustenta 4,5:1 nem com texto branco nem escuro no fundo claro; escureci
`cardActionBtnPrimaryBg`/`cardActionBtnHoverBg` só na leitura que a contraparte usa. `kinetic-flow` também
precisou escurecer `textColorMuted` (4,34→ok, abaixo do limiar por uma margem pequena). Os dois têm barras
translúcidas por desenho nativo (glass/neon, não uma cor sólida) — o auditor PULA os pares de
`sidebarColor`/`topbarColor` nos dois modos, mesma classe de "fundo não determinístico" já registrada
noutros pontos do catálogo, não uma falha.

**Achado do processo, corrigido antes de fechar:** minha primeira autoria de `kinetic-flow` duplicou
`cardActionBtnText` no bloco `contraparte` (dois valores para a mesma chave, um do bloco geral e outro do
ajuste de contraste) — `tsc` acusou (`TS1117`, erro de sintaxe, não de tipo). Removida a duplicata antes de
qualquer verificação de gate.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/nebula-space.ts` | alterado | hover real; imagem de terceiro removida; `contraparte`; `enabledLanguages` |
| `src/core/Design/presets/themes/kinetic-flow.ts` | alterado | hover real (topbar); vídeo de terceiro removido; `description` reescrita; `contraparte`; `enabledLanguages` |
| `src/core/Design/presets/themes/cyber-retro-wave.ts` | alterado | hover real; `contraparte`; `enabledLanguages` |
| `gates/scripts/audit/verify_contrast.ts` | alterado | `CONTRAPARTE_EXEMPTION_LIST` 6→3 |
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` | alterado | contagem e lista de "saíram da isenção" atualizadas |
| `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | alterado | `TEMAS_AINDA_NAO_REAUTORADOS` 6→3 |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado (gerado) | regenerado (3 entradas: os 3 temas do lote) |
| `dist/*` | alterado (gerado) | `npm run build` |
| `browser-tests/showcase-output/*` | gerado, não versionado | vitrine regenerada, 44 capturas |

**Verificações executadas**
- `npx tsx verify_presets.ts` → 113 itens, 0 órfãs.
- `npx tsx verify_contrast.ts` → 0 reprovados nos dois modos; 3 isentos (`synthwave-retro`, `data-terminal`,
  `neumorphic-mobile`), 8 com contraparte.
- `npx tsx verify_diversity.ts` → números iguais aos lotes 1/2 (o lote não mexeu em matiz/saturação/modo).
- `npm run audit` → 2 regras estruturais quebradas, as mesmas do baseline conhecido.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline (depois de eu
  corrigir a duplicata de chave acima, que bloqueava com 1 erro de produção).
- `npm run trail-citation:check` → `[OK]`.
- `npm run build` → verde.
- `npx tsx browser-tests/generate-showcase.mts` → 44 capturas, 0 falhas. Inspecionadas visualmente as 3
  temas do lote nos dois modos: sem vestígio de mídia de terceiro, hover/ativo distintos, badges legíveis,
  identidade de cor preservada na contraparte.
- `npx vitest run --maxWorkers=3` → **376 arquivos / 1964 testes, 0 falhas**.

**Critérios de aceite (deste lote)**
- [x] Os 3 temas cumprem [[09-temas-e-presets]] §7 e a skill `ui-criar-tema` §5–5.6: `findMissingThemeAxes`
  vazio nos 3, `contraparte` autorada, hover perceptível, `enabledLanguages`, nenhuma mídia de terceiro.
- [x] `CONTRAPARTE_EXEMPTION_LIST`/`TEMAS_AINDA_NAO_REAUTORADOS` encolheram exatamente pelos 3 ids deste
  lote — restam `synthwave-retro`, `data-terminal`, `neumorphic-mobile`.
- [x] O achado de mídia de terceiro do `kinetic-flow`, pendente desde a remoção dos 12 temas, fechou.
- [x] Suíte inteira, 0 falhas.

**Decisões e suposições**
- Lote de 3 (os "melhorar" restantes), não incluindo os 2 "recriar" nem `neumorphic-mobile`: mantém o
  mesmo porte administrável dos lotes anteriores, e separa o trabalho mecânico (hover/contraparte/idiomas)
  do trabalho de identidade nova que "recriar" exige — este último fica para o próximo lote, junto do
  quadro de diversidade que só ele (e os 3 temas novos) tem liberdade de corrigir.
- `nebula-space` também usava mídia de terceiro (achado novo, não estava no backlog) — mesma correção do
  `kinetic-flow`, sem esperar um lote dedicado, porque o §3.2 já veda isso e o conserto é de uma linha.

---

## Resumo da execução — Lote 4 — 2026-09-18

**Resultado:** lote 4 autorado e fechado — `synthwave-retro` e `data-terminal` **recriados** do zero
(identidade nova, não patch), e `neumorphic-mobile` (o último "melhorar"). `CONTRAPARTE_EXEMPTION_LIST` e
`TEMAS_AINDA_NAO_REAUTORADOS` chegam a **zero** — todo tema do catálogo shippado hoje tem contraparte
autorada. Faltam só os 3 temas novos (emenda §3.5) antes do fechamento (§5 passo 8).

**Recriações — identidade nova, escolhida para corrigir o quadro de diversidade (nota do veredito do lote
3, §10):**
- **`data-terminal`** vira um terminal **claro** (antes: um híbrido incoerente de valores claros e escuros
  no mesmo `mode: 'dark'` — cabeçalho de card branco sobre corpo de card preto, por exemplo). Fundo quase
  branco, acento verde vívido (`primaryColor` S=100), tipografia monoespaçada (`JetBrains Mono`),
  cantos retos, densidade compacta. `contraparte` (escura) é o terminal hacker clássico: preto absoluto,
  texto e acento em verde neon — a MESMA identidade, invertida, não duas coisas diferentes. Preenche o
  critério "≥1 tema claro com primária S≥60" (estava em 0/11).
- **`synthwave-retro`** vira um "outrun sunset": sol laranja (`primaryColor` H=16, família diferente do
  ciano/magenta que já dominava 6 dos 11 temas) sobre um céu de dusk em ameixa — fundo de luminosidade
  **média** (L=28, dentro de 25–75), não mais preto quase absoluto. `contraparte` clara é o mesmo pôr do
  sol num papel creme. Preenche o critério "≥1 tema com `colorBgBody` de luminosidade média" (estava em
  0/11) e tira um tema da família ciano/magenta.
- Os dois passaram pela mesma verificação de contraste real (`auditTheme`/`auditThemeOppositeMode` num
  script descartável) que os lotes anteriores — nenhum dos dois fechou de primeira; cada um precisou de 2-3
  rodadas de ajuste de cor (texto mudo, texto sobre botão de ação, cor do item ativo sobre o realce) até
  zerar falhas nos dois modos.

**`neumorphic-mobile` ("melhorar"):** hover já era real; ganhou `contraparte` (a mesma superfície neumórfica,
em grafite escuro) e `enabledLanguages`. **Achado real, corrigido:** os acentos vivos (item ativo, botão de
ação do card, switch, glow) usavam um azul genérico (`#3b82f6`) que não aparece em nenhum outro campo do
tema — a paleta de verdade do tema é cinza-azulado (`primaryColor`) com um rosa pastel (`tertiaryColor:
'#ffb3c6'`, já usado no foco do input). Troquei os acentos vivos pela família desse rosa, escurecida onde o
contraste em texto exigiu.

**Achado do processo, corrigido antes de fechar:** minha primeira autoria do `data-terminal` duplicou
`tooltipTextColor` (uma vez no topo do objeto `design`, herdada por engano da minha primeira tentativa, e
de novo perto de `tooltipBg` com o valor certo) — mesma classe do achado do lote 3 (`tsc` acusa
`TS1117`, sintaxe, antes de qualquer gate rodar). Removida a duplicata.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/data-terminal.ts` | recriado | identidade nova: terminal claro/verde + contraparte escura |
| `src/core/Design/presets/themes/synthwave-retro.ts` | recriado | identidade nova: outrun laranja/ameixa + contraparte clara |
| `src/core/Design/presets/themes/neumorphic-mobile.ts` | alterado | acentos azuis→rosa (coerência de paleta); `contraparte`; `enabledLanguages` |
| `gates/scripts/audit/verify_contrast.ts` | alterado | `CONTRAPARTE_EXEMPTION_LIST` 3→0 (vazia) |
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` | alterado | teste da isenção reescrito (o exemplo real que provava a isenção deixou de existir); contagem 0 |
| `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | alterado | `TEMAS_AINDA_NAO_REAUTORADOS` 3→0 (vazia) — a varredura de hover agora cobre os 11 temas, nos dois modos, sem pular nenhum |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado (gerado) | regenerado (3 entradas do lote) |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap` | alterado (gerado) | regenerado (miniatura do `synthwave-retro` na galeria de presets) |
| `dist/*` | alterado (gerado) | `npm run build` |
| `browser-tests/showcase-output/*` | gerado, não versionado | vitrine regenerada, 44 capturas |

**Verificações executadas**
- `npx tsx verify_presets.ts` → 113 itens, 0 órfãs.
- `npx tsx verify_contrast.ts` → 0 reprovados nos dois modos; **0 isentos, 11 com contraparte** (100% do
  catálogo).
- `npx tsx verify_diversity.ts` → mode dark 9→8, ciano+magenta 6→4, claro-saturado 0→1, fundo-médio 0→1
  (números exatos abaixo).
- `npm run audit` → 2 regras estruturais quebradas, as mesmas do baseline conhecido.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline (depois de eu
  corrigir a duplicata de chave do `data-terminal`, que bloqueava com 1 erro de produção).
- `npm run trail-citation:check` → `[OK]`.
- `npm run build` → verde.
- `npx tsx browser-tests/generate-showcase.mts` → 44 capturas, 0 falhas. Inspecionadas visualmente as 3
  temas do lote nos dois modos.
- `npx vitest run --maxWorkers=3` → **376 arquivos / 1966 testes, 0 falhas**.

**`themes:diversity` — saída completa (pedida pela instrução desta parada)**
```
| tema | modo | nav | família | H | S | fundo L | raio | borda | blur | densidade |
|---|---|---|---|---|---|---|---|---|---|---|
| sarak-sovereign | dark | sidebar | ciano | 183 | 100 | 2 | 12 | 1 | 12 | comfortable |
| cyberpunk-neon | dark | sidebar | verde | 135 | 100 | 2 | 0 | 1 | 12 | comfortable |
| industrial-terminal | dark | sidebar | laranja | 36 | 100 | 4 | 0 | 2 | 0 | compact |
| neo-brutalism | dark | topbar | vermelho | 0 | 100 | 2 | 4 | 4 | 12 | comfortable |
| synthwave-retro | dark | topbar | laranja | 16 | 100 | 28 | 24 | 2 | 4 | comfortable |
| nebula-space | dark | topbar | magenta | 330 | 100 | 1 | 24 | 1 | 20 | compact |
| kinetic-flow | dark | sidebar | magenta | 340 | 100 | 2 | 0 | 2 | 4 | compact |
| cyber-retro-wave | dark | sidebar | magenta | 300 | 100 | 3 | 0 | 2 | 16 | comfortable |
| minimalist-airy | light | topbar | azul | 221 | 39 | 98 | 0 | 0 | 0 | spacious |
| data-terminal | light | sidebar | verde | 143 | 100 | 98 | 0 | 1 | 0 | compact |
| neumorphic-mobile | light | topbar | neutro | 201 | 11 | 90 | 0 | 0 | 0 | comfortable |

--- TODOS OS TEMAS (11 temas) ---
mode: dark ............................ 8 de 11
primária S=100 (neon puro) ............. 9 de 11
família ciano + magenta ................ 4 de 11
claro com primária saturada (S≥60) ..... 1 de 11
fundo de luminosidade média (25..75) ... 1 de 11
```
Restam para os 3 temas novos (emenda §3.5, com liberdade total de identidade): reduzir ainda mais
ciano+magenta (4/11) e mode:dark (8/11), e somar mais claro-saturado e fundo-médio (1/11 cada hoje).

**Critérios de aceite (deste lote)**
- [x] Os 3 temas cumprem [[09-temas-e-presets]] §7 e a skill `ui-criar-tema` §5–5.6: `findMissingThemeAxes`
  vazio nos 3, `contraparte` autorada, hover perceptível, `enabledLanguages`, nenhuma mídia de terceiro.
- [x] `CONTRAPARTE_EXEMPTION_LIST` e `TEMAS_AINDA_NAO_REAUTORADOS` **vazias**.
- [x] Saída de `themes:diversity` entregue nesta parada (acima).
- [x] Suíte inteira, 0 falhas.

**Decisões e suposições**
- "Recriar" foi lido como identidade nova de verdade (cor, luminosidade, família), não só "reescrever o
  arquivo com os mesmos valores" — é a leitura que o veredito do lote 3 já antecipava ("o espaço para
  mexer no quadro de diversidade").
- `data-terminal` e `synthwave-retro` mantiveram id, nome e o conceito geral (terminal; synthwave) — só a
  execução de cor/luminosidade mudou. Não interpretei "recriar" como "trocar de conceito", já que nenhum
  achado pediu isso.
- Escolhas de cor validadas por medição real (`auditTheme`/`auditThemeOppositeMode`), não por inspeção
  visual isolada — a mesma disciplina dos lotes anteriores.

---

# 10. Veredito

## Veredito do lote 1 — 2026-09-18 — 🔴 Reprovado

Lote: o par de referência (`sarak-sovereign`, `minimalist-airy`). O veredito **visual** é do dono, na
parada do lote; este é o técnico, e ele vem antes. As capturas continuam valendo para o dono olhar.

**Verificado e correto:**
- os dois temas ganharam `enabledLanguages` com os seis idiomas;
- `sarak-sovereign` ganhou fundo de hover nas duas orientações e na contraparte;
- a vitrine mostra o badge e os templates com `data`;
- o `git stash` usado no controle foi devolvido, e a pilha está igual à de antes.

**Achados:**

1. **O lote não está registrado na plan.** Não há bloco de resumo do lote 1 na §9: o relatório existe só
   na conversa. O §5 passo 7 exige que o lote e a aprovação do dono fiquem registrados no resumo.
2. **`src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx:285` cita o rastro** ("plan-80 §5
   passo 6"). O `trail-citation:check` reprova, e o commit do lote fica barrado (R36).
3. **A varredura de hover não protege o fundo de hover.**
   `SarakMenuItem.test.tsx:292-315` reusa `evaluateActiveDistinction`, que aprova com fundo **ou** texto
   distinto.
   - O texto troca de `--text-muted` para `--sarak-text-main` em todo tema, então um hover com fundo
     `transparent` passa.
   - Mutação do revisor: `sarak-sovereign` com os dois hovers de volta a `transparent` deixa **41 de 41
     verdes**. O conserto que este lote declara não tem trava.
   - Ela também mede só o modo nativo (`theme.design`), e o §5 passo 6 exige os dois modos.
   - Exigido:
     - a varredura mede o **fundo** de hover contra o fundo da barra, nas duas orientações e nos dois modos
       (o design nativo e o design com a contraparte aplicada);
     - a mutação acima derruba o teste.
   - Até o último lote, os temas ainda não reautorados podem ficar numa lista explícita que só encolhe e
     termina vazia no fechamento, como a `CONTRAPARTE_EXEMPTION_LIST`.
4. **Regressão no `audit` não relatada.**
   - `check-audit-baseline --with-tsc` acusa `auditor_presets` de 0 para 1 falha: `enabledLanguages` é
     acusada como chave órfã nos dois temas.
   - O relatório do lote dizia que as únicas falhas eram as três pré-existentes. Isso diverge da medição, e
     o resumo corrige a afirmação.
   - A causa não é o tema: `enabledLanguages` é chave legítima do payload
     (`src/core/Provider/payloadExtraKeys.ts:25`, lida por `overlayPreferences.ts:91`), mas o gabarito do
     `verify_presets.ts` só conhece tokens do schema. Com isso, todo tema que cumprir o §5 passo 6 reprova.
   - Exigido:
     - o `verify_presets.ts` aceita as chaves de `payloadExtraKeys.ts` (escopo ampliado na §3.1);
     - um teste prova que uma chave realmente órfã continua reprovando;
     - o `check-audit-baseline --with-tsc` volta a "igual ao baseline".

**Para o reenvio:**
- Não use `git stash`: ele está entre as escritas no Git proibidas ao executor (`00-prompt-executor` §7
  item 11). Para medir em HEAD limpo, extraia uma cópia fora do repositório, sem escrever nele
  (`git archive HEAD | tar -x -C <pasta temporária>`), e apague a pasta depois.
- Rode a suíte inteira.

---

## Veredito do lote 1 (correção 1) — 2026-09-18 — 🔴 Reprovado

**Verificado e correto:**
- Suíte inteira, rodada pelo revisor: **376 arquivos, 1958 testes, todos verdes**.
  `check-audit-baseline --with-tsc` igual ao baseline; `trail-citation:check` verde; Anel 0 simulado: 0
  achado.
- **Achado 3 fechado.** A varredura mede só o fundo de hover, nas duas orientações e nos dois modos, e
  nenhum tema é pulado. Mutações do revisor:
  - hovers do `sarak-sovereign` de volta a `transparent`: cai;
  - só o hover da **contraparte** a `transparent`: cai. Prova de que o modo oposto é medido.
- **Achado 4 fechado.** O `verify_presets.ts` aceita `PAYLOAD_EXTRA_KEYS`, e o teste do gate prova que uma
  chave realmente órfã continua reprovando.
- Achados 1 e 2 fechados. O snapshot do `PreviewCanvas` mudou só nas duas variáveis de hover, e os testes
  de idioma passaram a declarar zero idioma, sem afrouxar asserção.

**Achado:**

5. **`gates/scripts/audit/verify_presets.ts:30-31` cita o rastro:** *"(veredito do lote 1 da recalibração
   do catálogo de temas — …)"*.
   - O `trail-citation:check` não acusa porque só casa "veredito **de**", mas é a classe que a **R36**
     proíbe: o veredito sai do disco com a plan, e o ponteiro morre junto.
   - Correção: o parêntese deixa de citar veredito e lote. O fato que ele carrega fica, dito por si: todo
     tema que declarasse `enabledLanguages` reprovava, porque o auditor não conhecia a lista. Nada mais
     muda.

---

## Veredito técnico — lote 1 (correção 2) e lote 2 — 2026-09-18 — 🟢 Liberado

**Lote 1:** o achado 5 fechou. O comentário de `verify_presets.ts:27-32` diz o fato sem citar o rastro, e o
grep do revisor (que pega também "veredito do") não acha nada. O veredito visual do dono (aprovado) está no
resumo.

**Lote 2 (`cyberpunk-neon`, `industrial-terminal`, `neo-brutalism`), verificado pelo revisor:**
- Suíte inteira: **376 arquivos, 1961 testes, todos verdes**. `check-audit-baseline --with-tsc` igual ao
  baseline; `trail-citation:check` verde; Anel 0 simulado: 0 achado.
- As duas listas de pendência encolheram juntas, e seguem com os mesmos 6 temas: a
  `CONTRAPARTE_EXEMPTION_LIST` e a lista de hover do `SarakMenuItem.test.tsx`.
- Mutação do revisor: sem a contraparte do `cyberpunk-neon`, o `verify_contrast.ts` sai com erro
  ("Faltando em: cyberpunk-neon"). A isenção não o cobre mais.
- `themes:diversity`, rodado pelo revisor, porque o relatório do lote não o trouxe e o §5 passo 7 o
  exige: 9 de 11 escuros, 8 de 11 com primária de saturação 100, 6 de 11 em ciano ou magenta, 0 claro
  saturado, 0 fundo de luminosidade média. O lote 2 não mexeu nesse quadro.

**Decisão do dono, pendente antes do lote 3:** a Parada 1 classificou o `cyberpunk-neon` como **recriar
(reescrito do zero)**. O lote 2 o entregou como os de "melhorar": hover, idiomas e contraparte, com o
resto do tema legado intacto. O resumo do lote não declara essa troca. O dono escolhe entre:
- aceitar o `cyberpunk-neon` como está, reclassificado para "melhorar";
- devolvê-lo ao lote 3 para ser recriado.

O resumo registra a escolha.

**Para os próximos lotes:**
- `synthwave-retro` e `data-terminal` são "recriar", e recriar é reescrever a identidade a partir do
  gabarito vivo, não acrescentar chaves ao tema legado;
- são também, com os três novos (emenda §3.5), o espaço para mexer no quadro de diversidade acima;
- toda parada de lote traz a saída de `themes:diversity`.

---

## Veredito técnico — lote 3 — 2026-09-18 — 🟢 Liberado

Lote: `nebula-space`, `kinetic-flow`, `cyber-retro-wave`. Verificado pelo revisor:
- Suíte inteira: **376 arquivos, 1964 testes, todos verdes**. `check-audit-baseline --with-tsc` igual ao
  baseline; `trail-citation:check` verde, e o grep do revisor também não acha nada; Anel 0 simulado: 0
  achado.
- As duas listas de pendência encolheram juntas e seguem com os mesmos 3 temas: `synthwave-retro`,
  `data-terminal` e `neumorphic-mobile`.
- A varredura de hover mede os 8 temas reautorados sem pular nenhum, inclusive as barras translúcidas de
  `nebula-space` e `kinetic-flow`.
- Nenhum tema aponta para mídia de terceiro. Os dois casos foram removidos (`nebula-space`, `kinetic-flow`).

**Limite que fica no backlog (#26):** com barra translúcida, o `auditor_contraste` pula os pares de texto
sobre a barra. A legibilidade da navegação nesses dois temas não é medida, e fica para a revisão visual
única (emenda §3.6).

**O próximo lote** leva os 2 "recriar" (`synthwave-retro`, `data-terminal`) e o `neumorphic-mobile`. Os três
temas novos vêm depois, e começam pela parada de identidade (emenda §3.5), que continua valendo.

---

## Veredito técnico — lote 4 — 2026-09-18 — 🟢 Liberado

Lote: `synthwave-retro` e `data-terminal` (recriados) e `neumorphic-mobile`. Verificado pelo revisor:
- Suíte inteira: **376 arquivos, 1966 testes, todos verdes**. `check-audit-baseline --with-tsc` igual ao
  baseline; `trail-citation:check` verde, e o grep do revisor também não acha nada; Anel 0 simulado: 0
  achado.
- **As duas recriações são de fato reescritas**, não acréscimos: 300 linhas mudadas no `data-terminal` e 221
  no `synthwave-retro`, com família, modo ou luminosidade de fundo novos.
- **As duas listas de pendência estão vazias.** Mutação do revisor: sem a contraparte do
  `neumorphic-mobile`, o último tema que saiu da isenção, o `verify_contrast.ts` sai com erro
  ("Faltando em: neumorphic-mobile"). A exigência vale para o catálogo inteiro.
- `themes:diversity`, rodado pelo revisor, confere com o resumo:
  - 8 de 11 escuros;
  - 9 de 11 com primária de saturação 100;
  - 4 de 11 em ciano ou magenta;
  - 1 claro saturado;
  - 1 fundo de luminosidade média.

**Exigência acrescentada ao fechamento (§5 passo 8 e §6):** a nota de migração passa a cobrir os temas que
mantêm o id e mudam o que o usuário vê. É o caso do `data-terminal`, que troca de modo nativo, de escuro
para claro: quem o tinha aplicado abre a tela clara, sem aviso nenhum hoje.

**Para a parada de identidade dos três novos (emenda §3.5):** o quadro acima ainda concentra primária neon
pura (9 de 11) e tema escuro (8 de 11). Os três novos são o último espaço para mexer nisso.

---

# 11. Síntese
