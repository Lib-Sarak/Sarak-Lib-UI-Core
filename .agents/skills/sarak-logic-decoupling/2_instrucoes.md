# Workflow de Execução: Sarak Logic Decoupling

Siga este processo para remover o "cordão umbilical" do Shared de um módulo.

---

## Passo 1: Auditoria de Dependências
**Objetivo:** Localizar o acoplamento no manifesto do pacote e no código.

1. Abra o `package.json` do módulo.
2. Identifique `@sarak/lib-shared` ou similares em `dependencies` ou `devDependencies`.
3. Use `grep_search` no código-fonte em busca de `import ... from "@sarak/lib-shared"`.

## Passo 2: Mapeamento de Funções Utilizadas
**Objetivo:** Decidir o destino de cada import do Shared.

Para cada função importada do Shared, aplique a **Matriz de Decisão Sarak**:
- **Lógica de Utilitário Geral** (ex: formatador de data, logger simples): **Duplicar Localmente** no módulo.
- **Lógica de Negócio/Domínio** (ex: buscar usuário, validar permissão): **Substituir por Chamada de API** (fetch/axios/gRPC).
- **Lógica de Interface** (ex: botões, inputs): **Mover para o UI-Core** ou usar contrato visual do `manifest.json`.

## Passo 3: Limpeza e Substituição (HITL ⚠️)
**Objetivo:** Efetivar a remoção.

1. Remova a linha do `@sarak/lib-shared` do `package.json`.
2. Delete a pasta `node_modules` (opcional, para teste limpo).
3. Substitua os imports conforme decidido no Passo 2.
4. Se o módulo precisar de um novo endpoint para servir outros, crie-o.

## Passo 4: Apresentação e Confirmação (HITL)

```markdown
## ✅ Plano de Desacoplamento de Lógica
**Módulo:** [NOME_DA_LIB]
**Imports Removidos:** [LISTA]
**Estratégia de Substituição:** [DETALHES]
⚠️ Confirma a remoção definitiva do Shared deste módulo?
```

## Passo 5: Validação de Build Isolado
1. Execute o build do módulo (ex: `npm run build` ou `poetry build`).
2. Verifique se não há erros de "module not found" referentes ao Shared.
3. Garanta que o Linter não acuse imports órfãos.

## Passo 6: Registro
Registre a conclusão para o `skill-registro-snapshot` como "Módulo [ID] Desacoplado do Shared".
