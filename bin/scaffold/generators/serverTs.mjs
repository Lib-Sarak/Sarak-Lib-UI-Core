/**
 * `src/server.ts` — Express com o middleware oficial da porta de persistência
 * (Spec 19). O storage escolhido decide só a linha de `setupUIDatabase` /
 * `createSarakUIExpressMiddleware`; o resto do servidor é idêntico.
 */
const HELLO_ENDPOINT = `
app.get('/api/v1/hello', (_req, res) => {
    res.json({ message: 'Sarak backend no ar 🚀' });
});
`;

function sqliteSetup() {
    return `const DATABASE_PATH = './database.sqlite';

setupUIDatabase(DATABASE_PATH);
app.use(createSarakUIExpressMiddleware({ connectionString: DATABASE_PATH }));`;
}

function postgresSetup({ answers }) {
    const schemaLine = answers.schema ? `, schema: '${answers.schema}'` : '';
    return `const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/sarak';

setupUIDatabase(DATABASE_URL${answers.schema ? `, { schema: '${answers.schema}' }` : ''});
app.use(createSarakUIExpressMiddleware({ connectionString: DATABASE_URL${schemaLine} }));`;
}

function customSetup() {
    return `// Contrato-próprio (Spec 19 / docs/ui-storage-contract.md): implemente os 5
// endpoints REST (GET/POST design, GET/POST branding, POST/PUT/PUT-activate
// themes) você mesmo, em qualquer linguagem — ou implemente \`UIStorageAdapter\`
// e passe \`{ storage: seuAdapter }\` para \`createSarakUIExpressMiddleware\`.
//
// import { createSarakUIExpressMiddleware } from '@sarak/lib-ui-core/backend/node';
// app.use(createSarakUIExpressMiddleware({ storage: meuAdapterCustomizado }));`;
}

function buildStorageSetup({ answers }) {
    if (answers.storage === 'postgres') return postgresSetup({ answers });
    if (answers.storage === 'custom') return customSetup();
    return sqliteSetup();
}

function buildImports({ answers }) {
    if (answers.storage === 'custom') {
        return `import express from 'express';`;
    }
    return `import express from 'express';
import { setupUIDatabase, createSarakUIExpressMiddleware } from '@sarak/lib-ui-core/backend/node';`;
}

export function buildServerTs({ answers }) {
    return `${buildImports({ answers })}

const app = express();
app.use(express.json());

// Porta de Persistência de UI (Spec 19) — o Design Engine chama /api/ui/*.
${buildStorageSetup({ answers })}
${HELLO_ENDPOINT}
const PORT = ${answers.backendPort};
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(\`[Sarak backend] ouvindo em http://localhost:\${PORT}\`);
});
`;
}
