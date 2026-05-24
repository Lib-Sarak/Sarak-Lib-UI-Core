# Exemplo Incorreto: Injeção Manual de SQL

**Situação:** O Agente tentou instalar o Sarak UI Core.

**O Erro Comum:**
```typescript
import { Client } from 'pg';
import fs from 'fs';

async function inicializar() {
    // ⚠️ ERRO: O consumidor está tentando ler o arquivo e gerenciar a injeção
    const sql = fs.readFileSync('node_modules/@sarak/lib-ui-core/backend/sql/001_init_ui_schema.sql');
    const client = new Client();
    await client.query(sql);
}
```

**Por que é ruim:** O agente violou a arquitetura Plug & Play. O consumidor **nunca** deve ler ou processar o script SQL. Ele deve importar as funções da Bridge nativa (`setupUIDatabase`), que já encapsulam toda essa lógica, garantindo estabilidade e self-healing automático mantido pela equipe principal da biblioteca.
