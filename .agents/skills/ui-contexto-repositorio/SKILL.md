---
name: ui-contexto-repositorio
description: Orquestradora de onboarding e contexto. Use SEMPRE que iniciar uma nova conversa ou precisar se ambientar com as regras estruturais e limites da biblioteca Sarak-Lib-UI-Core.
---

# Skill: Entendimento de Contexto (Sarak-Lib-UI-Core)

> **Dependência:** Esta é a "Porta de Entrada" do repositório. Ela dita como você (agente) deve agir, pensar e respeitar a arquitetura do módulo antes de escrever código.

Esta skill deve ser usada sempre que você precisar entender o terreno ou logo no início de uma nova interação sobre arquitetura.

## As Bases e Regras Absolutas do Módulo

A **Sarak-Lib-UI-Core** não é um site; é um **Design System Vivo** guiado por dados exportáveis. Suas regras fundamentais são:

1. **Separação em 3 Camadas Estritas:**
   - `core/`: O cérebro (`SarakUIProvider`, `DesignEngine`, JSONs). Aqui mora a tipagem do Theme Payload. Nenhuma UI fica aqui.
   - `components/atomic/`: Os músculos e o esqueleto. Componentes visuais burros. Eles não buscam dados da internet e não têm lógica de negócio. Apenas renderizam o que recebem baseados nos tokens globais.
   - `features/`: A inteligência local (ex: o próprio Painel de Customização da Engine).
2. **Zero Hardcode (Resiliência):**
   - Os átomos e templates não podem ter estilos engessados como `bg-red-500` ou `w-10`. Tudo deve mapear variáveis do design system (ex: `bg-[var(--sx-color-base))]`).
3. **Tipagem Inquebrável (Zero Any):**
   - É proibido usar `any` ou mascarar tipos no Design Engine. A interface TypeScript do Theme Payload dita a realidade. Se a propriedade não existe lá, o sistema quebra.
4. **Paridade 1:1:1:1:1:**
   - Adicionar ou remover propriedades visuais (Tokens) exige sincronia perfeita entre 5 camadas: Schema TS, MasterMap TS, theme_table_mapping JSON, Lógicas da Engine e Partições JSON do Catálogo. Nunca crie chaves órfãs.

## Workflow de Ambientação (Leitura Obrigatória)

Ao iniciar uma nova interação ou ativar esta skill, sua **PRIMEIRA AÇÃO** deve ser usar a ferramenta `view_file` para ler integralmente as specs abaixo. Isso carregará a arquitetura para sua janela de contexto:

1. **Manifestos Arquiteturais (A Fundação):**
   - `specs/specs/00-manifesto-arquitetural-ui-core.md`: Visão geral do papel da biblioteca e suas camadas.
   - `specs/specs/03-padrao-e-taxonomia-biblioteca-atomica.md`: As regras de criação e o "Zero Hardcode" da camada atômica.
   - `specs/specs/08-consumo-externo-e-integracao.md`: Como a biblioteca deve ser exportada para os consumidores externos (`dist/`, `tsup`, Python).

2. **A Engine de Design (O Como):**
   - `specs/specs/06-presets-engine.md`: Como os esquemas de temas parciais e absolutos são formados.
   - `specs/specs/07-agente-llm-design-e-expansao-estrutural.md`: Regras para o agente que vai gerar designs no futuro.

3. **Garantia de Qualidade:**
   - `specs/specs/05-cobertura-de-testes.md`: Regras de testes Vitest isolados para esta biblioteca.

## Mapeamento de Skills Específicas
Você possui ferramentas rigorosas à disposição na pasta `.agents/skills/`. Use-as quando a tarefa exigir:
- **`ui-novo-componente`**: Use se precisar *adicionar* uma nova propriedade ou token ao DB/Catalog.
- **`ui-refatorar-componente`**: Use se precisar *deletar* ou alterar a assinatura de um token, mantendo a paridade inversa.
- **`ui-auditoria-modulo`**: Use para rodar o verificador estático geral (Cleancode, TS, Coverage, Paridade) após refatorações complexas.
- **`ui-criar-tema` / `ui-criar-preset`**: Use se o foco da conversa for estritamente manipular temas visuais e esquemas de cores globais.

Ao terminar de ler este documento e as specs relevantes, informe ao usuário que você está perfeitamente integrado às regras da Sarak UI Core e pronto para a tarefa!
