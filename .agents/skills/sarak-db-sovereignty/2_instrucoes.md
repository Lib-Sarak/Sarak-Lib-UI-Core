# Workflow de Execução: Sarak DB Sovereignty

Siga estas etapas para isolar a persistência do módulo e garantir sua soberania SQL.

---

## Passo 1: Auditoria de Dependência SQL
**Objetivo:** Identificar acoplamento via Foreign Keys ou esquemas externos.

1. Liste todas as tabelas criadas pelo módulo.
2. Verifique se existe alguma `CONSTRAINT ... FOREIGN KEY` que aponte para tabelas de **OUTROS** módulos (ex: `REFERENCES users` se o módulo de usuários estiver em outra lib).
3. **Ação Corretiva**: Se encontrar FK cross-module, transforme-a em uma coluna simples (ex: `user_id UUID`) e remova a restrição física do banco. O vínculo será tratado na camada de serviço.

## Passo 2: Estruturação do Diretório Soberano
**Objetivo:** Centralizar a lógica de dados na raiz do módulo.

1. Crie a pasta `/database` na raiz do módulo `Sarak-Lib-*`.
2. Dentro de `/database`, organize os arquivos conforme o padrão:
   - `init.sql`: Script de criação de tabelas e tipos iniciais.
   - `seeds/`: Diretório para dados de demonstração ou configuração inicial.
   - `migrations/`: Scripts numerados para evolução do schema (ex: `001_initial.sql`).

## Passo 3: Refatoração do Bootstrapping (HITL ⚠️)
**Objetivo:** Fazer o backend rodar as migrations locais.

1. Localize o código de inicialização do backend (ex: `boot.py` ou `server.ts`).
2. Altere o caminho dos scripts SQL para apontar para a nova pasta local `/database`.
3. Certifique-se de que o módulo utilize uma **Schema Search Path** ou prefixo de tabela específico para evitar colisão se vários módulos compartilharem a mesma instância física de banco.

## Passo 4: Apresentação e Confirmação (HITL)

```markdown
## ✅ Plano de Soberania de Dados
**Módulo:** [NOME_DA_LIB]
**Mudança:** Migração de SQL para diretório soberano `/database`.
**Desacoplamento:** Identificadas e removidas [X] FKs cruzadas.
⚠️ Confirma a movimentação dos arquivos SQL para a estrutura local?
```

## Passo 5: Validação de Independência
1. Exclua o banco de teste atual.
2. Suba apenas este módulo e verifique se ele consegue recriar toda a sua estrutura de dados sozinho.
3. Tente rodar o módulo em um banco de dados vazio: se ele falhar por "tabela faltante" de outro módulo, o desacoplamento falhou.

## Passo 6: Registro
Registre a conclusão para o `skill-registro-snapshot` como "Soberania de Dados Módulo [ID] Ativada".
