# Regras e Limites

- **NÃO** chame nenhuma outra skill (nem mesmo a `Sarak-UI-new-component`). Esta skill é estritamente focada na criação de temas (criação e preenchimento).
- **NUNCA** invente novas chaves, tokens ou propriedades manualmente no arquivo TypeScript do tema. Todas as propriedades devem ser aquelas extraídas diretamente pelo script gerador dinâmico.
- **NÃO** altere componentes React, lógica de renderização (`DesignScope`), hooks ou engines do sistema durante o uso desta skill. Um Tema modifica apenas dados (TypeScript Object).
- **NUNCA** omita propriedades obrigatórias geradas pelo template, a ausência de uma propriedade pode quebrar o Gêmeo Digital ou o Sarak UI local.
- **NÃO** prossiga para testes locais ou compilações sem o consentimento do usuário no passo de validação (HITL).
