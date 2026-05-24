# 4. Validação (Checklist)

Ao finalizar a adição de qualquer componente, execute os seguintes passos mentais e práticos antes de avisar o usuário que está pronto:

- [ ] A nova propriedade está escrita em seu respectivo Schema (ex: `schema/buttons.ts`)?
- [ ] O arquivo `theme_table_mapping.json` foi atualizado via comando? (Verifique lendo o arquivo gerado).
- [ ] O Script de verificação de paridade foi aprovado com `Exit Code 0`?
- [ ] A interface visual (Componentes React ou CSS base) foi alterada para efetivamente aplicar o valor que virá do Design System?
- [ ] O componente recém-adicionado está presente na interface gráfica da "Central de Comando" ou Preview Canvas? (Faça um teste renderizando o Gêmeo Digital).
- [ ] Remova arquivos de log ou testes temporários utilizados durante o processo de debugging.
