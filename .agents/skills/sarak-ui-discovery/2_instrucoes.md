# Workflow de Execução: Sarak UI Discovery

Siga este passo a passo para transformar o `UI-Core` em um renderizador agnóstico e API-Driven.

---

## Passo 1: Auditoria de Acoplamento Visual
**Objetivo:** Identificar dependências de código que impedem a independência.

1. Use `grep_search` para localizar todas as ocorrências de `registerSarakModule` no repositório `Sarak-Lib-UI-Core`.
2. Identifique imports vindo de `@sarak/lib-shared` que tratem de "Navigation", "Context" ou "Registry".
3. Liste os arquivos que precisarão de intervenção (geralmente `SarakShell.tsx`, `Navigation.tsx` e `index.ts`).

## Passo 2: Implementação do Discovery Engine
**Objetivo:** Criar o mecanismo de "escuta" de APIs.

1. No `UI-Core`, crie um hook `useModuleDiscovery`:
   - Ele deve ler uma lista de URLs de módulos do `localStorage`, `window.SARAK_CONFIG` ou `.env`.
   - Deve realizar um `fetch` para `[URL]/manifest.json` de cada módulo.
2. Normalize os dados recebidos para o formato de contrato visual Sarak v5.5.

## Passo 3: Refatoração do SarakShell (HITL ⚠️)
**Objetivo:** Trocar o registro estático pelo dinâmico.

1. No componente que renderiza a `Sidebar`, substitua o loop do `registeredModules` local pelo resultado do hook `useModuleDiscovery`.
2. **IMPORTANTE**: Certifique-se de que se um `manifest.json` falhar ao carregar, a UI não quebre. Implemente um `try-catch` e logger silencioso.

## Passo 4: Apresentação e Confirmação (HITL)

```markdown
## ✅ Plano de Descoberta Dinâmica
**Módulo:** Sarak-Lib-UI-Core
**Ação:** Descontinuar o Registro via Código e ativar a Autodescoberta via API.
**Impacto:** O UI-Core deixará de depender do Shared para saber quais abas exibir.
⚠️ Confirma a refatoração do Shell para modo Discovery?
```

## Passo 5: Teste e Limpeza
1. Simule um módulo "Fake" servindo um `manifest.json` via local server.
2. Verifique se a aba aparece automaticamente no `UI-Core`.
3. **Morte ao Shared**: Remova o import de `@sarak/lib-shared` do `index.ts` do UI-Core e delete o pacote do `package.json`.

## Passo 6: Registro de Evolução
Instrua para que o progresso seja registrado para o `skill-registro-snapshot` como "UI-Core: Discovery Protocol Ativado".
