---
tipo: "plan"
titulo: "Separar a cor do tema: um motor que calcula a paleta inteira, nos dois modos, a partir de uma cor e de um tipo"
objetivo: "Fazer as cores do tema saírem de uma paleta calculada a partir de uma cor-base e de um tipo de harmonia, com escalas OKLCH, um mapa de papéis comum por modo e correção de contraste que torna legível qualquer cor de entrada, mantendo o ajuste granular de token por cima"
dominio: "Design Engine / Cores"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "rc.4", "paletas", "cores", "design-engine"]
relacionados: ["[[anexos/rc4-contrato]]", "[[09-temas-e-presets]]", "[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[plan-134-catalogo-de-paletas-e-temas]]", "[[plan-135-paletas-no-painel-e-no-kit]]"]
depende_de: "plan-128-idioma-unico-e-feedback-rico"
retida_por: ""
destino_sintese: "adr/NNN-paleta-calculada-separada-do-tema.md + specs/09-temas-e-presets.md + arquitetura/02-design-engine.md"
---

# 1. Objetivo

Um `design` com `colorPalette` recebe todos os tokens de cor calculados — escalas, papéis por modo e contraste garantido —, e o
token de cor declarado explicitamente (tema, `config` do host ou ajuste do usuário) continua vencendo o calculado.

# 2. Contexto

Decisão do dono (2026-10-27), registrada no contrato da `rc.4` §1.9: **a paleta é só a entrada do cálculo**, `{ cor-base, tipo,
secundária?, acento? }`; não há edição manual de tons. Os presets embarcados (`plan-134`) e a paleta criada pelo usuário no painel
(`plan-135`) usam o **mesmo** cálculo.

**Hoje:** cada tema escreve as cores à mão em `design` e no bloco do modo oposto (`contraparte`, [[09-temas-e-presets]] §2.1); só 55
dos 422 tokens mudam de modo. A composição é `composeThemeDesign` (`src/core/Design/presets/themes/compose.ts`: padrão do schema →
chaves preservadas → `config` do host → tema). O schema de cor é `src/core/Design/schema/colors.ts`. A lição que este desenho não
pode repetir está em [[09-temas-e-presets]] §2.1: inverter cores forçando faixas fixas de luminosidade fez todo tema convergir para a
mesma paleta neutra. Aqui, cada modo lê tons da escala **da própria paleta** — o matiz se conserva.

**O cálculo** (o dono aprova a regra pela prévia da `plan-134`, não por paleta):
1. **Sementes.** Primária = cor-base. Secundária e acento: as informadas, ou giradas pelo tipo — `monochromatic` (mesmo matiz,
   variando luminosidade e croma), `analogous` (±30°), `complementary` (acento a 180°), `split-complementary` (180° ± 30°),
   `triadic` (±120°). Neutro = matiz da base com croma quase zero. Status (sucesso, erro, alerta, informação) com matiz **fixo**,
   só a luminosidade harmonizada.
2. **Escalas.** Cada semente vira 11 tons (50–950) em OKLCH: matiz fixo, régua de luminosidade comum, croma reduzido nas pontas,
   recorte de gama para sRGB reduzindo o croma (nunca o matiz).
3. **Mapa de papéis.** Uma tabela única token → tom, por modo (ex.: `titleColor` = primária 800 no claro, 200 no escuro). A
   hierarquia de título, subtítulo, texto e texto apagado sai daqui.
4. **Correção de contraste.** Depois do mapa, cada par que a tela desenha — a lista `PAIRS` de `gates/scripts/audit/verify_contrast.ts`
   é a fonte, não uma cópia — é conferido pela razão WCAG; abaixo do mínimo, o tom do texto anda na escala (mais escuro no claro, mais
   claro no escuro) até atingir. Determinístico: mesma entrada, mesma saída.

**Formato do token** (contrato §1.9): `colorPalette` é string — `"<id-de-preset>"` ou
`"custom:<tipo>:<#base>[;sec=<#hex>][;acc=<#hex>]"`. Ausente = rc.3 (o tema usa as cores que declara). Por isso nenhum tema salvo de
importador muda: as cores dele são explícitas e vencem.

**Disjunção com a `plan-131`** (paralela): esta plan **não** edita `src/core/Design/hooks/useDesignVariables.ts` nem
`designVariableHelpers.ts`; a cor de título chega como valor do token `titleColor` calculado.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/palette/` (novo) — conversão OKLCH ↔ sRGB, sementes por tipo, escalas, mapa de papéis, correção de contraste,
  `resolvePalette(entrada, modo) → tokens de cor`, parser e validador do valor de `colorPalette`, tipos públicos. Cada módulo com teste.
- `src/core/Design/schema/colors.ts` — token `colorPalette`, com a paridade das três fontes (`catalog/theme_table_mapping.json` e
  partições do catálogo) e o leitor (R40: o leitor é a expansão da paleta).
- `src/core/Design/presets/themes/compose.ts` e o ponto onde o modo escolhe `design` × `contraparte` — inserir a paleta resolvida para o
  modo **antes** das cores explícitas: `padrão → preservadas → paleta(modo) → config do host → tema`, com as cores explícitas do tema e
  do host vencendo a paleta.
- A validação de `design` (`validateDesign` e o predicado por token) — `colorPalette` inválido é recusado com aviso e cai no rc.3.
- Um registro mínimo de presets (`palette/presets.ts`) com **um** preset de teste; o catálogo real é da `plan-134`.
- `src/index.ts` (acréscimo: tipos e `sarakResolvePalette` para quem quiser prever no próprio sistema) · `docs/migracoes.md` (subseção
  na `## 8.0.0`) · `src/core/i18n/catalogEntries.palette.ts` (nomes dos tipos), ligado em `catalog.ts` por acréscimo.

## 3.2 Fora
- Os 19 temas e o catálogo de presets (`plan-134`); o painel e o kit (`plan-135`).
- `useDesignVariables.ts`, `designVariableHelpers.ts` (`plan-131` em paralelo).
- Dependência nova: a conversão OKLCH é código próprio (≈ 60 linhas).
- Mudar `syncThemeWithMode`/`shiftColorMode`: seguem servindo temas sem paleta.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contrato | `specs/plan/anexos/rc4-contrato.md` §1.9, §5 Q8, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/09-temas-e-presets.md` §2, §3, §4.3, §6.5 | contraparte, preset × tema, composição, contraste |
| Spec fixa | `arquitetura/02-design-engine.md` §10 · `arquitetura/04-contrato-de-tokens-e-paridade.md` | leitor de token (R40), um dono por variável, paridade 1:1:1 |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-novo-componente` (token novo com paridade) · `ui-arquitetura-design` | sempre |
| Código | `src/core/Design/presets/themes/compose.ts`, `src/core/Design/schema/colors.ts`, `gates/scripts/audit/verify_contrast.ts` (`PAIRS`) | ler antes de editar |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Módulos puros de `palette/` na ordem do §2 (conversão → sementes → escalas → mapa → contraste → `resolvePalette`), cada um com teste.
3. A régua de luminosidade, a curva de croma e o mapa de papéis ficam em **uma** constante cada, documentada; nenhum hex fixo fora do
   matiz fixo dos status.
4. Token `colorPalette` com paridade e validação; composição como em §3.1.
5. Teste de propriedade: os presets e uma **amostra de cores extremas** (amarelo-limão, ciano, magenta, quase preto, quase branco,
   cinza puro) × os cinco tipos × os dois modos passam em **todos** os `PAIRS` com a razão mínima de cada par.
6. Subseção em `docs/migracoes.md` (token novo; nada muda para quem não o declara); `npm run verify -- --tier=quick` uma vez, resumo
   colado (contrato §9).

# 6. Critérios de aceite

- [ ] `resolvePalette` é determinístico e devolve todos os tokens de cor que o mapa cobre, nos dois modos — teste.
- [ ] Teste de propriedade do passo 5 verde; a correção de contraste comprovadamente atua (um caso em que, sem ela, o par reprova).
- [ ] Cor explícita vence a paleta (tema, host e ajuste do usuário) — teste de composição.
- [ ] Sem `colorPalette`, o `design` composto é idêntico ao da rc.3 para os 19 temas — teste que compara chave a chave.
- [ ] `colorPalette` inválido: aviso e rc.3 — teste.
- [ ] Paridade do token verde (`audit:baseline` do `quick`).
- [ ] Resumo com a tabela item → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — o contraste da paleta é provado por teste de propriedade; o `auditor_contraste` existente passa a medir os temas
que declararem paleta (`plan-134`).

- `npx vitest run src/core/Design/palette compose src/core/Design/schema` — uma vez.
- Diff lido contra o contrato §1.9; `git diff --stat` só com a §3.1. O `quick` do executor é aceito pelo resumo colado.

# 8. Destino da síntese

**Destino:** ADR novo + `specs/09-temas-e-presets.md` + `arquitetura/02-design-engine.md`.

- **ADR** — `alternativas_consideradas`: (a) paleta calculada de uma entrada `{base, tipo, sementes?}`, custo: nenhum ajuste manual
  de tom, a regra do cálculo carrega toda a qualidade; (b) paleta como bloco de valores autorados por modo, custo: ~75 cores × 2 modos à
  mão por paleta, hierarquia de título sem regra comum, criação pelo usuário inviável. Escolhida: (a), decisão do dono, 2026-10-27.
  Voltar atrás exige reescrever presets, painel e payload.
- **09** — novo §: "A cor vem da paleta": entrada, tipos, mapa de papéis, ordem de composição, contraste por construção.
- **02** — onde o motor expande `colorPalette` e por que não toca a emissão de variáveis.

---

# 9. Resumo da execução

---

# 10. Veredito
