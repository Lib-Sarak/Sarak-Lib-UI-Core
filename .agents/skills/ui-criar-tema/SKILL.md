---
name: ui-criar-tema
description: Orquestra a geração autônoma e paramétrica de temas completos (ThemePresets) para a Sarak UI Core. Use ao configurar esquemas globais de cores e atmosferas. NÃO acione proativamente.
---

# Skill: Criar Tema Master

Orquestra a geração autônoma e orientada a dados de temas completos (`ThemePresets`) para o ecossistema Sarak UI.

## Quando usar
- Quando o usuário desejar criar um esquema de cores global (Light/Dark mode, Brand Colors, Global Presets).
- Use APENAS quando o usuário solicitar explicitamente. NÃO acione proativamente.

## Workflow

1. **Coleta de Parâmetros (HITL)**
   - **Ação:** Pergunte ao usuário as definições base do tema: Nome, paleta primária (Brand), preferência por Light/Dark mode.
2. **Geração do ThemePreset**
   - **Ação:** Estruture um objeto TypeScript completo mapeando os tokens exigidos por um Master Theme do repositório.
3. **Injeção do Código**
   - **Ferramenta:** Ferramentas de edição de código.
   - **Ação:** Exporte e registre o novo tema na central de temas globais do sistema (`src/core/Design/presets/themes/`).
4. **Confirmação**
   - **Ação:** Comunique que o Tema está registrado e pronto para consumo.

## Regras
- **NÃO** misture a lógica de Tema Master com as variáveis de Presets Parciais (os Temas servem de fundação).
- **SEMPRE** assegure que as chaves obrigatórias do contrato de `ThemePreset` estejam 100% preenchidas.

## Checklist
- [ ] As cores primárias e tokens globais estão preenchidos corretamente?
- [ ] O arquivo do tema foi indexado nos exports principais?

## Referências (Camada 3)
- `scripts/generate_theme_template.ts` — Script auxiliar para gerar um template de tema com os tokens pré-populados.
- `scripts/verify_theme_parity.ts` — Validador de conformidade do tema com a arquitetura base.
- `references/examples.md` — Exemplos da estrutura de um ThemePreset completo (Bom e Ruim).
