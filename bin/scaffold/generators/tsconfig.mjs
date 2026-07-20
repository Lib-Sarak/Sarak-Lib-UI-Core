/**
 * Dois `tsconfig` no Golden Path (Spec 21 §2.3): `tsconfig.json` (raiz, usado
 * pelo Vite/editor, inclui o front `.tsx`) e `tsconfig.server.json` (usado por
 * `ts-node-dev`, exclui o front — o backend nunca precisa tipar JSX/React DOM).
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

export function buildServerTsconfig() {
    return {
        extends: './tsconfig.json',
        compilerOptions: {
            module: 'CommonJS',
            moduleResolution: 'node',
            jsx: 'preserve',
            noEmit: true,
        },
        include: ['src/server.ts', 'src/Sarak-Engine'],
        exclude: ['src/main.tsx', 'src/manifests'],
    };
}

/** Stack `frontend-only`: um único tsconfig (não existe backend Node aqui). */
export function buildFrontendOnlyTsconfig() {
    return buildTsconfig();
}
