# Workflow de Execução: Sarak Auth Security

Siga estas etapas para garantir que o módulo é independente em sua segurança.

---

## Passo 1: Auditoria de Segurança
**Objetivo:** Localizar dependências de autenticação centralizada.

1. No código do backend, procure por decoradores ou middlewares que importem do Shared (ex: `@require_auth` ou `SarakAuthMiddleware`).
2. No frontend, procure por `useAuth()` ou `AuthContext` vindos de pacotes externos.

## Passo 2: Implementação do Local Verifier
**Objetivo:** Validar credenciais via rede.

1. Crie uma função `sarakVerifyToken(token)` no módulo.
2. Esta função deve realizar um `POST` ou `GET` para o endpoint de identidade (ex: `/api/v1/auth/verify`).
3. O endpoint de destino deve ser configurado via variável de ambiente `SARAK_AUTH_API_URL`.

## Passo 3: Ativação do Middleware Soberano (HITL ⚠️)
**Objetivo:** Proteger os endpoints sem depender de código externo.

1. Substitua o middleware legado do Shared pelo novo `SarakLocalAuthMiddleware`.
2. Certifique-se de que falhas na API de autenticação resultem em `401 Unauthorized` ou `503 Service Unavailable` em vez de permitir o acesso.

## Passo 4: Apresentação e Confirmação (HITL)

```markdown
## ✅ Plano de Segurança Atômica
**Módulo:** [NOME_DA_LIB]
**Estratégia:** Verificação via API em `[URL_VAR]`.
**Isolamento:** Remoção do `AuthContext` compartilhado.
⚠️ O Token de autorização deve ser passado no Header `Authorization: Bearer [TOKEN]`. Confirma?
```

## Passo 5: Teste de Bypass
1. Tente acessar um endpoint protegido sem o Token.
2. Tente acessar com um Token expirado ou inválido.
3. Garanta que o módulo rejeite a requisição mesmo se a UI-Core estiver tentando forçar a renderização.

## Passo 6: Registro
Registre a conclusão para o `skill-registro-snapshot` como "Segurança Módulo [ID] Blindada".
