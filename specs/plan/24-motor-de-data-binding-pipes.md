---
tipo: "spec"
titulo: "Motor de Data Binding e Pipes (Formatadores)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🟢 Implementado"
prioridade: "Crítica"
tags: ["spec", "logic", "databinding", "pipes"]
relacionados: []
---

# 1. Visão Geral
Esta spec documenta a criação do interpretador léxico responsável por caçar strings de template (`{{ }}`) no manifesto JSON e substituí-las pelo estado de dados correspondente em tempo de execução, além de aplicar formatações nativas.

# 2. Regras de Negócio
- **Regra 1: Interpolação Segura:** A resolução do caminho (ex: `{{user.address.street}}`) deve ser imune a quebras. Se `address` for indefinido, o motor deve renderizar uma string vazia `""` ou o valor de fallback especificado (ex: `{{user.address.street || 'Não informado'}}`), nunca lançando um erro fatal no React.
- **Regra 2: Pipes de Formatação:** O motor deve reconhecer o caractere pipe `|` e aplicar funções formatadoras puras pré-cadastradas na Sarak. Exemplos obrigatórios: `currency` (Moeda), `date` (Data), `capitalize` (Maiúscula), `uppercase`, `lowercase`.
- **Regra 3: Atualização Reativa:** O Data Binding deve escutar o contexto/estado. Se o estado externo (injetado via Importador) mudar, todos os textos interpolados devem ser re-renderizados imediatamente.
- **Regra 4: Sanitização Anti-XSS:** Valores interpolados não devem ser renderizados usando `dangerouslySetInnerHTML` a não ser que especificamente marcados e filtrados via `SarakMarkdownRenderer` (Spec 15).

# 3. Critérios de Aceite
- [ ] A string `Total: {{balance | currency: 'BRL'}}` renderiza `Total: R$ 1.500,00` (se `balance=1500`).
- [ ] Variáveis inexistentes como `{{usuario.fantasma}}` não quebram a interface, retornando vazio.
- [ ] Aninhar variáveis funciona adequadamente (ex: `{{empresa.filiais[0].nome}}`).

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** extrair múltiplas variáveis da mesma string (ex: `Olá {{nome}}, seu saldo é {{saldo}}`).
- [ ] **Deve** aplicar o Pipe de Datas processando um Timestamp Unix ISO.

## Testes de Contrato (API)
- [ ] N/A.

## Testes E2E (Integração)
- [ ] Alterar o objeto global via uma ação de `mutate_state` deve refletir imediatamente a alteração de texto em toda a árvore DOM sem necessidade de reload da página.
