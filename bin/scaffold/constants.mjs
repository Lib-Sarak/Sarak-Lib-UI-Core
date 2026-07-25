/**
 * Constantes do scaffolder (Spec 21; simplificado pela Spec 45 — starter padrão
 * módulos-plugin, sem backend). `typescript` fica travado em ^5 (achado real de
 * instalação com toolchains mais novas).
 */
export const DEFAULT_FRONTEND_PORT = 5173;

export const MODES = ['app', 'embedded'];

export const DEFAULT_MODE = 'app';

export const TYPESCRIPT_VERSION_RANGE = '^5.4.0';

/**
 * Starter padrão (Spec 45): um front Vite puro — Provider + Shell + Design
 * Engine + módulo de exemplo registrado. Sem backend: persistência de tema é
 * localStorage (já embutido no `SarakUIProvider`); sem servidor Express/Next
 * para gerar. Substitui os antigos `GOLDEN_PATH_*`/`NEXT_*`/`FRONTEND_ONLY_*`
 * (3 stacks divergentes, cada uma com seu próprio backend) — a Spec 44 (Design
 * Engine sem backend) e a decisão de "importar e o front nascer no padrão"
 * eliminaram a necessidade de escolher stack de servidor no `init`.
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
 * Skills que o `init` copia para o consumidor. Vazio desde a Spec 46 (removeu o
 * motor de manifesto e as 2 skills que o acompanhavam — `ui-integra-escrever-manifesto`/
 * `ui-auditoria-manifesto`); o modelo oficial (módulos-plugin) não tem skill de
 * consumo própria a copiar. Mantido como mecanismo para uma futura skill do gênero.
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
