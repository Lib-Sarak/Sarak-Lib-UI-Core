---
tipo: "arquitetura"
titulo: "Motor de Tema Data-Driven"
dominio: "Core / Engine"
status: "🟢 Vigente"
tags: ["arquitetura", "core", "sdd", "theme-engine"]
relacionados: []
---

# 1. Propósito
O Motor de Tema Data-Driven do Sarak UI Core atua como a única fonte da verdade e de distribuição visual de propriedades CSS para toda a biblioteca atômica e aplicações clientes. Seu propósito é garantir 100% de dissociação entre lógica de estilos rígidos (hardcoded) e as propriedades reativas do design system, injetando variáveis puras de forma sistêmica na raiz do DOM.

# 2. Stack e Ferramentas
- React Context API (`SarakUIProvider`)
- Variáveis CSS nativas (Custom Properties `var(--sx-...)`)
- Design Tokens estruturados em Typescript (`MASTER_DESIGN_MAP`, `TokenCatalog`)

# 3. Diagramas / Estruturas
A arquitetura do motor é dividida em 3 camadas operacionais:

1. **A Base de Conhecimento (Catalog):**
   - Os tokens visuais são catalogados no `MASTER_DESIGN_MAP`. Nenhum componente atômico possui valores como `#FFFFFF` ou `16px`. Eles referenciam o dicionário (`--sx-color-primary-base`).
2. **A Máquina de Injeção (Provider):**
   - O `SarakUIProvider` intercepta o estado do design e itera sobre a base de conhecimento, convertendo JSON/Objetos TS em estilos embutidos no objeto `style` da raiz do HTML (ou da tag do provider).
3. **O Escopo de Sandboxing (DesignScope):**
   - Para simulações e engines dinâmicas (ex: Canvas de Preview), o componente `<DesignScope>` atua como um micro-provider, injetando as variáveis localmente para permitir que múltiplas interfaces ou "mocks" na mesma tela possuam temas completamente distintos sem sujar o tema principal da página.

## Fluxo de Estado 
A lógica e controle de mutação desses tokens para aplicações customizadoras é feita via `useThemeEngineState`, que consome os setters globais expostos pelo Provider, garantindo atualizações instantâneas de tema sem recarregar a página (Zero-Reload).
