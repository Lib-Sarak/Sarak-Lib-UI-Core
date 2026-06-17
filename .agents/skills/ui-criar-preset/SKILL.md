---
name: ui-criar-preset
description: Cria presets modulares parciais (cards, atmosphere, typography) no Design Engine da UI Core. Use ao adicionar variantes visuais para componentes específicos. NÃO acione proativamente.
---

# Skill: Criar Preset Modular

Cria e adiciona novos presets granulares para componentes no Sarak-Lib-UI-Core. Presets modulares não são Temas inteiros; eles alteram apenas variáveis específicas do componente (Partial Merge).

## Quando usar
- Quando o usuário pedir para criar ou modificar uma variante visual de um componente (ex: "Preset de card fosco").
- Use APENAS quando o usuário solicitar explicitamente. NÃO acione proativamente.

## Workflow

1. **Identificação do Pilar e Schema**
   - **Ação:** Identifique qual arquivo do pilar o preset afeta (`cards.ts`, `atmosphere.ts` ou `typography.ts` em `src/core/Design/presets/components/`).
   - **Gate Estrito:** Verifique se o nome do Preset que será criado existe no arquivo de Typescript (Schema) do componente. Se não existir, avise o usuário e exija a atualização do Schema primeiro. Nunca injete uma string de Preset que não esteja previamente tipada.
2. **Elaboração do Preset (HITL)**
   - **Ação:** Mostre ao usuário o objeto JSON/TypeScript preliminar da interface `ComponentPreset` preenchida com as escolhas solicitadas.
   - **Aguarde** confirmação.
3. **Injeção do Preset**
   - **Ferramenta:** Ferramentas de edição de código (`replace_file_content` ou `write_to_file`).
   - **Ação:** Adicione o novo objeto na constante array respectiva (`CARD_PRESETS`, `ATMOSPHERE_PRESETS`, `TYPOGRAPHY_PRESETS`).
4. **Homologação**
   - **Ação:** Informe o usuário que o preset foi cadastrado e o Catálogo já reflete as mudanças.

## Regras
- **MERGE PARCIAL:** O preset modular DEVE conter apenas as chaves (tokens) que pertencem ao seu escopo. 
- **NUNCA** inclua cores primárias (`colorPrimary`), modo light/dark, ou configurações globais dentro de um preset de componente (a menos que a chave seja do escopo daquele componente).
- O ID do preset DEVE possuir um prefixo do componente (ex: `card-`, `bg-`, `typo-`).

## Checklist
- [ ] O Schema Typescript foi validado e atualizado para suportar este Preset?
- [ ] O ID possui o prefixo correto?
- [ ] O objeto não vazou propriedades globais de tema (Merge Parcial respeitado)?
