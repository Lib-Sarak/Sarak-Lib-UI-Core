---
tipo: "plan"
titulo: "Dar a barra lateral e a barra de topo identidade propria em cada tema"
objetivo: "Fazer a barra lateral e a barra de topo de cada um dos 19 temas terem identidade propria, com texto, borda, profundidade, fundo, item ativo, densidade e icones vindos de tokens declarados pelo tema, e os controles de preferencia sem poluir o rodape da barra"
dominio: "Cromo / Design Engine / Temas"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "cromo", "sidebar", "topbar", "tokens", "temas", "rc"]
relacionados: ["[[05-cromo-e-slots]]", "[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[09-temas-e-presets]]", "[[013-item-de-navegacao-como-atomo-proprio]]", "[[015-metrica-do-item-de-navegacao-horizontal]]"]
depende_de: "plan-123-hierarquia-de-cor-no-texto"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md + arquitetura/02-design-engine.md + specs/09-temas-e-presets.md"
---

# 1. Objetivo

Trocar de tema muda a barra de forma reconhecível — não só a cor de fundo: cor e peso do texto, borda, sombra/vidro, fundo
(sólido, gradiente ou textura), forma do item ativo, densidade e ícones; cada um dos 19 temas tem uma barra própria, legível nos dois
modos; e o rodapé da barra mostra só o que o usuário usa sempre.

# 2. Contexto

Pedido do dono (2026-10-22): a barra ficou pouco personalizável; melhorar a barra individualmente em cada tema, todos numa plan só
(decisão do dono, 2026-10-23). Medido no código (`src/` salvo indicação):

- **Tokens de hoje:** `schema/navigation.ts` (38) + `schema/branding.ts` (6) + `navigationStyle`. Os 19 temas declaram exatamente os
  mesmos 23 estéticos, quase sem variação: `sidebarColor` = `topbarColor` em todos os blocos; ruído 0 em 35 de 38; `navItemRadius` 12
  em 11 temas; `identityAlignment` `left` em 18.
- **Fixo no código (sem token):**
  - borda da barra: `border-b`/`border-r`/`border-l` com a cor de borda do cartão (`components/Layout/chrome/ChromeTopbarBody.tsx:104,109`,
    `chromeStructuralStyles.ts:22-24`, `ChromeSidebarBody.tsx:117`);
  - sombra e blur só na lateral (`ChromeSidebarBody.tsx:119-120`), nenhum na barra de topo;
  - fundo só cor sólida; sem fundo próprio na área da marca nem no rodapé;
  - espaçamento e densidade (`ChromeTopbarBody.tsx:104`, `SarakShellNav.tsx:142-143`, `SarakMenuItem.tsx:72-73`);
  - texto do item: inativo usa o muted global, hover o corpo (`SarakMenuItem.tsx:96-97`) — lateral escura em tema claro fica ilegível;
  - marcador do ativo com forma e tamanho fixos (`SarakShellNav.tsx:96-98`), só cor e brilho são token;
  - rótulo de categoria (`SarakShellNav.tsx:203`), separador (`:184`), ícones (tamanho, traço, cor);
  - nome da marca no `SarakShellNav` ignora `identityFontFamily` (`SarakShellNav.tsx:165-169`).
- **Rodapé da barra (prints):** "P M G" (tamanho da fonte) e "Lateral/Topo" ficam fixos para todo usuário porque o padrão de fábrica da
  composição é "fixa na barra" para os oito widgets ([[05-cromo-e-slots]] §2.2.2). Parecem ferramenta de desenvolvedor.
- **Ruído visual (prints, tema Blueprint):** borda tracejada em quase tudo (barra, busca, cartões, campos).
- Depende da `plan-123`: o texto da barra usa os papéis de cor de texto que ela cria.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/navigation.ts` e `branding.ts` (tokens novos), partições, mapeamento, tipos gerados, `removedTokenKeys.ts`
  se algum sair.
- `src/components/Layout/chrome/` (corpo lateral, corpo de topo, estilos estruturais, `useChromeDesignTokens.ts`, `ChromeSlots.tsx`),
  `src/components/Layout/SarakAppChromeMobile.tsx`, `src/components/atomic/Navigation/` (`SarakShellNav.tsx`, `SarakMenuItem.tsx`, os
  widgets do cromo).
- `src/core/Design/schema/preferences.ts` e a composição da barra — só o padrão de fábrica das posições (passo 1.4).
- `src/core/Design/presets/themes/*.ts` (os 19, com contraparte).
- Testes; casos em `browser-tests/`; `docs/migracoes.md` (`## 8.0.0`); o guia do consumidor só onde citar a composição de fábrica.

## 3.2 Fora
- A largura do conteúdo (`plan-121`), o painel (`plan-122`), os papéis de cor de texto em si (`plan-123`).
- Novos widgets, slots ou mudança de estrutura do cromo (ordem dos slots, regra de degradação).
- A composição continua sendo decisão do sistema, nunca do tema ([[05-cromo-e-slots]] §2.2.2): nenhum tema declara posição de widget.
- Specs fixas (síntese do revisor); versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/05-cromo-e-slots.md` (§2.1.1, §2.2.2, §2.3, §2.4, §2.4.1, §6) | métrica do item; composição; degradação; todo token de cromo tem leitor; zero hardcode |
| Spec fixa | `arquitetura/02-design-engine.md` (§10, §10.6, §10.10, §10.14, §10.15) | o que cada token desenha; `--sarak-on-nav-active`; camadas; estético × funcional |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` (§2, §2.3) | paridade e metadados |
| Spec fixa | `specs/09-temas-e-presets.md` (§2.1, §5.1, §5.2, §5.3, §6.5) | contraparte; fundo offline; diversidade; o que o tema declara e o teto de peso; contraste |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | o celular e a barra na base |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R31, R40-R44) | contraste; leitor; cascata; cor do tema |
| ADR | `adr/013-item-de-navegacao-como-atomo-proprio.md` · `adr/015-metrica-do-item-de-navegacao-horizontal.md` · `adr/021-navegacao-na-base-do-celular.md` | o item e a métrica que não podem quebrar |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-novo-componente` (tokens novos) · `ui-criar-preset` (se o estilo do item ativo virar preset) · `ui-criar-tema` (os 19 temas) · `ui-arquitetura-design` | escrita, testes, token, preset, tema, CSS |
| Código | os arquivos da §3.1 | ler antes de editar |

# 5. Instruções de execução

**Dois lotes**, na ordem; cada um fecha com resumo na §9 e status 🟠.

**Lote 1 — tokens e leitores da barra.** Cada token novo nasce com leitor, teste, metadados e padrão = o comportamento de hoje (até o
lote 2 redefinir o `sarak-sovereign`), separado para lateral e topo onde a §2 mostra que divergem:
1.1. **Texto:** cor do item, do item em hover, do rótulo de categoria e do nome da marca, por barra; a marca respeita `identityFontFamily`
nas duas orientações.
1.2. **Moldura e profundidade:** cor, largura e estilo da borda da barra (incluindo nenhuma) e os lados; sombra e blur também na barra de
topo; cor do separador de grupos; fundo da área da marca e do rodapé.
1.3. **Fundo e item:** fundo da barra como sólido, gradiente ou textura (só o que já funciona offline, [[09-temas-e-presets]] §5.1); estilo
do item ativo como enumeração (barra lateral, pílula, sublinhado, preenchido, contorno) com o marcador acompanhando; densidade do item
(compacto, confortável, espaçoso) respeitando o alvo de toque; tamanho e cor dos ícones da navegação.
1.4. **Rodapé:** o padrão de fábrica das posições muda para "no menu" (dentro do ⚙ *Preferências*) em tamanho da fonte, navegação
topo/lateral e navegação recolhida; modo claro/escuro, busca, usuário, notificações e idioma ficam "fixa na barra". Valor que o sistema
salvou continua valendo. Nota em `docs/migracoes.md`.
1.5. Testes por token; `token-reader:check`, `token-docs:check`, paridade e o gate de cromo da [[05-cromo-e-slots]] §2.4.1 verdes;
caso de navegador: lateral escura em tema claro com item inativo de contraste ≥ 4,5:1.

**Lote 2 — os 19 temas.**
2.1. Cada tema declara os tokens novos (e a contraparte os que carregam modo) com uma barra que expressa a identidade dele — e, onde
fizer sentido, lateral diferente do topo. Um tema por vez, cada um com a decisão de direção em uma linha no resumo.
2.2. Tracejado só onde é a assinatura do tema, num papel só; no Blueprint, barra e campos com borda sólida sutil.
2.2.1. **A contraparte clara leva a assinatura do tema** (medido em 2026-10-23: o Blueprint no claro vira branco e cinza chapados,
sem a grade nem a cor de planta que fazem o tema). A barra e o fundo da contraparte conservam o traço de identidade (textura, matiz,
forma do item ativo), adaptado ao claro.
2.3. Contraste de item inativo, ativo, hover e categoria ≥ 4,5:1 (rótulo de categoria ≥ 3:1 se for grande) nos dois modos.
2.4. Teto de peso por tema respeitado; estourou, relatar — não subir o teto.
2.5. A diversidade do catálogo cobre os eixos novos da barra (pelo menos três estilos de item ativo e três tratamentos de fundo entre os
19); caso de navegador com quatro temas: o estilo computado da barra (fundo, borda, item ativo) difere entre eles.

# 6. Critérios de aceite

- [ ] Tokens de texto, borda, profundidade, fundo, item ativo, densidade, ícone e separador da barra, cada um com leitor e teste.
- [ ] Nenhuma classe fixa de borda, espaçamento ou cor de texto na barra que o token cubra.
- [ ] Rodapé de fábrica sem "P M G" nem "Lateral/Topo" fixos; valor salvo pelo sistema preservado.
- [ ] Os 19 temas com barra própria, contraste passando nos dois modos, teto de peso respeitado.
- [ ] Item de navegação, métrica horizontal, barra na base do celular e regra de degradação intactos (testes existentes verdes).
- [ ] `theme-completeness:check`, `token-reader:check`, `token-docs:check`, paridade, contraste e diversidade verdes.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — os tokens novos entram nos gates de leitor, paridade, completude e contraste que já existem.

- Lote 1: `npm run verify -- --tier=schema-meta`; vitest de `src/components/Layout` e `src/components/atomic/Navigation`;
  `npm run build` + os casos de cromo de `browser-tests/` (incluindo `cromo-css-real` e `barra-de-topo-estreita`).
- Lote 2: `npm run verify -- --tier=themes`; o caso de navegador dos quatro temas.
- Fechamento: `npm run verify -- --tier=full` e a bateria inteira do navegador.
- Conferência no ERP (dono): trocar entre cinco temas no `/design` e ver a barra mudar além da cor.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md + arquitetura/02-design-engine.md + specs/09-temas-e-presets.md`

- **`05` §2.4:** as linhas dos tokens novos da barra; §2.2.2: o padrão de fábrica novo das posições.
- **`02` §10.6:** o que cada token da barra desenha e o estilo do item ativo.
- **`09` §5.2/§5.3:** a barra entre os eixos de diversidade e o que o tema declara dela.

---

# 9. Resumo da execução

---

# 10. Veredito
