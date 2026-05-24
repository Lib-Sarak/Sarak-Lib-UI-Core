# 3. Regras e Limites

Para manter a integridade arquitetural em sistemas distribuídos e de larga escala, obedeça de forma inegociável as seguintes regras de restrição:

1. **PROIBIDO Deletar Tokens Existentes**: Você JAMAIS deverá deletar um token que já está mapeado em `master-map.ts`. Caso uma propriedade não seja mais usada, ela deve ser mantida como legada (ou deprecada nos comentários) para que sistemas que já salvaram ela no Banco de Dados não quebrem no parsing JSONB.
2. **Renomear Exige Backward-Compatibility**: Ao renomear a chave de um componente visual (ID de token), lembre-se que o banco de dados antigo perde a referência. Tente ao máximo NÃO RENOMEAR chaves. Crie um novo token e mantenha o velho, se absolutamente necessário.
3. **Não Modifique Tipos Fortes sem Cuidado**: Se um token foi criado como `type: 'color'`, não modifique seu tipo (como um select). A UI espera uma string hexadecimal. Alterar o tipo pode gerar crash no client-side.
4. **Respeite as Categorias JSONB**: Se o token for referente a Cards, não force sua entrada no schema de Typography. A coerência do JSONB gerado (`generate-db-mapping.ts`) é vital para o backend.
