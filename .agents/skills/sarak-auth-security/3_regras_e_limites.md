# Regras e Limites: Sarak Auth Security

Restrições fundamentais para manter a proteção Zero Trust v5.5:

1. **NUNCA armazene segredos no código**: Chaves de API, segredos de JWT e URLs de autenticação devem ser lidos de variáveis de ambiente (`.env`).
2. **PROIBIDO confiar na UI**: O fato de um componente de interface estar renderizado não significa que o usuário é válido. SEMPRE valide o token em todas as chamadas de API de backend.
3. **NÃO compartilhe chaves privadas**: Cada módulo (ou conjunto lógico de módulos) deve ter sua própria credencial de acesso à Identidade se possível.
4. **NUNCA use contextos compartilhados do Shared**: Toda lógica de "quem é o usuário" vinda de bibliotecas legadas deve ser deletada.
5. **NÃO ignore o TLS**: No ambiente de produção, todas as chamadas de verificação de autenticação de rede devem ser feitas via HTTPS.
