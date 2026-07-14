---
name: ui-novo-componente
description: Orquestra a adição de novos componentes atômicos à UI Core garantindo a paridade 1:1:1:1:1. Use ao adicionar um token ou componente base ao sistema. NÃO acione proativamente.
---

# Skill: Adicionar Componente (Paridade)

> **Dependência:** Esta skill orquestra a paridade de design. Para a escrita dos testes unitários obrigatórios, consulte `test-unitario`.

Esta skill é acionada SEMPRE que houver a necessidade de criar ou alterar uma propriedade visual (token/componente) no Design System da Sarak UI, garantindo que não haja dessincronização entre as camadas.

## Quando usar
- Quando solicitado a adicionar um novo token, propriedade visual ou componente atômico ao repositório.
- **Validação de Fronteira:** Antes de aceitar a tarefa, identifique se o componente possui estado/negócio (deve ir para `src/features/`) ou se é puramente visual (deve ir para `src/components/atomic/`). Se for para features, rejeite usar esta skill e siga arquitetura padrão.
- Use APENAS quando o usuário solicitar explicitamente. NÃO acione proativamente.

## Workflow

1. **Verificação de Intenção e Schema**
   - **Ação:** Confirme com o usuário os detalhes da propriedade/componente a ser criado (nome, valores, pilares afetados).
   - **Gate Estrito:** Antes de injetar qualquer Preset ou Token no Catálogo/MasterMap, você **DEVE** validar e atualizar a Interface TypeScript associada (Schema). Se a variante (ex: `neon`) não estiver na interface, atualize-a primeiro para garantir Type-Safety.
2. **Injeção nas 6 Camadas (Paridade)**
   - **Ação:** Edite os arquivos necessários para garantir a existência do dado nestes locais exatos:
     1. **Schema:** A definição estrita (Typescript Interface).
     2. **MasterMap:** O mapeamento base de valores.
     3. **Banco de Dados:** Atualização dos esquemas de persistência (se houver reflexo).
     4. **Gêmeo Digital:** Reflexo no motor de temas.
     5. **Catálogo JSON:** A base de dados exportável.
     6. **Registry do Manifesto (OBRIGATÓRIA para componente novo):** registre o componente no `NATIVE_COMPONENTS` (`src/core/Manifest/Registry/nativeComponents.ts`) para que ele seja alcançável via `"type"` no JSON — OU, se ele deliberadamente NÃO deve ser manifestável (infra, legado), declare-o com motivo em `src/core/Manifest/Registry/manifestExclusions.ts`. Silêncio não é opção: o gate `RegistryParity.test.tsx` derruba o build. Foi a ausência desta camada que deixou SarakButton/SarakTypography/Cards/CustomizationPanel inalcançáveis no passado.
   - **Interface de Props nomeada:** exporte sempre `interface <Nome>Props` — é dela que o catálogo dinâmico extrai a documentação de props para os consumidores.
3. **Verificação de Integridade (Scripts)**
   - **Ferramenta:** `run_command`
   - **Ação (tokens):** `npx tsx .agents/skills/ui-novo-componente/scripts/verify_parity.ts` — paridade das 5 camadas de token.
   - **Ação (Registry):** `npx vitest run src/core/Manifest/__tests__/RegistryParity.test.tsx` — gate exaustivo de alcançabilidade.
   - **Ação (Catálogo):** `npm run catalog` — regenera `docs/manifest-catalog.{json,md}` (o build falha via `catalog:check` se estiver defasado). Commite o resultado.
   - **Critério:** os três comandos devem retornar sucesso (exit 0).
4. **Finalização**
   - **Ação:** Informe ao usuário o resultado da injeção e se a paridade foi confirmada pelos scripts.

## Regras
- **NUNCA** crie um token em apenas uma ou duas camadas; a paridade é estritamente 1:1:1:1:1:1 (a 6ª camada é o Registry do Manifesto).
- **ALOCAÇÃO CORRETA:** Todo componente atômico novo DEVE ser criado dentro de `src/components/atomic/`. Se a demanda envolver lógica de negócio, redirecione-a para `src/features/` fora desta skill (e lembre: feature manifestável entra no Registry SÓ via `React.lazy`, como o `CustomizationPanel`).
- **NÃO** finalize a tarefa sem rodar os scripts de verificação (paridade de token + gate do Registry + catálogo).

## Checklist
- [ ] O Type/Interface do Schema foi atualizado para suportar as chaves novas ANTES da injeção?
- [ ] O token foi refletido nas 6 camadas (incluindo Registry OU exclusão com motivo)?
- [ ] `RegistryParity.test.tsx` verde e `npm run catalog` regenerado/commitado?
- [ ] O script de integridade de tokens passou sem erros?

## Referências (Camada 3)
- `.agents/skills/ui-novo-componente/scripts/verify_parity.ts` — Validador estático que afere se o token injetado possui reflexo nas 5 camadas obrigatórias do Design System. Execute via `npx tsx .agents/skills/ui-novo-componente/scripts/verify_parity.ts`.
