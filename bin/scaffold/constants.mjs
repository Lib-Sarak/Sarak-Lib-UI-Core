/**
 * Constantes do scaffolder. `typescript` fica travado em ^5 para manter a
 * compatibilidade com as dependências do starter.
 */
export const DEFAULT_FRONTEND_PORT = 5173;

export const MODES = ['app', 'embedded'];

export const DEFAULT_MODE = 'app';

export const TYPESCRIPT_VERSION_RANGE = '^5.4.0';

/**
 * Starter padrão: front Vite com `SarakUIProvider`, `SarakAppChrome` e rotas
 * controladas pela aplicação. Sem backend: o tema persiste em `localStorage`;
 * não há servidor Express ou Next para gerar.
 */
export const STARTER_DEV_DEPENDENCIES = {
    vite: '^5.4.0',
    '@vitejs/plugin-react': '^4.3.0',
    typescript: TYPESCRIPT_VERSION_RANGE,
    // `react`/`react-dom` são peerDependencies (mirroradas via buildDependencies) —
    // os @types NÃO vêm junto (a lib os declara só em devDependencies, uso interno).
    // Achado real deste smoke test: sem eles, `tsc --noEmit` falha em `main.tsx`
    // com TS7016 em `react-dom/client`.
    '@types/react': '^18.0.0',
    '@types/react-dom': '^18.0.0',
};

/**
 * Lista de skills copiadas diretamente pelo `init`. A skill de integração faz
 * parte do kit do consumidor, copiado por `copyKit`.
 */
export const SKILLS_TO_COPY = [];

/**
 * Spec da dependência git usada quando o consumidor ainda não tem
 * `dependencies['@sarak/lib-ui-core']` gravado (1ª instalação). Quando já existe
 * (`init` rodando sobre um projeto que já instalou a lib), `runInit.mjs` reusa o
 * spec REAL do consumidor em vez deste default — o `sarak:update` deve furar o
 * pin do MESMO repositório que foi instalado, nunca assumir um alheio (Spec 39 §2.1).
 */
export const DEFAULT_LIB_GIT_SPEC = 'github:Lib-Sarak/Sarak-Lib-UI-Core';
