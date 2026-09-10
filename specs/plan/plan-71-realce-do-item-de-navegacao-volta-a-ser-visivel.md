---
tipo: "plan"
titulo: "O realce do item de navegação volta a ser visível em todo tema shippado"
objetivo: "Item de menu ativo e item sob o ponteiro voltam a se distinguir dos demais em qualquer tema, nos dois cromos"
dominio: "Sarak-Lib-UI-Core / Componentes atômicos / Navegação"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "navegacao", "design-engine", "regressao", "gate"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/09-temas-e-presets]]", "[[specs/02-design-engine]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md"
---

# 1. Objetivo

O item de navegação ativo e o item sob o ponteiro são visualmente distinguíveis dos demais em **todos** os
temas que a lib entrega, nos dois cromos — e isso é **medido**, não presumido.

# 2. Contexto

O dono validou o ERP e reportou que `sidebarHoverColor` e `sidebarActiveColor` *"também não funcionaram"*.
Parte do relato foi cache do consumidor. **Esta parte não é.**

## 2.1 A regressão

A plan-66 trocou a cor do item ativo por token de cromo. O valor anterior era um tom derivado da primária,
e o novo tem um fallback CSS que **nunca é usado**:

| | Fundo do item ativo |
| --- | --- |
| Antes | tom derivado de `--sarak-primary-color` — visível em qualquer tema |
| Depois | `var(--sarak-…-active-color, <tom de fallback>)` |

O fallback de uma `var()` só vale quando a variável **não está declarada**. O Design Engine declara todo
token do schema em toda aplicação de tema — conferido no navegador: a raiz de um consumidor real traz
`--sarak-topbar-active-color: transparent`. **O fallback é código morto, e o valor efetivo é o default do
schema: `transparent`.**

Alcance medido nos temas shippados (`src/core/Design/presets/themes/`):

| Token | Temas com valor visível | Temas em `transparent` ou ausentes |
| --- | --- | --- |
| `sidebarActiveColor` | 16 | **8** |
| `topbarActiveColor` | 11 | **13** |

Entre os que não têm valor está o tema **`reference`** — o que [[09-temas-e-presets]] §4.1 manda clonar
para criar tema novo. Ele não declara nenhum dos dois, cai no default do schema, e todo tema derivado dele
herda a ausência. É exatamente o caso do consumidor que reportou.

## 2.2 O token que carrega o sinal visível não tem consumidor

`transparent` é default **deliberado** para esses dois: eles são o **fundo**, e o comentário de
`color-engine.ts` registra que o fundo real, sem override, é `sidebarColor`/`topbarColor`. Ou seja: o
default não é o defeito, e trocá-lo não conserta nada — a opção continuaria quebrada para quem escolhesse
`transparent` de propósito.

O que carrega o sinal visível é outro token: **`navItemActiveColor`** — rótulo *"Cor do Item Ativo"*,
descrito no schema como cor de **texto/ícone** do item selecionado. Praticamente todo tema shippado o
autora com um valor forte. Ele declara `--sarak-nav-active-color`.

**Medido: `--sarak-nav-active-color` tem ZERO consumidores** em `src/components/` e `src/core/Shell/`. O
átomo do item de menu usa `--sarak-primary-color` — que é o token `primaryColor`, outro token. O valor que
o autor do tema escreveu para o item ativo é ignorado.

## 2.3 Dois tokens declaram a MESMA variável

| Token | `cssVars` |
| --- | --- |
| `primaryColor` | `--primary-color`, `--theme-primary`, `--sarak-primary-color`, `--sarak-color-primary` |
| `navItemActiveColor` | `--sarak-nav-active-color`, `--theme-primary` |

Os dois emitem `--theme-primary`. Quem escreve por último vence, e a ordem é a de iteração do mapa — não é
decisão de ninguém. O cromo de referência do Shell lê `--theme-primary` para o texto do item ativo, então
**qual token de fato pinta o item ativo do Shell depende da ordem de emissão.** Isso é acidente, e vale
tanto quanto o resto para explicar por que a cor "não funciona".

## 2.4 O hover horizontal também está órfão

`topbarHoverColor` existe no schema e tem **zero consumidores**: o ramo horizontal do item de menu usa
`--sarak-card-bg` no hover. O ramo vertical usa `--sarak-sidebar-hover-color` corretamente. A assimetria
não é decisão declarada em lugar nenhum.

## 2.5 O gate de paridade não pegou nada disso

O `chrome-token-parity:check` tem escopo fechado numa lista de 12 tokens, e declara isso (R18). Mas o bloco
de limites nomeia os órfãos que conhece **sem incluir `topbarHoverColor` nem `navItemActiveColor`**. Uma
declaração de limite incompleta é pior que ausente: ela dá a impressão de que o inventário foi feito.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Navigation/SarakMenuItem.tsx` — quais tokens o realce de ativo e de hover consome.
- `src/core/Design/schema/navigation.ts` · `schema/colors.ts` — a colisão de `--theme-primary` (§2.3).
- `src/core/Shell/Components/TopbarNav.tsx` — **só** para os dois cromos saírem coerentes no mesmo token.
- `gates/scripts/contrato/check-chrome-token-parity.mjs` — os tokens novos na lista e o bloco R18
  **completo**, com todo órfão de cromo que existir hoje nomeado.
- Testes dos componentes tocados, o self-test do gate e os snapshots afetados.
- `docs/migracoes.md` — se a mudança de variável alcançar quem escreveu tema fora da lib.

## 3.2 Fora
- O **default `transparent`** de `sidebarActiveColor`/`topbarActiveColor` — é deliberado (§2.2); mexer nele
  é trocar o default para esconder uma opção quebrada, e isso não conserta a opção.
- A métrica tipográfica do item horizontal — é a plan-68.
- Os widgets do cromo — é a plan-67.
- `src/core/Design/presets/themes/**` — **não se conserta tema um a um.** Se um tema shippado ficar sem
  realce depois da correção, isso é achado a relatar, não arquivo a editar aqui.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.4 — o contrato dos tokens de cromo e o gate |
| Spec fixa | `specs/09-temas-e-presets.md` | §4.4.3 — token oferecido é contrato com o usuário final |
| Spec fixa | `specs/02-design-engine.md` | como um token vira variável CSS |
| Spec fixa | `specs/00-regras-e-invariantes.md` | R18 (limites do gate) · R35 (`className` do chamador vence) |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-arquitetura-design` | decisão de token visual |
| Código | `src/core/Design/presets/themes/color-engine.ts` | o comentário que explica o default `transparent` |
| Código | `src/components/atomic/Navigation/SarakMenuItem.tsx` | o átomo que desenha os DOIS cromos |
| Código | `gates/scripts/contrato/check-chrome-token-parity.mjs` | a lista e o bloco de limites |

# 5. Instruções de execução

1. Ler as referências da §4.
2. Reproduzir a medição da §2.1 antes de mexer em qualquer coisa: quantos temas shippados deixam o item
   ativo indistinguível hoje, nas duas orientações. **É o número que a §6 vai cobrar de volta.**
3. Fazer o realce consumir o token que **significa** o efeito: a cor de texto/ícone do item ativo vem do
   token de item ativo, o fundo do item ativo vem do token de fundo, o hover de cada orientação vem do
   token de hover daquela orientação. Nenhum ramo pode ficar lendo token de outro papel.
4. Resolver a colisão de `--theme-primary` (§2.3). **Ponto de decisão:** se a saída escolhida remover uma
   variável que um consumidor possa ter usado, isso é `major` e vai para `docs/migracoes.md`; se der para
   resolver sem remover superfície, prefira essa. Registrar no resumo qual foi e por quê.
5. Verificar que o realce ficou visível **em todo tema shippado**, nas duas orientações — teste que varre o
   catálogo, não amostra. Tema que continuar sem realce é **achado relatado**, não tema editado (§3.2).
6. Ampliar a lista do gate com os tokens que passaram a ter consumidor e **completar o bloco R18**: varrer
   `schema/navigation.ts` inteiro e nomear todo token de cromo sem consumidor, não só os já listados.
7. Rodar `npx vitest run`, `npm run chrome-token-parity:check`, `npm run cromo-css-real:check` e
   `npm run class-merge:check`.

# 6. Critérios de aceite

- [ ] A medição do passo 2 está no resumo, com o número de antes e o de depois.
- [ ] Em **todo** tema shippado, o item ativo se distingue do inativo nas duas orientações — provado por
      teste que varre o catálogo.
- [ ] O hover de cada orientação consome o token de hover daquela orientação.
- [ ] `--sarak-nav-active-color` tem consumidor, ou o token saiu do schema com nota de migração.
- [ ] `--theme-primary` tem **uma** origem declarada, e a escolha está justificada no resumo.
- [ ] Nenhum fallback de `var()` na navegação depende de a variável estar ausente quando o Design Engine
      sempre a declara — ou o fallback foi removido, ou está documentado por que ele é alcançável.
- [ ] O bloco R18 do gate nomeia **todos** os tokens de cromo órfãos de hoje.
- [ ] Nenhum arquivo de `presets/themes/` foi editado.
- [ ] `npx vitest run` verde; os três gates da §5 item 7 verdes.

# 7. Como verificar (uso do revisor)

**Gate:** `chrome-token-parity:check`, ampliado por esta plan.

- `git diff --stat` → só os arquivos de §3.1; **nenhum** `presets/themes/`.
- Leitura do diff do `SarakMenuItem` → cada ramo lê o token do seu próprio papel.
- `npm run chrome-token-parity:check` → verde, e o bloco R18 lido à mão contra `schema/navigation.ts`
  inteiro: todo órfão está nomeado.
- Rodar o teste de varredura do catálogo → verde, e conferir que ele varre, não amostra.
- `grep` por `--theme-primary` no schema → uma origem só.
- `npx vitest run` → verde.
- Leitura do resumo → os dois números da medição, e a justificativa da decisão do passo 4.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md`

Na §2.4, a tabela de tokens passa a dizer **qual token pinta o quê** no item de navegação — fundo, texto e
hover, por orientação —, e a §2.4.1 registra o escopo novo do gate.

**Nada sobre o defeito entra na spec fixa** ([[00-prompt-revisor]] §7.4 item 3): a spec descreve como o
sistema é, não o que estava errado.

Se o passo 4 remover superfície pública, o `major` vai para `docs/migracoes.md` — não para a spec.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
