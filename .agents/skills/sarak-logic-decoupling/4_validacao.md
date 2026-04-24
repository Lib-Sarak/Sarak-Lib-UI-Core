# Checklist de Validação: Sarak Logic Decoupling

Use este checklist para garantir que o "cordão umbilical" do Shared foi cortado.

## Fase de Auditoria
- [ ] O `package.json` foi verificado em busca de `@sarak/lib-shared`?
- [ ] Foram buscados `import` vindos de diretórios fora da raiz do módulo?

## Fase de Substituição
- [ ] As funções de negócio importadas do Shared foram migradas para chamadas de API?
- [ ] As funções utilitárias (helpers) foram duplicadas ou refatoradas localmente?
- [ ] Interfaces/Tipos compartilhados foram movidos para o próprio módulo ou para contratos JSON?

## Fase de Validação Técnica
- [ ] O build do módulo completa 100% sem o Shared instalado?
- [ ] O módulo consegue rodar seus testes unitários localmente?
- [ ] Não existem referências a variáveis globais do Shared (ex: `window.SARAK_SHARED`)?

## Fase de Registro
- [ ] O resultado foi registrado no `gsd-registro-sessao`?

---
**Critério de Sucesso:** Se você deletar a pasta `Sarak-Lib-Shared` do computador, este módulo ainda deve compilar e funcionar (assumindo que as APIs de rede que ele consome estão respondendo).
