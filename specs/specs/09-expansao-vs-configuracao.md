---
tipo: "arquitetura"
titulo: "Expansão vs Configuração"
dominio: "Design Engine"
status: "🟢 Vigente"
tags: ["arquitetura", "diretrizes"]
relacionados: ["00-manifesto-arquitetural-ui-core.md", "03-padrao-e-taxonomia-biblioteca-atomica.md"]
---

# 1. Propósito
Este documento delimita a fronteira estrita entre **Configurar o Sistema** (utilizar o motor de dados para aplicar temas e layouts) e **Expandir o Sistema** (criar novas fundações, propriedades ou componentes estruturais). Ele instrui desenvolvedores e agentes de IA sobre qual mindset e ferramenta utilizar em cada cenário.

# 2. As Duas Frentes de Atuação

A Sarak UI Core funciona em dois "modos" distintos. Misturá-los quebra a integridade da biblioteca.

## A. Configuração (Design as Data)
A Configuração ocorre quando o objetivo é mudar a aparência de algo que já possui suporte no sistema.

- **O que é:** Preenchimento de dados. Alterar cores, espaçamentos, raios de borda, ou criar Presets e Temas inteiros preenchendo as chaves do catálogo (`theme_table_mapping.json`).
- **O que NÃO é:** Escrever código React. Criar arquivos `.tsx`. Adicionar CSS solto ou classes Tailwind num arquivo.
- **Ferramentas/Skills a utilizar:** `ui-criar-tema`, `ui-criar-preset`.
- **Regra de Ouro:** Se a chave (ex: `cardRadius`) já existe no catálogo, você está apenas Configurando. Forneça o novo valor em um arquivo JSON/Payload. Nenhuma lógica do motor (`src/`) precisa ser tocada.

## B. Expansão (A Paridade 1:1:1:1:1)
A Expansão ocorre quando o design exige uma propriedade, um modificador ou um componente visual que *ainda não existe* no dicionário do sistema.

- **O que é:** Engenharia de base. Significa adicionar uma nova "engrenagem" à biblioteca.
- **O que NÃO é:** Apenas um ajuste visual rápido. Exige rigorosa manutenção de paridade.
- **Ferramentas/Skills a utilizar:** `ui-novo-componente`, `ui-refatorar-componente`, `ui-auditoria-modulo`.
- **Regra de Ouro:** A expansão exige tocar o código-fonte nas **5 camadas estritas**:
  1. **Schema TS:** Definir a tipagem em TypeScript.
  2. **MasterMap:** Mapear a propriedade no dicionário da Engine.
  3. **Catálogo JSON:** Inserir a nova chave na partição JSON correta e no `theme_table_mapping.json`.
  4. **Componente Atômico:** Atualizar o arquivo `.tsx` (ex: `Button.tsx`) para consumir a nova variável (ex: `bg-[var(--sx-new-property))]`).
  5. **Lógica Interna:** Se aplicável, atualizar o construtor dinâmico no `DesignEngine`.

# 3. Árvore de Decisão Rápida

Quando um requisito chegar, aplique o seguinte fluxo de decisão:

1. A mudança visual solicitada pode ser resolvida atribuindo um novo valor a uma variável/propriedade que já existe no `theme_table_mapping.json`?
   - **SIM:** É uma **Configuração**. Alimente o Payload com os novos dados. Fim.
   - **NÃO:** A variável ou a camada estrutural não existe. Vá para o passo 2.

2. Precisamos criar o suporte estrutural.
   - Acione a skill de **Expansão** (`ui-novo-componente`).
   - Siga a Paridade 1:1:1:1:1 para plugar a nova propriedade no sistema.
   - Só depois aplique os valores através da Configuração.

# 4. Diagrama Lógico de Ação

| Cenário | Tipo de Ação | Arquivos Tocados | Abordagem |
|---|---|---|---|
| Mudar botão de azul para vermelho | **Configuração** | Apenas payloads JSON/Temas externos | Data-entry |
| Criar um estilo "Tema Escuro" | **Configuração** | Apenas payloads JSON/Temas externos | Data-entry |
| Adicionar suporte a "Sombra Texturizada" que não existia | **Expansão** | `types.ts`, `theme_table_mapping.json`, `.tsx` | Engenharia / Paridade |
| Criar um novo átomo "SarakSlider" | **Expansão** | Todo o pipeline de 5 camadas | Engenharia / Paridade |
