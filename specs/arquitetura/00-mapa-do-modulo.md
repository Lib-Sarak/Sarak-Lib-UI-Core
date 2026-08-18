---
tipo: "arquitetura"
titulo: "Mapa do módulo — onde cada coisa mora e o que pode importar o quê"
dominio: "Arquitetura / Topografia / Convenções"
status: "🟢 Vigente"
tags: ["arquitetura", "mapa", "camadas", "convencoes", "hooks-controladores"]
relacionados: ["[[01-forma-do-produto-e-modos-de-consumo]]", "[[02-design-engine]]", "[[03-superficie-publica]]", "[[04-contrato-de-tokens-e-paridade]]"]
---

# 1. Propósito

O mapa topográfico do módulo: **onde cada coisa mora, como se chama, e o que pode importar o quê.**

Este documento descreve **estrutura**, não comportamento. Ele não diz o que cada componente faz — isso é o catálogo gerado ([[03-superficie-publica]] §5) — nem como o motor funciona ([[02-design-engine]]).

Leia depois de [[01-forma-do-produto-e-modos-de-consumo]]: aquele diz o que a lib é; este diz onde ela está.

# 2. A árvore real de `src/`

Contagens recursivas, medidas no filesystem:

```
src/
├── components/           302   a camada visual
│   ├── atomic/           264     14 categorias de componentes burros (§3)
│   ├── Layout/            14     o cromo e o layout de aplicação
│   └── engines/           24     wrappers sobre libs pesadas de terceiros
├── core/                 189   o cérebro, sem UI de produto
│   ├── Design/            86     o dicionário de tokens, o catálogo, os presets
│   ├── Provider/          54     o SarakUIProvider e seus gerenciadores
│   ├── Shell/             33     o host de módulos-plugin (SarakShell)
│   ├── Discovery/         14     o registro de módulos e componentes locais
│   └── Security/           2     sanitização de conteúdo rico
├── features/             163   a única feature: o painel do Design Engine
│   └── DesignEngine/     163
├── styles/                11   o CSS base e os parciais (fonte do Tailwind)
├── shared/                 5   utilitários transversais (hooks/services/types)
├── constants/              2
├── types/                  1
├── effects/                1
└── __tests__/              2
```

Duas observações que a árvore revela:

- **`src/features/` tem um único habitante.** Tudo em `features/` está sob `DesignEngine/`. A camada existe para uma feature só, e isso é coerente: ela é a única peça da lib com estado, orquestração e lógica própria.
- **Nenhuma pasta tem arquivo solto na raiz** de `components/` ou `core/` — tudo mora numa subpasta com dono.

# 3. As 14 categorias atômicas

Confirmadas varrendo `src/components/atomic/`. São **15 pastas**: 14 categorias mais `hooks/`, que é transversal e **não** é categoria.

| Categoria | Tem barril `index.ts`? | Tem `hooks/`? |
| --- | --- | --- |
| `Atoms` | ✅ | — |
| `Buttons` | ✅ | ✅ |
| `Cards` | ❌ | ✅ |
| `DataDisplay` | ✅ | — |
| `Feedback` | ✅ | — |
| `Icon` | ❌ | — |
| `Inputs` | ✅ | — |
| `Layouts` | ✅ | — |
| `Media` | ✅ | — |
| `Modals` | ✅ | ✅ |
| `Navigation` | ✅ | — |
| `Tables` | ❌ | ✅ |
| `Templates` | ✅ | ✅ |
| `UX` | ✅ | — |

> ⚠️ **A coluna do barril não é decorativa.** Categoria **sem** `index.ts` tem apenas os `.tsx` de **raiz** varridos pelo gerador da superfície pública — componente em subpasta escapa do gate e do catálogo ([[03-superficie-publica]] §3). `Cards`, `Icon` e `Tables` estão nessa condição.

# 4. As 3 camadas e a regra de dependência

A organização é hermética, e a direção das setas importa:

**`core/` — o cérebro.** O Provider, o Design Engine, o dicionário de tokens, o Shell, o Discovery. Nenhuma UI de produto vive aqui. Regra mestra: *a interface do payload dita a realidade* — se uma propriedade não existe no tipo TypeScript, ela não existe no sistema.

**`components/atomic/` — os músculos.** Blocos visuais **burros**: não buscam dados, não têm lógica de negócio, não sabem de onde os tokens vêm. Só renderizam o que recebem. Regra mestra: nada de valor hardcoded; tudo mapeia token com fallback.

**`features/` — a inteligência local.** Blocos com estado, orquestração e lógica própria. Hoje só o painel do Design Engine.

## 4.1 A regra, e o gate que a cobra

```
src/components/  ⊅  features/      (componente não importa feature)
src/core/        ⊅  features/      (inversão de dependência)
```

Cobrada por `gates/scripts/audit/auditor_arquitetura.mjs`, **por AST de verdade** (`ts.createSourceFile` + `ts.forEachChild`, `:21-56`), não por regex de arquivo. Ele varre **todo** `src/` (`.ts` e `.tsx`, sem excluir nem `__tests__`), inspeciona nós de `ImportDeclaration` e reporta o arquivo e a **linha exata** do import ofensor. Sai com código 1 se houver qualquer violação.

**Duas limitações honestas do auditor**, para ninguém confiar mais nele do que se deve:

1. Ele só olha `import ... from '...'`. **`require()` e `import()` dinâmico passam.**
2. A checagem é por **substring** do caminho, não por resolução de módulo. Funciona bem na prática, mas não é análise de grafo.

E há apenas **essas duas regras**. As demais pastas (`shared/`, `styles/`, `effects/`, `constants/`, `types/`) não são cobradas por nenhuma regra de dependência, e o auditor não valida o sentido inverso nem os imports entre `components/` e `core/`.

# 5. A convenção dos Hooks Controladores

Cada categoria que precisa rotear design tem sua pasta `hooks/`, onde vive o **Hook Controlador de estilo**:

| Hook | Recebe | Devolve |
| --- | --- | --- |
| `Buttons/hooks/useButtonLayoutStyles.ts:12` | `design` | `{ containerClass, iconOrderClass }` |
| `Cards/hooks/useCardLayoutStyles.ts:24` | `design` | `{ containerClass, contentClass, headerClass, footerClass, alignmentClass }` |
| `Modals/hooks/useModalLayoutStyles.ts:26` | `design` | `{ headerClass, footerClass, closeButtonClass }` |
| `Tables/hooks/useTableLayoutStyles.ts:24` | `design` | `{ tableWrapperClass, cellDensityClass, actionColumnAlignmentClass }` |

Mais os **transversais** em `src/components/atomic/hooks/`:

- **`useStructuralStyles.ts:17`** — lê `design` do contexto e devolve 10 métodos de geometria (`getGridStyles`, `getFlexStyles`, `getResponsiveStackStyles`, `getFormGroupStyles`, `getCardStyles`, `getContainerStyles`, `getHeaderStyles`, entre outros).
- **`useAtomicStyles.ts:9`** — devolve `getButtonStyles`/`getInputStyles`/`getSwitchStyles`, cada um recebendo `design` e devolvendo `React.CSSProperties`.

Existem também hooks de **comportamento** (não de estilo) nas mesmas pastas — `useModalBehavior`, `useFocusTrap`, `useExpandableCard` — e sete hooks de dados em `Templates/hooks/`. A distinção importa: hook de estilo lê token e devolve classe; hook de comportamento gerencia estado e foco.

## 5.1 Por que eles existem — a razão é o auditor

Esta é a parte que não é óbvia e que precisa ficar escrita.

**O Hook Controlador é o lugar onde o hardcode estrutural é LEGÍTIMO.** É proibido escrever `switch`/`case` de design ou `<style>` de roteamento dentro do JSX; a decisão "este token vale X, então a classe é Y" mora no hook. Isso deixa o `.tsx` declarativo e o hook testável.

E há um detalhe mecânico: **o auditor de hardcode só coleta `.tsx`.** Um arquivo `.ts` está fora da varredura. O companion `useStructuralStyles.presets.ts` documenta isso explicitamente no próprio cabeçalho, ao justificar por que as classes de container query com valor arbitrário vivem ali.

> **Isto é uma faca de dois lados, e deve ser lido como tal.** A fronteira `.tsx` × `.ts` é o que permite ao preset nomeado existir sem afrouxar o auditor. Mas ela também significa que **mover código para `.ts` esconde hardcode do gate**. Fazer isso para escapar do auditor é fraude, não arquitetura. O critério é o propósito: preset de layout nomeado e reutilizável, sim; valor solto fugindo da checagem, não.

## 5.2 A regra do arquivo companion

`useStructuralStyles.ts` tem **249 linhas** — uma abaixo do teto de 250 imposto pelo Clean Code. Não é coincidência: quando o hook cresce, a extração é obrigatória, e o padrão é um **companion** ao lado, com o mesmo nome-base e um sufixo de propósito:

- `useStructuralStyles.gap.ts` — isola `resolveGap`, a ponte entre a prop crua e o resolutor de token semântico.
- `useStructuralStyles.presets.ts` — os presets nomeados de grid e espaçamento responsivos.

Cada companion carrega, no cabeçalho, **por que foi extraído**. Extração sem justificativa escrita é só arquivo a mais.

# 6. Nomenclatura

| O quê | Convenção | Estado real |
| --- | --- | --- |
| Componente público | `PascalCase` com prefixo `Sarak` | Dominante (57 arquivos), com exceções sem prefixo: `SocialButton`, `ThemeToggle`, `ExpandableCard`, `Controls`, `ImageCard` |
| Hook | `camelCase` iniciando com `use` | Consistente. Dois sub-padrões: `use<Categoria>LayoutStyles` para estilo, nome livre para comportamento |
| Props de componente | `<Nome>Props`, exportado junto | Cobrado por `barrel:check` |
| Props estruturais | `camelCase` | — |
| Token de design em CSS | `--sarak-*` ou `--theme-*`, **sempre com fallback** | Ver §6.1 |
| Scripts em `scripts/` | — | ⚠️ **Três convenções coexistem** (§6.2) |

## 6.1 O namespace de CSS Variables

**`--sarak-*` e `--theme-*` são os únicos namespaces válidos, e todo consumo leva fallback.** O namespace **`--sx-*` é PROIBIDO** — ele nunca é emitido por nenhuma fonte da engine, então é variável-fantasma por definição: resolve para nada, em silêncio.

Toda variável consumida precisa de uma **fonte emissora real**. É o que `auditor_ghostvars.mjs` cobra ([[04-contrato-de-tokens-e-paridade]]).

> ⚠️ **Exceção real encontrada, e não é decorativa:** existem **2 usos vivos de `--sx-*`** no CSS, como fallback de segundo nível — `src/styles/_utilities.css:80` e `:89`, ambos na forma `var(--sarak-range-active-bg, var(--sx-color-primary-base))`. Como `--sx-color-primary-base` não é emitida por ninguém, esse fallback resolve para vazio: o efeito prático é que a declaração cai por terra se o token principal faltar. As outras 3 ocorrências de `--sx-` em `src/` são comentários que documentam a proibição. Registrado em DIVERGÊNCIAS — **não corrigido aqui**.

## 6.2 Os scripts não têm uma convenção só

Dos 13 arquivos que restaram em `scripts/`, três estilos coexistem:

- **kebab-case** — `build-scoped-css.mjs`, `generate-component-catalog.mjs`, `inject-css.mjs`, `copy-base-css.mjs`…
- **camelCase** — `catalogAst.mjs`, `componentCatalog.mjs`, `publicComponents.mjs`
- **snake_case** — `generate_themes.ts`

Não há gate cobrando isso, e o padrão observável é fraco: **kebab-case para script executável de pipeline, camelCase para módulo importado por outro script**. Documentado como **estado**, não como norma — normalizar é decisão em aberto.

> **O `snake_case` deixou de ser uma família em 2026-08-02** (`plan-14`). As outras três eram ferramentas pontuais das campanhas antigas — `fix_hardcoded.mjs`, `generate_orphan_tests.mjs` e `replace_ghosts.mjs` — e foram **removidas** junto com `find-def.mjs`, `find-usages.mjs`, `find-spacing.mjs` e `extract-spacing.mjs`: nenhuma era invocada por `package.json`, hook ou outro script, e o `grep` no repositório versionado não achou uso. Sobra **um** arquivo no estilo, e ele não é ferramenta pontual: `generate_themes.ts` é o gerador de temas que a [[09-temas-e-presets]] §6.3 documenta chamando `getScaffold()` em tempo de execução.

# 7. Onde alocar o quê

| Se a coisa… | Vai para |
| --- | --- |
| é visual e burra (não busca dado, não tem negócio) | `components/atomic/<Categoria>/` |
| roteia design a partir de token | o `hooks/` da própria categoria (§5) |
| tem estado, orquestração ou lógica própria | `features/` |
| é infraestrutura agnóstica de UI | `core/` |
| é casca de aplicação (cromo, página, ocultação responsiva) | `components/Layout/` |
| é wrapper sobre lib pesada de terceiro | `components/engines/` |

# 8. As pastas fora de `src/` que fazem parte do módulo

| Pasta | O que é |
| --- | --- |
| `gates/` | **O que reprova** — os auditores (a lista viva é o array de `gates/scripts/audit/run_audit.mjs`, que o `check-audit-baseline.mjs` lê em vez de copiar), os `verify_*.ts` que eles delegam, os `check-*` de contrato e de release, o gate de segredos, mais `baselines/` e `allowlists/`. Índice em `gates/README.md` |
| `scripts/` | **O que escreve** — os geradores (catálogo, kit do consumidor, kit do mantenedor, índice de plans, CSS escopado, build info, tipos de token) e a biblioteca compartilhada `catalogAst.mjs` + `publicComponents.mjs`, mais `consumer-kit/` e `dev-kit/` |
| `bin/` | O CLI do consumidor: `sarak-ui.mjs` + `scaffold/` (init, check, refresh) |
| `docs/` | O catálogo gerado (`component-catalog.{json,md}`) e os guias que viajam no pacote |
| `sarak-ui/` | O kit do consumidor, **gerado** — guia, skill, templates, catálogo, carimbo de versão |
| `.agents/skills/` | As skills do mantenedor (`ls -d .agents/skills/*/` conta) — **procedimento, não verificação**. Desde a `plan-14` não hospedam nenhum validador; o que sobra em `ui-criar-tema/scripts/` são **geradores/solucionadores** (`generate_theme_template.ts`, `solve_theme_contrast.ts`), invocados sob decisão humana, nunca por gate |
| `.githooks/` | Os dois **gatilhos** versionados (`pre-commit`, `pre-push`). Eles chamam `gates/scripts/…` — o gate não mora aqui |

O build e o contrato do pacote estão em [[05-build-e-distribuicao]].

# 9. Anomalia estrutural registrada

**`src/components/atomic/Tables/` é uma categoria sem componente.**

Ela contém **apenas** `hooks/useTableLayoutStyles.ts` (e o teste dele). Não tem barril, não tem nenhum `.tsx`, e `grep -rln "atomic/Tables" src` retorna **zero** — nenhum arquivo importa por esse caminho de categoria.

Os componentes que o hook governa — `SarakTable.tsx` e `SarakTableCards.tsx` — moram fisicamente em `Templates/`, e importam o hook **cruzando a fronteira de categoria**.

Isso não quebra nada hoje, e por isso **não foi tocado**. Mas é uma inconsistência real: uma das 14 categorias existe só como container de um hook de estilo cujo componente vive em outra. Registrado em DIVERGÊNCIAS para decisão — mover o componente para `Tables/`, mover o hook para `Templates/`, ou aceitar e documentar como exceção.

Nenhuma pasta vazia foi encontrada em `src/` (`find src -type d -empty` → nada).
