---
tipo: "plan"
titulo: "Fazer o cromo do modo ui-kit consumir os tokens de cromo que o painel já oferece"
objetivo: "Os tokens de cromo clicáveis no painel passam a produzir efeito também no SarakAppChrome, e um gate impede que a lacuna volte"
dominio: "Sarak-Lib-UI-Core / Layout / Cromo"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "cromo", "tokens", "gate", "modo-ui-kit"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/09-temas-e-presets]]", "[[specs/07-responsividade-e-multidispositivo]]", "[[specs/01-gates-e-baseline]]"]
depende_de: "plan-65-publicar-os-widgets-do-cromo"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md"
---

# 1. Objetivo

Os tokens de cromo que hoje só o `SarakShell` lê passam a ter efeito no `SarakAppChrome`, e um gate passa a
cobrar que todo token de cromo oferecido no painel tenha consumidor nos **dois** modos de consumo.

# 2. Contexto

O `SarakAppChrome` lê **um** campo de `design`: `navigationStyle` (`SarakAppChrome.tsx:130`). O
`SidebarNav` do Shell desestrutura **dezesseis** (`SidebarNav.tsx:35-46`), mais `searchPositionSidebar`.

Doze tokens estão no schema **e** no catálogo — portanto o usuário final os vê no painel, clica, e o painel
confirma a mudança — e não têm nenhum consumidor no cromo do modo ui-kit:

`sidebarPosition` · `navbarLayout` · `contentAlignment` · `isNavHidden` · `isAutoHideEnabled` ·
`searchPositionSidebar` · `searchPositionTopbar` · `tabGap` · `tabSectionMargin` · `sidebarActiveColor` ·
`sidebarHoverColor` · `topbarActiveColor`

Isso viola diretamente a regra que a própria base escreveu, em [[09-temas-e-presets]] §4.4.3 e
[[07-responsividade-e-multidispositivo]] §6.1 regra 4:

> *"Valor oferecido no schema é contrato com o usuário final: ou ele funciona, ou sai do schema."*

A regra é cobrada **por token**. Nenhum gate a cobra **por modo de consumo** — e é exatamente na fronteira
entre os dois modos que ela quebra.

Há um agravante de percepção, e ele é a razão de esta plan vir antes da 67. O preview do painel
(`PreviewSystemRenderer.tsx:4-6`) importa `SidebarNav`, `TopbarNav` e `DockNav` — o cromo do **Shell**.
No ERP, o Gêmeo Digital mostra uma sidebar com busca, usuário e alça de arraste; a tela real tem uma lista.
O painel não previsualiza o produto do consumidor. Quando os dois cromos passarem a exibir o mesmo
conjunto, essa divergência deixa de existir na prática — e é isso que a plan 67 verifica ao fechar.

Duas notas de terreno:

- **Quatro dos doze já têm variável CSS emitida** (`sidebarWidth`, `topbarHeight`, `tabGap`,
  `tabSectionMargin`); os outros são **comportamento em JS**, sem `cssVars`. Os dois grupos exigem
  tratamento diferente: o primeiro é consumir a variável certa, o segundo é implementar o comportamento.
- **O `SarakShellNav` usa `--sarak-layout-gap-sm/md` para o espaçamento**, não `--sarak-tab-gap`, então o
  token de gap do painel não alcança nem por CSS.

Achado adjacente que cabe aqui: `SarakNavItem` (`src/components/Layout/chrome/navItem.ts:17-29`) não tem
`category`, e `SarakAppChrome.tsx:147-149` descarta o campo ao mapear para `ShellNavItem` — embora o
`SarakShellNav` saiba agrupar (`SarakShellNav.tsx:47-59`). O modo ui-kit não consegue pedir um agrupamento
que o renderizador já implementa.

# 3. Escopo

## 3.1 Dentro
- `src/components/Layout/SarakAppChrome.tsx` e `src/components/Layout/chrome/` — consumo dos tokens de
  cromo: posição da sidebar, layout da navbar, alinhamento do conteúdo, colapso, auto-hide, posição da
  busca, gaps e as cores de item ativo/hover.
- `src/components/Layout/SarakAppChromeMobile.tsx` — o que dos doze faz sentido no drawer.
- `src/components/Layout/chrome/navItem.ts` — `category?` no `SarakNavItem`, preservado no mapeamento.
- `src/components/atomic/Navigation/SarakShellNav.tsx` · `SarakMenuItem.tsx` — consumo das cores de item
  ativo/hover do cromo e do token de gap correto.
- Gate novo, em `gates/scripts/contrato/` — paridade token de cromo ↔ consumidor, **por modo de consumo**.
- `package.json` — o script do gate; e a inclusão dele onde os demais `*:check` rodam.
- `gates/baselines/audit-baseline.json` — se o gate novo alterar contagem auditada.
- Testes dos componentes tocados e do gate.

## 3.2 Fora
- `src/core/Shell/` — o Shell já consome os tokens; não se toca.
- O schema (`src/core/Design/schema/`) — nenhum token é criado, removido ou tem assinatura alterada. Se
  algum dos doze se revelar impossível de honrar no modo ui-kit, **pare e relate** — a alternativa é
  removê-lo do schema, e isso é decisão do dono, não desta plan.
- Montar widgets por padrão — é a plan 67.
- `PreviewSystemRenderer` — a divergência do preview é verificada ao fim da plan 67, não corrigida aqui.
- A métrica tipográfica do item de navegação — é a plan 68.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.1, §2.3 e §6 — o contrato do cromo, a regra de degradação e o zero hardcode |
| Spec fixa | `specs/09-temas-e-presets.md` | §4.4.3 — a regra que esta plan faz valer |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | §5 (a tabela do contrato), §6 (as três camadas) e §6.1 (as quatro regras da camada 3) |
| Spec fixa | `specs/01-gates-e-baseline.md` | §2 e a matriz de cobertura — como um gate se declara e o que ele tem de dizer que não vê |
| Spec fixa | `specs/04-shell-e-discovery.md` | §6 — como o Shell traduz tokens estruturais em classes, via hook controlador |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-arquitetura-design` | consumo de token em componente |
| Skill | `ui-auditoria-modulo` | o gate novo entra no aparato desta skill |
| Código | `src/core/Shell/hooks/useShellLayoutStyles.ts` | como o Shell traduz `sidebarPosition`, `navbarLayout` e `contentAlignment` — o comportamento de referência |
| Código | `src/core/Shell/Components/SidebarNav.tsx:35-55,131-200` | colapso, hover-expand, posição da busca e cores de ativo |
| Código | `src/core/Design/schema/navigation.ts` · `system.ts` | os tokens, com `cssVars` quando existem |
| Código | `src/components/Layout/SarakAppChrome.tsx` · `chrome/` | o cromo a estender |

# 5. Instruções de execução

1. Ler as referências da §4 e levantar, para cada um dos doze tokens, se ele chega por variável CSS ou por
   comportamento em JS, e qual é o comportamento de referência no Shell.
2. Implementar o consumo no cromo do modo ui-kit, um token por vez, preservando o default atual quando o
   token não está definido. **Pronto quando** mudar o token no painel muda a tela, e não mudá-lo mantém o
   comportamento de hoje.
3. Tratar a degradação por dispositivo como a §2.3 de [[05-cromo-e-slots]] já exige: nenhum token pode
   fazer região sumir no celular.
4. Acrescentar `category?` ao `SarakNavItem` e preservá-lo no mapeamento para o `SarakShellNav`.
5. Escrever o gate: para cada token de cromo do schema, verificar que existe consumidor no `SarakShell`
   **e** no `SarakAppChrome`. O gate **declara no próprio código o que não enxerga** (R18) — em especial,
   que ele prova a existência do consumo, não o efeito visual dele.
6. Rodar o gate contra o estado anterior à correção e **confirmar que ele reprova**. Regra sem caso que
   falha não é regra.
7. Registrar o script em `package.json` e no conjunto que roda junto dos demais `*:check`.
8. Testes: um por token consumido, no componente. Onde o efeito for CSS renderizado, estender
   `browser-tests/` em vez de afirmar por leitura de classe.
9. Rodar `npx vitest run`, o gate novo, `npm run audit` e `npm run cromo-css-real:check`.

# 6. Critérios de aceite

- [ ] Cada um dos doze tokens tem efeito observável no `SarakAppChrome`, ou está relatado como impossível
      com a razão — nunca silenciosamente pulado.
- [ ] Sem token definido, o cromo se comporta exatamente como antes desta plan.
- [ ] Nenhuma região do cromo desaparece em nenhum dos três modos de geometria.
- [ ] `SarakNavItem` aceita `category` e o agrupamento chega ao `SarakShellNav`.
- [ ] O gate novo existe, reprova o estado anterior e passa no estado corrigido.
- [ ] O gate declara, no próprio código, o que não enxerga.
- [ ] O gate está registrado em `package.json` e roda junto dos demais.
- [ ] `npx vitest run` verde; `npm run audit` comparado ao baseline, com o baseline regravado se a contagem
      mudou; `cromo-css-real:check` verde.
- [ ] Zero hardcode novo: todo valor visual é token com fallback.

# 7. Como verificar (uso do revisor)

**Gate:** `todo token de cromo oferecido no schema tem consumidor no SarakShell e no SarakAppChrome` — é a
**única** regra de gate desta plan. Ela vale para a **relação** entre dois módulos (schema × cada cromo), e
nenhum teste de componente enxerga o vizinho: é a forma certa pela [[00-prompt-revisor]] §5.4.

- `git diff --stat` → só os arquivos de §3.1.
- Rodar o gate no `HEAD` anterior à correção → **reprova**, nomeando os tokens.
- Rodar o gate no estado entregue → passa.
- Leitura do código do gate → o bloco de limites declara o que ele não vê.
- `npx vitest run src/components/Layout src/components/atomic/Navigation` → verde.
- `npm run cromo-css-real:check` → verde.
- `npm run audit` → comparado ao baseline; se a contagem mudou, o baseline foi regravado no mesmo diff.
- `npx vitest run` → verde.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md` · `specs/01-gates-e-baseline.md`

Em `specs/05`, texto pronto para transporte, para a §2.1:

> O cromo do modo ui-kit consome os mesmos tokens de cromo que o Shell — posição da sidebar, layout da
> navbar, alinhamento do conteúdo, colapso, auto-hide, posição da busca, espaçamento de itens e as cores de
> item ativo e hover. Um token de cromo oferecido no painel produz efeito nos **dois** modos de consumo; é
> o que impede que a regra *"ou funciona, ou sai do schema"* valha só de um lado da fronteira.

Em `specs/01`, registrar o gate novo na tabela de gates e a linha correspondente na matriz de cobertura,
com o que ele declara não ver.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
