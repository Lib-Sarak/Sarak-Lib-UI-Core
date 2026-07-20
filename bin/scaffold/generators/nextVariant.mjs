/**
 * Stack `next` (Spec 21 §2.3): `instrumentation.ts` + os 3 handlers oficiais do
 * App Router (design/branding/themes) — nenhum SQL cru, tudo via
 * `@sarak/lib-ui-core/backend/node`.
 */
function buildStorageOptionsLiteral({ answers }) {
    if (answers.storage === 'custom') {
        return `{ storage: meuAdapterCustomizado }`;
    }
    const schemaField = answers.storage === 'postgres' && answers.schema ? `, schema: '${answers.schema}'` : '';
    return `{ connectionString: process.env.DATABASE_URL!${schemaField} }`;
}

export function buildInstrumentationTs({ answers }) {
    const setup =
        answers.storage === 'custom'
            ? `    // Contrato-próprio (docs/ui-storage-contract.md): implemente \`UIStorageAdapter\`
    // ou os 5 endpoints REST você mesmo — nenhuma chamada de setup aqui.`
            : `    const { setupUIDatabase } = await import('@sarak/lib-ui-core/backend/node');
    await setupUIDatabase(process.env.DATABASE_URL!);`;

    return `export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;
${setup}
}
`;
}

export function buildDesignRouteTs({ answers }) {
    return `import { createDesignApiHandler } from '@sarak/lib-ui-core/backend/node';

export const { GET, POST } = createDesignApiHandler(${buildStorageOptionsLiteral({ answers })});
`;
}

export function buildBrandingRouteTs({ answers }) {
    return `import { createBrandingApiHandler } from '@sarak/lib-ui-core/backend/node';

export const { GET, POST } = createBrandingApiHandler(${buildStorageOptionsLiteral({ answers })});
`;
}

export function buildThemesRouteTs({ answers }) {
    return `import { createThemesApiHandler } from '@sarak/lib-ui-core/backend/node';

const themes = createThemesApiHandler(${buildStorageOptionsLiteral({ answers })});

export const POST = themes.POST;
`;
}

export function buildThemesByIdRouteTs({ answers }) {
    return `import { createThemesApiHandler } from '@sarak/lib-ui-core/backend/node';

const themes = createThemesApiHandler(${buildStorageOptionsLiteral({ answers })});

export const PUT = (req: Request, { params }: { params: { id: string } }) => themes.PUT(req, params.id);
`;
}

export function buildThemesActivateRouteTs({ answers }) {
    return `import { createThemesApiHandler } from '@sarak/lib-ui-core/backend/node';

const themes = createThemesApiHandler(${buildStorageOptionsLiteral({ answers })});

export const PUT = (req: Request, { params }: { params: { id: string } }) => themes.ACTIVATE(req, params.id);
`;
}
