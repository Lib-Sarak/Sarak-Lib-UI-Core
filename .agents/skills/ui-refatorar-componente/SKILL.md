---
name: ui-refatorar-componente
description: Orquestra a refatoração, deleção ou modificação de tipagem de propriedades e tokens no Sarak-Lib-UI-Core. Use APENAS quando precisar deletar um token existente ou alterar sua assinatura sem quebrar a paridade 1:1:1:1:1. NÃO acione proativamente.
---

# Skill: Refatorar/Deletar Componente ou Token (Paridade Inversa)

> **Dependência:** Esta skill é a irmã gêmea de `ui-novo-componente`. Enquanto aquela cria as propriedades nas 5 camadas, esta orquestra a remoção ou modificação de propriedades já existentes, blindando o repositório contra chaves órfãs no banco de dados e no catálogo JSON.

Esta skill deve ser acionada SEMPRE que o usuário solicitar a alteração da tipagem de uma propriedade no MasterMap ou a exclusão total de um token/componente.

## Quando usar
- Quando for solicitado remover um token do sistema de design.
- Quando for solicitado mudar o nome de um token (ex: de `oldColor` para `newColor`).
- Quando for solicitado alterar os tipos permitidos de um token, exigindo reflexo nas interfaces.
- Use APENAS quando o usuário solicitar a alteração diretamente. NÃO acione proativamente.

## Workflow

1. **Validação de Impacto**
   - Antes de remover qualquer propriedade do Schema, mapeie via `grep_search` se algum componente em `src/components/atomic/` ou `src/features/` ainda consome este token.
   - Caso encontre, exija que o usuário autorize a remoção ou refatoração do código consumidor antes de prosseguir.

2. **Refatoração nas 6 Camadas (A Purga)**
   - **Ação:** O agente deve remover ou atualizar a chave simultaneamente em:
     1. **Schema:** A interface TypeScript (`types.ts` ou MasterMap schemas).
     2. **MasterMap:** A definição estrita do dicionário.
     3. **Banco de Dados:** O arquivo de migração/espelho `theme_table_mapping.json`.
     4. **Gêmeo Digital:** As lógicas do motor `DesignEngine` se houver reflexos estritos.
     5. **Catálogo JSON:** As partições JSON (`partitions/`) base do catálogo.
     6. **Registry do Manifesto:** ao deletar/renomear um COMPONENTE, remova/renomeie a entrada no `NATIVE_COMPONENTS` (`src/core/Manifest/Registry/nativeComponents.ts`) ou em `manifestExclusions.ts` — renomear sem migrar o `type` quebra silenciosamente todos os manifestos dos consumidores; trate rename de `type` como BREAKING CHANGE documentado.

3. **Validação de Integridade (Paridade)**
   - **Ação:** Assim como na criação, a refatoração exige auditoria. Rode a verificação de paridade para garantir que o token removido não ficou para trás em algum dos dicionários do banco de dados (gerando dados órfãos).
   - Execute o script via CLI: `node .agents/skills/ui-auditoria-modulo/scripts/auditor_paridade.mjs`.
   - Execute o gate do Registry: `npx vitest run src/core/Manifest/__tests__/RegistryParity.test.tsx`.
   - Regenere o catálogo dinâmico: `npm run catalog` (o build falha via `catalog:check` se defasado) e commite.

4. **Finalização**
   - Informe o usuário sobre os arquivos alterados e entregue o laudo do `auditor_paridade` aprovando a mudança.

## Regras Críticas
- **NUNCA** apenas apague a propriedade da interface TypeScript (`Schema`). Apagar do TS sem apagar do DB Mapping e do Catálogo causará uma falha iminente de paridade e lixo no banco de dados.
- Modificações de nomes (Rename) equivalem a uma exclusão do velho e injeção do novo. A paridade 1:1:1:1:1 deve ser mantida.

## Checklist
- [ ] Mapeou os consumidores do token no código atual?
- [ ] Aplicou a alteração nas 6 camadas de dados e schemas (incluindo Registry/exclusões)?
- [ ] Executou o `auditor_paridade.mjs` com zero falhas?
- [ ] Gate `RegistryParity.test.tsx` verde e catálogo regenerado (`npm run catalog`)?
