# Checklist de Validação: Sarak Auth Security

Use este checklist para garantir que o módulo está blindado sob o novo paradigma.

## Fase de Middleware
- [ ] O backend possui um middleware de verificação de token independente?
- [ ] O middleware utiliza uma chamada de rede para validar o token?
- [ ] A URL da API de Identidade é configurável via `.env`?

## Fase de Frontend
- [ ] O `AuthContext` do Shared foi removido do componente de entrada?
- [ ] O token é anexado corretamente no Header de todas as requisições API?
- [ ] Não existem credenciais ou segredos expostos no código-fonte?

## Fase de Teste de Estresse
- [ ] Tentativa de acesso sem Header Authorization: Bloqueado com 401?
- [ ] Tentativa com Token malformado: Bloqueado com 401?
- [ ] Simulação de API de Identidade Offline: O sistema falha de forma segura (nega acesso)?

## Fase de Registro
- [ ] O resultado foi registrado no `gsd-registro-sessao`?
