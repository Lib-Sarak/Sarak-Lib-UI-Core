# Checklist de Validação: Sarak UI Discovery

Aplique este checklist para garantir que o motor de descoberta está operacional e seguro.

## Fase de Auditoria
- [ ] Todas as chamadas ao legacy `registerSarakModule` foram identificadas no UI-Core?
- [ ] Os pontos de acoplamento com o `Shared` na camada de navegação foram mapeados?

## Fase de Implementação
- [ ] O hook `useModuleDiscovery` foi implementado sem dependências de código externas?
- [ ] Existe tratamento de erro (`try-catch`) para o `fetch` de manifestos?
- [ ] A Sidebar renderiza itens mesmo quando um módulo está lento ou offline?

## Fase de Independência (Wipe)
- [ ] O pacote `@sarak/lib-shared` foi removido do `package.json` do UI-Core?
- [ ] Não existem mais `import` de Shared em arquivos de Shell/Layout?
- [ ] O `UI-Core` sobe e renderiza o layout básico sem outros módulos presentes?

## Fase de Registro
- [ ] O resultado da refatoração foi registrado para o `skill-registro-snapshot`?

---
**Critério de Sucesso:** O UI-Core deve ser capaz de mostrar uma aba de um módulo que "nasceu" após o build da UI, apenas via apontamento de rede.
