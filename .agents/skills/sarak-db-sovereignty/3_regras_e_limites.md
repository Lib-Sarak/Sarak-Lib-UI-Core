# Regras e Limites: Sarak DB Sovereignty

Siga estas restrições estritas para garantir o isolamento de dados v5.5:

1. **PROIBIDO Foreign Keys Cruzadas**: NUNCA crie uma `FOREIGN KEY` física para uma tabela que não pertença ao diretório `/database` do próprio módulo. Relacionamentos entre módulos devem ser **Lógicos** (geridos pela aplicação).
2. **NÃO use o Schema Public**: Sempre defina um schema específico ou use um prefixo único para suas tabelas (ex: `llm_catalog.models` em vez de apenas `models`). Isso evita colisões em bancos compartilhados.
3. **PROIBIDO Scripts SQL Globais**: Todo arquivo `.sql` deve estar dentro de `/database` do módulo. Scripts no "root" do projeto ou em pastas de agregadores são proibidos.
4. **NÃO ignore a inicialização local**: O módulo DEVE ser capaz de criar todas as suas tabelas a partir do estado zero. Depender de tabelas pré-existentes é uma violação de soberania.
5. **LIMITE de Migrations**: Não apague o histórico de migrations. Elas são a verdade sobre a evolução do módulo.
