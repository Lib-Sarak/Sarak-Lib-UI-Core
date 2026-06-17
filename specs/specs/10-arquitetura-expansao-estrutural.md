---
tipo: "spec"
titulo: "Expansão Estrutural (Alavanca 2): Data-Driven Layout vs Headless Composition"
dominio: "Design Engine (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Média"
tags: ["spec", "architecture", "layout-engine", "ai-agent"]
relacionados: ["03-padrao-biblioteca-atomica", "09-agente-llm-temas"]
---

# 1. Visão Geral
Com a maturidade da arquitetura de tokens visuais (Alavanca 1 - Cores, Sombras, Geometria), o Agente LLM possui controle absoluto sobre a "Pele" da aplicação. No entanto, para que o Agente consiga desenhar e recriar sites inteiros estruturalmente diferentes, é necessária a **Alavanca 2 (Expansão Estrutural)**.
Este documento delineia os dois caminhos técnicos possíveis para conceder essa inteligência de Layout (DOM) ao Agente de IA. Uma destas rotas deverá ser escolhida e implementada na biblioteca base.

---

# 2. As Duas Rotas Arquiteturais

## Opção A: Expansão via Tokens Estruturais (Structural Props)
Nesta abordagem, a UI Library continua operando com componentes encapsulados (ex: `SarakActionCard`), mas o Catálogo é expandido com chaves estritas que ditam opções de arranjo predefinidas.

### Como funciona:
O Agente envia em seu Payload JSON tokens como:
- `cardLayoutDirection: "row" | "column"`
- `imagePosition: "top" | "left" | "right" | "background"`
- `actionsAlignment: "flex-start" | "space-between"`

O componente base no React faz a leitura desses tokens e altera suas classes condicionalmente (ex: `flex-col` vira `flex-row`).

### Vantagens (Prós)
- **Implementação Rápida:** Basta adicionar as chaves no banco de dados, no esquema TypeScript, e adicionar `if/else` e classes dinâmicas no JSX dos componentes já existentes.
- **Menor Curva de Aprendizado:** Desenvolvedores continuam chamando `<SarakActionCard />` de forma simples.

### Desvantagens (Contras)
- **Falsa Liberdade para a IA:** O Agente LLM só pode escolher layouts que o Engenheiro Humano previu. Se o agente quiser a imagem embaixo do texto e não programamos um `if` para isso, o resultado falha. Limita a capacidade generativa real.

---

## Opção B: Expansão via Composição Headless (Dynamic React Renderer)
Nesta abordagem, a UI Library abandona a exportação de cards rígidos e passa a entregar sub-blocos "burros" e atômicos (Padrão Compound Components). O layout é montado ativamente no momento da leitura do JSON.

### Como funciona:
O Agente LLM não envia apenas cores, ele envia a **Árvore do DOM** no Payload. O Frontend recebe um JSON estrutural:
```json
{
  "component": "Card.Container",
  "children": [
    { "component": "Card.Image", "props": {"src": "..."} },
    { "component": "Card.Title", "props": {"text": "..."} },
    { "component": "Card.Action", "props": {"align": "center"} }
  ]
}
```
Um **Motor Genérico de Renderização (Dynamic Renderer)** lê esse JSON e monta dinamicamente o JSX na tela na ordem exata definida pela IA.

### Vantagens (Prós)
- **Flexibilidade Gerativa Infinita:** O Agente de IA é literalmente capaz de desenhar sites inéditos que os humanos nunca pensaram, conectando os blocos de Lego livremente. Permite clonar a estrutura de qualquer interface do planeta.
- **Preparado para o Futuro:** Transforma a biblioteca em um *Site Builder* Data-Driven de verdade (similar a arquitetura do Webflow ou Framer).

### Desvantagens (Contras)
- **Complexidade de Engenharia Elevada:** Exige a criação de um "Intérprete React" nativo que sabe ler loops JSON e montar componentes dinamicamente na tela com segurança.
- **Mudança de Paradigma:** Todos os arquivos da pasta `src/components/atomic/` precisariam ser reconstruídos e divididos em micro-peças (`CardRoot.tsx`, `CardImage.tsx`, etc).

---

# 3. Decisão (Aprovada)
**Escolha A: Tokens Estruturais (Structural Props)** foi a rota arquitetural selecionada.

**Nota Técnica de Execução (Regra de Paridade):** Para respeitar a Spec 05, é estritamente proibido incluir a lógica condicional de classes (ex: `if (layout === 'row')`) diretamente no JSX do componente atômico. A transformação dos tokens estruturais em classes utilitárias deve obrigatoriamente ocorrer de forma isolada na **Camada 6 (Hook Controlador)**. O componente atômico permanece como um receptor passivo (dumb component).
