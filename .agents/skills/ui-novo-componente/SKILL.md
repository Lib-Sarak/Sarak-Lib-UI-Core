---
name: ui-novo-componente
description: Orquestra a adição de novos componentes atômicos à UI Core garantindo a paridade 1:1:1:1:1. Use ao adicionar um token ou componente base ao sistema. NÃO acione proativamente.
---

# Skill: Adicionar Componente (Paridade)

> **Dependência:** Esta skill orquestra a paridade de design. Para a escrita dos testes unitários obrigatórios, consulte `test-unitario`.

Esta skill é acionada SEMPRE que houver a necessidade de criar ou alterar uma propriedade visual (token/componente) no Design System da Sarak UI, garantindo que não haja dessincronização entre as camadas.

## Quando usar
- Quando solicitado a adicionar um novo token, propriedade visual ou componente atômico ao repositório.
- Use APENAS quando o usuário solicitar explicitamente. NÃO acione proativamente.

## Workflow

1. **Verificação de Intenção e Schema**
   - **Ação:** Confirme com o usuário os detalhes da propriedade/componente a ser criado (nome, valores, pilares afetados).
   - **Gate Estrito:** Antes de injetar qualquer Preset ou Token no Catálogo/MasterMap, você **DEVE** validar e atualizar a Interface TypeScript associada (Schema). Se a variante (ex: `neon`) não estiver na interface, atualize-a primeiro para garantir Type-Safety.
2. **Injeção nas 5 Camadas (Paridade)**
   - **Ação:** Edite os arquivos necessários para garantir a existência do dado nestes locais exatos:
     1. **Schema:** A definição estrita (Typescript Interface).
     2. **MasterMap:** O mapeamento base de valores.
     3. **Banco de Dados:** Atualização dos esquemas de persistência (se houver reflexo).
     4. **Gêmeo Digital:** Reflexo no motor de temas.
     5. **Catálogo JSON:** A base de dados exportável.
3. **Verificação de Integridade (Script)**
   - **Ferramenta:** `run_command`
   - **Ação:** Execute o comando `npx tsx .agents/skills/ui-novo-componente/scripts/verify_parity.ts` na raiz do projeto.
   - **Critério:** O script deve retornar sucesso (exit 0).
4. **Finalização**
   - **Ação:** Informe ao usuário o resultado da injeção e se a paridade foi confirmada pelo script.

## Regras
- **NUNCA** crie um token em apenas uma ou duas camadas; a paridade é estritamente 1:1:1:1:1.
- **NÃO** finalize a tarefa sem rodar o script de verificação de paridade.

## Checklist
- [ ] O Type/Interface do Schema foi atualizado para suportar as chaves novas ANTES da injeção?
- [ ] O token foi refletido nas 5 camadas?
- [ ] O script de integridade passou sem erros?

## Referências (Camada 3)
- `.agents/skills/ui-novo-componente/scripts/verify_parity.ts` — Validador estático que afere se o token injetado possui reflexo nas 5 camadas obrigatórias do Design System. Execute via `npx tsx .agents/skills/ui-novo-componente/scripts/verify_parity.ts`.
