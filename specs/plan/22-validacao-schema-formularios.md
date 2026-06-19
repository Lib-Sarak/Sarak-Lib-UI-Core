---
tipo: "spec"
titulo: "Validação de Schema de Formulários"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "logic", "forms", "validation"]
relacionados: []
---

# 1. Visão Geral
Construir formulários via JSON requer que o sistema saiba validar os inputs nativamente sem que o desenvolvedor crie rotinas externas (Ex: "Email não pode ser vazio"). Esta especificação acopla as engrenagens visuais de erro a um motor de regras de validação declarativas.

# 2. Regras de Negócio
- **Regra 1: Schema Híbrido Incorporado:** O JSON dos componentes de Input aceitará uma chave `validation` suportando tipos primitivos explícitos: `required`, `minLength`, `maxLength`, `pattern` (Regex), e `type` (email, url, numero).
- **Regra 2: Bloqueio do Event Bus:** Se o formulário possuir Erros de Validação ativos, o motor barrará silenciosamente todas as ações do tipo `api_call` engatilhadas pelo botão com `submit: true`, impedindo a requisição suja.
- **Regra 3: Reatividade Visual Integrada:** Ao falhar uma validação no `onBlur` (tirar foco do input) ou na tentativa de Submit, o Input alterará seu tema para refletir a variável CSS `--sx-color-error` (borda vermelha) e mostrará a mensagem de erro fornecida no JSON logo abaixo do campo.
- **Regra 4: Custom Error Messages:** A API de configuração deve aceitar mensagens verbosas (ex: `validation: { required: "A senha não pode estar vazia" }`) que serão repassadas diretamente ao componente `<SarakTypography>` helper text.

# 3. Critérios de Aceite
- [ ] Tentar submeter os dados sem preencher um campo mapeado como `required: true` pinta o input de vermelho instantaneamente e cancela a requisição HTTP.
- [ ] Expressões Regex customizadas inseridas no JSON validam corretamente a tipagem da string antes do envio.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** traduzir o nó de validação do JSON para um validador equivalente do React Hook Form/Zod subjacente, injetando corretamente os estados no Context do Formulário.
- [ ] **Deve** validar bloqueios de envio para todos os tipos (Regex incorreta, string menor que `minLength` estipulado, campo em branco).

## Testes de Contrato (API)
- [ ] N/A.

## Testes E2E (Integração)
- [ ] Fazer uma digitação contínua inválida, sair do campo, checar a mudança de border-color vermelha, voltar a digitar dados corretos e certificar-se da remoção instantânea da cor vermelha sem submissão final.
