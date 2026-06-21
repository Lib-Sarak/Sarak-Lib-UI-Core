---
tipo: "spec"
titulo: "Motor de Repetição (Repeater / For-Loop Engine)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🔴 A Implementar"
prioridade: "Crítica"
tags: ["spec", "logic", "repeater", "lists"]
relacionados: ["21-datastore-estado-reativo", "31-fonte-de-dados-declarativa", "12-expansao-data-grids-vis"]
---

# 1. Visão Geral
Esta especificação define o "Motor de Repetição", o coração dinâmico do `SarakManifestRenderer`. Sem este motor, o JSON não consegue renderizar listas, tabelas ou feeds com tamanho variável de dados provenientes de uma API. Ele atua iterando sobre um nó de dados e multiplicando o componente visual especificado.

# 2. Regras de Negócio
- **Regra 1: A Diretiva `renderFor`:** Qualquer componente (Átomo ou Agrupamento) no JSON pode conter a chave `renderFor: "{{caminho.no.estado}}"`. O motor deve iterar sobre essa lista.
- **Regra 2: Escopo de Iteração:** Durante a renderização repetida, o motor deve injetar um novo contexto local para aquele bloco (ex: `{{item}}` e `{{index}}`), permitindo que componentes filhos acessem as propriedades exclusivas daquela iteração (ex: `{{item.nome}}`).
- **Regra 3: Geração de Keys:** Para manter a performance e integridade do *Virtual DOM* do React, o motor deve extrair automaticamente uma propriedade de identificador (como `id` ou `uuid`) do dado para usar como chave (`key`), e avisar com um fallback visual/log caso a chave seja ausente.
- **Regra 4: Performance e Virtualização:** O motor de repetição deve ser compatível com a arquitetura do Datagrid (Spec 12), delegando a repetição para bibliotecas de Virtualização quando a lista ultrapassar 100 itens.

# 3. Critérios de Aceite
- [ ] Um `SarakCard` configurado com `renderFor: "{{usuarios}}"` (onde `usuarios` tem tamanho 5) gera exatamente 5 cards na tela.
- [ ] Dentro do loop, a interpolação `{{item.email}}` renderiza corretamente o email específico de cada iteração.
- [ ] O React não lança o aviso (warning) de falta de propriedade `key` durante a renderização iterada no console.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** iterar corretamente um array simples de 3 strings e renderizar 3 componentes `<SarakTypography>`.
- [ ] **Deve** lançar um erro capturável (Error Boundary) se `renderFor` apontar para uma variável que não é um *Array*.

## Testes de Contrato (API)
- [ ] N/A.

## Testes E2E (Integração)
- [ ] Injetar dinamicamente mais itens no estado e garantir que o motor adicione os novos blocos na tela sem reconstruir a lista inteira do zero.
