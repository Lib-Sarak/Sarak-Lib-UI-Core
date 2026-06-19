---
tipo: "spec"
titulo: "Persistência de Estado Local (LocalStorage)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🔴 A Implementar"
prioridade: "Baixa"
tags: ["spec", "logic", "state", "storage"]
relacionados: []
---

# 1. Visão Geral
Para garantir que preferências de usuário (tema claro/escuro, sidebars retraídas, aba selecionada) sobrevivam a recarregamentos de página (F5) sem necessidade de banco de dados no backend, a Sarak UI Core necessita de acesso controlado e JSON-declarativo ao Storage do navegador.

# 2. Regras de Negócio
- **Regra 1: Tag Declarativa de Persistência:** Qualquer input ou componente acionável cujo valor pertença ao estado da UI poderá carregar uma flag no JSON: `persistState: "chave_storage"`.
- **Regra 2: Sincronização Bidirecional (Hook Storage):** O motor interno deve utilizar um Hook customizado que atualize a UI automaticamente se a chave no LocalStorage for modificada (ex: se o usuário altera o valor em outra aba do navegador).
- **Regra 3: Namespacing Obrigatório:** Para evitar conflito entre sistemas importadores usando Sarak no mesmo domínio, todas as chaves criadas pelo motor no LocalStorage devem ser prefixadas silenciosamente (ex: `@sarak:chave_storage`).
- **Regra 4: Criptografia de Base (Opcionalidade):** Estados marcados explicitamente com `sensitive: true` devem ter seus dados passados por *base64* ou hash raso antes de persistir no Storage local visível.

# 3. Critérios de Aceite
- [ ] Ao fechar a Sidebar configurada com `persistState`, recarregar o navegador (`F5`) deve montá-la já recolhida imediatamente.
- [ ] Chaves persistidas pela Sarak não colidem ou sobrescrevem chaves padrão já existentes do sistema que importou a biblioteca.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** gravar e ler perfeitamente valores primitivos (boolean, strings, numbers) aplicando o prefixo obrigatório do namespace Sarak.
- [ ] **Deve** garantir fallback suave (não falhar o render) se o navegador do usuário estiver no Modo Anônimo ou com bloqueio estrito bloqueando acesso à API nativa de LocalStorage.

## Testes de Contrato (API)
- [ ] N/A.

## Testes E2E (Integração)
- [ ] Fluxo Visual: Alterar a "Aba Ativa" de um grupo de `<SarakTabs>`, recarregar a tela, e confirmar visualmente que a aba selecionada permanece ativa.
