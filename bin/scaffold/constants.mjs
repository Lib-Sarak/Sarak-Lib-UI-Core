/**
 * Constantes do scaffolder (Spec 21). `typescript` fica travado em ^5 — o
 * `ts-node-dev` do Golden Path não roda sobre TS 7 (achado real de instalação).
 */
export const DEFAULT_BACKEND_PORT = 3000;
export const DEFAULT_FRONTEND_PORT = 5173;

export const STACKS = ['vite-express', 'next', 'frontend-only'];
export const STORAGES = ['sqlite', 'postgres', 'custom'];
export const MODES = ['app', 'embedded'];

export const DEFAULT_STACK = 'vite-express';
export const DEFAULT_STORAGE = 'sqlite';
export const DEFAULT_MODE = 'app';

export const TYPESCRIPT_VERSION_RANGE = '^5.4.0';

export const EXPRESS_VERSION_RANGE = '^4.19.0';

/** O backend Express do Golden Path é runtime, não deve entrar em devDependencies. */
export const GOLDEN_PATH_DEPENDENCIES = {
    express: EXPRESS_VERSION_RANGE,
};

export const GOLDEN_PATH_DEV_DEPENDENCIES = {
    vite: '^5.4.0',
    '@vitejs/plugin-react': '^4.3.0',
    concurrently: '^9.0.0',
    'ts-node-dev': '^2.0.0',
    typescript: TYPESCRIPT_VERSION_RANGE,
    '@types/express': '^4.17.0',
};

export const NEXT_DEV_DEPENDENCIES = {
    typescript: TYPESCRIPT_VERSION_RANGE,
    '@types/node': '^20.0.0',
};

export const FRONTEND_ONLY_DEV_DEPENDENCIES = {
    vite: '^5.4.0',
    '@vitejs/plugin-react': '^4.3.0',
    typescript: TYPESCRIPT_VERSION_RANGE,
};

export const NEXT_VERSION_RANGE = '^14.2.0';

/** As 2 skills que o `init` copia para o consumidor (mesmo par da Etapa 6 de `ui-integra-consumidor`). */
export const SKILLS_TO_COPY = ['ui-integra-escrever-manifesto', 'ui-auditoria-manifesto'];

/**
 * Spec da dependência git usada quando o consumidor ainda não tem
 * `dependencies['@sarak/lib-ui-core']` gravado (1ª instalação). Quando já existe
 * (`init` rodando sobre um projeto que já instalou a lib), `runInit.mjs` reusa o
 * spec REAL do consumidor em vez deste default — o `sarak:update` deve furar o
 * pin do MESMO repositório que foi instalado, nunca assumir um alheio (Spec 39 §2.1).
 */
export const DEFAULT_LIB_GIT_SPEC = 'github:Lib-Sarak/Sarak-Lib-UI-Core';
