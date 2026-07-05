# Bússola Arquitetural do Módulo Sarak-Lib-UI-Core
**Versão:** 1.0 (Pós-Refatoração Massiva)

Este documento atua como o **Mapa Topográfico definitivo** da biblioteca de UI `Sarak-Lib-UI-Core`. Ele serve para guiar novos desenvolvedores (ou IAs de assistência) sobre onde alocar lógicas, onde encontrar arquivos e quais são os padrões de nomenclatura inquebráveis do módulo.

---

## 🗺️ 1. Taxonomia de Pastas (O Esqueleto)

Abaixo está o mapeamento efetivo e hierárquico do diretório central do módulo (`src/`). Este esqueleto demonstra exatamente como as 5 camadas da arquitetura estão fisicamente distribuídas.

```text
Sarak-Lib-UI-Core/
├── src/
│   ├── components/            # Camada de Interface Passiva
│   │   ├── atomic/            # Componentes visuais estritos (Dumb Components)
│   │   │   ├── Buttons/       # SarakButton, SarakIconButton, ThemeToggle...
│   │   │   ├── Cards/         # SarakActionCard, ExpandableCard, SarakTitleCard...
│   │   │   ├── Inputs/
│   │   │   ├── Layouts/
│   │   │   ├── Tables/
│   │   │   └── hooks/         # Hooks de estilo atômico (useCardLayoutStyles, etc)
│   │   └── core/              # Wrappers e providers atômicos locais
│   │
│   ├── core/                  # Camada Agnóstica e Data-Driven (O Coração)
│   │   ├── Design/
│   │   │   ├── catalog/       # Mapeamento do banco (theme_table_mapping.json)
│   │   │   ├── presets/       # Repositório de ThemePresets e componentes (Master Themes)
│   │   │   ├── runtime/       # Motor de extração e parsing em tempo real
│   │   │   └── schema/        # Os contratos TypeScript definitivos (Tipagem dos Tokens)
│   │   └── Provider/          # O SarakUIProvider (Motor injetor de CSS Variables)
│   │
│   ├── features/              # Camada de Inteligência e Negócios (Smart Components)
│   │   └── DesignEngine/      # Aplicação do Painel de Customização
│   │       ├── api/           # Integração com o Banco de Dados e Agent LLM
│   │       ├── components/    # Componentes com estado (Editor, CustomizationPanel)
│   │       ├── Main/          # Fluxos principais do MasterControlPanel
│   │       ├── Panels/        # Abas especializadas do motor de design
│   │       ├── config/        # Configurações do Engine (design-pillars.json)
│   │       └── hooks/         # Hooks com lógica pesada e estado (useThemeActions)
│   │
│   ├── shared/                # Serviços Genéricos (API, Hooks Utilitários, Tipos Globais)
│   └── styles/                # CSS Base e Variáveis Globais (sarak-base.css, _theme.css)
```

### `src/components/atomic/` (A Fronteira Visual)
A morada exclusiva das peças de Lego puramente visuais. Aqui vivem os componentes base (Botões, Inputs, Cards).
- **Regra de Ouro:** *Dumb Components*. Proibida injeção de lógica de negócio, chamadas HTTP ou `useEffect` complexo.
- **Estrutura Interna (Categorias):** 
  - `/Buttons`, `/Cards`, `/Inputs`, `/Layouts`, `/Tables`, `/UX`
- **Subpastas de Hooks (`/hooks`):** Cada categoria de átomo (ex: `Cards`) possui uma pasta `/hooks` onde vivem os controladores de estilo atômico (ex: `useCardLayoutStyles.ts`), garantindo a ausência de Tailwind estrutural (ex: `flex-col`) no JSX principal.

### `src/features/`
A morada da inteligência. Se algo possui estado complexo, lógica de roteamento, painéis de controle, requisições HTTP ou motor interno, ele deve morar aqui.
- **O Motor de Design (`src/features/DesignEngine`):** Contém todo o painel de customização (`ThemeEditor`, `MasterControlPanel`), a infraestrutura de comunicação em tempo real com o Agente LLM, e os scripts de parser de CSS Variables.

### `src/core/`
O coração agnóstico do módulo. Contém a infraestrutura que não depende de UI física para existir.
- **`/Design/presets`**: Os repositórios de Temas Master e presets parciais.
- **`/Design/schema`**: As interfaces TypeScript rigorosas que definem o Contrato Visual de todos os componentes. (Aqui nasce o token).
- **`/Design/catalog`**: Os mapeamentos de banco de dados (`theme_table_mapping.json`).
- **`/Provider/`**: O `SarakUIProvider` que envolve a aplicação cliente.

### `src/shared/` & `src/utils/`
Módulos universais de suporte. Funções puras, formatação, chamadas à API genéricas.

---

## 🏷️ 2. Padrões de Nomenclatura

A base de código utiliza um vocabulário padronizado para evitar ambiguidades:

| Tipo de Arquivo / Entidade | Padrão Adotado | Exemplo |
| :--- | :--- | :--- |
| **Componentes React** | `PascalCase` com prefixo `Sarak` opcional para peças core. | `SarakButton.tsx`, `ThemeEditor.tsx` |
| **Hooks React** | `camelCase` começando com `use`. | `useAtomicStyles.ts`, `useThemeActions.ts` |
| **Arquivos de Utils/Helpers** | `kebab-case`. | `dynamic-categories.ts`, `run_audit.mjs` |
| **Tokens de Design (CSS)** | Variáveis reais emitidas pela engine, sempre `--sarak-*` ou `--theme-*`, **sempre com fallback**. Namespace `--sx-*` é proibido (fantasma — não resolve em runtime; gate `auditor_ghostvars.mjs` = 0). | `--sarak-color-primary-base`, `--sarak-radius-md` |
| **Propriedades Estruturais (TS)** | `camelCase`. | `cardLayoutDirection`, `btnBorderRadius` |

---

## ⚙️ 3. O Paradigma "Data-Driven" (O Caminho do Token)

A engrenagem do módulo funciona num paradigma rígido apelidado de **Paridade 1:1:1:1:1** e **Data-Driven Styling**. Nenhuma cor ou margem é arbitrada aleatoriamente no código.

1. **A Semente (Schema):** Toda nova propriedade nasce primeiro tipada em `src/core/Design/schema/*.ts`.
2. **O Mapa (Catalog):** O token é então registrado em `theme_table_mapping.json` para ser lido pelo banco e pelo Agente LLM.
3. **O Motor (Provider):** O `ThemePayload` baixado é convertido em dezenas de `CSS Variables` (`--sarak-alguma-coisa` / `--theme-alguma-coisa`) pelo Provider Central.
4. **O Controlador (Hook):** O componente atômico possui um hook interno (`useComponentStyles`) que amarra o Tailwind a essas CSS Variables de maneira condicional.
5. **O Retrato (JSX):** O componente burro simplesmente renderiza `<div className={layout.containerClass}>`, abdicando do controle geométrico a favor do motor.

---

## 🛡️ 4. Regras Intocáveis (Manifesto de Código)
1. **Zero Tailwind Estrutural Hardcoded:** Classes como `w-full`, `gap-4`, `p-4`, ou `flex-col` **jamais** devem aparecer na raiz das Tags HTML de um átomo. Tudo é gerido pelos Hooks de Layout (`useStructuralStyles`).
2. **Tipagem Forte:** É **proibido** o uso de `any` (Regra sendo auditada fortemente).
3. **Isolamento CSS (Sandboxing):** Componentes renderizados dentro de editores (`ThemeEditor`) utilizam o `<DesignScope>` para não poluir o CSS global da aplicação hospedeira.
