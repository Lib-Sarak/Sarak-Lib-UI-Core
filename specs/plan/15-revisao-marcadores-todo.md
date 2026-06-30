---
tipo: "spec"
titulo: "Revisão e Limpeza de Marcadores TODO"
dominio: "Quality Assurance / Debt"
status: "🔴 A Implementar"
prioridade: "Média"
tags: ["spec", "tech-debt", "limpeza"]
relacionados: []
---

# 1. Visão Geral
Durante o processo de `code-limpeza-projeto`, foram identificadas **233 instâncias** de marcadores `TODO`, majoritariamente espalhados pelas baterias de testes (dentro das pastas `__tests__` e Mocks) e em componentes isolados. Esta spec define o plano de ação para revisar, documentar em backlog (se necessário) e limpar estes marcadores do código base, mantendo o repositório em conformidade com o padrão de Production Ready.

# 2. Regras de Negócio
- **Regra 1:** Todo marcador `TODO` localizado em arquivos de teste (`__tests__`) deve ser avaliado. Se o teste já estiver coberto por outra suíte ou for redundante, o arquivo/`TODO` deve ser excluído. Se o teste for genuinamente necessário, deve ser documentado no gestor de tarefas e o `TODO` deve ser removido ou transformado em um teste ignorado com ID da tarefa (ex: `test.skip("...", () => {})`).
- **Regra 2:** Marcadores em Mocks (ex: `TableMock.tsx`, `AuthMock.tsx`) devem ser finalizados ou removidos se o mock já for suficiente para os testes atuais.
- **Regra 3:** Marcadores em código produtivo (ex: `formScope.ts`, `validate.ts`) devem ser tratados com prioridade máxima. Eles indicam lógicas incompletas que podem gerar bugs em runtime.
- **Regra 4:** Nenhum código deve ser mergeado para a branch principal (`main`) contendo marcadores `TODO` órfãos (sem referência a um ticket de tracking).

# 3. Critérios de Aceite
- [ ] Varredura completa confirmando 0 instâncias de `TODO` não documentados no repositório.
- [ ] Testes que estavam marcados como `TODO` foram implementados, excluídos ou vinculados a uma task externa (via `.skip` com referência).
- [ ] Código de produção (`src/core/Manifest/Form/formScope.ts`, `validate.ts`) revisado e lógica concluída/tratada.

# 4. Plano de Testes (Quality Gate)
Mapeamento obrigatório dos testes para considerar esta spec "Concluída".

## Testes Unitários
- [ ] **Deve** rodar a suíte inteira e validar que não há diminuição da cobertura (`coverage`) após a exclusão de arquivos de testes vazios ou com `TODO`.

## Testes de Contrato (API)
- [ ] N/A

## Testes E2E (Integração)
- [ ] N/A
