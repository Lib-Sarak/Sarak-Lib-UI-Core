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

> **Recontagem feita antes desta execução (o número original está desatualizado — releia antes de agir):** rodei `grep -rEo "\bTODO\b" --include="*.ts" --include="*.tsx" src/ | wc -l` (o `\b` de fronteira de palavra é essencial — sem ele, a palavra "TODOS"/"todos" em comentários/strings em português gera falso positivo; `formScope.ts` e `validate.ts`, citados na Regra 3 abaixo como "código produtivo com TODO", na verdade só contêm a palavra "TODOS" em comentário de documentação — **não têm nenhum TODO real**, remova-os da lista de prioridade máxima). Contagem real hoje: **120 ocorrências**, sendo **118 em `__tests__`/Mocks** e **2 em código de produção real**. Rode a contagem de novo antes de agir — este número muda a cada sessão de trabalho no repositório.

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

# 5. Os 2 TODOs Reais de Produção (lista exaustiva, verificada)

```
src/features/DesignEngine/Context/useThemePreview.ts:4
src/components/atomic/Buttons/ThemeToggle.tsx:5
```
Ambos têm **o mesmo texto exato**: `// TODO: Substituir por presets canônicos de core/Design/presets/themes/ quando forem criados`. Como `src/core/Design/presets/themes/` **já existe e já está povoado** (`GLOBAL_THEMES`, usado por `PresetsCatalog.tsx` — confirmado nesta mesma sessão de trabalho), a pré-condição que esses dois TODOs esperavam já foi satisfeita. Ação: abra os dois arquivos, confirme se cada um já pode consumir `GLOBAL_THEMES`/os presets canônicos diretamente; se sim, faça a substituição e remova o TODO; se ainda houver um motivo real para não migrar (documente qual), converta em comentário permanente sem marcador `TODO` solto (Regra 4) ou vincule a uma tarefa de tracking.

# 6. Os 118 TODOs de Teste — são 2 templates repetidos, não 118 problemas distintos

Amostra confirmada: a esmagadora maioria segue **um de dois textos-modelo**, deixados por um gerador/scaffold de teste:
- `// TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade`
- `// TODO: Escrever testes comportamentais para este hook`

Isso muda a estratégia de triagem da Regra 1: não é 118 decisões independentes, é **2 decisões de política, aplicadas em lote**:
1. Decida (uma vez): "testes de montagem profunda" viram tarefa de backlog rastreada (uma entrada única cobrindo todos os componentes "simples" que só têm esse TODO — não 1 ticket por componente) ou são removidos por serem ruído de scaffold sem valor real?
2. Rode a decisão em lote nos arquivos que batem cada template, em vez de abrir um por um.

```bash
# Comando pra listar todos e confirmar que ainda batem o padrão esperado antes de agir em lote
grep -rEn "\bTODO\b" --include="*.ts" --include="*.tsx" src/ | grep -E "__tests__|Mock"
```

# 7. Critérios de Aceite Revisados (substituem o número da Seção 3)
- [ ] Contagem de `TODO` real (via `\bTODO\b`, não substring) chega a 0, ou cada ocorrência restante está vinculada a uma tarefa de tracking (`.skip("...", () => {})` com ID, conforme Regra 1).
- [ ] Os 2 TODOs de produção (Seção 5) foram resolvidos ou documentados com justificativa (não removidos silenciosamente sem decisão).
- [ ] A decisão em lote da Seção 6 foi tomada e aplicada de forma consistente — não uma mistura ad-hoc de "alguns removidos, alguns viraram ticket" sem critério documentado.
