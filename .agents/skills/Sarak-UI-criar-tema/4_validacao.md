# Validação

- [ ] O script gerador de template `generate_theme_template.ts` foi utilizado com sucesso e gerou o arquivo no local correto?
- [ ] O script `verify_theme_parity.ts` foi executado com sucesso validando que o tema recém-criado contém 100% dos tokens da arquitetura?
- [ ] Todas as chaves geradas pelo script foram preenchidas ou deixadas com seus valores default seguros?
- [ ] O tema gerado NÃO contém nenhuma propriedade inventada (além daquelas mapeadas no schema oficial)?
- [ ] O novo tema foi importado e exportado no array principal de `src/core/Design/presets/themes/index.ts`?
- [ ] O código TypeScript compila sem erros de sintaxe (nenhuma vírgula faltando ou erro de tipagem)?
- [ ] A etapa HITL (Human In The Loop) foi apresentada ao usuário antes de qualquer comando de build?
- [ ] As correções e criações realizadas foram registradas para o `skill-registro-snapshot` (ou o sistema de log da sua sessão)?
