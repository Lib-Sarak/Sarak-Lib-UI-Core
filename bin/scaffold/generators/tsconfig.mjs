/**
 * `tsconfig.json` do starter padrão (Spec 45): um front puro (Vite/editor), sem
 * backend Node para tipar separadamente — o 2º tsconfig (`tsconfig.server.json`)
 * saiu junto com o Express (Spec 44/45 removem o backend do `init`).
 */
export function buildTsconfig() {
    return {
        compilerOptions: {
            target: 'ES2022',
            lib: ['ES2022', 'DOM'],
            module: 'ESNext',
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            strict: true,
            skipLibCheck: true,
            esModuleInterop: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
        },
        include: ['src'],
    };
}
