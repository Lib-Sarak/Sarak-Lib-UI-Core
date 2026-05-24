# Exemplo Correto: Implementação em Next.js (Node Bridge)

**Situação:** O Agente detectou que o projeto é um frontend Next.js sem backend Python separado.

**Antes:** O projeto não tinha a Sarak UI instalada. O banco de dados precisava das tabelas do Design Engine.

**Depois (instrumentation.ts):**
```typescript
import { setupUIDatabase } from '@sarak/lib-ui-core/backend/node/database';

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.DATABASE_URL) {
        console.log("Inicializando banco UI Plug & Play");
        await setupUIDatabase(process.env.DATABASE_URL);
    }
}
```

**Por que isso é correto:** Ele delega a criação do schema e das tabelas `custom_themes` completamente para a ponte oficial `bridge-node`, sem precisar rodar queries `.sql` avulsas na aplicação.
