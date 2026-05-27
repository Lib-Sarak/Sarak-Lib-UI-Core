# 2. Instruções Operacionais

Siga exatamente a ordem de execução abaixo para inserir um novo componente ou alterar um existente:

### Passo 1: Inserção no Schema
Identifique a categoria à qual o token pertence (ex: tipografia, botões, cards).
- Abra o arquivo correspondente em `src/core/Design/schema/`.
- Adicione o novo token ao array `tokens` usando a tipagem padrão (id, label, type, defaultValue).
  - **Dica de Mídia**: Se o token for uma mídia dinâmica (ex: background, textura, avatar, cover), o `type` DEVE obrigatoriamente ser `'image'`. Isso forçará a Engine a renderizar o componente híbrido de upload capaz de aceitar vídeos e Cloud Storage.
- **Importante**: Defina as propriedades `cssVars` caso esse token vá manipular o Gêmeo Digital.

### Passo 2: Atualização do Banco de Dados (JSON Mapping)
A tabela do banco é atualizada de forma dinâmica. Para inserir a coluna lá, basta rodar nosso gerador local:
- No terminal, dentro da pasta da biblioteca, rode o comando de atualização de mapping:
```bash
npx tsx generate-db-mapping.ts
```
- Valide se o `theme_table_mapping.json` recebeu o seu token recém-criado na coluna JSONB correta.

### Passo 3: Adição no Gêmeo Digital / UI
Se o token recém-criado for algo estrutural da interface:
- Adicione as regras para capturá-lo e aplicar (estilos Inline, Variáveis CSS, etc.) no `DesignInjector` ou onde ele for consumido no código.
- Certifique-se de que os Default Values sejam injetados via `useDesignDraft` no Preview Mode.

### Passo 4: Rodar o Teste Final de Paridade
Obrigatoriamente rode o script de verificação disponibilizado por essa skill:
```bash
npx tsx .agents/skills/Sarak-UI-new-component/scripts/verify_parity.ts
```
Se o script acusar erro, você **NÃO TEM PERMISSÃO PARA FINALIZAR A TAREFA**. Você deve corrigir as dessincronizações apontadas.
