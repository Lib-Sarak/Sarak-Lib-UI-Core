---
tipo: "arquitetura"
titulo: "Paridade de 5 Camadas e Folksonomia Dinâmica"
dominio: "Design Engine"
status: "🟢 Vigente"
tags: ["arquitetura", "paridade", "motor"]
relacionados: ["03-padrao-e-taxonomia-biblioteca-atomica"]
---

# 1. Propósito
A arquitetura do Design Engine baseia-se na regra rigorosa da "Paridade 1:1:1:1:1". Isso significa que qualquer propriedade visual (token) ou componente atômico do Sarak UI Core deve existir simultaneamente em 5 camadas arquiteturais. Este documento define o fluxo de vida do dado, desde a sua estruturação técnica (Schema) até sua exibição semântica categorizada na interface (Sidebar) através de um algoritmo de folksonomia.

# 2. A Camada Estrutural (Paridade 1:1:1:1:1:1)
O ecossistema impõe que nenhum componente exista isolado. Todo *token* de design trafega por:

1. **Schema (TypeScript Interface)**: A definição estrita do token (ex: `btnBorderRadius` dentro de `ButtonsSchema`). É o contrato técnico do componente.
2. **MasterMap**: O mapeamento central (`MASTER_DESIGN_MAP`). Ele acopla os schemas isolados ao motor global da aplicação.
3. **Banco de Dados**: A persistência. Como o token é salvo e lido no banco de dados (JSON estruturado no Theme).
4. **Gêmeo Digital (O Motor)**: O consumo real. O motor de temas que lê os dados globais e injeta variáveis CSS responsivas no DOM para o design ganhar vida.
5. **Catálogo JSON**: A base de dados estática (`TokenCatalog`). Nela, além das métricas (importância, tipo), injetamos a **Semântica** do token através de `tags/categorias` (ex: `categories: ['Botões e Interação']`).
6. **Camada de Consumo Controlado (React Hook)**: A conexão final onde as variáveis CSS geradas pela Camada 4 são aplicadas aos componentes atômicos. Ocorre de forma abstraída via um hook central (ex: `useAtomicStyles`), que atua como **Controlador Data-Binding** e impede que lógicas complexas poluam os componentes JSX base.

# 3. Folksonomia Dinâmica (A "Inteligência" da Interface)
O painel visual do Design Engine (Sidebar) **não possui categorias hardcoded** para a renderização dos componentes. A interface ganha vida e estrutura de forma 100% autônoma baseada no cruzamento de dados gerados pelas camadas de paridade.

1. **Os Pilares Base:** Lidos do arquivo `config/design-pillars.json` (Ex: "3. Superfícies e Profundidade").
2. **As Tags (Semântica):** Lidas do "Catálogo JSON" (Camada 5).
3. **O Motor de Cruzamento (`buildDynamicGroups`):** O algoritmo utilitário extrai as tags do catálogo, as higieniza, e cruza os dados técnicos do `MASTER_DESIGN_MAP` (Camada 2) com os `Pilares` lógicos. 

**A Ligação Final:** O "Gêmeo Digital" desenha dinamicamente as abas, categorias e inputs (`<TokenControl>`) sem que um programador precise montar formulários. A inteligência do módulo está no fato de que o Schema injeta o *Dado*, o Catálogo JSON injeta a *Semântica*, o Algoritmo cruza, e a UI apenas itera e *renderiza*.

# 4. A Regra de Composição Atômica (O Elo Final da Paridade)
Para que a Camada 4 (Gêmeo Digital / Variáveis CSS) seja efetiva, é **estritamente proibido** o uso de tags HTML cruas (`<button>`, `<input>`, `<select>`) com classes utilitárias rígidas dentro de componentes pré-montados ou templates de alto nível (ex: `SarakAuthScreen`).

A reatividade absoluta do Design Engine depende da **Composição Atômica Obrigatória**:
- Todo botão em um template deve obrigatoriamente consumir o componente base `<SarakButton />`.
- Todo input deve consumir `<SarakInput />`.

É responsabilidade exclusiva dos componentes base atômicos encapsular as classes reativas (ex: `.rounded-btn`, `.rounded-input`, `bg-[var(--sarak-btn-primary-bg)]`). O descumprimento desta regra gera **Vazamento de Especificidade**, onde os templates ficam engessados nas variáveis globais (ex: `.rounded-sarak`), ignorando a paridade atômica configurada nos schemas.

**Regra Estrita de Controle React:** Toda essa composição atômica, quando requer variantes visuais complexas (como calcular brilhos neon, renderizar modais glassmorphism, ou alternar opacidades estáticas), DEVE OBRIGATORIAMENTE ser roteada por um Hook central e injetada no componente. NUNCA polua o `<SarakButton>` ou o `<SarakInput>` com lógicas imensas ou tags `<style>` em tempo de execução. O Componente Atômico é um receptor passivo do Hook.
