---
tipo: "plan"
titulo: "Recalibrar o catálogo de temas shippados para representar a capacidade da biblioteca"
objetivo: "Entregar um catálogo de temas elegantes e funcionais que, juntos, exercitem a capacidade da biblioteca, todos completos, com contraparte, hover e idiomas, e aprovados visualmente pelo dono"
dominio: "Sarak-Lib-UI-Core / Design Engine / Temas"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "temas", "catalogo", "contraparte", "contraste", "diversidade", "hitl"]
relacionados: ["[[specs/09-temas-e-presets]]", "[[specs/05-cromo-e-slots]]", "[[specs/11-testes-e-cobertura]]", "[[016-preferencias-do-usuario-separadas-do-tema]]"]
depende_de: "plan-79-idioma-de-ponta-a-ponta"
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
- todo token de navegação age nos dois cromos;
- os textos da lib seguem o idioma que vale.

Um tema autorado antes disso seria julgado contra uma tela que ainda mentia.

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
- `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` — a medição honesta, mais o hover (§5 passos 1 e 6).
- `src/core/Provider/**` — **só se** a medição do id removido (§2) mostrar comportamento diferente do exigido.
- `browser-tests/**` e `package.json` — a vitrine (§5 passo 2). A saída **não** é versionada (entrada no
  `.gitignore`).
- Os testes que citam ids de tema removidos.
- `.agents/skills/ui-criar-tema/SKILL.md` (e a `references/` dela, se preciso) — a vitrine e as travas novas no procedimento.
- `docs/migracoes.md` — ids removidos, e para onde cai quem os usava, sob a **7.0.0**.
- `dist/` · `sarak-ui/` · `docs/component-catalog.*` · `src/core/Provider/generated/` · `sarak-dev/` — **só pelos geradores**.

## 3.2 Fora
- **Criar token.** Tema é configuração: consome o que o dicionário tem ([[00-regras-e-invariantes]] R11). Se
  faltar um eixo para expressar uma ideia, é achado.
- Presets parciais de componente (`src/core/Design/presets/components/`).
- Default de qualquer token.
- Posições das preferências do usuário: ficam no **padrão de fábrica** em todo tema (skill `ui-criar-tema` §5.6).
- Mídia de terceiro em qualquer tema ([[09-temas-e-presets]] §5.1).
- O consumidor (ERP), código e dado — inclusive os temas dele em `themes.ts`.

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
   mais uma amostra do conteúdo: card, tabela, botões, campos e tipografia. O comando também gera **um
   arquivo único** que reúne as capturas lado a lado, para o dono abrir e comparar.

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
   - Rode os geradores, `npm run build`, `npm run cromo-css-real:check`, `npm run audit` e a suíte inteira
     (`npx vitest run --maxWorkers=3`).

# 6. Critérios de aceite

- [ ] A varredura de realce pula e declara cor que não converte, e tem teste com `hsl()`.
- [ ] `themes:showcase` gera a vitrine a partir do `dist/`, e a saída não é versionada.
- [ ] A matriz de capacidade e a aprovação do catálogo pelo dono estão no resumo (parada 1).
- [ ] Todo lote tem a aprovação visual do dono registrada no resumo (paradas por lote).
- [ ] `SARAK_REFERENCE_THEMES` segue um claro e um escuro, com os ids `minimalist-airy` e `sarak-sovereign`.
- [ ] Id de tema removido cai na referência do modo pedido, com um aviso, pelas três portas (teste).
- [ ] Todo tema shippado: `findMissingThemeAxes` = `[]`; contraparte; hover perceptível nas duas orientações
      e nos dois modos (varredura); seis idiomas em `enabledLanguages`; preferências no padrão de fábrica.
- [ ] `CONTRAPARTE_EXEMPTION_LIST` vazia; `auditor_contraste` 0 e 0; `themes:diversity` passa nos nove.
- [ ] `docs/migracoes.md` lista cada id removido e para onde cai quem o usava.
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

---

# 10. Veredito

---

# 11. Síntese
